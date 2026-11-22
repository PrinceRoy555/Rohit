import React from 'react';
import {
  Calendar,
  Target,
  CheckCircle2,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { DashboardTodayHighlights } from '../../../types/crm';

interface TodayHighlightsSectionProps {
  highlights?: DashboardTodayHighlights;
}

export const TodayHighlightsSection: React.FC<TodayHighlightsSectionProps> = ({
  highlights
}) => {
  const leadsToday = highlights?.leadsToday ?? 0;
  const tasksCompleted = highlights?.tasksCompletedToday ?? 0;
  const paymentsReceived = highlights?.paymentsReceivedToday ?? 0;

  const leadsTrend = highlights?.leadsTrend || '—';
  const tasksTrend = highlights?.tasksTrend || '—';
  const paymentsTrend = highlights?.paymentsTrend || '—';

  const renderTrend = (trendStr: string) => {
    if (trendStr === '—' || !trendStr) {
      return (
        <span className="flex items-center gap-0.5 text-[10px] font-bold text-slate-400">
          <Minus className="w-3 h-3" />
          <span>—</span>
        </span>
      );
    }
    const isDown = trendStr.startsWith('-');
    return (
      <span
        className={`flex items-center gap-0.5 text-[10px] font-bold ${
          isDown ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'
        }`}
      >
        {isDown ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
        <span>{trendStr}</span>
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
      {/* 1. Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
              Today's Highlights
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Key metrics and targets for today
            </p>
          </div>
        </div>
      </div>

      {/* 2. 3 Mini Highlight Cards in a Row */}
      <div className="grid grid-cols-3 gap-2.5 my-auto">
        {/* Card 1: Leads Today (Purple) */}
        <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 flex flex-col justify-between">
          <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 flex items-center justify-center mb-2">
            <Target className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 dark:text-white leading-tight">
              {leadsToday}
            </div>
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Leads Today
            </div>
            <div className="mt-1">
              {renderTrend(leadsTrend)}
            </div>
          </div>
        </div>

        {/* Card 2: Tasks Completed (Green) */}
        <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex flex-col justify-between">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 dark:text-white leading-tight">
              {tasksCompleted}
            </div>
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Tasks Completed
            </div>
            <div className="mt-1">
              {renderTrend(tasksTrend)}
            </div>
          </div>
        </div>

        {/* Card 3: Payments Received (Amber/Gold) */}
        <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 flex flex-col justify-between">
          <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 flex items-center justify-center mb-2">
            <IndianRupee className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 dark:text-white leading-tight truncate">
              {paymentsReceived > 0 ? `₹${paymentsReceived.toLocaleString('en-IN')}` : '₹0'}
            </div>
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Payments Received
            </div>
            <div className="mt-1">
              {renderTrend(paymentsTrend)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
