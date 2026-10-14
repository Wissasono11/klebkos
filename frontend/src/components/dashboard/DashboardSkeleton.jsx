import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Brand-matched skeleton colors
const BASE = '#f0ede8';
const HIGHLIGHT = '#e2ddd5';
const DARK_BASE = '#4d1022';
const DARK_HIGHLIGHT = '#5c1328';

// ─── Section 1: Header Overview Strip ─────────────────────────────
export const HeaderStripSkeleton = () => (
  <div className="bg-white border border-brand-border rounded-bento p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div className="flex items-center gap-2.5">
      <Skeleton width={260} height={24} borderRadius={8} baseColor={BASE} highlightColor={HIGHLIGHT} />
      <Skeleton width={90} height={20} borderRadius={999} baseColor={BASE} highlightColor={HIGHLIGHT} />
    </div>
    <Skeleton width={80} height={34} borderRadius={12} baseColor={BASE} highlightColor={HIGHLIGHT} />
  </div>
);

// ─── Section 2: Financial Summary Hero (4 Metric Cards) ──────────
const DarkMetricCardSkeleton = () => (
  <div className="bg-gradient-to-br from-[#3d0c1b] via-[#2d0713] to-[#1c040b] text-white rounded-bento p-6 flex flex-col justify-between shadow-xs border border-[#4d1022]">
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <Skeleton width={90} height={14} borderRadius={4} baseColor={DARK_BASE} highlightColor={DARK_HIGHLIGHT} />
        <Skeleton width={32} height={32} borderRadius={12} baseColor={DARK_BASE} highlightColor={DARK_HIGHLIGHT} />
      </div>
      <Skeleton width="80%" height={34} borderRadius={6} baseColor={DARK_BASE} highlightColor={DARK_HIGHLIGHT} />
      <Skeleton width="60%" height={12} borderRadius={4} baseColor={DARK_BASE} highlightColor={DARK_HIGHLIGHT} style={{ marginTop: 8 }} />
    </div>
    <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
      <Skeleton width={100} height={12} borderRadius={4} baseColor={DARK_BASE} highlightColor={DARK_HIGHLIGHT} />
      <Skeleton width={80} height={12} borderRadius={4} baseColor={DARK_BASE} highlightColor={DARK_HIGHLIGHT} />
    </div>
  </div>
);

const LightMetricCardSkeleton = ({ accentBase, accentHighlight }) => (
  <div className="bg-white border border-brand-border rounded-bento p-5 flex flex-col justify-between shadow-xs">
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <Skeleton width={110} height={14} borderRadius={4} baseColor={BASE} highlightColor={HIGHLIGHT} />
        <Skeleton width={32} height={32} borderRadius={12} baseColor={accentBase || BASE} highlightColor={accentHighlight || HIGHLIGHT} />
      </div>
      <Skeleton width="75%" height={28} borderRadius={6} baseColor={BASE} highlightColor={HIGHLIGHT} />
      <Skeleton width="55%" height={12} borderRadius={4} baseColor={BASE} highlightColor={HIGHLIGHT} style={{ marginTop: 6 }} />
    </div>
    <div className="pt-3 mt-3 border-t border-brand-border/60 flex items-center justify-between">
      <Skeleton width={120} height={12} borderRadius={4} baseColor={BASE} highlightColor={HIGHLIGHT} />
      <Skeleton width={80} height={20} borderRadius={999} baseColor={BASE} highlightColor={HIGHLIGHT} />
    </div>
  </div>
);

export const FinancialSummaryHeroSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <DarkMetricCardSkeleton />
    <LightMetricCardSkeleton />
    <LightMetricCardSkeleton accentBase="#d1fae5" accentHighlight="#a7f3d0" />
    <LightMetricCardSkeleton accentBase="#ffe4e6" accentHighlight="#fecdd3" />
  </div>
);

