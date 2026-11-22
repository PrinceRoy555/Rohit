import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  FileSpreadsheet,
  Building,
  FolderKanban,
  Calendar,
  IndianRupee,
  Plus,
  Trash2,
  AlertTriangle,
  Sparkles,
  Percent,
  CheckCircle2,
  FileText
} from 'lucide-react';
import {
  CrmQuotation,
  CrmQuotationStatus,
  CrmQuotationItem,
  CrmQuotationMilestone,
  CrmClient,
  CrmProject
} from '../../../../types/crm';
import {
  getStoredClients,
  getStoredProjects,
  saveStoredQuotation,
  saveQuotationWithCloud,
  getNextQuotationNumber,
  calculateQuotationTotals
} from '../../../../services/crmStorageService';

interface AddQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuotationSaved: (quotation: CrmQuotation) => void;
  initialQuotation?: CrmQuotation | null;
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

export const AddQuotationModal: React.FC<AddQuotationModalProps> = ({
  isOpen,
  onClose,
  onQuotationSaved,
  initialQuotation,
  defaultClientId,
  defaultProjectId
}) => {
  const [clientsList, setClientsList] = useState<CrmClient[]>([]);
  const [projectsList, setProjectsList] = useState<CrmProject[]>([]);

  // Form State
  const [quotationNumber, setQuotationNumber] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  const [projectId, setProjectId] = useState('');
  const [projectTitle, setProjectTitle] = useState('');

  const [issueDate, setIssueDate] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [status, setStatus] = useState<CrmQuotationStatus>('draft');

  const [proposalScope, setProposalScope] = useState('');
  const [deliverablesSummary, setDeliverablesSummary] = useState('');
  const [estimatedTimeline, setEstimatedTimeline] = useState('');

  // Line items
  const [items, setItems] = useState<CrmQuotationItem[]>([]);

  // Financial adjustments
  const [discountPercentage, setDiscountPercentage] = useState<number | ''>(0);
  const [additionalCharges, setAdditionalCharges] = useState<number | ''>(0);
  const [additionalChargesDescription, setAdditionalChargesDescription] = useState('');

  // Non-GST by default
  const [isGstEnabled, setIsGstEnabled] = useState(false);
  const [taxPercentage, setTaxPercentage] = useState<number | ''>(18);

  // Advance & Milestones
  const [advancePercentage, setAdvancePercentage] = useState<number>(50);

  // Policies
  const [terms, setTerms] = useState('');
  const [revisionPolicy, setRevisionPolicy] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(initialQuotation && initialQuotation.id);

  useEffect(() => {
    if (!isOpen) return;

    const cList = getStoredClients();
    const pList = getStoredProjects();
    setClientsList(cList);
    setProjectsList(pList);

    if (initialQuotation) {
      setQuotationNumber(initialQuotation.quotationNumber);
      setClientId(initialQuotation.clientId || '');
      setClientName(initialQuotation.clientName || '');
      setClientCompany(initialQuotation.clientCompany || '');
      setClientEmail(initialQuotation.clientEmail || '');
      setClientPhone(initialQuotation.clientPhone || '');

      setProjectId(initialQuotation.projectId || '');
      setProjectTitle(initialQuotation.projectTitle || '');

      setIssueDate(initialQuotation.issueDate || '');
      setValidUntil(initialQuotation.validUntil || '');
      setStatus(initialQuotation.status || 'draft');

      setProposalScope(initialQuotation.proposalScope || '');
      setDeliverablesSummary(initialQuotation.deliverablesSummary || '');
      setEstimatedTimeline(initialQuotation.estimatedTimeline || '');

      setItems(initialQuotation.items || []);
      setDiscountPercentage(initialQuotation.discountPercentage ?? 0);
      setAdditionalCharges(initialQuotation.additionalCharges ?? 0);
      setAdditionalChargesDescription(initialQuotation.additionalChargesDescription || '');

      setIsGstEnabled(Boolean(initialQuotation.isGstEnabled));
      setTaxPercentage(initialQuotation.taxPercentage ?? 18);
      setAdvancePercentage(initialQuotation.advancePercentage ?? 50);

      setTerms(initialQuotation.terms || '');
      setRevisionPolicy(initialQuotation.revisionPolicy || '');
      setNotes(initialQuotation.notes || '');
    } else {
      const today = new Date().toISOString().split('T')[0];
      const expiry = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];

      const initialQuoteNum = getNextQuotationNumber();
      setQuotationNumber(initialQuoteNum);

      const targetClient = defaultClientId
        ? cList.find((c) => c.id === defaultClientId)
        : cList.length > 0
        ? cList[0]
        : null;

      setClientId(targetClient ? targetClient.id : '');
      setClientName(targetClient ? targetClient.name : '');
      setClientCompany(targetClient ? targetClient.company || '' : '');
      setClientEmail(targetClient ? targetClient.email || '' : '');
      setClientPhone(targetClient ? targetClient.phone || '' : '');

      setProjectId(defaultProjectId || '');
      setProjectTitle('');

      setIssueDate(today);
      setValidUntil(expiry);
      setStatus('draft');

      setProposalScope('Creative production and post-production delivery according to agency specifications.');
      setDeliverablesSummary('• 4K Video Master Cut\n• High-Resolution Render Stills\n• Formatted Social Media Edits');
      setEstimatedTimeline('10-14 business days from kickoff deposit');

      setItems([
        {
          id: 'item_1',
          description: '4K Commercial Master Video Edit & Sound Foley',
          quantity: 1,
          unitPrice: 35000,
          amount: 35000
        },
        {
          id: 'item_2',
          description: 'DaVinci Resolve Cinema Master Color Grading',
          quantity: 1,
          unitPrice: 15000,
          amount: 15000
        }
      ]);

      setDiscountPercentage(0);
      setAdditionalCharges(0);
      setAdditionalChargesDescription('');
      setIsGstEnabled(false);
      setTaxPercentage(18);
      setAdvancePercentage(50);

      setTerms(
        '1. 50% advance deposit is required to schedule and commence production.\n2. Final deliverables, source files, and high-resolution master exports will be transferred upon full settlement of invoice.\n3. Client provides all brand assets, trademarks, and references in high resolution.'
      );
      setRevisionPolicy(
        '2 rounds of creative revisions are included at no additional charge. Subsequent revision rounds will be billed at ₹1,500/hour.'
      );
      setNotes('');
    }
    setErrors({});
  }, [isOpen, initialQuotation, defaultClientId, defaultProjectId]);

  // Handle Client Selection
  const handleClientChange = (selectedId: string) => {
    setClientId(selectedId);
    const matched = clientsList.find((c) => c.id === selectedId);
    if (matched) {
      setClientName(matched.name);
      setClientCompany(matched.company || '');
      setClientEmail(matched.email || '');
      setClientPhone(matched.phone || '');
    }
  };

  // Handle Project Selection
  const handleProjectChange = (selectedProjId: string) => {
    setProjectId(selectedProjId);
    const matched = projectsList.find((p) => p.id === selectedProjId);
    if (matched) {
      setProjectTitle(matched.title);
      if (!clientId && matched.clientId) {
        handleClientChange(matched.clientId);
      }
    } else {
      setProjectTitle('');
    }
  };

  // Line Item Management
  const handleUpdateItem = (id: string, field: 'description' | 'quantity' | 'unitPrice', val: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: val };
        const q = Math.max(1, Number(field === 'quantity' ? val : item.quantity) || 1);
        const p = Math.max(0, Number(field === 'unitPrice' ? val : item.unitPrice) || 0);
        updated.quantity = q;
        updated.unitPrice = p;
        updated.amount = Math.round(q * p * 100) / 100;
        return updated;
      })
    );
  };

  const handleAddItem = () => {
    const newItem: CrmQuotationItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      description: '',
      quantity: 1,
      unitPrice: 10000,
      amount: 10000
    };
    setItems([...items, newItem]);
  };

  const handleAddPreset = (preset: { description: string; unitPrice: number }) => {
    const newItem: CrmQuotationItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      description: preset.description,
      quantity: 1,
      unitPrice: preset.unitPrice,
      amount: preset.unitPrice
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((it) => it.id !== id));
  };

  // Live Computed Financials
  const computedTotals = useMemo(() => {
    return calculateQuotationTotals(
      items,
      Number(discountPercentage) || 0,
      Number(additionalCharges) || 0,
      isGstEnabled,
      Number(taxPercentage) || 0,
      advancePercentage
    );
  }, [items, discountPercentage, additionalCharges, isGstEnabled, taxPercentage, advancePercentage]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!clientName.trim()) {
      errs.client = 'Client name is required.';
    }
    if (items.length === 0) {
      errs.items = 'At least one line item is required.';
    } else {
      const hasEmptyDesc = items.some((it) => !it.description.trim());
      if (hasEmptyDesc) errs.items = 'Please provide descriptions for all line items.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await saveQuotationWithCloud({
        id: initialQuotation?.id,
        quotationNumber: quotationNumber.trim() || undefined,
        clientId: clientId || undefined,
        clientName: clientName.trim(),
        clientCompany: clientCompany.trim() || undefined,
        clientEmail: clientEmail.trim(),
        clientPhone: clientPhone.trim() || undefined,
        projectId: projectId || undefined,
        projectTitle: projectTitle.trim() || undefined,
        issueDate: issueDate || new Date().toISOString().split('T')[0],
        validUntil: validUntil || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        proposalScope: proposalScope.trim() || undefined,
        deliverablesSummary: deliverablesSummary.trim() || undefined,
        estimatedTimeline: estimatedTimeline.trim() || undefined,
        items,
        discountPercentage: Number(discountPercentage) || 0,
        additionalCharges: Number(additionalCharges) || 0,
        additionalChargesDescription: additionalChargesDescription.trim() || undefined,
        isGstEnabled,
        taxPercentage: isGstEnabled ? Number(taxPercentage) || 18 : 0,
        advancePercentage,
        status,
        terms: terms.trim() || undefined,
        revisionPolicy: revisionPolicy.trim() || undefined,
        notes: notes.trim() || undefined
      });

      if (!result.success) {
        setErrors({ form: result.error || 'Failed to save quotation. Please verify permissions and connection.' });
        setIsSubmitting(false);
        return;
      }

      onQuotationSaved(result.quotation);
      onClose();
    } catch (err) {
      console.error('Error saving quotation:', err);
      setErrors({ form: 'Failed to save quotation. Please verify input amounts.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEditing ? `Edit Quotation ${quotationNumber}` : 'Create Commercial Proposal & Quotation'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate professional service scopes, multi-item rates, and decimal-safe payment terms.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-6 space-y-6 flex-1">
          {errors.form && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Section 1: Client & Quotation Metadata */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Client & Proposal Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Quotation Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={quotationNumber}
                  onChange={(e) => setQuotationNumber(e.target.value)}
                  placeholder="RW-QT-2026-001"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Existing Client
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={clientId}
                    onChange={(e) => handleClientChange(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select or Type Below...</option>
                    {clientsList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Optional Project Link
                </label>
                <div className="relative">
                  <FolderKanban className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={projectId}
                    onChange={(e) => handleProjectChange(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">No Project (Standalone Quote)</option>
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Client / Contact Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border ${
                    errors.client ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  } rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  placeholder="e.g. Nexora Health Tech"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@company.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Phone (for WhatsApp Share)
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Dates & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Issue Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Valid Until
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Quotation Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CrmQuotationStatus)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="draft">Draft (Private)</option>
                  <option value="sent">Sent to Client</option>
                  <option value="accepted">Accepted (Ready for Invoice)</option>
                  <option value="rejected">Declined</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Proposal Scope & Deliverables */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Proposal Scope & Creative Brief
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Project Scope & Technical Description
                </label>
                <textarea
                  value={proposalScope}
                  onChange={(e) => setProposalScope(e.target.value)}
                  rows={3}
                  placeholder="Detailed narrative describing the creative concept, visual style, and execution framework..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Deliverables Summary & Format Specs
                </label>
                <textarea
                  value={deliverablesSummary}
                  onChange={(e) => setDeliverablesSummary(e.target.value)}
                  rows={3}
                  placeholder="• 4K Video Master Cut&#10;• High-Resolution Render Stills&#10;• Formatted Social Media Edits"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Estimated Delivery Timeline
              </label>
              <input
                type="text"
                value={estimatedTimeline}
                onChange={(e) => setEstimatedTimeline(e.target.value)}
                placeholder="e.g. 10-14 business days from kickoff deposit"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Section 3: Line Items Builder */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Commercial Line Items & Rates
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Decimal-safe calculation in Indian Rupees (INR ₹).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <span className="text-[11px] text-slate-400 font-semibold shrink-0">Quick Presets:</span>
              {PRESET_SERVICES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddPreset(preset)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 transition-colors shrink-0"
                >
                  + {preset.description.split(' ')[0]} {preset.description.split(' ')[1]} (₹{preset.unitPrice.toLocaleString('en-IN')})
                </button>
              ))}
            </div>

            {/* Line items table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3 w-1/2">Service Description</th>
                    <th className="py-2.5 px-3 w-20">Qty</th>
                    <th className="py-2.5 px-3 w-32">Rate (₹)</th>
                    <th className="py-2.5 px-3 w-32 text-right">Amount (₹)</th>
                    <th className="py-2.5 px-3 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-3 text-slate-400 font-bold">{index + 1}</td>
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                          placeholder="e.g. 4K Commercial Master Cut"
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(item.id, 'unitPrice', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-right"
                        />
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={items.length <= 1}
                          className="text-slate-400 hover:text-red-500 disabled:opacity-30 p-1 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {errors.items && <p className="text-[11px] text-red-500">{errors.items}</p>}
          </div>

          {/* Section 4: Adjustments & Financial Summary Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800 items-start">
            {/* Left: Discounts, Additional Fees & Non-GST Toggle */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Discounts & Surcharges
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Discount (%)
                  </label>
                  <div className="relative">
                    <Percent className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercentage}
                      onChange={(e) =>
                        setDiscountPercentage(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Additional Charges (₹)
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="0"
                      value={additionalCharges}
                      onChange={(e) =>
                        setAdditionalCharges(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {Number(additionalCharges) > 0 && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Charge Reason (e.g. Rush 48-Hour Turnaround / Hard Drive Shipping)
                  </label>
                  <input
                    type="text"
                    value={additionalChargesDescription}
                    onChange={(e) => setAdditionalChargesDescription(e.target.value)}
                    placeholder="e.g. Express 48-hour delivery fee"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}

              {/* GST Toggle Checkbox (Non-GST by default) */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGstEnabled}
                    onChange={(e) => setIsGstEnabled(e.target.checked)}
                    className="w-4 h-4 rounded-md text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Enable GST Invoice Tax
                  </span>
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-6.5">
                  {isGstEnabled
                    ? 'GST will be calculated and displayed on the quote.'
                    : 'Non-GST proposal (No tax automatically added).'}
                </p>

                {isGstEnabled && (
                  <div className="pl-6.5 pt-2 flex items-center gap-2">
                    <span className="text-xs text-slate-600 dark:text-slate-300">GST Rate (%):</span>
                    <input
                      type="number"
                      min="0"
                      max="28"
                      value={taxPercentage}
                      onChange={(e) => setTaxPercentage(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-20 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-center font-bold"
                    />
                  </div>
                )}
              </div>

              {/* Advance Requirement */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kickoff Advance Deposit Requirement: <span className="font-bold text-indigo-600">{advancePercentage}%</span> (₹{computedTotals.advanceAmount.toLocaleString('en-IN')})
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={advancePercentage}
                  onChange={(e) => setAdvancePercentage(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Right: Calculated Ledger Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Financial Summary (INR)
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal ({items.length} items):</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ₹{computedTotals.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {computedTotals.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount ({discountPercentage}%):</span>
                    <span className="font-semibold">
                      -₹{computedTotals.discountAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                {computedTotals.additionalCharges > 0 && (
                  <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
                    <span>Additional Charges:</span>
                    <span className="font-semibold">
                      +₹{computedTotals.additionalCharges.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                {isGstEnabled && (
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>GST ({taxPercentage}%):</span>
                    <span className="font-semibold">
                      +₹{computedTotals.taxAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Grand Total:
                  </span>
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                    ₹{computedTotals.total.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-medium">Advance Due to Kickoff:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{computedTotals.advanceAmount.toLocaleString('en-IN')} ({advancePercentage}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Terms & Revision Policy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Business Terms & Conditions
              </label>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                rows={3}
                placeholder="Payment terms, delivery protocols, intellectual property ownership..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Revision Policy & Turnaround
              </label>
              <textarea
                value={revisionPolicy}
                onChange={(e) => setRevisionPolicy(e.target.value)}
                rows={3}
                placeholder="Number of included revision rounds, additional revision pricing..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Internal Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Internal Admin Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal reminders, client negotiation history, verbal commitments..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Decimal-safe currency in INR (₹)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Create Quotation'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
