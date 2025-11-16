/**
 * Episode Navigation Error Handling Utilities
 * 
 * This module provides comprehensive error handling for episode navigation features
 * including validation, fallback mechanisms, retry logic, and user-friendly error messages.
 * 
 * @module episode-error-handling
 * @version 1.0.0
 */

import { type Episode } from '@/types';
import { type EpisodeMetadata } from '@/lib/episode-metadata';

/**
 * Error types for episode navigation
 */
export enum EpisodeErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VIDEO_SOURCE_ERROR = 'VIDEO_SOURCE_ERROR',
  METADATA_ERROR = 'METADATA_ERROR',
  PLAYER_ERROR = 'PLAYER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Episode navigation error interface
 */
export interface EpisodeNavigationError {
  type: EpisodeErrorType;
  message: string;
  userMessage: string;
  code?: string;
  retryable: boolean;
  fallbackAvailable: boolean;
  context?: Record<string, any>;
}

/**
 * Retry configuration for failed operations
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2
};

/**
 * Episode navigation logger for debugging
 */
export class EpisodeNavigationLogger {
  private static instance: EpisodeNavigationLogger;
  private logs: Array<{ timestamp: Date; level: string; message: string; context?: any }> = [];
  private maxLogs = 100;

  static getInstance(): EpisodeNavigationLogger {
    if (!EpisodeNavigationLogger.instance) {
      EpisodeNavigationLogger.instance = new EpisodeNavigationLogger();
    }
    return EpisodeNavigationLogger.instance;
  }

  log(level: 'info' | 'warn' | 'error', message: string, context?: any): void {
    const logEntry = {
      timestamp: new Date(),
      level,
      message,
      context
    };

    this.logs.push(logEntry);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console logging with episode navigation prefix
    const prefix = '🎬 [Episode Navigation]';
    switch (level) {
      case 'info':
        break;
      case 'warn':
        console.warn(`${prefix} ${message}`, context || '');
        break;
      case 'error':
        console.error(`${prefix} ${message}`, context || '');
        break;
    }
  }

  getLogs(): Array<{ timestamp: Date; level: string; message: string; context?: any }> {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

/**
 * Creates an episode navigation error with appropriate categorization
 */
export function createEpisodeError(
  error: unknown,
  context: Record<string, any> = {}
): EpisodeNavigationError {
  const logger = EpisodeNavigationLogger.getInstance();

  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('network') || error.message.includes('fetch') || error.name === 'NetworkError') {
      const episodeError: EpisodeNavigationError = {
        type: EpisodeErrorType.NETWORK_ERROR,
        message: error.message,
        userMessage: 'Network error occurred. Please check your connection and try again.',
        retryable: true,
        fallbackAvailable: true,
        context
      };
      logger.log('error', 'Network error in episode navigation', { error: error.message, context });
      return episodeError;
    }

    // Video source errors
    if (error.message.includes('video') || error.message.includes('source') || error.message.includes('media')) {
      const episodeError: EpisodeNavigationError = {
        type: EpisodeErrorType.VIDEO_SOURCE_ERROR,
        message: error.message,
        userMessage: 'Video source unavailable. Trying alternative source...',
        retryable: true,
        fallbackAvailable: true,
        context
      };
      logger.log('error', 'Video source error in episode navigation', { error: error.message, context });
      return episodeError;
    }

    // Validation errors
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      const episodeError: EpisodeNavigationError = {
        type: EpisodeErrorType.VALIDATION_ERROR,
        message: error.message,
        userMessage: 'Episode data is invalid. Please refresh and try again.',
        retryable: false,
        fallbackAvailable: true,
        context
      };
      logger.log('error', 'Validation error in episode navigation', { error: error.message, context });
      return episodeError;
    }

    // Player errors
    if (error.message.includes('player') || error.message.includes('playback')) {
      const episodeError: EpisodeNavigationError = {
        type: EpisodeErrorType.PLAYER_ERROR,
        message: error.message,
        userMessage: 'Video player error. Please try again.',
        retryable: true,
        fallbackAvailable: false,
        context
      };
      logger.log('error', 'Player error in episode navigation', { error: error.message, context });
      return episodeError;
    }

    // Generic error
    const episodeError: EpisodeNavigationError = {
      type: EpisodeErrorType.UNKNOWN_ERROR,
      message: error.message,
      userMessage: 'An unexpected error occurred. Please try again.',
      retryable: true,
      fallbackAvailable: true,
      context
    };
    logger.log('error', 'Unknown error in episode navigation', { error: error.message, context });
    return episodeError;
  }

  // Non-Error objects
  const episodeError: EpisodeNavigationError = {
    type: EpisodeErrorType.UNKNOWN_ERROR,
    message: String(error),
    userMessage: 'An unexpected error occurred. Please try again.',
    retryable: true,
    fallbackAvailable: true,
    context
  };
  logger.log('error', 'Unknown error type in episode navigation', { error: String(error), context });
  return episodeError;
}

