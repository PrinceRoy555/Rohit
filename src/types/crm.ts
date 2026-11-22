import { InquiryRecord } from './cms';

export type CrmModuleId =
  | 'dashboard'
  | 'leads'
  | 'clients'
  | 'projects'
  | 'freelancers'
  | 'tasks'
  | 'quotations'
  | 'invoices'
  | 'payments'
  | 'expenses'
  | 'ai-assistant'
  | 'reports'
  | 'reminders'
  | 'settings';

export interface CrmModuleMeta {
  id: CrmModuleId;
  label: string;
  category: 'Core' | 'Relationships' | 'Execution' | 'Financials' | 'Intelligence & Tools';
  description: string;
  phase: 1 | 2 | 3 | 4;
  iconName: string;
  badge?: string;
  adminOnly?: boolean;
}

export type LeadPipelineStage =
  | 'new'
  | 'contacted'
  | 'follow_up'
  | 'qualified'
  | 'proposal_sent'
  | 'negotiation'
  | 'won'
  | 'lost';

export interface CrmLeadActivity {
  id: string;
  type: 'note' | 'status_change' | 'followup_set' | 'call' | 'whatsapp' | 'email' | 'system' | 'meeting';
  content?: string;
  description?: string;
  timestamp: string;
  author?: string;
}

export interface CrmLead extends Omit<InquiryRecord, 'priority'> {
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  pipelineStage?: LeadPipelineStage;
  estimatedValue?: number;
  contactCount?: number;
  assignedTo?: string;
  company?: string;
  budget?: string;
  timeline?: string;
  submittedAt?: string;
  activities?: CrmLeadActivity[];
  convertedClientId?: string;
  isDemo?: boolean;
  updatedAt?: string;
}

export type CrmClientStatus = 'active' | 'inactive' | 'archived' | 'lead';

export interface CrmClient {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  status: CrmClientStatus;
  totalProjects: number;
  totalBilled: number;
  totalPaid: number;
  outstandingBalance: number;
  currency: string;
  tags?: string[];
  notes?: string;
  address?: string;
  leadSourceId?: string;
  originalLeadData?: {
    service?: string;
    budget?: string;
    source?: string;
    message?: string;
    submittedAt?: string;
  };
  activities?: CrmLeadActivity[];
  createdAt: string;
  updatedAt?: string;
  avatarUrl?: string;
  isDemo?: boolean;
}

export type CrmProjectStatus = 'planning' | 'in_progress' | 'in_review' | 'completed' | 'on_hold' | 'cancelled';
export type CrmProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface CrmProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  completedAt?: string;
  order: number;
}

export interface CrmProjectDeliverable {
  id: string;
  projectId: string;
  title: string;
  url: string; // Google Drive, Frame.io, Figma, WeTransfer
  revisionRound: number;
  status: 'draft' | 'pending_review' | 'approved' | 'revision_requested';
  submittedBy?: string;
  submittedAt: string;
  notes?: string;
}

