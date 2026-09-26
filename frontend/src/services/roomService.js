import api from './api';

// Fetch data kamar & status pembayaran
export const fetchRoomsAPI = async (periodId) => {
  const params = periodId ? { period_id: periodId } : {};
  const res = await api.get('/rooms', { params });
  return res.data.data;
};

// Toggle status pembayaran 1 bulan
export const updatePaymentStatusAPI = async (roomId, periodId, isPaid) => {
  const res = await api.post('/payments/toggle', { roomId, periodId, isPaid });
  return res.data.data;
};

// Multi-Month / Advance Payment (Bayar 2 bulan atau lebih sekaligus)
export const processMultiMonthPaymentAPI = async ({ roomId, currentPeriodId, numberOfMonths, paidAmount }) => {
  const res = await api.post('/payments/multi-month', {
    roomId,
    currentPeriodId,
    numberOfMonths,
    paidAmount
  });
  return res.data;
};

// Update data penghuni kamar
export const updateTenantAPI = async (roomId, tenantData) => {
  const res = await api.put(`/rooms/${roomId}/tenant`, tenantData);
  return res.data.data;
};

// Unggah data bukti transfer penghuni
export const submitProofAPI = async ({ roomId, periodId, numberOfMonths, proofUrl, paymentMethod, notes }) => {
  const res = await api.post('/payments/proof', {
    roomId,
    periodId,
    numberOfMonths,
    proofUrl,
    paymentMethod,
    notes
  });
  return res.data;
};

// Ambil antrean verifikasi bukti transfer
export const fetchVerificationQueueAPI = async () => {
  const res = await api.get('/payments/verification-queue');
  return res.data.data;
};

// Setujui bukti transfer
export const approveProofAPI = async (paymentId) => {
  const res = await api.put(`/payments/${paymentId}/approve`);
  return res.data;
};

// Tolak bukti transfer
export const rejectProofAPI = async (paymentId, reason) => {
  const res = await api.put(`/payments/${paymentId}/reject`, { reason });
  return res.data;
};

