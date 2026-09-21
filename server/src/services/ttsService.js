const axios = require('axios');

// Split long text into natural sentence fragments (< 160 chars) for smooth streaming
const splitTextForTTS = (text, maxLength = 160) => {
  const words = text.trim().split(/\s+/);
  const chunks = [];
  let currentChunk = '';

  for (const word of words) {
    if ((currentChunk + ' ' + word).trim().length <= maxLength) {
      currentChunk = (currentChunk + ' ' + word).trim();
    } else {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = word;
    }
  }
  if (currentChunk) chunks.push(currentChunk);
  return chunks.length > 0 ? chunks : [text.trim()];
};

// Neural speech synthesis via HTTP
const synthesizeWithWebTTS = async (text, language = 'en-US') => {
  const langCode = (language || 'en-US').split('-')[0] || 'en';
  const chunks = splitTextForTTS(text);
  const audioBuffers = [];

  for (const chunk of chunks) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${langCode}&client=tw-ob`;
    const res = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
      },
      timeout: 10000,
    });
    audioBuffers.push(Buffer.from(res.data));
  }

  return Buffer.concat(audioBuffers);
};

/**
 * Synthesize speech from text
 *
 * @param {Object} params
 * @param {string} params.text - The text to synthesize
 * @param {string} [params.language='en-US'] - Language code (e.g., 'en-US')
 * @returns {Promise<{ audioBuffer: Buffer, characterCount: number, durationMs: number }>}
 */
const synthesizeSpeech = async ({ text, language = 'en-US' }) => {
  const startTime = Date.now();
  const audioBuffer = await synthesizeWithWebTTS(text, language);
  const durationMs = Date.now() - startTime;

  return {
    audioBuffer,
    characterCount: text.length,
    durationMs,
  };
};

module.exports = {
  synthesizeSpeech,
};

