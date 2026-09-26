import React from 'react';
import { CheckCircle2, Clock, XCircle, MinusCircle } from 'lucide-react';

export const Badge = ({ status, advanceMonths }) => {
  switch (status) {
    case 'paid':
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={2.2} />
          <span>Lunas</span>
          {advanceMonths && advanceMonths > 1 && (
            <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-extrabold font-num">
              {advanceMonths} bln
            </span>
          )}
        </span>
      );

    case 'pending_verification':
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-pulse" strokeWidth={2.2} />
          <span>Verifikasi</span>
        </span>
      );

    case 'unpaid':
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 rounded-full shadow-2xs">
          <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" strokeWidth={2.2} />
          <span>Belum Lunas</span>
        </span>
      );

    case 'vacant':
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full shadow-2xs">
          <MinusCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={2.2} />
          <span>Kosong</span>
        </span>
      );

    default:
      return null;
  }
};
