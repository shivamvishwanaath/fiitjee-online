import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  User, 
  ChevronLeft, 
  GraduationCap, 
  ExternalLink,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { FiitjeeLogo } from '../../components/FiitjeeLogo';
import { useStudentAuth } from '../hooks/useStudentAuth';

interface StudentNavbarProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const StudentNavbar: React.FC<StudentNavbarProps> = ({
  activeTab,
  onSelectTab
}) => {
  const navigate = useNavigate();
  const { student, logout } = useStudentAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/student/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        
        {/* Left: Brand & Portal Name */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#002147] transition-colors mr-2" title="Back to FIITJEE Home">
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <div className="h-5 w-px bg-slate-200 hidden sm:block" />
          <FiitjeeLogo variant="dark" size="sm" />
          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200">
            <span className="bg-[#002147] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
              Student Portal
            </span>
          </div>
        </div>

        {/* Right: Student Profile & Logout */}
        <div className="flex items-center gap-3 sm:gap-4">
          {student && (
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
              <div className="w-6 h-6 rounded-full bg-[#ED1C24] text-white flex items-center justify-center font-bold text-[10px]">
                {student.fullName ? student.fullName.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-[#002147] leading-tight truncate max-w-[160px]">
                  {student.fullName}
                </div>
                <div className="text-[10px] text-slate-500 font-semibold leading-tight">
                  {student.currentClass}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-[#ED1C24] hover:bg-red-50 rounded-xl transition-all cursor-pointer border border-slate-200"
            title="Sign out of student account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
