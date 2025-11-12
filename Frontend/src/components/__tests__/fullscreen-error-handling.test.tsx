import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { FullscreenErrorFeedback } from '../FullscreenErrorFeedback';
import { FullscreenLoadingIndicator } from '../FullscreenLoadingIndicator';
import { FullscreenErrorBoundary } from '../FullscreenErrorBoundary';
import { FullscreenStateManager } from '../FullscreenStateManager';
import { FullscreenErrorType, FullscreenError, AutoFullscreenState } from '@/hooks/useAutoFullscreen';

// Mock the UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  )
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>
}));

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: any) => <div data-testid="progress" data-value={value} />
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  AlertCircle: () => <div data-testid="alert-icon" />,
  Maximize: () => <div data-testid="maximize-icon" />,
  RotateCcw: () => <div data-testid="rotate-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Shield: () => <div data-testid="shield-icon" />,
  Wifi: () => <div data-testid="wifi-icon" />,
  X: () => <div data-testid="x-icon" />,
  Info: () => <div data-testid="info-icon" />,
  ExternalLink: () => <div data-testid="external-link-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
  Monitor: () => <div data-testid="monitor-icon" />,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
  RefreshCw: () => <div data-testid="refresh-icon" />,
  Home: () => <div data-testid="home-icon" />
}));

