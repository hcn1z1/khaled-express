'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Clock } from 'lucide-react';
import { translations } from '@/lib/i18n';
import { useSite } from '@/lib/site-context';

export default function LiveShuttleTicker() {
  const { lang } = useSite();
  const t = translations[lang];
  const isAr = lang === 'ar';

  return (
    <aside
      aria-label={isAr ? 'حالة النقل والرحلات المباشرة' : 'État de la navette et du trafic'}
      className="bg-black border-y border-dark-800 py-2.5 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Highway live indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 font-bold text-[11px] shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
            </span>
            <span>{t.ticker_active}</span>
          </div>
          <span className="text-slate-300 font-medium text-[11px] sm:text-xs">{t.ticker_highway}</span>
        </div>

        {/* Live Shuttle Chips */}
        <div className="flex items-center gap-2.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <motion.div
            whileHover={{ scale: 1.04, y: -1 }}
            className="flex items-center gap-2 px-3 py-1 rounded-xl bg-dark-900 border border-dark-800 hover:border-brand-500/40 text-slate-200 shrink-0 font-mono text-[11px] transition-colors cursor-default"
          >
            <motion.div
              animate={{ x: [0, 2, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              <Truck className="w-3.5 h-3.5 text-brand-500" />
            </motion.div>
            <span>
              Alger ➔ El Eulma : <strong className="text-brand-300">{t.ticker_depart}</strong>
            </span>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.04, y: -1 }}
            className="flex items-center gap-2 px-3 py-1 rounded-xl bg-dark-900 border border-dark-800 hover:border-brand-500/40 text-slate-200 shrink-0 font-mono text-[11px] transition-colors cursor-default"
          >
            <motion.div
              animate={{ x: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            >
              <Truck className="w-3.5 h-3.5 text-brand-400" />
            </motion.div>
            <span>
              El Eulma ➔ Alger : <strong className="text-brand-300">{t.ticker_in_transit}</strong>
            </span>
          </motion.div>

          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] shrink-0">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.ticker_deadline}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
