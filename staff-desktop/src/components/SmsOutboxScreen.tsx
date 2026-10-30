'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Smartphone,
  MessageSquare,
  Sliders,
  Send,
  Info
} from 'lucide-react';
import { Language, MockSms, UserProfile } from '../lib/types';
import { staffTranslations } from '../lib/i18n';
import { getSmsOutbox } from '../lib/api';
import SmsSettingsScreen from './SmsSettingsScreen';
import { Badge } from './ui';

interface SmsOutboxScreenProps {
  lang: Language;
  currentUser?: UserProfile;
  initialTab?: 'outbox' | 'settings';
}

export default function SmsOutboxScreen({
  lang,
  currentUser,
  initialTab = 'outbox'
}: SmsOutboxScreenProps) {
  const t = staffTranslations[lang];
  const [activeTab, setActiveTab] = useState<'outbox' | 'settings'>(initialTab);
  const [messages, setMessages] = useState<MockSms[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await getSmsOutbox();
      setMessages(res.results || res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'outbox') {
      loadMessages();
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Tab Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-800 pb-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-brand-400" />
            {t.sms_title}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {t.sms_subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-tab Navigation */}
          <div className="flex items-center p-1 rounded-2xl bg-dark-900 border border-dark-750">
            <button
              onClick={() => setActiveTab('outbox')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'outbox'
                  ? 'bg-brand-400 text-dark-950 font-black shadow-card'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Journal Outbox ({messages.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'settings'
                  ? 'bg-brand-400 text-dark-950 font-black shadow-card'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Passerelle Android & Modèles</span>
            </button>
          </div>

          {activeTab === 'outbox' && (
            <button
              onClick={loadMessages}
              className="p-2.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-gray-300 border border-dark-700 flex items-center gap-2 text-xs font-semibold"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Rafraîchir</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'settings' ? (
        <SmsSettingsScreen
          lang={lang}
          currentUser={currentUser || ({ role: 'ADMIN' } as UserProfile)}
        />
      ) : (
        <div className="bg-dark-900 border border-dark-750 rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-950 text-gray-400 uppercase font-bold border-b border-dark-750 text-[11px]">
                <tr>
                  <th className="py-4 px-5">Colis</th>
                  <th className="py-4 px-4">Destinataire</th>
                  <th className="py-4 px-4">Langue</th>
                  <th className="py-4 px-4">Statut</th>
                  <th className="py-4 px-5">Passerelle / Rapport</th>
                  <th className="py-4 px-5">Contenu du Message</th>
                  <th className="py-4 px-5 text-right">Horodatage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {loading && messages.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-500">
                      Chargement de l'outbox SMS...
                    </td>
                  </tr>
                ) : messages.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-500">
                      Aucun SMS envoyé pour l'instant. Effectuez un scan "ARRIVÉE" ou utilisez l'onglet "Passerelle Android & Modèles" pour envoyer un SMS test.
                    </td>
                  </tr>
                ) : (
                  messages.map((sms) => {
                    const isSuccess = sms.status === 'SENT';
                    const isFailed = sms.status === 'FAILED';
                    const provider = sms.delivery_report?.provider || 'Non spécifié';

                    return (
                      <tr key={sms.id} className="hover:bg-dark-850/60 transition-colors">
                        <td className="py-4 px-5 font-mono font-bold text-brand-400 whitespace-nowrap">
                          {sms.tracking_code}
                        </td>
                        <td className="py-4 px-4 font-mono text-white whitespace-nowrap">
                          {sms.recipient_phone}
                        </td>
                        <td className="py-4 px-4 uppercase text-[10px] font-bold text-gray-400 whitespace-nowrap">
                          {sms.language}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 w-max ${
                              isSuccess
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : isFailed
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {isSuccess ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : isFailed ? (
                              <XCircle className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            {sms.status}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-gray-300">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-[10px] text-brand-300 font-bold">
                              {provider}
                            </span>
                            {sms.delivery_report?.error ? (
                              <span className="text-[10px] text-red-400 max-w-xs truncate" title={sms.delivery_report.error}>
                                {sms.delivery_report.error}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500">
                                {sms.delivery_report?.code || 'OK'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-5 text-gray-200 max-w-md" dir={sms.language === 'ar' ? 'rtl' : 'ltr'}>
                          <div className="bg-dark-950 p-2.5 rounded-xl border border-dark-800 text-[11px] leading-relaxed">
                            {sms.message_body}
                          </div>
                        </td>
                        <td className="py-4 px-5 text-right text-gray-500 font-mono text-[11px] whitespace-nowrap">
                          {new Date(sms.queued_at).toLocaleString(lang === 'ar' ? 'ar-DZ' : 'fr-DZ')}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
