import React from 'react';
import {
  FileText,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { CrmQuotationStatus } from '../../../../types/crm';

interface QuotationStatusBadgeProps {
  status: CrmQuotationStatus;
  size?: 'sm' | 'md';
}

export const QuotationStatusBadge: React.FC<QuotationStatusBadgeProps> = ({
  status,
  size = 'sm'
}) => {
  const normStatus = status === 'declined' ? 'rejected' : status;

  const config: Record<
    string,
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
    accepted: {
      label: 'Accepted',
      icon: CheckCircle2,
      classes:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
    },
    rejected: {
      label: 'Declined',
      icon: XCircle,
      classes:
        'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60'
    },
    expired: {
      label: 'Expired',
      icon: AlertCircle,
      classes:
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60'
    }
  };

  const item = config[normStatus] || config.draft;
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

interface QuotationExpiryBadgeProps {
  validUntil: string;
  status: CrmQuotationStatus;
}

export const QuotationExpiryBadge: React.FC<QuotationExpiryBadgeProps> = ({
  validUntil,
  status
}) => {
  if (status === 'accepted') {
    return (
      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
        Accepted
      </span>
    );
  }

  if (status === 'rejected' || (status as any) === 'declined') {
    return (
      <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
        Declined
      </span>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(validUntil);
  expiry.setHours(0, 0, 0, 0);

  const diffDays = Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0 || status === 'expired') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-800/50">
        <AlertCircle className="w-3 h-3" />
        <span>Expired ({Math.abs(diffDays)}d ago)</span>
      </span>
    );
  }

  if (diffDays === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/50">
        <Clock className="w-3 h-3" />
        <span>Expires Today</span>
      </span>
    );
  }

  if (diffDays <= 3) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
        <Clock className="w-3 h-3" />
        <span>{diffDays}d left</span>
      </span>
    );
  }

  return (
    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
      Valid to {expiry.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
    </span>
  );
};
