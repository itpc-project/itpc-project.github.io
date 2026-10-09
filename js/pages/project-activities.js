/**
 * PROJECT ACTIVITIES CONTROLLER (หน้ารายการกิจกรรมของโครงการ)
 * จัดการแสดงผลข้อมูลโครงการ, ปุ่ม [เพิ่มกิจกรรม], และกล่องกิจกรรมที่บันทึกแล้ว
 * รองรับ 5 สถานะ: รอตรวจ, ดำเนินการ, แก้ไข, เสร็จสิ้น, ยกเลิก
 */

import { $, $$, addEvent, escapeHTML } from '../utils/dom.js';
import { showToast } from '../utils/toast.js';
import { initNavbar } from '../components/navbar.js';
import { ProjectService, SIX_MAIN_PROJECTS } from '../services/project-service.js';
import { ActivityService, ACTIVITY_STATUS_MAP } from '../services/activity-service.js';
import { AuthService } from '../services/auth-service.js';

let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();

  // 1. ดึงโครงการปัจจุบันจาก URL หรือ Session
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  let project = null;
  if (projectId) {
    project = ProjectService.getProjectById(projectId);
  } else {
    try {
      const stored = sessionStorage.getItem('satit_cmu_active_project');
      if (stored) project = JSON.parse(stored);
    } catch { }
  }

  if (!project) {
    project = SIX_MAIN_PROJECTS[4]; // Default: พลเมืองไทยบนวิถีโลก
  }

  // บันทึกลง Session ปัจจุบัน
  sessionStorage.setItem('satit_cmu_active_project', JSON.stringify(project));

  // 2. แสดงข้อมูลใน Project Header
  renderProjectHeader(project);

  // 3. แสดงแถบสิทธิ์ผู้ดูแลระบบ (Admin Role Banner)
  renderRolePermissionBanner(project);

  // 4. ผูก Event กรองสถานะ
  initFilterBar(project);

  // 5. เรนเดอร์กล่องกิจกรรมที่ถูกบันทึกเข้ามาแล้ว
  renderActivitiesList(project);

  // 5. จัดการปุ่ม [เพิ่มกิจกรรม] (ด้านบน)
  const addActivityBtn = $('#addActivityBtn');
  if (addActivityBtn) {
    addEvent(addActivityBtn, 'click', () => {
      showToast({
        type: 'info',
        title: 'กำลังเปิดแบบฟอร์ม',
        message: `เปิดแบบฟอร์มขออนุมัติกิจกรรมสำหรับ "${project.title}"`
      });
      setTimeout(() => {
        window.location.href = `/activity-form.html?id=${encodeURIComponent(project.id)}&mode=new`;
      }, 350);
    });
  }
});

/**
 * กำหนด Event ให้กับปุ่มตัวกรองสถานะทั้ง 5 สถานะ
 */
function initFilterBar(project) {
  const chips = $$('.status-filter-chip');
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const filter = chip.getAttribute('data-filter') || 'all';
      currentFilter = filter;
      chips.forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      renderActivitiesList(project);
    });
  });
}

/**
 * แสดงข้อมูลสรุปของโครงการด้านบน
 */
function renderProjectHeader(project) {
  const iconEl = $('#projectHeaderIcon');
  const titleEl = $('#projectHeaderTitle');
  const codeEl = $('#projectHeaderCode');
  const yearEl = $('#projectHeaderYear');
  const gradeEl = $('#projectHeaderGrade');
  const personEl = $('#projectHeaderPerson');
  const cardEl = $('#projectHeaderCard');

  if (iconEl) iconEl.textContent = project.icon || '📁';
  if (titleEl) titleEl.textContent = project.title;
  if (codeEl) codeEl.textContent = project.code;
  if (yearEl) yearEl.textContent = `ปีงบประมาณ ${project.fiscalYear}`;
  if (gradeEl) gradeEl.textContent = project.gradeLevel;
  if (personEl) personEl.textContent = `อาจารย์ผู้รับผิดชอบ: ${project.responsiblePerson}`;
  if (cardEl && project.themeColor) {
    cardEl.style.setProperty('--project-theme', project.themeColor);
  }
}

/**
 * เรนเดอร์กล่องกิจกรรมที่บันทึกแล้ว (ด้านล่าง) พร้อมตัวเลือกสถานะทั้ง 5 ในแต่ละกล่อง
 */
