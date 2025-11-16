/**
 * Motion Preference Detection Hook
 * 
 * This module provides a comprehensive React hook for detecting user motion
 * and accessibility preferences, enabling respectful animation behavior
 * that adapts to user needs and system settings.
 * 
 * @module useMotionPreference
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Interface representing user motion and accessibility preferences
 */
export interface MotionPreferences {
  /** Whether user prefers reduced motion animations */
  prefersReducedMotion: boolean;
  /** Whether user prefers reduced data usage */
  prefersReducedData: boolean;
  /** Whether user prefers high contrast display */
  prefersHighContrast: boolean;
  /** Whether user is on a touch device */
  isTouch: boolean;
}

/**
 * Custom hook to detect user motion and accessibility preferences
 * 
 * Monitors system media queries and provides utilities for creating
 * accessible animations that respect user preferences.
 * 
 * @example
 * ```tsx
 * const { prefersReducedMotion, shouldAnimate, getAnimationDuration } = useMotionPreference();
 * 
 * const animationClass = shouldAnimate('entrance') ? 'animate-fade-in' : '';
 * const duration = getAnimationDuration(300); // Returns 0 if reduced motion
 * ```
 * 
 * @returns Object containing motion preference flags and utility functions
 */
export function useMotionPreference(): MotionPreferences & {
  getAnimationDuration: (defaultMs: number) => number;
  shouldAnimate: (animationType?: 'entrance' | 'exit' | 'hover' | 'focus') => boolean;
} {
  const [preferences, setPreferences] = useState<MotionPreferences>({
    prefersReducedMotion: false,
    prefersReducedData: false,
    prefersHighContrast: false,
    isTouch: false
  });

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;

    const updatePreferences = () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const prefersReducedData = window.matchMedia('(prefers-reduced-data: reduce)').matches;
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

      setPreferences({
        prefersReducedMotion,
        prefersReducedData,
        prefersHighContrast,
        isTouch
      });

    
    };

    // Initial check
    updatePreferences();

    // Create media query listeners
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const dataQuery = window.matchMedia('(prefers-reduced-data: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    const touchQuery = window.matchMedia('(hover: none) and (pointer: coarse)');

    // Add listeners for preference changes
    const handleMotionChange = () => updatePreferences();
    
    motionQuery.addEventListener('change', handleMotionChange);
    dataQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleMotionChange);
    touchQuery.addEventListener('change', handleMotionChange);

    // Cleanup listeners
    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      dataQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleMotionChange);
      touchQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  /**
   * Get animation duration based on user preferences
   * 
   * Adjusts animation duration based on user accessibility preferences:
   * - Returns 0 for reduced motion preference
   * - Limits duration for reduced data preference
   * - Reduces duration slightly for touch devices
   * 
   * Memoized to prevent unnecessary recalculations
   * 
   * @param defaultMs - Default animation duration in milliseconds
   * @returns Adjusted duration based on user preferences
   */
  const getAnimationDuration = useCallback((defaultMs: number): number => {
    if (preferences.prefersReducedMotion) return 0;
    if (preferences.prefersReducedData) return Math.min(defaultMs, 200);
    if (preferences.isTouch) return Math.max(defaultMs * 0.8, 150);
    return defaultMs;
  }, [preferences.prefersReducedMotion, preferences.prefersReducedData, preferences.isTouch]);

  /**
   * Determine if animations should be enabled based on preferences
   * 
   * Evaluates whether specific animation types should be enabled:
   * - Always respects reduced motion preference
   * - Limits animations for reduced data usage
   * - Disables hover animations on touch devices
   * 
   * Memoized to prevent unnecessary recalculations
   * 
   * @param animationType - Type of animation to check ('entrance' | 'exit' | 'hover' | 'focus')
   * @returns Whether the specified animation type should be enabled
   */
  const shouldAnimate = useCallback((animationType: 'entrance' | 'exit' | 'hover' | 'focus' = 'entrance'): boolean => {
    // Always disable animations if user prefers reduced motion
    if (preferences.prefersReducedMotion) return false;
    
    // Reduce data usage by limiting complex animations
    if (preferences.prefersReducedData) {
      return animationType === 'focus'; // Only allow focus animations for accessibility
    }
    
    // On touch devices, reduce hover animations but keep others
    if (preferences.isTouch && animationType === 'hover') {
      return false;
    }
    
    return true;
  }, [preferences.prefersReducedMotion, preferences.prefersReducedData, preferences.isTouch]);

  return {
    ...preferences,
    getAnimationDuration,
    shouldAnimate
  };
}

/**
 * Utility function to get CSS animation classes based on motion preferences
 * @param baseClasses - Base CSS classes
 * @param animationClasses - Animation-specific classes
 * @param prefersReducedMotion - Whether user prefers reduced motion
 * @returns Combined CSS classes respecting motion preferences
 */
export function getAnimationClasses(
  baseClasses: string,
  animationClasses: string,
  prefersReducedMotion: boolean
): string {
  if (prefersReducedMotion) {
    return `${baseClasses} motion-reduce:transition-none motion-reduce:animate-none`;
  }
  return `${baseClasses} ${animationClasses}`;
}

/**
 * Utility function to create motion-safe inline styles
 * @param styles - Base styles object
 * @param animationStyles - Animation-specific styles
 * @param prefersReducedMotion - Whether user prefers reduced motion
 * @returns Combined styles object respecting motion preferences
 */
export function getMotionSafeStyles(
  styles: React.CSSProperties,
  animationStyles: React.CSSProperties,
  prefersReducedMotion: boolean
): React.CSSProperties {
  if (prefersReducedMotion) {
    return {
      ...styles,
      transition: 'none',
      animation: 'none',
      transform: 'none'
    };
  }
  return { ...styles, ...animationStyles };
}