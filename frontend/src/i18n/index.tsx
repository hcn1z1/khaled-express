import React, { createContext, useContext, useState, useEffect } from 'react';
import { fr } from './fr';
import { ar } from './ar';

type Language = 'fr' | 'ar';
type Translations = typeof fr;

interface I18nContextType {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType>({
  language: 'fr',
  t: fr,
  setLanguage: () => {},
  dir: 'ltr',
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('fr');

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    if (lang === 'ar') {
      document.body.classList.add('font-arabic');
    } else {
      document.body.classList.remove('font-arabic');
    }
  };

  useEffect(() => {
    setLanguage('fr'); // Default French fallback per specifications
  }, []);

  const t = language === 'ar' ? (ar as Translations) : fr;
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <I18nContext.Provider value={{ language, t, setLanguage, dir }}>
      <div dir={dir} className={language === 'ar' ? 'font-arabic' : 'font-sans'}>
        {children}
      </div>
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
