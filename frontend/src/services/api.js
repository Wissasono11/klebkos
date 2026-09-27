import axios from 'axios';

const PROD_API_URL = 'https://klebkos-backend.bayuwicaksono782.workers.dev/api/v1';

// Ambil URL dasar API: prioritaskan environment variable VITE_API_URL jika tersedia
const getBaseURL = () => {
  const envUrl = import.meta?.env?.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim();
  }
  return PROD_API_URL;
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor untuk menyertakan JWT Bearer token ke setiap request
api.interceptors.request.use((config) => {
  let token = localStorage.getItem('supabase_access_token');
  if (!token) {
    try {
      const session = JSON.parse(localStorage.getItem('kaskos_auth_session') || '{}');
      token = session?.token;
    } catch (_) {}
  }
  if (!token) {
    token = 'demo-bendahara-token';
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fallback otomatis: jika request ke localhost gagal karena server backend lokal tidak menyala, arahkan ke Cloudflare Workers
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
      originalRequest.baseURL.includes('localhost')
    ) {
      originalRequest._retry = true;
      originalRequest.baseURL = PROD_API_URL;
      return axios(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default api;
