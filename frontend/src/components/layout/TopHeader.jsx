import { Menu, ChevronDown, ChevronLeft, ChevronRight, Share2, Calendar, Moon, Trash2 } from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { usePeriodStore } from '../../stores/usePeriodStore';
import { useRoomStore } from '../../stores/useRoomStore';
import { useExpenseStore } from '../../stores/useExpenseStore';
import { useIncomeStore } from '../../stores/useIncomeStore';

export const TopHeader = () => {

  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const openLoginModal = useUIStore((state) => state.openLoginModal);
  const openWARekapModal = useUIStore((state) => state.openWARekapModal);
  const addToast = useUIStore((state) => state.addToast);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const periods = usePeriodStore((state) => state.periods);
  const currentPeriodId = usePeriodStore((state) => state.currentPeriodId);
  const setCurrentPeriodId = usePeriodStore((state) => state.setCurrentPeriodId);
  const currentPeriod = usePeriodStore((state) => state.getCurrentPeriod());
  const goToPrevPeriod = usePeriodStore((state) => state.goToPrevPeriod);
  const goToNextPeriod = usePeriodStore((state) => state.goToNextPeriod);
  const setIsAddPeriodModalOpen = usePeriodStore((state) => state.setIsAddPeriodModalOpen);
  const deletePeriod = usePeriodStore((state) => state.deletePeriod);

  const rooms = useRoomStore((state) => state.rooms);
  const payments = useRoomStore((state) => state.payments);
  const activeFloors = useRoomStore((state) => state.activeFloors);
  const expenses = useExpenseStore((state) => state.expenses);
  const incomes = useIncomeStore((state) => state.incomes);

  // Open WA Recap Preview Modal
  const handleOpenWARekap = () => {
    if (!currentPeriod) {
      addToast('Periode kas belum siap atau belum dipilih.', 'warning');
      return;
    }
    openWARekapModal();
  };

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

  return (
    <header className="sticky top-0 z-30 bg-[#f9f8f5]/90 backdrop-blur-md border-b border-brand-border px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
      {/* Left: Mobile Nav & Executive Period Switcher */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-brand-text-main bg-white border border-brand-border rounded-xl shadow-2xs hover:bg-brand-surface-2 transition-colors cursor-pointer"
          aria-label="Buka menu navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Executive Period Selector Group */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Quick Prev Month Button */}
          <button
            type="button"
            onClick={goToPrevPeriod}
            title="Pindah ke bulan sebelumnya"
            className="p-2 text-brand-text-muted hover:text-brand-text-main bg-white hover:bg-brand-surface-2 border border-brand-border rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Period Dropdown Select */}
          <div className="relative min-w-[175px] sm:min-w-[215px]">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center text-brand-primary">
              <Calendar className="w-3.5 h-3.5" strokeWidth={2.2} />
            </div>
            <select
              value={currentPeriodId || ''}
              onChange={(e) => setCurrentPeriodId(e.target.value)}
              className="w-full appearance-none bg-white border border-brand-border text-brand-text-main text-xs font-bold rounded-xl pl-9 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 shadow-2xs cursor-pointer hover:border-brand-border-strong transition-colors"
            >
              {periods.length === 0 ? (
                <option value="">Memuat periode...</option>
              ) : (
                periods.map((p) => {
                  const isCurrent = p.period_name.toLowerCase().includes('september');
                  let tag = '';
                  if (p.is_closed) tag = ' • Arsip';
                  else if (isCurrent) tag = ' • Bulan Ini';
                  return (
                    <option key={p.id} value={p.id}>
                      {p.period_name}{tag}
                    </option>
                  );
                })
              )}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-brand-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Quick Next Month Button */}
          <button
            type="button"
            onClick={goToNextPeriod}
            title="Pindah ke bulan berikutnya"
            className="p-2 text-brand-text-muted hover:text-brand-text-main bg-white hover:bg-brand-surface-2 border border-brand-border rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Add Period / Buka Bulan Baru Button */}
          <button
            type="button"
            onClick={() => setIsAddPeriodModalOpen(true)}
            title="Buka atau buat periode kas bulan baru"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-brand-text-main hover:text-brand-primary bg-white hover:bg-brand-surface-2 border border-brand-border hover:border-brand-primary/30 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0"
          >
            <Moon className="w-3.5 h-3.5 text-brand-primary" strokeWidth={2.2} />
            <span>Bulan</span>
          </button>

          {/* Delete Period Button */}
          {periods.length > 1 && (
            <button
              type="button"
              onClick={handleDeletePeriod}
              title={`Hapus periode ${currentPeriod?.period_name}`}
              className="p-2 text-brand-text-muted hover:text-rose-600 bg-white hover:bg-rose-50 border border-brand-border hover:border-rose-200 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Action Command Group with GSAP micro-interactions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Copy WA Recap Broadcast Button */}
        <button
          onClick={handleOpenWARekap}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 bg-[#134e38] hover:bg-[#186045] text-white border border-[#1b6b4d]"
          title="Buka preview template rekap WhatsApp"
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-200 shrink-0" strokeWidth={2} />
          <span className="hidden sm:inline">Salin Rekap WA</span>
        </button>
      </div>
    </header>
  );
};
