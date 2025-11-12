/**
 * TypeScript interfaces for GSAP animations and configurations
 * Used throughout the subscription page enhancement
 */

import { RefObject } from "react";

// Base animation configuration interfaces
export interface AnimationDuration {
  entrance: number;
  hover: number;
  transition: number;
  toggle: number;
  accordion: number;
  modal: number;
}

export interface AnimationEasing {
  entrance: string;
  hover: string;
  transition: string;
  toggle: string;
  accordion: string;
  modal: string;
}

export interface AnimationStagger {
  cards: number;
  features: number;
  tableRows: number;
  faqItems: number;
  trustIndicators: number;
}

export interface AnimationTransform {
  cardHover: {
    y: number;
    scale: number;
  };
  cardEntrance: {
    y: number;
    scale: number;
  };
  headerEntrance: {
    y: number;
  };
  toggleScale: number;
}

export interface AnimationEffects {
  shadows: {
    default: string;
    hover: string;
    glow: string;
  };
  opacity: {
    hidden: number;
    visible: number;
    muted: number;
    glow: number;
  };
}

export interface ScrollTriggerConfig {
  start: string;
  startFaq: string;
  startTable: string;
}

export interface PerformanceConfig {
  force3D: boolean;
  willChange: string;
  backfaceVisibility: string;
}

// Main animation configuration interface
export interface AnimationConfig {
  duration: AnimationDuration;
  easing: AnimationEasing;
  stagger: AnimationStagger;
  transform: AnimationTransform;
  effects: AnimationEffects;
  scrollTrigger: ScrollTriggerConfig;
  performance: PerformanceConfig;
}

// Timing preset interface
export interface TimingPreset {
  duration: number;
  ease: string;
}

export interface TimingPresets {
  micro: TimingPreset;
  standard: TimingPreset;
  entrance: TimingPreset;
  bouncy: TimingPreset;
  page: TimingPreset;
}

// Component-specific animation interfaces
export interface PageEntranceRefs {
  header?: RefObject<HTMLElement>;
  toggle?: RefObject<HTMLElement>;
  cards?: RefObject<HTMLElement>;
}

export interface CardHoverAnimations {
  hoverIn: () => void;
  hoverOut: () => void;
}

export interface AnimationRefs {
  headerRef: RefObject<HTMLDivElement>;
  cardsRef: RefObject<HTMLDivElement>;
  tableRef: RefObject<HTMLDivElement>;
  toggleRef: RefObject<HTMLDivElement>;
}

// Pricing card animation props
export interface AnimatedPricingCardProps {
  plan: SubscriptionPlan;
  billingCycle: "monthly" | "yearly";
  isHighlighted?: boolean;
  animationDelay?: number;
  onSelect: (planId: string) => void;
  className?: string;
}

export interface CardAnimations {
  entrance: any;
  hover: any;
  selection: any;
}

// Billing toggle animation props
export interface BillingToggleProps {
  value: "monthly" | "yearly";
  onChange: (value: "monthly" | "yearly") => void;
  showSavings?: boolean;
  className?: string;
}

export interface ToggleAnimations {
  switch: any;
  priceUpdate: any;
  savingsBadge: any;
}

// Comparison table animation props
export interface AnimatedComparisonTableProps {
  plans: SubscriptionPlan[];
  billingCycle: "monthly" | "yearly";
  features: ComparisonFeature[];
  className?: string;
}

export interface ComparisonFeature {
  id: string;
  name: string;
  description?: string;
  type: "boolean" | "text" | "number";
  plans: Record<string, boolean | string | number>;
}

// FAQ animation props
export interface AnimatedFAQProps {
  items: FAQItem[];
  className?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

// Modal animation props
export interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

// Subscription plan interface (enhanced)
export interface SubscriptionPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice?: number;
  yearlyDiscount?: number;
  features: string[];
  popularBadge?: boolean;
  gradient?: {
    from: string;
    to: string;
  };
  icon?: string;
  description?: string;
  ctaText?: string;
  trialDays?: number;
}

// Animation state interfaces
export interface AnimationState {
  isAnimating: boolean;
  currentAnimation?: any;
  animationQueue: (() => void)[];
}

export interface ScrollAnimationState {
  hasTriggered: boolean;
  scrollTrigger?: ScrollTrigger;
}

// Hook interfaces for animation management
export interface UseAnimationReturn {
  isAnimating: boolean;
  playAnimation: (animation: any) => Promise<void>;
  stopAnimation: () => void;
  queueAnimation: (animationFn: () => void) => void;
}

export interface UseScrollAnimationReturn {
  ref: RefObject<HTMLElement>;
  hasTriggered: boolean;
  trigger: () => void;
  reset: () => void;
}

// Performance monitoring interfaces
export interface AnimationPerformanceMetrics {
  fps: number;
  duration: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

export interface PerformanceMonitorConfig {
  enableFPSMonitoring: boolean;
  enableMemoryMonitoring: boolean;
  warningThreshold: number;
  errorThreshold: number;
}

// Accessibility interfaces
export interface AccessibilityConfig {
  respectReducedMotion: boolean;
  provideFallbacks: boolean;
  announceAnimations: boolean;
  keyboardNavigation: boolean;
}

export interface ReducedMotionConfig {
  duration: {
    entrance: number;
    hover: number;
    transition: number;
  };
  easing: {
    all: string;
  };
  stagger: {
    all: number;
  };
}

// Animation event interfaces
export interface AnimationEventHandlers {
  onStart?: () => void;
  onComplete?: () => void;
  onUpdate?: (progress: number) => void;
  onError?: (error: Error) => void;
}

// Scroll trigger animation types
export type ScrollAnimationType = "table" | "faq" | "trust" | "cards";

// Animation direction types
export type AnimationDirection = "in" | "out" | "toggle";

// Billing cycle type
export type BillingCycle = "monthly" | "yearly";

// Animation timing function types
export type EasingFunction = 
  | "none"
  | "power1.in" | "power1.out" | "power1.inOut"
  | "power2.in" | "power2.out" | "power2.inOut"
  | "power3.in" | "power3.out" | "power3.inOut"
  | "power4.in" | "power4.out" | "power4.inOut"
  | "back.in(1.7)" | "back.out(1.7)" | "back.inOut(1.7)"
  | "elastic.in(1, 0.3)" | "elastic.out(1, 0.3)" | "elastic.inOut(1, 0.3)"
  | "bounce.in" | "bounce.out" | "bounce.inOut"
  | "circ.in" | "circ.out" | "circ.inOut"
  | "expo.in" | "expo.out" | "expo.inOut"
  | "sine.in" | "sine.out" | "sine.inOut";

// Export commonly used types
// Note: GSAP types are handled internally