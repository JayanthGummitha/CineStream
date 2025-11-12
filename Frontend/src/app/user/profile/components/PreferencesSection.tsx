import { Mail, MessageSquare, Film, Layout, Moon, Languages } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { InfoTable, InfoTableRow } from "./InfoTable"
import { StatusBadge } from "./StatusBadge"
import { UserProfile } from "@/types/profile"

interface PreferencesSectionProps {
  user: UserProfile
}

export function PreferencesSection({ user }: PreferencesSectionProps) {
  const preferencesRows: InfoTableRow[] = [
    {
      label: "Email Notifications",
      value: <StatusBadge status={user.emailNotifications ? "Subscribed" : "Unsubscribed"} variant={user.emailNotifications ? "info" : "default"} />,
      icon: <Mail className="w-4 h-4" />
    },
    {
      label: "SMS Alerts",
      value: <StatusBadge status={user.smsAlerts ? "Enabled" : "Disabled"} variant={user.smsAlerts ? "info" : "default"} />,
      icon: <MessageSquare className="w-4 h-4" />
    },
    {
      label: "Content Preferences",
      value: user.contentPreferences.join(", "),
      icon: <Film className="w-4 h-4" />
    },
    {
      label: "Default Dashboard View",
      value: user.defaultDashboardView,
      icon: <Layout className="w-4 h-4" />
    },
    {
      label: "Dark Mode",
      value: <StatusBadge status={user.darkMode ? "Activated" : "Deactivated"} variant={user.darkMode ? "success" : "default"} />,
      icon: <Moon className="w-4 h-4" />
    },
    {
      label: "Language for Content",
      value: user.contentLanguage,
      icon: <Languages className="w-4 h-4" />
    }
  ]

  return (
    <Card className="flex flex-col @container/card transition-all duration-300 ease-in-out hover:shadow-xl  bg-gradient-to-b from-neutral-800 to-neutral-900/90 border-neutral-900/50  shadow-lg border-4 p-2  overflow-hidden">
      <CardHeader className=" border-b-1 border-solid">
        <CardTitle>
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2 transition-colors duration-200">
            <Layout className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400 transition-transform duration-200 hover:scale-110" aria-hidden="true" />
            Preferences
          </h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <InfoTable rows={preferencesRows} />
      </CardContent>
    </Card>
  )
}
