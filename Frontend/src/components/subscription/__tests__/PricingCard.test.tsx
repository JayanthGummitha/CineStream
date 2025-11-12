/**
 * Test suite for PricingCard component
 * Verifies card rendering, highlighted variant styling, feature list integration, and CTA button handling
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { PricingCard } from '../PricingCard';
import { PricingPlanData } from '@/types/pricing';

// Mock child components to isolate PricingCard testing
jest.mock('../PriceDisplay', () => ({
  PriceDisplay: ({ monthlyPrice, yearlyPrice, billingCycle, variant }: any) => (
    <div data-testid="price-display" data-variant={variant}>
      Price: ${billingCycle === 'annual' ? monthlyPrice : monthlyPrice}/month
      {billingCycle === 'annual' && ` (${yearlyPrice} yearly)`}
    </div>
  ),
}));

jest.mock('../FeatureList', () => ({
  FeatureList: ({ features, variant }: any) => (
    <div data-testid="feature-list" data-variant={variant}>
      {features.map((f: any, i: number) => (
        <div key={i}>{f.text}: {f.included ? 'included' : 'not included'}</div>
      ))}
    </div>
  ),
}));

jest.mock('../CTAButton', () => ({
  CTAButton: ({ text, variant, onClick, className }: any) => (
    <button
      data-testid="cta-button"
      data-variant={variant}
      onClick={onClick}
      className={className}
    >
      {text}
    </button>
  ),
}));

describe('PricingCard Component', () => {
  // Sample plan data for testing
  const basicPlan: PricingPlanData = {
    id: 'basic-plan',
    name: 'Basic Plan',
    monthlyPrice: 17,
    yearlyPrice: 228,
    description: 'Perfect for small teams',
    features: [
      { text: 'Feature 1', included: true },
      { text: 'Feature 2', included: false },
    ],
    cta: {
      text: 'Get Started',
      variant: 'outline',
    },
  };

  const proPlan: PricingPlanData = {
    id: 'pro-plan',
    name: 'Pro Plan',
    monthlyPrice: 19,
    yearlyPrice: 228,
    originalPrice: 26,
    savingsPercentage: 27,
    badge: {
      text: 'Save 27%',
      color: 'yellow',
    },
    description: 'Best for growing teams',
    features: [
      { text: 'Everything in Basic', included: true },
      { text: 'Advanced Feature', included: true },
    ],
    cta: {
      text: 'Start Free Trial',
      variant: 'primary',
    },
    isHighlighted: true,
  };

  const popularPlan: PricingPlanData = {
    id: 'popular-plan',
    name: 'Enterprise Plan',
    monthlyPrice: 34,
    yearlyPrice: 408,
    badge: {
      text: 'Popular',
      color: 'green',
    },
    features: [
      { text: 'All Features', included: true },
    ],
    cta: {
      text: 'Contact Sales',
      variant: 'primary',
    },
  };

  describe('Card Rendering with All Props', () => {
    it('should render plan name', () => {
      const mockOnSelect = jest.fn();
      render(
        <PricingCard
          plan={basicPlan}
          billingCycle="annual"
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
    });

    it('should render plan description when provided', () => {
      const mockOnSelect = jest.fn();
      render(
        <PricingCard
          plan={basicPlan}
          billingCycle="annual"
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('Perfect for small teams')).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      const mockOnSelect = jest.fn();
      const planWithoutDescription = { ...basicPlan, description: undefined };
      render(
        <PricingCard
          plan={planWithoutDescription}
          billingCycle="annual"
          onSelect={mockOnSelect}
        />
      );

      expect(screen.queryByText('Perfect for small teams')).not.toBeInTheDocument();
    });

    it('should render yellow badge when provided', () => {
      const mockOnSelect = jest.fn();
      render(
        <PricingCard
          plan={proPlan}
          billingCycle="annual"
          onSelect={mockOnSelect}
        />
      );

      const badge = screen.getByText('Save 27%');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-yellow-400', 'text-black');
    });

    it('should render green badge with dot indicator when provided', () => {
      const mockOnSelect = jest.fn();
      render(
        <PricingCard
          plan={popularPlan}
          billingCycle="annual"
          onSelect={mockOnSelect}
        />
      );

      const badge = screen.getByText('Popular');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
      
      // Check for green dot indicator
      const dot = badge.querySelector('.bg-green-500');
      expect(dot).toBeInTheDocument();
    });
  });

  describe('Highlighted Variant Styling', () => {
    it('should apply dark gradient background for highlighted card', () => {
      const mockOnSelect = jest.fn();
      const { container } = render(
        <PricingCard
          plan={proPlan}
          billingCycle="annual"
          isHighlighted={true}
          onSelect={mockOnSelect}
        />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-gradient-to-br', 'from-[#2D2D2D]', 'to-[#1A1A1A]');
    });

    it('should apply gold border for highlighted card', () => {
      const mockOnSelect = jest.fn();
      const { container } = render(
        <PricingCard
          plan={proPlan}
          billingCycle="annual"
          isHighlighted={true}
          onSelect={mockOnSelect}
        />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('border-2', 'border-[#FFD700]');
    });

    it('should apply elevation effect for highlighted card', () => {
      const mockOnSelect = jest.fn();
      const { container } = render(
        <PricingCard
          plan={proPlan}
          billingCycle="annual"
          isHighlighted={true}
          onSelect={mockOnSelect}
        />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('lg:translate-y-[-8px]', 'z-10');
    });

    it('should apply enhanced shadow for highlighted card', () => {
      const mockOnSelect = jest.fn();
      const { container } = render(
        <PricingCard
          plan={proPlan}
          billingCycle="annual"
          isHighlighted={true}
          onSelect={mockOnSelect}
        />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('shadow-[0_8px_16px_rgba(0,0,0,0.2)]');
    });

    it('should use dark variant when plan.isHighlighted is true', () => {
      const mockOnSelect = jest.fn();
      const { container } = render(
        <PricingCard
          plan={proPlan}
          billingCycle="annual"
          onSelect={mockOnSelect}
        />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-gradient-to-br', 'from-[#2D2D2D]', 'to-[#1A1A1A]');
    });

    it('should apply light gradient background for non-highlighted card', () => {
      const mockOnSelect = jest.fn();
      const { container } = render(
        <PricingCard
          plan={basicPlan}
          billingCycle="annual"
          onSelect={mockOnSelect}
        />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-gradient-to-br', 'from-[#FFF9F0]');
    });

    it('should apply light border for non-highlighted card', () => {
      const mockOnSelect = jest.fn();
      const { container } = render(
        <PricingCard
          plan={basicPlan}
          billingCycle="annual"
          onSelect={mockOnSelect}
        />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('border', 'border-gray-200');
    });

    it('should not apply elevation for non-highlighted card', () => {
      const mockOnSelect = jest.fn();
      const { container } = render(
        <PricingCard
          plan={basicPlan}
          billingCycle="annual"
          onSelect={mockOnSelect}
        />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('z-0');
      expect(card).not.toHaveClass('lg:translate-y-[-8px]');
    });

    it('should render white text for highlighted card', () => {
      const mockOnSelect = jest.fn();
      render(
        <PricingCard
          plan={proPlan}
          billingCycle="annual"
          isHighlighted={true}
          onSelect={mockOnSelect}
        />
      );

      const planName = screen.getByText('Pro Plan');
      expect(planName).toHaveClass('text-white');
    });

    it('should render dark text for non-highlighted card', () => {
      const mockOnSelect = jest.fn();
      render(
        <PricingCard
          plan={basicPlan}
          billingCycle="annual"
          onSelect={mockOnSelect}
        />
      );

      const planName = screen.getByText('Basic Plan');
      expect(planName).toHaveClass('text-gray-900');
    });
  });

  describe('Feature List Integration', () => {
    it('should render FeatureList component', () => {
      const mockOnSelect = jest.fn();
      render(
        <PricingCard
          plan={basicPlan}
          billingCycle="annual"
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByTestId('feature-list')).toBeInTheDocument();
    });

    it('should pass features to FeatureList component', () => {
      const mockOnSelect = jest.fn();
      render(
        <PricingCard
          plan={basicPlan}
          billingCycle="annual"
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('Feature 1: included')).toBeInTheDocument();
      expect(screen.getByText('Feature 2: not included')).toBeInTheDocument();
    });

    it('should pass light variant to FeatureList for non-highlighted card', () => {
      const mockOnSelect = jest.fn();
      render(
        <PricingCard
          plan={basicPlan}
          billingCycle="annual"
          onSelect={mockOnSelect}
        />
      );

      const featureList = screen.getByTestId('feature-list');
      expect(featureList).toHaveAttribute('data-variant', 'light');
    });

    it('should pass dark variant to FeatureList for highlighted card', () => {
      const mockOnSelect = jest.fn();
      render(
        <PricingCard
          plan={proPlan}
          billingCycle="annual"
          isHighlighted={true}
          onSelect={mockOnSelect}
        />
      );

      const featureList = screen.getByTestId('feature-list');
      expect(featureList).toHaveAttribute('data-variant', 'dark');
    });
  });

  describe('Price Display Integration', () => {
    it('should render PriceDisplay component', () => {
      const mockOnSelect = jest.fn();
      render(
        <PricingCard
          plan={basicPlan}
          billingCycle="annual"
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByTestId('price-display')).toBeInTheDocument();
    });

    it('should pass correct billing cycle to PriceDisplay', () => {
      const mockOnSelect = jest.fn();
      render(
        <PricingCard
          plan={basicPlan}
          billingCycle="annual"
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText(/228 yearly/)).toBeInTheDocument();
    });

    it('should update PriceDisplay when billing cycle changes', () => {
      const mockOnSelect = jest.fn();
      const { rerender } = render(
        <PricingCard
          plan={basicPlan}
          billingCycle="annual"
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText(/228 yearly/)).toBeInTheDocument();

      rerender(
        <PricingCard
          plan={basicPlan}
          billingCycle="monthly"
          onSelect={mockOnSelect}
        />
      );

      expect(screen.queryByText(/228 yearly/)).not.toBeInTheDocument();
    });

    it('should pass light variant to PriceDisplay for non-highlighted card', () => {
      const mockOnSelect = jest.fn();
      render(
        <PricingCard
          plan={basicPlan}
          billingCycle="annual"
          onSelect={mockOnSelect}
        />
      );

      const priceDisplay = screen.getByTestId('price-display');
      expect(priceDisplay).toHaveAttribute('data-variant', 'light');
    });

    it('should pass dark variant to PriceDisplay for highlighted card', () => {
      const mockOnSelect = jest.fn();
      render(
        <PricingCard
          plan={proPlan}
          billingCycle="annual"
          isHighlighted={true}
          onSelect={mockOnSelect}
        />
      );

      const priceDisplay = screen.getByTestId('price-display');
      expect(priceDisplay).toHaveAttribute('data-variant', 'dark');
    });
  });

  describe('CTA Button Click Handling', () => {
    it('should render CTAButton component', () => {
      const mockOnSelect = jest.fn();
      render(
        <PricingCard
          plan={basicPlan}
          billingCycle="annual"
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByTestId('cta-button')).toBeInTheDocument();
    });

    it('should display correct CTA text', () => {
      const mockOnSelect = jest.fn();
      render(
        <PricingCard
          plan={basicPlan}
          billingCycle="annual"
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('Get Started')).toBeInTheDocument();
    });

    it('should pass correct variant to CTAButton', () => {
      const mockOnSelect = jest.fn();
      render(
        <PricingCard
          plan={basicPlan}
          billingCycle="annual"
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByTestId('cta-button');
      expect(button).toHaveAttribute('data-variant', 'outline');
    });

    it('should call onSelect with plan id when CTA button is clicked', () => {
      const mockOnSelect = jest.fn();
      render(
        <PricingCard
          plan={basicPlan}
          billingCycle="annual"
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByTestId('cta-button');
      fireEvent.click(button);

      expect(mockOnSelect).toHaveBeenCalledWith('basic-plan');
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });

    it('should call onSelect with correct plan id for different plans', () => {
      const mockOnSelect = jest.fn();
      render(
        <PricingCard
          plan={proPlan}
          billingCycle="annual"
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByTestId('cta-button');
      fireEvent.click(button);

      expect(mockOnSelect).toHaveBeenCalledWith('pro-plan');
    });

    it('should apply full width class to CTA button', () => {
      const mockOnSelect = jest.fn();
      render(
        <PricingCard
          plan={basicPlan}
          billingCycle="annual"
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByTestId('cta-button');
      expect(button).toHaveClass('w-full');
    });

    it('should handle multiple clicks on CTA button', () => {
      const mockOnSelect = jest.fn();
      render(
        <PricingCard
          plan={basicPlan}
          billingCycle="annual"
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByTestId('cta-button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockOnSelect).toHaveBeenCalledTimes(3);
      expect(mockOnSelect).toHaveBeenCalledWith('basic-plan');
    });
  });
});
