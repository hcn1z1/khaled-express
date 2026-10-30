'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Scan, CheckCircle, AlertCircle, Printer, ArrowRight, Clock, ShieldCheck, Tag, Volume2, VolumeX, Keyboard } from 'lucide-react';
import { Language, Parcel, Office, UserProfile } from '../lib/types';
import { staffTranslations } from '../lib/i18n';
import { executeScan } from '../lib/api';
import { sound } from '../lib/sound';

interface ScanStationProps {
  lang: Language;
  currentUser: UserProfile;
  offices: Office[];
  onOpenPrint: (parcel: Parcel, doc: 'ticket' | 'intake' | 'pickup') => void;
  onRefreshList: () => void;
}

export default function ScanStation({
  lang,
  currentUser,
  offices,
  onOpenPrint,
  onRefreshList
}: ScanStationProps) {
  const t = staffTranslations[lang];

  const [scanType, setScanType] = useState<'INTAKE' | 'DISPATCH' | 'ARRIVAL' | 'PICKUP'>('DISPATCH');
  const [trackingInput, setTrackingInput] = useState('');
  const [selectedOfficeId, setSelectedOfficeId] = useState<number>(
    currentUser.assigned_office || (offices[0]?.id || 1)
  );
  const [notes, setNotes] = useState('');
  const [soundOn, setSoundOn] = useState<boolean>(sound.isEnabled());

  const [loading, setLoading] = useState(false);
  const [successParcel, setSuccessParcel] = useState<Parcel | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically
  useEffect(() => {
    inputRef.current?.focus();
  }, [scanType]);

  // Keyboard shortcuts: 1-4 switch scan mode, F2 focuses scan input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        inputRef.current?.focus();
        return;
      }
      // Number shortcuts only when not typing
      if (document.activeElement === inputRef.current && trackingInput.length > 0) {
        return;
      }
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      const modeKeys: Record<string, 'INTAKE' | 'DISPATCH' | 'ARRIVAL' | 'PICKUP'> = {
        '1': 'INTAKE',
        '2': 'DISPATCH',
        '3': 'ARRIVAL',
        '4': 'PICKUP',
      };
      if (e.key in modeKeys) {
        e.preventDefault();
        setScanType(modeKeys[e.key]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [trackingInput]);

  const handleToggleSound = () => {
    const enabled = sound.toggleSound();
    setSoundOn(enabled);
  };

  const handleScanSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = trackingInput.trim().toUpperCase();
    if (!code) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessParcel(null);

    try {
      const res = await executeScan({
        tracking_code: code,
        event_type: scanType,
        office_id: selectedOfficeId,
        notes: notes.trim(),
      });

      // Play success double beep
      sound.playSuccess();

      setSuccessParcel(res.parcel);
      setRecentScans(prev => [
        {
          id: res.event_id || Date.now(),
          code: res.parcel.tracking_code,
          type: scanType,
          status: res.parcel.status,
          time: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-DZ' : 'fr-DZ'),
          parcel: res.parcel
        },
        ...prev.slice(0, 9)
      ]);

      setTrackingInput('');
      setNotes('');
      onRefreshList();
      inputRef.current?.focus();
    } catch (err: any) {
      // Play error tone
      sound.playError();
      setErrorMsg(err.message || 'Échec de scan');
    } finally {
      setLoading(false);
    }
  };

  const selectedOffice = offices.find(o => o.id === selectedOfficeId) || offices[0];

  return (
    <div className="space-y-6">
      {/* Top Banner / Mode selection */}
      <div className="bg-dark-900 border border-dark-750 p-6 sm:p-7 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-600/20 text-brand-500 border border-brand-500/30 flex items-center justify-center">
                <Scan className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {t.scan_title}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {t.scan_subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Office selector & Sound toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSound}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-colors ${
                soundOn
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-dark-850 border-dark-700 text-gray-400 hover:text-white'
              }`}
              title={soundOn ? 'Effets sonores activés' : 'Son désactivé'}
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{soundOn ? 'Son POS' : 'Silencieux'}</span>
            </button>

            <div className="flex items-center gap-2 bg-dark-850 p-1.5 rounded-2xl border border-dark-700">
              <span className="text-xs font-semibold text-gray-400 pl-2">
                {t.current_office_label} :
              </span>
              <select
                value={selectedOfficeId}
                onChange={(e) => setSelectedOfficeId(Number(e.target.value))}
                className="bg-dark-900 text-white border border-dark-700 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-brand-500"
              >
                {offices.map(o => (
                  <option key={o.id} value={o.id}>
                    {lang === 'ar' ? o.name_ar : o.name_fr} ({o.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Scan Type selector pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 relative z-10">
          <button
            type="button"
            onClick={() => setScanType('INTAKE')}
            className={`p-4 rounded-2xl border text-xs font-bold transition-all text-left flex flex-col justify-between h-24 ${
              scanType === 'INTAKE'
                ? 'bg-blue-900/35 border-blue-500 text-white shadow-xl shadow-blue-500/20 ring-2 ring-blue-500/20'
                : 'bg-dark-850 border-dark-700 text-gray-400 hover:border-dark-600 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-blue-400 uppercase tracking-wider font-mono">1. DÉPART</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-800 text-gray-400">Origine</span>
            </div>
            <span className="text-sm font-black">{t.scan_mode_intake}</span>
          </button>

          <button
            type="button"
            onClick={() => setScanType('DISPATCH')}
            className={`p-4 rounded-2xl border text-xs font-bold transition-all text-left flex flex-col justify-between h-24 ${
              scanType === 'DISPATCH'
                ? 'bg-brand-500/20 border-brand-400 text-white shadow-xl shadow-brand-500/20 ring-2 ring-brand-400/20'
                : 'bg-dark-850 border-dark-700 text-gray-400 hover:border-dark-600 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-brand-400 uppercase tracking-wider font-mono">2. EXPÉDITION</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-800 text-gray-400">Navette</span>
            </div>
            <span className="text-sm font-black">{t.scan_mode_dispatch}</span>
          </button>

          <button
            type="button"
            onClick={() => setScanType('ARRIVAL')}
            className={`p-4 rounded-2xl border text-xs font-bold transition-all text-left flex flex-col justify-between h-24 ${
              scanType === 'ARRIVAL'
                ? 'bg-amber-900/35 border-amber-500 text-white shadow-xl shadow-amber-500/20 ring-2 ring-amber-500/20'
                : 'bg-dark-850 border-dark-700 text-gray-400 hover:border-dark-600 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-amber-400 uppercase tracking-wider font-mono">3. ARRIVÉE</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">SMS 🔔</span>
            </div>
            <span className="text-sm font-black">{t.scan_mode_arrival}</span>
          </button>

          <button
            type="button"
            onClick={() => setScanType('PICKUP')}
            className={`p-4 rounded-2xl border text-xs font-bold transition-all text-left flex flex-col justify-between h-24 ${
              scanType === 'PICKUP'
                ? 'bg-emerald-900/35 border-emerald-500 text-white shadow-xl shadow-emerald-500/20 ring-2 ring-emerald-500/20'
                : 'bg-dark-850 border-dark-700 text-gray-400 hover:border-dark-600 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-mono">4. REMISE</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-800 text-gray-400">Client</span>
            </div>
            <span className="text-sm font-black">{t.scan_mode_pickup}</span>
          </button>
        </div>

        {/* Scan Input Gun Box with animated gold laser beam */}
        <form onSubmit={handleScanSubmit} className="space-y-4 relative z-10">
          <div className="relative group">
            {/* Visual Gold Laser line animation overlay */}
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-brand-400 to-transparent top-1/2 -translate-y-1/2 opacity-75 pointer-events-none group-focus-within:animate-pulse" />

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Scan className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-brand-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder={t.scan_input_placeholder}
                  className="w-full bg-dark-950 border-2 border-dark-700 focus:border-brand-500 rounded-2xl pl-14 pr-4 py-4 text-white text-base font-mono tracking-wider focus:outline-none focus:ring-4 focus:ring-brand-500/20 uppercase shadow-inner transition-colors"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || !trackingInput.trim()}
                className="px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-400 hover:to-brand-300 disabled:opacity-50 text-dark-950 font-black rounded-2xl shadow-glow-brand transition-all text-sm whitespace-nowrap active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Validation...</span>
                ) : (
                  <>
                    <Scan className="w-4 h-4" />
                    <span>{t.scan_btn}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes optionnelles (ex: Casier B-14, Navette 1, Remis en main propre)..."
              className="w-full bg-dark-850 border border-dark-700 rounded-xl px-4 py-2.5 text-xs text-gray-300 focus:outline-none focus:border-brand-500"
            />
          </div>
        </form>
      </div>

      {/* Success Notification Banner with Sound & Print Buttons */}
      {successParcel && (
        <div className="bg-gradient-to-r from-emerald-950/60 to-dark-900 border-2 border-emerald-500/80 p-6 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg font-black text-white tracking-wider">
                  {successParcel.tracking_code}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 uppercase">
                  {successParcel.status}
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1.5">
                De <strong>{successParcel.sender_name}</strong> ➔ À <strong>{successParcel.recipient_name}</strong> • Frais : <span className="font-mono font-bold text-emerald-400">{successParcel.fee_amount} DZD</span> ({successParcel.payment_status})
              </p>
            </div>
          </div>

          {/* Quick Print buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenPrint(successParcel, 'ticket')}
              className="flex items-center gap-2 px-4 py-2.5 bg-dark-800 hover:bg-dark-700 text-white rounded-xl text-xs font-bold border border-dark-600 transition-colors shadow"
            >
              <Tag className="w-4 h-4 text-brand-400" />
              Ticket 80mm
            </button>
            <button
              onClick={() => onOpenPrint(successParcel, scanType === 'PICKUP' ? 'pickup' : 'intake')}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-600/30 transition-colors"
            >
              <Printer className="w-4 h-4" />
              {scanType === 'PICKUP' ? 'Bon Retrait' : 'Bon Dépôt'}
            </button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="bg-red-950/60 border-2 border-red-600/80 p-5 rounded-3xl text-red-200 flex items-center gap-4 text-sm shadow-2xl animate-in shake">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="font-medium">
            <strong className="text-white block mb-0.5">Transition de garde non autorisée</strong>
            {errorMsg}
          </div>
        </div>
      )}

      {/* Recent Scans Session Log */}
      {recentScans.length > 0 && (
        <div className="bg-dark-900 border border-dark-750 p-6 rounded-3xl shadow-xl">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-500" />
            {t.last_scans} ({recentScans.length})
          </h3>
          <div className="space-y-2.5">
            {recentScans.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-dark-850 border border-dark-750 text-xs hover:border-dark-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-white text-sm">{item.code}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-dark-750 text-gray-300 uppercase">
                    {item.type}
                  </span>
                  <span className="text-gray-400 font-medium">➔ {item.status}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-gray-500 font-mono text-[11px]">{item.time}</span>
                  <button
                    onClick={() => onOpenPrint(item.parcel, 'ticket')}
                    className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-300 transition-colors"
                    title="Imprimer ticket"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
