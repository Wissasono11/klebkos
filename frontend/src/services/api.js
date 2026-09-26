import axios from 'axios';

const PROD_API_URL = 'https://klebkos-backend.bayuwicaksono782.workers.dev/api/v1';

const getBaseURL = () => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return PROD_API_URL;
  }
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl;
  }
  return import.meta.env.DEV ? 'http://localhost:5000/api/v1' : PROD_API_URL;
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor untuk memvalidasi baseURL di production dan menyertakan JWT Bearer token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    if (!config.baseURL || config.baseURL.includes('localhost')) {
      config.baseURL = PROD_API_URL;
    }
  }
  const token = localStorage.getItem('supabase_access_token') || 'demo-bendahara-token';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
