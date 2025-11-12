import { 
  getMovieTrailer, 
  getVidstackMovieTrailer, 
  getMovieDetails,
  invalidateTrailerCache, 
  clearAllTrailerCaches, 
  getTrailerCacheStats 
} from '../movie-service';
import { 
  fetchMovieVideos, 
  getTrailerUrl, 
  getVidstackTrailerUrl,
  fetchMovieDetails,
  fetchMovieCredits,
  TMDBVideo 
} from '../tmdb';

// Mock the TMDB module
jest.mock('../tmdb', () => ({
  fetchMovieVideos: jest.fn(),
  getTrailerUrl: jest.fn(),
  getVidstackTrailerUrl: jest.fn(),
  fetchMovieDetails: jest.fn(),
  fetchMovieCredits: jest.fn(),
  convertTMDBMovieDetailsToMovie: jest.fn(),
}));

const mockFetchMovieVideos = fetchMovieVideos as jest.MockedFunction<typeof fetchMovieVideos>;
const mockGetTrailerUrl = getTrailerUrl as jest.MockedFunction<typeof getTrailerUrl>;
const mockGetVidstackTrailerUrl = getVidstackTrailerUrl as jest.MockedFunction<typeof getVidstackTrailerUrl>;
const mockFetchMovieDetails = fetchMovieDetails as jest.MockedFunction<typeof fetchMovieDetails>;
const mockFetchMovieCredits = fetchMovieCredits as jest.MockedFunction<typeof fetchMovieCredits>;

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

