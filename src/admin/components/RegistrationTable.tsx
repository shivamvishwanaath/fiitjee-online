import React, { useState } from 'react';
import { 
  Printer, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  ChevronRight, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  CheckSquare,
  Square,
  Clock
} from 'lucide-react';
import { ExamRegistration } from '../../types';
import { StatusBadge } from './StatusBadge';
import { generateSID } from '../utils/centreUtils';

interface RegistrationTableProps {
  registrations: ExamRegistration[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  onStatusChange: (id: string, status: ExamRegistration['status']) => void;
  onDelete: (id: string) => void;
  onEdit: (rollNo: string) => void;
  onPrintHallTicket: (reg: ExamRegistration) => void;
  duplicatePhoneSet: Set<string>;
  duplicateEmailSet: Set<string>;
}

export const RegistrationTable: React.FC<RegistrationTableProps> = ({
  registrations,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onStatusChange,
  onDelete,
  onEdit,
  onPrintHallTicket,
  duplicatePhoneSet,
  duplicateEmailSet
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const allSelected = registrations.length > 0 && selectedIds.length === registrations.length;

  const handleSelectAll = () => {
    onSelectAll(!allSelected);
  };

  if (registrations.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-800 text-sm">No Registrations Found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No student applications match the current filter criteria. Try resetting filters or adding a new student.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="p-3.5 w-10 text-center">
                <button
                  onClick={handleSelectAll}
                  className="text-slate-400 hover:text-[#002147] transition-colors cursor-pointer"
                >
                  {allSelected ? (
                    <CheckSquare className="w-4 h-4 text-[#ED1C24]" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="p-3.5">Roll No. / SID</th>
              <th className="p-3.5">Student & Parent</th>
              <th className="p-3.5">Class</th>
              <th className="p-3.5">Contact</th>
              <th className="p-3.5">Centre & Mode</th>
              <th className="p-3.5">Test Date</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {registrations.map((reg) => {
              const regId = reg.rollNo || reg.id || '';
              const isSelected = selectedIds.includes(regId);
              const cleanPhone = (reg.phone || '').replace(/\D/g, '');
              const cleanEmail = (reg.email || '').toLowerCase().trim();
              const isDupPhone = duplicatePhoneSet.has(cleanPhone);
              const isDupEmail = duplicateEmailSet.has(cleanEmail);
              const isConfirmingDelete = deleteConfirmId === regId;

              return (
                <tr 
                  key={regId}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isSelected ? 'bg-red-50/40' : ''
                  } ${isConfirmingDelete ? 'bg-amber-50' : ''}`}
                >
                  {/* Select Checkbox */}
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => onToggleSelect(regId)}
                      className="text-slate-400 hover:text-[#002147] transition-colors cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#ED1C24]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>

                  {/* Roll No & SID */}
                  <td className="p-3.5">
                    <div className="font-mono font-bold text-slate-900 tracking-tight">{reg.rollNo}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      SID: {reg.sid || generateSID(reg.rollNo)}
                    </div>
                  </td>

                  {/* Student & Parent Name */}
                  <td className="p-3.5">
                    <div className="font-bold text-[#002147] uppercase">{reg.studentName}</div>
                    {reg.parentName && (
                      <div className="text-[11px] text-slate-500 font-medium">S/O, D/O: {reg.parentName}</div>
                    )}
                    {reg.schoolName && (
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{reg.schoolName}</div>
                    )}
                  </td>

                  {/* Class */}
                  <td className="p-3.5">
                    <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {reg.currentClass}
                    </span>
                  </td>

                  {/* Contact Info */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-1 font-mono text-slate-700">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{reg.phone}</span>
                      {isDupPhone && (
                        <span 
                          title="Phone number registered multiple times!"
                          className="text-amber-600 bg-amber-100 px-1 rounded text-[9px] font-bold flex items-center gap-0.5"
                        >
                          <AlertTriangle className="w-2.5 h-2.5" /> Dup
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[140px]">{reg.email}</span>
                      {isDupEmail && (
                        <span 
                          title="Email registered multiple times!"
                          className="text-amber-600 bg-amber-100 px-1 rounded text-[9px] font-bold"
                        >
                          Dup
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Centre & Mode */}
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-800 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{reg.selectedCenter || 'Centre Not Set'}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {reg.testMode === 'Offline' ? (
                        <span className="text-blue-700 font-medium">Offline Physical</span>
                      ) : (
                        <span className="text-purple-700 font-medium">Proctored Online</span>
                      )}
                    </div>
                  </td>

                  {/* Test Date */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-1 font-medium text-slate-700">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{reg.testDate ? reg.testDate.replace(' (Sunday)', '') : '11th Oct 2026'}</span>
                    </div>
                    {reg.registeredAt && (
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {reg.registeredAt.split('T')[0]}
                      </div>
                    )}
                  </td>

                  {/* Status Dropdown */}
                  <td className="p-3.5">
                    <select
                      value={reg.status || 'New'}
                      onChange={(e) => onStatusChange(regId, e.target.value as any)}
                      className="text-xs py-1 px-2 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#002147] cursor-pointer"
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Selected">Selected</option>
                      <option value="Absent">Absent</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="p-3.5 text-right">
                    {isConfirmingDelete ? (
                      <div className="flex items-center justify-end gap-1.5 animate-in fade-in duration-200">
                        <span className="text-[10px] text-red-600 font-bold">Confirm?</span>
                        <button
                          onClick={() => {
                            onDelete(regId);
                            setDeleteConfirmId(null);
                          }}
                          className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-bold hover:bg-red-700 cursor-pointer"
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold hover:bg-slate-300 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        {/* Print Official Hall Ticket */}
                        <button
                          onClick={() => onPrintHallTicket(reg)}
                          className="p-1.5 text-[#002147] hover:bg-[#002147]/10 rounded-lg transition-colors cursor-pointer"
                          title="Generate & Print 1:1 Official Hall Ticket"
                        >
                          <Printer className="w-4 h-4 text-[#ED1C24]" />
                        </button>

                        {/* Edit Record */}
                        <button
                          onClick={() => onEdit(reg.rollNo)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Student Details & View Notes"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Registration */}
                        <button
                          onClick={() => setDeleteConfirmId(regId)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Registration"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
