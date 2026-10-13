'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  ShieldCheck,
  Bell,
  Truck,
  ArrowRight,
  MapPin,
  Phone,
  Clock,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Package,
} from 'lucide-react';
import TrackingSection from '@/components/TrackingSection';
import InteractiveRouteVisualizer from '@/components/InteractiveRouteVisualizer';
import RateCalculator from '@/components/RateCalculator';
import ErrorBoundary from '@/components/ErrorBoundary';
import { translations } from '@/lib/i18n';
import { useSite } from '@/lib/site-context';
import { Card } from '@/components/ui';

export default function LandingContent() {
  const { lang, openTransfer } = useSite();
  const t = translations[lang];
  const isAr = lang === 'ar';

  const features = [
    {
      icon: Zap,
      title: t.feat_daily_title,
      desc: t.feat_daily_desc,
      accent: 'from-brand-500/20 to-brand-500/5 text-brand-400 border-brand-500/30',
    },
    {
      icon: ShieldCheck,
      title: t.feat_barcode_title,
      desc: t.feat_barcode_desc,
      accent: 'from-white/15 to-white/5 text-white border-white/20',
    },
    {
      icon: Bell,
      title: t.feat_sms_title,
      desc: t.feat_sms_desc,
      accent: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30',
    },
  ];

  const steps = [
    { title: t.how_step1_title, desc: t.how_step1_desc, icon: Package },
    { title: t.how_step2_title, desc: t.how_step2_desc, icon: ShieldCheck },
    { title: t.how_step3_title, desc: t.how_step3_desc, icon: Truck },
    { title: t.how_step4_title, desc: t.how_step4_desc, icon: Bell },
  ];

  const stats = [
    { value: '300 km', label: t.hero_stat_distance },
    { value: '7j/7', label: t.hero_stat_frequency },
    { value: 'SMS', label: t.hero_stat_sms },
    { value: 'DZD', label: t.hero_stat_pricing },
  ];

  const offices = [
    {
      badge: isAr ? 'ولاية 16 • الجزائر' : 'Wilaya 16 • Alger',
      code: 'ALGIERS',
      name: t.office_alg_name,
      addr: t.office_alg_addr,
      phone: t.office_alg_phone,
      service: t.office_deposit_service,
    },
    {
      badge: isAr ? 'ولاية 19 • سطيف' : 'Wilaya 19 • Sétif',
      code: 'EL_EULMA',
      name: t.office_eul_name,
      addr: t.office_eul_addr,
      phone: t.office_eul_phone,
      service: t.office_wholesale_service,
    },
  ];

  const scrollToTracking = () => {
    const el = document.getElementById('tracking-search-input');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
    }
  };

  return (
    <>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Ambient floating gradient mesh */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <motion.div
            animate={{
              y: [0, -25, 0],
              scale: [1, 1.08, 1],
              opacity: [0.15, 0.22, 0.15],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-brand-600/20 rounded-full blur-[130px]"
          />
          <motion.div
            animate={{
              x: [0, 20, 0],
              y: [0, 15, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-40 -start-40 w-96 h-96 bg-brand-800/20 rounded-full blur-[110px]"
          />
          <motion.div
            animate={{
              x: [0, -20, 0],
              y: [0, -15, 0],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-20 -end-40 w-96 h-96 bg-brand-500/15 rounded-full blur-[110px]"
          />

          {/* Animated Route arc SVG with flowing line and traveling pulse */}
          <svg
            className="absolute top-10 left-1/2 -translate-x-1/2 w-[1100px] max-w-none opacity-[0.28]"
            viewBox="0 0 1100 220"
            fill="none"
            aria-hidden="true"
          >
            {/* Pulsing route line */}
            <path
              d="M60 190 Q 550 -80 1040 190"
              stroke="url(#routeGrad)"
              strokeWidth="2.5"
              className="route-flow-line"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="routeGrad" x1="60" y1="190" x2="1040" y2="190" gradientUnits="userSpaceOnUse">
                <stop stopColor="#dc2626" />
                <stop offset="0.5" stopColor="#f87171" />
                <stop offset="1" stopColor="#10b981" />
              </linearGradient>
            </defs>

            {/* Traveling shuttle light particle */}
            <circle r="5" fill="#ef4444">
              <animateMotion
                path="M60 190 Q 550 -80 1040 190"
                dur="5.5s"
                repeatCount="indefinite"
              />
            </circle>
            <circle r="12" fill="#ef4444" opacity="0.35">
              <animateMotion
                path="M60 190 Q 550 -80 1040 190"
                dur="5.5s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Origin Node: Alger */}
            <circle cx="60" cy="190" r="6" fill="#dc2626" />
            <circle cx="60" cy="190" r="14" fill="#dc2626" opacity="0.25" className="animate-ping" />

            {/* Destination Node: El Eulma */}
            <circle cx="1040" cy="190" r="6" fill="#10b981" />
            <circle cx="1040" cy="190" r="14" fill="#10b981" opacity="0.25" className="animate-ping" />
          </svg>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 pt-20 pb-16 sm:pt-28 sm:pb-24">
          {/* Eyebrow Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-dark-850/90 backdrop-blur border border-dark-700 text-brand-300 text-xs font-bold mb-7 shadow-card cursor-default"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
            </span>
            <span>{t.hero_eyebrow}</span>
          </motion.div>

          {/* Hero Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.05] max-w-4xl mx-auto text-white"
          >
            {isAr ? (
              <>
                طرودكم بين <span className="text-gradient-shimmer">الجزائر والعلمة</span> بأمان وسرعة فائقة
              </>
            ) : (
              <>
                Vos colis entre <span className="text-gradient-shimmer">Alger & El Eulma</span> en toute sérénité
              </>
            )}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="mt-5 sm:mt-7 text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            {t.hero_subtitle}
          </motion.p>

          {/* Trust stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.value}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.35 + i * 0.08 }}
                whileHover={{ y: -4, scale: 1.05 }}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-dark-850/80 backdrop-blur border border-dark-750 hover:border-brand-500/40 hover:shadow-glow-brand/20 transition-all cursor-default"
              >
                <span className="font-black text-brand-400">{stat.value}</span>
                <span className="text-slate-300 font-medium">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Tracking Box */}
          <div className="mt-12 text-start">
            <ErrorBoundary fallbackTitle="Erreur dans le suivi de colis">
              <TrackingSection />
            </ErrorBoundary>
          </div>
        </div>
      </div>

      {/* Interactive Highway Route Corridor Showcase */}
      <ErrorBoundary fallbackTitle="Erreur dans le visualiseur de parcours">
        <InteractiveRouteVisualizer />
      </ErrorBoundary>

      {/* Features Section */}
      <section aria-labelledby="features-heading" className="py-14 sm:py-20 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-14"
          >
            <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-500">
              {t.features_eyebrow}
            </span>
            <h2 id="features-heading" className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
              {t.features_title}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((feat, idx) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                whileHover={{ y: -8 }}
              >
                <Card
                  className="group p-6 sm:p-7 hover:border-brand-500/50 hover:bg-dark-850/95 duration-300 hover:shadow-glow-brand flex items-start gap-4 h-full relative overflow-hidden"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feat.accent} flex items-center justify-center shrink-0 ring-1 ring-white/10 group-hover:scale-115 group-hover:rotate-6 transition-all duration-300 shadow-md`}
                  >
                    <feat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{feat.desc}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section aria-labelledby="how-heading" className="py-14 sm:py-20 bg-black/40 border-y border-dark-900 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-500">
              {t.how_eyebrow}
            </span>
            <h2 id="how-heading" className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
              {t.how_title}
            </h2>
          </motion.div>

          <ol className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Animated Connector line connecting step 1 center to step 4 center */}
            <div
              className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-1 bg-dark-800 rounded-full overflow-hidden"
              aria-hidden="true"
            >
              {/* Static gradient track connecting the steps */}
              <div className="absolute inset-0 bg-gradient-to-r from-brand-600/40 via-dark-700 to-emerald-500/40" />

              {/* Moving light beam that travels completely from Step 1 through Step 4 */}
              <motion.div
                initial={{ left: isAr ? '110%' : '-15%' }}
                animate={{ left: isAr ? '-15%' : '110%' }}
                transition={{
                  repeat: Infinity,
                  duration: 3.2,
                  ease: 'easeInOut',
                }}
                className="absolute inset-y-0 w-36 -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-400 to-emerald-400 shadow-glow-brand"
              >
                {/* Glowing spark on the leading edge reaching Step 4 */}
                <span className="absolute end-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-emerald-300 shadow-[0_0_12px_#10b981]" />
              </motion.div>
            </div>

            {steps.map((step, i) => {
              const StepIcon = step.icon;
              const isLastStep = i === 3;
              return (
                <motion.li
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="relative group"
                >
                  <div className="flex lg:flex-col items-start lg:items-center text-start lg:text-center gap-4">
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 6 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                      className={`w-14 h-14 rounded-2xl bg-dark-850 border-2 flex items-center justify-center text-center leading-none text-xl font-black shrink-0 relative z-10 transition-all select-none ${
                        isLastStep
                          ? 'border-emerald-500/80 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)] group-hover:border-emerald-400 group-hover:bg-dark-800'
                          : 'border-brand-600/70 text-brand-400 shadow-glow-brand group-hover:border-brand-500 group-hover:bg-dark-800'
                      }`}
                    >
                      <span>{i + 1}</span>
                    </motion.div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Interactive Rate Estimator */}
      <ErrorBoundary fallbackTitle="Erreur dans le simulateur de prix">
        <RateCalculator />
      </ErrorBoundary>

      {/* Agencies Showcase Section */}
      <section aria-labelledby="agencies-preview-heading" className="py-14 sm:py-20 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-500">
              {t.nav_rates}
            </span>
            <h2 id="agencies-preview-heading" className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
              {t.offices_title}
            </h2>
            <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">{t.offices_desc}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offices.map((office, idx) => (
              <motion.div
                key={office.code}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                whileHover={{ y: -6 }}
                className="bg-dark-850/80 p-6 sm:p-8 rounded-3xl border border-dark-750 relative overflow-hidden group hover:border-brand-600/50 hover:shadow-glow-brand/20 transition-all"
              >
                <div className="absolute top-0 end-0 w-32 h-32 bg-brand-600/10 rounded-full blur-2xl group-hover:bg-brand-600/25 transition-all" />

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
                    <a
                      href={`tel:${office.phone.replace(/\s+/g, '')}`}
                      className="font-mono font-semibold text-white hover:text-brand-400 transition-colors"
                      dir="ltr"
                    >
                      {office.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-brand-500 shrink-0" />
                    <span className="text-xs text-slate-300">{t.office_hours}</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-dark-750 flex items-center justify-between text-xs text-slate-400">
                  <span>{office.service}</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> {t.office_guaranteed}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* High-Converting Animated Bottom CTA Banner */}
      <section className="pb-16 sm:pb-24 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-brand-950/60 via-dark-850 to-dark-850 border border-brand-800/40 relative overflow-hidden text-center sm:text-start flex flex-col sm:flex-row items-center justify-between gap-8 shadow-card"
          >
            <div className="absolute -top-24 -start-24 w-64 h-64 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAr ? 'خدمة يومية مضمونة' : 'Service Express Quotidien'}</span>
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {isAr
                  ? 'جاهز لإرسال طردك بين الجزائر والعلمة اليوم ؟'
                  : 'Prêt à expédier votre colis dès aujourd’hui ?'}
              </h3>
              <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                {isAr
                  ? 'أنشئ طلبك في دقيقتين عبر الإنترنت أو توجه مباشرة إلى أحد مكاتبنا لاستلام وصل التتبع الفوري.'
                  : 'Créez votre demande en ligne en 2 minutes ou présentez-vous à nos guichets pour un récépissé immédiat.'}
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openTransfer}
                className="w-full sm:w-auto px-7 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-bold text-sm shadow-glow-brand flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Package className="w-4 h-4" />
                <span>{isAr ? 'إنشاء طلب إرسال' : 'Créer un envoi en ligne'}</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToTracking}
                className="w-full sm:w-auto px-6 py-4 bg-dark-800 hover:bg-dark-750 text-slate-200 border border-dark-700 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span>{isAr ? 'تتبع طرد حالي' : 'Suivre un colis existant'}</span>
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
