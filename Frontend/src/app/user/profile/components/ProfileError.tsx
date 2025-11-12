/**
 * ProfileError Component
 * Error state display for the profile page
 * Shows error message with retry functionality
 */

'use client'

import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ProfileErrorProps {
  error?: string
  onRetry?: () => void
}

export function ProfileError({ 
  error = "Failed to load profile data", 
  onRetry 
}: ProfileErrorProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      // Default retry behavior: reload the page
      window.location.reload()
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl animate-in fade-in duration-500">
      <Card 
        className="flex flex-col items-center justify-center p-8 sm:p-12 transition-all duration-300 hover:shadow-lg"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <AlertCircle 
          className="w-12 h-12 sm:w-16 sm:h-16 text-destructive mb-4 animate-in zoom-in duration-500" 
          aria-hidden="true"
        />
        
        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-center animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
          Failed to Load Profile
        </h3>
        
        <p className="text-sm sm:text-base text-muted-foreground mb-6 text-center max-w-md animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
          {error}
        </p>
        
        <Button 
          onClick={handleRetry} 
          variant="outline"
          className="gap-2 transition-all duration-200 hover:scale-105 hover:shadow-md animate-in fade-in slide-in-from-bottom-2 delay-300"
          aria-label="Retry loading profile data"
        >
          <RefreshCw className="w-4 h-4 transition-transform duration-300 hover:rotate-180" aria-hidden="true" />
          Retry
        </Button>
      </Card>
    </div>
  )
}
