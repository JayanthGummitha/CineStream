/**
 * Tests for WatchHistoryCard component
 * 
 * Tests cover:
 * - URL generation for different content types
 * - Progress display
 * - Episode info rendering for TV shows
 * - Delete button functionality
 * - Accessibility features
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { WatchHistoryCard } from '../WatchHistoryCard';
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
  formatDistanceToNow: () => '2 hours ago',
}));

describe('WatchHistoryCard', () => {
  const mockOnDelete = jest.fn();

  const mockMovieItem: WatchProgressData = {
    videoId: 'movie-123',
    userId: 'user-123',
    contentType: 'movie',
    currentTime: 3600,
    duration: 7200,
    percentage: 50,
    lastWatchedAt: '2025-11-16T10:00:00Z',
    title: 'The Matrix',
    thumbnail: '/images/matrix.jpg',
  };

  const mockTVShowItem: WatchProgressData = {
    videoId: 'tv-123',
    userId: 'user-123',
    contentType: 'tv-show',
    currentTime: 1200,
    duration: 2400,
    percentage: 75,
    lastWatchedAt: '2025-11-16T10:00:00Z',
    title: 'Breaking Bad',
    thumbnail: '/images/breaking-bad.jpg',
    seasonNumber: 1,
    episodeNumber: 1,
    episodeTitle: 'Pilot',
  };

  beforeEach(() => {
    mockOnDelete.mockClear();
  });

  describe('URL Generation', () => {
    it('generates correct URL for movies', () => {
      render(<WatchHistoryCard item={mockMovieItem} onDelete={mockOnDelete} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/movie/movie-123');
    });

    it('generates correct URL for TV shows', () => {
      render(<WatchHistoryCard item={mockTVShowItem} onDelete={mockOnDelete} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/tv-shows/tv-123');
    });
  });

  describe('Content Display', () => {
    it('displays movie title', () => {
      render(<WatchHistoryCard item={mockMovieItem} onDelete={mockOnDelete} />);

      expect(screen.getByText('The Matrix')).toBeInTheDocument();
    });

    it('displays TV show title and episode info', () => {
      render(<WatchHistoryCard item={mockTVShowItem} onDelete={mockOnDelete} />);

      expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
      expect(screen.getByText(/S1 E1: Pilot/)).toBeInTheDocument();
    });

    it('does not display episode info for movies', () => {
      render(<WatchHistoryCard item={mockMovieItem} onDelete={mockOnDelete} />);

      expect(screen.queryByText(/S\d+ E\d+/)).not.toBeInTheDocument();
    });

    it('displays thumbnail image', () => {
      render(<WatchHistoryCard item={mockMovieItem} onDelete={mockOnDelete} />);

      const image = screen.getByRole('presentation');
      expect(image).toHaveAttribute('src', '/images/matrix.jpg');
    });

    it('uses placeholder when thumbnail is missing', () => {
      const itemWithoutThumbnail = { ...mockMovieItem, thumbnail: undefined };
      render(<WatchHistoryCard item={itemWithoutThumbnail} onDelete={mockOnDelete} />);

      const image = screen.getByRole('presentation');
      expect(image).toHaveAttribute('src', '/placeholder-movie.jpg');
    });
  });

  describe('Progress Display', () => {
    it('displays progress percentage', () => {
      render(<WatchHistoryCard item={mockMovieItem} onDelete={mockOnDelete} />);

      expect(screen.getByText('50% watched')).toBeInTheDocument();
    });

    it('displays progress bar with correct value', () => {
      render(<WatchHistoryCard item={mockMovieItem} onDelete={mockOnDelete} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('rounds progress percentage correctly', () => {
      const itemWithDecimal = { ...mockMovieItem, percentage: 33.7 };
      render(<WatchHistoryCard item={itemWithDecimal} onDelete={mockOnDelete} />);

      expect(screen.getByText('34% watched')).toBeInTheDocument();
    });
  });

  describe('Timestamp Display', () => {
    it('displays last watched timestamp', () => {
      render(<WatchHistoryCard item={mockMovieItem} onDelete={mockOnDelete} />);

      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    });

    it('includes proper time element with datetime attribute', () => {
      render(<WatchHistoryCard item={mockMovieItem} onDelete={mockOnDelete} />);

      const timeElement = screen.getByText('2 hours ago').closest('time');
      expect(timeElement).toHaveAttribute('dateTime', '2025-11-16T10:00:00Z');
    });
  });

  describe('Delete Functionality', () => {
    it('calls onDelete when delete button is clicked', () => {
      render(<WatchHistoryCard item={mockMovieItem} onDelete={mockOnDelete} />);

      const deleteButton = screen.getByRole('button', { name: /remove.*from watch history/i });
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('prevents navigation when delete button is clicked', () => {
      render(<WatchHistoryCard item={mockMovieItem} onDelete={mockOnDelete} />);

      const deleteButton = screen.getByRole('button', { name: /remove.*from watch history/i });
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');
      const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');

      deleteButton.dispatchEvent(clickEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('has accessible delete button label', () => {
      render(<WatchHistoryCard item={mockMovieItem} onDelete={mockOnDelete} />);

      const deleteButton = screen.getByRole('button', { name: 'Remove The Matrix from watch history' });
      expect(deleteButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has comprehensive aria-label for the link', () => {
      render(<WatchHistoryCard item={mockMovieItem} onDelete={mockOnDelete} />);

      const link = screen.getByRole('link');
      const ariaLabel = link.getAttribute('aria-label');
      
      expect(ariaLabel).toContain('Continue watching The Matrix');
      expect(ariaLabel).toContain('50% watched');
      expect(ariaLabel).toContain('Last watched 2 hours ago');
    });

    it('includes episode info in aria-label for TV shows', () => {
      render(<WatchHistoryCard item={mockTVShowItem} onDelete={mockOnDelete} />);

      const link = screen.getByRole('link');
      const ariaLabel = link.getAttribute('aria-label');
      
      expect(ariaLabel).toContain('Season 1, Episode 1: Pilot');
    });

    it('has proper article structure', () => {
      render(<WatchHistoryCard item={mockMovieItem} onDelete={mockOnDelete} />);

      const article = screen.getByRole('article');
      expect(article).toBeInTheDocument();
    });

    it('marks decorative elements with aria-hidden', () => {
      const { container } = render(<WatchHistoryCard item={mockMovieItem} onDelete={mockOnDelete} />);

      const icons = container.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('has keyboard accessible delete button', () => {
      render(<WatchHistoryCard item={mockMovieItem} onDelete={mockOnDelete} />);

      const deleteButton = screen.getByRole('button', { name: /remove.*from watch history/i });
      expect(deleteButton).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Styling and Interactions', () => {
    it('applies card styling classes', () => {
      const { container } = render(<WatchHistoryCard item={mockMovieItem} onDelete={mockOnDelete} />);

      const card = container.querySelector('.group');
      expect(card).toHaveClass('relative', 'overflow-hidden');
    });

    it('has hover state classes', () => {
      const { container } = render(<WatchHistoryCard item={mockMovieItem} onDelete={mockOnDelete} />);

      const card = container.querySelector('.group');
      expect(card).toHaveClass('hover:ring-2', 'hover:ring-primary');
    });

    it('has focus-within state classes', () => {
      const { container } = render(<WatchHistoryCard item={mockMovieItem} onDelete={mockOnDelete} />);

      const card = container.querySelector('.group');
      expect(card).toHaveClass('focus-within:ring-2', 'focus-within:ring-primary');
    });
  });
});
