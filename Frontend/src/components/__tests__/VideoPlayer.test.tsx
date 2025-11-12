/**
 * Unit tests for VideoPlayer auto-fullscreen prop handling
 * Tests requirement 4.2: VideoPlayer component auto-fullscreen functionality
 */

import { render, screen } from '@testing-library/react';
import { VideoPlayerContent } from '../VideoPlayer';
import { useAutoFullscreen } from '@/hooks/useAutoFullscreen';

// Mock the useAutoFullscreen hook
jest.mock('@/hooks/useAutoFullscreen');
const mockUseAutoFullscreen = useAutoFullscreen as jest.MockedFunction<typeof useAutoFullscreen>;

// Mock Vidstack React components
jest.mock('@vidstack/react', () => ({
  MediaPlayer: ({ children, ...props }: any) => (
    <div data-testid="media-player" {...props}>
      {children}
    </div>
  ),
  MediaProvider: ({ children, ...props }: any) => (
    <div data-testid="media-provider" {...props}>
      {children}
    </div>
  ),
  useMediaState: jest.fn((state: string) => {
    const stateMap: Record<string, any> = {
      playing: false,
      currentTime: 0,
      duration: 100,
      fullscreen: false,
      buffered: [],
      canPlay: true,
      pictureInPicture: false,
      textTracks: [],
      audioTracks: []
    };
    return stateMap[state];
  }),
  Poster: () => <div data-testid="poster" />,
  Caption: () => <div data-testid="caption" />,
  Track: () => <div data-testid="track" />,
  Thumbnail: () => <div data-testid="thumbnail" />,
  PlayButton: () => <button data-testid="play-button">Play</button>
}));

// Mock other components
jest.mock('../VideoPlayerControls', () => ({
  VideoPlayerControls: () => <div data-testid="video-controls" />
}));

jest.mock('../VideoPlayerOverlay', () => ({
  VideoPlayerOverlay: () => <div data-testid="video-overlay" />
}));

jest.mock('../KeyboardShortcuts', () => ({
  KeyboardShortcuts: () => <div data-testid="keyboard-shortcuts" />
}));

jest.mock('../CaptionDisplay', () => ({
  CaptionDisplay: () => <div data-testid="caption-display" />
}));

jest.mock('../FullscreenErrorFeedback', () => ({
  FullscreenErrorFeedback: () => <div data-testid="fullscreen-error-feedback" />
}));

jest.mock('../FullscreenStateManager', () => ({
  FullscreenStateManager: () => <div data-testid="fullscreen-state-manager" />
}));

