'use client';

import React, { useState, useEffect } from 'react';
import { SkipIntroButton } from './SkipIntroButton';
import { EpisodeMetadata } from '@/lib/episode-metadata';
import { NextEpisodeButton } from './NextEpisodeButton';

// Mock episode data for demonstration
const mockNextEpisode: EpisodeMetadata = {
  id: 'episode-2',
  title: 'The Journey Continues',
  description: 'Our heroes face new challenges as they venture deeper into the unknown territories, discovering secrets that will change everything.',
  thumbnail: '/movie-poster-2.svg',
  src: '/videos/episode-2.mp4',
  introStart: 0,
  introEnd: 45,
  duration: 2700,
  seriesId: 'adventure-series',
  seasonNumber: 1,
  episodeNumber: 2
};

export function ResponsiveVideoOverlaysExample() {
  const [currentTime, setCurrentTime] = useState(0);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showNextEpisode, setShowNextEpisode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Simulate video playback
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 1;
        
        // Show skip intro during intro period (0-45 seconds)
        setShowSkipIntro(newTime >= 0 && newTime <= 45);
        
        // Show next episode overlay at end (simulated at 60 seconds)
        if (newTime >= 60) {
          setShowNextEpisode(true);
          setIsPlaying(false);
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleSkipIntro = () => {
    setCurrentTime(45);
    setShowSkipIntro(false);
  };

  const handlePlayNext = () => {
    setShowNextEpisode(false);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleCancelNext = () => {
    setShowNextEpisode(false);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const resetDemo = () => {
    setCurrentTime(0);
    setIsPlaying(false);
    setShowSkipIntro(false);
    setShowNextEpisode(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8 text-center">
          Responsive Video Overlays Demo
        </h1>
        
        {/* Video Player Container */}
        <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl mb-6 sm:mb-8">
          {/* Simulated Video */}
          <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
                {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-lg sm:text-xl md:text-2xl mb-4">
                {isPlaying ? '▶️ Playing' : '⏸️ Paused'}
              </div>
              <div className="text-sm sm:text-base text-gray-300">
                Simulated Video Content
              </div>
            </div>
          </div>

          {/* Skip Intro Button */}
          {showSkipIntro && (
            <SkipIntroButton
              currentTime={currentTime}
              introStart={0}
              introEnd={45}
              onSkipIntro={handleSkipIntro}
            />
          )}

          {/* Next Episode Overlay */}
         
        </div>

        {/* Controls */}
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Demo Controls</h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={togglePlayback}
              className="netflix-button bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={resetDemo}
              className="netflix-button bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
            >
              Reset Demo
            </button>
            <button
              onClick={() => setCurrentTime(60)}
              className="netflix-button bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
            >
              Jump to End
            </button>
          </div>
        </div>

        {/* Feature Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Skip Intro Button</h3>
            <ul className="text-gray-300 text-sm sm:text-base space-y-2">
              <li>✅ Responsive positioning across screen sizes</li>
              <li>✅ Smooth slide-in/slide-out animations</li>
              <li>✅ Glassmorphism design with backdrop blur</li>
              <li>✅ Touch-friendly sizing on mobile</li>
              <li>✅ Keyboard accessibility (Enter/Space)</li>
              <li>✅ Hover and focus states</li>
            </ul>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Next Episode Overlay</h3>
            <ul className="text-gray-300 text-sm sm:text-base space-y-2">
              <li>✅ Responsive modal layout</li>
              <li>✅ Animated countdown with progress bar</li>
              <li>✅ Smooth fade-in and scale animations</li>
              <li>✅ Mobile-optimized button layout</li>
              <li>✅ Keyboard navigation (Enter/Escape)</li>
              <li>✅ Enhanced visual feedback</li>
            </ul>
          </div>
        </div>

        {/* Responsive Breakpoints Info */}
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mt-6">
          <h3 className="text-lg font-semibold text-white mb-3">Responsive Breakpoints</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="text-gray-300">
              <div className="font-medium text-white">Mobile (&lt; 640px)</div>
              <div>Compact sizing, bottom positioning</div>
            </div>
            <div className="text-gray-300">
              <div className="font-medium text-white">Tablet (640px+)</div>
              <div>Medium sizing, enhanced spacing</div>
            </div>
            <div className="text-gray-300">
              <div className="font-medium text-white">Desktop (1024px+)</div>
              <div>Full sizing, optimal positioning</div>
            </div>
            <div className="text-gray-300">
              <div className="font-medium text-white">Large (1280px+)</div>
              <div>Enhanced effects, larger targets</div>
            </div>
          </div>
        </div>

        {/* Animation Features */}
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mt-6">
          <h3 className="text-lg font-semibold text-white mb-3">Animation Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <div className="font-medium text-white mb-2">Skip Intro Animations</div>
              <ul className="space-y-1">
                <li>• Slide-in from right (desktop)</li>
                <li>• Slide-in from bottom (mobile)</li>
                <li>• Smooth scale transitions</li>
                <li>• Bounce easing for entrance</li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-white mb-2">Overlay Animations</div>
              <ul className="space-y-1">
                <li>• Backdrop blur fade-in</li>
                <li>• Content scale and slide</li>
                <li>• Countdown pulse effects</li>
                <li>• Progress bar animation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}