'use client';

import React, { useEffect, useState } from 'react';
import { Palette, X } from 'lucide-react';

interface ThemeOption {
  id: string;
  name: string;
  badge: string;
  colors: string[];
  isTriColor?: boolean;
}

const THEMES: ThemeOption[] = [
  {
    id: '1',
    name: 'Champagne Gold',
    badge: 'Luxe Dark',
    colors: ['#d4b87c'],
  },
  {
    id: '2',
    name: 'Crimson Red',
    badge: 'Sport Dark',
    colors: ['#f85360'],
  },
  {
    id: '3',
    name: 'Carmine White',
    badge: 'Light 1',
    colors: ['#ffffff', '#dc263a'],
  },
  {
    id: '4',
    name: 'Cobalt White',
    badge: 'Light 2',
    colors: ['#ffffff', '#2563eb'],
  },
  {
    id: '5',
    name: 'Cyber Matrix',
    badge: '3 Colors',
    colors: ['#10b981', '#06b6d4', '#fbbf24'],
    isTriColor: true,
  },
  {
    id: '6',
    name: 'Tokyo Sunset',
    badge: '3 Colors',
    colors: ['#8b5cf6', '#f43f5e', '#fbbf24'],
    isTriColor: true,
  },
  {
    id: '7',
    name: 'Riviera Neobank',
    badge: 'Light 3C',
    colors: ['#4338ca', '#ea580c', '#059669'],
    isTriColor: true,
  },
  {
    id: '8',
    name: 'Sahara Mirage',
    badge: '3 Colors',
    colors: ['#ea580c', '#fbbf24', '#14b8a6'],
    isTriColor: true,
  },
  {
    id: '9',
    name: 'Acid Voltage',
    badge: '3 Colors',
    colors: ['#84cc16', '#6366f1', '#ec4899'],
    isTriColor: true,
  },
];

export default function ThemePreviewSwitcher() {
  const [activeTheme, setActiveTheme] = useState('1');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const readTheme = () => {
      const param = new URLSearchParams(window.location.search).get('color');
      if (param && ['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(param)) {
        setActiveTheme(param);
        document.documentElement.dataset.colorTheme = param;
      } else {
        const docTheme = document.documentElement.dataset.colorTheme || '1';
        setActiveTheme(docTheme);
      }
    };

    readTheme();
    window.addEventListener('popstate', readTheme);
    return () => window.removeEventListener('popstate', readTheme);
  }, []);

  const selectTheme = (id: string) => {
    setActiveTheme(id);
    document.documentElement.dataset.colorTheme = id;
    const url = new URL(window.location.href);
    url.searchParams.set('color', id);
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <aside aria-label="Sélecteur de thèmes" className="fixed bottom-5 end-5 z-40 print:hidden select-none">
      {isOpen ? (
        <div className="bg-dark-950/95 backdrop-blur-2xl border border-dark-750/90 rounded-2xl p-3 shadow-2xl shadow-black/80 w-80 max-h-[82vh] flex flex-col animate-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-dark-800 shrink-0">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-brand-400" />
              <span className="text-xs font-black tracking-wide text-white">Thèmes (?color=1..9)</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-dark-800 text-slate-400 hover:text-white transition-colors"
              aria-label="Fermer le sélecteur"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 overflow-y-auto pe-1 max-h-[70vh]">
            {THEMES.map((theme) => {
              const isSelected = activeTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => selectTheme(theme.id)}
                  className={`p-2 rounded-xl text-start transition-all border flex flex-col gap-1.5 relative ${
                    isSelected
                      ? 'bg-dark-850 border-brand-400/80 shadow-md ring-1 ring-brand-400/30'
                      : 'bg-dark-900/80 border-dark-800 hover:border-dark-700 hover:bg-dark-850/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span className="text-[11px] font-bold text-white flex items-center gap-1">
                      <span className="font-mono text-[10px] text-slate-400">#{theme.id}</span>
                      {theme.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1">
                      {theme.colors.map((c, i) => (
                        <span
                          key={i}
                          className="w-3 h-3 rounded-full border border-black/30 shadow-sm"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>

                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                        theme.isTriColor
                          ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                          : 'bg-dark-800 text-slate-400'
                      }`}
                    >
                      {theme.badge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-dark-950/90 backdrop-blur-xl border border-dark-700/80 hover:border-brand-400/60 text-slate-200 hover:text-white shadow-xl hover:shadow-glow-brand transition-all active:scale-95 text-xs font-semibold group"
          title="Changer de thème (?color=1..6)"
          aria-label="Ouvrir le sélecteur de thèmes"
        >
          <Palette className="w-4 h-4 text-brand-400 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline text-[11px] font-mono font-bold text-brand-300">
            ?color={activeTheme}
          </span>
          <div className="flex items-center -space-x-1">
            {THEMES.find((t) => t.id === activeTheme)?.colors.map((c, i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full border border-dark-950 shadow-sm"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </button>
      )}
    </aside>
  );
}
