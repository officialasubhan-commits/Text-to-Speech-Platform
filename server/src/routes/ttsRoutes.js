const express = require('express');
const router = express.Router();
const ttsController = require('../controllers/ttsController');
const contentFilter = require('../middleware/contentFilter');

// Speech synthesis and file generation
router.post('/', contentFilter, ttsController.generateSpeech);

// Public speech download endpoints (stream audio bytes as MP3 / WAV)
router.get('/download', contentFilter, ttsController.downloadAudio);
router.post('/download', contentFilter, ttsController.downloadAudio);

// Voice catalog
router.get('/voices', ttsController.getVoices);

module.exports = router;
