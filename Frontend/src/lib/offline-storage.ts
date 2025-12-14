/**
 * Offline Storage Service
 * 
 * Manages offline content downloads using IndexedDB and Service Workers.
 * Handles download queue, progress tracking, and offline playback.
 */

import { OfflineContent, DownloadQueueItem } from '@/types/profile';

const DB_NAME = 'cinestream_offline';
const DB_VERSION = 1;
const CONTENT_STORE = 'offline_content';
const QUEUE_STORE = 'download_queue';

/** IndexedDB instance */
let db: IDBDatabase | null = null;

/** Initialize IndexedDB */
export async function initOfflineDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open offline database'));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create offline content store
      if (!database.objectStoreNames.contains(CONTENT_STORE)) {
        const contentStore = database.createObjectStore(CONTENT_STORE, { keyPath: 'id' });
        contentStore.createIndex('contentId', 'contentId', { unique: false });
        contentStore.createIndex('profileId', 'profileId', { unique: false });
        contentStore.createIndex('status', 'status', { unique: false });
      }

      // Create download queue store
      if (!database.objectStoreNames.contains(QUEUE_STORE)) {
        const queueStore = database.createObjectStore(QUEUE_STORE, { keyPath: 'id' });
        queueStore.createIndex('profileId', 'profileId', { unique: false });
        queueStore.createIndex('priority', 'priority', { unique: false });
      }
    };
  });
}

/** Get database instance */
async function getDB(): Promise<IDBDatabase> {
  if (!db) {
    return initOfflineDB();
  }
  return db;
}

/** Generate unique ID */
function generateId(): string {
  return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/** Add content to download queue */
export async function addToDownloadQueue(
  item: Omit<DownloadQueueItem, 'id' | 'addedAt'>
): Promise<DownloadQueueItem> {
  const database = await getDB();

  const queueItem: DownloadQueueItem = {
    ...item,
    id: generateId(),
    addedAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([QUEUE_STORE], 'readwrite');
    const store = transaction.objectStore(QUEUE_STORE);
    const request = store.add(queueItem);

    request.onsuccess = () => resolve(queueItem);
    request.onerror = () => reject(new Error('Failed to add to download queue'));
  });
}

/** Get download queue for a profile */
export async function getDownloadQueue(profileId: string): Promise<DownloadQueueItem[]> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([QUEUE_STORE], 'readonly');
    const store = transaction.objectStore(QUEUE_STORE);
    const index = store.index('profileId');
    const request = index.getAll(profileId);

    request.onsuccess = () => {
      const items = request.result as DownloadQueueItem[];
      // Sort by priority (higher first) then by addedAt
      items.sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
      });
      resolve(items);
    };
    request.onerror = () => reject(new Error('Failed to get download queue'));
  });
}

/** Remove item from download queue */
export async function removeFromQueue(id: string): Promise<void> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([QUEUE_STORE], 'readwrite');
    const store = transaction.objectStore(QUEUE_STORE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to remove from queue'));
  });
}

/** Save offline content */
export async function saveOfflineContent(content: OfflineContent): Promise<void> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([CONTENT_STORE], 'readwrite');
    const store = transaction.objectStore(CONTENT_STORE);
    const request = store.put(content);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to save offline content'));
  });
}

/** Get offline content by ID */
export async function getOfflineContent(id: string): Promise<OfflineContent | null> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([CONTENT_STORE], 'readonly');
    const store = transaction.objectStore(CONTENT_STORE);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(new Error('Failed to get offline content'));
  });
}

/** Get offline content by content ID */
export async function getOfflineContentByContentId(
  contentId: string,
  profileId: string
): Promise<OfflineContent | null> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([CONTENT_STORE], 'readonly');
    const store = transaction.objectStore(CONTENT_STORE);
    const index = store.index('contentId');
    const request = index.getAll(contentId);

    request.onsuccess = () => {
      const results = request.result as OfflineContent[];
      const match = results.find(c => c.profileId === profileId && c.status === 'completed');
      resolve(match || null);
    };
    request.onerror = () => reject(new Error('Failed to get offline content'));
  });
}

