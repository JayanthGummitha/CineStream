/**
 * Badge Component Tests
 * 
 * Tests for the Badge component including:
 * - Rendering with different variants
 * - Proper styling application
 * - Green dot indicator for Popular badge
 * - Accessibility attributes
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from '../Badge';

describe('Badge Component', () => {
  describe('Active Badge', () => {
    it('should render active badge with yellow background', () => {
      render(<Badge text="Active" variant="active" />);
      
      const badge = screen.getByText('Active');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-yellow-400', 'text-black');
    });

    it('should have proper accessibility attributes', () => {
      render(<Badge text="Active" variant="active" />);
      
      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('aria-label', 'Active badge');
    });

    it('should not render green dot for active badge', () => {
      const { container } = render(<Badge text="Active" variant="active" />);
      
      const greenDot = container.querySelector('.bg-green-500');
      expect(greenDot).not.toBeInTheDocument();
    });
  });

  describe('Popular Badge', () => {
    it('should render popular badge with green background', () => {
      render(<Badge text="Popular" variant="popular" />);
      
      const badge = screen.getByText('Popular');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('should render green dot indicator', () => {
      const { container } = render(<Badge text="Popular" variant="popular" />);
      
      const greenDot = container.querySelector('.bg-green-500');
      expect(greenDot).toBeInTheDocument();
      expect(greenDot).toHaveClass('w-2', 'h-2', 'rounded-full', 'animate-pulse');
    });

    it('should have aria-hidden on green dot', () => {
      const { container } = render(<Badge text="Popular" variant="popular" />);
      
      const greenDot = container.querySelector('.bg-green-500');
      expect(greenDot).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Savings Badge', () => {
    it('should render savings badge with yellow background', () => {
      render(<Badge text="Save 27%" variant="savings" />);
      
      const badge = screen.getByText('Save 27%');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-yellow-400', 'text-black');
    });

    it('should not render green dot for savings badge', () => {
      const { container } = render(<Badge text="Save 27%" variant="savings" />);
      
      const greenDot = container.querySelector('.bg-green-500');
      expect(greenDot).not.toBeInTheDocument();
    });

    it('should handle different savings percentages', () => {
      const { rerender } = render(<Badge text="Save 10%" variant="savings" />);
      expect(screen.getByText('Save 10%')).toBeInTheDocument();
      
      rerender(<Badge text="Save 50%" variant="savings" />);
      expect(screen.getByText('Save 50%')).toBeInTheDocument();
    });
  });

  describe('Common Badge Features', () => {
    it('should apply custom className', () => {
      render(<Badge text="Test" variant="active" className="custom-class" />);
      
      const badge = screen.getByText('Test');
      expect(badge).toHaveClass('custom-class');
    });

    it('should have base styling classes', () => {
      render(<Badge text="Test" variant="active" />);
      
      const badge = screen.getByText('Test');
      expect(badge).toHaveClass(
        'inline-flex',
        'items-center',
        'gap-1.5',
        'px-3',
        'py-1',
        'rounded-full',
        'text-xs',
        'font-medium'
      );
    });

    it('should render with role="status"', () => {
      render(<Badge text="Test" variant="active" />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Badge Variants Comparison', () => {
    it('should apply different styles for each variant', () => {
      const { rerender } = render(<Badge text="Test" variant="active" />);
      const activeBadge = screen.getByText('Test');
      expect(activeBadge).toHaveClass('bg-yellow-400', 'text-black');
      
      rerender(<Badge text="Test" variant="popular" />);
      const popularBadge = screen.getByText('Test');
      expect(popularBadge).toHaveClass('bg-green-100', 'text-green-800');
      
      rerender(<Badge text="Test" variant="savings" />);
      const savingsBadge = screen.getByText('Test');
      expect(savingsBadge).toHaveClass('bg-yellow-400', 'text-black');
    });
  });
});
