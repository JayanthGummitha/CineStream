import { User, Calendar, Users, Globe, MapPin, Phone, Mail } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { InfoTable, InfoTableRow } from "./InfoTable"
import { UserProfile } from "@/types/profile"
import { formatDate, getCountryFlag } from "@/lib/profile/profile-utils"

interface PersonalDetailsSectionProps {
  user: UserProfile
}

export function PersonalDetailsSection({ user }: PersonalDetailsSectionProps) {
  const personalDetailsRows: InfoTableRow[] = [
    { 
      label: "Full name", 
      value: user.fullName, 
      icon: <User className="w-4 h-4" /> 
    },
    { 
      label: "Date of Birth", 
      value: formatDate(user.dateOfBirth), 
      icon: <Calendar className="w-4 h-4" /> 
    },
    { 
      label: "Gender", 
      value: user.gender, 
      icon: <Users className="w-4 h-4" /> 
    },
    { 
      label: "Nationality", 
      value: user.nationality, 
      icon: <Globe className="w-4 h-4" /> 
    },
    { 
      label: "Address", 
      value: (
        <div className="flex items-center gap-2">
          <span className="text-lg">{getCountryFlag(user.country)}</span>
          <span>{user.address}</span>
        </div>
      ),
      icon: <MapPin className="w-4 h-4" />
    },
    { 
      label: "Phone Number", 
      value: user.phoneNumber, 
      icon: <Phone className="w-4 h-4" /> 
    },
    { 
      label: "Email", 
      value: user.email, 
      icon: <Mail className="w-4 h-4" /> 
    }
  ]

  return (
    // <Card className="flex flex-col transition-all duration-300 ease-in-out hover:shadow-lg hover:border-blue-400/30">
            <Card className="flex flex-col @container/card transition-all duration-300 ease-in-out hover:shadow-xl  bg-gradient-to-b from-neutral-800 to-neutral-900/90 border-neutral-900/50  shadow-lg border-4 p-2  overflow-hidden">

      <CardHeader className=" border-b border-border/40">
        <CardTitle>
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2 transition-colors duration-200">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 transition-transform duration-200 hover:scale-110" aria-hidden="true" />
            Personal Details
          </h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <InfoTable rows={personalDetailsRows} />
      </CardContent>
    </Card>
  )
}
