import { Language, staffTranslations } from './i18n';
import { Clock, Package, Truck, MapPin, CheckCircle2, XCircle, LucideIcon } from 'lucide-react';

export type ParcelStatus =
  | 'REQUESTED'
  | 'RECEIVED_AT_ORIGIN'
  | 'DISPATCHED'
  | 'RECEIVED_AT_DESTINATION'
  | 'DELIVERED'
  | 'CANCELLED';

export interface StatusMeta {
  labelKey: string;
  icon: LucideIcon;
  badge: string;
  text: string;
}

export const STATUS_META: Record<ParcelStatus, StatusMeta> = {
  REQUESTED: {
    labelKey: 'status_requested',
    icon: Clock,
    badge: 'bg-zinc-500/15 text-zinc-300 border border-zinc-500/30',
    text: 'text-zinc-300',
  },
  RECEIVED_AT_ORIGIN: {
    labelKey: 'status_received_origin',
    icon: Package,
    badge: 'bg-brand-500/15 text-brand-400 border border-brand-500/30',
    text: 'text-brand-400',
  },
  DISPATCHED: {
    labelKey: 'status_dispatched',
    icon: Truck,
    badge: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    text: 'text-blue-400',
  },
  RECEIVED_AT_DESTINATION: {
    labelKey: 'status_received_dest',
    icon: MapPin,
    badge: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    text: 'text-amber-300',
  },
  DELIVERED: {
    labelKey: 'status_delivered',
    icon: CheckCircle2,
    badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    text: 'text-emerald-400',
  },
  CANCELLED: {
    labelKey: 'status_cancelled',
    icon: XCircle,
    badge: 'bg-red-500/15 text-red-400 border border-red-500/30',
    text: 'text-red-400',
  },
};

export function statusMeta(status: string): StatusMeta {
  return STATUS_META[status as ParcelStatus] ?? STATUS_META.REQUESTED;
}

export function statusLabel(status: string, lang: Language): string {
  const meta = statusMeta(status);
  const dict = staffTranslations[lang] as Record<string, string>;
  return dict[meta.labelKey] ?? status;
}

/** Status tabs for ParcelList filters */
export const STATUS_TABS: { key: string; labelKey: string }[] = [
  { key: '', labelKey: 'filter_all_status' },
  { key: 'REQUESTED', labelKey: 'status_requested' },
  { key: 'RECEIVED_AT_ORIGIN', labelKey: 'status_received_origin' },
  { key: 'DISPATCHED', labelKey: 'status_dispatched' },
  { key: 'RECEIVED_AT_DESTINATION', labelKey: 'status_received_dest' },
  { key: 'DELIVERED', labelKey: 'status_delivered' },
];
