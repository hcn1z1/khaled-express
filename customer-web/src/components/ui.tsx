'use client';

import React, { useEffect, useRef } from 'react';
import { Loader2, LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { Language } from '@/lib/i18n';
import { statusMeta, statusLabel } from '@/lib/status';

/* ---------------------------------- Button --------------------------------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 hover:bg-brand-500 text-white shadow-glow-brand border border-brand-500/30',
  secondary:
    'bg-dark-800 hover:bg-dark-750 text-white border border-dark-700 hover:border-dark-600',
  outline:
    'bg-transparent hover:bg-dark-800 text-slate-200 border border-dark-700 hover:border-slate-500',
  ghost:
    'bg-transparent hover:bg-dark-850 text-slate-300 hover:text-white',
  danger:
    'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25',
  success:
    'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25',
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-xs rounded-xl gap-2',
  lg: 'px-6 py-3.5 text-sm rounded-2xl gap-2',
  icon: 'p-2.5 rounded-xl aspect-square',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: LucideIcon;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  children,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center font-bold transition-all active:scale-95',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900',
        'disabled:opacity-50 disabled:pointer-events-none',
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className,
      )}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      )}
      {children}
    </button>
  );
}

/* ---------------------------------- Field ---------------------------------- */

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  hint?: string;
  error?: string | null;
  mono?: boolean;
}

export function Field({ label, icon: Icon, hint, error, mono, id, className, ...rest }: FieldProps) {
  const inputId = id || rest.name || label;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-300 block mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        )}
        <input
          id={inputId}
          {...rest}
          className={clsx(
            'w-full bg-dark-900 border rounded-xl py-3 text-white text-xs placeholder-slate-500',
            'focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all',
            Icon ? 'ps-10 pe-3.5' : 'px-3.5',
            mono && 'font-mono tracking-wide',
            error ? 'border-red-500/70' : 'border-dark-700',
            className,
          )}
        />
      </div>
      {error ? (
        <p className="text-[10px] text-red-400 mt-1">{error}</p>
      ) : hint ? (
        <p className="text-[10px] text-slate-500 mt-1">{hint}</p>
      ) : null}
    </div>
  );
}

/* ----------------------------- Shadcn Badge -------------------------------- */

export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive' | 'brand' | 'success';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: LucideIcon;
}

export function Badge({
  variant = 'default',
  icon: Icon,
  className,
  children,
  ...props
}: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-dark-800 text-slate-200 border-dark-700',
    secondary: 'bg-dark-850 text-slate-300 border-dark-750',
    outline: 'bg-transparent text-slate-300 border-dark-700',
    destructive: 'bg-red-950/50 text-red-400 border-red-800/60',
    brand: 'bg-brand-500/15 text-brand-300 border-brand-500/30',
    success: 'bg-emerald-950/50 text-emerald-400 border-emerald-800/60',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border',
        variants[variant],
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}

/* -------------------------------- StatusBadge ------------------------------- */

export function StatusBadge({
  status,
  lang,
  short = false,
  className,
}: {
  status: string;
  lang: Language;
  short?: boolean;
  className?: string;
}) {
  const meta = statusMeta(status);
  const Icon = meta.icon;
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap',
        meta.badge,
        className,
      )}
    >
      <Icon className="w-3 h-3" />
      {statusLabel(status, lang, short)}
    </span>
  );
}

/* ------------------------- Shadcn Card Primitives -------------------------- */

