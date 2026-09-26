import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { FinancialSummaryHero } from '../components/dashboard/FinancialSummaryHero';
import { CashFlowChart } from '../components/dashboard/CashFlowChart';
import { ExpensePieChart } from '../components/dashboard/ExpensePieChart';
import { useRoomStore } from '../stores/useRoomStore';
import { usePeriodStore } from '../stores/usePeriodStore';
import { useExpenseStore } from '../stores/useExpenseStore';
import { useUIStore } from '../stores/useUIStore';
import { formatRupiah, formatDate } from '../utils/formatters';
import {
  ArrowRight,
  Clock,
  Building,
  CheckCircle2,
  Eye,
  Receipt,
  Plus,
  Share2,
  Layers,
  Sparkles
} from 'lucide-react';

gsap.registerPlugin(useGSAP);

export const DashboardPage = () => {
  const dashboardRef = useRef(null);

  const setActiveTab = useUIStore((state) => state.setActiveTab);
  const openLightboxProof = useUIStore((state) => state.openLightboxProof);
  const openAddExpenseModal = useUIStore((state) => state.openAddExpenseModal);

  const rooms = useRoomStore((state) => state.rooms);
  const payments = useRoomStore((state) => state.payments);
  const activeFloors = useRoomStore((state) => state.activeFloors);
  const expenses = useExpenseStore((state) => state.expenses);

  const currentPeriodId = usePeriodStore((state) => state.currentPeriodId);
  const currentPeriod = usePeriodStore((state) => state.getCurrentPeriod());

  // Subtle entrance animation on initial mount
  useGSAP(() => {
    gsap.from('.dash-section', {
      y: 18,
      opacity: 0,
      duration: 0.5,
      stagger: 0.07,
      ease: 'power2.out',
      clearProps: 'all'
    });
  }, { scope: dashboardRef });

  // Filter for active floors & period
  const activeFloorRooms = rooms.filter((r) => activeFloors.includes(r.floor_number));
  const activePayments = payments.filter((p) => {
    if (p.period_id !== currentPeriodId) return false;
    const r = rooms.find((room) => room.id === p.room_id);
    return r && activeFloors.includes(r.floor_number);
  });
  const activeExpenses = expenses.filter((e) => e.period_id === currentPeriodId);

  const pendingPayments = activePayments.filter((p) => p.status === 'pending_verification');
  const recentExpenses = activeExpenses.slice(0, 3);

  return (
    <div ref={dashboardRef} className="space-y-6">
      {/* 1. Header Overview Strip */}
      <div className="dash-section bg-white border border-brand-border rounded-bento p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-xl font-extrabold text-brand-text-main tracking-tight">
            Dashboard Keuangan Kas Kos
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-surface-2 text-brand-text-main border border-brand-border">
            {currentPeriod?.period_name}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('rooms')}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-brand-surface-2 hover:bg-brand-surface text-brand-text-main border border-brand-border flex items-center gap-1.5 transition-all shadow-2xs active:scale-[0.98]"
          >
            <Building className="w-3.5 h-3.5 text-brand-text-muted" strokeWidth={2} />
            <span>Kamar</span>
          </button>
        </div>
      </div>

      {/* 2. Bento Grid: 4 Core Metric Cards */}
      <section className="dash-section">
        <FinancialSummaryHero />
      </section>

      {/* 3. Analytics Charts Grid */}
      <section className="dash-section grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2">
          <CashFlowChart />
        </div>
        <div>
          <ExpensePieChart />
        </div>
      </section>

      {/* 4. Lower Bento Row: Verification Queue + Dynamic Floor Occupancy + Recent Expenses */}
      <section className="dash-section grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card A: Pending Verifications Queue */}
        <div className="bg-white border border-brand-border rounded-bento p-5 shadow-xs hover:border-brand-border-strong transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-brand-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" strokeWidth={2.2} />
                </div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-extrabold text-brand-text-main uppercase tracking-wider">
                    Antrean Verifikasi
                  </h4>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-num">
                    {pendingPayments.length}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('verification')}
                className="text-xs font-bold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1 transition-colors"
              >
                <span>Detail</span>
                <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
              </button>
            </div>

            {pendingPayments.length === 0 ? (
              <div className="py-8 text-center bg-brand-surface-2/40 rounded-xl border border-dashed border-brand-border">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" strokeWidth={2} />
                <p className="text-xs font-bold text-brand-text-main">Antrean Bersih</p>
                <p className="text-[11px] text-brand-text-muted mt-0.5">
                  Seluruh bukti pembayaran transfer telah diverifikasi.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingPayments.slice(0, 3).map((pay) => {
                  const r = rooms.find((room) => room.id === pay.room_id);
                  return (
                    <div
                      key={pay.id}
                      onClick={() => openLightboxProof({ payment: pay, room: r })}
                      className="p-2.5 rounded-xl bg-brand-surface-2 hover:bg-brand-surface-2/80 cursor-pointer flex items-center justify-between transition-colors border border-transparent hover:border-brand-border"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={pay.proof_url}
                          alt="thumbnail struk"
                          className="w-9 h-9 rounded-lg object-cover border border-brand-border shrink-0"
                        />
                        <div>
                          <span className="text-xs font-bold text-brand-text-main block">
                            Kamar {r?.room_number} ({r?.tenant_name})
                          </span>
                          <span className="text-[10px] text-brand-text-muted font-num">
                            {formatRupiah(pay.paid_amount || 50000)} • {pay.payment_method || 'Transfer'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                        Review
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-brand-border/60 text-[11px] text-brand-text-muted flex items-center justify-between">
            <span>Dukungan Advance Payment:</span>
            <span className="font-extrabold text-brand-text-main">Tersedia</span>
          </div>
        </div>

        {/* Card B: Dynamic Lantai Kos Progress */}
        <div className="bg-gradient-to-br from-[#3d0c1b] via-[#2d0713] to-[#1c040b] text-white rounded-bento p-5 shadow-xs flex flex-col justify-between border border-[#4d1022] hover:border-[#5c1328] transition-all duration-300">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 text-white flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4 text-amber-300" strokeWidth={2} />
                </div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Lantai Aktif
                  </h4>
                  <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-white/10 text-white/90 border border-white/10 font-num">
                    {activeFloors.length} Lantai
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('rooms')}
                className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 transition-colors"
              >
                <span>Kelola</span>
                <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
              </button>
            </div>

            {/* Floor Tiles */}
            <div className={`grid gap-2.5 my-2 text-center ${activeFloors.length === 2 ? 'grid-cols-2' : activeFloors.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
              {activeFloors.map((fl) => {
                const flRooms = rooms.filter((r) => r.floor_number === fl && r.is_occupied);
                const flPaid = flRooms.filter((r) =>
                  activePayments.some((p) => p.room_id === r.id && p.is_paid)
                ).length;
                const flPercentage = flRooms.length > 0 ? Math.round((flPaid / flRooms.length) * 100) : 0;

                return (
                  <div key={fl} className="bg-white/5 rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-colors">
                    <span className="text-[10px] text-white/70 block font-bold uppercase tracking-wider">
                      Lantai {fl}
                    </span>
                    <span className="text-base font-extrabold text-white font-num my-0.5 block">
                      {flPaid} / {flRooms.length}
                    </span>
                    <div className="w-full bg-white/15 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-white h-full rounded-full transition-all duration-500"
                        style={{ width: `${flPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/70">
            <span>Kapasitas Fleksibel:</span>
            <span className="text-amber-300 font-bold">Maksimal 4 Lantai</span>
          </div>
        </div>

        {/* Card C: Recent Expenses Snapshot */}
        <div className="bg-white border border-brand-border rounded-bento p-5 shadow-xs hover:border-brand-border-strong transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-brand-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 border border-rose-200/80 flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" strokeWidth={2.2} />
                </div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-extrabold text-brand-text-main uppercase tracking-wider">
                    Pengeluaran Terkini
                  </h4>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-brand-surface-2 text-brand-text-muted border border-brand-border font-num">
                    {activeExpenses.length}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('expenses')}
                className="text-xs font-bold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1 transition-colors"
              >
                <span>Lihat</span>
                <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
              </button>
            </div>

            {recentExpenses.length === 0 ? (
              <div className="py-8 text-center bg-brand-surface-2/40 rounded-xl border border-dashed border-brand-border">
                <p className="text-xs font-bold text-brand-text-main">Belum Ada Pengeluaran</p>
                <p className="text-[11px] text-brand-text-muted mt-0.5">
                  Belanja operasional bulan ini belum dicatat.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-2.5 rounded-xl bg-brand-surface-2/60 border border-brand-border/60 flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-xs font-bold text-brand-text-main block truncate">
                        {exp.title}
                      </span>
                      <span className="text-[10px] text-brand-text-muted">
                        {exp.category} • {formatDate(exp.expense_date)}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-brand-text-main font-num shrink-0">
                      {formatRupiah(exp.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-brand-border/60 text-[11px] text-brand-text-muted flex items-center justify-between">
            <span>Kategori Utama:</span>
            <span className="font-extrabold text-brand-text-main">Operasional Rutin</span>
          </div>
        </div>
      </section>
    </div>
  );
};
