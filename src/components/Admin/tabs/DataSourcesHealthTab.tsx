import React, { useState, useEffect } from 'react';
import { FirestoreHealthRecord } from '../../../types/cms';
import { fetchDataSourcesHealth } from '../../../services/cmsApi';
import { isFirebaseConfigured, getFirebaseConfigDetails } from '../../../lib/firebase';
import { PageHeader } from '../layout/PageHeader';
import {
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldCheck,
  Layers,
  Server,
  Activity,
  ExternalLink
} from 'lucide-react';

export const DataSourcesHealthTab: React.FC = () => {
  const [healthData, setHealthData] = useState<FirestoreHealthRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastCheckTime, setLastCheckTime] = useState<string>('');

  const configDetails = getFirebaseConfigDetails();
  const configured = isFirebaseConfigured();

  const runHealthCheck = async () => {
    setLoading(true);
    const res = await fetchDataSourcesHealth();
    if (res.success && res.health) {
      setHealthData(res.health);
    }
    setLastCheckTime(new Date().toLocaleTimeString());
    setLoading(false);
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const totalRecords = healthData.reduce((sum, item) => sum + item.count, 0);
  const healthyCount = healthData.filter((i) => i.status === 'healthy' || i.status === 'empty').length;
  const errorCount = healthData.filter((i) => i.status === 'error').length;

  return (
    <div id="firestore-datasources-panel" className="space-y-6">
      <PageHeader
        title="Firestore Data Sources & Collections"
        description="Live connection diagnostics, document counts, and latency monitoring across all production Firestore database collections."
        badge={
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
            errorCount === 0
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
          }`}>
            {errorCount === 0 ? 'All Collections Operational' : `${errorCount} Degraded`}
          </span>
        }
        actions={
          <button
            id="run-datasources-health-btn"
            type="button"
            onClick={runHealthCheck}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-accent-primary text-white hover:bg-accent-hover transition-colors shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Test All Connections</span>
          </button>
        }
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border-color bg-bg-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-text-muted font-medium">Firestore Engine</div>
            <div className="text-sm font-bold text-text-primary">
              {configured ? 'Connected & Active' : 'Fallback / Local'}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border-color bg-bg-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-text-muted font-medium">Monitored Collections</div>
            <div className="text-xl font-bold text-text-primary tabular-nums">
              {healthData.length} Collections
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border-color bg-bg-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-text-muted font-medium">Total Stored Documents</div>
            <div className="text-xl font-bold text-text-primary tabular-nums">
              {totalRecords} Records
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border-color bg-bg-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-text-muted font-medium">Security & RBAC</div>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              Rules Active
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Metadata Info Box */}
      <div className="p-4 rounded-xl border border-border-color bg-bg-card text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-text-primary flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent-primary" />
            Active Project Credentials
          </span>
          {lastCheckTime && (
            <span className="text-text-muted text-[11px]">
              Last pinged at: <span className="font-mono text-text-primary">{lastCheckTime}</span>
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-text-muted pt-1">
          <div>
            <span className="block text-[11px] font-medium text-text-muted">Firebase Project ID</span>
            <span className="font-mono text-text-primary text-xs font-semibold">{configDetails.projectId || 'Default Project'}</span>
          </div>
          <div>
            <span className="block text-[11px] font-medium text-text-muted">Auth Domain</span>
            <span className="font-mono text-text-primary text-xs">{configDetails.rawConfig?.authDomain || 'firebaseapp.com'}</span>
          </div>
          <div>
            <span className="block text-[11px] font-medium text-text-muted">Status</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Live Production Firestore</span>
          </div>
        </div>
      </div>

      {/* Collections Health Table */}
      <div className="rounded-xl border border-border-color bg-bg-card overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border-color flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent-primary" />
            Collection Health & Telemetry
          </h3>
          <span className="text-xs text-text-muted">
            {healthyCount} of {healthData.length} collections responding
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-text-primary">
            <thead className="bg-bg-secondary/60 text-text-muted uppercase text-[11px] font-semibold border-b border-border-color">
              <tr>
                <th className="py-3 px-4">Collection Name</th>
                <th className="py-3 px-4">Purpose / Subsystem</th>
                <th className="py-3 px-4">Document Count</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Sample ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color/60">
              {loading && healthData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
                      <span>Diagnosing Firestore collections...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                healthData.map((rec) => {
                  let purpose = 'General Data';
                  if (rec.collection === 'leads') purpose = 'Unified CRM & Inquiries';
                  if (rec.collection === 'contactEnquiries') purpose = 'Website Contact Form';
                  if (rec.collection === 'chatbotLeads') purpose = 'AI Chatbot Captures';
                  if (rec.collection === 'quoteRequests') purpose = 'Pricing & Quotes';
                  if (rec.collection === 'newsletterSubscribers') purpose = 'Email Subscribers';
                  if (rec.collection === 'siteConfig') purpose = 'Live & Draft CMS Config';
                  if (rec.collection === 'siteRevisions') purpose = 'Publish History & Rollbacks';
                  if (rec.collection === 'insights') purpose = 'Blog & Insights Articles';

                  return (
                    <tr key={rec.collection} className="hover:bg-bg-secondary/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-accent-primary">
                        /{rec.collection}
                      </td>
                      <td className="py-3 px-4 text-text-primary font-medium">
                        {purpose}
                      </td>
                      <td className="py-3 px-4 tabular-nums font-bold text-text-primary">
                        {rec.count} docs
                      </td>
                      <td className="py-3 px-4 tabular-nums text-text-muted">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-text-muted" />
                          <span>{rec.latencyMs !== undefined ? `${rec.latencyMs}ms` : '—'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {rec.status === 'healthy' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Active ({rec.count})
                          </span>
                        ) : rec.status === 'empty' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Empty Collection
                          </span>
                        ) : rec.status === 'warning' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <AlertTriangle className="w-3 h-3" />
                            Notice
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <XCircle className="w-3 h-3" />
                            Error: {rec.error || 'Failed'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[11px] text-text-muted">
                        {rec.sampleId ? (
                          <span className="px-1.5 py-0.5 rounded bg-bg-secondary border border-border-color">
                            {rec.sampleId.slice(0, 12)}...
                          </span>
                        ) : (
                          <span className="italic text-text-muted/60">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
