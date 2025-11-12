/**
 * Mobile Responsiveness Testing Utilities
 * 
 * Provides utilities for testing and ensuring mobile responsiveness
 * across different screen sizes and device types.
 * 
 * @module responsive-testing
 * @version 1.0.0
 */

import React, { useState, useCallback, useEffect } from 'react';

/**
 * Standard breakpoint definitions
 */
export const BREAKPOINTS = {
  xs: 320,   // Extra small devices (phones)
  sm: 640,   // Small devices (large phones)
  md: 768,   // Medium devices (tablets)
  lg: 1024,  // Large devices (laptops)
  xl: 1280,  // Extra large devices (desktops)
  '2xl': 1536 // 2X large devices (large desktops)
} as const;

/**
 * Device viewport configurations for testing
 */
export const DEVICE_VIEWPORTS = {
  // Mobile devices
  'iPhone SE': { width: 375, height: 667, devicePixelRatio: 2 },
  'iPhone 12': { width: 390, height: 844, devicePixelRatio: 3 },
  'iPhone 12 Pro Max': { width: 428, height: 926, devicePixelRatio: 3 },
  'Samsung Galaxy S21': { width: 384, height: 854, devicePixelRatio: 2.75 },
  'Google Pixel 5': { width: 393, height: 851, devicePixelRatio: 2.75 },
  
  // Tablet devices
  'iPad': { width: 768, height: 1024, devicePixelRatio: 2 },
  'iPad Pro 11"': { width: 834, height: 1194, devicePixelRatio: 2 },
  'iPad Pro 12.9"': { width: 1024, height: 1366, devicePixelRatio: 2 },
  'Samsung Galaxy Tab': { width: 800, height: 1280, devicePixelRatio: 2 },
  
  // Desktop devices
  'Laptop': { width: 1366, height: 768, devicePixelRatio: 1 },
  'Desktop': { width: 1920, height: 1080, devicePixelRatio: 1 },
  'Large Desktop': { width: 2560, height: 1440, devicePixelRatio: 1 },
  'Ultra-wide': { width: 3440, height: 1440, devicePixelRatio: 1 }
} as const;

/**
 * Interface for responsive test results
 */
export interface ResponsiveTestResult {
  device: string;
  viewport: { width: number; height: number };
  breakpoint: keyof typeof BREAKPOINTS;
  issues: ResponsiveIssue[];
  score: number; // 0-100
  recommendations: string[];
}

/**
 * Interface for responsive issues
 */
export interface ResponsiveIssue {
  type: 'layout' | 'text' | 'touch' | 'performance' | 'accessibility';
  severity: 'low' | 'medium' | 'high' | 'critical';
  element: string;
  description: string;
  fix: string;
}

/**
 * Gets the current breakpoint based on window width
 * 
 * @param width - Window width (defaults to current window width)
 * @returns Current breakpoint name
 */
export function getCurrentBreakpoint(width?: number): keyof typeof BREAKPOINTS {
  const currentWidth = width ?? (typeof window !== 'undefined' ? window.innerWidth : 1024);
  
  if (currentWidth < BREAKPOINTS.sm) return 'xs';
  if (currentWidth < BREAKPOINTS.md) return 'sm';
  if (currentWidth < BREAKPOINTS.lg) return 'md';
  if (currentWidth < BREAKPOINTS.xl) return 'lg';
  if (currentWidth < BREAKPOINTS['2xl']) return 'xl';
  return '2xl';
}

/**
 * Checks if current viewport matches a specific breakpoint
 * 
 * @param breakpoint - Breakpoint to check
 * @param width - Window width (defaults to current window width)
 * @returns Whether the viewport matches the breakpoint
 */
export function isBreakpoint(breakpoint: keyof typeof BREAKPOINTS, width?: number): boolean {
  return getCurrentBreakpoint(width) === breakpoint;
}

/**
 * Checks if current viewport is mobile size
 * 
 * @param width - Window width (defaults to current window width)
 * @returns Whether the viewport is mobile size
 */
export function isMobile(width?: number): boolean {
  const currentWidth = width ?? (typeof window !== 'undefined' ? window.innerWidth : 1024);
  return currentWidth < BREAKPOINTS.md;
}

