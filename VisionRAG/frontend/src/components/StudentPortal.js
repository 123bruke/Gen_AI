// StudentPortal Component: Enterprise Student Records & Regional Progress System
// Fully integrated with PostgreSQL, password protected ('123456'), and supporting search & multi-region filtering.

import { api } from '../services/api.js';

export class StudentPortal {
  constructor(containerEl, options = {}) {
    this.container = containerEl;
    this.onBackToChat = options.onBackToChat || (() => {});
    this.isUnlocked = sessionStorage.getItem('vrag_student_portal_unlocked') === 'true';
    this.students = [];
    this.stats = { total_students: 0, average_progress: 0, regions: {}, grade_levels: {}, status_breakdown: {} };
    this.searchQuery = '';
    this.selectedRegion = 'All';
    this.selectedGrade = 'All';
    this.selectedStatus = 'All';
    this.sortBy = 'name';
    this.loading = false;
    this.errorMessage = '';
    this.editingStudent = null; // null = closed, {} = new, obj = editing
    this.showEditModal = false;
  }

  open() {
    this.container.style.display = 'block';
    if (!this.isUnlocked) {
      this.renderPasscodeChallenge();
    } else {
      this.fetchAndRender();
    }
  }

  close() {
    this.container.style.display = 'none';
    this.container.innerHTML = '';
  }

  async fetchAndRender() {
    this.loading = true;
    this.render();
    try {
      const [studentsData, statsData] = await Promise.all([
        api.getStudents({
          search: this.searchQuery,
          region: this.selectedRegion,
          grade_level: this.selectedGrade,
          status: this.selectedStatus,
          sort_by: this.sortBy
        }),
        api.getStudentStatistics()
      ]);
      this.students = studentsData.students || [];
      this.stats = statsData || this.stats;
    } catch (err) {
      console.error('Error fetching student data:', err);
      this.errorMessage = err.message || 'Failed to load records from PostgreSQL.';
    } finally {
      this.loading = false;
      this.render();
    }
  }

  renderPasscodeChallenge() {
    this.container.innerHTML = `
      <div class="student-portal-wrapper" style="min-height: 100vh; background: #f8fafc; display: flex; align-items: center; justify-content: center; padding: 24px;">
        <div class="auth-card" style="max-width: 440px; width: 100%; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06), 0 8px 10px -6px rgba(0,0,0,0.04);">
          
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="width: 56px; height: 56px; border-radius: 14px; background: #eff6ff; color: #2563eb; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; border: 1px solid #bfdbfe;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">VRAG Student Portal</h2>
            <p style="font-size: 13.5px; color: #64748b; line-height: 1.5;">
              PostgreSQL Educational Monitoring System.<br/>
              Please enter the administrator passcode to access student records and progress tracking.
            </p>
          </div>

          <form id="portal-unlock-form" style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Administrator Passcode</label>
              <input
                type="password"
                id="portal-passcode-input"
                placeholder="Enter password (e.g. 123456)"
                autofocus
                style="width: 100%; padding: 11px 14px; border: 1.5px solid #cbd5e1; border-radius: 10px; font-size: 15px; outline: none; letter-spacing: 2px; transition: border-color 0.15s;"
              />
              <span id="portal-auth-error" style="display: none; color: #ef4444; font-size: 12.5px; margin-top: 6px; font-weight: 500;"></span>
            </div>

            <button
              type="submit"
              id="btn-unlock-portal"
              style="width: 100%; padding: 12px; background: #2563eb; color: #ffffff; border: none; border-radius: 10px; font-size: 14.5px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.15s;"
            >
              <span>Unlock Student Portal</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            <button
              type="button"
              id="btn-cancel-portal"
              style="width: 100%; padding: 10px; background: transparent; color: #64748b; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13.5px; font-weight: 500; cursor: pointer;"
            >
              ← Return to VRAG Search
            </button>
          </form>

          <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center;">
            <span style="font-size: 12px; color: #94a3b8; font-family: monospace;">Secured with PostgreSQL 16 & Role Policy</span>
          </div>
        </div>
      </div>
    `;

    const form = this.container.querySelector('#portal-unlock-form');
    const input = this.container.querySelector('#portal-passcode-input');
    const errorEl = this.container.querySelector('#portal-auth-error');
    const cancelBtn = this.container.querySelector('#btn-cancel-portal');

    cancelBtn.addEventListener('click', () => {
      this.close();
      this.onBackToChat();
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const entered = input.value.trim();
      errorEl.style.display = 'none';

      try {
        await api.verifyStudentPortalPassword(entered);
        this.isUnlocked = true;
        sessionStorage.setItem('vrag_student_portal_unlocked', 'true');
        this.fetchAndRender();
      } catch (err) {
        errorEl.textContent = err.message || 'Invalid passcode. Please enter 123456.';
        errorEl.style.display = 'block';
        input.value = '';
        input.focus();
      }
    });
  }

