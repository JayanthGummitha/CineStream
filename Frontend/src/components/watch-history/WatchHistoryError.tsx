/**
 * Watch History Error Component
 * 
 * Displays error messages when watch history data cannot be retrieved.
 * Provides retry functionality for failed operations.
 * 
 * Requirements: 6.5 (Display error message when data cannot be retrieved)
 * 
 * @module WatchHistoryError
 */

'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface WatchHistoryErrorProps {
  /** Error message to display */
  message: string;
  /** Callback to retry loading data */
  onRetry: () => void;
}

/**
 * WatchHistoryError Component
 * 
 * Displays an error state with a retry button when watch history
 * data cannot be loaded or retrieved.
 * 
 * Features:
 * - Clear error message display
 * - Retry button for failed operations
 * - Consistent styling with CineStream design
 * - Accessible error presentation
 * 
 * @example
 * ```tsx
 * <WatchHistoryError
 *   message="Unable to load watch history. Please try again."
 *   onRetry={retryLoad}
 * />
 * ```
 */
export function WatchHistoryError({ message, onRetry }: WatchHistoryErrorProps) {
  return (
    <div 
      className="flex flex-col items-center justify-center py-16 px-4"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="p-4 rounded-full bg-destructive/10 mb-4" aria-hidden="true">
        <AlertCircle className="h-12 w-12 text-destructive" aria-hidden="true" />
      </div>
      
      <h2 className="text-xl font-semibold mb-2" id="error-title">
        Unable to Load Watch History
      </h2>
      
      <p className="text-muted-foreground text-center max-w-md mb-6" id="error-message">
        {message}
      </p>
      
      <Button 
        onClick={onRetry} 
        variant="default" 
        className="gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-describedby="error-message"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Try Again
      </Button>
    </div>
  );
}
