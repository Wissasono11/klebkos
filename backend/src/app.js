import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Diizinkan untuk development Vite / mobile
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
