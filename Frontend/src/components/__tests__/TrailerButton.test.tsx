import { render, screen } from '@testing-library/react';
import { TrailerButton } from '../TrailerButton';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('TrailerButton', () => {
  const defaultProps = {
    movieId: 'test-movie-id',
    movieTitle: 'Test Movie',
  };

  describe('Loading state', () => {
    it('renders loading button when isLoading is true', () => {
      render(
        <TrailerButton
          {...defaultProps}
          trailerSrc={null}
          isLoading={true}
          hasError={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Loading Trailer...');
      expect(button).toHaveAttribute('aria-label', 'Loading trailer');
      
      // Check for loading spinner
      const spinner = button.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      
      // Check for screen reader description
      expect(screen.getByText('Trailer is currently loading for Test Movie')).toBeInTheDocument();
    });

    it('applies correct CSS classes for loading state', () => {
      render(
        <TrailerButton
          {...defaultProps}
          trailerSrc={null}
          isLoading={true}
          hasError={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-white/70', 'text-black/70', 'cursor-not-allowed');
    });
  });

  describe('Available state', () => {
    it('renders clickable trailer button when trailer is available', () => {
      render(
        <TrailerButton
          {...defaultProps}
          trailerSrc="https://www.youtube.com/embed/test-video"
          isLoading={false}
          hasError={false}
        />
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-label', 'Watch trailer for Test Movie');
      
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
      expect(button).toHaveTextContent('Watch Trailer');
      
      // Check for play icon
      const playIcon = button.querySelector('svg');
      expect(playIcon).toBeInTheDocument();
      
      // Check for screen reader description
      expect(screen.getByText('Trailer is available for Test Movie. Click to watch in full screen.')).toBeInTheDocument();
    });

    it('constructs correct navigation URL', () => {
      const trailerSrc = 'https://www.youtube.com/embed/test-video';
      render(
        <TrailerButton
          {...defaultProps}
          trailerSrc={trailerSrc}
          isLoading={false}
          hasError={false}
        />
      );

      const link = screen.getByRole('link');
      const expectedHref = `/watch/test-movie-id?fullscreen=true&autoplay=true&title=${encodeURIComponent('Test Movie')}&src=${encodeURIComponent(trailerSrc)}`;
      expect(link).toHaveAttribute('href', expectedHref);
    });

    it('applies correct CSS classes for available state', () => {
      render(
        <TrailerButton
          {...defaultProps}
          trailerSrc="https://www.youtube.com/embed/test-video"
          isLoading={false}
          hasError={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-white', 'text-black', 'hover:bg-white/90');
    });
  });

  describe('Unavailable state', () => {
    it('renders disabled button when trailer is unavailable (no trailerSrc)', () => {
      render(
        <TrailerButton
          {...defaultProps}
          trailerSrc={null}
          isLoading={false}
          hasError={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Trailer Unavailable');
      expect(button).toHaveAttribute('aria-label', 'Trailer unavailable');
      
      // Check for screen reader description
      expect(screen.getByText('No trailer is available for Test Movie')).toBeInTheDocument();
    });

    it('renders disabled button when there is an error', () => {
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

    it('applies correct CSS classes for unavailable state', () => {
      render(
        <TrailerButton
          {...defaultProps}
          trailerSrc={null}
          isLoading={false}
          hasError={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-white/50', 'text-black/50', 'cursor-not-allowed');
    });
  });

  describe('Props and customization', () => {
    it('accepts custom size prop', () => {
      render(
        <TrailerButton
          {...defaultProps}
          trailerSrc={null}
          isLoading={false}
          hasError={false}
          size="sm"
        />
      );

      const button = screen.getByRole('button');
      // The size prop is passed to the Button component
      // We can't easily test the internal Button component's size handling
      // but we can verify the prop is accepted without errors
      expect(button).toBeInTheDocument();
    });

    it('accepts custom className prop', () => {
      const customClass = 'custom-trailer-button';
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
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels for all states', () => {
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
      expect(screen.getByLabelText('Watch trailer for Test Movie')).toBeInTheDocument();

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

    it('provides screen reader descriptions for all states', () => {
      const { rerender } = render(
        <TrailerButton
          {...defaultProps}
          trailerSrc={null}
          isLoading={true}
          hasError={false}
        />
      );

      // Loading state description
      expect(screen.getByText('Trailer is currently loading for Test Movie')).toBeInTheDocument();

      // Available state description
      rerender(
        <TrailerButton
          {...defaultProps}
          trailerSrc="https://www.youtube.com/embed/test-video"
          isLoading={false}
          hasError={false}
        />
      );
      expect(screen.getByText('Trailer is available for Test Movie. Click to watch in full screen.')).toBeInTheDocument();

      // Unavailable state description
      rerender(
        <TrailerButton
          {...defaultProps}
          trailerSrc={null}
          isLoading={false}
          hasError={false}
        />
      );
      expect(screen.getByText('No trailer is available for Test Movie')).toBeInTheDocument();
    });

    it('marks decorative icons as aria-hidden', () => {
      render(
        <TrailerButton
          {...defaultProps}
          trailerSrc="https://www.youtube.com/embed/test-video"
          isLoading={false}
          hasError={false}
        />
      );

      const playIcon = screen.getByRole('button').querySelector('svg');
      expect(playIcon).toHaveAttribute('aria-hidden', 'true');
    });
  });
});