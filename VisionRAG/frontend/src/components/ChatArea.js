// ChatArea Component: Google/Perplexity-Style Divided View, Autonomous Multi-Agent Orchestration & Online Reader

import { store } from '../store/state.js';
import { api } from '../services/api.js';
import { eyeTracker } from '../utils/eyeTracker.js';

export class ChatArea {
  constructor(containerEl, { onOpenVoice, onOpenVideo, onOpenSource, onOpenSettings, onOpenStudentPortal }) {
    this.container = containerEl;
    this.onOpenVoice = onOpenVoice;
    this.onOpenVideo = onOpenVideo;
    this.onOpenSource = onOpenSource;
    this.onOpenSettings = onOpenSettings;
    this.onOpenStudentPortal = onOpenStudentPortal;

    this.abortController = null;
    this.showPlusMenu = false;
    this.activeTabs = {}; // Map of msgId -> activeTab ('all', 'books', 'images', 'videos', 'maps', 'news', 'sources')
    this.activeReaderBook = null; // Currently open Gutenberg plain-text reading book
    this.activeImagePreview = null; // Currently previewed high-res image
    this.isRecordingAudio = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.recordingStartTime = 0;
    this.recordingTimerInterval = null;

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
      <!-- Top App Header: Clean, modern, uncluttered (no standalone db/agent icons) -->
      <header class="chat-header">
        <div class="header-left">
          <button class="action-icon-btn" id="btn-toggle-sidebar" title="Toggle sidebar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
          </button>
          
          <button class="model-pill-btn" id="btn-select-model" style="display: flex; align-items: center; gap: 7px; padding: 5px 12px; border: 1px solid var(--border-medium); border-radius: var(--radius-pill); font-size: 13px; font-weight: 600; background: var(--bg-primary);">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #2563eb; box-shadow: 0 0 6px rgba(37,99,235,0.4);"></span>
            <span style="font-weight: 700; color: #0f172a; letter-spacing: 0.4px;">VRAG</span>
            <span style="font-size: 10px; background: #eff6ff; color: #2563eb; padding: 1px 6px; border-radius: 4px; font-weight: 600; border: 1px solid #dbeafe;">Education RAG</span>
          </button>
        </div>

        <div class="header-right">
          <button class="header-action-btn" id="btn-header-student-portal" title="Open Student Records Portal (Passcode: 123456)" style="display: flex; align-items: center; gap: 6px; padding: 6px 14px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; border-radius: var(--radius-pill); font-size: 12.5px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
              <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
            </svg>
            <span>Student Portal</span>
            <span style="font-size: 10px; background: #dcfce7; padding: 1px 5px; border-radius: 4px; font-weight: 700;">Admin</span>
          </button>

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

      <!-- Bottom Chat Input Area: Clean & Intuitive like ChatGPT / Perplexity -->
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
                  ${
                    att.progress !== undefined && att.progress < 100
                      ? `<span style="font-size: 10px; color: #10a37f; font-weight:600;">${att.progress}%</span>`
                      : `<span style="font-size: 10px; color: #10a37f; font-weight:600;">✓ Ready</span>`
                  }
                  <button class="btn-remove-attachment" data-att-id="${att.id}" style="color: var(--text-muted); cursor: pointer; border: none; background: none;">×</button>
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
                <span>Upload Image for Vision & Search</span>
              </button>

              <button class="plus-menu-item" id="plus-opt-video-file">
                <div class="plus-item-icon" style="color: #2563eb;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                </div>
                <span>Transcribe Video or Add Link</span>
              </button>

              <button class="plus-menu-item" id="plus-opt-audio-file">
                <div class="plus-item-icon" style="color: #8b5cf6;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                </div>
                <span>Search by Audio File (.wav, .mp3, .m4a)</span>
              </button>

              <button class="plus-menu-item" id="plus-opt-voice">
                <div class="plus-item-icon" style="color: #ea580c;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path></svg>
                </div>
                <span>Voice Conversation Mode</span>
              </button>
            </div>
          `
              : ''
          }

          <!-- Pill Input Container -->
          <div class="input-pill-container">
            <input type="file" id="file-upload-input" multiple style="display: none;" />
            
            <button class="action-icon-btn" id="btn-toggle-plus" title="Add file, image, or link" style="width: 34px; height: 34px; border-radius: 50%; margin-right: 6px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>

            <textarea
              id="chat-textarea"
              class="chat-textarea"
              rows="1"
              placeholder="${this.isRecordingAudio ? '🎙️ Recording voice... Speak clearly (click red mic when done)' : 'Ask anything... VitionAI will search books, videos, images, maps & news'}"
            ></textarea>

            <div style="display: flex; align-items: center; gap: 6px; margin-left: 6px;">
              <button class="action-icon-btn ${this.isRecordingAudio ? 'btn-recording-pulse' : ''}" id="btn-quick-voice" title="${this.isRecordingAudio ? 'Click to finish audio search' : 'Search by Voice / Audio'}">
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

          <div style="text-align: center; font-size: 11px; color: var(--text-muted); margin-top: 4px;">
            VitionAI • Autonomous Multi-Agent Synthesis (Books, Videos, Maps, Images & Live Web)
          </div>
        </div>
      </div>

      <!-- Plain Text Reading Modal -->
      ${this.renderReadingModal()}

      <!-- High-Res Image Preview Modal -->
      ${this.renderImagePreviewModal()}
    `;

    this.bindEvents();
    eyeTracker.scheduleUpdate();
  }

