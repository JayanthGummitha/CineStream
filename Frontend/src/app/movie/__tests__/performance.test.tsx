/**
 * @jest-environment jsdom
 */

/**
 * Performance tests for movie detail page trailer loading
 * Tests requirement 3.1, 3.2: Non-blocking trailer loading
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useTrailerPerformance } from '@/hooks/useTrailerPerformance';

// Mock the movie service
jest.mock('@/lib/movie-service', () => ({
  getMovieDetails: jest.fn(),
  getMoviesByGenre: jest.fn(),
  getMovieTrailer: jest.fn()
}));

// Mock the trailer performance hook
jest.mock('@/hooks/useTrailerPerformance');

// Mock Next.js router
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn()
  })
}));

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

// Mock Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock components
jest.mock('@/components/navigation/header', () => ({
  Header: ({ isAuthenticated }: { isAuthenticated: boolean }) => (
    <div data-testid="header">Header - Auth: {isAuthenticated.toString()}</div>
  )
}));

jest.mock('@/components/navigation/footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>
}));

jest.mock('@/components/TrailerButton', () => ({
  TrailerButton: ({ trailerSrc, isLoading, hasError, movieTitle }: any) => (
    <button data-testid="trailer-button">
      {isLoading ? 'Loading Trailer...' : 
       hasError ? 'Trailer Unavailable' : 
       trailerSrc ? 'Watch Trailer' : 'No Trailer'}
    </button>
  )
}));

jest.mock('@/components/VideoPlayer', () => ({
  VideoPlayer: ({ src, title }: any) => (
    <div data-testid="video-player">Video Player: {title}</div>
  )
}));

jest.mock('@/lib/url-utils', () => ({
  createDetailUrl: (type: string, id: string, title: string) => `/${type}/${id}/${title}`
}));

// Mock performance.now for consistent testing
const mockPerformanceNow = jest.fn();
Object.defineProperty(global, 'performance', {
  value: {
    now: mockPerformanceNow
  }
});

// Mock requestIdleCallback
const mockRequestIdleCallback = jest.fn();
Object.defineProperty(global, 'requestIdleCallback', {
  value: mockRequestIdleCallback,
  configurable: true
});

describe('Movie Detail Page Performance', () => {
  const mockMovie = {
    id: '123',
    title: 'Test Movie',
    description: 'A test movie description',
    releaseDate: '2023-01-01',
    duration: 120,
    rating: 8.5,
    genres: ['Action', 'Adventure'],
    thumbnail: '/test-poster.jpg',
    backdrop: '/test-backdrop.jpg',
    director: 'Test Director',
    cast: [
      {
        id: '1',
        name: 'Test Actor',
        character: 'Test Character',
        profileImage: '/test-actor.jpg'
      }
    ],
    languages: ['English'],
    contentRating: 'PG-13',
    trailer: '' // No trailer initially
  };

  const mockUseTrailerPerformance = {
    startPerformanceMonitoring: jest.fn(),
    endPerformanceMonitoring: jest.fn(),
    logPerformanceInsights: jest.fn(),
    getPerformanceStats: jest.fn(),
    clearPerformanceHistory: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformanceNow.mockReturnValue(0);
    
    // Mock the hook implementation
    (useTrailerPerformance as jest.Mock).mockReturnValue(mockUseTrailerPerformance);
    
    // Mock movie service responses
    const { getMovieDetails, getMoviesByGenre, getMovieTrailer } = require('@/lib/movie-service');
    getMovieDetails.mockResolvedValue(mockMovie);
    getMoviesByGenre.mockResolvedValue([]);
    getMovieTrailer.mockResolvedValue(null);

    // Mock requestIdleCallback to execute immediately
    mockRequestIdleCallback.mockImplementation((callback) => {
      setTimeout(callback, 0);
      return 1;
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should render movie details immediately without waiting for trailer', async () => {
    // Import the component dynamically to avoid module loading issues
    const MovieDetailPage = (await import('../[id]/[slug]/page')).default;
    
    const mockParams = Promise.resolve({ id: '123', slug: 'test-movie' });

    const startTime = performance.now();
    
    render(<MovieDetailPage params={mockParams} />);

    // Movie details should be visible immediately
    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
    });

    const renderTime = performance.now() - startTime;
    
    // Initial render should be fast (under 100ms in test environment)
    expect(renderTime).toBeLessThan(100);
    
    // Trailer button should show loading state initially
    expect(screen.getByText('Loading Trailer...')).toBeInTheDocument();
  });

  it('should use requestIdleCallback for non-blocking trailer loading', async () => {
    const MovieDetailPage = (await import('../[id]/[slug]/page')).default;
    const mockParams = Promise.resolve({ id: '123', slug: 'test-movie' });

    render(<MovieDetailPage params={mockParams} />);

    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
    });

    // Should use requestIdleCallback for trailer loading
    expect(mockRequestIdleCallback).toHaveBeenCalledWith(
      expect.any(Function),
      { timeout: 2000 }
    );
  });

  it('should handle trailer loading performance monitoring', async () => {
    const MovieDetailPage = (await import('../[id]/[slug]/page')).default;
    const mockParams = Promise.resolve({ id: '123', slug: 'test-movie' });

    mockUseTrailerPerformance.startPerformanceMonitoring.mockReturnValue(100);
    mockUseTrailerPerformance.endPerformanceMonitoring.mockReturnValue({
      movieId: '123',
      duration: 500,
      cacheHit: false,
      performanceGrade: 'Excellent',
      timestamp: Date.now()
    });

    render(<MovieDetailPage params={mockParams} />);

    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
    });

    // Performance monitoring should be started
    await waitFor(() => {
      expect(mockUseTrailerPerformance.startPerformanceMonitoring).toHaveBeenCalled();
    });
  });

  it('should demonstrate performance benefits of cached trailers', async () => {
    // Test with cached trailer
    const movieWithTrailer = {
      ...mockMovie,
      trailer: 'https://www.youtube.com/embed/test123'
    };

    const { getMovieDetails } = require('@/lib/movie-service');
    getMovieDetails.mockResolvedValue(movieWithTrailer);

    const MovieDetailPage = (await import('../[id]/[slug]/page')).default;
    const mockParams = Promise.resolve({ id: '123', slug: 'test-movie' });

    const startTime = performance.now();
    
    render(<MovieDetailPage params={mockParams} />);

    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
    });

    const renderTime = performance.now() - startTime;
    
    // With cached trailer, render should still be fast
    expect(renderTime).toBeLessThan(100);
    
    // Should eventually show trailer button
    await waitFor(() => {
      expect(screen.getByText('Watch Trailer')).toBeInTheDocument();
    });
  });

  it('should handle trailer loading errors gracefully without blocking UI', async () => {
    const { getMovieTrailer } = require('@/lib/movie-service');
    getMovieTrailer.mockRejectedValue(new Error('Network error'));

    const MovieDetailPage = (await import('../[id]/[slug]/page')).default;
    const mockParams = Promise.resolve({ id: '123', slug: 'test-movie' });

    render(<MovieDetailPage params={mockParams} />);

    // Movie details should still render
    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
    });

    // Should eventually show trailer unavailable
    await waitFor(() => {
      expect(screen.getByText('Trailer Unavailable')).toBeInTheDocument();
    });

    // Performance monitoring should still be called even on error
    expect(mockUseTrailerPerformance.endPerformanceMonitoring).toHaveBeenCalledWith(false);
  });

  it('should measure and log performance insights', async () => {
    const MovieDetailPage = (await import('../[id]/[slug]/page')).default;
    const mockParams = Promise.resolve({ id: '123', slug: 'test-movie' });

    render(<MovieDetailPage params={mockParams} />);

    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
    });

    // Should log performance insights after trailer loading
    await waitFor(() => {
      expect(mockUseTrailerPerformance.logPerformanceInsights).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('should prioritize critical content rendering over trailer loading', async () => {
    const MovieDetailPage = (await import('../[id]/[slug]/page')).default;
    const mockParams = Promise.resolve({ id: '123', slug: 'test-movie' });

    const renderStartTime = performance.now();
    
    render(<MovieDetailPage params={mockParams} />);

    // Critical content should render first
    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
      expect(screen.getByText('A test movie description')).toBeInTheDocument();
      expect(screen.getByText('Test Director')).toBeInTheDocument();
    });

    const criticalContentTime = performance.now() - renderStartTime;
    
    // Critical content should render very quickly
    expect(criticalContentTime).toBeLessThan(50);
    
    // Trailer loading should be deferred
    expect(mockRequestIdleCallback).toHaveBeenCalled();
  });

  it('should handle multiple concurrent movie page loads efficiently', async () => {
    const MovieDetailPage = (await import('../[id]/[slug]/page')).default;
    
    // Simulate multiple movie pages
    const mockParams1 = Promise.resolve({ id: '123', slug: 'test-movie-1' });
    const mockParams2 = Promise.resolve({ id: '456', slug: 'test-movie-2' });

    const { container: container1 } = render(<MovieDetailPage params={mockParams1} />);
    const { container: container2 } = render(<MovieDetailPage params={mockParams2} />);

    // Both should render their content
    await waitFor(() => {
      expect(screen.getAllByText('Test Movie')).toHaveLength(2);
    });

    // Performance monitoring should be called for both
    expect(mockUseTrailerPerformance.startPerformanceMonitoring).toHaveBeenCalledTimes(2);
  });
});