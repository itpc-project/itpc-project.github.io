/**
 * USER MANAGEMENT & PERSONAL PROFILE MODAL CONTROLLER
 * จัดการหน้าต่างแก้ไขบัญชีส่วนตัว และหน้าต่างจัดการผู้ใช้งานและกำหนดสิทธิ์สำหรับแอดมิน
 */

import { $, $$, addEvent, escapeHTML } from '../utils/dom.js';
import { showToast } from '../utils/toast.js';
import { AuthService } from '../services/auth-service.js';
import { UserService } from '../services/user-service.js';
import { initModal } from './modal.js';

let profileModalInstance = null;
let userMgmtModalInstance = null;
let userEditModalInstance = null;
let activeUserFilter = 'all';
let editingUserId = null; // null = creating new user

/**
 * ฉีดโครงสร้าง HTML ของหน้าต่าง Modals ทั้งหมดลงใน document.body หากยังไม่มี
 */
export function injectUserModals() {
  if (!$('#profileModal')) {
    const profileModalEl = document.createElement('aside');
    profileModalEl.id = 'profileModal';
    profileModalEl.className = 'modal-backdrop';
    profileModalEl.setAttribute('aria-hidden', 'true');
    profileModalEl.innerHTML = `
      <div class="modal-card modal-card-md" role="dialog" aria-labelledby="profileModalTitle">
        <div class="modal-header">
          <h3 id="profileModalTitle" class="modal-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--cmu-purple-600)" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>แก้ไขข้อมูลบัญชีส่วนตัว</span>
          </h3>
          <button class="modal-close-btn" type="button" data-modal-close aria-label="ปิดหน้าต่าง">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form id="profileForm">
          <div class="modal-body">
            <!-- Avatar Picker -->
            <div class="avatar-picker-label">เลือกรูปสัญลักษณ์ประจำตัว (Avatar)</div>
            <div class="avatar-picker-grid" id="profileAvatarPicker">
              <button type="button" class="avatar-pick-item" data-avatar="👑">👑</button>
              <button type="button" class="avatar-pick-item" data-avatar="👨‍🏫">👨‍🏫</button>
              <button type="button" class="avatar-pick-item" data-avatar="👩‍🏫">👩‍🏫</button>
              <button type="button" class="avatar-pick-item" data-avatar="💼">💼</button>
              <button type="button" class="avatar-pick-item" data-avatar="🎓">🎓</button>
              <button type="button" class="avatar-pick-item" data-avatar="🧑‍🔬">🧑‍🔬</button>
              <button type="button" class="avatar-pick-item" data-avatar="👤">👤</button>
            </div>
            <input type="hidden" id="profileSelectedAvatar" value="👨‍🏫" />

            <!-- Name -->
            <div class="form-group">
              <label class="input-label" for="profileName">
                <span>ชื่อ-นามสกุล <span class="input-label-required">*</span></span>
              </label>
              <input id="profileName" type="text" class="input-control" placeholder="เช่น อ.ดร. ศุภชัย วิทยานุกูล" required />
            </div>

            <!-- Position & Department Grid -->
            <div class="form-grid-2">
              <div class="form-group">
                <label class="input-label" for="profilePosition">
                  <span>ตำแหน่ง <span class="input-label-required">*</span></span>
                </label>
                <input id="profilePosition" type="text" class="input-control" placeholder="เช่น อาจารย์ชำนาญการพิเศษ" required />
              </div>

              <div class="form-group">
                <label class="input-label" for="profileDepartment">
                  <span>กลุ่มสาระ / สังกัด <span class="input-label-required">*</span></span>
                </label>
                <input id="profileDepartment" type="text" class="input-control" placeholder="เช่น ฝ่ายวิชาการ" required />
              </div>
            </div>

            <!-- Phone & Email Grid -->
            <div class="form-grid-2">
              <div class="form-group">
                <label class="input-label" for="profilePhone">
                  <span>เบอร์โทรศัพท์ติดต่อ <span class="input-label-required">*</span></span>
                </label>
                <input id="profilePhone" type="tel" class="input-control" placeholder="เช่น 053-944123 ต่อ 15 หรือ 081-xxx-xxxx" required />
              </div>

              <div class="form-group">
                <label class="input-label" for="profileEmail">
                  <span>อีเมล CMU Mail</span>
                </label>
                <input id="profileEmail" type="email" class="input-control" readonly title="อีเมลบัญชีหลักไม่สามารถเปลี่ยนได้" />
              </div>
            </div>

            <!-- Role & Permissions Display Box -->
            <div class="role-info-card" id="profileRoleInfoBox">
              <div>
                <div class="role-info-text-title" id="profileRoleTitle">สิทธิ์การเข้าถึง</div>
                <div class="role-info-text-desc" id="profileRoleDesc">กำลังโหลดสิทธิ์...</div>
              </div>
              <span id="profileRoleBadge" class="badge badge-purple">สิทธิ์ระบบ</span>
            </div>

            <!-- Change Password Box -->
            <div class="password-change-box">
              <div class="password-change-header" id="btnTogglePasswordSection">
                <span class="password-change-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span>ต้องการแก้ไขรหัสผ่าน</span>
                </span>
                <span id="passwordToggleIndicator" style="font-size: 0.8rem; color: var(--cmu-purple-700);">▼ กดเพื่อเปิด</span>
              </div>

              <div class="password-change-fields" id="passwordFieldsSection" style="display: none;">
                <div class="form-group">
                  <label class="input-label" for="profileCurrentPassword">
                    <span>รหัสผ่านปัจจุบัน</span>
                  </label>
                  <input id="profileCurrentPassword" type="password" class="input-control" placeholder="กรอกรหัสผ่านปัจจุบัน" />
                </div>

                <div class="form-grid-2">
                  <div class="form-group">
                    <label class="input-label" for="profileNewPassword">
                      <span>รหัสผ่านใหม่</span>
                    </label>
                    <input id="profileNewPassword" type="password" class="input-control" placeholder="อย่างน้อย 6 ตัวอักษร" />
                  </div>

                  <div class="form-group">
                    <label class="input-label" for="profileConfirmPassword">
                      <span>ยืนยันรหัสผ่านใหม่</span>
                    </label>
                    <input id="profileConfirmPassword" type="password" class="input-control" placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง" />
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary btn-sm" data-modal-close>ยกเลิก</button>
            <button type="submit" class="btn btn-primary btn-sm" id="btnSubmitProfile">บันทึกข้อมูลส่วนตัว</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(profileModalEl);
  }

  // Admin User Management Modal
  if (!$('#userManagementModal')) {
    const userMgmtModalEl = document.createElement('aside');
    userMgmtModalEl.id = 'userManagementModal';
    userMgmtModalEl.className = 'modal-backdrop';
    userMgmtModalEl.setAttribute('aria-hidden', 'true');
    userMgmtModalEl.innerHTML = `
      <div class="modal-card modal-card-xl" role="dialog" aria-labelledby="userMgmtModalTitle">
        <div class="modal-header">
          <h3 id="userMgmtModalTitle" class="modal-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--cmu-purple-600)" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>จัดการผู้ใช้งานและกำหนดสิทธิ์ (User & Access Control Management)</span>
          </h3>
          <button class="modal-close-btn" type="button" data-modal-close aria-label="ปิดหน้าต่าง">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <!-- Toolbar -->
          <div class="user-mgmt-toolbar">
            <div class="user-mgmt-search-wrap">
              <svg class="user-mgmt-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input id="userMgmtSearchInput" type="text" class="user-mgmt-search-input" placeholder="ค้นหาผู้ใช้ตามชื่อ, อีเมล, ตำแหน่ง..." />
            </div>

            <div class="user-mgmt-filter-chips" id="userMgmtFilterChips">
              <button type="button" class="mgmt-filter-chip is-active" data-filter="all">ทั้งหมด (<span id="userCountAll">0</span>)</button>
              <button type="button" class="mgmt-filter-chip" data-filter="admin">👑 แอดมิน</button>
              <button type="button" class="mgmt-filter-chip" data-filter="teacher">👨‍🏫 อาจารย์</button>
              <button type="button" class="mgmt-filter-chip" data-filter="finance">💼 การเงิน</button>
            </div>

            <button type="button" class="btn btn-primary btn-sm" id="btnAddNewUser">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>+ เพิ่มผู้ใช้งานใหม่</span>
            </button>
          </div>

          <!-- Table Container -->
          <div class="user-table-wrap">
            <table class="user-mgmt-table">
              <thead>
                <tr>
                  <th style="width: 28%;">ผู้ใช้งาน (User)</th>
                  <th style="width: 24%;">ตำแหน่ง & สังกัด</th>
                  <th style="width: 16%;">เบอร์โทรศัพท์</th>
                  <th style="width: 14%; text-align: center;">บทบาท</th>
                  <th style="width: 10%; text-align: center;">เปลี่ยนสถานะ</th>
                  <th style="width: 8%; text-align: center;">จัดการ</th>
                </tr>
              </thead>
              <tbody id="userMgmtTableBody">
                <!-- Dynamically populated via JS -->
              </tbody>
            </table>
          </div>
        </div>

        <div class="modal-footer" style="justify-content: space-between;">
          <span style="font-size: var(--font-size-xs); color: var(--text-muted);">
            💡 กฎระบบ: เฉพาะบัญชีที่มีสิทธิ์ <strong>ผู้ดูแลระบบ (Admin)</strong> เท่านั้นที่สามารถกำหนดและเปลี่ยนสถานะกิจกรรมได้
          </span>
          <button type="button" class="btn btn-secondary btn-sm" data-modal-close>ปิดหน้าต่าง</button>
        </div>
      </div>
    `;
    document.body.appendChild(userMgmtModalEl);
  }

  // Admin User Edit / Add Submodal
  if (!$('#userEditModal')) {
    const userEditModalEl = document.createElement('aside');
    userEditModalEl.id = 'userEditModal';
    userEditModalEl.className = 'modal-backdrop';
    userEditModalEl.setAttribute('aria-hidden', 'true');
    userEditModalEl.innerHTML = `
      <div class="modal-card modal-card-md" role="dialog" aria-labelledby="userEditModalTitle">
        <div class="modal-header">
          <h3 id="userEditModalTitle" class="modal-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--cmu-purple-600)" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            <span id="userEditTitleText">เพิ่มผู้ใช้งานใหม่</span>
          </h3>
          <button class="modal-close-btn" type="button" data-modal-close aria-label="ปิดหน้าต่าง">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form id="userEditForm" novalidate onsubmit="return false;" autocomplete="off">
          <div class="modal-body">
            <!-- Avatar Picker -->
            <div class="avatar-picker-label">เลือกรูปสัญลักษณ์ประจำตัว</div>
            <div class="avatar-picker-grid" id="userEditAvatarPicker">
              <button type="button" class="avatar-pick-item" data-avatar="👑">👑</button>
              <button type="button" class="avatar-pick-item" data-avatar="👨‍🏫">👨‍🏫</button>
              <button type="button" class="avatar-pick-item" data-avatar="👩‍🏫">👩‍🏫</button>
              <button type="button" class="avatar-pick-item" data-avatar="💼">💼</button>
              <button type="button" class="avatar-pick-item" data-avatar="🎓">🎓</button>
              <button type="button" class="avatar-pick-item" data-avatar="🧑‍🔬">🧑‍🔬</button>
              <button type="button" class="avatar-pick-item" data-avatar="👤">👤</button>
            </div>
            <input type="hidden" id="userEditSelectedAvatar" value="👨‍🏫" />

            <!-- Name -->
            <div class="form-group">
              <label class="input-label" for="userEditName">
                <span>ชื่อ-นามสกุล <span class="input-label-required">*</span></span>
              </label>
              <input id="userEditName" type="text" class="input-control" placeholder="เช่น อ.ดร. นิตยา พงษ์ศิริ" required />
            </div>

            <!-- Position & Department Grid -->
            <div class="form-grid-2">
              <div class="form-group">
                <label class="input-label" for="userEditPosition">
                  <span>ตำแหน่ง <span class="input-label-required">*</span></span>
                </label>
                <input id="userEditPosition" type="text" class="input-control" placeholder="เช่น รองผู้อำนวยการ, อาจารย์" required />
              </div>

              <div class="form-group">
                <label class="input-label" for="userEditDept">
                  <span>กลุ่มสาระ / สังกัด <span class="input-label-required">*</span></span>
                </label>
                <input id="userEditDept" type="text" class="input-control" placeholder="เช่น ฝ่ายวิชาการและบริหาร" required />
              </div>
            </div>

            <!-- Phone & Email Grid -->
            <div class="form-grid-2">
              <div class="form-group">
                <label class="input-label" for="userEditPhone">
                  <span>เบอร์โทรศัพท์ <span class="input-label-required">*</span></span>
                </label>
                <input id="userEditPhone" type="tel" class="input-control" placeholder="เช่น 053-944123 ต่อ 10" required />
              </div>

              <div class="form-group">
                <label class="input-label" for="userEditEmail">
                  <span>อีเมล CMU Mail <span class="input-label-required">*</span></span>
                </label>
                <input id="userEditEmail" type="email" class="input-control" placeholder="เช่น teacher@satit.cmu.ac.th" required />
              </div>
            </div>

            <!-- Password -->
            <div class="form-group">
              <label class="input-label" for="userEditPassword">
                <span>รหัสผ่านเข้าใช้งาน <span class="input-label-required">*</span></span>
              </label>
              <input id="userEditPassword" type="password" class="input-control" placeholder="อย่างน้อย 6 ตัวอักษร" required />
            </div>

            <!-- Role Selector & Permissions -->
            <div class="form-group">
              <label class="input-label">
                <span>กำหนดบทบาทและสิทธิ์การเข้าถึง (Role & Permissions) <span class="input-label-required">*</span></span>
              </label>
              <div class="role-radio-group" id="userEditRoleRadioGroup">
                <div class="role-radio-card" data-role="admin">
                  <div class="role-radio-title">👑 แอดมิน</div>
                  <div class="role-radio-desc">สิทธิ์สูงสุด • กำหนดสถานะกิจกรรมได้ทุกสถานะ</div>
                </div>
                <div class="role-radio-card is-selected" data-role="teacher">
                  <div class="role-radio-title">👨‍🏫 อาจารย์</div>
                  <div class="role-radio-desc">สร้างกิจกรรม • ดูสถานะได้อย่างเดียว (ล็อค 🔒)</div>
                </div>
                <div class="role-radio-card" data-role="finance">
                  <div class="role-radio-title">💼 การเงิน</div>
                  <div class="role-radio-desc">ดูงบประมาณ • ดูสถานะได้อย่างเดียว (ล็อค 🔒)</div>
                </div>
              </div>
              <input type="hidden" id="userEditSelectedRole" value="teacher" />
            </div>

            <!-- Status Permission Toggle -->
            <div style="margin-top: var(--space-2); padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); background: var(--bg-input);">
              <label style="display: flex; align-items: center; gap: var(--space-2); cursor: pointer; font-family: var(--font-family-thai); font-size: var(--font-size-xs);">
                <input type="checkbox" id="userEditCanChangeStatus" />
                <span style="font-weight: 600;">อนุญาตให้บัญชีนี้สามารถกำหนด/เปลี่ยนสถานะกิจกรรมได้ (สิทธิ์แอดมิน)</span>
              </label>
            </div>

          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary btn-sm" data-modal-close>ยกเลิก</button>
            <button type="button" class="btn btn-primary btn-sm" id="btnSubmitUserEdit">บันทึกข้อมูลผู้ใช้</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(userEditModalEl);
  }

  // Initialize Modal instances with static backdrop
  profileModalInstance = initModal($('#profileModal'), { staticBackdrop: true });
  userMgmtModalInstance = initModal($('#userManagementModal'), { staticBackdrop: true });
  userEditModalInstance = initModal($('#userEditModal'), { staticBackdrop: true });

  // Bind Form Events
  bindProfileFormEvents();
  bindUserMgmtEvents();
  bindUserEditFormEvents();

  // Listen to realtime cloud sync updates
  window.addEventListener('satit-cmu-cloud-synced', () => {
    updateNavbarDisplay();
    if ($('#userManagementModal')?.classList.contains('is-active')) {
      renderUserMgmtTable();
    }
  });
}

