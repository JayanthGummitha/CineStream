/**
 * Performance benchmark utility for trailer loading optimization
 * Measures and compares page load performance with different trailer loading strategies
 */

interface BenchmarkResult {
  scenario: string;
  pageLoadTime: number;
  trailerLoadTime: number;
  totalTime: number;
  cacheHit: boolean;
  renderBlocked: boolean;
  performanceGrade: 'Excellent' | 'Good' | 'Needs Improvement' | 'Poor';
}

interface BenchmarkConfig {
  movieId: string;
  iterations: number;
  includeNetworkDelay: boolean;
  simulateCacheHit: boolean;
  simulateSlowNetwork: boolean;
}

/**
 * Simulates different network conditions for testing
 */
class NetworkSimulator {
  static async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async simulateFastNetwork(): Promise<number> {
    await this.simulateDelay(100 + Math.random() * 200); // 100-300ms
    return performance.now();
  }

  static async simulateSlowNetwork(): Promise<number> {
    await this.simulateDelay(2000 + Math.random() * 3000); // 2-5s
    return performance.now();
  }

  static async simulateCacheHit(): Promise<number> {
    await this.simulateDelay(10 + Math.random() * 40); // 10-50ms
    return performance.now();
  }

  static async simulateTimeout(): Promise<number> {
    await this.simulateDelay(5000); // 5s timeout
    throw new Error('Network timeout');
  }
}

/**
 * Performance benchmark for trailer loading
 */
export class TrailerPerformanceBenchmark {
  private results: BenchmarkResult[] = [];

  /**
   * Run benchmark comparing different trailer loading strategies
   */
  async runBenchmark(config: BenchmarkConfig): Promise<BenchmarkResult[]> {
    console.group(`[Performance Benchmark] Running benchmark for movie ${config.movieId}`);
    
    const scenarios = [
      { name: 'Optimized Async Loading (Cache Hit)', cacheHit: true, renderBlocked: false },
      { name: 'Optimized Async Loading (Network)', cacheHit: false, renderBlocked: false },
      { name: 'Legacy Sync Loading (Network)', cacheHit: false, renderBlocked: true },
      { name: 'Slow Network Conditions', cacheHit: false, renderBlocked: false, slowNetwork: true }
    ];

    for (const scenario of scenarios) {
      
      const scenarioResults: BenchmarkResult[] = [];
      
      for (let i = 0; i < config.iterations; i++) {
        const result = await this.runSingleBenchmark(scenario, config);
        scenarioResults.push(result);
      }

      // Calculate average for this scenario
      const avgResult = this.calculateAverageResult(scenarioResults);
      this.results.push(avgResult);
      
    }

    console.groupEnd();
    return this.results;
  }

  /**
   * Run a single benchmark iteration
   */
  private async runSingleBenchmark(
    scenario: { name: string; cacheHit: boolean; renderBlocked: boolean; slowNetwork?: boolean },
    config: BenchmarkConfig
  ): Promise<BenchmarkResult> {
    const startTime = performance.now();
    
    // Simulate page render start
    const pageRenderStart = performance.now();
    
    // Simulate basic page content loading (DOM, CSS, initial JS)
    await NetworkSimulator.simulateDelay(200 + Math.random() * 300); // 200-500ms for page basics
    
    const pageRenderEnd = performance.now();
    const pageLoadTime = pageRenderEnd - pageRenderStart;

    let trailerLoadTime = 0;
    let trailerStartTime = pageRenderEnd;

    if (scenario.renderBlocked) {
      // Legacy approach: trailer loading blocks page render
      trailerStartTime = pageRenderStart + 100; // Start during page render
    } else {
      // Optimized approach: trailer loading starts after page render
      trailerStartTime = pageRenderEnd;
    }

    // Simulate trailer loading based on scenario
    try {
      const trailerLoadStart = performance.now();
      
      if (scenario.cacheHit) {
        await NetworkSimulator.simulateCacheHit();
      } else if (scenario.slowNetwork) {
        await NetworkSimulator.simulateSlowNetwork();
      } else {
        await NetworkSimulator.simulateFastNetwork();
      }
      
      const trailerLoadEnd = performance.now();
      trailerLoadTime = trailerLoadEnd - trailerLoadStart;
      
    } catch (error) {
      // Handle timeout or network errors
      trailerLoadTime = 5000; // Timeout duration
    }

    const totalTime = performance.now() - startTime;
    
    // Determine performance grade
    let performanceGrade: BenchmarkResult['performanceGrade'];
    if (totalTime < 1000) {
      performanceGrade = 'Excellent';
    } else if (totalTime < 2000) {
      performanceGrade = 'Good';
    } else if (totalTime < 4000) {
      performanceGrade = 'Needs Improvement';
    } else {
      performanceGrade = 'Poor';
    }

    return {
      scenario: scenario.name,
      pageLoadTime,
      trailerLoadTime,
      totalTime,
      cacheHit: scenario.cacheHit,
      renderBlocked: scenario.renderBlocked,
      performanceGrade
    };
  }

