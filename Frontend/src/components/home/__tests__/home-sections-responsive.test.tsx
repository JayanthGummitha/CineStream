import { render, screen } from '@testing-library/react';
import { PopularWeekSection } from '../popular-week-section';
import { JustReleaseSection } from '../just-release-section';
import { YourLikesSection } from '../your-likes-section';
import { Movie } from '@/types';

// Mock Next.js components
jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock movie service
jest.mock('@/lib/url-utils', () => ({
    createDetailUrl: (type: string, id: string, title: string) => `/${type}/${id}/${title}`,
}));

const mockMovies: Movie[] = [
    {
        id: '1',
        title: 'Test Movie 1',
        thumbnail: '/test1.jpg',
        backdrop: '/test1-backdrop.jpg',
        description: 'Test description 1',
        genres: ['Action', 'Adventure'],
        rating: 8.5,
        releaseDate: '2024-01-01',
        duration: 120,
        contentRating: 'PG-13',
        cast: [
            {
                id: 'cast1',
                name: 'Test Actor 1',
                character: 'Hero',
                profileImage: '/actor1.jpg'
            }
        ],
        director: 'Test Director 1',
        writers: ['Test Writer 1'],
        languages: ['English'],
        subtitles: ['English', 'Spanish'],
        quality: ['HD', '4K'],
        isNew: true,
        isTrending: false,
        isPopular: true,
    },
    {
        id: '2',
        title: 'Test Movie 2',
        thumbnail: '/test2.jpg',
        backdrop: '/test2-backdrop.jpg',
        description: 'Test description 2',
        genres: ['Comedy', 'Drama'],
        rating: 7.8,
        releaseDate: '2024-02-01',
        duration: 105,
        contentRating: 'R',
        cast: [
            {
                id: 'cast2',
                name: 'Test Actor 2',
                character: 'Protagonist',
                profileImage: '/actor2.jpg'
            }
        ],
        director: 'Test Director 2',
        writers: ['Test Writer 2'],
        languages: ['English'],
        subtitles: ['English'],
        quality: ['HD'],
        isNew: false,
        isTrending: true,
        isPopular: false,
    },
];

describe('Home Sections - Responsive Design', () => {


    describe('PopularWeekSection', () => {
        it('should use full-width responsive design with fixed card widths', () => {
            const { container } = render(
                <PopularWeekSection items={mockMovies} isAuthenticated={true} />
            );

            // Check section has full width
            const section = container.querySelector('section');
            expect(section).toHaveClass('w-full', 'space-y-6');

            // Check header has full-width-minimal class
            const header = container.querySelector('.flex.items-center.justify-between');
            expect(header).toHaveClass('full-width-minimal');

            // Check carousel container has full-width-minimal class and smaller gap for fixed widths
            const carousel = container.querySelector('.overflow-x-auto');
            expect(carousel).toHaveClass('full-width-minimal', 'gap-4');

            // Check cards use fixed widths for mobile/sm, calculated widths for md+
            const cards = container.querySelectorAll('.w-80');
            expect(cards.length).toBeGreaterThan(0);
            cards.forEach(card => {
                // Check that the card has appropriate width classes
                expect(card).toHaveClass('flex-shrink-0');
                expect(card).toHaveClass('w-80'); // mobile
                expect(card).toHaveClass('sm:w-96'); // small
                // Check for calculated width classes for md and above (4 cards per slide)
                const className = card.className;
                expect(className).toMatch(/md:w-\[calc\(\(100vw-1vw-3rem\)\/4\)\]/); // md: 4 cards
                expect(className).toMatch(/lg:w-\[calc\(\(100vw-1vw-3rem\)\/4\)\]/); // lg: 4 cards
                expect(className).toMatch(/xl:w-\[calc\(\(100vw-1vw-3rem\)\/4\)\]/); // xl: 4 cards
            });
        });

        it('should use responsive heading class', () => {
            render(<PopularWeekSection items={mockMovies} isAuthenticated={true} />);

            const heading = screen.getByText('Popular of the week');
            expect(heading).toHaveClass('heading-section');
        });
    });

    describe('JustReleaseSection', () => {
        it('should use full-width responsive design', () => {
            const { container } = render(
                <JustReleaseSection items={mockMovies} isAuthenticated={true} />
            );

            // Check section has full width
            const section = container.querySelector('section');
            expect(section).toHaveClass('w-full', 'space-y-6');

            // Check header has full-width-minimal class
            const header = container.querySelector('.flex.items-center.justify-between');
            expect(header).toHaveClass('full-width-minimal');

            // Check carousel container has full-width-minimal class
            const carousel = container.querySelector('.overflow-x-auto');
            expect(carousel).toHaveClass('full-width-minimal', 'gap-6');
        });

        it('should use responsive heading class', () => {
            render(<JustReleaseSection items={mockMovies} isAuthenticated={true} />);

            const heading = screen.getByText('Just Release');
            expect(heading).toHaveClass('heading-section');
        });
    });

    describe('YourLikesSection', () => {
        it('should use full-width responsive design', () => {
            const { container } = render(
                <YourLikesSection items={mockMovies} isAuthenticated={true} />
            );

            // Check section has full width
            const section = container.querySelector('section');
            expect(section).toHaveClass('w-full', 'space-y-6');

            // Check header has full-width-minimal class
            const header = container.querySelector('.flex.items-center.justify-between');
            expect(header).toHaveClass('full-width-minimal');

            // Check carousel container has full-width-minimal class
            const carousel = container.querySelector('.overflow-x-auto');
            expect(carousel).toHaveClass('full-width-minimal', 'gap-6');
        });

        it('should use responsive heading class', () => {
            render(<YourLikesSection items={mockMovies} isAuthenticated={true} />);

            const heading = screen.getByText('Your Likes');
            expect(heading).toHaveClass('heading-section');
        });
    });

    describe('Responsive Consistency', () => {
        it('should have consistent spacing across all sections', () => {
            const sections = [
                { component: <PopularWeekSection key="popular" items={mockMovies} isAuthenticated={true} />, gap: 'gap-4' },
                { component: <JustReleaseSection key="release" items={mockMovies} isAuthenticated={true} />, gap: 'gap-6' },
                { component: <YourLikesSection key="likes" items={mockMovies} isAuthenticated={true} />, gap: 'gap-6' },
            ];

            sections.forEach(({ component, gap }) => {
                const { container } = render(component);

                // All sections should have consistent spacing
                const sectionElement = container.querySelector('section');
                expect(sectionElement).toHaveClass('w-full', 'space-y-6');

                // Carousels should have appropriate gap for their design
                const carousel = container.querySelector('.overflow-x-auto');
                expect(carousel).toHaveClass(gap);
            });
        });

        it('should have consistent button styling in PopularWeekSection', () => {
            render(<PopularWeekSection items={mockMovies} isAuthenticated={true} />);

            const leftButton = screen.getByLabelText('Scroll left');
            const rightButton = screen.getByLabelText('Scroll right');

            // Check consistent button classes
            expect(leftButton).toHaveClass('h-10', 'w-10', 'bg-black/40', 'border-white/20', 'hover:bg-black/60', 'touch-target');
            expect(rightButton).toHaveClass('h-10', 'w-10', 'bg-black/40', 'border-white/20', 'hover:bg-black/60', 'touch-target');
        });
    });
});