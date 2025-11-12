import { render, screen, fireEvent } from '@testing-library/react';
import { MovieCarousel } from '../movie-carousel';

// Mock movie data
const mockMovies = [
  {
    id: 1,
    title: 'Test Movie 1',
    thumbnail: '/test1.jpg',
    rating: 8.5,
    genres: ['Action', 'Adventure'],
    releaseDate: '2024-01-01',
    contentRating: 'PG-13',
    duration: 120,
  },
  {
    id: 2,
    title: 'Test Movie 2',
    thumbnail: '/test2.jpg',
    rating: 7.8,
    genres: ['Comedy', 'Drama'],
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

describe('MovieCarousel', () => {
  it('renders carousel with title and movies', () => {
    render(
      <MovieCarousel 
        title="Action Movies" 
        movies={mockMovies} 
        isAuthenticated={false} 
      />
    );
    
    expect(screen.getByText('Action Movies')).toBeInTheDocument();
    expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
  });

  it('shows movie count when enabled', () => {
    render(
      <MovieCarousel 
        title="Action Movies" 
        movies={mockMovies} 
        isAuthenticated={false}
        showCount={true}
      />
    );
    
    expect(screen.getByText('2 movies')).toBeInTheDocument();
  });

  it('hides movie count when disabled', () => {
    render(
      <MovieCarousel 
        title="Action Movies" 
        movies={mockMovies} 
        isAuthenticated={false}
        showCount={false}
      />
    );
    
    expect(screen.queryByText('2 movies')).not.toBeInTheDocument();
  });

  it('has navigation controls', () => {
    render(
      <MovieCarousel 
        title="Action Movies" 
        movies={mockMovies} 
        isAuthenticated={false} 
      />
    );
    
    expect(screen.getByLabelText('Scroll left')).toBeInTheDocument();
    expect(screen.getByLabelText('Scroll right')).toBeInTheDocument();
  });

  it('applies responsive card widths', () => {
    const { container } = render(
      <MovieCarousel 
        title="Action Movies" 
        movies={mockMovies} 
        isAuthenticated={false} 
      />
    );
    
    const cardContainers = container.querySelectorAll('.flex-shrink-0');
    expect(cardContainers).toHaveLength(2);
    
    cardContainers.forEach(cardContainer => {
      expect(cardContainer).toHaveClass('carousel-card-width');
    });
  });

  it('returns null when no movies provided', () => {
    const { container } = render(
      <MovieCarousel 
        title="Action Movies" 
        movies={[]} 
        isAuthenticated={false} 
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('applies custom className and full width', () => {
    const { container } = render(
      <MovieCarousel 
        title="Action Movies" 
        movies={mockMovies} 
        isAuthenticated={false}
        className="custom-class"
      />
    );
    
    const section = container.querySelector('section');
    expect(section).toHaveClass('custom-class', 'w-full');
  });

  it('uses minimal padding for full-width layout', () => {
    const { container } = render(
      <MovieCarousel 
        title="Action Movies" 
        movies={mockMovies} 
        isAuthenticated={false}
      />
    );
    
    // Check header has minimal padding utility class
    const header = container.querySelector('.flex.items-center.justify-between');
    expect(header).toHaveClass('full-width-minimal');
    
    // Check carousel container has minimal padding utility class and gap
    const carouselContainer = container.querySelector('.overflow-x-auto');
    expect(carouselContainer).toHaveClass('full-width-minimal', 'gap-6');
  });

  it('handles scroll navigation', () => {
    // Mock window.innerWidth for consistent testing
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024, // lg breakpoint
    });

    const { container } = render(
      <MovieCarousel 
        title="Action Movies" 
        movies={mockMovies} 
        isAuthenticated={false} 
      />
    );
    
    const scrollContainer = container.querySelector('.overflow-x-auto');
    const leftButton = screen.getByLabelText('Scroll left');
    const rightButton = screen.getByLabelText('Scroll right');
    
    // Mock scrollTo method
    const mockScrollTo = jest.fn();
    if (scrollContainer) {
      scrollContainer.scrollTo = mockScrollTo;
    }
    
    fireEvent.click(rightButton);
    // At lg breakpoint (1024px), scroll amount should be calculated dynamically
    expect(mockScrollTo).toHaveBeenCalledWith(
      expect.objectContaining({
        behavior: 'smooth',
        left: expect.any(Number)
      })
    );
    
    fireEvent.click(leftButton);
    expect(mockScrollTo).toHaveBeenCalledWith(
      expect.objectContaining({
        behavior: 'smooth',
        left: expect.any(Number)
      })
    );
  });

  it('uses responsive card widths for specific cards per slide', () => {
    const { container } = render(
      <MovieCarousel 
        title="Action Movies" 
        movies={mockMovies} 
        isAuthenticated={false} 
      />
    );
    
    // All card containers should use the responsive carousel-card-width class
    const cardContainers = container.querySelectorAll('.carousel-card-width');
    expect(cardContainers).toHaveLength(2);
    
    // Verify the CSS class is applied correctly
    cardContainers.forEach(cardContainer => {
      expect(cardContainer).toHaveClass('carousel-card-width', 'flex-shrink-0');
    });
  });
});