/**
 * Checks if current viewport is tablet size
 * 
 * @param width - Window width (defaults to current window width)
 * @returns Whether the viewport is tablet size
 */
export function isTablet(width?: number): boolean {
  const currentWidth = width ?? (typeof window !== 'undefined' ? window.innerWidth : 1024);
  return currentWidth >= BREAKPOINTS.md && currentWidth < BREAKPOINTS.lg;
}

/**
 * Checks if current viewport is desktop size
 * 
 * @param width - Window width (defaults to current window width)
 * @returns Whether the viewport is desktop size
 */
export function isDesktop(width?: number): boolean {
  const currentWidth = width ?? (typeof window !== 'undefined' ? window.innerWidth : 1024);
  return currentWidth >= BREAKPOINTS.lg;
}

/**
 * Tests responsive behavior across multiple viewports
 * 
 * @param testFunction - Function to run tests for each viewport
 * @returns Array of test results for each device
 */
export async function testResponsiveDesign(
  testFunction: (viewport: { width: number; height: number }, device: string) => Promise<ResponsiveIssue[]>
): Promise<ResponsiveTestResult[]> {
  const results: ResponsiveTestResult[] = [];
  
  for (const [device, viewport] of Object.entries(DEVICE_VIEWPORTS)) {
    try {
      const issues = await testFunction(viewport, device);
      const score = calculateResponsiveScore(issues);
      const recommendations = generateRecommendations(issues);
      const breakpoint = getCurrentBreakpoint(viewport.width);
      
      results.push({
        device,
        viewport,
        breakpoint,
        issues,
        score,
        recommendations
      });
    } catch (error) {
      console.error(`Failed to test device ${device}:`, error);
    }
  }
  
  return results;
}

/**
 * Calculates a responsive design score based on issues
 * 
 * @param issues - Array of responsive issues
 * @returns Score from 0-100
 */
function calculateResponsiveScore(issues: ResponsiveIssue[]): number {
  if (issues.length === 0) return 100;
  
  const severityWeights = {
    low: 1,
    medium: 3,
    high: 7,
    critical: 15
  };
  
  const totalPenalty = issues.reduce((sum, issue) => {
    return sum + severityWeights[issue.severity];
  }, 0);
  
  return Math.max(0, 100 - totalPenalty);
}

/**
 * Generates recommendations based on responsive issues
 * 
 * @param issues - Array of responsive issues
 * @returns Array of recommendation strings
 */
function generateRecommendations(issues: ResponsiveIssue[]): string[] {
  const recommendations: string[] = [];
  
  const criticalIssues = issues.filter(issue => issue.severity === 'critical');
  const highIssues = issues.filter(issue => issue.severity === 'high');
  const touchIssues = issues.filter(issue => issue.type === 'touch');
  const layoutIssues = issues.filter(issue => issue.type === 'layout');
  
  if (criticalIssues.length > 0) {
    recommendations.push('Address critical issues immediately - these prevent basic functionality');
  }
  
  if (highIssues.length > 0) {
    recommendations.push('Fix high-priority issues to improve user experience');
  }
  
  if (touchIssues.length > 0) {
    recommendations.push('Improve touch targets - ensure minimum 44px touch areas');
  }
  
  if (layoutIssues.length > 0) {
    recommendations.push('Review layout responsiveness - consider using CSS Grid or Flexbox');
  }
  
  return recommendations;
}

/**
 * Tests video player responsiveness specifically
 * 
 * @param playerElement - Video player element to test
 * @param viewport - Viewport dimensions
 * @returns Array of responsive issues found
 */
