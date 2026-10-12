'use client';

import React, { useState } from 'react';
import { Truck, Lock, Phone, AlertCircle, ArrowRight } from 'lucide-react';
import { staffLogin } from '../lib/api';
import { UserProfile } from '../lib/types';
import BrandLogo from './BrandLogo';

interface StaffLoginProps {
  onSuccess: (user: UserProfile) => void;
}

export default function StaffLogin({ onSuccess }: StaffLoginProps) {
  const [phone, setPhone] = useState('0555000001');
  const [password, setPassword] = useState('admin1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await staffLogin(phone, password);
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickPhone: string, quickPass: string) => {
    setPhone(quickPhone);
    setPassword(quickPass);
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand-600/15 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />

      <div className="w-full max-w-md bg-dark-850/80 backdrop-blur border border-dark-750 p-8 rounded-3xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <BrandLogo
            variant="full"
            size="lg"
            className="justify-center mb-2"
            subtitleText="Terminal Opérateur & Admin • Alger ↔ El Eulma"
          />
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">
              Numéro de téléphone de service
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-dark-850 border border-dark-700 rounded-xl pl-10 pr-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-850 border border-dark-700 rounded-xl pl-10 pr-4 py-3 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 disabled:opacity-50 text-white font-bold rounded-xl shadow-glow-brand text-xs transition-all active:scale-95"
          >
            {loading ? 'Connexion en cours...' : 'Ouvrir la session de poste'}
          </button>
        </form>

        {/* Quick Demo Logins */}
        <div className="mt-8 pt-6 border-t border-dark-800">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-3 text-center">
            Comptes de test pré-configurés
          </span>
          <div className="grid grid-cols-3 gap-2 text-center">
            <button
              type="button"
              onClick={() => handleQuickLogin('0555000001', 'admin1234')}
              className="p-2 rounded-xl bg-dark-850 hover:bg-dark-800 border border-dark-700 text-[11px] font-semibold text-brand-400"
            >
              Directeur Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('0555000002', 'staff1234')}
              className="p-2 rounded-xl bg-dark-850 hover:bg-dark-800 border border-dark-700 text-[11px] font-semibold text-blue-400"
            >
              Opérateur Alger
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('0555000003', 'staff1234')}
              className="p-2 rounded-xl bg-dark-850 hover:bg-dark-800 border border-dark-700 text-[11px] font-semibold text-emerald-400"
            >
              Opérateur Eulma
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
