// VisionRAG - Main Application Entrypoint

import { IntroSplash } from './components/IntroSplash.js';
import { Sidebar } from './components/Sidebar.js';
import { ChatArea } from './components/ChatArea.js';
import { VoiceModal } from './components/VoiceModal.js';
import { VideoModal } from './components/VideoModal.js';
import { SettingsModal } from './components/SettingsModal.js';
import { SourceModal } from './components/SourceModal.js';
import { AuthModal } from './components/AuthModal.js';
import { eyeTracker } from './utils/eyeTracker.js';
import { store } from './store/state.js';

document.addEventListener('DOMContentLoaded', () => {
  const modalContainer = document.getElementById('modal-container');
  const sidebarContainer = document.getElementById('sidebar');
  const mainContentContainer = document.getElementById('main-content');

  // Initialize real-time eye cursor tracking
  eyeTracker.init();

  // Initialize Splash Screen (Circle with 2 Eyes and '.' dot pupils)
  const splash = new IntroSplash();
  splash.init();

  // Instantiate Modals
  const voiceModal = new VoiceModal(modalContainer);
  const videoModal = new VideoModal(modalContainer);
  const sourceModal = new SourceModal(modalContainer);
  const authModal = new AuthModal(modalContainer);
  const settingsModal = new SettingsModal(modalContainer, {
    onReplayIntro: () => splash.replay()
  });

  // Instantiate Sidebar
  const sidebar = new Sidebar(sidebarContainer, {
    onOpenSettings: () => settingsModal.open(),
    onReplayIntro: () => splash.replay(),
    onOpenAuth: (mode) => authModal.open(mode)
  });
  sidebar.render();

  // Instantiate ChatArea
  const chatArea = new ChatArea(mainContentContainer, {
    onOpenVoice: () => voiceModal.open(),
    onOpenVideo: () => videoModal.open(),
    onOpenSource: (source) => sourceModal.open(source),
    onOpenSettings: () => settingsModal.open()
  });
  chatArea.render();

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // Ctrl+[ or Cmd+[ toggles sidebar
    if ((e.ctrlKey || e.metaKey) && e.key === '[') {
      e.preventDefault();
      store.toggleSidebar();
    }
    // Escape closes modals
    if (e.key === 'Escape') {
      voiceModal.close();
      videoModal.close();
      settingsModal.close();
      sourceModal.close();
      authModal.close();
    }
  });

  console.log('VisionRAG Multimodal Interface Initialized Successfully.');
});
