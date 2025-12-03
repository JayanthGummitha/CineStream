/**
 * Watch Progress Tracking Types
 * 
 * Type definitions for the watch progress tracking system that monitors
 * user viewing activity across movies, TV shows, and trailers.
 * 
 * This module provides comprehensive type safety for:
 * - Progress data storage and retrieval
 * - Hook return types and parameters
 * - Error handling and recovery
 * - Storage service interfaces
 * 
 * @module watch-progress
 */

/**
 * Content type enumeration for watch progress tracking
 * 
 * Defines the types of content that can be tracked:
 * - `movie`: Feature films
 * - `tv-show`: Television series episodes
 * - `trailer`: Preview content
 */
export type ContentType = 'movie' | 'tv-show' | 'trailer';

/**
 * Represents the watch progress data for a single piece of content
 * 
 * This is the core data structure that stores all information about
 * a user's viewing progress for a specific video. It includes playback
 * position, metadata, and timestamps for resume functionality.
 * 
 * @example
 * ```typescript
 * const progress: WatchProgressData = {
 *   videoId: 'movie-123',
 *   userId: 'user-456',
 *   contentType: 'movie',
 *   currentTime: 3600,
 *   duration: 7200,
 *   percentage: 50,
 *   lastWatchedAt: '2025-01-15T10:30:00Z',
 *   title: 'The Matrix',
 *   thumbnail: '/images/matrix.jpg'
 * };
 * ```
 */
export interface WatchProgressData {
  /** Unique identifier for the video content */
  videoId: string;
  
  /** User identifier who is watching the content */
  userId: string;
  
  /** Type of content being watched */
  contentType: ContentType;
  
  /** Current playback position in seconds */
  currentTime: number;
  
  /** Total duration of the content in seconds */
  duration: number;
  
  /** Completion percentage (0-100) */
  percentage: number;
  
  /** ISO 8601 timestamp of when the content was last watched */
  lastWatchedAt: string;
  
  /** Title of the content (movie title or series name) */
  title: string;
  
  /** Optional thumbnail URL for display in Continue Watching */
  thumbnail?: string;
  
  /** Season number (for TV shows only) */
  seasonNumber?: number;
  
  /** Episode number (for TV shows only) */
  episodeNumber?: number;
  
  /** Episode title (for TV shows only) */
  episodeTitle?: string;
  
  /** Series/Show name (for TV shows only, used for URL generation) */
  seriesName?: string;
}

/**
 * Index structure for managing user's watch progress entries
 * 
 * Maintains a list of video IDs that have progress data for efficient
 * querying and cleanup operations. This index is stored separately from
 * individual progress entries to enable fast lookups.
 * 
 * @internal
 */
export interface WatchProgressIndex {
  /** Array of video IDs that have progress data */
  videoIds: string[];
  
  /** ISO 8601 timestamp of last index update */
  lastUpdated: string;
}

/**
 * Error codes for watch progress operations
 * 
 * Categorizes different types of errors that can occur during
 * progress tracking operations:
 * - `STORAGE_FULL`: localStorage quota exceeded
 * - `INVALID_DATA`: Corrupted or malformed progress data
 * - `AUTH_REQUIRED`: User must be authenticated to track progress
 * - `CORRUPTED`: Storage index or data structure is corrupted
 * - `NOT_FOUND`: Requested progress entry does not exist
 */
export type WatchProgressErrorCode = 
  | 'STORAGE_FULL'
  | 'INVALID_DATA'
  | 'AUTH_REQUIRED'
  | 'CORRUPTED'
  | 'NOT_FOUND';

/**
 * Custom error class for watch progress operations
 * 
 * Provides structured error handling with error codes and recovery flags.
 * The `recoverable` flag indicates whether the operation can be retried
 * after cleanup or user intervention.
 * 
 * @example
 * ```typescript
 * throw new WatchProgressError(
 *   'Storage quota exceeded',
 *   'STORAGE_FULL',
 *   true // recoverable after cleanup
 * );
 * ```
 */
