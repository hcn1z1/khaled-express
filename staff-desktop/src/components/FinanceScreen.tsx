'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, ShieldAlert, PlusCircle, RefreshCw, AlertCircle, CheckCircle2, PieChart, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { Language, UserProfile, PaymentEntry, ExpenseEntry, Parcel } from '../lib/types';
import { staffTranslations } from '../lib/i18n';
import { getFinanceSummary, getPayments, getExpenses, createPayment, createExpense } from '../lib/api';

interface FinanceScreenProps {
  lang: Language;
  currentUser: UserProfile;
  parcels: Parcel[];
}

export default function FinanceScreen({ lang, currentUser, parcels }: FinanceScreenProps) {
  const isAdmin = currentUser.role === 'ADMIN';

  // Guard rendered before the admin screen so hooks stay unconditional
  if (!isAdmin) {
    return <FinanceForbidden lang={lang} currentUser={currentUser} />;
  }

  return <FinanceAdmin lang={lang} parcels={parcels} />;
}

function FinanceForbidden({ lang, currentUser }: { lang: Language; currentUser: UserProfile }) {
  const t = staffTranslations[lang];
  return (
    <div className="bg-dark-900 border border-red-900/60 p-12 rounded-3xl text-center max-w-xl mx-auto my-12 shadow-2xl animate-in zoom-in-95">
      <div className="w-16 h-16 rounded-2xl bg-red-950/60 text-red-500 border border-red-800/60 flex items-center justify-center mx-auto mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-black text-white mb-2">
        {t.finance_admin_only}
      </h3>
      <p className="text-xs text-gray-400 mb-6">
        {t.moderator_forbidden}
      </p>
      <span className="text-[11px] font-mono px-3 py-1 bg-dark-800 rounded-lg text-gray-400 border border-dark-700">
        Rôle actuel : Opérateur / Modérateur ({currentUser.full_name || currentUser.phone_number})
      </span>
    </div>
  );
}

