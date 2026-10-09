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
import { UserService } from '../services/user-service.js';
import { CloudSyncService } from '../services/cloud-sync-service.js';

document.addEventListener('DOMContentLoaded', () => {
  CloudSyncService.init();
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

  // 4. User Registration Modal Initializer
  initRegisterModal(emailInput, passwordInput, submitBtn);

  // 5. Pre-fill remembered email if saved by user
  const rememberedEmail = AuthService.getRememberedEmail();
  if (rememberedEmail && emailInput) {
    emailInput.value = rememberedEmail;
    if (rememberCheckbox) rememberCheckbox.checked = true;
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
 * User Registration Modal Controller
 */
function initRegisterModal(emailInput, passwordInput, submitBtn) {
  const registerModalEl = $('#registerModal');
  if (!registerModalEl) return;

  const regModal = initModal(registerModalEl, { staticBackdrop: true });
  const btnTopRegister = $('#btnTopRegister');
  const btnOpenRegisterModal = $('#btnOpenRegisterModal');
  const regForm = $('#registerForm');
  const btnSubmitRegister = $('#btnSubmitRegister');

  const openModal = (e) => {
    if (e) e.preventDefault();
    regModal.open();
    const firstInput = $('#regName');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
  };

  if (btnTopRegister) addEvent(btnTopRegister, 'click', openModal);
  if (btnOpenRegisterModal) addEvent(btnOpenRegisterModal, 'click', openModal);

  // Avatar picker selection
  const avatarPicker = $('#regAvatarPicker');
  const avatarHiddenInput = $('#regAvatar');
  if (avatarPicker) {
    const avatarButtons = avatarPicker.querySelectorAll('.avatar-pick-item');
    avatarButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        avatarButtons.forEach((b) => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        if (avatarHiddenInput) {
          avatarHiddenInput.value = btn.dataset.avatar || '👨‍🏫';
        }
      });
    });
  }

  // Submit registration
  if (btnSubmitRegister) {
    addEvent(btnSubmitRegister, 'click', () => {
      const name = $('#regName')?.value.trim();
      const position = $('#regPosition')?.value.trim();
      const department = $('#regDepartment')?.value.trim();
      const phone = $('#regPhone')?.value.trim();
      const email = $('#regEmail')?.value.trim();
      const password = $('#regPassword')?.value;
      const confirmPassword = $('#regConfirmPassword')?.value;
      const avatar = avatarHiddenInput?.value || '👨‍🏫';

      // Validation
      if (!name) {
        showToast({ type: 'warning', title: 'กรุณากรอกชื่อ-นามสกุล', message: 'กรุณาระบุชื่อ-นามสกุลพร้อมคำนำหน้า' });
        $('#regName')?.focus();
        return;
      }
      if (!position) {
        showToast({ type: 'warning', title: 'กรุณากรอกตำแหน่ง', message: 'กรุณาระบุตำแหน่ง เช่น อาจารย์ผู้สอน หรือ รองผู้อำนวยการ' });
        $('#regPosition')?.focus();
        return;
      }
      if (!department) {
        showToast({ type: 'warning', title: 'กรุณากรอกกลุ่มสาระ/สังกัด', message: 'กรุณาระบุกลุ่มสาระหรือฝ่ายงานที่สังกัด' });
        $('#regDepartment')?.focus();
        return;
      }
      if (!phone) {
        showToast({ type: 'warning', title: 'กรุณากรอกเบอร์โทรติดต่อ', message: 'กรุณาระบุเบอร์โทรศัพท์สำหรับติดต่อประสานงาน' });
        $('#regPhone')?.focus();
        return;
      }
      if (!email) {
        showToast({ type: 'warning', title: 'กรุณากรอกอีเมล', message: 'กรุณาระบุอีเมล CMU Mail' });
        $('#regEmail')?.focus();
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast({ type: 'error', title: 'รูปแบบอีเมลไม่ถูกต้อง', message: 'ตัวอย่าง: teacher@satit.cmu.ac.th' });
        $('#regEmail')?.focus();
        return;
      }
      if (!password || password.length < 6) {
        showToast({ type: 'warning', title: 'รหัสผ่านสั้นเกินไป', message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' });
        $('#regPassword')?.focus();
        return;
      }
      if (password !== confirmPassword) {
        showToast({ type: 'error', title: 'รหัสผ่านไม่ตรงกัน', message: 'กรุณาตรวจสอบการยืนยันรหัสผ่านอีกครั้ง' });
        $('#regConfirmPassword')?.focus();
        return;
      }

      // Check existing user
      const existingUser = UserService.getUserByEmail(email);
      if (existingUser) {
        showToast({
          type: 'warning',
          title: 'อีเมลนี้มีในระบบแล้ว',
          message: `อีเมล ${email} ถูกลงทะเบียนไว้แล้ว สามารถเข้าสู่ระบบได้ทันที`
        });
        if (emailInput) emailInput.value = email;
        if (passwordInput) passwordInput.value = '';
        regModal.close();
        if (passwordInput) passwordInput.focus();
        return;
      }

      // Save new user
      const newUser = UserService.saveUser({
        name,
        position,
        department,
        phone,
        email,
        password,
        avatar,
        roleId: 'teacher'
      });

      showToast({
        type: 'success',
        title: 'สมัครสมาชิกสำเร็จ! 🎉',
        message: `ยินดีต้อนรับ ${newUser.name}! บัญชีของคุณพร้อมใช้งานแล้ว`
      });

      // Pre-fill login inputs
      if (emailInput) emailInput.value = email;
      if (passwordInput) passwordInput.value = password;

      // Reset form
      if (regForm) regForm.reset();
      if (avatarPicker) {
        const items = avatarPicker.querySelectorAll('.avatar-pick-item');
        items.forEach((item, idx) => item.classList.toggle('is-selected', idx === 0));
        if (avatarHiddenInput) avatarHiddenInput.value = '👨‍🏫';
      }

      regModal.close();
      if (submitBtn) {
        submitBtn.focus();
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
