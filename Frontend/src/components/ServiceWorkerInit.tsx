'use client';

import { useEffect } from 'react';
import { useServiceWorker } from '@/hooks/useServiceWorker';

/**
 * Initializes the service worker for offline support.
 * This component doesn't render anything visible.
 */
export function ServiceWorkerInit() {
  const { isSupported, isRegistered, error } = useServiceWorker();

  useEffect(() => {
    if (isRegistered) {
      console.log('[App] Service worker ready for offline support');
    }
    if (error) {
      console.warn('[App] Service worker registration failed:', error.message);
    }
  }, [isRegistered, error]);

  // This component doesn't render anything
  return null;
}
