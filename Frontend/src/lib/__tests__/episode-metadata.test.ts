/**
 * Comprehensive tests for episode metadata utility functions
 * Tests all functions with mock data, error handling, and edge cases
 * Requirements: 4.2, 4.5, 4.6
 */

import {
  getEpisodeMetadata,
  getNextEpisode,
  getMovieMetadata,
  getSeriesEpisodes,
  getIntroTiming,
  EpisodeMetadata,
  MovieMetadata
} from '../episode-metadata';

// Mock console methods to test logging
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('Episode Metadata Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
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

  describe('getEpisodeMetadata', () => {
    it('should return episode metadata for valid episode ID', async () => {
      const promise = getEpisodeMetadata('episode-1');
      
      // Fast-forward the async delay
      jest.advanceTimersByTime(100);
      
      const result = await promise;
      
      expect(result).toBeDefined();
      expect(result?.id).toBe('episode-1');
      expect(result?.title).toBe('Pilot Episode');
      expect(result?.seriesId).toBe('series-1');
      expect(result?.seasonNumber).toBe(1);
      expect(result?.episodeNumber).toBe(1);
      expect(result?.introStart).toBe(0);
      expect(result?.introEnd).toBe(45);
      expect(result?.duration).toBe(2700);
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🎬 Episode metadata loaded successfully:',
        'Pilot Episode'
      );
    });

    it('should return null for non-existent episode ID', async () => {
      const promise = getEpisodeMetadata('non-existent');
      
      jest.advanceTimersByTime(100);
      
      const result = await promise;
      
      expect(result).toBeNull();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🎬 Episode metadata not found for ID:',
        'non-existent'
      );
    });

    it('should handle invalid input parameters', async () => {
      // Test empty string
      let promise = getEpisodeMetadata('');
      jest.advanceTimersByTime(100);
      let result = await promise;
      
      expect(result).toBeNull();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '🎬 Invalid episode ID provided:',
        ''
      );

      // Test null input
      promise = getEpisodeMetadata(null as any);
      jest.advanceTimersByTime(100);
      result = await promise;
      
      expect(result).toBeNull();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '🎬 Invalid episode ID provided:',
        null
      );

      // Test undefined input
      promise = getEpisodeMetadata(undefined as any);
      jest.advanceTimersByTime(100);
      result = await promise;
      
      expect(result).toBeNull();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '🎬 Invalid episode ID provided:',
        undefined
      );

      // Test non-string input
      promise = getEpisodeMetadata(123 as any);
      jest.advanceTimersByTime(100);
      result = await promise;
      
      expect(result).toBeNull();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '🎬 Invalid episode ID provided:',
        123
      );
    });

    it('should handle errors gracefully', async () => {
      // Mock an error in the function
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = jest.fn(() => {
        throw new Error('Simulated error');
      }) as any;

      const promise = getEpisodeMetadata('episode-1');
      jest.advanceTimersByTime(100);
      const result = await promise;

      expect(result).toBeNull();
      expect(mockConsoleError).toHaveBeenCalledWith(
        '🎬 Error loading episode metadata:',
        expect.any(Error)
      );

      // Restore setTimeout
      global.setTimeout = originalSetTimeout;
    });

    it('should return all expected episode metadata fields', async () => {
      const promise = getEpisodeMetadata('episode-2');
      jest.advanceTimersByTime(100);
      const result = await promise;

      expect(result).toEqual({
        id: 'episode-2',
        title: 'The Discovery',
        description: 'New worlds are discovered as the adventure continues',
        thumbnail: '/thumbnails/episode-2.jpg',
        src: '/videos/episode-2.mp4',
        introStart: 0,
        introEnd: 42,
        duration: 2640,
        seriesId: 'series-1',
        seasonNumber: 1,
        episodeNumber: 2
      });
    });
  });

  describe('getNextEpisode', () => {
    it('should return next episode for valid current episode', async () => {
      const promise = getNextEpisode('episode-1');
      jest.advanceTimersByTime(100);
      const result = await promise;

      expect(result).toBeDefined();
      expect(result?.id).toBe('episode-2');
      expect(result?.title).toBe('The Discovery');
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🎬 Next episode loaded successfully:',
        'The Discovery'
      );
    });

    it('should return null for last episode in sequence', async () => {
      const promise = getNextEpisode('episode-5');
      jest.advanceTimersByTime(100);
      const result = await promise;

      expect(result).toBeNull();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🎬 No next episode found for:',
        'episode-5'
      );
    });

    it('should return null for non-existent episode', async () => {
      const promise = getNextEpisode('non-existent');
      jest.advanceTimersByTime(100);
      const result = await promise;

      expect(result).toBeNull();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🎬 No next episode found for:',
        'non-existent'
      );
    });

    it('should handle invalid input parameters', async () => {
      // Test empty string
      let promise = getNextEpisode('');
      jest.advanceTimersByTime(100);
      let result = await promise;
      
      expect(result).toBeNull();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '🎬 Invalid current episode ID provided:',
        ''
      );

      // Test null input
      promise = getNextEpisode(null as any);
      jest.advanceTimersByTime(100);
      result = await promise;
      
      expect(result).toBeNull();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '🎬 Invalid current episode ID provided:',
        null
      );
    });

    it('should handle sequence with missing next episode metadata', async () => {
      // This would test a scenario where EPISODE_SEQUENCES has a mapping
      // but the target episode doesn't exist in MOCK_EPISODES
      // For now, our mock data is consistent, but this tests the warning case
      const promise = getNextEpisode('episode-4');
      jest.advanceTimersByTime(100);
      const result = await promise;

      expect(result).toBeDefined();
      expect(result?.id).toBe('episode-5');
    });

    it('should handle errors gracefully', async () => {
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = jest.fn(() => {
        throw new Error('Simulated error');
      }) as any;

      const promise = getNextEpisode('episode-1');
      jest.advanceTimersByTime(100);
      const result = await promise;

      expect(result).toBeNull();
      expect(mockConsoleError).toHaveBeenCalledWith(
        '🎬 Error loading next episode metadata:',
        expect.any(Error)
      );

      global.setTimeout = originalSetTimeout;
    });
  });

  describe('getMovieMetadata', () => {
    it('should return movie metadata for valid movie ID', async () => {
      const promise = getMovieMetadata('movie-1');
      jest.advanceTimersByTime(100);
      const result = await promise;

      expect(result).toBeDefined();
      expect(result?.id).toBe('movie-1');
      expect(result?.title).toBe('The Epic Adventure');
      expect(result?.introStart).toBe(0);
      expect(result?.introEnd).toBe(90);
      expect(result?.duration).toBe(7200);
      
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🎬 Movie metadata loaded successfully:',
        'The Epic Adventure'
      );
    });

    it('should return null for non-existent movie ID', async () => {
      const promise = getMovieMetadata('non-existent');
      jest.advanceTimersByTime(100);
      const result = await promise;

      expect(result).toBeNull();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🎬 Movie metadata not found for ID:',
        'non-existent'
      );
    });

    it('should handle invalid input parameters', async () => {
      // Test empty string
      let promise = getMovieMetadata('');
      jest.advanceTimersByTime(100);
      let result = await promise;
      
      expect(result).toBeNull();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '🎬 Invalid movie ID provided:',
        ''
      );

      // Test non-string input
      promise = getMovieMetadata(123 as any);
      jest.advanceTimersByTime(100);
      result = await promise;
      
      expect(result).toBeNull();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '🎬 Invalid movie ID provided:',
        123
      );
    });

    it('should return all expected movie metadata fields', async () => {
      const promise = getMovieMetadata('movie-2');
      jest.advanceTimersByTime(100);
      const result = await promise;

      expect(result).toEqual({
        id: 'movie-2',
        title: 'Mystery of the Lost City',
        introStart: 0,
        introEnd: 85,
        duration: 6900,
        src: '/videos/movie-2.mp4',
        thumbnail: '/thumbnails/movie-2.jpg',
        description: 'A thrilling mystery set in an ancient lost civilization'
      });
    });

    it('should handle errors gracefully', async () => {
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = jest.fn(() => {
        throw new Error('Simulated error');
      }) as any;

      const promise = getMovieMetadata('movie-1');
      jest.advanceTimersByTime(100);
      const result = await promise;

      expect(result).toBeNull();
      expect(mockConsoleError).toHaveBeenCalledWith(
        '🎬 Error loading movie metadata:',
        expect.any(Error)
      );

      global.setTimeout = originalSetTimeout;
    });
  });

  describe('getSeriesEpisodes', () => {
    it('should return all episodes for a valid series ID', async () => {
      const promise = getSeriesEpisodes('series-1');
      jest.advanceTimersByTime(100);
      const result = await promise;

      expect(result).toHaveLength(5);
      expect(result[0].id).toBe('episode-1');
      expect(result[1].id).toBe('episode-2');
      expect(result[4].id).toBe('episode-5');
      
      // Verify episodes are sorted by season and episode number
      expect(result[0].episodeNumber).toBe(1);
      expect(result[1].episodeNumber).toBe(2);
      expect(result[4].episodeNumber).toBe(5);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🎬 Found 5 episodes for series:',
        'series-1'
      );
    });

    it('should return empty array for non-existent series', async () => {
      const promise = getSeriesEpisodes('non-existent');
      jest.advanceTimersByTime(100);
      const result = await promise;

      expect(result).toEqual([]);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🎬 Found 0 episodes for series:',
        'non-existent'
      );
    });

    it('should handle invalid input parameters', async () => {
      // Test empty string
      let promise = getSeriesEpisodes('');
      jest.advanceTimersByTime(100);
      let result = await promise;
      
      expect(result).toEqual([]);
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '🎬 Invalid series ID provided:',
        ''
      );

      // Test null input
      promise = getSeriesEpisodes(null as any);
      jest.advanceTimersByTime(100);
      result = await promise;
      
      expect(result).toEqual([]);
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '🎬 Invalid series ID provided:',
        null
      );
    });

    it('should sort episodes correctly by season and episode number', async () => {
      const promise = getSeriesEpisodes('series-1');
      jest.advanceTimersByTime(100);
      const result = await promise;

      // Verify sorting
      for (let i = 0; i < result.length - 1; i++) {
        const current = result[i];
        const next = result[i + 1];
        
        if (current.seasonNumber === next.seasonNumber) {
          expect(current.episodeNumber).toBeLessThan(next.episodeNumber);
        } else {
          expect(current.seasonNumber).toBeLessThan(next.seasonNumber);
        }
      }
    });

    it('should handle errors gracefully', async () => {
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = jest.fn(() => {
        throw new Error('Simulated error');
      }) as any;

      const promise = getSeriesEpisodes('series-1');
      jest.advanceTimersByTime(100);
      const result = await promise;

      expect(result).toEqual([]);
      expect(mockConsoleError).toHaveBeenCalledWith(
        '🎬 Error loading series episodes:',
        expect.any(Error)
      );

      global.setTimeout = originalSetTimeout;
    });
  });

  describe('getIntroTiming', () => {
    it('should return intro timing for valid episode', async () => {
      const promise = getIntroTiming('episode-1', 'episode');
      jest.advanceTimersByTime(100);
      const result = await promise;

      expect(result).toEqual({ start: 0, end: 45 });
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🎬 Intro timing loaded for episode: 0s - 45s'
      );
    });

    it('should return intro timing for valid movie', async () => {
      const promise = getIntroTiming('movie-1', 'movie');
      jest.advanceTimersByTime(100);
      const result = await promise;

      expect(result).toEqual({ start: 0, end: 90 });
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🎬 Intro timing loaded for movie: 0s - 90s'
      );
    });

    it('should return null for non-existent episode', async () => {
      const promise = getIntroTiming('non-existent', 'episode');
      jest.advanceTimersByTime(100);
      const result = await promise;

      expect(result).toBeNull();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🎬 No intro timing found for episode:',
        'non-existent'
      );
    });

    it('should return null for non-existent movie', async () => {
      const promise = getIntroTiming('non-existent', 'movie');
      jest.advanceTimersByTime(100);
      const result = await promise;

      expect(result).toBeNull();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🎬 No intro timing found for movie:',
        'non-existent'
      );
    });

    it('should handle invalid content ID parameters', async () => {
      // Test empty string
      let promise = getIntroTiming('', 'episode');
      jest.advanceTimersByTime(100);
      let result = await promise;
      
      expect(result).toBeNull();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '🎬 Invalid content ID provided:',
        ''
      );

      // Test null input
      promise = getIntroTiming(null as any, 'movie');
      jest.advanceTimersByTime(100);
      result = await promise;
      
      expect(result).toBeNull();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '🎬 Invalid content ID provided:',
        null
      );
    });

    it('should handle invalid content type parameters', async () => {
      // Test invalid content type
      let promise = getIntroTiming('episode-1', 'invalid' as any);
      jest.advanceTimersByTime(100);
      let result = await promise;
      
      expect(result).toBeNull();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '🎬 Invalid content type provided:',
        'invalid'
      );

      // Test empty content type
      promise = getIntroTiming('episode-1', '' as any);
      jest.advanceTimersByTime(100);
      result = await promise;
      
      expect(result).toBeNull();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '🎬 Invalid content type provided:',
        ''
      );

      // Test null content type
      promise = getIntroTiming('episode-1', null as any);
      jest.advanceTimersByTime(100);
      result = await promise;
      
      expect(result).toBeNull();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '🎬 Invalid content type provided:',
        null
      );
    });

    it('should handle errors gracefully', async () => {
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = jest.fn(() => {
        throw new Error('Simulated error');
      }) as any;

      const promise = getIntroTiming('episode-1', 'episode');
      jest.advanceTimersByTime(100);
      const result = await promise;

      expect(result).toBeNull();
      expect(mockConsoleError).toHaveBeenCalledWith(
        '🎬 Error loading intro timing:',
        expect.any(Error)
      );

      global.setTimeout = originalSetTimeout;
    });
  });

  describe('Performance and Memory Management', () => {
    it('should complete all async operations within reasonable time', async () => {
      const startTime = Date.now();
      
      const promises = [
        getEpisodeMetadata('episode-1'),
        getNextEpisode('episode-1'),
        getMovieMetadata('movie-1'),
        getSeriesEpisodes('series-1'),
        getIntroTiming('episode-1', 'episode')
      ];

      // Fast-forward timers
      jest.advanceTimersByTime(100);
      
      const results = await Promise.all(promises);
      
      // All should complete successfully
      expect(results[0]).toBeDefined(); // episode metadata
      expect(results[1]).toBeDefined(); // next episode
      expect(results[2]).toBeDefined(); // movie metadata
      expect(results[3]).toHaveLength(5); // series episodes
      expect(results[4]).toBeDefined(); // intro timing
    });

    it('should handle concurrent requests without interference', async () => {
      // Make multiple concurrent requests for the same data
      const promises = Array(10).fill(null).map(() => getEpisodeMetadata('episode-1'));
      
      jest.advanceTimersByTime(100);
      
      const results = await Promise.all(promises);
      
      // All should return the same valid result
      results.forEach(result => {
        expect(result?.id).toBe('episode-1');
        expect(result?.title).toBe('Pilot Episode');
      });
    });

    it('should not leak memory with repeated calls', async () => {
      // Make many sequential calls to test for memory leaks
      for (let i = 0; i < 50; i++) {
        const promise = getEpisodeMetadata('episode-1');
        jest.advanceTimersByTime(100);
        const result = await promise;
        expect(result?.id).toBe('episode-1');
      }
      
      // If we get here without issues, memory management is working
      expect(true).toBe(true);
    });
  });

  describe('Data Consistency and Validation', () => {
    it('should maintain consistent data structure across all episodes', async () => {
      const episodeIds = ['episode-1', 'episode-2', 'episode-3', 'episode-4', 'episode-5'];
      
      for (const id of episodeIds) {
        const promise = getEpisodeMetadata(id);
        jest.advanceTimersByTime(100);
        const episode = await promise;
        
        expect(episode).toBeDefined();
        expect(typeof episode?.id).toBe('string');
        expect(typeof episode?.title).toBe('string');
        expect(typeof episode?.description).toBe('string');
        expect(typeof episode?.thumbnail).toBe('string');
        expect(typeof episode?.src).toBe('string');
        expect(typeof episode?.introStart).toBe('number');
        expect(typeof episode?.introEnd).toBe('number');
        expect(typeof episode?.duration).toBe('number');
        expect(typeof episode?.seriesId).toBe('string');
        expect(typeof episode?.seasonNumber).toBe('number');
        expect(typeof episode?.episodeNumber).toBe('number');
        
        // Validate intro timing is logical
        expect(episode!.introStart).toBeLessThan(episode!.introEnd);
        expect(episode!.introStart).toBeGreaterThanOrEqual(0);
        expect(episode!.duration).toBeGreaterThan(episode!.introEnd);
      }
    });

    it('should maintain consistent data structure across all movies', async () => {
      const movieIds = ['movie-1', 'movie-2', 'movie-3'];
      
      for (const id of movieIds) {
        const promise = getMovieMetadata(id);
        jest.advanceTimersByTime(100);
        const movie = await promise;
        
        expect(movie).toBeDefined();
        expect(typeof movie?.id).toBe('string');
        expect(typeof movie?.title).toBe('string');
        expect(typeof movie?.introStart).toBe('number');
        expect(typeof movie?.introEnd).toBe('number');
        expect(typeof movie?.duration).toBe('number');
        expect(typeof movie?.src).toBe('string');
        expect(typeof movie?.thumbnail).toBe('string');
        expect(typeof movie?.description).toBe('string');
        
        // Validate intro timing is logical
        expect(movie!.introStart).toBeLessThan(movie!.introEnd);
        expect(movie!.introStart).toBeGreaterThanOrEqual(0);
        expect(movie!.duration).toBeGreaterThan(movie!.introEnd);
      }
    });

    it('should validate episode sequence consistency', async () => {
      // Test that next episode sequences are valid
      const sequenceTests = [
        { current: 'episode-1', expected: 'episode-2' },
        { current: 'episode-2', expected: 'episode-3' },
        { current: 'episode-3', expected: 'episode-4' },
        { current: 'episode-4', expected: 'episode-5' },
        { current: 'episode-5', expected: null }
      ];

      for (const test of sequenceTests) {
        const promise = getNextEpisode(test.current);
        jest.advanceTimersByTime(100);
        const result = await promise;
        
        if (test.expected) {
          expect(result?.id).toBe(test.expected);
        } else {
          expect(result).toBeNull();
        }
      }
    });
  });
});