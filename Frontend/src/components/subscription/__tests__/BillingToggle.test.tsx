/**
 * Test suite for BillingToggle component
 * Verifies toggle state changes, callback invocation, and keyboard accessibility
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { BillingToggle } from '../BillingToggle';

describe('BillingToggle Component', () => {
  describe('Toggle State Changes', () => {
    it('should render with annual selected by default', () => {
      const mockOnChange = jest.fn();
      render(<BillingToggle value="annual" onChange={mockOnChange} />);

      const annualButton = screen.getByRole('radio', { name: /annual/i });
      const monthlyButton = screen.getByRole('radio', { name: /monthly/i });

      expect(annualButton).toHaveAttribute('aria-checked', 'true');
      expect(monthlyButton).toHaveAttribute('aria-checked', 'false');
    });

    it('should render with monthly selected when value is monthly', () => {
      const mockOnChange = jest.fn();
      render(<BillingToggle value="monthly" onChange={mockOnChange} />);

      const annualButton = screen.getByRole('radio', { name: /annual/i });
      const monthlyButton = screen.getByRole('radio', { name: /monthly/i });

      expect(annualButton).toHaveAttribute('aria-checked', 'false');
      expect(monthlyButton).toHaveAttribute('aria-checked', 'true');
    });

    it('should switch from annual to monthly when monthly button is clicked', () => {
      const mockOnChange = jest.fn();
      render(<BillingToggle value="annual" onChange={mockOnChange} />);

      const monthlyButton = screen.getByRole('radio', { name: /monthly/i });
      fireEvent.click(monthlyButton);

      expect(mockOnChange).toHaveBeenCalledWith('monthly');
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('should switch from monthly to annual when annual button is clicked', () => {
      const mockOnChange = jest.fn();
      render(<BillingToggle value="monthly" onChange={mockOnChange} />);

      const annualButton = screen.getByRole('radio', { name: /annual/i });
      fireEvent.click(annualButton);

      expect(mockOnChange).toHaveBeenCalledWith('annual');
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('Callback Invocation', () => {
    it('should call onChange with correct value when annual is clicked', () => {
      const mockOnChange = jest.fn();
      render(<BillingToggle value="monthly" onChange={mockOnChange} />);

      const annualButton = screen.getByRole('radio', { name: /annual/i });
      fireEvent.click(annualButton);

      expect(mockOnChange).toHaveBeenCalledWith('annual');
    });

    it('should call onChange with correct value when monthly is clicked', () => {
      const mockOnChange = jest.fn();
      render(<BillingToggle value="annual" onChange={mockOnChange} />);

      const monthlyButton = screen.getByRole('radio', { name: /monthly/i });
      fireEvent.click(monthlyButton);

      expect(mockOnChange).toHaveBeenCalledWith('monthly');
    });

    it('should call onChange even when clicking already selected option', () => {
      const mockOnChange = jest.fn();
      render(<BillingToggle value="annual" onChange={mockOnChange} />);

      const annualButton = screen.getByRole('radio', { name: /annual/i });
      fireEvent.click(annualButton);

      expect(mockOnChange).toHaveBeenCalledWith('annual');
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('should not call onChange when component is just rendered', () => {
      const mockOnChange = jest.fn();
      render(<BillingToggle value="annual" onChange={mockOnChange} />);

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Accessibility', () => {
    it('should trigger onChange when Enter key is pressed on annual button', () => {
      const mockOnChange = jest.fn();
      render(<BillingToggle value="monthly" onChange={mockOnChange} />);

      const annualButton = screen.getByRole('radio', { name: /annual/i });
      fireEvent.keyDown(annualButton, { key: 'Enter', code: 'Enter' });

      expect(mockOnChange).toHaveBeenCalledWith('annual');
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('should trigger onChange when Space key is pressed on annual button', () => {
      const mockOnChange = jest.fn();
      render(<BillingToggle value="monthly" onChange={mockOnChange} />);

      const annualButton = screen.getByRole('radio', { name: /annual/i });
      fireEvent.keyDown(annualButton, { key: ' ', code: 'Space' });

      expect(mockOnChange).toHaveBeenCalledWith('annual');
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('should trigger onChange when Enter key is pressed on monthly button', () => {
      const mockOnChange = jest.fn();
      render(<BillingToggle value="annual" onChange={mockOnChange} />);

      const monthlyButton = screen.getByRole('radio', { name: /monthly/i });
      fireEvent.keyDown(monthlyButton, { key: 'Enter', code: 'Enter' });

      expect(mockOnChange).toHaveBeenCalledWith('monthly');
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('should trigger onChange when Space key is pressed on monthly button', () => {
      const mockOnChange = jest.fn();
      render(<BillingToggle value="annual" onChange={mockOnChange} />);

      const monthlyButton = screen.getByRole('radio', { name: /monthly/i });
      fireEvent.keyDown(monthlyButton, { key: ' ', code: 'Space' });

      expect(mockOnChange).toHaveBeenCalledWith('monthly');
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('should not trigger onChange when other keys are pressed', () => {
      const mockOnChange = jest.fn();
      render(<BillingToggle value="annual" onChange={mockOnChange} />);

      const annualButton = screen.getByRole('radio', { name: /annual/i });
      fireEvent.keyDown(annualButton, { key: 'a', code: 'KeyA' });
      fireEvent.keyDown(annualButton, { key: 'Tab', code: 'Tab' });
      fireEvent.keyDown(annualButton, { key: 'Escape', code: 'Escape' });

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should prevent default behavior when Enter key is pressed', () => {
      const mockOnChange = jest.fn();
      render(<BillingToggle value="annual" onChange={mockOnChange} />);

      const monthlyButton = screen.getByRole('radio', { name: /monthly/i });
      const event = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      
      monthlyButton.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should prevent default behavior when Space key is pressed', () => {
      const mockOnChange = jest.fn();
      render(<BillingToggle value="annual" onChange={mockOnChange} />);

      const monthlyButton = screen.getByRole('radio', { name: /monthly/i });
      const event = new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      
      monthlyButton.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Accessibility Attributes', () => {
    it('should have radiogroup role on container', () => {
      const mockOnChange = jest.fn();
      render(<BillingToggle value="annual" onChange={mockOnChange} />);

      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toBeInTheDocument();
    });

    it('should have aria-label on radiogroup', () => {
      const mockOnChange = jest.fn();
      render(<BillingToggle value="annual" onChange={mockOnChange} />);

      const radioGroup = screen.getByRole('radiogroup', { name: /select billing cycle/i });
      expect(radioGroup).toBeInTheDocument();
    });

    it('should have radio role on both buttons', () => {
      const mockOnChange = jest.fn();
      render(<BillingToggle value="annual" onChange={mockOnChange} />);

      const annualButton = screen.getByRole('radio', { name: /annual/i });
      const monthlyButton = screen.getByRole('radio', { name: /monthly/i });

      expect(annualButton).toBeInTheDocument();
      expect(monthlyButton).toBeInTheDocument();
    });

    it('should have correct aria-checked attributes based on value', () => {
      const mockOnChange = jest.fn();
      const { rerender } = render(<BillingToggle value="annual" onChange={mockOnChange} />);

      let annualButton = screen.getByRole('radio', { name: /annual/i });
      let monthlyButton = screen.getByRole('radio', { name: /monthly/i });

      expect(annualButton).toHaveAttribute('aria-checked', 'true');
      expect(monthlyButton).toHaveAttribute('aria-checked', 'false');

      // Rerender with monthly selected
      rerender(<BillingToggle value="monthly" onChange={mockOnChange} />);

      annualButton = screen.getByRole('radio', { name: /annual/i });
      monthlyButton = screen.getByRole('radio', { name: /monthly/i });

      expect(annualButton).toHaveAttribute('aria-checked', 'false');
      expect(monthlyButton).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Custom className', () => {
    it('should apply custom className to container', () => {
      const mockOnChange = jest.fn();
      render(<BillingToggle value="annual" onChange={mockOnChange} className="custom-class" />);

      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toHaveClass('custom-class');
    });

    it('should preserve default classes when custom className is provided', () => {
      const mockOnChange = jest.fn();
      render(<BillingToggle value="annual" onChange={mockOnChange} className="custom-class" />);

      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toHaveClass('inline-flex');
      expect(radioGroup).toHaveClass('bg-gray-800');
      expect(radioGroup).toHaveClass('rounded-full');
      expect(radioGroup).toHaveClass('custom-class');
    });
  });
});
