import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { Button, ButtonProps } from './Button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: ButtonProps['variant'];
    icon?: React.ReactNode;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-border-color bg-bg-secondary/20 ${className}`}
    >
      <div className="w-10 h-10 rounded-lg bg-bg-secondary flex items-center justify-center text-text-muted mb-3 border border-border-color/60">
        <Icon className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-bold text-text-primary mb-1 tracking-tight">{title}</h4>
      {description && (
        <p className="text-xs text-text-muted max-w-sm leading-relaxed mb-4">{description}</p>
      )}
      {action && (
        <Button
          size="sm"
          variant={action.variant || 'secondary'}
          onClick={action.onClick}
          leftIcon={action.icon}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};
