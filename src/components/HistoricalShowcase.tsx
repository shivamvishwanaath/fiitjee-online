import React from 'react';

export const HistoricalShowcase: React.FC = () => {
  const toppers = [
    {
      name: 'Mridul Agarwal',
      rank: '1',
      year: 'JEE Advanced 2021',
      program: 'Intensive Contact Program (XII)',
      image: 'student_photos/JEE_Advanced_2021_Mridul_Agarwal_rank_1.webp'
    },
    {
      name: 'Dhananjay Raman',
      rank: '2',
      year: 'JEE Advanced 2021',
      program: 'Four Year Classroom Program (IX – XII) + UDAYA - One Year Classroom Program (VIII)',
      image: 'student_photos/JEE_Advanced_2021_Dhananjay_Raman_rank_2.webp'
    },
    {
      name: 'Anant Lunia',
      rank: '3',
      year: 'JEE Advanced 2021',
      program: 'Three Year Classroom Program (X - XII)',
      image: 'student_photos/JEE_Advanced_2021_Anant_Lunia_rank_3.webp'
    },
    {
      name: 'Arpit Agarwal',
      rank: '1',
      year: 'IIT-JEE 2012',
      program: 'Two Year Classroom Program (XI - XII) + ASCENT - One Year Classroom Program (X)',
      image: 'student_photos/IIT-JEE_2012_Arpit_Agarwal_rank_1.webp'
    },
    {
      name: 'Bijoy Singh Kochar',
      rank: '2',
      year: 'IIT-JEE 2012',
      program: 'PINNACLE - Two Year Integrated School Program (XI-XII) + ASCENT - Two Year Classroom Program (IX - X)',
      image: 'student_photos/IIT-JEE_2012_Bijoy_Singh_Kochar_rank_2.webp'
    },
    {
      name: 'Nishanth N Koushik',
      rank: '3',
      year: 'IIT-JEE 2012',
      program: 'PINNACLE - Two Year Integrated School Program (XI - XII)',
      image: 'student_photos/IIT-JEE_2012_Nishanth_N_Koushik_rank_3.webp'
    }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <h3 className="text-lg font-bold text-slate-500 uppercase tracking-wider">Historical Selections Milestone</h3>
          <h2 className="text-2xl sm:text-3xl font-black text-[#002147] tracking-tight leading-tight uppercase">
            Did you know that FIITJEE is the only institute that has captured <br/>
            <span className="text-[#ED1C24]">All India Ranks 1, 2 & 3</span> <br/>
            in JEE Advanced from Classroom Programs twice in history?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {toppers.map((topper, idx) => (
            <div 
              key={idx} 
              className="relative bg-gradient-to-b from-[#002147] to-[#001733] border-4 border-slate-200 rounded-2xl p-5 shadow-sm text-center flex flex-col justify-between h-[340px] hover:border-[#FEC400] transition-colors"
            >
              <span className="absolute top-2 left-2 text-[8px] bg-[#ED1C24] text-white font-bold px-2 py-0.5 rounded shadow-sm">
                {topper.year}
              </span>

              {/* Topper Image */}
              <div className="mx-auto w-36 h-36 rounded-full border-4 border-white/20 overflow-hidden mt-4 bg-slate-900 flex items-center justify-center">
                <img 
                  src={topper.image} 
                  alt={topper.name}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${topper.name}`;
                  }}
                />
              </div>

              {/* Topper Details */}
              <div className="space-y-1">
                <div className="text-lg font-black text-white">{topper.name}</div>
                <div className="text-[10px] text-slate-300 font-semibold leading-tight line-clamp-2 h-8">
                  {topper.program}
                </div>
                <div className="inline-block px-3 py-0.5 bg-amber-400 text-slate-950 rounded-full text-xs font-black uppercase tracking-wide">
                  AIR {topper.rank}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
