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
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  FileText,
  IndianRupee,
  ExternalLink
} from 'lucide-react';
import {
  CrmQuotation,
  CrmQuotationStatus,
  CrmClient,
  CrmProject
} from '../../../../types/crm';
import {
  updateQuotationStatus,
  convertQuotationToInvoice,
  duplicateStoredQuotation,
  deleteStoredQuotation,
  deleteQuotationWithCloud,
  normalizePhoneNumber
} from '../../../../services/crmStorageService';
import { QuotationStatusBadge, QuotationExpiryBadge } from './QuotationStatusBadge';

interface QuotationPreviewDrawerProps {
  quotation: CrmQuotation | null;
  isOpen: boolean;
  onClose: () => void;
  onEditQuotation?: (quotation: CrmQuotation) => void;
  onDuplicateQuotation?: (quotation: CrmQuotation) => void;
  onStatusChanged?: (quotation: CrmQuotation) => void;
  onNavigateToInvoice?: (invoiceId: string) => void;
}

export const QuotationPreviewDrawer: React.FC<QuotationPreviewDrawerProps> = ({
  quotation,
  isOpen,
  onClose,
  onEditQuotation,
  onDuplicateQuotation,
  onStatusChanged,
  onNavigateToInvoice
}) => {
  if (!isOpen || !quotation) return null;

  const [currentQuote, setCurrentQuote] = useState<CrmQuotation>(quotation);
  const [conversionMessage, setConversionMessage] = useState<string | null>(null);

  useEffect(() => {
    setCurrentQuote(quotation);
    setConversionMessage(null);
  }, [quotation]);

  const handlePrint = () => {
    window.print();
  };

  const handleStatusUpdate = (status: CrmQuotationStatus) => {
    const updated = updateQuotationStatus(currentQuote.id, status);
    if (updated) {
      setCurrentQuote(updated);
      if (onStatusChanged) onStatusChanged(updated);
    }
  };

  const handleConvertToInvoice = () => {
    if (currentQuote.convertedToInvoiceId) {
      if (onNavigateToInvoice) {
        onNavigateToInvoice(currentQuote.convertedToInvoiceId);
      }
      return;
    }

    const confirmConvert = window.confirm(
      `Convert quotation ${currentQuote.quotationNumber} into a formal tax invoice? This will set quotation status to "Accepted" and create a draft invoice.`
    );
    if (!confirmConvert) return;

    const invoice = convertQuotationToInvoice(currentQuote.id);
    if (invoice) {
      setConversionMessage(`Successfully created invoice ${invoice.invoiceNumber}!`);
      const updatedQuote = {
        ...currentQuote,
        status: 'accepted' as CrmQuotationStatus,
        convertedToInvoiceId: invoice.id,
        convertedAt: new Date().toISOString()
      };
      setCurrentQuote(updatedQuote);
      if (onStatusChanged) onStatusChanged(updatedQuote);
    }
  };

  const handleDuplicate = () => {
    const duplicated = duplicateStoredQuotation(currentQuote.id);
    if (duplicated) {
      alert(`Quotation duplicated as ${duplicated.quotationNumber}`);
      if (onDuplicateQuotation) onDuplicateQuotation(duplicated);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete quotation ${currentQuote.quotationNumber}?`
    );
    if (confirmDelete) {
      const res = await deleteQuotationWithCloud(currentQuote.id);
      if (!res.success && res.errorCode === 'permission-denied') {
        alert('Permission Denied: You do not have permission to delete quotation records.');
        return;
      }
      onClose();
      if (onStatusChanged) onStatusChanged({ ...currentQuote, archived: true });
    }
  };

  // Build pre-filled WhatsApp message
  const digits = normalizePhoneNumber(currentQuote.clientPhone || '');
  const whatsAppShareText = encodeURIComponent(
    `*Rohitwork Creative Studios — Scope Proposal*\n` +
      `Proposal Ref: *${currentQuote.quotationNumber}*\n` +
      `Client: ${currentQuote.clientName}\n` +
      `Project / Scope: ${currentQuote.projectTitle || 'Creative Production'}\n` +
      `Total Estimate: ₹${currentQuote.totalAmount.toLocaleString('en-IN')}\n` +
      (currentQuote.advanceAmount
        ? `Advance Required: ₹${currentQuote.advanceAmount.toLocaleString('en-IN')} (${currentQuote.advancePercentage || 50}%)\n`
        : '') +
      `Validity: Valid until ${new Date(currentQuote.validUntil).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}\n\n` +
      `Please review the complete scope proposal and let us know if you'd like to proceed!\n` +
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
          #quotation-printable-document, #quotation-printable-document * {
            visibility: visible;
          }
          #quotation-printable-document {
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
                {currentQuote.quotationNumber}
              </span>
              <QuotationStatusBadge status={currentQuote.status} size="md" />
              <QuotationExpiryBadge
                validUntil={currentQuote.validUntil}
                status={currentQuote.status}
              />
            </div>

            <div className="flex items-center gap-2">
              {/* WhatsApp Share */}
              {whatsAppDirectUrl ? (
                <a
                  href={whatsAppDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                  title="Share Proposal on WhatsApp to Client"
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

              {/* Convert to Invoice */}
              <button
                type="button"
                onClick={handleConvertToInvoice}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition"
                title={
                  currentQuote.convertedToInvoiceId
                    ? 'View Converted Invoice'
                    : 'Convert this quotation into a formal tax invoice'
                }
              >
                <Receipt className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {currentQuote.convertedToInvoiceId ? 'View Invoice' : 'Convert Invoice'}
                </span>
              </button>

              {/* Status Switcher Dropdown */}
              <select
                value={currentQuote.status}
                onChange={(e) => handleStatusUpdate(e.target.value as CrmQuotationStatus)}
                className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Declined</option>
                <option value="expired">Expired</option>
              </select>

              {/* More Actions: Edit, Duplicate, Delete */}
              {onEditQuotation && (
                <button
                  type="button"
                  onClick={() => onEditQuotation(currentQuote)}
                  title="Edit Quotation"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={handleDuplicate}
                title="Duplicate Quotation"
                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleDelete}
                title="Delete Quotation"
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

          {/* Conversion Notification Banner */}
          {conversionMessage && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800/60 p-3 px-6 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{conversionMessage}</span>
              </span>
              {currentQuote.convertedToInvoiceId && onNavigateToInvoice && (
                <button
                  type="button"
                  onClick={() => onNavigateToInvoice(currentQuote.convertedToInvoiceId!)}
                  className="font-bold underline ml-2 flex items-center gap-1"
                >
                  <span>Go to Invoices</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Document Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            {/* The A4-like Printable Paper Card */}
            <div
              id="quotation-printable-document"
              className="max-w-3xl mx-auto bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-12 transition-all"
            >
              {/* Agency Branded Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8">
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
                    High-Impact Post-Production, Cinematic Video Editing, 3D CAD Modeling & Custom SaaS Webflow Engineering.
                  </p>
                  <div className="mt-3 text-xs text-slate-500 space-y-0.5">
                    <p>
                      <strong>Email:</strong> workall724038@gmail.com
                    </p>
                    <p>
                      <strong>Portfolio:</strong> rohitwork.com
                    </p>
                    <p>
                      <strong>Studio:</strong> Indore, MP, India
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="inline-block text-[11px] font-bold uppercase tracking-widest px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200 mb-2">
                    Formal Scope Quotation
                  </span>
                  <div className="font-mono text-2xl font-black text-slate-950 tracking-tight">
                    {currentQuote.quotationNumber}
                  </div>
                  <div className="mt-3 text-xs text-slate-600 space-y-1">
                    <div>
                      <span className="text-slate-400">Date of Issue: </span>
                      <span className="font-medium">
                        {new Date(currentQuote.issueDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Valid Until: </span>
                      <span className="font-medium text-slate-900">
                        {new Date(currentQuote.validUntil).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {currentQuote.estimatedTimeline && (
                      <div>
                        <span className="text-slate-400">Estimated Timeline: </span>
                        <span className="font-semibold text-indigo-700">
                          {currentQuote.estimatedTimeline}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Client & Project Meta Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8 p-5 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Prepared Exclusively For:
                  </span>
                  <div className="text-base font-bold text-slate-950">
                    {currentQuote.clientName}
                  </div>
                  {currentQuote.clientCompany && (
                    <div className="text-xs font-semibold text-slate-700 mt-0.5">
                      {currentQuote.clientCompany}
                    </div>
                  )}
                  <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                    {currentQuote.clientEmail && !currentQuote.clientEmail.includes('@client.rohitwork.in') && (
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{currentQuote.clientEmail}</span>
                      </p>
                    )}
                    {currentQuote.clientPhone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{currentQuote.clientPhone}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Project & Scope Assignment:
                  </span>
                  <div className="text-base font-bold text-indigo-950">
                    {currentQuote.projectTitle || 'Creative Media & Tech Production'}
                  </div>
                  {currentQuote.convertedToInvoiceId && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-200">
                      <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Converted to Invoice</span>
                    </div>
                  )}
                  <div className="mt-2 text-xs text-slate-500">
                    <p>All intellectual work produced under Rohitwork Standards.</p>
                  </div>
                </div>
              </div>

              {/* Executive Scope Narrative */}
              {currentQuote.proposalScope && (
                <div className="mb-8">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Executive Scope of Work
                  </h3>
                  <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {currentQuote.proposalScope}
                  </div>
                </div>
              )}

              {/* Key Deliverables Summary */}
              {currentQuote.deliverablesSummary && (
                <div className="mb-8">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Key Deliverables Included
                  </h3>
                  <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                    {currentQuote.deliverablesSummary}
                  </div>
                </div>
              )}

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
                      {currentQuote.items && currentQuote.items.length > 0 ? (
                        currentQuote.items.map((item, index) => (
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
                            No service items specified.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Calculation Box */}
              <div className="flex flex-col sm:flex-row justify-end items-end gap-6 mb-8">
                <div className="w-full sm:w-80 p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-semibold">
                      ₹{currentQuote.subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {currentQuote.discountAmount && currentQuote.discountAmount > 0 ? (
                    <div className="flex justify-between items-center text-emerald-600">
                      <span>Discount:</span>
                      <span className="font-mono font-semibold">
                        - ₹{currentQuote.discountAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ) : null}

                  {currentQuote.additionalCharges && currentQuote.additionalCharges > 0 ? (
                    <div className="flex justify-between items-center text-slate-600">
                      <span>
                        Additional Charges
                        {currentQuote.additionalChargesDescription
                          ? ` (${currentQuote.additionalChargesDescription})`
                          : ''}
                        :
                      </span>
                      <span className="font-mono font-semibold">
                        + ₹{currentQuote.additionalCharges.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ) : null}

                  <div className="flex justify-between items-center text-slate-600">
                    <span>
                      {currentQuote.isGstEnabled
                        ? 'Goods & Services Tax (GST 18%):'
                        : 'GST / Taxes (Non-GST):'}
                    </span>
                    <span className="font-mono font-semibold">
                      {currentQuote.isGstEnabled && currentQuote.taxAmount
                        ? `₹${currentQuote.taxAmount.toLocaleString('en-IN')}`
                        : '₹0.00'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="text-sm font-extrabold text-slate-900">
                      Grand Total (INR):
                    </span>
                    <span className="text-lg font-black font-mono text-indigo-700">
                      ₹{currentQuote.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Advance Required Highlight */}
                  {currentQuote.advanceAmount && currentQuote.advanceAmount > 0 ? (
                    <div className="pt-2 border-t border-dashed border-slate-200 flex justify-between items-center text-indigo-900 bg-indigo-50/70 p-2 rounded-lg">
                      <span className="font-bold">
                        Advance ({currentQuote.advancePercentage || 50}%):
                      </span>
                      <span className="font-mono font-black text-sm">
                        ₹{currentQuote.advanceAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Payment Milestones Schedule */}
              {currentQuote.paymentMilestones && currentQuote.paymentMilestones.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Agreed Payment Milestones
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {currentQuote.paymentMilestones.map((ms, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm text-xs"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-900">{ms.label}</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono">
                            {ms.percentage}%
                          </span>
                        </div>
                        <div className="text-sm font-black font-mono text-slate-900 mb-1">
                          ₹{ms.amount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Due: {ms.dueDateOrStage || 'As agreed'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Revision & Support Policy */}
              {currentQuote.revisionPolicy && (
                <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>Revision & Turnaround Policy</span>
                  </h4>
                  <p>{currentQuote.revisionPolicy}</p>
                </div>
              )}

              {/* Standard Commercial Terms & Conditions */}
              {currentQuote.terms && (
                <div className="mb-8">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Commercial Terms & Agreements
                  </h3>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed whitespace-pre-line">
                    {currentQuote.terms}
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
                      Founder & Creative Director | Rohitwork
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
                    Client Acceptance:
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
