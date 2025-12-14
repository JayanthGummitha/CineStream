'use client';

import { useState } from 'react';
import { ProfileAvatar, MaturityRating, BlockableGenre, BLOCKABLE_GENRES, MATURITY_RATING_LEVELS } from '@/types/profile';
import { useProfiles } from '@/contexts/ProfileContext';
import { AVAILABLE_AVATARS } from '@/lib/profile-service';
import { AVATAR_COLORS, AVATAR_ICONS } from './ProfileCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Baby, Loader2, Shield, ChevronDown, ChevronUp } from 'lucide-react';

interface AddProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MATURITY_OPTIONS: { value: MaturityRating; label: string; description: string }[] = [
  { value: 'TV-Y', label: 'TV-Y', description: 'All Children' },
  { value: 'TV-Y7', label: 'TV-Y7', description: 'Older Children (7+)' },
  { value: 'G', label: 'G', description: 'General Audiences' },
  { value: 'PG', label: 'PG', description: 'Parental Guidance' },
  { value: 'TV-PG', label: 'TV-PG', description: 'Parental Guidance' },
  { value: 'PG-13', label: 'PG-13', description: 'Parents Cautioned (13+)' },
  { value: 'TV-14', label: 'TV-14', description: 'Parents Cautioned (14+)' },
  { value: 'R', label: 'R', description: 'Restricted (17+)' },
  { value: 'TV-MA', label: 'TV-MA', description: 'Mature Audiences' },
  { value: 'NC-17', label: 'NC-17', description: 'Adults Only (No restrictions)' },
];

