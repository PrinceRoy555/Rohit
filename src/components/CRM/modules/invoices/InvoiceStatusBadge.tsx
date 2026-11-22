import React from 'react';
import {
  FileText,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  CreditCard
} from 'lucide-react';
import { CrmInvoiceStatus } from '../../../../types/crm';

interface InvoiceStatusBadgeProps {
  status: CrmInvoiceStatus;
  size?: 'sm' | 'md';
}

export const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({
  status,
  size = 'sm'
}) => {
  const config: Record<
    CrmInvoiceStatus,
    { label: string; icon: React.ElementType; classes: string }
  > = {
    draft: {
      label: 'Draft',
      icon: FileText,
      classes:
        'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
    },
    sent: {
      label: 'Sent',
      icon: Send,
      classes:
        'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60'
    },
    partially_paid: {
      label: 'Partial',
      icon: Clock,
      classes:
        'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60'
    },
    paid: {
      label: 'Paid',
      icon: CheckCircle2,
      classes:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
    },
    overdue: {
      label: 'Overdue',
      icon: AlertTriangle,
      classes:
        'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60'
    },
    cancelled: {
      label: 'Cancelled',
      icon: XCircle,
      classes:
        'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
    }
  };

  const item = config[status] || config.draft;
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

interface InvoiceDueBadgeProps {
  dueDate: string;
  status: CrmInvoiceStatus;
}

export const InvoiceDueBadge: React.FC<InvoiceDueBadgeProps> = ({ dueDate, status }) => {
  if (status === 'paid') {
    return (
      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
        Paid in Full
      </span>
    );
  }

  if (status === 'cancelled') {
    return (
      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
        Cancelled
      </span>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return (
      <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        <span>Overdue by {Math.abs(diffDays)}d</span>
      </span>
    );
  }

  if (diffDays === 0) {
    return (
      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
        Due Today
      </span>
    );
  }

  if (diffDays <= 3) {
    return (
      <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
        Due in {diffDays}d
      </span>
    );
  }

  return (
    <span className="text-[11px] text-slate-500 dark:text-slate-400">
      Due in {diffDays}d
    </span>
  );
};
