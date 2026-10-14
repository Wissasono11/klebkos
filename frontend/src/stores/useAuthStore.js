import { create } from 'zustand';
import { useUIStore } from './useUIStore';

export const SESSION_STORAGE_KEY = 'kaskos_auth_session';

// Batas waktu sesi: 3 hari tanpa akses (3 * 24 * 60 * 60 * 1000 ms = 259.200.000 ms)
export const SESSION_TIMEOUT_MS = 3 * 24 * 60 * 60 * 1000;

let initialExpiredNotice = false;

// Helper memeriksa sesi yang tersimpan di localStorage dengan validasi batas waktu 3 hari
const getStoredSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw);
    const now = Date.now();
    const lastAccessed = session.lastAccessedAt || session.loginTime;

    // Cek apakah website sudah tidak diakses lebih dari 3 hari
    if (!lastAccessed || now - lastAccessed > SESSION_TIMEOUT_MS) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem('supabase_access_token');
      initialExpiredNotice = true;
      return null;
    }

    // Perbarui waktu akses terakhir (sliding expiration)
    session.lastAccessedAt = now;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

    return {
      user: session.user || {
        name: 'Bendahara KlebKos',
        email: 'bendahara@klebengan.id',
      },
      role: session.role || 'treasurer',
      token: session.token || 'demo-bendahara-token',
      loginTime: session.loginTime || now,
      lastAccessedAt: now
    };
  } catch (_) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
};

const initialSession = getStoredSession();

export const useAuthStore = create((set, get) => ({
  // Default isLoggedIn adalah FALSE jika tidak ada sesi tersimpan atau sesi sudah > 3 hari
  isLoggedIn: Boolean(initialSession),
  role: initialSession ? initialSession.role : 'guest',
  user: initialSession ? initialSession.user : null,
  sessionExpiredNotice: initialExpiredNotice,
  _lastTouch: Date.now(),

  clearSessionNotice: () => set({ sessionExpiredNotice: false }),

  // Memperbarui timestamp akses terakhir saat user aktif berinteraksi
  touchSession: () => {
    if (!get().isLoggedIn) return;
    const now = Date.now();
    // Throttle agar tidak membebani localStorage (cukup tiap 5 menit jika user terus aktif)
    if (now - get()._lastTouch < 5 * 60 * 1000) return;

    set({ _lastTouch: now });
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        session.lastAccessedAt = now;
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      }
    } catch (_) {}
  },

  // Memeriksa apakah sesi telah kedaluwarsa (> 3 hari tanpa akses)
  checkSessionExpiry: () => {
    if (!get().isLoggedIn) return false;
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) {
        get().logout(true);
        return false;
      }

      const session = JSON.parse(raw);
      const lastAccessed = session.lastAccessedAt || session.loginTime;
      const now = Date.now();

      if (!lastAccessed || now - lastAccessed > SESSION_TIMEOUT_MS) {
        get().logout(true);
        try {
          useUIStore.getState().addToast(
            'Sesi Anda telah berakhir karena tidak diakses selama 3 hari. Silakan masuk kembali.',
            'info'
          );
        } catch (_) {}
        return false;
      }

      // Sesi masih valid, segarkan timestamp
      get().touchSession();
      return true;
    } catch (_) {
      get().logout(true);
      return false;
    }
  },

  login: async (email, password) => {
    const cleanEmail = (email || '').trim();
    const cleanPass = (password || '').trim();

    if (!cleanEmail || !cleanPass) {
      return {
        success: false,
        error: 'Email dan kata sandi wajib diisi.'
      };
    }

    const userObj = {
      name: cleanEmail.toLowerCase().includes('bendahara') ? 'Bendahara KlebKos' : 'Pengelola Kos',
      email: cleanEmail,
    };
    const token = 'demo-bendahara-token';
    const now = Date.now();

    const sessionData = {
      user: userObj,
      role: 'treasurer',
      token,
      loginTime: now,
      lastAccessedAt: now
    };

    // Simpan ke localStorage agar sesi tetap bertahan hingga 3 hari tanpa akses
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      localStorage.setItem('supabase_access_token', token);
    } catch (_) {}

    set({
      isLoggedIn: true,
      role: 'treasurer',
      user: userObj,
      sessionExpiredNotice: false,
      _lastTouch: now
    });

    try {
      useUIStore.getState().setActiveTab('dashboard');
    } catch (_) {}

    return { success: true, user: userObj };
  },

  logout: (isExpired = false) => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem('supabase_access_token');
    } catch (_) {}

    set({
      isLoggedIn: false,
      role: 'guest',
      user: null,
      sessionExpiredNotice: isExpired
    });

    try {
      useUIStore.getState().setActiveTab('login');
    } catch (_) {}
  },

  toggleRole: () => {
    set((state) => {
      const willBeLoggedIn = !state.isLoggedIn;
      const now = Date.now();
      if (!willBeLoggedIn) {
        try {
          localStorage.removeItem(SESSION_STORAGE_KEY);
          localStorage.removeItem('supabase_access_token');
          useUIStore.getState().setActiveTab('login');
        } catch (_) {}
      } else {
        try {
          localStorage.setItem(
            SESSION_STORAGE_KEY,
            JSON.stringify({
              user: { name: 'Bendahara KlebKos', email: 'bendahara@klebengan.id' },
              role: 'treasurer',
              token: 'demo-bendahara-token',
              loginTime: now,
              lastAccessedAt: now
            })
          );
        } catch (_) {}
      }
      return {
        isLoggedIn: willBeLoggedIn,
        role: willBeLoggedIn ? 'treasurer' : 'guest',
        user: willBeLoggedIn ? { name: 'Bendahara KlebKos', email: 'bendahara@klebengan.id' } : null,
        _lastTouch: now
      };
    });
  }
}));
