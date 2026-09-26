import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useExpenseStore } from '../../stores/useExpenseStore';
import { usePeriodStore } from '../../stores/usePeriodStore';
import { useUIStore } from '../../stores/useUIStore';

export const AddExpenseModal = () => {
  const isAddExpenseModalOpen = useUIStore((state) => state.isAddExpenseModalOpen);
  const closeAddExpenseModal = useUIStore((state) => state.closeAddExpenseModal);
  const addToast = useUIStore((state) => state.addToast);

  const addExpense = useExpenseStore((state) => state.addExpense);
  const currentPeriodId = usePeriodStore((state) => state.currentPeriodId);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Bulanan');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  if (!isAddExpenseModalOpen) return null;

  const categories = [
    'Harian',
    'Bulanan',
    'Tahunan',
    'Darurat',
    'Lain-lain'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !amount) {
      addToast('Harap lengkapi judul dan nominal pengeluaran.', 'warning');
      return;
    }

    addExpense({
      period_id: currentPeriodId,
      title,
      category,
      amount: Number(amount),
      expense_date: expenseDate,
      notes
    });

    addToast('Pengeluaran baru berhasil dicatat!', 'success');
    closeAddExpenseModal();
    // Reset form
    setTitle('');
    setAmount('');
    setNotes('');
  };

  return (
    <Modal
      isOpen={isAddExpenseModalOpen}
      onClose={closeAddExpenseModal}
      title="Catat Pengeluaran Kas Baru"
      subtitle="Biaya operasional & pemeliharaan fasilitas kos"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-brand-text-main mb-1">
            Judul / Keterangan Pengeluaran
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Beli Lampu Lorong Lt. 2 & Alat Pel"
            className="w-full text-xs bg-brand-surface-2 border border-brand-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-brand-text-main mb-1">
              Kategori Biaya
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs bg-brand-surface-2 border border-brand-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
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
              placeholder="Contoh: 373096"
              className="w-full text-xs bg-brand-surface-2 border border-brand-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 font-num"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-brand-text-main mb-1">
            Tanggal Transaksi
          </label>
          <input
            type="date"
            required
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            className="w-full text-xs bg-brand-surface-2 border border-brand-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 font-num"
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
            placeholder="Kuitansi terlampir di lemari bendahara"
            className="w-full text-xs bg-brand-surface-2 border border-brand-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={closeAddExpenseModal}
            className="w-1/2 py-2.5 text-xs font-bold rounded-full border border-brand-border hover:bg-brand-surface-2 text-brand-text-main"
          >
            Batal
          </button>
          <button
            type="submit"
            className="w-1/2 py-2.5 text-xs font-bold rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white shadow-md active:scale-95 transition-all"
          >
            Simpan Pengeluaran
          </button>
        </div>
      </form>
    </Modal>
  );
};
