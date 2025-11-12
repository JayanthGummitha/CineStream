/**
 * GSAP animation utilities for the subscription page enhancement
 * Provides reusable animation functions and helpers
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ANIMATION_CONFIG, TIMING_PRESETS, REDUCED_MOTION_CONFIG } from "./config";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Get animation config based on user preferences
 */
export const getAnimationConfig = () => {
  return prefersReducedMotion() ? REDUCED_MOTION_CONFIG : ANIMATION_CONFIG;
};

/**
 * Type guard to check if config has full animation properties
 */
const isFullConfig = (config: any): config is typeof ANIMATION_CONFIG => {
  return 'effects' in config && 'transform' in config;
};

/**
 * Safe getter for animation values with fallbacks
 */
export const getAnimationValue = (config: any, path: string, fallback: any) => {
  if (isFullConfig(config)) {
    const keys = path.split('.');
    let value: any = config;
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) return fallback;
    }
    return value;
  }
  return fallback;
};

/**
 * Create a master timeline for page entrance animations
 */
export const createPageEntranceTimeline = (refs: {
  header?: React.RefObject<HTMLElement | null>;
  toggle?: React.RefObject<HTMLElement | null>;
  cards?: React.RefObject<HTMLElement | null>;
}) => {
  const config = getAnimationConfig();
  const tl = gsap.timeline({ paused: true });

  // Header animation
  if (refs.header?.current) {
    tl.fromTo(
      refs.header.current,
      { 
        opacity: 0, 
        y: -50 
      },
      {
        opacity: 1,
        y: 0,
        duration: config.duration.entrance,
        ease: getAnimationValue(config, 'easing.entrance', 'none'),
      }
    );
  }

  // Toggle animation
  if (refs.toggle?.current) {
    tl.fromTo(
      refs.toggle.current,
      { 
        opacity: 0, 
        scale: 0.9 
      },
      {
        opacity: 1,
        scale: 1,
        duration: getAnimationValue(config, 'duration.transition', config.duration.entrance),
        ease: getAnimationValue(config, 'easing.transition', 'none'),
      },
      "-=0.4"
    );
  }

  // Cards staggered animation
  if (refs.cards?.current) {
    const cards = refs.cards.current.querySelectorAll(".pricing-card");
    if (cards.length > 0) {
      tl.fromTo(
        cards,
        {
          opacity: 0,
          y: 30,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: config.duration.entrance,
          stagger: getAnimationValue(config, 'stagger.cards', 0),
          ease: getAnimationValue(config, 'easing.entrance', 'none'),
        },
        "-=0.3"
      );
    }
  }

  return tl;
};

/**
 * Create hover animation for pricing cards
 */
export const createCardHoverAnimation = (element: HTMLElement) => {
  const config = getAnimationConfig();
  
  const hoverIn = () => {
    gsap.to(element, {
      y: -8,
      scale: 1.02,
      boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
      duration: config.duration.hover,
      ease: getAnimationValue(config, 'easing.hover', 'none'),
    });

    const glow = element.querySelector(".card-glow");
    if (glow) {
      gsap.to(glow, {
        opacity: 0.6,
        duration: config.duration.hover,
        ease: getAnimationValue(config, 'easing.hover', 'none'),
      });
    }
  };

  const hoverOut = () => {
    gsap.to(element, {
      y: 0,
      scale: 1,
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      duration: config.duration.hover,
      ease: getAnimationValue(config, 'easing.hover', 'none'),
    });

    const glow = element.querySelector(".card-glow");
    if (glow) {
      gsap.to(glow, {
        opacity: 0,
        duration: config.duration.hover,
        ease: getAnimationValue(config, 'easing.hover', 'none'),
      });
    }
  };

  return { hoverIn, hoverOut };
};

/**
 * Create billing toggle animation
 */
