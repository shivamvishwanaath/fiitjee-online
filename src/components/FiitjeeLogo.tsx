import React, { useState } from 'react';

interface FiitjeeLogoProps {
  variant?: 'dark' | 'light' | 'white' | 'icon-only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDomain?: boolean; // deprecated
  showTagline?: boolean; // deprecated
  className?: string;
}

export const FiitjeeLogo: React.FC<FiitjeeLogoProps> = ({
  variant = 'dark',
  size = 'md',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);
  const isLight = variant === 'light' || variant === 'white';

  // Height mappings matching different size requirements
  const heightClass = {
    sm: 'h-6 sm:h-7',
    md: 'h-8 sm:h-10',
    lg: 'h-12 sm:h-14',
    xl: 'h-16 sm:h-20',
  }[size];

  // If the CloudFront image fails to load, fall back to the clean inline CSS wordmark.
  if (hasError) {
    return (
      <div className={`inline-flex items-center gap-2 select-none font-black font-serif-heading leading-none ${className} ${
        size === 'sm' ? 'text-xl' : size === 'md' ? 'text-2xl sm:text-3xl' : size === 'lg' ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl'
      }`}>
        <span className="text-[#ED1C24]">FIIT</span>
        <span className={isLight ? 'text-white' : 'text-[#002147]'}>JEE</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src="https://dujozny86idgo.cloudfront.net/images/FIITJEE%20Logo.svg"
        alt="FIITJEE Logo"
        className={`${heightClass} w-auto object-contain transition-all`}
        style={{
          // Apply brightness/invert to make it a pure white logo silhouette on dark themes (Footer, etc.)
          filter: isLight ? 'brightness(0) invert(1)' : 'none'
        }}
        onError={() => setHasError(true)}
      />
    </div>
  );
};
