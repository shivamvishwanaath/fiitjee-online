import * as XLSX from 'xlsx';
import { ExamRegistration } from '../../types';
import { generateSID } from './centreUtils';

export function exportToExcel(registrations: ExamRegistration[], filename = 'FIITJEE_Registrations') {
  if (!registrations || registrations.length === 0) {
    alert('No registrations available to export.');
    return;
  }

  const rows = registrations.map((reg, index) => {
    return {
      'S.No.': index + 1,
      'Roll Number': reg.rollNo,
      'SID': reg.sid || generateSID(reg.rollNo),
      'Student Name': reg.studentName,
      'Parent Name': reg.parentName,
      'Class': reg.currentClass,
      'School Name': reg.schoolName,
      'Phone': reg.phone,
      'Email': reg.email,
      'Address': reg.address || '',
      'Test Mode': reg.testMode,
      'Allotted Centre': reg.selectedCenter || 'FIITJEE Centre',
      'Test Date': reg.testDate,
      'Status': reg.status || 'New',
      'Registration Date': reg.registeredAt,
      'Registered By': reg.registeredByCentre || 'Online Self Portal',
      'Invoice No': reg.invoiceNo || '',
      'Notes': (reg.notes || []).map(n => `[${n.addedBy}]: ${n.text}`).join(' | ')
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  const colWidths = [
    { wch: 6 },  // S.No
    { wch: 22 }, // Roll Number
    { wch: 14 }, // SID
    { wch: 22 }, // Student Name
    { wch: 20 }, // Parent Name
    { wch: 12 }, // Class
    { wch: 26 }, // School
    { wch: 14 }, // Phone
    { wch: 24 }, // Email
    { wch: 30 }, // Address
    { wch: 18 }, // Mode
    { wch: 22 }, // Centre
    { wch: 18 }, // Date
    { wch: 12 }, // Status
    { wch: 22 }, // Reg Date
    { wch: 18 }, // Registered By
    { wch: 22 }, // Invoice
    { wch: 40 }  // Notes
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

  const finalFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, finalFilename);
}
