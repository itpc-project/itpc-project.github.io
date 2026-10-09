/**
 * LOGIN PAGE CONTROLLER
 * เชื่อมโยงส่วนประกอบ UI, การตอบสนองผู้ใช้ และบริการ Authentication
 */

import { APP_CONFIG, DEMO_ACCOUNTS } from '../config.js';
import { $, $$, addEvent } from '../utils/dom.js';
import { showToast } from '../utils/toast.js';
import { initPasswordToggle } from '../components/password-toggle.js';
import { initModal } from '../components/modal.js';
import { AuthService } from '../services/auth-service.js';

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const loginForm = $('#loginForm');
  const emailInput = $('#email');
  const passwordInput = $('#password');
  const rememberCheckbox = $('#rememberMe');
  const submitBtn = $('#submitBtn');
  const togglePasswordBtn = $('#togglePassword');
  const forgotPasswordLink = $('#forgotPasswordLink');
  const forgotPasswordModalEl = $('#forgotPasswordModal');
  const forgotPasswordForm = $('#forgotPasswordForm');
  const themeToggleBtn = $('#themeToggleBtn');
  const demoChipsContainer = $('#demoChipsContainer');

  // 1. Theme Initializer
  initTheme(themeToggleBtn);

  // 2. Password Toggle Initializer
  if (passwordInput && togglePasswordBtn) {
    initPasswordToggle(passwordInput, togglePasswordBtn);
  }

  // 3. Forgot Password Modal Initializer
  const forgotModal = initModal(forgotPasswordModalEl);
  if (forgotPasswordLink) {
    addEvent(forgotPasswordLink, 'click', (e) => {
      e.preventDefault();
      forgotModal.open();
    });
  }

  if (forgotPasswordForm) {
    addEvent(forgotPasswordForm, 'submit', (e) => {
      e.preventDefault();
      const resetEmail = $('#resetEmail').value.trim();
      if (!resetEmail) {
        showToast({
          type: 'error',
          title: 'ข้อผิดพลาด',
          message: 'กรุณากรอกอีเมลสำหรับรีเซ็ตรหัสผ่าน'
        });
        return;
      }
      showToast({
        type: 'success',
        title: 'ส่งคำขอสำเร็จ',
        message: `ระบบได้ส่งคำแนะนำการรีเซ็ตรหัสผ่านไปยัง ${resetEmail} เรียบร้อยแล้ว`
      });
      forgotModal.close();
      forgotPasswordForm.reset();
    });
  }

  // 4. Role Permissions Matrix Modal Initializer
  const permModalEl = $('#permissionsModal');
  const permModal = permModalEl ? initModal(permModalEl) : null;
  const btnOpenPermModal = $('#btnOpenPermissionsModal');
  const adminToolbarTopBtn = $('#adminToolbarTopBtn');

  if (btnOpenPermModal && permModal) {
    addEvent(btnOpenPermModal, 'click', (e) => {
      e.preventDefault();
      permModal.open();
    });
  }

  if (adminToolbarTopBtn && permModal) {
    addEvent(adminToolbarTopBtn, 'click', (e) => {
      e.preventDefault();
      permModal.open();
    });
  }

  // 5. Admin Toolbar Role Selector Cards Handler
  initAdminRoleToolbar(emailInput, passwordInput, submitBtn);

  // 6. Pre-fill remembered email if saved, or default to admin
  const rememberedEmail = AuthService.getRememberedEmail();
  if (rememberedEmail && emailInput) {
    emailInput.value = rememberedEmail;
    if (rememberCheckbox) rememberCheckbox.checked = true;
  } else if (emailInput && !emailInput.value) {
    // Default to Admin account for convenient testing
    emailInput.value = 'admin@satit.cmu.ac.th';
    if (passwordInput) passwordInput.value = 'password123';
  }

  // 6. Handle Login Form Submit
  if (loginForm) {
    addEvent(loginForm, 'submit', async (e) => {
      e.preventDefault();
      clearErrors();

      const email = emailInput.value;
      const password = passwordInput.value;
      const rememberMe = rememberCheckbox ? rememberCheckbox.checked : false;

      // Validate inputs
      const { isValid, errors } = AuthService.validate(email, password);
      if (!isValid) {
        displayErrors(errors);
        return;
      }

      // Enter loading state
      setButtonLoading(submitBtn, true);

      try {
        const result = await AuthService.login(email, password, rememberMe);

        if (result.success) {
          showToast({
            type: 'success',
            title: 'เข้าสู่ระบบสำเร็จ',
            message: `${result.message} (${result.user.role})`
          });

          // เปลี่ยนหน้าไปยังหน้าที่ 2: กล่องโครงการต่างๆ (projects.html)
          setTimeout(() => {
            window.location.href = '/projects.html';
          }, 600);
        } else {
          showToast({
            type: 'error',
            title: 'เข้าสู่ระบบไม่สำเร็จ',
            message: result.message
          });
          displayErrors({ password: result.message });
        }
      } catch (err) {
        showToast({
          type: 'error',
          title: 'เกิดข้อผิดพลาด',
          message: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง'
        });
      } finally {
        setButtonLoading(submitBtn, false);
      }
    });
  }

  // Clear errors on input typing
  [emailInput, passwordInput].forEach((input) => {
    if (input) {
      addEvent(input, 'input', () => {
        const group = input.closest('.form-group');
        if (group && group.classList.contains('input-error')) {
          group.classList.remove('input-error');
          const errText = group.querySelector('.input-error-text');
          if (errText) errText.remove();
        }
      });
    }
  });
});

