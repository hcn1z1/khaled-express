'use client';

import React, { useEffect, useState } from 'react';
import { LogIn, UserPlus, AlertCircle, Phone } from 'lucide-react';
import { Modal, Button, Field } from '@/components/ui';
import { translations } from '@/lib/i18n';
import { customerLogin, customerRegister } from '@/lib/api';
import { useSite } from '@/lib/site-context';
import { useRouter } from 'next/navigation';
import BrandLogo from '@/components/BrandLogo';

export default function AuthModal() {
  const { lang, isAuthOpen, closeAuth, authMode, switchAuthMode, setCurrentUser } = useSite();
  const t = translations[lang];
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when opening
  useEffect(() => {
    if (isAuthOpen) {
      setPhone('');
      setPassword('');
      setFullName('');
      setError(null);
    }
  }, [isAuthOpen]);

  const isLogin = authMode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = isLogin
        ? await customerLogin(phone, password)
        : await customerRegister(phone, password, fullName, lang);
      setCurrentUser(res.user);
      closeAuth();
      router.push('/mes-expeditions');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Échec de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={isAuthOpen} onClose={closeAuth} size="sm">
      <div className="mb-6">
        <BrandLogo variant="compact" size="sm" showSubtitle={false} className="mb-4" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center shrink-0">
            {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-lg font-black text-white">{isLogin ? t.login_title : t.register_title}</h2>
            <p className="text-xs text-slate-400">{isLogin ? t.login_subtitle : t.register_subtitle}</p>
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-5 p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <Field
            id="auth-fullname"
            label={t.fullname_label}
            icon={UserPlus}
            type="text"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Mohamed Benali"
          />
        )}

        <Field
          id="auth-phone"
          label={t.phone_label}
          icon={Phone}
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0661123456"
          mono
          hint={t.phone_hint}
          pattern="0[5-7][0-9]{8}"
        />

        <Field
          id="auth-password"
          label={t.password_label}
          type="password"
          required
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
          {isLogin ? t.login_btn : t.register_btn}
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-dark-800 text-center text-xs text-slate-400">
        {isLogin ? (
          <span>
            {t.dont_have_account.split('?')[0]}?{' '}
            <button
              type="button"
              onClick={() => switchAuthMode('register')}
              className="text-brand-400 hover:text-brand-300 font-bold focus:outline-none focus:underline"
            >
              {t.switch_to_register}
            </button>
          </span>
        ) : (
          <span>
            {t.already_have_account.split('?')[0]}?{' '}
            <button
              type="button"
              onClick={() => switchAuthMode('login')}
              className="text-brand-400 hover:text-brand-300 font-bold focus:outline-none focus:underline"
            >
              {t.switch_to_login}
            </button>
          </span>
        )}
      </div>
    </Modal>
  );
}
