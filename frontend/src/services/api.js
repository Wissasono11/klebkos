import axios from 'axios';

const DEFAULT_API_URL = 'https://klebkos-backend.bayuwicaksono782.workers.dev/api/v1';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || DEFAULT_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor untuk menyertakan Supabase JWT Bearer token jika tersedia di localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('supabase_access_token') || 'demo-bendahara-token';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
