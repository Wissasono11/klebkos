import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useIncomeStore } from '../../stores/useIncomeStore';
import { usePeriodStore } from '../../stores/usePeriodStore';
import { useUIStore } from '../../stores/useUIStore';

export const AddIncomeModal = () => {
  const isAddIncomeModalOpen = useUIStore((state) => state.isAddIncomeModalOpen);
  const closeAddIncomeModal = useUIStore((state) => state.closeAddIncomeModal);
  const addToast = useUIStore((state) => state.addToast);

  const addIncome = useIncomeStore((state) => state.addIncome);
  const currentPeriodId = usePeriodStore((state) => state.currentPeriodId);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Iuran Manual');
  const [amount, setAmount] = useState('');
  const [incomeDate, setIncomeDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  if (!isAddIncomeModalOpen) return null;

  const categories = [
    'Iuran Manual',
    'Sisa Saldo Lalu',
    'Denda / Sanksi',
    'Titipan Kas',
    'Lain-lain'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !amount) {
      addToast('Harap lengkapi judul dan nominal pemasukan.', 'warning');
      return;
    }

    addIncome({
      period_id: currentPeriodId,
      title,
      category,
      amount: Number(amount),
      income_date: incomeDate,
      notes
    });

    addToast('Pemasukan kas baru berhasil dicatat!', 'success');
    closeAddIncomeModal();
    // Reset form
    setTitle('');
    setAmount('');
    setNotes('');
  };

  return (
    <Modal
      isOpen={isAddIncomeModalOpen}
      onClose={closeAddIncomeModal}
      title="Catat Pemasukan Kas Manual"
      subtitle="Tambahkan penerimaan dana tunai, saldo sisa, denda, atau iuran manual"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-brand-text-main mb-1">
            Judul / Sumber Pemasukan
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Iuran Tunai Mas Budi / Titipan Kebersihan"
            className="w-full text-xs bg-brand-surface-2 border border-brand-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-brand-text-main"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-brand-text-main mb-1">
              Kategori Pemasukan
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs bg-brand-surface-2 border border-brand-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-brand-text-main cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text-main mb-1">
              Nominal (Rp)
            </label>
            <input
              type="number"
              required
              min="1"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Contoh: 50000"
              className="w-full text-xs bg-brand-surface-2 border border-brand-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-num font-bold text-brand-text-main"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-brand-text-main mb-1">
            Tanggal Penerimaan
          </label>
          <input
            type="date"
            required
            value={incomeDate}
            onChange={(e) => setIncomeDate(e.target.value)}
            className="w-full text-xs bg-brand-surface-2 border border-brand-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-num text-brand-text-main"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-brand-text-main mb-1">
            Catatan Tambahan (Opsional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Diterima cash saat kumpul kos / struk bank"
            className="w-full text-xs bg-brand-surface-2 border border-brand-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-brand-text-main"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={closeAddIncomeModal}
            className="w-1/2 py-2.5 text-xs font-bold rounded-full border border-brand-border hover:bg-brand-surface-2 text-brand-text-main transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className="w-1/2 py-2.5 text-xs font-bold rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95 transition-all"
          >
            Simpan Pemasukan
          </button>
        </div>
      </form>
    </Modal>
  );
};
