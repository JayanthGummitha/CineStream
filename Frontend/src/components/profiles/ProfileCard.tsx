'use client';

import { Profile, ProfileAvatar } from '@/types/profile';
import { cn } from '@/lib/utils';
import { Lock, Pencil, Baby } from 'lucide-react';

interface ProfileCardProps {
  profile: Profile;
  isActive?: boolean;
  isEditing?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
}

/** Avatar color mapping */
const AVATAR_COLORS: Record<ProfileAvatar, string> = {
  'avatar-1': 'bg-blue-500',
  'avatar-2': 'bg-red-500',
  'avatar-3': 'bg-green-500',
  'avatar-4': 'bg-purple-500',
  'avatar-5': 'bg-orange-500',
  'avatar-6': 'bg-pink-500',
  'avatar-7': 'bg-teal-500',
  'avatar-8': 'bg-yellow-500',
  'kids-1': 'bg-gradient-to-br from-pink-400 to-purple-500',
  'kids-2': 'bg-gradient-to-br from-blue-400 to-cyan-500',
  'kids-3': 'bg-gradient-to-br from-purple-400 to-pink-500',
  'kids-4': 'bg-gradient-to-br from-green-400 to-emerald-500',
};

/** Avatar emoji/icon mapping */
const AVATAR_ICONS: Record<ProfileAvatar, string> = {
  'avatar-1': '👤',
  'avatar-2': '👤',
  'avatar-3': '👤',
  'avatar-4': '👤',
  'avatar-5': '👤',
  'avatar-6': '👤',
  'avatar-7': '👤',
  'avatar-8': '👤',
  'kids-1': '🐼',
  'kids-2': '🤖',
  'kids-3': '🦄',
  'kids-4': '🦕',
};

export function ProfileCard({ 
  profile, 
  isActive = false, 
  isEditing = false,
  onClick, 
  onEdit 
}: ProfileCardProps) {
  return (
    <div
      className={cn(
        'group relative flex flex-col items-center gap-3 cursor-pointer transition-all duration-200',
        isEditing && 'animate-wiggle'
      )}
      onClick={onClick}
    >
      {/* Avatar */}
      <div
        className={cn(
          'relative w-24 h-24 sm:w-32 sm:h-32 rounded-[300px] overflow-hidden transition-all duration-200',
          AVATAR_COLORS[profile.avatar],
          'flex items-center justify-center text-4xl sm:text-5xl',
          isActive && 'ring-4 ring-white',
          !isActive && 'group-hover:ring-2 group-hover:ring-white/50',
          isEditing && 'opacity-70'
        )}
      >
        <span className="select-none">{AVATAR_ICONS[profile.avatar]}</span>

        {/* Kids badge */}
        {profile.isKids && (
          <div className="absolute top-1 left-1 bg-yellow-400 rounded-full p-1">
            <Baby className="w-3 h-3 text-yellow-900" />
          </div>
        )}

        {/* Lock icon for PIN-protected profiles */}
        {profile.parentalControls.requirePinToSwitch && (
          <div className="absolute top-1 right-1 bg-black/60 rounded-full p-1">
            <Lock className="w-3 h-3 text-white" />
          </div>
        )}

        {/* Edit overlay */}
        {isEditing && (
          <div 
            className="absolute inset-0 bg-black/50 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
          >
            <Pencil className="w-8 h-8 text-white" />
          </div>
        )}
      </div>

      {/* Name */}
      <span
        className={cn(
          'text-sm sm:text-base font-medium transition-colors',
          isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
        )}
      >
        {profile.name}
      </span>
    </div>
  );
}

export { AVATAR_COLORS, AVATAR_ICONS };
