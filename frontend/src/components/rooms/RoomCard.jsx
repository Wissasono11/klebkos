import React from 'react';
import {
  CheckCircle2,
  MessageCircle,
  CalendarDays,
  MoreVertical,
  Clock,
  UserPlus
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { useRoomStore } from '../../stores/useRoomStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUIStore } from '../../stores/useUIStore';
import { usePeriodStore } from '../../stores/usePeriodStore';
import { generateTenantWAReminder } from '../../utils/waMessageGenerator';

export const RoomCard = ({ room }) => {
  const currentPeriodId = usePeriodStore((state) => state.currentPeriodId);
  const currentPeriod = usePeriodStore((state) => state.getCurrentPeriod());

  const payments = useRoomStore((state) => state.payments);
  const toggleRoomPayment = useRoomStore((state) => state.toggleRoomPayment);
  const setSelectedRoomForAdvance = useRoomStore((state) => state.setSelectedRoomForAdvance);
  const setSelectedRoomForEdit = useRoomStore((state) => state.setSelectedRoomForEdit);

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const openLoginModal = useUIStore((state) => state.openLoginModal);
  const addToast = useUIStore((state) => state.addToast);
  const openLightboxProof = useUIStore((state) => state.openLightboxProof);

  const payment = payments.find(
    (p) => p.room_id === room.id && p.period_id === currentPeriodId
  );

  const isOccupied = room.is_occupied;
  const isPaid = Boolean(payment?.is_paid);
  const isPending = payment?.status === 'pending_verification';

  // Determine status
  let status = 'unpaid';
  if (!isOccupied) status = 'vacant';
  else if (isPaid) status = 'paid';
  else if (isPending) status = 'pending_verification';

  // Card theme styling
  let containerStyle = 'bg-white border-brand-border hover:border-brand-border-strong';
  if (!isOccupied) {
    containerStyle = 'bg-slate-50/60 border-dashed border-slate-200/90';
  } else if (isPaid) {
    containerStyle = 'bg-emerald-50/20 border-emerald-200/80 hover:border-emerald-300';
  } else if (isPending) {
    containerStyle = 'bg-amber-50/30 border-amber-300/80 ring-2 ring-amber-400/15';
  }

  const handleToggle = () => {
    if (!isLoggedIn) {
      addToast('Akses Terbatas: Masuk sebagai Bendahara untuk mengubah status pembayaran.', 'warning');
      openLoginModal();
      return;
    }
    if (!isOccupied) {
      addToast('Kamar kosong belum dapat dicatat pembayarannya.', 'info');
      return;
    }
    const nextState = toggleRoomPayment(room.id, currentPeriodId);
    if (nextState) {
      addToast(`Kamar ${room.room_number} berhasil ditandai lunas.`, 'success');
    } else {
      addToast(`Status Kamar ${room.room_number} diubah menjadi belum lunas.`, 'info');
    }
  };

  const handleAdvanceClick = () => {
    if (!isLoggedIn) {
      addToast('Masuk sebagai Bendahara untuk memproses pembayaran dimuka.', 'warning');
      openLoginModal();
      return;
    }
    setSelectedRoomForAdvance(room);
  };

  const handlePreviewProof = () => {
    if (payment?.proof_url) {
      openLightboxProof({
        payment,
        room
      });
    }
  };

  return (
    <div
      className={`rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between shadow-2xs hover:shadow-xs relative overflow-hidden min-w-0 ${containerStyle}`}
    >
      {/* 1. Header: Room Number, Status Badge, Quick Check Toggle, and Menu */}
      <div>
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-brand-border/60 gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span className="font-extrabold text-base font-num text-brand-text-main tracking-tight shrink-0">
              {room.room_number}
            </span>
            <Badge status={status} advanceMonths={payment?.advance_months} />
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Quick Toggle Button */}
            {isOccupied && !isPending && (
              <button
                type="button"
                onClick={handleToggle}
                title={isPaid ? 'Tandai Belum Lunas' : 'Tandai Lunas Bulan Ini'}
                className={`p-1.5 rounded-lg transition-all ${
                  isPaid
                    ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200'
                    : 'text-slate-400 hover:text-brand-primary hover:bg-brand-surface-2'
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 ${isPaid ? 'text-emerald-600' : 'text-slate-300 hover:text-slate-500'}`}
                  strokeWidth={2.2}
                />
              </button>
            )}

            {/* Room Options Button */}
            <button
              type="button"
              onClick={() => setSelectedRoomForEdit(room)}
              title="Edit Data Penghuni"
              className="p-1.5 rounded-lg text-brand-text-muted hover:text-brand-text-main hover:bg-brand-surface-2 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Tenant Information */}
        <div className="mb-3.5 space-y-1">
          <p
            className={`text-xs font-bold truncate ${
              isOccupied ? 'text-brand-text-main' : 'text-slate-400 italic'
            }`}
            title={room.tenant_name}
          >
            {isOccupied ? room.tenant_name : 'Kamar Kosong'}
          </p>

          <p className="text-[11px] text-brand-text-muted font-num truncate">
            {isOccupied ? room.phone_number || 'Tanpa kontak WA' : 'Kamar siap huni'}
          </p>
        </div>
      </div>

      {/* 3. Action Buttons Footer */}
      <div className="pt-2.5 border-t border-brand-border/50 flex items-center gap-2">
        {isPending ? (
          <button
            type="button"
            onClick={handlePreviewProof}
            className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-[0.98]"
          >
            <Clock className="w-3.5 h-3.5 shrink-0" strokeWidth={2.2} />
            <span>Tinjau Bukti Transfer</span>
          </button>
        ) : isOccupied ? (
          <>
            {/* Advance payment button (Pelunasan Multi-Bulan) */}
            <button
              type="button"
              onClick={handleAdvanceClick}
              title="Pelunasan Multi-Bulan / Bayar Dimuka"
              className="flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold bg-brand-surface-2 hover:bg-brand-surface text-brand-text-main border border-brand-border flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-[0.98]"
            >
              <CalendarDays className="w-3.5 h-3.5 text-brand-primary shrink-0" strokeWidth={2} />
              <span>Bayar Dimuka</span>
            </button>

            {/* WA Remind Button (If unpaid) */}
            {!isPaid && room.phone_number && (
              <a
                href={generateTenantWAReminder(room, currentPeriod?.period_name)}
                target="_blank"
                rel="noreferrer"
                title="Kirim pengingat tagihan via WhatsApp"
                className="py-1.5 px-3 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-300/80 flex items-center justify-center gap-1.5 transition-all whitespace-nowrap active:scale-[0.98]"
              >
                <MessageCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                <span>Tagih WA</span>
              </a>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={() => setSelectedRoomForEdit(room)}
            className="w-full py-1.5 px-3 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 flex items-center justify-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Isi Penghuni</span>
          </button>
        )}
      </div>
    </div>
  );
};
