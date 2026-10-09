/**
 * AUTHENTICATION SERVICE
 * จัดการการตรวจสอบสิทธิ์และการจัดการเซสชันผู้ใช้งาน
 */

import { APP_CONFIG, DEMO_ACCOUNTS, ROLES } from '../config.js';
import { UserService } from './user-service.js';
import { CloudSyncService } from './cloud-sync-service.js';

export const AuthService = {
  /**
   * ตรวจสอบความถูกต้องของข้อมูลเบื้องต้น
   * @param {string} email
   * @param {string} password
   */
  validate(email, password) {
    const errors = {};

    if (!email || !email.trim()) {
      errors.email = 'กรุณากรอกอีเมลหรือบัญชีผู้ใช้งาน CMU Account';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'รูปแบบอีเมลไม่ถูกต้อง (ตัวอย่าง: name@satit.cmu.ac.th)';
    }

    if (!password) {
      errors.password = 'กรุณากรอกรหัสผ่าน';
    } else if (password.length < 6) {
      errors.password = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * จำลองการส่งคำขอเข้าสู่ระบบ (Mock Network Request)
   * @param {string} email
   * @param {string} password
   * @param {boolean} rememberMe
   * @returns {Promise<{ success: boolean, user?: object, message?: string }>}
   */
  async login(email, password, rememberMe = false) {
    // ดึงข้อมูลผู้ใช้ล่าสุดจากคลาวด์ก่อนตรวจสอบ เพื่อให้สิทธิ์ที่ได้รับมอบหมายใหม่มีผลทันที
    try {
      await CloudSyncService.pull(true);
    } catch {}

    const cleanEmail = email.trim().toLowerCase();
    const allUsers = UserService.getUsers();

    // ตรวจสอบในรายการผู้ใช้งานที่มีอยู่ในระบบ
    let matchedUser = allUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === password
    );

    // หากไม่ตรงในระบบ แต่รหัสผ่าน >= 6 ตัวอักษร ให้สร้างเป็นบัญชีอาจารย์
    if (!matchedUser && password.length >= 6) {
      matchedUser = UserService.saveUser({
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        password: password,
        roleId: cleanEmail.startsWith('admin') ? 'admin' : 'teacher',
        position: cleanEmail.startsWith('admin') ? 'ผู้ดูแลระบบ' : 'อาจารย์ผู้รับผิดชอบ',
        department: 'โรงเรียนสาธิตมหาวิทยาลัยเชียงใหม่',
        avatar: cleanEmail.startsWith('admin') ? '👑' : '👨‍🏫'
      });
    }

    if (matchedUser) {
      // บันทึกลง SessionStorage
      sessionStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_USER, JSON.stringify(matchedUser));

      if (rememberMe) {
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.REMEMBER_EMAIL, cleanEmail);
      } else {
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REMEMBER_EMAIL);
      }

      return {
        success: true,
        user: matchedUser,
        message: 'เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ ' + matchedUser.name
      };
    }

    return {
      success: false,
      message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง'
    };
  },

  /**
   * ดึงข้อมูลผู้ใช้ปัจจุบันที่ล็อกอินอยู่
   * ตรวจสอบและดึงสิทธิ์ล่าสุดจาก UserService เสมอ เพื่อให้การปรับสิทธิ์เป็นแอดมินมีผลทันทีข้ามเครื่อง
   */
  getCurrentUser() {
    try {
      const data = sessionStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_USER);
      if (data) {
        const parsed = JSON.parse(data);
        const allUsers = UserService.getUsers();
        const latest = allUsers.find(
          (u) => (parsed.id && u.id === parsed.id) || (parsed.email && u.email && u.email.toLowerCase() === parsed.email.toLowerCase())
        );
        if (latest) {
          // หากข้อมูลผู้ใช้ในระบบมีสิทธิ์ บทบาท หรือชื่อใหม่ ให้ซิงค์ลง sessionStorage ทันที
          if (latest.roleId !== parsed.roleId || latest.canChangeStatus !== parsed.canChangeStatus || latest.name !== parsed.name) {
            sessionStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_USER, JSON.stringify(latest));
          }
          return latest;
        }
        return parsed;
      }
      const allUsers = UserService.getUsers();
      return allUsers[0] || DEMO_ACCOUNTS[0];
    } catch {
      return DEMO_ACCOUNTS[0];
    }
  },

  /**
   * ตรวจสอบว่าผู้ใช้ปัจจุบันมีสิทธิ์เป็น แอดมิน (Admin) หรือไม่
   * กฎ: แอดมินทุกคนมีสิทธิ์เท่าเทียมกันทุกประการ (เปลี่ยนสถานะกิจกรรม, แก้ไขโครงการ, จัดการกิจกรรม)
   */
  isAdmin() {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.canChangeStatus === true || user.canChangeStatus === 'true') return true;
    if (user.roleId && user.roleId.toLowerCase() === 'admin') return true;
    if (user.role && (
      user.role.includes('แอดมิน') || 
      user.role.includes('ผู้บริหาร') || 
      user.role.toLowerCase().includes('admin')
    )) return true;
    if (user.email && user.email.toLowerCase().startsWith('admin')) return true;
    return false;
  },

  /**
   * สลับบทบาทผู้ใช้ชั่วคราว (เพื่อความสะดวกในการทดสอบสิทธิ์ระหว่าง แอดมิน และ อาจารย์)
   */
  switchRole(roleId) {
    const allUsers = UserService.getUsers();
    const target = allUsers.find((d) => d.roleId === roleId) || allUsers[0];
    sessionStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_USER, JSON.stringify(target));
    return target;
  },

  /**
   * ดึงรายชื่อบทบาททั้งหมดในระบบ
   */
  getRoles() {
    return ROLES;
  },

  /**
   * ดึงอีเมลที่บันทึกไว้ใน Remember Me
   */
  getRememberedEmail() {
    return localStorage.getItem(APP_CONFIG.STORAGE_KEYS.REMEMBER_EMAIL) || '';
  },

  /**
   * ออกจากระบบ
   */
  logout() {
    sessionStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_USER);
  }
};

