/**
 * Rewatch Section Component
 * 
 * Displays completed content from 15-20 days ago as rewatch suggestions.
 * Shows on the homepage to remind users of content they might want to rewatch.
 * 
 * @module RewatchSection
 */

'use client';

import { useRewatchSuggestions } from '@/hooks/useRewatchSuggestions';
import { WatchHistoryCard } from '@/components/watch-history/WatchHistoryCard';
import { Skeleton } from '@/components/ui/skeleton';
import { History, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * RewatchSection Component
 * 
 * Displays a horizontal scrollable section of completed content from 15-20 days ago.
 * Provides "Watch Again" suggestions based on user's viewing history.
 * 
 * Features:
 * - Shows completed content from 15-20 days ago
 * - Horizontal scroll layout for homepage
 * - Link to full watch history page
 * - Loading states with skeletons
 * - Empty state handling
 * 
 * @example
 * ```tsx
 * // In homepage
 * <RewatchSection />
 * ```
 */
export function RewatchSection() {
  const { suggestions, isLoading, error } = useRewatchSuggestions();

  // Don't render if no suggestions and not loading
  if (!isLoading && suggestions.length === 0) {
    return null;
  }

  // Don't render if there's an error
  if (error) {
    return null;
  }

  return (
    <section className="py-8" aria-label="Watch again suggestions">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-3 full-width-minimal">



        <h2 className="heading-section text-white">Recently Watched </h2>
        <div className="flex items-center space-x-2">


          <Link href="/user/history" className="gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 w-full sm:flex-none transition-all bg-gradient-to-b from-red-500 to-red-600 hover:border-2 hover:border-neutral-900"
            >
              View All
            </Button>
          </Link>
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
        {/* View All Link */}





      </div>

      {/* Content Grid */}
      {isLoading ? (
        // Loading State
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-3" aria-hidden="true">
              <Skeleton className="aspect-video rounded-xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        // Content Grid
        <div
          className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          role="list"
        >
          {suggestions.map((item) => (
            <div key={item.videoId} role="listitem">
              <WatchHistoryCard
                item={item}
                onDelete={() => { }} // No delete on homepage
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
