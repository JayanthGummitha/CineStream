/**
 * Unit tests for episode error handling utilities
 */

import {
  createEpisodeError,
  validateEpisodeDataWithErrorHandling,
  retryWithBackoff,
  validateVideoSource,
  handleEpisodeTransitionError,
  getUserFriendlyErrorMessage,
  isRetryableError,
  isFallbackAvailable,
  EpisodeErrorType,
  EpisodeNavigationLogger
} from '../episode-error-handling';
import { type Episode } from '@/types';
import { type EpisodeMetadata } from '@/lib/episode-metadata';

// Mock console methods to avoid noise in tests
const originalConsole = { ...console };
beforeAll(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  Object.assign(console, originalConsole);
});

describe('createEpisodeError', () => {
  it('should categorize network errors correctly', () => {
    const networkError = new Error('network timeout');
    const result = createEpisodeError(networkError);

    expect(result.type).toBe(EpisodeErrorType.NETWORK_ERROR);
    expect(result.retryable).toBe(true);
    expect(result.fallbackAvailable).toBe(true);
    expect(result.userMessage).toContain('Network error');
  });

  it('should categorize video source errors correctly', () => {
    const videoError = new Error('video source not found');
    const result = createEpisodeError(videoError);

    expect(result.type).toBe(EpisodeErrorType.VIDEO_SOURCE_ERROR);
    expect(result.retryable).toBe(true);
    expect(result.fallbackAvailable).toBe(true);
    expect(result.userMessage).toContain('Video source');
  });

  it('should categorize validation errors correctly', () => {
    const validationError = new Error('invalid episode data');
    const result = createEpisodeError(validationError);

    expect(result.type).toBe(EpisodeErrorType.VALIDATION_ERROR);
    expect(result.retryable).toBe(false);
    expect(result.fallbackAvailable).toBe(true);
    expect(result.userMessage).toContain('invalid');
  });

  it('should handle non-Error objects', () => {
    const result = createEpisodeError('string error');

    expect(result.type).toBe(EpisodeErrorType.UNKNOWN_ERROR);
    expect(result.message).toBe('string error');
    expect(result.retryable).toBe(true);
  });

  it('should include context in error', () => {
    const error = new Error('test error');
    const context = { episodeId: 'ep-123', operation: 'test' };
    const result = createEpisodeError(error, context);

    expect(result.context).toEqual(context);
  });
});

describe('validateEpisodeDataWithErrorHandling', () => {
  const validEpisodes: Episode[] = [
    {
      id: 'ep-1',
      title: 'Episode 1',
      description: 'First episode',
      thumbnail: 'thumb1.jpg',
      episodeNumber: 1,
      duration: 1800,
      releaseDate: '2024-01-01',
      src: 'https://files.vidstack.io/sprite-fight/1080p.mp4'
    },
    {
      id: 'ep-2',
      title: 'Episode 2',
      description: 'Second episode',
      thumbnail: 'thumb2.jpg',
      episodeNumber: 2,
      duration: 1900,
      releaseDate: '2024-01-08',
      src: 'https://files.vidstack.io/sprite-fight/720p.mp4'
    }
  ];

  it('should return valid for no episode data', () => {
    const result = validateEpisodeDataWithErrorHandling();

    expect(result.isValid).toBe(true);
    expect(result.hasEpisodeData).toBe(false);
    expect(result.error).toBeUndefined();
  });

  it('should validate correct episode data', () => {
    const result = validateEpisodeDataWithErrorHandling(validEpisodes, 0, 1);

    expect(result.isValid).toBe(true);
    expect(result.hasEpisodeData).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should treat null episodes as no episode data', () => {
    const result = validateEpisodeDataWithErrorHandling(null as any, 0, 1);

    expect(result.isValid).toBe(true);
    expect(result.hasEpisodeData).toBe(false);
    expect(result.error).toBeUndefined();
  });

  it('should reject invalid episodes array type', () => {
    const result = validateEpisodeDataWithErrorHandling('invalid' as any, 0, 1);

    expect(result.isValid).toBe(false);
    expect(result.hasEpisodeData).toBe(true);
    expect(result.error?.message).toContain('Episodes must be an array');
  });

  it('should reject empty episodes array', () => {
    const result = validateEpisodeDataWithErrorHandling([], 0, 1);

    expect(result.isValid).toBe(false);
    expect(result.hasEpisodeData).toBe(true);
    expect(result.error?.message).toContain('cannot be empty');
  });

  it('should reject invalid episode index', () => {
    const result = validateEpisodeDataWithErrorHandling(validEpisodes, 5, 1);

    expect(result.isValid).toBe(false);
    expect(result.hasEpisodeData).toBe(true);
    expect(result.error?.message).toContain('Invalid current episode index');
  });

  it('should reject invalid season number', () => {
    const result = validateEpisodeDataWithErrorHandling(validEpisodes, 0, 0);

    expect(result.isValid).toBe(false);
    expect(result.hasEpisodeData).toBe(true);
    expect(result.error?.message).toContain('Invalid season number');
  });

  it('should reject episodes with missing required fields', () => {
    const invalidEpisodes = [
      { id: '', title: 'Episode 1', episodeNumber: 1, duration: 1800 }
    ] as Episode[];

    const result = validateEpisodeDataWithErrorHandling(invalidEpisodes, 0, 1);

    expect(result.isValid).toBe(false);
    expect(result.hasEpisodeData).toBe(true);
    expect(result.error?.message).toContain('Episode ID is required');
  });
});

