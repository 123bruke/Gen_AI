// EyeTracker: Real-time interactive cursor tracking for dual eye animations

class EyeTracker {
  constructor() {
    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;
    this.isTracking = false;
    this.rafId = null;
  }

  init() {
    if (this.isTracking) return;
    this.isTracking = true;

    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.scheduleUpdate();
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        this.mouseX = e.touches[0].clientX;
        this.mouseY = e.touches[0].clientY;
        this.scheduleUpdate();
      }
    });

    // Run an initial alignment
    this.scheduleUpdate();
  }

  scheduleUpdate() {
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => {
        this.updateEyes();
        this.rafId = null;
      });
    }
  }

  updateEyes() {
    const eyeSockets = document.querySelectorAll('.eye-socket, .mini-socket');
    if (!eyeSockets || eyeSockets.length === 0) return;

    for (const socket of eyeSockets) {
      const rect = socket.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;

      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      const dx = this.mouseX - eyeCenterX;
      const dy = this.mouseY - eyeCenterY;

      const angle = Math.atan2(dy, dx);
      const distance = Math.hypot(dx, dy);

      const isMini = socket.classList.contains('mini-socket');
      const maxTravelX = isMini ? 1.8 : 3.8;
      const maxTravelY = isMini ? 1.2 : 2.4;

      const travelX = Math.cos(angle) * Math.min(distance / 20, maxTravelX);
      const travelY = Math.sin(angle) * Math.min(distance / 20, maxTravelY);

      const pupil = socket.querySelector('.eye-dot-pupil, .mini-dot-pupil');
      if (pupil) {
        pupil.style.transform = `translate(${travelX.toFixed(2)}px, ${travelY.toFixed(2)}px)`;
      }
    }
  }
}

export const eyeTracker = new EyeTracker();
