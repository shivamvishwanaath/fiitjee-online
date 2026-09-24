import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Calendar, 
  MapPin, 
  Printer, 
  Award, 
  BookOpen, 
  Clock, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  User, 
  Phone, 
  Mail, 
  School, 
  CreditCard, 
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  Building2,
  Send,
  ShieldAlert,
  ChevronRight,
  ChevronDown,
  Tag,
  Hash,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Ticket,
  Search,
  CheckCircle,
  Compass,
  ArrowUpRight,
  FileCheck
} from 'lucide-react';
import { useStudentAuth } from '../hooks/useStudentAuth';
import { HallTicketModal } from '../../components/HallTicketModal';
import { BigBangRegistrationModal } from '../../components/BigBangRegistrationModal';
import { FtreRegistrationModal } from '../../components/FtreRegistrationModal';
import { FiitjeeLogo } from '../../components/FiitjeeLogo';
import { ExamRegistration, StudentExamLink, SupportTicket, ExamResult } from '../../types';
import { BIG_BANG_EXAM } from '../../data/examsData';
import { getExamScheduleForClass, CENTRES_CONFIG } from '../../admin/utils/centreUtils';
import { ref, onValue, get, push, set } from 'firebase/database';
import { db } from '../../firebase';

export type StudentDashboardTab = 
  | 'overview'
  | 'exams' 
  | 'hall-tickets'
  | 'results' 
  | 'support' 
  | 'profile' 
  | 'available' 
  | 'schedule';

const CENTRE_LABELS: Record<string, string> = {
  bhubaneswar: 'FIITJEE Bhubaneswar (Odisha)',
  dwarka: 'FIITJEE Dwarka (New Delhi)',
  ranchi: 'FIITJEE Ranchi (Jharkhand)',
  hyderabad: 'FIITJEE Hyderabad (Telangana)'
};

