'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Check, ArrowRight, ShieldCheck, Bell, Sparkles, FileText, Package, Box, Layers } from 'lucide-react';
import { useSite } from '@/lib/site-context';

export default function RateCalculator() {
  const { lang, openTransfer } = useSite();
  const isAr = lang === 'ar';

  const packageTypes = [
    {
      id: 'doc',
      icon: FileText,
      name: isAr ? 'وثائق وملفات' : 'Dossier / Pli',
      weightRange: isAr ? 'أقل من 0.5 كغ' : '< 0.5 kg',
      basePrice: '400',
      estimateText: isAr ? '400 د.ج' : '400 DZD',
      desc: isAr ? 'أوراق رسمية، جوازات، فواتير ومستندات' : 'Documents administratifs, factures, passeports',
    },
    {
      id: 'standard',
      icon: Package,
      name: isAr ? 'طرد عادي' : 'Colis Standard',
      weightRange: isAr ? '1 إلى 5 كغ' : '1 à 5 kg',
      basePrice: '600',
      estimateText: isAr ? '600 د.ج' : '600 DZD',
      desc: isAr ? 'ملابس، أحذية، علب صغيرة وقطع إلكترونية' : 'Vêtements, chaussures, accessoires, pièces',
    },
    {
      id: 'box',
      icon: Box,
      name: isAr ? 'صندوق كبير' : 'Grand Carton',
      weightRange: isAr ? '5 إلى 15 كغ' : '5 à 15 kg',
      basePrice: '1 000',
      estimateText: isAr ? '1 000 DZD' : '1 000 DZD',
      desc: isAr ? 'أجهزة كهرومنزلية، قطع غيار ومشتريات' : 'Électroménager, outillage, pièces détachées',
    },
    {
      id: 'bulk',
      icon: Layers,
      name: isAr ? 'تجارة الجملة' : 'Gros / Commerce',
      weightRange: isAr ? 'أكثر من 15 كغ' : '> 15 kg',
      basePrice: 'Sur devis',
      estimateText: isAr ? 'تعريفة مخفضة' : 'Tarif dégressif',
      desc: isAr ? 'بضائع سوق دبي بالعلمة وأصحاب المحلات' : 'Achats grossistes Dubaï El Eulma & commerçants',
    },
  ];

  const [selectedType, setSelectedType] = useState(packageTypes[1].id);
  const currentPkg = packageTypes.find((p) => p.id === selectedType) || packageTypes[1];

  return (
    <section aria-labelledby="rate-calculator-heading" className="py-14 sm:py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-950/60 border border-brand-800/60 text-brand-400 text-xs font-bold mb-3 shadow-glow-brand/20"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{isAr ? 'حاسبة التكلفة التقديرية' : 'Estimation Rapide & Transparente'}</span>
          </motion.div>

          <motion.h2
            id="rate-calculator-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-4xl font-black text-white tracking-tight"
          >
            {isAr ? 'احسب تكلفة إرسال طردك في ثوانٍ' : 'Simulez le Tarif de votre Envoi'}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto"
          >
            {isAr
              ? 'أسعار واضحة ومحددة. الدفع والوزن النهائي عند تسليم الطرد لوكالة الانطلاق.'
              : 'Tarifs transparents fixés au dépôt. Pas de frais cachés, inclus SMS et traçabilité.'}
          </motion.p>
        </div>

        {/* Interactive Calculator Container */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-dark-850/90 backdrop-blur-xl border border-dark-750 rounded-3xl p-6 sm:p-10 shadow-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          {/* Package Selector options (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              {isAr ? 'اختر نوع وحجم الطرد :' : 'Sélectionnez le format de votre colis :'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {packageTypes.map((pkg) => {
                const isSelected = pkg.id === selectedType;
                const IconComponent = pkg.icon;

                return (
                  <motion.button
                    key={pkg.id}
                    type="button"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType(pkg.id)}
                    className={`p-4 rounded-2xl border text-start transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-brand-950/40 border-brand-500 shadow-glow-brand/30'
                        : 'bg-dark-900/80 border-dark-750 hover:border-dark-650'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-brand-600 text-white shadow-glow-brand' : 'bg-dark-800 text-slate-400'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="font-mono text-xs font-bold text-brand-400">{pkg.weightRange}</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white mb-0.5">{pkg.name}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{pkg.desc}</p>
                    </div>

                    {isSelected && (
                      <motion.div
                        layoutId="active-pkg-pill"
                        className="absolute inset-0 border-2 border-brand-500 rounded-2xl pointer-events-none"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Pricing Estimation Card (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-dark-900 via-dark-850 to-brand-950/30 border border-dark-700 p-6 sm:p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 end-0 w-36 h-36 bg-brand-600/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-4 pb-3 border-b border-dark-750">
                <span>{isAr ? 'الوجهة' : 'Liaison directe'}</span>
                <span className="font-bold text-white">Alger ↔ El Eulma</span>
              </div>

              <div className="mb-6">
                <span className="text-xs text-slate-400 block mb-1">
                  {isAr ? 'التسعيرة التقديرية للطلب' : 'Tarif indicatif estimé'}
                </span>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPkg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-baseline gap-2"
                  >
                    <span className="text-3xl sm:text-4xl font-mono font-black text-white">
                      {currentPkg.estimateText}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      {isAr ? '/ للطرد' : '/ colis'}
                    </span>
                  </motion.div>
                </AnimatePresence>
                <p className="text-xs text-slate-400 mt-1.5">
                  {isAr
                    ? 'يتم تأكيد السعر النهائي بالوزن الدقيق عند مكتب الانطلاق'
                    : 'Pesée et fixation finale lors du dépôt au guichet'}
                </p>
              </div>

              {/* Inclusions list */}
              <div className="space-y-2 mb-6 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>{isAr ? 'تتبع بالباركود Code 128' : 'Traçabilité Code-barres Code 128'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>{isAr ? 'رسالة SMS مجانية فور الوصول' : 'Notification SMS gratuite au destinataire'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>{isAr ? 'حفظ مؤمن في مكتب الاستلام' : 'Garde sécurisée 48h au guichet'}</span>
                </div>
              </div>
            </div>

            {/* Action button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openTransfer}
              className="w-full py-3.5 px-6 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-bold text-sm shadow-glow-brand flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>{isAr ? 'طلب هذا الإرسال الآن' : 'Créer cet envoi en ligne'}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
