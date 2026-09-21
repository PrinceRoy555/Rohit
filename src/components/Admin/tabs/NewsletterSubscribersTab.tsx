import React, { useState, useEffect, useMemo } from 'react';
import { NewsletterSubscriberRecord } from '../../../types/cms';
import {
  fetchNewsletterSubscribers,
  deleteNewsletterSubscriber,
  exportNewsletterSubscribersToCsv
} from '../../../services/cmsApi';
import { PageHeader } from '../layout/PageHeader';
import {
  Mail,
  Search,
  Download,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Users,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export const NewsletterSubscribersTab: React.FC = () => {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'unsubscribed'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const res = await fetchNewsletterSubscribers();
    if (res.success && res.subscribers) {
      setSubscribers(res.subscribers);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    return subscribers.filter((sub) => {
      if (statusFilter !== 'all' && sub.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return sub.email.toLowerCase().includes(q) || (sub.source && sub.source.toLowerCase().includes(q));
      }
      return true;
    });
  }, [subscribers, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: subscribers.length,
      active: subscribers.filter((s) => s.status === 'active').length,
      unsubscribed: subscribers.filter((s) => s.status === 'unsubscribed').length
    };
  }, [subscribers]);

  const handleDelete = async (id: string, email: string) => {
    if (!window.confirm(`Permanently remove ${email} from the newsletter database?`)) return;
    setDeletingId(id);
    const res = await deleteNewsletterSubscriber(id);
    if (res.success) {
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    }
    setDeletingId(null);
  };

  return (
    <div id="newsletter-subscribers-panel" className="space-y-6">
      <PageHeader
        title="Newsletter Subscribers"
        description="Manage and export email subscribers captured from website footers, insights articles, and lead magnets."
        badge={
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {stats.active} Active
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              id="refresh-newsletter-btn"
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-border-color bg-bg-card hover:bg-bg-secondary text-text-primary transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              id="export-newsletter-csv-btn"
              type="button"
              onClick={() => exportNewsletterSubscribersToCsv(filtered)}
              disabled={subscribers.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-accent-primary text-white hover:bg-accent-hover transition-colors shadow-xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border-color bg-bg-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-text-muted font-medium">Total Subscribers</div>
            <div className="text-xl font-bold text-text-primary tabular-nums">{stats.total}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border-color bg-bg-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-text-muted font-medium">Active Subscribers</div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{stats.active}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border-color bg-bg-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-text-muted font-medium">Unsubscribed</div>
            <div className="text-xl font-bold text-text-primary tabular-nums">{stats.unsubscribed}</div>
          </div>
        </div>
      </div>

      {/* Toolbar: Search and Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border border-border-color bg-bg-card">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="newsletter-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email or source..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border-color bg-bg-secondary text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-accent-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto select-none">
          {(['all', 'active', 'unsubscribed'] as const).map((st) => (
            <button
              key={st}
              id={`filter-subscriber-${st}`}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-accent-primary text-white shadow-xs'
                  : 'bg-bg-secondary text-text-muted hover:text-text-primary'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="rounded-xl border border-border-color bg-bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-text-primary">
            <thead className="bg-bg-secondary/60 text-text-muted uppercase text-[11px] font-semibold border-b border-border-color">
              <tr>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Subscribed At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
                      <span>Loading newsletter subscribers...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Mail className="w-8 h-8 text-text-muted/40" />
                      <span className="font-semibold text-text-primary text-sm">No subscribers found</span>
                      <span className="text-xs text-text-muted">
                        Subscribers who opt-in via website footers and forms will automatically populate here.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-bg-secondary/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-text-primary">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-accent-primary shrink-0" />
                        <span>{sub.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                          sub.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${sub.status === 'active' ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                        <span className="capitalize">{sub.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-text-muted">
                      <span className="px-2 py-0.5 rounded bg-bg-secondary text-[11px] font-mono border border-border-color/60">
                        {sub.source || 'website-newsletter'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-text-muted tabular-nums">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-text-muted" />
                        <span>
                          {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        id={`delete-subscriber-${sub.id}`}
                        type="button"
                        onClick={() => handleDelete(sub.id, sub.email)}
                        disabled={deletingId === sub.id}
                        className="p-1.5 text-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete Subscriber"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
