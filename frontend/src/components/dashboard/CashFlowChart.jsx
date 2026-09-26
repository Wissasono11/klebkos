import React, { useState, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useRoomStore } from '../../stores/useRoomStore';
import { usePeriodStore } from '../../stores/usePeriodStore';
import { formatRupiah } from '../../utils/formatters';
import { AlertCircle, HelpCircle, ChevronDown, CheckCircle2 } from 'lucide-react';

gsap.registerPlugin(useGSAP);

export const CashFlowChart = () => {
  const [selectedRange, setSelectedRange] = useState('bulan_ini');
  const [hoveredBar, setHoveredBar] = useState(null);
  const chartSvgRef = useRef(null);

  const rooms = useRoomStore((state) => state.rooms);
  const payments = useRoomStore((state) => state.payments);
  const activeFloors = useRoomStore((state) => state.activeFloors);
  const periods = usePeriodStore((state) => state.periods);
  const currentPeriodId = usePeriodStore((state) => state.currentPeriodId);
  const currentPeriod = usePeriodStore((state) => state.getCurrentPeriod());

  // GSAP subtle rise animation for bars on mount and range switch
  useGSAP(() => {
    gsap.from('.cash-flow-bar', {
      scaleY: 0,
      transformOrigin: 'bottom',
      duration: 0.55,
      stagger: 0.04,
      ease: 'power2.out',
      clearProps: 'transform'
    });
  }, { dependencies: [selectedRange, payments], scope: chartSvgRef });

  // Active rooms & unpaid count
  const activeRooms = rooms.filter((r) => activeFloors.includes(r.floor_number) && r.is_occupied);
  const activePayments = payments.filter((p) => p.period_id === currentPeriodId);
  const paidCount = activeRooms.filter((r) =>
    activePayments.some((p) => p.room_id === r.id && p.is_paid)
  ).length;
  const unpaidCount = activeRooms.length - paidCount;

  // Real cash flow data dihitung dari transaksi pembayaran riil di database
  const weeklyData = useMemo(() => {
    const daysConfig = [
      { dayIdx: 1, label: 'Sen' },
      { dayIdx: 2, label: 'Sel' },
      { dayIdx: 3, label: 'Rab' },
      { dayIdx: 4, label: 'Kam' },
      { dayIdx: 5, label: 'Jum' },
      { dayIdx: 6, label: 'Sab' },
      { dayIdx: 0, label: 'Min' }
    ];

    return daysConfig.map(({ dayIdx, label }) => {
      const dayTotal = activePayments
        .filter((p) => {
          if (!p.is_paid) return false;
          if (!p.paid_at) return false;
          const d = new Date(p.paid_at);
          return d.getDay() === dayIdx;
        })
        .reduce((sum, p) => sum + (Number(p.paid_amount) || 50000), 0);

      return { label, amount: dayTotal };
    });
  }, [activePayments]);

  // Data 6 bulan terakhir dari riwayat periode di database
  const monthlyData = useMemo(() => {
    if (!periods || periods.length === 0) {
      return [
        { label: 'Apr', amount: 0 },
        { label: 'Mei', amount: 0 },
        { label: 'Jun', amount: 0 },
        { label: 'Jul', amount: 0 },
        { label: 'Agu', amount: 0 },
        { label: 'Sep', amount: 0 }
      ];
    }

    const sortedPeriods = [...periods].sort((a, b) => {
      const y = (a.year_number || 0) - (b.year_number || 0);
      if (y !== 0) return y;
      return (a.month_number || 0) - (b.month_number || 0);
    });

    const displayPeriods = sortedPeriods.slice(-6);

    return displayPeriods.map((per) => {
      const perTotal = payments
        .filter((p) => p.period_id === per.id && p.is_paid)
        .reduce((sum, p) => sum + (Number(p.paid_amount) || 50000), 0);

      const label = per.period_name
        ? per.period_name.split(' ')[0].substring(0, 3)
        : `B${per.month_number}`;

      return { label, amount: perTotal };
    });
  }, [periods, payments]);

  const currentDataset = selectedRange === '6bln' ? monthlyData : weeklyData;
  const maxDatasetVal = Math.max(...currentDataset.map((d) => d.amount), 0);

  // Dynamic SVG dimensions and scale
  const height = 180;
  const maxVal = maxDatasetVal > 0
    ? Math.ceil((maxDatasetVal * 1.25) / 50000) * 50000
    : (selectedRange === '6bln' ? 1000000 : 200000);

  const formatTickLabel = (val) => {
    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1)}M`;
    if (val >= 1000) return `Rp ${Math.round(val / 1000)}k`;
    return `Rp ${val}`;
  };

  const yTicks = [
    { val: maxVal, label: formatTickLabel(maxVal) },
    { val: Math.round(maxVal * 0.75), label: formatTickLabel(maxVal * 0.75) },
    { val: Math.round(maxVal * 0.5), label: formatTickLabel(maxVal * 0.5) },
    { val: Math.round(maxVal * 0.25), label: formatTickLabel(maxVal * 0.25) },
    { val: 0, label: 'Rp 0' }
  ];

  const currentTotal = activePayments
    .filter((p) => p.is_paid)
    .reduce((sum, p) => sum + (Number(p.paid_amount) || 50000), 0);

  return (
    <div className="bg-white border border-brand-border rounded-bento p-4 sm:p-6 shadow-xs hover:border-brand-border-strong transition-all duration-300 flex flex-col justify-between h-full">
      {/* 1. Header with Title & Dropdown Pill */}
      <div>
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-brand-text-main tracking-tight">
              Cash Flow Overview
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedRange}
                onChange={(e) => setSelectedRange(e.target.value)}
                className="appearance-none bg-brand-surface-2 border border-brand-border text-brand-text-main text-xs font-bold rounded-full pl-3 pr-7 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer hover:bg-brand-surface transition-colors"
              >
                <option value="bulan_ini">Bulan Ini</option>
                <option value="6bln">6 Bulan Terakhir</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-brand-text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              type="button"
              title="Grafik riwayat penerimaan kas kos"
              className="p-1.5 rounded-full text-brand-text-muted hover:text-brand-text-main hover:bg-brand-surface-2 transition-colors"
            >
              <HelpCircle className="w-4 h-4" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* 2. Large KPI & Status Alert */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mt-2 mb-4">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-num text-brand-text-main tracking-tight">
              {formatRupiah(currentTotal)}
            </div>

            {/* Status alert pill */}
            {activeRooms.length === 0 ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1.5 rounded-md bg-brand-surface-2 border border-brand-border text-brand-text-muted text-[11px] font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-brand-text-muted shrink-0" strokeWidth={2.2} />
                <span>Belum ada data kamar di database</span>
              </div>
            ) : unpaidCount > 0 ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1.5 rounded-md bg-rose-50 border border-rose-200/80 text-rose-700 text-[11px] font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" strokeWidth={2.2} />
                <span>{unpaidCount} kamar belum melunasi iuran</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1.5 rounded-md bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={2.2} />
                <span>Seluruh kamar aktif telah lunas</span>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 text-xs font-bold text-brand-text-muted">
            <span className="w-3 h-3 rounded-[3.5px] bg-brand-secondary shrink-0 inline-block"></span>
            <span className="text-brand-text-main">Realisasi Iuran Masuk</span>
          </div>
        </div>
      </div>

      {/* 3. Responsive Native HTML/CSS Bar Chart with Zero Distortion */}
      <div className="relative mt-2 pt-2">
        {/* Floating Tooltip */}
        {hoveredBar && (
          <div
            className="absolute -top-7 sm:-top-8 z-30 px-2.5 sm:px-3 py-1 bg-[#1e1d1b] text-white text-[11px] rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 transition-all font-semibold flex items-center gap-1.5 border border-white/10 whitespace-nowrap"
            style={{ left: `${hoveredBar.xPercent}%` }}
          >
            <span className="font-bold">{hoveredBar.label}:</span>
            <span className="text-emerald-400 font-num">{formatRupiah(hoveredBar.amount)}</span>
          </div>
        )}

        {/* Main Chart Grid: Y-Axis + Plot Area */}
        <div className="flex gap-1.5 sm:gap-3 items-stretch">
          {/* Y-Axis Scale Column: Native text, concise on mobile */}
          <div className="relative w-8 sm:w-16 h-44 sm:h-48 shrink-0 select-none text-[10px] sm:text-xs text-brand-text-muted font-num">
            {yTicks.map((tick, i) => {
              const topPercent = i * 25; // 0%, 25%, 50%, 75%, 100%
              return (
                <div
                  key={i}
                  className="absolute right-1 sm:right-2 transform -translate-y-1/2 text-right leading-none"
                  style={{ top: `${topPercent}%` }}
                >
                  <span className="sm:hidden font-medium">
                    {tick.val === 0 ? '0' : tick.val >= 1000000 ? `${(tick.val / 1000000).toFixed(tick.val % 1000000 === 0 ? 0 : 1)}M` : `${Math.round(tick.val / 1000)}k`}
                  </span>
                  <span className="hidden sm:inline font-medium">
                    {tick.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Plot Area with Dotted Guidelines and Rising Bars */}
          <div ref={chartSvgRef} className="relative flex-1 h-44 sm:h-48">
            {/* 5 Dotted Guidelines */}
            {[0, 25, 50, 75, 100].map((pct) => (
              <div
                key={pct}
                className="absolute left-0 right-0 border-b border-dashed border-[#e8e5df] pointer-events-none"
                style={{ top: `${pct}%` }}
              />
            ))}

            {/* Bars Flex Row */}
            <div className="relative z-10 flex items-end justify-between h-full gap-1.5 sm:gap-4 px-1 sm:px-3">
              {currentDataset.map((item, idx) => {
                const heightPct = item.amount > 0 ? Math.max(6, (item.amount / maxVal) * 100) : 2.5;
                const isHovered = hoveredBar?.index === idx;

                return (
                  <div
                    key={item.label}
                    className="flex-1 h-full flex flex-col justify-end items-center group cursor-pointer"
                    onMouseEnter={() =>
                      setHoveredBar({
                        index: idx,
                        label: item.label,
                        amount: item.amount,
                        xPercent: 10 + ((idx + 0.5) / currentDataset.length) * 80
                      })
                    }
                    onMouseLeave={() => setHoveredBar(null)}
                    onTouchStart={() =>
                      setHoveredBar({
                        index: idx,
                        label: item.label,
                        amount: item.amount,
                        xPercent: 10 + ((idx + 0.5) / currentDataset.length) * 80
                      })
                    }
                  >
                    {/* Bar Element */}
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`cash-flow-bar w-full max-w-[26px] sm:max-w-[38px] rounded-t-[4px] sm:rounded-t-[6px] transition-colors duration-200 ${
                        item.amount > 0
                          ? isHovered
                            ? 'bg-[#250710]'
                            : 'bg-brand-secondary'
                          : isHovered
                          ? 'bg-[#d6d2c9]'
                          : 'bg-brand-border'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* X-Axis Labels Row: Crisp Inter font, zero squishing */}
        <div className="flex gap-1.5 sm:gap-3 items-center mt-2.5">
          <div className="w-8 sm:w-16 shrink-0" />
          <div className="flex-1 flex justify-between gap-1.5 sm:gap-4 px-1 sm:px-3">
            {currentDataset.map((item, idx) => {
              const isHovered = hoveredBar?.index === idx;
              return (
                <div
                  key={item.label}
                  className={`flex-1 text-center text-[11px] sm:text-xs font-bold transition-colors select-none ${
                    isHovered ? 'text-brand-text-main font-extrabold' : 'text-[#6b6661]'
                  }`}
                >
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