function renderActivitiesList(project) {
  const grid = $('#activitiesGrid');
  const countBadge = $('#activitiesCountBadge');
  if (!grid) return;

  const allActivities = ActivityService.getActivitiesByProject(project.id);

  // อัปเดตจำนวนกิจกรรมใน Badge ด้านบน
  if (countBadge) {
    countBadge.textContent = `${allActivities.length} กิจกรรม`;
  }

  // อัปเดตตัวเลขในแต่ละแท็บตัวกรอง
  updateFilterCounts(allActivities);

  // กรองตามสถานะที่เลือก
  const filteredActivities = currentFilter === 'all'
    ? allActivities
    : allActivities.filter((act) => act.status === currentFilter);

  // หากไม่มีกิจกรรมเลยในโครงการนี้
  if (allActivities.length === 0) {
    grid.innerHTML = `
      <div class="activities-empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">📋</div>
        <h4 style="font-family: var(--font-family-thai); font-size: var(--font-size-lg); font-weight: 700; margin-bottom: var(--space-2);">
          ยังไม่มีกิจกรรมที่ถูกบันทึกในโครงการนี้
        </h4>
        <p style="font-family: var(--font-family-thai); font-size: var(--font-size-sm); color: var(--text-muted); margin-bottom: var(--space-6);">
          กดปุ่ม "[เพิ่มกิจกรรม]" ด้านบนเพื่อเริ่มต้นกรอกแบบฟอร์มขออนุมัติบรรจุกิจกรรมตามแบบฟอร์ม Excel
        </p>
        <button type="button" class="btn btn-primary btn-sm" id="emptyAddBtn">
          <span>+ เพิ่มกิจกรรมใหม่</span>
        </button>
      </div>
    `;

    const emptyAddBtn = $('#emptyAddBtn');
    if (emptyAddBtn) {
      addEvent(emptyAddBtn, 'click', () => {
        window.location.href = `/activity-form.html?id=${encodeURIComponent(project.id)}&mode=new`;
      });
    }
    return;
  }

  // หากมีกิจกรรมแต่ไม่ตรงกับ Filter ที่เลือก
  if (filteredActivities.length === 0) {
    const filterCfg = ACTIVITY_STATUS_MAP[currentFilter] || { label: 'สถานะนี้' };
    grid.innerHTML = `
      <div class="activities-empty-state" style="grid-column: 1 / -1; padding: var(--space-8) var(--space-4);">
        <div class="empty-state-icon" style="font-size: 1.5rem; width: 3.5rem; height: 3.5rem;">🔍</div>
        <h4 style="font-family: var(--font-family-thai); font-size: var(--font-size-base); font-weight: 700; margin-bottom: var(--space-2);">
          ไม่พบกิจกรรมที่มีสถานะ "${filterCfg.label}"
        </h4>
        <p style="font-family: var(--font-family-thai); font-size: var(--font-size-xs); color: var(--text-muted); margin-bottom: var(--space-4);">
          สามารถเลือกดูสถานะอื่น หรือเลือก "ทั้งหมด" เพื่อดูกิจกรรมทั้งหมด (${allActivities.length} กิจกรรม)
        </p>
        <button type="button" class="btn btn-secondary btn-sm" id="btnResetFilter">
          <span>แสดงกิจกรรมทั้งหมด</span>
        </button>
      </div>
    `;

    const resetBtn = $('#btnResetFilter');
    if (resetBtn) {
      addEvent(resetBtn, 'click', () => {
        currentFilter = 'all';
        $$('.status-filter-chip').forEach((c) => {
          c.classList.toggle('is-active', c.getAttribute('data-filter') === 'all');
        });
        renderActivitiesList(project);
      });
    }
    return;
  }

  const isAdmin = AuthService.isAdmin();

  // เรนเดอร์กล่องกิจกรรมแต่ละกล่อง
  grid.innerHTML = filteredActivities
    .map((act) => {
      const statusCfg = ACTIVITY_STATUS_MAP[act.status] || ACTIVITY_STATUS_MAP['review'];

      // สถานะ: เฉพาะแอดมินเท่านั้นที่สามารถกำหนดหรือเปลี่ยนสถานะกิจกรรมได้
      let statusControlHtml = '';
      if (isAdmin) {
        statusControlHtml = `
          <div class="activity-status-wrapper">
            <div class="activity-status-pill ${statusCfg.badgeClass}" title="👑 สิทธิ์แอดมิน: คลิกเพื่อเปลี่ยนสถานะกิจกรรม">
              <span class="status-dot"></span>
              <select class="activity-status-select" data-id="${act.id}" aria-label="สถานะกิจกรรม ${escapeHTML(act.title)}">
                <option value="review" ${statusCfg.key === 'review' ? 'selected' : ''}>รอตรวจ</option>
                <option value="in-progress" ${statusCfg.key === 'in-progress' ? 'selected' : ''}>ดำเนินการ</option>
                <option value="edit" ${statusCfg.key === 'edit' ? 'selected' : ''}>แก้ไข</option>
                <option value="completed" ${statusCfg.key === 'completed' ? 'selected' : ''}>เสร็จสิ้น</option>
                <option value="cancelled" ${statusCfg.key === 'cancelled' ? 'selected' : ''}>ยกเลิก</option>
              </select>
              <svg class="status-chevron-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        `;
      } else {
        statusControlHtml = `
          <div class="activity-status-wrapper">
            <div class="activity-status-pill ${statusCfg.badgeClass} is-locked" data-action="locked-status" data-id="${act.id}" title="🔒 เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถเปลี่ยนสถานะได้ (สถานะปัจจุบัน: ${statusCfg.label})">
              <span class="status-dot"></span>
              <span class="status-locked-label">${statusCfg.label}</span>
              <span class="status-lock-icon" aria-hidden="true">🔒</span>
            </div>
          </div>
        `;
      }

      return `
      <article class="activity-card" data-id="${act.id}" data-status="${statusCfg.key}">
        <div>
          <!-- Header พร้อมตัวเลือกสถานะ (แอดมินเปลี่ยนได้ / อาจารย์ดูได้อย่างเดียว) -->
          <div class="activity-card-header">
            <span class="activity-code-badge">${escapeHTML(act.code)}</span>
            ${statusControlHtml}
          </div>

          <!-- Activity Title -->
          <h4 class="activity-card-title">${escapeHTML(act.title)}</h4>

          <!-- Metadata Grid -->
          <div class="activity-meta-grid">
            <div class="activity-meta-item">
              <span class="activity-meta-label">กำหนดการ</span>
              <span class="activity-meta-value">
                <span>📅</span>
                <span>${escapeHTML(act.dateRange || '-')}</span>
              </span>
            </div>
            <div class="activity-meta-item">
              <span class="activity-meta-label">สถานที่</span>
              <span class="activity-meta-value">
                <span>📍</span>
                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHTML(act.location || '-')}</span>
              </span>
            </div>
            <div class="activity-meta-item">
              <span class="activity-meta-label">ผู้เข้าร่วม</span>
              <span class="activity-meta-value">
                <span>👥</span>
                <span>${act.participants?.students || 0} คน (รวม ${act.participants?.total || 0})</span>
              </span>
            </div>
            <div class="activity-meta-item">
              <span class="activity-meta-label">งบประมาณ</span>
              <span class="activity-meta-value" style="color: var(--cmu-purple-700); font-weight: 700;">
                <span>💰</span>
                <span>${(act.budget || 0).toLocaleString()} บาท</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="activity-card-actions">
          <button type="button" class="btn btn-primary btn-sm btn-edit-form" data-id="${act.id}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <polyline points="13 8 17 12 13 16"></polyline>
            </svg>
            <span>เปิดแบบฟอร์ม</span>
          </button>
        </div>
      </article>
    `;
    })
    .join('');

  // 1. ผูก Event เปลี่ยนสถานะ (เฉพาะแอดมินที่มีสิทธิ์)
  if (isAdmin) {
    grid.querySelectorAll('.activity-status-select').forEach((select) => {
      select.addEventListener('change', (e) => {
        e.stopPropagation();
        const actId = select.getAttribute('data-id');
        const newStatus = select.value;

        const result = ActivityService.updateActivityStatus(actId, newStatus);
        if (result && result.success) {
          const newCfg = ACTIVITY_STATUS_MAP[newStatus] || ACTIVITY_STATUS_MAP['review'];
          showToast({
            type: 'success',
            title: 'แอดมินอัปเดตสถานะกิจกรรมสำเร็จ 👑',
            message: `ปรับสถานะเป็น "${newCfg.label}" เรียบร้อยแล้ว`
          });

          // เรนเดอร์ใหม่เพื่ออัปเดตสถิติตัวกรองและคลาสสี
          renderActivitiesList(project);
        } else {
          showToast({
            type: 'error',
            title: 'ไม่สามารถเปลี่ยนสถานะได้',
            message: result?.message || 'เฉพาะแอดมินเท่านั้นที่สามารถเปลี่ยนสถานะได้'
          });
        }
      });
    });
  } else {
    // ผู้ใช้ทั่วไป / อาจารย์: เมื่อคลิกที่สถานะที่ถูกล็อค จะแสดงข้อความแจ้งเตือนสิทธิ์
    grid.querySelectorAll('.activity-status-pill.is-locked').forEach((pill) => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        showToast({
          type: 'warning',
          title: 'สถานะถูกล็อค 🔒',
          message: 'คุณไม่มีสิทธิ์: เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถกำหนดหรือเปลี่ยนสถานะกิจกรรมได้'
        });
      });
    });
  }

  // 2. ผูกคลิกเพื่อเปิดแบบฟอร์ม Excel
  grid.querySelectorAll('.btn-edit-form').forEach((btn) => {
    btn.addEventListener('click', () => {
      const actId = btn.getAttribute('data-id');
      window.location.href = `/activity-form.html?id=${encodeURIComponent(project.id)}&actId=${encodeURIComponent(actId)}`;
    });
  });
}

