const { checkContent } = require('../utils/contentModerator');
const ApiError = require('../utils/ApiError');

/**
 * Express middleware to enforce content moderation policies.
 * Intercepts text fields in request body or query parameters
 * and rejects inappropriate or sensitive language.
 */
const contentFilter = (req, res, next) => {
  const textToCheck = req.body?.text || req.query?.text || '';

  if (!textToCheck || typeof textToCheck !== 'string') {
    return next();
  }

  const { isClean, flaggedWords } = checkContent(textToCheck);

  if (!isClean) {
    return res.status(400).json({
      success: false,
      message: `Content Policy Violation: Inappropriate or sensitive language is not permitted. Prohibited terms detected: "${flaggedWords.join(', ')}".`,
      flaggedWords,
    });
  }

  next();
};

module.exports = contentFilter;
