/**
 * Video Player TypeScript Type Definitions
 * Comprehensive type definitions for Netflix-like video player features
 */

import { EpisodeMetadata, MovieMetadata } from '@/lib/episode-metadata';
import { type Episode } from './index';

// ===== CORE VIDEO PLAYER TYPES =====

/**
 * Video quality option interface
 */
export interface VideoQuality {
  value: string;
  label: string;
  width?: number;
  height?: number;
  bitrate?: number;
}

/**
 * Video source configuration
 */
export interface VideoSource {
  src: string;
  type?: string;
  quality?: VideoQuality;
}

/**
 * Caption/subtitle track interface
 */
export interface CaptionTrack {
  src: string;
  label: string;
  language: string;
  kind: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';
  type: 'vtt' | 'srt';
  default?: boolean;
}

/**
 * Audio track interface
 */
export interface AudioTrack {
  id: string;
  label: string;
  language: string;
  kind: string;
  default?: boolean;
}

/**
 * Video player state interface
 */
export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  isTheaterMode: boolean;
  isPictureInPicture: boolean;
  playbackRate: number;
  isLoading: boolean;
  isBuffering: boolean;
  error: string | null;
  quality: VideoQuality | null;
  activeCaption: string;
  captionsEnabled: boolean;
  currentAudioTrack: number;
}

/**
 * Video player configuration
 */
export interface VideoPlayerConfig {
  autoPlay?: boolean;
  autoFullscreen?: boolean;
  showControls?: boolean;
  enableKeyboardShortcuts?: boolean;
  enablePictureInPicture?: boolean;
  enableTheaterMode?: boolean;
  defaultVolume?: number;
  defaultPlaybackRate?: number;
  defaultQuality?: string;
  preload?: 'none' | 'metadata' | 'auto';
}

// ===== NETFLIX-LIKE FEATURES TYPES =====

/**
 * Intro timing data
 */
export interface IntroData {
  start: number;
  end: number;
  contentId: string;
  contentType: 'movie' | 'episode';
}

/**
 * Skip intro button props
 */
export interface SkipIntroButtonProps {
  currentTime: number;
  introStart: number;
  introEnd: number;
  onSkipIntro: () => void;
  className?: string;
  style?: React.CSSProperties;
  isVisible?: boolean;
  disabled?: boolean;
  'aria-label'?: string;
}

/**
 * Next episode overlay props
 */
export interface NextEpisodeOverlayProps {
  isVisible: boolean;
  nextEpisode: EpisodeMetadata;
  onPlayNext: (episodeData: EpisodeMetadata) => void;
  onCancel: () => void;
  countdownDuration?: number;
  className?: string;
  style?: React.CSSProperties;
  autoPlay?: boolean;
  showThumbnail?: boolean;
}

/**
 * Episode transition data
 */
export interface EpisodeTransition {
  fromEpisode: EpisodeMetadata;
  toEpisode: EpisodeMetadata;
  preserveState: boolean;
  autoPlay: boolean;
  timestamp: number;
}

/**
 * Content metadata union type
 */
export type ContentMetadata = EpisodeMetadata | MovieMetadata;

/**
 * Content type discriminator
 */
export type ContentType = 'movie' | 'episode';

// ===== PLAYER CONTROLS TYPES =====

/**
 * Player control button props
 */
export interface PlayerControlProps {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
  title?: string;
  children?: React.ReactNode;
}

/**
 * Volume control props
 */
export interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  className?: string;
}

/**
 * Progress bar props
 */
export interface ProgressBarProps {
  currentTime: number;
  duration: number;
  buffered: TimeRanges | null;
  onSeek: (time: number) => void;
  onSeekStart?: () => void;
  onSeekEnd?: () => void;
  className?: string;
  showThumbnails?: boolean;
  thumbnailSrc?: string;
}

/**
 * Quality selector props
 */
export interface QualitySelectorProps {
  qualities: VideoQuality[];
  currentQuality: VideoQuality | null;
  onQualityChange: (quality: VideoQuality) => void;
  autoQuality: boolean;
  onAutoQualityToggle: () => void;
  className?: string;
}

/**
 * Caption selector props
 */
export interface CaptionSelectorProps {
  captions: CaptionTrack[];
  activeCaption: string;
  onCaptionChange: (language: string) => void;
  className?: string;
}

// ===== EVENT HANDLER TYPES =====

/**
 * Video player event handlers
 */
export interface VideoPlayerEventHandlers {
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onVolumeChange?: (volume: number, isMuted: boolean) => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  onTheaterModeChange?: (isTheaterMode: boolean) => void;
  onPictureInPictureChange?: (isPiP: boolean) => void;
  onQualityChange?: (quality: VideoQuality) => void;
  onCaptionChange?: (language: string) => void;
  onPlaybackRateChange?: (rate: number) => void;
  onError?: (error: string) => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onBufferStart?: () => void;
  onBufferEnd?: () => void;
  onEpisodeChange?: (episodeData: EpisodeMetadata) => void;
  onIntroSkip?: (introData: IntroData) => void;
}

// ===== ACCESSIBILITY TYPES =====

/**
 * Motion preferences interface
 */
export interface MotionPreferences {
  prefersReducedMotion: boolean;
  prefersReducedData: boolean;
  prefersHighContrast: boolean;
  isTouch: boolean;
}

/**
 * Accessibility configuration
 */
export interface AccessibilityConfig {
  enableScreenReaderAnnouncements: boolean;
  enableKeyboardNavigation: boolean;
  enableFocusTrapping: boolean;
  enableHighContrast: boolean;
  respectMotionPreferences: boolean;
  announceTimeUpdates: boolean;
  announceVolumeChanges: boolean;
  announceQualityChanges: boolean;
}

