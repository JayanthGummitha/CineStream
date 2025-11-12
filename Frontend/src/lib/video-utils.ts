/**
 * Format time in seconds to MM:SS or HH:MM:SS format
 */
export function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Parse time string to seconds
 */
export function parseTime(timeString: string): number {
  const parts = timeString.split(':').map(Number).reverse();
  let seconds = 0;
  
  for (let i = 0; i < parts.length; i++) {
    seconds += parts[i] * Math.pow(60, i);
  }
  
  return seconds;
}

/**
 * Get video quality from URL or detect from resolution
 */
export function getVideoQuality(width?: number, height?: number): string {
  if (!width || !height) return 'auto';
  
  if (height >= 1080) return '1080p';
  if (height >= 720) return '720p';
  if (height >= 480) return '480p';
  if (height >= 360) return '360p';
  
  return 'auto';
}

/**
 * Detect video source type from URL
 */
export function detectVideoType(url: string): 'direct' | 'youtube' | 'hls' | 'dash' | 'unknown' {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return 'youtube';
  }
  
  if (lowerUrl.includes('.m3u8')) {
    return 'hls';
  }
  
  if (lowerUrl.includes('.mpd')) {
    return 'dash';
  }
  
  if (lowerUrl.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/)) {
    return 'direct';
  }
  
  return 'unknown';
}

/**
 * Validate video URL
 */
export function isValidVideoUrl(url: string): boolean {
  try {
    new URL(url);
    const type = detectVideoType(url);
    return type !== 'unknown';
  } catch {
    return false;
  }
}

/**
 * Generate thumbnail URL for video (if supported)
 */
export function getThumbnailUrl(videoUrl: string, time: number = 0): string | null {
  const type = detectVideoType(videoUrl);
  
  if (type === 'youtube') {
    const videoId = extractYouTubeVideoId(videoUrl);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
  }
  
  // For other types, would need server-side thumbnail generation
  return null;
}

/**
 * Extract YouTube video ID from URL
 */
export function extractYouTubeVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Get video duration estimate from file size (rough estimate)
 */
export function estimateDurationFromSize(sizeInBytes: number, quality: string = '720p'): number {
  // Very rough estimates based on typical bitrates
  const bitrates = {
    '1080p': 8000000, // 8 Mbps
    '720p': 5000000,  // 5 Mbps
    '480p': 2500000,  // 2.5 Mbps
    '360p': 1000000   // 1 Mbps
  };
  
  const bitrate = bitrates[quality as keyof typeof bitrates] || bitrates['720p'];
  return (sizeInBytes * 8) / bitrate; // Convert bytes to bits, divide by bitrate
}

/**
 * Keyboard shortcut helpers
 */
export const keyboardShortcuts = {
  PLAY_PAUSE: 'Space',
  SKIP_BACKWARD: 'ArrowLeft',
  SKIP_FORWARD: 'ArrowRight',
  VOLUME_UP: 'ArrowUp',
  VOLUME_DOWN: 'ArrowDown',
  MUTE: 'KeyM',
  FULLSCREEN: 'KeyF',
  THEATER_MODE: 'KeyT',
  CAPTIONS: 'KeyC',
  SHORTCUTS: 'Slash', // ? key
  ESCAPE: 'Escape'
};

/**
 * Check if keyboard shortcut should be handled
 */
export function shouldHandleKeyboardShortcut(event: KeyboardEvent): boolean {
  const activeElement = document.activeElement;
  const tagName = activeElement?.tagName.toLowerCase();
  
  // Don't handle shortcuts when typing in inputs
  if (tagName === 'input' || tagName === 'textarea' || activeElement?.hasAttribute('contenteditable')) {
    return false;
  }
  
  return true;
}