# Library Utilities Documentation

This directory contains utility functions, services, and shared logic for the CineStream application.

## Related Documentation

- **Custom Hooks**: See [src/hooks/README.md](../hooks/README.md) for React hooks including `useMotionPreference`
- **Components**: See component-specific documentation for UI components and video player features

## Episode Metadata System (`episode-metadata.ts`)

The episode metadata system provides comprehensive functionality for managing episode and movie metadata, including intro timings and next episode logic with enhanced error handling and validation.

### Key Features

- **Input Validation**: All functions validate input parameters and handle invalid data gracefully
- **Comprehensive Error Handling**: Try-catch blocks with detailed error logging
- **Detailed Logging**: Consistent logging format with 🎬 emoji for easy filtering
- **Type Safety**: Full TypeScript interfaces for all metadata structures
- **Mock Data Store**: Complete development dataset with 5 episodes and 3 movies
- **Async Simulation**: Realistic API behavior with configurable delays

### TypeScript Interfaces

#### EpisodeMetadata
```typescript
interface EpisodeMetadata {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  src: string;
  introStart: number;
  introEnd: number;
  duration: number;
  seriesId: string;
  seasonNumber: number;
  episodeNumber: number;
}
```

#### MovieMetadata
```typescript
interface MovieMetadata {
  id: string;
  title: string;
  introStart: number;
  introEnd: number;
  duration: number;
  src: string;
  thumbnail: string;
  description: string;
}
```

### API Functions

#### `getEpisodeMetadata(episodeId: string): Promise<EpisodeMetadata | null>`

Retrieves episode metadata by episode ID with comprehensive validation and error handling.

**Features:**
- Input validation for episode ID (string type and non-empty)
- Detailed success/failure logging
- Graceful error handling with null return on failure
- Async delay simulation for realistic API behavior

**Usage:**
```typescript
import { getEpisodeMetadata } from '@/lib/episode-metadata';

const episode = await getEpisodeMetadata('episode-1');
if (episode) {
  console.log('Episode loaded:', episode.title);
  // Use episode.introStart and episode.introEnd for skip intro functionality
} else {
  console.log('Episode not found or error occurred');
}
```

**Error Handling:**
- Returns `null` for invalid input (non-string or empty episodeId)
- Returns `null` for episodes not found in mock data
- Returns `null` and logs error for any exceptions during processing
- Provides detailed console logging for debugging

#### `getNextEpisode(currentEpisodeId: string): Promise<EpisodeMetadata | null>`

Retrieves the next episode in sequence for a given episode with validation and error handling.

**Features:**
- Input validation for current episode ID
- Episode sequence validation
- Comprehensive error logging
- Handles missing next episode gracefully

**Usage:**
```typescript
import { getNextEpisode } from '@/lib/episode-metadata';

const nextEpisode = await getNextEpisode('episode-1');
if (nextEpisode) {
  console.log('Next episode:', nextEpisode.title);
  // Show next episode overlay or auto-play functionality
} else {
  console.log('No next episode available (season finale or error)');
}
```

**Episode Sequence:**
- `episode-1` → `episode-2`
- `episode-2` → `episode-3`
- `episode-3` → `episode-4`
- `episode-4` → `episode-5`
- `episode-5` → `null` (season finale)

#### `getMovieMetadata(movieId: string): Promise<MovieMetadata | null>`

Retrieves movie metadata by movie ID with validation and error handling.

**Features:**
- Input validation for movie ID
- Detailed logging for success and failure cases
- Graceful error handling
- Default intro timing support (0-90 seconds)

**Usage:**
```typescript
import { getMovieMetadata } from '@/lib/episode-metadata';

const movie = await getMovieMetadata('movie-1');
if (movie) {
  console.log('Movie loaded:', movie.title);
  // Use movie.introStart and movie.introEnd for skip intro functionality
} else {
  console.log('Movie not found or error occurred');
}
```

#### `getSeriesEpisodes(seriesId: string): Promise<EpisodeMetadata[]>`

