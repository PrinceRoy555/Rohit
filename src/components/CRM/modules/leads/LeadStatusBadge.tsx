import React from 'react';
import { LeadPipelineStage } from '../../../../types/crm';
import { InquiryStatus } from '../../../../types/cms';

export interface LeadStatusBadgeProps {
  status?: LeadPipelineStage | InquiryStatus | string;
  size?: 'sm' | 'md';
}

export const getStatusMeta = (status?: string): { label: string; bg: string; text: string; dot: string; border: string } => {
  const norm = (status || 'new').toLowerCase().replace('-', '_');

  switch (norm) {
    case 'new':
    case 'unread':
      return {
        label: 'New Lead',
        bg: 'bg-blue-500/10 dark:bg-blue-500/15',
        text: 'text-blue-600 dark:text-blue-400',
        dot: 'bg-blue-500',
        border: 'border-blue-500/20'
      };
    case 'contacted':
    case 'read':
      return {
        label: 'Contacted',
        bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
        text: 'text-indigo-600 dark:text-indigo-400',
        dot: 'bg-indigo-500',
        border: 'border-indigo-500/20'
      };
    case 'follow_up':
    case 'followup':
    case 'in_progress':
      return {
        label: 'Follow-up',
        bg: 'bg-amber-500/10 dark:bg-amber-500/15',
        text: 'text-amber-600 dark:text-amber-400',
        dot: 'bg-amber-500 animate-pulse',
        border: 'border-amber-500/20'
      };
    case 'qualified':
    case 'proposal_sent':
    case 'negotiation':
      return {
        label: 'Qualified',
        bg: 'bg-purple-500/10 dark:bg-purple-500/15',
        text: 'text-purple-600 dark:text-purple-400',
        dot: 'bg-purple-500',
        border: 'border-purple-500/20'
      };
    case 'won':
    case 'completed':
    case 'replied':
      return {
        label: 'Won / Converted',
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
        text: 'text-emerald-600 dark:text-emerald-400',
        dot: 'bg-emerald-500',
        border: 'border-emerald-500/20'
      };
    case 'lost':
    case 'archived':
    case 'closed':
      return {
        label: 'Lost / Closed',
        bg: 'bg-rose-500/10 dark:bg-rose-500/15',
        text: 'text-rose-600 dark:text-rose-400',
        dot: 'bg-rose-500',
        border: 'border-rose-500/20'
      };
    default:
      return {
        label: status || 'Unknown',
        bg: 'bg-slate-500/10 dark:bg-slate-500/15',
        text: 'text-slate-600 dark:text-slate-400',
        dot: 'bg-slate-400',
        border: 'border-slate-500/20'
      };
  }
};

export const LeadStatusBadge: React.FC<LeadStatusBadgeProps> = ({ status, size = 'sm' }) => {
  const meta = getStatusMeta(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${meta.bg} ${meta.text} ${meta.border} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      <span>{meta.label}</span>
    </span>
  );
};
