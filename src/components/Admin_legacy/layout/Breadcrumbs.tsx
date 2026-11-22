import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center space-x-1.5 text-xs text-text-muted select-none ${className}`}
    >
      <div className="flex items-center gap-1.5 font-medium">
        <span className="inline-flex items-center text-text-muted hover:text-text-primary transition-colors">
          <Home className="w-3.5 h-3.5" />
        </span>
      </div>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3 h-3 text-text-muted/60 shrink-0" />
            {item.onClick && !isLast ? (
              <button
                type="button"
                onClick={item.onClick}
                className="font-medium text-text-muted hover:text-text-primary transition-colors cursor-pointer truncate max-w-[140px] sm:max-w-none"
              >
                {item.label}
              </button>
            ) : (
              <span
                className={`truncate max-w-[160px] sm:max-w-none ${
                  isLast
                    ? 'font-semibold text-text-primary'
                    : 'font-medium text-text-muted'
                }`}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
