import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeatureCards from './components/FeatureCards';
import HistoryModal from './components/HistoryModal';
import SettingsModal from './components/SettingsModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState('dark');

  // Speech history in localStorage
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('tts_speech_history');
      return saved ? JSON.parse(saved) : [
        {
          id: 'preset-1',
          text: 'Type anything, and let it speak with a natural, human-like voice.',
          voice: 'Natural Female',
          speed: '1.0x',
          language: 'English (US)',
          timestamp: 'Just now',
          date: new Date().toLocaleDateString(),
          isFavorite: false,
        }
      ];
    } catch {
      return [];
    }
  });

  // User studio settings
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('tts_user_settings');
      return saved ? JSON.parse(saved) : { pitch: 1.0, volume: 1.0, rate: 1.0 };
    } catch {
      return { pitch: 1.0, volume: 1.0, rate: 1.0 };
    }
  });

  // Save history updates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tts_speech_history', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  }, [history]);

  // Save settings updates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tts_user_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  }, [settings]);

  const handleAddHistory = (newItem) => {
    setHistory(prev => [newItem, ...prev.slice(0, 49)]); // Keep up to 50 items
  };

  const handleDeleteHistory = (id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Clear all speech history?')) {
      setHistory([]);
    }
  };

  const handleToggleFavorite = (speechId) => {
    setHistory(prev =>
      prev.map(item =>
        item.id === speechId ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  const handleReplayHistory = (textToReplay, voiceName) => {
    setIsHistoryOpen(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToReplay);
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const matching = voices.find(v => v.name.toLowerCase().includes(voiceName.toLowerCase())) || voices[0];
        if (matching) utterance.voice = matching;
      }
      utterance.pitch = settings.pitch || 1.0;
      utterance.volume = settings.volume !== undefined ? settings.volume : 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelectSample = (sample) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(sample);
      utterance.pitch = settings.pitch || 1.0;
      utterance.volume = settings.volume !== undefined ? settings.volume : 1.0;
      window.speechSynthesis.speak(utterance);
      handleAddHistory({
        id: Date.now().toString(),
        text: sample,
        voice: 'Natural Female',
        speed: '1.0x',
        language: 'English (US)',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString(),
        isFavorite: false,
      });
    }
  };

  return (
    <div className={`app-viewport-root theme-${theme}`}>
      {/* Background Graphic & Atmosphere Lighting */}
      <div className="scenic-background" aria-hidden="true">
        <div className="bg-lighting-overlay"></div>
        <div className="bg-left-vignette"></div>
      </div>

      {/* Main UI Container */}
      <div className="app-content-shell">
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          theme={theme}
          setTheme={setTheme}
        />

        {/* Main Scenic Stage */}
        <main className="scenic-main-stage">
          {/* Left Column: Hero Title, Input Capsule, Secondary Controls */}
          <section className="stage-left-section">
            <HeroSection
              onAddHistory={handleAddHistory}
              settings={settings}
            />
          </section>

          {/* Right Column: Floating Feature Cards */}
          <section className="stage-right-section">
            <FeatureCards />
          </section>
        </main>
      </div>

      {/* Modals */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => {
          setIsHistoryOpen(false);
          setActiveTab('home');
        }}
        history={history}
        onReplay={handleReplayHistory}
        onDelete={handleDeleteHistory}
        onClearAll={handleClearAllHistory}
        onToggleFavorite={handleToggleFavorite}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          setActiveTab('home');
        }}
        settings={settings}
        onUpdateSettings={setSettings}
        onSelectSample={handleSelectSample}
      />
    </div>
  );
}
