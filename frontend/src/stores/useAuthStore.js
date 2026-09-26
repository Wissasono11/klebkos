import { create } from 'zustand';
import { useUIStore } from './useUIStore';

export const useAuthStore = create((set) => ({
  isLoggedIn: true, // Default to logged in as Bendahara for immediate developer preview & testing
  role: 'treasurer', // 'treasurer' | 'public'
  user: {
    name: 'Max Verstappen',
    email: 'bendahara@klebengan.id',
  },

  login: (email, password) => {
    // Simulated auth
    set({
      isLoggedIn: true,
      role: 'treasurer',
      user: {
        name: 'Max Verstappen',
        email: email || 'bendahara@klebengan.id',
      }
    });
    return true;
  },

  logout: () => {
    set({
      isLoggedIn: false,
      role: 'public',
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
        role: willBeLoggedIn ? 'treasurer' : 'public',
        user: willBeLoggedIn ? { name: 'Max Verstappen', email: 'bendahara@klebengan.id' } : null
      };
    });
  }
}));
