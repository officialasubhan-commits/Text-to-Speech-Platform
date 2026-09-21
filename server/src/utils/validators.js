const { body, query } = require('express-validator');
const config = require('../config');

/**
 * Validation schemas for active endpoints.
 */

// ========== TTS ==========
const ttsValidation = [
  body('text')
    .trim()
    .notEmpty().withMessage('Text is required')
    .isLength({ min: config.minTextLength, max: config.maxTextLength })
    .withMessage(`Text must be between ${config.minTextLength} and ${config.maxTextLength} characters`),
  body('language')
    .trim()
    .notEmpty().withMessage('Language is required'),
  body('voice')
    .trim()
    .notEmpty().withMessage('Voice is required'),
  body('speed')
    .optional()
    .isFloat({ min: 0.25, max: 4.0 }).withMessage('Speed must be between 0.25 and 4.0'),
  body('pitch')
    .optional()
    .isFloat({ min: -20.0, max: 20.0 }).withMessage('Pitch must be between -20.0 and 20.0'),
  body('volume')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('Volume must be between 0 and 100'),
];

// ========== VOICES ==========
const voiceQueryValidation = [
  query('language')
    .optional()
    .trim()
    .isLength({ min: 2, max: 10 }).withMessage('Invalid language code'),
];

module.exports = {
  ttsValidation,
  voiceQueryValidation,
};
