import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Receipt,
  Building,
  FolderKanban,
  Calendar,
  IndianRupee,
  Plus,
  Trash2,
  Sparkles,
  Percent,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import {
  CrmInvoice,
  CrmInvoiceItem,
  CrmInvoiceStatus,
  CrmClient,
  CrmProject,
  CrmQuotation
} from '../../../../types/crm';
import {
  getStoredClients,
  getStoredProjects,
  getStoredQuotations,
  saveStoredInvoice,
  saveInvoiceWithCloud,
  getNextInvoiceNumber,
  calculateInvoiceTotals
} from '../../../../services/crmStorageService';

interface AddInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceSaved: (invoice: CrmInvoice) => void;
  initialInvoice?: CrmInvoice | null;
  defaultClientId?: string;
  defaultProjectId?: string;
}

const PRESET_SERVICES = [
  { description: '4K Commercial Master Video Edit & Sound Foley', unitPrice: 35000 },
  { description: '3D CAD Photorealistic Modeling & Octane Renders', unitPrice: 30000 },
  { description: 'DaVinci Resolve Cinema Master Color Grading', unitPrice: 15000 },
  { description: 'Responsive Webflow SaaS Portal & CMS Integration', unitPrice: 45000 },
  { description: 'Corporate Visual Identity System & Brand Guidelines', unitPrice: 30000 },
  { description: 'Social Media 9:16 High-Conversion Reel Cutdowns (Pack of 3)', unitPrice: 18000 }
];

