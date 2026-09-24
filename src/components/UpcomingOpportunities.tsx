import React from 'react';
import { Calendar, Sparkles, ArrowRight } from 'lucide-react';

interface UpcomingOpportunitiesProps {
  onOpenFtreModal: () => void;
  onOpenBigBangModal: () => void;
  onNavigate: (sectionId: string) => void;
}

export const UpcomingOpportunities: React.FC<UpcomingOpportunitiesProps> = ({
  onOpenFtreModal,
  onOpenBigBangModal,
  onNavigate
}) => {
  return (
    <section className="bg-[#f8fafc] py-16 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-black text-[#ED1C24] uppercase tracking-wider mb-3">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>Diagnostic Cum Scholarship Opportunities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#141414] font-display tracking-tight uppercase leading-none">
            Upcoming Admission Tests
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-4 leading-relaxed font-semibold">
            Evaluate your raw potential, check national benchmarking, and secure up to 100% scholarships and tuition fee waivers for serious competitive studies.
          </p>
        </div>

        {/* 4 Opportunities Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mb-12">
          
          {/* Card 1: FTRE */}
          <div className="bg-white border border-slate-200/80 shadow-md hover:shadow-xl transition-all p-6 flex flex-col justify-between rounded-tl-[40px] rounded-br-[12px] rounded-tr-[12px] rounded-bl-[12px]">
            <div className="space-y-4">
              <div className="inline-block px-2.5 py-0.5 bg-red-50 text-[#ED1C24] border border-red-200 text-[9px] font-black uppercase tracking-wider rounded">
                National Standard Test
              </div>
              <h3 className="text-xl font-black text-[#141414] leading-snug">
                Talent Reward Exam (FTRE)
              </h3>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                The absolute benchmark test for students aiming for JEE Main, JEE Advanced, and scholastic excellence. Earn national rankings and scholarship packages.
              </p>
              <div className="pt-1 text-[11px] font-bold text-slate-500 space-y-1">
                <div>Target: <strong className="text-slate-800">Class VI, VII, VIII, IX, X, XI & XII</strong></div>
                <div className="flex items-center gap-1.5 text-[#ED1C24]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Exam Date: 28th December 2025</span>
                </div>
              </div>
            </div>
            <div className="pt-5">
              <button
                onClick={onOpenFtreModal}
                className="w-full py-2.5 bg-[#ED1C24] hover:bg-[#d6171e] text-white font-black text-xs uppercase tracking-widest rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Register Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Big Bang Edge Test (Featured spotlight card with dark theme & scaling) */}
          <div className="bg-[#141414] text-white border border-neutral-800 shadow-2xl hover:shadow-neutral-900/40 transition-all p-6 flex flex-col justify-between rounded-tr-[40px] rounded-bl-[40px] rounded-tl-[12px] rounded-br-[12px] lg:-translate-y-4 lg:scale-[1.03] z-10 relative">
            <div className="absolute -top-3 right-6 bg-[#ED1C24] text-white text-[8px] font-black px-3 py-0.5 rounded-full uppercase tracking-widest shadow-md">
              Featured Test
            </div>
            <div className="space-y-4">
              <div className="inline-block px-2.5 py-0.5 bg-white/10 text-amber-300 border border-white/20 text-[9px] font-black uppercase tracking-wider rounded">
                Aptitude & Potential
              </div>
              <h3 className="text-xl font-black text-white leading-snug">
                Big Bang Edge Test
              </h3>
              <p className="text-xs text-neutral-400 font-semibold leading-relaxed">
                A 360° diagnostic check. Tailor-made to check logical thinking, analytical skills, and readiness for national competitive studies.
              </p>
              <div className="pt-1 text-[11px] font-bold text-neutral-400 space-y-1">
                <div>Target: <strong className="text-white">Class V, VI, VII, VIII, IX, X & XI</strong></div>
                <div className="flex items-center gap-1.5 text-amber-300 font-black">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Dates: 11th & 18th Oct 2026</span>
                </div>
              </div>
            </div>
            <div className="pt-5">
              <button
                onClick={onOpenBigBangModal}
                className="w-full py-2.5 bg-[#ED1C24] hover:bg-[#d6171e] text-white font-black text-xs uppercase tracking-widest rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Register Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: Dronacharya - 1 */}
          <div className="bg-white border border-slate-200/80 shadow-md hover:shadow-xl transition-all p-6 flex flex-col justify-between rounded-tl-[40px] rounded-br-[12px] rounded-tr-[12px] rounded-bl-[12px]">
            <div className="space-y-4">
              <div className="inline-block px-2.5 py-0.5 bg-red-50 text-[#ED1C24] border border-red-200 text-[9px] font-black uppercase tracking-wider rounded">
                Early Academic Catalyst
              </div>
              <h3 className="text-xl font-black text-[#141414] leading-snug">
                Dronacharya - 1
              </h3>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                Unlock specialized mentoring streams. Tailor-made diagnostics to establish deep logic and precision concepts before the session commencement.
              </p>
              <div className="pt-1 text-[11px] font-bold text-slate-500 space-y-1">
                <div>Target: <strong className="text-slate-800">Class VI, VII, VIII, IX, X, XI & XII</strong></div>
                <div className="flex items-center gap-1.5 text-[#ED1C24]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Exam Date: 8th February 2026</span>
                </div>
              </div>
            </div>
            <div className="pt-5">
              <button
                onClick={() => onNavigate('/fiitjee-admission-test-details')}
                className="w-full py-2.5 bg-[#ED1C24] hover:bg-[#d6171e] text-white font-black text-xs uppercase tracking-widest rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 4: EVT */}
          <div className="bg-white border border-slate-200/80 shadow-md hover:shadow-xl transition-all p-6 flex flex-col justify-between rounded-tl-[40px] rounded-br-[12px] rounded-tr-[12px] rounded-bl-[12px]">
            <div className="space-y-4">
              <div className="inline-block px-2.5 py-0.5 bg-red-50 text-[#ED1C24] border border-red-200 text-[9px] font-black uppercase tracking-wider rounded">
                National Talent Pipeline
              </div>
              <h3 className="text-xl font-black text-[#141414] leading-snug">
                Escape Velocity Test (EVT)
              </h3>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                Exclusively tailored to align scholastic study with intense problem-solving requirements, offering a seamless acceleration bridge program.
              </p>
              <div className="pt-1 text-[11px] font-bold text-slate-500 space-y-1">
                <div>Target: <strong className="text-slate-800">Class VI, VII, VIII, IX, X, XI & XII</strong></div>
                <div className="flex items-center gap-1.5 text-[#ED1C24]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Dates: 29th March & 5th April 2026</span>
                </div>
              </div>
            </div>
            <div className="pt-5">
              <button
                onClick={() => onNavigate('/fiitjee-admission-test-details')}
                className="w-full py-2.5 bg-[#ED1C24] hover:bg-[#d6171e] text-white font-black text-xs uppercase tracking-widest rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Section Footer: Continuous Selection Test Info */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2">
            <h4 className="text-lg font-black text-[#141414] uppercase tracking-wide flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ED1C24] animate-ping" />
              Wish to enrol immediately?
            </h4>
            <p className="text-xs font-semibold text-slate-600 leading-relaxed max-w-3xl">
              Continuous Online Selection Tests for Students presently in <strong className="text-slate-900">Class VII, VIII, IX, X, XI, XII & XII Pass</strong> are held every single day. Take this test at your convenience to secure quick admission.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={onOpenFtreModal}
              className="px-6 py-3 bg-[#141414] hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
            >
              Take Daily Test
            </button>
            <button
              onClick={() => onNavigate('/fiitjee-admission-test-details')}
              className="px-6 py-3 bg-transparent border-2 border-slate-300 hover:border-[#ED1C24] text-slate-700 hover:text-[#ED1C24] font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
            >
              Other Test Dates &rarr;
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
