import React, { useState } from 'react';
import { I18nProvider, useI18n } from './i18n';
import { Navbar } from './components/Navbar';
import { CustomerPortal } from './pages/CustomerPortal';
import { StaffOperations } from './pages/StaffOperations';
import { FinanceDashboard } from './pages/FinanceDashboard';
import { SmsOutboxView } from './pages/SmsOutboxView';
import { AiAssistantModal } from './components/AiAssistantModal';
import { Bot, MapPin, Phone, ShieldCheck } from 'lucide-react';

const MainApp: React.FC = () => {
  const { t, language } = useI18n();
  const [currentTab, setCurrentTab] = useState<'customer' | 'staff' | 'finance' | 'sms'>('customer');
  const [userRole, setUserRole] = useState<'ADMIN' | 'MODERATOR' | 'CUSTOMER'>('ADMIN');
  const [currentOffice, setCurrentOffice] = useState<'ALG' | 'EUL'>('ALG');
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userRole={userRole}
        setUserRole={setUserRole}
        currentOffice={currentOffice}
        setCurrentOffice={setCurrentOffice}
        onOpenAi={() => setIsAiOpen(true)}
      />

      {/* Main Content View */}
      <main className="flex-1 pb-16">
        {currentTab === 'customer' && <CustomerPortal />}
        {currentTab === 'staff' && (
          <StaffOperations
            currentOffice={currentOffice}
            userRole={userRole}
            onOpenAi={() => setIsAiOpen(true)}
          />
        )}
        {currentTab === 'finance' && <FinanceDashboard userRole={userRole} />}
        {currentTab === 'sms' && <SmsOutboxView />}
      </main>

      {/* Floating AI Assistant Trigger */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setIsAiOpen(true)}
          className="flex items-center gap-2.5 px-5 py-3.5 bg-gradient-to-r from-brand-red to-red-700 hover:from-brand-darkred hover:to-red-800 text-white font-extrabold text-sm rounded-full shadow-2xl shadow-red-600/40 border border-white/20 transition transform hover:scale-105 active:scale-95"
        >
          <Bot className="w-5 h-5 animate-bounce" />
          <span className="hidden sm:inline">Assistant IA Logistique</span>
        </button>
      </div>

      {/* AI Assistant Modal */}
      {isAiOpen && (
        <AiAssistantModal
          onClose={() => setIsAiOpen(false)}
        />
      )}

      {/* Footer with Fixed Branches */}
      <footer className="bg-brand-black text-gray-400 border-t border-gray-800 py-10 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-lg bg-brand-red flex items-center justify-center font-black text-white text-sm">
                KE
              </span>
              <span className="font-extrabold text-white text-base">Khaled Express</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Solution prototype de logistique rapide dédiée exclusivement à l'axe Alger — El Eulma (Sétif).
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-red" />
              Nos Deux Agences Fixes
            </h4>
            <div className="space-y-2 text-gray-400">
              <div>
                <strong className="text-gray-200">Alger (Didouche Mourad) :</strong>
                <p>14 Rue Didouche Mourad, Alger-Centre • Tél: 021 73 45 67</p>
              </div>
              <div className="pt-1">
                <strong className="text-gray-200">El Eulma (Sétif) :</strong>
                <p>Boulevard Commercial de Dubaï, El Eulma • Tél: 036 87 22 11</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-red" />
              Spécifications Prototype
            </h4>
            <p className="text-gray-400 leading-relaxed">
              Code 128 natif, impression thermique 80mm, bons bilingues français/arabe RTL, et cloisonnement strict des finances.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <I18nProvider>
      <MainApp />
    </I18nProvider>
  );
}
