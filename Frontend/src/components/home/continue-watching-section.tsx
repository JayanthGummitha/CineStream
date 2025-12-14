'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWatchProgressList } from '@/hooks/useWatchProgressList';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

export function ContinueWatchingSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { progressList, isLoading, isRefreshing, removeProgress, refreshProgress } = useWatchProgressList();

  // Debug: Add window function to clear all watch progress
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).clearAllWatchProgress = () => {
        const keys = Object.keys(localStorage);
        const progressKeys = keys.filter(key => key.startsWith('watch_progress_'));
        progressKeys.forEach(key => localStorage.removeItem(key));
        window.location.reload();
      };
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      // Scroll by approximately 2-3 cards (320px + 24px gap = 344px per card)
      const scrollAmount = 344 * 2.5; // Scroll by ~2.5 cards
      const newScrollLeft = scrollRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount);

      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // Hide section if no progress data or still loading
  if (isLoading || progressList.length === 0) return null;

  return (
    <section className="w-full space-y-6">
      {/* Header with minimal padding on sides */}
      <div className="flex items-center justify-between full-width-minimal">
        <h2 className="heading-section text-white">Continue Watching</h2>
        <div className="flex items-center space-x-2">
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={refreshProgress}
            disabled={isRefreshing}
            className="h-10 w-10 p-0 bg-black/40 border-white/20 hover:bg-black/60 touch-target disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Refresh progress"
            title="Refresh progress"
          >
            <RefreshCw className={`h-5 w-5 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          
          {/* Scroll Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('left')}
            className="h-10 w-10 p-0 bg-black/40 border-white/20 hover:bg-black/60 touch-target"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('right')}
            className="h-10 w-10 p-0 bg-black/40 border-white/20 hover:bg-black/60 touch-target"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>

      {/* Horizontal Scrolling Carousel - Full width with minimal padding */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 full-width-minimal"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {progressList.map((progressData) => (
          <ContinueWatchingCard
            key={progressData.videoId}
            progressData={progressData}
            onRemove={removeProgress}
          />
        ))}
      </div>
    </section>
  );
}

interface ContinueWatchingCardProps {
  progressData: import('@/types/watch-progress').WatchProgressData;
  onRemove: (videoId: string) => void;
}

function ContinueWatchingCard({ progressData, onRemove }: ContinueWatchingCardProps) {
  const isMovie = progressData.contentType === 'movie';
  const isTVShow = progressData.contentType === 'tv-show';
  
  const displayTitle = progressData.title;
  // Use thumbnail from progress data, or placeholder if missing
  // Note: Thumbnails should be saved when watch progress is recorded
  const displayImage = progressData.thumbnail || '/placeholder-movie.jpg';

  // Handle remove with undo toast
  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    
    // Remove immediately (optimistic update)
    onRemove(progressData.videoId);
    
    // Show undo toast
    toast({
      title: 'Removed from Continue Watching',
      description: `${progressData.title} has been removed`,
      duration: 5000,
      action: (
        <ToastAction 
          altText="Undo remove"
          onClick={() => {
            // Note: This is a simplified undo - in a real implementation,
            // we would need to restore the progress to storage
          }}
        >
          Undo
        </ToastAction>
      ),
    });
  };

  // Format time from seconds to HH:MM:SS or MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format last watched timestamp
  const formatLastWatched = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Determine the URL based on content type
  const getContentUrl = () => {
    // For TV shows, use seriesName if available, otherwise fall back to title
    const titleForSlug = (isTVShow && progressData.seriesName)
      ? progressData.seriesName 
      : (progressData.title || 'untitled');
    
    // Create URL-friendly slug from title
    const slug = titleForSlug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'watch';
    
    if (isMovie) {
      return `/movie/${progressData.videoId}/${slug}`;
    } else if (isTVShow) {
      return `/tv-shows/${progressData.videoId}/${slug}`;
    }
    return '#';
  };

  return (
    <Link href={getContentUrl()}>
      <div className="group relative flex-shrink-0 w-80 cursor-pointer transition-all duration-300 hover:scale-105">
        <div className="relative rounded-lg overflow-hidden bg-black">

          {/* Main Image */}
          <div className="relative aspect-video">
            <Image
              src={displayImage}
              alt={displayTitle}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover object-center transition-all duration-300 group-hover:brightness-110"
            />

            {/* Minimal gradient overlay only at bottom for text readability */}
            <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Remove Button - Show on hover (desktop) or always visible (mobile) */}
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 z-10 bg-black/60 hover:bg-black/80 rounded-full p-2 transition-all duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100"
              aria-label="Remove from Continue Watching"
            >
              <Trash2 className="h-4 w-4 text-white" />
            </button>

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
              <div className="bg-white/90 rounded-full p-3 shadow-lg">
                <Play className="h-6 w-6 text-black fill-black ml-0.5" />
              </div>
            </div>

            {/* Content Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-bold text-lg mb-1 leading-tight">
                {displayTitle}
              </h3>

              {/* Show different info for movies vs TV shows */}
              <div className="text-white/80 text-sm mb-3">
                {isMovie ? (
                  // Movie: Show last watched time
                  <span className="text-xs text-white/60">{formatLastWatched(progressData.lastWatchedAt)}</span>
                ) : (
                  // TV Show: Show episode info
                  <div className="space-y-1">
                    <div>
                      S{progressData.seasonNumber} E{progressData.episodeNumber}
                      {progressData.episodeTitle && ` - ${progressData.episodeTitle}`}
                    </div>
                    <div className="text-xs text-white/60">{formatLastWatched(progressData.lastWatchedAt)}</div>
                  </div>
                )}
              </div>

              {/* Progress Bar Container */}
              <div className="space-y-1">
                {/* Time Display */}
                <div className="flex justify-between text-xs text-white/70">
                  <span>{formatTime(progressData.currentTime)}</span>
                  <span>{formatTime(progressData.duration)}</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full relative">
                  <div className="w-full h-1 bg-white/30 rounded-full">
                    <div
                      className="h-full bg-green-500 transition-all duration-500 rounded-full"
                      style={{ width: `${progressData.percentage}%` }}
                    />
                  </div>
                  {/* Progress Dot */}
                  <div
                    className="absolute top-1/2 w-3 h-3 bg-green-500 rounded-full transform -translate-y-1/2 transition-all duration-500 border-2 border-white shadow-lg"
                    style={{ left: `calc(${progressData.percentage}% - 6px)` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}