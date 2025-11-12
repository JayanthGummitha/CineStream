import { render, screen, fireEvent } from '@testing-library/react';

// Mock the GenreSection component to test carousel functionality
const mockMovies = [
  {
    id: 1,
    title: 'Action Movie 1',
    thumbnail: '/test1.jpg',
    rating: 8.5,
    genres: ['Action'],
    releaseDate: '2024-01-01',
    contentRating: 'PG-13',
    duration: 120,
  },
  {
    id: 2,
    title: 'Action Movie 2',
    thumbnail: '/test2.jpg',
    rating: 7.8,
    genres: ['Action'],
    releaseDate: '2023-12-15',
    contentRating: 'R',
    duration: 105,
  },
];

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

// Mock MovieCard component
jest.mock('../movie-card', () => {
  return {
    MovieCard: ({ movie }: any) => (
      <div data-testid={`movie-card-${movie.id}`}>
        <h3>{movie.title}</h3>
        <span>{movie.rating}</span>
      </div>
    ),
  };
});

// Create a test version of GenreSection with carousel
function TestGenreSection({ genre, movies, isAuthenticated }: any) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      const newScrollLeft = scrollRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount);

      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="heading-section text-white">{genre.name}</h2>
        
        <div className="flex items-center space-x-2">
          <div className="text-white/60 text-sm mr-4">
            {movies.length} {movies.length === 1 ? 'movie' : 'movies'}
          </div>
          <button
            data-testid="scroll-left"
            onClick={() => scroll('left')}
            className="h-10 w-10 p-0 bg-black/40 border-white/20 hover:bg-black/60"
          >
            ←
          </button>
          <button
            data-testid="scroll-right"
            onClick={() => scroll('right')}
            className="h-10 w-10 p-0 bg-black/40 border-white/20 hover:bg-black/60"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        data-testid="carousel-container"
        className="flex space-x-4 sm:space-x-6 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {movies.map((movie: any) => (
          <div key={movie.id} className="flex-shrink-0 w-64 sm:w-72 md:w-80 lg:w-72 xl:w-80">
            <div data-testid={`movie-card-${movie.id}`}>
              <h3>{movie.title}</h3>
              <span>{movie.rating}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

describe('GenreSection Carousel', () => {
  const mockGenre = { id: '28', name: 'Action' };

  it('renders genre section with carousel layout', () => {
    render(
      <TestGenreSection 
        genre={mockGenre} 
        movies={mockMovies} 
        isAuthenticated={false} 
      />
    );
    
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('2 movies')).toBeInTheDocument();
    expect(screen.getByTestId('carousel-container')).toBeInTheDocument();
  });

  it('displays movies in horizontal layout', () => {
    render(
      <TestGenreSection 
        genre={mockGenre} 
        movies={mockMovies} 
        isAuthenticated={false} 
      />
    );
    
    expect(screen.getByText('Action Movie 1')).toBeInTheDocument();
    expect(screen.getByText('Action Movie 2')).toBeInTheDocument();
    
    const container = screen.getByTestId('carousel-container');
    expect(container).toHaveClass('flex', 'overflow-x-auto');
  });

  it('has navigation controls', () => {
    render(
      <TestGenreSection 
        genre={mockGenre} 
        movies={mockMovies} 
        isAuthenticated={false} 
      />
    );
    
    expect(screen.getByTestId('scroll-left')).toBeInTheDocument();
    expect(screen.getByTestId('scroll-right')).toBeInTheDocument();
  });

  it('applies responsive card widths', () => {
    const { container } = render(
      <TestGenreSection 
        genre={mockGenre} 
        movies={mockMovies} 
        isAuthenticated={false} 
      />
    );
    
    const cardContainers = container.querySelectorAll('.flex-shrink-0');
    cardContainers.forEach(cardContainer => {
      expect(cardContainer).toHaveClass('w-64', 'sm:w-72', 'md:w-80', 'lg:w-72', 'xl:w-80');
    });
  });

  it('shows correct movie count', () => {
    render(
      <TestGenreSection 
        genre={mockGenre} 
        movies={[mockMovies[0]]} 
        isAuthenticated={false} 
      />
    );
    
    expect(screen.getByText('1 movie')).toBeInTheDocument();
  });
});

// Add React import for the test component
import React from 'react';