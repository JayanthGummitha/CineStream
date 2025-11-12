'use client';

import { Header } from '@/components/navigation/header';
import { Footer } from '@/components/navigation/footer';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Clock, Heart, Download, Bookmark, Play, Settings, CreditCard, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth();

  // Mock data for statistics
  const stats = [
    {
      icon: Clock,
      label: 'Hours Watched',
      value: '127',
      bgColor: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
    },
    {
      icon: Heart,
      label: 'Favorites',
      value: '42',
      bgColor: 'bg-red-500/20',
      iconColor: 'text-red-400',
    },
    {
      icon: Download,
      label: 'Downloads',
      value: '18',
      bgColor: 'bg-green-500/20',
      iconColor: 'text-green-400',
    },
    {
      icon: Bookmark,
      label: 'Watchlist',
      value: '23',
      bgColor: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
    },
  ];

  // Mock data for Continue Watching
  const continueWatching = [
    {
      id: 1,
      title: 'Stranger Things',
      thumbnail: '/placeholder-movie.jpg',
      progress: 65,
    },
    {
      id: 2,
      title: 'The Crown',
      thumbnail: '/placeholder-movie.jpg',
      progress: 42,
    },
    {
      id: 3,
      title: 'Breaking Bad',
      thumbnail: '/placeholder-movie.jpg',
      progress: 88,
    },
    {
      id: 4,
      title: 'The Witcher',
      thumbnail: '/placeholder-movie.jpg',
      progress: 23,
    },
  ];

  // Mock data for Recommendations
  const recommendations = [
    {
      id: 1,
      title: 'Inception',
      thumbnail: '/placeholder-movie.jpg',
      rating: 8.8,
    },
    {
      id: 2,
      title: 'The Dark Knight',
      thumbnail: '/placeholder-movie.jpg',
      rating: 9.0,
    },
    {
      id: 3,
      title: 'Interstellar',
      thumbnail: '/placeholder-movie.jpg',
      rating: 8.6,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isAuthenticated={isAuthenticated} user={user || undefined} />

      <main className="flex-1 pt-20 pb-12">
        <div className="container max-w-7xl mx-auto px-4">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Welcome back, {user?.name || 'User'}!
                </h1>
                <p className="text-white/60">
                  Ready to continue your streaming journey?
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold text-sm w-fit">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                {user?.subscription?.plan || 'Premium'} Member
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => {
              const IconComponent = stat.icon;
              return (
                <Card
                  key={stat.label}
                  className="bg-white/5 border-white/10 p-6 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <IconComponent className={`h-6 w-6 ${stat.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-sm text-white/60">{stat.label}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Continue Watching Section */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-white mb-4">Continue Watching</h2>
              <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
                {continueWatching.map((item) => (
                  <div
                    key={item.id}
                    className="group relative rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                  >
                    <div className="relative aspect-video">
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="h-6 w-6 text-black ml-1" fill="black" />
                        </div>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    {item.progress < 100 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                    {/* Title and Progress */}
                    <div className="p-3">
                      <p className="text-white font-medium text-sm mb-1">{item.title}</p>
                      <p className="text-white/60 text-xs">{item.progress}% complete</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Account Overview Card */}
              <Card className="bg-white/5 border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Account Overview</h3>
                <div className="flex flex-col items-center text-center mb-6">
                  <Avatar className="h-20 w-20 mb-3">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white text-2xl">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="text-white font-semibold text-lg">{user?.name || 'User'}</h4>
                  <p className="text-white/60 text-sm mb-2">{user?.email || 'user@example.com'}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold">
                    {user?.subscription?.plan || 'Premium'}
                  </div>
                </div>
                <div className="border-t border-white/10 pt-4 mb-4">
                  <p className="text-white/60 text-sm">
                    Member since{' '}
                    <span className="text-white font-medium">
                      {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  </p>
                </div>
                <div className="space-y-2">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
                  >
                    <Link href="/user/settings" className="flex items-center justify-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
                  >
                    <Link href="/user/subscription-details" className="flex items-center justify-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Subscription
                    </Link>
                  </Button>
                </div>
              </Card>

              {/* Recommendations Card */}
              <Card className="bg-white/5 border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recommended for You</h3>
                <div className="space-y-3">
                  {recommendations.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <div className="relative w-16 h-24 flex-shrink-0 rounded overflow-hidden">
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h4 className="text-white font-medium text-sm mb-1 group-hover:text-red-400 transition-colors">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-white/60 text-xs">{item.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
