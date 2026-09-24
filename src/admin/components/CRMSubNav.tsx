import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Sparkles, 
  Contact, 
  Send, 
  Clock, 
  FolderArchive, 
  LucideIcon,
  HelpCircle
} from 'lucide-react';

interface CRMSubNavProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  badgeText?: string;
  actions?: React.ReactNode;
  candidateCount?: number;
  campaignsCount?: number;
  overdueCount?: number;
  openTicketsCount?: number;
}

export const CRMSubNav: React.FC<CRMSubNavProps> = ({
  title,
  subtitle,
  icon: Icon,
  badgeText,
  actions,
  candidateCount,
  campaignsCount,
  overdueCount,
  openTicketsCount
}) => {
  return (
    <div className="bg-white border-b border-slate-200 -mt-4 sm:-mt-6 lg:-mt-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-4">
      {/* Top Header Strip */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-3">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-red-50 text-[#ED1C24] border border-red-100 rounded-xl shadow-2xs">
            <Icon className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-[#002147] tracking-tight">
                {title}
              </h1>
              {badgeText && (
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-red-50 text-[#ED1C24] border border-red-200 tracking-wider">
                  {badgeText}
                </span>
              )}
            </div>
            {subtitle && (
              <span className="text-[11px] text-slate-500 font-medium">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 flex-wrap">
            {actions}
          </div>
        )}
      </div>

      {/* Uniform CRM Tabs */}
      <div className="flex gap-2 overflow-x-auto border-t border-slate-100 pt-1">
        <NavLink
          to="/admin/crm"
          end
          className={({ isActive }) =>
            `px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              isActive
                ? 'border-[#ED1C24] text-[#ED1C24]'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`
          }
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Overview & Funnel</span>
        </NavLink>

        <NavLink
          to="/admin/crm/contacts"
          className={({ isActive }) =>
            `px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              isActive
                ? 'border-[#ED1C24] text-[#ED1C24]'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`
          }
        >
          <Contact className="w-3.5 h-3.5" />
          <span>Candidate Directory</span>
          {candidateCount !== undefined && (
            <span className="text-[10px] font-mono font-semibold text-slate-400">
              ({candidateCount})
            </span>
          )}
        </NavLink>

        <NavLink
          to="/admin/crm/compose"
          className={({ isActive }) =>
            `px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              isActive
                ? 'border-[#ED1C24] text-[#ED1C24]'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`
          }
        >
          <Send className="w-3.5 h-3.5" />
          <span>Compose Outreach</span>
        </NavLink>

        <NavLink
          to="/admin/crm/followups"
          className={({ isActive }) =>
            `px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              isActive
                ? 'border-[#ED1C24] text-[#ED1C24]'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`
          }
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Follow-up Reminders</span>
          {overdueCount !== undefined && overdueCount > 0 && (
            <span className="bg-[#ED1C24] text-white text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold shadow-2xs">
              {overdueCount}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/admin/crm/campaigns"
          className={({ isActive }) =>
            `px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              isActive
                ? 'border-[#ED1C24] text-[#ED1C24]'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`
          }
        >
          <FolderArchive className="w-3.5 h-3.5" />
          <span>Saved Campaigns</span>
          {campaignsCount !== undefined && (
            <span className="text-[10px] font-mono font-semibold text-slate-400">
              ({campaignsCount})
            </span>
          )}
        </NavLink>

        <NavLink
          to="/admin/crm/tickets"
          className={({ isActive }) =>
            `px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              isActive
                ? 'border-[#ED1C24] text-[#ED1C24]'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`
          }
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Support Inquiries</span>
          {openTicketsCount !== undefined && openTicketsCount > 0 && (
            <span className="bg-[#ED1C24] text-white text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold shadow-2xs">
              {openTicketsCount}
            </span>
          )}
        </NavLink>
      </div>
    </div>
  );
};
