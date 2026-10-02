import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  School, 
  ArrowRight, 
  CheckCircle2, 
  ShieldAlert,
  Eye,
  EyeOff,
  Sparkles,
  Building2,
  ChevronLeft,
  Hash,
  X,
  KeyRound,
  AlertCircle
} from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { auth, db } from '../../firebase';
import { useStudentAuth, findRegistrationInDatabase } from '../hooks/useStudentAuth';
import { FiitjeeLogo } from '../../components/FiitjeeLogo';
import { BIG_BANG_CLASSES, getClassOption } from '../../data/examsData';

export const StudentLogin: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const redirectUrl = searchParams.get('redirect') || '/student/dashboard';

  const { 
    login, 
    loginWithRollOrPhone, 
    signup, 
    isAuthenticated, 
    loading: authLoading 
  } = useStudentAuth();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loginMethod, setLoginMethod] = useState<'password' | 'roll_phone'>('password');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [identifierInput, setIdentifierInput] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Registration sub-tab state ('phone' | 'email')
  const [registerMethod, setRegisterMethod] = useState<'phone' | 'email'>('phone');

  const [registerData, setRegisterData] = useState({
    fullName: '',
    parentName: '',
    email: '',
    phone: '',
    currentClass: BIG_BANG_CLASSES[5].label,
    schoolName: '',
    preferredCentreId: 'bhubaneswar',
    password: '',
    confirmPassword: ''
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [updatesOptIn, setUpdatesOptIn] = useState(true);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirectUrl, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, redirectUrl]);

  const switchLoginMethod = (method: 'password' | 'roll_phone') => {
    setLoginMethod(method);
    setErrorMessage(null);
  };

  const handleRollLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const input = identifierInput.trim();
      await loginWithRollOrPhone(input);
      navigate(redirectUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'No candidate record found for this Roll Number or Mobile Number.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      await login(loginEmail, loginPassword);
      navigate(redirectUrl);
    } catch (err: any) {
      console.error('Student login error:', err);
      const isAuthErr = 
        err.code === 'auth/invalid-credential' || 
        err.code === 'auth/wrong-password' || 
        err.code === 'auth/user-not-found' ||
        (typeof err.message === 'string' && (
          err.message.includes('auth/invalid-credential') || 
          err.message.includes('auth/wrong-password') || 
          err.message.includes('auth/user-not-found')
        ));

      if (isAuthErr) {
        setErrorMessage('Incorrect mobile number/email or password. Please verify your details, or switch to "Roll No / Fast" if you registered for an admission test.');
      } else if (err.message && !err.message.includes('Firebase:')) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to sign in. Please verify your internet and credentials.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = forgotEmail.trim();
    if (!input) {
      setForgotError('Please enter your registered student email address or 10-digit mobile.');
      return;
    }

    const cleanDigits = input.replace(/\D/g, '');
    if (cleanDigits.length === 10 && !input.includes('@')) {
      setForgotSubmitting(true);
      setForgotError(null);
      try {
        const studentQuery = query(ref(db, 'students'), orderByChild('phone'), equalTo(cleanDigits));
        const phoneSnap = await get(studentQuery);
        if (phoneSnap.exists()) {
          const studentsObj = phoneSnap.val();
          const matched = Object.values(studentsObj)[0] as any;
          if (matched?.email && matched.email.includes('@')) {
            await sendPasswordResetEmail(auth, matched.email);
            setForgotSuccess(true);
            return;
          }
        }
        setForgotError('This account was registered using only a Mobile Number without an email address. You can log in using your Password or access your test details via "Roll No / Fast Access".');
        return;
      } catch (err: any) {
        setForgotError(err.message || 'Unable to process password reset.');
        return;
      } finally {
        setForgotSubmitting(false);
      }
    }

    setForgotSubmitting(true);
    setForgotError(null);
    try {
      await sendPasswordResetEmail(auth, input);
      setForgotSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setForgotError('No student account found with this email address. If registered at a centre, you can also sign in directly using "Roll No / Fast".');
      } else if (err.code === 'auth/invalid-email') {
        setForgotError('Please enter a valid email address.');
      } else {
        setForgotError(err.message || 'Unable to send password reset email. Please try again or sign in via Roll No / Fast.');
      }
    } finally {
      setForgotSubmitting(false);
    }
  };

  const handleEmailRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = registerData.email.trim().toLowerCase();
    const cleanPhone = registerData.phone.replace(/\D/g, '');

    if (!cleanEmail) {
      setErrorMessage('Email Address is mandatory for Email Registration.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }

    if (cleanPhone && cleanPhone.length !== 10) {
      setErrorMessage('If entering a mobile number, please provide a valid 10-digit number.');
      return;
    }

    if (!registerData.fullName.trim() || !registerData.parentName.trim() || !registerData.schoolName.trim()) {
      setErrorMessage('Please fill in student full name, parent name, and school name.');
      return;
    }

    if (!registerData.preferredCentreId) {
      setErrorMessage('Please select your preferred FIITJEE centre.');
      return;
    }

    if (registerData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (!termsAccepted || !updatesOptIn) {
      setErrorMessage('You must accept the Terms & Conditions and opt in for examination notifications to complete your registration.');
      return;
    }

    setSubmitting(true);

    try {
      await signup({
        fullName: registerData.fullName.trim(),
        parentName: registerData.parentName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        currentClass: registerData.currentClass,
        schoolName: registerData.schoolName.trim(),
        preferredCentreId: registerData.preferredCentreId
      }, registerData.password, 'email');

      navigate(redirectUrl);
    } catch (err: any) {
      console.error('Student email signup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('An account already exists with this email address. Please click "Sign In".');
      } else {
        setErrorMessage(err.message || 'Failed to create student account.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhoneRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = registerData.phone.replace(/\D/g, '').slice(-10);
    const cleanEmail = registerData.email.trim().toLowerCase();

    if (cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage('If entering an email address, please provide a valid email format.');
      return;
    }

    if (!registerData.fullName.trim() || !registerData.parentName.trim() || !registerData.schoolName.trim()) {
      setErrorMessage('Please fill in student full name, parent name, and school name.');
      return;
    }

    if (!registerData.preferredCentreId) {
      setErrorMessage('Please select your preferred FIITJEE centre.');
      return;
    }

    if (registerData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (!termsAccepted || !updatesOptIn) {
      setErrorMessage('You must accept the Terms & Conditions and opt in for examination notifications to complete your registration.');
      return;
    }

    setSubmitting(true);

    try {
      await signup({
        fullName: registerData.fullName.trim(),
        parentName: registerData.parentName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        currentClass: registerData.currentClass,
        schoolName: registerData.schoolName.trim(),
        preferredCentreId: registerData.preferredCentreId
      }, registerData.password, 'phone');

      navigate(redirectUrl);
    } catch (err: any) {
      console.error('Phone signup error:', err);
      setErrorMessage(err.message || 'Failed to create student account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between selection:bg-[#ED1C24] selection:text-white">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#002147] transition-colors mr-2">
            <ChevronLeft className="w-4 h-4" />
            <span>Main Website</span>
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <FiitjeeLogo variant="dark" size="sm" />
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-500 hidden sm:inline">Admissions Support:</span>
          <span className="font-bold text-[#002147]">support@fiitjee.online</span>
        </div>
      </header>

      {/* Main Login / Register Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-[#002147] text-white p-6 sm:p-8 text-center relative border-b-4 border-[#ED1C24]">
            <div className="inline-flex items-center gap-1.5 bg-[#ED1C24] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 shadow-xs">
              <Sparkles className="w-3 h-3" />
              <span>Candidate Admission Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight uppercase">
              Student Dashboard
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
              Sign in to manage admission tests, register for Big Bang Edge Test 2026, and access your Official Hall Ticket.
            </p>

            {/* Purpose & Privileges of Registering a Student Account */}
            <div className="mt-4 p-3.5 bg-slate-900/75 border border-slate-700/80 rounded-2xl text-left max-w-lg mx-auto shadow-inner">
              <div className="text-[11px] font-black uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Purpose & Key Privileges of Student Portal Registration</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-200 leading-snug">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>1-Click Future Registrations:</strong> Apply for all upcoming FIITJEE admission tests & diagnostic exams without filling personal credentials again.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Instant Results & AIR Analytics:</strong> View All India Ranks (AIR), state percentiles, subject breakdowns, and download scholarship qualification certificates.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Real-Time Exam & Admission Alerts:</strong> Receive automatic notifications via SMS and Email regarding test dates, syllabus revisions, test centers, and counselling sessions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Digital Hall Ticket Vault:</strong> Permanent, secure student dashboard to retrieve, reprint, and verify your Official Hall Tickets and GST tax receipts anytime.</span>
                </li>
              </ul>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-900/60 p-1 rounded-xl max-w-xs mx-auto mt-6 border border-slate-700">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(null); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'login' ? 'bg-[#ED1C24] text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMessage(null); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'register' ? 'bg-[#ED1C24] text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8">
            {errorMessage && (
              <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 space-y-2">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#ED1C24] shrink-0 mt-0.5" />
                  <span className="font-semibold leading-relaxed">{errorMessage}</span>
                </div>

              </div>
            )}

            {mode === 'login' ? (
              /* --- SIGN IN OPTIONS --- */
              <div className="space-y-4">
                {/* Login Method Sub-Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
                  <button
                    type="button"
                    onClick={() => switchLoginMethod('password')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      loginMethod === 'password' ? 'bg-[#002147] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Mobile / Email & Pass</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => switchLoginMethod('roll_phone')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      loginMethod === 'roll_phone' ? 'bg-[#002147] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Hash className="w-3.5 h-3.5" />
                    <span>Roll No / Fast</span>
                  </button>
                </div>

                {loginMethod === 'password' ? (
                  /* Option 1: Mobile Number or Email & Password (Primary & Default) */
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Mobile Number or Email Address
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. 9876543210 or arjun.verma@gmail.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Enter your 10-digit mobile number (with or without +91) or registered email address.
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowForgotModal(true);
                            setForgotEmail(loginEmail || '');
                            setForgotSuccess(false);
                            setForgotError(null);
                          }}
                          className="text-[11px] font-bold text-[#ED1C24] hover:underline cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="Enter your account password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1.5">
                        If you registered for a test without setting a password, use the <strong className="font-semibold text-slate-800">"Roll No / Fast"</strong> tab.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-[#ED1C24] hover:bg-[#d6171e] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 mt-2"
                    >
                      {submitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Sign In to Candidate Dashboard</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* Option 2: Fast Access via Roll Number or Mobile */
                  <form onSubmit={handleRollLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Exam Roll Number or Registered 10-Digit Mobile
                      </label>
                      <div className="relative">
                        <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. 7052 45828 911105 60069 or 9876543210"
                          value={identifierInput}
                          onChange={(e) => setIdentifierInput(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Use your 10-digit mobile number or exam roll number from your admission test registration for direct access.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !identifierInput.trim()}
                      className="w-full py-3 bg-[#ED1C24] hover:bg-[#d6171e] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 mt-2"
                    >
                      {submitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Access Candidate Dashboard</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                <div className="text-center pt-2">
                  <span className="text-xs text-slate-500">Don't have an account yet? </span>
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setErrorMessage(null); }}
                    className="text-xs font-bold text-[#ED1C24] hover:underline cursor-pointer"
                  >
                    Create Free Student Account
                  </button>
                </div>
              </div>
            ) : (
              /* --- REGISTER STUDENT FORM (DUAL TABS) --- */
              <div className="space-y-4">
                {/* Registration Method Sub-Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRegisterMethod('phone');
                      setErrorMessage(null);
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      registerMethod === 'phone' ? 'bg-[#002147] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Mobile & Password</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRegisterMethod('email');
                      setErrorMessage(null);
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      registerMethod === 'email' ? 'bg-[#002147] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email & Password</span>
                  </button>
                </div>

                {registerMethod === 'phone' ? (
                  /* ========================================================
                     TAB 1 (DEFAULT): REGISTER WITH PHONE NUMBER & PASSWORD
                     (ZERO SMS DELAY • CANDIDATE INSTANT PASS IDENTITY)
                     ======================================================== */
                  <form onSubmit={handlePhoneRegisterSubmit} className="space-y-4">
                    {/* Relevant Info Card */}
                    <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-start gap-3 text-blue-950 text-xs shadow-xs">
                      <Phone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <div className="font-bold text-blue-900 uppercase tracking-wider text-[11px]">
                          Direct Mobile Registration (Instant • Zero SMS Delay)
                        </div>
                        <p className="text-blue-800 text-[11px] leading-relaxed">
                          Your account is created instantly using your <strong>10-Digit Mobile Number & Password</strong>. No SMS OTP wait or network drops required.
                        </p>
                      </div>
                    </div>

                    {/* Warning on Leaving Email Address Empty */}
                    <div className="p-3.5 bg-amber-50/90 border-2 border-amber-300 rounded-2xl flex items-start gap-3 text-amber-950 text-xs shadow-xs">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="font-black text-amber-950 uppercase tracking-wider text-[11px]">
                          Important Note: Providing Email is Recommended
                        </div>
                        <p className="text-amber-900 text-[11px] leading-relaxed font-medium">
                          If you leave your Email Address empty, official PDF Hall Tickets, scorecards, and fee receipts will be accessible only inside this student portal. Providing an email ensures you get direct copies sent to your inbox.
                        </p>
                      </div>
                    </div>

                    {/* Student Full Name & Parent Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Student Full Name *
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. ARJUN VERMA"
                            value={registerData.fullName}
                            onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none uppercase"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Father / Mother's Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. RAJESH VERMA"
                          value={registerData.parentName}
                          onChange={(e) => setRegisterData({ ...registerData, parentName: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none uppercase"
                        />
                      </div>
                    </div>

                    {/* Mobile (Mandatory with +91 badge) & Email (Optional) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Mobile Number * <span className="text-[10px] text-[#ED1C24] font-normal lowercase">(10 digits)</span>
                        </label>
                        <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-[#002147] focus-within:bg-white transition-all">
                          <span className="inline-flex items-center px-3 bg-slate-100 text-xs font-bold text-slate-600 border-r border-slate-200 select-none">
                            🇮🇳 +91
                          </span>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            placeholder="10-digit mobile number"
                            value={registerData.phone}
                            onChange={(e) => {
                              let digits = e.target.value.replace(/\D/g, '');
                              if (digits.length > 10) digits = digits.slice(-10);
                              setRegisterData({ ...registerData, phone: digits });
                            }}
                            className="w-full px-3.5 py-2.5 bg-transparent text-xs font-mono font-medium outline-none text-slate-900"
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Used for signing in and real-time test alerts.</p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Email Address <span className="text-slate-400 font-normal lowercase">(optional)</span>
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            placeholder="e.g. arjun@gmail.com (optional)"
                            value={registerData.email}
                            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none"
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Recommended for PDF Hall Ticket attachments.</p>
                      </div>
                    </div>

                    {/* Class & School Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Class / Academic Stream *
                        </label>
                        <select
                          value={registerData.currentClass}
                          onChange={(e) => setRegisterData({ ...registerData, currentClass: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none cursor-pointer"
                        >
                          {BIG_BANG_CLASSES.map((cls) => (
                            <option key={cls.key} value={cls.label}>
                              {cls.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          School Name *
                        </label>
                        <div className="relative">
                          <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. DPS R.K. Puram"
                            value={registerData.schoolName}
                            onChange={(e) => setRegisterData({ ...registerData, schoolName: e.target.value })}
                            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Preferred FIITJEE Centre */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Nearest / Preferred FIITJEE Centre *
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <select
                          required
                          value={registerData.preferredCentreId}
                          onChange={(e) => setRegisterData({ ...registerData, preferredCentreId: e.target.value })}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none cursor-pointer"
                        >
                          <option value="">— Select your nearest FIITJEE centre —</option>
                          <option value="bhubaneswar">FIITJEE Bhubaneswar (Odisha)</option>
                          <option value="dwarka">FIITJEE Dwarka (New Delhi)</option>
                          <option value="ranchi">FIITJEE Ranchi (Jharkhand)</option>
                          <option value="hyderabad">FIITJEE Hyderabad (Telangana)</option>
                        </select>
                      </div>
                    </div>

                    {/* Password & Confirm Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Create Password (min 6 chars) *
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="Create account password"
                            value={registerData.password}
                            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            placeholder="Confirm your password"
                            value={registerData.confirmPassword}
                            onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Mandatory Consent Checkboxes */}
                    <div className="space-y-3 pt-3 border-t border-slate-200">
                      <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 select-none">
                        <input
                          type="checkbox"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#ED1C24] focus:ring-[#ED1C24] cursor-pointer shrink-0"
                        />
                        <span className="leading-snug">
                          I have read, understood, and unconditionally agree to the{' '}
                          <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-[#002147] font-bold underline hover:text-[#ED1C24]">
                            Terms & Conditions
                          </a>
                          ,{' '}
                          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#002147] font-bold underline hover:text-[#ED1C24]">
                            Privacy Policy
                          </a>
                          , and candidate testing covenants. <span className="text-[#ED1C24] font-bold">*</span>
                        </span>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 select-none">
                        <input
                          type="checkbox"
                          checked={updatesOptIn}
                          onChange={(e) => setUpdatesOptIn(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#ED1C24] focus:ring-[#ED1C24] cursor-pointer shrink-0"
                        />
                        <span className="leading-snug">
                          I expressly opt in and consent to receive critical examination alerts, Hall Ticket issuances, scorecards, scholarship results, and admission notifications via Email and SMS / WhatsApp carrier dispatch. <span className="text-[#ED1C24] font-bold">*</span>
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || registerData.phone.length < 10 || !termsAccepted || !updatesOptIn}
                      className="w-full py-3 bg-[#ED1C24] hover:bg-[#d6171e] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                      {submitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Create Student Account Instantly</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* ========================================================
                     TAB 2: REGISTER WITH EMAIL & PASSWORD (PHONE OPTIONAL)
                     ======================================================== */
                  <form onSubmit={handleEmailRegisterSubmit} className="space-y-4">
                    {/* Relevant Info Card */}
                    <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-start gap-3 text-blue-950 text-xs shadow-xs">
                      <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <div className="font-bold text-blue-900 uppercase tracking-wider text-[11px]">
                          Email Registration Mode
                        </div>
                        <p className="text-blue-800 text-[11px] leading-relaxed">
                          Your primary login credentials will be your <strong>Email Address & Password</strong>. Entering your mobile number below is <em>optional</em>.
                        </p>
                      </div>
                    </div>

                    {/* Warning on Leaving Mobile Number Empty */}
                    <div className="p-3.5 bg-amber-50/90 border-2 border-amber-300 rounded-2xl flex items-start gap-3 text-amber-950 text-xs shadow-xs">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="font-black text-amber-950 uppercase tracking-wider text-[11px]">
                          Important Warning: Leaving Mobile Number Empty
                        </div>
                        <p className="text-amber-900 text-[11px] leading-relaxed font-medium">
                          If you leave your Mobile Number empty, you will <strong>not be able to receive real-time SMS or WhatsApp notifications</strong> regarding Big Bang Edge Test dates, admit card release reminders, test center allocations, or urgent exam day guidelines. We strongly encourage providing your mobile number.
                        </p>
                      </div>
                    </div>

                    {/* Student Full Name & Parent Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Student Full Name *
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. ARJUN VERMA"
                            value={registerData.fullName}
                            onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none uppercase"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Father / Mother's Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. RAJESH VERMA"
                          value={registerData.parentName}
                          onChange={(e) => setRegisterData({ ...registerData, parentName: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none uppercase"
                        />
                      </div>
                    </div>

                    {/* Email (Mandatory) & Phone (Optional with +91 badge) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Email Address * <span className="text-[10px] text-[#ED1C24] font-normal lowercase">(mandatory)</span>
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            placeholder="e.g. arjun.verma@gmail.com"
                            value={registerData.email}
                            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none"
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Used for signing in and receiving exam scorecards.</p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Mobile Number <span className="text-slate-400 font-normal lowercase">(optional)</span>
                        </label>
                        <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-[#002147] focus-within:bg-white transition-all">
                          <span className="inline-flex items-center px-3 bg-slate-100 text-xs font-bold text-slate-600 border-r border-slate-200 select-none">
                            🇮🇳 +91
                          </span>
                          <input
                            type="tel"
                            maxLength={10}
                            placeholder="10-digit mobile number"
                            value={registerData.phone}
                            onChange={(e) => {
                              let digits = e.target.value.replace(/\D/g, '');
                              if (digits.length > 10) digits = digits.slice(-10);
                              setRegisterData({ ...registerData, phone: digits });
                            }}
                            className="w-full px-3.5 py-2.5 bg-transparent text-xs font-mono font-medium outline-none text-slate-900"
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Recommended for instant SMS test alerts.</p>
                      </div>
                    </div>

                    {/* Class & School Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Class / Academic Stream *
                        </label>
                        <select
                          value={registerData.currentClass}
                          onChange={(e) => setRegisterData({ ...registerData, currentClass: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none cursor-pointer"
                        >
                          {BIG_BANG_CLASSES.map((cls) => (
                            <option key={cls.key} value={cls.label}>
                              {cls.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          School Name *
                        </label>
                        <div className="relative">
                          <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. DPS R.K. Puram"
                            value={registerData.schoolName}
                            onChange={(e) => setRegisterData({ ...registerData, schoolName: e.target.value })}
                            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Preferred FIITJEE Centre */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Nearest / Preferred FIITJEE Centre *
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <select
                          required
                          value={registerData.preferredCentreId}
                          onChange={(e) => setRegisterData({ ...registerData, preferredCentreId: e.target.value })}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none cursor-pointer"
                        >
                          <option value="">— Select your nearest FIITJEE centre —</option>
                          <option value="bhubaneswar">FIITJEE Bhubaneswar (Odisha)</option>
                          <option value="dwarka">FIITJEE Dwarka (New Delhi)</option>
                          <option value="ranchi">FIITJEE Ranchi (Jharkhand)</option>
                          <option value="hyderabad">FIITJEE Hyderabad (Telangana)</option>
                        </select>
                      </div>
                    </div>

                    {/* Password & Confirm Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Create Password (min 6 chars) *
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="Create account password"
                            value={registerData.password}
                            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            placeholder="Confirm your password"
                            value={registerData.confirmPassword}
                            onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Mandatory Consent Checkboxes */}
                    <div className="space-y-3 pt-3 border-t border-slate-200">
                      <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 select-none">
                        <input
                          type="checkbox"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#ED1C24] focus:ring-[#ED1C24] cursor-pointer shrink-0"
                        />
                        <span className="leading-snug">
                          I have read, understood, and unconditionally agree to the{' '}
                          <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-[#002147] font-bold underline hover:text-[#ED1C24]">
                            Terms & Conditions
                          </a>
                          ,{' '}
                          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#002147] font-bold underline hover:text-[#ED1C24]">
                            Privacy Policy
                          </a>
                          , and candidate testing covenants. <span className="text-[#ED1C24] font-bold">*</span>
                        </span>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 select-none">
                        <input
                          type="checkbox"
                          checked={updatesOptIn}
                          onChange={(e) => setUpdatesOptIn(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#ED1C24] focus:ring-[#ED1C24] cursor-pointer shrink-0"
                        />
                        <span className="leading-snug">
                          I expressly opt in and consent to receive critical examination alerts, Hall Ticket issuances, scorecards, scholarship results, and admission notifications via Email and SMS / WhatsApp carrier dispatch. <span className="text-[#ED1C24] font-bold">*</span>
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !termsAccepted || !updatesOptIn}
                      className="w-full py-3 bg-[#ED1C24] hover:bg-[#d6171e] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                      {submitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Create Student Account Instantly</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                <div className="text-center pt-2">
                  <span className="text-xs text-slate-500">Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setErrorMessage(null); }}
                    className="text-xs font-bold text-[#ED1C24] hover:underline cursor-pointer"
                  >
                    Sign In Here
                  </button>
                </div>
              </div>
            )}

            {/* Centre Staff Gateway Link */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>FIITJEE Centre Staff?</span>
              </span>
              <Link to="/admin/login" className="font-bold text-[#002147] hover:text-[#ED1C24] transition-colors underline">
                Access Centre Admin Portal →
              </Link>
            </div>

          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#002147] to-[#0A3663] px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <KeyRound className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Reset Password</h3>
                  <p className="text-[10px] text-slate-300">FIITJEE Student Portal Access</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {forgotSuccess ? (
                <div className="space-y-4 text-center py-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Reset Email Dispatched!</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      We have sent password recovery instructions to:
                      <br />
                      <strong className="text-slate-900 font-mono text-xs">{forgotEmail}</strong>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-2">
                      Please check your inbox (and spam folder) and follow the link to establish your new password.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="w-full py-2.5 bg-[#002147] hover:bg-[#0A3663] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Return to Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotModal(false);
                        setLoginMethod('roll_phone');
                      }}
                      className="text-xs font-medium text-slate-600 hover:text-[#ED1C24] transition-colors py-1 cursor-pointer"
                    >
                      Or Sign in via Roll No / Mobile →
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Enter your registered student email address. We'll send you a secure link to reset your account password.
                  </p>

                  {forgotError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>{forgotError}</div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Registered Student Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. student@gmail.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                    <span className="font-bold">Registered at a FIITJEE Centre?</span>
                    <br />
                    Your account has been provisioned! You can also sign in instantly using the <strong>Roll No / Mobile</strong> tab without needing a password.
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotSubmitting || !forgotEmail.trim()}
                      className="flex-1 py-2.5 bg-[#ED1C24] hover:bg-[#d6171e] text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow"
                    >
                      {forgotSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>Send Reset Link</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 text-center text-slate-400 text-[11px] space-y-1">
        <div>&copy; 2026 TRANSED LLP. All Rights Reserved. Candidate Portal Service.</div>
        <div className="flex items-center justify-center gap-3 text-slate-500">
          <a href="/terms-and-conditions" className="hover:text-slate-300">Terms</a>
          <span>•</span>
          <a href="/privacy-policy" className="hover:text-slate-300">Privacy Policy</a>
          <span>•</span>
          <a href="/refund-policy" className="hover:text-slate-300">Refund Policy</a>
          <span>•</span>
          <a href="/contact-us" className="hover:text-slate-300">Contact Us</a>
        </div>
      </footer>
    </div>
  );
};
