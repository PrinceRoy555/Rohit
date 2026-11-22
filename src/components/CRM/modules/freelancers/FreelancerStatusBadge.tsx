import React from 'react';
import { CrmFreelancerStatus } from '../../../../types/crm';

export interface FreelancerStatusBadgeProps {
  status?: CrmFreelancerStatus | string;
  size?: 'sm' | 'md';
}

export const getFreelancerStatusMeta = (status?: string): { label: string; bg: string; text: string; dot: string; border: string } => {
  const norm = (status || 'available').toLowerCase();

  switch (norm) {
    case 'available':
      return {
        label: 'Available',
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
        text: 'text-emerald-600 dark:text-emerald-400',
        dot: 'bg-emerald-500',
        border: 'border-emerald-500/20'
      };
    case 'busy':
      return {
        label: 'Busy / On Projects',
        bg: 'bg-amber-500/10 dark:bg-amber-500/15',
        text: 'text-amber-600 dark:text-amber-400',
        dot: 'bg-amber-500',
        border: 'border-amber-500/20'
      };
    case 'inactive':
      return {
        label: 'Inactive',
        bg: 'bg-slate-500/10 dark:bg-slate-500/15',
        text: 'text-slate-600 dark:text-slate-400',
        dot: 'bg-slate-400',
        border: 'border-slate-500/20'
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

export const FreelancerStatusBadge: React.FC<FreelancerStatusBadgeProps> = ({ status, size = 'sm' }) => {
  const meta = getFreelancerStatusMeta(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${meta.bg} ${meta.text} ${meta.border} ${
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      <span>{meta.label}</span>
    </span>
  );
};
