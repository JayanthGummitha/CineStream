/**
 * Profile Service
 * 
 * Manages multi-profile support with localStorage persistence.
 * Handles profile CRUD operations, switching, and preferences.
 */

import {
  Profile,
  AccountProfiles,
  ProfileAvatar,
  ParentalControlSettings,
  ProfilePreferences,
  DEFAULT_PARENTAL_CONTROLS,
  KIDS_PARENTAL_CONTROLS,
  DEFAULT_PROFILE_PREFERENCES,
} from '@/types/profile';

const PROFILES_STORAGE_KEY = 'cinestream_profiles';
const ACTIVE_PROFILE_KEY = 'cinestream_active_profile';
const MAX_PROFILES = 5;

/** Generate unique ID */
function generateId(): string {
  return `profile_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/** Get account profiles from storage */
export function getAccountProfiles(accountId: string): AccountProfiles {
  if (typeof window === 'undefined') {
    return createDefaultAccountProfiles(accountId);
  }

  try {
    const stored = localStorage.getItem(`${PROFILES_STORAGE_KEY}_${accountId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('[Profile Service] Error loading profiles:', error);
  }

  return createDefaultAccountProfiles(accountId);
}

/** Create default account profiles structure */
function createDefaultAccountProfiles(accountId: string): AccountProfiles {
  const defaultProfile = createDefaultProfile();
  return {
    accountId,
    profiles: [defaultProfile],
    maxProfiles: MAX_PROFILES,
    activeProfileId: defaultProfile.id,
  };
}

/** Create a default profile */
function createDefaultProfile(): Profile {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: 'Main',
    avatar: 'avatar-1',
    isKids: false,
    isDefault: true,
    createdAt: now,
    updatedAt: now,
    parentalControls: { ...DEFAULT_PARENTAL_CONTROLS },
    preferences: { ...DEFAULT_PROFILE_PREFERENCES },
  };
}

/** Save account profiles to storage */
export function saveAccountProfiles(profiles: AccountProfiles): void {
  if (typeof window === 'undefined') return;

  try {
    const key = `${PROFILES_STORAGE_KEY}_${profiles.accountId}`;
    const data = JSON.stringify(profiles);
    localStorage.setItem(key, data);
  } catch (error) {
    console.error('[Profile Service] Error saving profiles:', error);
    throw new Error('Failed to save profiles');
  }
}

/** Create a new profile */
export function createProfile(
  accountId: string,
  name: string,
  avatar: ProfileAvatar,
  isKids: boolean = false,
  customParentalControls?: Partial<ParentalControlSettings>
): Profile {
  const accountProfiles = getAccountProfiles(accountId);

  if (accountProfiles.profiles.length >= accountProfiles.maxProfiles) {
    throw new Error(`Maximum of ${accountProfiles.maxProfiles} profiles allowed`);
  }

  // Check for duplicate names
  if (accountProfiles.profiles.some(p => p.name.toLowerCase() === name.toLowerCase())) {
    throw new Error('A profile with this name already exists');
  }

  const now = new Date().toISOString();
  
  // Determine base parental controls
  const baseControls = isKids ? { ...KIDS_PARENTAL_CONTROLS } : { ...DEFAULT_PARENTAL_CONTROLS };
  
  // Merge with custom controls if provided
  const finalControls: ParentalControlSettings = customParentalControls 
    ? { ...baseControls, ...customParentalControls }
    : baseControls;

  const newProfile: Profile = {
    id: generateId(),
    name,
    avatar,
    isKids,
    isDefault: false,
    createdAt: now,
    updatedAt: now,
    parentalControls: finalControls,
    preferences: { ...DEFAULT_PROFILE_PREFERENCES },
  };

  accountProfiles.profiles.push(newProfile);
  saveAccountProfiles(accountProfiles);

  return newProfile;
}

