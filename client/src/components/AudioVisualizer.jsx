function AudioVisualizer({
  isSpeaking,
  isPaused,
  isCompleted,
  isVisible,
  isDownloading,
  isBlocked,
  onPlay,
  onPauseResume,
  onStop,
  onDownload,
  onClose,
  text,
}) {
  if (!isVisible && !isSpeaking && !isCompleted) return null;

  return (
    <div className={`audio-visualizer-bar ${isCompleted ? 'is-completed' : ''}`} role="region" aria-label="Audio Playback & Download Bar">
      {/* Waveform graphic */}
      <div className="visualizer-waves">
        {[...Array(16)].map((_, i) => (
          <span 
            key={i} 
            className={`vis-bar ${isPaused || isCompleted ? 'paused' : ''}`}
            style={{ 
              animationDelay: `${(i * 0.08) % 0.8}s`,
              height: isPaused || isCompleted ? `${6 + (i % 5) * 3}px` : undefined
            }}
          />
        ))}
      </div>

      {/* Live Status Label */}
      <div className="visualizer-status">
        <span className={`live-dot ${isSpeaking ? 'speaking' : isPaused ? 'paused' : 'completed'}`}></span>
        <span className="status-text">
          {isSpeaking ? (isPaused ? 'Paused' : 'Playing Audio...') : 'Audio Ready'}
        </span>
      </div>

      {/* Actions: Replay, Stop, and persistent MP3 / WAV download */}
      <div className="visualizer-actions">
        {isSpeaking ? (
          <>
            <button 
              type="button" 
              className="vis-ctrl-btn" 
              onClick={onPauseResume}
              title={isPaused ? 'Resume' : 'Pause'}
              aria-label={isPaused ? 'Resume speech' : 'Pause speech'}
            >
              {isPaused ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16"/>
                  <rect x="14" y="4" width="4" height="16"/>
                </svg>
              )}
            </button>

            <button 
              type="button" 
              className="vis-ctrl-btn stop-btn" 
              onClick={onStop}
              title="Stop Speech"
              aria-label="Stop speech"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="2"/>
              </svg>
            </button>
          </>
        ) : (
          <button 
            type="button" 
            className={`vis-ctrl-btn replay-btn ${isBlocked ? 'is-blocked' : ''}`}
            onClick={onPlay}
            disabled={isBlocked}
            title={isBlocked ? 'Replay blocked: text contains inappropriate content' : 'Replay Audio'}
            aria-label="Replay audio"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <span className="replay-label">Replay</span>
          </button>
        )}

        {/* Dedicated Audio Downloads: MP3 & WAV */}
        {onDownload && (
          <div className="download-btn-group">
            <button 
              type="button" 
              className={`vis-download-pill-btn mp3-btn ${isBlocked ? 'is-blocked' : ''}`}
              onClick={() => onDownload('mp3')}
              disabled={isDownloading || isBlocked}
              title={isBlocked ? 'Download blocked: text contains inappropriate content' : 'Download Audio as MP3'}
              aria-label="Download audio in MP3 format"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span>{isDownloading ? 'Downloading...' : 'Download MP3'}</span>
            </button>

            <button 
              type="button" 
              className={`vis-download-pill-btn wav-btn ${isBlocked ? 'is-blocked' : ''}`}
              onClick={() => onDownload('wav')}
              disabled={isDownloading || isBlocked}
              title={isBlocked ? 'Download blocked: text contains inappropriate content' : 'Download Audio as WAV'}
              aria-label="Download audio in WAV format"
            >
              <span>WAV</span>
            </button>
          </div>
        )}

        {/* Dismiss / Close Button */}
        {onClose && (
          <button
            type="button"
            className="vis-dismiss-btn"
            onClick={onClose}
            title="Close audio bar"
            aria-label="Dismiss audio controller"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default AudioVisualizer;
export { AudioVisualizer };

