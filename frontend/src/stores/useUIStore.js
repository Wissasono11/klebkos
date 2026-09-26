import { create } from 'zustand';

export const useUIStore = create((set, get) => ({
  activeTab: 'dashboard',
  isSidebarOpen: false,
  isLoginModalOpen: false,
  isUploadModalOpen: false,
  isAddExpenseModalOpen: false,
  isAddIncomeModalOpen: false,
  isWARekapModalOpen: false,
  activeLightboxProof: null,
  toasts: [],

  setActiveTab: (tab) => set({ activeTab: tab, isSidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  
  openLoginModal: () => set({ activeTab: 'login', isSidebarOpen: false }),
  closeLoginModal: () => set({ activeTab: 'dashboard' }),
  
  openUploadModal: () => set({ isUploadModalOpen: true }),
  closeUploadModal: () => set({ isUploadModalOpen: false }),
  
  openAddExpenseModal: () => set({ isAddExpenseModalOpen: true }),
  closeAddExpenseModal: () => set({ isAddExpenseModalOpen: false }),

  openAddIncomeModal: () => set({ isAddIncomeModalOpen: true }),
  closeAddIncomeModal: () => set({ isAddIncomeModalOpen: false }),

  openWARekapModal: () => set({ isWARekapModalOpen: true }),
  closeWARekapModal: () => set({ isWARekapModalOpen: false }),

  openLightboxProof: (proofData) => set({ activeLightboxProof: proofData }),
  closeLightboxProof: () => set({ activeLightboxProof: null }),

  addToast: (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    const newToast = { id, message, type };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    setTimeout(() => {
      get().removeToast(id);
    }, 3500);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  }
}));
