'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, MapPin, CheckCircle2, Clock, Truck, Copy, Check, Printer, AlertCircle, History } from 'lucide-react';
import { translations } from '@/lib/i18n';
import { publicTrackParcel } from '@/lib/api';
import { Parcel, ScanEvent } from '@/types';
import { useSite } from '@/lib/site-context';
import { EmptyState } from '@/components/ui';

const RECENT_KEY = 'kx_recent_tracking';

export default function TrackingSection({ initialCode = '' }: { initialCode?: string }) {
  const { lang } = useSite();
  const t = translations[lang];
  const isAr = lang === 'ar';
  const router = useRouter();

  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'));
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  // Deep link: /suivi/KX-... auto-searches once on mount
  const initialRef = React.useRef(false);
  useEffect(() => {
    if (initialCode && !initialRef.current) {
      initialRef.current = true;
      handleSearch(initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  const rememberCode = (tracked: string) => {
    const next = [tracked, ...recent.filter((c) => c !== tracked)].slice(0, 5);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  };

  const handleSearch = async (searchCode?: string) => {
    const codeToSearch = (searchCode || code).trim().toUpperCase();
    if (!codeToSearch) return;

    setLoading(true);
    setError(null);
    try {
      const data = await publicTrackParcel(codeToSearch);
      setParcel(data);
      rememberCode(codeToSearch);
      router.replace(`/suivi/${encodeURIComponent(codeToSearch)}`, { scroll: false });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.track_notfound_desc);
      setParcel(null);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    { key: 'REQUESTED', label: t.status_requested, icon: Clock },
    { key: 'RECEIVED_AT_ORIGIN', label: t.status_received_origin, icon: Package },
    { key: 'DISPATCHED', label: t.status_dispatched, icon: Truck },
    { key: 'RECEIVED_AT_DESTINATION', label: t.status_received_dest, icon: MapPin },
    { key: 'DELIVERED', label: t.status_delivered, icon: CheckCircle2 },
  ];

  const stepIndex: Record<string, number> = {
    REQUESTED: 0,
    RECEIVED_AT_ORIGIN: 1,
    DISPATCHED: 2,
    RECEIVED_AT_DESTINATION: 3,
    DELIVERED: 4,
  };

  const currentStep = parcel ? (stepIndex[parcel.status] ?? -1) : -1;

  return (
    <section aria-labelledby="tracking-heading" className="max-w-5xl mx-auto">
      <h2 id="tracking-heading" className="sr-only">
        {isAr ? 'تتبع الطرود المباشر' : 'Suivi de colis en direct'}
      </h2>

      {/* Tracking Input Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="rounded-3xl bg-dark-900/95 border border-dark-750 p-2 sm:p-2.5 shadow-2xl focus-within:border-brand-400/60 focus-within:shadow-glow-brand/25 transition-all duration-300"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row items-center gap-2"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <label htmlFor="tracking-search-input" className="sr-only">
              {t.track_input_placeholder}
            </label>
            <input
              id="tracking-search-input"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={isAr ? 'أدخل رمز التتبع (مثال : KX-ALG-EUL-261012-4821)' : 'Entrez votre code de suivi (ex : KX-ALG-EUL-261012-4821)'}
              aria-label={t.track_input_placeholder}
              className="w-full bg-transparent border-0 rounded-2xl ps-12 pe-4 py-3.5 text-white placeholder-slate-500 text-xs sm:text-sm tracking-wide focus:outline-none focus:ring-0"
            />
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading || !code.trim()}
            aria-label={t.track_button}
            className="w-full sm:w-auto px-7 py-3.5 bg-brand-400 hover:bg-brand-300 disabled:opacity-50 text-dark-950 font-black rounded-2xl shadow-card transition-all active:scale-95 whitespace-nowrap text-xs sm:text-sm flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />
                {t.track_searching}
              </span>
            ) : (
              <>
                <Package className="w-4 h-4 text-dark-950" />
                <span>{isAr ? 'تتبع طردي' : 'Suivre mon colis'}</span>
                <span className="text-dark-950 font-bold">→</span>
              </>
            )}
          </motion.button>
        </form>

        {/* Live Tracking Reassurance Pill - NO GREEN */}
        <div className="flex items-center gap-2 text-xs text-brand-300/90 font-medium pt-2.5 ps-3 border-t border-dark-800/60 mt-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 shrink-0" />
          <span>{isAr ? 'تتبع فوري ومباشر لطردكم' : 'Suivi en temps réel de votre colis'}</span>
        </div>

        {/* Recent + dev quick codes */}
        {(recent.length > 0 || process.env.NODE_ENV === 'development') && (
          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-2 border-t border-dark-800/60">
            <span className="text-[11px] font-semibold inline-flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              {t.track_recent} :
            </span>
            {recent.length > 0
              ? recent.map((item) => (
                  <motion.button
                    key={item}
                    type="button"
                    whileHover={{ scale: 1.06, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setCode(item);
                      handleSearch(item);
                    }}
                    aria-label={`Suivre le code de suivi ${item}`}
                    className="px-2.5 py-1 rounded-lg bg-dark-900 hover:bg-dark-800 border border-dark-700 text-brand-400 hover:text-brand-300 font-mono text-[11px] font-bold transition-colors"
                  >
                    {item}
                  </motion.button>
                ))
              : process.env.NODE_ENV === 'development' && (
                  <>
                    {['KX-ALG-EUL-261012-4821', 'KX-EUL-ALG-261012-7777'].map((item) => (
                      <motion.button
                        key={item}
                        type="button"
                        whileHover={{ scale: 1.06, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setCode(item);
                          handleSearch(item);
                        }}
                        aria-label={`Tester le code de suivi ${item}`}
                        className="px-2.5 py-1 rounded-lg bg-dark-900 hover:bg-dark-800 border border-dark-700 text-brand-400 hover:text-brand-300 font-mono text-[11px] font-bold transition-colors"
                      >
                        {item}
                      </motion.button>
                    ))}
                  </>
                )}
          </div>
        )}
      </motion.div>

      {/* Error / not-found */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="animate-in shake"
          >
            <EmptyState
              icon={AlertCircle}
              title={t.track_notfound_title}
              desc={error}
              className="mt-8"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parcel Tracking Display */}
      <AnimatePresence>
        {parcel && (
          <motion.div
            key={parcel.tracking_code}
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 bg-dark-850 rounded-3xl border border-dark-750 overflow-hidden shadow-card"
          >
          {/* Header */}
          <div className="bg-dark-800/60 p-6 border-b border-dark-750 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xl sm:text-2xl font-mono font-black text-white tracking-wider">
                  {parcel.tracking_code}
                </span>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => copyToClipboard(parcel.tracking_code)}
                  aria-label={t.copy_code}
                  title={t.copy_code}
                  className="p-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-slate-300 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-brand-400" /> : <Copy className="w-4 h-4" />}
                </motion.button>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {parcel.description} • {parcel.weight_kg} kg •{' '}
                {new Date(parcel.created_at).toLocaleDateString(isAr ? 'ar-DZ' : 'fr-DZ', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              aria-label={t.print_bon}
              className="no-print flex items-center gap-2 px-4 py-2.5 bg-dark-800 hover:bg-dark-700 text-slate-200 rounded-xl text-xs font-semibold border border-dark-700 transition-colors active:scale-95"
            >
              <Printer className="w-4 h-4 text-brand-400" />
              {t.print_bon}
            </button>
          </div>

          {/* 5-Step Stepper with progress line */}
          <div className="p-6 sm:p-8 border-b border-dark-750 bg-black/40">
            <div className="relative">
              {/* Connecting progress line (desktop: horizontal, mobile: hidden) */}
              <div className="hidden sm:block absolute top-6 inset-x-6 h-0.5 bg-dark-700 rounded-full overflow-hidden" aria-hidden="true">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(0, (currentStep / (steps.length - 1)) * 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
                  className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
                {steps.map((step, idx) => {
                  const isPassed = currentStep > idx;
                  const isCurrent = currentStep === idx;
                  const StepIcon = step.icon;

                  return (
                    <motion.div
                      key={step.key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 * idx, duration: 0.4 }}
                      className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-0 relative z-10"
                    >
                      <motion.div
                        animate={isCurrent ? { scale: [1, 1.08, 1] } : {}}
                        transition={isCurrent ? { repeat: Infinity, duration: 2, ease: 'easeInOut' } : {}}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                          isCurrent
                            ? 'bg-brand-500 text-dark-950 font-black shadow-glow-brand ring-4 ring-brand-500/25 scale-110'
                            : isPassed
                            ? 'bg-brand-600/30 text-brand-300 border border-brand-500/40 shadow-md'
                            : 'bg-dark-800 text-slate-400 border border-dark-700'
                        }`}
                      >
                        <StepIcon className="w-5 h-5" />
                      </motion.div>
                      <span
                        className={`text-xs font-semibold sm:mt-3 sm:max-w-[130px] ${
                          isCurrent ? 'text-brand-400 font-bold' : isPassed ? 'text-slate-200' : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Barcode & Key Info Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Route */}
            <div className="p-5 rounded-2xl bg-black/40 border border-dark-750 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
                {t.select_route}
              </span>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <div>
                    <span className="text-xs text-slate-400 block">{t.origin_label}</span>
                    <span className="font-semibold text-white text-sm">
                      {isAr ? parcel.origin_office_detail?.name_ar : parcel.origin_office_detail?.name_fr}
                    </span>
                    <p className="text-xs text-slate-400">{parcel.origin_office_detail?.phone}</p>
                  </div>
                </div>

                <div className="border-t border-dark-750 pt-3 flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-400 mt-1.5 shrink-0" />
                  <div>
                    <span className="text-xs text-slate-400 block">{t.destination_label}</span>
                    <span className="font-semibold text-white text-sm">
                      {isAr ? parcel.destination_office_detail?.name_ar : parcel.destination_office_detail?.name_fr}
                    </span>
                    <p className="text-xs text-slate-400">{parcel.destination_office_detail?.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* People & Money */}
            <div className="p-5 rounded-2xl bg-black/40 border border-dark-750">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
                {t.parcel_details}
              </span>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-slate-400 block">{t.sender}</span>
                  <span className="font-medium text-white">{parcel.sender_name}</span>
                  <p className="text-xs text-slate-400 font-mono" dir="ltr">
                    {parcel.sender_phone}
                  </p>
                </div>
                <div className="border-t border-dark-750 pt-2">
                  <span className="text-xs text-slate-400 block">{t.recipient}</span>
                  <span className="font-medium text-white">{parcel.recipient_name}</span>
                  <p className="text-xs text-slate-400 font-mono" dir="ltr">
                    {parcel.recipient_phone}
                  </p>
                </div>
                <div className="border-t border-dark-750 pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-300">{t.fee}</span>
                  <span className="font-mono font-bold text-brand-400 text-base">{parcel.fee_amount} DZD</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">{t.paid_status}</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded border ${
                      parcel.payment_status === 'PAID' ? 'bg-brand-500/15 text-brand-300 border-brand-500/30' : 'bg-dark-800 text-slate-400 border-dark-700'
                    }`}
                  >
                    {parcel.payment_status === 'PAID' ? t.paid : t.unpaid}
                  </span>
                </div>
              </div>
            </div>

            {/* Code 128 Barcode Ticket (printable receipt) */}
            <div className="printable-area p-5 rounded-2xl bg-white text-black flex flex-col items-center justify-center text-center shadow-lg relative border-2 border-gray-200">
              <span className="text-[10px] font-black tracking-widest text-gray-800 uppercase mb-1">
                KHALED EXPRESS • CODE 128
              </span>
              {parcel.barcode_svg ? (
                <div
                  className="w-full max-w-[240px] my-1 flex justify-center"
                  dangerouslySetInnerHTML={{ __html: parcel.barcode_svg }}
                />
              ) : parcel.barcode_png ? (
                <img
                  src={parcel.barcode_png}
                  alt={`Code 128 pour le colis ${parcel.tracking_code}`}
                  width={200}
                  height={56}
                  loading="lazy"
                  className="h-14 object-contain my-1"
                />
              ) : (
                <div className="font-mono text-xs font-bold my-4">{parcel.tracking_code}</div>
              )}
              <span className="font-mono text-xs font-black tracking-widest text-black mt-1">
                {parcel.tracking_code}
              </span>
              <p className="text-[10px] text-gray-700 mt-2 font-medium">{t.scannable_note}</p>
            </div>
          </div>

          {/* Custody Scan Events Timeline */}
          {parcel.scan_events && parcel.scan_events.length > 0 && (
            <div className="p-6 sm:p-8 border-t border-dark-750 bg-black/30">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">{t.history_scans}</h3>
              <div className="space-y-3">
                {parcel.scan_events.map((ev: ScanEvent) => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-dark-900/80 border border-dark-800 text-xs hover:border-dark-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-500 shrink-0" />
                      <div>
                        <span className="font-bold text-white block">
                          {ev.event_type} — {isAr ? ev.office_detail?.name_ar : ev.office_detail?.name_fr}
                        </span>
                        {ev.notes && <p className="text-slate-300 mt-0.5">{ev.notes}</p>}
                      </div>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {new Date(ev.timestamp).toLocaleString(isAr ? 'ar-DZ' : 'fr-DZ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
      </AnimatePresence>
    </section>
  );
}
