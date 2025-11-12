import { Key, Shield, HelpCircle, Bell, Smartphone, Activity } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { InfoTable, InfoTableRow } from "./InfoTable"
import { StatusBadge } from "./StatusBadge"
import { UserProfile } from "@/types/profile"
import { formatDate } from "@/lib/profile/profile-utils"

interface SecuritySettingsSectionProps {
  user: UserProfile
}

export function SecuritySettingsSection({ user }: SecuritySettingsSectionProps) {
  const securitySettingsRows: InfoTableRow[] = [
    { 
      label: "Password Last Changed", 
      value: formatDate(user.passwordChangedAt), 
      icon: <Key className="w-4 h-4" /> 
    },
    { 
      label: "Two-Factor Authentication", 
      value: <StatusBadge status={user.twoFactorEnabled ? "Enabled" : "Disabled"} variant={user.twoFactorEnabled ? "info" : "default"} />,
      icon: <Shield className="w-4 h-4" />
    },
    { 
      label: "Security Questions Set", 
      value: user.securityQuestionsSet ? "Yes" : "No", 
      icon: <HelpCircle className="w-4 h-4" /> 
    },
    { 
      label: "Login Notifications", 
      value: <StatusBadge status={user.loginNotifications ? "Enabled" : "Disabled"} variant={user.loginNotifications ? "info" : "default"} />,
      icon: <Bell className="w-4 h-4" />
    },
    { 
      label: "Connected Devices", 
      value: `${user.connectedDevices} Device${user.connectedDevices !== 1 ? 's' : ''}`, 
      icon: <Smartphone className="w-4 h-4" /> 
    },
    { 
      label: "Recent Account Activity", 
      value: user.recentActivity, 
      icon: <Activity className="w-4 h-4" /> 
    }
  ]

  return (
            <Card className="flex flex-col @container/card transition-all duration-300 ease-in-out hover:shadow-xl  bg-gradient-to-b from-neutral-800 to-neutral-900/90 border-neutral-900/50  shadow-lg border-4 p-2  overflow-hidden">
      <CardHeader className=" border-b border-border/40">
        <CardTitle>
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2 transition-colors duration-200">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 transition-transform duration-200 hover:scale-110" aria-hidden="true" />
            Security Settings
          </h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <InfoTable rows={securitySettingsRows} />
      </CardContent>
    </Card>
  )
}
