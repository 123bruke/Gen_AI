// ChatArea Component: Clean White ChatGPT Aesthetic, Multimodal Uploads & Typewriter Streaming

import { store } from '../store/state.js';
import { api } from '../services/api.js';

export class ChatArea {
  constructor(containerEl, { onOpenVoice, onOpenVideo, onOpenSource, onOpenSettings }) {
    this.container = containerEl;
    this.onOpenVoice = onOpenVoice;
    this.onOpenVideo = onOpenVideo;
    this.onOpenSource = onOpenSource;
    this.onOpenSettings = onOpenSettings;

    this.abortController = null;
    this.speechRecognition = null;
    this.isRecordingVoice = false;

    this.initSpeechRecognition();
    store.subscribe((state, event) => {
      // Avoid full re-render on active streaming chunks to maintain smooth DOM performance
      if (event !== 'STREAMING_CHUNK') {
        this.render();
      }
    });
  }

  initSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      this.speechRecognition = new SpeechRec();
      this.speechRecognition.continuous = false;
      this.speechRecognition.interimResults = true;
      this.speechRecognition.lang = 'en-US';

      this.speechRecognition.onresult = (e) => {
        const transcript = Array.from(e.results)
          .map((r) => r[0].transcript)
          .join('');
        const textarea = this.container.querySelector('#chat-textarea');
        if (textarea) {
          textarea.value = transcript;
          this.updateTextareaHeight(textarea);
          this.updateSendButtonState();
        }
      };

      this.speechRecognition.onend = () => {
        this.isRecordingVoice = false;
        const micBtn = this.container.querySelector('#btn-mic-input');
        if (micBtn) micBtn.classList.remove('recording');
      };

