// Sidebar Component: ChatGPT Aesthetic with Folders & History Management

import { store } from '../store/state.js';

export class Sidebar {
  constructor(containerEl, { onOpenSettings, onReplayIntro }) {
    this.container = containerEl;
    this.onOpenSettings = onOpenSettings;
    this.onReplayIntro = onReplayIntro;
    this.searchQuery = '';
    this.collapsedFolders = new Set();

    store.subscribe(() => this.render());
  }

  render() {
    const state = store.getState();
    const activeChatId = state.activeChatId;

    // Filter chats by search query
    const filteredChats = state.chats.filter((c) =>
      c.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );

    // Group chats
    const pinnedChats = filteredChats.filter((c) => c.pinned);
    const unfiledChats = filteredChats.filter((c) => !c.folderId && !c.pinned);

    // Date grouping for unfiled
    const now = Date.now();
    const oneDay = 86400000;
    const todayChats = unfiledChats.filter((c) => now - c.createdAt < oneDay);
    const yesterdayChats = unfiledChats.filter(
      (c) => now - c.createdAt >= oneDay && now - c.createdAt < 2 * oneDay
    );
    const previous7DaysChats = unfiledChats.filter(
      (c) => now - c.createdAt >= 2 * oneDay && now - c.createdAt < 7 * oneDay
    );
    const olderChats = unfiledChats.filter((c) => now - c.createdAt >= 7 * oneDay);

    this.container.className = `sidebar ${state.sidebarCollapsed ? 'collapsed' : ''}`;
    this.container.innerHTML = `
      <div class="sidebar-header">
        <div class="sidebar-brand-row">
          <a href="#" class="sidebar-brand" id="brand-logo-btn" title="Click to replay intro">
            <div class="sidebar-logo-icon">O</div>
            <span>Vision<span style="color: var(--brand-green);">RAG</span></span>
          </a>
          <button class="sidebar-toggle-btn" id="sidebar-close-btn" title="Collapse sidebar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
          </button>
        </div>

        <div class="sidebar-actions">
          <button class="btn-new-chat" id="btn-sidebar-new-chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>New chat</span>
          </button>
          <button class="btn-new-folder" id="btn-sidebar-new-folder" title="Create new folder">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              <line x1="12" y1="11" x2="12" y2="17"></line>
              <line x1="9" y1="14" x2="15" y2="14"></line>
            </svg>
          </button>
        </div>
      </div>

      <div class="sidebar-search">
        <div class="search-input-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" id="sidebar-search-input" placeholder="Search chats..." value="${this.searchQuery}" />
        </div>
      </div>

      <div class="sidebar-scroll">
        <!-- Folders Section (Like ChatGPT Custom Workspaces / Folders) -->
        <div class="folders-section">
          <div class="section-label">Folders</div>
          ${
            state.folders.length === 0
              ? `<div style="font-size: 12px; color: var(--text-muted); padding: 4px 8px;">No folders yet. Click + to organize.</div>`
              : state.folders
                  .map((folder) => {
                    const folderChats = filteredChats.filter((c) => c.folderId === folder.id);
                    const isCollapsed = this.collapsedFolders.has(folder.id);
                    return `
                      <div class="folder-item">
                        <div class="folder-header" data-folder-id="${folder.id}">
                          <div class="folder-title-wrap">
                            <span class="folder-icon">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                              </svg>
                            </span>
                            <span class="folder-name">${this.escapeHtml(folder.name)}</span>
                            <span style="font-size: 11px; color: var(--text-muted);">(${folderChats.length})</span>
                          </div>
                          <div class="folder-actions">
                            <button class="item-action-btn btn-rename-folder" data-folder-id="${folder.id}" title="Rename folder">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                            </button>
                            <button class="item-action-btn btn-delete-folder" data-folder-id="${folder.id}" title="Delete folder">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                          </div>
                        </div>
                        <div class="folder-chats-list ${isCollapsed ? 'collapsed' : ''}">
                          ${folderChats
                            .map((chat) => this.renderChatItem(chat, activeChatId))
                            .join('')}
                        </div>
                      </div>
                    `;
                  })
                  .join('')
          }
        </div>

        <!-- Pinned Section -->
        ${
          pinnedChats.length > 0
            ? `
          <div class="history-section">
            <div class="history-group-title">📌 Pinned</div>
            ${pinnedChats.map((c) => this.renderChatItem(c, activeChatId)).join('')}
          </div>
        `
            : ''
        }

        <!-- Date-Based History -->
        <div class="history-section">
          ${todayChats.length > 0 ? `<div class="history-group-title">Today</div>` : ''}
          ${todayChats.map((c) => this.renderChatItem(c, activeChatId)).join('')}

          ${yesterdayChats.length > 0 ? `<div class="history-group-title">Yesterday</div>` : ''}
          ${yesterdayChats.map((c) => this.renderChatItem(c, activeChatId)).join('')}

          ${previous7DaysChats.length > 0 ? `<div class="history-group-title">Previous 7 Days</div>` : ''}
          ${previous7DaysChats.map((c) => this.renderChatItem(c, activeChatId)).join('')}

          ${olderChats.length > 0 ? `<div class="history-group-title">Older</div>` : ''}
          ${olderChats.map((c) => this.renderChatItem(c, activeChatId)).join('')}
        </div>
      </div>

      <div class="sidebar-footer">
        <div class="kb-status-pill">
          <div class="status-dot"></div>
          <span>VisionRAG Online • 18 Multimodal Docs</span>
        </div>
        <div class="user-profile-row" id="user-profile-trigger">
          <div class="user-info">
            <div class="user-avatar">VR</div>
            <div class="user-details">
              <span class="user-name">Vision Explorer</span>
              <span class="user-role">RAG Pro User</span>
            </div>
          </div>
          <button class="btn-open-settings" id="sidebar-settings-btn" title="Open Settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderChatItem(chat, activeChatId) {
    const isActive = chat.id === activeChatId;
    return `
      <div class="chat-item ${isActive ? 'active' : ''}" data-chat-id="${chat.id}">
        <span class="chat-item-title">${this.escapeHtml(chat.title)}</span>
        <div class="chat-item-actions">
          <button class="item-action-btn btn-pin-chat" data-chat-id="${chat.id}" title="${chat.pinned ? 'Unpin' : 'Pin'}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="${chat.pinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="17" x2="12" y2="22"></line>
              <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a1 1 0 0 0 0-2H8a1 1 0 0 0 0 2h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
            </svg>
          </button>
          <button class="item-action-btn btn-move-folder" data-chat-id="${chat.id}" title="Move to folder">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
          <button class="item-action-btn btn-rename-chat" data-chat-id="${chat.id}" title="Rename">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
          <button class="item-action-btn btn-delete-chat" data-chat-id="${chat.id}" title="Delete">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Brand Logo - Replay Intro
    const brandBtn = this.container.querySelector('#brand-logo-btn');
    if (brandBtn && this.onReplayIntro) {
      brandBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.onReplayIntro();
      });
    }

