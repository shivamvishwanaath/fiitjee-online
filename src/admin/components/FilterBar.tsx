import React from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';
import { ALL_CENTRES } from '../utils/centreUtils';

export interface FilterState {
  search: string;
  mode: string;
  status: string;
  testDate: string;
  classGrade: string;
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onReset: () => void;
  totalFiltered: number;
  totalRegistrations: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalFiltered,
  totalRegistrations
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student, roll no, phone, email, school..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-transparent"
          />
        </div>

        {/* Results Counter & Reset */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end text-xs">
          <span className="text-slate-500 font-medium">
            Showing <strong className="text-[#002147] font-mono">{totalFiltered}</strong> of {totalRegistrations} candidates
          </span>
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-slate-500 hover:text-[#ED1C24] font-semibold text-xs transition-colors cursor-pointer px-2 py-1 rounded hover:bg-slate-100"
            title="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Dropdown Filters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">

        {/* Mode Dropdown */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Test Mode</label>
          <select
            value={filters.mode}
            onChange={(e) => onFilterChange('mode', e.target.value)}
            className="w-full text-xs py-1.5 px-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#002147]"
          >
            <option value="All">All Modes</option>
            <option value="Offline">Offline Classroom</option>
            <option value="Proctored Online">Proctored Online</option>
          </select>
        </div>

        {/* Status Dropdown */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full text-xs py-1.5 px-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#002147]"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Selected">Selected</option>
            <option value="Absent">Absent</option>
          </select>
        </div>

        {/* Test Date Dropdown */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Test Date</label>
          <select
            value={filters.testDate}
            onChange={(e) => onFilterChange('testDate', e.target.value)}
            className="w-full text-xs py-1.5 px-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#002147]"
          >
            <option value="All">All Test Dates</option>
            <option value="11th October 2026 (Sunday)">11th October 2026</option>
            <option value="18th October 2026 (Sunday)">18th October 2026</option>
          </select>
        </div>

        {/* Class Dropdown */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Class</label>
          <select
            value={filters.classGrade}
            onChange={(e) => onFilterChange('classGrade', e.target.value)}
            className="w-full text-xs py-1.5 px-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#002147]"
          >
            <option value="All">All Classes</option>
            <option value="Class V">Class V</option>
            <option value="Class VI">Class VI</option>
            <option value="Class VII">Class VII</option>
            <option value="Class VIII">Class VIII</option>
            <option value="Class IX">Class IX</option>
            <option value="Class X">Class X</option>
            <option value="Class XI">Class XI</option>
            <option value="Class XII">Class XII</option>
          </select>
        </div>
      </div>
    </div>
  );
};
