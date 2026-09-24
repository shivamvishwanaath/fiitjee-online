import React from 'react';
import { FileSpreadsheet, FileText, Download } from 'lucide-react';
import { ExamRegistration } from '../../types';
import { exportToExcel } from '../utils/exportExcel';
import { exportToPDF } from '../utils/exportPDF';

interface ExportButtonsProps {
  allRegistrations: ExamRegistration[];
  selectedRegistrations: ExamRegistration[];
  centreName?: string;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  allRegistrations,
  selectedRegistrations,
  centreName = 'All Centres'
}) => {
  const isSelective = selectedRegistrations.length > 0;
  const targetData = isSelective ? selectedRegistrations : allRegistrations;
  const labelSuffix = isSelective ? `(${selectedRegistrations.length} Selected)` : `All (${allRegistrations.length})`;

  const handleExcelExport = () => {
    const filename = `FIITJEE_${centreName.replace(/\s+/g, '_')}_Registrations_${new Date().toISOString().split('T')[0]}`;
    exportToExcel(targetData, filename);
  };

  const handlePDFExport = () => {
    const filename = `FIITJEE_${centreName.replace(/\s+/g, '_')}_Roster_${new Date().toISOString().split('T')[0]}`;
    exportToPDF(
      targetData,
      filename,
      `FIITJEE BIG BANG EDGE TEST 2026 - CANDIDATE ROSTER`,
      centreName
    );
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={handleExcelExport}
        disabled={targetData.length === 0}
        className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
        title="Download spreadsheet in Excel (.xlsx) format"
      >
        <FileSpreadsheet className="w-4 h-4" />
        <span>Export Excel {labelSuffix}</span>
      </button>

      <button
        onClick={handlePDFExport}
        disabled={targetData.length === 0}
        className="bg-[#002147] hover:bg-[#001733] disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
        title="Download printable PDF candidate roster"
      >
        <FileText className="w-4 h-4 text-amber-400" />
        <span>Export PDF {labelSuffix}</span>
      </button>
    </div>
  );
};
