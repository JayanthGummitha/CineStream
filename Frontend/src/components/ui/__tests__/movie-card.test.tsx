import { render, screen } from '@testing-library/react';
import { MovieCard } from '../movie-card';

// Mock movie data
const mockMovie = {
  id: 1,
  title: 'Test Movie',
  thumbnail: '/test-image.jpg',
  rating: 8.5,
  genres: ['Action', 'Adventure'],
  releaseDate: '2024-01-01',
  contentRating: 'PG-13',
  duration: 120,
};

// Mock Next.js components
jest.mock('next/image', () => {
  return function MockImage({ alt, ...props }: any) {
    return <img alt={alt} {...props} />;
  };
});

jest.mock('next/link', () => {
  return function MockLink({ children, href }: any) {
    return <a href={href}>{children}</a>;
  };
});

describe('MovieCard', () => {
  it('renders movie information correctly', () => {
    render(<MovieCard movie={mockMovie} isAuthenticated={false} />);
    
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getAllByText('8.5')).toHaveLength(2); // Rating appears in badge and info section
    expect(screen.getByText(/Action.*Adventure.*Movie/)).toBeInTheDocument();
    // Year is extracted from releaseDate
    const year = new Date(mockMovie.releaseDate).getFullYear().toString();
    expect(screen.getByText(year)).toBeInTheDocument();
    expect(screen.getByText('PG-13')).toBeInTheDocument();
    expect(screen.getByText('2h 0m')).toBeInTheDocument();
  });

  it('applies responsive width classes', () => {
    const { container } = render(
      <MovieCard movie={mockMovie} isAuthenticated={false} />
    );
    
    const cardElement = container.querySelector('.group');
    expect(cardElement).toHaveClass('w-full');
  });

  it('shows action buttons when authenticated', () => {
    render(<MovieCard movie={mockMovie} isAuthenticated={true} />);
    
    // Button text could be "Play" or "Continue" depending on watch progress
    expect(screen.getByRole('button', { name: /play|continue/i })).toBeInTheDocument();
  });

  it('hides action buttons when not authenticated', () => {
    render(<MovieCard movie={mockMovie} isAuthenticated={false} />);
    
    expect(screen.queryByRole('button', { name: /play|continue/i })).not.toBeInTheDocument();
  });

  it('applies correct responsive image sizes', () => {
    render(<MovieCard movie={mockMovie} isAuthenticated={false} />);
    
    const image = screen.getByAltText('Test Movie');
    expect(image).toHaveAttribute('sizes', '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw');
  });

  it('applies compact variant styles correctly', () => {
    render(<MovieCard movie={mockMovie} isAuthenticated={false} variant="compact" />);
    
    const titleElement = screen.getByText('Test Movie');
    expect(titleElement).toHaveClass('text-sm', 'sm:text-base');
  });

  it('applies featured variant styles correctly', () => {
    render(<MovieCard movie={mockMovie} isAuthenticated={false} variant="featured" />);
    
    const titleElement = screen.getByText('Test Movie');
    expect(titleElement).toHaveClass('text-lg', 'sm:text-xl', 'md:text-2xl');
  });

  it('includes touch-friendly overlay for mobile', () => {
    const { container } = render(
      <MovieCard movie={mockMovie} isAuthenticated={false} />
    );
    
    const overlay = container.querySelector('.lg\\:hidden');
    expect(overlay).toBeInTheDocument();
  });
});