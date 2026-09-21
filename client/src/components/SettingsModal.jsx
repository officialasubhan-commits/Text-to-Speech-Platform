export default function SettingsModal({ isOpen, onClose, settings, onUpdateSettings, onSelectSample }) {
  if (!isOpen) return null;

  const sampleTexts = [
    "Welcome to AI Voice Studio, turning your imagination into sound.",
    "The journey of a thousand miles begins with a single step.",
    "Breathe in the calm dusk air, under the shadow of the sacred mountain.",
    "Technology is best when it brings people together and makes life easier."
  ];

  return (
    <div className="modal-backdrop-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
      <div className="modal-glass-container settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge settings-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </div>
            <div>
              <h2 id="settings-modal-title" className="modal-title">Voice Studio Settings</h2>
              <p className="modal-subtitle">Fine-tune acoustic pitch, volume, and playback</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close settings modal">
            ✕
          </button>
        </div>

        <div className="modal-body settings-body">
          {/* Pitch Slider */}
          <div className="setting-row">
            <div className="setting-info">
              <label htmlFor="pitch-slider" className="setting-label">Voice Pitch</label>
              <span className="setting-desc">Adjust the vocal frequency scale</span>
            </div>
            <div className="setting-control-group">
              <input 
                id="pitch-slider"
                type="range" 
                min="0.5" 
                max="1.5" 
                step="0.05"
                value={settings.pitch || 1.0}
                onChange={(e) => onUpdateSettings({ ...settings, pitch: parseFloat(e.target.value) })}
                className="custom-range-slider"
              />
              <span className="slider-val-badge">{(settings.pitch || 1.0).toFixed(2)}x</span>
            </div>
          </div>

          {/* Volume Slider */}
          <div className="setting-row">
            <div className="setting-info">
              <label htmlFor="volume-slider" className="setting-label">Master Volume</label>
              <span className="setting-desc">Output loudness for audio speech</span>
            </div>
            <div className="setting-control-group">
              <input 
                id="volume-slider"
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={settings.volume !== undefined ? settings.volume : 1.0}
                onChange={(e) => onUpdateSettings({ ...settings, volume: parseFloat(e.target.value) })}
                className="custom-range-slider"
              />
              <span className="slider-val-badge">{Math.round((settings.volume !== undefined ? settings.volume : 1.0) * 100)}%</span>
            </div>
          </div>

          {/* Preset Prompts / Sample Sentences */}
          <div className="sample-prompts-section">
            <h4 className="section-mini-heading">Quick Sample Sentences</h4>
            <div className="sample-chips-grid">
              {sampleTexts.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="sample-chip-btn"
                  onClick={() => {
                    onSelectSample(sample);
                    onClose();
                  }}
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            className="secondary-glass-btn" 
            onClick={() => onUpdateSettings({ pitch: 1.0, volume: 1.0 })}
          >
            Reset Defaults
          </button>
          <button type="button" className="primary-glass-btn" onClick={onClose}>
            Save & Done
          </button>
        </div>
      </div>
    </div>
  );
}
