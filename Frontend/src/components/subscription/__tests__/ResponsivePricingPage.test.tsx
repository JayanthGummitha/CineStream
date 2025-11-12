/**
 * ResponsivePricingPage Component Tests
 * 
 * Tests for the main pricing page component including:
 * - Plan selection handling
 * - Billing cycle management
 * - Visual feedback for selected state
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResponsivePricingPage } from '../ResponsivePricingPage';
import { pricingPlans } from '@/constants/pricingPlans';

describe('ResponsivePricingPage', () => {
  describe('Plan Selection Handling', () => {
    it('should call onPlanSelect callback when CTA button is clicked', () => {
      const mockOnPlanSelect = jest.fn();

      render(
        <ResponsivePricingPage
          plans={pricingPlans}
          defaultBilling="annual"
          onPlanSelect={mockOnPlanSelect}
        />
      );

      // Find and click the first plan's CTA button (Free Plan - "Get Started")
      const getStartedButton = screen.getByRole('button', { name: /get started/i });
      fireEvent.click(getStartedButton);

      // Verify callback was called with correct arguments
      expect(mockOnPlanSelect).toHaveBeenCalledWith('free', 'annual');
    });

    it('should log plan selection to console', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      render(<ResponsivePricingPage plans={pricingPlans} defaultBilling="annual" />);

      // Click a CTA button (Basic Plan - "Start Trial")
      const startTrialButton = screen.getByRole('button', { name: /start trial/i });
      fireEvent.click(startTrialButton);

      // Verify console.log was called
      expect(consoleSpy).toHaveBeenCalledWith('Plan selected:', {
        planId: 'basic',
        billingCycle: 'annual'
      });

      consoleSpy.mockRestore();
    });

    it('should update selected plan state when CTA is clicked', () => {
      const { container } = render(<ResponsivePricingPage plans={pricingPlans} />);

      // Click the second plan's CTA button (Basic Plan)
      const startTrialButton = screen.getByRole('button', { name: /start trial/i });
      fireEvent.click(startTrialButton);

      // Check if the selected card has the gold border (visual feedback)
      const cards = container.querySelectorAll('[aria-label*="pricing plan"]');
      const selectedCard = cards[1];

      // The selected card should have border-[#FFD700] class
      expect(selectedCard.className).toContain('border-[#FFD700]');
    });

    it('should pass correct billing cycle to callback', () => {
      const mockOnPlanSelect = jest.fn();

      render(
        <ResponsivePricingPage
          plans={pricingPlans}
          onPlanSelect={mockOnPlanSelect}
        />
      );

      // Switch to monthly billing (BillingToggle uses radio role)
      const monthlyButton = screen.getByRole('radio', { name: /monthly/i });
      fireEvent.click(monthlyButton);

      // Click a plan (Premium Plan)
      const premiumButton = screen.getByRole('button', { name: /choose premium/i });
      fireEvent.click(premiumButton);

      // Verify callback was called with monthly billing cycle
      expect(mockOnPlanSelect).toHaveBeenCalledWith('premium', 'monthly');
    });

    it('should handle multiple plan selections', () => {
      const mockOnPlanSelect = jest.fn();

      render(
        <ResponsivePricingPage
          plans={pricingPlans}
          defaultBilling="annual"
          onPlanSelect={mockOnPlanSelect}
        />
      );

      const getStartedButton = screen.getByRole('button', { name: /get started/i });
      const startTrialButton = screen.getByRole('button', { name: /start trial/i });

      // Select first plan (Free)
      fireEvent.click(getStartedButton);
      expect(mockOnPlanSelect).toHaveBeenCalledWith('free', 'annual');

      // Select second plan (Basic)
      fireEvent.click(startTrialButton);
      expect(mockOnPlanSelect).toHaveBeenCalledWith('basic', 'annual');

      // Verify callback was called twice
      expect(mockOnPlanSelect).toHaveBeenCalledTimes(2);
    });
  });

  describe('Visual Feedback', () => {
    it('should apply gold border to selected card', () => {
      const { container } = render(<ResponsivePricingPage plans={pricingPlans} />);

      // Click a plan
      const ctaButtons = screen.getAllByRole('button', { name: /cancel|start/i });
      fireEvent.click(ctaButtons[0]);

      // Check for gold border on selected card
      const cards = container.querySelectorAll('[aria-label*="pricing plan"]');
      const selectedCard = cards[0];

      expect(selectedCard.className).toContain('border-[#FFD700]');
    });

    it('should only show visual feedback on one card at a time', () => {
      const { container } = render(<ResponsivePricingPage plans={pricingPlans} />);

      const ctaButtons = screen.getAllByRole('button', { name: /cancel|start/i });

      // Select first plan
      fireEvent.click(ctaButtons[0]);

      // Select second plan
      fireEvent.click(ctaButtons[1]);

      // Only the second card should have the selected state
      const cards = container.querySelectorAll('[aria-label*="pricing plan"]');

      // First card should not have gold border (unless it's highlighted)
      const firstCardClasses = cards[0].className;
      const isFirstCardHighlighted = pricingPlans[0].isHighlighted;

      if (!isFirstCardHighlighted) {
        expect(firstCardClasses).not.toContain('border-2');
      }
    });
  });
});
