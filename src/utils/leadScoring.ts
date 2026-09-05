import { InquiryRecord, LeadPriority } from '../types/cms';

/**
 * Calculates a lead score (0-100) based on available CRM data.
 * Safe against missing fields, non-standard formats, and undefined values.
 */
export function calculateLeadScore(lead: Partial<InquiryRecord>): number {
  if (!lead) return 0;
  let score = 0;

  // 1. Recency of lead
  if (lead.createdAt) {
    try {
      const createdDate = new Date(lead.createdAt).getTime();
      const now = Date.now();
      const diffDays = (now - createdDate) / (1000 * 60 * 60 * 24);

      if (diffDays <= 2) {
        score += 15;
      } else if (diffDays <= 7) {
        score += 10;
      } else if (diffDays <= 30) {
        score += 5;
      }
    } catch {
      // ignore date parse errors
    }
  }

  // 2. Direct contact phone available
  if (lead.phone && lead.phone.trim().length >= 6) {
    score += 10;
  }

  // 3. Business name provided (commercial intent)
  if (lead.businessName && lead.businessName.trim().length >= 2) {
    score += 5;
  }

  // 4. Detailed project scope / message (> 50 chars)
  const messageLength = (lead.message || '').trim().length;
  if (messageLength >= 120) {
    score += 15;
  } else if (messageLength >= 50) {
    score += 10;
  }

  // 5. Budget evaluation (fails safely across varied string formats)
  const budgetStr = (lead.budgetRange || '').toLowerCase();
  if (budgetStr) {
    if (
      budgetStr.includes('50,000') ||
      budgetStr.includes('50000') ||
      budgetStr.includes('1,00,000') ||
      budgetStr.includes('100000') ||
      budgetStr.includes('lakh') ||
      budgetStr.includes('crore') ||
      budgetStr.includes('enterprise') ||
      budgetStr.includes('premium') ||
      budgetStr.includes('tier 3') ||
      budgetStr.includes('high') ||
      budgetStr.includes('$2,000') ||
      budgetStr.includes('$5,000') ||
      budgetStr.includes('$10,000')
    ) {
      score += 20;
    } else if (
      budgetStr.includes('25,000') ||
      budgetStr.includes('30,000') ||
      budgetStr.includes('$1,000') ||
      budgetStr.includes('medium') ||
      budgetStr.includes('standard')
    ) {
      score += 12;
    } else {
      score += 5;
    }
  }

  // 6. Lead status progression
  const status = (lead.status || '').toLowerCase();
  if (status === 'proposal') {
    score += 25;
  } else if (status === 'qualified') {
    score += 20;
  } else if (status === 'contacted' || status === 'in_progress') {
    score += 15;
  }

  // 7. Active follow-up scheduled
  if (lead.followUpAt && lead.followUpStatus === 'pending') {
    score += 10;
  }

  // 8. Admin priority assignment
  if (lead.priority === 'high') {
    score += 15;
  } else if (lead.priority === 'medium') {
    score += 5;
  }

  // Clamp safely between 0 and 100
  return Math.min(100, Math.max(0, score));
}

/**
 * Returns lead score classification category
 */
export function getLeadScoreCategory(score: number): {
  label: 'Cold' | 'Warm' | 'Hot' | 'High Intent';
  color: string;
  badgeBg: string;
} {
  if (score >= 85) {
    return {
      label: 'High Intent',
      color: 'text-rose-500 dark:text-rose-400',
      badgeBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30'
    };
  }
  if (score >= 70) {
    return {
      label: 'Hot',
      color: 'text-amber-500 dark:text-amber-400',
      badgeBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30'
    };
  }
  if (score >= 40) {
    return {
      label: 'Warm',
      color: 'text-blue-500 dark:text-blue-400',
      badgeBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30'
    };
  }
  return {
    label: 'Cold',
    color: 'text-neutral-500 dark:text-neutral-400',
    badgeBg: 'bg-neutral-500/15 text-neutral-600 dark:text-neutral-300 border-neutral-500/30'
  };
}

export type FollowUpCategory = 'due_today' | 'upcoming' | 'overdue' | 'completed' | 'none';

/**
 * Determine the follow-up status for a lead based on current time
 */
export function getLeadFollowUpCategory(lead: Partial<InquiryRecord>): FollowUpCategory {
  if (!lead.followUpAt) return 'none';
  if (lead.followUpStatus === 'completed') return 'completed';

  try {
    const dueDate = new Date(lead.followUpAt);
    if (isNaN(dueDate.getTime())) return 'none';

    const now = new Date();
    
    // Check if overdue: scheduled time was earlier than now
    if (dueDate.getTime() < now.getTime()) {
      return 'overdue';
    }

    // Check if due today
    const isSameDay =
      dueDate.getFullYear() === now.getFullYear() &&
      dueDate.getMonth() === now.getMonth() &&
      dueDate.getDate() === now.getDate();

    if (isSameDay) {
      return 'due_today';
    }

    return 'upcoming';
  } catch {
    return 'none';
  }
}

/**
 * Generates relative overdue duration string, e.g. "Overdue by 3 hours"
 */
export function formatOverdueDuration(followUpAt: string | Date): string {
  try {
    const dueTime = new Date(followUpAt).getTime();
    const now = Date.now();
    const diffMs = now - dueTime;

    if (diffMs <= 0) return 'Due now';

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays >= 1) {
      return `Overdue by ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }
    if (diffHours >= 1) {
      return `Overdue by ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    }
    return `Overdue by ${Math.max(1, diffMinutes)} min`;
  } catch {
    return 'Overdue';
  }
}

/**
 * Human friendly date/time display
 */
export function formatFollowUpDateTime(followUpAt: string | Date): string {
  try {
    const date = new Date(followUpAt);
    if (isNaN(date.getTime())) return 'Invalid date';

    const now = new Date();
    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow =
      date.getFullYear() === tomorrow.getFullYear() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getDate() === tomorrow.getDate();

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) return `Today, ${timeStr}`;
    if (isTomorrow) return `Tomorrow, ${timeStr}`;

    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
  } catch {
    return 'Scheduled';
  }
}

/**
 * Checks whether a lead should be classified as a Hot Lead.
 * Manual toggle (isHotLead) always takes top priority.
 */
export function isLeadHot(lead: Partial<InquiryRecord>): { isHot: boolean; isManual: boolean; score: number } {
  const score = typeof lead.leadScore === 'number' ? lead.leadScore : calculateLeadScore(lead);

  // Manual admin override
  if (lead.isHotLead === true) {
    return { isHot: true, isManual: true, score };
  }
  if (lead.isHotLead === false) {
    return { isHot: false, isManual: true, score };
  }

  // Automatic smart threshold
  return { isHot: score >= 70, isManual: false, score };
}
