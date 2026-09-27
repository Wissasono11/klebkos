import { create } from 'zustand';
import {
  fetchRoomsAPI,
  updatePaymentStatusAPI,
  processMultiMonthPaymentAPI,
  updateTenantAPI,
  submitProofAPI,
  approveProofAPI,
  rejectProofAPI
} from '../services/roomService';
import { usePeriodStore } from './usePeriodStore';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const getInitialFloors = () => {
  try {
    const saved = localStorage.getItem('kaskos_active_floors');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(Number).filter((n) => [1, 2, 3, 4].includes(n));
      }
    }
  } catch (e) {}
  return [1, 2, 3, 4]; // Default seluruh lantai 1-4 aktif
};

export const useRoomStore = create((set, get) => ({
  rooms: [],
  payments: [],
  activeFloors: getInitialFloors(),
  filterStatus: 'all', // 'all' | 'paid' | 'unpaid' | 'pending' | 'vacant'
  searchQuery: '',
  selectedRoomForAdvance: null,
  selectedRoomForEdit: null,
  isLoading: false,

  setFilterStatus: (status) => set({ filterStatus: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedRoomForAdvance: (room) => set({ selectedRoomForAdvance: room }),
  setSelectedRoomForEdit: (room) => set({ selectedRoomForEdit: room }),

  // Dynamic Floor Management (Maksimal 4 Lantai)
  addFloor: (floorNumber) => {
    const { activeFloors } = get();
    const num = Number(floorNumber);
    if (![1, 2, 3, 4].includes(num)) return false;
    if (activeFloors.map(Number).includes(num)) return false;
    if (activeFloors.length >= 4) return false;

    const newFloors = [...activeFloors.map(Number), num].sort((a, b) => a - b);
    set({ activeFloors: newFloors });
    try {
      localStorage.setItem('kaskos_active_floors', JSON.stringify(newFloors));
    } catch (e) {}
    return true;
  },

  removeFloor: (floorNumber) => {
    const { activeFloors } = get();
    const num = Number(floorNumber);
    if (!activeFloors.map(Number).includes(num)) return false;
    if (activeFloors.length <= 1) return false;

    const newFloors = activeFloors.map(Number).filter((f) => f !== num);
    set({ activeFloors: newFloors });
    try {
      localStorage.setItem('kaskos_active_floors', JSON.stringify(newFloors));
    } catch (e) {}
    return true;
  },

  // Load rooms and payments from Backend / Supabase
  loadRoomData: async (periodId) => {
    set({ isLoading: true });

    try {
      const data = await fetchRoomsAPI(periodId);
      if (data && Array.isArray(data.rooms) && data.rooms.length > 0) {
        const normalizedPayments = (data.payments || []).map((p) => ({
          ...p,
          status: p.status || p.payment_status || (p.is_paid ? 'paid' : 'unpaid')
        }));
        set({
          rooms: data.rooms.map((r) => ({ ...r, floor_number: Number(r.floor_number) })),
          payments: normalizedPayments,
          isLoading: false
        });
        return;
      }
    } catch (err) {
      console.warn('Backend rooms API error, mencoba direct Supabase:', err.message);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: dbRooms, error: rErr } = await supabase
          .from('rooms')
          .select('*')
          .order('floor_number', { ascending: true })
          .order('room_number', { ascending: true });

        if (!rErr && Array.isArray(dbRooms) && dbRooms.length > 0) {
          let dbPayments = [];
          if (periodId) {
            const { data: pData } = await supabase
              .from('payments')
              .select('*')
              .eq('period_id', periodId);
            dbPayments = (pData || []).map((p) => ({
              ...p,
              status: p.payment_status || p.status || (p.is_paid ? 'paid' : 'unpaid')
            }));
          }
          set({
            rooms: dbRooms.map((r) => ({ ...r, floor_number: Number(r.floor_number) })),
            payments: dbPayments,
            isLoading: false
          });
          return;
        }
      } catch (dbErr) {
        console.warn('Direct Supabase rooms query error:', dbErr.message);
      }
    }

    set({ isLoading: false });
  },

  // Toggle single payment 1 month
  toggleRoomPayment: async (roomId, periodId) => {
    const activePid = periodId || usePeriodStore.getState().currentPeriodId;
    const { payments } = get();
    const existing = payments.find((p) => p.room_id === roomId && p.period_id === activePid);
    const nextPaid = existing ? !existing.is_paid : true;

    if (existing) {
      set({
        payments: payments.map((p) =>
          p.id === existing.id
            ? {
                ...p,
                is_paid: nextPaid,
                status: nextPaid ? 'paid' : 'unpaid',
                paid_at: nextPaid ? new Date().toISOString() : null,
                advance_months: nextPaid ? 1 : 0
              }
            : p
        )
      });
    } else {
      const newPay = {
        id: `pay-${Date.now()}`,
        period_id: activePid,
        room_id: roomId,
        is_paid: true,
        status: 'paid',
        paid_amount: 50000,
        advance_months: 1,
        paid_at: new Date().toISOString(),
        payment_method: 'Tunai / Manual'
      };
      set({ payments: [...payments, newPay] });
    }

    try {
      await updatePaymentStatusAPI(roomId, activePid, nextPaid);
      usePeriodStore.getState().loadPeriods();
    } catch (err) {
      console.warn('Gagal sinkronisasi status pembayaran ke backend:', err.message);
    }

    return nextPaid;
  },

  // Multi-Month / Advance Payment Feature
  payMultiMonths: async (roomId, currentPeriodId, numberOfMonths = 2) => {
    const { rooms, payments } = get();
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    const monthlyFee = 50000;
    const totalAmount = numberOfMonths * monthlyFee;

    const currentPay = payments.find((p) => p.room_id === roomId && p.period_id === currentPeriodId);
    const updatedPayments = [...payments];
    const noteText = `Lunas ${numberOfMonths} bulan sekaligus (Total Rp ${totalAmount.toLocaleString('id-ID')})`;

    if (currentPay) {
      const idx = updatedPayments.findIndex((p) => p.id === currentPay.id);
      updatedPayments[idx] = {
        ...updatedPayments[idx],
        is_paid: true,
        status: 'paid',
        paid_amount: totalAmount,
        advance_months: numberOfMonths,
        notes: noteText,
        paid_at: new Date().toISOString()
      };
    } else {
      updatedPayments.push({
        id: `pay-${Date.now()}`,
        period_id: currentPeriodId,
        room_id: roomId,
        is_paid: true,
        status: 'paid',
        paid_amount: totalAmount,
        advance_months: numberOfMonths,
        notes: noteText,
        paid_at: new Date().toISOString(),
        payment_method: 'Transfer'
      });
    }

    set({ payments: updatedPayments });

    try {
      await processMultiMonthPaymentAPI({
        roomId,
        currentPeriodId,
        numberOfMonths,
        paidAmount: totalAmount
      });
      usePeriodStore.getState().loadPeriods();
    } catch (err) {
      console.warn('Gagal advance payment ke backend:', err.message);
    }
  },

  // Submit proof by resident
  submitProof: async ({ roomId, periodId, numberOfMonths = 1, proofUrl, notes = '' }) => {
    const { payments } = get();
    const totalAmount = numberOfMonths * 50000;
    const existing = payments.find((p) => p.room_id === roomId && p.period_id === periodId);

    const newProof = {
      id: `pay-${Date.now()}`,
      period_id: periodId,
      room_id: roomId,
      is_paid: false,
      status: 'pending_verification',
      paid_amount: totalAmount,
      advance_months: numberOfMonths,
      proof_url: proofUrl || '',
      paid_at: new Date().toISOString(),
      notes: notes || `Bayar ${numberOfMonths} bulan via Web Portal`
    };

    if (existing) {
      set({
        payments: payments.map((p) => (p.id === existing.id ? newProof : p))
      });
    } else {
      set({ payments: [...payments, newProof] });
    }

    try {
      await submitProofAPI({
        roomId,
        periodId,
        numberOfMonths,
        proofUrl: newProof.proof_url,
        notes
      });
    } catch (err) {
      console.warn('Gagal submit bukti ke backend:', err.message);
    }
  },

  // Approve pending verification
  approvePayment: async (paymentId) => {
    const { payments } = get();
    const pay = payments.find((p) => p.id === paymentId);
    if (!pay) return;

    set({
      payments: payments.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              is_paid: true,
              status: 'paid',
              verified_at: new Date().toISOString()
            }
          : p
      )
    });

    try {
      await approveProofAPI(paymentId);
      usePeriodStore.getState().loadPeriods();
    } catch (err) {
      console.warn('Gagal approve bukti di backend:', err.message);
    }
  },

  // Reject pending verification
  rejectPayment: async (paymentId, reason) => {
    const { payments } = get();
    set({
      payments: payments.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              is_paid: false,
              status: 'rejected',
              rejection_reason: reason || 'Bukti transfer tidak valid/tidak terbaca',
              verified_at: new Date().toISOString()
            }
          : p
      )
    });

    try {
      await rejectProofAPI(paymentId, reason);
    } catch (err) {
      console.warn('Gagal reject bukti di backend:', err.message);
    }
  },

  // Update tenant information
  updateTenant: async (roomId, { tenant_name, phone_number, is_occupied }) => {
    const { rooms } = get();
    set({
      rooms: rooms.map((r) =>
        r.id === roomId
          ? {
              ...r,
              tenant_name,
              phone_number,
              is_occupied: is_occupied !== undefined ? is_occupied : Boolean(tenant_name?.trim())
            }
          : r
      )
    });

    try {
      await updateTenantAPI(roomId, { tenant_name, phone_number, is_occupied });
    } catch (err) {
      console.warn('Gagal update tenant di backend:', err.message);
    }
  }
}));
