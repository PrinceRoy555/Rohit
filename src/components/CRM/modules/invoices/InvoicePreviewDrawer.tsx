import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Share2,
  Receipt,
  Edit,
  Copy,
  Trash2,
  Calendar,
  Building,
  User,
  Phone,
  Mail,
  FolderKanban,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  CreditCard,
  IndianRupee,
  ExternalLink,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';
import { CrmInvoice, CrmInvoiceStatus, CrmPayment } from '../../../../types/crm';
import {
  updateInvoiceStatus,
  duplicateStoredInvoice,
  deleteStoredInvoice,
  deleteInvoiceWithCloud,
  getStoredPayments,
  normalizePhoneNumber
} from '../../../../services/crmStorageService';
import { InvoiceStatusBadge, InvoiceDueBadge } from './InvoiceStatusBadge';

interface InvoicePreviewDrawerProps {
  invoice: CrmInvoice | null;
  isOpen: boolean;
  onClose: () => void;
  onEditInvoice?: (invoice: CrmInvoice) => void;
  onDuplicateInvoice?: (invoice: CrmInvoice) => void;
  onRecordPayment?: (invoice: CrmInvoice) => void;
  onStatusChanged?: (invoice: CrmInvoice) => void;
  onNavigateToQuotation?: (quotationId: string) => void;
}

