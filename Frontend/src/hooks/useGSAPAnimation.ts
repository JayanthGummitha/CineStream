import { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  prefersReducedMotion,
  createPageEntranceTimeline,
  createCardHoverAnimation,
  createScrollTriggerAnimation,
  createBillingToggleAnimation,
  cleanupAnimations
} from '@/lib/animations';

/**
 * Custom hook for managing GSAP animations with proper cleanup
 */
export function useGSAPAnimation() {
  const timelineRef = useRef<GSAPTimeline | null>(null);
  const scrollTriggersRef = useRef<ScrollTrigger[]>([]);

  // Initialize GSAP settings
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      scrollTriggersRef.current.forEach(trigger => trigger.kill());
      scrollTriggersRef.current = [];
      cleanupAnimations();
    };
  }, []);

  // Create a new timeline
  const createTimeline = useCallback((vars?: gsap.TimelineVars) => {
    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    timelineRef.current = gsap.timeline(vars);
    return timelineRef.current;
  }, []);

  // Add scroll trigger and track it for cleanup
  const addScrollTrigger = useCallback((config: ScrollTrigger.Vars) => {
    const trigger = ScrollTrigger.create(config);
    scrollTriggersRef.current.push(trigger);
    return trigger;
  }, []);

  // Refresh all scroll triggers
  const refreshScrollTriggers = useCallback(() => {
    ScrollTrigger.refresh();
  }, []);

  // Kill all animations
  const killAll = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
    }
    scrollTriggersRef.current.forEach(trigger => trigger.kill());
    scrollTriggersRef.current = [];
  }, []);

  return {
    timeline: timelineRef.current,
    createTimeline,
    addScrollTrigger,
    refreshScrollTriggers,
    killAll,
    // Utility methods
    createEntranceAnimation: createPageEntranceTimeline,
    createHoverAnimation: createCardHoverAnimation,
    createScrollTriggerAnimation,
    createBillingToggleAnimation,
    prefersReducedMotion,
  };
}