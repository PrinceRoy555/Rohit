import React from 'react';
import {
  Zap,
  UserPlus,
  Layers,
  FileText,
  Receipt,
  IndianRupee,
  MessageSquare
} from 'lucide-react';
import { CrmModuleId } from '../../../types/crm';
import { WHATSAPP_BUSINESS_URL } from '../../../data';

interface AgencyQuickActionsProps {
  onNavigateToModule: (moduleId: CrmModuleId) => void;
}

export const AgencyQuickActions: React.FC<AgencyQuickActionsProps> = ({
  onNavigateToModule
}) => {
  return (
    <div className="bg-gradient-to-br from-[#1b0d3d] via-[#241250] to-[#160b33] text-white p-5 rounded-2xl shadow-md border border-purple-900/50 flex flex-col justify-between">
      {/* 1. Header */}
      <div className="flex items-center gap-2.5 mb-3.5">
        <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 fill-purple-400 text-purple-300" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-white tracking-tight">
            Agency Quick Actions
          </h3>
          <p className="text-[11px] text-purple-200/70">
            Common tasks to manage your business faster.
          </p>
        </div>
      </div>

      {/* 2. Actions Grid (6 shortcuts) */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5 my-auto">
        {/* Action 1: Add Lead */}
        <button
          type="button"
          onClick={() => onNavigateToModule('leads')}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/40 transition-all text-center group cursor-pointer active:scale-95"
        >
          <UserPlus className="w-4 h-4 text-purple-300 group-hover:text-white transition-colors mb-1.5" />
          <span className="text-[11px] font-bold text-slate-200 group-hover:text-white leading-tight">
            Add Lead
          </span>
        </button>

        {/* Action 2: New Project */}
        <button
          type="button"
          onClick={() => onNavigateToModule('projects')}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/40 transition-all text-center group cursor-pointer active:scale-95"
        >
          <Layers className="w-4 h-4 text-purple-300 group-hover:text-white transition-colors mb-1.5" />
          <span className="text-[11px] font-bold text-slate-200 group-hover:text-white leading-tight">
            New Project
          </span>
        </button>

        {/* Action 3: Create Proposal */}
        <button
          type="button"
          onClick={() => onNavigateToModule('quotations')}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/40 transition-all text-center group cursor-pointer active:scale-95"
        >
          <FileText className="w-4 h-4 text-purple-300 group-hover:text-white transition-colors mb-1.5" />
          <span className="text-[11px] font-bold text-slate-200 group-hover:text-white leading-tight">
            Create Proposal
          </span>
        </button>

        {/* Action 4: Create Invoice */}
        <button
          type="button"
          onClick={() => onNavigateToModule('invoices')}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/40 transition-all text-center group cursor-pointer active:scale-95"
        >
          <Receipt className="w-4 h-4 text-purple-300 group-hover:text-white transition-colors mb-1.5" />
          <span className="text-[11px] font-bold text-slate-200 group-hover:text-white leading-tight">
            Create Invoice
          </span>
        </button>

        {/* Action 5: Record Payment */}
        <button
          type="button"
          onClick={() => onNavigateToModule('payments')}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/40 transition-all text-center group cursor-pointer active:scale-95"
        >
          <IndianRupee className="w-4 h-4 text-purple-300 group-hover:text-white transition-colors mb-1.5" />
          <span className="text-[11px] font-bold text-slate-200 group-hover:text-white leading-tight">
            Record Payment
          </span>
        </button>

        {/* Action 6: WhatsApp Business */}
        <a
          href={WHATSAPP_BUSINESS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 transition-all text-center group cursor-pointer active:scale-95"
        >
          <MessageSquare className="w-4 h-4 text-[#25D366] group-hover:scale-110 transition-transform mb-1.5" />
          <span className="text-[11px] font-bold text-emerald-300 leading-tight">
            WhatsApp Business
          </span>
        </a>
      </div>
    </div>
  );
};
