import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n';
import { api, Parcel } from '../services/api';
import { BarcodeDisplay } from '../components/BarcodeDisplay';
import { 
  Search, Package, Send, ArrowRight, Clock, MapPin, 
  CheckCircle2, AlertTriangle, ShieldCheck, Phone, User
} from 'lucide-react';

export const CustomerPortal: React.FC = () => {
  const { t, language } = useI18n();
  const [searchCode, setSearchCode] = useState('');
  const [trackedParcel, setTrackedParcel] = useState<Parcel | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [loadingTrack, setLoadingTrack] = useState(false);

  // New transfer form state
  const [originOffice, setOriginOffice] = useState<'ALG' | 'EUL'>('ALG');
  const [destOffice, setDestOffice] = useState<'ALG' | 'EUL'>('EUL');
  const [senderName, setSenderName] = useState('Karim Benali');
  const [senderPhone, setSenderPhone] = useState('0661123456');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [description, setDescription] = useState('Effets personnels & documents');
  const [estimatedWeight, setEstimatedWeight] = useState('1.5');
  const [createSuccess, setCreateSuccess] = useState<Parcel | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer's parcels
  const [myParcels, setMyParcels] = useState<Parcel[]>([]);

  useEffect(() => {
    loadMyParcels();
  }, []);

  const loadMyParcels = async () => {
    try {
      const parcels = await api.getParcels({ search: 'Karim' });
      setMyParcels(parcels);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchCode.trim()) return;

    setLoadingTrack(true);
    setTrackingError(null);
    setTrackedParcel(null);

    try {
      const parcel = await api.trackParcel(searchCode.trim());
      setTrackedParcel(parcel);
    } catch (err: any) {
      setTrackingError(err.message || 'Colis introuvable');
    } finally {
      setLoadingTrack(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setCreateSuccess(null);

    if (originOffice === destOffice) {
      setFormError("L'agence de départ et l'agence d'arrivée doivent être différentes (Alger <-> El Eulma).");
      return;
    }

    if (!recipientName.trim() || !recipientPhone.trim()) {
      setFormError("Veuillez renseigner les coordonnées complètes du destinataire.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newParcel = await api.createParcel({
        origin_office: originOffice,
        destination_office: destOffice,
        sender_name: senderName,
        sender_phone: senderPhone,
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        description: description,
        weight_kg: estimatedWeight,
        fee: '0',
      });
      setCreateSuccess(newParcel);
      setRecipientName('');
      setRecipientPhone('');
      loadMyParcels();
    } catch (err: any) {
      setFormError("Erreur lors de la création de la demande : " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status progression stages
  const stages = [
    { key: 'PENDING_DROPOFF', label: t.PENDING_DROPOFF },
    { key: 'INTAKE', label: t.INTAKE },
    { key: 'DISPATCHED', label: t.DISPATCHED },
    { key: 'ARRIVED', label: t.ARRIVED },
    { key: 'DELIVERED', label: t.DELIVERED },
  ];

  const getStageIndex = (status: string) => {
    return stages.findIndex(s => s.key === status);
  };

  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Tracking Banner */}
      <div className="relative bg-gradient-to-br from-brand-black via-gray-900 to-red-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl overflow-hidden border border-gray-800">
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 text-red-300 text-xs font-bold border border-red-500/30 mb-4">
            <MapPin className="w-3.5 h-3.5 text-brand-red" />
            Liaison Rapide Alger ⮀ El Eulma
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3">
            {t.trackTitle}
          </h1>
          <p className="text-gray-300 text-sm sm:text-base mb-8">
            {t.trackSubtitle}
          </p>

          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder={t.trackingPlaceholder}
                className="w-full px-5 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-gray-400 font-mono text-sm focus:ring-2 focus:ring-brand-red focus:bg-white/20 outline-none transition"
              />
              <Search className="w-5 h-5 text-gray-400 absolute right-4 top-4 pointer-events-none" />
            </div>
            <button
              type="submit"
              disabled={loadingTrack}
              className="px-8 py-4 bg-brand-red hover:bg-brand-darkred disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-red-600/40 transition transform active:scale-95 flex items-center justify-center gap-2"
            >
              {loadingTrack ? 'Recherche...' : t.trackButton}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {trackingError && (
            <div className="mt-4 p-3 bg-red-900/40 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-center gap-2 max-w-xl">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{trackingError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tracked Parcel Result Card */}
      {trackedParcel && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-200 animate-fadeIn">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-gray-100 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Colis identifié</span>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                  trackedParcel.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                  trackedParcel.status === 'ARRIVED' ? 'bg-purple-100 text-purple-800' :
                  trackedParcel.status === 'DISPATCHED' ? 'bg-blue-100 text-blue-800' :
                  trackedParcel.status === 'INTAKE' ? 'bg-amber-100 text-amber-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {t[trackedParcel.status] || trackedParcel.status}
                </span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 font-mono mt-1">
                {trackedParcel.tracking_number}
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
              <BarcodeDisplay svg={trackedParcel.barcode_svg} code={trackedParcel.tracking_number} />
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="py-8">
            <div className="relative">
              {/* Line */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-0" />
              <div 
                className="absolute top-5 left-0 h-1 bg-brand-red transition-all duration-500 -z-0"
                style={{
                  width: `${(Math.max(0, getStageIndex(trackedParcel.status)) / (stages.length - 1)) * 100}%`
                }}
              />

              {/* Dots */}
              <div className="flex justify-between relative z-10">
                {stages.map((stage, idx) => {
                  const currentIdx = getStageIndex(trackedParcel.status);
                  const isCompleted = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div key={stage.key} className="flex flex-col items-center text-center max-w-[100px]">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition ${
                        isCurrent ? 'bg-brand-red text-white ring-4 ring-red-100 shadow-md scale-110' :
                        isCompleted ? 'bg-black text-white' :
                        'bg-white border-2 border-gray-300 text-gray-400'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>
                      <span className={`text-[11px] font-semibold mt-2 ${isCurrent ? 'text-brand-red font-bold' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Routing & Parties info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100 text-sm">
            <div className="p-4 bg-gray-50 rounded-2xl">
              <span className="text-xs font-bold text-gray-400 uppercase">Trajet & Agences</span>
              <div className="mt-2 flex items-center gap-2 font-bold text-gray-900">
                <span>{trackedParcel.origin_name_fr}</span>
                <ArrowRight className="w-4 h-4 text-brand-red" />
                <span>{trackedParcel.destination_name_fr}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Nature: {trackedParcel.description}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl">
              <span className="text-xs font-bold text-gray-400 uppercase">Destinataire</span>
              <p className="font-bold text-gray-900 mt-1">{trackedParcel.recipient_name}</p>
              <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                {trackedParcel.recipient_phone}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl">
              <span className="text-xs font-bold text-gray-400 uppercase">Règlement & Frais</span>
              <p className="font-black text-lg text-brand-red mt-1">{trackedParcel.fee} DZD</p>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-0.5 ${
                trackedParcel.is_paid ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {trackedParcel.is_paid ? 'Réglé' : 'À régler au retrait'}
              </span>
            </div>
          </div>

          {/* Scan History Events */}
          {trackedParcel.scan_events && trackedParcel.scan_events.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Historique des Scans & Traçabilité</h4>
              <div className="space-y-2">
                {trackedParcel.scan_events.map((ev, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-xs">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-brand-red" />
                      <div>
                        <strong className="text-gray-900">{ev.event_type}</strong> à <span>{ev.office_name_fr}</span>
                        {ev.notes && <span className="text-gray-500 block text-[11px]">{ev.notes}</span>}
                      </div>
                    </div>
                    <span className="text-gray-400 font-mono">{new Date(ev.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Two Column Layout: Request Transfer Form + My Parcels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form: Request Transfer */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-200">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-900">{t.requestTransfer}</h2>
            <p className="text-gray-500 text-sm mt-1">{t.requestSubtitle}</p>
          </div>

          {createSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-900 text-sm">
              <div className="flex items-center gap-2 font-bold mb-1">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Demande enregistrée avec succès !
              </div>
              <p>Numéro de suivi généré : <strong className="font-mono text-base">{createSuccess.tracking_number}</strong></p>
              <p className="text-xs text-green-800 mt-2 bg-green-100 p-2.5 rounded-xl">
                {t.dropoffInstruction}
              </p>
            </div>
          )}

          {formError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-900 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleCreateRequest} className="space-y-5">
            {/* Route Selection (Strictly Alger & El Eulma) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  {t.originBranch}
                </label>
                <select
                  value={originOffice}
                  onChange={(e) => setOriginOffice(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-brand-red outline-none"
                >
                  <option value="ALG">{t.algiersOffice}</option>
                  <option value="EUL">{t.elEulmaOffice}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  {t.destinationBranch}
                </label>
                <select
                  value={destOffice}
                  onChange={(e) => setDestOffice(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-brand-red outline-none"
                >
                  <option value="EUL">{t.elEulmaOffice}</option>
                  <option value="ALG">{t.algiersOffice}</option>
                </select>
              </div>
            </div>

            {/* Sender (Pre-filled for Karim) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{t.senderName}</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-brand-red"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{t.senderPhone}</label>
                <input
                  type="tel"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-brand-red"
                />
              </div>
            </div>

            {/* Recipient */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{t.recipientName} *</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Ex: Yacine Mansouri"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-brand-red"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{t.recipientPhone} *</label>
                <input
                  type="tel"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="Ex: 0662 00 00 00"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-brand-red"
                />
              </div>
            </div>

            {/* Description & Weight */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">{t.description}</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-brand-red"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{t.estimatedWeight}</label>
                <input
                  type="number"
                  step="0.1"
                  value={estimatedWeight}
                  onChange={(e) => setEstimatedWeight(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-brand-red"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-brand-red hover:bg-brand-darkred disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-xl shadow-red-600/30 transition transform active:scale-98 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Envoi...' : t.submitRequest}
            </button>
          </form>
        </div>

        {/* Right Card: My Parcels List */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-200 flex flex-col">
          <div className="mb-4">
            <h3 className="text-xl font-black text-gray-900">{t.myParcelsTitle}</h3>
            <p className="text-xs text-gray-500">Connecté en tant que Karim Benali (0661123456)</p>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px]">
            {myParcels.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">Aucun colis enregistré pour l'instant.</p>
            ) : (
              myParcels.map((parcel) => (
                <div
                  key={parcel.tracking_number}
                  onClick={() => {
                    setSearchCode(parcel.tracking_number);
                    setTrackedParcel(parcel);
                  }}
                  className="p-4 bg-gray-50 hover:bg-red-50/50 border border-gray-200 hover:border-red-200 rounded-2xl cursor-pointer transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono font-bold text-xs text-gray-900">
                      {parcel.tracking_number}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-gray-200 text-gray-700">
                      {t[parcel.status] || parcel.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Vers: <strong>{parcel.recipient_name}</strong></span>
                    <span className="font-bold text-brand-red">{parcel.fee} DZD</span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1 flex justify-between">
                    <span>{parcel.origin_office} ➔ {parcel.destination_office}</span>
                    <span>{new Date(parcel.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
