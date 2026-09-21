/**
 * Audio Exporter Utility
 * Generates genuine, playable MP3 and WAV audio files
 * using backend speech synthesis and browser Web Audio conversion.
 */

// Helper to write ASCII strings into a DataView
function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Encodes Float32Array PCM samples into a valid RIFF 16-bit Mono PCM WAV Blob
 * @param {Float32Array} samples 
 * @param {number} sampleRate 
 * @returns {Blob}
 */
export function encodeWAV(samples, sampleRate = 44100) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + samples.length * 2, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (1 = raw PCM) */
  view.setUint16(20, 1, true);
  /* channel count (mono) */
  view.setUint16(22, 1, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  // Write PCM samples with clamp to [-1, 1]
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

/**
 * Triggers a native browser file download
 * @param {Blob} blob 
 * @param {string} filename 
 */
export function triggerAudioDownload(blob, filename = 'speech-audio.mp3') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2500);
}

/**
 * Fetches synthesized speech audio as an ArrayBuffer from backend
 * @param {string} text 
 * @param {Object} options 
 * @returns {Promise<ArrayBuffer>}
 */
async function fetchSpeechArrayBuffer(text, options = {}) {
  const language = typeof options.language === 'object' ? options.language.code : (options.language || 'en-US');
  const speed = options.speed || 1.0;
  const voice = options.voice || '';

  const endpoints = [
    '/api/tts/download',
    'http://localhost:5000/api/tts/download'
  ];

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      // First try POST to support arbitrarily long texts without URL length limits
      const postRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language,
          voice,
          speed,
          format: 'mp3',
        }),
      });

      if (postRes.ok) {
        return await postRes.arrayBuffer();
      }

      // Fallback to GET
      const getUrl = `${endpoint}?text=${encodeURIComponent(text)}&language=${encodeURIComponent(language)}&speed=${encodeURIComponent(speed)}&format=mp3`;
      const getRes = await fetch(getUrl);
      if (getRes.ok) {
        return await getRes.arrayBuffer();
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to reach speech synthesis server');
}

/**
 * Universal speech audio exporter supporting genuine MP3 and WAV files
 * @param {string} text - Text to convert to audio
 * @param {Object} options - Voice, speed, pitch, language parameters
 * @param {'mp3' | 'wav'} format - Desired container format
 * @returns {Promise<{ filename: string, format: string, size: number }>}
 */
export async function exportAudioFile(text, options = {}, format = 'mp3') {
  const isWav = format.toLowerCase() === 'wav';
  const cleanText = (text || '').trim() || 'Type anything, and let it speak with a natural, human-like voice.';
  const timestamp = Date.now();
  const ext = isWav ? 'wav' : 'mp3';
  const filename = `speech-${timestamp}.${ext}`;

  // 1. Fetch real synthesized speech audio bytes from the server
  const arrayBuffer = await fetchSpeechArrayBuffer(cleanText, options);

  if (isWav) {
    // 2a. For WAV: Decode genuine MP3 audio into PCM samples and encode standard RIFF WAV
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      const audioCtx = new AudioCtx();
      const decoded = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
      const channelData = decoded.getChannelData(0);
      const wavBlob = encodeWAV(channelData, decoded.sampleRate);
      triggerAudioDownload(wavBlob, filename);
      if (audioCtx.state !== 'closed') audioCtx.close();
      return { filename, format: 'wav', size: wavBlob.size };
    } else {
      throw new Error('Web Audio API not supported in this browser for WAV conversion.');
    }
  } else {
    // 2b. For MP3: Real authentic audio/mpeg binary stream
    const mp3Blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
    triggerAudioDownload(mp3Blob, filename);
    return { filename, format: 'mp3', size: mp3Blob.size };
  }
}
