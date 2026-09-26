import React from 'react';
import { useUIStore } from '../../stores/useUIStore';
import { useRoomStore } from '../../stores/useRoomStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { formatRupiah, formatDate } from '../../utils/formatters';
import { X, Check, CheckCircle2, AlertTriangle } from 'lucide-react';

export const ProofApprovalModal = () => {
  const activeLightboxProof = useUIStore((state) => state.activeLightboxProof);
  const closeLightboxProof = useUIStore((state) => state.closeLightboxProof);
  const addToast = useUIStore((state) => state.addToast);

  const approvePayment = useRoomStore((state) => state.approvePayment);
  const rejectPayment = useRoomStore((state) => state.rejectPayment);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const openLoginModal = useUIStore((state) => state.openLoginModal);

  if (!activeLightboxProof) return null;

  const { payment, room } = activeLightboxProof;

  const handleApprove = () => {
    if (!isLoggedIn) {
      addToast('Akses Terbatas: Hanya Bendahara yang dapat menyetujui bukti bayar.', 'warning');
      openLoginModal();
      return;
    }
    approvePayment(payment.id);
    addToast(`Bukti bayar Kamar ${room.room_number} disetujui. Status lunas.`, 'success');
    closeLightboxProof();
  };

  const handleReject = () => {
    if (!isLoggedIn) {
      addToast('Akses Terbatas: Hanya Bendahara yang dapat menolak bukti bayar.', 'warning');
      openLoginModal();
      return;
    }
    const reason = window.prompt('Masukkan alasan penolakan:', 'Bukti transfer buram / nominal tidak sesuai');
    if (reason !== null) {
      rejectPayment(payment.id, reason);
      addToast('Pembayaran ditolak.', 'info');
      closeLightboxProof();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={closeLightboxProof} />

      <div className="relative bg-white border border-brand-border rounded-bento max-w-2xl w-full overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-surface-2/40">
          <div>
            <h3 className="text-base font-extrabold text-brand-text-main">
              Verifikasi Struk: Kamar {room.room_number} ({room.tenant_name})
            </h3>
            <p className="text-xs text-brand-text-muted">
              Diunggah: {formatDate(payment.paid_at)} • Nominal: {formatRupiah(payment.paid_amount || 50000)}
            </p>
          </div>
          <button
            onClick={closeLightboxProof}
            className="p-1.5 text-brand-text-muted hover:text-brand-text-main hover:bg-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Preview Container */}
        <div className="flex-1 bg-black p-4 flex items-center justify-center overflow-auto min-h-[300px]">
          <img
            src={payment.proof_url}
            alt="Bukti Transfer Struk"
            className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-lg"
          />
        </div>

        {/* Footer info & Actions */}
        <div className="p-4 border-t border-brand-border bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-brand-text-muted">
            {payment.advance_months && payment.advance_months > 1 ? (
              <span className="font-bold text-amber-700">
                ⭐ Meliputi {payment.advance_months} bulan pembayaran sekaligus.
              </span>
            ) : (
              <span>Pembayaran iuran 1 bulan berjalan.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleReject}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              Tolak Struk
            </button>
            <button
              type="button"
              onClick={handleApprove}
              className="flex-1 sm:flex-none px-5 py-2 text-xs font-bold rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Setujui Pembayaran</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
