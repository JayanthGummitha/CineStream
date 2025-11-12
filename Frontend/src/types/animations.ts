/**
 * Animation and Motion TypeScript Type Definitions
 * Type definitions for animation utilities and motion preferences
 */

// ===== ANIMATION CONFIGURATION TYPES =====

/**
 * Animation timing function types
 */
export type AnimationEasing = 
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'cubic-bezier(number, number, number, number)'
  | string;

/**
 * Animation direction types
 */
export type AnimationDirection = 
  | 'normal'
  | 'reverse'
  | 'alternate'
  | 'alternate-reverse';

/**
 * Animation fill mode types
 */
export type AnimationFillMode = 
  | 'none'
  | 'forwards'
  | 'backwards'
  | 'both';

/**
 * Animation play state types
 */
export type AnimationPlayState = 
  | 'running'
  | 'paused';

/**
 * Animation configuration interface
 */
export interface AnimationConfig {
  duration: number;
  delay?: number;
  easing?: AnimationEasing;
  direction?: AnimationDirection;
  fillMode?: AnimationFillMode;
  iterationCount?: number | 'infinite';
  playState?: AnimationPlayState;
}

/**
 * Keyframe animation interface
 */
export interface KeyframeAnimation {
  name: string;
  keyframes: Record<string, React.CSSProperties>;
  config: AnimationConfig;
}

// ===== MOTION PREFERENCE TYPES =====

/**
 * Motion sensitivity levels
 */
export type MotionSensitivity = 'none' | 'reduced' | 'normal' | 'enhanced';

/**
 * Animation types for preference checking
 */
export type AnimationType = 
  | 'entrance'
  | 'exit'
  | 'hover'
  | 'focus'
  | 'loading'
  | 'transition'
  | 'scroll'
  | 'parallax';

/**
 * Motion preference configuration
 */
export interface MotionPreferenceConfig {
  respectSystemPreferences: boolean;
  defaultSensitivity: MotionSensitivity;
  customRules: Record<AnimationType, boolean>;
  fallbackBehavior: 'disable' | 'reduce' | 'maintain';
}

/**
 * Animation state interface
 */
export interface AnimationState {
  isAnimating: boolean;
  currentAnimation: string | null;
  progress: number;
  direction: 'forward' | 'reverse';
  iterationCount: number;
}

// ===== TRANSITION TYPES =====

/**
 * CSS transition properties
 */
export interface TransitionConfig {
  property: string | string[];
  duration: number;
  easing?: AnimationEasing;
  delay?: number;
}

/**
 * Transition state interface
 */
export interface TransitionState {
  isTransitioning: boolean;
  fromValue: any;
  toValue: any;
  progress: number;
}

// ===== SPRING ANIMATION TYPES =====

/**
 * Spring animation configuration
 */
export interface SpringConfig {
  tension: number;
  friction: number;
  mass?: number;
  velocity?: number;
  precision?: number;
  clamp?: boolean;
}

/**
 * Spring animation state
 */
export interface SpringState {
  value: number;
  velocity: number;
  isAnimating: boolean;
  hasFinished: boolean;
}

// ===== GESTURE ANIMATION TYPES =====

/**
 * Gesture animation configuration
 */
export interface GestureConfig {
  drag?: boolean;
  dragConstraints?: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  };
  dragElastic?: number;
  dragMomentum?: boolean;
  whileHover?: React.CSSProperties;
  whileTap?: React.CSSProperties;
  whileDrag?: React.CSSProperties;
}

/**
 * Gesture state interface
 */
export interface GestureState {
  isDragging: boolean;
  isHovering: boolean;
  isTapping: boolean;
  dragOffset: { x: number; y: number };
  dragVelocity: { x: number; y: number };
}

// ===== SCROLL ANIMATION TYPES =====

/**
 * Scroll trigger configuration
 */
export interface ScrollTriggerConfig {
  trigger: string | HTMLElement;
  start?: string | number;
  end?: string | number;
  scrub?: boolean | number;
  pin?: boolean;
  snap?: boolean | number[];
  onEnter?: () => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
  onLeaveBack?: () => void;
}

/**
 * Scroll animation state
 */
export interface ScrollAnimationState {
  progress: number;
  direction: 'up' | 'down';
  velocity: number;
  isInView: boolean;
  hasTriggered: boolean;
}

// ===== PERFORMANCE TYPES =====

/**
 * Animation performance metrics
 */
export interface AnimationPerformanceMetrics {
  fps: number;
  frameDrops: number;
  averageFrameTime: number;
  jankScore: number;
  memoryUsage: number;
  cpuUsage: number;
}

/**
 * Performance monitoring configuration
 */
export interface PerformanceMonitorConfig {
  enabled: boolean;
  sampleRate: number;
  thresholds: {
    minFps: number;
    maxFrameTime: number;
    maxJankScore: number;
  };
  onPerformanceIssue?: (metrics: AnimationPerformanceMetrics) => void;
}

// ===== UTILITY TYPES =====

/**
 * Animation event handler types
 */
export interface AnimationEventHandlers {
  onAnimationStart?: (event: AnimationEvent) => void;
  onAnimationEnd?: (event: AnimationEvent) => void;
  onAnimationIteration?: (event: AnimationEvent) => void;
  onTransitionStart?: (event: TransitionEvent) => void;
  onTransitionEnd?: (event: TransitionEvent) => void;
  onTransitionCancel?: (event: TransitionEvent) => void;
}

/**
 * Animation control interface
 */
export interface AnimationControls {
  start: (animation?: string | KeyframeAnimation) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  reverse: () => void;
  restart: () => void;
  seek: (progress: number) => void;
  setSpeed: (speed: number) => void;
}

/**
 * Animation timeline interface
 */
export interface AnimationTimeline {
  duration: number;
  currentTime: number;
  playbackRate: number;
  playState: AnimationPlayState;
  animations: KeyframeAnimation[];
  addAnimation: (animation: KeyframeAnimation, offset?: number) => void;
  removeAnimation: (name: string) => void;
  play: () => void;
  pause: () => void;
  reverse: () => void;
  seek: (time: number) => void;
}

// ===== RESPONSIVE ANIMATION TYPES =====

/**
 * Breakpoint-specific animation configuration
 */
export interface ResponsiveAnimationConfig {
  mobile?: Partial<AnimationConfig>;
  tablet?: Partial<AnimationConfig>;
  desktop?: Partial<AnimationConfig>;
  largeDesktop?: Partial<AnimationConfig>;
}

/**
 * Device-specific animation preferences
 */
export interface DeviceAnimationPreferences {
  mobile: {
    reduceComplexAnimations: boolean;
    preferTransforms: boolean;
    maxDuration: number;
  };
  tablet: {
    enableParallax: boolean;
    maxConcurrentAnimations: number;
  };
  desktop: {
    enableAdvancedEffects: boolean;
    useHardwareAcceleration: boolean;
  };
}

// ===== ACCESSIBILITY ANIMATION TYPES =====

/**
 * Accessibility-focused animation configuration
 */
export interface AccessibleAnimationConfig {
  respectReducedMotion: boolean;
  provideFallbacks: boolean;
  announceChanges: boolean;
  focusManagement: boolean;
  skipAnimationShortcut?: string;
}

/**
 * Screen reader animation announcements
 */
export interface AnimationAnnouncement {
  type: 'start' | 'end' | 'progress';
  message: string;
  priority: 'polite' | 'assertive';
  delay?: number;
}

// ===== EXPORT TYPES =====

export type {
  // Animation events
  AnimationEvent,
  TransitionEvent
} from 'react';