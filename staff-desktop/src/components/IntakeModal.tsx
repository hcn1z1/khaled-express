'use client';

import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck, AlertCircle, PlusCircle } from 'lucide-react';
import { Language, Office, UserProfile, Parcel } from '../lib/types';
import { staffTranslations } from '../lib/i18n';
import { createParcelStaff } from '../lib/api';

interface IntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentUser: UserProfile;
  offices: Office[];
  onCreated: (parcel: Parcel) => void;
}

export default function IntakeModal({
  isOpen,
  onClose,
  lang,
  currentUser,
  offices,
  onCreated
}: IntakeModalProps) {
  const t = staffTranslations[lang];

  const isAdmin = currentUser.role === 'ADMIN';

  // State
  const [route, setRoute] = useState<'ALG_TO_EUL' | 'EUL_TO_ALG'>('ALG_TO_EUL');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderAddress, setSenderAddress] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [description, setDescription] = useState('Colis standard');
  const [weightKg, setWeightKg] = useState('1.50');
  const [feeAmount, setFeeAmount] = useState('500.00');
  const [preferredSms, setPreferredSms] = useState<'fr' | 'ar'>('fr');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const algOffice = offices.find(o => o.code === 'ALGIERS') || { id: 1 };
  const eulOffice = offices.find(o => o.code === 'EL_EULMA') || { id: 2 };

  const originId = route === 'ALG_TO_EUL' ? algOffice.id : eulOffice.id;
  const destinationId = route === 'ALG_TO_EUL' ? eulOffice.id : algOffice.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        origin_office: originId,
        destination_office: destinationId,
        sender_name: senderName,
        sender_phone: senderPhone,
        sender_address: senderAddress,
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        recipient_address: recipientAddress,
        description,
        weight_kg: weightKg,
        preferred_sms_language: preferredSms,
        intake_now: true, // Immediate registration at origin office
      };

      if (isAdmin) {
        payload.fee_amount = feeAmount;
      }

      const res = await createParcelStaff(payload);
      onCreated(res);
      onClose();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-dark-900 border border-dark-750 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-dark-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">
              {t.modal_intake_title}
            </h3>
            <p className="text-xs text-gray-400">
              Génération immédiate du code de suivi Code 128 et bon de réception.
            </p>
          </div>
        </div>

        {/* Role fee alert */}
        <div className={`my-4 p-3.5 rounded-2xl text-xs flex items-center gap-3 border ${
          isAdmin
            ? 'bg-brand-950/40 border-brand-800/60 text-brand-300'
            : 'bg-dark-850 border-dark-700 text-gray-400'
        }`}>
          <ShieldCheck className="w-5 h-5 shrink-0 text-brand-400" />
          <span>
            {isAdmin ? t.admin_custom_fee_notice : t.mod_standard_fee_notice}
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Route buttons */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Trajet
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRoute('ALG_TO_EUL')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  route === 'ALG_TO_EUL'
                    ? 'bg-brand-600/20 border-brand-500 text-white'
                    : 'bg-dark-850 border-dark-700 text-gray-400'
                }`}
              >
                <span>Alger</span>
                <ArrowRight className="w-3.5 h-3.5 text-brand-400" />
                <span>El Eulma</span>
              </button>
              <button
                type="button"
                onClick={() => setRoute('EUL_TO_ALG')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  route === 'EUL_TO_ALG'
                    ? 'bg-brand-600/20 border-brand-500 text-white'
                    : 'bg-dark-850 border-dark-700 text-gray-400'
                }`}
              >
                <span>El Eulma</span>
                <ArrowRight className="w-3.5 h-3.5 text-brand-400" />
                <span>Alger</span>
              </button>
            </div>
          </div>

          {/* Sender & Recipient fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-dark-850 border border-dark-750 space-y-2.5">
              <span className="text-[11px] font-bold text-brand-400 uppercase">Expéditeur</span>
              <div>
                <input
                  type="text"
                  required
                  placeholder="Nom complet de l'expéditeur *"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3 py-2 text-white text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="tel"
                  required
                  placeholder="Téléphone expéditeur *"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3 py-2 text-white text-xs font-mono focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Adresse (optionnel)"
                  value={senderAddress}
                  onChange={(e) => setSenderAddress(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3 py-2 text-white text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-dark-850 border border-dark-750 space-y-2.5">
              <span className="text-[11px] font-bold text-emerald-400 uppercase">Destinataire</span>
              <div>
                <input
                  type="text"
                  required
                  placeholder="Nom complet du destinataire *"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3 py-2 text-white text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="tel"
                  required
                  placeholder="Téléphone destinataire (SMS) *"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3 py-2 text-white text-xs font-mono focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Adresse (optionnel)"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3 py-2 text-white text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Package details & Fees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Description colis</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3 py-2 text-white text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Poids (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3 py-2 text-white text-xs focus:border-brand-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">
                Frais (DZD) {isAdmin ? '(Admin)' : '(Fixe)'}
              </label>
              <input
                type="number"
                step="50"
                min="0"
                disabled={!isAdmin}
                value={feeAmount}
                onChange={(e) => setFeeAmount(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2 text-xs font-mono font-bold ${
                  isAdmin
                    ? 'bg-dark-850 border-brand-500 text-brand-400 focus:outline-none'
                    : 'bg-dark-950 border-dark-800 text-gray-500 cursor-not-allowed'
                }`}
              />
            </div>
          </div>

          {/* SMS preference */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-dark-850 border border-dark-750 text-xs">
            <span className="text-gray-300">Langue du SMS de mise à disposition :</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPreferredSms('fr')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${preferredSms === 'fr' ? 'bg-brand-400 text-dark-950 font-black shadow-card' : 'text-gray-400 hover:text-white'}`}
              >
                Français
              </button>
              <button
                type="button"
                onClick={() => setPreferredSms('ar')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${preferredSms === 'ar' ? 'bg-brand-400 text-dark-950 font-black shadow-card' : 'text-gray-400 hover:text-white'}`}
              >
                العربية
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-400 hover:to-brand-300 disabled:opacity-50 text-dark-950 font-black rounded-2xl shadow-glow-brand text-sm transition-all active:scale-95 mt-2"
          >
            {loading ? 'Enregistrement...' : t.btn_register_and_print}
          </button>
        </form>
      </div>
    </div>
  );
}