function FinanceAdmin({ lang, parcels }: { lang: Language; parcels: Parcel[] }) {
  const t = staffTranslations[lang];

  // Admin Finance Data
  const [summary, setSummary] = useState<any>(null);
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'payments' | 'expenses'>('payments');

  // Modals for entries
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // New Payment state
  const [selectedParcelId, setSelectedParcelId] = useState<number>(parcels[0]?.id || 0);
  const [paymentAmount, setPaymentAmount] = useState('500.00');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BARIDIMOB' | 'CHECK'>('CASH');
  const [paymentRef, setPaymentRef] = useState('');

  // New Expense state
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<'FUEL' | 'RENT' | 'MAINTENANCE' | 'SALARY' | 'SUPPLIES' | 'OTHER'>('FUEL');
  const [expenseDesc, setExpenseDesc] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadFinanceData = async () => {
    setLoading(true);
    try {
      const [sumData, payData, expData] = await Promise.all([
        getFinanceSummary(),
        getPayments(),
        getExpenses(),
      ]);
      setSummary(sumData);
      setPayments(payData.results || payData || []);
      setExpenses(expData.results || expData || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinanceData();
  }, []);

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError(null);
    try {
      await createPayment({
        parcel: selectedParcelId,
        amount: paymentAmount,
        payment_method: paymentMethod,
        reference: paymentRef,
      });
      setIsPaymentModalOpen(false);
      setPaymentRef('');
      loadFinanceData();
    } catch (err: any) {
      setActionError(err.message || 'Erreur encaissement');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError(null);
    try {
      await createExpense({
        amount: expenseAmount,
        category: expenseCategory,
        description: expenseDesc,
      });
      setIsExpenseModalOpen(false);
      setExpenseAmount('');
      setExpenseDesc('');
      loadFinanceData();
    } catch (err: any) {
      setActionError(err.message || 'Erreur enregistrement dépense');
    } finally {
      setActionLoading(false);
    }
  };

  const totalReceivedNum = parseFloat(summary?.total_received || '0');
  const totalSpentNum = parseFloat(summary?.total_spent || '0');
  const totalVolume = totalReceivedNum + totalSpentNum;
  const receivedPct = totalVolume > 0 ? Math.round((totalReceivedNum / totalVolume) * 100) : 50;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-brand-400" />
            {t.finance_title}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Supervision de trésorerie, encaissements colis et dépenses opérationnelles (DZD).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadFinanceData}
            className="p-2.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-gray-300 border border-dark-700 transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Encaissement</span>
          </button>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-400 hover:to-brand-300 text-dark-950 rounded-xl text-xs font-black shadow-glow-brand transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-dark-950" />
            <span>+ Dépense</span>
          </button>
        </div>
      </div>

      {/* Metric Cards (Total received, Total spent, Net balance) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Received */}
        <div className="bg-dark-900 border border-dark-750 p-6 rounded-3xl shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-bold uppercase mb-2">
            <span>{t.total_received}</span>
            <span className="p-1 rounded-lg bg-emerald-500/20"><ArrowUpRight className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white">
            {summary?.total_received || '0.00'} <span className="text-sm font-sans text-gray-400">DZD</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            Somme de {payments.length} règlements colis
          </p>
        </div>

        {/* Total Spent */}
        <div className="bg-dark-900 border border-dark-750 p-6 rounded-3xl shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs text-red-400 font-bold uppercase mb-2">
            <span>{t.total_spent}</span>
            <span className="p-1 rounded-lg bg-red-500/20"><ArrowDownRight className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white">
            {summary?.total_spent || '0.00'} <span className="text-sm font-sans text-gray-400">DZD</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            Carburant, loyers, entretien ({expenses.length} dépenses)
          </p>
        </div>

        {/* Net Balance */}
        <div className="bg-dark-900 border border-dark-750 p-6 rounded-3xl shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs text-brand-400 font-bold uppercase mb-2">
            <span>{t.net_balance}</span>
            <span className="p-1 rounded-lg bg-brand-500/20"><Wallet className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-brand-400">
            {summary?.net_balance || '0.00'} <span className="text-sm font-sans text-gray-400">DZD</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            Solde net en caisse
          </p>
        </div>
      </div>

      {/* Visual Revenue vs Expense Distribution Bar */}
      <div className="bg-dark-900 border border-dark-750 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center justify-between text-xs font-bold text-gray-300 mb-2">
          <span>Répartition Recettes / Dépenses</span>
          <span className="text-gray-400 font-mono">
            {receivedPct}% Recettes • {100 - receivedPct}% Charges
          </span>
        </div>
        <div className="w-full h-3 bg-dark-950 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${receivedPct}%` }}
            className="bg-emerald-500 h-full transition-all duration-500"
            title="Recettes"
          />
          <div
            style={{ width: `${100 - receivedPct}%` }}
            className="bg-red-500 h-full transition-all duration-500"
            title="Dépenses"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-dark-900 border border-dark-750 rounded-3xl shadow-xl p-6">
        <div className="flex items-center gap-3 border-b border-dark-750 pb-4 mb-6">
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'payments'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-gray-400 hover:text-white hover:bg-dark-800'
            }`}
          >
            {t.tab_payments} ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'expenses'
                ? 'bg-brand-400 text-dark-950 font-black shadow-card'
                : 'text-gray-400 hover:text-white hover:bg-dark-800'
            }`}
          >
            {t.tab_expenses} ({expenses.length})
          </button>
        </div>

        {/* Payments Table */}
        {activeTab === 'payments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-gray-400 uppercase font-bold border-b border-dark-750 text-[11px]">
                <tr>
                  <th className="py-3 px-4">Colis</th>
                  <th className="py-3 px-4">Montant Reçu</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Référence</th>
                  <th className="py-3 px-4">Enregistré par</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      Aucun encaissement enregistré.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-dark-850/50">
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {p.tracking_code}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        +{p.amount} DZD
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {p.payment_method}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-400">
                        {p.reference || '—'}
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {p.recorded_by_detail?.full_name || 'Admin'}
                      </td>
                      <td className="py-3 px-4 text-gray-500 font-mono">
                        {new Date(p.recorded_at).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-DZ')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Expenses Table */}
        {activeTab === 'expenses' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-gray-400 uppercase font-bold border-b border-dark-750 text-[11px]">
                <tr>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4">Montant Dépensé</th>
                  <th className="py-3 px-4">Agence</th>
                  <th className="py-3 px-4">Enregistré par</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      Aucune dépense enregistrée.
                    </td>
                  </tr>
                ) : (
                  expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-dark-850/50">
                      <td className="py-3 px-4 font-medium text-white">
                        {e.description}
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        <span className="px-2 py-0.5 rounded bg-dark-800 text-[10px] font-bold text-brand-400">
                          {e.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-red-400">
                        -{e.amount} DZD
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {e.office_detail?.name_fr || 'Toutes agences'}
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {e.recorded_by_detail?.full_name || 'Admin'}
                      </td>
                      <td className="py-3 px-4 text-gray-500 font-mono">
                        {e.date}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-dark-900 border border-dark-700 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-black text-white mb-2">
              {t.btn_record_payment}
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Ajoutez un encaissement lié au colis. Le statut du colis passera en Payé.
            </p>

            {actionError && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-800 text-red-300 rounded-xl text-xs">
                {actionError}
              </div>
            )}

            <form onSubmit={handleCreatePayment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Colis concerné *
                </label>
                <select
                  value={selectedParcelId}
                  onChange={(e) => setSelectedParcelId(Number(e.target.value))}
                  className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3 py-2 text-white text-xs"
                >
                  {parcels.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.tracking_code} ({p.fee_amount} DZD - {p.sender_name} ➔ {p.recipient_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Montant Reçu (DZD) *
                </label>
                <input
                  type="number"
                  step="50"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3 py-2 text-white text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Mode de règlement
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3 py-2 text-white text-xs"
                >
                  <option value="CASH">Espèces (Cash DZD)</option>
                  <option value="BARIDIMOB">BaridiMob / CCP</option>
                  <option value="CHECK">Chèque</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Référence / Reçu
                </label>
                <input
                  type="text"
                  placeholder="Ex: REC-2026-042 ou N° Transaction BaridiMob"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 py-2.5 bg-dark-800 text-gray-300 rounded-xl text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg"
                >
                  {actionLoading ? 'Enregistrement...' : 'Valider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-dark-900 border border-dark-700 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-black text-white mb-2">
              {t.btn_record_expense}
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Enregistrez une sortie de caisse ou frais opérationnel.
            </p>

            {actionError && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-800 text-red-300 rounded-xl text-xs">
                {actionError}
              </div>
            )}

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Catégorie de dépense *
                </label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as any)}
                  className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3 py-2 text-white text-xs"
                >
                  <option value="FUEL">Carburant navette (Naftal)</option>
                  <option value="RENT">Loyer Agence</option>
                  <option value="MAINTENANCE">Entretien véhicule</option>
                  <option value="SUPPLIES">Fournitures & Étiquettes 80mm</option>
                  <option value="SALARY">Salaires & Primes</option>
                  <option value="OTHER">Autre charge</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Montant (DZD) *
                </label>
                <input
                  type="number"
                  step="50"
                  required
                  placeholder="Ex: 3500.00"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3 py-2 text-white text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Description / Justificatif *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Plein gasoil véhicule Alger - El Eulma"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  className="w-full bg-dark-850 border border-dark-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="flex-1 py-2.5 bg-dark-800 text-gray-300 rounded-xl text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-400 hover:to-brand-300 text-dark-950 rounded-xl text-xs font-black shadow-glow-brand"
                >
                  {actionLoading ? 'Enregistrement...' : 'Valider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
