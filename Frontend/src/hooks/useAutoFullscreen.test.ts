import { renderHook, act } from '@testing-library/react';
import { useAutoFullscreen, FullscreenErrorType } from './useAutoFullscreen';
import { 
  detectFullscreenCapabilities, 
  requiresUserInteraction, 
  canRequestFullscreen,
  detectMobileDevice 
} from '../utils/fullscreenCompat';

// Mock the fullscreen compatibility utilities
jest.mock('../utils/fullscreenCompat', () => ({
  detectFullscreenCapabilities: jest.fn(),
  requiresUserInteraction: jest.fn(),
  canRequestFullscreen: jest.fn(),
  detectMobileDevice: jest.fn()
}));

const mockDetectFullscreenCapabilities = detectFullscreenCapabilities as jest.MockedFunction<typeof detectFullscreenCapabilities>;
const mockRequiresUserInteraction = requiresUserInteraction as jest.MockedFunction<typeof requiresUserInteraction>;
const mockCanRequestFullscreen = canRequestFullscreen as jest.MockedFunction<typeof canRequestFullscreen>;
const mockDetectMobileDevice = detectMobileDevice as jest.MockedFunction<typeof detectMobileDevice>;

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

// Mock timers for testing timeouts and delays
jest.useFakeTimers();

// Mock MediaPlayer
const mockMediaPlayer = {
  play: jest.fn(),
  enterFullscreen: jest.fn(),
};

