import {
  CrmLead,
  CrmClient,
  CrmProject,
  CrmProjectStatus,
  CrmProjectPriority,
  CrmProjectMilestone,
  CrmProjectDeliverable,
  CrmFreelancer,
  CrmFreelancerStatus,
  CrmFreelancerPayout,
  CrmFreelancerSubmission,
  CrmLeadActivity,
  CrmTask,
  CrmTaskStatus,
  CrmTaskPriority,
  CrmSubtask,
  CrmTaskSubmission,
  CrmTaskComment,
  CrmQuotation,
  CrmQuotationStatus,
  CrmQuotationItem,
  CrmQuotationMilestone,
  CrmInvoice,
  CrmInvoiceItem,
  CrmInvoiceStatus,
  CrmPayment,
  CrmPaymentType,
  CrmPaymentMethod,
  CrmPaymentStatus,
  CrmExpense,
  CrmExpenseCategory,
  CrmReminder,
  CrmAgencySettings,
  CrmDashboardMetrics,
  AiReplyTone,
  AiReplyLanguage,
  AiReplyContext,
  QuickReplyTemplate,
  ConfiguredServicePricing,
  CrmReportDateRange
} from '../types/crm';
import {
  fetchAllLeadsFromFirestore,
  createManualLeadInFirestore,
  updateLeadCrmDataInFirestore,
  deleteLeadFromFirestore,
  fetchClientsFromFirestore,
  syncClientToFirestore
} from './firebase/firestore';
import {
  saveLeadToFirestore,
  deleteLeadFromFirestore as deleteLeadFromCloud,
  saveClientToFirestore,
  deleteClientFromFirestore as deleteClientFromCloud,
  fetchProjectsFromFirestore,
  saveProjectToFirestore,
  deleteProjectFromFirestore as deleteProjectFromCloud,
  fetchFreelancersFromFirestore,
  saveFreelancerToFirestore,
  deleteFreelancerFromFirestore as deleteFreelancerFromCloud,
  fetchTasksFromFirestore,
  saveTaskToFirestore,
  deleteTaskFromFirestore as deleteTaskFromCloud,
  fetchQuotationsFromFirestore,
  saveQuotationToFirestore,
  deleteQuotationFromFirestore as deleteQuotationFromCloud,
  fetchInvoicesFromFirestore,
  saveInvoiceToFirestore,
  deleteInvoiceFromFirestore as deleteInvoiceFromCloud,
  fetchPaymentsFromFirestore,
  savePaymentToFirestore,
  deletePaymentFromFirestore as deletePaymentFromCloud,
  fetchExpensesFromFirestore,
  saveExpenseToFirestore,
  deleteExpenseFromFirestore as deleteExpenseFromCloud,
  fetchRemindersFromFirestore,
  saveReminderToFirestore,
  deleteReminderFromFirestore as deleteReminderFromCloud,
  fetchCrmSettingsFromFirestore,
  saveCrmSettingsToFirestore,
  subscribeToCloudCollection,
  CrmCloudOperationResult
} from './crmFirestoreService';
import { contactConfig, WHATSAPP_BUSINESS_URL } from '../data';
import { isRecordDemo } from './crmBackupService';

const STORAGE_KEYS = {
  LEADS: 'rohitwork_crm_leads_v1',
  CLIENTS: 'rohitwork_crm_clients_v1',
  PROJECTS: 'rohitwork_crm_projects_v1',
  FREELANCERS: 'rohitwork_crm_freelancers_v1',
  TASKS: 'rohitwork_crm_tasks_v1',
  QUOTATIONS: 'rohitwork_crm_quotations_v1',
  INVOICES: 'rohitwork_crm_invoices_v1',
  PAYMENTS: 'rohitwork_crm_payments_v1',
  EXPENSES: 'rohitwork_crm_expenses_v1',
  REMINDERS: 'rohitwork_crm_reminders_v1',
  SETTINGS: 'rohitwork_crm_settings_v1'
};

export const DEFAULT_CRM_SETTINGS: CrmAgencySettings = {
  agencyName: 'Rohitwork Creative Studio',
  tagline: 'High-Impact Graphic Design, Video Editing & Web Experience',
  ownerName: 'Rohit Verma',
  ownerEmail: 'workall724038@gmail.com',
  phone: contactConfig.phoneDisplay,
  whatsappUrl: WHATSAPP_BUSINESS_URL,
  websiteUrl: 'https://rohitwork.in',
  address: '',
  currency: 'INR',
  currencySymbol: '₹',
  gstNumber: '',
  upiId: '',
  bankDetails: {
    accountName: '',
    accountNumber: '',
    ifsc: '',
    bankName: ''
  },
  isPaymentDetailsVerified: false,
  isAddressVerified: false,
  defaultPaymentTerms: '50% advance to initiate project, 50% upon final draft approval before final HD file delivery.',
  invoiceNotesTemplate: 'Thank you for partnering with Rohitwork Creative Studio. For any inquiries regarding this invoice, reach out directly at workall724038@gmail.com.',
  quotationTermsTemplate: 'This quotation is valid for 15 days from issue date. Deliverables include up to 2 revision rounds unless specified otherwise.'
};

// Listeners for reactive updates
type ChangeListener = () => void;
const listeners: Set<ChangeListener> = new Set();

export function subscribeCrmStore(listener: ChangeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach(fn => {
    try {
      fn();
    } catch (e) {
      console.error('Error notifying CRM listener:', e);
    }
  });
}

// Cross-tab reactive synchronization
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key && Object.values(STORAGE_KEYS).includes(e.key)) {
      switch (e.key) {
        case STORAGE_KEYS.LEADS:
          leads = safeGetLocal<CrmLead[]>(STORAGE_KEYS.LEADS, leads);
          break;
        case STORAGE_KEYS.CLIENTS:
          clients = safeGetLocal<CrmClient[]>(STORAGE_KEYS.CLIENTS, clients);
          break;
        case STORAGE_KEYS.PROJECTS:
          projects = safeGetLocal<CrmProject[]>(STORAGE_KEYS.PROJECTS, projects);
          break;
        case STORAGE_KEYS.FREELANCERS:
          freelancers = safeGetLocal<CrmFreelancer[]>(STORAGE_KEYS.FREELANCERS, freelancers);
          break;
        case STORAGE_KEYS.TASKS:
          tasks = safeGetLocal<CrmTask[]>(STORAGE_KEYS.TASKS, tasks);
          break;
        case STORAGE_KEYS.QUOTATIONS:
          quotations = safeGetLocal<CrmQuotation[]>(STORAGE_KEYS.QUOTATIONS, quotations);
          break;
        case STORAGE_KEYS.INVOICES:
          invoices = safeGetLocal<CrmInvoice[]>(STORAGE_KEYS.INVOICES, invoices);
          break;
        case STORAGE_KEYS.PAYMENTS:
          payments = safeGetLocal<CrmPayment[]>(STORAGE_KEYS.PAYMENTS, payments);
          break;
        case STORAGE_KEYS.EXPENSES:
          expenses = safeGetLocal<CrmExpense[]>(STORAGE_KEYS.EXPENSES, expenses);
          break;
        case STORAGE_KEYS.REMINDERS:
          reminders = safeGetLocal<CrmReminder[]>(STORAGE_KEYS.REMINDERS, reminders);
          break;
        case STORAGE_KEYS.SETTINGS:
          settings = safeGetLocal<CrmAgencySettings>(STORAGE_KEYS.SETTINGS, settings);
          break;
      }
      notifyListeners();
    }
  });
}

function safeGetLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function safeSetLocal<T>(key: string, data: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Could not save CRM state to ${key}:`, err);
  }
}

function safeClearLocal(key: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`Could not clear CRM state for ${key}:`, err);
  }
}

// In-Memory Store
let initialized = false;
let leads: CrmLead[] = [];
let clients: CrmClient[] = [];
let projects: CrmProject[] = [];
let freelancers: CrmFreelancer[] = [];
let tasks: CrmTask[] = [];
let quotations: CrmQuotation[] = [];
let invoices: CrmInvoice[] = [];
let payments: CrmPayment[] = [];
let expenses: CrmExpense[] = [];
let reminders: CrmReminder[] = [];
let settings: CrmAgencySettings = DEFAULT_CRM_SETTINGS;

const DEFAULT_INITIAL_FREELANCERS: CrmFreelancer[] = [
  {
    id: 'free_sameer_khan_01',
    name: 'Sameer Khan',
    phone: '+91 98765 43210',
    email: 'sameer.edits@gmail.com',
    whatsapp: '9876543210',
    specialty: 'Senior Video Editor & Colorist',
    skills: ['Premiere Pro', 'DaVinci Resolve', 'Color Grading', 'YouTube Reels', 'Audio Mix'],
    portfolioUrl: 'https://behance.net/sameer-edits',
    status: 'busy',
    hourlyRate: 1200,
    fixedRateDefault: 15000,
    agreedAmount: 38000,
    paidAmount: 24000,
    pendingBalance: 14000,
    paymentStatus: 'partial',
    paymentMethod: 'UPI: sameerkhan@oksbi',
    paymentPending: 14000,
    paymentPaidTotal: 24000,
    activeProjectsCount: 2,
    completedProjectsCount: 14,
    revisionsRecordedCount: 2,
    rating: 5,
    notes: 'Key video editor for high-ticket YouTube documentary cuts and brand promos. Very reliable turnaround.',
    isDemo: true,
    payoutHistory: [
      {
        id: 'payout_smk_01',
        freelancerId: 'free_sameer_khan_01',
        amount: 12000,
        date: '2026-11-01T10:30:00.000Z',
        method: 'UPI',
        referenceId: 'UPI/2026/782194',
        notes: 'Milestone 1 cut for Brand Promo',
        status: 'paid',
        recordedBy: 'Rohit Verma (Admin)'
      },
      {
        id: 'payout_smk_02',
        freelancerId: 'free_sameer_khan_01',
        amount: 12000,
        date: '2026-11-07T14:15:00.000Z',
        method: 'UPI',
        referenceId: 'UPI/2026/894102',
        notes: 'Milestone 2 color grading & audio sync',
        status: 'paid',
        recordedBy: 'Rohit Verma (Admin)'
      }
    ],
    submissions: [
      {
        id: 'sub_smk_01',
        freelancerId: 'free_sameer_khan_01',
        taskTitle: '4K Commercial Cut & Color Pass',
        projectTitle: 'Brand Commercial 60s',
        url: 'https://frame.io/preview/sample-cut-v2',
        revisionRound: 2,
        notes: 'Updated color grading based on Rohit feedback. Reduced saturation on skin tones.',
        status: 'approved',
        submittedAt: '2026-11-08T16:20:00.000Z'
      },
      {
        id: 'sub_smk_02',
        freelancerId: 'free_sameer_khan_01',
        taskTitle: 'Social Media Vertical Teaser',
        projectTitle: 'Brand Commercial 60s',
        url: 'https://drive.google.com/drive/folders/sample-teaser-cut',
        revisionRound: 1,
        notes: 'Initial cut delivered with royalty-free audio track.',
        status: 'revision_requested',
        submittedAt: '2026-11-10T11:45:00.000Z'
      }
    ],
    activities: [
      {
        id: 'act_smk_01',
        type: 'status_change',
        description: 'Status set to Busy (Assigned to Brand Commercial 60s)',
        timestamp: '2026-11-01T09:00:00.000Z',
        author: 'Rohit Verma (Admin)'
      },
      {
        id: 'act_smk_02',
        type: 'note',
        description: 'Agreed fee: ₹38,000 for full video editing package. 2 milestones paid.',
        timestamp: '2026-11-01T09:15:00.000Z',
        author: 'Rohit Verma (Admin)'
      }
    ],
    createdAt: '2026-10-15T08:00:00.000Z'
  },
  {
    id: 'free_ananya_sharma_02',
    name: 'Ananya Sharma',
    phone: '+91 98234 56789',
    email: 'ananya.vfx@gmail.com',
    whatsapp: '9823456789',
    specialty: '3D Motion & VFX Designer',
    skills: ['Cinema 4D', 'After Effects', 'Octane Render', '3D Product Animation', 'Blender'],
    portfolioUrl: 'https://ananyasharma.artstation.com',
    status: 'available',
    hourlyRate: 1600,
    fixedRateDefault: 28000,
    agreedAmount: 28000,
    paidAmount: 28000,
    pendingBalance: 0,
    paymentStatus: 'paid',
    paymentMethod: 'Bank: HDFC Bank (AC: ...4921)',
    paymentPending: 0,
    paymentPaidTotal: 28000,
    activeProjectsCount: 0,
    completedProjectsCount: 8,
    revisionsRecordedCount: 1,
    rating: 5,
    notes: 'Exceptional 3D render artist. Specializes in luxury products, tech hardware renders, and kinetic typography.',
    isDemo: true,
    payoutHistory: [
      {
        id: 'payout_any_01',
        freelancerId: 'free_ananya_sharma_02',
        amount: 28000,
        date: '2026-11-05T12:00:00.000Z',
        method: 'Bank Transfer',
        referenceId: 'HDFC/NEFT/09812401',
        notes: 'Final payment for Smart Watch 3D product commercial render',
        status: 'paid',
        recordedBy: 'Rohit Verma (Admin)'
      }
    ],
    submissions: [
      {
        id: 'sub_any_01',
        freelancerId: 'free_ananya_sharma_02',
        taskTitle: 'Smart Watch 3D Commercial 30s',
        projectTitle: 'Smart Watch 3D Product Launch',
        url: 'https://drive.google.com/drive/folders/sample-3d-renders',
        revisionRound: 1,
        notes: 'Final 4K ProRes 4444 render with alpha transparency and lighting passes.',
        status: 'approved',
        submittedAt: '2026-11-04T18:00:00.000Z'
      }
    ],
    activities: [
      {
        id: 'act_any_01',
        type: 'status_change',
        description: 'Status updated to Available after delivering Smart Watch renders',
        timestamp: '2026-11-05T12:30:00.000Z',
        author: 'Rohit Verma (Admin)'
      }
    ],
    createdAt: '2026-10-20T10:00:00.000Z'
  },
  {
    id: 'free_rohan_patel_03',
    name: 'Rohan Patel',
    phone: '+91 97123 45678',
    email: 'rohan.design@gmail.com',
    whatsapp: '9712345678',
    specialty: 'UI/UX & Webflow Specialist',
    skills: ['Figma', 'Webflow', 'Design Systems', 'Mobile App UI', 'Wireframing'],
    portfolioUrl: 'https://dribbble.com/rohan-designs',
    status: 'available',
    hourlyRate: 1400,
    fixedRateDefault: 22000,
    agreedAmount: 22000,
    paidAmount: 11000,
    pendingBalance: 11000,
    paymentStatus: 'partial',
    paymentMethod: 'UPI: rohanpatel@icici',
    paymentPending: 11000,
    paymentPaidTotal: 11000,
    activeProjectsCount: 1,
    completedProjectsCount: 6,
    revisionsRecordedCount: 1,
    rating: 4.8,
    notes: 'Clean modern aesthetic. Great with responsive Figma prototypes and Webflow CMS integration.',
    isDemo: true,
    payoutHistory: [
      {
        id: 'payout_rhn_01',
        freelancerId: 'free_rohan_patel_03',
        amount: 11000,
        date: '2026-11-09T15:00:00.000Z',
        method: 'UPI',
        referenceId: 'UPI/2026/910248',
        notes: 'Advance 50% deposit for Webflow SaaS landing page build',
        status: 'paid',
        recordedBy: 'Rohit Verma (Admin)'
      }
    ],
    submissions: [
      {
        id: 'sub_rhn_01',
        freelancerId: 'free_rohan_patel_03',
        taskTitle: 'Responsive UI Design in Figma',
        projectTitle: 'SaaS Webflow Redesign',
        url: 'https://figma.com/file/sample-saas-wireframes',
        revisionRound: 1,
        notes: 'Desktop and mobile responsive artboards with interactive button states.',
        status: 'pending_review',
        submittedAt: '2026-11-11T19:00:00.000Z'
      }
    ],
    activities: [
      {
        id: 'act_rhn_01',
        type: 'whatsapp',
        description: 'Discussed design tokens & mobile breakpoint requirements over WhatsApp',
        timestamp: '2026-11-09T14:30:00.000Z',
        author: 'Rohit Verma (Admin)'
      }
    ],
    createdAt: '2026-10-25T11:00:00.000Z'
  },
  {
    id: 'free_vikram_roy_04',
    name: 'Vikramaditya Roy',
    phone: '+91 99887 76655',
    email: 'vikram.creative@gmail.com',
    whatsapp: '9988776655',
    specialty: 'Graphic Designer & Brand Identity',
    skills: ['Illustrator', 'Photoshop', 'Brand Guidelines', 'Typography', 'Pitch Decks'],
    portfolioUrl: 'https://behance.net/vikram-roy',
    status: 'inactive',
    hourlyRate: 900,
    fixedRateDefault: 12000,
    agreedAmount: 12000,
    paidAmount: 12000,
    pendingBalance: 0,
    paymentStatus: 'paid',
    paymentMethod: 'UPI: vikramroy@paytm',
    paymentPending: 0,
    paymentPaidTotal: 12000,
    activeProjectsCount: 0,
    completedProjectsCount: 5,
    revisionsRecordedCount: 0,
    rating: 4.5,
    notes: 'Specializes in brand style guides and vector logos. Currently on leave for personal reasons.',
    isDemo: true,
    payoutHistory: [
      {
        id: 'payout_vkm_01',
        freelancerId: 'free_vikram_roy_04',
        amount: 12000,
        date: '2026-10-28T17:00:00.000Z',
        method: 'UPI',
        referenceId: 'UPI/2026/651092',
        notes: 'Final payment for complete Brand Identity Package',
        status: 'paid',
        recordedBy: 'Rohit Verma (Admin)'
      }
    ],
    submissions: [],
    activities: [
      {
        id: 'act_vkm_01',
        type: 'status_change',
        description: 'Status marked Inactive (Freelancer requested 2-week leave)',
        timestamp: '2026-11-02T10:00:00.000Z',
        author: 'Rohit Verma (Admin)'
      }
    ],
    createdAt: '2026-10-01T09:00:00.000Z'
  }
];

const DEFAULT_INITIAL_CLIENTS: CrmClient[] = [
  {
    id: 'client_nexora_01',
    name: 'Nexora Health Tech',
    company: 'Nexora Technologies Pvt Ltd',
    phone: '+91 98112 23344',
    email: 'marketing@nexorahealth.com',
    status: 'active',
    totalProjects: 1,
    currency: 'INR',
    tags: ['Video Editing', 'VIP Client', '3D Motion'],
    totalBilled: 85000,
    totalPaid: 50000,
    outstandingBalance: 35000,
    notes: 'Health tech startup. Needs high quality 3D product visualizers and YouTube documentary cuts.',
    isDemo: true,
    createdAt: '2026-10-10T10:00:00.000Z'
  },
  {
    id: 'client_luxe_02',
    name: 'Luxe Living Interiors',
    company: 'Luxe Living Studio',
    phone: '+91 98223 34455',
    email: 'projects@luxeliving.in',
    status: 'active',
    totalProjects: 1,
    currency: 'INR',
    tags: ['Video Editing', 'Monthly Retainer', 'High Priority'],
    totalBilled: 120000,
    totalPaid: 80000,
    outstandingBalance: 40000,
    notes: 'Luxury architectural design studio. Fast turnaround cinematic walkthroughs.',
    isDemo: true,
    createdAt: '2026-10-15T11:30:00.000Z'
  },
  {
    id: 'client_finpulse_03',
    name: 'FinPulse Advisory',
    company: 'FinPulse Financial Services',
    phone: '+91 98334 45566',
    email: 'director@finpulse.co',
    status: 'active',
    totalProjects: 1,
    currency: 'INR',
    tags: ['UI/UX & Web', 'YouTube Partner'],
    totalBilled: 65000,
    totalPaid: 20000,
    outstandingBalance: 45000,
    notes: 'B2B advisory firm redesigning their portal and client onboarding flow.',
    isDemo: true,
    createdAt: '2026-10-22T09:15:00.000Z'
  },
  {
    id: 'client_apex_04',
    name: 'Apex Logistics',
    company: 'Apex Supply Chain Ltd',
    phone: '+91 98445 56677',
    email: 'branding@apexlogistics.in',
    status: 'active',
    totalProjects: 1,
    currency: 'INR',
    tags: ['Branding & Logo', 'Graphic Design'],
    totalBilled: 45000,
    totalPaid: 45000,
    outstandingBalance: 0,
    notes: 'Complete rebrand, logo identity, vehicle wrap graphics and brand guidelines.',
    isDemo: true,
    createdAt: '2026-09-28T14:00:00.000Z'
  }
];

const DEFAULT_INITIAL_PROJECTS: CrmProject[] = [
  {
    id: 'proj_nexora_3d_01',
    title: 'Nexora 3D Visualizer & Brand Commercial',
    clientId: 'client_nexora_01',
    clientName: 'Nexora Health Tech',
    serviceCategory: 'Video Editing & 3D Motion',
    description: 'High-end 3D product commercial showcasing the smart wellness tracker, lighting passes, and 4K commercial cut.',
    status: 'in_progress',
    priority: 'high',
    startDate: '2026-11-01',
    deadline: '2026-11-25',
    budget: 85000,
    amountPaid: 50000,
    pendingBalance: 35000,
    paymentStatus: 'partial',
    progress: 70,
    assignedFreelancerIds: ['free_sameer_khan_01', 'free_ananya_sharma_02'],
    milestones: [
      {
        id: 'ms_nx_01',
        projectId: 'proj_nexora_3d_01',
        title: 'Script & Visual Moodboard',
        description: 'Approved storyboard and color palette direction.',
        completed: true,
        completedAt: '2026-11-04T12:00:00.000Z',
        order: 1
      },
      {
        id: 'ms_nx_02',
        projectId: 'proj_nexora_3d_01',
        title: '3D CAD Modeling & Octane Lighting Passes',
        description: 'Realistic metallic and glass reflections.',
        completed: true,
        completedAt: '2026-11-10T16:00:00.000Z',
        order: 2
      },
      {
        id: 'ms_nx_03',
        projectId: 'proj_nexora_3d_01',
        title: 'Rough Cut V1 Assembly & Motion Graphics',
        description: 'Kinetic typography and transitions.',
        completed: true,
        completedAt: '2026-11-11T18:00:00.000Z',
        order: 3
      },
      {
        id: 'ms_nx_04',
        projectId: 'proj_nexora_3d_01',
        title: 'Final 4K Master Color Grade & Audio Sync',
        description: 'DaVinci Resolve pass and sound effects mix.',
        completed: false,
        dueDate: '2026-11-25',
        order: 4
      }
    ],
    deliverables: [
      {
        id: 'del_nx_01',
        projectId: 'proj_nexora_3d_01',
        title: 'Rough Cut V1 Draft',
        url: 'https://frame.io/preview/sample-cut-v2',
        revisionRound: 1,
        status: 'approved',
        submittedBy: 'Sameer Khan',
        submittedAt: '2026-11-08T16:20:00.000Z',
        notes: 'Initial cut approved with minor color adjustment requested.'
      },
      {
        id: 'del_nx_02',
        projectId: 'proj_nexora_3d_01',
        title: '3D Render Passes (ProRes 4444)',
        url: 'https://drive.google.com/drive/folders/sample-3d-renders',
        revisionRound: 2,
        status: 'approved',
        submittedBy: 'Ananya Sharma',
        submittedAt: '2026-11-10T11:45:00.000Z',
        notes: 'Final alpha transparency renders ready for DaVinci grading.'
      }
    ],
    activities: [
      {
        id: 'act_p1_01',
        type: 'status_change',
        description: 'Project launched in In Progress state',
        timestamp: '2026-11-01T09:00:00.000Z',
        author: 'Rohit Verma (Admin)'
      },
      {
        id: 'act_p1_02',
        type: 'note',
        description: 'Advance payment of ₹50,000 received via Bank Transfer',
        timestamp: '2026-11-01T10:00:00.000Z',
        author: 'Rohit Verma (Admin)'
      },
      {
        id: 'act_p1_03',
        type: 'note',
        description: 'Milestone 3 completed: Rough Cut V1 approved by client',
        timestamp: '2026-11-11T18:00:00.000Z',
        author: 'Rohit Verma (Admin)'
      }
    ],
    notes: 'Priority brand visualizer. Client requires 9:16 vertical cuts for Instagram Reels upon final master approval.',
    isDemo: true,
    createdAt: '2026-11-01T08:30:00.000Z'
  },
  {
    id: 'proj_luxe_walkthrough_02',
    title: 'Luxe Living Cinematic Villa Walkthrough',
    clientId: 'client_luxe_02',
    clientName: 'Luxe Living Interiors',
    serviceCategory: 'Video Editing & Color Grading',
    description: 'Ultra-luxury interior architecture showcase film with sound design, drone stabilization, and architectural pacing.',
    status: 'in_review',
    priority: 'urgent',
    startDate: '2026-10-25',
    deadline: '2026-11-18',
    budget: 120000,
    amountPaid: 80000,
    pendingBalance: 40000,
    paymentStatus: 'partial',
    progress: 85,
    assignedFreelancerIds: ['free_sameer_khan_01'],
    milestones: [
      {
        id: 'ms_lx_01',
        projectId: 'proj_luxe_walkthrough_02',
        title: 'Footage Ingestion & Drone Stabilization',
        completed: true,
        completedAt: '2026-10-28T14:00:00.000Z',
        order: 1
      },
      {
        id: 'ms_lx_02',
        projectId: 'proj_luxe_walkthrough_02',
        title: 'Cinematic Walkthrough Cut Assembly',
        completed: true,
        completedAt: '2026-11-05T17:00:00.000Z',
        order: 2
      },
      {
        id: 'ms_lx_03',
        projectId: 'proj_luxe_walkthrough_02',
        title: 'Color Grading & Client Review',
        completed: true,
        completedAt: '2026-11-11T11:00:00.000Z',
        order: 3
      },
      {
        id: 'ms_lx_04',
        projectId: 'proj_luxe_walkthrough_02',
        title: 'Final Master Delivery & Clean Exports',
        completed: false,
        dueDate: '2026-11-18',
        order: 4
      }
    ],
    deliverables: [
      {
        id: 'del_lx_01',
        projectId: 'proj_luxe_walkthrough_02',
        title: 'Cinematic Walkthrough V2',
        url: 'https://frame.io/preview/luxe-villa-cut-v2',
        revisionRound: 2,
        status: 'pending_review',
        submittedBy: 'Sameer Khan',
        submittedAt: '2026-11-11T12:00:00.000Z',
        notes: 'Warm architectural grade applied with ambient acoustic sound design.'
      }
    ],
    activities: [
      {
        id: 'act_p2_01',
        type: 'status_change',
        description: 'Moved to In Review state after delivering Cut V2 to client',
        timestamp: '2026-11-11T12:30:00.000Z',
        author: 'Rohit Verma (Admin)'
      }
    ],
    notes: 'Client requested subtle speed ramping in the foyer and master suite transition.',
    isDemo: true,
    createdAt: '2026-10-25T10:00:00.000Z'
  },
  {
    id: 'proj_finpulse_portal_03',
    title: 'FinPulse SaaS Webflow Portal Redesign',
    clientId: 'client_finpulse_03',
    clientName: 'FinPulse Advisory',
    serviceCategory: 'UI/UX Design & Webflow',
    description: 'Complete UI/UX redesign of modern advisory dashboard, client calculation widgets, and responsive Webflow site.',
    status: 'planning',
    priority: 'medium',
    startDate: '2026-11-10',
    deadline: '2026-12-05',
    budget: 65000,
    amountPaid: 20000,
    pendingBalance: 45000,
    paymentStatus: 'partial',
    progress: 25,
    assignedFreelancerIds: ['free_rohan_patel_03'],
    milestones: [
      {
        id: 'ms_fp_01',
        projectId: 'proj_finpulse_portal_03',
        title: 'Information Architecture & Wireframes',
        completed: true,
        completedAt: '2026-11-12T10:00:00.000Z',
        order: 1
      },
      {
        id: 'ms_fp_02',
        projectId: 'proj_finpulse_portal_03',
        title: 'Figma High-Fidelity UI Screens & Components',
        completed: false,
        dueDate: '2026-11-20',
        order: 2
      },
      {
        id: 'ms_fp_03',
        projectId: 'proj_finpulse_portal_03',
        title: 'Webflow CMS Build & Interactive Animations',
        completed: false,
        dueDate: '2026-11-30',
        order: 3
      },
      {
        id: 'ms_fp_04',
        projectId: 'proj_finpulse_portal_03',
        title: 'SEO Audit & Custom Domain Publishing',
        completed: false,
        dueDate: '2026-12-05',
        order: 4
      }
    ],
    deliverables: [
      {
        id: 'del_fp_01',
        projectId: 'proj_finpulse_portal_03',
        title: 'Figma Interactive Wireframe Specs',
        url: 'https://figma.com/file/sample-saas-wireframes',
        revisionRound: 1,
        status: 'pending_review',
        submittedBy: 'Rohan Patel',
        submittedAt: '2026-11-11T19:00:00.000Z'
      }
    ],
    activities: [
      {
        id: 'act_p3_01',
        type: 'note',
        description: 'Advance 30% deposit received: ₹20,000 via UPI',
        timestamp: '2026-11-10T14:00:00.000Z',
        author: 'Rohit Verma (Admin)'
      }
    ],
    notes: 'Design tokens must strictly follow dark mode navy theme and inter typography.',
    isDemo: true,
    createdAt: '2026-11-10T09:00:00.000Z'
  },
  {
    id: 'proj_apex_branding_04',
    title: 'Apex Logistics Corporate Brand System',
    clientId: 'client_apex_04',
    clientName: 'Apex Logistics',
    serviceCategory: 'Brand Identity & Graphic Design',
    description: 'Corporate rebranding including vector identity, typography, corporate fleet livery graphics, and stationery deck.',
    status: 'completed',
    priority: 'medium',
    startDate: '2026-10-05',
    deadline: '2026-10-30',
    budget: 45000,
    amountPaid: 45000,
    pendingBalance: 0,
    paymentStatus: 'paid',
    progress: 100,
    assignedFreelancerIds: ['free_vikram_roy_04'],
    milestones: [
      {
        id: 'ms_ap_01',
        projectId: 'proj_apex_branding_04',
        title: 'Logo Direction Concepts',
        completed: true,
        completedAt: '2026-10-10T12:00:00.000Z',
        order: 1
      },
      {
        id: 'ms_ap_02',
        projectId: 'proj_apex_branding_04',
        title: 'Brand Guidelines Style Deck',
        completed: true,
        completedAt: '2026-10-20T16:00:00.000Z',
        order: 2
      },
      {
        id: 'ms_ap_03',
        projectId: 'proj_apex_branding_04',
        title: 'Fleet Livery & Stationery Kit',
        completed: true,
        completedAt: '2026-10-28T18:00:00.000Z',
        order: 3
      },
      {
        id: 'ms_ap_04',
        projectId: 'proj_apex_branding_04',
        title: 'Final Asset Archive & Production Handoff',
        completed: true,
        completedAt: '2026-10-30T17:00:00.000Z',
        order: 4
      }
    ],
    deliverables: [
      {
        id: 'del_ap_01',
        projectId: 'proj_apex_branding_04',
        title: 'Master Vector Brand Assets (.AI, .EPS, .SVG)',
        url: 'https://drive.google.com/drive/folders/sample-brand-kit',
        revisionRound: 1,
        status: 'approved',
        submittedBy: 'Vikramaditya Roy',
        submittedAt: '2026-10-30T15:00:00.000Z'
      }
    ],
    activities: [
      {
        id: 'act_p4_01',
        type: 'status_change',
        description: 'Project marked Completed upon final asset handoff',
        timestamp: '2026-10-30T17:00:00.000Z',
        author: 'Rohit Verma (Admin)'
      }
    ],
    notes: 'Successfully delivered. Client interested in future website redesign.',
    isDemo: true,
    createdAt: '2026-10-05T08:00:00.000Z'
  }
];

const DEFAULT_INITIAL_TASKS: CrmTask[] = [
  {
    id: 'task_nx_01',
    projectId: 'proj_nexora_3d_01',
    projectTitle: 'Nexora 3D Visualizer & Brand Commercial',
    clientId: 'client_nexora_01',
    clientName: 'Nexora Health Tech',
    title: '4K Color Grading & Cinematic Grade Pass',
    description: 'Apply DaVinci Resolve color grade matching client brand moodboard. Highlight skin tones and outdoor daylight scenes.',
    assignedFreelancerId: 'free_sameer_khan_01',
    assignedFreelancerName: 'Sameer Khan',
    priority: 'high',
    status: 'in_progress',
    startDate: '2026-11-10',
    dueDate: '2026-11-16',
    estimatedHours: 8,
    actualHours: 5,
    progress: 67,
    revisionRound: 2,
    subtasks: [
      { id: 'sub_nx_1', title: 'Normalize Rec.709 footage and balance exposure', completed: true, completedAt: '2026-11-11T10:00:00.000Z' },
      { id: 'sub_nx_2', title: 'Skin tone qualifiers & teal-orange contrast split', completed: true, completedAt: '2026-11-11T15:30:00.000Z' },
      { id: 'sub_nx_3', title: 'Export ProRes 422 HQ master for client preview', completed: false }
    ],
    submissions: [
      {
        id: 'subm_nx_1',
        taskId: 'task_nx_01',
        url: 'https://frame.io/preview/sample-cut-v2',
        notes: 'Round 1 rough color grade submitted on Frame.io',
        revisionRound: 1,
        submittedAt: '2026-11-08T16:20:00.000Z',
        submittedBy: 'Sameer Khan',
        status: 'revision_requested'
      }
    ],
    comments: [
      {
        id: 'comm_nx_1',
        taskId: 'task_nx_01',
        authorEmail: 'workall724038@gmail.com',
        authorName: 'Rohit Verma (Admin)',
        content: 'Client requested slightly warmer tones in the outdoor daylight scene at 0:24.',
        createdAt: '2026-11-11T09:30:00.000Z'
      }
    ],
    activities: [
      {
        id: 'act_task_nx_1',
        type: 'status_change',
        description: 'Task assigned to Sameer Khan and moved to In Progress',
        timestamp: '2026-11-10T09:00:00.000Z',
        author: 'Rohit Verma (Admin)'
      }
    ],
    notes: 'Key milestone for Nexora product commercial launch.',
    isDemo: true,
    createdAt: '2026-11-10T09:00:00.000Z'
  },
  {
    id: 'task_nx_02',
    projectId: 'proj_nexora_3d_01',
    projectTitle: 'Nexora 3D Visualizer & Brand Commercial',
    clientId: 'client_nexora_01',
    clientName: 'Nexora Health Tech',
    title: 'Smartwatch 3D CAD Glass Shader & Octane Lighting Passes',
    description: 'Ensure reflection passes on smartwatch glass and metallic bezel match client hardware references.',
    assignedFreelancerId: 'free_ananya_sharma_02',
    assignedFreelancerName: 'Ananya Sharma',
    priority: 'medium',
    status: 'completed',
    startDate: '2026-11-02',
    dueDate: '2026-11-08',
    estimatedHours: 14,
    actualHours: 12,
    progress: 100,
    revisionRound: 1,
    subtasks: [
      { id: 'sub_nx2_1', title: 'Import OBJ CAD models into Cinema4D', completed: true, completedAt: '2026-11-03T11:00:00.000Z' },
      { id: 'sub_nx2_2', title: 'Build metallic anisotropic shader materials', completed: true, completedAt: '2026-11-04T14:00:00.000Z' },
      { id: 'sub_nx2_3', title: 'Render 4K multi-pass EXR files', completed: true, completedAt: '2026-11-04T18:00:00.000Z' }
    ],
    submissions: [
      {
        id: 'subm_nx2_1',
        taskId: 'task_nx_02',
        url: 'https://drive.google.com/drive/folders/sample-3d-renders',
        notes: 'Final 4K ProRes 4444 passes uploaded with alpha channels',
        revisionRound: 1,
        submittedAt: '2026-11-04T18:00:00.000Z',
        submittedBy: 'Ananya Sharma',
        status: 'approved'
      }
    ],
    activities: [
      {
        id: 'act_task_nx_2',
        type: 'status_change',
        description: 'Task approved and marked Completed',
        timestamp: '2026-11-05T12:00:00.000Z',
        author: 'Rohit Verma (Admin)'
      }
    ],
    isDemo: true,
    createdAt: '2026-11-02T10:00:00.000Z'
  },
  {
    id: 'task_fp_03',
    projectId: 'proj_finpulse_portal_03',
    projectTitle: 'FinPulse SaaS Webflow Portal & Motion Assets',
    clientId: 'client_finpulse_03',
    clientName: 'FinPulse Advisory',
    title: 'SaaS High-Fidelity Responsive Wireframes & Webflow CMS',
    description: 'Design dark/light theme dashboard responsive screens for desktop and mobile, and connect Webflow CMS collections.',
    assignedFreelancerId: 'free_rohan_patel_03',
    assignedFreelancerName: 'Rohan Patel',
    priority: 'urgent',
    status: 'in_review',
    startDate: '2026-11-06',
    dueDate: '2026-11-14',
    estimatedHours: 16,
    actualHours: 14,
    progress: 75,
    revisionRound: 1,
    subtasks: [
      { id: 'sub_fp_1', title: 'Figma component library setup', completed: true, completedAt: '2026-11-07T12:00:00.000Z' },
      { id: 'sub_fp_2', title: 'Mobile responsive layouts (375px)', completed: true, completedAt: '2026-11-08T16:00:00.000Z' },
      { id: 'sub_fp_3', title: 'Webflow CMS dynamic list templates', completed: true, completedAt: '2026-11-10T14:00:00.000Z' },
      { id: 'sub_fp_4', title: 'Interactive micro-interactions & hover states', completed: false }
    ],
    submissions: [
      {
        id: 'subm_fp_1',
        taskId: 'task_fp_03',
        url: 'https://figma.com/file/sample-saas-wireframes',
        notes: 'Figma prototype ready for client review',
        revisionRound: 1,
        submittedAt: '2026-11-10T17:00:00.000Z',
        submittedBy: 'Rohan Patel',
        status: 'pending_review'
      }
    ],
    comments: [
      {
        id: 'comm_fp_1',
        taskId: 'task_fp_03',
        authorEmail: 'workall724038@gmail.com',
        authorName: 'Rohit Verma (Admin)',
        content: 'Reviewing prototype with client stakeholder tomorrow at 11 AM.',
        createdAt: '2026-11-11T14:00:00.000Z'
      }
    ],
    isDemo: true,
    createdAt: '2026-11-06T10:00:00.000Z'
  },
  {
    id: 'task_lx_04',
    projectId: 'proj_luxe_walkthrough_02',
    projectTitle: 'Luxe Living Cinematic Villa Walkthrough',
    clientId: 'client_luxe_02',
    clientName: 'Luxe Living Interiors',
    title: 'Drone Aerial 4K Footage Stabilization & Speed Ramping',
    description: 'Stabilize high-wind drone pans and apply cinematic speed ramping synced to the ambient soundtrack.',
    assignedFreelancerId: 'free_sameer_khan_01',
    assignedFreelancerName: 'Sameer Khan',
    priority: 'medium',
    status: 'to_do',
    startDate: '2026-11-12',
    dueDate: '2026-11-18',
    estimatedHours: 6,
    actualHours: 0,
    progress: 0,
    revisionRound: 0,
    subtasks: [
      { id: 'sub_lx_1', title: 'Ingest 10-bit D-Log raw drone clips', completed: false },
      { id: 'sub_lx_2', title: 'Gyroflow stabilization pass', completed: false },
      { id: 'sub_lx_3', title: 'Dynamic zoom and speed ramp curves', completed: false }
    ],
    notes: 'Footage downloaded from client cloud drive.',
    isDemo: true,
    createdAt: '2026-11-12T10:00:00.000Z'
  },
  {
    id: 'task_ap_05',
    projectId: 'proj_apex_branding_04',
    projectTitle: 'Apex Logistics Corporate Brand System',
    clientId: 'client_apex_04',
    clientName: 'Apex Logistics',
    title: 'Corporate Brand Guidelines PDF & Vector Iconography Suite',
    description: 'Design comprehensive brand identity guidelines including color specifications, typography rules, and custom vector icons.',
    assignedFreelancerId: 'free_rohan_patel_03',
    assignedFreelancerName: 'Rohan Patel',
    priority: 'high',
    status: 'blocked',
    startDate: '2026-11-05',
    dueDate: '2026-11-11',
    estimatedHours: 12,
    actualHours: 8,
    progress: 50,
    revisionRound: 1,
    subtasks: [
      { id: 'sub_ap_1', title: 'Finalize primary & secondary color pantone codes', completed: true, completedAt: '2026-11-06T15:00:00.000Z' },
      { id: 'sub_ap_2', title: 'Build 24 custom logistic vector icons', completed: true, completedAt: '2026-11-08T18:00:00.000Z' },
      { id: 'sub_ap_3', title: 'Legal trademark clearance sign-off', completed: false },
      { id: 'sub_ap_4', title: 'Export 36-page brand manual PDF', completed: false }
    ],
    comments: [
      {
        id: 'comm_ap_1',
        taskId: 'task_ap_05',
        authorEmail: 'workall724038@gmail.com',
        authorName: 'Rohit Verma (Admin)',
        content: 'Blocked: Waiting on legal team sign-off for trademark clearance.',
        createdAt: '2026-11-10T11:00:00.000Z'
      }
    ],
    notes: 'Pending client legal team feedback.',
    isDemo: true,
    createdAt: '2026-11-05T10:00:00.000Z'
  }
];

const DEFAULT_INITIAL_QUOTATIONS: CrmQuotation[] = [
  {
    id: 'quot_nx_01',
    quotationNumber: 'RW-QT-2026-001',
    clientId: 'client_nexora_01',
    clientName: 'Nexora Health Tech',
    clientEmail: 'marketing@nexorahealth.com',
    clientPhone: '+91 98112 23344',
    clientCompany: 'Nexora Technologies Pvt Ltd',
    projectId: 'proj_nexora_3d_01',
    projectTitle: 'Nexora 3D Visualizer & Brand Commercial',
    issueDate: '2026-11-01',
    validUntil: '2026-11-20',
    proposalScope: 'Complete creative production and photorealistic 3D asset visualizer for the Nexora Smart Wellness Tracker campaign.',
    deliverablesSummary: '• 60s 4K Cinema Commercial Master Cut\n• 3x 15s High-Conversion Vertical Social Teasers (9:16)\n• 4K Multi-Pass Octane 3D Stills (Front, Bezel, Glass Reflection)',
    estimatedTimeline: '14-18 business days from kickoff',
    items: [
      { id: 'item_1', description: '4K Commercial Edit & DaVinci Resolve Master Color Pass', quantity: 1, unitPrice: 40000, amount: 40000 },
      { id: 'item_2', description: '3D CAD Modeling & Photorealistic Octane Lighting Renders', quantity: 1, unitPrice: 30000, amount: 30000 },
      { id: 'item_3', description: 'Custom Sound Design, Cinematic Foley & Audio Mastering', quantity: 1, unitPrice: 15000, amount: 15000 }
    ],
    subtotal: 85000,
    discountPercentage: 0,
    discountAmount: 0,
    additionalCharges: 0,
    isGstEnabled: false,
    taxPercentage: 0,
    taxAmount: 0,
    total: 85000,
    totalAmount: 85000,
    advancePercentage: 50,
    advanceAmount: 42500,
    paymentMilestones: [
      { id: 'm1', label: 'Project Kickoff & Moodboard Sign-Off (50%)', percentage: 50, amount: 42500, completed: true },
      { id: 'm2', label: 'Draft Cut V1 Review & 3D Render Approval (30%)', percentage: 30, amount: 25500, completed: true },
      { id: 'm3', label: 'Final Master Handoff & Cloud Transfer (20%)', percentage: 20, amount: 17000, completed: false }
    ],
    status: 'accepted',
    convertedToInvoiceId: 'inv_nx_01',
    convertedAt: '2026-11-03T10:00:00.000Z',
    currency: 'INR',
    revisionPolicy: '2 revision rounds included at no charge. Additional revision rounds billed at standard rate of ₹1,500/hour.',
    terms: '1. Advance payment of 50% is required before commencement of production.\n2. Final uncompressed 4K master files and project deliverables will be released upon full settlement of invoice.\n3. Client provides all trademark assets and raw video references.',
    notes: 'Approved by Marketing Director on Nov 03, 2026.',
    isDemo: true,
    createdAt: '2026-11-01T08:30:00.000Z'
  },
  {
    id: 'quot_lx_02',
    quotationNumber: 'RW-QT-2026-002',
    clientId: 'client_luxe_02',
    clientName: 'Luxe Living Interiors',
    clientEmail: 'projects@luxeliving.in',
    clientPhone: '+91 98223 34455',
    clientCompany: 'Luxe Living Studio',
    projectId: 'proj_luxe_walkthrough_02',
    projectTitle: 'Luxe Living Cinematic Villa Walkthrough',
    issueDate: '2026-11-05',
    validUntil: '2026-11-25',
    proposalScope: 'Cinematic interior design video walkthrough featuring aerial drone stabilization and luxury architectural visual pacing.',
    deliverablesSummary: '• 3-Minute 4K Ultra HD Interior Walkthrough Film\n• 4x Architectural Highlights Reels for Instagram\n• Color Grading calibrated for luxury display screens',
    estimatedTimeline: '10-12 business days',
    items: [
      { id: 'item_1', description: 'Drone Aerial 4K Footage Stabilization & Color Grading', quantity: 1, unitPrice: 45000, amount: 45000 },
      { id: 'item_2', description: 'Cinematic Interior Walkthrough Cut Assembly & Pacing', quantity: 1, unitPrice: 50000, amount: 50000 },
      { id: 'item_3', description: 'Ambient Acoustic Soundtrack Licensing & Sound Foley Mix', quantity: 1, unitPrice: 25000, amount: 25000 }
    ],
    subtotal: 120000,
    discountPercentage: 0,
    discountAmount: 0,
    additionalCharges: 0,
    isGstEnabled: false,
    taxPercentage: 0,
    taxAmount: 0,
    total: 120000,
    totalAmount: 120000,
    advancePercentage: 50,
    advanceAmount: 60000,
    paymentMilestones: [
      { id: 'm1', label: 'Advance Deposit upon Brief Confirmation (50%)', percentage: 50, amount: 60000, completed: false },
      { id: 'm2', label: 'Draft Cut V1 Review (30%)', percentage: 30, amount: 36000, completed: false },
      { id: 'm3', label: 'Final Delivery & ProRes Master (20%)', percentage: 20, amount: 24000, completed: false }
    ],
    status: 'sent',
    currency: 'INR',
    revisionPolicy: '2 rounds of creative revisions included. Further rounds billed at ₹1,800/hour.',
    terms: '50% advance deposit to schedule drone operator and editing suite. Balance due within 7 days of final delivery approval.',
    notes: 'Sent to client via WhatsApp and Email on Nov 05, 2026.',
    isDemo: true,
    createdAt: '2026-11-05T10:00:00.000Z'
  },
  {
    id: 'quot_fp_03',
    quotationNumber: 'RW-QT-2026-003',
    clientId: 'client_finpulse_03',
    clientName: 'FinPulse Advisory',
    clientEmail: 'director@finpulse.co',
    clientPhone: '+91 98334 45566',
    clientCompany: 'FinPulse Financial Services',
    projectId: 'proj_finpulse_portal_03',
    projectTitle: 'FinPulse SaaS Webflow Portal & Motion Assets',
    issueDate: '2026-11-08',
    validUntil: '2026-11-23',
    proposalScope: 'High-conversion SaaS Webflow portal design with dark-mode aesthetic and kinetic typography animations.',
    deliverablesSummary: '• Complete Responsive Figma Design System (5 Pages)\n• Webflow CMS Integration with Custom Interactions\n• 2D Vector Explainer Motion Graphics Loop',
    estimatedTimeline: '20 business days',
    items: [
      { id: 'item_1', description: 'Responsive SaaS Webflow Portal Design (5 Core Pages)', quantity: 1, unitPrice: 45000, amount: 45000 },
      { id: 'item_2', description: '2D Kinetic Motion Graphics Explainer Animations', quantity: 1, unitPrice: 20000, amount: 20000 }
    ],
    subtotal: 65000,
    discountPercentage: 0,
    discountAmount: 0,
    additionalCharges: 0,
    isGstEnabled: false,
    taxPercentage: 0,
    taxAmount: 0,
    total: 65000,
    totalAmount: 65000,
    advancePercentage: 50,
    advanceAmount: 32500,
    paymentMilestones: [
      { id: 'm1', label: 'Kickoff Advance (50%)', percentage: 50, amount: 32500, completed: false },
      { id: 'm2', label: 'Webflow Staging Review (30%)', percentage: 30, amount: 19500, completed: false },
      { id: 'm3', label: 'Domain Publishing & Launch (20%)', percentage: 20, amount: 13000, completed: false }
    ],
    status: 'draft',
    currency: 'INR',
    revisionPolicy: 'Up to 3 iterations during Figma phase; 1 iteration during Webflow build.',
    terms: 'Client provides Webflow workspace invite or account credentials. Hosting fees paid directly to Webflow.',
    notes: 'Internal draft proposal for board review.',
    isDemo: true,
    createdAt: '2026-11-08T11:30:00.000Z'
  },
  {
    id: 'quot_ap_04',
    quotationNumber: 'RW-QT-2026-004',
    clientId: 'client_apex_04',
    clientName: 'Apex Logistics',
    clientEmail: 'branding@apexlogistics.in',
    clientPhone: '+91 98445 56677',
    clientCompany: 'Apex Supply Chain Ltd',
    projectId: 'proj_apex_branding_04',
    projectTitle: 'Apex Logistics Corporate Brand System',
    issueDate: '2026-10-18',
    validUntil: '2026-11-05',
    proposalScope: 'Complete corporate visual identity system, vehicle fleet wrap guidelines, and master vector logo suite.',
    deliverablesSummary: '• Vector Logo Master Suite (.AI, .EPS, .SVG, .PNG)\n• 36-Page Corporate Brand Manual PDF\n• Vehicle Fleet Livery Specifications',
    estimatedTimeline: '12 business days',
    items: [
      { id: 'item_1', description: 'Corporate Logo & Visual Identity Design System', quantity: 1, unitPrice: 30000, amount: 30000 },
      { id: 'item_2', description: 'Vehicle Fleet Wrap Livery Guidelines & Stationery Kit', quantity: 1, unitPrice: 15000, amount: 15000 }
    ],
    subtotal: 45000,
    discountPercentage: 0,
    discountAmount: 0,
    additionalCharges: 0,
    isGstEnabled: false,
    taxPercentage: 0,
    taxAmount: 0,
    total: 45000,
    totalAmount: 45000,
    advancePercentage: 50,
    advanceAmount: 22500,
    paymentMilestones: [
      { id: 'm1', label: 'Advance Deposit (50%)', percentage: 50, amount: 22500, completed: true },
      { id: 'm2', label: 'Final Delivery of Brand Vector Assets (50%)', percentage: 50, amount: 22500, completed: true }
    ],
    status: 'accepted',
    convertedToInvoiceId: 'inv_ap_02',
    convertedAt: '2026-11-04T12:00:00.000Z',
    currency: 'INR',
    revisionPolicy: 'Includes 3 logo concept directions and 2 revision rounds on selected direction.',
    terms: 'Full intellectual property transferred to client upon final payment settlement.',
    notes: 'Paid and delivered successfully.',
    isDemo: true,
    createdAt: '2026-10-18T09:00:00.000Z'
  },
  {
    id: 'quot_hz_05',
    quotationNumber: 'RW-QT-2026-005',
    clientName: 'Horizon Retail Labs',
    clientEmail: 'procurement@horizonretail.com',
    clientPhone: '+91 98765 11223',
    clientCompany: 'Horizon Retail Solutions',
    issueDate: '2026-10-15',
    validUntil: '2026-10-30',
    proposalScope: 'E-commerce product photo retouching suite and promotional social media creative templates.',
    deliverablesSummary: '• 50 High-End Retouched Product Stills\n• 10 Editable Photoshop Social Post Templates',
    estimatedTimeline: '7 business days',
    items: [
      { id: 'item_1', description: 'E-Commerce Product Retouching (50 Images)', quantity: 50, unitPrice: 440, amount: 22000 },
      { id: 'item_2', description: 'Social Media Campaign Template Package (10 Designs)', quantity: 1, unitPrice: 20000, amount: 20000 }
    ],
    subtotal: 42000,
    discountPercentage: 0,
    discountAmount: 0,
    additionalCharges: 0,
    isGstEnabled: false,
    taxPercentage: 0,
    taxAmount: 0,
    total: 42000,
    totalAmount: 42000,
    advancePercentage: 50,
    advanceAmount: 21000,
    status: 'expired',
    currency: 'INR',
    revisionPolicy: '1 round of batch review.',
    terms: 'Validity expired on Oct 30, 2026. Needs requote if client wishes to proceed.',
    notes: 'Quotation expired with no response from client.',
    isDemo: true,
    createdAt: '2026-10-15T12:00:00.000Z'
  }
];

const DEFAULT_INITIAL_INVOICES: CrmInvoice[] = [
  {
    id: 'inv_nx_01',
    invoiceNumber: 'RW-INV-2026-001',
    quotationId: 'quot_nx_01',
    quotationNumber: 'RW-QT-2026-001',
    clientId: 'client_nexora_01',
    clientName: 'Nexora Health Tech',
    clientCompany: 'Nexora Technologies Pvt Ltd',
    clientEmail: 'marketing@nexorahealth.com',
    clientPhone: '+91 98112 23344',
    projectId: 'proj_nexora_3d_01',
    projectTitle: 'Nexora 3D Visualizer & Brand Commercial',
    issueDate: '2026-11-03',
    dueDate: '2026-11-18',
    items: [
      { id: 'item_1', description: '4K Commercial Edit & DaVinci Resolve Master Color Pass', quantity: 1, unitPrice: 40000, amount: 40000 },
      { id: 'item_2', description: '3D CAD Modeling & Photorealistic Octane Lighting Renders', quantity: 1, unitPrice: 30000, amount: 30000 },
      { id: 'item_3', description: 'Custom Sound Design, Cinematic Foley & Audio Mastering', quantity: 1, unitPrice: 15000, amount: 15000 }
    ],
    subtotal: 85000,
    discountPercentage: 0,
    discountAmount: 0,
    additionalCharges: 0,
    isGstEnabled: false,
    taxPercentage: 0,
    taxAmount: 0,
    total: 85000,
    totalAmount: 85000,
    amountPaid: 42500,
    balanceDue: 42500,
    status: 'partially_paid',
    paymentTerms: '50% Advance Received, Balance on Final 4K Master Handover',
    currency: 'INR',
    isDemo: true,
    createdAt: '2026-11-03T10:00:00.000Z'
  },
  {
    id: 'inv_ap_02',
    invoiceNumber: 'RW-INV-2026-002',
    quotationId: 'quot_ap_04',
    quotationNumber: 'RW-QT-2026-004',
    clientId: 'client_apex_04',
    clientName: 'Apex Logistics',
    clientCompany: 'Apex Supply Chain Ltd',
    clientEmail: 'ops@apexlogistics.in',
    clientPhone: '+91 98445 56677',
    projectId: 'proj_apex_explainer_04',
    projectTitle: 'Apex Fleet 2D Animated Explainer',
    issueDate: '2026-11-04',
    dueDate: '2026-11-12',
    items: [
      { id: 'item_1', description: '2D Vector Animation & Character Rigging (60s)', quantity: 1, unitPrice: 30000, amount: 30000 },
      { id: 'item_2', description: 'Studio Voiceover Recording & Commercial Foley', quantity: 1, unitPrice: 15000, amount: 15000 }
    ],
    subtotal: 45000,
    discountPercentage: 0,
    discountAmount: 0,
    additionalCharges: 0,
    isGstEnabled: false,
    taxPercentage: 0,
    taxAmount: 0,
    total: 45000,
    totalAmount: 45000,
    amountPaid: 45000,
    balanceDue: 0,
    status: 'paid',
    paymentTerms: 'Settled in Full via Bank Transfer',
    currency: 'INR',
    isDemo: true,
    createdAt: '2026-11-04T12:00:00.000Z'
  },
  {
    id: 'inv_fp_03',
    invoiceNumber: 'RW-INV-2026-003',
    quotationId: 'quot_fp_03',
    quotationNumber: 'RW-QT-2026-003',
    clientId: 'client_finpulse_03',
    clientName: 'FinPulse Advisory',
    clientCompany: 'FinPulse Financial Services',
    clientEmail: 'director@finpulse.co',
    clientPhone: '+91 98334 45566',
    projectId: 'proj_finpulse_portal_03',
    projectTitle: 'FinPulse SaaS Webflow Portal & Motion Assets',
    issueDate: '2026-11-08',
    dueDate: '2026-11-23',
    items: [
      { id: 'item_1', description: 'Responsive SaaS Webflow Portal Design (5 Pages)', quantity: 1, unitPrice: 45000, amount: 45000 },
      { id: 'item_2', description: 'Interactive Motion Graphics Hero Explainer', quantity: 1, unitPrice: 20000, amount: 20000 }
    ],
    subtotal: 65000,
    discountPercentage: 0,
    discountAmount: 0,
    additionalCharges: 0,
    isGstEnabled: false,
    taxPercentage: 0,
    taxAmount: 0,
    total: 65000,
    totalAmount: 65000,
    amountPaid: 0,
    balanceDue: 65000,
    status: 'sent',
    paymentTerms: 'Net 15 Days',
    currency: 'INR',
    isDemo: true,
    createdAt: '2026-11-08T09:00:00.000Z'
  }
];

const DEFAULT_INITIAL_PAYMENTS: CrmPayment[] = [
  {
    id: 'pay_nx_01',
    paymentType: 'client_payment',
    invoiceId: 'inv_nx_01',
    invoiceNumber: 'RW-INV-2026-001',
    clientId: 'client_nexora_01',
    clientName: 'Nexora Health Tech',
    projectId: 'proj_nexora_3d_01',
    projectTitle: 'Nexora 3D Visualizer & Brand Commercial',
    amount: 42500,
    paymentMethod: 'upi',
    transactionRef: 'UPI/20261103/99281',
    paymentDate: '2026-11-03',
    status: 'completed',
    notes: 'Advance deposit 50% for 3D Visualizer Kickoff',
    isDemo: true,
    createdAt: '2026-11-03T11:00:00.000Z'
  },
  {
    id: 'pay_ap_01',
    paymentType: 'client_payment',
    invoiceId: 'inv_ap_02',
    invoiceNumber: 'RW-INV-2026-002',
    clientId: 'client_apex_04',
    clientName: 'Apex Logistics',
    projectId: 'proj_apex_explainer_04',
    projectTitle: 'Apex Fleet 2D Animated Explainer',
    amount: 45000,
    paymentMethod: 'bank_transfer',
    transactionRef: 'NEFT/HDFC/20261106/4482',
    paymentDate: '2026-11-06',
    status: 'completed',
    notes: 'Final settlement payment received in HDFC Current A/C',
    isDemo: true,
    createdAt: '2026-11-06T15:30:00.000Z'
  },
  {
    id: 'pay_fl_01',
    paymentType: 'freelancer_payout',
    freelancerId: 'free_sameer_khan_01',
    freelancerName: 'Sameer Khan',
    projectId: 'proj_nexora_3d_01',
    projectTitle: 'Nexora 3D Visualizer & Brand Commercial',
    amount: 12000,
    paymentMethod: 'upi',
    transactionRef: 'UPI/20261101/88371',
    paymentDate: '2026-11-01',
    status: 'completed',
    notes: 'Milestone payout for video editing & preliminary cut',
    isDemo: true,
    createdAt: '2026-11-01T10:30:00.000Z'
  }
];

const DEFAULT_INITIAL_EXPENSES: CrmExpense[] = [
  {
    id: 'exp_01',
    title: 'Adobe Creative Cloud All Apps & Substance 3D',
    category: 'software',
    amount: 6499,
    currency: 'INR',
    date: '2026-11-01',
    paymentMethod: 'credit_card',
    vendor: 'Adobe Systems India',
    isRecurring: true,
    recurringFrequency: 'monthly',
    taxDeductible: true,
    notes: 'Production suite license for editing, color grading & VFX',
    isDemo: true,
    createdAt: '2026-11-01T06:00:00.000Z'
  },
  {
    id: 'exp_02',
    title: 'Figma Enterprise Pro Workspace & Dev Mode',
    category: 'software',
    amount: 3200,
    currency: 'INR',
    date: '2026-11-02',
    paymentMethod: 'credit_card',
    vendor: 'Figma Inc',
    isRecurring: true,
    recurringFrequency: 'monthly',
    taxDeductible: true,
    notes: 'Design handoff and prototyping seats',
    isDemo: true,
    createdAt: '2026-11-02T07:00:00.000Z'
  },
  {
    id: 'exp_03',
    title: 'Sameer Khan — 4K Video Cut & Assembly',
    category: 'freelancer',
    amount: 12000,
    currency: 'INR',
    date: '2026-11-01',
    paymentMethod: 'upi',
    freelancerPayoutId: 'pay_fl_01',
    freelancerId: 'free_sameer_khan_01',
    freelancerName: 'Sameer Khan',
    projectId: 'proj_nexora_3d_01',
    projectTitle: 'Nexora 3D Visualizer & Brand Commercial',
    notes: 'Subcontracted video editing work for Nexora campaign',
    isDemo: true,
    createdAt: '2026-11-01T10:30:00.000Z'
  },
  {
    id: 'exp_04',
    title: 'Studio High-Speed Fiber Internet & Static IP (500 Mbps)',
    category: 'studio_equipment',
    amount: 2360,
    currency: 'INR',
    date: '2026-11-05',
    paymentMethod: 'upi',
    vendor: 'Airtel Xstream Fiber',
    isRecurring: true,
    recurringFrequency: 'monthly',
    taxDeductible: true,
    notes: 'Dedicated leased line for raw 4K footage cloud transfers',
    isDemo: true,
    createdAt: '2026-11-05T08:00:00.000Z'
  }
];

export const DEFAULT_INITIAL_REMINDERS: CrmReminder[] = [
  {
    id: 'rem_init_01',
    title: 'Follow-up with Priya Sharma on Nexora Brand Video rough cut feedback',
    type: 'lead_followup',
    targetDate: new Date().toISOString().split('T')[0],
    linkedEntityId: 'lead_seed_1',
    linkedEntityType: 'lead',
    priority: 'urgent',
    isCompleted: false,
    subtitle: 'Re: 3D Visualizer & Brand Identity Film',
    notes: 'Client reviewed preliminary cut on WhatsApp; check if color grade is approved.',
    isDemo: true,
    createdAt: '2026-11-14T10:00:00.000Z'
  },
  {
    id: 'rem_init_02',
    title: 'Collect Milestone Balance for RW-INV-2026-001 (Nexora Health Tech)',
    type: 'invoice_due',
    targetDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    linkedEntityId: 'inv_nx_01',
    linkedEntityType: 'invoice',
    priority: 'high',
    isCompleted: false,
    subtitle: 'Balance Due: ₹42,500',
    notes: 'Second milestone due upon 3D render master delivery.',
    isDemo: true,
    createdAt: '2026-11-12T09:00:00.000Z'
  },
  {
    id: 'rem_init_03',
    title: 'Milestone Review: Sameer Khan sound design track for Luxe Living',
    type: 'project_deadline',
    targetDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    linkedEntityId: 'proj_luxe_walkthrough_02',
    linkedEntityType: 'project',
    priority: 'high',
    isCompleted: false,
    subtitle: 'Milestone 3 Deliverable Review',
    notes: 'Coordinate with Sameer Khan on DaVinci audio track export and final mix.',
    isDemo: true,
    createdAt: '2026-11-13T11:30:00.000Z'
  },
  {
    id: 'rem_init_04',
    title: 'Send Commercial Proposal follow-up to FinPulse Advisory',
    type: 'lead_followup',
    targetDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    linkedEntityId: 'lead_seed_3',
    linkedEntityType: 'lead',
    priority: 'medium',
    isCompleted: false,
    subtitle: 'Proposal Ref: RW-QT-2026-003 (₹65,000)',
    notes: 'Follow up on pitch proposal sent via WhatsApp.',
    isDemo: true,
    createdAt: '2026-11-14T14:00:00.000Z'
  }
];

/**
 * Initialize CRM Storage:
 * 1. Read persistent local storage
 * 2. Asynchronously hydrate with verified Firestore inquiries
 */
export async function initCrmStorage(): Promise<void> {
  if (initialized) return;

  leads = safeGetLocal<CrmLead[]>(STORAGE_KEYS.LEADS, []);
  clients = safeGetLocal<CrmClient[]>(STORAGE_KEYS.CLIENTS, []);
  projects = safeGetLocal<CrmProject[]>(STORAGE_KEYS.PROJECTS, []);
  freelancers = safeGetLocal<CrmFreelancer[]>(STORAGE_KEYS.FREELANCERS, []);
  tasks = safeGetLocal<CrmTask[]>(STORAGE_KEYS.TASKS, []);
  quotations = safeGetLocal<CrmQuotation[]>(STORAGE_KEYS.QUOTATIONS, []);
  invoices = safeGetLocal<CrmInvoice[]>(STORAGE_KEYS.INVOICES, []);
  payments = safeGetLocal<CrmPayment[]>(STORAGE_KEYS.PAYMENTS, []);
  expenses = safeGetLocal<CrmExpense[]>(STORAGE_KEYS.EXPENSES, []);
  reminders = safeGetLocal<CrmReminder[]>(STORAGE_KEYS.REMINDERS, []);
  settings = safeGetLocal<CrmAgencySettings>(STORAGE_KEYS.SETTINGS, DEFAULT_CRM_SETTINGS);

  // Guarantee every cached seed record is unambiguously tagged with isDemo: true
  clients.forEach(c => { if (isRecordDemo(c, 'clients')) c.isDemo = true; });
  projects.forEach(p => { if (isRecordDemo(p, 'projects')) p.isDemo = true; });
  freelancers.forEach(f => { if (isRecordDemo(f, 'freelancers')) (f as any).isDemo = true; });
  tasks.forEach(t => { if (isRecordDemo(t, 'tasks')) t.isDemo = true; });
  quotations.forEach(q => { if (isRecordDemo(q, 'quotations')) q.isDemo = true; });
  invoices.forEach(i => { if (isRecordDemo(i, 'invoices')) i.isDemo = true; });
  payments.forEach(p => { if (isRecordDemo(p, 'payments')) p.isDemo = true; });
  expenses.forEach(e => { if (isRecordDemo(e, 'expenses')) e.isDemo = true; });
  reminders.forEach(r => { if (isRecordDemo(r, 'reminders')) (r as any).isDemo = true; });

  initialized = true;

  // Hydrate leads from Firestore in background
  try {
    const firestoreLeads = await fetchAllLeadsFromFirestore();
    if (firestoreLeads && firestoreLeads.length > 0) {
      let changed = false;
      firestoreLeads.forEach(fLead => {
        const localIdx = leads.findIndex(l =>
          (l.id && l.id === fLead.id) ||
          (l.sourceDocumentId && fLead.sourceDocumentId && l.sourceDocumentId === fLead.sourceDocumentId)
        );
        if (localIdx === -1) {
          leads.unshift({
            ...fLead,
            pipelineStage: fLead.pipelineStage || 'new',
            estimatedValue: fLead.estimatedValue || 0,
            isDemo: false
          });
          changed = true;
        } else {
          // Timestamp-based reconciliation: if Firestore document is newer, merge without overwriting
          const localTime = new Date(leads[localIdx].updatedAt || leads[localIdx].createdAt || 0).getTime();
          const remoteTime = new Date(fLead.updatedAt || fLead.createdAt || 0).getTime();
          if (remoteTime > localTime) {
            leads[localIdx] = {
              ...leads[localIdx],
              ...fLead,
              isDemo: false
            };
            changed = true;
          }
        }
      });

      if (changed) {
        safeSetLocal(STORAGE_KEYS.LEADS, leads);
        notifyListeners();
      }
    }
  } catch (err) {
    console.warn('Could not fetch Firestore leads during CRM store initialization:', err);
  }

  // Hydrate clients from Firestore in background if available
  try {
    const fsClients = await fetchClientsFromFirestore();
    if (fsClients && fsClients.length > 0) {
      let changed = false;
      fsClients.forEach(c => {
        const localIdx = clients.findIndex(cli => cli.id === c.id);
        if (localIdx === -1) {
          clients.push(c as CrmClient);
          changed = true;
        } else {
          // Timestamp-based reconciliation: if Firestore document is newer, merge
          const localTime = new Date(clients[localIdx].updatedAt || clients[localIdx].createdAt || 0).getTime();
          const remoteTime = new Date(c.updatedAt || c.createdAt || 0).getTime();
          if (remoteTime > localTime) {
            clients[localIdx] = {
              ...clients[localIdx],
              ...c
            };
            changed = true;
          }
        }
      });
      if (changed) {
        safeSetLocal(STORAGE_KEYS.CLIENTS, clients);
        notifyListeners();
      }
    }
  } catch {
    // offline/rule fallback
  }

  // Hydrate Projects from Firestore
  try {
    const fsProjects = await fetchProjectsFromFirestore();
    if (fsProjects && fsProjects.length > 0) {
      let changed = false;
      fsProjects.forEach(p => {
        const localIdx = projects.findIndex(item => item.id === p.id);
        if (localIdx === -1) {
          projects.push(p);
          changed = true;
        } else {
          const localTime = new Date(projects[localIdx].updatedAt || projects[localIdx].createdAt || 0).getTime();
          const remoteTime = new Date(p.updatedAt || p.createdAt || 0).getTime();
          if (remoteTime > localTime) {
            projects[localIdx] = { ...projects[localIdx], ...p };
            changed = true;
          }
        }
      });
      if (changed) {
        safeSetLocal(STORAGE_KEYS.PROJECTS, projects);
        notifyListeners();
      }
    }
  } catch { /* offline fallback */ }

  // Hydrate Freelancers from Firestore
  try {
    const fsFreelancers = await fetchFreelancersFromFirestore();
    if (fsFreelancers && fsFreelancers.length > 0) {
      let changed = false;
      fsFreelancers.forEach(f => {
        const localIdx = freelancers.findIndex(item => item.id === f.id);
        if (localIdx === -1) {
          freelancers.push(f);
          changed = true;
        } else {
          const localTime = new Date(freelancers[localIdx].updatedAt || freelancers[localIdx].createdAt || 0).getTime();
          const remoteTime = new Date(f.updatedAt || f.createdAt || 0).getTime();
          if (remoteTime > localTime) {
            freelancers[localIdx] = { ...freelancers[localIdx], ...f };
            changed = true;
          }
        }
      });
      if (changed) {
        safeSetLocal(STORAGE_KEYS.FREELANCERS, freelancers);
        notifyListeners();
      }
    }
  } catch { /* offline fallback */ }

  // Hydrate Tasks from Firestore
  try {
    const fsTasks = await fetchTasksFromFirestore();
    if (fsTasks && fsTasks.length > 0) {
      let changed = false;
      fsTasks.forEach(t => {
        const localIdx = tasks.findIndex(item => item.id === t.id);
        if (localIdx === -1) {
          tasks.push(t);
          changed = true;
        } else {
          const localTime = new Date(tasks[localIdx].updatedAt || tasks[localIdx].createdAt || 0).getTime();
          const remoteTime = new Date(t.updatedAt || t.createdAt || 0).getTime();
          if (remoteTime > localTime) {
            tasks[localIdx] = { ...tasks[localIdx], ...t };
            changed = true;
          }
        }
      });
      if (changed) {
        safeSetLocal(STORAGE_KEYS.TASKS, tasks);
        notifyListeners();
      }
    }
  } catch { /* offline fallback */ }

  // Hydrate Quotations from Firestore
  try {
    const fsQuotations = await fetchQuotationsFromFirestore();
    if (fsQuotations && fsQuotations.length > 0) {
      let changed = false;
      fsQuotations.forEach(q => {
        const localIdx = quotations.findIndex(item => item.id === q.id);
        if (localIdx === -1) {
          quotations.push(q);
          changed = true;
        } else {
          const localTime = new Date(quotations[localIdx].updatedAt || quotations[localIdx].createdAt || 0).getTime();
          const remoteTime = new Date(q.updatedAt || q.createdAt || 0).getTime();
          if (remoteTime > localTime) {
            quotations[localIdx] = { ...quotations[localIdx], ...q };
            changed = true;
          }
        }
      });
      if (changed) {
        safeSetLocal(STORAGE_KEYS.QUOTATIONS, quotations);
        notifyListeners();
      }
    }
  } catch { /* offline fallback */ }

  // Hydrate Invoices from Firestore
  try {
    const fsInvoices = await fetchInvoicesFromFirestore();
    if (fsInvoices && fsInvoices.length > 0) {
      let changed = false;
      fsInvoices.forEach(inv => {
        const localIdx = invoices.findIndex(item => item.id === inv.id);
        if (localIdx === -1) {
          invoices.push(inv);
          changed = true;
        } else {
          const localTime = new Date(invoices[localIdx].updatedAt || invoices[localIdx].createdAt || 0).getTime();
          const remoteTime = new Date(inv.updatedAt || inv.createdAt || 0).getTime();
          if (remoteTime > localTime) {
            invoices[localIdx] = { ...invoices[localIdx], ...inv };
            changed = true;
          }
        }
      });
      if (changed) {
        safeSetLocal(STORAGE_KEYS.INVOICES, invoices);
        notifyListeners();
      }
    }
  } catch { /* offline fallback */ }

  // Hydrate Payments from Firestore
  try {
    const fsPayments = await fetchPaymentsFromFirestore();
    if (fsPayments && fsPayments.length > 0) {
      let changed = false;
      fsPayments.forEach(p => {
        const localIdx = payments.findIndex(item => item.id === p.id);
        if (localIdx === -1) {
          payments.push(p);
          changed = true;
        } else {
          const localTime = new Date(payments[localIdx].updatedAt || payments[localIdx].createdAt || 0).getTime();
          const remoteTime = new Date(p.updatedAt || p.createdAt || 0).getTime();
          if (remoteTime > localTime) {
            payments[localIdx] = { ...payments[localIdx], ...p };
            changed = true;
          }
        }
      });
      if (changed) {
        safeSetLocal(STORAGE_KEYS.PAYMENTS, payments);
        notifyListeners();
      }
    }
  } catch { /* offline fallback */ }

  // Hydrate Expenses from Firestore
  try {
    const fsExpenses = await fetchExpensesFromFirestore();
    if (fsExpenses && fsExpenses.length > 0) {
      let changed = false;
      fsExpenses.forEach(exp => {
        const localIdx = expenses.findIndex(item => item.id === exp.id);
        if (localIdx === -1) {
          expenses.push(exp);
          changed = true;
        } else {
          const localTime = new Date(expenses[localIdx].updatedAt || expenses[localIdx].createdAt || 0).getTime();
          const remoteTime = new Date(exp.updatedAt || exp.createdAt || 0).getTime();
          if (remoteTime > localTime) {
            expenses[localIdx] = { ...expenses[localIdx], ...exp };
            changed = true;
          }
        }
      });
      if (changed) {
        safeSetLocal(STORAGE_KEYS.EXPENSES, expenses);
        notifyListeners();
      }
    }
  } catch { /* offline fallback */ }

  // Hydrate Reminders from Firestore
  try {
    const fsReminders = await fetchRemindersFromFirestore();
    if (fsReminders && fsReminders.length > 0) {
      let changed = false;
      fsReminders.forEach(rem => {
        const localIdx = reminders.findIndex(item => item.id === rem.id);
        if (localIdx === -1) {
          reminders.push(rem);
          changed = true;
        } else {
          reminders[localIdx] = { ...reminders[localIdx], ...rem };
          changed = true;
        }
      });
      if (changed) {
        safeSetLocal(STORAGE_KEYS.REMINDERS, reminders);
        notifyListeners();
      }
    }
  } catch { /* offline fallback */ }

  // Hydrate Settings from Firestore
  try {
    const fsSettings = await fetchCrmSettingsFromFirestore();
    if (fsSettings) {
      settings = { ...settings, ...fsSettings };
      safeSetLocal(STORAGE_KEYS.SETTINGS, settings);
      notifyListeners();
    }
  } catch { /* offline fallback */ }
}

// -------------------------------------------------------------
// PHONE NORMALIZATION & DUPLICATE DETECTION
// -------------------------------------------------------------
export function normalizePhoneNumber(phone?: string): string {
  if (!phone) return '';
  // Strip all non-digit characters
  let digits = phone.replace(/\D/g, '');
  // Strip leading 0
  if (digits.startsWith('0')) digits = digits.substring(1);
  // Strip leading 91 if full 12 digits (Indian country code)
  if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.substring(2);
  }
  return digits;
}

export function findDuplicateLead(
  phone?: string,
  email?: string,
  excludeLeadId?: string
): { isDuplicate: boolean; matchedLead?: CrmLead; reason?: string } {
  const normPhone = normalizePhoneNumber(phone);
  const normEmail = email ? email.trim().toLowerCase() : '';

  for (const lead of leads) {
    if (excludeLeadId && lead.id === excludeLeadId) continue;

    if (normPhone && lead.phone) {
      const existingPhone = normalizePhoneNumber(lead.phone);
      if (existingPhone && existingPhone === normPhone) {
        return {
          isDuplicate: true,
          matchedLead: lead,
          reason: `Phone number matches existing lead: ${lead.name} (${lead.status})`
        };
      }
    }

    if (normEmail && lead.email) {
      if (lead.email.trim().toLowerCase() === normEmail) {
        return {
          isDuplicate: true,
          matchedLead: lead,
          reason: `Email matches existing lead: ${lead.name} (${lead.status})`
        };
      }
    }
  }

  return { isDuplicate: false };
}

// -------------------------------------------------------------
// LEADS CRUD
// -------------------------------------------------------------
export function getStoredLeads(options?: { includeDemo?: boolean }): CrmLead[] {
  const includeDemo = options?.includeDemo ?? false;
  return leads.filter(l => includeDemo || !isRecordDemo(l, 'leads'));
}

export function saveStoredLead(lead: Partial<CrmLead> & { name: string; phone?: string; email?: string }): CrmLead {
  const now = new Date().toISOString();
  let existingIndex = -1;
  if (lead.id) {
    existingIndex = leads.findIndex(l => l.id === lead.id);
  }

  let finalLead: CrmLead;
  if (existingIndex >= 0) {
    const existing = leads[existingIndex];
    const initialActivities = existing.activities || [];
    
    // Track activity log if notes or status changed
    const activities = [...initialActivities];
    if (lead.status && lead.status !== existing.status) {
      activities.push({
        id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: 'status_change',
        content: `Status changed from ${existing.status} to ${lead.status}`,
        timestamp: now,
        author: 'Rohit Verma'
      });
    }
    if (lead.notes && lead.notes !== existing.notes) {
      activities.push({
        id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: 'note',
        content: lead.notes,
        timestamp: now,
        author: 'Rohit Verma'
      });
    }

    finalLead = {
      ...existing,
      ...lead,
      activities,
      createdAt: existing.createdAt || now
    };
    leads[existingIndex] = finalLead;

    // Asynchronously update in Firestore
    try {
      updateLeadCrmDataInFirestore(finalLead.id, {
        name: finalLead.name,
        phone: finalLead.phone,
        email: finalLead.email,
        businessName: finalLead.company || finalLead.businessName,
        service: finalLead.service,
        budget: finalLead.budget,
        budgetRange: finalLead.budgetRange || finalLead.budget,
        timeline: finalLead.timeline,
        status: finalLead.status,
        pipelineStage: finalLead.pipelineStage,
        priority: finalLead.priority,
        notes: finalLead.notes,
        followUpAt: finalLead.followUpAt || null,
        activities: finalLead.activities
      }, finalLead.sourceCollection, finalLead.sourceDocumentId);
    } catch (e) {
      console.warn('[CRM Storage] Firestore lead update notice:', e);
    }

  } else {
    const leadId = lead.id || `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const initialActivity = [{
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'note' as const,
      content: `Lead created via ${lead.source || 'manual entry'}`,
      timestamp: now,
      author: 'Rohit Verma'
    }];

    finalLead = {
      id: leadId,
      name: lead.name,
      email: lead.email || '',
      phone: lead.phone || '',
      service: lead.service || 'General Inquiry',
      message: lead.message || '',
      budget: lead.budget || '',
      budgetRange: lead.budgetRange || lead.budget || '',
      timeline: lead.timeline || '',
      company: lead.company || lead.businessName || '',
      businessName: lead.businessName || lead.company || '',
      status: lead.status || 'new',
      pipelineStage: lead.pipelineStage || 'new',
      priority: lead.priority || 'medium',
      estimatedValue: lead.estimatedValue || 0,
      createdAt: lead.createdAt || now,
      submittedAt: lead.submittedAt || lead.createdAt || now,
      source: lead.source || 'whatsapp',
      assignedTo: lead.assignedTo || 'Rohit Verma',
      followUpAt: lead.followUpAt || null,
      notes: lead.notes || '',
      activities: lead.activities || initialActivity
    };
    leads.unshift(finalLead);
  }

  safeSetLocal(STORAGE_KEYS.LEADS, leads);
  notifyListeners();
  return finalLead;
}

