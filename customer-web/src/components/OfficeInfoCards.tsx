'use client';

import React from 'react';
import { MapPin, Phone, Clock, ShieldCheck, ArrowLeftRight } from 'lucide-react';
import { translations } from '@/lib/i18n';
import { useSite } from '@/lib/site-context';

export default function OfficeInfoCards() {
  const { lang } = useSite();
  const t = translations[lang];

  const offices = [
    {
      badge: 'Wilaya 16 • Alger',
      code: 'ALGIERS',
      name: t.office_alg_name,
      addr: t.office_alg_addr,
      phone: t.office_alg_phone,
      service: t.office_deposit_service,
    },
    {
      badge: 'Wilaya 19 • Sétif',
      code: 'EL_EULMA',
      name: t.office_eul_name,
      addr: t.office_eul_addr,
      phone: t.office_eul_phone,
      service: t.office_wholesale_service,
    },
  ];

  return (
    <section aria-labelledby="offices-section-title" className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-500">
          {t.nav_rates}
        </span>
        <h2 id="offices-section-title" className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
          {t.offices_title}
        </h2>
        <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">{t.offices_desc}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {offices.map((office) => (
          <div
            key={office.code}
            className="bg-dark-850/70 p-6 sm:p-8 rounded-3xl border border-dark-750 relative overflow-hidden group hover:border-brand-600/50 transition-colors"
          >
            <div className="absolute top-0 end-0 w-32 h-32 bg-brand-600/10 rounded-full blur-2xl group-hover:bg-brand-600/20 transition-all" />

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30 uppercase">
                {office.badge}
              </span>
              <span className="text-xs font-mono text-slate-400">Code: {office.code}</span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{office.name}</h3>

            <div className="space-y-3 mt-6 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                <span>{office.addr}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-500 shrink-0" />
                <span className="font-mono font-semibold text-white" dir="ltr">
                  {office.phone}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-brand-500 shrink-0" />
                <span className="text-xs text-slate-300">{t.office_hours}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-dark-750 flex items-center justify-between text-xs text-slate-400">
              <span>{office.service}</span>
              <span className="text-brand-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-brand-400" /> {t.office_guaranteed}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Shuttle schedule banner */}
      <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-dark-800 to-dark-850 border border-dark-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-600/15 text-brand-400 flex items-center justify-center shrink-0">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{t.shuttle_title}</h3>
            <p className="text-xs text-slate-300">{t.shuttle_desc}</p>
          </div>
        </div>
        <div className="text-xs text-brand-300 bg-brand-950/60 px-4 py-2 rounded-xl border border-brand-800/60 font-bold whitespace-nowrap">
          {t.shuttle_pricing_badge}
        </div>
      </div>
    </section>
  );
}