export class WatchProgressError extends Error {
  /**
   * Creates a new WatchProgressError
   * 
   * @param message - Human-readable error description
   * @param code - Error code for programmatic handling
   * @param recoverable - Whether the error can be recovered from
   */
  constructor(
    message: string,
    public code: WatchProgressErrorCode,
    public recoverable: boolean
  ) {
    super(message);
    this.name = 'WatchProgressError';
  }
}

/**
 * Metadata for the content being watched
 * 
 * Contains display information needed to show progress in the UI.
 * This metadata is stored alongside progress data for efficient
 * rendering of the Continue Watching section.
 * 
 * @example
 * ```typescript
 * const metadata: WatchProgressMetadata = {
 *   title: 'Breaking Bad',
 *   thumbnail: '/images/breaking-bad.jpg',
 *   seasonNumber: 1,
 *   episodeNumber: 1,
 *   episodeTitle: 'Pilot'
 * };
 * ```
 */
export interface WatchProgressMetadata {
  /** Title of the content */
  title: string;
  
  /** Optional thumbnail URL for display */
  thumbnail?: string;
  
  /** Season number (for TV shows only) */
  seasonNumber?: number;
  
  /** Episode number (for TV shows only) */
  episodeNumber?: number;
  
  /** Episode title (for TV shows only) */
  episodeTitle?: string;
  
  /** Series/Show name (for TV shows only, used for URL generation) */
  seriesName?: string;
}

/**
 * Return type for useWatchProgress hook
 * 
 * Provides all functionality needed to track progress for a single video.
 * The hook handles debouncing, authentication, and automatic cleanup.
 * 
 * @example
 * ```typescript
 * const { saveProgress, resumePoint, clearProgress } = useWatchProgress(
 *   'movie-123',
 *   'movie',
 *   { title: 'The Matrix' }
 * );
 * 
 * // In video player time update handler
 * saveProgress(currentTime, duration);
 * 
 * // On video completion
 * if (percentage >= 95) {
 *   clearProgress();
 * }
 * ```
 */
export interface UseWatchProgressReturn {
  /** Current progress data (null if no progress exists) */
  progress: WatchProgressData | null;
  
  /** 
   * Function to save progress with current time and duration
   * Automatically debounced to prevent excessive storage writes
   * 
   * @param currentTime - Current playback position in seconds
   * @param duration - Total video duration in seconds
   */
  saveProgress: (currentTime: number, duration: number) => void;
  
  /** 
   * Function to clear progress (when content is completed)
   * Removes the progress entry from storage
   */
  clearProgress: () => void;
  
  /** 
   * Resume point in seconds (null if no progress exists or < 30 seconds)
   * Use this to seek the video player on load
   */
  resumePoint: number | null;
  
  /** Loading state (true while fetching initial progress) */
  isLoading: boolean;
}

/**
 * Return type for useWatchProgressList hook
 * 
 * Provides functionality for the Continue Watching section, including
 * automatic refresh, manual refresh, and remove operations.
 * 
 * Features:
 * - Automatic refresh on tab focus (Page Visibility API)
 * - 15-second polling for multi-device sync simulation
 * - Optimistic UI updates for remove operations
 * - Filters to show only 1-95% completion range
 * - Limits to 20 most recent items
 * 
 * @example
 * ```typescript
 * const { progressList, removeProgress, refreshProgress } = useWatchProgressList();
 * 
 * // Display in Continue Watching section
 * {progressList.map(progress => (
 *   <ContinueWatchingCard
 *     key={progress.videoId}
 *     progress={progress}
 *     onRemove={() => removeProgress(progress.videoId)}
 *   />
 * ))}
 * ```
 */
export interface UseWatchProgressListReturn {
  /** 
   * List of progress entries sorted by most recent first
   * Filtered to show only 1-95% completion range
   * Limited to 20 most recent items
   */
  progressList: WatchProgressData[];
  
  /** Loading state (true during initial load) */
  isLoading: boolean;
  
  /** Refreshing state (true during manual or automatic refresh) */
  isRefreshing: boolean;
  
  /** 
   * Function to remove a progress entry
   * Performs optimistic UI update for immediate feedback
   * 
   * @param videoId - The video ID to remove from progress
   */
  removeProgress: (videoId: string) => void;
  
