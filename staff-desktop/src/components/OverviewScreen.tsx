'use client';

import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Package, Clock, Truck, MapPin, Wallet, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { Language, UserProfile, Parcel, PaymentEntry } from '../lib/types';
import { staffTranslations } from '../lib/i18n';
import { getPayments } from '../lib/api';
import { StatusBadge, StatCard, Card } from './ui';

interface OverviewScreenProps {
  lang: Language;
  currentUser: UserProfile;
  parcels: Parcel[];
  loading: boolean;
  onRefresh: () => void;
}

export default function OverviewScreen({ lang, currentUser, parcels, loading, onRefresh }: OverviewScreenProps) {
  const t = staffTranslations[lang];
  const isAdmin = currentUser.role === 'ADMIN';
  const [todayCash, setTodayCash] = useState<number | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    getPayments()
      .then((res: PaymentEntry[] | { results: PaymentEntry[] }) => {
        const payments = Array.isArray(res) ? res : res.results || [];
        const today = new Date().toDateString();
        const sum = payments
          .filter((p) => new Date(p.recorded_at).toDateString() === today)
          .reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
        setTodayCash(sum);
      })
      .catch(console.error);
  }, [isAdmin, parcels.length]);

  const today = new Date().toDateString();
  const todayParcels = parcels.filter((p) => new Date(p.created_at).toDateString() === today);
  const activeParcels = parcels.filter((p) => p.status !== 'DELIVERED' && p.status !== 'CANCELLED');

  const countBy = (status: string) => activeParcels.filter((p) => p.status === status).length;
  const unpaidCount = activeParcels.filter((p) => p.payment_status !== 'PAID').length;

  const recent = [...parcels]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  interface KpiItem {
    label: string;
    value: string | number;
    icon: any;
    accent: 'zinc' | 'blue' | 'amber' | 'brand' | 'emerald';
    unit?: string;
  }

  const kpis: KpiItem[] = [
    { label: t.today_kpi_total, value: todayParcels.length, icon: Package, accent: 'zinc' },
    { label: t.today_kpi_awaiting, value: countBy('REQUESTED'), icon: Clock, accent: 'brand' },
    { label: t.today_kpi_transit, value: countBy('DISPATCHED'), icon: Truck, accent: 'blue' },
    { label: t.today_kpi_ready, value: countBy('RECEIVED_AT_DESTINATION'), icon: MapPin, accent: 'amber' },
    { label: t.today_kpi_unpaid, value: unpaidCount, icon: AlertCircle, accent: 'brand' },
  ];
  if (isAdmin) {
    kpis.push({
      label: t.today_kpi_cash,
      value: todayCash === null ? '…' : todayCash.toLocaleString('fr-DZ'),
      icon: Wallet,
      accent: 'emerald',
      unit: 'DZD',
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-brand-500" />
            {t.today_title}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {new Date().toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-DZ', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}{' '}
            — {t.today_subtitle}
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="p-2.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-300 border border-dark-700 transition-colors self-start"
          title="Rafraîchir"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* KPI cards (Shadcn StatCard template) */}
      <div className={`grid grid-cols-2 ${isAdmin ? 'lg:grid-cols-6' : 'lg:grid-cols-5'} sm:grid-cols-3 gap-4`}>
        {kpis.map((kpi) => (
          <StatCard
            key={kpi.label}
            title={kpi.label}
            value={kpi.value}
            unit={kpi.unit}
            icon={kpi.icon}
            accent={kpi.accent}
          />
        ))}
      </div>

      {/* Recent parcels */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">{t.today_recent_title}</h3>
          <span className="text-[11px] text-slate-500 font-mono">
            {t.today_all_active} : {activeParcels.length}
          </span>
        </div>

        {loading && parcels.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-xs">{t.parcels_loading}</div>
        ) : recent.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-xs">{t.parcels_empty}</div>
        ) : (
          <div className="space-y-2.5">
            {recent.map((parcel) => (
              <div
                key={parcel.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-dark-850 border border-dark-750 text-xs hover:border-dark-600 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono font-bold text-white truncate">{parcel.tracking_code}</span>
                  <span className="hidden sm:flex items-center gap-1.5 text-slate-300 shrink-0">
                    {parcel.origin_office_detail?.code === 'ALGIERS' ? 'Alger' : 'El Eulma'}
                    <ArrowRight className="w-3 h-3 text-slate-500 rtl:rotate-180" />
                    {parcel.destination_office_detail?.code === 'ALGIERS' ? 'Alger' : 'El Eulma'}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-slate-400 font-mono hidden md:inline">{parcel.fee_amount} DZD</span>
                  <StatusBadge status={parcel.status} lang={lang} />
                  <span className="text-slate-500 font-mono text-[11px] hidden lg:inline">
                    {new Date(parcel.created_at).toLocaleTimeString(lang === 'ar' ? 'ar-DZ' : 'fr-DZ', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
