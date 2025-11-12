# Watch Page URL Parameters

The watch page now supports URL parameters for automatic fullscreen and autoplay functionality.

## Supported Parameters

### `fullscreen`

- **Type**: `string`
- **Values**: `"true"` | `"false"` | undefined
- **Default**: `false`
- **Description**: When set to `"true"`, the video player will automatically enter fullscreen mode when the video is ready to play.

### `autoplay`

- **Type**: `string`
- **Values**: `"true"` | `"false"` | undefined
- **Default**: `true` (defaults to true unless explicitly set to `"false"`)
- **Description**: When set to `"true"` or undefined, the video will automatically start playing when ready. Only `"false"` disables autoplay.

### `trailer`

- **Type**: `string`
- **Values**: `"true"` | `"false"` | undefined
- **Default**: `false`
- **Description**: Indicates if the video being played is a trailer (for future functionality).

### `type`

- **Type**: `string`
- **Values**: `"tv"` | `"movie"` | undefined
- **Default**: `"movie"`
- **Description**: Specifies the content type to enable appropriate features. When set to `"tv"`, enables TV show-specific features like Skip Intro and Next Episode buttons.

### `title`

- **Type**: `string`
- **Values**: Any URL-encoded string
- **Default**: `"Untitled Movie"`
- **Description**: Sets the title displayed in the video player interface. Should be URL-encoded when passed in URLs.

### `src`

- **Type**: `string`
- **Values**: Valid video URL (HTTP/HTTPS)
- **Default**: `""` (empty string)
- **Description**: Specifies the video source URL to be played. Must be a valid video URL accessible by the browser.

### `type`

- **Type**: `string`
- **Values**: `"tv"` | `"movie"` | undefined
- **Default**: `"movie"`
- **Description**: Specifies the content type to enable appropriate features. When set to `"tv"`, enables TV show-specific functionality including Netflix-like features (Skip Intro, Next Episode auto-play), episode metadata, and series context. Automatically converts to `contentType="episode"` for the VideoPlayer component.

## Example URLs

### Auto-fullscreen only

```
/watch/123?fullscreen=true
```

### Disable auto-play

```
/watch/123?autoplay=false
```

### Both auto-fullscreen and auto-play with custom title

```
/watch/123?fullscreen=true&autoplay=true&title=My%20Movie
```

### Complete example with all parameters

```
/watch/123?fullscreen=true&autoplay=true&trailer=true&title=Movie%20Title&src=https://example.com/video.mp4
```

### TV Show example (from TV show detail pages)

```
/watch/456?fullscreen=true&autoplay=true&title=Show%20Name&type=tv&src=https://files.vidstack.io/sprite-fight/1080p.mp4
```

### Link-based Navigation from TV Show Pages

TV show detail pages now use Next.js Link components for optimal navigation:

```tsx
<Link
  href={`/watch/${tvShow.id}?fullscreen=true&autoplay=true&title=${encodeURIComponent(tvShow.title)}&src=${videoSrc}&type=tv`}
>
  <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
    <Play className="mr-2 h-5 w-5" />
    Play Now
  </Button>
</Link>
```

### TV Show Detail Page Integration

TV show detail pages now use Link-based navigation to the watch page for optimal performance and SEO:

```tsx
// Link-based navigation in TV show detail page
<Link
  href={`/watch/${tvShow.id}?fullscreen=true&autoplay=true&title=${encodeURIComponent(tvShow.title)}&src=${videoSrc}&type=tv`}
>
  <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
    <Play className="mr-2 h-5 w-5" />
    Play Now
  </Button>
</Link>
```

This navigation approach provides:
- **Performance Optimization**: Next.js Link prefetching for faster navigation
- **SEO Benefits**: Proper URL structure for search engine indexing
- **Parameter Integration**: Comprehensive URL parameter passing for playback configuration
- **Shareable Links**: Users can share direct links with specific playback settings
- **Type-Aware Features**: `type=tv` parameter enables TV show-specific functionality in the watch page

