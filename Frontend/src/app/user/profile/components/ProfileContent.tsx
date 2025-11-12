/**
 * ProfileContent Component
 * Client component wrapper for profile page content
 * Handles error states and retry functionality
 */

'use client'

import { useState } from "react"
import { UserProfile } from "@/types/profile"
import { ProfileHeader } from "./ProfileHeader"
import { PersonalDetailsSection } from "./PersonalDetailsSection"
import { AccountDetailsSection } from "./AccountDetailsSection"
import { SecuritySettingsSection } from "./SecuritySettingsSection"
import { PreferencesSection } from "./PreferencesSection"
import { ProfileError } from "./ProfileError"

interface ProfileContentProps {
  initialData: UserProfile
  hasError?: boolean
  errorMessage?: string
}

export function ProfileContent({ 
  initialData, 
  hasError = false, 
  errorMessage 
}: ProfileContentProps) {
  const [showError, setShowError] = useState(hasError)
  const [user, setUser] = useState(initialData)

  const handleRetry = async () => {
    try {
      setShowError(false)
      // Trigger a page reload to refetch data
      window.location.reload()
    } catch (error) {
      console.error('Retry failed:', error)
      setShowError(true)
    }
  }

  // Show error state if there was an error
  if (showError && errorMessage) {
    return <ProfileError error={errorMessage} onRetry={handleRetry} />
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl animate-in fade-in duration-500">
      {/* Page Title - h1 for proper heading hierarchy */}
      <h1 className="sr-only">User Profile</h1>
      
      {/* Profile Header */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-700">
        <ProfileHeader
          user={{
            name: user.name,
            email: user.email,
            photoUrl: user.photoUrl,
            isVerified: user.isVerified
          }}
        />
      </div>

      {/* Sections Grid - 2 columns on desktop, 1 on mobile */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 mt-6 sm:mt-8">
        {/* Personal Details Section */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <PersonalDetailsSection user={user} />
        </div>

        {/* Account Details Section */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <AccountDetailsSection user={user} />
        </div>

        {/* Security Settings Section */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <SecuritySettingsSection user={user} />
        </div>

        {/* Preferences Section */}
        <div className="animate-in fade-in slide-in-from-bottom-4  duration-700 delay-[400ms]">
          <PreferencesSection user={user} />
        </div>
      </div>
    </div>
  )
}
