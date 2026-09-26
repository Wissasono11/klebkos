import React, { useState } from 'react';
import { useExpenseStore } from '../../stores/useExpenseStore';
import { useIncomeStore } from '../../stores/useIncomeStore';
import { usePeriodStore } from '../../stores/usePeriodStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUIStore } from '../../stores/useUIStore';
import { formatRupiah, formatDate } from '../../utils/formatters';
import { Trash2, Plus, Pencil, Receipt } from 'lucide-react';

export const CashFlowTable = () => {
  const [filter, setFilter] = useState('all');

  const expenses = useExpenseStore((state) => state.expenses);
  const deleteExpense = useExpenseStore((state) => state.deleteExpense);
  const setSelectedExpenseForEdit = useExpenseStore((state) => state.setSelectedExpenseForEdit);

  const incomes = useIncomeStore((state) => state.incomes);
  const deleteIncome = useIncomeStore((state) => state.deleteIncome);
  const setSelectedIncomeForEdit = useIncomeStore((state) => state.setSelectedIncomeForEdit);

  const currentPeriodId = usePeriodStore((state) => state.currentPeriodId);
  const openAddExpenseModal = useUIStore((state) => state.openAddExpenseModal);
  const openAddIncomeModal = useUIStore((state) => state.openAddIncomeModal);
  const openLoginModal = useUIStore((state) => state.openLoginModal);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const addToast = useUIStore((state) => state.addToast);

  // Active items for current period
  const activeExpenses = expenses.filter((e) => e.period_id === currentPeriodId);
  const activeIncomes = incomes.filter((i) => i.period_id === currentPeriodId);

  // Combine into single cash flow ledger
  const transactions = [
    ...activeIncomes.map((i) => ({
      id: i.id,
      type: 'income',
      title: i.title,
      category: i.category,
      date: i.income_date,
      incomeAmount: Number(i.amount) || 0,
      expenseAmount: 0,
      notes: i.notes,
      raw: i
    })),
    ...activeExpenses.map((e) => ({
      id: e.id,
      type: 'expense',
      title: e.title,
      category: e.category,
      date: e.expense_date,
      incomeAmount: 0,
      expenseAmount: Number(e.amount) || 0,
      notes: e.notes,
      raw: e
    }))
  ];

  // Sort by transaction date descending
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Filter options
  const filterOptions = [
    { id: 'all', label: 'Semua Transaksi' },
    { id: 'income', label: 'Pemasukan Saja' },
    { id: 'expense', label: 'Pengeluaran Saja' },
    { id: 'Harian', label: 'Harian' },
    { id: 'Bulanan', label: 'Bulanan' },
    { id: 'Tahunan', label: 'Tahunan' },
    { id: 'Darurat', label: 'Darurat' },
    { id: 'Lain-lain', label: 'Lain-lain' }
  ];

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true;
    if (filter === 'income') return tx.type === 'income';
    if (filter === 'expense') return tx.type === 'expense';
    return tx.category === filter;
  });

  const totalIncomeFiltered = filteredTransactions.reduce((sum, tx) => sum + tx.incomeAmount, 0);
  const totalExpenseFiltered = filteredTransactions.reduce((sum, tx) => sum + tx.expenseAmount, 0);

  const handleOpenAddExpense = () => {
    if (!isLoggedIn) {
      addToast('Akses Terbatas: Masuk sebagai Bendahara untuk menambah pengeluaran.', 'warning');
      openLoginModal();
      return;
    }
    openAddExpenseModal();
  };

  const handleOpenAddIncome = () => {
    if (!isLoggedIn) {
      addToast('Akses Terbatas: Masuk sebagai Bendahara untuk menambah pemasukan.', 'warning');
      openLoginModal();
      return;
    }
    openAddIncomeModal();
  };

  const handleEdit = (tx) => {
    if (!isLoggedIn) {
      addToast('Akses Terbatas: Masuk sebagai Bendahara untuk mengubah catatan.', 'warning');
      openLoginModal();
      return;
    }
    if (tx.type === 'income') {
      setSelectedIncomeForEdit(tx.raw);
    } else {
      setSelectedExpenseForEdit(tx.raw);
    }
  };

  const handleDelete = (tx) => {
    if (!isLoggedIn) {
      addToast('Akses Terbatas: Masuk sebagai Bendahara untuk menghapus catatan.', 'warning');
      openLoginModal();
      return;
    }
    const label = tx.type === 'income' ? 'pemasukan' : 'pengeluaran';
    if (window.confirm(`Yakin ingin menghapus catatan ${label} "${tx.title}"?`)) {
      if (tx.type === 'income') {
        deleteIncome(tx.id);
        addToast('Catatan pemasukan berhasil dihapus.', 'info');
      } else {
        deleteExpense(tx.id);
        addToast('Catatan pengeluaran berhasil dihapus.', 'info');
      }
    }
  };

  return (
    <div className="bg-white border border-brand-border rounded-bento p-4 sm:p-6 shadow-sm space-y-5">
      {/* Header with Title and Add Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-border gap-3.5">
        <div>
          <h3 className="text-base font-extrabold text-brand-text-main tracking-tight">
            Catatan Pemasukan & Pengeluaran
          </h3>
          <p className="text-xs text-brand-text-muted mt-0.5">
            Buku kas operasional & rekap transaksi periode ini
          </p>
        </div>

        {/* Action Buttons: 2-column equal grid on mobile, inline flex on desktop */}
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
          <button
            type="button"
            onClick={handleOpenAddIncome}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs font-bold rounded-xl sm:rounded-full bg-brand-surface-2 hover:bg-brand-surface text-brand-text-main border border-brand-border flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-brand-text-muted shrink-0" strokeWidth={2.2} />
            <span className="truncate">Catat Pemasukan</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddExpense}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs font-bold rounded-xl sm:rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Catat Pengeluaran</span>
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filterOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setFilter(opt.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filter === opt.id
                ? 'bg-brand-surface-dark text-white shadow-sm'
                : 'bg-brand-surface-2 text-brand-text-muted hover:bg-brand-surface hover:text-brand-text-main'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {filteredTransactions.length === 0 ? (
        <div className="p-8 text-center bg-brand-surface-2/40 rounded-2xl border border-dashed border-brand-border">
          <Receipt className="w-8 h-8 text-brand-text-muted mx-auto mb-2" />
          <p className="text-xs font-bold text-brand-text-main">Belum ada catatan kas untuk periode ini</p>
          <p className="text-[11px] text-brand-text-muted mt-0.5">
            Gunakan tombol "Catat Pemasukan" atau "Catat Pengeluaran" di atas untuk mencatat transaksi.
          </p>
        </div>
      ) : (
        <>
          {/* A. Mobile View: Responsive Transaction Stream (Hidden on Desktop) */}
          <div className="md:hidden space-y-3">
            <div className="divide-y divide-brand-border/70 border-y border-brand-border/70">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="py-3 px-1 flex flex-col gap-1.5">
                  {/* Top row: Title and Amount */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-brand-text-main leading-snug">
                        {tx.title}
                      </div>
                      {tx.notes && (
                        <p className="text-[10px] text-brand-text-muted mt-0.5 line-clamp-1">
                          {tx.notes}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      {tx.incomeAmount > 0 ? (
                        <span className="text-xs font-extrabold font-num text-emerald-700">
                          + {formatRupiah(tx.incomeAmount)}
                        </span>
                      ) : (
                        <span className="text-xs font-extrabold font-num text-brand-text-main">
                          - {formatRupiah(tx.expenseAmount)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom row: Category badge, Date & Edit/Delete actions */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          tx.type === 'income'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-brand-surface-2 text-brand-text-muted border-brand-border'
                        }`}
                      >
                        {tx.category}
                      </span>
                      <span className="text-[10px] text-brand-text-muted font-num">
                        {formatDate(tx.date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEdit(tx)}
                        className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-brand-primary-subtle rounded-lg transition-colors cursor-pointer"
                        title={tx.type === 'income' ? 'Edit Pemasukan' : 'Edit Pengeluaran'}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(tx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title={tx.type === 'income' ? 'Hapus Pemasukan' : 'Hapus Pengeluaran'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Total Recap Card */}
            <div className="mt-3 p-3 bg-brand-surface-2/60 rounded-xl border border-brand-border flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted block">
                  Total Masuk
                </span>
                <span className="text-xs font-extrabold text-emerald-700 font-num">
                  + {formatRupiah(totalIncomeFiltered)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted block">
                  Total Keluar
                </span>
                <span className="text-xs font-extrabold text-brand-text-main font-num">
                  - {formatRupiah(totalExpenseFiltered)}
                </span>
              </div>
            </div>
          </div>

          {/* B. Desktop View: Standard Ledger Table (Hidden on Mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="uppercase font-bold text-brand-text-muted border-b border-brand-border bg-brand-surface-2/60">
                  <th className="py-3 px-4">Deskripsi Item</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4 text-right">Pemasukan (+)</th>
                  <th className="py-3 px-4 text-right">Pengeluaran (-)</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-brand-surface-2/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-brand-text-main">
                      <div>{tx.title}</div>
                      {tx.notes && (
                        <span className="text-[10px] text-brand-text-muted font-normal block mt-0.5">
                          {tx.notes}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          tx.type === 'income'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-brand-surface-2 text-brand-text-muted border-brand-border'
                        }`}
                      >
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-num text-brand-text-muted">
                      {formatDate(tx.date)}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold font-num text-emerald-700">
                      {tx.incomeAmount > 0 ? `+ ${formatRupiah(tx.incomeAmount)}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold font-num text-brand-text-main">
                      {tx.expenseAmount > 0 ? formatRupiah(tx.expenseAmount) : '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(tx)}
                          className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-brand-primary-subtle rounded-lg transition-colors cursor-pointer"
                          title={tx.type === 'income' ? 'Edit Pemasukan' : 'Edit Pengeluaran'}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(tx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title={tx.type === 'income' ? 'Hapus Pemasukan' : 'Hapus Pengeluaran'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-brand-border bg-brand-surface-2/30 font-bold">
                  <td colSpan={3} className="py-3 px-4 text-brand-text-main uppercase text-[11px]">
                    Total Terfilter:
                  </td>
                  <td className="py-3 px-4 text-right text-sm font-extrabold text-emerald-700 font-num">
                    + {formatRupiah(totalIncomeFiltered)}
                  </td>
                  <td className="py-3 px-4 text-right text-sm font-extrabold text-brand-text-main font-num">
                    - {formatRupiah(totalExpenseFiltered)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
