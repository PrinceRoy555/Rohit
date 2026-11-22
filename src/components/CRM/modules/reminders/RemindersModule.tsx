import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Filter,
  Plus,
  Trash2,
  RefreshCw,
  MoreVertical,
  Flame,
  ChevronRight,
  ShieldCheck,
  Receipt,
  User,
  FolderKanban,
  CheckSquare,
  Sparkles,
  Info,
  X,
  FastForward,
  CornerDownRight
} from 'lucide-react';
import { CrmReminder } from '../../../../types/crm';
import {
  getAllActiveRemindersWithDynamic,
  toggleReminderCompleted,
  deleteStoredReminder,
  deleteReminderWithCloud,
  snoozeReminder,
  saveStoredReminder,
  saveReminderWithCloud,
  initCrmStorage,
  subscribeCrmStore
} from '../../../../services/crmStorageService';
import { CrmPageHeader } from '../../shared/CrmPageHeader';

interface RemindersModuleProps {
  onNavigateToModule?: (moduleId: any) => void;
}

export const RemindersModule: React.FC<RemindersModuleProps> = ({ onNavigateToModule }) => {
  const [reminders, setReminders] = useState<CrmReminder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filters
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'completed' | 'all'>('pending');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<CrmReminder['type']>('lead_followup');
  const [newTargetDate, setNewTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [newPriority, setNewPriority] = useState<CrmReminder['priority']>('high');
  const [newNotes, setNewNotes] = useState('');

  const loadReminders = async () => {
    try {
      await initCrmStorage();
      setReminders(getAllActiveRemindersWithDynamic());
    } catch (err) {
      console.error('Error loading reminders:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadReminders();

    const unsubscribe = subscribeCrmStore(() => {
      setReminders(getAllActiveRemindersWithDynamic());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadReminders();
  };

  // KPIs
  const todayStr = new Date().toISOString().split('T')[0];
  const kpis = useMemo(() => {
    const overdue = reminders.filter((r) => !r.isCompleted && r.targetDate < todayStr).length;
    const dueToday = reminders.filter((r) => !r.isCompleted && r.targetDate === todayStr).length;
    const upcoming = reminders.filter((r) => !r.isCompleted && r.targetDate > todayStr).length;
    const completed = reminders.filter((r) => r.isCompleted).length;

    return { overdue, dueToday, upcoming, completed };
  }, [reminders, todayStr]);

  // Filtered List
  const filteredReminders = useMemo(() => {
    let result = [...reminders];

    if (statusFilter === 'pending') {
      result = result.filter((r) => !r.isCompleted);
    } else if (statusFilter === 'completed') {
      result = result.filter((r) => r.isCompleted);
    }

    if (selectedType !== 'all') {
      result = result.filter((r) => r.type === selectedType);
    }

    if (selectedPriority !== 'all') {
      result = result.filter((r) => r.priority === selectedPriority);
    }

    return result;
  }, [reminders, statusFilter, selectedType, selectedPriority]);

  // Actions
  const handleToggle = (id: string) => {
    toggleReminderCompleted(id);
    handleRefresh();
  };

  const handleSnooze = (id: string, days: number) => {
    snoozeReminder(id, days);
    handleRefresh();
  };

  const handleDelete = async (id: string) => {
    const res = await deleteReminderWithCloud(id);
    if (!res.success && res.errorCode === 'permission-denied') {
      alert('Permission Denied: You do not have permission to delete reminders.');
      return;
    }
    handleRefresh();
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const res = await saveReminderWithCloud({
      title: newTitle.trim(),
      type: newType,
      targetDate: newTargetDate,
      priority: newPriority,
      notes: newNotes.trim() || undefined
    });

    if (!res.success && res.cloudResult?.errorCode === 'permission-denied') {
      alert('Permission Denied: You do not have permission to create reminders.');
      return;
    }

    setNewTitle('');
    setNewNotes('');
    setIsAddModalOpen(false);
    handleRefresh();
  };

  const getTypeIcon = (type: CrmReminder['type']) => {
    switch (type) {
      case 'invoice_due':
        return <Receipt className="w-3.5 h-3.5 text-violet-500" />;
      case 'lead_followup':
        return <User className="w-3.5 h-3.5 text-blue-500" />;
      case 'project_deadline':
        return <FolderKanban className="w-3.5 h-3.5 text-indigo-500" />;
      case 'freelancer_task':
        return <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header */}
      <CrmPageHeader
        title="Reminders & Notifications"
        subtitle="Automated agenda, overdue invoice payment alerts, project deadlines, and client follow-ups"
        icon={Bell}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              className={`p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs ${
                isRefreshing ? 'animate-spin text-[#7c3aed]' : ''
              }`}
              title="Refresh Agenda"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Reminder</span>
            </button>
          </div>
        }
      />

      {/* 2. Notification System Disclosure Banner */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400 shadow-2xs">
        <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#7c3aed] dark:text-purple-300 border border-purple-200 dark:border-purple-800 shrink-0 mt-0.5 shadow-2xs">
          <Info className="w-4 h-4" />
        </div>
        <div>
          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>In-Browser Active Notification Engine</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
              Active CRM Session
            </span>
          </div>
          <p className="mt-0.5 text-[11px] leading-relaxed">
            Dynamic alerts are synthesized in real-time from your active Invoices, Leads, Projects, and Tasks. Notifications trigger while the CRM portal is open. To prevent false claims, background OS daemon polling when the browser is terminated is not operated without dedicated server daemon infrastructure.
          </p>
        </div>
      </div>

      {/* 3. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Overdue Alerts */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Overdue & Critical
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-rose-600 dark:text-rose-400 mt-1 tracking-tight">
              {kpis.overdue}
            </div>
            <div className="text-[11px] text-rose-600/80 font-medium mt-0.5">
              Requires immediate action
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 flex items-center justify-center shadow-2xs">
            <Flame className="w-5 h-5 stroke-[2.2] animate-pulse" />
          </div>
        </div>

        {/* KPI 2: Today's Action Items */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Due Today
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-amber-600 dark:text-amber-400 mt-1 tracking-tight">
              {kpis.dueToday}
            </div>
            <div className="text-[11px] text-amber-600/80 font-medium mt-0.5">
              Scheduled for today
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center shadow-2xs">
            <Clock className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* KPI 3: Upcoming Deadlines */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Upcoming Horizon
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-blue-600 dark:text-blue-400 mt-1 tracking-tight">
              {kpis.upcoming}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Next 7 days pipeline
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shadow-2xs">
            <Calendar className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* KPI 4: Cleared / Completed */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Completed Tasks
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-emerald-600 dark:text-emerald-400 mt-1 tracking-tight">
              {kpis.completed}
            </div>
            <div className="text-[11px] text-emerald-600/80 font-medium mt-0.5">
              Resolved reminders
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shadow-2xs">
            <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* 4. Toolbar: Filter by Category, Priority & Status */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'pending'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Active Agenda ({kpis.overdue + kpis.dueToday + kpis.upcoming})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'completed'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Completed ({kpis.completed})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All Items
            </button>
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="lead_followup">Lead Follow-ups</option>
            <option value="invoice_due">Invoice Payments Due</option>
            <option value="project_deadline">Project Milestones</option>
            <option value="freelancer_task">Tasks Due</option>
            <option value="general">General Reminders</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Showing {filteredReminders.length} items
        </div>
      </div>

      {/* 5. Reminders List View */}
      {filteredReminders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            All Clear! No Pending Reminders
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            You are fully caught up with follow-ups, invoices, and deadlines.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReminders.map((rem) => {
            const isOverdue = !rem.isCompleted && rem.targetDate < todayStr;
            const isToday = !rem.isCompleted && rem.targetDate === todayStr;

            return (
              <div
                key={rem.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  rem.isCompleted
                    ? 'bg-slate-50/60 dark:bg-slate-800/20 border-slate-200/60 dark:border-slate-800 opacity-60'
                    : isOverdue
                    ? 'bg-rose-50/20 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/50 shadow-xs'
                    : isToday
                    ? 'bg-amber-50/20 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/50 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                }`}
              >
                {/* Checkbox & Content */}
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => handleToggle(rem.id)}
                    className={`p-1.5 rounded-xl border mt-0.5 transition-all ${
                      rem.isCompleted
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-emerald-500 hover:text-emerald-500'
                    }`}
                    title={rem.isCompleted ? 'Mark Pending' : 'Mark Completed'}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="p-1 rounded-md bg-slate-100 dark:bg-slate-800">
                        {getTypeIcon(rem.type)}
                      </span>
                      <h4
                        className={`text-xs font-bold ${
                          rem.isCompleted
                            ? 'line-through text-slate-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {rem.title}
                      </h4>

                      {/* Priority Tag */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                          rem.priority === 'urgent'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : rem.priority === 'high'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {rem.priority}
                      </span>

                      {rem.isDynamic && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 font-mono">
                          Auto-Synced
                        </span>
                      )}
                    </div>

                    {rem.subtitle && (
                      <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        {rem.subtitle}
                      </div>
                    )}

                    {rem.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {rem.notes}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1">
                      <span
                        className={`flex items-center gap-1 font-semibold ${
                          isOverdue
                            ? 'text-rose-600 dark:text-rose-400'
                            : isToday
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-500'
                        }`}
                      >
                        <Calendar className="w-3 h-3" />
                        <span>
                          {isOverdue ? 'Overdue: ' : isToday ? 'Due Today: ' : 'Target: '}
                          {new Date(rem.targetDate).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </span>

                      {rem.snoozedUntil && (
                        <span className="text-amber-500 flex items-center gap-0.5">
                          <FastForward className="w-2.5 h-2.5" />
                          <span>Snoozed until {rem.snoozedUntil}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Snooze & Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {!rem.isCompleted && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSnooze(rem.id, 1)}
                        className="px-2 py-1 rounded-lg text-[10px] font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Snooze 1 Day"
                      >
                        +1 Day
                      </button>
                      <button
                        onClick={() => handleSnooze(rem.id, 3)}
                        className="px-2 py-1 rounded-lg text-[10px] font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Snooze 3 Days"
                      >
                        +3 Days
                      </button>
                    </div>
                  )}

                  {!rem.isDynamic && (
                    <button
                      onClick={() => handleDelete(rem.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Reminder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Add Custom Reminder Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
                  <Bell className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Create Studio Reminder
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reminder Title / Action <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Call Rajesh on Instagram Brand Reel quotation"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="lead_followup">Lead Follow-up</option>
                    <option value="invoice_due">Invoice Payment Due</option>
                    <option value="project_deadline">Project Milestone</option>
                    <option value="freelancer_task">Subcontractor Task</option>
                    <option value="general">General Studio Agenda</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Priority
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['urgent', 'high', 'medium', 'low'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPriority(p)}
                      className={`py-1.5 text-[11px] font-bold rounded-xl border uppercase transition-all ${
                        newPriority === p
                          ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Remarks / Context
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Additional reference numbers, links or phone details..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
