'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, ArrowRight, PlusCircle, Search, RefreshCw, ScanLine } from 'lucide-react';
import { translations } from '@/lib/i18n';
import { getMyParcels } from '@/lib/api';
import { Parcel } from '@/types';
import { useSite } from '@/lib/site-context';
import { Button, EmptyState, SkeletonRows, StatusBadge, Card, StatCard, Badge } from '@/components/ui';
import { STATUS_META, statusMeta } from '@/lib/status';

export default function CustomerDashboard() {
  const { lang, openTransfer } = useSite();
  const t = translations[lang];
  const router = useRouter();

  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadParcels = async () => {
    setLoading(true);
    try {
      const res = await getMyParcels();
      setParcels(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParcels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = parcels
    .filter(
      (p) =>
        p.tracking_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.recipient_phone.includes(searchTerm),
    )
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

  // Summary counts by status
  const summary = Object.entries(STATUS_META)
    .filter(([key]) => key !== 'CANCELLED')
    .map(([key, meta]) => ({
      status: key,
      count: parcels.filter((p) => p.status === key).length,
      meta,
    }))
    .filter((s) => s.count > 0 || s.status === 'REQUESTED');

  return (
    <section aria-labelledby="dashboard-heading" className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 id="dashboard-heading" className="text-2xl sm:text-3xl font-black text-white">
            {t.my_parcels_title}
          </h2>
          <p className="text-xs text-slate-400 mt-1">{t.my_parcels_desc}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadParcels}
            aria-label={t.refresh_btn}
            title={t.refresh_btn}
            className="p-2.5 rounded-xl bg-dark-900 hover:bg-dark-850 border border-dark-800 text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Button onClick={openTransfer} icon={PlusCircle}>
            {t.request_transfer_btn}
          </Button>
        </div>
      </div>

      {/* Status summary cards (Shadcn StatCard template) */}
      {!loading && parcels.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {summary.map((s) => {
            const Icon = s.meta.icon;
            const accent =
              s.status === 'DELIVERED'
                ? 'brand'
                : s.status === 'DISPATCHED'
                ? 'blue'
                : s.status === 'RECEIVED_AT_DESTINATION'
                ? 'amber'
                : 'brand';
            return (
              <StatCard
                key={s.status}
                title={(translations[lang] as Record<string, string>)[s.meta.shortKey]}
                value={s.count}
                icon={Icon}
                accent={accent}
              />
            );
          })}
        </div>
      )}

      {/* Search Filter */}
      <div className="mb-6 relative max-w-md">
        <label htmlFor="customer-search-input" className="sr-only">
          {t.filter_placeholder}
        </label>
        <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          id="customer-search-input"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t.filter_placeholder}
          aria-label={t.filter_placeholder}
          className="w-full bg-dark-900 border border-dark-800 rounded-xl ps-10 pe-4 py-2.5 text-white text-xs placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </div>

      {/* Parcels List */}
      {loading ? (
        <SkeletonRows rows={3} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title={t.no_parcels_yet}
          desc={t.no_parcels_desc}
          action={
            <Button onClick={openTransfer} icon={PlusCircle} size="lg">
              {t.request_transfer_btn}
            </Button>
          }
          className="max-w-lg mx-auto"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((parcel) => (
            <Card
              key={parcel.id}
              className="p-5 hover:border-brand-600/50 flex flex-col justify-between group shadow-card hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between mb-3 gap-2">
                  <span className="font-mono text-xs font-bold text-brand-400">{parcel.tracking_code}</span>
                  <StatusBadge status={parcel.status} lang={lang} short />
                </div>

                <div className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <span>{parcel.origin_office_detail?.code === 'ALGIERS' ? 'Alger' : 'El Eulma'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 rtl:rotate-180" />
                  <span>{parcel.destination_office_detail?.code === 'ALGIERS' ? 'Alger' : 'El Eulma'}</span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <p>
                    {t.recipient_label} : <span className="text-white font-medium">{parcel.recipient_name}</span>{' '}
                    <span className="font-mono" dir="ltr">({parcel.recipient_phone})</span>
                  </p>
                  <p>
                    {t.content_label} : <span className="text-slate-300">{parcel.description}</span>
                  </p>
                  <p>
                    {t.fee} : <span className="text-brand-400 font-bold">{parcel.fee_amount} DZD</span> (
                    {parcel.payment_status === 'PAID' ? t.paid : t.unpaid})
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-dark-750 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {new Date(parcel.created_at).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-DZ')}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => router.push(`/suivi/${parcel.tracking_code}`)}
                  icon={ScanLine}
                >
                  {t.nav_track}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
