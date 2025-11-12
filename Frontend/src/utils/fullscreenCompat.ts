/**
 * Fullscreen API compatibility utilities
 * Handles browser differences, mobile constraints, and feature detection
 */

export interface FullscreenCapabilities {
  isSupported: boolean;
  requiresUserInteraction: boolean;
  isMobile: boolean;
  hasNativeFullscreen: boolean;
  supportedMethods: string[];
  browserType: 'webkit' | 'moz' | 'ms' | 'standard' | 'unknown';
}

export interface FullscreenState {
  isFullscreen: boolean;
  element: Element | null;
  canEnter: boolean;
  canExit: boolean;
}

/**
 * Detects fullscreen API support and browser capabilities
 */
export function detectFullscreenCapabilities(): FullscreenCapabilities {
  const doc = document as any;
  const element = document.documentElement as any;
  
  // Check for different fullscreen API implementations
  const hasRequestFullscreen = !!element.requestFullscreen;
  const hasWebkitRequestFullscreen = !!element.webkitRequestFullscreen;
  const hasMozRequestFullScreen = !!element.mozRequestFullScreen;
  const hasMsRequestFullscreen = !!element.msRequestFullscreen;
  
  const supportedMethods: string[] = [];
  let browserType: 'webkit' | 'moz' | 'ms' | 'standard' | 'unknown' = 'unknown';
  
  if (hasRequestFullscreen) {
    supportedMethods.push('requestFullscreen');
    browserType = 'standard';
  }
  if (hasWebkitRequestFullscreen) {
    supportedMethods.push('webkitRequestFullscreen');
    if (browserType === 'unknown') browserType = 'webkit';
  }
  if (hasMozRequestFullScreen) {
    supportedMethods.push('mozRequestFullScreen');
    if (browserType === 'unknown') browserType = 'moz';
  }
  if (hasMsRequestFullscreen) {
    supportedMethods.push('msRequestFullscreen');
    if (browserType === 'unknown') browserType = 'ms';
  }
  
  const isSupported = supportedMethods.length > 0;
  const isMobile = detectMobileDevice();
  
  // Mobile devices and some browsers require user interaction
  const requiresUserInteraction = isMobile || 
    /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) ||
    /iPhone|iPad/.test(navigator.userAgent);
  
  // Check if fullscreen is enabled in document
  const hasNativeFullscreen = !!(
    doc.fullscreenEnabled ||
    doc.webkitFullscreenEnabled ||
    doc.mozFullScreenEnabled ||
    doc.msFullscreenEnabled
  );
  
  return {
    isSupported,
    requiresUserInteraction,
    isMobile,
    hasNativeFullscreen,
    supportedMethods,
    browserType
  };
}

/**
 * Detects mobile devices and their specific constraints
 */
export function detectMobileDevice(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'mobile', 'android', 'iphone', 'ipad', 'ipod', 
    'blackberry', 'windows phone', 'opera mini'
  ];
  
  // Check user agent
  const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
  
  // Check screen size as additional indicator
  const isMobileScreen = window.innerWidth <= 768 || window.innerHeight <= 768;
  
  // Check touch capability
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Check orientation API (mobile-specific)
  const hasOrientation = 'orientation' in window;
  
  return isMobileUA || (isMobileScreen && hasTouch) || hasOrientation;
}

/**
 * Gets current fullscreen state across different browser implementations
 */
export function getFullscreenState(): FullscreenState {
  const doc = document as any;
  
  const fullscreenElement = 
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement ||
    null;
  
  const isFullscreen = !!fullscreenElement;
  const capabilities = detectFullscreenCapabilities();
  
  return {
    isFullscreen,
    element: fullscreenElement,
    canEnter: capabilities.isSupported && capabilities.hasNativeFullscreen && !isFullscreen,
    canExit: capabilities.isSupported && isFullscreen
  };
}

/**
 * Cross-browser fullscreen request with fallback handling
 */
export async function requestFullscreen(element: HTMLElement): Promise<boolean> {
  const capabilities = detectFullscreenCapabilities();
  
  if (!capabilities.isSupported) {
    throw new Error('Fullscreen API not supported in this browser');
  }
  
  if (!capabilities.hasNativeFullscreen) {
    throw new Error('Fullscreen is disabled in this browser');
  }
  
  const elementAny = element as any;
  
  try {
    // Try different fullscreen methods based on browser support
    if (elementAny.requestFullscreen) {
      await elementAny.requestFullscreen();
    } else if (elementAny.webkitRequestFullscreen) {
      await elementAny.webkitRequestFullscreen();
    } else if (elementAny.mozRequestFullScreen) {
      await elementAny.mozRequestFullScreen();
    } else if (elementAny.msRequestFullscreen) {
      await elementAny.msRequestFullscreen();
    } else {
      throw new Error('No supported fullscreen method found');
    }
    
    return true;
  } catch (error) {
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('user activation') || 
          error.message.includes('user gesture') ||
          error.message.includes('not allowed')) {
        throw new Error('Fullscreen requires user interaction');
      }
    }
    throw error;
  }
}

/**
 * Cross-browser fullscreen exit with fallback handling
 */
export async function exitFullscreen(): Promise<boolean> {
  const doc = document as any;
  const state = getFullscreenState();
  
  if (!state.isFullscreen) {
    return true; // Already not in fullscreen
  }
  
  try {
    if (doc.exitFullscreen) {
      await doc.exitFullscreen();
    } else if (doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen();
    } else if (doc.mozCancelFullScreen) {
      await doc.mozCancelFullScreen();
    } else if (doc.msExitFullscreen) {
      await doc.msExitFullscreen();
    } else {
      throw new Error('No supported fullscreen exit method found');
    }
    
    return true;
  } catch (error) {
    console.error('Failed to exit fullscreen:', error);
    return false;
  }
}

/**
 * Checks if user interaction is required for fullscreen
 */
export function requiresUserInteraction(): boolean {
  const capabilities = detectFullscreenCapabilities();
  return capabilities.requiresUserInteraction;
}

/**
 * Creates a fullscreen event listener that works across browsers
 */
export function addFullscreenChangeListener(callback: (isFullscreen: boolean) => void): () => void {
  const handleFullscreenChange = () => {
    const state = getFullscreenState();
    callback(state.isFullscreen);
  };
  
  // Add listeners for all browser implementations
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('MSFullscreenChange', handleFullscreenChange);
  
  // Return cleanup function
  return () => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
  };
}

/**
 * Detects if the current context allows fullscreen (user interaction check)
 */
export function canRequestFullscreen(): boolean {
  const capabilities = detectFullscreenCapabilities();
  
  if (!capabilities.isSupported || !capabilities.hasNativeFullscreen) {
    return false;
  }
  
  // If user interaction is required, we can't guarantee success
  // but we can still attempt it
  return true;
}
 