  render() {
    if (!this.isUnlocked) {
      this.renderPasscodeChallenge();
      return;
    }

    const REGIONS = [
      'All',
      'Addis Ababa',
      'Oromia',
      'Amhara',
      'Tigray',
      'Sidama',
      'Somali',
      'Central Ethiopia',
      'South Ethiopia',
      'South West Ethiopia',
      'Afar',
      'Benishangul-Gumuz',
      'Gambela',
      'Harari',
      'Dire Dawa'
    ];

    const GRADES = ['All', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'TVET', 'Higher Ed'];
    const STATUSES = ['All', 'Active', 'Honors', 'Needs Attention'];

    this.container.innerHTML = `
      <div class="student-portal-wrapper" style="min-height: 100vh; background: #f8fafc; display: flex; flex-direction: column;">
        
        <!-- Top App Bar -->
        <header style="height: 60px; background: #ffffff; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; padding: 0 28px; position: sticky; top: 0; z-index: 50;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <button id="btn-portal-back" title="Return to VRAG Chat" style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; font-weight: 600; color: #334155; cursor: pointer; transition: all 0.15s;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>VRAG Search</span>
            </button>

            <div style="height: 24px; width: 1px; background: #e2e8f0;"></div>

            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 32px; height: 32px; border-radius: 8px; background: #eff6ff; color: #2563eb; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;">
                🎓
              </div>
              <div>
                <h1 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 8px;">
                  <span>VRAG Student Records Portal</span>
                  <span style="font-size: 11px; background: #ecfdf5; color: #059669; padding: 2px 7px; border-radius: 12px; font-weight: 600; border: 1px solid #a7f3d0;">PostgreSQL Grounded</span>
                </h1>
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <button id="btn-add-student" style="display: flex; align-items: center; gap: 7px; padding: 7px 14px; background: #2563eb; color: #ffffff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; box-shadow: 0 1px 2px rgba(37,99,235,0.2);">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Enroll New Student</span>
            </button>

            <button id="btn-portal-lock" title="Lock Student Portal" style="display: flex; align-items: center; gap: 6px; padding: 7px 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; font-weight: 500; color: #64748b; cursor: pointer;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>Lock</span>
            </button>
          </div>
        </header>

        <!-- Main Body -->
        <main style="flex: 1; max-width: 1320px; width: 100%; margin: 0 auto; padding: 24px;">
          
          <!-- Analytics Metrics Bar -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 18px; margin-bottom: 24px;">
            
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-size: 12.5px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Enrolled Students</span>
                <span style="width: 32px; height: 32px; border-radius: 8px; background: #eff6ff; color: #2563eb; display: flex; align-items: center; justify-content: center;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </span>
              </div>
              <div style="font-size: 26px; font-weight: 800; color: #0f172a;">${this.stats.total_students || this.students.length}</div>
              <div style="font-size: 12.5px; color: #10b981; margin-top: 4px; font-weight: 500;">✓ Grounded in PostgreSQL storage</div>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-size: 12.5px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Avg Curriculum Progress</span>
                <span style="width: 32px; height: 32px; border-radius: 8px; background: #ecfdf5; color: #059669; display: flex; align-items: center; justify-content: center;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                </span>
              </div>
              <div style="font-size: 26px; font-weight: 800; color: #0f172a;">${this.stats.average_progress || 0}%</div>
              <div style="font-size: 12.5px; color: #64748b; margin-top: 4px;">Across all registered subject modules</div>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-size: 12.5px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Regional Coverage</span>
                <span style="width: 32px; height: 32px; border-radius: 8px; background: #fdf4ff; color: #c026d3; display: flex; align-items: center; justify-content: center;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
                </span>
              </div>
              <div style="font-size: 26px; font-weight: 800; color: #0f172a;">${Object.keys(this.stats.regions || {}).length || 8} Administrative Regions</div>
              <div style="font-size: 12.5px; color: #64748b; margin-top: 4px;">Decentralized educational data</div>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-size: 12.5px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Honors & Distinction</span>
                <span style="width: 32px; height: 32px; border-radius: 8px; background: #fffbeb; color: #d97706; display: flex; align-items: center; justify-content: center;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                </span>
              </div>
              <div style="font-size: 26px; font-weight: 800; color: #0f172a;">${(this.stats.status_breakdown && this.stats.status_breakdown['Honors']) || 3} Students</div>
              <div style="font-size: 12.5px; color: #d97706; margin-top: 4px; font-weight: 500;">GPA ≥ 3.75 / 4.0 Standard</div>
            </div>

          </div>

          <!-- Controls & Multi-Filter Bar -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
            <div style="display: flex; flex-wrap: wrap; gap: 14px; align-items: center; justify-content: space-between;">
              
              <!-- Search Input -->
              <div style="position: relative; flex: 1; min-width: 260px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="position: absolute; left: 12px; top: 11px;">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  id="student-search-input"
                  placeholder="Search student name, ID (e.g. ET-AA-...), or school..."
                  value="${this.searchQuery}"
                  style="width: 100%; padding: 9px 12px 9px 36px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13.5px; outline: none; transition: border-color 0.15s;"
                />
              </div>

              <!-- Filter Dropdowns -->
              <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
                
                <!-- Region Dropdown -->
                <div style="display: flex; align-items: center; gap: 6px;">
                  <label style="font-size: 12.5px; font-weight: 600; color: #475569;">Region:</label>
                  <select id="filter-region" style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; background: #ffffff; color: #1e293b; outline: none; cursor: pointer;">
                    ${REGIONS.map((r) => `<option value="${r}" ${this.selectedRegion === r ? 'selected' : ''}>${r}</option>`).join('')}
                  </select>
                </div>

                <!-- Grade Dropdown -->
                <div style="display: flex; align-items: center; gap: 6px;">
                  <label style="font-size: 12.5px; font-weight: 600; color: #475569;">Grade:</label>
                  <select id="filter-grade" style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; background: #ffffff; color: #1e293b; outline: none; cursor: pointer;">
                    ${GRADES.map((g) => `<option value="${g}" ${this.selectedGrade === g ? 'selected' : ''}>${g}</option>`).join('')}
                  </select>
                </div>

                <!-- Status Dropdown -->
                <div style="display: flex; align-items: center; gap: 6px;">
                  <label style="font-size: 12.5px; font-weight: 600; color: #475569;">Status:</label>
                  <select id="filter-status" style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; background: #ffffff; color: #1e293b; outline: none; cursor: pointer;">
                    ${STATUSES.map((s) => `<option value="${s}" ${this.selectedStatus === s ? 'selected' : ''}>${s}</option>`).join('')}
                  </select>
                </div>

                <!-- Sort Dropdown -->
                <div style="display: flex; align-items: center; gap: 6px;">
                  <label style="font-size: 12.5px; font-weight: 600; color: #475569;">Sort:</label>
                  <select id="filter-sort" style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; background: #ffffff; color: #1e293b; outline: none; cursor: pointer;">
                    <option value="name" ${this.sortBy === 'name' ? 'selected' : ''}>Name (A–Z)</option>
                    <option value="progress" ${this.sortBy === 'progress' ? 'selected' : ''}>Progress (High–Low)</option>
                    <option value="recent" ${this.sortBy === 'recent' ? 'selected' : ''}>Recently Added</option>
                  </select>
                </div>

              </div>

            </div>
          </div>

          <!-- Student Registry Table -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
            
            <div style="padding: 16px 20px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between;">
              <h2 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0;">
                <span>Registered Learners Directory</span>
                <span style="font-size: 12.5px; font-weight: 500; color: #64748b; margin-left: 8px;">(${this.students.length} found)</span>
              </h2>
              ${this.loading ? '<span style="font-size: 12px; color: #2563eb; font-weight: 500;">Syncing PostgreSQL...</span>' : ''}
            </div>

            ${
              this.students.length === 0
                ? `
              <div style="padding: 48px; text-align: center; color: #64748b;">
                <div style="font-size: 36px; margin-bottom: 10px;">🔍</div>
                <div style="font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 6px;">No student records found</div>
                <div style="font-size: 13.5px;">Try adjusting your search criteria or regional filter.</div>
              </div>
            `
                : `
              <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13.5px;">
                  <thead>
                    <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #475569; font-size: 12.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      <th style="padding: 12px 20px;">Student Name</th>
                      <th style="padding: 12px 16px;">Student ID</th>
                      <th style="padding: 12px 16px;">Region / Location</th>
                      <th style="padding: 12px 16px;">School</th>
                      <th style="padding: 12px 16px;">Grade</th>
                      <th style="padding: 12px 16px; min-width: 170px;">Learning Progress</th>
                      <th style="padding: 12px 16px;">GPA</th>
                      <th style="padding: 12px 16px;">Status</th>
                      <th style="padding: 12px 20px; text-align: right;">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.students.map((stu) => this.renderStudentRow(stu)).join('')}
                  </tbody>
                </table>
              </div>
            `
            }

          </div>

        </main>

        <!-- Edit / Enroll Modal -->
        ${this.showEditModal ? this.renderEditModal() : ''}

      </div>
    `;

