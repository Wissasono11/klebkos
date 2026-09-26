import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { VerificationQueueList } from '../components/verification/VerificationQueueList';
import { ProofApprovalModal } from '../components/verification/ProofApprovalModal';
import { UploadProofModal } from '../components/verification/UploadProofModal';
import { useUIStore } from '../stores/useUIStore';
import { UploadCloud } from 'lucide-react';

gsap.registerPlugin(useGSAP);

export const VerificationPage = () => {
  const pageRef = useRef(null);
  const openUploadModal = useUIStore((state) => state.openUploadModal);

  useGSAP(() => {
    gsap.from('.verify-section', {
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
      <div className="verify-section bg-white border border-brand-border rounded-bento p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-xl font-extrabold text-brand-text-main tracking-tight">
            Antrean Verifikasi Bukti Transfer
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
            Approval Queue
          </span>
        </div>

        <button
          type="button"
          onClick={openUploadModal}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white flex items-center gap-2 shadow-sm active:scale-95 transition-all self-start sm:self-auto shrink-0 cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Bukti Bayar Baru</span>
        </button>
      </div>

      {/* Queue items */}
      <div className="verify-section">
        <VerificationQueueList />
      </div>

      {/* Lightbox & Upload Modals */}
      <ProofApprovalModal />
      <UploadProofModal />
    </div>
  );
};
