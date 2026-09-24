import React, { useState, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Clock,
  AlertTriangle,
  Calendar,
  Check,
  Copy,
  Phone,
  Mail,
  Users,
  Search,
  CheckCircle2,
  Sparkles,
  Contact,
  Send,
  FolderArchive,
  MessageSquarePlus,
  ArrowRight,
  Filter,
  X
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useRegistrations } from '../hooks/useRegistrations';
import { useCRMContacts } from '../hooks/useCRMContacts';
import { CRMSubNav } from '../components/CRMSubNav';
import { ExamRegistration } from '../../types';

export const CRMFollowUps: React.FC = () => {
  const navigate = useNavigate();
  const { centre, user } = useAdminAuth();
  const { registrations, loading } = useRegistrations(centre?.name, user?.email || undefined);
  const { setStudentFollowUpDate, logCRMInteraction } = useCRMContacts(
    centre?.name,
    user?.email || undefined
  );

  const [activeTab, setActiveTab] = useState<'overdue' | 'today' | 'upcoming' | 'all'>('overdue');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedPhoneRoll, setCopiedPhoneRoll] = useState<string | null>(null);

  // Quick Note Modal state
  const [noteModalStudent, setNoteModalStudent] = useState<ExamRegistration | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Registrations are already strictly scoped to current centre by hook
  const scopedRegistrations = registrations;

  // Categorize follow-ups
  const { overdueList, todayList, upcomingList } = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const overdue: ExamRegistration[] = [];
    const today: ExamRegistration[] = [];
    const upcoming: ExamRegistration[] = [];

    scopedRegistrations.forEach((r) => {
      if (!r.followUpDate) return;
      const d = r.followUpDate.split('T')[0];
      if (d < todayStr) {
        overdue.push(r);
      } else if (d === todayStr) {
        today.push(r);
      } else {
        upcoming.push(r);
      }
    });

    // Sort by date
    overdue.sort((a, b) => (a.followUpDate || '').localeCompare(b.followUpDate || ''));
    today.sort((a, b) => (a.followUpDate || '').localeCompare(b.followUpDate || ''));
    upcoming.sort((a, b) => (a.followUpDate || '').localeCompare(b.followUpDate || ''));

    return { overdueList: overdue, todayList: today, upcomingList: upcoming };
  }, [scopedRegistrations]);

  // Get active list according to tab & search
  const displayedList = useMemo(() => {
    let list: ExamRegistration[] = [];
    if (activeTab === 'overdue') list = overdueList;
    else if (activeTab === 'today') list = todayList;
    else if (activeTab === 'upcoming') list = upcomingList;
    else list = [...overdueList, ...todayList, ...upcomingList];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.studentName?.toLowerCase().includes(q) ||
          r.rollNo?.toLowerCase().includes(q) ||
          r.phone?.toLowerCase().includes(q) ||
          r.email?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeTab, overdueList, todayList, upcomingList, searchQuery]);

  // Handle Mark Done (clear followUpDate)
  const handleMarkDone = async (rollNo: string) => {
    try {
      await setStudentFollowUpDate(rollNo, null);
    } catch (err) {
      alert('Failed to mark follow-up as complete.');
    }
  };

  // Handle Quick Reschedule
  const handleRescheduleDays = async (rollNo: string, daysToAdd: number) => {
    try {
      const target = new Date();
      target.setDate(target.getDate() + daysToAdd);
      const dateStr = target.toISOString().split('T')[0];
      await setStudentFollowUpDate(rollNo, dateStr);
    } catch (err) {
      alert('Failed to reschedule follow-up.');
    }
  };

  // Copy phone number helper
  const handleCopyPhone = (phone?: string, rollNo?: string) => {
    if (!phone) return;
    const clean = phone.replace(/\D/g, '');
    navigator.clipboard.writeText(clean);
    if (rollNo) {
      setCopiedPhoneRoll(rollNo);
      setTimeout(() => setCopiedPhoneRoll(null), 2000);
    }
  };

  // Submit Note
  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteModalStudent || !noteContent.trim()) return;

    setSavingNote(true);
    try {
      await logCRMInteraction(noteModalStudent.rollNo, 'manual_note', noteContent.trim());
      setNoteModalStudent(null);
      setNoteContent('');
    } catch (err) {
      alert('Failed to save interaction note.');
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <CRMSubNav
        title="Candidate Follow-up Reminders"
        subtitle={`Track scheduled calls, admissions outreach, and pending candidate queries for ${centre?.name || 'All'} Centre.`}
        icon={Clock}
        candidateCount={scopedRegistrations.length}
        overdueCount={overdueList.length}
        actions={
          <button
            onClick={() => navigate('/admin/crm/contacts')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
          >
            <Contact className="w-3.5 h-3.5 text-slate-500" />
            <span>Open Candidate Directory</span>
          </button>
        }
      />

      {/* Stat Cards Category Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overdue */}
        <button
          onClick={() => setActiveTab('overdue')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'overdue'
              ? 'bg-red-50/70 border-red-300 ring-2 ring-red-400/40 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Overdue
            </span>
            <span className="bg-red-100 text-red-700 text-xs font-black px-2 py-0.5 rounded-full font-mono">
              Action Req.
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-red-700">{overdueList.length}</div>
            <p className="text-[11px] text-red-600/80 font-medium mt-0.5">Past scheduled date</p>
          </div>
        </button>

        {/* Due Today */}
        <button
          onClick={() => setActiveTab('today')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'today'
              ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/40 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              Due Today
            </span>
            <span className="bg-amber-100 text-amber-800 text-xs font-black px-2 py-0.5 rounded-full font-mono">
              Today
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-800">{todayList.length}</div>
            <p className="text-[11px] text-amber-700/80 font-medium mt-0.5">Scheduled for today</p>
          </div>
        </button>

        {/* Upcoming */}
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-400/40 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              Upcoming
            </span>
            <span className="bg-blue-100 text-blue-800 text-xs font-black px-2 py-0.5 rounded-full font-mono">
              Next Days
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-blue-800">{upcomingList.length}</div>
            <p className="text-[11px] text-blue-600/80 font-medium mt-0.5">Future scheduled calls</p>
          </div>
        </button>

        {/* All Follow-ups */}
        <button
          onClick={() => setActiveTab('all')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400/40 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-600" />
              Total Active
            </span>
            <span className="bg-slate-100 text-slate-700 text-xs font-black px-2 py-0.5 rounded-full font-mono">
              Pipeline
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-800">
              {overdueList.length + todayList.length + upcomingList.length}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">All scheduled leads</p>
          </div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidates by name, roll number, phone or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#ED1C24] transition-all"
          />
        </div>
        <div className="text-xs font-bold text-slate-500">
          Showing {displayedList.length} follow-up reminders
        </div>
      </div>

      {/* Follow-ups List */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <div className="w-8 h-8 border-3 border-[#ED1C24] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-500">Loading follow-ups...</p>
        </div>
      ) : displayedList.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">No follow-ups pending in this view</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'No matching candidates found for your search query.'
                : 'All follow-ups for this category are up to date. You can schedule new follow-ups from the Candidate Directory.'}
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/crm/contacts')}
            className="px-4 py-2 bg-[#002147] hover:bg-[#001733] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Contact className="w-3.5 h-3.5" />
            <span>Go to Candidate Directory</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedList.map((student) => {
            const todayStr = new Date().toISOString().split('T')[0];
            const isOverdue = student.followUpDate && student.followUpDate.split('T')[0] < todayStr;
            const isDueToday = student.followUpDate && student.followUpDate.split('T')[0] === todayStr;

            return (
              <div
                key={student.rollNo}
                className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all shadow-xs hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isOverdue
                    ? 'border-red-200 bg-red-50/20'
                    : isDueToday
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Candidate Info */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {student.rollNo}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        student.status === 'Confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : student.status === 'Contacted'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {student.status || 'New'}
                    </span>
                    {student.selectedCenter && (
                      <span className="text-[10px] text-slate-400 font-semibold">
                        • {student.selectedCenter}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-[#002147]">{student.studentName}</h3>

                  <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
                    {/* Phone + Copy Helper */}
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono">{student.phone || 'No phone'}</span>
                      {student.phone && (
                        <button
                          type="button"
                          onClick={() => handleCopyPhone(student.phone, student.rollNo)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                          title="Copy phone number"
                        >
                          {copiedPhoneRoll === student.rollNo ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-[200px]">{student.email || 'No email'}</span>
                    </div>

                    {/* Class */}
                    {student.currentClass && (
                      <span className="text-[11px] text-slate-500">
                        Class: {student.currentClass}
                      </span>
                    )}
                  </div>

                  {/* Scheduled Reminder Date info */}
                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500 font-medium">Scheduled:</span>
                    <span
                      className={`font-bold ${
                        isOverdue
                          ? 'text-red-600 font-black'
                          : isDueToday
                          ? 'text-amber-600 font-black'
                          : 'text-slate-700'
                      }`}
                    >
                      {student.followUpDate}
                      {isOverdue && ' (Overdue)'}
                      {isDueToday && ' (Today)'}
                    </span>
                  </div>
                </div>

                {/* Actions Panel */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  {/* Mark Complete */}
                  <button
                    onClick={() => handleMarkDone(student.rollNo)}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Mark follow-up completed"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Done</span>
                  </button>

                  {/* Reschedule Dropdown / Quick buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleRescheduleDays(student.rollNo, 1)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                      title="Postpone by +1 Day"
                    >
                      +1d
                    </button>
                    <button
                      onClick={() => handleRescheduleDays(student.rollNo, 3)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                      title="Postpone by +3 Days"
                    >
                      +3d
                    </button>
                    <button
                      onClick={() => handleRescheduleDays(student.rollNo, 7)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                      title="Postpone by +1 Week"
                    >
                      +7d
                    </button>
                  </div>

                  {/* Add Note */}
                  <button
                    onClick={() => {
                      setNoteModalStudent(student);
                      setNoteContent('');
                    }}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                    title="Log interaction note"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                  </button>

                  {/* Quick Email */}
                  {student.email && (
                    <button
                      onClick={() => navigate(`/admin/crm/compose?email=${encodeURIComponent(student.email)}`)}
                      className="p-2 bg-red-50 hover:bg-red-100 text-[#ED1C24] rounded-xl transition-all cursor-pointer"
                      title="Send email to this candidate"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Note Modal */}
      {noteModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#002147]">Log CRM Interaction</h3>
                <p className="text-xs text-slate-500">
                  {noteModalStudent.studentName} ({noteModalStudent.rollNo})
                </p>
              </div>
              <button
                onClick={() => setNoteModalStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Interaction / Call Note
                </label>
                <textarea
                  rows={4}
                  required
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="e.g. Called parent regarding hall ticket download, confirmed they will arrive by 8:15 AM."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#ED1C24] leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNoteModalStudent(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingNote || !noteContent.trim()}
                  className="px-4 py-2 bg-[#ED1C24] hover:bg-[#c9141b] disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {savingNote ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMFollowUps;