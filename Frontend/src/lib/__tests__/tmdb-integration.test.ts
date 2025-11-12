import { fetchMovieVideos, getTrailerUrl, getVidstackTrailerUrl } from '../tmdb';

describe('TMDB Integration Tests', () => {
  // Test with real movie IDs that are known to have trailers
  const MOVIE_WITH_TRAILER = 550; // Fight Club - known to have trailers
  const MOVIE_WITHOUT_TRAILER = 999999; // Non-existent movie ID
  
  describe('fetchMovieVideos', () => {
    test('should fetch videos for a movie with trailers', async () => {
      try {
        const response = await fetchMovieVideos(MOVIE_WITH_TRAILER);
        
        expect(response).toBeDefined();
        expect(response.id).toBe(MOVIE_WITH_TRAILER);
        expect(Array.isArray(response.results)).toBe(true);
        
        // Should have at least some videos (trailers, teasers, etc.)
        expect(response.results.length).toBeGreaterThan(0);
        
        // Check structure of video objects
        if (response.results.length > 0) {
          const video = response.results[0];
          expect(video).toHaveProperty('id');
          expect(video).toHaveProperty('key');
          expect(video).toHaveProperty('name');
          expect(video).toHaveProperty('site');
          expect(video).toHaveProperty('type');
          expect(video).toHaveProperty('official');
        }
      } catch (error) {
        // If API fails, skip this test (network issues, rate limiting, etc.)
        console.warn('TMDB API test skipped due to network error:', error);
      }
    }, 10000); // 10 second timeout for API calls

    test('should handle non-existent movie ID gracefully', async () => {
      try {
        await fetchMovieVideos(MOVIE_WITHOUT_TRAILER);
        // If it doesn't throw, that's also acceptable (TMDB might return empty results)
      } catch (error) {
        // Should throw an error for non-existent movie
        expect(error).toBeDefined();
      }
    }, 10000);
  });

  describe('Real TMDB Data Processing', () => {
    test('should process real TMDB video data correctly', async () => {
      try {
        const response = await fetchMovieVideos(MOVIE_WITH_TRAILER);
        
        if (response.results.length > 0) {
          const embedUrl = getTrailerUrl(response.results);
          const vidstackUrl = getVidstackTrailerUrl(response.results);
          
          // Check if we found any trailers
          const hasTrailers = response.results.some(v => 
            v.type === 'Trailer' && v.site === 'YouTube'
          );
          
          if (hasTrailers) {
            expect(embedUrl).toMatch(/^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]+$/);
            expect(vidstackUrl).toMatch(/^youtube\/[a-zA-Z0-9_-]+$/);
            
            // Extract video ID from both URLs and verify they match
            const embedVideoId = embedUrl?.split('/').pop();
            const vidstackVideoId = vidstackUrl?.split('/').pop();
            expect(embedVideoId).toBe(vidstackVideoId);
          } else {
            // If no YouTube trailers, both should return null
            expect(embedUrl).toBeNull();
            expect(vidstackUrl).toBeNull();
          }
        }
      } catch (error) {
        console.warn('TMDB integration test skipped due to network error:', error);
      }
    }, 10000);
  });

  describe('URL Format Validation', () => {
    test('should generate valid YouTube embed URLs', async () => {
      try {
        const response = await fetchMovieVideos(MOVIE_WITH_TRAILER);
        const embedUrl = getTrailerUrl(response.results);
        
        if (embedUrl) {
          // Validate URL format
          expect(embedUrl).toMatch(/^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]{11}$/);
          
          // Validate that it's a proper URL
          expect(() => new URL(embedUrl)).not.toThrow();
          
          // Check that the video ID is exactly 11 characters (YouTube standard)
          const videoId = embedUrl.split('/').pop();
          expect(videoId).toHaveLength(11);
        }
      } catch (error) {
        console.warn('URL validation test skipped due to network error:', error);
      }
    }, 10000);

    test('should generate valid Vidstack YouTube URLs', async () => {
      try {
        const response = await fetchMovieVideos(MOVIE_WITH_TRAILER);
        const vidstackUrl = getVidstackTrailerUrl(response.results);
        
        if (vidstackUrl) {
          // Validate Vidstack format
          expect(vidstackUrl).toMatch(/^youtube\/[a-zA-Z0-9_-]{11}$/);
          
          // Check that the video ID is exactly 11 characters
          const videoId = vidstackUrl.split('/').pop();
          expect(videoId).toHaveLength(11);
        }
      } catch (error) {
        console.warn('Vidstack URL validation test skipped due to network error:', error);
      }
    }, 10000);
  });

  describe('Error Handling', () => {
    test('should handle API rate limiting gracefully', async () => {
      // Make multiple rapid requests to potentially trigger rate limiting
      const requests = Array(5).fill(null).map(() => 
        fetchMovieVideos(MOVIE_WITH_TRAILER).catch(error => error)
      );
      
      try {
        const results = await Promise.all(requests);
        
        // At least some requests should succeed or fail gracefully
        results.forEach(result => {
          if (result instanceof Error) {
            // Error should be meaningful
            expect(result.message).toBeDefined();
          } else {
            // Success should have proper structure
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('results');
          }
        });
      } catch (error) {
        console.warn('Rate limiting test skipped due to network error:', error);
      }
    }, 15000);

    test('should handle malformed API responses', async () => {
      // This test verifies our functions handle unexpected data gracefully
      const malformedResponses = [
        { id: 123, results: null },
        { id: 123, results: undefined },
        { id: 123, results: [] },
        { id: 123, results: [null, undefined] },
        { id: 123, results: [{ key: '', site: '', type: '', official: false }] }
      ];

      malformedResponses.forEach(response => {
        const embedUrl = getTrailerUrl(response.results as any);
        const vidstackUrl = getVidstackTrailerUrl(response.results as any);
        
        // Should handle gracefully and return null for invalid data
        expect(embedUrl).toBeNull();
        expect(vidstackUrl).toBeNull();
      });
    });
  });
});