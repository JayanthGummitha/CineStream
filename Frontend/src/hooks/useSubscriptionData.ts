import { useState, useEffect } from 'react';
import { EnhancedSubscriptionPlan, SubscriptionPlan } from '@/types';
import { ENHANCED_SUBSCRIPTION_PLANS, SUBSCRIPTION_PLANS } from '@/lib/constants';

// Utility function to convert basic plans to enhanced plans
const convertToEnhancedPlan = (plan: SubscriptionPlan): EnhancedSubscriptionPlan => {
  // Default feature lists based on plan type
  const getFeatureList = (planId: string, features: any): string[] => {
    const baseFeatures: string[] = [];
    
    if (features.profiles) {
      baseFeatures.push(`${features.profiles} user profile${features.profiles > 1 ? 's' : ''}`);
    }
    
    if (features.quality) {
      baseFeatures.push(`${features.quality} quality streaming`);
    }
    
    if (features.maxDevices) {
      baseFeatures.push(`Watch on ${features.maxDevices} device${features.maxDevices > 1 ? 's' : ''}`);
    }
    
    if (features.fullLibrary) {
      baseFeatures.push('Complete content library');
    } else if (planId === 'free') {
      baseFeatures.push('Limited content library');
    } else {
      baseFeatures.push('Extended content library');
    }
    
    if (features.adFree) {
      baseFeatures.push('Ad-free experience');
    } else if (planId === 'free') {
      baseFeatures.push('Ads included');
    } else {
      baseFeatures.push('Limited ads');
    }
    
    if (features.offlineDownloads) {
      if (typeof features.offlineDownloads === 'number') {
        baseFeatures.push(`Download up to ${features.offlineDownloads} titles`);
      } else {
        baseFeatures.push('Offline downloads available');
      }
    }
    
    if (features.groupWatch) {
      baseFeatures.push('Group watch feature');
    }
    
    if (features.kidsProfiles) {
      baseFeatures.push('Kids profiles with parental controls');
    }
    
    if (features.prioritySupport) {
      baseFeatures.push('Priority support');
    }
    
    if (features.earlyAccess) {
      baseFeatures.push('Early access to new releases');
    }
    
    if (plan.freeTrial) {
      baseFeatures.push(`${plan.freeTrial}-day free trial`);
    }
    
    return baseFeatures;
  };

  // Default gradients and icons based on plan
  const planDefaults = {
    free: {
      gradient: { from: '#6b7280', to: '#4b5563' },
      icon: 'Play',
      description: 'Get started with basic streaming features at no cost'
    },
    basic: {
      gradient: { from: '#3b82f6', to: '#1d4ed8' },
      icon: 'Monitor',
      description: 'Essential streaming with HD quality and multiple devices'
    },
    premium: {
      gradient: { from: '#8b5cf6', to: '#7c3aed' },
      icon: 'Crown',
      description: 'Full HD streaming with complete library access and downloads',
      popularBadge: true
    },
    family: {
      gradient: { from: '#f59e0b', to: '#d97706' },
      icon: 'Users',
      description: 'Ultimate 4K experience with unlimited profiles and early access'
    }
  };

  const defaults = planDefaults[plan.id as keyof typeof planDefaults] || planDefaults.basic;

  return {
    ...plan,
    yearlyPrice: plan.price > 0 ? Math.round(plan.price * 10) : 0, // 10 months price for yearly
    yearlyDiscount: plan.price > 0 ? 17 : undefined,
    popularBadge: (defaults as any).popularBadge || false,
    gradient: defaults.gradient,
    icon: defaults.icon,
    description: defaults.description,
    ctaText: plan.price === 0 ? 'Get Started' : `Choose ${plan.name.split(' ')[0]}`,
    featureList: getFeatureList(plan.id, plan.features)
  };
};

interface UseSubscriptionDataOptions {
  source?: 'constants' | 'api' | 'custom';
  customPlans?: SubscriptionPlan[] | EnhancedSubscriptionPlan[];
  apiEndpoint?: string;
}

interface UseSubscriptionDataReturn {
  plans: EnhancedSubscriptionPlan[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useSubscriptionData = (
  options: UseSubscriptionDataOptions = {}
): UseSubscriptionDataReturn => {
  const { source = 'constants', customPlans, apiEndpoint } = options;
  
  const [plans, setPlans] = useState<EnhancedSubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);

    try {
      switch (source) {
        case 'constants':
          // Use enhanced plans if available, otherwise convert basic plans
          if (ENHANCED_SUBSCRIPTION_PLANS && ENHANCED_SUBSCRIPTION_PLANS.length > 0) {
            setPlans(ENHANCED_SUBSCRIPTION_PLANS);
          } else {
            setPlans(SUBSCRIPTION_PLANS.map(convertToEnhancedPlan));
          }
          break;

        case 'api':
          if (!apiEndpoint) {
            throw new Error('API endpoint is required when source is "api"');
          }
          
          const response = await fetch(apiEndpoint);
          if (!response.ok) {
            throw new Error(`Failed to fetch plans: ${response.statusText}`);
          }
          
          const data = await response.json();
          const fetchedPlans = Array.isArray(data) ? data : data.plans || [];
          
          // Convert to enhanced plans if they're basic plans
          const enhancedPlans = fetchedPlans.map((plan: any) => {
            if ('featureList' in plan) {
              return plan as EnhancedSubscriptionPlan;
            }
            return convertToEnhancedPlan(plan as SubscriptionPlan);
          });
          
          setPlans(enhancedPlans);
          break;

        case 'custom':
          if (!customPlans || customPlans.length === 0) {
            throw new Error('Custom plans are required when source is "custom"');
          }
          
          // Convert to enhanced plans if they're basic plans
          const processedPlans = customPlans.map((plan: any) => {
            if ('featureList' in plan) {
              return plan as EnhancedSubscriptionPlan;
            }
            return convertToEnhancedPlan(plan as SubscriptionPlan);
          });
          
          setPlans(processedPlans);
          break;

        default:
          throw new Error(`Unknown source: ${source}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load subscription plans';
      setError(errorMessage);
      console.error('Error fetching subscription plans:', err);
      
      // Fallback to constants on error
      if (source !== 'constants') {
        setPlans(ENHANCED_SUBSCRIPTION_PLANS.length > 0 
          ? ENHANCED_SUBSCRIPTION_PLANS 
          : SUBSCRIPTION_PLANS.map(convertToEnhancedPlan)
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [source, apiEndpoint, customPlans]);

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans
  };
};

export default useSubscriptionData;