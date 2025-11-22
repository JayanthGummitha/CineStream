/**
 * Watch History Hook
 * 
 * Custom hook for managing watch history with filtering, search, and delete operations.
 * Integrates with the existing watch-progress-storage service and provides state management
 * for the watch history page.
 * 
 * Features:
 * - Automatic cleanup of entries older than 30 days
 * - Content type filtering (movies, TV shows, documentaries, kids)
 * - Debounced search functionality (300ms delay)
 * - Delete operations with confirmation state
 * - Loading states
 * - Pagination for large datasets
 * 
 * @module useWatchHistory
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { WatchProgressData, ContentType } from '@/types/watch-progress';
import { 
  getAllProgress, 
  deleteProgress, 
  clearOldProgress 
} from '@/lib/watch-progress-storage';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { WatchProgressError } from '@/types/watch-progress';

/**
 * Filter options for watch history
 */
export interface WatchHistoryFilters {
  /** Content type filter ('all' or specific content type) */
  contentType: ContentType | 'all';
  /** Search query for filtering by title */
  searchQuery: string;
}

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  /** Current page number (0-indexed) */
  currentPage: number;
  /** Number of items per page */
  itemsPerPage: number;
  /** Total number of items */
  totalItems: number;
  /** Total number of pages */
  totalPages: number;
}

/**
 * Return type for useWatchHistory hook
 */
export interface UseWatchHistoryReturn {
  /** All history items (unfiltered) */
  historyItems: WatchProgressData[];
  /** Filtered history items based on current filters */
  filteredItems: WatchProgressData[];
  /** Paginated items for current page */
  paginatedItems: WatchProgressData[];
  /** Loading state during initial data fetch */
  isLoading: boolean;
  /** Error state when data cannot be retrieved */
  error: string | null;
  /** Current filter values */
  filters: WatchHistoryFilters;
  /** Update filter values */
  setFilters: (filters: WatchHistoryFilters) => void;
  /** Delete a history item by videoId with optional title for toast message */
  deleteItem: (videoId: string, itemTitle?: string) => Promise<void>;
  /** Item pending deletion (for confirmation dialog) */
  itemToDelete: WatchProgressData | null;
  /** Set item to delete (opens confirmation dialog) */
  setItemToDelete: (item: WatchProgressData | null) => void;
  /** Confirm and execute delete operation */
  confirmDelete: () => Promise<void>;
  /** Cancel delete operation */
  cancelDelete: () => void;
  /** Retry loading history after an error */
  retryLoad: () => Promise<void>;
  /** Pagination configuration */
  pagination: PaginationConfig;
  /** Load next page */
  loadNextPage: () => void;
  /** Load previous page */
  loadPreviousPage: () => void;
  /** Go to specific page */
  goToPage: (page: number) => void;
  /** Whether there are more items to load */
  hasMore: boolean;
}

/**
 * Custom hook for watch history management
 * 
 * Provides comprehensive watch history functionality including:
 * - Loading history with automatic cleanup of old entries
 * - Filtering by content type and search query
 * - Delete operations with confirmation state
 * - Integration with authentication
 * 
 * @example
 * ```tsx
 * const {
 *   filteredItems,
 *   isLoading,
 *   filters,
 *   setFilters,
 *   setItemToDelete,
 *   confirmDelete,
 *   cancelDelete,
 *   itemToDelete
 * } = useWatchHistory();
 * 
 * // Display filtered items
 * {filteredItems.map(item => (
 *   <WatchHistoryCard
 *     key={item.videoId}
 *     item={item}
 *     onDelete={() => setItemToDelete(item)}
 *   />
 * ))}
 * 
 * // Delete confirmation dialog
 * <DeleteConfirmDialog
 *   open={!!itemToDelete}
 *   item={itemToDelete}
 *   onConfirm={confirmDelete}
 *   onCancel={cancelDelete}
 * />
 * ```
 */
