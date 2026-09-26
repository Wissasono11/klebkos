import React from 'react';
import { useRoomStore } from '../../stores/useRoomStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUIStore } from '../../stores/useUIStore';
import { formatRupiah, formatDate } from '../../utils/formatters';
import { Check, X, Eye, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const VerificationQueueList = () => {
  const rooms = useRoomStore((state) => state.rooms);
  const payments = useRoomStore((state) => state.payments);
  const approvePayment = useRoomStore((state) => state.approvePayment);
  const rejectPayment = useRoomStore((state) => state.rejectPayment);

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const openLoginModal = useUIStore((state) => state.openLoginModal);
  const openLightboxProof = useUIStore((state) => state.openLightboxProof);
  const addToast = useUIStore((state) => state.addToast);

  const pendingPayments = payments.filter((p) => p.status === 'pending_verification');

  const handleApprove = (payment) => {
    if (!isLoggedIn) {
      addToast('Akses Terbatas: Hanya Bendahara yang dapat menyetujui bukti bayar.', 'warning');
      openLoginModal();
      return;
    }
    approvePayment(payment.id);
    addToast('Bukti bayar disetujui. Status kamar berhasil ditandai lunas.', 'success');
  };

  const handleReject = (payment) => {
    if (!isLoggedIn) {
      addToast('Akses Terbatas: Hanya Bendahara yang dapat menolak bukti bayar.', 'warning');
      openLoginModal();
      return;
    }
    const reason = window.prompt('Masukkan alasan penolakan (misal: nominal kurang, struk buram):', 'Struk transfer tidak terbaca');
    if (reason !== null) {
      rejectPayment(payment.id, reason);
      addToast('Pembayaran ditolak. Notifikasi penolakan tercatat.', 'info');
    }
  };

  if (pendingPayments.length === 0) {
    return (
      <div className="bg-white border border-brand-border rounded-bento p-10 text-center shadow-sm">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h4 className="text-base font-bold text-brand-text-main">
          Semua Bukti Transfer Terverifikasi
        </h4>
        <p className="text-xs text-brand-text-muted mt-1 max-w-sm mx-auto">
          Tidak ada antrean struk pembayaran yang menunggu persetujuan Bendahara saat ini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pendingPayments.map((payment) => {
        const room = rooms.find((r) => r.id === payment.room_id) || {
          room_number: '?',
          tenant_name: 'Penghuni'
        };

        return (
          <div
            key={payment.id}
            className="p-4 bg-white border border-brand-border rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            {/* Left: Thumbnail & Info */}
            <div className="flex items-center gap-4">
              <div
                onClick={() => openLightboxProof({ payment, room })}
                className="relative group cursor-pointer w-16 h-16 rounded-xl overflow-hidden border border-brand-border shrink-0 bg-brand-surface-2"
              >
                <img
                  src={payment.proof_url}
                  alt={`Bukti bayar kamar ${room.room_number}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                  <Eye className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-brand-text-main font-num">
                    Kamar {room.room_number}
                  </span>
                  <span className="text-xs font-semibold text-brand-text-muted">
                    ({room.tenant_name})
                  </span>
                  {payment.advance_months && payment.advance_months > 1 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                      Multi-Bulan ({payment.advance_months} Bulan)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-brand-text-muted mt-1">
                  <span className="font-extrabold text-brand-text-main font-num">
                    {formatRupiah(payment.paid_amount || 50000)}
                  </span>
                  <span>•</span>
                  <span>{payment.payment_method || 'Transfer Bank'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3" />
                    {formatDate(payment.paid_at)}
                  </span>
                </div>

                {payment.notes && (
                  <p className="text-[11px] text-brand-text-muted mt-1 italic">
                    "{payment.notes}"
                  </p>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 self-end md:self-center">
              <button
                type="button"
                onClick={() => openLightboxProof({ payment, room })}
                className="px-3 py-2 text-xs font-bold rounded-xl border border-brand-border hover:bg-brand-surface-2 text-brand-text-main flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Lihat Struk</span>
              </button>

              <button
                type="button"
                onClick={() => handleReject(payment)}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Tolak</span>
              </button>

              <button
                type="button"
                onClick={() => handleApprove(payment)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Setujui Lunas</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
