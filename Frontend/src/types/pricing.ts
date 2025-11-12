/**
 * Pricing UI Type Definitions
 * 
 * This file contains all TypeScript interfaces and types for the responsive pricing page.
 */

/**
 * Represents a single feature item in a pricing plan
 */
export interface FeatureItem {
  /** The feature description text */
  text: string;
  /** Whether the feature is included in the plan */
  included: boolean;
}

/**
 * Badge configuration for pricing cards
 */
export interface PricingBadge {
  /** Badge text (e.g., "Active", "Popular", "Save 27%") */
  text: string;
  /** Badge color variant */
  color: 'yellow' | 'green';
}

/**
 * Call-to-action button configuration
 */
export interface CTAConfig {
  /** Button text */
  text: string;
  /** Button style variant */
  variant: 'primary' | 'secondary' | 'outline';
}

/**
 * Complete pricing plan data structure
 */
export interface PricingPlanData {
  /** Unique identifier for the plan */
  id: string;
  /** Display name of the plan */
  name: string;
  /** Monthly price in USD */
  monthlyPrice: number;
  /** Yearly price in USD */
  yearlyPrice: number;
  /** Original price (for showing discounts) */
  originalPrice?: number;
  /** Savings percentage (e.g., 27 for 27%) */
  savingsPercentage?: number;
  /** Optional badge configuration */
  badge?: PricingBadge;
  /** Plan description text */
  description?: string;
  /** List of features with inclusion status */
  features: FeatureItem[];
  /** Call-to-action button configuration */
  cta: CTAConfig;
  /** Whether this plan should be highlighted/elevated */
  isHighlighted?: boolean;
}

/**
 * Billing cycle options
 */
export type BillingCycle = 'annual' | 'monthly';

/**
 * Props for the main ResponsivePricingPage component
 */
export interface ResponsivePricingPageProps {
  /** Array of pricing plans to display */
  plans: PricingPlanData[];
  /** Default billing cycle selection */
  defaultBilling?: BillingCycle;
  /** ID of the user's currently active plan */
  activePlanId?: string;
  /** Callback when a plan is selected */
  onPlanSelect?: (planId: string, billing: BillingCycle) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for the BillingToggle component
 */
export interface BillingToggleProps {
  /** Current billing cycle value */
  value: BillingCycle;
  /** Callback when billing cycle changes */
  onChange: (value: BillingCycle) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for the PricingCard component
 */
export interface PricingCardProps {
  /** Pricing plan data */
  plan: PricingPlanData;
  /** Current billing cycle */
  billingCycle: BillingCycle;
  /** Whether this card should be highlighted */
  isHighlighted?: boolean;
  /** Whether this card is currently selected */
  isSelected?: boolean;
  /** Whether any card is currently selected */
  hasSelection?: boolean;
  /** Whether this is the user's active plan */
  isActivePlan?: boolean;
  /** Callback when plan is selected */
  onSelect: (planId: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for the PriceDisplay component
 */
export interface PriceDisplayProps {
  /** Monthly price amount */
  monthlyPrice: number;
  /** Yearly price amount */
  yearlyPrice: number;
  /** Original price (for showing discounts) */
  originalPrice?: number;
  /** Current billing cycle */
  billingCycle: BillingCycle;
  /** Currency code (default: USD) */
  currency?: string;
  /** Savings percentage to display */
  savingsPercentage?: number;
  /** Variant for styling (light or dark card) */
  variant?: 'light' | 'dark';
}

/**
 * Props for the FeatureList component
 */
export interface FeatureListProps {
  /** Array of features to display */
  features: FeatureItem[];
  /** Visual variant for different card backgrounds */
  variant?: 'light' | 'dark';
}

/**
 * Props for the CTAButton component
 */
export interface CTAButtonProps {
  /** Button text */
  text: string;
  /** Button style variant */
  variant: 'primary' | 'secondary' | 'outline';
  /** Click handler */
  onClick: () => void;
  /** Additional CSS classes */
  className?: string;
}


export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'family';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  price: number;
  currency: string;
  billing: 'monthly' | 'annual';
  features: {
    profiles: number;
    maxDevices: number;
    quality: string;
    fullLibrary: boolean;
    offlineDownloads: boolean | number;
    adFree: boolean;
    groupWatch: boolean;
    prioritySupport: boolean;
    kidsProfiles: boolean;
    earlyAccess: boolean;
  };
  freeTrial?: number; // days
}

export interface EnhancedSubscriptionPlan extends SubscriptionPlan {
  yearlyPrice?: number;
  yearlyDiscount?: number;
  popularBadge?: boolean;
  gradient?: {
    from: string;
    to: string;
  };
  icon?: string;
  description?: string;
  ctaText?: string;
  featureList?: string[];
}