describe('retryWithBackoff', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should succeed on first attempt', async () => {
    const operation = jest.fn().mockResolvedValue('success');
    
    const result = await retryWithBackoff(operation);
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const operation = jest.fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValue('success');
    
    const result = await retryWithBackoff(operation, { maxRetries: 2, baseDelay: 10 });
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(2);
  }, 10000);

  it('should fail after max retries', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('persistent error'));
    
    await expect(retryWithBackoff(operation, { maxRetries: 1, baseDelay: 10 })).rejects.toThrow('persistent error');
    expect(operation).toHaveBeenCalledTimes(2); // Initial + 1 retry
  }, 10000);

  it('should not retry non-retryable errors', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('validation error'));
    
    await expect(retryWithBackoff(operation)).rejects.toThrow('validation error');
    expect(operation).toHaveBeenCalledTimes(1);
  });
});

describe('validateVideoSource', () => {
  it('should validate correct URL', () => {
    const result = validateVideoSource('https://example.com/video.mp4');

    expect(result.isValid).toBe(true);
    expect(result.src).toBe('https://example.com/video.mp4');
    expect(result.usingFallback).toBe(false);
  });

  it('should reject invalid URL and use fallback', () => {
    const result = validateVideoSource('invalid-url');

    expect(result.isValid).toBe(false);
    expect(result.src).toBe('https://files.vidstack.io/sprite-fight/1080p.mp4');
    expect(result.usingFallback).toBe(true);
  });

  it('should reject empty string and use fallback', () => {
    const result = validateVideoSource('');

    expect(result.isValid).toBe(false);
    expect(result.usingFallback).toBe(true);
  });

  it('should use custom fallback', () => {
    const customFallback = 'https://custom.com/fallback.mp4';
    const result = validateVideoSource('invalid', customFallback);

    expect(result.src).toBe(customFallback);
    expect(result.usingFallback).toBe(true);
  });
});

