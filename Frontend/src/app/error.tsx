'use client';

import { useEffect } from 'react';
import { Header } from '@/components/navigation/header';
import { Footer } from '@/components/navigation/footer';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={false} />
      
      <main className="container max-w-screen-2xl px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Something went wrong!</h1>
            <p className="text-muted-foreground max-w-md">
              We encountered an error while loading the content. This might be due to a network issue or a temporary problem with our servers.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <Button onClick={reset} className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </Button>
            
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Go Home
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8 p-4 bg-muted rounded-lg text-left max-w-2xl">
              <summary className="cursor-pointer font-semibold mb-2">
                Error Details (Development Only)
              </summary>
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                {error.message}
                {error.stack && '\n\nStack trace:\n' + error.stack}
              </pre>
            </details>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}