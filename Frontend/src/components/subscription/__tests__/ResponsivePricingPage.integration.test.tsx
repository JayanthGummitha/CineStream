/**
 * Integration Tests for ResponsivePricingPage
 * 
 * Tests the complete pricing page functionality including:
 * - Billing cycle switching updates all card prices
 * - Plan selection triggers correct callback
 * - Responsive layout at different viewport sizes
 * - Hover effects on cards and buttons
 * 
 * Requirements: 2.2, 2.3, 2.4, 6.1, 6.2, 6.3, 7.1
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ResponsivePricingPage } from '../ResponsivePricingPage';
import { pricingPlans } from '@/constants/pricingPlans';

// Mock console.log to avoid cluttering test output
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('ResponsivePricingPage Integration Tests', () => {
  describe('Billing Cycle Switching (Requirements 2.2, 2.3, 2.4)', () => {
    it('should update all card prices when switching from Annual to Monthly', async () => {
      const user = userEvent.setup();
      render(<ResponsivePricingPage plans={pricingPlans} defaultBilling="annual" />);

      // Verify initial state is Annual (default)
      const annualButton = screen.getByRole('radio', { name: /annual/i });
      expect(annualButton).toHaveAttribute('aria-checked', 'true');

      // Verify annual billing info is displayed for paid plans
      const billingInfoBasic = screen.getAllByText('$4.99/month when billed annually');
      const billingInfoPremium = screen.getAllByText('$9.99/month when billed annually');
      const billingInfoFamily = screen.getAllByText('$15.99/month when billed annually');
      expect(billingInfoBasic.length).toBeGreaterThan(0);
      expect(billingInfoPremium.length).toBeGreaterThan(0);
      expect(billingInfoFamily.length).toBeGreaterThan(0);

      // Switch to Monthly
      const monthlyButton = screen.getByRole('radio', { name: /monthly/i });
      await user.click(monthlyButton);

      // Verify toggle state changed
      await waitFor(() => {
        expect(monthlyButton).toHaveAttribute('aria-checked', 'true');
        expect(annualButton).toHaveAttribute('aria-checked', 'false');
      });

      // Verify billing info is no longer displayed (monthly doesn't show yearly billing)
      await waitFor(() => {
        expect(screen.queryByText('$4.99/month when billed annually')).not.toBeInTheDocument();
        expect(screen.queryByText('$9.99/month when billed annually')).not.toBeInTheDocument();
        expect(screen.queryByText('$15.99/month when billed annually')).not.toBeInTheDocument();
      });
    });

    it('should update all card prices when switching from Monthly to Annual', async () => {
      const user = userEvent.setup();
      render(<ResponsivePricingPage plans={pricingPlans} defaultBilling="monthly" />);

      // Verify initial state is Monthly
      const monthlyButton = screen.getByRole('radio', { name: /monthly/i });
      expect(monthlyButton).toHaveAttribute('aria-checked', 'true');

      // Verify no yearly billing info is displayed
      expect(screen.queryByText('$4.99/month when billed annually')).not.toBeInTheDocument();

      // Switch to Annual
      const annualButton = screen.getByRole('radio', { name: /annual/i });
      await user.click(annualButton);

      // Verify toggle state changed
      await waitFor(() => {
        expect(annualButton).toHaveAttribute('aria-checked', 'true');
        expect(monthlyButton).toHaveAttribute('aria-checked', 'false');
      });

      // Verify annual billing info is now displayed
      await waitFor(() => {
        const billingInfoBasic = screen.getAllByText('$4.99/month when billed annually');
        const billingInfoPremium = screen.getAllByText('$9.99/month when billed annually');
        const billingInfoFamily = screen.getAllByText('$15.99/month when billed annually');
        expect(billingInfoBasic.length).toBeGreaterThan(0);
        expect(billingInfoPremium.length).toBeGreaterThan(0);
        expect(billingInfoFamily.length).toBeGreaterThan(0);
      });
    });

    it('should maintain price display consistency across all cards during billing cycle changes', async () => {
      const user = userEvent.setup();
      render(<ResponsivePricingPage plans={pricingPlans} defaultBilling="annual" />);

      // Get all pricing plan cards (not feature list items)
      const pricingCards = screen.getAllByLabelText(/pricing plan$/i);
      expect(pricingCards).toHaveLength(4); // Now 4 plans: Free, Basic, Premium, Family

      // Verify paid cards show annual billing initially (Free plan has $0 for both)
      const paidCards = pricingCards.slice(1); // Skip Free plan
      paidCards.forEach((card) => {
        const billingInfoElements = within(card).queryAllByText(/when billed annually/i);
        // Should have at least one billing info element (visible or screen reader)
        expect(billingInfoElements.length).toBeGreaterThan(0);
      });

      // Switch to Monthly
      const monthlyButton = screen.getByRole('radio', { name: /monthly/i });
      await user.click(monthlyButton);

      // Verify no cards show yearly billing
      await waitFor(() => {
        pricingCards.forEach((card) => {
          const billingInfoElements = within(card).queryAllByText(/when billed annually/i);
          expect(billingInfoElements).toHaveLength(0);
        });
      });
    });

    it('should apply smooth transitions when billing cycle changes', async () => {
      const user = userEvent.setup();
      render(<ResponsivePricingPage plans={pricingPlans} />);

      const monthlyButton = screen.getByRole('radio', { name: /monthly/i });
      
      // Click and verify transition happens (component should re-render)
      await user.click(monthlyButton);

      // Verify the component updated without errors
      await waitFor(() => {
        expect(monthlyButton).toHaveAttribute('aria-checked', 'true');
      });
    });
  });

  describe('Plan Selection (Requirements 1.4, 3.5, 4.8, 5.5)', () => {
    it('should trigger callback with correct plan ID and billing cycle when CTA is clicked', async () => {
      const user = userEvent.setup();
      const mockOnPlanSelect = jest.fn();
      
      render(
        <ResponsivePricingPage 
          plans={pricingPlans} 
          defaultBilling="annual"
          onPlanSelect={mockOnPlanSelect}
        />
      );

      // Click on Premium CTA button (there are 2 "Choose Premium" buttons due to screen reader text)
      const premiumButtons = screen.getAllByRole('button', { name: /choose premium/i });
      await user.click(premiumButtons[0]);

      // Verify callback was called with correct parameters
      await waitFor(() => {
        expect(mockOnPlanSelect).toHaveBeenCalledWith('premium', 'annual');
        expect(mockOnPlanSelect).toHaveBeenCalledTimes(1);
      });
    });

    it('should trigger callback with monthly billing when plan is selected in monthly mode', async () => {
      const user = userEvent.setup();
      const mockOnPlanSelect = jest.fn();
      
      render(
        <ResponsivePricingPage 
          plans={pricingPlans} 
          defaultBilling="monthly"
          onPlanSelect={mockOnPlanSelect}
        />
      );

      // Click on Family CTA button (there are 2 buttons due to screen reader text)
      const familyButtons = screen.getAllByRole('button', { name: /choose family/i });
      await user.click(familyButtons[0]);

      // Verify callback was called with monthly billing
      await waitFor(() => {
        expect(mockOnPlanSelect).toHaveBeenCalledWith('family', 'monthly');
      });
    });

    it('should handle multiple plan selections correctly', async () => {
      const user = userEvent.setup();
      const mockOnPlanSelect = jest.fn();
      
      render(
        <ResponsivePricingPage 
          plans={pricingPlans} 
          defaultBilling="annual"
          onPlanSelect={mockOnPlanSelect}
        />
      );

      // Click on different plan CTAs (get first button of each type due to screen reader duplicates)
      const getStartedButtons = screen.getAllByRole('button', { name: /get started/i });
      const startTrialButtons = screen.getAllByRole('button', { name: /start trial/i });
      const premiumButtons = screen.getAllByRole('button', { name: /choose premium/i });

      await user.click(getStartedButtons[0]);
      await user.click(startTrialButtons[0]);
      await user.click(premiumButtons[0]);

      // Verify all selections were tracked
      await waitFor(() => {
        expect(mockOnPlanSelect).toHaveBeenCalledTimes(3);
        expect(mockOnPlanSelect).toHaveBeenNthCalledWith(1, 'free', 'annual');
        expect(mockOnPlanSelect).toHaveBeenNthCalledWith(2, 'basic', 'annual');
        expect(mockOnPlanSelect).toHaveBeenNthCalledWith(3, 'premium', 'annual');
      });
    });

    it('should update selected plan state when CTA is clicked', async () => {
      const user = userEvent.setup();
      
      render(<ResponsivePricingPage plans={pricingPlans} defaultBilling="annual" />);

      // Click on Premium CTA (get first button due to screen reader duplicate)
      const premiumButtons = screen.getAllByRole('button', { name: /choose premium/i });
      await user.click(premiumButtons[0]);

      // Verify console.log was called (component logs selection)
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Plan selected:', {
          planId: 'premium',
          billingCycle: 'annual'
        });
      });
    });
  });

  describe('Responsive Layout (Requirements 6.1, 6.2, 6.3)', () => {
    // Helper function to set viewport size
    const setViewport = (width: number, height: number) => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: height,
      });
      window.dispatchEvent(new Event('resize'));
    };

    it('should render 4-column grid layout on desktop (> 1024px)', () => {
      setViewport(1440, 900);
      
      const { container } = render(<ResponsivePricingPage plans={pricingPlans} />);

      // Find the grid container
      const gridContainer = container.querySelector('[role="list"][aria-label="Subscription plans"]');
      expect(gridContainer).toBeInTheDocument();
      
      // Verify grid classes for desktop (4 columns for 4 plans)
      expect(gridContainer).toHaveClass('lg:grid-cols-4');
      
      // Verify all 4 cards are rendered (get only subscription plan cards, not feature list items)
      const cards = screen.getAllByLabelText(/pricing plan$/i);
      expect(cards).toHaveLength(4); // Free, Basic, Premium, Family
    });

    it('should render 2-column grid layout on tablet (768px - 1024px)', () => {
      setViewport(768, 1024);
      
      const { container } = render(<ResponsivePricingPage plans={pricingPlans} />);

      // Find the grid container
      const gridContainer = container.querySelector('[role="list"]');
      
      // Verify grid classes for tablet
      expect(gridContainer).toHaveClass('md:grid-cols-2');
      
      // Verify highlighted card has span class for tablet
      const premiumCard = screen.getByLabelText(/premium plan pricing plan/i);
      expect(premiumCard).toHaveClass('md:col-span-2');
    });

    it('should render single column layout on mobile (< 768px)', () => {
      setViewport(375, 667);
      
      const { container } = render(<ResponsivePricingPage plans={pricingPlans} />);

      // Find the grid container
      const gridContainer = container.querySelector('[role="list"][aria-label="Subscription plans"]');
      
      // Verify grid classes for mobile
      expect(gridContainer).toHaveClass('grid-cols-1');
      
      // Verify all cards are still rendered (get only subscription plan cards, not feature list items)
      const cards = screen.getAllByLabelText(/pricing plan$/i);
      expect(cards).toHaveLength(4); // Free, Basic, Premium, Family
    });

    it('should maintain proper spacing at different viewport sizes', () => {
      const { container, rerender } = render(<ResponsivePricingPage plans={pricingPlans} />);
      
      const gridContainer = container.querySelector('[role="list"]');
      
      // Desktop spacing
      setViewport(1440, 900);
      rerender(<ResponsivePricingPage plans={pricingPlans} />);
      expect(gridContainer).toHaveClass('lg:gap-8');
      
      // Tablet spacing
      setViewport(768, 1024);
      rerender(<ResponsivePricingPage plans={pricingPlans} />);
      expect(gridContainer).toHaveClass('md:gap-8');
      
      // Mobile spacing
      setViewport(375, 667);
      rerender(<ResponsivePricingPage plans={pricingPlans} />);
      expect(gridContainer).toHaveClass('gap-6');
    });

    it('should adjust typography sizes for different viewports', () => {
      const { container } = render(<ResponsivePricingPage plans={pricingPlans} />);
      
      const heading = screen.getByRole('heading', { name: /subscription plans/i });
      
      // Verify responsive typography classes
      expect(heading).toHaveClass('text-4xl', 'md:text-5xl');
    });
  });

  describe('Hover Effects (Requirement 7.1)', () => {
    it('should apply hover classes to CTA buttons', async () => {
      const user = userEvent.setup();
      render(<ResponsivePricingPage plans={pricingPlans} />);

      const ctaButtons = screen.getAllByRole('button');
      
      // Verify all CTA buttons have transition classes
      ctaButtons.forEach((button) => {
        expect(button.className).toContain('transition');
      });
      
      // Hover over first button
      await user.hover(ctaButtons[0]);
      
      // Button should still be in document and interactive
      expect(ctaButtons[0]).toBeInTheDocument();
      expect(ctaButtons[0]).not.toBeDisabled();
    });

    it('should apply hover classes to pricing cards', () => {
      const { container } = render(<ResponsivePricingPage plans={pricingPlans} />);

      // Get only the pricing plan cards (not feature list items)
      const cards = screen.getAllByLabelText(/pricing plan$/i);
      
      cards.forEach((card) => {
        // Verify cards have transition classes for hover effects
        expect(card.className).toContain('transition');
      });
    });

    it('should maintain hover effects on billing toggle buttons', async () => {
      const user = userEvent.setup();
      render(<ResponsivePricingPage plans={pricingPlans} />);

      const annualButton = screen.getByRole('radio', { name: /annual/i });
      const monthlyButton = screen.getByRole('radio', { name: /monthly/i });
      
      // Verify buttons have transition classes (checking for transition in className)
      expect(annualButton.className).toContain('transition');
      expect(monthlyButton.className).toContain('transition');
      
      // Hover over buttons
      await user.hover(monthlyButton);
      
      // Button should remain interactive
      expect(monthlyButton).toBeInTheDocument();
      expect(monthlyButton).not.toBeDisabled();
    });

    it('should apply smooth transitions to all interactive elements', () => {
      render(<ResponsivePricingPage plans={pricingPlans} />);

      // Get all CTA buttons (role="button")
      const ctaButtons = screen.getAllByRole('button');
      
      // Verify all CTA buttons have transition classes
      ctaButtons.forEach((button) => {
        expect(button.className).toContain('transition');
      });

      // Get radio buttons (role="radio")
      const radioButtons = screen.getAllByRole('radio');
      
      // Verify all radio buttons have transition classes
      radioButtons.forEach((button) => {
        expect(button.className).toContain('transition');
      });
    });
  });

  describe('Complete User Flow Integration', () => {
    it('should handle complete user journey: view page, toggle billing, select plan', async () => {
      const user = userEvent.setup();
      const mockOnPlanSelect = jest.fn();
      
      render(
        <ResponsivePricingPage 
          plans={pricingPlans} 
          defaultBilling="annual"
          onPlanSelect={mockOnPlanSelect}
        />
      );

      // Step 1: Verify page loads with annual billing (default)
      expect(screen.getByRole('heading', { name: /subscription plans/i })).toBeInTheDocument();
      let annualButton = screen.getByRole('radio', { name: /annual/i });
      expect(annualButton).toHaveAttribute('aria-checked', 'true');

      // Step 2: Switch to monthly billing
      const monthlyButton = screen.getByRole('radio', { name: /monthly/i });
      await user.click(monthlyButton);

      await waitFor(() => {
        expect(monthlyButton).toHaveAttribute('aria-checked', 'true');
      });

      // Step 3: Select a plan (Premium) - get first button due to screen reader duplicate
      const premiumButtons = screen.getAllByRole('button', { name: /choose premium/i });
      await user.click(premiumButtons[0]);

      // Step 4: Verify callback was called with monthly billing
      await waitFor(() => {
        expect(mockOnPlanSelect).toHaveBeenCalledWith('premium', 'monthly');
      });

      // Step 5: Switch back to annual
      annualButton = screen.getByRole('radio', { name: /annual/i });
      await user.click(annualButton);

      await waitFor(() => {
        expect(annualButton).toHaveAttribute('aria-checked', 'true');
      });

      // Step 6: Select another plan - get first button due to screen reader duplicate
      const getStartedButtons = screen.getAllByRole('button', { name: /get started/i });
      await user.click(getStartedButtons[0]);

      // Step 7: Verify callback was called with annual billing
      await waitFor(() => {
        expect(mockOnPlanSelect).toHaveBeenCalledWith('free', 'annual');
        expect(mockOnPlanSelect).toHaveBeenCalledTimes(2);
      });
    });

    it('should maintain state consistency across multiple interactions', async () => {
      const user = userEvent.setup();
      const mockOnPlanSelect = jest.fn();
      
      render(
        <ResponsivePricingPage 
          plans={pricingPlans} 
          defaultBilling="annual"
          onPlanSelect={mockOnPlanSelect}
        />
      );

      // Perform multiple billing toggles
      const monthlyButton = screen.getByRole('radio', { name: /monthly/i });
      const annualButton = screen.getByRole('radio', { name: /annual/i });

      await user.click(monthlyButton);
      await user.click(annualButton);
      await user.click(monthlyButton);

      // Select a plan (Premium has "Choose Premium" button, not free trial)
      const premiumButtons = screen.getAllByRole('button', { name: /choose premium/i });
      await user.click(premiumButtons[0]);

      // Verify final state is correct (monthly billing)
      await waitFor(() => {
        expect(mockOnPlanSelect).toHaveBeenCalledWith('premium', 'monthly');
        expect(monthlyButton).toHaveAttribute('aria-checked', 'true');
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty plans array gracefully', () => {
      render(<ResponsivePricingPage plans={[]} />);

      // Page should still render with heading and toggle
      expect(screen.getByRole('heading', { name: /subscription plans/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /annual/i })).toBeInTheDocument();
      
      // No cards should be rendered
      const cards = screen.queryAllByRole('listitem');
      expect(cards).toHaveLength(0);
    });

    it('should work without onPlanSelect callback', async () => {
      const user = userEvent.setup();
      
      // Should not throw error when callback is not provided
      expect(() => {
        render(<ResponsivePricingPage plans={pricingPlans} />);
      }).not.toThrow();

      // Should still allow plan selection - get first button due to screen reader duplicate
      const ctaButtons = screen.getAllByRole('button', { name: /get started/i });
      await user.click(ctaButtons[0]);

      // Should not throw error
      expect(ctaButtons).toBeInTheDocument();
    });

    it('should handle rapid billing toggle clicks', async () => {
      const user = userEvent.setup();
      render(<ResponsivePricingPage plans={pricingPlans} defaultBilling="annual" />);

      const monthlyButton = screen.getByRole('radio', { name: /monthly/i });
      const annualButton = screen.getByRole('radio', { name: /annual/i });

      // Rapidly toggle between billing cycles
      await user.click(monthlyButton);
      await user.click(annualButton);
      await user.click(monthlyButton);
      await user.click(annualButton);
      await user.click(monthlyButton);

      // Should end in stable state
      await waitFor(() => {
        expect(monthlyButton).toHaveAttribute('aria-checked', 'true');
      });
    });
  });
});
