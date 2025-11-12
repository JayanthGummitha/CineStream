import { 
  getMovieTrailer, 
  getVidstackMovieTrailer, 
  getMovieDetails,
  clearAllTrailerCaches
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

// Mock console methods to capture error logs
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
let consoleErrorSpy: jest.SpyInstance;
let consoleLogSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  clearAllTrailerCaches();
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
  consoleLogSpy.mockRestore();
});

describe('Trailer Error Handling Scenarios', () => {
  let testCounter = 0;
  const getUniqueMovieId = () => `${++testCounter}`;

  describe('Network and API Errors', () => {
    describe('TMDB API Network Failures', () => {
      it('should handle network timeout errors', async () => {
        const timeoutError = new Error('Network timeout');
        timeoutError.name = 'TimeoutError';
        mockFetchMovieVideos.mockRejectedValueOnce(timeoutError);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to fetch videos for movie 123'),
          timeoutError
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Unexpected error: Network timeout')
        );
      });

      it('should handle DNS resolution failures', async () => {
        const dnsError = new Error('getaddrinfo ENOTFOUND api.themoviedb.org');
        mockFetchMovieVideos.mockRejectedValueOnce(dnsError);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to fetch videos for movie 123'),
          dnsError
        );
      });

      it('should handle connection refused errors', async () => {
        const connectionError = new Error('connect ECONNREFUSED 127.0.0.1:443');
        mockFetchMovieVideos.mockRejectedValueOnce(connectionError);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to fetch videos for movie 123'),
          connectionError
        );
      });

      it('should handle SSL certificate errors', async () => {
        const sslError = new Error('certificate verify failed');
        mockFetchMovieVideos.mockRejectedValueOnce(sslError);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to fetch videos for movie 123'),
          sslError
        );
      });
    });

    describe('TMDB API HTTP Status Errors', () => {
      it('should handle 404 Not Found errors', async () => {
        const notFoundError = new Error('TMDB API error for movie 123: Movie with ID 123 not found');
        mockFetchMovieVideos.mockRejectedValueOnce(notFoundError);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Movie 123 not found in TMDB')
        );
      });

      it('should handle 401 Unauthorized errors', async () => {
        const authError = new Error('TMDB API error for movie 123: TMDB API authentication failed - check API key');
        mockFetchMovieVideos.mockRejectedValueOnce(authError);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('TMDB API authentication failed')
        );
      });

      it('should handle 403 Forbidden errors', async () => {
        const forbiddenError = new Error('TMDB API error for movie 123: Access forbidden');
        mockFetchMovieVideos.mockRejectedValueOnce(forbiddenError);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to fetch videos for movie 123'),
          forbiddenError
        );
      });

      it('should handle 429 Rate Limit Exceeded errors', async () => {
        const rateLimitError = new Error('TMDB API error for movie 123: TMDB API rate limit exceeded - please try again later');
        mockFetchMovieVideos.mockRejectedValueOnce(rateLimitError);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('TMDB API rate limit exceeded')
        );
      });

      it('should handle 500 Internal Server Error', async () => {
        const serverError = new Error('TMDB API error for movie 123: TMDB API server error - please try again later');
        mockFetchMovieVideos.mockRejectedValueOnce(serverError);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('TMDB API server error')
        );
      });

      it('should handle 502 Bad Gateway errors', async () => {
        const badGatewayError = new Error('TMDB API error for movie 123: Bad Gateway');
        mockFetchMovieVideos.mockRejectedValueOnce(badGatewayError);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to fetch videos for movie 123'),
          badGatewayError
        );
      });

      it('should handle 503 Service Unavailable errors', async () => {
        const serviceUnavailableError = new Error('TMDB API error for movie 123: Service Unavailable');
        mockFetchMovieVideos.mockRejectedValueOnce(serviceUnavailableError);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to fetch videos for movie 123'),
          serviceUnavailableError
        );
      });
    });

    describe('JSON Parsing Errors', () => {
      it('should handle malformed JSON responses', async () => {
        const jsonError = new Error('Unexpected token < in JSON at position 0');
        mockFetchMovieVideos.mockRejectedValueOnce(jsonError);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to fetch videos for movie 123'),
          jsonError
        );
      });

      it('should handle empty response body', async () => {
        const emptyResponseError = new Error('Unexpected end of JSON input');
        mockFetchMovieVideos.mockRejectedValueOnce(emptyResponseError);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to fetch videos for movie 123'),
          emptyResponseError
        );
      });
    });
  });

  describe('Data Processing Errors', () => {
    describe('Trailer URL Construction Errors', () => {
      it('should handle errors in getTrailerUrl function', async () => {
        const mockVideosResponse = {
          id: 123,
          results: [{
            id: 'video1',
            key: 'test_key',
            site: 'YouTube',
            type: 'Trailer',
            official: true
          }] as TMDBVideo[]
        };

        mockFetchMovieVideos.mockResolvedValueOnce(mockVideosResponse);
        mockGetTrailerUrl.mockImplementationOnce(() => {
          throw new Error('URL construction failed');
        });

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Error processing trailer URL for movie 123'),
          expect.any(Error)
        );
      });

      it('should handle errors in getVidstackTrailerUrl function', async () => {
        const mockVideosResponse = {
          id: 123,
          results: [{
            id: 'video1',
            key: 'test_key',
            site: 'YouTube',
            type: 'Trailer',
            official: true
          }] as TMDBVideo[]
        };

        mockFetchMovieVideos.mockResolvedValueOnce(mockVideosResponse);
        mockGetVidstackTrailerUrl.mockImplementationOnce(() => {
          throw new Error('Vidstack URL construction failed');
        });

        const result = await getVidstackMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Error processing Vidstack trailer URL for movie 123'),
          expect.any(Error)
        );
      });

      it('should handle null or undefined video data', async () => {
        const mockVideosResponse = {
          id: 123,
          results: null as any
        };

        mockFetchMovieVideos.mockResolvedValueOnce(mockVideosResponse);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('No videos available for movie 123')
        );
      });

      it('should handle corrupted video data structures', async () => {
        const corruptedVideos = [
          { id: null, key: undefined, site: 123, type: [], official: 'true' },
          { malformed: 'data' },
          null,
          undefined
        ];

        const mockVideosResponse = {
          id: 123,
          results: corruptedVideos as any
        };

        mockFetchMovieVideos.mockResolvedValueOnce(mockVideosResponse);
        mockGetTrailerUrl.mockReturnValueOnce(null);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(mockGetTrailerUrl).toHaveBeenCalledWith(corruptedVideos);
      });
    });

    describe('Unexpected Data Types', () => {
      it('should handle non-array results field', async () => {
        const mockVideosResponse = {
          id: 123,
          results: 'not an array' as any
        };

        mockFetchMovieVideos.mockResolvedValueOnce(mockVideosResponse);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('No videos available for movie 123')
        );
      });

      it('should handle missing results field', async () => {
        const mockVideosResponse = {
          id: 123
          // results field missing
        } as any;

        mockFetchMovieVideos.mockResolvedValueOnce(mockVideosResponse);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('No videos available for movie 123')
        );
      });

      it('should handle completely malformed response structure', async () => {
        const malformedResponse = 'this is not a valid response' as any;

        mockFetchMovieVideos.mockResolvedValueOnce(malformedResponse);

        const result = await getMovieTrailer(mockMovieId);

        expect(result).toBeNull();
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('No videos available for movie 123')
        );
      });
    });
  });

  describe('Input Validation Errors', () => {
    describe('Invalid Movie IDs', () => {
      it('should handle null movie ID', async () => {
        const result = await getMovieTrailer(null as any);

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid movie ID provided')
        );
        expect(mockFetchMovieVideos).not.toHaveBeenCalled();
      });

      it('should handle undefined movie ID', async () => {
        const result = await getMovieTrailer(undefined as any);

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid movie ID provided')
        );
        expect(mockFetchMovieVideos).not.toHaveBeenCalled();
      });

      it('should handle empty string movie ID', async () => {
        const result = await getMovieTrailer('');

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid movie ID provided')
        );
        expect(mockFetchMovieVideos).not.toHaveBeenCalled();
      });

      it('should handle whitespace-only movie ID', async () => {
        const result = await getMovieTrailer('   \t\n  ');

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid movie ID provided')
        );
        expect(mockFetchMovieVideos).not.toHaveBeenCalled();
      });

      it('should handle non-numeric movie ID', async () => {
        const result = await getMovieTrailer('not-a-number');

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid movie ID format: not-a-number')
        );
        expect(mockFetchMovieVideos).not.toHaveBeenCalled();
      });

      it('should handle negative movie ID', async () => {
        const result = await getMovieTrailer('-123');

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid movie ID format: -123')
        );
        expect(mockFetchMovieVideos).not.toHaveBeenCalled();
      });

      it('should handle zero movie ID', async () => {
        const result = await getMovieTrailer('0');

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid movie ID format: 0')
        );
        expect(mockFetchMovieVideos).not.toHaveBeenCalled();
      });

      it('should handle floating point movie ID', async () => {
        const result = await getMovieTrailer('123.45');

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid movie ID format: 123.45')
        );
        expect(mockFetchMovieVideos).not.toHaveBeenCalled();
      });

      it('should handle movie ID with special characters', async () => {
        const result = await getMovieTrailer('123@#$');

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid movie ID format: 123@#$')
        );
        expect(mockFetchMovieVideos).not.toHaveBeenCalled();
      });
    });
  });

  describe('Error Recovery and Graceful Degradation', () => {
    describe('Partial Failure Scenarios', () => {
      it('should continue movie details fetch even if trailer fetch fails', async () => {
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

        mockFetchMovieDetails.mockResolvedValueOnce(mockMovieDetails);
        mockFetchMovieCredits.mockResolvedValueOnce(mockCredits);
        mockFetchMovieVideos.mockRejectedValueOnce(new Error('Trailer API Error'));

        const result = await getMovieDetails(mockMovieId);

        expect(result).toBeTruthy();
        expect(result?.title).toBe('Test Movie');
        expect(result?.trailer).toBe(''); // Trailer should be empty due to error
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to fetch trailer videos for movie 123'),
          expect.any(Error)
        );
      });

      it('should handle trailer processing errors without affecting movie data', async () => {
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

        const mockVideosResponse = {
          id: 123,
          results: [{
            id: 'video1',
            key: 'test_key',
            site: 'YouTube',
            type: 'Trailer',
            official: true
          }] as TMDBVideo[]
        };

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

        mockFetchMovieDetails.mockResolvedValueOnce(mockMovieDetails);
        mockFetchMovieCredits.mockResolvedValueOnce(mockCredits);
        mockFetchMovieVideos.mockResolvedValueOnce(mockVideosResponse);
        mockGetTrailerUrl.mockImplementationOnce(() => {
          throw new Error('Trailer processing error');
        });

        const result = await getMovieDetails(mockMovieId);

        expect(result).toBeTruthy();
        expect(result?.title).toBe('Test Movie');
        expect(result?.trailer).toBe(''); // Trailer should be empty due to processing error
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Critical error during trailer processing for movie 123'),
          expect.any(Error)
        );
      });
    });

    describe('Retry and Fallback Mechanisms', () => {
      it('should not retry failed API calls automatically', async () => {
        const apiError = new Error('API Error');
        mockFetchMovieVideos.mockRejectedValue(apiError);

        // Make multiple calls
        await getMovieTrailer(mockMovieId);
        await getMovieTrailer(mockMovieId);
        await getMovieTrailer(mockMovieId);

        // Should use cached failure result, not retry
        expect(mockFetchMovieVideos).toHaveBeenCalledTimes(1);
      });

      it('should handle cascading failures gracefully', async () => {
        // Simulate multiple levels of failure
        mockFetchMovieVideos.mockRejectedValueOnce(new Error('Network Error'));

        const result1 = await getMovieTrailer(mockMovieId);
        expect(result1).toBeNull();

        const result2 = await getVidstackMovieTrailer(mockMovieId);
        expect(result2).toBeNull();

        // Both should fail gracefully without throwing
        expect(consoleErrorSpy).toHaveBeenCalledTimes(4); // 2 calls × 2 error logs each
      });
    });
  });

  describe('Error Logging and Debugging', () => {
    it('should log comprehensive error information', async () => {
      const detailedError = new Error('Detailed API Error');
      detailedError.stack = 'Error: Detailed API Error\n    at test (test.js:1:1)';
      mockFetchMovieVideos.mockRejectedValueOnce(detailedError);

      await getMovieTrailer(mockMovieId);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to fetch videos for movie 123'),
        detailedError
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error name: Error')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error message: Detailed API Error')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error stack:'),
        expect.stringContaining('Error: Detailed API Error')
      );
    });

    it('should handle non-Error objects thrown as exceptions', async () => {
      const nonErrorObject = { message: 'Not an Error object', code: 500 };
      mockFetchMovieVideos.mockRejectedValueOnce(nonErrorObject);

      await getMovieTrailer(mockMovieId);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Non-Error object thrown:'),
        nonErrorObject
      );
    });

    it('should log different error contexts appropriately', async () => {
      // Test different error contexts
      const contexts = [
        { fn: getMovieTrailer, service: 'Movie Trailer Service' },
        { fn: getVidstackMovieTrailer, service: 'Vidstack Trailer Service' }
      ];

      for (const context of contexts) {
        jest.clearAllMocks();
        consoleErrorSpy.mockClear();
        
        const contextError = new Error('Context-specific error');
        mockFetchMovieVideos.mockRejectedValueOnce(contextError);

        await context.fn(mockMovieId);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining(context.service),
          expect.any(Error)
        );
      }
    });
  });
});