import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Tag, 
  Mail, 
  Contact, 
  Clock, 
  Send, 
  LogOut, 
  Building2, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
  Sparkles
} from 'lucide-react';
import { CentreProfile } from '../utils/centreUtils';
import { FiitjeeLogo } from '../../components/FiitjeeLogo';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  centre: CentreProfile | null;
  actorEmail?: string;
  onLogout: () => Promise<void>;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  centre,
  actorEmail,
  onLogout
}) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await onLogout();
    navigate('/admin/login');
  };

  const navGroups = [
    {
      group: 'Overview',
      items: [
        { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
      ]
    },
    {
      group: 'Admissions & Desk',
      items: [
        { to: '/admin/registrations', label: 'All Registrations', icon: Users, end: true },
        { to: '/admin/registrations/add', label: 'Register Student', icon: UserPlus, end: true },
      ]
    },
    {
      group: 'Promotions',
      items: [
        { to: '/admin/coupons', label: 'Coupon Codes', icon: Tag, end: false },
      ]
    },
    {
      group: 'CRM Outreach',
      items: [
        { to: '/admin/crm', label: 'CRM Hub', icon: Mail, end: true },
        { to: '/admin/crm/contacts', label: 'Candidate Directory', icon: Contact, end: true },
        { to: '/admin/crm/compose', label: 'Compose Outreach', icon: Send, end: true },
        { to: '/admin/crm/followups', label: 'Follow-ups', icon: Clock, end: true },
      ]
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#001429] text-white border-r border-slate-800 select-none">
      
      {/* Brand & Centre Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <NavLink to="/admin" className="flex items-center gap-2.5 overflow-hidden">
          <FiitjeeLogo variant="white" size="sm" showTagline={false} />
          {!collapsed && (
            <div className="leading-tight truncate">
              <span className="text-[10px] uppercase font-black text-amber-400 tracking-wider block">Admin Control</span>
              <span className="text-xs font-black text-white uppercase tracking-tight">Portal Hub</span>
            </div>
          )}
        </NavLink>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Desktop collapse toggle button */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Centre Identifier Card */}
      {centre && !collapsed && (
        <div className="mx-3 my-3 p-3 bg-gradient-to-br from-[#002147] to-slate-900 rounded-xl border border-slate-700 shadow-inner">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Active Branch</span>
          </div>
          <div className="text-xs font-black text-white flex items-center gap-1.5 truncate">
            <Building2 className="w-3.5 h-3.5 text-[#ED1C24] shrink-0" />
            <span className="truncate">{centre.name}</span>
            <span className="bg-[#ED1C24] text-white px-1.5 py-0.2 rounded-sm text-[9px] font-mono font-bold shrink-0">{centre.code}</span>
          </div>
          <div className="text-[10px] font-mono text-amber-300/80 mt-1 truncate">
            GSTIN: {centre.gstin}
          </div>
        </div>
      )}

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {navGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            {!collapsed && (
              <div className="px-2.5 text-[9.5px] font-black uppercase tracking-wider text-slate-400 mb-1">
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#ED1C24] text-white shadow-md shadow-red-900/30'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    } ${collapsed ? 'justify-center px-2' : ''}`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}

        {/* Public Site Link */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800/80 hover:text-amber-400 transition-all ${
              collapsed ? 'justify-center px-2' : ''
            }`}
            title={collapsed ? 'Live Public Website' : undefined}
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate">Public Website</span>}
          </a>
        </div>
      </nav>

      {/* Footer Profile & Sign Out */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <div className="w-7 h-7 rounded-full bg-[#002147] border border-slate-700 flex items-center justify-center text-[10px] font-black text-amber-400 shrink-0 uppercase">
                {centre?.name.charAt(0) || 'F'}
              </div>
              <div className="truncate">
                <div className="text-[11px] font-bold text-white truncate">{actorEmail || 'staff@fiitjee.online'}</div>
                <div className="text-[9px] text-slate-400 uppercase font-semibold">Authorized Staff</div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full py-2 px-3 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleSignOut}
            className="w-full p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <aside className="relative z-50 w-72 h-full shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