const SkeletonCard: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-4 bg-slate-200 rounded-full w-1/3" />
      <div className="h-4 bg-slate-100 rounded-full w-1/5" />
    </div>
    <div className="h-12 bg-slate-100 rounded-2xl" />
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-3 bg-slate-200 rounded-full w-1/2" />
          <div className="h-4 bg-slate-100 rounded-lg w-full" />
        </div>
      ))}
    </div>
    <div className="h-10 bg-slate-100 rounded-xl w-full" />
  </div>
);

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { student, logout, updateStudentProfile } = useStudentAuth();

  // Determine active tab from URL path or search parameter
  const activeTab: StudentDashboardTab = useMemo(() => {
    const rawPath = location.pathname.toLowerCase();
    if (rawPath.includes('/exams') || rawPath.includes('/past-exams')) return 'exams';
    if (rawPath.includes('/hall-ticket')) return 'hall-tickets';
    if (rawPath.includes('/result')) return 'results';
    if (rawPath.includes('/support') || rawPath.includes('/help')) return 'support';
    if (rawPath.includes('/profile')) return 'profile';
    if (rawPath.includes('/available')) return 'available';
    if (rawPath.includes('/schedule')) return 'schedule';

    const paramTab = searchParams.get('tab') as StudentDashboardTab;
    if (paramTab && ['overview', 'exams', 'hall-tickets', 'results', 'support', 'profile', 'available', 'schedule'].includes(paramTab)) {
      return paramTab;
    }
    return 'overview';
  }, [location.pathname, searchParams]);

  const handleTabChange = (tab: StudentDashboardTab) => {
    setSearchParams({ tab });
    setMobileDrawerOpen(false);
  };

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [selectedTicketReg, setSelectedTicketReg] = useState<ExamRegistration | null>(null);
  const [isBigBangModalOpen, setIsBigBangModalOpen] = useState(false);
  const [isFtreModalOpen, setIsFtreModalOpen] = useState(false);
  const [copiedRoll, setCopiedRoll] = useState<string | null>(null);

  // Profile Edit State
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    parentName: '',
    phone: '',
    schoolName: '',
    currentClass: 'Class X',
    preferredCentreId: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Registrations state
  const [registeredList, setRegisteredList] = useState<ExamRegistration[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);

  // Results state
  const [results, setResults] = useState<Record<string, ExamResult>>({});
  const [loadingResults, setLoadingResults] = useState(false);
  const [lookupRoll, setLookupRoll] = useState('');
  const [lookupResult, setLookupResult] = useState<ExamResult | null>(null);
  const [searchingRoll, setSearchingRoll] = useState(false);

  // Support tickets state
  const [ticketForm, setTicketForm] = useState({
    category: '',
    subject: '',
    description: ''
  });
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [myTickets, setMyTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Populate profile form when student loads
  useEffect(() => {
    if (student) {
      setProfileForm({
        fullName: student.fullName || '',
        parentName: student.parentName || '',
        phone: student.phone || '',
        schoolName: student.schoolName || '',
        currentClass: student.currentClass || 'Class X',
        preferredCentreId: student.preferredCentreId || '',
        city: student.city || '',
        state: student.state || '',
        pincode: student.pincode || ''
      });
    }
  }, [student]);

  // Query registrations for this student
  useEffect(() => {
    if (!student) return;

    setLoadingExams(true);
    const studentExamsRef = ref(db, `students/${student.uid}/registeredExams`);
    const unsubscribe = onValue(studentExamsRef, async (snapshot) => {
      try {
        const foundRegs: ExamRegistration[] = [];

        if (snapshot.exists()) {
          const links = snapshot.val() as Record<string, StudentExamLink>;
          for (const link of Object.values(links)) {
            if (link.centreId && link.rollNo) {
              const cleanRoll = link.rollNo.replace(/\s+/g, '_');
              const centreRegRef = ref(db, `registrations/big_bang_2026/${link.centreId}/${cleanRoll}`);
              const centreSnap = await get(centreRegRef);
              if (centreSnap.exists()) {
                foundRegs.push({
                  id: cleanRoll,
                  ...centreSnap.val(),
                  rollNo: centreSnap.val().rollNo || link.rollNo,
                  selectedCenter: centreSnap.val().selectedCenter || link.selectedCenter,
                  registeredByCentre: link.centreId
                });
                continue;
              }
            }
            foundRegs.push({
              examId: link.examId,
              examYear: '2026',
              studentName: student.fullName,
              parentName: student.parentName,
              currentClass: student.currentClass,
              schoolName: student.schoolName,
              phone: student.phone,
              email: student.email,
              testDate: link.testDate,
              testMode: link.testMode,
              selectedCenter: link.selectedCenter,
              registeredAt: link.registeredAt,
              rollNo: link.rollNo,
              paymentStatus: link.paymentStatus as any,
              paymentAmount: link.paymentAmount,
              paymentRef: link.paymentRef,
              invoiceNo: link.invoiceNo,
              sid: link.sid,
              registeredByCentre: link.centreId
            });
          }
        }

        // Secondary search by email or phone
        if (foundRegs.length === 0) {
          const centres = ['bhubaneswar', 'dwarka', 'ranchi', 'hyderabad'];
          for (const c of centres) {
            const centreRef = ref(db, `registrations/big_bang_2026/${c}`);
            const centreSnap = await get(centreRef);
            if (centreSnap.exists()) {
              const centreData = centreSnap.val();
              for (const [key, val] of Object.entries(centreData)) {
                if (key === '_init' || !val || typeof val !== 'object') continue;
                const r = val as any;
                const matchEmail = (r.email || '').toLowerCase().trim() === student.email.toLowerCase().trim();
                const matchPhone = (r.phone || '').replace(/\D/g, '') === student.phone.replace(/\D/g, '');
                if (matchEmail || matchPhone) {
                  foundRegs.push({
                    id: key,
                    ...r,
                    rollNo: r.rollNo || key.replace(/_/g, ' '),
                    registeredByCentre: c
                  });
                }
              }
            }
          }
        }

        setRegisteredList(foundRegs);
      } catch (err) {
        console.error('Error fetching student exam registrations:', err);
      } finally {
        setLoadingExams(false);
      }
    });

    return () => unsubscribe();
  }, [student]);

  // Query examination results
  useEffect(() => {
    if (registeredList.length === 0) {
      setResults({});
      return;
    }

    const fetchResults = async () => {
      setLoadingResults(true);
      const resultMap: Record<string, ExamResult> = {};
      const centres = ['bhubaneswar', 'dwarka', 'ranchi', 'hyderabad'];

      for (const reg of registeredList) {
        if (!reg.rollNo) continue;
        const cleanRoll = reg.rollNo.replace(/\s+/g, '_');
        const primaryCentre = reg.registeredByCentre || student?.preferredCentreId || 'bhubaneswar';

        try {
          let snap = await get(ref(db, `results/big_bang_2026/${primaryCentre}/${cleanRoll}`));
          if (!snap.exists()) {
            for (const c of centres) {
              if (c === primaryCentre) continue;
              const altSnap = await get(ref(db, `results/big_bang_2026/${c}/${cleanRoll}`));
              if (altSnap.exists()) {
                snap = altSnap;
                break;
              }
            }
          }

          if (snap.exists()) {
            resultMap[reg.rollNo] = {
              rollNo: reg.rollNo,
              ...snap.val()
            };
          }
        } catch (err) {
          console.error('Error querying exam results for roll:', reg.rollNo, err);
        }
      }

      setResults(resultMap);
      setLoadingResults(false);
    };

    fetchResults();
  }, [registeredList, student]);

  // Subscribe to support tickets
  useEffect(() => {
    if (!student) return;

    setLoadingTickets(true);
    const activeCentre = student.preferredCentreId || 'bhubaneswar';
    const ticketsRef = ref(db, `support_tickets/${activeCentre}`);

    const unsubscribe = onValue(ticketsRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const all = Object.entries(snapshot.val()).map(([key, val]: [string, any]) => ({
            ticketId: key,
            ...val
          })) as SupportTicket[];

          const mine = all.filter(t => 
            t.studentUid === student.uid || 
            (t.studentEmail && t.studentEmail.toLowerCase() === student.email.toLowerCase())
          );
          mine.sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
          setMyTickets(mine);
        } else {
          setMyTickets([]);
        }
      } catch (err) {
        console.error('Error reading support tickets:', err);
      } finally {
        setLoadingTickets(false);
      }
    });

    return () => unsubscribe();
  }, [student]);

  const handleCopyRoll = (roll: string) => {
    navigator.clipboard.writeText(roll);
    setCopiedRoll(roll);
    setTimeout(() => setCopiedRoll(null), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setSaveSuccess(false);
    setSaveError(null);

    if (profileForm.phone.replace(/\D/g, '').length !== 10) {
      setSaveError('Please provide a valid 10-digit mobile number.');
      setSavingProfile(false);
      return;
    }

    try {
      await updateStudentProfile({
        fullName: profileForm.fullName.trim(),
        parentName: profileForm.parentName.trim(),
        phone: profileForm.phone.trim(),
        schoolName: profileForm.schoolName.trim(),
        currentClass: profileForm.currentClass,
        preferredCentreId: profileForm.preferredCentreId || undefined,
        city: profileForm.city.trim() || undefined,
        state: profileForm.state.trim() || undefined,
        pincode: profileForm.pincode.trim() || undefined
      });
      setSaveSuccess(true);
      setEditingProfile(false);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setSaveError(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    if (!ticketForm.category) {
      setTicketError('Please select an inquiry category.');
      return;
    }
    if (!ticketForm.subject.trim()) {
      setTicketError('Please enter a subject line.');
      return;
    }
    if (!ticketForm.description.trim()) {
      setTicketError('Please describe your question or issue.');
      return;
    }

    setSubmittingTicket(true);
    setTicketError(null);

    try {
      const targetCentre = student.preferredCentreId || registeredList[0]?.registeredByCentre || 'bhubaneswar';
      const ticketsRef = ref(db, `support_tickets/${targetCentre}`);
      const newTicketRef = push(ticketsRef);

      const payload: SupportTicket = {
        ticketId: newTicketRef.key || `TKT-${Date.now()}`,
        studentUid: student.uid,
        studentName: student.fullName,
        studentEmail: student.email,
        studentPhone: student.phone,
        rollNo: registeredList[0]?.rollNo || '',
        category: ticketForm.category,
        subject: ticketForm.subject.trim(),
        description: ticketForm.description.trim(),
        status: 'open',
        priority: 'normal',
        centreId: targetCentre,
        submittedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString()
      };

      await set(newTicketRef, payload);
      setTicketForm({ category: '', subject: '', description: '' });
      setTicketSuccess(true);
      setTimeout(() => setTicketSuccess(false), 5000);
    } catch (err: any) {
      console.error('Failed to submit ticket:', err);
      setTicketError(err.message || 'Failed to submit support ticket.');
    } finally {
      setSubmittingTicket(false);
    }
  };

  const isBigBangRegistered = useMemo(() => {
    return registeredList.some(r => r.examId === BIG_BANG_EXAM.id || r.rollNo?.startsWith('7052'));
  }, [registeredList]);

  // Active centre info
  const activeCentreProfile = useMemo(() => {
    const cid = student?.preferredCentreId || 'bhubaneswar';
    return CENTRES_CONFIG[cid] || CENTRES_CONFIG['bhubaneswar'];
  }, [student?.preferredCentreId]);

  // Nav Items definition for Sidebar
  const navItems = [
    {
      id: 'overview' as StudentDashboardTab,
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'exams' as StudentDashboardTab,
      label: 'Past & Registered Exams',
      icon: FileText,
      badge: registeredList.length > 0 ? registeredList.length : null
    },
    {
      id: 'hall-tickets' as StudentDashboardTab,
      label: 'Download Hall Tickets',
      icon: Ticket,
      badge: registeredList.length > 0 ? `${registeredList.length} Ready` : null
    },
    {
      id: 'results' as StudentDashboardTab,
      label: 'Result Cards & Scores',
      icon: Award,
      badge: Object.keys(results).length > 0 ? `${Object.keys(results).length}` : null
    },
    {
      id: 'support' as StudentDashboardTab,
      label: 'Raise Problem with Centre',
      icon: HelpCircle,
      badge: myTickets.filter(t => t.status === 'open').length > 0 
        ? `${myTickets.filter(t => t.status === 'open').length} Open` 
        : null
    },
    {
      id: 'profile' as StudentDashboardTab,
      label: 'Student Profile (CRUD)',
      icon: User,
      badge: null
    },
    {
      id: 'available' as StudentDashboardTab,
      label: 'Available Admission Tests',
      icon: Sparkles,
      badge: isBigBangRegistered ? null : 'Apply'
    },
    {
      id: 'schedule' as StudentDashboardTab,
      label: 'Exam Schedule & Guidelines',
      icon: Clock,
      badge: null
    }
  ];

  const navSections = [
    {
      label: 'My Examinations',
      ids: ['overview', 'exams', 'hall-tickets', 'results'] as StudentDashboardTab[]
    },
    {
      label: 'Centre Assistance',
      ids: ['support'] as StudentDashboardTab[]
    },
    {
      label: 'Account & Information',
      ids: ['profile', 'available', 'schedule'] as StudentDashboardTab[]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row selection:bg-[#ED1C24] selection:text-white font-['Plus_Jakarta_Sans',sans-serif]">

      {/* ========================================================================= */}
      {/* 1. DESKTOP & TABLET LEFT SIDEBAR PANEL ("Dashboard inside the Dashboard")  */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex flex-col w-72 bg-[#001733] text-white border-r border-slate-800 shrink-0 sticky top-0 h-screen overflow-y-auto">
        
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <FiitjeeLogo variant="white" size="sm" showTagline={false} />
            <div className="border-l border-slate-700 pl-2">
              <span className="bg-[#ED1C24] text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full block">
                Candidate Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Student Profile Pill Card */}
        <div className="p-3.5 mx-3 my-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3 relative overflow-hidden group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ED1C24] to-[#990000] text-white flex items-center justify-center font-black text-sm shadow-md ring-2 ring-white/20 shrink-0">
            {student?.fullName ? student.fullName.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white truncate">
                {student?.fullName || 'Candidate'}
              </span>
              <span className="text-[8px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                Verified
              </span>
            </div>
            <div className="text-[11px] text-amber-300 font-bold flex items-center gap-1 truncate">
              <span>{student?.currentClass || 'Class X'}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 truncate text-[10px]">
                {student?.preferredCentreId ? student.preferredCentreId.toUpperCase() : 'CENTRE'}
              </span>
            </div>
            {student?.email && (
              <div className="text-[9px] text-slate-400 font-mono truncate mt-0.5">
                {student.email}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links with Grouped Sections */}
        <nav className="flex-1 px-3 space-y-3 py-2">
          {navSections.map((section) => (
            <div key={section.label} className="space-y-1">
              <div className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 px-3 pt-1">
                {section.label}
              </div>
              <div className="space-y-0.5">
                {section.ids.map((id) => {
                  const item = navItems.find((n) => n.id === id);
                  if (!item) return null;
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`group relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer text-left ${
                        isActive
                          ? 'bg-[#ED1C24] text-white shadow-md'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white hover:translate-x-0.5'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full shadow-xs" />
                      )}
                      <div className="flex items-center gap-2.5 pl-1">
                        <Icon className={`w-[17px] h-[17px] shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shrink-0 ${
                          isActive
                            ? 'bg-white text-[#ED1C24]'
                            : 'bg-white/10 text-amber-300 border border-white/10'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Assigned Centre Contact Card */}
        <div className="p-3.5 m-3 bg-gradient-to-br from-[#002147] to-[#001026] rounded-2xl border border-white/10 space-y-2 text-xs shadow-xs">
          <div className="flex items-center gap-1.5 text-amber-300 font-black text-[10px] uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5 text-[#ED1C24]" />
            <span>Assigned Centre Helpline</span>
          </div>
          <div className="font-bold text-white text-[11px] leading-tight">
            FIITJEE {activeCentreProfile.name}
          </div>
          <div className="text-[10px] text-slate-300 flex items-center gap-1">
            <Phone className="w-3 h-3 text-[#ED1C24] shrink-0" />
            <a href={`tel:${activeCentreProfile.helplinePhone}`} className="hover:underline font-mono text-amber-200 font-bold">
              {activeCentreProfile.helplinePhone}
            </a>
          </div>
          <div className="text-[9px] text-slate-400 flex items-start gap-1 leading-snug line-clamp-2">
            <MapPin className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
            <span>{activeCentreProfile.address}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
          <Link 
            to="/" 
            className="text-slate-400 hover:text-white transition-colors text-[11px] font-bold flex items-center gap-1"
          >
            <span>&larr; Main Site</span>
          </Link>

          <button
            onClick={() => { logout(); navigate('/student/login'); }}
            className="px-2.5 py-1.5 bg-red-500/10 hover:bg-[#ED1C24] border border-red-500/20 hover:border-transparent text-red-300 hover:text-white rounded-lg text-[11px] font-bold transition-all duration-150 cursor-pointer flex items-center gap-1"
            title="Sign out of student portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE TOP HEADER & DRAWER                                            */}
      {/* ========================================================================= */}
      <header className="md:hidden bg-[#001733] text-white p-3.5 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white cursor-pointer"
          >
            {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <FiitjeeLogo variant="white" size="sm" showTagline={false} />
        </div>

        <div className="flex items-center gap-2">
          {(() => {
            const activeItem = navItems.find((n) => n.id === activeTab);
            const ActiveIcon = activeItem?.icon || LayoutDashboard;
            return (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-[#ED1C24] px-2.5 py-1 rounded-full text-white shadow-xs">
                <ActiveIcon className="w-3 h-3" />
                <span>{activeTab.replace('-', ' ')}</span>
              </span>
            );
          })()}
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#ED1C24] to-[#990000] text-white flex items-center justify-center text-xs font-black ring-1 ring-white/20">
            {student?.fullName?.charAt(0).toUpperCase() || 'S'}
          </div>
          <button
            onClick={() => { logout(); navigate('/student/login'); }}
            className="p-1 text-slate-400 hover:text-white cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex">
          <div className="w-72 bg-[#001733] text-white p-4 flex flex-col justify-between h-full animate-in slide-in-from-left duration-200 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <FiitjeeLogo variant="white" size="sm" showTagline={false} />
                <button 
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Student info */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs">
                <div className="font-bold text-white">{student?.fullName || 'Candidate'}</div>
                <div className="text-[11px] text-amber-300">{student?.currentClass || 'Class X'}</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Centre: {student?.preferredCentreId ? student.preferredCentreId.toUpperCase() : 'Bhubaneswar'}
                </div>
              </div>

              {/* Links with sections */}
              <nav className="space-y-3">
                {navSections.map((section) => (
                  <div key={section.label} className="space-y-1">
                    <div className="text-[9px] font-black uppercase tracking-wider text-slate-500 px-1">
                      {section.label}
                    </div>
                    <div className="space-y-0.5">
                      {section.ids.map((id) => {
                        const item = navItems.find((n) => n.id === id);
                        if (!item) return null;
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleTabChange(item.id)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                              isActive ? 'bg-[#ED1C24] text-white' : 'text-slate-300 hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <span>{item.label}</span>
                            </div>
                            {item.badge && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 text-white font-mono">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Mini Centre Contact */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs">
                <div className="text-[9px] text-amber-300 font-black uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-[#ED1C24]" />
                  <span>Assigned Centre</span>
                </div>
                <div className="text-white font-bold text-[11px]">FIITJEE {activeCentreProfile.name}</div>
                <a href={`tel:${activeCentreProfile.helplinePhone}`} className="text-[10px] text-slate-300 font-mono hover:text-white mt-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#ED1C24]" />
                  {activeCentreProfile.helplinePhone}
                </a>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
              <Link to="/" className="text-slate-400 hover:text-white font-bold text-xs">
                &larr; Main Site
              </Link>
              <button
                onClick={() => { logout(); navigate('/student/login'); }}
                className="text-red-400 hover:text-red-300 font-bold cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileDrawerOpen(false)} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MAIN DASHBOARD CONTENT AREA                                            */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Desktop Action Bar */}
        <header className="hidden md:flex items-center justify-between bg-white border-b border-slate-200 px-6 sm:px-8 py-3.5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider">Candidate Portal</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            {(() => {
              const activeItem = navItems.find(n => n.id === activeTab);
              const ActiveIcon = activeItem?.icon || LayoutDashboard;
              return (
                <span className="font-extrabold text-[#002147] uppercase tracking-wider flex items-center gap-1.5">
                  <ActiveIcon className="w-3.5 h-3.5 text-[#ED1C24]" />
                  <span>{activeItem?.label || 'Dashboard'}</span>
                </span>
              );
            })()}
          </div>

          <div className="flex items-center gap-3">
            {student?.preferredCentreId && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-700 border border-slate-200">
                <Building2 className="w-3.5 h-3.5 text-[#ED1C24]" />
                <span>{CENTRE_LABELS[student.preferredCentreId] || student.preferredCentreId}</span>
              </div>
            )}

            {!isBigBangRegistered && (
              <button
                onClick={() => setIsBigBangModalOpen(true)}
                className="px-4 py-1.5 bg-[#ED1C24] hover:bg-[#d6171e] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ring-2 ring-[#ED1C24]/30 ring-offset-1 ring-offset-white hover:ring-[#ED1C24]/60"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Register for Big Bang 2026</span>
              </button>
            )}
          </div>
        </header>

        {/* Tab Content Container */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto overflow-x-hidden">

          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW DASHBOARD (Quick stats, actions, desk details)             */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Hero Banner with mesh pattern and watermark */}
              <div className="bg-[#002147] text-white p-6 sm:p-8 rounded-3xl shadow-xl border-b-4 border-[#ED1C24] relative overflow-hidden">
                {/* Background mesh grid pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                
                {/* Ghost FIITJEE watermark */}
                <div className="absolute -right-6 top-0 bottom-0 w-48 flex items-center justify-center opacity-5 pointer-events-none select-none overflow-hidden">
                  <FiitjeeLogo variant="white" size="lg" showTagline={false} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-[#ED1C24] text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-xs">
                        Candidate Admission Hub
                      </span>
                      <span className="text-amber-300 font-mono text-xs font-bold bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                        {student?.currentClass || 'Class X'}
                      </span>
                      {registeredList.length > 0 && (
                        <span className="bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Roll: {registeredList[0].rollNo}</span>
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase font-display">
                      Welcome, {student?.fullName || 'Candidate'}!
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                      Access all your FIITJEE admission tests, download verified hall tickets, review All India scores, and connect directly with your regional centre counselors.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => handleTabChange('hall-tickets')}
                      className="px-4 py-2.5 bg-white hover:bg-slate-100 text-[#002147] font-black text-xs rounded-2xl flex items-center gap-2 shadow-md cursor-pointer transition-all hover:shadow-lg"
                    >
                      <Ticket className="w-4 h-4 text-[#ED1C24]" />
                      <span>Admit Cards</span>
                    </button>
                    <button
                      onClick={() => handleTabChange('results')}
                      className="px-4 py-2.5 bg-[#ED1C24] hover:bg-[#d6171e] text-white font-black text-xs rounded-2xl flex items-center gap-2 shadow-md cursor-pointer transition-all hover:shadow-lg"
                    >
                      <Award className="w-4 h-4 text-amber-300" />
                      <span>View Results</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Metric Summary Cards with Distinct Left-Border Accents */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div 
                  onClick={() => handleTabChange('exams')}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 border-l-4 border-l-[#ED1C24] shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Registered Exams</span>
                    <div className="p-2 rounded-xl bg-red-50 text-[#ED1C24] group-hover:scale-110 transition-transform">
                      <FileText className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-[#002147]">
                    {registeredList.length}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1.5 font-semibold flex items-center gap-1 group-hover:text-[#ED1C24] transition-colors">
                    <span>View all registrations</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                <div 
                  onClick={() => handleTabChange('hall-tickets')}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 border-l-4 border-l-emerald-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Admit Cards</span>
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                      <Ticket className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-[#002147]">
                    {registeredList.length}
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-1.5 font-semibold flex items-center gap-1">
                    <span>{registeredList.length > 0 ? 'Ready to download' : 'None issued'}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                <div 
                  onClick={() => handleTabChange('results')}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 border-l-4 border-l-amber-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Scorecards</span>
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-500 group-hover:scale-110 transition-transform">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-[#002147]">
                    {Object.keys(results).length}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1.5 font-semibold flex items-center gap-1 group-hover:text-amber-600 transition-colors">
                    <span>{Object.keys(results).length > 0 ? 'Declared' : 'Awaiting publication'}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                <div 
                  onClick={() => handleTabChange('support')}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 border-l-4 border-l-blue-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Support Desk</span>
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-[#002147]">
                    {myTickets.length}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1.5 font-semibold flex items-center gap-1 group-hover:text-blue-600 transition-colors">
                    <span>{myTickets.filter(t => t.status === 'open').length} open inquiries</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Middle Row: Active Registrations & Local Centre Coordination */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left 2 Cols: Active Registrations Snapshot */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-extrabold text-[#002147] text-sm uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#ED1C24]" />
                      <span>Your Exam Registrations</span>
                    </h3>
                    <button
                      onClick={() => handleTabChange('exams')}
                      className="text-xs font-bold text-[#ED1C24] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>View All ({registeredList.length})</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {loadingExams ? (
                    <SkeletonCard rows={2} />
                  ) : registeredList.length === 0 ? (
                    <div className="py-8 text-center space-y-3">
                      <p className="text-xs text-slate-500">You haven't registered for an exam yet.</p>
                      <button
                        onClick={() => setIsBigBangModalOpen(true)}
                        className="px-4 py-2 bg-[#ED1C24] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Register for Big Bang 2026
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {registeredList.slice(0, 2).map((reg) => (
                        <div key={reg.rollNo} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 border-l-4 border-l-[#ED1C24] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-[#ED1C24] bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                                {reg.examId === 'ftre_2026' ? 'FIITJEE FTRE' : 'Big Bang Edge Test 2026'}
                              </span>
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Confirmed</span>
                              </span>
                            </div>
                            <div className="font-mono text-sm font-black text-[#002147] tracking-wider">
                              {reg.rollNo}
                            </div>
                            <div className="text-xs text-slate-600 flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {reg.testDate}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {reg.selectedCenter || 'Centre'} ({reg.testMode})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedTicketReg(reg)}
                              className="px-3.5 py-2 bg-[#002147] hover:bg-[#001733] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5 text-amber-400" />
                              <span>Hall Ticket</span>
                            </button>
                            <button
                              onClick={() => handleTabChange('results')}
                              className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                            >
                              Result
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right 1 Col: Assigned Centre Office Info with Gradient Header */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#002147] to-[#001026] -mx-6 -mt-6 px-6 pt-5 pb-4 text-white space-y-0.5 border-b border-[#ED1C24]/30">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#ED1C24]">Regional Coordination Desk</span>
                    <h3 className="font-black text-white text-base">FIITJEE {activeCentreProfile.name} Centre</h3>
                  </div>

                  <div className="space-y-3.5 text-xs text-slate-700 pt-1">
                    <div className="space-y-1">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#ED1C24]" />
                        <span>Centre Address</span>
                      </span>
                      <p className="text-slate-800 leading-relaxed font-medium pl-4">
                        {activeCentreProfile.address}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#ED1C24]" />
                        <span>Helpline Numbers</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-0.5 pl-4">
                        {activeCentreProfile.phoneNumbers.map((p, idx) => (
                          <a 
                            key={idx} 
                            href={`tel:${p.replace(/\D/g, '')}`} 
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg font-mono text-xs font-bold text-[#002147] border border-slate-200 transition-colors"
                          >
                            <Phone className="w-3 h-3 text-[#ED1C24]" />
                            <span>{p}</span>
                          </a>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>Email Inquiries</span>
                      </span>
                      <div className="font-mono text-slate-800 flex items-center gap-1.5 pl-4">
                        <a href={`mailto:${activeCentreProfile.email}`} className="hover:underline truncate text-blue-700">
                          {activeCentreProfile.email}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleTabChange('support')}
                      className="w-full py-2.5 bg-slate-100 hover:bg-[#002147] hover:text-white text-[#002147] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-[#ED1C24]" />
                      <span>Contact / Raise a Problem</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PAST & REGISTERED EXAMS                                           */}
          {/* ========================================================================= */}
          {activeTab === 'exams' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-black text-[#002147] uppercase font-display">
                    Past & Registered Entrance Examinations
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    View official roll numbers, examination slots, fee receipts, and admit cards for all applied FIITJEE admission tests.
                  </p>
                </div>

                {!isBigBangRegistered && (
                  <button
                    onClick={() => setIsBigBangModalOpen(true)}
                    className="px-4 py-2 bg-[#ED1C24] hover:bg-[#d6171e] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs self-start"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Register New Exam</span>
                  </button>
                )}
              </div>

              {loadingExams ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SkeletonCard rows={3} />
                  <SkeletonCard rows={3} />
                </div>
              ) : registeredList.length === 0 ? (
                <div className="bg-white p-10 sm:p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-4">
                  <div className="w-14 h-14 bg-red-50 text-[#ED1C24] rounded-2xl flex items-center justify-center mx-auto">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#002147] text-lg">No Exam Registrations on File</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      You have not registered for any FIITJEE admission tests yet. Register today for the Big Bang Edge Test 2026 to benchmark your rank nationally.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsBigBangModalOpen(true)}
                    className="px-6 py-2.5 bg-[#ED1C24] hover:bg-[#d6171e] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Register for Big Bang 2026</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {registeredList.map((reg, idx) => {
                    const cleanRoll = reg.rollNo ? reg.rollNo.replace(/\s+/g, '_') : '';
                    return (
                      <div 
                        key={reg.rollNo || idx} 
                        className="bg-white rounded-3xl border border-slate-200/80 border-l-4 border-l-[#ED1C24] shadow-md p-6 space-y-5 hover:border-slate-300 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className="bg-red-50 text-[#ED1C24] border border-red-200 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                              {reg.examId === 'ftre_2026' ? 'FIITJEE FTRE 2026' : 'Big Bang Edge Test 2026'}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>{reg.status || 'Confirmed'}</span>
                            </span>
                          </div>

                          {/* Roll Number Card with Copy Tooltip */}
                          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Official Roll Number</div>
                              <div className="text-sm sm:text-base font-black font-mono text-[#002147] tracking-wider">
                                {reg.rollNo}
                              </div>
                            </div>
                            <div className="relative">
                              <button
                                onClick={() => handleCopyRoll(reg.rollNo)}
                                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                                title="Copy Roll Number"
                              >
                                {copiedRoll === reg.rollNo ? (
                                  <Check className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                              {copiedRoll === reg.rollNo && (
                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shadow-md animate-in fade-in zoom-in-75 duration-150 z-10">
                                  Copied!
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="space-y-0.5">
                              <div className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Test Date</span>
                              </div>
                              <div className="font-bold text-slate-800">{reg.testDate}</div>
                            </div>

                            <div className="space-y-0.5">
                              <div className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>Centre & Mode</span>
                              </div>
                              <div className="font-bold text-slate-800">
                                {reg.selectedCenter || 'Centre'} ({reg.testMode})
                              </div>
                            </div>

                            <div className="space-y-0.5">
                              <div className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1">
                                <CreditCard className="w-3 h-3" />
                                <span>Payment Status</span>
                              </div>
                              <div className="font-bold text-emerald-600 uppercase">
                                {reg.paymentStatus === 'free' ? 'Fee Waived (Coupon)' : reg.paymentStatus === 'paid' ? `Paid (₹${reg.paymentAmount || 1})` : 'Pending'}
                              </div>
                            </div>

                            <div className="space-y-0.5">
                              <div className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Enrolled On</span>
                              </div>
                              <div className="font-medium text-slate-600">
                                {reg.registeredAt ? new Date(reg.registeredAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Active'}
                              </div>
                            </div>
                          </div>

                          {/* Invoice / Tags */}
                          {(reg.invoiceNo || reg.couponCodeApplied || reg.sid) && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {reg.invoiceNo && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                                  <Hash className="w-3 h-3 text-slate-400" />
                                  <span>Inv: {reg.invoiceNo}</span>
                                </span>
                              )}
                              {reg.couponCodeApplied && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
                                  <Tag className="w-3 h-3 text-amber-600" />
                                  <span>Coupon: {reg.couponCodeApplied}</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                          <button
                            onClick={() => setSelectedTicketReg(reg)}
                            className="flex-1 py-2.5 bg-[#002147] hover:bg-[#001733] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                          >
                            <Printer className="w-4 h-4 text-amber-400" />
                            <span>Print Hall Ticket</span>
                          </button>

                          <button
                            onClick={() => handleTabChange('results')}
                            className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            View Result
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: DOWNLOAD HALL TICKETS (Dedicated Admit Card Download Center)        */}
          {/* ========================================================================= */}
          {activeTab === 'hall-tickets' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="border-b border-slate-200 pb-4">
                <div className="inline-flex items-center gap-1.5 bg-red-50 text-[#ED1C24] border border-red-200 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2">
                  <Ticket className="w-3 h-3" />
                  <span>Official Admit Card Portal</span>
                </div>
                <h2 className="text-xl font-black text-[#002147] uppercase font-display">
                  Download Official Examination Hall Tickets
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Print your verified A4 hall ticket with official QR verification, tax invoice receipt, and reporting protocols.
                </p>

                {/* Candidate protocol informational ribbon */}
                <div className="mt-3.5 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">
                    <strong>Mandatory Candidate Instruction:</strong> Print at least <strong>2 copies on clean A4 paper</strong>. Affix a recent passport-size photograph in the designated box before reaching the examination venue. Bring an original photo ID (School ID or Aadhaar Card) for security verification.
                  </span>
                </div>
              </div>

              {loadingExams ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SkeletonCard rows={3} />
                  <SkeletonCard rows={3} />
                </div>
              ) : registeredList.length === 0 ? (
                <div className="bg-white p-10 sm:p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-4">
                  <div className="w-14 h-14 bg-red-50 text-[#ED1C24] rounded-2xl flex items-center justify-center mx-auto">
                    <Ticket className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#002147] text-lg">No Hall Tickets Available</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Hall tickets are generated instantly upon exam registration. Register for Big Bang Edge Test 2026 to obtain your official hall ticket.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsBigBangModalOpen(true)}
                    className="px-6 py-2.5 bg-[#ED1C24] hover:bg-[#d6171e] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Register to Generate Admit Card</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {registeredList.map((reg) => {
                    const cleanRoll = reg.rollNo ? reg.rollNo.replace(/\s+/g, '_') : '';
                    return (
                      <div 
                        key={reg.rollNo}
                        className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-5 relative overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all"
                      >
                        <div className="space-y-4">
                          {/* Top Ribbon */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="p-2 bg-red-50 text-[#ED1C24] rounded-xl">
                                <Ticket className="w-5 h-5" />
                              </span>
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-[#ED1C24]">Official Admit Card</span>
                                <div className="text-sm font-black text-[#002147]">Big Bang Edge Test 2026</div>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Verified & Ready</span>
                            </span>
                          </div>

                          {/* Physical Admit Card Preview Box */}
                          <div className="border-2 border-dashed border-[#002147]/20 rounded-2xl overflow-hidden bg-slate-50/50 shadow-2xs">
                            {/* Card Header Ribbon */}
                            <div className="bg-[#002147] px-4 py-2.5 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FiitjeeLogo variant="white" size="sm" showTagline={false} />
                              </div>
                              <div className="text-right">
                                <span className="text-[9px] text-amber-300 font-black uppercase tracking-wider block">Official Hall Ticket</span>
                                <span className="text-white text-[10px] font-mono">Slot: {reg.testDate}</span>
                              </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-4 grid grid-cols-3 gap-3 bg-white">
                              {/* Left 2 Cols: Details */}
                              <div className="col-span-2 space-y-2.5">
                                <div>
                                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Candidate Name</div>
                                  <div className="font-black text-[#002147] text-sm uppercase">{reg.studentName}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase">Roll Number</div>
                                    <div className="font-mono font-black text-[#ED1C24] text-xs">{reg.rollNo}</div>
                                  </div>
                                  <div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase">Class Grade</div>
                                    <div className="font-bold text-slate-800 text-xs">{reg.currentClass}</div>
                                  </div>
                                  <div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase">Exam Mode</div>
                                    <div className="font-bold text-slate-800 text-xs">{reg.testMode}</div>
                                  </div>
                                  <div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase">Assigned Centre</div>
                                    <div className="font-bold text-slate-800 text-xs truncate">{reg.selectedCenter || 'Centre'}</div>
                                  </div>
                                </div>
                              </div>

                              {/* Right 1 Col: Photo & QR Placeholders */}
                              <div className="flex flex-col items-center justify-between border-l border-dashed border-slate-200 pl-3 gap-2">
                                <div className="w-16 h-20 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 flex flex-col items-center justify-center text-center p-1 text-slate-400">
                                  <User className="w-5 h-5 text-slate-300 mb-0.5" />
                                  <span className="text-[7px] font-bold uppercase leading-tight">Affix Photo</span>
                                </div>
                                <div className="w-14 h-14 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-center p-1">
                                  <div className="grid grid-cols-3 gap-0.5 opacity-40">
                                    {[1,0,1,0,1,0,1,1,0].map((v, i) => (
                                      <div key={i} className={`w-2.5 h-2.5 rounded-[1px] ${v ? 'bg-slate-900' : 'bg-slate-200'}`} />
                                    ))}
                                  </div>
                                </div>
                                <span className="text-[7px] text-slate-400 font-mono">QR Gate Check</span>
                              </div>
                            </div>

                            {/* Preview Footer note */}
                            <div className="bg-slate-50 px-3.5 py-1.5 border-t border-dashed border-slate-200 text-[9px] text-slate-500 font-medium">
                              ⚠ Preview summary. Click Print Admit Card for the full official PDF format.
                            </div>
                          </div>

                          {/* Instructions */}
                          <div className="text-[11px] text-slate-500 space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Must carry 2 printed copies to test centre with photo affixed.</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Includes official Tax Invoice receipt for your records.</span>
                            </div>
                          </div>
                        </div>

                        {/* Print & Download Buttons */}
                        <div className="pt-2 flex items-center gap-2">
                          <button
                            onClick={() => setSelectedTicketReg(reg)}
                            className="flex-1 py-3 bg-[#ED1C24] hover:bg-[#d6171e] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all hover:shadow-lg"
                          >
                            <Printer className="w-4 h-4" />
                            <span>Print / Download Admit Card</span>
                          </button>

                          <a
                            href={`/hall-ticket/${cleanRoll}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-3 border border-slate-300 hover:bg-slate-100 rounded-xl text-slate-700 transition-colors"
                            title="Open in new window"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: RESULT CARDS & RANK BENCHMARKING (Dedicated Results Portal)         */}
          {/* ========================================================================= */}
          {activeTab === 'results' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="border-b border-slate-200 pb-4">
                <div className="inline-flex items-center gap-1.5 bg-red-50 text-[#ED1C24] border border-red-200 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2">
                  <Award className="w-3 h-3" />
                  <span>National Scholastic Scorecards</span>
                </div>
                <h2 className="text-xl font-black text-[#002147] uppercase font-display">
                  Official Examination Results & Diagnostic Ranks
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review All India Ranks (AIR), scholastic percentile, subject performance analysis, and scholarship fee waiver tiers.
                </p>
              </div>

              {loadingResults ? (
                <div className="space-y-6">
                  <SkeletonCard rows={3} />
                </div>
              ) : registeredList.length === 0 ? (
                <div className="bg-white p-10 sm:p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-3">
                  <Award className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="font-extrabold text-[#002147] text-base">No Exam Registrations Found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Scorecards are linked to your official roll number. Register for Big Bang Edge Test 2026 to benchmark your rank.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {registeredList.map((reg) => {
                    const examResult = results[reg.rollNo];

                    return (
                      <div 
                        key={reg.rollNo} 
                        className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6"
                      >
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#ED1C24] bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                              Diagnostic Assessment Result
                            </span>
                            <h3 className="text-lg font-black text-[#002147] mt-1 uppercase">
                              Big Bang Edge Test 2026 Scorecard
                            </h3>
                            <div className="text-xs text-slate-500 font-mono mt-0.5">
                              Roll: <strong className="text-slate-800">{reg.rollNo}</strong> • Slot: {reg.testDate}
                            </div>
                          </div>

                          <div>
                            {examResult ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Official Result Declared</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-bold border border-amber-200">
                                <Clock className="w-4 h-4 text-amber-600" />
                                <span>Results Scheduled Post-Evaluation</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Result Content */}
                        {examResult ? (
                          <div className="space-y-6">
                            {/* Score Metrics Grid with SVG Progress Ring & Styled Badges */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              
                              {/* Marks with Circular Progress Ring */}
                              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-2">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Marks & Accuracy</div>
                                <div className="relative w-24 h-24 my-1">
                                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
                                    <circle cx="40" cy="40" r="32" fill="none" stroke="#e2e8f0" strokeWidth="7" />
                                    <circle
                                      cx="40" cy="40" r="32" fill="none"
                                      stroke="#002147" strokeWidth="7"
                                      strokeLinecap="round"
                                      strokeDasharray={`${2 * Math.PI * 32}`}
                                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - Math.min(1, Math.max(0, (examResult.marksObtained || 0) / (examResult.totalMarks || 1))))}`}
                                      className="transition-all duration-1000"
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xl font-black text-[#002147] leading-none">{examResult.marksObtained}</span>
                                    <span className="text-[9px] text-slate-400 font-bold">/ {examResult.totalMarks}</span>
                                  </div>
                                </div>
                                <div className="text-[11px] font-semibold text-slate-600">
                                  Score: {Math.round(((examResult.marksObtained || 0) / (examResult.totalMarks || 1)) * 100)}%
                                </div>
                              </div>

                              {/* AIR Standing */}
                              <div className="bg-gradient-to-br from-red-50 to-orange-50 p-5 rounded-2xl border border-red-200 flex flex-col justify-between space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-[#ED1C24] uppercase tracking-wider">Diagnostic Standing</span>
                                  <div className="p-1.5 rounded-lg bg-red-100/80 text-[#ED1C24]">
                                    <Award className="w-4 h-4" />
                                  </div>
                                </div>
                                <div>
                                  <div className="text-3xl sm:text-4xl font-black text-[#ED1C24] tabular-nums tracking-tight">
                                    {examResult.allIndiaRank ? `#${examResult.allIndiaRank}` : 'In Progress'}
                                  </div>
                                  <div className="text-xs font-bold text-slate-700 mt-1">
                                    All India Rank (AIR)
                                  </div>
                                </div>
                                <div className="text-[11px] text-slate-500 font-medium pt-1 border-t border-red-200/60">
                                  {examResult.percentile ? `${examResult.percentile} Percentile Nationwide` : 'National Rank Benchmark'}
                                </div>
                              </div>

                              {/* Scholarship Award */}
                              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-200 flex flex-col justify-between space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Scholarship Award</span>
                                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                                    <Sparkles className="w-4 h-4" />
                                  </div>
                                </div>
                                <div>
                                  <div className="text-base sm:text-lg font-black text-emerald-900 leading-snug">
                                    {examResult.scholarshipTier || 'Merit Waiver Qualified'}
                                  </div>
                                  <div className="text-xs text-emerald-800 mt-1 font-semibold">
                                    Official Fee Concession
                                  </div>
                                </div>
                                <div className="text-[11px] text-emerald-700 font-medium pt-1 border-t border-emerald-200/60 flex items-center gap-1">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>Redeemable across all 4 FIITJEE hubs</span>
                                </div>
                              </div>
                            </div>

                            {/* Subject Breakdown with Visual Progress Bars */}
                            {examResult.subjectBreakdown && Object.keys(examResult.subjectBreakdown).length > 0 && (
                              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                  <BookOpen className="w-4 h-4 text-slate-500" />
                                  <span>Subject-wise Diagnostic Breakdown</span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  {Object.entries(examResult.subjectBreakdown).map(([subj, data]: [string, any]) => {
                                    const pct = Math.round(((data.marks || 0) / (data.max || 1)) * 100);
                                    return (
                                      <div key={subj} className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                                        <div className="flex items-center justify-between">
                                          <div className="text-[11px] font-bold text-slate-600 uppercase">{subj}</div>
                                          <div className="text-sm font-black font-mono text-[#002147]">
                                            {data.marks} <span className="text-xs font-normal text-slate-400">/ {data.max}</span>
                                          </div>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                          <div
                                            className="h-full bg-gradient-to-r from-[#002147] to-[#ED1C24] rounded-full transition-all duration-700"
                                            style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                                          />
                                        </div>
                                        <div className="text-[9px] text-slate-400 text-right font-mono font-semibold">
                                          {pct}% Score
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-8 border-2 border-dashed border-amber-300 bg-amber-50/50 rounded-3xl space-y-4 text-center">
                            <div className="w-14 h-14 bg-amber-100/80 rounded-2xl flex items-center justify-center mx-auto text-amber-700 shadow-xs">
                              <Clock className="w-7 h-7" />
                            </div>
                            <div className="max-w-md mx-auto space-y-1">
                              <h4 className="font-black text-[#002147] text-base uppercase">
                                Results Scheduled Post-Evaluation
                              </h4>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                Evaluation for Big Bang Edge Test 2026 takes place after test completion on 11th &amp; 18th October 2026. Your official marks, All India Rank (AIR), and scholarship voucher will be automatically published here.
                              </p>
                            </div>
                            <div className="pt-2">
                              <button
                                onClick={() => handleTabChange('support')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                              >
                                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                                <span>Have Questions? Raise Problem with Centre</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: RAISE PROBLEM / SUPPORT DESK (Grievance submission & replies)       */}
          {/* ========================================================================= */}
          {activeTab === 'support' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-4xl mx-auto">
              <div className="border-b border-slate-200 pb-4">
                <div className="inline-flex items-center gap-1.5 bg-red-50 text-[#ED1C24] border border-red-200 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2">
                  <HelpCircle className="w-3 h-3" />
                  <span>Student Support & Grievance Desk</span>
                </div>
                <h2 className="text-xl font-black text-[#002147] uppercase font-display">
                  Raise a Problem with your Centre
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Have an inquiry regarding hall tickets, exam slots, fee payment, or results? Submit a ticket directly to your local FIITJEE centre counseling team.
                </p>
              </div>

              {/* Submit Ticket Card */}
              <div className="bg-white rounded-3xl border border-slate-200/80 border-l-4 border-l-[#ED1C24] shadow-md p-6 sm:p-8 space-y-5">
                <div className="space-y-2">
                  <h3 className="text-base font-black text-[#002147] uppercase font-display">
                    File a New Support Ticket
                  </h3>
                  
                  {/* Routing status bar with live pulse */}
                  <div className="flex items-center gap-2 px-3.5 py-2 bg-[#002147]/5 border border-[#002147]/10 rounded-xl text-xs font-bold text-[#002147]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span>Routing directly to: <strong>FIITJEE {activeCentreProfile.name} Desk</strong> ({activeCentreProfile.helplinePhone})</span>
                  </div>
                </div>

                {ticketSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2.5 animate-in fade-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold">Support Ticket Submitted Successfully!</div>
                      <div className="text-[11px] text-emerald-700">Your grievance has been logged with FIITJEE {activeCentreProfile.name} Centre. Track responses below.</div>
                    </div>
                  </div>
                )}

                {ticketError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#ED1C24] shrink-0" />
                    <span className="font-semibold">{ticketError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Issue Category *
                    </label>
                    <select 
                      required 
                      value={ticketForm.category} 
                      onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#002147]/40 outline-none cursor-pointer"
                    >
                      <option value="">— Select issue type —</option>
                      <option value="Hall Ticket Issue">Hall Ticket Not Generating / Name Discrepancy</option>
                      <option value="Payment Issue">Payment Debited / Transaction Confirmation</option>
                      <option value="Slot / Centre Change">Change in Exam Hub / Test Mode Request</option>
                      <option value="Roll Number Query">Roll Number Query / Exam Slot</option>
                      <option value="Result Query">Result Card / Score Clarification</option>
                      <option value="Counseling Request">Course Counseling & Faculty Appointment</option>
                      <option value="Other">Other Academic / Administrative Query</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Subject / Summary *
                    </label>
                    <input 
                      type="text" 
                      required 
                      maxLength={100} 
                      placeholder="e.g. Hall Ticket displays incorrect class grade"
                      value={ticketForm.subject} 
                      onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#002147]/40 outline-none placeholder:text-slate-400" 
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Detailed Explanation *
                    </label>
                    <textarea 
                      required 
                      rows={4} 
                      maxLength={1000} 
                      placeholder="Please explain the issue in detail, including roll number, payment reference, or registration date if applicable..."
                      value={ticketForm.description} 
                      onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#002147]/40 outline-none resize-none placeholder:text-slate-400" 
                    />
                    <div className="text-[10px] text-slate-400 text-right mt-0.5 font-mono">
                      {ticketForm.description.length}/1000 characters
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">
                      Submitting as: <strong className="text-slate-700">{student?.fullName}</strong>
                    </span>

                    <button 
                      type="submit" 
                      disabled={submittingTicket}
                      className="px-6 py-2.5 bg-[#ED1C24] hover:bg-[#d6171e] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50 hover:shadow-lg"
                    >
                      {submittingTicket ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>Send to Centre Team &rarr;</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Submitted Tickets Tracker */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <span>Your Support Inquiries ({myTickets.length})</span>
                </h3>

                {loadingTickets ? (
                  <SkeletonCard rows={2} />
                ) : myTickets.length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center space-y-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-700 text-sm">No Support Inquiries Yet</div>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Have a question regarding exam dates, roll numbers, or scorecards? File a ticket above and your centre counseling team will respond promptly.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myTickets.map((ticket) => {
                      const statusConfig: Record<string, { bg: string; icon: React.ReactNode; label: string }> = {
                        resolved: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Resolved' },
                        closed: { bg: 'bg-slate-100 text-slate-600 border-slate-200', icon: <Check className="w-3 h-3" />, label: 'Closed' },
                        in_progress: { bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: <Clock className="w-3 h-3" />, label: 'In Progress' },
                        open: { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: <AlertCircle className="w-3 h-3" />, label: 'Awaiting Response' }
                      };
                      const cfg = statusConfig[ticket.status] || statusConfig['open'];

                      return (
                        <div 
                          key={ticket.ticketId} 
                          className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs hover:border-slate-300 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                {ticket.category}
                              </span>
                              <h5 className="text-sm font-black text-[#002147] mt-0.5">
                                {ticket.subject}
                              </h5>
                            </div>

                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${cfg.bg}`}>
                              {cfg.icon}
                              <span>{cfg.label}</span>
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100 whitespace-pre-wrap">
                            {ticket.description}
                          </p>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                            <span>Submitted: {new Date(ticket.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                            {ticket.rollNo && (
                              <span className="font-mono font-bold text-slate-600">Roll: {ticket.rollNo}</span>
                            )}
                          </div>

                          {/* Centre Admin Reply in Chat Bubble Format */}
                          {ticket.adminReply && (
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#002147] text-white flex items-center justify-center text-xs font-black shrink-0 ring-2 ring-[#002147]/20 shadow-xs">
                                F
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="text-xs font-black text-[#002147]">FIITJEE {activeCentreProfile.name} Desk</span>
                                  {ticket.adminRepliedBy && (
                                    <span className="text-[10px] text-slate-400 font-medium">({ticket.adminRepliedBy})</span>
                                  )}
                                  {ticket.adminRepliedAt && (
                                    <span className="text-[10px] text-slate-400 font-mono ml-auto">
                                      {new Date(ticket.adminRepliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  )}
                                </div>
                                <div className="bg-[#002147]/5 border border-[#002147]/10 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
                                  {ticket.adminReply}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: STUDENT PROFILE (CRUD details, editable, centre affiliation)       */}
          {/* ========================================================================= */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-4xl mx-auto">
              <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-[#002147] uppercase font-display">
                    Academic Profile & Registration Details
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage your student bio, current school, registered centre hub, and contact information.
                  </p>
                </div>

                {!editingProfile && (
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="px-4 py-2 bg-[#002147] hover:bg-[#001733] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
                  >
                    Edit Profile Details
                  </button>
                )}
              </div>

              {saveSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">Profile details and centre affiliation updated successfully!</span>
                </div>
              )}

              {saveError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#ED1C24] shrink-0" />
                  <span className="font-semibold">{saveError}</span>
                </div>
              )}

              {editingProfile ? (
                <div className="bg-white rounded-3xl border border-slate-200/80 border-t-4 border-t-[#ED1C24] shadow-md p-6 sm:p-8 space-y-6">
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={profileForm.fullName}
                          onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs uppercase font-bold outline-none focus:ring-2 focus:ring-[#002147]/40"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Parent / Guardian Name *</label>
                        <input
                          type="text"
                          required
                          value={profileForm.parentName}
                          onChange={(e) => setProfileForm({ ...profileForm, parentName: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs uppercase font-bold outline-none focus:ring-2 focus:ring-[#002147]/40"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Mobile Phone (10 Digits) *</label>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value.replace(/\D/g, '') })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-[#002147]/40"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Current Academic Class *</label>
                        <select
                          value={profileForm.currentClass}
                          onChange={(e) => setProfileForm({ ...profileForm, currentClass: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#002147]/40 cursor-pointer"
                        >
                          <option value="Class V">Class V (Going to VI)</option>
                          <option value="Class VI">Class VI (Going to VII)</option>
                          <option value="Class VII">Class VII (Going to VIII)</option>
                          <option value="Class VIII">Class VIII (Going to IX)</option>
                          <option value="Class IX">Class IX (Going to X)</option>
                          <option value="Class X">Class X (Going to XI)</option>
                          <option value="Class XI">Class XI (Going to XII)</option>
                          <option value="Class XII">Class XII / Dropper</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">School Name *</label>
                      <input
                        type="text"
                        required
                        value={profileForm.schoolName}
                        onChange={(e) => setProfileForm({ ...profileForm, schoolName: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#002147]/40"
                      />
                    </div>

                    {/* Preferred FIITJEE Centre */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Preferred / Nearest FIITJEE Centre
                      </label>
                      <select
                        value={profileForm.preferredCentreId}
                        onChange={(e) => setProfileForm({ ...profileForm, preferredCentreId: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#002147]/40 cursor-pointer"
                      >
                        <option value="">— Select your nearest centre —</option>
                        <option value="bhubaneswar">FIITJEE Bhubaneswar (Odisha)</option>
                        <option value="dwarka">FIITJEE Dwarka (New Delhi)</option>
                        <option value="ranchi">FIITJEE Ranchi (Jharkhand)</option>
                        <option value="hyderabad">FIITJEE Hyderabad (Telangana)</option>
                      </select>
                      <p className="text-[10px] text-slate-400 mt-1">Changes are synced with the regional centre administrator immediately.</p>
                    </div>

                    {/* Postal Address */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">City</label>
                        <input
                          type="text"
                          placeholder="e.g. Bhubaneswar"
                          value={profileForm.city}
                          onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#002147]/40"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">State</label>
                        <input
                          type="text"
                          placeholder="e.g. Odisha"
                          value={profileForm.state}
                          onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#002147]/40"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">PIN Code</label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="e.g. 751024"
                          value={profileForm.pincode}
                          onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value.replace(/\D/g, '') })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-medium outline-none focus:ring-2 focus:ring-[#002147]/40"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="px-6 py-2.5 bg-[#ED1C24] hover:bg-[#d6171e] text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50 transition-all shadow-xs"
                      >
                        {savingProfile ? 'Saving Changes...' : 'Save Changes &rarr;'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProfile(false)}
                        className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold cursor-pointer text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6 overflow-hidden">
                  {/* Top Profile Summary Header */}
                  <div className="bg-gradient-to-r from-[#002147] to-[#001026] -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#ED1C24]/30">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ED1C24] to-[#990000] text-white flex items-center justify-center font-black text-2xl shadow-lg ring-4 ring-white/20 shrink-0">
                        {student?.fullName ? student.fullName.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black text-white uppercase tracking-tight font-display">{student?.fullName || 'Candidate'}</h3>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Verified
                          </span>
                        </div>
                        <div className="text-amber-300 text-xs font-bold">{student?.currentClass || 'Class X'} • {student?.schoolName || 'School'}</div>
                        <div className="text-slate-400 text-[11px] font-mono">{student?.email}</div>
                      </div>
                    </div>

                    <div className="sm:text-right bg-white/5 p-3 rounded-xl border border-white/10 sm:bg-transparent sm:p-0 sm:border-0">
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Affiliated Centre</div>
                      <div className="text-white text-xs font-black mt-0.5">
                        {student?.preferredCentreId ? CENTRE_LABELS[student.preferredCentreId] || student.preferredCentreId : 'Bhubaneswar (Default)'}
                      </div>
                    </div>
                  </div>

                  {/* Tile Grid with Lucide icons and left border accent colors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 border-l-4 border-l-[#002147]">
                      <div className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#002147]" />
                        <span>Candidate Full Name</span>
                      </div>
                      <div className="font-black text-[#002147] text-sm mt-1">{student?.fullName || 'Not set'}</div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 border-l-4 border-l-[#002147]">
                      <div className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#002147]" />
                        <span>Parent / Guardian Name</span>
                      </div>
                      <div className="font-bold text-slate-800 text-sm mt-1">{student?.parentName || 'Not set'}</div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 border-l-4 border-l-[#ED1C24]">
                      <div className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#ED1C24]" />
                        <span>Registered Email (Auth ID)</span>
                      </div>
                      <div className="font-bold text-slate-800 font-mono mt-1">{student?.email || 'Not set'}</div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 border-l-4 border-l-[#ED1C24]">
                      <div className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#ED1C24]" />
                        <span>Mobile Number</span>
                      </div>
                      <div className="font-bold text-slate-800 font-mono mt-1">{student?.phone || 'Not set'}</div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 border-l-4 border-l-amber-500">
                      <div className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Present Academic Class</span>
                      </div>
                      <div className="font-black text-[#ED1C24] text-sm mt-1">{student?.currentClass || 'Class X'}</div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 border-l-4 border-l-amber-500">
                      <div className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1.5">
                        <School className="w-3.5 h-3.5 text-amber-500" />
                        <span>School Name</span>
                      </div>
                      <div className="font-bold text-slate-800 mt-1">{student?.schoolName || 'Not specified'}</div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 border-l-4 border-l-blue-500">
                      <div className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-500" />
                        <span>Preferred FIITJEE Centre</span>
                      </div>
                      <div className="font-bold text-[#002147] mt-1">
                        {student?.preferredCentreId ? CENTRE_LABELS[student.preferredCentreId] || student.preferredCentreId : 'Not set'}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 border-l-4 border-l-slate-400">
                      <div className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>Postal Location</span>
                      </div>
                      <div className="font-bold text-slate-800 mt-1">
                        {[student?.city, student?.state, student?.pincode].filter(Boolean).join(', ') || 'Not specified'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: AVAILABLE TESTS (Big Bang & FTRE with 1-click apply)               */}
          {/* ========================================================================= */}
          {activeTab === 'available' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="border-b border-slate-200 pb-4">
                <div className="inline-flex items-center gap-1.5 bg-red-50 text-[#ED1C24] border border-red-200 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2">
                  <Sparkles className="w-3 h-3" />
                  <span>National Admissions 2026</span>
                </div>
                <h2 className="text-xl font-black text-[#002147] uppercase font-display">
                  Available Admission & Scholarship Tests
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pre-filled application with your saved student profile for instant hall ticket generation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Big Bang Card */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="bg-[#ED1C24] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                        Spotlight Admission Exam
                      </span>
                      <span className="text-xs font-bold text-amber-600 font-mono">2026 Edition</span>
                    </div>
                    <h3 className="text-xl font-black text-[#002147] uppercase font-display">
                      FIITJEE Big Bang Edge Test 2026
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      A 360° diagnostic examination of scholastic aptitude, analytical potential & All India rank benchmarking across 4 major hubs.
                    </p>

                    <div className="space-y-1.5 pt-2 text-xs text-slate-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#ED1C24]" />
                        <span><strong>Exam Dates:</strong> 11th & 18th October 2026 (Sunday)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-[#ED1C24]" />
                        <span><strong>Target Classes:</strong> Class V, VI, VII, VIII, IX, X, XI</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#ED1C24]" />
                        <span><strong>Exam Hubs:</strong> Bhubaneswar, Dwarka, Ranchi, Hyderabad</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#ED1C24]" />
                        <span><strong>Test Fee:</strong> ₹1 (Testing Window)</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    {isBigBangRegistered ? (
                      <button
                        onClick={() => handleTabChange('hall-tickets')}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-[#002147] rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Already Registered • Download Hall Ticket</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsBigBangModalOpen(true)}
                        className="w-full py-2.5 bg-[#ED1C24] hover:bg-[#d6171e] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Register Now (Pre-filled Profile)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* FTRE Card */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="bg-[#002147] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                        Scholarship Test
                      </span>
                      <span className="text-xs font-bold text-slate-500 font-mono">Annual National Test</span>
                    </div>
                    <h3 className="text-xl font-black text-[#002147] uppercase font-display">
                      FTRE 2026-27 (Talent Reward Exam)
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      India’s premier scholarship exam offering up to 100% tuition fee waiver, hostel fee assistance, and cash scholarships.
                    </p>

                    <div className="space-y-1.5 pt-2 text-xs text-slate-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#002147]" />
                        <span><strong>Exam Period:</strong> December 2026</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#002147]" />
                        <span><strong>Scholarships:</strong> Up to 100% Tuition Fee Waiver</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-[#002147]" />
                        <span><strong>Eligible:</strong> Class V to XI students</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setIsFtreModalOpen(true)}
                      className="w-full py-2.5 bg-[#002147] hover:bg-[#001733] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                    >
                      <span>Apply for FTRE Scholarship</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 8: EXAM SCHEDULE & GUIDELINES                                        */}
          {/* ========================================================================= */}
          {activeTab === 'schedule' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-[#002147] uppercase font-display">
                  Examination Day Protocols & Timings
                </h2>
                <p className="text-xs text-slate-500">
                  Official instructions for {student?.currentClass || 'Class X'} candidates taking Big Bang Edge Test 2026.
                </p>
              </div>

              {/* Timings card */}
              <div className="bg-red-50 border border-red-200 p-5 rounded-2xl space-y-2">
                <div className="text-xs font-bold text-[#ED1C24] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>Exam Schedule for {student?.currentClass || 'Class X'}</span>
                </div>
                <div className="text-xs font-semibold text-slate-800 leading-relaxed">
                  {getExamScheduleForClass(student?.currentClass || 'Class X')}
                </div>
              </div>

              {/* Bullet guidelines */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Mandatory Exam Day Checklist</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                  <div className="flex items-start gap-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-[#ED1C24] shrink-0 mt-0.5" />
                    <span>Carry 2 printed copies of the Official Hall Ticket with candidate photograph affixed.</span>
                  </div>
                  <div className="flex items-start gap-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-[#ED1C24] shrink-0 mt-0.5" />
                    <span>Carry original School ID card or Aadhaar Card as proof of identity.</span>
                  </div>
                  <div className="flex items-start gap-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-[#ED1C24] shrink-0 mt-0.5" />
                    <span>Report at test centre 30 minutes prior to Paper 1 commencement (8:30 AM).</span>
                  </div>
                  <div className="flex items-start gap-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-[#ED1C24] shrink-0 mt-0.5" />
                    <span>Only Blue / Black ballpoint pens permitted. Electronic calculators or smart watches strictly prohibited.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Official Hall Ticket Modal */}
      {selectedTicketReg && (
        <HallTicketModal
          isOpen={true}
          onClose={() => setSelectedTicketReg(null)}
          registration={selectedTicketReg}
        />
      )}

      {/* Big Bang Registration Modal */}
      <BigBangRegistrationModal
        isOpen={isBigBangModalOpen}
        onClose={() => setIsBigBangModalOpen(false)}
      />

      {/* FTRE Modal */}
      <FtreRegistrationModal
        isOpen={isFtreModalOpen}
        onClose={() => setIsFtreModalOpen(false)}
      />
    </div>
  );
};
