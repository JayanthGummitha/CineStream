/**
 * Parental Controls Service
 * 
 * Handles PIN verification, content restrictions, and viewing time limits.
 */

import {
  Profile,
  MaturityRating,
  MATURITY_RATING_LEVELS,
  ParentalControlSettings,
} from '@/types/profile';
import { hashPin, getProfileById, updateParentalControls, getAccountProfiles } from './profile-service';

const PIN_ATTEMPTS_KEY = 'cinestream_pin_attempts';
const PIN_LOCKOUT_KEY = 'cinestream_pin_lockout';
const MAX_PIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/** PIN verification result */
export interface PinVerificationResult {
  success: boolean;
  attemptsRemaining?: number;
  lockedUntil?: Date;
  error?: string;
}

/** Content access result */
export interface ContentAccessResult {
  allowed: boolean;
  reason?: 'maturity_rating' | 'blocked' | 'time_restriction' | 'pin_required' | 'blocked_genre';
  requiredRating?: MaturityRating;
  currentRating?: MaturityRating;
  blockedGenre?: string;
}

/** Get PIN attempts for a profile */
function getPinAttempts(profileId: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const attempts = localStorage.getItem(`${PIN_ATTEMPTS_KEY}_${profileId}`);
    return attempts ? parseInt(attempts, 10) : 0;
  } catch {
    return 0;
  }
}

/** Set PIN attempts for a profile */
function setPinAttempts(profileId: string, attempts: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${PIN_ATTEMPTS_KEY}_${profileId}`, attempts.toString());
}

/** Get lockout time for a profile */
function getLockoutTime(profileId: string): Date | null {
  if (typeof window === 'undefined') return null;
  try {
    const lockout = localStorage.getItem(`${PIN_LOCKOUT_KEY}_${profileId}`);
    if (lockout) {
      const lockoutDate = new Date(lockout);
      if (lockoutDate > new Date()) {
        return lockoutDate;
      }
      // Lockout expired, clear it
      localStorage.removeItem(`${PIN_LOCKOUT_KEY}_${profileId}`);
    }
  } catch {
    // Ignore errors
  }
  return null;
}

/** Set lockout time for a profile */
function setLockoutTime(profileId: string): Date {
  const lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${PIN_LOCKOUT_KEY}_${profileId}`, lockoutUntil.toISOString());
  }
  return lockoutUntil;
}

