import React, { useState, useEffect } from 'react';
import { CrmLead, LeadPipelineStage } from '../../../../types/crm';
import { findDuplicateLead, saveStoredLead, saveLeadWithCloud, updateLeadFollowUp } from '../../../../services/crmStorageService';
import {
  X,
  User,
  Phone,
  Mail,
  Building,
  Briefcase,
  DollarSign,
  MessageSquare,
  AlertTriangle,
  Calendar,
  Sparkles,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadAdded: (lead: CrmLead) => void;
  onSelectExistingLead?: (lead: CrmLead) => void;
  initialLead?: CrmLead | null;
  defaultToWhatsApp?: boolean;
}

const SERVICE_OPTIONS = [
  'Graphic Design & Branding',
  'Video Editing (Reels / Shorts / YouTube)',
  'Motion Graphics & Animation',
  'Logo & Visual Identity',
  'UI/UX & Web Experience',
  'Social Media Creative Suite',
  'Presentation & Pitch Deck Design',
  'Custom Creative Project'
];

const BUDGET_OPTIONS = [
  '₹5,000 – ₹15,000',
  '₹15,000 – ₹30,000',
  '₹30,000 – ₹60,000',
  '₹60,000 – ₹1,20,000',
  '₹1,20,000+',
  'Flexible / Open'
];

const SOURCE_OPTIONS = [
  { id: 'whatsapp', label: 'WhatsApp Direct' },
  { id: 'website-contact-form', label: 'Website Contact' },
  { id: 'ai_chat', label: 'AI Chatbot' },
  { id: 'phone_call', label: 'Phone Call' },
  { id: 'referral', label: 'Client Referral' },
  { id: 'instagram', label: 'Instagram DM' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'other', label: 'Other Source' }
];

