/**
 * Animation library index
 * Exports all GSAP animation utilities, configurations, and types
 */

// Configuration exports
export {
  ANIMATION_CONFIG,
  TIMING_PRESETS,
  REDUCED_MOTION_CONFIG,
} from "./config";

// Utility function exports
export {
  prefersReducedMotion,
  getAnimationConfig,
  getAnimationValue,
  createPageEntranceTimeline,
  createCardHoverAnimation,
  createBillingToggleAnimation,
  createScrollTriggerAnimation,
  createAccordionAnimation,
  createModalAnimation,
  cleanupAnimations,
  setPerformanceOptimizations,
  removePerformanceOptimizations,
} from "./utils";

// Type exports
export type {
  AnimationConfig,
  AnimationDuration,
  AnimationEasing,
  AnimationStagger,
  AnimationTransform,
  AnimationEffects,
  ScrollTriggerConfig,
  PerformanceConfig,
  TimingPreset,
  TimingPresets,
  PageEntranceRefs,
  CardHoverAnimations,
  AnimationRefs,
  AnimatedPricingCardProps,
  CardAnimations,
  BillingToggleProps,
  ToggleAnimations,
  AnimatedComparisonTableProps,
  ComparisonFeature,
  AnimatedFAQProps,
  FAQItem,
  AnimatedModalProps,
  SubscriptionPlan,
  AnimationState,
  ScrollAnimationState,
  UseAnimationReturn,
  UseScrollAnimationReturn,
  AnimationPerformanceMetrics,
  PerformanceMonitorConfig,
  AccessibilityConfig,
  ReducedMotionConfig,
  AnimationEventHandlers,
  ScrollAnimationType,
  AnimationDirection,
  BillingCycle,
  EasingFunction,
} from "./types";

// Re-export GSAP for convenience
export { gsap } from "gsap";
export { ScrollTrigger } from "gsap/ScrollTrigger";
