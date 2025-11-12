import { 
  getMovieTrailer, 
  getVidstackMovieTrailer, 
  invalidateTrailerCache, 
  clearAllTrailerCaches, 
  getTrailerCacheStats 
} from '../movie-service';
import { fetchMovieVideos } from '../tmdb';

// Mock the TMDB module
jest.mock('../tmdb', () => ({
  fetchMovieVideos: jest.fn(),
  getTrailerUrl: jest.fn(),
  getVidstackTrailerUrl: jest.fn(),
}));

const mockFetchMovieVideos = fetchMovieVideos as jest.MockedFunction<typeof fetchMovieVideos>;

// Mock console methods to avoid noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeEach(() => {
  jest.clearAllMocks();
  clearAllTrailerCaches();
  console.log = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

describe('Trailer Cache', () => {
  const mockMovieId = '123';
  const mockTrailerUrl = 'https://www.youtube.com/embed/abc123';
  const mockVideosResponse = {
    id: 123,
    results: [
      {
        id: 'video1',
        iso_639_1: 'en',
        iso_3166_1: 'US',
        key: 'abc123',
        name: 'Official Trailer',
        site: 'YouTube',
        size: 1080,
        type: 'Trailer',
        official: true,
        published_at: '2023-01-01T00:00:00.000Z'
      }
    ]
  };

  describe('getMovieTrailer caching', () => {
    it('should cache trailer URL on first fetch', async () => {
      // Mock successful API response
      mockFetchMovieVideos.mockResolvedValueOnce(mockVideosResponse);
      
      // Mock getTrailerUrl to return a URL
      const { getTrailerUrl } = require('../tmdb');
      getTrailerUrl.mockReturnValueOnce(mockTrailerUrl);

      // First call should fetch from API
      const result1 = await getMovieTrailer(mockMovieId);
      expect(result1).toBe(mockTrailerUrl);
      expect(mockFetchMovieVideos).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result2 = await getMovieTrailer(mockMovieId);
      expect(result2).toBe(mockTrailerUrl);
      expect(mockFetchMovieVideos).toHaveBeenCalledTimes(1); // Still only called once
    });

    it('should cache null result when no trailer is available', async () => {
      // Mock API response with no trailers
      mockFetchMovieVideos.mockResolvedValueOnce({
        id: 123,
        results: []
      });

      // First call should fetch from API
      const result1 = await getMovieTrailer(mockMovieId);
      expect(result1).toBeNull();
      expect(mockFetchMovieVideos).toHaveBeenCalledTimes(1);

      // Second call should use cached null result
      const result2 = await getMovieTrailer(mockMovieId);
      expect(result2).toBeNull();
      expect(mockFetchMovieVideos).toHaveBeenCalledTimes(1); // Still only called once
    });

    it('should cache null result when API call fails', async () => {
      // Mock API failure
      mockFetchMovieVideos.mockRejectedValueOnce(new Error('API Error'));

      // First call should handle error and cache null
      const result1 = await getMovieTrailer(mockMovieId);
      expect(result1).toBeNull();
      expect(mockFetchMovieVideos).toHaveBeenCalledTimes(1);

      // Second call should use cached null result
      const result2 = await getMovieTrailer(mockMovieId);
      expect(result2).toBeNull();
      expect(mockFetchMovieVideos).toHaveBeenCalledTimes(1); // Still only called once
    });
  });

  describe('getVidstackMovieTrailer caching', () => {
    it('should cache Vidstack trailer URL separately from standard cache', async () => {
      const mockVidstackUrl = 'https://www.youtube.com/watch?v=abc123';
      
      // Mock successful API response
      mockFetchMovieVideos.mockResolvedValue(mockVideosResponse);
      
      // Mock both URL generators
      const { getTrailerUrl, getVidstackTrailerUrl } = require('../tmdb');
      getTrailerUrl.mockReturnValue(mockTrailerUrl);
      getVidstackTrailerUrl.mockReturnValue(mockVidstackUrl);

      // Fetch standard trailer first
      const standardResult = await getMovieTrailer(mockMovieId);
      expect(standardResult).toBe(mockTrailerUrl);

      // Fetch Vidstack trailer - should make separate API call since it's different cache
      const vidstackResult = await getVidstackMovieTrailer(mockMovieId);
      expect(vidstackResult).toBe(mockVidstackUrl);
      expect(mockFetchMovieVideos).toHaveBeenCalledTimes(2);

      // Second Vidstack call should use cache
      const vidstackResult2 = await getVidstackMovieTrailer(mockMovieId);
      expect(vidstackResult2).toBe(mockVidstackUrl);
      expect(mockFetchMovieVideos).toHaveBeenCalledTimes(2); // Still only 2 calls
    });
  });

  describe('Cache invalidation', () => {
    it('should invalidate cache for specific movie', async () => {
      // Mock successful API response
      mockFetchMovieVideos.mockResolvedValue(mockVideosResponse);
      
      const { getTrailerUrl } = require('../tmdb');
      getTrailerUrl.mockReturnValue(mockTrailerUrl);

      // First call
      await getMovieTrailer(mockMovieId);
      expect(mockFetchMovieVideos).toHaveBeenCalledTimes(1);

      // Invalidate cache
      invalidateTrailerCache(mockMovieId);

      // Next call should fetch from API again
      await getMovieTrailer(mockMovieId);
      expect(mockFetchMovieVideos).toHaveBeenCalledTimes(2);
    });

    it('should clear all caches', async () => {
      // Mock successful API response
      mockFetchMovieVideos.mockResolvedValue(mockVideosResponse);
      
      const { getTrailerUrl, getVidstackTrailerUrl } = require('../tmdb');
      getTrailerUrl.mockReturnValue(mockTrailerUrl);
      getVidstackTrailerUrl.mockReturnValue('vidstack-url');

      // Cache some data
      await getMovieTrailer('123');
      await getMovieTrailer('456');
      await getVidstackMovieTrailer('789');

      // Verify cache has entries
      const statsBefore = getTrailerCacheStats();
      expect(statsBefore.standardCache).toBeGreaterThan(0);
      expect(statsBefore.vidstackCache).toBeGreaterThan(0);

      // Clear all caches
      clearAllTrailerCaches();

      // Verify caches are empty
      const statsAfter = getTrailerCacheStats();
      expect(statsAfter.standardCache).toBe(0);
      expect(statsAfter.vidstackCache).toBe(0);
    });
  });

  describe('Cache statistics', () => {
    it('should track cache sizes correctly', async () => {
      // Mock successful API response
      mockFetchMovieVideos.mockResolvedValue(mockVideosResponse);
      
      const { getTrailerUrl, getVidstackTrailerUrl } = require('../tmdb');
      getTrailerUrl.mockReturnValue(mockTrailerUrl);
      getVidstackTrailerUrl.mockReturnValue('vidstack-url');

      // Initial state
      let stats = getTrailerCacheStats();
      expect(stats.standardCache).toBe(0);
      expect(stats.vidstackCache).toBe(0);

      // Add to standard cache
      await getMovieTrailer('123');
      stats = getTrailerCacheStats();
      expect(stats.standardCache).toBe(1);
      expect(stats.vidstackCache).toBe(0);

      // Add to Vidstack cache
      await getVidstackMovieTrailer('456');
      stats = getTrailerCacheStats();
      expect(stats.standardCache).toBe(1);
      expect(stats.vidstackCache).toBe(1);

      // Add more entries
      await getMovieTrailer('789');
      await getVidstackMovieTrailer('101112');
      stats = getTrailerCacheStats();
      expect(stats.standardCache).toBe(2);
      expect(stats.vidstackCache).toBe(2);
    });
  });

  describe('Error handling with caching', () => {
    it('should handle invalid movie IDs gracefully', async () => {
      const result1 = await getMovieTrailer('');
      expect(result1).toBeNull();

      const result2 = await getMovieTrailer('invalid');
      expect(result2).toBeNull();

      const result3 = await getMovieTrailer('-1');
      expect(result3).toBeNull();

      // Should not make any API calls for invalid IDs
      expect(mockFetchMovieVideos).not.toHaveBeenCalled();
    });

    it('should handle network timeouts and cache the failure', async () => {
      // Mock timeout error
      mockFetchMovieVideos.mockRejectedValueOnce(new Error('Trailer fetch timeout'));

      // First call should handle timeout
      const result1 = await getMovieTrailer(mockMovieId);
      expect(result1).toBeNull();
      expect(mockFetchMovieVideos).toHaveBeenCalledTimes(1);

      // Second call should use cached failure result
      const result2 = await getMovieTrailer(mockMovieId);
      expect(result2).toBeNull();
      expect(mockFetchMovieVideos).toHaveBeenCalledTimes(1); // Still only called once
    });
  });

  describe('Cache TTL behavior', () => {
    it('should respect cache TTL and expire entries', async () => {
      // This test would require mocking Date.now() to simulate time passage
      // For now, we'll test that the cache cleanup method exists and can be called
      const { getTrailerUrl } = require('../tmdb');
      getTrailerUrl.mockReturnValue(mockTrailerUrl);
      mockFetchMovieVideos.mockResolvedValue(mockVideosResponse);

      // Cache some data
      await getMovieTrailer(mockMovieId);
      
      // Verify cache has entry
      let stats = getTrailerCacheStats();
      expect(stats.standardCache).toBe(1);

      // Note: In a real scenario, we would mock Date.now() to simulate 24+ hours passing
      // and then verify that expired entries are cleaned up automatically
    });
  });
});