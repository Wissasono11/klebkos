import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useExpenseStore } from '../../stores/useExpenseStore';
import { usePeriodStore } from '../../stores/usePeriodStore';
import { formatRupiah } from '../../utils/formatters';

ChartJS.register(ArcElement, Tooltip, Legend);

// Gradasi warna terkalibrasi halus: awalan #3d0c1b (Deep Wine) ke akhiran #d1ccc0 (Warm Stone)
const MASTER_PALETTE = [
  '#3d0c1b', // 0: Awalan (Deep Wine Burgundy)
  '#5a1828', // 1: Velvet Merlot
  '#782736', // 2: Rich Rosewood
  '#963c48', // 3: Warm Crimson Rose
  '#b2565c', // 4: Terracotta Rose
  '#c77573', // 5: Soft Coral Clay
  '#d5968d', // 6: Muted Rose Sand
  '#dcbaa8', // 7: Warm Almond Stone
  '#d1ccc0'  // 8: Akhiran (Warm Linen Stone)
];

const getCategoryColors = (count) => {
  if (count <= 1) return [MASTER_PALETTE[0]];
  return Array.from({ length: count }, (_, i) => {
    const ratio = i / (count - 1);
    const index = Math.round(ratio * (MASTER_PALETTE.length - 1));
    return MASTER_PALETTE[index];
  });
};

export const ExpensePieChart = () => {
  const currentPeriodId = usePeriodStore((state) => state.currentPeriodId);
  const expenses = useExpenseStore((state) => state.expenses);

  const activeExpenses = expenses.filter((e) => e.period_id === currentPeriodId);

  // Group by category and compute stats
  const { categories, amounts, totalAmount } = useMemo(() => {
    const categoriesMap = {};
    activeExpenses.forEach((exp) => {
      categoriesMap[exp.category] = (categoriesMap[exp.category] || 0) + Number(exp.amount);
    });

    const entries = Object.entries(categoriesMap).sort((a, b) => b[1] - a[1]);
    const cats = entries.map(([name]) => name);
    const amts = entries.map(([, amt]) => amt);
    const total = amts.reduce((a, b) => a + b, 0);

    return {
      categories: cats,
      amounts: amts,
      totalAmount: total
    };
  }, [activeExpenses]);

  const sliceColors = useMemo(() => {
    return getCategoryColors(categories.length);
  }, [categories]);

  const hasData = amounts.length > 0 && totalAmount > 0;

  const data = {
    labels: hasData ? categories : ['Belum ada data'],
    datasets: [
      {
        data: hasData ? amounts : [1],
        backgroundColor: hasData ? sliceColors : ['#e8e5df'],
        borderWidth: 2,
        borderColor: '#ffffff',
        borderRadius: 4,
        spacing: 2,
        hoverOffset: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 9,
          boxHeight: 9,
          usePointStyle: true,
          pointStyle: 'rectRounded',
          font: { family: "'Inter', sans-serif", size: 11, weight: 600 },
          color: '#525252',
          padding: 14
        }
      },
      tooltip: {
        backgroundColor: '#1e1d1b',
        titleColor: '#ffffff',
        bodyColor: '#e5e5e5',
        titleFont: { family: "'Inter', sans-serif", size: 12, weight: 700 },
        bodyFont: { family: "'Inter', sans-serif", size: 11, weight: 500 },
        padding: 10,
        cornerRadius: 10,
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const val = context.raw;
            const pct = totalAmount > 0 ? Math.round((val / totalAmount) * 100) : 0;
            return ` ${context.label}: ${formatRupiah(val)} (${pct}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="bg-white border border-brand-border rounded-bento p-6 shadow-xs hover:border-brand-border-strong transition-all duration-300 flex flex-col justify-between h-full">
      <div className="pb-3 border-b border-brand-border">
        <h3 className="text-sm font-extrabold text-brand-text-main tracking-tight">
          Distribusi Pengeluaran
        </h3>
      </div>

      <div className="h-60 relative my-auto flex items-center justify-center pt-2">
        <Doughnut data={data} options={options} />

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-7">
          <span className="text-[10px] uppercase font-bold tracking-wider text-brand-text-muted">
            Total Biaya
          </span>
          <span className="text-sm font-extrabold text-brand-text-main font-num mt-0.5">
            {formatRupiah(totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
};
