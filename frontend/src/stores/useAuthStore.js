import { create } from 'zustand';
import { useUIStore } from './useUIStore';

// Batas waktu inaktivitas: 15 menit (15 * 60 * 1000 ms)
export const SESSION_TIMEOUT_MS = 15 * 60 * 1000;
export const SESSION_STORAGE_KEY = 'kaskos_auth_session';

// Helper memeriksa dan memvalidasi sesi awal dari localStorage
const getStoredSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw);
    const now = Date.now();

    // Validasi apakah sesi telah kedaluwarsa karena tidak ada aktivitas
    if (session.lastActivity && now - session.lastActivity > SESSION_TIMEOUT_MS) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem('supabase_access_token');
      return { expired: true };
    }

    return {
      expired: false,
      user: session.user || {
        name: 'Bendahara KlebKos',
        email: 'bendahara@klebengan.id',
      },
      role: session.role || 'treasurer',
      token: session.token || 'demo-bendahara-token',
      lastActivity: now // Segarkan aktivitas saat restore
    };
  } catch (_) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
};

const initialSession = getStoredSession();

export const useAuthStore = create((set, get) => ({
  // Default isLoggedIn adalah FALSE jika tidak ada sesi aktif yang valid
  isLoggedIn: Boolean(initialSession && !initialSession.expired),
  role: initialSession && !initialSession.expired ? initialSession.role : 'guest',
  user: initialSession && !initialSession.expired ? initialSession.user : null,
  lastActivity: initialSession && !initialSession.expired ? initialSession.lastActivity : null,
  sessionExpiredReason: initialSession?.expired ? 'idle' : null,

  login: async (email, password) => {
    const cleanEmail = (email || '').trim();
    const cleanPass = (password || '').trim();

    if (!cleanEmail || !cleanPass) {
      return {
        success: false,
        error: 'Email dan kata sandi wajib diisi.'
      };
    }

    const now = Date.now();
    const userObj = {
      name: cleanEmail.toLowerCase().includes('bendahara') ? 'Bendahara KlebKos' : 'Pengelola Kos',
      email: cleanEmail,
    };
    const token = 'demo-bendahara-token';

    const sessionData = {
      user: userObj,
      role: 'treasurer',
      token,
      lastActivity: now,
      loginTime: now
    };

    // Simpan ke localStorage untuk persistensi sesi
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      localStorage.setItem('supabase_access_token', token);
      localStorage.removeItem('kaskos_logout_reason');
    } catch (_) {}

    set({
      isLoggedIn: true,
      role: 'treasurer',
      user: userObj,
      lastActivity: now,
      sessionExpiredReason: null
    });

    try {
      useUIStore.getState().setActiveTab('dashboard');
    } catch (_) {}

    return { success: true, user: userObj };
  },

  logout: (reason = 'manual') => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem('supabase_access_token');
      if (reason === 'idle') {
        localStorage.setItem('kaskos_logout_reason', 'idle');
      } else {
        localStorage.removeItem('kaskos_logout_reason');
      }
    } catch (_) {}

    set({
      isLoggedIn: false,
      role: 'guest',
      user: null,
      lastActivity: null,
      sessionExpiredReason: reason
    });

    try {
      useUIStore.getState().setActiveTab('login');
    } catch (_) {}
  },

  recordActivity: () => {
    const { isLoggedIn } = get();
    if (!isLoggedIn) return;

    const now = Date.now();
    set({ lastActivity: now });

    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        session.lastActivity = now;
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      }
    } catch (_) {}
  },

  checkSessionValidity: () => {
    const { isLoggedIn, lastActivity } = get();
    if (!isLoggedIn) return false;

    const now = Date.now();
    if (lastActivity && now - lastActivity >= SESSION_TIMEOUT_MS) {
      get().logout('idle');
      return false;
    }
    return true;
  },

  clearSessionNotice: () => set({ sessionExpiredReason: null }),

  toggleRole: () => {
    set((state) => {
      const willBeLoggedIn = !state.isLoggedIn;
      if (!willBeLoggedIn) {
        try {
          useUIStore.getState().setActiveTab('login');
        } catch (_) {}
      }
      return {
        isLoggedIn: willBeLoggedIn,
        role: willBeLoggedIn ? 'treasurer' : 'guest',
        user: willBeLoggedIn ? { name: 'Bendahara KlebKos', email: 'bendahara@klebengan.id' } : null
      };
    });
  }
}));
