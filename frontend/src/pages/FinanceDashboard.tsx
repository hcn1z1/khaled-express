import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n';
import { api, FinanceSummary } from '../services/api';
import { 
  DollarSign, TrendingUp, TrendingDown, Wallet, Lock, 
  ShieldAlert, Plus, CheckCircle, Clock, Building2, CreditCard
} from 'lucide-react';

interface FinanceDashboardProps {
  userRole: 'ADMIN' | 'MODERATOR' | 'CUSTOMER';
}

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ userRole }) => {
  const { t } = useI18n();
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add Payment Form
  const [paymentTracking, setPaymentTracking] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentNotes, setPaymentNotes] = useState('Règlement au comptoir');

  // Add Expense Form
  const [expenseOffice, setExpenseOffice] = useState('ALG');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('FUEL');
  const [expenseDesc, setExpenseDesc] = useState('');

  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (userRole === 'ADMIN') {
      loadFinanceData();
    }
  }, [userRole]);

  const loadFinanceData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getFinanceSummary();
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des finances');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentTracking.trim() || !paymentAmount) return;

    try {
      const res = await api.addPayment({
        tracking_number: paymentTracking.trim(),
        amount: Number(paymentAmount),
        payment_method: paymentMethod,
        notes: paymentNotes,
      });
      setFeedback(res.message);
      setPaymentTracking('');
      setPaymentAmount('');
      loadFinanceData();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert("Erreur paiement : " + err.message);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || !expenseDesc.trim()) return;

    try {
      const res = await api.addExpense({
        office: expenseOffice,
        amount: Number(expenseAmount),
        category: expenseCategory,
        description: expenseDesc,
      });
      setFeedback(res.message);
      setExpenseAmount('');
      setExpenseDesc('');
      loadFinanceData();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert("Erreur dépense : " + err.message);
    }
  };

  // 1. RESTRICTION ENFORCEMENT: MODERATOR BLOCKED
  if (userRole !== 'ADMIN') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-10 shadow-xl border border-red-200">
          <div className="w-16 h-16 rounded-2xl bg-red-100 text-brand-red flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Module Financier Réservé aux Administrateurs
          </h2>
          <p className="text-sm text-gray-600 max-w-lg mx-auto mb-6">
            {t.restrictedFinanceMessage}
          </p>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 max-w-md mx-auto text-left flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Règle de séparation des tâches :</strong>
              <p className="mt-0.5">
                Les modérateurs gèrent les opérations logistiques (dépôt, scans, remise) mais n'ont pas accès à la trésorerie ni à la modification des frais.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900">{t.financeTitle}</h1>
            <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-bold font-mono">
              Contrôle Administrateur
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{t.financeSubtitle}</p>
        </div>
      </div>

      {feedback && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-900 text-xs font-semibold flex items-center gap-2 shadow-sm">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Received */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">{t.totalReceived}</span>
            <div className="w-8 h-8 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900">
            {summary ? summary.total_received.toLocaleString() : '0'} <span className="text-base font-bold text-gray-500">DZD</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">Somme cumulée des paiements colis enregistrés</p>
        </div>

        {/* Total Spent */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">{t.totalSpent}</span>
            <div className="w-8 h-8 rounded-xl bg-red-100 text-brand-red flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900">
            {summary ? summary.total_spent.toLocaleString() : '0'} <span className="text-base font-bold text-gray-500">DZD</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">Somme cumulée des charges (carburant, emballages...)</p>
        </div>

        {/* Net Balance */}
        <div className="bg-brand-black text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase">{t.netBalance}</span>
            <div className="w-8 h-8 rounded-xl bg-white/10 text-white flex items-center justify-center">
              <Wallet className="w-4 h-4 text-brand-red" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">
            {summary ? summary.net_balance.toLocaleString() : '0'} <span className="text-base font-bold text-gray-400">DZD</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">Trésorerie nette disponible des deux agences</p>
        </div>
      </div>

      {/* Office Balances Breakdown */}
      {summary?.offices && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-red" />
            Répartition par Agence (Alger vs El Eulma)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.offices.map((off) => (
              <div key={off.code} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex justify-between items-center">
                <div>
                  <strong className="text-gray-900 block">{off.name_fr}</strong>
                  <span className="text-xs text-gray-500">Encaissé: {off.received} DZD | Dépenses: {off.spent} DZD</span>
                </div>
                <div className="text-right">
                  <span className={`text-base font-black ${off.balance >= 0 ? 'text-green-600' : 'text-brand-red'}`}>
                    {off.balance >= 0 ? '+' : ''}{off.balance} DZD
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forms Grid: Add Payment (Parcel-linked) & Add Expense */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* FORM 1: Add Payment Entry */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-black text-gray-900 mb-1">{t.addPaymentTitle}</h3>
          <p className="text-xs text-gray-500 mb-4">
            Permet de solder un colis même après sa livraison physique (règlement a posteriori).
          </p>

          <form onSubmit={handleAddPayment} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Code de suivi du colis *</label>
              <input
                type="text"
                required
                value={paymentTracking}
                onChange={(e) => setPaymentTracking(e.target.value)}
                placeholder="Ex: KE-EUL-ALG-200301"
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-mono text-xs uppercase outline-none focus:bg-white focus:ring-2 focus:ring-brand-red"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Montant perçu (DZD) *</label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Ex: 1400"
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-bold text-sm text-green-700 outline-none focus:bg-white focus:ring-2 focus:ring-brand-red"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">{t.paymentMethod}</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl outline-none"
                >
                  <option value="CASH">{t.cash}</option>
                  <option value="BARIDIMOB">{t.baridimob}</option>
                  <option value="CARD">{t.card}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Remarques / Référence reçu</label>
              <input
                type="text"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl shadow-md transition"
            >
              {t.savePayment}
            </button>
          </form>
        </div>

        {/* FORM 2: Add Expense Entry */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-black text-gray-900 mb-1">{t.addExpenseTitle}</h3>
          <p className="text-xs text-gray-500 mb-4">
            Enregistre une dépense opérationnelle affectée à une agence.
          </p>

          <form onSubmit={handleAddExpense} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Agence concernée</label>
                <select
                  value={expenseOffice}
                  onChange={(e) => setExpenseOffice(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl outline-none"
                >
                  <option value="ALG">Alger (Centre)</option>
                  <option value="EUL">El Eulma (Sétif)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Catégorie</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl outline-none"
                >
                  <option value="FUEL">{t.fuel}</option>
                  <option value="PACKAGING">{t.packaging}</option>
                  <option value="RENT">{t.rent}</option>
                  <option value="SALARY">{t.salary}</option>
                  <option value="OTHER">{t.other}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Montant engagé (DZD) *</label>
              <input
                type="number"
                required
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="Ex: 3500"
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-bold text-sm text-brand-red outline-none focus:bg-white focus:ring-2 focus:ring-brand-red"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Description / Justificatif *</label>
              <input
                type="text"
                required
                value={expenseDesc}
                onChange={(e) => setExpenseDesc(e.target.value)}
                placeholder="Ex: Plein carburant navette transport"
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-red"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-brand-red hover:bg-brand-darkred text-white font-bold rounded-xl shadow-md transition"
            >
              {t.saveExpense}
            </button>
          </form>
        </div>

      </div>

      {/* Recent Transactions Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payments List */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
          <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Derniers règlements perçus</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {summary?.recent_payments.map((p, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-xl text-xs flex justify-between items-center">
                <div>
                  <span className="font-mono font-bold text-gray-900 block">{p.tracking_number}</span>
                  <span className="text-[10px] text-gray-500">{p.payment_method} • {p.notes || 'Sans note'}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-green-700 block">+{p.amount} DZD</span>
                  <span className="text-[10px] text-gray-400">{new Date(p.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
          <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Dernières dépenses enregistrées</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {summary?.recent_expenses.map((e, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-xl text-xs flex justify-between items-center">
                <div>
                  <span className="font-bold text-gray-900 block">{e.description}</span>
                  <span className="text-[10px] text-gray-500">{e.office_name_fr} • {e.category}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-brand-red block">-{e.amount} DZD</span>
                  <span className="text-[10px] text-gray-400">{new Date(e.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