/**
 * Validates episode data with comprehensive error reporting
 */
export function validateEpisodeDataWithErrorHandling(
  episodes?: Episode[],
  currentEpisodeIndex?: number,
  seasonNumber?: number
): { isValid: boolean; error?: EpisodeNavigationError; hasEpisodeData: boolean } {
  const logger = EpisodeNavigationLogger.getInstance();

  try {
    // If no episode data provided, it's valid but no episode navigation
    if (!episodes || currentEpisodeIndex === undefined || seasonNumber === undefined) {
      logger.log('info', 'No episode data provided - using fallback to metadata service');
      return {
        isValid: true,
        hasEpisodeData: false
      };
    }

    // Validate episodes array
    if (!Array.isArray(episodes)) {
      const error = createEpisodeError(new Error('Episodes must be an array'), {
        episodes: typeof episodes,
        currentEpisodeIndex,
        seasonNumber
      });
      return {
        isValid: false,
        error,
        hasEpisodeData: true
      };
    }

    if (episodes.length === 0) {
      const error = createEpisodeError(new Error('Episodes array cannot be empty'), {
        episodesLength: episodes.length,
        currentEpisodeIndex,
        seasonNumber
      });
      return {
        isValid: false,
        error,
        hasEpisodeData: true
      };
    }

    // Validate current episode index
    if (typeof currentEpisodeIndex !== 'number' || currentEpisodeIndex < 0 || currentEpisodeIndex >= episodes.length) {
      const error = createEpisodeError(new Error(`Invalid current episode index: ${currentEpisodeIndex}. Must be between 0 and ${episodes.length - 1}`), {
        currentEpisodeIndex,
        episodesLength: episodes.length,
        seasonNumber
      });
      return {
        isValid: false,
        error,
        hasEpisodeData: true
      };
    }

    // Validate season number
    if (typeof seasonNumber !== 'number' || seasonNumber < 1) {
      const error = createEpisodeError(new Error(`Invalid season number: ${seasonNumber}. Must be a positive number`), {
        seasonNumber,
        currentEpisodeIndex,
        episodesLength: episodes.length
      });
      return {
        isValid: false,
        error,
        hasEpisodeData: true
      };
    }

    // Validate current episode data structure
    const currentEpisode = episodes[currentEpisodeIndex];
    if (!currentEpisode) {
      const error = createEpisodeError(new Error('Current episode data is missing'), {
        currentEpisodeIndex,
        episodesLength: episodes.length,
        seasonNumber
      });
      return {
        isValid: false,
        error,
        hasEpisodeData: true
      };
    }

    if (!currentEpisode.id || typeof currentEpisode.id !== 'string') {
      const error = createEpisodeError(new Error('Episode ID is required and must be a string'), {
        episodeId: currentEpisode.id,
        currentEpisodeIndex,
        seasonNumber
      });
      return {
        isValid: false,
        error,
        hasEpisodeData: true
      };
    }

    if (!currentEpisode.title || typeof currentEpisode.title !== 'string') {
      const error = createEpisodeError(new Error('Episode title is required and must be a string'), {
        episodeTitle: currentEpisode.title,
        episodeId: currentEpisode.id,
        currentEpisodeIndex,
        seasonNumber
      });
      return {
        isValid: false,
        error,
        hasEpisodeData: true
      };
    }

    if (typeof currentEpisode.episodeNumber !== 'number' || currentEpisode.episodeNumber < 1) {
      const error = createEpisodeError(new Error('Episode number is required and must be a positive number'), {
        episodeNumber: currentEpisode.episodeNumber,
        episodeId: currentEpisode.id,
        currentEpisodeIndex,
        seasonNumber
      });
      return {
        isValid: false,
        error,
        hasEpisodeData: true
      };
    }

    if (typeof currentEpisode.duration !== 'number' || currentEpisode.duration <= 0) {
      const error = createEpisodeError(new Error('Episode duration is required and must be a positive number'), {
        duration: currentEpisode.duration,
        episodeId: currentEpisode.id,
        currentEpisodeIndex,
        seasonNumber
      });
      return {
        isValid: false,
        error,
        hasEpisodeData: true
      };
    }

    // Validate all episodes have required fields
    for (let i = 0; i < episodes.length; i++) {
      const episode = episodes[i];
      if (!episode.id || !episode.title || typeof episode.episodeNumber !== 'number') {
        const error = createEpisodeError(new Error(`Episode at index ${i} has invalid data structure`), {
          invalidEpisodeIndex: i,
          episodeId: episode.id,
          episodeTitle: episode.title,
          episodeNumber: episode.episodeNumber,
          currentEpisodeIndex,
          seasonNumber
        });
        return {
          isValid: false,
          error,
          hasEpisodeData: true
        };
      }
    }

    logger.log('info', 'Episode data validation successful', {
      episodesCount: episodes.length,
      currentEpisodeIndex,
      seasonNumber,
      currentEpisodeTitle: currentEpisode.title
    });

    return { isValid: true, hasEpisodeData: true };

  } catch (validationError) {
    const error = createEpisodeError(validationError, {
      episodes: episodes?.length,
      currentEpisodeIndex,
      seasonNumber
    });
    return {
      isValid: false,
      error,
      hasEpisodeData: true
    };
  }
}

