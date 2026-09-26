import { Router } from 'express';
import { getRooms, updateTenant } from '../controllers/roomController.js';
import { requireBendahara } from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/v1/rooms?period_id=... (Public / All Users)
router.get('/', getRooms);

// PUT /api/v1/rooms/:id/tenant (Bendahara Only)
router.put('/:id/tenant', requireBendahara, updateTenant);

export default router;
