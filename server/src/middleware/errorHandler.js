const ApiError = require('../utils/ApiError');
const config = require('../config');

/**
 * Global error handling middleware.
 * Catches all errors thrown in routes/middleware and returns consistent JSON responses.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Log the error in development
  if (config.isDev) {
    console.error('Error:', err);
  }

  // Handle ApiError (operational errors)
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  // Handle Prisma known errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: 'A record with this value already exists.',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: 'Record not found.',
    });
  }

  // Handle Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File size exceeds the maximum allowed limit.',
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: 'Unexpected file field.',
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Authentication token has expired.',
    });
  }

  // Handle validation errors from express-validator
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON in request body.',
    });
  }

  // Default: Internal server error
  // Don't expose internal error details in production
  return res.status(500).json({
    success: false,
    error: config.isDev ? err.message : 'Internal server error.',
  });
};

module.exports = errorHandler;
