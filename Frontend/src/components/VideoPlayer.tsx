'use client'
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { AudioTrack, Caption, Captions, MediaPlayer, MediaProvider, PlayButton, Poster, Spinner, Thumbnail, Track, useMediaState, isYouTubeProvider, type MediaProviderAdapter } from '@vidstack/react';
import { type VideoQuality } from '@vidstack/react';
import '@vidstack/react/player/styles/default/captions.css';
import '../styles/next-episode-animations.css';
import { VideoPlayerControls } from './VideoPlayerControls';
import { VideoPlayerOverlay } from './VideoPlayerOverlay';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { cn } from '@/lib/utils';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { CaptionDisplay } from './CaptionDisplay';
import { SkipIntroButton } from './SkipIntroButton';
import { NextEpisodeButton } from './NextEpisodeButton';
import { useWatchProgress } from '@/hooks/useWatchProgress';
import { toast } from '@/hooks/use-toast';


import { useMediaStore, type MediaPlayerInstance } from '@vidstack/react';
import {
  getEpisodeMetadata,
  getNextEpisode,
  getMovieMetadata,
  type EpisodeMetadata,
  type MovieMetadata
} from '@/lib/episode-metadata';
import { type Episode } from '@/types';
import {
  validateEpisodeNavigationProps,
  mapEpisodeToMetadata,
  getNextEpisodeIndex,
  type EpisodeDataMapping
} from '@/utils/episode-validation';
import {
  validateEpisodeDataWithErrorHandling,
  retryWithBackoff,
  validateVideoSource,
  handleEpisodeTransitionError,
  getUserFriendlyErrorMessage,
  createEpisodeError,
  EpisodeNavigationLogger,
  type EpisodeNavigationError,
  type RetryConfig
} from '@/utils/episode-error-handling';
import {
  findEpisodeWithIdResolution,
  normalizeEpisodeMetadataId,
  validateEpisodeIdConsistency
} from '@/utils/episode-id-resolver';
import { VideoPlayerDebugger } from './VideoPlayerDebugger';
import { getVidstackLogLevel } from '@/lib/vidstack-logger-config';
// VTT file URLs - using public URLs instead of imports
const thumbnailpreview = '/assets/thumbnailpreview.vtt';


// Add this interface for proper typing


interface QualityOption {
  value: string;
  label: string;
  src: string;
  width?: number;
  height?: number;
  bitrate?: number;
}


export interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
  onPlayingChange?: (playing: boolean) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  // Auto-fullscreen and auto-play functionality
  autoFullscreen?: boolean;
  autoPlay?: boolean;
  // Netflix-like features
  contentType?: 'movie' | 'episode';
  contentId?: string; // movie ID or episode ID
  seriesId?: string; // for episodes, the series they belong to
  seriesName?: string; // Series/show name for TV shows (used for watch history URLs)
  onEpisodeChange?: (newEpisodeData: EpisodeMetadata) => void;
  // Next episode overlay timing (seconds before end to show overlay)
  nextEpisodeTriggerTime?: number;

  // New props for episode navigation
  episodes?: Episode[]; // Complete episode list from TV show
  currentEpisodeIndex?: number; // Index of current episode in the list
  seasonNumber?: number; // Current season number
}


interface title {
  title: string;
}
interface PendingResume {
  time: number;
  wasPlaying: boolean;
  wasFullscreen: boolean;
}

interface TextTrack {
  mode: 'disabled' | 'hidden' | 'showing';
  language: string;
  label: string;
  kind: TextTrackKind;
  id?: string;
}

interface TextTrackList extends ArrayLike<TextTrack> {
  length: number;
  [index: number]: TextTrack;
}

interface MediaPlayerRef {
  current: {
    textTracks?: TextTrackList;
    audioTracks?: any[];
  } | null;
}

