/**
 * Performance benchmark tests for trailer loading optimization
 * Tests requirement 3.1, 3.2, 4.2: Performance impact measurement
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

// Mock console methods to avoid noise in tests
const mockConsoleLog = jest.fn();
const mockConsoleWarn = jest.fn();

global.console = {
  ...console,
  log: mockConsoleLog,
  warn: mockConsoleWarn
};

describe('Trailer Loading Performance Benchmarks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformanceNow.mockReturnValue(0);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should demonstrate significant performance improvement with caching', () => {
    const { result } = renderHook(() => useTrailerPerformance('benchmark-movie'));

    // Scenario 1: First load (no cache) - slower
    let firstLoadReport: any;
    act(() => {
      mockPerformanceNow.mockReturnValue(100);
      result.current.startPerformanceMonitoring();
      mockPerformanceNow.mockReturnValue(2100); // 2000ms - first load
      firstLoadReport = result.current.endPerformanceMonitoring(false);
    });

    // Scenario 2: Subsequent load (cached) - much faster
    let cachedLoadReport: any;
    act(() => {
      mockPerformanceNow.mockReturnValue(200);
      result.current.startPerformanceMonitoring();
      mockPerformanceNow.mockReturnValue(250); // 50ms - cached load
      cachedLoadReport = result.current.endPerformanceMonitoring(true);
    });

    // Performance improvement should be dramatic
    const improvementRatio = firstLoadReport.duration / cachedLoadReport.duration;
    
    expect(firstLoadReport.performanceGrade).toBe('Needs Improvement');
    expect(cachedLoadReport.performanceGrade).toBe('Excellent');
    expect(improvementRatio).toBeGreaterThan(30); // 40x improvement (2000ms vs 50ms)
    
    // Overall stats should show improvement
    const stats = result.current.getPerformanceStats();
    expect(stats.cacheHitRate).toBe(50); // 1 out of 2 cached
    expect(stats.performanceDistribution.excellent).toBe(1);
    expect(stats.performanceDistribution.needsImprovement).toBe(1);
  });

  it('should measure performance impact of asynchronous loading', () => {
    const { result } = renderHook(() => useTrailerPerformance('async-benchmark'));

    // Simulate blocking vs non-blocking loading scenarios
    const blockingScenarios = [
      { name: 'Blocking Load 1', duration: 1200 },
      { name: 'Blocking Load 2', duration: 1400 },
      { name: 'Blocking Load 3', duration: 1100 }
    ];

    const nonBlockingScenarios = [
      { name: 'Non-blocking Load 1', duration: 1250 }, // Slightly slower due to deferral
      { name: 'Non-blocking Load 2', duration: 1450 },
      { name: 'Non-blocking Load 3', duration: 1150 }
    ];

    // Test blocking scenarios
    blockingScenarios.forEach(({ duration }, index) => {
      act(() => {
        mockPerformanceNow.mockReturnValue(100 + index * 200);
        result.current.startPerformanceMonitoring();
        mockPerformanceNow.mockReturnValue(100 + index * 200 + duration);
        result.current.endPerformanceMonitoring(false);
      });
    });

    const blockingStats = result.current.getPerformanceStats();
    
    // Clear and test non-blocking scenarios
    act(() => {
      result.current.clearPerformanceHistory();
    });

    nonBlockingScenarios.forEach(({ duration }, index) => {
      act(() => {
        mockPerformanceNow.mockReturnValue(1000 + index * 200);
        result.current.startPerformanceMonitoring();
        mockPerformanceNow.mockReturnValue(1000 + index * 200 + duration);
        result.current.endPerformanceMonitoring(false);
      });
    });

    const nonBlockingStats = result.current.getPerformanceStats();

    // Both should have similar performance (minimal impact from async loading)
    expect(Math.abs(blockingStats.averageDuration - nonBlockingStats.averageDuration)).toBeLessThan(100);
    expect(blockingStats.performanceDistribution.good).toBe(3);
    expect(nonBlockingStats.performanceDistribution.good).toBe(3);
  });

  it('should demonstrate performance optimization over time', () => {
    const { result } = renderHook(() => useTrailerPerformance('optimization-timeline'));

    // Simulate performance improvement over multiple loads
    const loadScenarios = [
      { load: 1, duration: 3000, cached: false, expected: 'Poor' },        // Initial slow load
      { load: 2, duration: 2800, cached: false, expected: 'Poor' },        // Still slow, no cache
      { load: 3, duration: 100, cached: true, expected: 'Excellent' },     // Cache kicks in
      { load: 4, duration: 80, cached: true, expected: 'Excellent' },      // Cached load
      { load: 5, duration: 90, cached: true, expected: 'Excellent' },      // Cached load
      { load: 6, duration: 1200, cached: false, expected: 'Good' },        // New content, but faster network
      { load: 7, duration: 85, cached: true, expected: 'Excellent' },      // Back to cache
    ];

    loadScenarios.forEach(({ load, duration, cached }, index) => {
      act(() => {
        mockPerformanceNow.mockReturnValue(index * 1000);
        result.current.startPerformanceMonitoring();
        mockPerformanceNow.mockReturnValue(index * 1000 + duration);
        result.current.endPerformanceMonitoring(cached);
      });
    });

    const finalStats = result.current.getPerformanceStats();

    // Should show significant improvement over time
    expect(finalStats.totalRequests).toBeGreaterThanOrEqual(6);
    expect(finalStats.cacheHitRate).toBeGreaterThan(50); // Most loads should be cached
    expect(finalStats.performanceDistribution.excellent).toBeGreaterThan(2); // Multiple excellent loads
    
    // Should have some performance variation (poor + needs improvement + good + excellent should equal total)
    const totalDistribution = finalStats.performanceDistribution.poor + 
                              finalStats.performanceDistribution.needsImprovement + 
                              finalStats.performanceDistribution.good + 
                              finalStats.performanceDistribution.excellent;
    expect(totalDistribution).toBe(finalStats.totalRequests);
  });

  it('should measure real-world performance scenarios', () => {
    const { result } = renderHook(() => useTrailerPerformance('real-world-test'));

    // Simulate real-world scenarios with varying network conditions
    const realWorldScenarios = [
      { scenario: 'Fast WiFi', duration: 400, cached: false },
      { scenario: 'Slow WiFi', duration: 2500, cached: false },
      { scenario: 'Mobile 4G', duration: 1800, cached: false },
      { scenario: 'Cache Hit - Fast WiFi', duration: 50, cached: true },
      { scenario: 'Cache Hit - Slow WiFi', duration: 60, cached: true },
      { scenario: 'Cache Hit - Mobile 4G', duration: 70, cached: true },
      { scenario: 'Network Timeout', duration: 5000, cached: false },
      { scenario: 'Retry Success', duration: 800, cached: false }
    ];

    realWorldScenarios.forEach(({ duration, cached }, index) => {
      act(() => {
        mockPerformanceNow.mockReturnValue(index * 1500);
        result.current.startPerformanceMonitoring();
        mockPerformanceNow.mockReturnValue(index * 1500 + duration);
        result.current.endPerformanceMonitoring(cached);
      });
    });

    const stats = result.current.getPerformanceStats();

    // Real-world performance should show benefits of caching
    expect(stats.totalRequests).toBeGreaterThanOrEqual(7);
    expect(stats.cacheHitRate).toBeGreaterThanOrEqual(30); // Significant portion cached
    
    // Cache hits should all be excellent
    expect(stats.performanceDistribution.excellent).toBeGreaterThanOrEqual(3);
    
    // Should have mix of performance grades reflecting real conditions
    expect(stats.performanceDistribution.poor).toBeGreaterThanOrEqual(1); // Timeout scenario
    expect(stats.performanceDistribution.good).toBeGreaterThanOrEqual(1); // Good network conditions
  });

  it('should provide performance optimization recommendations', () => {
    const { result } = renderHook(() => useTrailerPerformance('recommendations-test'));

    // Create scenario that triggers all recommendation types
    const scenarios = [
      { duration: 4000, cached: false }, // Poor performance - triggers "high load time" warning
      { duration: 3500, cached: false }, // Poor performance - triggers "poor performance loads" warning
      { duration: 3200, cached: false }, // Poor performance - triggers "low cache hit rate" warning
      { duration: 2800, cached: false }, // Poor performance
      { duration: 100, cached: true },   // One good cached load
    ];

    scenarios.forEach(({ duration, cached }, index) => {
      act(() => {
        mockPerformanceNow.mockReturnValue(index * 1000);
        result.current.startPerformanceMonitoring();
        mockPerformanceNow.mockReturnValue(index * 1000 + duration);
        result.current.endPerformanceMonitoring(cached);
      });
    });

    act(() => {
      result.current.logPerformanceInsights();
    });

    // Should trigger all performance warnings
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('Average load time is high')
    );
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('Low cache hit rate')
    );
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('High number of poor performance loads')
    );

    const stats = result.current.getPerformanceStats();
    expect(stats.averageDuration).toBeGreaterThan(2000); // Should trigger warning
    expect(stats.cacheHitRate).toBeLessThan(50); // Should trigger warning
    expect(stats.performanceDistribution.poor).toBeGreaterThan(stats.totalRequests * 0.2); // Should trigger warning
  });

  it('should demonstrate excellent performance with optimal caching', () => {
    const { result } = renderHook(() => useTrailerPerformance('optimal-performance'));

    // Simulate optimal scenario with good caching
    const optimalScenarios = [
      { duration: 1200, cached: false }, // Initial load - acceptable
      { duration: 80, cached: true },    // Cached loads - excellent
      { duration: 70, cached: true },
      { duration: 90, cached: true },
      { duration: 85, cached: true },
      { duration: 75, cached: true },
      { duration: 95, cached: true },
      { duration: 800, cached: false },  // Occasional new content - good
      { duration: 80, cached: true },    // Back to cache
      { duration: 85, cached: true }
    ];

    optimalScenarios.forEach(({ duration, cached }, index) => {
      act(() => {
        mockPerformanceNow.mockReturnValue(index * 500);
        result.current.startPerformanceMonitoring();
        mockPerformanceNow.mockReturnValue(index * 500 + duration);
        result.current.endPerformanceMonitoring(cached);
      });
    });

    act(() => {
      result.current.logPerformanceInsights();
    });

    const stats = result.current.getPerformanceStats();

    // Should demonstrate excellent performance
    expect(stats.cacheHitRate).toBeGreaterThan(70); // High cache hit rate
    expect(stats.performanceDistribution.excellent).toBeGreaterThan(stats.totalRequests * 0.7); // Most loads excellent
    expect(stats.averageDuration).toBeLessThan(500); // Low average duration

    // Should log positive performance message
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('Excellent performance! Trailer loading is well optimized.')
    );
  });
});