import React, { useState, useEffect, useMemo } from 'react';
import { 
  HelpCircle, 
  Search, 
  CheckCircle2, 
  Clock, 
  Send, 
  User, 
  Phone, 
  Mail, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Filter, 
  Check,
  AlertCircle
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { getCentreIdByName } from '../utils/centreUtils';
import { CRMSubNav } from '../components/CRMSubNav';
import { SupportTicket } from '../../types';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../../firebase';

export const CRMTickets: React.FC = () => {
  const { centre, user } = useAdminAuth();
  const centreId = centre?.name ? getCentreIdByName(centre.name) : 'bhubaneswar';

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);

  // Reply state
  const [replyText, setReplyText] = useState<{ [ticketId: string]: string }>({});
  const [submittingReply, setSubmittingReply] = useState<{ [ticketId: string]: boolean }>({});
  const [replySuccess, setReplySuccess] = useState<{ [ticketId: string]: boolean }>({});

  useEffect(() => {
    if (!centreId) {
      setTickets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ticketsRef = ref(db, `support_tickets/${centreId}`);

    const unsubscribe = onValue(ticketsRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const list: SupportTicket[] = Object.entries(snapshot.val()).map(([key, val]: [string, any]) => ({
            ticketId: key,
            ...val
          }));
          list.sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
          setTickets(list);
        } else {
          setTickets([]);
        }
      } catch (err) {
        console.error('Error fetching support tickets:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [centreId]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (statusFilter !== 'All' && t.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const studentMatch = (t.studentName || '').toLowerCase().includes(q);
        const emailMatch = (t.studentEmail || '').toLowerCase().includes(q);
        const phoneMatch = (t.studentPhone || '').replace(/\D/g, '').includes(q.replace(/\D/g, ''));
        const rollMatch = (t.rollNo || '').toLowerCase().includes(q);
        const subjectMatch = (t.subject || '').toLowerCase().includes(q);
        const categoryMatch = (t.category || '').toLowerCase().includes(q);
        if (!studentMatch && !emailMatch && !phoneMatch && !rollMatch && !subjectMatch && !categoryMatch) {
          return false;
        }
      }
      return true;
    });
  }, [tickets, statusFilter, searchQuery]);

  const openCount = useMemo(() => {
    return tickets.filter(t => t.status === 'open').length;
  }, [tickets]);

  const handleSendReply = async (ticketId: string, markResolved = false) => {
    const text = (replyText[ticketId] || '').trim();
    if (!text && !markResolved) return;

    setSubmittingReply(prev => ({ ...prev, [ticketId]: true }));

    try {
      const ticketRef = ref(db, `support_tickets/${centreId}/${ticketId}`);
      const updates: Partial<SupportTicket> = {
        lastUpdatedAt: new Date().toISOString(),
        status: markResolved ? 'resolved' : 'in_progress'
      };

      if (text) {
        updates.adminReply = text;
        updates.adminRepliedAt = new Date().toISOString();
        updates.adminRepliedBy = user?.email || `${centreId}@fiitjee.online`;
      }

      await update(ticketRef, updates);

      setReplySuccess(prev => ({ ...prev, [ticketId]: true }));
      setTimeout(() => {
        setReplySuccess(prev => ({ ...prev, [ticketId]: false }));
      }, 3000);
    } catch (err) {
      console.error('Failed to submit ticket reply:', err);
    } finally {
      setSubmittingReply(prev => ({ ...prev, [ticketId]: false }));
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: SupportTicket['status']) => {
    try {
      const ticketRef = ref(db, `support_tickets/${centreId}/${ticketId}`);
      await update(ticketRef, {
        status: newStatus,
        lastUpdatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to update ticket status:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <CRMSubNav
        title="Student Support & Grievances Desk"
        subtitle={`Handle inquiries, hall ticket queries, and exam support tickets for ${centre?.name || 'All'} Centre.`}
        icon={HelpCircle}
        candidateCount={tickets.length}
        openTicketsCount={openCount}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student, email, phone, roll, subject..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#ED1C24] outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-[#ED1C24] outline-none cursor-pointer"
          >
            <option value="All">All Statuses ({tickets.length})</option>
            <option value="open">Open Inquiries ({tickets.filter(t => t.status === 'open').length})</option>
            <option value="in_progress">In Progress ({tickets.filter(t => t.status === 'in_progress').length})</option>
            <option value="resolved">Resolved ({tickets.filter(t => t.status === 'resolved').length})</option>
            <option value="closed">Closed ({tickets.filter(t => t.status === 'closed').length})</option>
          </select>
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 text-xs border border-slate-200">
            <div className="w-8 h-8 border-3 border-[#ED1C24] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span>Loading support inquiries for {centre?.name || 'this'} centre...</span>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">No Support Tickets Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No student grievance tickets have been submitted under this filter.
            </p>
          </div>
        ) : (
          filteredTickets.map((t) => {
            const isExpanded = expandedTicketId === t.ticketId;
            const statusColor = 
              t.status === 'resolved' || t.status === 'closed'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : t.status === 'in_progress'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-amber-50 text-amber-700 border-amber-200';

            return (
              <div 
                key={t.ticketId}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Header Row */}
                <div 
                  onClick={() => setExpandedTicketId(isExpanded ? null : t.ticketId)}
                  className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-red-50 text-[#ED1C24] border border-red-200 px-2 py-0.5 rounded-full">
                        {t.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${statusColor}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(t.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-[#002147]">
                      {t.subject}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.studentName}</span>
                      </span>
                      <span className="font-mono flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.studentPhone}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.studentEmail}</span>
                      </span>
                      {t.rollNo && (
                        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          Roll: {t.rollNo}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {t.adminReply ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 hidden sm:inline-block">
                        Replied
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 hidden sm:inline-block">
                        Awaiting Reply
                      </span>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Details & Response Form */}
                {isExpanded && (
                  <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-slate-100 space-y-4 bg-slate-50/40">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Student Issue Description</label>
                      <div className="p-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
                        {t.description}
                      </div>
                    </div>

                    {/* Previous Admin Reply if already provided */}
                    {t.adminReply && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>Official Response Sent</span>
                          </span>
                          {t.adminRepliedAt && (
                            <span className="font-mono text-blue-500">
                              {new Date(t.adminRepliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-blue-950 font-medium leading-relaxed pt-1 whitespace-pre-wrap">
                          {t.adminReply}
                        </p>
                      </div>
                    )}

                    {/* Status & Reply Form */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                          {t.adminReply ? 'Update or Append Response' : 'Compose Centre Response to Student'}
                        </label>

                        {/* Status Switcher */}
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Change Status:</span>
                          <select
                            value={t.status}
                            onChange={(e) => handleUpdateStatus(t.ticketId, e.target.value as any)}
                            className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 outline-none cursor-pointer"
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>
                      </div>

                      {replySuccess[t.ticketId] && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold">Response saved and visible on Student Portal!</span>
                        </div>
                      )}

                      <textarea
                        rows={3}
                        placeholder="Type response to student... (Student will see this when they view their ticket in the Student Dashboard)"
                        value={replyText[t.ticketId] !== undefined ? replyText[t.ticketId] : (t.adminReply || '')}
                        onChange={(e) => setReplyText({ ...replyText, [t.ticketId]: e.target.value })}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002147] resize-none"
                      />

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          disabled={submittingReply[t.ticketId]}
                          onClick={() => handleSendReply(t.ticketId, false)}
                          className="px-4 py-2 bg-[#002147] hover:bg-[#001733] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{submittingReply[t.ticketId] ? 'Saving...' : 'Send Reply'}</span>
                        </button>

                        <button
                          type="button"
                          disabled={submittingReply[t.ticketId]}
                          onClick={() => handleSendReply(t.ticketId, true)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Reply & Mark Resolved</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
