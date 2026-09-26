import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useRoomStore } from '../../stores/useRoomStore';
import { useUIStore } from '../../stores/useUIStore';
import { formatPhoneNumber } from '../../utils/formatters';

export const TenantEditModal = () => {
  const room = useRoomStore((state) => state.selectedRoomForEdit);
  const setSelectedRoomForEdit = useRoomStore((state) => state.setSelectedRoomForEdit);
  const updateTenant = useRoomStore((state) => state.updateTenant);
  const addToast = useUIStore((state) => state.addToast);

  const [tenantName, setTenantName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOccupied, setIsOccupied] = useState(true);

  useEffect(() => {
    if (room) {
      setTenantName(room.tenant_name || '');
      setPhoneNumber(formatPhoneNumber(room.phone_number || ''));
      setIsOccupied(Boolean(room.is_occupied));
    }
  }, [room]);

  if (!room) return null;

  const handleClose = () => setSelectedRoomForEdit(null);

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handlePhonePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const formatted = formatPhoneNumber(pastedText);
    setPhoneNumber(formatted);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanPhone = formatPhoneNumber(phoneNumber);
    updateTenant(room.id, {
      tenant_name: tenantName?.trim() || '',
      phone_number: cleanPhone,
      is_occupied: isOccupied
    });
    addToast(`Data Kamar ${room.room_number} berhasil diperbarui!`, 'success');
    handleClose();
  };

  return (
    <Modal
      isOpen={Boolean(room)}
      onClose={handleClose}
      title={`Kelola Data Kamar ${room.room_number}`}
      subtitle={`Lantai ${room.floor_number}`}
      maxWidth="max-w-sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-brand-text-main mb-1">
            Status Keterisian Kamar
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsOccupied(true)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                isOccupied
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                  : 'bg-brand-surface-2 border-brand-border text-brand-text-muted'
              }`}
            >
              Terisi (Ada Anak Kos)
            </button>
            <button
              type="button"
              onClick={() => setIsOccupied(false)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                !isOccupied
                  ? 'bg-slate-100 border-slate-400 text-slate-800'
                  : 'bg-brand-surface-2 border-brand-border text-brand-text-muted'
              }`}
            >
              Kosong (Tersedia)
            </button>
          </div>
        </div>

        {isOccupied && (
          <>
            <div>
              <label className="block text-xs font-bold text-brand-text-main mb-1">
                Nama Anak Kos
              </label>
              <input
                type="text"
                required={isOccupied}
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full text-xs bg-brand-surface-2 border border-brand-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-brand-text-main">
                  Nomor WhatsApp (Penagihan)
                </label>
                {phoneNumber && phoneNumber.startsWith('08') && phoneNumber.length >= 10 && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Format 08 Aktif
                  </span>
                )}
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                onPaste={handlePhonePaste}
                placeholder="Contoh: 081234567890"
                className="w-full text-xs bg-brand-surface-2 border border-brand-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 font-num transition-all"
              />
              <p className="text-[10px] text-brand-text-muted mt-1 leading-normal">
                Auto format: Awalan +62 / 62 & tanda hubung (-) otomatis diubah menjadi 08...
              </p>
            </div>
          </>
        )}

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
            className="w-1/2 py-2.5 text-xs font-bold rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white shadow-md active:scale-95 transition-all"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>
    </Modal>
  );
};
