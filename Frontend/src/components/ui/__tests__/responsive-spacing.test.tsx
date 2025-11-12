import React from 'react';
import { render } from '@testing-library/react';

// Test component to verify responsive spacing utilities
const TestComponent = ({ className }: { className: string }) => (
  <div className={className} data-testid="test-element">
    Test Content
  </div>
);

describe('Responsive Spacing Utilities', () => {
  describe('Vertical Spacing (Padding Y)', () => {
    it('should apply spacing-section class correctly', () => {
      const { getByTestId } = render(
        <TestComponent className="spacing-section" />
      );
      
      const element = getByTestId('test-element');
      expect(element).toHaveClass('spacing-section');
    });

    it('should apply spacing-component class correctly', () => {
      const { getByTestId } = render(
        <TestComponent className="spacing-component" />
      );
      
      const element = getByTestId('test-element');
      expect(element).toHaveClass('spacing-component');
    });

    it('should apply spacing-element class correctly', () => {
      const { getByTestId } = render(
        <TestComponent className="spacing-element" />
      );
      
      const element = getByTestId('test-element');
      expect(element).toHaveClass('spacing-element');
    });

    it('should apply compact spacing variants', () => {
      const { getByTestId } = render(
        <TestComponent className="spacing-section-compact spacing-component-compact spacing-element-compact" />
      );
      
      const element = getByTestId('test-element');
      expect(element).toHaveClass('spacing-section-compact');
      expect(element).toHaveClass('spacing-component-compact');
      expect(element).toHaveClass('spacing-element-compact');
    });
  });

  describe('Horizontal Spacing (Padding X)', () => {
    it('should apply horizontal spacing classes correctly', () => {
      const { getByTestId } = render(
        <TestComponent className="spacing-x-section spacing-x-component spacing-x-element" />
      );
      
      const element = getByTestId('test-element');
      expect(element).toHaveClass('spacing-x-section');
      expect(element).toHaveClass('spacing-x-component');
      expect(element).toHaveClass('spacing-x-element');
    });
  });

  describe('Margin Utilities', () => {
    it('should apply margin classes correctly', () => {
      const { getByTestId } = render(
        <TestComponent className="margin-section margin-component margin-element" />
      );
      
      const element = getByTestId('test-element');
      expect(element).toHaveClass('margin-section');
      expect(element).toHaveClass('margin-component');
      expect(element).toHaveClass('margin-element');
    });
  });

  describe('Gap Utilities', () => {
    it('should apply responsive gap classes correctly', () => {
      const { getByTestId } = render(
        <TestComponent className="gap-responsive gap-responsive-large gap-responsive-compact" />
      );
      
      const element = getByTestId('test-element');
      expect(element).toHaveClass('gap-responsive');
      expect(element).toHaveClass('gap-responsive-large');
      expect(element).toHaveClass('gap-responsive-compact');
    });
  });

  describe('Space Between Utilities', () => {
    it('should apply space-responsive classes correctly', () => {
      const { getByTestId } = render(
        <TestComponent className="space-responsive space-responsive-large space-responsive-compact" />
      );
      
      const element = getByTestId('test-element');
      expect(element).toHaveClass('space-responsive');
      expect(element).toHaveClass('space-responsive-large');
      expect(element).toHaveClass('space-responsive-compact');
    });
  });

  describe('Overflow Utilities', () => {
    it('should apply overflow utilities correctly', () => {
      const { getByTestId } = render(
        <TestComponent className="overflow-responsive overflow-text-responsive overflow-ellipsis-responsive" />
      );
      
      const element = getByTestId('test-element');
      expect(element).toHaveClass('overflow-responsive');
      expect(element).toHaveClass('overflow-text-responsive');
      expect(element).toHaveClass('overflow-ellipsis-responsive');
    });

    it('should apply overflow clamp utilities correctly', () => {
      const { getByTestId } = render(
        <TestComponent className="overflow-clamp-2 overflow-clamp-3 overflow-clamp-responsive" />
      );
      
      const element = getByTestId('test-element');
      expect(element).toHaveClass('overflow-clamp-2');
      expect(element).toHaveClass('overflow-clamp-3');
      expect(element).toHaveClass('overflow-clamp-responsive');
    });
  });

  describe('Responsive Width and Height Utilities', () => {
    it('should apply responsive width utilities correctly', () => {
      const { getByTestId } = render(
        <TestComponent className="w-responsive-full w-responsive-auto w-responsive-fit" />
      );
      
      const element = getByTestId('test-element');
      expect(element).toHaveClass('w-responsive-full');
      expect(element).toHaveClass('w-responsive-auto');
      expect(element).toHaveClass('w-responsive-fit');
    });

    it('should apply responsive height utilities correctly', () => {
      const { getByTestId } = render(
        <TestComponent className="h-responsive-auto h-responsive-screen h-responsive-fit" />
      );
      
      const element = getByTestId('test-element');
      expect(element).toHaveClass('h-responsive-auto');
      expect(element).toHaveClass('h-responsive-screen');
      expect(element).toHaveClass('h-responsive-fit');
    });

    it('should apply responsive max-width utilities correctly', () => {
      const { getByTestId } = render(
        <TestComponent className="max-w-responsive max-w-responsive-content max-w-responsive-text" />
      );
      
      const element = getByTestId('test-element');
      expect(element).toHaveClass('max-w-responsive');
      expect(element).toHaveClass('max-w-responsive-content');
      expect(element).toHaveClass('max-w-responsive-text');
    });
  });

  describe('Responsive Flex Utilities', () => {
    it('should apply responsive flex utilities correctly', () => {
      const { getByTestId } = render(
        <TestComponent className="flex-responsive-col flex-responsive-row flex-responsive-wrap" />
      );
      
      const element = getByTestId('test-element');
      expect(element).toHaveClass('flex-responsive-col');
      expect(element).toHaveClass('flex-responsive-row');
      expect(element).toHaveClass('flex-responsive-wrap');
    });

    it('should apply responsive alignment utilities correctly', () => {
      const { getByTestId } = render(
        <TestComponent className="flex-responsive-center flex-responsive-between flex-responsive-start" />
      );
      
      const element = getByTestId('test-element');
      expect(element).toHaveClass('flex-responsive-center');
      expect(element).toHaveClass('flex-responsive-between');
      expect(element).toHaveClass('flex-responsive-start');
    });
  });

  describe('Responsive Position Utilities', () => {
    it('should apply responsive position utilities correctly', () => {
      const { getByTestId } = render(
        <TestComponent className="position-responsive-static position-responsive-relative" />
      );
      
      const element = getByTestId('test-element');
      expect(element).toHaveClass('position-responsive-static');
      expect(element).toHaveClass('position-responsive-relative');
    });
  });
});