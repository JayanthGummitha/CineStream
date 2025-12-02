"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconHome,
  IconDeviceTv,
  IconMovie,
  IconHeart,
  IconClock,
  IconHistory,
  IconUser,
  IconSettings,
  IconHelp,
  IconSearch,
  IconPlayerPlay,
  IconBell,
  IconCreditCard,
  IconUserCircle,
  IconDeviceDesktop,
} from "@tabler/icons-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { NavDocuments } from "./nav-documents"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"

const data = {
  user: {
    name: "John Doe",
    email: "john@cinestream.com",
    avatar: "/avatars/user.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/user/dashboard",
      icon: IconHome,
    },
    {
      title: "Profile",
      url: "/user/profile",
      icon: IconUserCircle,
    },
    {
      title: "Subscription",
      url: "/user/subscription",
      icon: IconCreditCard,
    },
    {
      title: "Register Devices",
      url: "/user/register-devices",
      icon: IconDeviceDesktop,
    },

    {
      title: "Watchlist",
      url: "/user/watchlist",
      icon: IconHeart,
    },
    {
      title: "Continue Watching",
      url: "/user/continue-watching",
      icon: IconPlayerPlay,
    },
    {
      title: "Watch History",
      url: "/user/history",
      icon: IconHistory,
    },
    {
      title: "Recently Added",
      url: "/user/recently-added",
      icon: IconClock,
    },
    {
      title: "Notifications",
      url: "/user/notifications",
      icon: IconBell,
    },
    {
      title: "Settings",
      url: "/user/settings",
      icon: IconSettings,
    },
    {
      title: "Help Center",
      url: "/help",
      icon: IconHelp,
    }
  ],
  navClouds: [
    {
      title: "Account",
      icon: IconUser,
      isActive: true,
      url: "/user/account",
      items: [
        {
          title: "Profile",
          url: "/user/profile",
        },
        {
          title: "Subscription",
          url: "/subscription",
        },
        {
          title: "Notifications",
          url: "/user/notifications",
        },

      ]
    },
  ],
  navSecondary: [
    // {
    //   title: "Settings",
    //   url: "/user/settings",
    //   icon: IconSettings,
    // },
    // {
    //   title: "Help Center",
    //   url: "/help",
    //   icon: IconHelp,
    // },

  ],
  documents: [
    // {
    //   name: "Watch History",
    //   url: "/user/history",
    //   icon: IconHistory,
    // },
    // {
    //   name: "Recently Added",
    //   url: "/recently-added",
    //   icon: IconClock,
    // },
    // {
    //   name: "Notifications",
    //   url: "/user/notifications",
    //   icon: IconBell,
    // },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (

    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5"
            >
              <Link href="/">
                <IconPlayerPlay className="!size-5 text-red-500" />
                <span
                  className="text-base font-semibold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">CineStream</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <NavMain items={data.navMain} />
          {/* <NavSecondary items={data.navSecondary} /> */}
        </SidebarMenu>
        {/* <SidebarGroup>
          <SidebarGroupContent>
          </SidebarGroupContent>
        </SidebarGroup> */}
      </SidebarContent>
      <SidebarFooter>

        <NavUser user={data.user} />

      </SidebarFooter>
    </Sidebar>

  )
}
