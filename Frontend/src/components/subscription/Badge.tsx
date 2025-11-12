/**
 * Badge Component
 * 
 * Displays badge labels for pricing cards including:
 * - "Active" badge with yellow background
 * - "Popular" badge with green dot indicator
 * - "Save X%" badge with yellow background
 * 
 * Used in card headers to highlight plan status or savings.
 * Performance optimized with React.memo to prevent unnecessary re-renders.
 */

import React from 'react';

export interface BadgeProps {
  /** Badge text to display */
  text: string;
  /** Badge color variant */
  variant: 'active' | 'popular' | 'savings';
  /** Additional CSS classes */
  className?: string;
}

const BadgeComponent: React.FC<BadgeProps> = ({ text, variant, className = '' }) => {
  // Base styles for all badges with prominent shadow and rounded pill shape
  const baseStyles = 'relative inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 shadow-lg overflow-hidden';
  
  // Variant-specific styles with stronger colors and shadows
  const variantStyles = {
    active: 'bg-yellow-400 text-black shadow-[0_4px_12px_rgba(250,204,21,0.5)]',
    popular: 'bg-green-500 text-white shadow-[0_4px_12px_rgba(34,197,94,0.5)]',
    savings: 'bg-yellow-400 text-black shadow-[0_4px_12px_rgba(250,204,21,0.5)]'
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      role="status"
      aria-label={`${text} badge`}
    >
      {/* Diagonal stripe pattern for savings badge */}
      {variant === 'savings' && (
        <span 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.3) 10px, rgba(0,0,0,0.3) 20px)'
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Green dot indicator for Popular badge */}
      {variant === 'popular' && (
        <span 
          className="w-2 h-2 rounded-full bg-white animate-pulse" 
          aria-hidden="true"
        />
      )}
      
      {/* Badge text with relative positioning to appear above pattern */}
      <span className="relative z-10">{text}</span>
    </span>
  );
};

// Memoize Badge to prevent unnecessary re-renders
// Only re-render when props actually change
export const Badge = React.memo(BadgeComponent);

export default Badge;
