"use client"

import Image from "next/image"
import { Camera } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfilePhotoProps {
  photoUrl?: string
  userName: string
  onEdit?: () => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: "w-16 h-16 sm:w-20 sm:h-20",
  md: "w-20 h-20 sm:w-24 sm:h-24",
  lg: "w-24 h-24 sm:w-[120px] sm:h-[120px]"
}

const iconSizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8"
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function ProfilePhoto({ 
  photoUrl, 
  userName, 
  onEdit, 
  size = 'lg',
  className 
}: ProfilePhotoProps) {
  const initials = getInitials(userName)
  
  return (
    <div 
      className={cn(
        "relative group   ", 
        onEdit && "cursor-pointer profile-photo-edit",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4",
        "transition-transform duration-200 ease-in-out hover:scale-105",
        className
      )}
      onClick={onEdit}
      role={onEdit ? "button" : undefined}
      tabIndex={onEdit ? 0 : undefined}
      aria-label={onEdit ? `Edit profile photo for ${userName}` : `Profile photo of ${userName}`}
      onKeyDown={(e) => {
        if (onEdit && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onEdit()
        }
      }}
    >
      <div className={cn(
        "rounded-full overflow-hidden border-4 border-border relative",
        "transition-all duration-300 ease-in-out",
        onEdit && "group-hover:border-primary/50 group-focus-within:border-primary/50",
        sizeClasses[size]
      )}>
        {photoUrl ? (
          <Image 
            src={photoUrl} 
            alt={`Profile photo of ${userName}`}
            fill
            className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
            sizes="120px"
            priority
          />
        ) : (
          <div 
            className="@container/card ease-in-out hover:shadow-xl  bg-gradient-to-b from-neutral-800 to-neutral-900/90 border-neutral-900/50  overflow-hidden w-full h-full bg-muted flex items-center justify-center transition-colors duration-200"
            aria-label={`${userName} initials placeholder`}
          >
            <span className={cn(
              "font-bold transition-all duration-200",
              size === 'sm' ? "text-lg" : size === 'md' ? "text-2xl" : "text-4xl"
            )}>
              {initials}
            </span>
          </div>
        )}
      </div>
      {onEdit && (
        <div 
          className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-300 ease-in-out flex items-center justify-center backdrop-blur-[2px]"
          aria-hidden="true"
        >
          <Camera className={cn(
            "text-white transition-all duration-300 ease-in-out",
            "group-hover:scale-110 group-focus-within:scale-110",
            iconSizeClasses[size]
          )} />
        </div>
      )}
    </div>
  )
}
