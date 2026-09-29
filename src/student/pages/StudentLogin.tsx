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
import { sendPasswordResetEmail, ConfirmationResult } from 'firebase/auth';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { auth, db } from '../../firebase';
import { useStudentAuth, findRegistrationInDatabase } from '../hooks/useStudentAuth';
import { FiitjeeLogo } from '../../components/FiitjeeLogo';

export const StudentLogin: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const redirectUrl = searchParams.get('redirect') || '/student/dashboard';

  const { 
    login, 
    loginWithRollOrPhone, 
    setupRecaptcha, 
    clearRecaptcha,
    sendPhoneOtp, 
    verifyPhoneOtp, 
    signup, 
    isAuthenticated, 
    loading: authLoading 
  } = useStudentAuth();

  useEffect(() => {
    return () => {
      clearRecaptcha();
    };
  }, [clearRecaptcha]);

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loginMethod, setLoginMethod] = useState<'password' | 'roll_phone' | 'phone_otp'>('password');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Phone OTP state
  const [phoneInput, setPhoneInput] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState<'phone' | 'verify'>('phone');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

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

  const [registerData, setRegisterData] = useState({
    fullName: '',
    parentName: '',
    email: '',
    phone: '',
    currentClass: 'Class X',
    schoolName: '',
    preferredCentreId: '',
    password: ''
  });

  const hasRegisterEmail = registerData.email.trim().length > 0;
  const hasRegisterPhone = registerData.phone.replace(/\D/g, '').length > 0;
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [updatesOptIn, setUpdatesOptIn] = useState(false);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirectUrl, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, redirectUrl]);

  // Resend OTP countdown timer
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = phoneInput.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setSubmitting(true);
    try {
      const verifier = setupRecaptcha('recaptcha-phone-container', 'invisible');
      const confirmation = await sendPhoneOtp(cleanPhone, verifier);
      setConfirmationResult(confirmation);
      setOtpStep('verify');
      setResendCooldown(30);
    } catch (err: any) {
      console.error('Phone OTP dispatch error:', err);
      if (err.code === 'auth/operation-not-allowed' || err.message?.includes('SMS unable to be sent until this region enabled') || err.message?.includes('operation-not-allowed')) {
        setErrorMessage(
          'SMS verification is currently restricted by Firebase SMS Region Policy. Please use the "Mobile / Email & Pass" tab above to sign in instantly with your registered mobile and password.'
        );
      } else if (err.code === 'auth/invalid-phone-number') {
        setErrorMessage('Invalid phone number format. Please enter a valid 10-digit mobile number.');
      } else if (err.code === 'auth/quota-exceeded') {
        setErrorMessage('SMS verification quota reached for now. Please switch to "Mobile / Email & Pass" or "Roll No / Fast" for instant sign in.');
      } else if (err.code === 'auth/captcha-check-failed') {
        setErrorMessage('reCAPTCHA verification failed. Please try again.');
      } else {
        setErrorMessage(err.message || 'Unable to send SMS OTP. Please switch to "Mobile / Email & Pass" tab.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCode = otpCode.trim();
    if (cleanCode.length !== 6) {
      setErrorMessage('Please enter the 6-digit OTP received via SMS.');
      return;
    }

    if (!confirmationResult) {
      setErrorMessage('Verification session expired. Please request a new OTP.');
      setOtpStep('phone');
      return;
    }

    setSubmitting(true);
    try {
      await verifyPhoneOtp(confirmationResult, cleanCode);
      navigate(redirectUrl);
    } catch (err: any) {
      console.error('Phone OTP verification error:', err);
      if (err.code === 'auth/invalid-verification-code') {
        setErrorMessage('Incorrect 6-digit SMS OTP code. Please check and re-enter.');
      } else if (err.code === 'auth/code-expired') {
        setErrorMessage('SMS OTP code has expired. Please click "Resend OTP".');
      } else {
        setErrorMessage(err.message || 'Verification failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setErrorMessage(null);
    setSubmitting(true);
    try {
      const verifier = setupRecaptcha('recaptcha-phone-container', 'invisible');
      const confirmation = await sendPhoneOtp(phoneInput, verifier);
      setConfirmationResult(confirmation);
      setResendCooldown(30);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend SMS OTP.');
    } finally {
      setSubmitting(false);
    }
  };

  const switchLoginMethod = (method: 'password' | 'roll_phone' | 'phone_otp') => {
    setLoginMethod(method);
    setErrorMessage(null);
    setOtpStep('phone');
    setConfirmationResult(null);
    setOtpCode('');
    clearRecaptcha();
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
      if (err.message && !err.message.includes('Firebase:')) {
        setErrorMessage(err.message);
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setErrorMessage('Incorrect mobile number/email or password. Please verify your details, or switch to "Roll No / Fast" if you registered for an admission test.');
      } else {
        setErrorMessage(err.message || 'Failed to sign in. Please verify your internet and credentials.');
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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = registerData.email.trim();
    const cleanPhone = registerData.phone.replace(/\D/g, '');

    if (!cleanEmail && !cleanPhone) {
      setErrorMessage('Please provide either your Email Address or Mobile Number to register.');
      return;
    }

    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (cleanPhone && cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
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

    if (!termsAccepted || !updatesOptIn) {
      setErrorMessage('You must accept the Terms & Conditions and opt in for examination notifications to complete your registration.');
      return;
    }

    setSubmitting(true);

    try {
      await signup({
        fullName: registerData.fullName,
        parentName: registerData.parentName,
        email: cleanEmail,
        phone: cleanPhone,
        currentClass: registerData.currentClass,
        schoolName: registerData.schoolName,
        preferredCentreId: registerData.preferredCentreId
      }, registerData.password);

      navigate(redirectUrl);
    } catch (err: any) {
      console.error('Student signup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        if (cleanEmail) {
          setErrorMessage('An account already exists with this email address. Please click "Sign In".');
        } else {
          setErrorMessage('An account already exists with this mobile number. Please click "Sign In".');
        }
      } else {
        setErrorMessage(err.message || 'Failed to create student account.');
      }
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
                {loginMethod === 'phone_otp' && (
                  <div className="pt-1 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (phoneInput) setLoginEmail(phoneInput);
                        switchLoginMethod('password');
                      }}
                      className="px-3 py-1.5 bg-[#002147] text-white font-bold rounded-lg text-[11px] hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
                    >
                      Sign In with Mobile & Password instead
                    </button>
                  </div>
                )}
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
                  <button
                    type="button"
                    onClick={() => switchLoginMethod('phone_otp')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      loginMethod === 'phone_otp' ? 'bg-[#002147] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Mobile SMS OTP</span>
                  </button>
                </div>

                {loginMethod === 'password' ? (
                  /* Option 1: Mobile Number or Email & Password (Primary & Default) */
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Mobile Number (10 digits) or Email Address
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. 9470356441 or rahul.sharma@gmail.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Enter the 10-digit mobile number or email address registered with your student account.
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
                ) : loginMethod === 'roll_phone' ? (
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
                          placeholder="e.g. 7052 45828 911105 60069 or 9470356441"
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
                ) : (
                  /* Option 3: Native Firebase Phone OTP Authentication */
                  <div className="space-y-4">
                    {otpStep === 'phone' ? (
                      <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Candidate Mobile Number
                          </label>
                          <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-[#002147] focus-within:bg-white transition-all">
                            <span className="inline-flex items-center px-3.5 bg-slate-100 text-xs font-bold text-slate-600 border-r border-slate-200 select-none">
                              🇮🇳 +91
                            </span>
                            <div className="relative flex-1">
                              <input
                                type="tel"
                                required
                                maxLength={10}
                                placeholder="Enter 10-digit mobile number"
                                value={phoneInput}
                                onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                                className="w-full px-3.5 py-2.5 bg-transparent text-xs font-mono font-medium outline-none text-slate-900"
                              />
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1.5">
                            We will send a 6-digit verification code via SMS to this number.
                          </p>
                        </div>

                        {/* reCAPTCHA container for Phone Auth */}
                        {loginMethod === 'phone_otp' && otpStep === 'phone' && (
                          <div id="recaptcha-phone-container" className="flex justify-center my-2" />
                        )}

                        <button
                          type="submit"
                          disabled={submitting || phoneInput.length < 10}
                          className="w-full py-3 bg-[#ED1C24] hover:bg-[#d6171e] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 mt-2"
                        >
                          {submitting ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <span>Send Verification OTP</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
                        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-blue-600 block">OTP Sent to Mobile</span>
                            <span className="font-mono font-bold text-slate-900">+91 {phoneInput}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => { setOtpStep('phone'); setOtpCode(''); setErrorMessage(null); }}
                            className="text-[11px] font-bold text-[#ED1C24] hover:underline cursor-pointer"
                          >
                            Change Number
                          </button>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-center">
                            Enter 6-Digit SMS Verification Code
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={6}
                            autoFocus
                            placeholder="• • • • • •"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                            className="w-full py-3 text-center text-xl tracking-[0.5em] font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none"
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-[11px] text-slate-500">Didn't receive code?</span>
                          <button
                            type="button"
                            disabled={submitting || resendCooldown > 0}
                            onClick={handleResendOtp}
                            className="text-[11px] font-bold text-[#002147] hover:underline disabled:text-slate-400 cursor-pointer disabled:cursor-not-allowed"
                          >
                            {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend SMS OTP'}
                          </button>
                        </div>

                        <button
                          type="submit"
                          disabled={submitting || otpCode.length !== 6}
                          className="w-full py-3 bg-[#ED1C24] hover:bg-[#d6171e] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 mt-2"
                        >
                          {submitting ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <span>Verify & Access Portal</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
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
              /* --- REGISTER STUDENT FORM --- */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
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

                  {/* Parent Name */}
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

                {/* Prominent Mandatory Choice Directive */}
                <div className="p-3.5 sm:p-4 bg-amber-50/90 border-2 border-amber-300/90 rounded-2xl flex items-start gap-3 text-amber-900 shadow-xs">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-black text-amber-950 uppercase tracking-wider text-[11px] sm:text-xs">
                      Mandatory Registration Requirement: Email OR Mobile Number
                    </div>
                    <p className="text-xs text-amber-900 font-medium leading-relaxed">
                      Please enter <strong>either your Email Address OR your 10-Digit Mobile Number</strong>. Exactly one of them is mandatory for registration. You do not need both (although entering both provides full login access).
                    </p>
                  </div>
                </div>

                {/* Email / Mobile Choice Dynamic Indicator */}
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-1.5 transition-all">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        hasRegisterEmail && hasRegisterPhone ? 'bg-emerald-500 shadow-xs' :
                        hasRegisterEmail ? 'bg-blue-500 shadow-xs' :
                        hasRegisterPhone ? 'bg-purple-500 shadow-xs' :
                        'bg-amber-400 animate-pulse'
                      }`} />
                      <span className="font-bold text-slate-800 text-[11px]">
                        {hasRegisterEmail && hasRegisterPhone
                          ? 'Registering with Email & Mobile Number (Full Account Access)'
                          : hasRegisterEmail
                          ? 'Registering with Email Address (Mobile Number is optional)'
                          : hasRegisterPhone
                          ? 'Registering with Mobile Number (Email Address is optional)'
                          : 'Enter either Email Address or Mobile Number'}
                      </span>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                      hasRegisterEmail && hasRegisterPhone ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      hasRegisterEmail ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      hasRegisterPhone ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {hasRegisterEmail && hasRegisterPhone ? 'Email + Mobile' :
                       hasRegisterEmail ? 'Email Mode' :
                       hasRegisterPhone ? 'Mobile Mode' :
                       'Either Required'}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 leading-normal">
                    {hasRegisterEmail && hasRegisterPhone
                      ? 'Great! You can sign in using Phone OTP, Roll Number, or Email & Password.'
                      : hasRegisterEmail
                      ? 'You can sign in using your Email & Password. You may optionally add your Mobile Number below.'
                      : hasRegisterPhone
                      ? 'You can sign in using your Mobile Number & Password, or via Phone SMS OTP. Email is optional.'
                      : 'Provide either your Email Address or your 10-Digit Mobile Number to create your student account. Both are not mandatory.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Email Address {hasRegisterPhone ? (
                          <span className="text-slate-400 font-normal lowercase">(optional)</span>
                        ) : (
                          <span className="text-[#ED1C24]">*</span>
                        )}
                      </label>
                      {hasRegisterEmail && (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder={hasRegisterPhone ? "e.g. student@gmail.com (optional)" : "e.g. student@gmail.com"}
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none"
                      />
                    </div>
                    {!hasRegisterEmail && hasRegisterPhone && (
                      <p className="text-[10px] text-slate-400 mt-1">Optional when mobile number is provided.</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Mobile Number {hasRegisterEmail ? (
                          <span className="text-slate-400 font-normal lowercase">(optional)</span>
                        ) : (
                          <span className="text-[#ED1C24]">*</span>
                        )}
                      </label>
                      {hasRegisterPhone && (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder={hasRegisterEmail ? "e.g. 9876543210 (optional)" : "e.g. 9876543210"}
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value.replace(/\D/g, '') })}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none font-mono"
                      />
                    </div>
                    {!hasRegisterPhone && hasRegisterEmail && (
                      <p className="text-[10px] text-slate-400 mt-1">Optional when email address is provided.</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Present Class */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Current Class Grade *
                    </label>
                    <select
                      value={registerData.currentClass}
                      onChange={(e) => setRegisterData({ ...registerData, currentClass: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none"
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

                  {/* School Name */}
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
                  <p className="text-[10px] text-slate-400 mt-1">
                    Connects your account to your local FIITJEE centre administration and exam coordinator.
                  </p>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Create Password (minimum 6 characters) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Create a strong account password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Mandatory Consent & Agreement Checkboxes */}
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

                  {(!termsAccepted || !updatesOptIn) && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-[11px] text-amber-800 font-semibold">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Both checkboxes above are mandatory to complete registration.</span>
                    </div>
                  )}
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
                      <span>Complete Student Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

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
              </form>
            )}

            {/* Centre Staff Gateway Link */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>FIITJEE Centre Staff?</span>
              </span>
              <Link to="/admin/login" className="font-bold text-[#002147] hover:text-[#ED1C24] transition-colors underline">
                Access Centre Admin Portal &rarr;
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
                      Or Sign in via Roll No / Mobile &rarr;
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
