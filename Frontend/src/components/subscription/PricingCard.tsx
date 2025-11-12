/**
 * PricingCard Component
 * 
 * Main pricing card component that displays a complete pricing plan with:
 * - Plan name and optional badge (Active, Popular, Save %)
 * - Description text
 * - Price display with billing information
 * - Feature list with checkmarks/X marks
 * - Call-to-action button
 * 
 * Supports both light and highlighted (dark) variants with appropriate styling.
 * Performance optimized with React.memo to prevent unnecessary re-renders.
 */

import React from 'react';
import { PricingCardProps } from '@/types/pricing';
import { PriceDisplay } from './PriceDisplay';
import { FeatureList } from './FeatureList';
import { CTAButton } from './CTAButton';
import { Badge } from './Badge';

const PricingCardComponent: React.FC<PricingCardProps> = ({
  plan,
  billingCycle,
  isHighlighted = false,
  onSelect,
  isSelected = false,
  hasSelection = false,
  isActivePlan = false,
  className = '',
}) => {
  // Determine if this card should use dark variant styling (for text colors)
  const isDark = isHighlighted || plan.isHighlighted;

  // Base card styles with touch-friendly interactions
  const baseStyles = 'rounded-3xl p-6 md:p-8 transition-all duration-300 ease-out touch-manipulation';

  // Variant-specific styles with priority:
  // 1. If THIS card is selected → blue border
  // 2. If THIS card is highlighted AND no card is selected → gold border (default highlight)
  // 3. Otherwise → gray border
  const variantStyles = isSelected
    ? 'bg-[#1a1a1a] border-2 border-[#3b82f6] shadow-[0_4px_6px_rgba(59,130,246,0.3)]'
    : (isHighlighted || plan.isHighlighted) && !hasSelection
      ? 'bg-gradient-to-br from-[#2D2D2D] to-[#1A1A1A] border-2 border-[#FFD700] shadow-[0_8px_16px_rgba(255,215,0,0.3)]'
      : 'bg-[#1a1a1a] border border-gray-600 shadow-[0_4px_6px_rgba(255,255,255,0.05)]';

  // Elevation effect for highlighted cards (desktop only, removed on mobile)
  // Only elevate if highlighted AND no selection has been made
  const elevationStyles = (isHighlighted || plan.isHighlighted) && !hasSelection ? 'translate-y-0 lg:translate-y-[-8px] z-10' : 'z-0';

  // Hover effect styles (subtle on mobile, more pronounced on desktop)
  // Using will-change for optimized hover animations
  // Disable hover effects on touch devices to prevent sticky hover states
  const hoverStyles = 'will-change-transform md:hover:transform md:hover:translate-y-[-4px] md:hover:scale-[1.02] md:hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] active:scale-[0.98]';

  // Count included features for screen reader announcement
  const includedFeaturesCount = plan.features.filter(f => f.included).length;
  const totalFeaturesCount = plan.features.length;

  return (
    <div
      className={`relative ${baseStyles} ${variantStyles} ${elevationStyles} ${hoverStyles} ${className}`}
      role="listitem"
      aria-label={`${plan.name} pricing plan`}
    >
      {/* Screen reader only text for comprehensive plan announcement */}
      <span className="sr-only">
        {plan.name} plan, ${plan.monthlyPrice} per month,
        {includedFeaturesCount} of {totalFeaturesCount} features included
        {plan.badge ? `, ${plan.badge.text}` : ''}
      </span>

      {/* Badge positioned at top-right corner, inside the card */}
      {(plan.badge || isActivePlan) && (
        <div className="absolute top-4 right-4 z-20">
          <Badge
            text={isActivePlan ? 'Active' : plan.badge!.text}
            variant={
              isActivePlan
                ? 'active'
                : plan.badge!.text.toLowerCase().includes('save')
                  ? 'savings'
                  : plan.badge!.color === 'yellow'
                    ? 'active'
                    : 'popular'
            }
          />
        </div>
      )}

      {/* Card Header: Plan Name */}
      <div className="mb-4">
        <h3
          className={`text-xl md:text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-white'}`}
          aria-hidden="true"
        >
          {plan.name}
        </h3>

        {/* Plan Description */}
        {plan.description && (
          <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-300'}`}>
            {plan.description}
          </p>
        )}
      </div>

      {/* Price Display Section */}
      <PriceDisplay
        monthlyPrice={plan.monthlyPrice}
        yearlyPrice={plan.yearlyPrice}
        originalPrice={plan.originalPrice}
        billingCycle={billingCycle}
        savingsPercentage={plan.savingsPercentage}
        variant={isDark ? 'dark' : 'light'}
      />

      {/* Feature List Section */}
      <div className="mb-6">
        <FeatureList
          features={plan.features}
          variant={isDark ? 'dark' : 'light'}
        />
      </div>

      {/* CTA Button Section */}
      <CTAButton
        text={
          isActivePlan
            ? 'Current Plan'
            : plan.id === 'basic'
              ? (billingCycle === 'monthly' ? 'Start Free Trial' : 'Subscribe')
              : plan.cta.text
        }
        variant={isActivePlan ? 'outline' : plan.cta.variant}
        onClick={() => onSelect(plan.id)}
        className="w-full hover:cursor-pointer"
      />
    </div>
  );
};

// Memoize PricingCard to prevent unnecessary re-renders
// Only re-render when props actually change
export const PricingCard = React.memo(PricingCardComponent);

export default PricingCard;
