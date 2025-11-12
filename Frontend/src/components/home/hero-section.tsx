'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { EllipsisVertical, Play, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Movie } from '@/types';
import { m } from 'framer-motion';
import Link from 'next/link';
import { createDetailUrl } from '@/lib/url-utils';

interface HeroSectionProps {
  featuredContent: Movie[];
  isAuthenticated?: boolean;
}

export function HeroSection({ featuredContent, isAuthenticated = false }: HeroSectionProps) {
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + featuredContent.length) % featuredContent.length);
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % featuredContent.length);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [featuredContent.length]);

  if (!currentMovie) return null;
  const videoSrc = 'https://media.axprod.net/TestVectors/v7-Clear/Manifest_1080p.mpd';

  return (
    // <section className="relative hero-height w-full bg-amber-400 overflow-hidden">

    //   <div className="absolute inset-0 ">
    //     <Image
    //       src={currentMovie.backdrop}
    //       alt={currentMovie.title}

    //       fill
    //       sizes="100"
    //       className="object-fill scale-105"
    //       priority
    //     />
    //     <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/40 lg:from-black/95 lg:via-black/60 lg:to-black/30" />
    //     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent lg:via-black/20" />
    //     <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent lg:from-black/40" />
    //   </div>

    //   <div className="relative z-10 flex h-full items-center">
    //     <div className="responsive-container">
    //       <div className="grid grid-cols-1 lg:grid-cols-12 gap-responsive-large w-full">
    //         <div className="lg:col-span-8 xl:col-span-7">
    //           <div className="max-w-3xl h-full flex flex-col  sm:justify-center space-responsive-large">

    //             <div className='bg-amber-300'>
    //               <h1 className="heading-hero text-white leading-tight tracking-wide mb-2 sm:mb-3 lg:mb-4">
    //                 {currentMovie.title.toUpperCase()}
    //               </h1>

    //               {/* Movie Badges and Metadata */}
    //               <div className="flex flex-wrap items-center gap-responsive text-white/90">
    //                 {/* Badges */}
    //                 {currentMovie.isNew && (
    //                   <div className="px-2 py-1 sm:px-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-white text-xs sm:text-xs font-bold uppercase tracking-wider">
    //                     New Release
    //                   </div>
    //                 )}
    //                 {currentMovie.isTrending && (
    //                   <div className="px-2 py-1 sm:px-3 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs sm:text-xs font-medium uppercase tracking-wider">
    //                     Trending
    //                   </div>
    //                 )}
    //                 <div className="px-2 py-1 sm:px-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs sm:text-xs font-medium">
    //                   {currentMovie.contentRating}
    //                 </div>

    //                 {/* Separator - Hidden on mobile */}
    //                 <span className="hidden sm:inline text-white/60">|</span>

    //                 {/* Metadata - Responsive layout */}
    //                 <div className="flex flex-wrap items-center gap-responsive-compact text-xs sm:text-sm font-medium">
    //                   <span>{currentMovie.genres.slice(0, 2).join(', ')}</span>
    //                   <span className="text-white/60">•</span>
    //                   <span>{new Date(currentMovie.releaseDate).getFullYear()}</span>
    //                   <span className="text-white/60">•</span>
    //                   <span>{Math.floor(currentMovie.duration / 60)}h {currentMovie.duration % 60}m</span>
    //                 </div>
    //               </div>
    //             </div>

    //             <div className="max-w-responsive-text">
    //               <p className="text-white/90 body-text leading-relaxed overflow-clamp-responsive overflow-text-responsive">
    //                 {currentMovie.description}
    //               </p>
    //             </div>



    //             <div className="flex flex-row sm:flex-row items-stretch sm:items-center gap-responsive">
    //               <Button
    //                 size="lg"
    //                 className="button-responsive-large bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-red-500/25 transition-all duration-300 touch-target-large"
    //               >
    //                 <Play className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 fill-white" />
    //                 Watch Now
    //               </Button>

    //               <div className="flex max-md:flex gap-responsive">
    //                 <Button
    //                   size="lg"
    //                   variant="outline"
    //                   className="button-responsive-large bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white hover:bg-white/20 hover:border-white/30 font-semibold rounded-2xl transition-all duration-300 touch-target-large flex-1 sm:flex-none"
    //                 >
    //                   <Plus className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
    //                   My List
    //                 </Button>

    //                 <Button
    //                   size="lg"
    //                   variant="ghost"
    //                   className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300 touch-target-large"
    //                 >
    //                   <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    //                   </svg>
    //                 </Button>
    //               </div>
    //             </div>


    //           </div>
    //         </div>

    //         <div className="hidden lg:block lg:col-span-4 xl:col-span-5">
    //         </div>
    //       </div>
    //     </div>
    //   </div>

    //   <div className="w-full max-lg:px-5 absolute flex justify-end bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 md:bottom-0 md:left-8 md:right-8 lg:bottom-0 lg:right-8 lg:left-auto z-20">
    //     <div className="rounded-2xl sm:rounded-3xl p-3 sm:p-4 lg:p-6">
    //       <div className="flex justify-center lg:justify-end gap-2 sm:gap-3 overflow-x-auto scrollbar-hide">
    //         {carouselMovies.map(({ movie, originalIndex }, carouselIndex) => (
    //           <div
    //             key={movie.id}
    //             className="group cursor-pointer transition-all duration-300 flex-shrink-0 touch-target"
    //             onClick={() => setCurrentIndex(originalIndex)}
    //           >
    //             <div className="relative w-[70px] h-[98px] sm:w-[80px] sm:h-[112px] md:w-[90px] md:h-[126px] lg:w-[100px] lg:h-[140px] rounded-xl sm:rounded-2xl overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-300">
    //               <Image
    //                 src={movie.thumbnail}
    //                 alt={movie.title}
    //                 fill
    //                 sizes="(max-width: 640px) 70px, (max-width: 768px) 80px, (max-width: 1024px) 90px, 100px"
    //                 className="object-cover group-hover:scale-105 transition-transform duration-300"
    //               />

    //               {carouselIndex === 0 && (
    //                 <div className="absolute top-1 left-1 sm:top-2 sm:left-2 lg:top-3 lg:left-3">
    //                   <div className="px-1 py-0.5 sm:px-2 sm:py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[6px] sm:text-[8px] font-bold rounded-full uppercase tracking-wider">
    //                     Next
    //                   </div>
    //                 </div>
    //               )}

    //               <div className="absolute inset-0  items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex">
    //                 <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
    //                   <Play className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white fill-white ml-0.5" />
    //                 </div>
    //               </div>

    //               <div className="absolute inset-0 bg-black/20 opacity-0 group-active:opacity-100 transition-opacity duration-150 sm:hidden" />
    //             </div>
    //           </div>
    //         ))}
    //       </div>
    //     </div>
    //   </div>

    //   {isAuthenticated && (
    //     <div className="absolute bottom-8 right-6 z-20">
    //       <div className="text-center text-white/60 text-sm">
    //         <div className="w-12 h-12 bg-white/20 rounded-full mx-auto mb-2 flex items-center justify-center">
    //           <span className="text-white font-semibold">TM</span>
    //         </div>
    //         <p>TANJIM MORSHED</p>
    //       </div>
    //     </div>
    //   )}
    // </section>
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
      <div className="relative px-2 z-10 flex h-full sm:items-center justify-end">
        <div className="full-width-minimal">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full">
            {/* Left Side - Show Info */}
            <div className="max-sm:h-70 lg:col-span-8 xl:col-span-7 max-sm:mt-26">
              <div className="max-w-3xl h-full flex flex-col justify-center  space-y-3 sm:space-y-8">
                {/* Show Title */}
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight tracking-wide mb-4">
                    {currentMovie.title.toUpperCase()}
                  </h1>


                  {/* Show Badges and Metadata */}
                  <div className="flex items-center space-x-4 text-white/90">
                    {/* Badges */}

                    {currentMovie.isNew && (
                      <div className="px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-white text-xs font-bold uppercase tracking-wider">
                        New Release
                      </div>
                    )}
                    {currentMovie.isTrending && (
                      <div className="px-3 py-1 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs font-medium uppercase tracking-wider">
                        Trending
                      </div>
                    )}
                    <div className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs font-medium">
                      {currentMovie.contentRating}
                    </div>

                    {/* Separator */}
                    <span className="text-white/60">|</span>

                    {/* Metadata */}
                    <span className="text-sm font-medium flex">
                      {currentMovie.genres.slice(0, 2).join(', ')}
                    </span>
                    <span className="text-white/60">|</span>
                    <span className="text-sm font-medium">
                      {new Date(currentMovie.releaseDate).getFullYear()}
                    </span>
                    <span className="text-white/60">|</span>
                    <span className="text-sm font-medium">
                      {Math.floor(currentMovie.duration / 60)}h {currentMovie.duration % 60}m
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
                <div className="flex items-center space-x-2">
                  
                  <Link
                    href={`/watch/${currentMovie.id}?fullscreen=true&autoplay=true&title=${encodeURIComponent(currentMovie.title)}&src=${videoSrc}`}
                  >
                    <Button size="lg"
                      className="h-12 p-3 gap-2  flex items-center  text-auto text-white font-semibold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
                    >
                      <Play className="h-5 w-5" fill='white' />
                      {isAuthenticated ? 'Play Now' : 'Watch Trailer'}

                    </Button>
                  </Link>

                  {isAuthenticated && (
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-14  bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white  hover:bg-white/20 hover:border-white/30 font-semibold rounded-2xl transition-all duration-300"
                    >
                      <Plus className=" h-6 w-6" />
                      {/* My List */}
                    </Button>
                  )}


                  <Button
                    size="lg"
                    variant="ghost"
                    className="h-14 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white hover:bg-white/20 hover:border-white/30 font-semibold rounded-2xl transition-all duration-300"

                  // className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300 touch-target-large"
                  >
                    <Link href={createDetailUrl('movie', currentMovie.id, currentMovie.title)}>
                      <EllipsisVertical />
                    </Link>
                  </Button>

                </div>
              </div>
            </div>

            {/* Right Side - Reserved space for carousel */}
            <div className="hidden lg:block lg:col-span-4 xl:col-span-5">
              {/* This space is reserved for the absolutely positioned show carousel */}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Right - Show Navigation Carousel */}
      <div className="absolute  flex  bottom-0 right-1 z-20">
        {/* Carousel Container */}
        <div className="rounded-3xl py-2 pr-2">
          {/* Carousel Shows */}
          <div className="flex space-x-3">
            {carouselMovies.map(({ movie, originalIndex }, carouselIndex) => (
              <div
                key={movie.id}
                className="group cursor-pointer transition-all duration-300 flex-shrink-0"
                onClick={() => setCurrentIndex(originalIndex)}
              >
                <div className="relative w-[100px] h-[140px] rounded-2xl overflow-hidden border transition-all duration-300">
                  {/* Show Poster */}
                  <Image
                    src={movie.thumbnail}
                    alt={movie.title}
                    fill
                    sizes="100px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Next Indicator */}
                  {carouselIndex === 0 && (
                    <div className="absolute top-3 left-3">
                      <div className="px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[8px] font-bold rounded-full uppercase tracking-wider">
                        Next
                      </div>
                    </div>
                  )}

                  {/* Play Icon on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl">
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