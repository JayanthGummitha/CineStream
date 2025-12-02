/**
 * Watch History Client Component
 * 
 * Main client-side component for the watch history page.
 * Integrates all sub-components and manages state through the useWatchHistory hook.
 * 
 * Features:
 * - Responsive grid layout (1 col mobile, 2 tablet, 3-4 desktop)
 * - Loading state with skeleton placeholders
 * - Filter controls for content type and search
 * - Empty state handling
 * - Delete confirmation dialog
 * - Header with icon and description
 * 
 * Requirements: 1.1, 1.2, 1.3, 6.1, 6.2, 6.4
 * 
 * @module WatchHistoryClient
 */

'use client';

import { useWatchHistory } from '@/hooks/useWatchHistory';
import { WatchHistoryFilters } from './WatchHistoryFilters';
import { WatchHistoryCard } from './WatchHistoryCard';
import { WatchHistoryEmpty } from './WatchHistoryEmpty';
import { WatchHistoryError } from './WatchHistoryError';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { WatchHistoryPagination } from './WatchHistoryPagination';
import { Skeleton } from '@/components/ui/skeleton';
import { History } from 'lucide-react';

/**
 * WatchHistoryClient Component
 * 
 * Main interactive component for the watch history page.
 * Handles all client-side interactions including filtering, search, and delete operations.
 * 
 * Layout:
 * - Header with icon and description
 * - Filter controls (search + content type buttons)
 * - Responsive grid of history cards
 * - Empty state when no items match filters
 * - Delete confirmation dialog
 * 
 * Responsive Grid Layout (Requirement 6.1):
 * - Mobile (< 768px): 1 column
 * - Tablet (768px - 1024px): 2 columns
 * - Desktop (1024px - 1280px): 3 columns
 * - Large Desktop (>= 1280px): 4 columns
 * 
 * @example
 * ```tsx
 * // In page.tsx
 * export default function HistoryPage() {
 *   return (
 *     <div className="container mx-auto px-4 py-8">
 *       <WatchHistoryClient />
 *     </div>
 *   );
 * }
 * ```
 */
export function WatchHistoryClient() {
  const {
    historyItems,
    filteredItems,
    paginatedItems,
    isLoading,
    error,
    filters,
    setFilters,
    itemToDelete,
    setItemToDelete,
    confirmDelete,
    cancelDelete,
    retryLoad,
    pagination,
    loadNextPage,
    loadPreviousPage,
    goToPage,
  } = useWatchHistory();

  // Check if any filters are active (for empty state)
  const hasActiveFilters = 
    filters.contentType !== 'all' || 
    filters.searchQuery.trim() !== '';

  // Check if search is being debounced (user is typing)
  const isSearching = filters.searchQuery.trim() !== '' && filteredItems.length === historyItems.length;

  return (
    <main role="main" aria-label="Watch History">
      {/* Header - Requirement 6.4 */}
      <header className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-lg ring-0 " aria-hidden="true">
          <History className="h-6 w-6 " aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Watch History</h1>
          <p className="text-muted-foreground" id="watch-history-description">
            Your viewing history from the past 30 days
          </p>
        </div>
      </header>

      {/* Filters - Requirements 7.1, 7.2, 7.3, 7.4, 7.5 */}
      <section aria-label="Filter controls">
        <WatchHistoryFilters 
          filters={filters} 
          onFilterChange={setFilters}
          totalCount={historyItems.length}
          isSearching={isSearching}
        />
      </section>

      {/* Content Grid - Requirements 1.1, 1.2, 6.1, 6.2 */}
      {error ? (
        // Error State - Requirement 6.5 (Display error message when data cannot be retrieved)
        <section role="alert" aria-live="polite">
          <WatchHistoryError message={error} onRetry={retryLoad} />
        </section>
      ) : isLoading ? (
        // Loading State with Skeleton Placeholders - Requirement 6.2
        <section aria-label="Loading watch history" aria-busy="true" aria-live="polite">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3" aria-hidden="true">
                <Skeleton className="aspect-video rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
          <span className="sr-only">Loading your watch history...</span>
        </section>
      ) : filteredItems.length === 0 ? (
        // Empty State - Requirements 1.5, 6.5
        <section role="status" aria-live="polite">
          <WatchHistoryEmpty hasFilters={hasActiveFilters} />
        </section>
      ) : (
        <>
          {/* History Cards Grid - Requirements 1.1, 1.2, 1.3, 6.1, 6.2, 6.3 */}
          {/* Responsive layout: 1 col mobile, 2 tablet, 3-4 desktop */}
          {/* Pagination: Shows 20 items per page for performance */}
          <section 
            aria-label="Watch history items" 
            aria-describedby="watch-history-description"
            role="list"
          >
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedItems.map((item) => (
                <div key={item.videoId} role="listitem">
                  <WatchHistoryCard
                    item={item}
                    onDelete={() => setItemToDelete(item)}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Pagination Controls - Requirement 6.3 */}
          {/* Only show pagination if there are more than 20 items */}
          {pagination.totalPages > 1 && (
            <nav aria-label="Watch history pagination">
              <WatchHistoryPagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                onNextPage={loadNextPage}
                onPreviousPage={loadPreviousPage}
                onGoToPage={goToPage}
              />
            </nav>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog - Requirements 5.1, 5.2, 5.3, 5.4 */}
      <DeleteConfirmDialog
        open={!!itemToDelete}
        item={itemToDelete}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </main>
  );
}
