// AuthModal Component: Create Account & Sign In with PostgreSQL Database Persistence

import { store } from '../store/state.js';
import { api } from '../services/api.js';

export class AuthModal {
  constructor(containerEl) {
    this.container = containerEl;
    this.mode = 'signup'; // 'signup' or 'login'
    this.loading = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  open(mode = 'signup') {
    this.mode = mode;
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = false;
    this.render();
  }

  close() {
    this.container.innerHTML = '';
  }

  render() {
    const isSignup = this.mode === 'signup';

    this.container.innerHTML = `
      <div class="auth-modal-overlay" id="auth-overlay">
        <div class="auth-card" style="max-width: 440px;">
          <div class="auth-header-bar">
            <div>
              <div class="auth-title">${isSignup ? 'Create VisionRAG Account' : 'Welcome Back'}</div>
              <div style="font-size: 11.5px; color: #10a37f; margin-top: 2px; display: flex; align-items: center; gap: 5px;">
                <span style="display:inline-block; width: 7px; height: 7px; border-radius: 50%; background: #10a37f;"></span>
                <span>PostgreSQL 16 Primary Database Online</span>
              </div>
            </div>
            <button class="action-icon-btn" id="btn-close-auth" title="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="auth-tabs-toggle">
            <button class="auth-tab-btn ${isSignup ? 'active' : ''}" id="tab-signup">Create Account</button>
            <button class="auth-tab-btn ${!isSignup ? 'active' : ''}" id="tab-login">Sign In</button>
          </div>

          ${
            this.errorMessage
              ? `<div id="auth-error-msg" style="color: #ef4444; font-size: 12px; margin-bottom: 12px; padding: 8px 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 6px;">
                  ⚠️ ${this.escapeHtml(this.errorMessage)}
                </div>`
              : ''
          }

          ${
            this.successMessage
              ? `<div id="auth-success-msg" style="color: #10a37f; font-size: 12px; margin-bottom: 12px; padding: 8px 12px; background: rgba(16, 163, 127, 0.1); border: 1px solid rgba(16, 163, 127, 0.2); border-radius: 6px;">
                  ✓ ${this.escapeHtml(this.successMessage)}
                </div>`
              : ''
          }

          <form class="auth-form" id="auth-form">
            ${
              isSignup
                ? `
              <div class="auth-input-group">
                <label class="auth-input-label">Full Name</label>
                <input type="text" class="auth-input-field" id="auth-name" placeholder="Dr. Elena Vance" required ${this.loading ? 'disabled' : ''} />
              </div>

              <div class="auth-input-group">
                <label class="auth-input-label">Department / Organization (Stored as Metadata)</label>
                <input type="text" class="auth-input-field" id="auth-department" placeholder="Multimodal AI Research Lab" ${this.loading ? 'disabled' : ''} />
              </div>
            `
                : ''
            }

            <div class="auth-input-group">
              <label class="auth-input-label">Email Address</label>
              <input type="email" class="auth-input-field" id="auth-email" placeholder="elena.vance@visionrag.ai" required ${this.loading ? 'disabled' : ''} />
            </div>

            <div class="auth-input-group">
              <label class="auth-input-label">Password</label>
              <input type="password" class="auth-input-field" id="auth-password" placeholder="••••••••" required minlength="6" ${this.loading ? 'disabled' : ''} />
            </div>

            <button type="submit" class="auth-submit-btn" ${this.loading ? 'disabled' : ''}>
              ${this.loading ? (isSignup ? 'Registering in PostgreSQL...' : 'Authenticating...') : (isSignup ? 'Create Account & Save to PostgreSQL' : 'Sign In')}
            </button>
          </form>

          <div class="auth-divider-row">
            <div class="auth-divider-line"></div>
            <span>OR QUICK START</span>
            <div class="auth-divider-line"></div>
          </div>

          <button class="auth-social-btn" id="btn-auth-demo">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <polyline points="16 11 18 13 22 9"></polyline>
            </svg>
            <span>Quick Demo Auto-Fill (Researcher)</span>
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const overlay = this.container.querySelector('#auth-overlay');
    const closeBtn = this.container.querySelector('#btn-close-auth');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.close();
      });
    }
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());

    const tabSignup = this.container.querySelector('#tab-signup');
    const tabLogin = this.container.querySelector('#tab-login');
    if (tabSignup) {
      tabSignup.addEventListener('click', () => {
        this.mode = 'signup';
        this.errorMessage = '';
        this.successMessage = '';
        this.render();
      });
    }
    if (tabLogin) {
      tabLogin.addEventListener('click', () => {
        this.mode = 'login';
        this.errorMessage = '';
        this.successMessage = '';
        this.render();
      });
    }

    const form = this.container.querySelector('#auth-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = this.container.querySelector('#auth-email').value.trim();
        const password = this.container.querySelector('#auth-password').value;
        const nameInput = this.container.querySelector('#auth-name');
        const deptInput = this.container.querySelector('#auth-department');
        const fullName = nameInput ? nameInput.value.trim() : email.split('@')[0];
        const department = deptInput ? deptInput.value.trim() : 'Computer Vision Lab';

        this.loading = true;
        this.errorMessage = '';
        this.successMessage = '';
        this.render();

        try {
          let res;
          if (this.mode === 'signup') {
            const metadata = {
              department: department,
              role: 'researcher',
              quota: 10000,
              theme: 'white',
              created_from: 'web_portal'
            };
            res = await api.register(fullName, email, password, metadata);
          } else {
            res = await api.login(email, password);
          }

          if (res && res.user) {
            store.setUser({
              loggedIn: true,
              id: res.user.id,
              name: res.user.full_name || fullName,
              email: res.user.email || email,
              token: res.token,
              role: res.user.role || 'user',
              metadata: res.user.metadata || {},
              avatar: res.user.avatar || (res.user.full_name ? res.user.full_name.slice(0, 2).toUpperCase() : 'U')
            });
            this.successMessage = 'Authentication successful! Saved in PostgreSQL.';
            setTimeout(() => this.close(), 600);
          }
        } catch (err) {
          console.error('Authentication Error:', err);
          this.loading = false;
          this.errorMessage = err.message || 'Authentication failed. Please verify credentials.';
          this.render();
        }
      });
    }

    const demoBtn = this.container.querySelector('#btn-auth-demo');
    if (demoBtn) {
      demoBtn.addEventListener('click', () => {
        const emailField = this.container.querySelector('#auth-email');
        const passField = this.container.querySelector('#auth-password');
        const nameField = this.container.querySelector('#auth-name');
        const deptField = this.container.querySelector('#auth-department');

        if (emailField) emailField.value = 'researcher@visionrag.ai';
        if (passField) passField.value = 'VisionRAG2026!';
        if (nameField) nameField.value = 'Dr. Elena Vance';
        if (deptField) deptField.value = 'Computer Vision & Deep Learning';
      });
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
