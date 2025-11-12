/**
 * Tests for Video component ID consistency fix
 */

import React from 'react';
import { render } from '@testing-library/react';
import Video from '../Video';
import { VideoPlayerEpisodeData } from '@/utils/episode-transformation';
import { Episode } from '@/types';

// Mock VideoPlayerClient to capture props
const mockVideoPlayerClient = jest.fn();
jest.mock('../VideoPlayerClient', () => ({
  VideoPlayerClient: (props: any) => {
    mockVideoPlayerClient(props);
    return <div data-testid="video-player-client" />;
  }
}));

describe('Video Component ID Consistency', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console methods to capture logging
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Content ID Generation', () => {
    it('should use actual episode ID from episode data for TV shows', () => {
      const episodeData: VideoPlayerEpisodeData = {
        episodes: mockEpisodeList,
        currentEpisodeIndex: 1, // Episode 2
        seasonNumber: 1
      };

      render(
        <Video
          contentType="tv"
          episodeData={episodeData}
          title="Test TV Show"
        />
      );

      expect(mockVideoPlayerClient).toHaveBeenCalledWith(
        expect.objectContaining({
          contentId: '157239-s1-e2', // Should use actual episode ID, not random
          contentType: 'episode',
          episodes: mockEpisodeList,
          currentEpisodeIndex: 1,
          seasonNumber: 1
        })
      );
    });

    it('should use first episode ID when currentEpisodeIndex is 0', () => {
      const episodeData: VideoPlayerEpisodeData = {
        episodes: mockEpisodeList,
        currentEpisodeIndex: 0,
        seasonNumber: 1
      };

      render(
        <Video
          contentType="tv"
          episodeData={episodeData}
          title="Test TV Show"
        />
      );

      expect(mockVideoPlayerClient).toHaveBeenCalledWith(
        expect.objectContaining({
          contentId: '157239-s1-e1'
        })
      );
    });

    it('should use movie-1 for movie content type', () => {
      render(
        <Video
          contentType="movie"
          title="Test Movie"
        />
      );

      expect(mockVideoPlayerClient).toHaveBeenCalledWith(
        expect.objectContaining({
          contentId: 'movie-1',
          contentType: 'movie'
        })
      );
    });

    it('should use episode-1 as fallback for TV without episode data', () => {
      render(
        <Video
          contentType="tv"
          episodeData={null}
          title="Test TV Show"
        />
      );

      expect(mockVideoPlayerClient).toHaveBeenCalledWith(
        expect.objectContaining({
          contentId: 'episode-1',
          contentType: 'episode'
        })
      );
    });
  });

  describe('Edge Case Handling', () => {
    it('should handle empty episodes array gracefully', () => {
      const episodeData: VideoPlayerEpisodeData = {
        episodes: [],
        currentEpisodeIndex: 0,
        seasonNumber: 1
      };

      render(
        <Video
          contentType="tv"
          episodeData={episodeData}
          title="Test TV Show"
        />
      );

      expect(mockVideoPlayerClient).toHaveBeenCalledWith(
        expect.objectContaining({
          contentId: 'episode-1' // Fallback when episodes array is empty
        })
      );

      expect(console.warn).toHaveBeenCalledWith(
        '🎬 Episode data provided but episodes array is empty, using fallback ID:',
        'episode-1'
      );
    });

    it('should handle invalid currentEpisodeIndex (too high)', () => {
      const episodeData: VideoPlayerEpisodeData = {
        episodes: mockEpisodeList,
        currentEpisodeIndex: 10, // Out of bounds
        seasonNumber: 1
      };

      render(
        <Video
          contentType="tv"
          episodeData={episodeData}
          title="Test TV Show"
        />
      );

      expect(mockVideoPlayerClient).toHaveBeenCalledWith(
        expect.objectContaining({
          contentId: '157239-s1-e1' // Should use first episode as fallback
        })
      );

      expect(console.warn).toHaveBeenCalledWith(
        '🎬 Invalid currentEpisodeIndex, using first episode:',
        expect.objectContaining({
          currentIndex: 10,
          episodesLength: 3,
          fallbackId: '157239-s1-e1'
        })
      );
    });

    it('should handle invalid currentEpisodeIndex (negative)', () => {
      const episodeData: VideoPlayerEpisodeData = {
        episodes: mockEpisodeList,
        currentEpisodeIndex: -1,
        seasonNumber: 1
      };

      render(
        <Video
          contentType="tv"
          episodeData={episodeData}
          title="Test TV Show"
        />
      );

      expect(mockVideoPlayerClient).toHaveBeenCalledWith(
        expect.objectContaining({
          contentId: '157239-s1-e1' // Should use first episode as fallback
        })
      );
    });

    it('should handle episode with missing ID', () => {
      const episodesWithMissingId: Episode[] = [
        {
          ...mockEpisodeList[0],
          id: '' // Missing ID
        }
      ];

      const episodeData: VideoPlayerEpisodeData = {
        episodes: episodesWithMissingId,
        currentEpisodeIndex: 0,
        seasonNumber: 1
      };

      render(
        <Video
          contentType="tv"
          episodeData={episodeData}
          title="Test TV Show"
        />
      );

      expect(mockVideoPlayerClient).toHaveBeenCalledWith(
        expect.objectContaining({
          contentId: 'episode-1' // Index-based fallback
        })
      );

      expect(console.warn).toHaveBeenCalledWith(
        '🎬 Episode found but ID is missing, using index-based fallback:',
        expect.objectContaining({
          currentIndex: 0,
          episodeTitle: 'Episode 1: Pilot',
          fallbackId: 'episode-1'
        })
      );
    });

    it('should handle undefined currentEpisodeIndex', () => {
      const episodeData: VideoPlayerEpisodeData = {
        episodes: mockEpisodeList,
        currentEpisodeIndex: undefined as any,
        seasonNumber: 1
      };

      render(
        <Video
          contentType="tv"
          episodeData={episodeData}
          title="Test TV Show"
        />
      );

      expect(mockVideoPlayerClient).toHaveBeenCalledWith(
        expect.objectContaining({
          contentId: '157239-s1-e1' // Should default to first episode (index 0)
        })
      );
    });
  });

  describe('Series ID Generation', () => {
    it('should extract series ID from TMDB format episode IDs', () => {
      const episodeData: VideoPlayerEpisodeData = {
        episodes: mockEpisodeList,
        currentEpisodeIndex: 0,
        seasonNumber: 1
      };

      render(
        <Video
          contentType="tv"
          episodeData={episodeData}
          title="Test TV Show"
        />
      );

      expect(mockVideoPlayerClient).toHaveBeenCalledWith(
        expect.objectContaining({
          seriesId: '157239' // Extracted from '157239-s1-e1'
        })
      );

      expect(console.log).toHaveBeenCalledWith(
        '🎬 Extracted series ID from episode data:',
        '157239'
      );
    });

    it('should use fallback series ID for non-TMDB format episode IDs', () => {
      const nonTmdbEpisodes: Episode[] = [
        {
          ...mockEpisodeList[0],
          id: 'episode-1' // Non-TMDB format
        }
      ];

      const episodeData: VideoPlayerEpisodeData = {
        episodes: nonTmdbEpisodes,
        currentEpisodeIndex: 0,
        seasonNumber: 1
      };

      render(
        <Video
          contentType="tv"
          episodeData={episodeData}
          title="Test TV Show"
        />
      );

      expect(mockVideoPlayerClient).toHaveBeenCalledWith(
        expect.objectContaining({
          seriesId: 'series-1' // Fallback series ID
        })
      );
    });

    it('should return undefined series ID for movies', () => {
      render(
        <Video
          contentType="movie"
          title="Test Movie"
        />
      );

      expect(mockVideoPlayerClient).toHaveBeenCalledWith(
        expect.objectContaining({
          seriesId: undefined
        })
      );
    });
  });

  describe('Logging and Debugging', () => {
    it('should log episode ID usage for debugging', () => {
      const episodeData: VideoPlayerEpisodeData = {
        episodes: mockEpisodeList,
        currentEpisodeIndex: 2,
        seasonNumber: 1
      };

      render(
        <Video
          contentType="tv"
          episodeData={episodeData}
          title="Test TV Show"
        />
      );

      expect(console.log).toHaveBeenCalledWith(
        '🎬 Using episode ID from episode data:',
        expect.objectContaining({
          episodeId: '157239-s1-e3',
          episodeTitle: 'Episode 3: Revelations',
          currentIndex: 2,
          extractedSeriesId: '157239'
        })
      );
    });

    it('should log episode change events with detailed information', () => {
      const episodeData: VideoPlayerEpisodeData = {
        episodes: mockEpisodeList,
        currentEpisodeIndex: 0,
        seasonNumber: 1
      };

      render(
        <Video
          contentType="tv"
          episodeData={episodeData}
          title="Test TV Show"
        />
      );

      // Get the onEpisodeChange callback and test it
      const onEpisodeChangeCallback = mockVideoPlayerClient.mock.calls[0][0].onEpisodeChange;
      
      // Simulate episode change
      onEpisodeChangeCallback({
        id: '157239-s1-e2',
        title: 'Episode 2: Discovery',
        seasonNumber: 1,
        episodeNumber: 2
      });

      expect(console.log).toHaveBeenCalledWith(
        '🎬 Episode changed in Video component:',
        {
          newEpisodeId: '157239-s1-e2',
          newEpisodeTitle: 'Episode 2: Discovery',
          seasonNumber: 1,
          episodeNumber: 2
        }
      );
    });
  });

  describe('Integration with VideoPlayerClient', () => {
    it('should pass all required props to VideoPlayerClient', () => {
      const episodeData: VideoPlayerEpisodeData = {
        episodes: mockEpisodeList,
        currentEpisodeIndex: 1,
        seasonNumber: 1
      };

      render(
        <Video
          src="/test-video.mp4"
          autoFullscreen={true}
          autoPlay={false}
          title="Test Episode"
          contentType="tv"
          episodeData={episodeData}
        />
      );

      expect(mockVideoPlayerClient).toHaveBeenCalledWith({
        src: '/test-video.mp4',
        onPlayingChange: expect.any(Function),
        autoFullscreen: true,
        autoPlay: false,
        title: 'Test Episode',
        className: 'w-99% m-0 p-0 h-full max-w-none',
        contentType: 'episode',
        contentId: '157239-s1-e2',
        seriesId: '157239',
        episodes: mockEpisodeList,
        currentEpisodeIndex: 1,
        seasonNumber: 1,
        onEpisodeChange: expect.any(Function)
      });
    });
  });
});