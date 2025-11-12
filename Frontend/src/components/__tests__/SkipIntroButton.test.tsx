import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SkipIntroButton } from '../SkipIntroButton';

// Mock CSS animations
// Note: CSS imports are now handled seamlessly by Jest with identity-obj-proxy
Object.defineProperty(HTMLElement.prototype, 'classList', {
  value: {
    add: jest.fn(),
    remove: jest.fn(),
    contains: jest.fn(),
  },
  writable: true,
});

describe('Enhanced SkipIntroButton', () => {
  const mockOnSkipIntro = jest.fn();

  beforeEach(() => {
    mockOnSkipIntro.mockClear();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders when current time is within intro range', () => {
    render(
      <SkipIntroButton
        currentTime={30}
        introStart={0}
        introEnd={60}
        onSkipIntro={mockOnSkipIntro}
      />
    );

    expect(screen.getByRole('button', { name: /skip intro/i })).toBeInTheDocument();
  });

  it('does not render when current time is before intro start', () => {
    render(
      <SkipIntroButton
        currentTime={-5}
        introStart={0}
        introEnd={60}
        onSkipIntro={mockOnSkipIntro}
      />
    );

    expect(screen.queryByRole('button', { name: /skip intro/i })).not.toBeInTheDocument();
  });

  it('does not render when current time is after intro end', () => {
    render(
      <SkipIntroButton
        currentTime={70}
        introStart={0}
        introEnd={60}
        onSkipIntro={mockOnSkipIntro}
      />
    );

    expect(screen.queryByRole('button', { name: /skip intro/i })).not.toBeInTheDocument();
  });

  it('calls onSkipIntro when clicked', () => {
    render(
      <SkipIntroButton
        currentTime={30}
        introStart={0}
        introEnd={60}
        onSkipIntro={mockOnSkipIntro}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /skip intro/i }));
    expect(mockOnSkipIntro).toHaveBeenCalledTimes(1);
  });

  it('applies click animation when clicked', async () => {
    render(
      <SkipIntroButton
        currentTime={30}
        introStart={0}
        introEnd={60}
        onSkipIntro={mockOnSkipIntro}
      />
    );

    const button = screen.getByRole('button', { name: /skip intro/i });
    fireEvent.click(button);

    // Check that transform is applied for haptic feedback
    expect(button.style.transform).toBe('scale(0.95)');

    // Fast-forward time to check transform reset
    jest.advanceTimersByTime(100);
    
    await waitFor(() => {
      expect(button.style.transform).toBe('');
    });
  });

  it('calls onSkipIntro when Enter key is pressed with proper event handling', () => {
    render(
      <SkipIntroButton
        currentTime={30}
        introStart={0}
        introEnd={60}
        onSkipIntro={mockOnSkipIntro}
      />
    );

    const preventDefault = jest.fn();
    const stopPropagation = jest.fn();
    
    fireEvent.keyDown(screen.getByRole('button', { name: /skip intro/i }), {
      key: 'Enter',
      preventDefault,
      stopPropagation,
    });
    
    expect(mockOnSkipIntro).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalled();
  });

  it('calls onSkipIntro when Space key is pressed with proper event handling', () => {
    render(
      <SkipIntroButton
        currentTime={30}
        introStart={0}
        introEnd={60}
        onSkipIntro={mockOnSkipIntro}
      />
    );

    const preventDefault = jest.fn();
    const stopPropagation = jest.fn();
    
    fireEvent.keyDown(screen.getByRole('button', { name: /skip intro/i }), {
      key: ' ',
      preventDefault,
      stopPropagation,
    });
    
    expect(mockOnSkipIntro).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalled();
  });

  it('has proper accessibility attributes', () => {
    render(
      <SkipIntroButton
        currentTime={30}
        introStart={0}
        introEnd={60}
        onSkipIntro={mockOnSkipIntro}
      />
    );

    const button = screen.getByRole('button', { name: /skip intro/i });
    expect(button).toHaveAttribute('aria-label');
    expect(button.getAttribute('aria-label')).toContain('Skip intro sequence');
    expect(button).toHaveAttribute('aria-describedby', 'skip-intro-description');
    expect(button).toHaveAttribute('aria-keyshortcuts', 'Enter Space');
    expect(button).toHaveAttribute('tabIndex', '0');
    expect(button).toHaveAttribute('role', 'button');
    
    // Check for screen reader description
    expect(screen.getByText(/Press Enter or Space to skip/i)).toBeInTheDocument();
  });

  it('includes skip forward icon', () => {
    render(
      <SkipIntroButton
        currentTime={30}
        introStart={0}
        introEnd={60}
        onSkipIntro={mockOnSkipIntro}
      />
    );

    const icon = screen.getByRole('button').querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies responsive classes for different screen sizes', () => {
    render(
      <SkipIntroButton
        currentTime={30}
        introStart={0}
        introEnd={60}
        onSkipIntro={mockOnSkipIntro}
      />
    );

    const button = screen.getByRole('button', { name: /skip intro/i });
    
    // Check for responsive positioning classes
    expect(button).toHaveClass('bottom-16', 'right-3');
    expect(button).toHaveClass('sm:bottom-4', 'sm:right-4');
    expect(button).toHaveClass('md:bottom-6', 'md:right-6');
    expect(button).toHaveClass('lg:bottom-8', 'lg:right-8');
  });

  it('applies glassmorphism styling', () => {
    render(
      <SkipIntroButton
        currentTime={30}
        introStart={0}
        introEnd={60}
        onSkipIntro={mockOnSkipIntro}
      />
    );

    const button = screen.getByRole('button', { name: /skip intro/i });
    
    // Check for glassmorphism classes
    expect(button).toHaveClass('bg-black/80', 'backdrop-blur-sm');
    expect(button).toHaveClass('border', 'border-white/20');
    expect(button).toHaveClass('shadow-2xl');
  });

  it('applies motion preference classes', () => {
    render(
      <SkipIntroButton
        currentTime={30}
        introStart={0}
        introEnd={60}
        onSkipIntro={mockOnSkipIntro}
      />
    );

    const button = screen.getByRole('button', { name: /skip intro/i });
    
    // Check for motion preference classes
    expect(button).toHaveClass('motion-reduce:transition-none');
    expect(button).toHaveClass('motion-reduce:hover:scale-100');
  });

  it('handles entrance animation', async () => {
    const { rerender } = render(
      <SkipIntroButton
        currentTime={-5}
        introStart={0}
        introEnd={60}
        onSkipIntro={mockOnSkipIntro}
      />
    );

    // Button should not be visible initially
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    // Move into intro range
    rerender(
      <SkipIntroButton
        currentTime={30}
        introStart={0}
        introEnd={60}
        onSkipIntro={mockOnSkipIntro}
      />
    );

    // Button should appear
    expect(screen.getByRole('button')).toBeInTheDocument();

    // Fast-forward to trigger entrance animation
    jest.advanceTimersByTime(10);

    const button = screen.getByRole('button');
    expect(button.classList.add).toHaveBeenCalledWith('skip-intro-enter');
  });

  it('handles exit animation', async () => {
    const { rerender } = render(
      <SkipIntroButton
        currentTime={30}
        introStart={0}
        introEnd={60}
        onSkipIntro={mockOnSkipIntro}
      />
    );

    const button = screen.getByRole('button');

    // Move out of intro range
    rerender(
      <SkipIntroButton
        currentTime={70}
        introStart={0}
        introEnd={60}
        onSkipIntro={mockOnSkipIntro}
      />
    );

    // Exit animation should be triggered
    expect(button.classList.add).toHaveBeenCalledWith('skip-intro-exit');

    // Fast-forward animation duration
    jest.advanceTimersByTime(300);

    // Button should be removed after animation
    await waitFor(() => {
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  it('announces availability to screen readers', () => {
    const { rerender } = render(
      <SkipIntroButton
        currentTime={-5}
        introStart={0}
        introEnd={60}
        onSkipIntro={mockOnSkipIntro}
      />
    );

    // Move into intro range to trigger announcement
    rerender(
      <SkipIntroButton
        currentTime={30}
        introStart={0}
        introEnd={60}
        onSkipIntro={mockOnSkipIntro}
      />
    );

    // Check that announcement element was created
    const announcements = document.querySelectorAll('[aria-live="polite"]');
    expect(announcements.length).toBeGreaterThan(0);
    
    // Verify announcement content
    const announcement = Array.from(announcements).find(el => 
      el.textContent?.includes('Skip intro button is now available')
    );
    expect(announcement).toBeTruthy();
  });

  it('has enhanced focus states for accessibility', () => {
    render(
      <SkipIntroButton
        currentTime={30}
        introStart={0}
        introEnd={60}
        onSkipIntro={mockOnSkipIntro}
      />
    );

    const button = screen.getByRole('button');
    
    // Check for enhanced focus classes
    expect(button).toHaveClass('focus:ring-4', 'focus:ring-white/80');
    expect(button).toHaveClass('focus-visible:ring-4', 'focus-visible:ring-white/80');
    expect(button).toHaveClass('contrast-more:border-2', 'contrast-more:border-white');
  });

  it('respects motion preferences', () => {
    render(
      <SkipIntroButton
        currentTime={30}
        introStart={0}
        introEnd={60}
        onSkipIntro={mockOnSkipIntro}
      />
    );

    const button = screen.getByRole('button');
    
    // Check for motion preference classes
    expect(button).toHaveClass('motion-reduce:transition-none');
    expect(button).toHaveClass('motion-reduce:hover:scale-100');
    expect(button).toHaveClass('motion-reduce:focus:scale-100');
  });

  it('has enhanced accessibility announcements', () => {
    const { rerender } = render(
      <SkipIntroButton
        currentTime={-5}
        introStart={0}
        introEnd={60}
        onSkipIntro={mockOnSkipIntro}
      />
    );

    // Move into intro range
    rerender(
      <SkipIntroButton
        currentTime={30}
        introStart={0}
        introEnd={60}
        onSkipIntro={mockOnSkipIntro}
      />
    );

    // Check for screen reader announcement
    const announcements = document.querySelectorAll('[aria-live="polite"][aria-atomic="true"]');
    expect(announcements.length).toBeGreaterThan(0);
    
    // Verify the announcement has the sr-only class for screen readers only
    const announcement = Array.from(announcements).find(el => 
      el.classList.contains('sr-only') && 
      el.textContent === 'Skip intro button is now available'
    );
    expect(announcement).toBeTruthy();
  });

  it('cleans up accessibility announcements properly', async () => {
    const { rerender } = render(
      <SkipIntroButton
        currentTime={-5}
        introStart={0}
        introEnd={60}
        onSkipIntro={mockOnSkipIntro}
      />
    );

    // Move into intro range to create announcement
    rerender(
      <SkipIntroButton
        currentTime={30}
        introStart={0}
        introEnd={60}
        onSkipIntro={mockOnSkipIntro}
      />
    );

    // Fast-forward past cleanup timeout
    jest.advanceTimersByTime(1000);

    // Check that announcement was cleaned up
    await waitFor(() => {
      const remainingAnnouncements = document.querySelectorAll('[aria-live="polite"]');
      const skipIntroAnnouncements = Array.from(remainingAnnouncements).filter(el =>
        el.textContent?.includes('Skip intro button is now available')
      );
      expect(skipIntroAnnouncements.length).toBe(0);
    });
  });
});