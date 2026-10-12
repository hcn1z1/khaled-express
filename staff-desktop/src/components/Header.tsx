'use client';

import React from 'react';
import { MapPin, PlusCircle, Clock, ShieldCheck } from 'lucide-react';
import { Language, UserProfile, Office } from '../lib/types';
import { staffTranslations } from '../lib/i18n';

interface HeaderProps {
  lang: Language;
  currentUser: UserProfile;
  offices: Office[];
  onOpenIntake: () => void;
  parcelsCount: number;
}

export default function Header({
  lang,
  currentUser,
  offices,
  onOpenIntake,
  parcelsCount
}: HeaderProps) {
  const t = staffTranslations[lang];

  return (
    <header className="h-16 border-b border-dark-800 bg-dark-950/70 backdrop-blur px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        {/* Office badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-850 border border-dark-750 text-xs">
          <MapPin className="w-4 h-4 text-brand-500" />
          <span className="font-semibold text-white">
            {currentUser.assigned_office_detail ? (
              lang === 'ar' ? currentUser.assigned_office_detail.name_ar : currentUser.assigned_office_detail.name_fr
            ) : (
              'Comptoirs Alger & El Eulma'
            )}
          </span>
        </div>

        <div className="text-xs text-gray-500 hidden sm:block">
          {parcelsCount} colis enregistrés
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenIntake}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white rounded-xl text-xs font-bold shadow-glow-brand transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nouvel Intake</span>
        </button>
      </div>
    </header>
  );
}
