/**
 * ACTIVITY FORM CONTROLLER (หน้าแบบฟอร์มขออนุมัติกิจกรรม - Excel View)
 * เชื่อมโยงและคำนวณตัวเลขตามโครงสร้างของ Doc/Excel_example.xlsx
 * แบ่งหมวดงบประมาณเป็น 5 หมวดหลักและเพิ่มหัวข้อย่อยได้
 */

import { $, $$, addEvent, escapeHTML } from '../utils/dom.js';
import { showToast } from '../utils/toast.js';
import { initNavbar } from '../components/navbar.js';
import { initModal } from '../components/modal.js';
import { ProjectService, SIX_MAIN_PROJECTS } from '../services/project-service.js';
import { ActivityService, ACTIVITY_STATUS_MAP } from '../services/activity-service.js';
import { AuthService } from '../services/auth-service.js';
import { WordDocService } from '../services/word-doc-service.js';
import { formatBahtText } from '../utils/baht-text.js';

// 5 หมวดงบประมาณหลักตามระเบียบโรงเรียนสาธิต มช. และแบบฟอร์มขออนุมัติบรรจุกิจกรรม
export const BUDGET_CATEGORIES = [
  { key: '1', title: '1. ค่าตอบแทน', icon: '💼', defaultUnit1: 'คน', defaultUnit2: 'ชั่วโมง' },
  { key: '2', title: '2. ค่าใช้สอย', icon: '🚌', defaultUnit1: 'คน', defaultUnit2: 'มื้อ' },
  { key: '3', title: '3. ค่าวัสดุ', icon: '📦', defaultUnit1: 'ชุด', defaultUnit2: 'ชุด' },
  { key: '4', title: '4. ค่าสาธารณูปโภค', icon: '⚡', defaultUnit1: 'งาน', defaultUnit2: 'งาน' },
  { key: '5', title: '5. อื่นๆ', icon: '📌', defaultUnit1: 'งาน', defaultUnit2: 'งาน' }
];

// รายการตัวเลือก Dropdown สำหรับแต่ละหมวดงบประมาณ
export const BUDGET_CATEGORY_PRESETS = {
  '1': {
    placeholder: '-- เลือกประเภทค่าตอบแทน --',
    items: [
      { name: 'ค่าตอบแทนวิทยากรบรรยาย', label: 'ค่าตอบแทนวิทยากรบรรยาย (600 บาท/คน/ชม.)', rate: 600, unit1: 'คน', unit2: 'ชั่วโมง' },
      { name: 'ค่าตอบแทนวิทยากรปฏิบัติการ', label: 'ค่าตอบแทนวิทยากรปฏิบัติการ (300 บาท/คน/ชม.)', rate: 300, unit1: 'คน', unit2: 'ชั่วโมง' },
      { name: 'ค่าตอบแทนปฏิบัติงานนอกเวลาราชการ', label: 'ค่าตอบแทนปฏิบัติงานนอกเวลาราชการ (กรอกเอง)', unit1: 'คน', unit2: 'ชั่วโมง' },
      { name: 'ค่าตอบแทนในการเดินทางไปปฏิบัติงานของผู้ทำหน้าที่ขับรถ', label: 'ค่าตอบแทนในการเดินทางไปปฏิบัติงานของผู้ทำหน้าที่ขับรถ (กรอกเอง)', unit1: 'คน', unit2: 'วัน' }
    ]
  },
  '2': {
    placeholder: '-- เลือกประเภทค่าใช้สอย --',
    items: [
      { name: 'ค่าอาหารว่างและเครื่องดื่ม สำหรับอาจารย์และเจ้าหน้าที่', unit1: 'คน', unit2: 'มื้อ' },
      { name: 'ค่าอาหารเช้า สำหรับอาจารย์และเจ้าหน้าที่', unit1: 'คน', unit2: 'มื้อ' },
      { name: 'ค่าอาหารกลางวัน สำหรับอาจารย์และเจ้าหน้าที่', unit1: 'คน', unit2: 'มื้อ' },
      { name: 'ค่าอาหารเย็น สำหรับอาจารย์และเจ้าหน้าที่', unit1: 'คน', unit2: 'มื้อ' },
      { name: 'ค่าอาหารว่างและเครื่องดื่ม สำหรับนักเรียน', unit1: 'คน', unit2: 'มื้อ' },
      { name: 'ค่าอาหารเช้า สำหรับนักเรียน', unit1: 'คน', unit2: 'มื้อ' },
      { name: 'ค่าอาหารกลางวัน สำหรับนักเรียน', unit1: 'คน', unit2: 'มื้อ' },
      { name: 'ค่าอาหารเย็น สำหรับนักเรียน', unit1: 'คน', unit2: 'มื้อ' },
      { name: 'ค่าที่พัก', unit1: 'คน', unit2: 'คืน' },
      { name: 'ค่าลงทะเบียน', unit1: 'คน', unit2: 'รายการ' },
      { name: 'ค่าจ้างเหมาบริการ', unit1: 'งาน', unit2: 'รายการ' },
      { name: 'ค่าจ้างเหมารถตู้พร้อมคนขับและน้ำมันเชื้อเพลิง', unit1: 'คัน', unit2: 'วัน' },
      { name: 'ค่าจ้างเหมาจัดกิจรรม', unit1: 'งาน', unit2: 'รายการ' },
      { name: 'ค่าจ้างทำป้ายไวนิล', unit1: 'ผืน', unit2: 'แผ่น' },
      { name: 'ค่าเข้าชมสถานที่', unit1: 'คน', unit2: 'แห่ง' },
      { name: 'ค่าเช่าสถานที่', unit1: 'แห่ง', unit2: 'วัน' },
      { name: 'ค่าเช่าอปุกรณ์', unit1: 'ชุด', unit2: 'วัน' },
      { name: 'ค่าเดินทาง', unit1: 'คน', unit2: 'เที่ยว' },
      { name: 'ค่าเบี้ยเลี้ยง', unit1: 'คน', unit2: 'วัน' },
      { name: 'ค่าของที่ระลึก', unit1: 'ชิ้น', unit2: 'ชุด' },
      { name: 'ค่าของรางวัล', unit1: 'ชิ้น', unit2: 'รางวัล' },
      { name: 'ค่าจ้างเหมาทำของที่ระลึก', unit1: 'ชิ้น', unit2: 'งาน' },
      { name: 'ค่าบำรุงสถานที่', unit1: 'แห่ง', unit2: 'วัน' },
      { name: 'ค่าจ้างเหมารถราง', unit1: 'คัน', unit2: 'วัน' }
    ]
  },
  '3': {
    placeholder: '-- เลือกประเภทค่าวัสดุ --',
    items: [
      { name: 'ค่าวัสดุ', unit1: 'รายการ', unit2: 'ชุด' },
      { name: 'ค่าน้ำมันเชื้อเพลิง', unit1: 'คัน', unit2: 'ลิตร' }
    ]
  },
  '4': {
    placeholder: '-- เลือกประเภทค่าสาธารณูปโภค --',
    items: [
      { name: 'ค่าขนส่งพัสดุ', unit1: 'รายการ', unit2: 'ชิ้น' },
      { name: 'ค่าบริการไปรษณีย์', unit1: 'รายการ', unit2: 'ครั้ง' },
      { name: 'ค่าไฟฟ้า', unit1: 'เดือน', unit2: 'งวด' },
      { name: 'ค่าดวงคราไปรษณียากร (แสตมป์)', unit1: 'ดวง', unit2: 'ชุด' },
      { name: 'ค่าธรรมเนียมธนาคาร', unit1: 'ครั้ง', unit2: 'รายการ' }
    ]
  },
  '5': {
    placeholder: '-- เลือกประเภทอื่นๆ --',
    items: [
      { name: 'เงินเหลือจ่ายสมทบงบประมาณคณะ', unit1: 'โครงการ', unit2: 'งวด' },
      { name: 'ค่าครุภัณฑ์', unit1: 'ชิ้น', unit2: 'ชุด' }
    ]
  }
};

// ข้อมูลแถวกำหนดการเริ่มต้น: เริ่มต้นเป็นว่างเปล่าเพื่อให้ผู้ใช้เพิ่มเอง
const DEFAULT_SCHEDULE_SLOTS = [];

// ข้อมูลแถวงบประมาณเริ่มต้น: เริ่มต้นเป็นว่างเปล่าเพื่อให้ผู้ใช้เพิ่มเอง
const DEFAULT_BUDGET_ITEMS = [];