export const AddLeadModal: React.FC<AddLeadModalProps> = ({
  isOpen,
  onClose,
  onLeadAdded,
  onSelectExistingLead,
  initialLead,
  defaultToWhatsApp = false
}) => {
  const isEditing = Boolean(initialLead);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [service, setService] = useState(SERVICE_OPTIONS[0]);
  const [budget, setBudget] = useState(BUDGET_OPTIONS[1]);
  const [message, setMessage] = useState('');
  const [source, setSource] = useState('whatsapp');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [status, setStatus] = useState<LeadPipelineStage>('new');
  const [assignedTo, setAssignedTo] = useState('Rohit Verma');
  const [followUpDate, setFollowUpDate] = useState('');
  const [initialNotes, setInitialNotes] = useState('');

  // Duplicate Check
  const [duplicateInfo, setDuplicateInfo] = useState<{ isDuplicate: boolean; matchedLead?: CrmLead; reason?: string }>({
    isDuplicate: false
  });

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Populate fields when editing or opened
  useEffect(() => {
    if (initialLead) {
      setName(initialLead.name || '');
      setPhone(initialLead.phone || '');
      setEmail(initialLead.email || '');
      setCompany(initialLead.company || initialLead.businessName || '');
      setService(initialLead.service || SERVICE_OPTIONS[0]);
      setBudget(initialLead.budget || initialLead.budgetRange || BUDGET_OPTIONS[1]);
      setMessage(initialLead.message || '');
      setSource(initialLead.source || 'whatsapp');
      setPriority(initialLead.priority || 'medium');
      setStatus(initialLead.pipelineStage || 'new');
      setAssignedTo(initialLead.assignedTo || 'Rohit Verma');
      setFollowUpDate(initialLead.followUpAt ? initialLead.followUpAt.split('T')[0] : '');
      setInitialNotes(initialLead.notes || '');
    } else {
      // Reset form
      setName('');
      setPhone('');
      setEmail('');
      setCompany('');
      setService(SERVICE_OPTIONS[0]);
      setBudget(BUDGET_OPTIONS[1]);
      setMessage(defaultToWhatsApp ? 'Client connected directly via WhatsApp.' : '');
      setSource(defaultToWhatsApp ? 'whatsapp' : 'website-contact-form');
      setPriority('medium');
      setStatus(defaultToWhatsApp ? 'contacted' : 'new');
      setAssignedTo('Rohit Verma');
      setFollowUpDate('');
      setInitialNotes('');
    }
    setDuplicateInfo({ isDuplicate: false });
    setErrorMessage(null);
  }, [initialLead, isOpen, defaultToWhatsApp]);

  // Real-time duplicate check when phone or email changes
  useEffect(() => {
    if (!phone && !email) {
      setDuplicateInfo({ isDuplicate: false });
      return;
    }

    const check = findDuplicateLead(phone, email, initialLead?.id);
    setDuplicateInfo(check);
  }, [phone, email, initialLead?.id]);

  if (!isOpen) return null;

  const handleApplyWhatsAppPreset = () => {
    setSource('whatsapp');
    setStatus('contacted');
    setPriority('high');
    if (!message) {
      setMessage('Client reached out directly on RohitWork WhatsApp.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation: Phone is mandatory, Name is mandatory. Email is explicitly optional.
    if (!name.trim()) {
      setErrorMessage('Please enter the client / lead name.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Phone number is required to contact and identify the client.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await saveLeadWithCloud({
        id: initialLead?.id,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        company: company.trim(),
        businessName: company.trim(),
        service,
        budget,
        budgetRange: budget,
        message: message.trim(),
        source,
        priority,
        status: status === 'won' ? 'completed' : status === 'lost' ? 'closed' : 'new',
        pipelineStage: status,
        assignedTo,
        notes: initialNotes.trim(),
        followUpAt: followUpDate ? new Date(followUpDate).toISOString() : null
      });

      if (!result.success && result.cloudResult?.errorCode === 'permission-denied') {
        setErrorMessage('Permission Denied: You do not have permission to modify leads.');
        setIsSubmitting(false);
        return;
      }

      if (followUpDate) {
        updateLeadFollowUp(result.lead.id, new Date(followUpDate).toISOString(), `Follow-up set during lead entry: ${service}`);
      }

      onLeadAdded(result.lead);
      onClose();
    } catch (err: any) {
      console.error('Failed to save lead:', err);
      setErrorMessage(err?.message || 'Failed to save lead. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Edit Lead Details' : 'Add New Lead / WhatsApp Client'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supports phone-only clients with zero friction & duplicate phone detection.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WhatsApp Quick Preset Banner (for new leads) */}
        {!isEditing && (
          <div className="px-6 py-2.5 bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 dark:text-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Adding a direct WhatsApp enquiry?</span>
            </div>
            <button
              type="button"
              onClick={handleApplyWhatsAppPreset}
              className="text-xs px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition"
            >
              Apply WhatsApp Preset
            </button>
          </div>
        )}

        {/* Duplicate Warning Alert */}
        {duplicateInfo.isDuplicate && duplicateInfo.matchedLead && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                Possible Duplicate Lead Found!
              </p>
              <p className="text-amber-800 dark:text-amber-300 mt-0.5">
                {duplicateInfo.reason}
              </p>
              {onSelectExistingLead && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectExistingLead(duplicateInfo.matchedLead!);
                    onClose();
                  }}
                  className="mt-2 inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-300 underline hover:text-amber-900 dark:hover:text-amber-100"
                >
                  View Existing Lead Record &rarr;
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Row 1: Name & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Client / Lead Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aman Sharma"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210 or +91..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Email (Optional) & Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  Optional for WhatsApp clients
                </span>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aman@example.com (optional)"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company / Brand Name
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Apex Media or Brand Studio"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Service & Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Requested Service
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {SERVICE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Budget Range
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {BUDGET_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Row 4: Source, Priority, Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Lead Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {SOURCE_OPTIONS.map((src) => (
                  <option key={src.id} value={src.id}>
                    {src.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pipeline Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadPipelineStage)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="new">New Lead</option>
                <option value="contacted">Contacted</option>
                <option value="follow_up">Follow-up</option>
                <option value="qualified">Qualified</option>
                <option value="won">Won / Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          </div>

          {/* Row 5: Follow-up Date & Assigned To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Schedule Follow-up (Optional)
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assigned Team Member
              </label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Rohit Verma"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Requirement / Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Client Requirement / Message
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What deliverables, creative style, or goals did the client describe?"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Initial Internal Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Internal Team Notes
            </label>
            <textarea
              rows={2}
              value={initialNotes}
              onChange={(e) => setInitialNotes(e.target.value)}
              placeholder="Private notes (budget negotiation, timeline constraints, references shared)..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>{isEditing ? 'Save Changes' : 'Create Lead'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
