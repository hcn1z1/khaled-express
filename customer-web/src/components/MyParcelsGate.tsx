'use client';

import React, { useEffect } from 'react';
import { Lock } from 'lucide-react';
import CustomerDashboard from '@/components/CustomerDashboard';
import { Button } from '@/components/ui';
import { translations } from '@/lib/i18n';
import { useSite } from '@/lib/site-context';

export default function MyParcelsPage() {
  const { lang, currentUser, isAuthOpen, openAuth } = useSite();
  const t = translations[lang];

  // Auto-open the login modal when an anonymous visitor lands here
  useEffect(() => {
    if (!currentUser && !isAuthOpen) {
      openAuth('login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="py-20 px-4 max-w-lg mx-auto text-center">
        <div className="w-14 h-14 rounded-2xl bg-dark-850 border border-dark-750 text-brand-400 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-white mb-1">{t.login_required_title}</h2>
        <p className="text-xs text-slate-400 mb-6">{t.login_required_desc}</p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => openAuth('login')}>{t.nav_login}</Button>
          <Button variant="secondary" onClick={() => openAuth('register')}>
            {t.nav_register}
          </Button>
        </div>
      </div>
    );
  }

  return <CustomerDashboard />;
}