// ─── Section 3: Charts Grid (CashFlow 2/3 + PieChart 1/3) ───────
export const CashFlowChartSkeleton = () => (
  <div className="bg-white border border-brand-border rounded-bento p-4 sm:p-6 shadow-xs flex flex-col justify-between h-full">
    {/* Header */}
    <div className="flex items-center justify-between pb-3">
      <Skeleton width={160} height={16} borderRadius={6} baseColor={BASE} highlightColor={HIGHLIGHT} />
      <Skeleton width={110} height={28} borderRadius={999} baseColor={BASE} highlightColor={HIGHLIGHT} />
    </div>

    {/* KPI number */}
    <div className="mt-2 mb-4">
      <Skeleton width="45%" height={32} borderRadius={6} baseColor={BASE} highlightColor={HIGHLIGHT} />
      <Skeleton width={180} height={18} borderRadius={6} baseColor={BASE} highlightColor={HIGHLIGHT} style={{ marginTop: 8 }} />
    </div>

    {/* Bar chart area */}
    <div className="flex items-end justify-between gap-2 sm:gap-4 h-44 sm:h-48 px-1 sm:px-3 mt-2 pt-2">
      {[65, 40, 80, 55, 90, 35, 50].map((h, i) => (
        <div key={i} className="flex-1 flex flex-col justify-end items-center h-full">
          <Skeleton
            width="100%"
            height={`${h}%`}
            borderRadius="4px 4px 0 0"
            baseColor={BASE}
            highlightColor={HIGHLIGHT}
            containerClassName="w-full max-w-[38px]"
          />
        </div>
      ))}
    </div>

    {/* X-axis labels */}
    <div className="flex justify-between gap-2 sm:gap-4 px-1 sm:px-3 mt-2.5">
      {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((d) => (
        <div key={d} className="flex-1 text-center">
          <Skeleton width={24} height={12} borderRadius={4} baseColor={BASE} highlightColor={HIGHLIGHT} />
        </div>
      ))}
    </div>
  </div>
);

export const ExpensePieChartSkeleton = () => (
  <div className="bg-white border border-brand-border rounded-bento p-6 shadow-xs flex flex-col justify-between h-full">
    {/* Header */}
    <div className="pb-3 border-b border-brand-border">
      <Skeleton width={170} height={16} borderRadius={6} baseColor={BASE} highlightColor={HIGHLIGHT} />
    </div>

    {/* Donut placeholder */}
    <div className="flex items-center justify-center my-auto pt-4">
      <div className="relative">
        <Skeleton circle width={180} height={180} baseColor={BASE} highlightColor={HIGHLIGHT} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton circle width={130} height={130} baseColor="#ffffff" highlightColor="#fafaf8" />
        </div>
      </div>
    </div>

    {/* Legend */}
    <div className="flex items-center justify-center gap-4 mt-4">
      {[80, 70, 60].map((w, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <Skeleton width={9} height={9} borderRadius={3} baseColor={BASE} highlightColor={HIGHLIGHT} />
          <Skeleton width={w} height={11} borderRadius={4} baseColor={BASE} highlightColor={HIGHLIGHT} />
        </div>
      ))}
    </div>
  </div>
);

export const ChartsGridSkeleton = () => (
  <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
    <div className="lg:col-span-2">
      <CashFlowChartSkeleton />
    </div>
    <div>
      <ExpensePieChartSkeleton />
    </div>
  </section>
);

// ─── Section 4: Bottom Bento Row (Verification + Floors + Expenses) ─
export const VerificationQueueSkeleton = () => (
  <div className="bg-white border border-brand-border rounded-bento p-5 shadow-xs flex flex-col justify-between">
    <div>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-brand-border">
        <div className="flex items-center gap-2.5">
          <Skeleton width={32} height={32} borderRadius={12} baseColor="#fef3c7" highlightColor="#fde68a" />
          <Skeleton width={130} height={14} borderRadius={4} baseColor={BASE} highlightColor={HIGHLIGHT} />
        </div>
        <Skeleton width={50} height={14} borderRadius={4} baseColor={BASE} highlightColor={HIGHLIGHT} />
      </div>

      {/* List items */}
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="p-2.5 rounded-xl bg-brand-surface-2/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Skeleton width={36} height={36} borderRadius={8} baseColor={BASE} highlightColor={HIGHLIGHT} />
              <div>
                <Skeleton width={130} height={12} borderRadius={4} baseColor={BASE} highlightColor={HIGHLIGHT} />
                <Skeleton width={100} height={10} borderRadius={4} baseColor={BASE} highlightColor={HIGHLIGHT} style={{ marginTop: 4 }} />
              </div>
            </div>
            <Skeleton width={52} height={20} borderRadius={999} baseColor="#fef3c7" highlightColor="#fde68a" />
          </div>
        ))}
      </div>
    </div>

    <div className="pt-3 mt-3 border-t border-brand-border/60 flex items-center justify-between">
      <Skeleton width={140} height={11} borderRadius={4} baseColor={BASE} highlightColor={HIGHLIGHT} />
      <Skeleton width={60} height={11} borderRadius={4} baseColor={BASE} highlightColor={HIGHLIGHT} />
    </div>
  </div>
);