  /** 
   * Function to manually refresh progress list
   * Shows loading state during refresh
   */
  refreshProgress: () => void;
}

/**
 * Storage service interface for watch progress operations
 * 
 * Defines the contract for progress storage implementations.
 * Currently implemented with localStorage, but designed to support
 * future migration to database storage (Supabase/PostgreSQL).
 * 
 * @example
 * ```typescript
 * // Save progress
 * await saveProgress(userId, progressData);
 * 
 * // Get progress for specific video
 * const progress = await getProgress(userId, videoId);
 * 
 * // Get all progress for user
 * const allProgress = await getAllProgress(userId);
 * 
 * // Delete progress
 * await deleteProgress(userId, videoId);
 * 
 * // Cleanup old progress
 * await clearOldProgress(userId, 90); // 90 days
 * ```
 */
export interface ProgressStorageService {
  /**
   * Save watch progress for a user
   * 
   * @param userId - User identifier
   * @param data - Progress data to save
   * @throws {WatchProgressError} When storage quota is exceeded or data is invalid
   */
  saveProgress(userId: string, data: WatchProgressData): Promise<void>;
  
  /**
   * Get watch progress for a specific video
   * 
   * @param userId - User identifier
   * @param videoId - Video identifier
   * @returns Progress data or null if not found
   */
  getProgress(userId: string, videoId: string): Promise<WatchProgressData | null>;
  
  /**
   * Get all watch progress entries for a user
   * 
   * @param userId - User identifier
   * @returns Array of progress data sorted by lastWatchedAt (most recent first)
   */
  getAllProgress(userId: string): Promise<WatchProgressData[]>;
  
  /**
   * Delete watch progress for a specific video
   * 
   * @param userId - User identifier
   * @param videoId - Video identifier
   * @throws {WatchProgressError} When deletion fails
   */
  deleteProgress(userId: string, videoId: string): Promise<void>;
  
  /**
   * Clear watch progress older than specified days
   * 
   * @param userId - User identifier
   * @param daysOld - Number of days to consider as "old"
   * @throws {WatchProgressError} When cleanup fails
   */
  clearOldProgress(userId: string, daysOld: number): Promise<void>;
  
  /**
   * Clear all watch progress for a user
   * Used for data reset or account deletion
   * 
   * @param userId - User identifier
   * @throws {WatchProgressError} When clearing fails
   */
  clearAllProgress(userId: string): Promise<void>;
}

/**
 * Storage statistics for monitoring usage
 * 
 * Provides information about storage usage for a user's progress data.
 * Useful for monitoring quota usage and triggering cleanup operations.
 */
export interface StorageStats {
  /** Total number of progress entries */
  totalEntries: number;
  
  /** Estimated storage size in bytes */
  estimatedSize: number;
  
  /** Percentage of estimated quota used (0-100) */
  quotaUsagePercent?: number;
}

/**
 * Configuration options for watch progress tracking
 * 
 * Allows customization of tracking behavior and thresholds.
 */
export interface WatchProgressConfig {
  /** Minimum playback time (seconds) before tracking starts */
  minTrackingTime?: number;
  
  /** Debounce interval (milliseconds) for save operations */
  saveDebounceMs?: number;
  
  /** Completion threshold percentage (0-100) */
  completionThreshold?: number;
  
  /** Minimum resume point (seconds) to show resume option */
  minResumePoint?: number;
  
  /** Maximum number of items in Continue Watching */
  maxContinueWatchingItems?: number;
  
  /** Polling interval (milliseconds) for progress refresh */
  pollingIntervalMs?: number;
  
  /** Number of days before progress is considered old */
  oldProgressDays?: number;
}

/**
 * Default configuration values
 */
export const DEFAULT_WATCH_PROGRESS_CONFIG: Required<WatchProgressConfig> = {
  minTrackingTime: 5,
  saveDebounceMs: 10000,
  completionThreshold: 95,
  minResumePoint: 30,
  maxContinueWatchingItems: 20,
  pollingIntervalMs: 15000,
  oldProgressDays: 90,
};