export function VideoPlayerContent({
  src,
  poster,
  title = 'Unknown Movie',
  className,
  onPlayingChange,
  onTimeUpdate,
  autoFullscreen = false,
  autoPlay = false,
  contentType = 'movie',
  contentId,
  seriesId,
  seriesName,
  onEpisodeChange,
  nextEpisodeTriggerTime = 120, // Default 2 minutes
  // New episode navigation props
  episodes,
  currentEpisodeIndex,
  seasonNumber
}: VideoPlayerProps) {
  // Store the series name for display and watch progress tracking
  // Use explicit seriesName prop if provided, otherwise fall back to title
  const [displaySeriesName, setDisplaySeriesName] = useState(seriesName || title || 'Unknown');
  
  // Update displaySeriesName when seriesName prop changes (but not when title changes for episodes)
  useEffect(() => {
    if (seriesName) {
      setDisplaySeriesName(seriesName);
    } else if (title && contentType !== 'episode') {
      setDisplaySeriesName(title);
    }
  }, [seriesName, title, contentType]);
  
  // Dynamic title and poster state that updates with episode changes
  const [currentTitle, setCurrentTitle] = useState(title || 'Unknown Movie');
  const [currentPoster, setCurrentPoster] = useState(poster || '');

  // Update title when the title prop changes (for non-episode content)
  useEffect(() => {
    if (title && (!episodes || episodes.length === 0)) {
      setCurrentTitle(title);
      
    }
  }, [title, episodes]);

  // Update poster when the poster prop changes (for non-episode content)
  useEffect(() => {
    if (poster && (!episodes || episodes.length === 0)) {
      setCurrentPoster(poster);
    }
  }, [poster, episodes]);

  const movieInfo = useMemo(() => {
    const info = {
      title: currentTitle
    };
    return info;
  }, [currentTitle]);

  /**
   * Configure Vidstack logging to prevent state serialization errors in development.
   * 
   * Issue: Next.js dev server attempts to stringify Vidstack's reactive state proxies
   * when logging, which causes "this.$state[prop2] is not a function" errors.
   * 
   * Solution: Use 'warn' level in development to suppress verbose info logs that
   * trigger serialization, while preserving visibility of actual errors.
   * 
   * See: .kiro/specs/vidstack-logging-error-fix/requirements.md
   */
  const vidstackLogLevel = useMemo(() => getVidstackLogLevel(), []);

  // Debug logging for title changes
  useEffect(() => {
    console.trace('🎬 Title change stack trace');
  }, [currentTitle]);
  const playerRef = useRef<MediaPlayerInstance>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [episodeError, setEpisodeError] = useState<EpisodeNavigationError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [fallbackActive, setFallbackActive] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [activeCaption, setActiveCaption] = useState('off');
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [isPiPSupported, setIsPiPSupported] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [currentVideoSrc, setCurrentVideoSrc] = useState(src);
  const [pendingResume, setPendingResume] = useState<PendingResume | null>(null);

  // Netflix-like features state
  const [introData, setIntroData] = useState<{ start: number; end: number } | null>({
    start: 0,
    end: 30 // Default 30 seconds intro for all content
  });
  const [nextEpisodeData, setNextEpisodeData] = useState<EpisodeMetadata | null>(null);

  const [hasVideoEnded, setHasVideoEnded] = useState(false);

  // Episode navigation state management
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [episodeList, setEpisodeList] = useState<Episode[]>([]);
  const [internalEpisodeIndex, setInternalEpisodeIndex] = useState<number>(0);
  const [nextEpisode, setNextEpisode] = useState<Episode | null>(null);
  const [isTransitioningEpisode, setIsTransitioningEpisode] = useState<boolean>(false);
  const [lastTransitionedEpisodeId, setLastTransitionedEpisodeId] = useState<string | null>(null);

  // Integration state for proper overlay management
  const [controlsVisible, setControlsVisible] = useState(true);
  const [overlayZIndex, setOverlayZIndex] = useState(60);
  const [userPreferences, setUserPreferences] = useState({
    volume: 1,
    playbackRate: 1,
    activeCaption: 'off',
    audioTrack: 0
  });

  // Enhanced fullscreen state management
  const [isFullscreenTransitioning, setIsFullscreenTransitioning] = useState(false);
  const [shouldMaintainFullscreen, setShouldMaintainFullscreen] = useState(false);
  const [fullscreenBeforeQualityChange, setFullscreenBeforeQualityChange] = useState(false);

  // ===== WATCH PROGRESS TRACKING =====
  
  // Initialize watch progress hook
  // For TV shows: displaySeriesName = series name (stable), currentTitle = episode title
  // For movies: displaySeriesName = movie title, currentTitle = movie title
  const {
    saveProgress: saveWatchProgress,
    clearProgress: clearWatchProgress,
    resumePoint,
    isLoading: isProgressLoading
  } = useWatchProgress(
    contentId || 'unknown',
    contentType === 'episode' ? 'tv-show' : contentType === 'movie' ? 'movie' : 'trailer',
    {
      title: displaySeriesName,
      thumbnail: currentPoster,
      seasonNumber,
      episodeNumber: currentEpisodeIndex !== undefined ? currentEpisodeIndex + 1 : undefined,
      episodeTitle: currentEpisode?.title,
      seriesName: contentType === 'episode' ? displaySeriesName : undefined,
    }
  );

  // Debug logging for watch progress initialization

  // Track if we've already resumed to avoid multiple resume attempts
  const hasResumedRef = useRef(false);
  const resumeToastIdRef = useRef<string | null>(null);

  // ===== INTEGRATION AND OVERLAY MANAGEMENT =====



  // Coordinate overlay visibility with controls
  useEffect(() => {
    setControlsVisible(showControls);
  }, [showControls]);

  // Use Vidstack's state hooks for real-time updates
  const isPlaying = useMediaState('playing', playerRef);
  const currentTime = useMediaState('currentTime', playerRef);
  const duration = useMediaState('duration', playerRef);
  const isFullscreen = useMediaState('fullscreen', playerRef);
  const buffered = useMediaState('buffered', playerRef);
  const canPlay = useMediaState('canPlay', playerRef);
  const pictureInPicture = useMediaState('pictureInPicture', playerRef);
  const textTracks = useMediaState('textTracks', playerRef);
  const audioTracks = useMediaState('audioTracks', playerRef);
  const [currentAudioTrackIndex, setCurrentAudioTrackIndex] = useState(0);

  // ===== RESUME FUNCTIONALITY =====
  
  // Handle resume from saved position when player is ready
  useEffect(() => {
    if (!playerRef.current || !canPlay || !resumePoint || hasResumedRef.current) {
      return;
    }

    // Only resume if resumePoint is meaningful (> 30 seconds)
    if (resumePoint > 30) {
      
      // Seek to resume point
      playerRef.current.currentTime = resumePoint;
      hasResumedRef.current = true;

      // Format time for display
      const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
          return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
      };

      // Show toast notification with "Start from beginning" option
      const toastInstance = toast({
        title: `Resuming from ${formatTime(resumePoint)}`,
        description: 'Continue where you left off',
        duration: 3000
      });

      resumeToastIdRef.current = toastInstance.id;

      // Begin playback automatically after seeking
      if (autoPlay) {
        setTimeout(() => {
          playerRef.current?.play();
        }, 100);
      }
    }
  }, [canPlay, resumePoint, autoPlay]);

  // Reset resume flag when video source changes
  useEffect(() => {
    hasResumedRef.current = false;
    if (resumeToastIdRef.current) {
      // Dismiss previous resume toast if still showing
      resumeToastIdRef.current = null;
    }
  }, [currentVideoSrc, contentId]);

  // ===== PROGRESS TRACKING DURING PLAYBACK =====
  
  // Ref to track last save time for throttling
  const lastProgressSaveRef = useRef<number>(0);
  const SAVE_INTERVAL = 10000; // Save every 10 seconds
  
  // Track progress during playback - only when video is actually playing
  useEffect(() => {
    // Only track when video is actively playing
    if (!isPlaying) {
      return;
    }

    if (!currentTime || !duration) {
      return;
    }

    // Only start tracking after 5 seconds of playback
    if (currentTime < 5) {
      return;
    }

    // Calculate percentage
    const percentage = (currentTime / duration) * 100;

    // Clear progress if 95% or more complete
    if (percentage >= 95) {
      clearWatchProgress();
      return;
    }

    // Throttle saves to every 10 seconds
    const now = Date.now();
    const timeSinceLastSave = now - lastProgressSaveRef.current;
    
    if (timeSinceLastSave >= SAVE_INTERVAL) {
      
      
      saveWatchProgress(currentTime, duration);
      lastProgressSaveRef.current = now;
    }
  }, [currentTime, duration, isPlaying, saveWatchProgress, clearWatchProgress, contentId]);

  // Handle video ended event to clear progress
  useEffect(() => {
    if (hasVideoEnded) {
      clearWatchProgress();
    }
  }, [hasVideoEnded, clearWatchProgress]);

  // Configuration for when to show next episode overlay (in seconds before end)
  const NEXT_EPISODE_TRIGGER_TIME = nextEpisodeTriggerTime;

  // Dynamic z-index management based on player state
  useEffect(() => {
    const calculateZIndex = () => {
      if (isFullscreen) return 9999;
      if (isPiPActive) return 9998;
      if (isTheaterMode) return 100;
      return 60;
    };

    setOverlayZIndex(calculateZIndex());
  }, [isFullscreen, isPiPActive, isTheaterMode]);
  // Save user preferences when they change
  useEffect(() => {
    setUserPreferences({
      volume: isMuted ? 0 : volume,
      playbackRate,
      activeCaption,
      audioTrack: currentAudioTrackIndex
    });
  }, [volume, isMuted, playbackRate, activeCaption, currentAudioTrackIndex]);

  // Add these new state variables after your existing useState declarations
  // Replace the existing buffering states with these:
  const [isBuffering, setIsBuffering] = useState(false);
  // Add this with your other useMediaState calls

  // Add this state
  const [connectionSpeed, setConnectionSpeed] = useState('fast'); // 'slow', 'medium', 'fast'

  // ===== EPISODE DATA PROCESSING =====

  /**
   * Validates episode data for the VideoPlayerContent component with enhanced error handling
   * @param episodes - Array of episodes to validate
   * @param currentIndex - Current episode index
   * @param season - Season number
   * @returns Validation result with detailed error information
   */
  const validateEpisodeDataForPlayer = useCallback((
    episodes?: Episode[],
    currentIndex?: number,
    season?: number
  ): { isValid: boolean; error?: EpisodeNavigationError; hasEpisodeData: boolean } => {
    const logger = EpisodeNavigationLogger.getInstance();

    logger.log('info', 'Validating episode data for VideoPlayer', {
      episodesCount: episodes?.length,
      currentIndex,
      season
    });

    // Use enhanced validation with comprehensive error handling
    const validation = validateEpisodeDataWithErrorHandling(episodes, currentIndex, season);

    if (!validation.isValid && validation.error) {
      logger.log('error', 'Episode data validation failed', {
        error: validation.error.message,
        type: validation.error.type,
        context: validation.error.context
      });
    } else if (validation.isValid && validation.hasEpisodeData) {
      logger.log('info', 'Episode data validation successful', {
        episodesCount: episodes?.length,
        currentEpisode: episodes?.[currentIndex || 0]?.title
      });
    }

    return validation;
  }, []);

  /**
   * Maps Episode data to EpisodeMetadata for internal use
   * @param episode - Episode to map
   * @param season - Season number
   * @param series - Series ID
   * @returns Mapped EpisodeMetadata
   */
  const mapEpisodeDataToMetadata = useCallback((
    episode: Episode,
    season: number,
    series: string
  ): EpisodeMetadata => {

    return mapEpisodeToMetadata(episode, season, series, {
      defaultVideoSource: 'https://files.vidstack.io/sprite-fight/1080p.mp4',
      defaultIntroStart: 0,
      defaultIntroEnd: 45,
      validateVideoSources: false // Skip URL validation for now
    });
  }, []);

  // Process episode props and update internal state
  useEffect(() => {
    

    // Skip processing if we're in the middle of an episode transition
    if (isTransitioningEpisode) {
      return;
    }

   

    // Validate episode data
    const validation = validateEpisodeDataForPlayer(episodes, currentEpisodeIndex, seasonNumber);

    if (!validation.hasEpisodeData) {
      // No episode data provided - clear episode state and use existing metadata service
      setCurrentEpisode(null);
      setEpisodeList([]);
      setInternalEpisodeIndex(0);
      setNextEpisode(null);
      setNextEpisodeData(null);

      // Still set default intro data even without episode data
      setIntroData({
        start: 0,
        end: 30
      });
      return;
    }

    if (!validation.isValid && validation.error) {
      // Invalid episode data - handle error and fall back to metadata service
      const logger = EpisodeNavigationLogger.getInstance();

      logger.log('error', 'Invalid episode data, falling back to metadata service', {
        error: validation.error.message,
        type: validation.error.type,
        fallbackAvailable: validation.error.fallbackAvailable
      });

      setEpisodeError(validation.error);
      setError(validation.error.userMessage);
      setFallbackActive(true);

      // Reset episode state to trigger fallback to metadata service
      setCurrentEpisode(null);
      setEpisodeList([]);
      setInternalEpisodeIndex(0);
      setNextEpisode(null);
      setNextEpisodeData(null);

      // Still set default intro data even with invalid episode data
      setIntroData({
        start: 0,
        end: 30
      });
      return;
    }

    // Valid episode data - process and update state
    try {
      const episodeArray = episodes!;
      const currentIndex = currentEpisodeIndex!;
      const season = seasonNumber!;

      // Update episode list
      setEpisodeList(episodeArray);
      setInternalEpisodeIndex(currentIndex);

      // Set current episode
      const currentEpisodeData = episodeArray[currentIndex];
      setCurrentEpisode(currentEpisodeData);

      // Update the title for the controls (only if not transitioning and not overwriting a recent transition)
      const shouldUpdateTitle = !isTransitioningEpisode &&
        (lastTransitionedEpisodeId === null || lastTransitionedEpisodeId === currentEpisodeData.id);

      if (shouldUpdateTitle) {
        setCurrentTitle(currentEpisodeData.title);

        // If we're updating the title and it matches the last transitioned episode, clear the tracking
        if (lastTransitionedEpisodeId === currentEpisodeData.id) {
          setLastTransitionedEpisodeId(null);
        }
      } else {
       
      }

      // Update poster from episode thumbnail (only if not transitioning and not overwriting a recent transition)
      const shouldUpdatePoster = !isTransitioningEpisode &&
        (lastTransitionedEpisodeId === null || lastTransitionedEpisodeId === currentEpisodeData.id);

      if (currentEpisodeData.thumbnail && shouldUpdatePoster) {
        setCurrentPoster(currentEpisodeData.thumbnail);
      } else {
        
      }

      // Update video source - use episode src or fallback to default
      const episodeSrc = currentEpisodeData.src || 'https://files.vidstack.io/sprite-fight/1080p.mp4';
      const sourceValidation = validateVideoSource(episodeSrc);
      setCurrentVideoSrc(sourceValidation.src);
     
      if (sourceValidation.usingFallback || !currentEpisodeData.src) {
        console.warn('🎬 Using fallback/default source for episode:', currentEpisodeData.title);
      }

      // Find and set next episode
      const nextEpisodeIndex = getNextEpisodeIndex(currentIndex, episodeArray.length);
      if (nextEpisodeIndex !== null && nextEpisodeIndex < episodeArray.length) {
        const nextEpisodeFromArray = episodeArray[nextEpisodeIndex];
        setNextEpisode(nextEpisodeFromArray);

        // Map next episode to EpisodeMetadata for NextEpisodeButton
        const nextEpisodeMetadata = mapEpisodeDataToMetadata(
          nextEpisodeFromArray,
          season,
          seriesId || `season-${season}`
        );
        setNextEpisodeData(nextEpisodeMetadata);

       
      } else {
        setNextEpisode(null);
        setNextEpisodeData(null);
      }

      // Ensure next episode data is set if we have multiple episodes
      if (episodeArray.length > 1 && currentIndex < episodeArray.length - 1) {
        const nextEpisodeFromArray = episodeArray[currentIndex + 1];
        if (nextEpisodeFromArray && !nextEpisodeData) {
          const nextEpisodeMetadata = mapEpisodeDataToMetadata(
            nextEpisodeFromArray,
            season,
            seriesId || `season-${season}`
          );
          setNextEpisodeData(nextEpisodeMetadata);
        }
      }

      // Update intro data from current episode if available
      const currentEpisodeMetadata = mapEpisodeDataToMetadata(
        currentEpisodeData,
        season,
        seriesId || `season-${season}`
      );

      // Always use 30 seconds default intro for all episodes
      setIntroData({
        start: 0,
        end: 30
      });

     

      // Clear any previous errors
      setError(null);

    } catch (processingError) {
      const logger = EpisodeNavigationLogger.getInstance();
      const episodeError = createEpisodeError(processingError, {
        episodesCount: episodes?.length,
        currentEpisodeIndex,
        seasonNumber,
        operation: 'episode_data_processing'
      });

      logger.log('error', 'Error processing episode data', {
        error: episodeError.message,
        type: episodeError.type,
        context: episodeError.context
      });

      setEpisodeError(episodeError);
      setError(episodeError.userMessage);
      setFallbackActive(true);

      // Reset to safe state
      setCurrentEpisode(null);
      setEpisodeList([]);
      setInternalEpisodeIndex(0);
      setNextEpisode(null);
      setNextEpisodeData(null);
    }
  }, [episodes, currentEpisodeIndex, seasonNumber, seriesId, validateEpisodeDataForPlayer, mapEpisodeDataToMetadata, isTransitioningEpisode, lastTransitionedEpisodeId]);

  // ===== NETFLIX-LIKE FEATURES =====

  // Load intro data and next episode when content changes (fallback for non-prop-based episodes)
  useEffect(() => {
    // Skip metadata service loading if we have episode data from props
    if (currentEpisode && episodeList.length > 0) {
      return;
    }

    const loadContentMetadata = async () => {
      if (!contentId) {
        const logger = EpisodeNavigationLogger.getInstance();
        logger.log('info', 'No contentId provided - Netflix features disabled');
        return;
      }

      const logger = EpisodeNavigationLogger.getInstance();
      logger.log('info', 'Loading content metadata', { contentType, contentId, seriesId });

      const retryConfig: Partial<RetryConfig> = {
        maxRetries: 2,
        baseDelay: 1000,
        backoffMultiplier: 2
      };

      try {
        await retryWithBackoff(async () => {
          if (contentType === 'episode') {
            // Load current episode metadata for intro timing
            const episodeData = await getEpisodeMetadata(contentId);
            if (episodeData) {
              // Validate episode data structure
              if (typeof episodeData.introStart === 'number' && typeof episodeData.introEnd === 'number') {
                setIntroData({
                  start: episodeData.introStart,
                  end: episodeData.introEnd
                });
                logger.log('info', 'Episode intro data loaded successfully', {
                  introStart: episodeData.introStart,
                  introEnd: episodeData.introEnd
                });
              } else {
                logger.log('warn', 'Episode metadata has invalid intro timing, disabling intro skip', {
                  introStart: episodeData.introStart,
                  introEnd: episodeData.introEnd
                });
                setIntroData(null);
              }
            } else {
              // Fallback: No intro data for episodes without metadata
              logger.log('info', 'No episode metadata found, disabling intro skip');
              setIntroData(null);
            }

            // Load next episode data for auto-play with retry
            try {
              const nextEpisode = await retryWithBackoff(
                () => getNextEpisode(contentId),
                { maxRetries: 1, baseDelay: 500 },
                { contentId, operation: 'load_next_episode' }
              );
              setNextEpisodeData(nextEpisode);
              logger.log('info', 'Next episode data loaded successfully', {
                nextEpisodeTitle: nextEpisode?.title
              });
            } catch (nextEpisodeError) {
              logger.log('warn', 'Failed to load next episode data', { error: nextEpisodeError });
              setNextEpisodeData(null);
            }
          } else if (contentType === 'movie') {
            // Load movie metadata for intro timing
            const movieData = await getMovieMetadata(contentId);
            if (movieData) {
              // Validate movie data structure
              if (typeof movieData.introStart === 'number' && typeof movieData.introEnd === 'number') {
                setIntroData({
                  start: movieData.introStart,
                  end: movieData.introEnd
                });
                logger.log('info', 'Movie intro data loaded successfully', {
                  introStart: movieData.introStart,
                  introEnd: movieData.introEnd
                });
              } else {
                logger.log('warn', 'Movie metadata has invalid intro timing, using default', {
                  introStart: movieData.introStart,
                  introEnd: movieData.introEnd
                });
                setIntroData({
                  start: 0,
                  end: 90
                });
              }
            } else {
              // Fallback: Default intro timing for movies (0-30 seconds)
              logger.log('info', 'No movie metadata found, using default intro timing (0-30s)');
              setIntroData({
                start: 0,
                end: 30
              });
            }
            // Movies don't have next episodes
            setNextEpisodeData(null);
          }
        }, retryConfig, { contentType, contentId, seriesId, operation: 'load_content_metadata' });

      } catch (error) {
        const logger = EpisodeNavigationLogger.getInstance();
        const episodeError = createEpisodeError(error, {
          contentType,
          contentId,
          seriesId,
          operation: 'load_content_metadata'
        });

        logger.log('error', 'Failed to load content metadata after retries', {
          error: episodeError.message,
          type: episodeError.type,
          contentType,
          contentId
        });

        // Graceful degradation: Set default intro timing for movies, disable for episodes
        if (contentType === 'movie') {
          logger.log('info', 'Using default intro timing for movie due to metadata error');
          setIntroData({
            start: 0,
            end: 30
          });
        } else {
          logger.log('info', 'Using default intro timing for episode due to metadata error');
          setIntroData({
            start: 0,
            end: 30
          });
        }

        // Clear next episode data on error
        setNextEpisodeData(null);

        // Set fallback state if this is a critical error
        if (!episodeError.fallbackAvailable) {
          setFallbackActive(true);
          setEpisodeError(episodeError);
        }
      }
    };

    loadContentMetadata();
  }, [contentId, contentType, currentEpisode, episodeList.length]);

  // Update currentVideoSrc when src prop changes with enhanced error handling
  useEffect(() => {
    if (src !== currentVideoSrc) {
      const logger = EpisodeNavigationLogger.getInstance();

      // Validate video source before using it
      const sourceValidation = validateVideoSource(src);

      logger.log('info', 'Video source changed', {
        from: currentVideoSrc,
        to: src,
        isValid: sourceValidation.isValid,
        usingFallback: sourceValidation.usingFallback
      });

      // Preserve current state if video is playing
      if (playerRef.current && isPlaying && currentTime > 0) {
        setPendingResume({
          time: currentTime,
          wasPlaying: isPlaying,
          wasFullscreen: isFullscreen
        });
        logger.log('info', 'Preserving playback state for video source change', {
          time: currentTime,
          wasPlaying: isPlaying,
          wasFullscreen: isFullscreen
        });
      }

      // Use validated source (may be fallback)
      setCurrentVideoSrc(sourceValidation.src);
      setIsLoading(true);
      setError(null);
      setEpisodeError(null);

      // Set fallback state if using fallback source
      if (sourceValidation.usingFallback) {
        setFallbackActive(true);
        logger.log('warn', 'Using fallback video source due to invalid original source');
      } else {
        setFallbackActive(false);
      }
    }
  }, [src, currentVideoSrc, isPlaying, currentTime, isFullscreen]);

  // Enhanced video loading error handling with retry mechanism
  useEffect(() => {
    if (!playerRef.current) return;

    const logger = EpisodeNavigationLogger.getInstance();
    const player = playerRef.current;

    const handleVideoError = async (event: any) => {
      const error = event.detail?.error || event.error || new Error('Video loading failed');

      logger.log('error', 'Video source loading error detected', {
        error: error.message,
        currentSrc: currentVideoSrc,
        retryCount,
        fallbackActive
      });

      // Don't retry if already using fallback or exceeded retry limit
      if (fallbackActive || retryCount >= 3) {
        logger.log('error', 'Video loading failed permanently', {
          fallbackActive,
          retryCount,
          maxRetries: 3
        });

        const episodeError = createEpisodeError(error, {
          operation: 'video_source_loading',
          currentSrc: currentVideoSrc,
          retryCount
        });

        setEpisodeError(episodeError);
        setError(episodeError.userMessage);
        setIsLoading(false);
        return;
      }

      // Attempt retry with fallback source
      logger.log('info', 'Attempting video source retry with fallback');
      setIsRetrying(true);
      setRetryCount(prev => prev + 1);

      try {
        await retryWithBackoff(async () => {
          const fallbackSrc = 'https://files.vidstack.io/sprite-fight/1080p.mp4';
          logger.log('info', 'Retrying with fallback video source', { fallbackSrc });

          setCurrentVideoSrc(fallbackSrc);
          setFallbackActive(true);
          setError(null);
          setEpisodeError(null);

          // Wait a bit for the source to change
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Check if the new source is loading
          if (player.state.error) {
            throw new Error('Fallback source also failed to load');
          }
        }, {
          maxRetries: 1,
          baseDelay: 2000
        }, {
          operation: 'video_source_retry',
          originalSrc: currentVideoSrc,
          retryAttempt: retryCount + 1
        });

        logger.log('info', 'Video source retry successful');
        setIsRetrying(false);

      } catch (retryError) {
        logger.log('error', 'Video source retry failed', { error: retryError });

        const episodeError = createEpisodeError(retryError, {
          operation: 'video_source_retry_failed',
          originalSrc: currentVideoSrc,
          retryCount: retryCount + 1
        });

        setEpisodeError(episodeError);
        setError('Video failed to load. Please try refreshing the page.');
        setIsRetrying(false);
        setIsLoading(false);
      }
    };

    const handleVideoCanPlay = () => {
      logger.log('info', 'Video can play - clearing error states');
      setError(null);
      setEpisodeError(null);
      setIsRetrying(false);
      // Don't reset retry count here as it should persist for the session
    };

    // Add event listeners
    player.addEventListener('error', handleVideoError);
    player.addEventListener('canplay', handleVideoCanPlay);

    // Cleanup
    return () => {
      player.removeEventListener('error', handleVideoError);
      player.removeEventListener('canplay', handleVideoCanPlay);
    };
  }, [currentVideoSrc, retryCount, fallbackActive]);

  // STEP 1: Replace your existing handleCaptionChange method
  const handleCaptionChange = (captionLanguage: string): void => {
    setActiveCaption(captionLanguage);

    if (!playerRef.current) {
      console.error('[CAPTIONS] Player not available.');
      return;
    }

    try {
      const player = playerRef.current;

      if (captionLanguage === 'off') {

        if (player.textTracks) {
          for (let i = 0; i < player.textTracks.length; i++) {
            const track = player.textTracks[i];
            if (track && track.mode === 'showing') {
              track.mode = 'disabled';
            }
          }
        }
        setCaptionsEnabled(false);
      } else {

        if (player.textTracks) {
          // First disable all tracks
          for (let i = 0; i < player.textTracks.length; i++) {
            const track = player.textTracks[i];
            if (track) {
              track.mode = 'disabled';
            }
          }

          // Then enable the target track
          for (let i = 0; i < player.textTracks.length; i++) {
            const track = player.textTracks[i];
            if (track && track.language === captionLanguage) {
              track.mode = 'showing';
              setCaptionsEnabled(true);
              return;
            }
          }

          console.warn(`[CAPTIONS] Track not found for language: ${captionLanguage}`);
          setCaptionsEnabled(false);
        }
      }
    } catch (error) {
      console.error('[CAPTIONS] Error changing caption track:', error);
    }
  };


  // Helper function to determine if intro skip is available
  const isIntroSkipAvailable = useCallback(() => {
    return introData !== null && introData.start < introData.end;
  }, [introData]);

  // Helper function to check if current time is within intro range
  const isInIntroRange = useCallback((time: number) => {
    if (!introData) return false;
    return time >= introData.start && time <= introData.end;
  }, [introData]);

  // Monitor intro detection for debugging and validation
  useEffect(() => {
    if (!introData || !currentTime) return;

    const isCurrentlyInIntro = isInIntroRange(currentTime);

    // Log intro detection state changes (throttled to avoid spam)
    const logThrottleKey = `intro-${Math.floor(currentTime / 5) * 5}`; // Log every 5 seconds
    if (isCurrentlyInIntro && !(window as any).lastIntroLog || (window as any).lastIntroLog !== logThrottleKey) {
     
      (window as any).lastIntroLog = logThrottleKey;
    }
  }, [currentTime, introData, isInIntroRange, isIntroSkipAvailable, contentType, contentId]);

  // Debug Skip Intro Button visibility
  useEffect(() => {
    const shouldShow = introData && isIntroSkipAvailable();
    
  }, [introData, isIntroSkipAvailable, currentTime]);

  // Handle skip intro functionality
  const handleSkipIntro = useCallback(() => {
    try {
      if (!playerRef.current) {
        console.warn('🎬 Cannot skip intro: video player not available');
        return;
      }

      if (!introData) {
        console.warn('🎬 Cannot skip intro: intro data not available');
        return;
      }

      // Validate intro data structure
      if (typeof introData.start !== 'number' || typeof introData.end !== 'number') {
        console.error('🎬 Invalid intro data structure:', introData);
        return;
      }

      if (introData.start >= introData.end) {
        console.error('🎬 Invalid intro timing: start >= end', introData);
        return;
      }

      const currentVideoTime = currentTime || 0;

      // Validate that the target time is reasonable
      if (introData.end > (duration || 0)) {
        console.warn('🎬 Intro end time exceeds video duration:', {
          introEnd: introData.end,
          videoDuration: duration
        });
        return;
      }

     

      // Jump to the end of the intro
      playerRef.current.currentTime = introData.end;

    } catch (error) {
    }
  }, [introData, currentTime, contentType, contentId, duration]);

  // Handle next episode selection with comprehensive error handling and retry logic
  const handlePlayNextEpisode = useCallback(async (episodeData: EpisodeMetadata) => {
    const logger = EpisodeNavigationLogger.getInstance();

    // Set transition flag to prevent useEffect interference
    setIsTransitioningEpisode(true);

    // Debug logging
    logger.log('info', 'Episode data received in handlePlayNextEpisode', {
      id: episodeData?.id,
      title: episodeData?.title,
      thumbnail: episodeData?.thumbnail,
      src: episodeData?.src
    });

    // Validate episode data first
    if (!episodeData?.id || !episodeData?.title) {
      const error = createEpisodeError(new Error('Episode data is incomplete'), {
        operation: 'episode_transition',
        episodeId: episodeData?.id,
        episodeTitle: episodeData?.title
      });

      logger.log('error', 'Episode transition failed: incomplete episode data');
      setEpisodeError(error);
      setError(error.userMessage);
      setIsTransitioningEpisode(false);
      return;
    }

    // Update UI immediately for better UX
    setCurrentTitle(episodeData.title);
    setLastTransitionedEpisodeId(episodeData.id);

    if (episodeData.thumbnail) {
      setCurrentPoster(episodeData.thumbnail);
    }

    // Clear previous states
    setIsRetrying(false);
    setIsLoading(true);
    setIsBuffering(true);
    setError(null);
    setEpisodeError(null);

    try {
      // FIND CURRENT AND NEXT EPISODE INFO FIRST
      let currentEpisodeIndex = -1;
      let currentEpisodeInList = null;
      let nextEpisodeMetadata: EpisodeMetadata | null = null;

      if (episodeList.length > 0) {
        // Use ID resolution to find current episode in the list
        const episodeMatchResult = findEpisodeWithIdResolution(
          episodeData.id,
          episodeList,
          {
            seriesId: seriesId,
            seasonNumber: seasonNumber
          }
        );

        if (episodeMatchResult.found && episodeMatchResult.episode && episodeMatchResult.index !== undefined) {
          currentEpisodeInList = episodeMatchResult.episode;
          currentEpisodeIndex = episodeMatchResult.index;

          logger.log('info', 'Found current episode in list using ID resolution', {
            originalId: episodeData.id,
            resolvedId: currentEpisodeInList.id,
            matchType: episodeMatchResult.matchType,
            currentIndex: currentEpisodeIndex,
            totalEpisodes: episodeList.length
          });

          // Find next episode using the CURRENT index (not state)
          const nextEpisodeIndex = getNextEpisodeIndex(currentEpisodeIndex, episodeList.length);

          if (nextEpisodeIndex !== null && nextEpisodeIndex < episodeList.length) {
            const nextEpisodeFromProps = episodeList[nextEpisodeIndex];

            if (nextEpisodeFromProps?.id && nextEpisodeFromProps?.title) {
              nextEpisodeMetadata = mapEpisodeDataToMetadata(
                nextEpisodeFromProps,
                seasonNumber || 1,
                seriesId || `season-${seasonNumber || 1}`
              );

              logger.log('info', 'Next episode found using prop-based navigation', {
                nextTitle: nextEpisodeFromProps.title,
                nextIndex: nextEpisodeIndex,
                nextId: nextEpisodeFromProps.id
              });
            } else {
              logger.log('warn', 'Next episode data validation failed', nextEpisodeFromProps);
            }
          } else {
            logger.log('info', 'No next episode available (end of season/series)', {
              currentIndex: currentEpisodeIndex,
              totalEpisodes: episodeList.length,
              calculatedNextIndex: nextEpisodeIndex
            });
          }
        } else {
          logger.log('warn', 'Current episode not found in episode list even with ID resolution', {
            searchingForId: episodeData.id,
            availableIds: episodeList.map(ep => ep.id),
            idConsistencyCheck: validateEpisodeIdConsistency(
              episodeList,
              episodeData.id,
              { seriesId, seasonNumber }
            )
          });
        }
      }

      // Fallback to metadata service if prop-based navigation failed
      if (!nextEpisodeMetadata) {
        logger.log('info', 'Falling back to metadata service for next episode', {
          reason: currentEpisodeInList ? 'next episode not found in props' : 'current episode not found in props',
          currentEpisodeFound: !!currentEpisodeInList,
          episodeListLength: episodeList.length
        });

        try {
          // Normalize the current episode ID for metadata service compatibility
          const normalizedEpisodeData = normalizeEpisodeMetadataId(
            episodeData,
            episodeList,
            { seriesId, seasonNumber }
          );

          const nextEpisode = await retryWithBackoff(
            () => getNextEpisode(normalizedEpisodeData.id),
            { maxRetries: 1, baseDelay: 500 }
          );

          // If we get next episode from metadata service, try to normalize its ID too
          if (nextEpisode) {
            nextEpisodeMetadata = normalizeEpisodeMetadataId(
              nextEpisode,
              episodeList,
              { seriesId, seasonNumber }
            );

            logger.log('info', 'Next episode loaded from metadata service with ID normalization', {
              originalNextEpisodeId: nextEpisode.id,
              normalizedNextEpisodeId: nextEpisodeMetadata.id,
              nextEpisodeTitle: nextEpisodeMetadata.title
            });
          } else {
            logger.log('info', 'No next episode available from metadata service');
          }
        } catch (nextEpisodeError) {
          logger.log('warn', 'Failed to load next episode from metadata service', {
            error: nextEpisodeError instanceof Error ? nextEpisodeError.message : String(nextEpisodeError)
          });
        }
      } else {
        logger.log('info', 'Using prop-based next episode navigation', {
          nextEpisodeTitle: nextEpisodeMetadata?.title || 'N/A',
          source: 'episode-props'
        });
      }

      // Validate video source - use episode src or default fallback
      const episodeSrc = episodeData.src || 'https://files.vidstack.io/sprite-fight/1080p.mp4';
      const sourceValidation = validateVideoSource(episodeSrc);
      if (!sourceValidation.isValid || !episodeData.src) {
        logger.log('warn', 'Episode video source invalid or missing, using fallback', {
          originalSrc: episodeData.src,
          fallbackSrc: sourceValidation.src,
          hadOriginalSrc: !!episodeData.src
        });
        episodeData.src = sourceValidation.src;
        setFallbackActive(true);
      }

      // Execute the actual episode transition
      await retryWithBackoff(async () => {
        // Preserve current player state
        const preservedPreferences = {
          volume: isMuted ? 0 : volume,
          playbackRate,
          activeCaption,
          audioTrack: currentAudioTrackIndex,
          wasFullscreen: isFullscreen,
          wasTheaterMode: isTheaterMode,
          wasPiP: isPiPActive
        };

        logger.log('info', 'Starting episode transition with preserved preferences', preservedPreferences);

        // Reset states
        setHasVideoEnded(false);

        // Set pending resume state
        setPendingResume({
          time: 0,
          wasPlaying: true,
          wasFullscreen: preservedPreferences.wasFullscreen
        });

        // Update video source
        setCurrentVideoSrc(episodeData.src);

        // Update intro data
        if (typeof episodeData.introStart === 'number' && typeof episodeData.introEnd === 'number') {
          setIntroData({
            start: episodeData.introStart,
            end: episodeData.introEnd
          });
          logger.log('info', 'Intro data updated', {
            start: episodeData.introStart,
            end: episodeData.introEnd
          });
        } else {
          setIntroData(null);
          logger.log('info', 'No valid intro data, disabled intro skip');
        }

        // UPDATE STATES AFTER SUCCESSFUL TRANSITION PREPARATION
        if (currentEpisodeInList && currentEpisodeIndex >= 0) {
          setInternalEpisodeIndex(currentEpisodeIndex);
          setCurrentEpisode(currentEpisodeInList);

          logger.log('info', 'Updated internal episode state', {
            newIndex: currentEpisodeIndex,
            episodeTitle: currentEpisodeInList.title,
            episodeId: currentEpisodeInList.id
          });

          // Set next episode based on what we found
          if (nextEpisodeMetadata) {
            const nextEpisodeIndex = getNextEpisodeIndex(currentEpisodeIndex, episodeList.length);
            if (nextEpisodeIndex !== null && nextEpisodeIndex < episodeList.length) {
              setNextEpisode(episodeList[nextEpisodeIndex]);
              logger.log('info', 'Set next episode from props', {
                nextTitle: episodeList[nextEpisodeIndex].title,
                nextIndex: nextEpisodeIndex
              });
            } else {
              setNextEpisode(null);
              logger.log('info', 'No next episode in props, cleared next episode state');
            }
          } else {
            setNextEpisode(null);
            logger.log('info', 'No next episode metadata, cleared next episode state');
          }
        } else {
          logger.log('warn', 'Could not update internal episode state', {
            currentEpisodeFound: !!currentEpisodeInList,
            currentIndex: currentEpisodeIndex
          });
        }

        // Always set next episode metadata (even if null)
        setNextEpisodeData(nextEpisodeMetadata);

        if (nextEpisodeMetadata) {
          logger.log('info', 'Next episode data set successfully', {
            nextTitle: nextEpisodeMetadata.title,
            nextId: nextEpisodeMetadata.id,
            source: currentEpisodeInList ? 'props' : 'metadata-service'
          });
        } else {
          logger.log('info', 'No next episode data available - this might be the last episode');
        }

        // Notify parent component
        try {
          onEpisodeChange?.(episodeData);
          logger.log('info', 'Parent notified of episode change');
        } catch (callbackError) {
          logger.log('warn', 'Episode change callback failed', { error: callbackError });
        }

        // Restore preferences after transition
        setTimeout(() => {
          try {
            if (playerRef.current) {
              playerRef.current.volume = preservedPreferences.volume;
              setVolume(preservedPreferences.volume > 0 ? preservedPreferences.volume : volume);
              setIsMuted(preservedPreferences.volume === 0);

              playerRef.current.playbackRate = preservedPreferences.playbackRate;
              setPlaybackRate(preservedPreferences.playbackRate);

              if (preservedPreferences.activeCaption !== 'off') {
                handleCaptionChange(preservedPreferences.activeCaption);
              }

              if (preservedPreferences.audioTrack > 0 && audioTracks?.length > preservedPreferences.audioTrack) {
                setCurrentAudioTrackIndex(preservedPreferences.audioTrack);
              }

              setTimeout(() => {
                if (preservedPreferences.wasTheaterMode && !isTheaterMode) {
                  setIsTheaterMode(true);
                }
              }, 500);

              logger.log('info', 'Player preferences restored successfully');
            }
          } catch (restoreError) {
            logger.log('warn', 'Failed to restore player preferences', { error: restoreError });
          }

          setIsTransitioningEpisode(false);
          logger.log('info', 'Episode transition completed successfully');
        }, 1000);

      }, {
        maxRetries: 2,
        baseDelay: 1000,
        backoffMultiplier: 2
      });

    } catch (error) {
      // Enhanced error handling
      const errorHandling = handleEpisodeTransitionError(error, episodeData, {
        operation: 'episode_transition',
        retryCount,
        episodeList: episodeList.length,
        internalEpisodeIndex,
        fallbackActive
      });

      logger.log('error', 'Episode transition failed', {
        error: error instanceof Error ? error.message : String(error),
        shouldRetry: errorHandling.shouldRetry,
        shouldFallback: errorHandling.shouldFallback
      });

      const episodeError = createEpisodeError(error, {
        operation: 'episode_transition',
        episodeId: episodeData.id,
        retryCount
      });

      setEpisodeError(episodeError);
      setError(errorHandling.userMessage);
      setIsLoading(false);
      setIsBuffering(false);
      setIsTransitioningEpisode(false);

      if (errorHandling.shouldFallback && retryCount < 3) {
        setIsRetrying(true);
        setRetryCount(prev => prev + 1);

        setTimeout(() => {
          const fallbackEpisodeData = {
            ...episodeData,
            src: 'https://media.axprod.net/TestVectors/v7-Clear/Manifest_1080p.mpd'
          };
          handlePlayNextEpisode(fallbackEpisodeData);
        }, 3000);
      } else {
        setHasVideoEnded(true);
      }
    }
  }, [
    // Dependencies
    episodeList,
    seasonNumber,
    seriesId,
    mapEpisodeDataToMetadata,
    getNextEpisode,
    getNextEpisodeIndex, // Added missing dependency
    onEpisodeChange,
    volume,
    isMuted,
    playbackRate,
    activeCaption,
    isFullscreen,
    isTheaterMode,
    isPiPActive,
    currentAudioTrackIndex,
    audioTracks,
    handleCaptionChange,
    retryCount,
    fallbackActive,
    validateVideoSource, // Added missing dependency
    createEpisodeError,  // Added missing dependency
    handleEpisodeTransitionError // Added missing dependency
  ]);



  // Add this useEffect to detect connection speed
  useEffect(() => {
    const detectConnectionSpeed = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

      if (connection) {
        const effectiveType = connection.effectiveType;

        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          setConnectionSpeed('slow');
        } else if (effectiveType === '3g') {
          setConnectionSpeed('medium');
        } else {
          setConnectionSpeed('fast');
        }
      }
    };

    detectConnectionSpeed();

    // Listen for connection changes
    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', detectConnectionSpeed);
      return () => (navigator as any).connection.removeEventListener('change', detectConnectionSpeed);
    }
  }, []);



  useEffect(() => {
    if (!playerRef.current) return;

    const player = playerRef.current;

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handleStalled = () => {
      setIsBuffering(true);
    };

    // Use canplaythrough instead of canplay - it waits for enough data
    const handleCanPlayThrough = () => {
      // Still don't hide immediately - wait for actual playback
    };

    const handlePlaying = () => {

      // Adjust delay based on connection speed
      const getDelay = () => {
        switch (connectionSpeed) {
          case 'slow': return 3000;   // 3 seconds for slow connections
          case 'medium': return 2000; // 2 seconds for medium
          case 'fast': return 1000;   // 1 second for fast
          default: return 1500;
        }
      };

      setTimeout(() => {
        setIsBuffering(false);
      }, getDelay());
    };

    const handleLoadStart = () => {
      setIsBuffering(true);
    };

    // Add these events
    player.addEventListener('waiting', handleWaiting);
    player.addEventListener('stalled', handleStalled);
    player.addEventListener('loadstart', handleLoadStart);
    player.addEventListener('canplaythrough', handleCanPlayThrough);
    player.addEventListener('playing', handlePlaying);

    return () => {
      player.removeEventListener('waiting', handleWaiting);
      player.removeEventListener('stalled', handleStalled);
      player.removeEventListener('loadstart', handleLoadStart);
      player.removeEventListener('canplaythrough', handleCanPlayThrough);
      player.removeEventListener('playing', handlePlaying);
    };
  }, []);



  // Handle video ended event for next episode auto-play (fallback)
  useEffect(() => {
    if (!playerRef.current) return;

    const player = playerRef.current;

    const handleVideoEnded = () => {
      setHasVideoEnded(true);

      try {
        if (contentType === 'episode' && !nextEpisodeData) {
        } else {
        }
      } catch (error) {
        console.error('🎬 Error handling video end:', error);
      }
    };

    const handleVideoError = (event: Event) => {
      console.error('🎬 Video error during playback:', event);

      // Provide more specific error messages based on error type
      let errorMessage = 'Video playback error occurred';

      try {
        const target = event.target as HTMLVideoElement;
        if (target && target.error) {
          switch (target.error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMessage = 'Video playback was aborted';
              break;
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage = 'Network error occurred while loading video';
              break;
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage = 'Video format not supported or corrupted';
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = 'Video source not supported';
              break;
            default:
              errorMessage = 'Unknown video playback error';
          }
          console.error('🎬 Video error details:', {
            code: target.error.code,
            message: target.error.message
          });
        }
      } catch (errorParsingError) {
        console.warn('🎬 Could not parse video error details:', errorParsingError);
      }

      setError(errorMessage);
      setIsLoading(false);
      setIsBuffering(false);

      // Reset states on error
      setHasVideoEnded(false);
    };

    player.addEventListener('ended', handleVideoEnded);
    player.addEventListener('error', handleVideoError);

    return () => {
      player.removeEventListener('ended', handleVideoEnded);
      player.removeEventListener('error', handleVideoError);
    };
  }, [contentType, nextEpisodeData]);

  useEffect(() => {
    if (!isPlaying || !playerRef.current) return;

    let previousTime = currentTime;
    let stuckCount = 0;
    let playingConfirmed = false;

    const progressTimer = setInterval(() => {
      const video = playerRef.current;
      if (!video) return;

      const currentVideoTime = video.currentTime;

      // Check if video is actually progressing
      if (currentVideoTime > previousTime + 0.1) { // At least 100ms progress
        stuckCount = 0;
        if (!playingConfirmed) {
          playingConfirmed = true;
          setIsBuffering(false);
        }
      } else if (isPlaying) {
        // Video should be playing but isn't progressing
        stuckCount++;

        if (stuckCount >= 2) { // After 2 seconds of no progress
          setIsBuffering(true);
          stuckCount = 0; // Reset to avoid spam
        }
      }

      previousTime = currentVideoTime;
    }, 1000);

    return () => clearInterval(progressTimer);
  }, [isPlaying, currentTime]);
  useEffect(() => {
    if (!playerRef.current || !isPlaying || !buffered) return;

    const checkBufferHealth = () => {
      if (!buffered.length) return;

      const currentVideoTime = currentTime || 0;
      const bufferedEnd = buffered.end(buffered.length - 1);
      const bufferAhead = bufferedEnd - currentVideoTime;


      // Show buffering if buffer is critically low
      if (bufferAhead < 2 && isPlaying) {
        setIsBuffering(true);
      } else if (bufferAhead > 5) {
        // Good buffer - can hide buffering
        setIsBuffering(false);
      }
    };

    const bufferInterval = setInterval(checkBufferHealth, 2000);
    return () => clearInterval(bufferInterval);
  }, [isPlaying, buffered, currentTime]);
  useEffect(() => {
    if (!isPlaying || !playerRef.current) return;

    let progressCheckCount = 0;
    let lastTime = currentTime;

    const progressInterval = setInterval(() => {
      const currentVideoTime = playerRef.current?.currentTime || 0;

      // Check if video time is actually progressing
      if (currentVideoTime > lastTime) {
        progressCheckCount++;

        // After 3 successful progress checks, clear buffering
        if (progressCheckCount >= 3) {
          setIsBuffering(false);

          clearInterval(progressInterval);
        }
      } else {
        progressCheckCount = 0; // Reset if no progress
      }

      lastTime = currentVideoTime;
    }, 300); // Check every 300ms

    return () => clearInterval(progressInterval);
  }, [isPlaying, currentTime]);

  const {
    qualities,
    quality: currentQuality,
    autoQuality,
    canSetQuality
  } = useMediaStore(playerRef);


  // State for UI
  const [availableQualities, setAvailableQualities] = useState<QualityOption[]>([]);
  const [selectedQualityValue, setSelectedQualityValue] = useState('auto');
  const [isQualityChanging, setIsQualityChanging] = useState(false);

  // Convert Vidstack qualities to your UI format
  useEffect(() => {
    if (!qualities || qualities.length === 0) {
      setAvailableQualities([]);
      return;
    }

    const qualityOptions: QualityOption[] = [
      {
        value: 'auto',
        label: 'Auto',
        src: '', // Empty src for auto quality
      }
    ];

    // Convert VideoQuality objects to your format
    qualities.forEach((quality: VideoQuality, index: number) => {
      const label = `${quality.height}p`;
      qualityOptions.push({
        value: index.toString(),
        label: label,
        src: '', // Empty src as DASH qualities don't have individual sources
        width: quality.width,
        height: quality.height,
        bitrate: quality.bitrate || 0, // Handle null bitrate
      });
    });

    // Sort by height (quality) descending
    const sortedQualities = qualityOptions.slice(1).sort((a, b) => (b.height || 0) - (a.height || 0));
    setAvailableQualities([qualityOptions[0], ...sortedQualities]);

  }, [qualities]);

  // Update selected quality when current quality changes
  useEffect(() => {
    if (autoQuality) {
      setSelectedQualityValue('auto');
    } else if (currentQuality && qualities) {
      const qualityIndex = qualities.findIndex((q: VideoQuality) => q.selected);
      if (qualityIndex !== -1) {
        setSelectedQualityValue(qualityIndex.toString());
      }
    }
  }, [currentQuality, autoQuality, qualities]);


  const handleQualityChange = useCallback((qualityValue: string) => {
    if (!playerRef.current || !canSetQuality) {
      return;
    }

    setIsQualityChanging(true);
    setIsBuffering(true); // Show buffering immediately

    try {
      if (qualityValue === 'auto') {
        playerRef.current.qualities.autoSelect();
        setSelectedQualityValue('auto');
      } else {
        const qualityIndex = parseInt(qualityValue);
        const targetQuality = playerRef.current.qualities[qualityIndex];
        if (targetQuality) {
          targetQuality.selected = true;
          setSelectedQualityValue(qualityValue);
        }
      }
    } catch (error) {
      console.error('Quality change failed:', error);
      setIsQualityChanging(false);
      setIsBuffering(false);
    }

    // Failsafe - force hide after 10 seconds
    setTimeout(() => {
      setIsQualityChanging(false);
      setIsBuffering(false);
    }, 10000);
  }, [canSetQuality]);

  // Listen to quality change events

  useEffect(() => {
    if (!playerRef.current) return;

    const player = playerRef.current;

    const handleQualityChangeEvent = () => {

      // Don't immediately clear - verify the change is complete
      let verificationAttempts = 0;
      const maxAttempts = 10;

      const verifyQualityChange = () => {
        verificationAttempts++;

        // Check if quality change is complete (simplified check)
        if (player.state.canPlay) {
          setIsQualityChanging(false);
        } else if (verificationAttempts < maxAttempts) {
          setTimeout(verifyQualityChange, 500);
        } else {
          setIsQualityChanging(false);
        }
      };

      setTimeout(verifyQualityChange, 1000);
    };

    if (player.qualities) {
      player.qualities.addEventListener('change', handleQualityChangeEvent);
      return () => {
        player.qualities.removeEventListener('change', handleQualityChangeEvent);
      };
    }
  }, []);



  // Get current quality label for display
  const getCurrentQualityLabel = useCallback(() => {
    if (autoQuality) return 'Auto';

    if (currentQuality) {
      return `${currentQuality.height}p`;
    }

    return 'Auto';
  }, [currentQuality, autoQuality]);

  const audioTracksForControls = useMemo(() => {
    if (!audioTracks) return [];
    return Array.from(audioTracks).map((track) => ({
      id: track.id,
      label: track.label,
      language: track.language,
      kind: track.kind,
      selected: track.selected,
      src: '', // dummy property to satisfy AudioSource type
    }));
  }, [audioTracks]);

  const currentAudioLanguage = useMemo(() => {
    if (audioTracks && audioTracks[currentAudioTrackIndex]) {
      return audioTracks[currentAudioTrackIndex].language;
    }
    return '';
  }, [audioTracks, currentAudioTrackIndex]);

  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fullscreenTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const qualityChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Add this useEffect to clear buffering when video starts playing
  useEffect(() => {
    if (isPlaying) {
      // Small delay to ensure video is actually playing smoothly
      const timeout = setTimeout(() => {
        setIsBuffering(false);

        // Don't clear isQualityChanging here - let the quality events handle it
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [isPlaying]);

  // Auto-hide controls logic
  const resetControlsTimeout = useCallback(() => {
    // Clear existing timeout
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }

    // Show controls immediately
    setShowControls(true);
    setLastActivity(Date.now());

    // Only set timeout to hide if video is playing
    if (isPlaying) {
      const hideDelay = isFullscreen ? 4000 : 3000;
      activityTimeoutRef.current = setTimeout(() => {
        // Double check video is still playing before hiding
        if (isPlaying) {
          setShowControls(false);
        }
      }, hideDelay);
    }
  }, [isPlaying, isFullscreen]);

  // Handle user activity
  const handleUserActivity = useCallback(() => {
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const handlePlayerAudioTrackChange = useCallback((track: AudioTrack | null) => {
    if (track && playerRef.current) {
      const tracks = playerRef.current.audioTracks;
      for (let i = 0; i < tracks.length; i++) {
        if (tracks[i] === track) {
          setCurrentAudioTrackIndex(i);
          return;
        }
      }
    }
  }, []);

  const handleAudioTrackChange = (language: string) => {
    if (playerRef.current && playerRef.current.audioTracks && audioTracks) {
      const trackIndex = Array.from(audioTracks).findIndex(t => t.language === language);
      if (trackIndex > -1) {
        const track = playerRef.current.audioTracks[trackIndex];
        if (track) {
          track.selected = true;
        }
      }
    }
  };

  // Check PiP support
  useEffect(() => {
    setIsPiPSupported('pictureInPictureEnabled' in document);
  }, []);

  // Update PiP state based on Vidstack's state
  useEffect(() => {
    setIsPiPActive(pictureInPicture || false);
  }, [pictureInPicture]);

  // Update loading state based on canPlay
  useEffect(() => {
    setIsLoading(!canPlay);
  }, [canPlay]);

  // Auto-hide controls when playing state changes
  useEffect(() => {
    if (isPlaying) {
      // Video started playing, start the auto-hide timer
      resetControlsTimeout();
    } else {
      // Video paused/stopped, show controls and clear timeout
      setShowControls(true);
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
    }
  }, [isPlaying, resetControlsTimeout]);

  // Show controls when entering fullscreen
  useEffect(() => {
    if (isFullscreen) {
      resetControlsTimeout();
    }
  }, [isFullscreen, resetControlsTimeout]);

  // Set up activity listeners
  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'click'];

    events.forEach(event => {
      document.addEventListener(event, handleUserActivity);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
    };
  }, [handleUserActivity]);

  // Comprehensive cleanup on component unmount
  useEffect(() => {
    return () => {
      // Clear all timeouts
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
      if (fullscreenTimeoutRef.current) {
        clearTimeout(fullscreenTimeoutRef.current);
      }
      if (qualityChangeTimeoutRef.current) {
        clearTimeout(qualityChangeTimeoutRef.current);
      }

      // Clean up player event listeners
      if (playerRef.current) {
        const player = playerRef.current;

        // Remove all custom event listeners
        const events = ['ended', 'waiting', 'stalled', 'loadstart', 'canplaythrough', 'playing', 'loadedmetadata', 'texttrackchange'];
        events.forEach(eventType => {
          // Note: We can't remove specific handlers without references, 
          // but Vidstack will handle cleanup when the component unmounts
        });
      }

    };
  }, []);

  useEffect(() => {
    onPlayingChange?.(isPlaying);
  }, [isPlaying, onPlayingChange]);

  useEffect(() => {
    if (currentTime !== undefined && duration !== undefined) {
      onTimeUpdate?.(currentTime, duration);
    }
  }, [currentTime, duration, onTimeUpdate]);



  // SINGLE handleFullscreenChange function
  const handleFullscreenChange = (isFullscreenActive: boolean) => {

    // Show controls when entering fullscreen
    if (isFullscreenActive) {
      setShowControls(true);
      setLastActivity(Date.now());
    }

    // Only update flags if we're not in the middle of a quality change
    if (!isQualityChanging) {
      if (isFullscreenActive) {
        setFullscreenBeforeQualityChange(true);
        setShouldMaintainFullscreen(true);
      } else {
        // Only clear flags if we're not supposed to maintain fullscreen
        if (!shouldMaintainFullscreen) {
          setFullscreenBeforeQualityChange(false);
        }
      }
    }
  };

  // Enhanced keyboard shortcuts with audio track switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!playerRef.current) return;

      const activeElement = document.activeElement;
      const isVideoFocused = activeElement?.tagName === 'VIDEO' ||
        activeElement?.closest('[data-media-player]');

      if (!isVideoFocused) return;

      // Prevent handling during transitions
      if (isFullscreenTransitioning) return;

      // Show controls on any key press in fullscreen
      if (isFullscreen) {
        setShowControls(true);
        setLastActivity(Date.now());
      }

      const player = playerRef.current;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (isPlaying) {
            player.pause();
          } else {
            player.play();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          player.currentTime = Math.max(0, currentTime - 10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          player.currentTime = Math.min(duration, currentTime + 10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(prev => Math.min(1, prev + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(prev => Math.max(0, prev - 0.1));
          break;
        case 'KeyM':
          e.preventDefault();
          setIsMuted(prev => !prev);
          break;
        case 'KeyF':
          e.preventDefault();
          handleFullscreenToggle();
          break;
        case 'KeyT':
          e.preventDefault();
          setIsTheaterMode(prev => !prev);
          break;
        case 'KeyC':
          e.preventDefault();
          if (activeCaption === 'off' && captionsForUI.length > 0 && captionsForUI[0].language) {
            handleCaptionChange(captionsForUI[0].language);
          } else {
            handleCaptionChange('off');
          }
          break;
        case 'KeyA':
          e.preventDefault();
          // Cycle through audio tracks
          if (audioTracks && audioTracks.length > 1) {
            const nextIndex = (currentAudioTrackIndex + 1) % audioTracks.length;
            const nextTrack = audioTracks[nextIndex];
            if (nextTrack) {
              handleAudioTrackChange(nextTrack.language);
            }
          }
          break;
        case 'Slash':
          if (e.shiftKey) {
            e.preventDefault();
            setShowShortcuts(prev => !prev);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowShortcuts(false);
          break;
        case 'KeyS':
          // Skip intro shortcut (only when intro is active)
          if (introData && isInIntroRange(currentTime || 0)) {
            e.preventDefault();
            handleSkipIntro();
          }
          break;

      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentTime, duration, isFullscreen, activeCaption, isFullscreenTransitioning, audioTracks]);

  // Update volume when changed
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Update playback rate when changed
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const handleLoadStart = () => {
    setIsLoading(true);
    setError(null);
  };

  // Helper function to get video element from container
  const getVideoElement = (): HTMLVideoElement | null => {
    if (!containerRef.current) return null;
    return containerRef.current.querySelector('video');
  };

  // Apply consistent video styling
  const applyVideoStyles = (forceFullscreen = false) => {
    const video = getVideoElement();
    if (!video) return;

    if ((isFullscreen || forceFullscreen) && !isFullscreenTransitioning) {
      // Fullscreen styles
      Object.assign(video.style, {
        width: '100vw',
        height: '100vh',
        objectFit: 'contain',
        position: 'absolute',
        top: '0',
        left: '0',
        zIndex: 'auto',
        maxWidth: 'none',
        maxHeight: 'none',
      });
    } else {
      // Normal view styles
      Object.assign(video.style, {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        position: 'relative',
        top: 'auto',
        left: 'auto',
        zIndex: 'auto',
        maxWidth: '100%',
        maxHeight: '100%',
      });
    }
  };

  // Enhanced fullscreen exit handler
  const handleFullscreenExit = useCallback(() => {

    setIsFullscreenTransitioning(true);

    // Force normal styles immediately
    const video = getVideoElement();
    if (video) {
      Object.assign(video.style, {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        position: 'relative',
        top: 'auto',
        left: 'auto',
        zIndex: 'auto',
        maxWidth: '100%',
        maxHeight: '100%',
      });
    }

    // Clear fullscreen flags
    setShouldMaintainFullscreen(false);
    setFullscreenBeforeQualityChange(false);

    setTimeout(() => {
      setIsFullscreenTransitioning(false);
      applyVideoStyles(); // Reapply normal styles
    }, 100);
  }, []);

  // Monitor video element changes and apply styles
  useEffect(() => {
    const video = getVideoElement();
    if (!video) return;

    // Apply initial styles
    applyVideoStyles();

    // Create observer to watch for video element changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
          // Video source changed, reapply styles
          setTimeout(() => applyVideoStyles(), 100);
        }
      });
    });

    observer.observe(video, {
      attributes: true,
      attributeFilter: ['src']
    });

    return () => observer.disconnect();
  }, [isFullscreen, currentVideoSrc]);

  // Enhanced fullscreen state monitoring
  useEffect(() => {
    if (!isFullscreen && !isFullscreenTransitioning) {
      // Exited fullscreen, ensure normal styles
      handleFullscreenExit();
    }
  }, [isFullscreen, isFullscreenTransitioning, handleFullscreenExit]);


  const handleError = (err: any) => {
    setIsLoading(false);
    setIsQualityChanging(false);
    setError('Failed to load video. Please check the URL and try again.');
    console.error('Video error:', err);
  };

  // YouTube provider configuration for optimal trailer playback
  const handleProviderChange = useCallback((provider: MediaProviderAdapter | null) => {
    if (isYouTubeProvider(provider)) {
      // Configure YouTube provider for better performance and GDPR compliance
      provider.cookies = false; // GDPR-compliant by default
    }
  }, []);

  const handleSeek = (time: number) => {
    if (playerRef.current) {
      playerRef.current.currentTime = time;
    }
  };

  const handleSkip = (seconds: number) => {
    if (playerRef.current) {
      const newTime = Math.max(0, Math.min(duration || 0, (currentTime || 0) + seconds));
      playerRef.current.currentTime = newTime;
    }
  };

  const togglePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
    }
  };

  const toggleTheaterMode = () => {
    setIsTheaterMode(prev => !prev);
  };

  const togglePictureInPicture = async () => {
    if (!isPiPSupported || !playerRef.current) return;

    try {
      if (pictureInPicture) {
        await playerRef.current.exitPictureInPicture();
      } else {
        await playerRef.current.enterPictureInPicture();
      }
    } catch (error) {
      console.error('PiP error:', error);
    }
  };

  // Simplified fullscreen toggle with consistent styling
  const handleFullscreenToggle = async () => {
    if (!playerRef.current) return;

    try {

      if (isFullscreen) {
        await playerRef.current.exitFullscreen();
        setShouldMaintainFullscreen(false);
        setFullscreenBeforeQualityChange(false);
      } else {
        await playerRef.current.enterFullscreen();
        setShouldMaintainFullscreen(true);
        setFullscreenBeforeQualityChange(true);
      }

      // Apply styles after a short delay
      setTimeout(() => applyVideoStyles(), 100);

    } catch (error) {
      console.error('Fullscreen error:', error);
      setShouldMaintainFullscreen(false);
    }
  };

  const toggleFullscreen = handleFullscreenToggle;

  // Enhanced quality change with audio track consideration


  const containerClasses = cn(
    'relative w-full bg-black rounded-lg overflow-hidden shadow-2xl transition-all duration-300',
    isTheaterMode && 'max-w-none mx-auto',
    !isTheaterMode && 'max-w-4xl mx-auto',
    // Responsive container sizing
    'max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl',
    className
  );

  const playerClasses = cn(
    'w-full bg-black transition-all duration-300',
    !isFullscreen && (isTheaterMode ? 'aspect-[21/9]' : 'aspect-video'),
    isFullscreen && 'fixed inset-0 z-50 h-screen w-screen',
    // Responsive video scaling
    '[&_video]:w-full [&_video]:h-full [&_video]:object-contain',
    '[&_video]:max-h-[60vh] sm:[&_video]:max-h-[70vh] md:[&_video]:max-h-[80vh] lg:[&_video]:max-h-[90vh]',
    isFullscreen && '[&_video]:max-h-screen'
  );


  // STEP 2: Add this function to force disable captions
  const disableAllCaptions = () => {
    if (!playerRef.current) return;

    try {
      const player = playerRef.current;

      if (player.textTracks) {
        let disabledCount = 0;
        for (let i = 0; i < player.textTracks.length; i++) {
          const track = player.textTracks[i];
          if (track && track.mode === 'showing') {
            track.mode = 'disabled';
            disabledCount++;
          }
        }

        if (disabledCount > 0) {
          setActiveCaption('off');
          setCaptionsEnabled(false);
        }
      }
    } catch (error) {
      console.error('[CAPTIONS] Error disabling captions:', error);
    }
  };

  // STEP 3: Replace your existing handleCanPlay method
  const handleCanPlay = async () => {
    setIsLoading(false);
    setIsQualityChanging(false);

    // Apply styles immediately when video is ready
    applyVideoStyles();

    // IMPORTANT: Disable auto-enabled captions
    setTimeout(() => {
      disableAllCaptions();
    }, 100);

    if (pendingResume && playerRef.current) {
      const { time, wasPlaying, wasFullscreen } = pendingResume;


      // Wait for video to be ready
      await new Promise(resolve => setTimeout(resolve, 300));

      try {
        // Restore time first
        if (time > 0) {
          playerRef.current.currentTime = time;
        }

        // Handle fullscreen restoration
        if (wasFullscreen && !isFullscreen) {
          setIsFullscreenTransitioning(true);

          // Wait for time to be set
          await new Promise(resolve => setTimeout(resolve, 200));

          // Enter fullscreen
          await playerRef.current.enterFullscreen();

          // Apply fullscreen styles after entering
          const applyFullscreenStyles = () => {
            applyVideoStyles(true);
          };

          setTimeout(applyFullscreenStyles, 100);
          setTimeout(applyFullscreenStyles, 300);
          setTimeout(() => setIsFullscreenTransitioning(false), 500);
        } else {
          setIsFullscreenTransitioning(false);
          setTimeout(() => applyVideoStyles(), 100);
        }

        // Restore playback state
        if (wasPlaying) {
          await new Promise(resolve => setTimeout(resolve, 100));
          await playerRef.current.play();
        }

      } catch (error) {
        console.error('Error restoring state:', error);
        setIsFullscreenTransitioning(false);
        setShouldMaintainFullscreen(false);
        setFullscreenBeforeQualityChange(false);
      }

      setPendingResume(null);
    }
  };

  // STEP 4: Add this useEffect for event-based caption control
  useEffect(() => {
    if (!playerRef.current) return;

    const player = playerRef.current;

    const handleLoadedMetadata = () => {
      setTimeout(() => {
        disableAllCaptions();
      }, 100);
    };

    const handleTextTrackChange = () => {
      // Only auto-disable if user hasn't explicitly selected a caption
      if (activeCaption === 'off') {
        setTimeout(() => {
          disableAllCaptions();
        }, 50);
      }
    };

    // Add event listeners
    player.addEventListener('loadedmetadata', handleLoadedMetadata);
    player.addEventListener('texttrackchange', handleTextTrackChange);

    return () => {
      player.removeEventListener('loadedmetadata', handleLoadedMetadata);
      player.removeEventListener('texttrackchange', handleTextTrackChange);
    };
  }, [activeCaption]);

  // STEP 5: Add this useEffect for multiple disable attempts
  useEffect(() => {
    if (canPlay && activeCaption === 'off') {
      // Multiple attempts to ensure captions stay disabled
      const timeouts = [200, 500, 1000].map(delay =>
        setTimeout(() => {
          disableAllCaptions();
        }, delay)
      );

      return () => timeouts.forEach(clearTimeout);
    }
  }, [canPlay, activeCaption]);

  // STEP 6: Update your captionsForUI to prevent defaults
  const captionsForUI = useMemo(() => {
    if (!textTracks) return [];

    const seenLanguages = new Set();
    const uniqueTracks = Array.from(textTracks).filter(track => {
      if (!track.language || seenLanguages.has(track.language)) {
        return false;
      } else {
        seenLanguages.add(track.language);
        return true;
      }
    });

    return uniqueTracks.map((track) => ({
      value: track.language, // Add required value property
      src: '',
      label: track.label,
      language: track.language,
      kind: track.kind,
      type: 'vtt',
      default: false, // Force no defaults
    }));
  }, [textTracks]);

  const BufferingIndicator = () => {
    const shouldShow = isQualityChanging || isBuffering;
    const [dots, setDots] = useState('');

    // Animated dots effect
    useEffect(() => {
      if (!shouldShow) return;

      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);

      return () => clearInterval(interval);
    }, [shouldShow]);

    if (!shouldShow) return null;

    const getMessage = () => {
      if (isQualityChanging && isBuffering) return 'Switching Quality';
      if (isQualityChanging) return 'Changing Quality';
      if (connectionSpeed === 'slow') return 'Buffering (Slow Connection)';
      return 'Buffering';
    };

    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-40">
        <div className="flex flex-col items-center space-y-4">
          <div className="vds-buffering-indicator">
            <Spinner.Root className="vds-buffering-spinner w-12 h-12">
              <Spinner.Track className="vds-buffering-track" />
              <Spinner.TrackFill className="vds-buffering-track-fill" />
            </Spinner.Root>
          </div>
          <div className="text-white text-sm font-medium min-w-[120px] text-center">
            {getMessage()}{dots}
          </div>
          {/* Buffer info using Vidstack's buffered state */}
          {buffered && buffered.length > 0 && (
            <div className="text-white text-xs opacity-50">
              Loading: {((buffered.end(buffered.length - 1) - (currentTime || 0))).toFixed(1)}%
            </div>
          )}
        </div>
      </div>
    );
  };

  // Debug logging export functionality (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const logger = EpisodeNavigationLogger.getInstance();

      // Add global debug functions for development
      (window as any).exportEpisodeNavigationLogs = () => {
        const logs = logger.exportLogs();
        const blob = new Blob([logs], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `episode-navigation-logs-${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };

      (window as any).clearEpisodeNavigationLogs = () => {
        logger.clearLogs();
      };

      (window as any).getEpisodeNavigationState = () => {
        return {
          currentEpisode: currentEpisode?.title,
          episodeList: episodeList.length,
          internalEpisodeIndex,
          nextEpisode: nextEpisode?.title,
          error: error,
          episodeError: episodeError?.message,
          retryCount,
          fallbackActive,
          isRetrying
        };
      };

       }
  }, [currentEpisode, episodeList.length, internalEpisodeIndex, nextEpisode, error, episodeError, retryCount, fallbackActive, isRetrying]);

  return (
    <div className={containerClasses} ref={containerRef}>
      {/* Theater Mode Backdrop */}
      {isTheaterMode && !isFullscreen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-10 pointer-events-none" />
      )}

      <div className="  z-20">
        <MediaPlayer
          ref={playerRef}
          src={currentVideoSrc}
          poster={currentPoster}
          title={title}
          className={playerClasses}
          autoPlay={autoPlay}
          logLevel={vidstackLogLevel}
          onLoadStart={handleLoadStart}
          onCanPlay={handleCanPlay}
          onError={handleError}
          tabIndex={0}
          data-media-player
          onFullscreenChange={handleFullscreenChange}
          onAudioTrackChange={handlePlayerAudioTrackChange}
          onProviderChange={handleProviderChange}
          crossOrigin="anonymous"

        >
          <MediaProvider>
            {/* Captions are now automatically discovered from the manifest */}

          </MediaProvider>

          <Captions className="vds-captions" />
          <BufferingIndicator />

          {/* Netflix-like Features with Enhanced Integration */}
          {/* Skip Intro Button - positioned to avoid control conflicts */}
          {introData && isIntroSkipAvailable() && (
            <SkipIntroButton
              currentTime={currentTime || 0}
              introStart={introData?.start || 0}
              introEnd={introData?.end || 30}
              onSkipIntro={handleSkipIntro}
              className={cn(
                // Dynamic z-index based on player state
                isFullscreen && 'z-[9999]',
                isPiPActive && 'z-[9998]',
                isTheaterMode && 'z-[100]',
                // Adjust positioning when controls are visible (positioned above skip intro)
                controlsVisible && !isFullscreen && 'bottom-32 sm:bottom-28',
                !controlsVisible && 'bottom-16',
                // Ensure proper positioning in different modes
                isFullscreen && 'bottom-36 right-8',
                isPiPActive && 'hidden', // Hide in PiP mode
                isTheaterMode && 'bottom-28 right-6'
              )}
              style={{
                zIndex: overlayZIndex + 1
              }}
            />
          )}

          {/* Next Episode Button - shows 2 minutes before episode ends */}
          {(() => {
            // Only show for episodes
            if (contentType !== 'episode' || !duration) return null;

            // Calculate next episode data with proper null checking
            const getNextEpisodeForButton = (): EpisodeMetadata | null => {
              // First try to use nextEpisodeData from state
              if (nextEpisodeData) {
                return nextEpisodeData;
              }

              // Fallback to episodes array if available
              if (episodes && episodes.length > 1 && currentEpisodeIndex !== undefined && currentEpisodeIndex < episodes.length - 1) {
                const nextEp = episodes[currentEpisodeIndex + 1];
                if (nextEp?.id && nextEp?.title) {
                  return {
                    id: nextEp.id,
                    title: nextEp.title,
                    description: nextEp.description || '',
                    thumbnail: nextEp.thumbnail || '',
                    src: nextEp.src || 'https://files.vidstack.io/sprite-fight/1080p.mp4',
                    introStart: 0,
                    introEnd: 30,
                    duration: nextEp.duration || 2700,
                    seriesId: seriesId || 'series-1',
                    seasonNumber: seasonNumber || 1,
                    episodeNumber: nextEp.episodeNumber
                  };
                }
              }

              return null;
            };

            const nextEpisodeForButton = getNextEpisodeForButton();

            // Only render if we have valid next episode data
            if (!nextEpisodeForButton) return null;

            return (
              <NextEpisodeButton
                currentTime={currentTime || 0}
                duration={duration}
                nextEpisode={nextEpisodeForButton}
                onPlayNext={handlePlayNextEpisode}
                triggerTime={nextEpisodeTriggerTime}
                className={cn(
                  // Dynamic z-index based on player state
                  isFullscreen && 'z-[9999]',
                  isPiPActive && 'z-[9998]',
                  isTheaterMode && 'z-[100]',
                  // Adjust positioning when controls are visible (positioned above skip intro)
                  controlsVisible && !isFullscreen && 'bottom-32 sm:bottom-28',
                  !controlsVisible && 'bottom-16',
                  // Ensure proper positioning in different modes
                  isFullscreen && 'bottom-36 right-8',
                  isPiPActive && 'hidden', // Hide in PiP mode
                  isTheaterMode && 'bottom-28 right-6'
                )}
                style={{
                  zIndex: overlayZIndex + 1
                }}
              />
            );
          })()}



          {/* Error State */}
          {error && (
            <VideoPlayerOverlay
              type="error"
              title="Playback Error"
              message={error}
              onRetry={() => {
                setError(null);
                setIsLoading(true);
                if (playerRef.current) {
                  // Use the correct method to reload the video
                  setCurrentVideoSrc(currentVideoSrc + '?reload=' + Date.now());
                }
              }}
            />
          )}

          {/* Loading State */}
          {(isLoading) && !error && !isBuffering && (
            <VideoPlayerOverlay
              type="loading"
              title={(isQualityChanging ? "Changing Quality" : "Loading")}
              message={(isQualityChanging ? "Please wait..." : "Loading video...")}
            />
          )}

          {/* Enhanced Controls with Audio Track Support */}
          <VideoPlayerControls
            isPlaying={isPlaying || false}
            currentTime={currentTime || 0}
            duration={duration || 0}
            volume={volume}
            isMuted={isMuted}
            movieInfo={movieInfo}
            quality={getCurrentQualityLabel()}
            availableQualities={availableQualities}
            playbackRate={playbackRate}
            captionsEnabled={captionsEnabled}
            activeCaption={activeCaption}
            availableCaptions={captionsForUI}
            isTheaterMode={isTheaterMode}
            isPiPSupported={isPiPSupported}
            isPiPActive={isPiPActive}
            isFullscreen={isFullscreen}
            currentAudioTrack={currentAudioLanguage}
            availableAudioTracks={audioTracksForControls}
            showControls={showControls}
            onPlayPause={togglePlayPause}
            onSeek={handleSeek}
            onSkip={handleSkip}
            onVolumeChange={setVolume}
            onMuteToggle={() => setIsMuted(prev => !prev)}
            onQualityChange={handleQualityChange}
            onPlaybackRateChange={setPlaybackRate}
            onCaptionChange={handleCaptionChange}
            onAudioTrackChange={handleAudioTrackChange}
            onTheaterModeToggle={toggleTheaterMode}
            onPictureInPictureToggle={togglePictureInPicture}
            onFullscreenToggle={toggleFullscreen}
            onShowShortcuts={() => setShowShortcuts(true)}
            thumbnailsUrl={thumbnailpreview}
            isQualityChanging={isQualityChanging}
            canSetQuality={canSetQuality}
            selectedQualityValue={selectedQualityValue}
            isAutoQuality={autoQuality}
            // Episode info for title display
            contentType={contentType}
            seriesName={displaySeriesName}
            seasonNumber={seasonNumber}
            episodeNumber={currentEpisodeIndex !== undefined ? currentEpisodeIndex + 1 : undefined}
            episodeTitle={currentEpisode?.title}
          />
        </MediaPlayer>

        {/* Keyboard Shortcuts Modal */}
        <KeyboardShortcuts
          open={showShortcuts}
          onOpenChange={setShowShortcuts}
        />
      </div>
    </div>
  );
}

export function VideoPlayer(props: VideoPlayerProps) {
  return <VideoPlayerContent {...props} />;
}

// Export types for external use
export type { EpisodeMetadata, MovieMetadata } from '@/lib/episode-metadata';

