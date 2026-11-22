import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Building,
  Calendar,
  FileText,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Repeat,
  Tag,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import {
  CrmExpense,
  CrmExpenseCategory,
  CrmProject
} from '../../../../types/crm';
import {
  getStoredProjects,
  saveStoredExpense,
  saveExpenseWithCloud
} from '../../../../services/crmStorageService';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialExpense?: CrmExpense | null;
  onExpenseSaved?: (expense: CrmExpense) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  initialExpense,
  onExpenseSaved
}) => {
  const [projects, setProjects] = useState<CrmProject[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState<CrmExpenseCategory>('software');
  const [vendor, setVendor] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [taxDeductible, setTaxDeductible] = useState(true);
  const [projectId, setProjectId] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [cloudError, setCloudError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setProjects(getStoredProjects());

      if (initialExpense) {
        setTitle(initialExpense.title);
        setAmount(initialExpense.amount);
        setCategory(initialExpense.category);
        setVendor(initialExpense.vendor || '');
        setDate(initialExpense.date || new Date().toISOString().split('T')[0]);
        setIsRecurring(!!initialExpense.isRecurring);
        setRecurringFrequency(initialExpense.recurringFrequency || 'monthly');
        setTaxDeductible(initialExpense.taxDeductible !== false);
        setProjectId(initialExpense.projectId || '');
        setReceiptUrl(initialExpense.receiptUrl || '');
        setNotes(initialExpense.notes || '');
      } else {
        setTitle('');
        setAmount('');
        setCategory('software');
        setVendor('');
        setDate(new Date().toISOString().split('T')[0]);
        setIsRecurring(false);
        setRecurringFrequency('monthly');
        setTaxDeductible(true);
        setProjectId('');
        setReceiptUrl('');
        setNotes('');
      }
      setErrors({});
    }
  }, [isOpen, initialExpense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Expense title / description is required';
    }

    if (!amount || Number(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than ₹0';
    }

    if (!date) {
      newErrors.date = 'Expense date is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setCloudError(null);

    try {
      const result = await saveExpenseWithCloud({
        id: initialExpense?.id,
        title: title.trim(),
        amount: Number(amount),
        category,
        vendor: vendor.trim() || undefined,
        date,
        isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : undefined,
        taxDeductible,
        projectId: projectId || undefined,
        receiptUrl: receiptUrl.trim() || undefined,
        notes: notes.trim() || undefined
      });

      if (!result.success) {
        setCloudError(result.error || 'Failed to record expense. Please check permissions and connection.');
        setIsSubmitting(false);
        return;
      }

      if (onExpenseSaved) {
        onExpenseSaved(result.expense);
      }
      onClose();
    } catch (err: any) {
      setCloudError(err?.message || 'Failed to record expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {initialExpense ? 'Edit Business Expense' : 'Record Business Expense'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Log studio overhead, software subscriptions, and operating costs
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Cloud Error Banner */}
          {cloudError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{cloudError}</span>
            </div>
          )}

          {/* Title / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Expense Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Adobe Creative Cloud Pro Subscription"
              className={`w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border ${
                errors.title ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
              } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500`}
            />
            {errors.title && <p className="text-[11px] text-rose-500 mt-1">{errors.title}</p>}
          </div>

          {/* Amount & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500`}
                />
              </div>
              {errors.amount && <p className="text-[11px] text-rose-500 mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Expense Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CrmExpenseCategory)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="software">SaaS & Software Subscriptions</option>
                <option value="freelancer">Freelancer & Subcontractor Payout</option>
                <option value="studio_equipment">Studio Gear & Equipment</option>
                <option value="marketing">Marketing, Ads & Lead Gen</option>
                <option value="office">Office, Rent & Leased Lines</option>
                <option value="travel">Travel, Shoot & Logistics</option>
                <option value="legal_professional">Legal, CA & Accounting</option>
                <option value="other">Other Operational Overhead</option>
              </select>
            </div>
          </div>

          {/* Vendor & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vendor / Service Provider
              </label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="e.g. Adobe Systems, Figma, Airtel"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Expense Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Recurring Expense Settings */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-violet-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Recurring Fixed Overhead
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-violet-600"></div>
              </label>
            </div>

            {isRecurring && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3 items-center">
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Billing Cycle:
                </span>
                <select
                  value={recurringFrequency}
                  onChange={(e) => setRecurringFrequency(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="monthly">Monthly Recurring</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual / Yearly</option>
                </select>
              </div>
            )}
          </div>

          {/* Project & Tax Deductible */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Associated Project (Optional)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">-- General Agency Overhead --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.clientName})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={taxDeductible}
                  onChange={(e) => setTaxDeductible(e.target.checked)}
                  className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Tax Deductible Business Expense
                </span>
              </label>
            </div>
          </div>

          {/* Receipt URL & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Invoice / Bill URL
              </label>
              <input
                type="url"
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Internal Remarks
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Paid via corporate HDFC card"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-violet-500" />
            <span>Factored into monthly net cashflow metrics</span>
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
              className={`px-5 py-2 text-xs font-bold rounded-xl text-white bg-violet-600 hover:bg-violet-700 shadow-sm flex items-center gap-2 transition-all cursor-pointer ${
                isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Verifying & Persisting...' : initialExpense ? 'Update Expense' : 'Save Expense'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