/** Clear PIN attempts and lockout */
function clearPinAttempts(profileId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${PIN_ATTEMPTS_KEY}_${profileId}`);
  localStorage.removeItem(`${PIN_LOCKOUT_KEY}_${profileId}`);
}

/** Verify PIN for a profile - uses profile PIN or falls back to master PIN */
export function verifyProfilePin(
  accountId: string,
  profileId: string,
  pin: string
): PinVerificationResult {
  const profile = getProfileById(accountId, profileId);
  
  if (!profile) {
    return { success: false, error: 'Profile not found' };
  }

  // Get the account profiles to check for master PIN
  const accountProfiles = getAccountProfiles(accountId);
  const hasProfilePin = !!profile.parentalControls.pin;
  const hasMasterPin = !!accountProfiles.masterPin;

  // If no PIN is set anywhere, allow access (parental controls not fully configured)
  if (!hasProfilePin && !hasMasterPin) {
    return { success: true };
  }

  // Check for lockout
  const lockoutTime = getLockoutTime(profileId);
  if (lockoutTime) {
    return {
      success: false,
      lockedUntil: lockoutTime,
      error: `Too many attempts. Try again after ${lockoutTime.toLocaleTimeString()}`,
    };
  }

  const hashedPin = hashPin(pin);
  
  // Check profile PIN first, then master PIN
  const isValidProfilePin = hasProfilePin && profile.parentalControls.pin === hashedPin;
  const isValidMasterPin = hasMasterPin && accountProfiles.masterPin === hashedPin;
  const isValid = isValidProfilePin || isValidMasterPin;

  if (isValid) {
    clearPinAttempts(profileId);
    return { success: true };
  }

  // Increment failed attempts
  const attempts = getPinAttempts(profileId) + 1;
  setPinAttempts(profileId, attempts);

  if (attempts >= MAX_PIN_ATTEMPTS) {
    const lockedUntil = setLockoutTime(profileId);
    return {
      success: false,
      attemptsRemaining: 0,
      lockedUntil,
      error: 'Too many failed attempts. Account locked for 15 minutes.',
    };
  }

  return {
    success: false,
    attemptsRemaining: MAX_PIN_ATTEMPTS - attempts,
    error: `Incorrect PIN. ${MAX_PIN_ATTEMPTS - attempts} attempts remaining.`,
  };
}

/** Set PIN for a profile */
export function setProfilePin(
  accountId: string,
  profileId: string,
  pin: string
): void {
  if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    throw new Error('PIN must be exactly 4 digits');
  }

  const hashedPin = hashPin(pin);
  updateParentalControls(accountId, profileId, { pin: hashedPin });
}

/** Remove PIN from a profile */
export function removeProfilePin(accountId: string, profileId: string): void {
  updateParentalControls(accountId, profileId, { pin: undefined });
  clearPinAttempts(profileId);
}

/** Check if content is accessible based on maturity rating */
export function isContentAccessible(
  profile: Profile,
  contentRating: MaturityRating | string
): ContentAccessResult {
  const { parentalControls } = profile;

  // If parental controls are disabled, allow everything
  if (!parentalControls.enabled) {
    return { allowed: true };
  }

  // Normalize content rating
  const normalizedRating = normalizeMaturityRating(contentRating);
  
  // Check maturity rating
  const contentLevel = MATURITY_RATING_LEVELS[normalizedRating] ?? 10;
  const maxLevel = MATURITY_RATING_LEVELS[parentalControls.maxMaturityRating];

  if (contentLevel > maxLevel) {
    return {
      allowed: false,
      reason: 'maturity_rating',
      requiredRating: parentalControls.maxMaturityRating,
      currentRating: normalizedRating,
    };
  }

  return { allowed: true };
}

/** Check if specific content is blocked */
export function isContentBlocked(profile: Profile, contentId: string): boolean {
  return profile.parentalControls.blockedContentIds.includes(contentId);
}

/** Check if content genres are blocked */
export function isGenreBlocked(profile: Profile, contentGenres: string[]): ContentAccessResult {
  const { parentalControls } = profile;
  
  if (!parentalControls.enabled || !parentalControls.blockedGenres?.length) {
    return { allowed: true };
  }

  // Check if any of the content's genres are in the blocked list
  for (const genre of contentGenres) {
    const normalizedGenre = genre.trim();
    if (parentalControls.blockedGenres.some(blocked => 
      blocked.toLowerCase() === normalizedGenre.toLowerCase()
    )) {
      return {
        allowed: false,
        reason: 'blocked_genre',
        blockedGenre: normalizedGenre,
      };
    }
  }

  return { allowed: true };
}

/** Check viewing time restrictions */
export function isWithinViewingTime(profile: Profile): ContentAccessResult {
  const { parentalControls } = profile;
  const restrictions = parentalControls.viewingTimeRestrictions;

  if (!restrictions?.enabled) {
    return { allowed: true };
  }

  const now = new Date();
  const currentHour = now.getHours();

  // Handle overnight restrictions (e.g., 6 AM to 9 PM)
  if (restrictions.allowedStartHour <= restrictions.allowedEndHour) {
    // Normal range (e.g., 6-21)
    if (currentHour >= restrictions.allowedStartHour && currentHour < restrictions.allowedEndHour) {
      return { allowed: true };
    }
  } else {
    // Overnight range (e.g., 21-6)
    if (currentHour >= restrictions.allowedStartHour || currentHour < restrictions.allowedEndHour) {
      return { allowed: true };
    }
  }

  return {
    allowed: false,
    reason: 'time_restriction',
  };
}

/** Full content access check */
export function checkContentAccess(
  profile: Profile,
  contentId: string,
  contentRating: MaturityRating | string,
  contentGenres?: string[]
): ContentAccessResult {
  // Check viewing time first
  const timeCheck = isWithinViewingTime(profile);
  if (!timeCheck.allowed) {
    return timeCheck;
  }

  // Check if content is specifically blocked
  if (isContentBlocked(profile, contentId)) {
    return {
      allowed: false,
      reason: 'blocked',
    };
  }

  // Check if any genre is blocked
  if (contentGenres && contentGenres.length > 0) {
    const genreCheck = isGenreBlocked(profile, contentGenres);
    if (!genreCheck.allowed) {
      return genreCheck;
    }
  }

  // Check maturity rating
  return isContentAccessible(profile, contentRating);
}

/** Block specific content */
export function blockContent(
  accountId: string,
  profileId: string,
  contentId: string
): void {
  const profile = getProfileById(accountId, profileId);
  if (!profile) {
    throw new Error('Profile not found');
  }

  const blockedIds = [...profile.parentalControls.blockedContentIds];
  if (!blockedIds.includes(contentId)) {
    blockedIds.push(contentId);
    updateParentalControls(accountId, profileId, { blockedContentIds: blockedIds });
  }
}

/** Unblock specific content */
export function unblockContent(
  accountId: string,
  profileId: string,
  contentId: string
): void {
  const profile = getProfileById(accountId, profileId);
  if (!profile) {
    throw new Error('Profile not found');
  }

  const blockedIds = profile.parentalControls.blockedContentIds.filter(id => id !== contentId);
  updateParentalControls(accountId, profileId, { blockedContentIds: blockedIds });
}

/** Normalize various rating formats to our MaturityRating type */
function normalizeMaturityRating(rating: string): MaturityRating {
  const normalized = rating.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  
  const ratingMap: Record<string, MaturityRating> = {
    'G': 'G',
    'PG': 'PG',
    'PG13': 'PG-13',
    'PG-13': 'PG-13',
    'R': 'R',
    'NC17': 'NC-17',
    'NC-17': 'NC-17',
    'TVY': 'TV-Y',
    'TV-Y': 'TV-Y',
    'TVY7': 'TV-Y7',
    'TV-Y7': 'TV-Y7',
    'TVG': 'TV-G',
    'TV-G': 'TV-G',
    'TVPG': 'TV-PG',
    'TV-PG': 'TV-PG',
    'TV14': 'TV-14',
    'TV-14': 'TV-14',
    'TVMA': 'TV-MA',
    'TV-MA': 'TV-MA',
  };

  return ratingMap[normalized] || 'TV-MA'; // Default to most restrictive if unknown
}

/** Get human-readable description of maturity rating */
export function getMaturityRatingDescription(rating: MaturityRating): string {
  const descriptions: Record<MaturityRating, string> = {
    'TV-Y': 'All Children',
    'G': 'General Audiences',
    'TV-Y7': 'Directed to Older Children',
    'TV-G': 'General Audience',
    'PG': 'Parental Guidance Suggested',
    'TV-PG': 'Parental Guidance Suggested',
    'PG-13': 'Parents Strongly Cautioned',
    'TV-14': 'Parents Strongly Cautioned',
    'R': 'Restricted',
    'TV-MA': 'Mature Audience Only',
    'NC-17': 'Adults Only',
  };
  return descriptions[rating] || rating;
}

/** Get all maturity ratings up to a certain level */
export function getAllowedRatings(maxRating: MaturityRating): MaturityRating[] {
  const maxLevel = MATURITY_RATING_LEVELS[maxRating];
  return (Object.entries(MATURITY_RATING_LEVELS) as [MaturityRating, number][])
    .filter(([, level]) => level <= maxLevel)
    .map(([rating]) => rating);
}
