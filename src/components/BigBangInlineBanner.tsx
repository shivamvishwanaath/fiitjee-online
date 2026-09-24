import React from 'react';
import { Sparkles, Calendar, ArrowRight } from 'lucide-react';
import { useBigBangCountdown } from '../hooks/useBigBangCountdown';

interface BigBangInlineBannerProps {
  onOpenBigBangModal: () => void;
}

export const BigBangInlineBanner: React.FC<BigBangInlineBannerProps> = ({
  onOpenBigBangModal
}) => {
  const { days, hours, minutes, seconds, isExpired } = useBigBangCountdown();

  if (isExpired) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-gradient-to-r from-[#ED1C24] via-[#7a131b] to-[#002147] rounded-3xl p-5 md:p-6 shadow-md border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
        
        {/* Background light glow decoration */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -z-10" />

        <div className="flex flex-col sm:flex-row items-center gap-3.5 text-center sm:text-left">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white text-[#ED1C24] text-[9px] font-black uppercase tracking-wider rounded-md shrink-0 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#ED1C24] animate-spin" />
            <span>Limited Spots</span>
          </div>
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-tight leading-snug">
              Big Bang Edge Test — 11th & 18th Oct 2026
            </h3>
            <p className="text-xs text-slate-200 font-semibold mt-0.5">Evaluate potential and earn diagnostic scholarships across 4 major centers.</p>
          </div>
        </div>

        {/* Action column */}
        <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full md:w-auto justify-center">
          
          {/* Monospace Countdown */}
          <div className="flex items-center gap-1.5 text-xs text-white">
            <Calendar className="w-4 h-4 text-amber-300" />
            <div className="font-mono font-bold text-amber-300 bg-black/20 border border-white/10 px-2.5 py-1 rounded">
              <span>{String(days).padStart(2, '0')}d</span>
              <span className="opacity-40 font-sans mx-0.5">:</span>
              <span>{String(hours).padStart(2, '0')}h</span>
              <span className="opacity-40 font-sans mx-0.5">:</span>
              <span>{String(minutes).padStart(2, '0')}m</span>
              <span className="opacity-40 font-sans mx-0.5">:</span>
              <span className="animate-pulse">{String(seconds).padStart(2, '0')}s</span>
            </div>
          </div>

          <button
            onClick={onOpenBigBangModal}
            className="w-full sm:w-auto px-6 py-2.5 bg-white hover:bg-slate-100 text-[#002147] hover:text-[#ED1C24] font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
          >
            <span>Register Free</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>
    </div>
  );
};
