import React, { ReactNode } from 'react';
import { LucideIcon, RefreshCw, Calendar } from 'lucide-react';

interface CrmPageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  badgeColor?: 'blue' | 'purple' | 'green' | 'amber';
  actions?: ReactNode;
  lastUpdated?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const CrmPageHeader: React.FC<CrmPageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = 'purple',
  actions,
  lastUpdated,
  onRefresh,
  isRefreshing = false
}) => {
  const badgeClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    purple: 'bg-purple-50 text-[#7c3aed] border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
  }[badgeColor];

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="flex items-start sm:items-center gap-3.5">
        {Icon && (
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6d28d9] to-[#8b5cf6] text-white flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0 mt-0.5 sm:mt-0">
            <Icon className="w-5 h-5 stroke-[2.2]" />
          </div>
        )}
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-[28px] font-black tracking-tight text-slate-900 dark:text-white leading-none">
              {title}
            </h1>
            {badge && (
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-2xs ${badgeClasses}`}
              >
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 flex-wrap">
        {lastUpdated && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Synced: <strong className="text-slate-700 dark:text-slate-300">{lastUpdated}</strong></span>
          </div>
        )}

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
            title="Refresh module data"
            aria-label="Refresh module data"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#7c3aed]' : ''}`}
            />
          </button>
        )}

        {actions}
      </div>
    </div>
  );
};
