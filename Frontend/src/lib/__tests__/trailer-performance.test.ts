/**
 * @jest-environment jsdom
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
const mockConsoleGroup = jest.fn();
const mockConsoleGroupEnd = jest.fn();

global.console = {
  ...console,
  log: mockConsoleLog,
  warn: mockConsoleWarn,
  group: mockConsoleGroup,
  groupEnd: mockConsoleGroupEnd
};

describe('useTrailerPerformance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformanceNow.mockReturnValue(0);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should track performance metrics correctly', () => {
    const { result } = renderHook(() => useTrailerPerformance('test-movie-123'));

    // Start monitoring
    mockPerformanceNow.mockReturnValue(100);
    act(() => {
      result.current.startPerformanceMonitoring();
    });

    // End monitoring
    mockPerformanceNow.mockReturnValue(600); // 500ms duration
    let report: any;
    act(() => {
      report = result.current.endPerformanceMonitoring(false);
    });

    expect(report).toEqual({
      movieId: 'test-movie-123',
      duration: 500,
      cacheHit: false,
      performanceGrade: 'Excellent',
      timestamp: expect.any(Number)
    });
  });

  it('should categorize performance grades correctly', () => {
    const { result } = renderHook(() => useTrailerPerformance('test-movie'));

    const testCases = [
      { duration: 300, expected: 'Excellent' },
      { duration: 1000, expected: 'Good' },
      { duration: 2000, expected: 'Needs Improvement' },
      { duration: 4000, expected: 'Poor' }
    ];

    testCases.forEach(({ duration, expected }, index) => {
      mockPerformanceNow.mockReturnValue(0);
      act(() => {
        result.current.startPerformanceMonitoring();
      });

      mockPerformanceNow.mockReturnValue(duration);
      let report: any;
      act(() => {
        report = result.current.endPerformanceMonitoring(false);
      });

      expect(report.performanceGrade).toBe(expected);
    });
  });

  it('should track cache hits correctly', () => {
    const { result } = renderHook(() => useTrailerPerformance('test-movie'));

    // Test cache hit
    mockPerformanceNow.mockReturnValue(0);
    act(() => {
      result.current.startPerformanceMonitoring();
    });

    mockPerformanceNow.mockReturnValue(100);
    let report: any;
    act(() => {
      report = result.current.endPerformanceMonitoring(true);
    });

    expect(report.cacheHit).toBe(true);

    // Test cache miss
    mockPerformanceNow.mockReturnValue(0);
    act(() => {
      result.current.startPerformanceMonitoring();
    });

    mockPerformanceNow.mockReturnValue(100);
    act(() => {
      report = result.current.endPerformanceMonitoring(false);
    });

    expect(report.cacheHit).toBe(false);
  });

  it('should calculate performance statistics correctly', () => {
    const { result } = renderHook(() => useTrailerPerformance('test-movie'));

    // Add multiple performance reports
    const testData = [
      { duration: 300, cacheHit: true },   // Excellent, cache hit
      { duration: 1000, cacheHit: false }, // Good, cache miss
      { duration: 2000, cacheHit: false }, // Needs Improvement, cache miss
      { duration: 4000, cacheHit: true }   // Poor, cache hit
    ];

    testData.forEach(({ duration, cacheHit }) => {
      mockPerformanceNow.mockReturnValue(0);
      act(() => {
        result.current.startPerformanceMonitoring();
      });

      mockPerformanceNow.mockReturnValue(duration);
      act(() => {
        result.current.endPerformanceMonitoring(cacheHit);
      });
    });

    const stats = result.current.getPerformanceStats();

    expect(stats).toEqual({
      totalRequests: 4,
      averageDuration: 1825, // (300 + 1000 + 2000 + 4000) / 4
      cacheHitRate: 50, // 2 out of 4 cache hits
      performanceDistribution: {
        excellent: 1,
        good: 1,
        needsImprovement: 1,
        poor: 1
      }
    });
  });

  it('should handle empty performance data', () => {
    const { result } = renderHook(() => useTrailerPerformance('test-movie'));

    const stats = result.current.getPerformanceStats();

    expect(stats).toEqual({
      totalRequests: 0,
      averageDuration: 0,
      cacheHitRate: 0,
      performanceDistribution: {
        excellent: 0,
        good: 0,
        needsImprovement: 0,
        poor: 0
      }
    });
  });

  it('should provide performance insights and warnings', () => {
    const { result } = renderHook(() => useTrailerPerformance('test-movie'));

    // Add poor performance data
    mockPerformanceNow.mockReturnValue(0);
    act(() => {
      result.current.startPerformanceMonitoring();
    });

    mockPerformanceNow.mockReturnValue(3000); // Poor performance
    act(() => {
      result.current.endPerformanceMonitoring(false); // Cache miss
    });

    act(() => {
      result.current.logPerformanceInsights();
    });

    // Check that warnings were logged
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('Average load time is high')
    );
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('Low cache hit rate')
    );
  });

  it('should clear performance history', () => {
    const { result } = renderHook(() => useTrailerPerformance('test-movie'));

    // Add some performance data
    mockPerformanceNow.mockReturnValue(0);
    act(() => {
      result.current.startPerformanceMonitoring();
    });

    mockPerformanceNow.mockReturnValue(500);
    act(() => {
      result.current.endPerformanceMonitoring(false);
    });

    // Verify data exists
    let stats = result.current.getPerformanceStats();
    expect(stats.totalRequests).toBe(1);

    // Clear history
    act(() => {
      result.current.clearPerformanceHistory();
    });

    // Verify data is cleared
    stats = result.current.getPerformanceStats();
    expect(stats.totalRequests).toBe(0);
  });

  it('should handle missing start time gracefully', () => {
    const { result } = renderHook(() => useTrailerPerformance('test-movie'));

    // Try to end monitoring without starting
    let report: any;
    act(() => {
      report = result.current.endPerformanceMonitoring(false);
    });

    expect(report).toBeNull();
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('No start time recorded')
    );
  });
});

describe('Trailer Performance Integration', () => {
  it('should demonstrate performance optimization benefits', async () => {
    // Simulate different loading scenarios
    const scenarios = [
      { name: 'Cache Hit (Optimized)', duration: 50, cacheHit: true },
      { name: 'Fast Network (Good)', duration: 800, cacheHit: false },
      { name: 'Slow Network (Poor)', duration: 3500, cacheHit: false },
      { name: 'Timeout (Error)', duration: 5000, cacheHit: false }
    ];

    const { result } = renderHook(() => useTrailerPerformance('performance-test'));

    scenarios.forEach(({ name, duration, cacheHit }) => {
      mockPerformanceNow.mockReturnValue(0);
      act(() => {
        result.current.startPerformanceMonitoring();
      });

      mockPerformanceNow.mockReturnValue(duration);
      act(() => {
        const report = result.current.endPerformanceMonitoring(cacheHit);
        console.log(`${name}: ${report?.performanceGrade} (${duration}ms)`);
      });
    });

    const stats = result.current.getPerformanceStats();
    
    // Verify optimization impact
    expect(stats.totalRequests).toBe(4);
    expect(stats.cacheHitRate).toBe(25); // 1 out of 4
    expect(stats.performanceDistribution.excellent).toBe(1); // Cache hit
    expect(stats.performanceDistribution.poor).toBe(2); // Slow network + timeout
  });
});