import React, { useState, useEffect } from 'react';
import {
  CrmFreelancer,
  CrmFreelancerStatus,
  CrmFreelancerPayout,
  CrmFreelancerSubmission,
  CrmTask
} from '../../../../types/crm';
import {
  saveStoredFreelancer,
  saveFreelancerWithCloud,
  deleteStoredFreelancer,
  deleteFreelancerWithCloud,
  addFreelancerActivity,
  addFreelancerPayout,
  addFreelancerSubmission,
  getFreelancerRelatedData,
  saveStoredTask,
  saveTaskWithCloud,
  normalizePhoneNumber
} from '../../../../services/crmStorageService';
import { FreelancerStatusBadge } from './FreelancerStatusBadge';
import { WHATSAPP_BUSINESS_URL } from '../../../../data';
import {
  X,
  User,
  Phone,
  Mail,
  Briefcase,
  Globe,
  Tag,
  DollarSign,
  FolderKanban,
  CheckSquare,
  Clock,
  Trash2,
  Edit,
  ExternalLink,
  Send,
  Calendar,
  Sparkles,
  CreditCard,
  Plus,
  Star,
  CheckCircle,
  AlertCircle,
  FileText,
  RotateCcw
} from 'lucide-react';

interface FreelancerProfileDrawerProps {
  freelancer: CrmFreelancer | null;
  isOpen: boolean;
  onClose: () => void;
  onEditFreelancer?: (freelancer: CrmFreelancer) => void;
  onNavigateToModule?: (moduleId: string) => void;
}

