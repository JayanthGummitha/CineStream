'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import { FeatureListProps } from '@/types/pricing';

/**
 * FeatureList Component
 * 
 * Displays a list of features with visual indicators (checkmarks or X marks)
 * to show which features are included or unavailable in a pricing plan.
 * Supports light and dark variants for different card backgrounds.
 * Performance optimized with React.memo to prevent unnecessary re-renders.
 * 
 * @param features - Array of feature items with text and inclusion status
 * @param variant - Visual variant ('light' or 'dark') for different card backgrounds
 */
const FeatureListComponent = ({ features, variant = 'light' }: FeatureListProps) => {
  // Text color classes based on variant
  const textColorIncluded = variant === 'dark' ? 'text-gray-200' : 'text-gray-200';
  const textColorExcluded = variant === 'dark' ? 'text-gray-500' : 'text-gray-500';

  // Separate features into included and not included for screen reader announcement
  const includedFeatures = features.filter(f => f.included);
  const excludedFeatures = features.filter(f => !f.included);

  return (
    <>
      {/* Screen reader only summary */}
      <div className="sr-only">
        <p>Included features: {includedFeatures.length}</p>
        <p>Not included features: {excludedFeatures.length}</p>
      </div>

      <ul className="space-y-3" role="list" aria-label="Plan features">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            {/* Screen reader text for feature status */}
            <span className="sr-only">
              {feature.included ? 'Included: ' : 'Not included: '}
            </span>
            
            {feature.included ? (
              // Green checkmark icon for included features
              <div 
                className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5"
                aria-hidden="true"
              >
                <Check className="w-3 h-3 text-white stroke-[3]" />
              </div>
            ) : (
              // Gray X mark icon for unavailable features
              <div 
                className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5"
                aria-hidden="true"
              >
                <X className="w-4 h-4 text-gray-400 stroke-[2]" />
              </div>
            )}
            <span 
              className={`text-sm leading-relaxed ${
                feature.included ? textColorIncluded : textColorExcluded
              }`}
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
};

// Memoize FeatureList to prevent unnecessary re-renders
// Only re-render when features or variant props change
export const FeatureList = React.memo(FeatureListComponent);
