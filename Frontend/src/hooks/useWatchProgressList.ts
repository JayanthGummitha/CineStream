/**
 * useWatchProgressList Hook
 * 
 * Hook for managing the Continue Watching section.
 * Provides functions to get all progress, remove progress, and refresh the list.
 * Filters to show only 1-95% completion range and limits to 20 most recent items.
 * 
 * Features:
 * - Automatic refresh on tab focus (Page Visibility API)
 * - 15-second polling for multi-device sync simulation
 * - Manual refresh capability
 * - Loading states during refresh operations
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfiles } from '@/contexts/ProfileContext';
import {
  getAllProgress,
  deleteProgress,
  setActiveProfile,
} from '@/lib/watch-progress-storage';
import {
  WatchProgressData,
  UseWatchProgressListReturn,
} from '@/types/watch-progress';

/**
 * Hook for managing watch progress list for Continue Watching section
 * 
 * Features:
 * - Loads all progress entries for the current user
 * - Filters to show only 1-95% completion range
 * - Sorts by most recent first
 * - Limits to 20 most recent items
 * - Provides remove functionality with optimistic UI updates
 * - Provides manual refresh capability
 * 
 * @returns Object containing progressList, isLoading, removeProgress, and refreshProgress
 */
export function useWatchProgressList(): UseWatchProgressListReturn {
  const { isAuthenticated, user } = useAuth();
  const { activeProfile } = useProfiles();
  const [progressList, setProgressList] = useState<WatchProgressData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastLoadTimeRef = useRef<number>(0);
  
  // Sync active profile with watch progress storage
  useEffect(() => {
    setActiveProfile(activeProfile?.id || null);
  }, [activeProfile?.id]);

  /**
   * Load all progress entries for the current user
   * Filters and sorts according to requirements
   * 
   * @param isManualRefresh - Whether this is a manual refresh (shows loading state)
   */
  const loadProgress = useCallback(async (isManualRefresh = false) => {
    if (!isAuthenticated || !user?.id) {
      setProgressList([]);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      // Show appropriate loading state
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else if (progressList.length === 0) {
        setIsLoading(true);
      }
      
      // Ensure active profile is set before loading
      setActiveProfile(activeProfile?.id || null);
      
      // Get all progress from storage (profile-scoped)
      const allProgress = await getAllProgress(user.id);
      
      // Filter to only show 1-95% completion range
      const filteredProgress = allProgress.filter(
        (progress) => progress.percentage >= 1 && progress.percentage < 95
      );
      
      // Sort by most recent first (already sorted by storage service)
      // Limit to 20 most recent items
      const limitedProgress = filteredProgress.slice(0, 20);
      
      setProgressList(limitedProgress);
      lastLoadTimeRef.current = Date.now();
    } catch (error) {
      console.error('Failed to load watch progress list:', error);
      setProgressList([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isAuthenticated, user?.id, progressList.length, activeProfile?.id]);

  /**
   * Remove a progress entry with optimistic UI update
   * 
   * @param videoId - The video ID to remove
   */
  const removeProgress = useCallback(
    async (videoId: string) => {
      if (!user?.id) {
        return;
      }

      // Optimistic UI update - remove immediately
      setProgressList((prev) => prev.filter((p) => p.videoId !== videoId));

      try {
        // Delete from storage
        await deleteProgress(user.id, videoId);
      } catch (error) {
        console.error('Failed to remove progress:', error);
        
        // Revert optimistic update on error by reloading
        await loadProgress();
      }
    },
    [user?.id, loadProgress]
  );

  /**
   * Manually refresh the progress list
   * Shows loading state during refresh
   */
  const refreshProgress = useCallback(() => {
    loadProgress(true);
  }, [loadProgress]);

  // Load progress on mount and when authentication state changes
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Set up 15-second polling for multi-device sync simulation
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      // Clear polling if user is not authenticated
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // Start polling every 15 seconds
    pollingIntervalRef.current = setInterval(() => {
      // Only poll if not currently loading or refreshing
      if (!isLoading && !isRefreshing) {
        loadProgress(false);
      }
    }, 15000); // 15 seconds

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, user?.id, isLoading, isRefreshing, loadProgress]);

  // Set up Page Visibility API listener to refresh on tab focus
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      return;
    }

    const handleVisibilityChange = () => {
      // Only refresh when tab becomes visible
      if (!document.hidden) {
        // Check if it's been more than 5 seconds since last load
        // to avoid excessive refreshes
        const timeSinceLastLoad = Date.now() - lastLoadTimeRef.current;
        if (timeSinceLastLoad > 5000) {
          loadProgress(false);
        }
      }
    };

    // Add event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, user?.id, loadProgress]);

  return {
    progressList,
    isLoading,
    isRefreshing,
    removeProgress,
    refreshProgress,
  };
}