export function addLeadActivity(
  leadId: string,
  activity: { type: 'note' | 'status_change' | 'followup_set' | 'call' | 'whatsapp' | 'email'; content: string; author?: string }
): void {
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return;

  const newActivity = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: activity.type,
    content: activity.content,
    timestamp: new Date().toISOString(),
    author: activity.author || 'Rohit Verma'
  };

  lead.activities = [newActivity, ...(lead.activities || [])];
  safeSetLocal(STORAGE_KEYS.LEADS, leads);
  notifyListeners();

  try {
    updateLeadCrmDataInFirestore(leadId, { activities: lead.activities }, lead.sourceCollection, lead.sourceDocumentId);
  } catch (e) {
    // offline cache preserved
  }
}

export function updateLeadFollowUp(leadId: string, followUpDate: string | null, note?: string): void {
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return;

  lead.followUpAt = followUpDate;
  if (followUpDate) {
    lead.pipelineStage = 'follow_up';
    // Also add to reminders store
    saveStoredReminder({
      title: `Follow up with ${lead.name} (${lead.service})`,
      type: 'lead_followup',
      targetDate: followUpDate.split('T')[0],
      linkedEntityId: lead.id,
      linkedEntityType: 'lead',
      priority: (lead.priority as string) === 'urgent' || lead.priority === 'high' ? 'high' : 'medium',
      notes: note || `Follow-up regarding: ${lead.service}`
    });
  }

  addLeadActivity(leadId, {
    type: 'followup_set',
    content: followUpDate ? `Scheduled follow-up for ${new Date(followUpDate).toLocaleDateString()}${note ? ': ' + note : ''}` : 'Cleared follow-up date'
  });

  safeSetLocal(STORAGE_KEYS.LEADS, leads);
  notifyListeners();

  try {
    updateLeadCrmDataInFirestore(leadId, { followUpAt: followUpDate, pipelineStage: lead.pipelineStage }, lead.sourceCollection, lead.sourceDocumentId);
  } catch (e) {
    // offline cache preserved
  }
}

export function deleteStoredLead(id: string): boolean {
  const target = leads.find(l => l.id === id);
  const initialLen = leads.length;
  leads = leads.filter(l => l.id !== id);
  if (leads.length !== initialLen) {
    safeSetLocal(STORAGE_KEYS.LEADS, leads);
    notifyListeners();
    if (target?.sourceCollection) {
      try {
        deleteLeadFromFirestore(id, target.sourceCollection, target.sourceDocumentId);
      } catch (e) {
        // ignore
      }
    }
    return true;
  }
  return false;
}

export function updateLeadPipelineStage(id: string, stage: CrmLead['pipelineStage']): void {
  const lead = leads.find(l => l.id === id);
  if (lead) {
    lead.pipelineStage = stage;
    if (stage === 'won') lead.status = 'completed';
    safeSetLocal(STORAGE_KEYS.LEADS, leads);
    notifyListeners();
  }
}

// -------------------------------------------------------------
// CLIENTS CRUD
// -------------------------------------------------------------
// -------------------------------------------------------------
// CLIENTS CRUD & HELPERS
// -------------------------------------------------------------
export function getStoredClients(options?: { includeDemo?: boolean }): CrmClient[] {
  const includeDemo = options?.includeDemo ?? false;
  return clients.filter(c => includeDemo || !isRecordDemo(c, 'clients'));
}

