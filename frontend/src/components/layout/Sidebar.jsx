import React from 'react';
import { MdOutlineSpaceDashboard } from 'react-icons/md';
import {
  Building2,
  FileCheck2,
  Receipt,
  History,
  X,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useRoomStore } from '../../stores/useRoomStore';
import klebenganLogo from '../../assets/klebengan.png';

export const Sidebar = () => {
  const activeTab = useUIStore((state) => state.activeTab);
  const setActiveTab = useUIStore((state) => state.setActiveTab);
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const closeSidebar = useUIStore((state) => state.closeSidebar);
  const addToast = useUIStore((state) => state.addToast);

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const role = useAuthStore((state) => state.role);

  const payments = useRoomStore((state) => state.payments);
  const pendingCount = payments.filter((p) => p.status === 'pending_verification').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: MdOutlineSpaceDashboard },
    { id: 'rooms', label: 'Status Kamar', icon: Building2 },
    {
      id: 'verification',
      label: 'Verifikasi Bukti Bayar',
      icon: FileCheck2,
      badge: pendingCount > 0 ? pendingCount : null
    },
    { id: 'expenses', label: 'Pemasukan & Pengeluaran', icon: Receipt },
    { id: 'history', label: 'Histori & Laporan', icon: History }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-brand-border flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-5 border-b border-brand-border flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-white border border-brand-border flex items-center justify-center shadow-xs shrink-0">
                <img src={klebenganLogo} alt="KlebKos" className="w-full h-full object-contain scale-[1.75]" />
              </div>
              <div className="min-w-0">
                <h1 className="font-extrabold text-base tracking-tight text-brand-text-main leading-tight">
                  KlebKos
                </h1>
                <p className="text-[9.5px] text-brand-text-muted tracking-tight font-bold truncate">
                  Sistem Pencatatan Kos Klebengan
                </p>
              </div>
            </div>
            <button
              onClick={closeSidebar}
              className="lg:hidden p-1 text-brand-text-muted hover:text-brand-text-main hover:bg-brand-surface-2 rounded-lg shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-brand-primary-subtle text-brand-primary shadow-sm'
                      : 'text-brand-text-muted hover:bg-brand-surface-2 hover:text-brand-text-main'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-500 text-white font-extrabold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-brand-border bg-brand-surface-2/50 space-y-3">
          {isLoggedIn && (
            <div className="flex items-center gap-2.5 px-1 py-1">
              <div className="w-8 h-8 rounded-xl bg-brand-primary text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'BK'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-brand-text-main truncate">
                  {user?.name || 'Bendahara KlebKos'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] text-emerald-700 font-bold">Sesi Aktif</span>
                </div>
              </div>
            </div>
          )}

          {isLoggedIn ? (
            <button
              onClick={() => {
                logout('manual');
                setActiveTab('login');
                addToast('Berhasil logout dari sesi bendahara.', 'info');
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-white border border-brand-border hover:bg-rose-50 hover:border-rose-200 text-xs font-bold text-rose-600 flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('login')}
              className="w-full py-2.5 px-3 rounded-xl bg-brand-secondary hover:bg-brand-secondary-hover text-white text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-[0.98]"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
