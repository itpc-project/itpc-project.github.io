/**
 * WORD DOCUMENT GENERATOR SERVICE
 * เชื่อมโยงข้อมูลจากหน้าแบบฟอร์มขออนุมัติกิจกรรม (Excel View) ไปยังแม่แบบเอกสาร Word (.docx)
 * รองรับการสร้างเอกสารราชการ: บันทึกข้อความ, หนังสือขอความอนุเคราะห์, หนังสือเชิญวิทยากร
 */

import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { formatBahtText } from '../utils/baht-text.js';

// รายการแม่แบบเอกสารราชการมาตรฐานทั้ง 5 ไฟล์ในระบบ
export const DEFAULT_WORD_TEMPLATES = [
  {
    id: 'field_trip',
    title: 'หนังสือขอความอนุเคราะห์นำนักเรียนเข้าทัศนศึกษา',
    filename: 'Request_Student_Field_Trip.docx',
    url: '/Doc/Request_Student_Field_Trip.docx',
    badge: 'บันทึกข้อความราชการ',
    description: 'ขอความอนุเคราะห์เข้าเยี่ยมชมแหล่งเรียนรู้ พร้อมข้อมูลกิจกรรม วันที่ เวลา สถานที่ ผู้ประสานงาน และจำนวนผู้เข้าร่วม'
  },
  {
    id: 'site_visit',
    title: 'หนังสือขอความอนุเคราะห์นำนักเรียนเข้าเยี่ยมชม / ศึกษาดูงาน',
    filename: 'Request_Student_Site_Visit.docx',
    url: '/Doc/Request_Student_Site_Visit.docx',
    badge: 'หนังสือราชการภายนอก',
    description: 'หนังสือราชการทางการเรียนหัวหน้าหน่วยงานภายนอก เพื่อขอความอนุเคราะห์นำนักเรียนเข้าเยี่ยมชมและทำกิจกรรม'
  },
  {
    id: 'off_campus',
    title: 'บันทึกข้อความขออนุญาตพานักเรียนออกนอกสถานศึกษาและขออนุมัติงบประมาณ',
    filename: 'Off-Campus_Excursion_Request.docx',
    url: '/Doc/Off-Campus_Excursion_Request.docx',
    badge: 'บันทึกข้อความภายใน',
    description: 'บันทึกข้อความราชการเรียนคณบดี เพื่อขออนุมัติพานักเรียนเข้าร่วมกิจกรรมและขออนุมัติเบิกจ่ายงบประมาณ'
  },
  {
    id: 'invitation_speaker',
    title: 'หนังสือขอความอนุเคราะห์เป็นวิทยากรปฏิบัติการ',
    filename: 'Invitation_Workshop_Speaker.docx',
    url: '/Doc/Invitation_Workshop_Speaker.docx',
    badge: 'หนังสือเชิญวิทยากร',
    description: 'หนังสือราชการเชิญวิทยากรภายนอก/ผู้ทรงคุณวุฒิมาบรรยายและจัดกิจกรรมปฏิบัติการให้นักเรียน'
  },
  {
    id: 'consent_parents',
    title: 'หนังสือขออนุญาตผู้ปกครองให้นักเรียนเข้าร่วมกิจกรรม (Consent Form)',
    filename: 'Activity_Participation_Consent.docx',
    url: '/Doc/Activity_Participation_Consent.docx',
    badge: 'แบบฟอร์มผู้ปกครอง',
    description: 'หนังสือแจ้งรายละเอียดกิจกรรม วัน เวลา การแต่งกาย และขอความยินยอมจากผู้ปกครองนักเรียน'
  }
];

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const THAI_DIGITS = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];

function toThaiNumber(numStr) {
  return String(numStr).replace(/[0-9]/g, (d) => THAI_DIGITS[parseInt(d, 10)]);
}

