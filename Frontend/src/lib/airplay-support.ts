/**
 * AirPlay Support for Safari/iOS
 * 
 * Provides AirPlay casting functionality using WebKit's native API
 */

export interface AirPlayDevice {
  id: string;
  name: string;
  type: 'airplay';
  status: 'available' | 'connecting' | 'connected' | 'disconnected';
}

/**
 * Check if AirPlay is supported in the current browser
 */
export function isAirPlaySupported(): boolean {
  // Check for WebKit AirPlay API (Safari only)
  const video = document.createElement('video');
  return !!(
    (video as any).webkitShowPlaybackTargetPicker ||
    'WebKitPlaybackTargetAvailabilityEvent' in window
  );
}

/**
 * Check if AirPlay devices are available
 */
export function checkAirPlayAvailability(videoElement: HTMLVideoElement): Promise<boolean> {
  return new Promise((resolve) => {
    if (!isAirPlaySupported()) {
      resolve(false);
      return;
    }

    // Listen for AirPlay availability
    const handleAvailability = (event: any) => {
      const availability = event.availability;
      resolve(availability === 'available');
      videoElement.removeEventListener('webkitplaybacktargetavailabilitychanged', handleAvailability);
    };

    videoElement.addEventListener('webkitplaybacktargetavailabilitychanged', handleAvailability);

    // Timeout after 2 seconds
    setTimeout(() => {
      videoElement.removeEventListener('webkitplaybacktargetavailabilitychanged', handleAvailability);
      resolve(false);
    }, 2000);
  });
}

/**
 * Show AirPlay device picker
 * This opens the native iOS/macOS AirPlay menu
 */
export function showAirPlayPicker(videoElement: HTMLVideoElement): boolean {
  try {
    if (!isAirPlaySupported()) {
      console.warn('AirPlay not supported in this browser');
      return false;
    }

    const webkitVideo = videoElement as any;
    
    if (typeof webkitVideo.webkitShowPlaybackTargetPicker === 'function') {
      // Show the native AirPlay picker
      webkitVideo.webkitShowPlaybackTargetPicker();
      console.log('✅ AirPlay picker shown');
      return true;
    } else {
      console.warn('webkitShowPlaybackTargetPicker not available');
      return false;
    }
  } catch (error) {
    console.error('Failed to show AirPlay picker:', error);
    return false;
  }
}

/**
 * Listen for AirPlay connection status changes
 */
export function onAirPlayStatusChange(
  videoElement: HTMLVideoElement,
  callback: (isConnected: boolean, deviceName?: string) => void
): () => void {
  if (!isAirPlaySupported()) {
    return () => {};
  }

  const handleCurrentPlaybackTargetChange = (event: any) => {
    const isWireless = (videoElement as any).webkitCurrentPlaybackTargetIsWireless;
    console.log('🎯 AirPlay status changed:', isWireless ? 'Connected' : 'Disconnected');
    callback(isWireless, 'AirPlay Device');
  };

  videoElement.addEventListener(
    'webkitcurrentplaybacktargetiswirelesschanged',
    handleCurrentPlaybackTargetChange
  );

  // Return cleanup function
  return () => {
    videoElement.removeEventListener(
      'webkitcurrentplaybacktargetiswirelesschanged',
      handleCurrentPlaybackTargetChange
    );
  };
}

/**
 * Check if currently connected to AirPlay
 */
export function isConnectedToAirPlay(videoElement: HTMLVideoElement): boolean {
  if (!isAirPlaySupported()) {
    return false;
  }

  return !!(videoElement as any).webkitCurrentPlaybackTargetIsWireless;
}

/**
 * Get AirPlay button element for custom styling
 * Note: The actual device list is managed by the OS, not accessible via JS
 */
export function createAirPlayButton(videoElement: HTMLVideoElement): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = 'airplay-button';
  button.setAttribute('aria-label', 'AirPlay');
  button.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 22h12l-6-6-6 6zM21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v-2H3V5h18v12h-4v2h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
    </svg>
  `;

  button.onclick = () => {
    showAirPlayPicker(videoElement);
  };

  return button;
}

/**
 * Initialize AirPlay for a video element
 */
export function initializeAirPlay(
  videoElement: HTMLVideoElement,
  onStatusChange?: (isConnected: boolean, deviceName?: string) => void
): () => void {
  if (!isAirPlaySupported()) {
    console.log('ℹ️ AirPlay not supported (not Safari/iOS)');
    return () => {};
  }

  console.log('✅ AirPlay supported - initializing');

  // Enable AirPlay on the video element
  (videoElement as any).webkitAirPlay = 'allow';

  // Listen for status changes
  let cleanup = () => {};
  if (onStatusChange) {
    cleanup = onAirPlayStatusChange(videoElement, onStatusChange);
  }

  // Check initial availability
  checkAirPlayAvailability(videoElement).then(available => {
    console.log('🎯 AirPlay devices available:', available);
  });

  return cleanup;
}

/**
 * Disconnect from AirPlay
 * Note: There's no direct API to disconnect, user must do it from the AirPlay menu
 */
export function disconnectAirPlay(videoElement: HTMLVideoElement): void {
  // Show the picker again so user can disconnect
  showAirPlayPicker(videoElement);
  console.log('ℹ️ Please disconnect from the AirPlay menu');
}
