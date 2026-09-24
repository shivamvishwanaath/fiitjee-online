import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { NoticeTicker } from './components/NoticeTicker';
import { Footer } from './components/Footer';
import { FtreRegistrationModal } from './components/FtreRegistrationModal';
import { EnquiryModal } from './components/EnquiryModal';
import { StudentParentPortalModal } from './components/StudentParentPortalModal';
import { SplashScreen } from './components/SplashScreen';
import { BigBangRegistrationModal } from './components/BigBangRegistrationModal';
import { AdmissionTestDetails } from './components/AdmissionTestDetails';
import { BigBangPopup } from './components/BigBangPopup';
import { BigBangFloatingBar } from './components/BigBangFloatingBar';
import { SearchModal } from './components/SearchModal';
import { HomePage } from './components/HomePage';
import { ResultsShowcase } from './components/ResultsShowcase';
import { SEOWrapper } from './components/SEOWrapper';
import { CenterLocator } from './components/CenterLocator';
import { WhyFiitjee } from './components/WhyFiitjee';
import { CourseFinderWizard } from './components/CourseFinderWizard';
import { ChairmansMessage, OurJourney, Careers, Policies } from './components/AboutPages';
import { TermsAndConditions, PrivacyPolicy, RefundPolicy, ShippingPolicy, ContactUsPage } from './components/LegalPages';
import { AdminApp } from './admin/AdminApp';
import { StandaloneHallTicketView } from './admin/pages/StandaloneHallTicketView';
import { StudentLogin } from './student/pages/StudentLogin';
import { StudentDashboard } from './student/pages/StudentDashboard';
import { StudentProtectedRoute } from './student/components/StudentProtectedRoute';
import { ADMISSION_EXAMS } from './data/examsData';
import { ref, get } from 'firebase/database';
import { db } from './firebase';
import { PROGRAMS, TOPPERS, CENTERS, NOTICES } from './data/fiitjeeData';
import { Sparkles, PhoneCall } from 'lucide-react';

