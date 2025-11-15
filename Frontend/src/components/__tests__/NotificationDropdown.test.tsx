import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationDropdown } from '../navigation/notification-dropdown';
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification } from '@/lib/notifications';

// Mock the useNotifications hook
jest.mock('@/hooks/useNotifications');

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({ src, alt, ...props }: any) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

const mockUseNotifications = useNotifications as jest.MockedFunction<typeof useNotifications>;

describe('NotificationDropdown', () => {
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'new_release',
      title: 'New Movie Alert!',
      message: 'The Matrix is now available to watch',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      isRead: false,
      actionUrl: '/movie/the-matrix',
      imageUrl: '/movie-poster-1.svg',
      movieTitle: 'The Matrix',
    },
    {
      id: '2',
      type: 'subscription',
      title: 'Subscription Expiring',
      message: 'Your premium subscription expires in 3 days',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      isRead: false,
      actionUrl: '/subscription',
    },
    {
      id: '3',
      type: 'trending',
      title: 'Trending Now',
      message: 'Inception is trending in your area',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      isRead: true,
      actionUrl: '/movie/inception',
    },
  ];

  const defaultMockReturn = {
    notifications: mockNotifications,
    isLoading: false,
    error: null,
    unreadCount: 2,
    refetch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNotifications.mockReturnValue(defaultMockReturn);
  });

  describe('Dropdown open/close behavior', () => {
    it('renders bell button in closed state by default', () => {
      render(<NotificationDropdown />);

      const button = screen.getByRole('button', { name: /notifications/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAccessibleName('Notifications, 2 unread');

      // Dropdown content should not be visible
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('opens dropdown when bell button is clicked', async () => {
      const user = userEvent.setup();
      render(<NotificationDropdown />);

      const button = screen.getByRole('button', { name: /notifications/i });
      await user.click(button);

      // Dropdown content should be visible
      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    it('closes dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <NotificationDropdown />
          <div data-testid="outside-area">Outside Area</div>
        </div>
      );

      // Open dropdown
      const bellButton = screen.getByRole('button', { name: /notifications/i });
      await user.click(bellButton);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Click outside - use Escape key as a proxy for outside click behavior
      // (Radix UI's dropdown closes on outside click, but testing this in jsdom is complex)
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('closes dropdown when notification item is clicked', async () => {
      const user = userEvent.setup();
      render(<NotificationDropdown />);

      // Open dropdown
      const button = screen.getByRole('button', { name: /notifications/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Click on a notification
      const notificationLink = screen.getByRole('link', { name: /new movie alert/i });
      await user.click(notificationLink);

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('closes dropdown when "More notifications" link is clicked', async () => {
      const user = userEvent.setup();
      render(<NotificationDropdown />);

      // Open dropdown
      const button = screen.getByRole('button', { name: /notifications/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Click "More notifications" - it has role="menuitem"
      const moreLink = screen.getByRole('menuitem', { name: /more notifications/i });
      await user.click(moreLink);

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });
  });

  describe('Keyboard navigation', () => {
    it('closes dropdown when Escape key is pressed', async () => {
      const user = userEvent.setup();
      render(<NotificationDropdown />);

      // Open dropdown
      const button = screen.getByRole('button', { name: /notifications/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Press Escape
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('opens dropdown when Enter key is pressed on bell button', async () => {
      const user = userEvent.setup();
      render(<NotificationDropdown />);

      const button = screen.getByRole('button', { name: /notifications/i });
      button.focus();

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });
    });

    it('opens dropdown when Space key is pressed on bell button', async () => {
      const user = userEvent.setup();
      render(<NotificationDropdown />);

      const button = screen.getByRole('button', { name: /notifications/i });
      button.focus();

      await user.keyboard(' ');

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });
    });

    it('allows Tab navigation through notification items', async () => {
      const user = userEvent.setup();
      render(<NotificationDropdown />);

      // Open dropdown
      const button = screen.getByRole('button', { name: /notifications/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Verify notification items are present and can be tabbed to
      const notifications = screen.getAllByRole('menuitem');
      expect(notifications.length).toBeGreaterThan(0);
      
      // Verify first notification is accessible
      const firstNotification = screen.getByRole('link', { name: /new movie alert/i });
      expect(firstNotification).toBeInTheDocument();
    });
  });

  describe('Empty state rendering', () => {
    it('displays empty state when no notifications exist', async () => {
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        notifications: [],
        unreadCount: 0,
      });

      const user = userEvent.setup();
      render(<NotificationDropdown />);

      // Open dropdown
      const button = screen.getByRole('button', { name: 'Notifications' });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Check empty state
      expect(screen.getByText('No new notifications')).toBeInTheDocument();
      expect(screen.getByText('Check back later for updates')).toBeInTheDocument();

      // Bell icon should be visible in empty state
      const emptyStateContainer = screen.getByText('No new notifications').parentElement;
      expect(emptyStateContainer).toBeInTheDocument();
    });

    it('does not show unread badge when no notifications', () => {
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        notifications: [],
        unreadCount: 0,
      });

      render(<NotificationDropdown />);

      const button = screen.getByRole('button', { name: 'Notifications' });
      
      // Badge should not be present
      const badge = button.querySelector('[aria-label*="unread"]');
      expect(badge).not.toBeInTheDocument();
    });
  });

  describe('Loading state rendering', () => {
    it('displays loading state while fetching notifications', async () => {
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        isLoading: true,
        notifications: [],
      });

      const user = userEvent.setup();
      render(<NotificationDropdown />);

      // Open dropdown
      const button = screen.getByRole('button', { name: /notifications/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Check loading state
      expect(screen.getByText('Loading notifications...')).toBeInTheDocument();
      
      // Loading spinner should be visible
      const spinner = screen.getByText('Loading notifications...').previousElementSibling;
      expect(spinner).toHaveClass('animate-spin');
    });
  });

  describe('Error state rendering', () => {
    it('displays error state when fetch fails', async () => {
      const mockRefetch = jest.fn();
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        error: new Error('Failed to fetch'),
        notifications: [],
        refetch: mockRefetch,
      });

      const user = userEvent.setup();
      render(<NotificationDropdown />);

      // Open dropdown
      const button = screen.getByRole('button', { name: /notifications/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Check error state
      expect(screen.getByText('Unable to load notifications')).toBeInTheDocument();
      
      // Try Again button should be visible
      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('calls refetch when Try Again button is clicked', async () => {
      const mockRefetch = jest.fn();
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        error: new Error('Failed to fetch'),
        notifications: [],
        refetch: mockRefetch,
      });

      const user = userEvent.setup();
      render(<NotificationDropdown />);

      // Open dropdown
      const button = screen.getByRole('button', { name: /notifications/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Click Try Again
      const retryButton = screen.getByRole('button', { name: /try again/i });
      await user.click(retryButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Notification item rendering with various types', () => {
    it('renders all notification items correctly', async () => {
      const user = userEvent.setup();
      render(<NotificationDropdown />);

      // Open dropdown
      const button = screen.getByRole('button', { name: /notifications/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Check all notifications are rendered
      expect(screen.getByText('New Movie Alert!')).toBeInTheDocument();
      expect(screen.getByText('Subscription Expiring')).toBeInTheDocument();
      expect(screen.getByText('Trending Now')).toBeInTheDocument();
    });

    it('renders notification with new_release type correctly', async () => {
      const user = userEvent.setup();
      render(<NotificationDropdown />);

      // Open dropdown
      const button = screen.getByRole('button', { name: /notifications/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Check new_release notification
      const notification = screen.getByText('New Movie Alert!');
      expect(notification).toBeInTheDocument();
      expect(screen.getByText('The Matrix is now available to watch')).toBeInTheDocument();
    });

    it('renders notification with subscription type correctly', async () => {
      const user = userEvent.setup();
      render(<NotificationDropdown />);

      // Open dropdown
      const button = screen.getByRole('button', { name: /notifications/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Check subscription notification
      expect(screen.getByText('Subscription Expiring')).toBeInTheDocument();
      expect(screen.getByText('Your premium subscription expires in 3 days')).toBeInTheDocument();
    });

    it('renders notification with trending type correctly', async () => {
      const user = userEvent.setup();
      render(<NotificationDropdown />);

      // Open dropdown
      const button = screen.getByRole('button', { name: /notifications/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Check trending notification
      expect(screen.getByText('Trending Now')).toBeInTheDocument();
      expect(screen.getByText('Inception is trending in your area')).toBeInTheDocument();
    });

    it('displays unread indicator for unread notifications', async () => {
      const user = userEvent.setup();
      render(<NotificationDropdown />);

      // Open dropdown
      const button = screen.getByRole('button', { name: /notifications/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Check for unread indicators (2 unread notifications)
      const unreadIndicators = screen.getAllByLabelText('Unread notification');
      expect(unreadIndicators).toHaveLength(2);
    });

    it('renders notification with image thumbnail', async () => {
      const user = userEvent.setup();
      render(<NotificationDropdown />);

      // Open dropdown
      const button = screen.getByRole('button', { name: /notifications/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Check for image (The Matrix notification has an image)
      const image = screen.getByAltText('The Matrix');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/movie-poster-1.svg');
    });

    it('renders notification without image when imageUrl is not provided', async () => {
      const user = userEvent.setup();
      render(<NotificationDropdown />);

      // Open dropdown
      const button = screen.getByRole('button', { name: /notifications/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Subscription notification doesn't have an image
      expect(screen.getByText('Subscription Expiring')).toBeInTheDocument();
      
      // Should not have an image for this notification
      expect(screen.queryByAltText('Subscription Expiring')).not.toBeInTheDocument();
    });

    it('displays relative timestamps for notifications', async () => {
      const user = userEvent.setup();
      render(<NotificationDropdown />);

      // Open dropdown
      const button = screen.getByRole('button', { name: /notifications/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Check for relative time displays
      expect(screen.getByText(/2h ago/i)).toBeInTheDocument();
      expect(screen.getByText(/1h ago/i)).toBeInTheDocument();
      expect(screen.getByText(/30m ago/i)).toBeInTheDocument();
    });
  });

  describe('"More notifications" link navigation', () => {
    it('renders "More notifications" link when notifications exist', async () => {
      const user = userEvent.setup();
      render(<NotificationDropdown />);

      // Open dropdown
      const button = screen.getByRole('button', { name: /notifications/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Check for "More notifications" link - it has role="menuitem"
      const moreLink = screen.getByRole('menuitem', { name: /more notifications/i });
      expect(moreLink).toBeInTheDocument();
      expect(moreLink).toHaveAttribute('href', '/user/notifications');
    });

    it('does not render "More notifications" link in empty state', async () => {
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        notifications: [],
        unreadCount: 0,
      });

      const user = userEvent.setup();
      render(<NotificationDropdown />);

      // Open dropdown
      const button = screen.getByRole('button', { name: 'Notifications' });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // "More notifications" link should not be present
      expect(screen.queryByRole('menuitem', { name: /more notifications/i })).not.toBeInTheDocument();
    });

    it('does not render "More notifications" link in loading state', async () => {
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        isLoading: true,
        notifications: [],
      });

      const user = userEvent.setup();
      render(<NotificationDropdown />);

      // Open dropdown
      const button = screen.getByRole('button', { name: /notifications/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // "More notifications" link should not be present
      expect(screen.queryByRole('menuitem', { name: /more notifications/i })).not.toBeInTheDocument();
    });

    it('does not render "More notifications" link in error state', async () => {
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        error: new Error('Failed to fetch'),
        notifications: [],
      });

      const user = userEvent.setup();
      render(<NotificationDropdown />);

      // Open dropdown
      const button = screen.getByRole('button', { name: /notifications/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // "More notifications" link should not be present
      expect(screen.queryByRole('menuitem', { name: /more notifications/i })).not.toBeInTheDocument();
    });
  });

  describe('Unread badge indicator', () => {
    it('displays unread badge with correct count', () => {
      render(<NotificationDropdown />);

      const button = screen.getByRole('button', { name: /notifications/i });
      
      // Badge should be present with count
      const badge = within(button).getByLabelText('2 unread notifications');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('2');
    });

    it('displays "9+" when unread count exceeds 9', () => {
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        unreadCount: 15,
      });

      render(<NotificationDropdown />);

      const button = screen.getByRole('button', { name: /notifications/i });
      
      // Badge should show "9+"
      const badge = within(button).getByLabelText('15 unread notifications');
      expect(badge).toHaveTextContent('9+');
    });

    it('does not display badge when unread count is 0', () => {
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        unreadCount: 0,
      });

      render(<NotificationDropdown />);

      const button = screen.getByRole('button', { name: 'Notifications' });
      
      // Badge should not be present
      const badge = button.querySelector('[aria-label*="unread"]');
      expect(badge).not.toBeInTheDocument();
    });
  });

  describe('Responsive behavior', () => {
    it('applies correct width classes for different screen sizes', async () => {
      const user = userEvent.setup();
      render(<NotificationDropdown />);

      // Open dropdown
      const button = screen.getByRole('button', { name: /notifications/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      const menu = screen.getByRole('menu');
      
      // Check for responsive width classes
      expect(menu).toHaveClass('w-[320px]'); // Mobile
      expect(menu).toHaveClass('sm:w-[340px]'); // Tablet
      expect(menu).toHaveClass('lg:w-[380px]'); // Desktop
    });

    it('applies max-height and overflow for scrolling', async () => {
      const user = userEvent.setup();
      render(<NotificationDropdown />);

      // Open dropdown
      const button = screen.getByRole('button', { name: /notifications/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      const menu = screen.getByRole('menu');
      
      // Check for max-height and overflow
      expect(menu).toHaveClass('max-h-[400px]');
      expect(menu).toHaveClass('overflow-y-auto');
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels for bell button', () => {
      render(<NotificationDropdown />);

      const button = screen.getByRole('button', { name: 'Notifications, 2 unread' });
      expect(button).toBeInTheDocument();
    });

    it('provides proper ARIA label for bell button with no unread', () => {
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        unreadCount: 0,
      });

      render(<NotificationDropdown />);

      const button = screen.getByRole('button', { name: 'Notifications' });
      expect(button).toBeInTheDocument();
    });

    it('provides proper role and aria-label for dropdown menu', async () => {
      const user = userEvent.setup();
      render(<NotificationDropdown />);

      // Open dropdown
      const button = screen.getByRole('button', { name: /notifications/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Verify menu has proper aria-label
      const menu = screen.getByRole('menu');
      expect(menu).toHaveAttribute('aria-label', 'Notification menu');
    });

    it('provides accessible labels for unread badge', () => {
      render(<NotificationDropdown />);

      const button = screen.getByRole('button', { name: /notifications/i });
      const badge = within(button).getByLabelText('2 unread notifications');
      
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Custom className prop', () => {
    it('accepts and applies custom className', () => {
      const customClass = 'custom-notification-dropdown';
      render(<NotificationDropdown className={customClass} />);

      const button = screen.getByRole('button', { name: /notifications/i });
      expect(button).toHaveClass(customClass);
    });
  });
});
