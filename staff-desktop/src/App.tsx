'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import OverviewScreen from './components/OverviewScreen';
import ScanStation from './components/ScanStation';
import ParcelList from './components/ParcelList';
import FinanceScreen from './components/FinanceScreen';
import SmsOutboxScreen from './components/SmsOutboxScreen';
import SmsSettingsScreen from './components/SmsSettingsScreen';
import IntakeModal from './components/IntakeModal';
import PrintBonModal from './components/PrintBonModal';
import AiAssistantModal from './components/AiAssistantModal';
import StaffLogin from './components/StaffLogin';
import { Language, UserProfile, Parcel, Office } from './lib/types';
import { getStaffUser, getStaffToken, getStaffMe, setStaffToken, setStaffUser, getParcels, getOffices } from './lib/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [lang, setLang] = useState<Language>('fr');
  const [currentTab, setCurrentTab] = useState<string>('today');
  const [offices, setOffices] = useState<Office[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loadingParcels, setLoadingParcels] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [routeFilter, setRouteFilter] = useState('');

  // Modals
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [printModalState, setPrintModalState] = useState<{
    isOpen: boolean;
    parcel: Parcel | null;
    doc: 'ticket' | 'intake' | 'pickup';
  }>({
    isOpen: false,
    parcel: null,
    doc: 'ticket',
  });

  const handleLogout = () => {
    setStaffToken(null);
    setStaffUser(null);
    setCurrentUser(null);
  };

  useEffect(() => {
    const user = getStaffUser();
    const token = getStaffToken();
    if (user && token) {
      setCurrentUser(user);
      if (user.preferred_language) {
        setLang(user.preferred_language);
      }
      getStaffMe()
        .then((freshUser) => {
          setCurrentUser(freshUser);
          setStaffUser(freshUser);
        })
        .catch((err) => {
          console.warn('Invalid token on startup:', err);
          handleLogout();
        });
    } else {
      handleLogout();
    }
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      handleLogout();
    };
    window.addEventListener('staff:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('staff:unauthorized', handleUnauthorized);
  }, []);

  const loadData = async () => {
    if (!currentUser) return;
    setLoadingParcels(true);
    try {
      const [officesRes, parcelsRes] = await Promise.all([
        getOffices(),
        getParcels({
          q: searchQuery,
          status: statusFilter,
          route: routeFilter,
        }),
      ]);
      setOffices(officesRes.results || officesRes || []);
      setParcels(parcelsRes.results || parcelsRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingParcels(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, searchQuery, statusFilter, routeFilter]);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    if (typeof document !== 'undefined') {
      document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = newLang;
    }
  };


  const handleOpenPrint = (parcel: Parcel, doc: 'ticket' | 'intake' | 'pickup') => {
    setPrintModalState({
      isOpen: true,
      parcel,
      doc,
    });
  };

  if (!currentUser) {
    return <StaffLogin onSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden bg-dark-900 text-slate-100 ${
        lang === 'ar' ? 'font-sans' : ''
      }`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        onLanguageChange={handleLanguageChange}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAi={() => setIsAiOpen(true)}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          lang={lang}
          currentUser={currentUser}
          offices={offices}
          onOpenIntake={() => setIsIntakeOpen(true)}
          parcelsCount={parcels.length}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {currentTab === 'today' && (
            <OverviewScreen
              lang={lang}
              currentUser={currentUser}
              parcels={parcels}
              loading={loadingParcels}
              onRefresh={loadData}
            />
          )}

          {currentTab === 'scanner' && (
            <ScanStation
              lang={lang}
              currentUser={currentUser}
              offices={offices}
              onOpenPrint={handleOpenPrint}
              onRefreshList={loadData}
            />
          )}

          {currentTab === 'parcels' && (
            <ParcelList
              parcels={parcels}
              loading={loadingParcels}
              lang={lang}
              currentUser={currentUser}
              onRefresh={loadData}
              onOpenPrint={handleOpenPrint}
              onOpenIntake={() => setIsIntakeOpen(true)}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              routeFilter={routeFilter}
              setRouteFilter={setRouteFilter}
            />
          )}

          {currentTab === 'finance' && (
            <FinanceScreen
              lang={lang}
              currentUser={currentUser}
              parcels={parcels}
            />
          )}

          {currentTab === 'sms' && (
            <SmsOutboxScreen lang={lang} currentUser={currentUser} initialTab="outbox" />
          )}

          {currentTab === 'sms_settings' && (
            <SmsSettingsScreen lang={lang} currentUser={currentUser} />
          )}
        </main>
      </div>

      {/* Modals */}
      <IntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        lang={lang}
        currentUser={currentUser}
        offices={offices}
        onCreated={(newP) => {
          loadData();
          handleOpenPrint(newP, 'ticket');
        }}
      />

      <PrintBonModal
        isOpen={printModalState.isOpen}
        parcel={printModalState.parcel}
        defaultDoc={printModalState.doc}
        onClose={() => setPrintModalState(prev => ({ ...prev, isOpen: false }))}
      />

      <AiAssistantModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        lang={lang}
        onOpenPrint={handleOpenPrint}
      />
    </div>
  );
}
