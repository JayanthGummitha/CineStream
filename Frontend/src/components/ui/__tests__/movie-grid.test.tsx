import { render, screen } from '@testing-library/react';
import { MovieGrid } from '../movie-grid';

// Mock movie data
const mockMovies = [
  {
    id: 1,
    title: 'Test Movie 1',
    thumbnail: '/test-image.jpg',
    rating: 8.5,
    genres: ['Action', 'Adventure'],
    releaseDate: '2024-01-01',
    contentRating: 'PG-13',
    duration: 120,
  },
  {
    id: 2,
    title: 'Test Movie 2',
    thumbnail: '/test-image2.jpg',
    rating: 7.8,
    genres: ['Comedy', 'Drama'],
    releaseDate: '2023-12-15',
    contentRating: 'R',
    duration: 105,
  },
];

describe('MovieGrid', () => {
  it('renders movies in a responsive grid', () => {
    render(<MovieGrid movies={mockMovies} isAuthenticated={false} />);
    
    expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
  });

  it('applies correct grid classes for default variant', () => {
    const { container } = render(
      <MovieGrid movies={mockMovies} isAuthenticated={false} variant="default" />
    );
    
    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('grid-cols-1');
    expect(gridElement).toHaveClass('sm:grid-cols-2');
    expect(gridElement).toHaveClass('md:grid-cols-3');
    expect(gridElement).toHaveClass('lg:grid-cols-4');
    expect(gridElement).toHaveClass('xl:grid-cols-5');
    expect(gridElement).toHaveClass('2xl:grid-cols-6');
  });

  it('applies correct grid classes for compact variant', () => {
    const { container } = render(
      <MovieGrid movies={mockMovies} isAuthenticated={false} variant="compact" />
    );
    
    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('grid-cols-2');
    expect(gridElement).toHaveClass('sm:grid-cols-3');
    expect(gridElement).toHaveClass('md:grid-cols-4');
    expect(gridElement).toHaveClass('lg:grid-cols-5');
    expect(gridElement).toHaveClass('xl:grid-cols-6');
    expect(gridElement).toHaveClass('2xl:grid-cols-7');
  });

  it('applies correct grid classes for featured variant', () => {
    const { container } = render(
      <MovieGrid movies={mockMovies} isAuthenticated={false} variant="featured" />
    );
    
    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('grid-cols-1');
    expect(gridElement).toHaveClass('sm:grid-cols-2');
    expect(gridElement).toHaveClass('lg:grid-cols-3');
    expect(gridElement).toHaveClass('xl:grid-cols-4');
  });

  it('returns null when no movies provided', () => {
    const { container } = render(
      <MovieGrid movies={[]} isAuthenticated={false} />
    );
    
    expect(container.firstChild).toBeNull();
  });
});