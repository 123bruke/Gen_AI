// SourceModal Component: Visual Grounding & Bounding Box Inspector

export class SourceModal {
  constructor(containerEl) {
    this.container = containerEl;
  }

  open(source) {
    this.render(source);
  }

  close() {
    this.container.innerHTML = '';
  }

  render(source) {
    const isVideo = source.type === 'video';
    const isPdf = source.type === 'pdf';

    this.container.innerHTML = `
      <div class="video-mode-modal" id="source-modal-overlay">
        <div class="source-inspector-card">
          <div class="modal-header-bar">
            <div class="modal-title" style="display: flex; align-items: center; gap: 8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-indigo)" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <span>Grounding Inspector: ${this.escapeHtml(source.title)}</span>
            </div>
            <button class="action-icon-btn" id="btn-close-source-modal" title="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="inspector-body">
            <div class="inspector-meta-grid">
              <div class="meta-box">
                <div class="meta-box-label">Modality</div>
                <div class="meta-box-val" style="text-transform: uppercase;">${source.type}</div>
              </div>
              <div class="meta-box">
                <div class="meta-box-label">${isVideo ? 'Timestamp' : 'Page Number'}</div>
                <div class="meta-box-val">${source.page}</div>
              </div>
              <div class="meta-box">
                <div class="meta-box-label">Neural Confidence</div>
                <div class="meta-box-val" style="color: var(--brand-green);">${source.matchScore}% Match</div>
              </div>
            </div>

            <!-- Simulated Visual Bounding Box / Keyframe Preview -->
            <div style="position: relative; width: 100%; height: 160px; background: #f3f4f6; border-radius: var(--radius-md); border: 1px dashed var(--border-medium); overflow: hidden; display: flex; align-items: center; justify-content: center;">
              <div style="font-size: 12px; color: var(--text-muted); text-align: center;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 6px; opacity: 0.6;">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <div>Grounding Bounding Box [${source.bbox ? source.bbox.join(', ') : '120, 240, 500, 680'}]</div>
              </div>
              <!-- Target highlight box -->
              <div style="position: absolute; top: 20%; left: 25%; width: 50%; height: 60%; border: 2px solid var(--brand-indigo); background: rgba(79, 70, 229, 0.08); border-radius: 4px;">
                <span style="position: absolute; top: -18px; left: 0; background: var(--brand-indigo); color: #fff; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 3px;">
                  Active Retrieval Patch
                </span>
              </div>
            </div>

            <!-- Extracted Chunk Content -->
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <span style="font-size: 12px; font-weight: 600; color: var(--text-secondary);">Extracted Text & Metadata Chunk:</span>
              <div class="inspector-chunk-box">
                ${this.escapeHtml(source.chunk || 'No raw chunk available.')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const closeBtn = this.container.querySelector('#btn-close-source-modal');
    const overlay = this.container.querySelector('#source-modal-overlay');

    if (closeBtn) closeBtn.addEventListener('click', () => this.close());
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.close();
      });
    }
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
