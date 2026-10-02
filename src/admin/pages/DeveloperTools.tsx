import React, { useState, useEffect } from 'react';
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
  ChevronRight
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
  inspectRtdbPath,
  writeRtdbPath,
  deleteRtdbPath,
  DEVELOPER_EMAIL
} from '../utils/developerUtils';
import { ref, get, set, remove } from 'firebase/database';
import { db } from '../../firebase';
import { ALL_CENTRES, CENTRES_CONFIG, getRegistrationFeeForClass, BIG_BANG_CLASSES, getClassOption } from '../utils/centreUtils';
import { ExamRegistration, CouponProfile } from '../../types';

export const DeveloperTools: React.FC = () => {
  const navigate = useNavigate();
  const { user, isDeveloper } = useAdminAuth();
  const actorEmail = user?.email || DEVELOPER_EMAIL;

  const [activeTab, setActiveTab] = useState<'registrations' | 'seeder' | 'coupons' | 'rtdb'>('registrations');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // --- TAB 1: REGISTRATION CRUD & DEREGISTER STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchedRecord, setSearchedRecord] = useState<ExamRegistration | null>(null);
  const [searchedCentreId, setSearchedCentreId] = useState<string>('bhubaneswar');
  const [actionLoading, setActionLoading] = useState(false);

  // Edit fields modal / form
  const [editPaymentStatus, setEditPaymentStatus] = useState<'paid' | 'free' | 'pending'>('paid');
  const [targetCentreMigrate, setTargetCentreMigrate] = useState<string>('dwarka');

  // --- TAB 2: SEEDER STATE ---
  const [seedCentre, setSeedCentre] = useState('bhubaneswar');
  const [seedClass, setSeedClass] = useState(BIG_BANG_CLASSES[5].label);
  const [seedMode, setSeedMode] = useState<'Offline' | 'Proctored Online'>('Offline');
  const [seedPayment, setSeedPayment] = useState<'paid' | 'free' | 'pending'>('paid');
  const [seedName, setSeedName] = useState('Demo Test Student');
  const [seeding, setSeeding] = useState(false);
  const [lastSeeded, setLastSeeded] = useState<any>(null);

  // --- TAB 3: COUPONS STATE ---
  const [coupons, setCoupons] = useState<CouponProfile[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [quickCouponCode, setQuickCouponCode] = useState('DEV100');
  const [quickCouponType, setQuickCouponType] = useState<'full' | 'flat'>('full');
  const [quickCouponValue, setQuickCouponValue] = useState(100);
  const [quickCouponCentre, setQuickCouponCentre] = useState('ALL');

  // --- TAB 4: RTDB EXPLORER STATE ---
  const [rtdbPath, setRtdbPath] = useState('registrations/big_bang_2026');
  const [rtdbData, setRtdbData] = useState<string>('');
  const [loadingRtdb, setLoadingRtdb] = useState(false);

  // Clear feedback after 5s
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Strictly enforce developer check on mount
  if (!isDeveloper || !isDeveloperEmail(user?.email)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center">
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

  // --- SEARCH REGISTRATION ACROSS CENTRES ---
  const handleSearchRegistration = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchedRecord(null);
    setFeedback(null);

    const clean = searchQuery.trim();
    const cleanKey = clean.replace(/\s+/g, '_');
    const centres = ['bhubaneswar', 'dwarka', 'ranchi', 'hyderabad'];

    try {
      // 1. Direct search by roll number or cleanKey across centres
      for (const c of centres) {
        const snap = await get(ref(db, `registrations/big_bang_2026/${c}/${cleanKey}`));
        if (snap.exists() && snap.val()?.studentName) {
          const rec = snap.val();
          setSearchedRecord({
            id: cleanKey,
            ...rec,
            rollNo: rec.rollNo || clean,
            registeredByCentre: c
          });
          setSearchedCentreId(c);
          setEditPaymentStatus(rec.paymentStatus || 'paid');
          setFeedback({ type: 'success', message: `Found registration for ${rec.studentName} under ${c.toUpperCase()}.` });
          setSearching(false);
          return;
        }
      }

      // 2. Query by phone, email, or studentUid
      for (const c of centres) {
        const snap = await get(ref(db, `registrations/big_bang_2026/${c}`));
        if (snap.exists()) {
          const all = snap.val();
          for (const [k, v] of Object.entries(all)) {
            if (k === '_init' || !v || typeof v !== 'object') continue;
            const r = v as any;
            const matchEmail = r.email && r.email.toLowerCase() === clean.toLowerCase();
            const matchPhone = r.phone && r.phone.replace(/\D/g, '') === clean.replace(/\D/g, '');
            const matchUid = r.studentUid && r.studentUid === clean;
            const matchRoll = r.rollNo && r.rollNo.toLowerCase() === clean.toLowerCase();

            if (matchEmail || matchPhone || matchUid || matchRoll) {
              setSearchedRecord({
                id: k,
                ...r,
                rollNo: r.rollNo || k,
                registeredByCentre: c
              });
              setSearchedCentreId(c);
              setEditPaymentStatus(r.paymentStatus || 'paid');
              setFeedback({ type: 'success', message: `Found registration for ${r.studentName} under ${c.toUpperCase()}.` });
              setSearching(false);
              return;
            }
          }
        }
      }

      setFeedback({ type: 'error', message: `No active registration found matching "${clean}".` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Search failed: ${err.message}` });
    } finally {
      setSearching(false);
    }
  };

  // --- DE-REGISTER EXAM ---
  const handleDeregister = async () => {
    if (!searchedRecord) return;
    const confirm = window.confirm(
      `[DEVELOPER MODE: DE-REGISTER EXAM]\n\nDe-register candidate ${searchedRecord.studentName} (${searchedRecord.rollNo}) from Big Bang Edge Test 2026?\n\nThis will remove the registration node from RTDB and remove the registered exam link from their student account, allowing you or the student to test registration again from scratch.`
    );
    if (!confirm) return;

    setActionLoading(true);
    try {
      const res = await deregisterCandidateExam({
        rollNo: searchedRecord.rollNo,
        centreId: searchedCentreId,
        studentUid: searchedRecord.studentUid,
        examId: 'big_bang_2026',
        actorEmail
      });
      setFeedback({ type: 'success', message: res.message });
      setSearchedRecord(null);
    } catch (err: any) {
      setFeedback({ type: 'error', message: `De-registration failed: ${err.message}` });
    } finally {
      setActionLoading(false);
    }
  };

  // --- PURGE COMPLETELY ---
  const handlePurgeComplete = async () => {
    if (!searchedRecord) return;
    const confirm = window.confirm(
      `[DEVELOPER MODE: PURGE EVERYTHING]\n\nPERMANENTLY DELETE candidate ${searchedRecord.studentName} (${searchedRecord.rollNo}), their registration, RTDB student node, results, and Firebase Auth credentials?\n\nThis cannot be undone.`
    );
    if (!confirm) return;

    setActionLoading(true);
    try {
      const res = await purgeCandidateRegistration({
        rollNo: searchedRecord.rollNo,
        actorEmail
      });
      setFeedback({ type: 'success', message: `Purged completely: ${res.message}` });
      setSearchedRecord(null);
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Purge failed: ${err.message}` });
    } finally {
      setActionLoading(false);
    }
  };

  // --- UPDATE PAYMENT STATUS ---
  const handleUpdatePaymentStatus = async (status: 'paid' | 'free' | 'pending') => {
    if (!searchedRecord) return;
    setActionLoading(true);
    try {
      const fee = getRegistrationFeeForClass(searchedRecord.currentClass);
      const amount = status === 'paid' ? fee : 0;
      await updateRegistrationFieldDirect({
        rollNo: searchedRecord.rollNo,
        centreId: searchedCentreId,
        updates: {
          paymentStatus: status,
          paymentAmount: amount
        },
        actorEmail
      });
      setSearchedRecord(prev => prev ? { ...prev, paymentStatus: status, paymentAmount: amount } : null);
      setEditPaymentStatus(status);
      setFeedback({ type: 'success', message: `Payment status updated to ${status.toUpperCase()} (₹${amount}).` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Update failed: ${err.message}` });
    } finally {
      setActionLoading(false);
    }
  };

  // --- MIGRATE CENTRE ---
  const handleMigrateCentre = async () => {
    if (!searchedRecord || targetCentreMigrate === searchedCentreId) return;
    setActionLoading(true);
    try {
      await migrateRegistrationCentre({
        rollNo: searchedRecord.rollNo,
        fromCentreId: searchedCentreId,
        toCentreId: targetCentreMigrate,
        actorEmail
      });
      setSearchedCentreId(targetCentreMigrate);
      setSearchedRecord(prev => prev ? { ...prev, registeredByCentre: targetCentreMigrate, selectedCenter: CENTRES_CONFIG[targetCentreMigrate]?.name } : null);
      setFeedback({ type: 'success', message: `Successfully transferred registration to ${targetCentreMigrate.toUpperCase()}.` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Migration failed: ${err.message}` });
    } finally {
      setActionLoading(false);
    }
  };

  // --- SEED TEST CANDIDATE ---
  const handleSeedCandidate = async () => {
    setSeeding(true);
    setFeedback(null);
    try {
      const res = await seedTestRegistration({
        centreId: seedCentre,
        currentClass: seedClass,
        testMode: seedMode,
        paymentStatus: seedPayment,
        studentName: seedName.trim() || 'Developer Test Candidate',
        actorEmail
      });
      setLastSeeded(res.details);
      setFeedback({ type: 'success', message: res.message });
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Seeding failed: ${err.message}` });
    } finally {
      setSeeding(false);
    }
  };

  // --- COUPONS QUICK CRUD ---
  const loadCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const snap = await get(ref(db, 'coupons'));
      if (snap.exists()) {
        const all = snap.val();
        const list: CouponProfile[] = [];
        for (const [k, v] of Object.entries(all)) {
          if (!v || typeof v !== 'object') continue;
          list.push({ id: k, ...(v as any) });
        }
        setCoupons(list);
      } else {
        setCoupons([]);
      }
    } catch (err: any) {
      console.warn('Failed loading coupons:', err);
    } finally {
      setLoadingCoupons(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'coupons') {
      loadCoupons();
    }
  }, [activeTab]);

  const handleCreateQuickCoupon = async () => {
    if (!quickCouponCode.trim()) return;
    try {
      const code = quickCouponCode.trim().toUpperCase();
      const newCouponRef = ref(db, `coupons/${code}`);
      const couponPayload: CouponProfile = {
        id: code,
        code: code,
        description: `Developer test coupon created by ${actorEmail}`,
        centreId: quickCouponCentre,
        discountType: quickCouponType,
        discountValue: Number(quickCouponValue) || 100,
        maxUses: 9999,
        usedCount: 0,
        isActive: true,
        isEmailRestricted: false,
        createdBy: actorEmail,
        createdAt: new Date().toISOString()
      };
      await set(newCouponRef, couponPayload);
      setFeedback({ type: 'success', message: `Coupon ${code} created successfully!` });
      loadCoupons();
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Coupon creation failed: ${err.message}` });
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!window.confirm(`Delete coupon ${couponId}?`)) return;
    try {
      await remove(ref(db, `coupons/${couponId}`));
      setFeedback({ type: 'success', message: `Coupon ${couponId} deleted.` });
      loadCoupons();
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Delete failed: ${err.message}` });
    }
  };

  const handleResetCouponUses = async (couponId: string) => {
    try {
      await set(ref(db, `coupons/${couponId}/usedCount`), 0);
      await remove(ref(db, `coupons/${couponId}/redemptions`));
      setFeedback({ type: 'success', message: `Coupon ${couponId} usage reset to 0.` });
      loadCoupons();
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Reset failed: ${err.message}` });
    }
  };

  // --- RTDB EXPLORER ---
  const handleFetchRtdb = async () => {
    if (!rtdbPath.trim()) return;
    setLoadingRtdb(true);
    try {
      const data = await inspectRtdbPath({ path: rtdbPath, actorEmail });
      setRtdbData(JSON.stringify(data, null, 2) || 'null');
      setFeedback({ type: 'success', message: `Successfully fetched snapshot of "${rtdbPath}".` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: `RTDB fetch failed: ${err.message}` });
    } finally {
      setLoadingRtdb(false);
    }
  };

  const handleSaveRtdb = async () => {
    if (!rtdbPath.trim()) return;
    try {
      const parsed = JSON.parse(rtdbData);
      await writeRtdbPath({ path: rtdbPath, data: parsed, actorEmail });
      setFeedback({ type: 'success', message: `Successfully saved node at "${rtdbPath}".` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: `RTDB save failed: ${err.message}` });
    }
  };

  const handleDeleteRtdb = async () => {
    if (!rtdbPath.trim()) return;
    if (!window.confirm(`DANGER: Permanently delete RTDB node at "${rtdbPath}"?`)) return;
    try {
      await deleteRtdbPath({ path: rtdbPath, actorEmail });
      setRtdbData('null');
      setFeedback({ type: 'success', message: `Successfully deleted node at "${rtdbPath}".` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: `RTDB delete failed: ${err.message}` });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      
      {/* Top Banner & Security Header */}
      <div className="bg-gradient-to-r from-slate-900 via-[#001733] to-[#002147] rounded-3xl p-6 sm:p-8 text-white border border-amber-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[10px] font-black uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5" />
                <span>Developer Sandbox & Database Operations</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified: {actorEmail}</span>
              </span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <span>Developer Control Station</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Rapid test management, instant candidate de-registration, multi-centre CRUD, coupon generation, and direct RTDB administration.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-white/10 cursor-pointer"
            >
              <span>Student Portal View</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div className={`mt-5 p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200 ${
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
            <span>De-Register & Candidate CRUD</span>
          </button>

          <button
            onClick={() => setActiveTab('seeder')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'seeder'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Click Test Seeder</span>
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
            <span>Coupons Quick CRUD</span>
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
            <span>RTDB Node Inspector & CRUD</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: REGISTRATION CRUD & INSTANT DE-REGISTRATION                         */}
      {/* ========================================================================= */}
      {activeTab === 'registrations' && (
        <div className="space-y-6">
          
          {/* Search Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-black text-[#002147] uppercase tracking-wide flex items-center gap-2">
                <Search className="w-4 h-4 text-amber-500" />
                <span>Locate Candidate Across All Centres</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Query candidate by Roll Number (with or without spaces), Registered Phone, Student Email, or UID.
              </p>
            </div>

            <form onSubmit={handleSearchRegistration} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. 115210260021, 9876543210, shivam.strive@gmail.com, or dev_test_..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={searching || !searchQuery.trim()}
                className="px-6 py-2.5 bg-[#002147] hover:bg-[#001733] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                {searching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Locate Record</span>
              </button>
            </form>
          </div>

          {/* Searched Dossier & CRUD Actions */}
          {searchedRecord && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
              
              {/* Record Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xl font-black text-[#002147] uppercase">
                      {searchedRecord.studentName}
                    </span>
                    <span className="font-mono text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full">
                      {searchedRecord.rollNo}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full">
                      Centre: {searchedCentreId.toUpperCase()}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      searchedRecord.paymentStatus === 'paid' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : searchedRecord.paymentStatus === 'free' 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      Payment: {searchedRecord.paymentStatus || 'Pending'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Student UID: <code className="font-mono text-slate-700">{searchedRecord.studentUid || 'None'}</code> • Email: <code className="font-mono text-slate-700">{searchedRecord.email}</code> • Phone: <code className="font-mono text-slate-700">{searchedRecord.phone}</code>
                  </p>
                </div>

                {/* Primary Dangerous / Developer Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleDeregister}
                    disabled={actionLoading}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    title="Removes registration node & student registeredExams link so you can test registration again"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
                    <span>De-Register Exam (Reset Flow)</span>
                  </button>

                  <button
                    onClick={handlePurgeComplete}
                    disabled={actionLoading}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                    title="Purge registration, student profile, and Firebase Auth account completely"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Purge Record & Auth</span>
                  </button>
                </div>
              </div>

              {/* Instant Controls Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                
                {/* Control 1: Payment Status Switcher */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-[#ED1C24]" />
                      <span>Payment Status CRUD</span>
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-500">
                      ₹{searchedRecord.paymentAmount || 0}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Instant toggle without going through payment gateways.
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleUpdatePaymentStatus('paid')}
                      className={`py-2 rounded-xl text-[11px] font-black uppercase tracking-wider cursor-pointer border transition-all ${
                        searchedRecord.paymentStatus === 'paid'
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                          : 'bg-white hover:bg-emerald-50 text-emerald-800 border-slate-200'
                      }`}
                    >
                      Paid
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleUpdatePaymentStatus('free')}
                      className={`py-2 rounded-xl text-[11px] font-black uppercase tracking-wider cursor-pointer border transition-all ${
                        searchedRecord.paymentStatus === 'free'
                          ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                          : 'bg-white hover:bg-blue-50 text-blue-800 border-slate-200'
                      }`}
                    >
                      Waived
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleUpdatePaymentStatus('pending')}
                      className={`py-2 rounded-xl text-[11px] font-black uppercase tracking-wider cursor-pointer border transition-all ${
                        searchedRecord.paymentStatus === 'pending'
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                          : 'bg-white hover:bg-amber-50 text-amber-900 border-slate-200'
                      }`}
                    >
                      Pending
                    </button>
                  </div>
                </div>

                {/* Control 2: Centre Migration */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span>Migrate Centre Allotment</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase">
                      Current: {searchedCentreId}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Transfers the entire candidate node, updating indices automatically.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <select
                      value={targetCentreMigrate}
                      onChange={(e) => setTargetCentreMigrate(e.target.value)}
                      className="flex-1 p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                    >
                      {ALL_CENTRES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.id})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={actionLoading || targetCentreMigrate === searchedCentreId}
                      onClick={handleMigrateCentre}
                      className="px-4 py-2 bg-[#002147] hover:bg-[#001733] disabled:opacity-40 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shrink-0"
                    >
                      Transfer
                    </button>
                  </div>
                </div>

                {/* Control 3: Quick Field Editor */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <span className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-amber-600" />
                    <span>Candidate Info Summary</span>
                  </span>
                  <div className="space-y-1 text-[11px] text-slate-600">
                    <div><strong>Class:</strong> {searchedRecord.currentClass}</div>
                    <div><strong>Test Date:</strong> {searchedRecord.testDate}</div>
                    <div><strong>Test Mode:</strong> {searchedRecord.testMode}</div>
                    <div><strong>Hall Ticket SID:</strong> <span className="font-mono">{searchedRecord.sid || 'N/A'}</span></div>
                    <div><strong>Tax Invoice:</strong> <span className="font-mono">{searchedRecord.invoiceNo || 'N/A'}</span></div>
                  </div>
                  <button
                    onClick={() => navigate(`/admin/registrations/${searchedRecord.rollNo}`)}
                    className="text-xs font-bold text-[#002147] hover:underline flex items-center gap-1 pt-1"
                  >
                    <span>Open Full Dossier Editor</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: 1-CLICK TEST CANDIDATE SEEDER                                       */}
      {/* ========================================================================= */}
      {activeTab === 'seeder' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Instant Data Provisioner</span>
            </div>
            <h2 className="text-lg font-black text-[#002147] uppercase tracking-wide">
              Generate & Provision Verified Test Candidate
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Creates a mock student profile with an authentic roll number, hall ticket, payment record, and centre allotment in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-[10px]">
                Target Centre
              </label>
              <select
                value={seedCentre}
                onChange={(e) => setSeedCentre(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
              >
                {ALL_CENTRES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-[10px]">
                Student Class
              </label>
              <select
                value={getClassOption(seedClass).label}
                onChange={(e) => setSeedClass(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
              >
                {BIG_BANG_CLASSES.map((cls) => (
                  <option key={cls.code} value={cls.label}>{cls.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-[10px]">
                Test Mode
              </label>
              <select
                value={seedMode}
                onChange={(e) => setSeedMode(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
              >
                <option value="Offline">Offline Classroom CBT</option>
                <option value="Proctored Online">Proctored Online</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-[10px]">
                Payment Status
              </label>
              <select
                value={seedPayment}
                onChange={(e) => setSeedPayment(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
              >
                <option value="paid">Paid (₹{getRegistrationFeeForClass(seedClass)})</option>
                <option value="free">Fee Waived (₹0)</option>
                <option value="pending">Payment Pending</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-[10px]">
              Candidate Full Name
            </label>
            <input
              type="text"
              value={seedName}
              onChange={(e) => setSeedName(e.target.value)}
              placeholder="Candidate Full Name"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSeedCandidate}
              disabled={seeding}
              className="px-6 py-3 bg-[#002147] hover:bg-[#001733] disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{seeding ? 'Generating Candidate...' : '⚡ Generate Test Candidate Now'}</span>
            </button>
          </div>

          {/* Last Seeded Preview */}
          {lastSeeded && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-black text-emerald-800 uppercase">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Candidate Provisioned & Linked Successfully</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono text-emerald-950">
                <div><strong>Roll Number:</strong> {lastSeeded.rollNo}</div>
                <div><strong>Student UID:</strong> {lastSeeded.studentUid}</div>
                <div><strong>Mock Email:</strong> {lastSeeded.email}</div>
              </div>
              <div className="pt-1">
                <button
                  onClick={() => {
                    setSearchQuery(lastSeeded.rollNo);
                    setActiveTab('registrations');
                    handleSearchRegistration();
                  }}
                  className="text-xs font-bold text-emerald-900 underline hover:text-emerald-950 cursor-pointer"
                >
                  View in Candidate CRUD Station &rarr;
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PROMO COUPONS QUICK CRUD                                           */}
      {/* ========================================================================= */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          
          {/* Quick Create Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-black text-[#002147] uppercase tracking-wide flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-500" />
                <span>Create Test Coupon Code</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Quickly create promo codes like DEV100 (100% waiver) or DEV500 (₹500 flat off) for rapid verification.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                  Coupon Code
                </label>
                <input
                  type="text"
                  value={quickCouponCode}
                  onChange={(e) => setQuickCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. DEV100"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-800 uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                  Discount Type
                </label>
                <select
                  value={quickCouponType}
                  onChange={(e) => setQuickCouponType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  <option value="full">100% Full Waiver</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                  Discount Value ({quickCouponType === 'full' ? '%' : '₹'})
                </label>
                <input
                  type="number"
                  value={quickCouponValue}
                  onChange={(e) => setQuickCouponValue(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                  Target Centre
                </label>
                <select
                  value={quickCouponCentre}
                  onChange={(e) => setQuickCouponCentre(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  <option value="ALL">All Centres (National)</option>
                  {ALL_CENTRES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleCreateQuickCoupon}
                className="px-5 py-2.5 bg-[#002147] hover:bg-[#001733] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Create Coupon Now</span>
              </button>
              <button
                type="button"
                onClick={loadCoupons}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh List</span>
              </button>
            </div>
          </div>

          {/* Coupon Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-700">
                Active Promotional Coupons ({coupons.length})
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3 pl-4">Code</th>
                    <th className="p-3">Centre</th>
                    <th className="p-3">Discount</th>
                    <th className="p-3">Usage</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingCoupons ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                        Loading coupon list...
                      </td>
                    </tr>
                  ) : coupons.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                        No coupons found in database.
                      </td>
                    </tr>
                  ) : (
                    coupons.map((c) => (
                      <tr key={c.id || c.code} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 pl-4 font-mono font-black text-[#002147]">
                          {c.code}
                        </td>
                        <td className="p-3 font-semibold text-slate-700">
                          {c.centreId || 'ALL'}
                        </td>
                        <td className="p-3 font-bold text-emerald-700">
                          {c.discountType === 'full' ? '100% Free' : c.discountType === 'flat' ? `₹${c.discountValue}` : `${c.discountValue}%`}
                        </td>
                        <td className="p-3 font-mono text-slate-600">
                          {c.usedCount || 0} / {c.maxUses || '∞'}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {c.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-3 pr-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleResetCouponUses(c.id || c.code)}
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg cursor-pointer"
                            title="Reset Used Count to 0"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCoupon(c.id || c.code)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: REALTIME DATABASE NODE EXPLORER & CRUD                             */}
      {/* ========================================================================= */}
      {activeTab === 'rtdb' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
              <Database className="w-4 h-4" />
              <span>Realtime Database Raw CRUD</span>
            </div>
            <h2 className="text-base font-black text-[#002147] uppercase tracking-wide">
              Inspect, Edit, and Delete RTDB Nodes
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Read any JSON path in Firebase RTDB, edit properties, or delete stray nodes directly without opening Firebase Console.
            </p>
          </div>

          {/* Path Presets */}
          <div className="flex flex-wrap gap-1.5">
            {[
              'registrations/big_bang_2026',
              'registrations/big_bang_2026/bhubaneswar',
              'registrations/big_bang_2026/dwarka',
              'registrations/big_bang_2026/ranchi',
              'registrations/big_bang_2026/hyderabad',
              'coupons',
              'students',
              'exams'
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

          {/* Path Input */}
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
              className="px-5 py-2.5 bg-[#002147] hover:bg-[#001733] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {loadingRtdb ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Fetch Node</span>
            </button>
          </div>

          {/* JSON Editor / Viewer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                JSON Node Payload
              </label>
              <span className="text-[10px] text-slate-400">
                Valid JSON required to save
              </span>
            </div>
            <textarea
              rows={16}
              value={rtdbData}
              onChange={(e) => setRtdbData(e.target.value)}
              placeholder='Click "Fetch Node" to inspect path JSON...'
              className="w-full p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-2xl border border-slate-800 focus:ring-2 focus:ring-amber-500 outline-none leading-relaxed"
            />
          </div>

          {/* RTDB Actions */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveRtdb}
                disabled={!rtdbData || rtdbData === 'null'}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save JSON to Database</span>
              </button>
            </div>

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
      )}

    </div>
  );
};
