'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Profile, ProfileAvatar, MaturityRating, MATURITY_RATING_LEVELS, BlockableGenre, BLOCKABLE_GENRES } from '@/types/profile';
import { useProfiles } from '@/contexts/ProfileContext';
import { useParentalControls } from '@/hooks/useParentalControls';
import { AVAILABLE_AVATARS } from '@/lib/profile-service';
import { getMaturityRatingDescription } from '@/lib/parental-controls';
import { AVATAR_COLORS, AVATAR_ICONS } from './ProfileCard';
import { PinModal } from '../parental/PinModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ArrowLeft, Trash2, Lock, Baby, Shield, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ProfileEditorProps {
  profileId: string;
}

export function ProfileEditor({ profileId }: ProfileEditorProps) {
  const router = useRouter();
  const { accountProfiles, updateProfile, deleteProfile, updateParentalControls } = useProfiles();
  const { setPin, removePin, hasPinSet } = useParentalControls();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<ProfileAvatar>('avatar-1');
  const [isKids, setIsKids] = useState(false);
  const [parentalEnabled, setParentalEnabled] = useState(false);
  const [maxRating, setMaxRating] = useState<MaturityRating>('NC-17');
  const [requirePinToSwitch, setRequirePinToSwitch] = useState(false);
  const [blockedGenres, setBlockedGenres] = useState<BlockableGenre[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinMode, setPinMode] = useState<'set' | 'change'>('set');

  // Load profile data
  useEffect(() => {
    if (accountProfiles) {
      const found = accountProfiles.profiles.find(p => p.id === profileId);
      if (found) {
        setProfile(found);
        setName(found.name);
        setAvatar(found.avatar);
        setIsKids(found.isKids);
        setParentalEnabled(found.parentalControls.enabled);
        setMaxRating(found.parentalControls.maxMaturityRating);
        setRequirePinToSwitch(found.parentalControls.requirePinToSwitch);
        setBlockedGenres(found.parentalControls.blockedGenres || []);
      }
    }
  }, [accountProfiles, profileId]);

  const handleSave = async () => {
    if (!profile) return;
    setError(null);
    setIsLoading(true);

    try {
      await updateProfile(profile.id, { name, avatar });
      await updateParentalControls({
        enabled: parentalEnabled,
        maxMaturityRating: maxRating,
        requirePinToSwitch,
        blockedGenres,
      });
      router.push('/profiles');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!profile) return;
    setIsLoading(true);

    try {
      await deleteProfile(profile.id);
      router.push('/profiles');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete profile');
      setIsLoading(false);
    }
  };

  const handleSetPin = () => {
    setPinMode(hasPinSet ? 'change' : 'set');
    setShowPinModal(true);
  };

  const handleRemovePin = () => {
    removePin();
    setRequirePinToSwitch(false);
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  const filteredAvatars = AVAILABLE_AVATARS.filter(a => 
    isKids ? a.isKids : !a.isKids
  );

  const maturityRatings = Object.keys(MATURITY_RATING_LEVELS) as MaturityRating[];

  return (
    <div className="min-h-screen bg-zinc-950 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/profiles')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
        </div>

        <div className="space-y-8">
          {/* Avatar & Name */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Current Avatar */}
            <div
              className={cn(
                'w-32 h-32 rounded-lg flex items-center justify-center text-5xl flex-shrink-0',
                AVATAR_COLORS[avatar]
              )}
            >
              {AVATAR_ICONS[avatar]}
              {isKids && (
                <div className="absolute top-1 left-1 bg-yellow-400 rounded-full p-1">
                  <Baby className="w-4 h-4 text-yellow-900" />
                </div>
              )}
            </div>

            {/* Name Input */}
            <div className="flex-1 space-y-4 w-full">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Profile Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  maxLength={20}
                />
              </div>

              {/* Kids Profile Badge */}
              {isKids && (
                <div className="flex items-center gap-2 text-yellow-400 text-sm">
                  <Baby className="w-4 h-4" />
                  <span>Kids Profile - Only shows age-appropriate content</span>
                </div>
              )}
            </div>
          </div>

          {/* Avatar Selection */}
          <div className="space-y-3">
            <Label className="text-white">Change Avatar</Label>
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
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950' 
                      : 'opacity-60 hover:opacity-100'
                  )}
                >
                  {AVATAR_ICONS[avatarOption.id]}
                </button>
              ))}
            </div>
          </div>

          {/* Parental Controls Section */}
          {!isKids && (
            <div className="space-y-4 p-6 bg-zinc-900 rounded-lg border border-zinc-800">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Parental Controls</h2>
              </div>

              {/* Enable Parental Controls */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Enable Restrictions</Label>
                  <p className="text-sm text-gray-400">Limit content based on maturity rating</p>
                </div>
                <Switch
                  checked={parentalEnabled}
                  onCheckedChange={setParentalEnabled}
                />
              </div>

              {parentalEnabled && (
                <>
                  {/* Max Maturity Rating */}
                  <div className="space-y-2">
                    <Label className="text-white">Maximum Maturity Rating</Label>
                    <Select value={maxRating} onValueChange={(v) => setMaxRating(v as MaturityRating)}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {maturityRatings.map((rating) => (
                          <SelectItem key={rating} value={rating}>
                            {rating} - {getMaturityRatingDescription(rating)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Blocked Genres */}
                  <div className="space-y-3 pt-4 border-t border-zinc-800">
                    <div>
                      <Label className="text-white">Block Content by Genre</Label>
                      <p className="text-sm text-gray-400 mt-1">
                        Select genres to block for this profile
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {BLOCKABLE_GENRES.map((genre) => {
                        const isBlocked = blockedGenres.includes(genre.id);
                        return (
                          <button
                            key={genre.id}
                            type="button"
                            onClick={() => {
                              if (isBlocked) {
                                setBlockedGenres(blockedGenres.filter(g => g !== genre.id));
                              } else {
                                setBlockedGenres([...blockedGenres, genre.id]);
                              }
                            }}
                            className={cn(
                              'p-3 rounded-lg text-left transition-all border',
                              isBlocked
                                ? 'bg-red-600/20 border-red-500/50 text-red-300'
                                : 'bg-zinc-800 border-zinc-700 text-gray-300 hover:bg-zinc-700'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{genre.label}</span>
                              {isBlocked && (
                                <span className="text-xs bg-red-500/30 px-2 py-0.5 rounded">
                                  Blocked
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{genre.description}</p>
                          </button>
                        );
                      })}
                    </div>
                    {blockedGenres.length > 0 && (
                      <p className="text-xs text-gray-400">
                        {blockedGenres.length} genre{blockedGenres.length !== 1 ? 's' : ''} blocked
                      </p>
                    )}
                  </div>

                  {/* PIN Protection */}
                  <div className="space-y-3 pt-4 border-t border-zinc-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Require PIN to Switch</Label>
                        <p className="text-sm text-gray-400">
                          Prevent others from switching to this profile
                        </p>
                      </div>
                      <Switch
                        checked={requirePinToSwitch}
                        onCheckedChange={setRequirePinToSwitch}
                        disabled={!hasPinSet}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={handleSetPin}
                        className="border-zinc-700 text-white hover:bg-zinc-800"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        {hasPinSet ? 'Change PIN' : 'Set PIN'}
                      </Button>
                      {hasPinSet && (
                        <Button
                          variant="ghost"
                          onClick={handleRemovePin}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          Remove PIN
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 bg-white text-black hover:bg-gray-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/profiles')}
              disabled={isLoading}
              className="flex-1 border-zinc-700 text-gray-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            {!profile.isDefault && (
              <Button
                variant="ghost"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isLoading}
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Profile?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will permanently delete the profile &quot;{profile.name}&quot; and all its viewing history.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700 text-gray-300 hover:bg-zinc-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PIN Modal */}
      <PinModal
        open={showPinModal}
        onOpenChange={setShowPinModal}
        onVerified={() => setShowPinModal(false)}
        mode={pinMode}
      />
    </div>
  );
}
