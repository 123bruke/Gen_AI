// SettingsModal Component: Comprehensive Frontend Settings, RAG Tuning & DB Logs Inspector

import { store } from '../store/state.js';
import { api } from '../services/api.js';

export class SettingsModal {
  constructor(containerEl, { onReplayIntro }) {
    this.container = containerEl;
    this.onReplayIntro = onReplayIntro;
    this.activeTab = 'general';
    this.dbStatus = null;
    this.progressLogs = [];
    this.isLoadingLogs = false;
  }

  async open() {
    this.render();
    if (this.activeTab === 'database') {
      await this.fetchDbAndLogs();
    }
  }

  close() {
    this.container.innerHTML = '';
  }

  async fetchDbAndLogs() {
    this.isLoadingLogs = true;
    try {
      this.dbStatus = await api.getDatabaseStatus();
      const res = await api.getProgressLogs(50);
      this.progressLogs = res.logs || [];
    } catch (e) {
      console.warn('Failed to load DB stats or logs:', e);
    } finally {
      this.isLoadingLogs = false;
      this.render();
    }
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

            <button class="settings-tab-btn ${this.activeTab === 'database' ? 'active' : ''}" data-tab="database">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
              </svg>
              <span>Database & Logs</span>
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
    if (this.activeTab === 'database') {
      const db = this.dbStatus || {};
      const isPostgres = db.is_postgres || db.db_type === 'postgresql';
      const dbBadgeColor = isPostgres ? '#10b981' : '#3b82f6';
      const dbTitle = isPostgres ? 'PostgreSQL Production Database' : 'Resilient SQLite Database';

      return `
        <div class="settings-group-title">PostgreSQL & DB Architecture</div>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${dbBadgeColor};"></span>
              <span style="font-size: 13.5px; font-weight: 700; color: #1e293b;">${dbTitle}</span>
            </div>
            <span style="font-size: 11px; padding: 3px 8px; border-radius: 4px; background: #e2e8f0; font-weight: 600; text-transform: uppercase;">
              ${db.db_type || 'Active'}
            </span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 10px;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center;">
              <div style="font-size: 11px; color: #64748b; font-weight: 600;">Registered Accounts</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 2px;">${db.user_count !== undefined ? db.user_count : 0}</div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center;">
              <div style="font-size: 11px; color: #64748b; font-weight: 600;">Input & Uploaded Files</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 2px;">${db.uploaded_files_count !== undefined ? db.uploaded_files_count : 0}</div>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center;">
              <div style="font-size: 11px; color: #64748b; font-weight: 600;">Recorded Sessions</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 2px;">${db.session_count !== undefined ? db.session_count : 0}</div>
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 20px; margin-bottom: 10px;">
          <div>
            <div class="settings-group-title" style="margin-bottom: 2px;">Separate DB Section: Progress & Audit Logs</div>
            <div style="font-size: 11.5px; color: var(--text-muted);">Captured via Python's standard <code>logging</code> library and saved in separate storage</div>
          </div>
          <button class="btn-new-chat" id="btn-refresh-logs" style="width: auto; padding: 5px 12px; font-size: 11.5px;">
            <span>${this.isLoadingLogs ? 'Loading...' : 'Refresh Logs'}</span>
          </button>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; max-height: 250px; overflow-y: auto; background: #ffffff;">
          ${
            this.progressLogs.length === 0
              ? `<div style="padding: 20px; text-align: center; color: #94a3b8; font-size: 12.5px;">No progress logs recorded yet.</div>`
              : `
            <table style="width: 100%; border-collapse: collapse; font-size: 11.5px; text-align: left;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">
                  <th style="padding: 8px 10px;">Event</th>
                  <th style="padding: 8px 10px;">Level</th>
                  <th style="padding: 8px 10px;">Timestamp</th>
                  <th style="padding: 8px 10px;">Message</th>
                </tr>
              </thead>
              <tbody>
                ${this.progressLogs
                  .map(
                    (log) => `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 6px 10px; font-weight: 600; color: #0284c7;">
                      <span style="background: rgba(2, 132, 199, 0.1); padding: 2px 6px; border-radius: 4px;">${this.escapeHtml(log.event_type || 'LOG')}</span>
                    </td>
                    <td style="padding: 6px 10px;">
                      <span style="font-weight: 700; color: ${log.level === 'WARNING' ? '#f59e0b' : log.level === 'ERROR' ? '#ef4444' : '#10b981'};">${log.level}</span>
                    </td>
                    <td style="padding: 6px 10px; color: #64748b; white-space: nowrap;">
                      ${log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '-'}
                    </td>
                    <td style="padding: 6px 10px; color: #334155;">
                      ${this.escapeHtml(log.message || '')}
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          `
          }
        </div>
      `;
    }

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
            <span class="settings-label">Typewriter Speed</span>
            <span class="settings-sublabel">Stream velocity for assistant textual synthesis</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="range" class="settings-slider" id="setting-speed" min="5" max="40" value="${settings.typewriterSpeed || 14}" />
            <span style="font-weight: 600; font-size: 13px;" id="speed-val">${settings.typewriterSpeed || 14}ms</span>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'rag') {
      return `
        <div class="settings-group-title">RAG Retrieval Parameters</div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Top-K Multimodal Chunks</span>
            <span class="settings-sublabel">Number of visual/text chunks to retrieve for synthesis</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="range" class="settings-slider" id="setting-topk" min="1" max="10" value="${settings.topK || 4}" />
            <span style="font-weight: 600; font-size: 13px;" id="topk-val">${settings.topK || 4}</span>
          </div>
        </div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Similarity Threshold</span>
            <span class="settings-sublabel">Minimum cosine score required for grounding inclusion</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="range" class="settings-slider" id="setting-threshold" min="0.5" max="0.95" step="0.05" value="${settings.similarityThreshold || 0.7}" />
            <span style="font-weight: 600; font-size: 13px;" id="threshold-val">${settings.similarityThreshold || 0.7}</span>
          </div>
        </div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Neural Cross-Encoder Reranker</span>
            <span class="settings-sublabel">Enable two-stage retrieval with BGE reranking</span>
          </div>
          <input type="checkbox" id="setting-reranker" ${settings.rerankerEnabled ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--brand-green);" />
        </div>
      `;
    }

    if (this.activeTab === 'vision') {
      return `
        <div class="settings-group-title">Vision Models & Frame Extraction</div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Multimodal Vision Model</span>
            <span class="settings-sublabel">Model backbone for multi-vector visual representations</span>
          </div>
          <select class="settings-select" id="setting-vision-model">
            <option value="colpali-v1.2" ${settings.visionModel === 'colpali-v1.2' ? 'selected' : ''}>ColPali v1.2 (PaliGemma Multi-Vector)</option>
            <option value="clip-vit-l-14" ${settings.visionModel === 'clip-vit-l-14' ? 'selected' : ''}>CLIP ViT-L/14 (Dense Pooling)</option>
            <option value="siglip-so400m" ${settings.visionModel === 'siglip-so400m' ? 'selected' : ''}>SigLIP SO400M (High Precision)</option>
          </select>
        </div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">OCR Parsing Engine</span>
            <span class="settings-sublabel">Engine used for layout-aware document text extraction</span>
          </div>
          <select class="settings-select" id="setting-ocr">
            <option value="easyocr" ${settings.ocrEngine === 'easyocr' ? 'selected' : ''}>EasyOCR (PyTorch GPU)</option>
            <option value="tesseract" ${settings.ocrEngine === 'tesseract' ? 'selected' : ''}>Tesseract 5.3 (Fast Local)</option>
            <option value="paddleocr" ${settings.ocrEngine === 'paddleocr' ? 'selected' : ''}>PaddleOCR (Multilingual)</option>
          </select>
        </div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Video Frame Rate (FPS)</span>
            <span class="settings-sublabel">Sampling rate for temporal keyframe indexing</span>
          </div>
          <select class="settings-select" id="setting-fps">
            <option value="0.5" ${settings.fps === 0.5 ? 'selected' : ''}>0.5 FPS (1 frame every 2 sec)</option>
            <option value="1.0" ${settings.fps === 1.0 ? 'selected' : ''}>1.0 FPS (1 frame every sec)</option>
            <option value="2.0" ${settings.fps === 2.0 ? 'selected' : ''}>2.0 FPS (Dense keyframes)</option>
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
            <span class="settings-label" style="color: #ef4444;">Reset Local Storage</span>
            <span class="settings-sublabel">Clear all local workspace folders, chats, and preferences</span>
          </div>
          <button class="btn-new-chat" id="btn-reset-data" style="width: auto; padding: 7px 14px; background: #ef4444; color: #fff;">
            <span>Reset All</span>
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

    // Tab buttons
    this.container.querySelectorAll('.settings-tab-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        this.activeTab = btn.dataset.tab;
        this.render();
        if (this.activeTab === 'database') {
          await this.fetchDbAndLogs();
        }
      });
    });

    // Refresh logs button
    const refreshLogsBtn = this.container.querySelector('#btn-refresh-logs');
    if (refreshLogsBtn) {
      refreshLogsBtn.addEventListener('click', () => this.fetchDbAndLogs());
    }

    // General tab handlers
    const themeSelect = this.container.querySelector('#setting-theme');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        store.updateSettings({ theme: e.target.value });
      });
    }

    const replayBtn = this.container.querySelector('#btn-replay-splash');
    if (replayBtn && this.onReplayIntro) {
      replayBtn.addEventListener('click', () => {
        this.close();
        this.onReplayIntro();
      });
    }

    const speedInput = this.container.querySelector('#setting-speed');
    const speedVal = this.container.querySelector('#speed-val');
    if (speedInput && speedVal) {
      speedInput.addEventListener('input', (e) => {
        speedVal.innerText = e.target.value + 'ms';
        store.updateSettings({ typewriterSpeed: parseInt(e.target.value, 10) });
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

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
