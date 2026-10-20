// Sidebar Component: Clean ChatGPT Aesthetic with Folders, History & Account Creation

import { store } from '../store/state.js';
import { api } from '../services/api.js';

export class Sidebar {
  constructor(containerEl, { onOpenSettings, onReplayIntro, onOpenAuth, onOpenDbStorage }) {
    this.container = containerEl;
    this.onOpenSettings = onOpenSettings;
    this.onReplayIntro = onReplayIntro;
    this.onOpenAuth = onOpenAuth;
    this.onOpenDbStorage = onOpenDbStorage;
    this.searchQuery = '';
    this.collapsedFolders = new Set();

    store.subscribe(() => this.render());
  }

  render() {
    const state = store.getState();
    const activeChatId = state.activeChatId;
    const user = state.user;

    const filteredChats = state.chats.filter((c) =>
      c.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );

    const pinnedChats = filteredChats.filter((c) => c.pinned);
    const unfiledChats = filteredChats.filter((c) => !c.folderId && !c.pinned);

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
          <a href="#" class="sidebar-brand" id="brand-logo-btn" title="Replay intro animation">
            <div class="brand-circle-two-eyes">
              <div class="mini-eyes-pair">
                <div class="mini-socket">
                  <div class="mini-dot-pupil"></div>
                </div>
                <div class="mini-socket">
                  <div class="mini-dot-pupil"></div>
                </div>
              </div>
            </div>
            <span>Vision<span style="color: var(--brand-green);">RAG</span></span>
          </a>
          <button class="action-icon-btn" id="sidebar-close-btn" title="Collapse sidebar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
          </button>
        </div>

        <div class="sidebar-actions">
          <button class="btn-new-chat" id="btn-sidebar-new-chat">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>New chat</span>
          </button>
          <button class="btn-new-folder" id="btn-sidebar-new-folder" title="Create folder">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              <line x1="12" y1="11" x2="12" y2="17"></line>
              <line x1="9" y1="14" x2="15" y2="14"></line>
            </svg>
          </button>
        </div>
        <button class="btn-new-chat" id="btn-sidebar-db" style="margin-top: 6px; width: 100%; background: rgba(16, 163, 127, 0.08); border: 1px solid rgba(16, 163, 127, 0.25); color: #10a37f; font-weight: 600; font-size: 12px; gap: 6px; padding: 6px 10px;">
          <span>🐘</span>
          <span>PostgreSQL Storage</span>
          <span style="font-size: 10px; background: #10a37f; color: #fff; padding: 1px 6px; border-radius: 10px; font-weight: 700; margin-left: auto;">Online</span>
        </button>
      </div>

      <div class="sidebar-scroll">
        <!-- Folders Section -->
        <div class="folders-section">
          <div class="section-label">Folders</div>
          ${
            state.folders.length === 0
              ? `<div style="font-size: 12px; color: var(--text-muted); padding: 4px 8px;">No folders yet.</div>`
              : state.folders
                  .map((folder) => {
                    const folderChats = filteredChats.filter((c) => c.folderId === folder.id);
                    const isCollapsed = this.collapsedFolders.has(folder.id);
                    return `
                      <div class="folder-item">
                        <div class="folder-header" data-folder-id="${folder.id}">
                          <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="color: #f59e0b;">📁</span>
                            <span>${this.escapeHtml(folder.name)}</span>
                            <span style="font-size: 11px; color: var(--text-muted);">(${folderChats.length})</span>
                          </div>
                          <div style="display: flex; gap: 2px;">
                            <button class="action-icon-btn btn-rename-folder" data-folder-id="${folder.id}" title="Rename">✏️</button>
                            <button class="action-icon-btn btn-delete-folder" data-folder-id="${folder.id}" title="Delete">🗑️</button>
                          </div>
                        </div>
                        <div class="folder-chats-list ${isCollapsed ? 'collapsed' : ''}">
                          ${folderChats.map((chat) => this.renderChatItem(chat, activeChatId)).join('')}
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
            <div class="section-label">Pinned</div>
            ${pinnedChats.map((c) => this.renderChatItem(c, activeChatId)).join('')}
          </div>
        `
            : ''
        }

        <!-- Chat History -->
        <div class="history-section">
          <div class="section-label">History</div>
          ${
            state.chats.length === 0
              ? `<div style="font-size: 12px; color: var(--text-muted); padding: 4px 8px;">No chats yet. Start a new conversation.</div>`
              : ''
          }
          ${todayChats.length > 0 ? `<div style="font-size: 11px; font-weight:600; color: var(--text-muted); padding: 4px 8px;">Today</div>` : ''}
          ${todayChats.map((c) => this.renderChatItem(c, activeChatId)).join('')}

          ${yesterdayChats.length > 0 ? `<div style="font-size: 11px; font-weight:600; color: var(--text-muted); padding: 4px 8px;">Yesterday</div>` : ''}
          ${yesterdayChats.map((c) => this.renderChatItem(c, activeChatId)).join('')}

          ${previous7DaysChats.length > 0 ? `<div style="font-size: 11px; font-weight:600; color: var(--text-muted); padding: 4px 8px;">Previous 7 Days</div>` : ''}
          ${previous7DaysChats.map((c) => this.renderChatItem(c, activeChatId)).join('')}

          ${olderChats.length > 0 ? `<div style="font-size: 11px; font-weight:600; color: var(--text-muted); padding: 4px 8px;">Older</div>` : ''}
          ${olderChats.map((c) => this.renderChatItem(c, activeChatId)).join('')}
        </div>
      </div>

      <div class="sidebar-footer">
        ${
          user && user.loggedIn
            ? `
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: #0d0d0d; color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center;">
                ${user.avatar || 'U'}
              </div>
              <div style="display: flex; flex-direction: column; overflow: hidden;">
                <span style="font-size: 12.5px; font-weight: 600; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${this.escapeHtml(user.name)}</span>
                <span style="font-size: 10.5px; color: var(--text-muted); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${this.escapeHtml(user.email)}</span>
              </div>
            </div>
            <div style="display: flex; gap: 4px;">
              <button class="action-icon-btn" id="btn-sidebar-db-footer" title="PostgreSQL Database & Stored Files">🐘</button>
              <button class="action-icon-btn" id="btn-logout-user" title="Log out">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </button>
              <button class="action-icon-btn" id="sidebar-settings-btn" title="Open Settings">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              </button>
            </div>
          </div>
        `
            : `
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <button class="btn-new-chat" id="btn-open-create-account" style="padding: 6px 12px; font-size: 12.5px; font-weight: 600; gap: 6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span>Create Account</span>
            </button>
            <div style="display: flex; gap: 4px;">
              <button class="action-icon-btn" id="btn-sidebar-db-footer" title="PostgreSQL Database & Stored Files">🐘</button>
              <button class="action-icon-btn" id="sidebar-settings-btn" title="Open Settings">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </button>
            </div>
          </div>
        `
        }
      </div>
    `;

    this.bindEvents();
  }

  renderChatItem(chat, activeChatId) {
    const isActive = chat.id === activeChatId;
    return `
      <div class="chat-item ${isActive ? 'active' : ''}" data-chat-id="${chat.id}">
        <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">${this.escapeHtml(chat.title)}</span>
        <div style="display: flex; align-items: center; gap: 4px;">
          <button class="btn-pin-chat" data-chat-id="${chat.id}" style="font-size: 11px;" title="${chat.pinned ? 'Unpin' : 'Pin'}">
            ${chat.pinned ? '📌' : '·'}
          </button>
          <button class="btn-delete-chat" data-chat-id="${chat.id}" style="font-size: 11px;" title="Delete">
            ✕
          </button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const brandBtn = this.container.querySelector('#brand-logo-btn');
    if (brandBtn && this.onReplayIntro) {
      brandBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.onReplayIntro();
      });
    }

    const closeBtn = this.container.querySelector('#sidebar-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => store.toggleSidebar());

    const newChatBtn = this.container.querySelector('#btn-sidebar-new-chat');
    if (newChatBtn) newChatBtn.addEventListener('click', () => store.createChat());

    const newFolderBtn = this.container.querySelector('#btn-sidebar-new-folder');
    if (newFolderBtn) {
      newFolderBtn.addEventListener('click', () => {
        const name = prompt('Folder name:');
        if (name && name.trim()) store.createFolder(name.trim());
      });
    }

    const settingsBtn = this.container.querySelector('#sidebar-settings-btn');
    if (settingsBtn && this.onOpenSettings) settingsBtn.addEventListener('click', () => this.onOpenSettings());

    const dbBtn = this.container.querySelector('#btn-sidebar-db');
    if (dbBtn && this.onOpenDbStorage) dbBtn.addEventListener('click', () => this.onOpenDbStorage());

    const dbFooterBtn = this.container.querySelector('#btn-sidebar-db-footer');
    if (dbFooterBtn && this.onOpenDbStorage) dbFooterBtn.addEventListener('click', () => this.onOpenDbStorage());

    const authBtn = this.container.querySelector('#btn-open-create-account');
    if (authBtn && this.onOpenAuth) authBtn.addEventListener('click', () => this.onOpenAuth());

    const logoutBtn = this.container.querySelector('#btn-logout-user');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        if (confirm('Log out of account?')) {
          const user = store.getState().user;
          if (user) {
            await api.logout(user.token, user.id);
          }
          store.logoutUser();
        }
      });
    }

    this.container.querySelectorAll('.folder-header').forEach((header) => {
      header.addEventListener('click', (e) => {
        if (e.target.closest('.action-icon-btn')) return;
        const fid = header.dataset.folderId;
        if (this.collapsedFolders.has(fid)) this.collapsedFolders.delete(fid);
        else this.collapsedFolders.add(fid);
        this.render();
      });
    });

    this.container.querySelectorAll('.btn-rename-folder').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const fid = btn.dataset.folderId;
        const name = prompt('Rename folder:');
        if (name && name.trim()) store.renameFolder(fid, name.trim());
      });
    });

    this.container.querySelectorAll('.btn-delete-folder').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Delete folder?')) store.deleteFolder(btn.dataset.folderId);
      });
    });

    this.container.querySelectorAll('.chat-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        store.setActiveChat(item.dataset.chatId);
      });
    });

    this.container.querySelectorAll('.btn-pin-chat').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        store.togglePinChat(btn.dataset.chatId);
      });
    });

    this.container.querySelectorAll('.btn-delete-chat').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Delete chat?')) store.deleteChat(btn.dataset.chatId);
      });
    });
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
