/**
 * Example usage of Enhanced SkipIntroButton component
 * This file demonstrates how to integrate the SkipIntroButton with a video player
 * showcasing the new animations, responsive design, and accessibility features
 */

import { useState, useEffect } from 'react';
import { SkipIntroButton } from './SkipIntroButton';
import '../styles/skip-intro-animations.css';

export function VideoPlayerWithSkipIntro() {
  const [currentTime, setCurrentTime] = useState(0);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Example intro timing (0-45 seconds)
  const introStart = 0;
  const introEnd = 45;

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

  const handleSkipIntro = () => {
    if (videoRef) {
      console.log('🎬 Skipping intro from', currentTime, 'to', introEnd);
      videoRef.currentTime = introEnd;
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl">
        <h1 className="mb-4 text-2xl font-bold text-center">Enhanced SkipIntroButton Example</h1>
        
        <div className={`relative ${isFullscreen ? 'fullscreen' : ''}`}>
          <video
            ref={setVideoRef}
            className="w-full h-auto rounded-lg shadow-lg"
            controls
            src="/sample-video.mp4"
            poster="/placeholder-movie.jpg"
          />
          
          <SkipIntroButton
            currentTime={currentTime}
            introStart={introStart}
            introEnd={introEnd}
            onSkipIntro={handleSkipIntro}
            className="skip-intro-button"
          />
        </div>

        <div className="mt-6 space-y-4">
          <button
            onClick={toggleFullscreen}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Toggle Fullscreen
          </button>
          
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Current Time:</strong> {currentTime.toFixed(1)}s</p>
            <p><strong>Intro Range:</strong> {introStart}s - {introEnd}s</p>
            <p><strong>Button Visible:</strong> {currentTime >= introStart && currentTime <= introEnd ? 'Yes' : 'No'}</p>
            <p><strong>Fullscreen:</strong> {isFullscreen ? 'Yes' : 'No'}</p>
          </div>

          <div className="text-sm text-gray-500">
            <p className="font-semibold mb-2">Enhanced Features:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Smooth entrance/exit animations with 300ms transitions</li>
              <li>Glassmorphism design with backdrop blur and border effects</li>
              <li>Responsive positioning (mobile-first approach)</li>
              <li>Enhanced fullscreen mode support with proper z-index layering</li>
              <li>Haptic feedback simulation on click</li>
              <li>Motion preference respect for accessibility</li>
              <li>Visual skip forward icon with responsive sizing</li>
              <li>GPU-accelerated transforms for smooth performance</li>
              <li>Keyboard navigation (Enter/Space keys)</li>
              <li>Enhanced focus states and ARIA support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}