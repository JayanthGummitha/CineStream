/**
 * React Hook for Cast Device Discovery and Management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  CastDevice,
  CastSession,
  initializeChromecast,
  discoverAllDevices,
  connectToDevice,
  castMedia,
  disconnectDevice
} from '@/lib/cast-device-discovery';

export function useCastDevices() {
  const [isSupported, setIsSupported] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [devices, setDevices] = useState<CastDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [connectedSession, setConnectedSession] = useState<CastSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const scanTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Initialize casting support
  useEffect(() => {
    const init = async () => {
      try {
        // Check if Chromecast is supported
        const chromecastSupported = await initializeChromecast();
        
        // Check for other casting APIs
        const airplaySupported = 'WebKitPlaybackTargetAvailabilityEvent' in window;
        const remotePlaybackSupported = 'RemotePlayback' in HTMLVideoElement.prototype;
        
        const supported = chromecastSupported || airplaySupported || remotePlaybackSupported;
        
        setIsSupported(supported);
        setIsInitialized(chromecastSupported);
        
        if (supported) {
          console.log('Cast support detected:', {
            chromecast: chromecastSupported,
            airplay: airplaySupported,
            remotePlayback: remotePlaybackSupported
          });
        }
      } catch (error) {
        console.error('Cast initialization failed:', error);
        setError('Failed to initialize casting');
      }
    };

    init();
  }, []);

  // Scan for available devices
  const scanDevices = useCallback(async () => {
    if (!isSupported) {
      setError('Casting not supported on this device');
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      // Clear existing timeout
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }

      // Discover devices
      const discoveredDevices = await discoverAllDevices();
      
      setDevices(discoveredDevices);
      setIsScanning(false);

      if (discoveredDevices.length === 0) {
        setError('No casting devices found. Make sure your devices are on the same network.');
      }
    } catch (error) {
      console.error('Device scan failed:', error);
      setError('Failed to scan for devices');
      setIsScanning(false);
    }
  }, [isSupported]);

  // Connect to a device
  const connect = useCallback(async (device: CastDevice) => {
    try {
      setError(null);
      
      // Update device status
      setDevices(prev => prev.map(d => 
        d.id === device.id ? { ...d, status: 'connecting' } : d
      ));

      const session = await connectToDevice(device);
      
      if (session) {
        setConnectedSession(session);
        setDevices(prev => prev.map(d => 
          d.id === device.id ? { ...d, status: 'connected' } : d
        ));
        return true;
      } else {
        setDevices(prev => prev.map(d => 
          d.id === device.id ? { ...d, status: 'available' } : d
        ));
        setError('Failed to connect to device');
        return false;
      }
    } catch (error) {
      console.error('Connection failed:', error);
      setError('Failed to connect to device');
      setDevices(prev => prev.map(d => 
        d.id === device.id ? { ...d, status: 'available' } : d
      ));
      return false;
    }
  }, []);

  // Disconnect from current device
  const disconnect = useCallback(async () => {
    if (!connectedSession) return false;

    try {
      const success = await disconnectDevice(connectedSession);
      
      if (success) {
        setDevices(prev => prev.map(d => 
          d.id === connectedSession.device.id ? { ...d, status: 'available' } : d
        ));
        setConnectedSession(null);
      }
      
      return success;
    } catch (error) {
      console.error('Disconnect failed:', error);
      return false;
    }
  }, [connectedSession]);

  // Cast media to connected device
  const cast = useCallback(async (
    mediaUrl: string,
    metadata: {
      title: string;
      subtitle?: string;
      poster?: string;
      contentType?: string;
    }
  ) => {
    if (!connectedSession) {
      setError('No device connected');
      return false;
    }

    try {
      const success = await castMedia(connectedSession, mediaUrl, metadata);
      
      if (!success) {
        setError('Failed to cast media');
      }
      
      return success;
    } catch (error) {
      console.error('Cast failed:', error);
      setError('Failed to cast media');
      return false;
    }
  }, [connectedSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);

  return {
    isSupported,
    isInitialized,
    devices,
    isScanning,
    connectedSession,
    connectedDevice: connectedSession?.device || null,
    error,
    scanDevices,
    connect,
    disconnect,
    cast
  };
}
