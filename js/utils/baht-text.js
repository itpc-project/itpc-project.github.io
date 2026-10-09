/**
 * THAI BAHT TEXT CONVERTER
 * แปลงจำนวนเงินตัวเลขเป็นตัวอักษรภาษาไทย (เช่น 65000 -> หกหมื่นห้าพันบาทถ้วน)
 * ตรงตามรูปแบบใน Excel_example.xlsx แถวที่ 54
 */

const DIGITS = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
const POSITIONS = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

export function formatBahtText(amount) {
  if (amount === 0 || amount === '0' || !amount) {
    return 'ศูนย์บาทถ้วน';
  }

  const num = Math.abs(Number(amount));
  if (isNaN(num)) return 'ศูนย์บาทถ้วน';

  const parts = num.toFixed(2).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  let result = convertGroup(integerPart) + 'บาท';

  if (decimalPart === '00') {
    result += 'ถ้วน';
  } else {
    result += convertGroup(decimalPart) + 'สตางค์';
  }

  return result;
}

function convertGroup(numStr) {
  let result = '';
  const len = numStr.length;

  for (let i = 0; i < len; i++) {
    const digit = parseInt(numStr.charAt(i), 10);
    const pos = len - i - 1;

    if (digit !== 0) {
      if (pos % 6 === 1 && digit === 1) {
        // หลักสิบ ถ้าเป็น 1 ไม่ต้องอ่าน "หนึ่ง"
        result += '';
      } else if (pos % 6 === 1 && digit === 2) {
        // หลักสิบ ถ้าเป็น 2 ให้อ่าน "ยี่"
        result += 'ยี่';
      } else if (pos % 6 === 0 && digit === 1 && len > 1 && i === len - 1 && numStr.charAt(i - 1) !== '0') {
        // หลักหน่วย ถ้าลงท้ายด้วย 1 และไม่ใช่เลขหลักเดียว ให้อ่าน "เอ็ด"
        result += 'เอ็ด';
      } else {
        result += DIGITS[digit];
      }
      result += POSITIONS[pos % 6];
    }

    if (pos > 0 && pos % 6 === 0) {
      result += 'ล้าน';
    }
  }

  return result;
}
