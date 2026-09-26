import { create } from 'zustand';
import {
  fetchIncomesAPI,
  createIncomeAPI,
  updateIncomeAPI,
  deleteIncomeAPI
} from '../services/incomeService';
import { usePeriodStore } from './usePeriodStore';

export const useIncomeStore = create((set, get) => ({
  incomes: [],
  selectedCategory: 'all',
  selectedIncomeForEdit: null,
  isLoading: false,

  setSelectedCategory: (cat) => set({ selectedCategory: cat }),
  setSelectedIncomeForEdit: (inc) => set({ selectedIncomeForEdit: inc }),

  // Load manual incomes from Backend
  loadIncomes: async (periodId) => {
    set({ isLoading: true });
    try {
      const response = await fetchIncomesAPI(periodId);
      if (response && Array.isArray(response.data)) {
        set({
          incomes: response.data,
          isLoading: false
        });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.warn('Backend offline or error loading incomes:', err.message);
      set({ isLoading: false });
    }
  },

  addIncome: async (incomeData) => {
    const tempId = `inc-${Date.now()}`;
    const newIncome = {
      id: tempId,
      period_id: incomeData.period_id,
      title: incomeData.title,
      category: incomeData.category || 'Iuran Manual',
      amount: Number(incomeData.amount) || 0,
      income_date: incomeData.income_date || new Date().toISOString().split('T')[0],
      notes: incomeData.notes || ''
    };

    set((state) => ({ incomes: [newIncome, ...state.incomes] }));

    try {
      const res = await createIncomeAPI(newIncome);
      if (res && res.data) {
        set((state) => ({
          incomes: state.incomes.map((i) => (i.id === tempId ? res.data : i))
        }));
      }
      usePeriodStore.getState().loadPeriods();
    } catch (err) {
      console.warn('Gagal menyimpan pemasukan manual ke backend:', err.message);
    }
  },

  updateIncome: async (id, updatedData) => {
    set((state) => ({
      incomes: state.incomes.map((i) =>
        i.id === id
          ? {
              ...i,
              ...updatedData,
              amount: updatedData.amount !== undefined ? Number(updatedData.amount) : i.amount
            }
          : i
      )
    }));

    try {
      await updateIncomeAPI(id, updatedData);
      usePeriodStore.getState().loadPeriods();
    } catch (err) {
      console.warn('Gagal update pemasukan di backend:', err.message);
    }
  },

  deleteIncome: async (id) => {
    const previous = get().incomes;
    set((state) => ({
      incomes: state.incomes.filter((i) => i.id !== id)
    }));

    try {
      await deleteIncomeAPI(id);
      usePeriodStore.getState().loadPeriods();
    } catch (err) {
      console.warn('Gagal hapus pemasukan di backend, rollback:', err.message);
      set({ incomes: previous });
    }
  }
}));
