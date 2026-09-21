const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Middleware that checks express-validator results.
 * If validation errors exist, responds with 400 and the error details.
 * Place this AFTER the validation chain arrays in routes.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    throw ApiError.badRequest('Validation failed', formattedErrors);
  }
  next();
};

module.exports = validate;
