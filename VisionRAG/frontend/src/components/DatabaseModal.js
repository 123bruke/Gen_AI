// DatabaseModal Component: Inspect PostgreSQL Tables, Major Large Files (BYTEA), Metadata Format & Task Progress

import { store } from '../store/state.js';
import { api } from '../services/api.js';

export class DatabaseModal {
  constructor(containerEl) {
    this.container = containerEl;
    this.activeTab = 'overview'; // 'overview', 'files', 'progress', 'sessions'
    this.status = null;
    this.files = [];
    this.tasks = [];
    this.sessions = [];
    this.loading = false;
  }

  async open(tab = 'overview') {
    this.activeTab = tab;
    this.loading = true;
    this.render();
    await this.fetchData();
    this.loading = false;
    this.render();
  }

  close() {
    this.container.innerHTML = '';
  }

  async fetchData() {
    try {
      const state = store.getState();
      const userId = state.user && state.user.loggedIn ? state.user.id : null;

      const [status, files, tasks, sessionsRes] = await Promise.all([
        api.getDatabaseStatus(),
        api.getUserFiles(userId),
        api.getUserTasks(userId),
        fetch(`${api.baseUrl}/api/auth/sessions${userId ? `?user_id=${userId}` : ''}`).then(r => r.json()).catch(() => ({ sessions: [] }))
      ]);

      this.status = status;
      this.files = files;
      this.tasks = tasks;
      this.sessions = sessionsRes.sessions || [];
    } catch (e) {
      console.error('Error fetching database data:', e);
    }
  }

