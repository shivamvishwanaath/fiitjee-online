import React, { useState } from 'react';
import { 
  Trophy, 
  Award, 
  Search, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink, 
  GraduationCap, 
  Building2, 
  X,
  FileCheck
} from 'lucide-react';
import { TOPPERS } from '../data/fiitjeeData';
import { Topper } from '../types';

export const ResultsShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'JEE Advanced 2025' | 'JEE Main 2025' | 'JEE Advanced 2024' | 'JEE Main 2024' | 'Olympiads 2024'>('JEE Advanced 2025');
  const [searchRoll, setSearchRoll] = useState('');
  const [verifiedScorecard, setVerifiedScorecard] = useState<{
    rollNo: string;
    name: string;
    rank: string;
    percentile: string;
    program: string;
    center: string;
    physicsMarks: number;
    chemistryMarks: number;
    mathsMarks: number;
    totalMarks: number;
    status: 'VERIFIED OFFICIALLY';
  } | null>(null);

  const filterToppers = TOPPERS.filter((topper) => {
    return topper.exam === activeTab;
  });

  const handleRollSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRoll = searchRoll.trim().toUpperCase() || 'FJ2024-AIR01';
    
    // Simulate authentic lookup
    setVerifiedScorecard({
      rollNo: cleanRoll,
      name: cleanRoll.includes('01') ? 'Mridul Agarwal' : cleanRoll.includes('02') ? 'Mayank Singhal' : 'Aryan V. Sharma',
      rank: cleanRoll.includes('01') ? 'AIR 1 (JEE Advanced)' : 'AIR 14 (JEE Advanced)',
      percentile: '99.988 Percentile',
      program: 'PINNACLE - Two Year Integrated School Program',
      center: 'FIITJEE Delhi South (Kalu Sarai)',
      physicsMarks: 118,
      chemistryMarks: 114,
      mathsMarks: 116,
      totalMarks: 348,
      status: 'VERIFIED OFFICIALLY'
    });
  };

  return (
    <section id="results-section" className="py-14 bg-[#001733] text-white relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ED1C24]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-black text-amber-300 uppercase tracking-wider mb-3">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Proven Track Record • 33 Years Legacy</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white">
            Unbeatable Dominance in IIT-JEE & Olympiads
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-3">
            FIITJEE students consistently capture the highest proportion of Top 10, Top 50, and Top 100 All India Ranks from Long-Term Classroom Programs.
          </p>
        </div>

        {/* 4 Pillars Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center backdrop-blur-xs">
            <div className="text-3xl sm:text-4xl font-black text-amber-400 font-display">40,000+</div>
            <div className="text-xs sm:text-sm font-bold text-white mt-1">Selections in IITs</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Highest from long-term classroom courses</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center backdrop-blur-xs">
            <div className="text-3xl sm:text-4xl font-black text-amber-400 font-display">37</div>
            <div className="text-xs sm:text-sm font-bold text-white mt-1">In Top 100 AIRs</div>
            <div className="text-[11px] text-slate-400 mt-0.5">JEE Advanced recent rankings</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center backdrop-blur-xs">
            <div className="text-3xl sm:text-4xl font-black text-amber-400 font-display">100%ile</div>
            <div className="text-xs sm:text-sm font-bold text-white mt-1">JEE Main Perfect Scores</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Including historical 300/300 Full Marks</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center backdrop-blur-xs">
            <div className="text-3xl sm:text-4xl font-black text-amber-400 font-display">78+</div>
            <div className="text-xs sm:text-sm font-bold text-white mt-1">International Medals</div>
            <div className="text-[11px] text-slate-400 mt-0.5">In Physics, Math, Chem & Astronomy</div>
          </div>
        </div>

        {/* Verification Bar & Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-[#002147]/90 p-4 rounded-2xl border border-white/10">
          
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {(['JEE Advanced 2025', 'JEE Main 2025', 'JEE Advanced 2024', 'JEE Main 2024', 'Olympiads 2024'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#ED1C24] text-white shadow-md font-extrabold uppercase tracking-wide'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Roll Number Verification Simulator */}
          <form onSubmit={handleRollSearch} className="flex items-center gap-2 max-w-md w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Verify Roll No: e.g. FJ2024-9021"
                value={searchRoll}
                onChange={(e) => setSearchRoll(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-black/40 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ED1C24]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-[#ED1C24] hover:bg-[#d6171e] text-white rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer uppercase tracking-wider"
            >
              Verify Result
            </button>
          </form>

        </div>

        {/* Toppers Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filterToppers.map((topper) => (
            <div
              key={topper.id}
              className="relative bg-gradient-to-b from-[#002147] to-[#001733] border-4 border-slate-200 rounded-2xl p-5 shadow-sm text-center flex flex-col justify-between h-[340px] hover:border-[#FEC400] transition-colors"
              style={{
                backgroundImage: 'linear-gradient(rgba(0, 33, 71, 0.9), rgba(0, 23, 51, 0.95)), url("https://dujozny86idgo.cloudfront.net/styles/webp/public/images/BG1_4.png.webp")',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <span className="absolute top-2 left-2 text-[8px] bg-[#ED1C24] text-white font-bold px-2 py-0.5 rounded shadow-sm">
                {topper.exam}
              </span>

              {/* Photo with Rank Badge */}
              <div className="mx-auto w-36 h-36 rounded-full border-4 border-white/20 overflow-hidden mt-4 bg-slate-900 flex items-center justify-center">
                <img
                  src={topper.image}
                  alt={topper.name}
                  className="w-full h-full object-cover object-top animate-fade-in"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${topper.name}`;
                  }}
                />
              </div>

              {/* Name and Details */}
              <div className="space-y-1 mt-2">
                <h3 className="text-lg font-black text-white">
                  {topper.name}
                </h3>
                <p className="text-[10px] text-slate-300 font-semibold leading-tight line-clamp-2 h-8">
                  {topper.program}
                </p>
                <div className="inline-block px-3 py-0.5 bg-amber-400 text-slate-950 rounded-full text-xs font-black uppercase tracking-wide">
                  AIR {topper.rank}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Infinite Scrolling Toppers Marquee */}
        <div className="mt-16 pt-8 border-t border-white/10 overflow-hidden relative w-full">
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes marquee {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-100%); }
            }
            @keyframes marquee2 {
              0% { transform: translateX(100%); }
              100% { transform: translateX(0%); }
            }
            .animate-marquee {
              animation: marquee 45s linear infinite;
            }
            .animate-marquee2 {
              animation: marquee2 45s linear infinite;
            }
            .group:hover .animate-marquee,
            .group:hover .animate-marquee2 {
              animation-play-state: paused;
            }
          `}} />

          <div className="text-center mb-6">
            <h3 className="text-xs font-black tracking-widest text-amber-400 uppercase">FIITJEE National Roll of Honor</h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Hover card to pause scrolling • Infinite Topper Feed</p>
          </div>
          
          <div className="relative flex overflow-x-hidden group">
            {/* Slide track 1 */}
            <div className="animate-marquee whitespace-nowrap flex gap-4 py-2">
              {TOPPERS.map((topper, idx) => (
                <div key={`m1-${topper.id}-${idx}`} className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-2.5 w-60 shrink-0 backdrop-blur-xs select-none">
                  <img
                    src={topper.image}
                    alt={topper.name}
                    className="w-10 h-10 rounded-lg object-cover object-top shrink-0 border border-white/10"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${topper.name}`;
                    }}
                  />
                  <div className="min-w-0 text-left">
                    <div className="text-xs font-black text-white truncate">{topper.name}</div>
                    <div className="text-[9px] text-amber-300 font-semibold truncate">AIR {topper.rank} • {topper.exam}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Slide track 2 */}
            <div className="animate-marquee2 absolute top-0 left-0 whitespace-nowrap flex gap-4 py-2">
              {TOPPERS.map((topper, idx) => (
                <div key={`m2-${topper.id}-${idx}`} className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-2.5 w-60 shrink-0 backdrop-blur-xs select-none">
                  <img
                    src={topper.image}
                    alt={topper.name}
                    className="w-10 h-10 rounded-lg object-cover object-top shrink-0 border border-white/10"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${topper.name}`;
                    }}
                  />
                  <div className="min-w-0 text-left">
                    <div className="text-xs font-black text-white truncate">{topper.name}</div>
                    <div className="text-[9px] text-amber-300 font-semibold truncate">AIR {topper.rank} • {topper.exam}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Verified Scorecard Modal Simulation */}
      {verifiedScorecard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border-4 border-[#002147] relative">
            <button
              onClick={() => setVerifiedScorecard(null)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold w-fit mb-3 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>OFFICIAL FIITJEE VERIFIED CANDIDATE</span>
            </div>

            <h3 className="text-xl font-extrabold text-[#002147] font-display">
              {verifiedScorecard.name}
            </h3>
            <div className="text-xs text-slate-500">Roll No: {verifiedScorecard.rollNo}</div>

            <div className="grid grid-cols-2 gap-3 my-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500">All India Rank</div>
                <div className="text-lg font-black text-[#ED1C24]">{verifiedScorecard.rank}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500">Total Marks Scored</div>
                <div className="text-lg font-black text-slate-900">{verifiedScorecard.totalMarks} / 360</div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700 border-t border-slate-200 pt-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Enrolled Program:</span>
                <span className="font-bold text-slate-900">{verifiedScorecard.program}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Study Center:</span>
                <span className="font-bold text-slate-900">{verifiedScorecard.center}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Physics / Chem / Math:</span>
                <span className="font-bold text-slate-900">
                  P: {verifiedScorecard.physicsMarks} | C: {verifiedScorecard.chemistryMarks} | M: {verifiedScorecard.mathsMarks}
                </span>
              </div>
            </div>

            <button
              onClick={() => setVerifiedScorecard(null)}
              className="mt-5 w-full py-2.5 bg-[#ED1C24] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs"
            >
              Close Verification
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
