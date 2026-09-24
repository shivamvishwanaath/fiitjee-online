import React from 'react';
import { Award, Sparkles, ExternalLink, Calendar, MapPin, PhoneCall } from 'lucide-react';

interface AnnouncementCardsProps {
  onOpenBigBangModal: () => void;
}

export const AnnouncementCards: React.FC<AnnouncementCardsProps> = ({
  onOpenBigBangModal
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Card 1: Results Declared */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#002147]">
            <Award className="w-6 h-6 text-[#ED1C24]" />
            <h3 className="text-lg font-black uppercase tracking-tight">Results Declared for FIITJEE Admission Tests</h3>
          </div>
          <ul className="text-slate-600 text-xs font-semibold space-y-2 list-disc pl-5">
            <li>Big Bang Edge Test (9th & 16th November 2025) for Students of Class V, VI, VII, VIII, IX, X & XI</li>
            <li>Arindam Test (4th & 5th October 2025) for Students of Class V, VI, VII, VIII, IX, X & XI</li>
            <li>Arindam Test (11th & 12th October 2025) for Students of Class V, VI, VII, VIII, IX, X & XI</li>
          </ul>
        </div>
        <div className="pt-4">
          <a
            href="https://testresults.fiitjee.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#ED1C24] hover:bg-[#d6171e] rounded-lg transition-all"
          >
            <span>Click here to check your Result</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Card 2: Big Bang Edge Test Spotlight Card (NAVY BLUE POSTER THEME) */}
      <div className="bg-[#002147] text-white border-2 border-[#ED1C24] rounded-2xl p-6 shadow-md flex flex-col justify-between hover:shadow-lg transition-all relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-[#ED1C24] text-white text-[8px] font-black px-2.5 py-0.5 uppercase tracking-widest rounded-bl-lg animate-pulse">
          SPOTLIGHT EXAM
        </div>
        
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-white tracking-tight uppercase">
              Big Bang Edge Test
            </h3>
            <p className="text-[10px] font-black text-amber-300 italic">
              "Some choices are obvious."
            </p>
          </div>

          <p className="text-[11px] text-slate-300 font-semibold leading-relaxed">
            A 360° analysis of aptitude, potential & academic standing for students presently in Class V, VI, VII, VIII, IX, X & XI.
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="inline-flex items-center gap-1 text-[9px] font-black bg-red-600 text-white px-2 py-0.5 rounded-sm">
              <Calendar className="w-3 h-3" /> 11th & 18th Oct 2026
            </span>
            <span className="text-[9px] font-black bg-white/10 text-amber-300 px-2 py-0.5 rounded-sm">
              Offline & Proctored Online
            </span>
          </div>

          {/* 4 Center Contacts Grid */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 grid grid-cols-2 gap-x-2 gap-y-1.5 text-[9px] font-bold text-slate-300">
            <div>
              <span className="block text-white uppercase text-[8px]">Bhubaneswar</span>
              <a href="tel:7682041257" className="hover:text-amber-300 transition-colors">76820 41257</a>
            </div>
            <div>
              <span className="block text-white uppercase text-[8px]">Ranchi</span>
              <a href="tel:9835155509" className="hover:text-amber-300 transition-colors">98351 55509</a>
            </div>
            <div>
              <span className="block text-white uppercase text-[8px]">Dwarka</span>
              <a href="tel:8527208022" className="hover:text-amber-300 transition-colors">85272 08022</a>
            </div>
            <div>
              <span className="block text-white uppercase text-[8px]">Hyderabad</span>
              <a href="tel:9247551761" className="hover:text-amber-300 transition-colors">92475 51761</a>
            </div>
          </div>
        </div>

        <div className="pt-4 flex gap-2">
          <button
            onClick={onOpenBigBangModal}
            className="flex-1 py-2 bg-[#ED1C24] hover:bg-[#d6171e] text-white font-black text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <span>Register Now</span>
            <Sparkles className="w-3 h-3 text-amber-300" />
          </button>
        </div>
      </div>

      {/* Card 3: Olympiad Test Series */}
      <div className="bg-white border-2 border-red-500 rounded-[28px] p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="space-y-4">
          <div className="text-base sm:text-lg leading-relaxed">
            <span className="text-[#059669] font-extrabold">FIITJEE's All India Test Series for Olympiads</span>{' '}
            <span className="text-[#ED1C24] font-extrabold">- yet another recent innovation by FIITJEE</span>{' '}
            <span className="text-[#1d70b8] font-extrabold">- Nurturing Your Olympiad Dreams – Simulating Real Olympiad Experience</span>
            
            <span className="block text-slate-900 font-extrabold text-xs mt-3">
              (for Students presently in Class V, VI, VII, VIII, IX, X, XI & XII)
            </span>
            
            <span className="block text-[#ED1C24] font-extrabold text-xs mt-4">
              For full schedule of All India Test Series for Olympiads, to register for one or more tests, and to get more information about the test series & various stages of Olympiads applicable, visit
            </span>
          </div>
        </div>
        <div className="pt-6">
          <a
            href="https://www.fiitjee.com/OlympiadScholarshipTests"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-black text-white bg-[#ED1C24] hover:bg-[#d6171e] rounded-full transition-all cursor-pointer shadow-md uppercase tracking-wider"
          >
            <span className="text-[10px] self-center">▶</span>
            <span>Register Now</span>
          </a>
        </div>
      </div>
    </div>
  );
};
