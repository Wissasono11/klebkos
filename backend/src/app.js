import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import apiRoutes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const app = express();

// Sembunyikan header Express
app.disable('x-powered-by');

// Pasang Security HTTP Headers (nonaktifkan CSP agar tidak memblokir fetch API lintas domain)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Rate limiter: cegah DoS dan brute-force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Terlalu banyak permintaan. Coba beberapa saat lagi.' },
  skip: (req) => {
    const ip = req.ip || req.connection?.remoteAddress || '';
    return ip === '127.0.0.1' || ip === '::1' || ip.includes('localhost');
  }
});
app.use('/api/', limiter);

// Allowed Origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000',
  'https://klebkos.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  // Local development (localhost / 127.0.0.1 pada port mana saja)
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  // Domain Vercel resmi proyek klebkos
  if (/^https:\/\/(klebkos|klebengan)[a-zA-Z0-9-_]*\.vercel\.app$/.test(origin)) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (process.env.NODE_ENV !== 'production' && process.env.ENVIRONMENT !== 'production') return true;
  return false;
};

app.use(cors({
  origin: function (origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
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