export const AddInvoiceModal: React.FC<AddInvoiceModalProps> = ({
  isOpen,
  onClose,
  onInvoiceSaved,
  initialInvoice,
  defaultClientId,
  defaultProjectId
}) => {
  const [clientsList, setClientsList] = useState<CrmClient[]>([]);
  const [projectsList, setProjectsList] = useState<CrmProject[]>([]);
  const [quotationsList, setQuotationsList] = useState<CrmQuotation[]>([]);

  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [selectedQuotationId, setSelectedQuotationId] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<CrmInvoiceStatus>('draft');
  const [paymentTerms, setPaymentTerms] = useState('Net 15 Days from Invoice Date');

  // Line Items
  const [items, setItems] = useState<CrmInvoiceItem[]>([
    {
      id: 'item_1',
      description: '4K Commercial Master Video Edit & Sound Foley',
      quantity: 1,
      unitPrice: 35000,
      amount: 35000
    }
  ]);

  // Adjustments
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [additionalCharges, setAdditionalCharges] = useState<number>(0);
  const [additionalChargesDescription, setAdditionalChargesDescription] = useState<string>('');
  const [isGstEnabled, setIsGstEnabled] = useState<boolean>(false);
  const [taxPercentage, setTaxPercentage] = useState<number>(18);
  const [notes, setNotes] = useState<string>('');

  // Load clients, projects, quotations on modal open
  useEffect(() => {
    if (isOpen) {
      const cls = getStoredClients();
      const prs = getStoredProjects();
      const qts = getStoredQuotations();
      setClientsList(cls);
      setProjectsList(prs);
      setQuotationsList(qts);

      const today = new Date().toISOString().split('T')[0];
      const defaultDue = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

      if (initialInvoice) {
        setInvoiceNumber(initialInvoice.invoiceNumber);
        setSelectedClientId(initialInvoice.clientId || '');
        setClientName(initialInvoice.clientName || '');
        setClientCompany(initialInvoice.clientCompany || '');
        setClientEmail(initialInvoice.clientEmail || '');
        setClientPhone(initialInvoice.clientPhone || '');
        setSelectedProjectId(initialInvoice.projectId || '');
        setProjectTitle(initialInvoice.projectTitle || '');
        setSelectedQuotationId(initialInvoice.quotationId || '');
        setIssueDate(initialInvoice.issueDate || today);
        setDueDate(initialInvoice.dueDate || defaultDue);
        setStatus(initialInvoice.status || 'draft');
        setPaymentTerms(initialInvoice.paymentTerms || 'Net 15 Days from Invoice Date');
        setItems(
          initialInvoice.items?.length
            ? initialInvoice.items
            : [
                {
                  id: 'item_1',
                  description: 'Creative Production Deliverable',
                  quantity: 1,
                  unitPrice: 10000,
                  amount: 10000
                }
              ]
        );
        setDiscountPercentage(initialInvoice.discountPercentage || 0);
        setAdditionalCharges(initialInvoice.additionalCharges || 0);
        setAdditionalChargesDescription(initialInvoice.additionalChargesDescription || '');
        setIsGstEnabled(initialInvoice.isGstEnabled || false);
        setTaxPercentage(initialInvoice.taxPercentage || 18);
        setNotes(initialInvoice.notes || '');
      } else {
        const nextNum = getNextInvoiceNumber();
        setInvoiceNumber(nextNum);
        setIssueDate(today);
        setDueDate(defaultDue);
        setStatus('draft');
        setPaymentTerms('Net 15 Days from Invoice Date');
        setDiscountPercentage(0);
        setAdditionalCharges(0);
        setAdditionalChargesDescription('');
        setIsGstEnabled(false);
        setTaxPercentage(18);
        setNotes('Payment is due within 15 days of invoice date. Thank you for partnering with RohitWork Creative Studios.');

        // Preset Client
        const preClient = cls.find((c) => c.id === defaultClientId) || cls[0];
        if (preClient) {
          setSelectedClientId(preClient.id);
          setClientName(preClient.name);
          setClientCompany(preClient.company || '');
          setClientEmail(preClient.email.includes('@client.rohitwork.in') ? '' : preClient.email);
          setClientPhone(preClient.phone || '');
        }

        // Preset Project
        const preProj = prs.find((p) => p.id === defaultProjectId);
        if (preProj) {
          setSelectedProjectId(preProj.id);
          setProjectTitle(preProj.title);
        } else {
          setSelectedProjectId('');
          setProjectTitle('');
        }
      }
    }
  }, [isOpen, initialInvoice, defaultClientId, defaultProjectId]);

  // Handle client selection change
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const found = clientsList.find((c) => c.id === clientId);
    if (found) {
      setClientName(found.name);
      setClientCompany(found.company || '');
      setClientEmail(found.email.includes('@client.rohitwork.in') ? '' : found.email);
      setClientPhone(found.phone || '');
    }
  };

  // Handle project selection change
  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    const found = projectsList.find((p) => p.id === projectId);
    if (found) {
      setProjectTitle(found.title);
      if (found.clientId && !selectedClientId) {
        handleClientChange(found.clientId);
      }
    } else {
      setProjectTitle('');
    }
  };

  // Handle quotation selection change
  const handleQuotationChange = (quotationId: string) => {
    setSelectedQuotationId(quotationId);
    const found = quotationsList.find((q) => q.id === quotationId);
    if (found) {
      if (found.clientId) handleClientChange(found.clientId);
      if (found.projectId) handleProjectChange(found.projectId);
      if (found.items && found.items.length > 0) {
        setItems(
          found.items.map((it, idx) => ({
            id: `item_${idx + 1}`,
            description: it.description,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            amount: it.amount
          }))
        );
      }
      setDiscountPercentage(found.discountPercentage || 0);
      setAdditionalCharges(found.additionalCharges || 0);
      setAdditionalChargesDescription(found.additionalChargesDescription || '');
      setIsGstEnabled(found.isGstEnabled || false);
    }
  };

  // Line item handlers
  const handleItemChange = (index: number, field: keyof CrmInvoiceItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index] };

    if (field === 'quantity') {
      const q = Math.max(1, parseInt(value) || 1);
      item.quantity = q;
      item.amount = Math.round(q * item.unitPrice * 100) / 100;
    } else if (field === 'unitPrice') {
      const p = Math.max(0, parseFloat(value) || 0);
      item.unitPrice = p;
      item.amount = Math.round(item.quantity * p * 100) / 100;
    } else if (field === 'description') {
      item.description = value;
    }

    updated[index] = item;
    setItems(updated);
  };

  const handleAddItem = () => {
    const newItem: CrmInvoiceItem = {
      id: `item_${Date.now()}_${items.length + 1}`,
      description: 'Creative Production Deliverable',
      quantity: 1,
      unitPrice: 15000,
      amount: 15000
    };
    setItems([...items, newItem]);
  };

  const handleAddPreset = (preset: { description: string; unitPrice: number }) => {
    const newItem: CrmInvoiceItem = {
      id: `item_${Date.now()}_${items.length + 1}`,
      description: preset.description,
      quantity: 1,
      unitPrice: preset.unitPrice,
      amount: preset.unitPrice
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  // Computed Totals
  const totals = useMemo(() => {
    return calculateInvoiceTotals(
      items,
      discountPercentage,
      additionalCharges,
      isGstEnabled,
      isGstEnabled ? taxPercentage : 0
    );
  }, [items, discountPercentage, additionalCharges, isGstEnabled, taxPercentage]);

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      alert('Please enter or select a client name.');
      return;
    }

    const result = await saveInvoiceWithCloud({
      id: initialInvoice ? initialInvoice.id : undefined,
      invoiceNumber: invoiceNumber.trim() || getNextInvoiceNumber(),
      quotationId: selectedQuotationId || undefined,
      clientId: selectedClientId,
      clientName: clientName.trim(),
      clientCompany: clientCompany.trim() || undefined,
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone.trim() || undefined,
      projectId: selectedProjectId || undefined,
      projectTitle: projectTitle.trim() || undefined,
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status,
      paymentTerms: paymentTerms.trim(),
      items,
      discountPercentage,
      additionalCharges,
      additionalChargesDescription: additionalChargesDescription.trim() || undefined,
      isGstEnabled,
      taxPercentage: isGstEnabled ? taxPercentage : 0,
      notes: notes.trim()
    });

    if (!result.success) {
      alert(result.error || 'Failed to save invoice to cloud. Please check permissions and connection.');
      return;
    }

    onInvoiceSaved(result.invoice);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {initialInvoice ? 'Edit Commercial Invoice' : 'Create Commercial Invoice'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Author branded tax invoices, manage itemized scopes, and configure payment terms.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Section 1: Client & Invoice Identity */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Invoice & Client Association
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Invoice Number */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Invoice Number *
                </label>
                <input
                  type="text"
                  required
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl font-mono text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Select Existing Client */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Existing Client
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={selectedClientId}
                    onChange={(e) => handleClientChange(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Choose Client...</option>
                    {clientsList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Project Link */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Optional Project Link
                </label>
                <div className="relative">
                  <FolderKanban className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={selectedProjectId}
                    onChange={(e) => handleProjectChange(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">No Project (Standalone Invoice)</option>
                    {projectsList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Client Details Row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Client / Contact Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nexora Health Tech"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nexora Technologies Pvt Ltd"
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="billing@client.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone (for WhatsApp Share)
                </label>
                <input
                  type="text"
                  placeholder="+91 98112 23344"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Dates & Status Row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Terms
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Net 15 Days from Invoice Date">Net 15 Days</option>
                  <option value="Due on Receipt">Due on Receipt</option>
                  <option value="Net 30 Days from Invoice Date">Net 30 Days</option>
                  <option value="50% Advance Required, Balance on Delivery">50% Advance Required</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Invoice Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CrmInvoiceStatus)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent to Client</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="paid">Paid in Full</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Line Items & Rates */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Service Deliverables & Commercial Rates
                </h3>
                <p className="text-[11px] text-slate-400">
                  Decimal-safe calculation in Indian Rupees (INR ₹).
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold text-xs border border-indigo-200/60 dark:border-indigo-800/60 hover:bg-indigo-100 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Line Item</span>
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                Quick Presets:
              </span>
              {PRESET_SERVICES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddPreset(preset)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium shrink-0 transition"
                >
                  + {preset.description.split(' ')[0]} ({`₹${preset.unitPrice.toLocaleString('en-IN')}`})
                </button>
              ))}
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={item.id || index}
                  className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                >
                  <span className="font-mono text-slate-400 font-semibold w-6 text-center shrink-0">
                    #{index + 1}
                  </span>

                  <div className="flex-1">
                    <input
                      type="text"
                      required
                      placeholder="Service Deliverable & Scope description..."
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-16">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg text-xs text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="w-28 relative">
                      <IndianRupee className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        className="w-full pl-6 pr-2 py-1.5 rounded-lg text-xs text-right font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="w-32 text-right font-mono font-bold text-slate-900 dark:text-white shrink-0 px-2">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      disabled={items.length <= 1}
                      className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Commercial Adjustments, Taxes & Totals */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Surcharges, GST Toggle, and Bank Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Taxes & Adjustments
              </h3>

              {/* Discount Percentage */}
              <div className="flex items-center gap-3">
                <label className="w-36 font-semibold text-slate-700 dark:text-slate-300">
                  Discount (%):
                </label>
                <div className="relative w-32">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-right pr-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Percent className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                {totals.discountAmount > 0 && (
                  <span className="text-emerald-600 font-mono font-semibold">
                    - ₹{totals.discountAmount.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {/* Additional Surcharges */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <label className="w-36 font-semibold text-slate-700 dark:text-slate-300">
                    Additional Charges (₹):
                  </label>
                  <div className="w-32">
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={additionalCharges}
                      onChange={(e) => setAdditionalCharges(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-right font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                {additionalCharges > 0 && (
                  <input
                    type="text"
                    placeholder="Charge description (e.g. Expedited 48h rush turnaround)"
                    value={additionalChargesDescription}
                    onChange={(e) => setAdditionalChargesDescription(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
              </div>

              {/* GST Toggle */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Goods & Services Tax (GST)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Standard agency billing is non-GST. Toggle on only if legally applicable.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isGstEnabled}
                      onChange={(e) => setIsGstEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {isGstEnabled && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    <span>GST Rate: 18% standard IGST / CGST+SGST</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Financial Calculation Box */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Financial Summary
              </h4>

              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                <span>Deliverables Subtotal:</span>
                <span className="font-mono font-semibold">
                  ₹{totals.subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {totals.discountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                  <span>Discount ({discountPercentage}%):</span>
                  <span className="font-mono font-semibold">
                    - ₹{totals.discountAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {totals.additionalCharges > 0 && (
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                  <span>Additional Charges:</span>
                  <span className="font-mono font-semibold">
                    + ₹{totals.additionalCharges.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                <span>{isGstEnabled ? 'GST @ 18%:' : 'GST / Taxes (Non-GST):'}</span>
                <span className="font-mono font-semibold">
                  {isGstEnabled ? `₹${totals.taxAmount.toLocaleString('en-IN')}` : '₹0.00'}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Grand Total (INR):
                </span>
                <span className="text-xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                  ₹{totals.total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Notes & Terms */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              Payment Instructions & Commercial Terms
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Decimal-safe currency in INR (₹)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition"
              >
                {initialInvoice ? 'Save Invoice Changes' : 'Create Invoice'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
