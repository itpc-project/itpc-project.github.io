/**
 * PROJECTS PAGE CONTROLLER (หน้าที่ 2: กล่องโครงการต่างๆ)
 * จัดการแสดงผลรายการ 6 โครงการหลัก คลิกที่กล่องโครงการเพื่อเข้าสู่หน้ารายการกิจกรรม
 */

import { $, $$, addEvent, escapeHTML } from '../utils/dom.js';
import { showToast } from '../utils/toast.js';
import { initNavbar } from '../components/navbar.js';
import { initModal } from '../components/modal.js';
import { ProjectService } from '../services/project-service.js';
import { ActivityService } from '../services/activity-service.js';
import { AuthService } from '../services/auth-service.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();

  const currentUser = AuthService.getCurrentUser();
  const userNameEl = $('#heroUserName');
  if (userNameEl && currentUser) {
    userNameEl.textContent = currentUser.name;
  }

  // Elements
  const projectsGrid = $('#projectsGrid');
  const searchInput = $('#searchInput');
  const fiscalYearSelect = $('#fiscalYearSelect');
  const statusSelect = $('#statusSelect');
  const gradeLevelSelect = $('#gradeLevelSelect');
  const filterChips = $$('.filter-chip');
  const newProjectBtn = $('#newProjectBtn');
  const newProjectModalEl = $('#newProjectModal');
  const newProjectForm = $('#newProjectForm');
  const importExcelBtn = $('#importExcelBtn');
  const importExcelModalEl = $('#importExcelModal');

  // Filter state
  const filterState = {
    search: '',
    fiscalYear: 'all',
    gradeLevel: 'all',
    status: 'all'
  };

  updateStatistics();
  renderProjectCards();

  // อัปเดตรายการโครงการและสถิติแบบเรียลไทม์เมื่อได้รับข้อมูลใหม่จาก Cloud
  window.addEventListener('satit-cmu-cloud-synced', () => {
    updateStatistics();
    renderProjectCards();
  });

  // Search input handler
  if (searchInput) {
    addEvent(searchInput, 'input', (e) => {
      filterState.search = e.target.value;
      renderProjectCards();
    });
  }

  // Dropdown filters handler
  if (fiscalYearSelect) {
    addEvent(fiscalYearSelect, 'change', (e) => {
      filterState.fiscalYear = e.target.value;
      renderProjectCards();
    });
  }

  if (statusSelect) {
    addEvent(statusSelect, 'change', (e) => {
      filterState.status = e.target.value;
      updateChipActiveState(e.target.value);
      renderProjectCards();
    });
  }

  if (gradeLevelSelect) {
    addEvent(gradeLevelSelect, 'change', (e) => {
      filterState.gradeLevel = e.target.value;
      renderProjectCards();
    });
  }

  // Filter chips handler
  filterChips.forEach((chip) => {
    addEvent(chip, 'click', () => {
      const statusValue = chip.getAttribute('data-status');
      filterState.status = statusValue;
      if (statusSelect) statusSelect.value = statusValue;
      updateChipActiveState(statusValue);
      renderProjectCards();
    });
  });

  function updateChipActiveState(activeStatus) {
    filterChips.forEach((chip) => {
      if (chip.getAttribute('data-status') === activeStatus) {
        chip.classList.add('is-active');
      } else {
        chip.classList.remove('is-active');
      }
    });
  }

  // New Project Modal
  const projectModal = initModal(newProjectModalEl);
  if (newProjectBtn) {
    addEvent(newProjectBtn, 'click', () => {
      projectModal.open();
    });
  }

  if (newProjectForm) {
    addEvent(newProjectForm, 'submit', (e) => {
      e.preventDefault();
      const title = $('#newProjectTitle').value.trim();
      const activityName = $('#newActivityName').value.trim();
      const fiscalYear = $('#newFiscalYear').value;
      const gradeLevel = $('#newGradeLevel').value;
      const responsiblePerson = $('#newResponsiblePerson').value.trim();
      const budget = $('#newBudget').value;
      const students = $('#newStudents').value;
      const teachers = $('#newTeachers').value;
      const dateRange = $('#newDateRange').value.trim();
      const location = $('#newLocation').value.trim();

      if (!title) {
        showToast({
          type: 'error',
          title: 'ข้อมูลไม่ครบถ้วน',
          message: 'กรุณากรอกชื่อโครงการ'
        });
        return;
      }

      const created = ProjectService.createProject({
        title,
        activityName,
        fiscalYear,
        gradeLevel,
        responsiblePerson,
        budget,
        students,
        teachers,
        dateRange,
        location
      });

      showToast({
        type: 'success',
        title: 'สร้างโครงการสำเร็จ',
        message: `โครงการ "${created.title}" ถูกบันทึกเรียบร้อยแล้ว`
      });

      projectModal.close();
      newProjectForm.reset();
      updateStatistics();
      renderProjectCards();
    });
  }

  // Import Excel Modal
  const excelModal = initModal(importExcelModalEl);
  if (importExcelBtn) {
    addEvent(importExcelBtn, 'click', () => {
      excelModal.open();
    });
  }

  const uploadExcelBtn = $('#confirmUploadExcelBtn');
  if (uploadExcelBtn) {
    addEvent(uploadExcelBtn, 'click', () => {
      showToast({
        type: 'success',
        title: 'นำเข้าข้อมูลจาก Excel สำเร็จ',
        message: 'นำเข้าข้อมูลโครงการจากไฟล์ Excel_example.xlsx เรียบร้อย'
      });
      excelModal.close();
      setTimeout(() => {
        window.location.href = '/project-activities.html?id=PRJ-CITIZEN-05';
      }, 500);
    });
  }

  // Edit Project Modal
  const editProjectModalEl = $('#editProjectModal');
  const editProjectModal = editProjectModalEl ? initModal(editProjectModalEl, { staticBackdrop: true }) : null;
  const btnSaveProjectFromOverview = $('#btnSaveProjectFromOverview');

  if (btnSaveProjectFromOverview) {
    addEvent(btnSaveProjectFromOverview, 'click', () => {
      const projectId = $('#editProjectId')?.value;
      const title = $('#editProjectTitle')?.value.trim();
      const activityName = $('#editProjectActivityName')?.value.trim();
      const responsiblePerson = $('#editProjectResponsiblePerson')?.value.trim();
      const budget = $('#editProjectBudget')?.value;
      const gradeLevel = $('#editProjectGradeLevel')?.value.trim();
      const dateRange = $('#editProjectDateRange')?.value.trim();
      const location = $('#editProjectLocation')?.value.trim();
      const department = $('#editProjectDepartment')?.value.trim();
      const fiscalYear = $('#editProjectFiscalYear')?.value.trim();

      if (!title) {
        showToast({ type: 'warning', title: 'กรุณากรอกชื่อโครงการ', message: 'ชื่อโครงการต้องไม่เป็นค่าว่าง' });
        $('#editProjectTitle')?.focus();
        return;
      }
      if (!responsiblePerson) {
        showToast({ type: 'warning', title: 'กรุณากรอกผู้รับผิดชอบ', message: 'กรุณาระบุชื่ออาจารย์ผู้รับผิดชอบโครงการ' });
        $('#editProjectResponsiblePerson')?.focus();
        return;
      }
      if (budget === '' || isNaN(Number(budget))) {
        showToast({ type: 'warning', title: 'งบประมาณไม่ถูกต้อง', message: 'กรุณากรอกจำนวนงบประมาณเป็นตัวเลข' });
        $('#editProjectBudget')?.focus();
        return;
      }

      const updated = ProjectService.updateProject(projectId, {
        title,
        activityName,
        responsiblePerson,
        budget: Number(budget),
        gradeLevel,
        dateRange,
        location,
        department,
        fiscalYear: fiscalYear || '2569'
      });

      if (updated) {
        showToast({
          type: 'success',
          title: 'บันทึกโครงการสำเร็จ! ✨',
          message: `อัปเดตข้อมูลโครงการ "${updated.title}" เรียบร้อยแล้ว`
        });
        if (editProjectModal) editProjectModal.close();
        updateStatistics();
        renderProjectCards();
      }
    });
  }

  // เรนเดอร์การ์ด 6 กล่องโครงการ (คลิกเข้าได้เลยโดยตรง)
  function renderProjectCards() {
    if (!projectsGrid) return;

    const isAdmin = AuthService.isAdmin();
    const filtered = ProjectService.filterProjects(filterState);
    const countEl = $('#projectsCountBadge');
    if (countEl) {
      countEl.textContent = `${filtered.length} โครงการ`;
    }

    if (filtered.length === 0) {
      projectsGrid.innerHTML = `
        <div class="projects-empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <h4 class="empty-state-title">ไม่พบโครงการที่ตรงกับเงื่อนไขการค้นหา</h4>
          <p class="empty-state-desc">ลองปรับคำค้นหาหรือเปลี่ยนตัวกรองระดับชั้น</p>
          <button type="button" class="btn btn-secondary btn-sm" id="resetFiltersBtn">
            รีเซ็ตตัวกรองทั้งหมด
          </button>
        </div>
      `;

      const resetBtn = $('#resetFiltersBtn');
      if (resetBtn) {
        addEvent(resetBtn, 'click', () => {
          if (searchInput) searchInput.value = '';
          if (fiscalYearSelect) fiscalYearSelect.value = 'all';
          if (statusSelect) statusSelect.value = 'all';
          if (gradeLevelSelect) gradeLevelSelect.value = 'all';
          filterState.search = '';
          filterState.fiscalYear = 'all';
          filterState.status = 'all';
          filterState.gradeLevel = 'all';
          updateChipActiveState('all');
          renderProjectCards();
        });
      }
      return;
    }

    projectsGrid.innerHTML = filtered
      .map((project) => {
        const activities = ActivityService.getActivitiesByProject(project.id);
        const statusClass =
          project.status === 'approved'
            ? 'status-active'
            : project.status === 'active'
            ? 'status-pending'
            : 'status-draft';

        return `
        <article class="project-card" data-id="${project.id}" style="--card-accent: ${project.themeColor || '#6F2C91'};" title="คลิกเพื่อเข้าสู่โครงการ ${escapeHTML(project.title)}">
          <div>
            <!-- Header: Icon & Tags -->
            <div class="project-card-header">
              <div class="project-brand-badge">
                <div class="project-icon-box">${project.icon || '📁'}</div>
                <span class="project-code-tag">${escapeHTML(project.code)}</span>
              </div>
              <div class="project-tags-group">
                <span class="badge badge-purple">ปี ${escapeHTML(project.fiscalYear)}</span>
                <span class="status-pill ${statusClass}">
                  <span class="badge-dot"></span>
                  <span>${escapeHTML(project.statusLabel)}</span>
                </span>
                ${isAdmin ? `
                  <button type="button" class="btn-card-edit-project" data-id="${project.id}" title="แก้ไขข้อมูลโครงการ (สำหรับผู้มีสิทธิ์กำหนดสถานะ)">
                    <span>✏️ แก้ไข</span>
                  </button>
                ` : ''}
              </div>
            </div>

            <!-- Title -->
            <h4 class="project-card-title">${escapeHTML(project.title)}</h4>
            <div class="project-activity-name">
              ${escapeHTML(project.activityName)}
            </div>

            <!-- Meta Grid -->
            <div class="project-meta-grid">
              <div class="meta-item">
                <span class="meta-label">อาจารย์ผู้รับผิดชอบ</span>
                <span class="meta-value">
                  <span>👨‍🏫</span>
                  <span>${escapeHTML(project.responsiblePerson)}</span>
                </span>
              </div>
              <div class="meta-item">
                <span class="meta-label">กลุ่มเป้าหมาย</span>
                <span class="meta-value">
                  <span>👥</span>
                  <span>${escapeHTML(project.gradeLevel)}</span>
                </span>
              </div>
              <div class="meta-item">
                <span class="meta-label">งบประมาณ</span>
                <span class="meta-value" style="color: ${project.themeColor || 'var(--cmu-purple-700)'}; font-weight:700;">
                  <span>💰</span>
                  <span>${project.budget.toLocaleString()} บาท</span>
                </span>
              </div>
              <div class="meta-item">
                <span class="meta-label">กำหนดการ</span>
                <span class="meta-value">
                  <span>📅</span>
                  <span>${escapeHTML(project.dateRange)}</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Card Footer: Clickable Action Link -->
          <div class="project-card-footer">
            <span class="project-activities-count">${activities.length} กิจกรรม</span>
            <div class="project-enter-hint">
              <span>ดูกิจกรรมและจัดการเอกสาร</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </div>
        </article>
      `;
      })
      .join('');

    // จัดการปุ่มแก้ไขโครงการบนการ์ด
    projectsGrid.querySelectorAll('.btn-card-edit-project').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const p = ProjectService.getProjectById(id);
        if (p && editProjectModal) {
          const editIdEl = $('#editProjectId');
          const editTitleEl = $('#editProjectTitle');
          const editActEl = $('#editProjectActivityName');
          const editRespEl = $('#editProjectResponsiblePerson');
          const editBudEl = $('#editProjectBudget');
          const editGradeEl = $('#editProjectGradeLevel');
          const editDateEl = $('#editProjectDateRange');
          const editLocEl = $('#editProjectLocation');
          const editDeptEl = $('#editProjectDepartment');
          const editYearEl = $('#editProjectFiscalYear');

          if (editIdEl) editIdEl.value = p.id;
          if (editTitleEl) editTitleEl.value = p.title || '';
          if (editActEl) editActEl.value = p.activityName || '';
          if (editRespEl) editRespEl.value = p.responsiblePerson || '';
          if (editBudEl) editBudEl.value = p.budget || 0;
          if (editGradeEl) editGradeEl.value = p.gradeLevel || '';
          if (editDateEl) editDateEl.value = p.dateRange || '';
          if (editLocEl) editLocEl.value = p.location || '';
          if (editDeptEl) editDeptEl.value = p.department || '';
          if (editYearEl) editYearEl.value = p.fiscalYear || '2569';

          editProjectModal.open();
          if (editTitleEl) setTimeout(() => editTitleEl.focus(), 100);
        }
      });
    });

    // คลิกเข้าที่กล่องโครงการได้เลยโดยตรง
    projectsGrid.querySelectorAll('.project-card').forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const project = ProjectService.getProjectById(id);
        sessionStorage.setItem('satit_cmu_active_project', JSON.stringify(project));
        showToast({
          type: 'info',
          title: project.title,
          message: 'กำลังเปิดหน้ารายการกิจกรรม...'
        });
        setTimeout(() => {
          window.location.href = `/project-activities.html?id=${encodeURIComponent(id)}`;
        }, 300);
      });
    });
  }

  function updateStatistics() {
    const stats = ProjectService.getStatistics();
    const statProjects = $('#statTotalProjects');
    const statBudget = $('#statTotalBudget');
    const statDocs = $('#statCompletedDocs');
    const statActive = $('#statActiveProjects');

    if (statProjects) statProjects.textContent = stats.totalProjects;
    if (statBudget) statBudget.textContent = `${(stats.totalBudget / 1000).toFixed(0)}k ฿`;
    if (statDocs) statDocs.textContent = `${stats.completedDocs}/${stats.totalDocs}`;
    if (statActive) statActive.textContent = stats.activeProjects;
  }
});
