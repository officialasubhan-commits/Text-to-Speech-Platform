const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const corsMiddleware = require('./config/cors');
const { apiLimiter } = require('./config/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const ApiError = require('./utils/ApiError');
const path = require('path');

// Import active routes
const healthRoutes = require('./routes/healthRoutes');
const ttsRoutes = require('./routes/ttsRoutes');
const documentRoutes = require('./routes/documentRoutes');

const app = express();

// ========== SECURITY MIDDLEWARE ==========
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
})); // Security headers with audio resource access
app.use(corsMiddleware); // CORS

// ========== PARSING MIDDLEWARE ==========
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========== LOGGING ==========
app.use(morgan('dev'));

// ========== STATIC FILES ==========
// Serve generated audio files for direct playback and download
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// ========== RATE LIMITING ==========
app.use('/api/', apiLimiter);

// ========== ROUTES ==========
app.use('/api/health', healthRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/documents', documentRoutes);

// ========== 404 HANDLER ==========
app.use((req, res, next) => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
});

// ========== GLOBAL ERROR HANDLER ==========
app.use(errorHandler);

module.exports = app;