export function findDuplicateClient(
  phone?: string,
  email?: string,
  excludeClientId?: string
): { isDuplicate: boolean; matchedClient?: CrmClient; reason?: string } {
  const normPhone = normalizePhoneNumber(phone);
  const normEmail = email ? email.trim().toLowerCase() : '';

  for (const client of clients) {
    if (excludeClientId && client.id === excludeClientId) continue;

    if (normPhone && client.phone) {
      const existingPhone = normalizePhoneNumber(client.phone);
      if (existingPhone && existingPhone === normPhone) {
        return {
          isDuplicate: true,
          matchedClient: client,
          reason: `Phone number matches existing client: ${client.name} (${client.company || 'Direct Client'})`
        };
      }
    }

    if (normEmail && client.email) {
      if (client.email.trim().toLowerCase() === normEmail) {
        return {
          isDuplicate: true,
          matchedClient: client,
          reason: `Email matches existing client: ${client.name}`
        };
      }
    }
  }

  return { isDuplicate: false };
}

export function saveStoredClient(client: Partial<CrmClient> & { name: string; email?: string }): CrmClient {
  const now = new Date().toISOString();
  let existingIndex = -1;
  if (client.id) {
    existingIndex = clients.findIndex(c => c.id === client.id);
  }

  let finalClient: CrmClient;
  if (existingIndex >= 0) {
    const existing = clients[existingIndex];
    const initialActivities = existing.activities || [];
    const activities = [...initialActivities];

    if (client.status && client.status !== existing.status) {
      activities.push({
        id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: 'status_change',
        content: `Client status changed from ${existing.status} to ${client.status}`,
        timestamp: now,
        author: 'Rohit Verma'
      });
    }

    finalClient = {
      ...existing,
      ...client,
      activities,
      createdAt: existing.createdAt || now
    };
    clients[existingIndex] = finalClient;
  } else {
    finalClient = {
      id: client.id || `cli_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: client.name,
      company: client.company || '',
      email: client.email || (client.phone ? `${normalizePhoneNumber(client.phone)}@client.rohitwork.in` : ''),
      phone: client.phone || '',
      status: client.status || 'active',
      totalProjects: client.totalProjects || 0,
      totalBilled: client.totalBilled || 0,
      totalPaid: client.totalPaid || 0,
      outstandingBalance: client.outstandingBalance || 0,
      currency: client.currency || settings.currency,
      tags: client.tags || [],
      notes: client.notes || '',
      address: client.address || '',
      leadSourceId: client.leadSourceId,
      originalLeadData: client.originalLeadData,
      activities: client.activities || [
        {
          id: `act_${Date.now()}`,
          type: 'note',
          content: 'Client profile created in CRM',
          timestamp: now,
          author: 'Rohit Verma'
        }
      ],
      createdAt: client.createdAt || now
    };
    clients.unshift(finalClient);
  }

  safeSetLocal(STORAGE_KEYS.CLIENTS, clients);
  notifyListeners();

  try {
    syncClientToFirestore(finalClient as unknown as Record<string, unknown>).catch(() => {});
  } catch {
    // Graceful offline/security-rule fallback
  }

  return finalClient;
}

export function addClientActivity(
  clientId: string,
  activity: { type: 'note' | 'status_change' | 'call' | 'whatsapp' | 'email' | 'meeting'; content: string; author?: string }
): void {
  const client = clients.find(c => c.id === clientId);
  if (!client) return;

  const newActivity = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: activity.type as any,
    content: activity.content,
    timestamp: new Date().toISOString(),
    author: activity.author || 'Rohit Verma'
  };

  client.activities = [newActivity, ...(client.activities || [])];
  client.updatedAt = new Date().toISOString();
  safeSetLocal(STORAGE_KEYS.CLIENTS, clients);
  notifyListeners();

  if (!isRecordDemo(client, 'clients')) {
    saveClientToFirestore(client).catch((err) => {
      console.warn('[CRM Storage] Could not sync client activity to Firestore:', err);
    });
  }
}

export function getClientRelatedData(clientId: string) {
  const clientProjects = projects.filter(p => p.clientId === clientId);
  const clientInvoices = invoices.filter(i => i.clientId === clientId);
  const clientPayments = payments.filter(p => p.clientId === clientId);
  const projectIds = new Set(clientProjects.map(p => p.id));
  const clientTasks = tasks.filter(t => projectIds.has(t.projectId));
  const clientQuotations = quotations.filter(q => q.clientId === clientId);

  const totalBilled = clientInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalPaid = clientPayments
    .filter(pay => pay.status === 'completed')
    .reduce((sum, pay) => sum + (pay.amount || 0), 0);
  const outstandingBalance = clientInvoices
    .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
    .reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);

  return {
    projects: clientProjects,
    invoices: clientInvoices,
    payments: clientPayments,
    tasks: clientTasks,
    quotations: clientQuotations,
    computed: {
      totalProjects: clientProjects.length,
      totalBilled,
      totalPaid,
      outstandingBalance
    }
  };
}

export function deleteStoredClient(id: string): boolean {
  const initialLen = clients.length;
  clients = clients.filter(c => c.id !== id);
  if (clients.length !== initialLen) {
    safeSetLocal(STORAGE_KEYS.CLIENTS, clients);
    notifyListeners();
    return true;
  }
  return false;
}

export function convertLeadToClient(lead: CrmLead): CrmClient {
  const emailFallback = lead.email && lead.email.trim() ? lead.email.trim() : (lead.phone ? `${normalizePhoneNumber(lead.phone)}@client.rohitwork.in` : '');
  const newClient = saveStoredClient({
    name: lead.name,
    email: emailFallback,
    phone: lead.phone || '',
    company: lead.company || lead.businessName || '',
    notes: `Converted from lead (${lead.service}). Original message: ${lead.message || 'N/A'}`,
    leadSourceId: lead.id,
    originalLeadData: {
      service: lead.service,
      budget: lead.budget || lead.budgetRange,
      source: lead.source,
      message: lead.message,
      submittedAt: lead.submittedAt || lead.createdAt
    },
    activities: [
      ...(lead.activities || []),
      {
        id: `act_${Date.now()}_conv`,
        type: 'status_change',
        content: `Converted to active Client "${lead.name}" from inquiry (${lead.service})`,
        timestamp: new Date().toISOString(),
        author: 'Rohit Verma'
      }
    ]
  });
  
  lead.convertedClientId = newClient.id;
  lead.pipelineStage = 'won';
  lead.status = 'completed';
  addLeadActivity(lead.id, {
    type: 'status_change',
    content: `Converted to active Client "${newClient.name}" (ID: ${newClient.id})`
  });
  saveStoredLead(lead);

  return newClient;
}

// -------------------------------------------------------------
// PROJECTS CRUD
// -------------------------------------------------------------
export function getStoredProjects(options?: { includeDemo?: boolean }): CrmProject[] {
  const includeDemo = options?.includeDemo ?? false;
  return projects.filter(p => includeDemo || !isRecordDemo(p, 'projects'));
}

export function saveStoredProject(project: Partial<CrmProject> & { title: string; clientId: string }): CrmProject {
  const now = new Date().toISOString();
  let existingIndex = -1;
  if (project.id) {
    existingIndex = projects.findIndex(p => p.id === project.id);
  }

  const linkedClient = clients.find(c => c.id === project.clientId);
  const clientName = linkedClient ? linkedClient.name : (project.clientName || 'General Client');

  let finalProject: CrmProject;
  if (existingIndex >= 0) {
    const prev = projects[existingIndex];
    const budget = project.budget !== undefined ? project.budget : (prev.budget || 0);
    const amountPaid = project.amountPaid !== undefined ? project.amountPaid : (prev.amountPaid || 0);
    const pendingBalance = Math.max(0, budget - amountPaid);
    const paymentStatus: 'pending' | 'partial' | 'paid' =
      pendingBalance === 0 && amountPaid > 0 ? 'paid' : amountPaid > 0 ? 'partial' : 'pending';

    const milestones = project.milestones || prev.milestones || [];
    let progress = project.progress !== undefined ? project.progress : prev.progress;
    if (project.status === 'completed') {
      progress = 100;
    } else if (milestones.length > 0) {
      const completedCount = milestones.filter(m => m.completed).length;
      progress = Math.round((completedCount / milestones.length) * 100);
    }

    finalProject = {
      ...prev,
      ...project,
      clientName,
      budget,
      amountPaid,
      pendingBalance,
      paymentStatus: project.paymentStatus || paymentStatus,
      progress,
      updatedAt: now
    };
    projects[existingIndex] = finalProject;
  } else {
    const budget = project.budget || 0;
    const amountPaid = project.amountPaid || 0;
    const pendingBalance = Math.max(0, budget - amountPaid);
    const paymentStatus: 'pending' | 'partial' | 'paid' =
      pendingBalance === 0 && amountPaid > 0 ? 'paid' : amountPaid > 0 ? 'partial' : 'pending';

    const initialMilestones: CrmProjectMilestone[] = project.milestones || [
      {
        id: `ms_${Date.now()}_1`,
        projectId: project.id || '',
        title: 'Project Brief & Scoping Approval',
        completed: false,
        order: 1
      },
      {
        id: `ms_${Date.now()}_2`,
        projectId: project.id || '',
        title: 'First Creative Cut / Wireframe Prototype',
        completed: false,
        order: 2
      },
      {
        id: `ms_${Date.now()}_3`,
        projectId: project.id || '',
        title: 'Revision Round & Color / UI Polish',
        completed: false,
        order: 3
      },
      {
        id: `ms_${Date.now()}_4`,
        projectId: project.id || '',
        title: 'Final Master Deliverable & Handover',
        completed: false,
        order: 4
      }
    ];

    const progress = project.status === 'completed' ? 100 : (project.progress || 0);

    finalProject = {
      id: project.id || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: project.title,
      clientId: project.clientId,
      clientName,
      serviceCategory: project.serviceCategory || 'Video Editing',
      description: project.description || '',
      status: project.status || 'in_progress',
      priority: project.priority || 'medium',
      startDate: project.startDate || now.split('T')[0],
      deadline: project.deadline || '',
      budget,
      amountPaid,
      pendingBalance,
      paymentStatus: project.paymentStatus || paymentStatus,
      progress,
      assignedFreelancerIds: project.assignedFreelancerIds || [],
      milestones: initialMilestones,
      deliverables: project.deliverables || [],
      activities: project.activities || [
        {
          id: `act_${Date.now()}_init`,
          type: 'system',
          description: `Project "${project.title}" created and assigned to ${clientName}`,
          timestamp: now,
          author: 'Rohit Verma (Admin)'
        }
      ],
      notes: project.notes || '',
      createdAt: project.createdAt || now,
      updatedAt: now
    };
    projects.unshift(finalProject);
  }

  safeSetLocal(STORAGE_KEYS.PROJECTS, projects);
  notifyListeners();
  if (!(finalProject as any).isDemo) {
    saveProjectToFirestore(finalProject).catch(err => console.warn('[Cloud Sync Project Error]:', err));
  }
  return finalProject;
}

export function deleteStoredProject(id: string): boolean {
  const initialLen = projects.length;
  projects = projects.filter(p => p.id !== id);
  if (projects.length !== initialLen) {
    safeSetLocal(STORAGE_KEYS.PROJECTS, projects);
    notifyListeners();
    deleteProjectFromCloud(id).catch(() => {});
    return true;
  }
  return false;
}

export function toggleProjectMilestone(projectId: string, milestoneId: string): CrmProject | null {
  const pIndex = projects.findIndex(p => p.id === projectId);
  if (pIndex === -1) return null;

  const current = projects[pIndex];
  const now = new Date().toISOString();
  const milestones = (current.milestones || []).map(m => {
    if (m.id === milestoneId) {
      const nextCompleted = !m.completed;
      return {
        ...m,
        completed: nextCompleted,
        completedAt: nextCompleted ? now : undefined
      };
    }
    return m;
  });

  const completedCount = milestones.filter(m => m.completed).length;
  const newProgress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : current.progress;

  const toggledMilestone = milestones.find(m => m.id === milestoneId);
  const milestoneActivity: CrmLeadActivity = {
    id: `act_${Date.now()}_ms`,
    type: 'note',
    description: `Milestone "${toggledMilestone?.title}" marked ${toggledMilestone?.completed ? 'COMPLETED' : 'PENDING'}`,
    timestamp: now,
    author: 'Rohit Verma (Admin)'
  };

  projects[pIndex] = {
    ...current,
    milestones,
    progress: newProgress,
    status: newProgress === 100 ? 'completed' : current.status === 'completed' ? 'in_progress' : current.status,
    activities: [milestoneActivity, ...(current.activities || [])],
    updatedAt: now
  };

  safeSetLocal(STORAGE_KEYS.PROJECTS, projects);
  notifyListeners();

  if (!isRecordDemo(projects[pIndex], 'projects')) {
    saveProjectToFirestore(projects[pIndex]).catch((err) => {
      console.warn('[CRM Storage] Could not sync project milestone to Firestore:', err);
    });
  }
  return projects[pIndex];
}

export function addProjectMilestone(
  projectId: string,
  milestoneData: Omit<CrmProjectMilestone, 'id' | 'completed' | 'completedAt' | 'projectId'>
): CrmProject | null {
  const pIndex = projects.findIndex(p => p.id === projectId);
  if (pIndex === -1) return null;

  const current = projects[pIndex];
  const now = new Date().toISOString();
  const newMilestone: CrmProjectMilestone = {
    id: `ms_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    projectId,
    completed: false,
    ...milestoneData
  };

  const milestones = [...(current.milestones || []), newMilestone];
  const completedCount = milestones.filter(m => m.completed).length;
  const newProgress = Math.round((completedCount / milestones.length) * 100);

  projects[pIndex] = {
    ...current,
    milestones,
    progress: newProgress,
    updatedAt: now
  };

  safeSetLocal(STORAGE_KEYS.PROJECTS, projects);
  notifyListeners();

  if (!isRecordDemo(projects[pIndex], 'projects')) {
    saveProjectToFirestore(projects[pIndex]).catch((err) => {
      console.warn('[CRM Storage] Could not sync project milestone to Firestore:', err);
    });
  }
  return projects[pIndex];
}

export function addProjectDeliverable(
  projectId: string,
  deliverableData: Omit<CrmProjectDeliverable, 'id' | 'submittedAt' | 'projectId'>
): CrmProject | null {
  const pIndex = projects.findIndex(p => p.id === projectId);
  if (pIndex === -1) return null;

  const current = projects[pIndex];
  const now = new Date().toISOString();
  const newDeliverable: CrmProjectDeliverable = {
    id: `del_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    projectId,
    submittedAt: now,
    ...deliverableData
  };

  const deliverableActivity: CrmLeadActivity = {
    id: `act_${Date.now()}_del`,
    type: 'note',
    description: `Deliverable recorded (Round ${deliverableData.revisionRound}): ${deliverableData.title} - ${deliverableData.url}`,
    timestamp: now,
    author: deliverableData.submittedBy || 'Rohit Verma (Admin)'
  };

  projects[pIndex] = {
    ...current,
    deliverables: [newDeliverable, ...(current.deliverables || [])],
    activities: [deliverableActivity, ...(current.activities || [])],
    updatedAt: now
  };

  safeSetLocal(STORAGE_KEYS.PROJECTS, projects);
  notifyListeners();

  if (!isRecordDemo(projects[pIndex], 'projects')) {
    saveProjectToFirestore(projects[pIndex]).catch((err) => {
      console.warn('[CRM Storage] Could not sync project milestone to Firestore:', err);
    });
  }
  return projects[pIndex];
}

export function addProjectActivity(
  projectId: string,
  activityData: Omit<CrmLeadActivity, 'id' | 'timestamp'>
): CrmProject | null {
  const pIndex = projects.findIndex(p => p.id === projectId);
  if (pIndex === -1) return null;

  const current = projects[pIndex];
  const now = new Date().toISOString();
  const newActivity: CrmLeadActivity = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    ...activityData
  };

  projects[pIndex] = {
    ...current,
    activities: [newActivity, ...(current.activities || [])],
    updatedAt: now
  };

  safeSetLocal(STORAGE_KEYS.PROJECTS, projects);
  notifyListeners();

  if (!isRecordDemo(projects[pIndex], 'projects')) {
    saveProjectToFirestore(projects[pIndex]).catch((err) => {
      console.warn('[CRM Storage] Could not sync project milestone to Firestore:', err);
    });
  }
  return projects[pIndex];
}

export function recordProjectPayment(
  projectId: string,
  amount: number,
  notes?: string
): CrmProject | null {
  const pIndex = projects.findIndex(p => p.id === projectId);
  if (pIndex === -1) return null;

  const current = projects[pIndex];
  const now = new Date().toISOString();
  const newAmountPaid = (current.amountPaid || 0) + amount;
  const newBalance = Math.max(0, current.budget - newAmountPaid);
  const paymentStatus: 'pending' | 'partial' | 'paid' =
    newBalance === 0 && newAmountPaid > 0 ? 'paid' : newAmountPaid > 0 ? 'partial' : 'pending';

  const payActivity: CrmLeadActivity = {
    id: `act_${Date.now()}_pay`,
    type: 'note',
    description: `Payment received: ₹${amount.toLocaleString('en-IN')}${notes ? ` (${notes})` : ''}`,
    timestamp: now,
    author: 'Rohit Verma (Admin)'
  };

  projects[pIndex] = {
    ...current,
    amountPaid: newAmountPaid,
    pendingBalance: newBalance,
    paymentStatus,
    activities: [payActivity, ...(current.activities || [])],
    updatedAt: now
  };

  safeSetLocal(STORAGE_KEYS.PROJECTS, projects);
  notifyListeners();

  if (!isRecordDemo(projects[pIndex], 'projects')) {
    saveProjectToFirestore(projects[pIndex]).catch((err) => {
      console.warn('[CRM Storage] Could not sync project milestone to Firestore:', err);
    });
  }
  return projects[pIndex];
}

export function getProjectRelatedData(projectId: string) {
  const project = projects.find(p => p.id === projectId);
  if (!project) return null;

  const client = clients.find(c => c.id === project.clientId);
  const assignedFreelancers = freelancers.filter(f => project.assignedFreelancerIds?.includes(f.id));
  const linkedTasks = tasks.filter(t => t.projectId === projectId);
  const milestones = project.milestones || [];
  const deliverables = project.deliverables || [];

  const completedMilestones = milestones.filter(m => m.completed).length;
  const totalMilestones = milestones.length;
  const pendingDeliverables = deliverables.filter(d => d.status === 'pending_review').length;

  return {
    project,
    client,
    assignedFreelancers,
    linkedTasks,
    milestones,
    deliverables,
    computed: {
      totalMilestones,
      completedMilestones,
      progressPercentage: totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : project.progress,
      budget: project.budget,
      amountPaid: project.amountPaid,
      pendingBalance: project.pendingBalance ?? Math.max(0, project.budget - project.amountPaid),
      paymentStatus: project.paymentStatus || (project.budget === project.amountPaid ? 'paid' : project.amountPaid > 0 ? 'partial' : 'pending'),
      pendingDeliverablesCount: pendingDeliverables
    }
  };
}

// -------------------------------------------------------------
// FREELANCERS CRUD (ADMIN ONLY - NO LOGIN)
// -------------------------------------------------------------
export function getStoredFreelancers(options?: { includeDemo?: boolean }): CrmFreelancer[] {
  const includeDemo = options?.includeDemo ?? false;
  return freelancers.filter(f => includeDemo || !isRecordDemo(f, 'freelancers'));
}

export function findDuplicateFreelancer(
  phone?: string,
  email?: string,
  excludeFreelancerId?: string
): { isDuplicate: boolean; matchedFreelancer?: CrmFreelancer; reason?: string } {
  const normPhone = normalizePhoneNumber(phone);
  const normEmail = email ? email.trim().toLowerCase() : '';

  for (const f of freelancers) {
    if (excludeFreelancerId && f.id === excludeFreelancerId) continue;

    if (normPhone && f.phone) {
      const existingPhone = normalizePhoneNumber(f.phone);
      if (existingPhone && existingPhone === normPhone) {
        return {
          isDuplicate: true,
          matchedFreelancer: f,
          reason: `Phone number matches existing freelancer: ${f.name} (${f.specialty || 'Creative Specialist'})`
        };
      }
    }

    if (normEmail && f.email) {
      if (f.email.trim().toLowerCase() === normEmail) {
        return {
          isDuplicate: true,
          matchedFreelancer: f,
          reason: `Email matches existing freelancer: ${f.name}`
        };
      }
    }
  }

  return { isDuplicate: false };
}

export function saveStoredFreelancer(freelancer: Partial<CrmFreelancer> & { name: string; phone: string }): CrmFreelancer {
  const now = new Date().toISOString();
  let existingIndex = -1;
  if (freelancer.id) {
    existingIndex = freelancers.findIndex(f => f.id === freelancer.id);
  }

  let finalFreelancer: CrmFreelancer;
  if (existingIndex >= 0) {
    const prev = freelancers[existingIndex];
    const agreed = freelancer.agreedAmount !== undefined ? freelancer.agreedAmount : (prev.agreedAmount || 0);
    const paid = freelancer.paidAmount !== undefined ? freelancer.paidAmount : (prev.paidAmount || 0);
    const balance = Math.max(0, agreed - paid);
    const pStatus: 'pending' | 'partial' | 'paid' = balance === 0 && paid > 0 ? 'paid' : paid > 0 ? 'partial' : 'pending';

    finalFreelancer = {
      ...prev,
      ...freelancer,
      agreedAmount: agreed,
      paidAmount: paid,
      pendingBalance: balance,
      paymentStatus: freelancer.paymentStatus || pStatus,
      paymentPending: balance,
      paymentPaidTotal: paid,
      updatedAt: now
    };
    freelancers[existingIndex] = finalFreelancer;
  } else {
    const agreed = freelancer.agreedAmount || 0;
    const paid = freelancer.paidAmount || 0;
    const balance = Math.max(0, agreed - paid);
    const pStatus: 'pending' | 'partial' | 'paid' = balance === 0 && paid > 0 ? 'paid' : paid > 0 ? 'partial' : 'pending';

    finalFreelancer = {
      id: freelancer.id || `free_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: freelancer.name,
      email: freelancer.email || '',
      phone: freelancer.phone,
      whatsapp: freelancer.whatsapp || normalizePhoneNumber(freelancer.phone) || freelancer.phone,
      specialty: freelancer.specialty || 'Creative Specialist',
      skills: freelancer.skills && freelancer.skills.length > 0 ? freelancer.skills : ['Video Editing'],
      portfolioUrl: freelancer.portfolioUrl || '',
      status: freelancer.status || 'available',
      hourlyRate: freelancer.hourlyRate || 0,
      fixedRateDefault: freelancer.fixedRateDefault || 0,
      agreedAmount: agreed,
      paidAmount: paid,
      pendingBalance: balance,
      paymentStatus: freelancer.paymentStatus || pStatus,
      paymentMethod: freelancer.paymentMethod || '',
      paymentDetails: freelancer.paymentDetails || '',
      payoutHistory: freelancer.payoutHistory || [],
      submissions: freelancer.submissions || [],
      revisionsRecordedCount: freelancer.revisionsRecordedCount || 0,
      activeProjectsCount: freelancer.activeProjectsCount || 0,
      completedProjectsCount: freelancer.completedProjectsCount || 0,
      rating: freelancer.rating || 5,
      paymentPending: balance,
      paymentPaidTotal: paid,
      notes: freelancer.notes || '',
      activities: freelancer.activities || [
        {
          id: `act_${Date.now()}`,
          type: 'system',
          description: `Freelancer record created for ${freelancer.name}`,
          timestamp: now,
          author: 'Rohit Verma (Admin)'
        }
      ],
      createdAt: freelancer.createdAt || now,
      updatedAt: now
    };
    freelancers.unshift(finalFreelancer);
  }

  safeSetLocal(STORAGE_KEYS.FREELANCERS, freelancers);
  notifyListeners();
  if (!(finalFreelancer as any).isDemo) {
    saveFreelancerToFirestore(finalFreelancer).catch(err => console.warn('[Cloud Sync Freelancer Error]:', err));
  }
  return finalFreelancer;
}

export function deleteStoredFreelancer(id: string): boolean {
  const initialLen = freelancers.length;
  freelancers = freelancers.filter(f => f.id !== id);
  if (freelancers.length !== initialLen) {
    safeSetLocal(STORAGE_KEYS.FREELANCERS, freelancers);
    notifyListeners();
    deleteFreelancerFromCloud(id).catch(() => {});
    return true;
  }
  return false;
}

export function addFreelancerActivity(
  freelancerId: string,
  activity: Omit<CrmLeadActivity, 'id' | 'timestamp'>
): CrmFreelancer | null {
  const fIndex = freelancers.findIndex(f => f.id === freelancerId);
  if (fIndex === -1) return null;

  const now = new Date().toISOString();
  const newActivity: CrmLeadActivity = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    ...activity
  };

  const updatedActivities = [newActivity, ...(freelancers[fIndex].activities || [])];
  freelancers[fIndex] = {
    ...freelancers[fIndex],
    activities: updatedActivities,
    updatedAt: now
  };

  safeSetLocal(STORAGE_KEYS.FREELANCERS, freelancers);
  notifyListeners();
  if (!freelancers[fIndex].isDemo) {
    saveFreelancerToFirestore(freelancers[fIndex]).catch(err => console.warn('[Cloud Sync Freelancer Activity Error]:', err));
  }
  return freelancers[fIndex];
}