// ===== KEYBOARD SHORTCUT TYPES =====

/**
 * Keyboard shortcut configuration
 */
export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: string;
  description: string;
  category: 'playback' | 'navigation' | 'volume' | 'display' | 'accessibility';
}

/**
 * Keyboard shortcuts map
 */
export interface KeyboardShortcuts {
  [key: string]: KeyboardShortcut;
}

// ===== ERROR HANDLING TYPES =====

/**
 * Video player error types
 */
export type VideoPlayerErrorType = 
  | 'NETWORK_ERROR'
  | 'DECODE_ERROR'
  | 'SRC_NOT_SUPPORTED'
  | 'ABORTED'
  | 'METADATA_ERROR'
  | 'INTRO_DETECTION_ERROR'
  | 'EPISODE_TRANSITION_ERROR'
  | 'CAPTION_ERROR'
  | 'QUALITY_CHANGE_ERROR'
  | 'FULLSCREEN_ERROR'
  | 'PIP_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Video player error interface
 */
export interface VideoPlayerError {
  type: VideoPlayerErrorType;
  message: string;
  code?: number;
  timestamp: number;
  context?: Record<string, any>;
  recoverable: boolean;
}

/**
 * Error recovery strategy
 */
export interface ErrorRecoveryStrategy {
  type: VideoPlayerErrorType;
  maxRetries: number;
  retryDelay: number;
  fallbackAction?: () => void;
  userMessage: string;
}

// ===== PERFORMANCE MONITORING TYPES =====

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  loadTime: number;
  firstFrame: number;
  bufferHealth: number;
  qualityChanges: number;
  stallCount: number;
  averageBitrate: number;
  droppedFrames: number;
  playbackStartTime: number;
}

/**
 * Analytics event interface
 */
export interface AnalyticsEvent {
  type: string;
  timestamp: number;
  data: Record<string, any>;
  sessionId: string;
  contentId?: string;
  userId?: string;
}

// ===== UTILITY TYPES =====

/**
 * Time range interface
 */
export interface TimeRange {
  start: number;
  end: number;
}

/**
 * Buffered time ranges
 */
export interface BufferedRanges {
  length: number;
  start: (index: number) => number;
  end: (index: number) => number;
}

/**
 * Device capabilities
 */
export interface DeviceCapabilities {
  supportsFullscreen: boolean;
  supportsPictureInPicture: boolean;
  supportsHDR: boolean;
  maxResolution: { width: number; height: number };
  supportedCodecs: string[];
  hasTouch: boolean;
  connectionType: 'slow' | 'medium' | 'fast';
}

/**
 * Player theme configuration
 */
export interface PlayerTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  errorColor: string;
  successColor: string;
  borderRadius: string;
  fontFamily: string;
}

// ===== COMPONENT REF TYPES =====

/**
 * Video player ref interface
 */
export interface VideoPlayerRef {
  play: () => Promise<void>;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unmute: () => void;
  toggleFullscreen: () => Promise<void>;
  toggleTheaterMode: () => void;
  togglePictureInPicture: () => Promise<void>;
  changeQuality: (quality: VideoQuality) => void;
  changeCaption: (language: string) => void;
  setPlaybackRate: (rate: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getState: () => VideoPlayerState;
  skipIntro: () => void;
  playNextEpisode: (episode: EpisodeMetadata) => void;
}

// ===== HOOK RETURN TYPES =====

/**
 * Motion preference hook return type
 */
export interface UseMotionPreferenceReturn extends MotionPreferences {
  getAnimationDuration: (defaultMs: number) => number;
  shouldAnimate: (animationType?: 'entrance' | 'exit' | 'hover' | 'focus') => boolean;
}

/**
 * Video player hook return type
 */
export interface UseVideoPlayerReturn {
  state: VideoPlayerState;
  actions: {
    play: () => void;
    pause: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    toggleMute: () => void;
    toggleFullscreen: () => void;
    toggleTheaterMode: () => void;
    togglePictureInPicture: () => void;
    changeQuality: (quality: VideoQuality) => void;
    changeCaption: (language: string) => void;
    setPlaybackRate: (rate: number) => void;
    skipIntro: () => void;
    playNextEpisode: (episode: EpisodeMetadata) => void;
  };
  ref: React.RefObject<VideoPlayerRef>;
}

// ===== EPISODE NAVIGATION TYPES =====

/**
 * Episode data for VideoPlayer navigation
 */
export interface EpisodeNavigationData {
  episodes: Episode[];
  currentEpisodeIndex: number;
  seasonNumber: number;
  seriesId: string;
}

/**
 * Episode validation result
 */
export interface EpisodeValidationResult {
  isValid: boolean;
  error?: string;
  hasEpisodeData: boolean;
  canNavigate: boolean;
}

/**
 * Episode data mapping configuration
 */
export interface EpisodeDataMappingConfig {
  defaultVideoSource: string;
  defaultIntroStart: number;
  defaultIntroEnd: number;
  validateVideoSources: boolean;
}

/**
 * Episode change event data
 */
export interface EpisodeChangeEvent {
  fromEpisode: EpisodeMetadata;
  toEpisode: EpisodeMetadata;
  fromIndex: number;
  toIndex: number;
  seasonNumber: number;
  seriesId: string;
  timestamp: number;
}

// ===== EXPORT ALL TYPES =====

export type {
  // Re-export from episode-metadata
  EpisodeMetadata,
  MovieMetadata
};

// Re-export Episode from main types
export type { Episode } from './index';