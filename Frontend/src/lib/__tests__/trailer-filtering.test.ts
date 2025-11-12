import { getTrailerUrl, getVidstackTrailerUrl, TMDBVideo } from '../tmdb';

describe('TMDB Trailer Filtering and URL Construction', () => {
  // Mock TMDB video data for testing various scenarios
  const mockVideos: TMDBVideo[] = [
    {
      id: '1',
      iso_639_1: 'en',
      iso_3166_1: 'US',
      key: 'official_trailer_key',
      name: 'Official Trailer',
      site: 'YouTube',
      size: 1080,
      type: 'Trailer',
      official: true,
      published_at: '2024-01-15T00:00:00.000Z'
    },
    {
      id: '2',
      iso_639_1: 'en',
      iso_3166_1: 'US',
      key: 'unofficial_trailer_key',
      name: 'Unofficial Trailer',
      site: 'YouTube',
      size: 720,
      type: 'Trailer',
      official: false,
      published_at: '2024-01-10T00:00:00.000Z'
    },
    {
      id: '3',
      iso_639_1: 'en',
      iso_3166_1: 'US',
      key: 'teaser_key',
      name: 'Teaser',
      site: 'YouTube',
      size: 1080,
      type: 'Teaser',
      official: true,
      published_at: '2024-01-05T00:00:00.000Z'
    },
    {
      id: '4',
      iso_639_1: 'en',
      iso_3166_1: 'US',
      key: 'vimeo_trailer_key',
      name: 'Vimeo Trailer',
      site: 'Vimeo',
      size: 1080,
      type: 'Trailer',
      official: true,
      published_at: '2024-01-12T00:00:00.000Z'
    }
  ];

  describe('getTrailerUrl', () => {
    test('should prioritize official YouTube trailers', () => {
      const result = getTrailerUrl(mockVideos);
      expect(result).toBe('https://www.youtube.com/embed/official_trailer_key');
    });

    test('should fallback to non-official YouTube trailers when no official trailer exists', () => {
      // Create videos without any official trailers
      const videosWithoutOfficial: TMDBVideo[] = [
        {
          id: '3',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'teaser_key',
          name: 'Teaser',
          site: 'YouTube',
          size: 1080,
          type: 'Teaser',
          official: true,
          published_at: '2024-01-05T00:00:00.000Z'
        },
        {
          id: '5',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'fallback_trailer_key',
          name: 'Fallback Trailer',
          site: 'YouTube',
          size: 720,
          type: 'Trailer',
          official: false,
          published_at: '2024-01-08T00:00:00.000Z'
        }
      ];

      const result = getTrailerUrl(videosWithoutOfficial);
      expect(result).toBe('https://www.youtube.com/embed/fallback_trailer_key');
    });

    test('should return null when no YouTube trailers are available', () => {
      const nonYouTubeVideos = mockVideos.filter(v => v.site !== 'YouTube');
      const result = getTrailerUrl(nonYouTubeVideos);
      expect(result).toBeNull();
    });

    test('should return null when no trailer type videos are available', () => {
      const nonTrailerVideos = mockVideos.filter(v => v.type !== 'Trailer');
      const result = getTrailerUrl(nonTrailerVideos);
      expect(result).toBeNull();
    });

    test('should return null for empty video array', () => {
      const result = getTrailerUrl([]);
      expect(result).toBeNull();
    });

    test('should handle videos with special characters in keys', () => {
      const specialKeyVideos: TMDBVideo[] = [
        {
          id: '6',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'abc-123_XYZ',
          name: 'Special Key Trailer',
          site: 'YouTube',
          size: 1080,
          type: 'Trailer',
          official: true,
          published_at: '2024-01-15T00:00:00.000Z'
        }
      ];

      const result = getTrailerUrl(specialKeyVideos);
      expect(result).toBe('https://www.youtube.com/embed/abc-123_XYZ');
    });

    test('should ignore non-YouTube sites even if they are official trailers', () => {
      const vimeoOnlyVideos = mockVideos.filter(v => v.site === 'Vimeo');
      const result = getTrailerUrl(vimeoOnlyVideos);
      expect(result).toBeNull();
    });
  });

  describe('getVidstackTrailerUrl', () => {
    test('should prioritize official YouTube trailers and return Vidstack format', () => {
      const result = getVidstackTrailerUrl(mockVideos);
      expect(result).toBe('youtube/official_trailer_key');
    });

    test('should fallback to non-official YouTube trailers in Vidstack format', () => {
      // Create videos without any official trailers
      const videosWithoutOfficial: TMDBVideo[] = [
        {
          id: '3',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'teaser_key',
          name: 'Teaser',
          site: 'YouTube',
          size: 1080,
          type: 'Teaser',
          official: true,
          published_at: '2024-01-05T00:00:00.000Z'
        },
        {
          id: '5',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'fallback_trailer_key',
          name: 'Fallback Trailer',
          site: 'YouTube',
          size: 720,
          type: 'Trailer',
          official: false,
          published_at: '2024-01-08T00:00:00.000Z'
        }
      ];

      const result = getVidstackTrailerUrl(videosWithoutOfficial);
      expect(result).toBe('youtube/fallback_trailer_key');
    });

    test('should return null when no YouTube trailers are available', () => {
      const nonYouTubeVideos = mockVideos.filter(v => v.site !== 'YouTube');
      const result = getVidstackTrailerUrl(nonYouTubeVideos);
      expect(result).toBeNull();
    });

    test('should return null for empty video array', () => {
      const result = getVidstackTrailerUrl([]);
      expect(result).toBeNull();
    });

    test('should handle videos with special characters in keys for Vidstack format', () => {
      const specialKeyVideos: TMDBVideo[] = [
        {
          id: '6',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'abc-123_XYZ',
          name: 'Special Key Trailer',
          site: 'YouTube',
          size: 1080,
          type: 'Trailer',
          official: true,
          published_at: '2024-01-15T00:00:00.000Z'
        }
      ];

      const result = getVidstackTrailerUrl(specialKeyVideos);
      expect(result).toBe('youtube/abc-123_XYZ');
    });
  });

  describe('URL Construction Edge Cases', () => {
    test('should handle multiple official trailers and select the first one', () => {
      const multipleOfficialVideos: TMDBVideo[] = [
        {
          id: '7',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'first_official_key',
          name: 'First Official Trailer',
          site: 'YouTube',
          size: 1080,
          type: 'Trailer',
          official: true,
          published_at: '2024-01-15T00:00:00.000Z'
        },
        {
          id: '8',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'second_official_key',
          name: 'Second Official Trailer',
          site: 'YouTube',
          size: 720,
          type: 'Trailer',
          official: true,
          published_at: '2024-01-20T00:00:00.000Z'
        }
      ];

      const embedResult = getTrailerUrl(multipleOfficialVideos);
      const vidstackResult = getVidstackTrailerUrl(multipleOfficialVideos);

      expect(embedResult).toBe('https://www.youtube.com/embed/first_official_key');
      expect(vidstackResult).toBe('youtube/first_official_key');
    });

    test('should handle mixed video types and only select trailers', () => {
      const mixedTypeVideos: TMDBVideo[] = [
        {
          id: '9',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'behind_scenes_key',
          name: 'Behind the Scenes',
          site: 'YouTube',
          size: 1080,
          type: 'Behind the Scenes',
          official: true,
          published_at: '2024-01-10T00:00:00.000Z'
        },
        {
          id: '10',
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
          id: '11',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'clip_key',
          name: 'Movie Clip',
          site: 'YouTube',
          size: 720,
          type: 'Clip',
          official: true,
          published_at: '2024-01-12T00:00:00.000Z'
        }
      ];

      const embedResult = getTrailerUrl(mixedTypeVideos);
      const vidstackResult = getVidstackTrailerUrl(mixedTypeVideos);

      expect(embedResult).toBe('https://www.youtube.com/embed/trailer_key');
      expect(vidstackResult).toBe('youtube/trailer_key');
    });

    test('should handle case-sensitive type and site matching', () => {
      const caseSensitiveVideos: TMDBVideo[] = [
        {
          id: '12',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'lowercase_trailer_key',
          name: 'Lowercase Trailer',
          site: 'youtube', // lowercase
          size: 1080,
          type: 'trailer', // lowercase
          official: true,
          published_at: '2024-01-15T00:00:00.000Z'
        },
        {
          id: '13',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'proper_trailer_key',
          name: 'Proper Case Trailer',
          site: 'YouTube',
          size: 1080,
          type: 'Trailer',
          official: true,
          published_at: '2024-01-15T00:00:00.000Z'
        }
      ];

      const embedResult = getTrailerUrl(caseSensitiveVideos);
      const vidstackResult = getVidstackTrailerUrl(caseSensitiveVideos);

      // Should only match the properly cased version
      expect(embedResult).toBe('https://www.youtube.com/embed/proper_trailer_key');
      expect(vidstackResult).toBe('youtube/proper_trailer_key');
    });
  });

  describe('Real-world TMDB Response Formats', () => {
    test('should handle typical TMDB movie video response structure', () => {
      // Simulating a real TMDB API response structure
      const realWorldVideos: TMDBVideo[] = [
        {
          id: '507f1f77bcf86cd799439011',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'dQw4w9WgXcQ',
          name: 'Official Trailer',
          site: 'YouTube',
          size: 1080,
          type: 'Trailer',
          official: true,
          published_at: '2024-01-15T10:30:00.000Z'
        },
        {
          id: '507f1f77bcf86cd799439012',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 'eBGIQ7ZuuiU',
          name: 'Teaser Trailer',
          site: 'YouTube',
          size: 720,
          type: 'Teaser',
          official: true,
          published_at: '2024-01-10T14:20:00.000Z'
        }
      ];

      const embedResult = getTrailerUrl(realWorldVideos);
      const vidstackResult = getVidstackTrailerUrl(realWorldVideos);

      expect(embedResult).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
      expect(vidstackResult).toBe('youtube/dQw4w9WgXcQ');
    });

    test('should handle empty or malformed video data gracefully', () => {
      const malformedVideos: any[] = [
        {
          // Missing required fields
          id: '1',
          name: 'Incomplete Video'
        },
        {
          // Null values
          id: '2',
          key: null,
          site: null,
          type: null,
          official: null
        }
      ];

      const embedResult = getTrailerUrl(malformedVideos as TMDBVideo[]);
      const vidstackResult = getVidstackTrailerUrl(malformedVideos as TMDBVideo[]);

      expect(embedResult).toBeNull();
      expect(vidstackResult).toBeNull();
    });

    test('should handle null and undefined inputs gracefully', () => {
      expect(getTrailerUrl(null as any)).toBeNull();
      expect(getTrailerUrl(undefined as any)).toBeNull();
      expect(getVidstackTrailerUrl(null as any)).toBeNull();
      expect(getVidstackTrailerUrl(undefined as any)).toBeNull();
    });

    test('should handle videos with empty or whitespace-only keys', () => {
      const videosWithEmptyKeys: TMDBVideo[] = [
        {
          id: '1',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: '',
          name: 'Empty Key Trailer',
          site: 'YouTube',
          size: 1080,
          type: 'Trailer',
          official: true,
          published_at: '2024-01-15T00:00:00.000Z'
        },
        {
          id: '2',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: '   ',
          name: 'Whitespace Key Trailer',
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
          key: 'valid_key',
          name: 'Valid Trailer',
          site: 'YouTube',
          size: 1080,
          type: 'Trailer',
          official: false,
          published_at: '2024-01-15T00:00:00.000Z'
        }
      ];

      const embedResult = getTrailerUrl(videosWithEmptyKeys);
      const vidstackResult = getVidstackTrailerUrl(videosWithEmptyKeys);

      // Should skip empty/whitespace keys and use the valid one
      expect(embedResult).toBe('https://www.youtube.com/embed/valid_key');
      expect(vidstackResult).toBe('youtube/valid_key');
    });

    test('should handle videos with non-string keys', () => {
      const videosWithInvalidKeys: any[] = [
        {
          id: '1',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: 123, // number instead of string
          name: 'Number Key Trailer',
          site: 'YouTube',
          size: 1080,
          type: 'Trailer',
          official: true,
          published_at: '2024-01-15T00:00:00.000Z'
        },
        {
          id: '2',
          iso_639_1: 'en',
          iso_3166_1: 'US',
          key: { invalid: 'object' }, // object instead of string
          name: 'Object Key Trailer',
          site: 'YouTube',
          size: 1080,
          type: 'Trailer',
          official: true,
          published_at: '2024-01-15T00:00:00.000Z'
        }
      ];

      const embedResult = getTrailerUrl(videosWithInvalidKeys as TMDBVideo[]);
      const vidstackResult = getVidstackTrailerUrl(videosWithInvalidKeys as TMDBVideo[]);

      expect(embedResult).toBeNull();
      expect(vidstackResult).toBeNull();
    });
  });
});