// รายการข้อมูลวิทยากร (กรณีมีเชิญวิทยากร)
let speakersData = [];

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();

  // 1. ดึงโครงการเป้าหมายจาก URL params หรือ Session
  const urlParams = new URLSearchParams(window.location.search);
  const projectIdFromUrl = urlParams.get('id');
  const actIdFromUrl = urlParams.get('actId');

  let activeProject = null;
  if (projectIdFromUrl) {
    activeProject = ProjectService.getProjectById(projectIdFromUrl);
  } else {
    try {
      const stored = sessionStorage.getItem('satit_cmu_active_project');
      if (stored) activeProject = JSON.parse(stored);
    } catch {}
  }

  if (!activeProject) {
    activeProject = SIX_MAIN_PROJECTS[4]; // Default: พลเมืองไทยบนวิถีโลก
  }

  // 2. ตั้งค่าปุ่มย้อนกลับไปหน้ารายการกิจกรรม
  const backBtn = $('#backToActivitiesBtn');
  if (backBtn) {
    backBtn.href = `/project-activities.html?id=${encodeURIComponent(activeProject.id)}`;
  }

  // 3. ตั้งค่า Project Quick Switcher
  const projectSelect = $('#projectQuickSelect');
  if (projectSelect) {
    projectSelect.innerHTML = SIX_MAIN_PROJECTS.map(
      (p) => `<option value="${p.id}" ${p.id === activeProject.id ? 'selected' : ''}>${p.title}</option>`
    ).join('');

    addEvent(projectSelect, 'change', (e) => {
      window.location.href = `/activity-form.html?id=${encodeURIComponent(e.target.value)}`;
    });
  }

  // 4. โหลดข้อมูลแบบฟอร์ม (ช่องว่างเปล่าทั้งหมดเพื่อให้ผู้ใช้ทดสอบกรอกข้อมูลเอง)
  const isNewMode = urlParams.get('mode') === 'new' || !actIdFromUrl;
  let formData;

  if (isNewMode) {
    formData = {
      projectId: activeProject.id,
      formTitle: 'แบบฟอร์มขออนุมัติบรรจุกิจกรรม สำหรับนักเรียน งบประมาณ 2569',
      projectName: activeProject.title,
      activityName: '',
      responsiblePerson: '',
      coordinatorPhone: '',
      hasSpeakers: false,
      speakers: [],
      speakerName: '',
      speakerPosition: '',
      speakerOrganization: '',
      speakerTopic: '',
      objective: '',
      targetOutcome: '',
      semesterYear: '',
      targetGrade: '',
      participants: { students: '', teachers: '', supportStaff: '', nurse: '', parentsAndExternal: '', total: 0 },
      schedule: { dateRange: '', timeRange: '', location: '', travelFormat: '', vehicleType: '', vehicleCount: '', timeSlots: [] },
      budgetItems: []
    };
  } else {
    formData = ProjectService.getActivityFormData(activeProject.id);
    if (!formData.schedule) formData.schedule = {};
    if (!Array.isArray(formData.schedule.timeSlots)) formData.schedule.timeSlots = [];
    if (!Array.isArray(formData.budgetItems)) formData.budgetItems = [];

    const existingAct = ActivityService.getActivityById(actIdFromUrl);
    if (existingAct) {
      formData.activityName = existingAct.title || '';
      if (existingAct.dateRange) formData.schedule.dateRange = existingAct.dateRange;
      if (existingAct.location) formData.schedule.location = existingAct.location;
      if (existingAct.timeRange) formData.schedule.timeRange = existingAct.timeRange;
      if (existingAct.responsiblePerson) formData.responsiblePerson = existingAct.responsiblePerson;
      if (existingAct.coordinatorPhone || existingAct.responsiblePhone) {
        formData.coordinatorPhone = existingAct.coordinatorPhone || existingAct.responsiblePhone;
      }
      if (existingAct.hasSpeakers !== undefined) formData.hasSpeakers = existingAct.hasSpeakers;
      if (Array.isArray(existingAct.speakers)) formData.speakers = existingAct.speakers;
      if (existingAct.speakerName) formData.speakerName = existingAct.speakerName;
      if (existingAct.speakerPosition) formData.speakerPosition = existingAct.speakerPosition;
      if (existingAct.speakerOrganization) formData.speakerOrganization = existingAct.speakerOrganization;
      if (existingAct.speakerTopic) formData.speakerTopic = existingAct.speakerTopic;
      if (existingAct.objective) formData.objective = existingAct.objective;
      if (existingAct.targetOutcome) formData.targetOutcome = existingAct.targetOutcome;
      if (existingAct.semesterYear) formData.semesterYear = existingAct.semesterYear;
      if (existingAct.targetGrade) formData.targetGrade = existingAct.targetGrade;
      if (existingAct.participants) {
        formData.participants.students = existingAct.participants.students || '';
        formData.participants.teachers = existingAct.participants.teachers || '';
        formData.participants.supportStaff = existingAct.participants.supportStaff || '';
        formData.participants.nurse = existingAct.participants.nurse || '';
        formData.participants.parentsAndExternal = existingAct.participants.parentsAndExternal || '';
      }
      if (Array.isArray(existingAct.timeSlots)) {
        formData.schedule.timeSlots = existingAct.timeSlots;
      }
      if (Array.isArray(existingAct.budgetItems)) {
        formData.budgetItems = existingAct.budgetItems;
      }
    }
  }

  // 5. แสดงผลข้อมูลลงในฟอร์ม
  populateFormFields(formData);

  // 6. ติดตามการเปลี่ยนแปลงตัวเลขเพื่อคำนวณยอดรวม Real-time
  attachCalculationListeners();

  // 7. จัดการปุ่มเพิ่มแถวกำหนดการ (+ เพิ่มช่วงเวลา)
  const addScheduleRowBtn = $('#addScheduleRowBtn');
  if (addScheduleRowBtn) {
    addEvent(addScheduleRowBtn, 'click', () => {
      addScheduleRow('', '', '');
      showToast({ type: 'info', title: 'เพิ่มแถวแล้ว', message: 'เพิ่มช่วงเวลากำหนดการใหม่เรียบร้อย' });
    });
  }

  // 8. Action Buttons Handlers: บันทึกแบบร่าง
  const saveBtn = $('#saveFormBtn');
  if (saveBtn) {
    addEvent(saveBtn, 'click', () => {
      saveCurrentFormData(activeProject.id, actIdFromUrl);
      showToast({
        type: 'success',
        title: 'บันทึกแบบร่างสำเร็จ',
        message: 'บันทึกข้อมูลเรียบร้อยแล้ว สามารถกดปุ่ม "สร้างเอกสาร Word" หรือ "ตรวจสอบข้อมูล" เพื่อส่งเอกสาร'
      });
    });
  }

  const bottomSaveDraft = $('#btnBottomSaveDraft');
  if (bottomSaveDraft) {
    addEvent(bottomSaveDraft, 'click', () => {
      saveCurrentFormData(activeProject.id, actIdFromUrl);
      showToast({
        type: 'success',
        title: 'บันทึกแบบร่างสำเร็จ',
        message: 'บันทึกข้อมูลแบบร่างเรียบร้อยแล้ว'
      });
    });
  }

  const printBtn = $('#printFormBtn');
  if (printBtn) {
    addEvent(printBtn, 'click', () => {
      window.print();
    });
  }

  const exportExcelBtn = $('#exportExcelBtn');
  if (exportExcelBtn) {
    addEvent(exportExcelBtn, 'click', () => {
      showToast({
        type: 'info',
        title: 'ส่งออกไฟล์ Excel',
        message: 'สามารถพิมพ์หรือบันทึกหน้าแบบฟอร์มนี้เป็น PDF/Excel ได้'
      });
    });
  }

  // 9. กำหนดการทำงานของระบบสร้างเอกสารราชการ Word (.docx)
  initWordExportModal(activeProject.id, actIdFromUrl);

  // 10. ระบบจัดการข้อมูลวิทยากร (กรณีมีเชิญวิทยากร)
  initSpeakerSection();

  // 11. ตรวจสอบสิทธิ์และการล็อคแบบฟอร์ม (เฉพาะเจ้าของหรือแอดมิน / ห้ามแก้ไขเมื่อยืนยันแล้วนอกจากแอดมินเปิดสิทธิ์)
  initFormPermissionsAndLockState(activeProject, actIdFromUrl, isNewMode);

  // 12. ระบบตรวจสอบข้อมูลและเลือกประเภทหนังสือราชการ (Verification Modal & Documents Selection Modal)
  initVerificationWorkflow(activeProject.id, actIdFromUrl);
});

/**
 * เติมข้อมูลลงในช่อง Input ต่างๆ ตามโครงสร้าง Excel_example.xlsx (ค่าว่างเปล่าเป็นค่าเริ่มต้น)
 */
function populateFormFields(data) {
  const p = data.participants || {};
  const s = data.schedule || {};

  // หัวข้อโครงการและข้อมูลทั่วไป
  $('#formProjectName').value = data.projectName || '';
  $('#formActivityName').value = data.activityName || '';
  $('#formResponsiblePerson').value = data.responsiblePerson || '';
  $('#formResponsiblePhone').value = data.coordinatorPhone || data.responsiblePhone || '';
  $('#formObjective').value = data.objective || '';
  $('#formTargetOutcome').value = data.targetOutcome || '';
  $('#formSemesterYear').value = data.semesterYear || '';
  $('#formTargetGrade').value = data.targetGrade || '';

  // ผู้เข้าร่วม
  $('#pStudents').value = p.students !== undefined ? p.students : '';
  $('#pTeachers').value = p.teachers !== undefined ? p.teachers : '';
  $('#pSupport').value = p.supportStaff !== undefined ? p.supportStaff : '';
  $('#pNurse').value = p.nurse !== undefined ? p.nurse : '';
  $('#pExternal').value = p.parentsAndExternal !== undefined ? p.parentsAndExternal : '';

  updateParticipantsTotal();

  // กำหนดการและการเดินทาง
  $('#schedDate').value = s.dateRange || '';
  $('#schedTime').value = s.timeRange || '';
  $('#schedLocation').value = s.location || '';
  $('#schedTravelFormat').value = s.travelFormat || '';
  $('#schedVehicleType').value = s.vehicleType || '';
  $('#schedVehicleCount').value = s.vehicleCount !== undefined ? s.vehicleCount : '';

  // ตารางกำหนดการ (เริ่มต้นว่างเปล่า)
  renderScheduleTable(s.timeSlots || []);

  // ตารางงบประมาณ 5 หมวดหลัก (เริ่มต้นว่างเปล่า)
  renderCategorizedBudgetTable(data.budgetItems || []);

  // ข้อมูลวิทยากร (กรณีมีเชิญวิทยากร)
  populateSpeakerFields(data);
}

