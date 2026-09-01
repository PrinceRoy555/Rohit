import React, { useState, useEffect } from 'react';
import { InquiryRecord } from '../../../types/cms';
import {
  fetchInquiries,
  updateInquiry,
  deleteInquiry
} from '../../../services/cmsApi';
import {
  Inbox,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Clock,
  Trash2,
  Download,
  Filter,
  ExternalLink,
  MessageSquare,
  Sparkles
} from 'lucide-react';

export const InquiriesInboxTab: React.FC = () => {
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'contacted' | 'closed'>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryRecord | null>(null);

  const loadData = async () => {
    setLoading(true);
    const res = await fetchInquiries();
    if (res.success && res.inquiries) {
      setInquiries(res.inquiries);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id: string, status: InquiryRecord['status']) => {
    const res = await updateInquiry(id, { status });
    if (res.success) {
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status } : inq))
      );
      if (selectedInquiry?.id === id) {
        setSelectedInquiry((prev) => (prev ? { ...prev, status } : null));
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this inquiry permanently?')) return;
    const res = await deleteInquiry(id);
    if (res.success) {
      setInquiries((prev) => prev.filter((inq) => inq.id !== id));
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(null);
      }
    }
  };

  const handleExportCsv = () => {
    if (!inquiries.length) return;
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Service', 'Status', 'Source', 'Created At', 'Message'];
    const rows = inquiries.map((inq) => [
      inq.id,
      `"${inq.name.replace(/"/g, '""')}"`,
      `"${inq.email.replace(/"/g, '""')}"`,
      `"${(inq.phone || '').replace(/"/g, '""')}"`,
      `"${inq.service.replace(/"/g, '""')}"`,
      inq.status,
      inq.source || 'contact_form',
      inq.createdAt,
      `"${inq.message.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads-inquiries-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filtered = filterStatus === 'all'
    ? inquiries
    : inquiries.filter((inq) => inq.status === filterStatus);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Inbox className="w-6 h-6 text-rose-500" />
            <span>Lead & Inquiry Inbox</span>
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Real-time submissions captured from your contact form and AI chatbot assistant.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={!inquiries.length}
          className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/15 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'new', 'contacted', 'closed'] as const).map((status) => {
          const count = status === 'all' ? inquiries.length : inquiries.filter((i) => i.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                filterStatus === status
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-white/10'
              }`}
            >
              <span className="capitalize">{status}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-black/40 text-[10px]">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Inquiries List */}
      {loading ? (
        <div className="p-12 text-center text-neutral-400 text-sm">Loading inquiries...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-neutral-900/40 border border-white/10 rounded-2xl">
          <Inbox className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white">No inquiries found</h4>
          <p className="text-xs text-neutral-400 mt-1">
            New contact submissions will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inq) => {
            const isNew = inq.status === 'new';
            return (
              <div
                key={inq.id}
                onClick={() => setSelectedInquiry(inq)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                  isNew
                    ? 'bg-neutral-900/90 border-rose-500/40 hover:border-rose-500'
                    : 'bg-neutral-900/60 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h4 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                      {inq.name}
                    </h4>
                    {isNew && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                        NEW
                      </span>
                    )}
                    {inq.source === 'ai_chat' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>AI Lead</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{inq.email}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                    </span>
                    <span className="text-neutral-300 font-medium">{inq.service}</span>
                  </div>

                  <p className="text-xs text-neutral-300 line-clamp-1 mt-1 max-w-2xl">
                    {inq.message}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={inq.status}
                    onChange={(e) => handleStatusChange(inq.id, e.target.value as any)}
                    className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                  >
                    <option value="new">Mark New</option>
                    <option value="contacted">Mark Contacted</option>
                    <option value="closed">Mark Closed</option>
                  </select>

                  <button
                    onClick={() => handleDelete(inq.id)}
                    className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedInquiry.name}</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Submitted on {new Date(selectedInquiry.createdAt).toLocaleString()}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold capitalize bg-white/10 text-white">
                {selectedInquiry.status}
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <span className="text-neutral-400">Email: </span>
                <a href={`mailto:${selectedInquiry.email}`} className="text-rose-400 hover:underline font-mono">
                  {selectedInquiry.email}
                </a>
              </div>

              {selectedInquiry.phone && (
                <div>
                  <span className="text-neutral-400">Phone: </span>
                  <a href={`tel:${selectedInquiry.phone}`} className="text-white hover:underline font-mono">
                    {selectedInquiry.phone}
                  </a>
                </div>
              )}

              <div>
                <span className="text-neutral-400">Requested Service: </span>
                <span className="text-white font-semibold">{selectedInquiry.service}</span>
              </div>

              <div>
                <span className="text-neutral-400 block mb-1">Message / Project Scope:</span>
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-neutral-200 text-xs leading-relaxed whitespace-pre-wrap">
                  {selectedInquiry.message}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
              <a
                href={`mailto:${selectedInquiry.email}?subject=Regarding your inquiry for ${selectedInquiry.service}`}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Reply via Email</span>
              </a>

              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
