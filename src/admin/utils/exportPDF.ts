import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ExamRegistration } from '../../types';

export function exportToPDF(
  registrations: ExamRegistration[],
  filename = 'FIITJEE_Registrations_Roster',
  title = 'FIITJEE ADMISSION & DIAGNOSTIC EXAM ROSTER',
  centreName = 'All Centres'
) {
  if (!registrations || registrations.length === 0) {
    alert('No registrations available to export.');
    return;
  }

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Header branding
  doc.setFillColor(0, 33, 71); // #002147 navy
  doc.rect(0, 0, 297, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TRANSED LLP (FIITJEE ADMISSIONS)', 14, 10);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 14, 16);

  doc.setFontSize(8);
  doc.text(`Centre: ${centreName} | Total Records: ${registrations.length} | Export Date: ${new Date().toLocaleDateString('en-GB')}`, 14, 21);

  // Table Columns
  const tableColumn = [
    'S.No.',
    'Roll No.',
    'Student Name',
    'Parent Name',
    'Class',
    'Phone',
    'Mode',
    'Test Date',
    'Centre',
    'Status',
    'Verified'
  ];

  // Table Rows
  const tableRows = registrations.map((reg, index) => [
    index + 1,
    reg.rollNo,
    reg.studentName.toUpperCase(),
    reg.parentName || '-',
    reg.currentClass,
    reg.phone,
    reg.testMode === 'Offline' ? 'Offline' : 'Online',
    reg.testDate,
    reg.selectedCenter || centreName,
    reg.status || 'New',
    '[   ]' // Verification / signature box
  ]);

  autoTable(doc, {
    startY: 28,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [237, 28, 36], // #ED1C24 red
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center'
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 32, fontStyle: 'bold' },
      2: { cellWidth: 40, fontStyle: 'bold' },
      3: { cellWidth: 32 },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 26, halign: 'center' },
      6: { cellWidth: 20, halign: 'center' },
      7: { cellWidth: 26, halign: 'center' },
      8: { cellWidth: 30 },
      9: { cellWidth: 20, halign: 'center' },
      10: { cellWidth: 16, halign: 'center' }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 10, right: 10 }
  });

  const finalFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  doc.save(finalFilename);
}
