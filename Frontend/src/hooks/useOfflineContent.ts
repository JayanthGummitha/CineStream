'use client';

/**
 * Offline Content Hook
 * 
 * Manages offline content downloads and playback.
 */

import { useState, useEffect, useCallback } from 'react';
import { OfflineContent, DownloadQueueItem } from '@/types/profile';
import {
  initOfflineDB,
  addToDownloadQueue,
  getDownloadQueue,
  removeFromQueue,
  getAllOfflineContent,
  deleteOfflineContent,
  downloadContent,
  isContentAvailableOffline,
  getOfflineStorageUsed,
  cleanupExpiredContent,
  formatBytes,
  isOfflineStorageSupported,
} from '@/lib/offline-storage';
import { useProfiles } from '@/contexts/ProfileContext';

interface UseOfflineContentReturn {
  /** All downloaded content for current profile */
  offlineContent: OfflineContent[];
  /** Current download queue */
  downloadQueue: DownloadQueueItem[];
  /** Currently downloading item */
  currentDownload: DownloadQueueItem | null;
  /** Download progress (0-100) */
  downloadProgress: number;
  /** Total storage used */
  storageUsed: string;
  /** Loading state */
  isLoading: boolean;
  /** Whether offline storage is supported */
  isSupported: boolean;
  /** Add content to download queue */
  addToQueue: (item: Omit<DownloadQueueItem, 'id' | 'addedAt' | 'profileId'>) => Promise<void>;
  /** Remove from queue */
  cancelDownload: (id: string) => Promise<void>;
  /** Delete downloaded content */
  deleteContent: (id: string) => Promise<void>;
  /** Check if content is available offline */
  isAvailableOffline: (contentId: string) => Promise<boolean>;
  /** Start processing download queue */
  processQueue: () => Promise<void>;
  /** Refresh data */
  refresh: () => Promise<void>;
}

export function useOfflineContent(): UseOfflineContentReturn {
  const { activeProfile } = useProfiles();
  const [offlineContent, setOfflineContent] = useState<OfflineContent[]>([]);
  const [downloadQueue, setDownloadQueue] = useState<DownloadQueueItem[]>([]);
  const [currentDownload, setCurrentDownload] = useState<DownloadQueueItem | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [storageUsed, setStorageUsed] = useState('0 B');
  const [isLoading, setIsLoading] = useState(true);
  const [isSupported] = useState(() => isOfflineStorageSupported());
  const [isProcessing, setIsProcessing] = useState(false);

  const profileId = activeProfile?.id || '';

  // Initialize and load data
  const loadData = useCallback(async () => {
    if (!isSupported || !profileId) {
      setIsLoading(false);
      return;
    }

    try {
      await initOfflineDB();
      
      const [content, queue, used] = await Promise.all([
        getAllOfflineContent(profileId),
        getDownloadQueue(profileId),
        getOfflineStorageUsed(profileId),
      ]);

      setOfflineContent(content);
      setDownloadQueue(queue);
      setStorageUsed(formatBytes(used));

      // Cleanup expired content
      await cleanupExpiredContent();
    } catch (error) {
      console.error('[Offline] Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, profileId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addToQueue = useCallback(async (
    item: Omit<DownloadQueueItem, 'id' | 'addedAt' | 'profileId'>
  ): Promise<void> => {
    if (!profileId) {
      throw new Error('No active profile');
    }

    await addToDownloadQueue({
      ...item,
      profileId,
      priority: 1,
    });

    await loadData();
  }, [profileId, loadData]);

  const cancelDownload = useCallback(async (id: string): Promise<void> => {
    await removeFromQueue(id);
    if (currentDownload?.id === id) {
      setCurrentDownload(null);
      setDownloadProgress(0);
    }
    await loadData();
  }, [currentDownload, loadData]);

  const deleteContent = useCallback(async (id: string): Promise<void> => {
    await deleteOfflineContent(id);
    await loadData();
  }, [loadData]);

  const isAvailableOffline = useCallback(async (contentId: string): Promise<boolean> => {
    if (!profileId) return false;
    return isContentAvailableOffline(contentId, profileId);
  }, [profileId]);

  const processQueue = useCallback(async (): Promise<void> => {
    if (isProcessing || downloadQueue.length === 0) return;

    setIsProcessing(true);

    try {
      for (const item of downloadQueue) {
        setCurrentDownload(item);
        setDownloadProgress(0);

        await downloadContent(item, (progress) => {
          setDownloadProgress(progress);
        });

        await loadData();
      }
    } catch (error) {
      console.error('[Offline] Download failed:', error);
    } finally {
      setCurrentDownload(null);
      setDownloadProgress(0);
      setIsProcessing(false);
    }
  }, [isProcessing, downloadQueue, loadData]);

  // Auto-process queue when items are added
  useEffect(() => {
    if (downloadQueue.length > 0 && !isProcessing && !currentDownload) {
      processQueue();
    }
  }, [downloadQueue, isProcessing, currentDownload, processQueue]);

  return {
    offlineContent,
    downloadQueue,
    currentDownload,
    downloadProgress,
    storageUsed,
    isLoading,
    isSupported,
    addToQueue,
    cancelDownload,
    deleteContent,
    isAvailableOffline,
    processQueue,
    refresh: loadData,
  };
}
