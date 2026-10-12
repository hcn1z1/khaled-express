'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Clock, MapPin, ArrowRight, ArrowLeft, ShieldCheck, Sparkles, Navigation } from 'lucide-react';
import { useSite } from '@/lib/site-context';

type Direction = 'alg_to_eul' | 'eul_to_alg';

export default function InteractiveRouteVisualizer() {
  const { lang, openTransfer } = useSite();
  const isAr = lang === 'ar';
  const [direction, setDirection] = useState<Direction>('alg_to_eul');
  const [activeStation, setActiveStation] = useState<number | null>(null);

  const isAlgToEul = direction === 'alg_to_eul';
  const startsAtLeft = isAlgToEul !== isAr;

  const stations = isAlgToEul
    ? [
        {
          name: isAr ? 'الجزائر العاصمة' : 'Alger Centre',
          detail: isAr ? 'وكالة ديدوش مراد (نقطة الانطلاق)' : '04 Rue Didouche Mourad (Hub Départ)',
          km: '0 km',
          time: '14:00',
          badge: isAr ? 'نقطة الانطلاق' : 'Départ',
          progress: 5,
        },
        {
          name: isAr ? 'البويرة' : 'Bouira',
          detail: isAr ? 'ممر الطريق السيار شرق-غرب A2' : 'Couloir Autoroute A2 (Transit rapide)',
          km: '120 km',
          time: '~15:15',
          badge: isAr ? 'نقطة عبور' : 'Transit',
          progress: 40,
        },
        {
          name: isAr ? 'برج بوعريريج' : 'Bordj Bou Arreridj',
          detail: isAr ? 'محور الهضاب العليا' : 'Axe Hauts-Plateaux (Contrôle garde)',
          km: '220 km',
          time: '~16:30',
          badge: isAr ? 'نقطة عبور' : 'Transit',
          progress: 70,
        },
        {
          name: isAr ? 'العلمة (سطيف)' : 'El Eulma (Sétif)',
          detail: isAr ? 'شارع الجمهورية - سوق دبي التجاري' : 'Bd de la République - Zone Dubaï (Arrivée)',
          km: '300 km',
          time: '17:30',
          badge: isAr ? 'نقطة الوصول' : 'Arrivée',
          progress: 95,
        },
      ]
    : [
        {
          name: isAr ? 'العلمة (سطيف)' : 'El Eulma (Sétif)',
          detail: isAr ? 'شارع الجمهورية - سوق دبي التجاري (الانطلاق)' : 'Zone Commerciale Dubaï (Hub Départ)',
          km: '0 km',
          time: '14:00',
          badge: isAr ? 'نقطة الانطلاق' : 'Départ',
          progress: 5,
        },
        {
          name: isAr ? 'برج بوعريريج' : 'Bordj Bou Arreridj',
          detail: isAr ? 'محور الهضاب العليا' : 'Axe Hauts-Plateaux (Transit rapide)',
          km: '80 km',
          time: '~15:00',
          badge: isAr ? 'نقطة عبور' : 'Transit',
          progress: 30,
        },
        {
          name: isAr ? 'البويرة' : 'Bouira',
          detail: isAr ? 'ممر الطريق السيار شرق-غرب A2' : 'Couloir Autoroute A2 (Contrôle)',
          km: '180 km',
          time: '~16:15',
          badge: isAr ? 'نقطة عبور' : 'Transit',
          progress: 65,
        },
        {
          name: isAr ? 'الجزائر العاصمة' : 'Alger Centre',
          detail: isAr ? 'وكالة ديدوش مراد (نقطة الوصول)' : '04 Rue Didouche Mourad (Arrivée)',
          km: '300 km',
          time: '17:30',
          badge: isAr ? 'نقطة الوصول' : 'Arrivée',
          progress: 95,
        },
      ];

  return (
    <section aria-labelledby="route-visualizer-heading" className="py-14 sm:py-20 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-brand-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-950/60 border border-brand-800/60 text-brand-400 text-xs font-bold mb-3 shadow-glow-brand/20"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>{isAr ? 'مسار النقل المباشر A2' : 'Corridor Autoroutier Direct A2'}</span>
          </motion.div>

          <motion.h2
            id="route-visualizer-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-4xl font-black text-white tracking-tight"
          >
            {isAr
              ? 'تتبع حركة الشحن الحي بين الجزائر والعلمة'
              : "La Ligne Express Quotidienne en Temps Réel"}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto"
          >
            {isAr
              ? '300 كيلومتر عبر الطريق السيار شرق-غرب دون توقف عشوائي. شاحنات مجهزة ومسار مؤمن 7 أيام في الأسبوع.'
              : '300 kilomètres sur l’autoroute Est-Ouest sans escale intermédiaire inutile. Navettes dédiées et sécurisées 7j/7.'}
          </motion.p>
        </div>

        {/* Direction Switcher Tabs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex p-1.5 rounded-2xl bg-dark-850 border border-dark-750 shadow-card">
            <button
              type="button"
              onClick={() => setDirection('alg_to_eul')}
              className={`relative px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                isAlgToEul
                  ? 'bg-brand-600 text-white shadow-glow-brand'
                  : 'text-slate-400 hover:text-white hover:bg-dark-800'
              }`}
            >
              <Navigation className={`w-3.5 h-3.5 ${isAlgToEul ? 'rotate-45' : ''}`} />
              <span>{isAr ? 'الجزائر ➔ العلمة' : 'Alger ➔ El Eulma'}</span>
            </button>

            <button
              type="button"
              onClick={() => setDirection('eul_to_alg')}
              className={`relative px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                !isAlgToEul
                  ? 'bg-brand-600 text-white shadow-glow-brand'
                  : 'text-slate-400 hover:text-white hover:bg-dark-800'
              }`}
            >
              <Navigation className={`w-3.5 h-3.5 ${!isAlgToEul ? '-rotate-135' : ''}`} />
              <span>{isAr ? 'العلمة ➔ الجزائر' : 'El Eulma ➔ Alger'}</span>
            </button>
          </div>
        </motion.div>

        {/* Interactive Highway Showcase Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-dark-850/90 backdrop-blur-xl border border-dark-750 rounded-3xl p-6 sm:p-10 shadow-card relative overflow-hidden"
        >
          {/* Subtle highway grid backdrop */}
          <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Quick Highway Status Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-dark-750 mb-8 text-xs">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <span className="text-white font-bold">
                {isAr ? 'الطريق السيار A2 : حركة سلسة' : 'Autoroute A2 : Trafic Fluide'}
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-300">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-400" />
                <span>{isAr ? 'زمن العبور : ~ 3h30' : 'Temps moyen : ~ 3h30'}</span>
              </span>
              <span className="hidden sm:inline-block text-dark-600">•</span>
              <span className="hidden sm:flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'مراقبة بالباركود' : 'Suivi Code-barres'}</span>
              </span>
            </div>
          </div>

          {/* Animated Highway Corridor Line */}
          <div className="relative my-8 sm:my-12 px-2 sm:px-6">
            {/* The Road Strip */}
            <div className="h-6 sm:h-8 rounded-full bg-dark-950 border-2 border-dark-700 relative overflow-hidden flex items-center px-4 shadow-inner">
              {/* Road center dashes */}
              <div
                className="w-full h-0.5 border-b-2 border-dashed border-dark-600 animate-pulse"
                style={{ backgroundSize: '24px 2px' }}
              />

              {/* Progress active glow line */}
              <motion.div
                key={direction}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'linear',
                }}
                className={`absolute inset-y-0 pointer-events-none ${
                  startsAtLeft
                    ? 'left-0 bg-gradient-to-r from-brand-600/30 via-brand-500/50 to-emerald-500/50'
                    : 'right-0 bg-gradient-to-l from-brand-600/30 via-brand-500/50 to-emerald-500/50'
                }`}
              />

              {/* Animated Vehicle / Shuttle */}
              <motion.div
                key={`truck-${direction}`}
                initial={{ left: startsAtLeft ? '3%' : '94%' }}
                animate={{ left: startsAtLeft ? '94%' : '3%' }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 flex items-center justify-center"
              >
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-glow-brand ring-4 ring-brand-500/30">
                  <Truck className={`w-4 h-4 ${!startsAtLeft ? 'scale-x-[-1]' : ''}`} />
                </div>
              </motion.div>
            </div>

            {/* Checkpoint Nodes along the road */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 sm:mt-10">
              {stations.map((station, idx) => {
                const isSelected = activeStation === idx;
                const isFirst = idx === 0;
                const isLast = idx === stations.length - 1;

                return (
                  <motion.div
                    key={station.name}
                    whileHover={{ y: -4, scale: 1.02 }}
                    onClick={() => setActiveStation(isSelected ? null : idx)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-start relative group ${
                      isSelected
                        ? 'bg-dark-800 border-brand-500 shadow-glow-brand/30'
                        : isFirst || isLast
                        ? 'bg-dark-900/90 border-brand-600/30 hover:border-brand-500/60'
                        : 'bg-dark-900/60 border-dark-750 hover:border-dark-650'
                    }`}
                  >
                    {/* Badge top */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isFirst
                            ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                            : isLast
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-dark-800 text-slate-400'
                        }`}
                      >
                        {station.badge}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400 font-bold">{station.km}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                      {station.name}
                    </h4>

                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{station.detail}</p>

                    <div className="mt-3 pt-2.5 border-t border-dark-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-brand-400" />
                        {station.time}
                      </span>
                      <span className="text-brand-400 font-medium group-hover:underline">
                        {isAr ? 'تفاصيل' : 'Détails'}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Active Station Expanded Details */}
          <AnimatePresence>
            {activeStation !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-6 pt-6 border-t border-dark-750"
              >
                <div className="p-4 rounded-2xl bg-brand-950/40 border border-brand-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white">{stations[activeStation].name}</h5>
                      <p className="text-xs text-slate-300">{stations[activeStation].detail}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={openTransfer}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-glow-brand transition-all whitespace-nowrap active:scale-95"
                  >
                    {isAr ? 'إرسال طرد من هذا الخط' : 'Expédier sur cette ligne'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