export function AddProfileModal({ open, onOpenChange }: AddProfileModalProps) {
  const { createProfile } = useProfiles();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<ProfileAvatar>('avatar-1');
  const [isKids, setIsKids] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Parental control options
  const [showRestrictions, setShowRestrictions] = useState(false);
  const [enableParentalControls, setEnableParentalControls] = useState(false);
  const [maxMaturityRating, setMaxMaturityRating] = useState<MaturityRating>('NC-17');
  const [blockedGenres, setBlockedGenres] = useState<BlockableGenre[]>([]);
  const [requirePinToSwitch, setRequirePinToSwitch] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }

    if (name.length > 20) {
      setError('Name must be 20 characters or less');
      return;
    }

    setIsLoading(true);

    try {
      // Build custom parental controls if enabled or if it's a kids profile
      const customControls = (enableParentalControls || isKids) ? {
        enabled: true,
        maxMaturityRating: isKids ? 'PG' as MaturityRating : maxMaturityRating,
        blockedGenres: isKids 
          ? ['Horror', 'Violence', 'Adult', 'Drugs', 'Gambling', 'War', 'Crime'] as BlockableGenre[]
          : blockedGenres,
        requirePinToSwitch: isKids ? true : requirePinToSwitch,
      } : undefined;

      await createProfile(name.trim(), avatar, isKids, customControls);
      
      // Reset form
      resetForm();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setAvatar('avatar-1');
    setIsKids(false);
    setShowRestrictions(false);
    setEnableParentalControls(false);
    setMaxMaturityRating('NC-17');
    setBlockedGenres([]);
    setRequirePinToSwitch(false);
  };

  const handleKidsToggle = (checked: boolean) => {
    setIsKids(checked);
    // Auto-select kids avatar when enabling kids mode
    if (checked && !avatar.startsWith('kids-')) {
      setAvatar('kids-1');
    } else if (!checked && avatar.startsWith('kids-')) {
      setAvatar('avatar-1');
    }
    // Auto-enable restrictions for kids
    if (checked) {
      setEnableParentalControls(true);
      setShowRestrictions(true);
    }
  };

  const handleGenreToggle = (genre: BlockableGenre) => {
    setBlockedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const filteredAvatars = AVAILABLE_AVATARS.filter(a => 
    isKids ? a.isKids : !a.isKids
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-lg bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Add Profile</DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a new profile for another person watching CineStream.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          {/* Name Input */}
          <div className="space-y-3 grid">
            <Label htmlFor="name" className="text-white">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter profile name"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
              maxLength={20}
              autoFocus
            />
          </div>

          {/* Kids Profile Toggle */}
          <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Baby className="w-5 h-5 text-yellow-400" />
              <div>
                <Label htmlFor="kids" className="text-white font-medium">Kids Profile</Label>
                <p className="text-sm text-gray-400">
                  Auto-applies strict content restrictions
                </p>
              </div>
            </div>
            <Switch
              id="kids"
              checked={isKids}
              onCheckedChange={handleKidsToggle}
            />
          </div>

          {/* Content Restrictions Section */}
          {!isKids && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowRestrictions(!showRestrictions)}
                className="flex items-center justify-between w-full p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <div className="text-left">
                    <span className="text-white font-medium block">Content Restrictions</span>
                    <span className="text-sm text-gray-400">
                      {enableParentalControls ? 'Enabled' : 'Optional - Set viewing limits'}
                    </span>
                  </div>
                </div>
                {showRestrictions ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {showRestrictions && (
                <div className="space-y-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                  {/* Enable Parental Controls */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enable-controls" className="text-white">
                      Enable Parental Controls
                    </Label>
                    <Switch
                      id="enable-controls"
                      checked={enableParentalControls}
                      onCheckedChange={setEnableParentalControls}
                    />
                  </div>

                  {enableParentalControls && (
                    <>
                      {/* Maturity Rating */}
                      <div className="space-y-2">
                        <Label className="text-white text-sm">Maximum Maturity Rating</Label>
                        <Select
                          value={maxMaturityRating}
                          onValueChange={(value) => setMaxMaturityRating(value as MaturityRating)}
                        >
                          <SelectTrigger className="bg-zinc-700 border-zinc-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            {MATURITY_OPTIONS.map((option) => (
                              <SelectItem 
                                key={option.value} 
                                value={option.value}
                                className="text-white hover:bg-zinc-700"
                              >
                                <span className="font-medium">{option.label}</span>
                                <span className="text-gray-400 ml-2 text-xs">- {option.description}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Blocked Genres */}
                      <div className="space-y-2">
                        <Label className="text-white text-sm">Block Genres</Label>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-zinc-700/30 rounded-lg">
                          {BLOCKABLE_GENRES.map((genre) => (
                            <label
                              key={genre.id}
                              className="flex items-center gap-2 p-2 rounded hover:bg-zinc-700/50 cursor-pointer"
                            >
                              <Checkbox
                                checked={blockedGenres.includes(genre.id)}
                                onCheckedChange={() => handleGenreToggle(genre.id)}
                                className="border-zinc-500 data-[state=checked]:bg-red-600"
                              />
                              <span className="text-sm text-white">{genre.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Require PIN to Switch */}
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-700">
                        <div>
                          <Label htmlFor="require-pin" className="text-white text-sm">
                            PIN-Protected Profile
                          </Label>
                          <p className="text-xs text-gray-400">
                            Require PIN to access this profile
                          </p>
                        </div>
                        <Switch
                          id="require-pin"
                          checked={requirePinToSwitch}
                          onCheckedChange={setRequirePinToSwitch}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Kids Profile Restrictions Info */}
          {isKids && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <h4 className="text-yellow-400 font-medium text-sm mb-2">Kids Profile Restrictions</h4>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• Max rating: PG (Parental Guidance)</li>
                <li>• Blocked: Horror, Violence, Adult, Drugs, Gambling, War, Crime</li>
                <li>• PIN required to switch profiles</li>
              </ul>
            </div>
          )}

          {/* Avatar Selection */}
          <div className="grid space-y-4">
            <Label className="text-white">Choose Avatar</Label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {filteredAvatars.map((avatarOption) => (
                <button
                  key={avatarOption.id}
                  type="button"
                  onClick={() => setAvatar(avatarOption.id)}
                  className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-all',
                    AVATAR_COLORS[avatarOption.id],
                    avatar === avatarOption.id 
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900' 
                      : 'opacity-60 hover:opacity-100'
                  )}
                >
                  {AVATAR_ICONS[avatarOption.id]}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-zinc-700 text-gray-300 hover:bg-zinc-800"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Profile'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
