/**
 * USER MANAGEMENT & PERSONAL PROFILE PAGE CONTROLLER
 * หน้าจัดการผู้ใช้งาน กำหนดสิทธิ์การเข้าถึง และแก้ไขข้อมูลบัญชีส่วนตัว
 */

import { initNavbar } from '../components/navbar.js';
import { AuthService } from '../services/auth-service.js';
import { UserService } from '../services/user-service.js';
import { $, $$, addEvent, escapeHTML } from '../utils/dom.js';
import { showToast } from '../utils/toast.js';
import { initModal } from '../components/modal.js';

let activeTab = 'profile'; // 'profile' | 'users'
let activeRoleFilter = 'all';
let userEditModalInstance = null;
let editingUserId = null;

document.addEventListener('DOMContentLoaded', () => {
  // 1. เริ่มต้น Navbar
  initNavbar();

  // 2. จัดการแท็บ (ตรวจสอบ Query param ?tab=users หรือ ?tab=profile)
  const urlParams = new URLSearchParams(window.location.search);
  const requestedTab = urlParams.get('tab');
  if (requestedTab === 'users') {
    activeTab = 'users';
  } else {
    activeTab = 'profile';
  }

  initTabs();
  initProfileView();
  initAdminUsersView();
  initUserEditModal();

  // อัปเดตตารางผู้ใช้งานและข้อมูลส่วนตัวแบบเรียลไทม์เมื่อมีการซิงค์ข้อมูลจาก Cloud
  window.addEventListener('satit-cmu-cloud-synced', () => {
    renderProfileSummaryAndForm();
    if (activeTab === 'users') {
      renderAdminUsersTab();
    }
  });
});

/* ==========================================================================
   TABS CONTROLLER
   ========================================================================== */
function initTabs() {
  const tabBtnProfile = $('#tabBtnProfile');
  const tabBtnUsers = $('#tabBtnUsers');
  const viewProfile = $('#viewProfileTab');
  const viewUsers = $('#viewUsersTab');

  function switchTab(target) {
    activeTab = target;

    if (activeTab === 'profile') {
      tabBtnProfile.classList.add('is-active');
      tabBtnProfile.setAttribute('aria-selected', 'true');
      tabBtnUsers.classList.remove('is-active');
      tabBtnUsers.setAttribute('aria-selected', 'false');

      viewProfile.style.display = 'grid';
      viewUsers.style.display = 'none';

      // Update URL query without refresh
      const url = new URL(window.location);
      url.searchParams.set('tab', 'profile');
      window.history.replaceState({}, '', url);

      renderProfileSummaryAndForm();
    } else {
      tabBtnUsers.classList.add('is-active');
      tabBtnUsers.setAttribute('aria-selected', 'true');
      tabBtnProfile.classList.remove('is-active');
      tabBtnProfile.setAttribute('aria-selected', 'false');

      viewProfile.style.display = 'none';
      viewUsers.style.display = 'block';

      // Update URL query without refresh
      const url = new URL(window.location);
      url.searchParams.set('tab', 'users');
      window.history.replaceState({}, '', url);

      renderAdminUsersTab();
    }
  }

  addEvent(tabBtnProfile, 'click', () => switchTab('profile'));
  addEvent(tabBtnUsers, 'click', () => switchTab('users'));

  // Trigger initial tab
  switchTab(activeTab);
}

/* ==========================================================================
   TAB 1: PERSONAL PROFILE LOGIC
   ========================================================================== */
