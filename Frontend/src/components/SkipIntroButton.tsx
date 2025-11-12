'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

/**
 * Props interface for the SkipIntroButton component
 */
interface SkipIntroButtonProps {
  /** Current playback time in seconds */
  currentTime: number;
  /** Start time of the intro sequence in seconds */
  introStart: number;
  /** End time of the intro sequence in seconds */
  introEnd: number;
  /** Callback function called when user skips the intro */
  onSkipIntro: () => void;
  /** Additional CSS classes to apply to the button */
  className?: string;
  /** Inline styles to apply to the button */
  style?: React.CSSProperties;
}

/**
 * SkipIntroButton Component
 * 
 * A Netflix-style skip intro button that appears during intro sequences.
 * Features smooth animations, accessibility support, and responsive design.
 * 
 * @component
 * @example
 * ```tsx
 * <SkipIntroButton
 *   currentTime={25}
 *   introStart={0}
 *   introEnd={45}
 *   onSkipIntro={() => player.seek(45)}
 * />
 * ```
 * 
 * @param props - The component props
 * @returns JSX element representing the skip intro button
 */
export function SkipIntroButton({
  currentTime,
  introStart,
  introEnd,
  onSkipIntro,
  className,
  style
}: SkipIntroButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  /**
   * Effect to manage button visibility based on current playback time
   * Shows the button when current time is within the intro range
   */
  useEffect(() => {
    const shouldShow = currentTime >= introStart && currentTime <= introEnd;

    if (shouldShow !== isVisible) {
      if (shouldShow) {
        setIsVisible(true);
        setIsAnimating(true);
        // Add entrance animation class
        setTimeout(() => {
          if (buttonRef.current) {
            buttonRef.current.classList.add('skip-intro-enter');
          }
        }, 10);
      } else {
        setIsAnimating(true);
        // Add exit animation class
        if (buttonRef.current) {
          buttonRef.current.classList.add('skip-intro-exit');
        }
        // Hide after animation completes
        setTimeout(() => {
          setIsVisible(false);
          setIsAnimating(false);
          if (buttonRef.current) {
            buttonRef.current.classList.remove('skip-intro-enter', 'skip-intro-exit');
          }
        }, 300);
      }
    }
  }, [currentTime, introStart, introEnd, isVisible]);

  /**
   * Handles keyboard events for accessibility
   * Supports Enter and Space key activation
   * Memoized to prevent unnecessary re-renders
   * 
   * @param event - The keyboard event
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      onSkipIntro();
    }
  }, [onSkipIntro]);

  /**
   * Effect to manage focus and screen reader announcements
   * Announces when the skip intro button becomes available
   */
  useEffect(() => {
    if (isVisible && buttonRef.current) {
      // Announce to screen readers when skip intro becomes available
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = 'Skip intro button is now available';
      document.body.appendChild(announcement);

      // Clean up announcement after screen reader has time to read it
      setTimeout(() => {
        if (document.body.contains(announcement)) {
          document.body.removeChild(announcement);
        }
      }, 1000);
    }
  }, [isVisible]);

  /**
   * Handles button click with visual feedback
   * Provides tactile-like feedback through scale animation
   * Memoized to prevent unnecessary re-renders
   */
  const handleClick = useCallback(() => {
    // Add click animation
    if (buttonRef.current) {
      buttonRef.current.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (buttonRef.current) {
          buttonRef.current.style.transform = '';
        }
      }, 100);
    }
    onSkipIntro();
  }, [onSkipIntro]);

  /**
   * Memoized aria-label for better accessibility
   * Calculates skip duration and formats it properly
   */
  const ariaLabel = useMemo(() => {
    const skipDuration = introEnd - introStart;
    const minutes = Math.floor(skipDuration / 60);
    const seconds = Math.floor(skipDuration % 60);
    return `Skip intro sequence. Jump to ${minutes}:${String(seconds).padStart(2, '0')} ahead.`;
  }, [introStart, introEnd]);

  /**
   * Memoized screen reader description
   * Provides detailed information about the skip action
   */
  const screenReaderDescription = useMemo(() => {
    const skipDuration = introEnd - introStart;
    const minutes = Math.floor(skipDuration / 60);
    const seconds = skipDuration % 60;
    return `Press Enter or Space to skip the intro sequence and jump ahead ${minutes} minutes and ${seconds} seconds.`;
  }, [introStart, introEnd]);

  // Don't render if not visible and not animating
  if (!isVisible && !isAnimating) {
    return null;
  }

  return (

    <button
      ref={buttonRef}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        // Base positioning and layout with responsive adjustments
        'absolute z-[60] touch-target',
        // Mobile positioning (above mobile controls, positioned to not conflict with skip intro)
        'bottom-16 right-3 sm:bottom-36 sm:right-4',
        // Enhanced responsive positioning for different screen sizes
        'md:bottom-28 md:right-6 lg:bottom-28 lg:right-8',
        // Fullscreen mode positioning (higher z-index)
        'fullscreen:z-[9999] fullscreen:bottom-20 fullscreen:right-6',

        // Base styling with glassmorphism effect (similar to SkipIntroButton)
        'bg-black/80 backdrop-blur-sm border border-white/20',
        'text-white font-semibold rounded-lg shadow-2xl',

        // Responsive sizing and padding
        // Responsive sizing and padding
        'px-2  text-md',
        'sm:px-2 sm:text-sm',
        'md:px-2 md:text-base',
        'lg:px-2 lg:text-base',

        // Enhanced hover effects with smooth transitions
        'hover:bg-black/90 hover:border-white/30 hover:shadow-3xl',
        'hover:scale-105 active:scale-95',

        // Enhanced focus states for accessibility with better visibility
        'focus:outline-none focus:ring-4 focus:ring-white/80',
        'focus:ring-offset-4 focus:ring-offset-black/60',
        'focus:bg-black/95 focus:border-white/40',
        'focus-visible:ring-4 focus-visible:ring-white/80',

        // High contrast mode support
        'contrast-more:border-2 contrast-more:border-white',
        'contrast-more:bg-black contrast-more:text-white',

        // Smooth transitions for all properties
        'transition-all duration-300 ease-out',
        'transform-gpu will-change-transform',

        // Motion preferences respect
        'motion-reduce:transition-none motion-reduce:hover:scale-100',
        'motion-reduce:focus:scale-100',

        // Enhanced responsive typography
        'font-medium tracking-wide',
        'sm:font-semibold sm:tracking-normal',

        className
      )}
      style={{
        // Ensure proper layering in fullscreen
        zIndex: 'var(--skip-intro-z-index, 60)',
        ...style
      }}
      aria-label={ariaLabel}
      aria-describedby="skip-intro-description"
      role="button"
      tabIndex={0}
      aria-keyshortcuts="Enter Space"
    >
      <span className="flex items-center gap-1.5 sm:gap-2">
        {/* <svg 
          className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" 
          fill="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
          role="img"
          focusable="false"
        >
          <path d="M6 18l8.5-6L6 6v12zm9-12v12l8.5-6L15 6z"/>
        </svg> */}
        <span className="whitespace-nowrap">Skip Intro</span>
      </span>

      {/* Hidden description for screen readers */}
      <span
        id="skip-intro-description"
        className="sr-only"
      >
        {screenReaderDescription}
      </span>
    </button>

  );
}