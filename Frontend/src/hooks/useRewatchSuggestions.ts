/**
 * useRewatchSuggestions Hook
 * 
 * Hook for fetching completed content from 15-20 days ago to suggest for rewatching.
 * This provides personalized rewatch suggestions based on user's viewing history.
 * 
 * @module useRewatchSuggestions
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { WatchProgressData } from '@/types/watch-progress';
import { getAllProgress } from '@/lib/watch-progress-storage';
import { useAuth } from '@/hooks/useAuth';

/**
 * Return type for useRewatchSuggestions hook
 */
export interface UseRewatchSuggestionsReturn {
  /** Completed items from 15-20 days ago */
  suggestions: WatchProgressData[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
}

/**
 * Hook for getting rewatch suggestions from completed content 15-20 days ago
 * 
 * Filters completed content (90%+) that was watched between 15-20 days ago
 * to suggest content users might want to rewatch.
 * 
 * @example
 * ```tsx
 * const { suggestions, isLoading } = useRewatchSuggestions();
 * 
 * {!isLoading && suggestions.length > 0 && (
 *   <RewatchSection items={suggestions} />
 * )}
 * ```
 */
export function useRewatchSuggestions(): UseRewatchSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<WatchProgressData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const userId = user?.id || '';

  const loadSuggestions = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      setSuggestions([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get all progress
      const allProgress = await getAllProgress(userId);

      // Calculate date range: 15-20 days ago
      const now = new Date();
      const twentyDaysAgo = new Date(now);
      twentyDaysAgo.setDate(now.getDate() - 20);
      
      const fifteenDaysAgo = new Date(now);
      fifteenDaysAgo.setDate(now.getDate() - 15);

      // Filter for completed content (90%+) from 15-20 days ago
      const filtered = allProgress.filter((item) => {
        const lastWatched = new Date(item.lastWatchedAt);
        const isCompleted = item.percentage >= 90;
        const isInDateRange = lastWatched >= twentyDaysAgo && lastWatched <= fifteenDaysAgo;
        
        return isCompleted && isInDateRange;
      });

      // Sort by most recent first
      filtered.sort((a, b) => {
        return new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime();
      });

      // Limit to 10 suggestions for homepage
      setSuggestions(filtered.slice(0, 10));
    } catch (err) {
      console.error('Failed to load rewatch suggestions:', err);
      setError('Unable to load rewatch suggestions');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  return {
    suggestions,
    isLoading,
    error,
  };
}
