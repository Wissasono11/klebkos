import { Router } from 'express';
import {
  togglePayment,
  processMultiMonthPayment,
  submitProof,
  getVerificationQueue,
  approveProof,
  rejectProof
} from '../controllers/paymentController.js';
import { requireBendahara } from '../middlewares/authMiddleware.js';

const router = Router();

// 1. Toggle 1 Bulan Standard (Bendahara)
router.post('/toggle', requireBendahara, togglePayment);

// 2. Multi-Month Advance Payment (Bendahara)
router.post('/multi-month', requireBendahara, processMultiMonthPayment);

// 3. Portal Penghuni: Kirim Bukti Transfer (Public)
router.post('/proof', submitProof);

// 4. Antrean Verifikasi (Bendahara)
router.get('/verification-queue', requireBendahara, getVerificationQueue);

// 5. Persetujuan Bukti (Bendahara)
router.put('/:id/approve', requireBendahara, approveProof);

// 6. Penolakan Bukti (Bendahara)
router.put('/:id/reject', requireBendahara, rejectProof);

export default router;
