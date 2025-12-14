/**
 * Watch Progress Storage Service
 * 
 * localStorage-based storage service for tracking user watch progress.
 * Provides functions for save, get, getAll, delete, and clearOld operations
 * with userId-based key structure and index management.
 */

import {
  WatchProgressData,
  WatchProgressIndex,
  WatchProgressError,
} from '@/types/watch-progress';

// Storage key prefixes
const PROGRESS_KEY_PREFIX = 'watch_progress';
const INDEX_KEY_PREFIX = 'watch_progress_index';

// Profile ID for scoped storage (set via setActiveProfile)
let activeProfileId: string | null = null;

/**
 * Set the active profile for scoped watch progress storage
 */
export function setActiveProfile(profileId: string | null): void {
  activeProfileId = profileId;
}

/**
 * Get the active profile ID
 */
export function getActiveProfile(): string | null {
  return activeProfileId;
}

/**
 * Generate storage key for a specific video progress (profile-scoped)
 */
function getProgressKey(userId: string, videoId: string): string {
  const profileSuffix = activeProfileId ? `_${activeProfileId}` : '';
  return `${PROGRESS_KEY_PREFIX}_${userId}${profileSuffix}_${videoId}`;
}

/**
 * Generate storage key for user's progress index (profile-scoped)
 */
function getIndexKey(userId: string): string {
  const profileSuffix = activeProfileId ? `_${activeProfileId}` : '';
  return `${INDEX_KEY_PREFIX}_${userId}${profileSuffix}`;
}

/**
 * Load the progress index for a user
 */
