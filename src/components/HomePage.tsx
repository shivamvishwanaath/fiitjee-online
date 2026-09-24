import React from 'react';
import { HeroBanner } from './HeroBanner';
import { SubNavigation } from './SubNavigation';
import { BigBangHeroBanner } from './BigBangHeroBanner';
import { AnnouncementCards } from './AnnouncementCards';
import { UpcomingOpportunities } from './UpcomingOpportunities';
import { CourseFinderWizard } from './CourseFinderWizard';
import { HistoricalShowcase } from './HistoricalShowcase';
import { BigBangInlineBanner } from './BigBangInlineBanner';
import { ResultsShowcase } from './ResultsShowcase';
import { CenterLocator } from './CenterLocator';
import { UniquelyDifferent } from './UniquelyDifferent';
import { AllStreamsStatement } from './AllStreamsStatement';
import { WhyFiitjee } from './WhyFiitjee';
import { useSEO } from '../hooks/useSEO';

interface HomePageProps {
  onOpenFtre: (programId?: string) => void;
  onOpenEnquiry: (topic?: string) => void;
  onOpenBigBang: () => void;
  onNavigate: (sectionId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenFtre,
  onOpenEnquiry,
  onOpenBigBang,
  onNavigate
}) => {
  useSEO({
    title: "FIITJEE Prep & Admission Portal | Forum for IIT-JEE",
    description: "Explore FIITJEE coaching programs for IIT-JEE Advanced, JEE Main, Olympiads, and NTSE. Secure scholarship opportunities and slot bookings for the Big Bang Edge Test 2026. 40,000+ IIT selections in 34 years.",
    canonical: "https://fiitjee-online.web.app/"
  });

  return (
    <main className="flex-1">
      {/* Hero Section with Slider and Quick Slot Booking */}
      <div id="hero-section">
        <HeroBanner
          onOpenFtreModal={() => onOpenFtre()}
          onOpenEnquiryModal={() => onOpenEnquiry('Admission Test Inquiry')}
          onOpenMatcher={() => onNavigate('/all-programs')}
          onOpenBigBangModal={onOpenBigBang}
        />
      </div>

      <SubNavigation 
        onNavigate={onNavigate}
        onOpenBigBangModal={onOpenBigBang}
      />

      <BigBangHeroBanner onOpenBigBangModal={onOpenBigBang} />

      <AnnouncementCards onOpenBigBangModal={onOpenBigBang} />

      {/* Upcoming Opportunities & Diagnostic Tests */}
      <UpcomingOpportunities
        onOpenFtreModal={() => onOpenFtre()}
        onOpenBigBangModal={onOpenBigBang}
        onNavigate={onNavigate}
      />

      {/* Course Finder & Programs Preview */}
      <div id="programs-section" className="py-8 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-[#002147] tracking-tight uppercase">Featured Programs</h2>
            <button 
              onClick={() => onNavigate('/all-programs')}
              className="text-xs font-bold text-[#ED1C24] hover:underline uppercase"
            >
              View All Programs &rarr;
            </button>
          </div>
          <CourseFinderWizard
            onOpenFtreModal={onOpenFtre}
            onOpenEnquiryModal={onOpenEnquiry}
          />
        </div>
      </div>

      <HistoricalShowcase />

      <BigBangInlineBanner onOpenBigBangModal={onOpenBigBang} />

      {/* Results Preview */}
      <div id="results-section" className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-[#002147] tracking-tight uppercase">Recent Toppers & Results</h2>
            <button 
              onClick={() => onNavigate('/fiitjee-results')}
              className="text-xs font-bold text-[#ED1C24] hover:underline uppercase"
            >
              View Full Hall of Fame &rarr;
            </button>
          </div>
          <ResultsShowcase />
        </div>
      </div>

      {/* Center Locator Preview */}
      <div id="centers-section" className="py-8 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-[#002147] tracking-tight uppercase">Our Centers</h2>
            <button 
              onClick={() => onNavigate('/fiitjee-centres')}
              className="text-xs font-bold text-[#ED1C24] hover:underline uppercase"
            >
              Search All Centers &rarr;
            </button>
          </div>
          <CenterLocator
            onOpenEnquiryModal={onOpenEnquiry}
          />
        </div>
      </div>

      <UniquelyDifferent />

      <AllStreamsStatement />

      {/* Why FIITJEE / 33 Years of Legacy */}
      <div id="why-fiitjee">
        <WhyFiitjee />
      </div>
    </main>
  );
};
