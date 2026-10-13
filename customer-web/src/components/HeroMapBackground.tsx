'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function HeroMapBackground() {
  return (
    <div
      className="absolute -top-16 -bottom-16 -end-24 start-[-20%] lg:start-[-10%] pointer-events-none select-none z-0 overflow-hidden"
      style={{
        maskImage:
          'radial-gradient(ellipse 70% 65% at 65% 50%, black 20%, rgba(0,0,0,0.85) 45%, transparent 75%)',
        WebkitMaskImage:
          'radial-gradient(ellipse 70% 65% at 65% 50%, black 20%, rgba(0,0,0,0.85) 45%, transparent 75%)',
      }}
      aria-hidden="true"
    >
      {/* Warm ambient under-glow specifically aligned with the map corridor */}
      <div className="absolute top-1/3 end-10 w-[580px] h-[480px] bg-gradient-to-tr from-brand-500/15 via-brand-600/8 to-transparent rounded-full blur-[130px] pointer-events-none" />

      <motion.svg
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        viewBox="0 0 1100 850"
        className="w-full h-full object-cover"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Subtle neon glow for primary golden expressway */}
          <filter id="gold-highway-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Faint gold highway gradient */}
          <linearGradient id="gold-artery" x1="10%" y1="70%" x2="90%" y2="25%">
            <stop offset="0%" stopColor="#d4b87c" stopOpacity="0.25" />
            <stop offset="35%" stopColor="#d4b87c" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#dec693" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#d4b87c" stopOpacity="0.3" />
          </linearGradient>

          {/* Secondary artery gradient */}
          <linearGradient id="gold-feeder" x1="30%" y1="30%" x2="80%" y2="80%">
            <stop offset="0%" stopColor="#dec693" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#d4b87c" stopOpacity="0.15" />
          </linearGradient>

          {/* Pattern of city grid blocks */}
          <pattern id="street-grid-dense" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(-18 0 0)">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
            <path d="M 30 0 L 30 60 M 0 30 L 60 30" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* ========================================================= */}
        {/* 1. URBAN BLOCKS & DISTRICT FABRIC                         */}
        {/* ========================================================= */}
        {/* District grid patches */}
        <rect x="250" y="100" width="380" height="280" fill="url(#street-grid-dense)" opacity="0.6" />
        <rect x="520" y="320" width="420" height="340" fill="url(#street-grid-dense)" opacity="0.75" />
        <rect x="180" y="420" width="320" height="300" fill="url(#street-grid-dense)" opacity="0.5" />

        {/* Faint district boundary outlines */}
        <path d="M 280 180 L 420 160 L 510 240 L 460 340 L 320 320 Z" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="rgba(255,255,255,0.015)" />
        <path d="M 540 220 L 680 190 L 740 270 L 660 360 L 530 310 Z" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="rgba(255,255,255,0.012)" />
        <path d="M 640 380 L 820 350 L 910 460 L 790 540 L 630 480 Z" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="rgba(255,255,255,0.018)" />
        <path d="M 360 460 L 500 420 L 580 520 L 470 630 L 330 570 Z" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="rgba(255,255,255,0.01)" />
        <path d="M 720 560 L 880 520 L 980 620 L 860 740 L 690 680 Z" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="rgba(255,255,255,0.012)" />

        {/* ========================================================= */}
        {/* 2. LOCAL & RESIDENTIAL STREET NETWORK (Faint Gray/Slate)  */}
        {/* ========================================================= */}
        <g stroke="rgba(255,255,255,0.09)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          {/* Angled street grid lines across northern corridor */}
          <path d="M 120 160 L 540 260" />
          <path d="M 160 120 L 580 220" />
          <path d="M 210 80 L 630 180" />
          <path d="M 260 40 L 680 140" />
          <path d="M 320 20 L 730 110" />

          {/* Transverse cross-streets */}
          <path d="M 220 70 L 140 380" />
          <path d="M 290 90 L 210 420" />
          <path d="M 360 110 L 280 440" />
          <path d="M 430 130 L 350 460" />
          <path d="M 500 150 L 420 480" />
          <path d="M 570 170 L 490 510" />

          {/* Eastern city center grid */}
          <path d="M 520 280 L 960 190" />
          <path d="M 540 330 L 980 240" />
          <path d="M 560 380 L 1000 290" />
          <path d="M 580 430 L 1020 340" />
          <path d="M 600 480 L 1040 390" />
          <path d="M 620 530 L 1060 440" />

          {/* Eastern cross-streets */}
          <path d="M 640 170 L 720 560" />
          <path d="M 710 160 L 790 550" />
          <path d="M 780 150 L 860 540" />
          <path d="M 850 140 L 930 530" />
          <path d="M 920 130 L 1000 520" />

          {/* Southern grid network */}
          <path d="M 200 540 L 680 640" />
          <path d="M 230 590 L 710 690" />
          <path d="M 260 640 L 740 740" />
          <path d="M 380 480 L 320 760" />
          <path d="M 460 500 L 400 780" />
          <path d="M 540 520 L 480 800" />
          <path d="M 620 540 L 560 820" />
        </g>

        {/* ========================================================= */}
        {/* 3. SECONDARY ARTERIAL BOULEVARDS (Slate-300 / Medium)     */}
        {/* ========================================================= */}
        <g stroke="rgba(255,255,255,0.18)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          {/* North-South cross boulevard */}
          <path d="M 380 40 Q 420 280 340 520 T 420 820" />

          {/* Diagonal boulevard through center */}
          <path d="M 140 320 Q 380 360 620 280 T 1040 180" />

          {/* Eastern ring boulevard */}
          <path d="M 590 120 Q 780 200 840 440 T 760 780" />

          {/* Southern bypass */}
          <path d="M 180 680 Q 460 560 740 680 T 1060 620" />

          {/* Connecting feeder spurs */}
          <path d="M 480 240 Q 580 340 540 520" />
          <path d="M 740 260 Q 640 420 720 580" />
        </g>

        {/* Roundabouts and Intersections */}
        <g stroke="rgba(255,255,255,0.22)" strokeWidth="1.6" fill="none">
          <circle cx="410" cy="270" r="14" />
          <circle cx="620" cy="280" r="18" />
          <circle cx="780" cy="220" r="15" />
          <circle cx="480" cy="500" r="16" />
          <circle cx="740" cy="560" r="20" />
          <circle cx="860" cy="420" r="14" />

          {/* Roundabout center pins */}
          <circle cx="410" cy="270" r="2.5" fill="rgba(255,255,255,0.4)" stroke="none" />
          <circle cx="620" cy="280" r="3" fill="#dec693" stroke="none" />
          <circle cx="780" cy="220" r="2.5" fill="rgba(255,255,255,0.4)" stroke="none" />
          <circle cx="480" cy="500" r="2.5" fill="rgba(255,255,255,0.4)" stroke="none" />
          <circle cx="740" cy="560" r="3" fill="#dec693" stroke="none" />
          <circle cx="860" cy="420" r="2.5" fill="rgba(255,255,255,0.4)" stroke="none" />
        </g>

        {/* Cloverleaf Highway Interchange Loops */}
        <g stroke="rgba(212,184,124,0.3)" strokeWidth="1.4" fill="none">
          {/* Cloverleaf loop upper left of interchange */}
          <path d="M 490 320 C 470 290 440 310 460 340 C 475 360 510 350 510 325" />
          {/* Cloverleaf loop lower right of interchange */}
          <path d="M 530 340 C 550 370 580 350 560 320 C 545 300 510 310 510 335" />
        </g>

        {/* ========================================================= */}
        {/* 4. MAJOR GOLDEN HIGHWAY CORRIDOR (Autoroute A2)          */}
        {/* Sweeping dramatically across behind the hero van          */}
        {/* ========================================================= */}
        {/* Glow halo underlay */}
        <path
          d="M 60 520 Q 280 440 510 330 T 920 180 L 1080 140"
          stroke="#d4b87c"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.18"
          filter="url(#gold-highway-glow)"
        />

        {/* Primary Glowing Golden Highway Artery */}
        <path
          d="M 60 520 Q 280 440 510 330 T 920 180 L 1080 140"
          stroke="url(#gold-artery)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#gold-highway-glow)"
        />

        {/* Parallel expressway lane / feeder */}
        <path
          d="M 75 532 Q 290 452 518 342 T 928 192 L 1088 152"
          stroke="rgba(212, 184, 124, 0.35)"
          strokeWidth="1.2"
          strokeDasharray="6 8"
          strokeLinecap="round"
        />

        {/* Secondary Golden Branch Route (diverging south-east towards Sétif / El Eulma hub) */}
        <path
          d="M 510 330 Q 640 410 780 510 T 1050 640"
          stroke="url(#gold-feeder)"
          strokeWidth="2.4"
          strokeLinecap="round"
          filter="url(#gold-highway-glow)"
        />

        {/* Secondary branch lane marking */}
        <path
          d="M 518 340 Q 646 418 786 518 T 1056 648"
          stroke="rgba(212, 184, 124, 0.25)"
          strokeWidth="1"
          strokeDasharray="5 6"
          strokeLinecap="round"
        />

        {/* Highway entrance / exit slip ramps */}
        <path d="M 320 460 Q 380 420 440 380" stroke="#d4b87c" strokeWidth="1.6" strokeDasharray="3 4" opacity="0.6" />
        <path d="M 620 300 Q 690 320 760 360" stroke="#d4b87c" strokeWidth="1.6" strokeDasharray="3 4" opacity="0.6" />
        <path d="M 720 240 Q 800 230 870 210" stroke="#d4b87c" strokeWidth="1.6" strokeDasharray="3 4" opacity="0.6" />

        {/* ========================================================= */}
        {/* 5. TELEMETRY HIGHWAY NODES & MOVING GPS PULSE            */}
        {/* ========================================================= */}
        {/* Highway Waypoint Markers */}
        <g>
          <circle cx="280" cy="440" r="4" fill="#dec693" />
          <circle cx="280" cy="440" r="9" stroke="#dec693" strokeWidth="1" opacity="0.4" className="animate-ping" />

          <circle cx="510" cy="330" r="5" fill="#dec693" />
          <circle cx="510" cy="330" r="12" stroke="#dec693" strokeWidth="1" opacity="0.5" />

          <circle cx="780" cy="510" r="4" fill="#dec693" />
          <circle cx="780" cy="510" r="9" stroke="#dec693" strokeWidth="1" opacity="0.4" />

          <circle cx="920" cy="180" r="4.5" fill="#dec693" />
          <circle cx="920" cy="180" r="10" stroke="#dec693" strokeWidth="1" opacity="0.5" />
        </g>

        {/* Live Traveling Express Pulse traveling along Autoroute A2 */}
        <circle r="3.5" fill="#ffffff" filter="url(#gold-highway-glow)">
          <animateMotion
            path="M 60 520 Q 280 440 510 330 T 920 180 L 1080 140"
            dur="6s"
            repeatCount="indefinite"
          />
        </circle>
        <circle r="9" fill="none" stroke="#dec693" strokeWidth="1" opacity="0.75">
          <animateMotion
            path="M 60 520 Q 280 440 510 330 T 920 180 L 1080 140"
            dur="6s"
            repeatCount="indefinite"
          />
        </circle>
      </motion.svg>
    </div>
  );
}
