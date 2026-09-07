import React, { useState } from 'react';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallbackName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  fallbackName = '',
  size = 'md',
  status,
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  const getInitials = (name: string) => {
    if (!name) return 'A';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const sizeClasses: Record<string, string> = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
    xl: 'w-14 h-14 text-base',
  };

  const statusDotSizes: Record<string, string> = {
    xs: 'w-1.5 h-1.5 ring-1',
    sm: 'w-2 h-2 ring-1.5',
    md: 'w-2.5 h-2.5 ring-2',
    lg: 'w-3 h-3 ring-2',
    xl: 'w-3.5 h-3.5 ring-2',
  };

  const statusColors: Record<string, string> = {
    online: 'bg-emerald-500',
    offline: 'bg-neutral-400',
    busy: 'bg-rose-500',
  };

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-lg overflow-hidden border border-border-color bg-bg-secondary flex items-center justify-center font-bold text-text-primary select-none`}
      >
        {src && !hasError ? (
          <img
            src={src}
            alt={alt || fallbackName}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="font-semibold text-text-secondary tracking-tight">
            {getInitials(fallbackName || alt)}
          </span>
        )}
      </div>

      {status && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 rounded-full ring-bg-card ${statusColors[status]} ${statusDotSizes[size]}`}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
