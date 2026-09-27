import axios from 'axios';

const PROD_API_URL = 'https://klebkos-backend.bayuwicaksono782.workers.dev/api/v1';

const getBaseURL = () => {
  // Jika dibuka di browser lokal (localhost / 127.0.0.1), wajib ke server backend lokal port 5000
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000/api/v1';
  }
  return import.meta.env.VITE_API_URL || PROD_API_URL;
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor untuk memvalidasi baseURL di dev vs prod dan menyertakan JWT Bearer token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      config.baseURL = 'http://localhost:5000/api/v1';
    } else if (import.meta.env.VITE_API_URL) {
      config.baseURL = import.meta.env.VITE_API_URL;
    }
  }
  let token = localStorage.getItem('supabase_access_token');
  if (!token) {
    try {
      const session = JSON.parse(localStorage.getItem('kaskos_auth_session') || '{}');
      token = session?.token;
    } catch (_) {}
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fallback otomatis: jika server backend lokal port 5000 belum menyala atau offline, alihkan ke Cloudflare Workers
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isNetworkError =
      error.message === 'Network Error' ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNREFUSED';

    if (
      !originalRequest?._retry &&
      isNetworkError &&
      originalRequest?.baseURL &&
      originalRequest.baseURL.includes('localhost:5000')
    ) {
      originalRequest._retry = true;
      originalRequest.baseURL = PROD_API_URL;
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default api;
