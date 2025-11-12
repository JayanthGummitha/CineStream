'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// Simple movie info interface - just the title
interface MovieInfo {
  title: string;
}

interface MovieInfoDisplayProps {
  movieInfo?: MovieInfo;
  showMovieInfo?: boolean;
  maxTitleLength?: number;
  className?: string;
}

// Simple Movie Title Component
export const MovieInfoDisplay: React.FC<MovieInfoDisplayProps> = ({
  movieInfo,
  showMovieInfo = false,
  maxTitleLength = 40,
  className = ''
}) => {
  if (!movieInfo || !movieInfo.title) return null;

  const shouldTruncateTitle = movieInfo.title.length > maxTitleLength && !showMovieInfo;
  const displayTitle = shouldTruncateTitle 
    ? `${movieInfo.title.substring(0, maxTitleLength)}...` 
    : movieInfo.title;

  return (
    <div className={cn("flex items-center justify-center max-w-md mx-4", className)}>
      <h2 
        className="text-white font-semibold text-sm md:text-base text-center truncate cursor-default"
        title={movieInfo.title}
      >
        Rangam
      </h2>
    </div>
  );
};

export default MovieInfoDisplay;