function initProfileView() {
  const form = $('#pageProfileForm');
  const avatarPicker = $('#pageAvatarPicker');
  const selectedAvatarInput = $('#pageSelectedAvatar');
  const togglePwdBtn = $('#pageBtnTogglePassword');
  const pwdFields = $('#pagePasswordFieldsSection');
  const pwdIndicator = $('#pagePasswordIndicator');

  // Avatar Picker Click
  if (avatarPicker && selectedAvatarInput) {
    avatarPicker.querySelectorAll('.avatar-pick-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        avatarPicker.querySelectorAll('.avatar-pick-item').forEach((b) => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        const picked = btn.getAttribute('data-avatar');
        selectedAvatarInput.value = picked;
        // Live update summary card avatar
        const summaryAvatar = $('#summaryAvatar');
        if (summaryAvatar) summaryAvatar.textContent = picked;
      });
    });
  }

  // Toggle Password Section
  if (togglePwdBtn && pwdFields) {
    addEvent(togglePwdBtn, 'click', () => {
      const isHidden = pwdFields.style.display === 'none';
      pwdFields.style.display = isHidden ? 'block' : 'none';
      if (pwdIndicator) {
        pwdIndicator.textContent = isHidden ? '▲ ซ่อน' : '▼ กดเพื่อเปิด';
      }
    });
  }

  // Submit Profile Form
  if (form) {
    addEvent(form, 'submit', (e) => {
      e.preventDefault();
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) return;

      const name = $('#pageInputName')?.value.trim();
      const position = $('#pageInputPosition')?.value.trim();
      const department = $('#pageInputDept')?.value.trim();
      const phone = $('#pageInputPhone')?.value.trim();
      const avatar = selectedAvatarInput?.value || currentUser.avatar || '👨‍🏫';

      const currentPwd = $('#pageInputCurrentPwd')?.value;
      const newPwd = $('#pageInputNewPwd')?.value;
      const confirmPwd = $('#pageInputConfirmPwd')?.value;

      let passwordToUpdate = null;
      if (newPwd) {
        if (currentPwd !== currentUser.password) {
          showToast({
            type: 'error',
            title: 'รหัสผ่านปัจจุบันไม่ถูกต้อง',
            message: 'กรุณากรอกรหัสผ่านเดิมให้ถูกต้องก่อนตั้งรหัสผ่านใหม่'
          });
          return;
        }
        if (newPwd.length < 6) {
          showToast({
            type: 'error',
            title: 'รหัสผ่านสั้นเกินไป',
            message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร'
          });
          return;
        }
        if (newPwd !== confirmPwd) {
          showToast({
            type: 'error',
            title: 'รหัสผ่านไม่ตรงกัน',
            message: 'การยืนยันรหัสผ่านใหม่ไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง'
          });
          return;
        }
        passwordToUpdate = newPwd;
      }

      const res = UserService.updateProfile(currentUser.id, {
        name,
        position,
        department,
        phone,
        avatar,
        password: passwordToUpdate
      });

      if (res.success) {
        showToast({
          type: 'success',
          title: 'บันทึกข้อมูลส่วนตัวสำเร็จ! 🎉',
          message: 'ข้อมูลบัญชี ตำแหน่ง และเบอร์โทรศัพท์ได้รับการอัปเดตแล้ว'
        });

        // Reset password fields
        $('#pageInputCurrentPwd').value = '';
        $('#pageInputNewPwd').value = '';
        $('#pageInputConfirmPwd').value = '';
        pwdFields.style.display = 'none';
        if (pwdIndicator) pwdIndicator.textContent = '▼ กดเพื่อเปิด';

        // Re-render UI
        renderProfileSummaryAndForm();
        initNavbar(); // Re-sync navbar name and avatar
      } else {
        showToast({
          type: 'error',
          title: 'เกิดข้อผิดพลาด',
          message: res.message || 'ไม่สามารถบันทึกข้อมูลได้'
        });
      }
    });
  }

  renderProfileSummaryAndForm();
}

