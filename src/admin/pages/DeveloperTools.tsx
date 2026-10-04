import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Terminal, 
  Cpu, 
  Trash2, 
  RefreshCw, 
  Search, 
  Database, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Plus, 
  Edit3, 
  Layers, 
  ExternalLink,
  CreditCard,
  Building2,
  Calendar,
  User,
  Tag,
  Hash,
  ArrowRight,
  MapPin,
  Lock,
  ChevronRight,
  Download,
  Filter,
  CheckSquare,
  Square,
  Copy,
  FileText,
  HelpCircle,
  Send,
  X,
  Settings,
  Activity,
  Phone,
  Mail,
  BookOpen,
  Award,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { 
  assertDeveloper, 
  isDeveloperEmail, 
  deregisterCandidateExam, 
  updateRegistrationFieldDirect, 
  migrateRegistrationCentre, 
  seedTestRegistration, 
  purgeCandidateRegistration,
  fetchAllRegistrations,
  createRegistrationDirect,
  updateRegistrationFull,
  duplicateRegistration,
  batchUpdatePaymentStatus,
  fetchAllStudents,
  updateStudentProfileDirect,
  deleteStudentProfileDirect,
  unlinkStudentExam,
  fetchAllCoupons,
  saveCouponDirect,
  deleteCouponDirect,
  resetCouponUsesDirect,
  fetchAllSupportTickets,
  updateSupportTicketDirect,
  deleteSupportTicketDirect,
  fetchSystemDiagnosticStats,
  purgeAllTestData,
  inspectRtdbPath,
  writeRtdbPath,
  deleteRtdbPath,
  DEVELOPER_EMAIL,
  EnrichedRegistration,
  EnrichedTicket,
  DiagnosticStats
} from '../utils/developerUtils';
import { ALL_CENTRES, CENTRES_CONFIG, getRegistrationFeeForClass, BIG_BANG_CLASSES, getClassOption, resolveCanonicalCentreId } from '../utils/centreUtils';
import { ExamRegistration, StudentProfile, CouponProfile, SupportTicket } from '../../types';
import { getCentreExamById, saveCentreExam, DEFAULT_CENTRE_EXAMS, CentreExamConfig } from '../utils/examUtils';

