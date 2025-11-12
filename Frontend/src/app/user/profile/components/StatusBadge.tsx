import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  variant: 'success' | 'warning' | 'info' | 'default' | 'premium'
  className?: string
}

// WCAG AA compliant color variants with 4.5:1 contrast ratio
const variantStyles = {
  success: "bg-green-500/20 text-green-300 border-green-500/30",
  warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  info: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  default: "bg-muted text-muted-foreground border-border",
  premium: "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-200 border-purple-500/30"
}

// Descriptive labels for screen readers
const variantLabels: Record<string, string> = {
  success: "Success status",
  warning: "Warning status",
  info: "Information status",
  default: "Default status",
  premium: "Premium status"
}

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const ariaLabel = `${variantLabels[variant]}: ${status}`
  
  return (
    <span 
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        "transition-all duration-200 ease-in-out",
        "hover:scale-105 hover:shadow-sm",
        variantStyles[variant],
        className
      )}
      role="status"
      aria-label={ariaLabel}
    >
      {status}
    </span>
  )
}
