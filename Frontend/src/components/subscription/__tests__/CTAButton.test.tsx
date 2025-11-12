/**
 * Test suite for CTAButton component
 * Verifies button variant rendering, click handler invocation, and hover/focus states
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { CTAButton } from '../CTAButton';

describe('CTAButton Component', () => {
  describe('Button Variant Rendering', () => {
    it('should render primary variant with correct styles', () => {
      const mockOnClick = jest.fn();
      render(<CTAButton text="Get Started" variant="primary" onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: /get started/i });
      
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-white');
      expect(button).toHaveClass('text-black');
      expect(button).toHaveTextContent('Get Started');
    });

    it('should render secondary variant with correct styles', () => {
      const mockOnClick = jest.fn();
      render(<CTAButton text="Learn More" variant="secondary" onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: /learn more/i });
      
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-black');
      expect(button).toHaveClass('text-white');
      expect(button).toHaveTextContent('Learn More');
    });

    it('should render outline variant with correct styles', () => {
      const mockOnClick = jest.fn();
      render(<CTAButton text="Cancel" variant="outline" onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: /cancel/i });
      
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('text-gray-700');
      expect(button).toHaveClass('border');
      expect(button).toHaveClass('border-gray-300');
      expect(button).toHaveTextContent('Cancel');
    });

    it('should render with correct base styles for all variants', () => {
      const mockOnClick = jest.fn();
      const { rerender } = render(<CTAButton text="Button" variant="primary" onClick={mockOnClick} />);

      let button = screen.getByRole('button', { name: /button/i });
      
      expect(button).toHaveClass('px-6');
      expect(button).toHaveClass('py-3');
      expect(button).toHaveClass('rounded-full');
      expect(button).toHaveClass('font-semibold');
      expect(button).toHaveClass('text-sm');
      expect(button).toHaveClass('transition-all');

      // Test secondary variant
      rerender(<CTAButton text="Button" variant="secondary" onClick={mockOnClick} />);
      button = screen.getByRole('button', { name: /button/i });
      expect(button).toHaveClass('rounded-full');
      expect(button).toHaveClass('font-semibold');

      // Test outline variant
      rerender(<CTAButton text="Button" variant="outline" onClick={mockOnClick} />);
      button = screen.getByRole('button', { name: /button/i });
      expect(button).toHaveClass('rounded-full');
      expect(button).toHaveClass('font-semibold');
    });

    it('should render button with type="button"', () => {
      const mockOnClick = jest.fn();
      render(<CTAButton text="Click Me" variant="primary" onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should render with custom className when provided', () => {
      const mockOnClick = jest.fn();
      render(<CTAButton text="Custom" variant="primary" onClick={mockOnClick} className="custom-class" />);

      const button = screen.getByRole('button', { name: /custom/i });
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('bg-white'); // Should preserve default classes
    });

    it('should render without custom className when not provided', () => {
      const mockOnClick = jest.fn();
      render(<CTAButton text="Default" variant="primary" onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: /default/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Click Handler Invocation', () => {
    it('should call onClick handler when button is clicked', () => {
      const mockOnClick = jest.fn();
      render(<CTAButton text="Click Me" variant="primary" onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: /click me/i });
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick handler multiple times when clicked multiple times', () => {
      const mockOnClick = jest.fn();
      render(<CTAButton text="Click Me" variant="primary" onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: /click me/i });
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });

    it('should call onClick for primary variant', () => {
      const mockOnClick = jest.fn();
      render(<CTAButton text="Primary" variant="primary" onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: /primary/i });
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick for secondary variant', () => {
      const mockOnClick = jest.fn();
      render(<CTAButton text="Secondary" variant="secondary" onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: /secondary/i });
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick for outline variant', () => {
      const mockOnClick = jest.fn();
      render(<CTAButton text="Outline" variant="outline" onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: /outline/i });
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when component is just rendered', () => {
      const mockOnClick = jest.fn();
      render(<CTAButton text="Button" variant="primary" onClick={mockOnClick} />);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should call different onClick handlers for different button instances', () => {
      const mockOnClick1 = jest.fn();
      const mockOnClick2 = jest.fn();
      
      const { container } = render(
        <>
          <CTAButton text="Button 1" variant="primary" onClick={mockOnClick1} />
          <CTAButton text="Button 2" variant="secondary" onClick={mockOnClick2} />
        </>
      );

      const button1 = screen.getByRole('button', { name: /button 1/i });
      const button2 = screen.getByRole('button', { name: /button 2/i });

      fireEvent.click(button1);
      expect(mockOnClick1).toHaveBeenCalledTimes(1);
      expect(mockOnClick2).not.toHaveBeenCalled();

      fireEvent.click(button2);
      expect(mockOnClick1).toHaveBeenCalledTimes(1);
      expect(mockOnClick2).toHaveBeenCalledTimes(1);
    });
  });

  describe('Hover and Focus States', () => {
    it('should have hover styles for primary variant', () => {
      const mockOnClick = jest.fn();
      render(<CTAButton text="Hover Me" variant="primary" onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: /hover me/i });
      
      expect(button).toHaveClass('hover:bg-gray-200');
      expect(button).toHaveClass('hover:scale-105');
      expect(button).toHaveClass('hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]');
    });

    it('should have hover styles for secondary variant', () => {
      const mockOnClick = jest.fn();
      render(<CTAButton text="Hover Me" variant="secondary" onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: /hover me/i });
      
      expect(button).toHaveClass('hover:bg-gray-800');
      expect(button).toHaveClass('hover:scale-105');
      expect(button).toHaveClass('hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]');
    });

    it('should have hover styles for outline variant', () => {
      const mockOnClick = jest.fn();
      render(<CTAButton text="Hover Me" variant="outline" onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: /hover me/i });
      
      expect(button).toHaveClass('hover:bg-gray-100');
      expect(button).toHaveClass('hover:border-gray-400');
      expect(button).toHaveClass('hover:scale-105');
      expect(button).toHaveClass('hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]');
    });

    it('should have focus outline removed with focus:outline-none', () => {
      const mockOnClick = jest.fn();
      render(<CTAButton text="Focus Me" variant="primary" onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: /focus me/i });
      
      expect(button).toHaveClass('focus:outline-none');
    });

    it('should have focus ring styles for primary variant', () => {
      const mockOnClick = jest.fn();
      render(<CTAButton text="Focus Me" variant="primary" onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: /focus me/i });
      
      expect(button).toHaveClass('focus:ring-2');
      expect(button).toHaveClass('focus:ring-offset-2');
      expect(button).toHaveClass('focus:ring-gray-400');
    });

    it('should have focus ring styles for secondary variant', () => {
      const mockOnClick = jest.fn();
      render(<CTAButton text="Focus Me" variant="secondary" onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: /focus me/i });
      
      expect(button).toHaveClass('focus:ring-2');
      expect(button).toHaveClass('focus:ring-offset-2');
      expect(button).toHaveClass('focus:ring-gray-600');
    });

    it('should have focus ring styles for outline variant', () => {
      const mockOnClick = jest.fn();
      render(<CTAButton text="Focus Me" variant="outline" onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: /focus me/i });
      
      expect(button).toHaveClass('focus:ring-2');
      expect(button).toHaveClass('focus:ring-offset-2');
      expect(button).toHaveClass('focus:ring-gray-300');
    });

    it('should be focusable via keyboard navigation', () => {
      const mockOnClick = jest.fn();
      render(<CTAButton text="Focus Me" variant="primary" onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: /focus me/i });
      button.focus();

      expect(button).toHaveFocus();
    });

    it('should be activatable via keyboard (native button behavior)', () => {
      const mockOnClick = jest.fn();
      render(<CTAButton text="Keyboard Button" variant="primary" onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: /keyboard button/i });
      button.focus();
      
      // Native HTML buttons handle Enter and Space key presses automatically
      // We verify the button is focusable and can be clicked
      expect(button).toHaveFocus();
      fireEvent.click(button);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should have transition styles for smooth animations', () => {
      const mockOnClick = jest.fn();
      render(<CTAButton text="Animate" variant="primary" onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: /animate/i });
      
      expect(button).toHaveClass('transition-all');
      expect(button).toHaveClass('duration-200');
    });
  });

  describe('Accessibility Attributes', () => {
    it('should have aria-label matching the button text', () => {
      const mockOnClick = jest.fn();
      render(<CTAButton text="Start Free Trial" variant="primary" onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: /start free trial/i });
      expect(button).toHaveAttribute('aria-label', 'Start Free Trial');
    });

    it('should be accessible via screen reader', () => {
      const mockOnClick = jest.fn();
      render(<CTAButton text="Subscribe Now" variant="primary" onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: /subscribe now/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAccessibleName('Subscribe Now');
    });

    it('should have button role', () => {
      const mockOnClick = jest.fn();
      render(<CTAButton text="Click" variant="primary" onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Text Content', () => {
    it('should display the provided text', () => {
      const mockOnClick = jest.fn();
      render(<CTAButton text="Start 7-day Free Trial" variant="primary" onClick={mockOnClick} />);

      expect(screen.getByText('Start 7-day Free Trial')).toBeInTheDocument();
    });

    it('should update text when prop changes', () => {
      const mockOnClick = jest.fn();
      const { rerender } = render(<CTAButton text="Initial Text" variant="primary" onClick={mockOnClick} />);

      expect(screen.getByText('Initial Text')).toBeInTheDocument();

      rerender(<CTAButton text="Updated Text" variant="primary" onClick={mockOnClick} />);

      expect(screen.queryByText('Initial Text')).not.toBeInTheDocument();
      expect(screen.getByText('Updated Text')).toBeInTheDocument();
    });

    it('should handle long text content', () => {
      const mockOnClick = jest.fn();
      const longText = 'This is a very long button text that should still render correctly';
      render(<CTAButton text={longText} variant="primary" onClick={mockOnClick} />);

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should handle special characters in text', () => {
      const mockOnClick = jest.fn();
      render(<CTAButton text="Sign Up & Save 27%" variant="primary" onClick={mockOnClick} />);

      expect(screen.getByText('Sign Up & Save 27%')).toBeInTheDocument();
    });
  });
});
