import { useCallback, useEffect, useRef, useState } from 'react';
import { 
  detectFullscreenCapabilities, 
  requiresUserInteraction, 
  canRequestFullscreen,
  detectMobileDevice 
} from '../utils/fullscreenCompat';

// Enhanced error types for better error handling
export enum FullscreenErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NOT_SUPPORTED = 'NOT_SUPPORTED',
  USER_INTERACTION_REQUIRED = 'USER_INTERACTION_REQUIRED',
  TIMEOUT = 'TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN'
}

export interface FullscreenError extends Error {
  type: FullscreenErrorType;
  retryable: boolean;
  userMessage: string;
}

export interface AutoFullscreenState {
  isAttempting: boolean;
  hasAttempted: boolean;
  error: FullscreenError | null;
  retryCount: number;
  lastAttemptTime: number;
}

interface UseAutoFullscreenOptions {
  autoFullscreen: boolean;
  autoPlay: boolean;
  isVideoReady: boolean;
  onError?: (error: FullscreenError) => void;
  onSuccess?: () => void;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

interface UseAutoFullscreenReturn {
  handleAutoActions: () => Promise<void>;
  isProcessing: boolean;
  fullscreenState: AutoFullscreenState;
  retry: () => Promise<void>;
  clearError: () => void;
}

// Helper function to create typed fullscreen errors
function createFullscreenError(
  type: FullscreenErrorType,
  message: string,
  retryable: boolean = false
): FullscreenError {
  const error = new Error(message) as FullscreenError;
  error.type = type;
  error.retryable = retryable;
  
  // User-friendly messages for different error types
  switch (type) {
    case FullscreenErrorType.PERMISSION_DENIED:
      error.userMessage = 'Fullscreen was blocked. Click the fullscreen button to try again.';
      break;
    case FullscreenErrorType.NOT_SUPPORTED:
      error.userMessage = 'Fullscreen is not supported in this browser.';
      break;
    case FullscreenErrorType.USER_INTERACTION_REQUIRED:
      error.userMessage = 'Please click the fullscreen button to enter fullscreen mode.';
      break;
    case FullscreenErrorType.TIMEOUT:
      error.userMessage = 'Fullscreen activation timed out. Click to try again.';
      break;
    case FullscreenErrorType.NETWORK_ERROR:
      error.userMessage = 'Network error prevented fullscreen. Please try again.';
      break;
    default:
      error.userMessage = 'Unable to enter fullscreen. Click to try again.';
  }
  
  return error;
}

/**
 * Custom hook for managing automatic fullscreen and autoplay functionality
 * Enhanced with comprehensive error handling, retry mechanisms, and timeout support
 */
export function useAutoFullscreen(
  playerRef: React.RefObject<any>,
  options: UseAutoFullscreenOptions
): UseAutoFullscreenReturn {
  const { 
    autoFullscreen, 
    autoPlay, 
    isVideoReady, 
    onError, 
    onSuccess,
    maxRetries = 3,
    retryDelay = 2000,
    timeout = 5000
  } = options;
  
  const isProcessingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Enhanced state management for fullscreen operations
  const [fullscreenState, setFullscreenState] = useState<AutoFullscreenState>({
    isAttempting: false,
    hasAttempted: false,
    error: null,
    retryCount: 0,
    lastAttemptTime: 0
  });

  // Clear any existing timeouts
  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setFullscreenState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  // Enhanced fullscreen attempt with timeout and error handling
  const attemptFullscreen = useCallback(async (player: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Set timeout for fullscreen activation
      timeoutRef.current = setTimeout(() => {
        reject(createFullscreenError(
          FullscreenErrorType.TIMEOUT,
          'Fullscreen activation timed out',
          true
        ));
      }, timeout);

      // Attempt fullscreen
      player.enterFullscreen()
        .then(() => {
          clearTimeout(timeoutRef.current!);
          timeoutRef.current = null;
          resolve();
        })
        .catch((error: any) => {
          clearTimeout(timeoutRef.current!);
          timeoutRef.current = null;
          
          // Analyze the error and create appropriate typed error
          let fullscreenError: FullscreenError;
          
          if (error.message?.includes('user activation') || 
              error.message?.includes('user gesture') ||
              error.message?.includes('not allowed')) {
            fullscreenError = createFullscreenError(
              FullscreenErrorType.USER_INTERACTION_REQUIRED,
              'Fullscreen requires user interaction',
              false
            );
          } else if (error.message?.includes('permission') || 
                     error.message?.includes('denied')) {
            fullscreenError = createFullscreenError(
              FullscreenErrorType.PERMISSION_DENIED,
              'Fullscreen permission denied',
              true
            );
          } else if (error.message?.includes('network') || 
                     error.message?.includes('load')) {
            fullscreenError = createFullscreenError(
              FullscreenErrorType.NETWORK_ERROR,
              'Network error during fullscreen',
              true
            );
          } else {
            fullscreenError = createFullscreenError(
              FullscreenErrorType.UNKNOWN,
              error.message || 'Unknown fullscreen error',
              true
            );
          }
          
          reject(fullscreenError);
        });
    });
  }, [timeout]);

  // Enhanced auto actions with comprehensive error handling
  const handleAutoActions = useCallback(async (): Promise<void> => {
    if (!playerRef.current || isProcessingRef.current || !isVideoReady) {
      return;
    }

    isProcessingRef.current = true;
    
    // Update state to indicate attempt is starting
    setFullscreenState(prev => ({
      ...prev,
      isAttempting: autoFullscreen,
      hasAttempted: false,
      error: null,
      lastAttemptTime: Date.now()
    }));

    try {
      const player = playerRef.current;
      const capabilities = detectFullscreenCapabilities();
      const isMobile = detectMobileDevice();
      const needsUserInteraction = requiresUserInteraction();

      // Log browser capabilities for debugging
      console.log('🎬 useAutoFullscreen: Browser capabilities:', {
        fullscreenSupported: capabilities.isSupported,
        requiresUserInteraction: needsUserInteraction,
        isMobile,
        browserType: capabilities.browserType
      });

      // Auto-play if requested
      if (autoPlay) {
        console.log('🎬 useAutoFullscreen: Auto-playing video');
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
          await player.play();
        } catch (playError) {
          // Auto-play errors are less critical, just log them
          console.warn('useAutoFullscreen: Auto-play failed:', playError);
          // Continue with fullscreen attempt even if autoplay fails
        }
      }

      // Auto-fullscreen if requested
      if (autoFullscreen) {
        // Pre-flight checks
        if (!capabilities.isSupported) {
          const error = createFullscreenError(
            FullscreenErrorType.NOT_SUPPORTED,
            'Fullscreen not supported in this browser',
            false
          );
          throw error;
        }

        if (!canRequestFullscreen()) {
          const error = createFullscreenError(
            FullscreenErrorType.PERMISSION_DENIED,
            'Fullscreen not available in current browser context',
            true
          );
          throw error;
        }

        // Check if user interaction is required
        if (needsUserInteraction) {
          const error = createFullscreenError(
            FullscreenErrorType.USER_INTERACTION_REQUIRED,
            'Browser requires user interaction for fullscreen',
            false
          );
          throw error;
        }

        console.log('🎬 useAutoFullscreen: Auto-entering fullscreen');
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Attempt fullscreen with timeout
        await attemptFullscreen(player);
        
        // Success callback
        onSuccess?.();
        console.log('🎬 useAutoFullscreen: Successfully entered fullscreen');
      }

      // Update state on success
      setFullscreenState(prev => ({
        ...prev,
        isAttempting: false,
        hasAttempted: true,
        error: null
      }));

    } catch (error) {
      console.error('useAutoFullscreen: Error with auto-fullscreen:', error);
      
      const fullscreenError = error instanceof Error && 'type' in error 
        ? error as FullscreenError
        : createFullscreenError(
            FullscreenErrorType.UNKNOWN,
            error instanceof Error ? error.message : 'Unknown auto-fullscreen error',
            true
          );

      // Update state with error
      setFullscreenState(prev => ({
        ...prev,
        isAttempting: false,
        hasAttempted: true,
        error: fullscreenError
      }));

      // Notify parent component
      onError?.(fullscreenError);
      
    } finally {
      isProcessingRef.current = false;
      clearTimeouts();
    }
  }, [playerRef, autoFullscreen, autoPlay, isVideoReady, onError, onSuccess, attemptFullscreen, clearTimeouts]);

  // Retry mechanism with exponential backoff
  const retry = useCallback(async (): Promise<void> => {
    const { retryCount, error } = fullscreenState;
    
    // Check if retry is allowed
    if (retryCount >= maxRetries) {
      console.warn('useAutoFullscreen: Maximum retries exceeded');
      return;
    }
    
    if (error && !error.retryable) {
      console.warn('useAutoFullscreen: Error is not retryable');
      return;
    }

    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    // Calculate delay with exponential backoff
    const delay = retryDelay * Math.pow(2, retryCount);
    
    console.log(`🎬 useAutoFullscreen: Retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
    
    // Update retry count
    setFullscreenState(prev => ({
      ...prev,
      retryCount: prev.retryCount + 1,
      error: null
    }));

    // Schedule retry
    retryTimeoutRef.current = setTimeout(() => {
      handleAutoActions();
    }, delay);
    
  }, [fullscreenState, maxRetries, retryDelay, handleAutoActions]);

  // Trigger auto actions when video becomes ready
  useEffect(() => {
    if (isVideoReady && (autoFullscreen || autoPlay) && !fullscreenState.hasAttempted) {
      handleAutoActions();
    }
  }, [isVideoReady, autoFullscreen, autoPlay, handleAutoActions, fullscreenState.hasAttempted]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, [clearTimeouts]);

  return {
    handleAutoActions,
    isProcessing: isProcessingRef.current || fullscreenState.isAttempting,
    fullscreenState,
    retry,
    clearError
  };
}

export default useAutoFullscreen;