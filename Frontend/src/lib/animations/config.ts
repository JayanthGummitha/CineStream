/**
 * Animation configuration constants for GSAP animations
 * Used throughout the subscription page enhancement
 */

export const ANIMATION_CONFIG = {
  // Duration constants (in seconds)
  duration: {
    entrance: 0.8,
    hover: 0.3,
    transition: 0.6,
    toggle: 0.3,
    accordion: 0.4,
    modal: 0.5,
  },
  
  // Easing functions
  easing: {
    entrance: "power2.out",
    hover: "power2.inOut",
    transition: "back.out(1.7)",
    toggle: "power2.inOut",
    accordion: "power2.inOut",
    modal: "power3.out",
  },
  
  // Stagger timing for sequential animations
  stagger: {
    cards: 0.1,
    features: 0.05,
    tableRows: 0.08,
    faqItems: 0.15,
    trustIndicators: 0.2,
  },
  
  // Transform values
  transform: {
    cardHover: {
      y: -8,
      scale: 1.02,
    },
    cardEntrance: {
      y: 30,
      scale: 0.95,
    },
    headerEntrance: {
      y: -50,
    },
    toggleScale: 0.9,
  },
  
  // Shadow and glow effects
  effects: {
    shadows: {
      default: "0 4px 12px rgba(0,0,0,0.1)",
      hover: "0 20px 40px rgba(0,0,0,0.3)",
      glow: "0 0 30px rgba(59, 130, 246, 0.3)",
    },
    opacity: {
      hidden: 0,
      visible: 1,
      muted: 0.5,
      glow: 0.6,
    },
  },
  
  // Scroll trigger settings
  scrollTrigger: {
    start: "top 80%",
    startFaq: "top 85%",
    startTable: "top 75%",
  },
  
  // Performance settings
  performance: {
    force3D: true,
    willChange: "transform, opacity",
    backfaceVisibility: "hidden",
  },
} as const;

// Animation timing presets for common patterns
export const TIMING_PRESETS = {
  // Quick micro-interactions
  micro: {
    duration: 0.2,
    ease: "power2.out",
  },
  
  // Standard UI transitions
  standard: {
    duration: 0.3,
    ease: "power2.inOut",
  },
  
  // Entrance animations
  entrance: {
    duration: 0.6,
    ease: "power2.out",
  },
  
  // Bouncy interactions
  bouncy: {
    duration: 0.4,
    ease: "back.out(1.7)",
  },
  
  // Smooth page transitions
  page: {
    duration: 0.8,
    ease: "power3.out",
  },
} as const;

// Reduced motion fallbacks
export const REDUCED_MOTION_CONFIG = {
  duration: {
    entrance: 0.01,
    hover: 0.01,
    transition: 0.01,
  },
  easing: {
    all: "none",
  },
  stagger: {
    all: 0,
  },
} as const;