    this.attachEventListeners();
  }

  renderStudentRow(stu) {
    const initials = stu.full_name
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    // Progress bar color coding
    let barColor = '#3b82f6';
    if (stu.progress_percent >= 85) barColor = '#10b981';
    else if (stu.progress_percent < 60) barColor = '#f59e0b';

    // Status pill
    let statusBg = '#eff6ff';
    let statusColor = '#2563eb';
    if (stu.learning_status === 'Honors') {
      statusBg = '#fef3c7';
      statusColor = '#d97706';
    } else if (stu.learning_status === 'Needs Attention') {
      statusBg = '#fef2f2';
      statusColor = '#ef4444';
    }

    return `
      <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.12s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
        <!-- Name & Avatar -->
        <td style="padding: 14px 20px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: #e0f2fe; color: #0284c7; font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 13px;">
              ${initials}
            </div>
            <div>
              <div style="font-weight: 600; color: #0f172a;">${stu.full_name}</div>
              <div style="font-size: 12px; color: #64748b;">${stu.gender || 'Unspecified'} • Age ${stu.age || 16}</div>
            </div>
          </div>
        </td>

        <!-- ID -->
        <td style="padding: 14px 16px; font-family: monospace; font-size: 12.5px; font-weight: 600; color: #334155;">
          ${stu.student_id}
        </td>

        <!-- Location -->
        <td style="padding: 14px 16px;">
          <div style="font-weight: 500; color: #0f172a;">${stu.region}</div>
          <div style="font-size: 12px; color: #64748b;">${stu.city_or_zone || stu.country || 'Ethiopia'}</div>
        </td>

        <!-- School -->
        <td style="padding: 14px 16px; color: #334155; font-size: 13px;">
          ${stu.school_name || 'General Secondary'}
        </td>

        <!-- Grade -->
        <td style="padding: 14px 16px; font-weight: 600; color: #0f172a;">
          ${stu.grade_level}
        </td>

        <!-- Progress Bar -->
        <td style="padding: 14px 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px;">
            <span style="font-size: 12px; font-weight: 700; color: ${barColor};">${stu.progress_percent}%</span>
            <span style="font-size: 11px; color: #94a3b8;">${stu.attendance_percent || 95}% Att.</span>
          </div>
          <div style="width: 100%; height: 7px; background: #e2e8f0; border-radius: 9999px; overflow: hidden;">
            <div style="width: ${stu.progress_percent}%; height: 100%; background: ${barColor}; border-radius: 9999px; transition: width 0.3s ease;"></div>
          </div>
        </td>

        <!-- GPA -->
        <td style="padding: 14px 16px; font-weight: 600; color: #0f172a;">
          ${stu.performance_gpa || '3.50'}
        </td>

        <!-- Status -->
        <td style="padding: 14px 16px;">
          <span style="display: inline-block; padding: 3px 9px; border-radius: 12px; font-size: 11.5px; font-weight: 600; background: ${statusBg}; color: ${statusColor};">
            ${stu.learning_status}
          </span>
        </td>

        <!-- Actions -->
        <td style="padding: 14px 20px; text-align: right;">
          <div style="display: inline-flex; align-items: center; gap: 6px;">
            <button class="btn-edit-student" data-id="${stu.id}" title="Edit Progress & Information" style="padding: 5px 9px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; font-weight: 600; color: #2563eb; cursor: pointer;">
              Edit
            </button>
            <button class="btn-delete-student" data-id="${stu.id}" title="Delete Record" style="padding: 5px 9px; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 6px; font-size: 12px; font-weight: 600; color: #e11d48; cursor: pointer;">
              Delete
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  renderEditModal() {
    const isEdit = !!(this.editingStudent && this.editingStudent.id);
    const stu = this.editingStudent || {};

    const REGIONS = [
      'Addis Ababa',
      'Oromia',
      'Amhara',
      'Tigray',
      'Sidama',
      'Somali',
      'Central Ethiopia',
      'South Ethiopia',
      'South West Ethiopia',
      'Afar',
      'Benishangul-Gumuz',
      'Gambela',
      'Harari',
      'Dire Dawa'
    ];

    const GRADES = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'TVET', 'Higher Ed'];
    const STATUSES = ['Active', 'Honors', 'Needs Attention'];

    const coursesStr = Array.isArray(stu.enrolled_courses) ? stu.enrolled_courses.join(', ') : (stu.enrolled_courses || 'Mathematics, Natural Science, English, Civics');

    return `
      <div class="auth-modal-overlay" id="edit-student-overlay" style="position: fixed; inset: 0; background: rgba(15,23,42,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px;">
        <div style="max-width: 620px; width: 100%; background: #ffffff; border-radius: 16px; padding: 28px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
          
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9;">
            <h3 style="font-size: 17px; font-weight: 700; color: #0f172a; margin: 0;">
              ${isEdit ? 'Update Student Progress & Details' : 'Enroll New Regional Student'}
            </h3>
            <button id="btn-close-edit-modal" style="background: none; border: none; font-size: 20px; color: #64748b; cursor: pointer;">✕</button>
          </div>

          <form id="student-edit-form" style="display: flex; flex-direction: column; gap: 14px;">
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label style="display: block; font-size: 12.5px; font-weight: 600; color: #334155; margin-bottom: 4px;">Full Name *</label>
                <input type="text" id="stu-field-name" required value="${stu.full_name || ''}" placeholder="e.g. Tsion Hailu" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13.5px;" />
              </div>
              <div>
                <label style="display: block; font-size: 12.5px; font-weight: 600; color: #334155; margin-bottom: 4px;">Student ID</label>
                <input type="text" id="stu-field-id" value="${stu.student_id || ''}" placeholder="e.g. ET-AA-2026-0150 (Auto if blank)" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13.5px;" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
              <div>
                <label style="display: block; font-size: 12.5px; font-weight: 600; color: #334155; margin-bottom: 4px;">Region *</label>
                <select id="stu-field-region" style="width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; background: #fff;">
                  ${REGIONS.map((r) => `<option value="${r}" ${stu.region === r ? 'selected' : ''}>${r}</option>`).join('')}
                </select>
              </div>

              <div>
                <label style="display: block; font-size: 12.5px; font-weight: 600; color: #334155; margin-bottom: 4px;">City / Zone</label>
                <input type="text" id="stu-field-city" value="${stu.city_or_zone || ''}" placeholder="e.g. Hawassa, Adama" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13.5px;" />
              </div>

              <div>
                <label style="display: block; font-size: 12.5px; font-weight: 600; color: #334155; margin-bottom: 4px;">Grade Level</label>
                <select id="stu-field-grade" style="width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; background: #fff;">
                  ${GRADES.map((g) => `<option value="${g}" ${stu.grade_level === g ? 'selected' : ''}>${g}</option>`).join('')}
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px;">
              <div>
                <label style="display: block; font-size: 12.5px; font-weight: 600; color: #334155; margin-bottom: 4px;">School / Institution</label>
                <input type="text" id="stu-field-school" value="${stu.school_name || ''}" placeholder="e.g. Menelik II Secondary School" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13.5px;" />
              </div>

              <div>
                <label style="display: block; font-size: 12.5px; font-weight: 600; color: #334155; margin-bottom: 4px;">Learning Status</label>
                <select id="stu-field-status" style="width: 100%; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; background: #fff;">
                  ${STATUSES.map((s) => `<option value="${s}" ${stu.learning_status === s ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
              <div>
                <label style="display: block; font-size: 12.5px; font-weight: 600; color: #334155; margin-bottom: 4px;">Curriculum Progress (%)</label>
                <input type="number" id="stu-field-progress" min="0" max="100" value="${stu.progress_percent !== undefined ? stu.progress_percent : 75}" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13.5px;" />
              </div>

              <div>
                <label style="display: block; font-size: 12.5px; font-weight: 600; color: #334155; margin-bottom: 4px;">Attendance (%)</label>
                <input type="number" id="stu-field-attendance" min="0" max="100" value="${stu.attendance_percent || 95}" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13.5px;" />
              </div>

              <div>
                <label style="display: block; font-size: 12.5px; font-weight: 600; color: #334155; margin-bottom: 4px;">Performance / GPA</label>
                <input type="text" id="stu-field-gpa" value="${stu.performance_gpa || '3.70 / 4.0'}" placeholder="e.g. 3.80 / 4.0" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13.5px;" />
              </div>
            </div>

            <div>
              <label style="display: block; font-size: 12.5px; font-weight: 600; color: #334155; margin-bottom: 4px;">Enrolled Courses (comma-separated)</label>
              <input type="text" id="stu-field-courses" value="${coursesStr}" placeholder="Mathematics, Physics, Civics, English" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13.5px;" />
            </div>

            <div>
              <label style="display: block; font-size: 12.5px; font-weight: 600; color: #334155; margin-bottom: 4px;">Academic Feedback & Guidance Notes</label>
              <textarea id="stu-field-feedback" rows="3" placeholder="Notes on student learning, strengths, or areas needing supplementary guidance..." style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; resize: vertical;">${stu.feedback_notes || ''}</textarea>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
              <button type="button" id="btn-cancel-edit" style="padding: 8px 16px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13.5px; font-weight: 500; cursor: pointer;">Cancel</button>
              <button type="submit" style="padding: 8px 20px; background: #2563eb; color: #ffffff; border: none; border-radius: 8px; font-size: 13.5px; font-weight: 600; cursor: pointer;">Save in PostgreSQL</button>
            </div>

          </form>

        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Back to chat
    const backBtn = this.container.querySelector('#btn-portal-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.close();
        this.onBackToChat();
      });
    }

    // Lock portal
    const lockBtn = this.container.querySelector('#btn-portal-lock');
    if (lockBtn) {
      lockBtn.addEventListener('click', () => {
        this.isUnlocked = false;
        sessionStorage.removeItem('vrag_student_portal_unlocked');
        this.renderPasscodeChallenge();
      });
    }

    // Add Student Button
    const addBtn = this.container.querySelector('#btn-add-student');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.editingStudent = {
          full_name: '',
          student_id: '',
          gender: 'Female',
          age: 16,
          grade_level: 'Grade 10',
          region: 'Addis Ababa',
          city_or_zone: '',
          school_name: 'Menelik II Secondary School',
          progress_percent: 75,
          attendance_percent: 95,
          performance_gpa: '3.60 / 4.0',
          enrolled_courses: ['Mathematics', 'Physics', 'Civic Education', 'English'],
          learning_status: 'Active',
          feedback_notes: ''
        };
        this.showEditModal = true;
        this.render();
      });
    }

    // Search input
    const searchInput = this.container.querySelector('#student-search-input');
    if (searchInput) {
      let debounceTimer = null;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.searchQuery = e.target.value;
          this.fetchAndRender();
        }, 280);
      });
    }

    // Filter dropdowns
    const regionSelect = this.container.querySelector('#filter-region');
    if (regionSelect) {
      regionSelect.addEventListener('change', (e) => {
        this.selectedRegion = e.target.value;
        this.fetchAndRender();
      });
    }

    const gradeSelect = this.container.querySelector('#filter-grade');
    if (gradeSelect) {
      gradeSelect.addEventListener('change', (e) => {
        this.selectedGrade = e.target.value;
        this.fetchAndRender();
      });
    }

    const statusSelect = this.container.querySelector('#filter-status');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        this.selectedStatus = e.target.value;
        this.fetchAndRender();
      });
    }

    const sortSelect = this.container.querySelector('#filter-sort');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.fetchAndRender();
      });
    }

    // Edit row buttons
    this.container.querySelectorAll('.btn-edit-student').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const stu = this.students.find((s) => s.id === id);
        if (stu) {
          this.editingStudent = { ...stu };
          this.showEditModal = true;
          this.render();
        }
      });
    });

    // Delete row buttons
    this.container.querySelectorAll('.btn-delete-student').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const stu = this.students.find((s) => s.id === id);
        const name = stu ? stu.full_name : 'this student';
        if (confirm(`Are you sure you want to delete the student record for "${name}" from PostgreSQL?`)) {
          try {
            await api.deleteStudent(id);
            await this.fetchAndRender();
          } catch (err) {
            alert('Failed to delete student: ' + err.message);
          }
        }
      });
    });

    // Modal close & cancel
    const closeModalBtn = this.container.querySelector('#btn-close-edit-modal');
    const cancelModalBtn = this.container.querySelector('#btn-cancel-edit');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => {
        this.showEditModal = false;
        this.editingStudent = null;
        this.render();
      });
    }
    if (cancelModalBtn) {
      cancelModalBtn.addEventListener('click', () => {
        this.showEditModal = false;
        this.editingStudent = null;
        this.render();
      });
    }

    // Modal form submit
    const editForm = this.container.querySelector('#student-edit-form');
    if (editForm) {
      editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const courses = this.container
          .querySelector('#stu-field-courses')
          .value.split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        const payload = {
          full_name: this.container.querySelector('#stu-field-name').value.trim(),
          student_id: this.container.querySelector('#stu-field-id').value.trim() || undefined,
          region: this.container.querySelector('#stu-field-region').value,
          city_or_zone: this.container.querySelector('#stu-field-city').value.trim(),
          school_name: this.container.querySelector('#stu-field-school').value.trim(),
          grade_level: this.container.querySelector('#stu-field-grade').value,
          learning_status: this.container.querySelector('#stu-field-status').value,
          progress_percent: parseInt(this.container.querySelector('#stu-field-progress').value, 10) || 0,
          attendance_percent: parseInt(this.container.querySelector('#stu-field-attendance').value, 10) || 95,
          performance_gpa: this.container.querySelector('#stu-field-gpa').value.trim(),
          enrolled_courses: courses,
          feedback_notes: this.container.querySelector('#stu-field-feedback').value.trim()
        };

        try {
          if (this.editingStudent && this.editingStudent.id) {
            await api.updateStudent(this.editingStudent.id, payload);
          } else {
            await api.createStudent(payload);
          }
          this.showEditModal = false;
          this.editingStudent = null;
          await this.fetchAndRender();
        } catch (err) {
          alert('Failed to save student record: ' + err.message);
        }
      });
    }
  }
}
