import { Metadata } from 'next';
import { WatchHistoryClient } from '@/components/watch-history/WatchHistoryClient';
import { WatchHistoryErrorBoundary } from '@/components/watch-history/WatchHistoryErrorBoundary';

export const metadata: Metadata = {
  title: 'Watch History | CineStream',
  description: 'View your viewing history from the past 30 days',
};

/**
 * Watch History Page
 * 
 * Server component that renders the watch history page.
 * Provides SEO metadata and container layout for the WatchHistoryClient component.
 * Wraps the client component in an error boundary to catch and handle component errors.
 * 
 * Requirements: 1.1, 6.2, 6.4
 * Error Handling: Implements error boundaries for component errors
 */
export default function HistoryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <WatchHistoryErrorBoundary>
        <WatchHistoryClient />
      </WatchHistoryErrorBoundary>
    </div>
  );
}
