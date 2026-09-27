import React from 'react';
import { Search, LayoutGrid, CheckCircle2, XCircle, Clock, MinusCircle } from 'lucide-react';
import { useRoomStore } from '../../stores/useRoomStore';
import { usePeriodStore } from '../../stores/usePeriodStore';

export const SearchFilterBar = () => {
  const filterStatus = useRoomStore((state) => state.filterStatus);
  const setFilterStatus = useRoomStore((state) => state.setFilterStatus);
  const searchQuery = useRoomStore((state) => state.searchQuery);
  const setSearchQuery = useRoomStore((state) => state.setSearchQuery);

  const rooms = useRoomStore((state) => state.rooms);
  const payments = useRoomStore((state) => state.payments);
  const activeFloors = useRoomStore((state) => state.activeFloors);
  const currentPeriodId = usePeriodStore((state) => state.currentPeriodId);

  const activePayments = payments.filter((p) => p.period_id === currentPeriodId);

  // Rooms belonging to active floors only (type-safe comparison)
  const activeRooms = rooms.filter((r) => activeFloors.map(Number).includes(Number(r.floor_number)));

  // Counts
  const totalRooms = activeRooms.length;
  const vacantCount = activeRooms.filter((r) => !r.is_occupied).length;
  const paidCount = activeRooms.filter(
    (r) => r.is_occupied && activePayments.some((p) => p.room_id === r.id && p.is_paid)
  ).length;
  const pendingCount = activeRooms.filter(
    (r) =>
      r.is_occupied &&
      activePayments.some((p) => p.room_id === r.id && p.status === 'pending_verification')
  ).length;
  const unpaidCount = totalRooms - vacantCount - paidCount - pendingCount;

  const filters = [
    { id: 'all', label: 'Semua', count: totalRooms, icon: LayoutGrid },
    { id: 'paid', label: 'Lunas', count: paidCount, icon: CheckCircle2 },
    { id: 'unpaid', label: 'Belum Lunas', count: unpaidCount, icon: XCircle },
    { id: 'pending', label: 'Verifikasi', count: pendingCount, icon: Clock },
    { id: 'vacant', label: 'Kosong', count: vacantCount, icon: MinusCircle }
  ];

  return (
    <div className="bg-white border border-brand-border rounded-bento p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Search Input */}
      <div className="relative w-full md:w-80">
        <Search className="w-4 h-4 text-brand-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={2} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nomor kamar atau nama penghuni..."
          className="w-full text-xs bg-brand-surface-2 border border-brand-border rounded-full pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-brand-text-main"
        />
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
        {filters.map((f) => {
          const isActive = filterStatus === f.id;
          const Icon = f.icon;
          return (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 active:scale-[0.98] ${
                isActive
                  ? 'bg-brand-surface-dark text-white shadow-xs'
                  : 'bg-brand-surface-2 text-brand-text-muted hover:bg-brand-surface hover:text-brand-text-main border border-transparent hover:border-brand-border'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
              <span>{f.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-num ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white text-brand-text-muted'
                }`}
              >
                {f.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
