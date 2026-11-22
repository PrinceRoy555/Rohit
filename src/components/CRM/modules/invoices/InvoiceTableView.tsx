import React from 'react';
import {
  FileText,
  Building,
  Calendar,
  Share2,
  Printer,
  Receipt,
  Edit,
  Copy,
  ChevronRight,
  ExternalLink,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  IndianRupee,
  Phone
} from 'lucide-react';
import { CrmInvoice, CrmInvoiceStatus } from '../../../../types/crm';
import { InvoiceStatusBadge, InvoiceDueBadge } from './InvoiceStatusBadge';
import {
  updateInvoiceStatus,
  duplicateStoredInvoice,
  normalizePhoneNumber
} from '../../../../services/crmStorageService';

interface InvoiceTableViewProps {
  invoices: CrmInvoice[];
  onSelectInvoice: (invoice: CrmInvoice) => void;
  onEditInvoice?: (invoice: CrmInvoice) => void;
  onDuplicateInvoice?: (invoice: CrmInvoice) => void;
  onRecordPayment?: (invoice: CrmInvoice) => void;
  onRefresh?: () => void;
  onNavigateToQuotation?: (quotationId: string) => void;
}

export const InvoiceTableView: React.FC<InvoiceTableViewProps> = ({
  invoices,
  onSelectInvoice,
  onEditInvoice,
  onDuplicateInvoice,
  onRecordPayment,
  onRefresh,
  onNavigateToQuotation
}) => {
  const handleQuickStatus = (
    invId: string,
    newStatus: CrmInvoiceStatus,
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    e.stopPropagation();
    updateInvoiceStatus(invId, newStatus);
    if (onRefresh) onRefresh();
  };

  const handleQuickDuplicate = (inv: CrmInvoice, e: React.MouseEvent) => {
    e.stopPropagation();
    const dup = duplicateStoredInvoice(inv.id);
    if (dup) {
      alert(`Invoice duplicated as ${dup.invoiceNumber}`);
      if (onRefresh) onRefresh();
    }
  };

  const handleQuickWhatsApp = (inv: CrmInvoice, e: React.MouseEvent) => {
    e.stopPropagation();
    const digits = normalizePhoneNumber(inv.clientPhone || '');
    const balance = inv.balanceDue ?? (inv.totalAmount - (inv.amountPaid || 0));
    const message = encodeURIComponent(
      `*Rohitwork Creative Studios — Formal Invoice*\n` +
      `Invoice Ref: *${inv.invoiceNumber}*\n` +
      `Client: ${inv.clientName}\n` +
      `Total: ₹${inv.totalAmount.toLocaleString('en-IN')}\n` +
      `Paid: ₹${(inv.amountPaid || 0).toLocaleString('en-IN')}\n` +
      `Balance Due: ₹${balance.toLocaleString('en-IN')}\n` +
      `Due Date: ${new Date(inv.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}\n\n` +
      `Bank Remittance:\n` +
      `A/C: ${inv.bankDetails?.accountNumber || '50200088912344'}\n` +
      `IFSC: ${inv.bankDetails?.ifsc || 'HDFC0001234'}\n` +
      `UPI: ${inv.bankDetails?.upiId || 'rohitwork@hdfcbank'}\n\n` +
      `Thank you for partnering with Rohitwork Creative Studios!`
    );

    const url = digits
      ? `https://wa.me/91${digits}?text=${message}`
      : `https://wa.me/message/H4JLHPJ3NNGOK1?text=${message}`;
    window.open(url, '_blank');
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <table className="w-full text-left border-collapse text-xs">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
            <th className="py-3.5 px-4">Invoice # & Scope</th>
            <th className="py-3.5 px-4">Client</th>
            <th className="py-3.5 px-4">Status & Due</th>
            <th className="py-3.5 px-4">Amount & Tax</th>
            <th className="py-3.5 px-4">Paid / Balance Due</th>
            <th className="py-3.5 px-4">Due Date</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
          {invoices.map((inv) => {
            const amountPaid = inv.amountPaid || 0;
            const balanceDue = inv.balanceDue ?? Math.max(0, inv.totalAmount - amountPaid);
            const percentPaid = inv.totalAmount > 0 ? Math.min(100, Math.round((amountPaid / inv.totalAmount) * 100)) : 0;
            const isFullyPaid = balanceDue <= 0 && inv.totalAmount > 0;

            return (
              <tr
                key={inv.id}
                onClick={() => onSelectInvoice(inv)}
                className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                {/* 1. Invoice Number & Scope */}
                <td className="py-3.5 px-4">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900/40 mt-0.5">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors font-mono">
                          {inv.invoiceNumber}
                        </span>
                        {inv.isDemo && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Demo
                          </span>
                        )}
                        {inv.quotationNumber && (
                          <span
                            onClick={(e) => {
                              if (inv.quotationId && onNavigateToQuotation) {
                                e.stopPropagation();
                                onNavigateToQuotation(inv.quotationId);
                              }
                            }}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 hover:underline flex items-center gap-0.5"
                            title="Converted from Quotation"
                          >
                            <FileText className="w-2.5 h-2.5" />
                            {inv.quotationNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 max-w-[220px] mt-0.5">
                        {inv.projectTitle || inv.items?.[0]?.description || 'Creative Production'}
                      </div>
                    </div>
                  </div>
                </td>

                {/* 2. Client */}
                <td className="py-3.5 px-4">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{inv.clientName}</span>
                    </div>
                    {inv.clientCompany && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[150px]">{inv.clientCompany}</span>
                      </div>
                    )}
                    {inv.clientPhone && (
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5 text-slate-400" />
                        <span>{inv.clientPhone}</span>
                      </div>
                    )}
                  </div>
                </td>

                {/* 3. Status & Due Status */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-col gap-1 items-start">
                    <InvoiceStatusBadge status={inv.status} />
                    <InvoiceDueBadge dueDate={inv.dueDate} status={inv.status} />
                  </div>
                </td>

                {/* 4. Total Amount & Tax */}
                <td className="py-3.5 px-4">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      ₹{inv.totalAmount.toLocaleString('en-IN')}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {inv.isGstEnabled ? (
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          18% GST (₹{(inv.taxAmount || 0).toLocaleString('en-IN')})
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400">
                          Non-GST Invoice
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* 5. Paid / Balance Due */}
                <td className="py-3.5 px-4 min-w-[150px]">
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        ₹{amountPaid.toLocaleString('en-IN')} paid
                      </span>
                      <span className="text-slate-400 font-medium">
                        {percentPaid}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isFullyPaid
                            ? 'bg-emerald-500'
                            : percentPaid > 0
                            ? 'bg-amber-500'
                            : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                        style={{ width: `${percentPaid}%` }}
                      />
                    </div>

                    <div className="mt-1 text-[11px]">
                      {isFullyPaid ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Fully Cleared
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 font-bold">
                          Due: ₹{balanceDue.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* 6. Due Date */}
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {new Date(inv.dueDate).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Issued: {new Date(inv.issueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </div>
                </td>

                {/* 7. Action Icons */}
                <td className="py-3.5 px-4 text-right">
                  <div
                    className="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Record Payment Button */}
                    {!isFullyPaid && onRecordPayment && (
                      <button
                        onClick={() => onRecordPayment(inv)}
                        className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                        title="Record Payment for this Invoice"
                      >
                        <CreditCard className="w-3 h-3" />
                        <span>Pay</span>
                      </button>
                    )}

                    {/* WhatsApp */}
                    <button
                      onClick={(e) => handleQuickWhatsApp(inv, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                      title="Share via WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Print / View */}
                    <button
                      onClick={() => onSelectInvoice(inv)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors"
                      title="View / Print Branded Invoice"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit */}
                    {onEditInvoice && (
                      <button
                        onClick={() => onEditInvoice(inv)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                        title="Edit Invoice"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Duplicate */}
                    <button
                      onClick={(e) => handleQuickDuplicate(inv, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                      title="Duplicate Invoice"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Quick Status Select */}
                    <select
                      value={inv.status}
                      onChange={(e) => handleQuickStatus(inv.id, e.target.value as CrmInvoiceStatus, e)}
                      className="ml-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="partially_paid">Partially Paid</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 ml-1 transition-transform group-hover:translate-x-0.5" />
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
