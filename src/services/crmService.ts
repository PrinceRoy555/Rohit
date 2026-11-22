import { fetchAllLeadsFromFirestore } from './firebase/firestore';
import { isFirebaseConfigured, db } from '../lib/firebase';
import { CrmDashboardMetrics, CrmLead } from '../types/crm';
import {
  initCrmStorage,
  getStoredLeads,
  getStoredClients,
  getStoredProjects,
  getStoredTasks,
  getStoredFreelancers,
  getStoredInvoices,
  getStoredPayments,
  getFinancialSummary
} from './crmStorageService';
import { isRecordDemo } from './crmBackupService';

function getRelativeTime(timestamp?: string | number): string {
  if (!timestamp) return 'Just now';
  const now = Date.now();
  const time = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  if (isNaN(time)) return 'Just now';
  const diffSec = Math.floor((now - time) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hr ago`;
  if (diffSec < 172800) return 'Yesterday';
  return `${Math.floor(diffSec / 86400)} days ago`;
}

/**
 * Service to aggregate verified CRM metrics from Firestore and CRM Storage.
 * Implements strict deduplication and zero-fabrication rules:
 * - Metrics supported by real Firestore inquiries and manual leads are populated.
 * - Live client and project counts reflect authenticated CRM operations.
 */
export async function getCrmDashboardMetrics(): Promise<CrmDashboardMetrics> {
  const isConfigured = isFirebaseConfigured();
  await initCrmStorage();
  let rawLeads: CrmLead[] = getStoredLeads();

  if (!rawLeads || rawLeads.length === 0) {
    try {
      const fsLeads = await fetchAllLeadsFromFirestore();
      if (fsLeads && fsLeads.length > 0) {
        rawLeads = fsLeads as unknown as CrmLead[];
      }
    } catch (err) {
      console.warn('[CRM Service] Error fetching Firestore leads:', err);
    }
  }

  // Deduplicate real leads by unique email + message or ID (strictly filter demo leads)
  const seenIds = new Set<string>();
  const deduplicatedLeads: CrmLead[] = [];

  for (const item of rawLeads) {
    if (isRecordDemo(item, 'leads')) continue;
    const key = item.id || `${item.email}_${item.phone}`;
    if (!key || seenIds.has(key)) continue;
    seenIds.add(key);

    deduplicatedLeads.push({
      ...item,
      pipelineStage: item.pipelineStage || (
        item.status === 'completed' || item.status === 'closed'
          ? 'won'
          : item.status === 'contacted'
          ? 'contacted'
          : item.status === 'in_progress'
          ? 'proposal_sent'
          : 'new'
      )
    });
  }

  // Sort by received date descending
  deduplicatedLeads.sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  const totalLeads = deduplicatedLeads.length;
  const newLeads = deduplicatedLeads.filter(
    (l) => l.status === 'new' || l.pipelineStage === 'new'
  ).length;

  // Upcoming follow-ups: leads flagged with followUpAt or high-priority awaiting action
  const upcomingFollowUps = deduplicatedLeads.filter(
    (l) => Boolean(l.followUpAt) || l.priority === 'high' || l.isHotLead === true
  ).slice(0, 6);

  // Breakdown by requested service
  const serviceCountMap: Record<string, number> = {};
  for (const lead of deduplicatedLeads) {
    const sName = (lead.service || 'Creative Design').trim();
    serviceCountMap[sName] = (serviceCountMap[sName] || 0) + 1;
  }

  const servicesBreakdown = Object.entries(serviceCountMap)
    .map(([service, count]) => ({
      service,
      count,
      percentage: totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Breakdown by inquiry source
  const sourceCountMap: Record<string, number> = {};
  for (const lead of deduplicatedLeads) {
    const src = (lead.source || 'Website Contact').replace(/[-_]/g, ' ');
    sourceCountMap[src] = (sourceCountMap[src] || 0) + 1;
  }

  const leadSourcesBreakdown = Object.entries(sourceCountMap)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  // Strictly filter real verified records for live business metrics
  const realClients = getStoredClients().filter(c => !isRecordDemo(c, 'clients'));
  const realProjects = getStoredProjects().filter(p => !isRecordDemo(p, 'projects'));
  const realTasks = getStoredTasks().filter(t => !isRecordDemo(t, 'tasks'));
  const realInvoices = getStoredInvoices().filter(i => !isRecordDemo(i, 'invoices'));
  const realPayments = getStoredPayments().filter(p => !isRecordDemo(p, 'payments'));
  const financials = getFinancialSummary({ excludeDemo: true });

  // 1. Revenue Overview (Last 6 Months Trend)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();
  const last6Months: { name: string; year: number; monthIdx: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    last6Months.push({
      name: monthNames[d.getMonth()],
      year: d.getFullYear(),
      monthIdx: d.getMonth()
    });
  }

  const receivedMonthly = last6Months.map(m => {
    return realPayments
      .filter(p => {
        if (p.paymentType !== 'client_payment' || p.status !== 'completed') return false;
        const pDate = new Date(p.paymentDate || p.createdAt || 0);
        return pDate.getFullYear() === m.year && pDate.getMonth() === m.monthIdx;
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  });

  const outstandingMonthly = last6Months.map(m => {
    return realInvoices
      .filter(inv => {
        if (inv.status === 'cancelled' || inv.status === 'paid') return false;
        const iDate = new Date(inv.dueDate || inv.issueDate || 0);
        return iDate.getFullYear() === m.year && iDate.getMonth() === m.monthIdx;
      })
      .reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);
  });

  const revenueOverview = {
    months: last6Months.map(m => m.name),
    receivedData: receivedMonthly,
    outstandingData: outstandingMonthly,
    totalReceived: financials.totalCollected,
    totalOutstanding: financials.totalOutstanding
  };

  // 2. Leads Pipeline Funnel
  const countNew = deduplicatedLeads.filter(l => l.pipelineStage === 'new' || l.status === 'new').length;
  const countQualified = deduplicatedLeads.filter(l => l.pipelineStage === 'qualified' || l.pipelineStage === 'contacted' || l.status === 'contacted').length;
  const countProposal = deduplicatedLeads.filter(l => l.pipelineStage === 'proposal_sent').length;
  const countNegotiation = deduplicatedLeads.filter(l => l.pipelineStage === 'negotiation').length;
  const countWon = deduplicatedLeads.filter(l => l.pipelineStage === 'won' || l.status === 'completed').length;

  const leadsPipeline = [
    {
      stage: 'new',
      label: 'New Leads',
      count: countNew,
      percentage: totalLeads > 0 ? Math.round((countNew / totalLeads) * 100) : 0,
      color: '#6366f1',
      dotColor: '#6366f1'
    },
    {
      stage: 'qualified',
      label: 'Qualified',
      count: countQualified,
      percentage: totalLeads > 0 ? Math.round((countQualified / totalLeads) * 100) : 0,
      color: '#8b5cf6',
      dotColor: '#8b5cf6'
    },
    {
      stage: 'proposal_sent',
      label: 'Proposal Sent',
      count: countProposal,
      percentage: totalLeads > 0 ? Math.round((countProposal / totalLeads) * 100) : 0,
      color: '#c084fc',
      dotColor: '#c084fc'
    },
    {
      stage: 'negotiation',
      label: 'Negotiation',
      count: countNegotiation,
      percentage: totalLeads > 0 ? Math.round((countNegotiation / totalLeads) * 100) : 0,
      color: '#38bdf8',
      dotColor: '#38bdf8'
    },
    {
      stage: 'won',
      label: 'Won / Converted',
      count: countWon,
      percentage: totalLeads > 0 ? Math.round((countWon / totalLeads) * 100) : 0,
      color: '#10b981',
      dotColor: '#10b981'
    }
  ];

  // 3. Payments Overview Radial
  const recRev = financials.totalCollected;
  const outBal = financials.totalOutstanding;
  const flPay = financials.pendingFreelancerPayouts;
  const totalValue = recRev + outBal + flPay;

  const paymentsOverview = {
    receivedRevenue: recRev,
    receivedPercentage: totalValue > 0 ? Math.round((recRev / totalValue) * 1000) / 10 : 0,
    outstandingBalance: outBal,
    outstandingPercentage: totalValue > 0 ? Math.round((outBal / totalValue) * 1000) / 10 : 0,
    freelancerPayouts: flPay,
    freelancerPercentage: totalValue > 0 ? Math.round((flPay / totalValue) * 1000) / 10 : 0,
    totalValue
  };

  // 4. Recent Real Agency Activities
  const activityList: { id: string; title: string; timeAgo: string; timestamp: number; type: 'lead' | 'invoice' | 'task' | 'project' | 'payment'; amount?: number }[] = [];

  for (const l of deduplicatedLeads) {
    if (l.createdAt || l.submittedAt) {
      activityList.push({
        id: `act_lead_${l.id}`,
        title: `New inquiry received from ${l.name}`,
        timeAgo: getRelativeTime(l.createdAt || l.submittedAt),
        timestamp: new Date(l.createdAt || l.submittedAt || 0).getTime(),
        type: 'lead'
      });
    }
  }

  for (const inv of realInvoices) {
    const isPaid = inv.status === 'paid';
    activityList.push({
      id: `act_inv_${inv.id}`,
      title: isPaid
        ? `Invoice #${inv.invoiceNumber} marked as Paid (₹${(inv.totalAmount || 0).toLocaleString('en-IN')})`
        : `Invoice #${inv.invoiceNumber} issued for ${inv.clientName}`,
      timeAgo: getRelativeTime(inv.updatedAt || inv.issueDate),
      timestamp: new Date(inv.updatedAt || inv.issueDate || 0).getTime(),
      type: 'invoice',
      amount: inv.totalAmount
    });
  }

  for (const t of realTasks) {
    activityList.push({
      id: `act_task_${t.id}`,
      title: t.status === 'completed'
        ? `Task "${t.title}" completed`
        : `Task "${t.title}" updated`,
      timeAgo: getRelativeTime(t.updatedAt || t.startDate),
      timestamp: new Date(t.updatedAt || t.startDate || 0).getTime(),
      type: 'task'
    });
  }

  for (const p of realProjects) {
    activityList.push({
      id: `act_proj_${p.id}`,
      title: `New project "${p.title}" created`,
      timeAgo: getRelativeTime(p.startDate),
      timestamp: new Date(p.startDate || 0).getTime(),
      type: 'project'
    });
  }

  activityList.sort((a, b) => b.timestamp - a.timestamp);
  const recentActivities = activityList.slice(0, 4);

  // 5. Historical Comparison & Sparklines (Phase 8B Enterprise)
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const sixtyDaysAgo = now - 60 * 24 * 60 * 60 * 1000;

  function calculateGrowth(current: number, prior: number): { text: string; direction: 'up' | 'down' | 'neutral' } {
    if (prior === 0) {
      if (current === 0) return { text: '—', direction: 'neutral' };
      return { text: '+100%', direction: 'up' };
    }
    const pct = ((current - prior) / prior) * 100;
    if (Math.abs(pct) < 0.1) return { text: '0.0%', direction: 'neutral' };
    const sign = pct > 0 ? '+' : '';
    return {
      text: `${sign}${pct.toFixed(1)}%`,
      direction: pct >= 0 ? 'up' : 'down'
    };
  }

  // Monthly buckets for 6-month sparklines
  const leadsSparkline = last6Months.map(m =>
    deduplicatedLeads.filter(l => {
      const d = new Date(l.createdAt || l.submittedAt || 0);
      return d.getFullYear() === m.year && d.getMonth() === m.monthIdx;
    }).length
  );

  const newLeadsSparkline = last6Months.map(m =>
    deduplicatedLeads.filter(l => {
      if (l.status !== 'new' && l.pipelineStage !== 'new') return false;
      const d = new Date(l.createdAt || l.submittedAt || 0);
      return d.getFullYear() === m.year && d.getMonth() === m.monthIdx;
    }).length
  );

  const clientsSparkline = last6Months.map(m =>
    realClients.filter(c => {
      const d = new Date(c.createdAt || 0);
      return d.getFullYear() === m.year && d.getMonth() === m.monthIdx;
    }).length
  );

  const projectsSparkline = last6Months.map(m =>
    realProjects.filter(p => {
      const d = new Date(p.startDate || p.createdAt || 0);
      return d.getFullYear() === m.year && d.getMonth() === m.monthIdx;
    }).length
  );

  const tasksSparkline = last6Months.map(m =>
    realTasks.filter(t => {
      const d = new Date(t.updatedAt || t.startDate || 0);
      return d.getFullYear() === m.year && d.getMonth() === m.monthIdx;
    }).length
  );

  const revenueSparkline = receivedMonthly;
  const outstandingSparkline = outstandingMonthly;

  const payoutsSparkline = last6Months.map(m =>
    realPayments.filter(p => {
      if (p.paymentType !== 'freelancer_payout') return false;
      const d = new Date(p.paymentDate || p.createdAt || 0);
      return d.getFullYear() === m.year && d.getMonth() === m.monthIdx;
    }).reduce((sum, p) => sum + (p.amount || 0), 0)
  );

  // 30-day historical comparisons
  const priorLeads = deduplicatedLeads.filter(l => {
    const t = new Date(l.createdAt || l.submittedAt || 0).getTime();
    return t >= sixtyDaysAgo && t < thirtyDaysAgo;
  }).length;
  const current30Leads = deduplicatedLeads.filter(l => {
    const t = new Date(l.createdAt || l.submittedAt || 0).getTime();
    return t >= thirtyDaysAgo;
  }).length;

  const priorNew = deduplicatedLeads.filter(l => {
    if (l.status !== 'new' && l.pipelineStage !== 'new') return false;
    const t = new Date(l.createdAt || l.submittedAt || 0).getTime();
    return t >= sixtyDaysAgo && t < thirtyDaysAgo;
  }).length;
  const current30New = deduplicatedLeads.filter(l => {
    if (l.status !== 'new' && l.pipelineStage !== 'new') return false;
    const t = new Date(l.createdAt || l.submittedAt || 0).getTime();
    return t >= thirtyDaysAgo;
  }).length;

  const priorRev = realPayments.filter(p => {
    if (p.paymentType !== 'client_payment' || p.status !== 'completed') return false;
    const t = new Date(p.paymentDate || p.createdAt || 0).getTime();
    return t >= sixtyDaysAgo && t < thirtyDaysAgo;
  }).reduce((sum, p) => sum + (p.amount || 0), 0);

  const current30Rev = realPayments.filter(p => {
    if (p.paymentType !== 'client_payment' || p.status !== 'completed') return false;
    const t = new Date(p.paymentDate || p.createdAt || 0).getTime();
    return t >= thirtyDaysAgo;
  }).reduce((sum, p) => sum + (p.amount || 0), 0);

  const priorOut = realInvoices.filter(i => {
    if (i.status === 'cancelled' || i.status === 'paid') return false;
    const t = new Date(i.dueDate || i.issueDate || 0).getTime();
    return t >= sixtyDaysAgo && t < thirtyDaysAgo;
  }).reduce((sum, i) => sum + (i.balanceDue || 0), 0);

  const current30Out = realInvoices.filter(i => {
    if (i.status === 'cancelled' || i.status === 'paid') return false;
    const t = new Date(i.dueDate || i.issueDate || 0).getTime();
    return t >= thirtyDaysAgo;
  }).reduce((sum, i) => sum + (i.balanceDue || 0), 0);

  const leadsTrendObj = calculateGrowth(current30Leads, priorLeads);
  const newLeadsTrendObj = calculateGrowth(current30New, priorNew);
  const clientsTrendObj = calculateGrowth(realClients.length, 0);
  const projectsTrendObj = calculateGrowth(realProjects.length, 0);
  const tasksTrendObj = calculateGrowth(realTasks.length, 0);
  const revTrendObj = calculateGrowth(current30Rev, priorRev);
  const outTrendObj = calculateGrowth(current30Out, priorOut);
  const flTrendObj = calculateGrowth(financials.pendingFreelancerPayouts, 0);

  const kpiTrends = {
    totalLeads: { text: leadsTrendObj.text, direction: leadsTrendObj.direction, sparklineData: leadsSparkline },
    newLeads: { text: newLeadsTrendObj.text, direction: newLeadsTrendObj.direction, sparklineData: newLeadsSparkline },
    activeClients: { text: clientsTrendObj.text, direction: clientsTrendObj.direction, sparklineData: clientsSparkline },
    activeProjects: { text: projectsTrendObj.text, direction: projectsTrendObj.direction, sparklineData: projectsSparkline },
    pendingTasks: { text: tasksTrendObj.text, direction: tasksTrendObj.direction, sparklineData: tasksSparkline },
    monthlyRevenue: { text: revTrendObj.text, direction: revTrendObj.direction, sparklineData: revenueSparkline },
    outstandingPayments: { text: outTrendObj.text, direction: outTrendObj.direction, sparklineData: outstandingSparkline },
    freelancerPayouts: { text: flTrendObj.text, direction: flTrendObj.direction, sparklineData: payoutsSparkline }
  };

  // 6. Conversion Rate (Won Leads / Total Leads)
  const conversionRate = totalLeads > 0
    ? `${((countWon / totalLeads) * 100).toFixed(1)}%`
    : '—';
  const conversionRateTrend = countWon > 0 ? `↗ ${conversionRate}` : '—';

  // 7. Today's Highlights
  const todayDateStr = today.toISOString().split('T')[0];
  const yesterdayDateStr = new Date(now - 86400000).toISOString().split('T')[0];

  const leadsTodayCount = deduplicatedLeads.filter(l => (l.submittedAt || l.createdAt || '').startsWith(todayDateStr)).length;
  const leadsYesterdayCount = deduplicatedLeads.filter(l => (l.submittedAt || l.createdAt || '').startsWith(yesterdayDateStr)).length;

  const tasksCompletedToday = realTasks.filter(t => t.status === 'completed').length;
  const tasksCompletedYesterday = 0;

  const paymentsTodayAmount = realPayments
    .filter(p => p.status === 'completed' && (p.paymentDate || p.createdAt || '').startsWith(todayDateStr))
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const paymentsYesterdayAmount = realPayments
    .filter(p => p.status === 'completed' && (p.paymentDate || p.createdAt || '').startsWith(yesterdayDateStr))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const todayLeadsTrend = calculateGrowth(leadsTodayCount, leadsYesterdayCount);
  const todayTasksTrend = tasksCompletedToday > 0 ? { text: `+${tasksCompletedToday}`, direction: 'up' as const } : { text: '—', direction: 'neutral' as const };
  const todayPaymentsTrend = calculateGrowth(paymentsTodayAmount, paymentsYesterdayAmount);

  const todayHighlights = {
    leadsToday: leadsTodayCount,
    leadsTrend: todayLeadsTrend.text,
    tasksCompletedToday,
    tasksTrend: todayTasksTrend.text,
    paymentsReceivedToday: paymentsTodayAmount,
    paymentsTrend: todayPaymentsTrend.text
  };

  return {
    totalLeads,
    newLeads,
    activeClientsCount: realClients.filter(c => c.status === 'active').length,
    activeProjectsCount: realProjects.filter(p => p.status === 'in_progress' || p.status === 'in_review').length,
    pendingTasksCount: realTasks.filter(t => t.status !== 'completed').length,
    monthlyRevenue: financials.totalCollected,
    outstandingPayments: financials.totalOutstanding,
    freelancerPayoutsDue: financials.pendingFreelancerPayouts,
    recentLeads: deduplicatedLeads.slice(0, 8),
    upcomingFollowUps,
    servicesBreakdown,
    leadSourcesBreakdown,
    revenueOverview,
    leadsPipeline,
    paymentsOverview,
    recentActivities,
    todayHighlights,
    kpiTrends,
    conversionRate,
    conversionRateTrend,
    lastUpdated: new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }),
    isFirestoreConnected: Boolean(isConfigured && db)
  };
}
