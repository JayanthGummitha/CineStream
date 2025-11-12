/**
 * Type tests for watch-progress module
 * 
 * These tests verify that all types are properly exported and can be used
 * without TypeScript errors. They don't run at runtime but ensure type safety.
 */

import {
  ContentType,
  WatchProgressData,
  WatchProgressIndex,
  WatchProgressErrorCode,
  WatchProgressError,
  WatchProgressMetadata,
  UseWatchProgressReturn,
  UseWatchProgressListReturn,
  ProgressStorageService,
  StorageStats,
  WatchProgressConfig,
  DEFAULT_WATCH_PROGRESS_CONFIG,
} from '../watch-progress';

describe('Watch Progress Types', () => {
  describe('ContentType', () => {
    it('should accept valid content types', () => {
      const movie: ContentType = 'movie';
      const tvShow: ContentType = 'tv-show';
      const trailer: ContentType = 'trailer';
      
      expect([movie, tvShow, trailer]).toHaveLength(3);
    });
  });

  describe('WatchProgressData', () => {
    it('should create valid progress data', () => {
      const progressData: WatchProgressData = {
        videoId: 'test-video-123',
        userId: 'test-user-456',
        contentType: 'movie',
        currentTime: 1800,
        duration: 7200,
        percentage: 25,
        lastWatchedAt: new Date().toISOString(),
        title: 'Test Movie',
        thumbnail: '/test-thumbnail.jpg',
      };
      
      expect(progressData.videoId).toBe('test-video-123');
      expect(progressData.contentType).toBe('movie');
    });

    it('should support TV show specific fields', () => {
      const tvProgress: WatchProgressData = {
        videoId: 'tv-episode-789',
        userId: 'test-user-456',
        contentType: 'tv-show',
        currentTime: 900,
        duration: 2700,
        percentage: 33.33,
        lastWatchedAt: new Date().toISOString(),
        title: 'Breaking Bad',
        seasonNumber: 1,
        episodeNumber: 1,
        episodeTitle: 'Pilot',
      };
      
      expect(tvProgress.seasonNumber).toBe(1);
      expect(tvProgress.episodeNumber).toBe(1);
      expect(tvProgress.episodeTitle).toBe('Pilot');
    });
  });

  describe('WatchProgressError', () => {
    it('should create error with code and recoverable flag', () => {
      const error = new WatchProgressError(
        'Storage quota exceeded',
        'STORAGE_FULL',
        true
      );
      
      expect(error.message).toBe('Storage quota exceeded');
      expect(error.code).toBe('STORAGE_FULL');
      expect(error.recoverable).toBe(true);
      expect(error.name).toBe('WatchProgressError');
    });

    it('should support all error codes', () => {
      const codes: WatchProgressErrorCode[] = [
        'STORAGE_FULL',
        'INVALID_DATA',
        'AUTH_REQUIRED',
        'CORRUPTED',
        'NOT_FOUND',
      ];
      
      codes.forEach(code => {
        const error = new WatchProgressError('Test error', code, false);
        expect(error.code).toBe(code);
      });
    });
  });

  describe('WatchProgressMetadata', () => {
    it('should create valid metadata', () => {
      const metadata: WatchProgressMetadata = {
        title: 'Test Content',
        thumbnail: '/test.jpg',
      };
      
      expect(metadata.title).toBe('Test Content');
    });

    it('should support optional TV show fields', () => {
      const tvMetadata: WatchProgressMetadata = {
        title: 'Test Show',
        seasonNumber: 2,
        episodeNumber: 5,
        episodeTitle: 'Test Episode',
      };
      
      expect(tvMetadata.seasonNumber).toBe(2);
    });
  });

  describe('UseWatchProgressReturn', () => {
    it('should define correct return type structure', () => {
      const mockReturn: UseWatchProgressReturn = {
        progress: null,
        saveProgress: jest.fn(),
        clearProgress: jest.fn(),
        resumePoint: null,
        isLoading: false,
      };
      
      expect(mockReturn.progress).toBeNull();
      expect(typeof mockReturn.saveProgress).toBe('function');
      expect(typeof mockReturn.clearProgress).toBe('function');
    });
  });

  describe('UseWatchProgressListReturn', () => {
    it('should define correct return type structure', () => {
      const mockReturn: UseWatchProgressListReturn = {
        progressList: [],
        isLoading: false,
        isRefreshing: false,
        removeProgress: jest.fn(),
        refreshProgress: jest.fn(),
      };
      
      expect(Array.isArray(mockReturn.progressList)).toBe(true);
      expect(typeof mockReturn.removeProgress).toBe('function');
      expect(typeof mockReturn.refreshProgress).toBe('function');
    });
  });

  describe('ProgressStorageService', () => {
    it('should define correct interface structure', () => {
      const mockService: ProgressStorageService = {
        saveProgress: jest.fn(),
        getProgress: jest.fn(),
        getAllProgress: jest.fn(),
        deleteProgress: jest.fn(),
        clearOldProgress: jest.fn(),
        clearAllProgress: jest.fn(),
      };
      
      expect(typeof mockService.saveProgress).toBe('function');
      expect(typeof mockService.getProgress).toBe('function');
      expect(typeof mockService.getAllProgress).toBe('function');
    });
  });

  describe('StorageStats', () => {
    it('should create valid storage stats', () => {
      const stats: StorageStats = {
        totalEntries: 10,
        estimatedSize: 5000,
        quotaUsagePercent: 25,
      };
      
      expect(stats.totalEntries).toBe(10);
      expect(stats.estimatedSize).toBe(5000);
    });
  });

  describe('WatchProgressConfig', () => {
    it('should support partial configuration', () => {
      const config: WatchProgressConfig = {
        minTrackingTime: 10,
        completionThreshold: 90,
      };
      
      expect(config.minTrackingTime).toBe(10);
      expect(config.completionThreshold).toBe(90);
    });

    it('should have default configuration', () => {
      expect(DEFAULT_WATCH_PROGRESS_CONFIG.minTrackingTime).toBe(5);
      expect(DEFAULT_WATCH_PROGRESS_CONFIG.saveDebounceMs).toBe(10000);
      expect(DEFAULT_WATCH_PROGRESS_CONFIG.completionThreshold).toBe(95);
      expect(DEFAULT_WATCH_PROGRESS_CONFIG.minResumePoint).toBe(30);
      expect(DEFAULT_WATCH_PROGRESS_CONFIG.maxContinueWatchingItems).toBe(20);
      expect(DEFAULT_WATCH_PROGRESS_CONFIG.pollingIntervalMs).toBe(15000);
      expect(DEFAULT_WATCH_PROGRESS_CONFIG.oldProgressDays).toBe(90);
    });
  });

  describe('WatchProgressIndex', () => {
    it('should create valid index structure', () => {
      const index: WatchProgressIndex = {
        videoIds: ['video1', 'video2', 'video3'],
        lastUpdated: new Date().toISOString(),
      };
      
      expect(index.videoIds).toHaveLength(3);
      expect(typeof index.lastUpdated).toBe('string');
    });
  });
});
