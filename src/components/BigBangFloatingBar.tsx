import React, { useState } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { useBigBangCountdown } from '../hooks/useBigBangCountdown';

interface BigBangFloatingBarProps {
  onOpenBigBangModal: () => void;
  isBigBangModalOpen: boolean;
}

export const BigBangFloatingBar: React.FC<BigBangFloatingBarProps> = ({
  onOpenBigBangModal,
  isBigBangModalOpen
}) => {
  const { days, hours, minutes, seconds, isExpired } = useBigBangCountdown();
  const [isDismissed, setIsDismissed] = useState(false);

  // Hide on details page, if dismissed, if countdown expired, or if modal is active
  if (isDismissed || isExpired || isBigBangModalOpen) return null;
  if (window.location.pathname === '/fiitjee-admission-test-details') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#002147] text-white border-t-2 border-[#ED1C24] py-3.5 px-4 shadow-xl flex items-center justify-between transition-all duration-300 animate-in slide-in-from-bottom-5">
      
      {/* Visual content container */}
      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left pr-6">
        
        {/* Left: Headline & Badge */}
        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-flex items-center gap-1 bg-[#ED1C24] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-sm animate-pulse">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Reg. Open</span>
          </span>
          <div>
            <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5 justify-center md:justify-start">
              FIITJEE Big Bang Edge Test 2026
            </h4>
            <p className="text-[10px] text-slate-400 font-bold hidden md:block">Scholarship cum Diagnostic Exam for Class V–XI</p>
          </div>
        </div>

        {/* Center: Monospace Countdown */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Slots close in:</span>
          <div className="font-mono text-xs sm:text-sm font-black text-amber-300 flex items-center gap-0.5 bg-black/30 px-2.5 py-1 rounded-md border border-white/5">
            <span>{String(days).padStart(2, '0')}d</span>
            <span className="text-slate-500">:</span>
            <span>{String(hours).padStart(2, '0')}h</span>
            <span className="text-slate-500">:</span>
            <span>{String(minutes).padStart(2, '0')}m</span>
            <span className="text-slate-500">:</span>
            <span className="animate-pulse text-amber-400">{String(seconds).padStart(2, '0')}s</span>
          </div>
        </div>

        {/* Right: Registration Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenBigBangModal}
            className="px-5 py-2 bg-[#ED1C24] hover:bg-[#d6171e] text-white font-black text-[10px] uppercase tracking-widest rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-md shadow-red-950/20"
          >
            <span>Register Free</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Close cross trigger */}
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
        aria-label="Dismiss Bar"
      >
        <X className="w-4 h-4" />
      </button>

    </div>
  );
};
