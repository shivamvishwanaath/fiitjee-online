import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Building2, 
  LogOut, 
  ExternalLink,
  ShieldCheck,
  Bell
} from 'lucide-react';
import { CentreProfile } from '../utils/centreUtils';
import { AdminBreadcrumbs } from './AdminBreadcrumbs';

interface AdminNavbarProps {
  centre: CentreProfile | null;
  actorEmail?: string;
  onLogout: () => Promise<void>;
  onOpenMobileMenu?: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ 
  centre, 
  actorEmail, 
  onLogout,
  onOpenMobileMenu 
}) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await onLogout();
    navigate('/admin/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs h-14 shrink-0 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <AdminBreadcrumbs />
      </div>

      {/* Right: Centre Info & Quick Actions */}
      <div className="flex items-center gap-2.5">
        {centre && (
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">
            <Building2 className="w-3.5 h-3.5 text-[#ED1C24]" />
            <span>{centre.name}</span>
            <span className="bg-[#002147] text-white px-1.5 py-0.2 rounded text-[10px] font-mono">
              {centre.code}
            </span>
          </div>
        )}

        <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

        {/* View Public Site */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1 text-slate-500 hover:text-[#ED1C24] text-xs font-semibold px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors"
          title="Open live website"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Site</span>
        </a>

        {/* Staff Email Pill */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-[11px] font-mono font-bold text-slate-700 hidden sm:inline truncate max-w-[140px]">
            {actorEmail ? actorEmail.split('@')[0] : 'staff'}
          </span>
          <button
            onClick={handleSignOut}
            className="text-slate-400 hover:text-red-600 ml-1 p-0.5 rounded cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

