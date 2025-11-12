/**
 * User Profile Type Definitions
 * Defines all interfaces and types for the user profile feature
 */

export interface UserProfile {
  // Identity
  id: string
  name: string
  email: string
  photoUrl?: string
  isVerified: boolean
  
  // Personal Details
  fullName: string
  dateOfBirth: Date
  gender: string
  nationality: string
  address: string
  country: string
  phoneNumber: string
  
  // Account Details
  displayName: string
  createdAt: Date
  lastLogin: Date
  membershipTier: 'Free' | 'Basic' | 'Premium' | 'Premium Member'
  language: string
  timezone: string
  
  // Security Settings
  passwordChangedAt: Date
  twoFactorEnabled: boolean
  securityQuestionsSet: boolean
  loginNotifications: boolean
  connectedDevices: number
  recentActivity: string
  
  // Preferences
  emailNotifications: boolean
  smsAlerts: boolean
  contentPreferences: string[]
  defaultDashboardView: 'Compact Mode' | 'Grid View' | 'List View'
  darkMode: boolean
  contentLanguage: string
}

export interface ProfileApiResponse {
  success: boolean
  data: UserProfile
  error?: string
}

// Component Props Interfaces

export interface ProfileHeaderProps {
  user: {
    name: string
    email: string
    photoUrl?: string
    isVerified: boolean
  }
  onPhotoEdit?: () => void
}

export interface ProfilePhotoProps {
  photoUrl?: string
  userName: string
  onEdit?: () => void
  size?: 'sm' | 'md' | 'lg'
}

export interface InfoTableRow {
  label: string
  value: string | React.ReactNode
  icon?: React.ReactNode
}

export interface InfoTableProps {
  rows: InfoTableRow[]
  className?: string
}

export interface StatusBadgeProps {
  status: string
  variant: 'success' | 'warning' | 'info' | 'default' | 'premium'
  className?: string
}

export interface SectionProps {
  user: UserProfile
}
