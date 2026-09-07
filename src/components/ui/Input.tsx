import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-text-secondary select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-text-muted pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={`w-full h-10 px-3.5 ${leftIcon ? 'pl-9' : ''} ${
              rightIcon ? 'pr-9' : ''
            } rounded-lg bg-bg-primary text-text-primary placeholder:text-text-muted/60 text-sm border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary disabled:opacity-50 disabled:bg-bg-secondary disabled:cursor-not-allowed ${
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                : 'border-border-color hover:border-text-primary/30'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-text-muted flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
