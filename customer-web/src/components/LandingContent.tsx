'use client';

import React from 'react';
import Image from 'next/image';
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
  ChevronRight,
  Package,
  Headphones,
  CheckCircle2,
} from 'lucide-react';
import TrackingSection from '@/components/TrackingSection';
import InteractiveRouteVisualizer from '@/components/InteractiveRouteVisualizer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { translations } from '@/lib/i18n';
import { useSite } from '@/lib/site-context';
import { Card } from '@/components/ui';

export default function LandingContent() {
  const { lang, openTransfer } = useSite();
  const t = translations[lang];
  const isAr = lang === 'ar';

  const trustPillars = [
    {
      icon: ShieldCheck,
      title: isAr ? 'طرود مؤمنة' : 'Colis sécurisés',
      desc: isAr ? 'كل شحنة مؤمنة ومتبعة بدقة' : 'Chaque envoi est assuré et suivi',
    },
    {
      icon: Clock,
      title: isAr ? 'مواعيد مضبوطة' : 'Délais respectés',
      desc: isAr ? 'رحلات يومية منتظمة وموثوقة' : 'Des départs réguliers et fiables',
    },
    {
      icon: Headphones,
      title: isAr ? 'خدمة زبائن متجاوبة' : 'Service client réactif',
      desc: isAr ? 'في خدمتكم 7 أيام / 7' : 'À votre écoute 7j/7',
    },
    {
      icon: Package,
      title: isAr ? 'جميع أنواع الطرود' : 'Tous types de colis',
      desc: isAr ? 'وثائق، بضائع، منصات تجارية...' : 'Documents, marchandises, palettes...',
    },
  ];

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
      accent: 'from-brand-500/20 to-brand-500/5 text-brand-400 border-brand-500/30',
    },
  ];

  const steps = [
    { title: t.how_step1_title, desc: t.how_step1_desc, icon: Package },
    { title: t.how_step2_title, desc: t.how_step2_desc, icon: ShieldCheck },
    { title: t.how_step3_title, desc: t.how_step3_desc, icon: Truck },
    { title: t.how_step4_title, desc: t.how_step4_desc, icon: Bell },
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
      {/* Hero Section: Two-Column Split Layout */}
      <section
        aria-label="Hero"
        className="relative overflow-hidden min-h-[calc(100vh-5rem)] flex flex-col justify-between pt-6 pb-6 sm:pt-8 sm:pb-8 lg:pt-10 lg:pb-8"
      >
        {/* Cinematic Highway Landscape Background combining seamlessly with the hero section */}
        <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden" aria-hidden="true">
          {/* Panoramic Highway Stock Image */}
          <Image
            src="/hero-highway-bg.jpg"
            alt="Corridor autoroutier Alger - El Eulma"
            fill
            priority
            sizes="100vw"
            className={`object-cover ${
              isAr
                ? 'object-left lg:object-[20%_center] -scale-x-105 scale-y-105'
                : 'object-right lg:object-[80%_center] scale-105'
            } opacity-40 transition-transform duration-1000`}
          />

          {/* Smooth horizontal gradient fade: pure dark behind text for legibility, revealing highway behind the van */}
          <div
            className={`absolute inset-0 bg-gradient-to-r ${
              isAr
                ? 'from-transparent via-dark-950/60 sm:via-dark-950/75 lg:via-dark-950/90 to-dark-950'
                : 'from-dark-950 via-dark-950/90 sm:via-dark-950/75 lg:via-dark-950/60 to-transparent'
            }`}
          />
          
          {/* Vertical vignettes for seamless transitions with header and trust pillars strip */}
          <div className="absolute inset-0 bg-gradient-to-b from-dark-950/90 via-transparent to-dark-950" />

          {/* Warm Champagne / Gold Radial Glow behind the van card */}
          <div className="absolute top-1/4 end-0 w-[620px] h-[520px] bg-gradient-to-br from-brand-500/20 via-brand-600/10 to-transparent rounded-full blur-[140px]" />
          {/* Subtle top-left brand aura */}
          <div className="absolute -top-24 -start-24 w-[480px] h-[480px] bg-brand-600/10 rounded-full blur-[130px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex-1 flex flex-col justify-between">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center my-auto py-4 sm:py-6">
            {/* Left Column: Headlines, Metrics & Quick Tracking Input */}
            <div className="lg:col-span-7 xl:col-span-7 text-start">
              {/* Eyebrow with gold van icon and horizontal rule */}
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3 mb-4 text-brand-400"
              >
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-brand-400 shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold tracking-wide italic">
                    {isAr ? 'طردكم، أولويتنا القصوى' : 'Votre colis, notre priorité'}
                  </span>
                </div>
                <div className="h-px w-16 bg-gradient-to-r from-brand-400/80 to-transparent" />
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.08 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-black tracking-tight leading-[1.1] text-white max-w-2xl"
              >
                {isAr ? (
                  <>
                    طرودكم بين{' '}
                    <span className="text-brand-400 font-extrabold whitespace-nowrap">الجزائر والعلمة</span>
                    <br />
                    بأمان وسرعة فائقة
                  </>
                ) : (
                  <>
                    Vos colis entre{' '}
                    <span className="text-brand-400 font-extrabold whitespace-nowrap">Alger & El Eulma</span>
                    <br />
                    en toute sérénité
                  </>
                )}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.16 }}
                className="mt-4 sm:mt-5 text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed"
              >
                {isAr
                  ? 'خدمة يومية منتظمة، تتبع مشفر بالباركود، إشعارات SMS مجانية عند الوصول واستلام فوري وآمن.'
                  : "Service régulier, traçabilité par code-barres Code 128, notifications SMS gratuites à l'arrivée et remise sécurisée."}
              </motion.p>

              {/* Seamlessly Integrated Tracking Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.32 }}
                className="mt-7 sm:mt-8"
              >
                <ErrorBoundary fallbackTitle="Erreur dans le suivi de colis">
                  <TrackingSection />
                </ErrorBoundary>
              </motion.div>
            </div>

            {/* Right Column: Van on a Box Showcase combining seamlessly with Highway Background */}
            <div className="lg:col-span-5 xl:col-span-5 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative z-10 flex flex-col items-center"
              >
                {/* Elevated Van Box with Champagne / Gold Rim Glow */}
                <div className="relative w-full rounded-3xl overflow-hidden border border-brand-500/40 bg-dark-900/80 shadow-[0_25px_70px_rgba(0,0,0,0.95)] shadow-glow-brand/25 group backdrop-blur-md">
                  {/* Outer Warm Ambient Bloom */}
                  <div className="absolute -inset-2 bg-gradient-to-tr from-brand-500/30 via-brand-400/15 to-transparent rounded-[2.5rem] blur-2xl -z-10 pointer-events-none" />

                  {/* Van Photo Container */}
                  <div className="hero-photo-overlay relative w-full aspect-[4/3] sm:aspect-[16/11]">
                    <Image
                      src="/hero-van-card.jpg"
                      alt="Fourgon express Mercedes-Benz Sprinter Khaled Express Alger - El Eulma"
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 550px"
                      className="object-cover object-center group-hover:scale-102 transition-transform duration-700"
                    />

                    {/* Subtle perimeter vignettes for clean box containment */}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950/85 via-transparent to-dark-950/30 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-r from-dark-950/20 via-transparent to-dark-950/30 pointer-events-none" />

                    {/* Khaled Express vehicle emblem badge overlay */}
                    <div className="hero-photo-badge absolute bottom-4 start-4 sm:bottom-5 sm:start-5 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-black/85 backdrop-blur-md border border-brand-500/35 text-white shadow-2xl">
                      <div className="w-8 h-8 rounded-lg bg-brand-500/15 border border-brand-500/30 flex items-center justify-center shrink-0">
                        <Truck className="w-4 h-4 text-brand-400" />
                      </div>
                      <div className="text-start leading-tight">
                        <span className="block font-black text-xs text-white tracking-wide">
                          KHALED <span className="text-brand-400">EXPRESS</span>
                        </span>
                        <span className="text-[10px] text-slate-300 font-mono tracking-wider">
                          ALGER ↔ EL EULMA
                        </span>
                      </div>
                    </div>

                    {/* Live Transit indicator pill top-right */}
                    <div className="absolute top-4 end-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-white shadow-lg text-[11px] font-semibold">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <span className="text-slate-200">
                        {isAr ? 'رحلات يومية منتظمة' : 'Navette active'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Trust Pillars Strip (4 pillars with dark circular gold icons) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-auto pt-6 sm:pt-8 pb-1 border-t border-dark-800/80"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trustPillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="flex items-center gap-3.5 group cursor-default"
                  >
                    <div className="w-12 h-12 rounded-full border border-brand-500/35 bg-dark-900/90 flex items-center justify-center text-brand-400 shrink-0 group-hover:border-brand-400 group-hover:bg-dark-850 group-hover:shadow-glow-brand/20 transition-all">
                      <Icon className="w-5 h-5 text-brand-400" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                        {pillar.title}
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                        {pillar.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Slogan Divider */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 text-[11px] sm:text-xs font-bold tracking-[0.25em] text-brand-400/90 uppercase text-center">
              <span>KHALED EXPRESS</span>
              <span className="text-brand-500/40">—</span>
              <span>PLUS PROCHE DE VOUS</span>
            </div>
          </motion.div>
        </div>
      </section>

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
            <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-400">
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
                whileHover={{ y: -6 }}
              >
                <Card
                  className="group p-6 sm:p-7 hover:border-brand-500/50 hover:bg-dark-850/95 duration-300 hover:shadow-glow-brand flex items-start gap-4 h-full relative overflow-hidden"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feat.accent} flex items-center justify-center shrink-0 ring-1 ring-white/10 group-hover:scale-110 transition-all duration-300 shadow-md`}
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
            <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-400">
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
              <div className="absolute inset-0 bg-gradient-to-r from-brand-600/40 via-dark-700 to-brand-500/40" />

              {/* Moving light beam that travels completely from Step 1 through Step 4 */}
              <motion.div
                initial={{ left: isAr ? '110%' : '-15%' }}
                animate={{ left: isAr ? '-15%' : '110%' }}
                transition={{
                  repeat: Infinity,
                  duration: 3.2,
                  ease: 'easeInOut',
                }}
                className="absolute inset-y-0 w-36 -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-400 to-brand-300 shadow-glow-brand"
              >
                {/* Glowing spark on the leading edge reaching Step 4 */}
                <span className="absolute end-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-brand-300 shadow-glow-brand" />
              </motion.div>
            </div>

            {steps.map((step, i) => (
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
                    whileHover={{ scale: 1.15, rotate: 4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    className="w-14 h-14 rounded-2xl bg-dark-850 border-2 border-brand-500/70 text-brand-400 shadow-glow-brand group-hover:border-brand-400 group-hover:bg-dark-800 flex items-center justify-center text-center leading-none text-xl font-black shrink-0 relative z-10 transition-all select-none"
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
            ))}
          </ol>
        </div>
      </section>

      {/* Agencies Showcase Section */}
      <section aria-labelledby="agencies-preview-heading" className="py-14 sm:py-20 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-400">
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
                className="bg-dark-850/80 p-6 sm:p-8 rounded-3xl border border-dark-750 relative overflow-hidden group hover:border-brand-500/50 hover:shadow-glow-brand/20 transition-all"
              >
                <div className="absolute top-0 end-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl group-hover:bg-brand-500/20 transition-all" />

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30 uppercase">
                    {office.badge}
                  </span>
                  <span className="text-xs font-mono text-slate-400">Code: {office.code}</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{office.name}</h3>

                <div className="space-y-3 mt-6 text-sm text-slate-300">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                    <span>{office.addr}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-brand-400 shrink-0" />
                    <a
                      href={`tel:${office.phone.replace(/\s+/g, '')}`}
                      className="font-mono font-semibold text-white hover:text-brand-400 transition-colors"
                      dir="ltr"
                    >
                      {office.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-brand-400 shrink-0" />
                    <span className="text-xs text-slate-300">{t.office_hours}</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-dark-750 flex items-center justify-between text-xs text-slate-400">
                  <span>{office.service}</span>
                  <span className="text-brand-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-brand-400" /> {t.office_guaranteed}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Animated Bottom CTA Banner */}
      <section className="pb-16 sm:pb-24 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-brand-950/50 via-dark-850 to-dark-850 border border-brand-500/30 relative overflow-hidden text-center sm:text-start flex flex-col sm:flex-row items-center justify-between gap-8 shadow-card"
          >
            <div className="absolute -top-24 -start-24 w-64 h-64 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

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
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={openTransfer}
                className="w-full sm:w-auto px-7 py-4 bg-brand-400 hover:bg-brand-300 text-dark-950 rounded-2xl font-black text-sm shadow-card flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Package className="w-4 h-4 text-dark-950" />
                <span>{isAr ? 'إنشاء طلب إرسال' : 'Créer un envoi en ligne'}</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={scrollToTracking}
                className="w-full sm:w-auto px-6 py-4 bg-dark-800 hover:bg-dark-750 text-slate-200 border border-dark-700 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span>{isAr ? 'تتبع طرد حالي' : 'Suivre un colis existant'}</span>
                <ChevronRight className="w-4 h-4 text-brand-400" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
