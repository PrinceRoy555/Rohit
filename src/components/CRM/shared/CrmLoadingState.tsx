import React from 'react';

export const CrmLoadingState: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 space-y-3 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-purple-100/70 dark:bg-purple-950/40" />
              <div className="w-12 h-4 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="w-20 h-3 rounded bg-slate-200/80 dark:bg-slate-800" />
            <div className="w-24 h-6 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>

      {/* Control Bar Skeleton */}
      <div className="h-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs" />

      {/* Table Skeleton */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 space-y-3 shadow-2xs">
        <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
        {Array.from({ length: rows }).map((_, idx) => (
          <div
            key={idx}
            className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50"
          />
        ))}
      </div>
    </div>
  );
};
