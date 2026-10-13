'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Truck, LogOut, Globe, PlusCircle, Menu, X, Package, Home, MapPin } from 'lucide-react';
import { translations } from '@/lib/i18n';
import { useSite } from '@/lib/site-context';
import BrandLogo from '@/components/BrandLogo';

export default function Navbar() {
  const { lang, setLang, currentUser, logout, openAuth, openTransfer } = useSite();
  const t = translations[lang];
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close the drawer whenever the route changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (!drawerOpen) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [drawerOpen]);

  const links = [
    { href: '/', label: t.nav_home, icon: Home },
    { href: '/agences', label: t.nav_rates, icon: MapPin },
    ...(currentUser
      ? [{ href: '/mes-expeditions', label: t.nav_my_parcels, icon: Package }]
      : []),
  ];

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const linkCls = (href: string) =>
    `px-5 py-2 rounded-full text-xs font-bold transition-all ${
      isActive(href)
        ? 'bg-brand-400 text-dark-950 shadow-card font-black'
        : 'text-slate-300 hover:text-white hover:bg-dark-800/80 font-medium'
    }`;

  return (
    <>
      <header className="sticky top-0 z-40 bg-dark-950/90 backdrop-blur-xl border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link
            href="/"
            className="group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded-2xl"
          >
            <BrandLogo variant="full" size="md" />
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Navigation principale" className="hidden md:flex items-center gap-1.5 bg-dark-900/90 p-1.5 rounded-full border border-dark-750">
            {links.map((l) => (
              <Link key={l.href} href={l.href} aria-current={isActive(l.href) ? 'page' : undefined} className={linkCls(l.href)}>
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openTransfer}
              aria-label={t.request_transfer_btn}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-brand-400/50 hover:border-brand-400 bg-brand-400/5 hover:bg-brand-400/15 text-brand-300 font-bold text-xs transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 shadow-sm"
            >
              <Package className="w-4 h-4 text-brand-400" />
              <span className="hidden lg:inline">{t.request_transfer_btn}</span>
              <span className="lg:hidden">+ {lang === 'ar' ? 'إرسال' : 'Envoi'}</span>
            </button>

            {/* Language */}
            <button
              type="button"
              onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
              aria-label="Changer de langue"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-900 hover:bg-dark-850 border border-dark-750 text-slate-300 hover:text-white text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              <Globe className="w-3.5 h-3.5 text-brand-400" />
              <span>{lang === 'fr' ? 'FR' : 'العربية'}</span>
            </button>

            {/* User */}
            {currentUser ? (
              <div className="hidden md:flex items-center gap-2 ps-2 border-s border-dark-800">
                <Link
                  href="/mes-expeditions"
                  className="flex items-center gap-2 bg-dark-900/80 hover:bg-dark-850 py-1.5 px-3 rounded-full border border-dark-750 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                >
                  <div className="w-6 h-6 rounded-full bg-brand-400/20 text-brand-300 flex items-center justify-center font-bold text-xs">
                    {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-start hidden lg:block">
                    <div className="text-xs font-semibold text-white truncate max-w-[120px]">
                      {currentUser.full_name || currentUser.phone_number}
                    </div>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  aria-label={t.nav_logout}
                  className="p-2 rounded-full hover:bg-dark-900 text-slate-400 hover:text-red-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2 ps-1">
                <button
                  type="button"
                  onClick={() => openAuth('login')}
                  className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-dark-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                >
                  {t.nav_login}
                </button>
                <button
                  type="button"
                  onClick={() => openAuth('register')}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-dark-900 hover:bg-dark-850 border border-dark-750 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                >
                  {t.nav_register}
                </button>
              </div>
            )}

            {/* Hamburger (mobile) */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label={t.nav_menu}
              aria-expanded={drawerOpen}
              className="md:hidden p-2.5 rounded-xl bg-dark-900 border border-dark-800 text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label={t.nav_menu}>
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute top-0 end-0 h-full w-[300px] max-w-[85vw] bg-dark-950 border-s border-dark-800 shadow-2xl flex flex-col animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between p-5 border-b border-dark-800">
              <BrandLogo variant="compact" size="sm" showSubtitle={false} />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label={t.nav_close}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-dark-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-colors ${
                    isActive(l.href)
                      ? 'bg-brand-600 text-white shadow-glow-brand'
                      : 'text-slate-300 hover:text-white hover:bg-dark-900'
                  }`}
                >
                  <l.icon className="w-4 h-4" />
                  {l.label}
                </Link>
              ))}

              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  openTransfer();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold bg-brand-600 text-white shadow-glow-brand mt-4"
              >
                <PlusCircle className="w-4 h-4" />
                {t.request_transfer_btn}
              </button>
            </nav>

            <div className="p-4 border-t border-dark-800 space-y-3">
              <button
                type="button"
                onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-dark-900 border border-dark-800 text-xs font-bold text-slate-200"
              >
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-brand-400" />
                  {lang === 'fr' ? 'العربية' : 'Français'}
                </span>
                <span className="text-[10px] text-slate-500 uppercase">{lang === 'fr' ? 'AR' : 'FR'}</span>
              </button>

              {currentUser ? (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-dark-900 border border-dark-800">
                  <div className="w-8 h-8 rounded-full bg-brand-600/20 text-brand-400 flex items-center justify-center font-bold text-xs shrink-0">
                    {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {currentUser.full_name || currentUser.phone_number}
                    </div>
                    <div className="text-[10px] text-slate-400">{currentUser.phone_number}</div>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    aria-label={t.nav_logout}
                    className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-dark-850"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      openAuth('login');
                    }}
                    className="py-2.5 rounded-xl bg-dark-900 border border-dark-800 text-xs font-bold text-white"
                  >
                    {t.nav_login}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      openAuth('register');
                    }}
                    className="py-2.5 rounded-xl bg-brand-600 text-xs font-bold text-white"
                  >
                    {t.nav_register}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
