import React, { useState } from 'react';
import { 
  GraduationCap, 
  Target, 
  Laptop, 
  Sparkles, 
  Check, 
  ArrowRight, 
  Calendar, 
  Clock, 
  BookOpen, 
  Award,
  Filter
} from 'lucide-react';
import { PROGRAMS } from '../data/fiitjeeData';
import { Program } from '../types';

interface CourseFinderWizardProps {
  onOpenFtreModal: (programId?: string) => void;
  onOpenEnquiryModal: (programName?: string) => void;
}

export const CourseFinderWizard: React.FC<CourseFinderWizardProps> = ({
  onOpenFtreModal,
  onOpenEnquiryModal
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('Class XI');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const classOptions = [
    { label: 'All Classes', val: 'all' },
    { label: 'Class VI', val: 'Class VI' },
    { label: 'Class VII & VIII', val: 'Class VII & VIII' },
    { label: 'Class IX & X', val: 'Class IX' },
    { label: 'Class XI', val: 'Class XI' },
    { label: 'Class XII & Passout', val: 'Class XII' }
  ];

  const categoryOptions = [
    { label: 'All Programs', val: 'all' },
    { label: 'Integrated School (PINNACLE/SUPREME)', val: 'integrated' },
    { label: 'Classroom Programs', val: 'classroom' },
    { label: 'Live Online (eSchool)', val: 'eschool' },
    { label: 'Test Series (AITS / GMP)', val: 'non-classroom' },
    { label: 'Droppers / 12th Pass', val: 'crash' }
  ];

  // Filter logic
  const filteredPrograms = PROGRAMS.filter((prog) => {
    // Class filter
    const matchesClass = 
      selectedClass === 'all' ||
      prog.targetClasses.toLowerCase().includes(selectedClass.toLowerCase()) ||
      (selectedClass === 'Class VII & VIII' && (prog.targetClasses.includes('VII') || prog.targetClasses.includes('VIII'))) ||
      (selectedClass === 'Class IX' && (prog.targetClasses.includes('IX') || prog.targetClasses.includes('X'))) ||
      (selectedClass === 'Class XII' && (prog.targetClasses.includes('XII') || prog.targetClasses.includes('Pass')));

    // Category filter
    const matchesCategory = selectedCategory === 'all' || prog.category === selectedCategory;

    // Search query filter
    const matchesQuery = 
      searchQuery === '' ||
      prog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prog.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prog.targetExams.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesClass && matchesCategory && matchesQuery;
  });

  return (
    <section id="course-matcher" className="py-14 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-black text-[#ED1C24] uppercase tracking-wider mb-2">
            <GraduationCap className="w-4 h-4 text-[#ED1C24]" />
            <span>Academic Programs Directory</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#002147] font-display">
            Explore Programs by Class & Target
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            From Class VI junior foundation to legendary Two-Year JEE Advanced programs and eSchool live classes, discover the structured path tailored for your ambition.
          </p>
        </div>

        {/* Filter Navigation Bar */}
        <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs mb-8 space-y-4">
          
          {/* Class Filters */}
          <div>
            <div className="text-xs font-bold text-[#002147] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#ED1C24]" />
              <span>Filter by Current / Moving Class:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {classOptions.map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setSelectedClass(opt.val)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedClass === opt.val
                      ? 'bg-[#ED1C24] text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Program Mode Filters */}
          <div className="pt-2 border-t border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {categoryOptions.map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setSelectedCategory(opt.val)}
                  className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedCategory === opt.val
                      ? 'bg-[#002147] text-white font-bold shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Keyword Search Input */}
            <div className="relative min-w-[240px]">
              <input
                type="text"
                placeholder="Search PINNACLE, AITS, Olympiad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED1C24]"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ×
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Programs Listing Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPrograms.map((program) => (
            <div
              key={program.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden group hover:border-[#ED1C24]/50"
            >
              <div>
                {/* Header & Badges */}
                <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-100 text-[#ED1C24] uppercase tracking-wider">
                      {program.targetClasses}
                    </span>
                    {program.badge && (
                      <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        {program.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-extrabold text-[#002147] group-hover:text-[#ED1C24] transition-colors font-display">
                    {program.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {program.targetExams.map((exam, idx) => (
                      <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {exam}
                      </span>
                    ))}
                    <span className="text-[10px] font-semibold text-slate-500 ml-auto flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#ED1C24]" /> {program.duration}
                    </span>
                  </div>
                </div>

                {/* Content & Features */}
                <div className="p-5 space-y-4">
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    {program.summary}
                  </p>

                  <div className="space-y-2">
                    <div className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider">
                      Curriculum Highlights:
                    </div>
                    <ul className="space-y-1.5">
                      {program.keyFeatures.slice(0, 3).map((feat, idx) => (
                        <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs text-amber-950">
                    <strong>Recommended Target:</strong> {program.recommendedFor}
                  </div>
                </div>
              </div>

              {/* Card Footer with Admissions and CTAs */}
              <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-600 w-full sm:w-auto">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Admission Route:</span>
                  <span className="font-bold text-slate-800">{program.eligibility}</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => onOpenEnquiryModal(program.name)}
                    className="px-3 py-2 text-xs font-bold text-[#002147] bg-white border border-[#002147] hover:bg-slate-100 rounded-lg transition-colors flex-1 sm:flex-initial text-center cursor-pointer uppercase tracking-wide"
                  >
                    Brochure & Fees
                  </button>
                  <button
                    onClick={() => onOpenFtreModal(program.id)}
                    className="px-4 py-2 text-xs font-extrabold text-white bg-[#ED1C24] hover:bg-[#d6171e] rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 flex-1 sm:flex-initial cursor-pointer uppercase tracking-wide"
                  >
                    <span>Apply / FTRE</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {filteredPrograms.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-sm font-bold text-slate-600">No specific programs matched your selected filter.</p>
            <button
              onClick={() => {
                setSelectedClass('all');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-3 px-4 py-2 bg-[#ED1C24] text-white text-xs font-bold rounded-lg uppercase tracking-wide"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
