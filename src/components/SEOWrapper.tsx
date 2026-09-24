import React from 'react';
import { useSEO } from '../hooks/useSEO';

interface SEOWrapperProps {
  title: string;
  description?: string;
  canonical?: string;
  children: React.ReactNode;
}

export const SEOWrapper: React.FC<SEOWrapperProps> = ({
  title,
  description,
  canonical,
  children
}) => {
  useSEO({ title, description, canonical });
  return <>{children}</>;
};
