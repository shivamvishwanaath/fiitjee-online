import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Sparkles, Phone } from 'lucide-react';
import { useBigBangCountdown } from '../hooks/useBigBangCountdown';

interface BigBangPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBigBangModal: () => void;
}

export const BigBangPopup: React.FC<BigBangPopupProps> = ({
  isOpen,
  onClose,
  onOpenBigBangModal
}) => {
  const { days, hours, minutes, seconds, isExpired } = useBigBangCountdown();
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Auto-dismiss popup after 7.5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 7500);

    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleClose = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onClose();
      setIsFadingOut(false);
    }, 400); // fade out duration
  };

  const handleRegisterClick = () => {
    handleClose();
    // Tiny delay to allow fadeout to finish cleanly before opening modal
    setTimeout(() => {
      onOpenBigBangModal();
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-all duration-300 ${
        isFadingOut ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative bg-[#001429] text-white border-3 border-[#ED1C24] rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Glowing spotlights inside popup */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#ED1C24]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-20 cursor-pointer"
          aria-label="Close Announcement"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Dynamic Auto-dismiss indicator bar */}
        <div className="absolute bottom-0 left-0 h-1.5 bg-[#ED1C24] w-full animate-marquee" 
             style={{ 
               animation: 'shrinkWidth 7.5s linear forwards',
               transformOrigin: 'left'
             }} 
        />

        {/* Content body */}
        <div className="p-6 sm:p-8 space-y-6 flex flex-col items-center text-center">
          
          {/* Logo banner */}
          <div className="flex justify-center">
            <img
              src="https://dujozny86idgo.cloudfront.net/images/FIITJEE%20Logo.svg"
              alt="FIITJEE Logo"
              className="h-10 sm:h-12 w-auto object-contain brightness-0 invert"
            />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 bg-[#ED1C24] text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded tracking-wider shadow-sm">
              <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
              <span>Special Announcement</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-display mt-2 leading-none">
              Big Bang Edge Test 2026
            </h2>
            <p className="text-xs font-black text-amber-300 italic tracking-wide">
              "Some choices are obvious."
            </p>
          </div>

          <p className="text-xs sm:text-sm font-semibold text-slate-300 leading-relaxed max-w-sm">
            A comprehensive 360° analysis of aptitude, potential & academic standing for Students of Class V, VI, VII, VIII, IX, X & XI.
          </p>

          {/* Test Specs Row */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-black uppercase">
            <span className="flex items-center gap-1 bg-white/5 border border-white/15 px-2.5 py-1 rounded-sm text-slate-200">
              <Calendar className="w-3.5 h-3.5 text-[#ED1C24]" />
              <span>11th & 18th Oct 2026</span>
            </span>
            <span className="bg-[#ED1C24] text-white px-2.5 py-1 rounded-sm">
              Offline & Proctored Online
            </span>
          </div>

          {/* Live Countdown Display */}
          {!isExpired && (
            <div className="space-y-1.5 w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Countdown to Registration Slot 1</span>
              <div className="flex justify-center gap-3 text-center">
                <div>
                  <div className="text-2xl font-black text-white font-mono leading-none">{String(days).padStart(2, '0')}</div>
                  <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Days</div>
                </div>
                <div className="text-2xl font-black text-slate-500 leading-none self-start">:</div>
                <div>
                  <div className="text-2xl font-black text-white font-mono leading-none">{String(hours).padStart(2, '0')}</div>
                  <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Hrs</div>
                </div>
                <div className="text-2xl font-black text-slate-500 leading-none self-start">:</div>
                <div>
                  <div className="text-2xl font-black text-white font-mono leading-none">{String(minutes).padStart(2, '0')}</div>
                  <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Mins</div>
                </div>
                <div className="text-2xl font-black text-slate-500 leading-none self-start">:</div>
                <div>
                  <div className="text-2xl font-black text-amber-300 font-mono leading-none animate-pulse">{String(seconds).padStart(2, '0')}</div>
                  <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Secs</div>
                </div>
              </div>
            </div>
          )}

          {/* Helpline directory snippet */}
          <div className="w-full grid grid-cols-2 gap-2 text-[9px] font-bold text-slate-400">
            <div className="bg-white/5 p-2 rounded-lg flex items-center gap-1.5 justify-center">
              <MapPin className="w-3.5 h-3.5 text-[#ED1C24]" />
              <span>Bhubaneswar / Ranchi</span>
            </div>
            <div className="bg-white/5 p-2 rounded-lg flex items-center gap-1.5 justify-center">
              <MapPin className="w-3.5 h-3.5 text-[#ED1C24]" />
              <span>Dwarka / Hyderabad</span>
            </div>
          </div>

          <div className="w-full flex gap-3 pt-2">
            <button
              onClick={handleClose}
              className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Skip Announcement
            </button>
            <button
              onClick={handleRegisterClick}
              className="flex-1 py-3 bg-[#ED1C24] hover:bg-[#d6171e] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1"
            >
              <span>Register Now</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </button>
          </div>

        </div>

      </div>

      {/* Styled inline animation for auto-dismiss timer shrinking */}
      <style>{`
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};
