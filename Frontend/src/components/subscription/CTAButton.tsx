/**
 * CTAButton Component
 * 
 * Call-to-action button for plan selection with multiple variants.
 * Performance optimized with React.memo and will-change for smooth animations.
 */

import React from 'react';

export interface CTAButtonProps {
  text: string;
  variant: 'primary' | 'secondary' | 'outline';
  onClick: () => void;
  className?: string;
}

const CTAButtonComponent: React.FC<CTAButtonProps> = ({
  text,
  variant,
  onClick,
  className = '',
}) => {
  // Base styles with will-change for optimized hover animations
  // Using transition for transform and opacity only for better performance
  // Enhanced touch target size for mobile accessibility (min 44px)
  const baseStyles = 'min-h-[44px] px-6 py-3 rounded-full font-semibold text-sm will-change-transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus-visible:ring-4 active:scale-95 touch-manipulation';
  
  const variantStyles = {
    primary: 'bg-white text-black hover:bg-gray-200 hover:scale-105 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] focus:ring-gray-400 focus-visible:ring-gray-500',
    secondary: 'bg-black text-white hover:bg-gray-800 hover:scale-105 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] focus:ring-gray-600 focus-visible:ring-gray-700',
    outline: 'bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-100 hover:border-gray-400 hover:scale-105 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] focus:ring-gray-300 focus-visible:ring-gray-400',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      aria-label={text}
    >
      {text}
    </button>
  );
};

// Memoize CTAButton to prevent unnecessary re-renders
// Only re-render when props actually change
export const CTAButton = React.memo(CTAButtonComponent);
