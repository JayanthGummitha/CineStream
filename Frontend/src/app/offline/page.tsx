'use client';

import { WifiOff, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-10 h-10 text-gray-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-3">
          You&apos;re Offline
        </h1>
        
        <p className="text-gray-400 mb-8">
          It looks like you&apos;ve lost your internet connection. 
          Check your connection and try again, or browse your downloaded content.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleRetry} className="bg-red-600 hover:bg-red-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <Link href="/downloads">
            <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800 w-full">
              <Download className="w-4 h-4 mr-2" />
              View Downloads
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
