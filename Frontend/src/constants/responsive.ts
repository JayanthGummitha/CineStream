/**
 * Responsive Design Constants
 * Centralized configuration for responsive behavior
 */

// Breakpoint definitions (must match CSS breakpoints)
export const RESPONSIVE_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Container max-widths
export const CONTAINER_MAX_WIDTHS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  max: 1920, // Ultra-wide prevention
} as const;

// Grid column configurations for different content types
export const GRID_CONFIGURATIONS = {
  movieCards: {
    mobile: 1,
    tablet: 2,
    laptop: 3,
    desktop: 4,
    ultrawide: 5,
  },
  movieCardsCompact: {
    mobile: 2,
    tablet: 3,
    laptop: 4,
    desktop: 5,
    ultrawide: 6,
  },
  featuredContent: {
    mobile: 1,
    tablet: 2,
    laptop: 3,
    desktop: 4,
    ultrawide: 4,
  },
} as const;

// Typography scale configurations
export const TYPOGRAPHY_SCALES = {
  hero: {
    mobile: 'text-2xl',
    tablet: 'text-3xl',
    laptop: 'text-4xl',
    desktop: 'text-5xl',
    ultrawide: 'text-6xl',
  },
  section: {
    mobile: 'text-xl',
    tablet: 'text-2xl',
    laptop: 'text-3xl',
    desktop: 'text-4xl',
    ultrawide: 'text-5xl',
  },
  body: {
    mobile: 'text-sm',
    tablet: 'text-base',
    laptop: 'text-lg',
    desktop: 'text-xl',
    ultrawide: 'text-xl',
  },
  caption: {
    mobile: 'text-xs',
    tablet: 'text-sm',
    laptop: 'text-base',
    desktop: 'text-base',
    ultrawide: 'text-base',
  },
} as const;

// Spacing configurations
export const SPACING_SCALES = {
  section: {
    mobile: 'py-8',
    tablet: 'py-12',
    laptop: 'py-16',
    desktop: 'py-20',
    ultrawide: 'py-24',
  },
  component: {
    mobile: 'py-4',
    tablet: 'py-6',
    laptop: 'py-8',
    desktop: 'py-10',
    ultrawide: 'py-12',
  },
  container: {
    mobile: 'px-4',
    tablet: 'px-6',
    laptop: 'px-8',
    desktop: 'px-12',
    ultrawide: 'px-16',
  },
} as const;

// Touch target sizes (minimum 44px for accessibility)
export const TOUCH_TARGETS = {
  minimum: 44,
  comfortable: 48,
  large: 56,
} as const;

// Hero section heights
export const HERO_HEIGHTS = {
  mobile: '60vh',
  tablet: '70vh',
  laptop: '80vh',
  desktop: '90vh',
  ultrawide: '100vh',
} as const;

// Form element sizes
export const FORM_SIZES = {
  input: {
    mobile: 'h-10',
    tablet: 'h-11',
    laptop: 'h-12',
    desktop: 'h-11',
    ultrawide: 'h-12',
  },
  button: {
    mobile: 'h-10',
    tablet: 'h-11',
    laptop: 'h-12',
    desktop: 'h-11',
    ultrawide: 'h-12',
  },
} as const;

// Media query strings for JavaScript usage
export const MEDIA_QUERIES = {
  sm: `(min-width: ${RESPONSIVE_BREAKPOINTS.sm}px)`,
  md: `(min-width: ${RESPONSIVE_BREAKPOINTS.md}px)`,
  lg: `(min-width: ${RESPONSIVE_BREAKPOINTS.lg}px)`,
  xl: `(min-width: ${RESPONSIVE_BREAKPOINTS.xl}px)`,
  '2xl': `(min-width: ${RESPONSIVE_BREAKPOINTS['2xl']}px)`,
  mobile: `(max-width: ${RESPONSIVE_BREAKPOINTS.md - 1}px)`,
  tablet: `(min-width: ${RESPONSIVE_BREAKPOINTS.md}px) and (max-width: ${RESPONSIVE_BREAKPOINTS.lg - 1}px)`,
  desktop: `(min-width: ${RESPONSIVE_BREAKPOINTS.lg}px)`,
} as const;

// Device type detection breakpoints
export const DEVICE_BREAKPOINTS = {
  mobile: RESPONSIVE_BREAKPOINTS.md - 1,
  tablet: RESPONSIVE_BREAKPOINTS.lg - 1,
  desktop: RESPONSIVE_BREAKPOINTS.lg,
} as const;

// Responsive image sizes for different content types
export const IMAGE_SIZES = {
  movieCard: {
    mobile: '100vw',
    tablet: '50vw',
    laptop: '33vw',
    desktop: '25vw',
    ultrawide: '20vw',
  },
  hero: {
    mobile: '100vw',
    tablet: '100vw',
    laptop: '60vw',
    desktop: '50vw',
    ultrawide: '40vw',
  },
  thumbnail: {
    mobile: '50vw',
    tablet: '33vw',
    laptop: '25vw',
    desktop: '20vw',
    ultrawide: '16vw',
  },
} as const;

// Animation durations based on screen size
export const ANIMATION_DURATIONS = {
  mobile: {
    fast: '0.2s',
    normal: '0.3s',
    slow: '0.4s',
  },
  desktop: {
    fast: '0.3s',
    normal: '0.5s',
    slow: '0.7s',
  },
} as const;

// Z-index scale for responsive overlays
export const Z_INDEX_SCALE = {
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
} as const;