import React, { useState, useEffect } from 'react';
import {
  CrmProject,
  CrmProjectStatus,
  CrmProjectPriority,
  CrmProjectMilestone,
  CrmProjectDeliverable
} from '../../../../types/crm';
import {
  saveStoredProject,
  saveProjectWithCloud,
  deleteStoredProject,
  deleteProjectWithCloud,
  toggleProjectMilestone,
  addProjectMilestone,
  addProjectDeliverable,
  addProjectActivity,
  recordProjectPayment,
  getProjectRelatedData
} from '../../../../services/crmStorageService';
import { ProjectStatusBadge, ProjectPriorityBadge } from './ProjectStatusBadge';
import {
  X,
  FolderKanban,
  Building,
  Calendar,
  DollarSign,
  Clock,
  Trash2,
  Edit,
  ExternalLink,
  Send,
  Plus,
  CheckCircle,
  AlertCircle,
  FileText,
  RotateCcw,
  Sparkles,
  Users,
  CheckSquare,
  CreditCard,
  Briefcase
} from 'lucide-react';

interface ProjectProfileDrawerProps {
  project: CrmProject | null;
  isOpen: boolean;
  onClose: () => void;
  onEditProject?: (project: CrmProject) => void;
  onNavigateToModule?: (moduleId: string) => void;
}

