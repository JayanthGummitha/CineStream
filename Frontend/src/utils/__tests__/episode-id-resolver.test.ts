/**
 * Unit tests for Episode ID Resolution Utility
 */

import {
  parseEpisodeId,
  generateEpisodeIdVariants,
  findEpisodeWithIdResolution,
  normalizeEpisodeMetadataId,
  validateEpisodeIdConsistency,
  type ParsedEpisodeId,
  type EpisodeMatchResult
} from '../episode-id-resolver';
import { Episode } from '@/types';
import { EpisodeMetadata } from '@/lib/episode-metadata';

// Mock episode data
const mockEpisodeList: Episode[] = [
  {
    id: '157239-s1-e1',
    title: 'Episode 1: Pilot',
    description: 'The beginning',
    episodeNumber: 1,
    duration: 45,
    thumbnail: '/thumb1.jpg',
    releaseDate: '2024-01-01',
    src: '/video1.mp4'
  },
  {
    id: '157239-s1-e2',
    title: 'Episode 2: Discovery',
    description: 'New worlds',
    episodeNumber: 2,
    duration: 44,
    thumbnail: '/thumb2.jpg',
    releaseDate: '2024-01-08',
    src: '/video2.mp4'
  },
  {
    id: '157239-s1-e3',
    title: 'Episode 3: Revelations',
    description: 'Shocking truths',
    episodeNumber: 3,
    duration: 43,
    thumbnail: '/thumb3.jpg',
    releaseDate: '2024-01-15',
    src: '/video3.mp4'
  }
];

const mockEpisodeMetadata: EpisodeMetadata = {
  id: 'episode-3',
  title: 'Revelations',
  description: 'Shocking truths are revealed',
  thumbnail: '/thumbnails/episode-3.jpg',
  src: '/videos/episode-3.mp4',
  introStart: 0,
  introEnd: 38,
  duration: 2580,
  seriesId: 'series-1',
  seasonNumber: 1,
  episodeNumber: 3
};

describe('parseEpisodeId', () => {
  it('should parse TMDB format episode IDs correctly', () => {
    const result = parseEpisodeId('157239-s1-e3');
    
    expect(result).toEqual({
      format: 'tmdb',
      seriesId: '157239',
      seasonNumber: 1,
      episodeNumber: 3,
      originalId: '157239-s1-e3'
    });
  });

  it('should parse metadata service format episode IDs correctly', () => {
    const result = parseEpisodeId('episode-3');
    
    expect(result).toEqual({
      format: 'metadata',
      episodeNumber: 3,
      originalId: 'episode-3'
    });
  });

  it('should handle unknown format episode IDs', () => {
    const result = parseEpisodeId('unknown-format-123');
    
    expect(result).toEqual({
      format: 'unknown',
      originalId: 'unknown-format-123'
    });
  });

  it('should handle invalid inputs', () => {
    expect(parseEpisodeId('')).toEqual({
      format: 'unknown',
      originalId: ''
    });

    expect(parseEpisodeId(null as any)).toEqual({
      format: 'unknown',
      originalId: ''
    });
  });
});

describe('generateEpisodeIdVariants', () => {
  it('should generate variants for metadata format ID', () => {
    const variants = generateEpisodeIdVariants('episode-3', {
      seriesId: '157239',
      seasonNumber: 1
    });

    expect(variants).toContain('episode-3'); // Original
    expect(variants).toContain('157239-s1-e3'); // TMDB format
  });

  it('should generate variants for TMDB format ID', () => {
    const variants = generateEpisodeIdVariants('157239-s1-e3');

    expect(variants).toContain('157239-s1-e3'); // Original
    expect(variants).toContain('episode-3'); // Metadata format
  });

  it('should infer series ID from episode list', () => {
    const variants = generateEpisodeIdVariants('episode-2', {
      seasonNumber: 1,
      episodeList: mockEpisodeList
    });

    expect(variants).toContain('episode-2'); // Original
    expect(variants).toContain('157239-s1-e2'); // Inferred from episode list
  });

  it('should handle unknown format IDs', () => {
    const variants = generateEpisodeIdVariants('unknown-format');

    expect(variants).toEqual(['unknown-format']); // Only original
  });
});

