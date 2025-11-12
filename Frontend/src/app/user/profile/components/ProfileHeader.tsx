import { CheckCircle } from "lucide-react"
import { ProfilePhoto } from "./ProfilePhoto"
import { ProfileHeaderProps } from "@/types/profile"
import { cn } from "@/lib/utils"

/**
 * VerificationBadge Component
 * Displays a blue checkmark icon to indicate verified account status
 */
function VerificationBadge() {
  return (
    <span 
      className="inline-flex items-center transition-transform duration-200 hover:scale-110" 
      role="img" 
      aria-label="Verified account"
    >
      <CheckCircle className="w-5 h-5 text-blue-400 fill-blue-400/20 transition-all duration-200" />
    </span>
  )
}

/**
 * ProfileHeader Component
 * Displays user's profile photo, name, email, and verification status
 * at the top of the profile page with centered layout
 */
export function ProfileHeader({ user, onPhotoEdit }: ProfileHeaderProps) {
  return (
    
    <div 
      className="flex flex-col items-center gap-3 sm:gap-4 py-6 sm:py-8"
      role="banner"
      aria-label="User profile header"
    >
      {/* Profile Photo */}
      <ProfilePhoto 
        photoUrl={user.photoUrl}
        userName={user.name}
        {...(onPhotoEdit && { onEdit: onPhotoEdit })}
        size="lg"
      />
      
      {/* User Identity */}
      <div className="text-center" id="user-identity">
        {/* Name with Verification Badge */}
        <div className="flex items-center gap-2 justify-center mb-1">
          <h2 
            className={cn(
              "text-xl sm:text-2xl font-bold",
              "text-foreground"
            )}
            aria-label={`User name: ${user.name}`}
          >
            {user.name}
          </h2>
          {user.isVerified && <VerificationBadge />}
        </div>
        
        {/* Email */}
        <p className="text-xs sm:text-sm text-muted-foreground">
          {user.email}
        </p>
      </div>
    </div>
  )
}
