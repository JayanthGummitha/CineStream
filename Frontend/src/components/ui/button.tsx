import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center cursor-pointer whitespace-nowrap rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-none hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'button-responsive', // Uses responsive utility class
        sm: 'h-8 rounded-md px-3 text-xs touch-target',
        lg: 'button-responsive-large', // Uses responsive large utility class
        icon: 'h-9 w-9 touch-target',
        responsive: 'button-responsive touch-target', // Explicit responsive option
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  responsive?: boolean;
  touchOptimized?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, responsive = true, touchOptimized = true, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    // Determine size based on responsive prop
    const finalSize = responsive && size === 'default' ? 'responsive' : size;
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size: finalSize }),
          // Add touch optimization if enabled
          touchOptimized && !className?.includes('touch-target') && 'touch-target',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