/**
 * เปิดหน้าต่างแก้ไขบัญชีส่วนตัว (นำทางสู่หน้า user-management.html?tab=profile)
 */
export function openProfileModal() {
  window.location.href = '/user-management.html?tab=profile';
}

/**
 * เปิดหน้าต่างจัดการผู้ใช้งาน (นำทางสู่หน้า user-management.html?tab=users)
 */
export function openUserManagementModal() {
  window.location.href = '/user-management.html?tab=users';
}

/**
 * เปิดหน้าต่างเพิ่ม/แก้ไขผู้ใช้งาน
 */
function openUserEditModal(user = null) {
  injectUserModals();
  editingUserId = user ? user.id : null;

  const titleText = $('#userEditTitleText');
  const nameInput = $('#userEditName');
  const posInput = $('#userEditPosition');
  const deptInput = $('#userEditDept');
  const phoneInput = $('#userEditPhone');
  const emailInput = $('#userEditEmail');
  const pwdInput = $('#userEditPassword');
  const roleInput = $('#userEditSelectedRole');
  const avatarInput = $('#userEditSelectedAvatar');
  const statusToggle = $('#userEditCanChangeStatus');

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
    if (pwdInput) pwdInput.value = user.password || 'password123';
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
    if (pwdInput) pwdInput.value = 'password123';
    if (roleInput) roleInput.value = 'teacher';
    if (avatarInput) avatarInput.value = '👨‍🏫';
    if (statusToggle) statusToggle.checked = false;
  }

  // Update avatar picker selection
  const curAvatar = avatarInput ? avatarInput.value : '👨‍🏫';
  $$('#userEditAvatarPicker .avatar-pick-item').forEach((btn) => {
    btn.classList.toggle('is-selected', btn.getAttribute('data-avatar') === curAvatar);
  });

  // Update role cards radio
  const curRole = roleInput ? roleInput.value : 'teacher';
  $$('#userEditRoleRadioGroup .role-radio-card').forEach((card) => {
    card.classList.toggle('is-selected', card.getAttribute('data-role') === curRole);
  });

  userEditModalInstance.open();
}

