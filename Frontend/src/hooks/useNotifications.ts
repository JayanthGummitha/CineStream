import { useState, useEffect, useCallback } from 'react';
import { 
  fetchNotifications as fetchNotificationsUtil,
  filterNotificationsByTime,
  type Notification 
} from '@/lib/notifications';

interface UseNotificationsReturn {
  notifications: Notification[];
  isLoading: boolean;
  error: Error | null;
  unreadCount: number;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage notification data
 * - Fetches notifications from TMDB API
 * - Filters to show only notifications from the last 3 hours
 * - Limits results to maximum 10 notifications
 * - Provides unread count and refetch functionality
 */
export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch notifications function
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all notifications
      const allNotifications = await fetchNotificationsUtil();

      // Filter to show only notifications from the last 3 hours
      const recentNotifications = filterNotificationsByTime(allNotifications, 3);

      setNotifications(recentNotifications);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch notifications');
      setError(error);
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Refetch function for manual updates
  const refetch = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    refetch
  };
}
