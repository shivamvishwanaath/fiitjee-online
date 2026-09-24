import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  admin: 'Dashboard',
  registrations: 'Registrations',
  add: 'New Registration',
  coupons: 'Coupon Codes',
  create: 'Create Coupon',
  crm: 'CRM Hub',
  contacts: 'Contacts',
  compose: 'Compose Outreach',
  campaigns: 'Campaigns',
  followups: 'Follow-ups'
};

export const AdminBreadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length <= 1) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Home className="w-3.5 h-3.5 text-slate-400" />
        <span>Admin Control Center</span>
      </div>
    );
  }

  let accumulatedPath = '';

  return (
    <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 overflow-x-auto py-1">
      <Link to="/admin" className="flex items-center gap-1 text-slate-600 hover:text-[#ED1C24] transition-colors">
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Admin</span>
      </Link>

      {pathSegments.slice(1).map((segment, index) => {
        accumulatedPath += `/${segment}`;
        const isLast = index === pathSegments.length - 2;
        const label = ROUTE_LABELS[segment] || segment.replace(/[-_]/g, ' ');

        return (
          <React.Fragment key={accumulatedPath}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {isLast ? (
              <span className="text-[#002147] font-bold capitalize truncate max-w-[160px]">
                {label}
              </span>
            ) : (
              <Link
                to={`/admin${accumulatedPath}`}
                className="text-slate-500 hover:text-[#ED1C24] transition-colors capitalize truncate max-w-[120px]"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
