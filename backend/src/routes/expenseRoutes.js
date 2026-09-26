import { Router } from 'express';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../controllers/expenseController.js';
import { requireBendahara } from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/v1/expenses?period_id=...
router.get('/', getExpenses);

// POST /api/v1/expenses (Bendahara)
router.post('/', requireBendahara, createExpense);

// PUT /api/v1/expenses/:id (Bendahara)
router.put('/:id', requireBendahara, updateExpense);

// DELETE /api/v1/expenses/:id (Bendahara)
router.delete('/:id', requireBendahara, deleteExpense);

export default router;

