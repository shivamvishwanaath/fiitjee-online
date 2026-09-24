import React, { useState, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Copy, 
  Check, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  FileSpreadsheet, 
  ExternalLink, 
  MessageSquarePlus, 
  Send,
  Contact,
  Building2,
  Sparkles,
  Filter,
  AlertCircle,
  X,
  GraduationCap
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useRegistrations } from '../hooks/useRegistrations';
import { useCRMContacts } from '../hooks/useCRMContacts';
import { useStudentsByCentre } from '../hooks/useStudentsByCentre';
import { exportToExcel } from '../utils/exportExcel';
import { CRMSubNav } from '../components/CRMSubNav';
import { ExamRegistration } from '../../types';

export const CRMContacts: React.FC = () => {
  const navigate = useNavigate();
  const { centre, user } = useAdminAuth();
  const { registrations, loading, updateStatus } = useRegistrations(centre?.name, user?.email || undefined);
  const { setStudentFollowUpDate, logCRMInteraction } = useCRMContacts(centre?.name, user?.email || undefined);
  const { students: centreStudents, loading: loadingStudents } = useStudentsByCentre(centre?.name);

  const [directoryView, setDirectoryView] = useState<'exam_registrations' | 'student_accounts'>('exam_registrations');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [followUpFilter, setFollowUpFilter] = useState<'All' | 'HasFollowUp' | 'Overdue'>('All');

  const [copiedPhones, setCopiedPhones] = useState(false);
  const [copiedEmails, setCopiedEmails] = useState(false);

  // Quick Note Modal state
  const [noteModalStudent, setNoteModalStudent] = useState<ExamRegistration | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Filtered registrations
  const filteredContacts = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    return registrations.filter((r) => {
      // Status Filter
      if (statusFilter !== 'All' && (r.status || 'New') !== statusFilter) {
        return false;
      }

      // Follow-up Filter
      if (followUpFilter === 'HasFollowUp' && !r.followUpDate) return false;
      if (followUpFilter === 'Overdue') {
        if (!r.followUpDate) return false;
        if (r.followUpDate.split('T')[0] >= todayStr) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = r.studentName.toLowerCase().includes(q);
        const rollMatch = r.rollNo.toLowerCase().includes(q);
        const phoneMatch = r.phone.replace(/\D/g, '').includes(q.replace(/\D/g, ''));
        const emailMatch = r.email.toLowerCase().includes(q);
        const schoolMatch = (r.schoolName || '').toLowerCase().includes(q);
        if (!nameMatch && !rollMatch && !phoneMatch && !emailMatch && !schoolMatch) {
          return false;
        }
      }

      return true;
    });
  }, [registrations, statusFilter, followUpFilter, searchQuery]);

  // Filtered Student Accounts
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return centreStudents;
    const q = searchQuery.toLowerCase();
    return centreStudents.filter((s) => {
      const nameMatch = (s.fullName || '').toLowerCase().includes(q);
      const phoneMatch = (s.phone || '').replace(/\D/g, '').includes(q.replace(/\D/g, ''));
      const emailMatch = (s.email || '').toLowerCase().includes(q);
      const schoolMatch = (s.schoolName || '').toLowerCase().includes(q);
      return nameMatch || phoneMatch || emailMatch || schoolMatch;
    });
  }, [centreStudents, searchQuery]);

  // Copy Phone Numbers
  const handleCopyPhones = () => {
    const list = directoryView === 'exam_registrations' ? filteredContacts : filteredStudents;
    const phones = list
      .map((r: any) => r.phone?.replace(/\D/g, ''))
      .filter(Boolean)
      .join(', ');

    navigator.clipboard.writeText(phones);
    setCopiedPhones(true);
    setTimeout(() => setCopiedPhones(false), 2000);
  };

  // Copy Emails
  const handleCopyEmails = () => {
    const list = directoryView === 'exam_registrations' ? filteredContacts : filteredStudents;
    const emails = list
      .map((r: any) => r.email?.trim())
      .filter(Boolean)
      .join(', ');

    navigator.clipboard.writeText(emails);
    setCopiedEmails(true);
    setTimeout(() => setCopiedEmails(false), 2000);
  };

  // Save Quick Note
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteModalStudent || !noteContent.trim()) return;

    setSavingNote(true);
    try {
      await logCRMInteraction(noteModalStudent.rollNo, 'call_log', noteContent.trim());
      setNoteModalStudent(null);
      setNoteContent('');
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      <CRMSubNav
        title="Candidate CRM Directory"
        subtitle={`Counseling pipeline, follow-ups, and interaction notes for ${centre?.name || 'All'} Centre.`}
        icon={Contact}
        candidateCount={registrations.length}
        actions={
          <>
            <button
              onClick={handleCopyPhones}
              className="px-3.5 py-2 bg-[#002147] hover:bg-[#001733] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Copy phone numbers of filtered list"
            >
              {copiedPhones ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Phone className="w-3.5 h-3.5" />}
              <span>{copiedPhones ? 'Copied Phones!' : `Copy Phones (${filteredContacts.length})`}</span>
            </button>

            <button
              onClick={handleCopyEmails}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
              title="Copy email addresses of filtered list"
            >
              {copiedEmails ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Mail className="w-3.5 h-3.5" />}
              <span>{copiedEmails ? 'Copied Emails!' : 'Copy Emails'}</span>
            </button>

            <button
              onClick={() => exportToExcel(filteredContacts, `FIITJEE_CRM_Contacts_${centre?.name || 'All'}`)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Export to Excel Spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
          </>
        }
      />

      {/* View Switcher: Exam Registrations vs Student Accounts */}
      <div className="flex bg-slate-200/70 p-1 rounded-2xl max-w-md gap-1">
        <button
          onClick={() => setDirectoryView('exam_registrations')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            directoryView === 'exam_registrations'
              ? 'bg-white text-[#002147] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Contact className="w-3.5 h-3.5" />
          <span>Exam Registrations ({registrations.length})</span>
        </button>

        <button
          onClick={() => setDirectoryView('student_accounts')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            directoryView === 'student_accounts'
              ? 'bg-white text-[#002147] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Centre Students ({centreStudents.length})</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, phone, email, or school..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#ED1C24] outline-none"
          />
        </div>

        {/* Dropdown Filters (only relevant for exam registrations) */}
        {directoryView === 'exam_registrations' && (
          <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-[#ED1C24] outline-none cursor-pointer"
            >
              <option value="All">All Pipeline Stages</option>
              <option value="New">New Leads</option>
              <option value="Contacted">In Contact</option>
              <option value="Confirmed">Confirmed Seats</option>
              <option value="Selected">Selected</option>
              <option value="Absent">Absent</option>
            </select>

            {/* Follow-up Filter */}
            <select
              value={followUpFilter}
              onChange={(e) => setFollowUpFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-[#ED1C24] outline-none cursor-pointer"
            >
              <option value="All">All Follow-ups</option>
              <option value="HasFollowUp">Has Scheduled Follow-up</option>
              <option value="Overdue">Overdue Reminders Only</option>
            </select>
          </div>
        )}
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {directoryView === 'student_accounts' ? (
          loadingStudents ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <div className="w-8 h-8 border-3 border-[#ED1C24] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <span>Loading student accounts affiliated with {centre?.name || 'this'} centre...</span>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">No Student Accounts Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No students matching your search criteria have registered with {centre?.name || 'this'} centre as their preferred hub.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Student & Parent</th>
                    <th className="py-3 px-4">Contact Details</th>
                    <th className="py-3 px-4">Class & School</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Registered Exams</th>
                    <th className="py-3 px-4 text-right">Outreach</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((st) => {
                    const examCount = st.registeredExams ? Object.keys(st.registeredExams).length : 0;
                    return (
                      <tr key={st.uid} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 text-sm">{st.fullName}</div>
                          {st.parentName && (
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Guardian: {st.parentName}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            Joined {new Date(st.createdAt).toLocaleDateString('en-IN')}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-800">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-bold">{st.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[160px]">{st.email}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#002147]">{st.currentClass}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[180px]">{st.schoolName || 'Not specified'}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <div>{[st.city, st.state].filter(Boolean).join(', ') || 'Not specified'}</div>
                          {st.pincode && <div className="text-[10px] font-mono text-slate-400">PIN: {st.pincode}</div>}
                        </td>
                        <td className="py-3 px-4">
                          {examCount > 0 ? (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {examCount} Exam{examCount > 1 ? 's' : ''} Linked
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px] italic">No exams yet</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => navigate(`/admin/crm/compose?email=${encodeURIComponent(st.email)}`)}
                            className="p-2 bg-slate-100 hover:bg-[#002147] hover:text-white text-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="Send email outreach"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-3 border-[#ED1C24] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <span>Loading CRM candidate roster...</span>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">No Candidates Match Filters</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search query, status stage, or centre filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Contact Details</th>
                  <th className="py-3 px-4">Test Slot & Centre</th>
                  <th className="py-3 px-4">Pipeline Status</th>
                  <th className="py-3 px-4">Follow-up Date</th>
                  <th className="py-3 px-4 text-right">Outreach Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContacts.map((c) => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const followUpDue = c.followUpDate ? c.followUpDate.split('T')[0] : null;
                  const isOverdue = followUpDue && followUpDue < todayStr;
                  const isToday = followUpDue === todayStr;

                  return (
                    <tr key={c.rollNo} className="hover:bg-slate-50/80 transition-colors">
                      {/* Candidate */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{c.studentName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <span>{c.currentClass}</span>
                          {c.schoolName && (
                            <>
                              <span>·</span>
                              <span className="truncate max-w-[140px]">{c.schoolName}</span>
                            </>
                          )}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                          Roll: <span className="font-bold text-slate-700">{c.rollNo}</span>
                        </div>
                      </td>

                      {/* Phone & Email */}
                      <td className="py-3 px-4 font-mono space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-800">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-bold">{c.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[160px]">{c.email}</span>
                        </div>
                      </td>

                      {/* Centre & Slot */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{c.selectedCenter || 'Online Proctored'}</div>
                        <div className="text-[11px] text-slate-500">{c.testMode}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{c.testDate}</div>
                      </td>

                      {/* Pipeline Status */}
                      <td className="py-3 px-4">
                        <select
                          value={c.status || 'New'}
                          onChange={(e) => updateStatus(c.rollNo, e.target.value as any)}
                          className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border outline-none cursor-pointer ${
                            c.status === 'Confirmed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : c.status === 'Contacted'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : c.status === 'Selected'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : c.status === 'Absent'
                              ? 'bg-slate-100 text-slate-500 border-slate-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          <option value="New">New Lead</option>
                          <option value="Contacted">In Contact</option>
                          <option value="Confirmed">Confirmed Seat</option>
                          <option value="Selected">Admission Selected</option>
                          <option value="Absent">Absent</option>
                        </select>
                      </td>

                      {/* Follow-up Date */}
                      <td className="py-3 px-4">
                        <input
                          type="date"
                          value={followUpDue || ''}
                          onChange={(e) => setStudentFollowUpDate(c.rollNo, e.target.value || null)}
                          className={`text-xs font-mono px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                            isOverdue
                              ? 'bg-red-50 text-red-700 border-red-300 font-bold'
                              : isToday
                              ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                              : followUpDue
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}
                        />
                        {isOverdue && (
                          <div className="text-[10px] font-bold text-red-600 mt-0.5">⚠️ Overdue Reminder</div>
                        )}
                        {isToday && (
                          <div className="text-[10px] font-bold text-amber-600 mt-0.5">⏰ Call Due Today</div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Log Call Note */}
                          <button
                            onClick={() => {
                              setNoteModalStudent(c);
                              setNoteContent('');
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="Add CRM counseling note"
                          >
                            <MessageSquarePlus className="w-3.5 h-3.5" />
                          </button>

                          {/* Email Student */}
                          <button
                            onClick={() => navigate(`/admin/crm/compose?email=${encodeURIComponent(c.email)}`)}
                            className="p-1.5 bg-slate-100 hover:bg-[#002147] hover:text-white text-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="Compose email to this candidate"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          {/* View Record */}
                          <button
                            onClick={() => navigate(`/admin/registrations/${encodeURIComponent(c.rollNo)}`)}
                            className="p-1.5 bg-slate-100 hover:bg-[#ED1C24] hover:text-white text-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="View student profile & Hall ticket"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Note Modal */}
      {noteModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-[#002147] uppercase tracking-wider">
                  Log Counseling Note
                </h3>
                <span className="text-xs text-slate-500 font-semibold">{noteModalStudent.studentName} ({noteModalStudent.rollNo})</span>
              </div>
              <button
                onClick={() => setNoteModalStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Interaction / Call Summary *
                </label>
                <textarea
                  rows={4}
                  required
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="e.g. Discussed 100% scholarship criterion with parent. Parent requested offline syllabus handbook at Dwarka centre."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#ED1C24] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNoteModalStudent(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingNote || !noteContent.trim()}
                  className="px-5 py-2 bg-[#ED1C24] hover:bg-[#c9141b] text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {savingNote ? 'Saving...' : 'Save CRM Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
