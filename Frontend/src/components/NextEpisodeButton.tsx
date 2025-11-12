'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { EpisodeMetadata } from '@/lib/episode-metadata';

/**
 * Props interface for the NextEpisodeButton component
 */
interface NextEpisodeButtonProps {
  /** Current playback time in seconds */
  currentTime: number;
  /** Total duration of the current episode in seconds */
  duration: number;
  /** Next episode metadata */
  nextEpisode: EpisodeMetadata;
  /** Callback function called when user clicks to play next episode */
  onPlayNext: (episodeData: EpisodeMetadata) => void;
  /** Time before episode end to show button (default: 120 seconds = 2 minutes) */
  triggerTime?: number;
  /** Additional CSS classes to apply to the button */
  className?: string;
  /** Inline styles to apply to the button */
  style?: React.CSSProperties;
}

/**
 * NextEpisodeButton Component
 * 
 * A Netflix-style next episode button that appears before the current episode ends.
 * Features smooth animations, accessibility support, and responsive design.
 * 
 * @component
 * @example
 * ```tsx
 * <NextEpisodeButton
 *   currentTime={2580}
 *   duration={2700}
 *   nextEpisode={nextEpisodeData}
 *   onPlayNext={(episode) => playEpisode(episode)}
 *   triggerTime={120}
 * />
 * ```
 * 
 * @param props - The component props
 * @returns JSX element representing the next episode button
 */
export function NextEpisodeButton({
  currentTime,
  duration,
  nextEpisode,
  onPlayNext,
  triggerTime = 120, // Default 2 minutes
  className,
  style
}: NextEpisodeButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  /**
   * Effect to manage button visibility based on current playback time
   * Shows the button when current time is within the trigger window (2 minutes before end)
   */
  useEffect(() => {
    // Calculate when to show the button (triggerTime seconds before episode ends)
    const showTime = duration - triggerTime;
    const shouldShow = currentTime >= showTime && currentTime < duration && showTime > 0;
    
    if (shouldShow !== isVisible) {
      if (shouldShow) {
        setIsVisible(true);
        setIsAnimating(true);
        // Add entrance animation class
        setTimeout(() => {
          if (buttonRef.current) {
            buttonRef.current.classList.add('next-episode-enter');
          }
        }, 10);
      } else {
        setIsAnimating(true);
        // Add exit animation class
        if (buttonRef.current) {
          buttonRef.current.classList.add('next-episode-exit');
        }
        // Hide after animation completes
        setTimeout(() => {
          setIsVisible(false);
          setIsAnimating(false);
          if (buttonRef.current) {
            buttonRef.current.classList.remove('next-episode-enter', 'next-episode-exit');
          }
        }, 300);
      }
    }
  }, [currentTime, duration, triggerTime, isVisible]);

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
      onPlayNext(nextEpisode);
    }
  }, [onPlayNext, nextEpisode]);

  /**
   * Effect to manage focus and screen reader announcements
   * Announces when the next episode button becomes available
   */
  useEffect(() => {
    if (isVisible && buttonRef.current) {
      // Announce to screen readers when next episode button becomes available
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = `Next episode button is now available: ${nextEpisode.title}`;
      document.body.appendChild(announcement);
      
      // Clean up announcement after screen reader has time to read it
      setTimeout(() => {
        if (document.body.contains(announcement)) {
          document.body.removeChild(announcement);
        }
      }, 1000);
    }
  }, [isVisible, nextEpisode.title]);

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
    onPlayNext(nextEpisode);
  }, [onPlayNext, nextEpisode]);

  /**
   * Memoized aria-label for better accessibility
   * Includes next episode title and timing information
   */
  const ariaLabel = useMemo(() => {
    const timeRemaining = Math.ceil(duration - currentTime);
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `Play next episode: ${nextEpisode.title}. ${minutes}:${String(seconds).padStart(2, '0')} remaining in current episode.`;
  }, [nextEpisode.title, duration, currentTime]);

  /**
   * Memoized screen reader description
   * Provides detailed information about the next episode action
   */
  const screenReaderDescription = useMemo(() => {
    return `Press Enter or Space to immediately start the next episode: ${nextEpisode.title}. This will skip the remaining time in the current episode.`;
  }, [nextEpisode.title]);

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
        'bottom-16 right-3 sm:bottom-4 sm:right-4',
        // Enhanced responsive positioning for different screen sizes
        'md:bottom-6 md:right-6 lg:bottom-28 lg:right-8',
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
        zIndex: 'var(--next-episode-z-index, 60)',
        ...style
      }}
      aria-label={ariaLabel}
      aria-describedby="next-episode-description"
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
        <span className="whitespace-nowrap">Next Episode</span>
      </span>
      
      {/* Hidden description for screen readers */}
      <span 
        id="next-episode-description" 
        className="sr-only"
      >
        {screenReaderDescription}
      </span>
    </button>
  );
}
