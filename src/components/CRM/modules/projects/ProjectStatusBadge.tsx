import React from 'react';
import { CrmProjectStatus, CrmProjectPriority } from '../../../../types/crm';

export interface ProjectStatusBadgeProps {
  status?: CrmProjectStatus | string;
  size?: 'sm' | 'md';
}

export const getProjectStatusMeta = (status?: string): { label: string; bg: string; text: string; dot: string; border: string } => {
  const norm = (status || 'planning').toLowerCase();

  switch (norm) {
    case 'planning':
      return {
        label: 'Planning',
        bg: 'bg-blue-500/10 dark:bg-blue-500/15',
        text: 'text-blue-600 dark:text-blue-400',
        dot: 'bg-blue-500',
        border: 'border-blue-500/20'
      };
    case 'in_progress':
      return {
        label: 'In Progress',
        bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
        text: 'text-indigo-600 dark:text-indigo-400',
        dot: 'bg-indigo-500',
        border: 'border-indigo-500/20'
      };
    case 'in_review':
      return {
        label: 'In Review',
        bg: 'bg-amber-500/10 dark:bg-amber-500/15',
        text: 'text-amber-600 dark:text-amber-400',
        dot: 'bg-amber-500',
        border: 'border-amber-500/20'
      };
    case 'completed':
      return {
        label: 'Completed',
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
        text: 'text-emerald-600 dark:text-emerald-400',
        dot: 'bg-emerald-500',
        border: 'border-emerald-500/20'
      };
    case 'on_hold':
      return {
        label: 'On Hold',
        bg: 'bg-slate-500/10 dark:bg-slate-500/15',
        text: 'text-slate-600 dark:text-slate-400',
        dot: 'bg-slate-400',
        border: 'border-slate-500/20'
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
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

export const ProjectStatusBadge: React.FC<ProjectStatusBadgeProps> = ({ status, size = 'sm' }) => {
  const meta = getProjectStatusMeta(status);

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

export interface ProjectPriorityBadgeProps {
  priority?: CrmProjectPriority | string;
  size?: 'sm' | 'md';
}

export const getProjectPriorityMeta = (priority?: string): { label: string; bg: string; text: string; border: string } => {
  const norm = (priority || 'medium').toLowerCase();

  switch (norm) {
    case 'urgent':
      return {
        label: 'Urgent',
        bg: 'bg-red-500/10 dark:bg-red-500/15',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-500/20'
      };
    case 'high':
      return {
        label: 'High',
        bg: 'bg-amber-500/10 dark:bg-amber-500/15',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-500/20'
      };
    case 'medium':
      return {
        label: 'Medium',
        bg: 'bg-blue-500/10 dark:bg-blue-500/15',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-500/20'
      };
    case 'low':
      return {
        label: 'Low',
        bg: 'bg-slate-500/10 dark:bg-slate-500/15',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-500/20'
      };
    default:
      return {
        label: priority || 'Medium',
        bg: 'bg-slate-500/10 dark:bg-slate-500/15',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-500/20'
      };
  }
};

export const ProjectPriorityBadge: React.FC<ProjectPriorityBadgeProps> = ({ priority, size = 'sm' }) => {
  const meta = getProjectPriorityMeta(priority);

  return (
    <span
      className={`inline-flex items-center font-bold uppercase rounded-md border ${meta.bg} ${meta.text} ${meta.border} ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      {meta.label}
    </span>
  );
};
