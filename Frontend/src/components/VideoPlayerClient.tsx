'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Import VideoPlayerProps type from VideoPlayer
import type { VideoPlayerProps } from './VideoPlayer';

// Dynamically import VideoPlayer with no SSR
const VideoPlayerDynamic = dynamic(
  () => import('./VideoPlayer').then(mod => ({ default: mod.VideoPlayer })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <div className="text-white">Loading video player...</div>
      </div>
    ),
  }
);

export interface VideoPlayerClientProps extends VideoPlayerProps {
  title?: string; // Optional dynamic title
}

export function VideoPlayerClient({ title, ...props }: VideoPlayerClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <div className="text-white">Loading video player...</div>
      </div>
    );
  }

  return <VideoPlayerDynamic {...props} title={title} />;
}
