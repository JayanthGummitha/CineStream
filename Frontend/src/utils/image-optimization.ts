/**
 * Image Optimization Utilities
 * Provides functions for responsive image handling and optimization
 */

import { RESPONSIVE_BREAKPOINTS } from '@/constants/responsive';

export interface ImageOptimizationConfig {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'auto';
  blur?: boolean;
  progressive?: boolean;
  sizes?: string;
  priority?: boolean;
}

export interface ResponsiveImageSizes {
  mobile: string;
  tablet: string;
  desktop: string;
  large: string;
}

/**
 * Generate responsive image sizes attribute
 */
export function generateResponsiveImageSizes(
  sizes: Partial<ResponsiveImageSizes> = {}
): string {
  const defaultSizes: ResponsiveImageSizes = {
    mobile: '100vw',
    tablet: '50vw',
    desktop: '33vw',
    large: '25vw',
    ...sizes,
  };

  return [
    `(max-width: ${RESPONSIVE_BREAKPOINTS.md - 1}px) ${defaultSizes.mobile}`,
    `(max-width: ${RESPONSIVE_BREAKPOINTS.lg - 1}px) ${defaultSizes.tablet}`,
    `(max-width: ${RESPONSIVE_BREAKPOINTS.xl - 1}px) ${defaultSizes.desktop}`,
    defaultSizes.large,
  ].join(', ');
}

/**
 * Generate optimized image URL with parameters
 */
export function generateOptimizedImageUrl(
  src: string,
  config: ImageOptimizationConfig = {}
): string {
  const {
    quality = 85,
    format = 'auto',
    blur = false,
    progressive = true,
  } = config;

  // If it's already an optimized URL or external URL, return as-is
  if (src.startsWith('http') || src.includes('/_next/image')) {
    return src;
  }

  // Build optimization parameters
  const params = new URLSearchParams();
  
  if (quality !== 85) {
    params.set('q', quality.toString());
  }
  
  if (format !== 'auto') {
    params.set('f', format);
  }
  
  if (blur) {
    params.set('blur', '20');
  }
  
  if (!progressive) {
    params.set('progressive', 'false');
  }

  const queryString = params.toString();
  return queryString ? `${src}?${queryString}` : src;
}

/**
 * Generate blur data URL for placeholder
 */
export function generateBlurDataUrl(
  width: number = 10,
  height: number = 10,
  color: string = '#1f2937'
): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
    </svg>
  `;
  
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Get responsive image sizes for different content types
 */
export const CONTENT_TYPE_SIZES = {
  movieCard: {
    mobile: '100vw',
    tablet: '50vw',
    desktop: '33vw',
    large: '25vw',
  },
  moviePoster: {
    mobile: '50vw',
    tablet: '33vw',
    desktop: '25vw',
    large: '20vw',
  },
  hero: {
    mobile: '100vw',
    tablet: '100vw',
    desktop: '60vw',
    large: '50vw',
  },
  thumbnail: {
    mobile: '50vw',
    tablet: '33vw',
    desktop: '25vw',
    large: '16vw',
  },
  profile: {
    mobile: '20vw',
    tablet: '15vw',
    desktop: '10vw',
    large: '8vw',
  },
  carousel: {
    mobile: '90vw',
    tablet: '30vw',
    desktop: '20vw',
    large: '16vw',
  },
} as const;

/**
 * Get image sizes for specific content type
 */
export function getContentTypeImageSizes(
  contentType: keyof typeof CONTENT_TYPE_SIZES
): string {
  return generateResponsiveImageSizes(CONTENT_TYPE_SIZES[contentType]);
}

/**
 * Detect image format support
 */
export function detectImageFormatSupport(): {
  webp: boolean;
  avif: boolean;
} {
  if (typeof window === 'undefined') {
    return { webp: false, avif: false };
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  return {
    webp: canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0,
    avif: canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0,
  };
}

/**
 * Get optimal image format based on browser support
 */
export function getOptimalImageFormat(): 'avif' | 'webp' | 'jpeg' {
  const support = detectImageFormatSupport();
  
  if (support.avif) return 'avif';
  if (support.webp) return 'webp';
  return 'jpeg';
}

/**
 * Calculate responsive image dimensions
 */
export function calculateResponsiveImageDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maintainAspectRatio: boolean = true
): { width: number; height: number } {
  if (!maintainAspectRatio) {
    return { width: maxWidth, height: originalHeight };
  }

  const aspectRatio = originalWidth / originalHeight;
  const width = Math.min(originalWidth, maxWidth);
  const height = width / aspectRatio;

  return { width: Math.round(width), height: Math.round(height) };
}

/**
 * Generate srcSet for responsive images
 */
export function generateResponsiveSrcSet(
  baseSrc: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1536],
  config: ImageOptimizationConfig = {}
): string {
  return widths
    .map(width => {
      const optimizedSrc = generateOptimizedImageUrl(baseSrc, {
        ...config,
        // Add width parameter if supported by your image service
      });
      return `${optimizedSrc} ${width}w`;
    })
    .join(', ');
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, priority: boolean = false): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    if (priority) {
      img.fetchPriority = 'high';
    }
    
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Lazy load images with intersection observer
 */
export function createImageLazyLoader(
  threshold: number = 0.1,
  rootMargin: string = '50px'
) {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
          }
        }
      });
    },
    { threshold, rootMargin }
  );
}

/**
 * Image error handling with fallbacks
 */
export function handleImageError(
  img: HTMLImageElement,
  fallbackSrc?: string,
  placeholderSrc?: string
): void {
  if (fallbackSrc && img.src !== fallbackSrc) {
    img.src = fallbackSrc;
    return;
  }
  
  if (placeholderSrc) {
    img.src = placeholderSrc;
    return;
  }
  
  // Generate a simple placeholder
  img.src = generateBlurDataUrl(300, 200, '#374151');
}

/**
 * Responsive image loading strategy
 */
export interface ResponsiveImageStrategy {
  sizes: string;
  srcSet?: string;
  loading: 'lazy' | 'eager';
  priority: boolean;
  quality: number;
  format: 'auto' | 'webp' | 'avif' | 'jpeg';
}

export function getResponsiveImageStrategy(
  contentType: keyof typeof CONTENT_TYPE_SIZES,
  isAboveFold: boolean = false,
  isHero: boolean = false
): ResponsiveImageStrategy {
  const sizes = getContentTypeImageSizes(contentType);
  const format = getOptimalImageFormat();
  
  return {
    sizes,
    loading: isAboveFold || isHero ? 'eager' : 'lazy',
    priority: isAboveFold || isHero,
    quality: isHero ? 95 : 85,
    format: format === 'jpeg' ? 'auto' : format,
  };
}