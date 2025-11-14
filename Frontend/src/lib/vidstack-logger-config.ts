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
 * @returns 'warn' for development (reduces noise while keeping important messages)
 *          'error' for production (minimal logging for performance)
 * 
 * Development: 'warn' level suppresses verbose info logs that trigger
 * state serialization errors while maintaining visibility of warnings and errors.
 * 
 * Production: 'error' level minimizes logging overhead and only shows
 * critical issues that need attention.
 */
export function getVidstackLogLevel(): VidstackLogLevel {
  const isDevelopment = process.env.NODE_ENV === 'development';
  return isDevelopment ? 'warn' : 'error';
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
