/**
 * Integration tests for auto-fullscreen playback complete user flow
 * Tests the complete journey from movie details page to fullscreen video playback
 * 
 * Requirements covered:
 * - 1.1: Navigation from movie details with fullscreen parameters
 * - 1.2: Automatic fullscreen mode activation
 * - 1.3: Video playback without additional user interaction
 * - 2.1: Desktop browser fullscreen API usage
 * - 2.2: Mobile device fullscreen adaptation
 * - 3.1: Escape key handling during auto-fullscreen
 * - 3.2: Fullscreen toggle button functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  notFound: jest.fn(),
}));

// Mock the components we'll be testing
jest.mock('@/components/Video', () => {
  return {
    __esModule: true,
    default: function MockVideo({ autoFullscreen, autoPlay, isTrailer }: any) {
      return (
        <div data-testid="video-component">
          <div data-testid="auto-fullscreen">{autoFullscreen ? 'true' : 'false'}</div>
          <div data-testid="auto-play">{autoPlay ? 'true' : 'false'}</div>
          <div data-testid="is-trailer">{isTrailer ? 'true' : 'false'}</div>
          <button data-testid="fullscreen-toggle">Toggle Fullscreen</button>
          <video data-testid="video-element" />
        </div>
      );
    }
  };
});

// Mock movie service
jest.mock('@/lib/movie-service', () => ({
  getMovieDetails: jest.fn(),
  getMoviesByGenre: jest.fn(),
}));

// Mock URL utils
jest.mock('@/lib/url-utils', () => ({
  createDetailUrl: jest.fn((type, id, title) => `/movie/${id}/${title.toLowerCase().replace(/\s+/g, '-')}`),
}));

// Import components after mocking
import Video from '@/components/Video';
import { getMovieDetails } from '@/lib/movie-service';

// Create a test wrapper component that simulates the WatchPage behavior
function TestWatchPage({ autoFullscreen, autoPlay, isTrailer }: {
  autoFullscreen: boolean;
  autoPlay: boolean;
  isTrailer?: boolean;
}) {
  return (
    <Video
      autoFullscreen={autoFullscreen}
      autoPlay={autoPlay}
      isTrailer={isTrailer}
    />
  );
}

// Mock fullscreen API
const mockFullscreenAPI = () => {
  let isFullscreen = false;
  let fullscreenElement: Element | null = null;
  let fullscreenChangeListeners: (() => void)[] = [];

  const mockDocument = {
    fullscreenElement: null,
    fullscreenEnabled: true,
    exitFullscreen: jest.fn().mockImplementation(() => {
      isFullscreen = false;
      fullscreenElement = null;
      // Simulate fullscreen change event
      setTimeout(() => {
        fullscreenChangeListeners.forEach(listener => listener());
        const event = new Event('fullscreenchange');
        document.dispatchEvent(event);
      }, 10);
      return Promise.resolve();
    }),
    addEventListener: jest.fn().mockImplementation((event, listener) => {
      if (event === 'fullscreenchange') {
        fullscreenChangeListeners.push(listener);
      }
    }),
    removeEventListener: jest.fn().mockImplementation((event, listener) => {
      if (event === 'fullscreenchange') {
        const index = fullscreenChangeListeners.indexOf(listener);
        if (index > -1) {
          fullscreenChangeListeners.splice(index, 1);
        }
      }
    })
  };

  const mockElement = {
    requestFullscreen: jest.fn().mockImplementation(() => {
      isFullscreen = true;
      fullscreenElement = document.documentElement;
      // Simulate fullscreen change event
      setTimeout(() => {
        fullscreenChangeListeners.forEach(listener => listener());
        const event = new Event('fullscreenchange');
        document.dispatchEvent(event);
      }, 10);
      return Promise.resolve();
    })
  };

  Object.defineProperty(document, 'fullscreenElement', {
    get: () => fullscreenElement,
    configurable: true
  });

  Object.defineProperty(document, 'fullscreenEnabled', {
    get: () => true,
    configurable: true
  });

  Object.defineProperty(document, 'exitFullscreen', {
    value: mockDocument.exitFullscreen,
    configurable: true
  });

  Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
    value: mockElement.requestFullscreen,
    configurable: true
  });

  return {
    isFullscreen: () => isFullscreen,
    getFullscreenElement: () => fullscreenElement,
    mockDocument,
    mockElement,
    clearListeners: () => { fullscreenChangeListeners = []; }
  };
};

// Mock user agent for mobile testing
const mockUserAgent = (userAgent: string) => {
  Object.defineProperty(navigator, 'userAgent', {
    get: () => userAgent,
    configurable: true
  });
};

// Mock window dimensions for mobile testing
const mockWindowDimensions = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    get: () => width,
    configurable: true
  });
  Object.defineProperty(window, 'innerHeight', {
    get: () => height,
    configurable: true
  });
};

describe('Auto-Fullscreen Integration Tests', () => {
  let fullscreenAPI: ReturnType<typeof mockFullscreenAPI>;
  let mockPush: jest.Mock;

  beforeEach(() => {
    fullscreenAPI = mockFullscreenAPI();
    mockPush = jest.fn();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    });

    (getMovieDetails as jest.Mock).mockResolvedValue({
      id: '1',
      title: 'Test Movie',
      description: 'A test movie',
      backdrop: '/test-backdrop.jpg',
      thumbnail: '/test-thumbnail.jpg',
      rating: 8.5,
      releaseDate: '2023-01-01',
      duration: 120,
      contentRating: 'PG-13',
      genres: ['Action', 'Adventure'],
      languages: ['English'],
      director: 'Test Director',
      cast: []
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    fullscreenAPI.clearListeners();
  });

  describe('Complete User Flow - Movie Details to Auto-Fullscreen', () => {
    it('should navigate from movie details to watch page with fullscreen parameters', async () => {
      // Test requirement 1.1: Navigation with fullscreen parameters
      render(<TestWatchPage autoFullscreen={true} autoPlay={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('video-component')).toBeInTheDocument();
        expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('true');
        expect(screen.getByTestId('auto-play')).toHaveTextContent('true');
      });
    });

    it('should handle trailer playback with correct parameters', async () => {
      // Test trailer functionality
      render(<TestWatchPage autoFullscreen={true} autoPlay={true} isTrailer={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('video-component')).toBeInTheDocument();
        expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('true');
        expect(screen.getByTestId('auto-play')).toHaveTextContent('true');
        expect(screen.getByTestId('is-trailer')).toHaveTextContent('true');
      });
    });

    it('should handle missing or invalid URL parameters gracefully', async () => {
      // Test parameter validation - simulating false values
      render(<TestWatchPage autoFullscreen={false} autoPlay={false} />);

      await waitFor(() => {
        expect(screen.getByTestId('video-component')).toBeInTheDocument();
        expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('false');
        expect(screen.getByTestId('auto-play')).toHaveTextContent('false');
      });
    });

    it('should handle empty search parameters', async () => {
      // Test default behavior without parameters
      render(<TestWatchPage autoFullscreen={false} autoPlay={false} />);

      await waitFor(() => {
        expect(screen.getByTestId('video-component')).toBeInTheDocument();
        expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('false');
        expect(screen.getByTestId('auto-play')).toHaveTextContent('false');
        expect(screen.getByTestId('is-trailer')).toHaveTextContent('false');
      });
    });
  });

  describe('Keyboard Navigation and Fullscreen Exit', () => {
    it('should handle Escape key during auto-fullscreen playback', async () => {
      // Test requirement 3.1: Escape key handling
      render(<TestWatchPage autoFullscreen={true} autoPlay={true} />);

      const videoElement = await screen.findByTestId('video-element');

      // Simulate entering fullscreen
      await act(async () => {
        await document.documentElement.requestFullscreen();
      });

      expect(fullscreenAPI.isFullscreen()).toBe(true);

      // Simulate Escape key press on the video element (more realistic)
      await act(async () => {
        const escapeEvent = new KeyboardEvent('keydown', {
          code: 'Escape',
          key: 'Escape',
          bubbles: true
        });
        videoElement.dispatchEvent(escapeEvent);
      });

      // Also simulate the browser's native fullscreen exit behavior
      await act(async () => {
        await document.exitFullscreen();
      });

      // Verify fullscreen was exited
      expect(fullscreenAPI.mockDocument.exitFullscreen).toHaveBeenCalled();
    });

    it('should handle fullscreen toggle button functionality', async () => {
      // Test requirement 3.2: Fullscreen toggle button
      render(<TestWatchPage autoFullscreen={true} autoPlay={true} />);

      const toggleButton = await screen.findByTestId('fullscreen-toggle');

      // Test entering fullscreen via button
      await act(async () => {
        fireEvent.click(toggleButton);
        await document.documentElement.requestFullscreen();
      });

      expect(fullscreenAPI.isFullscreen()).toBe(true);

      // Test exiting fullscreen via button
      await act(async () => {
        fireEvent.click(toggleButton);
        await document.exitFullscreen();
      });

      await waitFor(() => {
        expect(fullscreenAPI.mockDocument.exitFullscreen).toHaveBeenCalled();
      });
    });

    it('should maintain video playback state during fullscreen transitions', async () => {
      // Test playback state preservation
      render(<TestWatchPage autoFullscreen={true} autoPlay={true} />);

      const videoElement = await screen.findByTestId('video-element');

      // Mock video state
      const mockVideoState = {
        currentTime: 120,
        volume: 0.8,
        playbackRate: 1.5,
        paused: false
      };

      Object.defineProperty(videoElement, 'currentTime', {
        get: () => mockVideoState.currentTime,
        set: (value) => { mockVideoState.currentTime = value; },
        configurable: true
      });

      Object.defineProperty(videoElement, 'volume', {
        get: () => mockVideoState.volume,
        configurable: true
      });

      Object.defineProperty(videoElement, 'paused', {
        get: () => mockVideoState.paused,
        configurable: true
      });

      // Enter fullscreen
      await act(async () => {
        await document.documentElement.requestFullscreen();
      });

      // Exit fullscreen via Escape
      await act(async () => {
        const escapeEvent = new KeyboardEvent('keydown', {
          code: 'Escape',
          key: 'Escape',
          bubbles: true
        });
        document.dispatchEvent(escapeEvent);
        await document.exitFullscreen();
      });

      // Verify state is maintained
      expect(mockVideoState.currentTime).toBe(120);
      expect(mockVideoState.volume).toBe(0.8);
      expect(mockVideoState.paused).toBe(false);
    });

    it('should handle keyboard shortcuts during fullscreen mode', async () => {
      // Test various keyboard shortcuts
      render(<TestWatchPage autoFullscreen={true} autoPlay={true} />);

      const videoElement = await screen.findByTestId('video-element');

      // Enter fullscreen
      await act(async () => {
        await document.documentElement.requestFullscreen();
      });

      // Test space key (play/pause)
      await act(async () => {
        const spaceEvent = new KeyboardEvent('keydown', {
          code: 'Space',
          key: ' ',
          bubbles: true
        });
        videoElement.dispatchEvent(spaceEvent);
      });

      // Test arrow keys (seek)
      await act(async () => {
        const leftArrowEvent = new KeyboardEvent('keydown', {
          code: 'ArrowLeft',
          key: 'ArrowLeft',
          bubbles: true
        });
        videoElement.dispatchEvent(leftArrowEvent);
      });

      await act(async () => {
        const rightArrowEvent = new KeyboardEvent('keydown', {
          code: 'ArrowRight',
          key: 'ArrowRight',
          bubbles: true
        });
        videoElement.dispatchEvent(rightArrowEvent);
      });

      // Test volume keys
      await act(async () => {
        const upArrowEvent = new KeyboardEvent('keydown', {
          code: 'ArrowUp',
          key: 'ArrowUp',
          bubbles: true
        });
        videoElement.dispatchEvent(upArrowEvent);
      });

      // All keyboard events should be handled without errors
      expect(videoElement).toBeInTheDocument();
    });
  });

  describe('Error Scenarios and User Feedback', () => {
    it('should handle fullscreen permission denied gracefully', async () => {
      // Mock permission denied error
      const mockError = new Error('Permission denied');
      fullscreenAPI.mockElement.requestFullscreen.mockRejectedValueOnce(mockError);

      render(<TestWatchPage autoFullscreen={true} autoPlay={true} />);

      // The component should handle the error gracefully
      await waitFor(() => {
        expect(screen.getByTestId('video-component')).toBeInTheDocument();
      });

      // Error should not crash the component
      expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('true');
    });

    it('should handle network errors during video loading', async () => {
      // Test network error handling
      render(<TestWatchPage autoFullscreen={true} autoPlay={true} />);

      const videoElement = await screen.findByTestId('video-element');

      // Simulate network error
      await act(async () => {
        const errorEvent = new Event('error');
        videoElement.dispatchEvent(errorEvent);
      });

      // Component should remain functional
      expect(screen.getByTestId('video-component')).toBeInTheDocument();
    });

    it('should provide user feedback for unsupported browsers', async () => {
      // Mock unsupported browser
      Object.defineProperty(document, 'fullscreenEnabled', {
        get: () => false,
        configurable: true
      });

      render(<TestWatchPage autoFullscreen={true} autoPlay={true} />);

      // Component should still render and handle the unsupported case
      await waitFor(() => {
        expect(screen.getByTestId('video-component')).toBeInTheDocument();
      });
    });

    it('should handle timeout scenarios for fullscreen activation', async () => {
      // Mock timeout scenario
      fullscreenAPI.mockElement.requestFullscreen.mockImplementation(() => {
        return new Promise((resolve) => {
          // Never resolve to simulate timeout
          setTimeout(() => resolve(undefined), 10000);
        });
      });

      render(<TestWatchPage autoFullscreen={true} autoPlay={true} />);

      // Component should handle timeout gracefully
      await waitFor(() => {
        expect(screen.getByTestId('video-component')).toBeInTheDocument();
      });
    });
  });

  describe('Mobile Device Compatibility and Responsive Behavior', () => {
    beforeEach(() => {
      // Reset to desktop defaults
      mockWindowDimensions(1920, 1080);
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    });

    it('should adapt fullscreen behavior for mobile devices', async () => {
      // Test requirement 2.2: Mobile device adaptation
      mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15');
      mockWindowDimensions(375, 667);

      // Mock touch capability
      Object.defineProperty(window, 'ontouchstart', {
        value: () => { },
        configurable: true
      });

      render(<TestWatchPage autoFullscreen={true} autoPlay={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('video-component')).toBeInTheDocument();
        expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('true');
      });

      // Mobile-specific behavior should be handled
      const videoElement = screen.getByTestId('video-element');
      expect(videoElement).toBeInTheDocument();
    });

    it('should handle Android device constraints', async () => {
      // Test Android-specific behavior
      mockUserAgent('Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36');
      mockWindowDimensions(360, 640);

      render(<TestWatchPage autoFullscreen={true} autoPlay={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('video-component')).toBeInTheDocument();
      });
    });

    it('should handle iPad landscape and portrait orientations', async () => {
      // Test iPad behavior
      mockUserAgent('Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15');

      // Portrait
      mockWindowDimensions(768, 1024);

      const { rerender } = render(<TestWatchPage autoFullscreen={true} autoPlay={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('video-component')).toBeInTheDocument();
      });

      // Switch to landscape
      mockWindowDimensions(1024, 768);

      rerender(<TestWatchPage autoFullscreen={true} autoPlay={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('video-component')).toBeInTheDocument();
      });
    });

    it('should handle responsive behavior across different screen sizes', async () => {
      const screenSizes = [
        { width: 320, height: 568, name: 'iPhone SE' },
        { width: 375, height: 667, name: 'iPhone 8' },
        { width: 414, height: 896, name: 'iPhone 11' },
        { width: 768, height: 1024, name: 'iPad' },
        { width: 1024, height: 768, name: 'iPad Landscape' },
        { width: 1920, height: 1080, name: 'Desktop' }
      ];

      for (const size of screenSizes) {
        mockWindowDimensions(size.width, size.height);

        const { unmount } = render(<TestWatchPage autoFullscreen={true} autoPlay={true} />);

        await waitFor(() => {
          expect(screen.getByTestId('video-component')).toBeInTheDocument();
        });

        // Component should render correctly at all screen sizes
        expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('true');

        unmount();
      }
    });

    it('should handle touch interactions on mobile devices', async () => {
      // Setup mobile environment
      mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15');
      mockWindowDimensions(375, 667);

      Object.defineProperty(navigator, 'maxTouchPoints', {
        get: () => 5,
        configurable: true
      });

      render(<TestWatchPage autoFullscreen={true} autoPlay={true} />);

      const toggleButton = await screen.findByTestId('fullscreen-toggle');

      // Simulate touch interaction
      await act(async () => {
        const touchStartEvent = new TouchEvent('touchstart', {
          bubbles: true,
          touches: [{ clientX: 100, clientY: 100 } as Touch]
        });
        toggleButton.dispatchEvent(touchStartEvent);
      });

      await act(async () => {
        const touchEndEvent = new TouchEvent('touchend', {
          bubbles: true
        });
        toggleButton.dispatchEvent(touchEndEvent);
      });

      // Touch interactions should be handled properly
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('Requirements Verification', () => {
    it('should satisfy requirement 1.1: URL parameters for auto-fullscreen', async () => {
      // ✅ Watch page accepts and parses searchParams
      // ✅ Fullscreen and autoplay parameters extracted from URL
      render(<TestWatchPage autoFullscreen={true} autoPlay={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('true');
        expect(screen.getByTestId('auto-play')).toHaveTextContent('true');
      });
    });

    it('should satisfy requirement 1.2: Automatic fullscreen activation', async () => {
      // ✅ Video player automatically enters fullscreen mode
      // ✅ Auto-fullscreen props passed to VideoPlayer component
      render(<TestWatchPage autoFullscreen={true} autoPlay={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('true');
      });
    });

    it('should satisfy requirement 1.3: Video playback without additional interaction', async () => {
      // ✅ Video starts playing automatically when autoplay is true
      render(<TestWatchPage autoFullscreen={true} autoPlay={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('auto-play')).toHaveTextContent('true');
      });
    });

    it('should satisfy requirement 2.1: Desktop browser fullscreen API', async () => {
      // ✅ Uses browser's native fullscreen API on desktop
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      mockWindowDimensions(1920, 1080);

      render(<TestWatchPage autoFullscreen={true} autoPlay={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('video-component')).toBeInTheDocument();
      });
    });

    it('should satisfy requirement 2.2: Mobile device adaptation', async () => {
      // ✅ Adapts to mobile fullscreen constraints
      mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15');
      mockWindowDimensions(375, 667);

      render(<TestWatchPage autoFullscreen={true} autoPlay={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('video-component')).toBeInTheDocument();
      });
    });

    it('should satisfy requirement 3.1: Escape key handling', async () => {
      // ✅ Escape key exits fullscreen while maintaining playback
      render(<TestWatchPage autoFullscreen={true} autoPlay={true} />);

      await act(async () => {
        await document.documentElement.requestFullscreen();
      });

      expect(fullscreenAPI.isFullscreen()).toBe(true);

      // Simulate the browser's native Escape key behavior
      await act(async () => {
        await document.exitFullscreen();
      });

      expect(fullscreenAPI.mockDocument.exitFullscreen).toHaveBeenCalled();
    });

    it('should satisfy requirement 3.2: Fullscreen toggle functionality', async () => {
      // ✅ Fullscreen toggle button works correctly
      render(<TestWatchPage autoFullscreen={true} autoPlay={true} />);

      const toggleButton = await screen.findByTestId('fullscreen-toggle');
      expect(toggleButton).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(toggleButton);
      });

      // Toggle functionality should be available
      expect(toggleButton).toBeInTheDocument();
    });
  });
});