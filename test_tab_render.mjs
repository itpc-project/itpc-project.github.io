import fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

const buffer = fs.readFileSync('d:/pre_generator/Doc/Request_Student_Field_Trip.docx');

// Case A: With double brackets {{#budgetItems}} and {{/budgetItems}}
const contentA = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>
  <w:p><w:r><w:t>{{#budgetItems}}</w:t></w:r></w:p>
  <w:p><w:r><w:t>{{itemNo}}. {{itemName}}</w:t><w:tab/><w:t>{{itemTotal}} บาท</w:t></w:r></w:p>
  <w:p><w:r><w:t>   {{itemCalc}}</w:t></w:r></w:p>
  <w:p><w:r><w:t>{{/budgetItems}}</w:t></w:r></w:p>
  <w:p><w:r><w:t>รวมเป็นเงิน {{budgetTotalInt}} บาท</w:t></w:r></w:p>
</w:body>
</w:document>`;

const testZipA = new PizZip(buffer);
testZipA.file('word/document.xml', contentA);

const docA = new Docxtemplater(testZipA, {
  paragraphLoop: true,
  linebreaks: true,
  delimiters: { start: '{{', end: '}}' }
});

docA.render({
  budgetItems: [
    { itemNo: 1, itemName: 'ค่าอาหารว่างและเครื่องดื่ม สำหรับอาจารย์และเจ้าหน้าที่', itemTotal: '440', itemCalc: '(11 คน x 1 มื้อ x 40 บาท)' },
    { itemNo: 2, itemName: 'ค่าจ้างเหมารถตู้พร้อมคนขับและน้ำมันเชื้อเพลิง', itemTotal: '19,800', itemCalc: '(11 คัน x 1 วัน x 1,800 บาท)' }
  ],
  budgetTotalInt: '20,240'
});

console.log('Result XML for Case A:');
console.log(docA.getZip().file('word/document.xml').asText());