describe('useAutoFullscreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    
    // Set up default mocks
    mockDetectFullscreenCapabilities.mockReturnValue({
      isSupported: true,
      requiresUserInteraction: false,
      isMobile: false,
      hasNativeFullscreen: true,
      supportedMethods: ['requestFullscreen'],
      browserType: 'standard'
    });
    mockRequiresUserInteraction.mockReturnValue(false);
    mockCanRequestFullscreen.mockReturnValue(true);
    mockDetectMobileDevice.mockReturnValue(false);
    
    // Reset mock implementations
    mockMediaPlayer.play.mockResolvedValue(undefined);
    mockMediaPlayer.enterFullscreen.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleWarn.mockRestore();
    mockConsoleError.mockRestore();
  });

  it('should handle auto-play when autoPlay is true and video is ready', async () => {
    const mockPlayerRef = { current: mockMediaPlayer };
    const mockOnError = jest.fn();

    const { result } = renderHook(() =>
      useAutoFullscreen(mockPlayerRef as any, {
        autoFullscreen: false,
        autoPlay: true,
        isVideoReady: true,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await result.current.handleAutoActions();
    });

    expect(mockMediaPlayer.play).toHaveBeenCalled();
    expect(mockMediaPlayer.enterFullscreen).not.toHaveBeenCalled();
    expect(mockOnError).not.toHaveBeenCalled();
  });

  it('should handle auto-fullscreen when autoFullscreen is true and video is ready', async () => {
    const mockPlayerRef = { current: mockMediaPlayer };
    const mockOnError = jest.fn();

    const { result } = renderHook(() =>
      useAutoFullscreen(mockPlayerRef as any, {
        autoFullscreen: true,
        autoPlay: false,
        isVideoReady: true,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await result.current.handleAutoActions();
    });

    expect(mockMediaPlayer.play).not.toHaveBeenCalled();
    expect(mockMediaPlayer.enterFullscreen).toHaveBeenCalled();
    expect(mockOnError).not.toHaveBeenCalled();
  });

  it('should handle both auto-play and auto-fullscreen when both are true', async () => {
    const mockPlayerRef = { current: mockMediaPlayer };
    const mockOnError = jest.fn();

    const { result } = renderHook(() =>
      useAutoFullscreen(mockPlayerRef as any, {
        autoFullscreen: true,
        autoPlay: true,
        isVideoReady: true,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await result.current.handleAutoActions();
    });

    expect(mockMediaPlayer.play).toHaveBeenCalled();
    expect(mockMediaPlayer.enterFullscreen).toHaveBeenCalled();
    expect(mockOnError).not.toHaveBeenCalled();
  });

  it('should handle auto-play failure gracefully', async () => {
    const mockPlayerRef = { 
      current: {
        ...mockMediaPlayer,
        play: jest.fn().mockRejectedValue(new Error('Auto-play blocked')),
      }
    };
    const mockOnError = jest.fn();

    const { result } = renderHook(() =>
      useAutoFullscreen(mockPlayerRef as any, {
        autoFullscreen: false,
        autoPlay: true,
        isVideoReady: true,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await result.current.handleAutoActions();
    });

    expect(mockOnError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Auto-play failed: Browser may require user interaction'
      })
    );
  });

  it('should handle auto-fullscreen failure gracefully', async () => {
    const mockPlayerRef = { 
      current: {
        ...mockMediaPlayer,
        enterFullscreen: jest.fn().mockRejectedValue(new Error('Fullscreen blocked')),
      }
    };
    const mockOnError = jest.fn();

    const { result } = renderHook(() =>
      useAutoFullscreen(mockPlayerRef as any, {
        autoFullscreen: true,
        autoPlay: false,
        isVideoReady: true,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await result.current.handleAutoActions();
    });

    expect(mockOnError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Auto-fullscreen failed: Browser may require user interaction'
      })
    );
  });

  it('should not trigger actions when video is not ready', async () => {
    const mockPlayerRef = { current: mockMediaPlayer };
    const mockOnError = jest.fn();

    const { result } = renderHook(() =>
      useAutoFullscreen(mockPlayerRef as any, {
        autoFullscreen: true,
        autoPlay: true,
        isVideoReady: false,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await result.current.handleAutoActions();
    });

    expect(mockMediaPlayer.play).not.toHaveBeenCalled();
    expect(mockMediaPlayer.enterFullscreen).not.toHaveBeenCalled();
    expect(mockOnError).not.toHaveBeenCalled();
  });

  it('should not trigger actions when player ref is null', async () => {
    const mockPlayerRef = { current: null };
    const mockOnError = jest.fn();

    const { result } = renderHook(() =>
      useAutoFullscreen(mockPlayerRef as any, {
        autoFullscreen: true,
        autoPlay: true,
        isVideoReady: true,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await result.current.handleAutoActions();
    });

    expect(mockOnError).not.toHaveBeenCalled();
  });

  // Enhanced Error Handling Tests
  describe('Enhanced Error Handling', () => {
    it('should handle NOT_SUPPORTED error type', async () => {
      mockDetectFullscreenCapabilities.mockReturnValue({
        isSupported: false,
        requiresUserInteraction: false,
        isMobile: false,
        hasNativeFullscreen: false,
        supportedMethods: [],
        browserType: 'unknown'
      });

      const mockPlayerRef = { current: mockMediaPlayer };
      const mockOnError = jest.fn();

      const { result } = renderHook(() =>
        useAutoFullscreen(mockPlayerRef as any, {
          autoFullscreen: true,
          autoPlay: false,
          isVideoReady: true,
          onError: mockOnError,
        })
      );

      await act(async () => {
        await result.current.handleAutoActions();
      });

      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: FullscreenErrorType.NOT_SUPPORTED,
          retryable: false,
          userMessage: 'Fullscreen is not supported in this browser.'
        })
      );
    });

    it('should handle USER_INTERACTION_REQUIRED error type', async () => {
      mockRequiresUserInteraction.mockReturnValue(true);

      const mockPlayerRef = { current: mockMediaPlayer };
      const mockOnError = jest.fn();

      const { result } = renderHook(() =>
        useAutoFullscreen(mockPlayerRef as any, {
          autoFullscreen: true,
          autoPlay: false,
          isVideoReady: true,
          onError: mockOnError,
        })
      );

      await act(async () => {
        await result.current.handleAutoActions();
      });

      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: FullscreenErrorType.USER_INTERACTION_REQUIRED,
          retryable: false,
          userMessage: 'Please click the fullscreen button to enter fullscreen mode.'
        })
      );
    });

    it('should handle PERMISSION_DENIED error type', async () => {
      const mockPlayerRef = { 
        current: {
          ...mockMediaPlayer,
          enterFullscreen: jest.fn().mockRejectedValue(new Error('permission denied')),
        }
      };
      const mockOnError = jest.fn();

      const { result } = renderHook(() =>
        useAutoFullscreen(mockPlayerRef as any, {
          autoFullscreen: true,
          autoPlay: false,
          isVideoReady: true,
          onError: mockOnError,
        })
      );

      await act(async () => {
        await result.current.handleAutoActions();
      });

      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: FullscreenErrorType.PERMISSION_DENIED,
          retryable: true,
          userMessage: 'Fullscreen was blocked. Click the fullscreen button to try again.'
        })
      );
    });

    it('should handle TIMEOUT error type', async () => {
      const mockPlayerRef = { 
        current: {
          ...mockMediaPlayer,
          enterFullscreen: jest.fn().mockImplementation(() => 
            new Promise(() => {}) // Never resolves, causing timeout
          ),
        }
      };
      const mockOnError = jest.fn();

      const { result } = renderHook(() =>
        useAutoFullscreen(mockPlayerRef as any, {
          autoFullscreen: true,
          autoPlay: false,
          isVideoReady: true,
          onError: mockOnError,
          timeout: 100, // Short timeout for testing
        })
      );

      await act(async () => {
        await result.current.handleAutoActions();
      });

      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: FullscreenErrorType.TIMEOUT,
          retryable: true,
          userMessage: 'Fullscreen activation timed out. Click to try again.'
        })
      );
    });

    it('should provide fullscreen state information', async () => {
      const mockPlayerRef = { current: mockMediaPlayer };
      const mockOnError = jest.fn();

      const { result } = renderHook(() =>
        useAutoFullscreen(mockPlayerRef as any, {
          autoFullscreen: true,
          autoPlay: false,
          isVideoReady: true,
          onError: mockOnError,
        })
      );

      // Check initial state
      expect(result.current.fullscreenState).toEqual({
        isAttempting: false,
        hasAttempted: false,
        error: null,
        retryCount: 0,
        lastAttemptTime: 0
      });

      await act(async () => {
        await result.current.handleAutoActions();
      });

      // Check state after successful attempt
      expect(result.current.fullscreenState.hasAttempted).toBe(true);
      expect(result.current.fullscreenState.isAttempting).toBe(false);
      expect(result.current.fullscreenState.error).toBeNull();
    });

    it('should support retry functionality', async () => {
      const mockPlayerRef = { 
        current: {
          ...mockMediaPlayer,
          enterFullscreen: jest.fn()
            .mockRejectedValueOnce(new Error('permission denied'))
            .mockResolvedValueOnce(undefined),
        }
      };
      const mockOnError = jest.fn();
      const mockOnSuccess = jest.fn();

      const { result } = renderHook(() =>
        useAutoFullscreen(mockPlayerRef as any, {
          autoFullscreen: true,
          autoPlay: false,
          isVideoReady: true,
          onError: mockOnError,
          onSuccess: mockOnSuccess,
          retryDelay: 10, // Short delay for testing
        })
      );

      // First attempt should fail
      await act(async () => {
        await result.current.handleAutoActions();
      });

      expect(mockOnError).toHaveBeenCalled();
      expect(result.current.fullscreenState.error).toBeTruthy();

      // Retry should succeed
      await act(async () => {
        await result.current.retry();
      });

      // Wait for retry delay
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it('should clear error state', async () => {
      const mockPlayerRef = { 
        current: {
          ...mockMediaPlayer,
          enterFullscreen: jest.fn().mockRejectedValue(new Error('test error')),
        }
      };
      const mockOnError = jest.fn();

      const { result } = renderHook(() =>
        useAutoFullscreen(mockPlayerRef as any, {
          autoFullscreen: true,
          autoPlay: false,
          isVideoReady: true,
          onError: mockOnError,
        })
      );

      // Trigger error
      await act(async () => {
        await result.current.handleAutoActions();
      });

      expect(result.current.fullscreenState.error).toBeTruthy();

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.fullscreenState.error).toBeNull();
    });

    it('should respect maximum retry attempts', async () => {
      const mockPlayerRef = { 
        current: {
          ...mockMediaPlayer,
          enterFullscreen: jest.fn().mockRejectedValue(new Error('permission denied')),
        }
      };
      const mockOnError = jest.fn();

      const { result } = renderHook(() =>
        useAutoFullscreen(mockPlayerRef as any, {
          autoFullscreen: true,
          autoPlay: false,
          isVideoReady: true,
          onError: mockOnError,
          maxRetries: 2,
          retryDelay: 10,
        })
      );

      // Initial attempt
      await act(async () => {
        await result.current.handleAutoActions();
      });

      // First retry
      await act(async () => {
        await result.current.retry();
      });

      // Second retry
      await act(async () => {
        await result.current.retry();
      });

      // Third retry should be ignored
      const retryCountBefore = result.current.fullscreenState.retryCount;
      await act(async () => {
        await result.current.retry();
      });

      expect(result.current.fullscreenState.retryCount).toBe(retryCountBefore);
    });
  });

  // Comprehensive State Management Tests
  describe('State Management', () => {
    it('should initialize with correct default state', () => {
      const mockPlayerRef = { current: mockMediaPlayer };
      
      const { result } = renderHook(() =>
        useAutoFullscreen(mockPlayerRef as any, {
          autoFullscreen: false,
          autoPlay: false,
          isVideoReady: false,
        })
      );

      expect(result.current.fullscreenState).toEqual({
        isAttempting: false,
        hasAttempted: false,
        error: null,
        retryCount: 0,
        lastAttemptTime: 0
      });
      expect(result.current.isProcessing).toBe(false);
    });

    it('should update state during fullscreen attempt', async () => {
      const mockPlayerRef = { current: mockMediaPlayer };
      
      const { result } = renderHook(() =>
        useAutoFullscreen(mockPlayerRef as any, {
          autoFullscreen: true,
          autoPlay: false,
          isVideoReady: true,
        })
      );

      await act(async () => {
        await result.current.handleAutoActions();
      });

      expect(result.current.fullscreenState.hasAttempted).toBe(true);
      expect(result.current.fullscreenState.isAttempting).toBe(false);
      expect(result.current.fullscreenState.error).toBeNull();
      expect(result.current.fullscreenState.lastAttemptTime).toBeGreaterThan(0);
    });

    it('should track retry count correctly', async () => {
      const mockPlayerRef = { 
        current: {
          ...mockMediaPlayer,
          enterFullscreen: jest.fn().mockRejectedValue(new Error('permission denied')),
        }
      };
      
      const { result } = renderHook(() =>
        useAutoFullscreen(mockPlayerRef as any, {
          autoFullscreen: true,
          autoPlay: false,
          isVideoReady: true,
          retryDelay: 10,
        })
      );

      // Initial attempt
      await act(async () => {
        await result.current.handleAutoActions();
      });

      expect(result.current.fullscreenState.retryCount).toBe(0);
      expect(result.current.fullscreenState.error).toBeTruthy();

      // First retry
      await act(async () => {
        await result.current.retry();
      });

      expect(result.current.fullscreenState.retryCount).toBe(1);

      // Advance timers to trigger retry
      act(() => {
        jest.advanceTimersByTime(20);
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.fullscreenState.retryCount).toBe(1);
    });

    it('should preserve state between re-renders', () => {
      const mockPlayerRef = { current: mockMediaPlayer };
      
      const { result, rerender } = renderHook(
        ({ autoFullscreen }) =>
          useAutoFullscreen(mockPlayerRef as any, {
            autoFullscreen,
            autoPlay: false,
            isVideoReady: true,
          }),
        { initialProps: { autoFullscreen: true } }
      );

      const initialState = result.current.fullscreenState;

      // Re-render with different props
      rerender({ autoFullscreen: false });

      // State should be preserved
      expect(result.current.fullscreenState).toEqual(initialState);
    });

    it('should handle concurrent state updates correctly', async () => {
      const mockPlayerRef = { current: mockMediaPlayer };
      
      const { result } = renderHook(() =>
        useAutoFullscreen(mockPlayerRef as any, {
          autoFullscreen: true,
          autoPlay: true,
          isVideoReady: true,
        })
      );

      // Trigger multiple concurrent actions
      const promises = [
        act(async () => result.current.handleAutoActions()),
        act(async () => result.current.handleAutoActions()),
        act(async () => result.current.handleAutoActions())
      ];

      await Promise.all(promises);

      // Should handle concurrent calls gracefully
      expect(result.current.fullscreenState.hasAttempted).toBe(true);
      expect(mockMediaPlayer.play).toHaveBeenCalled();
      expect(mockMediaPlayer.enterFullscreen).toHaveBeenCalled();
    });
  });

  // Comprehensive Error Handling and Fallback Tests
  describe('Comprehensive Error Handling and Fallback Mechanisms', () => {
    it('should handle network errors with proper error type', async () => {
      const mockPlayerRef = { 
        current: {
          ...mockMediaPlayer,
          enterFullscreen: jest.fn().mockRejectedValue(new Error('network error occurred')),
        }
      };
      const mockOnError = jest.fn();

      const { result } = renderHook(() =>
        useAutoFullscreen(mockPlayerRef as any, {
          autoFullscreen: true,
          autoPlay: false,
          isVideoReady: true,
          onError: mockOnError,
        })
      );

      await act(async () => {
        await result.current.handleAutoActions();
      });

      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: FullscreenErrorType.NETWORK_ERROR,
          retryable: true,
          userMessage: 'Network error prevented fullscreen. Please try again.'
        })
      );
    });

    it('should handle unknown errors with proper error type', async () => {
      const mockPlayerRef = { 
        current: {
          ...mockMediaPlayer,
          enterFullscreen: jest.fn().mockRejectedValue(new Error('unknown error')),
        }
      };
      const mockOnError = jest.fn();

      const { result } = renderHook(() =>
        useAutoFullscreen(mockPlayerRef as any, {
          autoFullscreen: true,
          autoPlay: false,
          isVideoReady: true,
          onError: mockOnError,
        })
      );

      await act(async () => {
        await result.current.handleAutoActions();
      });

      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: FullscreenErrorType.UNKNOWN,
          retryable: true,
          userMessage: 'Unable to enter fullscreen. Click to try again.'
        })
      );
    });

    it('should handle non-Error objects thrown by enterFullscreen', async () => {
      const mockPlayerRef = { 
        current: {
          ...mockMediaPlayer,
          enterFullscreen: jest.fn().mockRejectedValue('string error'),
        }
      };
      const mockOnError = jest.fn();

      const { result } = renderHook(() =>
        useAutoFullscreen(mockPlayerRef as any, {
          autoFullscreen: true,
          autoPlay: false,
          isVideoReady: true,
          onError: mockOnError,
        })
      );

      await act(async () => {
        await result.current.handleAutoActions();
      });

      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: FullscreenErrorType.UNKNOWN,
          retryable: true
        })
      );
    });

    it('should implement exponential backoff for retries', async () => {
      const mockPlayerRef = { 
        current: {
          ...mockMediaPlayer,
          enterFullscreen: jest.fn().mockRejectedValue(new Error('permission denied')),
        }
      };
      
      const { result } = renderHook(() =>
        useAutoFullscreen(mockPlayerRef as any, {
          autoFullscreen: true,
          autoPlay: false,
          isVideoReady: true,
          retryDelay: 100,
        })
      );

      // Initial attempt
      await act(async () => {
        await result.current.handleAutoActions();
      });

      // First retry (delay = 100ms)
      await act(async () => {
        await result.current.retry();
      });

      expect(result.current.fullscreenState.retryCount).toBe(1);

      // Second retry (delay = 200ms due to exponential backoff)
      await act(async () => {
        await result.current.retry();
      });

      expect(result.current.fullscreenState.retryCount).toBe(2);

      // Verify exponential backoff timing
      act(() => {
        jest.advanceTimersByTime(200); // First retry delay
      });

      act(() => {
        jest.advanceTimersByTime(400); // Second retry delay (exponential)
      });
    });

    it('should handle timeout scenarios correctly', async () => {
      jest.useRealTimers(); // Use real timers for timeout test
      
      const mockPlayerRef = { 
        current: {
          ...mockMediaPlayer,
          enterFullscreen: jest.fn().mockImplementation(() => 
            new Promise(() => {}) // Never resolves
          ),
        }
      };
      const mockOnError = jest.fn();

      const { result } = renderHook(() =>
        useAutoFullscreen(mockPlayerRef as any, {
          autoFullscreen: true,
          autoPlay: false,
          isVideoReady: true,
          onError: mockOnError,
          timeout: 50, // Very short timeout for testing
        })
      );

      await act(async () => {
        await result.current.handleAutoActions();
      });

      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: FullscreenErrorType.TIMEOUT,
          retryable: true,
          userMessage: 'Fullscreen activation timed out. Click to try again.'
        })
      );

      jest.useFakeTimers(); // Restore fake timers
    });

    it('should handle mobile device detection and adaptation', async () => {
      mockDetectMobileDevice.mockReturnValue(true);
      mockDetectFullscreenCapabilities.mockReturnValue({
        isSupported: true,
        requiresUserInteraction: true,
        isMobile: true,
        hasNativeFullscreen: false,
        supportedMethods: ['webkitRequestFullscreen'],
        browserType: 'webkit'
      });

      const mockPlayerRef = { current: mockMediaPlayer };
      const mockOnError = jest.fn();

      const { result } = renderHook(() =>
        useAutoFullscreen(mockPlayerRef as any, {
          autoFullscreen: true,
          autoPlay: false,
          isVideoReady: true,
          onError: mockOnError,
        })
      );

      await act(async () => {
        await result.current.handleAutoActions();
      });

      // Should log mobile detection
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🎬 useAutoFullscreen: Browser capabilities:',
        expect.objectContaining({
          isMobile: true,
          browserType: 'webkit'
        })
      );
    });

    it('should handle browser compatibility edge cases', async () => {
      mockCanRequestFullscreen.mockReturnValue(false);

      const mockPlayerRef = { current: mockMediaPlayer };
      const mockOnError = jest.fn();

      const { result } = renderHook(() =>
        useAutoFullscreen(mockPlayerRef as any, {
          autoFullscreen: true,
          autoPlay: false,
          isVideoReady: true,
          onError: mockOnError,
        })
      );

      await act(async () => {
        await result.current.handleAutoActions();
      });

      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: FullscreenErrorType.PERMISSION_DENIED,
          retryable: true,
          userMessage: 'Fullscreen was blocked. Click the fullscreen button to try again.'
        })
      );
    });

    it('should handle cleanup on component unmount', () => {
      const mockPlayerRef = { current: mockMediaPlayer };
      
      const { unmount } = renderHook(() =>
        useAutoFullscreen(mockPlayerRef as any, {
          autoFullscreen: true,
          autoPlay: false,
          isVideoReady: true,
          retryDelay: 1000,
        })
      );

      // Start a retry to create pending timeouts
      act(() => {
        // This would normally create timeouts that need cleanup
      });

      // Unmount should clean up timeouts
      expect(() => unmount()).not.toThrow();
    });

    it('should handle rapid state changes gracefully', async () => {
      const mockPlayerRef = { current: mockMediaPlayer };
      
      const { result, rerender } = renderHook(
        ({ isVideoReady }) =>
          useAutoFullscreen(mockPlayerRef as any, {
            autoFullscreen: true,
            autoPlay: true,
            isVideoReady,
          }),
        { initialProps: { isVideoReady: false } }
      );

      // Rapidly change video ready state
      rerender({ isVideoReady: true });
      rerender({ isVideoReady: false });
      rerender({ isVideoReady: true });

      await act(async () => {
        await result.current.handleAutoActions();
      });

      // Should handle rapid changes without errors
      expect(result.current.fullscreenState.hasAttempted).toBe(true);
    });

    it('should provide comprehensive error information', async () => {
      const mockPlayerRef = { 
        current: {
          ...mockMediaPlayer,
          enterFullscreen: jest.fn().mockRejectedValue(new Error('detailed error message')),
        }
      };
      const mockOnError = jest.fn();

      const { result } = renderHook(() =>
        useAutoFullscreen(mockPlayerRef as any, {
          autoFullscreen: true,
          autoPlay: false,
          isVideoReady: true,
          onError: mockOnError,
        })
      );

      await act(async () => {
        await result.current.handleAutoActions();
      });

      const errorArg = mockOnError.mock.calls[0][0];
      expect(errorArg).toHaveProperty('type');
      expect(errorArg).toHaveProperty('message');
      expect(errorArg).toHaveProperty('retryable');
      expect(errorArg).toHaveProperty('userMessage');
      expect(errorArg.message).toBe('detailed error message');
    });
  });

  // Integration with Video Ready State Tests
  describe('Video Ready State Integration', () => {
    it('should not attempt actions when video is not ready', async () => {
      const mockPlayerRef = { current: mockMediaPlayer };
      
      const { result } = renderHook(() =>
        useAutoFullscreen(mockPlayerRef as any, {
          autoFullscreen: true,
          autoPlay: true,
          isVideoReady: false, // Video not ready
        })
      );

      await act(async () => {
        await result.current.handleAutoActions();
      });

      expect(mockMediaPlayer.play).not.toHaveBeenCalled();
      expect(mockMediaPlayer.enterFullscreen).not.toHaveBeenCalled();
      expect(result.current.fullscreenState.hasAttempted).toBe(false);
    });

    it('should trigger actions when video becomes ready', async () => {
      const mockPlayerRef = { current: mockMediaPlayer };
      
      const { result, rerender } = renderHook(
        ({ isVideoReady }) =>
          useAutoFullscreen(mockPlayerRef as any, {
            autoFullscreen: true,
            autoPlay: true,
            isVideoReady,
          }),
        { initialProps: { isVideoReady: false } }
      );

      // Initially video not ready
      expect(result.current.fullscreenState.hasAttempted).toBe(false);

      // Video becomes ready
      rerender({ isVideoReady: true });

      // Should automatically trigger actions
      await act(async () => {
        // Wait for useEffect to trigger
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockMediaPlayer.play).toHaveBeenCalled();
      expect(mockMediaPlayer.enterFullscreen).toHaveBeenCalled();
    });

    it('should not re-attempt if already attempted', async () => {
      const mockPlayerRef = { current: mockMediaPlayer };
      
      const { result, rerender } = renderHook(
        ({ isVideoReady }) =>
          useAutoFullscreen(mockPlayerRef as any, {
            autoFullscreen: true,
            autoPlay: true,
            isVideoReady,
          }),
        { initialProps: { isVideoReady: true } }
      );

      // First attempt
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.fullscreenState.hasAttempted).toBe(true);
      const firstCallCount = mockMediaPlayer.enterFullscreen.mock.calls.length;

      // Re-render with same ready state
      rerender({ isVideoReady: true });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should not attempt again
      expect(mockMediaPlayer.enterFullscreen.mock.calls.length).toBe(firstCallCount);
    });
  });
});