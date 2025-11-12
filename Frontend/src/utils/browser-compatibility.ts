/**
 * Browser Compatibility Utilities
 * 
 * Provides utilities for detecting browser capabilities and ensuring
 * cross-browser compatibility for video player features.
 * 
 * @module browser-compatibility
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';

/**
 * Interface representing browser capabilities
 */
export interface BrowserCapabilities {
  /** Whether the browser supports fullscreen API */
  supportsFullscreen: boolean;
  /** Whether the browser supports Picture-in-Picture */
  supportsPictureInPicture: boolean;
  /** Whether the browser supports Web Audio API */
  supportsWebAudio: boolean;
  /** Whether the browser supports Media Session API */
  supportsMediaSession: boolean;
  /** Whether the browser supports Intersection Observer */
  supportsIntersectionObserver: boolean;
  /** Whether the browser supports CSS Grid */
  supportsCSSGrid: boolean;
  /** Whether the browser supports CSS Custom Properties */
  supportsCSSCustomProperties: boolean;
  /** Whether the browser supports touch events */
  supportsTouch: boolean;
  /** Whether the browser supports pointer events */
  supportsPointer: boolean;
  /** Whether the browser supports passive event listeners */
  supportsPassiveEvents: boolean;
  /** Browser name and version */
  browser: {
    name: string;
    version: string;
    engine: string;
  };
  /** Device information */
  device: {
    type: 'desktop' | 'tablet' | 'mobile';
    os: string;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
  };
}

/**
 * Detects comprehensive browser capabilities
 * 
 * @returns Object containing browser capability flags and information
 */
export function detectBrowserCapabilities(): BrowserCapabilities {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return getServerSideDefaults();
  }

  const capabilities: BrowserCapabilities = {
    supportsFullscreen: detectFullscreenSupport(),
    supportsPictureInPicture: detectPictureInPictureSupport(),
    supportsWebAudio: detectWebAudioSupport(),
    supportsMediaSession: detectMediaSessionSupport(),
    supportsIntersectionObserver: detectIntersectionObserverSupport(),
    supportsCSSGrid: detectCSSGridSupport(),
    supportsCSSCustomProperties: detectCSSCustomPropertiesSupport(),
    supportsTouch: detectTouchSupport(),
    supportsPointer: detectPointerSupport(),
    supportsPassiveEvents: detectPassiveEventSupport(),
    browser: detectBrowser(),
    device: detectDevice()
  };

  console.log('🔍 Browser capabilities detected:', capabilities);
  return capabilities;
}

/**
 * Detects fullscreen API support across browsers
 */
function detectFullscreenSupport(): boolean {
  const element = document.documentElement;
  return !!(
    element.requestFullscreen ||
    (element as any).webkitRequestFullscreen ||
    (element as any).mozRequestFullScreen ||
    (element as any).msRequestFullscreen
  );
}

/**
 * Detects Picture-in-Picture API support
 */
function detectPictureInPictureSupport(): boolean {
  return 'pictureInPictureEnabled' in document;
}

/**
 * Detects Web Audio API support
 */
function detectWebAudioSupport(): boolean {
  return !!(window.AudioContext || (window as any).webkitAudioContext);
}

/**
 * Detects Media Session API support
 */
function detectMediaSessionSupport(): boolean {
  return 'mediaSession' in navigator;
}

/**
 * Detects Intersection Observer API support
 */
function detectIntersectionObserverSupport(): boolean {
  return 'IntersectionObserver' in window;
}

/**
 * Detects CSS Grid support
 */
function detectCSSGridSupport(): boolean {
  return CSS.supports('display', 'grid');
}

/**
 * Detects CSS Custom Properties support
 */
function detectCSSCustomPropertiesSupport(): boolean {
  return CSS.supports('--custom-property', 'value');
}

/**
 * Detects touch event support
 */
function detectTouchSupport(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Detects pointer event support
 */
function detectPointerSupport(): boolean {
  return 'onpointerdown' in window;
}

/**
 * Detects passive event listener support
 */
function detectPassiveEventSupport(): boolean {
  let supportsPassive = false;
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get() {
        supportsPassive = true;
        return false;
      }
    });
    window.addEventListener('testPassive', () => {}, opts);
    window.removeEventListener('testPassive', () => {}, opts);
  } catch (e) {
    // Passive events not supported
  }
  return supportsPassive;
}

/**
 * Detects browser name, version, and engine
 */
function detectBrowser(): BrowserCapabilities['browser'] {
  const userAgent = navigator.userAgent;
  
  // Chrome
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    const version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'unknown';
    return { name: 'Chrome', version, engine: 'Blink' };
  }
  
  // Edge
  if (userAgent.includes('Edg')) {
    const version = userAgent.match(/Edg\/(\d+)/)?.[1] || 'unknown';
    return { name: 'Edge', version, engine: 'Blink' };
  }
  
  // Firefox
  if (userAgent.includes('Firefox')) {
    const version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'unknown';
    return { name: 'Firefox', version, engine: 'Gecko' };
  }
  
  // Safari
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    const version = userAgent.match(/Version\/(\d+)/)?.[1] || 'unknown';
    return { name: 'Safari', version, engine: 'WebKit' };
  }
  
  // Opera
  if (userAgent.includes('OPR')) {
    const version = userAgent.match(/OPR\/(\d+)/)?.[1] || 'unknown';
    return { name: 'Opera', version, engine: 'Blink' };
  }
  
  return { name: 'Unknown', version: 'unknown', engine: 'unknown' };
}

/**
 * Detects device type and operating system
 */
