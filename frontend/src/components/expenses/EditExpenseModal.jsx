import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useExpenseStore } from '../../stores/useExpenseStore';
import { useUIStore } from '../../stores/useUIStore';

export const EditExpenseModal = () => {
  const expense = useExpenseStore((state) => state.selectedExpenseForEdit);
  const setSelectedExpenseForEdit = useExpenseStore((state) => state.setSelectedExpenseForEdit);
  const updateExpense = useExpenseStore((state) => state.updateExpense);
  const addToast = useUIStore((state) => state.addToast);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Bulanan');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (expense) {
      setTitle(expense.title || '');
      setCategory(expense.category || 'Bulanan');
      setAmount(expense.amount ? String(expense.amount) : '');
      setExpenseDate(expense.expense_date || new Date().toISOString().split('T')[0]);
      setNotes(expense.notes || '');
    }
  }, [expense]);

  if (!expense) return null;

  const categories = [
    'Harian',
    'Bulanan',
    'Tahunan',
    'Darurat',
    'Lain-lain'
  ];

  const handleClose = () => {
    setSelectedExpenseForEdit(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !amount) {
      addToast('Harap lengkapi judul dan nominal pengeluaran.', 'warning');
      return;
    }

    updateExpense(expense.id, {
      title,
      category,
      amount: Number(amount),
      expense_date: expenseDate,
      notes
    });

    addToast('Catatan pengeluaran berhasil diperbarui!', 'success');
    handleClose();
  };

  return (
    <Modal
      isOpen={Boolean(expense)}
      onClose={handleClose}
      title="Edit Catatan Pengeluaran"
      subtitle="Perbarui rincian biaya atau kategori pengeluaran"
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
            placeholder="Contoh: Pembayaran Tagihan PDAM & Wifi"
            className="w-full text-xs bg-brand-surface-2 border border-brand-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-brand-text-main font-medium"
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
              className="w-full text-xs bg-brand-surface-2 border border-brand-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-brand-text-main font-medium cursor-pointer"
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
              className="w-full text-xs bg-brand-surface-2 border border-brand-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 font-num text-brand-text-main font-bold"
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
            className="w-full text-xs bg-brand-surface-2 border border-brand-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 font-num text-brand-text-main font-medium"
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
            className="w-full text-xs bg-brand-surface-2 border border-brand-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-brand-text-main"
          />
        </div>

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
