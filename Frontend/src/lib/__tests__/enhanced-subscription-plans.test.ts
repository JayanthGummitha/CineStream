import { ENHANCED_SUBSCRIPTION_PLANS, ANIMATION_CONFIG, PRICING_ANIMATIONS, SUBSCRIPTION_PAGE_CONFIG } from '../constants';
import { EnhancedSubscriptionPlan } from '../../types';

describe('Enhanced Subscription Plans', () => {
  describe('ENHANCED_SUBSCRIPTION_PLANS', () => {
    it('should have all required plans', () => {
      expect(ENHANCED_SUBSCRIPTION_PLANS).toHaveLength(4);
      
      const planIds = ENHANCED_SUBSCRIPTION_PLANS.map(plan => plan.id);
      expect(planIds).toEqual(['free', 'basic', 'premium', 'family']);
    });

    it('should have yearly pricing for paid plans', () => {
      const paidPlans = ENHANCED_SUBSCRIPTION_PLANS.filter(plan => plan.id !== 'free');
      
      paidPlans.forEach(plan => {
        expect(plan.yearlyPrice).toBeDefined();
        expect(plan.yearlyDiscount).toBeDefined();
        expect(plan.yearlyDiscount).toBeGreaterThan(0);
      });
    });

    it('should have gradient colors for all plans', () => {
      ENHANCED_SUBSCRIPTION_PLANS.forEach(plan => {
        expect(plan.gradient).toBeDefined();
        expect(plan.gradient?.from).toBeDefined();
        expect(plan.gradient?.to).toBeDefined();
      });
    });

    it('should have icons and descriptions for all plans', () => {
      ENHANCED_SUBSCRIPTION_PLANS.forEach(plan => {
        expect(plan.icon).toBeDefined();
        expect(plan.description).toBeDefined();
        expect(plan.ctaText).toBeDefined();
        expect(plan.featureList).toBeDefined();
        expect(Array.isArray(plan.featureList)).toBe(true);
      });
    });

    it('should have premium plan marked as popular', () => {
      const premiumPlan = ENHANCED_SUBSCRIPTION_PLANS.find(plan => plan.id === 'premium');
      expect(premiumPlan?.popularBadge).toBe(true);
    });

    it('should have free trial for paid plans', () => {
      const paidPlans = ENHANCED_SUBSCRIPTION_PLANS.filter(plan => plan.id !== 'free');
      
      paidPlans.forEach(plan => {
        expect(plan.freeTrial).toBe(14);
      });
    });
  });

  describe('ANIMATION_CONFIG', () => {
    it('should have all required animation configuration', () => {
      expect(ANIMATION_CONFIG.duration).toBeDefined();
      expect(ANIMATION_CONFIG.easing).toBeDefined();
      expect(ANIMATION_CONFIG.stagger).toBeDefined();
    });

    it('should have valid duration values', () => {
      expect(ANIMATION_CONFIG.duration.entrance).toBeGreaterThan(0);
      expect(ANIMATION_CONFIG.duration.hover).toBeGreaterThan(0);
      expect(ANIMATION_CONFIG.duration.transition).toBeGreaterThan(0);
    });

    it('should have valid stagger values', () => {
      expect(ANIMATION_CONFIG.stagger.cards).toBeGreaterThan(0);
      expect(ANIMATION_CONFIG.stagger.features).toBeGreaterThan(0);
      expect(ANIMATION_CONFIG.stagger.tableRows).toBeGreaterThan(0);
    });
  });

  describe('PRICING_ANIMATIONS', () => {
    it('should have page entrance configuration', () => {
      expect(PRICING_ANIMATIONS.pageEntrance).toBeDefined();
      expect(PRICING_ANIMATIONS.pageEntrance.headerDelay).toBeDefined();
      expect(PRICING_ANIMATIONS.pageEntrance.toggleDelay).toBeDefined();
      expect(PRICING_ANIMATIONS.pageEntrance.cardsDelay).toBeDefined();
    });

    it('should have card animation configuration', () => {
      expect(PRICING_ANIMATIONS.card).toBeDefined();
      expect(PRICING_ANIMATIONS.card.hoverScale).toBeGreaterThan(1);
      expect(PRICING_ANIMATIONS.card.hoverY).toBeLessThan(0);
    });

    it('should have billing toggle configuration', () => {
      expect(PRICING_ANIMATIONS.toggle).toBeDefined();
      expect(PRICING_ANIMATIONS.toggle.switchDuration).toBeGreaterThan(0);
      expect(PRICING_ANIMATIONS.toggle.priceScaleDuration).toBeGreaterThan(0);
    });

    it('should have performance settings', () => {
      expect(PRICING_ANIMATIONS.performance).toBeDefined();
      expect(PRICING_ANIMATIONS.performance.targetFPS).toBe(60);
      expect(PRICING_ANIMATIONS.performance.reducedMotionFallback).toBe(true);
    });
  });

  describe('SUBSCRIPTION_PAGE_CONFIG', () => {
    it('should have comparison features', () => {
      expect(SUBSCRIPTION_PAGE_CONFIG.comparisonFeatures).toBeDefined();
      expect(Array.isArray(SUBSCRIPTION_PAGE_CONFIG.comparisonFeatures)).toBe(true);
      expect(SUBSCRIPTION_PAGE_CONFIG.comparisonFeatures.length).toBeGreaterThan(0);
    });

    it('should have trust indicators', () => {
      expect(SUBSCRIPTION_PAGE_CONFIG.trustIndicators).toBeDefined();
      expect(Array.isArray(SUBSCRIPTION_PAGE_CONFIG.trustIndicators)).toBe(true);
      expect(SUBSCRIPTION_PAGE_CONFIG.trustIndicators.length).toBeGreaterThan(0);
    });

    it('should have FAQ items', () => {
      expect(SUBSCRIPTION_PAGE_CONFIG.faqItems).toBeDefined();
      expect(Array.isArray(SUBSCRIPTION_PAGE_CONFIG.faqItems)).toBe(true);
      expect(SUBSCRIPTION_PAGE_CONFIG.faqItems.length).toBeGreaterThan(0);
    });

    it('should have enterprise contact information', () => {
      expect(SUBSCRIPTION_PAGE_CONFIG.enterpriseContact).toBeDefined();
      expect(SUBSCRIPTION_PAGE_CONFIG.enterpriseContact.title).toBeDefined();
      expect(SUBSCRIPTION_PAGE_CONFIG.enterpriseContact.email).toBeDefined();
      expect(SUBSCRIPTION_PAGE_CONFIG.enterpriseContact.phone).toBeDefined();
    });
  });

  describe('Plan Feature Validation', () => {
    it('should have increasing feature sets across plans', () => {
      const [free, basic, premium, family] = ENHANCED_SUBSCRIPTION_PLANS;

      // Profiles should increase
      expect(free.features.profiles).toBeLessThan(basic.features.profiles);
      expect(basic.features.profiles).toBeLessThanOrEqual(premium.features.profiles);
      expect(premium.features.profiles).toBeLessThan(family.features.profiles);

      // Devices should increase
      expect(free.features.maxDevices).toBeLessThan(basic.features.maxDevices);
      expect(basic.features.maxDevices).toBeLessThanOrEqual(premium.features.maxDevices);
      expect(premium.features.maxDevices).toBeLessThanOrEqual(family.features.maxDevices);

      // Premium features should be available in higher tiers
      expect(premium.features.adFree).toBe(true);
      expect(family.features.adFree).toBe(true);
      expect(family.features.earlyAccess).toBe(true);
    });

    it('should have proper pricing structure', () => {
      const paidPlans = ENHANCED_SUBSCRIPTION_PLANS.filter(plan => plan.id !== 'free');
      
      // Prices should increase across tiers
      for (let i = 1; i < paidPlans.length; i++) {
        expect(paidPlans[i].price).toBeGreaterThan(paidPlans[i - 1].price);
        if (paidPlans[i].yearlyPrice && paidPlans[i - 1].yearlyPrice) {
          expect(paidPlans[i].yearlyPrice!).toBeGreaterThan(paidPlans[i - 1].yearlyPrice!);
        }
      }
    });
  });
});