export const WordDocService = {
  /**
   * ดึงรายการแม่แบบมาตรฐานทั้งหมด
   */
  getTemplates() {
    return DEFAULT_WORD_TEMPLATES;
  },

  /**
   * สร้างวันที่ปัจจุบันในรูปแบบหนังสือราชการไทย
   */
  getThaiDateStrings(date = new Date()) {
    const day = date.getDate();
    const month = THAI_MONTHS[date.getMonth()];
    const year = date.getFullYear() + 543;

    return {
      day: String(day),
      month,
      year: String(year),
      fullText: `${day} ${month} ${year}`,
      fullThaiDigits: `${toThaiNumber(day)} ${month} ${toThaiNumber(year)}`
    };
  },

  /**
   * แมปข้อมูลจาก FormData ที่กรอกในหน้าเว็บ เข้ากับชุดตัวแปร Placeholder ใน Word (.docx)
   * รองรับทั้งคีย์ภาษาอังกฤษ (CamelCase, snake_case) และภาษาไทย
   */
  mapFormDataToWordPlaceholders(formData = {}) {
    const participants = formData.participants || {};
    const schedule = formData.schedule || {};
    const budgetItems = formData.budgetItems || [];

    // คำนวณงบประมาณรวม
    let grandTotal = 0;
    budgetItems.forEach((b) => {
      grandTotal += Number(b.total) || (Number(b.qty1 || 0) * Number(b.qty2 || 1) * Number(b.rate || 0));
    });
    if (!grandTotal && formData.budget) {
      grandTotal = Number(formData.budget) || 0;
    }

    const students = Number(participants.students) || 0;
    const teachers = Number(participants.teachers) || 0;
    const supportStaff = Number(participants.supportStaff) || 0;
    const nurse = Number(participants.nurse) || 0;
    const external = Number(participants.parentsAndExternal) || 0;
    const totalStaff = teachers + supportStaff + nurse;
    const totalPeople = Number(participants.total) || (students + totalStaff + external);

    const dates = this.getThaiDateStrings();

    // ดึงเวลาเริ่มต้นและเวลาสิ้นสุดจากกำหนดการ
    const timeSlots = schedule.timeSlots || [];
    let departureTime = '08.00';
    let returnTime = '15.00';
    if (timeSlots.length > 0) {
      const firstSlot = timeSlots[0].time || '';
      const lastSlot = timeSlots[timeSlots.length - 1].time || '';
      if (firstSlot.includes('-')) {
        departureTime = firstSlot.split('-')[0].trim().replace('น.', '').trim();
      }
      if (lastSlot.includes('-')) {
        returnTime = lastSlot.split('-')[1].trim().replace('น.', '').trim();
      }
    }

    // 7. จัดการข้อมูลรายการงบประมาณ (สำหรับวนลูปใน Word และแบบข้อความบล็อกเดียว)
    const formattedBudgetItems = budgetItems.map((b, idx) => {
      const itemNo = idx + 1;
      const itemName = (b.item || b.name || '').trim();
      const qty1 = Number(b.qty1 || 0);
      const qty2 = Number(b.qty2 || 1);
      const rateNum = Number(b.rate || 0);
      const totalNum = Number(b.total) || (qty1 * qty2 * rateNum);
      const totalFormatted = totalNum.toLocaleString('th-TH');
      const totalDecFormatted = totalNum.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      // สร้างข้อความสูตรการคำนวณ เช่น (11 คน x 1 มื้อ x 40 บาท)
      let calcStr = '';
      if (qty1 > 0 && rateNum > 0) {
        const parts = [];
        parts.push(`${qty1} ${b.unit1 || 'คน'}`);
        if (qty2 > 1 || (b.unit2 && b.unit2 !== b.unit1 && b.unit2 !== '-')) {
          parts.push(`${qty2} ${b.unit2 || 'มื้อ'}`);
        }
        parts.push(`${rateNum.toLocaleString('th-TH')} บาท`);
        calcStr = `(${parts.join(' x ')})`;
      } else if (b.note) {
        calcStr = `(${b.note})`;
      } else if (totalNum > 0) {
        calcStr = `(${totalFormatted} บาท)`;
      }

      return {
        itemNo: itemNo,
        ลำดับ: itemNo,
        category: b.category || '',
        หมวด: b.category || '',
        subCategory: b.subCategory || '',
        item: itemName,
        itemName: itemName,
        รายการ: itemName,
        qty1: String(qty1),
        unit1: b.unit1 || '',
        qty2: String(qty2),
        unit2: b.unit2 || '',
        rate: rateNum.toLocaleString('th-TH'),
        rateInt: rateNum.toLocaleString('th-TH'),
        อัตรา: rateNum.toLocaleString('th-TH'),
        total: totalDecFormatted,
        itemTotal: totalFormatted,
        itemTotalInt: totalFormatted,
        itemTotalDec: totalDecFormatted,
        จำนวนเงิน: totalFormatted,
        ยอดเงิน: totalFormatted,
        itemCalc: calcStr,
        สูตรคำนวณ: calcStr,
        การคำนวณ: calcStr,
        note: b.note || '',
        หมายเหตุ: b.note || ''
      };
    });

    // สรุปรายการงบประมาณเป็นข้อความบล็อกเดียว (พร้อมเลขข้อ แท็บ และการคำนวณ)
    const budgetItemsList = formattedBudgetItems.map((it) => {
      const line1 = `   ${it.itemNo}. ${it.itemName}\t${it.itemTotal} บาท`;
      const line2 = it.itemCalc ? `      ${it.itemCalc}` : '';
      return line2 ? `${line1}\n${line2}` : line1;
    }).join('\n');

    // ข้อมูลพื้นฐานหลัก (Core Placeholders สำหรับทั้ง 5 แม่แบบ)
    const baseMapping = {
      // 1. โครงการ & กิจกรรม
      projectName: formData.projectName || 'โครงการ พลเมืองไทยบนวิถีโลก',
      projectCode: formData.projectCode || 'PRJ-05',
      activityName: formData.activityName || 'กิจกรรมพลเมืองรุ่นเยาว์สร้างสรรค์สังคมและสิทธิหน้าที่วิถีประชาธิปไตย',
      targetGroup: formData.targetGrade || 'ประถมศึกษาตอนต้น (ป.1 - ป.3)',
      targetGrade: formData.targetGrade || 'ประถมศึกษาตอนต้น (ป.1 - ป.3)',
      objective: formData.objective || 'เพื่อส่งเสริมให้ผู้เรียนได้เรียนรู้สิทธิหน้าที่ตามวิถีประชาธิปไตยและมีความรับผิดชอบต่อสังคม',
      targetOutcome: formData.targetOutcome || 'นักเรียนมีความรู้ความเข้าใจในสิทธิและหน้าที่พลเมือง',
      semesterYear: formData.semesterYear || 'ภาคเรียนที่ 1 ปีการศึกษา 2569',
      fiscalYear: formData.fiscalYear || '2569',

      // 2. ผู้รับผิดชอบ & ประสานงาน & บุคคลที่เกี่ยวข้อง
      teacherName: formData.responsiblePerson || 'อ.ดร. ศุภชัย วิทยานุกูล',
      responsiblePerson: formData.responsiblePerson || 'อ.ดร. ศุภชัย วิทยานุกูล',
      teacherPosition: formData.teacherPosition || 'อาจารย์กลุ่มสาระการเรียนรู้',
      coordinatorPhone: formData.coordinatorPhone || formData.responsiblePhone || '053-944123 ต่อ 15',
      responsiblePhone: formData.coordinatorPhone || formData.responsiblePhone || '053-944123 ต่อ 15',
      recipientName: formData.recipientName || 'ผู้อำนวยการ / หัวหน้าหน่วยงาน',
      speakerName: formData.speakerName || (Array.isArray(formData.speakers) && formData.speakers[0]?.name) || 'วิทยากรผู้ทรงคุณวุฒิ',
      speakerPosition: formData.speakerPosition || (Array.isArray(formData.speakers) && formData.speakers[0]?.position) || '',
      speakerOrganization: formData.speakerOrganization || (Array.isArray(formData.speakers) && (formData.speakers[0]?.organization || formData.speakers[0]?.org)) || '',
      speakerTopic: formData.speakerTopic || (Array.isArray(formData.speakers) && formData.speakers[0]?.topic) || '',
      deanName: 'ผู้ช่วยศาสตราจารย์ ดร.ทิพย์รัตน์ นพฤทธิ์',
      directorName: 'อาจารย์ ดร.ไชยรัตน์ นิติกาญจนโภคิน',

      // 3. ผู้เข้าร่วมกิจกรรม (แยกกลุ่มและยอดรวม)
      pStudent: String(students),
      pTeacher: String(teachers),
      pStaff: String(supportStaff),
      pNurse: String(nurse),
      pExternal: String(external),
      pTotalStaff: String(totalStaff),
      pTotal: String(totalPeople),
      studentsCount: String(students),
      teachersCount: String(teachers),
      totalParticipants: String(totalPeople),

      // 4. กำหนดการ & สถานที่ & การเดินทาง
      eventDate: schedule.dateRange || formData.dateRange || '15 - 18 มีนาคม 2569',
      eventTime: schedule.timeRange || formData.timeRange || '08.00 - 15.00 น.',
      dateRange: schedule.dateRange || formData.dateRange || '15 - 18 มีนาคม 2569',
      timeRange: schedule.timeRange || formData.timeRange || '08.00 - 15.00 น.',
      departureTime: departureTime,
      returnTime: returnTime,
      location: schedule.location || formData.location || 'ศูนย์ส่งเสริมศิลปวัฒนธรรม มช.',
      travelFormat: schedule.travelFormat || 'เดินทางโดยยานพาหนะของโรงเรียน/เช่าเหมา',
      vehicleType: schedule.vehicleType || 'รถบัสปรับอากาศ',
      vehicleCount: String(schedule.vehicleCount || 2),
      dressCode: formData.dressCode || 'ชุดพละโรงเรียนสาธิต มช. หรือชุดนักเรียนตามระเบียบ',

      // 5. งบประมาณ
      budgetTotal: grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      budgetTotalInt: grandTotal.toLocaleString('th-TH'),
      budgetTotalRaw: String(grandTotal),
      budgetBahtText: formatBahtText(grandTotal),

      // 6. วันที่เอกสารราชการ
      docDate: dates.fullText,
      docDateThai: dates.fullThaiDigits,
      docDay: dates.day,
      docMonth: dates.month,
      docYear: dates.year,

      // 7. รายการย่อยสำหรับตารางและลูป (Looping Sections)
      timeSlots: timeSlots.map((s, idx) => ({
        slotNo: idx + 1,
        ลำดับ: idx + 1,
        time: s.time || '',
        เวลา: s.time || '',
        detail: s.detail || '',
        รายละเอียด: s.detail || '',
        expenseCategory: s.expenseCategory || '-',
        หมวดเบิกจ่าย: s.expenseCategory || '-'
      })),
      budgetItems: formattedBudgetItems,
      budgetItemsList: budgetItemsList,
      budgetItemsText: budgetItemsList
    };

    // เพิ่ม Aliases ภาษาไทยและตัวแปรเสริมเพื่อความเข้ากันได้ 100%
    const thaiAliases = {
      'โครงการ': baseMapping.projectName,
      'ชื่อโครงการ': baseMapping.projectName,
      'รหัสโครงการ': baseMapping.projectCode,
      'กิจกรรม': baseMapping.activityName,
      'ชื่อกิจกรรม': baseMapping.activityName,
      'กลุ่มเป้าหมาย': baseMapping.targetGroup,
      'ระดับชั้น': baseMapping.targetGroup,
      'วัตถุประสงค์': baseMapping.objective,
      'ผลลัพธ์': baseMapping.targetOutcome,
      'เป้าหมาย': baseMapping.targetOutcome,
      'ภาคเรียน': baseMapping.semesterYear,
      'ปีงบประมาณ': baseMapping.fiscalYear,
      'อาจารย์': baseMapping.teacherName,
      'ผู้รับผิดชอบ': baseMapping.teacherName,
      'ชื่ออาจารย์': baseMapping.teacherName,
      'ตำแหน่ง': baseMapping.teacherPosition,
      'เบอร์โทร': baseMapping.coordinatorPhone,
      'เบอร์โทรศัพท์': baseMapping.coordinatorPhone,
      'เบอร์ติดต่อ': baseMapping.coordinatorPhone,
      'เบอร์อาจารย์': baseMapping.coordinatorPhone,
      'ผู้ประสานงาน': baseMapping.teacherName,
      'เรียน': baseMapping.recipientName,
      'ผู้รับ': baseMapping.recipientName,
      'หัวหน้าหน่วยงาน': baseMapping.recipientName,
      'วิทยากร': baseMapping.speakerName,
      'ชื่อวิทยากร': baseMapping.speakerName,
      'ตำแหน่งวิทยากร': baseMapping.speakerPosition,
      'สังกัดวิทยากร': baseMapping.speakerOrganization,
      'หน่วยงานวิทยากร': baseMapping.speakerOrganization,
      'หัวข้อบรรยาย': baseMapping.speakerTopic,
      'นักเรียน': baseMapping.pStudent,
      'จำนวนนักเรียน': baseMapping.pStudent,
      'ครู': baseMapping.pTeacher,
      'จำนวนครู': baseMapping.pTeacher,
      'คณาจารย์': baseMapping.pTeacher,
      'เจ้าหน้าที่': baseMapping.pStaff,
      'จำนวนเจ้าหน้าที่': baseMapping.pStaff,
      'พยาบาล': baseMapping.pNurse,
      'จำนวนพยาบาล': baseMapping.pNurse,
      'ผู้ดูแล': baseMapping.pTotalStaff,
      'จำนวนผู้ดูแล': baseMapping.pTotalStaff,
      'คณาจารย์และผู้ดูแล': baseMapping.pTotalStaff,
      'ผู้เข้าร่วมรวม': baseMapping.pTotal,
      'รวมผู้เข้าร่วม': baseMapping.pTotal,
      'สถานที่': baseMapping.location,
      'สถานที่จัดกิจกรรม': baseMapping.location,
      'วันที่': baseMapping.eventDate,
      'วันจัดกิจกรรม': baseMapping.eventDate,
      'เวลา': baseMapping.eventTime,
      'เวลาจัดกิจกรรม': baseMapping.eventTime,
      'เวลาออกเดินทาง': baseMapping.departureTime,
      'เวลากลับ': baseMapping.returnTime,
      'การเดินทาง': baseMapping.travelFormat,
      'รูปแบบการเดินทาง': baseMapping.travelFormat,
      'รถ': baseMapping.vehicleType,
      'ประเภทยานพาหนะ': baseMapping.vehicleType,
      'จำนวนรถ': baseMapping.vehicleCount,
      'การแต่งกาย': baseMapping.dressCode,
      'ชุดแต่งกาย': baseMapping.dressCode,
      'งบประมาณ': baseMapping.budgetTotal,
      'งบประมาณรวม': baseMapping.budgetTotal,
      'งบประมาณตัวอักษร': baseMapping.budgetBahtText,
      'รายการงบประมาณ': baseMapping.budgetItemsList,
      'งบประมาณรายการ': baseMapping.budgetItemsList,
      'งบประมาณย่อย': baseMapping.budgetItems,
      'วันที่เอกสาร': baseMapping.docDate,
      'วันที่เลขไทย': baseMapping.docDateThai,
      'วัน': baseMapping.docDay,
      'เดือน': baseMapping.docMonth,
      'ปี': baseMapping.docYear
    };

    return {
      ...baseMapping,
      ...thaiAliases
    };
  },

  /**
   * รายการ Tag Metadata ทั้งหมดสำหรับแสดงตารางเชื่อมโยงข้อมูลในหน้าเว็บ
   */
  getAvailablePlaceholdersList(formData = {}) {
    const data = this.mapFormDataToWordPlaceholders(formData);

    return [
      {
        category: 'โครงการและกิจกรรม',
        tag: '{{projectName}}',
        thaiTag: '{{ชื่อโครงการ}}',
        label: 'ชื่อโครงการ',
        currentValue: data.projectName,
        desc: 'ชื่อโครงการหลัก เช่น โครงการ พลเมืองไทยบนวิถีโลก'
      },
      {
        category: 'โครงการและกิจกรรม',
        tag: '{{activityName}}',
        thaiTag: '{{ชื่อกิจกรรม}}',
        label: 'ชื่อกิจกรรม',
        currentValue: data.activityName,
        desc: 'ชื่อกิจกรรมย่อยที่ขออนุมัติจัด'
      },
      {
        category: 'โครงการและกิจกรรม',
        tag: '{{targetGroup}}',
        thaiTag: '{{ระดับชั้น}}',
        label: 'กลุ่มเป้าหมาย/ระดับชั้น',
        currentValue: data.targetGroup,
        desc: 'ระดับชั้นนักเรียน เช่น ประถมศึกษาตอนต้น (ป.1 - ป.3)'
      },
      {
        category: 'โครงการและกิจกรรม',
        tag: '{{objective}}',
        thaiTag: '{{วัตถุประสงค์}}',
        label: 'วัตถุประสงค์',
        currentValue: data.objective,
        desc: 'วัตถุประสงค์ของการจัดกิจกรรม'
      },
      {
        category: 'อาจารย์และผู้ประสานงาน',
        tag: '{{teacherName}}',
        thaiTag: '{{ผู้รับผิดชอบ}}',
        label: 'อาจารย์ผู้รับผิดชอบ',
        currentValue: data.teacherName,
        desc: 'ชื่อ-สกุล อาจารย์ผู้รับผิดชอบโครงการ/กิจกรรม'
      },
      {
        category: 'อาจารย์และผู้ประสานงาน',
        tag: '{{teacherPosition}}',
        thaiTag: '{{ตำแหน่ง}}',
        label: 'ตำแหน่งอาจารย์',
        currentValue: data.teacherPosition,
        desc: 'ตำแหน่งของอาจารย์ผู้ขออนุมัติ เช่น อาจารย์กลุ่มสาระฯ'
      },
      {
        category: 'อาจารย์และผู้ประสานงาน',
        tag: '{{coordinatorPhone}}',
        thaiTag: '{{เบอร์โทร}}',
        label: 'เบอร์โทรผู้ประสานงาน',
        currentValue: data.coordinatorPhone,
        desc: 'หมายเลขโทรศัพท์ติดต่อผู้ประสานงาน'
      },
      {
        category: 'อาจารย์และผู้ประสานงาน',
        tag: '{{recipientName}}',
        thaiTag: '{{เรียน}}',
        label: 'ผู้รับหนังสือราชการ',
        currentValue: data.recipientName,
        desc: 'บุคคลหรือตำแหน่งที่หนังสือเรียนถึง (เช่น หัวหน้าหน่วยงาน, คณบดี)'
      },
      {
        category: 'อาจารย์และผู้ประสานงาน',
        tag: '{{speakerName}}',
        thaiTag: '{{วิทยากร}}',
        label: 'ชื่อวิทยากร',
        currentValue: data.speakerName,
        desc: 'ชื่อ-สกุล วิทยากรผู้ทรงคุณวุฒิที่เชิญมาบรรยาย'
      },
      {
        category: 'ผู้เข้าร่วมกิจกรรม',
        tag: '{{pStudent}}',
        thaiTag: '{{จำนวนนักเรียน}}',
        label: 'จำนวนนักเรียน',
        currentValue: `${data.pStudent} คน`,
        desc: 'จำนวนนักเรียนที่เข้าร่วม (คน)'
      },
      {
        category: 'ผู้เข้าร่วมกิจกรรม',
        tag: '{{pTeacher}}',
        thaiTag: '{{จำนวนครู}}',
        label: 'จำนวนคณาจารย์',
        currentValue: `${data.pTeacher} คน`,
        desc: 'จำนวนอาจารย์ผู้ดูแล (คน)'
      },
      {
        category: 'ผู้เข้าร่วมกิจกรรม',
        tag: '{{pStaff}}',
        thaiTag: '{{เจ้าหน้าที่}}',
        label: 'จำนวนเจ้าหน้าที่',
        currentValue: `${data.pStaff} คน`,
        desc: 'จำนวนเจ้าหน้าที่ฝ่ายสนับสนุน (คน)'
      },
      {
        category: 'ผู้เข้าร่วมกิจกรรม',
        tag: '{{pNurse}}',
        thaiTag: '{{พยาบาล}}',
        label: 'จำนวนพยาบาล',
        currentValue: `${data.pNurse} คน`,
        desc: 'จำนวนพยาบาลวิชาชีพร่วมเดินทาง (คน)'
      },
      {
        category: 'ผู้เข้าร่วมกิจกรรม',
        tag: '{{pTotalStaff}}',
        thaiTag: '{{ผู้ดูแล}}',
        label: 'รวมคณาจารย์และผู้ดูแล',
        currentValue: `${data.pTotalStaff} คน`,
        desc: 'ยอดรวมครู เจ้าหน้าที่ และพยาบาล (คน)'
      },
      {
        category: 'ผู้เข้าร่วมกิจกรรม',
        tag: '{{pTotal}}',
        thaiTag: '{{ผู้เข้าร่วมรวม}}',
        label: 'ผู้เข้าร่วมทั้งหมด',
        currentValue: `${data.pTotal} คน`,
        desc: 'ยอดรวมผู้เข้าร่วมทุกกลุ่ม (คน)'
      },
      {
        category: 'กำหนดการและสถานที่',
        tag: '{{location}}',
        thaiTag: '{{สถานที่}}',
        label: 'สถานที่จัดกิจกรรม',
        currentValue: data.location,
        desc: 'สถานที่จัดกิจกรรม เช่น ศูนย์ส่งเสริมศิลปวัฒนธรรม มช.'
      },
      {
        category: 'กำหนดการและสถานที่',
        tag: '{{eventDate}}',
        thaiTag: '{{วันที่}}',
        label: 'กำหนดการ วันที่',
        currentValue: data.eventDate,
        desc: 'ช่วงวันที่จัดกิจกรรม'
      },
      {
        category: 'กำหนดการและสถานที่',
        tag: '{{eventTime}}',
        thaiTag: '{{เวลา}}',
        label: 'กำหนดการ เวลา',
        currentValue: data.eventTime,
        desc: 'ช่วงเวลาจัดกิจกรรม เช่น 08.00 - 15.00 น.'
      },
      {
        category: 'กำหนดการและสถานที่',
        tag: '{{departureTime}}',
        thaiTag: '{{เวลาออกเดินทาง}}',
        label: 'เวลาออกเดินทาง',
        currentValue: `${data.departureTime} น.`,
        desc: 'เวลาล้อหมุนออกเดินทางจากโรงเรียน'
      },
      {
        category: 'กำหนดการและสถานที่',
        tag: '{{returnTime}}',
        thaiTag: '{{เวลากลับ}}',
        label: 'เวลากลับถึงโรงเรียน',
        currentValue: `${data.returnTime} น.`,
        desc: 'เวลาเดินทางกลับถึงโรงเรียน'
      },
      {
        category: 'กำหนดการและสถานที่',
        tag: '{{dressCode}}',
        thaiTag: '{{การแต่งกาย}}',
        label: 'การแต่งกาย',
        currentValue: data.dressCode,
        desc: 'ชุดแต่งกายของนักเรียน เช่น ชุดพละโรงเรียนสาธิต มช.'
      },
      {
        category: 'งบประมาณ',
        tag: '{{budgetTotal}}',
        thaiTag: '{{งบประมาณ}}',
        label: 'งบประมาณรวม',
        currentValue: `${data.budgetTotal} บาท`,
        desc: 'ยอดงบประมาณรวมทั้งสิ้น (ตัวเลขมีคอมม่า)'
      },
      {
        category: 'งบประมาณ',
        tag: '{{budgetTotalInt}}',
        thaiTag: '{{งบประมาณจำนวนเต็ม}}',
        label: 'งบประมาณรวม (จำนวนเต็ม)',
        currentValue: `${data.budgetTotalInt} บาท`,
        desc: 'ยอดงบประมาณรวมแบบจำนวนเต็ม เช่น 20,240'
      },
      {
        category: 'งบประมาณ',
        tag: '{{budgetBahtText}}',
        thaiTag: '{{งบประมาณตัวอักษร}}',
        label: 'งบประมาณตัวอักษร',
        currentValue: data.budgetBahtText,
        desc: 'ตัวอักษรภาษาไทย เช่น หกหมื่นห้าพันบาทถ้วน'
      },
      {
        category: 'งบประมาณ',
        tag: '{{budgetItemsList}}',
        thaiTag: '{{รายการงบประมาณ}}',
        label: 'รายการงบประมาณทั้งหมด (ข้อความรวม)',
        currentValue: data.budgetItemsList,
        desc: 'รวมรายการค่าใช้จ่ายทุกข้อ พร้อมเลขข้อ แท็บระยะ และสูตรคำนวณวงเล็บ วาง Tag เดียวจบ'
      },
      {
        category: 'งบประมาณ (วนลูปใน Word)',
        tag: '{{#budgetItems}}...{{/budgetItems}}',
        thaiTag: '{{#งบประมาณ}}...{{/งบประมาณ}}',
        label: 'การวนลูปรายการงบประมาณ',
        currentValue: `${data.budgetItems.length} รายการ`,
        desc: 'ใช้ครอบแถวใน Word: {{#budgetItems}} {{itemNo}}. {{itemName}} {{itemTotal}} บาท (เคาะแท็บ) {{itemCalc}} {{/budgetItems}}'
      },
      {
        category: 'งบประมาณ (วนลูปใน Word)',
        tag: '{{itemNo}}',
        thaiTag: '{{ลำดับ}}',
        label: 'ลำดับรายการงบประมาณ',
        currentValue: '1, 2, ...',
        desc: 'ลำดับที่ของรายการค่าใช้จ่าย (ใช้ภายในลูป budgetItems)'
      },
      {
        category: 'งบประมาณ (วนลูปใน Word)',
        tag: '{{itemName}}',
        thaiTag: '{{รายการ}}',
        label: 'ชื่อรายการค่าใช้จ่าย',
        currentValue: data.budgetItems[0]?.itemName || 'ค่าอาหารว่าง...',
        desc: 'ชื่อรายการค่าใช้จ่าย (ใช้ภายในลูป budgetItems)'
      },
      {
        category: 'งบประมาณ (วนลูปใน Word)',
        tag: '{{itemTotal}}',
        thaiTag: '{{จำนวนเงิน}}',
        label: 'ยอดเงินของรายการ',
        currentValue: data.budgetItems[0]?.itemTotal || '440',
        desc: 'จำนวนเงินรวมของรายการนั้นๆ มีคอมม่า (ใช้ภายในลูป budgetItems)'
      },
      {
        category: 'งบประมาณ (วนลูปใน Word)',
        tag: '{{itemCalc}}',
        thaiTag: '{{สูตรคำนวณ}}',
        label: 'สูตรการคำนวณในวงเล็บ',
        currentValue: data.budgetItems[0]?.itemCalc || '(11 คน x 1 มื้อ x 40 บาท)',
        desc: 'ข้อความสูตรคำนวณ เช่น (11 คน x 1 มื้อ x 40 บาท) (ใช้ภายในลูป budgetItems)'
      },
      {
        category: 'วันที่เอกสารราชการ',
        tag: '{{docDate}}',
        thaiTag: '{{วันที่เอกสาร}}',
        label: 'วันที่เอกสารราชการ',
        currentValue: data.docDate,
        desc: 'วันที่ปัจจุบันในรูปแบบไทย เช่น 11 มีนาคม 2569'
      }
    ];
  },

  /**
   * โหลดไฟล์แม่แบบ ArrayBuffer จาก URL หรือ File Object
   */
  async loadTemplateArrayBuffer(templateSource) {
    if (typeof templateSource === 'string') {
      let response = await fetch(templateSource);
      if (!response.ok) {
        // Fallback: หากขึ้นต้นด้วย / ให้ลองเอา / ออก หรือเติม ./
        const alternatives = [];
        if (templateSource.startsWith('/')) {
          alternatives.push('.' + templateSource);
          alternatives.push(templateSource.slice(1));
        } else {
          alternatives.push('/' + templateSource);
          alternatives.push('./' + templateSource);
        }
        for (const alt of alternatives) {
          try {
            const altRes = await fetch(alt);
            if (altRes.ok) {
              response = altRes;
              break;
            }
          } catch {}
        }
      }
      if (!response.ok) {
        throw new Error(`ไม่สามารถโหลดไฟล์แม่แบบจาก "${templateSource}" ได้ (HTTP ${response.status})`);
      }
      return await response.arrayBuffer();
    } else if (templateSource instanceof Blob || templateSource instanceof File) {
      return await templateSource.arrayBuffer();
    } else if (templateSource instanceof ArrayBuffer) {
      return templateSource;
    } else if (ArrayBuffer.isView(templateSource)) {
      return templateSource.buffer.slice(templateSource.byteOffset, templateSource.byteOffset + templateSource.byteLength);
    }
    throw new Error('รูปแบบไฟล์แม่แบบไม่ถูกต้อง');
  },

  /**
   * ประมวลผลและสร้างเอกสาร Word (.docx) จากแม่แบบและข้อมูลฟอร์ม
   */
  async generateWordDocument(templateSource, formData) {
    const arrayBuffer = await this.loadTemplateArrayBuffer(templateSource);
    const zip = new PizZip(arrayBuffer);

    // ปรับปรุง XML ให้รองรับทั้งแท็กเดี่ยว {#tag} และแท็กคู่ {{#tag}} รวมถึงตารางที่ถูกตัด runs ใน Word
    try {
      const docXml = zip.file('word/document.xml');
      if (docXml) {
        let content = docXml.asText();
        
        // 1. จัดการช่องตาราง (Table Cells: <w:tc>) ที่มีแท็กวงเล็บเดี่ยว เช่น {#timeSlots}{slotNo}, {time}, {detail}, {expenseCategory}{/timeSlots}
        content = content.replace(/<w:tc\b[\s\S]*?<\/w:tc>/g, (tcXml) => {
          if (tcXml.includes('{') && !tcXml.includes('{{')) {
            let allText = '';
            const tRegex = /<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g;
            let m;
            while ((m = tRegex.exec(tcXml)) !== null) {
              allText += m[1];
            }
            const converted = allText
              .replace(/\{#([a-zA-Z0-9_\u0E00-\u0E7F]+)\}/g, '{{#$1}}')
              .replace(/\{\/([a-zA-Z0-9_\u0E00-\u0E7F]+)\}/g, '{{/$1}}')
              .replace(/\{([a-zA-Z0-9_\u0E00-\u0E7F]+)\}/g, '{{$1}}');
            
            let first = true;
            return tcXml.replace(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g, () => {
              if (first) {
                first = false;
                return `<w:t xml:space="preserve">${converted}</w:t>`;
              }
              return '<w:t></w:t>';
            });
          }
          return tcXml;
        });

        // 2. แปลง loop tags ทั่วไปที่เขียน {#tag} ให้เป็น {{#tag}} และ {/tag} ให้เป็น {{/tag}}
        content = content
          .replace(/(?<!\{)\{#([a-zA-Z0-9_\u0E00-\u0E7F]+)\}(?!\})/g, '{{#$1}}')
          .replace(/(?<!\{)\{\/([a-zA-Z0-9_\u0E00-\u0E7F]+)\}(?!\})/g, '{{/$1}}')
          .replace(/(?<!\{)\{(itemNo|itemName|itemTotal|itemTotalInt|itemCalc|slotNo|time|detail|expenseCategory|ลำดับ|รายการ|จำนวนเงิน|สูตรคำนวณ)\}(?!\})/g, '{{$1}}');

        zip.file('word/document.xml', content);
      }
    } catch (e) {
      console.warn('Word XML tag normalization skipped:', e);
    }

    // สร้าง Docxtemplater โดยกำหนด Delimiters ให้ตรงกับ {{ และ }}
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: '{{', end: '}}' }
    });

    const mappedData = this.mapFormDataToWordPlaceholders(formData);

    try {
      doc.render(mappedData);
    } catch (error) {
      console.error('Docxtemplater render error:', error);
      throw error;
    }

    const outputBlob = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    return outputBlob;
  },

  /**
   * สั่งดาวน์โหลดไฟล์ Blob ลงเครื่องคอมพิวเตอร์
   */
  downloadBlob(blob, filename = 'เอกสารราชการ.docx') {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  }
};
