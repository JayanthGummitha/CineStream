/**
 * Unit tests for Vidstack logger configuration utility
 * Tests log level determination and configuration based on environment
 * Requirements: 1.4, 2.2, 3.3
 */

import {
  getVidstackLogLevel,
  getVidstackLoggerConfig,
  VidstackLogLevel,
  VidstackLoggerConfig
} from '../vidstack-logger-config';

describe('Vidstack Logger Configuration', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    // Restore original NODE_ENV after each test
    process.env.NODE_ENV = originalEnv;
  });

  describe('getVidstackLogLevel', () => {
    it('should return "warn" in development environment', () => {
      process.env.NODE_ENV = 'development';
      
      const result = getVidstackLogLevel();
      
      expect(result).toBe('warn');
    });

    it('should return "error" in production environment', () => {
      process.env.NODE_ENV = 'production';
      
      const result = getVidstackLogLevel();
      
      expect(result).toBe('error');
    });

    it('should return "error" for test environment', () => {
      process.env.NODE_ENV = 'test';
      
      const result = getVidstackLogLevel();
      
      expect(result).toBe('error');
    });

    it('should return "error" when NODE_ENV is undefined', () => {
      process.env.NODE_ENV = undefined;
      
      const result = getVidstackLogLevel();
      
      expect(result).toBe('error');
    });

    it('should return "error" for any non-development environment', () => {
      const environments = ['staging', 'qa', 'preview', ''];
      
      environments.forEach(env => {
        process.env.NODE_ENV = env;
        const result = getVidstackLogLevel();
        expect(result).toBe('error');
      });
    });

    it('should return a valid VidstackLogLevel type', () => {
      process.env.NODE_ENV = 'development';
      
      const result = getVidstackLogLevel();
      const validLevels: VidstackLogLevel[] = ['silent', 'error', 'warn', 'info'];
      
      expect(validLevels).toContain(result);
    });
  });

  describe('getVidstackLoggerConfig', () => {
    it('should return complete configuration for development environment', () => {
      process.env.NODE_ENV = 'development';
      
      const result = getVidstackLoggerConfig();
      
      expect(result).toEqual({
        logLevel: 'warn',
        isDevelopment: true
      });
    });

    it('should return complete configuration for production environment', () => {
      process.env.NODE_ENV = 'production';
      
      const result = getVidstackLoggerConfig();
      
      expect(result).toEqual({
        logLevel: 'error',
        isDevelopment: false
      });
    });

    it('should return configuration with isDevelopment false for test environment', () => {
      process.env.NODE_ENV = 'test';
      
      const result = getVidstackLoggerConfig();
      
      expect(result.isDevelopment).toBe(false);
      expect(result.logLevel).toBe('error');
    });

    it('should return configuration object with correct structure', () => {
      process.env.NODE_ENV = 'development';
      
      const result = getVidstackLoggerConfig();
      
      expect(result).toHaveProperty('logLevel');
      expect(result).toHaveProperty('isDevelopment');
      expect(typeof result.logLevel).toBe('string');
      expect(typeof result.isDevelopment).toBe('boolean');
    });

    it('should return configuration matching VidstackLoggerConfig interface', () => {
      process.env.NODE_ENV = 'production';
      
      const result: VidstackLoggerConfig = getVidstackLoggerConfig();
      
      expect(result.logLevel).toBeDefined();
      expect(result.isDevelopment).toBeDefined();
    });

    it('should use getVidstackLogLevel internally for logLevel', () => {
      process.env.NODE_ENV = 'development';
      
      const directLogLevel = getVidstackLogLevel();
      const configLogLevel = getVidstackLoggerConfig().logLevel;
      
      expect(configLogLevel).toBe(directLogLevel);
    });
  });

  describe('Environment Detection Consistency', () => {
    it('should maintain consistent environment detection across both functions', () => {
      const environments = ['development', 'production', 'test', 'staging'];
      
      environments.forEach(env => {
        process.env.NODE_ENV = env;
        
        const logLevel = getVidstackLogLevel();
        const config = getVidstackLoggerConfig();
        
        // Both should agree on whether it's development
        const expectedIsDevelopment = env === 'development';
        expect(config.isDevelopment).toBe(expectedIsDevelopment);
        
        // Log level should match expected value
        const expectedLogLevel = expectedIsDevelopment ? 'warn' : 'error';
        expect(logLevel).toBe(expectedLogLevel);
        expect(config.logLevel).toBe(expectedLogLevel);
      });
    });

    it('should handle rapid environment changes', () => {
      // Simulate rapid environment switches
      process.env.NODE_ENV = 'development';
      let result1 = getVidstackLogLevel();
      expect(result1).toBe('warn');
      
      process.env.NODE_ENV = 'production';
      let result2 = getVidstackLogLevel();
      expect(result2).toBe('error');
      
      process.env.NODE_ENV = 'development';
      let result3 = getVidstackLogLevel();
      expect(result3).toBe('warn');
    });
  });

  describe('Type Safety', () => {
    it('should return type-safe log level values', () => {
      process.env.NODE_ENV = 'development';
      const level: VidstackLogLevel = getVidstackLogLevel();
      expect(level).toBe('warn');
    });

    it('should return type-safe configuration object', () => {
      process.env.NODE_ENV = 'production';
      const config: VidstackLoggerConfig = getVidstackLoggerConfig();
      expect(config.logLevel).toBe('error');
      expect(config.isDevelopment).toBe(false);
    });
  });
});