function detectDevice(): BrowserCapabilities['device'] {
  const userAgent = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?=.*Mobile)/i.test(userAgent) && window.innerWidth >= 768;
  const isDesktop = !isMobile && !isTablet;
  
  let os = 'Unknown';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
  
  let type: 'desktop' | 'tablet' | 'mobile' = 'desktop';
  if (isMobile) type = 'mobile';
  else if (isTablet) type = 'tablet';
  
  return { type, os, isMobile, isTablet, isDesktop };
}

/**
 * Returns default capabilities for server-side rendering
 */
function getServerSideDefaults(): BrowserCapabilities {
  return {
    supportsFullscreen: false,
    supportsPictureInPicture: false,
    supportsWebAudio: false,
    supportsMediaSession: false,
    supportsIntersectionObserver: false,
    supportsCSSGrid: true, // Assume modern browser
    supportsCSSCustomProperties: true,
    supportsTouch: false,
    supportsPointer: false,
    supportsPassiveEvents: true,
    browser: { name: 'Unknown', version: 'unknown', engine: 'unknown' },
    device: { type: 'desktop', os: 'Unknown', isMobile: false, isTablet: false, isDesktop: true }
  };
}

/**
 * Applies browser-specific polyfills and fixes
 * 
 * @param capabilities - Browser capabilities object
 */
export function applyBrowserFixes(capabilities: BrowserCapabilities): void {
  // Fix for Safari fullscreen issues
  if (capabilities.browser.name === 'Safari') {
    applySafariFullscreenFix();
  }
  
  // Fix for Firefox video controls
  if (capabilities.browser.name === 'Firefox') {
    applyFirefoxVideoFix();
  }
  
  // Fix for Edge legacy issues
  if (capabilities.browser.name === 'Edge' && parseInt(capabilities.browser.version) < 79) {
    applyEdgeLegacyFixes();
  }
  
  // Apply mobile-specific fixes
  if (capabilities.device.isMobile) {
    applyMobileFixes();
  }
  
  // Apply touch-specific fixes
  if (capabilities.supportsTouch) {
    applyTouchFixes();
  }
}

/**
 * Applies Safari-specific fullscreen fixes
 */
function applySafariFullscreenFix(): void {
  // Add Safari-specific CSS classes
  document.documentElement.classList.add('safari-browser');
  
  // Fix for Safari fullscreen video issues
  const style = document.createElement('style');
  style.textContent = `
    .safari-browser video::-webkit-media-controls {
      display: none !important;
    }
    .safari-browser video::-webkit-media-controls-enclosure {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Applies Firefox-specific video fixes
 */
function applyFirefoxVideoFix(): void {
  document.documentElement.classList.add('firefox-browser');
  
  // Fix for Firefox video control styling
  const style = document.createElement('style');
  style.textContent = `
    .firefox-browser video::-moz-media-controls {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Applies fixes for legacy Edge browsers
 */
function applyEdgeLegacyFixes(): void {
  document.documentElement.classList.add('edge-legacy');
  
  // Add CSS Grid fallbacks for legacy Edge
  const style = document.createElement('style');
  style.textContent = `
    .edge-legacy .video-player-grid {
      display: -ms-grid;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Applies mobile-specific fixes
 */
function applyMobileFixes(): void {
  document.documentElement.classList.add('mobile-device');
  
  // Prevent zoom on input focus
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute('content', 
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
    );
  }
  
  // Add mobile-specific styles
  const style = document.createElement('style');
  style.textContent = `
    .mobile-device * {
      -webkit-tap-highlight-color: transparent;
    }
    .mobile-device button {
      -webkit-appearance: none;
      border-radius: 0;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Applies touch-specific fixes
 */
function applyTouchFixes(): void {
  document.documentElement.classList.add('touch-device');
  
  // Add touch-friendly styles
  const style = document.createElement('style');
  style.textContent = `
    .touch-device .video-controls button {
      min-height: 44px;
      min-width: 44px;
    }
    .touch-device .skip-intro-button {
      min-height: 44px;
      min-width: 44px;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Gets appropriate event listener options based on browser support
 * 
 * @param passive - Whether to use passive listeners
 * @param capabilities - Browser capabilities
 * @returns Event listener options object
 */
export function getEventListenerOptions(
  passive: boolean,
  capabilities: BrowserCapabilities
): boolean | AddEventListenerOptions {
  if (capabilities.supportsPassiveEvents) {
    return { passive };
  }
  return false;
}

/**
 * Gets vendor-prefixed fullscreen methods
 * 
 * @returns Object containing fullscreen methods for current browser
 */
export function getFullscreenMethods() {
  const element = document.documentElement;
  
  return {
    requestFullscreen: 
      element.requestFullscreen ||
      (element as any).webkitRequestFullscreen ||
      (element as any).mozRequestFullScreen ||
      (element as any).msRequestFullscreen,
    
    exitFullscreen:
      document.exitFullscreen ||
      (document as any).webkitExitFullscreen ||
      (document as any).mozCancelFullScreen ||
      (document as any).msExitFullscreen,
    
    fullscreenElement:
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement,
    
    fullscreenEnabled:
      document.fullscreenEnabled ||
      (document as any).webkitFullscreenEnabled ||
      (document as any).mozFullScreenEnabled ||
      (document as any).msFullscreenEnabled
  };
}

/**
 * Hook to use browser capabilities in React components
 * 
 * @returns Browser capabilities object
 */
export function useBrowserCapabilities(): BrowserCapabilities {
  const [capabilities, setCapabilities] = useState<BrowserCapabilities>(() => 
    detectBrowserCapabilities()
  );
  
  useEffect(() => {
    const detectedCapabilities = detectBrowserCapabilities();
    setCapabilities(detectedCapabilities);
    applyBrowserFixes(detectedCapabilities);
  }, []);
  
  return capabilities;
}