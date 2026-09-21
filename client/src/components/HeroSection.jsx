import { useState, useEffect, useRef } from 'react';
import AudioVisualizer from './AudioVisualizer';
import { documentAPI } from '../services/api';
import { exportAudioFile } from '../utils/audioExporter';
import { checkContent, maskSensitiveWords } from '../utils/contentModerator';

const PRESET_LANGUAGES = [
  { code: 'en-US', label: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', label: 'English (UK)', flag: '🇬🇧' },
  { code: 'es-ES', label: 'Spanish (ES)', flag: '🇪🇸' },
  { code: 'fr-FR', label: 'French (FR)', flag: '🇫🇷' },
  { code: 'de-DE', label: 'German (DE)', flag: '🇩🇪' },
  { code: 'ja-JP', label: 'Japanese (JP)', flag: '🇯🇵' },
  { code: 'hi-IN', label: 'Hindi (IN)', flag: '🇮🇳' },
  { code: 'it-IT', label: 'Italian (IT)', flag: '🇮🇹' },
];

const PRESET_SPEEDS = [
  { value: 0.5, label: '0.5x' },
  { value: 0.75, label: '0.75x' },
  { value: 1.0, label: '1.0x' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 2.0, label: '2.0x' },
];

const PRESET_VOICE_STYLES = [
  { id: 'natural-female', name: 'Natural Female', tag: 'Warm & Natural', gender: 'female' },
  { id: 'natural-male', name: 'Natural Male', tag: 'Deep & Crisp', gender: 'male' },
  { id: 'studio-female', name: 'Studio Narrative', tag: 'Story & Audiobooks', gender: 'female' },
  { id: 'expressive-male', name: 'Expressive Male', tag: 'Dynamic Tone', gender: 'male' },
];

export default function HeroSection({ onAddHistory, settings }) {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Natural Female');
  const [selectedSpeed, setSelectedSpeed] = useState(1.0);
  const [selectedLanguage, setSelectedLanguage] = useState(PRESET_LANGUAGES[0]);

  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState(null); // 'voice' | 'speed' | 'language' | null

  // Speech states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [hasGeneratedAudio, setHasGeneratedAudio] = useState(false);
  const [isAudioCompleted, setIsAudioCompleted] = useState(false);

  // Document upload states
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [downloadToast, setDownloadToast] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const utteranceRef = useRef(null);
  const controlsRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(220, Math.max(54, textareaRef.current.scrollHeight))}px`;
    }
  }, [text]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (controlsRef.current && !controlsRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load browser speech synthesis voices
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleDropdown = (name) => {
    setOpenDropdown(prev => prev === name ? null : name);
  };

  // Document file extraction handler
  const processFile = async (file) => {
    if (!file) return;
    setUploadError('');
    setUploadSuccess('');
    setIsUploading(true);

    const extension = file.name.split('.').pop().toLowerCase();
    if (!['txt', 'pdf', 'docx'].includes(extension)) {
      setUploadError('Please select a .txt, .pdf, or .docx file');
      setIsUploading(false);
      return;
    }

    try {
      let extracted = '';
      // 1. Try server extraction
      try {
        const res = await documentAPI.upload(file);
        if (res.data?.success && res.data?.data?.text) {
          extracted = res.data.data.text;
        }
      } catch (err) {
        console.warn('Backend document upload unavailable, trying local fallback:', err.message);
      }

      // 2. Client-side fallback for .txt files
      if (!extracted) {
        if (extension === 'txt') {
          extracted = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
          });
        } else {
          throw new Error('Server connection required to extract PDF/DOCX files.');
        }
      }

      if (extracted && extracted.trim()) {
        const cleanText = extracted.trim().slice(0, 5000);
        setText(cleanText);
        const audit = checkContent(cleanText);
        if (!audit.isClean) {
          setUploadError(`⚠ Document contains prohibited terms: "${audit.flaggedWords.join(', ')}"`);
        } else {
          setUploadSuccess(`Extracted ${cleanText.length} chars from ${file.name}`);
        }
        setTimeout(() => setUploadSuccess(''), 4000);
      } else {
        throw new Error('No readable text found in document.');
      }
    } catch (err) {
      setUploadError(err.message || 'Failed to extract text from document');
      setTimeout(() => setUploadError(''), 4500);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Real-time Content Moderation Audit
  const contentAudit = checkContent(text);
  const hasSensitiveContent = !contentAudit.isClean;
  const flaggedWords = contentAudit.flaggedWords;

  const handleSpeak = () => {
    if (hasSensitiveContent) {
      setDownloadToast(`⚠ Inappropriate words detected: "${flaggedWords.join(', ')}". Please remove before speaking.`);
      setTimeout(() => setDownloadToast(''), 4500);
      return;
    }

    const textToSpeak = text.trim() || 'Type anything, and let it speak with a natural, human-like voice.';

    if (!('speechSynthesis' in window)) {
      alert('Speech Synthesis is not supported in this browser.');
      return;
    }

    // Cancel ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    // Pick best matching voice
    if (availableVoices.length > 0) {
      const langPrefix = selectedLanguage.code.split('-')[0];
      const matchingVoices = availableVoices.filter(v => v.lang.startsWith(langPrefix) || v.lang.replace('_', '-').startsWith(selectedLanguage.code));

      if (matchingVoices.length > 0) {
        const isFemalePref = selectedVoice.toLowerCase().includes('female');
        const bestVoice = matchingVoices.find(v => {
          const vName = v.name.toLowerCase();
          return isFemalePref 
            ? (vName.includes('female') || vName.includes('zira') || vName.includes('samantha') || vName.includes('victoria') || vName.includes('aria') || vName.includes('jenny'))
            : (vName.includes('male') || vName.includes('david') || vName.includes('guy') || vName.includes('george') || vName.includes('alex'));
        }) || matchingVoices[0];

        utterance.voice = bestVoice;
      }
    }

    utterance.rate = selectedSpeed * (settings?.rate || 1.0);
    utterance.pitch = settings?.pitch || 1.0;
    utterance.volume = settings?.volume !== undefined ? settings.volume : 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setHasGeneratedAudio(true);
      setIsAudioCompleted(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setIsAudioCompleted(true);
      setHasGeneratedAudio(true);
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis ended or was cancelled:', e);
      setIsSpeaking(false);
      setIsPaused(false);
      setIsAudioCompleted(true);
      setHasGeneratedAudio(true);
    };

    window.speechSynthesis.speak(utterance);

    // Record history
    if (onAddHistory) {
      onAddHistory({
        id: Date.now().toString(),
        text: textToSpeak,
        voice: selectedVoice,
        speed: `${selectedSpeed}x`,
        language: selectedLanguage.label,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString()
      });
    }
  };

  const handlePauseResume = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setIsAudioCompleted(true);
  };

  // Real Audio File Export (Playable MP3 or WAV format)
  const handleDownload = async (format = 'mp3') => {
    if (hasSensitiveContent) {
      setDownloadToast(`⚠ Inappropriate words detected: "${flaggedWords.join(', ')}". Please remove before downloading.`);
      setTimeout(() => setDownloadToast(''), 4500);
      return;
    }

    const textToSpeak = text.trim() || 'Type anything, and let it speak with a natural, human-like voice.';
    const isFemale = selectedVoice.toLowerCase().includes('female');
    const upperFmt = format.toUpperCase();
    
    setIsDownloading(true);
    setDownloadToast(`Preparing ${upperFmt} audio...`);

    try {
      const result = await exportAudioFile(textToSpeak, {
        speed: selectedSpeed * (settings?.rate || 1.0),
        pitch: settings?.pitch || 1.0,
        language: selectedLanguage?.code || 'en-US',
        voice: selectedVoice,
        isFemale,
      }, format);

      setDownloadToast(`✓ ${upperFmt} downloaded (${(result.size / 1024).toFixed(1)} KB)`);
      setHasGeneratedAudio(true);
      setIsAudioCompleted(true);
      setTimeout(() => setDownloadToast(''), 4000);
    } catch (err) {
      console.error('Audio export error:', err);
      setDownloadToast(`Download failed: ${err.message}`);
      setTimeout(() => setDownloadToast(''), 4500);
    } finally {
      setIsDownloading(false);
    }
  };

  // Metrics calculations
  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const estimatedSeconds = wordCount > 0 ? Math.max(1, Math.round((wordCount / (140 * selectedSpeed)) * 60)) : 0;

  return (
    <div className="hero-section-wrapper">
      {/* Hidden file input for document upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".txt,.pdf,.docx"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files?.[0]) processFile(e.target.files[0]);
        }}
      />

      {/* Grand Title & Subtitle */}
      <div className="hero-header-text">
        <h2 className="hero-title">Text to Speech</h2>
        <p className="hero-subtitle">
          Type anything, and let it speak<br className="hero-break" />
          with a natural, human-like voice.
        </p>
      </div>

      {/* Main Glassmorphism Input Bar */}
      <div 
        className={`tts-input-glass-card ${isDragOver ? 'is-drag-over' : ''} ${hasSensitiveContent ? 'has-sensitive-content' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files?.[0]) {
            processFile(e.dataTransfer.files[0]);
          }
        }}
      >
        {/* Drag and Drop Notification Overlay */}
        {isDragOver && (
          <div className="drag-drop-overlay">
            <span>Drop your document here (.txt, .pdf, .docx)</span>
          </div>
        )}

        <div className="input-row-main">
          {/* Document Upload Button on Left */}
          <button
            type="button"
            className={`input-doc-btn ${isUploading ? 'uploading' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            title="Upload document (.txt, .pdf, .docx)"
            aria-label="Upload document"
            disabled={isUploading}
          >
            {isUploading ? (
              <span className="doc-upload-spinner" aria-hidden="true"></span>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="8" y1="13" x2="16" y2="13"/>
                <line x1="8" y1="17" x2="14" y2="17"/>
              </svg>
            )}
          </button>

          {/* Multiline Textarea */}
          <div className="textarea-wrapper">
            <textarea
              ref={textareaRef}
              className="tts-main-textarea"
              placeholder="Type or paste your text here, or drop a document (.txt, .pdf, .docx)..."
              value={text}
              maxLength={5000}
              rows={2}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  if (isSpeaking) handleStop();
                  else handleSpeak();
                }
              }}
              aria-label="Text to speak"
            />
          </div>

          {/* Action Buttons Column */}
          <div className="input-actions-col">
            {/* Clear Button if text present */}
            {text && (
              <button 
                type="button" 
                className="input-clear-btn" 
                onClick={() => setText('')}
                title="Clear text"
                aria-label="Clear input"
              >
                ×
              </button>
            )}

            {/* Speak Action Button */}
            <button 
              type="button" 
              className={`speak-pill-btn ${isSpeaking && !isPaused ? 'speaking-active' : ''} ${hasSensitiveContent ? 'is-blocked' : ''}`}
              onClick={isSpeaking ? handleStop : handleSpeak}
              disabled={hasSensitiveContent || (!text.trim() && !isSpeaking)}
              title={hasSensitiveContent ? `Disabled: text contains prohibited terms (${flaggedWords.join(', ')})` : (isSpeaking ? 'Stop speaking' : 'Speak text')}
              aria-label={isSpeaking ? 'Stop speaking' : 'Speak text'}
            >
              {isSpeaking ? (
                <>
                  <span className="btn-stop-icon">■</span>
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <svg className="speak-plane-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                  <span>Speak</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Moderation Warning Banner */}
        {hasSensitiveContent && (
          <div className="content-warning-banner" role="alert">
            <div className="warning-content">
              <span className="warning-badge">⚠ Inappropriate Content</span>
              <span className="warning-text">
                Prohibited terms detected: {flaggedWords.map(w => <span key={w} className="flagged-chip">"{w}"</span>)}
              </span>
            </div>
            <button 
              type="button" 
              className="censor-btn" 
              onClick={() => setText(maskSensitiveWords(text))}
              title="Mask sensitive words with asterisks"
            >
              Auto-Censor
            </button>
          </div>
        )}

        {/* Live Speech Metrics & File Upload Status Row */}
        <div className="input-meta-bar">
          <div className="input-meta-left">
            <button
              type="button"
              className="meta-badge-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Click to select file"
            >
              📄 Upload (.pdf, .docx, .txt)
            </button>
            {text.trim() && (
              <button
                type="button"
                className={`meta-download-quick-btn ${hasSensitiveContent ? 'is-blocked' : ''}`}
                onClick={() => handleDownload('mp3')}
                disabled={isDownloading || hasSensitiveContent}
                title={hasSensitiveContent ? `Disabled: text contains prohibited terms (${flaggedWords.join(', ')})` : "Download speech audio immediately as MP3"}
              >
                {isDownloading ? '⏳ Downloading...' : '📥 Download MP3'}
              </button>
            )}
            {downloadToast && <span className="upload-toast success">{downloadToast}</span>}
            {uploadSuccess && <span className="upload-toast success">✓ {uploadSuccess}</span>}
            {uploadError && <span className="upload-toast error">⚠ {uploadError}</span>}
          </div>

          <div className="input-meta-right">
            <span className="shortcut-hint-text">Ctrl+Enter to speak</span>
            {quota && (
              <span
                className={`meta-quota-pill ${quota.percentUsed > 80 ? 'near-limit' : ''}`}
                title="Monthly character quota usage"
              >
                📊 {quota.charactersUsed?.toLocaleString()} / {quota.characterLimit?.toLocaleString()} chars ({quota.percentUsed}%)
              </span>
            )}
            {wordCount > 0 && (
              <>
                <span className="meta-stat-pill">⏱️ ~{estimatedSeconds}s audio</span>
                <span className="meta-stat-pill">{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
              </>
            )}
            <span className={`char-counter ${text.length > 4500 ? 'warning' : ''}`}>
              {text.length.toLocaleString()} / 5,000
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Controls Bar (Voice, Speed, Language) */}
      <div className="tts-controls-glass-card" ref={controlsRef}>
        {/* 1. Voice Selector */}
        <div className="control-column-segment">
          <button
            type="button"
            className={`control-trigger-btn ${openDropdown === 'voice' ? 'dropdown-open' : ''}`}
            onClick={() => handleToggleDropdown('voice')}
            aria-haspopup="listbox"
            aria-expanded={openDropdown === 'voice'}
          >
            <div className="control-icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className="control-label-group">
              <span className="control-label-top">Voice</span>
              <span className="control-value-text">{selectedVoice}</span>
            </div>
            <span className="control-chevron-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </span>
          </button>

          {/* Voice Dropdown Menu */}
          {openDropdown === 'voice' && (
            <div className="glass-dropdown-menu voice-menu" role="listbox">
              <div className="dropdown-section-title">Natural AI Voices</div>
              {PRESET_VOICE_STYLES.map((v) => (
                <div
                  key={v.id}
                  role="option"
                  aria-selected={selectedVoice === v.name}
                  className={`dropdown-option-item ${selectedVoice === v.name ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedVoice(v.name);
                    setOpenDropdown(null);
                  }}
                >
                  <div className="option-name-row">
                    <span className="opt-name">{v.name}</span>
                    <span className="opt-badge">{v.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="control-divider" aria-hidden="true" />

        {/* 2. Speed Selector */}
        <div className="control-column-segment">
          <button
            type="button"
            className={`control-trigger-btn ${openDropdown === 'speed' ? 'dropdown-open' : ''}`}
            onClick={() => handleToggleDropdown('speed')}
            aria-haspopup="listbox"
            aria-expanded={openDropdown === 'speed'}
          >
            <div className="control-icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="control-label-group">
              <span className="control-label-top">Speed</span>
              <span className="control-value-text">{selectedSpeed}x</span>
            </div>
            <span className="control-chevron-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </span>
          </button>

          {/* Speed Dropdown Menu */}
          {openDropdown === 'speed' && (
            <div className="glass-dropdown-menu speed-menu" role="listbox">
              <div className="dropdown-section-title">Playback Rate</div>
              {PRESET_SPEEDS.map((s) => (
                <div
                  key={s.value}
                  role="option"
                  aria-selected={selectedSpeed === s.value}
                  className={`dropdown-option-item ${selectedSpeed === s.value ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedSpeed(s.value);
                    setOpenDropdown(null);
                  }}
                >
                  <span className="opt-name">{s.label}</span>
                  {s.value === 1.0 && <span className="opt-badge">Normal</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="control-divider" aria-hidden="true" />

        {/* 3. Language Selector */}
        <div className="control-column-segment">
          <button
            type="button"
            className={`control-trigger-btn ${openDropdown === 'language' ? 'dropdown-open' : ''}`}
            onClick={() => handleToggleDropdown('language')}
            aria-haspopup="listbox"
            aria-expanded={openDropdown === 'language'}
          >
            <div className="control-icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <div className="control-label-group">
              <span className="control-label-top">Language</span>
              <span className="control-value-text">{selectedLanguage.label}</span>
            </div>
            <span className="control-chevron-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </span>
          </button>

          {/* Language Dropdown Menu */}
          {openDropdown === 'language' && (
            <div className="glass-dropdown-menu language-menu" role="listbox">
              <div className="dropdown-section-title">Select Language</div>
              {PRESET_LANGUAGES.map((lang) => (
                <div
                  key={lang.code}
                  role="option"
                  aria-selected={selectedLanguage.code === lang.code}
                  className={`dropdown-option-item ${selectedLanguage.code === lang.code ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedLanguage(lang);
                    setOpenDropdown(null);
                  }}
                >
                  <span className="opt-flag">{lang.flag}</span>
                  <span className="opt-name">{lang.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Persistent Audio Visualizer & Download Controller */}
      <AudioVisualizer
        isSpeaking={isSpeaking}
        isPaused={isPaused}
        isCompleted={isAudioCompleted}
        isVisible={hasGeneratedAudio}
        isDownloading={isDownloading}
        isBlocked={hasSensitiveContent}
        onPlay={handleSpeak}
        onPauseResume={handlePauseResume}
        onStop={handleStop}
        onDownload={handleDownload}
        onClose={() => {
          setHasGeneratedAudio(false);
          setIsAudioCompleted(false);
          setIsSpeaking(false);
          if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        }}
        text={text}
      />
    </div>
  );
}
