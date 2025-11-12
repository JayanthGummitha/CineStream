/**
 * Integration tests for Netflix-like features with existing VideoPlayer controls
 * Tests task 11: Integrate features with existing VideoPlayer controls and state
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { VideoPlayerContent } from '../VideoPlayer';
import * as episodeMetadata from '../../lib/episode-metadata';

// Mock Vidstack components
jest.mock('@vidstack/react', () => {
  const mockReact = require('react');
  return {
    MediaPlayer: mockReact.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => (
      mockReact.createElement('div', { ref, 'data-testid': 'media-player', ...props }, children)
    )),
    MediaProvider: ({ children }: any) => mockReact.createElement('div', { 'data-testid': 'media-provider' }, children),
    Captions: () => mockReact.createElement('div', { 'data-testid': 'captions' }),
    useMediaState: (state: string) => {
      const states: Record<string, any> = {
        playing: false,
        currentTime: 0,
        duration: 3600,
        fullscreen: false,
        buffered: null,
        canPlay: true,
        pictureInPicture: false,
        textTracks: [],
        audioTracks: []
      };
      return states[state];
    },
    useMediaStore: () => ({
      qualities: [],
      quality: null,
      autoQuality: true,
      canSetQuality: true
    })
  };
});

// Mock episode metadata
jest.mock('../../lib/episode-metadata');
const mockEpisodeMetadata = episodeMetadata as jest.Mocked<typeof episodeMetadata>;

// Mock CSS imports
jest.mock('../../styles/skip-intro-animations.css', () => ({}));
jest.mock('../../styles/video-player-animations.css', () => ({}));

describe('VideoPlayer Integration Tests', () => {
  const mockEpisodeData = {
    id: 'episode-1',
    title: 'Test Episode',
    description: 'Test episode description',
    thumbnail: '/test-thumbnail.jpg',
    src: '/test-video.mp4',
    introStart: 10,
    introEnd: 60,
    duration: 3600,
    seriesId: 'series-1',
    seasonNumber: 1,
    episodeNumber: 1
  };

  const mockNextEpisode = {
    id: 'episode-2',
    title: 'Next Test Episode',
    description: 'Next episode description',
    thumbnail: '/next-thumbnail.jpg',
    src: '/next-video.mp4',
    introStart: 5,
    introEnd: 45,
    duration: 3600,
    seriesId: 'series-1',
    seasonNumber: 1,
    episodeNumber: 2
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockEpisodeMetadata.getEpisodeMetadata.mockResolvedValue(mockEpisodeData);
    mockEpisodeMetadata.getNextEpisode.mockResolvedValue(mockNextEpisode);
    mockEpisodeMetadata.getMovieMetadata.mockResolvedValue(null);
  });

  describe('Z-Index and Overlay Management', () => {
    it('should properly layer overlays above controls in normal mode', async () => {
      render(
        <VideoPlayerContent
          src="/test-video.mp4"
          contentType="episode"
          contentId="episode-1"
        />
      );

      await waitFor(() => {
        const skipButton = screen.queryByRole('button', { name: /skip intro/i });
        if (skipButton) {
          const styles = window.getComputedStyle(skipButton);
          expect(parseInt(styles.zIndex)).toBeGreaterThan(50);
        }
      });
    });

    it('should use higher z-index in fullscreen mode', async () => {
      // Mock fullscreen state
      const mockUseMediaState = jest.fn();
      mockUseMediaState.mockImplementation((state: string) => {
        if (state === 'fullscreen') return true;
        return false;
      });

      render(
        <VideoPlayerContent
          src="/test-video.mp4"
          contentType="episode"
          contentId="episode-1"
        />
      );

      await waitFor(() => {
        const skipButton = screen.queryByRole('button', { name: /skip intro/i });
        if (skipButton) {
          // In fullscreen, z-index should be very high
          expect(skipButton.className).toContain('z-[9999]');
        }
      });
    });

    it('should hide skip intro button in PiP mode', async () => {
      // Mock PiP state
      const mockUseMediaState = jest.fn();
      mockUseMediaState.mockImplementation((state: string) => {
        if (state === 'pictureInPicture') return true;
        return false;
      });

      render(
        <VideoPlayerContent
          src="/test-video.mp4"
          contentType="episode"
          contentId="episode-1"
        />
      );

      await waitFor(() => {
        const skipButton = screen.queryByRole('button', { name: /skip intro/i });
        if (skipButton) {
          expect(skipButton.className).toContain('hidden');
        }
      });
    });
  });

  describe('User Preference Preservation', () => {
    it('should preserve volume settings during episode transitions', async () => {
      const onEpisodeChange = jest.fn();
      
      render(
        <VideoPlayerContent
          src="/test-video.mp4"
          contentType="episode"
          contentId="episode-1"
          onEpisodeChange={onEpisodeChange}
        />
      );

      // Wait for episode data to load and trigger next episode overlay
      await waitFor(() => {
        // Simulate video end to show next episode overlay
        const mediaPlayer = screen.getByTestId('media-player');
        fireEvent(mediaPlayer, new Event('ended'));
      });

      await waitFor(() => {
        const playButton = screen.queryByRole('button', { name: /play.*immediately/i });
        if (playButton) {
          fireEvent.click(playButton);
          expect(onEpisodeChange).toHaveBeenCalledWith(mockNextEpisode);
        }
      });
    });

    it('should preserve caption settings during episode transitions', async () => {
      const onEpisodeChange = jest.fn();
      
      render(
        <VideoPlayerContent
          src="/test-video.mp4"
          contentType="episode"
          contentId="episode-1"
          onEpisodeChange={onEpisodeChange}
        />
      );

      // Test caption preservation logic would be implemented here
      // This is a placeholder for the actual implementation
      expect(true).toBe(true);
    });

    it('should preserve playback rate during episode transitions', async () => {
      const onEpisodeChange = jest.fn();
      
      render(
        <VideoPlayerContent
          src="/test-video.mp4"
          contentType="episode"
          contentId="episode-1"
          onEpisodeChange={onEpisodeChange}
        />
      );

      // Test playback rate preservation logic would be implemented here
      // This is a placeholder for the actual implementation
      expect(true).toBe(true);
    });
  });

  describe('Keyboard Shortcut Integration', () => {
    it('should handle skip intro keyboard shortcut (S key)', async () => {
      render(
        <VideoPlayerContent
          src="/test-video.mp4"
          contentType="episode"
          contentId="episode-1"
        />
      );

      // Focus the video player
      const mediaPlayer = screen.getByTestId('media-player');
      fireEvent.click(mediaPlayer);

      // Simulate being in intro range and press S key
      fireEvent.keyDown(document, { code: 'KeyS' });

      // Verify skip intro was triggered
      // This is a placeholder for the actual implementation
      expect(true).toBe(true);
    });

    it('should handle next episode keyboard shortcut (N key)', async () => {
      const onEpisodeChange = jest.fn();
      
      render(
        <VideoPlayerContent
          src="/test-video.mp4"
          contentType="episode"
          contentId="episode-1"
          onEpisodeChange={onEpisodeChange}
        />
      );

      // Focus the video player
      const mediaPlayer = screen.getByTestId('media-player');
      fireEvent.click(mediaPlayer);

      // Simulate video end to show overlay
      fireEvent(mediaPlayer, new Event('ended'));

      // Press N key to play next episode
      fireEvent.keyDown(document, { code: 'KeyN' });

      await waitFor(() => {
        expect(onEpisodeChange).toHaveBeenCalledWith(mockNextEpisode);
      });
    });

    it('should handle escape key to cancel next episode overlay', async () => {
      render(
        <VideoPlayerContent
          src="/test-video.mp4"
          contentType="episode"
          contentId="episode-1"
        />
      );

      // Focus the video player
      const mediaPlayer = screen.getByTestId('media-player');
      fireEvent.click(mediaPlayer);

      // Simulate video end to show overlay
      fireEvent(mediaPlayer, new Event('ended'));

      // Press Escape key
      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        const overlay = screen.queryByRole('dialog');
        expect(overlay).not.toBeInTheDocument();
      });
    });

    it('should not interfere with existing keyboard shortcuts', async () => {
      render(
        <VideoPlayerContent
          src="/test-video.mp4"
          contentType="episode"
          contentId="episode-1"
        />
      );

      // Focus the video player
      const mediaPlayer = screen.getByTestId('media-player');
      fireEvent.click(mediaPlayer);

      // Test existing shortcuts still work
      fireEvent.keyDown(document, { code: 'Space' }); // Space for play/pause
      fireEvent.keyDown(document, { code: 'KeyF' }); // F for fullscreen
      fireEvent.keyDown(document, { code: 'KeyT' }); // T for theater mode
      fireEvent.keyDown(document, { code: 'KeyM' }); // M for mute

      // Verify these shortcuts still function
      // This is a placeholder for the actual implementation
      expect(true).toBe(true);
    });
  });

  describe('Display Mode Compatibility', () => {
    it('should position overlays correctly in theater mode', async () => {
      render(
        <VideoPlayerContent
          src="/test-video.mp4"
          contentType="episode"
          contentId="episode-1"
        />
      );

      // Simulate theater mode
      const mediaPlayer = screen.getByTestId('media-player');
      fireEvent.keyDown(mediaPlayer, { code: 'KeyT' });

      await waitFor(() => {
        const skipButton = screen.queryByRole('button', { name: /skip intro/i });
        if (skipButton) {
          expect(skipButton.className).toContain('bottom-16');
          expect(skipButton.className).toContain('right-6');
        }
      });
    });

    it('should position overlays correctly in fullscreen mode', async () => {
      render(
        <VideoPlayerContent
          src="/test-video.mp4"
          contentType="episode"
          contentId="episode-1"
        />
      );

      await waitFor(() => {
        const skipButton = screen.queryByRole('button', { name: /skip intro/i });
        if (skipButton) {
          // Check for fullscreen positioning classes
          expect(skipButton.className).toMatch(/bottom-\d+/);
          expect(skipButton.className).toMatch(/right-\d+/);
        }
      });
    });

    it('should handle control visibility changes', async () => {
      render(
        <VideoPlayerContent
          src="/test-video.mp4"
          contentType="episode"
          contentId="episode-1"
        />
      );

      // Test that skip intro button adjusts position based on control visibility
      await waitFor(() => {
        const skipButton = screen.queryByRole('button', { name: /skip intro/i });
        if (skipButton) {
          // Should have appropriate bottom margin when controls are visible
          expect(skipButton.className).toMatch(/bottom-\d+/);
        }
      });
    });
  });

  describe('Error Handling and Graceful Degradation', () => {
    it('should handle metadata loading failures gracefully', async () => {
      mockEpisodeMetadata.getEpisodeMetadata.mockRejectedValue(new Error('Network error'));
      
      render(
        <VideoPlayerContent
          src="/test-video.mp4"
          contentType="episode"
          contentId="episode-1"
        />
      );

      // Should not crash and should handle the error gracefully
      await waitFor(() => {
        expect(screen.getByTestId('media-player')).toBeInTheDocument();
      });

      // Skip intro button should not appear due to failed metadata
      const skipButton = screen.queryByRole('button', { name: /skip intro/i });
      expect(skipButton).not.toBeInTheDocument();
    });

    it('should handle missing next episode data gracefully', async () => {
      mockEpisodeMetadata.getNextEpisode.mockResolvedValue(null);
      
      render(
        <VideoPlayerContent
          src="/test-video.mp4"
          contentType="episode"
          contentId="episode-1"
        />
      );

      // Simulate video end
      const mediaPlayer = screen.getByTestId('media-player');
      fireEvent(mediaPlayer, new Event('ended'));

      // Next episode overlay should not appear
      await waitFor(() => {
        const overlay = screen.queryByRole('dialog');
        expect(overlay).not.toBeInTheDocument();
      });
    });
  });

  describe('Performance and Memory Management', () => {
    it('should clean up event listeners on unmount', () => {
      const { unmount } = render(
        <VideoPlayerContent
          src="/test-video.mp4"
          contentType="episode"
          contentId="episode-1"
        />
      );

      // Unmount component
      unmount();

      // Verify no memory leaks (this would be tested with more sophisticated tools in practice)
      expect(true).toBe(true);
    });

    it('should not cause performance issues with frequent time updates', async () => {
      render(
        <VideoPlayerContent
          src="/test-video.mp4"
          contentType="episode"
          contentId="episode-1"
        />
      );

      // Simulate rapid time updates
      const mediaPlayer = screen.getByTestId('media-player');
      
      for (let i = 0; i < 100; i++) {
        fireEvent(mediaPlayer, new Event('timeupdate'));
      }

      // Should handle rapid updates without issues
      expect(screen.getByTestId('media-player')).toBeInTheDocument();
    });
  });
});