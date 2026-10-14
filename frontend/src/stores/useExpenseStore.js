import { create } from 'zustand';
import {
  fetchExpensesAPI,
  createExpenseAPI,
  updateExpenseAPI,
  deleteExpenseAPI
} from '../services/expenseService';
import { usePeriodStore } from './usePeriodStore';
import { supabase, isSupabaseConfigured } from '../services/supabase';

export const useExpenseStore = create((set, get) => ({
  expenses: [],
  selectedCategory: 'all',
  selectedExpenseForEdit: null,
  isLoading: false,

  setSelectedCategory: (cat) => set({ selectedCategory: cat }),
  setSelectedExpenseForEdit: (exp) => set({ selectedExpenseForEdit: exp }),

  // Load expenses from Backend / direct Supabase fallback
  loadExpenses: async (periodId) => {
    set({ isLoading: true });

    const fallbackDirectSupabase = async () => {
      if (!isSupabaseConfigured || !supabase) return false;
      try {
        let query = supabase.from('expenses').select('*').order('expense_date', { ascending: false });
        if (periodId) query = query.eq('period_id', periodId);
        const { data: dbExpenses, error: eErr } = await query;
        if (!eErr && Array.isArray(dbExpenses)) {
          set({ expenses: dbExpenses, isLoading: false });
          return true;
        }
      } catch (dbErr) {
        console.warn('Direct Supabase expenses query error:', dbErr.message);
      }
      return false;
    };

    try {
      const response = await fetchExpensesAPI(periodId);
      if (response && Array.isArray(response.data)) {
        set({
          expenses: response.data,
          isLoading: false
        });
        return;
      }
    } catch (err) {
      console.warn('Backend expenses offline, mencoba direct Supabase:', err.message);
    }

    const directSuccess = await fallbackDirectSupabase();
    if (!directSuccess) {
      set({ isLoading: false });
    }
  },

  addExpense: async (expenseData) => {
    const tempId = `exp-${Date.now()}`;
    const newExpense = {
      id: tempId,
      period_id: expenseData.period_id || usePeriodStore.getState().currentPeriodId,
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
      return;
    } catch (err) {
      console.warn('Gagal menyimpan pengeluaran ke backend, mencoba direct Supabase:', err.message);
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: saved, error } = await supabase
            .from('expenses')
            .insert({
              period_id: newExpense.period_id,
              title: newExpense.title,
              category: newExpense.category,
              amount: newExpense.amount,
              expense_date: newExpense.expense_date,
              notes: newExpense.notes
            })
            .select()
            .single();

          if (!error && saved) {
            set((state) => ({
              expenses: state.expenses.map((e) => (e.id === tempId ? saved : e))
            }));
            usePeriodStore.getState().loadPeriods();
            return;
          }
        } catch (dbErr) {
          console.error('Direct Supabase insert expense error:', dbErr.message);
        }
      }
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
      console.warn('Gagal update pengeluaran di backend, mencoba direct Supabase:', err.message);
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('expenses').update(updatedData).eq('id', id);
          usePeriodStore.getState().loadPeriods();
        } catch (_) {}
      }
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
      console.warn('Gagal hapus pengeluaran di backend, mencoba direct Supabase:', err.message);
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('expenses').delete().eq('id', id);
          usePeriodStore.getState().loadPeriods();
          return;
        } catch (_) {}
      }
      set({ expenses: previous });
    }
  }
}));

