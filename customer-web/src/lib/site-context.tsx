'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Language } from './i18n';
import { getOffices, getStoredUser, setAuthToken, setStoredUser } from './api';
import { Office, User } from '@/types';

interface SiteContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  offices: Office[];
  /** Global auth modal */
  isAuthOpen: boolean;
  authMode: 'login' | 'register';
  openAuth: (mode?: 'login' | 'register') => void;
  closeAuth: () => void;
  switchAuthMode: (mode: 'login' | 'register') => void;
  /** Global new-transfer modal */
  isTransferOpen: boolean;
  openTransfer: () => void;
  closeTransfer: () => void;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('fr');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [offices, setOffices] = useState<Office[]>([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setCurrentUser(user);
      if (user.preferred_language) {
        setLangState(user.preferred_language as Language);
      }
    }
    getOffices()
      .then((data) => setOffices(data || []))
      .catch(console.error);
  }, []);

  // Reflect language on <html> for RTL + fonts
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Language) => setLangState(next), []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setStoredUser(null);
    setCurrentUser(null);
  }, []);

  const value = useMemo<SiteContextValue>(
    () => ({
      lang,
      setLang,
      currentUser,
      setCurrentUser,
      logout,
      offices,
      isAuthOpen,
      authMode,
      openAuth: (mode) => {
        if (mode) setAuthMode(mode);
        setIsAuthOpen(true);
      },
      closeAuth: () => setIsAuthOpen(false),
      switchAuthMode: (mode) => setAuthMode(mode),
      isTransferOpen,
      openTransfer: () => setIsTransferOpen(true),
      closeTransfer: () => setIsTransferOpen(false),
    }),
    [lang, setLang, currentUser, logout, offices, isAuthOpen, authMode, isTransferOpen],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used inside SiteProvider');
  return ctx;
}
