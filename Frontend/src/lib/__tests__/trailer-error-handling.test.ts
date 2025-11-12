/**
 * Test suite for trailer error handling functionality
 * Tests various error scenarios to ensure graceful handling
 */

import { getMovieTrailer, getVidstackMovieTrailer } from '../movie-service';
import { getTrailerUrl, getVidstackTrailerUrl } from '../tmdb';

// Mock console methods to capture logs during testing
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

let logMessages: string[] = [];
let errorMessages: string[] = [];
let warnMessages: string[] = [];

beforeEach(() => {
  logMessages = [];
  errorMessages = [];
  warnMessages = [];
  
  console.log = jest.fn((...args) => {
    logMessages.push(args.join(' '));
  });
  
  console.error = jest.fn((...args) => {
    errorMessages.push(args.join(' '));
  });
  
  console.warn = jest.fn((...args) => {
    warnMessages.push(args.join(' '));
  });
});

afterEach(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

describe('Trailer Error Handling', () => {
  describe('getMovieTrailer', () => {
    test('should handle empty string movie ID', async () => {
      const result = await getMovieTrailer('');
      
      expect(result).toBeNull();
      expect(errorMessages.some(msg => msg.includes('Invalid movie ID provided'))).toBe(true);
    });

    test('should handle zero movie ID', async () => {
      const result = await getMovieTrailer('0');
      
      expect(result).toBeNull();
      expect(errorMessages.some(msg => msg.includes('Invalid movie ID format'))).toBe(true);
    });

    test('should handle negative movie ID', async () => {
      const result = await getMovieTrailer('-1');
      
      expect(result).toBeNull();
      expect(errorMessages.some(msg => msg.includes('Invalid movie ID format'))).toBe(true);
    });

    test('should handle non-numeric movie ID', async () => {
      const result = await getMovieTrailer('abc');
      
      expect(result).toBeNull();
      expect(errorMessages.some(msg => msg.includes('Invalid movie ID format'))).toBe(true);
    });

    test('should handle very large movie ID gracefully', async () => {
      const result = await getMovieTrailer('999999999');
      
      // Should return null without throwing
      expect(result).toBeNull();
      // Should log appropriate error messages
      expect(errorMessages.length).toBeGreaterThan(0);
    });

    test('should log appropriate messages for valid movie ID', async () => {
      // This test might fail if TMDB API is not accessible, but should not throw
      try {
        const result = await getMovieTrailer('550'); // Fight Club
        
        // Should either return a valid URL or null
        if (result !== null) {
          expect(typeof result).toBe('string');
          expect(result).toMatch(/youtube\.com\/embed\//);
        }
        
        // Should have logged the attempt
        expect(logMessages.some(msg => msg.includes('Fetching trailer for movie ID: 550'))).toBe(true);
      } catch (error) {
        // If API is not accessible, should still handle gracefully
        expect(errorMessages.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getVidstackMovieTrailer', () => {
    test('should handle invalid movie IDs gracefully', async () => {
      const invalidIds = ['', '0', '-1', 'abc'];
      
      for (const id of invalidIds) {
        const result = await getVidstackMovieTrailer(id);
        expect(result).toBeNull();
      }
      
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  describe('getTrailerUrl', () => {
    test('should handle null input', () => {
      const result = getTrailerUrl(null as any);
      
      expect(result).toBeNull();
      expect(warnMessages.some(msg => msg.includes('Invalid videos input'))).toBe(true);
    });

    test('should handle undefined input', () => {
      const result = getTrailerUrl(undefined as any);
      
      expect(result).toBeNull();
      expect(warnMessages.some(msg => msg.includes('Invalid videos input'))).toBe(true);
    });

    test('should handle empty array', () => {
      const result = getTrailerUrl([]);
      
      expect(result).toBeNull();
      expect(logMessages.some(msg => msg.includes('No videos available'))).toBe(true);
    });

    test('should handle array with invalid video objects', () => {
      const invalidVideos = [
        null,
        undefined,
        { type: 'Clip', site: 'YouTube', key: 'test123' },
        { type: 'Trailer', site: 'Vimeo', key: 'test123' },
        { type: 'Trailer', site: 'YouTube', key: '' },
        { type: 'Trailer', site: 'YouTube', key: 'invalid-key-format' }
      ];
      
      const result = getTrailerUrl(invalidVideos as any);
      
      expect(result).toBeNull();
      expect(logMessages.some(msg => msg.includes('No valid YouTube trailers found'))).toBe(true);
    });

    test('should handle valid trailer video', () => {
      const validVideos = [
        {
          type: 'Trailer',
          site: 'YouTube',
          key: 'dQw4w9WgXcQ', // Valid YouTube key format
          official: true
        }
      ];
      
      const result = getTrailerUrl(validVideos as any);
      
      expect(result).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
      expect(logMessages.some(msg => msg.includes('Using official trailer'))).toBe(true);
    });

    test('should prioritize official trailers', () => {
      const videos = [
        {
          type: 'Trailer',
          site: 'YouTube',
          key: 'unofficial1', // Non-official trailer
          official: false
        },
        {
          type: 'Trailer',
          site: 'YouTube',
          key: 'official123', // Official trailer
          official: true
        }
      ];
      
      const result = getTrailerUrl(videos as any);
      
      expect(result).toBe('https://www.youtube.com/embed/official123');
      expect(logMessages.some(msg => msg.includes('Using official trailer'))).toBe(true);
    });

    test('should fallback to non-official trailers', () => {
      const videos = [
        {
          type: 'Trailer',
          site: 'YouTube',
          key: 'fallback123', // Non-official trailer
          official: false
        }
      ];
      
      const result = getTrailerUrl(videos as any);
      
      expect(result).toBe('https://www.youtube.com/embed/fallback123');
      expect(logMessages.some(msg => msg.includes('Using fallback trailer'))).toBe(true);
    });
  });

  describe('getVidstackTrailerUrl', () => {
    test('should handle invalid inputs gracefully', () => {
      const invalidInputs = [null, undefined, [], 'not-an-array'];
      
      invalidInputs.forEach(input => {
        const result = getVidstackTrailerUrl(input as any);
        expect(result).toBeNull();
      });
    });

    test('should return correct Vidstack format', () => {
      const validVideos = [
        {
          type: 'Trailer',
          site: 'YouTube',
          key: 'dQw4w9WgXcQ',
          official: true
        }
      ];
      
      const result = getVidstackTrailerUrl(validVideos as any);
      
      expect(result).toBe('youtube/dQw4w9WgXcQ');
    });
  });

  describe('Error Logging', () => {
    test('should log errors with appropriate prefixes', async () => {
      await getMovieTrailer('invalid');
      
      // Check that error messages have appropriate service prefixes
      const hasServicePrefix = errorMessages.some(msg => 
        msg.includes('[Movie Trailer Service]') || 
        msg.includes('[TMDB API]') || 
        msg.includes('[Trailer Processing]')
      );
      
      expect(hasServicePrefix).toBe(true);
    });

    test('should log different error types appropriately', async () => {
      // Test various invalid inputs to trigger different error paths
      const testCases = ['', '0', 'abc', '999999999'];
      
      for (const testCase of testCases) {
        await getMovieTrailer(testCase);
      }
      
      // Should have logged validation errors
      expect(errorMessages.some(msg => msg.includes('Invalid movie ID'))).toBe(true);
    });
  });
});

describe('Error Recovery', () => {
  test('should not throw unhandled exceptions', async () => {
    const testCases = ['', '0', '-1', 'abc', '999999999'];
    
    // All these should complete without throwing
    const promises = testCases.map(id => getMovieTrailer(id));
    const results = await Promise.allSettled(promises);
    
    // All promises should be fulfilled (not rejected)
    results.forEach(result => {
      expect(result.status).toBe('fulfilled');
      if (result.status === 'fulfilled') {
        expect(result.value).toBeNull();
      }
    });
  });

  test('should handle concurrent requests gracefully', async () => {
    // Test multiple concurrent requests
    const promises = Array(5).fill(null).map(() => getMovieTrailer('550'));
    const results = await Promise.allSettled(promises);
    
    // All should complete without rejection
    results.forEach(result => {
      expect(result.status).toBe('fulfilled');
    });
  });
});