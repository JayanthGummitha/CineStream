import { Suspense } from "react"
import { getUserProfile } from "@/lib/profile/profile-service"
import { ProfileContent } from "./components/ProfileContent"
import { ProfileSkeleton } from "./components/ProfileSkeleton"

/**
 * User Profile Page
 * Displays comprehensive user account information organized into sections:
 * - Profile Header with photo and identity
 * - Personal Details
 * - Account Details
 * - Security Settings
 * - Preferences
 * 
 * Features:
 * - Server-side data fetching with Suspense
 * - Loading skeleton during data fetch
 * - Error handling with retry functionality
 * - Responsive grid layout (2 columns desktop, 1 column mobile)
 * - Proper spacing and container classes
 */

async function ProfileData() {
  // Fetch user profile data
  const profileResponse = await getUserProfile()

  // Pass data and error state to client component
  return (
    <ProfileContent
      initialData={profileResponse.data}
      hasError={!profileResponse.success}
      errorMessage={profileResponse.error}
    />
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileData />
    </Suspense>
  )
}
