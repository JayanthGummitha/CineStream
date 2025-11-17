'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/navigation/header';
import { Footer } from '@/components/navigation/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Play, Plus, Share, Download, Star, Clock, Calendar, ChevronLeft, ChevronRight, X, Tv } from 'lucide-react';
// Add the missing import for getTVShowWithSeasons
import { 
    getTVShowDetails, 
    getTVShowsByGenre, 
    getTVShowWithSeasons,
    TVShowFetchError,
    TVShowFetchErrorType,
    getUserFriendlyErrorMessage
} from '@/lib/movie-service';
import { createDetailUrl } from '@/lib/url-utils';
import { Movie, Season, Episode } from '@/types';
import Link from 'next/link';
import { VideoPlayer } from '@/components/VideoPlayer';
import {
    transformAllSeasonsToEpisodeData,
    type VideoPlayerEpisodeData
} from '@/utils/episode-transformation';
import { ErrorDisplay } from '@/components/ErrorDisplay';

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

    // Use DASH video source for better streaming
    const videoSrc = 'https://files.vidstack.io/sprite-fight/dash/stream.mpd';

    const isAuthenticated = false;
    const resolvedParams = use(params);

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
                                        <span className="text-white/80">{tvShow.duration}min episodes</span>
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

                                        <Link href={`/watch/${tvShow.id}?fullscreen=true&autoplay=true&trailer=true&type=tv`}>
                                            <Button size="sm" className="bg-white text-black hover:bg-white/90">
                                                <Play className="mr-2 h-5 w-5" />
                                                Watch Trailer
                                            </Button>
                                        </Link>

                                        {isAuthenticated && (
                                            <>
                                                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                                    <Plus className="mr-2 h-5 w-5" />
                                                    Add to List
                                                </Button>

                                                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                                    <Download className="mr-2 h-5 w-5" />
                                                    Download
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

                            {/* Episodes Section */}
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
                                                                    <span>{episode.duration}min</span>
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

                            {/* Top Cast Section */}
                            <div className="space-y-4 w-[98vw] ">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-white">Top Cast</h2>
                                    <div className="flex items-center space-x-2 ">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const container = document.getElementById('cast-carousel');
                                                if (container) {
                                                    container.scrollBy({ left: -400, behavior: 'smooth' });
                                                }
                                            }}
                                            className="h-8 w-8 p-0 bg-transparent border-white/20 hover:bg-white/10"
                                        >
                                            <ChevronLeft className="h-4 w-4 text-white" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const container = document.getElementById('cast-carousel');
                                                if (container) {
                                                    container.scrollBy({ left: 400, behavior: 'smooth' });
                                                }
                                            }}
                                            className="h-8 w-8 p-0 bg-transparent border-white/20 hover:bg-white/10"
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
                                        <div key={actor.id} className="flex-shrink-0 cursor-pointer group text-center">
                                            <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 ring-2 ring-transparent group-hover:ring-white/30 transition-all duration-300">
                                                <Image
                                                    src={actor.profileImage}
                                                    alt={actor.name}
                                                    fill
                                                    sizes="80px"
                                                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            </div>
                                            <div className="text-center max-w-[100px]">
                                                <p className="text-white font-semibold text-sm truncate mb-1">
                                                    {actor.name}
                                                </p>
                                                <p className="text-white/60 text-xs truncate">
                                                    {actor.character}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Right Column - Information Panel */}
                        <div className="space-y-6">

                            {/* TV Show Stats */}
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2 text-white/60">
                                    <Tv className="h-4 w-4" />
                                    <span className="text-sm">TV Show Info</span>
                                </div>
                                <div className="space-y-2 text-white">
                                    <div className="flex justify-between">
                                        <span className="text-white/70 text-sm">Seasons:</span>
                                        <span className="font-semibold">{totalSeasons}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/70 text-sm">Episodes:</span>
                                        <span className="font-semibold">{totalEpisodes}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/70 text-sm">Status:</span>
                                        <span className="font-semibold text-green-400">Ongoing</span>
                                    </div>
                                </div>
                            </div>

                            {/* First Air Date */}
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2 text-white/60">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-sm">First Air Date</span>
                                </div>
                                <div className="text-white font-semibold">
                                    {new Date(tvShow.releaseDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>

                            {/* Available Languages */}
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2 text-white/60">
                                    <span className="text-sm">🌐 Available Languages</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {tvShow.languages.map((language) => (
                                        <span
                                            key={language}
                                            className="bg-white/10 text-white/80 px-2 py-1 rounded text-xs border border-white/20"
                                        >
                                            {language}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Genres */}
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2 text-white/60">
                                    <span className="text-sm">🎭 Genres</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {tvShow.genres.map((genre) => (
                                        <span
                                            key={genre}
                                            className="bg-white/10 text-white/80 px-2 py-1 rounded text-xs border border-white/20"
                                        >
                                            {genre}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Creator */}
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2 text-white/60">
                                    <span className="text-sm">Creator</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">
                                            {tvShow.director.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-sm">{tvShow.director}</p>
                                        <p className="text-white/60 text-xs">Creator</p>
                                    </div>
                                </div>
                            </div>

                            {/* Episode Duration */}
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2 text-white/60">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-sm">Episode Duration</span>
                                </div>
                                <div className="text-white font-semibold">
                                    ~{tvShow.duration} minutes
                                </div>
                            </div>

                            {/* Content Rating */}
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2 text-white/60">
                                    <span className="text-sm">Content Rating</span>
                                </div>
                                <div className="text-white font-semibold">
                                    <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs border border-blue-400/30 font-semibold">
                                        {tvShow.contentRating}
                                    </span>
                                </div>
                            </div>

                        </div>
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