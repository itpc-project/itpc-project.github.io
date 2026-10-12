/**
 * USER MANAGEMENT & ACCESS CONTROL SERVICE
 * จัดการข้อมูลผู้ใช้งาน ตำแหน่ง สังกัด เบอร์โทร และกำหนดสิทธิ์การเข้าถึง (RBAC)
 */

import { APP_CONFIG, DEMO_ACCOUNTS, ROLES } from '../config.js';
import { CloudSyncService } from './cloud-sync-service.js';

const USERS_STORAGE_KEY = 'satit_cmu_users_data';
const DELETED_USERS_KEY = 'satit_cmu_deleted_user_ids';

export const UserService = {
  /**
   * ดึงรายชื่อผู้ใช้งานทั้งหมดจาก Storage อย่างปลอดภัย ไม่เขียนทับ Cloud
   */
  getUsers() {
    let users = [];
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          users = parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse users from storage, fallback to DEMO_ACCOUNTS', e);
    }

    // กำหนดค่าเริ่มต้นด้วย DEMO_ACCOUNTS ในเครื่อง แต่ห้ามสั่ง Push ไปยัง Cloud
    if (users.length === 0) {
      users = DEMO_ACCOUNTS.map((u) => ({ ...u, updatedAt: Date.now() }));
      try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      } catch {}
    }

    // อ่านรายการ ID ที่ถูกลบโดยแอดมิน เพื่อไม่ให้กู้คืนบัญชีที่ถูกลบไปแล้ว
    let deletedList = [];
    try {
      deletedList = JSON.parse(localStorage.getItem(DELETED_USERS_KEY) || '[]');
    } catch {}
    const deletedSet = new Set((deletedList || []).map((x) => String(x).toLowerCase()));

    let hasChanges = false;

    // 1. ตรวจสอบและคงบัญชีผู้ใช้ที่กำลังล็อกอินอยู่ใน sessionStorage เสมอ
    try {
      const sessionRaw = sessionStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_USER);
      if (sessionRaw) {
        const sessionUser = JSON.parse(sessionRaw);
        if (sessionUser && (sessionUser.id || sessionUser.email)) {
          const sId = sessionUser.id ? String(sessionUser.id).toLowerCase() : '';
          const sEmail = sessionUser.email ? String(sessionUser.email).trim().toLowerCase() : '';

          if (!deletedSet.has(sId) && !deletedSet.has(sEmail)) {
            const matchIndex = users.findIndex(
              (u) => (sId && String(u.id).toLowerCase() === sId) ||
                     (sEmail && u.email && u.email.trim().toLowerCase() === sEmail)
            );
            if (matchIndex === -1) {
              users.push({ ...sessionUser, updatedAt: Date.now() });
              hasChanges = true;
            } else {
              // ซิงค์ชื่อและข้อมูลจาก Session หาก Session มีข้อมูลใหม่กว่า
              users[matchIndex] = { ...users[matchIndex], ...sessionUser };
              hasChanges = true;
            }
          }
        }
      }
    } catch {}

    // 2. กู้คืนบัญชีผู้ใช้ที่เป็นผู้สร้างกิจกรรมในระบบ (Auto-recovery from Activities)
    try {
      const actStored = localStorage.getItem('satit_cmu_activities_data');
      if (actStored) {
        const activities = JSON.parse(actStored);
        if (Array.isArray(activities)) {
          activities.forEach((act) => {
            if (act && act.creatorEmail) {
              const email = act.creatorEmail.trim().toLowerCase();
              const creatorId = act.creatorId ? String(act.creatorId).toLowerCase() : '';

              if (deletedSet.has(email) || deletedSet.has(creatorId)) return;

              const found = users.some(
                (u) => (creatorId && String(u.id).toLowerCase() === creatorId) ||
                       (u.email && u.email.trim().toLowerCase() === email)
              );

              if (!found) {
                users.push({
                  id: act.creatorId || `user-${Date.now()}`,
                  name: act.creatorName || email.split('@')[0],
                  position: 'อาจารย์ผู้สอน',
                  department: 'โรงเรียนสาธิตมหาวิทยาลัยเชียงใหม่',
                  phone: act.coordinatorPhone || '0000000000',
                  email: email,
                  password: 'password123',
                  avatar: '👨‍🏫',
                  roleId: 'teacher',
                  role: 'อาจารย์ผู้รับผิดชอบ',
                  roleBadge: 'badge-blue',
                  canChangeStatus: false,
                  isActive: true,
                  updatedAt: Date.now()
                });
                hasChanges = true;
              }
            }
          });
        }
      }
    } catch {}

    if (hasChanges) {
      try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      } catch {}
    }

    return users;
  },

  /**
   * บันทึกรายชื่อผู้ใช้ทั้งหมดลงใน Storage และสั่งซิงค์ขึ้น Cloud
   */
  saveAllUsers(users, triggerPush = true) {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      if (triggerPush) {
        CloudSyncService.push();
      }
    } catch (e) {
      console.error('Failed to save users to storage', e);
    }
  },

  /**
   * ค้นหาผู้ใช้ด้วย ID
   */
  getUserById(id) {
    if (!id) return null;
    const users = this.getUsers();
    return users.find((u) => String(u.id) === String(id)) || null;
  },

  /**
   * ค้นหาผู้ใช้ด้วย Email
   */
  getUserByEmail(email) {
    if (!email) return null;
    const clean = email.trim().toLowerCase();
    const users = this.getUsers();
    return users.find((u) => u.email && u.email.trim().toLowerCase() === clean) || null;
  },

  /**
   * เพิ่มหรืออัปเดตข้อมูลผู้ใช้ (สำหรับ Admin)
   */
  saveUser(userData) {
    const users = this.getUsers();
    const cleanEmail = userData.email?.trim().toLowerCase() || '';
    const existingIndex = users.findIndex(
      (u) => (userData.id && String(u.id) === String(userData.id)) ||
             (cleanEmail && u.email && u.email.trim().toLowerCase() === cleanEmail)
    );

    // หากบัญชีนี้เคยถูกบันทึกใน ID ที่ถูกลบ ให้ถอดออกจากรายการลบ
    try {
      const deletedList = JSON.parse(localStorage.getItem(DELETED_USERS_KEY) || '[]');
      const newDeletedList = deletedList.filter(
        (id) => String(id).toLowerCase() !== String(userData.id).toLowerCase() &&
                String(id).toLowerCase() !== cleanEmail
      );
      localStorage.setItem(DELETED_USERS_KEY, JSON.stringify(newDeletedList));
    } catch {}

    // กำหนดบทบาทและสิทธิ์
    const roleId = userData.roleId || 'teacher';
    const roleConfig = ROLES[roleId.toUpperCase()] || ROLES.TEACHER;

    const userToSave = {
      id: userData.id || (existingIndex >= 0 ? users[existingIndex].id : `user-${Date.now()}`),
      name: userData.name?.trim() || 'ผู้ใช้งานระบบ',
      position: userData.position?.trim() || (roleId === 'admin' ? 'ผู้บริหาร / แอดมิน' : 'อาจารย์ผู้สอน'),
      department: userData.department?.trim() || 'โรงเรียนสาธิตมหาวิทยาลัยเชียงใหม่',
      phone: userData.phone?.trim() || '',
      email: cleanEmail,
      password: userData.password || (existingIndex >= 0 ? users[existingIndex].password : 'password123'),
      avatar: userData.avatar || roleConfig.icon || '👤',
      roleId: roleId,
      role: roleConfig.name,
      roleBadge: roleConfig.badge,
      canChangeStatus: roleId === 'admin' || Boolean(userData.canChangeStatus),
      isActive: userData.isActive !== false,
      updatedAt: Date.now()
    };

    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...userToSave };
    } else {
      users.push(userToSave);
    }

    this.saveAllUsers(users, true);

    // หากอัปเดตผู้ใช้ที่กำลังล็อกอินอยู่ ให้ซิงค์ sessionStorage ทันที
    this.syncCurrentSessionIfMatched(userToSave);

    return userToSave;
  },

  /**
   * แก้ไขข้อมูลบัญชีส่วนตัว (สำหรับผู้ใช้งานปัจจุบัน)
   */
  updateProfile(userId, { name, position, department, phone, password, avatar }) {
    const users = this.getUsers();
    let index = users.findIndex((u) => String(u.id) === String(userId));

    // Fallback ด้วย Email ของเซสชันหากหา id ไม่เจอ
    if (index === -1) {
      try {
        const curAuth = JSON.parse(sessionStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_USER) || 'null');
        if (curAuth && curAuth.email) {
          index = users.findIndex((u) => u.email && u.email.trim().toLowerCase() === curAuth.email.trim().toLowerCase());
        }
      } catch {}
    }

    if (index >= 0) {
      const user = { ...users[index] };
      if (name) user.name = name.trim();
      if (position !== undefined) user.position = position.trim();
      if (department !== undefined) user.department = department.trim();
      if (phone !== undefined) user.phone = phone.trim();
      if (avatar) user.avatar = avatar;
      if (password) user.password = password;
      user.updatedAt = Date.now();

      users[index] = user;
      this.saveAllUsers(users, true);

      this.syncCurrentSessionIfMatched(user);
      return { success: true, user };
    }

    return { success: false, message: 'ไม่พบผู้ใช้งานที่ระบุ' };
  },

  /**
   * ลบผู้ใช้งาน (พร้อมบันทึก Tombstone เพื่อป้องกันการกู้คืนโดยไม่ตั้งใจ)
   */
  deleteUser(userId, currentUserId) {
    if (String(userId) === String(currentUserId)) {
      return { success: false, message: 'ไม่สามารถลบบัญชีของคุณเองที่กำลังเข้าสู่ระบบอยู่ได้' };
    }

    if (userId === 'user-admin') {
      return { success: false, message: 'ไม่สามารถลบบัญชีผู้ดูแลระบบหลัก (Super Admin) ได้' };
    }

    const users = this.getUsers();
    const targetUser = users.find((u) => String(u.id) === String(userId));
    const filtered = users.filter((u) => String(u.id) !== String(userId));

    if (filtered.length === users.length) {
      return { success: false, message: 'ไม่พบบัญชีผู้ใช้ที่ต้องการลบ' };
    }

    // บันทึก ID ผู้ใช้ที่ถูกลบ (Tombstone)
    try {
      const deletedList = JSON.parse(localStorage.getItem(DELETED_USERS_KEY) || '[]');
      const idStr = String(userId);
      if (!deletedList.includes(idStr)) {
        deletedList.push(idStr);
      }
      if (targetUser && targetUser.email) {
        const emStr = targetUser.email.trim().toLowerCase();
        if (!deletedList.includes(emStr)) {
          deletedList.push(emStr);
        }
      }
      localStorage.setItem(DELETED_USERS_KEY, JSON.stringify(deletedList));
    } catch {}

    this.saveAllUsers(filtered, true);
    return { success: true };
  },

  /**
   * ซิงค์ข้อมูลผู้ใช้ปัจจุบันลงใน sessionStorage หากตรงกับบัญชีที่ถูกแก้ไข
   */
  syncCurrentSessionIfMatched(updatedUser) {
    try {
      const raw = sessionStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_USER);
      if (raw) {
        const cur = JSON.parse(raw);
        const matchId = cur.id && updatedUser.id && String(cur.id) === String(updatedUser.id);
        const matchEmail = cur.email && updatedUser.email && cur.email.trim().toLowerCase() === updatedUser.email.trim().toLowerCase();
        if (matchId || matchEmail) {
          sessionStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_USER, JSON.stringify(updatedUser));
        }
      }
    } catch {}
  }
};
