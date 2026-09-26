import api from './api';

// Ambil riwayat pengeluaran kas berdasarkan periode
export const fetchExpensesAPI = async (periodId) => {
  const params = periodId ? { period_id: periodId } : {};
  const res = await api.get('/expenses', { params });
  return res.data;
};

// Buat catatan pengeluaran baru
export const createExpenseAPI = async (expenseData) => {
  const res = await api.post('/expenses', expenseData);
  return res.data;
};

// Update catatan pengeluaran yang sudah ada
export const updateExpenseAPI = async (id, updatedData) => {
  const res = await api.put(`/expenses/${id}`, updatedData);
  return res.data;
};

// Hapus catatan pengeluaran
export const deleteExpenseAPI = async (id) => {
  const res = await api.delete(`/expenses/${id}`);
  return res.data;
};
