import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../input';
import { Button } from '../button';
import { ResponsiveSearch } from '../responsive-search';
import { FormLayout, FormField, ResponsiveForm } from '../form-layout';

describe('Responsive Form Components', () => {
  describe('Input Component', () => {
    it('renders with responsive classes by default', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      
      expect(input).toHaveClass('form-input-responsive');
      expect(input).toHaveClass('touch-target');
    });

    it('renders without responsive classes when disabled', () => {
      render(<Input data-testid="input" responsive={false} />);
      const input = screen.getByTestId('input');
      
      expect(input).not.toHaveClass('form-input-responsive');
      expect(input).toHaveClass('h-10');
    });

    it('can disable touch optimization', () => {
      render(<Input data-testid="input" touchOptimized={false} />);
      const input = screen.getByTestId('input');
      
      expect(input).not.toHaveClass('touch-target');
    });
  });

  describe('Button Component', () => {
    it('renders with responsive classes by default', () => {
      render(<Button data-testid="button">Test Button</Button>);
      const button = screen.getByTestId('button');
      
      expect(button).toHaveClass('button-responsive');
      expect(button).toHaveClass('touch-target');
    });

    it('uses responsive size when responsive is enabled', () => {
      render(<Button data-testid="button" responsive={true}>Test Button</Button>);
      const button = screen.getByTestId('button');
      
      expect(button).toHaveClass('button-responsive');
    });

    it('handles large size responsively', () => {
      render(<Button data-testid="button" size="lg">Test Button</Button>);
      const button = screen.getByTestId('button');
      
      expect(button).toHaveClass('button-responsive-large');
    });
  });

  describe('ResponsiveSearch Component', () => {
    it('renders with default variant', () => {
      render(<ResponsiveSearch data-testid="search" />);
      const searchContainer = screen.getByTestId('search');
      
      expect(searchContainer).toBeInTheDocument();
    });

    it('handles search submission', () => {
      const onSubmit = jest.fn();
      render(<ResponsiveSearch onSubmit={onSubmit} />);
      
      const input = screen.getByRole('searchbox');
      const form = input.closest('form');
      
      fireEvent.change(input, { target: { value: 'test search' } });
      fireEvent.submit(form!);
      
      expect(onSubmit).toHaveBeenCalledWith('test search');
    });

    it('shows clear button when there is text', () => {
      render(<ResponsiveSearch />);
      
      const input = screen.getByRole('searchbox');
      fireEvent.change(input, { target: { value: 'test' } });
      
      const clearButton = screen.getByLabelText('Clear search');
      expect(clearButton).toBeInTheDocument();
    });

    it('clears text when clear button is clicked', () => {
      const onChange = jest.fn();
      render(<ResponsiveSearch onChange={onChange} />);
      
      const input = screen.getByRole('searchbox');
      fireEvent.change(input, { target: { value: 'test' } });
      
      const clearButton = screen.getByLabelText('Clear search');
      fireEvent.click(clearButton);
      
      expect(onChange).toHaveBeenCalledWith('');
    });

    it('renders with overlay variant styles', () => {
      render(<ResponsiveSearch variant="overlay" data-testid="search" />);
      const input = screen.getByRole('searchbox');
      
      expect(input).toHaveClass('bg-white/10');
      expect(input).toHaveClass('text-white');
    });

    it('renders with different sizes', () => {
      const { rerender } = render(<ResponsiveSearch size="sm" data-testid="search" />);
      let container = screen.getByTestId('search');
      expect(container).toHaveClass('h-8');

      rerender(<ResponsiveSearch size="lg" data-testid="search" />);
      container = screen.getByTestId('search');
      expect(container).toHaveClass('h-12');
    });
  });

  describe('FormLayout Components', () => {
    it('renders FormLayout with responsive classes', () => {
      render(
        <FormLayout data-testid="form-layout">
          <div>Child 1</div>
          <div>Child 2</div>
        </FormLayout>
      );
      
      const layout = screen.getByTestId('form-layout');
      expect(layout).toHaveClass('flex');
      expect(layout).toHaveClass('flex-col');
      expect(layout).toHaveClass('sm:flex-row');
    });

    it('renders FormField with label and error', () => {
      render(
        <FormField label="Test Field" error="Test error" required>
          <input />
        </FormField>
      );
      
      expect(screen.getByText('Test Field')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument(); // Required indicator
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('renders ResponsiveForm with proper structure', () => {
      render(
        <ResponsiveForm data-testid="responsive-form">
          <FormField label="Field 1">
            <input />
          </FormField>
          <FormField label="Field 2">
            <input />
          </FormField>
        </ResponsiveForm>
      );
      
      const form = screen.getByTestId('responsive-form');
      expect(form.tagName).toBe('FORM');
      expect(screen.getByText('Field 1')).toBeInTheDocument();
      expect(screen.getByText('Field 2')).toBeInTheDocument();
    });

    it('handles different layout types', () => {
      const { rerender } = render(
        <FormLayout layout="stack" data-testid="layout">
          <div>Child</div>
        </FormLayout>
      );
      
      let layout = screen.getByTestId('layout');
      expect(layout).toHaveClass('flex-col');
      expect(layout).not.toHaveClass('sm:flex-row');

      rerender(
        <FormLayout layout="inline" data-testid="layout">
          <div>Child</div>
        </FormLayout>
      );
      
      layout = screen.getByTestId('layout');
      expect(layout).toHaveClass('flex-row');
    });
  });

  describe('Touch Target Accessibility', () => {
    it('ensures minimum touch target sizes', () => {
      render(
        <div>
          <Button data-testid="button">Button</Button>
          <Input data-testid="input" />
        </div>
      );
      
      const button = screen.getByTestId('button');
      const input = screen.getByTestId('input');
      
      expect(button).toHaveClass('touch-target');
      expect(input).toHaveClass('touch-target');
    });
  });

  describe('Responsive Breakpoint Behavior', () => {
    it('applies correct responsive classes for different screen sizes', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      
      // Check that responsive utility class is applied
      expect(input).toHaveClass('form-input-responsive');
    });

    it('handles responsive button sizing', () => {
      render(<Button data-testid="button">Test</Button>);
      const button = screen.getByTestId('button');
      
      expect(button).toHaveClass('button-responsive');
    });
  });
});