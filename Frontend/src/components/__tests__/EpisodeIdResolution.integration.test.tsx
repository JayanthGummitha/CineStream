/**
 * Integration tests for Episode ID Resolution in VideoPlayer
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { VideoPlayerContent } from '../VideoPlayer';
import { Episode } from '@/types';
import { EpisodeMetadata } from '@/lib/episode-metadata';

// Mock the episode metadata service
jest.mock('@/lib/episode-metadata', () => ({
  getEpisodeMetadata: jest.fn(),
  getNextEpisode: jest.fn(),
  getMovieMetadata: jest.fn()
}));

// Mock the episode validation utilities
jest.mock('@/utils/episode-validation', () => ({
  validateEpisodeNavigationProps: jest.fn(() => ({ isValid: true })),
  mapEpisodeToMetadata: jest.fn((episode, season, series) => ({
    id: episode.id,
    title: episode.title,
    description: episode.description,
    thumbnail: episode.thumbnail,
    src: episode.src,
    introStart: 0,
    introEnd: 45,
    duration: episode.duration,
    seriesId: series,
    seasonNumber: season,
    episodeNumber: episode.episodeNumber
  })),
  getNextEpisodeIndex: jest.fn((current, total) => current + 1 < total ? current + 1 : null)
}));

// Mock the error handling utilities
jest.mock('@/utils/episode-error-handling', () => ({
  validateEpisodeDataWithErrorHandling: jest.fn(() => ({ 
    isValid: true, 
    hasEpisodeData: true 
  })),
  retryWithBackoff: jest.fn((fn) => fn()),
  validateVideoSource: jest.fn((src) => ({ isValid: true, src })),
  handleEpisodeTransitionError: jest.fn(),
  getUserFriendlyErrorMessage: jest.fn(),
  createEpisodeError: jest.fn(),
  EpisodeNavigationLogger: {
    getInstance: jest.fn(() => ({
      log: jest.fn()
    }))
  }
}));

// Mock Vidstack components
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
  Poster: (props: any) => <div data-testid="poster" {...props} />,
  useMediaState: jest.fn(() => false),
  useMediaStore: jest.fn(() => ({}))
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

jest.mock('../SkipIntroButton', () => ({
  SkipIntroButton: () => <div data-testid="skip-intro" />
}));

jest.mock('../NextEpisodeButton', () => ({
  NextEpisodeButton: ({ onPlayNext }: any) => (
    <button 
      data-testid="next-episode-button" 
      onClick={() => onPlayNext && onPlayNext({
        id: 'episode-3',
        title: 'Episode 3: Revelations',
        description: 'Shocking truths revealed',
        thumbnail: '/thumbnails/episode-3.jpg',
        src: '/videos/episode-3.mp4',
        introStart: 0,
        introEnd: 38,
        duration: 2580,
        seriesId: 'series-1',
        seasonNumber: 1,
        episodeNumber: 3
      })}
    >
      Next Episode
    </button>
  )
}));

describe('Episode ID Resolution Integration', () => {
  const mockEpisodeList: Episode[] = [
    {
      id: '157239-s1-e1',
      title: 'Episode 1: Pilot',
      description: 'The beginning',
      episodeNumber: 1,
      duration: 45,
      thumbnail: '/thumb1.jpg',
      releaseDate: '2024-01-01',
      src: '/video1.mp4'
    },
    {
      id: '157239-s1-e2',
      title: 'Episode 2: Discovery',
      description: 'New worlds',
      episodeNumber: 2,
      duration: 44,
      thumbnail: '/thumb2.jpg',
      releaseDate: '2024-01-08',
      src: '/video2.mp4'
    },
    {
      id: '157239-s1-e3',
      title: 'Episode 3: Revelations',
      description: 'Shocking truths',
      episodeNumber: 3,
      duration: 43,
      thumbnail: '/thumb3.jpg',
      releaseDate: '2024-01-15',
      src: '/video3.mp4'
    }
  ];

  const defaultProps = {
    src: 'https://files.vidstack.io/sprite-fight/1080p.mp4',
    poster: '/poster.jpg',
    title: 'Episode 2: Discovery',
    contentType: 'episode' as const,
    contentId: 'episode-2',
    seriesId: 'series-1',
    episodes: mockEpisodeList,
    currentEpisodeIndex: 1,
    seasonNumber: 1
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console methods to avoid test noise
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should resolve episode ID mismatch when navigating to next episode', async () => {
    const mockOnEpisodeChange = jest.fn();
    
    render(
      <VideoPlayerContent
        {...defaultProps}
        onEpisodeChange={mockOnEpisodeChange}
      />
    );

    // Wait for component to initialize
    await waitFor(() => {
      expect(screen.getByTestId('media-player')).toBeInTheDocument();
    });

    // Find and click the next episode button
    const nextEpisodeButton = screen.getByTestId('next-episode-button');
    expect(nextEpisodeButton).toBeInTheDocument();

    // Click next episode - this will trigger handlePlayNextEpisode with metadata format ID
    nextEpisodeButton.click();

    // Wait for episode change to be processed
    await waitFor(() => {
      expect(mockOnEpisodeChange).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Verify that the episode change callback was called with resolved episode data
    expect(mockOnEpisodeChange).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'episode-3', // Original metadata service ID
        title: 'Episode 3: Revelations',
        episodeNumber: 3
      })
    );
  });

  it('should handle episode list with TMDB format IDs and metadata service navigation', async () => {
    const { getNextEpisode } = require('@/lib/episode-metadata');
    
    // Mock metadata service to return episode with metadata format ID
    getNextEpisode.mockResolvedValue({
      id: 'episode-3',
      title: 'Episode 3: Revelations',
      description: 'Shocking truths revealed',
      thumbnail: '/thumbnails/episode-3.jpg',
      src: '/videos/episode-3.mp4',
      introStart: 0,
      introEnd: 38,
      duration: 2580,
      seriesId: 'series-1',
      seasonNumber: 1,
      episodeNumber: 3
    });

    const mockOnEpisodeChange = jest.fn();
    
    render(
      <VideoPlayerContent
        {...defaultProps}
        onEpisodeChange={mockOnEpisodeChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('media-player')).toBeInTheDocument();
    });

    // Simulate next episode navigation
    const nextEpisodeButton = screen.getByTestId('next-episode-button');
    nextEpisodeButton.click();

    await waitFor(() => {
      expect(mockOnEpisodeChange).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Verify that ID resolution worked and episode was found in the list
    expect(mockOnEpisodeChange).toHaveBeenCalledWith(
      expect.objectContaining({
        episodeNumber: 3
      })
    );
  });

  it('should fall back to metadata service when episode not found in props', async () => {
    const { getNextEpisode } = require('@/lib/episode-metadata');
    
    // Mock metadata service for fallback
    getNextEpisode.mockResolvedValue({
      id: 'episode-99', // Episode not in our mock list
      title: 'Episode 99: Special',
      description: 'Special episode',
      thumbnail: '/thumbnails/episode-99.jpg',
      src: '/videos/episode-99.mp4',
      introStart: 0,
      introEnd: 30,
      duration: 3000,
      seriesId: 'series-1',
      seasonNumber: 1,
      episodeNumber: 99
    });

    const mockOnEpisodeChange = jest.fn();
    
    // Use episode list that doesn't contain the target episode
    const limitedEpisodeList = mockEpisodeList.slice(0, 2); // Only episodes 1 and 2
    
    render(
      <VideoPlayerContent
        {...defaultProps}
        episodes={limitedEpisodeList}
        onEpisodeChange={mockOnEpisodeChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('media-player')).toBeInTheDocument();
    });

    // Simulate next episode navigation that should fall back to metadata service
    const nextEpisodeButton = screen.getByTestId('next-episode-button');
    nextEpisodeButton.click();

    await waitFor(() => {
      expect(getNextEpisode).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Verify that metadata service was called as fallback
    expect(getNextEpisode).toHaveBeenCalledWith(expect.any(String));
  });

  it('should handle mixed ID formats gracefully', async () => {
    // Create episode list with mixed ID formats
    const mixedFormatEpisodes: Episode[] = [
      {
        ...mockEpisodeList[0],
        id: 'episode-1' // Metadata format
      },
      {
        ...mockEpisodeList[1],
        id: '157239-s1-e2' // TMDB format
      },
      {
        ...mockEpisodeList[2],
        id: 'custom-episode-3' // Unknown format
      }
    ];

    const mockOnEpisodeChange = jest.fn();
    
    render(
      <VideoPlayerContent
        {...defaultProps}
        episodes={mixedFormatEpisodes}
        currentEpisodeIndex={0}
        onEpisodeChange={mockOnEpisodeChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('media-player')).toBeInTheDocument();
    });

    // Component should handle mixed formats without crashing
    expect(screen.getByTestId('media-player')).toBeInTheDocument();
  });

  it('should log ID resolution process for debugging', async () => {
    const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    render(
      <VideoPlayerContent
        {...defaultProps}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('media-player')).toBeInTheDocument();
    });

    // Simulate episode navigation to trigger ID resolution logging
    const nextEpisodeButton = screen.getByTestId('next-episode-button');
    nextEpisodeButton.click();

    await waitFor(() => {
      // Verify that ID resolution logging occurred
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('🎬'),
        expect.any(Object)
      );
    }, { timeout: 3000 });
  });
});