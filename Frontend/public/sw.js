/**
 * CineStream Service Worker
 * 
 * Handles offline content caching and background sync for downloads.
 */

const CACHE_NAME = 'cinestream-v1';
const OFFLINE_CACHE = 'cinestream-offline-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/placeholder-movie.jpg',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== OFFLINE_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // Skip video/audio streaming requests - they use partial responses (206) which can't be cached
  if (request.destination === 'video' || request.destination === 'audio') {
    return; // Let browser handle normally
  }

  // Skip range requests (partial content) - these can't be cached
  if (request.headers.get('range')) {
    return; // Let browser handle normally
  }

  // Skip common video/streaming URLs
  if (
    url.pathname.endsWith('.mp4') ||
    url.pathname.endsWith('.m3u8') ||
    url.pathname.endsWith('.mpd') ||
    url.pathname.endsWith('.ts') ||
    url.pathname.endsWith('.m4s') ||
    url.pathname.includes('/video/') ||
    url.pathname.includes('/stream/')
  ) {
    return; // Let browser handle normally
  }

  // Handle API requests differently
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Handle video content from offline cache
  if (url.pathname.startsWith('/offline-video/')) {
    event.respondWith(cacheFirst(request, OFFLINE_CACHE));
    return;
  }

  // Handle image requests
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // Default: network first, fallback to cache
  event.respondWith(networkFirst(request));
});

// Network first strategy
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    
    // Cache successful responses (but NOT partial responses - status 206)
    // Partial responses are used for video streaming and can't be cached
    if (response.ok && response.status !== 206) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Try cache on network failure
    const cached = await caches.match(request);
    if (cached) return cached;
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline');
    }
    
    throw error;
  }
}

// Cache first strategy
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    
    // Only cache complete responses (not partial 206 responses)
    if (response.ok && response.status !== 206) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Return placeholder for images
    if (request.destination === 'image') {
      return caches.match('/placeholder-movie.jpg');
    }
    throw error;
  }
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'CACHE_VIDEO':
      cacheVideo(payload);
      break;
    case 'DELETE_VIDEO':
      deleteVideo(payload);
      break;
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
  }
});

// Cache video content for offline playback
async function cacheVideo({ url, id }) {
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    const response = await fetch(url);
    
    if (response.ok) {
      await cache.put(`/offline-video/${id}`, response);
      
      // Notify clients of successful cache
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({
          type: 'VIDEO_CACHED',
          payload: { id, success: true },
        });
      });
    }
  } catch (error) {
    console.error('[SW] Failed to cache video:', error);
    
    // Notify clients of failure
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'VIDEO_CACHED',
        payload: { id, success: false, error: error.message },
      });
    });
  }
}

// Delete cached video
async function deleteVideo({ id }) {
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    await cache.delete(`/offline-video/${id}`);
    
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'VIDEO_DELETED',
        payload: { id, success: true },
      });
    });
  } catch (error) {
    console.error('[SW] Failed to delete video:', error);
  }
}

// Background sync for downloads
self.addEventListener('sync', (event) => {
  if (event.tag === 'download-queue') {
    event.waitUntil(processDownloadQueue());
  }
});

async function processDownloadQueue() {
  // This would process any pending downloads
  // Implementation depends on how download queue is stored
  console.log('[SW] Processing download queue');
}
