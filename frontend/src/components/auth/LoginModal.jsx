import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useUIStore } from '../../stores/useUIStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { ShieldCheck, KeyRound } from 'lucide-react';

export const LoginModal = () => {
  const isLoginModalOpen = useUIStore((state) => state.isLoginModalOpen);
  const closeLoginModal = useUIStore((state) => state.closeLoginModal);
  const addToast = useUIStore((state) => state.addToast);

  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('bendahara@kaskos.id');
  const [password, setPassword] = useState('password123');

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
    addToast('Berhasil masuk sebagai Bendahara dengan hak akses penuh.', 'success');
    closeLoginModal();
  };

  return (
    <Modal
      isOpen={isLoginModalOpen}
      onClose={closeLoginModal}
      title="Login Akses Bendahara"
      subtitle="Verifikasi kewenangan untuk mengelola catatan kas & kamar"
      maxWidth="max-w-sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-primary-subtle text-brand-primary flex items-center justify-center mx-auto mb-2 shadow-xs">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <div>
          <label className="block text-xs font-bold text-brand-text-main mb-1">
            Email Bendahara
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-xs bg-brand-surface-2 border border-brand-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-brand-text-main mb-1">
            Kata Sandi
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full text-xs bg-brand-surface-2 border border-brand-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>

        <div className="p-2.5 bg-brand-surface-2 rounded-xl text-[11px] text-brand-text-muted flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-brand-primary shrink-0" />
          <span>Demo siap pakai: Cukup tekan tombol masuk.</span>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={closeLoginModal}
            className="w-1/2 py-2.5 text-xs font-bold rounded-full border border-brand-border hover:bg-brand-surface-2 text-brand-text-main"
          >
            Batal
          </button>
          <button
            type="submit"
            className="w-1/2 py-2.5 text-xs font-bold rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white shadow-md active:scale-95 transition-all"
          >
            Masuk Bendahara
          </button>
        </div>
      </form>
    </Modal>
  );
};
