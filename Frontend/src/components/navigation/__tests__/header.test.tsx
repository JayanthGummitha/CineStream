import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { Header } from '../header';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock AuthModal component
jest.mock('@/components/auth/auth-modal', () => ({
  AuthModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? <div data-testid="auth-modal">Auth Modal</div> : null,
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('Header Component - Responsive Navigation', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Desktop Navigation', () => {
    it('renders desktop navigation with proper responsive classes', () => {
      render(<Header />);
      
      const desktopNav = screen.getByRole('navigation');
      expect(desktopNav).toHaveClass('nav-desktop');
    });

    it('displays all navigation items with hover indicators', () => {
      render(<Header />);
      
      const exploreLink = screen.getByText('EXPLORE');
      const moviesLink = screen.getByText('MOVIES');
      const tvShowsLink = screen.getByText('TV SHOWS');
      const documentariesLink = screen.getByText('DOCUMENTARIES');
      const kidsLink = screen.getByText('KIDS');

      expect(exploreLink).toBeInTheDocument();
      expect(moviesLink).toBeInTheDocument();
      expect(tvShowsLink).toBeInTheDocument();
      expect(documentariesLink).toBeInTheDocument();
      expect(kidsLink).toBeInTheDocument();
    });

    it('shows active indicator for current page', () => {
      mockUsePathname.mockReturnValue('/movies');
      render(<Header />);
      
      const moviesLink = screen.getByText('MOVIES');
      expect(moviesLink).toHaveClass('text-white');
    });
  });

  describe('Mobile Navigation', () => {
    it('renders mobile menu button with proper accessibility attributes', () => {
      render(<Header />);
      
      const menuButton = screen.getByLabelText('Open menu');
      expect(menuButton).toHaveClass('nav-hamburger');
      expect(menuButton).toHaveClass('touch-target-large');
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
      expect(menuButton).toHaveAttribute('aria-controls', 'mobile-navigation');
    });

    it('opens mobile menu when hamburger button is clicked', async () => {
      render(<Header />);
      
      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      await waitFor(() => {
        expect(screen.getByRole('navigation', { name: 'Mobile navigation menu' })).toBeInTheDocument();
        expect(menuButton).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByLabelText('Close menu')).toBeInTheDocument();
      });
    });

    it('closes mobile menu when backdrop is clicked', async () => {
      render(<Header />);
      
      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      await waitFor(() => {
        const backdrop = screen.getByRole('navigation', { name: 'Mobile navigation menu' }).previousElementSibling;
        if (backdrop) {
          fireEvent.click(backdrop);
        }
      });

      await waitFor(() => {
        expect(screen.queryByRole('navigation', { name: 'Mobile navigation menu' })).not.toBeInTheDocument();
      });
    });

    it('renders mobile navigation items with proper touch targets', async () => {
      render(<Header />);
      
      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      await waitFor(() => {
        const mobileNav = screen.getByRole('navigation', { name: 'Mobile navigation menu' });
        const navItems = mobileNav.querySelectorAll('[role="menuitem"]');
        
        navItems.forEach(item => {
          expect(item).toHaveClass('touch-target-large');
        });
      });
    });
  });

  describe('Search Functionality', () => {
    it('renders search button with proper accessibility attributes', () => {
      render(<Header />);
      
      const searchButton = screen.getByLabelText('Search movies and shows');
      expect(searchButton).toHaveClass('touch-target');
      expect(searchButton).toBeInTheDocument();
    });

    it('opens search overlay when search button is clicked', async () => {
      render(<Header />);
      
      const searchButton = screen.getByLabelText('Search movies and shows');
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: 'Search movies and shows' })).toBeInTheDocument();
        expect(screen.getByLabelText('Search input')).toBeInTheDocument();
      });
    });

    it('closes search overlay when escape key is pressed', async () => {
      render(<Header />);
      
      const searchButton = screen.getByLabelText('Search movies and shows');
      fireEvent.click(searchButton);

      await waitFor(() => {
        const searchInput = screen.getByLabelText('Search input');
        fireEvent.keyDown(searchInput, { key: 'Escape' });
      });

      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: 'Search movies and shows' })).not.toBeInTheDocument();
      });
    });
  });

  describe('Authentication States', () => {
    it('shows sign in and sign up buttons when not authenticated', () => {
      render(<Header isAuthenticated={false} />);
      
      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    it('shows user profile and notifications when authenticated', () => {
      const mockUser = {
        name: 'John Doe',
        email: 'john@example.com',
        avatar: '/avatar.jpg'
      };

      render(<Header isAuthenticated={true} user={mockUser} />);
      
      expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
      expect(screen.getByLabelText(`User menu for ${mockUser.name}`)).toBeInTheDocument();
    });

    it('renders mobile auth buttons with proper touch targets', async () => {
      render(<Header isAuthenticated={false} />);
      
      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      await waitFor(() => {
        const signInButton = screen.getAllByText('Sign In').find(btn => 
          btn.closest('.touch-target-large')
        );
        const signUpButton = screen.getAllByText('Get Started').find(btn => 
          btn.closest('.touch-target-large')
        );

        expect(signInButton).toBeInTheDocument();
        expect(signUpButton).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('applies responsive container classes', () => {
      render(<Header />);
      
      const headerContainer = screen.getByRole('banner').firstElementChild;
      expect(headerContainer).toHaveClass('responsive-container');
    });

    it('applies responsive height classes to header', () => {
      render(<Header />);
      
      const headerContainer = screen.getByRole('banner').firstElementChild;
      expect(headerContainer).toHaveClass('h-16', 'sm:h-18', 'md:h-20', 'lg:h-16', 'xl:h-18');
    });

    it('applies responsive spacing to navigation items', () => {
      render(<Header />);
      
      const desktopNav = screen.getByRole('navigation');
      expect(desktopNav).toHaveClass('space-x-4', 'md:space-x-6', 'lg:space-x-8', 'xl:space-x-10');
    });
  });

  describe('Keyboard Navigation', () => {
    it('closes mobile menu when escape key is pressed', async () => {
      render(<Header />);
      
      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      await waitFor(() => {
        expect(screen.getByRole('navigation', { name: 'Mobile navigation menu' })).toBeInTheDocument();
      });

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('navigation', { name: 'Mobile navigation menu' })).not.toBeInTheDocument();
      });
    });

    it('supports focus management for mobile menu items', async () => {
      render(<Header />);
      
      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      await waitFor(() => {
        const mobileNav = screen.getByRole('navigation', { name: 'Mobile navigation menu' });
        const navItems = mobileNav.querySelectorAll('[role="menuitem"]');
        
        navItems.forEach(item => {
          expect(item).toHaveAttribute('tabIndex', '0');
        });
      });
    });
  });
});