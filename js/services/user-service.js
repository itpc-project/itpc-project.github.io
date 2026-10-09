/**
 * USER MANAGEMENT & ACCESS CONTROL SERVICE
 * จัดการข้อมูลผู้ใช้งาน ตำแหน่ง สังกัด เบอร์โทร และกำหนดสิทธิ์การเข้าถึง (RBAC)
 */

import { APP_CONFIG, DEMO_ACCOUNTS, ROLES } from '../config.js';

const USERS_STORAGE_KEY = 'satit_cmu_users_data';

export const UserService = {
  /**
   * ดึงรายชื่อผู้ใช้งานทั้งหมดจาก Storage
   */
  getUsers() {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse users from storage, fallback to DEMO_ACCOUNTS', e);
    }

    // กำหนดค่าเริ่มต้นด้วย DEMO_ACCOUNTS
    this.saveAllUsers(DEMO_ACCOUNTS);
    return DEMO_ACCOUNTS;
  },

  /**
   * บันทึกรายชื่อผู้ใช้ทั้งหมดลงใน Storage
   */
  saveAllUsers(users) {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users to storage', e);
    }
  },

  /**
   * ค้นหาผู้ใช้ด้วย ID
   */
  getUserById(id) {
    const users = this.getUsers();
    return users.find((u) => u.id === id) || null;
  },

  /**
   * ค้นหาผู้ใช้ด้วย Email
   */
  getUserByEmail(email) {
    if (!email) return null;
    const clean = email.trim().toLowerCase();
    const users = this.getUsers();
    return users.find((u) => u.email.trim().toLowerCase() === clean) || null;
  },

  /**
   * เพิ่มหรืออัปเดตข้อมูลผู้ใช้ (สำหรับ Admin)
   */
  saveUser(userData) {
    const users = this.getUsers();
    const existingIndex = users.findIndex((u) => u.id === userData.id);

    // กำหนดบทบาทและสิทธิ์
    const roleId = userData.roleId || 'teacher';
    const roleConfig = ROLES[roleId.toUpperCase()] || ROLES.TEACHER;

    const userToSave = {
      id: userData.id || `user-${Date.now()}`,
      name: userData.name?.trim() || 'ผู้ใช้งานระบบ',
      position: userData.position?.trim() || (roleId === 'admin' ? 'ผู้บริหาร / แอดมิน' : 'อาจารย์ผู้สอน'),
      department: userData.department?.trim() || 'โรงเรียนสาธิตมหาวิทยาลัยเชียงใหม่',
      phone: userData.phone?.trim() || '',
      email: userData.email?.trim().toLowerCase() || '',
      password: userData.password || 'password123',
      avatar: userData.avatar || roleConfig.icon || '👤',
      roleId: roleId,
      role: roleConfig.name,
      roleBadge: roleConfig.badge,
      // เฉพาะแอดมินเท่านั้นที่เปลี่ยนสถานะกิจกรรมได้
      canChangeStatus: roleId === 'admin' || Boolean(userData.canChangeStatus),
      isActive: userData.isActive !== false
    };

    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...userToSave };
    } else {
      users.push(userToSave);
    }

    this.saveAllUsers(users);

    // หากอัปเดตผู้ใช้ที่กำลังล็อกอินอยู่ ให้ซิงค์ sessionStorage ทันที
    this.syncCurrentSessionIfMatched(userToSave);

    return userToSave;
  },

  /**
   * แก้ไขข้อมูลบัญชีส่วนตัว (สำหรับผู้ใช้งานปัจจุบัน)
   */
  updateProfile(userId, { name, position, department, phone, password, avatar }) {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === userId);

    if (index === 0 || index > 0) {
      const user = users[index];
      if (name) user.name = name.trim();
      if (position !== undefined) user.position = position.trim();
      if (department !== undefined) user.department = department.trim();
      if (phone !== undefined) user.phone = phone.trim();
      if (avatar) user.avatar = avatar;
      if (password) user.password = password;

      users[index] = user;
      this.saveAllUsers(users);

      this.syncCurrentSessionIfMatched(user);
      return { success: true, user };
    }

    return { success: false, message: 'ไม่พบผู้ใช้งานที่ระบุ' };
  },

  /**
   * ลบผู้ใช้งาน
   */
  deleteUser(userId, currentUserId) {
    if (userId === currentUserId) {
      return { success: false, message: 'ไม่สามารถลบบัญชีของคุณเองที่กำลังเข้าสู่ระบบอยู่ได้' };
    }

    if (userId === 'user-admin') {
      return { success: false, message: 'ไม่สามารถลบบัญชีผู้ดูแลระบบหลัก (Super Admin) ได้' };
    }

    const users = this.getUsers();
    const filtered = users.filter((u) => u.id !== userId);

    if (filtered.length === users.length) {
      return { success: false, message: 'ไม่พบบัญชีผู้ใช้ที่ต้องการลบ' };
    }

    this.saveAllUsers(filtered);
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
        if (cur.id === updatedUser.id || cur.email.toLowerCase() === updatedUser.email.toLowerCase()) {
          sessionStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_USER, JSON.stringify(updatedUser));
        }
      }
    } catch {}
  }
};