export function testVideoPlayerResponsiveness(
  playerElement: HTMLElement,
  viewport: { width: number; height: number }
): ResponsiveIssue[] {
  const issues: ResponsiveIssue[] = [];
  
  // Test video player container
  const playerRect = playerElement.getBoundingClientRect();
  
  // Check if player fits in viewport
  if (playerRect.width > viewport.width) {
    issues.push({
      type: 'layout',
      severity: 'high',
      element: 'video-player',
      description: 'Video player exceeds viewport width',
      fix: 'Add max-width: 100% and responsive sizing'
    });
  }
  
  // Test control buttons
  const buttons = playerElement.querySelectorAll('button');
  buttons.forEach((button, index) => {
    const buttonRect = button.getBoundingClientRect();
    
    // Check touch target size
    if (viewport.width < BREAKPOINTS.md && (buttonRect.width < 44 || buttonRect.height < 44)) {
      issues.push({
        type: 'touch',
        severity: 'medium',
        element: `button-${index}`,
        description: 'Touch target too small for mobile devices',
        fix: 'Increase button size to minimum 44x44px'
      });
    }
  });
  
  // Test skip intro button
  const skipButton = playerElement.querySelector('.skip-intro-button');
  if (skipButton) {
    const skipRect = skipButton.getBoundingClientRect();
    
    // Check positioning on mobile
    if (viewport.width < BREAKPOINTS.md) {
      const bottomOffset = viewport.height - skipRect.bottom;
      if (bottomOffset < 80) {
        issues.push({
          type: 'layout',
          severity: 'medium',
          element: 'skip-intro-button',
          description: 'Skip intro button too close to bottom on mobile',
          fix: 'Increase bottom margin for mobile devices'
        });
      }
    }
  }
  
  // Test next episode overlay
  const overlay = playerElement.querySelector('.next-episode-overlay');
  if (overlay) {
    const overlayRect = overlay.getBoundingClientRect();
    
    // Check overlay sizing on mobile
    if (viewport.width < BREAKPOINTS.md && overlayRect.width > viewport.width * 0.95) {
      issues.push({
        type: 'layout',
        severity: 'low',
        element: 'next-episode-overlay',
        description: 'Overlay too wide on mobile devices',
        fix: 'Reduce overlay width and add proper margins'
      });
    }
  }
  
  return issues;
}

/**
 * Hook for responsive design testing in React components
 * 
 * @param elementRef - Ref to the element to test
 * @returns Test results and utilities
 */
export function useResponsiveTesting(elementRef: React.RefObject<HTMLElement>) {
  const [testResults, setTestResults] = useState<ResponsiveTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const runTests = useCallback(async () => {
    if (!elementRef.current) return;
    
    setIsLoading(true);
    
    try {
      const results = await testResponsiveDesign(async (viewport, device) => {
        if (!elementRef.current) return [];
        
        // Simulate viewport change
        Object.assign(elementRef.current.style, {
          width: `${viewport.width}px`,
          height: `${viewport.height}px`
        });
        
        // Wait for layout to settle
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return testVideoPlayerResponsiveness(elementRef.current, viewport);
      });
      
      setTestResults(results);
    } catch (error) {
      console.error('Responsive testing failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [elementRef]);
  
  return {
    testResults,
    isLoading,
    runTests,
    getCurrentBreakpoint,
    isMobile,
    isTablet,
    isDesktop
  };
}

/**
 * Utility to log responsive test results
 * 
 * @param results - Test results to log
 */
export function logResponsiveTestResults(results: ResponsiveTestResult[]): void {
  console.group('📱 Responsive Design Test Results');
  
  results.forEach(result => {
    const emoji = result.score >= 90 ? '✅' : result.score >= 70 ? '⚠️' : '❌';
    
    console.group(`${emoji} ${result.device} (${result.viewport.width}x${result.viewport.height})`);
    console.log(`Score: ${result.score}/100`);
    console.log(`Breakpoint: ${result.breakpoint}`);
    
    if (result.issues.length > 0) {
      console.group('Issues:');
      result.issues.forEach(issue => {
        const severityEmoji = {
          low: '🟡',
          medium: '🟠',
          high: '🔴',
          critical: '🚨'
        }[issue.severity];
        
        console.log(`${severityEmoji} ${issue.element}: ${issue.description}`);
        console.log(`   Fix: ${issue.fix}`);
      });
      console.groupEnd();
    }
    
    if (result.recommendations.length > 0) {
      console.group('Recommendations:');
      result.recommendations.forEach(rec => console.log(`💡 ${rec}`));
      console.groupEnd();
    }
    
    console.groupEnd();
  });
  
  console.groupEnd();
}