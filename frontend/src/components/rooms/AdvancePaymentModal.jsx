import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useRoomStore } from '../../stores/useRoomStore';
import { usePeriodStore } from '../../stores/usePeriodStore';
import { useUIStore } from '../../stores/useUIStore';
import { formatRupiah } from '../../utils/formatters';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export const AdvancePaymentModal = () => {
  const room = useRoomStore((state) => state.selectedRoomForAdvance);
  const setSelectedRoomForAdvance = useRoomStore((state) => state.setSelectedRoomForAdvance);
  const payMultiMonths = useRoomStore((state) => state.payMultiMonths);

  const currentPeriodId = usePeriodStore((state) => state.currentPeriodId);
  const currentPeriod = usePeriodStore((state) => state.getCurrentPeriod());
  const addToast = useUIStore((state) => state.addToast);

  const [monthsCount, setMonthsCount] = useState(2); // Default 2 bulan as per PRD v5

  if (!room) return null;

  const monthlyFee = 50000;
  const totalAmount = monthsCount * monthlyFee;

  const handleClose = () => {
    setSelectedRoomForAdvance(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    payMultiMonths(room.id, currentPeriodId, monthsCount);
    addToast(
      `Kamar ${room.room_number} berhasil dilunaskan untuk ${monthsCount} bulan.`,
      'success'
    );
    handleClose();
  };

  return (
    <Modal
      isOpen={Boolean(room)}
      onClose={handleClose}
      title={`Pelunasan Kamar ${room.room_number}`}
      subtitle={`Penghuni: ${room.tenant_name || 'Anak Kos'}`}
      maxWidth="max-w-sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Banner note */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-900 leading-relaxed">
            <strong>Fitur Advance Payment:</strong> Pembayaran 2 bulan atau lebih otomatis menandai
            lunas bulan <em>{currentPeriod?.period_name}</em> serta mengalokasikan status lunas di periode
            berikutnya.
          </p>
        </div>

        {/* Month selector buttons */}
        <div>
          <label className="block text-xs font-bold text-brand-text-main mb-2">
            Pilih Durasi Pembayaran:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setMonthsCount(num)}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border transition-all flex flex-col items-center justify-center gap-0.5 ${
                  monthsCount === num
                    ? 'bg-brand-primary border-brand-primary text-white shadow-md scale-102'
                    : 'bg-brand-surface-2 border-brand-border text-brand-text-main hover:bg-white'
                }`}
              >
                <span>{num} Bulan</span>
                <span className={`text-[10px] font-normal ${monthsCount === num ? 'text-white/80' : 'text-brand-text-muted'}`}>
                  {num === 1 ? 'Standar' : num === 2 ? 'Direkomendasikan' : 'Advance'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Total calculation card */}
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Total Uang Kas Diterima
            </span>
            <span className="text-xl font-extrabold text-brand-text-main font-num">
              {formatRupiah(totalAmount)}
            </span>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="w-1/2 py-2.5 text-xs font-bold rounded-full border border-brand-border hover:bg-brand-surface-2 text-brand-text-main transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className="w-1/2 py-2.5 text-xs font-bold rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95 transition-all"
          >
            Konfirmasi Lunas
          </button>
        </div>
      </form>
    </Modal>
  );
};
