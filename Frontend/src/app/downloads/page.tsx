'use client';

import { Header } from '@/components/navigation/header';
import { Footer } from '@/components/navigation/footer';
import { DownloadManager } from '@/components/offline/DownloadManager';

export default function DownloadsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={true} />
      
      <main className="container max-w-4xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold text-white mb-8">Downloads</h1>
        <DownloadManager />
      </main>

      <Footer />
    </div>
  );
}
