import React, { useState, useEffect } from 'react';
import { CrmClient, CrmClientStatus } from '../../../../types/crm';
import { findDuplicateClient, saveStoredClient, saveClientWithCloud, normalizePhoneNumber } from '../../../../services/crmStorageService';
import {
  X,
  User,
  Phone,
  Mail,
  Building,
  MapPin,
  Tag,
  AlertTriangle,
  Sparkles,
  CheckCircle,
  Briefcase
} from 'lucide-react';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientSaved: (client: CrmClient) => void;
  onSelectExistingClient?: (client: CrmClient) => void;
  initialClient?: CrmClient | null;
  defaultToWhatsApp?: boolean;
}

const COMMON_TAGS = [
  'VIP Client',
  'Monthly Retainer',
  'Video Editing',
  'Graphic Design',
  'Branding & Logo',
  'UI/UX & Web',
  'YouTube Partner',
  'High Priority'
];

export const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onClientSaved,
  onSelectExistingClient,
  initialClient,
  defaultToWhatsApp = false
}) => {
  const isEditing = Boolean(initialClient);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<CrmClientStatus>('active');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');

  // Duplicate Check
  const [duplicateInfo, setDuplicateInfo] = useState<{ isDuplicate: boolean; matchedClient?: CrmClient; reason?: string }>({
    isDuplicate: false
  });

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialClient) {
      setName(initialClient.name || '');
      setPhone(initialClient.phone || '');
      setEmail(initialClient.email && !initialClient.email.includes('@client.rohitwork.in') ? initialClient.email : '');
      setCompany(initialClient.company || '');
      setAddress(initialClient.address || '');
      setStatus(initialClient.status || 'active');
      setNotes(initialClient.notes || '');
      setSelectedTags(initialClient.tags || []);
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setCompany('');
      setAddress('');
      setStatus('active');
      setNotes(defaultToWhatsApp ? 'Direct client onboarded via RohitWork WhatsApp.' : '');
      setSelectedTags(defaultToWhatsApp ? ['Monthly Retainer', 'VIP Client'] : []);
    }
    setDuplicateInfo({ isDuplicate: false });
    setErrorMessage(null);
  }, [initialClient, isOpen, defaultToWhatsApp]);

  // Real-time duplicate phone & email check
  useEffect(() => {
    if (!phone && !email) {
      setDuplicateInfo({ isDuplicate: false });
      return;
    }

    const check = findDuplicateClient(phone, email, initialClient?.id);
    setDuplicateInfo(check);
  }, [phone, email, initialClient?.id]);

  if (!isOpen) return null;

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTagInput.trim()) {
      e.preventDefault();
      const val = customTagInput.trim();
      if (!selectedTags.includes(val)) {
        setSelectedTags([...selectedTags, val]);
      }
      setCustomTagInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter the client / business name.');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Phone number is required for direct communication and identity.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await saveClientWithCloud({
        id: initialClient?.id,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        company: company.trim(),
        address: address.trim(),
        status,
        tags: selectedTags,
        notes: notes.trim()
      });

      if (!result.success) {
        setErrorMessage(result.cloudResult?.error || 'Failed to save client to cloud database. Please verify your administrator session.');
        setIsSubmitting(false);
        return;
      }

      onClientSaved(result.client);
      onClose();
    } catch (err: any) {
      console.error('Failed to save client:', err);
      setErrorMessage(err?.message || 'Failed to save client profile. Please try again.');
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
                {isEditing ? 'Edit Client Profile' : 'Add New Client Profile'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Full client account with phone-only support, custom tags & duplicate prevention.
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

        {/* WhatsApp Preset Indicator */}
        {!isEditing && defaultToWhatsApp && (
          <div className="px-6 py-2 bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center gap-2 text-xs font-medium text-emerald-800 dark:text-emerald-300">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Pre-configured for direct WhatsApp onboarding</span>
          </div>
        )}

        {/* Duplicate Client Warning */}
        {duplicateInfo.isDuplicate && duplicateInfo.matchedClient && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                Possible Duplicate Client Detected!
              </p>
              <p className="text-amber-800 dark:text-amber-300 mt-0.5">
                {duplicateInfo.reason}
              </p>
              {onSelectExistingClient && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectExistingClient(duplicateInfo.matchedClient!);
                    onClose();
                  }}
                  className="mt-2 inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-300 underline hover:text-amber-900 dark:hover:text-amber-100"
                >
                  View Existing Client Profile &rarr;
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Row 1: Name & Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Client / Contact Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
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
                  placeholder="e.g. Nexus Media or Brand Labs"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Phone & Email (Optional) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  Optional for phone-only clients
                </span>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vikram@example.com (optional)"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Status & Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Client Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CrmClientStatus)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="active">Active (Ongoing Projects / Communication)</option>
                <option value="inactive">Inactive (Completed / On Hold)</option>
                <option value="archived">Archived (Closed / Historical)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Location / City
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Mumbai, Maharashtra or Dubai, UAE"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Tags Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Client Tags & Segment</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_TAGS.map((t) => {
                const isSelected = selectedTags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleToggleTag(t)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyDown={handleAddCustomTag}
              placeholder="Type custom tag and press Enter..."
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Internal Notes / Client Brief */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Internal Client Notes & Working Preferences
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Important notes (deliverable requirements, preferred communication hours, revision guidelines)..."
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
                  <span>{isEditing ? 'Save Client Changes' : 'Create Client'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
