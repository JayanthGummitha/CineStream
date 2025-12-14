'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Profile } from '@/types/profile';
import { useProfiles } from '@/contexts/ProfileContext';
import { ProfileCard } from './ProfileCard';
import { AddProfileModal } from './AddProfileModal';
import { PinModal } from '../parental/PinModal';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileSelectorProps {
  onProfileSelected?: (profile: Profile) => void;
  showManageButton?: boolean;
  className?: string;
}

export function ProfileSelector({ 
  onProfileSelected, 
  showManageButton = true,
  className 
}: ProfileSelectorProps) {
  const router = useRouter();
  const { 
    accountProfiles, 
    activeProfile, 
    switchProfile, 
    isLoading,
    requiresPinToSwitch,
    clearOwnerSession,
    isOwnerSession
  } = useProfiles();

  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [pendingProfileId, setPendingProfileId] = useState<string | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);

  const handleProfileClick = async (profile: Profile) => {
    if (isEditing) {
      router.push(`/profiles/edit/${profile.id}`);
      return;
    }

    // Check if PIN is required
    const pinRequired = requiresPinToSwitch(profile.id);
    const isDifferentProfile = profile.id !== activeProfile?.id;

    if (pinRequired && isDifferentProfile) {
      setPendingProfileId(profile.id);
      setShowPinModal(true);
      return;
    }

    await selectProfile(profile.id);
  };

  const selectProfile = async (profileId: string) => {
    try {
      const profile = await switchProfile(profileId);
      
      // Clear owner session when switching to any non-default profile
      if (!profile.isDefault && isOwnerSession) {
        clearOwnerSession();
      }
      
      onProfileSelected?.(profile);
      router.push('/');
    } catch (error) {
      console.error('Failed to switch profile:', error);
    }
  };

  const handlePinVerified = () => {
    setShowPinModal(false);
    if (pendingProfileId) {
      selectProfile(pendingProfileId);
      setPendingProfileId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    );
  }

  const profiles = accountProfiles?.profiles || [];
  const canAddMore = profiles.length < (accountProfiles?.maxProfiles || 5);

  return (
    <div className={cn('flex flex-col items-center gap-8', className)}>
      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-white">
        {isEditing ? 'Manage Profiles' : "Who's watching?"}
      </h1>

      {/* Profiles Grid */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 max-w-3xl">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            isActive={profile.id === activeProfile?.id}
            isEditing={isEditing}
            onClick={() => handleProfileClick(profile)}
            onEdit={() => router.push(`/profiles/edit/${profile.id}`)}
          />
        ))}

        {/* Add Profile Button */}
        {canAddMore && !isEditing && (
          <div
            className="flex flex-col items-center gap-3 cursor-pointer group"
            onClick={() => setShowAddModal(true)}
          >
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[300px] border-2 border-dashed border-gray-600 flex items-center justify-center transition-all duration-200 group-hover:border-white group-hover:bg-white/5">
              <Plus className="w-12 h-12 text-gray-600 group-hover:text-white transition-colors" />
            </div>
            <span className="text-sm sm:text-base text-gray-400 group-hover:text-white transition-colors">
              Add Profile
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showManageButton && (
        <div className="flex gap-4 mt-4">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className="border-gray-600 text-gray-300 hover:border-white hover:text-white"
          >
            {isEditing ? (
              <>Done</>
            ) : (
              <>
                <Pencil className="w-4 h-4 mr-2" />
                Manage Profiles
              </>
            )}
          </Button>

          {!isEditing && (
            <Button
              variant="ghost"
              onClick={() => router.push('/user/settings')}
              className="text-gray-400 hover:text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          )}
        </div>
      )}

      {/* Add Profile Modal */}
      <AddProfileModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
      />

      {/* PIN Modal */}
      <PinModal
        open={showPinModal}
        onOpenChange={setShowPinModal}
        onVerified={handlePinVerified}
        title="Enter PIN"
        description="This profile is protected. Enter the PIN to continue."
        targetProfileId={pendingProfileId || undefined}
      />
    </div>
  );
}
