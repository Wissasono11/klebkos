import { create } from 'zustand';
import {
  fetchExpensesAPI,
  createExpenseAPI,
  updateExpenseAPI,
  deleteExpenseAPI
} from '../services/expenseService';
import { usePeriodStore } from './usePeriodStore';

export const useExpenseStore = create((set, get) => ({
  expenses: [],
  selectedCategory: 'all',
  selectedExpenseForEdit: null,
  isLoading: false,

  setSelectedCategory: (cat) => set({ selectedCategory: cat }),
  setSelectedExpenseForEdit: (exp) => set({ selectedExpenseForEdit: exp }),

  // Load expenses from Backend / Supabase
  loadExpenses: async (periodId) => {
    set({ isLoading: true });
    try {
      const response = await fetchExpensesAPI(periodId);
      if (response && Array.isArray(response.data)) {
        set({
          expenses: response.data,
          isLoading: false
        });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.warn('Backend offline:', err.message);
      set({ isLoading: false });
    }
  },

  addExpense: async (expenseData) => {
    const tempId = `exp-${Date.now()}`;
    const newExpense = {
      id: tempId,
      period_id: expenseData.period_id || 'b8569bcd-90d5-44dd-8e6e-8dafb358abd2',
      title: expenseData.title,
      category: expenseData.category || 'Lain-lain',
      amount: Number(expenseData.amount) || 0,
      expense_date: expenseData.expense_date || new Date().toISOString().split('T')[0],
      notes: expenseData.notes || ''
    };

    set((state) => ({ expenses: [newExpense, ...state.expenses] }));

    try {
      const res = await createExpenseAPI(newExpense);
      if (res && res.data) {
        set((state) => ({
          expenses: state.expenses.map((e) => (e.id === tempId ? res.data : e))
        }));
      }
      usePeriodStore.getState().loadPeriods();
    } catch (err) {
      console.warn('Gagal menyimpan pengeluaran ke backend:', err.message);
    }
  },

  updateExpense: async (id, updatedData) => {
    set((state) => ({
      expenses: state.expenses.map((e) =>
        e.id === id
          ? {
              ...e,
              ...updatedData,
              amount: updatedData.amount !== undefined ? Number(updatedData.amount) : e.amount
            }
          : e
      )
    }));

    try {
      await updateExpenseAPI(id, updatedData);
      usePeriodStore.getState().loadPeriods();
    } catch (err) {
      console.warn('Gagal update pengeluaran di backend:', err.message);
    }
  },

  deleteExpense: async (id) => {
    const previous = get().expenses;
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id)
    }));

    try {
      await deleteExpenseAPI(id);
      usePeriodStore.getState().loadPeriods();
    } catch (err) {
      console.warn('Gagal hapus pengeluaran di backend, rollback:', err.message);
      set({ expenses: previous });
    }
  }
}));

