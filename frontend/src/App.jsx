import React, { useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { ToastContainer } from './components/common/Toast';
import { AddPeriodModal } from './components/common/AddPeriodModal';
import { WARekapModal } from './components/common/WARekapModal';
import { useUIStore } from './stores/useUIStore';
import { usePeriodStore } from './stores/usePeriodStore';
import { useRoomStore } from './stores/useRoomStore';
import { useExpenseStore } from './stores/useExpenseStore';
import { useIncomeStore } from './stores/useIncomeStore';

import { useAuthStore } from './stores/useAuthStore';

import { DashboardPage } from './pages/DashboardPage';
import { RoomsPage } from './pages/RoomsPage';
import { VerificationPage } from './pages/VerificationPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { HistoryPage } from './pages/HistoryPage';
import { LoginPage } from './pages/LoginPage';

export default function App() {
  const activeTab = useUIStore((state) => state.activeTab);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const currentPeriodId = usePeriodStore((state) => state.currentPeriodId);
  const loadPeriods = usePeriodStore((state) => state.loadPeriods);
  const loadRoomData = useRoomStore((state) => state.loadRoomData);
  const loadExpenses = useExpenseStore((state) => state.loadExpenses);
  const loadIncomes = useIncomeStore((state) => state.loadIncomes);

  // Load periode hanya jika pengguna sudah terautentikasi (login)
  useEffect(() => {
    if (isLoggedIn) {
      loadPeriods();
    }
  }, [isLoggedIn, loadPeriods]);

  // Load data kamar, pengeluaran, dan pemasukan hanya jika login dan periode aktif tersedia
  useEffect(() => {
    if (isLoggedIn && currentPeriodId) {
      loadRoomData(currentPeriodId);
      loadExpenses(currentPeriodId);
      loadIncomes(currentPeriodId);
    }
  }, [isLoggedIn, currentPeriodId, loadRoomData, loadExpenses, loadIncomes]);

  // Route Guard: Tampilkan Form Login jika belum login atau jika tab aktif adalah login
  if (!isLoggedIn || activeTab === 'login') {
    return (
      <div className="min-h-screen w-screen bg-brand-bg text-brand-text-main font-sans selection:bg-brand-primary-subtle selection:text-brand-primary flex flex-col justify-center items-center">
        <LoginPage />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-brand-bg text-brand-text-main font-sans selection:bg-brand-primary-subtle selection:text-brand-primary">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar />

      {/* 2. Main Content Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Sticky Top Header */}
        <TopHeader />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'dashboard' && <DashboardPage />}
          {activeTab === 'rooms' && <RoomsPage />}
          {activeTab === 'verification' && <VerificationPage />}
          {activeTab === 'expenses' && <ExpensesPage />}
          {activeTab === 'history' && <HistoryPage />}
        </main>
      </div>

      {/* 3. Global Overlays & Toasts */}
      <ToastContainer />
      <AddPeriodModal />
      <WARekapModal />
    </div>
  );
}
