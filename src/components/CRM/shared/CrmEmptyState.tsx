import React, { ReactNode } from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface CrmEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export const CrmEmptyState: React.FC<CrmEmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-purple-200/80 dark:border-purple-900/40 bg-gradient-to-b from-purple-50/30 to-white dark:from-purple-950/10 dark:to-slate-900 shadow-2xs">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-100 to-indigo-50 dark:from-purple-950/60 dark:to-indigo-950/40 border border-purple-200/60 dark:border-purple-800/40 text-[#7c3aed] dark:text-purple-300 flex items-center justify-center mb-3.5 shadow-xs">
        <Icon className="w-6 h-6 stroke-[2]" />
      </div>
      <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-1 tracking-tight">
        {title}
      </h3>
      <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};
