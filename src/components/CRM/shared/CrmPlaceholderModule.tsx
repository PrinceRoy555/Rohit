import React from 'react';
import { CrmModuleMeta } from '../../../types/crm';
import { ArrowLeft, Clock, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface CrmPlaceholderModuleProps {
  module: CrmModuleMeta;
  onNavigateToDashboard: () => void;
}

export const CrmPlaceholderModule: React.FC<CrmPlaceholderModuleProps> = ({
  module,
  onNavigateToDashboard
}) => {
  const IconComponent = (LucideIcons as any)[module.iconName] || Sparkles;

  const plannedFeaturesByModule: Record<string, string[]> = {
    leads: [
      'Visual Lead Kanban Pipeline (New, Contacted, Qualified, Won, Lost)',
      'Lead Scoring & Follow-up Scheduler with automated alarms',
      'One-click client WhatsApp outreach with pre-formatted pitches',
      'Full inquiry message inspection and internal admin notes'
    ],
    clients: [
      'Comprehensive client directory with lifetime value tracking',
      'Direct contact card with WhatsApp, Phone, and Email shortcuts',
      'Linked active projects, billed invoices, and payment histories',
      'Custom client tags and business intelligence profiles'
    ],
    projects: [
      'End-to-end creative project pipeline & delivery milestone tracker',
      'Service scope, deadline countdown, and budget balance meters',
      'Freelancer assignments and client review checkpoints',
      'Deliverable checklist with asset links'
    ],
    freelancers: [
      'Admin-Only freelancer directory (No external accounts or logins)',
      'Contact profiles, specialized skills matrix & agreed rates',
      'Project & task assignment with delivery deadline enforcement',
      'Revision rounds tracking and pending payout balances'
    ],
    tasks: [
      'Interactive Kanban task board with Drag-and-Drop capability',
      'Task priority matrix (Low, Medium, High, Urgent)',
      'Freelancer association and direct project linkage',
      'Revision feedback rounds and sign-off status'
    ],
    quotations: [
      'Visual estimate builder with itemized pricing and deliverables',
      'Automated discount and tax calculation engine',
      'Direct proposal delivery via WhatsApp and printable PDF',
      'Quotation-to-Invoice one-click conversion'
    ],
    invoices: [
      'Professional branded invoice generation with unique invoice numbers',
      'Split & milestone payments tracking with balance due monitoring',
      'Overdue payment reminders and payment receipt generation',
      'Export to PDF and direct client WhatsApp delivery'
    ],
    payments: [
      'Real-time transaction ledger (UPI, Bank Transfer, Stripe, Cash)',
      'Automated reconciliation against client invoices',
      'Receipt generation and payment status tracking',
      'Monthly collected revenue analytics'
    ],
    expenses: [
      'Operating cost ledger (Freelancer payouts, software, marketing, office)',
      'Project-level cost attribution and profit margin analysis',
      'Tax deductible categorization and receipt uploads',
      'Net agency profit & loss computation'
    ],
    'ai-assistant': [
      'Context-aware client message generator powered by Gemini AI',
      'Pre-built response playbooks: Quick Pitches, Scope Clarifications, Payment Follow-ups',
      'Tone adjustments: Professional, Friendly, Persuasive, or Urgent',
      '1-Click launch directly into client WhatsApp Web or App'
    ],
    reports: [
      'Executive financial charts (MRR, quarterly revenue, expense breakdowns)',
      'Lead conversion velocity & acquisition channel analytics',
      'Project completion turnaround times and freelancer performance rankings',
      'Exportable CSV and PDF summary reports'
    ],
    reminders: [
      'Automated time-sensitive alerts for overdue client invoices',
      'Impending project delivery milestone warnings',
      'Scheduled client follow-up calls and WhatsApp check-ins',
      'Browser push and email notification integrations'
    ],
    settings: [
      'Admin profile and contact security management',
      'Default currency (₹ INR / $ USD) and tax configuration',
      'WhatsApp Business link & prefilled message templates',
      'Firestore database health diagnostics and backup exports'
    ]
  };

  const features = plannedFeaturesByModule[module.id] || [
    'Modular data management architecture',
    'Real-time Firestore synchronization',
    'Admin-only permission isolation',
    'Full responsive desktop & mobile support'
  ];

  const phaseLabel =
    module.phase === 2
      ? 'Phase 2: Core Relationships & Execution'
      : module.phase === 3
      ? 'Phase 3: Financial & Invoice Suite'
      : 'Phase 4: Intelligence & Analytics';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0 shadow-lg">
              <IconComponent className="w-7 h-7 stroke-[1.8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/20 px-3 py-0.5 rounded-full border border-indigo-500/30">
                  {phaseLabel}
                </span>
                {module.adminOnly && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    Admin Only
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                {module.label}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                {module.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateToDashboard}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white transition-all cursor-pointer self-start sm:self-auto shrink-0 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Main Roadmap Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2.5 mb-4 text-slate-900 dark:text-white font-bold text-base sm:text-lg">
          <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Planned Capabilities for {module.label}</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
          Phase 1 establishes the verified Foundation, Sidebar Navigation, and live Dashboard.
          This module is architectural-ready and scheduled for implementation in <strong>{phaseLabel}</strong>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 leading-snug">
                {feat}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
