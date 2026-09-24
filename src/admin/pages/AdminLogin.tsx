import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { 
  Building2, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldAlert, 
  Eye, 
  EyeOff,
  Sparkles
} from 'lucide-react';
import { auth } from '../../firebase';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { ALL_CENTRES } from '../utils/centreUtils';
import { FiitjeeLogo } from '../../components/FiitjeeLogo';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!loading && isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate('/admin');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setErrorMessage('Invalid credentials. Please verify that this centre email and password exist in Firebase Authentication.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMessage('Access temporarily blocked due to repeated failed attempts. Please try again later.');
      } else {
        setErrorMessage(err.message || 'Authentication failed. Check your network or credentials.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectPreset = (centreEmail: string) => {
    setEmail(centreEmail);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#001429] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
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
          Management and Admissions Console for FIITJEE Authorized Centres
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl border border-slate-200 sm:px-10 space-y-6">
          
          {/* Quick Centre Buttons */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select Operating Centre:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_CENTRES.map((c) => {
                const isSelected = email === c.email;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectPreset(c.email)}
                    className={`p-2 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-[#ED1C24] bg-red-50/60 text-[#002147] shadow-xs'
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

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Centre Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-transparent font-medium"
                  placeholder="fiitjee.centre@fiitjee.online"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Access Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-transparent font-medium"
                  placeholder="password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Default temporary password: <code className="text-slate-600 font-mono">password</code></p>
            </div>

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
              <span>{submitting ? 'Verifying Credentials...' : 'Sign In to Centre Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Institutional note */}
          <div className="border-t border-slate-100 pt-4 text-center">
            <p className="text-[10px] text-slate-400">
              Authorized access only. All administrative activities are tracked and recorded in the audit log.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
