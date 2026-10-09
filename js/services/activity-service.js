/**
 * ACTIVITY SERVICE
 * จัดการรายการกิจกรรมย่อยภายใต้แต่ละโครงการ
 * รองรับ 5 สถานะ: รอตรวจ, ดำเนินการ, แก้ไข, เสร็จสิ้น, ยกเลิก
 */

import { AuthService } from './auth-service.js';

const STORAGE_KEY = 'satit_cmu_activities_data';
const FORMS_STORAGE_KEY = 'satit_cmu_activity_forms';

// 5 สถานะหลักตามข้อกำหนดของระบบ
export const ACTIVITY_STATUS_MAP = {
  'review': {
    key: 'review',
    label: 'รอตรวจ',
    badgeClass: 'status-pill-review',
    stripeColor: '#f59e0b',
    dotColor: '#f59e0b',
    icon: '⏳',
    description: 'รอการตรวจสอบและพิจารณาอนุมัติ'
  },
  'in-progress': {
    key: 'in-progress',
    label: 'ดำเนินการ',
    badgeClass: 'status-pill-progress',
    stripeColor: '#3b82f6',
    dotColor: '#3b82f6',
    icon: '⚡',
    description: 'กำลังดำเนินการจัดกิจกรรม'
  },
  'edit': {
    key: 'edit',
    label: 'แก้ไข',
    badgeClass: 'status-pill-edit',
    stripeColor: '#f97316',
    dotColor: '#f97316',
    icon: '✏️',
    description: 'ต้องแก้ไขปรับปรุงรายละเอียดตามข้อเสนอแนะ'
  },
  'completed': {
    key: 'completed',
    label: 'เสร็จสิ้น',
    badgeClass: 'status-pill-completed',
    stripeColor: '#10b981',
    dotColor: '#10b981',
    icon: '✓',
    description: 'จัดกิจกรรมและสรุปผลเสร็จสิ้นสมบูรณ์'
  },
  'cancelled': {
    key: 'cancelled',
    label: 'ยกเลิก',
    badgeClass: 'status-pill-cancelled',
    stripeColor: '#94a3b8',
    dotColor: '#94a3b8',
    icon: '✕',
    description: 'ยกเลิกกิจกรรม'
  }
};

export const ACTIVITY_STATUS_LIST = Object.values(ACTIVITY_STATUS_MAP);

// ข้อมูลกิจกรรมเริ่มต้น: เริ่มต้นจากว่างเปล่าเพื่อให้ผู้ใช้เพิ่มกิจกรรมเองทั้งหมด
const DEFAULT_ACTIVITIES = [];

