import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ========== TTS API ==========
export const ttsAPI = {
  generate: (data) => api.post('/tts', data),
  getVoices: () => api.get('/tts/voices'),
  download: (data) => api.post('/tts/download', data, { responseType: 'blob' }),
};

// ========== DOCUMENT API ==========
export const documentAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('document', file);
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
