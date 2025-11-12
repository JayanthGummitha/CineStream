/**
 * Profile Data Service
 * Handles fetching and managing user profile data with error handling and retry logic
 */

import { UserProfile, ProfileApiResponse } from '@/types/profile'

// Configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // milliseconds
const API_TIMEOUT = 5000 // milliseconds

/**
 * Custom error class for profile service errors
 */
export class ProfileServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'ProfileServiceError'
  }
}

/**
 * Delay utility for retry logic
 */
const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms))

/**
 * Generate mock profile data
 * This simulates API response with realistic user data
 */
export function generateMockProfileData(): UserProfile {
  return {
    // Identity
    id: 'user_123456789',
    name: 'John Doe',
    email: 'john.doe@cinestream.com',
    photoUrl: undefined, // Will show initials placeholder
    isVerified: true,
    
    // Personal Details
    fullName: 'John Michael Doe',
    dateOfBirth: new Date('1990-05-15'),
    gender: 'Male',
    nationality: 'American',
    address: '123 Main Street, San Francisco, CA 94102',
    country: 'US',
    phoneNumber: '+1 (555) 123-4567',
    
    // Account Details
    displayName: 'JohnD',
    createdAt: new Date('2023-01-15'),
    lastLogin: new Date('2024-10-23'),
    membershipTier: 'Premium Member',
    language: 'English (US)',
    timezone: 'Pacific Time (PT)',
    
    // Security Settings
    passwordChangedAt: new Date('2024-08-10'),
    twoFactorEnabled: true,
    securityQuestionsSet: true,
    loginNotifications: true,
    connectedDevices: 3,
    recentActivity: 'Login from Chrome on Windows - 2 hours ago',
    
    // Preferences
    emailNotifications: true,
    smsAlerts: false,
    contentPreferences: ['Action', 'Sci-Fi', 'Thriller', 'Documentary'],
    defaultDashboardView: 'Grid View',
    darkMode: true,
    contentLanguage: 'English'
  }
}

/**
 * Fetch user profile data with retry logic
 * @param userId - Optional user ID (defaults to current user)
 * @param retryCount - Current retry attempt (used internally)
 * @returns Promise resolving to UserProfile
 * @throws ProfileServiceError on failure after retries
 */
export async function fetchUserProfile(
  userId?: string,
  retryCount = 0
): Promise<UserProfile> {
  try {
    // For now, return mock data
    // In production, this would make an actual API call:
    // const response = await fetch(`/api/user/profile${userId ? `/${userId}` : ''}`, {
    //   method: 'GET',
    //   headers: { 'Content-Type': 'application/json' },
    //   signal: AbortSignal.timeout(API_TIMEOUT)
    // })
    
    // Simulate network delay
    await delay(300)
    
    // Simulate occasional failures for testing retry logic
    if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
      throw new Error('Simulated network error')
    }
    
    const mockData = generateMockProfileData()
    
    return mockData
  } catch (error) {
    // Retry logic
    if (retryCount < MAX_RETRIES) {
      console.warn(
        `Profile fetch failed (attempt ${retryCount + 1}/${MAX_RETRIES}). Retrying...`,
        error
      )
      await delay(RETRY_DELAY * (retryCount + 1)) // Exponential backoff
      return fetchUserProfile(userId, retryCount + 1)
    }
    
    // All retries exhausted
    if (error instanceof ProfileServiceError) {
      throw error
    }
    
    throw new ProfileServiceError(
      'Failed to fetch profile data after multiple attempts',
      'FETCH_FAILED',
      500
    )
  }
}

/**
 * Fetch user profile with full error handling and type safety
 * Returns a ProfileApiResponse object
 */
export async function getUserProfile(
  userId?: string
): Promise<ProfileApiResponse> {
  try {
    const data = await fetchUserProfile(userId)
    
    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    
    if (error instanceof ProfileServiceError) {
      return {
        success: false,
        data: generateMockProfileData(), // Fallback data
        error: error.message
      }
    }
    
    return {
      success: false,
      data: generateMockProfileData(), // Fallback data
      error: 'An unexpected error occurred while loading your profile'
    }
  }
}

/**
 * Fetch specific profile section data
 * Useful for loading sections independently
 */
export async function fetchProfileSection(
  section: 'personal' | 'account' | 'security' | 'preferences',
  userId?: string
): Promise<Partial<UserProfile>> {
  try {
    // In production, this would call section-specific endpoints:
    // const response = await fetch(`/api/user/profile/${section}`)
    
    const fullProfile = await fetchUserProfile(userId)
    
    // Return only relevant fields for the section
    switch (section) {
      case 'personal':
        return {
          fullName: fullProfile.fullName,
          dateOfBirth: fullProfile.dateOfBirth,
          gender: fullProfile.gender,
          nationality: fullProfile.nationality,
          address: fullProfile.address,
          country: fullProfile.country,
          phoneNumber: fullProfile.phoneNumber,
          email: fullProfile.email
        }
      
      case 'account':
        return {
          displayName: fullProfile.displayName,
          createdAt: fullProfile.createdAt,
          lastLogin: fullProfile.lastLogin,
          membershipTier: fullProfile.membershipTier,
          isVerified: fullProfile.isVerified,
          language: fullProfile.language,
          timezone: fullProfile.timezone
        }
      
      case 'security':
        return {
          passwordChangedAt: fullProfile.passwordChangedAt,
          twoFactorEnabled: fullProfile.twoFactorEnabled,
          securityQuestionsSet: fullProfile.securityQuestionsSet,
          loginNotifications: fullProfile.loginNotifications,
          connectedDevices: fullProfile.connectedDevices,
          recentActivity: fullProfile.recentActivity
        }
      
      case 'preferences':
        return {
          emailNotifications: fullProfile.emailNotifications,
          smsAlerts: fullProfile.smsAlerts,
          contentPreferences: fullProfile.contentPreferences,
          defaultDashboardView: fullProfile.defaultDashboardView,
          darkMode: fullProfile.darkMode,
          contentLanguage: fullProfile.contentLanguage
        }
      
      default:
        throw new ProfileServiceError(
          `Invalid section: ${section}`,
          'INVALID_SECTION',
          400
        )
    }
  } catch (error) {
    if (error instanceof ProfileServiceError) {
      throw error
    }
    
    throw new ProfileServiceError(
      `Failed to fetch ${section} section`,
      'SECTION_FETCH_FAILED',
      500
    )
  }
}

/**
 * Validate profile data structure
 * Ensures all required fields are present
 */
export function validateProfileData(data: unknown): data is UserProfile {
  if (!data || typeof data !== 'object') {
    return false
  }
  
  const profile = data as Partial<UserProfile>
  
  // Check required identity fields
  if (!profile.id || !profile.name || !profile.email) {
    return false
  }
  
  // Check required personal details
  if (!profile.fullName || !profile.dateOfBirth || !profile.gender) {
    return false
  }
  
  // Check required account details
  if (!profile.displayName || !profile.createdAt || !profile.membershipTier) {
    return false
  }
  
  // All required fields present
  return true
}

/**
 * Refresh profile data
 * Forces a fresh fetch bypassing any cache
 */
export async function refreshProfile(userId?: string): Promise<UserProfile> {
  // In production, this would include cache-busting headers
  return fetchUserProfile(userId, 0)
}
