import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { Parcel } from '../services/api';
import { BarcodeDisplay } from './BarcodeDisplay';
import { Printer, X, Tag, FileText, CheckCircle } from 'lucide-react';

interface PrintBonsModalProps {
  parcel: Parcel;
  onClose: () => void;
}

export const PrintBonsModal: React.FC<PrintBonsModalProps> = ({ parcel, onClose }) => {
  const { t, language } = useI18n();
  const [activeTab, setActiveTab] = useState<'ticket' | 'sender' | 'recipient'>('ticket');

  const handlePrint = () => {
    window.print();
  };

  const isArabic = language === 'ar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-brand-black text-white px-6 py-4 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-red flex items-center justify-center font-bold text-white shadow-md">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Centre d'Impression des Bons & Étiquettes</h3>
              <p className="text-xs text-gray-400">Colis: {parcel.tracking_number} ({parcel.origin_office} → {parcel.destination_office})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('ticket')}
            className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm rounded-t-xl transition ${
              activeTab === 'ticket'
                ? 'bg-white text-brand-red border-t-2 border-brand-red shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Tag className="w-4 h-4" />
            {t.printLabel} (80 mm)
          </button>
          <button
            onClick={() => setActiveTab('sender')}
            className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm rounded-t-xl transition ${
              activeTab === 'sender'
                ? 'bg-white text-brand-red border-t-2 border-brand-red shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            {t.printSenderBon}
          </button>
          <button
            onClick={() => setActiveTab('recipient')}
            className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm rounded-t-xl transition ${
              activeTab === 'recipient'
                ? 'bg-white text-brand-red border-t-2 border-brand-red shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            {t.printRecipientBon}
          </button>
        </div>

        {/* Preview Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-100 flex justify-center items-start">
          
          {/* TAB 1: 80 mm BARCODE THERMAL TICKET */}
          {activeTab === 'ticket' && (
            <div id="print-content" className="w-[80mm] min-h-[110mm] bg-white p-4 rounded-lg shadow-md border-2 border-dashed border-gray-300 text-black font-sans text-xs flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="text-center pb-2 border-b border-black">
                  <h1 className="font-extrabold text-base tracking-wider uppercase">KHALED EXPRESS</h1>
                  <p className="text-[10px] text-gray-700">LIGNE DIRECTE ALGER - EL EULMA</p>
                  <p className="text-[9px] font-mono text-gray-600">Tél: 0550 00 00 00</p>
                </div>

                {/* Route Badge */}
                <div className="my-2 p-1.5 bg-black text-white text-center font-bold text-sm tracking-widest rounded">
                  {parcel.origin_office} ➔ {parcel.destination_office}
                </div>

                {/* Barcode */}
                <div className="text-center my-2 flex justify-center">
                  <BarcodeDisplay svg={parcel.barcode_svg} code={parcel.tracking_number} />
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-[11px] pt-1 border-t border-dashed border-gray-400">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-600">Destinataire:</span>
                    <span className="font-bold">{parcel.recipient_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-600">Téléphone:</span>
                    <span className="font-bold">{parcel.recipient_phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-600">Expéditeur:</span>
                    <span>{parcel.sender_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-600">Poids:</span>
                    <span>{parcel.weight_kg} kg</span>
                  </div>
                </div>

                {/* Fee Highlight */}
                <div className="mt-3 p-2 border-2 border-black rounded text-center">
                  <span className="block text-[10px] uppercase font-semibold">Montant à régler / الرسوم</span>
                  <span className="text-base font-extrabold">{parcel.fee} DZD</span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-3 border-t border-gray-300 text-[9px] text-gray-500">
                Imprimé le {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
              </div>
            </div>
          )}

          {/* TAB 2: SENDER INTAKE BON */}
          {activeTab === 'sender' && (
            <div id="print-content" className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md border border-gray-300 text-gray-900 text-sm">
              <div className="flex justify-between items-center pb-4 border-b-2 border-brand-red">
                <div>
                  <h2 className="text-xl font-extrabold text-brand-red">KHALED EXPRESS</h2>
                  <p className="text-xs text-gray-600">خالد إكسبريس لنقل الطرود السريع</p>
                  <p className="text-xs font-semibold text-gray-800">RÉCÉPISSÉ DE DÉPÔT (EXPÉDITEUR)</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-gray-100 border border-gray-300 rounded font-mono font-bold text-xs">
                    {parcel.tracking_number}
                  </span>
                  <p className="text-[11px] text-gray-500 mt-1">Date: {new Date(parcel.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="my-4 flex justify-center">
                <BarcodeDisplay svg={parcel.barcode_svg} code={parcel.tracking_number} />
              </div>

              <div className="grid grid-cols-2 gap-4 my-4 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                <div>
                  <h4 className="font-bold text-gray-700 uppercase mb-1">Expéditeur / المرسل</h4>
                  <p><span className="text-gray-500">Nom:</span> <strong className="text-gray-900">{parcel.sender_name}</strong></p>
                  <p><span className="text-gray-500">Tél:</span> <strong>{parcel.sender_phone}</strong></p>
                  <p><span className="text-gray-500">Agence de départ:</span> <strong>{parcel.origin_name_fr}</strong></p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-700 uppercase mb-1">Destinataire / المستلم</h4>
                  <p><span className="text-gray-500">Nom:</span> <strong className="text-gray-900">{parcel.recipient_name}</strong></p>
                  <p><span className="text-gray-500">Tél:</span> <strong>{parcel.recipient_phone}</strong></p>
                  <p><span className="text-gray-500">Agence de retrait:</span> <strong>{parcel.destination_name_fr}</strong></p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-3 my-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Nature du colis:</span>
                  <strong>{parcel.description}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Poids mesuré:</span>
                  <strong>{parcel.weight_kg} kg</strong>
                </div>
                <div className="flex justify-between text-base font-bold text-brand-red pt-2 border-t border-gray-200">
                  <span>Frais d'expédition:</span>
                  <span>{parcel.fee} DZD</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-300 grid grid-cols-2 gap-4 text-center text-xs text-gray-500">
                <div className="h-20 border border-dashed border-gray-300 rounded p-2 flex flex-col justify-between">
                  <span>Signature & Cachet Agence</span>
                  <span className="font-bold text-gray-400">Alger / El Eulma</span>
                </div>
                <div className="h-20 border border-dashed border-gray-300 rounded p-2 flex flex-col justify-between">
                  <span>Signature du Client</span>
                  <span className="font-bold text-gray-400">Bon pour accord</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RECIPIENT PICKUP BON (Bilingual FR/AR) */}
          {activeTab === 'recipient' && (
            <div id="print-content" className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md border border-gray-300 text-gray-900 text-sm">
              <div className="flex justify-between items-center pb-4 border-b-2 border-black">
                <div>
                  <h2 className="text-xl font-extrabold text-black">KHALED EXPRESS</h2>
                  <p className="text-xs text-gray-600">BON DE RETRAIT & LIVRAISON / وصل استلام طرد</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded font-mono font-bold text-xs">
                    REMISE CLIENT
                  </span>
                </div>
              </div>

              <div className="my-4 flex justify-center">
                <BarcodeDisplay svg={parcel.barcode_svg} code={parcel.tracking_number} />
              </div>

              <div className="space-y-3 text-xs my-4">
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-500">Code Suivi / رقم التتبع:</span>
                    <strong className="font-mono text-sm">{parcel.tracking_number}</strong>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-500">Destinataire / المستلم:</span>
                    <strong className="text-sm">{parcel.recipient_name} ({parcel.recipient_phone})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ligne / الخط:</span>
                    <strong>{parcel.origin_office} ➔ {parcel.destination_office}</strong>
                  </div>
                </div>

                <div className="p-3 bg-red-50 border border-red-200 rounded flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-red-900">Montant Colis / الرسوم:</span>
                    <p className="text-[10px] text-red-700">
                      {parcel.is_paid ? 'Acquitté / مدفوع' : 'En attente de paiement / غير مدفوع'}
                    </p>
                  </div>
                  <span className="text-lg font-black text-brand-red">{parcel.fee} DZD</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
                <p className="italic mb-4">
                  "Je soussigné certifie avoir retiré le colis susmentionné en bon état."
                  <br />
                  "أصرح باستلام الطرد المذكور أعلاه في حالة جيدة."
                </p>
                <div className="h-20 border border-dashed border-gray-400 rounded p-2 flex flex-col justify-between max-w-xs mx-auto">
                  <span>Date & Signature du Destinataire / إمضاء المستلم</span>
                  <span className="text-[10px] text-gray-400">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition"
          >
            {t.close}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-red hover:bg-brand-darkred text-white font-bold text-sm rounded-xl shadow-lg transition transform active:scale-95"
          >
            <Printer className="w-4 h-4" />
            {t.printButton}
          </button>
        </div>
      </div>
    </div>
  );
};
