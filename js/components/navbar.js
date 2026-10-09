/**
 * NAVBAR CONTROLLER
 * จัดการส่วนหัวของระบบ แสดงข้อมูลผู้ใช้ สลับธีม และออกจากระบบ
 */

import { APP_CONFIG, DEMO_ACCOUNTS } from '../config.js';
import { AuthService } from '../services/auth-service.js';
import { $, addEvent } from '../utils/dom.js';
import { showToast } from '../utils/toast.js';
import { injectUserModals, openProfileModal, openUserManagementModal } from './user-management-modal.js';

import { CloudSyncService } from '../services/cloud-sync-service.js';
import { initModal } from './modal.js';

export function initNavbar() {
  // เริ่มต้นระบบ Cloud Realtime JSON Sync
  CloudSyncService.init();

  // 1. ดึงข้อมูลผู้ใช้ปัจจุบัน (หากไม่มี ให้ใช้บัญชีตัวอย่างเพื่อความสะดวกในการทดสอบ)
  let currentUser = AuthService.getCurrentUser();
  if (!currentUser) {
    currentUser = DEMO_ACCOUNTS[0]; // fallback
  }

  // Render user info in navbar
  const userAvatarEl = $('#navbarUserAvatar');
  const userNameEl = $('#navbarUserName');
  const userRoleEl = $('#navbarUserRole');
  const userChip = $('.navbar-user-chip');

  if (userAvatarEl) userAvatarEl.textContent = currentUser.avatar || (AuthService.isAdmin() ? '👑' : '👨‍🏫');
  if (userNameEl) userNameEl.textContent = currentUser.name || 'ผู้ใช้งานระบบ';
  
  const isAdmin = AuthService.isAdmin();
  if (userRoleEl) {
    if (isAdmin) {
      userRoleEl.textContent = '👑 แอดมิน (กำหนดสถานะได้)';
      userRoleEl.style.background = 'linear-gradient(135deg, var(--cmu-purple-700) 0%, #451d5b 100%)';
      userRoleEl.style.color = '#fcd34d';
      userRoleEl.style.border = '1px solid rgba(252, 211, 77, 0.4)';
    } else {
      userRoleEl.textContent = `${currentUser.role || 'อาจารย์'} (ดูสถานะเท่านั้น 🔒)`;
      userRoleEl.style.background = '';
      userRoleEl.style.color = '';
      userRoleEl.style.border = '';
    }
  }

  // Live update user details when synced from cloud
  window.addEventListener('satit-cmu-cloud-synced', () => {
    const freshUser = AuthService.getCurrentUser();
    if (freshUser) {
      const isFreshAdmin = AuthService.isAdmin();
      if (userAvatarEl) userAvatarEl.textContent = freshUser.avatar || (isFreshAdmin ? '👑' : '👨‍🏫');
      if (userNameEl) userNameEl.textContent = freshUser.name || 'ผู้ใช้งานระบบ';
      
      if (userRoleEl) {
        if (isFreshAdmin) {
          userRoleEl.textContent = '👑 แอดมิน (กำหนดสถานะได้)';
          userRoleEl.style.background = 'linear-gradient(135deg, var(--cmu-purple-700) 0%, #451d5b 100%)';
          userRoleEl.style.color = '#fcd34d';
          userRoleEl.style.border = '1px solid rgba(252, 211, 77, 0.4)';
        } else {
          userRoleEl.textContent = `${freshUser.role || 'อาจารย์'} (ดูสถานะเท่านั้น 🔒)`;
          userRoleEl.style.background = '';
          userRoleEl.style.color = '';
          userRoleEl.style.border = '';
        }
      }

      if (userMgmtBtn) {
        userMgmtBtn.style.display = isFreshAdmin ? 'inline-flex' : 'none';
      }
      if (extAdminMgmtBtn) {
        extAdminMgmtBtn.style.display = isFreshAdmin ? 'inline-flex' : 'none';
      }
    }
  });

  // ผูกคลิกที่ชิปโปรไฟล์เพื่อเปิด "แก้ไขข้อมูลบัญชีส่วนตัว"
  if (userChip && !userChip.dataset.hasProfileListener) {
    userChip.dataset.hasProfileListener = 'true';
    userChip.setAttribute('title', 'คลิกเพื่อแก้ไขบัญชีส่วนตัว (ชื่อ, ตำแหน่ง, รหัสผ่าน, เบอร์โทร)');
    
    // Add small pencil hint if not present
    if (!userChip.querySelector('.user-chip-hint-icon')) {
      const hint = document.createElement('span');
      hint.className = 'user-chip-hint-icon';
      hint.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
        </svg>
      `;
      userChip.appendChild(hint);
    }

    addEvent(userChip, 'click', (e) => {
      e.preventDefault();
      if (window.location.pathname.includes('user-management.html')) {
        const tabBtn = document.getElementById('tabBtnProfile');
        if (tabBtn) tabBtn.click();
      } else {
        window.location.href = '/user-management.html?tab=profile';
      }
    });
  }

  // จัดการปุ่ม Cloud Sync และปุ่ม "จัดการผู้ใช้งาน (Admin)" บน Navbar Actions
  const navbarActions = $('.navbar-actions');
  const themeToggle = $('#themeToggleBtn');

  // 1. Cloud Sync Chip
  let cloudSyncBtn = $('#navbarCloudSyncBtn');
  if (navbarActions && !cloudSyncBtn) {
    cloudSyncBtn = document.createElement('button');
    cloudSyncBtn.id = 'navbarCloudSyncBtn';
    cloudSyncBtn.className = 'navbar-sync-chip';
    cloudSyncBtn.type = 'button';
    cloudSyncBtn.title = '🟢 เชื่อมต่อฐานข้อมูลออนไลน์ JSON (ข้อมูลซิงค์กันทุกเครื่อง)';
    cloudSyncBtn.innerHTML = `
      <span class="sync-dot"></span>
      <span class="sync-text">คลาวด์ JSON ออนไลน์</span>
    `;

    if (themeToggle) {
      navbarActions.insertBefore(cloudSyncBtn, themeToggle);
    } else {
      navbarActions.appendChild(cloudSyncBtn);
    }

    addEvent(cloudSyncBtn, 'click', (e) => {
      e.preventDefault();
      openCloudSyncModal();
    });
  }

  // 2. ปุ่มจัดการผู้ใช้งาน (Admin Only)
  let userMgmtBtn = $('#navbarUserMgmtBtn');
  if (navbarActions) {
    if (!userMgmtBtn) {
      userMgmtBtn = document.createElement('button');
      userMgmtBtn.id = 'navbarUserMgmtBtn';
      userMgmtBtn.className = 'btn-navbar-admin-mgmt';
      userMgmtBtn.type = 'button';
      userMgmtBtn.title = 'จัดการผู้ใช้งานและกำหนดสิทธิ์ (Admin Only)';
      userMgmtBtn.innerHTML = `
        <span class="mgmt-icon">👥</span>
        <span>จัดการผู้ใช้</span>
        <span class="badge badge-purple" style="font-size: 10px; padding: 1px 5px;">Admin</span>
      `;

      if (themeToggle) {
        navbarActions.insertBefore(userMgmtBtn, themeToggle);
      } else {
        navbarActions.appendChild(userMgmtBtn);
      }

      addEvent(userMgmtBtn, 'click', (e) => {
        e.preventDefault();
        if (window.location.pathname.includes('user-management.html')) {
          const tabBtn = document.getElementById('tabBtnUsers');
          if (tabBtn) tabBtn.click();
        } else {
          window.location.href = '/user-management.html?tab=users';
        }
      });
    }

    // แสดงปุ่มเฉพาะแอดมินเท่านั้น
    if (userMgmtBtn) {
      userMgmtBtn.style.display = isAdmin ? 'inline-flex' : 'none';
    }
  }

  // ผูกปุ่มจัดการผู้ใช้ภายนอกถ้ามีบนหน้า (เช่น ใน projects.html)
  const extAdminMgmtBtn = $('#btnAdminUserMgmtAction');
  if (extAdminMgmtBtn) {
    extAdminMgmtBtn.style.display = isAdmin ? 'inline-flex' : 'none';
    if (!extAdminMgmtBtn.dataset.hasListener) {
      extAdminMgmtBtn.dataset.hasListener = 'true';
      addEvent(extAdminMgmtBtn, 'click', () => {
        window.location.href = '/user-management.html?tab=users';
      });
    }
  }

  // 2. จัดการปุ่มสลับธีม
  const themeToggleBtn = $('#themeToggleBtn');
  if (themeToggleBtn) {
    const savedTheme = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.THEME) || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    addEvent(themeToggleBtn, 'click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.THEME, newTheme);
      showToast({
        type: 'info',
        title: 'เปลี่ยนธีม',
        message: newTheme === 'dark' ? 'เปิดใช้งานโหมดมืด (Dark Mode)' : 'เปิดใช้งานโหมดสว่าง (Light Mode)',
        duration: 2000
      });
    });
  }

  // 3. จัดการปุ่มออกจากระบบ
  const logoutBtn = $('#logoutBtn');
  if (logoutBtn) {
    addEvent(logoutBtn, 'click', (e) => {
      e.preventDefault();
      AuthService.logout();
      showToast({
        type: 'info',
        title: 'ออกจากระบบแล้ว',
        message: 'กำลังกลับสู่หน้าเข้าสู่ระบบ...'
      });
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 700);
    });
  }
}

/**
 * เปิด Modal ควบคุมฐานข้อมูลออนไลน์ JSON และการซิงค์ข้อมูล
 */
function openCloudSyncModal() {
  let modalEl = $('#cloudSyncModal');

  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'cloudSyncModal';
    modalEl.className = 'modal-backdrop';
    modalEl.setAttribute('aria-hidden', 'true');
    modalEl.innerHTML = `
      <div class="modal-container" style="max-width: 580px; width: 92%;">
        <div class="modal-header">
          <div class="modal-header-title-group" style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 42px; height: 42px; border-radius: 12px; background: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center; font-size: 1.35rem; color: #10b981; flex-shrink: 0;">☁️</div>
            <div>
              <h3 class="modal-title" style="font-size: 1.1rem; font-weight: 700;">ฐานข้อมูลออนไลน์ Cloud JSON</h3>
              <p class="modal-subtitle" style="font-size: 0.8125rem; color: var(--text-muted); margin: 0;">ข้อมูลซิงค์ออนไลน์เรียลไทม์ทุกเครื่องโดยไม่ต้องย้ายระบบใหม่</p>
            </div>
          </div>
          <button type="button" class="modal-close-btn" data-modal-close aria-label="ปิดหน้าต่าง">✕</button>
        </div>

        <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px; padding: 20px;">
          <!-- Live Status Card -->
          <div style="background: var(--bg-surface-elevated, #f8fafc); border: 1.5px solid var(--border-subtle, #e2e8f0); border-radius: 12px; padding: 14px 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span id="cloudModalSyncDot" class="sync-dot" style="width: 10px; height: 10px; border-radius: 50%; background-color: #f59e0b; display: inline-block;"></span>
                <span id="cloudModalSyncTitle" style="font-weight: 700; color: var(--text-main); font-size: 0.9375rem;">สถานะ: กำลังตรวจสอบ...</span>
              </div>
              <span id="cloudLastSyncTime" style="font-size: 0.75rem; color: var(--text-muted);">-</span>
            </div>
            <p id="cloudModalSyncDesc" style="font-size: 0.8125rem; color: var(--text-muted); line-height: 1.5; margin: 0 0 12px 0;">
              กำลังตรวจสอบการเชื่อมต่อฐานข้อมูลออนไลน์...
            </p>
            <div id="cloudDataStats" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; text-align: center;">
              <!-- Dynamic stats -->
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <button id="btnManualSyncNow" type="button" class="btn btn-primary" style="justify-content: center; padding: 10px 14px; font-weight: 600;">
              <span>🔄 ซิงค์ข้อมูลเดี๋ยวนี้</span>
            </button>
            <button id="btnExportJsonBackup" type="button" class="btn btn-secondary" style="justify-content: center; padding: 10px 14px; font-weight: 600;">
              <span>📥 ดาวน์โหลด JSON ทั้งหมด</span>
            </button>
          </div>

          <!-- File Import Action -->
          <div style="background: var(--bg-surface, #fff); border: 1.5px dashed var(--cmu-purple-300, #d8b4fe); border-radius: 10px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
            <div>
              <div style="font-weight: 700; font-size: 0.84rem; color: var(--text-main);">ย้ายข้อมูลข้ามเครื่องด้วยไฟล์ JSON</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">นำเข้าไฟล์ JSON สำรองจากเครื่องอื่น (ทำงานได้ทันทีไม่ต้องต่อ Database)</div>
            </div>
            <input type="file" id="inputImportJsonFile" accept=".json" style="display: none;" />
            <button id="btnTriggerImportJson" type="button" class="btn btn-outline btn-sm" style="flex-shrink: 0;">
              <span>📤 เลือกไฟล์ JSON</span>
            </button>
          </div>

          <!-- Cloud Database Setup (Firebase Realtime Database) -->
          <details id="detailsCloudConfig" style="font-size: 0.8125rem; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 10px;" open>
            <summary style="cursor: pointer; font-weight: 700; color: var(--cmu-purple-800); user-select: none;">🌐 เชื่อมต่อ Firebase Realtime Database (ออนไลน์ทุกเครื่อง)</summary>
            <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px;">
              <div style="background: rgba(111, 44, 145, 0.05); border: 1px solid var(--cmu-purple-200); border-radius: 8px; padding: 10px 12px; font-size: 0.75rem; line-height: 1.5; color: var(--text-main);">
                <strong>💡 วิธีทำให้เห็นออนไลน์ตรงกันทุกเครื่อง (ฟรี 100% โดย Google):</strong>
                <ol style="margin: 4px 0 0 16px; padding: 0;">
                  <li>เข้า <a href="https://console.firebase.google.com" target="_blank" rel="noopener" style="color: var(--cmu-purple-700); font-weight: 700; text-decoration: underline;">console.firebase.google.com</a> ด้วยบัญชี Google</li>
                  <li>สร้าง Project แล้วเลือกเมนู <strong>Build &gt; Realtime Database</strong> &gt; กด <strong>Create Database</strong></li>
                  <li>ที่แท็บ <strong>Rules</strong> เปลี่ยน <code>.read</code> และ <code>.write</code> เป็น <code>true</code> แล้วกด Publish</li>
                  <li>คัดลอก URL ของ Database (ขึ้นต้นด้วย <code>https://...firebasedatabase.app</code>) มาวางในช่องด้านล่าง</li>
                </ol>
              </div>

              <label for="inputFirebaseDbUrl" style="font-size: 0.75rem; font-weight: 700; color: var(--text-main); margin-top: 4px;">Firebase Realtime Database URL:</label>
              <div style="display: flex; gap: 8px;">
                <input type="text" id="inputFirebaseDbUrl" class="table-input" placeholder="https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app" style="padding: 8px 10px; font-size: 0.8125rem; flex: 1;" />
                <button id="btnSaveCloudConfig" type="button" class="btn btn-sm btn-primary" style="flex-shrink: 0; padding: 0 16px;">
                  <span>บันทึกและเชื่อมต่อ</span>
                </button>
              </div>
            </div>
          </details>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);

    // Wire up events inside modal
    const btnSyncNow = modalEl.querySelector('#btnManualSyncNow');
    const btnExport = modalEl.querySelector('#btnExportJsonBackup');
    const btnTriggerImport = modalEl.querySelector('#btnTriggerImportJson');
    const fileInput = modalEl.querySelector('#inputImportJsonFile');
    const btnSaveConfig = modalEl.querySelector('#btnSaveCloudConfig');
    const inputFirebase = modalEl.querySelector('#inputFirebaseDbUrl');

    if (btnSyncNow) {
      addEvent(btnSyncNow, 'click', async () => {
        btnSyncNow.disabled = true;
        btnSyncNow.innerHTML = '<span>⚡ กำลังซิงค์ข้อมูล...</span>';
        try {
          await CloudSyncService.pull(true);
          await CloudSyncService.push();
          showToast({
            type: 'success',
            title: 'ซิงค์ข้อมูลสำเร็จ',
            message: 'ข้อมูลในเครื่องและบนคลาวด์ตรงกัน 100% เรียบร้อยแล้ว'
          });
          refreshModalStats(modalEl);
        } catch (err) {
          showToast({
            type: 'error',
            title: 'การซิงค์ล้มเหลว',
            message: err.message || 'ไม่สามารถเชื่อมต่อได้ในขณะนี้'
          });
        } finally {
          btnSyncNow.disabled = false;
          btnSyncNow.innerHTML = '<span>🔄 ซิงค์ข้อมูลเดี๋ยวนี้</span>';
        }
      });
    }

    if (btnExport) {
      addEvent(btnExport, 'click', () => {
        CloudSyncService.downloadJSONBackup();
      });
    }

    if (btnTriggerImport && fileInput) {
      addEvent(btnTriggerImport, 'click', () => {
        fileInput.click();
      });

      addEvent(fileInput, 'change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const content = event.target.result;
            await CloudSyncService.importJSONData(content);
            refreshModalStats(modalEl);
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } catch (err) {
            showToast({
              type: 'error',
              title: 'อ่านไฟล์ไม่สำเร็จ',
              message: 'ไฟล์ JSON เสียหายหรือไม่ถูกต้อง'
            });
          }
        };
        reader.readAsText(file);
        fileInput.value = '';
      });
    }

    if (btnSaveConfig && inputFirebase) {
      addEvent(btnSaveConfig, 'click', async () => {
        const newUrl = inputFirebase.value.trim();
        CloudSyncService.saveConfig({ firebaseUrl: newUrl });
        showToast({
          type: 'success',
          title: 'บันทึกการตั้งค่าแล้ว',
          message: newUrl ? 'เชื่อมต่อ Firebase Realtime Database เรียบร้อย' : 'รีเซ็ตกลับเป็นโหมดเครื่อง'
        });
        const pullRes = await CloudSyncService.pull(true);
        // หาก Database เพิ่งสร้างใหม่ยังไม่มีข้อมูล ให้ Push ข้อมูลจากเครื่องนี้ขึ้นไปเป็นข้อมูลเริ่มต้นทันที
        if (!pullRes?.data || !pullRes.data.projects || pullRes.data.projects.length === 0) {
          await CloudSyncService.push();
        }
        refreshModalStats(modalEl);
      });
    }
  }

  // Populate data and open
  refreshModalStats(modalEl);
  const modalInstance = initModal(modalEl);
  modalInstance.open();
}

