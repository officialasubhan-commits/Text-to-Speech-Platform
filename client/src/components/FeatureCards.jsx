export default function FeatureCards() {
  return (
    <aside className="feature-cards-container" aria-label="Key Features">
      {/* Feature 1: Natural Voices */}
      <div className="feature-pill-card">
        <div className="feature-icon-badge sparkle-badge">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"/>
          </svg>
        </div>
        <div className="feature-card-content">
          <h3 className="feature-card-title">Natural Voices</h3>
          <p className="feature-card-desc">Realistic & expressive</p>
        </div>
      </div>

      {/* Feature 2: Fast & Easy */}
      <div className="feature-pill-card">
        <div className="feature-icon-badge lightning-badge">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>
        <div className="feature-card-content">
          <h3 className="feature-card-title">Fast & Easy</h3>
          <p className="feature-card-desc">Just type and listen</p>
        </div>
      </div>

      {/* Feature 3: Multiple Languages */}
      <div className="feature-pill-card">
        <div className="feature-icon-badge heart-badge">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
        </div>
        <div className="feature-card-content">
          <h3 className="feature-card-title">Multiple Languages</h3>
          <p className="feature-card-desc">Global voice support</p>
        </div>
      </div>
    </aside>
  );
}
