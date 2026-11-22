import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  XCircle,
  Flame,
  AlertTriangle,
  Minus
} from 'lucide-react';
import { CrmTaskStatus, CrmTaskPriority } from '../../../../types/crm';

interface TaskStatusBadgeProps {
  status: CrmTaskStatus;
  size?: 'sm' | 'md';
}

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status, size = 'sm' }) => {
  const normStatus = status === 'todo' ? 'to_do' : status === 'review' ? 'in_review' : status;

  const config: Record<
    string,
    { label: string; icon: React.ElementType; classes: string }
  > = {
    to_do: {
      label: 'To Do',
      icon: Clock,
      classes: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
    },
    in_progress: {
      label: 'In Progress',
      icon: PlayCircle,
      classes: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-800/60'
    },
    in_review: {
      label: 'In Review',
      icon: AlertCircle,
      classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60'
    },
    completed: {
      label: 'Completed',
      icon: CheckCircle2,
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60'
    },
    blocked: {
      label: 'Blocked',
      icon: XCircle,
      classes: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/60'
    }
  };

  const item = config[normStatus] || config.to_do;
  const Icon = item.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full border ${item.classes} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{item.label}</span>
    </span>
  );
};

interface TaskPriorityBadgeProps {
  priority: CrmTaskPriority;
  size?: 'sm' | 'md';
}

export const TaskPriorityBadge: React.FC<TaskPriorityBadgeProps> = ({ priority, size = 'sm' }) => {
  const config: Record<
    CrmTaskPriority,
    { label: string; icon: React.ElementType; classes: string }
  > = {
    urgent: {
      label: 'Urgent',
      icon: Flame,
      classes: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-400 dark:border-red-800/60'
    },
    high: {
      label: 'High',
      icon: AlertTriangle,
      classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60'
    },
    medium: {
      label: 'Medium',
      icon: Clock,
      classes: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-400 dark:border-sky-800/60'
    },
    low: {
      label: 'Low',
      icon: Minus,
      classes: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
    }
  };

  const item = config[priority] || config.medium;
  const Icon = item.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full border ${item.classes} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{item.label}</span>
    </span>
  );
};

interface TaskDueDateBadgeProps {
  dueDate?: string;
  isCompleted?: boolean;
}

export const TaskDueDateBadge: React.FC<TaskDueDateBadgeProps> = ({ dueDate, isCompleted }) => {
  if (!dueDate) {
    return <span className="text-[11px] text-slate-400 italic">No deadline</span>;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (isCompleted) {
    return (
      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
        Done ({due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
      </span>
    );
  }

  if (diffDays < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-800/50">
        <AlertCircle className="w-3 h-3" />
        <span>Overdue ({Math.abs(diffDays)}d)</span>
      </span>
    );
  }

  if (diffDays === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/50">
        <Clock className="w-3 h-3" />
        <span>Due Today</span>
      </span>
    );
  }

  if (diffDays <= 3) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
        <Clock className="w-3 h-3" />
        <span>In {diffDays} {diffDays === 1 ? 'day' : 'days'}</span>
      </span>
    );
  }

  return (
    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
      {due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
    </span>
  );
};
