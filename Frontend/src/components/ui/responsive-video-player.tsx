'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { getCurrentBreakpoint, isBreakpointUp } from '@/utils/responsive';

interface ResponsiveVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
  aspectRatio?: 'video' | 'square' | 'wide' | 'cinema';
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onLoadedMetadata?: () => void;
  onError?: (error: string) => void;
  responsive?: {
    mobile?: {
      height?: string;
      controls?: boolean;
      autoPlay?: boolean;
    };
    tablet?: {
      height?: string;
      controls?: boolean;
      autoPlay?: boolean;
    };
    desktop?: {
      height?: string;
      controls?: boolean;
      autoPlay?: boolean;
    };
  };
  showLoadingState?: boolean;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  overlayComponent?: React.ReactNode;
}

export function ResponsiveVideoPlayer({
  src,
  poster,
  title,
  className,
  aspectRatio = 'video',
  autoPlay = false,
  muted = false,
  loop = false,
  controls = true,
  preload = 'metadata',
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onLoadedMetadata,
  onError,
  responsive,
  showLoadingState = true,
  loadingComponent,
  errorComponent,
  overlayComponent,
}: ResponsiveVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentBreakpoint, setCurrentBreakpoint] = useState(getCurrentBreakpoint());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Update breakpoint on resize
  useEffect(() => {
    const handleResize = () => {
      setCurrentBreakpoint(getCurrentBreakpoint());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get responsive configuration based on current breakpoint
  const getResponsiveConfig = useCallback(() => {
    if (!responsive) return {};

    if (currentBreakpoint === 'sm' && responsive.mobile) {
      return responsive.mobile;
    }
    if ((currentBreakpoint === 'md' || currentBreakpoint === 'lg') && responsive.tablet) {
      return responsive.tablet;
    }
    if (isBreakpointUp('xl') && responsive.desktop) {
      return responsive.desktop;
    }

    return {};
  }, [currentBreakpoint, responsive]);

  // Get aspect ratio classes
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'video':
        return 'aspect-video';
      case 'square':
        return 'aspect-square';
      case 'wide':
        return 'aspect-[21/9]';
      case 'cinema':
        return 'aspect-[2.35/1]';
      default:
        return 'aspect-video';
    }
  };

  // Get responsive height
  const getResponsiveHeight = () => {
    const config = getResponsiveConfig();
    if (config.height) {
      return { height: config.height };
    }
    return {};
  };

  // Get responsive controls setting
  const getResponsiveControls = () => {
    const config = getResponsiveConfig();
    return config.controls !== undefined ? config.controls : controls;
  };

  // Get responsive autoPlay setting
  const getResponsiveAutoPlay = () => {
    const config = getResponsiveConfig();
    return config.autoPlay !== undefined ? config.autoPlay : autoPlay;
  };

  // Handle video events
  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    setIsLoading(false);
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
    onLoadedMetadata?.();
  }, [onLoadedMetadata]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    onPlay?.();
  }, [onPlay]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    onPause?.();
  }, [onPause]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    onEnded?.();
  }, [onEnded]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      onTimeUpdate?.(current, total);
    }
  }, [onTimeUpdate]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    setErrorMessage('Failed to load video');
    onError?.('Failed to load video');
  }, [onError]);

  // Container classes
  const containerClasses = cn(
    'relative overflow-hidden rounded-lg bg-black',
    getAspectRatioClass(),
    className
  );

  // Video classes
  const videoClasses = cn(
    'w-full h-full object-cover transition-opacity duration-300',
    isLoading && 'opacity-0',
    !isLoading && 'opacity-100'
  );

  // Loading component
  const LoadingComponent = () => {
    if (loadingComponent) return loadingComponent;

    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-3 border-white/30 border-t-white animate-spin rounded-full" />
          <span className="text-sm text-white/80">Loading video...</span>
        </div>
      </div>
    );
  };

  // Error component
  const ErrorComponent = () => {
    if (errorComponent) return errorComponent;

    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
        <div className="flex flex-col items-center space-y-3 text-center p-6">
          <svg
            className="w-12 h-12 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Video Error</h3>
            <p className="text-sm text-white/70">{errorMessage}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      style={getResponsiveHeight()}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        title={title}
        className={videoClasses}
        autoPlay={getResponsiveAutoPlay()}
        muted={muted}
        loop={loop}
        controls={getResponsiveControls()}
        preload={preload}
        onLoadStart={handleLoadStart}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        onError={handleError}
        playsInline
      />

      {/* Loading State */}
      {showLoadingState && isLoading && <LoadingComponent />}

      {/* Error State */}
      {hasError && <ErrorComponent />}

      {/* Custom Overlay */}
      {overlayComponent && (
        <div className="absolute inset-0 pointer-events-none">
          {overlayComponent}
        </div>
      )}
    </div>
  );
}

// Specialized responsive video components

export function ResponsiveHeroVideo({
  src,
  poster,
  className,
  ...props
}: Omit<ResponsiveVideoPlayerProps, 'aspectRatio' | 'responsive'>) {
  return (
    <ResponsiveVideoPlayer
      src={src}
      poster={poster}
      className={className}
      aspectRatio="wide"
      responsive={{
        mobile: {
          height: '60vh',
          controls: false,
          autoPlay: false,
        },
        tablet: {
          height: '70vh',
          controls: true,
        },
        desktop: {
          height: '80vh',
          controls: true,
        },
      }}
      {...props}
    />
  );
}

export function ResponsiveTrailerVideo({
  src,
  poster,
  className,
  ...props
}: Omit<ResponsiveVideoPlayerProps, 'responsive'>) {
  return (
    <ResponsiveVideoPlayer
      src={src}
      poster={poster}
      className={className}
      responsive={{
        mobile: {
          controls: true,
          autoPlay: false,
        },
        tablet: {
          controls: true,
        },
        desktop: {
          controls: true,
        },
      }}
      {...props}
    />
  );
}

export function ResponsivePreviewVideo({
  src,
  poster,
  className,
  ...props
}: Omit<ResponsiveVideoPlayerProps, 'controls' | 'responsive'>) {
  return (
    <ResponsiveVideoPlayer
      src={src}
      poster={poster}
      className={className}
      responsive={{
        mobile: {
          controls: false,
          autoPlay: true,
        },
        tablet: {
          controls: false,
          autoPlay: true,
        },
        desktop: {
          controls: false,
          autoPlay: true,
        },
      }}
      muted={true}
      loop={true}
      {...props}
    />
  );
}