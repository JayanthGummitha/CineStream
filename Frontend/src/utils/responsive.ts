/**
 * Responsive Design Utilities
 * Provides helper functions and constants for responsive behavior
 */

// Breakpoint constants matching CSS breakpoints
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Get current breakpoint based on window width
 */
export function getCurrentBreakpoint(): Breakpoint {
  if (typeof window === 'undefined') return 'lg'; // Default for SSR
  
  const width = window.innerWidth;
  
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  
  return 'sm'; // Default to smallest breakpoint
}

/**
 * Check if current viewport matches or exceeds a breakpoint
 */
export function isBreakpointUp(breakpoint: Breakpoint): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS[breakpoint];
}

/**
 * Check if current viewport is below a breakpoint
 */
export function isBreakpointDown(breakpoint: Breakpoint): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < BREAKPOINTS[breakpoint];
}

/**
 * Check if viewport is mobile (below md breakpoint)
 */
export function isMobile(): boolean {
  return isBreakpointDown('md');
}

/**
 * Check if viewport is tablet (md to lg)
 */
export function isTablet(): boolean {
  if (typeof window === 'undefined') return false;
  const width = window.innerWidth;
  return width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
}

/**
 * Check if viewport is desktop (lg and above)
 */
export function isDesktop(): boolean {
  return isBreakpointUp('lg');
}

/**
 * Get responsive grid columns based on breakpoint
 */
export function getResponsiveColumns(
  mobile: number = 1,
  tablet: number = 2,
  desktop: number = 4,
  large: number = 5,
  ultrawide: number = 6
): number {
  const breakpoint = getCurrentBreakpoint();
  
  switch (breakpoint) {
    case '2xl':
      return ultrawide;
    case 'xl':
      return large;
    case 'lg':
      return desktop;
    case 'md':
      return tablet;
    default:
      return mobile;
  }
}

/**
 * Get responsive container padding
 */
export function getResponsivePadding(): string {
  const breakpoint = getCurrentBreakpoint();
  
  const paddingMap: Record<Breakpoint, string> = {
    sm: 'px-4',
    md: 'px-6',
    lg: 'px-8',
    xl: 'px-12',
    '2xl': 'px-16',
  };
  
  return paddingMap[breakpoint] || 'px-4';
}

/**
 * Get responsive text size class
 */
export function getResponsiveTextSize(
  baseSize: 'sm' | 'base' | 'lg' | 'xl' | '2xl' = 'base'
): string {
  const sizeMap = {
    sm: 'text-xs sm:text-sm md:text-base',
    base: 'text-sm sm:text-base md:text-lg',
    lg: 'text-base sm:text-lg md:text-xl lg:text-2xl',
    xl: 'text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl',
    '2xl': 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl',
  };
  
  return sizeMap[baseSize];
}

/**
 * Create responsive class string based on breakpoint values
 */
export function createResponsiveClasses(
  classes: Partial<Record<Breakpoint | 'base', string>>
): string {
  const { base = '', sm = '', md = '', lg = '', xl = '', '2xl': xl2 = '' } = classes;
  
  const responsiveClasses = [
    base,
    sm && `sm:${sm}`,
    md && `md:${md}`,
    lg && `lg:${lg}`,
    xl && `xl:${xl}`,
    xl2 && `2xl:${xl2}`,
  ].filter(Boolean);
  
  return responsiveClasses.join(' ');
}

/**
 * Hook for responsive behavior (React hook)
 */
export function useResponsive() {
  if (typeof window === 'undefined') {
    return {
      breakpoint: 'lg' as Breakpoint,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    };
  }
  
  return {
    breakpoint: getCurrentBreakpoint(),
    isMobile: isMobile(),
    isTablet: isTablet(),
    isDesktop: isDesktop(),
  };
}

/**
 * Responsive image sizes attribute generator
 */
export function getResponsiveImageSizes(
  mobile: string = '100vw',
  tablet: string = '50vw',
  desktop: string = '33vw',
  large: string = '25vw'
): string {
  return [
    `(max-width: ${BREAKPOINTS.md - 1}px) ${mobile}`,
    `(max-width: ${BREAKPOINTS.lg - 1}px) ${tablet}`,
    `(max-width: ${BREAKPOINTS.xl - 1}px) ${desktop}`,
    large,
  ].join(', ');
}

/**
 * Generate responsive container class names
 */
export function getResponsiveContainer(
  type: 'default' | 'tight' | 'wide' = 'default'
): string {
  const containerMap = {
    default: 'responsive-container',
    tight: 'responsive-container-tight',
    wide: 'responsive-container-wide',
  };
  
  return containerMap[type];
}