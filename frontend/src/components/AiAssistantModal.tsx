import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { api } from '../services/api';
import { Bot, Send, X, Sparkles, Package, HelpCircle } from 'lucide-react';

interface AiAssistantModalProps {
  onClose: () => void;
  onSelectParcel?: (trackingNumber: string) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({ onClose, onSelectParcel }) => {
  const { t, language } = useI18n();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ q: string; a: string; parcels?: any[] }>>([
    {
      q: language === 'ar' ? 'ما هي وضعية الطرود الحالية؟' : 'Quelle est la situation actuelle des files ?',
      a: language === 'ar' 
        ? 'أهلاً بكم في المساعد الذكي لخالد إكسبريس. يمكنك سؤالي عن إحصائيات الخط (الجزائر <-> العلمة)، الطرود المتأخرة، أو البحث بالاسم والهاتف.'
        : 'Bienvenue sur l\'assistant opérationnel Khaled Express. Vous pouvez me poser des questions sur les flux Alger <-> El Eulma, les impayés, ou rechercher par mot-clé.',
    }
  ]);

  const sampleQuestions = language === 'ar' ? [
    'كم عدد الطرود في انتظار الشحن بالعلمة ؟',
    'الطرود المسلمة وغير المدفوعة بعد',
    'البحث عن طرود الزبون كريم (Karim)',
    'إحصائيات الخط بين الجزائر والعلمة'
  ] : [
    'Combien de colis en attente à El Eulma ?',
    'Afficher les colis remis non payés',
    'Trouver les colis envoyés par Karim',
    'Synthèse des colis en transit Alger -> El Eulma'
  ];

  const handleAsk = async (questionText?: string) => {
    const qToSend = (questionText || query).trim();
    if (!qToSend) return;

    setLoading(true);
    try {
      const res = await api.queryAi(qToSend, language);
      setHistory(prev => [
        ...prev,
        {
          q: qToSend,
          a: res.ai_response,
          parcels: res.parcels
        }
      ]);
      setQuery('');
    } catch (err: any) {
      setHistory(prev => [
        ...prev,
        {
          q: qToSend,
          a: 'Erreur lors de la consultation de l\'assistant : ' + err.message
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[85vh] border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-black via-gray-900 to-red-950 text-white p-5 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-red flex items-center justify-center text-white shadow-lg">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base">{t.aiAssistantTitle}</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-900/60 text-red-300 rounded border border-red-700/50">
                  {t.aiReadOnlyBadge}
                </span>
              </div>
              <p className="text-xs text-gray-400">Recherche sémantique & synthèse des files de livraison</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-gray-50/60">
          {history.map((item, idx) => (
            <div key={idx} className="space-y-3">
              {/* Question bubble */}
              <div className="flex justify-end">
                <div className="bg-brand-red text-white px-4 py-2.5 rounded-2xl rounded-tr-none text-sm max-w-[80%] shadow-sm">
                  {item.q}
                </div>
              </div>

              {/* Answer bubble */}
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-none text-sm max-w-[90%] shadow-sm whitespace-pre-line leading-relaxed">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-red" />
                    <span>Khaled Express AI Assistant</span>
                  </div>
                  {item.a}

                  {/* Matching parcels cards */}
                  {item.parcels && item.parcels.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                      <span className="text-[11px] font-bold text-gray-500 block uppercase">
                        Colis correspondants trouvés :
                      </span>
                      {item.parcels.map(p => (
                        <div
                          key={p.tracking_number}
                          onClick={() => {
                            if (onSelectParcel) onSelectParcel(p.tracking_number);
                            onClose();
                          }}
                          className="p-2 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-300 rounded-xl text-xs flex justify-between items-center cursor-pointer transition"
                        >
                          <div>
                            <span className="font-mono font-bold text-gray-900 block">{p.tracking_number}</span>
                            <span className="text-gray-500 text-[11px]">{p.sender_name} → {p.recipient_name}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-brand-red">{p.fee} DZD</span>
                            <span className="text-[10px] block text-gray-500">{p.origin} ➔ {p.destination}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-gray-500 italic p-2">
              <Sparkles className="w-4 h-4 text-brand-red animate-spin" />
              <span>Analyse des données logistiques en cours...</span>
            </div>
          )}
        </div>

        {/* Prompt Suggestions */}
        <div className="px-5 py-2.5 bg-gray-100/70 border-t border-gray-200 flex flex-wrap gap-2">
          {sampleQuestions.map((sq, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAsk(sq)}
              className="px-3 py-1 bg-white hover:bg-brand-lightred hover:text-brand-darkred border border-gray-200 rounded-full text-xs text-gray-700 transition"
            >
              {sq}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-gray-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.aiPlaceholder}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-red focus:bg-white outline-none transition"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 py-3 bg-brand-red hover:bg-brand-darkred disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center gap-2 shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
