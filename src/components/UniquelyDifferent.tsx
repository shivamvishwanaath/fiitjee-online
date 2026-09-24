import React from 'react';
import { Sparkles, Trophy, Star, CheckCircle } from 'lucide-react';

export const UniquelyDifferent: React.FC = () => {
  const points = [
    "Highest selections from Classroom Programs in IIT-JEE / JEE Advanced consistently since 1997 from the general category / open merit list.",
    "Highest selections from Classroom Programs in Top 10, Top 20, Top 50, Top 100, Top 200, and Top 500, in every bracket consistently since 1997.",
    "Highest selections from all programs in IIT-JEE / JEE Advanced since 1998 consistently from the general category / open merit list.",
    "Highest selections from Classroom Programs in JEE Main (earlier AIEEE) consistently since inception.",
    "Highest number of 100 NTA Scorers in JEE Main from Long Term Classroom Programs consistently since inception.",
    "Total dominance of NTSE, Jr. Science Olympiad (NSEJS, INJSO & IJSO), Mathematical Olympiad (IOQM & INMO), JEE Main, JEE Advanced & Sr. Science Olympiad - Physics (NSEP, INPHO & IPHO), Chemistry (NSEC, INCHO & ICHO) & Astronomy (NSEA, INAO & IAO) for the last 15 years."
  ];

  return (
    <section className="bg-slate-50 py-12 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <h2 className="text-3xl font-black text-[#002147] tracking-tight uppercase">
            FIITJEE Coaching is Uniquely Different
          </h2>
          <p className="text-sm font-bold text-[#ED1C24] uppercase">
            FIITJEE is transformational for every Student. And this is reflected in our results.
          </p>
          <p className="text-xs text-slate-500 font-semibold">
            FIITJEE transforms not only brilliant Students into toppers but also catapults average and below-average Students (by JEE Advanced standards) to good ranks in JEE Advanced.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {points.map((point, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex gap-3.5 hover:shadow-md transition-shadow">
              <div className="w-8 h-8 rounded-xl bg-red-50 text-[#ED1C24] flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                {point}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <a
            href="/transformative-results"
            className="inline-flex items-center gap-1.5 px-6 py-3 text-xs font-extrabold text-white bg-[#ED1C24] hover:bg-[#d6171e] rounded-xl shadow-md transition-all transform hover:-translate-y-0.5"
          >
            <span>See our transformational results</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

import { ArrowRight } from 'lucide-react';
