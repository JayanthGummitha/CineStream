/**
 * @jest-environment jsdom
 */

/**
 * Unit tests for notification utilities
 * Tests requirements 2.1, 2.2, 2.3: Time filtering, timestamp formatting, and notification helpers
 */

import {
  formatTimestamp,
  getNotificationIconComponent,
  getNotificationColor,
  filterNotificationsByTime,
  type Notification,
} from '@/lib/notifications';
import { Bell, Sparkles, CreditCard, TrendingUp, Clock } from 'lucide-react';

describe('Notification Utilities', () => {
  describe('formatTimestamp', () => {
    beforeEach(() => {
      // Mock current time to a fixed date for consistent testing
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return "Just now" for timestamps within 1 minute', () => {
      const timestamp = new Date('2024-01-15T11:59:30Z').toISOString();
      expect(formatTimestamp(timestamp)).toBe('Just now');
    });

    it('should return minutes ago for timestamps within 1 hour', () => {
      const timestamp30min = new Date('2024-01-15T11:30:00Z').toISOString();
      expect(formatTimestamp(timestamp30min)).toBe('30m ago');

      const timestamp45min = new Date('2024-01-15T11:15:00Z').toISOString();
      expect(formatTimestamp(timestamp45min)).toBe('45m ago');
    });

    it('should return hours ago for timestamps within 24 hours', () => {
      const timestamp2h = new Date('2024-01-15T10:00:00Z').toISOString();
      expect(formatTimestamp(timestamp2h)).toBe('2h ago');

      const timestamp12h = new Date('2024-01-15T00:00:00Z').toISOString();
      expect(formatTimestamp(timestamp12h)).toBe('12h ago');
    });

    it('should return days ago for timestamps within 7 days', () => {
      const timestamp2d = new Date('2024-01-13T12:00:00Z').toISOString();
      expect(formatTimestamp(timestamp2d)).toBe('2d ago');

      const timestamp5d = new Date('2024-01-10T12:00:00Z').toISOString();
      expect(formatTimestamp(timestamp5d)).toBe('5d ago');
    });

    it('should return formatted date for timestamps older than 7 days', () => {
      const timestamp = new Date('2024-01-01T12:00:00Z').toISOString();
      const result = formatTimestamp(timestamp);
      expect(result).toBe('Jan 1');
    });
  });

  describe('getNotificationIconComponent', () => {
    it('should return Sparkles icon for new_release type', () => {
      expect(getNotificationIconComponent('new_release')).toBe(Sparkles);
    });

    it('should return CreditCard icon for subscription type', () => {
      expect(getNotificationIconComponent('subscription')).toBe(CreditCard);
    });

    it('should return TrendingUp icon for trending type', () => {
      expect(getNotificationIconComponent('trending')).toBe(TrendingUp);
    });

    it('should return Clock icon for reminder type', () => {
      expect(getNotificationIconComponent('reminder')).toBe(Clock);
    });

    it('should return Bell icon for system type', () => {
      expect(getNotificationIconComponent('system')).toBe(Bell);
    });

    it('should return Bell icon as default for unknown type', () => {
      expect(getNotificationIconComponent('unknown' as any)).toBe(Bell);
    });
  });

  describe('getNotificationColor', () => {
    it('should return green gradient for new_release type', () => {
      expect(getNotificationColor('new_release')).toBe('from-green-500 to-emerald-600');
    });

    it('should return orange-red gradient for subscription type', () => {
      expect(getNotificationColor('subscription')).toBe('from-orange-500 to-red-600');
    });

    it('should return pink-purple gradient for trending type', () => {
      expect(getNotificationColor('trending')).toBe('from-pink-500 to-purple-600');
    });

    it('should return blue-cyan gradient for reminder type', () => {
      expect(getNotificationColor('reminder')).toBe('from-blue-500 to-cyan-600');
    });

    it('should return yellow-amber gradient for system type', () => {
      expect(getNotificationColor('system')).toBe('from-yellow-500 to-amber-600');
    });

    it('should return gray gradient as default for unknown type', () => {
      expect(getNotificationColor('unknown' as any)).toBe('from-gray-500 to-gray-600');
    });
  });

  describe('filterNotificationsByTime', () => {
    const createNotification = (hoursAgo: number, id: string): Notification => ({
      id,
      type: 'new_release',
      title: `Notification ${id}`,
      message: 'Test message',
      timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
      isRead: false,
    });

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should filter notifications within default 3 hours', () => {
      const notifications: Notification[] = [
        createNotification(1, '1'), // 1 hour ago - included
        createNotification(2, '2'), // 2 hours ago - included
        createNotification(4, '3'), // 4 hours ago - excluded
        createNotification(5, '4'), // 5 hours ago - excluded
      ];

      const filtered = filterNotificationsByTime(notifications);
      expect(filtered).toHaveLength(2);
      expect(filtered[0].id).toBe('1');
      expect(filtered[1].id).toBe('2');
    });

    it('should filter notifications with custom time range', () => {
      const notifications: Notification[] = [
        createNotification(1, '1'),
        createNotification(3, '2'),
        createNotification(5, '3'),
        createNotification(7, '4'),
      ];

      const filtered = filterNotificationsByTime(notifications, 6);
      expect(filtered).toHaveLength(3);
      expect(filtered.map(n => n.id)).toEqual(['1', '2', '3']);
    });

    it('should sort notifications by timestamp in descending order (newest first)', () => {
      const notifications: Notification[] = [
        createNotification(2, '2'),
        createNotification(0.5, '1'),
        createNotification(1, '3'),
      ];

      const filtered = filterNotificationsByTime(notifications);
      expect(filtered[0].id).toBe('1'); // 0.5 hours ago (newest)
      expect(filtered[1].id).toBe('3'); // 1 hour ago
      expect(filtered[2].id).toBe('2'); // 2 hours ago (oldest)
    });

    it('should limit results to maximum 10 notifications', () => {
      const notifications: Notification[] = Array.from({ length: 15 }, (_, i) =>
        createNotification(0.1 * i, `${i}`)
      );

      const filtered = filterNotificationsByTime(notifications);
      expect(filtered).toHaveLength(10);
    });

    it('should return empty array when no notifications match time range', () => {
      const notifications: Notification[] = [
        createNotification(5, '1'),
        createNotification(6, '2'),
        createNotification(10, '3'),
      ];

      const filtered = filterNotificationsByTime(notifications, 3);
      expect(filtered).toHaveLength(0);
    });

    it('should handle empty notification array', () => {
      const filtered = filterNotificationsByTime([]);
      expect(filtered).toHaveLength(0);
    });

    it('should include notifications exactly at the cutoff time', () => {
      const notifications: Notification[] = [
        createNotification(3, '1'), // Exactly 3 hours ago
        createNotification(3.1, '2'), // Just over 3 hours ago
      ];

      const filtered = filterNotificationsByTime(notifications, 3);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });
  });
});
