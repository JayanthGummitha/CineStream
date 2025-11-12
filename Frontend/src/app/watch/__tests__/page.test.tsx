/**
 * Unit tests for Watch Page URL parameter parsing
 * Tests requirement 4.1: URL parameter handling for auto-fullscreen functionality
 */

import { render, screen } from '@testing-library/react';
import WatchPage from '../[id]/page';

// Mock the Video component
jest.mock('@/components/Video', () => {
  return function MockVideo({ autoFullscreen, autoPlay, isTrailer }: any) {
    return (
      <div data-testid="video-component">
        <div data-testid="auto-fullscreen">{autoFullscreen ? 'true' : 'false'}</div>
        <div data-testid="auto-play">{autoPlay ? 'true' : 'false'}</div>
        <div data-testid="is-trailer">{isTrailer ? 'true' : 'false'}</div>
      </div>
    );
  };
});

// Mock React's use hook for async params
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  use: jest.fn()
}));

const mockUse = require('react').use as jest.MockedFunction<typeof import('react').use>;

describe('WatchPage URL Parameter Parsing', () => {
  const mockParams = Promise.resolve({ id: 'test-movie-id' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('URL Parameter Extraction', () => {
    it('should parse fullscreen=true parameter correctly', () => {
      const mockSearchParams = Promise.resolve({
        fullscreen: 'true',
        autoplay: 'false',
        trailer: 'false'
      });

      mockUse.mockImplementation((promise) => {
        if (promise === mockSearchParams) {
          return { fullscreen: 'true', autoplay: 'false', trailer: 'false' };
        }
        return { id: 'test-movie-id' };
      });

      render(<WatchPage params={mockParams} searchParams={mockSearchParams} />);

      expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('true');
      expect(screen.getByTestId('auto-play')).toHaveTextContent('false');
      expect(screen.getByTestId('is-trailer')).toHaveTextContent('false');
    });

    it('should parse autoplay=true parameter correctly', () => {
      const mockSearchParams = Promise.resolve({
        fullscreen: 'false',
        autoplay: 'true',
        trailer: 'false'
      });

      mockUse.mockImplementation((promise) => {
        if (promise === mockSearchParams) {
          return { fullscreen: 'false', autoplay: 'true', trailer: 'false' };
        }
        return { id: 'test-movie-id' };
      });

      render(<WatchPage params={mockParams} searchParams={mockSearchParams} />);

      expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('false');
      expect(screen.getByTestId('auto-play')).toHaveTextContent('true');
      expect(screen.getByTestId('is-trailer')).toHaveTextContent('false');
    });

    it('should parse trailer=true parameter correctly', () => {
      const mockSearchParams = Promise.resolve({
        fullscreen: 'false',
        autoplay: 'false',
        trailer: 'true'
      });

      mockUse.mockImplementation((promise) => {
        if (promise === mockSearchParams) {
          return { fullscreen: 'false', autoplay: 'false', trailer: 'true' };
        }
        return { id: 'test-movie-id' };
      });

      render(<WatchPage params={mockParams} searchParams={mockSearchParams} />);

      expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('false');
      expect(screen.getByTestId('auto-play')).toHaveTextContent('false');
      expect(screen.getByTestId('is-trailer')).toHaveTextContent('true');
    });

    it('should handle multiple parameters together', () => {
      const mockSearchParams = Promise.resolve({
        fullscreen: 'true',
        autoplay: 'true',
        trailer: 'false'
      });

      mockUse.mockImplementation((promise) => {
        if (promise === mockSearchParams) {
          return { fullscreen: 'true', autoplay: 'true', trailer: 'false' };
        }
        return { id: 'test-movie-id' };
      });

      render(<WatchPage params={mockParams} searchParams={mockSearchParams} />);

      expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('true');
      expect(screen.getByTestId('auto-play')).toHaveTextContent('true');
      expect(screen.getByTestId('is-trailer')).toHaveTextContent('false');
    });

    it('should handle all parameters set to true', () => {
      const mockSearchParams = Promise.resolve({
        fullscreen: 'true',
        autoplay: 'true',
        trailer: 'true'
      });

      mockUse.mockImplementation((promise) => {
        if (promise === mockSearchParams) {
          return { fullscreen: 'true', autoplay: 'true', trailer: 'true' };
        }
        return { id: 'test-movie-id' };
      });

      render(<WatchPage params={mockParams} searchParams={mockSearchParams} />);

      expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('true');
      expect(screen.getByTestId('auto-play')).toHaveTextContent('true');
      expect(screen.getByTestId('is-trailer')).toHaveTextContent('true');
    });
  });

  describe('Parameter Validation and Default Values', () => {
    it('should default to false when parameters are not provided', () => {
      const mockSearchParams = Promise.resolve({});

      mockUse.mockImplementation((promise) => {
        if (promise === mockSearchParams) {
          return {};
        }
        return { id: 'test-movie-id' };
      });

      render(<WatchPage params={mockParams} searchParams={mockSearchParams} />);

      expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('false');
      expect(screen.getByTestId('auto-play')).toHaveTextContent('false');
      expect(screen.getByTestId('is-trailer')).toHaveTextContent('false');
    });

    it('should default to false when searchParams is undefined', () => {
      mockUse.mockImplementation(() => {
        return { id: 'test-movie-id' };
      });

      render(<WatchPage params={mockParams} searchParams={undefined} />);

      expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('false');
      expect(screen.getByTestId('auto-play')).toHaveTextContent('false');
      expect(screen.getByTestId('is-trailer')).toHaveTextContent('false');
    });

    it('should treat non-"true" values as false for fullscreen parameter', () => {
      const mockSearchParams = Promise.resolve({
        fullscreen: 'false',
        autoplay: 'yes',
        trailer: '1'
      });

      mockUse.mockImplementation((promise) => {
        if (promise === mockSearchParams) {
          return { fullscreen: 'false', autoplay: 'yes', trailer: '1' };
        }
        return { id: 'test-movie-id' };
      });

      render(<WatchPage params={mockParams} searchParams={mockSearchParams} />);

      expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('false');
      expect(screen.getByTestId('auto-play')).toHaveTextContent('false');
      expect(screen.getByTestId('is-trailer')).toHaveTextContent('false');
    });

    it('should handle case-sensitive parameter values', () => {
      const mockSearchParams = Promise.resolve({
        fullscreen: 'True',
        autoplay: 'TRUE',
        trailer: 'true'
      });

      mockUse.mockImplementation((promise) => {
        if (promise === mockSearchParams) {
          return { fullscreen: 'True', autoplay: 'TRUE', trailer: 'true' };
        }
        return { id: 'test-movie-id' };
      });

      render(<WatchPage params={mockParams} searchParams={mockSearchParams} />);

      // Only exact 'true' should be treated as true
      expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('false');
      expect(screen.getByTestId('auto-play')).toHaveTextContent('false');
      expect(screen.getByTestId('is-trailer')).toHaveTextContent('true');
    });

    it('should handle empty string parameter values', () => {
      const mockSearchParams = Promise.resolve({
        fullscreen: '',
        autoplay: '',
        trailer: ''
      });

      mockUse.mockImplementation((promise) => {
        if (promise === mockSearchParams) {
          return { fullscreen: '', autoplay: '', trailer: '' };
        }
        return { id: 'test-movie-id' };
      });

      render(<WatchPage params={mockParams} searchParams={mockSearchParams} />);

      expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('false');
      expect(screen.getByTestId('auto-play')).toHaveTextContent('false');
      expect(screen.getByTestId('is-trailer')).toHaveTextContent('false');
    });

    it('should handle undefined parameter values', () => {
      const mockSearchParams = Promise.resolve({
        fullscreen: undefined,
        autoplay: undefined,
        trailer: undefined
      });

      mockUse.mockImplementation((promise) => {
        if (promise === mockSearchParams) {
          return { fullscreen: undefined, autoplay: undefined, trailer: undefined };
        }
        return { id: 'test-movie-id' };
      });

      render(<WatchPage params={mockParams} searchParams={mockSearchParams} />);

      expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('false');
      expect(screen.getByTestId('auto-play')).toHaveTextContent('false');
      expect(screen.getByTestId('is-trailer')).toHaveTextContent('false');
    });
  });

  describe('Props Propagation to Video Component', () => {
    it('should pass parsed parameters as props to Video component', () => {
      const mockSearchParams = Promise.resolve({
        fullscreen: 'true',
        autoplay: 'true',
        trailer: 'false'
      });

      mockUse.mockImplementation((promise) => {
        if (promise === mockSearchParams) {
          return { fullscreen: 'true', autoplay: 'true', trailer: 'false' };
        }
        return { id: 'test-movie-id' };
      });

      render(<WatchPage params={mockParams} searchParams={mockSearchParams} />);

      // Verify that the Video component receives the correct props
      expect(screen.getByTestId('video-component')).toBeInTheDocument();
      expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('true');
      expect(screen.getByTestId('auto-play')).toHaveTextContent('true');
      expect(screen.getByTestId('is-trailer')).toHaveTextContent('false');
    });

    it('should pass default values when no parameters are provided', () => {
      mockUse.mockImplementation(() => {
        return { id: 'test-movie-id' };
      });

      render(<WatchPage params={mockParams} searchParams={undefined} />);

      expect(screen.getByTestId('video-component')).toBeInTheDocument();
      expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('false');
      expect(screen.getByTestId('auto-play')).toHaveTextContent('false');
      expect(screen.getByTestId('is-trailer')).toHaveTextContent('false');
    });
  });

  describe('URL Parameter Interface Compliance', () => {
    it('should handle WatchPageProps interface correctly', () => {
      const mockSearchParams = Promise.resolve({
        fullscreen: 'true',
        autoplay: 'true',
        trailer: 'true'
      });

      mockUse.mockImplementation((promise) => {
        if (promise === mockSearchParams) {
          return { fullscreen: 'true', autoplay: 'true', trailer: 'true' };
        }
        return { id: 'test-movie-id' };
      });

      // Should not throw when rendering with proper interface
      expect(() => {
        render(<WatchPage params={mockParams} searchParams={mockSearchParams} />);
      }).not.toThrow();

      expect(screen.getByTestId('video-component')).toBeInTheDocument();
    });

    it('should handle optional searchParams in interface', () => {
      mockUse.mockImplementation(() => {
        return { id: 'test-movie-id' };
      });

      // Should not throw when searchParams is undefined
      expect(() => {
        render(<WatchPage params={mockParams} searchParams={undefined} />);
      }).not.toThrow();

      expect(screen.getByTestId('video-component')).toBeInTheDocument();
    });

    it('should handle Promise-based params correctly', async () => {
      const mockSearchParams = Promise.resolve({
        fullscreen: 'true',
        autoplay: 'false'
      });

      mockUse.mockImplementation((promise) => {
        if (promise === mockSearchParams) {
          return { fullscreen: 'true', autoplay: 'false' };
        }
        return { id: 'test-movie-id' };
      });

      render(<WatchPage params={mockParams} searchParams={mockSearchParams} />);

      // Verify that async params are handled correctly
      expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('true');
      expect(screen.getByTestId('auto-play')).toHaveTextContent('false');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed URL parameters gracefully', () => {
      const mockSearchParams = Promise.resolve({
        fullscreen: 'true&autoplay=false',
        autoplay: 'true%20false',
        trailer: 'null'
      });

      mockUse.mockImplementation((promise) => {
        if (promise === mockSearchParams) {
          return { 
            fullscreen: 'true&autoplay=false', 
            autoplay: 'true%20false', 
            trailer: 'null' 
          };
        }
        return { id: 'test-movie-id' };
      });

      expect(() => {
        render(<WatchPage params={mockParams} searchParams={mockSearchParams} />);
      }).not.toThrow();

      // Malformed values should be treated as false
      expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('false');
      expect(screen.getByTestId('auto-play')).toHaveTextContent('false');
      expect(screen.getByTestId('is-trailer')).toHaveTextContent('false');
    });

    it('should handle extra unexpected parameters', () => {
      const mockSearchParams = Promise.resolve({
        fullscreen: 'true',
        autoplay: 'true',
        trailer: 'false',
        unexpected: 'value',
        another: 'param'
      } as any);

      mockUse.mockImplementation((promise) => {
        if (promise === mockSearchParams) {
          return { 
            fullscreen: 'true', 
            autoplay: 'true', 
            trailer: 'false',
            unexpected: 'value',
            another: 'param'
          };
        }
        return { id: 'test-movie-id' };
      });

      expect(() => {
        render(<WatchPage params={mockParams} searchParams={mockSearchParams} />);
      }).not.toThrow();

      // Should only process expected parameters
      expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('true');
      expect(screen.getByTestId('auto-play')).toHaveTextContent('true');
      expect(screen.getByTestId('is-trailer')).toHaveTextContent('false');
    });

    it('should handle null parameter values', () => {
      const mockSearchParams = Promise.resolve({
        fullscreen: null,
        autoplay: null,
        trailer: null
      } as any);

      mockUse.mockImplementation((promise) => {
        if (promise === mockSearchParams) {
          return { fullscreen: null, autoplay: null, trailer: null };
        }
        return { id: 'test-movie-id' };
      });

      expect(() => {
        render(<WatchPage params={mockParams} searchParams={mockSearchParams} />);
      }).not.toThrow();

      expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('false');
      expect(screen.getByTestId('auto-play')).toHaveTextContent('false');
      expect(screen.getByTestId('is-trailer')).toHaveTextContent('false');
    });
  });

  describe('Requirements Verification', () => {
    it('should satisfy requirement 1.1: Navigate to watch page with fullscreen parameters', () => {
      const mockSearchParams = Promise.resolve({
        fullscreen: 'true',
        autoplay: 'true'
      });

      mockUse.mockImplementation((promise) => {
        if (promise === mockSearchParams) {
          return { fullscreen: 'true', autoplay: 'true' };
        }
        return { id: 'test-movie-id' };
      });

      render(<WatchPage params={mockParams} searchParams={mockSearchParams} />);

      // Verify that fullscreen parameters are correctly parsed and passed
      expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('true');
      expect(screen.getByTestId('auto-play')).toHaveTextContent('true');
    });

    it('should satisfy requirement 1.2: Video player receives fullscreen parameters', () => {
      const mockSearchParams = Promise.resolve({
        fullscreen: 'true',
        autoplay: 'false'
      });

      mockUse.mockImplementation((promise) => {
        if (promise === mockSearchParams) {
          return { fullscreen: 'true', autoplay: 'false' };
        }
        return { id: 'test-movie-id' };
      });

      render(<WatchPage params={mockParams} searchParams={mockSearchParams} />);

      // Verify that Video component receives the parsed parameters
      expect(screen.getByTestId('video-component')).toBeInTheDocument();
      expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('true');
      expect(screen.getByTestId('auto-play')).toHaveTextContent('false');
    });

    it('should satisfy requirement 4.4: Maintain backward compatibility', () => {
      // Test that the page works without any search parameters
      mockUse.mockImplementation(() => {
        return { id: 'test-movie-id' };
      });

      expect(() => {
        render(<WatchPage params={mockParams} searchParams={undefined} />);
      }).not.toThrow();

      // Should render with default values
      expect(screen.getByTestId('video-component')).toBeInTheDocument();
      expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('false');
      expect(screen.getByTestId('auto-play')).toHaveTextContent('false');
      expect(screen.getByTestId('is-trailer')).toHaveTextContent('false');
    });
  });

  describe('Type Safety and Interface Validation', () => {
    it('should handle typed searchParams interface correctly', () => {
      const mockSearchParams: Promise<{
        fullscreen?: string;
        autoplay?: string;
        trailer?: string;
      }> = Promise.resolve({
        fullscreen: 'true',
        autoplay: 'true',
        trailer: 'false'
      });

      mockUse.mockImplementation((promise) => {
        if (promise === mockSearchParams) {
          return { fullscreen: 'true', autoplay: 'true', trailer: 'false' };
        }
        return { id: 'test-movie-id' };
      });

      expect(() => {
        render(<WatchPage params={mockParams} searchParams={mockSearchParams} />);
      }).not.toThrow();

      expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('true');
      expect(screen.getByTestId('auto-play')).toHaveTextContent('true');
      expect(screen.getByTestId('is-trailer')).toHaveTextContent('false');
    });

    it('should handle partial searchParams interface', () => {
      const mockSearchParams = Promise.resolve({
        fullscreen: 'true'
        // autoplay and trailer are missing
      });

      mockUse.mockImplementation((promise) => {
        if (promise === mockSearchParams) {
          return { fullscreen: 'true' };
        }
        return { id: 'test-movie-id' };
      });

      expect(() => {
        render(<WatchPage params={mockParams} searchParams={mockSearchParams} />);
      }).not.toThrow();

      expect(screen.getByTestId('auto-fullscreen')).toHaveTextContent('true');
      expect(screen.getByTestId('auto-play')).toHaveTextContent('false');
      expect(screen.getByTestId('is-trailer')).toHaveTextContent('false');
    });
  });
});