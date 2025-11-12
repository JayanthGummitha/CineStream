'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, Menu, X, LogOutIcon, Settings, CreditCard, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const NAVIGATION_ITEMS = [
    { name: 'Home', href: '/' },
    { name: 'Movies', href: '/movies' },
    { name: 'Tv-Shows', href: '/tv-shows' },
    { name: 'Documentaries', href: '/documentaries' },
    { name: 'Kids', href: '/kids' },
];

export function DashboardHeader() {
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isMobileMenuOpen]);

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
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <div className="flex items-center">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                            <div className="w-4 h-4 bg-white rounded-sm"></div>
                        </div>
                        <div className="font-bold text-xl tracking-tight">
                            CineStream
                        </div>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-6">
                    {NAVIGATION_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary",
                                pathname === item.href
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Right Side Actions */}
                <div className="flex items-center gap-2">
                    {/* Search */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        aria-label="Search movies and shows"
                    >
                        <Search className="h-4 w-4" />
                    </Button>

                    {/* Notifications */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 relative"
                        aria-label="Notifications"
                    >
                        <Bell className="h-4 w-4" />
                        <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                    </Button>

                    {/* User Profile */}
                    <ProfileMenu>
                        <ProfileMenuHeader>
                            <ProfileMenuHeaderContent className="flex flex-col">
                                <div>{user?.name || 'Jayanth'}</div>
                            </ProfileMenuHeaderContent>
                            <ProfileMenuTrigger>
                                <div className="flex items-center justify-end">
                                    <Avatar>
                                        <AvatarImage
                                            src={user?.avatar || "https://avatars.githubusercontent.com/u/1?v=4"}
                                            alt={user?.name || 'User'}
                                        />
                                        <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white">
                                            {user?.name?.charAt(0) || 'U'}
                                        </AvatarFallback>
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
                                    <Link href="/user/subscription-details" className="flex items-center gap-2">
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

                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="flex lg:hidden h-9 w-9"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <>
                    <div
                        className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
                        onClick={closeMobileMenu}
                        aria-hidden="true"
                    />

                    <div className="lg:hidden fixed top-16 left-0 right-0 bottom-0 bg-background border-t z-50 overflow-y-auto">
                        <nav className="container flex flex-col space-y-3 px-4 py-4">
                            {NAVIGATION_ITEMS.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "block py-4 px-4 text-base font-medium rounded-xl transition-all",
                                        pathname === item.href
                                            ? "text-foreground bg-accent"
                                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                    )}
                                    onClick={closeMobileMenu}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </>
            )}
        </header>
    );
}
