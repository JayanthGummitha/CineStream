/**
 * Test suite for PriceDisplay component
 * Verifies price formatting, original price strikethrough, savings badge, and billing info display
 */

import { render, screen } from '@testing-library/react';
import { PriceDisplay } from '../PriceDisplay';
import { PriceDisplayProps } from '@/types/pricing';

// Mock IntersectionObserver for Framer Motion's useInView
beforeAll(() => {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() {
      return [];
    }
    unobserve() {}
  } as any;
});

describe('PriceDisplay Component', () => {
  const defaultProps: PriceDisplayProps = {
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    billingCycle: 'annual',
    currency: 'USD',
  };

  describe('Price Formatting for Different Billing Cycles', () => {
    it('should display yearly price when billing cycle is annual', () => {
      render(<PriceDisplay {...defaultProps} billingCycle="annual" />);

      // Annual billing shows yearly total price
      const priceElement = screen.getByText('$99.99');
      expect(priceElement).toBeInTheDocument();
      expect(priceElement).toHaveClass('font-bold');
    });

    it('should display monthly price when billing cycle is monthly', () => {
      render(<PriceDisplay {...defaultProps} billingCycle="monthly" />);

      // Monthly billing shows monthly price
      const priceElement = screen.getByText('$9.99');
      expect(priceElement).toBeInTheDocument();
      expect(priceElement).toHaveClass('font-bold');
    });

    it('should display currency label with price', () => {
      render(<PriceDisplay {...defaultProps} billingCycle="annual" />);

      const currencyLabel = screen.getByText(/\/ year \(USD\)/i);
      expect(currencyLabel).toBeInTheDocument();
    });

    it('should display custom currency when provided', () => {
      render(<PriceDisplay {...defaultProps} currency="EUR" billingCycle="annual" />);

      const currencyLabel = screen.getByText(/\/ year \(EUR\)/i);
      expect(currencyLabel).toBeInTheDocument();
    });

    it('should format price correctly for different amounts', () => {
      const { rerender } = render(<PriceDisplay {...defaultProps} yearlyPrice={49.99} billingCycle="annual" />);
      // Check screen reader text for annual price
      expect(screen.getByText(/Price: \$49\.99 per year/i, { selector: '.sr-only' })).toBeInTheDocument();

      rerender(<PriceDisplay {...defaultProps} yearlyPrice={159.99} billingCycle="annual" />);
      // Price may be animating, check screen reader text
      expect(screen.getByText(/Price: \$159\.99 per year/i, { selector: '.sr-only' })).toBeInTheDocument();

      rerender(<PriceDisplay {...defaultProps} monthlyPrice={15.99} billingCycle="monthly" />);
      expect(screen.getByText(/Price: \$15\.99 per month/i, { selector: '.sr-only' })).toBeInTheDocument();
    });
  });

  describe('Original Price Strikethrough Display', () => {
    it('should display original price with strikethrough when provided', () => {
      render(<PriceDisplay {...defaultProps} originalPrice={12.99} />);

      const originalPrice = screen.getByText('$12.99');
      expect(originalPrice).toBeInTheDocument();
      expect(originalPrice).toHaveClass('line-through');
    });

    it('should not display original price when not provided', () => {
      render(<PriceDisplay {...defaultProps} billingCycle="annual" />);

      const prices = screen.queryAllByText(/^\$\d+(\.\d+)?$/);
      // Should only have the main price, not an original price
      expect(prices.length).toBe(1);
      expect(prices[0]).toHaveTextContent('$99.99'); // Annual price
    });

    it('should apply correct styling to original price in light variant', () => {
      render(<PriceDisplay {...defaultProps} originalPrice={12.99} variant="light" />);

      const originalPrice = screen.getByText('$12.99');
      expect(originalPrice).toHaveClass('text-gray-400');
    });

    it('should apply correct styling to original price in dark variant', () => {
      render(<PriceDisplay {...defaultProps} originalPrice={12.99} variant="dark" />);

      const originalPrice = screen.getByText('$12.99');
      expect(originalPrice).toHaveClass('text-gray-400');
    });

    it('should display both original and current price when original price is provided', () => {
      render(<PriceDisplay {...defaultProps} monthlyPrice={9.99} yearlyPrice={99.99} originalPrice={12.99} billingCycle="annual" />);

      expect(screen.getByText('$12.99')).toBeInTheDocument();
      expect(screen.getByText('$99.99')).toBeInTheDocument(); // Annual price
    });
  });

  describe('Savings Badge Rendering', () => {
    it('should display savings badge when savingsPercentage is provided', () => {
      render(<PriceDisplay {...defaultProps} savingsPercentage={17} />);

      const badge = screen.getByText('Save 17%');
      expect(badge).toBeInTheDocument();
    });

    it('should apply correct styling to savings badge', () => {
      render(<PriceDisplay {...defaultProps} savingsPercentage={17} />);

      const badge = screen.getByText('Save 17%');
      expect(badge).toHaveClass('bg-yellow-400', 'text-black', 'px-3', 'py-1', 'rounded-full', 'font-medium');
    });

    it('should not display savings badge when savingsPercentage is not provided', () => {
      render(<PriceDisplay {...defaultProps} />);

      const badge = screen.queryByText(/Save \d+%/);
      expect(badge).not.toBeInTheDocument();
    });

    it('should display savings badge with different percentages', () => {
      const { rerender } = render(<PriceDisplay {...defaultProps} savingsPercentage={10} />);
      expect(screen.getByText('Save 10%')).toBeInTheDocument();

      rerender(<PriceDisplay {...defaultProps} savingsPercentage={50} />);
      expect(screen.getByText('Save 50%')).toBeInTheDocument();

      rerender(<PriceDisplay {...defaultProps} savingsPercentage={75} />);
      expect(screen.getByText('Save 75%')).toBeInTheDocument();
    });

    it('should not display savings badge when savingsPercentage is 0', () => {
      render(<PriceDisplay {...defaultProps} savingsPercentage={0} />);

      const badge = screen.queryByText(/Save \d+%/);
      expect(badge).not.toBeInTheDocument();
    });
  });

  describe('Billing Info Display', () => {
    it('should display monthly breakdown when billing cycle is annual', () => {
      render(<PriceDisplay {...defaultProps} billingCycle="annual" yearlyPrice={99.99} monthlyPrice={9.99} />);

      const billingInfo = screen.getByText('$9.99/month when billed annually');
      expect(billingInfo).toBeInTheDocument();
      expect(billingInfo).toHaveClass('text-sm');
    });

    it('should not display billing breakdown when billing cycle is monthly', () => {
      render(<PriceDisplay {...defaultProps} billingCycle="monthly" />);

      const billingInfo = screen.queryByText(/when billed annually/i);
      expect(billingInfo).not.toBeInTheDocument();
    });

    it('should display correct monthly breakdown in billing info', () => {
      const { rerender } = render(<PriceDisplay {...defaultProps} billingCycle="annual" yearlyPrice={99.99} monthlyPrice={9.99} />);
      expect(screen.getByText('$9.99/month when billed annually')).toBeInTheDocument();

      rerender(<PriceDisplay {...defaultProps} billingCycle="annual" yearlyPrice={159.99} monthlyPrice={15.99} />);
      expect(screen.getByText('$15.99/month when billed annually')).toBeInTheDocument();

      rerender(<PriceDisplay {...defaultProps} billingCycle="annual" yearlyPrice={49.99} monthlyPrice={4.99} />);
      expect(screen.getByText('$4.99/month when billed annually')).toBeInTheDocument();
    });

    it('should apply correct styling to billing info in light variant', () => {
      render(<PriceDisplay {...defaultProps} billingCycle="annual" variant="light" />);

      // Use getAllByText since there's both screen reader and visible text
      const billingInfoElements = screen.getAllByText(/when billed annually/i);
      // The visible element (not sr-only) should have the correct class
      const visibleElement = billingInfoElements.find(el => !el.className.includes('sr-only'));
      expect(visibleElement).toHaveClass('text-gray-500');
    });

    it('should apply correct styling to billing info in dark variant', () => {
      render(<PriceDisplay {...defaultProps} billingCycle="annual" variant="dark" />);

      // Use getAllByText since there's both screen reader and visible text
      const billingInfoElements = screen.getAllByText(/when billed annually/i);
      // The visible element (not sr-only) should have the correct class
      const visibleElement = billingInfoElements.find(el => !el.className.includes('sr-only'));
      expect(visibleElement).toHaveClass('text-gray-300');
    });
  });

  describe('Variant Styling', () => {
    it('should apply light variant styling by default', () => {
      render(<PriceDisplay {...defaultProps} billingCycle="annual" />);

      const priceElement = screen.getByText('$99.99');
      expect(priceElement).toHaveClass('text-gray-900');
    });

    it('should apply light variant styling when explicitly set', () => {
      render(<PriceDisplay {...defaultProps} variant="light" billingCycle="annual" />);

      const priceElement = screen.getByText('$99.99');
      expect(priceElement).toHaveClass('text-gray-900');
    });

    it('should apply dark variant styling when set', () => {
      render(<PriceDisplay {...defaultProps} variant="dark" billingCycle="annual" />);

      const priceElement = screen.getByText('$99.99');
      expect(priceElement).toHaveClass('text-white');
    });

    it('should apply correct secondary text color in light variant', () => {
      render(<PriceDisplay {...defaultProps} variant="light" billingCycle="annual" />);

      const currencyLabel = screen.getByText(/\/ year \(USD\)/i);
      expect(currencyLabel).toHaveClass('text-gray-500');
    });

    it('should apply correct secondary text color in dark variant', () => {
      render(<PriceDisplay {...defaultProps} variant="dark" billingCycle="annual" />);

      const currencyLabel = screen.getByText(/\/ year \(USD\)/i);
      expect(currencyLabel).toHaveClass('text-gray-300');
    });
  });

  describe('Complete Pricing Display', () => {
    it('should display all elements when all props are provided', () => {
      render(
        <PriceDisplay
          monthlyPrice={9.99}
          yearlyPrice={99.99}
          originalPrice={12.99}
          billingCycle="annual"
          currency="USD"
          savingsPercentage={17}
          variant="dark"
        />
      );

      // Check all elements are present
      expect(screen.getByText('Save 17%')).toBeInTheDocument();
      expect(screen.getByText('$12.99')).toBeInTheDocument(); // Original price
      expect(screen.getByText('$99.99')).toBeInTheDocument(); // Current annual price
      expect(screen.getByText(/\/ year \(USD\)/i)).toBeInTheDocument();
      expect(screen.getByText('$9.99/month when billed annually')).toBeInTheDocument();
    });

    it('should display minimal elements when only required props are provided', () => {
      render(
        <PriceDisplay
          monthlyPrice={4.99}
          yearlyPrice={49.99}
          billingCycle="monthly"
        />
      );

      // Check only required elements are present
      // Monthly billing shows monthly price
      expect(screen.getByText('$4.99')).toBeInTheDocument();
      expect(screen.getByText(/\/ month \(USD\)/i)).toBeInTheDocument();
      
      // Check optional elements are not present
      expect(screen.queryByText(/Save \d+%/)).not.toBeInTheDocument();
      expect(screen.queryByText(/when billed annually/i)).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero prices', () => {
      render(<PriceDisplay {...defaultProps} monthlyPrice={0} yearlyPrice={0} />);

      expect(screen.getByText('$0')).toBeInTheDocument();
    });

    it('should handle large prices', () => {
      render(<PriceDisplay {...defaultProps} monthlyPrice={999} yearlyPrice={11988} billingCycle="annual" />);

      expect(screen.getByText('$11988')).toBeInTheDocument(); // Annual price
      expect(screen.getByText('$999/month when billed annually')).toBeInTheDocument();
    });

    it('should handle decimal prices', () => {
      render(<PriceDisplay {...defaultProps} monthlyPrice={19.99} billingCycle="monthly" />);

      expect(screen.getByText('$19.99')).toBeInTheDocument();
    });

    it('should handle 100% savings', () => {
      render(<PriceDisplay {...defaultProps} savingsPercentage={100} />);

      expect(screen.getByText('Save 100%')).toBeInTheDocument();
    });
  });
});
