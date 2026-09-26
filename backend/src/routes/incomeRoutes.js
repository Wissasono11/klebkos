import { Router } from 'express';
import {
  getIncomes,
  createIncome,
  updateIncome,
  deleteIncome
} from '../controllers/incomeController.js';

const router = Router();

// GET /api/v1/incomes
router.get('/', getIncomes);

// POST /api/v1/incomes
router.post('/', createIncome);

// PUT /api/v1/incomes/:id
router.put('/:id', updateIncome);

// DELETE /api/v1/incomes/:id
router.delete('/:id', deleteIncome);

export default router;
