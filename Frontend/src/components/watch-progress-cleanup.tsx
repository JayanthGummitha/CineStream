'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { clearOldProgress, getStorageStats } from '@/lib/watch-progress-storage';
import { toast } from 'sonner';

/**
 * Watch Progress Cleanup Component
 * 
 * Handles automatic cleanup and maintenance of watch progress data:
 * - Clears progress older than 90 days on app start
 * - Implements weekly cleanup interval
 * - Monitors storage quota and warns at 80% capacity
 * - Automatically deletes old progress when quota exceeded
 */
export function WatchProgressCleanup() {
  const { isAuthenticated, user } = useAuth();
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasRunInitialCleanup = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      return;
    }

    const userId = user.id;

    /**
     * Perform cleanup of old progress data
     */
    const performCleanup = async () => {
      try {
        // Clear progress older than 90 days
        await clearOldProgress(userId, 90);
        console.log('Watch progress cleanup completed');
      } catch (error) {
        console.error('Failed to cleanup old watch progress:', error);
      }
    };

    /**
     * Check storage quota and warn if approaching limit
     */
    const checkStorageQuota = () => {
      try {
        const stats = getStorageStats(userId);
        
        // Estimate localStorage limit (typically 5-10MB, we'll use 5MB as conservative estimate)
        const ESTIMATED_STORAGE_LIMIT = 5 * 1024 * 1024; // 5MB in bytes
        const usagePercentage = (stats.estimatedSize / ESTIMATED_STORAGE_LIMIT) * 100;

        if (usagePercentage >= 80) {
          toast.warning('Storage Limit Warning', {
            description: `Watch progress storage is at ${Math.round(usagePercentage)}% capacity. Old progress will be automatically cleaned up.`,
            duration: 5000,
          });

          // Automatically clean up old progress when approaching limit
          performCleanup();
        }
      } catch (error) {
        console.error('Failed to check storage quota:', error);
      }
    };

    /**
     * Run initial cleanup on app start (only once per session)
     */
    const runInitialCleanup = async () => {
      if (hasRunInitialCleanup.current) {
        return;
      }

      hasRunInitialCleanup.current = true;
      
      // Run cleanup
      await performCleanup();
      
      // Check storage quota
      checkStorageQuota();
    };

    // Run initial cleanup on mount
    runInitialCleanup();

    // Set up weekly cleanup interval (7 days = 604800000 milliseconds)
    const WEEKLY_INTERVAL = 7 * 24 * 60 * 60 * 1000;
    cleanupIntervalRef.current = setInterval(() => {
      performCleanup();
      checkStorageQuota();
    }, WEEKLY_INTERVAL);

    // Cleanup interval on unmount
    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
        cleanupIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, user?.id]);

  // This component doesn't render anything
  return null;
}
