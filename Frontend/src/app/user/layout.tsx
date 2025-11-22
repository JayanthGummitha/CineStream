import { cn } from "@/lib/utils"
import Link from "next/link"
import { AppSidebar } from "./components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { NotificationDropdown } from "@/components/navigation/notification-dropdown"
import {
  ProfileMenu,
  ProfileMenuContent,
  ProfileMenuGroup,
  ProfileMenuHeader,
  ProfileMenuHeaderContent,
  ProfileMenuItem,
  ProfileMenuTrigger,
} from "@/components/ui/profile-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { LogOutIcon, Settings, CreditCard, LayoutDashboard } from "lucide-react"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
      <main
        className={cn(
          "ml-auto w-full max-w-full",
          "peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]",
          "peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]",
          "sm:transition-[width] sm:duration-200 sm:ease-linear",
          "flex h-svh flex-col",
          "group-data-[scroll-locked=1]/body:h-full",
          "has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-svh",
        )}
      >
        <header className="flex h-14 sm:h-16 md:h-14 lg:h-16 shrink-0 items-center gap-2 sm:gap-3 md:gap-4 px-3 sm:px-4 md:px-6 border-b border-border">
          <SidebarTrigger className="scale-110 sm:scale-125 md:scale-100" />
          <div className="flex-1 flex items-center" id="breadcrumb" />
          
          {/* Right Side Actions */}
          <div className="flex items-center w-25 gap-2 sm:gap-3 shrink-0 relative z-50">
            {/* Notifications */}
            <NotificationDropdown className="text-foreground/70 hover:text-foreground hover:bg-accent transition-all duration-300 rounded-lg h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center" />

            {/* User Profile */}
            <ProfileMenu className="z-50">
              <ProfileMenuHeader>
                <ProfileMenuHeaderContent className="flex flex-col">
                  <div className="text-sm font-medium">Jayanth</div>
                </ProfileMenuHeaderContent>
                <ProfileMenuTrigger>
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                    <AvatarImage
                      src="https://avatars.githubusercontent.com/u/1?v=4"
                      alt="User"
                    />
                    <AvatarFallback className="text-sm">JA</AvatarFallback>
                  </Avatar>
                </ProfileMenuTrigger>
              </ProfileMenuHeader>
              <ProfileMenuContent className="z-50">
                <ProfileMenuGroup className="w-48">
                        <ProfileMenuItem asChild>
                          <Link href="/user/dashboard" className="flex items-center gap-2">
                            <LayoutDashboard size={20} />
                            Dashboard
                          </Link>
                        </ProfileMenuItem>

                        <ProfileMenuItem asChild>
                          <Link href="/user/subscription" className="flex items-center gap-2">
                            <CreditCard size={20} />
                            Subscription
                          </Link>
                        </ProfileMenuItem>

                        <ProfileMenuItem asChild>
                          <Link href="/user/settings" className="flex items-center gap-2">
                            <Settings size={20} />
                            Settings
                          </Link>
                        </ProfileMenuItem>

                        <Separator className="my-0.5" />

                        <ProfileMenuItem  className="flex items-center gap-2">
                          <LogOutIcon size={20} />
                          Logout
                        </ProfileMenuItem>
                      </ProfileMenuGroup>

                    </ProfileMenuContent>
                  </ProfileMenu>


                </div>
        </header>
        
       <SidebarInset className="flex-1">
           {children}
       </SidebarInset>
      </main>
      {/* <Notification /> */}
      </div>
    </SidebarProvider>



  )
}
