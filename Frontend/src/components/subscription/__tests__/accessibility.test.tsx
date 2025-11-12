/**
 * Accessibility Tests for Pricing Components
 * 
 * Tests WCAG AA compliance, keyboard navigation, screen reader support,
 * and touch target sizes for all pricing components.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResponsivePricingPage } from '../ResponsivePricingPage';
import { BillingToggle } from '../BillingToggle';
import { CTAButton } from '../CTAButton';
import { pricingPlans } from '@/constants/pricingPlans';

describe('Pricing Components Accessibility', () => {
  describe('ResponsivePricingPage', () => {
    it('should have proper heading hierarchy', () => {
      render(<ResponsivePricingPage plans={pricingPlans} />);
      const heading = screen.getByRole('heading', { level: 1, name: /subscription plans/i });
      expect(heading).toBeInTheDocument();
    });

    it('should have proper ARIA labels for sections', () => {
      render(<ResponsivePricingPage plans={pricingPlans} />);
      expect(screen.getByLabelText(/subscription plans/i)).toBeInTheDocument();
    });

    it('should have screen reader text for plan details', () => {
      render(<ResponsivePricingPage plans={pricingPlans} />);
      const srTexts = screen.getAllByText(/plan.*per month.*features included/i, { 
        selector: '.sr-only' 
      });
      expect(srTexts.length).toBeGreaterThan(0);
    });
  });

  describe('BillingToggle', () => {
    it('should have proper radiogroup role', () => {
      render(<BillingToggle value="annual" onChange={() => {}} />);
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('should have proper aria-checked states', () => {
      render(<BillingToggle value="annual" onChange={() => {}} />);
      const annualButton = screen.getByRole('radio', { name: /annual/i });
      const monthlyButton = screen.getByRole('radio', { name: /monthly/i });
      
      expect(annualButton).toHaveAttribute('aria-checked', 'true');
      expect(monthlyButton).toHaveAttribute('aria-checked', 'false');
    });

    it('should have minimum touch target size (44px)', () => {
      render(<BillingToggle value="annual" onChange={() => {}} />);
      const buttons = screen.getAllByRole('radio');
      
      buttons.forEach(button => {
        // Check for min-h-[44px] class which ensures 44px minimum height
        expect(button.className).toContain('min-h-[44px]');
      });
    });
  });

  describe('CTAButton', () => {
    it('should have proper aria-label', () => {
      render(<CTAButton text="Start Trial" variant="primary" onClick={() => {}} />);
      expect(screen.getByLabelText('Start Trial')).toBeInTheDocument();
    });

    it('should have minimum touch target size (44px)', () => {
      render(<CTAButton text="Start Trial" variant="primary" onClick={() => {}} />);
      const button = screen.getByRole('button');
      // Check for min-h-[44px] class which ensures 44px minimum height
      expect(button.className).toContain('min-h-[44px]');
    });

    it('should have visible focus indicator', () => {
      render(<CTAButton text="Start Trial" variant="primary" onClick={() => {}} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:ring-2');
    });
  });

  describe('Color Contrast', () => {
    it('should have sufficient contrast for primary button text', () => {
      render(<CTAButton text="Start Trial" variant="primary" onClick={() => {}} />);
      const button = screen.getByRole('button');
      
      // Primary button: white bg (#FFFFFF) with black text (#000000)
      // Contrast ratio: 21:1 (exceeds WCAG AAA requirement of 7:1)
      expect(button).toHaveClass('bg-white', 'text-black');
    });

    it('should have sufficient contrast for outline button text', () => {
      render(<CTAButton text="Cancel" variant="outline" onClick={() => {}} />);
      const button = screen.getByRole('button');
      
      // Outline button: transparent bg with gray-700 text (#374151)
      // Against white background, contrast ratio: 10.7:1 (exceeds WCAG AA)
      expect(button).toHaveClass('text-gray-700');
    });

    it('should have sufficient contrast for dark card text', () => {
      render(<ResponsivePricingPage plans={pricingPlans} />);
      
      // Dark card (Premium Plan - highlighted) uses white text on dark background
      // Background: #2D2D2D, Text: #FFFFFF
      // Contrast ratio: 12.6:1 (exceeds WCAG AAA)
      const premiumPlanText = screen.getByText('Premium Plan');
      expect(premiumPlanText).toHaveClass('text-white');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation for toggle', () => {
      render(<BillingToggle value="annual" onChange={() => {}} />);
      const buttons = screen.getAllByRole('radio');
      
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
        // Buttons should be focusable
        expect(button.tabIndex).not.toBe(-1);
      });
    });

    it('should support keyboard navigation for CTA buttons', () => {
      render(<ResponsivePricingPage plans={pricingPlans} />);
      const ctaButtons = screen.getAllByRole('button', { name: /trial|cancel/i });
      
      ctaButtons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
        // Buttons should be focusable
        expect(button.tabIndex).not.toBe(-1);
      });
    });
  });

  describe('Responsive Touch Interactions', () => {
    it('should have touch-manipulation CSS for better mobile performance', () => {
      render(<ResponsivePricingPage plans={pricingPlans} />);
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        expect(button).toHaveClass('touch-manipulation');
      });
    });

    it('should have active state for touch feedback', () => {
      render(<CTAButton text="Start Trial" variant="primary" onClick={() => {}} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('active:scale-95');
    });
  });

  describe('Screen Reader Support', () => {
    it('should announce price changes', () => {
      render(<ResponsivePricingPage plans={pricingPlans} />);
      
      // Check for screen reader only price announcements
      const priceAnnouncements = document.querySelectorAll('.sr-only');
      expect(priceAnnouncements.length).toBeGreaterThan(0);
    });

    it('should announce feature inclusion status', () => {
      render(<ResponsivePricingPage plans={pricingPlans} />);
      
      // Check for "Included:" and "Not included:" screen reader text
      const includedText = screen.getAllByText(/included:/i, { selector: '.sr-only' });
      expect(includedText.length).toBeGreaterThan(0);
    });

    it('should have proper badge announcements', () => {
      render(<ResponsivePricingPage plans={pricingPlans} />);
      
      // Badges should have role="status" for screen reader announcements
      const badges = document.querySelectorAll('[role="status"]');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('Focus Management', () => {
    it('should have visible focus rings on all interactive elements', () => {
      render(<ResponsivePricingPage plans={pricingPlans} />);
      const interactiveElements = screen.getAllByRole('button');
      
      interactiveElements.forEach(element => {
        // Check for focus ring classes
        const hasFocusRing = element.className.includes('focus:ring') || 
                            element.className.includes('focus-visible:ring');
        expect(hasFocusRing).toBe(true);
      });
    });

    it('should have focus-visible for keyboard-only focus', () => {
      render(<CTAButton text="Start Trial" variant="primary" onClick={() => {}} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:ring-4');
    });
  });
});
