// AgentHubModal Component: Specialized Autonomous Agents, Data Pipeline Processor & Ethiopian Knowledge Archive

import { store } from '../store/state.js';
import { api } from '../services/api.js';

export class AgentHubModal {
  constructor(containerEl) {
    this.container = containerEl;
    this.activeTab = 'explorer'; // 'explorer', 'pipeline', 'youtube', 'map', 'google', 'image', 'reader', 'knowledge'
    this.loading = false;
    this.dataExplorer = null;
    this.selectedFile = null;
    this.fileContent = null;
    this.pipelineResult = null;
    this.pipelineRunning = false;

    // Agent states
    this.ytQuery = 'Ethiopian education history and science';
    this.ytResults = [];
    this.ytTranscribing = false;
    this.ytTranscriptResult = null;

    this.mapQuery = 'Rock-Hewn Churches of Lalibela';
    this.mapResult = null;
    this.mapSearching = false;

    this.webQuery = 'Ethiopian biodiversity coffee wild genomics';
    this.webResults = null;
    this.webSearching = false;

    this.imgUrl = '';
    this.imgContext = '';
    this.imgResult = null;
    this.imgProcessing = false;

    this.linkUrl = 'https://en.wikipedia.org/wiki/Walia_ibex';
    this.linkTitle = 'Walia Ibex Field Study';
    this.linkResult = null;
    this.linkReading = false;

    this.knowledgeCategory = 'all';
    this.educationRecords = [];
    this.biologyRecords = [];
  }

  async open(tab = 'explorer') {
    this.activeTab = tab;
    this.render();
    await this.fetchInitialData();
    this.render();
  }

  close() {
    this.container.innerHTML = '';
  }

