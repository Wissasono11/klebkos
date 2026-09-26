import api from './api';

// Ambil daftar seluruh periode kas
export const fetchPeriodsAPI = async () => {
  const res = await api.get('/periods');
  return res.data;
};

// Buat periode kas bulan baru
export const createPeriodAPI = async (payload) => {
  const res = await api.post('/periods', payload);
  return res.data;
};

// Hapus periode kas bulanan
export const deletePeriodAPI = async (periodId) => {
  const res = await api.delete(`/periods/${periodId}`);
  return res.data;
};