/**
 * เรนเดอร์ตารางผู้ใช้งาน
 */
function renderUserMgmtTable() {
  const tableBody = $('#userMgmtTableBody');
  const countAll = $('#userCountAll');
  if (!tableBody) return;

  const users = UserService.getUsers();
  if (countAll) countAll.textContent = String(users.length);

  const searchKeyword = ($('#userMgmtSearchInput')?.value || '').trim().toLowerCase();

  const filtered = users.filter((u) => {
    const matchRole = activeUserFilter === 'all' || u.roleId === activeUserFilter;
    const matchKeyword = !searchKeyword ||
      u.name.toLowerCase().includes(searchKeyword) ||
      u.email.toLowerCase().includes(searchKeyword) ||
      (u.position && u.position.toLowerCase().includes(searchKeyword)) ||
      (u.department && u.department.toLowerCase().includes(searchKeyword));
    return matchRole && matchKeyword;
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: var(--space-6); color: var(--text-muted);">
          ไม่พบข้อมูลผู้ใช้งานที่ตรงกับเงื่อนไขค้นหา
        </td>
      </tr>
    `;
    return;
  }

  const currentLoggedIn = AuthService.getCurrentUser();

  tableBody.innerHTML = filtered.map((u) => {
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
            <button type="button" class="table-btn-action btn-action-edit" data-id="${u.id}" title="แก้ไขข้อมูลผู้ใช้">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            ${!isSuperAdmin && !isSelf ? `
              <button type="button" class="table-btn-action table-btn-delete btn-action-delete" data-id="${u.id}" title="ลบผู้ใช้งาน">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Bind Table Actions
  tableBody.querySelectorAll('.btn-action-edit').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const targetUser = UserService.getUserById(id);
      if (targetUser) openUserEditModal(targetUser);
    });
  });

  tableBody.querySelectorAll('.btn-action-delete').forEach((btn) => {
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
          renderUserMgmtTable();
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

/**
 * ผูก Event ของฟอร์มแก้ไขข้อมูลส่วนตัว
 */
function bindProfileFormEvents() {
  const form = $('#profileForm');
  const avatarPicker = $('#profileAvatarPicker');
  const avatarInput = $('#profileSelectedAvatar');
  const togglePwdBtn = $('#btnTogglePasswordSection');
  const pwdSection = $('#passwordFieldsSection');
  const pwdIndicator = $('#passwordToggleIndicator');

  // Avatar pick
  if (avatarPicker && avatarInput) {
    avatarPicker.querySelectorAll('.avatar-pick-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        avatarPicker.querySelectorAll('.avatar-pick-item').forEach((b) => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        avatarInput.value = btn.getAttribute('data-avatar');
      });
    });
  }

  // Toggle password accordion
  if (togglePwdBtn && pwdSection) {
    addEvent(togglePwdBtn, 'click', () => {
      const isVisible = pwdSection.style.display !== 'none';
      pwdSection.style.display = isVisible ? 'none' : 'block';
      if (pwdIndicator) {
        pwdIndicator.textContent = isVisible ? '▼ กดเพื่อเปิด' : '▲ ซ่อน';
      }
    });
  }

  // Form submit
  if (form) {
    addEvent(form, 'submit', (e) => {
      e.preventDefault();
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) return;

      const name = $('#profileName')?.value.trim();
      const position = $('#profilePosition')?.value.trim();
      const department = $('#profileDepartment')?.value.trim();
      const phone = $('#profilePhone')?.value.trim();
      const avatar = avatarInput?.value || currentUser.avatar || '👨‍🏫';

      const currentPwd = $('#profileCurrentPassword')?.value;
      const newPwd = $('#profileNewPassword')?.value;
      const confirmPwd = $('#profileConfirmPassword')?.value;

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
          message: 'อัปเดตข้อมูลบัญชีผู้ใช้และเบอร์โทรศัพท์เรียบร้อยแล้ว'
        });

        // อัปเดตข้อมูลบน Navbar ทันที
        updateNavbarDisplay();

        profileModalInstance.close();
      } else {
        showToast({
          type: 'error',
          title: 'เกิดข้อผิดพลาด',
          message: res.message || 'ไม่สามารถบันทึกข้อมูลได้'
        });
      }
    });
  }
}

