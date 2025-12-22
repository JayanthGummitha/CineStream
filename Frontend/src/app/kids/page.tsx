'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/navigation/header';
import { Footer } from '@/components/navigation/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MovieCarousel } from '@/components/ui/movie-carousel';
import { Search, Play, Plus, EllipsisVertical } from 'lucide-react';
import { createDetailUrl } from '@/lib/url-utils';
import { Movie } from '@/types';
import { getKidsContent } from '@/lib/movie-service';

// Kids specific categories
const KIDS_CATEGORIES = [
    { id: "featured", name: "Featured for Kids" },
    { id: "animated", name: "Animated Adventures" },
    { id: "family", name: "Family Favorites" },
    { id: "adventure", name: "Adventure Time" },
    { id: "educational", name: "Learn & Play" }
];

export default function KidsPage() {
    const isAuthenticated = true;
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedYear, setSelectedYear] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [categoryContent, setCategoryContent] = useState<{ [key: string]: Movie[] }>({});
    const [featuredKids, setFeaturedKids] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadKidsContent = async () => {
            try {
                setLoading(true);

                // Fetch kids specific content
                const kidsContent = await getKidsContent();

                setFeaturedKids(kidsContent.featured);
                setCategoryContent({
                    "Featured for Kids": kidsContent.featured,
                    "Animated Adventures": kidsContent.animated,
                    "Family Favorites": kidsContent.family,
                    "Adventure Time": kidsContent.adventure,
                    "Learn & Play": kidsContent.educational
                });
            } catch (error) {
                console.error('Error loading kids content:', error);
            } finally {
                setLoading(false);
            }
        };

        loadKidsContent();
    }, []);

    // Get all content from all categories for filtering
    const allContent = Object.values(categoryContent).flat();

    // Filter and sort content
    const filteredContent = allContent.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' ||
            KIDS_CATEGORIES.find(c => c.name === selectedCategory)?.id === selectedCategory;
        const matchesYear = selectedYear === 'all' ||
            new Date(item.releaseDate).getFullYear().toString() === selectedYear;

        return matchesSearch && matchesCategory && matchesYear;
    }).sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
            case 'oldest':
                return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
            case 'rating':
                return b.rating - a.rating;
            case 'title':
                return a.title.localeCompare(b.title);
            default:
                return 0;
        }
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header isAuthenticated={isAuthenticated} />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                        <p className="text-white/60">Loading kids content...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header isAuthenticated={isAuthenticated} />

            <main>
                {/* Hero Section with Featured Kids Content */}
                {featuredKids.length > 0 && (
                    <KidsHeroSection
                        featuredContent={featuredKids}
                        isAuthenticated={isAuthenticated}
                    />
                )}

                {/* Search and Filters */}
                <section className="full-width-minimal py-8 bg-background">
                    <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                        {/* Search Bar */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                            <Input
                                type="search"
                                placeholder="Search kids content, characters..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex items-center space-x-3">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent className="bg-black/90 border-white/20">
                                    <SelectItem value="all" className="text-white hover:bg-white/10">All Categories</SelectItem>
                                    {KIDS_CATEGORIES.map((category) => (
                                        <SelectItem key={category.id} value={category.id} className="text-white hover:bg-white/10">
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent className="bg-black/90 border-white/20">
                                    <SelectItem value="all" className="text-white hover:bg-white/10">All Years</SelectItem>
                                    <SelectItem value="2024" className="text-white hover:bg-white/10">2024</SelectItem>
                                    <SelectItem value="2023" className="text-white hover:bg-white/10">2023</SelectItem>
                                    <SelectItem value="2022" className="text-white hover:bg-white/10">2022</SelectItem>
                                    <SelectItem value="2021" className="text-white hover:bg-white/10">2021</SelectItem>
                                    <SelectItem value="2020" className="text-white hover:bg-white/10">2020</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-36 bg-white/10 border-white/20 text-white">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent className="bg-black/90 border-white/20">
                                    <SelectItem value="newest" className="text-white hover:bg-white/10">Newest</SelectItem>
                                    <SelectItem value="oldest" className="text-white hover:bg-white/10">Oldest</SelectItem>
                                    <SelectItem value="rating" className="text-white hover:bg-white/10">Rating</SelectItem>
                                    <SelectItem value="title" className="text-white hover:bg-white/10">Title A-Z</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Results Summary */}
                    <div className="mt-6">
                        <p className="text-white/70">
                            Showing {filteredContent.length} {filteredContent.length === 1 ? 'item' : 'items'}
                            {searchQuery && ` for "${searchQuery}"`}
                        </p>
                    </div>
                </section>

                {/* Category Sections - Full width with minimal padding */}
                <div className="w-full pb-12 space-y-12">
                    {KIDS_CATEGORIES.map((category) => {
                        // Get content for this category
                        const content = categoryContent[category.name] || [];

                        // Apply filters to category content
                        const filteredCategoryContent = content.filter(item => {
                            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
                            const matchesYear = selectedYear === 'all' ||
                                new Date(item.releaseDate).getFullYear().toString() === selectedYear;

                            return matchesSearch && matchesYear;
                        }).sort((a, b) => {
                            switch (sortBy) {
                                case 'newest':
                                    return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
                                case 'oldest':
                                    return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
                                case 'rating':
                                    return b.rating - a.rating;
                                case 'title':
                                    return a.title.localeCompare(b.title);
                                default:
                                    return 0;
                            }
                        });

                        // Skip if no content in this category or if category filter doesn't match
                        if (filteredCategoryContent.length === 0 ||
                            (selectedCategory !== 'all' && selectedCategory !== category.id)) {
                            return null;
                        }

                        return (
                            <KidsCategorySection
                                key={`${category.id}-${category.name}`}
                                category={category}
                                content={filteredCategoryContent}
                                isAuthenticated={isAuthenticated}
                            />
                        );
                    })}

                    {/* No Results State */}
                    {filteredContent.length === 0 && (
                        <div className="text-center py-16">
                            <div className="max-w-md mx-auto space-y-4">
                                <div className="w-24 h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center">
                                    <Search className="h-12 w-12 text-white/40" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">No kids content found</h3>
                                <p className="text-white/60">
                                    Try adjusting your search criteria or browse our featured collections.
                                </p>
                                <Button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedCategory('all');
                                        setSelectedYear('all');
                                        setSortBy('newest');
                                    }}
                                    className="bg-pink-600 hover:bg-pink-700 text-white"
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Call to Action for Guest Users */}
                    {!isAuthenticated && filteredContent.length > 0 && (
                        <section className="mt-16 py-16 text-center bg-gradient-to-br from-black/60 to-black/80 backdrop-blur-xl border border-white/10 rounded-2xl">
                            <div className="max-w-3xl mx-auto space-y-6 px-6">
                                <h2 className="text-3xl font-bold text-white">
                                    Safe & Fun Content for Kids
                                </h2>
                                <p className="text-lg text-white/80">
                                    Get unlimited access to our curated kids library with parental controls.
                                    Educational, entertaining, and completely safe for children.
                                </p>
                                <div className="flex items-center justify-center space-x-4">
                                    <Button size="lg" className="bg-pink-600 hover:bg-pink-700 text-white" asChild>
                                        <Link href="/signup">Start Free Trial</Link>
                                    </Button>
                                    <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
                                        <Link href="/subscription">View All Plans</Link>
                                    </Button>
                                </div>
                                <p className="text-sm text-white/60">
                                    14-day free trial • Cancel anytime • No commitments
                                </p>
                            </div>
                        </section>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

interface KidsHeroSectionProps {
    featuredContent: Movie[];
    isAuthenticated: boolean;
}

function KidsHeroSection({ featuredContent, isAuthenticated }: KidsHeroSectionProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentMovie = featuredContent[currentIndex];

    // Get sliding window of 3 movies starting from the next movie after current
    const getCarouselMovies = () => {
        const carouselMovies = [];
        const totalMovies = featuredContent.length;

        // Start from the next movie after current and get 3 movies
        for (let i = 1; i <= 3; i++) {
            const movieIndex = (currentIndex + i) % totalMovies;
            carouselMovies.push({
                movie: featuredContent[movieIndex],
                originalIndex: movieIndex
            });
        }

        return carouselMovies;
    };

    const carouselMovies = getCarouselMovies();

    // Auto-rotate featured content
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % featuredContent.length);
        }, 8000);

        return () => clearInterval(interval);
    }, [featuredContent.length]);

    if (!currentMovie) return null;

    return (
        <section className="relative h-screen w-full overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image
                    src={currentMovie.backdrop || currentMovie.thumbnail}
                    alt={currentMovie.title}
                    fill
                    sizes="100vw"
                    className="object-cover scale-105"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-black/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex h-full items-center">
                <div className="full-width-minimal">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full">
                        {/* Left Side - Movie Info */}
                        <div className="lg:col-span-8 xl:col-span-7">
                            <div className="max-w-3xl h-full flex flex-col justify-center space-y-8">
                                {/* Movie Title */}
                                <div>
                                    <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight tracking-wide mb-4">
                                        {currentMovie.title.toUpperCase()}
                                    </h1>

                                    {/* Movie Badges and Metadata */}
                                    <div className="flex items-center space-x-4 text-white/90">
                                        {/* Badges */}
                                        <div className="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white text-xs font-bold uppercase tracking-wider">
                                            Kids & Family
                                        </div>
                                        {currentMovie.isNew && (
                                            <div className="px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-white text-xs font-bold uppercase tracking-wider">
                                                New Release
                                            </div>
                                        )}
                                        <div className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs font-medium">
                                            {currentMovie.contentRating}
                                        </div>

                                        {/* Separator */}
                                        <span className="text-white/60">|</span>

                                        {/* Metadata */}
                                        <span className="text-sm font-medium">
                                            {currentMovie.genres.slice(0, 2).join(', ')}
                                        </span>
                                        <span className="text-white/60">|</span>
                                        <span className="text-sm font-medium">
                                            {new Date(currentMovie.releaseDate).getFullYear()}
                                        </span>
                                        <span className="text-white/60">|</span>
                                        <span className="text-sm font-medium">
                                            {currentMovie.duration ? `${Math.floor(currentMovie.duration / 60)}h ${currentMovie.duration % 60}m` : 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="max-w-2xl">
                                    <p className="text-white/90 text-base leading-relaxed line-clamp-2">
                                        {currentMovie.description}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center space-x-4">
                                    <Button
                                        size="lg"
                                        className="h-14 px-8 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-pink-500/25 transition-all duration-300"
                                    >
                                        <Play className="mr-3 h-6 w-6 fill-white" />
                                        {isAuthenticated ? 'Watch Now' : 'Watch Trailer'}
                                    </Button>

                                    {isAuthenticated && (
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="h-14 px-8 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white hover:bg-white/20 hover:border-white/30 font-semibold rounded-2xl transition-all duration-300"
                                        >
                                            <Plus className="mr-3 h-6 w-6" />
                                            My List
                                        </Button>
                                    )}

                                    <Button
                                        size="lg"
                                        variant="ghost"
                                        // className="h-14                                        // className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
                                        asChild
                                    >
                                        <Link href={createDetailUrl('kids', currentMovie.id, currentMovie.title)}>
                                            <EllipsisVertical />
                                      </Button>
                                </    </div>
                        </div>ide - Reserved space for carousel */}
                        <div className="hidden lg:block lg:col-span-4 xl:col-span-5">
                            {/* This space is reserved for the absolutely positioned movie carousel */}
                        </div>             </div>
                </div>
            </div>
       {/* Bottom Right - Movie Navigation Carousel */}
            <div className="absolute bottom-12 right-8 z-20">
                {/* Carousel Container */}
                <div clasame="rounded-3xl p-6">
                    {/* Carousel Movies */}
                    <div className="flex space-x-3">
                        {uselMovies.map(({ movie, originalIndex }, carouselIndex) => (
                            <div
                                key={movie.id}
                          className="group cursor-pointer transition-all duration-300 flex-shrink-0"
                                onClick={() => setCurrentIndex(originalIndex)}
                            >
                            <div className="relative w-[100px] h-[140px] rounded-2xl overflow-hidden border transition-all duration-300">
                                    {/* Movie Poster */}
                       s="100px"
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />

                                    {/* Next Indicator */}
                                    {carouselIndex === 0 && (
                                        <div className="absolute top-3 left-3">
                                            <div className="px-2 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[8px] font-bold rounded-full uppercase tracking-wider">
                                                Next
                                            </div>
                                        </div>
                                    )}

                                    {/* Play Icon on Hover */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl">
                                            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

interface KidsCategorySectionProps {
    category: { id: string; name: string };
    content: Movie[];
    isAuthenticated: boolean;
}

function KidsCategorySection({ category, content, isAuthenticated }: KidsCategorySectionProps) {
    return (
        <MovieCarousel
            title={category.name}
            movies={content}
            isAuthenticated={isAuthenticated}
            variant="default"
            showCount={true}
            contentType="kids"
        />
    );
}