'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getResponsiveImageSizes } from '@/utils/responsive';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  aspectRatio?: 'video' | 'square' | 'portrait' | 'wide' | 'auto';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  showLoadingState?: boolean;
  loadingClassName?: string;
  errorClassName?: string;
  containerClassName?: string;
  responsive?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
    large?: string;
  };
}

export function ResponsiveImage({
  src,
  alt,
  className,
  priority = false,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  fill = false,
  width,
  height,
  aspectRatio = 'auto',
  objectFit = 'cover',
  loading = 'lazy',
  onLoad,
  onError,
  fallbackSrc,
  showLoadingState = true,
  loadingClassName,
  errorClassName,
  containerClassName,
  responsive,
}: ResponsiveImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Generate responsive sizes if not provided
  const imageSizes = sizes || (responsive ? 
    getResponsiveImageSizes(
      responsive.mobile || '100vw',
      responsive.tablet || '50vw', 
      responsive.desktop || '33vw',
      responsive.large || '25vw'
    ) : 
    getResponsiveImageSizes()
  );

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  // Handle image error with fallback
  const handleError = useCallback(() => {
    setIsLoading(false);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }
    setHasError(true);
    onError?.();
  }, [fallbackSrc, currentSrc, onError]);

  // Get aspect ratio classes
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'video':
        return 'aspect-video';
      case 'square':
        return 'aspect-square';
      case 'portrait':
        return 'aspect-[3/4]';
      case 'wide':
        return 'aspect-[21/9]';
      default:
        return '';
    }
  };

  // Container classes
  const containerClasses = cn(
    'relative overflow-hidden',
    getAspectRatioClass(),
    containerClassName
  );

  // Image classes
  const imageClasses = cn(
    'transition-all duration-300',
    fill ? 'object-cover' : `object-${objectFit}`,
    !fill && 'w-full h-full',
    isLoading && 'opacity-0',
    !isLoading && 'opacity-100',
    className
  );

  // Loading state classes
  const loadingClasses = cn(
    'absolute inset-0 flex items-center justify-center bg-gray-800/50 backdrop-blur-sm',
    'transition-opacity duration-300',
    isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none',
    loadingClassName
  );

  // Error state classes
  const errorClasses = cn(
    'absolute inset-0 flex flex-col items-center justify-center bg-gray-800/80 text-white',
    'transition-opacity duration-300',
    hasError ? 'opacity-100' : 'opacity-0 pointer-events-none',
    errorClassName
  );

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className={loadingClasses}>
      <div className="flex flex-col items-center space-y-2">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white animate-spin rounded-full" />
        <span className="text-xs text-white/70">Loading...</span>
      </div>
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div className={errorClasses}>
      <div className="flex flex-col items-center space-y-2 text-center p-4">
        <svg 
          className="w-8 h-8 text-white/50" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
          />
        </svg>
        <span className="text-xs text-white/70">Failed to load image</span>
      </div>
    </div>
  );

  return (
    <div className={containerClasses}>
      <Image
        src={currentSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={imageSizes}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        loading={loading}
        className={imageClasses}
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {showLoadingState && <LoadingSkeleton />}
      <ErrorState />
    </div>
  );
}

// Specialized responsive image components for common use cases

export function MoviePosterImage({
  src,
  alt,
  className,
  priority = false,
  ...props
}: Omit<ResponsiveImageProps, 'aspectRatio' | 'sizes'>) {
  return (
    <ResponsiveImage
      src={src}
      alt={alt}
      className={className}
      priority={priority}
      aspectRatio="portrait"
      fill={true}
      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
      {...props}
    />
  );
}

export function MovieThumbnailImage({
  src,
  alt,
  className,
  priority = false,
  ...props
}: Omit<ResponsiveImageProps, 'aspectRatio' | 'sizes'>) {
  return (
    <ResponsiveImage
      src={src}
      alt={alt}
      className={className}
      priority={priority}
      aspectRatio="video"
      fill={true}
      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
      {...props}
    />
  );
}

export function HeroImage({
  src,
  alt,
  className,
  priority = true,
  ...props
}: Omit<ResponsiveImageProps, 'sizes'>) {
  return (
    <ResponsiveImage
      src={src}
      alt={alt}
      className={className}
      priority={priority}
      fill={true}
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 60vw, 50vw"
      {...props}
    />
  );
}

export function ProfileImage({
  src,
  alt,
  className,
  ...props
}: Omit<ResponsiveImageProps, 'aspectRatio' | 'sizes'>) {
  return (
    <ResponsiveImage
      src={src}
      alt={alt}
      className={className}
      aspectRatio="square"
      fill={true}
      sizes="(max-width: 640px) 20vw, (max-width: 768px) 15vw, 10vw"
      {...props}
    />
  );
}