describe('Trailer Functionality Unit Tests', () => {
  const mockMovieId = '123';
  const mockTrailerUrl = 'https://www.youtube.com/embed/abc123';
  const mockVidstackUrl = 'youtube/abc123';

  // Mock TMDB video data for various test scenarios
  const mockOfficialTrailerVideo: TMDBVideo = {
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
  };

  const mockUnofficialTrailerVideo: TMDBVideo = {
    id: 'video2',
    iso_639_1: 'en',
    iso_3166_1: 'US',
    key: 'def456',
    name: 'Unofficial Trailer',
    site: 'YouTube',
    size: 720,
    type: 'Trailer',
    official: false,
    published_at: '2023-01-02T00:00:00.000Z'
  };

  const mockNonTrailerVideo: TMDBVideo = {
    id: 'video3',
    iso_639_1: 'en',
    iso_3166_1: 'US',
    key: 'ghi789',
    name: 'Behind the Scenes',
    site: 'YouTube',
    size: 1080,
    type: 'Behind the Scenes',
    official: true,
    published_at: '2023-01-03T00:00:00.000Z'
  };

  const mockNonYouTubeVideo: TMDBVideo = {
    id: 'video4',
    iso_639_1: 'en',
    iso_3166_1: 'US',
    key: 'jkl012',
    name: 'Vimeo Trailer',
    site: 'Vimeo',
    size: 1080,
    type: 'Trailer',
    official: true,
    published_at: '2023-01-04T00:00:00.000Z'
  };

  describe('Trailer URL Construction with Various TMDB Video Data', () => {
    describe('getMovieTrailer', () => {
      it('should successfully fetch and process trailer with official YouTube trailer', async () => {
        const mockVideosResponse = {
          id: 123,
          results: [mockOfficialTrailerVideo]
        };

        mockFetchMovieVideos.mockResolvedValueOnce(mockVideosResponse);
        mockGetTrailerUrl.mockReturnValueOnce(mockTrailerUrl);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBe(mockTrailerUrl);
        expect(mockFetchMovieVideos).toHaveBeenCalledWith(123);
        expect(mockGetTrailerUrl).toHaveBeenCalledWith([mockOfficialTrailerVideo]);
      });

      it('should handle mixed video types and prioritize trailers', async () => {
        const mockVideosResponse = {
          id: 123,
          results: [mockNonTrailerVideo, mockOfficialTrailerVideo, mockUnofficialTrailerVideo]
        };

        mockFetchMovieVideos.mockResolvedValueOnce(mockVideosResponse);
        mockGetTrailerUrl.mockReturnValueOnce(mockTrailerUrl);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBe(mockTrailerUrl);
        expect(mockGetTrailerUrl).toHaveBeenCalledWith([
          mockNonTrailerVideo, 
          mockOfficialTrailerVideo, 
          mockUnofficialTrailerVideo
        ]);
      });

      it('should handle videos with only non-YouTube trailers', async () => {
        const mockVideosResponse = {
          id: 123,
          results: [mockNonYouTubeVideo]
        };

        mockFetchMovieVideos.mockResolvedValueOnce(mockVideosResponse);
        mockGetTrailerUrl.mockReturnValueOnce(null);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(mockGetTrailerUrl).toHaveBeenCalledWith([mockNonYouTubeVideo]);
      });

      it('should handle empty video results', async () => {
        const mockVideosResponse = {
          id: 123,
          results: []
        };

        mockFetchMovieVideos.mockResolvedValueOnce(mockVideosResponse);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(mockGetTrailerUrl).not.toHaveBeenCalled();
      });

      it('should handle videos with malformed data', async () => {
        const malformedVideos = [
          { id: '1', key: null, site: 'YouTube', type: 'Trailer' },
          { id: '2', key: '', site: 'YouTube', type: 'Trailer' },
          { id: '3', key: 'valid_key', site: null, type: 'Trailer' }
        ];

        const mockVideosResponse = {
          id: 123,
          results: malformedVideos as any
        };

        mockFetchMovieVideos.mockResolvedValueOnce(mockVideosResponse);
        mockGetTrailerUrl.mockReturnValueOnce(null);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(mockGetTrailerUrl).toHaveBeenCalledWith(malformedVideos);
      });
    });

    describe('getVidstackMovieTrailer', () => {
      it('should return Vidstack-compatible URL format', async () => {
        const mockVideosResponse = {
          id: 123,
          results: [mockOfficialTrailerVideo]
        };

        mockFetchMovieVideos.mockResolvedValueOnce(mockVideosResponse);
        mockGetVidstackTrailerUrl.mockReturnValueOnce(mockVidstackUrl);

        const result = await getVidstackMovieTrailer(mockMovieId);

        expect(result).toBe(mockVidstackUrl);
        expect(mockGetVidstackTrailerUrl).toHaveBeenCalledWith([mockOfficialTrailerVideo]);
      });

      it('should handle fallback to unofficial trailers in Vidstack format', async () => {
        const mockVideosResponse = {
          id: 123,
          results: [mockUnofficialTrailerVideo]
        };

        mockFetchMovieVideos.mockResolvedValueOnce(mockVideosResponse);
        mockGetVidstackTrailerUrl.mockReturnValueOnce('youtube/def456');

        const result = await getVidstackMovieTrailer(mockMovieId);

        expect(result).toBe('youtube/def456');
        expect(mockGetVidstackTrailerUrl).toHaveBeenCalledWith([mockUnofficialTrailerVideo]);
      });
    });
  });

  describe('Error Handling Scenarios', () => {
    describe('API Failures', () => {
      it('should handle TMDB API network errors gracefully', async () => {
        const networkError = new Error('Network error');
        mockFetchMovieVideos.mockRejectedValueOnce(networkError);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining('Failed to fetch videos for movie 123'),
          networkError
        );
      });

      it('should handle TMDB API 404 errors', async () => {
        const notFoundError = new Error('TMDB API error for movie 123: Movie with ID 123 not found');
        mockFetchMovieVideos.mockRejectedValueOnce(notFoundError);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining('Movie 123 not found in TMDB')
        );
      });

      it('should handle TMDB API authentication errors', async () => {
        const authError = new Error('TMDB API error for movie 123: TMDB API authentication failed - check API key');
        mockFetchMovieVideos.mockRejectedValueOnce(authError);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining('TMDB API authentication failed')
        );
      });

      it('should handle TMDB API rate limiting', async () => {
        const rateLimitError = new Error('TMDB API error for movie 123: TMDB API rate limit exceeded - please try again later');
        mockFetchMovieVideos.mockRejectedValueOnce(rateLimitError);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining('TMDB API rate limit exceeded')
        );
      });

      it('should handle TMDB API server errors', async () => {
        const serverError = new Error('TMDB API error for movie 123: TMDB API server error - please try again later');
        mockFetchMovieVideos.mockRejectedValueOnce(serverError);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining('TMDB API server error')
        );
      });

      it('should handle trailer processing errors', async () => {
        const mockVideosResponse = {
          id: 123,
          results: [mockOfficialTrailerVideo]
        };

        mockFetchMovieVideos.mockResolvedValueOnce(mockVideosResponse);
        mockGetTrailerUrl.mockImplementationOnce(() => {
          throw new Error('Trailer processing error');
        });

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining('Error processing trailer URL for movie 123'),
          expect.any(Error)
        );
      });
    });

    describe('Invalid Input Handling', () => {
      it('should handle empty movie ID', async () => {
        const result = await getMovieTrailer('');
        expect(result).toBeNull();
        expect(mockFetchMovieVideos).not.toHaveBeenCalled();
      });

      it('should handle whitespace-only movie ID', async () => {
        const result = await getMovieTrailer('   ');
        expect(result).toBeNull();
        expect(mockFetchMovieVideos).not.toHaveBeenCalled();
      });

      it('should handle non-numeric movie ID', async () => {
        const result = await getMovieTrailer('invalid-id');
        expect(result).toBeNull();
        expect(mockFetchMovieVideos).not.toHaveBeenCalled();
      });

      it('should handle negative movie ID', async () => {
        const result = await getMovieTrailer('-1');
        expect(result).toBeNull();
        expect(mockFetchMovieVideos).not.toHaveBeenCalled();
      });

      it('should handle zero movie ID', async () => {
        const result = await getMovieTrailer('0');
        expect(result).toBeNull();
        expect(mockFetchMovieVideos).not.toHaveBeenCalled();
      });
    });

    describe('Missing Trailers', () => {
      it('should handle movies with no videos', async () => {
        const mockVideosResponse = {
          id: 123,
          results: []
        };

        mockFetchMovieVideos.mockResolvedValueOnce(mockVideosResponse);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('No videos available for movie 123')
        );
      });

      it('should handle movies with only non-trailer videos', async () => {
        const mockVideosResponse = {
          id: 123,
          results: [mockNonTrailerVideo]
        };

        mockFetchMovieVideos.mockResolvedValueOnce(mockVideosResponse);
        mockGetTrailerUrl.mockReturnValueOnce(null);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
      });

      it('should handle movies with only non-YouTube trailers', async () => {
        const mockVideosResponse = {
          id: 123,
          results: [mockNonYouTubeVideo]
        };

        mockFetchMovieVideos.mockResolvedValueOnce(mockVideosResponse);
        mockGetTrailerUrl.mockReturnValueOnce(null);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
      });
    });
  });

  describe('Caching Behavior and Cache Invalidation', () => {
    describe('Basic Caching', () => {
      it('should cache successful trailer URL results', async () => {
        const mockVideosResponse = {
          id: 123,
          results: [mockOfficialTrailerVideo]
        };

        mockFetchMovieVideos.mockResolvedValue(mockVideosResponse);
        mockGetTrailerUrl.mockReturnValue(mockTrailerUrl);

        // First call should fetch from API
        const result1 = await getMovieTrailer(mockMovieId);
        expect(result1).toBe(mockTrailerUrl);
        expect(mockFetchMovieVideos).toHaveBeenCalledTimes(1);

        // Second call should use cache
        const result2 = await getMovieTrailer(mockMovieId);
        expect(result2).toBe(mockTrailerUrl);
        expect(mockFetchMovieVideos).toHaveBeenCalledTimes(1); // Still only called once
      });

      it('should cache null results when no trailer is available', async () => {
        const mockVideosResponse = {
          id: 123,
          results: []
        };

        mockFetchMovieVideos.mockResolvedValue(mockVideosResponse);

        // First call should fetch from API
        const result1 = await getMovieTrailer(mockMovieId);
        expect(result1).toBeNull();
        expect(mockFetchMovieVideos).toHaveBeenCalledTimes(1);

        // Second call should use cached null result
        const result2 = await getMovieTrailer(mockMovieId);
        expect(result2).toBeNull();
        expect(mockFetchMovieVideos).toHaveBeenCalledTimes(1); // Still only called once
      });

      it('should cache error results to prevent repeated API failures', async () => {
        const apiError = new Error('API Error');
        mockFetchMovieVideos.mockRejectedValue(apiError);

        // First call should handle error and cache null
        const result1 = await getMovieTrailer(mockMovieId);
        expect(result1).toBeNull();
        expect(mockFetchMovieVideos).toHaveBeenCalledTimes(1);

        // Second call should use cached failure result
        const result2 = await getMovieTrailer(mockMovieId);
        expect(result2).toBeNull();
        expect(mockFetchMovieVideos).toHaveBeenCalledTimes(1); // Still only called once
      });
    });

    describe('Separate Cache Instances', () => {
      it('should maintain separate caches for standard and Vidstack URLs', async () => {
        const mockVideosResponse = {
          id: 123,
          results: [mockOfficialTrailerVideo]
        };

        mockFetchMovieVideos.mockResolvedValue(mockVideosResponse);
        mockGetTrailerUrl.mockReturnValue(mockTrailerUrl);
        mockGetVidstackTrailerUrl.mockReturnValue(mockVidstackUrl);

        // Fetch standard trailer first
        const standardResult = await getMovieTrailer(mockMovieId);
        expect(standardResult).toBe(mockTrailerUrl);
        expect(mockFetchMovieVideos).toHaveBeenCalledTimes(1);

        // Fetch Vidstack trailer - should make separate API call since it's different cache
        const vidstackResult = await getVidstackMovieTrailer(mockMovieId);
        expect(vidstackResult).toBe(mockVidstackUrl);
        expect(mockFetchMovieVideos).toHaveBeenCalledTimes(2);

        // Subsequent calls should use respective caches
        await getMovieTrailer(mockMovieId);
        await getVidstackMovieTrailer(mockMovieId);
        expect(mockFetchMovieVideos).toHaveBeenCalledTimes(2); // Still only 2 calls total
      });
    });

    describe('Cache Invalidation', () => {
      it('should invalidate cache for specific movie', async () => {
        const mockVideosResponse = {
          id: 123,
          results: [mockOfficialTrailerVideo]
        };

        mockFetchMovieVideos.mockResolvedValue(mockVideosResponse);
        mockGetTrailerUrl.mockReturnValue(mockTrailerUrl);

        // First call to cache the result
        await getMovieTrailer(mockMovieId);
        expect(mockFetchMovieVideos).toHaveBeenCalledTimes(1);

        // Invalidate cache for this movie
        invalidateTrailerCache(mockMovieId);

        // Next call should fetch from API again
        await getMovieTrailer(mockMovieId);
        expect(mockFetchMovieVideos).toHaveBeenCalledTimes(2);
      });

      it('should clear all caches', async () => {
        const mockVideosResponse = {
          id: 123,
          results: [mockOfficialTrailerVideo]
        };

        mockFetchMovieVideos.mockResolvedValue(mockVideosResponse);
        mockGetTrailerUrl.mockReturnValue(mockTrailerUrl);
        mockGetVidstackTrailerUrl.mockReturnValue(mockVidstackUrl);

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

    describe('Cache Statistics', () => {
      it('should track cache sizes correctly', async () => {
        const mockVideosResponse = {
          id: 123,
          results: [mockOfficialTrailerVideo]
        };

        mockFetchMovieVideos.mockResolvedValue(mockVideosResponse);
        mockGetTrailerUrl.mockReturnValue(mockTrailerUrl);
        mockGetVidstackTrailerUrl.mockReturnValue(mockVidstackUrl);

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
  });

  describe('Integration with getMovieDetails', () => {
    const mockMovieDetails = {
      id: 123,
      title: 'Test Movie',
      overview: 'Test description',
      poster_path: '/test-poster.jpg',
      backdrop_path: '/test-backdrop.jpg',
      release_date: '2023-01-01',
      runtime: 120,
      genres: [{ id: 1, name: 'Action' }],
      vote_average: 8.5,
      vote_count: 1000,
      adult: false
    };

    const mockCredits = {
      cast: [],
      crew: []
    };

    beforeEach(() => {
      // Mock the convertTMDBMovieDetailsToMovie function
      const { convertTMDBMovieDetailsToMovie } = require('../tmdb');
      convertTMDBMovieDetailsToMovie.mockReturnValue({
        id: '123',
        title: 'Test Movie',
        description: 'Test description',
        thumbnail: '/test-poster.jpg',
        backdrop: '/test-backdrop.jpg',
        trailer: '',
        duration: 120,
        releaseDate: '2023-01-01',
        genres: ['Action'],
        rating: 8.5,
        contentRating: 'PG-13',
        cast: [],
        director: 'Unknown',
        writers: ['Unknown'],
        languages: ['English'],
        subtitles: ['English'],
        quality: ['HD', '4K'],
        isNew: false,
        isTrending: false,
        isPopular: true
      });
    });

    it('should integrate trailer fetching with movie details', async () => {
      const mockVideosResponse = {
        id: 123,
        results: [mockOfficialTrailerVideo]
      };

      mockFetchMovieDetails.mockResolvedValueOnce(mockMovieDetails);
      mockFetchMovieCredits.mockResolvedValueOnce(mockCredits);
      mockFetchMovieVideos.mockResolvedValueOnce(mockVideosResponse);
      mockGetTrailerUrl.mockReturnValueOnce(mockTrailerUrl);

      const result = await getMovieDetails(mockMovieId);

      expect(result).toBeTruthy();
      expect(result?.trailer).toBe(mockTrailerUrl);
      expect(mockFetchMovieVideos).toHaveBeenCalledWith(123);
    });

    it('should handle trailer fetch failure in movie details without failing entire request', async () => {
      mockFetchMovieDetails.mockResolvedValueOnce(mockMovieDetails);
      mockFetchMovieCredits.mockResolvedValueOnce(mockCredits);
      mockFetchMovieVideos.mockRejectedValueOnce(new Error('Trailer API Error'));

      const result = await getMovieDetails(mockMovieId);

      expect(result).toBeTruthy();
      expect(result?.trailer).toBe('');
      expect(result?.title).toBe('Test Movie');
    });

    it('should use cached trailer in movie details when available', async () => {
      const mockVideosResponse = {
        id: 123,
        results: [mockOfficialTrailerVideo]
      };

      // First, cache a trailer
      mockFetchMovieVideos.mockResolvedValueOnce(mockVideosResponse);
      mockGetTrailerUrl.mockReturnValueOnce(mockTrailerUrl);
      await getMovieTrailer(mockMovieId);

      // Now fetch movie details - should use cached trailer
      mockFetchMovieDetails.mockResolvedValueOnce(mockMovieDetails);
      mockFetchMovieCredits.mockResolvedValueOnce(mockCredits);

      const result = await getMovieDetails(mockMovieId);

      expect(result).toBeTruthy();
      expect(result?.trailer).toBe(mockTrailerUrl);
      // Should not make additional video API calls since trailer is cached
      expect(mockFetchMovieVideos).toHaveBeenCalledTimes(1);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle concurrent requests for the same movie', async () => {
      const mockVideosResponse = {
        id: 123,
        results: [mockOfficialTrailerVideo]
      };

      mockFetchMovieVideos.mockResolvedValue(mockVideosResponse);
      mockGetTrailerUrl.mockReturnValue(mockTrailerUrl);

      // First request to populate cache
      const firstResult = await getMovieTrailer(mockMovieId);
      expect(firstResult).toBe(mockTrailerUrl);
      expect(mockFetchMovieVideos).toHaveBeenCalledTimes(1);

      // Subsequent concurrent requests should use cache
      const promises = [
        getMovieTrailer(mockMovieId),
        getMovieTrailer(mockMovieId),
        getMovieTrailer(mockMovieId)
      ];

      const results = await Promise.all(promises);

      // All should return the same result
      results.forEach(result => {
        expect(result).toBe(mockTrailerUrl);
      });

      // Should still only have made one API call
      expect(mockFetchMovieVideos).toHaveBeenCalledTimes(1);
    });

    it('should handle large video arrays efficiently', async () => {
      // Create a large array with trailer at the end
      const largeVideoArray: TMDBVideo[] = [];
      
      // Add 100 non-trailer videos
      for (let i = 0; i < 100; i++) {
        largeVideoArray.push({
          id: `video_${i}`,
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: `key_${i}`,
          name: `Video ${i}`,
          site: 'YouTube',
          size: 720,
          type: 'Clip',
          official: true,
          published_at: '2023-01-01T00:00:00.000Z'
        });
      }
      
      // Add trailer at the end
      largeVideoArray.push(mockOfficialTrailerVideo);

      const mockVideosResponse = {
        id: 123,
        results: largeVideoArray
      };

      mockFetchMovieVideos.mockResolvedValueOnce(mockVideosResponse);
      mockGetTrailerUrl.mockReturnValueOnce(mockTrailerUrl);

      const startTime = Date.now();
      const result = await getMovieTrailer(mockMovieId);
      const endTime = Date.now();

      expect(result).toBe(mockTrailerUrl);
      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
    });

    it('should handle unexpected data types gracefully', async () => {
      const malformedResponse = {
        id: 123,
        results: null as any
      };

      mockFetchMovieVideos.mockResolvedValueOnce(malformedResponse);

      const result = await getMovieTrailer(mockMovieId);

      expect(result).toBeNull();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('No videos available for movie 123')
      );
    });
  });
});