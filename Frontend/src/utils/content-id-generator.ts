/**
 * Content ID Generation Utility
 * 
 * Centralized utility for generating consistent content IDs across components.
 * Prevents ID mismatch issues between different parts of the application.
 * 
 * @module content-id-generator
 * @version 1.0.0
 */

import { Episode } from '@/types';
import { VideoPlayerEpisodeData } from './episode-transformation';

/**
 * Content ID generation result
 */
export interface ContentIdResult {
  contentId: string;
  seriesId?: string;
  source: 'episode-data' | 'fallback' | 'default';
  warnings?: string[];
}

/**
 * Content ID generation options
 */
export interface ContentIdOptions {
  contentType: 'movie' | 'tv' | 'episode';
  episodeData?: VideoPlayerEpisodeData | null;
  fallbackPrefix?: string;
  enableLogging?: boolean;
}

/**
 * Validates episode data structure
 * 
 * @param episodeData - Episode data to validate
 * @returns Validation result with details
 */
export function validateEpisodeData(episodeData: VideoPlayerEpisodeData | null): {
  isValid: boolean;
  hasEpisodes: boolean;
  hasValidIndex: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  if (!episodeData) {
    return {
      isValid: false,
      hasEpisodes: false,
      hasValidIndex: false,
      warnings: ['Episode data is null or undefined']
    };
  }

  const hasEpisodes = episodeData.episodes && episodeData.episodes.length > 0;
  if (!hasEpisodes) {
    warnings.push('Episodes array is empty or undefined');
  }

  const currentIndex = episodeData.currentEpisodeIndex ?? 0;
  const hasValidIndex = hasEpisodes && 
    currentIndex >= 0 && 
    currentIndex < episodeData.episodes!.length;

  if (!hasValidIndex && hasEpisodes) {
    warnings.push(`Invalid currentEpisodeIndex: ${currentIndex} (episodes length: ${episodeData.episodes!.length})`);
  }

  return {
    isValid: hasEpisodes && hasValidIndex,
    hasEpisodes,
    hasValidIndex,
    warnings
  };
}

/**
 * Extracts series ID from episode ID (TMDB format)
 * 
 * @param episodeId - Episode ID to extract series ID from
 * @returns Extracted series ID or null if not found
 */
export function extractSeriesId(episodeId: string): string | null {
  if (!episodeId || typeof episodeId !== 'string') {
    return null;
  }

  // TMDB format: {seriesId}-s{seasonNumber}-e{episodeNumber}
  const tmdbMatch = episodeId.match(/^(.+)-s\d+-e\d+$/);
  return tmdbMatch ? tmdbMatch[1] : null;
}

/**
 * Generates consistent content ID based on episode data
 * 
 * @param options - Content ID generation options
 * @returns Content ID generation result
 */
