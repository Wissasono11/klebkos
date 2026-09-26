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

import { DashboardPage } from './pages/DashboardPage';
import { RoomsPage } from './pages/RoomsPage';
import { VerificationPage } from './pages/VerificationPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { HistoryPage } from './pages/HistoryPage';
import { LoginPage } from './pages/LoginPage';

export default function App() {
  const activeTab = useUIStore((state) => state.activeTab);
  const currentPeriodId = usePeriodStore((state) => state.currentPeriodId);
  const loadPeriods = usePeriodStore((state) => state.loadPeriods);
  const loadRoomData = useRoomStore((state) => state.loadRoomData);
  const loadExpenses = useExpenseStore((state) => state.loadExpenses);
  const loadIncomes = useIncomeStore((state) => state.loadIncomes);

  // Initialize periods on mount
  useEffect(() => {
    loadPeriods();
  }, [loadPeriods]);

  // Load rooms, expenses, and manual incomes whenever active period changes
  useEffect(() => {
    loadRoomData(currentPeriodId);
    loadExpenses(currentPeriodId);
    loadIncomes(currentPeriodId);
  }, [currentPeriodId, loadRoomData, loadExpenses, loadIncomes]);

  if (activeTab === 'login') {
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
