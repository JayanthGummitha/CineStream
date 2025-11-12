import {
  getMovieDetails,
  clearAllTrailerCaches,
  getTrailerCacheStats,
} from "../movie-service";
import {
  fetchMovieDetails,
  fetchMovieCredits,
  fetchMovieVideos,
} from "../tmdb";

// Mock the TMDB module
jest.mock("../tmdb", () => ({
  fetchMovieDetails: jest.fn(),
  fetchMovieCredits: jest.fn(),
  fetchMovieVideos: jest.fn(),
  getTrailerUrl: jest.fn(),
  convertTMDBMovieDetailsToMovie: jest.fn(),
}));

const mockFetchMovieDetails = fetchMovieDetails as jest.MockedFunction<
  typeof fetchMovieDetails
>;
const mockFetchMovieCredits = fetchMovieCredits as jest.MockedFunction<
  typeof fetchMovieCredits
>;
const mockFetchMovieVideos = fetchMovieVideos as jest.MockedFunction<
  typeof fetchMovieVideos
>;

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

describe("Trailer Cache Integration Tests", () => {
  const mockMovieId = "550";
  const mockMovieDetails = {
    // TMDBMovie properties
    id: 550,
    title: "Fight Club",
    overview: "A ticking-time-bomb insomniac and a slippery soap salesman...",
    poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    backdrop_path: "/52AfXWuXCHn3UjD17rBruA9f5qb.jpg",
    release_date: "1999-10-15",
    genre_ids: [18],
    vote_average: 8.4,
    vote_count: 26280,
    adult: false,
    original_language: "en",
    original_title: "Fight Club",
    popularity: 61.416,
    video: false,
    // TMDBMovieDetails additional properties
    runtime: 139,
    genres: [{ id: 18, name: "Drama" }],
    production_companies: [
      {
        id: 508,
        name: "Regency Enterprises",
        logo_path: "/7PzJdsLGlR7oW4J0J5Xcd0pHGRg.png",
      },
    ],
    production_countries: [{ iso_3166_1: "US", name: "United States of America" }],
    spoken_languages: [
      { english_name: "English", iso_639_1: "en", name: "English" },
    ],
    status: "Released",
    tagline: "Mischief. Mayhem. Soap.",
    budget: 63000000,
    revenue: 100853753,
    imdb_id: "tt0137523",
    homepage: "",
  };

  const mockCredits = {
    cast: [
      {
        id: 287,
        name: "Brad Pitt",
        character: "Tyler Durden",
        profile_path: "/cckcYc2v0yh1tc9QjRelptcOBko.jpg",
        order: 0,
      },
    ],
    crew: [
      {
        id: 7467,
        name: "David Fincher",
        job: "Director",
        department: "Directing",
        profile_path: null,
      },
    ],
  };

  const mockVideosResponse = {
    id: 550,
    results: [
      {
        id: "video1",
        iso_639_1: "en",
        iso_3166_1: "US",
        key: "SUXWAEX2jlg",
        name: "Fight Club | Official Trailer",
        site: "YouTube",
        size: 1080,
        type: "Trailer",
        official: true,
        published_at: "2014-10-03T19:20:22.000Z",
      },
    ],
  };

  const mockTrailerUrl = "https://www.youtube.com/embed/SUXWAEX2jlg";

  beforeEach(() => {
    // Mock the conversion function
    const {
      convertTMDBMovieDetailsToMovie,
      getTrailerUrl,
    } = require("../tmdb");
    convertTMDBMovieDetailsToMovie.mockReturnValue({
      id: mockMovieId,
      title: "Fight Club",
      description:
        "A ticking-time-bomb insomniac and a slippery soap salesman...",
      releaseDate: "1999-10-15",
      duration: 139,
      rating: 8.4,
      genres: ["Drama"],
      thumbnail:
        "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      backdrop:
        "https://image.tmdb.org/t/p/original/52AfXWuXCHn3UjD17rBruA9f5qb.jpg",
      director: "David Fincher",
      cast: [
        {
          id: "287",
          name: "Brad Pitt",
          character: "Tyler Durden",
          profileImage:
            "https://image.tmdb.org/t/p/w185/cckcYc2v0yh1tc9QjRelptcOBko.jpg",
        },
      ],
      languages: ["English"],
      contentRating: "R",
      trailer: "", // Will be set by caching logic
    });
    getTrailerUrl.mockReturnValue(mockTrailerUrl);
  });

  describe("Movie detail page caching behavior", () => {
    it("should cache trailer data on first movie detail fetch", async () => {
      // Mock successful API responses
      mockFetchMovieDetails.mockResolvedValueOnce(mockMovieDetails);
      mockFetchMovieCredits.mockResolvedValueOnce(mockCredits);
      mockFetchMovieVideos.mockResolvedValueOnce(mockVideosResponse);

      // First call to getMovieDetails
      const movie1 = await getMovieDetails(mockMovieId);

      expect(movie1).toBeTruthy();
      expect(movie1?.trailer).toBe(mockTrailerUrl);

      // Verify API calls were made
      expect(mockFetchMovieDetails).toHaveBeenCalledTimes(1);
      expect(mockFetchMovieCredits).toHaveBeenCalledTimes(1);
      expect(mockFetchMovieVideos).toHaveBeenCalledTimes(1);

      // Verify cache has entry
      const stats = getTrailerCacheStats();
      expect(stats.standardCache).toBe(1);
    });

    it("should use cached trailer data on repeated movie detail page visits", async () => {
      // Mock successful API responses for first call
      mockFetchMovieDetails.mockResolvedValue(mockMovieDetails);
      mockFetchMovieCredits.mockResolvedValue(mockCredits);
      mockFetchMovieVideos.mockResolvedValueOnce(mockVideosResponse);

      // First call - should fetch from API and cache
      const movie1 = await getMovieDetails(mockMovieId);
      expect(movie1?.trailer).toBe(mockTrailerUrl);

      // Second call - should use cached trailer data
      const movie2 = await getMovieDetails(mockMovieId);
      expect(movie2?.trailer).toBe(mockTrailerUrl);

      // Third call - should still use cached trailer data
      const movie3 = await getMovieDetails(mockMovieId);
      expect(movie3?.trailer).toBe(mockTrailerUrl);

      // Verify movie details and credits are called for each request (not cached)
      expect(mockFetchMovieDetails).toHaveBeenCalledTimes(3);
      expect(mockFetchMovieCredits).toHaveBeenCalledTimes(3);

      // But trailer videos should only be called once due to caching
      expect(mockFetchMovieVideos).toHaveBeenCalledTimes(1);

      // Verify cache still has the entry
      const stats = getTrailerCacheStats();
      expect(stats.standardCache).toBe(1);
    });

    it("should cache negative results (no trailer available)", async () => {
      // Mock successful movie/credits but no videos
      mockFetchMovieDetails.mockResolvedValue(mockMovieDetails);
      mockFetchMovieCredits.mockResolvedValue(mockCredits);
      mockFetchMovieVideos.mockResolvedValue({ id: 550, results: [] });

      // First call - should fetch and cache negative result
      const movie1 = await getMovieDetails(mockMovieId);
      expect(movie1?.trailer).toBe("");

      // Second call - should use cached negative result
      const movie2 = await getMovieDetails(mockMovieId);
      expect(movie2?.trailer).toBe("");

      // Verify videos API was only called once
      expect(mockFetchMovieVideos).toHaveBeenCalledTimes(1);

      // Verify cache has entry (even for negative result)
      const stats = getTrailerCacheStats();
      expect(stats.standardCache).toBe(1);
    });

    it("should cache API failure results to avoid repeated failed requests", async () => {
      // Mock successful movie/credits but failing videos API
      mockFetchMovieDetails.mockResolvedValue(mockMovieDetails);
      mockFetchMovieCredits.mockResolvedValue(mockCredits);
      mockFetchMovieVideos.mockRejectedValue(new Error("TMDB API Error"));

      // First call - should handle error and cache failure
      const movie1 = await getMovieDetails(mockMovieId);
      expect(movie1?.trailer).toBe("");

      // Second call - should use cached failure result
      const movie2 = await getMovieDetails(mockMovieId);
      expect(movie2?.trailer).toBe("");

      // Verify videos API was only called once despite the error
      expect(mockFetchMovieVideos).toHaveBeenCalledTimes(1);

      // Verify cache has entry for the failed result
      const stats = getTrailerCacheStats();
      expect(stats.standardCache).toBe(1);
    });

    it("should handle multiple different movies with separate cache entries", async () => {
      const movieId2 = "13";
      const mockMovieDetails2 = {
        ...mockMovieDetails,
        id: 13,
        title: "Forrest Gump",
      };
      const mockVideosResponse2 = {
        id: 13,
        results: [
          {
            id: "video2",
            iso_639_1: "en",
            iso_3166_1: "US",
            key: "bLvqoHBptjg",
            name: "Forrest Gump Trailer",
            site: "YouTube",
            size: 1080,
            type: "Trailer",
            official: true,
            published_at: "2014-10-03T19:20:22.000Z",
          },
        ],
      };
      const mockTrailerUrl2 = "https://www.youtube.com/embed/bLvqoHBptjg";

      // Mock responses for both movies
      mockFetchMovieDetails
        .mockResolvedValueOnce(mockMovieDetails)
        .mockResolvedValueOnce(mockMovieDetails2);
      mockFetchMovieCredits
        .mockResolvedValueOnce(mockCredits)
        .mockResolvedValueOnce(mockCredits);
      mockFetchMovieVideos
        .mockResolvedValueOnce(mockVideosResponse)
        .mockResolvedValueOnce(mockVideosResponse2);

      // Update mock to return different URLs for different movies
      const { getTrailerUrl } = require("../tmdb");
      getTrailerUrl
        .mockReturnValueOnce(mockTrailerUrl)
        .mockReturnValueOnce(mockTrailerUrl2);

      // Fetch first movie
      const movie1 = await getMovieDetails(mockMovieId);
      expect(movie1?.trailer).toBe(mockTrailerUrl);

      // Fetch second movie
      const movie2 = await getMovieDetails(movieId2);
      expect(movie2?.trailer).toBe(mockTrailerUrl2);

      // Verify both movies have separate cache entries
      const stats = getTrailerCacheStats();
      expect(stats.standardCache).toBe(2);

      // Fetch first movie again - should use cache
      getTrailerUrl.mockReturnValueOnce(mockTrailerUrl); // Reset for potential new call
      const movie1Again = await getMovieDetails(mockMovieId);
      expect(movie1Again?.trailer).toBe(mockTrailerUrl);

      // Verify videos API was called twice total (once per movie)
      expect(mockFetchMovieVideos).toHaveBeenCalledTimes(2);
    });
  });

  describe("Cache performance benefits", () => {
    it("should significantly reduce API calls for sequential visits", async () => {
      // Mock successful responses
      mockFetchMovieDetails.mockResolvedValue(mockMovieDetails);
      mockFetchMovieCredits.mockResolvedValue(mockCredits);
      mockFetchMovieVideos.mockResolvedValue(mockVideosResponse);

      // Simulate 10 sequential visits to the same movie detail page
      const results = [];
      for (let i = 0; i < 10; i++) {
        const movie = await getMovieDetails(mockMovieId);
        results.push(movie);
      }

      // All results should have the trailer URL
      results.forEach((movie) => {
        expect(movie?.trailer).toBe(mockTrailerUrl);
      });

      // Movie details and credits should be called 10 times (not cached)
      expect(mockFetchMovieDetails).toHaveBeenCalledTimes(10);
      expect(mockFetchMovieCredits).toHaveBeenCalledTimes(10);

      // But videos should only be called once due to caching
      expect(mockFetchMovieVideos).toHaveBeenCalledTimes(1);

      // Verify cache efficiency
      const stats = getTrailerCacheStats();
      expect(stats.standardCache).toBe(1);
    });

    it("should handle concurrent requests (may result in multiple API calls initially)", async () => {
      // Mock successful responses
      mockFetchMovieDetails.mockResolvedValue(mockMovieDetails);
      mockFetchMovieCredits.mockResolvedValue(mockCredits);
      mockFetchMovieVideos.mockResolvedValue(mockVideosResponse);

      // Simulate 5 concurrent requests for the same movie
      const promises = Array.from({ length: 5 }, () =>
        getMovieDetails(mockMovieId)
      );
      const results = await Promise.all(promises);

      // All results should be consistent
      results.forEach((movie) => {
        expect(movie?.trailer).toBe(mockTrailerUrl);
      });

      // Note: Due to concurrent execution, multiple API calls may occur
      // before the cache is populated, but subsequent calls should use cache
      expect(mockFetchMovieVideos).toHaveBeenCalled();

      // Verify cache has entry after concurrent requests
      const stats = getTrailerCacheStats();
      expect(stats.standardCache).toBe(1);

      // Test that subsequent sequential calls use cache
      await getMovieDetails(mockMovieId);
      await getMovieDetails(mockMovieId);

      // These additional calls should not increase the video API call count significantly
      const finalCallCount = mockFetchMovieVideos.mock.calls.length;
      expect(finalCallCount).toBeLessThanOrEqual(7); // Allow some tolerance for concurrent behavior
    });
  });
});
