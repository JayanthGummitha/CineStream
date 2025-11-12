/**
 * Pricing Plans Data
 *
 * Subscription pricing plan configurations for CineStream.
 * Includes four tiers: Free, Basic, Premium, and Family.
 */

import { PricingPlanData } from "@/types/pricing";
import {
  SubscriptionPlan,
 
  EnhancedSubscriptionPlan,
  
  
 
} from "@/types/pricing";

/**
 * All available pricing plans
 */

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free Plan",
    price: 0,
    currency: "USD",
    billing: "monthly",
    freeTrial: 14,
    features: {
      profiles: 1,
      maxDevices: 1,
      quality: "SD",
      fullLibrary: false,
      offlineDownloads: false,
      adFree: false,
      groupWatch: false,
      prioritySupport: false,
      kidsProfiles: false,
      earlyAccess: false,
    },
  },
  {
    id: "basic",
    name: "Basic Plan",
    price: 4.99,
    currency: "USD",
    billing: "monthly",
    freeTrial: 14,
    features: {
      profiles: 2,
      maxDevices: 2,
      quality: "720p",
      fullLibrary: false,
      offlineDownloads: false,
      adFree: false,
      groupWatch: false,
      prioritySupport: false,
      kidsProfiles: false,
      earlyAccess: false,
    },
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: 9.99,
    currency: "USD",
    billing: "monthly",
    features: {
      profiles: 3,
      maxDevices: 3,
      quality: "1080p",
      fullLibrary: true,
      offlineDownloads: 3,
      adFree: true,
      groupWatch: true,
      prioritySupport: true,
      kidsProfiles: true,
      earlyAccess: false,
    },
  },
  {
    id: "family",
    name: "Family Plan",
    price: 15.99,
    currency: "USD",
    billing: "monthly",
    features: {
      profiles: 5,
      maxDevices: 5,
      quality: "4K UHD",
      fullLibrary: true,
      offlineDownloads: 10,
      adFree: true,
      groupWatch: true,
      prioritySupport: true,
      kidsProfiles: true,
      earlyAccess: true,
    },
  },
];
export const pricingPlans: PricingPlanData[] = [
  // {
  //   id: "free",
  //   name: "Free Plan",
  //   monthlyPrice: 0.00,
  //   yearlyPrice: 0.00,
  //   savingsPercentage: 17,
  //   badge: {
  //     text: "Save 17%",
  //     color: "yellow",
  //   },
  //   description: "Essential streaming with HD quality and multiple devices",
  //   features: [
  //     { text: "Extended content library", included: false },
  //     { text: "1 user profiles", included: true },
  //     { text: "SD quality streaming", included: true },
  //     { text: "Watch on 1 devices", included: true },
  //     { text: "Limited ads", included: true },
  //     { text: "14-day free trial", included: true },
  //     { text: "Full HD (1080p)", included: false },
  //     { text: "Offline downloads", included: false },
  //     { text: "Ad-free experience", included: false },
  //   ],
  //   cta: {
  //     text: "Start Free Trial",
  //     variant: "secondary",
  //   },
  //   isHighlighted: false,
  // },
  {
    id: "basic",
    name: "Basic Plan",
    monthlyPrice: 4.99,
    yearlyPrice: 49.99,
    savingsPercentage: 17,
    description: "Essential streaming with HD quality and multiple devices",
    features: [
      { text: "Extended content library", included: true },
      { text: "2 user profiles", included: true },
      { text: "HD quality streaming", included: true },
      { text: "Watch on 2 devices", included: true },
      { text: "Limited ads", included: true },
      { text: "14-day free trial", included: true },
      { text: "Full HD (1080p)", included: false },
      { text: "Offline downloads", included: false },
      { text: "Ad-free experience", included: false },
    ],
    cta: {
      text: "Start Free Trial",
      variant: "secondary",
    },
    isHighlighted: false,
  },
  {
    id: "premium",
    name: "Premium Plan",
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    savingsPercentage: 17,
    badge: {
      text: "Popular",
      color: "green",
    },
    description: "Full HD streaming with complete library access and downloads",
    features: [
      { text: "Complete content library", included: true },
      { text: "3 user profiles", included: true },
      { text: "Full HD streaming", included: true },
      { text: "Watch on 3 devices", included: true },
      { text: "Ad-free experience", included: true },
      { text: "Download up to 3 titles", included: true },
      { text: "Group watch feature", included: true },
      { text: "Kids profiles", included: true },
      { text: "Priority support", included: true },
    ],
    cta: {
      text: "Choose Premium",
      variant: "primary",
    },
    isHighlighted: true,
  },
  {
    id: "family",
    name: "Family Plan",
    monthlyPrice: 15.99,
    yearlyPrice: 159.99,
    savingsPercentage: 17,
    badge: {
      text: "Save 17%",
      color: "yellow",
    },
    description:
      "Ultimate 4K experience with unlimited profiles and early access",
    features: [
      { text: "Complete content library", included: true },
      { text: "5 user profiles", included: true },
      { text: "4K UHD streaming", included: true },
      { text: "Watch on 5 devices", included: true },
      { text: "Ad-free experience", included: true },
      { text: "Download up to 10 titles", included: true },
      { text: "Group watch feature", included: true },
      { text: "Kids profiles with parental controls", included: true },
      { text: "Priority support", included: true },
      { text: "Early access to new releases", included: true },
    ],
    cta: {
      text: "Choose Family",
      variant: "primary",
    },
    isHighlighted: false,
  },
];

/**
 * Get a specific pricing plan by ID
 */
export const getPlanById = (planId: string): PricingPlanData | undefined => {
  return pricingPlans.find((plan) => plan.id === planId);
};

/**
 * Get the highlighted pricing plan
 */
export const getHighlightedPlan = (): PricingPlanData | undefined => {
  return pricingPlans.find((plan) => plan.isHighlighted);
};
