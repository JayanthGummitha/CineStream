'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MovieThumbnailImage } from '@/components/ui/responsive-image';
import { Play, Plus, Heart, ThumbsUp, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createDetailUrl } from '@/lib/url-utils';

interface MovieCardProps {
  movie: any;
  isAuthenticated: boolean;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
  contentType?: 'movie' | 'tv-shows' | 'kids' | 'documentaries';
}

export function MovieCard({
  movie,
  isAuthenticated,
  variant = 'default',
  className,
  contentType = 'movie'
}: MovieCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isInList, setIsInList] = useState(false);

  // Simulate progress for some items using deterministic approach
  const movieIdHash = parseInt(movie.id.toString().slice(-2), 10) || 0;
  const watchProgress = movieIdHash > 70 ? Math.floor((movieIdHash % 80)) + 10 : 0;
  const isWatched = watchProgress > 0;

  const cardClasses = cn(
    "group cursor-pointer transition-all duration-300 hover:scale-105 w-full",
    className
  );

  const imageClasses = cn(
    "relative rounded-lg overflow-hidden bg-black mb-3",
    {
      "mb-3": variant === 'default',
      "mb-2": variant === 'compact',
      "mb-4": variant === 'featured',
    }
  );

  const titleClasses = cn(
    "text-white font-bold leading-tight line-clamp-2",
    {
      "heading-card": variant === 'default',
      "body-text": variant === 'compact',
      "heading-subsection": variant === 'featured',
    }
  );

  const metadataClasses = cn(
    "text-white/60",
    {
      "caption-text": variant === 'default',
      "micro-text": variant === 'compact',
      "body-small": variant === 'featured',
    }
  );

  return (
    <Link href={createDetailUrl(contentType, movie.id, movie.title)}>
      <div className={cardClasses}>
        {/* Movie Card Image */}
        <div className={imageClasses}>
          <div className="relative ">
            <MovieThumbnailImage
              src={movie.thumbnail}
              alt={movie.title}
              className="transition-all duration-300 group-hover:brightness-110"
              priority={false}
              quality={85}
              placeholder="empty"
              showLoadingState={true}
              fallbackSrc="/images/movie-placeholder.jpg"
              responsive={{
                mobile: '100vw',
                tablet: '50vw',
                desktop: '33vw',
                large: '25vw'
              }}
            />


            {/* Progress Bar */}
            {isWatched && (
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40 z-10">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                  style={{ width: `${watchProgress}%` }}
                />
              </div>
            )}

            {/* Rating Badge */}
            {/* <div className="absolute top-3 right-3 z-10">
              <div className="flex items-center space-x-1 bg-black/70 backdrop-blur-sm rounded-full px-2.5 py-1">
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                <span className="text-white text-xs font-semibold">{movie.rating}</span>
              </div>
            </div> */}

            {/* Touch-friendly overlay for mobile */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 lg:hidden z-5" />
          </div>
        </div>

        {/* Content Info */}
        <div className="space-responsive-compact">
          <h3 className={titleClasses}>
            {movie.title}
          </h3>

          {/* Rating and Genre Info */}
          {/* <div className="flex items-center gap-responsive-compact">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-400 font-semibold caption-text">{movie.rating}</span>
            </div>
            <span className="text-white/70">|</span>
            <span className={cn(metadataClasses, "overflow-ellipsis-responsive")}>
              {movie.genres.slice(0, 2).join(' • ')} • Movie
            </span>
          </div> */}

          {/* Additional Movie Info - Hidden on compact variant for mobile */}
          {/* {variant !== 'compact' && (
            <div className={cn("flex items-center gap-2", metadataClasses)}>
              <span>{new Date(movie.releaseDate).getFullYear()}</span>
              <span>|</span>
              <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                {movie.contentRating}
              </span>
              <span>|</span>
              <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
            </div>
          )} */}

          {/* Action Buttons - Touch-friendly sizing */}
          {/* {isAuthenticated && (
            <div className="flex items-center gap-responsive-compact spacing-element-compact">
              <Button
                size="sm"
                className={cn(
                  "flex-1 min-w-[40%]  flex items-center justify-center bg-yellow-600 hover:bg-red-700 text-white font-semibold rounded-lg touch-target relative overflow-hidden group",
                  {
                    "h-10 text-sm": variant === "compact",
                    "h-11 text-base": variant === "default",
                    "h-12 text-base": variant === "featured",
                  }
                )}
              >

               //  Default (Play/Continue) 
                <span className="absolute  p-1 opacity-100 group-hover:opacity-0 transition-opacity duration-200">
                  {isWatched ? "Resume" : "Play"}
                </span>

                // Hover (Always Play) 
                <span className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  
                <Play className="mr-2 h-4 w-4 fill-white shrink-0" />
                </span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={cn(
                  "bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-lg touch-target",
                  isInList && "bg-green-500/20 border-green-400/40 text-green-400",
                  {
                    "h-10 w-10": variant === 'compact',
                    "h-11 w-11": variant === 'default',
                    "h-12 w-12": variant === 'featured',
                  }
                )}
                onClick={(e) => {
                  e.preventDefault();
                  setIsInList(!isInList);
                }}
              >
                {isInList ? <Heart className="h-4 w-4 fill-current" /> : <Plus className="h-4 w-4" />}
              </Button>

              <Button
                size="sm"
                variant="outline"
                className={cn(
                  "bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-lg touch-target",
                  isLiked && "bg-blue-500/20 border-blue-400/40 text-blue-400",
                  {
                    "h-10 w-10": variant === 'compact',
                    "h-11 w-11": variant === 'default',
                    "h-12 w-12": variant === 'featured',
                  }
                )}
                onClick={(e) => {
                  e.preventDefault();
                  setIsLiked(!isLiked);
                }}
              >
                <ThumbsUp className={cn("h-4 w-4", isLiked && "fill-current")} />
              </Button>
            </div>
          )} */}

          {/* Continue Watching Status */}
          {/* {isWatched && variant !== 'compact' && (
            <div className="flex items-center justify-between pt-2 border-t border-white/20">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-orange-400 text-sm font-semibold">Continue Watching</span>
              </div>
              <span className="text-white/60 text-sm">{watchProgress}% complete</span>
            </div>
          )} */}
        </div>
      </div>
    </Link>
  );
}