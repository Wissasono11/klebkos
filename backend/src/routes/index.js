import { Router } from 'express';
import roomRoutes from './roomRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import expenseRoutes from './expenseRoutes.js';
import incomeRoutes from './incomeRoutes.js';
import periodRoutes from './periodRoutes.js';
import { isSupabaseConfigured } from '../config/supabase.js';

const router = Router();

// Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    supabaseConnected: isSupabaseConfigured
  });
});

// Resource Routers
router.use('/rooms', roomRoutes);
router.use('/payments', paymentRoutes);
router.use('/expenses', expenseRoutes);
router.use('/incomes', incomeRoutes);
router.use('/periods', periodRoutes);

export default router;
