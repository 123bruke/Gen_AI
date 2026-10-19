// Axu Intro Animation Controller: Eye blinking, covered by 'O' circle, and 'Axu' title below

export class IntroSplash {
  constructor() {
    this.splashEl = document.getElementById('intro-splash');
    this.appEl = document.getElementById('app');
    this.timer = null;
    this.hasDismissed = false;
  }

  init() {
    if (!this.splashEl) return;

    // Allow clicking anywhere on splash to skip immediately
    this.splashEl.addEventListener('click', () => this.dismiss());

    // Auto dismiss after animation cycle (2.9s)
    this.timer = setTimeout(() => {
      this.dismiss();
    }, 2900);
  }

  dismiss() {
    if (this.hasDismissed) return;
    this.hasDismissed = true;
    if (this.timer) clearTimeout(this.timer);

    if (this.splashEl) {
      this.splashEl.classList.add('fade-out');
      setTimeout(() => {
        this.splashEl.style.display = 'none';
      }, 600);
    }

    if (this.appEl) {
      this.appEl.classList.remove('app-hidden');
    }
  }

  replay() {
    this.hasDismissed = false;
    if (this.splashEl) {
      this.splashEl.style.display = 'flex';
      this.splashEl.classList.remove('fade-out');
    }
    if (this.appEl) {
      this.appEl.classList.add('app-hidden');
    }

    this.timer = setTimeout(() => {
      this.dismiss();
    }, 2900);
  }
}
