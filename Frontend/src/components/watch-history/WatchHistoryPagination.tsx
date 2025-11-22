/**
 * Watch History Pagination Component
 * 
 * Provides pagination controls for watch history when there are more than 20 items.
 * Displays page numbers, navigation buttons, and item count information.
 * 
 * Features:
 * - Previous/Next navigation buttons
 * - Page number buttons (with ellipsis for large page counts)
 * - Current page highlighting
 * - Total items display
 * - Responsive layout
 * - Keyboard accessible
 * 
 * Requirements: 6.3 (pagination for >20 items)
 * 
 * @module WatchHistoryPagination
 */

'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WatchHistoryPaginationProps {
  /** Current page number (0-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items */
  totalItems: number;
  /** Callback when next page is clicked */
  onNextPage: () => void;
  /** Callback when previous page is clicked */
  onPreviousPage: () => void;
  /** Callback when a specific page is clicked */
  onGoToPage: (page: number) => void;
}

/**
 * Generate page numbers to display
 * 
 * Shows up to 7 page numbers with ellipsis for large page counts:
 * - Always show first and last page
 * - Show current page and 2 pages on each side
 * - Use ellipsis (...) for gaps
 * 
 * Examples:
 * - 5 pages: [1, 2, 3, 4, 5]
 * - 10 pages, current 1: [1, 2, 3, ..., 10]
 * - 10 pages, current 5: [1, ..., 4, 5, 6, ..., 10]
 * - 10 pages, current 9: [1, ..., 8, 9, 10]
 */
function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    // Show all pages if 7 or fewer
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const pages: (number | 'ellipsis')[] = [];
  
  // Always show first page
  pages.push(0);

  if (currentPage <= 3) {
    // Near the start: show first 5 pages
    for (let i = 1; i < 5; i++) {
      pages.push(i);
    }
    pages.push('ellipsis');
  } else if (currentPage >= totalPages - 4) {
    // Near the end: show last 5 pages
    pages.push('ellipsis');
    for (let i = totalPages - 5; i < totalPages - 1; i++) {
      pages.push(i);
    }
  } else {
    // In the middle: show current page and 2 on each side
    pages.push('ellipsis');
    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      pages.push(i);
    }
    pages.push('ellipsis');
  }

  // Always show last page
  pages.push(totalPages - 1);

  return pages;
}

/**
 * WatchHistoryPagination Component
 * 
 * Displays pagination controls for navigating through watch history items.
 * Only shown when there are more than 20 items (more than 1 page).
 * 
 * @example
 * ```tsx
 * <WatchHistoryPagination
 *   currentPage={0}
 *   totalPages={5}
 *   totalItems={95}
 *   onNextPage={loadNextPage}
 *   onPreviousPage={loadPreviousPage}
 *   onGoToPage={goToPage}
 * />
 * ```
 */
export function WatchHistoryPagination({
  currentPage,
  totalPages,
  totalItems,
  onNextPage,
  onPreviousPage,
  onGoToPage,
}: WatchHistoryPaginationProps) {
  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const startItem = currentPage * 20 + 1;
  const endItem = Math.min((currentPage + 1) * 20, totalItems);

  return (
    <nav 
      className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
      role="navigation"
      aria-label="Pagination navigation"
    >
      {/* Item count info */}
      <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> items
      </p>

      {/* Pagination controls */}
      <div className="flex items-center gap-2" role="group" aria-label="Pagination controls">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousPage}
          disabled={currentPage === 0}
          aria-label={`Go to previous page${currentPage > 0 ? `, page ${currentPage}` : ''}`}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only sm:ml-1">Previous</span>
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1" role="list" aria-label="Page numbers">
          {pageNumbers.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-muted-foreground"
                  aria-hidden="true"
                  role="presentation"
                >
                  ...
                </span>
              );
            }

            const isCurrentPage = page === currentPage;
            const displayPage = page + 1; // Convert to 1-indexed for display

            return (
              <Button
                key={page}
                variant={isCurrentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => onGoToPage(page)}
                disabled={isCurrentPage}
                aria-label={isCurrentPage ? `Current page, page ${displayPage}` : `Go to page ${displayPage}`}
                aria-current={isCurrentPage ? 'page' : undefined}
                className="min-w-[2.5rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                role="listitem"
              >
                {displayPage}
              </Button>
            );
          })}
        </div>

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={currentPage === totalPages - 1}
          aria-label={`Go to next page${currentPage < totalPages - 1 ? `, page ${currentPage + 2}` : ''}`}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <span className="sr-only sm:not-sr-only sm:mr-1">Next</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
