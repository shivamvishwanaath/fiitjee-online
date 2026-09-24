import React from 'react';
import { Sparkles, Calendar, MapPin, PhoneCall, ShieldCheck, ArrowRight, Info } from 'lucide-react';
import { BIG_BANG_EXAM } from '../data/examsData';

interface AdmissionTestDetailsProps {
  onOpenBigBangModal: () => void;
  onOpenFtreModal: () => void;
}

export const AdmissionTestDetails: React.FC<AdmissionTestDetailsProps> = ({
  onOpenBigBangModal,
  onOpenFtreModal
}) => {
  return (
    <div className="space-y-12">
      {/* 1. Flagship Hero Banner - Big Bang Edge Test */}
      <div className="bg-[#002147] text-white rounded-3xl border-2 border-[#ED1C24] p-8 shadow-xl relative overflow-hidden">
        {/* Background Watermark decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl -z-10" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-2xl -z-10" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/10 pb-6 mb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              <span>Flagship Scholarship Opportunity</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase font-display leading-none">
              FIITJEE Big Bang Edge Test
            </h1>
            <p className="text-xs sm:text-sm font-black text-amber-300 italic tracking-wide">
              "Some choices are obvious."
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={onOpenBigBangModal}
              className="px-8 py-3.5 bg-[#ED1C24] hover:bg-[#d6171e] text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
            >
              <span>Register Now (Free)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Detailed Specs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-xs">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
            <h3 className="font-black uppercase tracking-wider text-amber-300 text-[10px]">Test Objective</h3>
            <p className="text-slate-300 leading-relaxed font-semibold">
              A comprehensive 360° analysis of candidate aptitude, analytical potential, IQ levels, and national competitive standing. Ideal preparation benchmark.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
            <h3 className="font-black uppercase tracking-wider text-amber-300 text-[10px]">Eligible Aspirants</h3>
            <p className="text-white text-sm font-black leading-relaxed">
              {BIG_BANG_EXAM.targetClassesDisplay}
            </p>
            <p className="text-slate-400 text-[10px]">Students going to the next higher class in session 2027.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
            <h3 className="font-black uppercase tracking-wider text-amber-300 text-[10px]">Dates & Mode</h3>
            <div className="space-y-1.5 font-bold text-slate-200">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#ED1C24]" />
                <span>11th & 18th October 2026 (Sunday)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Offline Center & Proctored Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bhubaneswar / Ranchi / Dwarka / Hyderabad Contact Grid */}
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3.5">
            Participating Centers & Helplines (Select Center during Registration)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BIG_BANG_EXAM.offlineCenters.map((center) => (
              <a
                key={center.city}
                href={`tel:${center.phone.replace(/\s+/g, '')}`}
                className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:bg-white/10 hover:border-white/20 transition-all group"
              >
                <div className="space-y-1">
                  <span className="block text-[11px] font-black uppercase text-white group-hover:text-amber-300 transition-colors">
                    {center.city} Center
                  </span>
                  <span className="block text-[10px] text-slate-400">Official Offline Lab Allotment</span>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs font-mono font-black text-[#ED1C24] group-hover:text-red-500">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{center.phone}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Other Scheduled Admission Tests Section */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-3 flex items-center gap-2">
          <Info className="w-5 h-5 text-[#002147]" />
          <h2 className="text-xl font-black text-[#002147] tracking-tight uppercase">
            Other Diagnostic & Admission Test Schedules
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* FTRE Card */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-3">
              <span className="text-[9px] font-black bg-red-50 border border-red-200 text-[#ED1C24] px-2 py-0.5 rounded uppercase tracking-wider">
                National Standard
              </span>
              <h3 className="text-base font-extrabold text-[#002147]">FIITJEE Talent Reward Exam (FTRE)</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                The flagship national standard test assessing competitive preparedness and awarding scholarship packages.
              </p>
              <div className="text-[11px] font-bold text-slate-700">
                Date: <span className="text-slate-900">28th December 2025</span>
              </div>
            </div>
            <button
              onClick={onOpenFtreModal}
              className="mt-5 w-full py-2 bg-slate-100 hover:bg-slate-200 text-[#002147] font-bold text-xs uppercase tracking-wide rounded-lg transition-colors cursor-pointer"
            >
              Register for FTRE
            </button>
          </div>

          {/* Dronacharya - 1 */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-3">
              <span className="text-[9px] font-black bg-slate-100 border border-slate-300 text-slate-700 px-2 py-0.5 rounded uppercase tracking-wider">
                Session Commencement
              </span>
              <h3 className="text-base font-extrabold text-[#002147]">Dronacharya - 1</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Early-commencement diagnostic evaluation designed to select mentoring streams and concepts.
              </p>
              <div className="text-[11px] font-bold text-slate-700">
                Date: <span className="text-slate-900">8th February 2026</span>
              </div>
            </div>
            <button
              onClick={onOpenFtreModal}
              className="mt-5 w-full py-2 bg-slate-100 hover:bg-slate-200 text-[#002147] font-bold text-xs uppercase tracking-wide rounded-lg transition-colors cursor-pointer"
            >
              Register for Dronacharya
            </button>
          </div>

          {/* EVT */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-3">
              <span className="text-[9px] font-black bg-slate-100 border border-slate-300 text-slate-700 px-2 py-0.5 rounded uppercase tracking-wider">
                Bridge Program Selector
              </span>
              <h3 className="text-base font-extrabold text-[#002147]">Escape Velocity Test (EVT)</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Seamless selection test bridging regular school curricula with specialized competitive mechanics.
              </p>
              <div className="text-[11px] font-bold text-slate-700">
                Dates: <span className="text-slate-900">29th March & 5th April 2026</span>
              </div>
            </div>
            <button
              onClick={onOpenFtreModal}
              className="mt-5 w-full py-2 bg-slate-100 hover:bg-slate-200 text-[#002147] font-bold text-xs uppercase tracking-wide rounded-lg transition-colors cursor-pointer"
            >
              Register for EVT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
