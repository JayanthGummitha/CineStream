'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/navigation/header';
import { Footer } from '@/components/navigation/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Play, Plus, Share, Download, Star, Clock, Calendar, ChevronLeft, ChevronRight, X, Tv, Heart, Save } from 'lucide-react';
// Add the missing import for getTVShowWithSeasons
import {
    getTVShowDetails,
    getTVShowsByGenre,
    getTVShowWithSeasons,
    getTVShowTrailer,
    TVShowFetchError,
    TVShowFetchErrorType,
    getUserFriendlyErrorMessage
} from '@/lib/movie-service';
import { TrailerButton } from '@/components/TrailerButton';
import { createDetailUrl } from '@/lib/url-utils';
import { Movie, Season, Episode } from '@/types';
import Link from 'next/link';
import { VideoPlayer } from '@/components/VideoPlayer';
import {
    transformAllSeasonsToEpisodeData,
    type VideoPlayerEpisodeData
} from '@/utils/episode-transformation';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { useLikes } from '@/hooks/useLikes';
import { useMyList } from '@/hooks/useMyList';
import { useParentalControls } from '@/hooks/useParentalControls';
import { ContentRestrictionOverlay } from '@/components/parental/ContentRestrictionOverlay';
import { ContentAccessResult } from '@/lib/parental-controls';

interface TVShowDetailPageProps {
    params: Promise<{
        id: string;
        slug: string;
    }>;
}

