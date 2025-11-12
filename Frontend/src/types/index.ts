export interface Movie {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  backdrop: string;
  trailer?: string;
  duration: number; // in minutes
  releaseDate: string;
  genres: string[];
  rating: number; // IMDb rating
  contentRating: string; // PG-13, R, etc.
  cast: Cast[];
  director: string;
  writers?: string[]; 
  languages: string[];
  subtitles?: string[];
  quality?: string[]; // SD, HD, 4K
  isNew?: boolean;
  isTrending?: boolean;
  isPopular?: boolean;
}

export interface TVShow extends Omit<Movie, 'duration'> {
  seasons: Season[];
  totalSeasons: number;
  status: 'ongoing' | 'completed' | 'cancelled';
}

export interface Season {
  id: string;
  seasonNumber: number;
  title: string;
  episodes: Episode[];
  releaseDate: string;
  thumbnail: string;
}

export interface Episode {
  id: string;
  title: string;
  description: string;
  episodeNumber: number;
  duration: number;
  thumbnail: string;
  releaseDate: string;
  rating?: number;
  src?: string; // Optional video source URL for the episode
}

export interface Cast {
  id: string;
  name: string;
  character: string;
  profileImage: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscription: SubscriptionTier;
  profiles: UserProfile[];
  watchHistory: WatchHistoryItem[];
  watchlist: string[]; // movie/show IDs
  preferences: UserPreferences;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  isKid: boolean;
  language: string;
  maturityRating: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  autoplay: boolean;
  subtitles: boolean;
  quality: 'auto' | 'sd' | 'hd' | '4k';
  notifications: {
    newReleases: boolean;
    recommendations: boolean;
    watchReminders: boolean;
  };
}

export interface WatchHistoryItem {
  contentId: string;
  contentType: 'movie' | 'episode';
  watchedAt: string;
  progress: number; // percentage watched
  completed: boolean;
}

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'family';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  price: number;
  currency: string;
  billing: 'monthly' | 'annual';
  features: {
    profiles: number;
    maxDevices: number;
    quality: string;
    fullLibrary: boolean;
    offlineDownloads: boolean | number;
    adFree: boolean;
    groupWatch: boolean;
    prioritySupport: boolean;
    kidsProfiles: boolean;
    earlyAccess: boolean;
  };
  freeTrial?: number; // days
}

export interface EnhancedSubscriptionPlan extends SubscriptionPlan {
  yearlyPrice?: number;
  yearlyDiscount?: number;
  popularBadge?: boolean;
  gradient?: {
    from: string;
    to: string;
  };
  icon?: string;
  description?: string;
  ctaText?: string;
  featureList?: string[];
}

export interface AnimationConfig {
  duration: {
    entrance: number;
    hover: number;
    transition: number;
  };
  easing: {
    entrance: string;
    hover: string;
    transition: string;
  };
  stagger: {
    cards: number;
    features: number;
    tableRows: number;
  };
}

export interface ComparisonFeature {
  id: string;
  name: string;
  description?: string;
  type: 'boolean' | 'text' | 'number';
}

export interface TrustIndicator {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface EnterpriseContact {
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  ctaText: string;
  email: string;
  phone: string;
}

export interface ContentCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Genre extends ContentCategory {}

export interface Collection {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  backdrop: string;
  items: (Movie | TVShow)[];
  type: 'trending' | 'new' | 'popular' | 'genre' | 'custom';
}

export interface SearchFilters {
  query?: string;
  genres?: string[];
  languages?: string[];
  releaseYear?: {
    min?: number;
    max?: number;
  };
  rating?: {
    min?: number;
    max?: number;
  };
  contentType?: 'movie' | 'tv' | 'all';
  sortBy?: 'relevance' | 'newest' | 'oldest' | 'rating' | 'popular';
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Pricing UI Types
export type {
  FeatureItem,
  PricingBadge,
  CTAConfig,
  PricingPlanData,
  BillingCycle,
  ResponsivePricingPageProps,
  BillingToggleProps,
  PricingCardProps,
  PriceDisplayProps,
  FeatureListProps,
  CTAButtonProps,
} from './pricing';
