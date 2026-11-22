import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  QrCode,
  Building,
  Banknote,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { CrmPaymentStatus, CrmPaymentMethod, CrmPaymentType } from '../../../../types/crm';

interface PaymentStatusBadgeProps {
  status: CrmPaymentStatus;
  size?: 'sm' | 'md';
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  status,
  size = 'sm'
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  switch (status) {
    case 'completed':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 ${sizeClasses}`}
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>Completed</span>
        </span>
      );
    case 'pending':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 ${sizeClasses}`}
        >
          <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 animate-pulse" />
          <span>Pending</span>
        </span>
      );
    case 'failed':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 ${sizeClasses}`}
        >
          <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          <span>Failed</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};

interface PaymentMethodBadgeProps {
  method: CrmPaymentMethod;
}

export const PaymentMethodBadge: React.FC<PaymentMethodBadgeProps> = ({ method }) => {
  switch (method) {
    case 'upi':
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
          <QrCode className="w-3 h-3" />
          <span>UPI / QR</span>
        </span>
      );
    case 'bank_transfer':
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
          <Building className="w-3 h-3" />
          <span>NEFT / IMPS</span>
        </span>
      );
    case 'stripe':
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800/40">
          <CreditCard className="w-3 h-3" />
          <span>Stripe / Card</span>
        </span>
      );
    case 'cash':
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
          <Banknote className="w-3 h-3" />
          <span>Cash</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          <span>Other</span>
        </span>
      );
  }
};

interface PaymentTypeBadgeProps {
  type: CrmPaymentType;
}

export const PaymentTypeBadge: React.FC<PaymentTypeBadgeProps> = ({ type }) => {
  if (type === 'client_payment') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
        <ArrowDownLeft className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
        <span>Client Inflow</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
      <ArrowUpRight className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
      <span>Freelancer Outflow</span>
    </span>
  );
};
