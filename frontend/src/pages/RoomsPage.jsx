import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { SearchFilterBar } from '../components/rooms/SearchFilterBar';
import { RoomGrid } from '../components/rooms/RoomGrid';
import { AdvancePaymentModal } from '../components/rooms/AdvancePaymentModal';
import { TenantEditModal } from '../components/rooms/TenantEditModal';

gsap.registerPlugin(useGSAP);

export const RoomsPage = () => {
  const pageRef = useRef(null);

  useGSAP(() => {
    gsap.from('.rooms-section', {
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
      {/* Page Header */}
      <div className="rooms-section flex items-center justify-between gap-2">
        <h2 className="text-xl font-extrabold text-brand-text-main tracking-tight">
          Status Pembayaran Kamar Kos
        </h2>
      </div>

      {/* Search and Filters */}
      <div className="rooms-section">
        <SearchFilterBar />
      </div>

      {/* Interactive Room Grids (4 floors) */}
      <div className="rooms-section">
        <RoomGrid />
      </div>

      {/* Modals */}
      <AdvancePaymentModal />
      <TenantEditModal />
    </div>
  );
};
