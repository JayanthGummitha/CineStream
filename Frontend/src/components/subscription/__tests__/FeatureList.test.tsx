/**
 * Test suite for FeatureList component
 * Verifies feature item rendering with correct icons, variant styling, and empty list handling
 */

import { render, screen } from '@testing-library/react';
import { FeatureList } from '../FeatureList';
import { FeatureItem } from '@/types/pricing';

describe('FeatureList Component', () => {
  describe('Feature Item Rendering with Correct Icons', () => {
    it('should render checkmark icon for included features', () => {
      const features: FeatureItem[] = [
        { text: 'HD quality streaming', included: true },
      ];

      render(<FeatureList features={features} />);

      const listItem = screen.getByText('HD quality streaming');
      expect(listItem).toBeInTheDocument();

      // Check for the checkmark icon container
      const iconContainer = listItem.previousElementSibling;
      expect(iconContainer).toHaveClass('bg-green-500');
      expect(iconContainer).toHaveClass('rounded-full');
    });

    it('should render X mark icon for unavailable features', () => {
      const features: FeatureItem[] = [
        { text: 'Offline downloads', included: false },
      ];

      render(<FeatureList features={features} />);

      const listItem = screen.getByText('Offline downloads');
      expect(listItem).toBeInTheDocument();

      // Check that the icon container does not have green background
      const iconContainer = listItem.previousElementSibling;
      expect(iconContainer).not.toHaveClass('bg-green-500');
    });

    it('should render multiple features with mixed inclusion status', () => {
      const features: FeatureItem[] = [
        { text: 'Complete content library', included: true },
        { text: 'HD quality streaming', included: true },
        { text: 'Offline downloads', included: false },
        { text: 'Ad-free experience', included: false },
      ];

      render(<FeatureList features={features} />);

      expect(screen.getByText('Complete content library')).toBeInTheDocument();
      expect(screen.getByText('HD quality streaming')).toBeInTheDocument();
      expect(screen.getByText('Offline downloads')).toBeInTheDocument();
      expect(screen.getByText('Ad-free experience')).toBeInTheDocument();
    });

    it('should render all included features with checkmarks', () => {
      const features: FeatureItem[] = [
        { text: 'Feature 1', included: true },
        { text: 'Feature 2', included: true },
        { text: 'Feature 3', included: true },
      ];

      const { container } = render(<FeatureList features={features} />);

      // Count green checkmark containers
      const checkmarkContainers = container.querySelectorAll('.bg-green-500');
      expect(checkmarkContainers).toHaveLength(3);
    });

    it('should render all unavailable features with X marks', () => {
      const features: FeatureItem[] = [
        { text: 'Feature 1', included: false },
        { text: 'Feature 2', included: false },
        { text: 'Feature 3', included: false },
      ];

      const { container } = render(<FeatureList features={features} />);

      // Ensure no green checkmark containers
      const checkmarkContainers = container.querySelectorAll('.bg-green-500');
      expect(checkmarkContainers).toHaveLength(0);
    });

    it('should render feature text correctly', () => {
      const features: FeatureItem[] = [
        { text: 'This is a very long feature description that should be rendered correctly', included: true },
      ];

      render(<FeatureList features={features} />);

      expect(screen.getByText('This is a very long feature description that should be rendered correctly')).toBeInTheDocument();
    });
  });

  describe('Light and Dark Variant Styling', () => {
    it('should apply light variant text colors by default', () => {
      const features: FeatureItem[] = [
        { text: 'Included feature', included: true },
        { text: 'Excluded feature', included: false },
      ];

      render(<FeatureList features={features} />);

      const includedFeature = screen.getByText('Included feature');
      const excludedFeature = screen.getByText('Excluded feature');

      expect(includedFeature).toHaveClass('text-gray-700');
      expect(excludedFeature).toHaveClass('text-gray-400');
    });

    it('should apply light variant text colors when explicitly set', () => {
      const features: FeatureItem[] = [
        { text: 'Included feature', included: true },
        { text: 'Excluded feature', included: false },
      ];

      render(<FeatureList features={features} variant="light" />);

      const includedFeature = screen.getByText('Included feature');
      const excludedFeature = screen.getByText('Excluded feature');

      expect(includedFeature).toHaveClass('text-gray-700');
      expect(excludedFeature).toHaveClass('text-gray-400');
    });

    it('should apply dark variant text colors', () => {
      const features: FeatureItem[] = [
        { text: 'Included feature', included: true },
        { text: 'Excluded feature', included: false },
      ];

      render(<FeatureList features={features} variant="dark" />);

      const includedFeature = screen.getByText('Included feature');
      const excludedFeature = screen.getByText('Excluded feature');

      expect(includedFeature).toHaveClass('text-gray-200');
      expect(excludedFeature).toHaveClass('text-gray-500');
    });

    it('should maintain icon colors regardless of variant', () => {
      const features: FeatureItem[] = [
        { text: 'Included feature', included: true },
      ];

      const { container: lightContainer } = render(<FeatureList features={features} variant="light" />);
      const lightCheckmark = lightContainer.querySelector('.bg-green-500');
      expect(lightCheckmark).toBeInTheDocument();

      const { container: darkContainer } = render(<FeatureList features={features} variant="dark" />);
      const darkCheckmark = darkContainer.querySelector('.bg-green-500');
      expect(darkCheckmark).toBeInTheDocument();
    });

    it('should switch text colors when variant changes', () => {
      const features: FeatureItem[] = [
        { text: 'Test feature', included: true },
      ];

      const { rerender } = render(<FeatureList features={features} variant="light" />);
      let featureText = screen.getByText('Test feature');
      expect(featureText).toHaveClass('text-gray-700');

      rerender(<FeatureList features={features} variant="dark" />);
      featureText = screen.getByText('Test feature');
      expect(featureText).toHaveClass('text-gray-200');
    });
  });

  describe('Empty Feature List Handling', () => {
    it('should render empty list without errors', () => {
      const features: FeatureItem[] = [];

      const { container } = render(<FeatureList features={features} />);

      const list = container.querySelector('ul');
      expect(list).toBeInTheDocument();
      expect(list?.children).toHaveLength(0);
    });

    it('should render list with role="list" even when empty', () => {
      const features: FeatureItem[] = [];

      render(<FeatureList features={features} />);

      const list = screen.getByRole('list', { name: /plan features/i });
      expect(list).toBeInTheDocument();
    });

    it('should not render any list items when features array is empty', () => {
      const features: FeatureItem[] = [];

      const { container } = render(<FeatureList features={features} />);

      const listItems = container.querySelectorAll('li');
      expect(listItems).toHaveLength(0);
    });

    it('should not render any icons when features array is empty', () => {
      const features: FeatureItem[] = [];

      const { container } = render(<FeatureList features={features} />);

      const checkmarks = container.querySelectorAll('.bg-green-500');
      const xMarks = container.querySelectorAll('[aria-hidden="true"]');
      
      expect(checkmarks).toHaveLength(0);
      expect(xMarks).toHaveLength(0);
    });
  });

  describe('Accessibility Attributes', () => {
    it('should have role="list" on the ul element', () => {
      const features: FeatureItem[] = [
        { text: 'Feature 1', included: true },
      ];

      render(<FeatureList features={features} />);

      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
    });

    it('should have aria-label on the list', () => {
      const features: FeatureItem[] = [
        { text: 'Feature 1', included: true },
      ];

      render(<FeatureList features={features} />);

      const list = screen.getByRole('list', { name: /plan features/i });
      expect(list).toBeInTheDocument();
    });

    it('should have aria-hidden="true" on icon containers', () => {
      const features: FeatureItem[] = [
        { text: 'Included feature', included: true },
        { text: 'Excluded feature', included: false },
      ];

      const { container } = render(<FeatureList features={features} />);

      const icons = container.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Layout and Spacing', () => {
    it('should apply correct spacing classes to the list', () => {
      const features: FeatureItem[] = [
        { text: 'Feature 1', included: true },
      ];

      const { container } = render(<FeatureList features={features} />);

      const list = container.querySelector('ul');
      expect(list).toHaveClass('space-y-3');
    });

    it('should apply correct layout classes to list items', () => {
      const features: FeatureItem[] = [
        { text: 'Feature 1', included: true },
      ];

      const { container } = render(<FeatureList features={features} />);

      const listItem = container.querySelector('li');
      expect(listItem).toHaveClass('flex');
      expect(listItem).toHaveClass('items-start');
      expect(listItem).toHaveClass('gap-3');
    });

    it('should apply flex-shrink-0 to icon containers', () => {
      const features: FeatureItem[] = [
        { text: 'Feature 1', included: true },
      ];

      const { container } = render(<FeatureList features={features} />);

      const iconContainer = container.querySelector('[aria-hidden="true"]');
      expect(iconContainer).toHaveClass('flex-shrink-0');
    });
  });

  describe('Edge Cases', () => {
    it('should handle features with special characters in text', () => {
      const features: FeatureItem[] = [
        { text: 'Feature with & special <characters>', included: true },
        { text: 'Feature with "quotes" and \'apostrophes\'', included: false },
      ];

      render(<FeatureList features={features} />);

      expect(screen.getByText('Feature with & special <characters>')).toBeInTheDocument();
      expect(screen.getByText('Feature with "quotes" and \'apostrophes\'')).toBeInTheDocument();
    });

    it('should handle features with very long text', () => {
      const longText = 'This is a very long feature description that goes on and on and on to test how the component handles extremely long text content that might wrap to multiple lines';
      const features: FeatureItem[] = [
        { text: longText, included: true },
      ];

      render(<FeatureList features={features} />);

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should handle features with empty text', () => {
      const features: FeatureItem[] = [
        { text: '', included: true },
      ];

      const { container } = render(<FeatureList features={features} />);

      const listItems = container.querySelectorAll('li');
      expect(listItems).toHaveLength(1);
    });

    it('should render correct number of features', () => {
      const features: FeatureItem[] = Array.from({ length: 10 }, (_, i) => ({
        text: `Feature ${i + 1}`,
        included: i % 2 === 0,
      }));

      const { container } = render(<FeatureList features={features} />);

      const listItems = container.querySelectorAll('li');
      expect(listItems).toHaveLength(10);
    });
  });
});
