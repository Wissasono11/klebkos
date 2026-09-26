import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useAuthStore } from '../stores/useAuthStore';
import { useUIStore } from '../stores/useUIStore';
import { Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import klebenganLogo from '../assets/klebengan.png';

gsap.registerPlugin(useGSAP);

export const LoginPage = () => {
  const containerRef = useRef(null);
  const login = useAuthStore((state) => state.login);
  const setActiveTab = useUIStore((state) => state.setActiveTab);
  const addToast = useUIStore((state) => state.addToast);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useGSAP(() => {
    gsap.from('.login-card', {
      y: 20,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
      clearProps: 'all'
    });
  }, { scope: containerRef });

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
    addToast('Berhasil masuk sebagai Bendahara dengan hak akses penuh.', 'success');
    setActiveTab('dashboard');
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-brand-bg relative selection:bg-brand-primary-subtle selection:text-brand-primary"
    >
      <div className="login-card w-full max-w-md bg-white border border-brand-border rounded-bento p-6 sm:p-8 shadow-sm">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border border-brand-border flex items-center justify-center shadow-md mx-auto mb-3">
            <img src={klebenganLogo} alt="KlebKos" className="w-full h-full object-contain scale-[1.75]" />
          </div>
          <h1 className="text-xl font-extrabold text-brand-text-main tracking-tight">
            Login Bendahara KlebKos
          </h1>
          <p className="text-xs text-brand-text-muted mt-1 font-medium">
            Sistem Pencatatan Kos Klebengan
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-text-main mb-1.5">
              Email Bendahara
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-brand-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@kaskos.id"
                className="w-full text-xs bg-brand-surface-2 border border-brand-border rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-brand-text-main font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text-main mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-brand-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs bg-brand-surface-2 border border-brand-border rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-brand-text-main font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-muted hover:text-brand-text-main transition-colors p-1"
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>Masuk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


