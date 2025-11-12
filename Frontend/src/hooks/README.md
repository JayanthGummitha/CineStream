# Custom React Hooks

This directory contains custom React hooks used throughout the CineStream application.

## useMotionPreference Hook

The `useMotionPreference` hook provides comprehensive motion and accessibility preference detection for creating inclusive user experiences.

### Features

- **Real-time Preference Detection**: Monitors user preferences using CSS media queries
- **Accessibility-First Design**: Respects `prefers-reduced-motion`, `prefers-reduced-data`, and `prefers-contrast` settings
- **Touch Device Support**: Automatic detection of touch interfaces
- **Dynamic Animation Control**: Intelligent animation timing and enabling based on user needs
- **Utility Functions**: Helper functions for motion-safe styling

### Usage

```typescript
import { useMotionPreference } from '@/hooks/useMotionPreference';

function MyComponent() {
  const {
    prefersReducedMotion,
    prefersReducedData,
    prefersHighContrast,
    isTouch,
    getAnimationDuration,
    shouldAnimate
  } = useMotionPreference();

  // Get animation duration based on preferences
  const duration = getAnimationDuration(300); // Returns 0 if reduced motion preferred

  // Check if specific animation types should be enabled
  const showHoverAnimation = shouldAnimate('hover');
  const showEntranceAnimation = shouldAnimate('entrance');

  return (
    <div
      className={`transition-all ${prefersReducedMotion ? 'motion-reduce:transition-none' : ''}`}
      style={{
        transitionDuration: `${duration}ms`
      }}
    >
      {/* Component content */}
    </div>
  );
}
```

### API Reference

#### Return Values

##### MotionPreferences Interface
```typescript
interface MotionPreferences {
  prefersReducedMotion: boolean;  // User prefers reduced motion
  prefersReducedData: boolean;    // User prefers reduced data usage
  prefersHighContrast: boolean;   // User prefers high contrast
  isTouch: boolean;               // Touch device detected
}
```

##### Utility Functions

**`getAnimationDuration(defaultMs: number): number`**
- Returns animation duration adjusted for user preferences
- Returns `0` if `prefersReducedMotion` is true
- Returns reduced duration if `prefersReducedData` is true
- Returns optimized duration for touch devices

**`shouldAnimate(animationType?: 'entrance' | 'exit' | 'hover' | 'focus'): boolean`**
- Determines if animations should be enabled based on preferences
- Always returns `false` if `prefersReducedMotion` is true
- Limits animations if `prefersReducedData` is true (only focus animations)
- Disables hover animations on touch devices

### Utility Functions

#### getAnimationClasses
```typescript
import { getAnimationClasses } from '@/hooks/useMotionPreference';

const classes = getAnimationClasses(
  'base-class',
  'animate-fade-in',
  prefersReducedMotion
);
// Returns: 'base-class animate-fade-in' or 'base-class motion-reduce:transition-none motion-reduce:animate-none'
```

#### getMotionSafeStyles
```typescript
import { getMotionSafeStyles } from '@/hooks/useMotionPreference';

const styles = getMotionSafeStyles(
  { opacity: 1 },
  { transition: 'all 0.3s ease' },
  prefersReducedMotion
);
// Returns styles with or without animation properties based on preferences
```

### Integration with Netflix-like Features

The `useMotionPreference` hook is designed to work seamlessly with the Netflix-like features:

```typescript
// In SkipIntroButton component
const { getAnimationDuration, shouldAnimate } = useMotionPreference();

const entranceDuration = getAnimationDuration(300);
const shouldShowAnimation = shouldAnimate('entrance');

// Apply motion-safe animations
const buttonClasses = cn(
  'skip-intro-button',
  shouldShowAnimation ? 'animate-slide-in' : '',
  'motion-reduce:transition-none'
);
```

### Browser Compatibility

The hook uses modern CSS media query features:
- `prefers-reduced-motion` - Supported in all modern browsers
- `prefers-reduced-data` - Limited support, gracefully degrades
- `prefers-contrast` - Good support in modern browsers
- `hover: none` and `pointer: coarse` - Excellent support for touch detection

### Performance Considerations

- **Efficient Event Listeners**: Uses native `MediaQueryList` event listeners
- **Automatic Cleanup**: Properly removes event listeners on unmount
- **Minimal Re-renders**: State updates only when preferences actually change
- **SSR Safe**: Handles server-side rendering gracefully

### Accessibility Benefits

1. **Reduced Motion**: Respects users with vestibular disorders
2. **Data Conservation**: Reduces animations for users on limited data plans
3. **High Contrast**: Adapts to users with visual impairments
4. **Touch Optimization**: Provides appropriate interactions for touch devices
5. **Focus Management**: Ensures focus animations remain for keyboard navigation

### Testing

The hook can be tested by mocking media queries:

```typescript
// In tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

### Future Enhancements

- **Preference Persistence**: Remember user preferences across sessions
- **Custom Animation Profiles**: Allow users to customize animation preferences
- **Performance Monitoring**: Track animation performance impact
- **Advanced Touch Detection**: More granular touch device capabilities