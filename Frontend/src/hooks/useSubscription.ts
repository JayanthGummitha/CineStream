'use client';

import { useState, useEffect } from 'react';

export type SubscriptionPlan = 'none' | 'free_trial' | 'free_trial_expired' | 'basic' | 'premium' | 'family';

interface SubscriptionState {
  isAuthenticated: boolean;
  plan: SubscriptionPlan;
  isFreeTrial: boolean;
  isFreeTrialExpired: boolean;
  hasActivePlan: boolean;
  trialEndsAt?: string;
}

const SUBSCRIPTION_STORAGE_KEY = 'cinestream_subscription';

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionState>({
    isAuthenticated: false,
    plan: 'none',
    isFreeTrial: false,
    isFreeTrialExpired: false,
    hasActivePlan: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Check auth status
      const authData = localStorage.getItem('cinestream_auth');
      const isAuthenticated = authData ? JSON.parse(authData).isAuthenticated : false;

      // Check subscription status
      let subData = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
      
      // DEMO: Set premium as default plan for demo purposes
      if (!subData && isAuthenticated) {
        const demoPlan = { plan: 'premium' };
        localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(demoPlan));
        subData = JSON.stringify(demoPlan);
      }
      
      if (subData) {
        const parsed = JSON.parse(subData);
        const plan = parsed.plan || 'none';
        setSubscription({
          isAuthenticated,
          plan,
          isFreeTrial: plan === 'free_trial',
          isFreeTrialExpired: plan === 'free_trial_expired',
          hasActivePlan: ['basic', 'premium', 'family'].includes(plan),
          trialEndsAt: parsed.trialEndsAt,
        });
      } else {
        setSubscription({
          isAuthenticated,
          plan: 'none',
          isFreeTrial: false,
          isFreeTrialExpired: false,
          hasActivePlan: false,
        });
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSubscription = (plan: SubscriptionPlan, trialEndsAt?: string) => {
    const newState = {
      plan,
      isFreeTrial: plan === 'free_trial',
      isFreeTrialExpired: plan === 'free_trial_expired' || plan === 'none',
      hasActivePlan: ['basic', 'premium', 'family'].includes(plan),
      trialEndsAt,
    };
    
    localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(newState));
    setSubscription(prev => ({ ...prev, ...newState }));
  };

  // CTA Display Logic:
  // 1. Not registered → Show "Start Free Trial" + "View Plans"
  // 2. Registered + Free trial expired/completed → Show only "View Plans"  
  // 3. Registered + Active paid plan → Hide CTA completely
  
  const isNotRegistered = !subscription.isAuthenticated;
  const isRegisteredWithExpiredTrial = subscription.isAuthenticated && !subscription.hasActivePlan;
  const hasActivePaidPlan = subscription.isAuthenticated && subscription.hasActivePlan;

  return {
    ...subscription,
    isLoading,
    updateSubscription,
    // CTA flags
    isNotRegistered,
    isRegisteredWithExpiredTrial,
    hasActivePaidPlan,
  };
}
