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
  AlertCircle
} from 'lucide-react';
import { CrmQuotation, CrmQuotationStatus } from '../../../../types/crm';
import { QuotationStatusBadge, QuotationExpiryBadge } from './QuotationStatusBadge';
import {
  updateQuotationStatusWithCloud,
  convertQuotationToInvoiceWithCloud,
  duplicateQuotationWithCloud,
  normalizePhoneNumber
} from '../../../../services/crmStorageService';

interface QuotationTableViewProps {
  quotations: CrmQuotation[];
  onSelectQuotation: (quotation: CrmQuotation) => void;
  onEditQuotation?: (quotation: CrmQuotation) => void;
  onDuplicateQuotation?: (quotation: CrmQuotation) => void;
  onRefresh?: () => void;
  onNavigateToInvoice?: (invoiceId: string) => void;
}

export const QuotationTableView: React.FC<QuotationTableViewProps> = ({
  quotations,
  onSelectQuotation,
  onEditQuotation,
  onDuplicateQuotation,
  onRefresh,
  onNavigateToInvoice
}) => {
  const handleQuickStatus = async (
    quoteId: string,
    newStatus: CrmQuotationStatus,
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    e.stopPropagation();
    const res = await updateQuotationStatusWithCloud(quoteId, newStatus);
    if (!res.success) {
      alert(res.error || 'Failed to update quotation status.');
    }
    if (onRefresh) onRefresh();
  };

  const handleQuickConvert = async (quote: CrmQuotation, e: React.MouseEvent) => {
    e.stopPropagation();
    if (quote.convertedToInvoiceId) {
      if (onNavigateToInvoice) onNavigateToInvoice(quote.convertedToInvoiceId);
      return;
    }
    const confirmConvert = window.confirm(
      `Convert quotation ${quote.quotationNumber} into a formal invoice?`
    );
    if (!confirmConvert) return;
    const res = await convertQuotationToInvoiceWithCloud(quote.id);
    if (!res.success) {
      alert(res.error || 'Failed to convert quotation to invoice.');
      return;
    }
    if (res.invoice) {
      alert(`Created invoice ${res.invoice.invoiceNumber}!`);
      if (onRefresh) onRefresh();
    }
  };

  const handleQuickDuplicate = async (quote: CrmQuotation, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await duplicateQuotationWithCloud(quote.id);
    if (!res.success) {
      alert(res.error || 'Failed to duplicate quotation.');
      return;
    }
    if (res.quotation) {
      alert(`Duplicated as ${res.quotation.quotationNumber}`);
      if (onRefresh) onRefresh();
    }
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <table className="w-full text-left border-collapse text-xs">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
            <th className="py-3.5 px-4">Quotation # & Scope</th>
            <th className="py-3.5 px-4">Client</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4">Deliverables & Timeline</th>
            <th className="py-3.5 px-4">Validity</th>
            <th className="py-3.5 px-4 text-right">Total & Advance</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {quotations.map((q) => {
            const rawPhone = q.clientPhone || '';
            const digits = normalizePhoneNumber(rawPhone);
            const whatsAppShareText = encodeURIComponent(
              `Hi ${q.clientName}, Rohit Verma here from Rohitwork Creative Studio. Please review our formal quotation ${q.quotationNumber} for ₹${q.totalAmount.toLocaleString('en-IN')} (https://rohitwork.in). Looking forward to your approval!`
            );
            const directWhatsAppUrl = digits
              ? `https://wa.me/91${digits}?text=${whatsAppShareText}`
              : `https://wa.me/message/H4JLHPJ3NNGOK1?text=${whatsAppShareText}`;

            return (
              <tr
                key={q.id}
                onClick={() => onSelectQuotation(q)}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
              >
                {/* 1. Quote Number & Project Scope */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold flex items-center justify-center shrink-0 shadow-sm text-sm">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {q.quotationNumber}
                        </span>
                        {q.convertedToInvoiceId && (
                          <span
                            title="Converted to formal invoice"
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                          >
                            <Receipt className="w-2.5 h-2.5" />
                            <span>Invoice</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-[200px] truncate">
                        {q.projectTitle || 'Creative Production'}
                      </p>
                    </div>
                  </div>
                </td>

                {/* 2. Client Info */}
                <td className="py-3.5 px-4">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {q.clientName}
                    </div>
                    {q.clientCompany && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3" />
                        <span>{q.clientCompany}</span>
                      </div>
                    )}
                  </div>
                </td>

                {/* 3. Status Badge with Quick Switcher */}
                <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5">
                    <QuotationStatusBadge status={q.status} size="sm" />
                    <select
                      value={q.status}
                      onChange={(e) =>
                        handleQuickStatus(q.id, e.target.value as CrmQuotationStatus, e)
                      }
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-[11px] py-0.5 px-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Declined</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                </td>

                {/* 4. Deliverables Count & Timeline */}
                <td className="py-3.5 px-4">
                  <div className="space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {q.items ? q.items.length : 0} line item{q.items?.length === 1 ? '' : 's'}
                    </span>
                    {q.estimatedTimeline && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[130px]">{q.estimatedTimeline}</span>
                      </div>
                    )}
                  </div>
                </td>

                {/* 5. Validity & Expiry Countdown */}
                <td className="py-3.5 px-4">
                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                      {new Date(q.validUntil).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <QuotationExpiryBadge validUntil={q.validUntil} status={q.status} />
                  </div>
                </td>

                {/* 6. Total Amount & Advance */}
                <td className="py-3.5 px-4 text-right">
                  <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                    ₹{q.totalAmount.toLocaleString('en-IN')}
                  </div>
                  {q.advanceAmount && q.advanceAmount > 0 ? (
                    <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                      Adv: ₹{q.advanceAmount.toLocaleString('en-IN')} ({q.advancePercentage || 50}%)
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400">100% on delivery</div>
                  )}
                </td>

                {/* 7. Action Icons */}
                <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    {/* Direct WhatsApp Share */}
                    <a
                      href={directWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Share proposal on WhatsApp"
                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </a>

                    {/* Convert to Invoice */}
                    <button
                      type="button"
                      onClick={(e) => handleQuickConvert(q, e)}
                      title={
                        q.convertedToInvoiceId
                          ? 'View Converted Invoice'
                          : 'Convert Quotation to Invoice'
                      }
                      className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                    </button>

                    {/* Duplicate */}
                    <button
                      type="button"
                      onClick={(e) => handleQuickDuplicate(q, e)}
                      title="Duplicate Quotation"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit */}
                    {onEditQuotation && (
                      <button
                        type="button"
                        onClick={() => onEditQuotation(q)}
                        title="Edit Quotation"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Select Detail Drawer */}
                    <button
                      type="button"
                      onClick={() => onSelectQuotation(q)}
                      title="Inspect Proposal"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <ChevronRight className="w-4 h-4" />
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
