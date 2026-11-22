import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Building,
  User,
  QrCode,
  Calendar,
  FileText,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  Sparkles,
  Receipt
} from 'lucide-react';
import {
  CrmPayment,
  CrmPaymentType,
  CrmPaymentMethod,
  CrmPaymentStatus,
  CrmInvoice,
  CrmClient,
  CrmFreelancer,
  CrmProject
} from '../../../../types/crm';
import {
  getStoredClients,
  getStoredFreelancers,
  getStoredProjects,
  getStoredInvoices,
  getStoredPayments,
  recordPayment,
  savePaymentWithCloud,
  getNextPaymentReference
} from '../../../../services/crmStorageService';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialInvoice?: CrmInvoice | null;
  initialPaymentType?: CrmPaymentType;
  initialFreelancerId?: string;
  initialProjectId?: string;
  onPaymentRecorded?: (payment: CrmPayment) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  initialInvoice,
  initialPaymentType = 'client_payment',
  initialFreelancerId,
  initialProjectId,
  onPaymentRecorded
}) => {
  // Master data
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [freelancers, setFreelancers] = useState<CrmFreelancer[]>([]);
  const [projects, setProjects] = useState<CrmProject[]>([]);
  const [invoices, setInvoices] = useState<CrmInvoice[]>([]);
  const [existingPayments, setExistingPayments] = useState<CrmPayment[]>([]);

  // Form state
  const [paymentType, setPaymentType] = useState<CrmPaymentType>(initialPaymentType);
  const [clientId, setClientId] = useState<string>('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [freelancerId, setFreelancerId] = useState<string>(initialFreelancerId || '');
  const [projectId, setProjectId] = useState<string>(initialProjectId || '');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<CrmPaymentMethod>('upi');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<CrmPaymentStatus>('completed');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [cloudError, setCloudError] = useState<string | null>(null);

  // Load master data on open
  useEffect(() => {
    if (isOpen) {
      const loadedClients = getStoredClients();
      const loadedFreelancers = getStoredFreelancers();
      const loadedProjects = getStoredProjects();
      const loadedInvoices = getStoredInvoices();
      const loadedPayments = getStoredPayments();

      setClients(loadedClients);
      setFreelancers(loadedFreelancers);
      setProjects(loadedProjects);
      setInvoices(loadedInvoices);
      setExistingPayments(loadedPayments);

      // Setup initial fields
      if (initialInvoice) {
        setPaymentType('client_payment');
        setClientId(initialInvoice.clientId || '');
        setSelectedInvoiceId(initialInvoice.id);
        setProjectId(initialInvoice.projectId || '');
        const bal = initialInvoice.balanceDue ?? (initialInvoice.totalAmount - (initialInvoice.amountPaid || 0));
        setAmount(bal > 0 ? bal : initialInvoice.totalAmount);
        setNotes(`Payment for Invoice ${initialInvoice.invoiceNumber}`);
      } else if (initialPaymentType) {
        setPaymentType(initialPaymentType);
        if (initialFreelancerId) setFreelancerId(initialFreelancerId);
        if (initialProjectId) setProjectId(initialProjectId);
      }

      setTransactionRef(getNextPaymentReference());
      setErrors({});
      setDuplicateWarning(null);
    }
  }, [isOpen, initialInvoice, initialPaymentType, initialFreelancerId, initialProjectId]);

  // When Client changes, reset or filter invoice
  const availableInvoices = React.useMemo(() => {
    if (!clientId) return invoices;
    return invoices.filter((i) => i.clientId === clientId);
  }, [invoices, clientId]);

  // When Invoice is selected, autofill details
  const handleSelectInvoice = (invId: string) => {
    setSelectedInvoiceId(invId);
    if (!invId) return;
    const inv = invoices.find((i) => i.id === invId);
    if (inv) {
      if (!clientId) setClientId(inv.clientId);
      if (inv.projectId) setProjectId(inv.projectId);
      const bal = inv.balanceDue ?? (inv.totalAmount - (inv.amountPaid || 0));
      setAmount(bal > 0 ? bal : inv.totalAmount);
      setNotes(`Payment for ${inv.invoiceNumber} (${inv.clientName})`);
    }
  };

  // Transaction ref duplicate check
  const handleTransactionRefChange = (ref: string) => {
    setTransactionRef(ref);
    if (!ref.trim()) {
      setDuplicateWarning(null);
      return;
    }
    const dup = existingPayments.find(
      (p) => p.transactionRef && p.transactionRef.toLowerCase() === ref.trim().toLowerCase()
    );
    if (dup) {
      setDuplicateWarning(
        `Transaction Ref "${ref}" already exists in payment ledger (${dup.paymentType === 'client_payment' ? 'Client' : 'Freelancer'}: ₹${dup.amount}). A unique suffix will be appended if unchanged.`
      );
    } else {
      setDuplicateWarning(null);
    }
  };

  const selectedInvoice = invoices.find((i) => i.id === selectedInvoiceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!amount || Number(amount) <= 0) {
      newErrors.amount = 'Please enter a valid payment amount greater than ₹0';
    }

    if (paymentType === 'client_payment') {
      if (!clientId && !selectedInvoiceId) {
        newErrors.clientId = 'Please select a client or link an invoice';
      }
    } else if (paymentType === 'freelancer_payout') {
      if (!freelancerId) {
        newErrors.freelancerId = 'Please select a freelancer for this payout';
      }
    }

    if (!paymentDate) {
      newErrors.paymentDate = 'Payment date is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const client = clients.find((c) => c.id === clientId);
    const fl = freelancers.find((f) => f.id === freelancerId);
    const proj = projects.find((p) => p.id === projectId);

    setIsSubmitting(true);
    setCloudError(null);

    try {
      const result = await savePaymentWithCloud({
        paymentType,
        amount: Number(amount),
        paymentMethod,
        transactionRef: transactionRef.trim() || undefined,
        paymentDate,
        status,
        receiptUrl: receiptUrl.trim() || undefined,
        notes: notes.trim() || undefined,
        invoiceId: paymentType === 'client_payment' ? selectedInvoiceId || undefined : undefined,
        invoiceNumber: paymentType === 'client_payment' && selectedInvoice ? selectedInvoice.invoiceNumber : undefined,
        clientId: paymentType === 'client_payment' ? clientId || undefined : undefined,
        clientName: paymentType === 'client_payment' ? client?.name || selectedInvoice?.clientName : undefined,
        freelancerId: paymentType === 'freelancer_payout' ? freelancerId : undefined,
        freelancerName: paymentType === 'freelancer_payout' ? fl?.name : undefined,
        projectId: projectId || undefined,
        projectTitle: proj?.title || selectedInvoice?.projectTitle || undefined
      });

      if (!result.success) {
        setCloudError(result.error || 'Failed to record transaction to cloud. Please check permissions and connection.');
        setIsSubmitting(false);
        return;
      }

      if (onPaymentRecorded) {
        onPaymentRecorded(result.payment);
      }
      onClose();
    } catch (err: any) {
      setCloudError(err?.message || 'Failed to record transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${paymentType === 'client_payment' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'}`}>
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Record Transaction</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Strict Ledger
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Log verified payment in Rohitwork financial accounts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Cloud / Permission Error Banner */}
          {cloudError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{cloudError}</span>
            </div>
          )}

          {/* 1. Transaction Direction / Type Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setPaymentType('client_payment')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  paymentType === 'client_payment'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Client Inflow (+ Received)</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentType('freelancer_payout')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  paymentType === 'freelancer_payout'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Freelancer Outflow (- Payout)</span>
              </button>
            </div>
          </div>

          {/* 2. Client Payment Specific Fields */}
          {paymentType === 'client_payment' && (
            <div className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Client <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={clientId}
                    onChange={(e) => {
                      setClientId(e.target.value);
                      setSelectedInvoiceId('');
                    }}
                    className={`w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border ${
                      errors.clientId ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  >
                    <option value="">-- Select Client --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ''}
                      </option>
                    ))}
                  </select>
                  {errors.clientId && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.clientId}</p>
                  )}
                </div>

                {/* Linked Invoice */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Linked Invoice (Auto-Reconciliation)
                  </label>
                  <select
                    value={selectedInvoiceId}
                    onChange={(e) => handleSelectInvoice(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- No specific invoice (Direct advance) --</option>
                    {availableInvoices.map((inv) => {
                      const bal = inv.balanceDue ?? (inv.totalAmount - (inv.amountPaid || 0));
                      return (
                        <option key={inv.id} value={inv.id}>
                          {inv.invoiceNumber} — ₹{inv.totalAmount.toLocaleString('en-IN')} (Due: ₹{bal.toLocaleString('en-IN')})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Selected Invoice Banner */}
              {selectedInvoice && (
                <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900/40 text-xs">
                  <div className="flex items-center justify-between font-semibold text-violet-900 dark:text-violet-200 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5" />
                      Invoice {selectedInvoice.invoiceNumber}
                    </span>
                    <span>Status: {selectedInvoice.status.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                    <span>Total: ₹{selectedInvoice.totalAmount.toLocaleString('en-IN')}</span>
                    <span>Paid So Far: ₹{(selectedInvoice.amountPaid || 0).toLocaleString('en-IN')}</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      Balance Due: ₹{(selectedInvoice.balanceDue ?? (selectedInvoice.totalAmount - (selectedInvoice.amountPaid || 0))).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Freelancer Payout Specific Fields */}
          {paymentType === 'freelancer_payout' && (
            <div className="space-y-4 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Freelancer */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Freelancer <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={freelancerId}
                    onChange={(e) => setFreelancerId(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border ${
                      errors.freelancerId ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  >
                    <option value="">-- Select Freelancer --</option>
                    {freelancers.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.skills?.[0] || 'Subcontractor'})
                      </option>
                    ))}
                  </select>
                  {errors.freelancerId && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.freelancerId}</p>
                  )}
                </div>

                {/* Project association */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Associated Project
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Select Project (Optional) --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.clientName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 4. Amount, Payment Method, Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0.00"
                  className={`w-full pl-8 pr-3 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border ${
                    errors.amount ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                />
              </div>
              {errors.amount && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.amount}</p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Method <span className="text-rose-500">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as CrmPaymentMethod)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="upi">UPI / QR Code</option>
                <option value="bank_transfer">Bank Transfer (NEFT / IMPS / RTGS)</option>
                <option value="stripe">Stripe / Credit / Debit Card</option>
                <option value="cash">Cash / Offline</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* 5. Transaction Reference & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* UTR / Transaction Ref */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Transaction Reference / UTR #
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => handleTransactionRefChange(e.target.value)}
                placeholder="e.g. UPI-948291048291 or UTR-20261115-01"
                className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {duplicateWarning && (
                <div className="p-2 mt-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{duplicateWarning}</span>
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CrmPaymentStatus)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="completed">Completed (Confirmed in Bank)</option>
                <option value="pending">Pending Verification</option>
                <option value="failed">Failed / Bounced</option>
              </select>
            </div>
          </div>

          {/* 6. Receipt URL & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Receipt / Screenshot URL (Optional)
              </label>
              <input
                type="url"
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Notes / Audit Remark
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. 50% milestone payment via Google Pay"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Updates invoice, project, and cashflow in real-time</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className={`px-5 py-2 text-xs font-bold rounded-xl text-white shadow-sm flex items-center gap-2 transition-all cursor-pointer ${
                isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
              } ${
                paymentType === 'client_payment'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Verifying & Persisting...' : 'Confirm & Record Transaction'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
