import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Base styles: clear typography, no AI slop, deliberate transition and focus ring
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/40 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer whitespace-nowrap';

    const sizeStyles: Record<ButtonSize, string> = {
      xs: 'h-7 px-2.5 text-[11px] gap-1.5',
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-11 px-5 text-sm sm:text-base gap-2.5',
    };

    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-accent-primary hover:bg-accent-secondary text-white shadow-xs border border-transparent hover:shadow-sm',
      secondary:
        'bg-bg-card hover:bg-bg-secondary text-text-primary border border-border-color hover:border-border-color/80 shadow-xs',
      outline:
        'bg-transparent hover:bg-bg-secondary text-text-primary border border-border-color hover:border-text-primary/30',
      ghost:
        'bg-transparent hover:bg-bg-secondary text-text-muted hover:text-text-primary border border-transparent',
      danger:
        'bg-red-600 hover:bg-red-700 text-white shadow-xs border border-transparent',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
