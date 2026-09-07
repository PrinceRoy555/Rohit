import React, { useState, useEffect } from 'react';
import { ConfigRevision } from '../../../types/cms';
import { fetchRevisions, restoreRevision } from '../../../services/cmsApi';
import { useSiteConfig } from '../../../context/SiteConfigContext';
import { PageHeader } from '../layout/PageHeader';
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Revision Snapshots & Rollback Engine"
        description="Every time you publish or activate a template, a permanent snapshot is created. Rollback anytime with one click."
      />

      {actionSuccess && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm flex items-center gap-2.5 sm:gap-3">
          <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {loading ? (
        <div className="p-8 sm:p-12 text-center text-text-muted text-xs sm:text-sm">Loading revision history...</div>
      ) : revisions.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-bg-card border border-border-color rounded-xl sm:rounded-2xl shadow-xs">
          <History className="w-8 sm:w-10 h-8 sm:h-10 text-text-muted mx-auto mb-2.5" />
          <h4 className="text-sm sm:text-base font-bold text-text-primary">No revisions recorded yet</h4>
          <p className="text-xs text-text-muted mt-1">
            Snapshots are automatically generated when publishing updates.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 sm:space-y-3">
          {revisions.map((rev) => (
            <div
              key={rev.id}
              className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-bg-card border border-border-color hover:border-rose-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-xs"
            >
              <div className="space-y-1 sm:space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    v{rev.version}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-text-primary truncate">{rev.summary}</h4>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-text-muted" />
                    <span>{new Date(rev.timestamp).toLocaleString()}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-text-muted" />
                    <span>{rev.author}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-color">
                <button
                  onClick={() => setInspectRevision(rev)}
                  className="min-h-[38px] sm:min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-bg-secondary hover:bg-bg-card-hover text-text-secondary border border-border-color flex items-center justify-center gap-1.5 transition-colors active:scale-98 flex-1 sm:flex-initial"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>

                <button
                  onClick={() => handleRollback(rev)}
                  disabled={restoringId === rev.id}
                  className="min-h-[38px] sm:min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 flex-1 sm:flex-initial"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-bg-card border border-border-color rounded-xl sm:rounded-2xl max-w-2xl w-full p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-xl max-h-[88vh] flex flex-col text-text-primary">
            <div className="flex items-center justify-between border-b border-border-color pb-2.5 sm:pb-3">
              <h3 className="text-sm sm:text-base font-bold text-text-primary flex items-center gap-2">
                <FileCode className="w-4 h-4 text-rose-500" />
                <span>Revision v{inspectRevision.version} Data Dump</span>
              </h3>
              <button
                onClick={() => setInspectRevision(null)}
                className="text-xs text-text-muted hover:text-text-primary min-h-[36px] px-2.5 py-1 rounded-lg bg-bg-secondary border border-border-color"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 bg-bg-secondary rounded-xl border border-border-color">
              <pre className="text-[10px] sm:text-[11px] font-mono text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">
                {JSON.stringify(inspectRevision.config, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
