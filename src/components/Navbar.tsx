import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  UserCheck, 
  CreditCard, 
  BookOpen, 
  Award, 
  ChevronDown, 
  Menu, 
  X, 
  Sparkles,
  ExternalLink,
  Laptop,
  GraduationCap,
  Megaphone,
  Search,
  Building2
} from 'lucide-react';
import { FiitjeeLogo } from './FiitjeeLogo';
import { useStudentAuth } from '../student/hooks/useStudentAuth';

interface NavbarProps {
  onOpenFtreModal: () => void;
  onOpenBigBangModal: () => void;
  onOpenEnquiryModal: () => void;
  onOpenPortalModal: () => void;
  onOpenSearch: () => void;
  onOpenSplash?: () => void;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenFtreModal,
  onOpenBigBangModal,
  onOpenEnquiryModal,
  onOpenPortalModal,
  onOpenSearch,
  onOpenSplash,
  activeSection,
  onNavigate,
}) => {
  const { student, isAuthenticated } = useStudentAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [programsDropdownOpen, setProgramsDropdownOpen] = useState(false);
  const [targetExamsDropdownOpen, setTargetExamsDropdownOpen] = useState(false);
  const [aboutUsDropdownOpen, setAboutUsDropdownOpen] = useState(false);
  const [portalsDropdownOpen, setPortalsDropdownOpen] = useState(false);
  const portalsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (portalsRef.current && !portalsRef.current.contains(event.target as Node)) {
        setPortalsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (sectionId: string) => {
    onNavigate(sectionId);
    setMobileMenuOpen(false);
    setProgramsDropdownOpen(false);
    setTargetExamsDropdownOpen(false);
    setAboutUsDropdownOpen(false);
    setPortalsDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      {/* Top Utility Ribbon for Helpline & Staff Admin Link */}
      <div className="bg-[#001733] text-white text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-5">
            <a href="tel:1800114242" className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors">
              <Phone className="w-3 h-3 text-amber-400" />
              <span>Helpline: <strong className="text-white">1800 11 4242</strong></span>
            </a>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden md:inline-flex items-center gap-1 text-slate-400">
              <MapPin className="w-3 h-3 text-[#ED1C24]" />
              <span>Bhubaneswar • Dwarka • Ranchi • Hyderabad</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/login"
              className="flex items-center gap-1.5 text-amber-300 hover:text-white font-bold transition-colors cursor-pointer bg-white/10 hover:bg-white/15 px-3 py-0.5 rounded-full text-[10px] uppercase tracking-wider"
              title="Centre Staff & Admin Login"
            >
              <Building2 className="w-3 h-3 text-amber-400" />
              <span>Centre Admin Login</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="bg-[#FFCC03]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          
          {/* Logo with dedicated margin so it never collides with nav links */}
          <div 
            onClick={() => handleNavClick('hero-section')}
            className="cursor-pointer select-none shrink-0 mr-6 xl:mr-10 flex items-center"
          >
            <FiitjeeLogo variant="dark" size="md" />
          </div>

          {/* Desktop Navigation Menu */}
          <nav className="hidden xl:flex items-center gap-5 lg:gap-6 text-sm font-bold text-[#002147]">
          {/* Programs Mega Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setProgramsDropdownOpen(true)}
            onMouseLeave={() => setProgramsDropdownOpen(false)}
          >
            <button 
              onClick={() => handleNavClick('programs-section')}
              className="flex items-center gap-1 hover:text-[#ED1C24] py-2 transition-colors cursor-pointer"
            >
              Programs <ChevronDown className={`w-4 h-4 transition-transform ${programsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {programsDropdownOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-[720px] bg-white shadow-xl rounded-xl border border-slate-200 p-5 grid grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                {/* Column 1 */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-[#ED1C24] uppercase border-b pb-1">Classroom Programs</div>
                  <div className="text-[11px] text-slate-500 font-semibold space-y-2">
                    <div>Class VI: LITTLE GENIE One Year</div>
                    <div>Class VII & VIII: UDAYA One/Two Year</div>
                    <div>Class IX & X: Four/Three Year, ASCENT</div>
                    <div>Class XI: Two Year Classroom, Condensed</div>
                    <div>Class XII & XII Pass: One Year Classroom, Extended</div>
                    <div>Crash Courses for JEE Main/Advanced</div>
                  </div>
                </div>
                {/* Column 2 */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-[#002147] uppercase border-b pb-1">Integrated School Programs</div>
                  <div className="text-[11px] text-slate-500 font-semibold space-y-2">
                    <div>Class IX: SUPREME, RAMANUJAN, Udaan</div>
                    <div>Class XI: PINNACLE, PANINI</div>
                  </div>
                  <div className="pt-2 text-[11px] font-bold text-[#002147] uppercase border-b pb-1">eSchool (Live 2-Way)</div>
                  <div className="text-[11px] text-slate-500 font-semibold">
                    Live interactive classes for Classes VI - XII & XII Pass
                  </div>
                </div>
                {/* Column 3 */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-600 uppercase border-b pb-1">Non-Classroom Programs</div>
                  <div className="text-[11px] text-slate-500 font-semibold space-y-2">
                    <div>Class IX & X: Junior RSM, myPAT</div>
                    <div>Class XI, XII & XII Pass: RSM, AITS (All India Test Series), GMP (Grand Masters Package)</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Target Exams Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setTargetExamsDropdownOpen(true)}
            onMouseLeave={() => setTargetExamsDropdownOpen(false)}
          >
            <button 
              className="flex items-center gap-1 hover:text-[#ED1C24] py-2 transition-colors cursor-pointer"
            >
              Target Exams <ChevronDown className={`w-4 h-4 transition-transform ${targetExamsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {targetExamsDropdownOpen && (
              <div className="absolute top-full left-0 w-64 bg-white shadow-xl rounded-xl border border-slate-200 p-3 grid gap-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                <button onClick={() => handleNavClick('/fiitjee-results')} className="text-left px-3 py-2 rounded-lg hover:bg-red-50 hover:text-[#ED1C24] transition-colors">
                  <div className="font-bold text-xs text-slate-900">JEE ADVANCED</div>
                  <div className="text-[10px] text-slate-500 font-normal">Gateway to prestigious IITs</div>
                </button>
                <button onClick={() => handleNavClick('/fiitjee-results')} className="text-left px-3 py-2 rounded-lg hover:bg-red-50 hover:text-[#ED1C24] transition-colors">
                  <div className="font-bold text-xs text-slate-900">JEE MAIN</div>
                  <div className="text-[10px] text-slate-500 font-normal">Gateway to NITs and Centrally Funded Institutes</div>
                </button>
                <button onClick={() => handleNavClick('results-section')} className="text-left px-3 py-2 rounded-lg hover:bg-red-50 hover:text-[#ED1C24] transition-colors">
                  <div className="font-bold text-xs text-slate-900">OLYMPIADS</div>
                  <div className="text-[10px] text-slate-500 font-normal">National & International scholastic standard</div>
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={() => handleNavClick('results-section')}
            className="hover:text-[#ED1C24] transition-colors cursor-pointer flex items-center gap-1"
          >
            Results
          </button>

          <button 
            onClick={() => handleNavClick('why-fiitjee')}
            className="hover:text-[#ED1C24] transition-colors cursor-pointer"
          >
            Why Only FIITJEE
          </button>

          {/* About Us Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setAboutUsDropdownOpen(true)}
            onMouseLeave={() => setAboutUsDropdownOpen(false)}
          >
            <button 
              className="flex items-center gap-1 hover:text-[#ED1C24] py-2 transition-colors cursor-pointer"
            >
              About Us <ChevronDown className={`w-4 h-4 transition-transform ${aboutUsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {aboutUsDropdownOpen && (
              <div className="absolute top-full left-0 w-60 bg-white shadow-xl rounded-xl border border-slate-200 p-2 grid gap-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                <button onClick={() => handleNavClick('/chairmans-message')} className="text-left px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-[#ED1C24] transition-colors text-xs font-bold text-slate-800">
                  CHAIRMAN'S MESSAGE
                </button>
                <button onClick={() => handleNavClick('/our-journey')} className="text-left px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-[#ED1C24] transition-colors text-xs font-bold text-slate-800">
                  OUR JOURNEY
                </button>
                <button onClick={() => handleNavClick('/careers')} className="text-left px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-[#ED1C24] transition-colors text-xs font-bold text-slate-800">
                  CAREER AT FIITJEE
                </button>
                <button onClick={() => handleNavClick('/policies')} className="text-left px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-[#ED1C24] transition-colors text-xs font-bold text-slate-800">
                  POLICIES & OTHER INFO
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={() => handleNavClick('centers-section')}
            className="hover:text-[#ED1C24] transition-colors cursor-pointer"
          >
            Contact Us
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Student Profile / Portals Dropdown */}
          {isAuthenticated && student ? (
            <Link
              to="/student/dashboard"
              className="hidden md:inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#002147] hover:bg-[#001733] text-white text-xs font-bold rounded-full transition-all shadow-xs"
              title="Open Student Dashboard"
            >
              <div className="w-5 h-5 rounded-full bg-amber-400 text-[#002147] flex items-center justify-center font-black text-[10px]">
                {student.fullName ? student.fullName.charAt(0).toUpperCase() : 'S'}
              </div>
              <span className="max-w-[110px] truncate">{student.fullName?.split(' ')[0] || 'Dashboard'}</span>
              <span className="text-[10px] bg-red-600 px-1.5 py-0.5 rounded text-white font-bold">{student.currentClass || 'Student'}</span>
            </Link>
          ) : (
            <div 
              ref={portalsRef}
              className="relative hidden sm:block"
              onMouseEnter={() => setPortalsDropdownOpen(true)}
              onMouseLeave={() => setPortalsDropdownOpen(false)}
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setPortalsDropdownOpen(prev => !prev);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-[#002147] hover:bg-black/5 rounded-full border border-[#002147]/30 transition-all cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-[#002147]" />
                <span>Portals</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${portalsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {portalsDropdownOpen && (
                <div className="absolute right-0 top-full pt-1.5 w-64 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="bg-white shadow-2xl rounded-2xl border border-slate-200 p-2 grid gap-1">
                    <Link
                      to="/student/login"
                      onClick={() => setPortalsDropdownOpen(false)}
                      className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-red-50 transition-colors group text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-100 text-[#ED1C24] flex items-center justify-center shrink-0 group-hover:bg-[#ED1C24] group-hover:text-white transition-colors">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-[#ED1C24]">Student Portal</div>
                        <div className="text-[10px] text-slate-500 font-medium">Exams, Hall Tickets & Profile</div>
                      </div>
                    </Link>

                    <Link
                      to="/admin/login"
                      onClick={() => setPortalsDropdownOpen(false)}
                      className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-amber-50 transition-colors group text-left border-t border-slate-100 pt-2"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 group-hover:bg-[#002147] group-hover:text-amber-400 transition-colors">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-[#002147]">Centre Admin Login</div>
                        <div className="text-[10px] text-slate-500 font-medium">Dwarka, Bhubaneswar, Ranchi, Hyderabad</div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Primary CTA: Big Bang Edge Test 2026 */}
          <button
            onClick={onOpenBigBangModal}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-[#ED1C24] hover:bg-[#d6171e] text-white text-xs font-black uppercase tracking-wider rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <span className="w-2 h-2 bg-amber-300 rounded-full animate-ping" />
            <span>Big Bang 2026</span>
          </button>

          {/* Search Button */}
          <button 
            onClick={onOpenSearch}
            className="p-2 text-[#002147] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-5 h-5 font-bold" />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg text-[#002147] hover:bg-black/5 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3 shadow-2xl animate-in slide-in-from-top-3">
          <div className="grid gap-2 text-sm font-bold text-slate-800">
            <button 
              onClick={() => handleNavClick('hero-section')}
              className="text-left px-3 py-2 rounded-lg hover:bg-red-50 hover:text-[#ED1C24]"
            >
              Home
            </button>
            <button 
              onClick={() => handleNavClick('/fiitjee-admission-test-details')}
              className="text-left px-3 py-2 rounded-lg hover:bg-red-50 hover:text-[#ED1C24]"
            >
              Admission Test Dates
            </button>

            <button 
              onClick={() => handleNavClick('/fiitjee-centres')}
              className="text-left px-3 py-2 rounded-lg hover:bg-red-50 hover:text-[#ED1C24]"
            >
              Centres
            </button>
            <button 
              onClick={() => handleNavClick('/why-only-fiitjee')}
              className="text-left px-3 py-2 rounded-lg hover:bg-red-50 hover:text-[#ED1C24]"
            >
              Hostels
            </button>
            <button 
              onClick={() => handleNavClick('/all-programs')}
              className="text-left px-3 py-2 rounded-lg hover:bg-red-50 hover:text-[#ED1C24]"
            >
              FIITJEE World School
            </button>
            <button 
              onClick={() => handleNavClick('/all-programs')}
              className="text-left px-3 py-2 rounded-lg hover:bg-red-50 hover:text-[#ED1C24]"
            >
              FIITJEE Global School
            </button>
            <button 
              onClick={() => handleNavClick('/why-only-fiitjee')}
              className="text-left px-3 py-2 rounded-lg hover:bg-red-50 hover:text-[#ED1C24]"
            >
              A Must Read For All
            </button>
            <button 
              onClick={() => handleNavClick('/frequently-asked-questions')}
              className="text-left px-3 py-2 rounded-lg hover:bg-red-50 hover:text-[#ED1C24]"
            >
              FAQs
            </button>
            <button 
              onClick={() => handleNavClick('/testimonials')}
              className="text-left px-3 py-2 rounded-lg hover:bg-red-50 hover:text-[#ED1C24]"
            >
              Testimonials
            </button>

            {/* About Us Submenu block */}
            <div className="border-t border-slate-100 pt-2 mt-1 space-y-1">
              <span className="block px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">About Us</span>
              <button 
                onClick={() => handleNavClick('/chairmans-message')}
                className="w-full text-left px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#ED1C24] rounded-md"
              >
                Chairman's Message
              </button>
              <button 
                onClick={() => handleNavClick('/our-journey')}
                className="w-full text-left px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#ED1C24] rounded-md"
              >
                Our Journey
              </button>
              <button 
                onClick={() => handleNavClick('/careers')}
                className="w-full text-left px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#ED1C24] rounded-md"
              >
                Careers
              </button>
              <button 
                onClick={() => handleNavClick('/policies')}
                className="w-full text-left px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#ED1C24] rounded-md"
              >
                Policies & Info
              </button>
            </div>
            <a 
              href="https://fiitjee-eschool.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-left px-3 py-2 rounded-lg hover:bg-red-50 hover:text-[#ED1C24]"
            >
              eSchool
            </a>
            <a 
              href="https://mypat.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-left px-3 py-2 rounded-lg hover:bg-red-50 hover:text-[#ED1C24]"
            >
              myPAT
            </a>
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenBigBangModal();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 text-center font-black text-xs text-white bg-[#ED1C24] hover:bg-[#d6171e] rounded-xl shadow-md uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="w-2 h-2 bg-amber-300 rounded-full animate-ping" />
              <span>Big Bang Edge Test 2026</span>
            </button>

            {isAuthenticated && student ? (
              <Link
                to="/student/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 font-bold text-xs text-white bg-[#002147] hover:bg-[#001733] rounded-xl shadow-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <span>Student Dashboard ({student.fullName?.split(' ')[0]})</span>
              </Link>
            ) : (
              <Link
                to="/student/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 font-bold text-xs text-[#002147] bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl shadow-2xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-[#ED1C24]" />
                <span>Student Portal (Login / Register)</span>
              </Link>
            )}

            <Link
              to="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2 px-4 font-bold text-xs text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-amber-700" />
              <span>Centre Admin Login</span>
            </Link>

            <button
              onClick={() => {
                onOpenEnquiryModal();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 text-center font-bold text-xs text-slate-600 hover:text-slate-900 uppercase tracking-wide cursor-pointer"
            >
              Request Call Back & Brochure
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
