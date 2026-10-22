// VisionRAG State Management - Clean Slate (No Demo Data)

const STORAGE_KEY = 'visionrag_clean_v2';

const defaultState = {
  folders: [],
  chats: [],
  activeChatId: null,
  activeAttachments: [],
  isStreaming: false,
  sidebarCollapsed: false,
  user: null, // { loggedIn: true, name: 'Alex Rivera', email: 'alex@example.com' }
  settings: {
    model: 'visionrag-omni-v2.5',
    theme: 'white',
    topK: 5,
    similarityThreshold: 0.72,
    hybridAlpha: 0.65,
    rerankerEnabled: true,
    visionModel: 'clip-vit-l-14',
    ocrEngine: 'easyocr',
    fps: 1,
    speechRate: 1.0,
    speechPitch: 1.0,
    autoSpeak: false,
    backendUrl: 'http://localhost:8000',
    mockMode: false,
    geminiApiKey: ''
  }
};

class StateStore {
  constructor() {
    this.listeners = new Set();
    this.state = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultState,
          ...parsed,
          settings: {
            ...defaultState.settings,
            ...(parsed.settings || {}),
            mockMode: false
          },
          activeAttachments: [],
          isStreaming: false
        };
      }
    } catch (e) {
      console.warn('Failed to parse saved state:', e);
    }
    return JSON.parse(JSON.stringify(defaultState));
  }

  saveState() {
    try {
      const toSave = {
        folders: this.state.folders,
        chats: this.state.chats,
        activeChatId: this.state.activeChatId,
        sidebarCollapsed: this.state.sidebarCollapsed,
        user: this.state.user,
        settings: this.state.settings
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event, payload) {
    this.saveState();
    this.listeners.forEach((listener) => {
      try {
        listener(this.state, event, payload);
      } catch (err) {
        console.error('State listener error:', err);
      }
    });
  }

  getState() {
    return this.state;
  }

  // --- Chat Actions ---
  getActiveChat() {
    if (!this.state.activeChatId) return null;
    return this.state.chats.find((c) => c.id === this.state.activeChatId) || null;
  }

  createChat(folderId = null) {
    const newChat = {
      id: 'chat-' + Date.now(),
      title: 'New Conversation',
      folderId: folderId,
      createdAt: Date.now(),
      pinned: false,
      messages: []
    };
    this.state.chats.unshift(newChat);
    this.state.activeChatId = newChat.id;
    this.notify('CHAT_CREATED', newChat);
    return newChat;
  }

  setActiveChat(chatId) {
    this.state.activeChatId = chatId;
    this.notify('CHAT_CHANGED', chatId);
  }

  renameChat(chatId, newTitle) {
    const chat = this.state.chats.find((c) => c.id === chatId);
    if (chat && newTitle.trim()) {
      chat.title = newTitle.trim();
      this.notify('CHAT_RENAMED', chat);
    }
  }

  deleteChat(chatId) {
    const idx = this.state.chats.findIndex((c) => c.id === chatId);
    if (idx !== -1) {
      this.state.chats.splice(idx, 1);
      if (this.state.activeChatId === chatId) {
        this.state.activeChatId = this.state.chats.length > 0 ? this.state.chats[0].id : null;
      }
      this.notify('CHAT_DELETED', chatId);
    }
  }

  togglePinChat(chatId) {
    const chat = this.state.chats.find((c) => c.id === chatId);
    if (chat) {
      chat.pinned = !chat.pinned;
      this.notify('CHAT_PINNED', chat);
    }
  }

  moveChatToFolder(chatId, folderId) {
    const chat = this.state.chats.find((c) => c.id === chatId);
    if (chat) {
      chat.folderId = folderId;
      this.notify('CHAT_MOVED', { chatId, folderId });
    }
  }

  // --- Folder Actions ---
  createFolder(name) {
    const newFolder = {
      id: 'f-' + Date.now(),
      name: name.trim() || 'New Folder',
      icon: 'folder',
      createdAt: Date.now()
    };
    this.state.folders.push(newFolder);
    this.notify('FOLDER_CREATED', newFolder);
    return newFolder;
  }

  renameFolder(folderId, newName) {
    const folder = this.state.folders.find((f) => f.id === folderId);
    if (folder && newName.trim()) {
      folder.name = newName.trim();
      this.notify('FOLDER_RENAMED', folder);
    }
  }

  deleteFolder(folderId) {
    this.state.folders = this.state.folders.filter((f) => f.id !== folderId);
    this.state.chats.forEach((c) => {
      if (c.folderId === folderId) c.folderId = null;
    });
    this.notify('FOLDER_DELETED', folderId);
  }

  // --- Message Actions ---
  addMessage(chatId, message) {
    let chat = this.state.chats.find((c) => c.id === chatId);
    if (!chat) {
      chat = this.createChat();
      chatId = chat.id;
    }
    chat.messages.push(message);

    if (message.sender === 'user' && chat.title.startsWith('New Conversation')) {
      chat.title = message.text.slice(0, 36) + (message.text.length > 36 ? '...' : '');
    }

    this.notify('MESSAGE_ADDED', { chatId, message });
  }

  // --- Attachments & UI Actions ---
  addAttachment(attachment) {
    this.state.activeAttachments.push(attachment);
    this.notify('ATTACHMENT_ADDED', attachment);
  }

  updateAttachmentProgress(attachmentId, progress) {
    const item = this.state.activeAttachments.find((a) => a.id === attachmentId);
    if (item) {
      item.progress = progress;
      this.notify('ATTACHMENT_PROGRESS', item);
    }
  }

  removeAttachment(attachmentId) {
    this.state.activeAttachments = this.state.activeAttachments.filter((a) => a.id !== attachmentId);
    this.notify('ATTACHMENT_REMOVED', attachmentId);
  }

  clearAttachments() {
    this.state.activeAttachments = [];
    this.notify('ATTACHMENTS_CLEARED');
  }

  setStreaming(streaming) {
    this.state.isStreaming = streaming;
    this.notify('STREAMING_STATUS', streaming);
  }

  toggleSidebar() {
    this.state.sidebarCollapsed = !this.state.sidebarCollapsed;
    this.notify('SIDEBAR_TOGGLED', this.state.sidebarCollapsed);
  }

  setUser(user) {
    this.state.user = user;
    if (user && user.token) {
      try {
        localStorage.setItem('visionrag_jwt_token', user.token);
      } catch (e) {}
    }
    this.notify('AUTH_CHANGED', user);
  }

  logoutUser() {
    this.state.user = null;
    try {
      localStorage.removeItem('visionrag_jwt_token');
    } catch (e) {}
    this.notify('AUTH_CHANGED', null);
  }

  async checkAuthSession(apiInstance) {
    const token = localStorage.getItem('visionrag_jwt_token');
    if (!token) return null;
    try {
      if (apiInstance) {
        const user = await apiInstance.getMe(token);
        if (user) {
          this.setUser({
            loggedIn: true,
            id: user.id,
            name: user.full_name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            metadata: user.metadata,
            token: token
          });
          return user;
        }
      }
    } catch (e) {
      console.warn('Session check failed:', e);
    }
    return null;
  }

  updateSettings(newSettings) {
    this.state.settings = { ...this.state.settings, ...newSettings };
    this.notify('SETTINGS_UPDATED', this.state.settings);
  }

  clearAllData() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('visionrag_app_state_v1');
    this.state = JSON.parse(JSON.stringify(defaultState));
    this.notify('DATA_RESET');
  }
}

export const store = new StateStore();
