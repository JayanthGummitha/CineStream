'use client'
import React, { useState, useEffect, useRef } from 'react';

interface CaptionOption {
  value: string;
  label: string;
  language: string;
  kind: string;
  src?: string;        // Optional for DASH tracks
  type?: string;       // Optional for DASH tracks  
  isDefault?: boolean;
  default?: boolean;   // Alternative property name
}

interface CaptionDisplayProps {
  activeCaption: string;
  availableCaptions: CaptionOption[];
  currentTime: number;
  isVisible: boolean;
  // Add these new props for DASH support
  playerRef?: React.RefObject<any>;
  isDashStream?: boolean;
}

interface CaptionCue {
  start: number;
  end: number;
  text: string;
}

export const CaptionDisplay: React.FC<CaptionDisplayProps> = ({
  activeCaption,
  availableCaptions,
  currentTime,
  isVisible,
  playerRef,
  isDashStream = false
}) => {
  const [currentCue, setCurrentCue] = useState<CaptionCue | null>(null);
  const [captions, setCaptions] = useState<CaptionCue[]>([]);
  const [dashCueText, setDashCueText] = useState<string>('');
  const loadedCaptionsRef = useRef<Map<string, CaptionCue[]>>(new Map());

  // Parse VTT file content
  const parseVTT = (vttContent: string): CaptionCue[] => {
    const lines = vttContent.split('\n');
    const cues: CaptionCue[] = [];
    let currentCue: Partial<CaptionCue> = {};
    let inCue = false;
    let textLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip WEBVTT header and empty lines
      if (line === '' || line.startsWith('WEBVTT')) {
        if (inCue && currentCue.start !== undefined && currentCue.end !== undefined) {
          cues.push({
            start: currentCue.start,
            end: currentCue.end,
            text: textLines.join('\n')
          });
          currentCue = {};
          textLines = [];
          inCue = false;
        }
        continue;
      }

      // Check for timestamp line
      if (line.includes('-->')) {
        const [startTime, endTime] = line.split('-->').map(t => t.trim());
        currentCue.start = parseTimeToSeconds(startTime);
        currentCue.end = parseTimeToSeconds(endTime);
        inCue = true;
        continue;
      }

      // Collect text lines
      if (inCue) {
        textLines.push(line);
      }
    }

    // Add final cue if exists
    if (inCue && currentCue.start !== undefined && currentCue.end !== undefined) {
      cues.push({
        start: currentCue.start,
        end: currentCue.end,
        text: textLines.join('\n')
      });
    }

    return cues;
  };

  // Convert time string to seconds
  const parseTimeToSeconds = (timeString: string): number => {
    const parts = timeString.split(':');
    const seconds = parts[parts.length - 1].split(',')[0]; // Remove milliseconds
    const minutes = parts[parts.length - 2] || '0';
    const hours = parts[parts.length - 3] || '0';

    return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseFloat(seconds);
  };

  // Load caption file for static VTT files
  const loadStaticCaptions = async (captionData: CaptionOption) => {
    if (!captionData.src) return [];

    try {
      const response = await fetch(captionData.src);
      const vttContent = await response.text();
      const parsedCaptions = parseVTT(vttContent);
      return parsedCaptions;
    } catch (error) {
      console.error('Failed to load static captions:', error);
      return [];
    }
  };

  // Handle DASH embedded captions
  const handleDashCaptions = () => {
    if (!playerRef?.current) return;

    try {
      // For DASH streams, captions are handled by the video element itself
      // We can use the track's cues or rely on the browser's native rendering
      const videoElement = playerRef.current.querySelector('video');
      if (!videoElement) return;

      const textTracks = videoElement.textTracks;
      for (let i = 0; i < textTracks.length; i++) {
        const track = textTracks[i];
        if (track.mode === 'showing' && track.language === activeCaption) {
          // For DASH, let the browser handle rendering
          // We can hide our custom display and let native captions show
          setDashCueText('');
          return;
        }
      }
    } catch (error) {
      console.error('Error handling DASH captions:', error);
    }
  };

  // Load captions based on type (static VTT or DASH)
  useEffect(() => {
    const loadCaptions = async () => {
      if (activeCaption === 'off') {
        setCaptions([]);
        setDashCueText('');
        return;
      }

      const captionData = availableCaptions.find(cap => 
        cap.language === activeCaption || cap.value === activeCaption
      );
      
      if (!captionData) return;

      // Handle DASH embedded captions
      if (isDashStream || !captionData.src) {
        handleDashCaptions();
        setCaptions([]); // Clear VTT captions
        return;
      }

      // Handle static VTT files
      // Check if already loaded
      if (loadedCaptionsRef.current.has(activeCaption)) {
        setCaptions(loadedCaptionsRef.current.get(activeCaption)!);
        return;
      }

      const parsedCaptions = await loadStaticCaptions(captionData);
      loadedCaptionsRef.current.set(activeCaption, parsedCaptions);
      setCaptions(parsedCaptions);
    };

    loadCaptions();
  }, [activeCaption, availableCaptions, isDashStream]);

  // Update current cue based on time (for VTT files)
  useEffect(() => {
    if (captions.length === 0) {
      setCurrentCue(null);
      return;
    }

    const activeCue = captions.find(cue =>
      currentTime >= cue.start && currentTime <= cue.end
    );

    setCurrentCue(activeCue || null);
  }, [currentTime, captions]);

  // Don't render custom display for DASH embedded captions
  if (isDashStream && activeCaption !== 'off') {
    // Let the browser handle DASH caption rendering natively
    return null;
  }

  // Don't render if captions are off or not visible
  if (activeCaption === 'off' || !isVisible || !currentCue) {
    return null;
  }

  return (
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
      <div className="bg-black/80 text-white text-center px-4 py-2 rounded-lg shadow-lg max-w-2xl mx-2">
        <div
          className="text-lg font-medium leading-relaxed"
          style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            fontFamily: 'Arial, sans-serif',
            lineHeight: '1.4'
          }}
          dangerouslySetInnerHTML={{
            __html: currentCue.text
              .replace(/\n/g, '<br>')
              .replace(/<c[^>]*>/g, '<span>')
              .replace(/<\/c>/g, '</span>')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
          }}
        />
      </div>
    </div>
  );
};