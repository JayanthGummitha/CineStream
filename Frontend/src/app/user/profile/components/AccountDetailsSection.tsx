import { User, Calendar, Clock, Crown, ShieldCheck, Languages } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { InfoTable, InfoTableRow } from "./InfoTable"
import { StatusBadge } from "./StatusBadge"
import { UserProfile } from "@/types/profile"
import { formatDate } from "@/lib/profile/profile-utils"

interface AccountDetailsSectionProps {
  user: UserProfile
}

export function AccountDetailsSection({ user }: AccountDetailsSectionProps) {
  const accountDetailsRows: InfoTableRow[] = [
    { 
      label: "Display Name", 
      value: user.displayName, 
      icon: <User className="w-4 h-4" /> 
    },
    { 
      label: "Account Created", 
      value: formatDate(user.createdAt), 
      icon: <Calendar className="w-4 h-4" /> 
    },
    { 
      label: "Last Login", 
      value: formatDate(user.lastLogin), 
      icon: <Clock className="w-4 h-4" /> 
    },
    { 
      label: "Membership Status", 
      value: <StatusBadge status={user.membershipTier} variant="premium" />,
      icon: <Crown className="w-4 h-4" />
    },
    { 
      label: "Account Verification", 
      value: <StatusBadge status={user.isVerified ? "Verified" : "Not Verified"} variant={user.isVerified ? "success" : "default"} />,
      icon: <ShieldCheck className="w-4 h-4" />
    },
    { 
      label: "Language Preference", 
      value: user.language, 
      icon: <Languages className="w-4 h-4" /> 
    },
    { 
      label: "Time Zone", 
      value: user.timezone, 
      icon: <Clock className="w-4 h-4" /> 
    }
  ]

  return (
            <Card className="flex flex-col @container/card transition-all duration-300 ease-in-out hover:shadow-xl  bg-gradient-to-b from-neutral-800 to-neutral-900/90 border-neutral-900/50  shadow-lg border-4 p-2  overflow-hidden">
      <CardHeader className=" border-b border-border/40">
        <CardTitle >
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2 transition-colors duration-200">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 transition-transform duration-200 hover:scale-110" aria-hidden="true" />
            Account Details
          </h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <InfoTable rows={accountDetailsRows} />
      </CardContent>
    </Card>
  )
}