function renderProfileSummaryAndForm() {
  const currentUser = AuthService.getCurrentUser();
  if (!currentUser) return;

  const isAdmin = AuthService.isAdmin();

  // 1. Summary Card
  const summaryAvatar = $('#summaryAvatar');
  const summaryName = $('#summaryName');
  const summaryPos = $('#summaryPos');
  const summaryRoleBadge = $('#summaryRoleBadge');
  const summaryDept = $('#summaryDept');
  const summaryPhone = $('#summaryPhone');
  const summaryEmail = $('#summaryEmail');
  const summaryStatusPermBadge = $('#summaryStatusPermBadge');
  const summaryPermDesc = $('#summaryPermDesc');

  if (summaryAvatar) summaryAvatar.textContent = currentUser.avatar || '👨‍🏫';
  if (summaryName) summaryName.textContent = currentUser.name || 'ผู้ใช้งาน';
  if (summaryPos) summaryPos.textContent = currentUser.position || 'อาจารย์ผู้สอน';
  if (summaryDept) summaryDept.textContent = currentUser.department || 'โรงเรียนสาธิตมหาวิทยาลัยเชียงใหม่';
  if (summaryPhone) summaryPhone.textContent = currentUser.phone || '053-944123 ต่อ 15';
  if (summaryEmail) summaryEmail.textContent = currentUser.email || '';

  if (summaryRoleBadge) {
    summaryRoleBadge.textContent = isAdmin ? '👑 สิทธิ์แอดมิน' : `👨‍🏫 ${currentUser.role || 'อาจารย์'}`;
    summaryRoleBadge.className = `badge ${isAdmin ? 'badge-purple' : 'badge-blue'}`;
  }

  if (summaryStatusPermBadge) {
    summaryStatusPermBadge.className = isAdmin ? 'perm-badge-grant' : 'perm-badge-deny';
    summaryStatusPermBadge.textContent = isAdmin ? '✓ กำหนดได้' : '🔒 ล็อค';
  }

  if (summaryPermDesc) {
    summaryPermDesc.innerHTML = isAdmin
      ? 'คุณมีสิทธิ์ <strong>ผู้ดูแลระบบ (Admin)</strong> สามารถกำหนดและเปลี่ยนสถานะกิจกรรม (รอตรวจ/ดำเนินการ/แก้ไข/เสร็จสิ้น/ยกเลิก) และจัดการผู้ใช้งานท่านอื่นได้'
      : 'คุณสามารถสร้าง แก้ไข และส่งออกเอกสาร Word/Excel ได้ <em>(สถานะกิจกรรมจะถูกล็อคให้เฉพาะผู้ดูแลระบบเปลี่ยนสถานะได้เท่านั้น)</em>';
  }

  // 2. Form Fields
  const nameInput = $('#pageInputName');
  const posInput = $('#pageInputPosition');
  const deptInput = $('#pageInputDept');
  const phoneInput = $('#pageInputPhone');
  const emailInput = $('#pageInputEmail');
  const selectedAvatarInput = $('#pageSelectedAvatar');

  if (nameInput) nameInput.value = currentUser.name || '';
  if (posInput) posInput.value = currentUser.position || '';
  if (deptInput) deptInput.value = currentUser.department || '';
  if (phoneInput) phoneInput.value = currentUser.phone || '';
  if (emailInput) emailInput.value = currentUser.email || '';
  if (selectedAvatarInput) selectedAvatarInput.value = currentUser.avatar || '👨‍🏫';

  // Highlight selected avatar item
  $$('#pageAvatarPicker .avatar-pick-item').forEach((btn) => {
    btn.classList.toggle('is-selected', btn.getAttribute('data-avatar') === (currentUser.avatar || '👨‍🏫'));
  });
}

/* ==========================================================================
   TAB 2: ADMIN USER MANAGEMENT LOGIC
   ========================================================================== */
function initAdminUsersView() {
  const searchInput = $('#pageUserSearchInput');
  const filterChips = $('#pageFilterChips');
  const btnAdd = $('#pageBtnAddNewUser');
  const btnSwitchAdmin = $('#btnSwitchToAdmin');

  // Search input live
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderAdminUsersTable();
    });
  }

  // Filter chips
  if (filterChips) {
    filterChips.querySelectorAll('.mgmt-filter-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        filterChips.querySelectorAll('.mgmt-filter-chip').forEach((c) => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        activeRoleFilter = chip.getAttribute('data-filter') || 'all';
        renderAdminUsersTable();
      });
    });
  }

  // Add new user button
  if (btnAdd) {
    addEvent(btnAdd, 'click', () => {
      openPageUserEditModal(null);
    });
  }

  // Switch to admin button for testing
  if (btnSwitchAdmin) {
    addEvent(btnSwitchAdmin, 'click', () => {
      AuthService.switchRole('admin');
      showToast({
        type: 'success',
        title: 'สลับสิทธิ์สำเร็จ 👑',
        message: 'คุณได้สิทธิ์แอดมินสำหรับการจัดการผู้ใช้งานแล้ว'
      });
      initNavbar();
      renderAdminUsersTab();
    });
  }
}

function renderAdminUsersTab() {
  const isAdmin = AuthService.isAdmin();
  const restrictedCard = $('#restrictedAccessCard');
  const adminContent = $('#adminContentContainer');

  if (!isAdmin) {
    if (restrictedCard) restrictedCard.style.display = 'block';
    if (adminContent) adminContent.style.display = 'none';
    return;
  }

  if (restrictedCard) restrictedCard.style.display = 'none';
  if (adminContent) adminContent.style.display = 'block';

  // 1. Calculate & Render Metrics
  const users = UserService.getUsers();
  const total = users.length;
  const admins = users.filter((u) => u.roleId === 'admin' || u.canChangeStatus).length;
  const teachers = users.filter((u) => u.roleId === 'teacher').length;
  const finance = users.filter((u) => u.roleId === 'finance').length;

  if ($('#pageStatTotalUsers')) $('#pageStatTotalUsers').textContent = String(total);
  if ($('#pageStatAdmins')) $('#pageStatAdmins').textContent = String(admins);
  if ($('#pageStatTeachers')) $('#pageStatTeachers').textContent = String(teachers);
  if ($('#pageStatFinance')) $('#pageStatFinance').textContent = String(finance);

  // 2. Render Table
  renderAdminUsersTable();
}

