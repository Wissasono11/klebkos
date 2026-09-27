import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import apiRoutes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const app = express();

// Sembunyikan header Express
app.disable('x-powered-by');

// Pasang Security HTTP Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Rate limiter: cegah DoS dan brute-force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 300, // maks 300 request per IP per 15 menit
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Terlalu banyak permintaan. Coba beberapa saat lagi.' }
});
app.use('/api/', limiter);

// Allowed Origins for CORS (Lokal + Production terdaftar)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      (process.env.NODE_ENV !== 'production' && process.env.ENVIRONMENT !== 'production')
    ) {
      return callback(null, true);
    }
    return callback(new Error(`Akses ditolak oleh CORS policy: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Batasi ukuran payload untuk mencegah DoS
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Root check
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'KasKos REST API',
    version: '1.0.0',
    docs: '/api/v1/health'
  });
});

// API v1 Routes
app.use('/api/v1', apiRoutes);

// Fallback & Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
