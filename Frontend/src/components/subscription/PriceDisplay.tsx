/**
 * PriceDisplay Component
 * 
 * Displays pricing information with proper formatting, billing details,
 * savings badge, and original price strikethrough when applicable.
 * Features animated price transitions using SlidingNumber component.
 * Performance optimized with React.memo to prevent unnecessary re-renders.
 */

import React, { useState, useEffect } from 'react';
import { PriceDisplayProps } from '@/types/pricing';
import { Badge } from './Badge';
import { SlidingNumber } from '@/components/ui/sliding-number';

const PriceDisplayComponent: React.FC<PriceDisplayProps> = ({
  monthlyPrice,
  yearlyPrice,
  originalPrice,
  billingCycle,
  currency = 'USD',
  savingsPercentage,
  variant = 'light',
}) => {
  // Calculate the display price based on billing cycle
  // Annual: show yearly total price
  // Monthly: show monthly price
  const displayPrice = billingCycle === 'annual' ? yearlyPrice : monthlyPrice;
  
  // Determine the billing period label
  const billingPeriod = billingCycle === 'annual' ? 'year' : 'month';

  // Track previous price and whether we should animate
  const [previousPrice, setPreviousPrice] = useState(displayPrice);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Detect when billing cycle changes to trigger animation
  useEffect(() => {
    // If the price is different from what we're currently showing, animate
    if (previousPrice !== displayPrice) {
      setShouldAnimate(true);
      // Reset animation flag after animation completes
      const timer = setTimeout(() => {
        setShouldAnimate(false);
        setPreviousPrice(displayPrice);
      }, 650); // Slightly longer than animation duration

      return () => clearTimeout(timer);
    }
  }, [displayPrice, previousPrice]);

  // Text color classes based on variant - all use light colors for dark backgrounds
  const textColorClass = variant === 'dark' ? 'text-white' : 'text-white';
  const secondaryTextClass = variant === 'dark' ? 'text-gray-300' : 'text-gray-400';
  const strikethroughClass = variant === 'dark' ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="mb-6">
      {/* Screen reader only text for price announcement */}
      <span className="sr-only">
        Price: ${displayPrice} per {billingPeriod} in {currency}.
        {billingCycle === 'annual' && ` That's ${monthlyPrice} dollars per month.`}
        {originalPrice && ` Original price was ${originalPrice} dollars.`}
        {savingsPercentage && ` Save ${savingsPercentage} percent.`}
      </span>

      {/* Savings Badge */}
      {/* {savingsPercentage && (
        <div className="mb-2">
          <Badge
            text={`Save ${savingsPercentage}%`}
            variant="savings"
          />
        </div>
      )} */}

      {/* Price Display - Responsive typography with animated transitions */}
      <div className="flex items-baseline gap-2 flex-wrap" aria-hidden="true">
        {/* Original Price with Strikethrough */}
        {originalPrice && (
          <span className={`text-xl md:text-2xl ${strikethroughClass} line-through transition-all duration-300`}>
            ${originalPrice}
          </span>
        )}

        {/* Main Price - Animated with SlidingNumber component when price changes */}
        {shouldAnimate ? (
          <div className="flex items-baseline">
            <span className={`text-4xl md:text-5xl font-bold ${textColorClass}`}>
              $
            </span>
            {/* Animate integer part */}
            <SlidingNumber
              key={`${previousPrice}-${displayPrice}`}
              from={Math.floor(previousPrice)}
              to={Math.floor(displayPrice)}
              duration={0.6}
              startOnView={false}
              className={`text-4xl md:text-5xl font-bold ${textColorClass}`}
              digitHeight={48}
            />
            {/* Show decimal part if present */}
            {displayPrice % 1 !== 0 && (
              <span className={`text-4xl md:text-5xl font-bold ${textColorClass}`}>
                .{(displayPrice % 1).toFixed(2).substring(2)}
              </span>
            )}
          </div>
        ) : (
          <span className={`text-4xl md:text-5xl font-bold ${textColorClass} transition-all duration-300`}>
            ${displayPrice}
          </span>
        )}

        {/* Billing Period Label */}
        <span className={`${secondaryTextClass} text-sm md:text-base transition-colors duration-300`}>
          / {billingPeriod} ({currency})
        </span>
      </div>

      {/* Additional billing information with smooth transition */}
      {billingCycle === 'annual' && (
        <p className={`text-sm ${secondaryTextClass} mt-1 transition-all duration-300 animate-in fade-in`} aria-hidden="true">
          ${monthlyPrice}/month when billed annually
        </p>
      )}
    </div>
  );
};

// Memoize PriceDisplay to prevent unnecessary re-renders
// Only re-render when props actually change
export const PriceDisplay = React.memo(PriceDisplayComponent);

export default PriceDisplay;