/** Get all offline content for a profile */
export async function getAllOfflineContent(profileId: string): Promise<OfflineContent[]> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([CONTENT_STORE], 'readonly');
    const store = transaction.objectStore(CONTENT_STORE);
    const index = store.index('profileId');
    const request = index.getAll(profileId);

    request.onsuccess = () => {
      const results = request.result as OfflineContent[];
      // Sort by downloadedAt (most recent first)
      results.sort((a, b) => 
        new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime()
      );
      resolve(results);
    };
    request.onerror = () => reject(new Error('Failed to get offline content'));
  });
}

/** Delete offline content */
export async function deleteOfflineContent(id: string): Promise<void> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([CONTENT_STORE], 'readwrite');
    const store = transaction.objectStore(CONTENT_STORE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to delete offline content'));
  });
}

/** Update download progress */
export async function updateDownloadProgress(
  id: string,
  progress: number,
  status?: OfflineContent['status']
): Promise<void> {
  const content = await getOfflineContent(id);
  if (!content) {
    throw new Error('Content not found');
  }

  content.progress = progress;
  if (status) {
    content.status = status;
  }

  await saveOfflineContent(content);
}

/** Check if content is available offline */
export async function isContentAvailableOffline(
  contentId: string,
  profileId: string
): Promise<boolean> {
  const content = await getOfflineContentByContentId(contentId, profileId);
  return content !== null && content.status === 'completed';
}

/** Get total storage used by offline content */
export async function getOfflineStorageUsed(profileId: string): Promise<number> {
  const content = await getAllOfflineContent(profileId);
  return content.reduce((total, item) => total + item.sizeBytes, 0);
}

/** Clean up expired content */
export async function cleanupExpiredContent(): Promise<number> {
  const database = await getDB();
  const now = new Date();
  let deletedCount = 0;

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([CONTENT_STORE], 'readwrite');
    const store = transaction.objectStore(CONTENT_STORE);
    const request = store.openCursor();

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        const content = cursor.value as OfflineContent;
        if (new Date(content.expiresAt) < now) {
          cursor.delete();
          deletedCount++;
        }
        cursor.continue();
      } else {
        resolve(deletedCount);
      }
    };

    request.onerror = () => reject(new Error('Failed to cleanup expired content'));
  });
}

/** Download content (simulated - in production would use actual video download) */
export async function downloadContent(
  queueItem: DownloadQueueItem,
  onProgress: (progress: number) => void
): Promise<OfflineContent> {
  // Create initial offline content entry
  const offlineContent: OfflineContent = {
    id: generateId(),
    contentId: queueItem.contentId,
    contentType: queueItem.contentType,
    title: queueItem.title,
    thumbnail: queueItem.thumbnail,
    duration: 0, // Would be set from actual video metadata
    quality: queueItem.quality,
    sizeBytes: 0,
    downloadedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    profileId: queueItem.profileId,
    progress: 0,
    status: 'downloading',
  };

  await saveOfflineContent(offlineContent);

  try {
    // Simulate download progress (in production, use fetch with progress tracking)
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      offlineContent.progress = progress;
      await saveOfflineContent(offlineContent);
      onProgress(progress);
    }

    // Mark as completed
    offlineContent.status = 'completed';
    offlineContent.progress = 100;
    offlineContent.sizeBytes = 500 * 1024 * 1024; // Simulated 500MB
    await saveOfflineContent(offlineContent);

    // Remove from queue
    await removeFromQueue(queueItem.id);

    return offlineContent;
  } catch (error) {
    offlineContent.status = 'failed';
    await saveOfflineContent(offlineContent);
    throw error;
  }
}

/** Format bytes to human readable */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/** Check if browser supports offline storage */
export function isOfflineStorageSupported(): boolean {
  return typeof window !== 'undefined' && 
         'indexedDB' in window && 
         'serviceWorker' in navigator;
}
