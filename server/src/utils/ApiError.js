/**
 * Custom API Error class.
 * Extends Error to include an HTTP status code for consistent error responses.
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // Distinguishes expected errors from programming bugs

    Error.captureStackTrace(this, this.constructor);
  }

  // Factory methods for common errors
  static badRequest(message, details) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Access denied') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static tooManyRequests(message = 'Usage limit exceeded') {
    return new ApiError(429, message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message);
  }

  static serviceUnavailable(message = 'External service unavailable') {
    return new ApiError(503, message);
  }
}

module.exports = ApiError;
