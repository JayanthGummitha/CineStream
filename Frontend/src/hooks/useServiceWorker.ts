'use client';

import { useEffect, useState, useCallback } from 'react';

interface UseServiceWorkerReturn {
  isSupported: boolean;
  isRegistered: boolean;
  registration: ServiceWorkerRegistration | null;
  error: Error | null;
  /** Send message to service worker */
  postMessage: (message: { type: string; payload?: unknown }) => void;
}

export function useServiceWorker(): UseServiceWorkerReturn {
  const [isSupported] = useState(() => 
    typeof window !== 'undefined' && 'serviceWorker' in navigator
  );
  const [isRegistered, setIsRegistered] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isSupported) return;

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        setRegistration(reg);
        setIsRegistered(true);

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                console.log('[SW] New version available');
              }
            });
          }
        });

        console.log('[SW] Service worker registered');
      } catch (err) {
        console.error('[SW] Registration failed:', err);
        setError(err instanceof Error ? err : new Error('Failed to register service worker'));
      }
    };

    registerSW();

    // Listen for messages from service worker
    const handleMessage = (event: MessageEvent) => {
      const { type, payload } = event.data;
      console.log('[SW] Message received:', type, payload);
      
      // Dispatch custom event for components to listen to
      window.dispatchEvent(new CustomEvent('sw-message', { detail: { type, payload } }));
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [isSupported]);

  const postMessage = useCallback((message: { type: string; payload?: unknown }) => {
    if (registration?.active) {
      registration.active.postMessage(message);
    }
  }, [registration]);

  return {
    isSupported,
    isRegistered,
    registration,
    error,
    postMessage,
  };
}