function AppContent() {
  const [activeSection, setActiveSection] = useState('hero-section');
  const [isSplashScreenOpen, setIsSplashScreenOpen] = useState(true);
  const [isFtreModalOpen, setIsFtreModalOpen] = useState(false);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | undefined>(undefined);
  const [enquiryTopic, setEnquiryTopic] = useState<string | undefined>(undefined);
  const [dbLoaded, setDbLoaded] = useState(false);
  const [isBigBangModalOpen, setIsBigBangModalOpen] = useState(false);
  const [isBigBangPopupOpen, setIsBigBangPopupOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isStudentRoute = location.pathname.startsWith('/student');
  const isHallTicketRoute = location.pathname.startsWith('/hall-ticket') || location.pathname.startsWith('/print-hall-ticket');
  const isStandaloneRoute = isAdminRoute || isHallTicketRoute || isStudentRoute;

  // Auto-open Big Bang Registration modal if URL has ?openBigBang=true
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('openBigBang') === 'true') {
      setIsBigBangModalOpen(true);
    }
  }, [location.search]);

  // Trigger Big Bang Popup automatically after splash screen exits (only on public pages)
  useEffect(() => {
    if (!isSplashScreenOpen && !isStandaloneRoute) {
      const hasSeenPopup = localStorage.getItem('bigbang_popup_seen');
      if (!hasSeenPopup) {
        setIsBigBangPopupOpen(true);
      }
    }
  }, [isSplashScreenOpen, isStandaloneRoute]);

  useEffect(() => {
    async function syncFirebaseData() {
      try {
        const snapshot = await get(ref(db, '/'));
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data.programs) PROGRAMS.splice(0, PROGRAMS.length, ...data.programs);
          if (data.toppers) TOPPERS.splice(0, TOPPERS.length, ...data.toppers);
          if (data.centers) CENTERS.splice(0, CENTERS.length, ...data.centers);
          if (data.notices) NOTICES.splice(0, NOTICES.length, ...data.notices);
          if (data.admission_exams) ADMISSION_EXAMS.splice(0, ADMISSION_EXAMS.length, ...data.admission_exams);
          console.log("Synced live results and toppers from Firebase Realtime DB!");
          setDbLoaded(prev => !prev); // Trigger re-render
        }
      } catch (err) {
        console.error("Firebase Realtime DB sync error:", err);
      }
    }
    syncFirebaseData();
  }, []);

  const handleNavigate = (sectionId: string) => {
    // Check if sectionId is actually a path
    if (sectionId.startsWith('/')) {
      navigate(sectionId);
      window.scrollTo(0, 0);
      return;
    }

    // Anchor-based scrolling navigation
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleOpenFtre = (programId?: string) => {
    setSelectedProgramId(programId);
    setIsFtreModalOpen(true);
  };

  const handleOpenBigBang = () => {
    setIsBigBangModalOpen(true);
  };

  const handleOpenEnquiry = (topic?: string) => {
    setEnquiryTopic(topic);
    setIsEnquiryModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 antialiased selection:bg-[#ED1C24] selection:text-white">
      
      {/* Top Main Navigation (only on public pages) */}
      {!isStandaloneRoute && (
        <>
          <Navbar
            onOpenFtreModal={() => handleOpenFtre()}
            onOpenBigBangModal={handleOpenBigBang}
            onOpenEnquiryModal={() => handleOpenEnquiry('General Counseling')}
            onOpenPortalModal={() => setIsPortalModalOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenSplash={() => setIsSplashScreenOpen(true)}
            activeSection={activeSection}
            onNavigate={handleNavigate}
          />

          {/* Dynamic News & Admission Notice Marquee */}
          <NoticeTicker
            onOpenFtreModal={() => handleOpenFtre()}
            onOpenBigBangModal={handleOpenBigBang}
            onNavigate={handleNavigate}
          />
        </>
      )}

      <Routes>
        {/* Homepage Route */}
        <Route path="/" element={
          <HomePage
            onOpenFtre={handleOpenFtre}
            onOpenEnquiry={handleOpenEnquiry}
            onOpenBigBang={handleOpenBigBang}
            onNavigate={handleNavigate}
          />
        } />

        {/* Standalone Pages */}
        <Route path="/all-programs" element={
          <SEOWrapper
            title="FIITJEE Programs & Courses | IIT-JEE, Olympiads, Foundation"
            description="Explore classroom programs, integrated school courses, eSchool, non-classroom packages (RSM, AITS) for classes VI to XII & XII Pass."
            canonical="https://fiitjee-online.web.app/all-programs"
          >
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <CourseFinderWizard
                onOpenFtreModal={handleOpenFtre}
                onOpenEnquiryModal={handleOpenEnquiry}
              />
            </main>
          </SEOWrapper>
        } />

        <Route path="/fiitjee-results" element={
          <SEOWrapper
            title="FIITJEE Toppers & Results | IIT-JEE & Olympiads Success"
            description="Check verified FIITJEE toppers results from JEE Advanced 2025/2024 and scholastic olympiad medal tallies."
            canonical="https://fiitjee-online.web.app/fiitjee-results"
          >
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <ResultsShowcase />
            </main>
          </SEOWrapper>
        } />

        <Route path="/fiitjee-centres" element={
          <SEOWrapper
            title="Locate FIITJEE Centres | Dwarka, Bhubaneswar, Ranchi, Hyderabad"
            description="Find direct contact information, helpline numbers, and map locations for our major participating test centers."
            canonical="https://fiitjee-online.web.app/fiitjee-centres"
          >
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <CenterLocator
                onOpenEnquiryModal={handleOpenEnquiry}
              />
            </main>
          </SEOWrapper>
        } />

        <Route path="/why-only-fiitjee" element={
          <SEOWrapper
            title="Why Choose FIITJEE | 34 Years of Proven Success"
            description="Learn about FIITJEE's unique teaching methodology, pattern-proof training systems, and academic mentorship legacy."
            canonical="https://fiitjee-online.web.app/why-only-fiitjee"
          >
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <WhyFiitjee />
            </main>
          </SEOWrapper>
        } />

        <Route path="/chairmans-message" element={
          <SEOWrapper
            title="Chairman's Message | FIITJEE Foundation"
            description="Read the guiding message from our founding chairman Mr. D.K. Goel on academic excellence, value systems, and integrity."
            canonical="https://fiitjee-online.web.app/chairmans-message"
          >
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <ChairmansMessage />
            </main>
          </SEOWrapper>
        } />

        <Route path="/our-journey" element={
          <SEOWrapper
            title="Our Journey | FIITJEE Legacy & Milestones"
            description="Trace the history of FIITJEE since 1992, highlighting key academic milestones, growth, and national achievements."
            canonical="https://fiitjee-online.web.app/our-journey"
          >
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <OurJourney />
            </main>
          </SEOWrapper>
        } />

        <Route path="/careers" element={
          <SEOWrapper
            title="Careers at FIITJEE | Join Premier Academic Faculty"
            description="Explore job openings, teaching positions, and corporate roles at FIITJEE. Join India's leading test prep workforce."
            canonical="https://fiitjee-online.web.app/careers"
          >
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <Careers />
            </main>
          </SEOWrapper>
        } />

        <Route path="/policies" element={
          <SEOWrapper
            title="Academic Policies & Information | FIITJEE"
            description="Review student codes of conduct, fee waiver policies, and transparent enrollment guidelines at FIITJEE."
            canonical="https://fiitjee-online.web.app/policies"
          >
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <Policies />
            </main>
          </SEOWrapper>
        } />

        <Route path="/terms-and-conditions" element={
          <SEOWrapper
            title="Terms & Conditions | TRANSED LLP"
            description="Official Terms and Conditions for admission tests, online payments, and student portal usage operated by TRANSED LLP."
            canonical="https://fiitjee-online.web.app/terms-and-conditions"
          >
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <TermsAndConditions />
            </main>
          </SEOWrapper>
        } />
        <Route path="/terms" element={
          <SEOWrapper
            title="Terms & Conditions | TRANSED LLP"
            description="Official Terms and Conditions for admission tests, online payments, and student portal usage operated by TRANSED LLP."
            canonical="https://fiitjee-online.web.app/terms"
          >
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <TermsAndConditions />
            </main>
          </SEOWrapper>
        } />

        <Route path="/privacy-policy" element={
          <SEOWrapper
            title="Privacy Policy | TRANSED LLP"
            description="Data protection and privacy guidelines governing candidate records and online payments operated by TRANSED LLP."
            canonical="https://fiitjee-online.web.app/privacy-policy"
          >
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <PrivacyPolicy />
            </main>
          </SEOWrapper>
        } />
        <Route path="/privacy" element={
          <SEOWrapper
            title="Privacy Policy | TRANSED LLP"
            description="Data protection and privacy guidelines governing candidate records and online payments operated by TRANSED LLP."
            canonical="https://fiitjee-online.web.app/privacy"
          >
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <PrivacyPolicy />
            </main>
          </SEOWrapper>
        } />

        <Route path="/refund-policy" element={
          <SEOWrapper
            title="Cancellation & Refund Policy | TRANSED LLP"
            description="Payment gateway compliant cancellation and refund rules with 5-7 working days SLA by TRANSED LLP."
            canonical="https://fiitjee-online.web.app/refund-policy"
          >
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <RefundPolicy />
            </main>
          </SEOWrapper>
        } />
        <Route path="/cancellation-refund-policy" element={
          <SEOWrapper
            title="Cancellation & Refund Policy | TRANSED LLP"
            description="Payment gateway compliant cancellation and refund rules with 5-7 working days SLA by TRANSED LLP."
            canonical="https://fiitjee-online.web.app/cancellation-refund-policy"
          >
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <RefundPolicy />
            </main>
          </SEOWrapper>
        } />

        <Route path="/shipping-and-delivery-policy" element={
          <SEOWrapper
            title="Shipping & Delivery Policy | TRANSED LLP"
            description="Instant electronic delivery and fulfillment of Official Hall Tickets and tax invoices by TRANSED LLP."
            canonical="https://fiitjee-online.web.app/shipping-and-delivery-policy"
          >
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <ShippingPolicy />
            </main>
          </SEOWrapper>
        } />

        <Route path="/contact-us" element={
          <SEOWrapper
            title="Contact Us & Merchant Details | TRANSED LLP"
            description="Official contact information, support helpline, email, and corporate address for merchant TRANSED LLP."
            canonical="https://fiitjee-online.web.app/contact-us"
          >
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <ContactUsPage />
            </main>
          </SEOWrapper>
        } />
        <Route path="/contact" element={
          <SEOWrapper
            title="Contact Us & Merchant Details | TRANSED LLP"
            description="Official contact information, support helpline, email, and corporate address for merchant TRANSED LLP."
            canonical="https://fiitjee-online.web.app/contact"
          >
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <ContactUsPage />
            </main>
          </SEOWrapper>
        } />

        <Route path="/testimonials" element={
          <SEOWrapper
            title="Student Testimonials & Stories | FIITJEE"
            description="Read feedback and reviews from IIT-JEE toppers regarding their preparation experience and learning gains."
            canonical="https://fiitjee-online.web.app/testimonials"
          >
            <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-[#002147] tracking-tight uppercase">Student Testimonials</h2>
                <p className="text-slate-600 text-sm font-semibold uppercase">Hear from our toppers about their transformation journey at FIITJEE.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <p className="text-sm font-semibold italic text-slate-600">"FIITJEE’s rigorous testing and Pattern-Proof methodology made the actual JEE Advanced paper feel like just another classroom test."</p>
                  <div className="text-xs font-black text-[#002147]">— Mridul Agarwal, AIR 1 (JEE Advanced 2021)</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <p className="text-sm font-semibold italic text-slate-600">"The faculty’s continuous encouragement and in-depth conceptual clarity gave me the confidence to score a full 300/300."</p>
                  <div className="text-xs font-black text-[#002147]">— Kavya Chopra, AIR 1 (JEE Main 2021)</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <p className="text-sm font-semibold italic text-slate-600">"AITS and Grand Master Package tested every edge case imaginable. FIITJEE teachers are true gurus."</p>
                  <div className="text-xs font-black text-[#002147]">— Chirag Falor, AIR 1 (JEE Advanced 2020)</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <p className="text-sm font-semibold italic text-slate-600">"PINNACLE synchronized my 11th-12th school hours so I never felt burnt out. Highly recommend to everyone."</p>
                  <div className="text-xs font-black text-[#002147]">— Mayank Singhal, AIR 2 (JEE Advanced 2023)</div>
                </div>
              </div>
            </main>
          </SEOWrapper>
        } />

        <Route path="/frequently-asked-questions" element={
          <SEOWrapper
            title="Frequently Asked Questions (FAQs) | FIITJEE Guide"
            description="Get quick answers regarding admissions procedures, program structures, scholarship eligibility, and center shifts."
            canonical="https://fiitjee-online.web.app/frequently-asked-questions"
          >
            <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-[#002147] tracking-tight uppercase">Frequently Asked Questions (FAQs)</h2>
                <p className="text-slate-600 text-sm font-semibold uppercase">Answers to common queries regarding admissions, classes, and test series.</p>
              </div>
              <div className="space-y-4 pt-4 text-xs font-semibold text-slate-700">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1.5 shadow-xs">
                  <h4 className="font-extrabold text-[#002147] text-sm uppercase">Q1: How do I get admission at FIITJEE?</h4>
                  <p className="leading-relaxed">A: Admission is conducted through FIITJEE Admission Tests or National Scholastic Exams like FTRE (FIITJEE Talent Reward Exam) and Big Bang Edge Test.</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1.5 shadow-xs">
                  <h4 className="font-extrabold text-[#002147] text-sm uppercase">Q2: What is the benefit of the Integrated School Program?</h4>
                  <p className="leading-relaxed">A: It synchronizes the board and JEE syllabus within school hours, saving 4-5 hours of daily travel and self-study time, and completely eliminating school-coaching collision.</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1.5 shadow-xs">
                  <h4 className="font-extrabold text-[#002147] text-sm uppercase">Q3: Can I transfer from one FIITJEE center to another?</h4>
                  <p className="leading-relaxed">A: Yes, center transfers are allowed under standard corporate guidelines, subject to batch availability and seat capacity in the target branch.</p>
                </div>
              </div>
            </main>
          </SEOWrapper>
        } />

        <Route path="/fiitjee-admission-test-details" element={
          <SEOWrapper
            title="Big Bang Edge Test 2026 Details | FIITJEE Admission Test"
            description="Detailed info regarding exam schedules, eligible classes, center helplines, and modes for the Big Bang Edge Test 2026."
            canonical="https://fiitjee-online.web.app/fiitjee-admission-test-details"
          >
            <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <AdmissionTestDetails
                onOpenBigBangModal={handleOpenBigBang}
                onOpenFtreModal={() => handleOpenFtre()}
              />
            </main>
          </SEOWrapper>
        } />
        {/* Admin Multi-Centre Management Portal */}
        <Route path="/admin/*" element={<AdminApp />} />

        {/* Student Portal Routes */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/register" element={<StudentLogin />} />
        <Route path="/student" element={
          <StudentProtectedRoute>
            <StudentDashboard />
          </StudentProtectedRoute>
        } />
        <Route path="/student/dashboard" element={
          <StudentProtectedRoute>
            <StudentDashboard />
          </StudentProtectedRoute>
        } />
        <Route path="/student/*" element={
          <StudentProtectedRoute>
            <StudentDashboard />
          </StudentProtectedRoute>
        } />

        {/* Public Standalone Printable Hall Ticket Routes */}
        <Route path="/hall-ticket/:rollNo" element={<StandaloneHallTicketView />} />
        <Route path="/print-hall-ticket/:rollNo" element={<StandaloneHallTicketView />} />
      </Routes>

      {/* Public Footer & Floating Widgets (only rendered on public portal) */}
      {!isStandaloneRoute && (
        <>
          <Footer
            onNavigate={handleNavigate}
            onOpenFtreModal={() => handleOpenFtre()}
            onOpenEnquiryModal={() => handleOpenEnquiry('General Support')}
            onOpenBigBangModal={handleOpenBigBang}
          />

          {/* Floating Bottom Quick Action Strip for Mobile / Quick Access */}
          <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2.5">
            <button
              onClick={() => handleOpenEnquiry('Urgent Counseling')}
              className="bg-[#002147] text-white p-3 rounded-full shadow-xl hover:bg-[#001733] transition-all flex items-center gap-2 group cursor-pointer border border-[#002147]/50"
              title="Call Helpline"
            >
              <PhoneCall className="w-5 h-5 text-amber-400 animate-pulse" />
              <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-bold pr-1">
                Talk to Counselor: 1800 11 4242
              </span>
            </button>

            <button
              onClick={() => handleOpenFtre()}
              className="bg-[#ED1C24] hover:bg-[#d6171e] text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-red-500/40 transition-all flex items-center gap-2 cursor-pointer font-black text-xs uppercase tracking-wider border-2 border-white/40"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Apply for FTRE 2026-27</span>
            </button>
          </div>

          {/* Persistent Floating Bottom Big Bang Action Bar */}
          <BigBangFloatingBar
            onOpenBigBangModal={handleOpenBigBang}
            isBigBangModalOpen={isBigBangModalOpen}
          />

          {/* Modals & Splash Screen */}
          <SplashScreen
            isOpen={isSplashScreenOpen}
            onClose={() => setIsSplashScreenOpen(false)}
            onOpenFtreModal={() => handleOpenFtre()}
            onOpenEnquiryModal={() => handleOpenEnquiry('FTRE Counseling')}
          />

          <BigBangPopup
            isOpen={isBigBangPopupOpen}
            onClose={() => {
              setIsBigBangPopupOpen(false);
              localStorage.setItem('bigbang_popup_seen', 'true');
            }}
            onOpenBigBangModal={handleOpenBigBang}
          />
        </>
      )}

      <FtreRegistrationModal
        isOpen={isFtreModalOpen}
        onClose={() => setIsFtreModalOpen(false)}
        preselectedProgramId={selectedProgramId}
      />

      <EnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
        initialTopic={enquiryTopic}
      />

      <StudentParentPortalModal
        isOpen={isPortalModalOpen}
        onClose={() => setIsPortalModalOpen(false)}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      <BigBangRegistrationModal
        isOpen={isBigBangModalOpen}
        onClose={() => setIsBigBangModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