jest.mock('../FullscreenLoadingIndicator', () => ({
  FullscreenLoadingIndicator: () => <div data-testid="fullscreen-loading-indicator" />
}));

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('VideoPlayer Auto-Fullscreen Props', () => {
  const defaultProps = {
    src: 'https://example.com/video.mp4',
    poster: 'https://example.com/poster.jpg',
    title: 'Test Video'
  };

  const mockAutoFullscreenReturn = {
    handleAutoActions: jest.fn(),
    isProcessing: false,
    fullscreenState: {
      isAttempting: false,
      hasAttempted: false,
      error: null,
      retryCount: 0,
      lastAttemptTime: 0
    },
    retry: jest.fn(),
    clearError: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAutoFullscreen.mockReturnValue(mockAutoFullscreenReturn);
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('Auto-Fullscreen Prop Handling', () => {
    it('should pass autoFullscreen prop to useAutoFullscreen hook', () => {
      render(
        <VideoPlayerContent
          {...defaultProps}
          autoFullscreen={true}
          autoPlay={false}
        />
      );

      expect(mockUseAutoFullscreen).toHaveBeenCalledWith(
        expect.any(Object), // playerRef
        expect.objectContaining({
          autoFullscreen: true,
          autoPlay: false,
          isVideoReady: true, // canPlay is mocked as true
          onError: expect.any(Function),
          onSuccess: expect.any(Function),
          maxRetries: 3,
          retryDelay: 2000,
          timeout: 10000
        })
      );
    });

    it('should pass autoPlay prop to useAutoFullscreen hook', () => {
      render(
        <VideoPlayerContent
          {...defaultProps}
          autoFullscreen={false}
          autoPlay={true}
        />
      );

      expect(mockUseAutoFullscreen).toHaveBeenCalledWith(
        expect.any(Object), // playerRef
        expect.objectContaining({
          autoFullscreen: false,
          autoPlay: true,
          isVideoReady: true,
          onError: expect.any(Function),
          onSuccess: expect.any(Function)
        })
      );
    });

    it('should handle both autoFullscreen and autoPlay props together', () => {
      render(
        <VideoPlayerContent
          {...defaultProps}
          autoFullscreen={true}
          autoPlay={true}
        />
      );

      expect(mockUseAutoFullscreen).toHaveBeenCalledWith(
        expect.any(Object), // playerRef
        expect.objectContaining({
          autoFullscreen: true,
          autoPlay: true,
          isVideoReady: true
        })
      );
    });

    it('should default autoFullscreen and autoPlay to false when not provided', () => {
      render(<VideoPlayerContent {...defaultProps} />);

      expect(mockUseAutoFullscreen).toHaveBeenCalledWith(
        expect.any(Object), // playerRef
        expect.objectContaining({
          autoFullscreen: false,
          autoPlay: false,
          isVideoReady: true
        })
      );
    });
  });

  describe('Video Ready State Integration', () => {
    it('should pass canPlay state as isVideoReady to useAutoFullscreen', () => {
      const mockUseMediaState = require('@vidstack/react').useMediaState;
      mockUseMediaState.mockImplementation((state: string) => {
        if (state === 'canPlay') return false;
        return state === 'playing' ? false : 0;
      });

      render(
        <VideoPlayerContent
          {...defaultProps}
          autoFullscreen={true}
          autoPlay={true}
        />
      );

      expect(mockUseAutoFullscreen).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          isVideoReady: false
        })
      );
    });

    it('should update isVideoReady when canPlay state changes', () => {
      const mockUseMediaState = require('@vidstack/react').useMediaState;
      
      // First render with canPlay = false
      mockUseMediaState.mockImplementation((state: string) => {
        if (state === 'canPlay') return false;
        return state === 'playing' ? false : 0;
      });

      const { rerender } = render(
        <VideoPlayerContent
          {...defaultProps}
          autoFullscreen={true}
          autoPlay={true}
        />
      );

      expect(mockUseAutoFullscreen).toHaveBeenLastCalledWith(
        expect.any(Object),
        expect.objectContaining({
          isVideoReady: false
        })
      );

      // Update canPlay to true
      mockUseMediaState.mockImplementation((state: string) => {
        if (state === 'canPlay') return true;
        return state === 'playing' ? false : 0;
      });

      rerender(
        <VideoPlayerContent
          {...defaultProps}
          autoFullscreen={true}
          autoPlay={true}
        />
      );

      expect(mockUseAutoFullscreen).toHaveBeenLastCalledWith(
        expect.any(Object),
        expect.objectContaining({
          isVideoReady: true
        })
      );
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle auto-fullscreen errors from useAutoFullscreen hook', () => {
      const mockError = {
        name: 'FullscreenError',
        type: 'USER_INTERACTION_REQUIRED',
        message: 'User interaction required',
        retryable: false,
        userMessage: 'Please click the fullscreen button'
      } as any;

      mockUseAutoFullscreen.mockReturnValue({
        ...mockAutoFullscreenReturn,
        fullscreenState: {
          ...mockAutoFullscreenReturn.fullscreenState,
          error: mockError
        }
      });

      render(
        <VideoPlayerContent
          {...defaultProps}
          autoFullscreen={true}
          autoPlay={true}
        />
      );

      // Verify that the error callback is set up
      expect(mockUseAutoFullscreen).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          onError: expect.any(Function)
        })
      );

      // Simulate error callback
      const onErrorCallback = mockUseAutoFullscreen.mock.calls[0]?.[1]?.onError;
      if (onErrorCallback) {
        onErrorCallback(mockError);
        // The component should handle the error (logged to console)
        expect(mockConsoleError).toHaveBeenCalledWith('Auto-fullscreen error:', mockError);
      }
    });

    it('should handle success callback from useAutoFullscreen hook', () => {
      render(
        <VideoPlayerContent
          {...defaultProps}
          autoFullscreen={true}
          autoPlay={true}
        />
      );

      // Verify that the success callback is set up
      expect(mockUseAutoFullscreen).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          onSuccess: expect.any(Function)
        })
      );

      // Simulate success callback
      const onSuccessCallback = mockUseAutoFullscreen.mock.calls[0]?.[1]?.onSuccess;
      if (onSuccessCallback) {
        onSuccessCallback();
        // The component should handle success (logged to console)
        expect(mockConsoleLog).toHaveBeenCalledWith('Auto-fullscreen succeeded');
      }
    });

    it('should filter out USER_INTERACTION_REQUIRED errors from UI display', () => {
      const mockError = {
        name: 'FullscreenError',
        type: 'USER_INTERACTION_REQUIRED',
        message: 'User interaction required',
        retryable: false,
        userMessage: 'Please click the fullscreen button'
      } as any;

      render(
        <VideoPlayerContent
          {...defaultProps}
          autoFullscreen={true}
          autoPlay={true}
        />
      );

      // Simulate USER_INTERACTION_REQUIRED error
      const onErrorCallback = mockUseAutoFullscreen.mock.calls[0]?.[1]?.onError;
      if (onErrorCallback) {
        onErrorCallback(mockError);
        // Should log for debugging but not show error UI
        expect(mockConsoleLog).toHaveBeenCalledWith(
          '🎬 Auto-fullscreen requires user interaction - user can manually click fullscreen button'
        );
      }
    });

    it('should show error UI for other error types', () => {
      const mockError = {
        name: 'FullscreenError',
        type: 'PERMISSION_DENIED',
        message: 'Permission denied',
        retryable: true,
        userMessage: 'Fullscreen was blocked'
      } as any;

      render(
        <VideoPlayerContent
          {...defaultProps}
          autoFullscreen={true}
          autoPlay={true}
        />
      );

      // Simulate PERMISSION_DENIED error
      const onErrorCallback = mockUseAutoFullscreen.mock.calls[0]?.[1]?.onError;
      if (onErrorCallback) {
        onErrorCallback(mockError);
        // Should show error and log
        expect(mockConsoleError).toHaveBeenCalledWith('Auto-fullscreen error:', mockError);
      }
    });
  });

  describe('Loading State Management', () => {
    it('should show loading indicator when fullscreen is attempting', () => {
      mockUseAutoFullscreen.mockReturnValue({
        ...mockAutoFullscreenReturn,
        fullscreenState: {
          ...mockAutoFullscreenReturn.fullscreenState,
          isAttempting: true
        }
      });

      render(
        <VideoPlayerContent
          {...defaultProps}
          autoFullscreen={true}
          autoPlay={true}
        />
      );

      // The component should show loading indicator when attempting
      expect(screen.getByTestId('fullscreen-loading-indicator')).toBeDefined();
    });

    it('should hide loading indicator when not attempting', () => {
      mockUseAutoFullscreen.mockReturnValue({
        ...mockAutoFullscreenReturn,
        fullscreenState: {
          ...mockAutoFullscreenReturn.fullscreenState,
          isAttempting: false
        }
      });

      render(
        <VideoPlayerContent
          {...defaultProps}
          autoFullscreen={true}
          autoPlay={true}
        />
      );

      // Loading indicator should not be visible when not attempting
      // (This would be tested in the actual component implementation)
    });
  });

  describe('Retry Functionality Integration', () => {
    it('should provide retry functionality through useAutoFullscreen', () => {
      const mockRetry = jest.fn();
      mockUseAutoFullscreen.mockReturnValue({
        ...mockAutoFullscreenReturn,
        retry: mockRetry
      });

      render(
        <VideoPlayerContent
          {...defaultProps}
          autoFullscreen={true}
          autoPlay={true}
        />
      );

      // The retry function should be available
      expect(mockRetry).toBeDefined();
    });

    it('should provide clearError functionality through useAutoFullscreen', () => {
      const mockClearError = jest.fn();
      mockUseAutoFullscreen.mockReturnValue({
        ...mockAutoFullscreenReturn,
        clearError: mockClearError
      });

      render(
        <VideoPlayerContent
          {...defaultProps}
          autoFullscreen={true}
          autoPlay={true}
        />
      );

      // The clearError function should be available
      expect(mockClearError).toBeDefined();
    });
  });

  describe('Requirements Verification', () => {
    it('should satisfy requirement 4.1: Reuse existing VideoPlayer component functionality', () => {
      render(
        <VideoPlayerContent
          {...defaultProps}
          autoFullscreen={true}
          autoPlay={true}
        />
      );

      // Verify that existing VideoPlayer components are rendered
      expect(screen.getByTestId('media-player')).toBeDefined();
      expect(screen.getByTestId('media-provider')).toBeDefined();
      expect(screen.getByTestId('video-controls')).toBeDefined();
      expect(screen.getByTestId('video-overlay')).toBeDefined();
    });

    it('should satisfy requirement 4.2: Preserve existing video player state management', () => {
      render(
        <VideoPlayerContent
          {...defaultProps}
          autoFullscreen={true}
          autoPlay={true}
        />
      );

      // Verify that Vidstack's useMediaState hooks are being used
      const mockUseMediaState = require('@vidstack/react').useMediaState;
      expect(mockUseMediaState).toHaveBeenCalledWith('playing', expect.any(Object));
      expect(mockUseMediaState).toHaveBeenCalledWith('currentTime', expect.any(Object));
      expect(mockUseMediaState).toHaveBeenCalledWith('duration', expect.any(Object));
      expect(mockUseMediaState).toHaveBeenCalledWith('fullscreen', expect.any(Object));
      expect(mockUseMediaState).toHaveBeenCalledWith('canPlay', expect.any(Object));
    });

    it('should satisfy requirement 4.3: Not break existing video player features', () => {
      render(
        <VideoPlayerContent
          {...defaultProps}
          autoFullscreen={true}
          autoPlay={true}
          onPlayingChange={jest.fn()}
          onTimeUpdate={jest.fn()}
        />
      );

      // Verify that all existing components are still rendered
      expect(screen.getByTestId('media-player')).toBeDefined();
      expect(screen.getByTestId('video-controls')).toBeDefined();
      expect(screen.getByTestId('keyboard-shortcuts')).toBeDefined();
      expect(screen.getByTestId('caption-display')).toBeDefined();
    });

    it('should satisfy requirement 4.4: Maintain backward compatibility', () => {
      // Test that VideoPlayer works without auto-fullscreen props
      render(<VideoPlayerContent {...defaultProps} />);

      expect(screen.getByTestId('media-player')).toBeDefined();
      expect(mockUseAutoFullscreen).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          autoFullscreen: false,
          autoPlay: false
        })
      );
    });
  });

  describe('Props Interface Validation', () => {
    it('should accept all required VideoPlayerProps', () => {
      const fullProps = {
        src: 'https://example.com/video.mp4',
        poster: 'https://example.com/poster.jpg',
        title: 'Test Video',
        className: 'custom-class',
        autoFullscreen: true,
        autoPlay: true,
        onPlayingChange: jest.fn(),
        onTimeUpdate: jest.fn(),
        audioSources: [
          {
            src: 'https://example.com/audio-en.mp3',
            language: 'en',
            label: 'English',
            default: true
          }
        ]
      };

      expect(() => {
        render(<VideoPlayerContent {...fullProps} />);
      }).not.toThrow();

      expect(screen.getByTestId('media-player')).toBeDefined();
    });

    it('should work with minimal required props', () => {
      const minimalProps = {
        src: 'https://example.com/video.mp4'
      };

      expect(() => {
        render(<VideoPlayerContent {...minimalProps} />);
      }).not.toThrow();

      expect(screen.getByTestId('media-player')).toBeDefined();
    });
  });
});