function renderAdminUsersTable() {
  const tableBody = $('#pageUserTableBody');
  if (!tableBody) return;

  const users = UserService.getUsers();
  const searchKeyword = ($('#pageUserSearchInput')?.value || '').trim().toLowerCase();

  const filtered = users.filter((u) => {
    const matchRole = activeRoleFilter === 'all' || u.roleId === activeRoleFilter;
    const matchKeyword =
      !searchKeyword ||
      u.name.toLowerCase().includes(searchKeyword) ||
      u.email.toLowerCase().includes(searchKeyword) ||
      (u.position && u.position.toLowerCase().includes(searchKeyword)) ||
      (u.department && u.department.toLowerCase().includes(searchKeyword));
    return matchRole && matchKeyword;
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: var(--space-8); color: var(--text-muted);">
          ไม่พบข้อมูลผู้ใช้งานที่ตรงกับเงื่อนไขค้นหา
        </td>
      </tr>
    `;
    return;
  }

  const currentLoggedIn = AuthService.getCurrentUser();

  tableBody.innerHTML = filtered
    .map((u) => {
      const isSelf = currentLoggedIn && (currentLoggedIn.id === u.id || currentLoggedIn.email === u.email);
      const isSuperAdmin = u.id === 'user-admin';

      let roleBadgeHtml = `<span class="badge ${u.roleBadge || 'badge-blue'}">${escapeHTML(u.role || u.roleId)}</span>`;
      let statusPermHtml = u.canChangeStatus
        ? `<span class="perm-badge-grant" title="มีสิทธิ์กำหนดและเปลี่ยนสถานะกิจกรรมได้ทุกสถานะ">✓ กำหนดได้</span>`
        : `<span class="perm-badge-deny" title="สถานะกิจกรรมถูกล็อค ดูได้อย่างเดียว">🔒 ล็อค</span>`;

      return `
      <tr data-user-id="${u.id}">
        <td>
          <div class="user-cell-profile">
            <span class="user-cell-avatar">${u.avatar || '👤'}</span>
            <div>
              <div class="user-cell-name">
                <span>${escapeHTML(u.name)}</span>
                ${isSelf ? '<span class="badge badge-purple" style="font-size: 10px; padding: 0 5px; margin-left: 4px;">คุณ</span>' : ''}
              </div>
              <div class="user-cell-email">${escapeHTML(u.email)}</div>
            </div>
          </div>
        </td>
        <td>
          <div class="user-cell-position">${escapeHTML(u.position || '-')}</div>
          <div class="user-cell-dept">${escapeHTML(u.department || '-')}</div>
        </td>
        <td>
          <span class="user-cell-phone">📞 ${escapeHTML(u.phone || '-')}</span>
        </td>
        <td style="text-align: center;">${roleBadgeHtml}</td>
        <td style="text-align: center;">${statusPermHtml}</td>
        <td style="text-align: center;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
            <button type="button" class="table-btn-action btn-table-edit" data-id="${u.id}" title="แก้ไขข้อมูลผู้ใช้">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            ${
              !isSuperAdmin && !isSelf
                ? `
              <button type="button" class="table-btn-action table-btn-delete btn-table-delete" data-id="${u.id}" title="ลบผู้ใช้งาน">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            `
                : ''
            }
          </div>
        </td>
      </tr>
    `;
    })
    .join('');

  // Table Action Bindings
  tableBody.querySelectorAll('.btn-table-edit').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const targetUser = UserService.getUserById(id);
      if (targetUser) openPageUserEditModal(targetUser);
    });
  });

  tableBody.querySelectorAll('.btn-table-delete').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const targetUser = UserService.getUserById(id);
      if (!targetUser) return;

      if (confirm(`ยืนยันการลบบัญชีผู้ใช้งาน "${targetUser.name}" (${targetUser.email}) หรือไม่?`)) {
        const curUser = AuthService.getCurrentUser();
        const res = UserService.deleteUser(id, curUser?.id);
        if (res.success) {
          showToast({
            type: 'success',
            title: 'ลบผู้ใช้สำเร็จ',
            message: `ลบบัญชี ${targetUser.name} ออกจากระบบเรียบร้อยแล้ว`
          });
          renderAdminUsersTab();
        } else {
          showToast({
            type: 'error',
            title: 'ไม่สามารถลบได้',
            message: res.message
          });
        }
      }
    });
  });
}

/* ==========================================================================
   ADMIN ADD / EDIT USER MODAL LOGIC
   ========================================================================== */
function initUserEditModal() {
  const modalEl = $('#pageUserEditModal');
  if (!modalEl) return;

  // เปิดใช้งาน Static Backdrop: คลิกพื้นที่มืดด้านนอกจะไม่ปิดหน้าต่าง ป้องกันข้อมูลที่กำลังกรอกหาย
  userEditModalInstance = initModal(modalEl, { staticBackdrop: true });

  const form = $('#modalUserEditForm');
  const avatarPicker = $('#modalUserEditAvatarPicker');
  const avatarInput = $('#modalUserEditAvatar');
  const roleGroup = $('#modalUserEditRoleRadioGroup');
  const roleInput = $('#modalUserEditSelectedRole');
  const statusToggle = $('#modalUserEditCanChangeStatus');

  // ป้องกันการกดปุ่ม Enter ในช่องกรอกข้อความแล้วฟอร์มเด้ง Submit หรือปิดหน้าต่างก่อนกรอกเสร็จ
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    });

    const formInputs = form.querySelectorAll('input:not([type="hidden"])');
    formInputs.forEach((input, index) => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
          e.preventDefault();
          e.stopPropagation();
          // ย้ายเคอร์เซอร์ไปยังช่องถัดไปอย่างราบรื่น (ไม่สั่งบันทึกหรือเด้งปิด)
          if (index < formInputs.length - 1) {
            formInputs[index + 1].focus();
          }
          return false;
        }
      });
    });
  }

  // ป้องกันการคลิกหรือลากเมาส์ภายในหน้าต่าง Modal Card หลุดไปโดน Backdrop
  const modalCard = modalEl.querySelector('.modal-card');
  if (modalCard) {
    modalCard.addEventListener('mousedown', (e) => e.stopPropagation());
    modalCard.addEventListener('click', (e) => e.stopPropagation());
  }

  // Avatar select
  if (avatarPicker && avatarInput) {
    avatarPicker.querySelectorAll('.avatar-pick-item').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        avatarPicker.querySelectorAll('.avatar-pick-item').forEach((b) => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        avatarInput.value = btn.getAttribute('data-avatar');
      });
    });
  }

  // Role radio cards select
  if (roleGroup && roleInput) {
    roleGroup.querySelectorAll('.role-radio-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        roleGroup.querySelectorAll('.role-radio-card').forEach((c) => c.classList.remove('is-selected'));
        card.classList.add('is-selected');
        const role = card.getAttribute('data-role');
        roleInput.value = role;

        // Auto toggle status checkbox if admin
        if (statusToggle) {
          statusToggle.checked = role === 'admin';
        }
      });
    });
  }

  // ผูกการบันทึกข้อมูลเฉพาะเมื่อผู้ใช้คลิกปุ่ม "บันทึกข้อมูลผู้ใช้" โดยตรงเท่านั้น
  const btnSubmit = $('#btnSubmitModalUser');
  if (btnSubmit) {
    addEvent(btnSubmit, 'click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const name = $('#modalUserEditName')?.value.trim();
      const position = $('#modalUserEditPosition')?.value.trim() || 'อาจารย์ผู้สอน';
      const department = $('#modalUserEditDept')?.value.trim() || 'โรงเรียนสาธิตมหาวิทยาลัยเชียงใหม่';
      const phone = $('#modalUserEditPhone')?.value.trim();
      const email = $('#modalUserEditEmail')?.value.trim();
      const password = $('#modalUserEditPassword')?.value.trim();
      const roleId = roleInput?.value || 'teacher';
      const avatar = avatarInput?.value || '👨‍🏫';
      const canChangeStatus = (roleId === 'admin') || Boolean(statusToggle && statusToggle.checked);

      if (!name) {
        showToast({
          type: 'error',
          title: 'ข้อมูลไม่ครบถ้วน',
          message: 'กรุณากรอกชื่อ-นามสกุลของผู้ใช้งาน'
        });
        $('#modalUserEditName')?.focus();
        return;
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast({
          type: 'error',
          title: 'อีเมลไม่ถูกต้อง',
          message: 'กรุณากรอกอีเมลให้ถูกต้อง (เช่น name@satit.cmu.ac.th)'
        });
        $('#modalUserEditEmail')?.focus();
        return;
      }

      const finalPassword = password || 'password123';
      if (finalPassword.length < 6) {
        showToast({
          type: 'error',
          title: 'รหัสผ่านสั้นเกินไป',
          message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'
        });
        $('#modalUserEditPassword')?.focus();
        return;
      }

      const userData = {
        id: editingUserId,
        name,
        position,
        department,
        phone,
        email,
        password: finalPassword,
        roleId,
        avatar,
        canChangeStatus
      };

      const saved = UserService.saveUser(userData);

      showToast({
        type: 'success',
        title: editingUserId ? 'แก้ไขผู้ใช้สำเร็จ ✏️' : 'เพิ่มผู้ใช้งานสำเร็จ 🎉',
        message: `บันทึกข้อมูล ${saved.name} (${saved.role}) เรียบร้อยแล้ว`
      });

      userEditModalInstance.close();
      renderAdminUsersTab();

      // If user edited their own account
      const curUser = AuthService.getCurrentUser();
      if (curUser && curUser.id === saved.id) {
        renderProfileSummaryAndForm();
        initNavbar();
      }
    });
  }
}

function openPageUserEditModal(user = null) {
  if (!userEditModalInstance) return;

  editingUserId = user ? user.id : null;

  const titleText = $('#modalUserEditTitleText');
  const nameInput = $('#modalUserEditName');
  const posInput = $('#modalUserEditPosition');
  const deptInput = $('#modalUserEditDept');
  const phoneInput = $('#modalUserEditPhone');
  const emailInput = $('#modalUserEditEmail');
  const pwdInput = $('#modalUserEditPassword');
  const roleInput = $('#modalUserEditSelectedRole');
  const avatarInput = $('#modalUserEditAvatar');
  const statusToggle = $('#modalUserEditCanChangeStatus');

  if (user) {
    if (titleText) titleText.textContent = `แก้ไขข้อมูล: ${user.name}`;
    if (nameInput) nameInput.value = user.name || '';
    if (posInput) posInput.value = user.position || '';
    if (deptInput) deptInput.value = user.department || '';
    if (phoneInput) phoneInput.value = user.phone || '';
    if (emailInput) {
      emailInput.value = user.email || '';
      emailInput.readOnly = user.id === 'user-admin';
    }
    if (pwdInput) {
      pwdInput.value = user.password || 'password123';
      pwdInput.placeholder = 'อย่างน้อย 6 ตัวอักษร';
    }
    if (roleInput) roleInput.value = user.roleId || 'teacher';
    if (avatarInput) avatarInput.value = user.avatar || '👨‍🏫';
    if (statusToggle) statusToggle.checked = Boolean(user.canChangeStatus);
  } else {
    if (titleText) titleText.textContent = 'เพิ่มผู้ใช้งานใหม่';
    if (nameInput) nameInput.value = '';
    if (posInput) posInput.value = 'อาจารย์ผู้สอน';
    if (deptInput) deptInput.value = 'โรงเรียนสาธิตมหาวิทยาลัยเชียงใหม่';
    if (phoneInput) phoneInput.value = '';
    if (emailInput) {
      emailInput.value = '';
      emailInput.readOnly = false;
    }
    if (pwdInput) {
      pwdInput.value = '';
      pwdInput.placeholder = 'เว้นว่างไว้เพื่อใช้ค่าเริ่มต้น: password123';
    }
    if (roleInput) roleInput.value = 'teacher';
    if (avatarInput) avatarInput.value = '👨‍🏫';
    if (statusToggle) statusToggle.checked = false;
  }

  // Update avatar picker selection
  const curAvatar = avatarInput ? avatarInput.value : '👨‍🏫';
  $$('#modalUserEditAvatarPicker .avatar-pick-item').forEach((btn) => {
    btn.classList.toggle('is-selected', btn.getAttribute('data-avatar') === curAvatar);
  });

  // Update role cards radio
  const curRole = roleInput ? roleInput.value : 'teacher';
  $$('#modalUserEditRoleRadioGroup .role-radio-card').forEach((card) => {
    card.classList.toggle('is-selected', card.getAttribute('data-role') === curRole);
  });

  userEditModalInstance.open();

  // Auto focus first input after open
  setTimeout(() => {
    nameInput?.focus();
  }, 100);
}
