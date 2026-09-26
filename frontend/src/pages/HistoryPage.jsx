import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { usePeriodStore } from '../stores/usePeriodStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useRoomStore } from '../stores/useRoomStore';
import { useExpenseStore } from '../stores/useExpenseStore';
import { useIncomeStore } from '../stores/useIncomeStore';
import { useUIStore } from '../stores/useUIStore';
import { formatRupiah, formatDate } from '../utils/formatters';
import { FileText, Sheet, Download, Calendar, History, CheckCircle2, Trash2 } from 'lucide-react';

gsap.registerPlugin(useGSAP);

export const HistoryPage = () => {
  const periods = usePeriodStore((state) => state.periods);
  const currentPeriodId = usePeriodStore((state) => state.currentPeriodId);
  const setCurrentPeriodId = usePeriodStore((state) => state.setCurrentPeriodId);
  const currentPeriod = usePeriodStore((state) => state.getCurrentPeriod());
  const deletePeriod = usePeriodStore((state) => state.deletePeriod);

  const rooms = useRoomStore((state) => state.rooms);
  const payments = useRoomStore((state) => state.payments);
  const activeFloors = useRoomStore((state) => state.activeFloors);
  const expenses = useExpenseStore((state) => state.expenses);
  const incomes = useIncomeStore((state) => state.incomes);

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const openLoginModal = useUIStore((state) => state.openLoginModal);
  const addToast = useUIStore((state) => state.addToast);

  const activeRooms = rooms.filter((r) => activeFloors.includes(r.floor_number));
  const activePayments = payments.filter((p) => p.period_id === currentPeriodId && activeRooms.some(r => r.id === p.room_id));
  const activeExpenses = expenses.filter((e) => e.period_id === currentPeriodId);
  const activeIncomes = incomes.filter((i) => i.period_id === currentPeriodId);

  const totalIuran = activePayments
    .filter((p) => p.is_paid)
    .reduce((sum, p) => sum + (Number(p.paid_amount) || 50000), 0);
  const totalManualIncome = activeIncomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const totalIncome = totalIuran + totalManualIncome;

  const totalExpenses = activeExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const startingBalance = currentPeriod?.starting_balance || 0;
  const endingBalance = startingBalance + totalIncome - totalExpenses;

  // Hapus periode saat ini
  const handleDeletePeriod = async () => {
    if (!isLoggedIn) {
      addToast('Akses Terbatas: Hanya Bendahara yang dapat menghapus periode.', 'warning');
      openLoginModal();
      return;
    }

    if (periods.length <= 1) {
      addToast('Tidak dapat menghapus: Minimal harus ada 1 periode buku kas.', 'warning');
      return;
    }

    const targetPeriodName = currentPeriod?.period_name;
    const confirmDelete = window.confirm(
      `Hapus periode "${targetPeriodName}"?\n\nPerhatian: Seluruh catatan tagihan kamar dan pengeluaran pada periode ini akan ikut terhapus.`
    );

    if (confirmDelete && currentPeriodId) {
      try {
        await deletePeriod(currentPeriodId);
        addToast(`Periode "${targetPeriodName}" berhasil dihapus.`, 'success');
      } catch (err) {
        addToast(`Gagal menghapus periode: ${err.message}`, 'error');
      }
    }
  };

  // Export to Excel / CSV
  const handleExportCSV = () => {
    let csv = `\uFEFFLAPORAN KAS KOS KLEBENGAN - ${currentPeriod?.period_name}\n`;
    csv += `Lantai Aktif:;${activeFloors.map(f => `Lantai ${f}`).join(', ')}\n`;
    csv += `Saldo Awal:;${startingBalance}\n`;
    csv += `Total Iuran Kamar:;${totalIuran}\n`;
    csv += `Total Pemasukan Manual:;${totalManualIncome}\n`;
    csv += `Total Pemasukan Keseluruhan:;${totalIncome}\n`;
    csv += `Total Pengeluaran:;${totalExpenses}\n`;
    csv += `Saldo Akhir:;${endingBalance}\n\n`;

    csv += `STATUS IURAN KAMAR\n`;
    csv += `Nomor Kamar;Penghuni;Status;Nominal;Keterangan\n`;
    activeRooms.forEach((r) => {
      const pay = activePayments.find((p) => p.room_id === r.id);
      const isPaid = pay?.is_paid ? 'LUNAS' : r.is_occupied ? 'BELUM' : 'KOSONG';
      const amt = pay?.is_paid ? pay.paid_amount || 50000 : 0;
      csv += `${r.room_number};${r.tenant_name || '-'};${isPaid};${amt};${pay?.notes || ''}\n`;
    });

    if (activeIncomes.length > 0) {
      csv += `\nRINCIAN PEMASUKAN KAS MANUAL\n`;
      csv += `Tanggal;Kategori;Deskripsi / Sumber;Nominal;Catatan\n`;
      activeIncomes.forEach((i) => {
        csv += `${i.income_date};${i.category};${i.title};${i.amount};${i.notes || ''}\n`;
      });
    }

    csv += `\nRINCIAN PENGELUARAN OPERASIONAL\n`;
    csv += `Tanggal;Kategori;Item;Nominal;Catatan\n`;
    activeExpenses.forEach((e) => {
      csv += `${e.expense_date};${e.category};${e.title};${e.amount};${e.notes || ''}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `KlebKos_${currentPeriod?.period_name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('File laporan Excel (CSV) berhasil diunduh.', 'success');
  };

  // Export to PDF / Print view
  const handleExportPDF = () => {
    addToast('Membuka dialog cetak laporan kas PDF.', 'info');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const pageRef = useRef(null);

  useGSAP(() => {
    gsap.from('.history-section', {
      y: 16,
      opacity: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power2.out',
      clearProps: 'all'
    });
  }, { scope: pageRef });

  return (
    <div ref={pageRef} className="space-y-6">
      {/* Header & Export CTAs */}
      <div className="history-section bg-white border border-brand-border rounded-bento p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-xl font-extrabold text-brand-text-main tracking-tight">
            Histori & Arsip Laporan Kas
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-surface-2 text-brand-text-main border border-brand-border">
            Monthly Archive
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportPDF}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-brand-surface-2 hover:bg-brand-surface text-brand-text-main border border-brand-border flex items-center gap-1.5 transition-all shadow-2xs active:scale-[0.98]"
          >
            <FileText className="w-3.5 h-3.5 text-brand-text-muted" strokeWidth={2} />
            <span>Cetak / PDF</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
          >
            <Sheet className="w-3.5 h-3.5" strokeWidth={2.2} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Period Timeline Pills */}
      <div className="history-section bg-white border border-brand-border rounded-bento p-4 shadow-sm flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-brand-text-muted px-2 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-brand-primary" />
          <span>Periode:</span>
        </span>
        {periods.map((p) => {
          const isSelected = p.id === currentPeriodId;
          return (
            <button
              key={p.id}
              onClick={() => setCurrentPeriodId(p.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-brand-surface-2 text-brand-text-muted hover:bg-brand-surface hover:text-brand-text-main'
              }`}
            >
              {p.period_name} {p.is_closed ? '(Tutup Buku)' : ''}
            </button>
          );
        })}
      </div>

      {/* Summary Recap Statement */}
      <div className="history-section bg-white border border-brand-border rounded-bento p-6 shadow-sm space-y-6">
        <div className="border-b border-brand-border pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-brand-text-main">
              Rekonsiliasi Kas Periode: {currentPeriod?.period_name}
            </h3>
            <p className="text-xs text-brand-text-muted">
              Status Buku: {currentPeriod?.is_closed ? 'Telah Ditutup' : 'Berjalan (Open)'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold font-num text-brand-primary bg-brand-primary-subtle px-3 py-1 rounded-full">
              KlebKos v5.0
            </span>
            {periods.length > 1 && (
              <button
                type="button"
                onClick={handleDeletePeriod}
                title={`Hapus periode ${currentPeriod?.period_name}`}
                className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hapus Periode</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-brand-surface-2/60 rounded-2xl border border-brand-border">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted block">
              Kas Bulan Lalu (Awal)
            </span>
            <span className="text-base font-extrabold text-brand-text-main font-num mt-1 block">
              {formatRupiah(startingBalance)}
            </span>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
              Total Pemasukan
            </span>
            <span className="text-base font-extrabold text-brand-text-main font-num mt-1 block">
              + {formatRupiah(totalIncome)}
            </span>
            {totalManualIncome > 0 && (
              <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                (Iuran {formatRupiah(totalIuran)} + Manual {formatRupiah(totalManualIncome)})
              </span>
            )}
          </div>

          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
              Total Pengeluaran
            </span>
            <span className="text-base font-extrabold text-brand-text-main font-num mt-1 block">
              - {formatRupiah(totalExpenses)}
            </span>
          </div>

          <div className="p-4 bg-brand-secondary text-white rounded-2xl shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/70 block">
              Saldo Kas Akhir
            </span>
            <span className="text-base font-extrabold text-white font-num mt-1 block">
              = {formatRupiah(endingBalance)}
            </span>
          </div>
        </div>

        {/* Quick Room Audit Summary */}
        <div className="border border-brand-border rounded-2xl p-4 bg-brand-surface-2/30">
          <h4 className="text-xs font-bold text-brand-text-main uppercase tracking-wider mb-2">
            Catatan Pelunasan Periode {currentPeriod?.period_name}
          </h4>
          <p className="text-xs text-brand-text-muted leading-relaxed">
            Dari total {activeRooms.length} kamar kos pada {activeFloors.length} lantai aktif ({activeFloors.map((f) => `Lt. ${f}`).join(', ')}), terdapat{' '}
            <strong className="text-emerald-700 font-extrabold">
              {activePayments.filter((p) => p.is_paid).length} kamar lunas
            </strong>
            ,{' '}
            <strong className="text-amber-700 font-extrabold">
              {activePayments.filter((p) => p.status === 'pending_verification').length} kamar dalam antrean verifikasi
            </strong>
            , dan{' '}
            <strong className="text-rose-700 font-extrabold">
              {activeRooms.filter((r) => r.is_occupied).length -
                activePayments.filter((p) => p.is_paid || p.status === 'pending_verification').length}{' '}
              kamar belum melunasi
            </strong>
            . Admin dapat menambah atau menonaktifkan lantai sewaktu-waktu sesuai tanggung jawab pengelolaan (maks. 4 lantai).
          </p>
        </div>
      </div>
    </div>
  );
};
