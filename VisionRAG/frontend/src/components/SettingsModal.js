// SettingsModal Component: Comprehensive Frontend Settings & RAG Tuning

import { store } from '../store/state.js';
import { api } from '../services/api.js';

export class SettingsModal {
  constructor(containerEl, { onReplayIntro }) {
    this.container = containerEl;
    this.onReplayIntro = onReplayIntro;
    this.activeTab = 'general';
  }

  open() {
    this.render();
  }

  close() {
    this.container.innerHTML = '';
  }

  render() {
    const settings = store.getState().settings;

    this.container.innerHTML = `
      <div class="settings-modal-overlay" id="settings-overlay">
        <div class="settings-card">
          <!-- Left Settings Sidebar Tabs -->
          <div class="settings-sidebar">
            <div style="font-size: 14px; font-weight: 700; color: var(--text-primary); padding: 4px 10px 10px 10px;">Settings</div>
            
            <button class="settings-tab-btn ${this.activeTab === 'general' ? 'active' : ''}" data-tab="general">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              <span>General</span>
            </button>

            <button class="settings-tab-btn ${this.activeTab === 'rag' ? 'active' : ''}" data-tab="rag">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <span>RAG & Retrieval</span>
            </button>

            <button class="settings-tab-btn ${this.activeTab === 'vision' ? 'active' : ''}" data-tab="vision">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle></svg>
              <span>Vision & OCR</span>
            </button>

            <button class="settings-tab-btn ${this.activeTab === 'voice' ? 'active' : ''}" data-tab="voice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line></svg>
              <span>Voice & Audio</span>
            </button>

            <button class="settings-tab-btn ${this.activeTab === 'backend' ? 'active' : ''}" data-tab="backend">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
              <span>Backend API</span>
            </button>

            <button class="settings-tab-btn ${this.activeTab === 'data' ? 'active' : ''}" data-tab="data">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              <span>Data & Export</span>
            </button>
          </div>

          <!-- Right Content Panel -->
          <div class="settings-content-panel">
            ${this.renderActiveTabContent(settings)}
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderActiveTabContent(settings) {
    if (this.activeTab === 'general') {
      return `
        <div class="settings-group-title">General Preferences</div>
        
        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Color Theme</span>
            <span class="settings-sublabel">VisionRAG default is clean white ChatGPT aesthetic</span>
          </div>
          <select class="settings-select" id="setting-theme">
            <option value="white" ${settings.theme === 'white' ? 'selected' : ''}>Pure White (ChatGPT Standard)</option>
            <option value="soft" ${settings.theme === 'soft' ? 'selected' : ''}>Soft Neutral</option>
          </select>
        </div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Intro Splash Animation</span>
            <span class="settings-sublabel">Replay the futuristic 'O' letter and blinking eye intro</span>
          </div>
          <button class="btn-new-chat" id="btn-replay-splash" style="width: auto; padding: 7px 14px;">
            <span>Replay Intro</span>
          </button>
        </div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Typewriter Pacing</span>
            <span class="settings-sublabel">Text generation speed for assistant responses</span>
          </div>
          <select class="settings-select">
            <option value="fast" selected>Natural Streaming (22ms)</option>
            <option value="instant">Instant Render</option>
          </select>
        </div>
      `;
    }

    if (this.activeTab === 'rag') {
      return `
        <div class="settings-group-title">RAG & Retrieval Hyperparameters</div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Top-K Chunks Retrieved</span>
            <span class="settings-sublabel">Number of highest-scoring document patches to ingest</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="range" class="settings-slider" id="setting-topk" min="1" max="10" value="${settings.topK}" />
            <span style="font-weight: 600; font-size: 13px;" id="topk-val">${settings.topK}</span>
          </div>
        </div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Cosine Similarity Threshold</span>
            <span class="settings-sublabel">Cutoff score for vector patch grounding</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="range" class="settings-slider" id="setting-threshold" min="0.5" max="0.95" step="0.05" value="${settings.similarityThreshold}" />
            <span style="font-weight: 600; font-size: 13px;" id="threshold-val">${settings.similarityThreshold}</span>
          </div>
        </div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Cross-Encoder Neural Reranker</span>
            <span class="settings-sublabel">Re-ranks top candidates using BGE-Reranker-Large</span>
          </div>
          <input type="checkbox" id="setting-reranker" ${settings.rerankerEnabled ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--brand-green);" />
        </div>
      `;
    }

    if (this.activeTab === 'vision') {
      return `
        <div class="settings-group-title">Vision & Multimodal Processing</div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Vision Embedding Model</span>
            <span class="settings-sublabel">Multimodal patch and document encoder</span>
          </div>
          <select class="settings-select" id="setting-vision-model">
            <option value="colpali-v1.2" ${settings.visionModel === 'colpali-v1.2' ? 'selected' : ''}>ColPali v1.2 (Multi-Vector Patch)</option>
            <option value="clip-vit-l-14" ${settings.visionModel === 'clip-vit-l-14' ? 'selected' : ''}>CLIP ViT-L/14 (Standard)</option>
            <option value="siglip-so400m" ${settings.visionModel === 'siglip-so400m' ? 'selected' : ''}>SigLIP SO400M (High Precision)</option>
          </select>
        </div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">OCR Extraction Engine</span>
            <span class="settings-sublabel">Optical character recognition for scanned diagrams</span>
          </div>
          <select class="settings-select" id="setting-ocr">
            <option value="easyocr" ${settings.ocrEngine === 'easyocr' ? 'selected' : ''}>EasyOCR (Deep Learning)</option>
            <option value="tesseract" ${settings.ocrEngine === 'tesseract' ? 'selected' : ''}>Tesseract 5.3 (Fast)</option>
            <option value="paddleocr" ${settings.ocrEngine === 'paddleocr' ? 'selected' : ''}>PaddleOCR (Multilingual)</option>
          </select>
        </div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Video Keyframe Sampling Rate</span>
            <span class="settings-sublabel">Frames per second extracted from video feeds</span>
          </div>
          <select class="settings-select" id="setting-fps">
            <option value="0.5" ${settings.fps === 0.5 ? 'selected' : ''}>0.5 fps (1 frame every 2 sec)</option>
            <option value="1" ${settings.fps === 1 ? 'selected' : ''}>1.0 fps (Standard)</option>
            <option value="2" ${settings.fps === 2 ? 'selected' : ''}>2.0 fps (High Temporal Density)</option>
          </select>
        </div>
      `;
    }

    if (this.activeTab === 'voice') {
      return `
        <div class="settings-group-title">Voice & Audio Synthesis</div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Auto-Read Responses Aloud</span>
            <span class="settings-sublabel">Automatically speak assistant answers after generation</span>
          </div>
          <input type="checkbox" id="setting-autospeak" ${settings.autoSpeak ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--brand-green);" />
        </div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Speech Rate</span>
            <span class="settings-sublabel">Playback speed for text-to-speech voice</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="range" class="settings-slider" id="setting-speech-rate" min="0.8" max="1.4" step="0.1" value="${settings.speechRate || 1.0}" />
            <span style="font-weight: 600; font-size: 13px;" id="speech-rate-val">${settings.speechRate || 1.0}x</span>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'backend') {
      return `
        <div class="settings-group-title">Backend API & Health</div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">FastAPI Endpoint URL</span>
            <span class="settings-sublabel">Root address of the VisionRAG backend server</span>
          </div>
          <input type="text" class="settings-input" id="setting-backend-url" value="${settings.backendUrl}" style="min-width: 220px;" />
        </div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Neural Simulation Mode</span>
            <span class="settings-sublabel">Enable intelligent local multimodal simulation if backend is offline</span>
          </div>
          <input type="checkbox" id="setting-mockmode" ${settings.mockMode ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--brand-green);" />
        </div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Test Connection</span>
            <span class="settings-sublabel" id="ping-status-text">Click below to ping ${settings.backendUrl}</span>
          </div>
          <button class="btn-new-chat" id="btn-test-ping" style="width: auto; padding: 7px 14px;">
            <span>Ping Server</span>
          </button>
        </div>
      `;
    }

