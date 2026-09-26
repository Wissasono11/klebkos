import { Router } from 'express';
import { getPeriods, getPeriodSummary, createPeriod, deletePeriod } from '../controllers/periodController.js';

const router = Router();

// GET /api/v1/periods
router.get('/', getPeriods);

// POST /api/v1/periods (Buat Periode Bulan Baru)
router.post('/', createPeriod);

// GET /api/v1/periods/:id/summary
router.get('/:id/summary', getPeriodSummary);

// DELETE /api/v1/periods/:id (Hapus Periode Bulan)
router.delete('/:id', deletePeriod);

export default router;
