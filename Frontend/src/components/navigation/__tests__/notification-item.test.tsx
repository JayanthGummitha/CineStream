import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationItem } from '../notification-item';
import { Notification } from '@/lib/notifications';

// Mock Next.js components
jest.mock('next/image', () => {
  return function MockImage({ alt, ...props }: any) {
    return <img alt={alt} {...props} />;
  };
});

jest.mock('next/link', () => {
  return function MockLink({ children, href, onClick }: any) {
    return <a href={href} onClick={onClick}>{children}</a>;
  };
});

// Mock notification data
const mockNotification: Notification = {
  id: '1',
  type: 'new_release',
  title: 'New Movie Alert! 🎬',
  message: 'The Matrix is now available to stream. Experience the groundbreaking sci-fi action film.',
  timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  isRead: false,
  actionUrl: '/movie/123',
  actionText: 'Watch Now',
  imageUrl: '/test-poster.jpg',
  movieId: '123',
  movieTitle: 'The Matrix'
};

const mockReadNotification: Notification = {
  ...mockNotification,
  id: '2',
  isRead: true,
  title: 'Subscription Expiring',
  message: 'Your premium subscription will expire in 7 days.',
  type: 'subscription',
  imageUrl: undefined
};

describe('NotificationItem', () => {
  it('renders notification title and message correctly', () => {
    render(<NotificationItem notification={mockNotification} />);
    
    expect(screen.getByText('New Movie Alert! 🎬')).toBeInTheDocument();
    expect(screen.getByText(/The Matrix is now available to stream/)).toBeInTheDocument();
  });

  it('displays relative timestamp', () => {
    render(<NotificationItem notification={mockNotification} />);
    
    // Should show "2h ago" for a notification from 2 hours ago
    expect(screen.getByText('2h ago')).toBeInTheDocument();
  });

  it('shows unread indicator for unread notifications', () => {
    render(<NotificationItem notification={mockNotification} />);
    
    const unreadIndicator = screen.getByLabelText('Unread notification');
    expect(unreadIndicator).toBeInTheDocument();
    expect(unreadIndicator).toHaveClass('bg-red-500');
  });

  it('hides unread indicator for read notifications', () => {
    render(<NotificationItem notification={mockReadNotification} />);
    
    expect(screen.queryByLabelText('Unread notification')).not.toBeInTheDocument();
  });

  it('displays notification icon based on type', () => {
    const { container } = render(<NotificationItem notification={mockNotification} />);
    
    // Icon should be wrapped in a colored gradient container
    const iconContainer = container.querySelector('.bg-gradient-to-br');
    expect(iconContainer).toBeInTheDocument();
  });

  it('truncates message to 2 lines', () => {
    render(<NotificationItem notification={mockNotification} />);
    
    const messageElement = screen.getByText(/The Matrix is now available to stream/);
    expect(messageElement).toHaveClass('line-clamp-2');
  });

  it('displays thumbnail image when imageUrl is provided', () => {
    render(<NotificationItem notification={mockNotification} />);
    
    const image = screen.getByAltText('The Matrix');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', expect.stringContaining('test-poster.jpg'));
  });

  it('hides thumbnail on mobile (sm breakpoint)', () => {
    const { container } = render(<NotificationItem notification={mockNotification} />);
    
    const imageContainer = container.querySelector('.hidden.sm\\:block');
    expect(imageContainer).toBeInTheDocument();
  });

  it('does not render thumbnail when imageUrl is not provided', () => {
    render(<NotificationItem notification={mockReadNotification} />);
    
    expect(screen.queryByAltText(/Subscription Expiring/)).not.toBeInTheDocument();
  });

  it('renders as Link when actionUrl is provided', () => {
    render(<NotificationItem notification={mockNotification} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/movie/123');
  });

  it('calls onClose when notification is clicked', () => {
    const onClose = jest.fn();
    render(<NotificationItem notification={mockNotification} onClose={onClose} />);
    
    const link = screen.getByRole('link');
    fireEvent.click(link);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('applies hover state styles', () => {
    const { container } = render(<NotificationItem notification={mockNotification} />);
    
    const notificationContent = container.querySelector('.hover\\:bg-neutral-800\\/50');
    expect(notificationContent).toBeInTheDocument();
  });

  it('has proper ARIA labels for accessibility', () => {
    render(<NotificationItem notification={mockNotification} />);
    
    const menuItem = screen.getByRole('menuitem');
    expect(menuItem).toHaveAttribute(
      'aria-label',
      expect.stringContaining('New Movie Alert!')
    );
  });

  it('supports keyboard navigation with Enter key', () => {
    const onClose = jest.fn();
    render(<NotificationItem notification={mockNotification} onClose={onClose} />);
    
    const menuItem = screen.getByRole('menuitem');
    fireEvent.keyDown(menuItem, { key: 'Enter' });
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard navigation with Space key', () => {
    const onClose = jest.fn();
    render(<NotificationItem notification={mockNotification} onClose={onClose} />);
    
    const menuItem = screen.getByRole('menuitem');
    fireEvent.keyDown(menuItem, { key: ' ' });
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('is keyboard focusable with tabIndex', () => {
    render(<NotificationItem notification={mockNotification} />);
    
    const menuItem = screen.getByRole('menuitem');
    expect(menuItem).toHaveAttribute('tabIndex', '0');
  });

  it('has focus-visible ring for keyboard navigation', () => {
    const { container } = render(<NotificationItem notification={mockNotification} />);
    
    const menuItem = container.querySelector('.focus-visible\\:ring-2');
    expect(menuItem).toBeInTheDocument();
  });

  it('applies different color gradients for different notification types', () => {
    const subscriptionNotification = { ...mockNotification, type: 'subscription' as const };
    const { container } = render(<NotificationItem notification={subscriptionNotification} />);
    
    // Subscription type should have orange-red gradient
    const iconContainer = container.querySelector('.from-orange-500');
    expect(iconContainer).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <NotificationItem notification={mockNotification} className="custom-class" />
    );
    
    const notificationContent = container.querySelector('.custom-class');
    expect(notificationContent).toBeInTheDocument();
  });
});