/**
 * ผูก Event ของฟอร์มจัดการผู้ใช้
 */
function bindUserMgmtEvents() {
  const searchInput = $('#userMgmtSearchInput');
  const filterChips = $('#userMgmtFilterChips');
  const btnAdd = $('#btnAddNewUser');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderUserMgmtTable();
    });
  }

  if (filterChips) {
    filterChips.querySelectorAll('.mgmt-filter-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        filterChips.querySelectorAll('.mgmt-filter-chip').forEach((c) => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        activeUserFilter = chip.getAttribute('data-filter') || 'all';
        renderUserMgmtTable();
      });
    });
  }

  if (btnAdd) {
    addEvent(btnAdd, 'click', () => {
      openUserEditModal(null);
    });
  }
}

/**
 * ผูก Event ของฟอร์มเพิ่ม/แก้ไขผู้ใช้งาน
 */
function bindUserEditFormEvents() {
  const form = $('#userEditForm');
  const avatarPicker = $('#userEditAvatarPicker');
  const avatarInput = $('#userEditSelectedAvatar');
  const roleGroup = $('#userEditRoleRadioGroup');
  const roleInput = $('#userEditSelectedRole');
  const statusToggle = $('#userEditCanChangeStatus');

  // Avatar select
  if (avatarPicker && avatarInput) {
    avatarPicker.querySelectorAll('.avatar-pick-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        avatarPicker.querySelectorAll('.avatar-pick-item').forEach((b) => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        avatarInput.value = btn.getAttribute('data-avatar');
      });
    });
  }

  // Role card select
  if (roleGroup && roleInput) {
    roleGroup.querySelectorAll('.role-radio-card').forEach((card) => {
      card.addEventListener('click', () => {
        roleGroup.querySelectorAll('.role-radio-card').forEach((c) => c.classList.remove('is-selected'));
        card.classList.add('is-selected');
        const role = card.getAttribute('data-role');
        roleInput.value = role;

        // Auto check canChangeStatus if role is admin
        if (statusToggle) {
          statusToggle.checked = role === 'admin';
        }
      });
    });
  }

  // ป้องกันการกด Enter ในช่องกรอกข้อความแล้วฟอร์มเด้ง Submit ก่อนกรอกเสร็จ
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
          if (index < formInputs.length - 1) {
            formInputs[index + 1].focus();
          }
          return false;
        }
      });
    });
  }

  // ป้องกันการคลิกหรือลากเมาส์ภายในหน้าต่าง Modal Card หลุดไปโดน Backdrop
  const modalCard = $('#userEditModal')?.querySelector('.modal-card');
  if (modalCard) {
    modalCard.addEventListener('mousedown', (e) => e.stopPropagation());
    modalCard.addEventListener('click', (e) => e.stopPropagation());
  }

  // ผูกการบันทึกข้อมูลเฉพาะเมื่อผู้ใช้คลิกปุ่มบันทึกโดยตรง
  const btnSubmit = $('#btnSubmitUserEdit');
  if (btnSubmit) {
    addEvent(btnSubmit, 'click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const name = $('#userEditName')?.value.trim();
      const position = $('#userEditPosition')?.value.trim() || 'อาจารย์ผู้สอน';
      const department = $('#userEditDept')?.value.trim() || 'โรงเรียนสาธิตมหาวิทยาลัยเชียงใหม่';
      const phone = $('#userEditPhone')?.value.trim();
      const email = $('#userEditEmail')?.value.trim();
      const password = $('#userEditPassword')?.value.trim();
      const roleId = roleInput?.value || 'teacher';
      const avatar = avatarInput?.value || '👨‍🏫';
      const canChangeStatus = (roleId === 'admin') || Boolean(statusToggle && statusToggle.checked);

      if (!name) {
        showToast({
          type: 'error',
          title: 'ข้อมูลไม่ครบถ้วน',
          message: 'กรุณากรอกชื่อ-นามสกุลของผู้ใช้งาน'
        });
        $('#userEditName')?.focus();
        return;
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast({
          type: 'error',
          title: 'อีเมลไม่ถูกต้อง',
          message: 'กรุณากรอกอีเมลให้ถูกต้อง (เช่น name@satit.cmu.ac.th)'
        });
        $('#userEditEmail')?.focus();
        return;
      }

      const finalPassword = password || 'password123';
      if (finalPassword.length < 6) {
        showToast({
          type: 'error',
          title: 'รหัสผ่านสั้นเกินไป',
          message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'
        });
        $('#userEditPassword')?.focus();
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
      renderUserMgmtTable();
      updateNavbarDisplay();
    });
  }
}

/**
 * อัปเดตข้อมูลผู้ใช้ปัจจุบันบน Navbar หลังแก้ไขโปรไฟล์
 */
function updateNavbarDisplay() {
  const currentUser = AuthService.getCurrentUser();
  if (!currentUser) return;

  const userAvatarEl = $('#navbarUserAvatar');
  const userNameEl = $('#navbarUserName');
  const userRoleEl = $('#navbarUserRole');
  const heroUserName = $('#heroUserName');

  if (userAvatarEl) userAvatarEl.textContent = currentUser.avatar || '👨‍🏫';
  if (userNameEl) userNameEl.textContent = currentUser.name;
  if (heroUserName) heroUserName.textContent = currentUser.name;

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
}