export function useWatchHistory(): UseWatchHistoryReturn {
  // State management
  const [historyItems, setHistoryItems] = useState<WatchProgressData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<WatchHistoryFilters>({
    contentType: 'all',
    searchQuery: '',
  });
  const [itemToDelete, setItemToDelete] = useState<WatchProgressData | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 20; // Show 20 items per page (Requirement 6.3)

  // Get authenticated user
  const { user } = useAuth();
  const userId = user?.id || '';

  // Debounce search query for better performance (300ms delay)
  const debouncedSearchQuery = useDebounce(filters.searchQuery, 300);

  /**
   * Load watch history on mount and clean old entries
   * 
   * Performs the following operations:
   * 1. Cleans up entries older than 30 days (Requirement 1.4)
   * 2. Fetches all remaining progress entries
   * 3. Filters to show only items with meaningful progress (1-99%)
   * 4. Sorts by most recent first (Requirement 1.2)
   * 
   * Error Handling (Requirement 6.5):
   * - Storage quota exceeded: Attempts aggressive cleanup
   * - Corrupted data: Logs error and continues with valid data
   * - General errors: Shows error message with retry option
   */
  const loadHistory = useCallback(async () => {
    // Skip if no user is authenticated
    if (!userId) {
      setIsLoading(false);
      setHistoryItems([]);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Clean up entries older than 30 days (Requirement 1.4)
      await clearOldProgress(userId, 30);
      
      // Fetch all progress entries (Requirement 1.1, 1.6)
      const progress = await getAllProgress(userId);
      
      // Show ONLY completed content (90% or higher)
      // Watch History = Completed content only
      // Continue Watching = In-progress content (1-89%)
      const filtered = progress.filter(
        (item) => item.percentage >= 90
      );
      
      // Items are already sorted by lastWatchedAt in getAllProgress
      // (most recent first - Requirement 1.2)
      setHistoryItems(filtered);
    } catch (err) {
      // Log error for debugging (Requirement: Log errors to console)
      console.error('Failed to load watch history:', err);
      
      // Handle specific error types (Requirement 6.5)
      if (err instanceof WatchProgressError) {
        if (err.code === 'STORAGE_FULL') {
          // Storage quota exceeded - attempt more aggressive cleanup
          setError('Storage is full. Attempting to free up space...');
          
          try {
            // Try cleaning up entries older than 60 days
            await clearOldProgress(userId, 60);
            
            // Retry loading
            const progress = await getAllProgress(userId);
            const filtered = progress.filter(
              (item) => item.percentage >= 90
            );
            setHistoryItems(filtered);
            setError(null);
            
            // Show success toast
            toast({
              title: 'Storage cleaned up',
              description: 'Old entries have been removed to free up space.',
            });
          } catch (retryErr) {
            console.error('Failed to recover from storage full error:', retryErr);
            setError('Unable to load watch history. Storage is full. Please clear some data manually.');
            setHistoryItems([]);
          }
        } else if (err.code === 'AUTH_REQUIRED') {
          setError('Please log in to view your watch history.');
          setHistoryItems([]);
        } else if (err.code === 'CORRUPTED') {
          setError('Some watch history data is corrupted. Showing available items.');
          // Continue with whatever data we have
        } else {
          setError('Unable to load watch history. Please try again.');
          setHistoryItems([]);
        }
      } else {
        // Generic error
        setError('Unable to load watch history. Please try again.');
        setHistoryItems([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  /**
   * Apply filters to history items
   * 
   * Implements filtering logic for:
   * - Content type (movies, TV shows, documentaries, kids) - Requirement 7.1, 7.2
   * - Search query (title matching) - Requirement 7.1 with debouncing
   * 
   * Maintains reverse chronological order after filtering - Requirement 7.4
   * Uses useMemo for performance optimization
   */
  const filteredItems = useMemo(() => {
    let filtered = [...historyItems];

    // Content type filter (Requirement 7.1, 7.2)
    if (filters.contentType !== 'all') {
      filtered = filtered.filter(
        (item) => item.contentType === filters.contentType
      );
    }

    // Search filter with debounced query (Requirement 7.1)
    // Using debounced value prevents excessive filtering during typing
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        // Search in title
        const titleMatch = item.title.toLowerCase().includes(query);
        
        // For TV shows, also search in episode title
        const episodeTitleMatch = item.episodeTitle
          ? item.episodeTitle.toLowerCase().includes(query)
          : false;
        
        return titleMatch || episodeTitleMatch;
      });
    }

    // Order is maintained from historyItems (already sorted by lastWatchedAt)
    // Requirement 7.4: maintain reverse chronological order when filters are applied
    return filtered;
  }, [historyItems, filters.contentType, debouncedSearchQuery]);

  /**
   * Calculate pagination configuration
   * 
   * Implements pagination for large datasets (>20 items) - Requirement 6.3
   * Ensures initial load completes within 2 seconds by limiting rendered items
   */
  const pagination = useMemo<PaginationConfig>(() => {
    const totalItems = filteredItems.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    return {
      currentPage,
      itemsPerPage,
      totalItems,
      totalPages,
    };
  }, [filteredItems.length, currentPage, itemsPerPage]);

  /**
   * Get paginated items for current page
   * 
   * Slices filtered items to show only current page
   * Improves performance by limiting DOM nodes
   */
  const paginatedItems = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, currentPage, itemsPerPage]);

  /**
   * Reset to first page when filters change
   */
  useEffect(() => {
    setCurrentPage(0);
  }, [filters.contentType, debouncedSearchQuery]);

  /**
   * Delete a history item
   * 
   * Removes the item from storage and updates the UI immediately
   * (optimistic update for better UX)
   * 
   * Requirements: 5.1, 5.2, 5.3
   * Error Handling: Shows toast notifications for success/failure
   */
  const deleteItem = useCallback(async (videoId: string, itemTitle?: string) => {
    if (!userId) {
      console.error('Cannot delete: user not authenticated');
      toast({
        title: 'Error',
        description: 'You must be logged in to delete items.',
        variant: 'destructive',
      });
      return;
    }

    // Store original items for rollback on error
    const originalItems = historyItems;

    try {
      // Optimistic update - remove from UI immediately (Requirement 5.3)
      setHistoryItems((prev) => prev.filter((item) => item.videoId !== videoId));
      
      // Delete from storage (Requirement 5.2)
      await deleteProgress(userId, videoId);
      
      // Show success toast (Requirement: Add toast notifications for delete operations)
      toast({
        title: 'Removed from history',
        description: itemTitle ? `"${itemTitle}" has been removed from your watch history.` : 'Item removed from your watch history.',
      });
    } catch (err) {
      // Log error for debugging
      console.error('Failed to delete history item:', err);
      
      // Rollback optimistic update
      setHistoryItems(originalItems);
      
      // Show error toast (Requirement: Add toast notifications for delete operations)
      toast({
        title: 'Failed to delete',
        description: 'Unable to remove item from watch history. Please try again.',
        variant: 'destructive',
      });
    }
  }, [userId, historyItems]);

  /**
   * Confirm and execute delete operation
   * 
   * Called when user confirms deletion in the dialog
   * Requirements: 5.2, 5.3, 5.4
   */
  const confirmDelete = useCallback(async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete.videoId, itemToDelete.title);
      setItemToDelete(null);
    }
  }, [itemToDelete, deleteItem]);

  /**
   * Retry loading history after an error
   * 
   * Provides retry functionality for failed operations (Requirement: Add retry functionality)
   */
  const retryLoad = useCallback(async () => {
    await loadHistory();
  }, [loadHistory]);

  /**
   * Cancel delete operation
   * 
   * Closes the confirmation dialog without deleting
   * Requirement: 5.4
   */
  const cancelDelete = useCallback(() => {
    setItemToDelete(null);
  }, []);

  /**
   * Pagination controls
   */
  const loadNextPage = useCallback(() => {
    if (currentPage < pagination.totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, pagination.totalPages]);

  const loadPreviousPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  const goToPage = useCallback((page: number) => {
    if (page >= 0 && page < pagination.totalPages) {
      setCurrentPage(page);
    }
  }, [pagination.totalPages]);

  const hasMore = currentPage < pagination.totalPages - 1;

  return {
    historyItems,
    filteredItems,
    paginatedItems,
    isLoading,
    error,
    filters,
    setFilters,
    deleteItem,
    itemToDelete,
    setItemToDelete,
    confirmDelete,
    cancelDelete,
    retryLoad,
    pagination,
    loadNextPage,
    loadPreviousPage,
    goToPage,
    hasMore,
  };
}
