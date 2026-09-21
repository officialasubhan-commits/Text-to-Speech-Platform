import { useState } from 'react';

export default function HistoryModal({
  isOpen,
  onClose,
  history,
  onReplay,
  onDelete,
  onClearAll,
  onToggleFavorite,
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'favorites'

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    if (filter === 'favorites') return item.isFavorite;
    return true;
  });

  const handlePlayAudio = (item) => {
    if (item.audioUrl) {
      const audio = new Audio(item.audioUrl);
      audio.play().catch(() => {
        onReplay(item.text, item.voice);
      });
    } else {
      onReplay(item.text, item.voice);
    }
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="history-modal-title">
      <div className="modal-glass-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <h2 id="history-modal-title" className="modal-title">Speech History & Favorites</h2>
              <p className="modal-subtitle">Review, favorite, and replay your speech recordings</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close history modal">
            ✕
          </button>
        </div>

        {/* Filter Toggle Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            type="button"
            className={`filter-chip-btn ${filter === 'all' ? 'is-active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Speeches ({history.length})
          </button>
          <button
            type="button"
            className={`filter-chip-btn ${filter === 'favorites' ? 'is-active' : ''}`}
            onClick={() => setFilter('favorites')}
          >
            ⭐ Favorites ({history.filter((h) => h.isFavorite).length})
          </button>
        </div>

        <div className="modal-body">
          {filteredHistory && filteredHistory.length > 0 ? (
            <div className="history-list">
              {filteredHistory.map((item) => (
                <div key={item.id} className="history-item-card">
                  <div className="history-item-main">
                    <p className="history-text">"{item.text}"</p>
                    <div className="history-meta-row">
                      <span className="meta-tag voice-tag">🎙️ {item.voice}</span>
                      <span className="meta-tag speed-tag">⚡ {item.speed}</span>
                      <span className="meta-tag lang-tag">🌐 {item.language}</span>
                      <span className="meta-time">{item.timestamp || item.date}</span>
                    </div>
                  </div>
                  <div className="history-actions">
                    {onToggleFavorite && (
                      <button
                        type="button"
                        className={`history-action-btn favorite-btn ${item.isFavorite ? 'is-favorited' : ''}`}
                        onClick={() => onToggleFavorite(item.id)}
                        title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        aria-label="Toggle favorite"
                      >
                        {item.isFavorite ? '★' : '☆'}
                      </button>
                    )}
                    <button 
                      type="button" 
                      className="history-action-btn play-btn" 
                      onClick={() => handlePlayAudio(item)}
                      title="Replay speech"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                      <span>Replay</span>
                    </button>
                    <button 
                      type="button" 
                      className="history-action-btn delete-btn" 
                      onClick={() => onDelete(item.id)}
                      title="Delete item"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-modal-state">
              <div className="empty-icon">{filter === 'favorites' ? '⭐' : '📜'}</div>
              <h3>{filter === 'favorites' ? 'No favorites yet' : 'No history yet'}</h3>
              <p>
                {filter === 'favorites'
                  ? 'Click the star icon next to any speech recording to save it to your favorites.'
                  : 'Type text on the main screen and click Speak to create voice recordings.'}
              </p>
            </div>
          )}
        </div>

        {history && history.length > 0 && (
          <div className="modal-footer">
            <span className="history-count">{filteredHistory.length} of {history.length} speech clips</span>
            <button type="button" className="clear-all-btn" onClick={onClearAll}>
              Clear History
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
