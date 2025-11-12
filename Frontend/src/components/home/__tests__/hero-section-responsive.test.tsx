import React from 'react';
import { render, screen } from '@testing-library/react';
import { HeroSection } from '../hero-section';

// Mock Next.js Image component
jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ src, alt, ...props }: any) => (
        <img src={src} alt={alt} {...props} />
    ),
}));

const mockMovies = [
    {
        id: '1',
        title: 'Test Movie 1',
        description: 'A test movie description that should be displayed in the hero section.',
        backdrop: '/test1-backdrop.jpg',
        thumbnail: '/test1-thumb.jpg',
        genres: ['Action', 'Adventure'],
        releaseDate: '2023-01-01',
        duration: 120,
        contentRating: 'PG-13',
        rating: 8.5,
        cast: [
            {
                id: '1',
                name: 'Actor 1',
                character: 'Hero',
                profileImage: '/actor1.jpg'
            },
            {
                id: '2',
                name: 'Actor 2',
                character: 'Villain',
                profileImage: '/actor2.jpg'
            }
        ],
        director: 'Test Director',
        writers: ['Writer 1'],
        languages: ['English'],
        subtitles: ['English', 'Spanish'],
        quality: ['HD', '4K'],
        isNew: true,
        isTrending: false,
    },
    {
        id: '2',
        title: 'Test Movie 2',
        description: 'Another test movie for carousel testing.',
        backdrop: '/test2-backdrop.jpg',
        thumbnail: '/test2-thumb.jpg',
        genres: ['Drama', 'Romance'],
        releaseDate: '2023-02-01',
        duration: 105,
        contentRating: 'R',
        rating: 7.8,
        cast: [
            {
                id: '3',
                name: 'Actor 3',
                character: 'Lead',
                profileImage: '/actor3.jpg'
            },
            {
                id: '4',
                name: 'Actor 4',
                character: 'Support',
                profileImage: '/actor4.jpg'
            }
        ],
        director: 'Test Director 2',
        writers: ['Writer 2'],
        languages: ['English'],
        subtitles: ['English', 'French'],
        quality: ['HD', '4K'],
        isNew: false,
        isTrending: true,
    },
];

describe('HeroSection - Responsive Design', () => {
    it('should use responsive hero height class', () => {
        const { container } = render(
            <HeroSection featuredContent={mockMovies} isAuthenticated={false} />
        );

        const heroSection = container.querySelector('section');
        expect(heroSection).toHaveClass('hero-height');
    });

    it('should use responsive container class', () => {
        const { container } = render(
            <HeroSection featuredContent={mockMovies} isAuthenticated={false} />
        );

        const containerDiv = container.querySelector('.responsive-container');
        expect(containerDiv).toBeInTheDocument();
    });

    it('should use responsive heading class for movie title', () => {
        render(<HeroSection featuredContent={mockMovies} isAuthenticated={false} />);

        const title = screen.getByText('TEST MOVIE 1');
        expect(title).toHaveClass('heading-hero');
    });

    it('should use responsive body text class for description', () => {
        const { container } = render(
            <HeroSection featuredContent={mockMovies} isAuthenticated={false} />
        );

        const description = container.querySelector('p');
        expect(description).toHaveClass('body-text');
    });

    it('should have responsive button classes', () => {
        const { container } = render(
            <HeroSection featuredContent={mockMovies} isAuthenticated={false} />
        );

        const watchButton = screen.getByText('Watch Now').closest('button');
        expect(watchButton).toHaveClass('button-responsive-large');
        expect(watchButton).toHaveClass('touch-target-large');

        const listButton = screen.getByText('My List').closest('button');
        expect(listButton).toHaveClass('button-responsive-large');
        expect(listButton).toHaveClass('touch-target-large');
    });

    it('should have responsive carousel positioning', () => {
        const { container } = render(
            <HeroSection featuredContent={mockMovies} isAuthenticated={false} />
        );

        // Check carousel container has responsive positioning classes
        const carouselContainer = container.querySelector('.absolute.bottom-4');
        expect(carouselContainer).toBeInTheDocument();
        expect(carouselContainer).toHaveClass('sm:bottom-6');
        expect(carouselContainer).toHaveClass('lg:bottom-12');
    });

    it('should have responsive carousel card sizes', () => {
        const { container } = render(
            <HeroSection featuredContent={mockMovies} isAuthenticated={false} />
        );

        // Check carousel cards have responsive sizing
        const carouselCards = container.querySelectorAll('.w-\\[70px\\]');
        expect(carouselCards.length).toBeGreaterThan(0);

        carouselCards.forEach(card => {
            expect(card).toHaveClass('sm:w-[80px]');
            expect(card).toHaveClass('lg:w-[100px]');
        });
    });

    it('should have responsive metadata layout', () => {
        const { container } = render(
            <HeroSection featuredContent={mockMovies} isAuthenticated={false} />
        );

        // Check metadata uses flex-wrap for responsive layout
        const metadataContainer = container.querySelector('.flex.flex-wrap.items-center');
        expect(metadataContainer).toBeInTheDocument();
    });

    it('should have responsive spacing between elements', () => {
        const { container } = render(
            <HeroSection featuredContent={mockMovies} isAuthenticated={false} />
        );

        // Check main content container has responsive spacing
        const contentContainer = container.querySelector('.space-responsive-large');
        expect(contentContainer).toBeInTheDocument();
    });

    it('should have responsive grid layout', () => {
        const { container } = render(
            <HeroSection featuredContent={mockMovies} isAuthenticated={false} />
        );

        // Check grid uses responsive columns
        const gridContainer = container.querySelector('.grid.grid-cols-1');
        expect(gridContainer).toHaveClass('lg:grid-cols-12');
    });

    it('should have touch targets for mobile devices', () => {
        const { container } = render(
            <HeroSection featuredContent={mockMovies} isAuthenticated={false} />
        );

        // Check carousel items have touch-target class
        const carouselItems = container.querySelectorAll('.touch-target');
        expect(carouselItems.length).toBeGreaterThan(0);
    });
});