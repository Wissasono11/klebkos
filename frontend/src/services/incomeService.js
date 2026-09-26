import api from './api';

// Ambil riwayat pemasukan kas manual berdasarkan periode
export const fetchIncomesAPI = async (periodId) => {
  const params = periodId ? { period_id: periodId } : {};
  const res = await api.get('/incomes', { params });
  return res.data;
};

// Buat catatan pemasukan manual baru
export const createIncomeAPI = async (incomeData) => {
  const res = await api.post('/incomes', incomeData);
  return res.data;
};

// Update catatan pemasukan manual
export const updateIncomeAPI = async (id, updatedData) => {
  const res = await api.put(`/incomes/${id}`, updatedData);
  return res.data;
};

// Hapus catatan pemasukan manual
export const deleteIncomeAPI = async (id) => {
  const res = await api.delete(`/incomes/${id}`);
  return res.data;
};
