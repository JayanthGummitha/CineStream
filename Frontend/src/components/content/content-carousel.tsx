'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play, Plus, Info, Heart, ThumbsUp, ThumbsDown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createDetailUrl } from '@/lib/url-utils';
import { Movie, TVShow } from '@/types';
import { cn } from '@/lib/utils';

interface ContentCarouselProps {
  title: string;
  items: (Movie | TVShow)[];
  className?: string;
  isAuthenticated?: boolean;
}

export function ContentCarousel({
  title,
  items,
  className,
  isAuthenticated = false
}: ContentCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Width of one card plus gap
      const newScrollLeft = scrollRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount);

      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  if (!items.length) {
    return (
      <section className={cn("space-y-6", className)}>
        <h2 className="text-3xl font-bold text-white">{title}</h2>
        <div className="text-center py-8">
          <p className="text-white/60">No content available for this section.</p>
        </div>
      </section>
    );
  }

  // Determine section style based on className
  const isWatchlistSection = className?.includes('watchlist');

  return (
    <section className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">{title}</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('left')}
            className="h-10 w-10 p-0 bg-black/40 border-white/20 hover:bg-black/60"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('right')}
            className="h-10 w-10 p-0 bg-black/40 border-white/20 hover:bg-black/60"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <ContentCard
            key={item.id}
            item={item}
            isAuthenticated={isAuthenticated}
            sectionType={
              isWatchlistSection ? 'watchlist' : 'default'
            }
          />
        ))}
      </div>
    </section>
  );
}

interface ContentCardProps {
  item: Movie | TVShow;
  isAuthenticated: boolean;
  sectionType?: 'default' | 'watchlist';
}

