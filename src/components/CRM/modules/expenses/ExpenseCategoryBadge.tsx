import React from 'react';
import {
  Code,
  Users,
  Video,
  Megaphone,
  Building,
  Plane,
  Scale,
  MoreHorizontal
} from 'lucide-react';
import { CrmExpenseCategory } from '../../../../types/crm';

interface ExpenseCategoryBadgeProps {
  category: CrmExpenseCategory;
}

export const ExpenseCategoryBadge: React.FC<ExpenseCategoryBadgeProps> = ({ category }) => {
  switch (category) {
    case 'software':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
          <Code className="w-3 h-3 text-blue-500" />
          <span>SaaS & Software</span>
        </span>
      );
    case 'freelancer':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
          <Users className="w-3 h-3 text-indigo-500" />
          <span>Freelancer Payout</span>
        </span>
      );
    case 'studio_equipment':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/40">
          <Video className="w-3 h-3 text-violet-500" />
          <span>Studio & Gear</span>
        </span>
      );
    case 'marketing':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
          <Megaphone className="w-3 h-3 text-rose-500" />
          <span>Marketing & Ads</span>
        </span>
      );
    case 'office':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
          <Building className="w-3 h-3 text-amber-500" />
          <span>Office & Utilities</span>
        </span>
      );
    case 'travel':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/40">
          <Plane className="w-3 h-3 text-teal-500" />
          <span>Travel & Shoot</span>
        </span>
      );
    case 'legal_professional':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
          <Scale className="w-3 h-3 text-slate-500" />
          <span>Legal & CA</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          <MoreHorizontal className="w-3 h-3 text-slate-400" />
          <span>Other Expense</span>
        </span>
      );
  }
};
