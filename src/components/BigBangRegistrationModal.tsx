import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Printer, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  School,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ref, push, set, get, query, orderByChild, equalTo, update } from 'firebase/database';
import { db, auth, firebaseConfig } from '../firebase';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { BIG_BANG_EXAM, BIG_BANG_CLASSES, getClassOption, getRegistrationFeeForClass } from '../data/examsData';
import { ExamRegistration } from '../types';
import { FiitjeeLogo } from './FiitjeeLogo';
import { OfficialHallTicket } from './OfficialHallTicket';

import { PaymentStep, PaymentCompletionData } from './PaymentStep';
import { getCentreByName, generateSID, generateInvoiceNumber, generateRollNumber } from '../admin/utils/centreUtils';
import { redeemCoupon } from '../admin/utils/couponUtils';
import { getCentreExamById, calculateExamFeeForClass, CentreExamConfig } from '../admin/utils/examUtils';
import { printElementById } from '../utils/printUtils';
import { useStudentAuth } from '../student/hooks/useStudentAuth';
import { useNavigate } from 'react-router-dom';

interface BigBangRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  examId?: string;
}

const initialFormData = {
  studentName: '',
  parentName: '',
  currentClass: BIG_BANG_CLASSES[5].label,
  schoolName: '',
  phone: '',
  email: '',
  testDate: '11th October 2026 (Sunday)',
  testMode: 'Offline' as 'Offline' | 'Proctored Online',
  selectedCenter: 'Bhubaneswar',
  testCentreCode: '820'
};

// Deep sanitize helper to eliminate any undefined values that crash Firebase RTDB
function sanitizeForFirebase<T>(obj: T): T {
  if (obj === null || obj === undefined) return null as any;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirebase) as any;
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      clean[k] = sanitizeForFirebase(v);
    }
  }
  return clean as T;
}

