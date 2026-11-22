import React from 'react';
import {
  Clock,
  UserPlus,
  Receipt,
  CheckSquare,
  FolderPlus,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { DashboardActivityItem, CrmModuleId } from '../../../types/crm';

interface RecentActivitySectionProps {
  activities?: DashboardActivityItem[];
  onNavigateToModule?: (moduleId: CrmModuleId) => void;
}

export const RecentActivitySection: React.FC<RecentActivitySectionProps> = ({
  activities = [],
  onNavigateToModule
}) => {
  const getIconConfig = (type: DashboardActivityItem['type']) => {
    switch (type) {
      case 'lead':
        return {
          icon: UserPlus,
          bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40'
        };
      case 'invoice':
        return {
          icon: Receipt,
          bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40'
        };
      case 'task':
        return {
          icon: CheckSquare,
          bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40'
        };
      case 'project':
        return {
          icon: FolderPlus,
          bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40'
        };
      case 'payment':
      default:
        return {
          icon: CreditCard,
          bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40'
        };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
      {/* 1. Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
              Recent Activity
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Latest actions across your agency
            </p>
          </div>
        </div>

        {onNavigateToModule && (
          <button
            type="button"
            onClick={() => onNavigateToModule('leads')}
            className="flex items-center gap-1 text-[11px] font-bold text-[#6366f1] dark:text-indigo-400 hover:underline cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* 2. Activities List */}
      <div className="space-y-2.5 my-auto">
        {activities.length > 0 ? (
          activities.map((item) => {
            const { icon: ItemIcon, bg } = getIconConfig(item.type);
            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
                    <ItemIcon className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {item.title}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-400 shrink-0">
                  {item.timeAgo}
                </span>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-slate-400 text-xs">
            <Clock className="w-6 h-6 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p>No recent activity recorded yet.</p>
            <p className="text-[11px] text-slate-400/80 mt-0.5">
              Actions in Leads, Invoices, and Projects will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