Retrieves all episodes for a series, sorted by season and episode number.

**Features:**
- Input validation for series ID
- Automatic sorting by season and episode number
- Returns empty array on error (never throws)
- Detailed logging of results

**Usage:**
```typescript
import { getSeriesEpisodes } from '@/lib/episode-metadata';

const episodes = await getSeriesEpisodes('series-1');
console.log(`Found ${episodes.length} episodes`);
episodes.forEach(episode => {
  console.log(`S${episode.seasonNumber}E${episode.episodeNumber}: ${episode.title}`);
});
```

#### `getIntroTiming(contentId: string, contentType: 'episode' | 'movie'): Promise<{start: number; end: number} | null>`

Helper function to get intro timing for any content type with validation.

**Features:**
- Input validation for both content ID and content type
- Supports both episodes and movies
- Detailed logging of intro timing
- Type-safe content type validation

**Usage:**
```typescript
import { getIntroTiming } from '@/lib/episode-metadata';

// For episodes
const episodeIntro = await getIntroTiming('episode-1', 'episode');
if (episodeIntro) {
  console.log(`Episode intro: ${episodeIntro.start}s - ${episodeIntro.end}s`);
}

// For movies
const movieIntro = await getIntroTiming('movie-1', 'movie');
if (movieIntro) {
  console.log(`Movie intro: ${movieIntro.start}s - ${movieIntro.end}s`);
}
```

### Mock Data

The system includes comprehensive mock data for development and testing:

#### Episodes (5 episodes in series-1)
- **episode-1**: "Pilot Episode" (45s intro, 45min duration)
- **episode-2**: "The Discovery" (42s intro, 44min duration)
- **episode-3**: "Revelations" (38s intro, 43min duration)
- **episode-4**: "The Alliance" (40s intro, 46min duration)
- **episode-5**: "Season Finale" (50s intro, 55min duration)

#### Movies (3 movies)
- **movie-1**: "The Epic Adventure" (90s intro, 2h duration)
- **movie-2**: "Mystery of the Lost City" (85s intro, 1h55m duration)
- **movie-3**: "Future Worlds" (95s intro, 2h15m duration)

### Error Handling Strategy

The episode metadata system implements comprehensive error handling:

#### Input Validation
- All functions validate input parameters before processing
- Type checking ensures parameters are strings and non-empty
- Content type validation for `getIntroTiming` function

#### Error Logging
- Consistent logging format with 🎬 emoji for easy filtering
- Different log levels: `console.log` for info, `console.warn` for warnings, `console.error` for errors
- Detailed context in error messages for debugging

#### Graceful Degradation
- Functions return `null` or empty arrays instead of throwing exceptions
- Detailed logging helps identify issues without breaking application flow
- Async delay simulation can be configured for different testing scenarios

#### Example Error Scenarios
```typescript
// Invalid input handling
await getEpisodeMetadata(''); // Returns null, logs warning
await getEpisodeMetadata(null); // Returns null, logs warning
await getNextEpisode(123); // Returns null, logs warning

// Missing data handling
await getEpisodeMetadata('nonexistent-episode'); // Returns null, logs info
await getMovieMetadata('invalid-movie'); // Returns null, logs info

// Content type validation
await getIntroTiming('episode-1', 'invalid-type'); // Returns null, logs warning
```

### Integration with Video Player

The episode metadata system integrates seamlessly with the VideoPlayer component:

```typescript
// In VideoPlayer component
useEffect(() => {
  const loadContentMetadata = async () => {
    if (contentType === 'episode') {
      const episodeData = await getEpisodeMetadata(contentId);
      if (episodeData) {
        setIntroData({
          start: episodeData.introStart,
          end: episodeData.introEnd
        });
      } else {
        // Disable intro skip for episodes without metadata
        setIntroData(null);
      }
    } else if (contentType === 'movie') {
      const movieData = await getMovieMetadata(contentId);
      if (movieData) {
        setIntroData({
          start: movieData.introStart,
          end: movieData.introEnd
        });
      } else {
        // Use default intro timing for movies
        setIntroData({ start: 0, end: 90 });
      }
    }
  };

  loadContentMetadata();
}, [contentId, contentType]);
```