export function Card({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={clsx(
        'bg-dark-900/80 backdrop-blur border border-dark-750 rounded-3xl text-slate-100 shadow-card transition-all',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('flex flex-col space-y-1.5 p-6 pb-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={clsx('text-lg font-black text-white tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={clsx('text-xs text-slate-400 leading-relaxed', className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardAction({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('ms-auto flex items-center gap-2', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'flex items-center p-6 pt-0 border-t border-dark-800/80 mt-4',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ----------------------- Shadcn StatCard Template -------------------------- */

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  badge?: React.ReactNode;
  description?: string;
  trend?: string;
  trendUp?: boolean;
  unit?: string;
  accent?: 'brand' | 'emerald' | 'amber' | 'blue' | 'zinc';
}

export function StatCard({
  title,
  value,
  icon: Icon,
  badge,
  description,
  trend,
  trendUp,
  unit,
  accent = 'brand',
  className,
  ...props
}: StatCardProps) {
  const accentGlow = {
    brand: 'border-brand-500/20 hover:border-brand-500/50 from-brand-600/10 to-transparent',
    emerald: 'border-emerald-500/20 hover:border-emerald-500/50 from-emerald-600/10 to-transparent',
    amber: 'border-amber-500/20 hover:border-amber-500/50 from-amber-600/10 to-transparent',
    blue: 'border-blue-500/20 hover:border-blue-500/50 from-blue-600/10 to-transparent',
    zinc: 'border-dark-700 hover:border-dark-600 from-white/5 to-transparent',
  }[accent];

  const iconColor = {
    brand: 'text-brand-400 bg-brand-500/15',
    emerald: 'text-emerald-400 bg-emerald-500/15',
    amber: 'text-amber-400 bg-amber-500/15',
    blue: 'text-blue-400 bg-blue-500/15',
    zinc: 'text-slate-300 bg-dark-800',
  }[accent];

  return (
    <Card
      className={clsx(
        'bg-gradient-to-t relative overflow-hidden transition-all duration-300 group hover:-translate-y-0.5',
        accentGlow,
        className,
      )}
      {...props}
    >
      <div className="p-5 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
            {title}
          </span>
          {Icon && (
            <span className={clsx('p-2 rounded-xl shrink-0 transition-transform group-hover:scale-110', iconColor)}>
              <Icon className="w-4 h-4" />
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight tabular-nums">
            {value}
          </div>
          {unit && (
            <span className="text-xs font-bold text-slate-400 font-sans uppercase">
              {unit}
            </span>
          )}
          {badge && <div className="ms-auto">{badge}</div>}
        </div>

        {(description || trend) && (
          <div className="mt-3 pt-3 border-t border-dark-800 text-[11px] text-slate-400 flex items-center justify-between">
            {description && <span>{description}</span>}
            {trend && (
              <span
                className={clsx(
                  'font-bold ms-auto',
                  trendUp ? 'text-emerald-400' : 'text-slate-400',
                )}
              >
                {trend}
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

/* ------------------------- Shadcn Table Primitives ------------------------- */

export function Table({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-auto">
      <table
        className={clsx('w-full caption-bottom text-xs', className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={clsx('border-b border-dark-750 text-slate-400 bg-dark-900/60', className)}
      {...props}
    />
  );
}

export function TableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={clsx('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
}

export function TableFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot
      className={clsx(
        'border-t border-dark-750 bg-dark-900/50 font-medium text-slate-300',
        className,
      )}
      {...props}
    />
  );
}

export function TableRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={clsx(
        'border-b border-dark-800 transition-colors hover:bg-dark-850/60 data-[state=selected]:bg-dark-850',
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={clsx(
        'h-11 px-4 text-start align-middle font-bold text-slate-400 uppercase tracking-wider text-[11px]',
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={clsx('p-4 align-middle text-slate-200', className)}
      {...props}
    />
  );
}

export function TableCaption({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption
      className={clsx('mt-4 text-[11px] text-slate-500', className)}
      {...props}
    />
  );
}

/* ---------------------------------- Modal ---------------------------------- */

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  hideCloseButton?: boolean;
}

const MODAL_SIZES = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
};

export function Modal({ open, onClose, size = 'md', children, hideCloseButton }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousActive = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    const focusTimer = setTimeout(() => {
      const target = panelRef.current?.querySelector<HTMLElement>('input, select, textarea');
      (target ?? panelRef.current)?.focus();
    }, 60);

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = '';
      clearTimeout(focusTimer);
      previousActive?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative w-full ${MODAL_SIZES[size]} bg-dark-900 border border-dark-750 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 outline-none animate-in zoom-in-95`}
      >
        {!hideCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="absolute top-5 end-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-dark-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 z-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

/* -------------------------------- EmptyState -------------------------------- */

export function EmptyState({
  icon: Icon,
  title,
  desc,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  desc?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('bg-dark-850/70 border border-dark-750 rounded-3xl p-10 text-center', className)}>
      <div className="w-14 h-14 rounded-2xl bg-dark-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
      {desc && <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">{desc}</p>}
      {action}
    </div>
  );
}

/* ------------------------------- SkeletonRows ------------------------------- */

export function SkeletonRows({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={clsx('space-y-3', className)} aria-busy="true" aria-label="Chargement">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-16 rounded-2xl bg-dark-850 border border-dark-750 animate-pulse"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  );
}

/* --------------------------------- Spinner --------------------------------- */

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={clsx('w-5 h-5 animate-spin text-brand-500', className)} />;
}
