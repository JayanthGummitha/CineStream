'use client';

import { cn } from '@/lib/utils';
import { getCurrentBreakpoint } from '@/utils/responsive';
import { useEffect, useState } from 'react';

interface ResponsiveSkeletonProps {
  className?: string;
  aspectRatio?: 'video' | 'square' | 'portrait' | 'wide' | 'auto' | 'cinema';
  variant?: 'default' | 'shimmer' | 'pulse' | 'wave';
  rounded?: boolean;
  children?: React.ReactNode;
  responsive?: {
    mobile?: {
      height?: string;
      rounded?: boolean;
    };
    tablet?: {
      height?: string;
      rounded?: boolean;
    };
    desktop?: {
      height?: string;
      rounded?: boolean;
    };
  };
}

export function ResponsiveSkeleton({
  className,
  aspectRatio = 'auto',
  variant = 'shimmer',
  rounded = true,
  children,
  responsive,
}: ResponsiveSkeletonProps) {
  const [currentBreakpoint, setCurrentBreakpoint] = useState(getCurrentBreakpoint());

  useEffect(() => {
    const handleResize = () => {
      setCurrentBreakpoint(getCurrentBreakpoint());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get responsive configuration
  const getResponsiveConfig = () => {
    if (!responsive) return {};

    if (currentBreakpoint === 'sm' && responsive.mobile) {
      return responsive.mobile;
    }
    if ((currentBreakpoint === 'md' || currentBreakpoint === 'lg') && responsive.tablet) {
      return responsive.tablet;
    }
    if (currentBreakpoint === 'xl' || currentBreakpoint === '2xl') {
      return responsive.desktop || {};
    }

    return {};
  };

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

  // Get animation classes based on variant
  const getAnimationClass = () => {
    switch (variant) {
      case 'shimmer':
        return 'animate-shimmer';
      case 'pulse':
        return 'animate-pulse';
      case 'wave':
        return 'animate-wave';
      default:
        return 'animate-pulse';
    }
  };

  const config = getResponsiveConfig();
  const isRounded = config.rounded !== undefined ? config.rounded : rounded;

  const skeletonClasses = cn(
    'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%]',
    getAspectRatioClass(),
    getAnimationClass(),
    isRounded && 'rounded-lg',
    className
  );

  const style = config.height ? { height: config.height } : {};

  return (
    <div className={skeletonClasses} style={style}>
      {children}
    </div>
  );
}

// Specialized skeleton components

export function MovieCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      <ResponsiveSkeleton
        aspectRatio="video"
        variant="shimmer"
        responsive={{
          mobile: { rounded: true },
          tablet: { rounded: true },
          desktop: { rounded: true },
        }}
      />
      <div className="space-y-2">
        <ResponsiveSkeleton 
          className="h-4 w-3/4" 
          variant="pulse"
          responsive={{
            mobile: { height: '0.875rem' },
            tablet: { height: '1rem' },
            desktop: { height: '1.125rem' },
          }}
        />
        <ResponsiveSkeleton 
          className="h-3 w-1/2" 
          variant="pulse"
          responsive={{
            mobile: { height: '0.75rem' },
            tablet: { height: '0.875rem' },
            desktop: { height: '1rem' },
          }}
        />
      </div>
    </div>
  );
}

export function HeroSkeleton({ className }: { className?: string }) {
  return (
    <ResponsiveSkeleton
      className={className}
      aspectRatio="wide"
      variant="shimmer"
      responsive={{
        mobile: { height: '60vh' },
        tablet: { height: '70vh' },
        desktop: { height: '80vh' },
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="space-y-4 text-center max-w-md">
          <ResponsiveSkeleton className="h-8 w-64 mx-auto" variant="pulse" />
          <ResponsiveSkeleton className="h-4 w-48 mx-auto" variant="pulse" />
          <ResponsiveSkeleton className="h-10 w-32 mx-auto rounded-full" variant="pulse" />
        </div>
      </div>
    </ResponsiveSkeleton>
  );
}

export function VideoPlayerSkeleton({ 
  className,
  aspectRatio = 'video' 
}: { 
  className?: string;
  aspectRatio?: 'video' | 'wide' | 'cinema';
}) {
  return (
    <ResponsiveSkeleton
      className={className}
      aspectRatio={aspectRatio}
      variant="shimmer"
      responsive={{
        mobile: { rounded: true },
        tablet: { rounded: true },
        desktop: { rounded: true },
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
          <div className="w-0 h-0 border-l-[12px] border-l-white/60 border-y-[8px] border-y-transparent ml-1" />
        </div>
      </div>
    </ResponsiveSkeleton>
  );
}

export function ThumbnailSkeleton({ className }: { className?: string }) {
  return (
    <ResponsiveSkeleton
      className={className}
      aspectRatio="video"
      variant="pulse"
      responsive={{
        mobile: { height: '60px' },
        tablet: { height: '75px' },
        desktop: { height: '90px' },
      }}
    />
  );
}

export function ProfileImageSkeleton({ className }: { className?: string }) {
  return (
    <ResponsiveSkeleton
      className={className}
      aspectRatio="square"
      variant="pulse"
      responsive={{
        mobile: { height: '40px' },
        tablet: { height: '48px' },
        desktop: { height: '56px' },
      }}
    />
  );
}