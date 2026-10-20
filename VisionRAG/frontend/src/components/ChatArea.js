// ChatArea Component: Google-Like Divided View, Multimodal Plus Menu & Streaming

import { store } from '../store/state.js';
import { api } from '../services/api.js';
import { eyeTracker } from '../utils/eyeTracker.js';

export class ChatArea {
  constructor(containerEl, { onOpenVoice, onOpenVideo, onOpenSource, onOpenSettings, onOpenDbStorage }) {
    this.container = containerEl;
    this.onOpenVoice = onOpenVoice;
    this.onOpenVideo = onOpenVideo;
    this.onOpenSource = onOpenSource;
    this.onOpenSettings = onOpenSettings;
    this.onOpenDbStorage = onOpenDbStorage;

    this.abortController = null;
    this.showPlusMenu = false;
    this.activeTabs = {}; // Map of msgId -> activeTab ('all', 'images', 'videos', 'news', 'maps', 'papers')

    store.subscribe((state, event) => {
      if (event !== 'STREAMING_CHUNK') {
        this.render();
      }
    });
  }

  render() {
    const state = store.getState();
    const activeChat = store.getActiveChat();
    const hasMessages = activeChat && activeChat.messages.length > 0;
    const isStreaming = state.isStreaming;

    this.container.innerHTML = `
      <!-- Top App Header -->
      <header class="chat-header">
        <div class="header-left">
          <button class="action-icon-btn" id="btn-toggle-sidebar" title="Toggle sidebar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
          </button>
          
          <button class="model-pill-btn" id="btn-select-model" style="display: flex; align-items: center; gap: 6px; padding: 5px 12px; border: 1px solid var(--border-medium); border-radius: var(--radius-pill); font-size: 13px; font-weight: 500;">
            <span>VisionRAG v2.5</span>
            <span style="font-size: 10px; background: #e6f7f2; color: #10a37f; padding: 1px 5px; border-radius: 4px; font-weight: 600;">Omni</span>
          </button>

          <button class="model-pill-btn" id="btn-header-postgres" title="PostgreSQL Database & Stored Files" style="display: flex; align-items: center; gap: 6px; padding: 5px 12px; border: 1px solid rgba(16, 163, 127, 0.3); background: rgba(16, 163, 127, 0.08); border-radius: var(--radius-pill); font-size: 12.5px; font-weight: 500; color: #10a37f; cursor: pointer;">
            <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #10a37f;"></span>
            <span>PostgreSQL 16 DB</span>
          </button>
        </div>

        <div class="header-right">
          <button class="header-action-btn" id="btn-header-voice" title="Voice Mode" style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; border: 1px solid var(--border-medium); border-radius: var(--radius-pill); font-size: 12.5px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            </svg>
            <span>Voice</span>
          </button>

          <button class="header-action-btn" id="btn-header-video" title="Video Mode" style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; border: 1px solid var(--border-medium); border-radius: var(--radius-pill); font-size: 12.5px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
            <span>Video</span>
          </button>

          <button class="action-icon-btn" id="btn-new-chat-top" title="New Chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </header>

      <!-- Messages Scroll Area -->
      <div class="messages-container" id="messages-container">
        <div class="messages-inner" id="messages-inner">
          ${
            !hasMessages
              ? this.renderEmptyHero()
              : activeChat.messages.map((msg) => this.renderMessage(msg)).join('')
          }
        </div>
      </div>

      <!-- Bottom Chat Input Area -->
      <div class="chat-input-wrapper">
        <div class="chat-input-inner">
          <!-- Active Attachments Preview -->
          ${
            state.activeAttachments.length > 0
              ? `
            <div style="display: flex; flex-wrap: wrap; gap: 8px; padding: 6px 10px; background: #fff; border: 1px solid var(--border-medium); border-radius: var(--radius-md);">
              ${state.activeAttachments
                .map(
                  (att) => `
                <div style="display: flex; align-items: center; gap: 6px; background: var(--bg-secondary); padding: 4px 8px; border-radius: 6px; font-size: 12px; border: 1px solid var(--border-medium);">
                  <span>${this.escapeHtml(att.name)}</span>
                  <span style="font-size: 10px; color: var(--text-muted);">(${att.size})</span>
                  ${att.progress !== undefined && att.progress < 100
                    ? `<span style="font-size: 10px; color: #10a37f; font-weight:600;">${att.progress}%</span>`
                    : `<span style="font-size: 10px; color: #10a37f; font-weight:600;">✓ In PostgreSQL</span>`
                  }
                  <button class="btn-remove-attachment" data-att-id="${att.id}" style="color: var(--text-muted); cursor: pointer;">×</button>
                </div>
              `
                )
                .join('')}
            </div>
          `
              : ''
          }

          <!-- The "+" Menu Popover -->
          ${
            this.showPlusMenu
              ? `
            <div class="plus-actions-popover" id="plus-popover">
              <button class="plus-menu-item" id="plus-opt-doc">
                <div class="plus-item-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                </div>
                <span>Upload Document (PDF, TXT)</span>
              </button>

              <button class="plus-menu-item" id="plus-opt-image">
                <div class="plus-item-icon" style="color: var(--brand-green);">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </div>
                <span>Upload Image (PNG, JPG)</span>
              </button>

              <button class="plus-menu-item" id="plus-opt-video-file">
                <div class="plus-item-icon" style="color: #2563eb;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                </div>
                <span>Upload Video File (MP4)</span>
              </button>

              <button class="plus-menu-item" id="plus-opt-video-gen">
                <div class="plus-item-icon" style="color: #9333ea;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
                </div>
                <span>Video Generation & Camera</span>
              </button>

              <button class="plus-menu-item" id="plus-opt-voice">
                <div class="plus-item-icon" style="color: #ea580c;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line></svg>
                </div>
                <span>Voice Mode (Audio Conversation)</span>
              </button>
            </div>
          `
              : ''
          }

          <!-- Pill Input Container -->
          <div class="input-pill-container">
            <input type="file" id="file-upload-input" multiple style="display: none;" />
            
            <button class="action-icon-btn" id="btn-toggle-plus" title="Add files, video, or voice" style="width: 34px; height: 34px; border-radius: 50%; margin-right: 6px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>

            <textarea
              id="chat-textarea"
              class="chat-textarea"
              rows="1"
              placeholder="Ask anything across documents, images, video, and news..."
            ></textarea>

            <div style="display: flex; align-items: center; gap: 6px; margin-left: 6px;">
              <button class="action-icon-btn" id="btn-quick-voice" title="Voice Mode">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                </svg>
              </button>

              ${
                isStreaming
                  ? `
                <button class="btn-stop-generating" id="btn-stop-stream" title="Stop generating" style="width: 36px; height: 36px; border-radius: 50%; background: #0d0d0d; color: #fff;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="5" y="5" width="14" height="14" rx="2"></rect>
                  </svg>
                </button>
              `
                  : `
                <button class="btn-send-message" id="btn-send-message" title="Send message" disabled>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="12" y1="19" x2="12" y2="5"></line>
                    <polyline points="5 12 12 5 19 12"></polyline>
                  </svg>
                </button>
              `
              }
            </div>
          </div>

          <div style="text-align: center; font-size: 11px; color: var(--text-muted); margin-top: 2px;">
            VisionRAG Multimodal Intelligence • Clean divided views for AI Answer, Images, Videos, News, Maps & Papers
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.scrollToBottom();
    eyeTracker.scheduleUpdate();
  }

  renderEmptyHero() {
    return `
      <div style="margin: auto; max-width: 680px; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 60px 20px; gap: 20px;">
        <div class="minimal-circle-frame" style="width: 72px; height: 72px; border-width: 3.5px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
          <div class="two-eyes-wrap" style="gap: 9px;">
            <div class="eye-socket" style="width: 20px; height: 14px; border-width: 1.8px;">
              <div class="eyelid-lid eyelid-upper"></div>
              <div class="eye-dot-pupil" style="width: 5px; height: 5px;"></div>
              <div class="eyelid-lid eyelid-lower"></div>
            </div>
            <div class="eye-socket" style="width: 20px; height: 14px; border-width: 1.8px;">
              <div class="eyelid-lid eyelid-upper"></div>
              <div class="eye-dot-pupil" style="width: 5px; height: 5px;"></div>
              <div class="eyelid-lid eyelid-lower"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderMessage(msg) {
    const isUser = msg.sender === 'user';
    if (isUser) {
      return `
        <div class="message-row user">
          <div class="user-bubble">
            <div>${this.escapeHtml(msg.text)}</div>
            ${
              msg.attachments && msg.attachments.length > 0
                ? `
              <div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px;">
                ${msg.attachments
                  .map(
                    (a) => `
                  <span style="font-size: 11.5px; background: #fff; padding: 3px 8px; border-radius: 4px; border: 1px solid var(--border-medium);">
                    📎 ${this.escapeHtml(a.name)}
                  </span>
                `
                  )
                  .join('')}
              </div>
            `
                : ''
            }
          </div>
        </div>
      `;
    }

    // Assistant Message with Google Divided View
    const msgId = msg.id;
    const currentTab = this.activeTabs[msgId] || 'all';
    const mm = msg.multimodal || {};

    return `
      <div class="message-row assistant" data-msg-id="${msgId}">
        <div class="assistant-bubble">
          <!-- Google-Style Divided View Navigation Tabs -->
          <div class="google-tabs-bar" data-msg-id="${msgId}">
            <button class="google-tab-btn ${currentTab === 'all' ? 'active' : ''}" data-tab="all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="12 8 8 12 12 16 16 12 12 8"></polygon></svg>
              <span>All (AI Answer)</span>
            </button>

            <button class="google-tab-btn ${currentTab === 'images' ? 'active' : ''}" data-tab="images">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              <span>Images (${(mm.images && mm.images.length) || 0})</span>
            </button>

            <button class="google-tab-btn ${currentTab === 'videos' ? 'active' : ''}" data-tab="videos">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
              <span>Videos (${(mm.videos && mm.videos.length) || 0})</span>
            </button>

            <button class="google-tab-btn ${currentTab === 'news' ? 'active' : ''}" data-tab="news">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path></svg>
              <span>News (${(mm.news && mm.news.length) || 0})</span>
            </button>

            <button class="google-tab-btn ${currentTab === 'maps' ? 'active' : ''}" data-tab="maps">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon></svg>
              <span>Maps</span>
            </button>

            <button class="google-tab-btn ${currentTab === 'papers' ? 'active' : ''}" data-tab="papers">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              <span>Papers & Journals (${(mm.papers && mm.papers.length) || 0})</span>
            </button>
          </div>

          <!-- Tab Content Views -->
          <div class="tab-content-panel">
            ${this.renderActiveTabContent(currentTab, msg)}
          </div>
        </div>
      </div>
    `;
  }

  renderActiveTabContent(tab, msg) {
    const mm = msg.multimodal || {};

    // 1. ALL Tab (AI Answer + Multi-modal previews)
    if (tab === 'all') {
      if (msg.isThinking || (!msg.text && msg.isStreaming)) {
        return `
          <div class="thinking-reflective-box">
            <div class="reflective-light-beam"></div>
            <div class="thinking-header-row">
              <div class="thinking-pulse-sparkle"></div>
              <span>Searching multimodal knowledge & reasoning...</span>
            </div>
            <div class="thinking-skeleton-wrap">
              <div class="thinking-skeleton-line" style="width: 85%;"></div>
              <div class="thinking-skeleton-line" style="width: 95%;"></div>
              <div class="thinking-skeleton-line" style="width: 70%;"></div>
            </div>
          </div>
        `;
      }

      return `
        <div class="assistant-text">
          ${this.formatMarkdown(msg.text)}
          ${msg.isStreaming ? `<span style="display:inline-block; width:6px; height:15px; background:#0d0d0d; margin-left:3px; animation:micPulse 0.8s infinite;"></span>` : ''}
        </div>

        ${
          mm.images && mm.images.length > 0
            ? `
          <div style="margin-top: 14px;">
            <div style="font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px;">VISUAL RETRIEVAL PREVIEWS</div>
            <div class="google-images-grid">
              ${mm.images.slice(0, 3).map((img) => this.renderImageCard(img)).join('')}
            </div>
          </div>
        `
            : ''
        }
      `;
    }

    // 2. IMAGES Tab
    if (tab === 'images') {
      if (!mm.images || mm.images.length === 0) {
        return `<div style="font-size: 13px; color: var(--text-muted); padding: 12px;">No image assets associated with this query.</div>`;
      }
      return `
        <div class="google-images-grid">
          ${mm.images.map((img) => this.renderImageCard(img)).join('')}
        </div>
      `;
    }

    // 3. VIDEOS Tab
    if (tab === 'videos') {
      if (!mm.videos || mm.videos.length === 0) {
        return `<div style="font-size: 13px; color: var(--text-muted); padding: 12px;">No video clips indexed for this query.</div>`;
      }
      return `
        <div class="google-videos-grid">
          ${mm.videos
            .map(
              (vid) => `
            <div class="google-video-card">
              <div class="video-thumb-wrap">
                <img src="${vid.thumbnail}" class="video-thumb-img" alt="${this.escapeHtml(vid.title)}" />
                <span class="video-duration-badge">${vid.duration}</span>
                <span class="video-timestamp-badge">Keyframe ${vid.timestamp}</span>
              </div>
              <div class="video-card-info">
                <span class="video-card-title">${this.escapeHtml(vid.title)}</span>
                <span style="font-size: 11px; color: var(--brand-indigo);">${this.escapeHtml(vid.channel)}</span>
                <span class="video-keyframe-desc">${this.escapeHtml(vid.keyframeDesc)}</span>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      `;
    }

    // 4. NEWS Tab
    if (tab === 'news') {
      if (!mm.news || mm.news.length === 0) {
        return `<div style="font-size: 13px; color: var(--text-muted); padding: 12px;">No recent news articles found.</div>`;
      }
      return `
        <div class="google-news-list">
          ${mm.news
            .map(
              (item) => `
            <div class="google-news-card">
              <div class="news-card-publisher-row">
                <span style="font-weight: 600; color: var(--text-primary);">${this.escapeHtml(item.publisher)}</span>
                <span>•</span>
                <span>${item.time}</span>
              </div>
              <a href="#" class="news-card-title">${this.escapeHtml(item.title)}</a>
              <p class="news-card-snippet">${this.escapeHtml(item.snippet)}</p>
            </div>
          `
            )
            .join('')}
        </div>
      `;
    }

    // 5. MAPS Tab
    if (tab === 'maps') {
      const mapItem = (mm.maps && mm.maps[0]) || {
        locationName: 'Neural Research Center',
        coordinates: '37.7749° N, 122.4194° W',
        region: 'San Francisco Innovation Hub',
        type: 'Facility Blueprint'
      };
      return `
        <div class="google-map-card">
          <div class="map-visual-placeholder">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>Interactive Spatial Grounding: ${this.escapeHtml(mapItem.coordinates)}</span>
          </div>
          <div class="map-info-body">
            <span style="font-size: 15px; font-weight: 600; color: var(--text-primary);">${this.escapeHtml(mapItem.locationName)}</span>
            <span style="font-size: 13px; color: var(--text-secondary);">${this.escapeHtml(mapItem.region)}</span>
            <span style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Context: ${this.escapeHtml(mapItem.floorplan || mapItem.type)}</span>
          </div>
        </div>
      `;
    }

    // 6. PAPERS & JOURNALS Tab
    if (tab === 'papers') {
      if (!mm.papers || mm.papers.length === 0) {
        return `<div style="font-size: 13px; color: var(--text-muted); padding: 12px;">No research papers indexed for this query.</div>`;
      }
      return `
        <div class="google-papers-list">
          ${mm.papers
            .map(
              (p) => `
            <div class="paper-card">
              <span class="paper-journal-tag">${this.escapeHtml(p.journal)} (${p.year})</span>
              <a href="#" class="paper-title">${this.escapeHtml(p.title)}</a>
              <span class="paper-authors">${this.escapeHtml(p.authors)}</span>
              <p class="paper-abstract">${this.escapeHtml(p.abstract)}</p>
              <div style="font-size: 11.5px; color: var(--text-muted); display: flex; gap: 12px; margin-top: 4px;">
                <span>Citations: <strong>${p.citations}</strong></span>
                <span>DOI: <code style="font-size: 11px;">${p.doi}</code></span>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      `;
    }

    return '';
  }

  renderImageCard(img) {
    return `
      <div class="google-image-card">
        <img src="${img.url}" class="image-card-thumb" alt="${this.escapeHtml(img.title)}" />
        <div class="image-card-info">
          <span class="image-card-title">${this.escapeHtml(img.title)}</span>
          <span class="image-card-source">${this.escapeHtml(img.source)} • <strong style="color: var(--brand-green);">${img.tag}</strong></span>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Toggle Sidebar
    const toggleSidebarBtn = this.container.querySelector('#btn-toggle-sidebar');
    if (toggleSidebarBtn) {
      toggleSidebarBtn.addEventListener('click', () => store.toggleSidebar());
    }

    // Top Header Actions
    const topNewChatBtn = this.container.querySelector('#btn-new-chat-top');
    if (topNewChatBtn) topNewChatBtn.addEventListener('click', () => store.createChat());

    const headerVoiceBtn = this.container.querySelector('#btn-header-voice');
    if (headerVoiceBtn && this.onOpenVoice) headerVoiceBtn.addEventListener('click', () => this.onOpenVoice());

    const headerVideoBtn = this.container.querySelector('#btn-header-video');
    if (headerVideoBtn && this.onOpenVideo) headerVideoBtn.addEventListener('click', () => this.onOpenVideo());

    const quickVoiceBtn = this.container.querySelector('#btn-quick-voice');
    if (quickVoiceBtn && this.onOpenVoice) quickVoiceBtn.addEventListener('click', () => this.onOpenVoice());

    // Settings trigger
    const modelBtn = this.container.querySelector('#btn-select-model');
    if (modelBtn && this.onOpenSettings) modelBtn.addEventListener('click', () => this.onOpenSettings());

    const postgresBtn = this.container.querySelector('#btn-header-postgres');
    if (postgresBtn && this.onOpenDbStorage) postgresBtn.addEventListener('click', () => this.onOpenDbStorage());

    // Plus (+) Attachment Menu Toggle
    const togglePlusBtn = this.container.querySelector('#btn-toggle-plus');
    const fileInput = this.container.querySelector('#file-upload-input');
    if (togglePlusBtn) {
      togglePlusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showPlusMenu = !this.showPlusMenu;
        this.render();
      });
    }

    // Close Plus Menu on outside click
    document.addEventListener('click', (e) => {
      if (this.showPlusMenu && !e.target.closest('#plus-popover') && !e.target.closest('#btn-toggle-plus')) {
        this.showPlusMenu = false;
        this.render();
      }
    });

    // Plus Popover Options
    const optDoc = this.container.querySelector('#plus-opt-doc');
    if (optDoc && fileInput) {
      optDoc.addEventListener('click', () => {
        fileInput.accept = '.pdf,.txt,.docx,.csv';
        fileInput.click();
        this.showPlusMenu = false;
      });
    }

    const optImg = this.container.querySelector('#plus-opt-image');
    if (optImg && fileInput) {
      optImg.addEventListener('click', () => {
        fileInput.accept = '.png,.jpg,.jpeg,.tiff';
        fileInput.click();
        this.showPlusMenu = false;
      });
    }

    const optVid = this.container.querySelector('#plus-opt-video-file');
    if (optVid && fileInput) {
      optVid.addEventListener('click', () => {
        fileInput.accept = '.mp4,.webm,.mkv';
        fileInput.click();
        this.showPlusMenu = false;
      });
    }

    const optVidGen = this.container.querySelector('#plus-opt-video-gen');
    if (optVidGen && this.onOpenVideo) {
      optVidGen.addEventListener('click', () => {
        this.showPlusMenu = false;
        this.onOpenVideo();
      });
    }

    const optVoice = this.container.querySelector('#plus-opt-voice');
    if (optVoice && this.onOpenVoice) {
      optVoice.addEventListener('click', () => {
        this.showPlusMenu = false;
        this.onOpenVoice();
      });
    }

    // File Input Change
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleFileUpload(e.target.files));
    }

    // Remove Attachment Chip
    this.container.querySelectorAll('.btn-remove-attachment').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        store.removeAttachment(btn.dataset.attId);
      });
    });

    // Google Divided View Tab Buttons
    this.container.querySelectorAll('.google-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const bar = btn.closest('.google-tabs-bar');
        const msgId = bar.dataset.msgId;
        const tab = btn.dataset.tab;
        this.activeTabs[msgId] = tab;
        this.render();
      });
    });

    // Textarea & Send Button
    const textarea = this.container.querySelector('#chat-textarea');
    if (textarea) {
      textarea.addEventListener('input', () => {
        this.updateTextareaHeight(textarea);
        this.updateSendButtonState();
      });
      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage();
        }
      });
    }

    const sendBtn = this.container.querySelector('#btn-send-message');
    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.handleSendMessage());
    }

    // Stop Stream
    const stopBtn = this.container.querySelector('#btn-stop-stream');
    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        if (this.abortController) {
          this.abortController.abort();
          this.abortController = null;
        }
        store.setStreaming(false);
      });
    }
  }

  updateTextareaHeight(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }

  updateSendButtonState() {
    const textarea = this.container.querySelector('#chat-textarea');
    const sendBtn = this.container.querySelector('#btn-send-message');
    if (!textarea || !sendBtn) return;

    const hasText = textarea.value.trim().length > 0;
    const hasAttachments = store.getState().activeAttachments.length > 0;

    if (hasText || hasAttachments) {
      sendBtn.classList.add('active');
      sendBtn.removeAttribute('disabled');
    } else {
      sendBtn.classList.remove('active');
      sendBtn.setAttribute('disabled', 'true');
    }
  }

  async handleFileUpload(fileList) {
    if (!fileList || fileList.length === 0) return;
    const currentUser = store.getState().user;
    const userId = currentUser && currentUser.loggedIn ? currentUser.id : null;
    for (const file of Array.from(fileList)) {
      const attId = 'att-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
      store.addAttachment({
        id: attId,
        name: file.name,
        type: file.type,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        progress: 10
      });
      const res = await api.uploadFile(
        file,
        (progress) => store.updateAttachmentProgress(attId, progress),
        userId,
        true
      );
      if (res && res.fileId) {
        store.updateAttachmentProgress(attId, 100);
      }
    }
    this.updateSendButtonState();
  }

  async handleSendMessage() {
    const textarea = this.container.querySelector('#chat-textarea');
    if (!textarea) return;

    const text = textarea.value.trim();
    const attachments = [...store.getState().activeAttachments];
    if (!text && attachments.length === 0) return;

    let activeChat = store.getActiveChat();
    if (!activeChat) {
      activeChat = store.createChat();
    }

    // Add User Message
    store.addMessage(activeChat.id, {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: text,
      timestamp: Date.now(),
      attachments: attachments.map((a) => ({ name: a.name, type: a.type, size: a.size }))
    });

    textarea.value = '';
    textarea.style.height = 'auto';
    store.clearAttachments();
    this.updateSendButtonState();

    // Prepare Assistant Message Placeholder
    const assistantMsgId = 'msg-' + (Date.now() + 1);
    this.activeTabs[assistantMsgId] = 'all';

    store.addMessage(activeChat.id, {
      id: assistantMsgId,
      sender: 'assistant',
      text: '',
      timestamp: Date.now(),
      isStreaming: true,
      isThinking: true,
      multimodal: {}
    });
    store.setStreaming(true);

    this.abortController = new AbortController();

    // Show transparent reflective light animation for ~500ms before chunk streaming starts
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const result = await api.queryVisionRAG({
        prompt: text || 'Analyze uploaded visual assets.',
        chatId: activeChat.id,
        attachments: attachments,
        settings: store.getState().settings,
        abortSignal: this.abortController.signal,
        onChunk: (accumulatedText, isDone) => {
          const currentChat = store.getActiveChat();
          if (currentChat) {
            const currentMsg = currentChat.messages.find((m) => m.id === assistantMsgId);
            if (currentMsg) {
              currentMsg.isThinking = false;
              currentMsg.text = accumulatedText;
              currentMsg.isStreaming = !isDone;
              this.updateStreamingDOM(assistantMsgId, accumulatedText, !isDone);
            }
          }
        }
      });

      const finalizedChat = store.getActiveChat();
      if (finalizedChat) {
        const currentMsg = finalizedChat.messages.find((m) => m.id === assistantMsgId);
        if (currentMsg) {
          currentMsg.isThinking = false;
          currentMsg.text = result.text;
          currentMsg.multimodal = result.multimodal;
          currentMsg.isStreaming = false;
        }
      }
    } catch (err) {
      console.error('Generation error:', err);
    } finally {
      store.setStreaming(false);
      this.abortController = null;
      store.notify('STREAMING_DONE');
    }
  }

  updateStreamingDOM(msgId, text, isStreaming) {
    const row = this.container.querySelector(`[data-msg-id="${msgId}"]`);
    if (row) {
      const panel = row.querySelector('.tab-content-panel');
      if (panel) {
        let textEl = panel.querySelector('.assistant-text');
        if (!textEl) {
          panel.innerHTML = `
            <div class="assistant-text"></div>
          `;
          textEl = panel.querySelector('.assistant-text');
        }
        textEl.innerHTML = `${this.formatMarkdown(text)}${isStreaming ? `<span style="display:inline-block; width:6px; height:15px; background:#0d0d0d; margin-left:3px; animation:micPulse 0.8s infinite;"></span>` : ''}`;
      }
    }
    this.scrollToBottom();
  }

  scrollToBottom() {
    const container = this.container.querySelector('#messages-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  formatMarkdown(text) {
    if (!text) return '';
    text = text.replace(/^### (.*$)/gim, '<h3 style="font-size:16px; font-weight:600; margin:10px 0 6px 0;">$1</h3>');
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/^\s*-\s+(.*$)/gim, '<li style="margin-bottom:4px;">$1</li>');
    text = text.replace(/(<li.*<\/li>)/gms, '<ul style="padding-left:18px; margin-bottom:10px;">$1</ul>');
    const paras = text.split(/\n\n+/);
    return paras.map((p) => (p.startsWith('<h') || p.startsWith('<ul') ? p : `<p style="margin-bottom:10px;">${p.replace(/\n/g, '<br/>')}</p>`)).join('');
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
