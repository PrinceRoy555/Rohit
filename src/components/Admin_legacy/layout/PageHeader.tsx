import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  actions,
  children,
  className = '',
}) => {
  const rightContent = actions || children;

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-border-color/80 ${className}`}
    >
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary truncate">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-text-muted max-w-2xl">
            {description}
          </p>
        )}
      </div>

      {rightContent && (
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          {rightContent}
        </div>
      )}
    </div>
  );
};
