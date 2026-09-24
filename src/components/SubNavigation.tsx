import React, { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { title: 'Exemplary Results', subNavId: 'results-section' },
  { title: 'Our Programs', subNavId: 'programs-section' },
  { title: 'Big Bang Edge Test', subNavId: 'big-bang-section', isHighlighted: true },
  { title: 'FIITJEE Admission Test', subNavId: 'programs-section' },
  { title: 'FIITJEE for all Streams', subNavId: 'why-fiitjee' },
  { title: 'Our Methodology', subNavId: 'why-fiitjee' },
  { title: 'myPAT', subNavId: 'hero-section' },
  { title: 'World of FIITJEE', subNavId: 'centers-section' },
];

interface SubNavigationProps {
  onNavigate: (sectionId: string) => void;
  onOpenBigBangModal: () => void;
}

export const SubNavigation: React.FC<SubNavigationProps> = ({ 
  onNavigate,
  onOpenBigBangModal
}) => {
  const [activeTab, setActiveTab] = useState('results-section');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.subNavId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveTab(item.subNavId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabClick = (item: typeof NAV_ITEMS[0]) => {
    if (item.subNavId === 'big-bang-section') {
      if (window.location.pathname !== '/') {
        // Direct modal open if on subpage
        onOpenBigBangModal();
      } else {
        // Scroll to the takeover section on homepage
        setActiveTab(item.subNavId);
        onNavigate(item.subNavId);
      }
    } else {
      setActiveTab(item.subNavId);
      onNavigate(item.subNavId);
    }
  };

  return (
    <div className="relative z-20 bg-white border-b border-slate-200 shadow-xs hidden md:block">
      <div className="max-w-7xl mx-auto flex items-center justify-center overflow-x-auto whitespace-nowrap">
        {NAV_ITEMS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleTabClick(item)}
            className={`px-6 py-3.5 text-xs font-black transition-all cursor-pointer relative flex items-center gap-1.5 ${
              idx !== NAV_ITEMS.length - 1 ? 'border-r border-slate-200' : ''
            } ${
              activeTab === item.subNavId
                ? 'text-[#ED1C24] bg-slate-50/50'
                : item.isHighlighted
                  ? 'text-red-600 hover:bg-red-50/50'
                  : 'text-[#002147] hover:text-[#ED1C24] hover:bg-slate-50'
            }`}
          >
            {item.isHighlighted && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
            )}
            <span>{item.title}</span>
            {activeTab === item.subNavId && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#ED1C24]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
