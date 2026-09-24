import React from 'react';
import { ExamRegistration } from '../../types';

interface StatusBadgeProps {
  status?: ExamRegistration['status'];
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status = 'New', className = '' }) => {
  const getColors = () => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
      case 'Contacted':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      case 'Selected':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/30';
      case 'Absent':
        return 'bg-slate-500/10 text-slate-600 border-slate-500/30';
      case 'New':
      default:
        return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide uppercase ${getColors()} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse"></span>
      {status}
    </span>
  );
};