/**
 * เรนเดอร์ตารางกำหนดการตามช่วงเวลา
 */
function renderScheduleTable(timeSlots) {
  const tbody = $('#scheduleTableBody');
  if (!tbody) return;

  const slots = (Array.isArray(timeSlots) && timeSlots.length > 0) ? timeSlots : DEFAULT_SCHEDULE_SLOTS;

  tbody.innerHTML = '';
  slots.forEach((slot) => {
    addScheduleRow(slot.time, slot.detail, slot.expenseCategory);
  });
}

function addScheduleRow(time = '', detail = '', category = '') {
  const tbody = $('#scheduleTableBody');
  if (!tbody) return;

  const tr = document.createElement('tr');
  tr.className = 'schedule-slot-row';
  tr.innerHTML = `
    <td style="text-align: center; font-weight: 600; width: 140px;">
      <input type="text" class="table-input input-slot-time" style="text-align: center;" value="${escapeHTML(time)}" placeholder="เช่น 08.00 - 09.00 น." />
    </td>
    <td>
      <input type="text" class="table-input input-slot-detail" value="${escapeHTML(detail)}" placeholder="รายละเอียดกิจกรรม..." />
    </td>
    <td style="width: 160px; text-align: center;">
      <input type="text" class="table-input input-slot-category" style="text-align: center;" value="${escapeHTML(category)}" placeholder="เช่น ค่าพาหนะ" />
    </td>
    <td style="width: 44px; text-align: center;">
      <button type="button" class="btn-del-row btn-del-slot" title="ลบแถวนี้">✕</button>
    </td>
  `;

  tr.querySelector('.btn-del-slot')?.addEventListener('click', () => {
    tr.remove();
  });

  tbody.appendChild(tr);
}

/**
 * เรนเดอร์ตารางประมาณการค่าใช้จ่าย แบ่งเป็น 5 หมวดหลัก
 * 1. ค่าตอบแทน - 2. ค่าใช้สอย - 3. ค่าวัสดุ - 4. ค่าสาธารณูปโภค - 5. อื่นๆ
 */
