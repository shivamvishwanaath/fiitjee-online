import React, { useState } from 'react';
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
  Hash
} from 'lucide-react';
import { useStudentAuth } from '../hooks/useStudentAuth';
import { FiitjeeLogo } from '../../components/FiitjeeLogo';

export const StudentLogin: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const redirectUrl = searchParams.get('redirect') || '/student/dashboard';

  const { login, loginWithRollOrPhone, signup, isAuthenticated, loading: authLoading } = useStudentAuth();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loginMethod, setLoginMethod] = useState<'roll_phone' | 'email_pass'>('roll_phone');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [identifierInput, setIdentifierInput] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

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

  // If already authenticated, redirect
  React.useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirectUrl, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, redirectUrl]);

  const handleRollLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      await loginWithRollOrPhone(identifierInput.trim());
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
        setErrorMessage('Invalid student email or password. If you registered for an admission test, switch to "Roll No / Mobile" for instant access.');
      } else {
        setErrorMessage(err.message || 'Failed to sign in. Please verify your internet and credentials.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (registerData.phone.replace(/\D/g, '').length !== 10) {
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

    setSubmitting(true);

    try {
      await signup({
        fullName: registerData.fullName,
        parentName: registerData.parentName,
        email: registerData.email,
        phone: registerData.phone,
        currentClass: registerData.currentClass,
        schoolName: registerData.schoolName,
        preferredCentreId: registerData.preferredCentreId
      }, registerData.password);

      navigate(redirectUrl);
    } catch (err: any) {
      console.error('Student signup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('An account already exists with this email address. Please click "Sign In".');
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
          <span className="text-slate-500 hidden sm:inline">Need assistance?</span>
          <span className="font-bold text-[#002147]">1800 11 4242</span>
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
              <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
                <ShieldAlert className="w-4 h-4 text-[#ED1C24] shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}

            {mode === 'login' ? (
              /* --- SIGN IN OPTIONS --- */
              <div className="space-y-4">
                {/* Login Method Sub-Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => { setLoginMethod('roll_phone'); setErrorMessage(null); }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      loginMethod === 'roll_phone' ? 'bg-[#002147] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Roll No / Mobile (Fast Access)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLoginMethod('email_pass'); setErrorMessage(null); }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      loginMethod === 'email_pass' ? 'bg-[#002147] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Email & Password
                  </button>
                </div>

                {loginMethod === 'roll_phone' ? (
                  /* Option A: Fast Access via Roll Number or Mobile */
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
                          placeholder="e.g. 7052 03733 111026 0012 or 9437012345"
                          value={identifierInput}
                          onChange={(e) => setIdentifierInput(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Use the 10-digit mobile number or exam roll number from your admission test registration.
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
                  /* Option B: Standard Email & Password */
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Student Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          placeholder="e.g. rahul.sharma@gmail.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Password
                      </label>
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
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
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
                          <span>Sign In to Student Portal</span>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. student@gmail.com"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Mobile Number (10 Digits) *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="e.g. 9876543210"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value.replace(/\D/g, '') })}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#002147] focus:bg-white outline-none font-mono"
                      />
                    </div>
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

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#ED1C24] hover:bg-[#d6171e] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 mt-2"
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