    // Toggle Sidebar
    const closeBtn = this.container.querySelector('#sidebar-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => store.toggleSidebar());
    }

    // New Chat
    const newChatBtn = this.container.querySelector('#btn-sidebar-new-chat');
    if (newChatBtn) {
      newChatBtn.addEventListener('click', () => store.createChat());
    }

    // New Folder
    const newFolderBtn = this.container.querySelector('#btn-sidebar-new-folder');
    if (newFolderBtn) {
      newFolderBtn.addEventListener('click', () => {
        const name = prompt('Enter new folder name (e.g. Legal Briefs, Vision Archive):');
        if (name && name.trim()) {
          store.createFolder(name.trim());
        }
      });
    }

    // Search Input
    const searchInput = this.container.querySelector('#sidebar-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.render();
      });
    }

    // Settings Modal
    const settingsBtn = this.container.querySelector('#sidebar-settings-btn');
    const profileRow = this.container.querySelector('#user-profile-trigger');
    if (settingsBtn && this.onOpenSettings) {
      settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onOpenSettings();
      });
    }
    if (profileRow && this.onOpenSettings) {
      profileRow.addEventListener('click', () => this.onOpenSettings());
    }

    // Folder Click (Toggle Collapse)
    this.container.querySelectorAll('.folder-header').forEach((header) => {
      header.addEventListener('click', (e) => {
        if (e.target.closest('.item-action-btn')) return;
        const folderId = header.dataset.folderId;
        if (this.collapsedFolders.has(folderId)) {
          this.collapsedFolders.delete(folderId);
        } else {
          this.collapsedFolders.add(folderId);
        }
        this.render();
      });
    });

    // Rename Folder
    this.container.querySelectorAll('.btn-rename-folder').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const folderId = btn.dataset.folderId;
        const newName = prompt('Rename folder:');
        if (newName && newName.trim()) {
          store.renameFolder(folderId, newName.trim());
        }
      });
    });

    // Delete Folder
    this.container.querySelectorAll('.btn-delete-folder').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const folderId = btn.dataset.folderId;
        if (confirm('Delete this folder? Contained chats will be moved to General History.')) {
          store.deleteFolder(folderId);
        }
      });
    });

    // Chat Item Select
    this.container.querySelectorAll('.chat-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.chat-item-actions')) return;
        const chatId = item.dataset.chatId;
        store.setActiveChat(chatId);
      });
    });

    // Pin Chat
    this.container.querySelectorAll('.btn-pin-chat').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        store.togglePinChat(btn.dataset.chatId);
      });
    });

    // Move to Folder
    this.container.querySelectorAll('.btn-move-folder').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const chatId = btn.dataset.chatId;
        const folders = store.getState().folders;
        if (folders.length === 0) {
          alert('No folders exist yet. Create a folder using the folder icon at the top of the sidebar.');
          return;
        }
        const folderNames = folders.map((f, i) => `${i + 1}. ${f.name}`).join('\n');
        const choice = prompt(`Select a folder to move this chat into:\n0. Unfile (No Folder)\n${folderNames}`);
        if (choice !== null) {
          const num = parseInt(choice.trim(), 10);
          if (num === 0) {
            store.moveChatToFolder(chatId, null);
          } else if (num > 0 && num <= folders.length) {
            store.moveChatToFolder(chatId, folders[num - 1].id);
          }
        }
      });
    });

    // Rename Chat
    this.container.querySelectorAll('.btn-rename-chat').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const chatId = btn.dataset.chatId;
        const currentTitle = store.getState().chats.find((c) => c.id === chatId)?.title || '';
        const newTitle = prompt('Rename chat:', currentTitle);
        if (newTitle && newTitle.trim()) {
          store.renameChat(chatId, newTitle.trim());
        }
      });
    });

    // Delete Chat
    this.container.querySelectorAll('.btn-delete-chat').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const chatId = btn.dataset.chatId;
        if (confirm('Delete this chat?')) {
          store.deleteChat(chatId);
        }
      });
    });
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
