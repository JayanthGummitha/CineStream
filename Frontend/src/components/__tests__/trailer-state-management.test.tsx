import { render, screen, waitFor, act } from '@testing-library/react';
import { TrailerButton } from '../TrailerButton';
import { getMovieTrailer } from '@/lib/movie-service';

// Mock the movie service
jest.mock('@/lib/movie-service', () => ({
  getMovieTrailer: jest.fn(),
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

const mockGetMovieTrailer = getMovieTrailer as jest.MockedFunction<typeof getMovieTrailer>;

describe('Trailer State Management and Button Rendering', () => {
  const defaultProps = {
    movieId: 'test-movie-123',
    movieTitle: 'Test Movie Title',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State Management', () => {
    it('should render loading state correctly', () => {
      render(
        <TrailerButton
          {...defaultProps}
          trailerSrc={null}
          isLoading={true}
          hasError={false}
        />
      );

      const button = screen.getByRole('button');
      
      // Verify loading state properties
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Loading Trailer...');
      expect(button).toHaveAttribute('aria-label', 'Loading trailer');
      
      // Verify loading spinner is present
      const spinner = button.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin', 'rounded-full', 'border-2');
      
      // Verify CSS classes for loading state
      expect(button).toHaveClass('bg-white/70', 'text-black/70', 'cursor-not-allowed');
      
      // Verify screen reader description
      expect(screen.getByText('Trailer is currently loading for Test Movie Title')).toBeInTheDocument();
    });

    it('should handle loading state with custom size', () => {
      render(
        <TrailerButton
          {...defaultProps}
          trailerSrc={null}
          isLoading={true}
          hasError={false}
          size="sm"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Loading Trailer...');
    });

    it('should handle loading state with custom className', () => {
      const customClass = 'custom-loading-class';
      render(
        <TrailerButton
          {...defaultProps}
          trailerSrc={null}
          isLoading={true}
          hasError={false}
          className={customClass}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass(customClass);
    });
  });

  describe('Available State Management', () => {
    const mockTrailerUrl = 'https://www.youtube.com/embed/test-video-123';

    it('should render available state correctly', () => {
      render(
        <TrailerButton
          {...defaultProps}
          trailerSrc={mockTrailerUrl}
          isLoading={false}
          hasError={false}
        />
      );

      // Should render as a link wrapping a button
      const link = screen.getByRole('link');
      const button = screen.getByRole('button');
      
      // Verify link properties
      expect(link).toHaveAttribute('aria-label', 'Watch trailer for Test Movie Title');
      
      // Verify button properties
      expect(button).not.toBeDisabled();
      expect(button).toHaveTextContent('Watch Trailer');
      
      // Verify play icon is present
      const playIcon = button.querySelector('svg');
      expect(playIcon).toBeInTheDocument();
      expect(playIcon).toHaveAttribute('aria-hidden', 'true');
      
      // Verify CSS classes for available state
      expect(button).toHaveClass('bg-white', 'text-black', 'hover:bg-white/90');
      
      // Verify screen reader description
      expect(screen.getByText('Trailer is available for Test Movie Title. Click to watch in full screen.')).toBeInTheDocument();
    });

    it('should construct correct navigation URL', () => {
      render(
        <TrailerButton
          {...defaultProps}
          trailerSrc={mockTrailerUrl}
          isLoading={false}
          hasError={false}
        />
      );

      const link = screen.getByRole('link');
      const expectedHref = `/watch/test-movie-123?fullscreen=true&autoplay=true&trailer=true&title=${encodeURIComponent('Test Movie Title')}&src=${encodeURIComponent(mockTrailerUrl)}`;
      expect(link).toHaveAttribute('href', expectedHref);
    });

    it('should handle special characters in movie title for URL construction', () => {
      const specialTitle = 'Test Movie: The "Special" Edition & More!';
      render(
        <TrailerButton
          {...defaultProps}
          movieTitle={specialTitle}
          trailerSrc={mockTrailerUrl}
          isLoading={false}
          hasError={false}
        />
      );

      const link = screen.getByRole('link');
      const href = link.getAttribute('href');
      expect(href).toContain(encodeURIComponent(specialTitle));
    });

    it('should handle special characters in trailer URL', () => {
      const specialTrailerUrl = 'https://www.youtube.com/embed/test-video?param=value&other=123';
      render(
        <TrailerButton
          {...defaultProps}
          trailerSrc={specialTrailerUrl}
          isLoading={false}
          hasError={false}
        />
      );

      const link = screen.getByRole('link');
      const href = link.getAttribute('href');
      expect(href).toContain(encodeURIComponent(specialTrailerUrl));
    });
  });

  describe('Unavailable State Management', () => {
    it('should render unavailable state when trailerSrc is null', () => {
      render(
        <TrailerButton
          {...defaultProps}
          trailerSrc={null}
          isLoading={false}
          hasError={false}
        />
      );

      const button = screen.getByRole('button');
      
      // Verify unavailable state properties
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Trailer Unavailable');
      expect(button).toHaveAttribute('aria-label', 'Trailer unavailable');
      
      // Verify play icon is still present but disabled
      const playIcon = button.querySelector('svg');
      expect(playIcon).toBeInTheDocument();
      expect(playIcon).toHaveAttribute('aria-hidden', 'true');
      
      // Verify CSS classes for unavailable state
      expect(button).toHaveClass('bg-white/50', 'text-black/50', 'cursor-not-allowed');
      
      // Verify screen reader description
      expect(screen.getByText('No trailer is available for Test Movie Title')).toBeInTheDocument();
    });

    it('should render unavailable state when trailerSrc is empty string', () => {
      render(
        <TrailerButton
          {...defaultProps}
          trailerSrc=""
          isLoading={false}
          hasError={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Trailer Unavailable');
    });

    it('should render unavailable state when hasError is true', () => {
      render(
        <TrailerButton
          {...defaultProps}
          trailerSrc="https://www.youtube.com/embed/test-video"
          isLoading={false}
          hasError={true}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Trailer Unavailable');
    });

    it('should render unavailable state when both trailerSrc is null and hasError is true', () => {
      render(
        <TrailerButton
          {...defaultProps}
          trailerSrc={null}
          isLoading={false}
          hasError={true}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Trailer Unavailable');
    });
  });

  describe('State Transitions', () => {
    it('should handle transition from loading to available', () => {
      const { rerender } = render(
        <TrailerButton
          {...defaultProps}
          trailerSrc={null}
          isLoading={true}
          hasError={false}
        />
      );

      // Initially loading
      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByText('Loading Trailer...')).toBeInTheDocument();

      // Transition to available
      rerender(
        <TrailerButton
          {...defaultProps}
          trailerSrc="https://www.youtube.com/embed/test-video"
          isLoading={false}
          hasError={false}
        />
      );

      expect(screen.getByRole('button')).not.toBeDisabled();
      expect(screen.getByText('Watch Trailer')).toBeInTheDocument();
      expect(screen.getByRole('link')).toBeInTheDocument();
    });

    it('should handle transition from loading to unavailable', () => {
      const { rerender } = render(
        <TrailerButton
          {...defaultProps}
          trailerSrc={null}
          isLoading={true}
          hasError={false}
        />
      );

      // Initially loading
      expect(screen.getByText('Loading Trailer...')).toBeInTheDocument();

      // Transition to unavailable
      rerender(
        <TrailerButton
          {...defaultProps}
          trailerSrc={null}
          isLoading={false}
          hasError={false}
        />
      );

      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByText('Trailer Unavailable')).toBeInTheDocument();
    });

    it('should handle transition from loading to error', () => {
      const { rerender } = render(
        <TrailerButton
          {...defaultProps}
          trailerSrc={null}
          isLoading={true}
          hasError={false}
        />
      );

      // Initially loading
      expect(screen.getByText('Loading Trailer...')).toBeInTheDocument();

      // Transition to error
      rerender(
        <TrailerButton
          {...defaultProps}
          trailerSrc={null}
          isLoading={false}
          hasError={true}
        />
      );

      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByText('Trailer Unavailable')).toBeInTheDocument();
    });

    it('should handle transition from available to error', () => {
      const { rerender } = render(
        <TrailerButton
          {...defaultProps}
          trailerSrc="https://www.youtube.com/embed/test-video"
          isLoading={false}
          hasError={false}
        />
      );

      // Initially available
      expect(screen.getByRole('link')).toBeInTheDocument();
      expect(screen.getByText('Watch Trailer')).toBeInTheDocument();

      // Transition to error
      rerender(
        <TrailerButton
          {...defaultProps}
          trailerSrc="https://www.youtube.com/embed/test-video"
          isLoading={false}
          hasError={true}
        />
      );

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByText('Trailer Unavailable')).toBeInTheDocument();
    });
  });

  describe('Accessibility Features', () => {
    it('should provide proper ARIA labels for all states', () => {
      const { rerender } = render(
        <TrailerButton
          {...defaultProps}
          trailerSrc={null}
          isLoading={true}
          hasError={false}
        />
      );

      // Loading state
      expect(screen.getByLabelText('Loading trailer')).toBeInTheDocument();

      // Available state
      rerender(
        <TrailerButton
          {...defaultProps}
          trailerSrc="https://www.youtube.com/embed/test-video"
          isLoading={false}
          hasError={false}
        />
      );
      expect(screen.getByLabelText('Watch trailer for Test Movie Title')).toBeInTheDocument();

      // Unavailable state
      rerender(
        <TrailerButton
          {...defaultProps}
          trailerSrc={null}
          isLoading={false}
          hasError={false}
        />
      );
      expect(screen.getByLabelText('Trailer unavailable')).toBeInTheDocument();
    });

    it('should provide screen reader descriptions with aria-describedby', () => {
      const { rerender } = render(
        <TrailerButton
          {...defaultProps}
          trailerSrc={null}
          isLoading={true}
          hasError={false}
        />
      );

      // Loading state
      const loadingButton = screen.getByRole('button');
      expect(loadingButton).toHaveAttribute('aria-describedby', 'trailer-loading-description');
      expect(screen.getByText('Trailer is currently loading for Test Movie Title')).toBeInTheDocument();

      // Available state
      rerender(
        <TrailerButton
          {...defaultProps}
          trailerSrc="https://www.youtube.com/embed/test-video"
          isLoading={false}
          hasError={false}
        />
      );
      const availableButton = screen.getByRole('button');
      expect(availableButton).toHaveAttribute('aria-describedby', 'trailer-available-description');
      expect(screen.getByText('Trailer is available for Test Movie Title. Click to watch in full screen.')).toBeInTheDocument();

      // Unavailable state
      rerender(
        <TrailerButton
          {...defaultProps}
          trailerSrc={null}
          isLoading={false}
          hasError={false}
        />
      );
      const unavailableButton = screen.getByRole('button');
      expect(unavailableButton).toHaveAttribute('aria-describedby', 'trailer-unavailable-description');
      expect(screen.getByText('No trailer is available for Test Movie Title')).toBeInTheDocument();
    });

    it('should mark decorative icons as aria-hidden', () => {
      const { rerender } = render(
        <TrailerButton
          {...defaultProps}
          trailerSrc="https://www.youtube.com/embed/test-video"
          isLoading={false}
          hasError={false}
        />
      );

      // Available state - play icon
      const playIcon = screen.getByRole('button').querySelector('svg');
      expect(playIcon).toHaveAttribute('aria-hidden', 'true');

      // Unavailable state - play icon
      rerender(
        <TrailerButton
          {...defaultProps}
          trailerSrc={null}
          isLoading={false}
          hasError={false}
        />
      );
      const unavailableIcon = screen.getByRole('button').querySelector('svg');
      expect(unavailableIcon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should handle focus management correctly', () => {
      const { rerender } = render(
        <TrailerButton
          {...defaultProps}
          trailerSrc="https://www.youtube.com/embed/test-video"
          isLoading={false}
          hasError={false}
        />
      );

      // Available state should be focusable
      const button = screen.getByRole('button');
      button.focus();
      expect(document.activeElement).toBe(button);

      // Unavailable state should not be focusable (disabled)
      rerender(
        <TrailerButton
          {...defaultProps}
          trailerSrc={null}
          isLoading={false}
          hasError={false}
        />
      );
      const disabledButton = screen.getByRole('button');
      expect(disabledButton).toBeDisabled();
    });
  });

  describe('Custom Props Handling', () => {
    it('should handle different size variants', () => {
      const sizes: Array<'default' | 'sm' | 'lg' | 'icon'> = ['default', 'sm', 'lg', 'icon'];
      
      sizes.forEach(size => {
        const { unmount } = render(
          <TrailerButton
            {...defaultProps}
            trailerSrc={null}
            isLoading={false}
            hasError={false}
            size={size}
          />
        );

        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        unmount();
      });
    });

    it('should merge custom className with default classes', () => {
      const customClass = 'my-custom-trailer-button';
      render(
        <TrailerButton
          {...defaultProps}
          trailerSrc={null}
          isLoading={false}
          hasError={false}
          className={customClass}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass(customClass);
      expect(button).toHaveClass('bg-white/50', 'text-black/50', 'cursor-not-allowed');
    });

    it('should handle empty or undefined className gracefully', () => {
      const { rerender } = render(
        <TrailerButton
          {...defaultProps}
          trailerSrc={null}
          isLoading={false}
          hasError={false}
          className=""
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(
        <TrailerButton
          {...defaultProps}
          trailerSrc={null}
          isLoading={false}
          hasError={false}
          className={undefined}
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Boundaries', () => {
    it('should handle very long movie titles gracefully', () => {
      const longTitle = 'A'.repeat(200);
      render(
        <TrailerButton
          {...defaultProps}
          movieTitle={longTitle}
          trailerSrc="https://www.youtube.com/embed/test-video"
          isLoading={false}
          hasError={false}
        />
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-label', `Watch trailer for ${longTitle}`);
    });

    it('should handle very long trailer URLs gracefully', () => {
      const longUrl = 'https://www.youtube.com/embed/test-video?' + 'param=value&'.repeat(100);
      render(
        <TrailerButton
          {...defaultProps}
          trailerSrc={longUrl}
          isLoading={false}
          hasError={false}
        />
      );

      const link = screen.getByRole('link');
      const href = link.getAttribute('href');
      expect(href).toContain(encodeURIComponent(longUrl));
    });

    it('should handle special characters in movieId', () => {
      const specialMovieId = 'movie-123_test@special';
      render(
        <TrailerButton
          {...defaultProps}
          movieId={specialMovieId}
          trailerSrc="https://www.youtube.com/embed/test-video"
          isLoading={false}
          hasError={false}
        />
      );

      const link = screen.getByRole('link');
      expect(link.getAttribute('href')).toContain(`/watch/${specialMovieId}`);
    });

    it('should handle simultaneous state changes', () => {
      const { rerender } = render(
        <TrailerButton
          {...defaultProps}
          trailerSrc={null}
          isLoading={true}
          hasError={false}
        />
      );

      // Rapid state changes
      rerender(
        <TrailerButton
          {...defaultProps}
          trailerSrc="https://www.youtube.com/embed/test-video"
          isLoading={false}
          hasError={false}
        />
      );

      rerender(
        <TrailerButton
          {...defaultProps}
          trailerSrc="https://www.youtube.com/embed/test-video"
          isLoading={false}
          hasError={true}
        />
      );

      rerender(
        <TrailerButton
          {...defaultProps}
          trailerSrc={null}
          isLoading={false}
          hasError={false}
        />
      );

      // Should end up in unavailable state
      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByText('Trailer Unavailable')).toBeInTheDocument();
    });
  });
});