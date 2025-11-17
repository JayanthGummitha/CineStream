import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
  backLink?: string;
  backLinkText?: string;
}

/**
 * Reusable error display component for showing user-friendly error messages
 * with optional retry functionality and navigation options
 */
export function ErrorDisplay({
  title = 'Unable to Load Content',
  message,
  onRetry,
  showRetry = true,
  backLink,
  backLinkText = 'Go Back'
}: ErrorDisplayProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-white/70 mb-6">{message}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showRetry && onRetry && (
            <Button 
              onClick={onRetry} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
          {backLink && (
            <Link href={backLink}>
              <Button 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
              >
                <Home className="mr-2 h-4 w-4" />
                {backLinkText}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
