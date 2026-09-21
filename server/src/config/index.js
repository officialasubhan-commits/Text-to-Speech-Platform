const dotenv = require('dotenv');
dotenv.config();

const config = {
  // Server
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  // File Upload
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10 MB
    allowedMimeTypes: [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    allowedExtensions: ['.txt', '.pdf', '.docx'],
  },

  // Text Limits
  maxTextLength: 5000,
  minTextLength: 1,
};

module.exports = config;