/**
 * แสดงแถบข้อมูลสิทธิ์การใช้งาน (Admin / Teacher Mode) และปุ่มสลับบทบาทด่วนเพื่อทดสอบ
 */
function renderRolePermissionBanner(project) {
  const banner = $('#rolePermissionBanner');
  if (!banner) return;

  const currentUser = AuthService.getCurrentUser();
  const isAdmin = AuthService.isAdmin();

  if (isAdmin) {
    banner.innerHTML = `
      <div class="role-banner-admin">
        <div class="banner-left">
          <span class="banner-avatar">👑</span>
          <div>
            <div class="banner-title">
              <span>โหมดผู้ดูแลระบบ (Admin Access Mode)</span>
              <span class="badge badge-purple" style="font-size: 11px;">สิทธิ์เต็ม</span>
            </div>
            <div class="banner-desc">
              ผู้ใช้งาน: <strong>${escapeHTML(currentUser.name || 'ผู้ดูแลระบบ')}</strong> • คุณมีสิทธิ์กำหนดและเปลี่ยนสถานะกิจกรรมได้ทุกสถานะ (รอตรวจ / ดำเนินการ / แก้ไข / เสร็จสิ้น / ยกเลิก)
            </div>
          </div>
        </div>
        <div class="banner-actions">
          <button type="button" class="btn-role-switch" id="btnSwitchRole" title="คลิกเพื่อสลับเป็นมุมมองอาจารย์ (สถานะจะถูกล็อค)">
            <span>👨‍🏫 สลับเป็นสิทธิ์อาจารย์ (ทดสอบการล็อคสถานะ)</span>
          </button>
        </div>
      </div>
    `;
  } else {
    banner.innerHTML = `
      <div class="role-banner-teacher">
        <div class="banner-left">
          <span class="banner-avatar">🔒</span>
          <div>
            <div class="banner-title">
              <span>โหมดอาจารย์ผู้รับผิดชอบ (Teacher Mode)</span>
              <span class="badge badge-blue" style="font-size: 11px;">ดูสถานะเท่านั้น</span>
            </div>
            <div class="banner-desc">
              ผู้ใช้งาน: <strong>${escapeHTML(currentUser.name || 'อาจารย์ผู้รับผิดชอบ')}</strong> • <strong>สถานะกิจกรรมถูกล็อค</strong> (เฉพาะแอดมินเท่านั้นที่สามารถพิจารณากำหนดสถานะกิจกรรมได้)
            </div>
          </div>
        </div>
        <div class="banner-actions">
          <button type="button" class="btn-role-switch btn-switch-admin" id="btnSwitchRole" title="คลิกเพื่อสลับเป็นผู้ดูแลระบบ (เพื่อเปิดสิทธิ์แก้ไขสถานะ)">
            <span>👑 สลับเป็นสิทธิ์แอดมิน (เปิดสิทธิ์เปลี่ยนสถานะ)</span>
          </button>
        </div>
      </div>
    `;
  }

  const switchBtn = $('#btnSwitchRole');
  if (switchBtn) {
    switchBtn.addEventListener('click', () => {
      if (isAdmin) {
        AuthService.switchRole('teacher');
        showToast({
          type: 'info',
          title: 'สลับเป็นสิทธิ์อาจารย์แล้ว 👨‍🏫',
          message: 'สถานะกิจกรรมในแต่ละกล่องถูกล็อคแล้ว (ดูได้อย่างเดียว)'
        });
      } else {
        AuthService.switchRole('admin');
        showToast({
          type: 'success',
          title: 'สลับเป็นสิทธิ์แอดมินแล้ว 👑',
          message: 'ปลดล็อคแล้ว! คุณสามารถกำหนดสถานะกิจกรรมในแต่ละกล่องได้อิสระ'
        });
      }

      initNavbar();
      renderRolePermissionBanner(project);
      renderActivitiesList(project);
    });
  }
}

/**
 * อัปเดตตัวเลขจำนวนกิจกรรมบน Chip แต่ละสถานะ
 */
function updateFilterCounts(activities) {
  const setEl = (id, count) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(count);
  };

  setEl('countAll', activities.length);
  setEl('countReview', activities.filter((a) => a.status === 'review').length);
  setEl('countProgress', activities.filter((a) => a.status === 'in-progress').length);
  setEl('countEdit', activities.filter((a) => a.status === 'edit').length);
  setEl('countCompleted', activities.filter((a) => a.status === 'completed').length);
  setEl('countCancelled', activities.filter((a) => a.status === 'cancelled').length);
}
