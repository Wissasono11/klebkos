import { Router } from 'express';
import {
  getIncomes,
  createIncome,
  updateIncome,
  deleteIncome
} from '../controllers/incomeController.js';
import { requireBendahara } from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/v1/incomes (Public Read)
router.get('/', getIncomes);

// POST /api/v1/incomes (Bendahara Only)
router.post('/', requireBendahara, createIncome);

// PUT /api/v1/incomes/:id (Bendahara Only)
router.put('/:id', requireBendahara, updateIncome);

// DELETE /api/v1/incomes/:id (Bendahara Only)
router.delete('/:id', requireBendahara, deleteIncome);

export default router;