function ContentCard({ item, isAuthenticated, sectionType = 'default' }: ContentCardProps) {
  const isMovie = !('seasons' in item);
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isInList, setIsInList] = useState(sectionType === 'watchlist');

  // Simulate progress for some items (more likely for watchlist)
  const watchProgress = (sectionType === 'watchlist' || Math.random() > 0.6) ? Math.floor(Math.random() * 80) + 10 : 0;
  const isWatched = watchProgress > 0;
  const timeRemaining = isWatched ? Math.floor(Math.random() * 45) + 5 : 0;

  // Special badges based on section type
  const getSectionBadge = () => {
    switch (sectionType) {
      case 'watchlist':
        return { text: 'In My List', color: 'from-pink-500 to-rose-500' };
      default:
        return null;
    }
  };

  const sectionBadge = getSectionBadge();

  return (
    <div
      className="group relative flex-shrink-0 w-72 transition-all duration-700 ease-out hover:scale-110 hover:z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Card Container */}
      <div className="relative overflow-hidden rounded-2xl shadow-2xl group-hover:shadow-4xl transition-all duration-700">

        {/* Primary Card */}
        <div className="content-card relative bg-gradient-to-br from-black/40 via-black/20 to-black/60 backdrop-blur-xl border border-white/10 group-hover:border-white/20 transition-all duration-500">

          {/* Movie Poster */}
          <div className="relative aspect-[2/3] group-hover:aspect-[16/10] transition-all duration-700 overflow-hidden">
            <Image
              src={item.thumbnail}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-75"
              priority={false}
            />

            {/* Enhanced Glassmorphism Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-70 group-hover:opacity-95 transition-all duration-500" />

            {/* Floating Play Button (Hover) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200">
              <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-4 hover:bg-white/30 hover:scale-110 transition-all duration-300 cursor-pointer">
                <Play className="h-8 w-8 text-white fill-white" />
              </div>
            </div>

            {/* Progress Bar */}
            {isWatched && (
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40 backdrop-blur-sm">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 transition-all duration-1000 ease-out"
                  style={{ width: `${watchProgress}%` }}
                />
              </div>
            )}

            {/* Status Badges */}
            <div className="absolute top-4 left-4 flex flex-col space-y-2">
              {sectionBadge && (
                <div className={`px-3 py-1.5 bg-gradient-to-r ${sectionBadge.color} rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm`}>
                  {sectionBadge.text}
                </div>
              )}
              {item.isNew && !sectionBadge && (
                <div className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm">
                  New
                </div>
              )}
              {item.isTrending && (
                <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-xs font-semibold uppercase tracking-wider shadow-lg">
                  🔥 Trending
                </div>
              )}
              {isWatched && (
                <div className="px-3 py-1.5 bg-orange-500/90 backdrop-blur-md border border-orange-300/30 rounded-full text-white text-xs font-semibold uppercase tracking-wider shadow-lg">
                  <Clock className="inline h-3 w-3 mr-1" />
                  Continue
                </div>
              )}
            </div>

            {/* Rating Badge */}
            <div className="absolute top-4 right-4">
              <div className="flex items-center space-x-1.5 bg-black/70 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 shadow-lg">
                <div className="w-2.5 h-2.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
                <span className="text-white text-sm font-semibold">{item.rating}</span>
              </div>
            </div>

            {/* Basic Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
              <h3 className="text-white font-bold text-xl mb-2 leading-tight">
                {item.title}
              </h3>
              <div className="flex items-center space-x-3 text-white/90 text-sm font-medium">
                <span>{new Date(item.releaseDate).getFullYear()}</span>
                <span className="w-1 h-1 bg-white/60 rounded-full"></span>
                <span className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs border border-white/20">
                  {item.contentRating}
                </span>
                <span className="w-1 h-1 bg-white/60 rounded-full"></span>
                <span className="text-white/80">
                  {isMovie ? (
                    `${Math.floor(item.duration / 60)}h ${item.duration % 60}m`
                  ) : (
                    `${item.totalSeasons} Season${item.totalSeasons > 1 ? 's' : ''}`
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Expanded Content (Hover State) */}
          <div className={cn(
            "transition-all duration-500 transform",
            isHovered
              ? "opacity-100 translate-y-0 max-h-96"
              : "opacity-0 translate-y-4 max-h-0 overflow-hidden"
          )}>
            <div className="p-6 space-y-4 bg-gradient-to-b from-black/90 to-black/95 backdrop-blur-xl border-t border-white/10">

              {/* Enhanced Info Section */}
              <div className="space-y-3">
                {/* Genres */}
                <div className="flex flex-wrap gap-2">
                  {item.genres.slice(0, 3).map((genre) => (
                    <span
                      key={genre}
                      className="text-xs bg-white/10 backdrop-blur-sm text-white/90 px-3 py-1.5 rounded-full border border-white/20 font-medium hover:bg-white/20 transition-colors duration-200"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                {/* Description */}
                <p className="text-white/80 text-sm leading-relaxed line-clamp-3">
                  {item.description}
                </p>

                {/* Cast & Availability */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-white/70">
                      <span className="text-white/50">Starring: </span>
                      <span className="text-white/90 font-medium">
                        {item.cast.slice(0, 2).map(actor => actor.name).join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-xs font-semibold">Available Now</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-2">
                <Button
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Play className="mr-2 h-4 w-4 fill-white" />
                  {isWatched ? 'Continue' : (isAuthenticated ? 'Play Now' : 'Watch Trailer')}
                </Button>

                {isAuthenticated && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        "bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-105",
                        isInList && "bg-green-500/20 border-green-400/40 text-green-400"
                      )}
                      onClick={() => setIsInList(!isInList)}
                      title={isInList ? "Remove from My List" : "Add to My List"}
                    >
                      {isInList ? <Heart className="h-4 w-4 fill-current" /> : <Plus className="h-4 w-4" />}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        "bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-105",
                        isLiked && "bg-blue-500/20 border-blue-400/40 text-blue-400"
                      )}
                      onClick={() => setIsLiked(!isLiked)}
                      title={isLiked ? "Unlike" : "Like"}
                    >
                      <ThumbsUp className={cn("h-4 w-4", isLiked && "fill-current")} />
                    </Button>
                  </>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-105"
                  asChild
                >
                  <Link href={isMovie ? createDetailUrl('movie', item.id, item.title) : createDetailUrl('tv', item.id, item.title)}>
                    <Info className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Continue Watching Status */}
              {isWatched && (
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-orange-400 text-sm font-semibold">Continue Watching</span>
                  </div>
                  <span className="text-white/60 text-sm">{timeRemaining} min left</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Netflix-style Expanded Preview (Enhanced) */}
        <div className={cn(
          "absolute -top-2 -left-2 -right-2 pointer-events-none transition-all duration-500 z-30",
          isHovered ? "opacity-100 pointer-events-auto" : "opacity-0"
        )}>
          <div className="bg-gradient-to-br from-black/95 via-black/90 to-black/95 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 shadow-2xl transform transition-all duration-500 hover:shadow-3xl">

            {/* Enhanced Preview Header */}
            <div className="flex items-start space-x-4 mb-4">
              <div className="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-white font-bold text-xl leading-tight">{item.title}</h4>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="flex items-center space-x-1.5 bg-yellow-500/20 backdrop-blur-sm px-2 py-1 rounded-full border border-yellow-400/30">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-yellow-400 font-semibold">{item.rating}/10</span>
                  </div>
                  <span className="text-white/80 font-medium">{new Date(item.releaseDate).getFullYear()}</span>
                  <span className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs border border-white/20 text-white/90">
                    {item.contentRating}
                  </span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Enhanced Action Row */}
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold rounded-xl flex-1 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Play className="mr-2 h-4 w-4 fill-white" />
                {isWatched ? 'Continue Watching' : (isAuthenticated ? 'Play Now' : 'Watch Trailer')}
              </Button>

              {isAuthenticated && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      "bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 rounded-xl transition-all duration-300",
                      isInList && "bg-green-500/20 border-green-400/40 text-green-400"
                    )}
                    onClick={() => setIsInList(!isInList)}
                    title={isInList ? "Remove from My List" : "Add to My List"}
                  >
                    {isInList ? <Heart className="h-4 w-4 fill-current" /> : <Plus className="h-4 w-4" />}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      "bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 rounded-xl transition-all duration-300",
                      isLiked && "bg-blue-500/20 border-blue-400/40 text-blue-400"
                    )}
                    onClick={() => setIsLiked(!isLiked)}
                    title={isLiked ? "Unlike" : "Like"}
                  >
                    <ThumbsUp className={cn("h-4 w-4", isLiked && "fill-current")} />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 rounded-xl transition-all duration-300"
                    title="Dislike"
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </>
              )}

              <Button
                size="sm"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 rounded-xl transition-all duration-300"
                asChild
              >
                <Link href={isMovie ? createDetailUrl('movie', item.id, item.title) : createDetailUrl('tv', item.id, item.title)}>
                  <Info className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Progress Status (if watching) */}
            {isWatched && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-orange-400 text-sm font-semibold">Continue Watching</span>
                  <span className="text-white/60 text-sm">{watchProgress}% complete</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 transition-all duration-1000"
                    style={{ width: `${watchProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}