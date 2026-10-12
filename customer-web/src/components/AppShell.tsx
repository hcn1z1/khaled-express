'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import LiveShuttleTicker from '@/components/LiveShuttleTicker';
import AuthModal from '@/components/AuthModal';
import NewTransferModal from '@/components/NewTransferModal';
import ErrorBoundary from '@/components/ErrorBoundary';
import BrandLogo from '@/components/BrandLogo';
import { translations } from '@/lib/i18n';
import { useSite } from '@/lib/site-context';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { lang } = useSite();
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col">
      {/* Skip to Main Content Link for Keyboard Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-brand-600 text-white rounded-xl shadow-2xl font-bold focus:outline-none focus:ring-2 focus:ring-white"
      >
        {lang === 'ar' ? 'الانتقال إلى المحتوى الرئيسي' : 'Passer au contenu principal'}
      </a>

      <ErrorBoundary fallbackTitle="Erreur dans la barre de navigation">
        <Navbar />
      </ErrorBoundary>

      <ErrorBoundary fallbackTitle="Erreur dans les alertes navettes">
        <LiveShuttleTicker />
      </ErrorBoundary>

      <main id="main-content" className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-800 bg-black mt-4">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-start">
            <div>
              <BrandLogo variant="compact" size="md" />
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">{t.footer_desc}</p>
            </div>
            <div className="text-xs text-slate-400 space-y-2">
              <span className="block font-bold text-slate-200 uppercase tracking-wider mb-1">
                {t.footer_agencies}
              </span>
              <p>Alger Centre — {t.office_alg_phone}</p>
              <p>El Eulma (Sétif) — {t.office_eul_phone}</p>
            </div>
            <div className="text-xs text-slate-400 sm:text-end flex flex-col sm:items-end justify-center gap-2">
              <span>
                &copy; {new Date().getFullYear()} Khaled Express. {t.footer_rights}
              </span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t.footer_system_ok}
              </span>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-dark-900 text-center sm:text-start">
            <Link href="/" className="text-[11px] text-slate-500 hover:text-brand-400 transition-colors">
              khaled-express.dz — {t.brand_tagline}
            </Link>
          </div>
        </div>
      </footer>

      {/* Global modals, driven by SiteProvider */}
      <AuthModal />
      <NewTransferModal />
    </div>
  );
}
