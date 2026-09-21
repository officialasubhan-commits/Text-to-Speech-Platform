const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const ApiError = require('../utils/ApiError');
const config = require('../config');

/**
 * Extract clean text from an uploaded document buffer (PDF, DOCX, TXT)
 *
 * @param {Object} file - Multer file object
 * @returns {Promise<{ text: string, characterCount: number, originalName: string }>}
 */
const extractText = async (file) => {
  if (!file || !file.buffer) {
    throw ApiError.badRequest('No file buffer provided for extraction.');
  }

  const ext = path.extname(file.originalname).toLowerCase();
  let extractedText = '';

  try {
    if (ext === '.txt') {
      extractedText = file.buffer.toString('utf-8');
    } else if (ext === '.pdf') {
      const data = await pdfParse(file.buffer);
      extractedText = data.text || '';
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      extractedText = result.value || '';
    } else {
      throw ApiError.badRequest(`Unsupported file format '${ext}'. Allowed: .txt, .pdf, .docx`);
    }
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw ApiError.badRequest(`Failed to parse ${ext} document: ${err.message}`);
  }

  // Normalize whitespaces and clean up line breaks
  const cleanedText = extractedText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!cleanedText) {
    throw ApiError.badRequest('No readable text could be extracted from this document.');
  }

  // Enforce max text length if text exceeds limits
  const truncatedText = cleanedText.length > config.maxTextLength
    ? cleanedText.slice(0, config.maxTextLength)
    : cleanedText;

  return {
    text: truncatedText,
    characterCount: truncatedText.length,
    originalLength: cleanedText.length,
    isTruncated: cleanedText.length > config.maxTextLength,
    originalName: file.originalname,
  };
};

module.exports = {
  extractText,
};
