import React, { useState, useEffect, useRef } from 'react';
import { CrmModuleId, CrmLead } from '../../../types/crm';
import { CRM_MODULES } from '../crmModules';
import { Search, X, ArrowRight, Sparkles, User, Briefcase, FileText } from 'lucide-react';

interface CrmSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule: (moduleId: CrmModuleId) => void;
  leads?: CrmLead[];
  onSelectLead?: (lead: CrmLead) => void;
}

export const CrmSearchModal: React.FC<CrmSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectModule,
  leads = [],
  onSelectLead
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  // Filter modules
  const matchingModules = CRM_MODULES.filter(
    (m) =>
      m.label.toLowerCase().includes(cleanQuery) ||
      m.category.toLowerCase().includes(cleanQuery) ||
      m.description.toLowerCase().includes(cleanQuery)
  );

  // Filter leads
  const matchingLeads = leads
    .filter(
      (l) =>
        l.name.toLowerCase().includes(cleanQuery) ||
        (l.email && l.email.toLowerCase().includes(cleanQuery)) ||
        (l.service && l.service.toLowerCase().includes(cleanQuery))
    )
    .slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-[12vh]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in-50 zoom-in-95 duration-150">
        {/* Search Bar Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search CRM modules, leads, clients, or commands..."
            className="w-full bg-transparent border-0 outline-hidden text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-400 border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Modules Group */}
          <div>
            <div className="px-3 py-1.5 text-[10px] font-extrabold tracking-wider uppercase text-slate-400">
              CRM Modules ({matchingModules.length})
            </div>
            <div className="space-y-1">
              {matchingModules.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onSelectModule(m.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {m.label}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-sm">
                        {m.description}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {m.category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Leads Group (if matching) */}
          {matchingLeads.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-extrabold tracking-wider uppercase text-slate-400">
                Matching Inquiries ({matchingLeads.length})
              </div>
              <div className="space-y-1">
                {matchingLeads.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      if (onSelectLead) onSelectLead(l);
                      else onSelectModule('leads');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {l.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {l.service} • {l.email || l.phone}
                        </div>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchingModules.length === 0 && matchingLeads.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching modules or leads found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
