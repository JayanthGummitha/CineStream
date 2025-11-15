import { renderHook, waitFor } from '@testing-library/react';
import { useNotifications } from '../useNotifications';
import * as notificationsLib from '@/lib/notifications';
import type { Notification } from '@/lib/notifications';

// Mock the notifications library
jest.mock('@/lib/notifications', () => ({
  fetchNotifications: jest.fn(),
  filterNotificationsByTime: jest.fn(),
}));

describe('useNotifications', () => {
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'new_release',
      title: 'New Movie Alert!',
      message: 'Test movie is now available',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      isRead: false,
      actionUrl: '/movie/1',
    },
    {
      id: '2',
      type: 'subscription',
      title: 'Subscription Expiring',
      message: 'Your subscription expires soon',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      isRead: false,
      actionUrl: '/subscription',
    },
    {
      id: '3',
      type: 'system',
      title: 'Welcome',
      message: 'Welcome to CineStream',
      timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(), // 2.5 hours ago
      isRead: true,
      actionUrl: '/',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('notification fetching and state management', () => {
    it('should fetch notifications on mount', async () => {
      const mockFetch = jest.spyOn(notificationsLib, 'fetchNotifications')
        .mockResolvedValue(mockNotifications);
      const mockFilter = jest.spyOn(notificationsLib, 'filterNotificationsByTime')
        .mockReturnValue(mockNotifications);

      const { result } = renderHook(() => useNotifications());

      // Initially loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.notifications).toEqual([]);

      // Wait for fetch to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFilter).toHaveBeenCalledWith(mockNotifications, 3);
      expect(result.current.notifications).toEqual(mockNotifications);
      expect(result.current.error).toBeNull();
    });

    it('should set loading state correctly during fetch', async () => {
      jest.spyOn(notificationsLib, 'fetchNotifications')
        .mockResolvedValue(mockNotifications);
      jest.spyOn(notificationsLib, 'filterNotificationsByTime')
        .mockReturnValue(mockNotifications);

      const { result } = renderHook(() => useNotifications());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should update notifications state after successful fetch', async () => {
      jest.spyOn(notificationsLib, 'fetchNotifications')
        .mockResolvedValue(mockNotifications);
      jest.spyOn(notificationsLib, 'filterNotificationsByTime')
        .mockReturnValue(mockNotifications);

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.notifications).toEqual(mockNotifications);
      });
    });
  });

  describe('time filtering (3 hours cutoff)', () => {
    it('should filter notifications to show only last 3 hours', async () => {
      const recentNotifications = mockNotifications.slice(0, 2); // Only first 2 are within 3 hours
      
      jest.spyOn(notificationsLib, 'fetchNotifications')
        .mockResolvedValue(mockNotifications);
      const mockFilter = jest.spyOn(notificationsLib, 'filterNotificationsByTime')
        .mockReturnValue(recentNotifications);

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFilter).toHaveBeenCalledWith(mockNotifications, 3);
      expect(result.current.notifications).toEqual(recentNotifications);
      expect(result.current.notifications.length).toBe(2);
    });

    it('should pass 3 hours as the time filter parameter', async () => {
      jest.spyOn(notificationsLib, 'fetchNotifications')
        .mockResolvedValue(mockNotifications);
      const mockFilter = jest.spyOn(notificationsLib, 'filterNotificationsByTime')
        .mockReturnValue(mockNotifications);

      renderHook(() => useNotifications());

      await waitFor(() => {
        expect(mockFilter).toHaveBeenCalledWith(mockNotifications, 3);
      });
    });
  });

  describe('unread count calculation', () => {
    it('should calculate unread count correctly', async () => {
      jest.spyOn(notificationsLib, 'fetchNotifications')
        .mockResolvedValue(mockNotifications);
      jest.spyOn(notificationsLib, 'filterNotificationsByTime')
        .mockReturnValue(mockNotifications);

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // 2 unread notifications in mockNotifications
      expect(result.current.unreadCount).toBe(2);
    });

    it('should return 0 unread count when all notifications are read', async () => {
      const readNotifications = mockNotifications.map(n => ({ ...n, isRead: true }));
      
      jest.spyOn(notificationsLib, 'fetchNotifications')
        .mockResolvedValue(readNotifications);
      jest.spyOn(notificationsLib, 'filterNotificationsByTime')
        .mockReturnValue(readNotifications);

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.unreadCount).toBe(0);
      });
    });

    it('should return correct unread count when all notifications are unread', async () => {
      const unreadNotifications = mockNotifications.map(n => ({ ...n, isRead: false }));
      
      jest.spyOn(notificationsLib, 'fetchNotifications')
        .mockResolvedValue(unreadNotifications);
      jest.spyOn(notificationsLib, 'filterNotificationsByTime')
        .mockReturnValue(unreadNotifications);

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.unreadCount).toBe(3);
      });
    });

    it('should return 0 unread count when no notifications exist', async () => {
      jest.spyOn(notificationsLib, 'fetchNotifications')
        .mockResolvedValue([]);
      jest.spyOn(notificationsLib, 'filterNotificationsByTime')
        .mockReturnValue([]);

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.unreadCount).toBe(0);
      });
    });
  });

  describe('error handling scenarios', () => {
    it('should handle fetch errors correctly', async () => {
      const mockError = new Error('Failed to fetch notifications');
      jest.spyOn(notificationsLib, 'fetchNotifications')
        .mockRejectedValue(mockError);

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual(mockError);
      expect(result.current.notifications).toEqual([]);
    });

    it('should convert non-Error objects to Error instances', async () => {
      jest.spyOn(notificationsLib, 'fetchNotifications')
        .mockRejectedValue('String error');

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Failed to fetch notifications');
    });

    it('should clear previous error on successful refetch', async () => {
      const mockError = new Error('Failed to fetch');
      const mockFetch = jest.spyOn(notificationsLib, 'fetchNotifications')
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockNotifications);
      
      jest.spyOn(notificationsLib, 'filterNotificationsByTime')
        .mockReturnValue(mockNotifications);

      const { result } = renderHook(() => useNotifications());

      // Wait for initial error
      await waitFor(() => {
        expect(result.current.error).toEqual(mockError);
      });

      // Refetch
      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.notifications).toEqual(mockNotifications);
      });
    });

    it('should set loading to false even when error occurs', async () => {
      jest.spyOn(notificationsLib, 'fetchNotifications')
        .mockRejectedValue(new Error('Fetch failed'));

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('refetch functionality', () => {
    it('should refetch notifications when refetch is called', async () => {
      const mockFetch = jest.spyOn(notificationsLib, 'fetchNotifications')
        .mockResolvedValue(mockNotifications);
      jest.spyOn(notificationsLib, 'filterNotificationsByTime')
        .mockReturnValue(mockNotifications);

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Call refetch
      await result.current.refetch();

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should update notifications after refetch', async () => {
      const initialNotifications = [mockNotifications[0]];
      const updatedNotifications = mockNotifications;

      const mockFetch = jest.spyOn(notificationsLib, 'fetchNotifications')
        .mockResolvedValueOnce(initialNotifications)
        .mockResolvedValueOnce(updatedNotifications);
      
      const mockFilter = jest.spyOn(notificationsLib, 'filterNotificationsByTime')
        .mockReturnValueOnce(initialNotifications)
        .mockReturnValueOnce(updatedNotifications);

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.notifications).toEqual(initialNotifications);
      });

      // Refetch
      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.notifications).toEqual(updatedNotifications);
      });
    });

    it('should set loading state during refetch', async () => {
      let resolvePromise: () => void;
      const delayedPromise = new Promise<Notification[]>((resolve) => {
        resolvePromise = () => resolve(mockNotifications);
      });

      jest.spyOn(notificationsLib, 'fetchNotifications')
        .mockResolvedValueOnce(mockNotifications)
        .mockReturnValueOnce(delayedPromise);
      jest.spyOn(notificationsLib, 'filterNotificationsByTime')
        .mockReturnValue(mockNotifications);

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Start refetch
      const refetchPromise = result.current.refetch();
      
      // Should be loading during refetch
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Resolve the delayed promise
      resolvePromise!();
      await refetchPromise;

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle errors during refetch', async () => {
      const mockError = new Error('Refetch failed');
      jest.spyOn(notificationsLib, 'fetchNotifications')
        .mockResolvedValueOnce(mockNotifications)
        .mockRejectedValueOnce(mockError);
      
      jest.spyOn(notificationsLib, 'filterNotificationsByTime')
        .mockReturnValue(mockNotifications);

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Refetch with error
      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.error).toEqual(mockError);
      });
    });
  });
});
