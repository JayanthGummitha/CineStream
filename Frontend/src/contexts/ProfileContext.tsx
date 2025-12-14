'use client';

/**
 * Profile Context
 * 
 * Provides active profile state and profile management across the app.
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Profile,
  AccountProfiles,
  ProfileAvatar,
  ParentalControlSettings,
  ProfilePreferences,
} from '@/types/profile';
import {
  getAccountProfiles,
  createProfile as createProfileService,
  updateProfile as updateProfileService,
  deleteProfile as deleteProfileService,
  setActiveProfile as setActiveProfileService,
  getActiveProfile,
  updateProfilePreferences as updatePreferencesService,
  updateParentalControls as updateControlsService,
  setMasterPin as setMasterPinService,
  verifyMasterPin as verifyMasterPinService,
} from '@/lib/profile-service';
import { useAuth } from '@/hooks/useAuth';

const OWNER_SESSION_KEY = 'cinestream_owner_session';

interface ProfileContextValue {
  /** Current account profiles data */
  accountProfiles: AccountProfiles | null;
  /** All profiles (convenience accessor) */
  profiles: Profile[];
  /** Currently active profile */
  activeProfile: Profile | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Whether current session is owner (logged in with credentials) */
  isOwnerSession: boolean;
  /** Set owner session status (call after login) */
  setOwnerSession: (isOwner: boolean) => void;
  /** Clear owner session (call on logout or when switching to restricted mode) */
  clearOwnerSession: () => void;
  /** Create a new profile */
  createProfile: (name: string, avatar: ProfileAvatar, isKids?: boolean, customParentalControls?: Partial<ParentalControlSettings>) => Promise<Profile>;
  /** Update a profile */
  updateProfile: (profileId: string, updates: Partial<Pick<Profile, 'name' | 'avatar'>>) => Promise<Profile>;
  /** Delete a profile */
  deleteProfile: (profileId: string) => Promise<void>;
  /** Switch to a different profile */
  switchProfile: (profileId: string) => Promise<Profile>;
  /** Update profile preferences */
  updatePreferences: (preferences: Partial<ProfilePreferences>) => Promise<Profile>;
  /** Update parental controls */
  updateParentalControls: (controls: Partial<ParentalControlSettings>) => Promise<Profile>;
  /** Set master PIN */
  setMasterPin: (pin: string) => void;
  /** Verify master PIN */
  verifyMasterPin: (pin: string) => boolean;
  /** Refresh profiles from storage */
  refreshProfiles: () => void;
  /** Check if PIN is required to switch profiles (considers owner session) */
  requiresPinToSwitch: (profileId: string) => boolean;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

