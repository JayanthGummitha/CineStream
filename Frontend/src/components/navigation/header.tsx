'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, User, Menu, X, LogOutIcon, Settings, CreditCard, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResponsiveSearch } from '@/components/ui/responsive-search';
import {
  ProfileMenu,
  ProfileMenuContent,
  ProfileMenuGroup,
  ProfileMenuHeader,
  ProfileMenuHeaderContent,
  ProfileMenuItem,
  ProfileMenuTrigger,
} from "@/components/ui/profile-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { AuthModal } from '@/components/auth/auth-modal';
import { NotificationDropdown } from '@/components/navigation/notification-dropdown';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';


interface HeaderProps {
  isAuthenticated?: boolean;
  user?: {
    name: string;
    avatar?: string;
    email: string;
  };
}

const NAVIGATION_ITEMS = [
  { name: 'Home', href: '/' },
  { name: 'Movies', href: '/movies' },
  { name: 'Tv-Shows', href: '/tv-shows' },
  { name: 'Documentaries', href: '/documentaries' },
  { name: 'Kids', href: '/kids' },
];

export function Header({ isAuthenticated: propIsAuthenticated, user: propUser }: HeaderProps) {
  // Use auth hook to get real authentication state
  const { isAuthenticated: hookIsAuthenticated, user: hookUser, logout } = useAuth();

  // Use prop values if provided, otherwise use hook values
  const isAuthenticated = propIsAuthenticated ?? hookIsAuthenticated;
  const user = propUser ?? (hookUser || { 'avatar': "h", 'email': "jayanth", 'name': "Jayanth" });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu when clicking outside or on escape
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isSearchOpen) {
          setIsSearchOpen(false);
        } else if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="absolute top-0 left-0 right-0 z-50 w-full">
      <div className="px-4 flex h-16 sm:h-18 md:h-20 lg:h-16 xl:h-18 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <div className="text-white font-bold text-xl tracking-tight">
              CineStream
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-responsive-large">
          {NAVIGATION_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm md:text-base lg:text-sm xl:text-base font-medium transition-all duration-300 hover:text-white hover:scale-105 relative group",
                pathname === item.href
                  ? "text-white"
                  : "text-white/70"
              )}
            >
              {item.name}
              {/* Active indicator */}
              {pathname === item.href && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full" />
              )}
              {/* Hover indicator */}
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white/30 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </Link>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-responsive">
          {/* Search */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSearchOpen(true)}
            className="touch-target text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-lg p-2 sm:p-2.5 md:p-3 lg:p-2 xl:p-2.5"
            aria-label="Search movies and shows"
          >
            <Search className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-5 lg:w-5 xl:h-5 xl:w-5" />
          </Button>

          {/* Language Selector */}
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white"
              >
                <Globe className="h-4 w-4 mr-1" />
                <span className="text-sm">EN</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>English</DropdownMenuItem>
              <DropdownMenuItem>Spanish</DropdownMenuItem>
              <DropdownMenuItem>French</DropdownMenuItem>
              <DropdownMenuItem>German</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}

          {
            isAuthenticated && user

              ? (
                <div className='flex flex-row relative w-25 justify-between justify-items-stretch'>
                  {/* Notifications */}
                  <NotificationDropdown className="touch-target text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-lg" />

                  {/* User Profile */}
                  <ProfileMenu className=''>
                    <ProfileMenuHeader>
                      <ProfileMenuHeaderContent className="flex flex-col">
                        <div>Jayanth</div>
                      </ProfileMenuHeaderContent>
                      <ProfileMenuTrigger>
                        <div className="flex items-center justify-end">
                          <Avatar className="">
                            <AvatarImage
                              src="https://avatars.githubusercontent.com/u/1?v=4"
                              alt="MUI"
                            />
                            <AvatarFallback>MUI</AvatarFallback>
                          </Avatar>
                        </div>
                      </ProfileMenuTrigger>
                    </ProfileMenuHeader>
                    <ProfileMenuContent>
                      <ProfileMenuGroup className="w-40">
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

                        <ProfileMenuItem onClick={logout} className="flex items-center gap-2">
                          <LogOutIcon size={20} />
                          Logout
                        </ProfileMenuItem>
                      </ProfileMenuGroup>

                    </ProfileMenuContent>
                  </ProfileMenu>


                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-responsive-compact">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="button-responsive text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-lg"
                    asChild
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button
                    size="sm"
                    className="button-responsive bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl"
                    asChild
                  >
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </div>
              )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="flex lg:hidden touch-target-large text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-lg p-2 sm:p-2.5 md:p-3"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
            ) : (
              <Menu className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
            )}
          </Button>
        </div>
      </div>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-60 p-4 sm:p-6 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Search movies and shows"
        >
          <div className="responsive-container max-w-3xl">
            <ResponsiveSearch
              placeholder="Search movies, TV shows, documentaries, actors..."
              variant="overlay"
              size="lg"
              autoFocus={true}
              onSubmit={(value) => {
                // Add search logic here
                setIsSearchOpen(false);
              }}
              onClear={() => {
                // Clear search logic
              }}
              className="w-full"
            />

            {/* Search Suggestions */}
            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-white/60 text-sm sm:text-base mb-4">Popular Searches</p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {['Action Movies', 'Netflix Series', 'Marvel', 'Comedy Shows', 'Documentaries'].map((term) => (
                  <button
                    key={term}
                    className="touch-target px-3 py-2 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/70 hover:text-white hover:bg-white/20 active:bg-white/30 transition-all duration-300 text-xs sm:text-sm focus:ring-2 focus:ring-white/20"
                    onClick={() => {
                      // Add search logic here
                      setIsSearchOpen(false);
                    }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />

          {/* Mobile Menu */}
          <div
            id="mobile-navigation"
            className="lg:hidden fixed top-16 sm:top-18 md:top-20 left-0 right-0 bottom-0 bg-black/95 backdrop-blur-md border-t border-white/10 z-50 overflow-y-auto"
            role="navigation"
            aria-label="Mobile navigation menu"
          >
            <nav className="responsive-container spacing-component space-responsive-compact">
              {NAVIGATION_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "touch-target-large block py-4 sm:py-5 md:py-6 px-4 sm:px-6 text-base sm:text-lg md:text-xl font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/20",
                    pathname === item.href
                      ? "text-white bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 shadow-lg"
                      : "text-white/70 hover:text-white hover:bg-white/10 active:bg-white/20"
                  )}
                  onClick={closeMobileMenu}
                  tabIndex={0}
                  role="menuitem"
                >
                  <div className="flex items-center justify-between">
                    <span>{item.name}</span>
                    {pathname === item.href && (
                      <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full" />
                    )}
                  </div>
                </Link>
              ))}

              {/* Authentication Buttons for Mobile */}
              {!isAuthenticated && (
                <div className="spacing-component space-responsive border-t border-white/10 margin-component">
                  <Button
                    variant="ghost"
                    className="touch-target-large w-full h-12 sm:h-14 md:h-16 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 active:bg-white/20 font-medium text-base sm:text-lg transition-all duration-300 focus:ring-2 focus:ring-white/20"
                    asChild
                  >
                    <Link href="/login" onClick={closeMobileMenu}>Sign In</Link>
                  </Button>
                  <Button
                    className="touch-target-large w-full h-12 sm:h-14 md:h-16 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 active:from-red-700 active:to-orange-700 text-white font-medium text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-white/20"
                    asChild
                  >
                    <Link href="/signup" onClick={closeMobileMenu}>Get Started</Link>
                  </Button>
                </div>
              )}

              {/* User Profile Section for Mobile */}
              {isAuthenticated && user && (
                <div className="spacing-component margin-component">
                  <div className="flex items-center gap-responsive spacing-x-component rounded-xl">
                    <Avatar className="h-12 w-12 sm:h-14 sm:w-14">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white text-lg sm:text-xl">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-white font-medium text-base sm:text-lg">{user.name}</p>
                      <p className="text-white/60 text-sm sm:text-base">{user.email}</p>
                    </div>
                  </div>

                  <div className="margin-element space-responsive-compact">
                    <Link
                      href="/profile"
                      className="touch-target-large flex items-center gap-responsive spacing-x-element text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
                      onClick={closeMobileMenu}
                    >
                      <User className="h-5 w-5" />
                      <span className="text-base sm:text-lg">Profile</span>
                    </Link>
                    <Link
                      href="/subscription"
                      className="touch-target-large flex items-center gap-responsive spacing-x-element text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
                      onClick={closeMobileMenu}
                    >
                      <div className="h-5 w-5 bg-gradient-to-br from-red-500 to-orange-500 rounded"></div>
                      <span className="text-base sm:text-lg">Subscription</span>
                    </Link>
                    <button
                      className="touch-target-large flex items-center gap-responsive spacing-x-element text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 w-full text-left"
                      onClick={() => {
                        closeMobileMenu();
                        logout();
                      }}
                    >
                      <div className="h-5 w-5 border border-white/30 rounded"></div>
                      <span className="text-base sm:text-lg">Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </nav>
          </div>
        </>
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="signup"
      />
    </header>
  );
}