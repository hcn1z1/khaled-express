import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n';
import { api, Parcel } from '../services/api';
import { BarcodeDisplay } from '../components/BarcodeDisplay';
import { ScannerModal } from '../components/ScannerModal';
import { PrintBonsModal } from '../components/PrintBonsModal';
import { 
  Scan, Search, Plus, Filter, Printer, ArrowRight, 
  CheckCircle, Truck, PackageCheck, AlertCircle, Phone, Tag, Building2
} from 'lucide-react';

interface StaffOperationsProps {
  currentOffice: 'ALG' | 'EUL';
  userRole: 'ADMIN' | 'MODERATOR' | 'CUSTOMER';
  onOpenAi: () => void;
}

export const StaffOperations: React.FC<StaffOperationsProps> = ({ currentOffice, userRole, onOpenAi }) => {
  const { t, language } = useI18n();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [routeFilter, setRouteFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [printParcel, setPrintParcel] = useState<Parcel | null>(null);
  const [intakeModalParcel, setIntakeModalParcel] = useState<Parcel | null>(null);
  const [customFeeInput, setCustomFeeInput] = useState('800');
  const [actionAlert, setActionAlert] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // New counter parcel creation modal
  const [isNewCounterOpen, setIsNewCounterOpen] = useState(false);
  const [newCounterForm, setNewCounterForm] = useState({
    sender_name: '',
    sender_phone: '',
    recipient_name: '',
    recipient_phone: '',
    description: 'Colis comptoir',
    weight_kg: '1.0',
    fee: '800',
    destination_office: currentOffice === 'ALG' ? 'EUL' : 'ALG',
  });

  useEffect(() => {
    loadParcels();
  }, [search, statusFilter, routeFilter]);

  const loadParcels = async () => {
    setLoading(true);
    try {
      const data = await api.getParcels({
        search,
        status: statusFilter,
        route: routeFilter,
      });
      setParcels(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message: string, type: 'success' | 'error' | 'warning') => {
    setActionAlert({ message, type });
    setTimeout(() => setActionAlert(null), 5000);
  };

  // Custody Scan Actions
  const handleIntake = async (trackingNumber: string, feeAmount?: number) => {
    try {
      const res = await api.intakeParcel(trackingNumber, { fee: feeAmount || Number(customFeeInput) });
      showAlert(res.message, 'success');
      setIntakeModalParcel(null);
      loadParcels();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  const handleDispatch = async (trackingNumber: string) => {
    try {
      const res = await api.dispatchParcel(trackingNumber);
      showAlert(res.message, 'success');
      loadParcels();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  const handleArrival = async (trackingNumber: string) => {
    try {
      const res = await api.arriveParcel(trackingNumber, { language });
      showAlert(res.message, 'success');
      loadParcels();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  const handlePickup = async (trackingNumber: string) => {
    try {
      const res = await api.pickupParcel(trackingNumber);
      if (res.unpaid_warning) {
        showAlert(`${res.message} (ATTENTION : Colis remis sans paiement)`, 'warning');
      } else {
        showAlert(res.message, 'success');
      }
      loadParcels();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  const handleScannerScan = (code: string, actionType: 'intake' | 'dispatch' | 'arrive' | 'pickup') => {
    if (actionType === 'intake') {
      const p = parcels.find(x => x.tracking_number === code);
      if (p) setIntakeModalParcel(p);
      else handleIntake(code);
    } else if (actionType === 'dispatch') {
      handleDispatch(code);
    } else if (actionType === 'arrive') {
      handleArrival(code);
    } else if (actionType === 'pickup') {
      handlePickup(code);
    }
  };

  const handleCreateCounterParcel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createParcel({
        origin_office: currentOffice,
        destination_office: newCounterForm.destination_office,
        sender_name: newCounterForm.sender_name,
        sender_phone: newCounterForm.sender_phone,
        recipient_name: newCounterForm.recipient_name,
        recipient_phone: newCounterForm.recipient_phone,
        description: newCounterForm.description,
        weight_kg: newCounterForm.weight_kg,
        fee: newCounterForm.fee,
        status: 'INTAKE', // Directly registered at office counter!
      });
      showAlert(`Colis ${created.tracking_number} enregistré au comptoir avec succès !`, 'success');
      setIsNewCounterOpen(false);
      setPrintParcel(created);
      loadParcels();
    } catch (err: any) {
      showAlert("Erreur : " + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900">{t.staffTitle}</h1>
            <span className="px-2.5 py-1 bg-red-100 text-brand-red rounded-lg text-xs font-bold font-mono">
              {currentOffice === 'ALG' ? 'Agence Alger' : 'Agence El Eulma'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{t.staffSubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-black hover:bg-gray-800 text-white rounded-xl font-bold text-xs shadow-md transition transform active:scale-95"
          >
            <Scan className="w-4 h-4 text-brand-red" />
            <span>Station Scanner</span>
          </button>

          <button
            onClick={() => setIsNewCounterOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-red hover:bg-brand-darkred text-white rounded-xl font-bold text-xs shadow-md transition transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Colis Comptoir</span>
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionAlert && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-sm animate-fadeIn ${
          actionAlert.type === 'success' ? 'bg-green-50 border border-green-200 text-green-900' :
          actionAlert.type === 'warning' ? 'bg-amber-50 border border-amber-200 text-amber-900' :
          'bg-red-50 border border-red-200 text-red-900'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{actionAlert.message}</span>
          </div>
          <button onClick={() => setActionAlert(null)} className="text-xs opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-brand-red"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none"
          >
            <option value="">{t.filterStatus}</option>
            <option value="PENDING_DROPOFF">{t.PENDING_DROPOFF}</option>
            <option value="INTAKE">{t.INTAKE}</option>
            <option value="DISPATCHED">{t.DISPATCHED}</option>
            <option value="ARRIVED">{t.ARRIVED}</option>
            <option value="DELIVERED">{t.DELIVERED}</option>
          </select>

          <select
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none"
          >
            <option value="">{t.filterRoute}</option>
            <option value="ALG_EUL">{t.routeAlgEul}</option>
            <option value="EUL_ALG">{t.routeEulAlg}</option>
          </select>
        </div>
      </div>

      {/* Parcels Operational Table / Cards */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4">Code & Barcode</th>
                <th className="py-3.5 px-4">Ligne & Emplacement</th>
                <th className="py-3.5 px-4">Expéditeur & Destinataire</th>
                <th className="py-3.5 px-4">Frais & Paiement</th>
                <th className="py-3.5 px-4">Statut de Garde</th>
                <th className="py-3.5 px-4 text-right">Actions Opérationnelles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">Chargement des colis...</td>
                </tr>
              ) : parcels.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">Aucun colis correspondant trouvé.</td>
                </tr>
              ) : (
                parcels.map((parcel) => (
                  <tr key={parcel.tracking_number} className="hover:bg-gray-50/80 transition">
                    {/* Code */}
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                      <div>{parcel.tracking_number}</div>
                      <span className="text-[10px] text-gray-400 font-sans">{new Date(parcel.created_at).toLocaleDateString()}</span>
                    </td>

                    {/* Route */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-gray-900">
                        <span>{parcel.origin_office}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-brand-red" />
                        <span>{parcel.destination_office}</span>
                      </div>
                      <span className="text-[11px] text-gray-500">
                        Actuel: {parcel.current_office || 'En transit'}
                      </span>
                    </td>

                    {/* Sender / Recipient */}
                    <td className="py-3.5 px-4">
                      <div><strong className="text-gray-900">{parcel.recipient_name}</strong> ({parcel.recipient_phone})</div>
                      <div className="text-gray-500 text-[11px]">De: {parcel.sender_name}</div>
                    </td>

                    {/* Fee & Payment */}
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-brand-red">{parcel.fee} DZD</div>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        parcel.is_paid ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {parcel.is_paid ? 'Réglé' : 'Non soldé'}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                        parcel.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        parcel.status === 'ARRIVED' ? 'bg-purple-100 text-purple-800' :
                        parcel.status === 'DISPATCHED' ? 'bg-blue-100 text-blue-800' :
                        parcel.status === 'INTAKE' ? 'bg-amber-100 text-amber-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {t[parcel.status] || parcel.status}
                      </span>
                    </td>

                    {/* Operational Action Buttons */}
                    <td className="py-3.5 px-4 text-right space-x-1 space-y-1">
                      {/* Step 1: Physical intake */}
                      {parcel.status === 'PENDING_DROPOFF' && (
                        <button
                          onClick={() => {
                            setIntakeModalParcel(parcel);
                            setCustomFeeInput(parcel.fee || '800');
                          }}
                          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] transition shadow-sm"
                        >
                          Dépôt / Intake
                        </button>
                      )}

                      {/* Step 2: Dispatch from origin office */}
                      {parcel.status === 'INTAKE' && (
                        <button
                          onClick={() => handleDispatch(parcel.tracking_number)}
                          className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] transition shadow-sm"
                        >
                          Expédier navette
                        </button>
                      )}

                      {/* Step 3: Arrival at destination office */}
                      {parcel.status === 'DISPATCHED' && (
                        <button
                          onClick={() => handleArrival(parcel.tracking_number)}
                          className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[11px] transition shadow-sm"
                        >
                          Valider arrivée (SMS)
                        </button>
                      )}

                      {/* Step 4: Handover to recipient (Pickup) */}
                      {parcel.status === 'ARRIVED' && (
                        <button
                          onClick={() => handlePickup(parcel.tracking_number)}
                          className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-[11px] transition shadow-sm"
                        >
                          Remise client
                        </button>
                      )}

                      {/* Print documents button */}
                      <button
                        onClick={() => setPrintParcel(parcel)}
                        className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold text-[11px] transition inline-flex items-center gap-1 border border-gray-200"
                        title="Imprimer ticket / bons"
                      >
                        <Printer className="w-3 h-3 text-brand-red" />
                        <span>Imprimer</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Intake Modal with Fee Customization */}
      {intakeModalParcel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Enregistrement physique en agence (Intake)
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Colis: <strong className="font-mono">{intakeModalParcel.tracking_number}</strong>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Fixer les frais d'envoi personnalisés (DZD) :
                </label>
                <input
                  type="number"
                  value={customFeeInput}
                  onChange={(e) => setCustomFeeInput(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl font-bold text-brand-red text-lg outline-none focus:bg-white focus:ring-2 focus:ring-brand-red"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1 text-gray-600">
                <div className="flex justify-between">
                  <span>Agence de dépôt :</span>
                  <strong>{intakeModalParcel.origin_office}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Destination :</span>
                  <strong>{intakeModalParcel.destination_office}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Destinataire :</span>
                  <strong>{intakeModalParcel.recipient_name}</strong>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIntakeModalParcel(null)}
                  className="flex-1 py-3 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => handleIntake(intakeModalParcel.tracking_number, Number(customFeeInput))}
                  className="flex-1 py-3 text-xs font-bold text-white bg-brand-red hover:bg-brand-darkred rounded-xl transition shadow-md"
                >
                  Valider l'Intake
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Counter Parcel Modal */}
      {isNewCounterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl max-w-xl w-full border border-gray-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black text-gray-900 mb-1">
              Création & Enregistrement au Comptoir
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Enregistre immédiatement le colis en INTAKE à l'agence {currentOffice === 'ALG' ? 'd\'Alger' : 'd\'El Eulma'}.
            </p>

            <form onSubmit={handleCreateCounterParcel} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Expéditeur (Nom)</label>
                  <input
                    type="text"
                    required
                    value={newCounterForm.sender_name}
                    onChange={(e) => setNewCounterForm({ ...newCounterForm, sender_name: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none"
                    placeholder="Nom du client"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Expéditeur (Tél)</label>
                  <input
                    type="tel"
                    required
                    value={newCounterForm.sender_phone}
                    onChange={(e) => setNewCounterForm({ ...newCounterForm, sender_phone: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none"
                    placeholder="0550 00 00 00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Destinataire (Nom)</label>
                  <input
                    type="text"
                    required
                    value={newCounterForm.recipient_name}
                    onChange={(e) => setNewCounterForm({ ...newCounterForm, recipient_name: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none"
                    placeholder="Nom du destinataire"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Destinataire (Tél)</label>
                  <input
                    type="tel"
                    required
                    value={newCounterForm.recipient_phone}
                    onChange={(e) => setNewCounterForm({ ...newCounterForm, recipient_phone: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none"
                    placeholder="0660 00 00 00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={newCounterForm.description}
                    onChange={(e) => setNewCounterForm({ ...newCounterForm, description: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Poids (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newCounterForm.weight_kg}
                    onChange={(e) => setNewCounterForm({ ...newCounterForm, weight_kg: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <label className="block font-extrabold text-brand-darkred mb-1">
                  Frais personnalisés appliqués (DZD) :
                </label>
                <input
                  type="number"
                  required
                  value={newCounterForm.fee}
                  onChange={(e) => setNewCounterForm({ ...newCounterForm, fee: e.target.value })}
                  className="w-full p-2.5 bg-white border border-red-300 rounded-xl font-black text-brand-red text-base outline-none"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsNewCounterOpen(false)}
                  className="flex-1 py-3 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-bold text-white bg-brand-red hover:bg-brand-darkred rounded-xl transition shadow-md"
                >
                  Créer et Imprimer Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scanner Modal */}
      {isScannerOpen && (
        <ScannerModal
          onClose={() => setIsScannerOpen(false)}
          onScanComplete={handleScannerScan}
          recentCodes={parcels.map(p => p.tracking_number)}
        />
      )}

      {/* Print Bons Modal */}
      {printParcel && (
        <PrintBonsModal
          parcel={printParcel}
          onClose={() => setPrintParcel(null)}
        />
      )}
    </div>
  );
};