export const ActivityService = {
  /**
   * ปรับแก้โครงสร้างสถานะให้ตรงกับ 5 สถานะมาตรฐานเสมอ
   */
  normalizeActivity(act) {
    if (!act) return act;
    let key = act.status;
    if (key === 'saved' || !key) key = 'review';
    if (key === 'รอตวจ' || key === 'รอตรวจ') key = 'review';
    if (key === 'ดำเนินการ' || key === 'active') key = 'in-progress';
    if (key === 'แก้ไข') key = 'edit';
    if (key === 'เสร็จสิ้น' || key === 'approved') key = 'completed';
    if (key === 'ยกเลิก') key = 'cancelled';

    const cfg = ACTIVITY_STATUS_MAP[key] || ACTIVITY_STATUS_MAP['review'];
    return {
      ...act,
      status: cfg.key,
      statusLabel: cfg.label
    };
  },

  /**
   * ลบกิจกรรมทั้งหมดในระบบ ให้เริ่มต้นจากศูนย์
   */
  clearAllActivities() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      localStorage.removeItem(FORMS_STORAGE_KEY);
    } catch {}
    return [];
  },

  /**
   * ดึงรายการกิจกรรมทั้งหมดจาก Storage
   */
  getAllActivities() {
    // ล้างข้อมูล Mock เก่าใน LocalStorage อัตโนมัติในครั้งแรก (ตามคำขอของผู้ใช้: ล้างข้อมูลและลบกิจกรรมทั้งหมด)
    if (!localStorage.getItem('satit_cmu_activities_cleared_user_v2')) {
      localStorage.setItem('satit_cmu_activities_cleared_user_v2', 'true');
      this.clearAllActivities();
      return [];
    }

    let activities = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        activities = JSON.parse(stored);
      }
    } catch {
      activities = [];
    }

    if (!Array.isArray(activities)) {
      activities = [];
    }

    // ทำการ Normalize ให้ทุกกิจกรรมมีสถานะถูกต้องตาม 5 สถานะมาตรฐาน
    let hasChanges = false;
    const normalizedList = activities.map((act) => {
      const norm = this.normalizeActivity(act);
      if (norm.status !== act.status || norm.statusLabel !== act.statusLabel) {
        hasChanges = true;
      }
      return norm;
    });

    if (hasChanges) {
      this.saveAllActivities(normalizedList);
    }
    return normalizedList;
  },

  /**
   * บันทึกรายการกิจกรรมลง Storage
   */
  saveAllActivities(activities) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
    } catch (e) {
      console.error('Failed to save activities', e);
    }
  },

  /**
   * ดึงเฉพาะกิจกรรมที่อยู่ภายใต้โครงการที่ระบุ
   */
  getActivitiesByProject(projectId) {
    const list = this.getAllActivities();
    return list.filter((act) => act.projectId === projectId);
  },

  /**
   * ดึงกิจกรรมตาม ID
   */
  getActivityById(activityId) {
    const list = this.getAllActivities();
    return list.find((act) => act.id === activityId);
  },

  /**
   * อัปเดตสถานะของกิจกรรม (รอตรวจ, ดำเนินการ, แก้ไข, เสร็จสิ้น, ยกเลิก)
   * กฎสำคัญ: เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถกำหนดหรือเปลี่ยนสถานะกิจกรรมได้
   */
  updateActivityStatus(activityId, statusKey) {
    if (!AuthService.isAdmin()) {
      return {
        success: false,
        error: 'UNAUTHORIZED',
        message: 'คุณไม่มีสิทธิ์: เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถกำหนดหรือเปลี่ยนสถานะกิจกรรมได้'
      };
    }

    const list = this.getAllActivities();
    const index = list.findIndex((act) => act.id === activityId);
    if (index >= 0) {
      let key = statusKey;
      if (key === 'รอตวจ' || key === 'รอตรวจ') key = 'review';
      if (key === 'ดำเนินการ') key = 'in-progress';
      if (key === 'แก้ไข') key = 'edit';
      if (key === 'เสร็จสิ้น') key = 'completed';
      if (key === 'ยกเลิก') key = 'cancelled';

      const cfg = ACTIVITY_STATUS_MAP[key] || ACTIVITY_STATUS_MAP['review'];
      list[index].status = cfg.key;
      list[index].statusLabel = cfg.label;
      this.saveAllActivities(list);
      return {
        success: true,
        activity: list[index]
      };
    }
    return {
      success: false,
      error: 'NOT_FOUND',
      message: 'ไม่พบกิจกรรมที่ระบุ'
    };
  },

  /**
   * บันทึกหรือสร้างกิจกรรมใหม่
   */
  saveActivity(activityData) {
    const list = this.getAllActivities();
    const existingIndex = list.findIndex((act) => act.id === activityData.id);

    const initialStatus = activityData.status || 'review';
    const cfg = ACTIVITY_STATUS_MAP[initialStatus] || ACTIVITY_STATUS_MAP['review'];

    if (existingIndex >= 0) {
      list[existingIndex] = {
        ...list[existingIndex],
        ...activityData,
        status: cfg.key,
        statusLabel: cfg.label
      };
    } else {
      const projectActivities = list.filter((act) => act.projectId === activityData.projectId);
      const newCode = `ACT-${String(projectActivities.length + 1).padStart(2, '0')}`;
      const newActivity = {
        id: activityData.id || `ACT-${Date.now()}`,
        code: newCode,
        status: cfg.key,
        statusLabel: cfg.label,
        createdAt: new Date().toISOString().split('T')[0],
        ...activityData
      };
      list.unshift(newActivity);
    }

    this.saveAllActivities(list);
    return activityData;
  },

  /**
   * ลบกิจกรรม
   */
  deleteActivity(activityId) {
    const list = this.getAllActivities();
    const filtered = list.filter((act) => act.id !== activityId);
    this.saveAllActivities(filtered);
    return filtered;
  }
};
