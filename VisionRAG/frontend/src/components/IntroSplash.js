// Minimalist Intro Animation: 2 Dots Moving Like Eyes

export class IntroSplash {
  constructor() {
    this.splashEl = document.getElementById('intro-splash');
    this.appEl = document.getElementById('app');
    this.timer = null;
    this.hasDismissed = false;
  }

  init() {
    if (!this.splashEl) return;

    // Two dots look around, blink, and smoothly open the web app after 2.2s
    this.timer = setTimeout(() => {
      this.dismiss();
    }, 2200);
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
    }, 2200);
  }
}