export const FloorProgressSkeleton = () => (
  <div className="bg-gradient-to-br from-[#3d0c1b] via-[#2d0713] to-[#1c040b] text-white rounded-bento p-5 shadow-xs flex flex-col justify-between border border-[#4d1022]">
    <div>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <Skeleton width={32} height={32} borderRadius={12} baseColor={DARK_BASE} highlightColor={DARK_HIGHLIGHT} />
          <Skeleton width={100} height={14} borderRadius={4} baseColor={DARK_BASE} highlightColor={DARK_HIGHLIGHT} />
        </div>
        <Skeleton width={50} height={14} borderRadius={4} baseColor={DARK_BASE} highlightColor={DARK_HIGHLIGHT} />
      </div>

      {/* Floor tiles grid */}
      <div className="grid grid-cols-4 gap-2.5 my-2">
        {[1, 2, 3, 4].map((fl) => (
          <div key={fl} className="bg-white/5 rounded-xl p-3 border border-white/10">
            <Skeleton width="100%" height={10} borderRadius={4} baseColor={DARK_BASE} highlightColor={DARK_HIGHLIGHT} />
            <Skeleton width="60%" height={18} borderRadius={4} baseColor={DARK_BASE} highlightColor={DARK_HIGHLIGHT} style={{ marginTop: 6 }} />
            <Skeleton width="100%" height={6} borderRadius={999} baseColor={DARK_BASE} highlightColor={DARK_HIGHLIGHT} style={{ marginTop: 8 }} />
          </div>
        ))}
      </div>
    </div>

    <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between">
      <Skeleton width={120} height={11} borderRadius={4} baseColor={DARK_BASE} highlightColor={DARK_HIGHLIGHT} />
      <Skeleton width={100} height={11} borderRadius={4} baseColor={DARK_BASE} highlightColor={DARK_HIGHLIGHT} />
    </div>
  </div>
);

export const RecentExpensesSkeleton = () => (
  <div className="bg-white border border-brand-border rounded-bento p-5 shadow-xs flex flex-col justify-between">
    <div>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-brand-border">
        <div className="flex items-center gap-2.5">
          <Skeleton width={32} height={32} borderRadius={12} baseColor="#ffe4e6" highlightColor="#fecdd3" />
          <Skeleton width={140} height={14} borderRadius={4} baseColor={BASE} highlightColor={HIGHLIGHT} />
        </div>
        <Skeleton width={45} height={14} borderRadius={4} baseColor={BASE} highlightColor={HIGHLIGHT} />
      </div>

      {/* List items */}
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="p-2.5 rounded-xl bg-brand-surface-2/60 border border-brand-border/60 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <Skeleton width={120} height={12} borderRadius={4} baseColor={BASE} highlightColor={HIGHLIGHT} />
              <Skeleton width={90} height={10} borderRadius={4} baseColor={BASE} highlightColor={HIGHLIGHT} style={{ marginTop: 4 }} />
            </div>
            <Skeleton width={70} height={14} borderRadius={4} baseColor={BASE} highlightColor={HIGHLIGHT} />
          </div>
        ))}
      </div>
    </div>

    <div className="pt-3 mt-3 border-t border-brand-border/60 flex items-center justify-between">
      <Skeleton width={110} height={11} borderRadius={4} baseColor={BASE} highlightColor={HIGHLIGHT} />
      <Skeleton width={90} height={11} borderRadius={4} baseColor={BASE} highlightColor={HIGHLIGHT} />
    </div>
  </div>
);

export const BottomBentoSkeleton = () => (
  <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <VerificationQueueSkeleton />
    <FloorProgressSkeleton />
    <RecentExpensesSkeleton />
  </section>
);

// ─── Full Dashboard Skeleton (all 4 sections) ────────────────────
export const DashboardPageSkeleton = () => (
  <div className="space-y-6">
    <HeaderStripSkeleton />
    <FinancialSummaryHeroSkeleton />
    <ChartsGridSkeleton />
    <BottomBentoSkeleton />
  </div>
);
