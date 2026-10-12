'use client';

import React from 'react';
import { Scan, Package, DollarSign, Bot, MessageSquare, LogOut, Globe, Truck, ShieldCheck, UserCheck, LayoutDashboard, Sliders } from 'lucide-react';
import { Language, UserProfile } from '../lib/types';
import { staffTranslations } from '../lib/i18n';
import BrandLogo from './BrandLogo';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  currentUser: UserProfile;
  onLogout: () => void;
  onOpenAi: () => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  lang,
  onLanguageChange,
  currentUser,
  onLogout,
  onOpenAi
}: SidebarProps) {
  const t = staffTranslations[lang];
  const isAdmin = currentUser.role === 'ADMIN';

  const navItems = [
    { id: 'today', label: t.nav_today, icon: LayoutDashboard },
    { id: 'scanner', label: t.nav_scanner, icon: Scan },
    { id: 'parcels', label: t.nav_parcels, icon: Package },
    { id: 'finance', label: t.nav_finance, icon: DollarSign, badge: !isAdmin ? 'Admin' : undefined },
    { id: 'sms', label: t.nav_sms_outbox, icon: MessageSquare },
    { id: 'sms_settings', label: t.nav_sms_settings, icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-dark-950 border-r border-dark-800 flex flex-col justify-between shrink-0">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-dark-800">
          <BrandLogo variant="full" size="md" subtitleText={t.terminal_label} />
        </div>

        {/* Navigation items */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full group flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all relative ${
                  active
                    ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-glow-brand'
                    : 'text-slate-400 hover:text-white hover:bg-dark-850'
                }`}
              >
                {!active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 rounded-full bg-brand-500 transition-all group-hover:h-5" />
                )}
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-dark-800 text-gray-500 border border-dark-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* AI Assistant Button */}
          <button
            onClick={onOpenAi}
            className="w-full mt-4 flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-dark-800 to-dark-750 border border-brand-500/30 hover:border-brand-500/60 shadow-lg transition-all"
          >
            <Bot className="w-4 h-4 text-brand-400 animate-pulse" />
            <span>{t.nav_ai}</span>
          </button>
        </nav>
      </div>

      {/* Footer Profile & Lang */}
      <div className="p-4 border-t border-dark-800 space-y-3">
        {/* Language switch */}
        <button
          onClick={() => onLanguageChange(lang === 'fr' ? 'ar' : 'fr')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-dark-900 border border-dark-800 text-xs font-bold text-gray-300 hover:bg-dark-850"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-400" />
            <span>{lang === 'fr' ? 'Langue : Français' : 'اللغة: العربية'}</span>
          </div>
          <span className="text-[10px] text-gray-500 uppercase">{lang === 'fr' ? 'العربية' : 'FR'}</span>
        </button>

        {/* User Card */}
        <div className="p-3 rounded-2xl bg-dark-900 border border-dark-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">
                {currentUser.full_name || currentUser.phone_number}
              </div>
              <div className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
                <span>{currentUser.role}</span>
                {currentUser.assigned_office_detail && (
                  <span>• {currentUser.assigned_office_detail.code}</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-dark-800"
            title={t.nav_logout}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
