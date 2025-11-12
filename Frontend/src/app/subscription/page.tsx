import { Metadata } from 'next';
import ResponsivePricingPage from '@/components/subscription/ResponsivePricingPage';
import { pricingPlans } from '@/constants/pricingPlans';

export const metadata: Metadata = {
  title: 'Subscription Plans - CineStream',
  description: 'Choose the perfect plan for your streaming needs. Compare our subscription tiers and find the best value for premium entertainment.',
};

export default function SubscriptionPage() {
  // TODO: Replace with actual user's active plan from authentication/database
  // Set to undefined when user has no active subscription
  const userActivePlanId = undefined; // No active subscription by default

  return <ResponsivePricingPage plans={pricingPlans} activePlanId={userActivePlanId} />;
}
