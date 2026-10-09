/**
 * CONFIGURATION & SYSTEM CONSTANTS
 * ระบบสร้างเอกสารขออนุมัติโครงการและกิจกรรม - โรงเรียนสาธิต มช.
 */

export const APP_CONFIG = {
  APP_NAME: 'ระบบสร้างเอกสารขออนุมัติโครงการและกิจกรรม',
  APP_NAME_EN: 'Pre-Document Generator System',
  ORGANIZATION: 'โรงเรียนสาธิตมหาวิทยาลัยเชียงใหม่ ระดับอนุบาลและประถมศึกษา',
  VERSION: '1.0.0',
  STORAGE_KEYS: {
    AUTH_USER: 'satit_cmu_auth_user',
    REMEMBER_EMAIL: 'satit_cmu_remember_email',
    THEME: 'satit_cmu_theme'
  },
  // กำหนด Firebase Realtime Database URL กลางสำหรับทุกคนที่เข้าเว็บ
  FIREBASE_DATABASE_URL: 'https://satit-cmu-db-default-rtdb.asia-southeast1.firebasedatabase.app'
};

/**
 * สิทธิ์และบทบาทในระบบ (Roles & Permissions)
 * กฎสำคัญ: เฉพาะแอดมินเท่านั้นที่สามารถกำหนดและเปลี่ยนสถานะกิจกรรมได้
 */
export const ROLES = {
  ADMIN: {
    id: 'admin',
    name: 'ผู้ดูแลระบบ / แอดมิน',
    badge: 'badge-purple',
    icon: '👑',
    canManageRoles: true,
    canChangeStatus: true,
    canApprove: true,
    canDeleteAll: true,
    description: 'สิทธิ์สูงสุด: สามารถกำหนดและเปลี่ยนสถานะกิจกรรมได้ทุกสถานะ (รอตรวจ/ดำเนินการ/แก้ไข/เสร็จสิ้น/ยกเลิก)'
  },
  TEACHER: {
    id: 'teacher',
    name: 'อาจารย์ผู้รับผิดชอบ',
    badge: 'badge-blue',
    icon: '👨‍🏫',
    canManageRoles: false,
    canChangeStatus: false,
    canApprove: false,
    canDeleteAll: false,
    description: 'สามารถสร้าง แก้ไข และส่งออกเอกสาร Word/Excel ได้ (ดูสถานะได้อย่างเดียว ไม่สามารถเปลี่ยนสถานะได้)'
  },
  FINANCE: {
    id: 'finance',
    name: 'เจ้าหน้าที่การเงิน/พัสดุ',
    badge: 'badge-gold',
    icon: '💼',
    canManageRoles: false,
    canChangeStatus: false,
    canApprove: false,
    canDeleteAll: false,
    description: 'ตรวจสอบและดูรายงานงบประมาณของแต่ละโครงการ (ดูสถานะได้อย่างเดียว)'
  }
};

/**
 * บัญชีผู้ใช้งานสำหรับการทดสอบระบบด่วน (Demo Users)
 */
export const DEMO_ACCOUNTS = [
  {
    id: 'user-admin',
    roleId: 'admin',
    role: 'ผู้ดูแลระบบ / แอดมิน',
    roleBadge: 'badge-purple',
    name: 'คุณนภัสกร แก้ววันดี (Admin)',
    position: 'ผู้ดูแลระบบและฝ่ายบริหารงานโครงการ',
    email: 'admin@satit.cmu.ac.th',
    password: 'password123',
    department: 'ฝ่ายบริหารงานระบบและสารสนเทศ',
    phone: '0898382807',
    avatar: '👑',
    canChangeStatus: true,
    isActive: true
  },
  {
    id: 'user-1791557014567',
    roleId: 'admin',
    role: 'ผู้ดูแลระบบ / แอดมิน',
    roleBadge: 'badge-purple',
    name: 'ชนม์ชนก แก้ววันดี',
    position: 'ผู้ช่วยผู้อำนวยการ',
    email: 'chonchanok.k@cmu.ac.th',
    password: 'password123',
    department: 'ฝ่ายบริการวิชาการและกิจกรรมพิเศษ',
    phone: '0898382807',
    avatar: '👨‍🏫',
    canChangeStatus: true,
    isActive: true
  }
];

