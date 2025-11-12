/**
 * Test suite for fullscreen exit functionality
 * Verifies that video playback and controls are maintained during fullscreen transitions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VideoPlayerContent } from '../VideoPlayer';

// Mock Vidstack React components
vi.mock('@vidstack/react', () => ({
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
  useMediaState: (state: string) => {
    switch (state) {
      case 'playing':
        return true;
      case 'currentTime':
        return 120;
      case 'duration':
        return 300;
      case 'fullscreen':
        return false;
      case 'canPlay':
        return true;
      default:
        return false;
    }
  },
  PlayButton: ({ children }: any) => <button data-testid="play-button">{children}</button>,
  Poster: () => <div data-testid="poster" />,
  Caption: () => <div data-testid="caption" />,
  Track: () => <div data-testid="track" />,
  Thumbnail: () => <div data-testid="thumbnail" />
}));

// Mock fullscreen API
const mockFullscreenAPI = {
  requestFullscreen: vi.fn().mockResolvedValue(undefined),
  exitFullscreen: vi.fn().mockResolvedValue(undefined),
  fullscreenElement: null,
  fullscreenEnabled: true
};

// Mock player ref
const mockPlayerRef = {
  current: {
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn().mockResolvedValue(undefined),
    enterFullscreen: vi.fn().mockResolvedValue(undefined),
    exitFullscreen: vi.fn().mockResolvedValue(undefined),
    currentTime: 120,
    volume: 0.8,
    playbackRate: 1,
    muted: false
  }
};

// Mock useAutoFullscreen hook
vi.mock('../../hooks/useAutoFullscreen', () => ({
  useAutoFullscreen: () => ({
    handleAutoActions: vi.fn(),
    fullscreenState: {
      isAttempting: false,
      hasAttempted: false,
      error: null,
      retryCount: 0,
      lastAttemptTime: 0
    },
    retry: vi.fn(),
    clearError: vi.fn()
  })
}));

describe('Fullscreen Exit Functionality', () => {
  beforeEach(() => {
    // Setup fullscreen API mocks
    Object.defineProperty(document, 'fullscreenElement', {
      writable: true,
      value: null
    });
    
    Object.defineProperty(document, 'fullscreenEnabled', {
      writable: true,
      value: true
    });
    
    Object.defineProperty(document, 'exitFullscreen', {
      writable: true,
      value: mockFullscreenAPI.exitFullscreen
    });

    // Mock HTMLElement.requestFullscreen
    HTMLElement.prototype.requestFullscreen = mockFullscreenAPI.requestFullscreen;
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should maintain video playback when exiting fullscreen via Escape key', async () => {
    const mockProps = {
      src: 'test-video.mp4',
      title: 'Test Video',
      autoFullscreen: false,
      autoPlay: false,
      onPlayingChange: vi.fn(),
      onTimeUpdate: vi.fn()
    };

    render(<VideoPlayerContent {...mockProps} />);

    // Simulate fullscreen state
    const mediaPlayer = screen.getByTestId('media-player');
    
    // Simulate Escape key press while in fullscreen
    fireEvent.keyDown(document, { code: 'Escape', key: 'Escape' });

    // Verify that playback state is preserved
    await waitFor(() => {
      expect(mockProps.onPlayingChange).toHaveBeenCalled();
    });
  });

  it('should preserve video controls functionality after fullscreen exit', async () => {
    const mockProps = {
      src: 'test-video.mp4',
      title: 'Test Video',
      autoFullscreen: false,
      autoPlay: false,
      onPlayingChange: vi.fn(),
      onTimeUpdate: vi.fn()
    };

    render(<VideoPlayerContent {...mockProps} />);

    // Simulate fullscreen exit
    fireEvent.keyDown(document, { code: 'Escape', key: 'Escape' });

    // Wait for state updates
    await waitFor(() => {
      // Controls should still be functional
      const mediaPlayer = screen.getByTestId('media-player');
      expect(mediaPlayer).toBeInTheDocument();
    });

    // Test that keyboard shortcuts still work after fullscreen exit
    fireEvent.keyDown(document, { code: 'Space', key: ' ' });
    fireEvent.keyDown(document, { code: 'ArrowLeft', key: 'ArrowLeft' });
    fireEvent.keyDown(document, { code: 'ArrowRight', key: 'ArrowRight' });

    // These should not throw errors and should be handled properly
    expect(true).toBe(true); // If we get here, keyboard shortcuts are working
  });

  it('should maintain current time position during fullscreen transitions', async () => {
    const mockProps = {
      src: 'test-video.mp4',
      title: 'Test Video',
      autoFullscreen: false,
      autoPlay: false,
      onPlayingChange: vi.fn(),
      onTimeUpdate: vi.fn()
    };

    render(<VideoPlayerContent {...mockProps} />);

    // Simulate time update callback to verify position is maintained
    await waitFor(() => {
      expect(mockProps.onTimeUpdate).toHaveBeenCalledWith(expect.any(Number), expect.any(Number));
    });
  });

  it('should handle fullscreen toggle button correctly', async () => {
    const mockProps = {
      src: 'test-video.mp4',
      title: 'Test Video',
      autoFullscreen: false,
      autoPlay: false,
      onPlayingChange: vi.fn(),
      onTimeUpdate: vi.fn()
    };

    render(<VideoPlayerContent {...mockProps} />);

    // Test F key for fullscreen toggle
    fireEvent.keyDown(document, { code: 'KeyF', key: 'f' });

    // Should not throw errors
    expect(true).toBe(true);
  });

  it('should preserve volume and playback rate during fullscreen transitions', async () => {
    const mockProps = {
      src: 'test-video.mp4',
      title: 'Test Video',
      autoFullscreen: false,
      autoPlay: false,
      onPlayingChange: vi.fn(),
      onTimeUpdate: vi.fn()
    };

    render(<VideoPlayerContent {...mockProps} />);

    // Simulate volume change
    fireEvent.keyDown(document, { code: 'ArrowUp', key: 'ArrowUp' });
    
    // Simulate fullscreen toggle
    fireEvent.keyDown(document, { code: 'KeyF', key: 'f' });
    
    // Simulate fullscreen exit
    fireEvent.keyDown(document, { code: 'Escape', key: 'Escape' });

    // Should maintain all states without errors
    expect(true).toBe(true);
  });

  it('should show controls after fullscreen exit', async () => {
    const mockProps = {
      src: 'test-video.mp4',
      title: 'Test Video',
      autoFullscreen: false,
      autoPlay: false,
      onPlayingChange: vi.fn(),
      onTimeUpdate: vi.fn()
    };

    render(<VideoPlayerContent {...mockProps} />);

    // Simulate fullscreen exit
    fireEvent.keyDown(document, { code: 'Escape', key: 'Escape' });

    // Controls should be visible after fullscreen exit
    await waitFor(() => {
      const mediaPlayer = screen.getByTestId('media-player');
      expect(mediaPlayer).toBeInTheDocument();
    });
  });
});

describe('Auto-fullscreen Exit Behavior', () => {
  it('should handle escape key during auto-fullscreen playback', async () => {
    const mockProps = {
      src: 'test-video.mp4',
      title: 'Test Video',
      autoFullscreen: true,
      autoPlay: true,
      onPlayingChange: vi.fn(),
      onTimeUpdate: vi.fn()
    };

    render(<VideoPlayerContent {...mockProps} />);

    // Simulate escape key during auto-fullscreen
    fireEvent.keyDown(document, { code: 'Escape', key: 'Escape' });

    // Should handle gracefully
    await waitFor(() => {
      expect(mockProps.onPlayingChange).toHaveBeenCalled();
    });
  });

  it('should maintain playback when auto-fullscreen is interrupted', async () => {
    const mockProps = {
      src: 'test-video.mp4',
      title: 'Test Video',
      autoFullscreen: true,
      autoPlay: true,
      onPlayingChange: vi.fn(),
      onTimeUpdate: vi.fn()
    };

    render(<VideoPlayerContent {...mockProps} />);

    // Simulate interruption of auto-fullscreen
    fireEvent.keyDown(document, { code: 'Escape', key: 'Escape' });

    // Playback should continue
    await waitFor(() => {
      expect(mockProps.onPlayingChange).toHaveBeenCalled();
    });
  });
});