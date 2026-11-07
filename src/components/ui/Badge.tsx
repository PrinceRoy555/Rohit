import React from 'react';

export type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'outline';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  variant = 'neutral',
  size = 'md',
  dot = false,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center font-semibold rounded-md transition-colors select-none tracking-tight';

  const sizeStyles: Record<BadgeSize, string> = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1 leading-none',
    md: 'text-xs px-2 py-0.5 gap-1.5 leading-normal',
  };

  const variantStyles: Record<BadgeVariant, string> = {
    neutral: 'bg-bg-secondary text-text-muted border border-border-color',
    primary: 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    danger: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
    outline: 'bg-transparent text-text-secondary border border-border-color',
  };

  const dotColors: Record<BadgeVariant, string> = {
    neutral: 'bg-text-muted',
    primary: 'bg-accent-primary',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    outline: 'bg-text-muted',
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`} {...props}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};
