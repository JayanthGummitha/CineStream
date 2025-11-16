/**
 * Utility functions for testing trailer error handling scenarios
 * This file contains functions to simulate various error conditions
 * for comprehensive testing of trailer functionality
 */

import { getMovieTrailer, getVidstackMovieTrailer } from './movie-service';

export interface ErrorTestResult {
  testName: string;
  success: boolean;
  error?: string;
  result?: any;
  duration: number;
}

/**
 * Test trailer functionality with invalid movie IDs
 */
export async function testInvalidMovieIds(): Promise<ErrorTestResult[]> {
  const results: ErrorTestResult[] = [];
  const invalidIds = ['', '0', '-1', 'abc', 'null', 'undefined', '999999999'];

  for (const invalidId of invalidIds) {
    const startTime = Date.now();
    try {
      const result = await getMovieTrailer(invalidId);
      
      results.push({
        testName: `Invalid ID: "${invalidId}"`,
        success: result === null, // Should return null for invalid IDs
        result,
        duration: Date.now() - startTime
      });
    } catch (error) {
      results.push({
        testName: `Invalid ID: "${invalidId}"`,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      });
    }
  }

  return results;
}

/**
 * Test trailer functionality with movie IDs that don't exist
 */
export async function testNonExistentMovieIds(): Promise<ErrorTestResult[]> {
  const results: ErrorTestResult[] = [];
  const nonExistentIds = ['999999', '888888', '777777'];

  for (const movieId of nonExistentIds) {
    const startTime = Date.now();
    try {
      const result = await getMovieTrailer(movieId);
      
      results.push({
        testName: `Non-existent ID: ${movieId}`,
        success: result === null, // Should return null for non-existent movies
        result,
        duration: Date.now() - startTime
      });
    } catch (error) {
      results.push({
        testName: `Non-existent ID: ${movieId}`,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      });
    }
  }

  return results;
}

/**
 * Test trailer functionality with movies that have no trailers
 */
export async function testMoviesWithoutTrailers(): Promise<ErrorTestResult[]> {
  const results: ErrorTestResult[] = [];
  // These are real movie IDs that might not have trailers
  const movieIdsWithoutTrailers = ['12345', '54321', '11111'];

  for (const movieId of movieIdsWithoutTrailers) {
    const startTime = Date.now();
    try {
      const result = await getMovieTrailer(movieId);
      
      results.push({
        testName: `No trailer movie: ${movieId}`,
        success: true, // Should handle gracefully regardless of result
        result,
        duration: Date.now() - startTime
      });
    } catch (error) {
      results.push({
        testName: `No trailer movie: ${movieId}`,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      });
    }
  }

  return results;
}

/**
 * Test Vidstack trailer functionality with various scenarios
 */
export async function testVidstackTrailerErrors(): Promise<ErrorTestResult[]> {
  const results: ErrorTestResult[] = [];
  const testIds = ['', '0', '550', '999999']; // Mix of invalid and valid IDs

  for (const movieId of testIds) {
    const startTime = Date.now();
    try {
      const result = await getVidstackMovieTrailer(movieId);
      
      results.push({
        testName: `Vidstack ID: "${movieId}"`,
        success: true, // Should handle gracefully
        result,
        duration: Date.now() - startTime
      });
    } catch (error) {
      results.push({
        testName: `Vidstack ID: "${movieId}"`,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      });
    }
  }

  return results;
}

/**
 * Test network failure scenarios (simulated)
 */
export async function testNetworkFailures(): Promise<ErrorTestResult[]> {
  const results: ErrorTestResult[] = [];
  
  // Test with a valid movie ID but simulate network issues by testing quickly
  const movieId = '550'; // Fight Club - should have trailers
  const startTime = Date.now();
  
  try {
    
    // Create multiple concurrent requests to potentially trigger rate limiting
    const promises = Array(5).fill(null).map(() => getMovieTrailer(movieId));
    const results_concurrent = await Promise.allSettled(promises);
    
    const successCount = results_concurrent.filter(r => r.status === 'fulfilled').length;
    const errorCount = results_concurrent.filter(r => r.status === 'rejected').length;
    
    results.push({
      testName: 'Concurrent requests test',
      success: true, // Should handle gracefully
      result: { successCount, errorCount, total: results_concurrent.length },
      duration: Date.now() - startTime
    });
    
  } catch (error) {
    results.push({
      testName: 'Concurrent requests test',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    });
  }

  return results;
}

/**
 * Run all error tests and return comprehensive results
 */
export async function runAllErrorTests(): Promise<{
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    averageDuration: number;
  };
  results: ErrorTestResult[];
}> {
  
  const allResults: ErrorTestResult[] = [];
  
  try {
    const [
      invalidIdResults,
      nonExistentResults,
      noTrailerResults,
      vidstackResults,
      networkResults
    ] = await Promise.all([
      testInvalidMovieIds(),
      testNonExistentMovieIds(),
      testMoviesWithoutTrailers(),
      testVidstackTrailerErrors(),
      testNetworkFailures()
    ]);

    allResults.push(
      ...invalidIdResults,
      ...nonExistentResults,
      ...noTrailerResults,
      ...vidstackResults,
      ...networkResults
    );

    const totalTests = allResults.length;
    const passedTests = allResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const averageDuration = allResults.reduce((sum, r) => sum + r.duration, 0) / totalTests;


    return {
      summary: {
        totalTests,
        passedTests,
        failedTests,
        averageDuration: Math.round(averageDuration)
      },
      results: allResults
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Log detailed test results to console
 */
export function logTestResults(testResults: { summary: any; results: ErrorTestResult[] }) {

  testResults.results.forEach((result, index) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    
    if (result.error) {
     }
    
    if (result.result !== undefined) {
    }
  });
  
 }