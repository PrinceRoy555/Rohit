import React, { useState, useEffect } from 'react';
import {
  CrmProject,
  CrmProjectStatus,
  CrmProjectPriority,
  CrmClient,
  CrmFreelancer
} from '../../../../types/crm';
import {
  getStoredClients,
  getStoredFreelancers,
  saveStoredProject,
  saveProjectWithCloud
} from '../../../../services/crmStorageService';
import {
  X,
  FolderKanban,
  User,
  Building,
  Calendar,
  DollarSign,
  AlertTriangle,
  Sparkles,
  CheckCircle,
  Briefcase,
  Users,
  FileText
} from 'lucide-react';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectSaved: (project: CrmProject) => void;
  initialProject?: CrmProject | null;
  defaultClientId?: string;
}

const COMMON_SERVICES = [
  'Video Editing & Motion',
  '3D Motion & VFX',
  'UI/UX Design & Webflow',
  'Brand Identity & Guidelines',
  'YouTube Documentary Cuts',
  'Commercial Promos & Reels',
  'Graphic Design & Deck Design'
];

export const AddProjectModal: React.FC<AddProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectSaved,
  initialProject,
  defaultClientId
}) => {
  const isEditing = Boolean(initialProject);

  const [availableClients, setAvailableClients] = useState<CrmClient[]>([]);
  const [availableFreelancers, setAvailableFreelancers] = useState<CrmFreelancer[]>([]);

  // Form Fields
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [customClientName, setCustomClientName] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Video Editing & Motion');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState<number | ''>('');
  const [amountPaid, setAmountPaid] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<CrmProjectPriority>('medium');
  const [status, setStatus] = useState<CrmProjectStatus>('in_progress');
  const [selectedFreelancerIds, setSelectedFreelancerIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const clientsList = getStoredClients();
    const freelancersList = getStoredFreelancers();
    setAvailableClients(clientsList);
    setAvailableFreelancers(freelancersList);

    if (initialProject) {
      setTitle(initialProject.title || '');
      setClientId(initialProject.clientId || '');
      setCustomClientName(initialProject.clientName || '');
      setServiceCategory(initialProject.serviceCategory || 'Video Editing & Motion');
      setDescription(initialProject.description || '');
      setBudget(initialProject.budget ?? '');
      setAmountPaid(initialProject.amountPaid ?? '');
      setStartDate(initialProject.startDate || '');
      setDeadline(initialProject.deadline || '');
      setPriority(initialProject.priority || 'medium');
      setStatus(initialProject.status || 'in_progress');
      setSelectedFreelancerIds(initialProject.assignedFreelancerIds || []);
      setNotes(initialProject.notes || '');
    } else {
      const today = new Date().toISOString().split('T')[0];
      const twoWeeksLater = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

      setTitle('');
      setClientId(defaultClientId || (clientsList.length > 0 ? clientsList[0].id : ''));
      setCustomClientName('');
      setServiceCategory('Video Editing & Motion');
      setDescription('');
      setBudget('');
      setAmountPaid('');
      setStartDate(today);
      setDeadline(twoWeeksLater);
      setPriority('medium');
      setStatus('in_progress');
      setSelectedFreelancerIds([]);
      setNotes('');
    }
    setErrors({});
  }, [initialProject, isOpen, defaultClientId]);

  if (!isOpen) return null;

  const handleToggleFreelancer = (id: string) => {
    if (selectedFreelancerIds.includes(id)) {
      setSelectedFreelancerIds(selectedFreelancerIds.filter((fId) => fId !== id));
    } else {
      setSelectedFreelancerIds([...selectedFreelancerIds, id]);
    }
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!title.trim()) {
      errs.title = 'Project title is required.';
    }

    if (!clientId && !customClientName.trim()) {
      errs.client = 'Please select or enter a client.';
    }

    if (!deadline) {
      errs.deadline = 'Project delivery deadline is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const budgetVal = budget === '' ? 0 : Number(budget);
      const paidVal = amountPaid === '' ? 0 : Number(amountPaid);

      const linkedClient = availableClients.find((c) => c.id === clientId);
      const resolvedClientName = linkedClient ? linkedClient.name : customClientName.trim() || 'Direct Client';

      const result = await saveProjectWithCloud({
        id: initialProject?.id,
        title: title.trim(),
        clientId: clientId || `client_${Date.now()}`,
        clientName: resolvedClientName,
        serviceCategory,
        description: description.trim() || undefined,
        budget: budgetVal,
        amountPaid: paidVal,
        startDate: startDate || new Date().toISOString().split('T')[0],
        deadline,
        priority,
        status,
        assignedFreelancerIds: selectedFreelancerIds,
        notes: notes.trim() || undefined
      });

      if (!result.success) {
        setErrors({ form: result.cloudResult?.error || 'Failed to save project to cloud database. Please verify your administrator session.' });
        setIsSubmitting(false);
        return;
      }

      onProjectSaved(result.project);
      onClose();
    } catch (err) {
      console.error('Error saving project:', err);
      setErrors({ form: 'Failed to save project. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const computedPending = Math.max(0, (Number(budget) || 0) - (Number(amountPaid) || 0));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Edit Project Deliverable' : 'Create New Project'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing
                  ? 'Update milestones, deadline, budget, and assigned subcontractor team.'
                  : 'Link to a verified agency client and assign creative subcontractors.'}
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
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
          {errors.form && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Section 1: Project Identity & Client */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Project Details & Client
            </h3>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Project Name / Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FolderKanban className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Nexora 3D Visualizer & Brand Commercial"
                  className={`w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border ${
                    errors.title ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  } rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              </div>
              {errors.title && <p className="text-[11px] text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Linked Client */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Client / Brand <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={clientId}
                    onChange={(e) => {
                      setClientId(e.target.value);
                      const match = availableClients.find((c) => c.id === e.target.value);
                      if (match) setCustomClientName(match.name);
                    }}
                    className={`w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border ${
                      errors.client ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                    } rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  >
                    <option value="">Select Existing Client...</option>
                    {availableClients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.company ? `(${client.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.client && <p className="text-[11px] text-red-500 mt-1">{errors.client}</p>}
              </div>

              {/* Service Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Service Category
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {COMMON_SERVICES.map((srv) => (
                      <option key={srv} value={srv}>
                        {srv}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Creative Brief & Scope of Work
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Key deliverables, video duration, aspect ratios, sound requirements..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Section 2: Timelines & Status */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Timelines, Priority & Status
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Start Date */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className={`w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 border ${
                    errors.deadline ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  } rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as CrmProjectPriority)}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CrmProjectStatus)}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Financials & Budget */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Budget & Advance (₹)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Total Project Budget (₹)
                </label>
                <div className="relative">
                  <span className="text-xs text-slate-400 font-bold absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="85000"
                    min="0"
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Advance Paid / Received (₹)
                </label>
                <div className="relative">
                  <span className="text-xs text-slate-400 font-bold absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="50000"
                    min="0"
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Balance Receivable:</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    ₹{computedPending.toLocaleString('en-IN')}
                  </h4>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  computedPending === 0 && (Number(amountPaid) || 0) > 0
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    : (Number(amountPaid) || 0) > 0
                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    : 'bg-slate-500/10 text-slate-600 border-slate-500/20'
                }`}>
                  {computedPending === 0 && (Number(amountPaid) || 0) > 0
                    ? 'Fully Paid'
                    : (Number(amountPaid) || 0) > 0
                    ? 'Partial Payment'
                    : 'Payment Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Freelancer Assignment */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Assign Subcontractor Freelancers
              </label>
              <span className="text-[11px] text-slate-400">
                {selectedFreelancerIds.length} assigned
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
              {availableFreelancers.map((f) => {
                const isChecked = selectedFreelancerIds.includes(f.id);
                return (
                  <div
                    key={f.id}
                    onClick={() => handleToggleFreelancer(f.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isChecked
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500/40 text-indigo-900 dark:text-indigo-200'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                        {f.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-tight">{f.name}</p>
                        <p className="text-[10px] text-slate-400">{f.specialty}</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 5: Admin Notes */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Admin & Production Notes
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Internal reminders, client feedback links, frame.io project IDs..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Admin-only project record.</span>
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
                <span>{isEditing ? 'Save Changes' : 'Create Project'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