export default function TVShowDetailPage({ params }: TVShowDetailPageProps) {
    const [tvShow, setTVShow] = useState<Movie | null>(null);
    const [relatedShows, setRelatedShows] = useState<Movie[]>([]);
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [selectedSeason, setSelectedSeason] = useState<number>(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [errorType, setErrorType] = useState<TVShowFetchErrorType | null>(null);
    const [isPlayerOpen, setIsPlayerOpen] = useState(false);
    const [showAllEpisodes, setShowAllEpisodes] = useState<{ [key: number]: boolean }>({});

    // Episode navigation state
    const [episodeData, setEpisodeData] = useState<VideoPlayerEpisodeData | null>(null);
    const [currentEpisodeId, setCurrentEpisodeId] = useState<string | null>(null);

    // Trailer state
    const [trailerState, setTrailerState] = useState<{
        trailerSrc: string | null;
        isLoading: boolean;
        hasError: boolean;
    }>({
        trailerSrc: null,
        isLoading: false,
        hasError: false
    });

    // Use DASH video source for better streaming
    const videoSrc = 'https://files.vidstack.io/sprite-fight/dash/stream.mpd';

    const isAuthenticated = true;
    const resolvedParams = use(params);

    const { isLiked, toggleLike } = useLikes();
    const { isInList, toggleList } = useMyList();
    const { canAccessContent, setPinVerified } = useParentalControls();
    const [contentAccess, setContentAccess] = useState<ContentAccessResult>({ allowed: true });

    // Fetch TV show data with comprehensive error handling
    const fetchTVShowData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            setErrorType(null);

            // Use getTVShowWithSeasons which now has built-in fallback to getTVShowDetails + mock seasons
            const { tvShow: showData, seasons: realSeasons } = await getTVShowWithSeasons(resolvedParams.id);

            if (!showData) {
                console.error('[TV Show Page] No TV show data returned');
                setError('TV show not found. It may have been removed.');
                setErrorType(TVShowFetchErrorType.NOT_FOUND);
                notFound();
                return;
            }

            console.log(`[TV Show Page] Successfully loaded TV show: ${showData.title}`);
            console.log(`[TV Show Page] Loaded ${realSeasons.length} seasons with ${realSeasons.reduce((sum, s) => sum + s.episodes.length, 0)} total episodes`);

            setTVShow(showData);
            setSeasons(realSeasons);

            // Check parental controls access (including genre-based blocking)
            const accessResult = canAccessContent(showData.id, showData.contentRating || 'TV-MA', showData.genres);
            setContentAccess(accessResult);

            // Fetch trailer asynchronously (non-blocking)
            setTrailerState(prev => ({ ...prev, isLoading: true, hasError: false }));
            getTVShowTrailer(resolvedParams.id)
                .then(trailerUrl => {
                    setTrailerState({
                        trailerSrc: trailerUrl,
                        isLoading: false,
                        hasError: trailerUrl === null
                    });
                    if (trailerUrl) {
                        console.log(`[TV Show Page] Trailer loaded: ${trailerUrl}`);
                    }
                })
                .catch(err => {
                    console.error('[TV Show Page] Failed to load trailer:', err);
                    setTrailerState({
                        trailerSrc: null,
                        isLoading: false,
                        hasError: true
                    });
                });

            // Get related TV shows based on the first genre
            if (showData.genres.length > 0) {
                try {
                    const related = await getTVShowsByGenre(showData.genres[0]);
                    const filtered = related.filter(s => s.id !== showData.id).slice(0, 10);
                    setRelatedShows(filtered);
                    console.log(`[TV Show Page] Loaded ${filtered.length} related shows`);
                } catch (relatedError) {
                    console.warn('[TV Show Page] Failed to load related shows, continuing without them:', relatedError);
                    // Don't fail the entire page if related shows fail
                    setRelatedShows([]);
                }
            }
        } catch (error) {
            console.error('[TV Show Page] Failed to load TV show data:', error);

            // Handle TVShowFetchError with typed error classification
            if (error instanceof TVShowFetchError) {
                setErrorType(error.type);
                setError(getUserFriendlyErrorMessage(error.type));

                // Redirect to 404 page for not found errors
                if (error.type === TVShowFetchErrorType.NOT_FOUND) {
                    notFound();
                }
            } else if (error instanceof Error) {
                // Fallback for non-TVShowFetchError errors
                setError(error.message || 'Failed to load TV show. Please try again.');
                setErrorType(TVShowFetchErrorType.UNKNOWN);
            } else {
                setError('Failed to load TV show. Please try again.');
                setErrorType(TVShowFetchErrorType.UNKNOWN);
            }
        } finally {
            setLoading(false);
        }
    }, [resolvedParams.id]);

    // SINGLE useEffect - remove the duplicate one
    useEffect(() => {
        fetchTVShowData();
    }, [fetchTVShowData]);

    // Transform seasons data to episode data for VideoPlayer when seasons change
    useEffect(() => {
        if (seasons.length > 0) {

            // Use all seasons for cross-season navigation
            const transformedData = transformAllSeasonsToEpisodeData(seasons, currentEpisodeId || undefined);

            if (transformedData) {
                setEpisodeData(transformedData);

            } else {
                console.warn('🎬 Failed to transform seasons to episode data');
                setEpisodeData(null);
            }
        } else {
            setEpisodeData(null);
        }
    }, [seasons, currentEpisodeId]);

    // Episode change handler to update page state when episodes change in VideoPlayer
    const handleEpisodeChange = useCallback((newEpisodeData: { id: string; title: string }) => {

        if (newEpisodeData && newEpisodeData.id) {
            // Update current episode ID
            setCurrentEpisodeId(newEpisodeData.id);

            // Find which season this episode belongs to and update selected season if needed
            const episodeSeason = seasons.find(season =>
                season.episodes.some(episode => episode.id === newEpisodeData.id)
            );

            if (episodeSeason && episodeSeason.seasonNumber !== selectedSeason) {
                setSelectedSeason(episodeSeason.seasonNumber);
            }

            // Update episode data to reflect the new current episode
            if (episodeData) {
                const newEpisodeIndex = episodeData.episodes.findIndex(ep => ep.id === newEpisodeData.id);
                if (newEpisodeIndex !== -1) {
                    const updatedEpisodeData = {
                        ...episodeData,
                        currentEpisodeIndex: newEpisodeIndex,
                        seasonNumber: episodeSeason?.seasonNumber || episodeData.seasonNumber
                    };
                    setEpisodeData(updatedEpisodeData);
                }
            }
        }
    }, [seasons, selectedSeason, episodeData]);

    // Keep your existing mock generation functions for fallback
    const generateTVShowSeasons = (show: Movie): Season[] => {
        const numSeasons = Math.floor(Math.random() * 4) + 1;
        const seasons: Season[] = [];
        const usedTitles = new Set<string>(); // Prevent duplicates

        for (let s = 1; s <= numSeasons; s++) {
            const episodes: Episode[] = [];
            const numEpisodes = Math.floor(Math.random() * 6) + 8;

            for (let e = 1; e <= numEpisodes; e++) {
                let episodeTitle;
                do {
                    episodeTitle = generateEpisodeTitle();
                } while (usedTitles.has(`s${s}-${episodeTitle}`));

                usedTitles.add(`s${s}-${episodeTitle}`);

                episodes.push({
                    id: `${show.id}-s${s}-e${e}`,
                    title: `Episode ${e}: ${episodeTitle}`,
                    description: `In this episode of ${show.title}, ${generateEpisodeDescription()}`,
                    episodeNumber: e,
                    duration: Math.floor(Math.random() * 20) + 40,
                    thumbnail: show.backdrop,
                    releaseDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
                    rating: Math.floor(Math.random() * 30) + 70
                });
            }

            seasons.push({
                id: `${show.id}-season-${s}`,
                seasonNumber: s,
                title: `Season ${s}`,
                episodes,
                releaseDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
                thumbnail: show.thumbnail
            });
        }

        return seasons;
    };

    const generateEpisodeTitle = (): string => {
        const titles = [
            'The Beginning', 'New Allies', 'The Hunt', 'Revelations', 'The Plan',
            'Betrayal', 'The Truth', 'Final Stand', 'Consequences', 'The End',
            'Pilot', 'The Discovery', 'Breaking Point', 'Crossroads', 'Aftermath',
            'Rising Action', 'The Confrontation', 'Secrets Revealed', 'The Chase', 'Resolution'
        ];
        return titles[Math.floor(Math.random() * titles.length)];
    };

    const generateEpisodeDescription = (): string => {
        const descriptions = [
            'relationships are tested as new challenges emerge.',
            'characters face difficult decisions that will change everything.',
            'the investigation takes an unexpected turn.',
            'secrets from the past come to light.',
            'alliances are formed and broken.',
            'the stakes get higher as danger approaches.',
            'new mysteries unfold in this thrilling episode.',
            'characters must confront their deepest fears.',
            'unexpected revelations change the game.',
            'the story takes a dramatic turn.'
        ];
        return descriptions[Math.floor(Math.random() * descriptions.length)];
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header isAuthenticated={isAuthenticated} />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600/30 border-t-blue-600 mx-auto mb-4"></div>
                            <Tv className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
                        </div>
                        <p className="text-white text-lg font-medium mb-2">Loading TV Show</p>
                        <p className="text-white/60 text-sm">Fetching episodes and details...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Display error state if there's an error
    if (error && !tvShow) {
        // Determine if retry should be shown based on error type
        const shouldShowRetry = errorType !== TVShowFetchErrorType.NOT_FOUND &&
            errorType !== TVShowFetchErrorType.INVALID_ID;

        return (
            <div className="min-h-screen bg-background">
                <Header isAuthenticated={isAuthenticated} />
                <div className="flex items-center justify-center min-h-screen">
                    <ErrorDisplay
                        title="Unable to Load TV Show"
                        message={error}
                        onRetry={fetchTVShowData}
                        showRetry={shouldShowRetry}
                        backLink="/tv-shows"
                        backLinkText="Back to TV Shows"
                    />
                </div>
                <Footer />
            </div>
        );
    }

    if (!tvShow) {
        notFound();
    }

    const currentSeason = seasons.find(s => s.seasonNumber === selectedSeason) || seasons[0];
    const totalSeasons = seasons.length;
    const totalEpisodes = seasons.reduce((total, season) => total + season.episodes.length, 0);

    // Handle PIN verification for restricted content
    const handlePinVerified = () => {
        setPinVerified(true);
        setContentAccess({ allowed: true });
    };

    // Show restriction overlay if content is not accessible
    if (!contentAccess.allowed && tvShow) {
        return (
            <div className="min-h-screen bg-background">
                <Header isAuthenticated={isAuthenticated} />
                <ContentRestrictionOverlay
                    accessResult={contentAccess}
                    contentTitle={tvShow.title}
                    onPinVerified={handlePinVerified}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header isAuthenticated={isAuthenticated} />

            <main>
                {/* Hero Section */}
                <section className="relative h-screen w-full overflow-hidden">
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <Image
                            src={tvShow.backdrop}
                            alt={tvShow.title}
                            fill
                            sizes="100vw"
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex h-full items-center">
                        <div className="container max-w-screen-2xl px-4">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                                {/* TV Show Poster */}
                                <div className="hidden lg:block">
                                    <div className="relative aspect-[2/3] w-48 mx-auto">
                                        <Image
                                            src={tvShow.thumbnail}
                                            alt={tvShow.title}
                                            fill
                                            sizes="192px"
                                            className="object-cover rounded-lg shadow-2xl"
                                        />
                                    </div>
                                </div>

                                {/* TV Show Info */}
                                <div className="lg:col-span-2 space-y-6 text-white">
                                    {/* Title */}
                                    <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                                        {tvShow.title}
                                    </h1>

                                    {/* TV Show Badges and Metadata */}
                                    <div className="flex flex-wrap items-center gap-3 text-sm">
                                        <div className="flex items-center space-x-1">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span className="text-yellow-400 font-semibold">{tvShow.rating}/10</span>
                                        </div>
                                        <span className="text-white/70">•</span>
                                        <span className="text-white/80">{new Date(tvShow.releaseDate).getFullYear()}</span>
                                        <span className="text-white/70">•</span>
                                        <Badge variant="outline" className="border-white/20 text-white bg-white/10 text-xs">
                                            {tvShow.contentRating}
                                        </Badge>
                                        <span className="text-white/70">•</span>
                                        <span className="text-white/80">{tvShow.duration || 45}min episodes</span>
                                        <span className="text-white/70">•</span>
                                        <Badge className="bg-blue-600 text-xs">
                                            <Tv className="h-3 w-3 mr-1" />
                                            TV Series
                                        </Badge>
                                        <span className="text-white/70">•</span>
                                        <span className="text-white/70">{totalSeasons} Season{totalSeasons > 1 ? 's' : ''}</span>
                                        <span className="text-white/70">•</span>
                                        <span className="text-white/70">{tvShow.genres.slice(0, 2).join(' • ')}</span>
                                    </div>

                                    {/* Description */}
                                    <p className="text-lg text-white/90 leading-relaxed max-w-3xl">
                                        {tvShow.description}
                                    </p>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap items-center gap-4">
                                        {(isAuthenticated || true) && (
                                            <Link
                                                href={`/watch/${tvShow.id}?fullscreen=true&autoplay=true&title=${encodeURIComponent(tvShow.title)}&src=${videoSrc}&type=tv&season=${selectedSeason}${currentEpisodeId ? `&episode=${currentEpisodeId}` : ''}`}
                                            >
                                                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                                                    <Play className="mr-2 h-5 w-5" />
                                                    Play Now
                                                </Button>
                                            </Link>
                                        )}

                                        <TrailerButton
                                            trailerSrc={trailerState.trailerSrc}
                                            isLoading={trailerState.isLoading}
                                            hasError={trailerState.hasError}
                                            movieId={tvShow.id}
                                            movieTitle={tvShow.title}
                                            size="sm"
                                        />

                                        {isAuthenticated && tvShow && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => toggleList({ ...tvShow, contentType: 'tv-shows' })}
                                                    className={`border-white/20 text-white hover:bg-white/10 transition-all ${isInList(tvShow.id) ? 'text-white' : ''}`}
                                                >
                                                    {isInList(tvShow.id) ? (
                                                        <>
                                                            <Save className="mr-2 h-5 w-5" />
                                                            <span className="text-white">Saved</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className="mr-2 h-5 w-5" />
                                                            Add to list
                                                        </>
                                                    )}
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => toggleLike({ ...tvShow, contentType: 'tv-shows' })}
                                                    className={`border-white/20 text-white hover:bg-white/10 transition-all ${isLiked(tvShow.id) ? 'text-white' : ''}`}
                                                >
                                                    {isLiked(tvShow.id) ? (
                                                        <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                                                    ) : (
                                                        <Heart className="h-5 w-5" />
                                                    )}
                                                </Button>
                                            </>
                                        )}

                                        <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                            <Share className="mr-2 h-5 w-5" />
                                            Share
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Content Sections */}
                <section className="container max-w-screen-2xl px-4 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column - Episodes and Cast */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Storyline Section */}
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border  hover:border-white/20 transition-colors">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2  rounded-lg">
                                        <svg className="w-5 h-5 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                        </svg>
                                    </div>
                                    <h2 className="text-lg font-bold text-white">Story Line</h2>
                                </div>
                                <p className="text-white/80 leading-relaxed text-sm">
                                    {tvShow.description}
                                </p>
                            </div>


                            {/* Top Cast Section */}
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-colors">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-lg font-bold text-white">Top Cast</h2>
                                        <span className="text-white/40 text-sm">({tvShow.cast.length} actors)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                const container = document.getElementById('cast-carousel');
                                                if (container) {
                                                    container.scrollBy({ left: -300, behavior: 'smooth' });
                                                }
                                            }}
                                            className="h-9 w-9 p-0 rounded-full bg-white/10 hover:bg-white/20 border-0"
                                        >
                                            <ChevronLeft className="h-4 w-4 text-white" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                const container = document.getElementById('cast-carousel');
                                                if (container) {
                                                    container.scrollBy({ left: 300, behavior: 'smooth' });
                                                }
                                            }}
                                            className="h-9 w-9 p-0 rounded-full bg-white/10 hover:bg-white/20 border-0"
                                        >
                                            <ChevronRight className="h-4 w-4 text-white" />
                                        </Button>
                                    </div>
                                </div>
                                <div
                                    id="cast-carousel"
                                    className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                >
                                    {tvShow.cast.map((actor) => (
                                        <div key={actor.id} className="flex-shrink-0 group cursor-pointer">
                                            <div className="bg-gradient-to-b from-white/10 to-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 w-[140px]">
                                                <div className="relative w-20 h-20 mx-auto mb-3">
                                                    <div className="relative w-full h-full rounded-full overflow-hidden ring-2 ring-white/20 transition-all duration-300">
                                                        <Image
                                                            src={actor.profileImage}
                                                            alt={actor.name}
                                                            fill
                                                            sizes="80px"
                                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-white font-semibold text-sm truncate mb-1">
                                                        {actor.name}
                                                    </p>
                                                    <p className="text-white/50 text-xs truncate">
                                                        as {actor.character}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Right Column - Information Panel */}
                        <div className="space-y-4">
                            {/* TV Show Details Card */}
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                                {/* Card Header */}
                                <div className="px-5 py-4 border-b border-white/10 bg-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg">
                                            <Tv className="w-4 h-4 text-white" />
                                        </div>
                                        <h3 className="text-white font-semibold">TV Show Details</h3>
                                    </div>
                                </div>

                                {/* Card Content */}
                                <div className="p-5 space-y-4">
                                    {/* Seasons */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-white/60">
                                            <Tv className="h-4 w-4" />
                                            <span className="text-sm">Seasons</span>
                                        </div>
                                        <span className="text-white font-medium text-sm">{totalSeasons}</span>
                                    </div>

                                    <div className="h-px bg-white/10" />

                                    {/* Episodes */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-white/60">
                                            <Play className="h-4 w-4" />
                                            <span className="text-sm">Total Episodes</span>
                                        </div>
                                        <span className="text-white font-medium text-sm">{totalEpisodes}</span>
                                    </div>

                                    <div className="h-px bg-white/10" />

                                    {/* Status */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-white/60">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm">Status</span>
                                        </div>
                                        <span className="text-green-400 font-medium text-sm">Ongoing</span>
                                    </div>

                                    <div className="h-px bg-white/10" />

                                    {/* First Air Date */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-white/60">
                                            <Calendar className="h-4 w-4" />
                                            <span className="text-sm">First Aired</span>
                                        </div>
                                        <span className="text-white font-medium text-sm">
                                            {new Date(tvShow.releaseDate).getFullYear()}
                                        </span>
                                    </div>

                                    <div className="h-px bg-white/10" />

                                    {/* Episode Duration */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-white/60">
                                            <Clock className="h-4 w-4" />
                                            <span className="text-sm">Episode Length</span>
                                        </div>
                                        <span className="text-white font-medium text-sm">~{tvShow.duration || 45}min</span>
                                    </div>

                                    <div className="h-px bg-white/10" />

                                    {/* Content Rating */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-white/60">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                            <span className="text-sm">Rating</span>
                                        </div>
                                        <span className="border-2 border-white/10 text-white px-2.5 py-1 rounded-md text-xs font-semibold">
                                            {tvShow.contentRating}
                                        </span>
                                    </div>

                                    <div className="h-px bg-white/10" />

                                    {/* Languages */}
                                    <div>
                                        <div className="flex items-center gap-2 text-white/60 mb-3">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                            </svg>
                                            <span className="text-sm">Languages</span>
                                            <span className="text-white/40 text-xs ml-auto">{tvShow.languages.length} available</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {tvShow.languages.map((language) => (
                                                <span
                                                    key={language}
                                                    className="text-white px-3 py-1.5 rounded-lg text-xs font-medium border-2 border-white/10"
                                                >
                                                    {language}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="h-px bg-white/10" />

                                    {/* Genres */}
                                    <div>
                                        <div className="flex items-center gap-2 text-white/60 mb-3">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                            <span className="text-sm">Genres</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {tvShow.genres.map((genre) => (
                                                <span
                                                    key={genre}
                                                    className="text-white px-3 py-1.5 rounded-lg text-xs font-medium border-2 border-white/10"
                                                >
                                                    {genre}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="h-px bg-white/10" />

                                    {/* Creator */}
                                    <div>
                                        <div className="flex items-center gap-2 text-white/60 mb-3">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-sm">Creator</span>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-white font-bold text-sm">
                                                    {tvShow.director.charAt(0)}
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-white font-medium text-sm truncate">{tvShow.director}</p>
                                                <p className="text-white/50 text-xs">Creator</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Episodes Section - Full Width */}
                    <div className="mt-8">
                        {seasons.length > 0 && (
                                <div className="space-y-6">
                                    {/* Show info banner if we have partial data or mock data */}
                                    {seasons.length > 0 && seasons[0].episodes.length > 0 && (
                                        seasons[0].episodes[0].description.includes('In this episode of') ? (
                                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start space-x-3">
                                                <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <div className="flex-1">
                                                    <p className="text-yellow-200 text-sm font-medium">Preview Episodes</p>
                                                    <p className="text-yellow-200/80 text-xs mt-1">
                                                        Some episode details may be limited. Full episode information will be available soon.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : null
                                    )}

                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-semibold text-white">Episodes</h2>
                                        {seasons.length > 1 && (
                                            <div className="flex items-center space-x-2">
                                                <select
                                                    value={selectedSeason}
                                                    onChange={(e) => {
                                                        const newSeason = Number(e.target.value);
                                                        setSelectedSeason(newSeason);
                                                        // Reset show all episodes when changing seasons
                                                        setShowAllEpisodes(prev => ({
                                                            ...prev,
                                                            [newSeason]: false
                                                        }));
                                                    }}
                                                    className="bg-white/10 border border-white/20 text-white rounded px-3 py-1 text-sm"
                                                >
                                                    {seasons.map((season) => (
                                                        <option key={season.id} value={season.seasonNumber} className="bg-black text-white">
                                                            Season {season.seasonNumber}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    {currentSeason && (
                                        <div className="space-y-4">
                                            <div className="text-white/70 text-sm">
                                                Total  {currentSeason.episodes.length} Episodes
                                            </div>
                                            <div className="space-y-3">
                                                {/* Show either first 6 episodes or all episodes based on state */}
                                                {(showAllEpisodes[selectedSeason]
                                                    ? currentSeason.episodes
                                                    : currentSeason.episodes.slice(0, 6)
                                                ).map((episode, index) => (
                                                    <Link
                                                        key={`${episode.id}-${index}`}
                                                        href={`/watch/${tvShow.id}?fullscreen=true&autoplay=true&title=${encodeURIComponent(episode.title)}&src=${videoSrc}&type=tv&season=${selectedSeason}&episode=${episode.id}`}
                                                        className="block"
                                                    >
                                                        <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group">
                                                            <div className="text-white/60 font-mono text-sm min-w-[2rem]">
                                                                {episode.episodeNumber.toString().padStart(2, '0')}
                                                            </div>
                                                            <div className="relative w-32 h-18 rounded overflow-hidden flex-shrink-0">
                                                                <Image
                                                                    src={episode.thumbnail}
                                                                    alt={episode.title}
                                                                    fill
                                                                    sizes="128px"
                                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                                />
                                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                                                                    <Play className="h-6 w-6 text-white" />
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="text-white font-semibold text-sm mb-1 truncate">
                                                                    {episode.title}
                                                                </h3>
                                                                <p className="text-white/70 text-xs line-clamp-2 mb-2">
                                                                    {episode.description}
                                                                </p>
                                                                <div className="flex items-center space-x-3 text-xs text-white/60">
                                                                    <span>{episode.duration || 45}min</span>
                                                                    <span>•</span>
                                                                    <div className="flex items-center space-x-1">
                                                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                                        <span>{((episode.rating || 80) / 10).toFixed(1)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}

                                                {/* Show All Episodes button with functionality */}
                                                {currentSeason.episodes.length > 6 && (
                                                    <div className="text-center">
                                                        <Button
                                                            variant="outline"
                                                            className="border-white/20 text-white hover:bg-white/10"
                                                            onClick={() => {
                                                                setShowAllEpisodes(prev => ({
                                                                    ...prev,
                                                                    [selectedSeason]: !prev[selectedSeason]
                                                                }));
                                                            }}
                                                        >
                                                            {showAllEpisodes[selectedSeason]
                                                                ? `Show Less Episodes`
                                                                : `Show All ${currentSeason.episodes.length} Episodes`
                                                            }
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                    </div>

                    {/* Similar TV Shows Section */}
                    {relatedShows.length > 0 && (
                        <div className="space-y-6 mt-12">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-white">Similar TV Shows for you</h2>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const container = document.getElementById('similar-carousel');
                                            if (container) {
                                                container.scrollBy({ left: -400, behavior: 'smooth' });
                                            }
                                        }}
                                        className="h-8 w-8 p-0 bg-transparent border-white/20 hover:bg-white/10 opacity-70 hover:opacity-100"
                                    >
                                        <ChevronLeft className="h-4 w-4 text-white" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const container = document.getElementById('similar-carousel');
                                            if (container) {
                                                container.scrollBy({ left: 400, behavior: 'smooth' });
                                            }
                                        }}
                                        className="h-8 w-8 p-0 bg-transparent border-white/20 hover:bg-white/10 opacity-70 hover:opacity-100"
                                    >
                                        <ChevronRight className="h-4 w-4 text-white" />
                                    </Button>
                                </div>
                            </div>

                            <div
                                id="similar-carousel"
                                className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {relatedShows.map((relatedShow) => (
                                    <Link key={relatedShow.id} href={createDetailUrl('tv-shows', relatedShow.id, relatedShow.title)}>
                                        <div className="group flex-shrink-0 w-80 cursor-pointer transition-all duration-300 hover:scale-105">
                                            <div className="relative rounded-lg overflow-hidden bg-black mb-3">
                                                <div className="relative aspect-video">
                                                    <Image
                                                        src={relatedShow.backdrop || relatedShow.thumbnail}
                                                        alt={relatedShow.title}
                                                        fill
                                                        className="object-cover transition-all duration-300 group-hover:brightness-110"
                                                    />
                                                    <div className="absolute top-3 right-3">
                                                        <Badge className="bg-blue-600 text-xs">
                                                            <Tv className="h-3 w-3 mr-1" />
                                                            TV
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h3 className="text-white font-bold text-lg leading-tight">
                                                    {relatedShow.title}
                                                </h3>

                                                <div className="flex items-center space-x-2">
                                                    <div className="flex items-center space-x-1">
                                                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                                        <span className="text-yellow-400 font-semibold text-sm">{relatedShow.rating}</span>
                                                    </div>
                                                    <span className="text-white/70">|</span>
                                                    <span className="text-white/70 text-sm">
                                                        {relatedShow.genres.slice(0, 2).join(' • ')} • TV Series
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </main>

            <Footer />

            {/* Video Player - Hidden until triggered */}
            {isPlayerOpen && tvShow && (
                <div className="fixed inset-0 z-[9999] bg-black">
                    <VideoPlayer
                        src={videoSrc}
                        poster={tvShow.backdrop}
                        title={tvShow.title}
                        seriesName={tvShow.title}
                        className="w-full h-full"
                        contentType="episode"
                        contentId="episode-1" // Start with episode 1 to ensure skip intro appears
                        seriesId="series-1"
                        nextEpisodeTriggerTime={30} // Show next episode overlay 30 seconds before end (for easier testing)
                        onPlayingChange={(playing) => {
                        }}
                        onTimeUpdate={(currentTime, duration) => {
                        }}
                        onEpisodeChange={(episodeData) => {
                            // You could update the URL or other state here
                        }}
                    />

                    {/* Close button */}
                    <button
                        onClick={() => setIsPlayerOpen(false)}
                        className="absolute top-4 right-4 z-[10000] text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
            )}
        </div>
    );
}