function renderCategorizedBudgetTable(budgetItems) {
  const tbody = $('#budgetTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  const items = (Array.isArray(budgetItems) && budgetItems.length > 0) ? budgetItems : DEFAULT_BUDGET_ITEMS;

  // วนลูป 5 หมวดหลัก
  BUDGET_CATEGORIES.forEach((cat) => {
    // 1. เรนเดอร์แถวหัวข้อหมวดหลัก
    const headerTr = document.createElement('tr');
    headerTr.className = 'category-header-row';
    headerTr.setAttribute('data-cat-key', cat.key);
    headerTr.innerHTML = `
      <td colspan="10">
        <div class="category-header-flex">
          <div class="category-name-group">
            <span>${cat.icon}</span>
            <span>${cat.title}</span>
          </div>
          <div class="category-actions-group">
            <span class="category-subtotal-badge" id="cat-subtotal-${cat.key}">รวม: 0 บาท</span>
            <button type="button" class="btn-add-subitem" data-cat-key="${cat.key}" title="เพิ่มหัวข้อย่อยในหมวดนี้">
              <span>+ เพิ่มหัวข้อย่อย (${cat.key}.x)</span>
            </button>
          </div>
        </div>
      </td>
    `;

    tbody.appendChild(headerTr);

    // 2. ดึงรายการย่อยที่อยู่ในหมวดนี้
    const subItems = items.filter((it) => {
      const catText = it.category || '';
      const subText = it.subCategory || '';
      return catText.includes(cat.key) || catText.includes(cat.title.slice(3)) || subText.startsWith(`${cat.key}.`);
    });

    if (subItems.length > 0) {
      subItems.forEach((subItem) => {
        const itemTr = createSubItemRowElement(cat.key, subItem);
        tbody.appendChild(itemTr);
      });
    } else {
      // หากยังไม่มีรายการย่อยในหมวดนี้ ให้สร้างแถวเริ่มต้น 1 แถว
      const defaultSub = {
        category: cat.title,
        subCategory: `${cat.key}.1`,
        item: `รายการในหมวด ${cat.title.slice(3)}`,
        qty1: 1,
        unit1: cat.defaultUnit1,
        qty2: 1,
        unit2: cat.defaultUnit2,
        rate: 0,
        total: 0,
        note: ''
      };
      const itemTr = createSubItemRowElement(cat.key, defaultSub);
      tbody.appendChild(itemTr);
    }

    // ผูก Event ปุ่มกดเพิ่มหัวข้อย่อยของหมวดนี้
    headerTr.querySelector('.btn-add-subitem')?.addEventListener('click', () => {
      addSubItemRow(cat.key);
      showToast({
        type: 'info',
        title: 'เพิ่มหัวข้อย่อยแล้ว',
        message: `เพิ่มรายการย่อยในหมวด "${cat.title}" เรียบร้อย`
      });
    });
  });

  recalculateBudgetGrandTotal();
}

/**
 * สร้าง HTML Element สำหรับแถวหัวข้อย่อยในหมวดงบประมาณ
 */
function createSubItemRowElement(catKey, item = {}) {
  const tr = document.createElement('tr');
  tr.className = 'budget-item-row';
  tr.setAttribute('data-cat-key', catKey);

  const catObj = BUDGET_CATEGORIES.find((c) => c.key === catKey) || BUDGET_CATEGORIES[0];
  const subCatText = item.subCategory || `${catKey}.1`;
  const itemName = item.item || '';
  const qty1 = item.qty1 !== undefined ? item.qty1 : 1;
  const unit1 = item.unit1 || catObj.defaultUnit1 || 'คน';
  const qty2 = item.qty2 !== undefined ? item.qty2 : 1;
  const unit2 = item.unit2 || catObj.defaultUnit2 || 'ชั่วโมง';
  const rate = item.rate || 0;
  const subtotal = qty1 * qty2 * rate;
  const note = item.note || '';

  const presetConfig = BUDGET_CATEGORY_PRESETS[String(catKey)];

  let itemCellContent = '';
  if (presetConfig) {
    // หา preset ที่ตรงกับ itemName
    const matchedPreset = presetConfig.items.find((p) => p.name === itemName || (itemName && p.name.includes(itemName.trim())));
    let selectedPreset = '';
    if (matchedPreset) {
      selectedPreset = matchedPreset.name;
    } else if (itemName) {
      selectedPreset = 'custom';
    }

    const optionsHtml = presetConfig.items.map((p) => {
      const isSelected = selectedPreset === p.name;
      const label = p.label || p.name;
      return `<option value="${escapeHTML(p.name)}" ${isSelected ? 'selected' : ''}>${escapeHTML(label)}</option>`;
    }).join('');

    itemCellContent = `
      <div class="preset-dropdown-wrapper" style="display: flex; flex-direction: column; gap: 4px;">
        <select class="table-input input-budget-preset" style="font-size: 0.75rem; font-weight: 600; padding: 4px 6px; border-radius: 4px; border: 1.5px solid var(--cmu-purple-200); background: var(--bg-surface-elevated, #fff); color: var(--cmu-purple-900); cursor: pointer;">
          <option value="">${presetConfig.placeholder}</option>
          ${optionsHtml}
          <option value="custom" ${selectedPreset === 'custom' ? 'selected' : ''}>ระบุเอง / อื่นๆ</option>
        </select>
        <input type="text" class="table-input input-item-name" value="${escapeHTML(itemName)}" placeholder="ชื่อรายการ..." />
      </div>
    `;
  } else {
    itemCellContent = `
      <input type="text" class="table-input input-item-name" value="${escapeHTML(itemName)}" placeholder="ระบุรายการค่าใช้จ่าย..." />
    `;
  }

  tr.innerHTML = `
    <td style="width: 100px; text-align: center;">
      <input type="text" class="table-input input-item-subcat" style="text-align: center; font-weight: 700; color: var(--cmu-purple-700);" value="${escapeHTML(subCatText)}" placeholder="${catKey}.1" />
      <input type="hidden" class="input-item-cat" value="${escapeHTML(catObj.title)}" />
    </td>
    <td>
      ${itemCellContent}
    </td>
    <td style="width: 70px;">
      <input type="number" class="table-input table-input-number input-qty1" value="${qty1}" min="0" />
    </td>
    <td style="width: 65px; text-align: center;">
      <input type="text" class="table-input input-unit1" style="text-align: center;" value="${escapeHTML(unit1)}" placeholder="หน่วย" />
    </td>
    <td style="width: 70px;">
      <input type="number" class="table-input table-input-number input-qty2" value="${qty2}" min="0" />
    </td>
    <td style="width: 65px; text-align: center;">
      <input type="text" class="table-input input-unit2" style="text-align: center;" value="${escapeHTML(unit2)}" placeholder="หน่วย" />
    </td>
    <td style="width: 105px;">
      <input type="number" class="table-input table-input-number input-rate" value="${rate}" min="0" />
    </td>
    <td style="width: 120px; text-align: right; font-weight: 700;">
      <span class="cell-subtotal" style="color: var(--cmu-purple-800);">${subtotal.toLocaleString()}</span>
    </td>
    <td style="width: 120px;">
      <input type="text" class="table-input input-note" value="${escapeHTML(note)}" placeholder="หมายเหตุ..." />
    </td>
    <td style="width: 44px; text-align: center;">
      <button type="button" class="btn-del-row btn-del-budget" title="ลบรายการนี้">✕</button>
    </td>
  `;

  if (presetConfig) {
    const presetSelect = tr.querySelector('.input-budget-preset');
    const nameInput = tr.querySelector('.input-item-name');
    const unit1Input = tr.querySelector('.input-unit1');
    const unit2Input = tr.querySelector('.input-unit2');
    const rateInput = tr.querySelector('.input-rate');

    presetSelect?.addEventListener('change', (e) => {
      const val = e.target.value;
      if (!val) return;
      if (val === 'custom') {
        nameInput.focus();
        return;
      }
      const matched = presetConfig.items.find((p) => p.name === val);
      if (matched) {
        nameInput.value = matched.name;
        if (matched.unit1) unit1Input.value = matched.unit1;
        if (matched.unit2) unit2Input.value = matched.unit2;
        if (matched.rate !== undefined) {
          rateInput.value = matched.rate;
        } else {
          rateInput.focus();
          if (typeof rateInput.select === 'function') rateInput.select();
        }
        rateInput.dispatchEvent(new Event('input', { bubbles: true }));
        recalculateBudgetGrandTotal();
      }
    });

    nameInput?.addEventListener('input', () => {
      const curr = nameInput.value.trim();
      const matched = presetConfig.items.find((p) => p.name === curr);
      if (matched) {
        presetSelect.value = matched.name;
      } else if (curr) {
        presetSelect.value = 'custom';
      } else {
        presetSelect.value = '';
      }
    });
  }

  tr.querySelector('.btn-del-budget')?.addEventListener('click', () => {
    tr.remove();
    recalculateBudgetGrandTotal();
  });

  return tr;
}

/**
 * เพิ่มแถวหัวข้อย่อยใหม่ใต้หมวดที่กำหนด
 */
function addSubItemRow(catKey) {
  const tbody = $('#budgetTableBody');
  if (!tbody) return;

  const catObj = BUDGET_CATEGORIES.find((c) => c.key === catKey) || BUDGET_CATEGORIES[0];
  const existingRows = $$(`.budget-item-row[data-cat-key="${catKey}"]`, tbody);
  const nextSubIndex = existingRows.length + 1;
  const nextSubCat = `${catKey}.${nextSubIndex}`;

  const newItem = {
    category: catObj.title,
    subCategory: nextSubCat,
    item: '',
    qty1: 1,
    unit1: catObj.defaultUnit1,
    qty2: 1,
    unit2: catObj.defaultUnit2,
    rate: 0,
    total: 0,
    note: ''
  };

  const newRow = createSubItemRowElement(catKey, newItem);

  // หาแถวสุดท้ายในหมวดนี้ เพื่อแทรกต่อท้ายหมวดนั้นๆ
  if (existingRows.length > 0) {
    const lastRow = existingRows[existingRows.length - 1];
    lastRow.after(newRow);
  } else {
    const headerRow = tbody.querySelector(`.category-header-row[data-cat-key="${catKey}"]`);
    if (headerRow) {
      headerRow.after(newRow);
    } else {
      tbody.appendChild(newRow);
    }
  }

  // โฟกัสไปที่ช่องชื่อรายการหรือ Dropdown ของแถวใหม่
  if (String(catKey) === '1') {
    newRow.querySelector('.input-compensation-preset')?.focus();
  } else {
    newRow.querySelector('.input-item-name')?.focus();
  }

  recalculateBudgetGrandTotal();
}

/**
 * คำนวณยอดรวมงบประมาณแยกตาม 5 หมวด และยอดสุทธิทั้งหมด
 */
function recalculateBudgetGrandTotal() {
  let grandTotal = 0;

  // คำนวณแยกตามแต่ละหมวด
  BUDGET_CATEGORIES.forEach((cat) => {
    let catTotal = 0;
    const rows = $$(`.budget-item-row[data-cat-key="${cat.key}"]`);

    rows.forEach((row) => {
      const qty1 = Number(row.querySelector('.input-qty1')?.value) || 0;
      const qty2 = Number(row.querySelector('.input-qty2')?.value) || 1;
      const rate = Number(row.querySelector('.input-rate')?.value) || 0;
      const subtotal = qty1 * qty2 * rate;

      const subtotalEl = row.querySelector('.cell-subtotal');
      if (subtotalEl) {
        subtotalEl.textContent = subtotal.toLocaleString();
      }
      catTotal += subtotal;
    });

    // อัปเดต Subtotal badge บนหัวหมวด
    const catBadge = $(`#cat-subtotal-${cat.key}`);
    if (catBadge) {
      catBadge.textContent = `รวม: ${catTotal.toLocaleString()} บาท`;
    }

    grandTotal += catTotal;
  });

  // อัปเดตยอดรวมสุทธิทั้งหมด
  const grandTotalEl = $('#budgetGrandTotalDisplay');
  if (grandTotalEl) {
    grandTotalEl.textContent = grandTotal.toLocaleString() + ' บาท';
  }

  // อัปเดตตัวอักษรภาษาไทย
  const bahtTextEl = $('#bahtTextDisplay');
  if (bahtTextEl) {
    bahtTextEl.textContent = `( ${formatBahtText(grandTotal)} )`;
  }
}

/**
 * คำนวณผู้เข้าร่วมทั้งหมด
 */
function updateParticipantsTotal() {
  const students = Number($('#pStudents')?.value) || 0;
  const teachers = Number($('#pTeachers')?.value) || 0;
  const support = Number($('#pSupport')?.value) || 0;
  const nurse = Number($('#pNurse')?.value) || 0;
  const external = Number($('#pExternal')?.value) || 0;

  const total = students + teachers + support + nurse + external;
  const totalDisplay = $('#pTotalDisplay');
  if (totalDisplay) {
    totalDisplay.textContent = `${total} คน`;
  }
}

/**
 * ผูก Event Listeners คำนวณอัตโนมัติ
 */
function attachCalculationListeners() {
  const budgetTable = $('#budgetTableBody');
  if (budgetTable) {
    addEvent(budgetTable, 'input', (e) => {
      if (
        e.target.classList.contains('input-qty1') ||
        e.target.classList.contains('input-qty2') ||
        e.target.classList.contains('input-rate')
      ) {
        recalculateBudgetGrandTotal();
      }
    });
  }

  ['#pStudents', '#pTeachers', '#pSupport', '#pNurse', '#pExternal'].forEach((id) => {
    const input = $(id);
    if (input) {
      addEvent(input, 'input', updateParticipantsTotal);
    }
  });
}

/**
 * รวบรวมข้อมูลปัจจุบันจาก DOM ของแบบฟอร์มเพื่อนำไปบันทึกหรือส่งออก Word
 */
export function collectCurrentFormData(projectId, actId) {
  const students = Number($('#pStudents')?.value) || 0;
  const teachers = Number($('#pTeachers')?.value) || 0;
  const support = Number($('#pSupport')?.value) || 0;
  const nurse = Number($('#pNurse')?.value) || 0;
  const external = Number($('#pExternal')?.value) || 0;
  const totalParticipants = students + teachers + support + nurse + external;

  // รวบรวมข้อมูลแถวกำหนดการจากตาราง DOM
  const timeSlots = [];
  $$('#scheduleTableBody tr').forEach((tr) => {
    const time = tr.querySelector('.input-slot-time')?.value.trim() || '';
    const detail = tr.querySelector('.input-slot-detail')?.value.trim() || '';
    const expenseCategory = tr.querySelector('.input-slot-category')?.value.trim() || '';
    if (time || detail) {
      timeSlots.push({ time, detail, expenseCategory });
    }
  });

  // รวบรวมข้อมูลแถวงบประมาณทุกหมวดจากตาราง DOM
  let grandTotal = 0;
  const budgetItems = [];
  $$('.budget-item-row').forEach((row) => {
    const category = row.querySelector('.input-item-cat')?.value.trim() || '2. ค่าใช้สอย';
    const subCategory = row.querySelector('.input-item-subcat')?.value.trim() || '';
    const item = row.querySelector('.input-item-name')?.value.trim() || '';
    const qty1 = Number(row.querySelector('.input-qty1')?.value) || 0;
    const unit1 = row.querySelector('.input-unit1')?.value.trim() || '';
    const qty2 = Number(row.querySelector('.input-qty2')?.value) || 1;
    const unit2 = row.querySelector('.input-unit2')?.value.trim() || '';
    const rate = Number(row.querySelector('.input-rate')?.value) || 0;
    const subtotal = qty1 * qty2 * rate;
    const note = row.querySelector('.input-note')?.value.trim() || '';

    grandTotal += subtotal;
    if (item || rate > 0) {
      budgetItems.push({
        category,
        subCategory,
        item,
        qty1,
        unit1,
        qty2,
        unit2,
        rate,
        total: subtotal,
        note
      });
    }
  });

  // ดึงข้อมูลวิทยากร (กรณีมีเชิญวิทยากร)
  const toggleSpk = $('#toggleHasSpeakers');
  const hasSpeakers = toggleSpk ? toggleSpk.checked : false;

  const validSpeakers = hasSpeakers
    ? speakersData.filter(s => (s.name && s.name.trim()) || (s.position && s.position.trim()) || (s.organization && s.organization.trim()) || (s.topic && s.topic.trim()))
    : [];

  const speakerName = validSpeakers.map(s => s.name?.trim()).filter(Boolean).join(', ');
  const speakerPosition = validSpeakers.map(s => s.position?.trim()).filter(Boolean).join(', ');
  const speakerOrganization = validSpeakers.map(s => s.organization?.trim()).filter(Boolean).join(', ');
  const speakerTopic = validSpeakers.map(s => s.topic?.trim()).filter(Boolean).join(', ');

  return {
    id: actId,
    projectId,
    formTitle: 'แบบฟอร์มขออนุมัติบรรจุกิจกรรม สำหรับนักเรียน งบประมาณ 2569',
    projectName: $('#formProjectName')?.value.trim() || '',
    activityName: $('#formActivityName')?.value.trim() || '',
    responsiblePerson: $('#formResponsiblePerson')?.value.trim() || '',
    coordinatorPhone: $('#formResponsiblePhone')?.value.trim() || '',
    responsiblePhone: $('#formResponsiblePhone')?.value.trim() || '',
    hasSpeakers,
    speakers: validSpeakers,
    speakerName,
    speakerPosition,
    speakerOrganization,
    speakerTopic,
    objective: $('#formObjective')?.value.trim() || '',
    targetOutcome: $('#formTargetOutcome')?.value.trim() || '',
    semesterYear: $('#formSemesterYear')?.value.trim() || '',
    fiscalYear: '2569',
    targetGrade: $('#formTargetGrade')?.value.trim() || '',
    participants: {
      students,
      teachers,
      supportStaff: support,
      nurse,
      parentsAndExternal: external,
      total: totalParticipants
    },
    schedule: {
      dateRange: $('#schedDate')?.value.trim() || '',
      timeRange: $('#schedTime')?.value.trim() || '',
      location: $('#schedLocation')?.value.trim() || '',
      travelFormat: $('#schedTravelFormat')?.value.trim() || '',
      vehicleType: $('#schedVehicleType')?.value.trim() || '',
      vehicleCount: $('#schedVehicleCount')?.value ? Number($('#schedVehicleCount').value) : '',
      timeSlots
    },
    budgetItems,
    budget: grandTotal
  };
}

/**
 * บันทึกข้อมูลกลับสู่ LocalStorage
 */
export function saveCurrentFormData(projectId, actId, options = {}) {
  const currentUser = AuthService.getCurrentUser();
  const formData = collectCurrentFormData(projectId, actId);

  // บันทึกลงใน ProjectService
  ProjectService.saveActivityFormData(projectId, formData);

  // ดึงข้อมูลเดิมหากมี
  const existingAct = actId ? ActivityService.getActivityById(actId) : null;
  const isLocked = options.isLocked !== undefined ? Boolean(options.isLocked) : (existingAct ? Boolean(existingAct.isLocked) : false);
  const activityStatus = options.status !== undefined ? options.status : (existingAct ? existingAct.status : 'review');
  const selectedDocuments = options.selectedDocuments !== undefined ? options.selectedDocuments : (existingAct?.selectedDocuments || []);

  const creatorId = existingAct?.creatorId || currentUser?.id || currentUser?.email || 'user-1';
  const creatorEmail = existingAct?.creatorEmail || currentUser?.email || 'user@satit.cmu.ac.th';
  const creatorName = existingAct?.creatorName || currentUser?.name || formData.responsiblePerson || 'อาจารย์';

  // บันทึกลงใน ActivityService ด้วย
  const activityToSave = {
    id: actId || `ACT-${Date.now()}`,
    projectId,
    title: formData.activityName || 'กิจกรรมใหม่',
    responsiblePerson: formData.responsiblePerson,
    coordinatorPhone: formData.coordinatorPhone,
    responsiblePhone: formData.coordinatorPhone,
    hasSpeakers: formData.hasSpeakers,
    speakers: formData.speakers,
    speakerName: formData.speakerName,
    speakerPosition: formData.speakerPosition,
    speakerOrganization: formData.speakerOrganization,
    speakerTopic: formData.speakerTopic,
    dateRange: formData.schedule?.dateRange || '',
    timeRange: formData.schedule?.timeRange || '',
    location: formData.schedule?.location || '',
    travelFormat: formData.schedule?.travelFormat || '',
    vehicleType: formData.schedule?.vehicleType || '',
    vehicleCount: formData.schedule?.vehicleCount || '',
    objective: formData.objective || '',
    targetOutcome: formData.targetOutcome || '',
    semesterYear: formData.semesterYear || '',
    targetGrade: formData.targetGrade || '',
    participants: formData.participants,
    timeSlots: formData.schedule?.timeSlots || [],
    budgetItems: formData.budgetItems || [],
    budget: formData.budget || 0,
    status: activityStatus,
    isLocked,
    selectedDocuments,
    creatorId,
    creatorEmail,
    creatorName,
    submittedAt: options.isLocked ? (existingAct?.submittedAt || new Date().toISOString()) : (existingAct?.submittedAt || null)
  };

  ActivityService.saveActivity(activityToSave);

  return activityToSave;
}

/**
 * ตัวควบคุมหน้าต่าง Modal สร้างเอกสารราชการ Word (.docx)
 * จัดการการเลือกแม่แบบ, การพรีวิว Tag Mapping, และการดาวน์โหลดไฟล์จริง
 */
function initWordExportModal(projectId, actId) {
  const modal = $('#wordExportModal');
  const closeBtn = $('#closeWordModalBtn');
  const cancelBtn = $('#cancelWordModalBtn');
  const exportWordBtn = $('#exportWordBtn');
  const confirmBtn = $('#btnConfirmGenerateWord');
  const copyTagsBtn = $('#copyAllTagsBtn');
  const customFileInput = $('#customDocxInput');
  const customUploadBox = $('#customUploadContainer');
  const customFileName = $('#customFileName');
  const outputFilenameInput = $('#outputDocxFilename');
  const tableBody = $('#wordMappingTableBody');

  if (!modal) return;

  let uploadedCustomFile = null;

  // ฟังก์ชันเปิด Modal พร้อมโหลดข้อมูลจากฟอร์มปัจจุบัน
  const openModal = () => {
    const currentData = collectCurrentFormData(projectId, actId);

    // ตั้งชื่อไฟล์เริ่มต้นตามชื่อกิจกรรม
    const actNameSafe = (currentData.activityName || 'กิจกรรม')
      .replace(/[/\\?%*:|"<>]/g, '_')
      .substring(0, 45);
    
    if (outputFilenameInput) {
      const selectedRadio = $('input[name="wordTemplate"]:checked');
      const tVal = selectedRadio ? selectedRadio.value : 'field_trip';
      if (tVal === 'off_campus') {
        outputFilenameInput.value = `บันทึกข้อความขออนุมัติ_${actNameSafe}.docx`;
      } else {
        outputFilenameInput.value = `หนังสือขอความอนุเคราะห์_${actNameSafe}.docx`;
      }
    }

    // เรนเดอร์ตาราง Mapping ของตัวแปร
    renderMappingTable(currentData);

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  // ฟังก์ชันปิด Modal
  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (exportWordBtn) {
    addEvent(exportWordBtn, 'click', openModal);
  }
  if (closeBtn) {
    addEvent(closeBtn, 'click', closeModal);
  }
  if (cancelBtn) {
    addEvent(cancelBtn, 'click', closeModal);
  }

  // ปิดเมื่อคลิกนอกหน้าต่าง
  addEvent(modal, 'click', (e) => {
    if (e.target === modal) closeModal();
  });

  // ปิดด้วยปุ่ม Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  // สลับแม่แบบเอกสาร (Radio buttons)
  const radioInputs = $$('input[name="wordTemplate"]');
  radioInputs.forEach((radio) => {
    addEvent(radio, 'change', () => {
      $$('.template-card').forEach((card) => card.classList.remove('is-selected'));
      radio.closest('.template-card')?.classList.add('is-selected');

      const actNameSafe = ($('#formActivityName')?.value.trim() || 'กิจกรรม')
        .replace(/[/\\?%*:|"<>]/g, '_')
        .substring(0, 45);

      if (radio.value === 'custom') {
        if (customUploadBox) customUploadBox.style.display = 'block';
        if (outputFilenameInput && uploadedCustomFile) {
          outputFilenameInput.value = `เอกสาร_${uploadedCustomFile.name}`;
        }
      } else {
        if (customUploadBox) customUploadBox.style.display = 'none';
        if (outputFilenameInput) {
          switch (radio.value) {
            case 'field_trip':
              outputFilenameInput.value = `หนังสือขอความอนุเคราะห์_ทัศนศึกษา_${actNameSafe}.docx`;
              break;
            case 'site_visit':
              outputFilenameInput.value = `หนังสือขอความอนุเคราะห์_เข้าเยี่ยมชม_${actNameSafe}.docx`;
              break;
            case 'off_campus':
              outputFilenameInput.value = `บันทึกข้อความขออนุมัติ_${actNameSafe}.docx`;
              break;
            case 'invitation_speaker':
              outputFilenameInput.value = `หนังสือเชิญวิทยากร_${actNameSafe}.docx`;
              break;
            case 'consent_parents':
              outputFilenameInput.value = `หนังสือขออนุญาตผู้ปกครอง_${actNameSafe}.docx`;
              break;
            default:
              outputFilenameInput.value = `เอกสารราชการ_${actNameSafe}.docx`;
          }
        }
      }
    });
  });

  // จัดการอัปโหลดแม่แบบกำหนดเอง
  if (customFileInput) {
    addEvent(customFileInput, 'change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        uploadedCustomFile = file;
        if (customFileName) {
          customFileName.textContent = `✓ ไฟล์แม่แบบ: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
          customFileName.style.color = 'var(--cmu-purple-700)';
          customFileName.style.fontWeight = '700';
        }
        if (outputFilenameInput) {
          outputFilenameInput.value = `เอกสารราชการ_${file.name}`;
        }
        showToast({
          type: 'success',
          title: 'โหลดไฟล์แม่แบบสำเร็จ',
          message: `พร้อมแทนที่ข้อมูลลงใน "${file.name}"`
        });
      }
    });
  }

  // ปุ่มคัดลอก Tags ทั้งหมด สำหรับนำไปวางใน Word
  if (copyTagsBtn) {
    addEvent(copyTagsBtn, 'click', () => {
      const currentData = collectCurrentFormData(projectId, actId);
      const tagsList = WordDocService.getAvailablePlaceholdersList(currentData);
      const textToCopy = [
        '=== รายการตัวแปร Tag สำหรับวางในแม่แบบเอกสาร Word (.docx) ===\n',
        ...tagsList.map(
          (t) => `${t.tag} (หรือ ${t.thaiTag}) = ${t.label} [ค่าปัจจุบัน: ${t.currentValue || '-'}]`
        )
      ].join('\n');

      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast({
          type: 'success',
          title: 'คัดลอก Tags สำเร็จ',
          message: 'สามารถนำรายชื่อแท็กไปวางลงในไฟล์ Word (.docx) ของคุณได้ทันที'
        });
      }).catch(() => {
        showToast({
          type: 'info',
          title: 'Tags พื้นฐาน',
          message: '{{projectName}}, {{activityName}}, {{location}}, {{eventDate}}, {{budgetTotal}}'
        });
      });
    });
  }

  // ปุ่มสร้างและดาวน์โหลดเอกสาร Word (.docx)
  if (confirmBtn) {
    addEvent(confirmBtn, 'click', async () => {
      const selectedRadio = $('input[name="wordTemplate"]:checked');
      const templateType = selectedRadio ? selectedRadio.value : 'field_trip';

      let templateSource;
      if (templateType === 'custom') {
        if (!uploadedCustomFile) {
          showToast({
            type: 'error',
            title: 'ยังไม่ได้เลือกไฟล์แม่แบบ',
            message: 'กรุณาคลิกเลือกไฟล์ .docx แม่แบบของคุณก่อนกดสร้างเอกสาร'
          });
          return;
        }
        templateSource = uploadedCustomFile;
      } else {
        const templates = WordDocService.getTemplates();
        const found = templates.find((t) => t.id === templateType);
        templateSource = found ? found.url : '/Doc/Request_Student_Field_Trip.docx';
      }

      // รวบรวมข้อมูลล่าสุดจากหน้าแบบฟอร์ม
      const currentData = collectCurrentFormData(projectId, actId);

      // จัดการชื่อไฟล์ปลายทาง
      let filename = outputFilenameInput?.value.trim() || 'เอกสารราชการ.docx';
      if (!filename.toLowerCase().endsWith('.docx')) {
        filename += '.docx';
      }

      const btnText = $('#btnGenerateWordText');
      const originalText = btnText ? btnText.textContent : 'สร้างและดาวน์โหลดเอกสาร Word (.docx)';
      if (btnText) btnText.textContent = '⏳ กำลังประมวลผลเอกสาร Word...';
      confirmBtn.disabled = true;

      try {
        // ประมวลผลเอกสารผ่าน WordDocService
        const docxBlob = await WordDocService.generateWordDocument(templateSource, currentData);

        // สั่งดาวน์โหลดลงเครื่องผู้ใช้
        WordDocService.downloadBlob(docxBlob, filename);

        showToast({
          type: 'success',
          title: 'สร้างเอกสาร Word สำเร็จ!',
          message: `ดาวน์โหลดไฟล์ "${filename}" เรียบร้อยแล้ว`
        });

        closeModal();
      } catch (err) {
        console.error('Word generation failed:', err);
        showToast({
          type: 'error',
          title: 'ไม่สามารถสร้างเอกสาร Word ได้',
          message: err.message || 'โปรดตรวจสอบความถูกต้องของแม่แบบ .docx'
        });
      } finally {
        if (btnText) btnText.textContent = originalText;
        confirmBtn.disabled = false;
      }
    });
  }

  // แสดงผลตารางจับคู่ตัวแปร (Mapping Table)
  function renderMappingTable(data) {
    if (!tableBody) return;
    const placeholders = WordDocService.getAvailablePlaceholdersList(data);

    tableBody.innerHTML = placeholders
      .map((item) => {
        return `
        <tr>
          <td>
            <span class="tag-code-badge">${escapeHTML(item.tag)}</span>
            <span class="tag-thai-badge">${escapeHTML(item.thaiTag)}</span>
          </td>
          <td>
            <span class="mapping-val-text" title="${escapeHTML(item.currentValue || '-')}">
              ${escapeHTML(item.currentValue || '(ยังไม่ได้กรอก)')}
            </span>
          </td>
          <td style="color: var(--text-muted); font-size: 0.72rem;">
            ${escapeHTML(item.desc)}
          </td>
          <td style="text-align: center;">
            <span class="status-badge-match">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>เชื่อมต่อแล้ว</span>
            </span>
          </td>
        </tr>
      `;
      })
      .join('');
  }
}

/* ==========================================================================
   SPEAKER CONTROLLER FUNCTIONS (ระบบจัดการข้อมูลวิทยากร)
   ========================================================================== */

/**
 * กำหนดค่าและผูก Event สำหรับกล่องเปิด/ปิดข้อมูลวิทยากร
 */
function initSpeakerSection() {
  const toggle = $('#toggleHasSpeakers');
  const container = $('#speakersContainer');
  const btnAdd = $('#btnAddSpeaker');

  if (toggle && container) {
    addEvent(toggle, 'change', () => {
      const isChecked = toggle.checked;
      container.style.display = isChecked ? 'block' : 'none';
      if (isChecked && speakersData.length === 0) {
        speakersData.push({
          id: `spk-${Date.now()}`,
          name: '',
          position: '',
          organization: '',
          topic: ''
        });
        renderSpeakersList();
      }
    });
  }

  if (btnAdd) {
    addEvent(btnAdd, 'click', () => {
      speakersData.push({
        id: `spk-${Date.now()}`,
        name: '',
        position: '',
        organization: '',
        topic: ''
      });
      renderSpeakersList();
      showToast({
        type: 'info',
        title: 'เพิ่มวิทยากรแล้ว',
        message: `เพิ่มวิทยากรท่านที่ ${speakersData.length} เรียบร้อยแล้ว`
      });
    });
  }
}

/**
 * เติมข้อมูลวิทยากรเดิมลงในฟอร์มเมื่อโหลดข้อมูลกิจกรรม
 */
function populateSpeakerFields(data) {
  const toggleSpk = $('#toggleHasSpeakers');
  const containerSpk = $('#speakersContainer');

  const hasSpeakers = Boolean(
    data.hasSpeakers ||
    (Array.isArray(data.speakers) && data.speakers.length > 0) ||
    data.speakerName
  );

  if (toggleSpk) {
    toggleSpk.checked = hasSpeakers;
  }
  if (containerSpk) {
    containerSpk.style.display = hasSpeakers ? 'block' : 'none';
  }

  if (Array.isArray(data.speakers) && data.speakers.length > 0) {
    speakersData = data.speakers.map(s => ({
      id: s.id || `spk-${Date.now()}-${Math.random()}`,
      name: s.name || '',
      position: s.position || '',
      organization: s.organization || s.org || '',
      topic: s.topic || ''
    }));
  } else if (data.speakerName) {
    speakersData = [{
      id: `spk-${Date.now()}`,
      name: data.speakerName,
      position: data.speakerPosition || '',
      organization: data.speakerOrganization || '',
      topic: data.speakerTopic || ''
    }];
  } else {
    speakersData = [];
  }

  if (hasSpeakers && speakersData.length === 0) {
    speakersData.push({
      id: `spk-${Date.now()}`,
      name: '',
      position: '',
      organization: '',
      topic: ''
    });
  }

  renderSpeakersList();
}

/**
 * เรนเดอร์การ์ดรายการวิทยากรในหน้าฟอร์ม
 */
function renderSpeakersList() {
  const listEl = $('#speakersList');
  if (!listEl) return;

  if (speakersData.length === 0) {
    listEl.innerHTML = `
      <div style="text-align: center; padding: var(--space-4); color: var(--text-muted); font-size: var(--font-size-xs);">
        ยังไม่มีข้อมูลวิทยากร กดปุ่ม "+ เพิ่มวิทยากรอีกท่าน" ด้านล่างเพื่อเพิ่ม
      </div>
    `;
    return;
  }

  listEl.innerHTML = speakersData.map((spk, idx) => `
    <div class="speaker-card" data-index="${idx}">
      <div class="speaker-card-header">
        <div class="speaker-card-badge">
          <span>🎤 วิทยากรคนที่ ${idx + 1}</span>
        </div>
        ${speakersData.length > 1 ? `
          <button type="button" class="btn-remove-speaker" data-index="${idx}" title="ลบวิทยากรท่านนี้">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span>ลบ</span>
          </button>
        ` : ''}
      </div>

      <div class="speaker-form-grid">
        <div class="excel-field-group">
          <label class="excel-field-label">ชื่อ-นามสกุล วิทยากร <span class="input-label-required">*</span></label>
          <input type="text" class="excel-field-input spk-input-name" data-index="${idx}" placeholder="เช่น ดร.สมชาย ใจดี หรือ นายสมศักดิ์ รักเรียน" value="${escapeHTML(spk.name || '')}" />
        </div>

        <div class="excel-field-group">
          <label class="excel-field-label">ตำแหน่ง / ความเชี่ยวชาญ</label>
          <input type="text" class="excel-field-input spk-input-position" data-index="${idx}" placeholder="เช่น นักวิจัยชำนาญการพิเศษ, อาจารย์ประจำ..." value="${escapeHTML(spk.position || '')}" />
        </div>

        <div class="excel-field-group">
          <label class="excel-field-label">สังกัด / หน่วยงาน</label>
          <input type="text" class="excel-field-input spk-input-org" data-index="${idx}" placeholder="เช่น สถาบันวิจัยดาราศาสตร์แห่งชาติ (สดร.) หรือ คณะแพทยศาสตร์ มช." value="${escapeHTML(spk.organization || '')}" />
        </div>

        <div class="excel-field-group">
          <label class="excel-field-label">หัวข้อการบรรยาย / ถ่ายทอดความรู้</label>
          <input type="text" class="excel-field-input spk-input-topic" data-index="${idx}" placeholder="เช่น ดาราศาสตร์เบื้องต้น หรือ การปฐมพยาบาลเบื้องต้น" value="${escapeHTML(spk.topic || '')}" />
        </div>
      </div>
    </div>
  `).join('');

  // ผูกการรับค่าช่อง input
  listEl.querySelectorAll('.spk-input-name').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = Number(e.target.dataset.index);
      if (speakersData[idx]) speakersData[idx].name = e.target.value;
    });
  });

  listEl.querySelectorAll('.spk-input-position').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = Number(e.target.dataset.index);
      if (speakersData[idx]) speakersData[idx].position = e.target.value;
    });
  });

  listEl.querySelectorAll('.spk-input-org').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = Number(e.target.dataset.index);
      if (speakersData[idx]) speakersData[idx].organization = e.target.value;
    });
  });

  listEl.querySelectorAll('.spk-input-topic').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const idx = Number(e.target.dataset.index);
      if (speakersData[idx]) speakersData[idx].topic = e.target.value;
    });
  });

  // ผูกปุ่มลบวิทยากร
  listEl.querySelectorAll('.btn-remove-speaker').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.index);
      speakersData.splice(idx, 1);
      renderSpeakersList();
    });
  });
}

/**
 * ตรวจสอบสิทธิ์การเข้าถึงและการล็อคแบบฟอร์ม
 * กฎ: เมื่อกด "ยืนยัน" แล้วจะไม่สามารถแก้ไขกิจกรรมได้
 * หากต้องการแก้ไข ต้องให้ แอดมิน หรือผู้มีสิทธิ์เปิดสิทธิ์แก้ไขให้เท่านั้น (สถานะ = 'edit')
 * และจะสามารถแก้ไขได้เฉพาะกิจกรรมของตนเองที่กรอกเข้าไปเท่านั้น ไม่สามารถให้คนอื่นแก้ไขให้ได้ นอกจากแอดมิน
 */
function initFormPermissionsAndLockState(activeProject, actId, isNewMode) {
  const currentUser = AuthService.getCurrentUser();
  const isAdmin = AuthService.isAdmin();
  const existingAct = actId ? ActivityService.getActivityById(actId) : null;

  if (isNewMode || !existingAct) {
    return; // กิจกรรมใหม่สามารถกรอกได้เสมอ
  }

  const isLocked = Boolean(existingAct.isLocked);
  const isOwner = Boolean(
    currentUser && (
      existingAct.creatorId === currentUser.id ||
      existingAct.creatorEmail?.toLowerCase() === currentUser.email?.toLowerCase() ||
      (currentUser.name && (existingAct.creatorName === currentUser.name || existingAct.responsiblePerson === currentUser.name))
    )
  );
  const isStatusEdit = existingAct.status === 'edit';
  const canEdit = isAdmin || (!isLocked && isOwner) || (isLocked && isOwner && isStatusEdit);

  const bannerContainer = $('#lockedBannerContainer');
  if (!canEdit) {
    const statusCfg = ACTIVITY_STATUS_MAP[existingAct.status] || { label: 'รอตรวจ' };
    const reasonMsg = (!isOwner && !isAdmin)
      ? `กิจกรรมนี้สร้างโดย <strong>${escapeHTML(existingAct.creatorName || existingAct.responsiblePerson || 'อาจารย์ท่านอื่น')}</strong> ท่านไม่สามารถแก้ไขกิจกรรมของผู้อื่นได้ (สิทธิ์แก้ไขเฉพาะเจ้าของกิจกรรมหรือผู้ดูแลระบบ)`
      : `กิจกรรมนี้ได้รับการยืนยันและล็อคเรียบร้อยแล้ว (สถานะปัจจุบัน: <strong>${statusCfg.label}</strong>) หากต้องการแก้ไข กรุณาติดต่อผู้ดูแลระบบ (Admin) เพื่อเปิดสิทธิ์แก้ไข (ปรับสถานะเป็น "แก้ไข")`;

    if (bannerContainer) {
      bannerContainer.innerHTML = `
        <div class="form-locked-alert-banner">
          <div style="display: flex; align-items: center; gap: var(--space-3);">
            <span style="font-size: 1.5rem;">🔒</span>
            <div>
              <div class="form-locked-badge">
                <span>โหมดดูอย่างเดียว (Locked / Read-Only)</span>
              </div>
              <div style="font-size: var(--font-size-sm); margin-top: 2px;">
                ${reasonMsg}
              </div>
            </div>
          </div>
          ${isAdmin ? `<span class="badge badge-purple" style="font-size: var(--font-size-xs);">สิทธิ์แอดมิน: สามารถเปลี่ยนสถานะได้จากหน้ารายการ</span>` : ''}
        </div>
      `;
    }

    makeFormReadOnly();
  } else if (isLocked && isOwner && isStatusEdit) {
    if (bannerContainer) {
      bannerContainer.innerHTML = `
        <div class="form-locked-alert-banner" style="background: rgba(249, 115, 22, 0.1); border-color: rgba(249, 115, 22, 0.5);">
          <div style="display: flex; align-items: center; gap: var(--space-3);">
            <span style="font-size: 1.5rem;">✏️</span>
            <div>
              <div class="form-locked-badge" style="color: #ea580c;">
                <span>เปิดสิทธิ์แก้ไขโดยผู้ดูแลระบบ (สถานะ: แก้ไข)</span>
              </div>
              <div style="font-size: var(--font-size-sm); margin-top: 2px;">
                ท่านสามารถปรับปรุงรายละเอียดแบบฟอร์มได้ เมื่อแก้ไขเสร็จสิ้นแล้วกรุณากด <strong>"ตรวจสอบข้อมูลกิจกรรม"</strong> และ <strong>"ยืนยัน"</strong> อีกครั้งเพื่อส่งตรวจ
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }
}

/**
 * ล็อคแบบฟอร์มให้อยู่ในโหมด Read-Only ทั้งหมด
 */
function makeFormReadOnly() {
  $$('.excel-document-body input, .excel-document-body select, .excel-document-body textarea').forEach((el) => {
    el.disabled = true;
    el.style.cursor = 'not-allowed';
    el.style.opacity = '0.85';
  });

  $$('.btn-del-budget, .btn-del-row, .btn-add-subitem, #addScheduleRowBtn, #addCustomSpeakerBtn').forEach((el) => {
    el.disabled = true;
    el.style.display = 'none';
  });

  ['#saveFormBtn', '#btnBottomSaveDraft', '#btnVerifyForm', '#toolbarVerifyBtn'].forEach((id) => {
    const el = $(id);
    if (el) {
      el.disabled = true;
      el.style.display = 'none';
    }
  });
}

/**
 * ระบบ Workflow ตรวจสอบข้อมูลกิจกรรม และเลือกประเภทหนังสือราชการ
 */
function initVerificationWorkflow(projectId, actId) {
  const verifyModalEl = $('#verifyActivityModal');
  const docsModalEl = $('#selectDocsModal');
  if (!verifyModalEl || !docsModalEl) return;

  const verifyModal = initModal(verifyModalEl, { staticBackdrop: true });
  const docsModal = initModal(docsModalEl, { staticBackdrop: true });

  const triggerVerification = () => {
    const actName = $('#formActivityName')?.value.trim();
    if (!actName) {
      showToast({
        type: 'warning',
        title: 'ข้อมูลยังไม่ครบถ้วน',
        message: 'กรุณากรอกชื่อกิจกรรมก่อนทำการตรวจสอบข้อมูล'
      });
      $('#formActivityName')?.focus();
      return;
    }

    const formData = collectCurrentFormData(projectId, actId);
    renderVerifyModalSummary(formData);
    verifyModal.open();
  };

  // ผูกปุ่มตรวจสอบ
  $('#btnVerifyForm')?.addEventListener('click', triggerVerification);
  $('#toolbarVerifyBtn')?.addEventListener('click', triggerVerification);

  // ปุ่มใน Modal 1 (ตรวจสอบ)
  $('#btnVerifyBack')?.addEventListener('click', () => {
    verifyModal.close();
  });

  $('#btnVerifyEdit')?.addEventListener('click', () => {
    verifyModal.close();
    showToast({
      type: 'info',
      title: 'กลับสู่การแก้ไขข้อมูล',
      message: 'สามารถปรับปรุงข้อมูลกิจกรรมในแบบฟอร์มได้ทันที'
    });
    const firstInput = $('#formActivityName');
    if (firstInput) {
      firstInput.focus();
      firstInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  $('#btnVerifyConfirm')?.addEventListener('click', () => {
    verifyModal.close();
    // เติมข้อมูลหนังสือที่เคยเลือกไว้เดิม (ถ้ามี)
    const existingAct = actId ? ActivityService.getActivityById(actId) : null;
    if (existingAct && Array.isArray(existingAct.selectedDocuments)) {
      const docs = existingAct.selectedDocuments;
      const chk1 = $('#docReq1');
      const chk2 = $('#docReq2');
      const chk3 = $('#docReq3');
      const chk4 = $('#docReq4');
      const chk5 = $('#docReq5');

      if (chk1) chk1.checked = docs.some((d) => d.includes('ขออนุญาติผู้ปกครอง'));
      if (chk2) chk2.checked = docs.some((d) => d.includes('นำนักเรียนเข้าสถานที่'));
      if (chk3) chk3.checked = docs.some((d) => d.includes('เป็นวิทยากร'));

      const others = docs.filter((d) => d.startsWith('อื่น ๆ:') || d.startsWith('อื่นๆ:'));
      if (others[0] && chk4) {
        chk4.checked = true;
        const inp4 = $('#docReqOther1');
        if (inp4) inp4.value = others[0].replace(/^(อื่น ๆ:|อื่นๆ:)\s*/, '');
      }
      if (others[1] && chk5) {
        chk5.checked = true;
        const inp5 = $('#docReqOther2');
        if (inp5) inp5.value = others[1].replace(/^(อื่น ๆ:|อื่นๆ:)\s*/, '');
      }
    }
    docsModal.open();
  });

  // ปุ่มใน Modal 2 (เลือกหนังสือ)
  $('#btnDocsBack')?.addEventListener('click', () => {
    docsModal.close();
    verifyModal.open();
  });

  $('#btnDocsConfirm')?.addEventListener('click', () => {
    const selectedDocs = [];
    if ($('#docReq1')?.checked) selectedDocs.push($('#docReq1').value);
    if ($('#docReq2')?.checked) selectedDocs.push($('#docReq2').value);
    if ($('#docReq3')?.checked) selectedDocs.push($('#docReq3').value);

    if ($('#docReq4')?.checked) {
      const text = $('#docReqOther1')?.value.trim();
      selectedDocs.push(text ? `อื่น ๆ: ${text}` : 'อื่น ๆ (ระบุตามแบบฟอร์ม)');
    }
    if ($('#docReq5')?.checked) {
      const text = $('#docReqOther2')?.value.trim();
      selectedDocs.push(text ? `อื่น ๆ: ${text}` : 'อื่น ๆ (ระบุตามแบบฟอร์ม)');
    }

    // บันทึกและล็อคกิจกรรม
    saveCurrentFormData(projectId, actId, {
      isLocked: true,
      status: 'review',
      selectedDocuments: selectedDocs
    });

    docsModal.close();

    showToast({
      type: 'success',
      title: 'บันทึกและยืนยันสำเร็จ 🔒',
      message: 'ระบบได้ทำการล็อคกิจกรรมและส่งเพื่อรอการตรวจสอบแล้ว กำลังกลับสู่หน้ารายการกิจกรรม...'
    });

    setTimeout(() => {
      window.location.href = `/project-activities.html?id=${encodeURIComponent(projectId)}`;
    }, 1200);
  });
}

/**
 * เรนเดอร์ข้อมูลสรุปใน Modal ตรวจสอบข้อมูลกิจกรรม
 */
function renderVerifyModalSummary(formData) {
  const verifyBody = $('#verifyModalBody');
  if (!verifyBody) return;

  const catSums = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
  (formData.budgetItems || []).forEach((item) => {
    const catNum = item.category ? item.category.charAt(0) : '2';
    if (catSums[catNum] !== undefined) {
      catSums[catNum] += item.total || 0;
    }
  });

  const timeSlotsCount = formData.schedule?.timeSlots?.length || 0;
  const grandTotal = formData.budget || 0;

  verifyBody.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: var(--space-4); font-family: var(--font-family-thai);">
      
      <!-- Card 1: ข้อมูลกิจกรรมทั่วไป -->
      <div style="background: var(--bg-surface-elevated, #fff); border: 1.5px solid var(--border-subtle, #e2e8f0); border-radius: var(--radius-xl); padding: var(--space-4) var(--space-5); box-shadow: var(--shadow-sm);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3); border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-2);">
          <span style="font-weight: 700; color: var(--cmu-purple-900); font-size: 1rem;">📌 ข้อมูลโครงการและกิจกรรม</span>
          <span class="badge badge-purple">${escapeHTML(formData.projectName)}</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); font-size: var(--font-size-sm);">
          <div>
            <div style="color: var(--text-muted); font-size: var(--font-size-xs);">ชื่อกิจกรรม:</div>
            <div style="font-weight: 700; color: var(--text-main); font-size: 0.95rem;">${escapeHTML(formData.activityName || '-')}</div>
          </div>
          <div>
            <div style="color: var(--text-muted); font-size: var(--font-size-xs);">อาจารย์ผู้รับผิดชอบ / ติดต่อ:</div>
            <div style="font-weight: 600;">${escapeHTML(formData.responsiblePerson || '-')} ${formData.coordinatorPhone ? `(โทร ${escapeHTML(formData.coordinatorPhone)})` : ''}</div>
          </div>
          <div>
            <div style="color: var(--text-muted); font-size: var(--font-size-xs);">วัน-เวลา ที่จัด:</div>
            <div style="font-weight: 600;">📅 ${escapeHTML(formData.schedule?.dateRange || '-')} ${formData.schedule?.timeRange ? `(${escapeHTML(formData.schedule.timeRange)})` : ''}</div>
          </div>
          <div>
            <div style="color: var(--text-muted); font-size: var(--font-size-xs);">สถานที่จัดกิจกรรม:</div>
            <div style="font-weight: 600;">📍 ${escapeHTML(formData.schedule?.location || '-')}</div>
          </div>
          <div>
            <div style="color: var(--text-muted); font-size: var(--font-size-xs);">กลุ่มเป้าหมาย / ผู้เข้าร่วม:</div>
            <div style="font-weight: 600;">👥 นักเรียน ${formData.participants?.students || 0} คน (รวมทั้งหมด ${formData.participants?.total || 0} คน)</div>
          </div>
          <div>
            <div style="color: var(--text-muted); font-size: var(--font-size-xs);">กำหนดการ:</div>
            <div style="font-weight: 600;">🕒 บรรจุช่วงเวลาทั้งหมด ${timeSlotsCount} ช่วง</div>
          </div>
        </div>
        ${formData.hasSpeakers && formData.speakerName ? `
          <div style="margin-top: var(--space-3); padding-top: var(--space-2); border-top: 1px dashed var(--border-subtle); font-size: var(--font-size-xs);">
            <span style="color: var(--text-muted);">วิทยากร: </span>
            <strong>${escapeHTML(formData.speakerName)}</strong> ${formData.speakerOrganization ? `(${escapeHTML(formData.speakerOrganization)})` : ''}
          </div>
        ` : ''}
      </div>

      <!-- Card 2: สรุปงบประมาณ -->
      <div style="background: linear-gradient(135deg, rgba(111, 44, 145, 0.04) 0%, rgba(107, 33, 168, 0.08) 100%); border: 1.5px solid var(--cmu-purple-200); border-radius: var(--radius-xl); padding: var(--space-4) var(--space-5);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3);">
          <span style="font-weight: 700; color: var(--cmu-purple-900); font-size: 1rem;">💰 ประมาณการค่าใช้จ่าย</span>
          <span style="font-size: 1.25rem; font-weight: 800; color: var(--cmu-purple-900);">${grandTotal.toLocaleString()} บาท</span>
        </div>
        <div style="font-size: var(--font-size-xs); color: var(--cmu-purple-700); font-weight: 600; margin-bottom: var(--space-3); text-align: right;">
          ( ${formatBahtText(grandTotal)} )
        </div>

        <div style="display: flex; flex-direction: column; gap: 6px; font-size: var(--font-size-xs); background: var(--bg-surface-elevated, #fff); padding: 10px 14px; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
          <div style="display: flex; justify-content: space-between;">
            <span>1. หมวดค่าตอบแทน:</span>
            <strong>${catSums['1'].toLocaleString()} บาท</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>2. หมวดค่าใช้สอย:</span>
            <strong>${catSums['2'].toLocaleString()} บาท</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>3. หมวดค่าวัสดุ:</span>
            <strong>${catSums['3'].toLocaleString()} บาท</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>4. หมวดค่าสาธารณูปโภค:</span>
            <strong>${catSums['4'].toLocaleString()} บาท</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>5. หมวดอื่นๆ:</span>
            <strong>${catSums['5'].toLocaleString()} บาท</strong>
          </div>
        </div>
      </div>

      <!-- Action Prompt -->
      <div style="padding: 10px 14px; border-radius: var(--radius-lg); background: rgba(5, 150, 105, 0.08); border: 1px solid rgba(5, 150, 105, 0.3); font-size: var(--font-size-xs); color: #065f46; display: flex; align-items: center; gap: 8px;">
        <span>✅</span>
        <span>หากข้อมูลถูกต้องครบถ้วนแล้ว ให้กดปุ่ม <strong>"ยืนยัน"</strong> เพื่อเลือกประเภทหนังสือราชการที่ต้องการ</span>
      </div>

    </div>
  `;
}

