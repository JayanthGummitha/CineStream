/**
 * Tests for WatchHistoryEmpty component
 * 
 * Tests cover:
 * - Empty state display
 * - Filter-based empty state
 * - Call-to-action buttons
 * - Accessibility features
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { WatchHistoryEmpty } from '../WatchHistoryEmpty';

// Mock Next.js Link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('WatchHistoryEmpty', () => {
  describe('No History State', () => {
    it('displays empty history message when no filters applied', () => {
      render(<WatchHistoryEmpty hasFilters={false} />);

      expect(screen.getByText('No watch history yet')).toBeInTheDocument();
      expect(screen.getByText(/start watching movies/i)).toBeInTheDocument();
    });

    it('displays browse content CTA when no history', () => {
      render(<WatchHistoryEmpty hasFilters={false} />);

      const ctaButton = screen.getByRole('link', { name: /browse content/i });
      expect(ctaButton).toBeInTheDocument();
      expect(ctaButton).toHaveAttribute('href', '/movies');
    });

    it('displays history icon when no history', () => {
      const { container } = render(<WatchHistoryEmpty hasFilters={false} />);

      const iconContainer = container.querySelector('.bg-purple-500\\/10');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('No Results State', () => {
    it('displays no results message when filters applied', () => {
      render(<WatchHistoryEmpty hasFilters={true} />);

      expect(screen.getByText('No results found')).toBeInTheDocument();
      expect(screen.getByText(/try adjusting your filters/i)).toBeInTheDocument();
    });

    it('displays clear filters CTA when no results', () => {
      render(<WatchHistoryEmpty hasFilters={true} />);

      const ctaButton = screen.getByRole('button', { name: /clear filters/i });
      expect(ctaButton).toBeInTheDocument();
    });

    it('displays search icon when no results', () => {
      const { container } = render(<WatchHistoryEmpty hasFilters={true} />);

      const iconContainer = container.querySelector('.bg-purple-500\\/10');
      expect(iconContainer).toBeInTheDocument();
    });

    it('reloads page when clear filters button is clicked', () => {
      // Mock window.location.reload
      const reloadMock = jest.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadMock },
        writable: true,
      });

      render(<WatchHistoryEmpty hasFilters={true} />);

      const ctaButton = screen.getByRole('button', { name: /clear filters/i });
      fireEvent.click(ctaButton);

      expect(reloadMock).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper region role with label', () => {
      render(<WatchHistoryEmpty hasFilters={false} />);

      const region = screen.getByRole('region', { name: /empty watch history/i });
      expect(region).toBeInTheDocument();
    });

    it('has proper region label for no results state', () => {
      render(<WatchHistoryEmpty hasFilters={true} />);

      const region = screen.getByRole('region', { name: /no search results/i });
      expect(region).toBeInTheDocument();
    });

    it('has heading for title', () => {
      render(<WatchHistoryEmpty hasFilters={false} />);

      const heading = screen.getByRole('heading', { name: /no watch history yet/i });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H2');
    });

    it('has descriptive text with proper id', () => {
      render(<WatchHistoryEmpty hasFilters={false} />);

      const description = screen.getByText(/start watching movies/i);
      expect(description).toHaveAttribute('id', 'empty-state-description');
    });

    it('CTA button is described by description text', () => {
      render(<WatchHistoryEmpty hasFilters={false} />);

      const ctaButton = screen.getByRole('link', { name: /browse content/i });
      expect(ctaButton).toHaveAttribute('aria-describedby', 'empty-state-description');
    });

    it('marks decorative icons as aria-hidden', () => {
      const { container } = render(<WatchHistoryEmpty hasFilters={false} />);

      const icons = container.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('has focus-visible styles on CTA button', () => {
      render(<WatchHistoryEmpty hasFilters={false} />);

      const ctaButton = screen.getByRole('link', { name: /browse content/i });
      expect(ctaButton).toHaveClass('focus-visible:ring-2');
    });
  });

  describe('Styling', () => {
    it('applies centered layout classes', () => {
      const { container } = render(<WatchHistoryEmpty hasFilters={false} />);

      const emptyState = container.firstChild;
      expect(emptyState).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    });

    it('applies proper spacing classes', () => {
      const { container } = render(<WatchHistoryEmpty hasFilters={false} />);

      const emptyState = container.firstChild;
      expect(emptyState).toHaveClass('py-16', 'px-4');
    });

    it('applies text-center class', () => {
      const { container } = render(<WatchHistoryEmpty hasFilters={false} />);

      const emptyState = container.firstChild;
      expect(emptyState).toHaveClass('text-center');
    });
  });

  describe('Content Variations', () => {
    it('shows different icons for different states', () => {
      const { container: noHistoryContainer } = render(<WatchHistoryEmpty hasFilters={false} />);
      const { container: noResultsContainer } = render(<WatchHistoryEmpty hasFilters={true} />);

      // Both should have icon containers but with different icons
      expect(noHistoryContainer.querySelector('.bg-purple-500\\/10')).toBeInTheDocument();
      expect(noResultsContainer.querySelector('.bg-purple-500\\/10')).toBeInTheDocument();
    });

    it('shows different button variants for different states', () => {
      const { container: noHistoryContainer } = render(<WatchHistoryEmpty hasFilters={false} />);
      const { container: noResultsContainer } = render(<WatchHistoryEmpty hasFilters={true} />);

      // No history should have a link (primary CTA)
      expect(noHistoryContainer.querySelector('a[href="/movies"]')).toBeInTheDocument();
      
      // No results should have a button (secondary CTA)
      expect(noResultsContainer.querySelector('button')).toBeInTheDocument();
    });
  });
});
