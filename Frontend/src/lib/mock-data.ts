import { Movie, TVShow, Collection, User } from '@/types';

export const MOCK_MOVIES: Movie[] = [
  {
    id: '1',
    title: 'Quantum Nexus',
    description: 'In a world where quantum physics meets reality, a brilliant scientist discovers a way to manipulate time itself. But when the technology falls into the wrong hands, she must race against time to prevent a catastrophic paradox that could unravel the fabric of existence.',
    thumbnail: '/movie-poster-1.svg',
    backdrop: '/movie-backdrop-1.svg',
    trailer: '/movie-backdrop-1.svg',
    duration: 142,
    releaseDate: '2024-03-15',
    genres: ['Sci-Fi', 'Thriller', 'Action'],
    rating: 8.7,
    contentRating: 'PG-13',
    cast: [
      {
        id: '1',
        name: 'Emma Stone',
        character: 'Dr. Sarah Chen',
        profileImage: '/profile-placeholder.svg'
      },
      {
        id: '2',
        name: 'Oscar Isaac',
        character: 'Marcus Rivera',
        profileImage: '/profile-placeholder.svg'
      }
    ],
    director: 'Christopher Nolan',
    writers: ['Christopher Nolan', 'Jonathan Nolan'],
    languages: ['English', 'Spanish'],
    subtitles: ['English', 'Spanish', 'French', 'German'],
    quality: ['HD', '4K'],
    isNew: true,
    isTrending: true,
  },
  {
    id: '2',
    title: 'The Last Guardian',
    description: 'A post-apocalyptic tale of survival and hope, where the last remaining guardian of an ancient civilization must protect the final seed of humanity from those who would see the world burn.',
    thumbnail: '/movie-poster-2.svg',
    backdrop: '/movie-backdrop-1.svg',
    duration: 128,
    releaseDate: '2024-01-20',
    genres: ['Action', 'Drama', 'Adventure'],
    rating: 7.9,
    contentRating: 'R',
    cast: [
      {
        id: '3',
        name: 'Charlize Theron',
        character: 'Maya',
        profileImage: '/profile-placeholder.svg'
      }
    ],
    director: 'Denis Villeneuve',
    writers: ['Denis Villeneuve', 'Eric Heisserer'],
    languages: ['English'],
    subtitles: ['English', 'Spanish', 'French'],
    quality: ['HD', '4K'],
    isPopular: true,
  },
  {
    id: '3',
    title: 'Midnight in Tokyo',
    description: 'A noir thriller set in the neon-lit streets of Tokyo, following a detective who uncovers a conspiracy that reaches the highest levels of government.',
    thumbnail: '/movie-poster-3.svg',
    backdrop: '/movie-backdrop-1.svg',
    duration: 115,
    releaseDate: '2023-11-10',
    genres: ['Thriller', 'Crime', 'Mystery'],
    rating: 8.2,
    contentRating: 'R',
    cast: [
      {
        id: '4',
        name: 'John Cho',
        character: 'Detective Tanaka',
        profileImage: '/profile-placeholder.svg'
      }
    ],
    director: 'Park Chan-wook',
    writers: ['Park Chan-wook', 'Chung Seo-kyung'],
    languages: ['Japanese', 'English'],
    subtitles: ['English', 'Japanese', 'Korean'],
    quality: ['HD', '4K'],
    isTrending: true,
  }
];

export const MOCK_TV_SHOWS: TVShow[] = [
  {
    id: 'tv1',
    title: 'Stellar Horizons',
    description: 'A space exploration series following the crew of the starship Horizon as they venture into uncharted territories of the galaxy, discovering new worlds and facing unprecedented challenges.',
    thumbnail: '/movie-poster-1.svg',
    backdrop: '/movie-backdrop-1.svg',
    releaseDate: '2024-02-01',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    rating: 9.1,
    contentRating: 'TV-14',
    cast: [
      {
        id: '5',
        name: 'Zendaya',
        character: 'Captain Nova',
        profileImage: '/profile-placeholder.svg'
      }
    ],
    director: 'J.J. Abrams',
    writers: ['J.J. Abrams', 'Damon Lindelof'],
    languages: ['English'],
    subtitles: ['English', 'Spanish', 'French'],
    quality: ['HD', '4K'],
    totalSeasons: 2,
    status: 'ongoing',
    seasons: [
      {
        id: 's1',
        seasonNumber: 1,
        title: 'Season 1',
        releaseDate: '2024-02-01',
        thumbnail: '/movie-poster-1.svg',
        episodes: [
          {
            id: 'e1',
            title: 'First Contact',
            description: 'The crew encounters their first alien civilization.',
            episodeNumber: 1,
            duration: 45,
            thumbnail: '/movie-backdrop-1.svg',
            releaseDate: '2024-02-01',
            rating: 8.9
          }
        ]
      }
    ],
    isNew: true,
    isTrending: true,
  }
];

export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: 'trending',
    name: 'Trending Now',
    description: 'The hottest content everyone is watching',
    thumbnail: '/movie-poster-1.svg',
    backdrop: '/movie-backdrop-1.svg',
    items: MOCK_MOVIES.filter(movie => movie.isTrending),
    type: 'trending'
  },
  {
    id: 'new-releases',
    name: 'Recently Added',
    description: 'Fresh content just added to our library',
    thumbnail: '/movie-poster-2.svg',
    backdrop: '/movie-backdrop-1.svg',
    items: MOCK_MOVIES.filter(movie => movie.isNew),
    type: 'new'
  },
  {
    id: 'popular',
    name: 'Most Watched',
    description: 'The most popular content on CineStream',
    thumbnail: '/movie-poster-3.svg',
    backdrop: '/movie-backdrop-1.svg',
    items: MOCK_MOVIES.filter(movie => movie.isPopular),
    type: 'popular'
  }
];

export const MOCK_USER: User = {
  id: 'user1',
  email: 'john.doe@example.com',
  name: 'John Doe',
  avatar: '/profile-placeholder.svg',
  subscription: 'premium',
  profiles: [
    {
      id: 'profile1',
      name: 'John',
      avatar: '/profile-placeholder.svg',
      isKid: false,
      language: 'en',
      maturityRating: 'R'
    },
    {
      id: 'profile2',
      name: 'Kids',
      avatar: '/profile-placeholder.svg',
      isKid: true,
      language: 'en',
      maturityRating: 'PG'
    }
  ],
  watchHistory: [
    {
      contentId: '1',
      contentType: 'movie',
      watchedAt: '2024-03-10T20:30:00Z',
      progress: 75,
      completed: false
    }
  ],
  watchlist: ['2', '3'],
  preferences: {
    theme: 'dark',
    language: 'en',
    autoplay: true,
    subtitles: false,
    quality: 'auto',
    notifications: {
      newReleases: true,
      recommendations: true,
      watchReminders: false
    }
  },
  createdAt: '2024-01-01T00:00:00Z'
};