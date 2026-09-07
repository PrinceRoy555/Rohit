import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  LayoutDashboard,
  Inbox,
  Clock,
  Flame,
  Briefcase,
  Wrench,
  MessageSquare,
  Sparkles,
  FileText,
  ImageIcon,
  Palette,
  Layers,
  Sliders,
  Menu as MenuIcon,
  Globe,
  History,
  Shield,
  Send,
  Eye,
  Download,
  Moon,
  Sun,
  LogOut,
  X,
  CornerDownLeft,
  ArrowRight
} from 'lucide-react';
import { InquiryRecord } from '../../../types/cms';

export interface CommandItem {
  id: string;
  label: string;
  category: 'Navigation' | 'Actions' | 'Leads';
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  keywords?: string[];
  action: () => void;
}

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, options?: any) => void;
  onPublish: () => void;
  onTogglePreview: () => void;
  isPreviewMode: boolean;
  hasUnpublishedChanges: boolean;
  onToggleTheme: () => void;
  onViewLiveSite: () => void;
  onLogout: () => void;
  leads?: InquiryRecord[];
  onOpenLead?: (lead: InquiryRecord) => void;
}

export const CommandMenu: React.FC<CommandMenuProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onPublish,
  onTogglePreview,
  isPreviewMode,
  hasUnpublishedChanges,
  onToggleTheme,
  onViewLiveSite,
  onLogout,
  leads = [],
  onOpenLead,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Base navigation items
  const navItems: CommandItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      category: 'Navigation',
      icon: LayoutDashboard,
      keywords: ['home', 'stats', 'analytics', 'kpi', 'summary'],
      action: () => {
        onNavigate('dashboard');
        onClose();
      },
    },
    {
      id: 'inquiries-all',
      label: 'CRM: All Inquiries & Leads',
      category: 'Navigation',
      icon: Inbox,
      keywords: ['leads', 'contacts', 'inbox', 'messages', 'quotes'],
      action: () => {
        onNavigate('inquiries', { view: 'inbox' });
        onClose();
      },
    },
    {
      id: 'inquiries-followups',
      label: 'CRM: Due Follow-ups',
      category: 'Navigation',
      icon: Clock,
      keywords: ['reminders', 'followup', 'tasks', 'calls', 'overdue'],
      action: () => {
        onNavigate('inquiries', { view: 'followups', followUpFilter: 'today' });
        onClose();
      },
    },
    {
      id: 'inquiries-hot',
      label: 'CRM: Hot Leads Priority',
      category: 'Navigation',
      icon: Flame,
      keywords: ['high priority', 'qualified', 'hot', 'deals'],
      action: () => {
        onNavigate('inquiries', { view: 'hot_leads' });
        onClose();
      },
    },
    {
      id: 'portfolio',
      label: 'Portfolio Projects',
      category: 'Navigation',
      icon: Briefcase,
      keywords: ['case studies', 'works', 'projects', 'designs'],
      action: () => {
        onNavigate('portfolio');
        onClose();
      },
    },
    {
      id: 'services',
      label: 'Services & Pricing',
      category: 'Navigation',
      icon: Wrench,
      keywords: ['pricing', 'plans', 'offerings', 'packages'],
      action: () => {
        onNavigate('services');
        onClose();
      },
    },
    {
      id: 'testimonials',
      label: 'Client Testimonials',
      category: 'Navigation',
      icon: MessageSquare,
      keywords: ['reviews', 'ratings', 'social proof'],
      action: () => {
        onNavigate('testimonials');
        onClose();
      },
    },
    {
      id: 'skills',
      label: 'Skills & Experience',
      category: 'Navigation',
      icon: Sparkles,
      keywords: ['technologies', 'tools', 'work history'],
      action: () => {
        onNavigate('skills');
        onClose();
      },
    },
    {
      id: 'insights',
      label: 'AI Insights & Blog Studio',
      category: 'Navigation',
      icon: FileText,
      keywords: ['articles', 'generator', 'ai', 'posts', 'content'],
      action: () => {
        onNavigate('insights');
        onClose();
      },
    },
    {
      id: 'media',
      label: 'Media & Asset Library',
      category: 'Navigation',
      icon: ImageIcon,
      keywords: ['images', 'uploads', 'cdn', 'pictures'],
      action: () => {
        onNavigate('media');
        onClose();
      },
    },
    {
      id: 'customizer',
      label: 'Visual Customizer & Colors',
      category: 'Navigation',
      icon: Palette,
      keywords: ['themes', 'branding', 'fonts', 'typography', 'colors'],
      action: () => {
        onNavigate('customizer');
        onClose();
      },
    },
    {
      id: 'templates',
      label: 'Template Reselling Hub',
      category: 'Navigation',
      icon: Layers,
      keywords: ['presets', 'store', 'export template'],
      action: () => {
        onNavigate('templates');
        onClose();
      },
    },
    {
      id: 'sections',
      label: 'Pages & Section Layouts',
      category: 'Navigation',
      icon: Sliders,
      keywords: ['visibility', 'homepage', 'ordering'],
      action: () => {
        onNavigate('sections');
        onClose();
      },
    },
    {
      id: 'navigation',
      label: 'Navigation & Footer Settings',
      category: 'Navigation',
      icon: MenuIcon,
      keywords: ['links', 'socials', 'header'],
      action: () => {
        onNavigate('navigation');
        onClose();
      },
    },
    {
      id: 'seo',
      label: 'SEO & Social Graph',
      category: 'Navigation',
      icon: Globe,
      keywords: ['meta tags', 'og image', 'google search', 'indexing'],
      action: () => {
        onNavigate('seo');
        onClose();
      },
    },
    {
      id: 'revisions',
      label: 'Revision History & Rollback',
      category: 'Navigation',
      icon: History,
      keywords: ['snapshots', 'restore', 'versions', 'backup'],
      action: () => {
        onNavigate('revisions');
        onClose();
      },
    },
    {
      id: 'security',
      label: 'Users & Security Audit',
      category: 'Navigation',
      icon: Shield,
      keywords: ['roles', 'permissions', 'admin', 'audit'],
      action: () => {
        onNavigate('security');
        onClose();
      },
    },
  ];

  // Quick action items
  const actionItems: CommandItem[] = [
    {
      id: 'action-publish',
      label: hasUnpublishedChanges ? 'Publish Changes Live' : 'Re-Publish Live Website',
      category: 'Actions',
      icon: Send,
      badge: hasUnpublishedChanges ? 'Draft Ready' : 'Published',
      keywords: ['deploy', 'publish', 'save', 'live'],
      action: () => {
        onPublish();
        onClose();
      },
    },
    {
      id: 'action-preview',
      label: isPreviewMode ? 'Exit Draft Preview' : 'Enable Draft Preview',
      category: 'Actions',
      icon: Eye,
      badge: isPreviewMode ? 'Active' : undefined,
      keywords: ['preview', 'draft mode', 'staging'],
      action: () => {
        onTogglePreview();
        onClose();
      },
    },
    {
      id: 'action-theme',
      label: 'Toggle Dark / Light Theme',
      category: 'Actions',
      icon: Sun,
      keywords: ['dark mode', 'light mode', 'appearance', 'theme'],
      action: () => {
        onToggleTheme();
        onClose();
      },
    },
    {
      id: 'action-livesite',
      label: 'View Public Website (Exit Admin)',
      category: 'Actions',
      icon: Globe,
      keywords: ['live', 'visit', 'public', 'portfolio'],
      action: () => {
        onViewLiveSite();
        onClose();
      },
    },
    {
      id: 'action-logout',
      label: 'Sign Out of Admin Session',
      category: 'Actions',
      icon: LogOut,
      keywords: ['logout', 'signout', 'exit'],
      action: () => {
        onLogout();
        onClose();
      },
    },
  ];

  // Searchable lead items (top 15 recent)
  const leadItems: CommandItem[] = leads.slice(0, 15).map((lead) => ({
    id: `lead-${lead.id}`,
    label: `${lead.name} — ${lead.service || 'Inquiry'} (${lead.status})`,
    category: 'Leads' as const,
    icon: Inbox,
    badge: lead.budgetRange || undefined,
    keywords: [
      lead.name,
      lead.email || '',
      lead.phone || '',
      lead.service || '',
      lead.businessName || '',
      lead.status,
    ],
    action: () => {
      if (onOpenLead) {
        onOpenLead(lead);
      } else {
        onNavigate('inquiries');
      }
      onClose();
    },
  }));

  const allItems = [...actionItems, ...navItems, ...leadItems];

  const filteredItems = allItems.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const matchLabel = item.label.toLowerCase().includes(q);
    const matchKeywords = item.keywords?.some((k) => k.toLowerCase().includes(q));
    return matchLabel || matchKeywords;
  });

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev <= 0 ? (filteredItems.length || 1) - 1 : prev - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected) {
          selected.action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  // Keep selected item in view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      );
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  // Group filtered items by category
  const categories = ['Actions', 'Navigation', 'Leads'] as const;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-xl bg-bg-card border border-border-color rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] z-10 animate-in zoom-in-95 duration-150 text-text-primary"
        role="dialog"
        aria-modal="true"
        aria-label="Command Menu"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-border-color gap-3 bg-bg-secondary/30">
          <Search className="w-4 h-4 text-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a section, command, or search leads..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent border-none text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors"
            aria-label="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 space-y-3 divide-y divide-border-color/40"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-text-muted">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            categories.map((cat) => {
              const catItems = filteredItems.filter((i) => i.category === cat);
              if (catItems.length === 0) return null;

              return (
                <div key={cat} className="pt-2 first:pt-0 space-y-1">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted select-none">
                    {cat}
                  </div>
                  <div className="space-y-0.5">
                    {catItems.map((item) => {
                      const itemIndex = filteredItems.indexOf(item);
                      const isSelected = itemIndex === selectedIndex;
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.id}
                          data-index={itemIndex}
                          onClick={item.action}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left select-none ${
                            isSelected
                              ? 'bg-accent-primary/10 text-accent-primary dark:text-accent-secondary'
                              : 'text-text-primary hover:bg-bg-secondary/70'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`w-4 h-4 shrink-0 ${
                                isSelected
                                  ? 'text-accent-primary dark:text-accent-secondary'
                                  : 'text-text-muted'
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            {item.badge && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-bg-secondary border border-border-color text-text-muted">
                                {item.badge}
                              </span>
                            )}
                            {isSelected && (
                              <CornerDownLeft className="w-3 h-3 text-text-muted" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Keyboard hints footer */}
        <div className="px-4 py-2 border-t border-border-color bg-bg-secondary/40 flex items-center justify-between text-[11px] text-text-muted select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-bg-card border border-border-color text-[10px]">
                ↑↓
              </kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-bg-card border border-border-color text-[10px]">
                ↵
              </kbd>
              <span>Select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-bg-card border border-border-color text-[10px]">
                Esc
              </kbd>
              <span>Close</span>
            </span>
          </div>
          <span className="hidden xs:inline text-text-muted/70">
            Rohit Verma CMS Suite
          </span>
        </div>
      </div>
    </div>
  );
};
