/**
 * Cast Device Discovery Service
 * 
 * Discovers and manages connections to casting devices:
 * - Google Chromecast
 * - Apple AirPlay
 * - DLNA/UPnP devices
 * - Smart TVs
 */

export interface CastDevice {
  id: string;
  name: string;
  type: 'chromecast' | 'airplay' | 'dlna' | 'smart-tv';
  status: 'available' | 'connecting' | 'connected' | 'disconnected';
  capabilities: string[];
  ipAddress?: string;
  manufacturer?: string;
}

export interface CastSession {
  device: CastDevice;
  sessionId: string;
  mediaSession?: any;
  startTime: Date;
}

/**
 * Initialize Google Cast SDK
 */
export async function initializeChromecast(): Promise<boolean> {
  return new Promise((resolve) => {
    // Check if already loaded
    if ((window as any).chrome?.cast?.isAvailable) {
      resolve(true);
      return;
    }

    // Load Cast SDK
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
    script.async = true;

    script.onload = () => {
      // Wait for Cast API to be ready
      const checkReady = setInterval(() => {
        if ((window as any).chrome?.cast?.isAvailable) {
          clearInterval(checkReady);
          setupChromecastAPI();
          resolve(true);
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkReady);
        resolve(false);
      }, 5000);
    };

    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

/**
 * Setup Chromecast API configuration
 */
function setupChromecastAPI() {
  try {
    const cast = (window as any).chrome.cast;
    
    // Use default media receiver or your custom receiver app ID
    const applicationID = cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
    
    const sessionRequest = new cast.SessionRequest(applicationID);
    const apiConfig = new cast.ApiConfig(
      sessionRequest,
      sessionListener,
      receiverListener,
      cast.AutoJoinPolicy.ORIGIN_SCOPED
    );

    cast.initialize(apiConfig, onInitSuccess, onInitError);
  } catch (error) {
    console.error('Chromecast API setup failed:', error);
  }
}

function sessionListener(session: any) {
  console.log('Chromecast session started:', session);
}

function receiverListener(availability: string) {
  console.log('Chromecast receiver availability:', availability);
}

function onInitSuccess() {
  console.log('Chromecast API initialized successfully');
}

function onInitError(error: any) {
  console.warn('Chromecast API initialization failed:', error);
}

/**
 * Discover Chromecast devices
 */
export async function discoverChromecastDevices(): Promise<CastDevice[]> {
  const devices: CastDevice[] = [];

  try {
    const cast = (window as any).chrome?.cast;
    if (!cast || !cast.isAvailable) {
      return devices;
    }

    // Request session to trigger device discovery
    return new Promise((resolve) => {
      cast.requestSession(
        (session: any) => {
          // Session created - device found
          devices.push({
            id: session.sessionId,
            name: session.receiver.friendlyName,
            type: 'chromecast',
            status: 'available',
            capabilities: session.receiver.capabilities || ['video', 'audio'],
            manufacturer: 'Google'
          });
          resolve(devices);
        },
        (error: any) => {
          // User cancelled or no devices found
          console.log('Chromecast discovery:', error.code);
          resolve(devices);
        }
      );
    });
  } catch (error) {
    console.error('Chromecast discovery failed:', error);
    return devices;
  }
}

/**
 * Discover DLNA/UPnP devices on local network
 * Note: This requires a backend service or browser extension
 */
export async function discoverDLNADevices(): Promise<CastDevice[]> {
  const devices: CastDevice[] = [];

  try {
    // Check if Remote Playback API is available
    if ('RemotePlayback' in HTMLVideoElement.prototype) {
      console.log('Remote Playback API available');
      // This API allows discovering DLNA devices
      // Implementation requires video element reference
    }

    // Alternative: Use WebRTC for device discovery
    // This requires STUN/TURN servers and signaling
    
    return devices;
  } catch (error) {
    console.error('DLNA discovery failed:', error);
    return devices;
  }
}

/**
 * Discover AirPlay devices (Apple ecosystem)
 */
export async function discoverAirPlayDevices(): Promise<CastDevice[]> {
  const devices: CastDevice[] = [];

  try {
    // Check if AirPlay is available (Safari on iOS/macOS)
    const video = document.createElement('video');
    
    if ((video as any).webkitShowPlaybackTargetPicker) {
      console.log('AirPlay available');
      // AirPlay is available but device list is not directly accessible
      // User must use the native AirPlay picker
    }

    return devices;
  } catch (error) {
    console.error('AirPlay discovery failed:', error);
    return devices;
  }
}

/**
 * Discover all available casting devices
 */
export async function discoverAllDevices(): Promise<CastDevice[]> {
  const allDevices: CastDevice[] = [];

  // Discover Chromecast devices
  const chromecastDevices = await discoverChromecastDevices();
  allDevices.push(...chromecastDevices);

  // Discover DLNA devices
  const dlnaDevices = await discoverDLNADevices();
  allDevices.push(...dlnaDevices);

  // Discover AirPlay devices
  const airplayDevices = await discoverAirPlayDevices();
  allDevices.push(...airplayDevices);

  return allDevices;
}

/**
 * Connect to a casting device
 */
export async function connectToDevice(device: CastDevice): Promise<CastSession | null> {
  try {
    switch (device.type) {
      case 'chromecast':
        return await connectToChromecast(device);
      case 'airplay':
        return await connectToAirPlay(device);
      case 'dlna':
        return await connectToDLNA(device);
      default:
        throw new Error(`Unsupported device type: ${device.type}`);
    }
  } catch (error) {
    console.error('Failed to connect to device:', error);
    return null;
  }
}

async function connectToChromecast(device: CastDevice): Promise<CastSession | null> {
  try {
    const cast = (window as any).chrome?.cast;
    if (!cast) return null;

    return new Promise((resolve, reject) => {
      cast.requestSession(
        (session: any) => {
          resolve({
            device: { ...device, status: 'connected' },
            sessionId: session.sessionId,
            mediaSession: session,
            startTime: new Date()
          });
        },
        (error: any) => reject(error)
      );
    });
  } catch (error) {
    console.error('Chromecast connection failed:', error);
    return null;
  }
}

async function connectToAirPlay(device: CastDevice): Promise<CastSession | null> {
  // AirPlay connection is handled by the browser's native picker
  console.log('AirPlay connection initiated');
  return null;
}

async function connectToDLNA(device: CastDevice): Promise<CastSession | null> {
  // DLNA connection requires backend service
  console.log('DLNA connection initiated');
  return null;
}

/**
 * Cast media to a device
 */
export async function castMedia(
  session: CastSession,
  mediaUrl: string,
  metadata: {
    title: string;
    subtitle?: string;
    poster?: string;
    contentType?: string;
  }
): Promise<boolean> {
  try {
    if (session.device.type === 'chromecast') {
      return await castToChromecast(session, mediaUrl, metadata);
    }
    return false;
  } catch (error) {
    console.error('Failed to cast media:', error);
    return false;
  }
}

async function castToChromecast(
  session: CastSession,
  mediaUrl: string,
  metadata: any
): Promise<boolean> {
  try {
    const cast = (window as any).chrome?.cast;
    if (!cast || !session.mediaSession) return false;

    const mediaInfo = new cast.media.MediaInfo(mediaUrl, metadata.contentType || 'video/mp4');
    
    const metadataObj = new cast.media.GenericMediaMetadata();
    metadataObj.title = metadata.title;
    metadataObj.subtitle = metadata.subtitle;
    if (metadata.poster) {
      metadataObj.images = [new cast.Image(metadata.poster)];
    }
    
    mediaInfo.metadata = metadataObj;

    const request = new cast.media.LoadRequest(mediaInfo);
    
    return new Promise((resolve) => {
      session.mediaSession.loadMedia(
        request,
        () => resolve(true),
        (error: any) => {
          console.error('Failed to load media:', error);
          resolve(false);
        }
      );
    });
  } catch (error) {
    console.error('Chromecast media casting failed:', error);
    return false;
  }
}

/**
 * Disconnect from casting device
 */
export async function disconnectDevice(session: CastSession): Promise<boolean> {
  try {
    if (session.device.type === 'chromecast' && session.mediaSession) {
      session.mediaSession.stop();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to disconnect:', error);
    return false;
  }
}