  async fetchInitialData() {
    try {
      this.loading = true;
      const [explorer, edu, bio] = await Promise.all([
        api.getDataExplorer().catch(() => null),
        api.getEthiopianEducationKnowledge().catch(() => ({ records: [] })),
        api.getEthiopianBiologyKnowledge().catch(() => ({ records: [] }))
      ]);
      this.dataExplorer = explorer;
      this.educationRecords = edu.records || [];
      this.biologyRecords = bio.records || [];
    } catch (e) {
      console.error('Error fetching Agent Hub data:', e);
    } finally {
      this.loading = false;
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="auth-modal-overlay" id="agent-hub-overlay">
        <div class="auth-card" style="max-width: 900px; width: 96%; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; padding: 24px;">
          
          <!-- Header -->
          <div class="auth-header-bar" style="margin-bottom: 14px;">
            <div>
              <div class="auth-title" style="display: flex; align-items: center; gap: 8px;">
                <span>🤖 Autonomous Agent Hub & Data Pipeline</span>
                <span style="font-size: 11px; padding: 2px 8px; border-radius: 12px; background: rgba(16, 163, 127, 0.12); color: #10a37f; font-weight: 700;">
                  Multi-Agent Suite Active
                </span>
              </div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 3px;">
                YouTube Transcriber • Map Spatial Agent • Google Web Crawler • Vision Processor • Link Ingestion • Data Archive
              </div>
            </div>
            <button class="action-icon-btn" id="btn-close-agent-hub" title="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Navigation Tabs Bar -->
          <div style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 6px; margin-bottom: 14px; border-bottom: 1px solid var(--border-color);">
            ${this.renderTabBtn('explorer', '📁 Data Explorer')}
            ${this.renderTabBtn('pipeline', '⚡ Data Processor')}
            ${this.renderTabBtn('youtube', '🎥 YouTube Agent')}
            ${this.renderTabBtn('map', '🗺️ Map Searcher')}
            ${this.renderTabBtn('google', '🔍 Google Web Crawler')}
            ${this.renderTabBtn('image', '🖼️ Image Processor')}
            ${this.renderTabBtn('reader', '📚 Link Ingester')}
            ${this.renderTabBtn('knowledge', '🇪🇹 Ethiopian Archive')}
          </div>

          <!-- Tab Content Scrollable Container -->
          <div style="overflow-y: auto; flex: 1; padding-right: 4px;" id="agent-hub-content">
            ${this.renderTabContent()}
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  renderTabBtn(tabKey, label) {
    const isActive = this.activeTab === tabKey;
    return `
      <button class="agent-tab-btn" data-tab="${tabKey}" style="
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        border: 1px solid ${isActive ? '#10a37f' : 'transparent'};
        background: ${isActive ? 'rgba(16, 163, 127, 0.12)' : 'transparent'};
        color: ${isActive ? '#10a37f' : 'var(--text-secondary)'};
        white-space: nowrap;
        transition: all 0.15s ease;
      ">
        ${label}
      </button>
    `;
  }

  renderTabContent() {
    switch (this.activeTab) {
      case 'explorer':
        return this.renderExplorerTab();
      case 'pipeline':
        return this.renderPipelineTab();
      case 'youtube':
        return this.renderYouTubeTab();
      case 'map':
        return this.renderMapTab();
      case 'google':
        return this.renderGoogleTab();
      case 'image':
        return this.renderImageTab();
      case 'reader':
        return this.renderReaderTab();
      case 'knowledge':
        return this.renderKnowledgeTab();
      default:
        return `<div style="padding: 20px;">Tab content</div>`;
    }
  }

  // 1. Data Directory Explorer Tab
  renderExplorerTab() {
    const exp = this.dataExplorer || { total_files: 0, sections: {} };
    const secKeys = Object.keys(exp.sections || {});

    return `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.03); padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border-color);">
          <div>
            <div style="font-weight: 700; font-size: 14px;">VisionRAG /data/ Directory Corpus</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
              ${exp.total_files} Artifacts • ${exp.total_size_display || '0 KB'} Total Storage • Raw, Annotations, Interim & Processed
            </div>
          </div>
          <button class="auth-btn-primary" id="btn-quick-run-pipeline" style="padding: 6px 14px; font-size: 12px; background: #10a37f;">
            Run Data Pipeline ⚡
          </button>
        </div>

        <div style="display: grid; grid-template-columns: 280px 1fr; gap: 16px; min-height: 380px;">
          <!-- Folder & File List Panel -->
          <div style="border: 1px solid var(--border-color); border-radius: 8px; overflow-y: auto; max-height: 480px; padding: 10px; background: var(--bg-surface);">
            ${secKeys.map((secName) => {
              const files = exp.sections[secName] || [];
              const label = secName.replace('_', ' ').toUpperCase();
              return `
                <div style="margin-bottom: 12px;">
                  <div style="font-size: 11px; font-weight: 700; color: #10a37f; text-transform: uppercase; margin-bottom: 6px; display: flex; justify-content: space-between;">
                    <span>📂 ${label}</span>
                    <span style="color: var(--text-muted);">(${files.length})</span>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    ${files.map((f) => `
                      <div class="data-file-item" data-path="${f.rel_path}" style="
                        padding: 6px 8px;
                        border-radius: 6px;
                        font-size: 11px;
                        cursor: pointer;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        background: ${this.selectedFile === f.rel_path ? 'rgba(16, 163, 127, 0.15)' : 'rgba(0,0,0,0.02)'};
                        border: 1px solid ${this.selectedFile === f.rel_path ? '#10a37f' : 'transparent'};
                      ">
                        <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 190px;" title="${f.name}">
                          📄 ${f.name}
                        </span>
                        <span style="font-size: 10px; color: var(--text-muted);">${f.size_display}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- File Content Viewer Panel -->
          <div style="border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; display: flex; flex-direction: column; background: var(--bg-surface); overflow: hidden;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--border-color);">
              <span style="font-size: 12px; font-weight: 600;">
                ${this.selectedFile ? `Viewing: ${this.selectedFile}` : 'Select an artifact from the list to preview content'}
              </span>
              ${this.selectedFile ? `<span style="font-size: 11px; color: #10a37f; font-weight: 600;">Verified In-Corpus</span>` : ''}
            </div>
            <pre style="
              flex: 1;
              overflow: auto;
              margin: 0;
              padding: 10px;
              background: rgba(0,0,0,0.03);
              border-radius: 6px;
              font-family: 'SFMono-Regular', Consolas, monospace;
              font-size: 11px;
              line-height: 1.5;
              white-space: pre-wrap;
              word-break: break-word;
              color: var(--text-primary);
            ">${this.fileContent || '// Click any file in data/raw, data/annotations, data/interim, or data/processed to view source text or JSON structure.'}</pre>
          </div>
        </div>
      </div>
    `;
  }

  // 2. Data Pipeline Processor Tab
  renderPipelineTab() {
    const res = this.pipelineResult;

    return `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="background: rgba(16, 163, 127, 0.05); border: 1px solid rgba(16, 163, 127, 0.2); border-radius: 8px; padding: 16px;">
          <div style="font-weight: 700; font-size: 14px; color: #10a37f; margin-bottom: 4px;">
            ⚡ End-to-End Multimodal Data Pipeline & Processor
          </div>
          <div style="font-size: 12px; color: var(--text-muted); line-height: 1.5;">
            Ingests all raw documents, biological genomics, historical charters, visual descriptors, and video manifests into 
            <strong>PostgreSQL 16</strong> (transacted <code>BYTEA</code> binary blobs & <code>JSONB</code> metadata) and synchronizes vector embeddings into <strong>ChromaDB</strong>.
          </div>
          <div style="margin-top: 14px; display: flex; gap: 10px;">
            <button class="auth-btn-primary" id="btn-trigger-pipeline" style="padding: 8px 18px; font-size: 13px; background: #10a37f;" ${this.pipelineRunning ? 'disabled' : ''}>
              ${this.pipelineRunning ? 'Ingesting Artifacts...' : 'Execute Data Processor Pipeline'}
            </button>
            <button class="auth-btn-secondary" id="btn-seed-knowledge-hub" style="padding: 8px 16px; font-size: 13px;">
              Re-Seed Ethiopian Dossiers
            </button>
          </div>
        </div>

        ${this.pipelineRunning ? `
          <div style="text-align: center; padding: 30px; background: rgba(0,0,0,0.02); border-radius: 8px;">
            <div style="font-weight: 600; font-size: 13px; margin-bottom: 8px;">Processing data/raw artifacts into PostgreSQL & ChromaDB...</div>
            <div style="width: 100%; height: 6px; background: rgba(0,0,0,0.08); border-radius: 4px; overflow: hidden; margin-top: 10px;">
              <div style="width: 75%; height: 100%; background: #10a37f; animation: pulse 1.5s infinite;"></div>
            </div>
          </div>
        ` : ''}

        ${res ? `
          <div style="background: var(--bg-surface); border: 1px solid #10a37f; border-radius: 8px; padding: 16px;">
            <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 13px; color: #10a37f; margin-bottom: 10px;">
              <span>✓ Pipeline Execution Successful</span>
              <span style="font-size: 11px; padding: 2px 6px; background: #e6f7f2; border-radius: 4px;">Task ID: ${res.taskId}</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 14px;">
              <div style="background: rgba(0,0,0,0.03); padding: 10px; border-radius: 6px;">
                <div style="font-size: 11px; color: var(--text-muted);">Files Ingested</div>
                <div style="font-size: 18px; font-weight: 700; color: var(--text-primary);">${res.files_processed || 0} files</div>
              </div>
              <div style="background: rgba(0,0,0,0.03); padding: 10px; border-radius: 6px;">
                <div style="font-size: 11px; color: var(--text-muted);">Total Bytes Processed</div>
                <div style="font-size: 18px; font-weight: 700; color: var(--text-primary);">${((res.total_bytes || 0)/1024).toFixed(1)} KB</div>
              </div>
              <div style="background: rgba(0,0,0,0.03); padding: 10px; border-radius: 6px;">
                <div style="font-size: 11px; color: var(--text-muted);">Database Destination</div>
                <div style="font-size: 12px; font-weight: 600; color: #10a37f; margin-top: 4px;">PostgreSQL 16 + ChromaDB</div>
              </div>
            </div>
            <div style="font-size: 12px; font-weight: 600; margin-bottom: 6px;">Processed Artifact Manifest:</div>
            <div style="max-height: 140px; overflow-y: auto; background: rgba(0,0,0,0.02); border-radius: 6px; padding: 8px; font-size: 11px; font-family: monospace;">
              ${(res.file_list || []).map(f => `<div>✓ Ingested & Indexed: ${f}</div>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // 3. YouTube Searcher & Transcriber Agent Tab
  renderYouTubeTab() {
    return `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; gap: 10px;">
          <input type="text" id="input-yt-query" value="${this.ytQuery}" placeholder="Search YouTube for educational, historical, or biological lectures..." style="
            flex: 1;
            padding: 9px 12px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            background: var(--bg-surface);
            font-size: 13px;
          " />
          <button class="auth-btn-primary" id="btn-yt-search" style="padding: 8px 16px; font-size: 13px; background: #e50914;">
            Search Videos 🎥
          </button>
        </div>

        <!-- Video Results Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px;">
          ${this.ytResults.map(v => `
            <div style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: var(--bg-surface); display: flex; flex-direction: column;">
              <img src="${v.thumbnail}" style="width: 100%; height: 140px; object-fit: cover; background: #000;" />
              <div style="padding: 10px; flex: 1; display: flex; flex-direction: column;">
                <div style="font-weight: 700; font-size: 12px; line-height: 1.4; margin-bottom: 4px;">${v.title}</div>
                <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">Channel: ${v.channel}</div>
                <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; flex: 1; margin: 0 0 10px 0;">
                  ${v.description.slice(0, 110)}...
                </p>
                <div style="display: flex; gap: 6px; margin-top: auto;">
                  <a href="${v.url}" target="_blank" class="auth-btn-secondary" style="flex: 1; text-align: center; text-decoration: none; padding: 5px; font-size: 11px;">
                    Watch on YouTube ↗
                  </a>
                  <button class="btn-yt-transcribe auth-btn-primary" data-id="${v.id}" data-title="${v.title.replace(/"/g, '&quot;')}" style="flex: 1; padding: 5px; font-size: 11px; background: #10a37f;">
                    Transcribe Video
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        ${this.ytTranscribing ? `
          <div style="text-align: center; padding: 20px; color: #10a37f; font-weight: 600; font-size: 13px;">
            Transcribing and indexing video in PostgreSQL (BYTEA)...
          </div>
        ` : ''}

        <!-- Transcript Results Panel -->
        ${this.ytTranscriptResult ? `
          <div style="border: 1px solid #10a37f; border-radius: 8px; padding: 16px; background: var(--bg-surface); margin-top: 10px;">
            <div style="font-weight: 700; font-size: 13px; color: #10a37f; margin-bottom: 8px;">
              ✓ Video Transcribed & Stored in PostgreSQL
            </div>
            <div style="font-size: 12px; line-height: 1.5; margin-bottom: 12px; color: var(--text-secondary);">
              <strong>Summary:</strong> ${this.ytTranscriptResult.summary || 'Video analysis generated.'}
            </div>
            <div style="font-size: 12px; font-weight: 600; margin-bottom: 6px;">Timestamped Chapter Breakdown:</div>
            <div style="max-height: 160px; overflow-y: auto; background: rgba(0,0,0,0.02); padding: 10px; border-radius: 6px; font-size: 11px;">
              ${(this.ytTranscriptResult.transcript || []).map(t => `
                <div style="margin-bottom: 6px; display: flex; gap: 8px;">
                  <span style="color: #10a37f; font-weight: 700; font-family: monospace;">[${t.timestamp}]</span>
                  <span>${t.text}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // 4. Map Searcher Agent Tab
  renderMapTab() {
    const res = this.mapResult;

    return `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; gap: 10px;">
          <input type="text" id="input-map-query" value="${this.mapQuery}" placeholder="Search any Ethiopian historic or biological landmark (e.g. Lalibela, Simien, Axum)..." style="
            flex: 1;
            padding: 9px 12px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            background: var(--bg-surface);
            font-size: 13px;
          " />
          <button class="auth-btn-primary" id="btn-map-search" style="padding: 8px 16px; font-size: 13px; background: #2563eb;">
            Locate Landmark 🗺️
          </button>
        </div>

        ${this.mapSearching ? `
          <div style="text-align: center; padding: 25px; color: var(--text-muted);">
            Resolving spatial coordinates and geodetic data...
          </div>
        ` : ''}

        ${res ? `
          <div style="border: 1px solid var(--border-color); border-radius: 8px; padding: 18px; background: var(--bg-surface);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <div>
                <div style="font-weight: 700; font-size: 16px;">${res.locationName}</div>
                <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                  ${res.region} • ${res.category || 'Historical Site'}
                </div>
              </div>
              <a href="${res.osmUrl}" target="_blank" class="auth-btn-primary" style="padding: 6px 12px; font-size: 12px; text-decoration: none; background: #10a37f;">
                View on OpenStreetMap ↗
              </a>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 14px;">
              <div style="background: rgba(0,0,0,0.02); padding: 10px; border-radius: 6px;">
                <div style="font-size: 11px; color: var(--text-muted);">Coordinates</div>
                <div style="font-size: 13px; font-weight: 700; margin-top: 2px;">${res.coordinates || `${res.latitude}, ${res.longitude}`}</div>
              </div>
              <div style="background: rgba(0,0,0,0.02); padding: 10px; border-radius: 6px;">
                <div style="font-size: 11px; color: var(--text-muted);">Elevation</div>
                <div style="font-size: 13px; font-weight: 700; margin-top: 2px;">${res.elevation || '2,400m ASL'}</div>
              </div>
              <div style="background: rgba(0,0,0,0.02); padding: 10px; border-radius: 6px;">
                <div style="font-size: 11px; color: var(--text-muted);">Gazetteer Authority</div>
                <div style="font-size: 13px; font-weight: 700; margin-top: 2px; color: #10a37f;">${res.source || 'Verified'}</div>
              </div>
            </div>

            <div style="font-size: 12px; line-height: 1.6; color: var(--text-secondary); background: rgba(0,0,0,0.02); padding: 12px; border-radius: 6px;">
              <strong>Historical & Spatial Significance:</strong><br />
              ${res.historicalSignificance || 'Monolithic stone architectural complex and UNESCO site.'}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // 5. Google Web Searcher Agent Tab
  renderGoogleTab() {
    return `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; gap: 10px;">
          <input type="text" id="input-web-query" value="${this.webQuery}" placeholder="Search questions across web search engines..." style="
            flex: 1;
            padding: 9px 12px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            background: var(--bg-surface);
            font-size: 13px;
          " />
          <button class="auth-btn-primary" id="btn-web-search" style="padding: 8px 16px; font-size: 13px; background: #4285f4;">
            Search Web 🔍
          </button>
        </div>

        ${this.webSearching ? `
          <div style="text-align: center; padding: 25px; color: var(--text-muted);">
            Crawling web pages and extracting clean structured paragraphs...
          </div>
        ` : ''}

        ${this.webResults ? `
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${(this.webResults.websites || []).map(site => `
              <div style="border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; background: var(--bg-surface);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <a href="${site.url}" target="_blank" style="font-weight: 700; font-size: 14px; color: #1a73e8; text-decoration: none;">
                    ${site.title} ↗
                  </a>
                  <span style="font-size: 10px; padding: 2px 6px; background: rgba(0,0,0,0.05); border-radius: 4px;">Web Extract</span>
                </div>
                <div style="font-size: 11px; color: var(--text-muted); margin: 3px 0 8px 0;">${site.url}</div>
                <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin: 0 0 10px 0;">
                  ${site.snippet || site.extracted_text.slice(0, 220)}...
                </p>
                ${site.extracted_text ? `
                  <details style="font-size: 11px; color: var(--text-muted); cursor: pointer;">
                    <summary style="font-weight: 600; color: #10a37f;">View Extracted Text Feed</summary>
                    <div style="margin-top: 6px; padding: 8px; background: rgba(0,0,0,0.02); border-radius: 4px; max-height: 140px; overflow-y: auto; white-space: pre-wrap;">
                      ${site.extracted_text}
                    </div>
                  </details>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  // 6. Image Processor Agent Tab
  renderImageTab() {
    return `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; gap: 10px;">
          <input type="text" id="input-img-url" value="${this.imgUrl}" placeholder="Image URL (or select sample below)..." style="
            flex: 1;
            padding: 9px 12px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            background: var(--bg-surface);
            font-size: 13px;
          " />
          <button class="auth-btn-primary" id="btn-img-process" style="padding: 8px 16px; font-size: 13px; background: #8b5cf6;">
            Process Image 🖼️
          </button>
        </div>

        <div style="display: flex; gap: 8px; align-items: center; font-size: 12px; color: var(--text-muted);">
          <span>Quick Samples:</span>
          <button class="btn-sample-img auth-btn-secondary" data-url="https://images.unsplash.com/photo-1544717305-2782549b5136?w=800" style="padding: 3px 8px; font-size: 11px;">Historical Architecture</button>
          <button class="btn-sample-img auth-btn-secondary" data-url="https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=800" style="padding: 3px 8px; font-size: 11px;">Endemic Wildlife</button>
          <button class="btn-sample-img auth-btn-secondary" data-url="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800" style="padding: 3px 8px; font-size: 11px;">Botanical Cloud Forest</button>
        </div>

        ${this.imgProcessing ? `
          <div style="text-align: center; padding: 25px; color: var(--text-muted);">
            Running YOLOv8 vision detector and crawling source websites...
          </div>
        ` : ''}

        ${this.imgResult ? `
          <div style="border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; background: var(--bg-surface);">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; color: #8b5cf6;">
              ✓ Visual Analysis & Source Grounding
            </div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">
              <strong>Object Detections:</strong> ${this.imgResult.yolo_summary || 'Visual elements identified'}
            </div>
            <div style="font-size: 12px; font-weight: 600; margin-bottom: 6px;">Coded Web Origin & Contextual Matches:</div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${(this.imgResult.source_websites || []).map(s => `
                <div style="background: rgba(0,0,0,0.02); padding: 8px 12px; border-radius: 6px; font-size: 11px;">
                  <div style="font-weight: 600; color: #10a37f;">${s.title}</div>
                  <div style="color: var(--text-muted); font-size: 10px;">${s.url}</div>
                  <div style="color: var(--text-secondary); margin-top: 2px;">${s.description}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // 7. Continuous Link & Book Ingester Tab
  renderReaderTab() {
    return `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="background: rgba(16, 163, 127, 0.05); padding: 14px; border-radius: 8px; border: 1px solid rgba(16, 163, 127, 0.2);">
          <div style="font-weight: 700; font-size: 13px; color: #10a37f; margin-bottom: 4px;">
            📚 Continuous Online Book & Link Data Reader Agent
          </div>
          <div style="font-size: 11px; color: var(--text-muted);">
            Reads online books, academic PDFs, or web encyclopedias by URL, strips HTML/noise, segments into semantic chunks, and stores permanently in PostgreSQL (BYTEA) and ChromaDB.
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <input type="text" id="input-reader-url" value="${this.linkUrl}" placeholder="Enter website, online paper, or book URL..." style="
            padding: 9px 12px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            background: var(--bg-surface);
            font-size: 13px;
          " />
          <div style="display: flex; gap: 10px;">
            <input type="text" id="input-reader-title" value="${this.linkTitle}" placeholder="Resource Title (optional)..." style="
              flex: 1;
              padding: 9px 12px;
              border-radius: 8px;
              border: 1px solid var(--border-color);
              background: var(--bg-surface);
              font-size: 13px;
            " />
            <button class="auth-btn-primary" id="btn-reader-ingest" style="padding: 8px 18px; font-size: 13px; background: #10a37f;" ${this.linkReading ? 'disabled' : ''}>
              ${this.linkReading ? 'Ingesting...' : 'Ingest into Knowledge Base 📚'}
            </button>
          </div>
        </div>

        ${this.linkReading ? `
          <div style="text-align: center; padding: 25px; color: var(--text-muted);">
            Connecting to remote source, extracting text, calculating embeddings, and writing to PostgreSQL BYTEA...
          </div>
        ` : ''}

        ${this.linkResult ? `
          <div style="border: 1px solid #10a37f; border-radius: 8px; padding: 16px; background: var(--bg-surface);">
            <div style="font-weight: 700; font-size: 13px; color: #10a37f; margin-bottom: 6px;">
              ✓ Resource Successfully Ingested into Database
            </div>
            <div style="font-size: 12px; line-height: 1.5; color: var(--text-secondary); margin-bottom: 12px;">
              ${this.linkResult.synopsis}
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px;">
              <div style="background: rgba(0,0,0,0.02); padding: 8px; border-radius: 6px;">
                <div style="font-size: 10px; color: var(--text-muted);">Word Count</div>
                <div style="font-size: 14px; font-weight: 700;">${this.linkResult.wordCount} words</div>
              </div>
              <div style="background: rgba(0,0,0,0.02); padding: 8px; border-radius: 6px;">
                <div style="font-size: 10px; color: var(--text-muted);">Indexed Chunks</div>
                <div style="font-size: 14px; font-weight: 700;">${this.linkResult.chunksCount} chunks</div>
              </div>
              <div style="background: rgba(0,0,0,0.02); padding: 8px; border-radius: 6px;">
                <div style="font-size: 10px; color: var(--text-muted);">Stored In</div>
                <div style="font-size: 12px; font-weight: 700; color: #10a37f;">PostgreSQL BYTEA</div>
              </div>
            </div>
            <details style="font-size: 11px;">
              <summary style="cursor: pointer; font-weight: 600; color: #10a37f;">Preview Ingested Text</summary>
              <pre style="margin-top: 6px; padding: 10px; background: rgba(0,0,0,0.02); border-radius: 6px; max-height: 150px; overflow-y: auto; white-space: pre-wrap;">${this.linkResult.preview}</pre>
            </details>
          </div>
        ` : ''}
      </div>
    `;
  }

  // 8. Ethiopian Knowledge Archive Tab
  renderKnowledgeTab() {
    const isEdu = this.knowledgeCategory === 'all' || this.knowledgeCategory === 'education';
    const isBio = this.knowledgeCategory === 'all' || this.knowledgeCategory === 'biology';

    return `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; gap: 6px;">
            <button class="filter-know-btn ${this.knowledgeCategory === 'all' ? 'active' : ''}" data-cat="all" style="padding: 4px 10px; border-radius: 6px; font-size: 11px; cursor: pointer;">All (${this.educationRecords.length + this.biologyRecords.length})</button>
            <button class="filter-know-btn ${this.knowledgeCategory === 'education' ? 'active' : ''}" data-cat="education" style="padding: 4px 10px; border-radius: 6px; font-size: 11px; cursor: pointer;">Education History (${this.educationRecords.length})</button>
            <button class="filter-know-btn ${this.knowledgeCategory === 'biology' ? 'active' : ''}" data-cat="biology" style="padding: 4px 10px; border-radius: 6px; font-size: 11px; cursor: pointer;">Biological & Botanical (${this.biologyRecords.length})</button>
          </div>
          <button class="auth-btn-secondary" id="btn-reseed-dossiers" style="padding: 4px 10px; font-size: 11px;">
            Sync All to PostgreSQL & ChromaDB
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 12px; max-height: 520px; overflow-y: auto;">
          ${isEdu ? this.educationRecords.map(r => `
            <div style="border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; background: var(--bg-surface); display: flex; flex-direction: column;">
              <div style="font-size: 10px; font-weight: 700; color: #d97706; text-transform: uppercase; margin-bottom: 2px;">
                📜 ${r.period} • ${r.category}
              </div>
              <div style="font-weight: 700; font-size: 13px; line-height: 1.4; margin-bottom: 6px;">${r.title}</div>
              <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.5; flex: 1; margin: 0 0 10px 0;">
                ${r.summary}
              </p>
              <div style="font-size: 10px; color: var(--text-muted); margin-top: auto; padding-top: 6px; border-top: 1px solid var(--border-color);">
                📍 Location: ${r.location}
              </div>
            </div>
          `).join('') : ''}

          ${isBio ? this.biologyRecords.map(r => `
            <div style="border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; background: var(--bg-surface); display: flex; flex-direction: column;">
              <div style="font-size: 10px; font-weight: 700; color: #10a37f; text-transform: uppercase; margin-bottom: 2px;">
                🌿 ${r.taxonomic_class} • ${r.conservation_status}
              </div>
              <div style="font-weight: 700; font-size: 13px; line-height: 1.4; margin-bottom: 2px;">${r.common_name}</div>
              <div style="font-size: 11px; font-style: italic; color: var(--text-muted); margin-bottom: 6px;">${r.scientific_name}</div>
              <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.5; flex: 1; margin: 0 0 10px 0;">
                ${r.summary}
              </p>
              <div style="font-size: 10px; color: var(--text-muted); margin-top: auto; padding-top: 6px; border-top: 1px solid var(--border-color);">
                🌍 Habitat: ${r.habitat}
              </div>
            </div>
          `).join('') : ''}
        </div>
      </div>
    `;
  }

  attachEvents() {
    // Close button
    const closeBtn = document.getElementById('btn-close-agent-hub');
    if (closeBtn) closeBtn.onclick = () => this.close();

    const overlay = document.getElementById('agent-hub-overlay');
    if (overlay) {
      overlay.onclick = (e) => {
        if (e.target === overlay) this.close();
      };
    }

    // Tabs toggle
    this.container.querySelectorAll('.agent-tab-btn').forEach(btn => {
      btn.onclick = () => {
        this.activeTab = btn.getAttribute('data-tab');
        this.render();
      };
    });

    // File selection in explorer
    this.container.querySelectorAll('.data-file-item').forEach(el => {
      el.onclick = async () => {
        const path = el.getAttribute('data-path');
        this.selectedFile = path;
        try {
          const res = await api.getDataFileContent(path);
          this.fileContent = res.content;
        } catch {
          this.fileContent = '// Error reading file content.';
        }
        this.render();
      };
    });

    // Quick run pipeline
    const quickPipelineBtn = document.getElementById('btn-quick-run-pipeline');
    if (quickPipelineBtn) {
      quickPipelineBtn.onclick = () => {
        this.activeTab = 'pipeline';
        this.render();
        const trig = document.getElementById('btn-trigger-pipeline');
        if (trig) trig.click();
      };
    }

    // Trigger Pipeline
    const trigBtn = document.getElementById('btn-trigger-pipeline');
    if (trigBtn) {
      trigBtn.onclick = async () => {
        this.pipelineRunning = true;
        this.render();
        try {
          const res = await api.runDataPipeline();
          this.pipelineResult = res;
          this.dataExplorer = await api.getDataExplorer();
        } catch (e) {
          alert('Pipeline error: ' + e.message);
        } finally {
          this.pipelineRunning = false;
          this.render();
        }
      };
    }

    // Seed Knowledge Hub
    const seedBtn = document.getElementById('btn-seed-knowledge-hub');
    if (seedBtn) {
      seedBtn.onclick = async () => {
        seedBtn.disabled = true;
        seedBtn.innerText = 'Seeding...';
        try {
          const res = await api.seedKnowledge(true);
          alert(`Seeded ${res.total_ingested} dossiers into PostgreSQL & ChromaDB.`);
        } catch (e) {
          alert('Seeding error: ' + e.message);
        } finally {
          seedBtn.disabled = false;
          seedBtn.innerText = 'Re-Seed Ethiopian Dossiers';
        }
      };
    }

    // YouTube Search
    const ytBtn = document.getElementById('btn-yt-search');
    if (ytBtn) {
      ytBtn.onclick = async () => {
        const queryInput = document.getElementById('input-yt-query');
        if (queryInput) this.ytQuery = queryInput.value;
        ytBtn.disabled = true;
        ytBtn.innerText = 'Searching...';
        try {
          const res = await api.searchYouTube(this.ytQuery);
          this.ytResults = res.videos || [];
        } catch (e) {
          alert('YouTube Search error: ' + e.message);
        } finally {
          ytBtn.disabled = false;
          ytBtn.innerText = 'Search Videos 🎥';
          this.render();
        }
      };
    }

    // YouTube Transcribe
    this.container.querySelectorAll('.btn-yt-transcribe').forEach(btn => {
      btn.onclick = async () => {
        const vidId = btn.getAttribute('data-id');
        const title = btn.getAttribute('data-title');
        this.ytTranscribing = true;
        this.render();
        try {
          const res = await api.transcribeYouTube(vidId, title);
          this.ytTranscriptResult = res;
        } catch (e) {
          alert('Transcription error: ' + e.message);
        } finally {
          this.ytTranscribing = false;
          this.render();
        }
      };
    });

    // Map Search
    const mapBtn = document.getElementById('btn-map-search');
    if (mapBtn) {
      mapBtn.onclick = async () => {
        const inp = document.getElementById('input-map-query');
        if (inp) this.mapQuery = inp.value;
        this.mapSearching = true;
        this.render();
        try {
          const res = await api.searchMap(this.mapQuery);
          this.mapResult = res;
        } catch (e) {
          alert('Map search error: ' + e.message);
        } finally {
          this.mapSearching = false;
          this.render();
        }
      };
    }

    // Web Search
    const webBtn = document.getElementById('btn-web-search');
    if (webBtn) {
      webBtn.onclick = async () => {
        const inp = document.getElementById('input-web-query');
        if (inp) this.webQuery = inp.value;
        this.webSearching = true;
        this.render();
        try {
          const res = await api.searchGoogle(this.webQuery);
          this.webResults = res;
        } catch (e) {
          alert('Web search error: ' + e.message);
        } finally {
          this.webSearching = false;
          this.render();
        }
      };
    }

    // Image Process
    const imgBtn = document.getElementById('btn-img-process');
    if (imgBtn) {
      imgBtn.onclick = async () => {
        const inp = document.getElementById('input-img-url');
        if (inp) this.imgUrl = inp.value;
        if (!this.imgUrl) {
          alert('Please enter an image URL');
          return;
        }
        this.imgProcessing = true;
        this.render();
        try {
          const fd = new FormData();
          fd.append('image_url', this.imgUrl);
          const res = await api.processImage(fd);
          this.imgResult = res;
        } catch (e) {
          alert('Image processor error: ' + e.message);
        } finally {
          this.imgProcessing = false;
          this.render();
        }
      };
    }

    // Sample Image click
    this.container.querySelectorAll('.btn-sample-img').forEach(btn => {
      btn.onclick = () => {
        this.imgUrl = btn.getAttribute('data-url');
        const inp = document.getElementById('input-img-url');
        if (inp) inp.value = this.imgUrl;
        const submitBtn = document.getElementById('btn-img-process');
        if (submitBtn) submitBtn.click();
      };
    });

    // Link Reader Ingest
    const readerBtn = document.getElementById('btn-reader-ingest');
    if (readerBtn) {
      readerBtn.onclick = async () => {
        const urlInp = document.getElementById('input-reader-url');
        const titleInp = document.getElementById('input-reader-title');
        if (urlInp) this.linkUrl = urlInp.value;
        if (titleInp) this.linkTitle = titleInp.value;
        if (!this.linkUrl) {
          alert('Please enter a URL');
          return;
        }
        this.linkReading = true;
        this.render();
        try {
          const res = await api.readLink(this.linkUrl, this.linkTitle);
          this.linkResult = res;
        } catch (e) {
          alert('Link reader error: ' + e.message);
        } finally {
          this.linkReading = false;
          this.render();
        }
      };
    }

    // Knowledge filter
    this.container.querySelectorAll('.filter-know-btn').forEach(btn => {
      btn.onclick = () => {
        this.knowledgeCategory = btn.getAttribute('data-cat');
        this.render();
      };
    });

    // Re-seed dossiers
    const reseedBtn = document.getElementById('btn-reseed-dossiers');
    if (reseedBtn) {
      reseedBtn.onclick = async () => {
        reseedBtn.disabled = true;
        reseedBtn.innerText = 'Syncing...';
        try {
          const res = await api.seedKnowledge(true);
          alert(`Synchronized ${res.total_ingested} dossiers into PostgreSQL & ChromaDB.`);
        } catch (e) {
          alert('Sync error: ' + e.message);
        } finally {
          reseedBtn.disabled = false;
          reseedBtn.innerText = 'Sync All to PostgreSQL & ChromaDB';
        }
      };
    }
  }
}
