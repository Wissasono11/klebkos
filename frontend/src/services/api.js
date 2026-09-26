import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
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
