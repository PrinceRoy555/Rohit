import React, { useState, useEffect } from 'react';
import { ConfigRevision } from '../../../types/cms';
import { fetchRevisions, restoreRevision } from '../../../services/cmsApi';
import { useSiteConfig } from '../../../context/SiteConfigContext';
import {
  History,
  RotateCcw,
  CheckCircle2,
  Clock,
  User,
  Eye,
  AlertCircle,
  FileCode
} from 'lucide-react';

export const RevisionsTab: React.FC = () => {
  const { refreshConfig } = useSiteConfig();
  const [revisions, setRevisions] = useState<ConfigRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [inspectRevision, setInspectRevision] = useState<ConfigRevision | null>(null);

  const loadRevisions = async () => {
    setLoading(true);
    const res = await fetchRevisions();
    if (res.success && res.revisions) {
      setRevisions(res.revisions);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRevisions();
  }, []);

  const handleRollback = async (rev: ConfigRevision) => {
    if (!window.confirm(`Roll back the website to Version ${rev.version} (${new Date(rev.timestamp).toLocaleString()})?`)) {
      return;
    }
    setRestoringId(rev.id);
    const res = await restoreRevision(rev.id);
    if (res.success) {
      setActionSuccess(`Successfully rolled back to Version ${rev.version}!`);
      await refreshConfig();
      await loadRevisions();
      setTimeout(() => setActionSuccess(null), 4000);
    }
    setRestoringId(null);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
          <History className="w-6 h-6 text-indigo-400" />
          <span>Revision Snapshots & Rollback Engine</span>
        </h2>
        <p className="text-sm text-neutral-400 mt-1">
          Every time you publish or activate a template, a permanent snapshot is created. Rollback anytime with one click.
        </p>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-neutral-400 text-sm">Loading revision history...</div>
      ) : revisions.length === 0 ? (
        <div className="p-12 text-center bg-neutral-900/40 border border-white/10 rounded-2xl">
          <History className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white">No revisions recorded yet</h4>
          <p className="text-xs text-neutral-400 mt-1">
            Snapshots are automatically generated when publishing updates.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {revisions.map((rev, idx) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-neutral-900/80 border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    v{rev.version}
                  </span>
                  <h4 className="text-sm font-bold text-white">{rev.summary}</h4>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{new Date(rev.timestamp).toLocaleString()}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{rev.author}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => setInspectRevision(rev)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>

                <button
                  onClick={() => handleRollback(rev)}
                  disabled={restoringId === rev.id}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{restoringId === rev.id ? 'Restoring...' : 'Rollback to v' + rev.version}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* INSPECT MODAL */}
      {inspectRevision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/15 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-400" />
                <span>Revision v{inspectRevision.version} Data Dump</span>
              </h3>
              <button
                onClick={() => setInspectRevision(null)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 bg-black/60 rounded-xl border border-white/5">
              <pre className="text-[11px] font-mono text-emerald-400 whitespace-pre-wrap">
                {JSON.stringify(inspectRevision.config, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
