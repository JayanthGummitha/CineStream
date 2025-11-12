/**
 * Profile Page Error Boundary
 * Next.js route-level error handling
 * Catches and displays errors that occur during rendering
 */

'use client'

import { useEffect } from 'react'
import { ProfileError } from './components/ProfileError'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Profile page error:', error)
  }, [error])

  return (
    <ProfileError
      error={error.message || 'An unexpected error occurred while loading your profile'}
      onRetry={reset}
    />
  )
}
