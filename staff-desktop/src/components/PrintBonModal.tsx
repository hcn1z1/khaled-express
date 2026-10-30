'use client';

import React, { useState } from 'react';
import { X, Printer, Globe, FileText, Tag, CheckSquare, ShieldCheck, Copy, Check } from 'lucide-react';
import { Parcel, Language } from '../lib/types';

interface PrintBonModalProps {
  parcel: Parcel | null;
  isOpen: boolean;
  onClose: () => void;
  defaultDoc?: 'ticket' | 'intake' | 'pickup';
}

export default function PrintBonModal({
  parcel,
  isOpen,
  onClose,
  defaultDoc = 'ticket'
}: PrintBonModalProps) {
  const [docType, setDocType] = useState<'ticket' | 'intake' | 'pickup'>(defaultDoc);
  const [printLang, setPrintLang] = useState<Language>('fr');

  if (!isOpen || !parcel) return null;

  const originName = printLang === 'ar' ? parcel.origin_office_detail?.name_ar : parcel.origin_office_detail?.name_fr;
  const destName = printLang === 'ar' ? parcel.destination_office_detail?.name_ar : parcel.destination_office_detail?.name_fr;
  const isAr = printLang === 'ar';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-dark-900 border border-dark-700 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
        {/* Modal Controls (No print) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-4 border-b border-dark-750 pb-5 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Format d'impression :</span>
            <div className="flex bg-dark-800 p-1 rounded-xl border border-dark-700 text-xs font-semibold">
              <button
                onClick={() => setDocType('ticket')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  docType === 'ticket' ? 'bg-brand-400 text-dark-950 font-black shadow-card' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                Ticket 80 mm
              </button>
              <button
                onClick={() => setDocType('intake')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  docType === 'intake' ? 'bg-brand-400 text-dark-950 font-black shadow-card' : 'text-gray-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Bon Dépôt Expéditeur
              </button>
              <button
                onClick={() => setDocType('pickup')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  docType === 'pickup' ? 'bg-brand-400 text-dark-950 font-black shadow-card' : 'text-gray-400 hover:text-white'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Bon Retrait Destinataire
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPrintLang(printLang === 'fr' ? 'ar' : 'fr')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-800 border border-dark-700 text-xs font-bold text-gray-200 hover:bg-dark-750"
            >
              <Globe className="w-3.5 h-3.5 text-brand-400" />
              <span>{printLang === 'fr' ? 'Version Arabe (العربية)' : 'Version Française'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-400 hover:to-brand-300 text-dark-950 text-xs font-black shadow-glow-brand transition-all active:scale-95"
            >
              <Printer className="w-4 h-4 text-dark-950" />
              <span>Imprimer</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-dark-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Document Preview Container */}
        <div className="flex justify-center bg-dark-950 p-6 sm:p-10 rounded-2xl border border-dark-800 overflow-x-auto">
          {/* ================= 1. 80mm THERMAL BARCODE TICKET ================= */}
          {docType === 'ticket' && (
            <div
              className="printable-area w-[80mm] min-h-[120mm] bg-white text-black p-4 font-mono text-[11px] leading-tight shadow-2xl rounded relative border border-gray-300"
              dir={isAr ? 'rtl' : 'ltr'}
            >
              <div className="text-center border-b-2 border-black pb-2 mb-2">
                <div className="font-black text-sm tracking-wider uppercase">
                  {isAr ? 'خالد إكسبريس' : 'KHALED EXPRESS'}
                </div>
                <div className="text-[9px] font-bold">
                  {isAr ? 'نقل سريع للطرود • الجزائر ↔ العلمة' : 'MESSAGERIE EXPRESS ALGER ↔ EL EULMA'}
                </div>
                <div className="text-[8px] text-gray-600">
                  Alger Centre: 021 73 45 67 • El Eulma: 036 87 12 34
                </div>
              </div>

              {/* Barcode Graphic */}
              <div className="text-center my-3">
                {parcel.barcode_svg ? (
                  <div
                    className="w-full flex justify-center"
                    dangerouslySetInnerHTML={{ __html: parcel.barcode_svg }}
                  />
                ) : parcel.barcode_png ? (
                  <img src={parcel.barcode_png} alt={parcel.tracking_code} className="h-12 mx-auto" />
                ) : null}
                <div className="font-black text-xs tracking-widest mt-1">
                  {parcel.tracking_code}
                </div>
              </div>

              {/* Route banner */}
              <div className="bg-black text-white p-1 text-center font-bold text-[10px] my-2 uppercase">
                {originName} ➔ {destName}
              </div>

              {/* Details */}
              <div className="space-y-1.5 my-2 border-b border-black pb-2 text-[10px]">
                <div>
                  <span className="font-bold">{isAr ? 'المرسل : ' : 'EXP : '}</span>
                  <span>{parcel.sender_name} ({parcel.sender_phone})</span>
                </div>
                <div>
                  <span className="font-bold">{isAr ? 'المستلم : ' : 'DEST : '}</span>
                  <span className="font-bold">{parcel.recipient_name} ({parcel.recipient_phone})</span>
                </div>
                <div>
                  <span className="font-bold">{isAr ? 'المحتوى : ' : 'CONT : '}</span>
                  <span>{parcel.description} ({parcel.weight_kg} kg)</span>
                </div>
                <div className="flex justify-between font-bold pt-1 text-[11px]">
                  <span>{isAr ? 'الرسوم : ' : 'FRAIS : '}</span>
                  <span>{parcel.fee_amount} DZD ({parcel.payment_status === 'PAID' ? (isAr ? 'مدفوع' : 'PAYÉ') : (isAr ? 'غير مدفوع' : 'NON PAYÉ')})</span>
                </div>
              </div>

              {/* Date & scan notice */}
              <div className="text-[8px] text-center text-gray-700 pt-1">
                <div>{new Date().toLocaleString(isAr ? 'ar-DZ' : 'fr-DZ')}</div>
                <div className="mt-1 font-bold">{isAr ? 'الاحتفاظ بالتذكرة إلزامي عند الاستلام' : 'Conservez ce ticket pour le retrait au guichet'}</div>
              </div>

              {/* Jagged tear paper edge */}
              <div className="mt-4 border-b-2 border-dashed border-gray-400 text-center text-[8px] text-gray-500 pb-1">
                - - - - - - - - - - - - - - - - - - - - - - - - - - -
              </div>
            </div>
          )}

          {/* ================= 2. SENDER INTAKE BON ================= */}
          {docType === 'intake' && (
            <div
              className="printable-area w-[185mm] min-h-[145mm] bg-white text-black p-8 font-sans text-xs leading-relaxed shadow-2xl rounded relative border border-gray-300"
              dir={isAr ? 'rtl' : 'ltr'}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-red-700 pb-4 mb-4">
                <div>
                  <h1 className="text-xl font-black text-red-700 uppercase tracking-wider">
                    {isAr ? 'خالد إكسبريس للطرود السريعة' : 'KHALED EXPRESS MESSAGERIE'}
                  </h1>
                  <p className="text-[10px] text-gray-600">
                    {isAr ? 'وكالتي الجزائر الوسطى والعلمة (سطيف)' : 'Liaison directe sécurisée Alger ↔ El Eulma (Sétif)'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-gray-800 uppercase">
                    {isAr ? 'وصل إيداع طرد (نسخة المرسل)' : 'RÉCÉPISSÉ DE DÉPÔT (INTAKE)'}
                  </div>
                  <div className="text-[10px] font-mono text-gray-600">
                    {new Date().toLocaleString(isAr ? 'ar-DZ' : 'fr-DZ')}
                  </div>
                </div>
              </div>

              {/* Barcode & Tracking */}
              <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg border border-gray-300 mb-4">
                <div>
                  <div className="text-[10px] text-gray-600 uppercase font-bold">
                    {isAr ? 'رقم التتبع المسجل' : 'Numéro de suivi officiel'}
                  </div>
                  <div className="text-base font-black font-mono text-red-700">
                    {parcel.tracking_code}
                  </div>
                  <div className="text-[10px] text-gray-600">
                    {isAr ? `مسار الشحنة: ${originName} ➔ ${destName}` : `Itinéraire: ${originName} ➔ ${destName}`}
                  </div>
                </div>
                {parcel.barcode_png && (
                  <img src={parcel.barcode_png} alt={parcel.tracking_code} className="h-14 object-contain" />
                )}
              </div>

              {/* Sender & Recipient Columns */}
              <div className="grid grid-cols-2 gap-6 border-b border-gray-200 pb-4 mb-4">
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <h3 className="font-bold text-gray-800 text-[11px] uppercase mb-1 border-b border-gray-200 pb-1">
                    {isAr ? 'معلومات المرسل' : 'Informations Expéditeur'}
                  </h3>
                  <div>Nom : <span className="font-bold">{parcel.sender_name}</span></div>
                  <div>Tél : <span className="font-mono">{parcel.sender_phone}</span></div>
                  {parcel.sender_address && <div>Adresse : {parcel.sender_address}</div>}
                </div>
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <h3 className="font-bold text-gray-800 text-[11px] uppercase mb-1 border-b border-gray-200 pb-1">
                    {isAr ? 'معلومات المستلم' : 'Informations Destinataire'}
                  </h3>
                  <div>Nom : <span className="font-bold">{parcel.recipient_name}</span></div>
                  <div>Tél : <span className="font-mono">{parcel.recipient_phone}</span></div>
                  {parcel.recipient_address && <div>Adresse : {parcel.recipient_address}</div>}
                </div>
              </div>

              {/* Package and Fee Table */}
              <table className="w-full text-left text-xs border border-gray-300 mb-4">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-2 border border-gray-300">Description</th>
                    <th className="p-2 border border-gray-300">Poids</th>
                    <th className="p-2 border border-gray-300">Frais de Transport</th>
                    <th className="p-2 border border-gray-300">Statut Règlement</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-gray-300 font-medium">{parcel.description}</td>
                    <td className="p-2 border border-gray-300 font-mono">{parcel.weight_kg} kg</td>
                    <td className="p-2 border border-gray-300 font-bold text-red-700 font-mono">{parcel.fee_amount} DZD</td>
                    <td className="p-2 border border-gray-300 font-bold">
                      {parcel.payment_status === 'PAID' ? 'Réglé' : 'À régler au retrait'}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures & Stamp */}
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gray-300 relative">
                <div className="text-center">
                  <div className="text-[10px] font-bold text-gray-600 mb-8">
                    {isAr ? 'توقيع وإمضاء المرسل' : 'Signature de l’Expéditeur'}
                  </div>
                  <div className="border-b border-gray-400 w-36 mx-auto"></div>
                </div>

                <div className="text-center relative">
                  <div className="text-[10px] font-bold text-gray-600 mb-8">
                    {isAr ? 'خاتم وتأشيرة وكالة الانطلاق' : 'Cachet & Visa de l’Agence'}
                  </div>
                  <div className="border-b border-gray-400 w-36 mx-auto"></div>

                  {/* Stamp watermark */}
                  <div className="absolute right-8 top-0 w-24 h-24 rounded-full border-2 border-red-600/40 text-red-600/40 flex flex-col items-center justify-center font-bold text-[8px] uppercase rotate-12 pointer-events-none">
                    <span>★ KHALED EXPRESS ★</span>
                    <span className="font-mono text-[7px]">VISA GUICHET</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 3. RECIPIENT PICKUP BON ================= */}
          {docType === 'pickup' && (
            <div
              className="printable-area w-[185mm] min-h-[145mm] bg-white text-black p-8 font-sans text-xs leading-relaxed shadow-2xl rounded relative border border-gray-300"
              dir={isAr ? 'rtl' : 'ltr'}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-emerald-700 pb-4 mb-4">
                <div>
                  <h1 className="text-xl font-black text-gray-900 uppercase tracking-wider">
                    {isAr ? 'خالد إكسبريس للطرود السريعة' : 'KHALED EXPRESS MESSAGERIE'}
                  </h1>
                  <p className="text-[10px] text-gray-600">
                    {isAr ? 'وكالة الوجهة والتسليم' : 'Bureau de distribution et remise'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-emerald-800 uppercase">
                    {isAr ? 'وصل استلام ومخالصة (نسخة الزبون)' : 'BON DE RETRAIT & DÉCHARGE (PICKUP)'}
                  </div>
                  <div className="text-[10px] font-mono text-gray-600">
                    {new Date().toLocaleString(isAr ? 'ar-DZ' : 'fr-DZ')}
                  </div>
                </div>
              </div>

              {/* Barcode & Status Banner */}
              <div className="flex items-center justify-between bg-emerald-50 p-3 rounded-lg border border-emerald-300 mb-4">
                <div>
                  <div className="text-[10px] text-gray-600 uppercase font-bold">
                    {isAr ? 'طرد تم تسليمه بنجاح' : 'Colis remis en main propre'}
                  </div>
                  <div className="text-base font-black font-mono text-gray-900">
                    {parcel.tracking_code}
                  </div>
                  <div className="text-[10px] text-gray-600">
                    {isAr ? `المستلم: ${parcel.recipient_name} (${parcel.recipient_phone})` : `Destinataire: ${parcel.recipient_name} (${parcel.recipient_phone})`}
                  </div>
                </div>
                <div className="text-right font-mono text-xs">
                  <div className="font-bold text-gray-800">Frais : {parcel.fee_amount} DZD</div>
                  <div className={`font-bold ${parcel.payment_status === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    Statut : {parcel.payment_status === 'PAID' ? 'PAYÉ' : 'REMIS (PAIEMENT DIFFÉRÉ)'}
                  </div>
                </div>
              </div>

              {/* Acknowledgment Statement */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 leading-relaxed mb-6">
                {isAr ? (
                  <p>
                    أقر أنا الممضي أسفله (المستلم: <strong>{parcel.recipient_name}</strong>) بأنني قد عاينت واستلمت الطرد رقم <strong>{parcel.tracking_code}</strong> في حالة سليمة ومطابقة، وأبرئ ذمة خالد إكسبريس من أي التزام لاحق بعد هذا الاستلام.
                  </p>
                ) : (
                  <p>
                    Je soussigné(e) M/Mme <strong>{parcel.recipient_name}</strong>, atteste avoir pris possession du colis n° <strong>{parcel.tracking_code}</strong> en parfait état extérieur et conforme à l’expédition, et donne entière décharge à Khaled Express.
                  </p>
                )}
              </div>

              {/* Signatures & Stamp */}
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gray-300 relative">
                <div className="text-center">
                  <div className="text-[10px] font-bold text-gray-600 mb-8">
                    {isAr ? 'توقيع المستلم بالاستلام' : 'Signature du Réceptionnaire / Destinataire'}
                  </div>
                  <div className="border-b border-gray-400 w-36 mx-auto"></div>
                </div>

                <div className="text-center relative">
                  <div className="text-[10px] font-bold text-gray-600 mb-8">
                    {isAr ? 'تأشيرة وخاتم وكيل الشباك' : 'Cachet & Visa de l’Agent Remettant'}
                  </div>
                  <div className="border-b border-gray-400 w-36 mx-auto"></div>

                  {/* Stamp watermark */}
                  <div className="absolute right-8 top-0 w-24 h-24 rounded-full border-2 border-emerald-600/40 text-emerald-600/40 flex flex-col items-center justify-center font-bold text-[8px] uppercase rotate-12 pointer-events-none">
                    <span>★ KHALED EXPRESS ★</span>
                    <span className="font-mono text-[7px]">LIVRÉ GUICHET</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
