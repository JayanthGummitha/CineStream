'use client';

import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import Link from 'next/link';

interface TrailerButtonProps {
  /** The trailer URL if available */
  trailerSrc: string | null;
  /** Whether the trailer is currently loading */
  isLoading: boolean;
  /** Whether there was an error fetching the trailer */
  hasError: boolean;
  /** Movie ID for navigation */
  movieId: string;
  /** Movie title for navigation and accessibility */
  movieTitle: string;
  /** Button size variant */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Additional CSS classes */
  className?: string;
}

export function TrailerButton({
  trailerSrc,
  isLoading,
  hasError,
  movieId,
  movieTitle,
  size = 'lg',
  className = ''
}: TrailerButtonProps) {
  // Loading state - disabled button with loading indicator
  if (isLoading) {
    return (
      <Button 
        size={size} 
        className={`bg-white/70 text-black/70 cursor-not-allowed ${className}`} 
        disabled
        aria-label="Loading trailer"
        aria-describedby="trailer-loading-description"
      >
        <div 
          className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-black/30 border-t-black/70"
          aria-hidden="true"
        />
        Loading Trailer...
        <span id="trailer-loading-description" className="sr-only">
          Trailer is currently loading for {movieTitle}
        </span>
      </Button>
    );
  }

  // Available state - enabled "Watch Trailer" button
  if (trailerSrc && !hasError) {
    return (
      <Link 
        href={`/watch/${movieId}?fullscreen=true&autoplay=true&trailer=true&title=${encodeURIComponent(movieTitle)}&src=${encodeURIComponent(trailerSrc)}`}
        aria-label={`Watch trailer for ${movieTitle}`}
      >
        <Button 
          size={size} 
          className={`bg-white text-black hover:bg-white/90 ${className}`}
          aria-describedby="trailer-available-description"
        >
          <Play className="mr-2 h-5 w-5" aria-hidden="true" />
          Watch Trailer
          <span id="trailer-available-description" className="sr-only">
            Trailer is available for {movieTitle}. Click to watch in full screen.
          </span>
        </Button>
      </Link>
    );
  }

  // Unavailable state - disabled "Trailer Unavailable" button
  return (
    <Button 
      size={size} 
      className={`bg-white/50 text-black/50 cursor-not-allowed ${className}`} 
      disabled
      aria-label="Trailer unavailable"
      aria-describedby="trailer-unavailable-description"
    >
      <Play className="mr-2 h-5 w-5" aria-hidden="true" />
      Trailer Unavailable
      <span id="trailer-unavailable-description" className="sr-only">
        No trailer is available for {movieTitle}
      </span>
    </Button>
  );
}