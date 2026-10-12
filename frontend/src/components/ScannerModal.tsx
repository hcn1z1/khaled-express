import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '../i18n';
import { Scan, X, Check, AlertCircle, ArrowRight, Zap } from 'lucide-react';

interface ScannerModalProps {
  onScanComplete: (code: string, actionType: 'intake' | 'dispatch' | 'arrive' | 'pickup') => void;
  onClose: () => void;
  recentCodes?: string[];
}

export const ScannerModal: React.FC<ScannerModalProps> = ({ onScanComplete, onClose, recentCodes = [] }) => {
  const { t } = useI18n();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedAction, setSelectedAction] = useState<'intake' | 'dispatch' | 'arrive' | 'pickup'>('dispatch');
  const [feedback, setFeedback] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleScanSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = barcodeInput.trim().toUpperCase();
    if (!cleanCode) return;

    onScanComplete(cleanCode, selectedAction);
    setFeedback(`Scan enregistré : ${cleanCode}`);
    setBarcodeInput('');
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleQuickCode = (code: string) => {
    setBarcodeInput(code);
    onScanComplete(code, selectedAction);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 flex flex-col">
        {/* Scanner Laser Simulation Header */}
        <div className="relative bg-brand-black text-white p-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-900/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-red flex items-center justify-center text-white shadow-lg shadow-red-500/30">
                <Scan className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">Scanner Optique Code 128</h3>
                <p className="text-xs text-gray-400">Compatible douchette USB & saisie manuelle</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Visual laser aiming graphic */}
          <div className="mt-6 mx-auto w-full max-w-xs h-20 border-2 border-red-500/50 rounded-lg relative flex items-center justify-center bg-black/40 overflow-hidden">
            <div className="absolute top-0 bottom-0 left-0 right-0 flex items-center">
              <div className="w-full h-0.5 bg-red-500 shadow-[0_0_12px_#ff0000] animate-pulse" />
            </div>
            <span className="text-[11px] font-mono text-red-300/80 z-10 tracking-widest uppercase">
              Capteur laser actif
            </span>
          </div>
        </div>

        {/* Action Selection */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
              Étape opérationnelle à exécuter :
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button
                type="button"
                onClick={() => setSelectedAction('intake')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                  selectedAction === 'intake'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                1. Dépôt
              </button>
              <button
                type="button"
                onClick={() => setSelectedAction('dispatch')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                  selectedAction === 'dispatch'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                2. Expédition
              </button>
              <button
                type="button"
                onClick={() => setSelectedAction('arrive')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                  selectedAction === 'arrive'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                3. Arrivée
              </button>
              <button
                type="button"
                onClick={() => setSelectedAction('pickup')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                  selectedAction === 'pickup'
                    ? 'bg-green-600 text-white border-green-600 shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                4. Retrait
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleScanSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Numéro de suivi scanné :
              </label>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Ex: KE-ALG-EUL-100202"
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl font-mono text-sm uppercase tracking-wider focus:ring-2 focus:ring-brand-red focus:bg-white transition outline-none"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-brand-red hover:bg-brand-darkred text-white font-bold text-sm rounded-xl transition flex items-center gap-2 shadow-md active:scale-95"
                >
                  Valider
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>

          {/* Feedback */}
          {feedback && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Quick Click Codes for Demo Testing */}
          {recentCodes.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <span className="block text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Colis récents (cliquez pour tester le scan immédiat) :
              </span>
              <div className="flex flex-wrap gap-2">
                {recentCodes.slice(0, 5).map((code) => (
                  <button
                    key={code}
                    onClick={() => handleQuickCode(code)}
                    className="px-3 py-1 bg-gray-100 hover:bg-red-50 hover:text-brand-red border border-gray-200 rounded-lg font-mono text-xs transition"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
