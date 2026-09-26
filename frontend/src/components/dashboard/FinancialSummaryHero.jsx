import React from 'react';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Building,
  TrendingUp,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import { useRoomStore } from '../../stores/useRoomStore';
import { usePeriodStore } from '../../stores/usePeriodStore';
import { useExpenseStore } from '../../stores/useExpenseStore';
import { useIncomeStore } from '../../stores/useIncomeStore';
import { formatRupiah, formatDate } from '../../utils/formatters';

export const FinancialSummaryHero = () => {
  const currentPeriod = usePeriodStore((state) => state.getCurrentPeriod());
  const currentPeriodId = usePeriodStore((state) => state.currentPeriodId);
  const rooms = useRoomStore((state) => state.rooms);
  const payments = useRoomStore((state) => state.payments);
  const expenses = useExpenseStore((state) => state.expenses);
  const incomes = useIncomeStore((state) => state.incomes);
  const activeFloors = useRoomStore((state) => state.activeFloors);

  // Filter for active period & active floors
  const activeFloorRooms = rooms.filter((r) => activeFloors.includes(r.floor_number));
  const activePayments = payments.filter((p) => {
    if (p.period_id !== currentPeriodId) return false;
    const r = rooms.find((room) => room.id === p.room_id);
    return r && activeFloors.includes(r.floor_number);
  });
  const activeExpenses = expenses.filter((e) => e.period_id === currentPeriodId);
  const activeIncomes = incomes.filter((i) => i.period_id === currentPeriodId);

  // Financial calculations
  const startingBalance = currentPeriod?.starting_balance || 0;
  
  const paidPayments = activePayments.filter((p) => p.is_paid);
  const totalIuran = paidPayments.reduce((acc, p) => acc + (Number(p.paid_amount) || 50000), 0);
  const totalManualIncome = activeIncomes.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  const totalIncome = totalIuran + totalManualIncome;
  
  const totalExpenses = activeExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const currentTotalKas = startingBalance + totalIncome - totalExpenses;

  const occupiedRooms = activeFloorRooms.filter((r) => r.is_occupied);
  const paidCount = occupiedRooms.filter((room) =>
    activePayments.some((p) => p.room_id === room.id && p.is_paid)
  ).length;

  const paidPercentage = occupiedRooms.length > 0 ? Math.round((paidCount / occupiedRooms.length) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. HERO METRIC CARD: TOTAL KAS SAAT INI */}
      <div className="bg-gradient-to-br from-[#3d0c1b] via-[#2d0713] to-[#1c040b] text-white rounded-bento p-6 flex flex-col justify-between shadow-xs border border-[#4d1022] hover:border-[#5c1328] transition-all duration-300">
        <div>
          <div className="flex items-center justify-between text-white/75 text-xs font-bold uppercase tracking-wider mb-2.5">
            <span>Kas Berjalan</span>
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white/90">
              <Wallet className="w-4 h-4" strokeWidth={2} />
            </div>
          </div>

          <div className="text-3xl lg:text-[34px] font-extrabold font-num text-white tracking-tight my-1 leading-tight">
            {formatRupiah(currentTotalKas)}
          </div>
          <p className="text-[11px] text-white/60 font-medium mt-1">
            Total saldo kas aktif periode {currentPeriod?.period_name}
          </p>
        </div>

        <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/80">
          <span className="flex items-center gap-1.5 text-white/70">
            <Calendar className="w-3.5 h-3.5 text-amber-300" strokeWidth={2} />
            <span>Jatuh Tempo:</span>
          </span>
          <span className="font-extrabold text-amber-300 font-num">
            {formatDate(currentPeriod?.deadline_date) || '19 Setiap Bulan'}
          </span>
        </div>
      </div>

      {/* 2. KAS BULAN LALU (SALDO AWAL) */}
      <div className="bg-white border border-brand-border rounded-bento p-5 flex flex-col justify-between shadow-xs hover:border-brand-border-strong hover:-translate-y-1 transition-all duration-300">
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-brand-text-muted text-xs font-bold uppercase tracking-wider">
              Kas Bulan Lalu
            </span>
            <div className="w-8 h-8 rounded-xl bg-brand-surface-2 border border-brand-border/60 flex items-center justify-center text-brand-text-muted">
              <Building className="w-4 h-4" strokeWidth={2} />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-num text-brand-text-main my-1">
            {formatRupiah(startingBalance)}
          </div>
          <p className="text-[11px] text-brand-text-muted mt-0.5">
            Saldo awal dipindahkan otomatis
          </p>
        </div>

        <div className="pt-3 mt-3 border-t border-brand-border/60 flex items-center justify-between text-[11px]">
          <span className="font-semibold text-brand-text-muted">Status Buku:</span>
          <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
            Terekonsiliasi
          </span>
        </div>
      </div>

      {/* 3. TOTAL PEMASUKAN */}
      <div className="bg-white border border-brand-border rounded-bento p-5 flex flex-col justify-between shadow-xs hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300">
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-brand-text-muted text-xs font-bold uppercase tracking-wider">
              Total Pemasukan
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" strokeWidth={2.2} />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-num text-brand-text-main my-1">
            {formatRupiah(totalIncome)}
          </div>
          <p className="text-[11px] text-brand-text-muted mt-0.5">
            {totalManualIncome > 0
              ? `Iuran ${formatRupiah(totalIuran)} + Manual ${formatRupiah(totalManualIncome)}`
              : 'Tarif Rp 50.000 / kamar / bulan'}
          </p>
        </div>

        <div className="pt-3 mt-3 border-t border-brand-border/60">
          <div className="flex justify-between items-center text-[11px] text-brand-text-muted mb-1.5">
            <span className="font-bold text-brand-text-main">
              {paidCount} dari {occupiedRooms.length} Kamar Lunas
            </span>
            <span className="font-extrabold text-emerald-700 font-num">{paidPercentage}%</span>
          </div>
          <div className="w-full bg-brand-surface-2 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${paidPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 4. TOTAL PENGELUARAN */}
      <div className="bg-white border border-brand-border rounded-bento p-5 flex flex-col justify-between shadow-xs hover:border-rose-300 hover:-translate-y-1 transition-all duration-300">
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-brand-text-muted text-xs font-bold uppercase tracking-wider">
              Total Pengeluaran
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" strokeWidth={2.2} />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-num text-brand-text-main my-1">
            {formatRupiah(totalExpenses)}
          </div>
          <p className="text-[11px] text-brand-text-muted mt-0.5">
            Biaya operasional & fasilitas
          </p>
        </div>

        <div className="pt-3 mt-3 border-t border-brand-border/60 flex items-center justify-between text-[11px]">
          <span className="font-semibold text-brand-text-muted">
            {activeExpenses.length} Bukti Pengeluaran
          </span>
          <span className="font-extrabold text-brand-primary bg-brand-primary-subtle px-2 py-0.5 rounded-full border border-brand-primary/20">
            Rutin Kos
          </span>
        </div>
      </div>
    </div>
  );
};
