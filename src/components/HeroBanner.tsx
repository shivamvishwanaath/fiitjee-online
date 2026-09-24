import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Award, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

interface HeroBannerProps {
  onOpenFtreModal: () => void;
  onOpenEnquiryModal: () => void;
  onOpenMatcher: () => void;
  onOpenBigBangModal: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onOpenFtreModal,
  onOpenMatcher,
  onOpenBigBangModal
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Tagline rotating words
  const words = ["INNOVATION", "DEDICATION", "SINCERITY", "ETHICS", "HARDWORK", "HONESTY"];
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const wordTimer = setInterval(() => {
      setWordIdx(prev => (prev + 1) % words.length);
    }, 1500);
    return () => clearInterval(wordTimer);
  }, []);

  const studentSlides = [
    {
      name: 'Ujjwal Kesari',
      rank: '5',
      program: 'Rankers Study Material (RSM) (XI-XII)',
      image: 'student_photos/jee-advanced-2025_Ujjwal_Kesari_rank_5.webp',
    },
    {
      name: 'Arnav Singh',
      rank: '9',
      program: 'FIITJEE World School (VIII-X) + PINNACLE (XI-XII)',
      image: 'student_photos/jee-advanced-2025_Arnav_Singh_rank_9.webp',
    },
    {
      name: 'Devdutta Majhi',
      rank: '16',
      program: 'Two Year Live Interactive Online under eSchool (XI-XII)',
      image: 'student_photos/jee-advanced-2025_Devdutta_Majhi_rank_16.webp',
    },
    {
      name: 'Sanidhya Saraf',
      rank: '31',
      program: 'PINNACLE: Two Year Integrated School Program (XI-XII)',
      image: 'student_photos/jee-advanced-2025_Sanidhya_Saraf_rank_31.webp',
    },
    {
      name: 'Advay Mayank',
      rank: '36',
      program: 'Three Year Classroom Program (X-XII)',
      image: 'student_photos/jee-advanced-2025_Advay_Mayank_rank_36.webp',
    },
    {
      name: 'Karmanya Gupta',
      rank: '37',
      program: 'Rankers Study Material (RSM) (XI-XII)',
      image: 'student_photos/jee-advanced-2025_Karmanya_Gupta_rank_37.webp',
    },
    {
      name: 'Ramit Goyal',
      rank: '45',
      program: 'Two Year Live Interactive Online Classroom Program (XI-XII)',
      image: 'student_photos/jee-advanced-2025_Ramit_Goyal_rank_45.webp',
    },
    {
      name: 'Aritro Ray',
      rank: '50',
      program: 'Four Year Classroom Program (IX-XII)',
      image: 'student_photos/jee-advanced-2025_Aritro_Ray_rank_50.webp',
    }
  ];

  // Auto carousel effect
  useEffect(() => {
    if (isPaused) return;
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % studentSlides.length);
    }, 3000); // Rotate every 3 seconds
    return () => clearInterval(slideTimer);
  }, [isPaused]);

  const handleNext = () => setCurrentSlide((prev) => (prev + 1) % studentSlides.length);
  const handlePrev = () => setCurrentSlide((prev) => (prev - 1 + studentSlides.length) % studentSlides.length);

  const activeStudent = studentSlides[currentSlide];

  return (
    <section 
      id="hero-section" 
      className="relative overflow-hidden bg-cover bg-center text-white py-16 sm:py-20 lg:py-24"
      style={{ backgroundImage: 'linear-gradient(rgba(0, 23, 51, 0.92), rgba(0, 17, 36, 0.97)), url("https://dujozny86idgo.cloudfront.net/styles/webp/public/images/Hero%20Banner%201920x1080.png.webp")' }}
    >
      {/* Background radial glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#ED1C24]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left side: Tagline & Rotating words (6 Columns) */}
          <div className="lg:col-span-6 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>33 Years of Unrivaled Academic Legacy</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white uppercase font-display">
                BUILT UPON <br/>
                <span className="text-2xl sm:text-3xl text-slate-300 block mt-2">3 DECADES OF</span>
                <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#ED1C24] font-serif block h-16 mt-2 transition-all duration-300">
                  {words[wordIdx]}
                </span>
              </h1>
            </div>

            <ul className="space-y-3.5 text-sm font-semibold text-slate-200">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#ED1C24] shrink-0" />
                <span>Our virtues and character stand tall.</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#ED1C24] shrink-0" />
                <span>No compromises.</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#ED1C24] shrink-0" />
                <span>We do what we say.</span>
              </li>
            </ul>

            <div className="space-y-3">
              {/* Pulsing Big Bang alert chip */}
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-amber-300 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-[#ED1C24] rounded-full animate-ping" />
                <span>Big Bang Edge Test 2026 — Registration Slots Live!</span>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                {/* Primary: Big Bang registration */}
                <button 
                  onClick={onOpenBigBangModal}
                  className="px-7 py-3.5 bg-[#ED1C24] hover:bg-[#d6171e] text-white font-extrabold text-xs rounded-full transition-all shadow-md flex items-center gap-2 uppercase tracking-widest cursor-pointer"
                >
                  <span>Register for Big Bang Test</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Secondary: course catalog */}
                <button 
                  onClick={onOpenMatcher}
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs rounded-full transition-all shadow-md flex items-center gap-1.5 uppercase tracking-widest cursor-pointer"
                >
                  <span>Explore Courses</span>
                </button>
              </div>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-center sm:text-left">
              <div>
                <div className="text-2xl font-black text-[#ED1C24]">40,000+</div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">IIT selections</div>
              </div>
              <div>
                <div className="text-2xl font-black text-amber-400">AIR 1 x 2</div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Twice in History</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#ED1C24]">78+</div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Olympiad Medals</div>
              </div>
            </div>
          </div>

          {/* Right side: Large Topper Auto-Carousel (6 Columns) */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div 
              className="relative w-full max-w-md bg-gradient-to-b from-[#002147] to-[#001733] border-4 border-[#FEC400] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between h-[520px] group transition-all"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Header Label */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-[#ED1C24] text-white text-[9px] font-black px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                <Award className="w-3 h-3 text-amber-300" />
                <span>JEE Advanced Toppers 2025</span>
              </div>

              {/* Rectangular Non-Clipped Photo Area */}
              <div className="w-full h-80 bg-slate-950 overflow-hidden relative border-b-2 border-white/10">
                <img 
                  key={`img-${currentSlide}`}
                  src={activeStudent.image} 
                  alt={activeStudent.name}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 animate-in fade-in duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${activeStudent.name}`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                
                {/* Visual indicator overlay */}
                <div className="absolute bottom-3 right-3 bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wide">
                  AIR {activeStudent.rank}
                </div>
              </div>

              {/* Details & Info */}
              <div 
                key={`info-${currentSlide}`}
                className="p-6 flex-1 flex flex-col justify-center space-y-2 animate-in fade-in duration-300"
              >
                <div className="text-3xl font-black text-white leading-tight">{activeStudent.name}</div>
                <div className="text-sm text-slate-300 font-semibold leading-relaxed">
                  {activeStudent.program}
                </div>
              </div>

              {/* Navigation Indicators & Manual Controls */}
              <div className="px-5 py-4 bg-slate-950/40 border-t border-white/5 flex items-center justify-between">
                {/* Dots indicator */}
                <div className="flex gap-1.5">
                  {studentSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                        currentSlide === idx ? 'bg-[#ED1C24] w-4' : 'bg-white/30 hover:bg-white/50'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Arrow buttons */}
                <div className="flex gap-2">
                  <button 
                    onClick={handlePrev} 
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                    aria-label="Previous Topper"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleNext} 
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                    aria-label="Next Topper"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
