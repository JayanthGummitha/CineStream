'use client';

import { cn } from '@/lib/utils';
import { MovieCard } from './movie-card';

interface MovieGridProps {
  movies: any[];
  isAuthenticated: boolean;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
  contentType?: 'movie' | 'tv-shows' | 'kids' | 'documentaries';
}

export function MovieGrid({ 
  movies, 
  isAuthenticated, 
  variant = 'default',
  className,
  contentType = 'movie'
}: MovieGridProps) {
  const gridClasses = cn(
    "grid gap-4 sm:gap-6 md:gap-8",
    {
      // Default: 1-2 columns on mobile to 5-6 columns on ultra-wide
      "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6": variant === 'default',
      // Compact: 2 columns on mobile to 6-7 columns on ultra-wide
      "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4": variant === 'compact',
      // Featured: 1 column on mobile to 4 columns on ultra-wide
      "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 md:gap-10": variant === 'featured',
    },
    className
  );

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className={gridClasses}>
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          isAuthenticated={isAuthenticated}
          variant={variant}
          contentType={movie.contentType || contentType}
        />
      ))}
    </div>
  );
}