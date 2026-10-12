'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle, AlertCircle, Printer } from 'lucide-react';
import { Modal, Button, Field } from '@/components/ui';
import { translations } from '@/lib/i18n';
import { createParcelRequest } from '@/lib/api';
import { useSite } from '@/lib/site-context';
import { useRouter } from 'next/navigation';
import { Parcel, NewParcelPayload } from '@/types';

export default function NewTransferModal() {
  const { lang, isTransferOpen, closeTransfer, offices, currentUser } = useSite();
  const t = translations[lang];
  const router = useRouter();

  const [route, setRoute] = useState<'ALG_TO_EUL' | 'EUL_TO_ALG'>('ALG_TO_EUL');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderAddress, setSenderAddress] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [description, setDescription] = useState('Colis standard');
  const [weightKg, setWeightKg] = useState('1.00');
  const [preferredSms, setPreferredSms] = useState<'fr' | 'ar'>('fr');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdParcel, setCreatedParcel] = useState<Parcel | null>(null);

  // Reset form each time the modal opens
  useEffect(() => {
    if (isTransferOpen) {
      setRoute('ALG_TO_EUL');
      setSenderName(currentUser?.full_name || '');
      setSenderPhone(currentUser?.phone_number || '');
      setSenderAddress('');
      setRecipientName('');
      setRecipientPhone('');
      setRecipientAddress('');
      setDescription('Colis standard');
      setWeightKg('1.00');
      setPreferredSms(lang === 'ar' ? 'ar' : 'fr');
      setError(null);
      setCreatedParcel(null);
    }
  }, [isTransferOpen, currentUser, lang]);

  const algOffice = offices.find((o) => o.code === 'ALGIERS') || { id: 1, name_fr: 'Alger' };
  const eulOffice = offices.find((o) => o.code === 'EL_EULMA') || { id: 2, name_fr: 'El Eulma' };

  const originId = route === 'ALG_TO_EUL' ? algOffice.id : eulOffice.id;
  const destinationId = route === 'ALG_TO_EUL' ? eulOffice.id : algOffice.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload: NewParcelPayload = {
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
      };
      const res = await createParcelRequest(payload);
      setCreatedParcel(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const routeBtnCls = (value: typeof route) =>
    `p-3.5 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
      route === value
        ? 'bg-brand-600/15 border-brand-500 text-white'
        : 'bg-dark-850 border-dark-700 text-slate-400 hover:border-dark-600'
    }`;

  return (
    <Modal open={isTransferOpen} onClose={closeTransfer} size="md">
      {!createdParcel ? (
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white mb-2 pe-8">
            {t.create_transfer_title}
          </h2>
          <p className="text-xs text-slate-400 mb-6">{t.request_notice}</p>

          {error && (
            <div role="alert" className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Route selector */}
            <div>
              <span className="block text-xs font-bold text-slate-300 mb-2 uppercase">{t.select_route}</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button type="button" onClick={() => setRoute('ALG_TO_EUL')} className={routeBtnCls('ALG_TO_EUL')}>
                  <span>Alger</span>
                  <ArrowRight className="w-4 h-4 text-brand-400 rtl:rotate-180" />
                  <span>El Eulma (Sétif)</span>
                </button>
                <button type="button" onClick={() => setRoute('EUL_TO_ALG')} className={routeBtnCls('EUL_TO_ALG')}>
                  <span>El Eulma (Sétif)</span>
                  <ArrowRight className="w-4 h-4 text-brand-400 rtl:rotate-180" />
                  <span>Alger</span>
                </button>
              </div>
            </div>

            {/* Sender & recipient */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-dark-850 border border-dark-750 space-y-3">
                <span className="text-xs font-bold text-brand-400 uppercase tracking-wider block">{t.sender}</span>
                <Field
                  id="transfer-sender-name"
                  label={t.sender_name}
                  type="text"
                  required
                  autoComplete="name"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                />
                <Field
                  id="transfer-sender-phone"
                  label={t.sender_phone}
                  type="tel"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="0550123456"
                  mono
                  pattern="0[5-7][0-9]{8}"
                  hint={t.phone_hint}
                />
                <Field
                  id="transfer-sender-address"
                  label={t.sender_address}
                  type="text"
                  autoComplete="street-address"
                  value={senderAddress}
                  onChange={(e) => setSenderAddress(e.target.value)}
                  placeholder="Alger Centre"
                />
              </div>

              <div className="p-4 rounded-2xl bg-dark-850 border border-dark-750 space-y-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">{t.recipient}</span>
                <Field
                  id="transfer-recipient-name"
                  label={t.recipient_name}
                  type="text"
                  required
                  autoComplete="name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
                <Field
                  id="transfer-recipient-phone"
                  label={t.recipient_phone}
                  type="tel"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="0661123456"
                  mono
                  pattern="0[5-7][0-9]{8}"
                  hint={t.phone_hint}
                />
                <Field
                  id="transfer-recipient-address"
                  label={t.recipient_address}
                  type="text"
                  autoComplete="street-address"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="El Eulma"
                />
              </div>
            </div>

            {/* Package details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Field
                  id="transfer-package-description"
                  label={t.package_desc}
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Field
                id="transfer-package-weight"
                label={t.weight_kg}
                type="number"
                step="0.1"
                min="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                mono
              />
            </div>

            {/* SMS language preference */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-dark-850 border border-dark-750 text-xs">
              <span className="text-slate-300">{t.sms_lang_label}</span>
              <div className="flex gap-2">
                {(['fr', 'ar'] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setPreferredSms(code)}
                    className={`px-3 py-1 rounded-lg font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                      preferredSms === code ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {code === 'fr' ? 'Français' : 'العربية'}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" size="lg" loading={loading} className="w-full">
              {loading ? t.loading_create : t.submit_request}
            </Button>
          </form>
        </div>
      ) : (
        /* Success screen with printable receipt */
        <div className="text-center py-2">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-black text-white mb-1">{t.success_title}</h2>
          <p className="text-xs text-slate-400 mb-6 max-w-sm mx-auto">{t.success_desc}</p>

          {/* Printable Confirmation Card */}
          <div className="printable-area bg-white text-black p-6 rounded-2xl max-w-sm mx-auto shadow-xl mb-6 text-center">
            <span className="text-[10px] font-black tracking-widest text-gray-600 uppercase block">
              {t.success_receipt_label}
            </span>
            <div className="my-3 font-mono text-xl font-black text-red-700 tracking-wider">
              {createdParcel.tracking_code}
            </div>
            <div className="text-xs font-semibold text-gray-800 space-y-1 border-t border-b border-gray-200 py-3 my-2">
              <div>
                {t.success_from}: {createdParcel.sender_name} ({createdParcel.sender_phone})
              </div>
              <div>
                {t.success_to}: {createdParcel.recipient_name} ({createdParcel.recipient_phone})
              </div>
              <div>
                {t.success_status_label}: <span className="text-amber-700 font-bold">{t.status_requested}</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-500">{t.success_payment_note}</p>
          </div>

          <div className="flex items-center justify-center gap-3 no-print">
            <Button variant="secondary" icon={Printer} onClick={() => window.print()}>
              {t.print_receipt}
            </Button>
            <Button
              onClick={() => {
                closeTransfer();
                router.push(`/suivi/${createdParcel.tracking_code}`);
              }}
            >
              {t.track_button}
            </Button>
            <Button variant="ghost" onClick={closeTransfer}>
              {t.close_btn}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
