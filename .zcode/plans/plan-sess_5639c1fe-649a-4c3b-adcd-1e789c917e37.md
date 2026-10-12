# UI/UX Overhaul Plan — Khaled Express (customer-web + staff-desktop)

Theme stays **black / white / dark-red** as established. No backend changes — everything is client-side using existing APIs. Keeps all current functionality.

## Problems found (complete inventory)

**Customer-web:** no mobile navigation at all ("Mes Expéditions"/"Nos Agences" unreachable on phones) · SPA tab state = no URLs, no back button, refresh loses your place · print buttons print the whole dark page (no `printable-area` print CSS) · raw status enums shown to users (`RECEIVED_AT_DESTINATION` in dashboard badges) · many hardcoded French strings render in Arabic mode · dev quick-test codes shown to real users · stepper has no connecting progress line · no loading skeletons, no recent searches · forms lack autofocus, phone-format hints, Escape/backdrop close.

**Staff-desktop:** `FinanceScreen` violates React hooks rules (all `useState` calls sit *after* the `if (!isAdmin) return` early-return — latent crash) · no day-overview for operators · status labels hardcoded French in 4+ places, raw enums in AI modal and SMS outbox · modals lack Escape/focus-trap · no result counts or skeletons · no keyboard shortcuts surfaced for scan modes.

**Both:** no shared UI primitives — buttons/inputs/badges/modals hand-rolled per file with drifted classes; status→color mapping duplicated and inconsistent; system font only (no Arabic-optimized font).

## Phase 1 — Foundations (both apps)

1. **Typography**: `Inter` (Latin) + `Tajawal` (Arabic) via `next/font` in customer-web (self-hosted, automatic) and bundled `@fontsource` files in staff-desktop (Tauri needs offline fonts). CSS applies Tajawal automatically when `dir=rtl`.
2. **UI primitives** in `src/components/ui/` (one set per app, ~8 small files): `Button` (primary/secondary/ghost/danger + sizes), `Field` (label + icon + input + hint/error), `StatusBadge` (single source of truth: status → {color, icon, translated label}), `Card`, `Modal` (Escape close, backdrop click, focus trap, body scroll lock), `EmptyState`, `SkeletonRows`. Replace hand-rolled equivalents in every screen.
3. **Status maps consolidated**: one `statusMeta` map per app (uses existing + new i18n keys). Kills raw enums everywhere (dashboard, AI modal, SMS outbox).
4. **i18n completion**: add missing keys for every hardcoded string (both FR + AR); sweep all components to use `t.*`. Staff i18n gains `status_*` keys.

## Phase 2 — Customer web UX

1. **Real routes** (App Router): `/` landing · `/agences` · `/mes-expeditions` (client-side auth guard → opens login modal if logged out) · `/suivi/[code]` tracking with deep-linkable codes. Navbar becomes Links + `usePathname`; per-page metadata; `CustomerDashboard`/`TrackingSection` receive code via route params.
2. **Mobile nav**: hamburger button (visible < md) → slide-over drawer with nav links, language switch, auth actions/profile; focus-trapped, closes on route change.
3. **Landing**: add "Comment ça marche" section — 4 numbered steps (Demande en ligne → Dépôt & pesée → Navette A2 → SMS & retrait) with connecting timeline; bilingual.
4. **Tracking**: stepper gets a connecting progress line (horizontal desktop, vertical timeline on mobile) · input auto-trim/uppercase · last 5 tracked codes saved in localStorage shown as chips (dev quick-test codes only when `NODE_ENV=development`) · nicer not-found empty state.
5. **Dashboard**: 4 status summary cards with counts, newest-first sort, skeleton loading, translated statuses.
6. **Print fix**: port the `printable-area` print CSS from staff-desktop into customer `globals.css`; wrap the receipt card in `TrackingSection` and `NewTransferModal` success screen so print outputs only the white receipt.
7. **Forms (AuthModal, NewTransferModal)**: rebuilt on primitives — autofocus first field, client-side Algerian phone hint (`^0[5-7]\d{8}$`), submit spinner, Escape/backdrop close.

## Phase 3 — Staff desktop UX

1. **Hooks bug fix** (`FinanceScreen.tsx`): move the moderator 403 guard into a wrapper component so all hooks are called unconditionally before any return.
2. **New "Aujourd'hui" overview tab** (first in sidebar, default landing): KPI cards from already-loaded data — parcels by status today, awaiting-deposit count, unpaid count; for admin, today's encaissements from the finance summary API. Plus a compact "file du jour" list.
3. **ScanStation**: wire keys 1–4 to switch scan mode and F2 to focus input (F2 already wired); show shortcut hints in the UI (kbd chips on mode cards).
4. **ParcelList**: result count chip, skeleton rows while loading, translated status badges via shared `statusMeta`, CSV export button (client-side from loaded rows).
5. **Modals** (Intake, PrintBon, AI): use the new `Modal` primitive — Escape close, focus trap; PrintBonModal's 3 document templates stay as-is (already excellent); AI modal shows translated statuses in matched parcels.
6. **SmsOutbox**: move idempotency key into a tooltip/details row (noise reduction), translated status badge.

## Phase 4 — Verification

`next build` + `vite build` clean, then browser pass with screenshots: landing FR + AR (RTL incl. drawer), tracking flow with a test code (deep link), dashboard, mobile viewport; staff: 3 role logins, overview tab, scanner, parcels, finance (admin vs moderator 403), print preview, AI modal, SMS outbox. Fixes applied for anything visually broken before delivery.

**Files touched:** ~20 existing components + ~10 new files (ui primitives, 4 route pages, overview screen). Estimated meaningful diff per file, no backend/API changes.