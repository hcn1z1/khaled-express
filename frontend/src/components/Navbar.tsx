import React from 'react';
import { useI18n } from '../i18n';
import { 
  Package, Truck, DollarSign, MessageSquare, Bot, 
  Languages, Shield, User, Building2
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'customer' | 'staff' | 'finance' | 'sms';
  setCurrentTab: (tab: 'customer' | 'staff' | 'finance' | 'sms') => void;
  userRole: 'ADMIN' | 'MODERATOR' | 'CUSTOMER';
  setUserRole: (role: 'ADMIN' | 'MODERATOR' | 'CUSTOMER') => void;
  currentOffice: 'ALG' | 'EUL';
  setCurrentOffice: (office: 'ALG' | 'EUL') => void;
  onOpenAi: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  userRole,
  setUserRole,
  currentOffice,
  setCurrentOffice,
  onOpenAi
}) => {
  const { t, language, setLanguage } = useI18n();

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'ar' : 'fr');
  };

  return (
    <header className="sticky top-0 z-40 bg-brand-black text-white shadow-xl border-b border-gray-800">
      {/* Top Banner: Office Selector, Role switcher, Language toggle */}
      <div className="bg-gray-950 px-4 py-2 border-b border-gray-800 text-xs flex flex-wrap items-center justify-between gap-3">
        {/* Office Selection */}
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-brand-red" />
          <span className="text-gray-400 font-medium">Bureau actif:</span>
          <div className="flex bg-gray-900 rounded-lg p-0.5 border border-gray-700">
            <button
              onClick={() => setCurrentOffice('ALG')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                currentOffice === 'ALG'
                  ? 'bg-brand-red text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Alger (ALG)
            </button>
            <button
              onClick={() => setCurrentOffice('EUL')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                currentOffice === 'EUL'
                  ? 'bg-brand-red text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              El Eulma (EUL)
            </button>
          </div>
        </div>

        {/* Role Testing Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-gray-900 px-3 py-1 rounded-lg border border-gray-700">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-gray-400">Rôle testeur :</span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as any)}
              className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer"
            >
              <option value="ADMIN" className="bg-gray-900 text-white">Admin (Ahmed)</option>
              <option value="MODERATOR" className="bg-gray-900 text-white">Modérateur (Amine)</option>
              <option value="CUSTOMER" className="bg-gray-900 text-white">Client (Karim)</option>
            </select>
          </div>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1 bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-700 rounded-lg font-bold text-xs transition"
          >
            <Languages className="w-3.5 h-3.5 text-brand-red" />
            <span>{t.switchLanguage}</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-red flex items-center justify-center font-black text-xl text-white shadow-lg shadow-red-600/30 tracking-tighter">
            KE
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-white">{t.brandName}</span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-red-950 text-red-400 border border-red-800 rounded">
                Prototype
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block">{t.tagline}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setCurrentTab('customer')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              currentTab === 'customer'
                ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4 text-brand-red" />
            <span>{t.navCustomerPortal}</span>
          </button>

          <button
            onClick={() => setCurrentTab('staff')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              currentTab === 'staff'
                ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Truck className="w-4 h-4 text-brand-red" />
            <span>{t.navStaffOperations}</span>
          </button>

          <button
            onClick={() => setCurrentTab('finance')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              currentTab === 'finance'
                ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <DollarSign className="w-4 h-4 text-green-500" />
            <span>{t.navFinance}</span>
          </button>

          <button
            onClick={() => setCurrentTab('sms')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              currentTab === 'sms'
                ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span className="hidden md:inline">{t.navSmsOutbox}</span>
          </button>

          {/* AI Quick Button */}
          <button
            onClick={onOpenAi}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition transform active:scale-95 ml-2"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">{t.navAiAssistant}</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
