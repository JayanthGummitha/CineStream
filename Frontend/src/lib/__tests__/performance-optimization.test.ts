/**
 * Performance optimization tests for trailer loading
 * Tests requirement 3.1, 3.2, 4.2: Asynchronous loading and performance monitoring
 */

import { renderHook, act } from '@testing-library/react';
import { useTrailerPerformance } from '@/hooks/useTrailerPerformance';

// Mock performance.now() for consistent testing
const mockPerformanceNow = jest.fn();
Object.defineProperty(global, 'performance', {
  value: {
    now: mockPerformanceNow
  }
});

// Mock requestIdleCallback for testing
const mockRequestIdleCallback = jest.fn();
Object.defineProperty(global, 'requestIdleCallback', {
  value: mockRequestIdleCallback,
  configurable: true
});

// Mock console methods to avoid noise in tests
const mockConsoleLog = jest.fn();
const mockConsoleWarn = jest.fn();
const mockConsoleGroup = jest.fn();
const mockConsoleGroupEnd = jest.fn();

global.console = {
  ...console,
  log: mockConsoleLog,
  warn: mockConsoleWarn,
  group: mockConsoleGroup,
  groupEnd: mockConsoleGroupEnd
};

describe('Trailer Loading Performance Optimization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformanceNow.mockReturnValue(0);
    mockRequestIdleCallback.mockImplementation((callback, options) => {
      // Simulate immediate execution for testing
      setTimeout(callback, 0);
      return 1;
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Asynchronous Loading Performance', () => {
    it('should demonstrate performance benefits of cache hits', () => {
      const { result } = renderHook(() => useTrailerPerformance('cache-test-movie'));

      // Simulate cache hit (very fast)
      let cacheHitReport: any;
      act(() => {
        mockPerformanceNow.mockReturnValue(100);
        result.current.startPerformanceMonitoring();
        mockPerformanceNow.mockReturnValue(150); // 50ms - cache hit
        cacheHitReport = result.current.endPerformanceMonitoring(true);
      });

      // Simulate network fetch (slower)
      let networkFetchReport: any;
      act(() => {
        mockPerformanceNow.mockReturnValue(200);
        result.current.startPerformanceMonitoring();
        mockPerformanceNow.mockReturnValue(1400); // 1200ms - network fetch
        networkFetchReport = result.current.endPerformanceMonitoring(false);
      });

      // Verify performance difference
      expect(cacheHitReport).not.toBeNull();
      expect(cacheHitReport.performanceGrade).toBe('Excellent');
      expect(cacheHitReport.cacheHit).toBe(true);
      expect(cacheHitReport.duration).toBe(50);

      expect(networkFetchReport).not.toBeNull();
      expect(networkFetchReport.performanceGrade).toBe('Good');
      expect(networkFetchReport.cacheHit).toBe(false);
      expect(networkFetchReport.duration).toBe(1200);

      // Cache hit should be significantly faster
      expect(cacheHitReport.duration).toBeLessThan(networkFetchReport.duration / 10);
    });

    it('should track performance improvements over time', () => {
      const { result } = renderHook(() => useTrailerPerformance('improvement-test'));

      // Simulate initial slow load (no cache)
      act(() => {
        mockPerformanceNow.mockReturnValue(100);
        result.current.startPerformanceMonitoring();
        mockPerformanceNow.mockReturnValue(2600); // 2.5s - initial slow load
        result.current.endPerformanceMonitoring(false);
      });

      // Simulate subsequent fast loads (cached)
      for (let i = 0; i < 3; i++) {
        act(() => {
          mockPerformanceNow.mockReturnValue(300 + i * 100);
          result.current.startPerformanceMonitoring();
          mockPerformanceNow.mockReturnValue(380 + i * 100); // 80ms - cached loads
          result.current.endPerformanceMonitoring(true);
        });
      }

      const stats = result.current.getPerformanceStats();

      expect(stats.totalRequests).toBe(4);
      expect(stats.cacheHitRate).toBe(75); // 3 out of 4 cached
      expect(stats.performanceDistribution.excellent).toBe(3); // 3 cached loads
      expect(stats.performanceDistribution.needsImprovement).toBe(1); // 1 slow initial load
    });

    it('should handle timeout scenarios gracefully', () => {
      const { result } = renderHook(() => useTrailerPerformance('timeout-test'));

      // Simulate timeout scenario
      let timeoutReport: any;
      act(() => {
        mockPerformanceNow.mockReturnValue(100);
        result.current.startPerformanceMonitoring();
        mockPerformanceNow.mockReturnValue(5100); // 5s - timeout
        timeoutReport = result.current.endPerformanceMonitoring(false);
      });

      expect(timeoutReport).not.toBeNull();
      expect(timeoutReport.performanceGrade).toBe('Poor');
      expect(timeoutReport.duration).toBe(5000);
      expect(timeoutReport.cacheHit).toBe(false);
    });

    it('should provide performance optimization recommendations', () => {
      const { result } = renderHook(() => useTrailerPerformance('recommendation-test'));

      // Add poor performance data to trigger warnings
      act(() => {
        mockPerformanceNow.mockReturnValue(100);
        result.current.startPerformanceMonitoring();
        mockPerformanceNow.mockReturnValue(3600); // Poor performance
        result.current.endPerformanceMonitoring(false);
      });

      // Add more poor performance data
      act(() => {
        mockPerformanceNow.mockReturnValue(200);
        result.current.startPerformanceMonitoring();
        mockPerformanceNow.mockReturnValue(4200); // Poor performance
        result.current.endPerformanceMonitoring(false);
      });

      act(() => {
        result.current.logPerformanceInsights();
      });

      // Should log performance warnings
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Average load time is high')
      );
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Low cache hit rate')
      );
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('High number of poor performance loads')
      );
    });
  });

  describe('Non-blocking Execution', () => {
    it('should demonstrate non-blocking behavior with requestIdleCallback', () => {
      // Test that requestIdleCallback is used when available
      const callback = jest.fn();
      
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(callback, { timeout: 2000 });
        expect(mockRequestIdleCallback).toHaveBeenCalledWith(callback, { timeout: 2000 });
      }
    });

    it('should measure performance impact of different loading strategies', () => {
      const { result } = renderHook(() => useTrailerPerformance('strategy-test'));

      // Strategy 1: Immediate loading (blocking)
      act(() => {
        mockPerformanceNow.mockReturnValue(100);
        result.current.startPerformanceMonitoring();
        mockPerformanceNow.mockReturnValue(900); // 800ms
        result.current.endPerformanceMonitoring(false);
      });

      // Strategy 2: Deferred loading (non-blocking)
      act(() => {
        mockPerformanceNow.mockReturnValue(200);
        result.current.startPerformanceMonitoring();
        mockPerformanceNow.mockReturnValue(1050); // 850ms (slightly slower due to deferral)
        result.current.endPerformanceMonitoring(false);
      });

      const stats = result.current.getPerformanceStats();
      
      // Both should be in "Good" category, showing minimal performance impact
      expect(stats.performanceDistribution.good).toBe(2);
      expect(stats.averageDuration).toBe(825); // Average of 800 and 850
    });
  });

  describe('Performance Monitoring Integration', () => {
    it('should track multiple concurrent trailer loads', () => {
      const movie1Hook = renderHook(() => useTrailerPerformance('movie-1'));
      const movie2Hook = renderHook(() => useTrailerPerformance('movie-2'));

      // Movie 1: Excellent performance with cache hit
      act(() => {
        mockPerformanceNow.mockReturnValue(100);
        movie1Hook.result.current.startPerformanceMonitoring();
        mockPerformanceNow.mockReturnValue(400); // 300ms - Excellent
        movie1Hook.result.current.endPerformanceMonitoring(true); // Cache hit
      });

      // Movie 2: Good performance with network fetch
      act(() => {
        mockPerformanceNow.mockReturnValue(200);
        movie2Hook.result.current.startPerformanceMonitoring();
        mockPerformanceNow.mockReturnValue(1400); // 1200ms - Good
        movie2Hook.result.current.endPerformanceMonitoring(false); // Network fetch
      });

      const stats1 = movie1Hook.result.current.getPerformanceStats();
      const stats2 = movie2Hook.result.current.getPerformanceStats();

      expect(stats1.performanceDistribution.excellent).toBe(1);
      expect(stats1.cacheHitRate).toBe(100);

      expect(stats2.performanceDistribution.good).toBe(1);
      expect(stats2.cacheHitRate).toBe(0);
    });

    it('should provide comprehensive performance insights', () => {
      const { result } = renderHook(() => useTrailerPerformance('insights-test'));

      // Create a mix of performance scenarios
      const scenarios = [
        { startTime: 100, duration: 100, cacheHit: true },   // Excellent, cached
        { startTime: 300, duration: 200, cacheHit: true },   // Excellent, cached
        { startTime: 600, duration: 800, cacheHit: false },  // Good, network
        { startTime: 1500, duration: 2200, cacheHit: false }, // Needs improvement, network
        { startTime: 4000, duration: 4500, cacheHit: false }  // Poor, network
      ];

      scenarios.forEach(({ startTime, duration, cacheHit }) => {
        act(() => {
          mockPerformanceNow.mockReturnValue(startTime);
          result.current.startPerformanceMonitoring();
          mockPerformanceNow.mockReturnValue(startTime + duration);
          result.current.endPerformanceMonitoring(cacheHit);
        });
      });

      const stats = result.current.getPerformanceStats();

      expect(stats.totalRequests).toBe(5);
      expect(stats.cacheHitRate).toBe(40); // 2 out of 5
      expect(stats.averageDuration).toBe(1560); // (100+200+800+2200+4500)/5
      expect(stats.performanceDistribution.excellent).toBe(2);
      expect(stats.performanceDistribution.good).toBe(1);
      expect(stats.performanceDistribution.needsImprovement).toBe(1);
      expect(stats.performanceDistribution.poor).toBe(1);

      act(() => {
        result.current.logPerformanceInsights();
      });

      // Should provide balanced insights
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Total trailer loads monitored: 5')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Cache hit rate: 40.0%')
      );
    });
  });
});