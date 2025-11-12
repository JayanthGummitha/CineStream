import {
  fetchMovieVideos,
  getTrailerUrl,
  getVidstackTrailerUrl,
  TMDBVideo,
  TMDBVideosResponse,
} from "../tmdb";
import { getMovieTrailer, getVidstackMovieTrailer } from "../movie-service";

// Mock fetch for Node.js environment
global.fetch = jest.fn();

// Helper function for test failures
const fail = (message?: string): never => {
  throw new Error(message || "Test failed");
};

describe("TMDB Trailer API Integration Tests", () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    mockFetch.mockReset();
  });

  // Test movie IDs - using well-known movies that should have trailers
  const MOVIES_WITH_TRAILERS = [
    550, // Fight Club (1999) - Classic movie with trailers
    27205, // Inception (2010) - Popular movie with multiple trailers
    157336, // Interstellar (2014) - Recent movie with official trailers
    299536, // Avengers: Infinity War (2018) - Blockbuster with many trailers
  ];

  const MOVIES_WITHOUT_TRAILERS = [
    999999, // Non-existent movie ID
    1000000, // Another non-existent movie ID
  ];

  const INVALID_MOVIE_IDS = [
    -1, // Negative ID
    0, // Zero ID
    "abc", // String ID (will be parsed as NaN)
    null, // Null ID
    undefined, // Undefined ID
  ];

  // Increase timeout for API calls
  const API_TIMEOUT = 15000;

  describe("fetchMovieVideos - Valid Movie IDs with Trailers", () => {
    test.each(MOVIES_WITH_TRAILERS)(
      "should fetch videos for movie ID %d and return valid structure",
      async (movieId) => {
        // Mock successful API response with realistic trailer data
        const mockResponse = {
          id: movieId,
          results: [
            {
              id: "trailer1",
              key: "dQw4w9WgXcQ", // Valid YouTube video ID format
              name: "Official Trailer",
              site: "YouTube",
              type: "Trailer",
              official: true,
              published_at: "2023-01-01T00:00:00.000Z",
            },
            {
              id: "trailer2",
              key: "jNQXAC9IVRw", // Another valid YouTube video ID
              name: "Teaser Trailer",
              site: "YouTube",
              type: "Trailer",
              official: false,
              published_at: "2022-12-01T00:00:00.000Z",
            },
          ],
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        } as Response);

        const response = await fetchMovieVideos(movieId);

        // Verify response structure
        expect(response).toBeDefined();
        expect(typeof response).toBe("object");
        expect(response.id).toBe(movieId);
        expect(Array.isArray(response.results)).toBe(true);

        // Should have at least some videos
        expect(response.results.length).toBeGreaterThan(0);

        // Verify video object structure
        const video = response.results[0];
        expect(video).toHaveProperty("id");
        expect(video).toHaveProperty("key");
        expect(video).toHaveProperty("name");
        expect(video).toHaveProperty("site");
        expect(video).toHaveProperty("type");
        expect(video).toHaveProperty("official");
        expect(video).toHaveProperty("published_at");

        // Verify data types
        expect(typeof video.id).toBe("string");
        expect(typeof video.key).toBe("string");
        expect(typeof video.name).toBe("string");
        expect(typeof video.site).toBe("string");
        expect(typeof video.type).toBe("string");
        expect(typeof video.official).toBe("boolean");

        console.log(`✓ Movie ${movieId} has ${response.results.length} videos`);
      },
      API_TIMEOUT
    );

    test(
      "should find YouTube trailers in popular movies",
      async () => {
        // Mock response with multiple video types
        const mockResponse = {
          id: 27205,
          results: [
            {
              id: "trailer1",
              key: "YoHD9XEInc0", // Inception trailer
              name: "Official Trailer",
              site: "YouTube",
              type: "Trailer",
              official: true,
              published_at: "2010-05-01T00:00:00.000Z",
            },
            {
              id: "teaser1",
              key: "Qwe1234567A",
              name: "Teaser",
              site: "YouTube",
              type: "Teaser",
              official: true,
              published_at: "2010-03-01T00:00:00.000Z",
            },
            {
              id: "trailer2",
              key: "Abc9876543Z",
              name: "International Trailer",
              site: "YouTube",
              type: "Trailer",
              official: false,
              published_at: "2010-06-01T00:00:00.000Z",
            },
          ],
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        } as Response);

        const response = await fetchMovieVideos(27205);

        const youtubeTrailers = response.results.filter(
          (video) => video.type === "Trailer" && video.site === "YouTube"
        );

        expect(youtubeTrailers.length).toBeGreaterThan(0);

        // Verify YouTube video key format
        youtubeTrailers.forEach((trailer) => {
          expect(trailer.key).toMatch(/^[a-zA-Z0-9_-]{11}$/);
          expect(trailer.site).toBe("YouTube");
          expect(trailer.type).toBe("Trailer");
        });

        console.log(
          `✓ Found ${youtubeTrailers.length} YouTube trailers for Inception`
        );
      },
      API_TIMEOUT
    );
  });

  describe("fetchMovieVideos - Movies Without Trailers", () => {
    test.each(MOVIES_WITHOUT_TRAILERS)(
      "should handle non-existent movie ID %d gracefully",
      async (movieId) => {
        // Mock 404 response for non-existent movie
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: "Not Found",
          text: async () => "Movie not found",
        } as Response);

        try {
          await fetchMovieVideos(movieId);
          fail(
            `Expected fetchMovieVideos to throw for non-existent movie ID: ${movieId}`
          );
        } catch (error) {
          // Should throw a meaningful error for non-existent movies
          expect(error).toBeInstanceOf(Error);
          if (error instanceof Error) {
            expect(error.message).toContain("not found");
            console.log(`✓ Movie ${movieId} correctly threw 404 error`);
          }
        }
      },
      API_TIMEOUT
    );
  });

  describe("fetchMovieVideos - Invalid Movie IDs", () => {
    test.each(INVALID_MOVIE_IDS)(
      "should handle invalid movie ID %s with proper error",
      async (invalidId) => {
        // Don't mock fetch for invalid IDs - let the validation catch them
        try {
          await fetchMovieVideos(invalidId as any);

          // If it doesn't throw, fail the test
          fail(
            `Expected fetchMovieVideos to throw for invalid ID: ${invalidId}`
          );
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          if (error instanceof Error) {
            expect(error.message).toBeDefined();

            // Should contain meaningful error message
            expect(
              error.message.includes("Invalid movie ID") ||
                error.message.includes("not found") ||
                error.message.includes("Failed to fetch") ||
                error.message.includes("TMDB API error")
            ).toBe(true);

            console.log(
              `✓ Invalid ID ${invalidId} correctly threw error: ${error.message}`
            );
          }
        }
      },
      API_TIMEOUT
    );
  });

  describe("Trailer URL Construction and Format Validation", () => {
    test(
      "should generate valid YouTube embed URLs from TMDB data",
      async () => {
        const mockResponse = {
          id: 27205,
          results: [
            {
              id: "trailer1",
              key: "YoHD9XEInc0", // Inception official trailer
              name: "Official Trailer",
              site: "YouTube",
              type: "Trailer",
              official: true,
              published_at: "2010-05-01T00:00:00.000Z",
            },
          ],
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        } as Response);

        const response = await fetchMovieVideos(27205);
        const embedUrl = getTrailerUrl(response.results);

        expect(embedUrl).toBeDefined();
        expect(embedUrl).toMatch(
          /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]{11}$/
        );

        // Verify it's a valid URL
        expect(() => new URL(embedUrl!)).not.toThrow();

        // Extract and verify video ID
        const videoId = embedUrl!.split("/").pop();
        expect(videoId).toHaveLength(11);
        expect(videoId).toMatch(/^[a-zA-Z0-9_-]{11}$/);

        console.log(`✓ Generated valid embed URL: ${embedUrl}`);
      },
      API_TIMEOUT
    );

    test(
      "should generate valid Vidstack URLs from TMDB data",
      async () => {
        const mockResponse = {
          id: 27205,
          results: [
            {
              id: "trailer1",
              key: "YoHD9XEInc0",
              name: "Official Trailer",
              site: "YouTube",
              type: "Trailer",
              official: true,
              published_at: "2010-05-01T00:00:00.000Z",
            },
          ],
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        } as Response);

        const response = await fetchMovieVideos(27205);
        const vidstackUrl = getVidstackTrailerUrl(response.results);

        expect(vidstackUrl).toBeDefined();
        expect(vidstackUrl).toMatch(/^youtube\/[a-zA-Z0-9_-]{11}$/);

        // Extract and verify video ID
        const videoId = vidstackUrl!.split("/").pop();
        expect(videoId).toHaveLength(11);
        expect(videoId).toMatch(/^[a-zA-Z0-9_-]{11}$/);

        console.log(`✓ Generated valid Vidstack URL: ${vidstackUrl}`);
      },
      API_TIMEOUT
    );

    test(
      "should generate matching video IDs for both URL formats",
      async () => {
        const mockResponse = {
          id: 299536,
          results: [
            {
              id: "trailer1",
              key: "QwievZ1Tx-8", // Avengers: Infinity War trailer
              name: "Official Trailer",
              site: "YouTube",
              type: "Trailer",
              official: true,
              published_at: "2018-03-01T00:00:00.000Z",
            },
          ],
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        } as Response);

        const response = await fetchMovieVideos(299536);

        const embedUrl = getTrailerUrl(response.results);
        const vidstackUrl = getVidstackTrailerUrl(response.results);

        expect(embedUrl).toBeDefined();
        expect(vidstackUrl).toBeDefined();

        const embedVideoId = embedUrl!.split("/").pop();
        const vidstackVideoId = vidstackUrl!.split("/").pop();

        expect(embedVideoId).toBe(vidstackVideoId);

        console.log(`✓ Both URLs use same video ID: ${embedVideoId}`);
      },
      API_TIMEOUT
    );
  });

  describe("Movie Service Integration", () => {
    test(
      "should fetch trailer through movie service for valid movie",
      async () => {
        const mockResponse = {
          id: 27205,
          results: [
            {
              id: "trailer1",
              key: "YoHD9XEInc0",
              name: "Official Trailer",
              site: "YouTube",
              type: "Trailer",
              official: true,
              published_at: "2010-05-01T00:00:00.000Z",
            },
          ],
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        } as Response);

        const trailerUrl = await getMovieTrailer("27205");

        expect(trailerUrl).toBeDefined();
        expect(trailerUrl).toMatch(
          /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]{11}$/
        );

        console.log(`✓ Movie service returned trailer: ${trailerUrl}`);
      },
      API_TIMEOUT
    );

    test(
      "should fetch Vidstack trailer through movie service for valid movie",
      async () => {
        const mockResponse = {
          id: 27205,
          results: [
            {
              id: "trailer1",
              key: "YoHD9XEInc0",
              name: "Official Trailer",
              site: "YouTube",
              type: "Trailer",
              official: true,
              published_at: "2010-05-01T00:00:00.000Z",
            },
          ],
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        } as Response);

        const trailerUrl = await getVidstackMovieTrailer("27205");

        expect(trailerUrl).toBeDefined();
        expect(trailerUrl).toMatch(/^youtube\/[a-zA-Z0-9_-]{11}$/);

        console.log(`✓ Movie service returned Vidstack trailer: ${trailerUrl}`);
      },
      API_TIMEOUT
    );

    test(
      "should handle non-existent movie gracefully in movie service",
      async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: "Not Found",
          text: async () => "Movie not found",
        } as Response);

        const trailerUrl = await getMovieTrailer("999999");
        expect(trailerUrl).toBeNull();

        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: "Not Found",
          text: async () => "Movie not found",
        } as Response);

        const vidstackUrl = await getVidstackMovieTrailer("999999");
        expect(vidstackUrl).toBeNull();

        console.log("✓ Movie service correctly handled non-existent movie");
      },
      API_TIMEOUT
    );

    test(
      "should handle invalid movie ID gracefully in movie service",
      async () => {
        const trailerUrl = await getMovieTrailer("invalid");
        expect(trailerUrl).toBeNull();

        const vidstackUrl = await getVidstackMovieTrailer("invalid");
        expect(vidstackUrl).toBeNull();

        console.log("✓ Movie service correctly handled invalid movie ID");
      },
      API_TIMEOUT
    );
  });

  describe("Error Handling and Resilience", () => {
    test(
      "should handle API rate limiting gracefully",
      async () => {
        // Mock rate limiting response
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: "Too Many Requests",
          text: async () => "Rate limit exceeded",
        } as Response);

        try {
          await fetchMovieVideos(550);
          fail("Expected rate limiting error");
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          if (error instanceof Error) {
            expect(error.message).toContain("rate limit");
            console.log(`✓ Rate limiting handled gracefully: ${error.message}`);
          }
        }
      },
      API_TIMEOUT
    );

    test(
      "should handle network failures gracefully",
      async () => {
        // Mock network error
        mockFetch.mockRejectedValueOnce(new Error("Network error"));

        try {
          await fetchMovieVideos(550);
          fail("Expected network error");
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          if (error instanceof Error) {
            expect(error.message).toBeDefined();
            console.log(`✓ Network error handled gracefully: ${error.message}`);
          }
        }
      },
      API_TIMEOUT
    );

    test(
      "should validate YouTube embed compatibility",
      async () => {
        const mockResponse = {
          id: 157336,
          results: [
            {
              id: "trailer1",
              key: "zSWdZVtXT7E", // Interstellar trailer
              name: "Official Trailer",
              site: "YouTube",
              type: "Trailer",
              official: true,
              published_at: "2014-05-01T00:00:00.000Z",
            },
          ],
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        } as Response);

        const response = await fetchMovieVideos(157336);
        const embedUrl = getTrailerUrl(response.results);

        expect(embedUrl).toBeDefined();

        // Test that the URL would work in an iframe
        const url = new URL(embedUrl!);
        expect(url.hostname).toBe("www.youtube.com");
        expect(url.pathname).toMatch(/^\/embed\/[a-zA-Z0-9_-]{11}$/);

        // Verify no query parameters that might break embedding
        expect(url.search).toBe("");

        console.log(`✓ YouTube embed URL is compatible: ${embedUrl}`);
      },
      API_TIMEOUT
    );
  });

  describe("Data Quality and Consistency", () => {
    test(
      "should prioritize official trailers when available",
      async () => {
        const mockResponse = {
          id: 299536,
          results: [
            {
              id: "trailer1",
              key: "QwievZ1Tx-8", // Official trailer
              name: "Official Trailer",
              site: "YouTube",
              type: "Trailer",
              official: true,
              published_at: "2018-03-01T00:00:00.000Z",
            },
            {
              id: "trailer2",
              key: "Abc1234567Z", // Non-official trailer
              name: "International Trailer",
              site: "YouTube",
              type: "Trailer",
              official: false,
              published_at: "2018-04-01T00:00:00.000Z",
            },
          ],
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        } as Response);

        const response = await fetchMovieVideos(299536);
        const embedUrl = getTrailerUrl(response.results);

        expect(embedUrl).toBeDefined();

        // The selected trailer should be from the official trailer
        const selectedVideoId = embedUrl!.split("/").pop();
        expect(selectedVideoId).toBe("QwievZ1Tx-8"); // Official trailer key

        console.log(`✓ Official trailer prioritized correctly`);
      },
      API_TIMEOUT
    );

    test(
      "should handle movies with multiple trailer types",
      async () => {
        const mockResponse = {
          id: 299536,
          results: [
            {
              id: "trailer1",
              key: "QwievZ1Tx-8",
              name: "Official Trailer",
              site: "YouTube",
              type: "Trailer",
              official: true,
              published_at: "2018-03-01T00:00:00.000Z",
            },
            {
              id: "teaser1",
              key: "Def9876543Y",
              name: "Teaser",
              site: "YouTube",
              type: "Teaser",
              official: true,
              published_at: "2018-02-01T00:00:00.000Z",
            },
            {
              id: "clip1",
              key: "Ghi5432109X",
              name: "Clip",
              site: "YouTube",
              type: "Clip",
              official: false,
              published_at: "2018-05-01T00:00:00.000Z",
            },
          ],
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        } as Response);

        const response = await fetchMovieVideos(299536);

        const videoTypes = [
          ...new Set(response.results.map((video) => video.type)),
        ];
        const videoSites = [
          ...new Set(response.results.map((video) => video.site)),
        ];

        console.log(`✓ Found video types: ${videoTypes.join(", ")}`);
        console.log(`✓ Found video sites: ${videoSites.join(", ")}`);

        // Should handle various video types gracefully
        expect(videoTypes.length).toBeGreaterThan(0);
        expect(videoSites.length).toBeGreaterThan(0);

        // Test that our functions handle mixed content correctly
        const embedUrl = getTrailerUrl(response.results);
        const vidstackUrl = getVidstackTrailerUrl(response.results);

        // Both should return the same result (should find the trailer, not teaser or clip)
        expect(embedUrl).toBeDefined();
        expect(vidstackUrl).toBeDefined();

        const embedVideoId = embedUrl!.split("/").pop();
        const vidstackVideoId = vidstackUrl!.split("/").pop();
        expect(embedVideoId).toBe(vidstackVideoId);
        expect(embedVideoId).toBe("QwievZ1Tx-8"); // Should select the trailer
      },
      API_TIMEOUT
    );
  });
});