/**
 * Admin Toolbar & Role Selection Controller
 */
function initAdminRoleToolbar(emailInput, passwordInput, submitBtn) {
  const cards = $$('.admin-role-card');
  const instantLoginBtn = $('#btnInstantAdminLogin');

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      cards.forEach((c) => {
        c.classList.remove('is-active');
        const badge = c.querySelector('.role-status-badge');
        if (badge) {
          badge.classList.remove('badge-active');
          badge.textContent = 'คลิกเพื่อเลือก';
        }
      });

      card.classList.add('is-active');
      const badge = card.querySelector('.role-status-badge');
      if (badge) {
        badge.classList.add('badge-active');
        badge.textContent = 'เลือกอยู่';
      }

      const email = card.getAttribute('data-email');
      const pwd = card.getAttribute('data-pwd');
      const roleId = card.getAttribute('data-role-id');

      if (emailInput && passwordInput) {
        emailInput.value = email;
        passwordInput.value = pwd;
        clearErrors();

        if (roleId === 'admin') {
          showToast({
            type: 'success',
            title: 'เลือกสิทธิ์ผู้ดูแลระบบ (Admin) 👑',
            message: 'คุณมีสิทธิ์กำหนดและเปลี่ยนสถานะกิจกรรมได้ทุกสถานะ'
          });
        } else {
          showToast({
            type: 'info',
            title: `เลือกบทบาท: ${roleId === 'teacher' ? 'อาจารย์ผู้รับผิดชอบ' : 'เจ้าหน้าที่การเงิน'}`,
            message: 'สถานะกิจกรรมจะถูกล็อค (เฉพาะแอดมินเท่านั้นที่เปลี่ยนสถานะได้)'
          });
        }
      }
    });
  });

  // ปุ่มเข้าสู่ระบบด่วนด้วยสิทธิ์แอดมิน
  if (instantLoginBtn) {
    instantLoginBtn.addEventListener('click', async () => {
      if (emailInput && passwordInput) {
        emailInput.value = 'admin@satit.cmu.ac.th';
        passwordInput.value = 'password123';
        clearErrors();
      }

      setButtonLoading(instantLoginBtn, true);
      showToast({
        type: 'info',
        title: 'กำลังเข้าสู่ระบบในฐานะแอดมิน...',
        message: 'กำลังตรวจสอบสิทธิ์ผู้ดูแลระบบและจัดเตรียมพื้นที่ทำงาน'
      });

      try {
        const result = await AuthService.login('admin@satit.cmu.ac.th', 'password123', true);
        if (result.success) {
          showToast({
            type: 'success',
            title: 'เข้าสู่ระบบสำเร็จ (Admin) 👑',
            message: 'ยินดีต้อนรับผู้ดูแลระบบ! คุณสามารถกำหนดสถานะของกิจกรรมได้ทุกโครงการ'
          });
          setTimeout(() => {
            window.location.href = '/projects.html';
          }, 600);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setButtonLoading(instantLoginBtn, false);
      }
    });
  }
}

/**
 * Render Demo quick-fill chips
 */
function renderDemoAccounts(container, emailInput, passwordInput) {
  if (!container) return;

  container.innerHTML = DEMO_ACCOUNTS.map(
    (account) => `
    <button type="button" class="btn btn-chip" data-email="${account.email}" data-pwd="${account.password}">
      <span>${account.avatar}</span>
      <span>${account.role}</span>
    </button>
  `
  ).join('');

  container.querySelectorAll('.btn-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      const email = btn.getAttribute('data-email');
      const pwd = btn.getAttribute('data-pwd');
      if (emailInput && passwordInput) {
        emailInput.value = email;
        passwordInput.value = pwd;
        clearErrors();
        showToast({
          type: 'info',
          title: 'กรอกข้อมูลทดสอบแล้ว',
          message: `เลือกบัญชี: ${btn.textContent.trim()} (${email})`
        });
      }
    });
  });
}

/**
 * Handle Theme Toggle & Persistence
 */
function initTheme(toggleBtn) {
  const savedTheme = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.THEME);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', currentTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
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
}

/**
 * UI Error Helpers
 */
function clearErrors() {
  $$('.form-group.input-error').forEach((group) => {
    group.classList.remove('input-error');
    const errText = group.querySelector('.input-error-text');
    if (errText) errText.remove();
  });
}

function displayErrors(errors) {
  Object.keys(errors).forEach((field) => {
    const input = $(`#${field}`);
    if (input) {
      const group = input.closest('.form-group');
      if (group) {
        group.classList.add('input-error');
        let errText = group.querySelector('.input-error-text');
        if (!errText) {
          errText = document.createElement('div');
          errText.className = 'input-error-text';
          group.appendChild(errText);
        }
        errText.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>${errors[field]}</span>
        `;
      }
    }
  });
}

function setButtonLoading(button, isLoading) {
  if (!button) return;
  if (isLoading) {
    button.classList.add('btn-loading');
    button.disabled = true;
  } else {
    button.classList.remove('btn-loading');
    button.disabled = false;
  }
}
