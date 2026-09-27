import { create } from 'zustand';
import { useUIStore } from './useUIStore';

export const SESSION_STORAGE_KEY = 'kaskos_auth_session';

// Helper memeriksa sesi yang tersimpan di localStorage
const getStoredSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw);
    return {
      user: session.user || {
        name: 'Bendahara KlebKos',
        email: 'bendahara@klebengan.id',
      },
      role: session.role || 'treasurer',
      token: session.token || 'demo-bendahara-token'
    };
  } catch (_) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
};

const initialSession = getStoredSession();

export const useAuthStore = create((set, get) => ({
  // Default isLoggedIn adalah FALSE jika tidak ada sesi tersimpan
  isLoggedIn: Boolean(initialSession),
  role: initialSession ? initialSession.role : 'guest',
  user: initialSession ? initialSession.user : null,

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

    const sessionData = {
      user: userObj,
      role: 'treasurer',
      token,
      loginTime: Date.now()
    };

    // Simpan ke localStorage agar sesi tetap bertahan
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      localStorage.setItem('supabase_access_token', token);
    } catch (_) {}

    set({
      isLoggedIn: true,
      role: 'treasurer',
      user: userObj
    });

    try {
      useUIStore.getState().setActiveTab('dashboard');
    } catch (_) {}

    return { success: true, user: userObj };
  },

  logout: () => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem('supabase_access_token');
    } catch (_) {}

    set({
      isLoggedIn: false,
      role: 'guest',
      user: null
    });

    try {
      useUIStore.getState().setActiveTab('login');
    } catch (_) {}
  },

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
