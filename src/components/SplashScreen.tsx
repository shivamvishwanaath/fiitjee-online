import React, { useState, useEffect } from 'react';
import { FiitjeeLogo } from './FiitjeeLogo';

interface SplashScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFtreModal?: () => void;
  onOpenEnquiryModal?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  isOpen,
  onClose,
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Automatic close after 4.5 seconds
    const timer = setTimeout(() => {
      handleSkip();
    }, 4500);

    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onClose();
      setIsFadingOut(false); // Reset for next mount
    }, 1000); // match animation duration
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#FFCC03] transition-all duration-1000 ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Centered Logo & Animation */}
      <div className="flex flex-col items-center justify-center space-y-6 text-center select-none">
        <div className="animate-bounce">
          <img
            src="https://dujozny86idgo.cloudfront.net/images/FIITJEE%20Logo.svg"
            alt="FIITJEE Logo"
            className="h-16 sm:h-24 w-auto object-contain"
          />
        </div>
        <div className="w-8 h-8 border-4 border-[#ED1C24] border-t-transparent rounded-full animate-spin mt-4" />
      </div>

      {/* Skip Button */}
      <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2">
        <button
          onClick={handleSkip}
          className="px-6 py-2.5 bg-transparent border-2 border-[#ED1C24] hover:bg-[#ED1C24] text-[#ED1C24] hover:text-white font-black text-xs uppercase tracking-widest rounded-full transition-all cursor-pointer shadow-md hover:shadow-lg uppercase"
        >
          Skip Video
        </button>
      </div>
    </div>
  );
};
