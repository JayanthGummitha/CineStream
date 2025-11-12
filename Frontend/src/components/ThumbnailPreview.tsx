import { useState, useEffect, useRef, useCallback } from 'react';
import { getCurrentBreakpoint, isBreakpointUp } from '@/utils/responsive';

interface ThumbnailCue {
  startTime: number;
  endTime: number;
  text: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ThumbnailPreviewProps {
  thumbnailsUrl: string;
  currentTime: number;
  duration: number;
  hoverTime: number | null;
  isVisible: boolean;
  position: { x: number; y: number };
  containerWidth?: number;
  containerHeight?: number;
  sliderRef?: React.RefObject<HTMLDivElement>;
  responsive?: {
    mobile?: { width: number; height: number };
    tablet?: { width: number; height: number };
    desktop?: { width: number; height: number };
  };
}

export function ThumbnailPreview({
  thumbnailsUrl,
  currentTime,
  duration,
  hoverTime,
  isVisible,
  position,
  containerWidth = 160,
  containerHeight = 90,
  sliderRef,
  responsive
}: ThumbnailPreviewProps) {
  const [thumbnailCues, setThumbnailCues] = useState<ThumbnailCue[]>([]);
  const [currentThumbnail, setCurrentThumbnail] = useState<ThumbnailCue | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentBreakpoint, setCurrentBreakpoint] = useState(getCurrentBreakpoint());
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Update breakpoint on resize
  useEffect(() => {
    const handleResize = () => {
      setCurrentBreakpoint(getCurrentBreakpoint());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get responsive dimensions
  const getResponsiveDimensions = useCallback(() => {
    if (!responsive) return { width: containerWidth, height: containerHeight };

    if (currentBreakpoint === 'sm' && responsive.mobile) {
      return responsive.mobile;
    }
    if ((currentBreakpoint === 'md' || currentBreakpoint === 'lg') && responsive.tablet) {
      return responsive.tablet;
    }
    if (isBreakpointUp('xl') && responsive.desktop) {
      return responsive.desktop;
    }

    // Default responsive scaling based on breakpoint
    const scale = currentBreakpoint === 'sm' ? 0.7 : 
                  currentBreakpoint === 'md' ? 0.85 : 1;
    
    return {
      width: Math.round(containerWidth * scale),
      height: Math.round(containerHeight * scale)
    };
  }, [currentBreakpoint, responsive, containerWidth, containerHeight]);

  // Parse VTT file with better error handling
  const parseVTT = useCallback((vttText: string): ThumbnailCue[] => {
    try {
      const lines = vttText.split('\n');
      const cues: ThumbnailCue[] = [];
      
      let i = 0;
      while (i < lines.length) {
        const line = lines[i].trim();
        
        // Skip empty lines, WEBVTT header, and NOTE lines
        if (!line || line === 'WEBVTT' || line.startsWith('NOTE') || line.startsWith('STYLE')) {
          i++;
          continue;
        }
        
        // Look for timestamp line (format: 00:00:00.000 --> 00:00:05.000)
        if (line.includes('-->')) {
          const [startStr, endStr] = line.split('-->').map(s => s.trim());
          const startTime = parseTimeString(startStr);
          const endTime = parseTimeString(endStr);
          
          i++;
          // Get the cue text (might be on next line)
          if (i < lines.length) {
            const cueText = lines[i].trim();
            if (cueText) {
              const thumbnail = parseThumbnailCue(cueText, startTime, endTime);
              if (thumbnail) {
                cues.push(thumbnail);
              }
            }
          }
        }
        i++;
      }
      
      return cues.sort((a, b) => a.startTime - b.startTime);
    } catch (err) {
      console.error('Error parsing VTT:', err);
      return [];
    }
  }, []);

  // Parse time string with better format support
  const parseTimeString = useCallback((timeStr: string): number => {
    try {
      // Remove any whitespace
      timeStr = timeStr.trim();
      
      // Handle different time formats
      const parts = timeStr.split(':');
      
      if (parts.length === 3) {
        // HH:MM:SS.mmm format
        const [hours, minutes, seconds] = parts;
        return (
          parseInt(hours, 10) * 3600 +
          parseInt(minutes, 10) * 60 +
          parseFloat(seconds)
        );
      } else if (parts.length === 2) {
        // MM:SS.mmm format
        const [minutes, seconds] = parts;
        return parseInt(minutes, 10) * 60 + parseFloat(seconds);
      } else if (parts.length === 1) {
        // SS.mmm format
        return parseFloat(parts[0]);
      }
      
      return 0;
    } catch (err) {
      console.error('Error parsing time string:', timeStr, err);
      return 0;
    }
  }, []);

  // Parse thumbnail cue with better URL handling
  const parseThumbnailCue = useCallback((
    cueText: string, 
    startTime: number, 
    endTime: number
  ): ThumbnailCue | null => {
    try {
      // Parse format like: "thumbnails.jpg#xywh=0,0,160,90" or just "thumbnails.jpg"
      const match = cueText.match(/^(.+?)(?:#xywh=(\d+),(\d+),(\d+),(\d+))?$/);
      if (!match) return null;

      const [, url, x = '0', y = '0', width = '160', height = '90'] = match;
      
      return {
        startTime,
        endTime,
        text: cueText,
        url: url.trim(),
        x: parseInt(x, 10),
        y: parseInt(y, 10),
        width: parseInt(width, 10),
        height: parseInt(height, 10)
      };
    } catch (err) {
      console.error('Error parsing thumbnail cue:', cueText, err);
      return null;
    }
  }, []);

  // Fetch and parse VTT file
  useEffect(() => {
    if (!thumbnailsUrl) {
      setThumbnailCues([]);
      setError(null);
      return;
    }

    const fetchThumbnails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(thumbnailsUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const vttText = await response.text();
        const cues = parseVTT(vttText);
        
        if (cues.length === 0) {
          throw new Error('No valid thumbnail cues found in VTT file');
        }
        
        setThumbnailCues(cues);
        console.log(`Loaded ${cues.length} thumbnail cues`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load thumbnails';
        setError(errorMessage);
        console.error('Failed to load thumbnails:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThumbnails();
  }, [thumbnailsUrl, parseVTT]);

  // Find thumbnail for current hover time
  useEffect(() => {
    if (!thumbnailCues.length || hoverTime === null) {
      setCurrentThumbnail(null);
      return;
    }

    // Find the thumbnail cue that contains the hover time
    const thumbnail = thumbnailCues.find(cue => 
      hoverTime >= cue.startTime && hoverTime < cue.endTime
    );

    if (thumbnail && thumbnail !== currentThumbnail) {
      setCurrentThumbnail(thumbnail);
      setImageLoaded(false);
    } else if (!thumbnail) {
      setCurrentThumbnail(null);
    }
  }, [hoverTime, thumbnailCues, currentThumbnail]);

  // Preload image when thumbnail changes
  useEffect(() => {
    if (!currentThumbnail) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      setImageLoaded(true);
      imageRef.current = img;
    };
    
    img.onerror = () => {
      setError('Failed to load thumbnail image');
      setImageLoaded(false);
    };
    
    img.src = currentThumbnail.url;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [currentThumbnail]);

  // Format time display
  const formatTime = useCallback((seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Calculate position relative to slider container
  const calculatePosition = useCallback(() => {
    if (!duration || hoverTime === null) return { left: '0%', transform: 'translateX(-50%)' };

    const hoverPercent = (hoverTime / duration) * 100;
    let transform = 'translateX(-50%)'; // Center the tooltip by default
    
    // Adjust if tooltip would go off screen edges
    if (hoverPercent < 15) {
      transform = 'translateX(0%)'; // Align left edge
    } else if (hoverPercent > 85) {
      transform = 'translateX(-100%)'; // Align right edge
    }
    
    return { left: `${hoverPercent}%`, transform };
  }, [hoverTime, duration]);

  // Don't render if not visible or no thumbnail
  if (!isVisible || !currentThumbnail || error) {
    return null;
  }

  const dimensions = getResponsiveDimensions();
  const thumbnailStyle = {
    backgroundImage: imageLoaded ? `url(${currentThumbnail.url})` : 'none',
    backgroundPosition: `-${currentThumbnail.x}px -${currentThumbnail.y}px`,
    backgroundSize: 'auto',
    backgroundRepeat: 'no-repeat',
    width: `${dimensions.width}px`,
    height: `${dimensions.height}px`,
  };

  const tooltipPosition = calculatePosition();

  return (
    <div
      className="absolute bottom-full mb-2 pointer-events-none z-50"
      style={{ 
        left: tooltipPosition.left, 
        transform: tooltipPosition.transform 
      }}
    >
      <div className="bg-black/95 backdrop-blur-sm rounded-lg p-2 shadow-2xl border border-white/10">
        <div className="relative overflow-hidden rounded">
          {!imageLoaded && (
            <div className="flex items-center justify-center bg-gray-800 text-white text-xs"
                 style={{ width: dimensions.width, height: dimensions.height }}>
              Loading...
            </div>
          )}
          {imageLoaded && <div className="rounded overflow-hidden" style={thumbnailStyle} />}
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
            </div>
          )}
        </div>
        <div className="text-white text-xs text-center mt-2 font-mono">
          {formatTime(hoverTime || 0)}
        </div>
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
          <div className="w-2 h-2 bg-black/95 border-r border-b border-white/10 rotate-45"></div>
        </div>
      </div>
    </div>
  );
}