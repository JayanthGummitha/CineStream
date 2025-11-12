'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createDetailUrl } from '@/lib/url-utils';
import { Movie, TVShow } from '@/types';

interface JustReleaseSectionProps {
    items: (Movie | TVShow)[];
    isAuthenticated: boolean;
}

export function JustReleaseSection({ items, isAuthenticated }: JustReleaseSectionProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 400;
            const newScrollLeft = scrollRef.current.scrollLeft +
                (direction === 'left' ? -scrollAmount : scrollAmount);

            scrollRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    if (!items || !Array.isArray(items) || items.length === 0) return null;

    return (
        <section className="w-full space-y-6">
            {/* Header with minimal padding on sides */}
            <div className="flex items-center justify-between full-width-minimal">
                <h2 className="heading-section text-white">Just Release</h2>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => scroll('left')}
                        className="h-10 w-10 p-0 bg-black/40 border-white/20 hover:bg-black/60 touch-target"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="h-5 w-5 text-white" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => scroll('right')}
                        className="h-10 w-10 p-0 bg-black/40 border-white/20 hover:bg-black/60 touch-target"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="h-5 w-5 text-white" />
                    </Button>
                </div>
            </div>

            {/* Horizontal Scrolling Carousel - Full width with minimal padding */}
            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 full-width-minimal"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="flex-shrink-0 carousel-card-width"
                    >
                        <JustReleaseCard
                            item={item}
                            isAuthenticated={isAuthenticated}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}

interface JustReleaseCardProps {
    item: Movie | TVShow;
    isAuthenticated: boolean;
}

function JustReleaseCard({ item }: JustReleaseCardProps) {
    const isMovie = !('seasons' in item);

    return (
        <Link href={isMovie ? createDetailUrl('movie', item.id, item.title) : createDetailUrl('tv', item.id, item.title)}>
            <div className="group relative w-full cursor-pointer transition-all duration-300 hover:scale-105">
                <div className="relative rounded-lg overflow-hidden bg-black">

                    {/* Main Poster */}
                    <div className="relative aspect-[3/4]">
                        <Image
                            src={item.thumbnail}
                            alt={item.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-all duration-300 group-hover:brightness-110"
                        />

                        {/* Dark overlay for better text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                        {/* Content Info at Bottom */}
                    </div>
                    {/* <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="heading-card text-white font-bold mb-2 leading-tight">
                                {item.title}
                            </h3>

                           
                        </div> */}
                </div>
            </div>
        </Link>
    );
}