export const DeveloperTools: React.FC = () => {
  const navigate = useNavigate();
  const { user, isDeveloper } = useAdminAuth();
  const actorEmail = user?.email || DEVELOPER_EMAIL;

  // Tabs: registrations (expanded), students, coupons, exams, tickets, diagnostics/rtdb
  const [activeTab, setActiveTab] = useState<'registrations' | 'students' | 'coupons' | 'exams' | 'tickets' | 'rtdb'>('registrations');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Clear feedback after 5s
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // =========================================================================
  // TAB 1: REGISTRATIONS STATE & ADVANCED MULTI-FIELD SEARCH & FILTERS
  // =========================================================================
  const [registrations, setRegistrations] = useState<EnrichedRegistration[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState<boolean>(false);

  // Multi-Field Search Inputs
  const [filterSearch, setFilterSearch] = useState<string>('');
  const [filterCentre, setFilterCentre] = useState<string>('ALL');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterPayment, setFilterPayment] = useState<string>('ALL');
  const [filterMode, setFilterMode] = useState<string>('ALL');
  const [filterDate, setFilterDate] = useState<string>('ALL');
  const [filterPreset, setFilterPreset] = useState<'all' | 'paid' | 'pending' | 'free' | 'recent' | 'mock'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'roll'>('newest');

  // Batch Selection
  const [selectedRolls, setSelectedRolls] = useState<Set<string>>(new Set());

  // Registration Modals State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingCandidate, setEditingCandidate] = useState<EnrichedRegistration | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ExamRegistration> & { targetCentreId?: string }>({});

  // New Registration Form State
  const [newRegCentre, setNewRegCentre] = useState<string>('bhubaneswar');
  const [newRegName, setNewRegName] = useState<string>('');
  const [newRegParent, setNewRegParent] = useState<string>('');
  const [newRegEmail, setNewRegEmail] = useState<string>('');
  const [newRegPhone, setNewRegPhone] = useState<string>('');
  const [newRegClass, setNewRegClass] = useState<string>(BIG_BANG_CLASSES[5].label);
  const [newRegSchool, setNewRegSchool] = useState<string>('Delhi Public School');
  const [newRegMode, setNewRegMode] = useState<'Offline' | 'Proctored Online'>('Offline');
  const [newRegDate, setNewRegDate] = useState<string>('11th October 2026');
  const [newRegPayment, setNewRegPayment] = useState<'paid' | 'free' | 'pending'>('paid');
  const [newRegCustomRoll, setNewRegCustomRoll] = useState<string>('');
  const [savingRegistration, setSavingRegistration] = useState<boolean>(false);

  // =========================================================================
  // TAB 2: STUDENT ACCOUNTS CRUD
  // =========================================================================
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [studentCentreFilter, setStudentCentreFilter] = useState<string>('ALL');
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  const [showStudentEditModal, setShowStudentEditModal] = useState<boolean>(false);

  // =========================================================================
  // TAB 3: PROMOTIONAL COUPONS CRUD
  // =========================================================================
  const [coupons, setCoupons] = useState<CouponProfile[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState<boolean>(false);
  const [couponSearch, setCouponSearch] = useState<string>('');
  const [couponCentreFilter, setCouponCentreFilter] = useState<string>('ALL');
  const [couponStatusFilter, setCouponStatusFilter] = useState<string>('ALL');
  const [showCouponModal, setShowCouponModal] = useState<boolean>(false);
  const [viewingRedemptions, setViewingRedemptions] = useState<CouponProfile | null>(null);
  const [couponFormData, setCouponFormData] = useState<Partial<CouponProfile>>({
    code: '',
    description: '',
    centreId: 'ALL',
    discountType: 'full',
    discountValue: 100,
    maxUses: 9999,
    isActive: true
  });

  // =========================================================================
  // TAB 4: EXAM SETTINGS ENGINE
  // =========================================================================
  const [centreExams, setCentreExams] = useState<Record<string, CentreExamConfig>>({});
  const [loadingExams, setLoadingExams] = useState<boolean>(false);
  const [editingExamCentre, setEditingExamCentre] = useState<string | null>(null);
  const [examFormData, setExamFormData] = useState<Partial<CentreExamConfig>>({});

  // =========================================================================
  // TAB 5: SUPPORT TICKETS DESK
  // =========================================================================
  const [tickets, setTickets] = useState<EnrichedTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState<boolean>(false);
  const [ticketSearch, setTicketSearch] = useState<string>('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>('ALL');
  const [ticketCentreFilter, setTicketCentreFilter] = useState<string>('ALL');
  const [viewingTicket, setViewingTicket] = useState<EnrichedTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState<string>('');
  const [ticketActionLoading, setTicketActionLoading] = useState<boolean>(false);

  // =========================================================================
  // TAB 6: DIAGNOSTICS & RAW RTDB
  // =========================================================================
  const [diagStats, setDiagStats] = useState<DiagnosticStats | null>(null);
  const [loadingDiag, setLoadingDiag] = useState<boolean>(false);
  const [rtdbPath, setRtdbPath] = useState<string>('registrations/big_bang_2026');
  const [rtdbData, setRtdbData] = useState<string>('');
  const [loadingRtdb, setLoadingRtdb] = useState<boolean>(false);

  // 1-Click Test Seeder state in Tab 6
  const [seedCentre, setSeedCentre] = useState<string>('bhubaneswar');
  const [seedClass, setSeedClass] = useState<string>(BIG_BANG_CLASSES[5].label);
  const [seedMode, setSeedMode] = useState<'Offline' | 'Proctored Online'>('Offline');
  const [seedPayment, setSeedPayment] = useState<'paid' | 'free' | 'pending'>('paid');
  const [seedName, setSeedName] = useState<string>('Demo Test Student');
  const [seeding, setSeeding] = useState<boolean>(false);

  // =========================================================================
  // DATA LOADERS
  // =========================================================================
  const loadAllRegistrations = async () => {
    setLoadingRegistrations(true);
    try {
      const list = await fetchAllRegistrations('big_bang_2026', actorEmail);
      setRegistrations(list);
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Failed loading registrations: ${err.message}` });
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const loadAllStudentsList = async () => {
    setLoadingStudents(true);
    try {
      const list = await fetchAllStudents(actorEmail);
      setStudents(list);
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Failed loading students: ${err.message}` });
    } finally {
      setLoadingStudents(false);
    }
  };

  const loadCouponsList = async () => {
    setLoadingCoupons(true);
    try {
      const list = await fetchAllCoupons(actorEmail);
      setCoupons(list);
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Failed loading coupons: ${err.message}` });
    } finally {
      setLoadingCoupons(false);
    }
  };

  const loadAllExams = async () => {
    setLoadingExams(true);
    try {
      const map: Record<string, CentreExamConfig> = {};
      for (const centre of ALL_CENTRES) {
        const config = await getCentreExamById(centre.id, 'big-bang-edge-test');
        map[centre.id] = config || DEFAULT_CENTRE_EXAMS[centre.id];
      }
      setCentreExams(map);
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Failed loading centre exams: ${err.message}` });
    } finally {
      setLoadingExams(false);
    }
  };

  const loadTicketsList = async () => {
    setLoadingTickets(true);
    try {
      const list = await fetchAllSupportTickets(actorEmail);
      setTickets(list);
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Failed loading support tickets: ${err.message}` });
    } finally {
      setLoadingTickets(false);
    }
  };

  const loadDiagnostics = async () => {
    setLoadingDiag(true);
    try {
      const stats = await fetchSystemDiagnosticStats(actorEmail);
      setDiagStats(stats);
    } catch (err: any) {
      console.warn('Failed diagnostic load:', err);
    } finally {
      setLoadingDiag(false);
    }
  };

  // Initial tab loading
  useEffect(() => {
    loadDiagnostics();
    if (activeTab === 'registrations') loadAllRegistrations();
    else if (activeTab === 'students') loadAllStudentsList();
    else if (activeTab === 'coupons') loadCouponsList();
    else if (activeTab === 'exams') loadAllExams();
    else if (activeTab === 'tickets') loadTicketsList();
  }, [activeTab]);

  // Strictly enforce developer check on mount
  if (!isDeveloper || !isDeveloperEmail(user?.email)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center shadow-lg">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase">403 Access Strictly Forbidden</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-md">
            This Developer Utilities Console is strictly restricted to verified developer accounts (<code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">shivam.strive@gmail.com</code>).
          </p>
        </div>
        <button
          onClick={() => navigate('/admin')}
          className="px-5 py-2.5 bg-[#002147] text-white text-xs font-bold rounded-xl hover:bg-[#001733] transition-all cursor-pointer"
        >
          Return to Admin Dashboard
        </button>
      </div>
    );
  }

  // =========================================================================
  // MULTI-FIELD FILTERING LOGIC (REGISTRATIONS)
  // =========================================================================
  const filteredRegistrations = useMemo(() => {
    const q = filterSearch.trim().toLowerCase();
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    return registrations.filter((reg) => {
      // 1. Text Search across multiple fields
      if (q) {
        const nameMatch = reg.studentName && reg.studentName.toLowerCase().includes(q);
        const parentMatch = reg.parentName && reg.parentName.toLowerCase().includes(q);
        const rollMatch = reg.rollNo && reg.rollNo.toLowerCase().includes(q);
        const phoneMatch = reg.phone && reg.phone.includes(q.replace(/\D/g, ''));
        const emailMatch = reg.email && reg.email.toLowerCase().includes(q);
        const uidMatch = reg.studentUid && reg.studentUid.toLowerCase().includes(q);
        const sidMatch = reg.sid && reg.sid.toLowerCase().includes(q);
        const invMatch = reg.invoiceNo && reg.invoiceNo.toLowerCase().includes(q);
        const schoolMatch = reg.schoolName && reg.schoolName.toLowerCase().includes(q);

        if (!nameMatch && !parentMatch && !rollMatch && !phoneMatch && !emailMatch && !uidMatch && !sidMatch && !invMatch && !schoolMatch) {
          return false;
        }
      }

      // 2. Centre Filter
      if (filterCentre !== 'ALL') {
        const canonical = resolveCanonicalCentreId(reg.registeredByCentre);
        if (canonical !== filterCentre) return false;
      }

      // 3. Class Grade Filter
      if (filterClass !== 'ALL') {
        if (reg.currentClass !== filterClass) return false;
      }

      // 4. Payment Status Filter
      if (filterPayment !== 'ALL') {
        const pStatus = (reg.paymentStatus || 'pending').toLowerCase();
        if (pStatus !== filterPayment.toLowerCase()) return false;
      }

      // 5. Test Mode Filter
      if (filterMode !== 'ALL') {
        if (reg.testMode !== filterMode) return false;
      }

      // 6. Test Date Filter
      if (filterDate !== 'ALL') {
        if (reg.testDate !== filterDate) return false;
      }

      // 7. Quick Presets
      if (filterPreset === 'paid' && reg.paymentStatus !== 'paid') return false;
      if (filterPreset === 'pending' && reg.paymentStatus === 'paid') return false;
      if (filterPreset === 'free' && reg.paymentStatus !== 'free') return false;
      if (filterPreset === 'recent') {
        const regTime = new Date(reg.registeredAt || 0).getTime();
        if (regTime < sevenDaysAgo) return false;
      }
      if (filterPreset === 'mock') {
        const isMockEmail = reg.email && (reg.email.includes('@example.com') || reg.email.includes('dev.test.'));
        const isMockName = reg.studentName && (reg.studentName.includes('Test Candidate') || reg.studentName.includes('Demo Test'));
        const isMockUid = reg.studentUid && (reg.studentUid.startsWith('dev_test_') || reg.studentUid.startsWith('dev_std_') || reg.studentUid.startsWith('dev_clone_'));
        if (!isMockEmail && !isMockName && !isMockUid) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.registeredAt || 0).getTime() - new Date(a.registeredAt || 0).getTime();
      if (sortBy === 'oldest') return new Date(a.registeredAt || 0).getTime() - new Date(b.registeredAt || 0).getTime();
      if (sortBy === 'name') return (a.studentName || '').localeCompare(b.studentName || '');
      if (sortBy === 'roll') return (a.rollNo || '').localeCompare(b.rollNo || '');
      return 0;
    });
  }, [registrations, filterSearch, filterCentre, filterClass, filterPayment, filterMode, filterDate, filterPreset, sortBy]);

  // Aggregate Metrics for Current Filter
  const filterMetrics = useMemo(() => {
    let paidCount = 0;
    let totalRevenue = 0;
    let pendingCount = 0;
    let freeCount = 0;

    filteredRegistrations.forEach((r) => {
      if (r.paymentStatus === 'paid') {
        paidCount++;
        totalRevenue += r.paymentAmount || 0;
      } else if (r.paymentStatus === 'free') {
        freeCount++;
      } else {
        pendingCount++;
      }
    });

    return {
      total: filteredRegistrations.length,
      paidCount,
      totalRevenue,
      pendingCount,
      freeCount
    };
  }, [filteredRegistrations]);

  // Available Test Dates in current data
  const availableTestDates = useMemo(() => {
    const dates = new Set<string>();
    registrations.forEach((r) => {
      if (r.testDate) dates.add(r.testDate);
    });
    return Array.from(dates);
  }, [registrations]);

  // Reset Filters
  const handleClearFilters = () => {
    setFilterSearch('');
    setFilterCentre('ALL');
    setFilterClass('ALL');
    setFilterPayment('ALL');
    setFilterMode('ALL');
    setFilterDate('ALL');
    setFilterPreset('all');
    setSortBy('newest');
  };

  // =========================================================================
  // ACTIONS: REGISTRATIONS
  // =========================================================================
  const handleOpenEditModal = (candidate: EnrichedRegistration) => {
    setEditingCandidate(candidate);
    setEditFormData({
      ...candidate,
      targetCentreId: candidate.registeredByCentre
    });
    setShowEditModal(true);
  };

  const handleSaveEditRegistration = async () => {
    if (!editingCandidate) return;
    setSavingRegistration(true);
    try {
      const res = await updateRegistrationFull({
        rollNo: editingCandidate.rollNo,
        currentCentreId: editingCandidate.registeredByCentre,
        targetCentreId: editFormData.targetCentreId || editingCandidate.registeredByCentre,
        updates: editFormData,
        actorEmail
      });
      setFeedback({ type: 'success', message: res.message });
      setShowEditModal(false);
      setEditingCandidate(null);
      loadAllRegistrations();
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Save failed: ${err.message}` });
    } finally {
      setSavingRegistration(false);
    }
  };

  const handleCreateNewCandidate = async () => {
    if (!newRegName.trim()) {
      alert('Please enter candidate name.');
      return;
    }
    setSavingRegistration(true);
    try {
      const res = await createRegistrationDirect({
        centreId: newRegCentre,
        data: {
          studentName: newRegName.trim(),
          parentName: newRegParent.trim() || 'Parent Name',
          email: newRegEmail.trim() || `test.${Date.now()}@candidate.fiitjee.online`,
          phone: newRegPhone.trim() || '9876543210',
          currentClass: newRegClass,
          schoolName: newRegSchool.trim() || 'FIITJEE Demonstration School',
          testMode: newRegMode,
          testDate: newRegDate,
          paymentStatus: newRegPayment,
          rollNo: newRegCustomRoll.trim() || undefined
        },
        actorEmail
      });
      setFeedback({ type: 'success', message: res.message });
      setShowCreateModal(false);
      // Reset form
      setNewRegName('');
      setNewRegParent('');
      setNewRegEmail('');
      setNewRegPhone('');
      setNewRegCustomRoll('');
      loadAllRegistrations();
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Creation failed: ${err.message}` });
    } finally {
      setSavingRegistration(false);
    }
  };

  const handleFillDemoData = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    setNewRegName(`Demo Student ${rand}`);
    setNewRegParent(`Parent ${rand}`);
    setNewRegEmail(`candidate_${rand}@candidate.fiitjee.online`);
    setNewRegPhone(`98${rand}1234`);
    setNewRegSchool('Delhi Public School');
  };

  const handleDeregisterCandidate = async (candidate: EnrichedRegistration) => {
    const confirm = window.confirm(
      `[DE-REGISTER EXAM]\n\nDe-register ${candidate.studentName} (${candidate.rollNo}) from Big Bang Edge Test 2026?\n\nThis removes the registration node and frees the student account link so you or the student can re-register from scratch.`
    );
    if (!confirm) return;

    try {
      const res = await deregisterCandidateExam({
        rollNo: candidate.rollNo,
        centreId: candidate.registeredByCentre,
        studentUid: candidate.studentUid,
        examId: 'big_bang_2026',
        actorEmail
      });
      setFeedback({ type: 'success', message: res.message });
      loadAllRegistrations();
    } catch (err: any) {
      setFeedback({ type: 'error', message: `De-registration failed: ${err.message}` });
    }
  };

  const handleDuplicateCandidate = async (candidate: EnrichedRegistration) => {
    try {
      const res = await duplicateRegistration({
        rollNo: candidate.rollNo,
        centreId: candidate.registeredByCentre,
        actorEmail
      });
      setFeedback({ type: 'success', message: res.message });
      loadAllRegistrations();
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Duplicate failed: ${err.message}` });
    }
  };

  const handlePurgeCandidate = async (candidate: EnrichedRegistration) => {
    const confirm = window.confirm(
      `[PERMANENT PURGE]\n\nAre you sure you want to permanently delete candidate ${candidate.studentName} (${candidate.rollNo}), their registration, student profile, results, and Firebase Auth credentials?\n\nThis cannot be undone.`
    );
    if (!confirm) return;

    try {
      const res = await purgeCandidateRegistration({
        rollNo: candidate.rollNo,
        actorEmail
      });
      setFeedback({ type: 'success', message: `Purged: ${res.message}` });
      loadAllRegistrations();
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Purge failed: ${err.message}` });
    }
  };

  // Batch Selection Toggle
  const handleToggleSelectRoll = (rollNo: string) => {
    setSelectedRolls((prev) => {
      const next = new Set(prev);
      if (next.has(rollNo)) next.delete(rollNo);
      else next.add(rollNo);
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    if (selectedRolls.size === filteredRegistrations.length) {
      setSelectedRolls(new Set());
    } else {
      setSelectedRolls(new Set(filteredRegistrations.map((r) => r.rollNo)));
    }
  };

  // Batch Status Change
  const handleBatchStatusUpdate = async (status: 'paid' | 'free' | 'pending') => {
    if (selectedRolls.size === 0) return;
    const records = filteredRegistrations
      .filter((r) => selectedRolls.has(r.rollNo))
      .map((r) => ({ rollNo: r.rollNo, centreId: r.registeredByCentre }));

    try {
      const res = await batchUpdatePaymentStatus({ records, status, actorEmail });
      setFeedback({ type: 'success', message: res.message });
      setSelectedRolls(new Set());
      loadAllRegistrations();
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Batch update failed: ${err.message}` });
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const items = selectedRolls.size > 0 
      ? filteredRegistrations.filter((r) => selectedRolls.has(r.rollNo))
      : filteredRegistrations;

    if (items.length === 0) return;

    const headers = ['Roll No', 'Student Name', 'Parent Name', 'Centre', 'Class', 'Test Date', 'Test Mode', 'Payment Status', 'Fee', 'Phone', 'Email', 'School', 'Registered At'];
    const rows = items.map((r) => [
      `"${r.rollNo}"`,
      `"${r.studentName}"`,
      `"${r.parentName || ''}"`,
      `"${r.registeredByCentre}"`,
      `"${r.currentClass}"`,
      `"${r.testDate}"`,
      `"${r.testMode}"`,
      `"${r.paymentStatus || 'pending'}"`,
      `"${r.paymentAmount || 0}"`,
      `"${r.phone}"`,
      `"${r.email}"`,
      `"${r.schoolName || ''}"`,
      `"${r.registeredAt || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fiitjee_registrations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const handleExportJSON = () => {
    const items = selectedRolls.size > 0 
      ? filteredRegistrations.filter((r) => selectedRolls.has(r.rollNo))
      : filteredRegistrations;

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `fiitjee_registrations_${Date.now()}.json`);
    dlAnchorElem.click();
  };

  // =========================================================================
  // ACTIONS: STUDENTS
  // =========================================================================
  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    return students.filter((s) => {
      if (q) {
        const matchName = s.fullName && s.fullName.toLowerCase().includes(q);
        const matchEmail = s.email && s.email.toLowerCase().includes(q);
        const matchPhone = s.phone && s.phone.includes(q);
        const matchUid = s.uid && s.uid.toLowerCase().includes(q);
        const matchClass = s.currentClass && s.currentClass.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone && !matchUid && !matchClass) return false;
      }
      if (studentCentreFilter !== 'ALL') {
        const c = resolveCanonicalCentreId(s.preferredCentreId);
        if (c !== studentCentreFilter) return false;
      }
      return true;
    });
  }, [students, studentSearch, studentCentreFilter]);

  const handleSaveStudentProfile = async () => {
    if (!editingStudent) return;
    try {
      await updateStudentProfileDirect({
        uid: editingStudent.uid,
        updates: editingStudent,
        actorEmail
      });
      setFeedback({ type: 'success', message: `Student profile updated for ${editingStudent.fullName}` });
      setShowStudentEditModal(false);
      setEditingStudent(null);
      loadAllStudentsList();
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Update failed: ${err.message}` });
    }
  };

  const handleDeleteStudentProfile = async (uid: string, name: string) => {
    if (!window.confirm(`Delete student profile ${name} (${uid})?`)) return;
    try {
      await deleteStudentProfileDirect({ uid, actorEmail });
      setFeedback({ type: 'success', message: `Student ${name} deleted.` });
      loadAllStudentsList();
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Delete failed: ${err.message}` });
    }
  };

  const handleUnlinkStudentExam = async (uid: string, examId: string) => {
    if (!window.confirm(`Unlink exam "${examId}" from student?`)) return;
    try {
      await unlinkStudentExam({ uid, examId, actorEmail });
      setFeedback({ type: 'success', message: `Unlinked exam ${examId}.` });
      loadAllStudentsList();
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Unlink failed: ${err.message}` });
    }
  };

  // =========================================================================
  // ACTIONS: COUPONS
  // =========================================================================
  const filteredCoupons = useMemo(() => {
    const q = couponSearch.trim().toLowerCase();
    return coupons.filter((c) => {
      if (q) {
        const matchCode = c.code && c.code.toLowerCase().includes(q);
        const matchDesc = c.description && c.description.toLowerCase().includes(q);
        if (!matchCode && !matchDesc) return false;
      }
      if (couponCentreFilter !== 'ALL') {
        const canonical = resolveCanonicalCentreId(c.centreId);
        if (canonical !== couponCentreFilter && c.centreId !== 'ALL') return false;
      }
      if (couponStatusFilter === 'active' && !c.isActive) return false;
      if (couponStatusFilter === 'inactive' && c.isActive) return false;
      return true;
    });
  }, [coupons, couponSearch, couponCentreFilter, couponStatusFilter]);

  const handleSaveCoupon = async () => {
    if (!couponFormData.code?.trim()) {
      alert('Please enter a coupon code.');
      return;
    }
    try {
      await saveCouponDirect({
        coupon: couponFormData as CouponProfile,
        actorEmail
      });
      setFeedback({ type: 'success', message: `Coupon ${couponFormData.code?.toUpperCase()} saved.` });
      setShowCouponModal(false);
      setCouponFormData({
        code: '',
        description: '',
        centreId: 'ALL',
        discountType: 'full',
        discountValue: 100,
        maxUses: 9999,
        isActive: true
      });
      loadCouponsList();
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Coupon save failed: ${err.message}` });
    }
  };

  const handleToggleCouponActive = async (coupon: CouponProfile) => {
    try {
      await saveCouponDirect({
        coupon: { ...coupon, isActive: !coupon.isActive },
        actorEmail
      });
      setFeedback({ type: 'success', message: `Coupon ${coupon.code} marked ${!coupon.isActive ? 'Active' : 'Inactive'}.` });
      loadCouponsList();
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Toggle failed: ${err.message}` });
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!window.confirm(`Delete coupon ${couponId}?`)) return;
    try {
      await deleteCouponDirect({ couponId, actorEmail });
      setFeedback({ type: 'success', message: `Coupon ${couponId} deleted.` });
      loadCouponsList();
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Delete failed: ${err.message}` });
    }
  };

  const handleResetCouponUses = async (couponId: string) => {
    try {
      await resetCouponUsesDirect({ couponId, actorEmail });
      setFeedback({ type: 'success', message: `Usage count reset for coupon ${couponId}.` });
      loadCouponsList();
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Reset failed: ${err.message}` });
    }
  };

  // =========================================================================
  // ACTIONS: EXAMS
  // =========================================================================
  const handleToggleExamRegOpen = async (centreId: string) => {
    const current = centreExams[centreId];
    if (!current) return;
    const updated: CentreExamConfig = {
      ...current,
      registrationOpen: !current.registrationOpen,
      lastUpdatedAt: new Date().toISOString(),
      lastUpdatedBy: actorEmail
    };
    try {
      await saveCentreExam(updated);
      setCentreExams((prev) => ({ ...prev, [centreId]: updated }));
      setFeedback({ type: 'success', message: `${CENTRES_CONFIG[centreId]?.name} registration status toggled to ${updated.registrationOpen ? 'OPEN' : 'CLOSED'}.` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Failed to update registration status: ${err.message}` });
    }
  };

  const handleSaveExamFeeOverrides = async (centreId: string) => {
    const current = centreExams[centreId];
    if (!current) return;
    try {
      await saveCentreExam({
        ...current,
        ...examFormData,
        lastUpdatedAt: new Date().toISOString(),
        lastUpdatedBy: actorEmail
      });
      setFeedback({ type: 'success', message: `Exam configuration updated for ${CENTRES_CONFIG[centreId]?.name}.` });
      setEditingExamCentre(null);
      loadAllExams();
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Failed to save exam config: ${err.message}` });
    }
  };

  // =========================================================================
  // ACTIONS: SUPPORT TICKETS
  // =========================================================================
  const filteredTickets = useMemo(() => {
    const q = ticketSearch.trim().toLowerCase();
    return tickets.filter((t) => {
      if (q) {
        const matchSubject = t.subject && t.subject.toLowerCase().includes(q);
        const matchName = t.studentName && t.studentName.toLowerCase().includes(q);
        const matchEmail = t.studentEmail && t.studentEmail.toLowerCase().includes(q);
        const matchId = t.ticketId && t.ticketId.toLowerCase().includes(q);
        const matchRoll = t.rollNo && t.rollNo.toLowerCase().includes(q);
        if (!matchSubject && !matchName && !matchEmail && !matchId && !matchRoll) return false;
      }
      if (ticketCentreFilter !== 'ALL') {
        const c = resolveCanonicalCentreId(t.centreId);
        if (c !== ticketCentreFilter) return false;
      }
      if (ticketStatusFilter !== 'ALL') {
        if (t.status !== ticketStatusFilter) return false;
      }
      return true;
    });
  }, [tickets, ticketSearch, ticketCentreFilter, ticketStatusFilter]);

  const handleUpdateTicketStatus = async (ticket: EnrichedTicket, newStatus: any) => {
    try {
      await updateSupportTicketDirect({
        centreId: ticket.centreId,
        ticketId: ticket.ticketId,
        updates: { status: newStatus },
        actorEmail
      });
      setFeedback({ type: 'success', message: `Ticket #${ticket.ticketId} marked as ${newStatus.toUpperCase()}.` });
      loadTicketsList();
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Status update failed: ${err.message}` });
    }
  };

  const handleSendTicketReply = async () => {
    if (!viewingTicket || !ticketReplyText.trim()) return;
    setTicketActionLoading(true);
    try {
      await updateSupportTicketDirect({
        centreId: viewingTicket.centreId,
        ticketId: viewingTicket.ticketId,
        updates: {
          adminReply: ticketReplyText.trim(),
          status: 'resolved'
        },
        actorEmail
      });
      setFeedback({ type: 'success', message: `Reply posted & Ticket #${viewingTicket.ticketId} marked resolved.` });
      setViewingTicket(null);
      setTicketReplyText('');
      loadTicketsList();
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Reply failed: ${err.message}` });
    } finally {
      setTicketActionLoading(false);
    }
  };

  const handleDeleteTicket = async (ticket: EnrichedTicket) => {
    if (!window.confirm(`Delete support ticket #${ticket.ticketId}?`)) return;
    try {
      await deleteSupportTicketDirect({
        centreId: ticket.centreId,
        ticketId: ticket.ticketId,
        actorEmail
      });
      setFeedback({ type: 'success', message: `Ticket #${ticket.ticketId} deleted.` });
      if (viewingTicket?.ticketId === ticket.ticketId) setViewingTicket(null);
      loadTicketsList();
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Delete failed: ${err.message}` });
    }
  };

  // =========================================================================
  // ACTIONS: DIAGNOSTICS & RTDB
  // =========================================================================
  const handlePurgeAllMockRecords = async () => {
    const confirm = window.confirm(
      'DANGER: Purge all mock candidate test records containing "@example.com" or "dev_test_"?\n\nThis keeps your production database clean.'
    );
    if (!confirm) return;

    try {
      const res = await purgeAllTestData(actorEmail);
      setFeedback({ type: 'success', message: res.message });
      loadDiagnostics();
      loadAllRegistrations();
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Purge failed: ${err.message}` });
    }
  };

  const handleSeedCandidate = async () => {
    setSeeding(true);
    try {
      const res = await seedTestRegistration({
        centreId: seedCentre,
        currentClass: seedClass,
        testMode: seedMode,
        paymentStatus: seedPayment,
        studentName: seedName.trim() || 'Developer Test Candidate',
        actorEmail
      });
      setFeedback({ type: 'success', message: res.message });
      loadDiagnostics();
      loadAllRegistrations();
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Seeding failed: ${err.message}` });
    } finally {
      setSeeding(false);
    }
  };

  const handleFetchRtdb = async () => {
    if (!rtdbPath.trim()) return;
    setLoadingRtdb(true);
    try {
      const data = await inspectRtdbPath({ path: rtdbPath, actorEmail });
      setRtdbData(JSON.stringify(data, null, 2) || 'null');
      setFeedback({ type: 'success', message: `Fetched snapshot of "${rtdbPath}".` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Fetch failed: ${err.message}` });
    } finally {
      setLoadingRtdb(false);
    }
  };

  const handleSaveRtdb = async () => {
    if (!rtdbPath.trim()) return;
    try {
      const parsed = JSON.parse(rtdbData);
      await writeRtdbPath({ path: rtdbPath, data: parsed, actorEmail });
      setFeedback({ type: 'success', message: `Saved node at "${rtdbPath}".` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Save failed: ${err.message}` });
    }
  };

  const handleDeleteRtdb = async () => {
    if (!rtdbPath.trim()) return;
    if (!window.confirm(`DANGER: Permanently delete RTDB node at "${rtdbPath}"?`)) return;
    try {
      await deleteRtdbPath({ path: rtdbPath, actorEmail });
      setRtdbData('null');
      setFeedback({ type: 'success', message: `Deleted node at "${rtdbPath}".` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Delete failed: ${err.message}` });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      
      {/* ========================================================================= */}
      {/* TOP BANNER & DIAGNOSTIC COUNTERS                                         */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-[#001733] to-[#002147] rounded-3xl p-6 sm:p-8 text-white border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[10px] font-black uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5" />
                <span>Developer Station & Database CRUD</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified: {actorEmail}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <span>National Operations Console</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Full CRUD over candidates, student portal accounts, promotional coupons, centre exam rules, support tickets, and raw Realtime Database nodes.
            </p>
          </div>

          {/* Quick Metrics Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Candidates</span>
              <span className="text-xl font-black text-amber-400 font-mono">{diagStats?.totalRegistrations ?? '...'}</span>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Students</span>
              <span className="text-xl font-black text-emerald-400 font-mono">{diagStats?.totalStudents ?? '...'}</span>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Coupons</span>
              <span className="text-xl font-black text-blue-400 font-mono">{diagStats?.totalCoupons ?? '...'}</span>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Open Tickets</span>
              <span className="text-xl font-black text-purple-400 font-mono">{diagStats?.totalTickets ?? '...'}</span>
            </div>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div className={`mt-5 p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200 ${
            feedback.type === 'success' 
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200' 
              : 'bg-red-500/20 border-red-500/50 text-red-200'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-slate-700/60">
          <button
            onClick={() => setActiveTab('registrations')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'registrations'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Candidates & Advanced Search</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'students'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <UsersIcon className="w-3.5 h-3.5" />
            <span>Student Accounts</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'coupons'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Promotional Coupons</span>
          </button>

          <button
            onClick={() => setActiveTab('exams')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'exams'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Exam Configurations</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'tickets'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Support Tickets Desk</span>
          </button>

          <button
            onClick={() => setActiveTab('rtdb')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'rtdb'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Diagnostics & RTDB</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CANDIDATES CRUD & MULTI-FIELD SEARCH                               */}
      {/* ========================================================================= */}
      {activeTab === 'registrations' && (
        <div className="space-y-6">
          
          {/* Advanced Multi-Field Search & Filter Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-[#002147] uppercase tracking-wide flex items-center gap-2">
                  <Search className="w-4 h-4 text-amber-500" />
                  <span>Advanced Multi-Field Candidate Search & Filters</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Filter by text query, centre allotment, class grade, test mode, date, and fee status simultaneously.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-[#002147] hover:bg-[#001733] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>New Candidate</span>
                </button>

                <button
                  onClick={handleClearFilters}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="Reset all filters"
                >
                  Reset Filters
                </button>

                <button
                  onClick={loadAllRegistrations}
                  disabled={loadingRegistrations}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                  title="Refresh list from database"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingRegistrations ? 'animate-spin text-amber-600' : ''}`} />
                </button>
              </div>
            </div>

            {/* Row 1: Search text input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="Search across Name, Roll No, Phone, Email, UID, School, SID, Invoice No..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none transition-all"
              />
              {filterSearch && (
                <button 
                  onClick={() => setFilterSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Row 2: Dropdowns Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
              
              {/* Centre Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Centre</label>
                <select
                  value={filterCentre}
                  onChange={(e) => setFilterCentre(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  <option value="ALL">All Centres</option>
                  {ALL_CENTRES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Class Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Class</label>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  <option value="ALL">All Classes</option>
                  {BIG_BANG_CLASSES.map((c) => (
                    <option key={c.code} value={c.label}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Payment Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Payment</label>
                <select
                  value={filterPayment}
                  onChange={(e) => setFilterPayment(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  <option value="ALL">All Payments</option>
                  <option value="paid">Paid</option>
                  <option value="free">Waived / Free</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Test Mode Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Mode</label>
                <select
                  value={filterMode}
                  onChange={(e) => setFilterMode(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  <option value="ALL">All Modes</option>
                  <option value="Offline">Offline CBT</option>
                  <option value="Proctored Online">Proctored Online</option>
                </select>
              </div>

              {/* Test Date Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Date</label>
                <select
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  <option value="ALL">All Dates</option>
                  {availableTestDates.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="roll">Roll Number</option>
                </select>
              </div>

            </div>

            {/* Row 3: Quick Filter Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" />
                <span>Presets:</span>
              </span>
              {[
                { id: 'all', label: 'All Candidates' },
                { id: 'paid', label: 'Paid Only' },
                { id: 'pending', label: 'Payment Pending' },
                { id: 'free', label: 'Fee Waived' },
                { id: 'recent', label: 'Recent (Last 7d)' },
                { id: 'mock', label: 'Mock Test Data' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setFilterPreset(p.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    filterPreset === p.id 
                      ? 'bg-[#002147] text-white shadow-xs' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

          </div>

          {/* Aggregate Metrics Bar & Batch Actions */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4 text-xs flex-wrap">
              <div>
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">Matching Results</span>
                <span className="text-sm font-black text-[#002147] font-mono">{filterMetrics.total} candidate{filterMetrics.total === 1 ? '' : 's'}</span>
              </div>
              <div className="h-6 w-px bg-slate-300" />
              <div>
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">Paid</span>
                <span className="text-sm font-black text-emerald-700 font-mono">{filterMetrics.paidCount} (₹{filterMetrics.totalRevenue})</span>
              </div>
              <div className="h-6 w-px bg-slate-300" />
              <div>
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">Pending</span>
                <span className="text-sm font-black text-amber-700 font-mono">{filterMetrics.pendingCount}</span>
              </div>
              <div className="h-6 w-px bg-slate-300" />
              <div>
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">Fee Waived</span>
                <span className="text-sm font-black text-blue-700 font-mono">{filterMetrics.freeCount}</span>
              </div>
            </div>

            {/* Batch & Export Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {selectedRolls.size > 0 && (
                <div className="flex items-center gap-1.5 mr-2">
                  <span className="text-xs font-bold text-slate-700 bg-amber-100 px-2 py-1 rounded-lg">
                    {selectedRolls.size} selected
                  </span>
                  <button
                    onClick={() => handleBatchStatusUpdate('paid')}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Mark Paid
                  </button>
                  <button
                    onClick={() => handleBatchStatusUpdate('free')}
                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Mark Waived
                  </button>
                </div>
              )}

              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleExportJSON}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>

          </div>

          {/* Results Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3 pl-4 w-10">
                      <button 
                        onClick={handleSelectAllFiltered}
                        className="text-slate-600 hover:text-[#002147]"
                      >
                        {selectedRolls.size > 0 && selectedRolls.size === filteredRegistrations.length ? (
                          <CheckSquare className="w-4 h-4 text-[#002147]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="p-3">Candidate / Roll No</th>
                    <th className="p-3">Centre & Class</th>
                    <th className="p-3">Exam Mode & Date</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Payment</th>
                    <th className="p-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingRegistrations ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-400 font-medium">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
                        <span>Loading all candidates across centres...</span>
                      </td>
                    </tr>
                  ) : filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-400 font-medium">
                        No candidates match the selected filters or search query.
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((r) => {
                      const isSelected = selectedRolls.has(r.rollNo);
                      return (
                        <tr 
                          key={`${r.registeredByCentre}_${r.rollNo}`} 
                          className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-amber-50/40' : ''}`}
                        >
                          <td className="p-3 pl-4">
                            <button
                              onClick={() => handleToggleSelectRoll(r.rollNo)}
                              className="text-slate-500 hover:text-[#002147] cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-amber-600" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </td>

                          {/* Candidate / Roll No */}
                          <td className="p-3">
                            <div className="font-black text-[#002147]">{r.studentName}</div>
                            <div className="font-mono text-[11px] text-slate-600 font-bold flex items-center gap-1.5 mt-0.5">
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{r.rollNo}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">UID: {r.studentUid || 'None'}</div>
                          </td>

                          {/* Centre & Class */}
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
                              {r.registeredByCentre.toUpperCase()}
                            </span>
                            <div className="font-bold text-slate-700 mt-1">{r.currentClass}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{r.schoolName}</div>
                          </td>

                          {/* Mode & Date */}
                          <td className="p-3">
                            <div className="font-semibold text-slate-800">{r.testDate}</div>
                            <div className="text-[11px] text-slate-500 font-medium">{r.testMode}</div>
                          </td>

                          {/* Contact */}
                          <td className="p-3 font-mono text-[11px]">
                            <div className="text-slate-800 font-bold">{r.phone}</div>
                            <div className="text-slate-500 text-[10px]">{r.email}</div>
                          </td>

                          {/* Payment */}
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              r.paymentStatus === 'paid'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : r.paymentStatus === 'free'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}>
                              {r.paymentStatus || 'pending'}
                            </span>
                            <div className="font-mono text-[11px] font-bold text-slate-700 mt-1">
                              ₹{r.paymentAmount ?? 0}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="p-3 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              
                              {/* Edit Modal */}
                              <button
                                onClick={() => handleOpenEditModal(r)}
                                className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer transition-all"
                                title="Full Field Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* De-register (Reset Flow) */}
                              <button
                                onClick={() => handleDeregisterCandidate(r)}
                                className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer transition-all"
                                title="De-register Exam (Reset flow for testing)"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>

                              {/* Clone / Duplicate */}
                              <button
                                onClick={() => handleDuplicateCandidate(r)}
                                className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-all"
                                title="Clone candidate to new roll number"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              {/* Purge */}
                              <button
                                onClick={() => handlePurgeCandidate(r)}
                                className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-all"
                                title="Purge Record, Student Node, & Auth Account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Open Dossier */}
                              <button
                                onClick={() => navigate(`/admin/registrations/${encodeURIComponent(r.rollNo)}`)}
                                className="p-1.5 text-slate-600 hover:text-[#002147] hover:bg-slate-100 rounded-lg cursor-pointer transition-all"
                                title="Open full admin registration page"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>

                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STUDENT ACCOUNTS CRUD                                              */}
      {/* ========================================================================= */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-[#002147] uppercase tracking-wide flex items-center gap-2">
                  <UsersIcon className="w-4 h-4 text-amber-500" />
                  <span>Student Accounts Directory (`students/` Node)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect candidate login accounts, link/unlink exams, and edit profile records directly.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadAllStudentsList}
                  disabled={loadingStudents}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingStudents ? 'animate-spin' : ''}`} />
                  <span>Refresh Accounts</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search students by Name, Email, Phone, UID, or Class..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#002147] outline-none"
                />
              </div>

              <select
                value={studentCentreFilter}
                onChange={(e) => setStudentCentreFilter(e.target.value)}
                className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="ALL">All Preferred Centres</option>
                {ALL_CENTRES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Students Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingStudents ? (
              <div className="col-span-full p-12 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
                <span>Loading student accounts...</span>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="col-span-full p-12 text-center text-slate-400">
                No student accounts found matching query.
              </div>
            ) : (
              filteredStudents.map((s) => {
                const registeredExamsList = Object.entries(s.registeredExams || {});
                return (
                  <div key={s.uid} className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 shadow-xs hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-black text-[#002147] uppercase">{s.fullName}</h3>
                        <p className="text-[11px] font-mono text-slate-500 font-bold">UID: {s.uid}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                        {s.preferredCentreId ? s.preferredCentreId.toUpperCase() : 'NO CENTRE'}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600">
                      <div><strong>Email:</strong> {s.email}</div>
                      <div><strong>Phone:</strong> {s.phone}</div>
                      <div><strong>Class:</strong> {s.currentClass}</div>
                      <div><strong>School:</strong> {s.schoolName || 'N/A'}</div>
                    </div>

                    {/* Linked Exams */}
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Registered Exams ({registeredExamsList.length})
                      </span>
                      {registeredExamsList.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic">No exams linked</span>
                      ) : (
                        <div className="space-y-1.5">
                          {registeredExamsList.map(([eId, exam]: [string, any]) => (
                            <div key={eId} className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-200">
                              <div>
                                <span className="font-bold text-slate-800">{exam.examName || eId}</span>
                                <div className="font-mono text-[10px] text-slate-500">{exam.rollNo}</div>
                              </div>
                              <button
                                onClick={() => handleUnlinkStudentExam(s.uid, eId)}
                                className="text-[10px] font-bold text-red-600 hover:underline cursor-pointer"
                                title="Unlink this exam from student"
                              >
                                Unlink
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Profile Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setEditingStudent(s);
                          setShowStudentEditModal(true);
                        }}
                        className="text-xs font-bold text-[#002147] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Profile</span>
                      </button>

                      <button
                        onClick={() => handleDeleteStudentProfile(s.uid, s.fullName)}
                        className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PROMOTIONAL COUPONS CRUD                                           */}
      {/* ========================================================================= */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-[#002147] uppercase tracking-wide flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-500" />
                  <span>Promotional Coupons & Fee Waivers</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Create, toggle, inspect redemptions, and customize multi-centre discount vouchers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCouponModal(true)}
                  className="px-4 py-2 bg-[#002147] hover:bg-[#001733] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>New Coupon Code</span>
                </button>
                <button
                  onClick={loadCouponsList}
                  disabled={loadingCoupons}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingCoupons ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <input
                type="text"
                value={couponSearch}
                onChange={(e) => setCouponSearch(e.target.value)}
                placeholder="Search coupon code or description..."
                className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
              />

              <select
                value={couponCentreFilter}
                onChange={(e) => setCouponCentreFilter(e.target.value)}
                className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
              >
                <option value="ALL">All Centres / Global</option>
                {ALL_CENTRES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select
                value={couponStatusFilter}
                onChange={(e) => setCouponStatusFilter(e.target.value)}
                className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
              >
                <option value="ALL">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Coupon Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingCoupons ? (
              <div className="col-span-full p-12 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
                <span>Loading coupons...</span>
              </div>
            ) : filteredCoupons.length === 0 ? (
              <div className="col-span-full p-12 text-center text-slate-400">
                No coupons found in database.
              </div>
            ) : (
              filteredCoupons.map((c) => {
                const redemptionsCount = Object.keys(c.redemptions || {}).length;
                return (
                  <div key={c.id || c.code} className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 shadow-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-lg font-black text-[#002147] tracking-tight">{c.code}</span>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{c.description || 'Promotional coupon'}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Discount</span>
                        <span className="font-bold text-emerald-700">
                          {c.discountType === 'full' ? '100% Free' : c.discountType === 'flat' ? `₹${c.discountValue} Flat` : `${c.discountValue}%`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Target Centre</span>
                        <span className="font-bold text-slate-700">{c.centreId || 'ALL'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Used</span>
                        <span className="font-mono font-bold text-slate-700">{c.usedCount || 0} / {c.maxUses || '∞'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Redemptions</span>
                        <span className="font-mono font-bold text-slate-700">{redemptionsCount} log{redemptionsCount === 1 ? '' : 's'}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                      <button
                        onClick={() => handleToggleCouponActive(c)}
                        className={`cursor-pointer ${c.isActive ? 'text-amber-700 hover:underline' : 'text-emerald-700 hover:underline'}`}
                      >
                        {c.isActive ? 'Deactivate' : 'Activate'}
                      </button>

                      {redemptionsCount > 0 && (
                        <button
                          onClick={() => setViewingRedemptions(c)}
                          className="text-blue-700 hover:underline cursor-pointer"
                        >
                          View Logs
                        </button>
                      )}

                      <button
                        onClick={() => handleResetCouponUses(c.id || c.code)}
                        className="text-slate-600 hover:underline cursor-pointer"
                      >
                        Reset Uses
                      </button>

                      <button
                        onClick={() => handleDeleteCoupon(c.id || c.code)}
                        className="text-red-600 hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: EXAM SETTINGS ENGINE                                               */}
      {/* ========================================================================= */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <h2 className="text-base font-black text-[#002147] uppercase tracking-wide flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Multi-Centre Exam Blueprints & Overrides</span>
            </h2>
            <p className="text-xs text-slate-500">
              Control registration availability, exam dates, test modes, and class-wise fee schedules for each of the 4 centres.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ALL_CENTRES.map((centre) => {
              const config = centreExams[centre.id] || DEFAULT_CENTRE_EXAMS[centre.id];
              const isRegOpen = config?.registrationOpen !== false;

              return (
                <div key={centre.id} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-black text-[#002147] uppercase">{centre.name}</h3>
                      <p className="text-[11px] text-slate-500">Centre Code: {centre.code} • Test Code: {centre.testCentreCode}</p>
                    </div>
                    
                    <button
                      onClick={() => handleToggleExamRegOpen(centre.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider cursor-pointer border transition-all ${
                        isRegOpen 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                          : 'bg-red-50 text-red-800 border-red-300'
                      }`}
                    >
                      {isRegOpen ? 'Registration OPEN' : 'Registration CLOSED'}
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 block text-[10px] uppercase text-slate-400">Exam Name</span>
                      <span className="font-black text-slate-900">{config?.name || 'Big Bang Edge Test 2026'}</span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block text-[10px] uppercase text-slate-400">Active Test Dates</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(config?.testDates || []).map((d) => (
                          <span key={d} className="px-2 py-0.5 bg-slate-100 text-slate-800 font-bold rounded-lg text-[10px]">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block text-[10px] uppercase text-slate-400">Test Modes</span>
                      <span className="font-medium text-slate-700">{(config?.modes || ['Offline']).join(', ')}</span>
                    </div>

                    <div className="pt-2">
                      <span className="font-bold text-slate-700 block text-[10px] uppercase text-slate-400 mb-1">
                        Class Fee Schedule
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] font-mono">
                        {Object.entries(config?.classFees || {}).map(([cls, fee]) => (
                          <div key={cls} className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                            <div className="text-[9px] text-slate-500 font-sans font-bold">{cls}</div>
                            <div className="font-bold text-emerald-700">₹{fee}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => navigate(`/admin/exams/edit/${centre.id}`)}
                      className="text-xs font-bold text-[#002147] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Full Exam Settings</span>
                    </button>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Updated: {config?.lastUpdatedAt ? new Date(config.lastUpdatedAt).toLocaleDateString() : 'System default'}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SUPPORT TICKETS DESK                                               */}
      {/* ========================================================================= */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-[#002147] uppercase tracking-wide flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  <span>Support Tickets & Candidate Grievances</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  View candidate help desk submissions across all centres, post developer resolutions, and manage ticket status.
                </p>
              </div>

              <button
                onClick={loadTicketsList}
                disabled={loadingTickets}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingTickets ? 'animate-spin' : ''}`} />
                <span>Refresh Tickets</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <input
                type="text"
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                placeholder="Search ticket subject, candidate, or email..."
                className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
              />

              <select
                value={ticketCentreFilter}
                onChange={(e) => setTicketCentreFilter(e.target.value)}
                className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
              >
                <option value="ALL">All Centres</option>
                {ALL_CENTRES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select
                value={ticketStatusFilter}
                onChange={(e) => setTicketStatusFilter(e.target.value)}
                className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
              >
                <option value="ALL">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Tickets List */}
          <div className="space-y-3">
            {loadingTickets ? (
              <div className="p-12 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
                <span>Loading support tickets...</span>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
                No support tickets found matching criteria.
              </div>
            ) : (
              filteredTickets.map((t) => (
                <div key={t.ticketId} className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        #{t.ticketId}
                      </span>
                      <h3 className="font-black text-[#002147] text-sm uppercase">{t.subject}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                        {t.centreId.toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        t.status === 'resolved' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : t.status === 'open' 
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {t.status}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      {t.submittedAt ? new Date(t.submittedAt).toLocaleString() : ''}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div><strong>Candidate:</strong> {t.studentName}</div>
                    <div><strong>Email:</strong> {t.studentEmail}</div>
                    <div><strong>Phone:</strong> {t.studentPhone}</div>
                  </div>

                  <div className="text-xs text-slate-700 bg-slate-50/50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Issue Description</span>
                    {t.description}
                  </div>

                  {t.adminReply && (
                    <div className="text-xs bg-emerald-50 text-emerald-950 p-3 rounded-xl border border-emerald-200 space-y-1">
                      <span className="text-[10px] font-black uppercase text-emerald-800 block">
                        Admin Resolution ({t.adminRepliedBy || 'Admin'})
                      </span>
                      <p>{t.adminReply}</p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setViewingTicket(t);
                          setTicketReplyText(t.adminReply || '');
                        }}
                        className="px-3 py-1.5 bg-[#002147] hover:bg-[#001733] text-white rounded-xl font-bold cursor-pointer transition-all"
                      >
                        Reply / Resolve
                      </button>

                      <button
                        onClick={() => handleUpdateTicketStatus(t, t.status === 'resolved' ? 'open' : 'resolved')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                      >
                        Mark as {t.status === 'resolved' ? 'Open' : 'Resolved'}
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteTicket(t)}
                      className="text-red-600 hover:underline font-bold cursor-pointer"
                    >
                      Delete Ticket
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: DIAGNOSTICS, SEEDER & RAW RTDB EXPLORER                            */}
      {/* ========================================================================= */}
      {activeTab === 'rtdb' && (
        <div className="space-y-6">
          
          {/* Diagnostic Station & Mock Cleanup */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
                  <Activity className="w-4 h-4" />
                  <span>Realtime Database Health Diagnostic</span>
                </div>
                <h2 className="text-lg font-black text-[#002147] uppercase tracking-wide">
                  System Counts & Mock Record Purge
                </h2>
              </div>

              <button
                onClick={handlePurgeAllMockRecords}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-auto"
                title="Deletes all mock records containing @example.com or dev_test_"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>🧹 Purge All Mock Test Records</span>
              </button>
            </div>

            {/* Centre-wise registration counts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {ALL_CENTRES.map((c) => (
                <div key={c.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">{c.name}</span>
                  <span className="text-2xl font-black text-[#002147] font-mono">
                    {diagStats?.registrationsByCentre[c.id] ?? 0}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">registered candidates</span>
                </div>
              ))}
            </div>
          </div>

          {/* 1-Click Fast Seeder */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Instant Data Provisioner</span>
              </div>
              <h2 className="text-base font-black text-[#002147] uppercase tracking-wide">
                1-Click Provision Verified Test Candidate
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">Centre</label>
                <select
                  value={seedCentre}
                  onChange={(e) => setSeedCentre(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  {ALL_CENTRES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">Class</label>
                <select
                  value={seedClass}
                  onChange={(e) => setSeedClass(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  {BIG_BANG_CLASSES.map((cls) => (
                    <option key={cls.code} value={cls.label}>{cls.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">Mode</label>
                <select
                  value={seedMode}
                  onChange={(e) => setSeedMode(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  <option value="Offline">Offline CBT</option>
                  <option value="Proctored Online">Proctored Online</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">Payment</label>
                <select
                  value={seedPayment}
                  onChange={(e) => setSeedPayment(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  <option value="paid">Paid</option>
                  <option value="free">Fee Waived (₹0)</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={seedName}
                onChange={(e) => setSeedName(e.target.value)}
                placeholder="Candidate Full Name"
                className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
              />
              <button
                onClick={handleSeedCandidate}
                disabled={seeding}
                className="px-5 py-2.5 bg-[#002147] hover:bg-[#001733] text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{seeding ? 'Generating...' : '⚡ Generate Test Candidate'}</span>
              </button>
            </div>
          </div>

          {/* RTDB Raw Explorer */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
                <Database className="w-4 h-4" />
                <span>Raw Realtime Database Node CRUD</span>
              </div>
              <h2 className="text-base font-black text-[#002147] uppercase tracking-wide">
                Direct Node Path Inspector
              </h2>
            </div>

            {/* Path presets */}
            <div className="flex flex-wrap gap-1.5">
              {[
                'registrations/big_bang_2026',
                'registrations/big_bang_2026/bhubaneswar',
                'registrations/big_bang_2026/dwarka',
                'registrations/big_bang_2026/ranchi',
                'registrations/big_bang_2026/hyderabad',
                'students',
                'coupons',
                'support_tickets',
                'centre_exams',
                'admin_logs'
              ].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setRtdbPath(p)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-mono text-slate-700 font-bold transition-all cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={rtdbPath}
                onChange={(e) => setRtdbPath(e.target.value)}
                placeholder="e.g. registrations/big_bang_2026/bhubaneswar"
                className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800"
              />
              <button
                onClick={handleFetchRtdb}
                disabled={loadingRtdb || !rtdbPath.trim()}
                className="px-5 py-2.5 bg-[#002147] hover:bg-[#001733] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {loadingRtdb ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Fetch Node</span>
              </button>
            </div>

            <div className="space-y-1">
              <textarea
                rows={14}
                value={rtdbData}
                onChange={(e) => setRtdbData(e.target.value)}
                placeholder='Click "Fetch Node" to view path JSON...'
                className="w-full p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-2xl border border-slate-800 focus:ring-2 focus:ring-amber-500 outline-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={handleSaveRtdb}
                disabled={!rtdbData || rtdbData === 'null'}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save JSON to Database</span>
              </button>

              <button
                onClick={handleDeleteRtdb}
                disabled={!rtdbPath.trim()}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Node</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: FULL FIELD REGISTRATION EDIT MODAL                               */}
      {/* ========================================================================= */}
      {showEditModal && editingCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-[#002147] uppercase">Full Candidate Field Editor</h3>
                <p className="text-xs text-slate-500 font-mono">Roll: {editingCandidate.rollNo} • Current Centre: {editingCandidate.registeredByCentre.toUpperCase()}</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Section 1: Personal Details */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2 text-[11px] text-amber-700">1. Personal & Contact Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Student Name</label>
                    <input
                      type="text"
                      value={editFormData.studentName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, studentName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Parent Name</label>
                    <input
                      type="text"
                      value={editFormData.parentName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, parentName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Email</label>
                    <input
                      type="email"
                      value={editFormData.email || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Phone</label>
                    <input
                      type="text"
                      value={editFormData.phone || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">School Name</label>
                    <input
                      type="text"
                      value={editFormData.schoolName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, schoolName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Exam Allotment & Centre Migration */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2 text-[11px] text-blue-700">2. Examination & Centre Allotment</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Allotted Centre (Migrate)</label>
                    <select
                      value={editFormData.targetCentreId || editingCandidate.registeredByCentre}
                      onChange={(e) => setEditFormData({ ...editFormData, targetCentreId: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                    >
                      {ALL_CENTRES.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Class</label>
                    <select
                      value={editFormData.currentClass || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, currentClass: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                    >
                      {BIG_BANG_CLASSES.map((cls) => (
                        <option key={cls.code} value={cls.label}>{cls.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Test Mode</label>
                    <select
                      value={editFormData.testMode || 'Offline'}
                      onChange={(e) => setEditFormData({ ...editFormData, testMode: e.target.value as any })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                    >
                      <option value="Offline">Offline Classroom CBT</option>
                      <option value="Proctored Online">Proctored Online</option>
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Test Date</label>
                    <input
                      type="text"
                      value={editFormData.testDate || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, testDate: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Financial & Hall Ticket Identifiers */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2 text-[11px] text-emerald-700">3. Financial & Document Identifiers</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Payment Status</label>
                    <select
                      value={editFormData.paymentStatus || 'paid'}
                      onChange={(e) => {
                        const status = e.target.value as any;
                        const fee = getRegistrationFeeForClass(editFormData.currentClass);
                        setEditFormData({ 
                          ...editFormData, 
                          paymentStatus: status,
                          paymentAmount: status === 'paid' ? fee : 0 
                        });
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                    >
                      <option value="paid">Paid</option>
                      <option value="free">Fee Waived (₹0)</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Fee Amount (₹)</label>
                    <input
                      type="number"
                      value={editFormData.paymentAmount ?? 0}
                      onChange={(e) => setEditFormData({ ...editFormData, paymentAmount: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Payment Ref</label>
                    <input
                      type="text"
                      value={editFormData.paymentRef || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, paymentRef: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800 text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Hall Ticket SID</label>
                    <input
                      type="text"
                      value={editFormData.sid || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, sid: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800 text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Invoice No</label>
                    <input
                      type="text"
                      value={editFormData.invoiceNo || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, invoiceNo: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800 text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Student UID</label>
                    <input
                      type="text"
                      value={editFormData.studentUid || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, studentUid: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800 text-[11px]"
                    />
                  </div>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={savingRegistration}
                onClick={handleSaveEditRegistration}
                className="px-6 py-2.5 bg-[#002147] hover:bg-[#001733] disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{savingRegistration ? 'Saving Changes...' : 'Save All Candidate Updates'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: NEW CANDIDATE REGISTRATION MODAL                                 */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-[#002147] uppercase">Register New Candidate</h3>
                <p className="text-xs text-slate-500">Creates an authentic candidate record, student account, and exam link.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleFillDemoData}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fill Random Test Data</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Target Centre</label>
                  <select
                    value={newRegCentre}
                    onChange={(e) => setNewRegCentre(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                  >
                    {ALL_CENTRES.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Class</label>
                  <select
                    value={newRegClass}
                    onChange={(e) => setNewRegClass(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                  >
                    {BIG_BANG_CLASSES.map((cls) => (
                      <option key={cls.code} value={cls.label}>{cls.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Student Full Name *</label>
                <input
                  type="text"
                  value={newRegName}
                  onChange={(e) => setNewRegName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Parent Name</label>
                  <input
                    type="text"
                    value={newRegParent}
                    onChange={(e) => setNewRegParent(e.target.value)}
                    placeholder="e.g. Suresh Kumar"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Phone</label>
                  <input
                    type="text"
                    value={newRegPhone}
                    onChange={(e) => setNewRegPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Email</label>
                <input
                  type="email"
                  value={newRegEmail}
                  onChange={(e) => setNewRegEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Test Mode</label>
                  <select
                    value={newRegMode}
                    onChange={(e) => setNewRegMode(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                  >
                    <option value="Offline">Offline CBT</option>
                    <option value="Proctored Online">Proctored Online</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Test Date</label>
                  <select
                    value={newRegDate}
                    onChange={(e) => setNewRegDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                  >
                    <option value="11th October 2026">11th October 2026</option>
                    <option value="18th October 2026">18th October 2026</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Payment</label>
                  <select
                    value={newRegPayment}
                    onChange={(e) => setNewRegPayment(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                  >
                    <option value="paid">Paid</option>
                    <option value="free">Fee Waived (₹0)</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Custom Roll No (Leave blank to auto-generate authentic FIITJEE format)
                </label>
                <input
                  type="text"
                  value={newRegCustomRoll}
                  onChange={(e) => setNewRegCustomRoll(e.target.value)}
                  placeholder="e.g. 1152 73733 111026 0099"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800 text-xs"
                />
              </div>

            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={savingRegistration || !newRegName.trim()}
                onClick={handleCreateNewCandidate}
                className="px-6 py-2.5 bg-[#002147] hover:bg-[#001733] disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>{savingRegistration ? 'Provisioning...' : 'Provision Candidate Now'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: STUDENT PROFILE EDIT MODAL                                       */}
      {/* ========================================================================= */}
      {showStudentEditModal && editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-[#002147] uppercase">Edit Student Account Profile</h3>
                <p className="text-xs text-slate-500 font-mono">UID: {editingStudent.uid}</p>
              </div>
              <button onClick={() => setShowStudentEditModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingStudent.fullName || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, fullName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Parent Name</label>
                <input
                  type="text"
                  value={editingStudent.parentName || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, parentName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={editingStudent.email || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingStudent.phone || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Current Class</label>
                  <select
                    value={editingStudent.currentClass || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, currentClass: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                  >
                    {BIG_BANG_CLASSES.map((cls) => (
                      <option key={cls.code} value={cls.label}>{cls.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Preferred Centre</label>
                  <select
                    value={editingStudent.preferredCentreId || 'bhubaneswar'}
                    onChange={(e) => setEditingStudent({ ...editingStudent, preferredCentreId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                  >
                    {ALL_CENTRES.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowStudentEditModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStudentProfile}
                className="px-5 py-2 bg-[#002147] hover:bg-[#001733] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Save Student Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: COUPON CREATE MODAL                                              */}
      {/* ========================================================================= */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-[#002147] uppercase">Create Promotional Coupon</h3>
                <p className="text-xs text-slate-500">Configure discount code, limits, and centre scoping.</p>
              </div>
              <button onClick={() => setShowCouponModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    value={couponFormData.code || ''}
                    onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. BBET26-100"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-800 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Target Centre</label>
                  <select
                    value={couponFormData.centreId || 'ALL'}
                    onChange={(e) => setCouponFormData({ ...couponFormData, centreId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                  >
                    <option value="ALL">All Centres (National)</option>
                    {ALL_CENTRES.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Description</label>
                <input
                  type="text"
                  value={couponFormData.description || ''}
                  onChange={(e) => setCouponFormData({ ...couponFormData, description: e.target.value })}
                  placeholder="e.g. 100% Fee Waiver for special registrations"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Discount Type</label>
                  <select
                    value={couponFormData.discountType || 'full'}
                    onChange={(e) => setCouponFormData({ ...couponFormData, discountType: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                  >
                    <option value="full">100% Full Waiver</option>
                    <option value="flat">Flat Amount (₹)</option>
                    <option value="percent">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Value ({couponFormData.discountType === 'flat' ? '₹' : '%'})
                  </label>
                  <input
                    type="number"
                    value={couponFormData.discountValue ?? 100}
                    onChange={(e) => setCouponFormData({ ...couponFormData, discountValue: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Max Uses</label>
                  <input
                    type="number"
                    value={couponFormData.maxUses ?? 9999}
                    onChange={(e) => setCouponFormData({ ...couponFormData, maxUses: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={couponFormData.isActive !== false}
                      onChange={(e) => setCouponFormData({ ...couponFormData, isActive: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span>Active for Redemptions</span>
                  </label>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowCouponModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCoupon}
                className="px-5 py-2 bg-[#002147] hover:bg-[#001733] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Save Coupon
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: REDEMPTIONS DRAWER                                               */}
      {/* ========================================================================= */}
      {viewingRedemptions && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-[#002147] uppercase">Redemptions Log: {viewingRedemptions.code}</h3>
                <p className="text-xs text-slate-500">{Object.keys(viewingRedemptions.redemptions || {}).length} total redemptions recorded</p>
              </div>
              <button onClick={() => setViewingRedemptions(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 text-xs">
              {Object.entries(viewingRedemptions.redemptions || {}).map(([rId, r]: [string, any]) => (
                <div key={rId} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">{r.studentName || 'Student'}</span>
                    <span className="font-mono text-[10px] text-slate-500">{r.rollNo} • {r.email}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-700 block font-mono">Saved ₹{r.amountSaved || 0}</span>
                    <span className="text-[10px] text-slate-400">{r.claimedAt ? new Date(r.claimedAt).toLocaleDateString() : ''}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingRedemptions(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: TICKET RESOLUTION DRAWER                                         */}
      {/* ========================================================================= */}
      {viewingTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-[#002147] uppercase">Resolve Ticket #{viewingTicket.ticketId}</h3>
                <p className="text-xs text-slate-500">From {viewingTicket.studentName} ({viewingTicket.centreId.toUpperCase()})</p>
              </div>
              <button onClick={() => setViewingTicket(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-900 block">{viewingTicket.subject}</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">{viewingTicket.description}</p>
            </div>

            <div className="space-y-1 text-xs">
              <label className="block text-[10px] font-bold text-slate-600 uppercase">Developer / Admin Resolution Reply</label>
              <textarea
                rows={4}
                value={ticketReplyText}
                onChange={(e) => setTicketReplyText(e.target.value)}
                placeholder="Enter official resolution or troubleshooting guidance for the student..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium outline-none focus:ring-2 focus:ring-[#002147]"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <button
                onClick={() => setViewingTicket(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={ticketActionLoading || !ticketReplyText.trim()}
                onClick={handleSendTicketReply}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Reply & Mark Resolved</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Mini Users Icon component helper if needed
const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);
