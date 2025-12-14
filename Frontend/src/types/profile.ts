/**
 * Profile & Parental Control Types
 * 
 * Defines types for multi-profile support, parental controls,
 * and offline content management.
 */

/** Content maturity ratings */
export type MaturityRating = 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17' | 'TV-Y' | 'TV-Y7' | 'TV-G' | 'TV-PG' | 'TV-14' | 'TV-MA';

/** Profile avatar options */
export type ProfileAvatar = 
  | 'avatar-1' | 'avatar-2' | 'avatar-3' | 'avatar-4' 
  | 'avatar-5' | 'avatar-6' | 'avatar-7' | 'avatar-8'
  | 'kids-1' | 'kids-2' | 'kids-3' | 'kids-4';

/** Profile type */
export interface Profile {
  id: string;
  name: string;
  avatar: ProfileAvatar;
  isKids: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  /** Parental control settings */
  parentalControls: ParentalControlSettings;
  /** Profile-specific preferences */
  preferences: ProfilePreferences;
}

/** Content genres that can be blocked */
export type BlockableGenre = 
  | 'Horror' | 'Thriller' | 'Crime' | 'War' 
  | 'Adult' | 'Violence' | 'Drugs' | 'Gambling'
  | 'Supernatural' | 'Dark Comedy';

/** All blockable genres */
export const BLOCKABLE_GENRES: { id: BlockableGenre; label: string; description: string }[] = [
  { id: 'Horror', label: 'Horror', description: 'Scary and frightening content' },
  { id: 'Thriller', label: 'Thriller', description: 'Suspenseful and intense content' },
  { id: 'Crime', label: 'Crime', description: 'Criminal activities and violence' },
  { id: 'War', label: 'War', description: 'War and military violence' },
  { id: 'Adult', label: 'Adult Content', description: 'Mature themes and situations' },
  { id: 'Violence', label: 'Extreme Violence', description: 'Graphic violent content' },
  { id: 'Drugs', label: 'Drug Use', description: 'Drug-related content' },
  { id: 'Gambling', label: 'Gambling', description: 'Gambling-related content' },
  { id: 'Supernatural', label: 'Supernatural', description: 'Ghosts, demons, occult themes' },
  { id: 'Dark Comedy', label: 'Dark Comedy', description: 'Dark humor and morbid themes' },
];

/** Parental control settings per profile */
export interface ParentalControlSettings {
  /** Whether parental controls are enabled */
  enabled: boolean;
  /** Maximum allowed maturity rating */
  maxMaturityRating: MaturityRating;
  /** PIN required to access restricted content (hashed) */
  pin?: string;
  /** Whether PIN is required to switch from this profile */
  requirePinToSwitch: boolean;
  /** Blocked content IDs */
  blockedContentIds: string[];
  /** Blocked genres */
  blockedGenres: BlockableGenre[];
  /** Viewing time restrictions */
  viewingTimeRestrictions?: {
    enabled: boolean;
    allowedStartHour: number; // 0-23
    allowedEndHour: number; // 0-23
  };
}

/** Profile-specific preferences */
export interface ProfilePreferences {
  /** Preferred language for content */
  language: string;
  /** Autoplay next episode */
  autoplayNextEpisode: boolean;
  /** Autoplay previews while browsing */
  autoplayPreviews: boolean;
  /** Default playback speed */
  playbackSpeed: number;
  /** Subtitle preferences */
  subtitleSettings: {
    enabled: boolean;
    language: string;
    size: 'small' | 'medium' | 'large';
  };
}

/** Account with multiple profiles */
export interface AccountProfiles {
  accountId: string;
  profiles: Profile[];
  maxProfiles: number;
  activeProfileId: string | null;
  /** Master PIN for account-level parental controls */
  masterPin?: string;
}

/** Maturity rating hierarchy for comparison */
export const MATURITY_RATING_LEVELS: Record<MaturityRating, number> = {
  'TV-Y': 0,
  'G': 1,
  'TV-Y7': 2,
  'TV-G': 3,
  'PG': 4,
  'TV-PG': 5,
  'PG-13': 6,
  'TV-14': 7,
  'R': 8,
  'TV-MA': 9,
  'NC-17': 10,
};

/** Default parental control settings */
export const DEFAULT_PARENTAL_CONTROLS: ParentalControlSettings = {
  enabled: false,
  maxMaturityRating: 'NC-17',
  requirePinToSwitch: false,
  blockedContentIds: [],
  blockedGenres: [],
};

/** Default kids parental control settings */
export const KIDS_PARENTAL_CONTROLS: ParentalControlSettings = {
  enabled: true,
  maxMaturityRating: 'PG',
  requirePinToSwitch: true,
  blockedContentIds: [],
  blockedGenres: ['Horror', 'Violence', 'Adult', 'Drugs', 'Gambling', 'War', 'Crime'],
  viewingTimeRestrictions: {
    enabled: false,
    allowedStartHour: 6,
    allowedEndHour: 21,
  },
};

/** Default profile preferences */
export const DEFAULT_PROFILE_PREFERENCES: ProfilePreferences = {
  language: 'en',
  autoplayNextEpisode: true,
  autoplayPreviews: true,
  playbackSpeed: 1,
  subtitleSettings: {
    enabled: false,
    language: 'en',
    size: 'medium',
  },
};

/** Offline content types */
export interface OfflineContent {
  id: string;
  contentId: string;
  contentType: 'movie' | 'episode';
  title: string;
  thumbnail: string;
  duration: number;
  quality: 'SD' | 'HD' | '4K';
  sizeBytes: number;
  downloadedAt: string;
  expiresAt: string;
  profileId: string;
  /** For episodes */
  seriesName?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  /** Blob URL for offline playback */
  videoBlob?: Blob;
  /** Download progress (0-100) */
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'expired';
}

/** Download queue item */
export interface DownloadQueueItem {
  id: string;
  contentId: string;
  contentType: 'movie' | 'episode';
  title: string;
  thumbnail: string;
  videoUrl: string;
  quality: 'SD' | 'HD' | '4K';
  profileId: string;
  priority: number;
  addedAt: string;
}
