import dotenv from 'dotenv';
import app from './src/app.js';
import { isSupabaseConfigured } from './src/config/supabase.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 KasKos Server aktif di http://localhost:${PORT}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api/v1`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/api/v1/health`);
  console.log(`⚡ Supabase: ${isSupabaseConfigured ? 'TERHUBUNG ✅' : 'MODE FALLBACK / MOCK ⚠️'}`);
  console.log('====================================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => console.log('Process terminated gracefully.'));
});
