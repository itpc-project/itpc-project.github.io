/**
 * PROJECT DATA SERVICE
 * จัดการข้อมูลโครงการและกิจกรรม 6 ด้านหลักของโรงเรียนสาธิต มช.
 */

import { CloudSyncService } from './cloud-sync-service.js';

const STORAGE_KEY = 'satit_cmu_projects_data';
const FORMS_STORAGE_KEY = 'satit_cmu_activity_forms';

// 6 โครงการหลักตามที่ระบุ
export const SIX_MAIN_PROJECTS = [
  {
    id: 'PRJ-LEARN-01',
    code: 'PRJ-01',
    title: 'สร้างบุคคลในสังคมเพื่อการเรียนรู้',
    slug: 'learning-society',
    themeColor: '#6F2C91',
    accentColor: '#9048B8',
    icon: '📚',
    activityName: 'กิจกรรมส่งเสริมทักษะการเรียนรู้ตลอดชีวิตและการอ่านเชิงสร้างสรรค์',
    fiscalYear: '2569',
    gradeLevel: 'ทุกระดับชั้น (อนุบาล - ประถม 6)',
    department: 'ฝ่ายวิชาการและส่งเสริมการเรียนรู้',
    responsiblePerson: '',
    dateRange: '10 - 12 กรกฎาคม 2569',
    location: 'หอสมุดและศูนย์การเรียนรู้ โรงเรียนสาธิต มช.',
    participants: { students: 180, teachers: 15, supportStaff: 5, total: 200 },
    budget: 45000,
    status: 'active',
    statusLabel: 'กำลังดำเนินการ',
    documentsReady: 2,
    documentsTotal: 4
  },
  {
    id: 'PRJ-INNOV-02',
    code: 'PRJ-02',
    title: 'นักนวัตกรชั้นเลิศ',
    slug: 'innovator',
    themeColor: '#2563EB',
    accentColor: '#60A5FA',
    icon: '💡',
    activityName: 'กิจกรรมค่ายคิดค้นนวัตกรรมและสิ่งประดิษฐ์อัจฉริยะ (Young Innovator Camp)',
    fiscalYear: '2569',
    gradeLevel: 'ประถมศึกษาตอนปลาย (ป.4 - ป.6)',
    department: 'กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี',
    responsiblePerson: '',
    dateRange: '18 - 20 สิงหาคม 2569',
    location: 'ศูนย์นวัตกรรม มหาวิทยาลัยเชียงใหม่',
    participants: { students: 90, teachers: 8, supportStaff: 4, total: 102 },
    budget: 58000,
    status: 'approved',
    statusLabel: 'อนุมัติแล้ว',
    documentsReady: 4,
    documentsTotal: 4
  },
  {
    id: 'PRJ-ADAPT-03',
    code: 'PRJ-03',
    title: 'ก้าวทันการเปลี่ยนแปลงและพร้อมปรับตัว',
    slug: 'adaptation',
    themeColor: '#0D9488',
    accentColor: '#2DD4BF',
    icon: '🌱',
    activityName: 'กิจกรรมการเรียนรู้ทักษะศตวรรษที่ 21 และการรู้เท่าทันเทคโนโลยีดิจิทัล',
    fiscalYear: '2569',
    gradeLevel: 'ประถมศึกษาตอนต้น - ตอนปลาย',
    department: 'ฝ่ายพัฒนานักเรียนและแนะแนว',
    responsiblePerson: '',
    dateRange: '25 - 27 กันยายน 2569',
    location: 'โรงเรียนสาธิต มช.',
    participants: { students: 140, teachers: 12, supportStaff: 4, total: 156 },
    budget: 42000,
    status: 'active',
    statusLabel: 'กำลังดำเนินการ',
    documentsReady: 3,
    documentsTotal: 4
  },
  {
    id: 'PRJ-WORLD-04',
    code: 'PRJ-04',
    title: 'เรียนรู้สู่โลกกว้าง',
    slug: 'wide-world',
    themeColor: '#D97706',
    accentColor: '#FBBF24',
    icon: '🌏',
    activityName: 'กิจกรรมทัศนศึกษาแหล่งเรียนรู้ทางธรรมชาติ ดาราศาสตร์ และประวัติศาสตร์ล้านนา',
    fiscalYear: '2569',
    gradeLevel: 'ทุกระดับชั้น (อนุบาลและประถม)',
    department: 'ฝ่ายกิจกรรมพัฒนาผู้เรียนและศึกษาดูงานนอกสถานที่',
    responsiblePerson: '',
    dateRange: '14 - 16 พฤศจิกายน 2569',
    location: 'อุทยานดาราศาสตร์สิรินธร และศูนย์ศึกษาธรรมชาติเชียงใหม่',
    participants: { students: 220, teachers: 18, supportStaff: 6, total: 244 },
    budget: 95000,
    status: 'active',
    statusLabel: 'กำลังดำเนินการ',
    documentsReady: 2,
    documentsTotal: 4
  },
  {
    id: 'PRJ-CITIZEN-05',
    code: 'PRJ-05',
    title: 'พลเมืองไทยบนวิถีโลก',
    slug: 'global-citizen',
    themeColor: '#7C3AED',
    accentColor: '#A78BFA',
    icon: '🏛️',
    activityName: 'กิจกรรมพลเมืองรุ่นเยาว์สร้างสรรค์สังคมและสิทธิหน้าที่วิถีประชาธิปไตย',
    fiscalYear: '2569',
    gradeLevel: 'ประถมศึกษาตอนต้น (ป.1 - ป.3)',
    department: 'กลุ่มสาระการเรียนรู้สังคมศึกษา ศาสนา และวัฒนธรรม',
    responsiblePerson: '',
    dateRange: '15 - 18 มีนาคม 2569',
    location: 'หอประชุมสาธิต มช. และศูนย์ส่งเสริมศิลปวัฒนธรรม มช.',
    participants: { students: 120, teachers: 8, supportStaff: 4, total: 132 },
    budget: 65000,
    status: 'approved',
    statusLabel: 'อนุมัติแล้ว',
    documentsReady: 4,
    documentsTotal: 4
  },
  {
    id: 'PRJ-ITPC-06',
    code: 'PRJ-06',
    title: 'ITPC Challenge',
    slug: 'itpc-challenge',
    themeColor: '#E11D48',
    accentColor: '#FB7185',
    icon: '🚀',
    activityName: 'กิจกรรมค่าย ITPC Summer Camp 2026: โค้ดดิ้ง ปัญญาประดิษฐ์ และหุ่นยนต์เพื่อเยาวชน',
    fiscalYear: '2569',
    gradeLevel: 'ประถมศึกษาตอนต้นและตอนปลาย',
    department: 'โครงการส่งเสริมความเป็นเลิศด้านเทคโนโลยี (ITPC)',
    responsiblePerson: '',
    dateRange: '22 - 25 เมษายน 2569',
    location: 'ศูนย์คอมพิวเตอร์และนวัตกรรม มหาวิทยาลัยเชียงใหม่',
    participants: { students: 85, teachers: 6, supportStaff: 3, total: 94 },
    budget: 48000,
    status: 'active',
    statusLabel: 'กำลังดำเนินการ',
    documentsReady: 3,
    documentsTotal: 4
  }
];

