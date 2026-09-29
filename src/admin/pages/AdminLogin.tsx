import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { 
  Building2, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldAlert, 
  Eye, 
  EyeOff,
  Sparkles,
  CheckCircle2,
  KeyRound,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { ALL_CENTRES } from '../utils/centreUtils';
import { FiitjeeLogo } from '../../components/FiitjeeLogo';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { 
    isAuthenticated, 
    loading, 
    user, 
    centre, 
    loginWithEmail, 
    sendPasswordReset, 
    logout 
  } = useAdminAuth();

  const [selectedTargetCentreId, setSelectedTargetCentreId] = useState<string>('bhubaneswar');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  // If already authenticated and not loading, redirect to dashboard
  if (!loading && isAuthenticated && user) {
    return <Navigate to="/admin" replace />;
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);
    setResetSent(false);

    try {
      await loginWithEmail(email.trim(), password, selectedTargetCentreId);
      navigate('/admin');
    } catch (err: any) {
      console.error('Admin Auth Login error [AUTH-ERR-401]:', err);
      if (
        err.code === 'auth/invalid-credential' || 
        err.code === 'auth/wrong-password' || 
        err.code === 'auth/user-not-found'
      ) {
        setErrorMessage('Invalid credentials. Please verify your email and password [AUTH-ERR-401].');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMessage('Access temporarily blocked due to repeated failed attempts. Please try again later.');
      } else {
        setErrorMessage(err.message || 'Authentication failed. Please verify your network or credentials.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectPreset = (centreId: string, centreEmail: string) => {
    setSelectedTargetCentreId(centreId);
    setEmail(centreEmail);
    setPassword('password');
    setErrorMessage(null);
    setResetSent(false);
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your centre or admin email address above first.');
      return;
    }
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await sendPasswordReset(email.trim());
      setResetSent(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not send password reset email.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#001429] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Subtle background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#ED1C24]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center px-4">
        <div className="inline-block mb-3">
          <FiitjeeLogo variant="white" size="md" showTagline={false} />
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight font-display">
          Centre Operations Portal
        </h2>
        <p className="mt-1 text-xs text-slate-300">
          Management &amp; Admissions Operations Console
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl border border-slate-200 sm:px-10 space-y-6">
          
          {/* Active User Session Banner (if already logged in) */}
          {user && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-emerald-800">Authenticated Session Active</div>
                  <div className="text-xs font-mono font-semibold text-emerald-950 truncate">{user.email}</div>
                </div>
              </div>
              <div className="p-2.5 bg-white/80 border border-emerald-100 rounded-lg text-xs">
                <div className="text-[10px] uppercase font-bold text-slate-400">Assigned Branch Vault</div>
                <div className="font-bold text-[#002147] flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-[#ED1C24]" />
                  <span>FIITJEE {centre?.name}</span>
                  <span className="bg-[#002147] text-white px-1.5 py-0.2 rounded text-[10px] font-mono">{centre?.code}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                  <span>Access is locked to this centre. To access another centre, sign out first.</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="flex-1 py-2 bg-[#002147] hover:bg-[#001733] text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Open {centre?.name || 'Admin'} Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Sign out from this session to switch branch"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Centre Buttons */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select Operating Branch to Sign In:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_CENTRES.map((c) => {
                const isSelected = selectedTargetCentreId === c.id || email === c.email;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectPreset(c.id, c.email)}
                    className={`p-2 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-[#ED1C24] bg-red-50/60 text-[#002147] shadow-xs ring-1 ring-[#ED1C24]'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{c.code}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Centre / Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-transparent font-medium"
                  placeholder="fiitjee.bhubaneswar@fiitjee.online"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Access Password
                </label>
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="text-[11px] text-[#ED1C24] hover:underline font-semibold cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-transparent font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Default temporary password for centre logins: <code className="text-slate-600 font-mono">password</code></p>
            </div>

            {/* Password Reset Notice */}
            {resetSent && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>Password reset instructions have been emailed to {email}. Check your inbox.</span>
              </div>
            )}

            {/* Error message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-[#ED1C24] flex items-start gap-2 animate-in fade-in">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-[#ED1C24] hover:bg-[#c9141b] disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider mt-2"
            >
              <span>{submitting ? 'Verifying credentials...' : 'Sign In to Operations Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Institutional note */}
          <div className="border-t border-slate-100 pt-4 text-center">
            <p className="text-[10px] text-slate-400">
              Enterprise Secure Operations Gateway. All access events are cryptographically authenticated and logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
