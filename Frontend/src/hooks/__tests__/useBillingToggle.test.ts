import { renderHook, act } from '@testing-library/react';
import { useBillingToggle } from '../useBillingToggle';
import { EnhancedSubscriptionPlan } from '@/types';
import { AnimationUtils } from '@/lib/animations/utils';

// Mock GSAP
jest.mock('gsap', () => ({
  gsap: {
    timeline: jest.fn(() => ({
      to: jest.fn().mockReturnThis(),
      call: jest.fn((callback) => {
        if (callback) callback();
        return {
          to: jest.fn().mockReturnThis(),
          call: jest.fn().mockReturnThis(),
        };
      }),
    })),
  },
}));

// Mock AnimationUtils
jest.mock('@/lib/animations/utils', () => ({
  AnimationUtils: {
    prefersReducedMotion: jest.fn(() => false),
  },
}));

const mockPlans: EnhancedSubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 9.99,
    yearlyPrice: 99.99,
    yearlyDiscount: 17,
    currency: 'USD',
    billing: 'monthly',
    description: 'Basic streaming plan',
    features: {
      profiles: 1,
      maxDevices: 2,
      quality: '720p',
      fullLibrary: false,
      offlineDownloads: false,
      adFree: false,
      groupWatch: false,
      prioritySupport: false,
      kidsProfiles: false,
      earlyAccess: false,
    },
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: 15.99,
    yearlyPrice: 159.99,
    yearlyDiscount: 17,
    currency: 'USD',
    billing: 'monthly',
    description: 'Premium streaming plan',
    features: {
      profiles: 3,
      maxDevices: 3,
      quality: '1080p',
      fullLibrary: true,
      offlineDownloads: 5,
      adFree: true,
      groupWatch: true,
      prioritySupport: true,
      kidsProfiles: true,
      earlyAccess: false,
    },
  },
];

describe('useBillingToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default monthly billing', () => {
    const { result } = renderHook(() =>
      useBillingToggle({ plans: mockPlans })
    );

    expect(result.current.billingCycle).toBe('monthly');
  });

  it('initializes with custom initial billing', () => {
    const { result } = renderHook(() =>
      useBillingToggle({ 
        initialBilling: 'yearly',
        plans: mockPlans 
      })
    );

    expect(result.current.billingCycle).toBe('yearly');
  });

  it('changes billing cycle correctly', () => {
    const { result } = renderHook(() =>
      useBillingToggle({ plans: mockPlans })
    );

    act(() => {
      result.current.setBillingCycle('yearly');
    });

    expect(result.current.billingCycle).toBe('yearly');
  });

  it('calls onBillingChange callback when billing changes', () => {
    const mockOnBillingChange = jest.fn();
    const { result } = renderHook(() =>
      useBillingToggle({ 
        plans: mockPlans,
        onBillingChange: mockOnBillingChange
      })
    );

    act(() => {
      result.current.setBillingCycle('yearly');
    });

    expect(mockOnBillingChange).toHaveBeenCalledWith('yearly');
  });

  it('does not call onBillingChange when setting same value', () => {
    const mockOnBillingChange = jest.fn();
    const { result } = renderHook(() =>
      useBillingToggle({ 
        plans: mockPlans,
        onBillingChange: mockOnBillingChange
      })
    );

    act(() => {
      result.current.setBillingCycle('monthly'); // Same as initial
    });

    expect(mockOnBillingChange).not.toHaveBeenCalled();
  });

  it('returns correct monthly display price', () => {
    const { result } = renderHook(() =>
      useBillingToggle({ plans: mockPlans })
    );

    const displayPrice = result.current.getDisplayPrice(mockPlans[0]);

    expect(displayPrice).toEqual({
      price: 9.99,
      period: 'month',
    });
  });

  it('returns correct yearly display price with discount', () => {
    const { result } = renderHook(() =>
      useBillingToggle({ 
        initialBilling: 'yearly',
        plans: mockPlans 
      })
    );

    const displayPrice = result.current.getDisplayPrice(mockPlans[0]);
    const expectedMonthlyEquivalent = 99.99 / 12;

    expect(displayPrice).toEqual({
      price: expectedMonthlyEquivalent,
      originalPrice: 9.99,
      discount: 17,
      period: 'month (billed yearly)',
    });
  });

  it('calculates savings amount correctly for yearly billing', () => {
    const { result } = renderHook(() =>
      useBillingToggle({ 
        initialBilling: 'yearly',
        plans: mockPlans 
      })
    );

    const savings = result.current.getSavingsAmount(mockPlans[0]);
    const expectedSavings = (9.99 * 12) - 99.99;

    expect(savings).toBeCloseTo(expectedSavings, 2);
  });

  it('returns null savings for monthly billing', () => {
    const { result } = renderHook(() =>
      useBillingToggle({ plans: mockPlans })
    );

    const savings = result.current.getSavingsAmount(mockPlans[0]);

    expect(savings).toBeNull();
  });

  it('returns null savings when plan has no yearly price', () => {
    const planWithoutYearly: EnhancedSubscriptionPlan = {
      ...mockPlans[0],
      yearlyPrice: undefined,
    };

    const { result } = renderHook(() =>
      useBillingToggle({ 
        initialBilling: 'yearly',
        plans: [planWithoutYearly] 
      })
    );

    const savings = result.current.getSavingsAmount(planWithoutYearly);

    expect(savings).toBeNull();
  });

  it('handles animatedPriceChange with callback', () => {
    const { result } = renderHook(() =>
      useBillingToggle({ plans: mockPlans })
    );

    const mockCallback = jest.fn();
    const mockElement = document.createElement('div');

    act(() => {
      result.current.animatedPriceChange(mockElement, mockCallback);
    });

    // Callback should be called during animation timeline
    expect(mockCallback).toHaveBeenCalled();
  });

  it('skips animation when reduced motion is preferred', () => {
    (AnimationUtils.prefersReducedMotion as jest.Mock).mockReturnValue(true);

    const { result } = renderHook(() =>
      useBillingToggle({ plans: mockPlans })
    );

    const mockCallback = jest.fn();
    const mockElement = document.createElement('div');

    act(() => {
      result.current.animatedPriceChange(mockElement, mockCallback);
    });

    expect(mockCallback).toHaveBeenCalled();
  });

  it('maintains referential stability of functions', () => {
    const { result, rerender } = renderHook(() =>
      useBillingToggle({ plans: mockPlans })
    );

    const firstRenderFunctions = {
      setBillingCycle: result.current.setBillingCycle,
      animatedPriceChange: result.current.animatedPriceChange,
      getDisplayPrice: result.current.getDisplayPrice,
      getSavingsAmount: result.current.getSavingsAmount,
    };

    rerender();

    expect(result.current.setBillingCycle).toBe(firstRenderFunctions.setBillingCycle);
    expect(result.current.animatedPriceChange).toBe(firstRenderFunctions.animatedPriceChange);
    expect(result.current.getDisplayPrice).toBe(firstRenderFunctions.getDisplayPrice);
    expect(result.current.getSavingsAmount).toBe(firstRenderFunctions.getSavingsAmount);
  });

  it('updates functions when billing cycle changes', () => {
    const { result } = renderHook(() =>
      useBillingToggle({ plans: mockPlans })
    );

    const monthlyDisplayPrice = result.current.getDisplayPrice(mockPlans[0]);

    act(() => {
      result.current.setBillingCycle('yearly');
    });

    const yearlyDisplayPrice = result.current.getDisplayPrice(mockPlans[0]);

    expect(monthlyDisplayPrice).not.toEqual(yearlyDisplayPrice);
  });
});