export const ProjectProfileDrawer: React.FC<ProjectProfileDrawerProps> = ({
  project,
  isOpen,
  onClose,
  onEditProject,
  onNavigateToModule
}) => {
  if (!isOpen || !project) return null;

  const [currentProject, setCurrentProject] = useState<CrmProject>(project);
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'deliverables' | 'team' | 'budget' | 'timeline'>('overview');

  // Milestone Form
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [msTitle, setMsTitle] = useState('');
  const [msDesc, setMsDesc] = useState('');
  const [msDueDate, setMsDueDate] = useState('');

  // Deliverable Form
  const [showDelivForm, setShowDelivForm] = useState(false);
  const [delivTitle, setDelivTitle] = useState('');
  const [delivUrl, setDelivUrl] = useState('');
  const [delivRound, setDelivRound] = useState<number>(1);
  const [delivStatus, setDelivStatus] = useState<'draft' | 'pending_review' | 'approved' | 'revision_requested'>('pending_review');
  const [delivNotes, setDelivNotes] = useState('');
  const [delivBy, setDelivBy] = useState('');

  // Payment Form
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payNotes, setPayNotes] = useState('');

  // Timeline note
  const [newNoteContent, setNewNoteContent] = useState('');

  // Related data
  const [relatedData, setRelatedData] = useState(() => getProjectRelatedData(project.id));

  useEffect(() => {
    setCurrentProject(project);
    setRelatedData(getProjectRelatedData(project.id));
  }, [project]);

  const refreshData = (updated: CrmProject) => {
    setCurrentProject(updated);
    setRelatedData(getProjectRelatedData(updated.id));
  };

  // Status Switcher
  const handleStatusChange = async (newStatus: CrmProjectStatus) => {
    setCurrentProject((prev) => ({ ...prev, status: newStatus }));
    addProjectActivity(currentProject.id, {
      type: 'status_change',
      description: `Project status set to ${newStatus.toUpperCase().replace('_', ' ')}`,
      author: 'Rohit Verma (Admin)'
    });

    try {
      const res = await saveProjectWithCloud({
        id: currentProject.id,
        title: currentProject.title,
        clientId: currentProject.clientId,
        status: newStatus
      });
      if (res && res.project) {
        refreshData(res.project);
      }
    } catch (err) {
      console.error('Failed to update project status in cloud:', err);
    }
  };

  // Toggle Milestone Checkbox
  const handleToggleMilestone = (msId: string) => {
    const updated = toggleProjectMilestone(currentProject.id, msId);
    if (updated) refreshData(updated);
  };

  // Add Milestone
  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msTitle.trim()) return;

    const nextOrder = (currentProject.milestones || []).length + 1;
    const updated = addProjectMilestone(currentProject.id, {
      title: msTitle.trim(),
      description: msDesc.trim() || undefined,
      dueDate: msDueDate || undefined,
      order: nextOrder
    });

    if (updated) {
      refreshData(updated);
      setMsTitle('');
      setMsDesc('');
      setMsDueDate('');
      setShowMilestoneForm(false);
    }
  };

  // Add Deliverable
  const handleAddDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!delivUrl.trim()) return;

    const updated = addProjectDeliverable(currentProject.id, {
      title: delivTitle.trim() || 'Deliverable Submission',
      url: delivUrl.trim(),
      revisionRound: delivRound || 1,
      status: delivStatus,
      submittedBy: delivBy.trim() || 'Admin Handoff',
      notes: delivNotes.trim() || undefined
    });

    if (updated) {
      refreshData(updated);
      setDelivTitle('');
      setDelivUrl('');
      setDelivRound(1);
      setDelivNotes('');
      setDelivBy('');
      setShowDelivForm(false);
    }
  };

  // Record Payment
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = Number(payAmount);
    if (!amountVal || amountVal <= 0) return;

    const updated = recordProjectPayment(currentProject.id, amountVal, payNotes.trim() || undefined);
    if (updated) {
      refreshData(updated);
      setPayAmount('');
      setPayNotes('');
      setShowPaymentForm(false);
    }
  };

  // Add Activity Note
  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    const updated = addProjectActivity(currentProject.id, {
      type: 'note',
      description: newNoteContent.trim(),
      author: 'Rohit Verma (Admin)'
    });

    if (updated) {
      refreshData(updated);
      setNewNoteContent('');
    }
  };

  // Delete Project
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${currentProject.title}"?`)) {
      const res = await deleteProjectWithCloud(currentProject.id);
      if (!res.success) {
        alert(res.error || 'Permission Denied: Failed to delete project record.');
        return;
      }
      onClose();
    }
  };

  const computed = relatedData?.computed || {
    totalMilestones: 0,
    completedMilestones: 0,
    progressPercentage: currentProject.progress || 0,
    budget: currentProject.budget || 0,
    amountPaid: currentProject.amountPaid || 0,
    pendingBalance: Math.max(0, (currentProject.budget || 0) - (currentProject.amountPaid || 0)),
    paymentStatus: currentProject.paymentStatus || 'pending'
  };

  // Calculate deadline days
  const now = new Date().getTime();
  const deadlineTime = currentProject.deadline ? new Date(currentProject.deadline).getTime() : now;
  const daysDiff = Math.ceil((deadlineTime - now) / (1000 * 60 * 60 * 24));

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-left overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                <FolderKanban className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {currentProject.title}
                  </h2>
                  <ProjectStatusBadge status={currentProject.status} />
                  <ProjectPriorityBadge priority={currentProject.priority} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {currentProject.clientName}
                  </span>
                  <span>•</span>
                  <span>{currentProject.serviceCategory}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {onEditProject && (
                <button
                  onClick={() => onEditProject(currentProject)}
                  className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  title="Edit Project"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleDelete}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                title="Delete Project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Progress Bar & Status Switcher */}
          <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">Overall Progress:</span>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                  {computed.progressPercentage}%
                </span>
                <span className="text-[11px] text-slate-400">
                  ({computed.completedMilestones}/{computed.totalMilestones} milestones)
                </span>
              </div>

              {/* Status Switcher Dropdown */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-medium">Stage:</span>
                <select
                  value={currentProject.status}
                  onChange={(e) => handleStatusChange(e.target.value as CrmProjectStatus)}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg font-medium focus:outline-none"
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

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  computed.progressPercentage === 100
                    ? 'bg-emerald-500'
                    : computed.progressPercentage > 50
                    ? 'bg-indigo-600'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${computed.progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Financial Mini Strip */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 text-center">
              <span className="text-[10px] font-semibold uppercase text-slate-400">Budget</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                ₹{computed.budget.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-center">
              <span className="text-[10px] font-semibold uppercase text-emerald-600 dark:text-emerald-400">Paid</span>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                ₹{computed.amountPaid.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-center">
              <span className="text-[10px] font-semibold uppercase text-amber-600 dark:text-amber-400">Due Balance</span>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mt-0.5">
                ₹{computed.pendingBalance.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 mt-4 -mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors shrink-0 ${
                activeTab === 'overview'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Overview & Scope
            </button>
            <button
              onClick={() => setActiveTab('milestones')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors shrink-0 flex items-center gap-1 ${
                activeTab === 'milestones'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <span>Milestones</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                {computed.totalMilestones}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('deliverables')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors shrink-0 flex items-center gap-1 ${
                activeTab === 'deliverables'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <span>Deliverables</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                {(currentProject.deliverables || []).length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors shrink-0 flex items-center gap-1 ${
                activeTab === 'team'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <span>Freelancer Team</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                {(currentProject.assignedFreelancerIds || []).length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors shrink-0 ${
                activeTab === 'budget'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Budget & Ledger
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors shrink-0 ${
                activeTab === 'timeline'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Timeline
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW & SCOPE */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Timeline Info Box */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-medium text-slate-400">Start Date</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                    {currentProject.startDate || 'Immediate'}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-medium text-slate-400">Delivery Deadline</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-1 flex items-center justify-between">
                    <span>{currentProject.deadline || 'No deadline specified'}</span>
                    {daysDiff >= 0 ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 font-semibold">
                        {daysDiff} days left
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 font-semibold">
                        Overdue
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Creative Brief */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Creative Brief & Scope of Work
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {currentProject.description || 'No creative brief entered for this project.'}
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Administrative Notes
                </h4>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {currentProject.notes || 'No internal notes recorded.'}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MILESTONES & ROADMAP */}
          {activeTab === 'milestones' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Project Milestones ({computed.completedMilestones}/{computed.totalMilestones} Completed)
                  </h4>
                  <p className="text-xs text-slate-500">Checking milestones automatically recalibrates overall project progress</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMilestoneForm(!showMilestoneForm)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Milestone</span>
                </button>
              </div>

              {/* Add Milestone Form */}
              {showMilestoneForm && (
                <form
                  onSubmit={handleAddMilestone}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-indigo-500/30 space-y-3 animate-scale-up"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Add Project Milestone</span>
                    </h5>
                    <button
                      type="button"
                      onClick={() => setShowMilestoneForm(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Milestone Title *
                    </label>
                    <input
                      type="text"
                      value={msTitle}
                      onChange={(e) => setMsTitle(e.target.value)}
                      placeholder="e.g. Color grade & sound design pass"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={msDueDate}
                        onChange={(e) => setMsDueDate(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Brief Description
                      </label>
                      <input
                        type="text"
                        value={msDesc}
                        onChange={(e) => setMsDesc(e.target.value)}
                        placeholder="Details or deliverables"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowMilestoneForm(false)}
                      className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg"
                    >
                      Save Milestone
                    </button>
                  </div>
                </form>
              )}

              {/* Milestones List */}
              {(currentProject.milestones || []).length === 0 ? (
                <div className="text-center py-8 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <CheckSquare className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-slate-500">No milestones configured for this project.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(currentProject.milestones || []).map((ms, index) => (
                    <div
                      key={ms.id}
                      onClick={() => handleToggleMilestone(ms.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        ms.completed
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30 text-slate-700 dark:text-slate-300'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={ms.completed}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className={`text-xs font-bold ${ms.completed ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                            {index + 1}. {ms.title}
                          </h5>
                          {ms.completed && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              Completed
                            </span>
                          )}
                        </div>
                        {ms.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {ms.description}
                          </p>
                        )}
                        {ms.dueDate && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                            <Calendar className="w-3 h-3" />
                            <span>Target: {ms.dueDate}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DELIVERABLES & REVISIONS */}
          {activeTab === 'deliverables' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Project Deliverables & Client Revisions
                  </h4>
                  <p className="text-xs text-slate-500">Track Frame.io, Drive, and Figma delivery links with revision rounds</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDelivForm(!showDelivForm)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Deliverable</span>
                </button>
              </div>

              {/* Add Deliverable Form */}
              {showDelivForm && (
                <form
                  onSubmit={handleAddDeliverable}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-indigo-500/30 space-y-3 animate-scale-up"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Log Deliverable Submission</span>
                    </h5>
                    <button
                      type="button"
                      onClick={() => setShowDelivForm(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Deliverable Name *
                    </label>
                    <input
                      type="text"
                      value={delivTitle}
                      onChange={(e) => setDelivTitle(e.target.value)}
                      placeholder="e.g. Rough Cut V2 with client revisions"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      URL (Frame.io, Google Drive, Figma, WeTransfer) *
                    </label>
                    <input
                      type="url"
                      value={delivUrl}
                      onChange={(e) => setDelivUrl(e.target.value)}
                      placeholder="https://frame.io/... or https://drive.google.com/..."
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Revision Round #
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={delivRound}
                        onChange={(e) => setDelivRound(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Review Status
                      </label>
                      <select
                        value={delivStatus}
                        onChange={(e) => setDelivStatus(e.target.value as any)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      >
                        <option value="pending_review">Pending Review</option>
                        <option value="approved">Approved</option>
                        <option value="revision_requested">Revision Requested</option>
                        <option value="draft">Internal Draft</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Submitted By / Notes
                    </label>
                    <input
                      type="text"
                      value={delivNotes}
                      onChange={(e) => setDelivNotes(e.target.value)}
                      placeholder="Feedback notes, aspect ratios included..."
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowDelivForm(false)}
                      className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg"
                    >
                      Save Deliverable
                    </button>
                  </div>
                </form>
              )}

              {/* Deliverables List */}
              {(currentProject.deliverables || []).length === 0 ? (
                <div className="text-center py-8 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <RotateCcw className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-slate-500">No deliverable links uploaded yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(currentProject.deliverables || []).map((del) => (
                    <div
                      key={del.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                              {del.title}
                            </h5>
                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 text-[10px] font-bold">
                              Round {del.revisionRound}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Submitted {new Date(del.submittedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          del.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : del.status === 'revision_requested'
                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            : 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                        }`}>
                          {del.status === 'approved'
                            ? 'Approved'
                            : del.status === 'revision_requested'
                            ? 'Revision Requested'
                            : 'Pending Review'}
                        </span>
                      </div>

                      <div className="pt-1">
                        <a
                          href={del.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span className="truncate max-w-md">{del.url}</span>
                        </a>
                      </div>

                      {del.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                          {del.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: FREELANCER TEAM */}
          {activeTab === 'team' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Assigned Subcontractors ({relatedData?.assignedFreelancers?.length || 0})
                </h4>
                <p className="text-xs text-slate-500">Creative professionals allocated to deliver this project</p>
              </div>

              {(relatedData?.assignedFreelancers || []).length === 0 ? (
                <div className="text-center py-8 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <Users className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-slate-500">No freelancers assigned to this project yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(relatedData?.assignedFreelancers || []).map((f) => (
                    <div
                      key={f.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center">
                            {f.name.charAt(0)}
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white">{f.name}</h5>
                            <p className="text-[11px] text-slate-400">{f.specialty}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {(f.skills || []).slice(0, 3).map((s) => (
                            <span key={s} className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px]">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          {f.hourlyRate ? `₹${f.hourlyRate}/hr` : 'Fixed Project'}
                        </span>
                        {f.phone && (
                          <a
                            href={`https://wa.me/91${f.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold hover:underline"
                          >
                            <Send className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: BUDGET & PAYMENTS */}
          {activeTab === 'budget' && (
            <div className="space-y-6 animate-fade-in">
              {/* Financial Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white border border-slate-800 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Project Financial Health
                  </h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    computed.pendingBalance === 0 && computed.amountPaid > 0
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : computed.amountPaid > 0
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    {computed.pendingBalance === 0 && computed.amountPaid > 0
                      ? 'Fully Paid'
                      : computed.amountPaid > 0
                      ? 'Partial Advance Paid'
                      : 'Payment Pending'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-[11px] text-slate-400">Total Agreed Budget</span>
                    <h3 className="text-lg font-black mt-0.5">
                      ₹{computed.budget.toLocaleString('en-IN')}
                    </h3>
                  </div>
                  <div>
                    <span className="text-[11px] text-emerald-400">Advance Received</span>
                    <h3 className="text-lg font-black text-emerald-400 mt-0.5">
                      ₹{computed.amountPaid.toLocaleString('en-IN')}
                    </h3>
                  </div>
                  <div>
                    <span className="text-[11px] text-amber-400">Balance Receivable</span>
                    <h3 className="text-lg font-black text-amber-400 mt-0.5">
                      ₹{computed.pendingBalance.toLocaleString('en-IN')}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Record Payment Trigger */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Record Incoming Payment
                  </h4>
                  <p className="text-xs text-slate-500">Log UPI, NEFT or cash receipts from client</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(!showPaymentForm)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record Payment</span>
                </button>
              </div>

              {/* Payment Form */}
              {showPaymentForm && (
                <form
                  onSubmit={handleRecordPayment}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-emerald-500/30 space-y-3 animate-scale-up"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Record Payment for {currentProject.title}</span>
                    </h5>
                    <button
                      type="button"
                      onClick={() => setShowPaymentForm(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Amount (₹) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g. 25000"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Payment Notes / Ref
                      </label>
                      <input
                        type="text"
                        value={payNotes}
                        onChange={(e) => setPayNotes(e.target.value)}
                        placeholder="e.g. Final milestone payment via UPI"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPaymentForm(false)}
                      className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg"
                    >
                      Confirm Payment
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 6: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-6 animate-fade-in">
              <form onSubmit={handleAddActivity} className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Post Administrative Note
                </label>
                <div className="relative">
                  <textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    rows={2}
                    placeholder="Log client call summary, milestone notes, or feedback..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!newNoteContent.trim()}
                    className="absolute right-2.5 bottom-2.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>Post</span>
                  </button>
                </div>
              </form>

              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {(currentProject.activities || []).map((act) => (
                  <div key={act.id} className="flex items-start gap-3 relative">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border-2 border-white dark:border-slate-900 shadow-sm z-10">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {act.author || 'Admin'}
                        </span>
                        <span>
                          {new Date(act.timestamp).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200">{act.description || act.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
