import React, { useState, useEffect } from 'react';
import { CrmClient, CrmClientStatus } from '../../../../types/crm';
import {
  saveStoredClient,
  saveClientWithCloud,
  deleteStoredClient,
  deleteClientWithCloud,
  addClientActivity,
  getClientRelatedData,
  normalizePhoneNumber
} from '../../../../services/crmStorageService';
import { ClientStatusBadge } from './ClientStatusBadge';
import { WHATSAPP_BUSINESS_URL } from '../../../../data';
import {
  X,
  User,
  Phone,
  Mail,
  Building,
  MapPin,
  Tag,
  DollarSign,
  FolderKanban,
  Receipt,
  CreditCard,
  CheckSquare,
  MessageSquare,
  Clock,
  Trash2,
  Edit,
  ExternalLink,
  Send,
  Calendar,
  Sparkles,
  Share2,
  FileText
} from 'lucide-react';

interface ClientProfileDrawerProps {
  client: CrmClient | null;
  isOpen: boolean;
  onClose: () => void;
  onEditClient?: (client: CrmClient) => void;
  onNavigateToModule?: (moduleId: string) => void;
}

export const ClientProfileDrawer: React.FC<ClientProfileDrawerProps> = ({
  client,
  isOpen,
  onClose,
  onEditClient,
  onNavigateToModule
}) => {
  if (!isOpen || !client) return null;

  const [currentClient, setCurrentClient] = useState<CrmClient>(client);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'financials' | 'tasks' | 'timeline'>('overview');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteType, setNewNoteType] = useState<'note' | 'call' | 'whatsapp' | 'meeting'>('note');
  const [isAddingNote, setIsAddingNote] = useState(false);

  useEffect(() => {
    setCurrentClient(client);
  }, [client]);

  // Clean phone for WhatsApp link
  const rawPhone = currentClient.phone || '';
  const digits = normalizePhoneNumber(rawPhone);
  const directWhatsAppUrl = digits
    ? `https://wa.me/91${digits}?text=${encodeURIComponent(
        `Hi ${currentClient.name}, Rohit Verma here from RohitWork Agency.`
      )}`
    : null;

  // Related Data
  const related = getClientRelatedData(currentClient.id);

  // Status Change
  const handleStatusChange = async (newStatus: CrmClientStatus) => {
    setCurrentClient((prev) => ({ ...prev, status: newStatus }));
    try {
      const res = await saveClientWithCloud({
        id: currentClient.id,
        name: currentClient.name,
        status: newStatus
      });
      if (res && res.client) {
        setCurrentClient(res.client);
      }
    } catch (err) {
      console.error('Failed to update client status in cloud:', err);
    }
  };

  // Add Communication Activity
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    setIsAddingNote(true);
    addClientActivity(currentClient.id, {
      type: newNoteType,
      content: newNoteContent.trim(),
      author: 'Rohit Verma'
    });

    const newAct = {
      id: `act_${Date.now()}`,
      type: newNoteType as any,
      content: newNoteContent.trim(),
      timestamp: new Date().toISOString(),
      author: 'Rohit Verma'
    };

    setCurrentClient({
      ...currentClient,
      activities: [newAct, ...(currentClient.activities || [])]
    });

    setNewNoteContent('');
    setIsAddingNote(false);
  };

  // Delete Client
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete client profile "${currentClient.name}"?`)) {
      const res = await deleteClientWithCloud(currentClient.id);
      if (!res.success && res.errorCode === 'permission-denied') {
        alert('Permission Denied: You do not have permission to delete client records.');
        return;
      }
      onClose();
    }
  };

  const isPhoneOnly = !currentClient.email || currentClient.email.includes('@client.rohitwork.in');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
        role="dialog"
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
                {currentClient.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <ClientStatusBadge status={currentClient.status} size="md" />
                  {isPhoneOnly && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                      Phone-Only Client
                    </span>
                  )}
                  {currentClient.leadSourceId && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Converted Lead</span>
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {currentClient.name}
                </h2>
                {currentClient.company && (
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <Building className="w-3.5 h-3.5" />
                    <span>{currentClient.company}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {onEditClient && (
                <button
                  onClick={() => onEditClient(currentClient)}
                  title="Edit Client"
                  className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleDelete}
                title="Delete Client"
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
            {/* Direct WhatsApp */}
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

            {/* RohitWork Business Link */}
            <a
              href="https://wa.me/message/H4JLHPJ3NNGOK1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Agency WA</span>
            </a>

            {/* Direct Call */}
            {currentClient.phone ? (
              <a
                href={`tel:${currentClient.phone}`}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>
            ) : null}

            {/* Email */}
            {!isPhoneOnly && currentClient.email ? (
              <a
                href={`mailto:${currentClient.email}`}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </a>
            ) : null}
          </div>

          {/* Financial KPI Summary Cards */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Projects
              </span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {related.computed.totalProjects}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Total Billed
              </span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                ₹{related.computed.totalBilled.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Total Paid
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                ₹{related.computed.totalPaid.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Balance Due
              </span>
              <span
                className={`font-bold text-sm ${
                  related.computed.outstandingBalance > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-500'
                }`}
              >
                ₹{related.computed.outstandingBalance.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-4 flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 -mb-6 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'projects'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Projects ({related.projects.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('financials')}
              className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'financials'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Invoices & Billing</span>
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'tasks'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Tasks ({related.tasks.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'timeline'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Timeline ({currentClient.activities?.length || 0})</span>
            </button>
          </div>
        </div>

        {/* Drawer Body Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Status Switcher */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Account Status
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Switch client lifecycle status
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {(['active', 'inactive', 'archived'] as CrmClientStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(st)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-semibold capitalize transition ${
                        currentClient.status === st
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Converted Lead History Card */}
              {currentClient.originalLeadData && (
                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-200">
                      <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Original Converted Lead Details</span>
                    </div>
                    {currentClient.originalLeadData.submittedAt && (
                      <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-medium">
                        Submitted:{' '}
                        {new Date(currentClient.originalLeadData.submittedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-indigo-600/70 dark:text-indigo-400/70 block text-[10px]">
                        Initial Service
                      </span>
                      <span className="font-semibold text-indigo-950 dark:text-indigo-100">
                        {currentClient.originalLeadData.service || 'Creative Project'}
                      </span>
                    </div>
                    <div>
                      <span className="text-indigo-600/70 dark:text-indigo-400/70 block text-[10px]">
                        Initial Budget
                      </span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                        {currentClient.originalLeadData.budget || 'Not Specified'}
                      </span>
                    </div>
                  </div>

                  {currentClient.originalLeadData.message && (
                    <div className="mt-2 text-xs text-indigo-900/90 dark:text-indigo-200/90 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50 leading-relaxed">
                      <strong>Client Requirement:</strong>{' '}
                      {currentClient.originalLeadData.message}
                    </div>
                  )}
                </div>
              )}

              {/* Contact Information Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Profile Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Phone Number</span>
                    <span className="font-semibold text-slate-900 dark:text-white font-mono">
                      {currentClient.phone || 'None provided'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Email</span>
                    <span className="font-semibold text-slate-900 dark:text-white break-all">
                      {isPhoneOnly ? 'None (Phone-Only Client)' : currentClient.email}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Location / City</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {currentClient.address || 'Not specified'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Client Since</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {new Date(currentClient.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {currentClient.tags && currentClient.tags.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Client Tags
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {currentClient.tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-100 dark:border-indigo-800/50"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Internal Notes */}
              {currentClient.notes && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Internal Notes & Preferences
                  </h3>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {currentClient.notes}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Client Projects
                </h3>
                {onNavigateToModule && (
                  <button
                    onClick={() => onNavigateToModule('projects')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    Open Projects Module &rarr;
                  </button>
                )}
              </div>

              {related.projects.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <FolderKanban className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    No active projects linked to this client yet.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Projects will appear here when assigned to {currentClient.name}.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {related.projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-xs flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          {proj.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-slate-500">
                          <span>{proj.serviceCategory}</span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            ₹{proj.budget.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50">
                        {proj.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FINANCIALS & INVOICES */}
          {activeTab === 'financials' && (
            <div className="space-y-6">
              {/* Quotations & Proposals Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Proposals & Quotations
                  </h3>
                  {onNavigateToModule && (
                    <button
                      onClick={() => onNavigateToModule('quotations')}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      Open Quotations &rarr;
                    </button>
                  )}
                </div>

                {!related.quotations || related.quotations.length === 0 ? (
                  <div className="p-5 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    No proposals or quotations issued for this client yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {related.quotations.map((q) => (
                      <div
                        key={q.id}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {q.quotationNumber}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {q.status}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px] mt-0.5">
                            {q.projectTitle || 'Creative Production Scope'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 dark:text-white font-mono">
                            ₹{q.totalAmount.toLocaleString('en-IN')}
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            Valid till {new Date(q.validUntil).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Invoices Section */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Invoices & Payment Records
                  </h3>
                  {onNavigateToModule && (
                    <button
                      onClick={() => onNavigateToModule('invoices')}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      Manage Invoices &rarr;
                    </button>
                  )}
                </div>

                {related.invoices.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <Receipt className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      No invoices generated for this client yet.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Formal GST / non-GST invoices converted from accepted quotations will track here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {related.invoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {inv.invoiceNumber}
                          </span>
                          <p className="text-slate-400 text-[11px] mt-0.5">
                            Due: {new Date(inv.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 dark:text-white">
                            ₹{inv.total.toLocaleString('en-IN')}
                          </span>
                          <span className="block text-[10px] text-amber-600 font-semibold uppercase">
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Linked Tasks & Deadlines
              </h3>
              {related.tasks.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <CheckSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    No tasks currently active for this client.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {related.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {task.title}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Assigned: {task.assignedFreelancerName || 'Rohit Verma'}
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-indigo-600 capitalize">
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TIMELINE & INTERACTION HISTORY */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
                <span>Client Communication & Activity Log</span>
                <span className="text-[10px] text-slate-400">
                  {(currentClient.activities || []).length} recorded
                </span>
              </h3>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <div className="flex items-center gap-1.5">
                  {(['note', 'whatsapp', 'call', 'meeting'] as const).map((t) => (
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
                    placeholder={`Log a ${newNoteType} note...`}
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
                {currentClient.activities && currentClient.activities.length > 0 ? (
                  currentClient.activities.map((act) => (
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
                    No activity history recorded yet. Add your first note above.
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