/**
 * รีเฟรชตัวเลขสถิติใน Cloud Sync Modal
 */
function refreshModalStats(modalEl) {
  const statsContainer = modalEl.querySelector('#cloudDataStats');
  const inputFirebase = modalEl.querySelector('#inputFirebaseDbUrl');
  const lastSyncEl = modalEl.querySelector('#cloudLastSyncTime');
  const titleEl = modalEl.querySelector('#cloudModalSyncTitle');
  const descEl = modalEl.querySelector('#cloudModalSyncDesc');
  const dotEl = modalEl.querySelector('#cloudModalSyncDot');

  const hasDb = Boolean(CloudSyncService.config.firebaseUrl && CloudSyncService.config.firebaseUrl.trim());

  if (titleEl && descEl && dotEl) {
    if (hasDb) {
      dotEl.style.backgroundColor = '#10b981';
      titleEl.textContent = 'สถานะ: เชื่อมต่อ Firebase ออนไลน์แล้ว';
      titleEl.style.color = '#10b981';
      descEl.textContent = 'ข้อมูลโครงการและกิจกรรมจะซิงค์หากันอัตโนมัติแบบเรียลไทม์ระหว่างทุกเครื่อง';
    } else {
      dotEl.style.backgroundColor = '#f59e0b';
      titleEl.textContent = 'สถานะ: ข้อมูลบันทึกเฉพาะในเครื่องนี้ (Local Only)';
      titleEl.style.color = '#d97706';
      descEl.innerHTML = 'เนื่องจากเว็บเปิดบน GitHub Pages ข้อมูลจึงถูกจำไว้ในเครื่องนี้เท่านั้น หากต้องการให้เห็นออนไลน์ตรงกันทุกเครื่อง กรุณาสร้าง <strong>Firebase Realtime Database</strong> (ฟรีโดย Google) แล้วนำ URL มาวางในช่องด้านล่าง';
    }
  }

  if (inputFirebase) {
    inputFirebase.value = CloudSyncService.config.firebaseUrl || '';
  }

  if (lastSyncEl) {
    const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    lastSyncEl.textContent = `อัปเดต: ${timeStr} น.`;
  }

  if (statsContainer) {
    let pCount = 0;
    let aCount = 0;
    let uCount = 0;
    try {
      pCount = JSON.parse(localStorage.getItem('satit_cmu_projects_data') || '[]').length;
      aCount = JSON.parse(localStorage.getItem('satit_cmu_activities_data') || '[]').length;
      uCount = JSON.parse(localStorage.getItem('satit_cmu_users_data') || '[]').length;
    } catch {}

    statsContainer.innerHTML = `
      <div style="background: var(--bg-surface, #fff); padding: 8px; border-radius: 8px; border: 1px solid var(--border-subtle);">
        <div style="font-size: 1.15rem; font-weight: 700; color: var(--cmu-purple-700);">${pCount}</div>
        <div style="font-size: 0.6875rem; color: var(--text-muted);">โครงการ</div>
      </div>
      <div style="background: var(--bg-surface, #fff); padding: 8px; border-radius: 8px; border: 1px solid var(--border-subtle);">
        <div style="font-size: 1.15rem; font-weight: 700; color: #10b981;">${aCount}</div>
        <div style="font-size: 0.6875rem; color: var(--text-muted);">กิจกรรม</div>
      </div>
      <div style="background: var(--bg-surface, #fff); padding: 8px; border-radius: 8px; border: 1px solid var(--border-subtle);">
        <div style="font-size: 1.15rem; font-weight: 700; color: #3b82f6;">${uCount}</div>
        <div style="font-size: 0.6875rem; color: var(--text-muted);">บัญชีผู้ใช้</div>
      </div>
    `;
  }
}
