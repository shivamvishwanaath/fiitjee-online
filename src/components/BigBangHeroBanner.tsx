import React from 'react';
import { Calendar, Sparkles, ShieldCheck, MapPin, PhoneCall, ArrowRight } from 'lucide-react';
import { useBigBangCountdown } from '../hooks/useBigBangCountdown';
import { BIG_BANG_EXAM } from '../data/examsData';

interface BigBangHeroBannerProps {
  onOpenBigBangModal: () => void;
}

export const BigBangHeroBanner: React.FC<BigBangHeroBannerProps> = ({
  onOpenBigBangModal
}) => {
  const { days, hours, minutes, seconds, isExpired } = useBigBangCountdown();

  return (
    <section 
      id="big-bang-section"
      className="relative overflow-hidden bg-[#001429] text-white py-12 border-b-3 border-[#ED1C24]"
    >
      {/* Spotlight glowing radial gradients inside section */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#ED1C24]/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Exam Details & Call-To-Action (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[9px] font-black uppercase tracking-wider shadow-sm animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>REGISTRATION NOW OPEN</span>
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest">34 Years of Innovation · Sincerity · Ethics</span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-none font-display">
                BIG BANG <br />
                <span className="text-[#ED1C24]">EDGE TEST 2026</span>
              </h2>
              <p className="text-sm font-black text-amber-300 italic">
                "Some choices are obvious."
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 font-semibold leading-relaxed max-w-xl">
              A 360° analysis of aptitude, potential & academic standing. Secure diagnostic benchmarking and scholarship slots for serious study streams.
            </p>

            {/* Test Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <span className="block text-[8px] font-bold text-slate-400 uppercase">Target Classes</span>
                <span className="font-extrabold text-white">{BIG_BANG_EXAM.targetClassesDisplay}</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <span className="block text-[8px] font-bold text-slate-400 uppercase">Test Date Slots</span>
                <span className="font-extrabold text-white flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#ED1C24]" />
                  11th & 18th Oct 2026
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <span className="block text-[8px] font-bold text-slate-400 uppercase">Exam Modes</span>
                <span className="font-extrabold text-white flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Offline & Online
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={onOpenBigBangModal}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#ED1C24] hover:bg-[#d6171e] text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-red-950/20"
              >
                <span>Register Now (Free)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="text-[10px] font-bold text-slate-400">
                ⏳ Early slot registration closes soon
              </div>
            </div>
          </div>

          {/* Right Column: Live Countdown Timer & Helpline (5 Columns) */}
          <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
            
            {/* Live Countdown */}
            {!isExpired ? (
              <div className="space-y-3">
                <h3 className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Time Left for Slot 1 Exam
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-slate-950/40 border border-white/5 p-3 rounded-2xl text-center">
                    <div className="text-3xl font-black text-white font-mono leading-none">{String(days).padStart(2, '0')}</div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">Days</div>
                  </div>
                  <div className="bg-slate-950/40 border border-white/5 p-3 rounded-2xl text-center">
                    <div className="text-3xl font-black text-white font-mono leading-none">{String(hours).padStart(2, '0')}</div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">Hours</div>
                  </div>
                  <div className="bg-slate-950/40 border border-white/5 p-3 rounded-2xl text-center">
                    <div className="text-3xl font-black text-white font-mono leading-none">{String(minutes).padStart(2, '0')}</div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">Minutes</div>
                  </div>
                  <div className="bg-slate-950/40 border border-white/5 p-3 rounded-2xl text-center">
                    <div className="text-3xl font-black text-amber-300 font-mono leading-none animate-pulse">{String(seconds).padStart(2, '0')}</div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">Seconds</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-500/10 border border-red-500/20 text-center py-4 rounded-2xl text-xs font-bold text-[#ED1C24]">
                Registration Slots Closed
              </div>
            )}

            <div className="border-t border-white/10 pt-4 space-y-3">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Official Center Helplines
              </h4>
              <div className="grid grid-cols-2 gap-3 text-[10px]">
                <div className="space-y-1">
                  <span className="block text-slate-400 font-bold">Bhubaneswar</span>
                  <a href="tel:7682041257" className="font-mono text-white font-black hover:text-amber-300 transition-colors flex items-center gap-1">
                    <PhoneCall className="w-3.5 h-3.5 text-[#ED1C24]" />
                    76820 41257
                  </a>
                </div>
                <div className="space-y-1">
                  <span className="block text-slate-400 font-bold">Ranchi</span>
                  <a href="tel:9835155509" className="font-mono text-white font-black hover:text-amber-300 transition-colors flex items-center gap-1">
                    <PhoneCall className="w-3.5 h-3.5 text-[#ED1C24]" />
                    98351 55509
                  </a>
                </div>
                <div className="space-y-1">
                  <span className="block text-slate-400 font-bold">Dwarka</span>
                  <a href="tel:8527208022" className="font-mono text-white font-black hover:text-amber-300 transition-colors flex items-center gap-1">
                    <PhoneCall className="w-3.5 h-3.5 text-[#ED1C24]" />
                    85272 08022
                  </a>
                </div>
                <div className="space-y-1">
                  <span className="block text-slate-400 font-bold">Hyderabad</span>
                  <a href="tel:9247551761" className="font-mono text-white font-black hover:text-amber-300 transition-colors flex items-center gap-1">
                    <PhoneCall className="w-3.5 h-3.5 text-[#ED1C24]" />
                    92475 51761
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