    if (this.activeTab === 'data') {
      return `
        <div class="settings-group-title">Data Management & Export</div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Export All Conversations</span>
            <span class="settings-sublabel">Download your chats and multimodal citations as JSON</span>
          </div>
          <button class="btn-new-chat" id="btn-export-json" style="width: auto; padding: 7px 14px;">
            <span>Export JSON</span>
          </button>
        </div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Reset Local Data</span>
            <span class="settings-sublabel" style="color: var(--danger);">Clear all chats, folders, and return to default state</span>
          </div>
          <button class="btn-new-chat" id="btn-reset-data" style="width: auto; padding: 7px 14px; border-color: #fca5a5; color: var(--danger);">
            <span>Reset Data</span>
          </button>
        </div>
      `;
    }

    return '';
  }

  bindEvents() {
    const overlay = this.container.querySelector('#settings-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.close();
      });
    }

    // Switch Tabs
    this.container.querySelectorAll('.settings-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tab;
        this.render();
      });
    });

    // Replay Intro
    const replayBtn = this.container.querySelector('#btn-replay-splash');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        this.close();
        if (this.onReplayIntro) this.onReplayIntro();
      });
    }

    // Sliders & Inputs
    const topkInput = this.container.querySelector('#setting-topk');
    const topkVal = this.container.querySelector('#topk-val');
    if (topkInput && topkVal) {
      topkInput.addEventListener('input', (e) => {
        topkVal.innerText = e.target.value;
        store.updateSettings({ topK: parseInt(e.target.value, 10) });
      });
    }

    const threshInput = this.container.querySelector('#setting-threshold');
    const threshVal = this.container.querySelector('#threshold-val');
    if (threshInput && threshVal) {
      threshInput.addEventListener('input', (e) => {
        threshVal.innerText = e.target.value;
        store.updateSettings({ similarityThreshold: parseFloat(e.target.value) });
      });
    }

    const rerankerInput = this.container.querySelector('#setting-reranker');
    if (rerankerInput) {
      rerankerInput.addEventListener('change', (e) => {
        store.updateSettings({ rerankerEnabled: e.target.checked });
      });
    }

    const visionModelSelect = this.container.querySelector('#setting-vision-model');
    if (visionModelSelect) {
      visionModelSelect.addEventListener('change', (e) => {
        store.updateSettings({ visionModel: e.target.value });
      });
    }

    const ocrSelect = this.container.querySelector('#setting-ocr');
    if (ocrSelect) {
      ocrSelect.addEventListener('change', (e) => {
        store.updateSettings({ ocrEngine: e.target.value });
      });
    }

    const fpsSelect = this.container.querySelector('#setting-fps');
    if (fpsSelect) {
      fpsSelect.addEventListener('change', (e) => {
        store.updateSettings({ fps: parseFloat(e.target.value) });
      });
    }

    const autoSpeakInput = this.container.querySelector('#setting-autospeak');
    if (autoSpeakInput) {
      autoSpeakInput.addEventListener('change', (e) => {
        store.updateSettings({ autoSpeak: e.target.checked });
      });
    }

    const mockModeInput = this.container.querySelector('#setting-mockmode');
    if (mockModeInput) {
      mockModeInput.addEventListener('change', (e) => {
        store.updateSettings({ mockMode: e.target.checked });
      });
    }

    const backendUrlInput = this.container.querySelector('#setting-backend-url');
    if (backendUrlInput) {
      backendUrlInput.addEventListener('change', (e) => {
        store.updateSettings({ backendUrl: e.target.value.trim() });
      });
    }

    // Ping Test
    const pingBtn = this.container.querySelector('#btn-test-ping');
    const pingStatus = this.container.querySelector('#ping-status-text');
    if (pingBtn && pingStatus) {
      pingBtn.addEventListener('click', async () => {
        pingStatus.innerText = 'Pinging server...';
        const ok = await api.checkHealth();
        if (ok) {
          pingStatus.innerHTML = `<span style="color: #10a37f; font-weight: 600;">✓ Connected to FastAPI backend!</span>`;
        } else {
          pingStatus.innerHTML = `<span style="color: #f59e0b;">Backend server offline. Running via Neural Simulation fallback.</span>`;
        }
      });
    }

    // Export JSON
    const exportBtn = this.container.querySelector('#btn-export-json');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(store.getState(), null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `visionrag_export_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      });
    }

    // Reset Data
    const resetBtn = this.container.querySelector('#btn-reset-data');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all data and conversations?')) {
          store.clearAllData();
          this.close();
        }
      });
    }
  }
}
