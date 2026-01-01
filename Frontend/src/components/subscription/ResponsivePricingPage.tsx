'use client';

/**
 * ResponsivePricingPage Component
 * 
 * Main container component for the responsive pricing page.
 * Manages billing cycle state and orchestrates the layout of pricing cards.
 * 
 * Features:
 * - Billing toggle for Annual/Monthly selection
 * - CSS Grid layout for pricing cards
 * - State management for billing cycle and plan selection
 * - Responsive design with proper spacing
 * - Performance optimized with useCallback for event handlers
 */

import React, { useState, useCallback } from 'react';
import { ResponsivePricingPageProps, BillingCycle } from '@/types/pricing';
import { BillingToggle } from './BillingToggle';
import { PricingCard } from './PricingCard';
import { Header } from '@/components/navigation/header';
import { Footer } from '@/components/navigation/footer';
import { isAuthenticated } from '@/lib/auth';
import { SUBSCRIPTION_PLANS, pricingPlans } from '@/constants/pricingPlans';
import { PricingSection } from '@/app/subscription/pricing-section';
import { Button } from '../ui/button';
import { useSubscription } from '@/hooks/useSubscription';

export function ResponsivePricingPage({
    plans,
    defaultBilling = 'monthly',
    activePlanId,
    onPlanSelect,
    className = '',
}: ResponsivePricingPageProps) {
    // State management for billing cycle (default: 'annual')
    const [billingCycle, setBillingCycle] = useState<BillingCycle>(defaultBilling);

    // State management for selected plan
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    // Get subscription status to check if user has used free trial
    const { isAuthenticated: isUserAuthenticated, isFreeTrialExpired, plan: currentPlan, hasActivePlan } = useSubscription();
    
    // Disable free trial if:
    // 1. User has already used their free trial (free_trial_expired)
    // 2. User is on any paid plan (basic, premium, family)
    const shouldDisableFreeTrial = isUserAuthenticated && (
        currentPlan === 'free_trial_expired' || 
        hasActivePlan
    );

    /**
     * Handle plan selection and redirect to checkout
     * Updates local state and redirects to checkout page with plan details
     * Memoized with useCallback to prevent unnecessary re-renders
     */
    const handlePlanSelect = useCallback((planId: string) => {
        // Don't process if this is the active plan
        if (planId === activePlanId) {
            return;
        }

        setSelectedPlan(planId);

        // Trigger parent callback if provided
        if (onPlanSelect) {
            onPlanSelect(planId, billingCycle);
        }

        // Find the selected plan details from pricingPlans (which has monthlyPrice/yearlyPrice)
        const selectedPlanDetails = pricingPlans.find(p => p.id === planId);
        
        if (!selectedPlanDetails) {
            console.error('Plan not found:', planId);
            return;
        }

        // Get the correct price based on billing cycle
        const price = billingCycle === 'annual' 
            ? selectedPlanDetails.yearlyPrice 
            : selectedPlanDetails.monthlyPrice;

        // Get currency from SUBSCRIPTION_PLANS (fallback to USD)
        const planCurrency = SUBSCRIPTION_PLANS.find(p => p.id === planId)?.currency || 'USD';

        // Build checkout URL with plan details as query parameters
        const checkoutUrl = new URL('/subscription/checkout', window.location.origin);
        checkoutUrl.searchParams.set('planId', planId);
        checkoutUrl.searchParams.set('planName', selectedPlanDetails.name);
        checkoutUrl.searchParams.set('price', price.toString());
        checkoutUrl.searchParams.set('billingCycle', billingCycle);
        checkoutUrl.searchParams.set('currency', planCurrency);

        // Redirect to checkout page
        window.location.href = checkoutUrl.toString();
    }, [billingCycle, activePlanId, onPlanSelect]);

    /**
     * Handle billing cycle change
     * Updates billing cycle state when toggle is changed
     * Memoized with useCallback to prevent unnecessary re-renders
     */
    const handleBillingChange = useCallback((newBilling: BillingCycle) => {
        setBillingCycle(newBilling);
    }, []);

    return (
        <>
            {/* Header */}
            <Header isAuthenticated={true} />

            {/* Main Content */}
            <section
                className={`w-full flex flex-col mb-20 min-h-screen bg-background ${className}`}
                aria-labelledby="subscription-heading"
            >
                {/* Container with max-width and responsive padding */}
                <div className="max-w-[1400px]  mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16 lg:py-20 pt-24 md:pt-28 lg:pt-32">
                    {/* Header Section with Billing Toggle */}
                    <div className="flex flex-col items-center mb-12 md:mb-14 lg:mb-16">
                        {/* Page Heading - 48px bold as per requirements */}
                        <h1
                            id="subscription-heading"
                            className="text-4xl md:text-5xl font-bold text-white mb-8"
                        >
                            Subscription Plans
                        </h1>

                        <BillingToggle
                            value={billingCycle}
                            onChange={handleBillingChange}
                        />
                    </div>

                    {/* 
          Pricing Cards Grid with responsive breakpoints:
          - Mobile (< 768px): Single column, cards stack vertically
          - Tablet (768px - 1024px): 2-column layout with highlighted card spanning full width
          - Desktop (> 1024px): 3-column layout with elevated middle card
        */}
                    <div
                        // className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-8"
                        role="list"
                        aria-label="Subscription plans"
                    >
                        {/* {plans.map((plan) => {
                            const isThisCardSelected = selectedPlan === plan.id;
                            const hasAnySelection = selectedPlan !== null;
                            const isThisActivePlan = activePlanId === plan.id;

                            return (
                                <PricingCard
                                    key={plan.id}
                                    plan={plan}
                                    billingCycle={billingCycle}
                                    isHighlighted={plan.isHighlighted}
                                    isSelected={isThisCardSelected}
                                    hasSelection={hasAnySelection}
                                    isActivePlan={isThisActivePlan}
                                    onSelect={handlePlanSelect}
                                    // Highlighted card spans full width on tablet
                                    className={plan.isHighlighted ? 'md:col-span-2 lg:col-span-1' : ''}
                                />
                            );
                        })} */}
                        <PricingSection
                            plans={plans}
                            billingCycle={billingCycle}
                            selectedPlan={selectedPlan}
                            activePlanId={activePlanId}
                            onSelect={handlePlanSelect}
                        />
                    </div>

                    {/* Comparison Table */}
                </div>
                <div className="mt-16 overflow-x-auto">
                    <table className="w-full border-collapse">
                        {/* Header Row with Plan Names and Buttons */}
                        <thead>
                            <tr style={{ borderBottom: '1px solid #1C1C1C' }}>
                                <th className="text-left px-5 py-4" style={{ width: '30%', borderRight: '1px solid #1C1C1C' }}>
                                    <span className="text-3xl md:text-3xl font-bold pb-2 text-white ">
                                        Compare plans
                                    </span>
                                    <br />
                                    <span className="text-white font-normal" style={{ fontSize: '14px' }}>
                                        Find one that's right for you
                                    </span>
                                </th>
                                {SUBSCRIPTION_PLANS.map((plan, index) => (
                                    <th key={plan.id} className="text-center px-5 py-4" style={{
                                        width: '17.5%',
                                        borderLeft: '1px solid #1C1C1C'
                                    }}>
                                        <div className="space-y-3">
                                            <div className="text-white font-bold" style={{ fontSize: '20px' }}>
                                                {plan.name.replace(' Plan', '')}
                                            </div>
                                            {(() => {
                                                const isActivePlan = currentPlan === plan.id;
                                                // Only disable the "free" plan (actual free trial), not paid plans with trial periods
                                                const isFreeTrialPlan = plan.id === 'free';
                                                const isTrialDisabled = isFreeTrialPlan && shouldDisableFreeTrial;
                                                // Don't use disabled for active plan to avoid opacity
                                                const isButtonDisabled = isTrialDisabled;
                                                
                                                return (
                                                    <Button
                                                        onClick={() => {
                                                            if (isActivePlan) {
                                                                window.location.href = '/user/subscription';
                                                            } else if (!isTrialDisabled) {
                                                                handlePlanSelect(plan.id);
                                                            }
                                                        }}
                                                        disabled={isButtonDisabled}
                                                        className={`px-6 py-2 font-medium transition-colors ${
                                                            isActivePlan
                                                                ? '!bg-red-600 !text-white cursor-pointer !opacity-100'
                                                                : isTrialDisabled
                                                                ? 'bg-gray-500 cursor-not-allowed text-gray-300  opacity-50 '
                                                                : 'bg-white text-black hover:bg-gray-200 hover:cursor-pointer'
                                                        }`}
                                                        style={{
                                                            borderRadius: '9999px',
                                                            fontSize: '14px',
                                                            ...(isActivePlan && { backgroundColor: '#dc2626', color: '#ffffff', opacity: 1 })
                                                        }}
                                                    >
                                                        {isActivePlan
                                                            ? 'Current Plan'
                                                            : isTrialDisabled
                                                            ? 'Trial Used'
                                                            : plan.id === 'free' ? 'Get Started'
                                                            : plan.id === 'family' ? 'Contact Sales'
                                                            : 'Choose Plan'}
                                                    </Button>
                                                );
                                            })()}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody>
                            {/* Video Quality */}
                            <tr style={{ borderBottom: '1px solid #1C1C1C' }}>
                                <td className="px-5 py-4 text-white" style={{ fontSize: '14px', borderRight: '1px solid #1C1C1C' }}>
                                    Video Quality
                                </td>
                                {SUBSCRIPTION_PLANS.map((plan, index) => (
                                    <td key={plan.id} className="text-center px-5 py-4 text-white" style={{
                                        fontSize: '14px',
                                        borderLeft: index > 0 ? '1px solid #1C1C1C' : 'none'
                                    }}>
                                        {plan.features.quality}
                                    </td>
                                ))}
                            </tr>

                            {/* User Profiles */}
                            <tr style={{ borderBottom: '1px solid #1C1C1C' }}>
                                <td className="px-5 py-4 text-white" style={{ fontSize: '14px', borderRight: '1px solid #1C1C1C' }}>
                                    User Profiles
                                </td>
                                {SUBSCRIPTION_PLANS.map((plan, index) => (
                                    <td key={plan.id} className="text-center px-5 py-4 text-white" style={{
                                        fontSize: '14px',
                                        borderLeft: index > 0 ? '1px solid #1C1C1C' : 'none'
                                    }}>
                                        {plan.features.profiles}
                                    </td>
                                ))}
                            </tr>

                            {/* Simultaneous Devices */}
                            <tr style={{ borderBottom: '1px solid #1C1C1C' }}>
                                <td className="px-5 py-4 text-white" style={{ fontSize: '14px', borderRight: '1px solid #1C1C1C' }}>
                                    Simultaneous Devices
                                </td>
                                {SUBSCRIPTION_PLANS.map((plan, index) => (
                                    <td key={plan.id} className="text-center px-5 py-4 text-white" style={{
                                        fontSize: '14px',
                                        borderLeft: index > 0 ? '1px solid #1C1C1C' : 'none'
                                    }}>
                                        {plan.features.maxDevices}
                                    </td>
                                ))}
                            </tr>

                            {/* Content Library */}
                            <tr style={{ borderBottom: '1px solid #1C1C1C' }}>
                                <td className="px-5 py-4 text-white" style={{ fontSize: '14px', borderRight: '1px solid #1C1C1C' }}>
                                    Content Library
                                </td>
                                {SUBSCRIPTION_PLANS.map((plan, index) => (
                                    <td key={plan.id} className="text-center px-5 py-4 text-white" style={{
                                        fontSize: '14px',
                                        borderLeft: index > 0 ? '1px solid #1C1C1C' : 'none'
                                    }}>
                                        {plan.features.fullLibrary ? 'Complete' : 'Limited'}
                                    </td>
                                ))}
                            </tr>

                            {/* Offline Downloads */}
                            <tr style={{ borderBottom: '1px solid #1C1C1C' }}>
                                <td className="px-5 py-4 text-white" style={{ fontSize: '14px', borderRight: '1px solid #1C1C1C' }}>
                                    Offline Downloads
                                </td>
                                {SUBSCRIPTION_PLANS.map((plan, index) => (
                                    <td key={plan.id} className="text-center px-5 py-4" style={{
                                        fontSize: '14px',
                                        borderLeft: index > 0 ? '1px solid #1C1C1C' : 'none'
                                    }}>
                                        {plan.features.offlineDownloads ? (
                                            typeof plan.features.offlineDownloads === 'number' ? (
                                                <div className="text-white">{plan.features.offlineDownloads} titles</div>
                                            ) : (
                                                <div className="w-5 h-5 rounded-full bg-white border-2 border-white flex items-center justify-center mx-auto">
                                                    <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )
                                        ) : (
                                            <div></div>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            {/* Ad-Free Experience */}
                            <tr style={{ borderBottom: '1px solid #1C1C1C' }}>
                                <td className="px-5 py-4 text-white" style={{ fontSize: '14px', borderRight: '1px solid #1C1C1C' }}>
                                    Ad-Free Experience
                                </td>
                                {SUBSCRIPTION_PLANS.map((plan, index) => (
                                    <td key={plan.id} className="text-center px-5 py-4" style={{
                                        borderLeft: index > 0 ? '1px solid #1C1C1C' : 'none'
                                    }}>
                                        {plan.features.adFree ? (
                                            <div className="w-5 h-5 rounded-full bg-white border-2 border-white flex items-center justify-center mx-auto">
                                                <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        ) : (
                                            <div></div>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            {/* Group Watch */}
                            <tr style={{ borderBottom: '1px solid #1C1C1C' }}>
                                <td className="px-5 py-4 text-white" style={{ fontSize: '14px', borderRight: '1px solid #1C1C1C' }}>
                                    Group Watch
                                </td>
                                {SUBSCRIPTION_PLANS.map((plan, index) => (
                                    <td key={plan.id} className="text-center px-5 py-4" style={{
                                        borderLeft: index > 0 ? '1px solid #1C1C1C' : 'none'
                                    }}>
                                        {plan.features.groupWatch ? (
                                            <div className="w-5 h-5 rounded-full bg-white border-2 border-white flex items-center justify-center mx-auto">
                                                <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        ) : (
                                            <div></div>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            {/* Kids Profiles */}
                            <tr style={{ borderBottom: '1px solid #1C1C1C' }}>
                                <td className="px-5 py-4 text-white" style={{ fontSize: '14px', borderRight: '1px solid #1C1C1C' }}>
                                    Kids Profiles
                                </td>
                                {SUBSCRIPTION_PLANS.map((plan, index) => (
                                    <td key={plan.id} className="text-center px-5 py-4" style={{
                                        borderLeft: index > 0 ? '1px solid #1C1C1C' : 'none'
                                    }}>
                                        {plan.features.kidsProfiles ? (
                                            <div className="w-5 h-5 rounded-full bg-white border-2 border-white flex items-center justify-center mx-auto">
                                                <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        ) : (
                                            <div></div>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            {/* Priority Support */}
                            <tr style={{ borderBottom: '1px solid #1C1C1C' }}>
                                <td className="px-5 py-4 text-white" style={{ fontSize: '14px', borderRight: '1px solid #1C1C1C' }}>
                                    Priority Support
                                </td>
                                {SUBSCRIPTION_PLANS.map((plan, index) => (
                                    <td key={plan.id} className="text-center px-5 py-4" style={{
                                        borderLeft: index > 0 ? '1px solid #1C1C1C' : 'none'
                                    }}>
                                        {plan.features.prioritySupport ? (
                                            <div className="w-5 h-5 rounded-full bg-white border-2 border-white flex items-center justify-center mx-auto">
                                                <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        ) : (
                                            <div></div>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            {/* Early Access */}
                            <tr style={{ borderBottom: '1px solid #1C1C1C' }}>
                                <td className="px-5 py-4 text-white" style={{ fontSize: '14px', borderRight: '1px solid #1C1C1C' }}>
                                    Early Access
                                </td>
                                {SUBSCRIPTION_PLANS.map((plan, index) => (
                                    <td key={plan.id} className="text-center px-5 py-4" style={{
                                        borderLeft: index > 0 ? '1px solid #1C1C1C' : 'none'
                                    }}>
                                        {plan.features.earlyAccess ? (
                                            <div className="w-5 h-5 rounded-full bg-white border-2 border-white flex items-center justify-center mx-auto">
                                                <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            // <div></div>
                                        ) : (
                                            <div></div>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            {/* Free Trial */}
                            <tr>
                                <td className="px-5 py-4 text-white" style={{ fontSize: '14px', borderRight: '1px solid #1C1C1C' }}>
                                    Free Trial
                                </td>
                                {SUBSCRIPTION_PLANS.map((plan, index) => (
                                    <td key={plan.id} className="text-center px-5 py-4" style={{
                                        fontSize: '14px',
                                        borderLeft: index > 0 ? '1px solid #1C1C1C' : 'none'
                                    }}>
                                        {plan.freeTrial ? (
                                            <div className="text-white">{plan.freeTrial} days</div>
                                        ) : (
                                            <div></div>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </>
    );
}

export default ResponsivePricingPage;
