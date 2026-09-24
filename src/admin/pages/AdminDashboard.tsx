import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Building2, 
  Laptop, 
  UserPlus, 
  FileSpreadsheet, 
  ArrowRight,
  Printer,
  Sparkles,
  PhoneCall,
  Clock
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useRegistrations } from '../hooks/useRegistrations';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { HallTicketModal } from '../../components/HallTicketModal';
import { exportToExcel } from '../utils/exportExcel';
import { ExamRegistration } from '../../types';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { centre, user } = useAdminAuth();
  const { registrations, loading, updateStatus } = useRegistrations(centre?.name, user?.email || undefined);

  const [selectedTicketReg, setSelectedTicketReg] = useState<ExamRegistration | null>(null);

  // Statistics calculation for authenticated centre
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    let todayCount = 0;
    let confirmedCount = 0;
    let offlineCount = 0;
    let onlineCount = 0;

    registrations.forEach(r => {
      if (r.registeredAt && r.registeredAt.startsWith(todayStr)) {
        todayCount++;
      }
      if (r.status === 'Confirmed') {
        confirmedCount++;
      }
      if (r.testMode === 'Offline') {
        offlineCount++;
      } else {
        onlineCount++;
      }
    });

    return {
      total: registrations.length,
      today: todayCount,
      confirmed: confirmedCount,
      offline: offlineCount,
      online: onlineCount
    };
  }, [registrations]);

  // Recent 8 registrations
  const recentRegistrations = registrations.slice(0, 8);

  const handleExportQuickExcel = () => {
    exportToExcel(registrations, `FIITJEE_${(centre?.name || 'Centre').replace(/\s+/g, '_')}_Overview`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Centre Welcome & Scope Badge */}
      <div className="bg-[#002147] text-white p-6 rounded-2xl shadow-md border-b-4 border-[#ED1C24] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-[#ED1C24] text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
              Centre Data Vault
            </span>
            <span className="text-amber-400 font-mono text-xs font-bold">{centre?.code}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-display uppercase tracking-tight">
            {centre?.name} Centre Portal
          </h1>
          <p className="text-xs text-slate-300">
            GSTIN: <span className="font-mono text-amber-300">{centre?.gstin}</span> | POS: {centre?.stateName} {centre?.stateCode}
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <button
            onClick={() => navigate('/admin/registrations/add')}
            className="px-4 py-2 bg-[#ED1C24] hover:bg-[#c9141b] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Candidate</span>
          </button>
          <button
            onClick={handleExportQuickExcel}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <StatCard
          label="Total Registered"
          value={loading ? '...' : stats.total}
          icon={<Users className="w-5 h-5 text-blue-600" />}
          color="blue"
          subtext={`Enrolled at ${centre?.name || 'Centre'}`}
          onClick={() => navigate('/admin/registrations')}
        />
        <StatCard
          label="New Leads Today"
          value={loading ? '...' : stats.today}
          icon={<Sparkles className="w-5 h-5 text-red-600" />}
          color="red"
          subtext="Registered in last 24h"
          onClick={() => navigate('/admin/registrations')}
        />
        <StatCard
          label="Confirmed Seats"
          value={loading ? '...' : stats.confirmed}
          icon={<UserCheck className="w-5 h-5 text-emerald-600" />}
          color="emerald"
          subtext="Verified applications"
          onClick={() => navigate('/admin/registrations')}
        />
        <StatCard
          label="Offline Classroom"
          value={loading ? '...' : stats.offline}
          icon={<Building2 className="w-5 h-5 text-amber-600" />}
          color="amber"
          subtext="Physical center test"
          onClick={() => navigate('/admin/registrations')}
        />
        <StatCard
          label="Proctored Online"
          value={loading ? '...' : stats.online}
          icon={<Laptop className="w-5 h-5 text-purple-600" />}
          color="purple"
          subtext="At-home test slot"
          onClick={() => navigate('/admin/registrations')}
        />
      </div>

      {/* Quick Action Shortcuts Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/registrations/add')}
            className="bg-[#ED1C24] hover:bg-[#c9141b] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Walk-in Student</span>
          </button>
          <button
            onClick={handleExportQuickExcel}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Excel</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => navigate('/admin/crm')}
            className="text-[#002147] hover:underline font-bold"
          >
            Send Exam Reminders &rarr;
          </button>
          <button
            onClick={() => navigate('/admin/registrations')}
            className="text-[#ED1C24] hover:underline font-bold"
          >
            View All Applications &rarr;
          </button>
        </div>
      </div>

      {/* Recent Admissions Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#002147] uppercase tracking-wide">
              Recent Applications ({centre?.name || 'Centre'})
            </h3>
            <p className="text-[11px] text-slate-500">Latest students registered for Big Bang Edge Test 2026</p>
          </div>
          <button
            onClick={() => navigate('/admin/registrations')}
            className="text-xs font-bold text-[#002147] hover:text-[#ED1C24] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Full Roster</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentRegistrations.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs italic">
            No registrations logged yet for this selection.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="p-3 pl-6">Roll No.</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 pr-6 text-right">Hall Ticket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRegistrations.map((reg) => (
                  <tr key={reg.rollNo} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 pl-6 font-mono font-bold text-slate-900">{reg.rollNo}</td>
                    <td className="p-3 font-bold text-[#002147] uppercase">{reg.studentName}</td>
                    <td className="p-3 font-semibold text-slate-700">{reg.currentClass}</td>
                    <td className="p-3 font-mono text-slate-600">{reg.phone}</td>
                    <td className="p-3">
                      <span className={`font-semibold text-[11px] ${reg.testMode === 'Offline' ? 'text-blue-700' : 'text-purple-700'}`}>
                        {reg.testMode}
                      </span>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={reg.status} />
                    </td>
                    <td className="p-3 pr-6 text-right">
                      <button
                        onClick={() => setSelectedTicketReg(reg)}
                        className="p-1.5 bg-[#ED1C24]/10 hover:bg-[#ED1C24] text-[#ED1C24] hover:text-white rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold"
                        title="Print 1:1 Official Hall Ticket"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Hall Ticket</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Hall Ticket Preview & Print Modal */}
      <HallTicketModal
        isOpen={!!selectedTicketReg}
        onClose={() => setSelectedTicketReg(null)}
        registration={selectedTicketReg}
      />
    </div>
  );
};