export const FreelancerProfileDrawer: React.FC<FreelancerProfileDrawerProps> = ({
  freelancer,
  isOpen,
  onClose,
  onEditFreelancer,
  onNavigateToModule
}) => {
  if (!isOpen || !freelancer) return null;

  const [currentFreelancer, setCurrentFreelancer] = useState<CrmFreelancer>(freelancer);
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'submissions' | 'payouts' | 'timeline'>('overview');

  // Timeline note state
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteType, setNewNoteType] = useState<'note' | 'call' | 'whatsapp'>('note');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Payout record state
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number | ''>('');
  const [payoutMethod, setPayoutMethod] = useState<'UPI' | 'Bank Transfer' | 'Cash'>('UPI');
  const [payoutRef, setPayoutRef] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [isSavingPayout, setIsSavingPayout] = useState(false);

  // Submission record state
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [subTaskTitle, setSubTaskTitle] = useState('');
  const [subUrl, setSubUrl] = useState('');
  const [subRevisionRound, setSubRevisionRound] = useState<number>(1);
  const [subStatus, setSubStatus] = useState<'pending_review' | 'approved' | 'revision_requested'>('pending_review');
  const [subNotes, setSubNotes] = useState('');
  const [isSavingSub, setIsSavingSub] = useState(false);

  // New task assignment state
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskNotes, setTaskNotes] = useState('');

  // Related data
  const [relatedData, setRelatedData] = useState(() => getFreelancerRelatedData(freelancer.id));

  useEffect(() => {
    setCurrentFreelancer(freelancer);
    setRelatedData(getFreelancerRelatedData(freelancer.id));
  }, [freelancer]);

  const refreshData = (updated: CrmFreelancer) => {
    setCurrentFreelancer(updated);
    setRelatedData(getFreelancerRelatedData(updated.id));
  };

  const cleanPhone = normalizePhoneNumber(currentFreelancer.phone);
  const waUrl = cleanPhone
    ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
        `Hi ${currentFreelancer.name}, reaching out from Rohitwork regarding active project assignments.`
      )}`
    : WHATSAPP_BUSINESS_URL;

  // Handle Quick Status Change
  const handleStatusChange = async (newStatus: CrmFreelancerStatus) => {
    setCurrentFreelancer((prev) => ({ ...prev, status: newStatus }));
    addFreelancerActivity(currentFreelancer.id, {
      type: 'status_change',
      description: `Availability status changed to ${newStatus.toUpperCase()}`,
      author: 'Rohit Verma (Admin)'
    });

    try {
      const res = await saveFreelancerWithCloud({
        id: currentFreelancer.id,
        name: currentFreelancer.name,
        phone: currentFreelancer.phone,
        status: newStatus
      });
      if (res && res.freelancer) {
        refreshData(res.freelancer);
      }
    } catch (err) {
      console.error('Failed to update freelancer status in cloud:', err);
    }
  };

  // Handle Add Timeline Note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    setIsAddingNote(true);
    try {
      const updated = addFreelancerActivity(currentFreelancer.id, {
        type: newNoteType,
        description: newNoteContent.trim(),
        author: 'Rohit Verma (Admin)'
      });

      if (updated) {
        refreshData(updated);
        setNewNoteContent('');
      }
    } finally {
      setIsAddingNote(false);
    }
  };

  // Handle Record Payout
  const handleRecordPayout = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = Number(payoutAmount);
    if (!amountVal || amountVal <= 0) return;

    setIsSavingPayout(true);
    try {
      const updated = addFreelancerPayout(currentFreelancer.id, {
        amount: amountVal,
        method: payoutMethod,
        referenceId: payoutRef.trim() || undefined,
        notes: payoutNotes.trim() || undefined,
        status: 'paid',
        recordedBy: 'Rohit Verma (Admin)'
      });

      if (updated) {
        refreshData(updated);
        setPayoutAmount('');
        setPayoutRef('');
        setPayoutNotes('');
        setShowPayoutForm(false);
      }
    } finally {
      setIsSavingPayout(false);
    }
  };

  // Handle Record Work Submission
  const handleRecordSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subUrl.trim()) return;

    setIsSavingSub(true);
    try {
      const updated = addFreelancerSubmission(currentFreelancer.id, {
        taskTitle: subTaskTitle.trim() || 'Project Deliverable',
        url: subUrl.trim(),
        revisionRound: subRevisionRound || 1,
        status: subStatus,
        notes: subNotes.trim() || undefined
      });

      if (updated) {
        refreshData(updated);
        setSubTaskTitle('');
        setSubUrl('');
        setSubRevisionRound(1);
        setSubNotes('');
        setShowSubmissionForm(false);
      }
    } finally {
      setIsSavingSub(false);
    }
  };

  // Handle Assign New Task
  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    try {
      await saveTaskWithCloud({
        title: taskTitle.trim(),
        assignedFreelancerId: currentFreelancer.id,
        assignedFreelancerName: currentFreelancer.name,
        priority: taskPriority,
        status: 'todo',
        dueDate: taskDueDate || undefined,
        notes: taskNotes.trim() || undefined,
        revisionRound: 1
      });

      addFreelancerActivity(currentFreelancer.id, {
        type: 'note',
        description: `New task assigned: "${taskTitle.trim()}" (Priority: ${taskPriority.toUpperCase()})`,
        author: 'Rohit Verma (Admin)'
      });

      setTaskTitle('');
      setTaskDueDate('');
      setTaskNotes('');
      setShowTaskForm(false);
      setRelatedData(getFreelancerRelatedData(currentFreelancer.id));
    } catch (err) {
      console.error('Failed to save task with cloud:', err);
    }
  };

  // Handle Task Status Quick Toggle
  const handleTaskStatusChange = async (taskId: string, newStatus: any) => {
    try {
      await saveTaskWithCloud({
        id: taskId,
        title: 'Updated Task',
        status: newStatus
      });
      setRelatedData(getFreelancerRelatedData(currentFreelancer.id));
    } catch (err) {
      console.error('Failed to update task status with cloud:', err);
    }
  };

  // Handle Delete Freelancer Record
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${currentFreelancer.name}? This will remove payment history and assignments.`)) {
      const res = await deleteFreelancerWithCloud(currentFreelancer.id);
      if (!res.success && res.errorCode === 'permission-denied') {
        alert('Permission Denied: Only Super Admins can delete freelancer compensation records.');
        return;
      }
      onClose();
    }
  };

  const computed = relatedData.computed;

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
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                {currentFreelancer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {currentFreelancer.name}
                  </h2>
                  <FreelancerStatusBadge status={currentFreelancer.status} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>{currentFreelancer.specialty || 'Creative Specialist'}</span>
                  <span>•</span>
                  <span>Added {new Date(currentFreelancer.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {onEditFreelancer && (
                <button
                  onClick={() => onEditFreelancer(currentFreelancer)}
                  className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  title="Edit Freelancer Profile"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleDelete}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                title="Delete Freelancer Record"
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

          {/* Quick Action Ribbon */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
            {/* WhatsApp CTA */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            {/* Click to Call */}
            {cleanPhone && (
              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-xl transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>Call ({cleanPhone})</span>
              </a>
            )}

            {/* Portfolio Link */}
            {currentFreelancer.portfolioUrl && (
              <a
                href={currentFreelancer.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-xl transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                <span>Portfolio</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
              </a>
            )}

            {/* Quick Status Dropdown */}
            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium">Status:</span>
              <select
                value={currentFreelancer.status}
                onChange={(e) => handleStatusChange(e.target.value as CrmFreelancerStatus)}
                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg font-medium focus:outline-none"
              >
                <option value="available">Available</option>
                <option value="busy">Busy / Assigned</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 text-center">
              <span className="text-[10px] font-semibold uppercase text-slate-400">Agreed</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                ₹{(computed.agreedAmount || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-center">
              <span className="text-[10px] font-semibold uppercase text-emerald-600 dark:text-emerald-400">Paid</span>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                ₹{(computed.paidAmount || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-center">
              <span className="text-[10px] font-semibold uppercase text-amber-600 dark:text-amber-400">Pending</span>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mt-0.5">
                ₹{(computed.pendingBalance || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-center">
              <span className="text-[10px] font-semibold uppercase text-indigo-600 dark:text-indigo-400">Tasks</span>
              <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mt-0.5">
                {computed.completedTasksCount}/{computed.totalAssignedTasks}
              </p>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 mt-4 -mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Overview & Skills
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1 ${
                activeTab === 'assignments'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <span>Tasks & Projects</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                {computed.totalAssignedTasks}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1 ${
                activeTab === 'submissions'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <span>Submissions</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                {relatedData.submissions.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1 ${
                activeTab === 'payouts'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <span>Payouts & Billing</span>
              {computed.pendingBalance > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
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
          {/* TAB 1: OVERVIEW & SKILLS */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Skills & Specialties */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Skills & Tools
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(currentFreelancer.skills || []).map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Performance Rating */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Subcontractor Quality Rating</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Evaluated on revisions, speed, adherence to brief.
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        (currentFreelancer.rating || 5) >= s
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 ml-1.5">
                    {currentFreelancer.rating || 5}.0
                  </span>
                </div>
              </div>

              {/* Rates & Compensation */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-medium text-slate-400">Hourly Rate</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {currentFreelancer.hourlyRate ? `₹${currentFreelancer.hourlyRate}/hr` : 'Negotiable'}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-medium text-slate-400">Default Fixed Project Rate</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {currentFreelancer.fixedRateDefault ? `₹${currentFreelancer.fixedRateDefault.toLocaleString('en-IN')}` : 'Project Basis'}
                  </p>
                </div>
              </div>

              {/* Payment Method / Instructions */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Payout Method & Handles
                </h4>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {currentFreelancer.paymentMethod || 'No payout method recorded yet'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Admin reference only • Zero sensitive credentials stored
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Admin Notes
                </h4>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {currentFreelancer.notes || 'No administrative notes recorded for this freelancer.'}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TASKS & PROJECTS */}
          {activeTab === 'assignments' && (
            <div className="space-y-6 animate-fade-in">
              {/* Header with Quick Assign Task Button */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Assigned Tasks ({relatedData.tasks.length})
                  </h4>
                  <p className="text-xs text-slate-500">Track task progress, revision rounds, and due dates</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTaskForm(!showTaskForm)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Assign Task</span>
                </button>
              </div>

              {/* New Task Assignment Form */}
              {showTaskForm && (
                <form
                  onSubmit={handleAssignTask}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-indigo-500/30 space-y-3 animate-scale-up"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Assign New Task to {currentFreelancer.name}</span>
                    </h5>
                    <button
                      type="button"
                      onClick={() => setShowTaskForm(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="e.g. Color grade 4K Commercial Cut"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Priority
                      </label>
                      <select
                        value={taskPriority}
                        onChange={(e) => setTaskPriority(e.target.value as any)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={taskDueDate}
                        onChange={(e) => setTaskDueDate(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowTaskForm(false)}
                      className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg"
                    >
                      Create Assignment
                    </button>
                  </div>
                </form>
              )}

              {/* Tasks List */}
              {relatedData.tasks.length === 0 ? (
                <div className="text-center py-8 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <CheckSquare className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-slate-500">No active tasks assigned yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {relatedData.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                            {task.title}
                          </h5>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            task.priority === 'urgent'
                              ? 'bg-red-500/10 text-red-600 border border-red-500/20'
                              : task.priority === 'high'
                              ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                              : 'bg-slate-500/10 text-slate-600'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Due {new Date(task.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                            </span>
                          )}
                          <span>Round {task.revisionRound || 1}</span>
                        </div>
                      </div>

                      <select
                        value={task.status}
                        onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                          task.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : task.status === 'in_progress'
                            ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
                            : task.status === 'review'
                            ? 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300'
                        }`}
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Under Review</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {/* Assigned Projects */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Linked Projects ({relatedData.projects.length})
                </h4>
                {relatedData.projects.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No project memberships assigned yet.</p>
                ) : (
                  <div className="space-y-2">
                    {relatedData.projects.map((proj) => (
                      <div
                        key={proj.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{proj.title}</p>
                          <p className="text-[11px] text-slate-500">Client: {proj.clientName}</p>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
                          {proj.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SUBMISSIONS & REVISIONS */}
          {activeTab === 'submissions' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Work Submissions & Revisions
                  </h4>
                  <p className="text-xs text-slate-500">Track delivery links, revision rounds, and feedback status</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSubmissionForm(!showSubmissionForm)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record Submission</span>
                </button>
              </div>

              {/* Record Submission Form */}
              {showSubmissionForm && (
                <form
                  onSubmit={handleRecordSubmission}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-indigo-500/30 space-y-3 animate-scale-up"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Log Freelancer Deliverable URL</span>
                    </h5>
                    <button
                      type="button"
                      onClick={() => setShowSubmissionForm(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Deliverable / Task Name *
                    </label>
                    <input
                      type="text"
                      value={subTaskTitle}
                      onChange={(e) => setSubTaskTitle(e.target.value)}
                      placeholder="e.g. 4K Commercial Video Cut V2"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Work URL (Google Drive, Frame.io, Figma, WeTransfer) *
                    </label>
                    <input
                      type="url"
                      value={subUrl}
                      onChange={(e) => setSubUrl(e.target.value)}
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
                        value={subRevisionRound}
                        onChange={(e) => setSubRevisionRound(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Review Status
                      </label>
                      <select
                        value={subStatus}
                        onChange={(e) => setSubStatus(e.target.value as any)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      >
                        <option value="pending_review">Pending Review</option>
                        <option value="approved">Approved</option>
                        <option value="revision_requested">Revision Requested</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Submission Notes & Feedback
                    </label>
                    <input
                      type="text"
                      value={subNotes}
                      onChange={(e) => setSubNotes(e.target.value)}
                      placeholder="Notes on color passes, audio sync, client feedback..."
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowSubmissionForm(false)}
                      className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingSub}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg"
                    >
                      Save Submission
                    </button>
                  </div>
                </form>
              )}

              {/* Submissions List */}
              {relatedData.submissions.length === 0 ? (
                <div className="text-center py-8 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <RotateCcw className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-slate-500">No work submissions recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {relatedData.submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                              {sub.taskTitle || 'Project Deliverable'}
                            </h5>
                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 text-[10px] font-bold">
                              Round {sub.revisionRound}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Delivered {new Date(sub.submittedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          sub.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : sub.status === 'revision_requested'
                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            : 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                        }`}>
                          {sub.status === 'approved'
                            ? 'Approved'
                            : sub.status === 'revision_requested'
                            ? 'Revision Requested'
                            : 'Pending Review'}
                        </span>
                      </div>

                      {/* URL button */}
                      <div className="pt-1">
                        <a
                          href={sub.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span className="truncate max-w-md">{sub.url}</span>
                        </a>
                      </div>

                      {sub.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                          {sub.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PAYOUTS & FINANCIALS */}
          {activeTab === 'payouts' && (
            <div className="space-y-6 animate-fade-in">
              {/* Financial Summary Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white border border-slate-800 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Payment Ledger
                  </h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    computed.pendingBalance === 0 && computed.paidAmount > 0
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : computed.paidAmount > 0
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    {computed.pendingBalance === 0 && computed.paidAmount > 0
                      ? 'Fully Settled'
                      : computed.paidAmount > 0
                      ? 'Partial Paid'
                      : 'Payment Pending'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-[11px] text-slate-400">Total Agreed</span>
                    <h3 className="text-lg font-black mt-0.5">
                      ₹{computed.agreedAmount.toLocaleString('en-IN')}
                    </h3>
                  </div>
                  <div>
                    <span className="text-[11px] text-emerald-400">Paid to Subcontractor</span>
                    <h3 className="text-lg font-black text-emerald-400 mt-0.5">
                      ₹{computed.paidAmount.toLocaleString('en-IN')}
                    </h3>
                  </div>
                  <div>
                    <span className="text-[11px] text-amber-400">Pending Due Balance</span>
                    <h3 className="text-lg font-black text-amber-400 mt-0.5">
                      ₹{computed.pendingBalance.toLocaleString('en-IN')}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Record Payout Trigger Button */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Payout Records ({relatedData.payouts.length})
                  </h4>
                  <p className="text-xs text-slate-500">Log UPI transfers, bank payments, or milestone advances</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPayoutForm(!showPayoutForm)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record Payout</span>
                </button>
              </div>

              {/* Record Payout Form */}
              {showPayoutForm && (
                <form
                  onSubmit={handleRecordPayout}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-emerald-500/30 space-y-3 animate-scale-up"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Record Outgoing Payout to {currentFreelancer.name}</span>
                    </h5>
                    <button
                      type="button"
                      onClick={() => setShowPayoutForm(false)}
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
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g. 12000"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Payment Method
                      </label>
                      <select
                        value={payoutMethod}
                        onChange={(e) => setPayoutMethod(e.target.value as any)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      >
                        <option value="UPI">UPI</option>
                        <option value="Bank Transfer">Bank Transfer (IMPS/NEFT)</option>
                        <option value="Cash">Cash / Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        UPI Ref / UTR # (Optional)
                      </label>
                      <input
                        type="text"
                        value={payoutRef}
                        onChange={(e) => setPayoutRef(e.target.value)}
                        placeholder="UPI/2026/..."
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Notes / Milestone Description
                      </label>
                      <input
                        type="text"
                        value={payoutNotes}
                        onChange={(e) => setPayoutNotes(e.target.value)}
                        placeholder="e.g. Milestone 1 cut complete"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPayoutForm(false)}
                      className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingPayout}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg"
                    >
                      Confirm Payout
                    </button>
                  </div>
                </form>
              )}

              {/* Payout History List */}
              {relatedData.payouts.length === 0 ? (
                <div className="text-center py-8 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <CreditCard className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-slate-500">No payments logged yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {relatedData.payouts.map((payout) => (
                    <div
                      key={payout.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            ₹{payout.amount.toLocaleString('en-IN')}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                            {payout.method}
                          </span>
                          {payout.referenceId && (
                            <span className="text-[11px] text-slate-400">
                              Ref: {payout.referenceId}
                            </span>
                          )}
                        </div>
                        {payout.notes && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{payout.notes}</p>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {new Date(payout.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-6 animate-fade-in">
              {/* Add Note / Activity Form */}
              <form onSubmit={handleAddNote} className="space-y-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNewNoteType('note')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      newNoteType === 'note'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Internal Note
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewNoteType('call')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      newNoteType === 'call'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Phone Call
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewNoteType('whatsapp')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      newNoteType === 'whatsapp'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    WhatsApp Chat
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    rows={2}
                    placeholder={`Log a ${newNoteType} with ${currentFreelancer.name}...`}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={isAddingNote || !newNoteContent.trim()}
                    className="absolute right-2.5 bottom-2.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>Post</span>
                  </button>
                </div>
              </form>

              {/* Activity Feed */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Activity & Communication History
                </h4>

                {(currentFreelancer.activities || []).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No activity recorded yet.</p>
                ) : (
                  <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                    {(currentFreelancer.activities || []).map((act) => (
                      <div key={act.id} className="flex items-start gap-3 relative">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border-2 border-white dark:border-slate-900 shadow-sm z-10">
                          {act.type === 'call' ? (
                            <Phone className="w-3.5 h-3.5" />
                          ) : act.type === 'whatsapp' ? (
                            <Send className="w-3.5 h-3.5" />
                          ) : (
                            <FileText className="w-3.5 h-3.5" />
                          )}
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
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
