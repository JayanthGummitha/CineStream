'use client';

import { Button } from '@/components/ui/button';
import { PlayButton } from '@vidstack/react'
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { formatTime } from '@/lib/video-utils';
import { cn } from '@/lib/utils';
import VideoSettings from './VideoSettings';
import VideoCaption from './VideoCaption';
import { 
  isAirPlaySupported as checkAirPlaySupport, 
  showAirPlayPicker, 
  onAirPlayStatusChange,
  isConnectedToAirPlay
} from '@/lib/airplay-support';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
// VTT file URLs - using public URLs instead of imports
const englishVtt = '/assets/english.vtt';
const spanishVtt = '/assets/spanish.vtt';

import {
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  Subtitles,
  MonitorSpeaker,
  PictureInPicture2,
  Keyboard,
  RotateCcw,
  Cast,
  Wifi,
  Monitor,
  Smartphone,
  Tv,
  X,
  Play,
  Pause,
  Loader2,
  Languages,
  Check
} from 'lucide-react';
import { ThumbnailPreview } from './ThumbnailPreview';
import MovieInfoDisplay from './MovieInfoDisplay';

// Fixed caption structure to match VideoCaption component expectations
const defaultCaptions = [
  {
    value: "en-US",
    src: englishVtt,
    label: "English",
    language: "en-US",
    kind: "subtitles" as const,
    type: "vtt" as const,
    default: true
  },
  {
    value: "es-ES",
    src: spanishVtt,
    label: "Spanish",
    language: "es-ES",
    kind: "subtitles" as const,
    type: "vtt" as const
  }
];

interface QualityOption {
  value: string;
  label: string;
  src: string;
}

interface CaptionOption {
  value: string;
  label: string;
  language: string;
  kind: string;
  src: string;         // Required to match VideoSettings interface
  type?: string;       // Optional for DASH tracks  
  isDefault?: boolean;
  default?: boolean;   // Alternative property name
}

interface CastDevice {
  id: string;
  name: string;
  type: 'chromecast' | 'airplay' | 'dlna' | 'miracast';
  status: 'available' | 'connecting' | 'connected' | 'disconnected';
  icon: React.ReactNode;
  capabilities?: string[];
}
interface AudioSource {
  src: string;
  language: string;
  label: string;
  default?: boolean;
}

interface VideoPlayerControlsProps {
  // Playback state
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  showControls: boolean;

  // Media info
  movieInfo: { title: string };
  thumbnailsUrl: string;
  
  // Episode info for TV shows/documentaries/kids content
  contentType?: 'movie' | 'episode';
  seriesName?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  episodeTitle?: string;

  // Quality management
  quality: string;
  availableQualities: QualityOption[];
  selectedQualityValue?: string;  // Add this
  isAutoQuality?: boolean;        // Add this
  isQualityChanging?: boolean;    // Add this if not already present
  canSetQuality?: boolean;        // Add this if not already present

  // Playback settings
  playbackRate: number;

  // Captions
  captionsEnabled: boolean;


  // Audio tracks
  currentAudioTrack: string;
  availableAudioTracks: any[];

  // Display modes
  isTheaterMode: boolean;
  isPiPSupported: boolean;
  isPiPActive: boolean;
  isFullscreen: boolean;

  // Event handlers
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onSkip: (seconds: number) => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onQualityChange: (quality: string) => void;
  onPlaybackRateChange: (rate: number) => void;
  onCaptionChange: (caption: string) => void;
  onAudioTrackChange: (language: string) => void;
  onTheaterModeToggle: () => void;
  onPictureInPictureToggle: () => void;
  onFullscreenToggle: () => void;
  onShowShortcuts: () => void;

  activeCaption: string;
  availableCaptions: CaptionOption[];
  canSetCaptions?: boolean; // Add this for caption state management

  // YouTube source detection - hides unsupported features
  isYouTubeSource?: boolean;
}

