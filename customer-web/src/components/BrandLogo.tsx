import React from 'react';

export type BrandLogoVariant = 'full' | 'compact' | 'icon';
export type BrandLogoSize = 'sm' | 'md' | 'lg' | 'xl';

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  size?: BrandLogoSize;
  className?: string;
  showSubtitle?: boolean;
}

/**
 * BrandLogo - Khaled Express
 * Crafted using authentic express logistics vectors discovered via better-icons MCP
 * (mdi:truck-fast & iconamoon:delivery-fast-fill aerodynamics).
 */
export default function BrandLogo({
  variant = 'full',
  size = 'md',
  className = '',
  showSubtitle = true,
}: BrandLogoProps) {
  // Sizing configurations
  const emblemSizes: Record<BrandLogoSize, string> = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-11 h-11 rounded-2xl',
    lg: 'w-14 h-14 rounded-2xl',
    xl: 'w-16 h-16 rounded-3xl',
  };

  const svgSizes: Record<BrandLogoSize, { width: number; height: number }> = {
    sm: { width: 20, height: 20 },
    md: { width: 26, height: 26 },
    lg: { width: 34, height: 34 },
    xl: { width: 40, height: 40 },
  };

  const titleSizes: Record<BrandLogoSize, string> = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const emblem = (
    <div
      className={`relative flex items-center justify-center shrink-0 bg-gradient-to-tr from-brand-600 via-brand-500 to-brand-300 text-dark-950 shadow-glow-brand ring-1 ring-brand-300/50 transition-all duration-300 group-hover:scale-105 group-hover:rotate-1 ${emblemSizes[size]}`}
    >
      {/* Dynamic ambient highlight */}
      <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />

      {/* Aerodynamic Speed Logistics SVG Vector from better-icons (mdi:truck-fast / Iconify) */}
      <svg
        viewBox="0 0 24 24"
        width={svgSizes[size].width}
        height={svgSizes[size].height}
        className="relative z-10 drop-shadow-sm text-dark-950 transition-transform group-hover:translate-x-0.5"
        fill="currentColor"
        aria-hidden="true"
      >
        {/* Speed trail streaks */}
        <path
          opacity="0.85"
          d="M1.2 6.5h3.5l.8 1.5H1.8zm-.6 3h5.2l.6 1.5H.8zm1 3h4.4l.7 1.5H1.8z"
        />
        {/* Aerodynamic Cabin & Express Body */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5 4a2 2 0 0 0-2 2v2.5h2V6a1 1 0 0 1 1-1h11v4h3l3 4v5h-2.1a3 3 0 0 1-5.8 0h-4.2a3 3 0 0 1-5.8 0H4v-1.5H3V17a2 2 0 0 0 2 2h.2a3 3 0 0 0 5.6 0h4.4a3 3 0 0 0 5.6 0H22a1 1 0 0 0 1-1v-5.5l-3.3-4.5H17V5a1 1 0 0 0-1-1H5zm14 7h-2V7h1.4l2.2 3.2V11zm-11 7.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"
        />
      </svg>
    </div>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{emblem}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {emblem}
      <div className="flex flex-col text-start">
        <div className="flex items-center gap-2.5">
          <span className={`font-black tracking-tight text-white ${titleSizes[size]}`}>
            KHALED <span className="text-brand-400">EXPRESS</span>
          </span>
          {variant === 'full' && (
            <div className="hidden xl:flex flex-col text-start ps-2.5 border-s border-dark-750">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/25 tracking-wide">
                ALGER ↔ EL EULMA
              </span>
              <span className="text-[9px] text-slate-400 font-medium mt-0.5">
                Transport de colis & marchandises
              </span>
            </div>
          )}
        </div>
        {showSubtitle && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold tracking-normal leading-tight mt-0.5">
            <span>Colis</span>
            <span className="text-brand-400">•</span>
            <span>Rapide</span>
            <span className="text-brand-400">•</span>
            <span>Sécurisé</span>
          </div>
        )}
      </div>
    </div>
  );
}
