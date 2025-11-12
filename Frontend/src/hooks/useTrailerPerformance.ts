'use client';

import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  trailerFetchStart: number | null;
  trailerFetchEnd: number | null;
  trailerFetchDuration: number | null;
  cacheHit: boolean;
}

interface PerformanceReport {
  movieId: string;
  duration: number;
  cacheHit: boolean;
  performanceGrade: 'Excellent' | 'Good' | 'Needs Improvement' | 'Poor';
  timestamp: number;
}

/**
 * Hook for monitoring trailer loading performance
 * Provides performance tracking, reporting, and optimization insights
 */
export function useTrailerPerformance(movieId: string) {
  const performanceReports = useRef<PerformanceReport[]>([]);
  const currentMetrics = useRef<PerformanceMetrics | null>(null);

  /**
   * Start performance monitoring for trailer loading
   */
  const startPerformanceMonitoring = () => {
    const startTime = performance.now();
    currentMetrics.current = {
      trailerFetchStart: startTime,
      trailerFetchEnd: null,
      trailerFetchDuration: null,
      cacheHit: false
    };
    
    console.log(`[Trailer Performance] Started monitoring for movie ${movieId} at ${startTime.toFixed(2)}ms`);
    return startTime;
  };

  /**
   * End performance monitoring and generate report
   */
  const endPerformanceMonitoring = (cacheHit: boolean = false) => {
    if (!currentMetrics.current?.trailerFetchStart) {
      console.warn('[Trailer Performance] No start time recorded for performance monitoring');
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - currentMetrics.current.trailerFetchStart;
    
    // Determine performance grade based on duration
    let performanceGrade: PerformanceReport['performanceGrade'];
    if (duration < 500) {
      performanceGrade = 'Excellent';
    } else if (duration < 1500) {
      performanceGrade = 'Good';
    } else if (duration < 3000) {
      performanceGrade = 'Needs Improvement';
    } else {
      performanceGrade = 'Poor';
    }

    const report: PerformanceReport = {
      movieId,
      duration,
      cacheHit,
      performanceGrade,
      timestamp: Date.now()
    };

    // Update current metrics
    currentMetrics.current = {
      ...currentMetrics.current,
      trailerFetchEnd: endTime,
      trailerFetchDuration: duration,
      cacheHit
    };

    // Store report
    performanceReports.current.push(report);

    // Log performance report
    console.log(`[Trailer Performance] Completed monitoring for movie ${movieId}:`, {
      duration: `${duration.toFixed(2)}ms`,
      performanceGrade,
      cacheHit,
      efficiency: cacheHit ? 'Cache Hit - Optimal' : 'Network Fetch - Standard'
    });

    return report;
  };

  /**
   * Get performance statistics for all monitored trailer loads
   */
  const getPerformanceStats = () => {
    const reports = performanceReports.current;
    
    if (reports.length === 0) {
      return {
        totalRequests: 0,
        averageDuration: 0,
        cacheHitRate: 0,
        performanceDistribution: {
          excellent: 0,
          good: 0,
          needsImprovement: 0,
          poor: 0
        }
      };
    }

    const totalDuration = reports.reduce((sum, report) => sum + report.duration, 0);
    const cacheHits = reports.filter(report => report.cacheHit).length;
    
    const performanceDistribution = reports.reduce((dist, report) => {
      switch (report.performanceGrade) {
        case 'Excellent':
          dist.excellent++;
          break;
        case 'Good':
          dist.good++;
          break;
        case 'Needs Improvement':
          dist.needsImprovement++;
          break;
        case 'Poor':
          dist.poor++;
          break;
      }
      return dist;
    }, { excellent: 0, good: 0, needsImprovement: 0, poor: 0 });

    return {
      totalRequests: reports.length,
      averageDuration: totalDuration / reports.length,
      cacheHitRate: (cacheHits / reports.length) * 100,
      performanceDistribution
    };
  };

  /**
   * Log performance insights and recommendations
   */
  const logPerformanceInsights = () => {
    const stats = getPerformanceStats();
    
    if (stats.totalRequests === 0) {
      console.log('[Trailer Performance] No performance data available yet');
      return;
    }

    console.group('[Trailer Performance] Performance Insights');
    console.log(`Total trailer loads monitored: ${stats.totalRequests}`);
    console.log(`Average load time: ${stats.averageDuration.toFixed(2)}ms`);
    console.log(`Cache hit rate: ${stats.cacheHitRate.toFixed(1)}%`);
    console.log('Performance distribution:', stats.performanceDistribution);
    
    // Provide recommendations
    if (stats.averageDuration > 2000) {
      console.warn('⚠️ Average load time is high. Consider implementing preloading or improving cache strategy.');
    }
    
    if (stats.cacheHitRate < 50) {
      console.warn('⚠️ Low cache hit rate. Consider implementing more aggressive caching or preloading.');
    }
    
    if (stats.performanceDistribution.poor > stats.totalRequests * 0.2) {
      console.warn('⚠️ High number of poor performance loads. Check network conditions and API response times.');
    }
    
    if (stats.performanceDistribution.excellent > stats.totalRequests * 0.7) {
      console.log('✅ Excellent performance! Trailer loading is well optimized.');
    }
    
    console.groupEnd();
  };

  /**
   * Clear performance history
   */
  const clearPerformanceHistory = () => {
    performanceReports.current = [];
    currentMetrics.current = null;
    console.log('[Trailer Performance] Performance history cleared');
  };

  // Periodic performance reporting (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (performanceReports.current.length > 0) {
        logPerformanceInsights();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    startPerformanceMonitoring,
    endPerformanceMonitoring,
    getPerformanceStats,
    logPerformanceInsights,
    clearPerformanceHistory,
    currentMetrics: currentMetrics.current
  };
}