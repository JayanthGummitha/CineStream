/**
 * Episode Data Validation Utilities
 * 
 * This module provides validation functions for episode data used in the VideoPlayer component.
 * It ensures data integrity and provides type-safe validation for episode navigation features.
 * 
 * @module episode-validation
 * @version 1.0.0
 */

import { type Episode } from '@/types';
import { type EpisodeMetadata } from '@/lib/episode-metadata';

/**
 * Interface for episode data mapping configuration
 */
export interface EpisodeDataMapping {
  /** Default video source to use when episode src is not available */
  defaultVideoSource: string;
  /** Default intro start time in seconds */
  defaultIntroStart: number;
  /** Default intro end time in seconds */
  defaultIntroEnd: number;
  /** Whether to validate video source URLs */
  validateVideoSources: boolean;
}

/**
 * Default configuration for episode data mapping
 */
export const DEFAULT_EPISODE_MAPPING_CONFIG: EpisodeDataMapping = {
  defaultVideoSource: 'https://files.vidstack.io/sprite-fight/1080p.mp4',
  defaultIntroStart: 0,
  defaultIntroEnd: 45,
  validateVideoSources: true
};

/**
 * Validates an array of episodes for use in VideoPlayer
 * 
 * @param episodes - Array of episodes to validate
 * @param currentIndex - Current episode index to validate
 * @returns Validation result with success status and error message if any
 */
export function validateEpisodeData(
  episodes: Episode[], 
  currentIndex: number
): { isValid: boolean; error?: string } {
  // Check if episodes array is valid
  if (!Array.isArray(episodes)) {
    return {
      isValid: false,
      error: 'Episodes must be an array'
    };
  }

  if (episodes.length === 0) {
    return {
      isValid: false,
      error: 'Episodes array cannot be empty'
    };
  }

  // Check if current index is valid
  if (typeof currentIndex !== 'number' || currentIndex < 0 || currentIndex >= episodes.length) {
    return {
      isValid: false,
      error: `Invalid current episode index: ${currentIndex}. Must be between 0 and ${episodes.length - 1}`
    };
  }

  // Validate current episode data structure
  const currentEpisode = episodes[currentIndex];
  if (!currentEpisode) {
    return {
      isValid: false,
      error: 'Current episode data is missing'
    };
  }

  if (!currentEpisode.id || typeof currentEpisode.id !== 'string') {
    return {
      isValid: false,
      error: 'Episode ID is required and must be a string'
    };
  }

  if (!currentEpisode.title || typeof currentEpisode.title !== 'string') {
    return {
      isValid: false,
      error: 'Episode title is required and must be a string'
    };
  }

  if (typeof currentEpisode.episodeNumber !== 'number' || currentEpisode.episodeNumber < 1) {
    return {
      isValid: false,
      error: 'Episode number is required and must be a positive number'
    };
  }

  if (typeof currentEpisode.duration !== 'number' || currentEpisode.duration <= 0) {
    return {
      isValid: false,
      error: 'Episode duration is required and must be a positive number'
    };
  }

  // Validate all episodes have required fields
  for (let i = 0; i < episodes.length; i++) {
    const episode = episodes[i];
    if (!episode.id || !episode.title || typeof episode.episodeNumber !== 'number') {
      return {
        isValid: false,
        error: `Episode at index ${i} has invalid data structure`
      };
    }
  }

  return { isValid: true };
}

/**
 * Maps Episode data to EpisodeMetadata format for VideoPlayer consumption
 * 
 * @param episode - Episode data to map
 * @param seasonNumber - Season number for the episode
 * @param seriesId - Series ID for the episode
 * @param config - Optional mapping configuration
 * @returns Mapped EpisodeMetadata object
 */
export function mapEpisodeToMetadata(
  episode: Episode,
  seasonNumber: number,
  seriesId: string,
  config: Partial<EpisodeDataMapping> = {}
): EpisodeMetadata {
  const mappingConfig = { ...DEFAULT_EPISODE_MAPPING_CONFIG, ...config };

  return {
    id: episode.id,
    title: episode.title,
    description: episode.description || '',
    thumbnail: episode.thumbnail || '',
    src: episode.src || mappingConfig.defaultVideoSource, // Use episode src if available, fallback to default DASH source
    introStart: mappingConfig.defaultIntroStart,
    introEnd: mappingConfig.defaultIntroEnd,
    duration: episode.duration,
    seriesId: seriesId,
    seasonNumber: seasonNumber,
    episodeNumber: episode.episodeNumber
  };
}

/**
 * Validates episode index bounds and returns safe index
 * 
 * @param index - Index to validate
 * @param episodesLength - Total number of episodes
 * @returns Safe index within bounds or null if invalid
 */
export function validateEpisodeIndex(index: number, episodesLength: number): number | null {
  if (typeof index !== 'number' || index < 0 || index >= episodesLength) {
    return null;
  }
  return index;
}

/**
 * Finds the next episode index in the episodes array
 * 
 * @param currentIndex - Current episode index
 * @param episodesLength - Total number of episodes
 * @returns Next episode index or null if no next episode
 */
export function getNextEpisodeIndex(currentIndex: number, episodesLength: number): number | null {
  const nextIndex = currentIndex + 1;
  return nextIndex < episodesLength ? nextIndex : null;
}

/**
 * Validates season number
 * 
 * @param seasonNumber - Season number to validate
 * @returns True if valid season number
 */
export function validateSeasonNumber(seasonNumber: number): boolean {
  return typeof seasonNumber === 'number' && seasonNumber > 0;
}

/**
 * Comprehensive validation for all episode navigation props
 * 
 * @param episodes - Episodes array
 * @param currentEpisodeIndex - Current episode index
 * @param seasonNumber - Season number
 * @returns Validation result with detailed error information
 */
export function validateEpisodeNavigationProps(
  episodes?: Episode[],
  currentEpisodeIndex?: number,
  seasonNumber?: number
): { 
  isValid: boolean; 
  error?: string; 
  hasEpisodeData: boolean;
  canNavigate: boolean;
} {
  // If no episode data provided, it's valid but navigation is disabled
  if (!episodes || currentEpisodeIndex === undefined || seasonNumber === undefined) {
    return {
      isValid: true,
      hasEpisodeData: false,
      canNavigate: false
    };
  }

  // Validate season number
  if (!validateSeasonNumber(seasonNumber)) {
    return {
      isValid: false,
      error: 'Invalid season number: must be a positive number',
      hasEpisodeData: true,
      canNavigate: false
    };
  }

  // Validate episode data
  const episodeValidation = validateEpisodeData(episodes, currentEpisodeIndex);
  if (!episodeValidation.isValid) {
    return {
      isValid: false,
      error: episodeValidation.error,
      hasEpisodeData: true,
      canNavigate: false
    };
  }

  return {
    isValid: true,
    hasEpisodeData: true,
    canNavigate: true
  };
}