/** Update an existing profile */
export function updateProfile(
  accountId: string,
  profileId: string,
  updates: Partial<Pick<Profile, 'name' | 'avatar' | 'preferences' | 'parentalControls'>>
): Profile {
  const accountProfiles = getAccountProfiles(accountId);
  const profileIndex = accountProfiles.profiles.findIndex(p => p.id === profileId);

  if (profileIndex === -1) {
    throw new Error('Profile not found');
  }

  // Check for duplicate names if name is being updated
  if (updates.name) {
    const duplicateName = accountProfiles.profiles.some(
      p => p.id !== profileId && p.name.toLowerCase() === updates.name!.toLowerCase()
    );
    if (duplicateName) {
      throw new Error('A profile with this name already exists');
    }
  }

  const updatedProfile: Profile = {
    ...accountProfiles.profiles[profileIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  accountProfiles.profiles[profileIndex] = updatedProfile;
  saveAccountProfiles(accountProfiles);

  return updatedProfile;
}

/** Delete a profile */
export function deleteProfile(accountId: string, profileId: string): void {
  const accountProfiles = getAccountProfiles(accountId);
  const profile = accountProfiles.profiles.find(p => p.id === profileId);

  if (!profile) {
    throw new Error('Profile not found');
  }

  if (profile.isDefault) {
    throw new Error('Cannot delete the default profile');
  }

  accountProfiles.profiles = accountProfiles.profiles.filter(p => p.id !== profileId);

  // If deleted profile was active, switch to default
  if (accountProfiles.activeProfileId === profileId) {
    const defaultProfile = accountProfiles.profiles.find(p => p.isDefault);
    accountProfiles.activeProfileId = defaultProfile?.id || accountProfiles.profiles[0]?.id || null;
  }

  saveAccountProfiles(accountProfiles);
}

/** Set active profile */
export function setActiveProfile(accountId: string, profileId: string): Profile {
  const accountProfiles = getAccountProfiles(accountId);
  let profile = accountProfiles.profiles.find(p => p.id === profileId);

  // If profile not found by ID, use the first available profile
  if (!profile && accountProfiles.profiles.length > 0) {
    profile = accountProfiles.profiles[0];
    profileId = profile.id;
  }

  if (!profile) {
    throw new Error('Profile not found');
  }

  accountProfiles.activeProfileId = profileId;
  saveAccountProfiles(accountProfiles);

  // Also store in separate key for quick access
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
  }

  return profile;
}

/** Get active profile */
export function getActiveProfile(accountId: string): Profile | null {
  const accountProfiles = getAccountProfiles(accountId);
  
  if (!accountProfiles.activeProfileId) {
    return accountProfiles.profiles.find(p => p.isDefault) || accountProfiles.profiles[0] || null;
  }

  return accountProfiles.profiles.find(p => p.id === accountProfiles.activeProfileId) || null;
}

/** Get profile by ID */
export function getProfileById(accountId: string, profileId: string): Profile | null {
  const accountProfiles = getAccountProfiles(accountId);
  return accountProfiles.profiles.find(p => p.id === profileId) || null;
}

/** Update profile preferences */
export function updateProfilePreferences(
  accountId: string,
  profileId: string,
  preferences: Partial<ProfilePreferences>
): Profile {
  const profile = getProfileById(accountId, profileId);
  if (!profile) {
    throw new Error('Profile not found');
  }

  return updateProfile(accountId, profileId, {
    preferences: { ...profile.preferences, ...preferences },
  });
}

/** Update parental controls */
export function updateParentalControls(
  accountId: string,
  profileId: string,
  controls: Partial<ParentalControlSettings>
): Profile {
  const profile = getProfileById(accountId, profileId);
  if (!profile) {
    throw new Error('Profile not found');
  }

  return updateProfile(accountId, profileId, {
    parentalControls: { ...profile.parentalControls, ...controls },
  });
}

/** Set master PIN for account */
export function setMasterPin(accountId: string, pin: string): void {
  const accountProfiles = getAccountProfiles(accountId);
  // In production, this should be hashed
  accountProfiles.masterPin = hashPin(pin);
  saveAccountProfiles(accountProfiles);
}

/** Verify master PIN */
export function verifyMasterPin(accountId: string, pin: string): boolean {
  const accountProfiles = getAccountProfiles(accountId);
  if (!accountProfiles.masterPin) return false;
  return accountProfiles.masterPin === hashPin(pin);
}

/** Simple PIN hashing (in production, use proper crypto) */
export function hashPin(pin: string): string {
  // Simple hash for demo - in production use bcrypt or similar
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `pin_${Math.abs(hash).toString(16)}`;
}

/** Available avatars */
export const AVAILABLE_AVATARS: { id: ProfileAvatar; label: string; isKids: boolean }[] = [
  { id: 'avatar-1', label: 'Blue', isKids: false },
  { id: 'avatar-2', label: 'Red', isKids: false },
  { id: 'avatar-3', label: 'Green', isKids: false },
  { id: 'avatar-4', label: 'Purple', isKids: false },
  { id: 'avatar-5', label: 'Orange', isKids: false },
  { id: 'avatar-6', label: 'Pink', isKids: false },
  { id: 'avatar-7', label: 'Teal', isKids: false },
  { id: 'avatar-8', label: 'Yellow', isKids: false },
  { id: 'kids-1', label: 'Panda', isKids: true },
  { id: 'kids-2', label: 'Robot', isKids: true },
  { id: 'kids-3', label: 'Unicorn', isKids: true },
  { id: 'kids-4', label: 'Dinosaur', isKids: true },
];
