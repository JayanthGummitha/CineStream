'use client';

import { useState } from 'react';
import { Settings, ChevronDown, Subtitles, Monitor, Languages, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface SettingItem {
  id: string;
  label: string;
  active: boolean;
  value?: number;
}

interface QualityOption {
  value: string;
  label: string;
  src: string;
}

interface AudioSource {
  src: string;
  language: string;
  label: string;
  default?: boolean;
}

interface CaptionOption {
  src: string;
  language: string;
  label: string;
  default?: boolean;
}

interface SettingsState {
  audioTracks: SettingItem[];
  qualities: SettingItem[];
  playback: SettingItem[];
  captions: SettingItem[];
}

interface VideoSettingsProps {
  setPlaybackRate: (rate: number) => void;
  setCurrentQuality: (quality: string) => void;
  availableQualities?: QualityOption[];
  currentQuality?: string;
  currentAudioTrack?: string;
  availableAudioTracks?: AudioSource[];
  onAudioTrackChange?: (language: string) => void;
  selectedQualityValue?: string;
  isAutoQuality?: boolean;
  availableCaptions?: CaptionOption[];
  currentCaption?: string;
  onCaptionChange?: (language: string) => void;
  isYouTubeSource?: boolean; // Hide unsupported features for YouTube
}

const VideoSettings = ({
  setPlaybackRate,
  setCurrentQuality,
  availableQualities = [],
  currentQuality = 'auto',
  currentAudioTrack = 'en',
  availableAudioTracks = [],
  onAudioTrackChange,
  selectedQualityValue,
  isAutoQuality = false,
  availableCaptions = [],
  currentCaption = 'off',
  onCaptionChange,
  isYouTubeSource = false,
}: VideoSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<keyof SettingsState | null>(null);

  const [settings, setSettings] = useState<SettingsState>({
    playback: [
      { id: '0.25', label: '0.25x', active: false, value: 0.25 },
      { id: '0.5', label: '0.5x', active: false, value: 0.5 },
      { id: '0.75', label: '0.75x', active: false, value: 0.75 },
      { id: '1', label: 'Normal', active: true, value: 1 },
      { id: '1.25', label: '1.25x', active: false, value: 1.25 },
      { id: '1.5', label: '1.5x', active: false, value: 1.5 },
      { id: '1.75', label: '1.75x', active: false, value: 1.75 },
      { id: '2', label: '2x', active: false, value: 2 }
    ],
    audioTracks: [],
    qualities: [],
    captions: [],
  });

  const getCurrentQualities = () => {
    if (availableQualities.length > 0) {
      return availableQualities.map(quality => {
        const compareValue = selectedQualityValue || currentQuality;
        let isActive = false;
        if (quality.value === 'auto') {
          isActive = isAutoQuality || compareValue === 'auto';
        } else {
          isActive = quality.value === compareValue ||
            quality.label === compareValue ||
            quality.value.toLowerCase() === compareValue.toLowerCase();
        }
        return {
          id: quality.value,
          label: quality.label,
          active: isActive
        };
      });
    }
    return [];
  };

  const getActiveLabel = (category: keyof SettingsState) => {
    if (category === 'qualities') {
      const compareValue = selectedQualityValue || currentQuality;
      if (isAutoQuality || compareValue === 'auto') {
        return 'Auto';
      }
      const activeQuality = availableQualities.find(q =>
        q.value === compareValue ||
        q.label === compareValue ||
        q.value.toLowerCase() === compareValue.toLowerCase()
      );
      return activeQuality?.label || compareValue || 'Auto';
    }

    if (category === 'audioTracks' && availableAudioTracks.length > 0) {
      const activeAudio = availableAudioTracks.find(a => a.language === currentAudioTrack);
      return activeAudio?.label || 'English';
    }

    if (category === 'captions') {
      if (currentCaption === 'off') return 'Off';
      const activeCaption = availableCaptions.find(c => c.language === currentCaption);
      return activeCaption?.label || 'Off';
    }

    return settings[category].find(item => item.active)?.label || '';
  };

  const handleSettingChange = (category: keyof SettingsState, id: string) => {
    if (category === 'playback') {
      setSettings(prev => ({
        ...prev,
        playback: prev.playback.map(item => ({ ...item, active: item.id === id }))
      }));
      const selectedSpeed = settings.playback.find(item => item.id === id);
      if (selectedSpeed?.value) {
        setPlaybackRate(Number(selectedSpeed.value));
      }
    }

    if (category === 'qualities' && setCurrentQuality) {
      setCurrentQuality(id);
    }

    if (category === 'audioTracks' && onAudioTrackChange) {
      onAudioTrackChange(id);
    }

    if (category === 'captions' && onCaptionChange) {
      onCaptionChange(id);
    }

    setActivePanel(null);
    setIsOpen(false);
  };

  const getCurrentAudioTracks = () => {
    if (availableAudioTracks.length > 0) {
      return availableAudioTracks.map(audio => ({
        id: audio.language,
        label: audio.label,
        active: audio.language === currentAudioTrack
      }));
    }
    return [];
  };

  const getCurrentCaptions = () => {
    const captionItems = availableCaptions.map(caption => ({
      id: caption.language,
      label: caption.label,
      active: caption.language === currentCaption
    }));
    captionItems.unshift({ id: 'off', label: 'Off', active: currentCaption === 'off' });
    return captionItems;
  };

  const settingsOptions = [
    {
      id: 'playback' as keyof SettingsState,
      label: 'Playback Speed',
      icon: Subtitles, // This seems to be a mistake in the original code, should be something else.
      items: settings.playback,
      activeLabel: getActiveLabel('playback'),
      show: true
    },

    {
      id: 'audioTracks' as keyof SettingsState,
      label: 'Audio',
      icon: Languages,
      items: getCurrentAudioTracks(),
      activeLabel: getActiveLabel('audioTracks'),
      show: availableAudioTracks.length > 0
    },
    {
      id: 'qualities' as keyof SettingsState,
      label: 'Quality',
      icon: Monitor,
      items: getCurrentQualities(),
      activeLabel: getActiveLabel('qualities'),
      show: true
    }
  ].filter(option => option.show);

  return (
    <div className="flex items-center justify-center">
      <div className="relative inline-block">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="text-white hover:bg-white/20 p-2"
                aria-label="Video Settings"
              >
                <Settings size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-white mx-auto">Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {isOpen && (
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 min-w-64 z-50">
            {activePanel ? (
              <div className="p-4">
                <div className="flex items-center mb-3">
                  <button
                    onClick={() => setActivePanel(null)}
                    className="text-white/70 hover:text-white mr-2"
                  >
                    ←
                  </button>
                  <h3 className="text-white font-medium">
                    {settingsOptions.find(opt => opt.id === activePanel)?.label}
                  </h3>
                </div>
                <div className="space-y-2">
                  {settingsOptions.find(opt => opt.id === activePanel)?.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleSettingChange(activePanel, item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${item.active ? ' text-white' : 'text-white/80 hover:bg-white/10'
                        }`}
                    >
                      <div className="flex  text-white justify-between w-full items-center">
                        <span className=''>{item.label}</span>
                        {item.active && <Check size={16} className="text-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4">
                <h2 className="text-white font-medium mb-3 text-sm uppercase tracking-wide">
                  Settings
                </h2>
                <div className="space-y-1">
                  {settingsOptions.map(option => {
                    const IconComponent = option.icon;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setActivePanel(option.id)}
                        className="w-full flex items-center justify-between px-3 py-3 text-white/80 hover:bg-white/10 rounded-md transition-colors group"
                      >
                        <div className="flex items-center">
                          <IconComponent size={16} className="mr-3 text-white/60" />
                          <span className="text-sm">{option.label}</span>
                        </div>
                        <div className="flex items-center text-xs text-white/50">
                          <span className="mr-2">{option.activeLabel}</span>
                          <ChevronDown size={14} className="rotate-[-90deg]" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoSettings;
