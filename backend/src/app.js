import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const app = express();

// Allowed Origins for CORS (Lokal + Production Vercel)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      !process.env.CLIENT_URL ||
      process.env.CLIENT_URL === '*' ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(new Error(`Blocked by CORS policy: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
