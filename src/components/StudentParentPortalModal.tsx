import React, { useState } from 'react';
import { 
  X, 
  UserCheck, 
  BookOpen, 
  BarChart2, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  GraduationCap, 
  Award, 
  FileText,
  Video
} from 'lucide-react';

interface StudentParentPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentParentPortalModal: React.FC<StudentParentPortalModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'attendance' | 'doubts'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6 animate-in fade-in">
        
        {/* Header */}
        <div className="bg-[#002147] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#ED1C24]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ED1C24] text-white rounded-xl flex items-center justify-center font-bold text-sm shadow">
              myPAT
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">FIITJEE Student & Parent Dashboard</div>
              <h2 className="text-base font-extrabold text-white">Aryan Sharma • Roll No: FJ2026-PIN9012</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Student Bio Card */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Enrolled Batch: </span>
            <strong className="text-[#002147] font-bold">PINNACLE - Two Year Integrated (South Delhi HQ)</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Academic Year: </span>
            <span className="bg-red-100 text-[#ED1C24] font-black px-2 py-0.5 rounded text-[11px]">Class XI (2026-27)</span>
          </div>
        </div>

        {/* Portal Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#ED1C24] text-[#ED1C24]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview & AI²TS Rank
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'tests'
                ? 'border-[#ED1C24] text-[#ED1C24]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Test Performance & Heatmap
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'attendance'
                ? 'border-[#ED1C24] text-[#ED1C24]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Attendance & CPP Submissions
          </button>
        </div>

        {/* Portal Body */}
        <div className="p-6 space-y-6">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">National Percentile</div>
              <div className="text-2xl font-black text-[#ED1C24] font-display">99.4%ile</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Top 150 All India</div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Class Attendance</div>
              <div className="text-2xl font-black text-[#002147] font-display">94.8%</div>
              <div className="text-[10px] text-slate-500 font-semibold mt-0.5">72 / 76 Lectures</div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">CPP Homework</div>
              <div className="text-2xl font-black text-[#002147] font-display">24 / 26</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">92% Completion</div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Doubt Sessions</div>
              <div className="text-2xl font-black text-[#002147] font-display">18 Solved</div>
              <div className="text-[10px] text-slate-500 font-semibold mt-0.5">By FIITJEE HODs</div>
            </div>
          </div>

          {/* Subject-Wise Mastery Bars */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-xs font-bold text-[#002147] uppercase tracking-wider">
              Subject Accuracy & Mastery (Recent Phase Test):
            </div>
            
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Mathematics (Calculus & Coordinate Geometry)</span>
                  <span className="text-[#ED1C24]">98% (AIR 48 Equivalent)</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#ED1C24] rounded-full" style={{ width: '98%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Physics (Rotational Dynamics & Thermodynamics)</span>
                  <span className="text-emerald-700">94% (AIR 85 Equivalent)</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '94%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Chemistry (Coordination & Organic Reaction Mechanisms)</span>
                  <span className="text-amber-700">90% (AIR 140 Equivalent)</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '90%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Schedule / Alert */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <Calendar className="w-5 h-5 text-[#ED1C24] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-800">
              <div className="font-extrabold text-sm text-[#ED1C24]">Next All India Test: AI²TS Phase-3 Mock Exam</div>
              <div className="mt-0.5">Sunday, 10:00 AM - 01:00 PM (Paper 1) & 02:30 PM - 05:30 PM (Paper 2)</div>
              <div className="mt-1 text-[11px] text-slate-600">Syllabus: Complete Mechanics, Electrodynamics & Physical Chemistry.</div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#002147] hover:bg-[#001733] text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            Close Dashboard Demo
          </button>
        </div>

      </div>
    </div>
  );
};
