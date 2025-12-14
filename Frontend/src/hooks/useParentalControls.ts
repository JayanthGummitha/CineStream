'use client';

/**
 * Parental Controls Hook
 * 
 * Provides parental control functionality for content access.
 */

import { useState, useCallback } from 'react';
import { MaturityRating } from '@/types/profile';
import {
  ContentAccessResult,
  verifyProfilePin,
  removeProfilePin,
  checkContentAccess,
  blockContent,
  unblockContent,
  getMaturityRatingDescription,
  getAllowedRatings,
  PinVerificationResult,
} from '@/lib/parental-controls';
import { useProfiles } from '@/contexts/ProfileContext';

interface UseParentalControlsReturn {
  /** Check if content is accessible (optionally pass genres for genre-based blocking) */
  canAccessContent: (contentId: string, contentRating: string, contentGenres?: string[]) => ContentAccessResult;
  /** Verify PIN */
  verifyPin: (pin: string) => PinVerificationResult;
  /** Set new PIN */
  setPin: (pin: string) => void;
  /** Remove PIN */
  removePin: () => void;
  /** Block specific content */
  blockContentItem: (contentId: string) => void;
  /** Unblock specific content */
  unblockContentItem: (contentId: string) => void;
  /** Get rating description */
  getRatingDescription: (rating: MaturityRating) => string;
  /** Get all allowed ratings for current profile */
  allowedRatings: MaturityRating[];
  /** Whether parental controls are enabled */
  isEnabled: boolean;
  /** Whether PIN is set */
  hasPinSet: boolean;
  /** Current max maturity rating */
  maxRating: MaturityRating;
  /** PIN verification state */
  pinVerified: boolean;
  /** Set PIN verified state (for session) */
  setPinVerified: (verified: boolean) => void;
}

export function useParentalControls(): UseParentalControlsReturn {
  const { activeProfile, accountProfiles, setMasterPin } = useProfiles();
  const [pinVerified, setPinVerified] = useState(false);

  const accountId = accountProfiles?.accountId || 'demo-user-123';
  const profileId = activeProfile?.id || '';

  const isEnabled = activeProfile?.parentalControls.enabled || false;
  const hasPinSet = !!activeProfile?.parentalControls.pin || !!accountProfiles?.masterPin;
  const maxRating = activeProfile?.parentalControls.maxMaturityRating || 'NC-17';

  const canAccessContent = useCallback((
    contentId: string,
    contentRating: string,
    contentGenres?: string[]
  ): ContentAccessResult => {
    if (!activeProfile) {
      return { allowed: true };
    }

    // If PIN was verified this session, allow access
    if (pinVerified) {
      return { allowed: true };
    }

    return checkContentAccess(activeProfile, contentId, contentRating as MaturityRating, contentGenres);
  }, [activeProfile, pinVerified]);

  const verifyPin = useCallback((pin: string): PinVerificationResult => {
    if (!profileId) {
      return { success: false, error: 'No active profile' };
    }

    const result = verifyProfilePin(accountId, profileId, pin);
    if (result.success) {
      setPinVerified(true);
    }
    return result;
  }, [accountId, profileId]);

  const setPin = useCallback((pin: string): void => {
    // Set as master PIN (account-level)
    setMasterPin(pin);
  }, [setMasterPin]);

  const removePin = useCallback((): void => {
    if (!profileId) {
      throw new Error('No active profile');
    }
    removeProfilePin(accountId, profileId);
    setPinVerified(false);
  }, [accountId, profileId]);

  const blockContentItem = useCallback((contentId: string): void => {
    if (!profileId) {
      throw new Error('No active profile');
    }
    blockContent(accountId, profileId, contentId);
  }, [accountId, profileId]);

  const unblockContentItem = useCallback((contentId: string): void => {
    if (!profileId) {
      throw new Error('No active profile');
    }
    unblockContent(accountId, profileId, contentId);
  }, [accountId, profileId]);

  const allowedRatings = getAllowedRatings(maxRating);

  return {
    canAccessContent,
    verifyPin,
    setPin,
    removePin,
    blockContentItem,
    unblockContentItem,
    getRatingDescription: getMaturityRatingDescription,
    allowedRatings,
    isEnabled,
    hasPinSet,
    maxRating,
    pinVerified,
    setPinVerified,
  };
}
