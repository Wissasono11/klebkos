import axios from 'axios';

// Di produksi Vercel, selalu prioritaskan reverse proxy relative '/api/v1'
// agar request API tidak diblokir oleh DNS/ISP Indonesia (XL Axiata/Indihome/Telkomsel yang memblokir *.workers.dev ke blockpage)
const PROD_API_URL = '/api/v1';

// Ambil URL dasar API: env var → dev localhost → prod relative reverse proxy
const getBaseURL = () => {
  const envUrl = import.meta?.env?.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    // Proteksi: jika user mengisi workers.dev di Vercel env var,
    // intercept dan arahkan ke '/api/v1' saat di browser Vercel untuk menghindari blokir ISP (ERR_CERT_COMMON_NAME_INVALID)
    if (
      envUrl.includes('workers.dev') &&
      typeof window !== 'undefined' &&
      window.location.hostname.includes('vercel.app')
    ) {
      return '/api/v1';
    }
    return envUrl.trim();
  }
  if (import.meta?.env?.DEV) {
    return 'http://localhost:5000/api/v1';
  }
  return PROD_API_URL;
};

const baseURL = getBaseURL();

// Peringatan jika env var tidak terdefinisi pada mode produksi
if (import.meta?.env?.PROD && !import.meta?.env?.VITE_API_URL) {
  console.info('[KlebKos] VITE_API_URL menggunakan Vercel reverse proxy:', baseURL);
}

export const api = axios.create({
  baseURL,
  timeout: 15000, // 15 detik — antisipasi cold start Cloudflare Workers
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
  // ponytail: removed hardcoded 'demo-bendahara-token' — masks real auth failures
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fallback otomatis: jika request gagal karena network error / blokir DNS ISP, retry via Vercel reverse proxy /api/v1
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
      (originalRequest.baseURL.includes('localhost') || originalRequest.baseURL.includes('workers.dev'))
    ) {
      originalRequest._retry = true;
      originalRequest.baseURL = '/api/v1';
      return axios(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default api;