export const ProjectService = {
  /**
   * ดึงรายการ 6 โครงการหลัก
   */
  getProjects() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 6) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    this.saveProjects(SIX_MAIN_PROJECTS);
    return SIX_MAIN_PROJECTS;
  },

  /**
   * บันทึกรายการโครงการ
   */
  saveProjects(projects) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      CloudSyncService.schedulePush();
    } catch (e) {
      console.error('Failed to save projects', e);
    }
  },

  /**
   * ค้นหาโครงการตาม ID หรือ Title
   */
  getProjectById(id) {
    const list = this.getProjects();
    return list.find((p) => p.id === id || p.title === id || p.slug === id || p.code === id) || list[4]; // default to พลเมืองไทยบนวิถีโลก
  },

  /**
   * อัปเดตข้อมูลโครงการ (เช่น ชื่อผู้รับผิดชอบ งบประมาณ เป้าหมาย กำหนดการ สำหรับผู้กำหนดสถานะได้)
   */
  updateProject(id, updatedData) {
    const list = this.getProjects();
    const index = list.findIndex(
      (p) => p.id === id || p.code === id || p.title === id || p.slug === id
    );

    if (index === -1) {
      console.warn(`Project with id "${id}" not found.`);
      return null;
    }

    const current = list[index];

    // จัดการแปลงค่าตัวเลขงบประมาณ
    let parsedBudget = current.budget;
    if (updatedData.budget !== undefined) {
      const bStr = String(updatedData.budget).replace(/,/g, '').trim();
      parsedBudget = Number(bStr) || 0;
    }

    const updated = {
      ...current,
      ...updatedData,
      id: current.id,
      code: current.code,
      title: updatedData.title !== undefined ? updatedData.title.trim() : current.title,
      activityName: updatedData.activityName !== undefined ? updatedData.activityName.trim() : current.activityName,
      responsiblePerson: updatedData.responsiblePerson !== undefined ? updatedData.responsiblePerson.trim() : current.responsiblePerson,
      budget: parsedBudget,
      gradeLevel: updatedData.gradeLevel !== undefined ? updatedData.gradeLevel.trim() : current.gradeLevel,
      dateRange: updatedData.dateRange !== undefined ? updatedData.dateRange.trim() : current.dateRange,
      location: updatedData.location !== undefined ? updatedData.location.trim() : current.location,
      department: updatedData.department !== undefined ? updatedData.department.trim() : current.department,
      fiscalYear: updatedData.fiscalYear !== undefined ? updatedData.fiscalYear.trim() : current.fiscalYear
    };

    list[index] = updated;
    this.saveProjects(list);

    // ซิงค์ข้อมูลโครงการปัจจุบันใน sessionStorage
    try {
      const activeStored = sessionStorage.getItem('satit_cmu_active_project');
      if (activeStored) {
        const activeObj = JSON.parse(activeStored);
        if (activeObj.id === updated.id) {
          sessionStorage.setItem('satit_cmu_active_project', JSON.stringify(updated));
        }
      }
    } catch (e) {
      console.warn('Failed to sync active project in session', e);
    }

    return updated;
  },

  /**
   * สร้างโครงการใหม่
   */
  createProject(data) {
    const list = this.getProjects();
    const nextCodeNum = list.length + 1;
    const code = `PRJ-${String(nextCodeNum).padStart(2, '0')}`;
    const newId = `PRJ-${Date.now()}`;

    const newProject = {
      id: newId,
      code: code,
      title: data.title?.trim() || 'โครงการใหม่',
      slug: data.title ? data.title.toLowerCase().replace(/\s+/g, '-') : `project-${nextCodeNum}`,
      themeColor: data.themeColor || '#6F2C91',
      accentColor: data.accentColor || '#9048B8',
      icon: data.icon || '📁',
      activityName: data.activityName?.trim() || data.title?.trim() || 'กิจกรรมในโครงการ',
      fiscalYear: data.fiscalYear || '2569',
      gradeLevel: data.gradeLevel || 'ทุกระดับชั้น',
      department: data.department || 'โรงเรียนสาธิต มช.',
      responsiblePerson: data.responsiblePerson?.trim() || '',
      dateRange: data.dateRange?.trim() || 'ตลอดปีการศึกษา',
      location: data.location?.trim() || 'โรงเรียนสาธิต มช.',
      participants: {
        students: Number(data.students) || 100,
        teachers: Number(data.teachers) || 10,
        supportStaff: 4,
        total: (Number(data.students) || 100) + (Number(data.teachers) || 10) + 4
      },
      budget: Number(String(data.budget || 50000).replace(/,/g, '')) || 50000,
      status: 'active',
      statusLabel: 'กำลังดำเนินการ',
      documentsReady: 0,
      documentsTotal: 4
    };

    list.push(newProject);
    this.saveProjects(list);
    return newProject;
  },

  /**
   * ค้นหาและกรองโครงการ
   */
  filterProjects({ search = '', fiscalYear = 'all', gradeLevel = 'all', status = 'all' }) {
    const list = this.getProjects();
    const cleanSearch = search.trim().toLowerCase();

    return list.filter((p) => {
      const matchSearch =
        !cleanSearch ||
        p.title.toLowerCase().includes(cleanSearch) ||
        p.activityName.toLowerCase().includes(cleanSearch) ||
        p.responsiblePerson.toLowerCase().includes(cleanSearch) ||
        p.code.toLowerCase().includes(cleanSearch);

      const matchYear = fiscalYear === 'all' || p.fiscalYear === fiscalYear;
      const matchGrade = gradeLevel === 'all' || p.gradeLevel.includes(gradeLevel);
      const matchStatus = status === 'all' || p.status === status;

      return matchSearch && matchYear && matchGrade && matchStatus;
    });
  },

  /**
   * สรุปตัวเลขสถิติ
   */
  getStatistics() {
    const list = this.getProjects();
    const totalProjects = list.length;
    const totalBudget = list.reduce((sum, p) => sum + (p.budget || 0), 0);
    const completedDocs = list.reduce((sum, p) => sum + (p.documentsReady || 0), 0);
    const totalDocs = list.reduce((sum, p) => sum + (p.documentsTotal || 0), 0);
    const activeProjects = list.filter((p) => p.status === 'active' || p.status === 'approved').length;

    return {
      totalProjects,
      totalBudget,
      completedDocs,
      totalDocs,
      activeProjects
    };
  },

  /**
   * ดึงข้อมูลแบบฟอร์ม Excel (Doc/Excel_example.xlsx) ของโครงการ
   */
  getActivityFormData(projectId) {
    const project = this.getProjectById(projectId);
    try {
      const allForms = JSON.parse(localStorage.getItem(FORMS_STORAGE_KEY) || '{}');
      if (allForms[project.id]) {
        return allForms[project.id];
      }
    } catch {
      // fallback
    }

    // ข้อมูลแบบฟอร์มเริ่มต้น: ช่องว่างเปล่าทั้งหมดเพื่อให้ผู้ใช้กรอกข้อมูลเอง
    return {
      projectId: project.id,
      formTitle: 'แบบฟอร์มขออนุมัติบรรจุกิจกรรม สำหรับนักเรียน งบประมาณ 2569',
      projectName: project.title,
      activityName: '',
      responsiblePerson: '',
      objective: '',
      targetOutcome: '',
      semesterYear: '',
      targetGrade: '',
      participants: {
        students: '',
        teachers: '',
        supportStaff: '',
        nurse: '',
        parentsAndExternal: '',
        total: 0
      },
      schedule: {
        dateRange: '',
        timeRange: '',
        location: '',
        travelFormat: '',
        vehicleType: '',
        vehicleCount: '',
        timeSlots: []
      },
      budgetItems: []
    };
  },

  /**
   * บันทึกข้อมูลแบบฟอร์ม Excel ลง Storage
   */
  saveActivityFormData(projectId, formData) {
    try {
      const allForms = JSON.parse(localStorage.getItem(FORMS_STORAGE_KEY) || '{}');
      allForms[projectId] = formData;
      localStorage.setItem(FORMS_STORAGE_KEY, JSON.stringify(allForms));
      CloudSyncService.schedulePush();
    } catch (e) {
      console.error('Failed to save activity form data', e);
    }
  }
};
