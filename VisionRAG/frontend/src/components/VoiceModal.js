// Voice Mode Modal: ChatGPT Voice Mode Fluid Glowing Orb & Real-Time Audio Chat

import { store } from '../store/state.js';
import { api } from '../services/api.js';

export class VoiceModal {
  constructor(containerEl) {
    this.container = containerEl;
    this.recognition = null;
    this.isListening = false;
    this.isSpeaking = false;
    this.audioContext = null;
    this.analyser = null;
    this.animationFrame = null;
  }

  open() {
    this.render();
    this.startVoiceSession();
  }

  close() {
    this.stopVoiceSession();
    this.container.innerHTML = '';
  }

  render() {
    this.container.innerHTML = `
      <div class="voice-mode-overlay" id="voice-overlay">
        <div class="voice-overlay-header">
          <div class="voice-status-title">
            <span id="voice-status-badge">Listening...</span>
          </div>
          <button class="voice-circle-btn btn-close-voice" id="btn-exit-voice" title="End Voice Chat">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="voice-orb-container">
          <!-- Fluid Glowing Voice Orb -->
          <div class="voice-fluid-orb" id="voice-fluid-orb"></div>
          <div class="voice-transcript-text" id="voice-live-transcript">
            Speak naturally to query your documents, diagrams, and video archives...
          </div>
        </div>

        <div class="voice-controls-bar">
          <button class="voice-circle-btn" id="btn-toggle-mic" title="Mute/Unmute Mic">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          </button>

          <button class="voice-circle-btn" id="btn-interrupt-speech" title="Interrupt Assistant">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const exitBtn = this.container.querySelector('#btn-exit-voice');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => this.close());
    }

    const micBtn = this.container.querySelector('#btn-toggle-mic');
    if (micBtn) {
      micBtn.addEventListener('click', () => {
        if (this.isListening) {
          this.stopListening();
          micBtn.style.color = '#ef4444';
        } else {
          this.startListening();
          micBtn.style.color = 'inherit';
        }
      });
    }

    const interruptBtn = this.container.querySelector('#btn-interrupt-speech');
    if (interruptBtn) {
      interruptBtn.addEventListener('click', () => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          this.isSpeaking = false;
          this.updateOrbState();
          this.startListening();
        }
      });
    }
  }

  startVoiceSession() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      const transcriptEl = this.container.querySelector('#voice-live-transcript');
      if (transcriptEl) {
        transcriptEl.innerText = 'Speech recognition is not supported in this browser. Please use standard chat or a Chromium browser.';
      }
      return;
    }

    this.recognition = new SpeechRec();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      this.updateOrbState('Listening...');
    };

    this.recognition.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join('');
      const transcriptEl = this.container.querySelector('#voice-live-transcript');
      if (transcriptEl) {
        transcriptEl.innerText = `“${transcript}”`;
      }

      if (e.results[0].isFinal) {
        this.processVoiceQuery(transcript);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (!this.isSpeaking) {
        this.updateOrbState('Idle');
      }
    };

    this.startListening();
  }

  startListening() {
    if (this.recognition && !this.isListening && !this.isSpeaking) {
      try {
        this.recognition.start();
        this.isListening = true;
        this.updateOrbState('Listening...');
      } catch (err) {
        console.warn('Recognition start caught:', err);
      }
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        this.isListening = false;
        this.updateOrbState('Mic paused');
      } catch (err) {
        console.warn('Recognition stop caught:', err);
      }
    }
  }

  async processVoiceQuery(userQuery) {
    this.stopListening();
    this.updateOrbState('Thinking & Retrieving...');

    const activeChat = store.getActiveChat() || store.createChat();

    // Add user message
    store.addMessage(activeChat.id, {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: userQuery,
      timestamp: Date.now()
    });

    // Query VisionRAG
    const result = await api.queryVisionRAG({
      prompt: userQuery,
      settings: store.getState().settings
    });

    // Add assistant message
    store.addMessage(activeChat.id, {
      id: 'msg-' + (Date.now() + 1),
      sender: 'assistant',
      text: result.text,
      timestamp: Date.now(),
      sources: result.sources
    });

    // Speak response out loud
    this.speakResponse(result.text);
  }

  speakResponse(text) {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    this.isSpeaking = true;
    this.updateOrbState('Speaking...');

    const clean = text
      .replace(/#+\s/g, '')
      .replace(/\*+/g, '')
      .replace(/`+/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '');

    const utterance = new SpeechSynthesisUtterance(clean);
    const settings = store.getState().settings;
    utterance.rate = settings.speechRate || 1.0;
    utterance.pitch = settings.speechPitch || 1.0;

    const transcriptEl = this.container.querySelector('#voice-live-transcript');
    if (transcriptEl) {
      transcriptEl.innerText = clean.slice(0, 160) + (clean.length > 160 ? '...' : '');
    }

    utterance.onend = () => {
      this.isSpeaking = false;
      this.updateOrbState('Listening...');
      this.startListening();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.updateOrbState('Listening...');
      this.startListening();
    };

    window.speechSynthesis.speak(utterance);
  }

  updateOrbState(statusText) {
    const badge = this.container.querySelector('#voice-status-badge');
    const orb = this.container.querySelector('#voice-fluid-orb');

    if (badge && statusText) {
      badge.innerText = statusText;
    }

    if (orb) {
      if (this.isSpeaking) {
        orb.classList.add('speaking');
      } else {
        orb.classList.remove('speaking');
      }
    }
  }

  stopVoiceSession() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn(e);
      }
      this.recognition = null;
    }
    this.isListening = false;
    this.isSpeaking = false;
  }
}
