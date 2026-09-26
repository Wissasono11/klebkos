import { create } from 'zustand';
import { fetchPeriodsAPI, createPeriodAPI, deletePeriodAPI } from '../services/periodService';

export const usePeriodStore = create((set, get) => ({
  currentPeriodId: null,
  isLoading: false,
  periods: [],
  isAddPeriodModalOpen: false,

  setIsAddPeriodModalOpen: (open) => set({ isAddPeriodModalOpen: open }),
  setCurrentPeriodId: (id) => set({ currentPeriodId: id }),

  getCurrentPeriod: () => {
    const { periods, currentPeriodId } = get();
    return periods.find((p) => p.id === currentPeriodId) || periods[0] || null;
  },

  loadPeriods: async () => {
    set({ isLoading: true });
    try {
      const res = await fetchPeriodsAPI();
      if (res && Array.isArray(res.data)) {
        const fetchedPeriods = res.data;
        const currentValid = fetchedPeriods.some((p) => p.id === get().currentPeriodId);

        // Pilih default: September 2026 atau bulan aktif yang belum ditutup
        const defaultPeriod =
          fetchedPeriods.find((p) => p.period_name.toLowerCase().includes('september')) ||
          fetchedPeriods.find((p) => !p.is_closed) ||
          fetchedPeriods[0];

        set({
          periods: fetchedPeriods,
          currentPeriodId: currentValid ? get().currentPeriodId : (defaultPeriod?.id || null),
          isLoading: false
        });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.warn('Backend periods offline:', err.message);
      set({ isLoading: false });
    }
  },

  createPeriod: async (periodData) => {
    set({ isLoading: true });
    try {
      const res = await createPeriodAPI(periodData);
      if (res && res.data) {
        const newPeriod = res.data;
        const exists = get().periods.some((p) => p.id === newPeriod.id);
        const updatedPeriods = exists
          ? get().periods.map((p) => (p.id === newPeriod.id ? newPeriod : p))
          : [newPeriod, ...get().periods];

        set({
          periods: updatedPeriods,
          currentPeriodId: newPeriod.id,
          isLoading: false
        });
        return newPeriod;
      }
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  deletePeriod: async (periodId) => {
    set({ isLoading: true });
    try {
      await deletePeriodAPI(periodId);
      const remainingPeriods = get().periods.filter((p) => p.id !== periodId);
      const isDeletingCurrent = get().currentPeriodId === periodId;
      const nextActiveId = isDeletingCurrent ? (remainingPeriods[0]?.id || null) : get().currentPeriodId;

      set({
        periods: remainingPeriods,
        currentPeriodId: nextActiveId,
        isLoading: false
      });

      // Recalculate carryover balances across remaining periods
      await get().loadPeriods();
      return true;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  // Navigasi ke bulan sebelumnya
  goToPrevPeriod: () => {
    const { periods, currentPeriodId } = get();
    if (periods.length <= 1) return;
    const currentIndex = periods.findIndex((p) => p.id === currentPeriodId);
    // periods terurut descending (Desember -> Juli)
    if (currentIndex < periods.length - 1) {
      set({ currentPeriodId: periods[currentIndex + 1].id });
    }
  },

  // Navigasi ke bulan berikutnya
  goToNextPeriod: () => {
    const { periods, currentPeriodId } = get();
    if (periods.length <= 1) return;
    const currentIndex = periods.findIndex((p) => p.id === currentPeriodId);
    // periods terurut descending (Desember -> Juli)
    if (currentIndex > 0) {
      set({ currentPeriodId: periods[currentIndex - 1].id });
    }
  }
}));




