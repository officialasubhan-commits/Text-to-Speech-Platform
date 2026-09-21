export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenHistory, 
  onOpenSettings, 
  theme, 
  setTheme 
}) {
  return (
    <header className="navbar-container">
      {/* Brand Logo & Title */}
      <div className="navbar-brand">
        <div className="brand-logo-wave" aria-hidden="true">
          <span className="wave-bar bar-1"></span>
          <span className="wave-bar bar-2"></span>
          <span className="wave-bar bar-3"></span>
          <span className="wave-bar bar-4"></span>
          <span className="wave-bar bar-5"></span>
        </div>
        <div className="brand-text">
          <h1 className="brand-title">Text to Speech</h1>
          <p className="brand-subtitle">Turn your words into natural voice</p>
        </div>
      </div>

      {/* Right Navigation & Tools */}
      <div className="navbar-nav-group">
        <nav className="navbar-links" aria-label="Main Navigation">
          <button 
            type="button"
            className={`nav-link-btn ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <span>Home</span>
            {activeTab === 'home' && <span className="active-glow-pill"></span>}
          </button>

          <button 
            type="button"
            className={`nav-link-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('history');
              onOpenHistory();
            }}
          >
            <span>History</span>
            {activeTab === 'history' && <span className="active-glow-pill"></span>}
          </button>

          <button 
            type="button"
            className={`nav-link-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('settings');
              onOpenSettings();
            }}
          >
            <span>Settings</span>
            {activeTab === 'settings' && <span className="active-glow-pill"></span>}
          </button>
        </nav>

        {/* Theme Toggle Button */}
        <button 
          type="button"
          className="theme-toggle-btn" 
          aria-label="Toggle brightness mode"
          title={theme === 'dark' ? 'Switch to Soft Glow' : 'Switch to Sunset Glow'}
          onClick={() => setTheme(prev => prev === 'dark' ? 'warm' : 'dark')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2"/>
            <path d="M12 20v2"/>
            <path d="m4.93 4.93 1.41 1.41"/>
            <path d="m17.66 17.66 1.41 1.41"/>
            <path d="M2 12h2"/>
            <path d="M20 12h2"/>
            <path d="m6.34 17.66-1.41 1.41"/>
            <path d="m19.07 4.93-1.41 1.41"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
