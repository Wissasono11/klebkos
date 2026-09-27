import { create } from 'zustand';
import {
  fetchIncomesAPI,
  createIncomeAPI,
  updateIncomeAPI,
  deleteIncomeAPI
} from '../services/incomeService';
import { usePeriodStore } from './usePeriodStore';
import { supabase, isSupabaseConfigured } from '../services/supabase';

export const useIncomeStore = create((set, get) => ({
  incomes: [],
  selectedCategory: 'all',
  selectedIncomeForEdit: null,
  isLoading: false,

  setSelectedCategory: (cat) => set({ selectedCategory: cat }),
  setSelectedIncomeForEdit: (inc) => set({ selectedIncomeForEdit: inc }),

  // Load manual incomes from Backend or direct Supabase fallback
  loadIncomes: async (periodId) => {
    set({ isLoading: true });
    try {
      const response = await fetchIncomesAPI(periodId);
      if (response && Array.isArray(response.data) && response.data.length > 0) {
        set({
          incomes: response.data,
          isLoading: false
        });
        return;
      }

      // Jika response API kosong, lakukan pengecekan ke Supabase langsung
      if (isSupabaseConfigured && supabase) {
        try {
          let query = supabase.from('incomes').select('*').order('income_date', { ascending: false });
          if (periodId) query = query.eq('period_id', periodId);
          const { data, error } = await query;
          if (!error && Array.isArray(data) && data.length > 0) {
            set({ incomes: data, isLoading: false });
            return;
          }
        } catch (_) {}
      }

      set({
        incomes: response && Array.isArray(response.data) ? response.data : [],
        isLoading: false
      });
    } catch (err) {
      console.warn('Backend API error loading incomes, checking Supabase direct:', err.message);
      // Direct Supabase fallback
      if (isSupabaseConfigured && supabase) {
        try {
          let query = supabase.from('incomes').select('*').order('income_date', { ascending: false });
          if (periodId) query = query.eq('period_id', periodId);
          const { data, error } = await query;
          if (!error && Array.isArray(data)) {
            set({ incomes: data, isLoading: false });
            return;
          }
        } catch (_) {}
      }
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
      await get().loadIncomes(newIncome.period_id);
      usePeriodStore.getState().loadPeriods();
    } catch (err) {
      console.warn('Gagal menyimpan pemasukan manual ke backend, mencoba direct Supabase:', err.message);
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.from('incomes').insert({
            period_id: newIncome.period_id,
            title: newIncome.title,
            category: newIncome.category,
            amount: newIncome.amount,
            income_date: newIncome.income_date,
            notes: newIncome.notes
          }).select().single();
          if (!error && data) {
            set((state) => ({
              incomes: state.incomes.map((i) => (i.id === tempId ? data : i))
            }));
            await get().loadIncomes(newIncome.period_id);
            usePeriodStore.getState().loadPeriods();
          }
        } catch (_) {}
      }
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
      const activePeriodId = usePeriodStore.getState().currentPeriodId;
      await get().loadIncomes(activePeriodId);
      usePeriodStore.getState().loadPeriods();
    } catch (err) {
      console.warn('Gagal update pemasukan di backend, mencoba direct Supabase:', err.message);
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('incomes').update(updatedData).eq('id', id);
          const activePeriodId = usePeriodStore.getState().currentPeriodId;
          await get().loadIncomes(activePeriodId);
          usePeriodStore.getState().loadPeriods();
        } catch (_) {}
      }
    }
  },

  deleteIncome: async (id) => {
    const previous = get().incomes;
    set((state) => ({
      incomes: state.incomes.filter((i) => i.id !== id)
    }));

    try {
      await deleteIncomeAPI(id);
      const activePeriodId = usePeriodStore.getState().currentPeriodId;
      await get().loadIncomes(activePeriodId);
      usePeriodStore.getState().loadPeriods();
    } catch (err) {
      console.warn('Gagal hapus pemasukan di backend, mencoba direct Supabase:', err.message);
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('incomes').delete().eq('id', id);
          const activePeriodId = usePeriodStore.getState().currentPeriodId;
          await get().loadIncomes(activePeriodId);
          usePeriodStore.getState().loadPeriods();
        } catch (_) {}
      }
    }
  }
}));
