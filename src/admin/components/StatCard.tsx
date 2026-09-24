import React from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  subtext?: string;
  color?: 'blue' | 'red' | 'emerald' | 'amber' | 'purple' | 'slate';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  subtext,
  color = 'blue',
  onClick
}) => {
  const colorMap = {
    blue: 'border-l-blue-500 text-blue-600 bg-blue-500/10',
    red: 'border-l-[#ED1C24] text-[#ED1C24] bg-red-500/10',
    emerald: 'border-l-emerald-500 text-emerald-600 bg-emerald-500/10',
    amber: 'border-l-amber-500 text-amber-600 bg-amber-500/10',
    purple: 'border-l-purple-500 text-purple-600 bg-purple-500/10',
    slate: 'border-l-slate-500 text-slate-600 bg-slate-500/10'
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl p-5 border border-slate-200 shadow-xs border-l-4 transition-all duration-200 hover:shadow-md ${onClick ? 'cursor-pointer' : ''} ${colorMap[color].split(' ')[0]}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl sm:text-3xl font-black text-[#002147] mt-1 font-mono tracking-tight">{value}</p>
          {subtext && <p className="text-[11px] text-slate-400 mt-1 font-medium">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorMap[color].split(' ').slice(1).join(' ')}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
