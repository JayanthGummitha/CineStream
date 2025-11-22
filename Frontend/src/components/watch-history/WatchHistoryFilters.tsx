'use client';

import { WatchHistoryFilters as Filters } from '@/hooks/useWatchHistory';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Loader2 } from 'lucide-react';
import { ContentType } from '@/types/watch-progress';

interface WatchHistoryFiltersProps {
  /** Current filter values */
  filters: Filters;
  /** Callback when filters change */
  onFilterChange: (filters: Filters) => void;
  /** Total count of unfiltered items */
  totalCount: number;
  /** Whether search is being debounced (optional) */
  isSearching?: boolean;
}

/**
 * Content type filter options
 * Maps content types to user-friendly labels
 * 
 * Note: Currently only 'movie', 'tv-show', and 'trailer' are supported
 * in the ContentType definition. 'documentary' and 'kids' can be added
 * when the type is extended in the future.
 */
const CONTENT_TYPE_OPTIONS: Array<{
  value: ContentType | 'all';
  label: string;
}> = [
  { value: 'all', label: 'All Content' },
  { value: 'movie', label: 'Movies' },
  { value: 'tv-show', label: 'TV Shows' },
  { value: 'trailer', label: 'Trailers' },
] as const;

/**
 * WatchHistoryFilters Component
 * 
 * Provides filtering controls for watch history including:
 * - Search input for filtering by title
 * - Content type filter buttons (All, Movies, TV Shows, Documentaries, Kids)
 * - Active filter state with visual highlighting
 * - Total item count badge
 * - Responsive layout with flex wrap for mobile
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 6.1
 * 
 * @example
 * ```tsx
 * <WatchHistoryFilters
 *   filters={filters}
 *   onFilterChange={setFilters}
 *   totalCount={historyItems.length}
 * />
 * ```
 */
export function WatchHistoryFilters({
  filters,
  onFilterChange,
  totalCount,
  isSearching = false,
}: WatchHistoryFiltersProps) {
  return (
    <div className="mb-6 space-y-4">
      {/* Search Input - Requirement 7.1 with debouncing (300ms) */}
      <div className="relative">
        <label htmlFor="watch-history-search" className="sr-only">
          Search your watch history
        </label>
        {isSearching ? (
          <Loader2 
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none animate-spin" 
            aria-hidden="true"
          />
        ) : (
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" 
            aria-hidden="true"
          />
        )}
        <Input
          id="watch-history-search"
          type="search"
          placeholder="Search your watch history..."
          value={filters.searchQuery}
          onChange={(e) =>
            onFilterChange({ ...filters, searchQuery: e.target.value })
          }
          className="pl-10"
          aria-label="Search watch history by title"
          aria-describedby="search-hint"
        />
        <span id="search-hint" className="sr-only">
          Type to search your watch history. Results update automatically as you type.
        </span>
      </div>

      {/* Content Type Filters - Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 6.1 */}
      <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Filter by content type">
        <Filter 
          className="h-4 w-4 text-muted-foreground flex-shrink-0" 
          aria-hidden="true"
        />
        <span className="sr-only">Filter options:</span>
        
        {/* Filter Buttons - Requirement 7.1, 7.2 */}
        {CONTENT_TYPE_OPTIONS.map((option) => {
          const isActive = filters.contentType === option.value;
          return (
            <Button
              key={option.value}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                onFilterChange({ ...filters, contentType: option.value })
              }
              className="transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-pressed={isActive}
              aria-label={`${isActive ? 'Currently showing' : 'Show'} ${option.label}`}
            >
              {option.label}
            </Button>
          );
        })}
        
        {/* Total Item Count Badge - Requirement 7.5 */}
        <Badge 
          variant="secondary" 
          className="ml-auto flex-shrink-0"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="sr-only">Total:</span>
          {totalCount} {totalCount === 1 ? 'item' : 'items'}
        </Badge>
      </div>
    </div>
  );
}