### Testing ✅ COMPREHENSIVE COVERAGE

The episode metadata system includes comprehensive test coverage with Jest and React Testing Library. The test suite is located at `src/lib/__tests__/episode-metadata.test.ts` and covers:

#### Test Categories

**1. Function Testing**
- All API functions (`getEpisodeMetadata`, `getNextEpisode`, `getMovieMetadata`, `getSeriesEpisodes`, `getIntroTiming`)
- Success scenarios with valid data
- Error scenarios with invalid inputs
- Edge cases and boundary conditions

**2. Input Validation Testing**
- Empty string parameters
- Null and undefined inputs
- Wrong data types (numbers instead of strings)
- Invalid content types for `getIntroTiming`

**3. Error Handling Testing**
- Graceful error handling verification
- Console logging validation (info, warn, error levels)
- Exception handling with simulated errors
- Network failure simulation

**4. Performance Testing**
- Concurrent request handling
- Memory management validation
- Async operation timing
- No memory leaks with repeated calls

**5. Data Consistency Testing**
- Data structure validation across all episodes and movies
- Logical intro timing validation (start < end, positive values)
- Episode sequence consistency
- Type safety verification

#### Example Test Cases

```typescript
// Successful data retrieval
it('should return episode metadata for valid episode ID', async () => {
  const result = await getEpisodeMetadata('episode-1');
  expect(result?.id).toBe('episode-1');
  expect(result?.title).toBe('Pilot Episode');
  expect(result?.introStart).toBe(0);
  expect(result?.introEnd).toBe(45);
});

// Input validation
it('should handle invalid input parameters', async () => {
  const result = await getEpisodeMetadata('');
  expect(result).toBeNull();
  expect(mockConsoleWarn).toHaveBeenCalledWith(
    '🎬 Invalid episode ID provided:', ''
  );
});

// Error handling
it('should handle errors gracefully', async () => {
  // Simulate error condition
  const result = await getEpisodeMetadata('episode-1');
  expect(result).toBeNull();
  expect(mockConsoleError).toHaveBeenCalledWith(
    '🎬 Error loading episode metadata:', expect.any(Error)
  );
});

// Performance testing
it('should handle concurrent requests without interference', async () => {
  const promises = Array(10).fill(null).map(() => getEpisodeMetadata('episode-1'));
  const results = await Promise.all(promises);
  results.forEach(result => {
    expect(result?.id).toBe('episode-1');
  });
});

// Data consistency
it('should maintain consistent data structure across all episodes', async () => {
  const episode = await getEpisodeMetadata('episode-1');
  expect(typeof episode?.id).toBe('string');
  expect(typeof episode?.title).toBe('string');
  expect(typeof episode?.introStart).toBe('number');
  expect(episode!.introStart).toBeLessThan(episode!.introEnd);
});
```

#### Running Tests

```bash
# Run all episode metadata tests
npm test -- episode-metadata

# Run tests in watch mode
npm run test:watch -- episode-metadata

# Run with coverage
npm test -- --coverage episode-metadata
```

**Enhanced Testing Features:**
- **CSS Module Support**: Components importing CSS files test seamlessly with `identity-obj-proxy`
- **Path Aliases**: Full support for `@/*` imports in test files
- **Mock Data**: Comprehensive episode and movie data for consistent testing
- **Error Simulation**: Easy testing of error scenarios and edge cases
- **Timer Mocking**: Proper async delay testing with Jest fake timers
- **Console Mocking**: Verification of logging behavior and error messages

### Future Enhancements

The system is designed to be easily extended for future requirements:

- **Real API Integration**: Replace mock data with actual API calls
- **Caching**: Add caching layer for improved performance
- **Retry Logic**: Enhanced retry mechanisms for network failures
- **Batch Loading**: Support for loading multiple episodes at once
- **User Preferences**: Integration with user viewing history and preferences