      this.speechRecognition.onerror = (e) => {
        console.warn('Speech recognition notice:', e.error);
        this.isRecordingVoice = false;
        const micBtn = this.container.querySelector('#btn-mic-input');
        if (micBtn) micBtn.classList.remove('recording');
      };
    }
  }

  toggleSpeechInput() {
    if (!this.speechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    const micBtn = this.container.querySelector('#btn-mic-input');
    if (this.isRecordingVoice) {
      this.speechRecognition.stop();
      this.isRecordingVoice = false;
      if (micBtn) micBtn.classList.remove('recording');
    } else {
      try {
        this.speechRecognition.start();
        this.isRecordingVoice = true;
        if (micBtn) micBtn.classList.add('recording');
      } catch (err) {
        console.error('Error starting mic:', err);
      }
    }
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
          <button class="header-sidebar-trigger" id="btn-toggle-sidebar" title="Toggle sidebar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
          </button>
          
          <div class="model-selector-wrap">
            <button class="model-pill-btn" id="btn-select-model">
              <span>VisionRAG Omni v2.5</span>
              <span class="model-badge">Vision Pro</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
        </div>

        <div class="header-right">
          <button class="header-action-btn" id="btn-open-camera" title="Live Camera & Visual Stream">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
            <span>Live Camera</span>
          </button>

          <button class="header-action-btn" id="btn-open-voice-mode" title="Hands-free Voice Mode">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
            <span>Voice Mode</span>
          </button>

          <button class="header-action-btn" id="btn-new-chat-top" title="New Chat">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
          <!-- Upload Preview Tray -->
          ${
            state.activeAttachments.length > 0
              ? `
            <div class="attachments-preview-tray">
              ${state.activeAttachments
                .map(
                  (att) => `
                <div class="upload-card-chip">
                  <div class="upload-file-icon">
                    ${this.getFileIconSvg(att.type)}
                  </div>
                  <div class="upload-file-meta">
                    <span class="upload-file-name" title="${this.escapeHtml(att.name)}">${this.escapeHtml(att.name)}</span>
                    <span class="upload-file-size">${att.size}</span>
                  </div>
                  <button class="btn-remove-attachment" data-att-id="${att.id}" title="Remove file">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                  <div class="upload-progress-line" style="width: ${att.progress || 100}%;"></div>
                </div>
              `
                )
                .join('')}
            </div>
          `
              : ''
          }

          <!-- Pill Input Container -->
          <div class="input-pill-container">
            <div class="input-actions-left">
              <input type="file" id="file-upload-input" multiple style="display: none;" accept=".pdf,.png,.jpg,.jpeg,.mp4,.webm,.wav,.mp3,.txt,.csv,.md" />
              <button class="input-action-btn" id="btn-attach-file" title="Upload PDF, Image, Video, Audio">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>

            <textarea
              id="chat-textarea"
              class="chat-textarea"
              rows="1"
              placeholder="Ask anything or upload PDF, image, video..."
            ></textarea>

            <div class="input-actions-right">
              <button class="btn-voice-input ${this.isRecordingVoice ? 'recording' : ''}" id="btn-mic-input" title="Voice dictation">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              </button>

              ${
                isStreaming
                  ? `
                <button class="btn-stop-generating" id="btn-stop-stream" title="Stop generating">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="5" y="5" width="14" height="14" rx="2"></rect>
                  </svg>
                </button>
              `
                  : `
                <button class="btn-send-message" id="btn-send-message" title="Send message" disabled>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="12" y1="19" x2="12" y2="5"></line>
                    <polyline points="5 12 12 5 19 12"></polyline>
                  </svg>
                </button>
              `
              }
            </div>
          </div>

          <div class="input-disclaimer-text">
            VisionRAG Multimodal Neural Engine • Verify cited document pages, image regions & video timestamps.
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.scrollToBottom();
  }

  renderEmptyHero() {
    return `
      <div class="empty-state-hero">
        <div class="hero-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="4"></circle>
            <line x1="12" y1="2" x2="12" y2="6"></line>
            <line x1="12" y1="18" x2="12" y2="22"></line>
          </svg>
        </div>
        <div class="hero-title">What can VisionRAG analyze for you?</div>
        <div class="hero-subtitle">
          Ask questions across complex visual documents, PDFs with tables and diagrams, high-resolution imagery, or temporal video streams.
        </div>

        <div class="suggestions-grid">
          <div class="suggestion-card" data-prompt="Analyze the financial balance sheet in the uploaded PDF and extract the Q3 EBITDA margins.">
            <div class="suggestion-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <div class="suggestion-info">
              <span class="suggestion-headline">Extract PDF Financial Tables</span>
              <span class="suggestion-prompt">Identify operating revenue, EBITDA, and tabular margins.</span>
            </div>
          </div>

          <div class="suggestion-card" data-prompt="Scan the inspection video clip and pinpoint timestamps where safety equipment was missing.">
            <div class="suggestion-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
            </div>
            <div class="suggestion-info">
              <span class="suggestion-headline">Temporal Video Analysis</span>
              <span class="suggestion-prompt">Detect events, objects, and keyframe timestamps.</span>
            </div>
          </div>

          <div class="suggestion-card" data-prompt="Inspect this circuit schematic diagram and extract all resistor values and step-down ICs.">
            <div class="suggestion-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </div>
            <div class="suggestion-info">
              <span class="suggestion-headline">Circuit & Blueprint OCR</span>
              <span class="suggestion-prompt">Detect electrical components and trace signal paths.</span>
            </div>
          </div>

          <div class="suggestion-card" data-prompt="Write a Python script using ColPali multi-vector retrieval for indexing high-res PDF pages.">
            <div class="suggestion-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            </div>
            <div class="suggestion-info">
              <span class="suggestion-headline">Multimodal Code Assistant</span>
              <span class="suggestion-prompt">Generate ColPali, SigLIP, and Qdrant ingestion scripts.</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderMessage(msg) {
    const isUser = msg.sender === 'user';
    return `
      <div class="message-row ${isUser ? 'user' : 'assistant'}">
        ${
          !isUser
            ? `
          <div class="message-avatar assistant-avatar" title="VisionRAG Assistant">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="4"></circle>
            </svg>
          </div>
        `
            : ''
        }

        <div class="${isUser ? 'user-bubble' : 'assistant-bubble'}">
          <div class="assistant-text">
            ${this.formatMarkdown(msg.text)}
            ${msg.isStreaming ? `<span class="streaming-cursor"></span>` : ''}
          </div>

          <!-- Attachments chips for user message -->
          ${
            isUser && msg.attachments && msg.attachments.length > 0
              ? `
            <div class="user-attachments-grid">
              ${msg.attachments
                .map(
                  (a) => `
                <div class="user-file-chip">
                  ${this.getFileIconSvg(a.type)}
                  <span>${this.escapeHtml(a.name)}</span>
                </div>
              `
                )
                .join('')}
            </div>
          `
              : ''
          }

          <!-- RAG Grounding Sources Pill Row -->
          ${
            !isUser && msg.sources && msg.sources.length > 0
              ? `
            <div class="rag-grounding-box">
              <div class="grounding-box-header">
                <span>Retrieved Grounding Sources (${msg.sources.length})</span>
                <span style="font-weight: normal; color: var(--text-muted); font-size: 11px;">Click to view bounding box & page</span>
              </div>
              <div class="sources-pill-row">
                ${msg.sources
                  .map(
                    (src) => `
                  <button class="citation-pill" data-source-id="${src.id}" title="Inspect source chunk and visual bounding box">
                    ${this.getFileIconSvg(src.type)}
                    <span>${this.escapeHtml(src.title)} (p. ${src.page})</span>
                    <span class="match-badge">${src.matchScore}%</span>
                  </button>
                `
                  )
                  .join('')}
              </div>
            </div>
          `
              : ''
          }

          <!-- Assistant Action Toolbar -->
          ${
            !isUser && !msg.isStreaming
              ? `
            <div class="message-actions-toolbar">
              <button class="action-icon-btn btn-copy-msg" data-text="${this.escapeAttr(msg.text)}" title="Copy message">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
              <button class="action-icon-btn btn-tts-msg" data-text="${this.escapeAttr(msg.text)}" title="Read message aloud">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
              </button>
              <button class="action-icon-btn" title="Good response">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
              </button>
              <button class="action-icon-btn" title="Poor response">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path></svg>
              </button>
            </div>
          `
              : ''
          }
        </div>

        ${
          isUser
            ? `
          <div class="message-avatar user-avatar" title="You">
            VR
          </div>
        `
            : ''
        }
      </div>
    `;
  }

  bindEvents() {
    // Sidebar toggle
    const toggleSidebarBtn = this.container.querySelector('#btn-toggle-sidebar');
    if (toggleSidebarBtn) {
      toggleSidebarBtn.addEventListener('click', () => store.toggleSidebar());
    }

    // Top new chat
    const topNewChatBtn = this.container.querySelector('#btn-new-chat-top');
    if (topNewChatBtn) {
      topNewChatBtn.addEventListener('click', () => store.createChat());
    }

    // Live Camera modal
    const cameraBtn = this.container.querySelector('#btn-open-camera');
    if (cameraBtn && this.onOpenVideo) {
      cameraBtn.addEventListener('click', () => this.onOpenVideo());
    }

    // Voice mode overlay
    const voiceModeBtn = this.container.querySelector('#btn-open-voice-mode');
    if (voiceModeBtn && this.onOpenVoice) {
      voiceModeBtn.addEventListener('click', () => this.onOpenVoice());
    }

    // Model Selector
    const modelBtn = this.container.querySelector('#btn-select-model');
    if (modelBtn && this.onOpenSettings) {
      modelBtn.addEventListener('click', () => this.onOpenSettings());
    }

    // Suggestion Cards Click
    this.container.querySelectorAll('.suggestion-card').forEach((card) => {
      card.addEventListener('click', () => {
        const prompt = card.dataset.prompt;
        const textarea = this.container.querySelector('#chat-textarea');
        if (textarea) {
          textarea.value = prompt;
          this.handleSendMessage();
        }
      });
    });

    // File Upload Attachment (+) Button
    const attachBtn = this.container.querySelector('#btn-attach-file');
    const fileInput = this.container.querySelector('#file-upload-input');
    if (attachBtn && fileInput) {
      attachBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => this.handleFileUpload(e.target.files));
    }

    // Remove Attachment Chip
    this.container.querySelectorAll('.btn-remove-attachment').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        store.removeAttachment(btn.dataset.attId);
      });
    });

    // Textarea input & height auto-resize
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

    // Mic Button
    const micBtn = this.container.querySelector('#btn-mic-input');
    if (micBtn) {
      micBtn.addEventListener('click', () => this.toggleSpeechInput());
    }

    // Send Button
    const sendBtn = this.container.querySelector('#btn-send-message');
    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.handleSendMessage());
    }

    // Stop Stream Button
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

    // Citation Pill Click -> Opens Deep Source Inspector
    this.container.querySelectorAll('.citation-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        const sourceId = pill.dataset.sourceId;
        const activeChat = store.getActiveChat();
        let foundSource = null;
        if (activeChat) {
          for (const msg of activeChat.messages) {
            if (msg.sources) {
              foundSource = msg.sources.find((s) => s.id === sourceId);
              if (foundSource) break;
            }
          }
        }
        if (foundSource && this.onOpenSource) {
          this.onOpenSource(foundSource);
        }
      });
    });

    // Copy Message Text
    this.container.querySelectorAll('.btn-copy-msg').forEach((btn) => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.text;
        navigator.clipboard.writeText(text);
        btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        setTimeout(() => {
          btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
        }, 1800);
      });
    });

    // Text to Speech
    this.container.querySelectorAll('.btn-tts-msg').forEach((btn) => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.text;
        this.speakText(text);
      });
    });

    // Copy Code Buttons inside code blocks
    this.container.querySelectorAll('.btn-copy-code').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pre = btn.closest('.code-block-wrap').querySelector('pre');
        if (pre) {
          navigator.clipboard.writeText(pre.innerText);
          btn.innerText = 'Copied!';
          setTimeout(() => (btn.innerText = 'Copy code'), 2000);
        }
      });
    });
  }

  updateTextareaHeight(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
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

    for (const file of Array.from(fileList)) {
      const attId = 'att-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
      const attachmentItem = {
        id: attId,
        name: file.name,
        type: file.type,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        progress: 15,
        fileObj: file
      };

      store.addAttachment(attachmentItem);

      // Upload via api with progress
      await api.uploadFile(file, (progress) => {
        store.updateAttachmentProgress(attId, progress);
      });
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
    const userMsg = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: text,
      timestamp: Date.now(),
      attachments: attachments.map((a) => ({ name: a.name, type: a.type, size: a.size }))
    };
    store.addMessage(activeChat.id, userMsg);

    // Reset input
    textarea.value = '';
    textarea.style.height = 'auto';
    store.clearAttachments();
    this.updateSendButtonState();

    // Prepare Assistant Message Placeholder with typewriter
    const assistantMsgId = 'msg-' + (Date.now() + 1);
    const assistantMsg = {
      id: assistantMsgId,
      sender: 'assistant',
      text: '',
      timestamp: Date.now(),
      isStreaming: true,
      sources: []
    };
    store.addMessage(activeChat.id, assistantMsg);
    store.setStreaming(true);

    this.abortController = new AbortController();

    try {
      const result = await api.queryVisionRAG({
        prompt: text || 'Please inspect the uploaded media and provide multimodal grounding.',
        attachments: attachments,
        settings: store.getState().settings,
        abortSignal: this.abortController.signal,
        onChunk: (accumulatedText, isDone) => {
          const currentChat = store.getActiveChat();
          if (currentChat) {
            const currentMsg = currentChat.messages.find((m) => m.id === assistantMsgId);
            if (currentMsg) {
              currentMsg.text = accumulatedText;
              currentMsg.isStreaming = !isDone;
              this.updateStreamingMessageDOM(assistantMsgId, accumulatedText, !isDone);
            }
          }
        }
      });

      // Finalize Assistant Message
      const finalizedChat = store.getActiveChat();
      if (finalizedChat) {
        const currentMsg = finalizedChat.messages.find((m) => m.id === assistantMsgId);
        if (currentMsg) {
          currentMsg.text = result.text;
          currentMsg.sources = result.sources;
          currentMsg.isStreaming = false;
        }
      }

      // Auto read if enabled in settings
      if (store.getState().settings.autoSpeak) {
        this.speakText(result.text);
      }
    } catch (err) {
      console.error('Error during generation:', err);
    } finally {
      store.setStreaming(false);
      this.abortController = null;
      store.notify('STREAMING_DONE');
    }
  }

  updateStreamingMessageDOM(msgId, text, isStreaming) {
    const inner = this.container.querySelector('#messages-inner');
    if (!inner) return;

    const row = inner.querySelector(`[data-msg-id="${msgId}"]`) || inner.lastElementChild;
    if (row) {
      const textEl = row.querySelector('.assistant-text');
      if (textEl) {
        textEl.innerHTML = `${this.formatMarkdown(text)}${isStreaming ? `<span class="streaming-cursor"></span>` : ''}`;
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

  speakText(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    // Clean markdown before speaking
    const cleanText = text
      .replace(/#+\s/g, '')
      .replace(/\*+/g, '')
      .replace(/`+/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const settings = store.getState().settings;
    utterance.rate = settings.speechRate || 1.0;
    utterance.pitch = settings.speechPitch || 1.0;
    window.speechSynthesis.speak(utterance);
  }

  formatMarkdown(text) {
    if (!text) return '';

    // Code blocks ```code```
    text = text.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `
        <div class="code-block-wrap">
          <div class="code-header-bar">
            <span>${lang || 'code'}</span>
            <button class="btn-copy-code">Copy code</button>
          </div>
          <pre><code>${this.escapeHtml(code.trim())}</code></pre>
        </div>
      `;
    });

    // Headers
    text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    text = text.replace(/^## (.*$)/gim, '<h3>$1</h3>');
    text = text.replace(/^# (.*$)/gim, '<h3>$1</h3>');

    // Bold & Italic
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Inline Code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Lists
    text = text.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
    text = text.replace(/^\s*\d+\.\s+(.*$)/gim, '<li>$1</li>');

    // Wrap list items
    text = text.replace(/(<li>.*<\/li>)/gms, '<ul>$1</ul>');

    // Paragraphs
    const paras = text.split(/\n\n+/);
    return paras
      .map((p) => {
        p = p.trim();
        if (p.startsWith('<h3>') || p.startsWith('<ul>') || p.startsWith('<div class="code-block-wrap">')) {
          return p;
        }
        return `<p>${p.replace(/\n/g, '<br/>')}</p>`;
      })
      .join('');
  }

  getFileIconSvg(type) {
    if (!type) {
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path></svg>`;
    }
    if (type.includes('pdf')) {
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line></svg>`;
    }
    if (type.includes('image')) {
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10a37f" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`;
    }
    if (type.includes('video')) {
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>`;
    }
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path></svg>`;
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  escapeAttr(str) {
    if (!str) return '';
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
}