/**
 * Retry mechanism with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  context: Record<string, any> = {}
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  const logger = EpisodeNavigationLogger.getInstance();

  let lastError: unknown;
  
  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      logger.log('info', `Attempting operation (attempt ${attempt + 1}/${retryConfig.maxRetries + 1})`, context);
      const result = await operation();
      
      if (attempt > 0) {
        logger.log('info', `Operation succeeded after ${attempt} retries`, context);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      if (attempt === retryConfig.maxRetries) {
        logger.log('error', `Operation failed after ${retryConfig.maxRetries + 1} attempts`, { error, context });
        break;
      }

      const episodeError = createEpisodeError(error, context);
      
      // Don't retry non-retryable errors
      if (!episodeError.retryable) {
        logger.log('error', 'Non-retryable error encountered, stopping retries', { error, context });
        throw error;
      }

      const delay = Math.min(
        retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt),
        retryConfig.maxDelay
      );

      logger.log('warn', `Operation failed, retrying in ${delay}ms`, { error, attempt: attempt + 1, context });
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Validates video source URL and provides fallback
 */
export function validateVideoSource(
  src: string,
  fallbackSrc: string = 'https://files.vidstack.io/sprite-fight/1080p.mp4'
): { isValid: boolean; src: string; usingFallback: boolean } {
  const logger = EpisodeNavigationLogger.getInstance();

  try {
    if (!src || typeof src !== 'string') {
      logger.log('warn', 'Invalid video source, using fallback', { originalSrc: src, fallbackSrc });
      return {
        isValid: false,
        src: fallbackSrc,
        usingFallback: true
      };
    }

    // Basic URL validation
    try {
      new URL(src);
    } catch {
      logger.log('warn', 'Invalid video source URL, using fallback', { originalSrc: src, fallbackSrc });
      return {
        isValid: false,
        src: fallbackSrc,
        usingFallback: true
      };
    }

    logger.log('info', 'Video source validation successful', { src });
    return {
      isValid: true,
      src,
      usingFallback: false
    };

  } catch (error) {
    logger.log('error', 'Error validating video source', { error, originalSrc: src, fallbackSrc });
    return {
      isValid: false,
      src: fallbackSrc,
      usingFallback: true
    };
  }
}

/**
 * Handles episode transition errors with appropriate fallback
 */
export function handleEpisodeTransitionError(
  error: unknown,
  episodeData: EpisodeMetadata,
  context: Record<string, any> = {}
): {
  shouldRetry: boolean;
  shouldFallback: boolean;
  userMessage: string;
  fallbackAction?: string;
} {
  const episodeError = createEpisodeError(error, { ...context, episodeId: episodeData.id, episodeTitle: episodeData.title });
  const logger = EpisodeNavigationLogger.getInstance();

  logger.log('error', 'Episode transition error occurred', {
    error: episodeError.message,
    type: episodeError.type,
    episodeId: episodeData.id,
    context
  });

  switch (episodeError.type) {
    case EpisodeErrorType.NETWORK_ERROR:
      return {
        shouldRetry: true,
        shouldFallback: true,
        userMessage: 'Network error loading episode. Retrying...',
        fallbackAction: 'retry_with_fallback_source'
      };

    case EpisodeErrorType.VIDEO_SOURCE_ERROR:
      return {
        shouldRetry: true,
        shouldFallback: true,
        userMessage: 'Video source unavailable. Trying alternative source...',
        fallbackAction: 'use_default_source'
      };

    case EpisodeErrorType.VALIDATION_ERROR:
      return {
        shouldRetry: false,
        shouldFallback: true,
        userMessage: 'Episode data is invalid. Using metadata service...',
        fallbackAction: 'use_metadata_service'
      };

    case EpisodeErrorType.PLAYER_ERROR:
      return {
        shouldRetry: true,
        shouldFallback: false,
        userMessage: 'Video player error. Please try again.',
        fallbackAction: 'reload_player'
      };

    default:
      return {
        shouldRetry: true,
        shouldFallback: true,
        userMessage: 'An error occurred loading the episode. Retrying...',
        fallbackAction: 'retry_with_metadata_service'
      };
  }
}

/**
 * Gets user-friendly error message for display
 */
export function getUserFriendlyErrorMessage(error: unknown, context: Record<string, any> = {}): string {
  const episodeError = createEpisodeError(error, context);
  return episodeError.userMessage;
}

/**
 * Checks if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  const episodeError = createEpisodeError(error);
  return episodeError.retryable;
}

/**
 * Checks if fallback is available for an error
 */
export function isFallbackAvailable(error: unknown): boolean {
  const episodeError = createEpisodeError(error);
  return episodeError.fallbackAvailable;
}