// Enhanced casting hook with better error handling and real device support
const useCasting = () => {
  const [mounted, setMounted] = useState(false);
  const [isCastSupported, setIsCastSupported] = useState(true); // Default to true to show button
  const [isAirPlaySupported, setIsAirPlaySupported] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<CastDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<CastDevice | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [castSession, setCastSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAirPlayConnected, setIsAirPlayConnected] = useState(false);

  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initRetryRef = useRef<number>(0);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);



  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize casting support detection with better error handling
  useEffect(() => {
    const checkCastSupport = async () => {
      try {
        // Check for AirPlay (Safari/iOS) FIRST
        const hasAirPlay = checkAirPlaySupport();
        setIsAirPlaySupported(hasAirPlay);

        if (hasAirPlay) {
          console.log('✅ AirPlay supported (Safari/iOS detected)');
          // Set cast supported to true if AirPlay is available
          setIsCastSupported(true);
        }

        // Check for Google Cast API
        const hasChromecast = !!(window as any).chrome?.cast;

        if (hasChromecast) {
          console.log('🔍 Chromecast API detected, initializing...');
          await initializeCastAPI();
          setIsCastSupported(true);
        } else if (!hasAirPlay) {
          // Only set to false if neither AirPlay nor Chromecast is available
          console.log('ℹ️ No casting support detected - keeping button visible with message');
          // Keep button visible but show helpful message when clicked
          setIsCastSupported(true);
        }
      } catch (error) {
        console.warn('Cast support check failed:', error);
        // Keep AirPlay support even if Chromecast fails
        if (isAirPlaySupported) {
          console.log('✅ AirPlay still available despite Chromecast error');
          setIsCastSupported(true);
        } else {
          setIsCastSupported(false);
        }
      }
    };

    const initializeCastAPI = async () => {
      if (!(window as any).chrome?.cast) {
        await loadCastAPI();
      } else {
        setupCastAPI();
      }
    };

    const loadCastAPI = () => {
      return new Promise<void>((resolve, reject) => {
        if ((window as any).chrome?.cast?.isAvailable) {
          setupCastAPI();
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
        script.async = true;

        script.onload = () => {
          // Wait for Cast API to be ready
          const checkReady = () => {
            if ((window as any).chrome?.cast?.isAvailable) {
              setupCastAPI();
              resolve();
            } else if (initRetryRef.current < 10) {
              initRetryRef.current++;
              setTimeout(checkReady, 100);
            } else {
              reject(new Error('Cast API failed to initialize'));
            }
          };
          checkReady();
        };

        script.onerror = () => reject(new Error('Failed to load Cast API'));
        document.head.appendChild(script);
      });
    };

    const setupCastAPI = () => {
      try {
        const cast = (window as any).chrome.cast;
        const sessionRequest = new cast.SessionRequest(cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
        const apiConfig = new cast.ApiConfig(sessionRequest, sessionListener, receiverListener);

        cast.initialize(apiConfig, onInitSuccess, onInitError);
      } catch (error) {
        console.error('Cast API setup failed:', error);
        setError('Cast setup failed');
      }
    };

    const sessionListener = (session: any) => {
      setCastSession(session);
      setConnectedDevice({
        id: session.sessionId,
        name: session.receiver.friendlyName,
        type: 'chromecast',
        status: 'connected',
        icon: <Cast className="w-4 h-4" />,
        capabilities: session.receiver.capabilities || []
      });
      setError(null);
    };

    const receiverListener = (availability: string) => {
      if (availability === 'available') {
        setError(null);
      }
    };

    const onInitSuccess = () => {
      setIsInitialized(true);
      setError(null);
    };

    const onInitError = (error: any) => {
      console.warn('Cast API initialization failed (this is normal if no Cast devices are available):', error);
      // Don't set error state for cast initialization failures as it's optional functionality
      setIsInitialized(false);
      // Don't disable cast support if AirPlay is available
      if (!isAirPlaySupported) {
        setIsCastSupported(false);
      }
    };

    if (mounted) {
      checkCastSupport();
    }
  }, [mounted]);

  // Enhanced device scanning with better error handling
  const scanForDevices = useCallback(async () => {
    setIsScanning(true);
    setError(null);

    try {
      // Clear existing timeout
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }

      // Clear previous devices
      setAvailableDevices([]);

      // Handle AirPlay (Safari/iOS)
      if (isAirPlaySupported) {
        console.log('🍎 AirPlay supported - showing native picker');
        
        // Get video element from the page
        const videoElement = document.querySelector('video') as HTMLVideoElement;
        
        if (videoElement) {
          videoElementRef.current = videoElement;
          
          // Show AirPlay picker (native iOS/macOS menu)
          const success = showAirPlayPicker(videoElement);
          
          if (success) {
            console.log('✅ AirPlay picker shown');
            
            // Listen for AirPlay connection status
            const cleanup = onAirPlayStatusChange(videoElement, (isConnected, deviceName) => {
              if (isConnected) {
                console.log('✅ Connected to AirPlay device');
                setIsAirPlayConnected(true);
                setConnectedDevice({
                  id: 'airplay-device',
                  name: deviceName || 'AirPlay Device',
                  type: 'airplay',
                  status: 'connected',
                  icon: <Monitor className="w-4 h-4" />,
                  capabilities: ['video', 'audio']
                });
                setError(null);
              } else {
                console.log('ℹ️ Disconnected from AirPlay');
                setIsAirPlayConnected(false);
                setConnectedDevice(null);
              }
            });
            
            // Store cleanup function
            setIsScanning(false);
            return cleanup;
          } else {
            setError('AirPlay not available. Make sure you have AirPlay devices nearby.');
          }
        } else {
          setError('Video player not ready. Please try again.');
        }
        
        setIsScanning(false);
        return;
      }

      // Check if we're on Chrome/Edge
      const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge|Edg/.test(navigator.userAgent);
      const isEdge = /Edge|Edg/.test(navigator.userAgent);
      
      if (!isChrome && !isEdge) {
        setIsScanning(false);
        setError('Chromecast requires Chrome or Edge browser. For Apple devices, use Safari for AirPlay.');
        return;
      }

      // Try to load Cast SDK if not available
      if (!(window as any).chrome?.cast?.isAvailable) {
        console.log('🔄 Loading Google Cast SDK...');
        
        // Check if script already exists
        const existingScript = document.querySelector('script[src*="cast_sender"]');
        if (!existingScript) {
          const script = document.createElement('script');
          script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
          script.async = true;
          document.head.appendChild(script);
        }
        
        // Wait for Cast API to be ready
        let attempts = 0;
        const maxAttempts = 30; // 3 seconds
        
        const waitForCast = () => {
          attempts++;
          
          if ((window as any).chrome?.cast?.isAvailable) {
            console.log('✅ Cast SDK loaded successfully');
            initAndRequestSession();
          } else if (attempts < maxAttempts) {
            setTimeout(waitForCast, 100);
          } else {
            console.log('⚠️ Cast SDK failed to load');
            setIsScanning(false);
            setError('Cast not available. Use Chrome menu (⋮) → Cast... instead.');
          }
        };
        
        waitForCast();
        return;
      }

      // Cast API is available, request session
      initAndRequestSession();

    } catch (error) {
      console.error('Device scanning failed:', error);
      setError('Scanning failed. Use Chrome menu (⋮) → Cast...');
      setIsScanning(false);
    }
    
    function initAndRequestSession() {
      try {
        const cast = (window as any).chrome.cast;
        
        // Initialize if needed
        if (!isInitialized) {
          const sessionRequest = new cast.SessionRequest(cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
          const apiConfig = new cast.ApiConfig(
            sessionRequest,
            (session: any) => {
              // Session listener
              console.log('✅ Session started:', session.receiver.friendlyName);
              handleSessionConnected(session);
            },
            (availability: string) => {
              console.log('📡 Receiver availability:', availability);
            }
          );
          
          cast.initialize(
            apiConfig,
            () => {
              console.log('✅ Cast API initialized');
              setIsInitialized(true);
              requestCastSession();
            },
            (err: any) => {
              console.warn('Cast init error:', err);
              requestCastSession(); // Try anyway
            }
          );
        } else {
          requestCastSession();
        }
      } catch (err) {
        console.error('Cast init failed:', err);
        setIsScanning(false);
        setError('Cast failed. Use Chrome menu (⋮) → Cast...');
      }
    }
    
    function requestCastSession() {
      try {
        const cast = (window as any).chrome.cast;
        console.log('🔍 Requesting cast session...');
        
        cast.requestSession(
          (session: any) => {
            console.log('✅ Connected to:', session.receiver.friendlyName);
            handleSessionConnected(session);
          },
          (err: any) => {
            setIsScanning(false);
            if (err.code === 'cancel') {
              setError(null);
            } else if (err.code === 'receiver_unavailable') {
              setError('No Chromecast found. Make sure it\'s on the same WiFi.');
            } else {
              console.warn('Cast error:', err);
              setError('No devices found. Use Chrome menu (⋮) → Cast...');
            }
          }
        );
      } catch (err) {
        console.error('Request session failed:', err);
        setIsScanning(false);
        setError('Cast failed. Use Chrome menu (⋮) → Cast...');
      }
    }
    
    function handleSessionConnected(session: any) {
      const device: CastDevice = {
        id: session.sessionId,
        name: session.receiver.friendlyName,
        type: 'chromecast',
        status: 'connected',
        icon: <Cast className="w-4 h-4" />,
        capabilities: ['video', 'audio']
      };
      
      setCastSession(session);
      setConnectedDevice(device);
      setAvailableDevices([device]);
      setIsScanning(false);
      setError(null);
    }
  }, [isAirPlaySupported, isInitialized]);

  // Enhanced device connection with better error handling
  const connectToDevice = useCallback(async (device: CastDevice) => {
    if (!device || device.status === 'connecting') return;

    try {
      setError(null);

      // Update device status to connecting
      setAvailableDevices(prev =>
        prev.map(d =>
          d.id === device.id
            ? { ...d, status: 'connecting' }
            : d
        )
      );

      // Real Chromecast connection
      if (device.type === 'chromecast' && isInitialized) {
        try {
          const cast = (window as any).chrome.cast;
          const sessionRequest = new cast.SessionRequest(cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);

          cast.requestSession(
            (session: any) => {
              setCastSession(session);
              setConnectedDevice({
                id: session.sessionId,
                name: session.receiver.friendlyName,
                type: 'chromecast',
                status: 'connected',
                icon: <Cast className="w-4 h-4" />,
                capabilities: session.receiver.capabilities || []
              });

              // Update devices list
              setAvailableDevices(prev =>
                prev.map(d =>
                  d.id === device.id
                    ? { ...d, status: 'connected' }
                    : d
                )
              );
            },
            (error: any) => {
              if (error.code !== 'cancel') {
                console.warn('Cast connection failed:', error.code || 'unknown');
                setError('Connection failed');
              }
              setAvailableDevices(prev =>
                prev.map(d =>
                  d.id === device.id
                    ? { ...d, status: 'available' }
                    : d
                )
              );
            }
          );
        } catch (error) {
          console.error('Cast connection failed:', error);
          setError('Connection failed');
          setAvailableDevices(prev =>
            prev.map(d =>
              d.id === device.id
                ? { ...d, status: 'available' }
                : d
            )
          );
        }
      } else {
        // Mock connection for other device types
        setTimeout(() => {
          setConnectedDevice({
            ...device,
            status: 'connected'
          });

          setAvailableDevices(prev =>
            prev.map(d =>
              d.id === device.id
                ? { ...d, status: 'connected' }
                : d
            )
          );
        }, 1000);
      }

    } catch (error) {
      console.error('Device connection failed:', error);
      setError('Connection failed');
      setAvailableDevices(prev =>
        prev.map(d =>
          d.id === device.id
            ? { ...d, status: 'available' }
            : d
        )
      );
    }
  }, [isInitialized]);

  // Enhanced disconnect with cleanup
  const disconnectFromDevice = useCallback(() => {
    try {
      if (castSession) {
        castSession.stop(
          () => {
            setCastSession(null);
            setConnectedDevice(null);
            setAvailableDevices(prev =>
              prev.map(d => ({ ...d, status: 'available' }))
            );
            setError(null);
          },
          (error: any) => {
            console.error('Cast session stop failed:', error);
            setError('Disconnect failed');
          }
        );
      } else {
        setConnectedDevice(null);
        setAvailableDevices(prev =>
          prev.map(d => ({ ...d, status: 'available' }))
        );
        setError(null);
      }
    } catch (error) {
      console.error('Disconnect failed:', error);
      setError('Disconnect failed');
    }
  }, [castSession]);

  // Enhanced media casting with better error handling
  const castMedia = useCallback((videoSrc: string, title: string, poster?: string) => {
    if (!castSession) {
      setError('No active cast session');
      return;
    }

    try {
      const cast = (window as any).chrome.cast;
      const mediaInfo = new cast.media.MediaInfo(videoSrc, 'video/mp4');

      // Enhanced metadata
      mediaInfo.metadata = new cast.media.GenericMediaMetadata();
      mediaInfo.metadata.title = title;
      mediaInfo.metadata.subtitle = 'Video Player';

      if (poster) {
        mediaInfo.metadata.images = [new cast.media.Image(poster)];
      }

      // Set media tracks for subtitles
      mediaInfo.tracks = [];

      const request = new cast.media.LoadRequest(mediaInfo);
      request.autoplay = true;

      castSession.loadMedia(
        request,
        (media: any) => {
          setError(null);
        },
        (error: any) => {
          console.error('Media load failed:', error);
          setError('Media casting failed');
        }
      );
    } catch (error) {
      console.error('Cast media failed:', error);
      setError('Media casting failed');
    }
  }, [castSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('🔍 Cast Support Status:', {
      isCastSupported,
      isAirPlaySupported,
      isInitialized,
      finalValue: isCastSupported || isAirPlaySupported
    });
  }, [isCastSupported, isAirPlaySupported, isInitialized]);

  return {
    isCastSupported: isCastSupported || isAirPlaySupported,
    isAirPlaySupported,
    isAirPlayConnected,
    availableDevices,
    connectedDevice,
    isScanning,
    error,
    isInitialized,
    scanForDevices,
    connectToDevice,
    disconnectFromDevice,
    castMedia
  };
};

export function VideoPlayerControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  quality,
  availableQualities,
  selectedQualityValue,
  isAutoQuality,
  playbackRate,
  captionsEnabled,
  activeCaption,
  movieInfo,
  availableCaptions,
  isTheaterMode,
  isPiPSupported,
  isPiPActive,
  showControls,
  isFullscreen = false,
  currentAudioTrack,
  availableAudioTracks,
  onPlayPause,
  onSeek,
  onSkip,
  onVolumeChange,
  onMuteToggle,
  onQualityChange,
  onPlaybackRateChange,
  onCaptionChange,
  onAudioTrackChange,
  onTheaterModeToggle,
  onPictureInPictureToggle,
  onFullscreenToggle,
  onShowShortcuts,
  thumbnailsUrl,
  // Episode info props
  contentType,
  seriesName,
  seasonNumber,
  episodeNumber,
  episodeTitle,
  // YouTube source detection
  isYouTubeSource = false
}: VideoPlayerControlsProps) {
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [showThumbnail, setShowThumbnail] = useState(false);
  const [thumbnailPosition, setThumbnailPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showCastMenu, setShowCastMenu] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [internalProgress, setInternalProgress] = useState([0]);
  const [isInternalUpdate, setIsInternalUpdate] = useState(false);


  // Use enhanced casting functionality
  const {
    isCastSupported,
    isAirPlaySupported,
    availableDevices,
    connectedDevice,
    isScanning,
    error: castError,
    isInitialized,
    scanForDevices,
    connectToDevice,
    disconnectFromDevice,
    castMedia
  } = useCasting();

  // Debug: Log cast support in component
  useEffect(() => {
    console.log('📺 VideoPlayerControls - Cast Support:', isCastSupported);
  }, [isCastSupported]);


  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Memoize progress calculation for better performance
  const progress = useMemo(() => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  }, [currentTime, duration]);

  // Enhanced slider hover handling with debouncing
  // In your VideoPlayerControls component, update the handleSliderHover function:

  const handleSliderHover = useCallback((event: React.MouseEvent) => {
    if (!sliderRef.current || !duration) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const time = (percentage / 100) * duration;

    setHoverTime(time);

    // Update position calculation - now relative to the slider
    setThumbnailPosition({
      x: percentage, // Use percentage instead of clientX
      y: rect.top - 10 // Keep this for vertical positioning
    });

    if (thumbnailsUrl) {
      setShowThumbnail(true);
    }
  }, [duration, thumbnailsUrl]);

  const handleSliderEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleSliderLeave = useCallback(() => {
    setIsHovering(false);
    setShowThumbnail(false);
    setHoverTime(null);

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  }, []);



  const handleVolumeChange = useCallback((value: number[]) => {
    onVolumeChange(value[0] / 100);
  }, [onVolumeChange]);

  // Enhanced cast button click handler
  const handleCastClick = useCallback(() => {
    if (connectedDevice) {
      disconnectFromDevice();
    } else {
      setShowCastMenu(true);
      if (availableDevices.length === 0 && !isScanning) {
        scanForDevices();
      }
    }
  }, [connectedDevice, disconnectFromDevice, availableDevices.length, isScanning, scanForDevices]);

  // Enhanced device selection with error handling
  const handleDeviceSelect = useCallback((device: CastDevice) => {
    if (device.status === 'connecting') return;

    connectToDevice(device);
    setShowCastMenu(false);
  }, [connectToDevice]);

  // Handle drag events for better UX
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);
  // Update internal progress when currentTime changes (but not during dragging)
  useEffect(() => {
    if (!isDragging && !isInternalUpdate) {
      const newProgress = duration > 0 ? (currentTime / duration) * 100 : 0;
      setInternalProgress([newProgress]);
    }
  }, [currentTime, duration, isDragging, isInternalUpdate]);

  const handleProgressChange = useCallback((value: number[]) => {
    setIsInternalUpdate(true);
    setInternalProgress(value);

    // Debounce the actual seek to prevent rapid updates
    const time = (value[0] / 100) * duration;
    onSeek(time);

    // Reset the flag after a short delay
    setTimeout(() => {
      setIsInternalUpdate(false);
    }, 100);
  }, [duration, onSeek]);
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Use defaultCaptions if availableCaptions is empty or undefined
  // Ensure all captions have required src property
  const captionsToUse = (availableCaptions && availableCaptions.length > 0) 
    ? availableCaptions.map(caption => ({
        ...caption,
        src: caption.src || '', // Provide fallback for src if somehow undefined
        value: caption.value || caption.language // Ensure value is set
      }))
    : defaultCaptions;



  return (
    <TooltipProvider>
      <div className={cn(
        'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 transition-all duration-300',
        // Enhanced z-index - ensure controls are above YouTube iframe (z-10) and other overlays
        'z-50',
        isFullscreen && 'z-[9999] fixed',
        showControls ? 'opacity-100 translate-y-0 pointer-events-auto cursor-default' : 'opacity-0 translate-y-full pointer-events-none'
      )}>
        {/* Enhanced Cast Menu Overlay */}
        {showCastMenu && (
          <div className="absolute bottom-full left-0 right-0 mb-4 flex justify-center">
            <div className="bg-black/95 backdrop-blur-sm rounded-lg p-4 border border-white/20 max-w-md w-full mx-4 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold flex items-center">
                    <Cast className="w-5 h-5 mr-2" />
                    Cast to Device
                  </h3>
                  <p className="text-white/60 text-xs mt-1">
                    {isAirPlaySupported && 'AirPlay available (Safari)'}
                    {isInitialized && !isAirPlaySupported && 'Chromecast available (Chrome/Edge)'}
                    {!isInitialized && !isAirPlaySupported && 'Use Chrome/Edge or Safari'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCastMenu(false)}
                  className="text-white hover:bg-white/20 p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Cast error display */}
              {castError && (
                <div className="mb-4 p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg">
                  <p className="text-white text-sm">{castError}</p>
                </div>
              )}

              {isScanning ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-white mr-3" />
                  <span className="text-white">Scanning for devices...</span>
                </div>
              ) : availableDevices.length > 0 ? (
                <div className="space-y-2">
                  {availableDevices.map((device) => (
                    <button
                      key={device.id}
                      onClick={() => handleDeviceSelect(device)}
                      disabled={device.status === 'connecting'}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-lg transition-colors",
                        device.status === 'connected'
                          ? "bg-green-600/20 border border-green-500/30"
                          : "bg-white/10 hover:bg-white/20 border border-white/20",
                        device.status === 'connecting' && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center">
                        <div className="text-white mr-3">
                          {device.icon}
                        </div>
                        <div className="text-left">
                          <div className="text-white font-medium">{device.name}</div>
                          <div className="text-white/70 text-sm capitalize">
                            {device.type}
                            {device.capabilities && device.capabilities.length > 0 && (
                              <span className="ml-2">
                                ({device.capabilities.join(', ')})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-white/70 text-sm">
                        {device.status === 'connecting' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : device.status === 'connected' ? (
                          <Cast className="w-4 h-4 text-green-400" />
                        ) : (
                          <Cast className="w-4 h-4" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wifi className="w-12 h-12 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70 mb-2">No cast devices found</p>
                  {!isInitialized && !isAirPlaySupported && (
                    <p className="text-white/50 text-sm mb-4">
                      Chromecast not available. Use Chrome/Edge for Chromecast or Safari for AirPlay.
                    </p>
                  )}
                  {isAirPlaySupported && (
                    <p className="text-white/50 text-sm mb-4">
                      Click "Scan Again" to open AirPlay menu
                    </p>
                  )}
                  {isInitialized && !isAirPlaySupported && (
                    <p className="text-white/50 text-sm mb-4">
                      Make sure your Chromecast is on the same WiFi network
                    </p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={scanForDevices}
                    disabled={isScanning}
                    className="text-white border-white/20 hover:bg-white/20"
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      'Scan Again'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Connected Device Indicator */}
        {connectedDevice && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2">
            <div className="bg-green-600/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center shadow-lg">
              <Cast className="w-4 h-4 text-white mr-2" />
              <span className="text-white text-sm">
                Casting to {connectedDevice.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={disconnectFromDevice}
                className="text-white hover:bg-white/20 ml-2 p-1"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Enhanced Progress Slider */}
        <div className="mb-2">


          <div
            ref={sliderRef}
            className="relative"  // Make sure this is here
            onMouseMove={handleSliderHover}
            onMouseEnter={handleSliderEnter}
            onMouseLeave={handleSliderLeave}
          >
            <Slider
              value={[progress]}
              onValueChange={handleProgressChange}
              onPointerDown={handleDragStart}
              onPointerUp={handleDragEnd}
              max={100}
              step={0.1}
              className="w-full cursor-pointer [&_[role=slider]]:bg-white [&_[role=slider]]:border-white [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&_[role=slider]]:opacity-0 [&_[role=slider]]:hover:opacity-100 [&_[role=slider]]:transition-opacity [&>span]:bg-white/20 [&>span]:h-2 [&>span]:rounded-full"
              style={{
                '--slider-track-fill': 'rgb(239 68 68)'
              } as React.CSSProperties}
            />

            {/* Hover time indicator */}
            {isHovering && hoverTime !== null && (
              <div
                className="absolute top-0 h-2 w-0.5 bg-white/80 rounded-full pointer-events-none"
                style={{ left: `${(hoverTime / duration) * 100}%` }}
              />
            )}

            {/* Thumbnail Preview positioned relative to this container */}
            {thumbnailsUrl && (
              <ThumbnailPreview
                thumbnailsUrl={thumbnailsUrl}
                currentTime={currentTime}
                duration={duration}
                hoverTime={hoverTime}
                isVisible={showThumbnail && isHovering}
                position={thumbnailPosition}
                containerWidth={160}
                containerHeight={90}
              />
            )}
          </div>

          <div className="flex justify-between text-xs text-white/70 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center mt-1 justify-between">
          {/* Left Controls */}
          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <PlayButton className="text-white hover:bg-white/20 p-2 bg-transparent border-0 rounded-md transition-colors cursor-pointer">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </PlayButton>
              </TooltipTrigger>
              <TooltipContent>
                <p className='text-white'>{isPlaying ? 'Pause (Space)' : 'Play (Space)'}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSkip(-10)}
                  className="text-white hover:bg-white/20 p-2 cursor-pointer"
                  aria-label="Skip backward 10 seconds"
                >
                  <SkipBack className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className='text-white'>Skip back 10s (←)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSkip(10)}
                  className="text-white hover:bg-white/20 p-2 cursor-pointer"
                  aria-label="Skip forward 10 seconds"
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className='text-white'>Skip forward 10s (→)</p>
              </TooltipContent>
            </Tooltip>

            {/* Volume Controls */}
            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMuteToggle}
                    className="text-white hover:bg-white/20 p-2 cursor-pointer"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className='text-white'>{isMuted ? 'Unmute (M)' : 'Mute (M)'}</p>
                </TooltipContent>
              </Tooltip>

              <div className="w-20">
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-full cursor-pointer [&_[role=slider]]:bg-white [&_[role=slider]]:border-white [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&>span]:bg-white/20 [&>span]:h-1 [&>span]:rounded-full"
                />
              </div>

              <span className="text-xs text-white/70 w-8">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>

            <div className="hidden sm:block text-sm text-white/70">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {movieInfo && (
            <div className="movie-title text-white text-sm font-medium truncate max-w-[300px]">
              {contentType === 'episode' && seriesName ? (
                // Format: "Series Name : S1 E3 Title"
                <>
                  <span className="text-white/90">{seriesName}</span>
                  {seasonNumber && episodeNumber && (
                    <span className="text-white/70">
                      {' : S'}{seasonNumber}{' E'}{episodeNumber}
                    </span>
                  )}
                  {episodeTitle && (
                    <span className="text-white/70">
                      {' '}
                      {/* Strip "Episode X:" or "Episode X -" prefix from title */}
                      {episodeTitle.replace(/^Episode\s*\d+\s*[:\-]\s*/i, '')}
                    </span>
                  )}
                </>
              ) : (
                // For movies, just show the title
                movieInfo.title
              )}
            </div>
          )}


          {/* Right Controls */}
          <div className="flex items-center space-x-2">
            <VideoCaption
              activeCaption={activeCaption}
              availableCaptions={availableCaptions}
              onCaptionChange={onCaptionChange}
            />



            {/* Enhanced Settings with Audio Language */}
            <Tooltip>
              <TooltipTrigger asChild>
                <VideoSettings
                  setPlaybackRate={onPlaybackRateChange}
                  setCurrentQuality={onQualityChange}
                  availableQualities={isYouTubeSource ? [] : availableQualities} // Hide quality options for YouTube
                  currentQuality={isYouTubeSource ? 'Auto (YouTube)' : quality}
                  selectedQualityValue={selectedQualityValue}
                  isAutoQuality={isAutoQuality}
                  currentAudioTrack={currentAudioTrack}
                  availableAudioTracks={isYouTubeSource ? [] : availableAudioTracks} // YouTube manages audio tracks
                  onAudioTrackChange={onAudioTrackChange}
                  availableCaptions={isYouTubeSource ? [] : availableCaptions} // YouTube captions controlled via native CC button
                  currentCaption={activeCaption}
                  onCaptionChange={onCaptionChange}
                  isYouTubeSource={isYouTubeSource}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className='text-white'>Settings</p>
              </TooltipContent>
            </Tooltip>





            {/* Cast Button */}
            {isCastSupported && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCastClick}
                    className={cn(
                      "text-white hover:bg-white/20 p-2 cursor-pointer",
                      connectedDevice && "bg-green-600/20 text-green-400"
                    )}
                    aria-label={connectedDevice ? 'Disconnect casting' : 'Cast to device'}
                  >
                    {connectedDevice ? (
                      <Cast className="w-4 h-4" />
                    ) : (
                      <Cast className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className='text-white'>
                    {connectedDevice ? 'Disconnect casting' : 'Cast to device'}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}

            {isPiPSupported && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onPictureInPictureToggle}
                    className={cn(
                      "text-white hover:bg-white/20 p-2 cursor-pointer",
                      isPiPActive && "bg-white/20"
                    )}
                    aria-label="Picture in Picture"
                  >
                    <PictureInPicture2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className='text-white'>Picture in Picture</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onTheaterModeToggle}
                  className={cn(
                    "text-white hover:bg-white/20 p-2 cursor-pointer",
                    isTheaterMode && "bg-white/20"
                  )}
                  aria-label="Theater mode"
                >
                  <MonitorSpeaker className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className='text-white mx-auto'>Theater mode (T)</p>
              </TooltipContent>
            </Tooltip>


            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onFullscreenToggle}
                  className="text-white hover:bg-white/20 p-2 cursor-pointer"
                  aria-label="Fullscreen"
                >
                  <Maximize className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className='text-white mx-auto mr-8'>Fullscreen (F)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Thumbnail Preview */}
        {/* {thumbnailsUrl && (
          <ThumbnailPreview
            thumbnailsUrl={thumbnailsUrl}
            currentTime={currentTime}
            duration={duration}
            hoverTime={hoverTime}
            isVisible={showThumbnail && isHovering}
            position={thumbnailPosition}
            containerWidth={160}
            containerHeight={90}
          />
        )
        } */}
      </div>
    </TooltipProvider >
  );
}