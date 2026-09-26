import React from 'react';
import { useUIStore } from '../../stores/useUIStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const toasts = useUIStore((state) => state.toasts);
  const removeToast = useUIStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        let bgStyle = 'bg-brand-secondary text-white';
        let Icon = Info;

        if (toast.type === 'success') {
          bgStyle = 'bg-emerald-800 text-white';
          Icon = CheckCircle2;
        } else if (toast.type === 'error' || toast.type === 'danger') {
          bgStyle = 'bg-rose-800 text-white';
          Icon = AlertCircle;
        } else if (toast.type === 'warning') {
          bgStyle = 'bg-amber-800 text-white';
          Icon = AlertCircle;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-xl ${bgStyle} border border-white/10 animate-slideUp`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className="w-4 h-4 shrink-0 text-amber-300" />
              <p className="text-xs font-semibold">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/60 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