export const InvoicePreviewDrawer: React.FC<InvoicePreviewDrawerProps> = ({
  invoice,
  isOpen,
  onClose,
  onEditInvoice,
  onDuplicateInvoice,
  onRecordPayment,
  onStatusChanged,
  onNavigateToQuotation
}) => {
  if (!isOpen || !invoice) return null;

  const [currentInv, setCurrentInv] = useState<CrmInvoice>(invoice);
  const [invoicePayments, setInvoicePayments] = useState<CrmPayment[]>([]);

  useEffect(() => {
    setCurrentInv(invoice);
    const allPayments = getStoredPayments();
    const related = allPayments.filter((p) => p.invoiceId === invoice.id);
    setInvoicePayments(related);
  }, [invoice]);

  const handlePrint = () => {
    window.print();
  };

  const handleStatusUpdate = (status: CrmInvoiceStatus) => {
    const updated = updateInvoiceStatus(currentInv.id, status);
    if (updated) {
      setCurrentInv(updated);
      if (onStatusChanged) onStatusChanged(updated);
    }
  };

  const handleDuplicate = () => {
    const dup = duplicateStoredInvoice(currentInv.id);
    if (dup) {
      alert(`Invoice duplicated as ${dup.invoiceNumber}`);
      if (onDuplicateInvoice) onDuplicateInvoice(dup);
    }
  };

  const handleDelete = async () => {
    const confirmDel = window.confirm(
      `Are you sure you want to delete invoice ${currentInv.invoiceNumber}?`
    );
    if (confirmDel) {
      const res = await deleteInvoiceWithCloud(currentInv.id);
      if (!res.success && res.errorCode === 'permission-denied') {
        alert('Permission Denied: You do not have permission to delete invoice records.');
        return;
      }
      onClose();
      if (onStatusChanged) onStatusChanged({ ...currentInv, status: 'cancelled' });
    }
  };

  // Build pre-filled WhatsApp billing message
  const digits = normalizePhoneNumber(currentInv.clientPhone || '');
  const whatsAppShareText = encodeURIComponent(
    `*Rohitwork Creative Studios — Commercial Invoice*\n` +
      `Invoice Ref: *${currentInv.invoiceNumber}*\n` +
      `Client: ${currentInv.clientName}\n` +
      `Project / Scope: ${currentInv.projectTitle || 'Creative Production'}\n` +
      `Total Invoice Amount: ₹${currentInv.total.toLocaleString('en-IN')}\n` +
      `Amount Received: ₹${currentInv.amountPaid.toLocaleString('en-IN')}\n` +
      `*Balance Outstanding: ₹${currentInv.balanceDue.toLocaleString('en-IN')}*\n` +
      `Due Date: ${new Date(currentInv.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}\n\n` +
      `*Payment Transfer Details:*\n` +
      `UPI ID: 7732869027@paytm\n` +
      `Bank: HDFC Bank Ltd | A/C: 917732869027 | IFSC: HDFC0001824\n\n` +
      `Kindly share the transaction UTR once the transfer is initiated. Thank you!\n` +
      `Rohit Verma | Rohitwork Agency`
  );

  const whatsAppDirectUrl = digits ? `https://wa.me/91${digits}?text=${whatsAppShareText}` : null;
  const whatsAppAgencyUrl = `https://wa.me/message/H4JLHPJ3NNGOK1?text=${whatsAppShareText}`;

  return (
    <>
      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-printable-document, #invoice-printable-document * {
            visibility: visible;
          }
          #invoice-printable-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end no-print">
        <div
          className="w-full max-w-4xl bg-slate-100 dark:bg-slate-950 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
          role="dialog"
        >
          {/* Top Control Bar (Screen Only) */}
          <div className="p-4 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-100 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {currentInv.invoiceNumber}
              </span>
              <InvoiceStatusBadge status={currentInv.status} size="md" />
              <InvoiceDueBadge dueDate={currentInv.dueDate} status={currentInv.status} />
            </div>

            <div className="flex items-center gap-2">
              {/* Record Payment Button */}
              {currentInv.balanceDue > 0 && onRecordPayment && (
                <button
                  type="button"
                  onClick={() => onRecordPayment(currentInv)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                  title="Record client payment for this invoice"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Record Payment</span>
                </button>
              )}

              {/* WhatsApp Share */}
              {whatsAppDirectUrl ? (
                <a
                  href={whatsAppDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold transition"
                  title="Share Invoice on WhatsApp to Client"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
              ) : (
                <a
                  href={whatsAppAgencyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold transition"
                  title="Share via Agency WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Agency WA</span>
                </a>
              )}

              {/* Print / Download PDF */}
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                title="Print or Save as PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print / PDF</span>
              </button>

              {/* Status Switcher Dropdown */}
              <select
                value={currentInv.status}
                onChange={(e) => handleStatusUpdate(e.target.value as CrmInvoiceStatus)}
                className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="paid">Paid in Full</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Edit */}
              {onEditInvoice && (
                <button
                  type="button"
                  onClick={() => onEditInvoice(currentInv)}
                  title="Edit Invoice"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}

              {/* Duplicate */}
              <button
                type="button"
                onClick={handleDuplicate}
                title="Duplicate Invoice"
                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Copy className="w-4 h-4" />
              </button>

              {/* Delete */}
              <button
                type="button"
                onClick={handleDelete}
                title="Delete Invoice"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Document Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            {/* The A4-like Printable Paper Card */}
            <div
              id="invoice-printable-document"
              className="max-w-3xl mx-auto bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-12 transition-all"
            >
              {/* Agency Branded Header */}
              <div className="flex flex-col sm:row justify-between items-start gap-6 border-b border-slate-200 pb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center font-black tracking-wider text-sm shadow-md">
                      RW
                    </div>
                    <div>
                      <h1 className="text-xl font-black text-slate-950 tracking-tight leading-none uppercase">
                        ROHITWORK
                      </h1>
                      <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-widest mt-0.5">
                        Creative & Tech Studios
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 max-w-sm leading-relaxed">
                    Commercial Post-Production, Cinematic Video Editing, 3D CAD Modeling & Custom SaaS Engineering.
                  </p>
                  <div className="mt-3 text-xs text-slate-500 space-y-0.5">
                    <p>
                      <strong>Email:</strong> workall724038@gmail.com
                    </p>
                    <p>
                      <strong>Website:</strong> rohitwork.com
                    </p>
                    <p>
                      <strong>Studio:</strong> Jaipur / Indore, India
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="inline-block text-[11px] font-bold uppercase tracking-widest px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200 mb-2">
                    {currentInv.isGstEnabled ? 'Official Tax Invoice' : 'Commercial Invoice'}
                  </span>
                  <div className="font-mono text-2xl font-black text-slate-950 tracking-tight">
                    {currentInv.invoiceNumber}
                  </div>
                  <div className="mt-3 text-xs text-slate-600 space-y-1">
                    <div>
                      <span className="text-slate-400">Date of Issue: </span>
                      <span className="font-medium">
                        {new Date(currentInv.issueDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Due Date: </span>
                      <span className="font-semibold text-slate-900">
                        {new Date(currentInv.dueDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {currentInv.quotationNumber && (
                      <div className="flex items-center sm:justify-end gap-1 text-[11px] text-indigo-600">
                        <FileSpreadsheet className="w-3 h-3" />
                        <span>Proposal Ref: {currentInv.quotationNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Client & Project Meta Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8 p-5 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Billed Exclusively To:
                  </span>
                  <div className="text-base font-bold text-slate-950">
                    {currentInv.clientName}
                  </div>
                  {currentInv.clientCompany && (
                    <div className="text-xs font-semibold text-slate-700 mt-0.5">
                      {currentInv.clientCompany}
                    </div>
                  )}
                  <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                    {currentInv.clientEmail && !currentInv.clientEmail.includes('@client.rohitwork.in') && (
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{currentInv.clientEmail}</span>
                      </p>
                    )}
                    {currentInv.clientPhone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{currentInv.clientPhone}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Project Deliverable & Terms:
                  </span>
                  <div className="text-base font-bold text-indigo-950">
                    {currentInv.projectTitle || 'Creative Media & Tech Production'}
                  </div>
                  <div className="mt-2 text-xs text-slate-600">
                    <p>
                      <strong>Terms:</strong> {currentInv.paymentTerms || 'Net 15 Days from Invoice Date'}
                    </p>
                    <p className="text-slate-400 mt-0.5">
                      Work completed according to agreed scope specifications.
                    </p>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="mb-8">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Service Deliverables & Commercial Breakdown
                </h3>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">#</th>
                        <th className="py-2.5 px-3">Description & Scope Item</th>
                        <th className="py-2.5 px-3 w-16 text-center">Qty</th>
                        <th className="py-2.5 px-3 w-28 text-right">Unit Rate (₹)</th>
                        <th className="py-2.5 px-3 w-32 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {currentInv.items && currentInv.items.length > 0 ? (
                        currentInv.items.map((item, index) => (
                          <tr key={item.id || index} className="hover:bg-slate-50/50">
                            <td className="py-3 px-3 text-center text-slate-400 font-medium">
                              {index + 1}
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-semibold text-slate-900 block">
                                {item.description}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center font-medium">
                              {item.quantity}
                            </td>
                            <td className="py-3 px-3 text-right font-mono">
                              ₹{item.unitPrice.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                              ₹{item.amount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-slate-400 italic">
                            No service items recorded.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Calculation Box */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
                {/* Bank Transfer & UPI Details */}
                <div className="w-full sm:max-w-xs p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                    Bank & Digital Payment Remittance
                  </h4>
                  <p>
                    <strong>Bank Name:</strong> {currentInv.bankDetails?.bankName || 'HDFC Bank Ltd'}
                  </p>
                  <p>
                    <strong>Account Holder:</strong> {currentInv.bankDetails?.accountHolder || 'Rohit Verma'}
                  </p>
                  <p>
                    <strong>Account Number:</strong>{' '}
                    <span className="font-mono">{currentInv.bankDetails?.accountNumber || '917732869027'}</span>
                  </p>
                  <p>
                    <strong>IFSC Code:</strong>{' '}
                    <span className="font-mono">{currentInv.bankDetails?.ifsc || 'HDFC0001824'}</span>
                  </p>
                  <p className="pt-1 border-t border-slate-200">
                    <strong>UPI Payment ID:</strong>{' '}
                    <span className="font-mono text-indigo-700 font-bold">
                      {currentInv.bankDetails?.upiId || '7732869027@paytm'}
                    </span>
                  </p>
                </div>

                {/* Totals Summary */}
                <div className="w-full sm:w-80 p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Deliverables Subtotal:</span>
                    <span className="font-mono font-semibold">
                      ₹{currentInv.subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {currentInv.discountAmount && currentInv.discountAmount > 0 ? (
                    <div className="flex justify-between items-center text-emerald-600">
                      <span>Discount ({currentInv.discountPercentage}%):</span>
                      <span className="font-mono font-semibold">
                        - ₹{currentInv.discountAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ) : null}

                  {currentInv.additionalCharges && currentInv.additionalCharges > 0 ? (
                    <div className="flex justify-between items-center text-slate-600">
                      <span>
                        Additional Charges
                        {currentInv.additionalChargesDescription
                          ? ` (${currentInv.additionalChargesDescription})`
                          : ''}
                        :
                      </span>
                      <span className="font-mono font-semibold">
                        + ₹{currentInv.additionalCharges.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ) : null}

                  <div className="flex justify-between items-center text-slate-600">
                    <span>
                      {currentInv.isGstEnabled
                        ? 'Goods & Services Tax (GST 18%):'
                        : 'GST / Taxes (Non-GST):'}
                    </span>
                    <span className="font-mono font-semibold">
                      {currentInv.isGstEnabled && currentInv.taxAmount
                        ? `₹${currentInv.taxAmount.toLocaleString('en-IN')}`
                        : '₹0.00'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="text-sm font-extrabold text-slate-900">
                      Grand Total (INR):
                    </span>
                    <span className="text-lg font-black font-mono text-indigo-700">
                      ₹{currentInv.total.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-emerald-700 font-semibold pt-1">
                    <span>Total Amount Paid:</span>
                    <span className="font-mono">
                      ₹{currentInv.amountPaid.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-dashed border-slate-200 flex justify-between items-center bg-indigo-50/70 p-2 rounded-lg text-indigo-950">
                    <span className="font-bold">Balance Due:</span>
                    <span className="font-mono font-black text-sm">
                      ₹{currentInv.balanceDue.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment History Table (If Payments Exist) */}
              {invoicePayments.length > 0 && (
                <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Recorded Payment Transactions ({invoicePayments.length})</span>
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="text-slate-500 font-semibold border-b border-slate-200">
                          <th className="py-1 px-2">Date</th>
                          <th className="py-1 px-2">Ref / UTR</th>
                          <th className="py-1 px-2">Method</th>
                          <th className="py-1 px-2 text-right">Amount (₹)</th>
                          <th className="py-1 px-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {invoicePayments.map((p) => (
                          <tr key={p.id}>
                            <td className="py-2 px-2 text-slate-600 font-medium">
                              {new Date(p.paymentDate).toLocaleDateString('en-IN')}
                            </td>
                            <td className="py-2 px-2 font-mono text-slate-800">
                              {p.transactionRef || 'N/A'}
                            </td>
                            <td className="py-2 px-2 uppercase text-slate-600 font-semibold">
                              {p.paymentMethod}
                            </td>
                            <td className="py-2 px-2 text-right font-mono font-bold text-emerald-700">
                              +₹{p.amount.toLocaleString('en-IN')}
                            </td>
                            <td className="py-2 px-2 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Notes & Terms */}
              {currentInv.notes && (
                <div className="mb-8">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Commercial Terms & Notes
                  </h3>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {currentInv.notes}
                  </div>
                </div>
              )}

              {/* Formal Authorization Sign-off Section */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
                    Authorized Signatory:
                  </div>
                  <div className="space-y-1">
                    <div className="font-serif italic text-lg text-slate-900">
                      Rohit Verma
                    </div>
                    <div className="text-xs font-bold text-slate-900">
                      Rohit Verma
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Founder & Creative Director | RohitWork Studios
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
                    Client Acknowledgment:
                  </div>
                  <div className="space-y-1">
                    <div className="h-6 border-b border-dashed border-slate-300 w-48 sm:ml-auto"></div>
                    <div className="text-xs font-medium text-slate-700">
                      Authorized Signature & Seal
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Date: ________________________
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
