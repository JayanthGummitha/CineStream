import Link from 'next/link';
import { Header } from '@/components/navigation/header';
import { Footer } from '@/components/navigation/footer';
import { HeroSection } from '@/components/home/hero-section';
import { ContentCarousel } from '@/components/content/content-carousel';
import { ContinueWatchingSection } from '@/components/home/continue-watching-section';
import { PopularWeekSection } from '@/components/home/popular-week-section';
import { JustReleaseSection } from '@/components/home/just-release-section';
// import { YourWatchlistSection } from '@/components/home/your-watchlist-section';
import { YourLikesSection } from '@/components/home/your-likes-section';
import { MyListSection } from '@/components/home/my-list-section';
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
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={isAuthenticated} />

      <main>
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
            {isAuthenticated && topRatedCollection && topRatedCollection.items && topRatedCollection.items.length > 0 && (
              <YourLikesSection
                items={topRatedCollection.items.slice(0, 8)}
                isAuthenticated={isAuthenticated}
              />
            )}

            {/* Call to Action for Guest Users */}
            {!isAuthenticated && (
              <section className="full-width-minimal spacing-section text-center">
                <div className="max-w-responsive mx-auto space-responsive-large">
                  <h2 className="heading-hero font-bold">
                    Ready to start watching?
                  </h2>
                  <p className="body-large text-muted-foreground">
                    Join millions of users streaming their favorite movies and TV shows on CineStream.
                  </p>
                  <div className="flex items-center justify-center gap-responsive-large">
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-full font-semibold text-lg transition-colors" asChild>
                      <Link href="/signup">Start Free Trial</Link>
                    </Button>
                    <Button className="border-2 border-border hover:bg-accent hover:text-accent-foreground px-10 py-4 rounded-full font-semibold text-lg transition-colors" asChild>
                      <Link href="/subscription">View Plans</Link>
                    </Button>
                  </div>
                </div>
              </section>
            )}
        </div>
      </main>

      <Footer />
    </div>
  );
}