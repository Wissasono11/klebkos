import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useRoomStore } from '../../stores/useRoomStore';
import { usePeriodStore } from '../../stores/usePeriodStore';
import { useUIStore } from '../../stores/useUIStore';
import { formatRupiah } from '../../utils/formatters';
import { UploadCloud, CheckCircle2, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { uploadPaymentProof } from '../../services/supabase';

export const UploadProofModal = () => {
  const isUploadModalOpen = useUIStore((state) => state.isUploadModalOpen);
  const closeUploadModal = useUIStore((state) => state.closeUploadModal);
  const addToast = useUIStore((state) => state.addToast);

  const rooms = useRoomStore((state) => state.rooms);
  const activeFloors = useRoomStore((state) => state.activeFloors);
  const submitProof = useRoomStore((state) => state.submitProof);
  const currentPeriodId = usePeriodStore((state) => state.currentPeriodId);
  const currentPeriod = usePeriodStore((state) => state.getCurrentPeriod());

  const occupiedRooms = rooms.filter((r) => r.is_occupied && activeFloors.includes(r.floor_number));

  const [selectedRoomId, setSelectedRoomId] = useState(occupiedRooms[0]?.id || '');
  const [monthsCount, setMonthsCount] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [proofPreview, setProofPreview] = useState(null);
  const [notes, setNotes] = useState('');

  if (!isUploadModalOpen) return null;

  const totalAmount = monthsCount * 50000;

  const handleClose = () => {
    setSelectedFile(null);
    setProofPreview(null);
    setNotes('');
    setMonthsCount(1);
    closeUploadModal();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoomId) {
      addToast('Pilih kamar terlebih dahulu.', 'warning');
      return;
    }

    if (!selectedFile && !proofPreview) {
      addToast('Silakan pilih foto struk atau screenshot bukti transfer terlebih dahulu.', 'warning');
      return;
    }

    setIsUploading(true);
    let finalProofUrl = proofPreview || '';

    try {
      if (selectedFile) {
        finalProofUrl = await uploadPaymentProof(selectedFile, selectedRoomId);
      }
    } catch (uploadErr) {
      console.warn('Storage upload error, menggunakan fallback preview:', uploadErr.message);
    }

    await submitProof({
      roomId: selectedRoomId,
      periodId: currentPeriodId,
      numberOfMonths: monthsCount,
      proofUrl: finalProofUrl,
      notes: notes || `Transfer struk oleh anak kos (${monthsCount} bulan)`
    });

    setIsUploading(false);
    const chosenRoom = rooms.find((r) => r.id === selectedRoomId);
    addToast(
      `Bukti transfer Kamar ${chosenRoom?.room_number || ''} berhasil dikirim! Menunggu verifikasi Bendahara ⏳`,
      'success'
    );
    handleClose();
  };

  return (
    <Modal
      isOpen={isUploadModalOpen}
      onClose={handleClose}
      title="Upload Bukti Transfer Kas Kos"
      subtitle={`Periode: ${currentPeriod?.period_name}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Room selector */}
        <div>
          <label className="block text-xs font-bold text-brand-text-main mb-1">
            Pilih Nomor Kamar & Nama Anda:
          </label>
          {occupiedRooms.length === 0 ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              Belum ada data kamar terisi penghuni. Silakan isi data penghuni kamar terlebih dahulu di dashboard.
            </div>
          ) : (
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              required
              className="w-full text-xs bg-brand-surface-2 border border-brand-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            >
              {occupiedRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Kamar {r.room_number} — {r.tenant_name} (Lt. {r.floor_number})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Months Count selector */}
        <div>
          <label className="block text-xs font-bold text-brand-text-main mb-1.5">
            Durasi Pembayaran:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setMonthsCount(num)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  monthsCount === num
                    ? 'bg-brand-primary border-brand-primary text-white shadow-sm'
                    : 'bg-brand-surface-2 border-brand-border text-brand-text-muted hover:bg-white'
                }`}
              >
                {num} Bulan
              </button>
            ))}
          </div>
        </div>

        {/* Total calculation */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-800">Nominal Transfer:</span>
          <span className="text-base font-extrabold text-brand-text-main font-num">
            {formatRupiah(totalAmount)}
          </span>
        </div>

        {/* Photo Upload File Picker & Empty State Illustration */}
        <div>
          <label className="block text-xs font-bold text-brand-text-main mb-1">
            Foto Struk / Screenshot Bukti Transfer
          </label>
          <div className="border-2 border-dashed border-brand-border hover:border-brand-primary rounded-2xl p-4 text-center cursor-pointer relative bg-brand-surface-2/40 hover:bg-brand-surface-2/70 transition-all group">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-0"
            />
            {proofPreview ? (
              <div className="flex flex-col items-center py-2 relative z-10">
                <div className="relative group inline-block">
                  <img
                    src={proofPreview}
                    alt="Preview struk transfer"
                    className="max-h-48 rounded-xl object-contain shadow-xs border border-brand-border bg-white"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedFile(null);
                      setProofPreview(null);
                    }}
                    className="absolute -top-2.5 -right-2.5 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md transition-all active:scale-95 cursor-pointer"
                    title="Hapus foto struk"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[11px] font-bold text-brand-primary hover:underline mt-2.5">
                  Klik untuk mengganti foto struk
                </span>
              </div>
            ) : (
              <div className="py-6 px-4 flex flex-col items-center text-center">
                {/* Visual Empty State Vector Illustration */}
                <div className="w-20 h-20 mb-3 relative flex items-center justify-center pointer-events-none">
                  <div className="absolute inset-0 bg-brand-primary/10 rounded-full blur-sm scale-95" />
                  <svg
                    className="w-16 h-16 relative text-brand-primary drop-shadow-xs"
                    viewBox="0 0 64 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Folded paper receipt */}
                    <path
                      d="M16 10C16 7.79086 17.7909 6 20 6H44C46.2091 6 48 7.79086 48 10V54L42.5 50.5L37.5 54L32 50.5L26.5 54L21.5 50.5L16 54V10Z"
                      fill="#FFFFFF"
                      stroke="#CBD5E1"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    {/* Header bar */}
                    <rect x="22" y="14" width="20" height="4" rx="2" fill="#E2E8F0" />
                    {/* Transaction lines */}
                    <rect x="22" y="22" width="14" height="2.5" rx="1.25" fill="#94A3B8" />
                    <rect x="22" y="28" width="18" height="2.5" rx="1.25" fill="#94A3B8" />
                    <rect x="22" y="34" width="12" height="2.5" rx="1.25" fill="#94A3B8" />
                    {/* Floating Upload Badge */}
                    <circle cx="44" cy="42" r="11" fill="#134e38" stroke="#FFFFFF" strokeWidth="2.5" />
                    <path
                      d="M44 37V47M41 40L44 37L47 40"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <p className="text-xs font-extrabold text-brand-text-main">
                  Pilih atau Tarik Foto Bukti Transfer
                </p>
                <p className="text-[11px] text-brand-text-muted mt-1 max-w-[260px] leading-relaxed">
                  Unggah tangkapan layar m-banking, struk ATM, atau QRIS pembayaran kas
                </p>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-brand-primary bg-brand-primary-subtle border border-brand-primary/15 px-3 py-1 rounded-full mt-3">
                  <UploadCloud className="w-3 h-3" />
                  <span>JPG, PNG, atau WEBP (Maks. 5MB)</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-brand-text-main mb-1">
            Catatan Tambahan (Opsional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Misal: Transfer via BCA a.n Budi"
            className="w-full text-xs bg-brand-surface-2 border border-brand-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="w-1/2 py-2.5 text-xs font-bold rounded-full border border-brand-border hover:bg-brand-surface-2 text-brand-text-main cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isUploading || occupiedRooms.length === 0}
            className="w-1/2 py-2.5 text-xs font-bold rounded-full bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Mengunggah...</span>
              </>
            ) : (
              <span>Kirim Bukti Bayar</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