interface ProfileProviderProps {
  children: ReactNode;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const { user } = useAuth();
  const [accountProfiles, setAccountProfiles] = useState<AccountProfiles | null>(null);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnerSession, setIsOwnerSessionState] = useState(false);

  const accountId = user?.id || 'demo-user-123';

  // Load profiles and owner session on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsLoading(true);
    setError(null);

    try {
      const profiles = getAccountProfiles(accountId);
      setAccountProfiles(profiles);

      const active = getActiveProfile(accountId);
      setActiveProfile(active);

      // Check if owner session exists (uses sessionStorage - clears on browser close)
      const ownerSession = sessionStorage.getItem(OWNER_SESSION_KEY);
      setIsOwnerSessionState(ownerSession === 'true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profiles');
    } finally {
      setIsLoading(false);
    }
  }, [accountId]);

  // Set owner session (call after successful login)
  const setOwnerSession = useCallback((isOwner: boolean) => {
    if (typeof window === 'undefined') return;
    if (isOwner) {
      sessionStorage.setItem(OWNER_SESSION_KEY, 'true');
    } else {
      sessionStorage.removeItem(OWNER_SESSION_KEY);
    }
    setIsOwnerSessionState(isOwner);
  }, []);

  // Clear owner session (call on logout)
  const clearOwnerSession = useCallback(() => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(OWNER_SESSION_KEY);
    setIsOwnerSessionState(false);
  }, []);

  const refreshProfiles = useCallback(() => {
    try {
      const profiles = getAccountProfiles(accountId);
      setAccountProfiles(profiles);

      const active = getActiveProfile(accountId);
      setActiveProfile(active);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh profiles');
    }
  }, [accountId]);

  const createProfile = useCallback(async (
    name: string,
    avatar: ProfileAvatar,
    isKids: boolean = false,
    customParentalControls?: Partial<ParentalControlSettings>
  ): Promise<Profile> => {
    try {
      const newProfile = createProfileService(accountId, name, avatar, isKids, customParentalControls);
      refreshProfiles();
      return newProfile;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create profile';
      setError(message);
      throw new Error(message);
    }
  }, [accountId, refreshProfiles]);

  const updateProfile = useCallback(async (
    profileId: string,
    updates: Partial<Pick<Profile, 'name' | 'avatar'>>
  ): Promise<Profile> => {
    try {
      const updated = updateProfileService(accountId, profileId, updates);
      refreshProfiles();
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
      throw new Error(message);
    }
  }, [accountId, refreshProfiles]);

  const deleteProfile = useCallback(async (profileId: string): Promise<void> => {
    try {
      deleteProfileService(accountId, profileId);
      refreshProfiles();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete profile';
      setError(message);
      throw new Error(message);
    }
  }, [accountId, refreshProfiles]);

  const switchProfile = useCallback(async (profileId: string): Promise<Profile> => {
    try {
      // First refresh to ensure we have latest profiles
      const latestProfiles = getAccountProfiles(accountId);
      const profileExists = latestProfiles.profiles.some(p => p.id === profileId);
      
      if (!profileExists) {
        // If profile doesn't exist, use the first available profile
        if (latestProfiles.profiles.length > 0) {
          profileId = latestProfiles.profiles[0].id;
        }
      }
      
      const profile = setActiveProfileService(accountId, profileId);
      setActiveProfile(profile);
      setAccountProfiles(latestProfiles);
      return profile;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to switch profile';
      setError(message);
      throw new Error(message);
    }
  }, [accountId]);

  const updatePreferences = useCallback(async (
    preferences: Partial<ProfilePreferences>
  ): Promise<Profile> => {
    if (!activeProfile) {
      throw new Error('No active profile');
    }
    try {
      const updated = updatePreferencesService(accountId, activeProfile.id, preferences);
      refreshProfiles();
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update preferences';
      setError(message);
      throw new Error(message);
    }
  }, [accountId, activeProfile, refreshProfiles]);

  const updateParentalControls = useCallback(async (
    controls: Partial<ParentalControlSettings>
  ): Promise<Profile> => {
    if (!activeProfile) {
      throw new Error('No active profile');
    }
    try {
      const updated = updateControlsService(accountId, activeProfile.id, controls);
      refreshProfiles();
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update parental controls';
      setError(message);
      throw new Error(message);
    }
  }, [accountId, activeProfile, refreshProfiles]);

  const setMasterPin = useCallback((pin: string): void => {
    setMasterPinService(accountId, pin);
    refreshProfiles();
  }, [accountId, refreshProfiles]);

  const verifyMasterPin = useCallback((pin: string): boolean => {
    return verifyMasterPinService(accountId, pin);
  }, [accountId]);

  const requiresPinToSwitch = useCallback((profileId: string): boolean => {
    // Owner session (logged in with credentials) bypasses PIN requirement
    if (isOwnerSession) return false;
    
    // If current profile is the default/main profile (parent), they can access any profile
    if (activeProfile?.isDefault) return false;
    
    if (!accountProfiles) return false;
    
    const targetProfile = accountProfiles.profiles.find(p => p.id === profileId);
    
    // Default profile (main/parent) always requires PIN when accessed from non-default profile
    if (targetProfile?.isDefault) {
      return !!accountProfiles.masterPin;
    }
    
    // For non-default profiles, check their individual PIN setting
    return targetProfile?.parentalControls.requirePinToSwitch || false;
  }, [accountProfiles, isOwnerSession, activeProfile]);

  const value: ProfileContextValue = {
    accountProfiles,
    profiles: accountProfiles?.profiles || [],
    activeProfile,
    isLoading,
    error,
    isOwnerSession,
    setOwnerSession,
    clearOwnerSession,
    createProfile,
    updateProfile,
    deleteProfile,
    switchProfile,
    updatePreferences,
    updateParentalControls,
    setMasterPin,
    verifyMasterPin,
    refreshProfiles,
    requiresPinToSwitch,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfiles(): ProfileContextValue {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfiles must be used within a ProfileProvider');
  }
  return context;
}

export { ProfileContext };
