import React from 'react';
import { Filter, ArrowRight, CheckCircle2 } from 'lucide-react';
import { DashboardPipelineStage } from '../../../types/crm';

interface LeadsPipelineChartProps {
  stages?: DashboardPipelineStage[];
  conversionRate?: string;
  conversionRateTrend?: string;
  onNavigateToLeads?: () => void;
}

const DEFAULT_STAGES: DashboardPipelineStage[] = [
  { stage: 'new', label: 'New Leads', count: 0, percentage: 0, color: '#6366f1', dotColor: '#6366f1' },
  { stage: 'qualified', label: 'Qualified', count: 0, percentage: 0, color: '#8b5cf6', dotColor: '#8b5cf6' },
  { stage: 'proposal_sent', label: 'Proposal Sent', count: 0, percentage: 0, color: '#c084fc', dotColor: '#c084fc' },
  { stage: 'negotiation', label: 'Negotiation', count: 0, percentage: 0, color: '#38bdf8', dotColor: '#38bdf8' },
  { stage: 'won', label: 'Won / Converted', count: 0, percentage: 0, color: '#10b981', dotColor: '#10b981' }
];

export const LeadsPipelineChart: React.FC<LeadsPipelineChartProps> = ({
  stages = DEFAULT_STAGES,
  conversionRate = '—',
  conversionRateTrend,
  onNavigateToLeads
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
      {/* 1. Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shrink-0">
            <Filter className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
              Leads Pipeline
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Current lead status and conversion flow
            </p>
          </div>
        </div>

        {onNavigateToLeads && (
          <button
            type="button"
            onClick={onNavigateToLeads}
            className="flex items-center gap-1 text-[11px] font-bold text-[#6366f1] dark:text-indigo-400 hover:underline cursor-pointer"
          >
            <span>View Pipeline</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* 2. Funnel Stages List */}
      <div className="space-y-3.5 my-1">
        {stages.map((stage) => (
          <div key={stage.stage} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: stage.dotColor }}
                />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {stage.label}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {stage.count}
                </span>
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 w-10 text-right">
                  {stage.percentage}%
                </span>
              </div>
            </div>

            {/* Horizontal Bar */}
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(stage.percentage, stage.count > 0 ? 4 : 0)}%`,
                  backgroundColor: stage.color
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Footer: Conversion Rate */}
      <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Conversion Rate</span>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 shadow-2xs">
          {conversionRateTrend || (conversionRate !== '—' ? `↗ ${conversionRate}` : '—')}
        </span>
      </div>
    </div>
  );
};