export interface CrmProject {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  serviceCategory: string;
  description?: string;
  status: CrmProjectStatus;
  priority: CrmProjectPriority;
  startDate: string;
  deadline: string;
  budget: number;
  amountPaid: number;
  pendingBalance?: number;
  paymentStatus?: 'pending' | 'partial' | 'paid';
  progress: number; // 0 to 100
  assignedFreelancerIds: string[];
  milestones?: CrmProjectMilestone[];
  deliverables?: CrmProjectDeliverable[];
  activities?: CrmLeadActivity[];
  notes?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type CrmFreelancerStatus = 'available' | 'busy' | 'inactive';

export interface CrmFreelancerPayout {
  id: string;
  freelancerId: string;
  amount: number;
  date: string;
  method: string; // 'UPI', 'Bank Transfer', 'Cash', etc.
  referenceId?: string; // UPI UTR or Transaction ID
  notes?: string;
  status: 'paid' | 'pending';
  recordedBy?: string;
}

export interface CrmFreelancerSubmission {
  id: string;
  freelancerId: string;
  taskId?: string;
  taskTitle?: string;
  projectId?: string;
  projectTitle?: string;
  url: string; // Google Drive, Figma, Frame.io, etc.
  revisionRound: number;
  notes?: string;
  status: 'pending_review' | 'approved' | 'revision_requested';
  submittedAt: string;
}

export interface CrmFreelancer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  whatsapp?: string;
  specialty?: string;
  skills: string[];
  portfolioUrl?: string;
  status: CrmFreelancerStatus;
  hourlyRate?: number;
  fixedRateDefault?: number;
  agreedAmount?: number;
  paidAmount?: number;
  pendingBalance?: number;
  paymentStatus?: 'pending' | 'partial' | 'paid';
  paymentMethod?: string;
  paymentDetails?: string;
  payoutHistory?: CrmFreelancerPayout[];
  submissions?: CrmFreelancerSubmission[];
  revisionsRecordedCount: number;
  activeProjectsCount: number;
  completedProjectsCount: number;
  rating?: number; // 1 to 5
  paymentPending?: number;
  paymentPaidTotal?: number;
  notes?: string;
  activities?: CrmLeadActivity[];
  isDemo?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type CrmTaskStatus = 'to_do' | 'todo' | 'in_progress' | 'in_review' | 'review' | 'completed' | 'blocked';
export type CrmTaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface CrmSubtask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface CrmTaskSubmission {
  id: string;
  taskId: string;
  url: string; // Frame.io, Drive, Figma, GitHub, etc.
  notes?: string;
  revisionRound: number;
  submittedAt: string;
  submittedBy?: string;
  status: 'pending_review' | 'approved' | 'revision_requested';
}

export interface CrmTaskComment {
  id: string;
  taskId: string;
  authorEmail: string;
  authorName?: string;
  content: string;
  createdAt: string;
}

export interface CrmTask {
  id: string;
  projectId?: string;
  projectTitle?: string;
  clientId?: string;
  clientName?: string;
  title: string;
  description?: string;
  assignedFreelancerId?: string;
  assignedFreelancerName?: string;
  priority: CrmTaskPriority;
  status: CrmTaskStatus;
  startDate?: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  subtasks?: CrmSubtask[];
  progress?: number; // 0 to 100 calculated from subtasks
  submissions?: CrmTaskSubmission[];
  comments?: CrmTaskComment[];
  activities?: CrmLeadActivity[];
  revisionRound?: number;
  notes?: string;
  archived?: boolean;
  isDemo?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CrmInvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export type CrmInvoiceStatus = 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';

export interface CrmInvoice {
  id: string;
  invoiceNumber: string;
  quotationId?: string;
  quotationNumber?: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientCompany?: string;
  projectId?: string;
  projectTitle?: string;
  issueDate: string;
  dueDate: string;
  items: CrmInvoiceItem[];
  subtotal: number;
  discountPercentage?: number;
  discountAmount?: number;
  additionalCharges?: number;
  additionalChargesDescription?: string;
  isGstEnabled?: boolean;
  taxPercentage?: number;
  taxAmount?: number;
  total: number;
  totalAmount?: number;
  amountPaid: number;
  balanceDue: number;
  status: CrmInvoiceStatus;
  paymentTerms?: string;
  currency: string;
  notes?: string;
  bankDetails?: {
    bankName: string;
    accountHolder: string;
    accountNumber: string;
    ifsc: string;
    upiId: string;
  };
  activities?: CrmLeadActivity[];
  isDemo?: boolean;
  archived?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type CrmPaymentType = 'client_payment' | 'freelancer_payout';
export type CrmPaymentMethod = 'upi' | 'bank_transfer' | 'stripe' | 'cash' | 'credit_card' | 'other';
export type CrmPaymentStatus = 'completed' | 'pending' | 'failed';

export interface CrmPayment {
  id: string;
  paymentType: CrmPaymentType;
  invoiceId?: string;
  invoiceNumber?: string;
  clientId?: string;
  clientName?: string;
  freelancerId?: string;
  freelancerName?: string;
  projectId?: string;
  projectTitle?: string;
  amount: number;
  paymentMethod: CrmPaymentMethod;
  transactionRef?: string;
  paymentDate: string;
  status: CrmPaymentStatus;
  receiptUrl?: string;
  notes?: string;
  isDemo?: boolean;
  archived?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type CrmQuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'declined' | 'expired';

export interface CrmQuotationMilestone {
  id: string;
  label: string;
  percentage: number;
  amount: number;
  dueDateOrStage?: string;
  completed?: boolean;
}

export interface CrmQuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface CrmQuotation {
  id: string;
  quotationNumber: string;
  clientId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientCompany?: string;
  projectId?: string;
  projectTitle?: string;
  issueDate: string;
  validUntil: string;
  proposalScope?: string;
  deliverablesSummary?: string;
  estimatedTimeline?: string;
  items: CrmQuotationItem[];
  subtotal: number;
  discountPercentage?: number;
  discountAmount?: number;
  additionalCharges?: number;
  additionalChargesDescription?: string;
  isGstEnabled?: boolean;
  taxPercentage?: number;
  taxAmount?: number;
  total: number;
  totalAmount?: number;
  advancePercentage?: number;
  advanceAmount?: number;
  paymentMilestones?: CrmQuotationMilestone[];
  status: CrmQuotationStatus;
  currency: string;
  notes?: string;
  revisionPolicy?: string;
  terms?: string;
  convertedToInvoiceId?: string;
  convertedAt?: string;
  activities?: CrmLeadActivity[];
  archived?: boolean;
  isDemo?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type CrmExpenseCategory =
  | 'software'
  | 'freelancer'
  | 'studio_equipment'
  | 'marketing'
  | 'office'
  | 'travel'
  | 'legal_professional'
  | 'hardware'
  | 'other';

export interface CrmExpense {
  id: string;
  title: string;
  category: CrmExpenseCategory;
  amount: number;
  currency: string;
  date: string;
  paymentMethod: 'upi' | 'bank_transfer' | 'cash' | 'credit_card' | 'other';
  vendor?: string;
  isRecurring?: boolean;
  recurringFrequency?: 'monthly' | 'quarterly' | 'annual';
  freelancerPayoutId?: string;
  freelancerId?: string;
  freelancerName?: string;
  projectId?: string;
  projectTitle?: string;
  receiptUrl?: string;
  taxDeductible?: boolean;
  notes?: string;
  isDemo?: boolean;
  archived?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CrmReminder {
  id: string;
  title: string;
  type: 'lead_followup' | 'project_deadline' | 'invoice_due' | 'freelancer_task' | 'general';
  targetDate: string;
  linkedEntityId?: string;
  linkedEntityType?: 'lead' | 'client' | 'project' | 'invoice' | 'freelancer';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isCompleted: boolean;
  snoozedUntil?: string;
  isDynamic?: boolean;
  subtitle?: string;
  notes?: string;
  isDemo?: boolean;
  createdAt: string;
}

export interface CrmAgencySettings {
  agencyName: string;
  tagline: string;
  ownerName: string;
  ownerEmail: string;
  phone: string;
  whatsappUrl: string;
  websiteUrl: string;
  address: string;
  currency: string;
  currencySymbol: string;
  logoUrl?: string;
  primaryColor?: string;
  enableSoundAlerts?: boolean;
  compactTableMode?: boolean;
  gstNumber?: string;
  upiId?: string;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    ifsc: string;
    bankName: string;
  };
  isPaymentDetailsVerified?: boolean;
  isAddressVerified?: boolean;
  defaultPaymentTerms: string;
  invoiceNotesTemplate: string;
  quotationTermsTemplate: string;
}

export type AiReplyTone = 'polite' | 'confident' | 'brief' | 'sales';
export type AiReplyLanguage = 'en' | 'hi' | 'hinglish';
export type AiReplyContext =
  | 'general_inquiry'
  | 'pricing_quote'
  | 'project_milestone'
  | 'payment_reminder'
  | 'delay_notice'
  | 'deal_closing'
  | 'thank_you';

export interface QuickReplyTemplate {
  id: string;
  title: string;
  category: string;
  language: AiReplyLanguage;
  content: string;
  description: string;
}

export interface ConfiguredServicePricing {
  id: string;
  service: string;
  startingPrice: number;
  typicalRange: string;
  timeline: string;
  deliverables: string[];
}

export type CrmReportDateRange = '30d' | '90d' | 'year' | 'all';

export interface DashboardRevenueOverview {
  months: string[];
  receivedData: number[];
  outstandingData: number[];
  totalReceived: number;
  totalOutstanding: number;
}

export interface DashboardPipelineStage {
  stage: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
  dotColor: string;
}

export interface DashboardPaymentsOverview {
  receivedRevenue: number;
  receivedPercentage: number;
  outstandingBalance: number;
  outstandingPercentage: number;
  freelancerPayouts: number;
  freelancerPercentage: number;
  totalValue: number;
}

export interface DashboardActivityItem {
  id: string;
  title: string;
  timeAgo: string;
  type: 'lead' | 'invoice' | 'task' | 'project' | 'payment';
  amount?: number;
}

export interface DashboardTodayHighlights {
  leadsToday: number;
  leadsTrend: string;
  tasksCompletedToday: number;
  tasksTrend: string;
  paymentsReceivedToday: number;
  paymentsTrend: string;
}

export interface DashboardKpiTrend {
  text: string;
  direction: 'up' | 'down' | 'neutral';
  sparklineData: number[];
}

export interface CrmDashboardMetrics {
  totalLeads: number;
  newLeads: number;
  activeClientsCount: number;
  activeProjectsCount: number;
  pendingTasksCount: number;
  monthlyRevenue: number;
  outstandingPayments: number;
  freelancerPayoutsDue: number;
  recentLeads: CrmLead[];
  upcomingFollowUps: CrmLead[];
  servicesBreakdown: { service: string; count: number; percentage: number }[];
  leadSourcesBreakdown: { source: string; count: number }[];
  lastUpdated: string;
  isFirestoreConnected: boolean;

  // Premium Dashboard additions (Phase 8A & Phase 8B Enterprise)
  revenueOverview?: DashboardRevenueOverview;
  leadsPipeline?: DashboardPipelineStage[];
  paymentsOverview?: DashboardPaymentsOverview;
  recentActivities?: DashboardActivityItem[];
  todayHighlights?: DashboardTodayHighlights;
  kpiTrends?: Record<string, DashboardKpiTrend>;
  conversionRate?: string;
  conversionRateTrend?: string;
}
