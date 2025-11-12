# 🎬 CineStream - Modern OTT Streaming Platform

A full-stack Netflix-style streaming platform built with Next.js 15, React 19, and TypeScript, featuring advanced video playback, watch progress tracking, and personalized user dashboards.

![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)

## ✨ Features

### 🎥 Advanced Video Player
- **Vidstack Integration** - Professional video player with MPEG-DASH streaming support
- **Adaptive Quality** - Automatic quality selection based on network conditions
- **Thumbnail Previews** - Hover over progress bar to see video thumbnails
- **Keyboard Shortcuts** - Full keyboard control (Space, Arrow keys, F, M, etc.)
- **Picture-in-Picture** - Watch while browsing other content
- **Fullscreen Support** - Immersive viewing experience

### 📊 Watch Progress Tracking
- **Auto-Resume** - Pick up exactly where you left off
- **Real-time Sync** - Progress saved every 10 seconds while watching
- **Continue Watching** - Carousel of in-progress content with progress bars
- **Smart Completion** - Auto-removes items at 95% completion
- **LocalStorage Persistence** - Data saved locally for instant access

### 👤 User Dashboard
- **Total Watch Time** - Track hours, minutes, and seconds watched
- **Favorites List** - Save and manage your favorite movies/shows
- **Watch Streaks** - Monitor your viewing consistency
- **Recent Activity** - See what you've watched recently

### 🎨 Modern UI/UX
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Dark Theme** - Eye-friendly dark interface
- **Smooth Animations** - Framer Motion powered transitions
- **shadcn/ui Components** - Beautiful, accessible UI components
- **Toast Notifications** - User-friendly feedback system

### 🔐 Authentication
- **Secure Login** - Credential-based authentication
- **Session Management** - Persistent user sessions
- **User-specific Data** - Isolated data per user account

## 🚀 Tech Stack

- **Framework:** Next.js 15.4.6 (App Router)
- **UI Library:** React 19.1.0
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Components:** shadcn/ui, Radix UI
- **Video Player:** Vidstack
- **Animations:** Framer Motion
- **Icons:** Lucide React, Tabler Icons
- **API:** TMDB (The Movie Database)
- **Forms:** React Hook Form + Zod
- **Testing:** Jest + Testing Library

## 📦 Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/cinestream.git
cd cinestream
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your TMDB API credentials:
```env
TMDB_API_KEY=your_api_key_here
TMDB_ACCESS_TOKEN=your_access_token_here
```

> Get your TMDB API key from: https://www.themoviedb.org/settings/api

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### First Time Setup
1. Create an account or login with demo credentials
2. Browse movies and TV shows from the home page
3. Click "Play Now" to start watching
4. Your progress will be automatically saved

### Watch Progress
- Progress is saved every 10 seconds while watching
- Resume from where you left off on any device
- View all in-progress content in "Continue Watching"
- Remove items by clicking the trash icon

### User Dashboard
- Access your dashboard from the user menu
- View total watch time and statistics
- Manage your favorites list
- Track your watch streak

## 📁 Project Structure

```
cinestream/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── movie/             # Movie detail pages
│   │   ├── watch/             # Video player page
│   │   ├── user/              # User dashboard
│   │   └── ...
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── home/             # Home page components
│   │   ├── VideoPlayer.tsx   # Main video player
│   │   └── ...
│   ├── hooks/                # Custom React hooks
│   │   ├── useWatchProgress.ts
│   │   ├── useAuth.ts
│   │   └── ...
│   ├── lib/                  # Utility functions
│   │   ├── movie-service.ts  # TMDB API integration
│   │   ├── auth.ts           # Authentication logic
│   │   └── ...
│   └── types/                # TypeScript type definitions
├── public/                   # Static assets
├── .env.local               # Environment variables (not in git)
├── .env.example             # Environment variables template
└── package.json             # Dependencies
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
```

## 🌟 Key Features Implementation

### Watch Progress Tracking
- Uses localStorage for client-side persistence
- Throttled saves (10-second intervals) for performance
- Automatic cleanup of completed items (>95%)
- Resume point detection (>30 seconds, <95%)

### Video Player
- Vidstack for professional playback
- MPEG-DASH streaming support
- Adaptive bitrate streaming
- Comprehensive keyboard shortcuts
- Custom UI controls

### User Dashboard
- Real-time statistics calculation
- Dynamic data visualization
- Responsive card layout
- Interactive components

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for the movie database API
- [Vidstack](https://www.vidstack.io/) for the video player
- [shadcn/ui](https://ui.shadcn.com/) for the UI components
- [Next.js](https://nextjs.org/) for the framework

## 📧 Contact

Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/cinestream](https://github.com/yourusername/cinestream)

---

Made with ❤️ using Next.js and React