describe('findEpisodeWithIdResolution', () => {
  it('should find episode with exact ID match', () => {
    const result = findEpisodeWithIdResolution('157239-s1-e2', mockEpisodeList);

    expect(result).toEqual({
      found: true,
      episode: mockEpisodeList[1],
      index: 1,
      matchType: 'exact'
    });
  });

  it('should find episode using ID resolution', () => {
    const result = findEpisodeWithIdResolution('episode-3', mockEpisodeList, {
      seriesId: '157239',
      seasonNumber: 1
    });

    expect(result.found).toBe(true);
    expect(result.episode).toEqual(mockEpisodeList[2]);
    expect(result.index).toBe(2);
    expect(result.matchType).toBe('resolved');
  });

  it('should find episode using episode number matching', () => {
    const result = findEpisodeWithIdResolution('episode-1', mockEpisodeList);

    expect(result.found).toBe(true);
    expect(result.episode).toEqual(mockEpisodeList[0]);
    expect(result.index).toBe(0);
    expect(result.matchType).toBe('resolved');
  });

  it('should return not found for non-existent episode', () => {
    const result = findEpisodeWithIdResolution('episode-99', mockEpisodeList);

    expect(result).toEqual({
      found: false,
      matchType: 'none'
    });
  });

  it('should handle empty episode list', () => {
    const result = findEpisodeWithIdResolution('episode-1', []);

    expect(result).toEqual({
      found: false,
      matchType: 'none'
    });
  });
});

describe('normalizeEpisodeMetadataId', () => {
  it('should normalize episode metadata ID to match episode list format', () => {
    const normalized = normalizeEpisodeMetadataId(
      mockEpisodeMetadata,
      mockEpisodeList,
      {
        seriesId: '157239',
        seasonNumber: 1
      }
    );

    expect(normalized.id).toBe('157239-s1-e3');
    expect(normalized.title).toBe(mockEpisodeMetadata.title);
  });

  it('should return original metadata if no resolution needed', () => {
    const exactMatchMetadata = {
      ...mockEpisodeMetadata,
      id: '157239-s1-e3'
    };

    const normalized = normalizeEpisodeMetadataId(
      exactMatchMetadata,
      mockEpisodeList
    );

    expect(normalized).toEqual(exactMatchMetadata);
  });

  it('should return original metadata if episode not found', () => {
    const notFoundMetadata = {
      ...mockEpisodeMetadata,
      id: 'episode-99'
    };

    const normalized = normalizeEpisodeMetadataId(
      notFoundMetadata,
      mockEpisodeList
    );

    expect(normalized).toEqual(notFoundMetadata);
  });
});

describe('validateEpisodeIdConsistency', () => {
  it('should validate consistent episode IDs', () => {
    const result = validateEpisodeIdConsistency(
      mockEpisodeList,
      '157239-s1-e2'
    );

    expect(result.isConsistent).toBe(true);
    expect(result.recommendedAction).toBe('use_exact');
    expect(result.resolvedEpisode).toEqual(mockEpisodeList[1]);
  });

  it('should validate resolvable episode IDs', () => {
    const result = validateEpisodeIdConsistency(
      mockEpisodeList,
      'episode-3',
      {
        seriesId: '157239',
        seasonNumber: 1
      }
    );

    expect(result.isConsistent).toBe(false);
    expect(result.recommendedAction).toBe('use_resolved');
    expect(result.resolvedEpisode).toEqual(mockEpisodeList[2]);
  });

  it('should recommend fallback for unresolvable episode IDs', () => {
    const result = validateEpisodeIdConsistency(
      mockEpisodeList,
      'episode-99'
    );

    expect(result.isConsistent).toBe(false);
    expect(result.recommendedAction).toBe('use_fallback');
    expect(result.resolvedEpisode).toBeUndefined();
  });

  it('should recommend fallback for empty episode list', () => {
    const result = validateEpisodeIdConsistency(
      [],
      'episode-1'
    );

    expect(result.isConsistent).toBe(false);
    expect(result.recommendedAction).toBe('use_fallback');
  });
});