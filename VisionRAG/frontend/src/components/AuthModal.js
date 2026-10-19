// AuthModal Component: Create Account & Sign In

import { store } from '../store/state.js';

export class AuthModal {
  constructor(containerEl) {
    this.container = containerEl;
    this.mode = 'signup'; // 'signup' or 'login'
  }

  open(mode = 'signup') {
    this.mode = mode;
    this.render();
  }

  close() {
    this.container.innerHTML = '';
  }

  render() {
    const isSignup = this.mode === 'signup';

    this.container.innerHTML = `
      <div class="auth-modal-overlay" id="auth-overlay">
        <div class="auth-card">
          <div class="auth-header-bar">
            <div class="auth-title">${isSignup ? 'Create your account' : 'Welcome back'}</div>
            <button class="action-icon-btn" id="btn-close-auth" title="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="auth-tabs-toggle">
            <button class="auth-tab-btn ${isSignup ? 'active' : ''}" id="tab-signup">Create Account</button>
            <button class="auth-tab-btn ${!isSignup ? 'active' : ''}" id="tab-login">Log In</button>
          </div>

          <form class="auth-form" id="auth-form">
            ${
              isSignup
                ? `
              <div class="auth-input-group">
                <label class="auth-input-label">Full Name</label>
                <input type="text" class="auth-input-field" id="auth-name" placeholder="Alex Rivera" required />
              </div>
            `
                : ''
            }

            <div class="auth-input-group">
              <label class="auth-input-label">Email address</label>
              <input type="email" class="auth-input-field" id="auth-email" placeholder="name@example.com" required />
            </div>

            <div class="auth-input-group">
              <label class="auth-input-label">Password</label>
              <input type="password" class="auth-input-field" id="auth-password" placeholder="••••••••" required />
            </div>

            <button type="submit" class="auth-submit-btn">
              ${isSignup ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div class="auth-divider-row">
            <div class="auth-divider-line"></div>
            <span>OR</span>
            <div class="auth-divider-line"></div>
          </div>

          <button class="auth-social-btn" id="btn-auth-google">
            <svg width="17" height="17" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <button class="auth-social-btn" id="btn-auth-github">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span>Continue with GitHub</span>
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
        this.render();
      });
    }
    if (tabLogin) {
      tabLogin.addEventListener('click', () => {
        this.mode = 'login';
        this.render();
      });
    }

    const form = this.container.querySelector('#auth-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = this.container.querySelector('#auth-email').value;
        const nameInput = this.container.querySelector('#auth-name');
        const name = nameInput ? nameInput.value : email.split('@')[0];

        store.setUser({
          loggedIn: true,
          name: name,
          email: email,
          avatar: name.slice(0, 2).toUpperCase()
        });

        this.close();
      });
    }

    const googleBtn = this.container.querySelector('#btn-auth-google');
    if (googleBtn) {
      googleBtn.addEventListener('click', () => {
        store.setUser({
          loggedIn: true,
          name: 'Google User',
          email: 'user@gmail.com',
          avatar: 'GU'
        });
        this.close();
      });
    }

    const githubBtn = this.container.querySelector('#btn-auth-github');
    if (githubBtn) {
      githubBtn.addEventListener('click', () => {
        store.setUser({
          loggedIn: true,
          name: 'GitHub User',
          email: 'user@github.com',
          avatar: 'GH'
        });
        this.close();
      });
    }
  }
}
