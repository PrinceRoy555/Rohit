import React from 'react';
import {
  CreditCard,
  Building,
  Calendar,
  ExternalLink,
  Receipt,
  User,
  Trash2,
  FileText,
  IndianRupee,
  CheckCircle2,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { CrmPayment, CrmPaymentStatus } from '../../../../types/crm';
import {
  PaymentStatusBadge,
  PaymentMethodBadge,
  PaymentTypeBadge
} from './PaymentStatusBadge';
import { deletePaymentWithCloud } from '../../../../services/crmStorageService';

interface PaymentTableViewProps {
  payments: CrmPayment[];
  onRefresh?: () => void;
  onNavigateToInvoice?: (invoiceId: string) => void;
}

export const PaymentTableView: React.FC<PaymentTableViewProps> = ({
  payments,
  onRefresh,
  onNavigateToInvoice
}) => {
  const handleDeletePayment = async (payment: CrmPayment, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmDel = window.confirm(
      `Delete transaction record ${payment.transactionRef || payment.id} of ₹${payment.amount.toLocaleString(
        'en-IN'
      )}? This will recalculate linked invoice and balance balances.`
    );
    if (!confirmDel) return;

    const res = await deletePaymentWithCloud(payment.id);
    if (!res.success) {
      alert(res.error || 'Failed to delete transaction record.');
      return;
    }
    if (onRefresh) onRefresh();
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <table className="w-full text-left border-collapse text-xs">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
            <th className="py-3.5 px-4">Transaction / UTR #</th>
            <th className="py-3.5 px-4">Party & Scope</th>
            <th className="py-3.5 px-4">Type</th>
            <th className="py-3.5 px-4">Amount (INR)</th>
            <th className="py-3.5 px-4">Method & Date</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
          {payments.map((p) => {
            const isClientInflow = p.paymentType === 'client_payment';

            return (
              <tr
                key={p.id}
                className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* 1. Transaction Ref & Verification */}
                <td className="py-3.5 px-4">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`p-2 rounded-xl mt-0.5 border ${
                        isClientInflow
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40'
                          : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/40'
                      }`}
                    >
                      {isClientInflow ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white font-mono text-[11px]">
                          {p.transactionRef || 'NO-REF-RECORDED'}
                        </span>
                        {p.isDemo && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Demo
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                        <span>ID: {p.id.substring(0, 14)}...</span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* 2. Party & Scope */}
                <td className="py-3.5 px-4">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {isClientInflow ? (
                        <>
                          <User className="w-3 h-3 text-emerald-500" />
                          <span>{p.clientName || 'Direct Client'}</span>
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3 text-indigo-500" />
                          <span>{p.freelancerName || 'Subcontractor'}</span>
                        </>
                      )}
                    </div>

                    {/* Linked Invoice or Project */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {p.invoiceNumber && (
                        <span
                          onClick={() => {
                            if (p.invoiceId && onNavigateToInvoice) {
                              onNavigateToInvoice(p.invoiceId);
                            }
                          }}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/40 hover:underline cursor-pointer flex items-center gap-0.5"
                          title="View Linked Invoice"
                        >
                          <Receipt className="w-2.5 h-2.5" />
                          {p.invoiceNumber}
                        </span>
                      )}

                      {p.projectTitle && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                          {p.projectTitle}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* 3. Transaction Type */}
                <td className="py-3.5 px-4">
                  <PaymentTypeBadge type={p.paymentType} />
                </td>

                {/* 4. Amount */}
                <td className="py-3.5 px-4">
                  <div className="font-bold text-sm flex items-center gap-0.5">
                    <span
                      className={
                        isClientInflow
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-indigo-600 dark:text-indigo-400'
                      }
                    >
                      {isClientInflow ? '+' : '-'} ₹{p.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {p.notes && (
                    <div className="text-[11px] text-slate-400 line-clamp-1 max-w-[200px] mt-0.5">
                      {p.notes}
                    </div>
                  )}
                </td>

                {/* 5. Method & Date */}
                <td className="py-3.5 px-4">
                  <div className="space-y-1">
                    <PaymentMethodBadge method={p.paymentMethod} />
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>
                        {new Date(p.paymentDate).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </td>

                {/* 6. Status */}
                <td className="py-3.5 px-4">
                  <PaymentStatusBadge status={p.status} />
                </td>

                {/* 7. Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    {/* Receipt link */}
                    {p.receiptUrl && (
                      <a
                        href={p.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                        title="View Payment Receipt / Screenshot"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {/* Delete */}
                    <button
                      onClick={(e) => handleDeletePayment(p, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Transaction Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
