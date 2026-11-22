import React from 'react';
import { CrmClientStatus } from '../../../../types/crm';

export interface ClientStatusBadgeProps {
  status?: CrmClientStatus | string;
  size?: 'sm' | 'md';
}

export const getClientStatusMeta = (status?: string): { label: string; bg: string; text: string; dot: string; border: string } => {
  const norm = (status || 'active').toLowerCase();

  switch (norm) {
    case 'active':
      return {
        label: 'Active Client',
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
        text: 'text-emerald-600 dark:text-emerald-400',
        dot: 'bg-emerald-500',
        border: 'border-emerald-500/20'
      };
    case 'inactive':
      return {
        label: 'Inactive',
        bg: 'bg-amber-500/10 dark:bg-amber-500/15',
        text: 'text-amber-600 dark:text-amber-400',
        dot: 'bg-amber-500',
        border: 'border-amber-500/20'
      };
    case 'archived':
      return {
        label: 'Archived',
        bg: 'bg-slate-500/10 dark:bg-slate-500/15',
        text: 'text-slate-600 dark:text-slate-400',
        dot: 'bg-slate-400',
        border: 'border-slate-500/20'
      };
    case 'lead':
      return {
        label: 'Lead',
        bg: 'bg-blue-500/10 dark:bg-blue-500/15',
        text: 'text-blue-600 dark:text-blue-400',
        dot: 'bg-blue-500',
        border: 'border-blue-500/20'
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

export const ClientStatusBadge: React.FC<ClientStatusBadgeProps> = ({ status, size = 'sm' }) => {
  const meta = getClientStatusMeta(status);

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
