import Link from 'next/link';
import { Header } from '@/components/navigation/header';
import { Footer } from '@/components/navigation/footer';
import { HeroSection } from '@/components/home/hero-section';
import { ContentCarousel } from '@/components/content/content-carousel';
import { ContinueWatchingSection } from '@/components/home/continue-watching-section';
import { RewatchSection } from '@/components/home/RewatchSection';
import { PopularWeekSection } from '@/components/home/popular-week-section';
import { JustReleaseSection } from '@/components/home/just-release-section';
// import { YourWatchlistSection } from '@/components/home/your-watchlist-section';
import { YourLikesSection } from '@/components/home/your-likes-section';
import { MyListSection } from '@/components/home/my-list-section';
import { CTASection } from '@/components/home/cta-section';
import { Button } from '@/components/ui/button';
import { getFeaturedContent, getHomeCollections } from '@/lib/movie-service';

export default async function Home() {
  // For demo purposes, we'll show as authenticated user to see all sections
  const isAuthenticated = true;

  // Fetch real data from TMDB
  const [featuredContent, collections] = await Promise.all([
    getFeaturedContent(),
    getHomeCollections()
  ]);

  // Organize collections by type
  const trendingCollection = collections.find(c => c.id === 'trending');
  const popularCollection = collections.find(c => c.id === 'popular');
  const topRatedCollection = collections.find(c => c.id === 'top-rated');
  const nowPlayingCollection = collections.find(c => c.id === 'now-playing');
  const upcomingCollection = collections.find(c => c.id === 'upcoming');

  return (
    <div className="min-h-screen  bg-background overflow-x-hidden">
      <Header isAuthenticated={isAuthenticated} />

      <main className=" w-screen overflow-x-hidden">
        {/* Hero Section */}
        <HeroSection
          featuredContent={featuredContent}
          isAuthenticated={isAuthenticated}
        />

        {/* Netflix-Style Content Sections - Full width with minimal padding */}
        <div className="w-full spacing-section space-responsive-large bg-background">

            {/* Continue Watching Section */}
            {isAuthenticated && (
              <ContinueWatchingSection />
            )}

            {/* Watch Again Section - Completed content from 15-20 days ago */}
            {isAuthenticated && (
              <RewatchSection />
            )}

            {/* My List Section */}
            {isAuthenticated && (
              <MyListSection
                isAuthenticated={isAuthenticated}
              />
            )}

            {/* Popular of the Week - Numbered List Style */}
            {popularCollection && popularCollection.items && popularCollection.items.length > 0 && (
              <PopularWeekSection
                items={popularCollection.items.slice(0, 10)}
                isAuthenticated={isAuthenticated}
              />
            )}

            {/* Just Release Section */}
            {nowPlayingCollection && nowPlayingCollection.items && nowPlayingCollection.items.length > 0 && (
              <JustReleaseSection
                items={nowPlayingCollection.items.slice(0, 8)}
                isAuthenticated={isAuthenticated}
              />
            )}

            {/* Your Watchlist */}
            {/* {isAuthenticated && (
              <YourWatchlistSection
                items={featuredContent.slice(2, 8)}
                isAuthenticated={isAuthenticated}
              />
            )} */}

            {/* Your Likes */}
            {isAuthenticated && (
              <YourLikesSection />
            )}

            {/* Call to Action - Shows based on user subscription status */}
            <CTASection />
        </div>
      </main>

      <Footer />


    </div>
  );
}