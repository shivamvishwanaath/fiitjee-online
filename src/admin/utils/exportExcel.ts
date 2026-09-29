import * as XLSX from 'xlsx';
import { ExamRegistration } from '../../types';
import { generateSID } from './centreUtils';

export function exportToCSV(registrations: ExamRegistration[], filename = 'FIITJEE_Registrations') {
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
      'Fee Amount (INR)': reg.paymentAmount ?? 200,
      'Payment Mode': reg.paymentMode || 'Counter Cash / UPI',
      'Payment Status': reg.paymentStatus || 'Paid',
      'Payment Ref / Txn': reg.paymentRef || (reg as any).transactionId || '',
      'Candidate Status': reg.status || 'New',
      'Profile Status': reg.profileStatus || 'Updated',
      'Registration Date': reg.registeredAt,
      'Registered By': reg.registeredByCentre || 'Online Self Portal',
      'Invoice No': reg.invoiceNo || '',
      'Notes': (reg.notes || []).map(n => `[${n.addedBy}]: ${n.text}`).join(' | ')
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

  // Add UTF-8 BOM so Excel opens CSV with correct encoding
  const blob = new Blob(['\uFEFF' + csvOutput], { type: 'text/csv;charset=utf-8;' });
  const cleanFilename = filename.replace(/\.(xlsx|csv)$/i, '');
  const finalFilename = `${cleanFilename}.csv`;

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', finalFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Keep exportToExcel as an alias pointing to exportToCSV
export const exportToExcel = exportToCSV;
