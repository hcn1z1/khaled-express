'use client';

import React, { useState } from 'react';
import { Bot, Sparkles, Send, ShieldCheck, Tag, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { Language, Parcel } from '../lib/types';
import { staffTranslations } from '../lib/i18n';
import { queryAiAssistant } from '../lib/api';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onOpenPrint: (parcel: Parcel, doc: 'ticket' | 'intake' | 'pickup') => void;
}

export default function AiAssistantModal({
  isOpen,
  onClose,
  lang,
  onOpenPrint
}: AiAssistantModalProps) {
  const t = staffTranslations[lang];
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAsk = async (promptQuery?: string) => {
    const q = (promptQuery || query).trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    try {
      const data = await queryAiAssistant(q);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Erreur de consultation de l'assistant IA");
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "Combien de colis sont actuellement en transit vers El Eulma ?",
    "Donne-moi le résumé complet de la file d'attente d'aujourd'hui.",
    "Rechercher le colis pour Walid ou Karim.",
    "ما هي الطرود الجاهزة للاستلام في وكالة العلمة ؟",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-dark-900 border border-dark-750 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-dark-750 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-600/30">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">{t.ai_title}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {t.ai_badge_read_only}
                </span>
              </div>
              <p className="text-xs text-gray-400">{t.ai_subtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-dark-800"
          >
            ✕
          </button>
        </div>

        {/* Query Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="mb-6"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.ai_input_placeholder}
              className="flex-1 bg-dark-950 border border-dark-700 rounded-2xl px-4 py-3.5 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-brand-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-brand-600/30 text-xs flex items-center gap-2 transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Analyse...' : t.ai_ask_btn}</span>
            </button>
          </div>

          {/* Quick prompt suggestions */}
          <div className="flex flex-wrap gap-2 mt-3">
            {sampleQuestions.map((sq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setQuery(sq);
                  handleAsk(sq);
                }}
                className="text-[11px] px-3 py-1.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-gray-400 hover:text-white border border-dark-750 transition-colors"
              >
                {sq}
              </button>
            ))}
          </div>
        </form>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* AI Result Presentation */}
        {result && (
          <div className="space-y-6">
            {/* Markdown Response */}
            <div className="p-5 rounded-2xl bg-dark-950 border border-dark-750 text-gray-200 text-xs leading-relaxed whitespace-pre-line">
              <div className="flex items-center gap-2 text-brand-400 font-bold mb-2 uppercase text-[10px] tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Réponse Assistant</span>
              </div>
              {result.response}
            </div>

            {/* Live Queue Summary Cards */}
            {result.summary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-dark-850 border border-dark-750">
                  <span className="text-[10px] text-gray-400 block">Total Colis</span>
                  <span className="text-lg font-black text-white font-mono">{result.summary.total_parcels}</span>
                </div>
                <div className="p-3 rounded-xl bg-dark-850 border border-dark-750">
                  <span className="text-[10px] text-blue-400 block">En Transit</span>
                  <span className="text-lg font-black text-blue-400 font-mono">
                    {result.summary.status_breakdown?.dispatched_in_transit || 0}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-dark-850 border border-dark-750">
                  <span className="text-[10px] text-amber-400 block">Prêts Retrait</span>
                  <span className="text-lg font-black text-amber-400 font-mono">
                    {result.summary.status_breakdown?.ready_at_destination || 0}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-dark-850 border border-dark-750">
                  <span className="text-[10px] text-emerald-400 block">Livrés</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    {result.summary.status_breakdown?.delivered || 0}
                  </span>
                </div>
              </div>
            )}

            {/* Matched parcels list */}
            {result.matched_parcels && result.matched_parcels.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Colis identifiés ({result.matched_parcels.length})
                </h4>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {result.matched_parcels.map((p: any) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-dark-850 border border-dark-750 flex items-center justify-between text-xs hover:border-dark-600 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{p.tracking_code}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-dark-750 text-gray-300">
                            {p.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400 mt-1">
                          {p.sender_name} ➔ {p.recipient_name} ({p.recipient_phone}) • {p.fee_amount} DZD
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenPrint(p, 'ticket')}
                        className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-white text-[11px] font-bold border border-dark-600 flex items-center gap-1.5"
                      >
                        <Tag className="w-3 h-3 text-brand-400" />
                        Ticket
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
