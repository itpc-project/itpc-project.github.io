/**
 * NAVBAR CONTROLLER
 * จัดการส่วนหัวของระบบ แสดงข้อมูลผู้ใช้ สลับธีม และออกจากระบบ
 */

import { APP_CONFIG, DEMO_ACCOUNTS } from '../config.js';
import { AuthService } from '../services/auth-service.js';
import { $, addEvent } from '../utils/dom.js';
import { showToast } from '../utils/toast.js';
import { injectUserModals, openProfileModal, openUserManagementModal } from './user-management-modal.js';

export function initNavbar() {
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

  // จัดการปุ่ม "จัดการผู้ใช้งาน (Admin)" บน Navbar Actions
  const navbarActions = $('.navbar-actions');
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

      // แทรกก่อนปุ่ม Theme Toggle
      const themeToggle = $('#themeToggleBtn');
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