describe('Fullscreen Error Handling Components', () => {
  describe('FullscreenErrorFeedback', () => {
    const mockError: FullscreenError = {
      name: 'FullscreenError',
      message: 'Test error',
      type: FullscreenErrorType.PERMISSION_DENIED,
      retryable: true,
      userMessage: 'Fullscreen was blocked. Click the fullscreen button to try again.'
    };

    it('renders error message correctly', () => {
      render(
        <FullscreenErrorFeedback
          error={mockError}
          retryCount={0}
          maxRetries={3}
        />
      );

      expect(screen.getByText('Fullscreen Unavailable')).toBeInTheDocument();
      expect(screen.getByText(/Fullscreen was blocked/)).toBeInTheDocument();
    });

    it('shows retry button for retryable errors', () => {
      const onRetry = jest.fn();
      render(
        <FullscreenErrorFeedback
          error={mockError}
          onRetry={onRetry}
          retryCount={1}
          maxRetries={3}
        />
      );

      const retryButton = screen.getByText(/Retry \(2 left\)/);
      expect(retryButton).toBeInTheDocument();
      
      fireEvent.click(retryButton);
      expect(onRetry).toHaveBeenCalled();
    });

    it('shows progress bar for retry attempts', () => {
      render(
        <FullscreenErrorFeedback
          error={mockError}
          retryCount={2}
          maxRetries={3}
        />
      );

      const progress = screen.getByTestId('progress');
      expect(progress).toHaveAttribute('data-value', '66.66666666666666');
    });

    it('shows troubleshooting tips when help is clicked', async () => {
      render(
        <FullscreenErrorFeedback
          error={mockError}
          retryCount={0}
          maxRetries={3}
        />
      );

      const helpButton = screen.getByText('Help');
      fireEvent.click(helpButton);

      await waitFor(() => {
        expect(screen.getByText('Troubleshooting Tips:')).toBeInTheDocument();
        expect(screen.getByText(/Try clicking the fullscreen button manually/)).toBeInTheDocument();
      });
    });

    it('handles different error types with appropriate icons', () => {
      const timeoutError: FullscreenError = {
        ...mockError,
        type: FullscreenErrorType.TIMEOUT
      };

      render(
        <FullscreenErrorFeedback
          error={timeoutError}
          retryCount={0}
          maxRetries={3}
        />
      );

      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    });

    it('disables retry button when max retries reached', () => {
      render(
        <FullscreenErrorFeedback
          error={mockError}
          onRetry={jest.fn()}
          retryCount={3}
          maxRetries={3}
        />
      );

      expect(screen.getByText('Maximum retry attempts reached')).toBeInTheDocument();
    });
  });

  describe('FullscreenLoadingIndicator', () => {
    it('renders loading message', () => {
      render(
        <FullscreenLoadingIndicator
          isVisible={true}
          message="Testing loading..."
        />
      );

      expect(screen.getByText('Entering Fullscreen')).toBeInTheDocument();
      expect(screen.getByText('Testing loading...')).toBeInTheDocument();
    });

    it('shows timeout progress', async () => {
      const onTimeout = jest.fn();
      render(
        <FullscreenLoadingIndicator
          isVisible={true}
          timeout={1000}
          onTimeout={onTimeout}
        />
      );

      // Wait for timeout
      await waitFor(() => {
        expect(onTimeout).toHaveBeenCalled();
      }, { timeout: 1500 });
    });

    it('hides when not visible', () => {
      render(
        <FullscreenLoadingIndicator
          isVisible={false}
          message="Should not show"
        />
      );

      expect(screen.queryByText('Should not show')).not.toBeInTheDocument();
    });
  });

  describe('FullscreenErrorBoundary', () => {
    const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div>No error</div>;
    };

    it('catches and displays errors', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <FullscreenErrorBoundary>
          <ThrowError shouldThrow={true} />
        </FullscreenErrorBoundary>
      );

      expect(screen.getByText('Video Player Error')).toBeInTheDocument();
      expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('renders children when no error', () => {
      render(
        <FullscreenErrorBoundary>
          <ThrowError shouldThrow={false} />
        </FullscreenErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('provides retry functionality', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <FullscreenErrorBoundary maxRetries={2}>
          <ThrowError shouldThrow={true} />
        </FullscreenErrorBoundary>
      );

      const retryButton = screen.getByText(/Try Again \(2 left\)/);
      expect(retryButton).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('FullscreenStateManager', () => {
    const mockFullscreenState: AutoFullscreenState = {
      isAttempting: false,
      hasAttempted: false,
      error: null,
      retryCount: 0,
      lastAttemptTime: Date.now()
    };

    it('renders children normally when no error or loading', () => {
      render(
        <FullscreenStateManager fullscreenState={mockFullscreenState}>
          <div>Test content</div>
        </FullscreenStateManager>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('shows loading indicator when attempting fullscreen', () => {
      const loadingState: AutoFullscreenState = {
        ...mockFullscreenState,
        isAttempting: true
      };

      render(
        <FullscreenStateManager fullscreenState={loadingState}>
          <div>Test content</div>
        </FullscreenStateManager>
      );

      expect(screen.getByText('Entering Fullscreen')).toBeInTheDocument();
    });

    it('shows error feedback when error occurs', () => {
      const errorState: AutoFullscreenState = {
        ...mockFullscreenState,
        hasAttempted: true,
        error: {
          name: 'FullscreenError',
          message: 'Test error',
          type: FullscreenErrorType.TIMEOUT,
          retryable: true,
          userMessage: 'Test error message'
        }
      };

      render(
        <FullscreenStateManager 
          fullscreenState={errorState}
          showErrorFeedback={true}
        >
          <div>Test content</div>
        </FullscreenStateManager>
      );

      expect(screen.getByText('Fullscreen Unavailable')).toBeInTheDocument();
    });

    it('handles retry functionality', async () => {
      const onRetry = jest.fn().mockResolvedValue(undefined);
      const errorState: AutoFullscreenState = {
        ...mockFullscreenState,
        hasAttempted: true,
        error: {
          name: 'FullscreenError',
          message: 'Test error',
          type: FullscreenErrorType.NETWORK_ERROR,
          retryable: true,
          userMessage: 'Network error'
        }
      };

      render(
        <FullscreenStateManager 
          fullscreenState={errorState}
          onRetry={onRetry}
          showErrorFeedback={true}
        >
          <div>Test content</div>
        </FullscreenStateManager>
      );

      const retryButton = screen.getByText(/Try Again/);
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(onRetry).toHaveBeenCalled();
      });
    });
  });

  describe('Integration Tests', () => {
    it('handles complete error flow with retry and recovery', async () => {
      let attemptCount = 0;
      const onRetry = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 2) {
          throw new Error('Still failing');
        }
        return Promise.resolve();
      });

      const initialErrorState: AutoFullscreenState = {
        isAttempting: false,
        hasAttempted: true,
        error: {
          name: 'FullscreenError',
          message: 'Network error',
          type: FullscreenErrorType.NETWORK_ERROR,
          retryable: true,
          userMessage: 'Network error occurred'
        },
        retryCount: 0,
        lastAttemptTime: Date.now()
      };

      const { rerender } = render(
        <FullscreenStateManager 
          fullscreenState={initialErrorState}
          onRetry={onRetry}
          showErrorFeedback={true}
          maxRetries={3}
        >
          <div>Video Player</div>
        </FullscreenStateManager>
      );

      // Initial error state
      expect(screen.getByText('Fullscreen Unavailable')).toBeInTheDocument();
      
      // Click retry
      const retryButton = screen.getByText(/Try Again/);
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(onRetry).toHaveBeenCalledTimes(1);
      });

      // Simulate successful retry
      const successState: AutoFullscreenState = {
        ...initialErrorState,
        error: null,
        retryCount: 1
      };

      rerender(
        <FullscreenStateManager 
          fullscreenState={successState}
          onRetry={onRetry}
          showErrorFeedback={true}
          maxRetries={3}
        >
          <div>Video Player</div>
        </FullscreenStateManager>
      );

      // Error should be gone
      expect(screen.queryByText('Fullscreen Unavailable')).not.toBeInTheDocument();
      expect(screen.getByText('Video Player')).toBeInTheDocument();
    });
  });
});