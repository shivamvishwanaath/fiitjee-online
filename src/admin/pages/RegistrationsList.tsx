import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  X,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useRegistrations } from '../hooks/useRegistrations';
import { FilterBar, FilterState } from '../components/FilterBar';
import { RegistrationTable } from '../components/RegistrationTable';
import { ExportButtons } from '../components/ExportButtons';
import { HallTicketModal } from '../../components/HallTicketModal';
import { ExamRegistration } from '../../types';

export const RegistrationsList: React.FC = () => {
  const navigate = useNavigate();
  const { centre, user } = useAdminAuth();
  const { 
    registrations, 
    loading, 
    updateStatus, 
    deleteRegistration,
    duplicatePhoneSet, 
    duplicateEmailSet 
  } = useRegistrations(centre?.name, user?.email || undefined);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    mode: 'All',
    status: 'All',
    testDate: 'All',
    classGrade: 'All'
  });

  // Selected for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTicketReg, setActiveTicketReg] = useState<ExamRegistration | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 20;

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      mode: 'All',
      status: 'All',
      testDate: 'All',
      classGrade: 'All'
    });
    setCurrentPage(1);
  };

  // Filtered dataset
  const filteredData = useMemo(() => {
    return registrations.filter(r => {
      // Search
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matchesName = (r.studentName || '').toLowerCase().includes(q);
        const matchesRoll = (r.rollNo || '').toLowerCase().includes(q);
        const matchesPhone = (r.phone || '').includes(q);
        const matchesEmail = (r.email || '').toLowerCase().includes(q);
        const matchesSchool = (r.schoolName || '').toLowerCase().includes(q);
        if (!matchesName && !matchesRoll && !matchesPhone && !matchesEmail && !matchesSchool) {
          return false;
        }
      }

      // Mode
      if (filters.mode !== 'All') {
        if (r.testMode !== filters.mode) return false;
      }

      // Status
      if (filters.status !== 'All') {
        if ((r.status || 'New') !== filters.status) return false;
      }

      // Test Date
      if (filters.testDate !== 'All') {
        if (r.testDate !== filters.testDate) return false;
      }

      // Class
      if (filters.classGrade !== 'All') {
        if (r.currentClass !== filters.classGrade) return false;
      }

      return true;
    });
  }, [registrations, filters]);

  // Paginated dataset
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Selected Objects
  const selectedRegistrations = useMemo(() => {
    return registrations.filter(r => selectedIds.includes(r.rollNo || r.id || ''));
  }, [registrations, selectedIds]);

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredData.map(r => r.rollNo || r.id || ''));
    } else {
      setSelectedIds([]);
    }
  };

  // Bulk Actions
  const handleBulkStatus = async (newStatus: ExamRegistration['status']) => {
    for (const id of selectedIds) {
      await updateStatus(id, newStatus);
    }
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete ${selectedIds.length} student registrations?`)) {
      return;
    }
    for (const id of selectedIds) {
      await deleteRegistration(id);
    }
    setSelectedIds([]);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* Top Header & Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#002147] uppercase tracking-tight font-display">
            Student Admissions & Hall Tickets
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage registrations, update candidate statuses, and generate official FIITJEE hall tickets
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <ExportButtons
            allRegistrations={filteredData}
            selectedRegistrations={selectedRegistrations}
            centreName={centre?.name || 'FIITJEE'}
          />

          <button
            onClick={() => navigate('/admin/registrations/add')}
            className="bg-[#ED1C24] hover:bg-[#c9141b] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        totalFiltered={filteredData.length}
        totalRegistrations={registrations.length}
      />

      {/* Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-[#002147] text-white p-3 rounded-xl shadow-md flex items-center justify-between flex-wrap gap-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-[#ED1C24] px-2 py-0.5 rounded font-black font-mono">{selectedIds.length}</span>
            <span className="font-semibold">candidates selected</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400 text-[11px] hidden sm:inline">Set Status:</span>
            <button
              onClick={() => handleBulkStatus('Confirmed')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-colors"
            >
              Confirmed
            </button>
            <button
              onClick={() => handleBulkStatus('Contacted')}
              className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-colors"
            >
              Contacted
            </button>
            <button
              onClick={() => handleBulkStatus('Absent')}
              className="bg-slate-700 hover:bg-slate-800 text-white px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-colors"
            >
              Absent
            </button>
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded text-xs font-bold cursor-pointer flex items-center gap-1 transition-colors ml-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Registrations Grid */}
      <RegistrationTable
        registrations={paginatedData}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
        onStatusChange={updateStatus}
        onDelete={deleteRegistration}
        onEdit={(rollNo) => navigate(`/admin/registrations/${rollNo}`)}
        onPrintHallTicket={(reg) => setActiveTicketReg(reg)}
        duplicatePhoneSet={duplicatePhoneSet}
        duplicateEmailSet={duplicateEmailSet}
      />

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
          <span className="text-slate-500">
            Page <strong className="text-slate-800">{currentPage}</strong> of {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer font-bold"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-7 h-7 rounded text-xs font-bold cursor-pointer ${
                  currentPage === i + 1 
                    ? 'bg-[#002147] text-white' 
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer font-bold"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* 1:1 Official Hall Ticket & Tax Invoice Preview Modal */}
      <HallTicketModal
        isOpen={!!activeTicketReg}
        onClose={() => setActiveTicketReg(null)}
        registration={activeTicketReg}
      />
    </div>
  );
};