function loadIndex(userId: string): WatchProgressIndex {
  try {
    const indexKey = getIndexKey(userId);
    const indexData = localStorage.getItem(indexKey);
    
    if (!indexData) {
      return {
        videoIds: [],
        lastUpdated: new Date().toISOString(),
      };
    }
    
    const parsed = JSON.parse(indexData);
    
    // Validate index structure
    if (!Array.isArray(parsed.videoIds)) {
      throw new Error('Invalid index structure');
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to load progress index:', error);
    // Return empty index on corruption
    return {
      videoIds: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Save the progress index for a user
 */
function saveIndex(userId: string, index: WatchProgressIndex): void {
  try {
    const indexKey = getIndexKey(userId);
    index.lastUpdated = new Date().toISOString();
    localStorage.setItem(indexKey, JSON.stringify(index));
  } catch (error) {
    console.error('Failed to save progress index:', error);
    throw new WatchProgressError(
      'Failed to save progress index',
      'STORAGE_FULL',
      true
    );
  }
}

/**
 * Add a video ID to the user's progress index
 */
function addToIndex(userId: string, videoId: string): void {
  const index = loadIndex(userId);
  
  if (!index.videoIds.includes(videoId)) {
    index.videoIds.push(videoId);
    saveIndex(userId, index);
  }
}

/**
 * Remove a video ID from the user's progress index
 */
function removeFromIndex(userId: string, videoId: string): void {
  const index = loadIndex(userId);
  index.videoIds = index.videoIds.filter(id => id !== videoId);
  saveIndex(userId, index);
}

/**
 * Validate watch progress data structure
 */
function validateProgressData(data: unknown): data is WatchProgressData {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  const progress = data as Partial<WatchProgressData>;
  
  return !!(
    progress.videoId &&
    progress.userId &&
    progress.contentType &&
    typeof progress.currentTime === 'number' &&
    typeof progress.duration === 'number' &&
    typeof progress.percentage === 'number' &&
    progress.lastWatchedAt &&
    progress.title
  );
}

/**
 * Save watch progress for a user
 * 
 * @throws {WatchProgressError} When storage quota is exceeded or data is invalid
 */
export async function saveProgress(
  userId: string,
  data: WatchProgressData
): Promise<void> {
  if (!userId) {
    throw new WatchProgressError(
      'User ID is required',
      'AUTH_REQUIRED',
      false
    );
  }
  
  if (!validateProgressData(data)) {
    throw new WatchProgressError(
      'Invalid progress data structure',
      'INVALID_DATA',
      false
    );
  }
  
  try {
    const key = getProgressKey(userId, data.videoId);
    const serialized = JSON.stringify(data);
    
    localStorage.setItem(key, serialized);
    addToIndex(userId, data.videoId);
  } catch (error) {
    // Check if it's a quota exceeded error
    if (
      error instanceof Error &&
      (error.name === 'QuotaExceededError' ||
        error.message.includes('quota'))
    ) {
      // Attempt automatic cleanup when quota exceeded
      try {
        await clearOldProgress(userId, 90);
        // Retry save after cleanup
        localStorage.setItem(getProgressKey(userId, data.videoId), JSON.stringify(data));
        addToIndex(userId, data.videoId);
        return;
      } catch (cleanupError) {
        // If cleanup fails, throw original error
        throw new WatchProgressError(
          'Storage quota exceeded',
          'STORAGE_FULL',
          true
        );
      }
    }
    
    throw new WatchProgressError(
      'Failed to save progress',
      'INVALID_DATA',
      true
    );
  }
}

/**
 * Get watch progress for a specific video
 * 
 * @returns Progress data or null if not found
 */
export async function getProgress(
  userId: string,
  videoId: string
): Promise<WatchProgressData | null> {
  if (!userId) {
    return null;
  }
  
  try {
    const key = getProgressKey(userId, videoId);
    const data = localStorage.getItem(key);
    
    if (!data) {
      return null;
    }
    
    const parsed = JSON.parse(data);
    
    if (!validateProgressData(parsed)) {
      console.warn('Corrupted progress data found, removing:', videoId);
      await deleteProgress(userId, videoId);
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to get progress:', error);
    // Try to clean up corrupted data
    try {
      await deleteProgress(userId, videoId);
    } catch {
      // Ignore cleanup errors
    }
    return null;
  }
}

/**
 * Get all watch progress entries for a user
 * 
 * @returns Array of progress data sorted by lastWatchedAt (most recent first)
 */
export async function getAllProgress(
  userId: string
): Promise<WatchProgressData[]> {
  if (!userId) {
    return [];
  }
  
  try {
    const index = loadIndex(userId);
    const progressList: WatchProgressData[] = [];
    const validVideoIds: string[] = [];
    
    for (const videoId of index.videoIds) {
      const progress = await getProgress(userId, videoId);
      
      if (progress) {
        progressList.push(progress);
        validVideoIds.push(videoId);
      }
    }
    
    // Update index if some entries were invalid
    if (validVideoIds.length !== index.videoIds.length) {
      index.videoIds = validVideoIds;
      saveIndex(userId, index);
    }
    
    // Sort by most recent first
    progressList.sort((a, b) => {
      return new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime();
    });
    
    return progressList;
  } catch (error) {
    console.error('Failed to get all progress:', error);
    return [];
  }
}

/**
 * Delete watch progress for a specific video
 */
export async function deleteProgress(
  userId: string,
  videoId: string
): Promise<void> {
  if (!userId) {
    return;
  }
  
  try {
    const key = getProgressKey(userId, videoId);
    localStorage.removeItem(key);
    removeFromIndex(userId, videoId);
  } catch (error) {
    console.error('Failed to delete progress:', error);
    throw new WatchProgressError(
      'Failed to delete progress',
      'INVALID_DATA',
      true
    );
  }
}

/**
 * Clear watch progress older than specified days
 * 
 * @param userId User identifier
 * @param daysOld Number of days to consider as "old"
 */
export async function clearOldProgress(
  userId: string,
  daysOld: number
): Promise<void> {
  if (!userId) {
    return;
  }
  
  try {
    const allProgress = await getAllProgress(userId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const deletePromises = allProgress
      .filter(progress => {
        const lastWatched = new Date(progress.lastWatchedAt);
        return lastWatched < cutoffDate;
      })
      .map(progress => deleteProgress(userId, progress.videoId));
    
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Failed to clear old progress:', error);
    throw new WatchProgressError(
      'Failed to clear old progress',
      'INVALID_DATA',
      true
    );
  }
}

/**
 * Clear all watch progress for a user (used for data reset)
 */
export async function clearAllProgress(userId: string): Promise<void> {
  if (!userId) {
    return;
  }
  
  try {
    const index = loadIndex(userId);
    
    // Delete all progress entries
    for (const videoId of index.videoIds) {
      const key = getProgressKey(userId, videoId);
      localStorage.removeItem(key);
    }
    
    // Clear the index
    const indexKey = getIndexKey(userId);
    localStorage.removeItem(indexKey);
  } catch (error) {
    console.error('Failed to clear all progress:', error);
    throw new WatchProgressError(
      'Failed to clear all progress',
      'CORRUPTED',
      false
    );
  }
}

/**
 * Get storage usage statistics
 */
export function getStorageStats(userId: string): {
  totalEntries: number;
  estimatedSize: number;
} {
  try {
    const index = loadIndex(userId);
    let estimatedSize = 0;
    
    // Estimate size of all entries
    for (const videoId of index.videoIds) {
      const key = getProgressKey(userId, videoId);
      const data = localStorage.getItem(key);
      if (data) {
        estimatedSize += data.length * 2; // UTF-16 encoding
      }
    }
    
    return {
      totalEntries: index.videoIds.length,
      estimatedSize,
    };
  } catch (error) {
    console.error('Failed to get storage stats:', error);
    return {
      totalEntries: 0,
      estimatedSize: 0,
    };
  }
}
