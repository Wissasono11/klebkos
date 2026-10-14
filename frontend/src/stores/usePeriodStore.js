import { create } from 'zustand';
import { fetchPeriodsAPI, createPeriodAPI, deletePeriodAPI } from '../services/periodService';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const MONTH_NAMES = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const usePeriodStore = create((set, get) => ({
  currentPeriodId: null,
  isLoading: false,
  error: null,
  periods: [],
  isAddPeriodModalOpen: false,

  setIsAddPeriodModalOpen: (open) => set({ isAddPeriodModalOpen: open }),
  setCurrentPeriodId: (id) => set({ currentPeriodId: id }),

  getCurrentPeriod: () => {
    const { periods, currentPeriodId } = get();
    return periods.find((p) => p.id === currentPeriodId) || periods[0] || null;
  },

  loadPeriods: async (retryCount = 0) => {
    set({ isLoading: true, error: null });

    const fallbackDirectSupabase = async () => {
      if (!isSupabaseConfigured || !supabase) return false;
      try {
        const { data: dbPeriods, error: pErr } = await supabase
          .from('monthly_periods')
          .select('*')
          .order('year_number', { ascending: false })
          .order('month_number', { ascending: false });

        if (!pErr && Array.isArray(dbPeriods) && dbPeriods.length > 0) {
          const currentValid = dbPeriods.some((p) => p.id === get().currentPeriodId);
          const defaultPeriod = dbPeriods.find((p) => !p.is_closed) || dbPeriods[0];

          set({
            periods: dbPeriods,
            currentPeriodId: currentValid ? get().currentPeriodId : (defaultPeriod?.id || null),
            isLoading: false,
            error: null
          });
          return true;
        }
      } catch (dbErr) {
        console.warn('Direct Supabase periods query error:', dbErr.message);
      }
      return false;
    };

    try {
      const res = await fetchPeriodsAPI();
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        const fetchedPeriods = res.data;
        const currentValid = fetchedPeriods.some((p) => p.id === get().currentPeriodId);

        // Pilih default: periode terbaru yang belum ditutup (urut year desc, month desc)
        const sorted = [...fetchedPeriods].sort((a, b) =>
          b.year_number - a.year_number || b.month_number - a.month_number
        );
        const defaultPeriod = sorted.find((p) => !p.is_closed) || sorted[0];

        set({
          periods: fetchedPeriods,
          currentPeriodId: currentValid ? get().currentPeriodId : (defaultPeriod?.id || null),
          isLoading: false,
          error: null
        });
        return;
      }
    } catch (err) {
      console.warn('Backend periods offline, mencoba direct Supabase:', err.message);
    }

    // Direct Supabase fallback
    const directSuccess = await fallbackDirectSupabase();
    if (directSuccess) return;

    // Retry otomatis jika Supabase dan backend keduanya belum merespon
    if (retryCount < 3) {
      const delay = Math.pow(2, retryCount + 1) * 1000;
      set({ error: `Server sedang bangun, mencoba ulang dalam ${delay / 1000} detik...` });
      setTimeout(() => get().loadPeriods(retryCount + 1), delay);
    } else {
      set({ isLoading: false, error: 'Gagal memuat data periode. Coba muat ulang halaman.' });
    }
  },

  createPeriod: async (periodData) => {
    set({ isLoading: true });
    try {
      const res = await createPeriodAPI(periodData);
      if (res && res.data) {
        const newPeriod = res.data;
        await get().loadPeriods();
        set({
          currentPeriodId: newPeriod.id,
          isLoading: false
        });
        return newPeriod;
      }
    } catch (err) {
      console.warn('Backend createPeriod failed, trying direct Supabase:', err.message);
      if (isSupabaseConfigured && supabase) {
        try {
          const monthNum = parseInt(periodData.month_number, 10);
          const yearNum = parseInt(periodData.year_number, 10);
          const periodName = `${MONTH_NAMES[monthNum]} ${yearNum}`;
          const deadline = periodData.deadline_date || `${yearNum}-${String(monthNum).padStart(2, '0')}-19`;

          const { data: newPeriod, error: pErr } = await supabase
            .from('monthly_periods')
            .insert({
              period_name: periodName,
              month_number: monthNum,
              year_number: yearNum,
              monthly_fee: Number(periodData.monthly_fee) || 50000,
              starting_balance: Number(periodData.starting_balance) || 0,
              deadline_date: deadline,
              is_closed: false
            })
            .select()
            .single();

          if (!pErr && newPeriod) {
            // Inisialisasi tagihan payments untuk kamar
            const { data: rooms } = await supabase.from('rooms').select('id');
            if (rooms && rooms.length > 0) {
              const initialPayments = rooms.map((r) => ({
                period_id: newPeriod.id,
                room_id: r.id,
                is_paid: false,
                payment_status: 'unpaid',
                paid_amount: Number(periodData.monthly_fee) || 50000,
                advance_months: 1
              }));
              await supabase.from('payments').upsert(initialPayments, { onConflict: 'period_id,room_id' });
            }

            await get().loadPeriods();
            set({ currentPeriodId: newPeriod.id, isLoading: false });
            return newPeriod;
          }
        } catch (dbErr) {
          console.error('Direct Supabase createPeriod error:', dbErr.message);
        }
      }
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




