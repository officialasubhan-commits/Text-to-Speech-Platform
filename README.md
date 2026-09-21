# 🔊 Text-to-Speech (TTS) Web Application

A modern, high-performance, full-stack Text-to-Speech Web Application. Designed for speed, natural vocal clarity, and seamless document-to-speech conversion without authentication walls or unnecessary friction.

---

## 📑 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Key Features](#2-key-features)
3. [Architecture & Technology Stack](#3-architecture--technology-stack)
4. [API Reference](#4-api-reference)
5. [Environment Variables Reference](#5-environment-variables-reference)
6. [Getting Started & Installation](#6-getting-started--installation)
7. [Automated Testing](#7-automated-testing)
8. [Features Walkthrough](#8-features-walkthrough)

---

## 1. Project Overview

The **Text-to-Speech Studio** is a clean, responsive web application that turns any text or uploaded document into natural spoken audio. By combining browser Web Speech synthesis with backend audio stream export, users get zero-latency live voice generation as well as genuine `.mp3` and `.wav` downloads.

### Highlights
- 🎙️ **Zero-Latency Live Playback**: Instant speech generation powered by browser Web Speech API with rich voices across multiple languages.
- 💾 **Audio Export (MP3 & WAV)**: Direct high-fidelity speech synthesis streaming with download support.
- 📄 **Document Extraction**: Upload `.pdf`, `.docx`, and `.txt` files up to 10 MB to instantly extract and vocalize text.
- ⚡ **Offline-First Speech History & Favorites**: Speech history and favorites persisted instantly to `localStorage` with one-click replay and search.
- 🛡️ **Content Moderation**: Real-time client and server filtering preventing toxic language and hate speech.
- 🔒 **Clean Architecture**: Free of unnecessary login walls, JWT overhead, or redundant cloud storage costs.

---

## 2. Key Features

| Feature | Description |
|---|---|
| **Voice Synthesis** | Multi-language natural voices (English US/UK, Spanish, French, German, Japanese, Hindi, Italian) |
| **Acoustic Controls** | Custom playback speed (0.5x–2.0x), pitch tuning, and master volume controls |
| **Audio Visualizer** | Dynamic wave animation, play/pause/stop toggles, and direct MP3/WAV download buttons |
| **Document Upload** | Server-side parsing of PDF, Word (.docx), and plain text documents via `pdf-parse` and `mammoth` |
| **History & Favorites** | Fast local storage with tabbed filtering between All Speeches and Favorites |
| **Security & Safety** | Helmet security headers, CORS origin protection, API rate limiting, and content moderation |

---

## 3. Architecture & Technology Stack

### System Architecture

```
┌────────────────────────────────────────────────────────┐
│               Frontend: React 19 (Vite 6)              │
│  - HeroSection (Voice, Speed, Language, Visualizer)    │
│  - SettingsModal (Pitch, Volume, Acoustic Samples)     │
│  - HistoryModal (Replay, Filter Favorites, Clear All)  │
│  - Document Extractor & Content Moderator Filter       │
└───────────────────────────▲────────────────────────────┘
                            │ HTTP / REST
┌───────────────────────────▼────────────────────────────┐
│              Backend: Node.js + Express 5              │
│  - Express REST API with Helmet & CORS protection      │
│  - express-rate-limit protection                       │
│  - Content moderation filter                           │
│  - Document text extraction (pdf-parse, mammoth)       │
│  - Audio stream synthesis & export (/api/tts/download) │
└────────────────────────────────────────────────────────┘
```

### Technology Stack
- **Frontend**: React 19, Vite 6, Modern Vanilla CSS Design System
- **Backend Runtime**: Node.js (v18+ / v20+ / v22+ / v24+)
- **Web Framework**: Express 5
- **Document Processing**: `pdf-parse` (PDF) and `mammoth` (DOCX)
- **Database / ORM**: PostgreSQL via Prisma ORM
- **Testing**: Jest + Supertest

---

## 4. API Reference

### Health & Monitoring
- `GET /api/health` — Returns server uptime, environment, and database connectivity.

### Speech Synthesis & Audio Export
- `GET /api/tts/voices` — Returns the preset catalog of natural voices and supported languages.
- `GET /api/tts/download?text=...&language=...&speed=...&format=mp3` — Streams synthesized audio file attachment.
- `POST /api/tts/download` — Synthesizes long text and streams audio file (`{ text, language, voice, speed, format }`).
- `POST /api/tts` — Synthesizes text and saves audio file to `/uploads/speech-[id].mp3`, returning audio URL.

### Document Processing
- `POST /api/documents/upload` — Uploads a `.txt`, `.pdf`, or `.docx` file (multipart form field `document`) and returns cleaned extracted text.

---

## 5. Environment Variables Reference

### Server (`server/.env`)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://...
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Client (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 6. Getting Started & Installation

### 1. Install Dependencies
```bash
# In server directory
cd server
npm install

# In client directory
cd ../client
npm install
```

### 2. Run the Development Servers
```bash
# In the root directory:
npm run dev

# Or run separately:
# Backend (Port 5000):
cd server && npm run dev

# Frontend (Port 5173):
cd client && npm run dev
```

---

## 7. Automated Testing

Run the automated integration test suite in `server/`:
```bash
cd server
npm test
```

All test suites verify:
- Health check and 404 handler
- Voice catalog retrieval
- Speech synthesis and direct MP3/WAV streaming
- Content moderation blocking inappropriate words
- Document upload validation

---

## 8. Features Walkthrough

1. **Text to Speech**: Enter any sentence or phrase into the hero input. Choose voice, language, and speed, then click **Speak**.
2. **Document Upload**: Drag and drop or browse any `.pdf`, `.docx`, or `.txt` document to extract text instantly.
3. **Audio Downloader**: Click **Download MP3** or **WAV** in the audio visualizer bar to save the recording to your machine.
4. **Settings**: Open Settings from the navbar to fine-tune vocal pitch and master volume.
5. **Speech History**: Open History from the navbar to review past generations, mark favorites with the heart icon, or replay past utterances anytime.
