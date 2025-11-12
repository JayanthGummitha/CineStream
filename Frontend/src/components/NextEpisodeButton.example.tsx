/**
 * Example usage of NextEpisodeButton component
 * This file demonstrates how to integrate the NextEpisodeButton with a video player
 * showcasing the timing logic, animations, and accessibility features
 */

import { useState, useEffect } from 'react';
import { NextEpisodeButton } from './NextEpisodeButton';
import { EpisodeMetadata } from '@/lib/episode-metadata';
import '../styles/next-episode-animations.css';

export function VideoPlayerWithNextEpisodeButton() {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(2700); // 45 minutes
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Example next episode data
  const nextEpisode: EpisodeMetadata = {
    id: 'episode-2',
    title: 'The Discovery',
    description: 'New worlds are discovered as the adventure continues',
    thumbnail: '/movie-poster-2.svg',
    src: '/videos/episode-2.mp4',
    introStart: 0,
    introEnd: 42,
    duration: 2640,
    seriesId: 'series-1',
    seasonNumber: 1,
    episodeNumber: 2
  };

  // Simulate time updates (in real implementation, this would come from video player)
  useEffect(() => {
    if (!videoRef) return;

    const handleTimeUpdate = () => {
      setCurrentTime(videoRef.currentTime);
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    videoRef.addEventListener('timeupdate', handleTimeUpdate);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      videoRef.removeEventListener('timeupdate', handleTimeUpdate);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [videoRef]);

  const handlePlayNext = (episodeData: EpisodeMetadata) => {
    console.log('🎬 Playing next episode:', episodeData.title);
    // In a real implementation, this would update the video source
    // and trigger the episode change in the parent component
    if (videoRef) {
      videoRef.src = episodeData.src;
      videoRef.currentTime = 0;
      videoRef.play();
    }
  };

  const toggleFullscreen = () => {
    if (!videoRef) return;
    
    if (!document.fullscreenElement) {
      videoRef.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Calculate time remaining for display
  const timeRemaining = Math.max(0, duration - currentTime);
  const minutesRemaining = Math.floor(timeRemaining / 60);
  const secondsRemaining = Math.floor(timeRemaining % 60);

  // Determine if button should be visible (2 minutes before end)
  const triggerTime = 120;
  const shouldShowButton = timeRemaining <= triggerTime && timeRemaining > 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl">
        <h1 className="mb-4 text-2xl font-bold text-center">NextEpisodeButton Example</h1>
        
        <div className={`relative ${isFullscreen ? 'fullscreen' : ''}`}>
          <video
            ref={setVideoRef}
            className="w-full h-auto rounded-lg shadow-lg"
            controls
            src="/sample-video.mp4"
            poster="/placeholder-movie.jpg"
          />
          
          <NextEpisodeButton
            currentTime={currentTime}
            duration={duration}
            nextEpisode={nextEpisode}
            onPlayNext={handlePlayNext}
            triggerTime={triggerTime}
            className="next-episode-button"
          />
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex gap-4">
            <button
              onClick={toggleFullscreen}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Toggle Fullscreen
            </button>
            
            <button
              onClick={() => setCurrentTime(2580)} // Jump to 2 minutes before end
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Jump to Trigger Time
            </button>
            
            <button
              onClick={() => setCurrentTime(0)} // Reset to beginning
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Reset Time
            </button>
          </div>
          
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Current Time:</strong> {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}</p>
            <p><strong>Duration:</strong> {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}</p>
            <p><strong>Time Remaining:</strong> {minutesRemaining}:{String(secondsRemaining).padStart(2, '0')}</p>
            <p><strong>Trigger Time:</strong> {triggerTime} seconds ({Math.floor(triggerTime / 60)}:{String(triggerTime % 60).padStart(2, '0')})</p>
            <p><strong>Button Visible:</strong> {shouldShowButton ? 'Yes' : 'No'}</p>
            <p><strong>Fullscreen:</strong> {isFullscreen ? 'Yes' : 'No'}</p>
          </div>

          <div className="text-sm text-gray-500">
            <p className="font-semibold mb-2">NextEpisodeButton Features:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Appears 2 minutes (120 seconds) before episode ends</li>
              <li>Configurable trigger timing via triggerTime prop</li>
              <li>Smooth entrance/exit animations with 300ms transitions</li>
              <li>Glassmorphism design matching SkipIntroButton style</li>
              <li>Responsive positioning to avoid conflicts with other controls</li>
              <li>Enhanced fullscreen mode support with proper z-index layering</li>
              <li>Haptic feedback simulation on click</li>
              <li>Motion preference respect for accessibility</li>
              <li>Visual next episode icon with responsive sizing</li>
              <li>GPU-accelerated transforms for smooth performance</li>
              <li>Keyboard navigation (Enter/Space keys)</li>
              <li>Enhanced focus states and comprehensive ARIA support</li>
              <li>Screen reader announcements when button becomes available</li>
              <li>Automatic cleanup of accessibility announcements</li>
            </ul>
          </div>

          <div className="text-sm text-gray-500">
            <p className="font-semibold mb-2">Next Episode Information:</p>
            <ul className="list-inside list-disc space-y-1">
              <li><strong>Title:</strong> {nextEpisode.title}</li>
              <li><strong>Season:</strong> {nextEpisode.seasonNumber}, <strong>Episode:</strong> {nextEpisode.episodeNumber}</li>
              <li><strong>Description:</strong> {nextEpisode.description}</li>
              <li><strong>Duration:</strong> {Math.floor(nextEpisode.duration / 60)} minutes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayerWithNextEpisodeButton;