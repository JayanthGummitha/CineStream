import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FormLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  layout?: 'stack' | 'inline' | 'responsive';
  gap?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const FormLayout = React.forwardRef<HTMLDivElement, FormLayoutProps>(
  ({ className, layout = 'responsive', gap = 'md', children, ...props }, ref) => {
    const gapClasses = {
      sm: 'gap-2 sm:gap-3',
      md: 'gap-3 sm:gap-4 md:gap-5',
      lg: 'gap-4 sm:gap-5 md:gap-6',
    };

    const layoutClasses = {
      stack: 'flex flex-col',
      inline: 'flex flex-row flex-wrap',
      responsive: 'flex flex-col sm:flex-row sm:flex-wrap',
    };

    return (
      <div
        ref={ref}
        className={cn(
          layoutClasses[layout],
          gapClasses[gap],
          'items-start',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FormLayout.displayName = 'FormLayout';

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  error?: string;
  required?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, label, error, required, fullWidth = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col',
          fullWidth ? 'w-full' : 'w-full sm:w-auto sm:flex-1 sm:min-w-0',
          className
        )}
        {...props}
      >
        {label && (
          <label className="block micro-text font-medium text-muted-foreground mb-1 sm:mb-2">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        {children}
        {error && (
          <p className="text-destructive text-xs sm:text-sm mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export interface ResponsiveFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  layout?: 'stack' | 'inline' | 'responsive';
  gap?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const ResponsiveForm = React.forwardRef<HTMLFormElement, ResponsiveFormProps>(
  ({ className, layout = 'responsive', gap = 'md', children, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={cn('w-full', className)}
        {...props}
      >
        <FormLayout layout={layout} gap={gap}>
          {children}
        </FormLayout>
      </form>
    );
  }
);

ResponsiveForm.displayName = 'ResponsiveForm';

export { FormLayout, FormField, ResponsiveForm };