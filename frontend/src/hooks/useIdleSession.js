import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore, SESSION_TIMEOUT_MS } from '../stores/useAuthStore';
import { useUIStore } from '../stores/useUIStore';

/**
 * Hook untuk memantau aktivitas pengguna dan melakukan auto-logout saat sesi idle (inaktif)
 * @param {number} timeoutMs Batas waktu inaktivitas dalam milidetik (default 15 menit)
 */
export function useIdleSession(timeoutMs = SESSION_TIMEOUT_MS) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const lastActivity = useAuthStore((state) => state.lastActivity);
  const recordActivity = useAuthStore((state) => state.recordActivity);
  const logout = useAuthStore((state) => state.logout);
  const addToast = useUIStore((state) => state.addToast);

  const lastRecordedRef = useRef(Date.now());
  const timerCheckRef = useRef(null);

  // Throttled handler untuk merekam aktivitas (maks 1x per 2.5 detik)
  const handleUserActivity = useCallback(() => {
    if (!isLoggedIn) return;

    const now = Date.now();
    if (now - lastRecordedRef.current > 2500) {
      lastRecordedRef.current = now;
      recordActivity();
    }
  }, [isLoggedIn, recordActivity]);

  // Pemeriksaan kedaluwarsa sesi
  const checkTimeout = useCallback(() => {
    if (!isLoggedIn) return;

    const currentLastActivity = useAuthStore.getState().lastActivity;
    if (!currentLastActivity) return;

    const elapsed = Date.now() - currentLastActivity;

    if (elapsed >= timeoutMs) {
      // Inactivity timeout tercapai -> logout otomatis
      logout('idle');
      addToast(
        'Sesi Anda telah berakhir karena tidak ada aktivitas selama 15 menit. Silakan login kembali.',
        'warning'
      );
    }
  }, [isLoggedIn, timeoutMs, logout, addToast]);

  useEffect(() => {
    if (!isLoggedIn) return;

    // Reset timestamp saat login aktif
    lastRecordedRef.current = Date.now();
    recordActivity();

    // Event listener yang mencerminkan aktivitas interaksi pengguna
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    // Pengecekan berkala setiap 5 detik
    timerCheckRef.current = setInterval(checkTimeout, 5000);

    // Cek juga saat tab kembali aktif (user beralih tab atau wake up dari sleep)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkTimeout();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', checkTimeout);

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
      if (timerCheckRef.current) {
        clearInterval(timerCheckRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', checkTimeout);
    };
  }, [isLoggedIn, handleUserActivity, checkTimeout, recordActivity]);

  return {
    isLoggedIn,
    lastActivity
  };
}

export default useIdleSession;
