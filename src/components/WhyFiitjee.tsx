import React from 'react';
import { 
  ShieldCheck, 
  BookOpen, 
  BarChart3, 
  GraduationCap, 
  Sparkles, 
  Clock, 
  CheckCircle2,
  Award
} from 'lucide-react';
import { WHY_FIITJEE_POINTS } from '../data/fiitjeeData';

export const WhyFiitjee: React.FC = () => {
  const iconMap: Record<string, React.ElementType> = {
    ShieldCheck,
    BookOpen,
    BarChart3,
    GraduationCap,
    Sparkles,
    Clock
  };

  return (
    <section id="why-fiitjee" className="py-14 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-100 border border-red-200 text-xs font-black text-[#ED1C24] uppercase tracking-wider mb-2">
            <Award className="w-4 h-4 text-[#ED1C24]" />
            <span>The FIITJEE Edge</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#002147] font-display">
            Why FIITJEE is India’s Most Trusted Test Prep
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Our scientific pedagogy transforms raw potential into extraordinary All India Ranks. We do not just teach syllabus; we build analytical thinkers.
          </p>
        </div>

        {/* 6 Key Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_FIITJEE_POINTS.map((point, idx) => {
            const Icon = iconMap[point.icon] || ShieldCheck;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all hover:border-[#ED1C24]/50 group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-[#ED1C24] flex items-center justify-center mb-4 group-hover:bg-[#ED1C24] group-hover:text-white transition-colors shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-[#002147] group-hover:text-[#ED1C24] transition-colors font-display mb-2">
                    {point.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {point.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Vision Quote Banner */}
        <div className="mt-12 bg-gradient-to-r from-[#002147] to-[#001733] text-white p-6 sm:p-8 rounded-2xl shadow-xl text-center max-w-4xl mx-auto space-y-3 border-2 border-[#ED1C24]/30">
          <p className="text-sm sm:text-base italic font-serif leading-relaxed text-slate-200">
            "This Journey from just an IIT-JEE Coaching Institute to the most powerful brand in serious education has been exhilarating. For us at FIITJEE, The Journey will never be over… For us, this Journey itself is the destination."
          </p>
          <div className="text-xs font-black text-amber-300 tracking-wider uppercase">
            — FIITJEE Academic Philosophy
          </div>
        </div>

      </div>
    </section>
  );
};
