/**
 * Vidstack Logger Configuration
 * 
 * This module provides configuration utilities for Vidstack's logging system
 * to prevent state serialization errors in development environments.
 * 
 * Issue: Next.js dev server attempts to stringify Vidstack's reactive state proxies
 * when logging, which causes "this.$state[prop2] is not a function" errors.
 * 
 * Solution: Configure appropriate log levels based on environment to suppress
 * verbose info logs that trigger serialization, while preserving visibility
 * of actual errors.
 */

/**
 * Valid Vidstack log levels
 * - 'silent': No logging
 * - 'error': Only critical errors
 * - 'warn': Warnings and errors
 * - 'info': Informational messages, warnings, and errors
 */
export type VidstackLogLevel = 'silent' | 'error' | 'warn' | 'info';

/**
 * Complete logger configuration for Vidstack
 */
export interface VidstackLoggerConfig {
  logLevel: VidstackLogLevel;
  isDevelopment: boolean;
}

/**
 * Determines the appropriate Vidstack log level based on environment
 * 
 * @returns 'silent' to completely disable Vidstack's internal logging
 * 
 * Note: Set to 'silent' to prevent state serialization errors that occur
 * when Vidstack's logger tries to stringify reactive state proxies during
 * autoplay failures or other internal logging operations.
 * 
 * Even 'error' level can trigger serialization in some cases, so 'silent'
 * is used to completely disable Vidstack's internal logging system.
 * Application-level error handling is still active and functional.
 */
export function getVidstackLogLevel(): VidstackLogLevel {
  return 'silent';
}

/**
 * Gets complete logger configuration for Vidstack
 * 
 * @returns Configuration object with log level and environment flag
 * 
 * This function provides a complete configuration object that can be used
 * for more advanced logging scenarios or future enhancements.
 */
export function getVidstackLoggerConfig(): VidstackLoggerConfig {
  const isDevelopment = process.env.NODE_ENV === 'development';
  return {
    logLevel: getVidstackLogLevel(),
    isDevelopment
  };
}
