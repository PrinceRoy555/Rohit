import React, { useState, useEffect } from 'react';
import {
  X,
  CheckSquare,
  Building,
  FolderKanban,
  UserCheck,
  Calendar,
  Clock,
  AlertTriangle,
  Plus,
  Trash2,
  FileText
} from 'lucide-react';
import {
  CrmTask,
  CrmTaskStatus,
  CrmTaskPriority,
  CrmProject,
  CrmClient,
  CrmFreelancer
} from '../../../../types/crm';
import {
  getStoredProjects,
  getStoredClients,
  getStoredFreelancers,
  saveStoredTask,
  saveTaskWithCloud
} from '../../../../services/crmStorageService';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskSaved: (task: CrmTask) => void;
  initialTask?: CrmTask | null;
  defaultProjectId?: string;
  defaultFreelancerId?: string;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onTaskSaved,
  initialTask,
  defaultProjectId,
  defaultFreelancerId
}) => {
  const [projectsList, setProjectsList] = useState<CrmProject[]>([]);
  const [clientsList, setClientsList] = useState<CrmClient[]>([]);
  const [freelancersList, setFreelancersList] = useState<CrmFreelancer[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [clientId, setClientId] = useState('');
  const [assignedFreelancerId, setAssignedFreelancerId] = useState('');
  const [priority, setPriority] = useState<CrmTaskPriority>('medium');
  const [status, setStatus] = useState<CrmTaskStatus>('to_do');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number | ''>(8);
  const [notes, setNotes] = useState('');

  // Checklist items
  const [subtasks, setSubtasks] = useState<Array<{ id: string; title: string; completed: boolean }>>([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(initialTask && initialTask.id);

  useEffect(() => {
    if (!isOpen) return;

    const pList = getStoredProjects();
    const cList = getStoredClients();
    const fList = getStoredFreelancers();

    setProjectsList(pList);
    setClientsList(cList);
    setFreelancersList(fList);

    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setProjectId(initialTask.projectId || '');
      setClientId(initialTask.clientId || '');
      setAssignedFreelancerId(initialTask.assignedFreelancerId || '');
      setPriority(initialTask.priority || 'medium');
      setStatus(
        initialTask.status === 'todo'
          ? 'to_do'
          : initialTask.status === 'review'
          ? 'in_review'
          : initialTask.status || 'to_do'
      );
      setStartDate(initialTask.startDate || '');
      setDueDate(initialTask.dueDate || '');
      setEstimatedHours(initialTask.estimatedHours ?? 8);
      setNotes(initialTask.notes || '');
      setSubtasks(initialTask.subtasks || []);
    } else {
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

      const initialProjId = defaultProjectId || (pList.length > 0 ? pList[0].id : '');
      const matchedProj = pList.find((p) => p.id === initialProjId);

      setTitle('');
      setDescription('');
      setProjectId(initialProjId);
      setClientId(matchedProj ? matchedProj.clientId : (cList.length > 0 ? cList[0].id : ''));
      setAssignedFreelancerId(defaultFreelancerId || '');
      setPriority('medium');
      setStatus('to_do');
      setStartDate(today);
      setDueDate(nextWeek);
      setEstimatedHours(8);
      setNotes('');
      setSubtasks([
        { id: 'st_1', title: 'Asset ingestion & raw brief check', completed: false },
        { id: 'st_2', title: 'Execution draft & initial pass', completed: false },
        { id: 'st_3', title: 'Quality check & client delivery export', completed: false }
      ]);
    }
    setErrors({});
  }, [isOpen, initialTask, defaultProjectId, defaultFreelancerId]);

  if (!isOpen) return null;

  const handleProjectChange = (selectedProjId: string) => {
    setProjectId(selectedProjId);
    if (selectedProjId) {
      const match = projectsList.find((p) => p.id === selectedProjId);
      if (match) {
        setClientId(match.clientId);
        if (match.assignedFreelancerIds && match.assignedFreelancerIds.length > 0 && !assignedFreelancerId) {
          setAssignedFreelancerId(match.assignedFreelancerIds[0]);
        }
      }
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    const newSub = {
      id: `st_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: newSubtaskText.trim(),
      completed: false
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskText('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) {
      errs.title = 'Task title is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const selectedProj = projectsList.find((p) => p.id === projectId);
      const selectedClient = clientsList.find((c) => c.id === clientId);
      const selectedFreelancer = freelancersList.find((f) => f.id === assignedFreelancerId);

      const result = await saveTaskWithCloud({
        id: initialTask?.id,
        title: title.trim(),
        description: description.trim() || undefined,
        projectId: projectId || undefined,
        projectTitle: selectedProj ? selectedProj.title : undefined,
        clientId: clientId || undefined,
        clientName: selectedClient ? selectedClient.name : undefined,
        assignedFreelancerId: assignedFreelancerId || undefined,
        assignedFreelancerName: selectedFreelancer ? selectedFreelancer.name : undefined,
        priority,
        status,
        startDate: startDate || undefined,
        dueDate: dueDate || undefined,
        estimatedHours: typeof estimatedHours === 'number' ? estimatedHours : undefined,
        subtasks,
        notes: notes.trim() || undefined
      });

      if (!result.success && result.cloudResult?.errorCode === 'permission-denied') {
        setErrors({ form: 'Permission Denied: You do not have permission to modify tasks.' });
        setIsSubmitting(false);
        return;
      }

      onTaskSaved(result.task);
      onClose();
    } catch (err) {
      console.error('Error saving task:', err);
      setErrors({ form: 'Failed to save task. Please try again.' });
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
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Edit Task Record' : 'Create New Task'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing
                  ? 'Update creative task details, deadlines, and subcontractor allocations.'
                  : 'Assign creative milestones, review links, and checklists.'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
          {errors.form && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Task Title <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <CheckSquare className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 4K Color Grading & Cinematic Grade Pass"
                className={`w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border ${
                  errors.title ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                } rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>
            {errors.title && <p className="text-[11px] text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Project & Client Linkage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Linked Project
              </label>
              <div className="relative">
                <FolderKanban className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={projectId}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">No Project (Standalone)</option>
                  {projectsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Client / Brand
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">No Direct Client</option>
                  {clientsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Assignee & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Assign Subcontractor
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={assignedFreelancerId}
                  onChange={(e) => setAssignedFreelancerId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Internal / In-House</option>
                  {freelancersList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.specialty})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as CrmTaskPriority)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="urgent">🔥 Urgent (Top Priority)</option>
                <option value="high">⚠️ High Priority</option>
                <option value="medium">⏱️ Medium Priority</option>
                <option value="low">☕ Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CrmTaskStatus)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="to_do">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>

          {/* Dates & Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Due Date / Deadline
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Estimated Hours
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="8"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Task Brief & Technical Specifications
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Detailed instructions, render settings, color palettes, and client moodboards..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Subtasks / Checklist */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Checklist / Subtasks ({subtasks.length})
              </label>
              <span className="text-[11px] text-slate-400">
                Dynamic progress tracker
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add checklist subtask (e.g. Ingest 4K clips, color grade pass)..."
                className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 mt-2 max-h-36 overflow-y-auto">
                {subtasks.map((st, idx) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs"
                  >
                    <span className="text-slate-700 dark:text-slate-300 truncate pr-2">
                      {idx + 1}. {st.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Internal Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Internal Admin Notes
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Internal reminders, client feedback links, Frame.io IDs..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Admin-only task allocation
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
                <span>{isEditing ? 'Save Changes' : 'Create Task'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
