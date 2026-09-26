import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useIncomeStore } from '../../stores/useIncomeStore';
import { useUIStore } from '../../stores/useUIStore';

export const EditIncomeModal = () => {
  const income = useIncomeStore((state) => state.selectedIncomeForEdit);
  const setSelectedIncomeForEdit = useIncomeStore((state) => state.setSelectedIncomeForEdit);
  const updateIncome = useIncomeStore((state) => state.updateIncome);
  const addToast = useUIStore((state) => state.addToast);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Iuran Manual');
  const [amount, setAmount] = useState('');
  const [incomeDate, setIncomeDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (income) {
      setTitle(income.title || '');
      setCategory(income.category || 'Iuran Manual');
      setAmount(income.amount !== undefined ? String(income.amount) : '');
      setIncomeDate(income.income_date || new Date().toISOString().split('T')[0]);
      setNotes(income.notes || '');
    }
  }, [income]);

  if (!income) return null;

  const categories = [
    'Iuran Manual',
    'Sisa Saldo Lalu',
    'Denda / Sanksi',
    'Titipan Kas',
    'Lain-lain'
  ];

  const handleClose = () => {
    setSelectedIncomeForEdit(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !amount) {
      addToast('Harap lengkapi judul dan nominal pemasukan.', 'warning');
      return;
    }

    updateIncome(income.id, {
      title,
      category,
      amount: Number(amount),
      income_date: incomeDate,
      notes
    });

    addToast('Catatan pemasukan berhasil diperbarui!', 'success');
    handleClose();
  };

  return (
    <Modal
      isOpen={Boolean(income)}
      onClose={handleClose}
      title="Edit Catatan Pemasukan"
      subtitle="Perbarui data penerimaan kas atau sumber dana"
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
            placeholder="Contoh: Iuran Tunai Mas Budi"
            className="w-full text-xs bg-brand-surface-2 border border-brand-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-brand-text-main font-medium"
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
              className="w-full text-xs bg-brand-surface-2 border border-brand-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-brand-text-main font-medium cursor-pointer"
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
              className="w-full text-xs bg-brand-surface-2 border border-brand-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-num text-brand-text-main font-bold"
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
            className="w-full text-xs bg-brand-surface-2 border border-brand-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-num text-brand-text-main font-medium"
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
            onClick={handleClose}
            className="w-1/2 py-2.5 text-xs font-bold rounded-full border border-brand-border hover:bg-brand-surface-2 text-brand-text-main transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className="w-1/2 py-2.5 text-xs font-bold rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95 transition-all"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>
    </Modal>
  );
};
