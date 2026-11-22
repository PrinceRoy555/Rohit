import React from 'react';
import {
  CreditCard,
  Building,
  Calendar,
  ExternalLink,
  Edit,
  Trash2,
  Repeat,
  ShieldCheck,
  Tag,
  IndianRupee,
  Layers,
  FileCheck
} from 'lucide-react';
import { CrmExpense } from '../../../../types/crm';
import { ExpenseCategoryBadge } from './ExpenseCategoryBadge';
import { deleteExpenseWithCloud } from '../../../../services/crmStorageService';

interface ExpenseTableViewProps {
  expenses: CrmExpense[];
  onEditExpense: (expense: CrmExpense) => void;
  onRefresh?: () => void;
  onNavigateToProject?: (projectId: string) => void;
}

export const ExpenseTableView: React.FC<ExpenseTableViewProps> = ({
  expenses,
  onEditExpense,
  onRefresh,
  onNavigateToProject
}) => {
  const handleDeleteExpense = async (exp: CrmExpense, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmDel = window.confirm(
      `Delete expense record "${exp.title}" of ₹${exp.amount.toLocaleString('en-IN')}?`
    );
    if (!confirmDel) return;

    const res = await deleteExpenseWithCloud(exp.id);
    if (!res.success) {
      alert(res.error || 'Failed to delete business expense.');
      return;
    }
    if (onRefresh) onRefresh();
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <table className="w-full text-left border-collapse text-xs">
        {/* Header */}
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
            <th className="py-3.5 px-4">Expense & Vendor</th>
            <th className="py-3.5 px-4">Category</th>
            <th className="py-3.5 px-4">Amount (INR)</th>
            <th className="py-3.5 px-4">Recurring / Type</th>
            <th className="py-3.5 px-4">Project / Allocation</th>
            <th className="py-3.5 px-4">Date & Tax</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
          {expenses.map((exp) => {
            return (
              <tr
                key={exp.id}
                className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* 1. Expense & Vendor */}
                <td className="py-3.5 px-4">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900/40 mt-0.5">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {exp.title}
                        </span>
                        {exp.isDemo && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Demo
                          </span>
                        )}
                        {exp.freelancerPayoutId && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
                            Payout Synced
                          </span>
                        )}
                      </div>
                      {exp.vendor && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{exp.vendor}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* 2. Category */}
                <td className="py-3.5 px-4">
                  <ExpenseCategoryBadge category={exp.category} />
                </td>

                {/* 3. Amount */}
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    ₹{exp.amount.toLocaleString('en-IN')}
                  </div>
                  {exp.notes && (
                    <div className="text-[11px] text-slate-400 line-clamp-1 max-w-[180px] mt-0.5">
                      {exp.notes}
                    </div>
                  )}
                </td>

                {/* 4. Recurring / Type */}
                <td className="py-3.5 px-4">
                  {exp.isRecurring ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/40">
                      <Repeat className="w-3 h-3 text-violet-500" />
                      <span className="capitalize">{exp.recurringFrequency || 'Monthly'}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">
                      One-time Cost
                    </span>
                  )}
                </td>

                {/* 5. Project */}
                <td className="py-3.5 px-4">
                  {exp.projectId ? (
                    <span
                      onClick={() => {
                        if (exp.projectId && onNavigateToProject) {
                          onNavigateToProject(exp.projectId);
                        }
                      }}
                      className="text-[11px] text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Layers className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[140px]">{exp.projectId}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      General Overhead
                    </span>
                  )}
                </td>

                {/* 6. Date & Tax Deductible */}
                <td className="py-3.5 px-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>
                        {new Date(exp.date).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    {exp.taxDeductible !== false && (
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <FileCheck className="w-3 h-3" />
                        <span>Tax Deductible</span>
                      </div>
                    )}
                  </div>
                </td>

                {/* 7. Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    {/* Receipt link */}
                    {exp.receiptUrl && (
                      <a
                        href={exp.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors"
                        title="View Receipt / Invoice"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {/* Edit */}
                    <button
                      onClick={() => onEditExpense(exp)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                      title="Edit Expense"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={(e) => handleDeleteExpense(exp, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
