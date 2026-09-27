import { Router } from 'express';
import { getPeriods, getPeriodSummary, createPeriod, deletePeriod } from '../controllers/periodController.js';
import { requireBendahara } from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/v1/periods
router.get('/', getPeriods);

// GET /api/v1/periods/:id/summary
router.get('/:id/summary', getPeriodSummary);

// POST /api/v1/periods (Buat Periode Bulan Baru - Bendahara Only)
router.post('/', requireBendahara, createPeriod);

// DELETE /api/v1/periods/:id (Hapus Periode Bulan - Bendahara Only)
router.delete('/:id', requireBendahara, deletePeriod);

export default router;
