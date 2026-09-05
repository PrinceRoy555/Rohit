import React, { useState } from 'react';
import { InquiryRecord, FollowUpStatus, LeadPriority, InquiryStatus } from '../../../types/cms';
import {
  calculateLeadScore,
  getLeadScoreCategory,
  formatFollowUpDateTime,
  formatOverdueDuration,
  getLeadFollowUpCategory
} from '../../../utils/leadScoring';
import {
  X,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Clock,
  Flame,
  CheckCircle2,
  AlertCircle,
  User,
  Building,
  Briefcase,
  DollarSign,
  FileText,
  Tag,
  Save,
  RotateCcw,
  ExternalLink
} from 'lucide-react';

interface LeadDetailDrawerProps {
  lead: InquiryRecord;
  onClose: () => void;
  onUpdateLead: (id: string, updates: Partial<InquiryRecord>) => Promise<void>;
  onDeleteLead?: (id: string) => Promise<void>;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  lead,
  onClose,
  onUpdateLead,
  onDeleteLead
}) => {
  // Follow-up state
  const initialDate = lead.followUpAt ? new Date(lead.followUpAt).toISOString().split('T')[0] : '';
  const initialTime = lead.followUpAt
    ? new Date(lead.followUpAt).toTimeString().substring(0, 5)
    : '10:00';

  const [followUpDate, setFollowUpDate] = useState(initialDate);
  const [followUpTime, setFollowUpTime] = useState(initialTime);
  const [nextAction, setNextAction] = useState(lead.nextAction || '');
  const [priority, setPriority] = useState<LeadPriority>(lead.priority || 'medium');
  const [status, setStatus] = useState<InquiryStatus>(lead.status);
  const [internalNotes, setInternalNotes] = useState(lead.internalNotes || lead.notes || '');
  const [isHotLead, setIsHotLead] = useState<boolean>(Boolean(lead.isHotLead));
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const followUpCategory = getLeadFollowUpCategory(lead);
  const leadScore = typeof lead.leadScore === 'number' ? lead.leadScore : calculateLeadScore(lead);
  const scoreCategory = getLeadScoreCategory(leadScore);

  // Phone sanitizer for WhatsApp & Tel
  const cleanPhone = (lead.phone || '').replace(/[^0-9+]/g, '');
  const waPhone = cleanPhone.replace(/^\+/, '');

  const handleSaveFollowUp = async () => {
    if (!followUpDate) {
      alert('Please select a follow-up date.');
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    const combinedDateTime = new Date(`${followUpDate}T${followUpTime || '10:00'}:00`).toISOString();

    await onUpdateLead(lead.id, {
      followUpAt: combinedDateTime,
      followUpStatus: 'pending',
      nextAction: nextAction.trim(),
      priority,
      status: status === 'new' ? 'contacted' : status
    });

    setIsSaving(false);
    setSaveMessage('Follow-up scheduled successfully');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleMarkFollowUpComplete = async () => {
    setIsSaving(true);
    await onUpdateLead(lead.id, {
      followUpStatus: 'completed',
      lastContactedAt: new Date().toISOString()
    });
    setIsSaving(false);
    setSaveMessage('Follow-up marked complete');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleToggleHotLead = async () => {
    const newHotState = !isHotLead;
    setIsHotLead(newHotState);
    await onUpdateLead(lead.id, {
      isHotLead: newHotState
    });
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    await onUpdateLead(lead.id, {
      internalNotes: internalNotes.trim(),
      notes: internalNotes.trim()
    });
    setIsSaving(false);
    setSaveMessage('Notes saved');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleStatusChange = async (newStatus: InquiryStatus) => {
    setStatus(newStatus);
    await onUpdateLead(lead.id, { status: newStatus });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-bg-card border-l border-border-color h-full overflow-y-auto flex flex-col shadow-2xl text-text-primary"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border-color sticky top-0 bg-bg-card/95 backdrop-blur-md z-10 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-text-primary">{lead.name}</h2>
              {isHotLead && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                  <Flame className="w-3.5 h-3.5 fill-current text-rose-500" />
                  <span>HOT LEAD</span>
                </span>
              )}
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${scoreCategory.badgeBg}`}>
                Score {leadScore} • {scoreCategory.label}
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Submitted on {new Date(lead.createdAt).toLocaleString()} via{' '}
              <span className="font-medium text-text-secondary">{lead.source || 'Website Form'}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-bg-secondary hover:bg-bg-card-hover text-text-muted hover:text-text-primary transition-colors"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Confirmation Banner */}
        {saveMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{saveMessage}</span>
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-6 flex-1">
          {/* Quick Communication Bar */}
          <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-2xl bg-bg-secondary border border-border-color">
            {lead.phone ? (
              <>
                <a
                  href={`tel:${cleanPhone}`}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call ({lead.phone})</span>
                </a>

                <a
                  href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Hi ${lead.name}, regarding your inquiry for ${lead.service}:`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </>
            ) : null}

            <a
              href={`mailto:${lead.email}?subject=${encodeURIComponent(`Regarding your inquiry for ${lead.service}`)}`}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email ({lead.email})</span>
            </a>

            <button
              onClick={handleToggleHotLead}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ml-auto ${
                isHotLead
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-bg-card hover:bg-bg-card-hover text-text-muted border-border-color'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${isHotLead ? 'fill-current text-rose-500' : ''}`} />
              <span>{isHotLead ? 'Remove Hot Lead' : 'Mark as Hot Lead'}</span>
            </button>
          </div>

          {/* SECTION 29: FOLLOW-UP SCHEDULING */}
          <div className="p-5 rounded-2xl bg-bg-secondary border border-border-color space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <h3 className="text-sm font-bold text-text-primary">Follow-up Management</h3>
              </div>

              {lead.followUpAt && (
                <div className="flex items-center gap-2 text-xs">
                  {followUpCategory === 'overdue' && (
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{formatOverdueDuration(lead.followUpAt)}</span>
                    </span>
                  )}
                  {followUpCategory === 'due_today' && (
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      Due Today
                    </span>
                  )}
                  {followUpCategory === 'completed' && (
                    <span className="px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Completed</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {lead.followUpAt && (
              <div className="p-3 rounded-xl bg-bg-card border border-border-color text-xs space-y-1">
                <div className="flex items-center justify-between text-text-secondary font-medium">
                  <span>Current Scheduled Follow-up:</span>
                  <span className="font-bold text-text-primary">{formatFollowUpDateTime(lead.followUpAt)}</span>
                </div>
                {lead.nextAction && (
                  <p className="text-text-muted">
                    Next Action: <span className="text-text-secondary font-medium">{lead.nextAction}</span>
                  </p>
                )}
                {lead.lastContactedAt && (
                  <p className="text-[11px] text-text-muted">
                    Last contacted: {new Date(lead.lastContactedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Scheduling Form Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Next Follow-up Date
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full bg-bg-card border border-border-color rounded-xl px-3 py-2 text-xs text-text-primary focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={followUpTime}
                  onChange={(e) => setFollowUpTime(e.target.value)}
                  className="w-full bg-bg-card border border-border-color rounded-xl px-3 py-2 text-xs text-text-primary focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Next Action / Objective
              </label>
              <input
                type="text"
                placeholder="e.g., Send revised quotation, follow up regarding contract"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                className="w-full bg-bg-card border border-border-color rounded-xl px-3 py-2 text-xs text-text-primary focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as LeadPriority)}
                  className="w-full bg-bg-card border border-border-color rounded-xl px-3 py-2 text-xs text-text-primary focus:border-rose-500 focus:outline-none"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Lead Status
                </label>
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value as InquiryStatus)}
                  className="w-full bg-bg-card border border-border-color rounded-xl px-3 py-2 text-xs text-text-primary focus:border-rose-500 focus:outline-none"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="in_progress">In Progress / Proposal</option>
                  <option value="completed">Completed / Won</option>
                  <option value="closed">Closed / Archived</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleSaveFollowUp}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition-all"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{lead.followUpAt ? 'Reschedule Follow-up' : 'Schedule Follow-up'}</span>
              </button>

              {lead.followUpAt && lead.followUpStatus !== 'completed' && (
                <button
                  type="button"
                  onClick={handleMarkFollowUpComplete}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Follow-up Complete</span>
                </button>
              )}
            </div>
          </div>

          {/* Lead Details Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-bg-secondary border border-border-color space-y-1">
              <div className="text-text-muted flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Requested Service</span>
              </div>
              <div className="font-bold text-text-primary text-sm">{lead.service}</div>
            </div>

            <div className="p-4 rounded-xl bg-bg-secondary border border-border-color space-y-1">
              <div className="text-text-muted flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Budget Scope</span>
              </div>
              <div className="font-bold text-text-primary text-sm">
                {lead.budgetRange || 'Not specified'}
              </div>
            </div>

            {lead.businessName && (
              <div className="p-4 rounded-xl bg-bg-secondary border border-border-color space-y-1 sm:col-span-2">
                <div className="text-text-muted flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  <span>Company / Organization</span>
                </div>
                <div className="font-bold text-text-primary">{lead.businessName}</div>
              </div>
            )}
          </div>

          {/* Project Message / Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Project Scope & Message</span>
            </label>
            <div className="p-4 rounded-xl bg-bg-secondary border border-border-color text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
              {lead.message || 'No additional scope message provided.'}
            </div>
          </div>

          {/* Attachment if available */}
          {lead.attachmentUrl && (
            <div className="p-3.5 rounded-xl bg-bg-secondary border border-border-color flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                <span className="truncate text-text-primary font-medium">Attached Brief File</span>
              </div>
              <a
                href={lead.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-bg-card hover:bg-bg-card-hover border border-border-color text-xs font-medium text-text-primary flex items-center gap-1"
              >
                <span>View Attachment</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* SECTION 28 & 40: INTERNAL CRM NOTES (Admin Only) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>Internal CRM Notes (Admin Eyes Only)</span>
              </label>
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={isSaving}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-bg-secondary hover:bg-bg-card-hover border border-border-color text-text-primary flex items-center gap-1 transition-all"
              >
                <Save className="w-3 h-3" />
                <span>Save Notes</span>
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="Add confidential notes on client preferences, pricing discussion, or negotiation history..."
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              className="w-full bg-bg-secondary border border-border-color rounded-xl p-3 text-xs text-text-primary focus:border-rose-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-border-color bg-bg-card/95 backdrop-blur-md sticky bottom-0 flex items-center justify-between">
          {onDeleteLead && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Permanently delete lead for ${lead.name}?`)) {
                  onDeleteLead(lead.id);
                  onClose();
                }
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              Delete Lead
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-bg-secondary hover:bg-bg-card-hover text-text-primary border border-border-color transition-colors ml-auto"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