export const BigBangRegistrationModal: React.FC<BigBangRegistrationModalProps> = ({
  isOpen,
  onClose,
  examId = 'big-bang-edge-test'
}) => {
  const navigate = useNavigate();
  const { student, isAuthenticated } = useStudentAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [registration, setRegistration] = useState<ExamRegistration | null>(null);
  const [formData, setFormData] = useState({ ...initialFormData });
  const [lastPaymentData, setLastPaymentData] = useState<PaymentCompletionData | null>(null);
  const [assignedRollNo, setAssignedRollNo] = useState<string | null>(null);
  const [examConfig, setExamConfig] = useState<CentreExamConfig | null>(null);
  const [loadingExamConfig, setLoadingExamConfig] = useState<boolean>(false);

  const targetCentreProfile = getCentreByName(formData.selectedCenter);
  const targetCentreId = targetCentreProfile?.id || 'bhubaneswar';

  // Reset form when modal opens and populate with authenticated student's profile
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSubmitState('idle');
      setErrorMessage(null);
      setDuplicateWarning(null);
      setRegistration(null);
      setAssignedRollNo(null);
      setLastPaymentData(null);

      if (student) {
        let defaultCenter = 'Bhubaneswar';
        if (student.preferredCentreId === 'dwarka') defaultCenter = 'Dwarka';
        else if (student.preferredCentreId === 'ranchi') defaultCenter = 'Ranchi';
        else if (student.preferredCentreId === 'hyderabad') defaultCenter = 'Hyderabad';
        else if (student.preferredCentreId === 'bhubaneswar') defaultCenter = 'Bhubaneswar';

        setFormData({
          studentName: student.fullName || '',
          parentName: student.parentName || '',
          currentClass: student.currentClass ? getClassOption(student.currentClass).label : BIG_BANG_CLASSES[5].label,
          schoolName: student.schoolName || '',
          phone: student.phone || '',
          email: student.email || '',
          testDate: '11th October 2026 (Sunday)',
          testMode: 'Offline',
          selectedCenter: defaultCenter
        });
      } else {
        setFormData({ 
          ...initialFormData,
          currentClass: BIG_BANG_CLASSES[5].label
        });
      }
    }
  }, [isOpen, student]);

  // Synchronize dynamic exam configuration for the selected centre
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setLoadingExamConfig(true);

    getCentreExamById(targetCentreId, examId)
      .then((cfg) => {
        if (isMounted && cfg) {
          setExamConfig(cfg);
          if (cfg.testDates && cfg.testDates.length > 0 && !cfg.testDates.includes(formData.testDate)) {
            setFormData(prev => ({ ...prev, testDate: cfg.testDates[0] }));
          }
          if (cfg.modes && cfg.modes.length > 0 && !cfg.modes.includes(formData.testMode as any)) {
            setFormData(prev => ({ ...prev, testMode: cfg.modes[0] }));
          }
        }
      })
      .finally(() => {
        if (isMounted) setLoadingExamConfig(false);
      });

    return () => { isMounted = false; };
  }, [isOpen, targetCentreId, examId]);

  if (!isOpen) return null;

  // Unauthenticated Gate: Student must be logged in to register
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6 animate-in fade-in">
          {/* Header */}
          <div className="bg-[#002147] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#ED1C24]">
            <div className="flex items-center gap-3">
              <FiitjeeLogo variant="white" size="sm" showTagline={false} />
              <div>
                <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">Spotlight Admissions</div>
                <h2 className="text-base font-extrabold font-display">Student Sign In Required</h2>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-5 text-center">
            <div className="w-16 h-16 bg-red-50 text-[#ED1C24] rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-red-100">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-extrabold text-[#002147] text-lg uppercase tracking-tight">
                Log In to Register for Big Bang 2026
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                Exam registrations are securely linked to your Student Dashboard so you can access your Official Hall Ticket and CBT test portal anytime.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => { onClose(); navigate('/student/login?redirect=/&openBigBang=true'); }}
                className="w-full py-3 bg-[#002147] hover:bg-[#001733] text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md uppercase tracking-wider transition-all"
              >
                <span>Sign In to Student Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => { onClose(); navigate('/student/login?mode=register&redirect=/&openBigBang=true'); }}
                className="w-full py-3 bg-[#ED1C24] hover:bg-[#d6171e] text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md uppercase tracking-wider transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create Free Student Account</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Registration takes only 30 seconds with instant admit card generation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (examConfig && examConfig.registrationOpen === false) {
        setErrorMessage(`Registrations for FIITJEE ${formData.selectedCenter} Centre are currently paused.`);
        return;
      }
      // Perform duplicate check before showing review screen
      setSubmitState('submitting');
      setDuplicateWarning(null);
      try {
        const selCentre = getCentreByName(formData.selectedCenter || 'Bhubaneswar');
        const centreId = selCentre.id;
        const dbRef = ref(db, `${BIG_BANG_EXAM.registrationDbPath}/${centreId}`);
        let existingReg: ExamRegistration | null = null;

        try {
          const phoneQuery = query(dbRef, orderByChild('phone'), equalTo(formData.phone));
          const snapshot = await get(phoneQuery);
          if (snapshot.exists()) {
            const val = snapshot.val();
            const validRecords = Object.values(val).filter((r: any) => r && r.rollNo);
            if (validRecords.length > 0) {
              existingReg = validRecords[0] as ExamRegistration;
            }
          }
        } catch {
          // Resilient fallback: fetch centre nodes and check phone client-side
          try {
            const snapshot = await get(dbRef);
            if (snapshot.exists()) {
              const val = snapshot.val();
              const validRecords = Object.values(val).filter((r: any) => r && r.phone === formData.phone && r.rollNo);
              if (validRecords.length > 0) {
                existingReg = validRecords[0] as ExamRegistration;
              }
            }
          } catch {
            // Silently ignore if network or permissions fail
          }
        }

        if (existingReg) {
          setDuplicateWarning(`A registration already exists for this phone number at ${selCentre.name} Centre. Roll No: ${existingReg.rollNo}.`);
        }
      } catch (err: any) {
        // Non-blocking warning only
      } finally {
        setSubmitState('idle');
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handlePaymentComplete = async (paymentData: PaymentCompletionData) => {
    setSubmitState('submitting');
    setErrorMessage(null);
    setLastPaymentData(paymentData);

    try {
      const selectedCentreProfile = getCentreByName(formData.selectedCenter || 'Bhubaneswar');
      const centreId = selectedCentreProfile.id;

      const effectiveTestCentreCode = (centreId === 'ranchi' && formData.testCentreCode) ? formData.testCentreCode : selectedCentreProfile.testCentreCode;
      const seqSuffix = Date.now().toString().slice(-4);
      
      // Determine guaranteed collision-free Roll Number
      let rollNo = assignedRollNo;
      if (!rollNo) {
        try {
          const centreRegsRef = ref(db, `${BIG_BANG_EXAM.registrationDbPath}/${centreId}`);
          const snap = await get(centreRegsRef);
          const existingKeys = snap.exists() ? Object.keys(snap.val()) : [];
          
          let candidateSeq = Math.max(1, existingKeys.filter(k => k !== '_init').length + 1);
          let generated = generateRollNumber(selectedCentreProfile, formData.testDate, candidateSeq, effectiveTestCentreCode, formData.currentClass);
          let cleanKey = generated.replace(/\s+/g, '_');
          
          while (existingKeys.includes(cleanKey)) {
            candidateSeq++;
            generated = generateRollNumber(selectedCentreProfile, formData.testDate, candidateSeq, effectiveTestCentreCode, formData.currentClass);
            cleanKey = generated.replace(/\s+/g, '_');
          }
          rollNo = generated;
        } catch {
          const randSuffix = Math.floor(1000 + Math.random() * 9000);
          rollNo = generateRollNumber(selectedCentreProfile, formData.testDate, randSuffix, effectiveTestCentreCode, formData.currentClass);
        }
        setAssignedRollNo(rollNo);
      }

      const sid = generateSID(rollNo);
      const invoiceNo = generateInvoiceNumber(selectedCentreProfile, rollNo);

      const cleanEmail = formData.email.trim().toLowerCase();
      let effectiveStudentUid = '';

      // Only inherit student.uid or auth.currentUser.uid if their email matches formData.email
      if (student && student.email && student.email.trim().toLowerCase() === cleanEmail) {
        effectiveStudentUid = student.uid;
      } else if (auth.currentUser && auth.currentUser.email && auth.currentUser.email.trim().toLowerCase() === cleanEmail) {
        effectiveStudentUid = auth.currentUser.uid;
      }

      const defaultPassword = 'Fiitjee@2026';

      // If candidate is not currently logged in with this email, auto-provision their student account in Firebase Auth
      if (!effectiveStudentUid && cleanEmail) {
        try {
          const secondaryApp = getApps().find(a => a.name === 'SecondaryStudentRegistrar') 
            || initializeApp(firebaseConfig, 'SecondaryStudentRegistrar');
          const secondaryAuth = getAuth(secondaryApp);
          try {
            const userCred = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, defaultPassword);
            effectiveStudentUid = userCred.user.uid;
            await signOut(secondaryAuth);
          } catch (authErr: any) {
            console.log('Student account registration notice:', authErr.code);
            if (authErr.code === 'auth/email-already-in-use') {
              try {
                const existingCred = await signInWithEmailAndPassword(secondaryAuth, cleanEmail, defaultPassword);
                effectiveStudentUid = existingCred.user.uid;
                await signOut(secondaryAuth);
              } catch {}
            }
          }
        } catch (e) {
          console.warn('Could not initialize secondary auth for online registration:', e);
        }
      }

      const payload: ExamRegistration = {
        examId: BIG_BANG_EXAM.id,
        examYear: BIG_BANG_EXAM.year,
        studentName: formData.studentName.trim(),
        parentName: formData.parentName.trim(),
        currentClass: formData.currentClass,
        schoolName: formData.schoolName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        testDate: formData.testDate,
        testMode: formData.testMode,
        selectedCenter: selectedCentreProfile.name,
        registeredAt: new Date().toISOString(),
        rollNo: rollNo,
        sid: sid,
        invoiceNo: invoiceNo,
        invoiceDate: new Date().toISOString().split('T')[0],
        status: 'Confirmed',
        paymentStatus: paymentData.paymentStatus || 'paid',
        paymentAmount: Number(paymentData.paymentAmount) || 0,
        cashfreeOrderId: paymentData.cashfreeOrderId || '',
        cashfreePaymentId: paymentData.cashfreePaymentId || '',
        couponCodeApplied: paymentData.couponCodeApplied || '',
        discountAmount: Number(paymentData.discountAmount) || 0,
        paymentRef: paymentData.paymentRef || (paymentData.cashfreePaymentId ? `CF-${paymentData.cashfreePaymentId}` : `${selectedCentreProfile.numericCode}/ADM-${seqSuffix}`),
        studentUid: effectiveStudentUid || undefined
      };

      const cleanRollKey = rollNo.replace(/\s+/g, '_');
      const dbRef = ref(db, `${BIG_BANG_EXAM.registrationDbPath}/${centreId}/${cleanRollKey}`);
      await set(dbRef, sanitizeForFirebase(payload));

      // Link registration to authenticated or newly provisioned student profile
      if (effectiveStudentUid) {
        try {
          const studentProfileRef = ref(db, `students/${effectiveStudentUid}`);
          await update(studentProfileRef, sanitizeForFirebase({
            uid: effectiveStudentUid,
            fullName: formData.studentName.trim(),
            parentName: formData.parentName.trim(),
            email: cleanEmail,
            phone: formData.phone.trim(),
            currentClass: formData.currentClass,
            schoolName: formData.schoolName.trim(),
            city: selectedCentreProfile.name,
            preferredCentreId: centreId,
            profileStatus: 'Official candidate profile. Logon to www.fiitjee.online to update details',
            registeredAt: new Date().toISOString()
          }));

          const studentExamLinkRef = ref(db, `students/${effectiveStudentUid}/registeredExams/big_bang_2026`);
          await set(studentExamLinkRef, sanitizeForFirebase({
            examId: BIG_BANG_EXAM.id,
            examName: BIG_BANG_EXAM.name,
            rollNo: rollNo,
            centreId: centreId,
            selectedCenter: selectedCentreProfile.name,
            testDate: formData.testDate,
            testMode: formData.testMode,
            registeredAt: new Date().toISOString(),
            paymentStatus: paymentData.paymentStatus || 'paid',
            paymentAmount: Number(paymentData.paymentAmount) || 0,
            paymentRef: payload.paymentRef || '',
            invoiceNo: invoiceNo,
            sid: sid
          }));

          // Ensure student is also indexed under this centre in CRM
          await set(ref(db, `student_centre_index/${centreId}/${effectiveStudentUid}`), true);
        } catch (linkErr) {
          console.error("Error linking exam to student profile:", linkErr);
        }

        // If no user is logged in on primary auth, automatically sign them in
        if (!auth.currentUser && cleanEmail) {
          try {
            await signInWithEmailAndPassword(auth, cleanEmail, defaultPassword);
          } catch {
            // Safe ignore if password differs
          }
        }
      }

      // Redeem coupon if applied
      if (paymentData.couponCodeApplied) {
        try {
          const couponsSnap = await get(ref(db, 'coupons'));
          if (couponsSnap.exists()) {
            const all = couponsSnap.val();
            let redeemed = false;
            for (const [topKey, topVal] of Object.entries(all)) {
              if (!topVal || typeof topVal !== 'object') continue;
              if ((topVal as any).code?.toUpperCase() === paymentData.couponCodeApplied.toUpperCase()) {
                await redeemCoupon(`coupons/${topKey}`, {
                  email: formData.email.trim(),
                  studentName: formData.studentName.trim(),
                  rollNo: rollNo,
                  claimedAt: new Date().toISOString(),
                  amountSaved: paymentData.discountAmount || 0
                });
                redeemed = true;
                break;
              }
              for (const [subKey, subVal] of Object.entries(topVal as object)) {
                if ((subVal as any).code?.toUpperCase() === paymentData.couponCodeApplied.toUpperCase()) {
                  await redeemCoupon(`coupons/${topKey}/${subKey}`, {
                    email: formData.email.trim(),
                    studentName: formData.studentName.trim(),
                    rollNo: rollNo,
                    claimedAt: new Date().toISOString(),
                    amountSaved: paymentData.discountAmount || 0
                  });
                  redeemed = true;
                  break;
                }
              }
              if (redeemed) break;
            }
          }
        } catch (couponErr) {
          console.error("Coupon redemption log error:", couponErr);
        }
      }

      setRegistration(payload);
      setSubmitState('success');
      setStep(5);

      // Trigger success confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      console.error("Firebase registration write failed:", err);
      setSubmitState('error');
      setErrorMessage(`Registration submission failed: ${err.message || 'Unknown network error'}`);
      throw err;
    }
  };

  const handlePrint = () => {
    printElementById('official-hall-ticket-container');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className={`bg-white text-slate-900 rounded-2xl ${step === 5 ? 'max-w-4xl max-h-[96vh] flex flex-col' : 'max-w-2xl'} w-full shadow-2xl border border-slate-200 overflow-hidden relative my-6`}>
        
        {/* Modal Header */}
        <div className="bg-[#002147] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#ED1C24]">
          <div className="flex items-center gap-3">
            <FiitjeeLogo variant="white" size="sm" showTagline={false} />
            <div>
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">Spotlight Admissions Portal</div>
              <h2 className="text-lg font-extrabold font-display">
                {step === 5 ? 'Big Bang Edge Test Official Hall Ticket' : 'Big Bang Edge Test 2026 Registration'}
              </h2>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        {step < 5 && (
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-500">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-[#ED1C24]' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 1 ? 'bg-[#ED1C24] text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
              <span>Details</span>
            </div>
            <div className="w-6 h-0.5 bg-slate-200" />
            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-[#ED1C24]' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 2 ? 'bg-[#ED1C24] text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
              <span>Preferences</span>
            </div>
            <div className="w-6 h-0.5 bg-slate-200" />
            <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-[#ED1C24]' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 3 ? 'bg-[#ED1C24] text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
              <span>Review</span>
            </div>
            <div className="w-6 h-0.5 bg-slate-200" />
            <div className={`flex items-center gap-1.5 ${step >= 4 ? 'text-[#ED1C24]' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 4 ? 'bg-[#ED1C24] text-white' : 'bg-slate-200 text-slate-600'}`}>4</span>
              <span>Payment</span>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-[#ED1C24] rounded-xl text-xs font-bold space-y-2.5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1 font-semibold">{errorMessage}</div>
              </div>
              {lastPaymentData && (
                <div className="pt-2 border-t border-red-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-slate-700 font-medium text-[11px]">
                    Your payment of ₹{lastPaymentData.paymentAmount} was verified! Click retry to complete registration & get Hall Ticket:
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePaymentComplete(lastPaymentData)}
                    disabled={submitState === 'submitting'}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {submitState === 'submitting' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Confirming...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Retry & Get Hall Ticket</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 1: Personal Details */}
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student's Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sen"
                      value={formData.studentName}
                      onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24] outline-hidden font-semibold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Parent / Guardian Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alok Sen"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24] outline-hidden font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Present Class *</label>
                  <select
                    value={getClassOption(formData.currentClass).label}
                    onChange={(e) => setFormData({ ...formData, currentClass: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24] outline-hidden font-semibold"
                  >
                    {BIG_BANG_CLASSES.map((cls) => (
                      <option key={cls.code} value={cls.label}>
                        {cls.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current School Name *</label>
                  <div className="relative">
                    <School className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. DAV Public School"
                      value={formData.schoolName}
                      onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24] outline-hidden font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Mobile Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      pattern="[0-9]{10}"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24] outline-hidden font-semibold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student / Parent Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#ED1C24] outline-hidden font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#ED1C24] hover:bg-[#d6171e] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Select Test Date & Center</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Preferences */}
          {step === 2 && (
            <form onSubmit={handleNextStep} className="space-y-4">
              {/* Loading Indicator for Exam Config */}
              {loadingExamConfig && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin text-[#ED1C24]" />
                  <span>Loading examination schedule & center particulars...</span>
                </div>
              )}

              {/* Registration Closed Notice if disabled for this centre */}
              {examConfig && examConfig.registrationOpen === false && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-xs">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Registrations Temporarily Closed for {formData.selectedCenter}</h4>
                    <p className="mt-1 text-slate-600">
                      Admission test registrations for FIITJEE {formData.selectedCenter} Centre are currently paused by the centre administration. Please choose another center or contact the admissions desk.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Select Examination Date *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(examConfig?.testDates && examConfig.testDates.length > 0 ? examConfig.testDates : BIG_BANG_EXAM.testDates).map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() => setFormData({ ...formData, testDate: date })}
                      className={`p-3.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        formData.testDate === date
                          ? 'border-2 border-[#ED1C24] bg-red-50 text-[#ED1C24]'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Calendar className="w-4 h-4 shrink-0 text-[#ED1C24]" />
                      <span>{date}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Choose Examination Mode *</label>
                <div className="grid grid-cols-2 gap-3">
                  {(examConfig?.modes && examConfig.modes.length > 0 ? examConfig.modes : BIG_BANG_EXAM.modes).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setFormData({ ...formData, testMode: mode as 'Offline' | 'Proctored Online' })}
                      className={`p-3.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        formData.testMode === mode
                          ? 'border-2 border-[#ED1C24] bg-red-50 text-[#ED1C24]'
                          : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-[13px]">{mode} Exam</div>
                      <div className="text-[10px] font-normal opacity-85">
                        {mode === 'Offline' ? 'Attempt at official center computer labs' : 'Take from home with computer + webcam'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional Center Selector */}
              {formData.testMode === 'Offline' ? (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="block text-xs font-bold text-slate-700 mb-2">Select Allotted Examination Center *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {BIG_BANG_EXAM.offlineCenters.map((center) => (
                      <button
                        key={center.city}
                        type="button"
                        onClick={() => setFormData({ ...formData, selectedCenter: center.city })}
                        className={`p-3.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex flex-col gap-1 ${
                          formData.selectedCenter === center.city
                            ? 'border-2 border-[#ED1C24] bg-red-50 text-[#ED1C24]'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#ED1C24]" />
                          <span>{center.city}</span>
                        </div>
                        <div className="text-[10px] font-normal text-slate-500">Contact: {center.phone}</div>
                      </button>
                    ))}
                  </div>

                  {formData.selectedCenter === 'Ranchi' && (
                    <div className="mt-3.5 pt-3.5 border-t border-slate-200 space-y-2">
                      <label className="block text-xs font-bold text-slate-700">Select Ranchi Test Centre Venue *</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, testCentreCode: '820' })}
                          className={`p-3 rounded-xl border text-xs text-left cursor-pointer transition-all ${
                            formData.testCentreCode !== '850'
                              ? 'border-2 border-[#ED1C24] bg-red-50 text-[#ED1C24]'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span>Hariom Tower (Lalpur)</span>
                            <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-mono font-bold">820</span>
                          </div>
                          <div className="text-[10px] font-normal text-slate-500 mt-1">7th Floor, Hariom Tower, Circular Road</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, testCentreCode: '850' })}
                          className={`p-3 rounded-xl border text-xs text-left cursor-pointer transition-all ${
                            formData.testCentreCode === '850'
                              ? 'border-2 border-[#ED1C24] bg-red-50 text-[#ED1C24]'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span>Samraddhi Complex (Doranda)</span>
                            <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-mono font-bold">850</span>
                          </div>
                          <div className="text-[10px] font-normal text-slate-500 mt-1">Ground Floor, South Office Para, Doranda</div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-blue-50 border border-blue-200 text-[#002147] rounded-xl text-xs font-bold flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    Proctored Online Mode Selected: You will receive the secure login details and step-by-step instructions via email ({formData.email}) 48 hours prior to the test date.
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitState === 'submitting' || loadingExamConfig || (examConfig !== null && examConfig.registrationOpen === false)}
                  className="w-2/3 py-2.5 bg-[#ED1C24] hover:bg-[#d6171e] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitState === 'submitting' ? 'Verifying...' : examConfig?.registrationOpen === false ? 'Registrations Paused' : 'Review details'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Summary & Review */}
          {step === 3 && (
            <form onSubmit={handleNextStep} className="space-y-4">
              {duplicateWarning && (
                <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>{duplicateWarning}</div>
                </div>
              )}

              <div className="border border-slate-200 rounded-xl p-4 text-xs space-y-2 bg-slate-50 text-slate-700">
                <h4 className="font-extrabold uppercase text-[#002147] border-b border-slate-200 pb-1 text-[10px] tracking-wider">Candidate Profile Review</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div><strong>Student Name:</strong> {formData.studentName}</div>
                  <div><strong>Parent Name:</strong> {formData.parentName}</div>
                  <div><strong>Class:</strong> {formData.currentClass}</div>
                  <div><strong>Mobile No:</strong> {formData.phone}</div>
                  <div><strong>Email Address:</strong> {formData.email}</div>
                  <div><strong>School Name:</strong> {formData.schoolName}</div>
                </div>
                <div className="border-t border-slate-200 pt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 font-bold text-slate-800">
                  <div>Date: {formData.testDate}</div>
                  <div>Mode: {formData.testMode}</div>
                  <div>Exam Fee: <span className="text-[#ED1C24]">₹{getRegistrationFeeForClass(formData.currentClass)}</span></div>
                  {formData.testMode === 'Offline' && <div className="sm:col-span-3">Center: {formData.selectedCenter}</div>}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 bg-[#ED1C24] hover:bg-[#d6171e] text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Proceed to Payment & Coupon</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Payment & Coupon Code Step */}
          {step === 4 && (
            <PaymentStep
              baseFee={calculateExamFeeForClass(examConfig, formData.currentClass)}
              studentName={formData.studentName}
              studentEmail={formData.email}
              studentPhone={formData.phone}
              centreId={targetCentreId}
              onBack={() => setStep(3)}
              onSuccess={handlePaymentComplete}
            />
          )}

          {/* STEP 5: Official Authentic Hall Ticket & Tax Invoice */}
          {step === 5 && registration && (
            <div className="space-y-4 animate-in zoom-in-95 duration-300 flex flex-col flex-1 overflow-hidden">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-emerald-900">Student Portal Account Active</div>
                    <div className="text-emerald-700 text-[11px]">
                      Access your dashboard using Roll No <strong className="font-mono text-emerald-950">{registration.rollNo}</strong> or Email with default password <strong className="font-mono text-emerald-950">Fiitjee@2026</strong>.
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[70vh] border border-slate-300 rounded-xl p-2 sm:p-4 bg-slate-100">
                <OfficialHallTicket registration={registration} />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handlePrint}
                  className="flex-1 py-3 bg-[#ED1C24] hover:bg-[#d6171e] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md uppercase tracking-wider"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Hall Ticket (A4)</span>
                </button>
                <button
                  onClick={() => { onClose(); navigate('/student/dashboard'); }}
                  className="px-5 py-3 bg-[#002147] hover:bg-[#001733] text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Student Dashboard</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
