import { Language, translations } from './i18n';
import { Clock, Package, Truck, MapPin, CheckCircle2, XCircle, LucideIcon } from 'lucide-react';

export type ParcelStatus =
  | 'REQUESTED'
  | 'RECEIVED_AT_ORIGIN'
  | 'DISPATCHED'
  | 'RECEIVED_AT_DESTINATION'
  | 'DELIVERED'
  | 'CANCELLED';

export interface StatusMeta {
  labelKey: keyof typeof translations.fr;
  shortKey: keyof typeof translations.fr;
  icon: LucideIcon;
  /** Badge container classes */
  badge: string;
  /** Accent text color */
  text: string;
  order: number;
}

export const STATUS_META: Record<ParcelStatus, StatusMeta> = {
  REQUESTED: {
    labelKey: 'status_requested',
    shortKey: 'status_requested_short',
    icon: Clock,
    badge: 'bg-zinc-500/15 text-zinc-300 border border-zinc-500/30',
    text: 'text-zinc-300',
    order: 0,
  },
  RECEIVED_AT_ORIGIN: {
    labelKey: 'status_received_origin',
    shortKey: 'status_received_origin_short',
    icon: Package,
    badge: 'bg-brand-500/15 text-brand-400 border border-brand-500/30',
    text: 'text-brand-400',
    order: 1,
  },
  DISPATCHED: {
    labelKey: 'status_dispatched',
    shortKey: 'status_dispatched_short',
    icon: Truck,
    badge: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    text: 'text-blue-400',
    order: 2,
  },
  RECEIVED_AT_DESTINATION: {
    labelKey: 'status_received_dest',
    shortKey: 'status_received_dest_short',
    icon: MapPin,
    badge: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    text: 'text-amber-300',
    order: 3,
  },
  DELIVERED: {
    labelKey: 'status_delivered',
    shortKey: 'status_delivered_short',
    icon: CheckCircle2,
    badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    text: 'text-emerald-400',
    order: 4,
  },
  CANCELLED: {
    labelKey: 'status_cancelled',
    shortKey: 'status_cancelled',
    icon: XCircle,
    badge: 'bg-red-500/15 text-red-400 border border-red-500/30',
    text: 'text-red-400',
    order: -1,
  },
};

export function statusMeta(status: string): StatusMeta {
  return STATUS_META[status as ParcelStatus] ?? STATUS_META.REQUESTED;
}

export function statusLabel(status: string, lang: Language, short = false): string {
  const meta = statusMeta(status);
  const dict = translations[lang] as Record<string, string>;
  return dict[short ? meta.shortKey : meta.labelKey] ?? status;
}
