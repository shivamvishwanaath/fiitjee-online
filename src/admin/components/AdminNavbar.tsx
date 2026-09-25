import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Building2, 
  LogOut, 
  ExternalLink,
  ChevronDown,
  Check
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { AdminBreadcrumbs } from './AdminBreadcrumbs';

interface AdminNavbarProps {
  onOpenMobileMenu?: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ 
  onOpenMobileMenu 
}) => {
  const navigate = useNavigate();
  const { centre, user, logout, switchCentre, availableCentres } = useAdminAuth();
  const [centreMenuOpen, setCentreMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCentreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await logout();
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

      {/* Right: Centre Switcher Dropdown & User Actions */}
      <div className="flex items-center gap-2.5">
        {/* Interactive Operating Branch Switcher */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setCentreMenuOpen(!centreMenuOpen)}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-800 px-3 py-1.5 rounded-full text-xs font-bold border border-slate-200 transition-colors cursor-pointer shadow-2xs"
            title="Click to switch operating centre"
          >
            <Building2 className="w-3.5 h-3.5 text-[#ED1C24]" />
            <span>{centre?.name || 'All Centres'}</span>
            <span className="bg-[#002147] text-white px-1.5 py-0.5 rounded text-[10px] font-mono">
              {centre?.code}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${centreMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {centreMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Select Active Centre Branch
              </div>
              <div className="mt-1 divide-y divide-slate-100">
                {availableCentres.map((c) => {
                  const isSelected = centre?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        switchCentre(c.id);
                        setCentreMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                        isSelected ? 'font-bold text-[#ED1C24] bg-red-50/50' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className={`w-3.5 h-3.5 ${isSelected ? 'text-[#ED1C24]' : 'text-slate-400'}`} />
                        <span>FIITJEE {c.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-slate-400">{c.code}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#ED1C24]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

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

        {/* Authenticated Admin Account Pill */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-500" title="Firebase Auth Connected"></div>
          <span className="text-[11px] font-mono font-bold text-slate-700 hidden sm:inline truncate max-w-[140px]">
            {user?.email ? user.email.split('@')[0] : 'admin'}
          </span>
          <button
            onClick={handleSignOut}
            className="text-slate-400 hover:text-red-600 ml-1 p-0.5 rounded cursor-pointer transition-colors"
            title="Sign out of Firebase Auth"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
