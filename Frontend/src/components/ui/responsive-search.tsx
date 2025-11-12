import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './input';
import { Button } from './button';

export interface ResponsiveSearchProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onClear?: () => void;
  className?: string;
  variant?: 'default' | 'overlay' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  showClearButton?: boolean;
  autoFocus?: boolean;
}

const ResponsiveSearch = React.forwardRef<HTMLDivElement, ResponsiveSearchProps>(
  ({
    placeholder = "Search...",
    value = "",
    onChange,
    onSubmit,
    onClear,
    className,
    variant = 'default',
    size = 'md',
    showClearButton = true,
    autoFocus = false,
    ...props
  }, ref) => {
    const [searchValue, setSearchValue] = React.useState(value);

    React.useEffect(() => {
      setSearchValue(value);
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setSearchValue(newValue);
      onChange?.(newValue);
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit?.(searchValue);
    };

    const handleClear = () => {
      setSearchValue("");
      onChange?.("");
      onClear?.();
    };

    const sizeClasses = {
      sm: {
        container: 'h-8 sm:h-9',
        input: 'h-8 sm:h-9 text-xs sm:text-sm pl-8 sm:pl-9 pr-8 sm:pr-9',
        icon: 'h-3 w-3 sm:h-4 sm:w-4',
        iconContainer: 'left-2 sm:left-2.5',
        clearButton: 'right-1 sm:right-1.5 h-6 w-6 sm:h-7 sm:w-7',
      },
      md: {
        container: 'h-10 sm:h-11 md:h-12',
        input: 'h-10 sm:h-11 md:h-12 text-sm sm:text-base pl-10 sm:pl-12 pr-10 sm:pr-12',
        icon: 'h-4 w-4 sm:h-5 sm:w-5',
        iconContainer: 'left-3 sm:left-4',
        clearButton: 'right-2 sm:right-3 h-8 w-8 sm:h-9 sm:w-9',
      },
      lg: {
        container: 'h-12 sm:h-14 md:h-16',
        input: 'h-12 sm:h-14 md:h-16 text-base sm:text-lg pl-12 sm:pl-16 pr-12 sm:pr-16',
        icon: 'h-5 w-5 sm:h-6 sm:w-6',
        iconContainer: 'left-4 sm:left-6',
        clearButton: 'right-3 sm:right-4 h-10 w-10 sm:h-12 sm:w-12',
      },
    };

    const variantClasses = {
      default: 'bg-background border-input',
      overlay: 'bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60',
      inline: 'bg-muted/50 border-muted',
    };

    const currentSize = sizeClasses[size];

    return (
      <div
        ref={ref}
        className={cn('relative w-full', currentSize.container, className)}
        {...props}
      >
        <form onSubmit={handleSubmit} className="relative w-full h-full">
          {/* Search Icon */}
          <div className={cn(
            'absolute top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none z-10',
            variant === 'overlay' && 'text-white/60',
            currentSize.iconContainer
          )}>
            <Search className={currentSize.icon} />
          </div>

          {/* Search Input */}
          <Input
            type="search"
            placeholder={placeholder}
            value={searchValue}
            onChange={handleInputChange}
            autoFocus={autoFocus}
            responsive={false} // We're handling responsive sizing manually
            className={cn(
              'w-full rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-ring/20',
              variantClasses[variant],
              currentSize.input,
              variant === 'overlay' && 'focus:border-white/40 focus:bg-white/15',
            )}
            aria-label="Search input"
          />

          {/* Clear Button */}
          {showClearButton && searchValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className={cn(
                'absolute top-1/2 transform -translate-y-1/2 rounded-full transition-all duration-300 hover:bg-muted/80 focus:ring-2 focus:ring-ring/20',
                variant === 'overlay' && 'text-white/60 hover:text-white hover:bg-white/10',
                currentSize.clearButton
              )}
              aria-label="Clear search"
            >
              <X className={currentSize.icon} />
            </Button>
          )}
        </form>
      </div>
    );
  }
);

ResponsiveSearch.displayName = 'ResponsiveSearch';

export { ResponsiveSearch };