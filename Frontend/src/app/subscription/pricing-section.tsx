"use client";

import { Briefcase, CheckCircle2, Users, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidingNumber } from "@/components/ui/sliding-number";
import * as PricingCard from "./pricing-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BillingCycle, PricingPlanData } from "@/types/pricing";
import { useState, useEffect } from "react";
import { PriceDisplay } from "@/components/subscription";

interface PricingSectionProps {
  plans: PricingPlanData[];
  billingCycle: BillingCycle;
  selectedPlan: string | null;
  activePlanId?: string;
  onSelect: (planId: string) => void;
}

export function PricingSection({
  plans,
  billingCycle,
  selectedPlan,
  activePlanId,
  onSelect,
}: PricingSectionProps) {
  // Track previous billing cycle to detect changes
  const [prevBillingCycle, setPrevBillingCycle] = useState<BillingCycle>(billingCycle);
  const [isAnimating, setIsAnimating] = useState(false);

  // Detect billing cycle changes
  useEffect(() => {
    if (prevBillingCycle !== billingCycle) {
      console.log('🎬 Billing cycle changed:', prevBillingCycle, '→', billingCycle);
      setIsAnimating(true);
      setPrevBillingCycle(billingCycle);
      
      // Reset animation flag after animation completes (1.5s duration + buffer)
      const timer = setTimeout(() => {
        console.log('✅ Animation complete');
        setIsAnimating(false);
      }, 1800);

      return () => clearTimeout(timer);
    }
  }, [billingCycle, prevBillingCycle]);

  return (
    <section className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-8 px-4 md:px-8 lg:px-12"
    >
      {plans.map((plan) => {
        const isThisActivePlan = activePlanId === plan.id;

        // Get icon based on plan name
        const getIcon = () => {
          if (plan.name.toLowerCase().includes('basic')) return <Users />;
          if (plan.name.toLowerCase().includes('premium')) return <Crown />;
          return <Briefcase />;
        };

        // Get price based on billing cycle
        const price = billingCycle === 'annual' ? plan.yearlyPrice : plan.monthlyPrice;
        const previousPrice = prevBillingCycle === 'annual' ? plan.yearlyPrice : plan.monthlyPrice;
        const period = billingCycle === 'annual' ? '/year' : '/month';

        return (
          <PricingCard.Card
            key={plan.id}
            className={cn(
              "w-full h-full",
              plan.isHighlighted && "md:scale-105 z-10"
            )}
          >
            <PricingCard.Header>
              <PricingCard.Plan>
                <PricingCard.PlanName>
                  {getIcon()}
                  <span className="text-muted-foreground">{plan.name}</span>
                </PricingCard.PlanName>
                {isThisActivePlan ? (
                  <PricingCard.Badge className=" text-green-500">
                    Active
                  </PricingCard.Badge>
                ) : plan.isHighlighted ? (
                  <PricingCard.Badge>Popular</PricingCard.Badge>
                ) : null}
              </PricingCard.Plan>
              <PricingCard.Price>
                 <PriceDisplay
                        monthlyPrice={plan.monthlyPrice}
                        yearlyPrice={plan.yearlyPrice}
                        originalPrice={plan.originalPrice}
                        billingCycle={billingCycle}
                        savingsPercentage={plan.savingsPercentage}
                        // variant={isDark ? 'dark' : 'light'}
                      />
              
              </PricingCard.Price>
              <Button
                onClick={() => onSelect(plan.id)}
                className={cn("w-full font-semibold","bg-gradient-to-b from-red-500 to-red-600 shadow-red-500"
)}
                variant={isThisActivePlan ? "outline" : "default"}
                disabled={isThisActivePlan}
              >
                {isThisActivePlan ? "Current Plan" : plan.cta.text}
              </Button>
            </PricingCard.Header>
            <PricingCard.Body>
              <PricingCard.Description>
                {plan.description}
              </PricingCard.Description>
              <PricingCard.List>
                {plan.features.map((feature, idx) => {
                  if (!feature.included) return null;
                  
                  return (
                    <PricingCard.ListItem className="text-xs" key={idx}>
                      <CheckCircle2
                        aria-hidden="true"
                        className="h-4 w-4 text-green-500"
                      />
                      <span>{feature.text}</span>
                    </PricingCard.ListItem>
                  );
                })}
              </PricingCard.List>
            </PricingCard.Body>
          </PricingCard.Card>
        );
      })}
    </section>
  );
}