export const createBillingToggleAnimation = (
  toggleElement: HTMLElement,
  priceElements: NodeListOf<Element> | Element[],
  savingsBadges: NodeListOf<Element> | Element[],
  newBilling: "monthly" | "yearly"
) => {
  const config = getAnimationConfig();
  const tl = gsap.timeline();

  // Animate toggle switch
  tl.to(toggleElement, {
    x: newBilling === "yearly" ? "100%" : "0%",
    duration: getAnimationValue(config, 'duration.toggle', config.duration.hover),
    ease: getAnimationValue(config, 'easing.toggle', 'none'),
  });

  // Animate price changes
  tl.to(
    priceElements,
    {
      scale: 0.8,
      opacity: 0.5,
      duration: config.duration.hover,
      ease: "power2.in",
    },
    0
  );

  // Animate prices back after update
  tl.to(priceElements, {
    scale: 1,
    opacity: 1,
    duration: getAnimationValue(config, 'duration.transition', config.duration.entrance),
    ease: getAnimationValue(config, 'easing.transition', 'none'),
  });

  // Show/hide savings badges
  if (newBilling === "yearly" && savingsBadges.length > 0) {
    tl.fromTo(
      savingsBadges,
      { 
        opacity: 0, 
        scale: 0.8 
      },
      {
        opacity: 1,
        scale: 1,
        duration: getAnimationValue(config, 'duration.transition', config.duration.entrance),
        ease: getAnimationValue(config, 'easing.transition', 'none'),
        stagger: getAnimationValue(config, 'stagger.cards', 0),
      },
      "-=0.2"
    );
  } else if (newBilling === "monthly" && savingsBadges.length > 0) {
    tl.to(savingsBadges, {
      opacity: 0,
      scale: 0.8,
      duration: config.duration.hover,
      ease: "power2.in",
    });
  }

  return tl;
};

/**
 * Create scroll-triggered animations
 */
export const createScrollTriggerAnimation = (
  trigger: string | Element,
  targets: string | Element | Element[],
  animationType: "table" | "faq" | "trust" = "table"
) => {
  const config = getAnimationConfig();
  
  let startPosition = "top 80%";
  let staggerValue = 0;

  switch (animationType) {
    case "table":
      startPosition = getAnimationValue(config, 'scrollTrigger.start', 'top 80%');
      staggerValue = getAnimationValue(config, 'stagger.tableRows', 0);
      break;
    case "faq":
      startPosition = getAnimationValue(config, 'scrollTrigger.startFaq', 'top 85%');
      staggerValue = getAnimationValue(config, 'stagger.faqItems', 0);
      break;
    case "trust":
      startPosition = getAnimationValue(config, 'scrollTrigger.start', 'top 80%');
      staggerValue = getAnimationValue(config, 'stagger.trustIndicators', 0);
      break;
  }

  return ScrollTrigger.create({
    trigger,
    start: startPosition,
    onEnter: () => {
      gsap.fromTo(
        targets,
        { 
          opacity: 0, 
          y: 20,
          x: animationType === "table" ? -30 : 0 
        },
        {
          opacity: 1,
          y: 0,
          x: 0,
          duration: config.duration.entrance,
          stagger: staggerValue,
          ease: getAnimationValue(config, 'easing.entrance', 'none'),
        }
      );
    },
  });
};

/**
 * Create accordion animation for FAQ items
 */
export const createAccordionAnimation = (
  content: HTMLElement,
  isOpen: boolean
) => {
  const config = getAnimationConfig();
  
  if (isOpen) {
    gsap.fromTo(
      content,
      { height: 0, opacity: 0 },
      {
        height: "auto",
        opacity: 1,
        duration: getAnimationValue(config, 'duration.accordion', config.duration.entrance),
        ease: getAnimationValue(config, 'easing.accordion', 'none'),
      }
    );
  } else {
    gsap.to(content, {
      height: 0,
      opacity: 0,
      duration: getAnimationValue(config, 'duration.accordion', config.duration.entrance),
      ease: getAnimationValue(config, 'easing.accordion', 'none'),
    });
  }
};

/**
 * Create modal animation
 */
export const createModalAnimation = (
  modal: HTMLElement,
  isOpen: boolean
) => {
  const config = getAnimationConfig();
  
  if (isOpen) {
    gsap.fromTo(
      modal,
      { 
        opacity: 0, 
        scale: 0.9,
        y: 20 
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: getAnimationValue(config, 'duration.modal', config.duration.entrance),
        ease: getAnimationValue(config, 'easing.modal', 'none'),
      }
    );
  } else {
    gsap.to(modal, {
      opacity: 0,
      scale: 0.9,
      y: 20,
      duration: getAnimationValue(config, 'duration.modal', config.duration.entrance),
      ease: getAnimationValue(config, 'easing.modal', 'none'),
    });
  }
};

/**
 * Cleanup function for animations and ScrollTriggers
 */
export const cleanupAnimations = () => {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  gsap.killTweensOf("*");
};

/**
 * Set performance optimizations for animations
 */
export const setPerformanceOptimizations = (element: HTMLElement) => {
  const config = getAnimationConfig();
  
  gsap.set(element, {
    force3D: true,
    backfaceVisibility: "hidden",
  });
  
  // Set will-change property for better performance
  element.style.willChange = "transform, opacity";
};

/**
 * Remove performance optimizations after animation
 */
export const removePerformanceOptimizations = (element: HTMLElement) => {
  element.style.willChange = "auto";
};