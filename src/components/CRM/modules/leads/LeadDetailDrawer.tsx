import React, { useState } from 'react';
import { CrmLead, LeadPipelineStage } from '../../../../types/crm';
import { InquiryStatus } from '../../../../types/cms';
import {
  saveStoredLead,
  updateLeadPipelineStage,
  updateLeadFollowUp,
  addLeadActivity,
  convertLeadToClient,
  deleteStoredLead,
  deleteLeadWithCloud,
  normalizePhoneNumber
} from '../../../../services/crmStorageService';
import { LeadStatusBadge } from './LeadStatusBadge';
import { WHATSAPP_BUSINESS_URL } from '../../../../data';
import {
  X,
  Phone,
  Mail,
  Building,
  Briefcase,
  Calendar,
  Clock,
  User,
  MessageSquare,
  CheckCircle2,
  Trash2,
  Edit,
  ExternalLink,
  Send,
  UserCheck,
  AlertCircle,
  Sparkles,
  Share2
} from 'lucide-react';

interface LeadDetailDrawerProps {
  lead: CrmLead | null;
  isOpen: boolean;
  onClose: () => void;
  onEditLead?: (lead: CrmLead) => void;
  onNavigateToClients?: () => void;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  lead,
  isOpen,
  onClose,
  onEditLead,
  onNavigateToClients
}) => {
  if (!isOpen || !lead) return null;

  // Local state for interactive updates
  const [currentLead, setCurrentLead] = useState<CrmLead>(lead);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteType, setNewNoteType] = useState<'note' | 'call' | 'whatsapp' | 'email'>('note');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [conversionSuccess, setConversionSuccess] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync if lead prop changes
  React.useEffect(() => {
    setCurrentLead(lead);
    setConversionSuccess(lead.convertedClientId || null);
  }, [lead]);

  // Clean phone for WhatsApp direct link
  const rawPhone = currentLead.phone || '';
  const digits = normalizePhoneNumber(rawPhone);
  const directWhatsAppUrl = digits
    ? `https://wa.me/91${digits}?text=${encodeURIComponent(
        `Hi ${currentLead.name}, Rohit Verma here from RohitWork Agency. Following up on your inquiry for ${currentLead.service}.`
      )}`
    : null;

  // Status Change
  const handleStatusChange = (newStatus: LeadPipelineStage) => {
    updateLeadPipelineStage(currentLead.id, newStatus);
    const nextInqStatus: InquiryStatus = newStatus === 'won' ? 'completed' : newStatus === 'lost' ? 'closed' : 'new';
    const updated: CrmLead = {
      ...currentLead,
      pipelineStage: newStatus,
      status: nextInqStatus
    };
    setCurrentLead(updated);
    addLeadActivity(currentLead.id, {
      type: 'status_change',
      content: `Status updated to ${newStatus}`
    });
  };

  // Follow-up Date Setting
  const handleSetFollowUp = (daysAhead: number | null) => {
    if (daysAhead === null) {
      updateLeadFollowUp(currentLead.id, null);
      setCurrentLead({ ...currentLead, followUpAt: null });
      return;
    }

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysAhead);
    const iso = targetDate.toISOString();
    updateLeadFollowUp(currentLead.id, iso, `Follow-up set for +${daysAhead} days`);
    setCurrentLead({ ...currentLead, followUpAt: iso, pipelineStage: 'follow_up' });
  };

  // Add Custom Note / Activity
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    setIsAddingNote(true);
    addLeadActivity(currentLead.id, {
      type: newNoteType,
      content: newNoteContent.trim(),
      author: 'Rohit Verma'
    });

    const newActivity = {
      id: `act_${Date.now()}`,
      type: newNoteType,
      content: newNoteContent.trim(),
      timestamp: new Date().toISOString(),
      author: 'Rohit Verma'
    };

    setCurrentLead({
      ...currentLead,
      activities: [newActivity, ...(currentLead.activities || [])]
    });

    setNewNoteContent('');
    setIsAddingNote(false);
  };

  // Convert to Client
  const handleConvertToClient = () => {
    const newClient = convertLeadToClient(currentLead);
    setConversionSuccess(newClient.id);
    setCurrentLead({
      ...currentLead,
      pipelineStage: 'won',
      status: 'completed',
      convertedClientId: newClient.id
    });
  };

  // Delete Lead
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to remove lead "${currentLead.name}"?`)) {
      const res = await deleteLeadWithCloud(currentLead.id);
      if (!res.success && res.errorCode === 'permission-denied') {
        alert('Permission Denied: You do not have permission to delete lead records.');
        return;
      }
      onClose();
    }
  };

  const isFollowUpDue = currentLead.followUpAt
    ? new Date(currentLead.followUpAt).getTime() <= Date.now() + 24 * 60 * 60 * 1000
    : false;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
        role="dialog"
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <LeadStatusBadge status={currentLead.pipelineStage || currentLead.status} size="md" />
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium capitalize">
                  {(currentLead.source || 'website').replace(/[-_]/g, ' ')}
                </span>
                {currentLead.priority && (
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                      currentLead.priority === 'urgent'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        : currentLead.priority === 'high'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {currentLead.priority}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {currentLead.name}
              </h2>
              {(currentLead.company || currentLead.businessName) && (
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Building className="w-3.5 h-3.5" />
                  {currentLead.company || currentLead.businessName}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {onEditLead && (
                <button
                  onClick={() => onEditLead(currentLead)}
                  title="Edit Lead"
                  className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleDelete}
                title="Delete Lead"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Action Bar */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Direct WhatsApp Chat */}
            {directWhatsAppUrl ? (
              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat Direct</span>
              </a>
            ) : (
              <button
                disabled
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-medium cursor-not-allowed"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>No Phone</span>
              </button>
            )}

            {/* Rohitwork WhatsApp Business Link */}
            <a
              href="https://wa.me/message/H4JLHPJ3NNGOK1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Agency WA</span>
            </a>

            {/* Call */}
            {currentLead.phone ? (
              <a
                href={`tel:${currentLead.phone}`}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>
            ) : null}

            {/* Email */}
            {currentLead.email ? (
              <a
                href={`mailto:${currentLead.email}`}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </a>
            ) : null}
          </div>
        </div>

        {/* Conversion Banner if already converted */}
        {conversionSuccess && (
          <div className="px-6 py-3 bg-indigo-50 dark:bg-indigo-950/40 border-b border-indigo-200 dark:border-indigo-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Converted to Client (ID: {conversionSuccess})</span>
            </div>
            {onNavigateToClients && (
              <button
                onClick={onNavigateToClients}
                className="text-xs px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition"
              >
                View Client &rarr;
              </button>
            )}
          </div>
        )}

        {/* Drawer Body Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Progression Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Pipeline Stage
              </span>
              <span className="text-xs text-slate-400">Click to change</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {(['new', 'contacted', 'follow_up', 'qualified', 'won', 'lost'] as LeadPipelineStage[]).map(
                (stage) => {
                  const isActive =
                    (currentLead.pipelineStage || currentLead.status) === stage;
                  return (
                    <button
                      key={stage}
                      onClick={() => handleStatusChange(stage)}
                      className={`text-[11px] py-1.5 px-2 rounded-lg font-semibold transition text-center capitalize ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {stage.replace('_', ' ')}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Convert to Client Button (if not yet converted) */}
          {!conversionSuccess && (
            <button
              onClick={handleConvertToClient}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition"
            >
              <UserCheck className="w-4 h-4" />
              <span>Convert Lead to Active Client</span>
            </button>
          )}

          {/* Lead Information Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Lead Information
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Service Requested</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {currentLead.service || 'Creative Design'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Budget</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {currentLead.budget || currentLead.budgetRange || 'Not Specified'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Phone</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {currentLead.phone || 'No phone provided'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Email</span>
                <span className="font-semibold text-slate-900 dark:text-white break-all">
                  {currentLead.email || 'None (Phone-only)'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Assigned To</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {currentLead.assignedTo || 'Rohit Verma'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Created Date</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {currentLead.createdAt
                    ? new Date(currentLead.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Client Requirement / Message */}
          {currentLead.message && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Initial Inquiry / Requirements
              </h3>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {currentLead.message}
              </div>
            </div>
          )}

          {/* Follow-up Reminder Management */}
          <div className="space-y-2 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Follow-up Reminder</span>
              </div>
              {currentLead.followUpAt && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                    isFollowUpDue
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 animate-pulse'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                  }`}
                >
                  {isFollowUpDue ? 'Due Today / Overdue' : 'Scheduled'}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              {currentLead.followUpAt ? (
                <>
                  Scheduled for:{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {new Date(currentLead.followUpAt).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </strong>
                </>
              ) : (
                'No follow-up scheduled. Pick a reminder below:'
              )}
            </p>

            <div className="flex items-center gap-1.5 pt-1 flex-wrap">
              <button
                type="button"
                onClick={() => handleSetFollowUp(1)}
                className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700 transition"
              >
                Tomorrow (+1d)
              </button>
              <button
                type="button"
                onClick={() => handleSetFollowUp(3)}
                className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700 transition"
              >
                In 3 Days
              </button>
              <button
                type="button"
                onClick={() => handleSetFollowUp(7)}
                className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700 transition"
              >
                Next Week (+7d)
              </button>
              {currentLead.followUpAt && (
                <button
                  type="button"
                  onClick={() => handleSetFollowUp(null)}
                  className="text-xs px-2 py-1 text-slate-400 hover:text-rose-500 font-medium transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Interaction History & Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
              <span>Interaction History & Notes</span>
              <span className="text-[10px] text-slate-400">
                {(currentLead.activities || []).length} logged
              </span>
            </h3>

            {/* Post Note Form */}
            <form onSubmit={handleAddNote} className="space-y-2">
              <div className="flex items-center gap-1.5">
                {(['note', 'whatsapp', 'call', 'email'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setNewNoteType(t)}
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md transition ${
                      newNoteType === t
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder={`Log a new ${newNoteType}...`}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!newNoteContent.trim() || isAddingNote}
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Timeline List */}
            <div className="space-y-2 pt-2">
              {(currentLead.activities && currentLead.activities.length > 0 ? (
                currentLead.activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-semibold uppercase text-indigo-600 dark:text-indigo-400">
                        {act.type.replace('_', ' ')}
                      </span>
                      <span>
                        {new Date(act.timestamp).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 font-medium">
                      {act.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  No interaction history recorded yet. Add your first note above.
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