export function addFreelancerPayout(
  freelancerId: string,
  payoutData: Omit<CrmFreelancerPayout, 'id' | 'date' | 'freelancerId'>
): CrmFreelancer | null {
  const fIndex = freelancers.findIndex(f => f.id === freelancerId);
  if (fIndex === -1) return null;

  const now = new Date().toISOString();
  const newPayout: CrmFreelancerPayout = {
    id: `payout_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    freelancerId,
    date: now,
    ...payoutData
  };

  const current = freelancers[fIndex];
  const newPaidAmount = (current.paidAmount || 0) + payoutData.amount;
  const agreed = current.agreedAmount || 0;
  const newBalance = Math.max(0, agreed - newPaidAmount);
  const newPaymentStatus: 'pending' | 'partial' | 'paid' =
    newBalance === 0 && newPaidAmount > 0 ? 'paid' : newPaidAmount > 0 ? 'partial' : 'pending';

  const payoutActivity: CrmLeadActivity = {
    id: `act_${Date.now()}_pay`,
    type: 'note',
    description: `Recorded payout of ₹${payoutData.amount.toLocaleString('en-IN')} via ${payoutData.method}${payoutData.referenceId ? ` (Ref: ${payoutData.referenceId})` : ''}`,
    timestamp: now,
    author: payoutData.recordedBy || 'Rohit Verma (Admin)'
  };

  freelancers[fIndex] = {
    ...current,
    paidAmount: newPaidAmount,
    pendingBalance: newBalance,
    paymentStatus: newPaymentStatus,
    paymentPending: newBalance,
    paymentPaidTotal: newPaidAmount,
    payoutHistory: [newPayout, ...(current.payoutHistory || [])],
    activities: [payoutActivity, ...(current.activities || [])],
    updatedAt: now
  };

  safeSetLocal(STORAGE_KEYS.FREELANCERS, freelancers);
  notifyListeners();
  if (!freelancers[fIndex].isDemo) {
    saveFreelancerToFirestore(freelancers[fIndex]).catch(err => console.warn('[Cloud Sync Freelancer Payout Error]:', err));
  }
  return freelancers[fIndex];
}

export function addFreelancerSubmission(
  freelancerId: string,
  submissionData: Omit<CrmFreelancerSubmission, 'id' | 'submittedAt' | 'freelancerId'>
): CrmFreelancer | null {
  const fIndex = freelancers.findIndex(f => f.id === freelancerId);
  if (fIndex === -1) return null;

  const now = new Date().toISOString();
  const newSub: CrmFreelancerSubmission = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    freelancerId,
    submittedAt: now,
    ...submissionData
  };

  const current = freelancers[fIndex];
  const maxRevision = Math.max(current.revisionsRecordedCount || 0, submissionData.revisionRound || 1);

  const subActivity: CrmLeadActivity = {
    id: `act_${Date.now()}_sub`,
    type: 'note',
    description: `Work submission recorded (Round ${submissionData.revisionRound}): ${submissionData.taskTitle || 'Deliverable'} - ${submissionData.url}`,
    timestamp: now,
    author: 'Rohit Verma (Admin)'
  };

  freelancers[fIndex] = {
    ...current,
    revisionsRecordedCount: maxRevision,
    submissions: [newSub, ...(current.submissions || [])],
    activities: [subActivity, ...(current.activities || [])],
    updatedAt: now
  };

  safeSetLocal(STORAGE_KEYS.FREELANCERS, freelancers);
  notifyListeners();
  if (!freelancers[fIndex].isDemo) {
    saveFreelancerToFirestore(freelancers[fIndex]).catch(err => console.warn('[Cloud Sync Freelancer Submission Error]:', err));
  }
  return freelancers[fIndex];
}

export function getFreelancerRelatedData(freelancerId: string) {
  const fProjects = projects.filter(p => p.assignedFreelancerIds?.includes(freelancerId));
  const fTasks = tasks.filter(t => t.assignedFreelancerId === freelancerId);
  const targetFreelancer = freelancers.find(f => f.id === freelancerId);
  const fPayouts = targetFreelancer?.payoutHistory || [];
  const fSubmissions = targetFreelancer?.submissions || [];

  const agreedAmount = targetFreelancer?.agreedAmount || 0;
  const paidAmount = targetFreelancer?.paidAmount || 0;
  const pendingBalance = targetFreelancer?.pendingBalance ?? Math.max(0, agreedAmount - paidAmount);

  return {
    projects: fProjects,
    tasks: fTasks,
    payouts: fPayouts,
    submissions: fSubmissions,
    computed: {
      totalAssignedProjects: fProjects.length,
      activeProjectsCount: fProjects.filter(p => p.status === 'in_progress').length,
      totalAssignedTasks: fTasks.length,
      pendingTasksCount: fTasks.filter(t => t.status !== 'completed').length,
      completedTasksCount: fTasks.filter(t => t.status === 'completed').length,
      agreedAmount,
      paidAmount,
      pendingBalance,
      paymentStatus: targetFreelancer?.paymentStatus || (pendingBalance === 0 && paidAmount > 0 ? 'paid' : paidAmount > 0 ? 'partial' : 'pending'),
      revisionsRecordedCount: fSubmissions.reduce((acc, sub) => Math.max(acc, sub.revisionRound || 0), targetFreelancer?.revisionsRecordedCount || 0)
    }
  };
}

// -------------------------------------------------------------
// TASKS CRUD
// -------------------------------------------------------------
export function getStoredTasks(options?: { includeDemo?: boolean }): CrmTask[] {
  const includeDemo = options?.includeDemo ?? false;
  return tasks.filter(t => includeDemo || !isRecordDemo(t, 'tasks'));
}

export function saveStoredTask(taskData: Partial<CrmTask> & { title: string }): CrmTask {
  const now = new Date().toISOString();
  let existingIndex = -1;
  if (taskData.id) {
    existingIndex = tasks.findIndex(t => t.id === taskData.id);
  }

  // Auto-resolve project & client names
  let projectTitle = taskData.projectTitle;
  let clientId = taskData.clientId;
  let clientName = taskData.clientName;
  if (taskData.projectId) {
    const matchedProject = projects.find(p => p.id === taskData.projectId);
    if (matchedProject) {
      projectTitle = matchedProject.title;
      if (!clientId) clientId = matchedProject.clientId;
      if (!clientName) clientName = matchedProject.clientName;
    }
  }

  // Auto-resolve freelancer name
  let assignedFreelancerName = taskData.assignedFreelancerName;
  if (taskData.assignedFreelancerId) {
    const matchedFreelancer = freelancers.find(f => f.id === taskData.assignedFreelancerId);
    if (matchedFreelancer) {
      assignedFreelancerName = matchedFreelancer.name;
    }
  }

  // Calculate progress from subtasks
  const subtasks = taskData.subtasks || (existingIndex >= 0 ? tasks[existingIndex].subtasks || [] : []);
  let progress = taskData.progress;
  if (subtasks.length > 0) {
    const completedCount = subtasks.filter(s => s.completed).length;
    progress = Math.round((completedCount / subtasks.length) * 100);
  } else if (progress === undefined) {
    progress = taskData.status === 'completed' ? 100 : 0;
  }

  let finalTask: CrmTask;
  if (existingIndex >= 0) {
    const prev = tasks[existingIndex];
    finalTask = {
      ...prev,
      ...taskData,
      projectTitle: projectTitle || prev.projectTitle,
      clientId: clientId || prev.clientId,
      clientName: clientName || prev.clientName,
      assignedFreelancerName: assignedFreelancerName || prev.assignedFreelancerName,
      subtasks,
      progress,
      updatedAt: now
    };
    tasks[existingIndex] = finalTask;
  } else {
    finalTask = {
      id: taskData.id || `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: taskData.title.trim(),
      description: taskData.description || '',
      projectId: taskData.projectId,
      projectTitle,
      clientId,
      clientName,
      assignedFreelancerId: taskData.assignedFreelancerId,
      assignedFreelancerName,
      priority: taskData.priority || 'medium',
      status: taskData.status || 'to_do',
      startDate: taskData.startDate || now.split('T')[0],
      dueDate: taskData.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      estimatedHours: taskData.estimatedHours || 0,
      actualHours: taskData.actualHours || 0,
      subtasks,
      progress,
      submissions: taskData.submissions || [],
      comments: taskData.comments || [],
      activities: [
        {
          id: `act_${Date.now()}_create`,
          type: 'status_change',
          description: `Task created: "${taskData.title.trim()}"`,
          timestamp: now,
          author: 'Rohit Verma (Admin)'
        }
      ],
      revisionRound: taskData.revisionRound || 0,
      notes: taskData.notes || '',
      createdAt: now,
      updatedAt: now
    };
    tasks.unshift(finalTask);
  }

  safeSetLocal(STORAGE_KEYS.TASKS, tasks);
  notifyListeners();
  if (!(finalTask as any).isDemo) {
    saveTaskToFirestore(finalTask).catch(err => console.warn('[Cloud Sync Task Error]:', err));
  }
  return finalTask;
}

export function updateTaskStatus(id: string, status: CrmTaskStatus): CrmTask | null {
  const task = tasks.find(t => t.id === id);
  if (!task) return null;

  const now = new Date().toISOString();
  const prevStatus = task.status;
  task.status = status;
  task.updatedAt = now;

  if (status === 'completed' && task.subtasks && task.subtasks.length > 0) {
    task.subtasks = task.subtasks.map(s => ({ ...s, completed: true, completedAt: now }));
    task.progress = 100;
  }

  if (!task.activities) task.activities = [];
  task.activities.unshift({
    id: `act_${Date.now()}_status`,
    type: 'status_change',
    description: `Status changed from ${prevStatus} to ${status}`,
    timestamp: now,
    author: 'Rohit Verma (Admin)'
  });

  safeSetLocal(STORAGE_KEYS.TASKS, tasks);
  notifyListeners();
  if (!task.isDemo) {
    saveTaskToFirestore(task).catch(err => console.warn('[Cloud Sync Task Status Error]:', err));
  }
  return task;
}

export function toggleTaskSubtask(taskId: string, subtaskId: string): CrmTask | null {
  const task = tasks.find(t => t.id === taskId);
  if (!task || !task.subtasks) return null;

  const sub = task.subtasks.find(s => s.id === subtaskId);
  if (!sub) return null;

  const now = new Date().toISOString();
  sub.completed = !sub.completed;
  sub.completedAt = sub.completed ? now : undefined;

  const completedCount = task.subtasks.filter(s => s.completed).length;
  task.progress = Math.round((completedCount / task.subtasks.length) * 100);
  task.updatedAt = now;

  // Auto-advance to completed if 100% and not blocked
  if (task.progress === 100 && task.status !== 'blocked') {
    task.status = 'completed';
  } else if (task.progress < 100 && task.status === 'completed') {
    task.status = 'in_progress';
  }

  safeSetLocal(STORAGE_KEYS.TASKS, tasks);
  notifyListeners();
  if (!task.isDemo) {
    saveTaskToFirestore(task).catch(err => console.warn('[Cloud Sync Task Subtask Error]:', err));
  }
  return task;
}

export function addTaskSubtask(taskId: string, title: string): CrmTask | null {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return null;

  if (!task.subtasks) task.subtasks = [];
  const newSubtask: CrmSubtask = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: title.trim(),
    completed: false
  };

  task.subtasks.push(newSubtask);
  const completedCount = task.subtasks.filter(s => s.completed).length;
  task.progress = Math.round((completedCount / task.subtasks.length) * 100);
  task.updatedAt = new Date().toISOString();

  safeSetLocal(STORAGE_KEYS.TASKS, tasks);
  notifyListeners();
  if (!task.isDemo) {
    saveTaskToFirestore(task).catch(err => console.warn('[Cloud Sync Add Subtask Error]:', err));
  }
  return task;
}

export function addTaskSubmission(
  taskId: string,
  submissionData: { url: string; notes?: string; revisionRound?: number; submittedBy?: string }
): CrmTask | null {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return null;

  const now = new Date().toISOString();
  const nextRound = submissionData.revisionRound ?? ((task.revisionRound || 0) + 1);

  if (!task.submissions) task.submissions = [];
  const newSubmission: CrmTaskSubmission = {
    id: `subm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    taskId,
    url: submissionData.url.trim(),
    notes: submissionData.notes?.trim() || undefined,
    revisionRound: nextRound,
    submittedAt: now,
    submittedBy: submissionData.submittedBy || task.assignedFreelancerName || 'Subcontractor',
    status: 'pending_review'
  };

  task.submissions.unshift(newSubmission);
  task.revisionRound = nextRound;
  task.status = 'in_review';
  task.updatedAt = now;

  if (!task.activities) task.activities = [];
  task.activities.unshift({
    id: `act_${Date.now()}_subm`,
    type: 'note',
    description: `Work submission uploaded (Round ${nextRound}): ${newSubmission.url}`,
    timestamp: now,
    author: 'Rohit Verma (Admin)'
  });

  safeSetLocal(STORAGE_KEYS.TASKS, tasks);
  notifyListeners();
  if (!task.isDemo) {
    saveTaskToFirestore(task).catch(err => console.warn('[Cloud Sync Task Submission Error]:', err));
  }
  return task;
}

export function addTaskComment(
  taskId: string,
  commentData: { content: string; authorEmail?: string; authorName?: string }
): CrmTask | null {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return null;

  const now = new Date().toISOString();
  if (!task.comments) task.comments = [];
  const newComment: CrmTaskComment = {
    id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    taskId,
    authorEmail: commentData.authorEmail || 'workall724038@gmail.com',
    authorName: commentData.authorName || 'Rohit Verma (Admin)',
    content: commentData.content.trim(),
    createdAt: now
  };

  task.comments.push(newComment);
  task.updatedAt = now;

  safeSetLocal(STORAGE_KEYS.TASKS, tasks);
  notifyListeners();
  if (!task.isDemo) {
    saveTaskToFirestore(task).catch(err => console.warn('[Cloud Sync Task Comment Error]:', err));
  }
  return task;
}

export function toggleTaskStatus(id: string): void {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.status = (task.status === 'completed' ? 'to_do' : 'completed') as CrmTaskStatus;
    task.updatedAt = new Date().toISOString();
    safeSetLocal(STORAGE_KEYS.TASKS, tasks);
    notifyListeners();
    if (!task.isDemo) {
      saveTaskToFirestore(task).catch(err => console.warn('[Cloud Sync Task Error]:', err));
    }
  }
}

export function deleteStoredTask(id: string): boolean {
  const initialLen = tasks.length;
  tasks = tasks.filter(t => t.id !== id);
  if (tasks.length !== initialLen) {
    safeSetLocal(STORAGE_KEYS.TASKS, tasks);
    notifyListeners();
    deleteTaskFromCloud(id).catch(() => {});
    return true;
  }
  return false;
}

export function getTaskRelatedData(taskId: string) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return null;

  const project = task.projectId ? projects.find(p => p.id === task.projectId) : undefined;
  const client = task.clientId ? clients.find(c => c.id === task.clientId) : (project ? clients.find(c => c.id === project.clientId) : undefined);
  const freelancer = task.assignedFreelancerId ? freelancers.find(f => f.id === task.assignedFreelancerId) : undefined;

  return {
    task,
    project,
    client,
    freelancer
  };
}

// -------------------------------------------------------------
// QUOTATIONS CRUD & FINANCIAL ARCHITECTURE
// -------------------------------------------------------------
export function calculateQuotationTotals(
  items: Array<{ quantity: number; unitPrice: number }>,
  discountPercentage = 0,
  additionalCharges = 0,
  isGstEnabled = false,
  taxPercentage = 0,
  advancePercentage = 50
) {
  const subtotal = items.reduce((sum, item) => {
    const q = Math.max(0, Number(item.quantity) || 0);
    const r = Math.max(0, Number(item.unitPrice) || 0);
    return sum + Math.round(q * r * 100) / 100;
  }, 0);

  const cleanDiscountPct = Math.max(0, Math.min(100, Number(discountPercentage) || 0));
  const discountAmount = Math.round(((subtotal * cleanDiscountPct) / 100) * 100) / 100;
  const afterDiscount = Math.max(0, subtotal - discountAmount);

  const cleanAdditional = Math.max(0, Number(additionalCharges) || 0);
  const taxableBase = afterDiscount + cleanAdditional;

  const cleanTaxPct = isGstEnabled ? Math.max(0, Number(taxPercentage) || 0) : 0;
  const taxAmount = isGstEnabled
    ? Math.round(((taxableBase * cleanTaxPct) / 100) * 100) / 100
    : 0;

  const total = Math.round((taxableBase + taxAmount) * 100) / 100;

  const cleanAdvancePct = Math.max(0, Math.min(100, Number(advancePercentage) || 50));
  const advanceAmount = Math.round(((total * cleanAdvancePct) / 100) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount,
    additionalCharges: cleanAdditional,
    taxAmount,
    total,
    totalAmount: total,
    advanceAmount
  };
}

export function getNextQuotationNumber(): string {
  let maxSeq = 0;
  quotations.forEach((q) => {
    const match = q.quotationNumber?.match(/RW-QT-\d{4}-(\d+)/);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (num > maxSeq) maxSeq = num;
    }
  });
  if (maxSeq === 0) maxSeq = quotations.length;
  return `RW-QT-2026-${(maxSeq + 1).toString().padStart(3, '0')}`;
}

export function getStoredQuotations(options?: { includeDemo?: boolean }): CrmQuotation[] {
  const includeDemo = options?.includeDemo ?? false;
  return quotations.filter(q => includeDemo || !isRecordDemo(q, 'quotations'));
}

export function saveStoredQuotation(
  quotationData: Partial<CrmQuotation> & { clientName: string }
): CrmQuotation {
  const now = new Date().toISOString();
  let existingIndex = -1;
  if (quotationData.id) {
    existingIndex = quotations.findIndex((q) => q.id === quotationData.id);
  }

  // Auto-resolve client data if clientId provided
  let clientCompany = quotationData.clientCompany;
  let clientEmail = quotationData.clientEmail;
  let clientPhone = quotationData.clientPhone;
  if (quotationData.clientId) {
    const matchedClient = clients.find((c) => c.id === quotationData.clientId);
    if (matchedClient) {
      if (!clientCompany) clientCompany = matchedClient.company;
      if (!clientEmail) clientEmail = matchedClient.email;
      if (!clientPhone) clientPhone = matchedClient.phone;
    }
  }

  // Auto-resolve project title if projectId provided
  let projectTitle = quotationData.projectTitle;
  if (quotationData.projectId) {
    const matchedProject = projects.find((p) => p.id === quotationData.projectId);
    if (matchedProject && !projectTitle) {
      projectTitle = matchedProject.title;
    }
  }

  // Ensure items have calculated amounts
  const items: CrmQuotationItem[] = (
    quotationData.items && quotationData.items.length > 0
      ? quotationData.items
      : [
          {
            id: 'item_1',
            description: 'Creative Design & Commercial Video Production',
            quantity: 1,
            unitPrice: 15000,
            amount: 15000
          }
        ]
  ).map((item, idx) => ({
    id: item.id || `item_${idx + 1}`,
    description: item.description.trim(),
    quantity: Math.max(1, Number(item.quantity) || 1),
    unitPrice: Math.max(0, Number(item.unitPrice) || 0),
    amount: Math.round(Math.max(1, Number(item.quantity) || 1) * Math.max(0, Number(item.unitPrice) || 0) * 100) / 100
  }));

  const isGstEnabled = Boolean(quotationData.isGstEnabled);
  const taxPercentage = isGstEnabled ? Number(quotationData.taxPercentage || 18) : 0;
  const advancePercentage = quotationData.advancePercentage ?? 50;

  const totals = calculateQuotationTotals(
    items,
    quotationData.discountPercentage || 0,
    quotationData.additionalCharges || 0,
    isGstEnabled,
    taxPercentage,
    advancePercentage
  );

  // Generate or preserve payment milestones
  let paymentMilestones = quotationData.paymentMilestones;
  if (!paymentMilestones || paymentMilestones.length === 0) {
    const remainingPct = 100 - advancePercentage;
    const remainingAmount = Math.round((totals.total - totals.advanceAmount) * 100) / 100;
    paymentMilestones = [
      {
        id: 'ms_1',
        label: `Advance Deposit upon Kickoff (${advancePercentage}%)`,
        percentage: advancePercentage,
        amount: totals.advanceAmount,
        completed: false
      },
      {
        id: 'ms_2',
        label: `Final Project Handover & Delivery (${remainingPct}%)`,
        percentage: remainingPct,
        amount: remainingAmount,
        completed: false
      }
    ];
  }

  const defaultTerms =
    '1. 50% advance deposit is required to schedule and commence production.\n2. Final deliverables, source files, and high-resolution master exports will be transferred upon full settlement of invoice.\n3. Client provides all brand assets, trademarks, and references in high resolution.';
  const defaultRevisionPolicy =
    '2 rounds of creative revisions are included at no additional charge. Subsequent revision rounds will be billed at ₹1,500/hour.';

  let finalQuotation: CrmQuotation;
  if (existingIndex >= 0) {
    const prev = quotations[existingIndex];
    finalQuotation = {
      ...prev,
      ...quotationData,
      quotationNumber: prev.quotationNumber || quotationData.quotationNumber || getNextQuotationNumber(),
      clientCompany,
      clientEmail: clientEmail || prev.clientEmail || '',
      clientPhone,
      projectTitle,
      items,
      subtotal: totals.subtotal,
      discountPercentage: quotationData.discountPercentage || 0,
      discountAmount: totals.discountAmount,
      additionalCharges: totals.additionalCharges,
      additionalChargesDescription: quotationData.additionalChargesDescription,
      isGstEnabled,
      taxPercentage,
      taxAmount: totals.taxAmount,
      total: totals.total,
      totalAmount: totals.total,
      advancePercentage,
      advanceAmount: totals.advanceAmount,
      paymentMilestones,
      currency: 'INR',
      terms: quotationData.terms || prev.terms || defaultTerms,
      revisionPolicy: quotationData.revisionPolicy || prev.revisionPolicy || defaultRevisionPolicy,
      updatedAt: now
    };
    quotations[existingIndex] = finalQuotation;
  } else {
    finalQuotation = {
      id: quotationData.id || `quote_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      quotationNumber: quotationData.quotationNumber || getNextQuotationNumber(),
      clientId: quotationData.clientId,
      clientName: quotationData.clientName.trim(),
      clientEmail: clientEmail || '',
      clientPhone: clientPhone || '',
      clientCompany: clientCompany || '',
      projectId: quotationData.projectId,
      projectTitle,
      issueDate: quotationData.issueDate || now.split('T')[0],
      validUntil:
        quotationData.validUntil ||
        new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      proposalScope: quotationData.proposalScope?.trim() || undefined,
      deliverablesSummary: quotationData.deliverablesSummary?.trim() || undefined,
      estimatedTimeline: quotationData.estimatedTimeline?.trim() || undefined,
      items,
      subtotal: totals.subtotal,
      discountPercentage: quotationData.discountPercentage || 0,
      discountAmount: totals.discountAmount,
      additionalCharges: totals.additionalCharges,
      additionalChargesDescription: quotationData.additionalChargesDescription,
      isGstEnabled,
      taxPercentage,
      taxAmount: totals.taxAmount,
      total: totals.total,
      totalAmount: totals.total,
      advancePercentage,
      advanceAmount: totals.advanceAmount,
      paymentMilestones,
      status: quotationData.status || 'draft',
      currency: 'INR',
      notes: quotationData.notes?.trim() || undefined,
      terms: quotationData.terms || defaultTerms,
      revisionPolicy: quotationData.revisionPolicy || defaultRevisionPolicy,
      activities: [
        {
          id: `act_${Date.now()}_create`,
          type: 'status_change',
          description: `Quotation created: ${quotationData.quotationNumber || 'New Quote'} for ${quotationData.clientName}`,
          timestamp: now,
          author: 'Rohit Verma (Admin)'
        }
      ],
      createdAt: now,
      updatedAt: now
    };
    quotations.unshift(finalQuotation);
  }

  safeSetLocal(STORAGE_KEYS.QUOTATIONS, quotations);
  notifyListeners();
  if (!(finalQuotation as any).isDemo) {
    saveQuotationToFirestore(finalQuotation).catch(err => console.warn('[Cloud Sync Quotation Error]:', err));
  }
  return finalQuotation;
}

