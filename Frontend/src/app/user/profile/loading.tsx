/**
 * Profile Page Loading State
 * Next.js route-level loading UI
 * Automatically shown during page navigation and data fetching
 */

import { ProfileSkeleton } from "./components/ProfileSkeleton"

export default function Loading() {
  return <ProfileSkeleton />
}
