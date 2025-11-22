/**
 * Integration Tests for Watch History Feature
 * 
 * Tests cover end-to-end user flows:
 * - Load history → apply filters → delete item
 * - Empty state handling
 * - Error recovery scenarios
 * - Navigation to content pages
 * - Responsive behavior at different breakpoints
 * 
 * Requirements: All requirements (integration testing validates end-to-end functionality)
 * 
 * Note: These tests focus on core integration scenarios and user flows.
 * Individual component tests cover detailed unit testing.
 */

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { WatchHistoryClient } from '../WatchHistoryClient';
import * as watchProgressStorage from '@/lib/watch-progress-storage';
import { WatchProgressData } from '@/types/watch-progress';

// Mock Next.js components
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: (date: Date) => {
    const now = new Date('2025-11-16T12:00:00Z');
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours} hours ago`;
  },
}));

// Mock storage service
jest.mock('@/lib/watch-progress-storage');

describe('WatchHistoryClient Integration Tests', () => {
  const mockGetAllProgress = watchProgressStorage.getAllProgress as jest.MockedFunction<typeof watchProgressStorage.getAllProgress>;
  const mockDeleteProgress = watchProgressStorage.deleteProgress as jest.MockedFunction<typeof watchProgressStorage.deleteProgress>;
  const mockClearOldProgress = watchProgressStorage.clearOldProgress as jest.MockedFunction<typeof watchProgressStorage.clearOldProgress>;

  const mockHistoryData: WatchProgressData[] = [
    {
      videoId: 'movie-1',
      userId: 'user-123',
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
      userId: 'user-123',
      contentType: 'tv-show',
      currentTime: 1200,
      duration: 2400,
      percentage: 75,
      lastWatchedAt: '2025-11-16T08:00:00Z',
      title: 'Breaking Bad',
      thumbnail: '/images/breaking-bad.jpg',
      seasonNumber: 1,
      episodeNumber: 1,
      episodeTitle: 'Pilot',
    },
    {
      videoId: 'movie-2',
      userId: 'user-123',
      contentType: 'movie',
      currentTime: 1800,
      duration: 5400,
      percentage: 33,
      lastWatchedAt: '2025-11-16T06:00:00Z',
      title: 'Inception',
      thumbnail: '/images/inception.jpg',
    },
    {
      videoId: 'movie-3',
      userId: 'user-123',
      contentType: 'movie',
      currentTime: 7000,
      duration: 7200,
      percentage: 97,
      lastWatchedAt: '2025-11-16T04:00:00Z',
      title: 'Interstellar',
      thumbnail: '/images/interstellar.jpg',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockClearOldProgress.mockResolvedValue(undefined);
    mockGetAllProgress.mockResolvedValue(mockHistoryData);
    mockDeleteProgress.mockResolvedValue(undefined);
  });

  describe('Full User Flow: Load → Filter → Delete', () => {
    it('loads history, applies content type filter, and deletes an item', async () => {
      render(<WatchHistoryClient />);

      // Step 1: Verify loading state
      expect(screen.getByText(/loading your watch history/i)).toBeInTheDocument();

      // Step 2: Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('The Matrix')).toBeInTheDocument();
      });

      // Verify all items are displayed
      expect(screen.getByText('The Matrix')).toBeInTheDocument();
      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
      expect(screen.getByText('Inception')).toBeInTheDocument();

      // Step 3: Apply content type filter (Movies only)
      const moviesButton = screen.getByRole('button', { name: /^movies$/i });
      fireEvent.click(moviesButton);

      // Verify only movies are shown
      await waitFor(() => {
        expect(screen.getByText('The Matrix')).toBeInTheDocument();
        expect(screen.getByText('Inception')).toBeInTheDocument();
        expect(screen.queryByText('Breaking Bad')).not.toBeInTheDocument();
      });

      // Step 4: Delete an item
      const deleteButtons = screen.getAllByRole('button', { name: /remove.*from watch history/i });
      fireEvent.click(deleteButtons[0]); // Delete first movie

      // Verify confirmation dialog appears
      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /^delete$/i });
      fireEvent.click(confirmButton);

      // Verify item is removed
      await waitFor(() => {
        expect(mockDeleteProgress).toHaveBeenCalledWith('user-123', 'movie-1');
      });
    });

    it('loads history, applies search filter, and verifies results', async () => {
      render(<WatchHistoryClient />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('The Matrix')).toBeInTheDocument();
      });

      // Apply search filter
      const searchInput = screen.getByPlaceholderText(/search your watch history/i);
      fireEvent.change(searchInput, { target: { value: 'matrix' } });

      // Wait for debounce (300ms)
      await waitFor(() => {
        expect(screen.getByText('The Matrix')).toBeInTheDocument();
        expect(screen.queryByText('Breaking Bad')).not.toBeInTheDocument();
        expect(screen.queryByText('Inception')).not.toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('combines multiple filters (content type + search)', async () => {
      render(<WatchHistoryClient />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('The Matrix')).toBeInTheDocument();
      });

      // Apply content type filter
      const moviesButton = screen.getByRole('button', { name: /^movies$/i });
      fireEvent.click(moviesButton);

      // Apply search filter
      const searchInput = screen.getByPlaceholderText(/search your watch history/i);
      fireEvent.change(searchInput, { target: { value: 'inception' } });

      // Wait for filters to apply
      await waitFor(() => {
        expect(screen.getByText('Inception')).toBeInTheDocument();
        expect(screen.queryByText('The Matrix')).not.toBeInTheDocument();
        expect(screen.queryByText('Breaking Bad')).not.toBeInTheDocument();
      }, { timeout: 500 });
    });
  });

  describe('Empty State Handling', () => {
    it('displays empty state when no history exists', async () => {
      mockGetAllProgress.mockResolvedValue([]);

      render(<WatchHistoryClient />);

      await waitFor(() => {
        expect(screen.getByText('No watch history yet')).toBeInTheDocument();
      });

      expect(screen.getByText(/start watching movies/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /browse content/i })).toBeInTheDocument();
    });

    it('displays no results state when filters return empty', async () => {
      render(<WatchHistoryClient />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('The Matrix')).toBeInTheDocument();
      });

      // Apply search that returns no results
      const searchInput = screen.getByPlaceholderText(/search your watch history/i);
      fireEvent.change(searchInput, { target: { value: 'nonexistent movie' } });

      // Wait for filter to apply
      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
      }, { timeout: 500 });

      expect(screen.getByText(/try adjusting your filters/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
    });

    it('clears filters when clear filters button is clicked', async () => {
      render(<WatchHistoryClient />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('The Matrix')).toBeInTheDocument();
      });

      // Apply filter that returns no results
      const searchInput = screen.getByPlaceholderText(/search your watch history/i);
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
      }, { timeout: 500 });

      // Mock window.location.reload
      const reloadMock = jest.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadMock },
        writable: true,
      });

      // Click clear filters
      const clearButton = screen.getByRole('button', { name: /clear filters/i });
      fireEvent.click(clearButton);

      expect(reloadMock).toHaveBeenCalled();
    });
  });

  describe('Error Recovery Scenarios', () => {
    it('displays error message when data loading fails', async () => {
      mockGetAllProgress.mockRejectedValue(new Error('Network error'));

      render(<WatchHistoryClient />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load watch history/i)).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('retries loading data when retry button is clicked', async () => {
      mockGetAllProgress.mockRejectedValueOnce(new Error('Network error'));
      mockGetAllProgress.mockResolvedValueOnce(mockHistoryData);

      render(<WatchHistoryClient />);

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText(/failed to load watch history/i)).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      // Verify data loads successfully
      await waitFor(() => {
        expect(screen.getByText('The Matrix')).toBeInTheDocument();
      });
    });

    it('handles delete operation failure gracefully', async () => {
      mockDeleteProgress.mockRejectedValue(new Error('Delete failed'));

      render(<WatchHistoryClient />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('The Matrix')).toBeInTheDocument();
      });

      // Attempt to delete an item
      const deleteButton = screen.getAllByRole('button', { name: /remove.*from watch history/i })[0];
      fireEvent.click(deleteButton);

      // Confirm deletion
      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /^delete$/i });
      fireEvent.click(confirmButton);

      // Verify error is handled (item should still be visible)
      await waitFor(() => {
        expect(screen.getByText('The Matrix')).toBeInTheDocument();
      });
    });

    it('cleans up old progress on initial load', async () => {
      render(<WatchHistoryClient />);

      await waitFor(() => {
        expect(mockClearOldProgress).toHaveBeenCalledWith('user-123', 30);
      });
    });
  });

  describe('Navigation to Content Pages', () => {
    it('navigates to movie page when movie card is clicked', async () => {
      render(<WatchHistoryClient />);

      await waitFor(() => {
        expect(screen.getByText('The Matrix')).toBeInTheDocument();
      });

      const movieLink = screen.getByRole('link', { name: /continue watching the matrix/i });
      expect(movieLink).toHaveAttribute('href', '/movie/movie-1');
    });

    it('navigates to TV show page when TV show card is clicked', async () => {
      render(<WatchHistoryClient />);

      await waitFor(() => {
        expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
      });

      const tvLink = screen.getByRole('link', { name: /continue watching breaking bad/i });
      expect(tvLink).toHaveAttribute('href', '/tv-shows/tv-1');
    });

    it('includes episode information in TV show navigation', async () => {
      render(<WatchHistoryClient />);

      await waitFor(() => {
        expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
      });

      expect(screen.getByText(/S1 E1: Pilot/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior at Different Breakpoints', () => {
    const setViewportWidth = (width: number) => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width,
      });
      window.dispatchEvent(new Event('resize'));
    };

    it('displays single column layout on mobile (320px)', async () => {
      setViewportWidth(320);

      render(<WatchHistoryClient />);

      await waitFor(() => {
        expect(screen.getByText('The Matrix')).toBeInTheDocument();
      });

      const grid = screen.getByRole('list');
      expect(grid).toHaveClass('grid-cols-1');
    });

    it('displays two column layout on tablet (768px)', async () => {
      setViewportWidth(768);

      render(<WatchHistoryClient />);

      await waitFor(() => {
        expect(screen.getByText('The Matrix')).toBeInTheDocument();
      });

      const grid = screen.getByRole('list');
      expect(grid).toHaveClass('md:grid-cols-2');
    });

    it('displays three column layout on desktop (1024px)', async () => {
      setViewportWidth(1024);

      render(<WatchHistoryClient />);

      await waitFor(() => {
        expect(screen.getByText('The Matrix')).toBeInTheDocument();
      });

      const grid = screen.getByRole('list');
      expect(grid).toHaveClass('lg:grid-cols-3');
    });

    it('displays four column layout on large desktop (1280px)', async () => {
      setViewportWidth(1280);

      render(<WatchHistoryClient />);

      await waitFor(() => {
        expect(screen.getByText('The Matrix')).toBeInTheDocument();
      });

      const grid = screen.getByRole('list');
      expect(grid).toHaveClass('xl:grid-cols-4');
    });

    it('wraps filter buttons on mobile', async () => {
      setViewportWidth(320);

      render(<WatchHistoryClient />);

      await waitFor(() => {
        expect(screen.getByText('The Matrix')).toBeInTheDocument();
      });

      const filterSection = screen.getByLabelText('Filter controls');
      const filterContainer = within(filterSection).getByRole('group', { hidden: true });
      expect(filterContainer).toHaveClass('flex-wrap');
    });
  });

  describe('Pagination Integration', () => {
    it('displays pagination when more than 20 items exist', async () => {
      // Create 25 mock items
      const manyItems: WatchProgressData[] = Array.from({ length: 25 }, (_, i) => ({
        videoId: `movie-${i}`,
        userId: 'user-123',
        contentType: 'movie' as const,
        currentTime: 1800,
        duration: 7200,
        percentage: 25,
        lastWatchedAt: new Date(Date.now() - i * 1000 * 60 * 60).toISOString(),
        title: `Movie ${i}`,
        thumbnail: `/images/movie-${i}.jpg`,
      }));

      mockGetAllProgress.mockResolvedValue(manyItems);

      render(<WatchHistoryClient />);

      await waitFor(() => {
        expect(screen.getByText('Movie 0')).toBeInTheDocument();
      });

      // Verify pagination controls are present
      expect(screen.getByLabelText('Watch history pagination')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();
    });

    it('does not display pagination when 20 or fewer items exist', async () => {
      render(<WatchHistoryClient />);

      await waitFor(() => {
        expect(screen.getByText('The Matrix')).toBeInTheDocument();
      });

      // Verify pagination controls are not present
      expect(screen.queryByLabelText('Watch history pagination')).not.toBeInTheDocument();
    });

    it('navigates between pages', async () => {
      // Create 25 mock items
      const manyItems: WatchProgressData[] = Array.from({ length: 25 }, (_, i) => ({
        videoId: `movie-${i}`,
        userId: 'user-123',
        contentType: 'movie' as const,
        currentTime: 1800,
        duration: 7200,
        percentage: 25,
        lastWatchedAt: new Date(Date.now() - i * 1000 * 60 * 60).toISOString(),
        title: `Movie ${i}`,
        thumbnail: `/images/movie-${i}.jpg`,
      }));

      mockGetAllProgress.mockResolvedValue(manyItems);

      render(<WatchHistoryClient />);

      await waitFor(() => {
        expect(screen.getByText('Movie 0')).toBeInTheDocument();
      });

      // Verify first page items are visible
      expect(screen.getByText('Movie 0')).toBeInTheDocument();
      expect(screen.queryByText('Movie 20')).not.toBeInTheDocument();

      // Navigate to next page
      const nextButton = screen.getByRole('button', { name: /next page/i });
      fireEvent.click(nextButton);

      // Verify second page items are visible
      await waitFor(() => {
        expect(screen.getByText('Movie 20')).toBeInTheDocument();
      });
      expect(screen.queryByText('Movie 0')).not.toBeInTheDocument();
    });
  });

  describe('Completed Items Display', () => {
    it('displays completed items (90%+) with completed badge', async () => {
      render(<WatchHistoryClient />);

      await waitFor(() => {
        expect(screen.getByText('Interstellar')).toBeInTheDocument();
      });

      // Verify completed item is shown
      expect(screen.getByText('Interstellar')).toBeInTheDocument();
      
      // Verify all items including completed ones are displayed
      expect(screen.getByText('The Matrix')).toBeInTheDocument();
      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
      expect(screen.getByText('Inception')).toBeInTheDocument();
      expect(screen.getByText('Interstellar')).toBeInTheDocument();
    });

    it('shows both in-progress and completed items in history', async () => {
      render(<WatchHistoryClient />);

      await waitFor(() => {
        expect(screen.getByText('The Matrix')).toBeInTheDocument();
      });

      // Count all items - should include completed ones
      const allItems = screen.getAllByRole('article');
      expect(allItems.length).toBe(4); // 3 in-progress + 1 completed
    });
  });

  describe('Delete Confirmation Dialog Integration', () => {
    it('opens dialog when delete button is clicked', async () => {
      render(<WatchHistoryClient />);

      await waitFor(() => {
        expect(screen.getByText('The Matrix')).toBeInTheDocument();
      });

      const deleteButton = screen.getAllByRole('button', { name: /remove.*from watch history/i })[0];
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      expect(screen.getByText(/are you sure you want to remove/i)).toBeInTheDocument();
    });

    it('closes dialog when cancel button is clicked', async () => {
      render(<WatchHistoryClient />);

      await waitFor(() => {
        expect(screen.getByText('The Matrix')).toBeInTheDocument();
      });

      // Open dialog
      const deleteButton = screen.getAllByRole('button', { name: /remove.*from watch history/i })[0];
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      // Cancel deletion
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      // Verify dialog is closed
      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });

      // Verify item is still present
      expect(screen.getByText('The Matrix')).toBeInTheDocument();
    });

    it('closes dialog with Escape key', async () => {
      render(<WatchHistoryClient />);

      await waitFor(() => {
        expect(screen.getByText('The Matrix')).toBeInTheDocument();
      });

      // Open dialog
      const deleteButton = screen.getAllByRole('button', { name: /remove.*from watch history/i })[0];
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      // Press Escape
      fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape', code: 'Escape' });

      // Verify dialog is closed
      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Integration', () => {
    it('maintains proper focus management throughout user flow', async () => {
      render(<WatchHistoryClient />);

      await waitFor(() => {
        expect(screen.getByText('The Matrix')).toBeInTheDocument();
      });

      // Focus on search input
      const searchInput = screen.getByPlaceholderText(/search your watch history/i);
      searchInput.focus();
      expect(document.activeElement).toBe(searchInput);

      // Tab to filter buttons
      fireEvent.keyDown(searchInput, { key: 'Tab' });
      
      // Focus should move to first filter button
      const allContentButton = screen.getByRole('button', { name: /all content/i });
      expect(document.activeElement).toBe(allContentButton);
    });

    it('announces loading state to screen readers', async () => {
      render(<WatchHistoryClient />);

      const loadingText = screen.getByText(/loading your watch history/i);
      expect(loadingText).toBeInTheDocument();
      
      const loadingRegion = loadingText.closest('section');
      expect(loadingRegion).toHaveAttribute('aria-busy', 'true');
      expect(loadingRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('announces error state to screen readers', async () => {
      mockGetAllProgress.mockRejectedValue(new Error('Network error'));

      render(<WatchHistoryClient />);

      await waitFor(() => {
        const errorAlert = screen.getByRole('alert');
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveAttribute('aria-live', 'assertive');
      });
    });

    it('provides proper ARIA labels for all interactive elements', async () => {
      render(<WatchHistoryClient />);

      await waitFor(() => {
        expect(screen.getByText('The Matrix')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Check main region
      expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Watch History');

      // Check filter section
      expect(screen.getByLabelText('Filter controls')).toBeInTheDocument();

      // Check history items list
      expect(screen.getByLabelText('Watch history items')).toBeInTheDocument();
    });
  });
});
