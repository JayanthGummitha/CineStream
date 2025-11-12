import { getTrailerUrl, getVidstackTrailerUrl, TMDBVideo } from '../tmdb';

describe('URL Construction with Various TMDB Response Formats', () => {
  describe('YouTube Video Key Formats', () => {
    test('should handle standard 11-character YouTube video IDs', () => {
      const videos: TMDBVideo[] = [
        {
          id: '1',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'dQw4w9WgXcQ', // Standard YouTube ID format
          name: 'Official Trailer',
          site: 'YouTube',
          size: 1080,
          type: 'Trailer',
          official: true,
          published_at: '2024-01-15T00:00:00.000Z'
        }
      ];

      const embedUrl = getTrailerUrl(videos);
      const vidstackUrl = getVidstackTrailerUrl(videos);

      expect(embedUrl).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
      expect(vidstackUrl).toBe('youtube/dQw4w9WgXcQ');
    });

    test('should handle YouTube video IDs with hyphens and underscores', () => {
      const videos: TMDBVideo[] = [
        {
          id: '1',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'abc-123_XYZ', // ID with special characters
          name: 'Official Trailer',
          site: 'YouTube',
          size: 1080,
          type: 'Trailer',
          official: true,
          published_at: '2024-01-15T00:00:00.000Z'
        }
      ];

      const embedUrl = getTrailerUrl(videos);
      const vidstackUrl = getVidstackTrailerUrl(videos);

      expect(embedUrl).toBe('https://www.youtube.com/embed/abc-123_XYZ');
      expect(vidstackUrl).toBe('youtube/abc-123_XYZ');
    });

    test('should handle longer YouTube video IDs', () => {
      const videos: TMDBVideo[] = [
        {
          id: '1',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'dQw4w9WgXcQ123', // Longer ID
          name: 'Official Trailer',
          site: 'YouTube',
          size: 1080,
          type: 'Trailer',
          official: true,
          published_at: '2024-01-15T00:00:00.000Z'
        }
      ];

      const embedUrl = getTrailerUrl(videos);
      const vidstackUrl = getVidstackTrailerUrl(videos);

      expect(embedUrl).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ123');
      expect(vidstackUrl).toBe('youtube/dQw4w9WgXcQ123');
    });
  });

  describe('TMDB Response Structure Variations', () => {
    test('should handle response with multiple video types', () => {
      const videos: TMDBVideo[] = [
        {
          id: '1',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'behind_scenes',
          name: 'Behind the Scenes',
          site: 'YouTube',
          size: 720,
          type: 'Behind the Scenes',
          official: true,
          published_at: '2024-01-10T00:00:00.000Z'
        },
        {
          id: '2',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'featurette_key',
          name: 'Featurette',
          site: 'YouTube',
          size: 1080,
          type: 'Featurette',
          official: true,
          published_at: '2024-01-12T00:00:00.000Z'
        },
        {
          id: '3',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'trailer_key',
          name: 'Official Trailer',
          site: 'YouTube',
          size: 1080,
          type: 'Trailer',
          official: true,
          published_at: '2024-01-15T00:00:00.000Z'
        },
        {
          id: '4',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'clip_key',
          name: 'Movie Clip',
          site: 'YouTube',
          size: 720,
          type: 'Clip',
          official: true,
          published_at: '2024-01-08T00:00:00.000Z'
        }
      ];

      const embedUrl = getTrailerUrl(videos);
      const vidstackUrl = getVidstackTrailerUrl(videos);

      // Should only select the trailer, not other video types
      expect(embedUrl).toBe('https://www.youtube.com/embed/trailer_key');
      expect(vidstackUrl).toBe('youtube/trailer_key');
    });

    test('should handle response with multiple sites', () => {
      const videos: TMDBVideo[] = [
        {
          id: '1',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'vimeo_trailer',
          name: 'Vimeo Trailer',
          site: 'Vimeo',
          size: 1080,
          type: 'Trailer',
          official: true,
          published_at: '2024-01-15T00:00:00.000Z'
        },
        {
          id: '2',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'youtube_trailer',
          name: 'YouTube Trailer',
          site: 'YouTube',
          size: 1080,
          type: 'Trailer',
          official: true,
          published_at: '2024-01-15T00:00:00.000Z'
        }
      ];

      const embedUrl = getTrailerUrl(videos);
      const vidstackUrl = getVidstackTrailerUrl(videos);

      // Should only select YouTube, not other sites
      expect(embedUrl).toBe('https://www.youtube.com/embed/youtube_trailer');
      expect(vidstackUrl).toBe('youtube/youtube_trailer');
    });

    test('should handle response with mixed official status', () => {
      const videos: TMDBVideo[] = [
        {
          id: '1',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'unofficial_first',
          name: 'Unofficial Trailer',
          site: 'YouTube',
          size: 720,
          type: 'Trailer',
          official: false,
          published_at: '2024-01-10T00:00:00.000Z'
        },
        {
          id: '2',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'official_second',
          name: 'Official Trailer',
          site: 'YouTube',
          size: 1080,
          type: 'Trailer',
          official: true,
          published_at: '2024-01-15T00:00:00.000Z'
        },
        {
          id: '3',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'unofficial_third',
          name: 'Another Unofficial Trailer',
          site: 'YouTube',
          size: 720,
          type: 'Trailer',
          official: false,
          published_at: '2024-01-12T00:00:00.000Z'
        }
      ];

      const embedUrl = getTrailerUrl(videos);
      const vidstackUrl = getVidstackTrailerUrl(videos);

      // Should prioritize official trailer over unofficial ones
      expect(embedUrl).toBe('https://www.youtube.com/embed/official_second');
      expect(vidstackUrl).toBe('youtube/official_second');
    });
  });

  describe('URL Format Validation', () => {
    test('should generate properly formatted YouTube embed URLs', () => {
      const videos: TMDBVideo[] = [
        {
          id: '1',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'test_video_id',
          name: 'Test Trailer',
          site: 'YouTube',
          size: 1080,
          type: 'Trailer',
          official: true,
          published_at: '2024-01-15T00:00:00.000Z'
        }
      ];

      const embedUrl = getTrailerUrl(videos);
      
      // Validate URL structure
      expect(embedUrl).toMatch(/^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]+$/);
      
      // Validate that it's a proper URL
      expect(() => new URL(embedUrl!)).not.toThrow();
      
      // Validate specific format
      expect(embedUrl).toBe('https://www.youtube.com/embed/test_video_id');
    });

    test('should generate properly formatted Vidstack URLs', () => {
      const videos: TMDBVideo[] = [
        {
          id: '1',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'test_video_id',
          name: 'Test Trailer',
          site: 'YouTube',
          size: 1080,
          type: 'Trailer',
          official: true,
          published_at: '2024-01-15T00:00:00.000Z'
        }
      ];

      const vidstackUrl = getVidstackTrailerUrl(videos);
      
      // Validate Vidstack format
      expect(vidstackUrl).toMatch(/^youtube\/[a-zA-Z0-9_-]+$/);
      
      // Validate specific format
      expect(vidstackUrl).toBe('youtube/test_video_id');
    });

    test('should handle URL encoding edge cases', () => {
      // Test with video IDs that might need encoding (though YouTube IDs typically don't)
      const videos: TMDBVideo[] = [
        {
          id: '1',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'abc123-_XYZ',
          name: 'Special Characters Trailer',
          site: 'YouTube',
          size: 1080,
          type: 'Trailer',
          official: true,
          published_at: '2024-01-15T00:00:00.000Z'
        }
      ];

      const embedUrl = getTrailerUrl(videos);
      const vidstackUrl = getVidstackTrailerUrl(videos);

      // Should handle special characters without encoding issues
      expect(embedUrl).toBe('https://www.youtube.com/embed/abc123-_XYZ');
      expect(vidstackUrl).toBe('youtube/abc123-_XYZ');
      
      // Should still be valid URLs
      expect(() => new URL(embedUrl!)).not.toThrow();
    });
  });

  describe('Priority and Fallback Logic', () => {
    test('should prioritize first official trailer when multiple exist', () => {
      const videos: TMDBVideo[] = [
        {
          id: '1',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'first_official',
          name: 'First Official Trailer',
          site: 'YouTube',
          size: 1080,
          type: 'Trailer',
          official: true,
          published_at: '2024-01-10T00:00:00.000Z'
        },
        {
          id: '2',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'second_official',
          name: 'Second Official Trailer',
          site: 'YouTube',
          size: 1080,
          type: 'Trailer',
          official: true,
          published_at: '2024-01-15T00:00:00.000Z'
        }
      ];

      const embedUrl = getTrailerUrl(videos);
      const vidstackUrl = getVidstackTrailerUrl(videos);

      // Should select the first official trailer found
      expect(embedUrl).toBe('https://www.youtube.com/embed/first_official');
      expect(vidstackUrl).toBe('youtube/first_official');
    });

    test('should fallback to first non-official trailer when no official exists', () => {
      const videos: TMDBVideo[] = [
        {
          id: '1',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'first_unofficial',
          name: 'First Unofficial Trailer',
          site: 'YouTube',
          size: 720,
          type: 'Trailer',
          official: false,
          published_at: '2024-01-10T00:00:00.000Z'
        },
        {
          id: '2',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'second_unofficial',
          name: 'Second Unofficial Trailer',
          site: 'YouTube',
          size: 1080,
          type: 'Trailer',
          official: false,
          published_at: '2024-01-15T00:00:00.000Z'
        }
      ];

      const embedUrl = getTrailerUrl(videos);
      const vidstackUrl = getVidstackTrailerUrl(videos);

      // Should select the first non-official trailer
      expect(embedUrl).toBe('https://www.youtube.com/embed/first_unofficial');
      expect(vidstackUrl).toBe('youtube/first_unofficial');
    });

    test('should ignore non-YouTube trailers in fallback', () => {
      const videos: TMDBVideo[] = [
        {
          id: '1',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'vimeo_trailer',
          name: 'Vimeo Trailer',
          site: 'Vimeo',
          size: 1080,
          type: 'Trailer',
          official: true,
          published_at: '2024-01-15T00:00:00.000Z'
        },
        {
          id: '2',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'dailymotion_trailer',
          name: 'Dailymotion Trailer',
          site: 'Dailymotion',
          size: 720,
          type: 'Trailer',
          official: false,
          published_at: '2024-01-12T00:00:00.000Z'
        }
      ];

      const embedUrl = getTrailerUrl(videos);
      const vidstackUrl = getVidstackTrailerUrl(videos);

      // Should return null since no YouTube trailers exist
      expect(embedUrl).toBeNull();
      expect(vidstackUrl).toBeNull();
    });
  });

  describe('Performance and Edge Cases', () => {
    test('should handle large arrays of videos efficiently', () => {
      // Create a large array with the trailer at the end
      const videos: TMDBVideo[] = [];
      
      // Add 100 non-trailer videos
      for (let i = 0; i < 100; i++) {
        videos.push({
          id: i.toString(),
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: `video_${i}`,
          name: `Video ${i}`,
          site: 'YouTube',
          size: 720,
          type: 'Clip',
          official: true,
          published_at: '2024-01-15T00:00:00.000Z'
        });
      }
      
      // Add the trailer at the end
      videos.push({
        id: '100',
        iso_639_1: 'en',
        iso_3166_1: 'US',
        key: 'trailer_key',
        name: 'Official Trailer',
        site: 'YouTube',
        size: 1080,
        type: 'Trailer',
        official: true,
        published_at: '2024-01-15T00:00:00.000Z'
      });

      const startTime = Date.now();
      const embedUrl = getTrailerUrl(videos);
      const vidstackUrl = getVidstackTrailerUrl(videos);
      const endTime = Date.now();

      // Should find the trailer efficiently
      expect(embedUrl).toBe('https://www.youtube.com/embed/trailer_key');
      expect(vidstackUrl).toBe('youtube/trailer_key');
      
      // Should complete in reasonable time (less than 100ms for 101 items)
      expect(endTime - startTime).toBeLessThan(100);
    });

    test('should handle videos with minimal required fields', () => {
      const videos: TMDBVideo[] = [
        {
          id: '1',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'minimal_trailer',
          name: 'Minimal Trailer',
          site: 'YouTube',
          size: 720,
          type: 'Trailer',
          official: true,
          published_at: '2024-01-15T00:00:00.000Z'
        }
      ];

      const embedUrl = getTrailerUrl(videos);
      const vidstackUrl = getVidstackTrailerUrl(videos);

      expect(embedUrl).toBe('https://www.youtube.com/embed/minimal_trailer');
      expect(vidstackUrl).toBe('youtube/minimal_trailer');
    });
  });
});