  /**
   * Calculate average result from multiple iterations
   */
  private calculateAverageResult(results: BenchmarkResult[]): BenchmarkResult {
    const avgPageLoadTime = results.reduce((sum, r) => sum + r.pageLoadTime, 0) / results.length;
    const avgTrailerLoadTime = results.reduce((sum, r) => sum + r.trailerLoadTime, 0) / results.length;
    const avgTotalTime = results.reduce((sum, r) => sum + r.totalTime, 0) / results.length;
    
    // Determine overall performance grade
    let performanceGrade: BenchmarkResult['performanceGrade'];
    if (avgTotalTime < 1000) {
      performanceGrade = 'Excellent';
    } else if (avgTotalTime < 2000) {
      performanceGrade = 'Good';
    } else if (avgTotalTime < 4000) {
      performanceGrade = 'Needs Improvement';
    } else {
      performanceGrade = 'Poor';
    }

    return {
      scenario: results[0].scenario,
      pageLoadTime: avgPageLoadTime,
      trailerLoadTime: avgTrailerLoadTime,
      totalTime: avgTotalTime,
      cacheHit: results[0].cacheHit,
      renderBlocked: results[0].renderBlocked,
      performanceGrade
    };
  }

  /**
   * Generate performance comparison report
   */
  generateReport(): void {
    if (this.results.length === 0) {
      return;
    }

    console.group('[Performance Benchmark] Performance Comparison Report');
    
    // Sort results by total time
    const sortedResults = [...this.results].sort((a, b) => a.totalTime - b.totalTime);
    
    sortedResults.forEach((result, index) => {
      const improvement = index === 0 ? 'Baseline' : 
        `${((result.totalTime - sortedResults[0].totalTime) / sortedResults[0].totalTime * 100).toFixed(1)}% slower`;
      
     
    });

    // Performance insights
    
    const optimizedAsync = this.results.find(r => r.scenario.includes('Optimized Async') && !r.cacheHit);
    const legacySync = this.results.find(r => r.scenario.includes('Legacy Sync'));
    
    if (optimizedAsync && legacySync) {
      const improvement = ((legacySync.totalTime - optimizedAsync.totalTime) / legacySync.totalTime * 100);
    }

    const cacheHit = this.results.find(r => r.cacheHit);
    const networkFetch = this.results.find(r => !r.cacheHit && !r.scenario.includes('Slow'));
    
    if (cacheHit && networkFetch) {
      const cacheImprovement = ((networkFetch.totalTime - cacheHit.totalTime) / networkFetch.totalTime * 100);
    }

    const renderBlockedResults = this.results.filter(r => r.renderBlocked);
    if (renderBlockedResults.length > 0) {
    }

    const slowNetworkResult = this.results.find(r => r.scenario.includes('Slow Network'));
    if (slowNetworkResult && slowNetworkResult.performanceGrade === 'Poor') {
    }

    console.groupEnd();
  }

  /**
   * Clear benchmark results
   */
  clearResults(): void {
    this.results = [];
  }

  /**
   * Get benchmark results
   */
  getResults(): BenchmarkResult[] {
    return [...this.results];
  }
}

/**
 * Utility function to run a quick performance test
 */
export async function runQuickPerformanceTest(movieId: string): Promise<void> {
  const benchmark = new TrailerPerformanceBenchmark();
  
  const config: BenchmarkConfig = {
    movieId,
    iterations: 3,
    includeNetworkDelay: true,
    simulateCacheHit: true,
    simulateSlowNetwork: true
  };

  
  await benchmark.runBenchmark(config);
  benchmark.generateReport();
}

/**
 * Utility function to measure real trailer loading performance
 */
export function measureTrailerLoadingPerformance(
  movieId: string,
  trailerLoadFunction: () => Promise<string | null>
): Promise<{ duration: number; success: boolean; cacheHit: boolean }> {
  return new Promise(async (resolve) => {
    const startTime = performance.now();
    let success = false;
    let cacheHit = false;

    try {
      const result = await trailerLoadFunction();
      success = !!result;
      
      // Heuristic to detect cache hit (very fast response)
      const duration = performance.now() - startTime;
      cacheHit = duration < 100;
      
      resolve({
        duration,
        success,
        cacheHit
      });
    } catch (error) {
      const duration = performance.now() - startTime;
      resolve({
        duration,
        success: false,
        cacheHit: false
      });
    }
  });
}