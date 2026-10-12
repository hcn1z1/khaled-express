'use client';

import React, { useState } from 'react';
import { Search, Filter, Printer, Tag, FileText, CheckSquare, ArrowRight, RefreshCw, PlusCircle, CheckCircle2, Copy, Check } from 'lucide-react';
import { Parcel, Language, UserProfile } from '../lib/types';
import { staffTranslations } from '../lib/i18n';

interface ParcelListProps {
  parcels: Parcel[];
  loading: boolean;
  lang: Language;
  currentUser: UserProfile;
  onRefresh: () => void;
  onOpenPrint: (parcel: Parcel, doc: 'ticket' | 'intake' | 'pickup') => void;
  onOpenIntake: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  routeFilter: string;
  setRouteFilter: (r: string) => void;
}

export default function ParcelList({
  parcels,
  loading,
  lang,
  currentUser,
  onRefresh,
  onOpenPrint,
  onOpenIntake,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  routeFilter,
  setRouteFilter
}: ParcelListProps) {
  const t = staffTranslations[lang];
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyCode = (parcel: Parcel) => {
    navigator.clipboard.writeText(parcel.tracking_code);
    setCopiedId(parcel.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Livré</span>;
      case 'RECEIVED_AT_DESTINATION':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">Prêt au retrait</span>;
      case 'DISPATCHED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">En transit</span>;
      case 'RECEIVED_AT_ORIGIN':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-brand-500/20 text-brand-400 border border-brand-500/30">Au départ</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-gray-500/20 text-gray-400 border border-gray-500/30">Attente dépôt</span>;
    }
  };

  const statusTabs = [
    { key: '', label: 'Tous' },
    { key: 'REQUESTED', label: 'Attente' },
    { key: 'RECEIVED_AT_ORIGIN', label: 'Au départ' },
    { key: 'DISPATCHED', label: 'En transit' },
    { key: 'RECEIVED_AT_DESTINATION', label: 'À destination' },
    { key: 'DELIVERED', label: 'Livrés' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Filter and Controls Bar */}
      <div className="bg-dark-900 border border-dark-750 p-5 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Global Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search_placeholder}
              className="w-full bg-dark-950 border border-dark-700 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Route Filter & Actions */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <select
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              className="bg-dark-950 border border-dark-700 text-xs font-semibold rounded-xl px-3 py-2.5 text-gray-300 focus:outline-none focus:border-brand-500"
            >
              <option value="">{t.filter_route}</option>
              <option value="ALG_TO_EUL">{t.route_alg_eul}</option>
              <option value="EUL_TO_ALG">{t.route_eul_alg}</option>
            </select>

            <button
              onClick={onRefresh}
              className="p-2.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-gray-300 border border-dark-700 transition-colors"
              title="Rafraîchir"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onOpenIntake}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nouveau Colis</span>
            </button>
          </div>
        </div>

        {/* Quick status filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-dark-800 pt-3">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === tab.key
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'bg-dark-850 hover:bg-dark-800 text-gray-400 hover:text-white border border-dark-750'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Parcels Table */}
      <div className="bg-dark-900 border border-dark-750 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-950 text-gray-400 uppercase font-bold border-b border-dark-750 text-[11px]">
              <tr>
                <th className="py-4 px-5">{t.col_tracking}</th>
                <th className="py-4 px-4">{t.col_route}</th>
                <th className="py-4 px-4">{t.col_sender}</th>
                <th className="py-4 px-4">{t.col_recipient}</th>
                <th className="py-4 px-4">{t.col_status}</th>
                <th className="py-4 px-4">{t.col_fee}</th>
                <th className="py-4 px-4">{t.col_payment}</th>
                <th className="py-4 px-5 text-right">{t.col_actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {loading && parcels.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-500">
                    Chargement des colis...
                  </td>
                </tr>
              ) : parcels.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-500">
                    Aucun colis ne correspond aux critères de recherche.
                  </td>
                </tr>
              ) : (
                parcels.map((parcel) => (
                  <tr key={parcel.id} className="hover:bg-dark-850/60 transition-colors group">
                    {/* Tracking Code */}
                    <td className="py-3.5 px-5 font-mono font-bold text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>{parcel.tracking_code}</span>
                        <button
                          type="button"
                          onClick={() => copyCode(parcel)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-dark-750 text-gray-400 hover:text-white transition-opacity"
                          title="Copier le code"
                        >
                          {copiedId === parcel.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <span className="block text-[10px] text-gray-500 font-normal">
                        {parcel.description} • {parcel.weight_kg} kg
                      </span>
                    </td>

                    {/* Route */}
                    <td className="py-3.5 px-4 font-semibold text-gray-200 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{parcel.origin_office_detail?.code === 'ALGIERS' ? 'Alger' : 'El Eulma'}</span>
                        <ArrowRight className="w-3 h-3 text-gray-500" />
                        <span>{parcel.destination_office_detail?.code === 'ALGIERS' ? 'Alger' : 'El Eulma'}</span>
                      </div>
                    </td>

                    {/* Sender */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-white">{parcel.sender_name}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{parcel.sender_phone}</div>
                    </td>

                    {/* Recipient */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-white">{parcel.recipient_name}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{parcel.recipient_phone}</div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(parcel.status)}
                    </td>

                    {/* Fee */}
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-400 whitespace-nowrap">
                      {parcel.fee_amount} DZD
                    </td>

                    {/* Payment status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        parcel.payment_status === 'PAID'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {parcel.payment_status === 'PAID' ? 'Payé' : 'Non payé'}
                      </span>
                    </td>

                    {/* Action buttons (Print 80mm, Intake Bon, Pickup Bon) */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenPrint(parcel, 'ticket')}
                          className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-300 border border-dark-700 hover:text-white transition-colors"
                          title="Ticket 80 mm Code 128"
                        >
                          <Tag className="w-3.5 h-3.5 text-brand-400" />
                        </button>
                        <button
                          onClick={() => onOpenPrint(parcel, 'intake')}
                          className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-300 border border-dark-700 hover:text-white transition-colors"
                          title="Bon de Dépôt Expéditeur"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-400" />
                        </button>
                        <button
                          onClick={() => onOpenPrint(parcel, 'pickup')}
                          className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-gray-300 border border-dark-700 hover:text-white transition-colors"
                          title="Bon de Retrait Destinataire"
                        >
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
