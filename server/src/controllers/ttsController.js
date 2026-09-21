const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();
const ttsService = require('../services/ttsService');
const config = require('../config');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// Ensure uploads directory exists
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * POST /api/tts
 * Synthesize speech and return playable audio URL
 */
const generateSpeech = asyncHandler(async (req, res) => {
  const { text, language = 'en-US', voice = 'en-US-Standard-C', speed = 1.0, pitch = 0.0, volume = 100 } = req.body;

  if (!text || !text.trim()) {
    throw ApiError.badRequest('Text parameter is required.');
  }

  const charCount = text.trim().length;

  if (charCount > config.maxTextLength) {
    throw ApiError.badRequest(`Text exceeds maximum allowed length of ${config.maxTextLength} characters.`);
  }

  // Synthesize speech
  const { audioBuffer, durationMs } = await ttsService.synthesizeSpeech({
    text: text.trim(),
    language,
    voice,
    speed: parseFloat(speed) || 1.0,
    pitch: parseFloat(pitch) || 0.0,
    volume: parseInt(volume, 10) || 100,
  });

  const speechId = uuidv4();
  const filename = `speech-${speechId}.mp3`;
  const filePath = path.join(uploadsDir, filename);

  // Write file to uploads directory
  await fs.promises.writeFile(filePath, audioBuffer);

  const audioUrl = `/uploads/${filename}`;

  res.status(201).json({
    success: true,
    message: 'Speech synthesized successfully',
    data: {
      id: speechId,
      audioUrl,
      characterCount: charCount,
      durationMs,
      language,
      voice,
    },
  });
});

/**
 * GET & POST /api/tts/download
 * Directly generate and stream speech audio as MP3 or WAV
 */
const downloadAudio = asyncHandler(async (req, res) => {
  const text = (req.method === 'POST' ? req.body?.text : req.query?.text) || req.body?.text || req.query?.text;
  const language = (req.method === 'POST' ? req.body?.language : req.query?.language) || req.body?.language || req.query?.language || 'en-US';
  const voice = (req.method === 'POST' ? req.body?.voice : req.query?.voice) || req.body?.voice || req.query?.voice;
  const speed = (req.method === 'POST' ? req.body?.speed : req.query?.speed) || req.body?.speed || req.query?.speed || 1.0;
  const format = ((req.method === 'POST' ? req.body?.format : req.query?.format) || req.body?.format || req.query?.format || 'mp3').toLowerCase();

  if (!text || !text.trim()) {
    throw ApiError.badRequest('Text parameter is required.');
  }

  const { audioBuffer } = await ttsService.synthesizeSpeech({
    text: text.trim(),
    language,
    voice,
    speed: parseFloat(speed) || 1.0,
  });

  const ext = format === 'wav' ? 'wav' : 'mp3';
  const contentType = ext === 'wav' ? 'audio/wav' : 'audio/mpeg';

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="speech-${Date.now()}.${ext}"`);
  res.setHeader('Cache-Control', 'no-cache');
  res.send(audioBuffer);
});

/**
 * GET /api/tts/voices
 * Return preset voice catalog
 */
const getVoices = asyncHandler(async (req, res) => {
  const voices = [
    { id: 'en-US-Standard-C', name: 'Natural Female', language: 'en-US', gender: 'FEMALE' },
    { id: 'en-US-Standard-D', name: 'Natural Male', language: 'en-US', gender: 'MALE' },
    { id: 'en-GB-Standard-A', name: 'Studio Narrative', language: 'en-GB', gender: 'FEMALE' },
    { id: 'en-GB-Standard-B', name: 'Expressive Male', language: 'en-GB', gender: 'MALE' },
    { id: 'es-ES-Standard-A', name: 'Spanish Female', language: 'es-ES', gender: 'FEMALE' },
    { id: 'fr-FR-Standard-A', name: 'French Female', language: 'fr-FR', gender: 'FEMALE' },
    { id: 'de-DE-Standard-A', name: 'German Female', language: 'de-DE', gender: 'FEMALE' },
    { id: 'hi-IN-Standard-A', name: 'Hindi Female', language: 'hi-IN', gender: 'FEMALE' },
    { id: 'ja-JP-Standard-A', name: 'Japanese Female', language: 'ja-JP', gender: 'FEMALE' },
    { id: 'it-IT-Standard-A', name: 'Italian Female', language: 'it-IT', gender: 'FEMALE' },
  ];

  res.status(200).json({
    success: true,
    data: voices,
  });
});

module.exports = {
  generateSpeech,
  downloadAudio,
  getVoices,
};
