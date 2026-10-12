import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n';
import { api, SmsMessage } from '../services/api';
import { MessageSquare, Phone, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';

export const SmsOutboxView: React.FC = () => {
  const { t } = useI18n();
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOutbox();
  }, []);

  const loadOutbox = async () => {
    setLoading(true);
    try {
      const data = await api.getSmsOutbox();
      setMessages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900">File d'Attente SMS (Mock Outbox)</h1>
            <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-bold font-mono">
              Notifications Automatisées
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Visualisation des SMS de retrait générés lors du scan d'arrivée en agence destinataire.
          </p>
        </div>

        <button
          onClick={loadOutbox}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {messages.length === 0 ? (
          <div className="col-span-2 text-center py-16 bg-white rounded-3xl border border-gray-200 text-gray-400 text-sm">
            Aucun SMS généré pour l'instant. Effectuez un scan d'arrivée (Arrival Scan) pour déclencher l'envoi d'un SMS de retrait.
          </div>
        ) : (
          messages.map((sms) => (
            <div
              key={sms.id}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-sm text-gray-900 block">{sms.recipient_phone}</strong>
                      <span className="font-mono text-xs text-brand-red font-bold">{sms.tracking_number}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-green-100 text-green-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {sms.status}
                  </span>
                </div>

                {/* SMS Body Bubble */}
                <div 
                  dir={sms.language === 'ar' ? 'rtl' : 'ltr'}
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    sms.language === 'ar'
                      ? 'bg-amber-50/70 border border-amber-200/60 font-arabic text-gray-900'
                      : 'bg-gray-50 border border-gray-200 font-sans text-gray-800'
                  }`}
                >
                  {sms.message_body}
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(sms.created_at).toLocaleString()}
                </span>
                <span className="font-semibold text-gray-500 uppercase">Langue : {sms.language.toUpperCase()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