export function duplicateStoredQuotation(id: string): CrmQuotation | null {
  const original = quotations.find((q) => q.id === id);
  if (!original) return null;

  const now = new Date().toISOString();
  const today = now.split('T')[0];
  const validUntil = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];

  const duplicated: CrmQuotation = {
    ...original,
    id: `quote_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    quotationNumber: getNextQuotationNumber(),
    status: 'draft',
    issueDate: today,
    validUntil,
    convertedToInvoiceId: undefined,
    convertedAt: undefined,
    activities: [
      {
        id: `act_${Date.now()}_dup`,
        type: 'status_change',
        description: `Duplicated from quotation ${original.quotationNumber}`,
        timestamp: now,
        author: 'Rohit Verma (Admin)'
      }
    ],
    createdAt: now,
    updatedAt: now
  };

  quotations.unshift(duplicated);
  safeSetLocal(STORAGE_KEYS.QUOTATIONS, quotations);
  notifyListeners();
  return duplicated;
}

export function updateQuotationStatus(
  id: string,
  status: CrmQuotationStatus
): CrmQuotation | null {
  const quotation = quotations.find((q) => q.id === id);
  if (!quotation) return null;

  const now = new Date().toISOString();
  const prevStatus = quotation.status;
  quotation.status = status;
  quotation.updatedAt = now;

  if (!quotation.activities) quotation.activities = [];
  quotation.activities.unshift({
    id: `act_${Date.now()}_status`,
    type: 'status_change',
    description: `Quotation status changed from ${prevStatus} to ${status}`,
    timestamp: now,
    author: 'Rohit Verma (Admin)'
  });

  safeSetLocal(STORAGE_KEYS.QUOTATIONS, quotations);
  notifyListeners();
  return quotation;
}

export function calculateInvoiceTotals(
  items: Array<{ quantity: number; unitPrice: number }>,
  discountPercentage = 0,
  additionalCharges = 0,
  isGstEnabled = false,
  taxPercentage = 0
) {
  const subtotal = items.reduce((sum, item) => {
    const q = Math.max(0, Number(item.quantity) || 0);
    const r = Math.max(0, Number(item.unitPrice) || 0);
    return sum + Math.round(q * r * 100) / 100;
  }, 0);

  const cleanDiscountPct = Math.max(0, Math.min(100, Number(discountPercentage) || 0));
  const discountAmount = Math.round(((subtotal * cleanDiscountPct) / 100) * 100) / 100;
  const afterDiscount = Math.max(0, subtotal - discountAmount);

  const cleanAdditional = Math.max(0, Number(additionalCharges) || 0);
  const taxableBase = afterDiscount + cleanAdditional;

  const cleanTaxPct = isGstEnabled ? Math.max(0, Number(taxPercentage) || 0) : 0;
  const taxAmount = isGstEnabled
    ? Math.round(((taxableBase * cleanTaxPct) / 100) * 100) / 100
    : 0;

  const total = Math.round((taxableBase + taxAmount) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount,
    additionalCharges: cleanAdditional,
    taxAmount,
    total,
    totalAmount: total
  };
}

export function getNextInvoiceNumber(): string {
  let maxSeq = 0;
  invoices.forEach((inv) => {
    const match = inv.invoiceNumber.match(/RW-INV-\d{4}-(\d+)/i) || inv.invoiceNumber.match(/RW-INV-(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxSeq) maxSeq = num;
    }
  });
  const nextSeq = (maxSeq + 1).toString().padStart(3, '0');
  const year = new Date().getFullYear();
  return `RW-INV-${year}-${nextSeq}`;
}

export function getNextPaymentReference(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `UPI/${dateStr}/${rand}`;
}

export function convertQuotationToInvoice(quotationId: string): CrmInvoice | null {
  const quotation = quotations.find((q) => q.id === quotationId);
  if (!quotation) return null;

  // Prevent duplicate invoice creation from repeated conversion
  if (quotation.convertedToInvoiceId) {
    const existing = invoices.find((i) => i.id === quotation.convertedToInvoiceId);
    if (existing) {
      return existing;
    }
  }

  const now = new Date().toISOString();
  const today = now.split('T')[0];
  const dueDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

  const invoiceItems = (quotation.items || []).map((it, idx) => ({
    id: `inv_item_${idx + 1}`,
    description: it.description,
    quantity: it.quantity,
    unitPrice: it.unitPrice,
    amount: it.amount
  }));

  const invoiceNumber = getNextInvoiceNumber();
  const totals = calculateInvoiceTotals(
    invoiceItems,
    quotation.discountPercentage || 0,
    quotation.additionalCharges || 0,
    quotation.isGstEnabled || false,
    quotation.taxPercentage || 0
  );

  const newInvoice: CrmInvoice = {
    id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    invoiceNumber,
    quotationId: quotation.id,
    quotationNumber: quotation.quotationNumber,
    clientId: quotation.clientId || '',
    clientName: quotation.clientName,
    clientCompany: quotation.clientCompany,
    clientEmail: quotation.clientEmail || '',
    clientPhone: quotation.clientPhone,
    projectId: quotation.projectId,
    projectTitle: quotation.projectTitle,
    issueDate: today,
    dueDate,
    items: invoiceItems,
    subtotal: totals.subtotal,
    discountPercentage: quotation.discountPercentage || 0,
    discountAmount: totals.discountAmount,
    additionalCharges: totals.additionalCharges,
    additionalChargesDescription: quotation.additionalChargesDescription,
    isGstEnabled: quotation.isGstEnabled || false,
    taxPercentage: quotation.taxPercentage || 0,
    taxAmount: totals.taxAmount,
    total: totals.total,
    totalAmount: totals.total,
    amountPaid: 0,
    balanceDue: totals.total,
    status: 'draft',
    paymentTerms: quotation.advancePercentage
      ? `${quotation.advancePercentage}% Advance Deposit Required, Balance on Delivery`
      : 'Net 15 Days from Invoice Date',
    currency: 'INR',
    bankDetails: (settings.isPaymentDetailsVerified && settings.bankDetails?.bankName && settings.bankDetails?.accountNumber)
      ? {
          bankName: settings.bankDetails.bankName.trim(),
          accountHolder: settings.bankDetails.accountName?.trim() || settings.ownerName || 'Rohit Verma',
          accountNumber: settings.bankDetails.accountNumber.trim(),
          ifsc: settings.bankDetails.ifsc?.trim() || '',
          upiId: settings.upiId?.trim() || ''
        }
      : undefined,
    notes: `Converted from Scope Proposal ${quotation.quotationNumber}. ${quotation.notes || ''}`.trim(),
    activities: [
      {
        id: `act_${Date.now()}_inv_create`,
        type: 'status_change',
        description: `Invoice created from accepted proposal ${quotation.quotationNumber}`,
        timestamp: now,
        author: 'Rohit Verma (Admin)'
      }
    ],
    createdAt: now
  };

  invoices.unshift(newInvoice);
  safeSetLocal(STORAGE_KEYS.INVOICES, invoices);

  quotation.status = 'accepted';
  quotation.convertedToInvoiceId = newInvoice.id;
  quotation.convertedAt = now;
  quotation.updatedAt = now;

  if (!quotation.activities) quotation.activities = [];
  quotation.activities.unshift({
    id: `act_${Date.now()}_conv`,
    type: 'status_change',
    description: `Converted to Invoice ${newInvoice.invoiceNumber}`,
    timestamp: now,
    author: 'Rohit Verma (Admin)'
  });

  safeSetLocal(STORAGE_KEYS.QUOTATIONS, quotations);
  notifyListeners();
  return newInvoice;
}

export function deleteStoredQuotation(id: string): boolean {
  const initialLen = quotations.length;
  quotations = quotations.filter((q) => q.id !== id);
  if (quotations.length !== initialLen) {
    safeSetLocal(STORAGE_KEYS.QUOTATIONS, quotations);
    notifyListeners();
    deleteQuotationFromCloud(id).catch(() => {});
    return true;
  }
  return false;
}

export function getQuotationRelatedData(quotationId: string) {
  const quotation = quotations.find((q) => q.id === quotationId);
  if (!quotation) return null;

  const client = quotation.clientId ? clients.find((c) => c.id === quotation.clientId) : undefined;
  const project = quotation.projectId ? projects.find((p) => p.id === quotation.projectId) : undefined;
  const convertedInvoice = quotation.convertedToInvoiceId
    ? invoices.find((i) => i.id === quotation.convertedToInvoiceId)
    : undefined;

  return {
    quotation,
    client,
    project,
    convertedInvoice
  };
}

// -------------------------------------------------------------
// INVOICES & RECONCILIATION CRUD
// -------------------------------------------------------------
export function getStoredInvoices(options?: { includeDemo?: boolean }): CrmInvoice[] {
  const includeDemo = options?.includeDemo ?? false;
  return invoices.filter(i => includeDemo || !isRecordDemo(i, 'invoices'));
}

export function reconcileInvoicePayments(invoiceId: string): void {
  const invoice = invoices.find((i) => i.id === invoiceId);
  if (!invoice) return;

  const linkedPayments = payments.filter(
    (p) =>
      p.invoiceId === invoiceId &&
      p.status === 'completed' &&
      p.paymentType !== 'freelancer_payout'
  );

  const totalPaid = linkedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  invoice.amountPaid = Math.round(totalPaid * 100) / 100;
  invoice.balanceDue = Math.max(0, Math.round((invoice.total - invoice.amountPaid) * 100) / 100);

  if (invoice.balanceDue === 0 && invoice.total > 0) {
    invoice.status = 'paid';
  } else if (invoice.amountPaid > 0) {
    invoice.status = 'partially_paid';
  } else if (invoice.status !== 'cancelled' && invoice.status !== 'draft') {
    const isOverdue = new Date(invoice.dueDate).getTime() < Date.now();
    invoice.status = isOverdue ? 'overdue' : 'sent';
  }

  invoice.updatedAt = new Date().toISOString();
  safeSetLocal(STORAGE_KEYS.INVOICES, invoices);
  notifyListeners();
  if (!invoice.isDemo) {
    saveInvoiceToFirestore(invoice).catch(err => console.warn('[Cloud Sync Reconcile Invoice Error]:', err));
  }

  // If invoice has a linked project, reconcile project
  if (invoice.projectId) {
    reconcileProjectFinancials(invoice.projectId);
  }
}

export function saveStoredInvoice(
  invoiceData: Partial<CrmInvoice> & { clientName: string }
): CrmInvoice {
  const now = new Date().toISOString();
  let existingIndex = -1;
  if (invoiceData.id) {
    existingIndex = invoices.findIndex((i) => i.id === invoiceData.id);
  }

  const items = invoiceData.items || [
    {
      id: '1',
      description: 'Creative Design & Video Deliverable',
      quantity: 1,
      unitPrice: 10000,
      amount: 10000
    }
  ];

  const totals = calculateInvoiceTotals(
    items,
    invoiceData.discountPercentage || 0,
    invoiceData.additionalCharges || 0,
    invoiceData.isGstEnabled || false,
    invoiceData.taxPercentage || 0
  );

  // Auto-resolve client info if missing
  let clientCompany = invoiceData.clientCompany;
  let clientEmail = invoiceData.clientEmail;
  let clientPhone = invoiceData.clientPhone;
  if (invoiceData.clientId) {
    const cl = clients.find((c) => c.id === invoiceData.clientId);
    if (cl) {
      if (!clientCompany) clientCompany = cl.company;
      if (!clientEmail) clientEmail = cl.email;
      if (!clientPhone) clientPhone = cl.phone;
    }
  }

  // Auto-resolve project title if missing
  let projectTitle = invoiceData.projectTitle;
  if (invoiceData.projectId && !projectTitle) {
    const pr = projects.find((p) => p.id === invoiceData.projectId);
    if (pr) projectTitle = pr.title;
  }

  let finalInvoice: CrmInvoice;
  if (existingIndex >= 0) {
    const prev = invoices[existingIndex];
    const amountPaid = prev.amountPaid || 0;
    const balanceDue = Math.max(0, Math.round((totals.total - amountPaid) * 100) / 100);

    finalInvoice = {
      ...prev,
      ...invoiceData,
      clientCompany,
      clientEmail: clientEmail || prev.clientEmail || '',
      clientPhone,
      projectTitle,
      items,
      subtotal: totals.subtotal,
      discountPercentage: invoiceData.discountPercentage || 0,
      discountAmount: totals.discountAmount,
      additionalCharges: totals.additionalCharges,
      additionalChargesDescription: invoiceData.additionalChargesDescription,
      isGstEnabled: invoiceData.isGstEnabled || false,
      taxPercentage: invoiceData.isGstEnabled ? (invoiceData.taxPercentage || 18) : 0,
      taxAmount: totals.taxAmount,
      total: totals.total,
      totalAmount: totals.total,
      amountPaid,
      balanceDue,
      status: invoiceData.status || (balanceDue === 0 ? 'paid' : amountPaid > 0 ? 'partially_paid' : 'sent'),
      updatedAt: now
    };
    invoices[existingIndex] = finalInvoice;
  } else {
    const invoiceNumber = invoiceData.invoiceNumber || getNextInvoiceNumber();
    const balanceDue = totals.total;

    finalInvoice = {
      id: invoiceData.id || `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      invoiceNumber,
      quotationId: invoiceData.quotationId,
      quotationNumber: invoiceData.quotationNumber,
      clientId: invoiceData.clientId || '',
      clientName: invoiceData.clientName.trim(),
      clientCompany: clientCompany || '',
      clientEmail: clientEmail || '',
      clientPhone: clientPhone || '',
      projectId: invoiceData.projectId,
      projectTitle,
      issueDate: invoiceData.issueDate || now.split('T')[0],
      dueDate:
        invoiceData.dueDate ||
        new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      items,
      subtotal: totals.subtotal,
      discountPercentage: invoiceData.discountPercentage || 0,
      discountAmount: totals.discountAmount,
      additionalCharges: totals.additionalCharges,
      additionalChargesDescription: invoiceData.additionalChargesDescription,
      isGstEnabled: invoiceData.isGstEnabled || false,
      taxPercentage: invoiceData.isGstEnabled ? (invoiceData.taxPercentage || 18) : 0,
      taxAmount: totals.taxAmount,
      total: totals.total,
      totalAmount: totals.total,
      amountPaid: 0,
      balanceDue,
      status: invoiceData.status || 'draft',
      paymentTerms: invoiceData.paymentTerms || 'Net 15 Days from Invoice Date',
      currency: 'INR',
      bankDetails: invoiceData.bankDetails || (
        (settings.isPaymentDetailsVerified && settings.bankDetails?.bankName && settings.bankDetails?.accountNumber)
          ? {
              bankName: settings.bankDetails.bankName.trim(),
              accountHolder: settings.bankDetails.accountName?.trim() || settings.ownerName || 'Rohit Verma',
              accountNumber: settings.bankDetails.accountNumber.trim(),
              ifsc: settings.bankDetails.ifsc?.trim() || '',
              upiId: settings.upiId?.trim() || ''
            }
          : undefined
      ),
      notes: invoiceData.notes || 'Thank you for partnering with RohitWork Creative Studios.',
      activities: [
        {
          id: `act_${Date.now()}_create`,
          type: 'status_change',
          description: `Invoice ${invoiceNumber} created for ${invoiceData.clientName}`,
          timestamp: now,
          author: 'Rohit Verma (Admin)'
        }
      ],
      createdAt: now
    };
    invoices.unshift(finalInvoice);
  }

  safeSetLocal(STORAGE_KEYS.INVOICES, invoices);
  notifyListeners();
  if (!(finalInvoice as any).isDemo) {
    saveInvoiceToFirestore(finalInvoice).catch(err => console.warn('[Cloud Sync Invoice Error]:', err));
  }
  return finalInvoice;
}

export function duplicateStoredInvoice(invoiceId: string): CrmInvoice | null {
  const original = invoices.find((i) => i.id === invoiceId);
  if (!original) return null;

  const now = new Date().toISOString();
  const today = now.split('T')[0];
  const newInvoiceNumber = getNextInvoiceNumber();

  const clonedItems = (original.items || []).map((it, idx) => ({
    ...it,
    id: `item_dup_${Date.now()}_${idx}`
  }));

  const cloned: CrmInvoice = {
    ...original,
    id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    invoiceNumber: newInvoiceNumber,
    issueDate: today,
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    items: clonedItems,
    amountPaid: 0,
    balanceDue: original.total,
    status: 'draft',
    isDemo: false,
    activities: [
      {
        id: `act_${Date.now()}_dup`,
        type: 'status_change',
        description: `Duplicated from invoice ${original.invoiceNumber}`,
        timestamp: now,
        author: 'Rohit Verma (Admin)'
      }
    ],
    createdAt: now,
    updatedAt: undefined
  };

  invoices.unshift(cloned);
  safeSetLocal(STORAGE_KEYS.INVOICES, invoices);
  notifyListeners();
  return cloned;
}

export function updateInvoiceStatus(
  invoiceId: string,
  newStatus: CrmInvoiceStatus
): CrmInvoice | null {
  const invoice = invoices.find((i) => i.id === invoiceId);
  if (!invoice) return null;

  invoice.status = newStatus;
  invoice.updatedAt = new Date().toISOString();
  safeSetLocal(STORAGE_KEYS.INVOICES, invoices);
  notifyListeners();
  if (!invoice.isDemo) {
    saveInvoiceToFirestore(invoice).catch((err) => console.warn('[Cloud Sync Invoice Status Error]:', err));
  }
  return invoice;
}

export function deleteStoredInvoice(id: string): boolean {
  const initialLen = invoices.length;
  invoices = invoices.filter((i) => i.id !== id);
  if (invoices.length !== initialLen) {
    safeSetLocal(STORAGE_KEYS.INVOICES, invoices);
    notifyListeners();
    deleteInvoiceFromCloud(id).catch(() => {});
    return true;
  }
  return false;
}

export function getInvoiceRelatedData(invoiceId: string) {
  const invoice = invoices.find((i) => i.id === invoiceId);
  if (!invoice) return null;

  const client = invoice.clientId ? clients.find((c) => c.id === invoice.clientId) : undefined;
  const project = invoice.projectId ? projects.find((p) => p.id === invoice.projectId) : undefined;
  const quotation = invoice.quotationId ? quotations.find((q) => q.id === invoice.quotationId) : undefined;
  const linkedPayments = payments.filter((p) => p.invoiceId === invoiceId);

  return {
    invoice,
    client,
    project,
    quotation,
    payments: linkedPayments
  };
}

// -------------------------------------------------------------
// CENTRALIZED PAYMENTS & PAYOUTS CRUD
// -------------------------------------------------------------
export function getStoredPayments(options?: { includeDemo?: boolean }): CrmPayment[] {
  const includeDemo = options?.includeDemo ?? false;
  return payments.filter(p => includeDemo || !isRecordDemo(p, 'payments'));
}

export function reconcileFreelancerPayouts(freelancerId: string): void {
  const freelancer = freelancers.find((f) => f.id === freelancerId);
  if (!freelancer) return;

  const linkedPayouts = payments.filter(
    (p) =>
      p.freelancerId === freelancerId &&
      p.paymentType === 'freelancer_payout' &&
      p.status === 'completed'
  );

  const totalPaidOut = linkedPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);
  freelancer.paidAmount = Math.round(totalPaidOut * 100) / 100;
  freelancer.pendingBalance = Math.max(
    0,
    Math.round(((freelancer.agreedAmount || 0) - freelancer.paidAmount) * 100) / 100
  );

  if (freelancer.pendingBalance === 0 && (freelancer.agreedAmount || 0) > 0) {
    freelancer.paymentStatus = 'paid';
  } else if (freelancer.paidAmount > 0) {
    freelancer.paymentStatus = 'partial';
  } else {
    freelancer.paymentStatus = 'pending';
  }

  (freelancer as any).updatedAt = new Date().toISOString();
  safeSetLocal(STORAGE_KEYS.FREELANCERS, freelancers);
  notifyListeners();
  if (!freelancer.isDemo) {
    saveFreelancerToFirestore(freelancer).catch((err) => console.warn('[Cloud Sync Freelancer Reconciliation Error]:', err));
  }
}

export function reconcileProjectFinancials(projectId: string): void {
  const project = projects.find((p) => p.id === projectId);
  if (!project) return;

  const linkedPayments = payments.filter(
    (p) =>
      p.projectId === projectId &&
      p.paymentType === 'client_payment' &&
      p.status === 'completed'
  );

  const totalReceived = linkedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  project.amountPaid = Math.round(totalReceived * 100) / 100;
  project.pendingBalance = Math.max(
    0,
    Math.round(((project.budget || 0) - project.amountPaid) * 100) / 100
  );

  if (project.pendingBalance === 0 && (project.budget || 0) > 0) {
    project.paymentStatus = 'paid';
  } else if (project.amountPaid > 0) {
    project.paymentStatus = 'partial';
  } else {
    project.paymentStatus = 'pending';
  }

  project.updatedAt = new Date().toISOString();
  safeSetLocal(STORAGE_KEYS.PROJECTS, projects);
  notifyListeners();
  if (!project.isDemo) {
    saveProjectToFirestore(project).catch((err) => console.warn('[Cloud Sync Project Financials Error]:', err));
  }
}

export function recordPayment(paymentData: Partial<CrmPayment> & { amount: number }): CrmPayment {
  const now = new Date().toISOString();
  const paymentType: CrmPaymentType = paymentData.paymentType || (paymentData.freelancerId ? 'freelancer_payout' : 'client_payment');

  let invoiceId = paymentData.invoiceId;
  let invoiceNumber = paymentData.invoiceNumber;
  let clientId = paymentData.clientId;
  let clientName = paymentData.clientName;
  let projectId = paymentData.projectId;
  let projectTitle = paymentData.projectTitle;

  if (invoiceId) {
    const linkedInvoice = invoices.find((i) => i.id === invoiceId);
    if (linkedInvoice) {
      invoiceNumber = linkedInvoice.invoiceNumber;
      if (!clientId) clientId = linkedInvoice.clientId;
      if (!clientName) clientName = linkedInvoice.clientName;
      if (!projectId) projectId = linkedInvoice.projectId;
      if (!projectTitle) projectTitle = linkedInvoice.projectTitle;
    }
  }

  let freelancerId = paymentData.freelancerId;
  let freelancerName = paymentData.freelancerName;
  if (freelancerId && !freelancerName) {
    const fl = freelancers.find((f) => f.id === freelancerId);
    if (fl) freelancerName = fl.name;
  }

  // Prevent duplicate transaction records if reference exists
  let transactionRef = paymentData.transactionRef?.trim();
  if (transactionRef) {
    const isDuplicate = payments.some(
      (p) =>
        p.id !== paymentData.id &&
        p.transactionRef &&
        p.transactionRef.toLowerCase() === transactionRef!.toLowerCase()
    );
    if (isDuplicate) {
      transactionRef = `${transactionRef}_${Math.floor(100 + Math.random() * 900)}`;
    }
  } else {
    transactionRef = getNextPaymentReference();
  }

  const newPayment: CrmPayment = {
    id: paymentData.id || `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    paymentType,
    invoiceId,
    invoiceNumber,
    clientId,
    clientName,
    freelancerId,
    freelancerName,
    projectId,
    projectTitle,
    amount: Math.round(paymentData.amount * 100) / 100,
    paymentMethod: paymentData.paymentMethod || 'upi',
    transactionRef,
    paymentDate: paymentData.paymentDate || now.split('T')[0],
    status: paymentData.status || 'completed',
    receiptUrl: paymentData.receiptUrl?.trim() || undefined,
    notes: paymentData.notes?.trim() || undefined,
    isDemo: paymentData.isDemo || false,
    createdAt: now
  };

  payments.unshift(newPayment);
  safeSetLocal(STORAGE_KEYS.PAYMENTS, payments);

  // Reconcile Invoice if linked
  if (invoiceId && newPayment.status === 'completed') {
    reconcileInvoicePayments(invoiceId);
  }

  // Reconcile Freelancer if payout
  if (freelancerId && newPayment.status === 'completed') {
    reconcileFreelancerPayouts(freelancerId);

    // Also link/mirror into expenses under category 'freelancer' to ensure comprehensive tracking
    const existingExp = expenses.find((e) => e.freelancerPayoutId === newPayment.id);
    if (!existingExp) {
      const payoutExpense: CrmExpense = {
        id: `exp_payout_${newPayment.id}`,
        title: `${freelancerName || 'Subcontractor'} — Payout (${newPayment.projectTitle || 'Project Delivery'})`,
        category: 'freelancer',
        amount: newPayment.amount,
        currency: 'INR',
        date: newPayment.paymentDate,
        paymentMethod: newPayment.paymentMethod as any,
        freelancerPayoutId: newPayment.id,
        freelancerId,
        freelancerName,
        projectId,
        projectTitle,
        notes: newPayment.notes || `Freelancer subcontractor payout ref ${newPayment.transactionRef}`,
        isDemo: newPayment.isDemo,
        createdAt: now
      };
      expenses.unshift(payoutExpense);
      safeSetLocal(STORAGE_KEYS.EXPENSES, expenses);
    }
  }

  // Reconcile Project if client payment
  if (projectId && paymentType === 'client_payment' && newPayment.status === 'completed') {
    reconcileProjectFinancials(projectId);
  }

  notifyListeners();
  if (!(newPayment as any).isDemo) {
    savePaymentToFirestore(newPayment).catch(err => console.warn('[Cloud Sync Payment Error]:', err));
  }
  return newPayment;
}

export function deleteStoredPayment(id: string): boolean {
  const payment = payments.find((p) => p.id === id);
  if (!payment) return false;

  const invoiceId = payment.invoiceId;
  const freelancerId = payment.freelancerId;
  const projectId = payment.projectId;

  payments = payments.filter((p) => p.id !== id);
  safeSetLocal(STORAGE_KEYS.PAYMENTS, payments);

  // Remove corresponding mirrored expense if any
  expenses = expenses.filter((e) => e.freelancerPayoutId !== id);
  safeSetLocal(STORAGE_KEYS.EXPENSES, expenses);

  if (invoiceId) reconcileInvoicePayments(invoiceId);
  if (freelancerId) reconcileFreelancerPayouts(freelancerId);
  if (projectId && payment.paymentType === 'client_payment') reconcileProjectFinancials(projectId);

  deletePaymentFromCloud(id).catch(() => {});
  notifyListeners();
  return true;
}

// -------------------------------------------------------------
// EXPENSES & CASHFLOW CRUD
// -------------------------------------------------------------
export function getStoredExpenses(options?: { includeDemo?: boolean }): CrmExpense[] {
  const includeDemo = options?.includeDemo ?? false;
  return expenses.filter(e => includeDemo || !isRecordDemo(e, 'expenses'));
}

export function saveStoredExpense(
  expenseData: Partial<CrmExpense> & { title: string; amount: number }
): CrmExpense {
  const now = new Date().toISOString();
  let existingIndex = -1;
  if (expenseData.id) {
    existingIndex = expenses.findIndex((e) => e.id === expenseData.id);
  }

  let finalExpense: CrmExpense;
  if (existingIndex >= 0) {
    finalExpense = {
      ...expenses[existingIndex],
      ...expenseData,
      amount: Math.round(expenseData.amount * 100) / 100,
      updatedAt: now
    };
    expenses[existingIndex] = finalExpense;
  } else {
    finalExpense = {
      id: expenseData.id || `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: expenseData.title.trim(),
      category: expenseData.category || 'software',
      amount: Math.round(expenseData.amount * 100) / 100,
      currency: 'INR',
      date: expenseData.date || now.split('T')[0],
      paymentMethod: expenseData.paymentMethod || 'upi',
      vendor: expenseData.vendor?.trim() || undefined,
      isRecurring: expenseData.isRecurring || false,
      recurringFrequency: expenseData.recurringFrequency || (expenseData.isRecurring ? 'monthly' : undefined),
      freelancerPayoutId: expenseData.freelancerPayoutId,
      freelancerId: expenseData.freelancerId,
      freelancerName: expenseData.freelancerName,
      projectId: expenseData.projectId,
      projectTitle: expenseData.projectTitle,
      receiptUrl: expenseData.receiptUrl?.trim() || undefined,
      taxDeductible: expenseData.taxDeductible ?? true,
      notes: expenseData.notes?.trim() || undefined,
      isDemo: expenseData.isDemo || false,
      createdAt: now
    };
    expenses.unshift(finalExpense);
  }

  safeSetLocal(STORAGE_KEYS.EXPENSES, expenses);
  notifyListeners();
  if (!(finalExpense as any).isDemo) {
    saveExpenseToFirestore(finalExpense).catch(err => console.warn('[Cloud Sync Expense Error]:', err));
  }
  return finalExpense;
}