export function generateContentId(options: ContentIdOptions): ContentIdResult {
  const {
    contentType,
    episodeData,
    fallbackPrefix = 'episode',
    enableLogging = false
  } = options;

  const warnings: string[] = [];
  const log = enableLogging ? console.log : () => {};
  const warn = enableLogging ? console.warn : () => {};

  // Handle non-TV content types
  if (contentType === 'movie') {
    return {
      contentId: 'movie-1',
      source: 'default'
    };
  }

  // Handle TV/episode content without episode data
  if (!episodeData) {
    const fallbackId = `${fallbackPrefix}-1`;
    warnings.push('No episode data provided for TV content');
    
    if (enableLogging) {
      warn('🎬 No episode data provided for TV content, using fallback:', fallbackId);
    }

    return {
      contentId: fallbackId,
      source: 'fallback',
      warnings
    };
  }

  // Validate episode data
  const validation = validateEpisodeData(episodeData);
  warnings.push(...validation.warnings);

  // Handle empty episodes array
  if (!validation.hasEpisodes) {
    const fallbackId = `${fallbackPrefix}-${(episodeData.currentEpisodeIndex || 0) + 1}`;
    
    if (enableLogging) {
      warn('🎬 Episode data provided but episodes array is empty, using fallback ID:', fallbackId);
    }

    return {
      contentId: fallbackId,
      source: 'fallback',
      warnings
    };
  }

  // Handle invalid episode index
  if (!validation.hasValidIndex) {
    const firstEpisode = episodeData.episodes![0];
    const fallbackId = firstEpisode?.id || `${fallbackPrefix}-1`;
    
    if (enableLogging) {
      warn('🎬 Invalid currentEpisodeIndex, using first episode:', {
        currentIndex: episodeData.currentEpisodeIndex,
        episodesLength: episodeData.episodes!.length,
        fallbackId
      });
    }

    // Try to extract series ID from first episode
    const seriesId = firstEpisode?.id ? extractSeriesId(firstEpisode.id) : undefined;

    return {
      contentId: fallbackId,
      seriesId: seriesId || undefined,
      source: 'fallback',
      warnings
    };
  }

  // Get current episode and use its ID
  const currentIndex = episodeData.currentEpisodeIndex ?? 0;
  const currentEpisode = episodeData.episodes![currentIndex];

  if (currentEpisode?.id) {
    const seriesId = extractSeriesId(currentEpisode.id);
    
    if (enableLogging) {
      log('🎬 Using episode ID from episode data:', {
        episodeId: currentEpisode.id,
        episodeTitle: currentEpisode.title,
        currentIndex,
        extractedSeriesId: seriesId
      });
    }

    return {
      contentId: currentEpisode.id,
      seriesId: seriesId || undefined,
      source: 'episode-data',
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  // Fallback to index-based ID if episode ID is missing
  const indexBasedId = `${fallbackPrefix}-${currentIndex + 1}`;
  warnings.push('Episode found but ID is missing');
  
  if (enableLogging) {
    warn('🎬 Episode found but ID is missing, using index-based fallback:', {
      currentIndex,
      episodeTitle: currentEpisode?.title,
      fallbackId: indexBasedId
    });
  }

  return {
    contentId: indexBasedId,
    source: 'fallback',
    warnings
  };
}

/**
 * Generates series ID based on episode data
 * 
 * @param episodeData - Episode data to extract series ID from
 * @param fallbackSeriesId - Fallback series ID if extraction fails
 * @param enableLogging - Whether to enable logging
 * @returns Series ID or undefined for non-TV content
 */
export function generateSeriesId(
  episodeData: VideoPlayerEpisodeData | null,
  fallbackSeriesId: string = 'series-1',
  enableLogging: boolean = false
): string | undefined {
  if (!episodeData?.episodes || episodeData.episodes.length === 0) {
    return fallbackSeriesId;
  }

  const firstEpisodeId = episodeData.episodes[0].id;
  const extractedSeriesId = extractSeriesId(firstEpisodeId);

  if (extractedSeriesId) {
    if (enableLogging) {
      console.log('🎬 Extracted series ID from episode data:', extractedSeriesId);
    }
    return extractedSeriesId;
  }

  if (enableLogging) {
    console.log('🎬 Could not extract series ID, using fallback:', fallbackSeriesId);
  }

  return fallbackSeriesId;
}

/**
 * Validates content ID consistency between components
 * 
 * @param contentId - Content ID to validate
 * @param episodeData - Episode data to validate against
 * @returns Validation result with recommendations
 */
export function validateContentIdConsistency(
  contentId: string,
  episodeData: VideoPlayerEpisodeData | null
): {
  isConsistent: boolean;
  expectedContentId?: string;
  recommendation: string;
  issues: string[];
} {
  const issues: string[] = [];

  if (!episodeData?.episodes || episodeData.episodes.length === 0) {
    return {
      isConsistent: true, // No episode data to validate against
      recommendation: 'No episode data available for consistency check',
      issues
    };
  }

  const currentIndex = episodeData.currentEpisodeIndex ?? 0;
  if (currentIndex < 0 || currentIndex >= episodeData.episodes.length) {
    issues.push(`Invalid currentEpisodeIndex: ${currentIndex}`);
    return {
      isConsistent: false,
      recommendation: 'Fix currentEpisodeIndex to be within valid range',
      issues
    };
  }

  const currentEpisode = episodeData.episodes[currentIndex];
  const expectedContentId = currentEpisode?.id;

  if (!expectedContentId) {
    issues.push('Current episode has no ID');
    return {
      isConsistent: false,
      recommendation: 'Ensure all episodes have valid IDs',
      issues
    };
  }

  const isConsistent = contentId === expectedContentId;

  if (!isConsistent) {
    issues.push(`Content ID mismatch: got "${contentId}", expected "${expectedContentId}"`);
  }

  return {
    isConsistent,
    expectedContentId,
    recommendation: isConsistent 
      ? 'Content ID is consistent with episode data'
      : 'Update content ID to match current episode ID',
    issues
  };
}

/**
 * Creates a content ID generator function with preset options
 * 
 * @param defaultOptions - Default options for content ID generation
 * @returns Content ID generator function
 */
export function createContentIdGenerator(defaultOptions: Partial<ContentIdOptions> = {}) {
  return (options: Partial<ContentIdOptions> = {}): ContentIdResult => {
    const mergedOptions = { ...defaultOptions, ...options } as ContentIdOptions;
    return generateContentId(mergedOptions);
  };
}

// Pre-configured generators for common use cases
export const movieContentIdGenerator = createContentIdGenerator({
  contentType: 'movie',
  enableLogging: true
});

export const tvContentIdGenerator = createContentIdGenerator({
  contentType: 'tv',
  fallbackPrefix: 'episode',
  enableLogging: true
});

export const episodeContentIdGenerator = createContentIdGenerator({
  contentType: 'episode',
  fallbackPrefix: 'episode',
  enableLogging: true
});