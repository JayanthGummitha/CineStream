/**
 * Tests for useWatchHistory hook
 * 
 * Tests cover:
 * - Filter logic (content type, search)
 * - Delete operations with confirmation
 * - Pagination functionality
 * - Error handling scenarios
 * - Loading states
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useWatchHistory } from '../useWatchHistory';
import * as watchProgressStorage from '@/lib/watch-progress-storage';
import { WatchProgressData } from '@/types/watch-progress';

// Mock dependencies
jest.mock('@/lib/watch-progress-storage');
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'test-user-123' } }),
}));
jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn(),
}));
jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value, // No debounce in tests
}));

const mockGetAllProgress = watchProgressStorage.getAllProgress as jest.MockedFunction<typeof watchProgressStorage.getAllProgress>;
const mockDeleteProgress = watchProgressStorage.deleteProgress as jest.MockedFunction<typeof watchProgressStorage.deleteProgress>;
const mockClearOldProgress = watchProgressStorage.clearOldProgress as jest.MockedFunction<typeof watchProgressStorage.clearOldProgress>;

// Test data
const mockHistoryItems: WatchProgressData[] = [
  {
    videoId: 'movie-1',
    userId: 'test-user-123',
    contentType: 'movie',
    currentTime: 3600,
    duration: 7200,
    percentage: 50,
    lastWatchedAt: '2025-11-16T10:00:00Z',
    title: 'The Matrix',
    thumbnail: '/images/matrix.jpg',
  },
  {
    videoId: 'tv-1',
    userId: 'test-user-123',
    contentType: 'tv-show',
    currentTime: 1200,
    duration: 2400,
    percentage: 50,
    lastWatchedAt: '2025-11-15T10:00:00Z',
    title: 'Breaking Bad',
    thumbnail: '/images/breaking-bad.jpg',
    seasonNumber: 1,
    episodeNumber: 1,
    episodeTitle: 'Pilot',
  },
  {
    videoId: 'movie-2',
    userId: 'test-user-123',
    contentType: 'movie',
    currentTime: 1800,
    duration: 6000,
    percentage: 30,
    lastWatchedAt: '2025-11-14T10:00:00Z',
    title: 'Inception',
    thumbnail: '/images/inception.jpg',
  },
];

describe('useWatchHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClearOldProgress.mockResolvedValue(undefined);
    mockGetAllProgress.mockResolvedValue(mockHistoryItems);
    mockDeleteProgress.mockResolvedValue(undefined);
  });

  describe('Initial Loading', () => {
    it('loads history items on mount', async () => {
      const { result } = renderHook(() => useWatchHistory());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockClearOldProgress).toHaveBeenCalledWith('test-user-123', 30);
      expect(mockGetAllProgress).toHaveBeenCalledWith('test-user-123');
      expect(result.current.historyItems).toEqual(mockHistoryItems);
    });

    it('handles empty history', async () => {
      mockGetAllProgress.mockResolvedValue([]);

      const { result } = renderHook(() => useWatchHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.historyItems).toEqual([]);
      expect(result.current.filteredItems).toEqual([]);
    });
  });

  describe('Content Type Filtering', () => {
    it('filters items by movie content type', async () => {
      const { result } = renderHook(() => useWatchHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setFilters({
          contentType: 'movie',
          searchQuery: '',
        });
      });

      expect(result.current.filteredItems).toHaveLength(2);
      expect(result.current.filteredItems.every(item => item.contentType === 'movie')).toBe(true);
    });

    it('filters items by tv-show content type', async () => {
      const { result } = renderHook(() => useWatchHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setFilters({
          contentType: 'tv-show',
          searchQuery: '',
        });
      });

      expect(result.current.filteredItems).toHaveLength(1);
      expect(result.current.filteredItems[0].contentType).toBe('tv-show');
    });

    it('shows all items when filter is set to "all"', async () => {
      const { result } = renderHook(() => useWatchHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setFilters({
          contentType: 'all',
          searchQuery: '',
        });
      });

      expect(result.current.filteredItems).toHaveLength(3);
    });
  });

  describe('Search Filtering', () => {
    it('filters items by title search query', async () => {
      const { result } = renderHook(() => useWatchHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setFilters({
          contentType: 'all',
          searchQuery: 'matrix',
        });
      });

      expect(result.current.filteredItems).toHaveLength(1);
      expect(result.current.filteredItems[0].title).toBe('The Matrix');
    });

    it('performs case-insensitive search', async () => {
      const { result } = renderHook(() => useWatchHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setFilters({
          contentType: 'all',
          searchQuery: 'BREAKING',
        });
      });

      expect(result.current.filteredItems).toHaveLength(1);
      expect(result.current.filteredItems[0].title).toBe('Breaking Bad');
    });

    it('searches in episode titles for TV shows', async () => {
      const { result } = renderHook(() => useWatchHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setFilters({
          contentType: 'all',
          searchQuery: 'pilot',
        });
      });

      expect(result.current.filteredItems).toHaveLength(1);
      expect(result.current.filteredItems[0].episodeTitle).toBe('Pilot');
    });

    it('returns empty array when no matches found', async () => {
      const { result } = renderHook(() => useWatchHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setFilters({
          contentType: 'all',
          searchQuery: 'nonexistent',
        });
      });

      expect(result.current.filteredItems).toHaveLength(0);
    });
  });

  describe('Combined Filtering', () => {
    it('applies both content type and search filters', async () => {
      const { result } = renderHook(() => useWatchHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setFilters({
          contentType: 'movie',
          searchQuery: 'inception',
        });
      });

      expect(result.current.filteredItems).toHaveLength(1);
      expect(result.current.filteredItems[0].title).toBe('Inception');
      expect(result.current.filteredItems[0].contentType).toBe('movie');
    });
  });

  describe('Delete Operations', () => {
    it('deletes an item successfully', async () => {
      const { result } = renderHook(() => useWatchHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteItem('movie-1', 'The Matrix');
      });

      expect(mockDeleteProgress).toHaveBeenCalledWith('test-user-123', 'movie-1');
      expect(result.current.historyItems).toHaveLength(2);
      expect(result.current.historyItems.find(item => item.videoId === 'movie-1')).toBeUndefined();
    });

    it('handles delete confirmation flow', async () => {
      const { result } = renderHook(() => useWatchHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const itemToDelete = result.current.historyItems[0];

      act(() => {
        result.current.setItemToDelete(itemToDelete);
      });

      expect(result.current.itemToDelete).toEqual(itemToDelete);

      await act(async () => {
        await result.current.confirmDelete();
      });

      expect(mockDeleteProgress).toHaveBeenCalledWith('test-user-123', itemToDelete.videoId);
      expect(result.current.itemToDelete).toBeNull();
    });

    it('cancels delete operation', async () => {
      const { result } = renderHook(() => useWatchHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const itemToDelete = result.current.historyItems[0];

      act(() => {
        result.current.setItemToDelete(itemToDelete);
      });

      expect(result.current.itemToDelete).toEqual(itemToDelete);

      act(() => {
        result.current.cancelDelete();
      });

      expect(result.current.itemToDelete).toBeNull();
      expect(mockDeleteProgress).not.toHaveBeenCalled();
    });
  });

  describe('Pagination', () => {
    it('calculates pagination correctly', async () => {
      const { result } = renderHook(() => useWatchHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.pagination.totalItems).toBe(3);
      expect(result.current.pagination.totalPages).toBe(1);
      expect(result.current.pagination.currentPage).toBe(0);
      expect(result.current.pagination.itemsPerPage).toBe(20);
    });

    it('paginates items correctly', async () => {
      // Create more items to test pagination
      const manyItems = Array.from({ length: 25 }, (_, i) => ({
        ...mockHistoryItems[0],
        videoId: `movie-${i}`,
        title: `Movie ${i}`,
      }));

      mockGetAllProgress.mockResolvedValue(manyItems);

      const { result } = renderHook(() => useWatchHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.paginatedItems).toHaveLength(20);
      expect(result.current.pagination.totalPages).toBe(2);
      expect(result.current.hasMore).toBe(true);

      act(() => {
        result.current.loadNextPage();
      });

      expect(result.current.pagination.currentPage).toBe(1);
      expect(result.current.paginatedItems).toHaveLength(5);
      expect(result.current.hasMore).toBe(false);
    });

    it('resets to first page when filters change', async () => {
      const manyItems = Array.from({ length: 25 }, (_, i) => ({
        ...mockHistoryItems[0],
        videoId: `movie-${i}`,
        title: `Movie ${i}`,
      }));

      mockGetAllProgress.mockResolvedValue(manyItems);

      const { result } = renderHook(() => useWatchHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.loadNextPage();
      });

      expect(result.current.pagination.currentPage).toBe(1);

      act(() => {
        result.current.setFilters({
          contentType: 'movie',
          searchQuery: '',
        });
      });

      expect(result.current.pagination.currentPage).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('handles storage errors gracefully', async () => {
      mockGetAllProgress.mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useWatchHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.historyItems).toEqual([]);
    });

    it('retries loading after error', async () => {
      mockGetAllProgress.mockRejectedValueOnce(new Error('Storage error'));
      mockGetAllProgress.mockResolvedValueOnce(mockHistoryItems);

      const { result } = renderHook(() => useWatchHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();

      await act(async () => {
        await result.current.retryLoad();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.historyItems).toEqual(mockHistoryItems);
      });
    });
  });
});
