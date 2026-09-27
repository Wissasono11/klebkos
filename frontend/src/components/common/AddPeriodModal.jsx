import React, { useState } from 'react';
import { Modal } from './Modal';
import { usePeriodStore } from '../../stores/usePeriodStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUIStore } from '../../stores/useUIStore';
import { Calendar, Plus, AlertCircle, Loader2 } from 'lucide-react';

const MONTHS = [
  { num: 1, name: 'Januari' },
  { num: 2, name: 'Februari' },
  { num: 3, name: 'Maret' },
  { num: 4, name: 'April' },
  { num: 5, name: 'Mei' },
  { num: 6, name: 'Juni' },
  { num: 7, name: 'Juli' },
  { num: 8, name: 'Agustus' },
  { num: 9, name: 'September' },
  { num: 10, name: 'Oktober' },
  { num: 11, name: 'November' },
  { num: 12, name: 'Desember' }
];

export const AddPeriodModal = () => {
  const isAddPeriodModalOpen = usePeriodStore((state) => state.isAddPeriodModalOpen);
  const setIsAddPeriodModalOpen = usePeriodStore((state) => state.setIsAddPeriodModalOpen);
  const createPeriod = usePeriodStore((state) => state.createPeriod);
  const periods = usePeriodStore((state) => state.periods);

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const openLoginModal = useUIStore((state) => state.openLoginModal);
  const addToast = useUIStore((state) => state.addToast);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 2 > 12 ? 1 : now.getMonth() + 2);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [monthlyFee, setMonthlyFee] = useState(50000);
  const [startingBalance, setStartingBalance] = useState(0);
  const [deadlineDay, setDeadlineDay] = useState(19);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAddPeriodModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      addToast('Akses Terbatas: Hanya Bendahara yang dapat membuka periode kas baru.', 'warning');
      openLoginModal();
      return;
    }

    const monthNum = parseInt(selectedMonth, 10);
    const yearNum = parseInt(selectedYear, 10);

    // Cek apakah sudah terdaftar di store
    const alreadyExists = periods.some(
      (p) => p.month_number === monthNum && p.year_number === yearNum
    );
    if (alreadyExists) {
      addToast(`Periode ${MONTHS[monthNum - 1].name} ${yearNum} sudah terdaftar!`, 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const deadlineDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(deadlineDay).padStart(2, '0')}`;
      await createPeriod({
        month_number: monthNum,
        year_number: yearNum,
        monthly_fee: Number(monthlyFee) || 50000,
        starting_balance: Number(startingBalance) || 0,
        deadline_date: deadlineDate
      });

      addToast(`Periode ${MONTHS[monthNum - 1].name} ${yearNum} berhasil dibuka!`, 'success');
      setIsAddPeriodModalOpen(false);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Terjadi kesalahan sistem';
      addToast(`Gagal membuka periode: ${errMsg}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isAddPeriodModalOpen}
      onClose={() => setIsAddPeriodModalOpen(false)}
      title="Buka Periode Bulan Baru"
      subtitle="Buat buku kas bulanan baru & generate tagihan seluruh kamar otomatis"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Month & Year Selection */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-brand-text-main mb-1.5">
              Pilih Bulan
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-xs font-bold text-brand-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            >
              {MONTHS.map((m) => (
                <option key={m.num} value={m.num}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text-main mb-1.5">
              Tahun
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-xs font-bold text-brand-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>
        </div>

        {/* Monthly Fee & Deadline */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-brand-text-main mb-1.5">
              Tarif Iuran / Kamar
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-brand-text-muted">
                Rp
              </span>
              <input
                type="number"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(e.target.value)}
                min="0"
                step="any"
                className="w-full bg-brand-surface border border-brand-border rounded-xl pl-8 pr-3 py-2 text-xs font-bold font-num text-brand-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text-main mb-1.5">
              Jatuh Tempo (Tgl)
            </label>
            <input
              type="number"
              value={deadlineDay}
              onChange={(e) => setDeadlineDay(e.target.value)}
              min="1"
              max="28"
              className="w-full bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-xs font-bold font-num text-brand-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              required
            />
          </div>
        </div>

        {/* Saldo Awal Kas */}
        <div>
          <label className="block text-xs font-bold text-brand-text-main mb-1.5">
            Saldo Awal Kas (Rp)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-brand-text-muted">
              Rp
            </span>
            <input
              type="number"
              value={startingBalance}
              onChange={(e) => setStartingBalance(e.target.value)}
              min="0"
              step="any"
              placeholder="0"
              className="w-full bg-brand-surface border border-brand-border rounded-xl pl-8 pr-3 py-2 text-xs font-bold font-num text-brand-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
          <p className="text-[10px] text-brand-text-muted mt-1">
            Bisa diisi jika ada sisa saldo kas dari bulan sebelumnya.
          </p>
        </div>

        {/* Informative Note */}
        <div className="p-3 bg-brand-surface-2 rounded-xl border border-brand-border text-[11px] text-brand-text-muted flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
          <span>
            Sistem akan secara otomatis membuat kartu tagihan kas untuk seluruh 28 kamar kos pada periode baru ini.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-brand-border">
          <button
            type="button"
            onClick={() => setIsAddPeriodModalOpen(false)}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold text-brand-text-muted hover:text-brand-text-main hover:bg-brand-surface-2 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary/90 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" strokeWidth={2.2} />
                <span>Buka Periode Ini</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
