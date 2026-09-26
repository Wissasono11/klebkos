import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { usePeriodStore } from '../../stores/usePeriodStore';
import { useRoomStore } from '../../stores/useRoomStore';
import { useExpenseStore } from '../../stores/useExpenseStore';
import { useIncomeStore } from '../../stores/useIncomeStore';
import { useUIStore } from '../../stores/useUIStore';
import { generateGroupWARekap, generatePaidOnlyWARekap } from '../../utils/waMessageGenerator';
import { Copy, Check, ExternalLink, RefreshCw, MessageSquare, CheckCircle2 } from 'lucide-react';

export const WARekapModal = () => {
  const isWARekapModalOpen = useUIStore((state) => state.isWARekapModalOpen);
  const closeWARekapModal = useUIStore((state) => state.closeWARekapModal);
  const addToast = useUIStore((state) => state.addToast);

  const currentPeriod = usePeriodStore((state) => state.getCurrentPeriod());
  const currentPeriodId = usePeriodStore((state) => state.currentPeriodId);
  const rooms = useRoomStore((state) => state.rooms);
  const payments = useRoomStore((state) => state.payments);
  const activeFloors = useRoomStore((state) => state.activeFloors);
  const expenses = useExpenseStore((state) => state.expenses);
  const incomes = useIncomeStore((state) => state.incomes);

  const [activeTab, setActiveTab] = useState('full'); // 'full' | 'paid_only'
  const [customText, setCustomText] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Filter active data
  const activeRooms = rooms.filter((r) => activeFloors.includes(r.floor_number));
  const activePayments = payments.filter(
    (p) => p.period_id === currentPeriodId && activeRooms.some((r) => r.id === p.room_id)
  );
  const activeExpenses = expenses.filter((e) => e.period_id === currentPeriodId);
  const activeIncomes = incomes.filter((i) => i.period_id === currentPeriodId);

  const paidCount = activePayments.filter((p) => p.is_paid).length;
  const occupiedCount = activeRooms.filter((r) => r.is_occupied).length;

  // Generate initial messages
  const getFullTemplate = () => {
    return generateGroupWARekap({
      periodName: currentPeriod?.period_name || 'Bulan Ini',
      startingBalance: currentPeriod?.starting_balance || 0,
      payments: activePayments,
      rooms: activeRooms,
      expenses: activeExpenses,
      incomes: activeIncomes,
      deadlineDate: currentPeriod?.deadline_date || '2026-09-19'
    });
  };

  const getPaidOnlyTemplate = () => {
    return generatePaidOnlyWARekap({
      periodName: currentPeriod?.period_name || 'Bulan Ini',
      payments: activePayments,
      rooms: activeRooms,
      deadlineDate: currentPeriod?.deadline_date || '2026-09-19'
    });
  };

  // Sync customText when tab changes or modal opens
  useEffect(() => {
    if (isWARekapModalOpen) {
      if (activeTab === 'full') {
        setCustomText(getFullTemplate());
      } else {
        setCustomText(getPaidOnlyTemplate());
      }
    }
  }, [isWARekapModalOpen, activeTab, currentPeriodId, payments, rooms, expenses, incomes]);

  if (!isWARekapModalOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(customText);
    setIsCopied(true);
    addToast('Pesan rekap WhatsApp berhasil disalin ke clipboard!', 'success');
    setTimeout(() => {
      setIsCopied(false);
    }, 2500);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(customText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleReset = () => {
    if (activeTab === 'full') {
      setCustomText(getFullTemplate());
    } else {
      setCustomText(getPaidOnlyTemplate());
    }
    addToast('Teks dikembalikan ke template awal.', 'info');
  };

  return (
    <Modal
      isOpen={isWARekapModalOpen}
      onClose={closeWARekapModal}
      title="Preview Pesan Rekap WhatsApp"
      subtitle={`Template pesan siaran untuk periode ${currentPeriod?.period_name || 'Bulan Ini'}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Template Selector Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-brand-border">
          <div className="flex items-center gap-1.5 p-1 bg-brand-surface-2 rounded-xl border border-brand-border">
            <button
              type="button"
              onClick={() => setActiveTab('full')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'full'
                  ? 'bg-white text-brand-text-main shadow-xs'
                  : 'text-brand-text-muted hover:text-brand-text-main'
              }`}
            >
              Rekap Lengkap Kas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('paid_only')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'paid_only'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-brand-text-muted hover:text-brand-text-main'
              }`}
            >
              Khusus Sudah Lunas
            </button>
          </div>

          {/* Quick Counter Badge */}
          <div className="flex items-center gap-1.5 text-xs text-brand-text-muted">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              <strong className="text-emerald-700 font-extrabold">{paidCount}</strong> dari {occupiedCount} Kamar Lunas
            </span>
          </div>
        </div>

        {/* WhatsApp Chat Preview Card */}
        <div className="rounded-2xl border border-brand-border overflow-hidden bg-[#efeae2] shadow-inner">
          {/* Mock WhatsApp Bar */}
          <div className="bg-[#128c7e] text-white px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold tracking-tight">Grup WhatsApp Kas Kos</h4>
                <p className="text-[10px] text-white/80">
                  {activeTab === 'full' ? 'Rekap Keuangan & Seluruh Kamar' : 'Daftar Penghuni Lunas Iuran'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              title="Reset ke format bawaan"
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-[11px] flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>

          {/* Chat Bubble with Editable Textarea */}
          <div className="p-3.5 sm:p-4">
            <div className="bg-white rounded-xl p-3 shadow-xs border border-black/5 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-brand-text-muted border-b border-brand-border/60 pb-1.5">
                <span className="font-semibold text-emerald-800">Preview & Edit Pesan:</span>
                <span className="text-[10px]">Teks dapat diedit sebelum disalin</span>
              </div>

              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={12}
                className="w-full text-xs font-sans text-brand-text-main leading-relaxed bg-transparent focus:outline-none resize-y selection:bg-emerald-100 whitespace-pre-wrap"
                placeholder="Memuat template pesan WhatsApp..."
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-[11px] text-brand-text-muted">
            Salin pesan lalu kirimkan langsung ke grup WhatsApp warga kos.
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="px-3.5 py-2.5 text-xs font-bold rounded-xl border border-brand-border hover:bg-brand-surface-2 text-brand-text-main flex items-center justify-center gap-1.5 transition-colors cursor-pointer w-1/2 sm:w-auto"
            >
              <ExternalLink className="w-3.5 h-3.5 text-brand-text-muted" />
              <span>Buka WA</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95 w-1/2 sm:w-auto ${
                isCopied
                  ? 'bg-emerald-700 text-white'
                  : 'bg-[#128c7e] hover:bg-[#0e7064] text-white'
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" strokeWidth={2.5} />
                  <span>Pesan Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-emerald-100" />
                  <span>Salin Pesan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
