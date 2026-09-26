import React from 'react';
import { RoomCard } from './RoomCard';
import { useRoomStore } from '../../stores/useRoomStore';
import { usePeriodStore } from '../../stores/usePeriodStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUIStore } from '../../stores/useUIStore';
import { Layers, Plus, Trash2, SearchX, CheckCircle2, Building2, X } from 'lucide-react';

export const RoomGrid = () => {
  const rooms = useRoomStore((state) => state.rooms);
  const payments = useRoomStore((state) => state.payments);
  const filterStatus = useRoomStore((state) => state.filterStatus);
  const searchQuery = useRoomStore((state) => state.searchQuery);
  const activeFloors = useRoomStore((state) => state.activeFloors);
  const addFloor = useRoomStore((state) => state.addFloor);
  const removeFloor = useRoomStore((state) => state.removeFloor);

  const currentPeriodId = usePeriodStore((state) => state.currentPeriodId);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const openLoginModal = useUIStore((state) => state.openLoginModal);
  const addToast = useUIStore((state) => state.addToast);

  const activePayments = payments.filter((p) => p.period_id === currentPeriodId);

  // Available floors that can be added (Max 4 floors: 1, 2, 3, 4)
  const availableFloors = [1, 2, 3, 4].filter((f) => !activeFloors.includes(f));

  const handleAddFloor = (floorNum) => {
    if (!isLoggedIn) {
      addToast('Akses Terbatas: Hanya Bendahara yang dapat menambahkan lantai.', 'warning');
      openLoginModal();
      return;
    }
    const success = addFloor(floorNum);
    if (success) {
      addToast(`Lantai ${floorNum} berhasil ditambahkan ke pencatatan kas kos.`, 'success');
    }
  };

  const handleRemoveFloor = (floorNum) => {
    if (!isLoggedIn) {
      addToast('Akses Terbatas: Hanya Bendahara yang dapat menonaktifkan lantai.', 'warning');
      openLoginModal();
      return;
    }
    if (activeFloors.length <= 1) {
      addToast('Minimal harus ada 1 lantai aktif dipantau.', 'warning');
      return;
    }
    removeFloor(floorNum);
    addToast(`Lantai ${floorNum} dinonaktifkan dari tampilan pencatatan.`, 'info');
  };

  // Only consider rooms on ACTIVE floors
  const activeFloorRooms = rooms.filter((r) => activeFloors.includes(r.floor_number));

  // Filter logic
  const filteredRooms = activeFloorRooms.filter((room) => {
    // 1. Text Search query
    const matchesSearch =
      room.room_number.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (room.tenant_name && room.tenant_name.toLowerCase().includes(searchQuery.toLowerCase().trim()));

    if (!matchesSearch) return false;

    // 2. Status filter
    const pay = activePayments.find((p) => p.room_id === room.id);
    const isPaid = Boolean(pay?.is_paid);
    const isPending = pay?.status === 'pending_verification';

    if (filterStatus === 'paid') return room.is_occupied && isPaid;
    if (filterStatus === 'unpaid') return room.is_occupied && !isPaid && !isPending;
    if (filterStatus === 'pending') return room.is_occupied && isPending;
    if (filterStatus === 'vacant') return !room.is_occupied;

    return true; // 'all'
  });

  return (
    <div className="space-y-6">
      {/* 1. Dynamic Floor Management Toolbar */}
      <div className="bg-white border border-brand-border rounded-bento p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-surface-2 border border-brand-border text-brand-text-main flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-brand-primary" strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs font-extrabold text-brand-text-main">
                Lantai Aktif Dipantau:
              </h4>
              <div className="flex items-center gap-1.5 flex-wrap">
                {activeFloors.map((fl) => (
                  <span
                    key={fl}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-brand-surface-2 text-brand-text-main border border-brand-border"
                  >
                    <span>Lantai {fl}</span>
                    {activeFloors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFloor(fl)}
                        title={`Nonaktifkan pemantauan Lantai ${fl}`}
                        className="text-brand-text-muted hover:text-rose-600 transition-colors p-0.5 rounded cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Add Floor Actions */}
        {availableFloors.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <span className="text-[11px] font-bold text-brand-text-muted">Aktifkan:</span>
            {availableFloors.map((fl) => (
              <button
                key={fl}
                type="button"
                onClick={() => handleAddFloor(fl)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-surface-2 hover:bg-brand-primary hover:text-white text-brand-text-main border border-brand-border transition-all flex items-center gap-1.5 shadow-2xs active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2.2} />
                <span>Lantai {fl}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Room Grid per Floor */}
      {filteredRooms.length === 0 ? (
        <div className="bg-white border border-brand-border rounded-bento p-12 text-center shadow-xs">
          <div className="w-14 h-14 bg-brand-surface-2 rounded-2xl flex items-center justify-center mx-auto mb-3 text-brand-text-muted border border-brand-border">
            <SearchX className="w-7 h-7 text-brand-text-muted" strokeWidth={1.8} />
          </div>
          <h4 className="text-sm font-extrabold text-brand-text-main">Tidak ada kamar ditemukan</h4>
          <p className="text-xs text-brand-text-muted mt-1 max-w-sm mx-auto">
            Coba sesuaikan kata kunci pencarian atau ubah filter status yang sedang aktif.
          </p>
        </div>
      ) : (
        /* Floor sections */
        activeFloors.map((floorNum) => {
          const floorRooms = filteredRooms.filter((r) => r.floor_number === floorNum);
          if (floorRooms.length === 0 && searchQuery) return null;

          const allFloorRooms = rooms.filter(
            (r) => r.floor_number === floorNum && r.is_occupied
          );
          const paidFloorRooms = allFloorRooms.filter((r) =>
            activePayments.some((p) => p.room_id === r.id && p.is_paid)
          );
          const pct = Math.round((paidFloorRooms.length / (allFloorRooms.length || 1)) * 100);

          return (
            <div
              key={floorNum}
              className="bg-white border border-brand-border rounded-bento p-5 sm:p-6 shadow-xs space-y-4"
            >
              {/* Floor Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-brand-border flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-brand-primary-subtle text-brand-primary flex items-center justify-center font-extrabold text-xs border border-brand-primary/10">
                    L{floorNum}
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-brand-text-main tracking-tight">
                      Lantai {floorNum}
                    </h3>
                    <span className="text-[10px] font-bold text-brand-text-muted px-2 py-0.5 rounded-full bg-brand-surface-2 border border-brand-border">
                      {floorRooms.length} Kamar
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brand-text-main font-num">
                      {paidFloorRooms.length} / {allFloorRooms.length} Lunas
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full font-num border ${
                        pct >= 80
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-brand-surface-2 text-brand-text-muted border-brand-border'
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>

                  {/* Deactivate/Delete floor button if more than 1 floor */}
                  {activeFloors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFloor(floorNum)}
                      title={`Nonaktifkan pemantauan Lantai ${floorNum}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors ml-1"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.8} />
                    </button>
                  )}
                </div>
              </div>

              {/* Room Cards Grid (Spacious 4-column layout avoiding tight horizontal squishing) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {floorRooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
