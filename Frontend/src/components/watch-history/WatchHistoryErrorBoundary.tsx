/**
 * Watch History Error Boundary
 * 
 * React Error Boundary component for catching and handling errors
 * in the watch history feature components.
 * 
 * Requirements: Implement error boundaries for component errors
 * 
 * @module WatchHistoryErrorBoundary
 */

'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;
  /** Optional fallback UI */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean;
  /** The error that was caught */
  error: Error | null;
}

/**
 * WatchHistoryErrorBoundary Component
 * 
 * Catches JavaScript errors anywhere in the watch history component tree,
 * logs those errors, and displays a fallback UI instead of crashing the page.
 * 
 * Features:
 * - Catches rendering errors in child components
 * - Logs errors to console for debugging
 * - Displays user-friendly error message
 * - Provides reset functionality to recover from errors
 * 
 * @example
 * ```tsx
 * <WatchHistoryErrorBoundary>
 *   <WatchHistoryClient />
 * </WatchHistoryErrorBoundary>
 * ```
 */
export class WatchHistoryErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * Update state when an error is caught
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log error details to console
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error for debugging (Requirement: Log errors to console)
    console.error('Watch History Error Boundary caught an error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
  }

  /**
   * Reset error boundary state
   */
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="p-4 rounded-full bg-destructive/10 mb-4">
            <AlertTriangle className="h-12 w-12 text-destructive" aria-hidden="true" />
          </div>
          
          <h2 className="text-xl font-semibold mb-2">Something Went Wrong</h2>
          
          <p className="text-muted-foreground text-center max-w-md mb-2">
            An error occurred while displaying your watch history.
          </p>
          
          {this.state.error && (
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6 font-mono">
              {this.state.error.message}
            </p>
          )}
          
          <Button onClick={this.handleReset} variant="default">
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