describe('handleEpisodeTransitionError', () => {
  const mockEpisodeData: EpisodeMetadata = {
    id: 'ep-1',
    title: 'Test Episode',
    description: 'Test',
    thumbnail: 'thumb.jpg',
    src: 'https://example.com/video.mp4',
    introStart: 0,
    introEnd: 45,
    duration: 1800,
    seriesId: 'series-1',
    seasonNumber: 1,
    episodeNumber: 1
  };

  it('should handle network errors with retry and fallback', () => {
    const networkError = new Error('network timeout');
    const result = handleEpisodeTransitionError(networkError, mockEpisodeData);

    expect(result.shouldRetry).toBe(true);
    expect(result.shouldFallback).toBe(true);
    expect(result.fallbackAction).toBe('retry_with_fallback_source');
    expect(result.userMessage).toContain('Network error');
  });

  it('should handle video source errors with fallback', () => {
    const videoError = new Error('video source failed');
    const result = handleEpisodeTransitionError(videoError, mockEpisodeData);

    expect(result.shouldRetry).toBe(true);
    expect(result.shouldFallback).toBe(true);
    expect(result.fallbackAction).toBe('use_default_source');
    expect(result.userMessage).toContain('Video source');
  });

  it('should handle validation errors without retry', () => {
    const validationError = new Error('invalid episode data');
    const result = handleEpisodeTransitionError(validationError, mockEpisodeData);

    expect(result.shouldRetry).toBe(false);
    expect(result.shouldFallback).toBe(true);
    expect(result.fallbackAction).toBe('use_metadata_service');
  });

  it('should handle player errors with retry but no fallback', () => {
    const playerError = new Error('player not ready');
    const result = handleEpisodeTransitionError(playerError, mockEpisodeData);

    expect(result.shouldRetry).toBe(true);
    expect(result.shouldFallback).toBe(false);
    expect(result.fallbackAction).toBe('reload_player');
  });
});

describe('getUserFriendlyErrorMessage', () => {
  it('should return user-friendly message for network error', () => {
    const networkError = new Error('network failed');
    const message = getUserFriendlyErrorMessage(networkError);

    expect(message).toContain('Network error');
    expect(message).not.toContain('network failed'); // Should not expose technical details
  });

  it('should return user-friendly message for validation error', () => {
    const validationError = new Error('validation failed');
    const message = getUserFriendlyErrorMessage(validationError);

    expect(message).toContain('invalid');
  });
});

describe('isRetryableError and isFallbackAvailable', () => {
  it('should identify retryable errors', () => {
    const networkError = new Error('network timeout');
    expect(isRetryableError(networkError)).toBe(true);

    const validationError = new Error('invalid data');
    expect(isRetryableError(validationError)).toBe(false);
  });

  it('should identify fallback availability', () => {
    const networkError = new Error('network timeout');
    expect(isFallbackAvailable(networkError)).toBe(true);

    const playerError = new Error('player failed');
    expect(isFallbackAvailable(playerError)).toBe(false);
  });
});

describe('EpisodeNavigationLogger', () => {
  let logger: EpisodeNavigationLogger;

  beforeEach(() => {
    logger = EpisodeNavigationLogger.getInstance();
    logger.clearLogs();
  });

  it('should be a singleton', () => {
    const logger1 = EpisodeNavigationLogger.getInstance();
    const logger2 = EpisodeNavigationLogger.getInstance();
    expect(logger1).toBe(logger2);
  });

  it('should log messages with different levels', () => {
    logger.log('info', 'Test info message');
    logger.log('warn', 'Test warning message');
    logger.log('error', 'Test error message');

    const logs = logger.getLogs();
    expect(logs).toHaveLength(3);
    expect(logs[0].level).toBe('info');
    expect(logs[1].level).toBe('warn');
    expect(logs[2].level).toBe('error');
  });

  it('should include context in logs', () => {
    const context = { episodeId: 'ep-1', operation: 'test' };
    logger.log('info', 'Test message', context);

    const logs = logger.getLogs();
    expect(logs[0].context).toEqual(context);
  });

  it('should limit log count', () => {
    // Add more than max logs
    for (let i = 0; i < 150; i++) {
      logger.log('info', `Message ${i}`);
    }

    const logs = logger.getLogs();
    expect(logs.length).toBeLessThanOrEqual(100);
  });

  it('should export logs as JSON', () => {
    logger.log('info', 'Test message');
    const exported = logger.exportLogs();
    const parsed = JSON.parse(exported);

    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].message).toBe('Test message');
  });

  it('should clear logs', () => {
    logger.log('info', 'Test message');
    expect(logger.getLogs()).toHaveLength(1);

    logger.clearLogs();
    expect(logger.getLogs()).toHaveLength(0);
  });
});