'use client';

import { useState, useRef, useEffect } from 'react';
import { Subtitles, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface CaptionOption {
  src: string;      // VTT file URL (required to match other interfaces)
  label: string;    // Display name
  language: string; // Language code
  kind?: string;    // Track kind (subtitles/captions) - optional
  type?: string;    // File type (vtt) - optional
  default?: boolean; // Default track flag
}

interface VideoCaptionProps {
  activeCaption: string;           // Currently active caption ID
  availableCaptions: CaptionOption[]; // List of available caption options
  onCaptionChange: (captionId: string) => void; // Callback for caption changes
}

const VideoCaption = ({
  activeCaption,
  availableCaptions,
  onCaptionChange
}: VideoCaptionProps) => {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Create caption options with "Off" option
  const captionOptions = [
    { id: 'off', label: 'Off' },
    ...(availableCaptions || []).map(caption => ({
      id: caption.language,
      label: caption.label
    }))
  ];

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!mounted) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, mounted]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleCaptionSelect = (captionId: string) => {
    onCaptionChange(captionId);
    setIsOpen(false);
    console.log(captionId);
  };

  const getActiveCaption = () => {
    const option = captionOptions.find(item => item.id === activeCaption);
    return option?.label || 'Off';
  };

  const isActiveCaptionEnabled = () => {
    return activeCaption !== 'off';
  };

  return (
    <div className="flex items-center justify-center">
      <div className="relative inline-block" ref={dropdownRef}>
        {/* Caption Button */}
        <div className="relative">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(!isOpen)}
                  className={`text-white hover:bg-white/20 p-2 w-12 h-12 transition-colors ${isActiveCaptionEnabled()
                      ? 'text-white hover:text-white/90'
                      : 'text-white/70 hover:text-white/80'
                    }`}
                  title={`Captions: ${getActiveCaption()}`}
                  aria-label={`Captions: ${getActiveCaption()}`}
                  aria-expanded={isOpen}
                  aria-haspopup="listbox"
                >
                  <Subtitles size={20} />
                  {isActiveCaptionEnabled() && (
                    <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-red-600 rounded-full"></div>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-white mx-auto">
                  {isActiveCaptionEnabled() ? 'Caption-On' : 'Caption-Off'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Caption Options Dropdown */}
        {isOpen && (
          <div
            className="absolute bottom-14 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-md shadow-2xl border rounded-xl border-white/20 min-w-40 z-50"
            role="listbox"
            aria-label="Caption language options"
          >
            <div className="p-2">
              <div className="text-white/60 text-xs uppercase tracking-wide mb-2 px-3 pt-1">
                Captions
              </div>
              <div className="space-y-1">
                {captionOptions.map((caption) => (
                  <button
                    key={caption.id}
                    onClick={() => handleCaptionSelect(caption.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 ${caption.id === activeCaption
                        ? 'bg-blue-600 text-white'
                        : 'text-white/80 hover:bg-white/10'
                      }`}
                    role="option"
                    aria-selected={caption.id === activeCaption}
                  >
                    <span>{caption.label}</span>
                    {caption.id === activeCaption && (
                      <Check size={16} className="text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCaption;