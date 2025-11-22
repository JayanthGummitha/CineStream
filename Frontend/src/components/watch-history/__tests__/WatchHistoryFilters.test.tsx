/**
 * Tests for WatchHistoryFilters component
 * 
 * Tests cover:
 * - Filter state updates
 * - Search input handling
 * - Content type filter buttons
 * - Active filter styling
 * - Item count display
 * - Accessibility features
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { WatchHistoryFilters } from '../WatchHistoryFilters';
import { WatchHistoryFilters as Filters } from '@/hooks/useWatchHistory';

describe('WatchHistoryFilters', () => {
  const mockOnFilterChange = jest.fn();

  const defaultFilters: Filters = {
    contentType: 'all',
    searchQuery: '',
  };

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  describe('Search Input', () => {
    it('renders search input', () => {
      render(
        <WatchHistoryFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          totalCount={10}
        />
      );

      const searchInput = screen.getByRole('searchbox');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('placeholder', 'Search your watch history...');
    });

    it('displays current search query value', () => {
      const filtersWithQuery = { ...defaultFilters, searchQuery: 'matrix' };
      
      render(
        <WatchHistoryFilters
          filters={filtersWithQuery}
          onFilterChange={mockOnFilterChange}
          totalCount={10}
        />
      );

      const searchInput = screen.getByRole('searchbox') as HTMLInputElement;
      expect(searchInput.value).toBe('matrix');
    });

    it('calls onFilterChange when search input changes', () => {
      render(
        <WatchHistoryFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          totalCount={10}
        />
      );

      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: 'inception' } });

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        contentType: 'all',
        searchQuery: 'inception',
      });
    });

    it('has accessible label for search input', () => {
      render(
        <WatchHistoryFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          totalCount={10}
        />
      );

      const searchInput = screen.getByLabelText(/search watch history/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('shows loading indicator when searching', () => {
      render(
        <WatchHistoryFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          totalCount={10}
          isSearching={true}
        />
      );

      const loadingIcon = screen.getByRole('searchbox').parentElement?.querySelector('.animate-spin');
      expect(loadingIcon).toBeInTheDocument();
    });
  });

  describe('Content Type Filters', () => {
    it('renders all content type filter buttons', () => {
      render(
        <WatchHistoryFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          totalCount={10}
        />
      );

      expect(screen.getByRole('button', { name: /all content/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /movies/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /tv shows/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /trailers/i })).toBeInTheDocument();
    });

    it('highlights active filter button', () => {
      const filtersWithMovie = { ...defaultFilters, contentType: 'movie' as const };
      
      render(
        <WatchHistoryFilters
          filters={filtersWithMovie}
          onFilterChange={mockOnFilterChange}
          totalCount={10}
        />
      );

      const movieButton = screen.getByRole('button', { name: /movies/i });
      expect(movieButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('calls onFilterChange when filter button is clicked', () => {
      render(
        <WatchHistoryFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          totalCount={10}
        />
      );

      const movieButton = screen.getByRole('button', { name: /movies/i });
      fireEvent.click(movieButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        contentType: 'movie',
        searchQuery: '',
      });
    });

    it('switches between different content type filters', () => {
      render(
        <WatchHistoryFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          totalCount={10}
        />
      );

      const tvShowButton = screen.getByRole('button', { name: /tv shows/i });
      fireEvent.click(tvShowButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        contentType: 'tv-show',
        searchQuery: '',
      });
    });

    it('can reset to "all" filter', () => {
      const filtersWithMovie = { ...defaultFilters, contentType: 'movie' as const };
      
      render(
        <WatchHistoryFilters
          filters={filtersWithMovie}
          onFilterChange={mockOnFilterChange}
          totalCount={10}
        />
      );

      const allButton = screen.getByRole('button', { name: /all content/i });
      fireEvent.click(allButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        contentType: 'all',
        searchQuery: '',
      });
    });
  });

  describe('Item Count Display', () => {
    it('displays total item count', () => {
      render(
        <WatchHistoryFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          totalCount={15}
        />
      );

      expect(screen.getByText('15 items')).toBeInTheDocument();
    });

    it('displays singular "item" for count of 1', () => {
      render(
        <WatchHistoryFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          totalCount={1}
        />
      );

      expect(screen.getByText('1 item')).toBeInTheDocument();
    });

    it('displays zero count', () => {
      render(
        <WatchHistoryFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          totalCount={0}
        />
      );

      expect(screen.getByText('0 items')).toBeInTheDocument();
    });

    it('has live region for count updates', () => {
      render(
        <WatchHistoryFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          totalCount={10}
        />
      );

      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('aria-live', 'polite');
      expect(badge).toHaveAttribute('aria-atomic', 'true');
    });
  });

  describe('Accessibility', () => {
    it('has proper group role for filter buttons', () => {
      render(
        <WatchHistoryFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          totalCount={10}
        />
      );

      const filterGroup = screen.getByRole('group', { name: /filter by content type/i });
      expect(filterGroup).toBeInTheDocument();
    });

    it('has descriptive aria-labels for filter buttons', () => {
      render(
        <WatchHistoryFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          totalCount={10}
        />
      );

      const movieButton = screen.getByRole('button', { name: /show movies/i });
      expect(movieButton).toBeInTheDocument();
    });

    it('updates aria-label when filter is active', () => {
      const filtersWithMovie = { ...defaultFilters, contentType: 'movie' as const };
      
      render(
        <WatchHistoryFilters
          filters={filtersWithMovie}
          onFilterChange={mockOnFilterChange}
          totalCount={10}
        />
      );

      const movieButton = screen.getByRole('button', { name: /currently showing movies/i });
      expect(movieButton).toBeInTheDocument();
    });

    it('has screen reader hint for search input', () => {
      render(
        <WatchHistoryFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          totalCount={10}
        />
      );

      const hint = screen.getByText(/results update automatically/i);
      expect(hint).toHaveClass('sr-only');
    });

    it('marks decorative icons as aria-hidden', () => {
      const { container } = render(
        <WatchHistoryFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          totalCount={10}
        />
      );

      const icons = container.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Layout', () => {
    it('applies flex wrap for mobile responsiveness', () => {
      const { container } = render(
        <WatchHistoryFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          totalCount={10}
        />
      );

      const filterContainer = container.querySelector('.flex-wrap');
      expect(filterContainer).toBeInTheDocument();
    });
  });

  describe('Combined Filters', () => {
    it('maintains search query when changing content type', () => {
      const filtersWithQuery = { ...defaultFilters, searchQuery: 'matrix' };
      
      render(
        <WatchHistoryFilters
          filters={filtersWithQuery}
          onFilterChange={mockOnFilterChange}
          totalCount={10}
        />
      );

      const movieButton = screen.getByRole('button', { name: /movies/i });
      fireEvent.click(movieButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        contentType: 'movie',
        searchQuery: 'matrix',
      });
    });

    it('maintains content type when changing search query', () => {
      const filtersWithMovie = { ...defaultFilters, contentType: 'movie' as const };
      
      render(
        <WatchHistoryFilters
          filters={filtersWithMovie}
          onFilterChange={mockOnFilterChange}
          totalCount={10}
        />
      );

      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: 'inception' } });

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        contentType: 'movie',
        searchQuery: 'inception',
      });
    });
  });
});
