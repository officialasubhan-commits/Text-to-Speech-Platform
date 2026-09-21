const documentService = require('../services/documentService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * POST /api/documents/upload
 * Upload document and extract text
 */
const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('Please select a file to upload (.txt, .pdf, or .docx).');
  }

  const result = await documentService.extractText(req.file);

  res.status(200).json({
    success: true,
    message: 'Text extracted successfully from document',
    data: result,
  });
});

module.exports = {
  uploadDocument,
};