  renderEmptyHero() {
    return `
      <div style="margin: auto; max-width: 680px; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 50px 20px 20px 20px; gap: 18px;">
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

        <h1 style="font-size: 26px; font-weight: 600; color: var(--text-primary); margin: 0; letter-spacing: -0.02em;">
          VRAG Educational Knowledge Engine
        </h1>
        <p style="font-size: 14px; color: var(--text-secondary); max-width: 540px; margin: 0; line-height: 1.5;">
          Grounded RAG assistant for students, educators, and researchers. Ask educational questions, review MOE curriculum standards, search digital textbooks, or access the Student Records Portal.
        </p>

        <!-- Suggested Inquiry Prompts -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; width: 100%; margin-top: 10px;">
          <button class="hero-prompt-chip" data-prompt="What are the official powers and educational frameworks of the Ministry of Education under General Education Proclamation No. 1368/2025?">
            <span style="font-size: 15px;">📜</span>
            <div style="text-align: left;">
              <div style="font-weight: 600; font-size: 12.5px; color: var(--text-primary);">MOE Proclamation 1368/2025</div>
              <div style="font-size: 11px; color: var(--text-muted);">In-force statutory framework & quality</div>
            </div>
          </button>

          <button class="hero-prompt-chip" data-prompt="Explain the Curriculum Framework for Ethiopian Education (KG–Grade 12) and STEAM Desks">
            <span style="font-size: 15px;">🏫</span>
            <div style="text-align: left;">
              <div style="font-weight: 600; font-size: 12.5px; color: var(--text-primary);">KG–12 Curriculum & STEAM</div>
              <div style="font-size: 11px; color: var(--text-muted);">Competency standards & digital education</div>
            </div>
          </button>

          <button class="hero-prompt-chip" data-prompt="What are the key historical milestones in Ethiopian modern education administration from 1908 to 2025?">
            <span style="font-size: 15px;">⏳</span>
            <div style="text-align: left;">
              <div style="font-weight: 600; font-size: 12.5px; color: var(--text-primary);">Education History Milestones</div>
              <div style="font-size: 11px; color: var(--text-muted);">1908 Menelik II School to modern ESDP</div>
            </div>
          </button>

          <button class="hero-prompt-chip" data-prompt="Give me step-by-step student learning guidance and exam preparation tips for science and mathematics">
            <span style="font-size: 15px;">💡</span>
            <div style="text-align: left;">
              <div style="font-weight: 600; font-size: 12.5px; color: var(--text-primary);">Student Study & Exam Guidance</div>
              <div style="font-size: 11px; color: var(--text-muted);">Pedagogical advice & concept mastery</div>
            </div>
          </button>
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
                    📎 ${this.escapeHtml(a.name || a)}
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

    // Assistant Message with Google/Perplexity-Style Divided View
    const msgId = msg.id;
    const currentTab = this.activeTabs[msgId] || 'all';
    const mm = msg.multimodal || {};

    const booksCount = (mm.books && mm.books.length) || 0;
    const imagesCount = (mm.images && mm.images.length) || 0;
    const videosCount = (mm.videos && mm.videos.length) || 0;
    const mapsCount = (mm.maps && mm.maps.length) || 0;
    const newsCount = (mm.news && mm.news.length) || 0;
    const sourcesCount = (mm.websites && mm.websites.length) || 0;

    return `
      <div class="message-row assistant" data-msg-id="${msgId}">
        <div class="assistant-bubble">
          <!-- Google-Style Divided View Navigation Tabs -->
          <div class="google-tabs-bar" data-msg-id="${msgId}">
            <button class="google-tab-btn ${currentTab === 'all' ? 'active' : ''}" data-tab="all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="12 8 8 12 12 16 16 12 12 8"></polygon></svg>
              <span>All (AI Answer)</span>
            </button>

            ${
              booksCount > 0
                ? `
              <button class="google-tab-btn ${currentTab === 'books' ? 'active' : ''}" data-tab="books">
                <span>📚</span>
                <span>Books (${booksCount})</span>
              </button>
            `
                : ''
            }

            ${
              imagesCount > 0
                ? `
              <button class="google-tab-btn ${currentTab === 'images' ? 'active' : ''}" data-tab="images">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                <span>Images (${imagesCount})</span>
              </button>
            `
                : ''
            }

            ${
              videosCount > 0
                ? `
              <button class="google-tab-btn ${currentTab === 'videos' ? 'active' : ''}" data-tab="videos">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                <span>Videos (${videosCount})</span>
              </button>
            `
                : ''
            }

            ${
              mapsCount > 0
                ? `
              <button class="google-tab-btn ${currentTab === 'maps' ? 'active' : ''}" data-tab="maps">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon></svg>
                <span>Maps (${mapsCount})</span>
              </button>
            `
                : ''
            }

            ${
              newsCount > 0
                ? `
              <button class="google-tab-btn ${currentTab === 'news' ? 'active' : ''}" data-tab="news">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path></svg>
                <span>News (${newsCount})</span>
              </button>
            `
                : ''
            }

            ${
              sourcesCount > 0
                ? `
              <button class="google-tab-btn ${currentTab === 'sources' ? 'active' : ''}" data-tab="sources">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                <span>Sources (${sourcesCount})</span>
              </button>
            `
                : ''
            }
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

    // 1. ALL TAB (AI Answer + Multi-Modal Carousels)
    if (tab === 'all') {
      if (msg.isThinking || (!msg.text && msg.isStreaming)) {
        return `
          <div class="thinking-reflective-box">
            <div class="reflective-light-beam"></div>
            <div class="thinking-header-row">
              <div class="thinking-pulse-sparkle"></div>
              <span>VitionAI is searching books, videos, images, maps & synthesizing answer...</span>
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
        <!-- Top Verified Web Sources & Citations Bar (Google/Perplexity-Style) -->
        ${
          mm.websites && mm.websites.length > 0
            ? `
          <div class="top-sources-bar">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                <span>Verified Sources & Web Links</span>
              </div>
              <button class="btn-jump-tab" data-target-tab="sources" style="font-size: 11px; color: #10a37f; font-weight: 600; background: none; border: none; cursor: pointer;">
                All Sources (${mm.websites.length}) →
              </button>
            </div>
            <div class="top-sources-pills">
              ${mm.websites.slice(0, 4).map((site, idx) => `
                <a href="${site.url}" target="_blank" rel="noopener noreferrer" class="top-source-chip" title="${this.escapeHtml(site.title)} (${this.escapeHtml(site.url)})">
                  <span style="font-size: 11px; color: #10a37f; font-weight: 700;">[${idx + 1}]</span>
                  <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.escapeHtml(site.title || site.source || 'Web Link')}</span>
                </a>
              `).join('')}
            </div>
          </div>
        `
            : ''
        }

        <div class="assistant-text">
          ${this.formatMarkdown(msg.text)}
          ${msg.isStreaming ? `<span style="display:inline-block; width:6px; height:15px; background:#0d0d0d; margin-left:3px; animation:micPulse 0.8s infinite;"></span>` : ''}
        </div>

        <!-- Inline Books Preview Bar -->
        ${
          mm.books && mm.books.length > 0
            ? `
          <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border-light);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em;">
                📚 Recommended Online Educational Books
              </span>
              <button class="btn-jump-tab" data-target-tab="books" style="font-size: 11.5px; color: #10a37f; font-weight: 600; background: none; border: none; cursor: pointer;">
                View All (${mm.books.length}) →
              </button>
            </div>
            <div class="google-books-grid">
              ${mm.books.slice(0, 3).map((book) => this.renderBookCard(book)).join('')}
            </div>
          </div>
        `
            : ''
        }

        <!-- Inline Images Preview Bar -->
        ${
          mm.images && mm.images.length > 0
            ? `
          <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border-light);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em;">
                🖼️ Verified Visual Gallery & Archives
              </span>
              <button class="btn-jump-tab" data-target-tab="images" style="font-size: 11.5px; color: #10a37f; font-weight: 600; background: none; border: none; cursor: pointer;">
                View Gallery (${mm.images.length}) →
              </button>
            </div>
            <div class="google-images-grid">
              ${mm.images.slice(0, 3).map((img) => this.renderImageCard(img)).join('')}
            </div>
          </div>
        `
            : ''
        }

        <!-- Inline Video Player Preview -->
        ${
          mm.videos && mm.videos.length > 0
            ? `
          <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border-light);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em;">
                🎥 Multimedia Lecture & Video Transcripts
              </span>
              <button class="btn-jump-tab" data-target-tab="videos" style="font-size: 11.5px; color: #10a37f; font-weight: 600; background: none; border: none; cursor: pointer;">
                All Videos (${mm.videos.length}) →
              </button>
            </div>
            ${this.renderVideoCard(mm.videos[0], mm.video_transcript)}
          </div>
        `
            : ''
        }

        <!-- Inline Map Preview -->
        <!-- Inline Map Preview -->
        ${
          mm.maps && mm.maps.length > 0
            ? `
          <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border-light);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em;">
                🗺️ Geospatial Coordinates & Landmark Mapping
              </span>
              <button class="btn-jump-tab" data-target-tab="maps" style="font-size: 11.5px; color: #10a37f; font-weight: 600; background: none; border: none; cursor: pointer;">
                All Maps (${mm.maps.length}) →
              </button>
            </div>
            ${this.renderMapCard(mm.maps[0])}
          </div>
        `
            : ''
        }

        <!-- Inline News Preview Bar -->
        ${
          mm.news && mm.news.length > 0
            ? `
          <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border-light);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em;">
                📰 Live Verified News Reports
              </span>
              <button class="btn-jump-tab" data-target-tab="news" style="font-size: 11.5px; color: #10a37f; font-weight: 600; background: none; border: none; cursor: pointer;">
                All News (${mm.news.length}) →
              </button>
            </div>
            <div class="google-news-list">
              ${mm.news.slice(0, 3).map((item) => `
                <div class="google-news-card">
                  <div class="news-card-publisher-row">
                    <span style="font-weight: 700; color: #10a37f;">${this.escapeHtml(item.source || item.publisher || 'Google News')}</span>
                    <span>•</span>
                    <span>${this.escapeHtml(item.publishedAt || item.time || 'Recent')}</span>
                  </div>
                  <a href="${item.url || '#'}" target="_blank" rel="noopener noreferrer" class="news-card-title">${this.escapeHtml(item.title)}</a>
                  <p class="news-card-snippet">${this.escapeHtml(item.snippet)}</p>
                </div>
              `).join('')}
            </div>
          </div>
        `
            : ''
        }

        <!-- Inline Web Citations Preview Bar -->
        ${
          mm.websites && mm.websites.length > 0
            ? `
          <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border-light);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em;">
                🌐 Authoritative Web Sources & Portals
              </span>
              <button class="btn-jump-tab" data-target-tab="sources" style="font-size: 11.5px; color: #10a37f; font-weight: 600; background: none; border: none; cursor: pointer;">
                All Sources (${mm.websites.length}) →
              </button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${mm.websites.slice(0, 3).map((site) => `
                <div style="padding: 10px 12px; border: 1px solid var(--border-medium); border-radius: var(--radius-md); background: #ffffff;">
                  <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 2px;">${this.escapeHtml(site.source || 'Web Resource')}</div>
                  <a href="${site.url}" target="_blank" rel="noopener noreferrer" style="font-size: 13.5px; font-weight: 600; color: #1a73e8; text-decoration: none;">
                    ${this.escapeHtml(site.title)}
                  </a>
                  <p style="font-size: 12px; color: var(--text-secondary); margin: 4px 0 0 0; line-height: 1.4;">
                    ${this.escapeHtml(site.snippet || site.extracted_text || '')}
                  </p>
                </div>
              `).join('')}
            </div>
          </div>
        `
            : ''
        }
      `;
    }

    // 2. BOOKS TAB
    if (tab === 'books') {
      if (!mm.books || mm.books.length === 0) {
        return `<div style="font-size: 13px; color: var(--text-muted); padding: 12px;">No books discovered for this query.</div>`;
      }
      return `
        <div style="margin-bottom: 10px; font-size: 12.5px; color: var(--text-secondary);">
          Educational literature discovered across <strong>Open Library</strong>, <strong>Google Books</strong>, and <strong>Project Gutenberg</strong>:
        </div>
        <div class="google-books-grid">
          ${mm.books.map((b) => this.renderBookCard(b)).join('')}
        </div>
      `;
    }

    // 3. IMAGES TAB
    if (tab === 'images') {
      if (!mm.images || mm.images.length === 0) {
        return `<div style="font-size: 13px; color: var(--text-muted); padding: 12px;">No image assets associated with this query.</div>`;
      }
      return `
        <div style="margin-bottom: 10px; font-size: 12.5px; color: var(--text-secondary);">
          High-resolution photographs from Wikimedia Commons and curated public domain repositories:
        </div>
        <div class="google-images-grid">
          ${mm.images.map((img) => this.renderImageCard(img)).join('')}
        </div>
      `;
    }

    // 4. VIDEOS TAB
    if (tab === 'videos') {
      if (!mm.videos || mm.videos.length === 0) {
        return `<div style="font-size: 13px; color: var(--text-muted); padding: 12px;">No video lectures indexed for this query.</div>`;
      }
      return `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${mm.videos.map((vid, idx) => this.renderVideoCard(vid, idx === 0 ? mm.video_transcript : null)).join('')}
        </div>
      `;
    }

    // 5. MAPS TAB
    if (tab === 'maps') {
      if (!mm.maps || mm.maps.length === 0) {
        return `<div style="font-size: 13px; color: var(--text-muted); padding: 12px;">No geospatial coordinates mapped for this query.</div>`;
      }
      return `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${mm.maps.map((m) => this.renderMapCard(m)).join('')}
        </div>
      `;
    }

    // 6. NEWS TAB
    if (tab === 'news') {
      if (!mm.news || mm.news.length === 0) {
        return `<div style="font-size: 13px; color: var(--text-muted); padding: 12px;">No live news reports found for this query.</div>`;
      }
      return `
        <div class="google-news-list">
          ${mm.news
            .map(
              (item) => `
            <div class="google-news-card">
              <div class="news-card-publisher-row">
                <span style="font-weight: 700; color: #10a37f;">${this.escapeHtml(item.source || item.publisher || 'Google News')}</span>
                <span>•</span>
                <span>${this.escapeHtml(item.publishedAt || item.time || 'Recent')}</span>
              </div>
              <a href="${item.url || '#'}" target="_blank" rel="noopener noreferrer" class="news-card-title">${this.escapeHtml(item.title)}</a>
              <p class="news-card-snippet">${this.escapeHtml(item.snippet)}</p>
            </div>
          `
            )
            .join('')}
        </div>
      `;
    }

    // 7. SOURCES & CITATIONS TAB
    if (tab === 'sources') {
      const sites = mm.websites || [];
      if (sites.length === 0) {
        return `<div style="font-size: 13px; color: var(--text-muted); padding: 12px;">No external web citations listed.</div>`;
      }
      return `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${sites
            .map(
              (site) => `
            <div style="padding: 12px 14px; border: 1px solid var(--border-medium); border-radius: var(--radius-md); background: #ffffff;">
              <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 2px;">${this.escapeHtml(site.source || 'Web Resource')}</div>
              <a href="${site.url}" target="_blank" rel="noopener noreferrer" style="font-size: 14px; font-weight: 600; color: #1a73e8; text-decoration: none;">
                ${this.escapeHtml(site.title)}
              </a>
              <p style="font-size: 12.5px; color: var(--text-secondary); margin: 6px 0 0 0; line-height: 1.45;">
                ${this.escapeHtml(site.snippet || site.extracted_text || '')}
              </p>
            </div>
          `
            )
            .join('')}
        </div>
      `;
    }

    return '';
  }

  // Book Card Renderer
  renderBookCard(book) {
    const authors = Array.isArray(book.authors) ? book.authors.join(', ') : (book.authors || 'Scholarly Author');
    const isGutenberg = book.source === 'Project Gutenberg' || (book.id && book.id.includes('gutenberg'));
    const bookId = book.gutenbergId || (book.id && book.id.split(':')[1]) || 1342;

    return `
      <div class="google-book-card">
        <div class="book-card-header">
          <div class="book-cover-wrap">
            <img src="${book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80'}" alt="${this.escapeHtml(book.title)}" loading="lazy" />
          </div>
          <div class="book-meta-top">
            <span class="book-source-badge">${this.escapeHtml(book.source || 'Open Library')}</span>
            <div class="book-title" title="${this.escapeHtml(book.title)}">${this.escapeHtml(book.title)}</div>
            <div class="book-authors" title="${this.escapeHtml(authors)}">${this.escapeHtml(authors)}</div>
            ${book.publishedYear ? `<div style="font-size: 11px; color: var(--text-muted);">${book.publishedYear}</div>` : ''}
          </div>
        </div>
        <div class="book-card-body">
          <div class="book-note">${this.escapeHtml(book.accessNote || 'Digital online catalog.')}</div>
          <div class="book-card-actions">
            <a href="${book.readUrl || book.sourceUrl || '#'}" target="_blank" rel="noopener noreferrer" class="btn-read-online">
              <span>Read Online</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
            ${
              isGutenberg || book.fullTextAvailable
                ? `
              <button class="btn-read-text" data-book-id="${bookId}" data-book-title="${this.escapeHtml(book.title)}" title="Read plain text in browser">
                <span>📖 Read Text</span>
              </button>
            `
                : ''
            }
          </div>
        </div>
      </div>
    `;
  }

  // Image Card Renderer
  renderImageCard(img) {
    return `
      <div class="google-image-card" data-img-url="${img.url}" data-img-title="${this.escapeHtml(img.title)}" style="cursor: pointer;">
        <img src="${img.thumbnail || img.url}" class="image-card-thumb" alt="${this.escapeHtml(img.title)}" loading="lazy" />
        <div class="image-card-info">
          <div class="image-card-title">${this.escapeHtml(img.title)}</div>
          <div class="image-card-source">${this.escapeHtml(img.sourceName || 'Visual Archive')}</div>
          ${img.license ? `<span style="font-size: 10px; color: #10a37f; font-weight:600;">${this.escapeHtml(img.license)}</span>` : ''}
        </div>
      </div>
    `;
  }

  // Video Card Renderer
  renderVideoCard(vid, transcriptData = null) {
    const embedUrl = vid.embedUrl || `https://www.youtube.com/embed/${vid.id}`;
    const segments = (transcriptData && transcriptData.segments) || [];

    return `
      <div class="google-video-card" style="border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border-medium); background: #ffffff;">
        <iframe
          class="video-player-frame"
          src="${embedUrl}"
          title="${this.escapeHtml(vid.title)}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
        <div style="padding: 14px 16px;">
          <div style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">
            ${this.escapeHtml(vid.title)}
          </div>
          <div style="font-size: 12px; color: #2563eb; font-weight: 600; margin-bottom: 8px;">
            ${this.escapeHtml(vid.channel || 'Educational Channel')}
          </div>
          <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.45; margin: 0 0 10px 0;">
            ${this.escapeHtml(vid.description || '')}
          </p>
        </div>

        <!-- Video Transcript & Chapters -->
        ${
          segments.length > 0
            ? `
          <div class="video-chapters-wrap">
            <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
              Timestamped Video Chapters
            </span>
            <div class="chapter-pills-row">
              ${segments
                .map(
                  (seg) => `
                <button class="chapter-pill" data-ts="${seg.timestamp}" data-text="${this.escapeHtml(seg.text)}">
                  <strong>${seg.timestamp}</strong> ${this.escapeHtml(seg.text.slice(0, 32))}...
                </button>
              `
                )
                .join('')}
            </div>
            <div class="active-chapter-preview" style="font-size: 12px; color: var(--text-primary); background: #ffffff; padding: 8px 10px; border-radius: 4px; border: 1px solid var(--border-light); margin-top: 4px;">
              💡 <em>Click any chapter above to inspect subtitle transcription.</em>
            </div>
          </div>
        `
            : ''
        }
      </div>
    `;
  }

  // Map Card Renderer
  renderMapCard(map) {
    const embedUrl = map.embedUrl || `https://www.openstreetmap.org/export/embed.html?bbox=38.68,8.96,38.80,9.08&layer=mapnik`;
    const osmUrl = map.osmUrl || `https://www.openstreetmap.org/`;

    return `
      <div class="google-map-card">
        <iframe
          class="map-frame-box"
          src="${embedUrl}"
          title="${this.escapeHtml(map.locationName || 'Geospatial Map')}"
          loading="lazy"
        ></iframe>
        <div class="map-info-body">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="font-size: 16px; font-weight: 700; color: var(--text-primary);">
              ${this.escapeHtml(map.locationName || 'Geographic Entity')}
            </div>
            <a href="${osmUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 11.5px; color: #1a73e8; font-weight: 600; text-decoration: none;">
              OpenStreetMap ↗
            </a>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
            <span>📍 <strong>${this.escapeHtml(map.coordinates || '')}</strong></span>
            ${map.elevation ? `<span>• ⛰️ ${this.escapeHtml(map.elevation)}</span>` : ''}
            ${map.region ? `<span>• 🗺️ ${this.escapeHtml(map.region)}</span>` : ''}
          </div>
          ${
            map.historicalSignificance
              ? `
            <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5; margin: 8px 0 0 0;">
              ${this.escapeHtml(map.historicalSignificance)}
            </p>
          `
              : ''
          }
        </div>
      </div>
    `;
  }

  // Plain Text Reading Modal (Inline Project Gutenberg & URL Reader)
  renderReadingModal() {
    if (!this.activeReaderBook) return '';
    return `
      <div class="reader-modal-overlay" id="reader-modal-overlay">
        <div class="reader-modal-card">
          <div class="reader-modal-header">
            <div>
              <div style="font-size: 11px; font-weight: 700; color: #10a37f; text-transform: uppercase;">Project Gutenberg Digital Reader</div>
              <div style="font-size: 15px; font-weight: 700; color: var(--text-primary);">${this.escapeHtml(this.activeReaderBook.title)}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 11px; background: #e8f0fe; color: #1a73e8; padding: 3px 8px; border-radius: 10px; font-weight: 600;">
                ${this.activeReaderBook.characters ? `${Math.round(this.activeReaderBook.characters / 1000)}k chars` : 'Full Text'}
              </span>
              <button class="action-icon-btn" id="btn-close-reader" style="font-size: 18px; width: 32px; height: 32px;">×</button>
            </div>
          </div>
          <div class="reader-modal-body" id="reader-modal-body">
            ${this.activeReaderBook.isLoading ? '<em>Loading plain-text book content from Project Gutenberg archive...</em>' : this.escapeHtml(this.activeReaderBook.text)}
          </div>
        </div>
      </div>
    `;
  }

  // Image Preview Zoom Modal
  renderImagePreviewModal() {
    if (!this.activeImagePreview) return '';
    return `
      <div class="reader-modal-overlay" id="image-preview-overlay" style="background: rgba(0,0,0,0.85);">
        <div style="max-width: 90vw; max-height: 90vh; display: flex; flex-direction: column; align-items: center; gap: 12px;">
          <img src="${this.activeImagePreview.url}" style="max-width: 100%; max-height: 80vh; object-fit: contain; border-radius: 8px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);" />
          <div style="color: #ffffff; font-size: 14px; font-weight: 600; text-align: center;">
            ${this.escapeHtml(this.activeImagePreview.title)}
          </div>
          <button class="btn-read-online" id="btn-close-image-preview" style="background: rgba(255,255,255,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.4);">
            Close Preview
          </button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Sidebar Toggle
    const sidebarToggleBtn = this.container.querySelector('#btn-toggle-sidebar');
    if (sidebarToggleBtn) {
      sidebarToggleBtn.addEventListener('click', () => store.toggleSidebar());
    }

    // Student Portal Navigation Button
    const studentPortalBtn = this.container.querySelector('#btn-header-student-portal');
    if (studentPortalBtn && this.onOpenStudentPortal) {
      studentPortalBtn.addEventListener('click', () => this.onOpenStudentPortal());
    }

    // Voice & Video Mode Top Buttons
    const voiceBtn = this.container.querySelector('#btn-header-voice');
    if (voiceBtn && this.onOpenVoice) voiceBtn.addEventListener('click', () => this.onOpenVoice());

    const quickVoiceBtn = this.container.querySelector('#btn-quick-voice');
    if (quickVoiceBtn) {
      quickVoiceBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.isRecordingAudio) {
          this.stopAudioRecording();
        } else {
          this.startAudioRecording();
        }
      });
    }

    const videoBtn = this.container.querySelector('#btn-header-video');
    if (videoBtn && this.onOpenVideo) videoBtn.addEventListener('click', () => this.onOpenVideo());

    const newChatBtn = this.container.querySelector('#btn-new-chat-top');
    if (newChatBtn) newChatBtn.addEventListener('click', () => store.createChat());

    // Suggested Prompts
    this.container.querySelectorAll('.hero-prompt-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const p = chip.dataset.prompt;
        const textarea = this.container.querySelector('#chat-textarea');
        if (textarea && p) {
          textarea.value = p;
          this.updateTextareaHeight(textarea);
          this.updateSendButtonState();
          this.handleSendMessage();
        }
      });
    });

    // Jump to Tab Buttons inside 'All' View
    this.container.querySelectorAll('.btn-jump-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.targetTab;
        const msgRow = btn.closest('.message-row');
        if (msgRow && targetTab) {
          const msgId = msgRow.dataset.msgId;
          this.activeTabs[msgId] = targetTab;
          this.render();
        }
      });
    });

    // Plus Menu Popover Toggle
    const plusBtn = this.container.querySelector('#btn-toggle-plus');
    if (plusBtn) {
      plusBtn.addEventListener('click', (e) => {
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

    // File Upload Options in Plus Menu
    const fileInput = this.container.querySelector('#file-upload-input');
    const optDoc = this.container.querySelector('#plus-opt-doc');
    const optImg = this.container.querySelector('#plus-opt-image');
    const optVid = this.container.querySelector('#plus-opt-video-file');
    const optAudio = this.container.querySelector('#plus-opt-audio-file');
    const optVoice = this.container.querySelector('#plus-opt-voice');

    if (optDoc && fileInput) {
      optDoc.addEventListener('click', () => {
        this.showPlusMenu = false;
        fileInput.accept = '.pdf,.txt,.md,.json,.csv';
        fileInput.click();
      });
    }

    if (optImg && fileInput) {
      optImg.addEventListener('click', () => {
        this.showPlusMenu = false;
        fileInput.accept = 'image/*';
        fileInput.click();
      });
    }

    if (optVid && fileInput) {
      optVid.addEventListener('click', () => {
        this.showPlusMenu = false;
        fileInput.accept = 'video/*,.mp4,.webm';
        fileInput.click();
      });
    }

    if (optAudio && fileInput) {
      optAudio.addEventListener('click', () => {
        this.showPlusMenu = false;
        fileInput.accept = 'audio/*,.mp3,.wav,.ogg,.m4a,.webm';
        fileInput.click();
      });
    }

    if (optVoice && this.onOpenVoice) {
      optVoice.addEventListener('click', () => {
        this.showPlusMenu = false;
        this.onOpenVoice();
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 1) {
          const file = files[0];
          const isAudio = file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|ogg|m4a|webm)$/i);
          if (isAudio) {
            this.handleAudioSearch(file);
            fileInput.value = '';
            return;
          }
        }
        this.handleFileUpload(e.target.files);
        fileInput.value = '';
      });
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

    // Chapter Pill Transcript Click
    this.container.querySelectorAll('.chapter-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        const wrap = pill.closest('.video-chapters-wrap');
        const preview = wrap.querySelector('.active-chapter-preview');
        const ts = pill.dataset.ts;
        const txt = pill.dataset.text;
        if (preview) {
          preview.innerHTML = `<strong>[${ts}]</strong> ${this.escapeHtml(txt)}`;
        }
      });
    });

    // Read Plain Text Gutenberg Book Button
    this.container.querySelectorAll('.btn-read-text').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const bookId = btn.dataset.bookId || 1342;
        const bookTitle = btn.dataset.bookTitle || `Book #${bookId}`;

        this.activeReaderBook = {
          title: bookTitle,
          isLoading: true,
          text: ''
        };
        this.render();

        try {
          const res = await api.readGutenbergBook(bookId);
          this.activeReaderBook = {
            title: bookTitle,
            isLoading: false,
            text: res.text || 'Text content could not be retrieved.',
            characters: res.characters_returned
          };
          this.render();
        } catch (e) {
          this.activeReaderBook = {
            title: bookTitle,
            isLoading: false,
            text: `Error loading text: ${e.message}. You can still read this title directly on Project Gutenberg website.`
          };
          this.render();
        }
      });
    });

    // Close Reader Modal
    const closeReaderBtn = this.container.querySelector('#btn-close-reader');
    if (closeReaderBtn) {
      closeReaderBtn.addEventListener('click', () => {
        this.activeReaderBook = null;
        this.render();
      });
    }

    // Image Zoom Preview
    this.container.querySelectorAll('.google-image-card').forEach((card) => {
      card.addEventListener('click', () => {
        this.activeImagePreview = {
          url: card.dataset.imgUrl,
          title: card.dataset.imgTitle
        };
        this.render();
      });
    });

    const closeImgBtn = this.container.querySelector('#btn-close-image-preview');
    if (closeImgBtn) {
      closeImgBtn.addEventListener('click', () => {
        this.activeImagePreview = null;
        this.render();
      });
    }

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

    // Smoothly scroll the container so the assistant message starts at the top
    setTimeout(() => {
      this.scrollToMessageTop(assistantMsgId);
    }, 40);

    // Subtle reflective light animation for ~400ms before chunk streaming starts
    await new Promise((resolve) => setTimeout(resolve, 400));

    try {
      const result = await api.queryVisionRAG({
        prompt: text || 'Analyze attached visual asset.',
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
          currentMsg.multimodal = result.multimodal || {};
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
          panel.innerHTML = `<div class="assistant-text"></div>`;
          textEl = panel.querySelector('.assistant-text');
        }
        textEl.innerHTML = `${this.formatMarkdown(text)}${isStreaming ? `<span style="display:inline-block; width:6px; height:15px; background:#0d0d0d; margin-left:3px; animation:micPulse 0.8s infinite;"></span>` : ''}`;
      }
    }
    // We intentionally DO NOT call scrollToBottom() so the reading view starts naturally from the top!
  }

  scrollToMessageTop(msgId) {
    const row = this.container.querySelector(`[data-msg-id="${msgId}"]`);
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollToBottom() {
    const container = this.container.querySelector('#messages-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  // Autonomous Audio Search & LLM Pipeline
  async handleAudioSearch(audioBlob) {
    let activeChat = store.getActiveChat();
    if (!activeChat) {
      activeChat = store.createChat();
    }

    const userMsgId = 'msg-' + Date.now();
    store.addMessage(activeChat.id, {
      id: userMsgId,
      sender: 'user',
      text: '🎙️ [Transcribing spoken audio query with Gemini/Whisper...]',
      timestamp: Date.now()
    });

    const assistantMsgId = 'msg-' + (Date.now() + 1);
    this.activeTabs[assistantMsgId] = 'all';

    store.addMessage(activeChat.id, {
      id: assistantMsgId,
      sender: 'assistant',
      text: '',
      timestamp: Date.now(),
      isStreaming: false,
      isThinking: true,
      multimodal: {}
    });

    this.render();
    setTimeout(() => {
      this.scrollToMessageTop(assistantMsgId);
    }, 40);

    try {
      const settings = store.getState().settings;
      const resp = await api.searchByAudio(audioBlob, settings.geminiApiKey);

      const currentChat = store.getActiveChat();
      if (currentChat) {
        const uMsg = currentChat.messages.find((m) => m.id === userMsgId);
        if (uMsg) {
          const qText = resp.transcribed_text || resp.query || (resp.transcription && resp.transcription.text) || 'Audio query';
          uMsg.text = `🎙️ "${qText}"`;
        }
        const aMsg = currentChat.messages.find((m) => m.id === assistantMsgId);
        if (aMsg) {
          aMsg.isThinking = false;
          aMsg.text = resp.result ? resp.result.text : (resp.text || 'Answer generated.');
          aMsg.multimodal = (resp.result && resp.result.multimodal) || resp.multimodal || {};
          aMsg.sources = (resp.result && resp.result.sources) || resp.sources || [];
        }
      }
    } catch (err) {
      console.error('Audio search error:', err);
      const currentChat = store.getActiveChat();
      if (currentChat) {
        const aMsg = currentChat.messages.find((m) => m.id === assistantMsgId);
        if (aMsg) {
          aMsg.isThinking = false;
          aMsg.text = `Audio transcription/synthesis error: ${err.message}. Please verify audio device or Gemini API key in Settings.`;
        }
      }
    } finally {
      this.render();
      setTimeout(() => {
        this.scrollToMessageTop(assistantMsgId);
      }, 50);
    }
  }

  async startAudioRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      this.mediaRecorder = new MediaRecorder(stream, { mimeType });

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(this.audioChunks, { type: mimeType });
        this.isRecordingAudio = false;
        clearInterval(this.recordingTimerInterval);
        this.renderRecordingUI(false);
        if (blob.size > 500) {
          await this.handleAudioSearch(blob);
        }
      };

      this.mediaRecorder.start();
      this.isRecordingAudio = true;
      this.recordingStartTime = Date.now();
      this.renderRecordingUI(true);

      this.recordingTimerInterval = setInterval(() => {
        this.updateRecordingTimer();
      }, 500);
    } catch (err) {
      console.warn('Microphone access fallback:', err);
      if (this.onOpenVoice) {
        this.onOpenVoice();
      } else {
        alert('Could not access microphone: ' + err.message);
      }
    }
  }

  stopAudioRecording() {
    if (this.mediaRecorder && this.isRecordingAudio) {
      this.mediaRecorder.stop();
    }
  }

  renderRecordingUI(isRecording) {
    const micBtn = this.container.querySelector('#btn-quick-voice');
    const textarea = this.container.querySelector('#chat-textarea');
    if (!micBtn) return;

    if (isRecording) {
      micBtn.classList.add('btn-recording-pulse');
      micBtn.title = 'Recording audio... Click to finish and search';
      if (textarea) {
        textarea.placeholder = '🎙️ Recording voice... Speak clearly (click red mic when done)';
      }
    } else {
      micBtn.classList.remove('btn-recording-pulse');
      micBtn.title = 'Search by Voice / Audio';
      if (textarea) {
        textarea.placeholder = 'Ask anything... VitionAI will search books, videos, images, maps & news';
      }
    }
  }

  updateRecordingTimer() {
    if (!this.isRecordingAudio) return;
    const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1000);
    const textarea = this.container.querySelector('#chat-textarea');
    if (textarea) {
      textarea.placeholder = `🎙️ Listening (${elapsed}s)... Click red mic to transcribe & search`;
    }
  }

  formatMarkdown(text) {
    if (!text) return '';
    let html = text;
    html = html.replace(/^#### (.*$)/gim, '<h4 style="font-size:14px; font-weight:700; margin:10px 0 4px 0; color:var(--text-primary);">$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3 style="font-size:16px; font-weight:700; margin:12px 0 6px 0; color:var(--text-primary);">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 style="font-size:18px; font-weight:700; margin:14px 0 8px 0; color:var(--text-primary);">$1</h2>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/`([^`]+)`/g, '<code style="background:#f3f4f6; padding:2px 5px; border-radius:4px; font-size:12.5px; font-family:monospace;">$1</code>');
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li style="margin-bottom:4px;">$1</li>');
    html = html.replace(/(<li.*<\/li>)/gms, '<ul style="padding-left:20px; margin:8px 0 12px 0;">$1</ul>');
    const paras = html.split(/\n\n+/);
    return paras.map((p) => (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<pre') ? p : `<p style="margin-bottom:12px; line-height:1.6;">${p.replace(/\n/g, '<br/>')}</p>`)).join('');
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
