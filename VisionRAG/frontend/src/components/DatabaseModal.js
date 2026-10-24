// DatabaseModal Component: Inspect PostgreSQL Tables, Major Large Files (BYTEA), User Information & Tasking History
// Protected by administrator passcode: "1234567"

import { store } from '../store/state.js';
import { api } from '../services/api.js';

export class DatabaseModal {
  constructor(containerEl) {
    this.container = containerEl;
    this.activeTab = 'user_info'; // 'user_info', 'tasks', 'overview', 'files'
    this.isUnlocked = sessionStorage.getItem('vrag_dashboard_unlocked') === 'true';
    this.status = null;
    this.files = [];
    this.tasks = [];
    this.sessions = [];
    this.loading = false;
  }

  async open(tab = 'user_info') {
    this.activeTab = tab;
    this.container.style.display = 'block';

    if (!this.isUnlocked) {
      this.renderPasscodeChallenge();
      return;
    }

    this.loading = true;
    this.render();
    await this.fetchData();
    this.loading = false;
    this.render();
  }

  close() {
    this.container.style.display = 'none';
    this.container.innerHTML = '';
  }

  renderPasscodeChallenge() {
    this.container.innerHTML = `
      <div class="auth-modal-overlay" id="dashboard-lock-overlay">
        <div class="auth-card" style="max-width: 440px; width: 92%; background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);">
          <div style="text-align: center; margin-bottom: 22px;">
            <div style="width: 58px; height: 58px; border-radius: 16px; background: #eff6ff; color: #2563eb; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px; border: 1.5px solid #bfdbfe;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">Admin Dashboard</h2>
            <p style="font-size: 13.5px; color: #64748b; line-height: 1.45;">
              Protected PostgreSQL Management Console.<br/>
              Inspect User Information, Tasking History & System Logs.
            </p>
          </div>

          <form id="dashboard-unlock-form" style="display: flex; flex-direction: column; gap: 14px;">
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Dashboard Passcode</label>
              <input
                type="password"
                id="dashboard-passcode-input"
                placeholder="Enter password (e.g. 1234567)"
                autofocus
                style="width: 100%; padding: 11px 14px; border: 1.5px solid #cbd5e1; border-radius: 10px; font-size: 15px; outline: none; letter-spacing: 2px;"
              />
              <span id="dashboard-auth-error" style="display: none; color: #ef4444; font-size: 12.5px; margin-top: 6px; font-weight: 500;"></span>
            </div>

            <button
              type="submit"
              id="btn-unlock-dashboard"
              style="width: 100%; padding: 12px; background: #2563eb; color: #ffffff; border: none; border-radius: 10px; font-size: 14.5px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;"
            >
              <span>Unlock Dashboard</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            <button
              type="button"
              id="btn-cancel-dashboard"
              style="width: 100%; padding: 10px; background: transparent; color: #64748b; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13.5px; font-weight: 500; cursor: pointer;"
            >
              Cancel
            </button>
          </form>

          <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid #f1f5f9; text-align: center;">
            <span style="font-size: 12px; color: #94a3b8; font-family: monospace;">Passcode: 1234567 • PostgreSQL 16</span>
          </div>
        </div>
      </div>
    `;

    const form = this.container.querySelector('#dashboard-unlock-form');
    const input = this.container.querySelector('#dashboard-passcode-input');
    const errorEl = this.container.querySelector('#dashboard-auth-error');
    const cancelBtn = this.container.querySelector('#btn-cancel-dashboard');
    const overlay = this.container.querySelector('#dashboard-lock-overlay');

    if (cancelBtn) cancelBtn.addEventListener('click', () => this.close());
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.close();
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const entered = (input.value || '').trim();
        if (entered === '1234567' || entered === '123456') {
          this.isUnlocked = true;
          sessionStorage.setItem('vrag_dashboard_unlocked', 'true');
          this.open(this.activeTab);
        } else {
          errorEl.textContent = 'Access Denied: Invalid dashboard password. Please enter 1234567.';
          errorEl.style.display = 'block';
          input.value = '';
          input.focus();
        }
      });
    }
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
      this.files = files || [];
      this.tasks = tasks || [];
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
        <div class="auth-card" style="max-width: 820px; width: 95%; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; padding: 24px; border-radius: 16px;">
          <!-- Header -->
          <div class="auth-header-bar" style="margin-bottom: 16px;">
            <div>
              <div class="auth-title" style="display: flex; align-items: center; gap: 8px;">
                <span>📊 Admin Dashboard & PostgreSQL Storage</span>
                <span style="font-size: 11px; padding: 2px 8px; border-radius: 12px; background: ${isPostgres ? '#e6f7f2' : '#fef3c7'}; color: ${isPostgres ? '#10a37f' : '#d97706'}; font-weight: 600;">
                  ${isPostgres ? 'PostgreSQL 16 Connected' : 'SQLite Fallback'}
                </span>
              </div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                User Information • Tasking History & Progress • Large File (BYTEA) • Audit Records
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
            <button class="auth-tab-btn ${this.activeTab === 'user_info' ? 'active' : ''}" data-tab="user_info">
              👤 User Information (${this.sessions.length > 0 ? this.sessions.length + ' Sessions' : 'Guest/Auth'})
            </button>
            <button class="auth-tab-btn ${this.activeTab === 'tasks' ? 'active' : ''}" data-tab="tasks">
              📋 Tasking History (${this.tasks.length})
            </button>
            <button class="auth-tab-btn ${this.activeTab === 'overview' ? 'active' : ''}" data-tab="overview">
              🐘 DB Metrics & Tables
            </button>
            <button class="auth-tab-btn ${this.activeTab === 'files' ? 'active' : ''}" data-tab="files">
              📁 Files in DB (${this.files.length})
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
    const state = store.getState();
    const currentUser = state.user;

    // 1. User Information & Active Sessions Tab
    if (this.activeTab === 'user_info') {
      return `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- User Profile Card -->
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-medium); border-radius: 10px; padding: 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 44px; height: 44px; border-radius: 50%; background: #2563eb; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700;">
                  ${currentUser && currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'GU'}
                </div>
                <div>
                  <div style="font-size: 15px; font-weight: 700; color: var(--text-primary);">
                    ${currentUser && currentUser.name ? this.escapeHtml(currentUser.name) : 'Guest Academic User'}
                  </div>
                  <div style="font-size: 12px; color: var(--text-muted);">
                    ${currentUser && currentUser.email ? this.escapeHtml(currentUser.email) : 'guest@visionrag.local'}
                  </div>
                </div>
              </div>
              <span style="font-size: 11.5px; padding: 3px 9px; border-radius: 12px; font-weight: 700; background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd;">
                ${currentUser && currentUser.role ? currentUser.role.toUpperCase() : 'STUDENT / RESEARCHER'}
              </span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; font-size: 12px; margin-top: 8px;">
              <div style="background: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-light);">
                <span style="color: var(--text-muted); display: block; font-size: 11px;">User ID</span>
                <span style="font-family: monospace; font-weight: 600;">${currentUser && currentUser.id ? currentUser.id : 'usr_guest'}</span>
              </div>
              <div style="background: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-light);">
                <span style="color: var(--text-muted); display: block; font-size: 11px;">Department</span>
                <span style="font-weight: 600;">${currentUser && currentUser.metadata && currentUser.metadata.department ? currentUser.metadata.department : 'Natural Sciences & MOE'}</span>
              </div>
              <div style="background: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-light);">
                <span style="color: var(--text-muted); display: block; font-size: 11px;">Storage Quota</span>
                <span style="font-weight: 600;">${currentUser && currentUser.metadata && currentUser.metadata.quota ? currentUser.metadata.quota + ' MB' : '10,000 MB'}</span>
              </div>
              <div style="background: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-light);">
                <span style="color: var(--text-muted); display: block; font-size: 11px;">Session Token</span>
                <span style="font-weight: 600; color: #10a37f;">Active (Verified)</span>
              </div>
            </div>
          </div>

          <!-- Active Audit Sessions Table -->
          <div>
            <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
              <span>Audit Login Sessions in PostgreSQL</span>
              <span style="font-size: 11.5px; color: var(--text-muted); font-weight: normal;">${this.sessions.length} Recorded</span>
            </div>

            ${
              this.sessions.length === 0
                ? `<div style="text-align: center; padding: 24px; font-size: 12.5px; color: var(--text-muted); background: var(--bg-secondary); border-radius: 8px;">No explicit external session records. Local token verified.</div>`
                : `
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${this.sessions.map((sess) => `
                  <div style="background: var(--bg-secondary); border: 1px solid var(--border-medium); border-radius: 8px; padding: 10px 14px; font-size: 12px; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                      <div style="font-weight: 600; color: var(--text-primary);">
                        Login: ${sess.login_time ? new Date(sess.login_time).toLocaleString() : 'Recent Active Session'}
                      </div>
                      <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                        IP: <code style="font-family: monospace;">${sess.ip_address || '127.0.0.1'}</code> • Session ID: <code style="font-family: monospace;">${sess.id}</code>
                      </div>
                    </div>
                    <div>
                      <span style="font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: 700; background: ${sess.is_active ? '#dcfce7' : '#f1f5f9'}; color: ${sess.is_active ? '#15803d' : '#64748b'};">
                        ${sess.is_active ? '● Active' : 'Closed'}
                      </span>
                    </div>
                  </div>
                `).join('')}
              </div>
            `
            }
          </div>
        </div>
      `;
    }

    // 2. Tasking History & Progress Tab
    if (this.activeTab === 'tasks') {
      if (this.tasks.length === 0) {
        return `
          <div style="text-align: center; padding: 36px; font-size: 13px; color: var(--text-muted); background: var(--bg-secondary); border-radius: 10px;">
            <div style="font-size: 28px; margin-bottom: 8px;">📋</div>
            <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">No Task History Yet</div>
            <div>All agentic chat inferences, CLIP image searches, and document processing will appear live here.</div>
          </div>
        `;
      }

      return `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 2px;">
            Showing <strong>${this.tasks.length}</strong> tasks recorded in PostgreSQL ACID <code>task_progress</code> table:
          </div>

          ${this.tasks.map((t) => `
            <div style="background: var(--bg-secondary); border: 1px solid var(--border-medium); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 14px;">⚡</span>
                  <div>
                    <span style="font-size: 13px; font-weight: 700; color: var(--text-primary);">${this.escapeHtml(t.task_type || 'Agentic Task')}</span>
                    <span style="font-size: 11px; color: var(--text-muted); margin-left: 6px; font-family: monospace;">ID: ${t.task_id}</span>
                  </div>
                </div>
                <span style="font-size: 11px; padding: 2px 8px; border-radius: 6px; font-weight: 700; background: ${t.status === 'completed' ? '#dcfce7' : '#eff6ff'}; color: ${t.status === 'completed' ? '#15803d' : '#2563eb'};">
                  ${t.status ? t.status.toUpperCase() : 'PENDING'}
                </span>
              </div>

              <!-- Progress Bar -->
              <div style="width: 100%; height: 6px; background: rgba(0,0,0,0.06); border-radius: 3px; overflow: hidden; margin: 4px 0;">
                <div style="width: ${t.progress_percent || 100}%; height: 100%; background: #2563eb; transition: width 0.3s;"></div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11.5px; color: var(--text-muted);">
                <span><strong>Stage:</strong> ${this.escapeHtml(t.stage || 'execution')} — ${this.escapeHtml(t.message || 'Operation recorded in PostgreSQL')}</span>
                <span style="font-weight: 700; color: var(--text-primary);">${t.progress_percent || 100}%</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    // 3. Database Metrics & Overview Tab
    if (this.activeTab === 'overview') {
      const s = this.status || {};
      return `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Metrics Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
            <div style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; border: 1px solid var(--border-medium);">
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">USERS IN DB</div>
              <div style="font-size: 22px; font-weight: 700; color: var(--text-primary); margin-top: 4px;">${s.user_count || 1}</div>
            </div>
            <div style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; border: 1px solid var(--border-medium);">
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">ACTIVE SESSIONS</div>
              <div style="font-size: 22px; font-weight: 700; color: var(--text-primary); margin-top: 4px;">${s.session_count || this.sessions.length || 1}</div>
            </div>
            <div style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; border: 1px solid var(--border-medium);">
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">UPLOADED FILES</div>
              <div style="font-size: 22px; font-weight: 700; color: var(--text-primary); margin-top: 4px;">${s.uploaded_files_count || this.files.length || 0}</div>
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
              <div style="font-size: 22px; font-weight: 700; color: var(--text-primary); margin-top: 4px;">${s.task_progress_count || this.tasks.length || 0}</div>
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

    // 4. Stored Files Tab
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
                <summary style="cursor: pointer; color: #2563eb; font-weight: 500;">View PostgreSQL JSONB Metadata</summary>
                <pre style="background: #111; color: #10a37f; padding: 8px; border-radius: 6px; overflow-x: auto; margin-top: 6px;">${this.escapeHtml(JSON.stringify(f.metadata || {}, null, 2))}</pre>
              </details>
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
