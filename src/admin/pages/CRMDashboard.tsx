import React, { useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Send, 
  Copy, 
  Check, 
  Users, 
  Clock, 
  Sparkles, 
  Building2, 
  PhoneCall, 
  UserCheck, 
  ArrowRight,
  FolderArchive,
  Phone,
  Contact,
  AlertTriangle
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useRegistrations } from '../hooks/useRegistrations';
import { useCRMContacts } from '../hooks/useCRMContacts';
import { CRMSubNav } from '../components/CRMSubNav';

export const CRMDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { centre, user } = useAdminAuth();
  const { registrations, loading } = useRegistrations(centre?.name, user?.email || undefined);
  const { campaigns } = useCRMContacts(centre?.name, user?.email || undefined);

  const [copiedPhones, setCopiedPhones] = useState(false);

  // Registrations are already strictly scoped to current centre by hook
  const scopedRegistrations = registrations;

  // Funnel Breakdown
  const funnel = useMemo(() => {
    const counts = {
      New: 0,
      Contacted: 0,
      Confirmed: 0,
      Selected: 0,
      Absent: 0
    };

    scopedRegistrations.forEach((r) => {
      const status = r.status || 'New';
      if (counts[status] !== undefined) counts[status]++;
    });

    return counts;
  }, [scopedRegistrations]);

  // Follow-ups analysis
  const followUps = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    let overdue = 0;
    let dueToday = 0;
    let upcoming = 0;

    scopedRegistrations.forEach((r) => {
      if (r.followUpDate) {
        const d = r.followUpDate.split('T')[0];
        if (d < todayStr) overdue++;
        else if (d === todayStr) dueToday++;
        else upcoming++;
      }
    });

    return { overdue, dueToday, upcoming, total: overdue + dueToday + upcoming };
  }, [scopedRegistrations]);

  // Copy phone numbers
  const handleCopyAllPhones = () => {
    const phones = scopedRegistrations
      .map((r) => r.phone?.replace(/\D/g, ''))
      .filter(Boolean)
      .join(', ');

    navigator.clipboard.writeText(phones);
    setCopiedPhones(true);
    setTimeout(() => setCopiedPhones(false), 2200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      <CRMSubNav
        title="Admissions CRM & Outreach Command"
        subtitle={`Manage candidate lifecycle, follow-ups, and communication for ${centre?.name || 'All'} Centre.`}
        icon={Mail}
        candidateCount={scopedRegistrations.length}
        overdueCount={followUps.overdue}
        campaignsCount={campaigns.length}
        actions={
          <button
            onClick={handleCopyAllPhones}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
            title="Copy comma-separated phone numbers of all registered candidates"
          >
            {copiedPhones ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Phones Copied ({scopedRegistrations.length})!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy All Candidate Phones ({scopedRegistrations.length})</span>
              </>
            )}
          </button>
        }
      />

      {/* Overdue Follow-ups Notice Banner (if any) */}
      {followUps.overdue > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-red-900 text-xs font-bold">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <span>You have {followUps.overdue} overdue candidate follow-up reminders pending action.</span>
              <span className="block text-[11px] font-normal text-red-700 mt-0.5">Please review counseling callbacks scheduled for past dates.</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/crm/followups')}
            className="px-3.5 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors shrink-0 cursor-pointer"
          >
            View Overdue Tasks
          </button>
        </div>
      )}

      {/* Funnel Pipeline Progress Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-sm font-black text-[#002147] uppercase tracking-wider">Candidate Admission Funnel</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time status breakdown of registrations</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600">Total: {scopedRegistrations.length}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-100">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block">New Leads</span>
            <span className="text-2xl font-black text-blue-900 mt-1 block">{loading ? '...' : funnel.New}</span>
            <span className="text-[10px] text-blue-600/80">Awaiting counselling call</span>
          </div>

          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-100">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block">In Contact</span>
            <span className="text-2xl font-black text-amber-900 mt-1 block">{loading ? '...' : funnel.Contacted}</span>
            <span className="text-[10px] text-amber-700/80">Counselor assigned</span>
          </div>

          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">Confirmed Seats</span>
            <span className="text-2xl font-black text-emerald-900 mt-1 block">{loading ? '...' : funnel.Confirmed}</span>
            <span className="text-[10px] text-emerald-700/80">Hall Ticket verified</span>
          </div>

          <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-100">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block">Admission Selected</span>
            <span className="text-2xl font-black text-purple-900 mt-1 block">{loading ? '...' : funnel.Selected}</span>
            <span className="text-[10px] text-purple-700/80">Scholarship awarded</span>
          </div>
        </div>
      </div>

      {/* Quick Launchpad & Hub Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quick Email Launcher Card */}
        <div className="bg-gradient-to-br from-[#002147] to-slate-900 text-white p-6 rounded-2xl shadow-md border-b-4 border-[#ED1C24] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Send className="w-4 h-4" />
              <span>Mass Email Campaigner</span>
            </div>
            <h3 className="text-lg font-black tracking-tight">
              Broadcast Hall Tickets & OMR Guidelines
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Target all registered candidates or filter by status/exam slot. Uses official pre-formatted FIITJEE examination templates with dynamic placeholder merge.
            </p>
          </div>

          <div className="pt-6">
            <button
              onClick={() => navigate('/admin/crm/compose')}
              className="w-full py-2.5 bg-[#ED1C24] hover:bg-[#c9141b] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <span>Launch Outreach Composer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Follow-up Reminder Hub Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-[#ED1C24] text-xs font-bold uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Scheduled Follow-ups</span>
            </div>
            <h3 className="text-lg font-black text-[#002147] tracking-tight">
              Parent Counseling Reminders
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Keep track of students needing scholarship discussions, syllabus walkthroughs, or hall ticket print assistance.
            </p>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100">
              <div className="text-center">
                <span className="text-lg font-black text-red-600">{followUps.overdue}</span>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Overdue</span>
              </div>
              <div className="text-center">
                <span className="text-lg font-black text-amber-600">{followUps.dueToday}</span>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Due Today</span>
              </div>
              <div className="text-center">
                <span className="text-lg font-black text-emerald-600">{followUps.upcoming}</span>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Upcoming</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={() => navigate('/admin/crm/followups')}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-200"
            >
              <span>Manage Follow-up Agenda</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
