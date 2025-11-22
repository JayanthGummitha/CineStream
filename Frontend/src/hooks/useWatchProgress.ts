/**
 * useWatchProgress Hook
 * 
 * Centralized hook for tracking and managing watch progress for video content.
 * Provides automatic progress saving with debouncing, resume point loading,
 * and completion handling.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  saveProgress as saveProgressToStorage,
  getProgress as getProgressFromStorage,
  deleteProgress as deleteProgressFromStorage,
} from '@/lib/watch-progress-storage';
import {
  WatchProgressData,
  WatchProgressError,
} from '@/types/watch-progress';

/**
 * Metadata for the content being watched
 */
export interface WatchProgressMetadata {
  /** Title of the content */
  title: string;
  
  /** Optional thumbnail URL */
  thumbnail?: string;
  
  /** Season number (for TV shows only) */
  seasonNumber?: number;
  
  /** Episode number (for TV shows only) */
  episodeNumber?: number;
  
  /** Episode title (for TV shows only) */
  episodeTitle?: string;
}

/**
 * Return type for useWatchProgress hook
 */
export interface UseWatchProgressReturn {
  /** Current progress data */
  progress: WatchProgressData | null;
  
  /** Function to save progress with current time and duration */
  saveProgress: (currentTime: number, duration: number) => void;
  
  /** Function to mark content as completed (saves at 100%, keeps in watch history) */
  clearProgress: () => void;
  
  /** Resume point in seconds (null if no progress exists) */
  resumePoint: number | null;
  
  /** Loading state */
  isLoading: boolean;
}

/**
 * Hook for tracking watch progress
 * 
 * @param videoId - Unique identifier for the video content
 * @param contentType - Type of content (movie, tv-show, trailer)
 * @param metadata - Content metadata (title, thumbnail, episode info)
 * @returns Progress tracking functions and state
 */
export function useWatchProgress(
  videoId: string,
  contentType: 'movie' | 'tv-show' | 'trailer',
  metadata: WatchProgressMetadata
): UseWatchProgressReturn {
  const { isAuthenticated, user } = useAuth();
  const [progress, setProgress] = useState<WatchProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resumePoint, setResumePoint] = useState<number | null>(null);
  
  // Refs for debouncing
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(0);
  const isMountedRef = useRef(true);
  
  /**
   * Load existing progress on mount
   */
  useEffect(() => {
    isMountedRef.current = true;
    
    const loadProgress = async () => {
      // Only load progress for authenticated users
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        setProgress(null);
        setResumePoint(null);
        return;
      }
      
      try {
        const existingProgress = await getProgressFromStorage(user.id, videoId);
        
        if (!isMountedRef.current) return;
        
        if (existingProgress) {
          setProgress(existingProgress);
          // Set resume point if progress is meaningful (> 30 seconds and < 95%)
          if (
            existingProgress.currentTime > 30 &&
            existingProgress.percentage < 95
          ) {
            setResumePoint(existingProgress.currentTime);
          }
        }
      } catch (error) {
        // Log error but don't break functionality
        console.error('Failed to load watch progress:', error);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };
    
    loadProgress();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [videoId, isAuthenticated, user]);
  
  /**
   * Save progress immediately (throttling handled by caller)
   */
  const saveProgress = useCallback(
    async (currentTime: number, duration: number) => {
     

      // Don't track for unauthenticated users
      if (!isAuthenticated || !user) {
        return;
      }
      
      // Calculate percentage
      const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;
      
      try {
        const progressData: WatchProgressData = {
          videoId,
          userId: user.id,
          contentType,
          currentTime,
          duration,
          percentage,
          lastWatchedAt: new Date().toISOString(),
          title: metadata.title,
          thumbnail: metadata.thumbnail,
          seasonNumber: metadata.seasonNumber,
          episodeNumber: metadata.episodeNumber,
          episodeTitle: metadata.episodeTitle,
        };
        
     
        
        await saveProgressToStorage(user.id, progressData);
        
        
        if (isMountedRef.current) {
          setProgress(progressData);
        }
        
        lastSaveTimeRef.current = Date.now();
      } catch (error) {
        // Handle storage errors gracefully
        if (error instanceof WatchProgressError) {
          if (error.code === 'STORAGE_FULL') {
            console.warn('Storage quota exceeded. Progress not saved.');
          } else {
            console.error('Failed to save progress:', error.message);
          }
        } else {
          console.error('Unexpected error saving progress:', error);
        }
      }
    },
    [videoId, contentType, metadata, isAuthenticated, user]
  );
  
  /**
   * Mark content as completed (save at 100%)
   * 
   * IMPORTANT: We DO NOT delete completed items from storage.
   * Completed items should remain in watch history for 30 days.
   * They will be automatically cleaned up by the clearOldProgress function.
   * 
   * This function saves the progress at 100% to mark completion.
   */
  const clearProgress = useCallback(async () => {
    // Don't clear for unauthenticated users
    if (!isAuthenticated || !user) {
      return;
    }
    
    // Clear any pending save operations
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
    try {
      // Instead of deleting, save progress at 100% to mark as completed
      // This keeps the item in watch history
      const completedProgressData: WatchProgressData = {
        videoId,
        userId: user.id,
        contentType,
        currentTime: progress?.duration || 0,
        duration: progress?.duration || 0,
        percentage: 100,
        lastWatchedAt: new Date().toISOString(),
        title: metadata.title,
        thumbnail: metadata.thumbnail,
        seasonNumber: metadata.seasonNumber,
        episodeNumber: metadata.episodeNumber,
        episodeTitle: metadata.episodeTitle,
      };
      
      await saveProgressToStorage(user.id, completedProgressData);
      
      if (isMountedRef.current) {
        setProgress(completedProgressData);
        setResumePoint(null); // Clear resume point since it's completed
      }
    } catch (error) {
      // Log error but don't break functionality
      console.error('Failed to mark progress as completed:', error);
    }
  }, [videoId, contentType, metadata, isAuthenticated, user, progress]);
  
  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Clear any pending timeouts to prevent memory leaks
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      isMountedRef.current = false;
    };
  }, []);
  
  return {
    progress,
    saveProgress,
    clearProgress,
    resumePoint,
    isLoading,
  };
}
