import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Calendar, 
  MapPin, 
  PhoneCall, 
  ShieldCheck, 
  ArrowRight, 
  Info, 
  Building2, 
  CreditCard, 
  CheckCircle2,
  Clock,
  Award,
  AlertTriangle
} from 'lucide-react';
import { BIG_BANG_EXAM } from '../data/examsData';
import { CENTRES_CONFIG } from '../admin/utils/centreUtils';
import { getCentreExamById, CentreExamConfig, DEFAULT_CENTRE_EXAMS } from '../admin/utils/examUtils';

interface AdmissionTestDetailsProps {
  onOpenBigBangModal: (centerName?: string) => void;
  onOpenFtreModal: () => void;
}

export const AdmissionTestDetails: React.FC<AdmissionTestDetailsProps> = ({
  onOpenBigBangModal,
  onOpenFtreModal
}) => {
  const [selectedCentreId, setSelectedCentreId] = useState<string>('bhubaneswar');
  const [examConfig, setExamConfig] = useState<CentreExamConfig>(
    DEFAULT_CENTRE_EXAMS.bhubaneswar
  );
  const [loading, setLoading] = useState<boolean>(false);

  const selectedCentre = CENTRES_CONFIG[selectedCentreId] || CENTRES_CONFIG['bhubaneswar'];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getCentreExamById(selectedCentreId, 'big-bang-edge-test')
      .then((cfg) => {
        if (isMounted && cfg) {
          setExamConfig(cfg);
        }
      })
      .catch((err) => {
        console.error('Error loading centre exam in AdmissionTestDetails:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [selectedCentreId]);

  return (
    <div className="space-y-12">
      {/* 1. Flagship Hero Banner - Big Bang Edge Test with Centre-Specific Blueprints */}
      <div className="bg-[#002147] text-white rounded-3xl border-2 border-[#ED1C24] p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Background Watermark decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-2xl -z-10 pointer-events-none" />

        {/* Centre Switcher Tabs */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Select Examination Centre for Specific Rates & Venues:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-white/10 p-1 rounded-xl border border-white/10">
            {Object.entries(CENTRES_CONFIG).map(([cid, cProfile]) => (
              <button
                key={cid}
                type="button"
                onClick={() => setSelectedCentreId(cid)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCentreId === cid
                    ? 'bg-[#ED1C24] text-white shadow-sm'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                {cProfile.name}
              </button>
            ))}
          </div>
        </div>

        {/* Banner Top Strip */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/10 pb-6 mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Flagship Scholarship Opportunity</span>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                examConfig.registrationOpen
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  : 'bg-red-500/20 text-red-300 border border-red-400/30'
              }`}>
                {examConfig.registrationOpen ? '● Registrations Open' : '● Registrations Paused by Centre'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase font-display leading-tight">
              {examConfig.fullBrandedName || `FIITJEE Big Bang Edge Test ${examConfig.year || '2026'}`}
            </h1>
            <p className="text-xs sm:text-sm font-black text-amber-300 italic tracking-wide">
              "{examConfig.tagline || 'Some choices are obvious.'}" — FIITJEE {selectedCentre.name} Centre
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={() => onOpenBigBangModal(selectedCentre.name)}
              disabled={examConfig.registrationOpen === false}
              className="px-8 py-3.5 bg-[#ED1C24] hover:bg-[#d6171e] text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{examConfig.registrationOpen ? `Register for ${selectedCentre.name}` : 'Registrations Paused'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Detailed Specs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 text-xs">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
            <h3 className="font-black uppercase tracking-wider text-amber-300 text-[10px]">Test Objective & Overview</h3>
            <p className="text-slate-300 leading-relaxed font-semibold">
              {examConfig.description || 'A comprehensive 360° analysis of candidate aptitude, analytical potential, IQ levels, and national competitive standing. Ideal preparation benchmark.'}
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
            <h3 className="font-black uppercase tracking-wider text-amber-300 text-[10px]">Test Dates & Examination Modes</h3>
            <div className="space-y-1.5 font-bold text-slate-200">
              <div className="flex items-start gap-1.5">
                <Calendar className="w-4 h-4 text-[#ED1C24] shrink-0 mt-0.5" />
                <span>{examConfig.testDates?.join(' · ') || '11th & 18th October 2026 (Sunday)'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{examConfig.modes?.join(' & ') || 'Offline Center & Proctored Online'}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-normal pt-1">
                Timings: 10:00 AM – 01:00 PM (Offline computer labs / Online proctored)
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
            <h3 className="font-black uppercase tracking-wider text-amber-300 text-[10px]">
              Designated Test Venue ({selectedCentre.name})
            </h3>
            {examConfig.venues && examConfig.venues.length > 0 ? (
              <div className="space-y-1.5">
                {examConfig.venues.map((v, i) => (
                  <div key={i} className="text-slate-200 font-semibold">
                    <div className="font-bold text-white">{v.name}</div>
                    {v.address && <div className="text-[11px] text-slate-400">{v.address}</div>}
                    {v.phone && <div className="text-[11px] text-amber-300 font-mono">Ph: {v.phone}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-300 text-xs font-semibold">
                <div>FIITJEE {selectedCentre.name} Centre</div>
                <div className="text-slate-400 text-[10px]">{selectedCentre.address}</div>
                <div className="text-amber-300 text-[10px] font-mono mt-1">Ph: {selectedCentre.phoneNumbers[0]}</div>
              </div>
            )}
          </div>
        </div>

        {/* Class-wise Fee Schedule as configured for this centre */}
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl mb-8 space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-300" />
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-300">
                Official Class-Wise Examination Fee Schedule ({selectedCentre.name} Branch Rate)
              </h3>
            </div>
            <span className="text-[10px] text-slate-300">Inclusive of GST & diagnostic assessment</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {Object.entries(examConfig.classFees || {
              'Class V': 200,
              'Class VI': 200,
              'Class VII': 200,
              'Class VIII': 200,
              'Class IX': 250,
              'Class X': 250,
              'Class XI': 250,
              'Class XII Passout': 250
            }).map(([cls, fee]) => (
              <div key={cls} className="bg-white/10 border border-white/10 rounded-xl p-2.5 text-center">
                <div className="text-[10px] text-slate-300 font-bold uppercase">{cls}</div>
                <div className="text-base font-black text-white font-mono mt-0.5">₹{fee}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bhubaneswar / Ranchi / Dwarka / Hyderabad Contact Grid */}
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3.5">
            Participating Centres & Direct Helplines (Click to Switch Particulars)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(CENTRES_CONFIG).map(([cid, center]) => (
              <button
                key={cid}
                type="button"
                onClick={() => setSelectedCentreId(cid)}
                className={`border rounded-xl p-4 flex flex-col justify-between text-left transition-all cursor-pointer group ${
                  selectedCentreId === cid
                    ? 'bg-white/15 border-amber-400 ring-1 ring-amber-400 shadow-md'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="block text-[11px] font-black uppercase text-white group-hover:text-amber-300 transition-colors">
                      {center.name} Centre
                    </span>
                    {selectedCentreId === cid && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </div>
                  <span className="block text-[10px] text-slate-400 line-clamp-1">{center.address}</span>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs font-mono font-black text-[#ED1C24] group-hover:text-red-400">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{center.phoneNumbers[0]}</span>
                </div>
              </button>
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
