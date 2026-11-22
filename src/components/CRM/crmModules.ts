import { CrmModuleMeta, CrmModuleId } from '../../types/crm';

export const CRM_MODULES: CrmModuleMeta[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    category: 'Core',
    description: 'Executive overview, live Firestore inquiry stats, revenue metrics & quick actions.',
    phase: 1,
    iconName: 'LayoutDashboard',
    badge: 'Live'
  },
  {
    id: 'leads',
    label: 'Lead Management',
    category: 'Relationships',
    description: 'Lead pipeline, follow-up scheduler, inquiry details, score & status triage.',
    phase: 2,
    iconName: 'Users',
    badge: 'Live'
  },
  {
    id: 'clients',
    label: 'Client Management',
    category: 'Relationships',
    description: 'Client profiles, billing history, active projects & direct communication.',
    phase: 2,
    iconName: 'UserCheck',
    badge: 'Live'
  },
  {
    id: 'projects',
    label: 'Project Management',
    category: 'Execution',
    description: 'Creative project milestones, client deliverables, status boards & progress.',
    phase: 2,
    iconName: 'FolderKanban',
    badge: 'Live'
  },
  {
    id: 'freelancers',
    label: 'Freelancer Hub',
    category: 'Relationships',
    description: 'Admin-only freelancer directory, task assignments, rates, revision tracking & payouts.',
    phase: 2,
    iconName: 'Briefcase',
    badge: 'Live',
    adminOnly: true
  },
  {
    id: 'tasks',
    label: 'Task Management',
    category: 'Execution',
    description: 'Project-linked task boards, assigned deadlines, priorities & completion statuses.',
    phase: 2,
    iconName: 'CheckSquare',
    badge: 'Live'
  },
  {
    id: 'quotations',
    label: 'Quotations',
    category: 'Financials',
    description: 'Create, send, and track formal creative design & editing proposals.',
    phase: 3,
    iconName: 'FileSpreadsheet',
    badge: 'Live'
  },
  {
    id: 'invoices',
    label: 'Invoices',
    category: 'Financials',
    description: 'Generate branded tax invoices, manage partial payments & track due balances.',
    phase: 3,
    iconName: 'Receipt',
    badge: 'Live'
  },
  {
    id: 'payments',
    label: 'Payments',
    category: 'Financials',
    description: 'Record incoming UPI, bank transfers & card payments linked to client invoices.',
    phase: 3,
    iconName: 'CreditCard',
    badge: 'Live'
  },
  {
    id: 'expenses',
    label: 'Expenses',
    category: 'Financials',
    description: 'Track agency costs, software licenses, freelancer payouts & operational overhead.',
    phase: 3,
    iconName: 'TrendingDown',
    badge: 'Live'
  },
  {
    id: 'ai-assistant',
    label: 'AI WhatsApp Assistant',
    category: 'Intelligence & Tools',
    description: 'Generate rapid, context-aware WhatsApp pitch & follow-up messages for clients.',
    phase: 4,
    iconName: 'Sparkles',
    badge: 'Live'
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    category: 'Intelligence & Tools',
    description: 'Financial growth reports, lead conversion velocity, project turnaround & ROI.',
    phase: 4,
    iconName: 'BarChart3',
    badge: 'Live'
  },
  {
    id: 'reminders',
    label: 'Reminders',
    category: 'Intelligence & Tools',
    description: 'Automated follow-up alerts, invoice due dates, and project delivery notifications.',
    phase: 4,
    iconName: 'Bell',
    badge: 'Live'
  },
  {
    id: 'settings',
    label: 'Settings',
    category: 'Intelligence & Tools',
    description: 'Admin profile, currency preferences, WhatsApp integration & Firestore diagnostics.',
    phase: 4,
    iconName: 'Settings',
    badge: 'Live'
  }
];

export const CRM_CATEGORIES: ('Core' | 'Relationships' | 'Execution' | 'Financials' | 'Intelligence & Tools')[] = [
  'Core',
  'Relationships',
  'Execution',
  'Financials',
  'Intelligence & Tools'
];