export function deleteStoredExpense(id: string): boolean {
  const initialLen = expenses.length;
  expenses = expenses.filter((e) => e.id !== id);
  if (expenses.length !== initialLen) {
    safeSetLocal(STORAGE_KEYS.EXPENSES, expenses);
    notifyListeners();
    deleteExpenseFromCloud(id).catch(() => {});
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// CENTRALIZED FINANCIAL SUMMARY FOR REPORTING & DASHBOARD
// -------------------------------------------------------------
export function getFinancialSummary(options?: { excludeDemo?: boolean }) {
  // Default strictly to excluding demo records from live business financials
  const excludeDemo = options?.excludeDemo !== undefined ? options.excludeDemo : true;
  const activeInvoices = invoices.filter((i) => i.status !== 'cancelled' && (!excludeDemo || !isRecordDemo(i, 'invoices')));
  const totalInvoiced = activeInvoices.reduce((sum, i) => sum + (i.totalAmount ?? i.total ?? 0), 0);

  const completedClientPayments = payments.filter(
    (p) => p.paymentType === 'client_payment' && p.status === 'completed' && (!excludeDemo || !isRecordDemo(p, 'payments'))
  );
  const totalCollected = completedClientPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalOutstanding = activeInvoices
    .filter((i) => i.status !== 'paid')
    .reduce((sum, i) => sum + (i.balanceDue || 0), 0);

  const overdueInvoices = activeInvoices.filter((i) => {
    if (i.status === 'overdue') return true;
    if (i.status === 'paid' || i.status === 'draft') return false;
    return new Date(i.dueDate).getTime() < Date.now();
  });
  const overdueCount = overdueInvoices.length;
  const overdueAmount = overdueInvoices.reduce((sum, i) => sum + (i.balanceDue || 0), 0);

  const completedFreelancerPayouts = payments.filter(
    (p) => p.paymentType === 'freelancer_payout' && p.status === 'completed' && (!excludeDemo || !isRecordDemo(p, 'payments'))
  );
  const totalFreelancerPayouts = completedFreelancerPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);

  const relevantFreelancers = freelancers.filter(f => !excludeDemo || !isRecordDemo(f, 'freelancers'));
  const pendingFreelancerPayouts = relevantFreelancers.reduce(
    (sum, f) => sum + (f.pendingBalance ?? f.paymentPending ?? 0),
    0
  );

  // Avoid double-counting: only sum operational expenses that do not mirror a recorded payout
  const directOperatingExpenses = expenses.filter(
    (e) => (e.category !== 'freelancer' || !e.freelancerPayoutId) && (!excludeDemo || !isRecordDemo(e, 'expenses'))
  );
  const totalOperatingExpenses = directOperatingExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const recurringMonthlyOverhead = expenses
    .filter((e) => e.isRecurring && (!excludeDemo || !isRecordDemo(e, 'expenses')))
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const netCashflow = totalCollected - totalFreelancerPayouts - totalOperatingExpenses;

  return {
    totalInvoiced: Math.round(totalInvoiced * 100) / 100,
    totalCollected: Math.round(totalCollected * 100) / 100,
    totalOutstanding: Math.round(totalOutstanding * 100) / 100,
    overdueCount,
    overdueAmount: Math.round(overdueAmount * 100) / 100,
    totalFreelancerPayouts: Math.round(totalFreelancerPayouts * 100) / 100,
    pendingFreelancerPayouts: Math.round(pendingFreelancerPayouts * 100) / 100,
    totalOperatingExpenses: Math.round(totalOperatingExpenses * 100) / 100,
    recurringMonthlyOverhead: Math.round(recurringMonthlyOverhead * 100) / 100,
    netCashflow: Math.round(netCashflow * 100) / 100
  };
}

export function getRealFinancialSummary() {
  return getFinancialSummary({ excludeDemo: true });
}

// -------------------------------------------------------------
// REMINDERS CRUD
// -------------------------------------------------------------
export function getStoredReminders(options?: { includeDemo?: boolean }): CrmReminder[] {
  const includeDemo = options?.includeDemo ?? false;
  return reminders.filter(r => includeDemo || !isRecordDemo(r, 'reminders'));
}

export function saveStoredReminder(reminder: Partial<CrmReminder> & { title: string }): CrmReminder {
  const now = new Date().toISOString();
  let existingIndex = -1;
  if (reminder.id) {
    existingIndex = reminders.findIndex(r => r.id === reminder.id);
  }

  let finalReminder: CrmReminder;
  if (existingIndex >= 0) {
    finalReminder = {
      ...reminders[existingIndex],
      ...reminder
    };
    reminders[existingIndex] = finalReminder;
  } else {
    finalReminder = {
      id: reminder.id || `rem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: reminder.title,
      type: reminder.type || 'general',
      targetDate: reminder.targetDate || now.split('T')[0],
      priority: reminder.priority || 'medium',
      isCompleted: reminder.isCompleted || false,
      linkedEntityId: reminder.linkedEntityId,
      linkedEntityType: reminder.linkedEntityType,
      notes: reminder.notes || '',
      createdAt: reminder.createdAt || now
    };
    reminders.unshift(finalReminder);
  }

  safeSetLocal(STORAGE_KEYS.REMINDERS, reminders);
  notifyListeners();
  if (!(finalReminder as any).isDemo) {
    saveReminderToFirestore(finalReminder).catch(err => console.warn('[Cloud Sync Reminder Error]:', err));
  }
  return finalReminder;
}

export function toggleReminderCompleted(id: string): void {
  const rem = reminders.find(r => r.id === id);
  if (rem) {
    rem.isCompleted = !rem.isCompleted;
    safeSetLocal(STORAGE_KEYS.REMINDERS, reminders);
    notifyListeners();
    if (!(rem as any).isDemo) {
      saveReminderToFirestore(rem).catch(() => {});
    }
  }
}

export function deleteStoredReminder(id: string): boolean {
  const initialLen = reminders.length;
  reminders = reminders.filter(r => r.id !== id);
  if (reminders.length !== initialLen) {
    safeSetLocal(STORAGE_KEYS.REMINDERS, reminders);
    notifyListeners();
    deleteReminderFromCloud(id).catch(() => {});
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// SETTINGS
// -------------------------------------------------------------
export function getStoredSettings(): CrmAgencySettings {
  return { ...settings };
}

export function updateStoredSettings(updated: Partial<CrmAgencySettings>): CrmAgencySettings {
  settings = {
    ...settings,
    ...updated
  };
  safeSetLocal(STORAGE_KEYS.SETTINGS, settings);
  notifyListeners();
  saveCrmSettingsToFirestore(settings).catch(err => console.warn('[Cloud Sync Settings Error]:', err));
  return settings;
}

// -------------------------------------------------------------
// LIVE METRICS CALCULATOR
// -------------------------------------------------------------
export function calculateLiveDashboardMetrics(): CrmDashboardMetrics {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const newLeadsCount = leads.filter(l => {
    const rawDate = l.createdAt || l.submittedAt;
    if (!rawDate) return false;
    const d = new Date(rawDate);
    return !isNaN(d.getTime()) && d >= sevenDaysAgo;
  }).length;

  const activeClients = clients.filter(c => c.status === 'active').length;
  const activeProjects = projects.filter(p => p.status === 'in_progress' || p.status === 'in_review').length;
  const pendingTasks = tasks.filter(t => t.status !== 'completed').length;

  const monthlyRev = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const outstanding = invoices
    .filter(i => i.status !== 'paid' && i.status !== 'cancelled')
    .reduce((sum, i) => sum + (i.balanceDue || 0), 0);

  const payoutsDue = freelancers.reduce((sum, f) => sum + (f.paymentPending || 0), 0);

  // Service distribution
  const serviceCounts: Record<string, number> = {};
  leads.forEach(l => {
    const s = l.service || 'Creative Inquiry';
    serviceCounts[s] = (serviceCounts[s] || 0) + 1;
  });

  const totalServices = Object.values(serviceCounts).reduce((a, b) => a + b, 0) || 1;
  const servicesBreakdown = Object.entries(serviceCounts).map(([service, count]) => ({
    service,
    count,
    percentage: Math.round((count / totalServices) * 100)
  }));

  return {
    totalLeads: leads.length,
    newLeads: newLeadsCount,
    activeClientsCount: activeClients,
    activeProjectsCount: activeProjects,
    pendingTasksCount: pendingTasks,
    monthlyRevenue: monthlyRev,
    outstandingPayments: outstanding,
    freelancerPayoutsDue: payoutsDue,
    recentLeads: leads.slice(0, 5),
    upcomingFollowUps: leads.filter(l => l.status === 'new' || l.pipelineStage === 'contacted').slice(0, 4),
    servicesBreakdown: servicesBreakdown.length > 0 ? servicesBreakdown : [{ service: 'Video Editing', count: 1, percentage: 100 }],
    leadSourcesBreakdown: [{ source: 'Website Contact', count: leads.length }],
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isFirestoreConnected: true
  };
}

// -------------------------------------------------------------
// PHASE 4: REMINDERS & AUTOMATED AGENDA ENGINE
// -------------------------------------------------------------
export function snoozeReminder(id: string, days: number): CrmReminder | null {
  const rem = reminders.find(r => r.id === id);
  if (!rem) return null;

  const current = new Date(rem.targetDate);
  const baseTime = isNaN(current.getTime()) ? Date.now() : current.getTime();
  const newDate = new Date(baseTime + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  rem.targetDate = newDate;
  rem.snoozedUntil = newDate;
  rem.isCompleted = false;

  safeSetLocal(STORAGE_KEYS.REMINDERS, reminders);
  notifyListeners();
  return rem;
}

export function getAllActiveRemindersWithDynamic(): CrmReminder[] {
  const manual = reminders.filter(r => !isRecordDemo(r, 'reminders'));
  const dynamicList: CrmReminder[] = [];
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Dynamic Overdue & Due Invoices
  invoices.filter(inv => !isRecordDemo(inv, 'invoices')).forEach(inv => {
    if (inv.status !== 'paid' && inv.status !== 'cancelled') {
      const isPastDue = inv.dueDate < todayStr;
      const isDueSoon = inv.dueDate <= new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
      if (isPastDue || isDueSoon) {
        const bal = inv.balanceDue ?? (inv.totalAmount - (inv.amountPaid || 0));
        dynamicList.push({
          id: `dyn_inv_${inv.id}`,
          title: `${isPastDue ? 'Overdue Invoice Alert' : 'Payment Due Soon'}: ${inv.invoiceNumber} (${inv.clientName})`,
          type: 'invoice_due',
          targetDate: inv.dueDate,
          linkedEntityId: inv.id,
          linkedEntityType: 'invoice',
          priority: isPastDue ? 'urgent' : 'high',
          isCompleted: false,
          isDynamic: true,
          subtitle: `Balance Due: ₹${bal.toLocaleString('en-IN')}`,
          notes: `Automated alert generated from Invoices Ledger. Due date: ${inv.dueDate}`,
          createdAt: inv.createdAt
        });
      }
    }
  });

  // 2. Dynamic Project Deadlines
  projects.filter(proj => !isRecordDemo(proj, 'projects')).forEach(proj => {
    if (proj.status !== 'completed' && proj.status !== 'cancelled' && proj.deadline) {
      const isOverdue = proj.deadline < todayStr;
      const isUpcoming = proj.deadline <= new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0];
      if (isOverdue || isUpcoming) {
        dynamicList.push({
          id: `dyn_proj_${proj.id}`,
          title: `${isOverdue ? 'Overdue Project Milestone' : 'Upcoming Project Deadline'}: ${proj.title}`,
          type: 'project_deadline',
          targetDate: proj.deadline,
          linkedEntityId: proj.id,
          linkedEntityType: 'project',
          priority: isOverdue ? 'urgent' : 'high',
          isCompleted: false,
          isDynamic: true,
          subtitle: `Client: ${proj.clientName} | Status: ${proj.status.replace('_', ' ')}`,
          notes: `Project deadline tracker. Target: ${proj.deadline}`,
          createdAt: proj.createdAt
        });
      }
    }
  });

  // 3. Dynamic Task Deadlines
  tasks.filter(tsk => !isRecordDemo(tsk, 'tasks')).forEach(tsk => {
    if (tsk.status !== 'completed' && tsk.dueDate) {
      const isOverdue = tsk.dueDate < todayStr;
      const isDueToday = tsk.dueDate === todayStr;
      if (isOverdue || isDueToday) {
        dynamicList.push({
          id: `dyn_task_${tsk.id}`,
          title: `${isOverdue ? 'Overdue Task' : 'Task Due Today'}: ${tsk.title}`,
          type: 'freelancer_task',
          targetDate: tsk.dueDate,
          linkedEntityId: tsk.id,
          linkedEntityType: 'project',
          priority: isOverdue ? 'urgent' : tsk.priority === 'urgent' ? 'urgent' : 'high',
          isCompleted: false,
          isDynamic: true,
          subtitle: `Assigned: ${tsk.assignedFreelancerName || 'Studio Team'} | Project: ${tsk.projectTitle}`,
          notes: `Task tracking alert. Due: ${tsk.dueDate}`,
          createdAt: tsk.createdAt
        });
      }
    }
  });

  // Combine and deduplicate
  const existingLinkedIds = new Set(manual.filter(r => !r.isCompleted).map(r => r.linkedEntityId));
  const filteredDynamic = dynamicList.filter(d => !existingLinkedIds.has(d.linkedEntityId));

  const all = [...manual, ...filteredDynamic];
  all.sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
    const prioOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    const pDiff = (prioOrder[a.priority] || 2) - (prioOrder[b.priority] || 2);
    if (pDiff !== 0) return pDiff;
    return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
  });

  return all;
}

// -------------------------------------------------------------
// PHASE 4: AI WHATSAPP REPLY ENGINE & RATE CARD
// -------------------------------------------------------------
export const SERVICE_PRICING_CATALOG: ConfiguredServicePricing[] = [
  {
    id: 'sp_video_editing',
    service: 'Video Editing & Color Grading',
    startingPrice: 15000,
    typicalRange: '₹15,000 – ₹35,000',
    timeline: '3 to 5 business days',
    deliverables: [
      '4K ProRes Master cut',
      'Cinema-grade DaVinci Resolve color grading',
      'Pro sound design & audio mastering',
      '2 rounds of revisions included'
    ]
  },
  {
    id: 'sp_3d_cgi',
    service: '3D CGI & Product Animation',
    startingPrice: 45000,
    typicalRange: '₹45,000 – ₹85,000',
    timeline: '7 to 14 business days',
    deliverables: [
      'Photorealistic 3D modeling & texturing',
      'Cinema 4D / Blender custom lighting & camera animation',
      'Alpha transparency passes & 60fps renders',
      'Reels 9:16 and Landscape 16:9 deliverables'
    ]
  },
  {
    id: 'sp_brand_identity',
    service: 'Brand Identity & Visual Design',
    startingPrice: 25000,
    typicalRange: '₹25,000 – ₹50,000',
    timeline: '5 to 7 business days',
    deliverables: [
      'Complete vector logo suite (Primary, Secondary, Icon)',
      'Brand style guide (Typography, Color palette, Usage)',
      'Stationery & Business card print files',
      'Social media starter kit (Profile, Banners, Templates)'
    ]
  },
  {
    id: 'sp_motion_graphics',
    service: 'Motion Graphics & Title Sequences',
    startingPrice: 20000,
    typicalRange: '₹20,000 – ₹40,000',
    timeline: '4 to 6 business days',
    deliverables: [
      'Kinetic typography & 2D/3D visual animations',
      'After Effects project packages & ProRes alpha outputs',
      'Dynamic lower thirds, intro/outro bumpers',
      'Commercial broadcast usage rights'
    ]
  },
  {
    id: 'sp_web_experience',
    service: 'Full-Stack Web & Creative Development',
    startingPrice: 40000,
    typicalRange: '₹40,000 – ₹90,000',
    timeline: '10 to 20 business days',
    deliverables: [
      'High-performance React / Vite / Tailwind web app',
      'Mobile-first responsive fluid layouts & dark mode',
      'Interactive animations, SEO metadata & OpenGraph tags',
      'Google Lighthouse 95+ performance optimization'
    ]
  }
];

export const QUICK_REPLY_TEMPLATES: QuickReplyTemplate[] = [
  {
    id: 'tmpl_welcome_en',
    title: 'Warm Welcome & Scope Discovery (English)',
    category: 'Introduction',
    language: 'en',
    description: 'First response to new inquiries requesting brief details',
    content: `Hello {clientName}! 👋 Thank you for reaching out to Rohitwork Creative Studios.

We specialize in premium {serviceName}. To understand your vision and share an accurate timeline and proposal:
1. What is the core goal or launch date for this project?
2. Do you have reference links, scripts, or existing brand assets?

Looking forward to creating something outstanding with you!
— Rohit Verma | Rohitwork Creative Studios`
  },
  {
    id: 'tmpl_welcome_hinglish',
    title: 'Friendly Pitch & Discovery (Hinglish)',
    category: 'Introduction',
    language: 'hinglish',
    description: 'Approachable Hinglish intro for Indian clients on WhatsApp',
    content: `Namaste {clientName} ji! 🙏 Rohitwork Creative Studios se connect karne ke liye thanks!

Hum aapke {serviceName} requirement mein help kar sakte hain. Project ko kickstart karne ke liye thoda brief share kar dijiye:
• Target deadline kya hai?
• Koi reference video ya style preference jo aapke mind mein ho?

Jaise hi aap share karenge, hum tailored scope aur quotation share kar denge!
— Rohit Verma | Rohitwork`
  },
  {
    id: 'tmpl_quote_share',
    title: 'Quotation & Rate Card Presentation (English)',
    category: 'Pricing',
    language: 'en',
    description: 'Presents verified rate card with deliverables and next steps',
    content: `Hi {clientName}, as discussed, here is the verified scope estimate for {serviceName}:

🎯 Estimated Range: {priceRange}
⏱️ Timeline: {timeline}
📦 Key Deliverables:
{deliverables}

Payment Terms: 50% advance to initiate production, balance upon approved final draft.
Let me know if this aligns with your expectations, and I'll send over the formal agreement and invoice!`
  },
  {
    id: 'tmpl_quote_share_hi',
    title: 'Commercial Quote Presentation (Hindi)',
    category: 'Pricing',
    language: 'hi',
    description: 'Polite formal Hindi price estimate quote',
    content: `नमस्ते {clientName} जी, आपके {serviceName} प्रोजेक्ट का आधिकारिक विवरण नीचे दिया गया है:

🎯 अनुमानित बजट: {priceRange}
⏱️ कार्य अवधि: {timeline}
📦 मुख्य आउटपुट्स:
{deliverables}

शर्तें: 50% अग्रिम राशि के साथ कार्य प्रारंभ होगा, शेष कार्य अनुमोदन के बाद देय होगा।
कृपया समीक्षा करें और पुष्टि करें ताकि हम काम शुरू कर सकें!
— रोहित वर्मा | रोहितवर्क`
  },
  {
    id: 'tmpl_payment_reminder',
    title: 'Gentle Invoice Follow-Up (English)',
    category: 'Follow-up',
    language: 'en',
    description: 'Courteous balance payment reminder with UPI & bank details',
    content: `Hi {clientName}, gentle reminder regarding Invoice {invoiceNumber} for {projectTitle}.

Outstanding Balance: ₹{balanceDue}
Due Date: {dueDate}

Payment can be completed via UPI or Bank Transfer (coordinates provided on your invoice PDF).

Please let us know once transferred so we can release the final high-resolution source masters. Thank you!`
  },
  {
    id: 'tmpl_milestone_review',
    title: 'Milestone Draft Ready for Review (Hinglish)',
    category: 'Execution',
    language: 'hinglish',
    description: 'Notifies client that project review draft is uploaded for feedback',
    content: `Hi {clientName}! 🎬 {projectTitle} ka milestone draft ready ho gaya hai review ke liye.

Draft Link: {reviewUrl}

Aap ise review karke feedback share kar dijiye. Minor adjustments aur revisions standard scope mein include hain. Looking forward to your thoughts!`
  }
];

export interface GenerateAiReplyParams {
  clientName?: string;
  clientPhone?: string;
  serviceName?: string;
  context: AiReplyContext;
  language: AiReplyLanguage;
  tone: AiReplyTone;
  customNotes?: string;
  invoiceNumber?: string;
  balanceDue?: number;
  projectTitle?: string;
}

export function generateContextualWhatsAppReply(params: GenerateAiReplyParams): {
  replyText: string;
  whatsappUrl: string;
  rateInfo?: ConfiguredServicePricing;
} {
  const name = params.clientName?.trim() || 'Client';
  const service = params.serviceName?.trim() || 'Creative Production';
  const notes = params.customNotes?.trim() || '';
  const digits = normalizePhoneNumber(params.clientPhone || '');

  // Look up official pricing
  const rateInfo = SERVICE_PRICING_CATALOG.find(
    s => s.service.toLowerCase().includes(service.toLowerCase()) ||
         service.toLowerCase().includes(s.service.toLowerCase())
  ) || SERVICE_PRICING_CATALOG[0];

  let body = '';

  if (params.context === 'pricing_quote') {
    if (params.language === 'en') {
      body = `Hi ${name}! Thank you for your inquiry about ${rateInfo.service}.\n\n` +
        `Our standard studio investment for this scope typically ranges ${rateInfo.typicalRange}, with a turnaround of ${rateInfo.timeline}.\n\n` +
        `What this includes:\n` +
        rateInfo.deliverables.map(d => `• ${d}`).join('\n') + `\n\n` +
        (notes ? `Regarding your specific note: "${notes}" — we can customize this to your exact requirements.\n\n` : '') +
        `Payment Terms: 50% advance to initiate production, 50% upon final master approval.\n\n` +
        `Would you like me to prepare a formal PDF proposal for your review?`;
    } else if (params.language === 'hi') {
      body = `नमस्ते ${name} जी! ${rateInfo.service} के संबंध में संपर्क करने के लिए धन्यवाद।\n\n` +
        `इस कार्य के लिए हमारी अनुमानित दर ${rateInfo.typicalRange} है, और कार्य अवधि लगभग ${rateInfo.timeline} रहेगी।\n\n` +
        `इसमें शामिल सुविधाएं:\n` +
        rateInfo.deliverables.map(d => `• ${d}`).join('\n') + `\n\n` +
        `शर्तें: 50% अग्रिम राशि और शेष अनुमोदन पर। क्या आप औपचारिक प्रस्ताव पत्र (Quotation) देखना चाहेंगे?`;
    } else {
      // Hinglish
      body = `Hi ${name}! Thanks for connecting regarding ${rateInfo.service}.\n\n` +
        `Is scope ka standard studio investment typically ${rateInfo.typicalRange} rehta hai, with delivery in ${rateInfo.timeline}.\n\n` +
        `Deliverables mein included hai:\n` +
        rateInfo.deliverables.map(d => `• ${d}`).join('\n') + `\n\n` +
        (notes ? `Aapke note ke baare mein: "${notes}" — hum isko aapke deadline ke mutabiq adapt kar lenge.\n\n` : '') +
        `Kya main aapke liye formal Quotation prepare kar doon?`;
    }
  } else if (params.context === 'payment_reminder') {
    const invNum = params.invoiceNumber || 'RW-INV-2026-001';
    const bal = params.balanceDue ? `₹${params.balanceDue.toLocaleString('en-IN')}` : 'outstanding balance';
    const upiSnippet = (settings.isPaymentDetailsVerified && settings.upiId) ? `UPI (${settings.upiId})` : 'UPI';
    if (params.language === 'hi') {
      body = `नमस्ते ${name} जी, इनवॉइस ${invNum} के संबंध में यह एक विनम्र अनुस्मारक है।\n` +
        `बकाया राशि: ${bal}\n` +
        `कृपया ${upiSnippet} अथवा बैंक ट्रांसफर के माध्यम से भुगतान संपन्न करें। धन्यवाद!`;
    } else if (params.language === 'hinglish') {
      body = `Hi ${name}, gentle reminder regarding Invoice ${invNum} for ${params.projectTitle || service}.\n` +
        `Pending Amount: ${bal}.\n` +
        `Aap ${upiSnippet} ya Netbanking se transfer karke confirmation screenshot share kar sakte hain. Thank you!`;
    } else {
      body = `Hi ${name}, gentle follow-up regarding Invoice ${invNum} for ${params.projectTitle || service}.\n\n` +
        `Pending Balance: ${bal}\n` +
        `Payment can be remitted via ${upiSnippet} or Bank Transfer.\n\n` +
        `Please let us know once processed so we can promptly release final assets. Thank you!`;
    }
  } else if (params.context === 'project_milestone') {
    body = params.language === 'hinglish'
      ? `Hi ${name}! ${params.projectTitle || service} ka latest milestone update ready hai. Please check and share your feedback!`
      : `Hello ${name}, the latest milestone deliverable for ${params.projectTitle || service} is ready for your review. Looking forward to your thoughts!`;
  } else {
    // General Inquiry
    if (params.language === 'hinglish') {
      body = `Hello ${name}! 👋 Rohitwork Studios se connect karne ke liye thanks.\n\n` +
        `Hum premium ${service} deliver karte hain. Aapke project ka target timeline aur koi reference video/link ho toh zaroor share karein.\n\n` +
        `Looking forward to working together!\n— Rohit Verma | Rohitwork`;
    } else if (params.language === 'hi') {
      body = `नमस्ते ${name} जी! रोहितवर्क स्टूडियोज में आपका स्वागत है।\n\n` +
        `हम उच्च गुणवत्ता वाली ${service} प्रदान करते हैं। कृपया अपने प्रोजेक्ट का विवरण और समय-सीमा साझा करें।\n\n` +
        `सादर,\nरोहित वर्मा | रोहितवर्क`;
    } else {
      body = `Hello ${name}! 👋 Thank you for reaching out to Rohitwork Creative Studios.\n\n` +
        `We would love to collaborate on your ${service} requirements. To ensure we provide the best creative direction, could you please share your target deadline and any reference links?\n\n` +
        `Best regards,\nRohit Verma | Founder & Creative Director\nRohitwork Creative Studios`;
    }
  }

  // Tone adjustments
  if (params.tone === 'brief') {
    body = body.split('\n\n').slice(0, 2).join('\n\n') + `\n— Rohit | Rohitwork`;
  } else if (params.tone === 'sales') {
    body += `\n\n⭐ We are currently taking limited slots for this month to ensure undivided focus on craft quality.`;
  }

  const encoded = encodeURIComponent(body);
  const whatsappUrl = digits
    ? `https://wa.me/91${digits}?text=${encoded}`
    : `https://wa.me/message/H4JLHPJ3NNGOK1?text=${encoded}`;

  return { replyText: body, whatsappUrl, rateInfo };
}

// -------------------------------------------------------------
// PHASE 4: COMPREHENSIVE REPORTS & ANALYTICS AGGREGATOR
// -------------------------------------------------------------
export function getComprehensiveReports(dateRange: CrmReportDateRange = 'all') {
  const summary = getFinancialSummary();

  // Filter based on range
  const now = Date.now();
  const rangeMs =
    dateRange === '30d' ? 30 * 86400000 :
    dateRange === '90d' ? 90 * 86400000 :
    dateRange === 'year' ? 365 * 86400000 :
    Infinity;

  const inRange = (iso?: string) => {
    if (rangeMs === Infinity || !iso) return true;
    const time = new Date(iso).getTime();
    return !isNaN(time) && now - time <= rangeMs;
  };

  const filteredInvoices = invoices.filter(i => inRange(i.issueDate) && i.status !== 'cancelled' && !isRecordDemo(i, 'invoices'));
  const filteredPayments = payments.filter(p => inRange(p.paymentDate) && p.status === 'completed' && !isRecordDemo(p, 'payments'));
  const filteredExpenses = expenses.filter(e => inRange(e.date) && !isRecordDemo(e, 'expenses'));
  const filteredLeads = leads.filter(l => inRange(l.createdAt || l.submittedAt) && !isRecordDemo(l, 'leads'));
  const filteredProjects = projects.filter(p => inRange(p.createdAt) && !isRecordDemo(p, 'projects'));

  // Revenue metrics
  const totalInvoiced = filteredInvoices.reduce((sum, i) => sum + (i.totalAmount ?? i.total ?? 0), 0);
  const totalCollected = filteredPayments
    .filter(p => p.paymentType === 'client_payment')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalOutstanding = filteredInvoices
    .filter(i => i.status !== 'paid')
    .reduce((sum, i) => sum + (i.balanceDue || 0), 0);
  const totalFreelancerPayouts = filteredPayments
    .filter(p => p.paymentType === 'freelancer_payout')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const directOperatingExpenses = filteredExpenses
    .filter(e => e.category !== 'freelancer' || !e.freelancerPayoutId)
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = totalCollected - totalFreelancerPayouts - directOperatingExpenses;
  const profitMargin = totalCollected > 0 ? Math.round((netProfit / totalCollected) * 100) : 0;

  // Strict Segregation: Verified Real vs Seeded Demo Financials
  const realInvoices = filteredInvoices.filter(i => !isRecordDemo(i, 'invoices'));
  const realPayments = filteredPayments.filter(p => !isRecordDemo(p, 'payments'));
  const realExpenses = filteredExpenses.filter(e => !isRecordDemo(e, 'expenses'));

  const realTotalInvoiced = realInvoices.reduce((sum, i) => sum + (i.totalAmount ?? i.total ?? 0), 0);
  const realTotalCollected = realPayments
    .filter(p => p.paymentType === 'client_payment')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const realTotalOutstanding = realInvoices
    .filter(i => i.status !== 'paid')
    .reduce((sum, i) => sum + (i.balanceDue || 0), 0);
  const realFreelancerPayouts = realPayments
    .filter(p => p.paymentType === 'freelancer_payout')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const realOperatingExpenses = realExpenses
    .filter(e => e.category !== 'freelancer' || !e.freelancerPayoutId)
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const demoTotalInvoiced = Math.round((totalInvoiced - realTotalInvoiced) * 100) / 100;
  const demoTotalCollected = Math.round((totalCollected - realTotalCollected) * 100) / 100;
  const demoTotalOutstanding = Math.round((totalOutstanding - realTotalOutstanding) * 100) / 100;

  // Funnel analytics
  const totalLeadsCount = filteredLeads.length || 1;
  const wonLeads = filteredLeads.filter(l => l.pipelineStage === 'won' || l.status === 'closed').length;
  const qualifiedLeads = filteredLeads.filter(l => l.pipelineStage === 'qualified').length;
  const lostLeads = filteredLeads.filter(l => l.pipelineStage === 'lost').length;
  const conversionRate = Math.round((wonLeads / totalLeadsCount) * 100);

  // Client source breakdown
  const sourceMap: Record<string, number> = {};
  filteredLeads.forEach(l => {
    const src = l.source || 'Website Contact Form';
    sourceMap[src] = (sourceMap[src] || 0) + 1;
  });

  // Project distribution
  const projectStatusMap: Record<string, number> = {};
  filteredProjects.forEach(p => {
    projectStatusMap[p.status] = (projectStatusMap[p.status] || 0) + 1;
  });

  // Task velocity
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasksCount = tasks.length || 1;
  const taskCompletionRate = Math.round((completedTasks / totalTasksCount) * 100);

  // Distinguish Real Firestore stream vs Local Demo
  const firestoreLeadsCount = filteredLeads.filter(l => !isRecordDemo(l, 'leads')).length;
  const demoLeadsCount = filteredLeads.filter(l => isRecordDemo(l, 'leads')).length;

  return {
    dateRange,
    totalInvoiced: Math.round(totalInvoiced * 100) / 100,
    totalCollected: Math.round(totalCollected * 100) / 100,
    totalOutstanding: Math.round(totalOutstanding * 100) / 100,
    totalOperatingExpenses: Math.round(directOperatingExpenses * 100) / 100,
    totalFreelancerPayouts: Math.round(totalFreelancerPayouts * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    profitMargin,
    realTotalInvoiced: Math.round(realTotalInvoiced * 100) / 100,
    realTotalCollected: Math.round(realTotalCollected * 100) / 100,
    realTotalOutstanding: Math.round(realTotalOutstanding * 100) / 100,
    realFreelancerPayouts: Math.round(realFreelancerPayouts * 100) / 100,
    realOperatingExpenses: Math.round(realOperatingExpenses * 100) / 100,
    demoTotalInvoiced,
    demoTotalCollected,
    demoTotalOutstanding,
    totalLeads: filteredLeads.length,
    wonLeads,
    qualifiedLeads,
    lostLeads,
    conversionRate,
    sourceMap,
    projectStatusMap,
    totalProjects: filteredProjects.length,
    taskCompletionRate,
    completedTasks,
    totalTasks: tasks.length,
    firestoreLeadsCount,
    demoLeadsCount,
    isRealDataPresent: firestoreLeadsCount > 0,
    generatedAt: new Date().toISOString()
  };
}

// -------------------------------------------------------------
// PHASE 4: SETTINGS & EXPORT UTILITIES
// -------------------------------------------------------------
export function resetCrmSettingsToDefault(): CrmAgencySettings {
  settings = { ...DEFAULT_CRM_SETTINGS };
  safeSetLocal(STORAGE_KEYS.SETTINGS, settings);
  notifyListeners();
  return settings;
}

export function exportAllCrmDataAsJson(): string {
  const dump = {
    exportDate: new Date().toISOString(),
    version: 'rohitwork-crm-backup-v2.0',
    settings,
    clients,
    freelancers,
    projects,
    tasks,
    quotations,
    invoices,
    payments,
    expenses,
    reminders,
    leads,
    reportsSnapshot: getComprehensiveReports('all'),
    aiAssistantCatalog: {
      servicePricingCatalog: SERVICE_PRICING_CATALOG,
      quickReplyTemplates: QUICK_REPLY_TEMPLATES
    }
  };
  return JSON.stringify(dump, null, 2);
}

export {
  generateCrmBackupPackage,
  downloadCrmBackup,
  verifyCrmBackup,
  getStoredBackupInventory,
  isRecordDemo,
  BACKUP_SCHEMA_VERSION
} from './crmBackupService';
export type {
  CrmBackupManifest,
  CrmBackupPackage,
  BackupVerificationResult
} from './crmBackupService';


export function resetAllCrmStorageToDefaults(): void {
  safeClearLocal(STORAGE_KEYS.CLIENTS);
  safeClearLocal(STORAGE_KEYS.FREELANCERS);
  safeClearLocal(STORAGE_KEYS.PROJECTS);
  safeClearLocal(STORAGE_KEYS.TASKS);
  safeClearLocal(STORAGE_KEYS.QUOTATIONS);
  safeClearLocal(STORAGE_KEYS.INVOICES);
  safeClearLocal(STORAGE_KEYS.PAYMENTS);
  safeClearLocal(STORAGE_KEYS.EXPENSES);
  safeClearLocal(STORAGE_KEYS.REMINDERS);
  safeClearLocal(STORAGE_KEYS.SETTINGS);

  clients = [...DEFAULT_INITIAL_CLIENTS];
  freelancers = [...DEFAULT_INITIAL_FREELANCERS];
  projects = [...DEFAULT_INITIAL_PROJECTS];
  tasks = [...DEFAULT_INITIAL_TASKS];
  quotations = [...DEFAULT_INITIAL_QUOTATIONS];
  invoices = [...DEFAULT_INITIAL_INVOICES];
  payments = [...DEFAULT_INITIAL_PAYMENTS];
  expenses = [...DEFAULT_INITIAL_EXPENSES];
  reminders = [...DEFAULT_INITIAL_REMINDERS];
  settings = { ...DEFAULT_CRM_SETTINGS };

  safeSetLocal(STORAGE_KEYS.CLIENTS, clients);
  safeSetLocal(STORAGE_KEYS.FREELANCERS, freelancers);
  safeSetLocal(STORAGE_KEYS.PROJECTS, projects);
  safeSetLocal(STORAGE_KEYS.TASKS, tasks);
  safeSetLocal(STORAGE_KEYS.QUOTATIONS, quotations);
  safeSetLocal(STORAGE_KEYS.INVOICES, invoices);
  safeSetLocal(STORAGE_KEYS.PAYMENTS, payments);
  safeSetLocal(STORAGE_KEYS.EXPENSES, expenses);
  safeSetLocal(STORAGE_KEYS.REMINDERS, reminders);
  safeSetLocal(STORAGE_KEYS.SETTINGS, settings);

  clients.forEach(c => { if (isRecordDemo(c, 'clients')) c.isDemo = true; });
  projects.forEach(p => { if (isRecordDemo(p, 'projects')) p.isDemo = true; });
  freelancers.forEach(f => { if (isRecordDemo(f, 'freelancers')) (f as any).isDemo = true; });
  tasks.forEach(t => { if (isRecordDemo(t, 'tasks')) t.isDemo = true; });
  quotations.forEach(q => { if (isRecordDemo(q, 'quotations')) q.isDemo = true; });
  invoices.forEach(i => { if (isRecordDemo(i, 'invoices')) i.isDemo = true; });
  payments.forEach(p => { if (isRecordDemo(p, 'payments')) p.isDemo = true; });
  expenses.forEach(e => { if (isRecordDemo(e, 'expenses')) e.isDemo = true; });
  reminders.forEach(r => { if (isRecordDemo(r, 'reminders')) (r as any).isDemo = true; });

  initialized = true;
  notifyListeners();
}

// =============================================================
// TYPED ASYNC PERSISTENCE HELPERS (AWAITING CLOUD CONFIRMATION)
// =============================================================

export async function saveLeadWithCloud(
  leadData: Partial<CrmLead> & { name: string; phone: string }
): Promise<{ success: boolean; lead: CrmLead; error?: string; cloudResult?: CrmCloudOperationResult<CrmLead> }> {
  const isUpdate = Boolean(leadData.id);
  const previous = isUpdate ? leads.find(l => l.id === leadData.id) : null;
  const previousClone = previous ? { ...previous } : null;

  const lead = saveStoredLead(leadData);
  if ((lead as any).isDemo) return { success: true, lead };

  const cloudResult = await saveLeadToFirestore(lead);
  if (!cloudResult.success) {
    if (isUpdate && previousClone) {
      const idx = leads.findIndex(l => l.id === lead.id);
      if (idx >= 0) leads[idx] = previousClone;
      safeSetLocal(STORAGE_KEYS.LEADS, leads);
      notifyListeners();
    } else {
      deleteStoredLead(lead.id);
    }
  }
  return { success: cloudResult.success, lead, error: cloudResult.error, cloudResult };
}

export async function deleteLeadWithCloud(id: string): Promise<CrmCloudOperationResult> {
  const cloudResult = await deleteLeadFromCloud(id);
  if (cloudResult.success) {
    deleteStoredLead(id);
  }
  return cloudResult;
}

export async function saveClientWithCloud(
  clientData: Partial<CrmClient> & { name: string; email?: string }
): Promise<{ success: boolean; client: CrmClient; error?: string; cloudResult?: CrmCloudOperationResult<CrmClient> }> {
  const isUpdate = Boolean(clientData.id);
  const previous = isUpdate ? clients.find(c => c.id === clientData.id) : null;
  const previousClone = previous ? { ...previous } : null;

  const client = saveStoredClient(clientData);
  if ((client as any).isDemo) return { success: true, client };

  const cloudResult = await saveClientToFirestore(client);
  if (!cloudResult.success) {
    if (isUpdate && previousClone) {
      const idx = clients.findIndex(c => c.id === client.id);
      if (idx >= 0) clients[idx] = previousClone;
      safeSetLocal(STORAGE_KEYS.CLIENTS, clients);
      notifyListeners();
    } else {
      deleteStoredClient(client.id);
    }
  }
  return { success: cloudResult.success, client, error: cloudResult.error, cloudResult };
}

export async function deleteClientWithCloud(id: string): Promise<CrmCloudOperationResult> {
  const cloudResult = await deleteClientFromCloud(id);
  if (cloudResult.success) {
    deleteStoredClient(id);
  }
  return cloudResult;
}

export async function saveProjectWithCloud(
  projectData: Partial<CrmProject> & { title: string; clientId: string }
): Promise<{ success: boolean; project: CrmProject; error?: string; cloudResult?: CrmCloudOperationResult<CrmProject> }> {
  const isUpdate = Boolean(projectData.id);
  const previous = isUpdate ? projects.find(p => p.id === projectData.id) : null;
  const previousClone = previous ? { ...previous } : null;

  const project = saveStoredProject(projectData);
  if ((project as any).isDemo) return { success: true, project };

  const cloudResult = await saveProjectToFirestore(project);
  if (!cloudResult.success) {
    if (isUpdate && previousClone) {
      const idx = projects.findIndex(p => p.id === project.id);
      if (idx >= 0) projects[idx] = previousClone;
      safeSetLocal(STORAGE_KEYS.PROJECTS, projects);
      notifyListeners();
    } else {
      deleteStoredProject(project.id);
    }
  }
  return { success: cloudResult.success, project, error: cloudResult.error, cloudResult };
}

export async function deleteProjectWithCloud(id: string): Promise<CrmCloudOperationResult> {
  const cloudResult = await deleteProjectFromCloud(id);
  if (cloudResult.success) {
    deleteStoredProject(id);
  }
  return cloudResult;
}

export async function saveFreelancerWithCloud(
  freelancerData: Partial<CrmFreelancer> & { name: string; phone: string }
): Promise<{ success: boolean; freelancer: CrmFreelancer; error?: string; cloudResult?: CrmCloudOperationResult<CrmFreelancer> }> {
  const isUpdate = Boolean(freelancerData.id);
  const previous = isUpdate ? freelancers.find(f => f.id === freelancerData.id) : null;
  const previousClone = previous ? { ...previous } : null;

  const freelancer = saveStoredFreelancer(freelancerData);
  if ((freelancer as any).isDemo) return { success: true, freelancer };

  const cloudResult = await saveFreelancerToFirestore(freelancer);
  if (!cloudResult.success) {
    if (isUpdate && previousClone) {
      const idx = freelancers.findIndex(f => f.id === freelancer.id);
      if (idx >= 0) freelancers[idx] = previousClone;
      safeSetLocal(STORAGE_KEYS.FREELANCERS, freelancers);
      notifyListeners();
    } else {
      deleteStoredFreelancer(freelancer.id);
    }
  }
  return { success: cloudResult.success, freelancer, error: cloudResult.error, cloudResult };
}

export async function deleteFreelancerWithCloud(id: string): Promise<CrmCloudOperationResult> {
  const cloudResult = await deleteFreelancerFromCloud(id);
  if (cloudResult.success) {
    deleteStoredFreelancer(id);
  }
  return cloudResult;
}

export async function saveTaskWithCloud(
  taskData: Partial<CrmTask> & { title: string }
): Promise<{ success: boolean; task: CrmTask; error?: string; cloudResult?: CrmCloudOperationResult<CrmTask> }> {
  const isUpdate = Boolean(taskData.id);
  const previous = isUpdate ? tasks.find(t => t.id === taskData.id) : null;
  const previousClone = previous ? { ...previous } : null;

  const task = saveStoredTask(taskData);
  if ((task as any).isDemo) return { success: true, task };

  const cloudResult = await saveTaskToFirestore(task);
  if (!cloudResult.success) {
    if (isUpdate && previousClone) {
      const idx = tasks.findIndex(t => t.id === task.id);
      if (idx >= 0) tasks[idx] = previousClone;
      safeSetLocal(STORAGE_KEYS.TASKS, tasks);
      notifyListeners();
    } else {
      deleteStoredTask(task.id);
    }
  }
  return { success: cloudResult.success, task, error: cloudResult.error, cloudResult };
}

export async function deleteTaskWithCloud(id: string): Promise<CrmCloudOperationResult> {
  const cloudResult = await deleteTaskFromCloud(id);
  if (cloudResult.success) {
    deleteStoredTask(id);
  }
  return cloudResult;
}

export async function saveQuotationWithCloud(
  quotationData: Partial<CrmQuotation> & { clientName: string }
): Promise<{ success: boolean; quotation: CrmQuotation; error?: string; cloudResult?: CrmCloudOperationResult<CrmQuotation> }> {
  const isUpdate = Boolean(quotationData.id);
  const previous = isUpdate ? quotations.find(q => q.id === quotationData.id) : null;
  const previousClone = previous ? { ...previous } : null;

  const quotation = saveStoredQuotation(quotationData);
  if ((quotation as any).isDemo) return { success: true, quotation };

  const cloudResult = await saveQuotationToFirestore(quotation);
  if (!cloudResult.success) {
    if (isUpdate && previousClone) {
      const idx = quotations.findIndex(q => q.id === quotation.id);
      if (idx >= 0) quotations[idx] = previousClone;
      safeSetLocal(STORAGE_KEYS.QUOTATIONS, quotations);
      notifyListeners();
    } else {
      deleteStoredQuotation(quotation.id);
    }
  }
  return { success: cloudResult.success, quotation, error: cloudResult.error, cloudResult };
}

export async function deleteQuotationWithCloud(id: string): Promise<CrmCloudOperationResult> {
  const cloudResult = await deleteQuotationFromCloud(id);
  if (cloudResult.success) {
    deleteStoredQuotation(id);
  }
  return cloudResult;
}

export async function updateQuotationStatusWithCloud(
  id: string,
  status: CrmQuotationStatus
): Promise<{ success: boolean; quotation?: CrmQuotation; error?: string }> {
  const quotation = quotations.find((q) => q.id === id);
  if (!quotation) return { success: false, error: 'Quotation not found' };

  const previousStatus = quotation.status;
  const previousUpdatedAt = quotation.updatedAt;
  const previousActivities = quotation.activities ? [...quotation.activities] : [];

  const updated = updateQuotationStatus(id, status);
  if (!updated) return { success: false, error: 'Failed to update quotation locally' };

  if (isRecordDemo(updated, 'quotations')) {
    return { success: true, quotation: updated };
  }

  const cloudResult = await saveQuotationToFirestore(updated);
  if (!cloudResult.success) {
    // Rollback
    updated.status = previousStatus;
    updated.updatedAt = previousUpdatedAt;
    updated.activities = previousActivities;
    safeSetLocal(STORAGE_KEYS.QUOTATIONS, quotations);
    notifyListeners();
    return { success: false, quotation: updated, error: cloudResult.error };
  }

  return { success: true, quotation: updated };
}

export async function convertQuotationToInvoiceWithCloud(
  quotationId: string
): Promise<{ success: boolean; invoice?: CrmInvoice; quotation?: CrmQuotation; error?: string }> {
  const quotation = quotations.find((q) => q.id === quotationId);
  if (!quotation) return { success: false, error: 'Quotation not found' };

  // If already converted, return existing invoice
  if (quotation.convertedToInvoiceId) {
    const existing = invoices.find((i) => i.id === quotation.convertedToInvoiceId);
    if (existing) {
      return { success: true, invoice: existing, quotation };
    }
  }

  const invoice = convertQuotationToInvoice(quotationId);
  if (!invoice) return { success: false, error: 'Failed to convert quotation to invoice' };

  if (isRecordDemo(invoice, 'invoices')) {
    return { success: true, invoice, quotation };
  }

  // Sync new invoice to Firestore
  const invCloudResult = await saveInvoiceToFirestore(invoice);
  if (!invCloudResult.success) {
    // Rollback: delete stored invoice and revert quotation state
    deleteStoredInvoice(invoice.id);
    quotation.status = 'sent';
    quotation.convertedToInvoiceId = undefined;
    quotation.convertedAt = undefined;
    safeSetLocal(STORAGE_KEYS.QUOTATIONS, quotations);
    notifyListeners();
    return { success: false, error: invCloudResult.error || 'Failed to sync converted invoice to cloud' };
  }

  // Sync updated quotation status to Firestore
  const quoteCloudResult = await saveQuotationToFirestore(quotation);
  if (!quoteCloudResult.success) {
    console.warn('[CRM Storage] Converted invoice synced, but quotation status update to cloud returned warning:', quoteCloudResult.error);
  }

  return { success: true, invoice, quotation };
}

export async function duplicateQuotationWithCloud(
  id: string
): Promise<{ success: boolean; quotation?: CrmQuotation; error?: string }> {
  const duplicated = duplicateStoredQuotation(id);
  if (!duplicated) return { success: false, error: 'Failed to duplicate quotation' };

  if (isRecordDemo(duplicated, 'quotations')) {
    return { success: true, quotation: duplicated };
  }

  const cloudResult = await saveQuotationToFirestore(duplicated);
  if (!cloudResult.success) {
    deleteStoredQuotation(duplicated.id);
    return { success: false, error: cloudResult.error || 'Failed to sync duplicated quotation to cloud' };
  }

  return { success: true, quotation: duplicated };
}

export async function saveInvoiceWithCloud(
  invoiceData: Partial<CrmInvoice> & { clientName: string; clientEmail: string }
): Promise<{ success: boolean; invoice: CrmInvoice; error?: string; cloudResult?: CrmCloudOperationResult<CrmInvoice> }> {
  const isUpdate = Boolean(invoiceData.id);
  const previous = isUpdate ? invoices.find(inv => inv.id === invoiceData.id) : null;
  const previousClone = previous ? { ...previous } : null;

  const invoice = saveStoredInvoice(invoiceData);
  if ((invoice as any).isDemo) return { success: true, invoice };

  const cloudResult = await saveInvoiceToFirestore(invoice);
  if (!cloudResult.success) {
    if (isUpdate && previousClone) {
      const idx = invoices.findIndex(inv => inv.id === invoice.id);
      if (idx >= 0) invoices[idx] = previousClone;
      safeSetLocal(STORAGE_KEYS.INVOICES, invoices);
      notifyListeners();
    } else {
      deleteStoredInvoice(invoice.id);
    }
  }
  return { success: cloudResult.success, invoice, error: cloudResult.error, cloudResult };
}

export async function deleteInvoiceWithCloud(id: string): Promise<CrmCloudOperationResult> {
  const cloudResult = await deleteInvoiceFromCloud(id);
  if (cloudResult.success) {
    deleteStoredInvoice(id);
  }
  return cloudResult;
}

export async function savePaymentWithCloud(
  paymentData: Partial<CrmPayment> & { amount: number }
): Promise<{ success: boolean; payment: CrmPayment; error?: string; cloudResult?: CrmCloudOperationResult<CrmPayment> }> {
  const isUpdate = Boolean(paymentData.id);
  const previous = isUpdate ? payments.find(p => p.id === paymentData.id) : null;
  const previousClone = previous ? { ...previous } : null;

  const payment = recordPayment(paymentData);
  if ((payment as any).isDemo) return { success: true, payment };

  const cloudResult = await savePaymentToFirestore(payment);
  if (!cloudResult.success) {
    if (isUpdate && previousClone) {
      const idx = payments.findIndex(p => p.id === payment.id);
      if (idx >= 0) payments[idx] = previousClone;
      safeSetLocal(STORAGE_KEYS.PAYMENTS, payments);
      notifyListeners();
    } else {
      deleteStoredPayment(payment.id);
    }
  }
  return { success: cloudResult.success, payment, error: cloudResult.error, cloudResult };
}

export async function deletePaymentWithCloud(id: string): Promise<CrmCloudOperationResult> {
  const cloudResult = await deletePaymentFromCloud(id);
  if (cloudResult.success) {
    deleteStoredPayment(id);
  }
  return cloudResult;
}

export async function saveExpenseWithCloud(
  expenseData: Partial<CrmExpense> & { title: string; amount: number; category: CrmExpense['category'] }
): Promise<{ success: boolean; expense: CrmExpense; error?: string; cloudResult?: CrmCloudOperationResult<CrmExpense> }> {
  const isUpdate = Boolean(expenseData.id);
  const previous = isUpdate ? expenses.find(e => e.id === expenseData.id) : null;
  const previousClone = previous ? { ...previous } : null;

  const expense = saveStoredExpense(expenseData);
  if ((expense as any).isDemo) return { success: true, expense };

  const cloudResult = await saveExpenseToFirestore(expense);
  if (!cloudResult.success) {
    if (isUpdate && previousClone) {
      const idx = expenses.findIndex(e => e.id === expense.id);
      if (idx >= 0) expenses[idx] = previousClone;
      safeSetLocal(STORAGE_KEYS.EXPENSES, expenses);
      notifyListeners();
    } else {
      deleteStoredExpense(expense.id);
    }
  }
  return { success: cloudResult.success, expense, error: cloudResult.error, cloudResult };
}

export async function deleteExpenseWithCloud(id: string): Promise<CrmCloudOperationResult> {
  const cloudResult = await deleteExpenseFromCloud(id);
  if (cloudResult.success) {
    deleteStoredExpense(id);
  }
  return cloudResult;
}

export async function saveReminderWithCloud(
  reminderData: Partial<CrmReminder> & { title: string }
): Promise<{ success: boolean; reminder: CrmReminder; error?: string; cloudResult?: CrmCloudOperationResult<CrmReminder> }> {
  const isUpdate = Boolean(reminderData.id);
  const previous = isUpdate ? reminders.find(r => r.id === reminderData.id) : null;
  const previousClone = previous ? { ...previous } : null;

  const reminder = saveStoredReminder(reminderData);
  if ((reminder as any).isDemo) return { success: true, reminder };

  const cloudResult = await saveReminderToFirestore(reminder);
  if (!cloudResult.success) {
    if (isUpdate && previousClone) {
      const idx = reminders.findIndex(r => r.id === reminder.id);
      if (idx >= 0) reminders[idx] = previousClone;
      safeSetLocal(STORAGE_KEYS.REMINDERS, reminders);
      notifyListeners();
    } else {
      deleteStoredReminder(reminder.id);
    }
  }
  return { success: cloudResult.success, reminder, error: cloudResult.error, cloudResult };
}

export async function deleteReminderWithCloud(id: string): Promise<CrmCloudOperationResult> {
  const cloudResult = await deleteReminderFromCloud(id);
  if (cloudResult.success) {
    deleteStoredReminder(id);
  }
  return cloudResult;
}

export async function updateSettingsWithCloud(
  updated: Partial<CrmAgencySettings>
): Promise<{ success: boolean; settings: CrmAgencySettings; error?: string; cloudResult?: CrmCloudOperationResult<CrmAgencySettings> }> {
  const previousClone = { ...settings };
  const newSettings = updateStoredSettings(updated);
  const cloudResult = await saveCrmSettingsToFirestore(newSettings);
  if (!cloudResult.success) {
    settings = previousClone;
    safeSetLocal(STORAGE_KEYS.SETTINGS, settings);
    notifyListeners();
  }
  return { success: cloudResult.success, settings: newSettings, error: cloudResult.error, cloudResult };
}

/**
 * Start Live Cross-Browser Real-Time Sync
 * Subscribes to core Firestore collections and reconciles incoming remote changes
 * into local cache and notifies UI components reactively.
 */
export function startLiveCloudSync(): () => void {
  const unsubscribers: (() => void)[] = [];

  // Clients live sync
  unsubscribers.push(
    subscribeToCloudCollection('clients', (cloudClients) => {
      let changed = false;
      cloudClients.forEach((cc: any) => {
        const localIdx = clients.findIndex((c) => c.id === cc.id);
        if (localIdx === -1) {
          clients.push(cc);
          changed = true;
        } else {
          const localTime = new Date(clients[localIdx].updatedAt || clients[localIdx].createdAt || 0).getTime();
          const remoteTime = new Date(cc.updatedAt || cc.createdAt || 0).getTime();
          if (remoteTime > localTime) {
            clients[localIdx] = { ...clients[localIdx], ...cc };
            changed = true;
          }
        }
      });
      if (changed) {
        safeSetLocal(STORAGE_KEYS.CLIENTS, clients);
        notifyListeners();
      }
    })
  );

  // Projects live sync
  unsubscribers.push(
    subscribeToCloudCollection('projects', (cloudProjects) => {
      let changed = false;
      cloudProjects.forEach((cp: any) => {
        const localIdx = projects.findIndex((p) => p.id === cp.id);
        if (localIdx === -1) {
          projects.push(cp);
          changed = true;
        } else {
          const localTime = new Date(projects[localIdx].updatedAt || projects[localIdx].createdAt || 0).getTime();
          const remoteTime = new Date(cp.updatedAt || cp.createdAt || 0).getTime();
          if (remoteTime > localTime) {
            projects[localIdx] = { ...projects[localIdx], ...cp };
            changed = true;
          }
        }
      });
      if (changed) {
        safeSetLocal(STORAGE_KEYS.PROJECTS, projects);
        notifyListeners();
      }
    })
  );

  // Invoices live sync
  unsubscribers.push(
    subscribeToCloudCollection('invoices', (cloudInvoices) => {
      let changed = false;
      cloudInvoices.forEach((ci: any) => {
        const localIdx = invoices.findIndex((i) => i.id === ci.id);
        if (localIdx === -1) {
          invoices.push(ci);
          changed = true;
        } else {
          const localTime = new Date(invoices[localIdx].updatedAt || invoices[localIdx].createdAt || 0).getTime();
          const remoteTime = new Date(ci.updatedAt || ci.createdAt || 0).getTime();
          if (remoteTime > localTime) {
            invoices[localIdx] = { ...invoices[localIdx], ...ci };
            changed = true;
          }
        }
      });
      if (changed) {
        safeSetLocal(STORAGE_KEYS.INVOICES, invoices);
        notifyListeners();
      }
    })
  );

  // Tasks live sync
  unsubscribers.push(
    subscribeToCloudCollection('tasks', (cloudTasks) => {
      let changed = false;
      cloudTasks.forEach((ct: any) => {
        const localIdx = tasks.findIndex((t) => t.id === ct.id);
        if (localIdx === -1) {
          tasks.push(ct);
          changed = true;
        } else {
          const localTime = new Date(tasks[localIdx].updatedAt || tasks[localIdx].createdAt || 0).getTime();
          const remoteTime = new Date(ct.updatedAt || ct.createdAt || 0).getTime();
          if (remoteTime > localTime) {
            tasks[localIdx] = { ...tasks[localIdx], ...ct };
            changed = true;
          }
        }
      });
      if (changed) {
        safeSetLocal(STORAGE_KEYS.TASKS, tasks);
        notifyListeners();
      }
    })
  );

  // Freelancers live sync
  unsubscribers.push(
    subscribeToCloudCollection('freelancers', (cloudFreelancers) => {
      let changed = false;
      cloudFreelancers.forEach((cf: any) => {
        const localIdx = freelancers.findIndex((f) => f.id === cf.id);
        if (localIdx === -1) {
          freelancers.push(cf);
          changed = true;
        } else {
          const localTime = new Date(freelancers[localIdx].updatedAt || freelancers[localIdx].createdAt || 0).getTime();
          const remoteTime = new Date(cf.updatedAt || cf.createdAt || 0).getTime();
          if (remoteTime > localTime) {
            freelancers[localIdx] = { ...freelancers[localIdx], ...cf };
            changed = true;
          }
        }
      });
      if (changed) {
        safeSetLocal(STORAGE_KEYS.FREELANCERS, freelancers);
        notifyListeners();
      }
    })
  );

  // Quotations live sync
  unsubscribers.push(
    subscribeToCloudCollection('quotations', (cloudQuotations) => {
      let changed = false;
      cloudQuotations.forEach((cq: any) => {
        const localIdx = quotations.findIndex((q) => q.id === cq.id);
        if (localIdx === -1) {
          quotations.push(cq);
          changed = true;
        } else {
          const localTime = new Date(quotations[localIdx].updatedAt || quotations[localIdx].createdAt || 0).getTime();
          const remoteTime = new Date(cq.updatedAt || cq.createdAt || 0).getTime();
          if (remoteTime > localTime) {
            quotations[localIdx] = { ...quotations[localIdx], ...cq };
            changed = true;
          }
        }
      });
      if (changed) {
        safeSetLocal(STORAGE_KEYS.QUOTATIONS, quotations);
        notifyListeners();
      }
    })
  );

  // Payments live sync
  unsubscribers.push(
    subscribeToCloudCollection('payments', (cloudPayments) => {
      let changed = false;
      cloudPayments.forEach((cp: any) => {
        const localIdx = payments.findIndex((p) => p.id === cp.id);
        if (localIdx === -1) {
          payments.push(cp);
          changed = true;
        } else {
          const localTime = new Date(payments[localIdx].updatedAt || payments[localIdx].createdAt || 0).getTime();
          const remoteTime = new Date(cp.updatedAt || cp.createdAt || 0).getTime();
          if (remoteTime > localTime) {
            payments[localIdx] = { ...payments[localIdx], ...cp };
            changed = true;
          }
        }
      });
      if (changed) {
        safeSetLocal(STORAGE_KEYS.PAYMENTS, payments);
        notifyListeners();
      }
    })
  );

  // Expenses live sync
  unsubscribers.push(
    subscribeToCloudCollection('expenses', (cloudExpenses) => {
      let changed = false;
      cloudExpenses.forEach((ce: any) => {
        const localIdx = expenses.findIndex((e) => e.id === ce.id);
        if (localIdx === -1) {
          expenses.push(ce);
          changed = true;
        } else {
          const localTime = new Date(expenses[localIdx].updatedAt || expenses[localIdx].createdAt || 0).getTime();
          const remoteTime = new Date(ce.updatedAt || ce.createdAt || 0).getTime();
          if (remoteTime > localTime) {
            expenses[localIdx] = { ...expenses[localIdx], ...ce };
            changed = true;
          }
        }
      });
      if (changed) {
        safeSetLocal(STORAGE_KEYS.EXPENSES, expenses);
        notifyListeners();
      }
    })
  );

  // Reminders live sync
  unsubscribers.push(
    subscribeToCloudCollection('reminders', (cloudReminders) => {
      let changed = false;
      cloudReminders.forEach((cr: any) => {
        const localIdx = reminders.findIndex((r) => r.id === cr.id);
        if (localIdx === -1) {
          reminders.push(cr);
          changed = true;
        } else {
          const localTime = new Date((reminders[localIdx] as any).updatedAt || reminders[localIdx].createdAt || 0).getTime();
          const remoteTime = new Date(cr.updatedAt || cr.createdAt || 0).getTime();
          if (remoteTime > localTime) {
            reminders[localIdx] = { ...reminders[localIdx], ...cr };
            changed = true;
          }
        }
      });
      if (changed) {
        safeSetLocal(STORAGE_KEYS.REMINDERS, reminders);
        notifyListeners();
      }
    })
  );

  // Leads live sync
  unsubscribers.push(
    subscribeToCloudCollection('leads', (cloudLeads) => {
      let changed = false;
      cloudLeads.forEach((cl: any) => {
        const localIdx = leads.findIndex(
          (l) =>
            l.id === cl.id ||
            (l.sourceDocumentId && cl.sourceDocumentId && l.sourceDocumentId === cl.sourceDocumentId)
        );
        if (localIdx === -1) {
          leads.push(cl);
          changed = true;
        } else {
          if (leads[localIdx].id !== cl.id) {
            leads[localIdx].id = cl.id;
          }
          const localTime = new Date(leads[localIdx].updatedAt || leads[localIdx].createdAt || 0).getTime();
          const remoteTime = new Date(cl.updatedAt || cl.createdAt || 0).getTime();
          if (remoteTime >= localTime) {
            leads[localIdx] = { ...leads[localIdx], ...cl };
            changed = true;
          }
        }
      });
      if (changed) {
        safeSetLocal(STORAGE_KEYS.LEADS, leads);
        notifyListeners();
      }
    })
  );

  return () => {
    unsubscribers.forEach((unsub) => unsub());
  };
}


