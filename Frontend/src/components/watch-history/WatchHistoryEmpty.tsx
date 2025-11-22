'use client';

import { Button } from '@/components/ui/button';
import { History, Search, Film } from 'lucide-react';
import Link from 'next/link';

interface WatchHistoryEmptyProps {
  /** Whether filters are currently applied */
  hasFilters: boolean;
}

/**
 * WatchHistoryEmpty Component
 * 
 * Displays an empty state message when:
 * - No watch history exists for the user (Requirement 1.5)
 * - Applied filters return no results (Requirement 6.5)
 * 
 * Shows different messages and CTAs based on the context:
 * - No history: Encourages user to start watching content
 * - No results: Suggests adjusting filters
 * 
 * Requirements: 1.5, 6.5
 * 
 * @example
 * ```tsx
 * <WatchHistoryEmpty hasFilters={false} />
 * <WatchHistoryEmpty hasFilters={true} />
 * ```
 */
export function WatchHistoryEmpty({ hasFilters }: WatchHistoryEmptyProps) {
  // Different content based on whether filters are applied
  const content = hasFilters
    ? {
        icon: Search,
        title: 'No results found',
        description: 'Try adjusting your filters or search query to find what you\'re looking for.',
        ctaText: 'Clear Filters',
        ctaHref: null, // Will trigger filter reset
      }
    : {
        icon: History,
        title: 'No watch history yet',
        description: 'Start watching movies, TV shows, and more to build your viewing history.',
        ctaText: 'Browse Content',
        ctaHref: '/movies',
      };

  const Icon = content.icon;

  return (
    <div 
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      role="region"
      aria-label={hasFilters ? 'No search results' : 'Empty watch history'}
    >
      {/* Icon */}
      <div className="mb-6 p-6 rounded-full bg-purple-500/10 ring-1 ring-purple-500/20" aria-hidden="true">
        <Icon className="h-12 w-12 text-purple-400" aria-hidden="true" />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold mb-3" id="empty-state-title">
        {content.title}
      </h2>

      {/* Description */}
      <p className="text-muted-foreground max-w-md mb-8" id="empty-state-description">
        {content.description}
      </p>

      {/* Call to Action */}
      {content.ctaHref ? (
        <Button 
          asChild 
          size="lg" 
          className="gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Link 
            href={content.ctaHref}
            aria-describedby="empty-state-description"
          >
            <Film className="h-4 w-4" aria-hidden="true" />
            {content.ctaText}
          </Link>
        </Button>
      ) : (
        <Button 
          size="lg" 
          variant="outline"
          onClick={() => window.location.reload()}
          className="gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-describedby="empty-state-description"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          {content.ctaText}
        </Button>
      )}
    </div>
  );
}