Once on the watch page, the VideoPlayer automatically provides:
- **Skip Intro Button**: Automatically appears during episode intro sequences
- **Next Episode Auto-Play**: Seamless transitions between episodes with smart overlay timing
- **Smart Overlay Timing**: Next episode overlay appears 2 minutes before episode ends (configurable)
- **Episode Metadata**: Dynamic intro timing and episode information
- **Binge-Watching Experience**: Continuous viewing with Netflix-like features

## Implementation Details

1. **Parameter Parsing**: The watch page uses Next.js `searchParams` to extract URL parameters
2. **Validation**: Only `"true"` string values are treated as true, all other values default to false
3. **Props Flow**: Parameters are passed from WatchPage → Video → VideoPlayerClient components
4. **Error Handling**: If auto-fullscreen or auto-play fails (due to browser policies), the video will still load and be available for manual interaction
5. **Graceful Degradation**: The functionality degrades gracefully if browsers block automatic actions
6. **Component Architecture**: The Video component acts as a wrapper that manages video state and passes props to VideoPlayerClient for rendering
7. **Advanced Integration Management**: Dynamic overlay coordination, z-index management, and user preference persistence across episodes

## Netflix-like Features ✅ COMPLETED

The watch page includes comprehensive Netflix-like functionality:

### Skip Intro Button

- Automatically detects intro sequences in movies and episodes
- Shows "Skip Intro" button during intro playback with smooth animations
- Movies: Default 0-90 second intro detection
- Episodes: Dynamic intro timing from episode metadata
- **Motion Preference Integration**: Respects user accessibility preferences with `useMotionPreference` hook

### Next Episode Auto-Play

- **Smart Overlay Timing**: Displays countdown overlay 2 minutes before episode ends (configurable)
- 10-second countdown with "Play Now" and "Cancel" options
- Automatic transition to next episode in series
- Only shown when next episode is available
- **Fallback Support**: Video end event triggers overlay as backup
- **Accessibility Features**: Comprehensive keyboard navigation and screen reader support

### Episode Metadata Integration

- Comprehensive episode and movie metadata system
- Intro timing detection and next episode logic
- Seamless integration with existing video player
- Fallback support when metadata is unavailable
- **Advanced State Management**: Dynamic overlay coordination and user preference persistence
- **Integration Features**: Controls visibility synchronization and z-index management

### Motion Preference & Accessibility

- **Real-time Preference Detection**: Monitors `prefers-reduced-motion`, `prefers-reduced-data`, and `prefers-contrast`
- **Touch Device Optimization**: Automatic detection and appropriate interaction adjustments
- **Dynamic Animation Control**: Intelligent animation timing based on user preferences and device capabilities
- **Inclusive Design**: Ensures accessibility for users with vestibular disorders, limited data, or visual impairments

### VideoPlayer Props for Netflix-like Features

The VideoPlayer component accepts the following key props:

```typescript
interface VideoPlayerProps {
  // Netflix-like feature props
  contentType?: 'movie' | 'episode';
  contentId?: string;
  seriesId?: string;
  onEpisodeChange?: (newEpisodeData: EpisodeMetadata) => void;
  nextEpisodeTriggerTime?: number; // Seconds before end to show overlay (default: 120)
}
```

#### Key Props

- **`nextEpisodeTriggerTime`**: Controls when the next episode overlay appears before the current episode ends
  - Type: `number` (seconds)
  - Default: `120` (2 minutes)
  - Example: `nextEpisodeTriggerTime={180}` shows overlay 3 minutes before end

See the [Netflix-like Features Specification](.kiro/specs/netflix-like-video-features/) for detailed requirements and implementation plans.

## Browser Compatibility

- **Auto-fullscreen**: Requires user interaction in most modern browsers for security reasons
- **Auto-play**: May be blocked by browser autoplay policies
- **Fallback**: Both features fall back to manual user interaction when blocked
