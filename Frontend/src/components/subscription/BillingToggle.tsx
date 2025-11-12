'use client';

import { BillingToggleProps } from '@/types/pricing';

/**
 * BillingToggle Component
 * 
 * A pill-shaped toggle switch for switching between Annual and Monthly billing cycles.
 * Features smooth transitions, hover effects, and full keyboard accessibility.
 * 
 * @param value - Current billing cycle ('annual' or 'monthly')
 * @param onChange - Callback function when billing cycle changes
 * @param className - Optional additional CSS classes
 */
export function BillingToggle({ value, onChange, className = '' }: BillingToggleProps) {
  return (
    <div 
      className={`inline-flex bg-white rounded-full p-1 ${className}`}
      role="radiogroup"
      aria-label="Select billing cycle"
    >
      <button
        type="button"
        role="radio"
        aria-checked={value === 'annual'}
        className={`
          min-h-[44px] px-6 py-2 rounded-full text-sm font-medium
          will-change-transform transition-[background-color,color,transform] duration-200 ease-in-out
          focus:outline-none 
          active:scale-95 touch-manipulation hover:cursor-pointer
          ${
            value === 'annual'
              ? 'bg-black text-white shadow-sm'
              : 'text-black hover:text-black'
          }
        `}
        onClick={() => onChange('annual')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onChange('annual');
          }
        }}
      >
        Annual
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === 'monthly'}
        className={`
          min-h-[44px] px-6 py-2 rounded-full text-sm font-medium
          will-change-transform transition-[background-color,color,transform] duration-200 ease-in-out
          focus:outline-none  
          active:scale-95 touch-manipulation hover:cursor-pointer
          ${
            value === 'monthly'
              ? 'bg-black text-white shadow-sm'
              : 'text-black hover:text-black '
          }
        `}
        onClick={() => onChange('monthly')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onChange('monthly');
          }
        }}
      >
        Monthly
      </button>
    </div>
  );
}
