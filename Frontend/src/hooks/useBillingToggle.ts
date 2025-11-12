'use client';

import { useState, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import { prefersReducedMotion } from '@/lib/animations/utils';
import { ANIMATION_CONFIG } from '@/lib/animations/config';
import { EnhancedSubscriptionPlan } from '@/types';

export interface UseBillingToggleProps {
  initialBilling?: 'monthly' | 'yearly';
  plans: EnhancedSubscriptionPlan[];
  onBillingChange?: (billing: 'monthly' | 'yearly') => void;
}

export interface UseBillingToggleReturn {
  billingCycle: 'monthly' | 'yearly';
  setBillingCycle: (billing: 'monthly' | 'yearly') => void;
  animatedPriceChange: (
    priceElements: string | Element | Element[],
    callback?: () => void
  ) => void;
  getDisplayPrice: (plan: EnhancedSubscriptionPlan) => {
    price: number;
    originalPrice?: number;
    discount?: number;
    period: string;
  };
  getSavingsAmount: (plan: EnhancedSubscriptionPlan) => number | null;
}

export function useBillingToggle({
  initialBilling = 'monthly',
  plans,
  onBillingChange,
}: UseBillingToggleProps): UseBillingToggleReturn {
  const [billingCycle, setBillingCycleState] = useState<'monthly' | 'yearly'>(initialBilling);

  // Handle billing cycle change with price animation
  const setBillingCycle = useCallback((newBilling: 'monthly' | 'yearly') => {
    if (newBilling === billingCycle) return;
    
    setBillingCycleState(newBilling);
    onBillingChange?.(newBilling);
  }, [billingCycle, onBillingChange]);

  // Animate price changes when billing cycle changes
  const animatedPriceChange = useCallback((
    priceElements: string | Element | Element[],
    callback?: () => void
  ) => {
    if (prefersReducedMotion()) {
      callback?.();
      return;
    }

    const timeline = gsap.timeline();

    // Scale down and fade out current prices
    timeline.to(priceElements, {
      scale: 0.8,
      opacity: 0.5,
      duration: 0.2,
      ease: 'power2.in',
    });

    // Update prices (callback)
    timeline.call(() => {
      callback?.();
    });

    // Scale up and fade in new prices
    timeline.to(priceElements, {
      scale: 1,
      opacity: 1,
      duration: ANIMATION_CONFIG.duration.transition,
      ease: ANIMATION_CONFIG.easing.transition,
    });

    return timeline;
  }, []);

  // Get display price based on billing cycle
  const getDisplayPrice = useCallback((plan: EnhancedSubscriptionPlan) => {
    if (billingCycle === 'yearly' && plan.yearlyPrice !== undefined) {
      const monthlyEquivalent = plan.yearlyPrice / 12;
      return {
        price: monthlyEquivalent,
        originalPrice: plan.price,
        discount: plan.yearlyDiscount,
        period: 'month (billed yearly)',
      };
    }

    return {
      price: plan.price,
      period: 'month',
    };
  }, [billingCycle]);

  // Calculate savings amount for yearly billing
  const getSavingsAmount = useCallback((plan: EnhancedSubscriptionPlan): number | null => {
    if (billingCycle !== 'yearly' || !plan.yearlyPrice) {
      return null;
    }

    const yearlyTotal = plan.price * 12;
    const savings = yearlyTotal - plan.yearlyPrice;
    return savings > 0 ? savings : null;
  }, [billingCycle]);

  // Memoized return value to prevent unnecessary re-renders
  return useMemo(() => ({
    billingCycle,
    setBillingCycle,
    animatedPriceChange,
    getDisplayPrice,
    getSavingsAmount,
  }), [
    billingCycle,
    setBillingCycle,
    animatedPriceChange,
    getDisplayPrice,
    getSavingsAmount,
  ]);
}