  render() {
    const s = this.status || {};
    const isPostgres = s.is_postgres || s.db_type === 'postgresql';

    this.container.innerHTML = `
      <div class="auth-modal-overlay" id="db-modal-overlay">
        <div class="auth-card" style="max-width: 760px; width: 95%; max-height: 88vh; display: flex; flex-direction: column; overflow: hidden; padding: 24px;">
          <!-- Header -->
          <div class="auth-header-bar" style="margin-bottom: 16px;">
            <div>
              <div class="auth-title" style="display: flex; align-items: center; gap: 8px;">
                <span>🐘 PostgreSQL Database & Storage</span>
                <span style="font-size: 11px; padding: 2px 8px; border-radius: 12px; background: ${isPostgres ? '#e6f7f2' : '#fef3c7'}; color: ${isPostgres ? '#10a37f' : '#d97706'}; font-weight: 600;">
                  ${isPostgres ? 'PostgreSQL 16 Connected' : 'SQLite Fallback'}
                </span>
              </div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                ACID Transacted Storage • Major Large File (BYTEA) • Metadata JSONB • Progress Tracking
              </div>
            </div>
            <button class="action-icon-btn" id="btn-close-db-modal" title="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Navigation Tabs -->
          <div class="auth-tabs-toggle" style="margin-bottom: 16px;">
            <button class="auth-tab-btn ${this.activeTab === 'overview' ? 'active' : ''}" data-tab="overview">
              Overview & Counts
            </button>
            <button class="auth-tab-btn ${this.activeTab === 'files' ? 'active' : ''}" data-tab="files">
              Files in DB (${this.files.length})
            </button>
            <button class="auth-tab-btn ${this.activeTab === 'progress' ? 'active' : ''}" data-tab="progress">
              Task Progress (${this.tasks.length})
            </button>
            <button class="auth-tab-btn ${this.activeTab === 'sessions' ? 'active' : ''}" data-tab="sessions">
              Audit Sessions (${this.sessions.length})
            </button>
          </div>

          <!-- Content Scroll Area -->
          <div style="overflow-y: auto; flex: 1; padding-right: 4px;">
            ${this.loading ? `<div style="text-align: center; padding: 40px; color: var(--text-muted);">Loading PostgreSQL records...</div>` : this.renderTabContent()}
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderTabContent() {
    if (this.activeTab === 'overview') {
      const s = this.status || {};
      return `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Metrics Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
            <div style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; border: 1px solid var(--border-medium);">
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">USERS IN DB</div>
              <div style="font-size: 22px; font-weight: 700; color: var(--text-primary); margin-top: 4px;">${s.user_count || 0}</div>
            </div>
            <div style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; border: 1px solid var(--border-medium);">
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">ACTIVE SESSIONS</div>
              <div style="font-size: 22px; font-weight: 700; color: var(--text-primary); margin-top: 4px;">${s.session_count || 0}</div>
            </div>
            <div style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; border: 1px solid var(--border-medium);">
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">UPLOADED FILES</div>
              <div style="font-size: 22px; font-weight: 700; color: var(--text-primary); margin-top: 4px;">${s.uploaded_files_count || 0}</div>
            </div>
            <div style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; border: 1px solid var(--border-medium);">
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">CONVERSATIONS</div>
              <div style="font-size: 22px; font-weight: 700; color: var(--text-primary); margin-top: 4px;">${s.conversations_count || 0}</div>
            </div>
            <div style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; border: 1px solid var(--border-medium);">
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">MESSAGES SENT</div>
              <div style="font-size: 22px; font-weight: 700; color: var(--text-primary); margin-top: 4px;">${s.messages_count || 0}</div>
            </div>
            <div style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; border: 1px solid var(--border-medium);">
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">PROGRESS TASKS</div>
              <div style="font-size: 22px; font-weight: 700; color: var(--text-primary); margin-top: 4px;">${s.task_progress_count || 0}</div>
            </div>
          </div>

          <!-- Database Configuration Details -->
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-medium); border-radius: 8px; padding: 14px;">
            <div style="font-size: 12.5px; font-weight: 600; margin-bottom: 8px; color: var(--text-primary);">PostgreSQL Connection & Schema Specification</div>
            <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid var(--border-medium);">
                <td style="padding: 6px 0; color: var(--text-muted);">Engine Type:</td>
                <td style="padding: 6px 0; font-weight: 600;">PostgreSQL 16 (Relational + BYTEA Object Storage)</td>
              </tr>
              <tr style="border-bottom: 1px solid var(--border-medium);">
                <td style="padding: 6px 0; color: var(--text-muted);">Database Name:</td>
                <td style="padding: 6px 0; font-family: monospace;">visionrag</td>
              </tr>
              <tr style="border-bottom: 1px solid var(--border-medium);">
                <td style="padding: 6px 0; color: var(--text-muted);">Listening Port:</td>
                <td style="padding: 6px 0; font-family: monospace;">5433 (TCP/IP)</td>
              </tr>
              <tr style="border-bottom: 1px solid var(--border-medium);">
                <td style="padding: 6px 0; color: var(--text-muted);">Metadata Format:</td>
                <td style="padding: 6px 0; font-weight: 600;">PostgreSQL JSONB with GIN indexing</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: var(--text-muted);">Binary Storage:</td>
                <td style="padding: 6px 0; font-weight: 600;">PostgreSQL BYTEA for direct database binary persistence</td>
              </tr>
            </table>
          </div>
        </div>
      `;
    }

    if (this.activeTab === 'files') {
      if (this.files.length === 0) {
        return `<div style="text-align: center; padding: 30px; font-size: 13px; color: var(--text-muted);">No files stored in PostgreSQL yet. Use the chat (+) button to upload documents, images, or videos.</div>`;
      }

      return `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${this.files.map((f) => `
            <div style="background: var(--bg-secondary); border: 1px solid var(--border-medium); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 18px;">📄</span>
                  <div>
                    <div style="font-size: 13px; font-weight: 600; color: var(--text-primary);">${this.escapeHtml(f.filename)}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">${f.fileType} • ${f.size}</div>
                  </div>
                </div>
                <div style="display: flex; gap: 6px;">
                  <button class="btn-download-file-db" data-file-id="${f.id}" data-filename="${this.escapeHtml(f.filename)}" style="display: flex; align-items: center; gap: 5px; padding: 4px 10px; font-size: 11.5px; border-radius: 6px; background: #0d0d0d; color: #fff; cursor: pointer;">
                    <span>⬇️ Download (BYTEA)</span>
                  </button>
                </div>
              </div>

              <!-- Metadata Format View -->
              <details style="margin-top: 4px; font-size: 11px;">
                <summary style="cursor: pointer; color: var(--brand-indigo); font-weight: 500;">View PostgreSQL JSONB Metadata</summary>
                <pre style="background: #111; color: #10a37f; padding: 8px; border-radius: 6px; overflow-x: auto; margin-top: 6px;">${this.escapeHtml(JSON.stringify(f.metadata || {}, null, 2))}</pre>
              </details>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (this.activeTab === 'progress') {
      if (this.tasks.length === 0) {
        return `<div style="text-align: center; padding: 30px; font-size: 13px; color: var(--text-muted);">No task progress records in PostgreSQL. Execute chat queries or upload files to track live progress.</div>`;
      }

      return `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${this.tasks.map((t) => `
            <div style="background: var(--bg-secondary); border: 1px solid var(--border-medium); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <span style="font-size: 12px; font-weight: 600; color: var(--text-primary);">${this.escapeHtml(t.task_type)}</span>
                  <span style="font-size: 11px; color: var(--text-muted); margin-left: 6px;">Stage: ${this.escapeHtml(t.stage)}</span>
                </div>
                <span style="font-size: 10.5px; padding: 2px 6px; border-radius: 4px; font-weight: 600; background: ${t.status === 'completed' ? '#e6f7f2' : '#eff6ff'}; color: ${t.status === 'completed' ? '#10a37f' : '#2563eb'};">
                  ${t.status.toUpperCase()}
                </span>
              </div>

              <!-- Progress Bar -->
              <div style="width: 100%; height: 6px; background: rgba(0,0,0,0.06); border-radius: 3px; overflow: hidden; margin: 4px 0;">
                <div style="width: ${t.progress_percent}%; height: 100%; background: #10a37f; transition: width 0.3s;"></div>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted);">
                <span>${this.escapeHtml(t.message || '')}</span>
                <span>${t.progress_percent}%</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (this.activeTab === 'sessions') {
      if (this.sessions.length === 0) {
        return `<div style="text-align: center; padding: 30px; font-size: 13px; color: var(--text-muted);">No session records logged yet.</div>`;
      }

      return `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${this.sessions.map((s) => `
            <div style="background: var(--bg-secondary); border: 1px solid var(--border-medium); border-radius: 8px; padding: 10px; font-size: 12px; display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-weight: 600; color: var(--text-primary);">Logged In: ${s.login_time ? new Date(s.login_time).toLocaleString() : 'N/A'}</div>
                <div style="font-size: 11px; color: var(--text-muted);">IP: ${s.ip_address || 'Localhost'} • Session ID: ${s.id}</div>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 11px; font-weight: 600; color: ${s.is_active ? '#10a37f' : 'var(--text-muted)'};">
                  ${s.is_active ? 'Active' : `Duration: ${s.duration_seconds || 0}s`}
                </span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    return '';
  }

  bindEvents() {
    const overlay = this.container.querySelector('#db-modal-overlay');
    const closeBtn = this.container.querySelector('#btn-close-db-modal');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.close();
      });
    }
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());

    this.container.querySelectorAll('[data-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tab;
        this.render();
      });
    });

    this.container.querySelectorAll('.btn-download-file-db').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const fileId = btn.dataset.fileId;
        const filename = btn.dataset.filename;
        btn.disabled = true;
        btn.innerText = 'Downloading...';
        await api.downloadFile(fileId, filename);
        btn.disabled = false;
        btn.innerText = '⬇️ Download (BYTEA)';
      });
    });
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
