import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MessageSquare,
  Copy,
  Check,
  Send,
  ExternalLink,
  ShieldCheck,
  Languages,
  User,
  Phone,
  Tag,
  DollarSign,
  FileText,
  Clock,
  Layers,
  HelpCircle,
  RefreshCw,
  Zap,
  Info,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import {
  CrmLead,
  AiReplyTone,
  AiReplyLanguage,
  AiReplyContext,
  ConfiguredServicePricing,
  QuickReplyTemplate
} from '../../../../types/crm';
import {
  getStoredLeads,
  getStoredInvoices,
  SERVICE_PRICING_CATALOG,
  QUICK_REPLY_TEMPLATES,
  generateContextualWhatsAppReply,
  normalizePhoneNumber
} from '../../../../services/crmStorageService';
import { CrmPageHeader } from '../../shared/CrmPageHeader';

interface AiAssistantModuleProps {
  onNavigateToModule?: (moduleId: any) => void;
}

export const AiAssistantModule: React.FC<AiAssistantModuleProps> = ({ onNavigateToModule }) => {
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');

  // Form Inputs
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [serviceName, setServiceName] = useState<string>(SERVICE_PRICING_CATALOG[0].service);
  const [clientMessage, setClientMessage] = useState<string>('');
  const [context, setContext] = useState<AiReplyContext>('general_inquiry');
  const [language, setLanguage] = useState<AiReplyLanguage>('hinglish');
  const [tone, setTone] = useState<AiReplyTone>('polite');

  // Generated Output
  const [generatedDraft, setGeneratedDraft] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeRateCard, setActiveRateCard] = useState<ConfiguredServicePricing>(SERVICE_PRICING_CATALOG[0]);

  // Load leads
  useEffect(() => {
    const loadedLeads = getStoredLeads();
    setLeads(loadedLeads);
  }, []);

  // When a lead is selected from the dropdown, autofill
  const handleSelectLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    if (!leadId) return;

    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      setClientName(lead.name || '');
      setClientPhone(lead.phone || '');
      if (lead.service) {
        setServiceName(lead.service);
        const match = SERVICE_PRICING_CATALOG.find(
          (s) =>
            s.service.toLowerCase().includes(lead.service.toLowerCase()) ||
            lead.service.toLowerCase().includes(s.service.toLowerCase())
        );
        if (match) setActiveRateCard(match);
      }
      if (lead.message) {
        setClientMessage(lead.message);
      }
    }
  };

  // When service changes, update active rate card
  const handleServiceChange = (serviceTitle: string) => {
    setServiceName(serviceTitle);
    const match = SERVICE_PRICING_CATALOG.find((s) => s.service === serviceTitle);
    if (match) setActiveRateCard(match);
  };

  // Generate Reply
  const handleGenerateReply = () => {
    const res = generateContextualWhatsAppReply({
      clientName,
      clientPhone,
      serviceName,
      context,
      language,
      tone,
      customNotes: clientMessage
    });
    setGeneratedDraft(res.replyText);
    if (res.rateInfo) setActiveRateCard(res.rateInfo);
  };

  // Auto-generate on first mount or parameters change
  useEffect(() => {
    handleGenerateReply();
  }, [clientName, clientPhone, serviceName, context, language, tone]);

  // Copy trigger
  const handleCopy = () => {
    if (!generatedDraft) return;
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Open WhatsApp
  const handleOpenWhatsApp = () => {
    if (!generatedDraft) return;
    const digits = normalizePhoneNumber(clientPhone);
    const encoded = encodeURIComponent(generatedDraft);
    const url = digits
      ? `https://wa.me/91${digits}?text=${encoded}`
      : `https://wa.me/message/H4JLHPJ3NNGOK1?text=${encoded}`;
    window.open(url, '_blank');
  };

  // Apply quick template
  const handleApplyTemplate = (tmpl: QuickReplyTemplate) => {
    let replaced = tmpl.content
      .replace(/{clientName}/g, clientName || 'Client')
      .replace(/{serviceName}/g, serviceName)
      .replace(/{priceRange}/g, activeRateCard.typicalRange)
      .replace(/{timeline}/g, activeRateCard.timeline)
      .replace(/{deliverables}/g, activeRateCard.deliverables.map((d) => `• ${d}`).join('\n'))
      .replace(/{invoiceNumber}/g, 'RW-INV-2026-001')
      .replace(/{balanceDue}/g, '42,500')
      .replace(/{dueDate}/g, 'Nov 20, 2026')
      .replace(/{projectTitle}/g, 'Creative Production')
      .replace(/{reviewUrl}/g, 'https://drive.google.com/sample-review');

    setGeneratedDraft(replaced);
    setLanguage(tmpl.language);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header */}
      <CrmPageHeader
        title="AI WhatsApp Reply Assistant"
        subtitle="Generate rapid, context-aware WhatsApp responses based on verified studio rate cards"
        icon={Sparkles}
        actions={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#7c3aed] dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Zero-Leakage Local Engine</span>
            </span>
          </div>
        }
      />

      {/* 2. Privacy & Deterministic Rate Card Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-transparent border border-violet-200 dark:border-violet-900/40 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-violet-600 text-white shrink-0 mt-0.5 shadow-sm">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Deterministic Client-Side Intelligence</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-mono font-bold">
              No API Fees • No Hallucinations
            </span>
          </div>
          <p className="mt-0.5 text-slate-600 dark:text-slate-400 leading-relaxed">
            All replies are crafted using verified Rohitwork rates and service specifications. Client data stays 100% inside your browser session and is never sent to unauthorized third-party LLMs. Messages open directly in WhatsApp with zero automated bot intervention.
          </p>
        </div>
      </div>

      {/* 3. Main 2-Column Grid: Configurator on Left, Generated Draft on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 Cols): Inputs & Context Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-violet-500" />
              <span>Client & Lead Context</span>
            </h3>

            {/* Quick Select from existing Leads */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Auto-fill from Recent Leads
              </label>
              <select
                value={selectedLeadId}
                onChange={(e) => handleSelectLead(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
              >
                <option value="">-- Choose lead (or enter manually below) --</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} {l.service ? `• ${l.service}` : ''} ({l.phone || l.email || 'Lead'})
                  </option>
                ))}
              </select>
            </div>

            {/* Client Name & Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  WhatsApp Phone
                </label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            {/* Service & Rate Card Link */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Creative Service
              </label>
              <select
                value={serviceName}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
              >
                {SERVICE_PRICING_CATALOG.map((s) => (
                  <option key={s.id} value={s.service}>
                    {s.service} (Starts ₹{s.startingPrice.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            {/* Conversation Context */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Conversation Objective
              </label>
              <select
                value={context}
                onChange={(e) => setContext(e.target.value as AiReplyContext)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
              >
                <option value="general_inquiry">General Inquiry / Welcome</option>
                <option value="pricing_quote">Price & Deliverables Estimate</option>
                <option value="project_milestone">Milestone Review & Draft Share</option>
                <option value="payment_reminder">Invoice Payment Follow-up</option>
                <option value="delay_notice">Schedule / Revision Update</option>
                <option value="deal_closing">Closing & Agreement Request</option>
                <option value="thank_you">Thank You & Referral</option>
              </select>
            </div>

            {/* Language Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Language Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'hinglish', label: 'Hinglish (Recommended)' },
                  { id: 'en', label: 'English (Formal)' },
                  { id: 'hi', label: 'Hindi (हिंदी)' }
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLanguage(l.id as AiReplyLanguage)}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                      language === l.id
                        ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-violet-300'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tone of Voice
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'polite', label: 'Polite' },
                  { id: 'confident', label: 'Confident' },
                  { id: 'brief', label: 'Brief' },
                  { id: 'sales', label: 'Sales Pitch' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id as AiReplyTone)}
                    className={`py-1.5 px-1.5 rounded-lg text-[10px] font-bold border text-center transition-all ${
                      tone === t.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Client Inbound Message / Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Client's Incoming Query / Custom Context
              </label>
              <textarea
                rows={2}
                value={clientMessage}
                onChange={(e) => setClientMessage(e.target.value)}
                placeholder="Paste client inquiry message here to weave specific requirements into the response..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
            </div>
          </div>

          {/* Rate Card Card (Official) */}
          <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-2.5">
            <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-violet-500" />
                <span>Verified Rate Card: {activeRateCard.service}</span>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                {activeRateCard.typicalRange}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Standard Turnaround: {activeRateCard.timeline}</span>
            </div>
            <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
              {activeRateCard.deliverables.map((d, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column (7 Cols): Generated WhatsApp Draft & Quick Templates */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Draft Area */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Generated WhatsApp Reply Draft
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Ready to copy or dispatch directly to WhatsApp
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateReply}
                className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors"
                title="Regenerate Draft"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Editable Draft Textarea */}
            <div className="relative">
              <textarea
                rows={11}
                value={generatedDraft}
                onChange={(e) => setGeneratedDraft(e.target.value)}
                className="w-full p-4 text-xs font-medium leading-relaxed rounded-2xl bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-200/80 dark:border-emerald-800/40 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
              />
              <div className="absolute right-3 bottom-3 text-[10px] text-slate-400">
                {generatedDraft.length} chars • {generatedDraft.split(/\s+/).filter(Boolean).length} words
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>Direct WhatsApp action:</span>
                <span className="font-mono text-slate-600 dark:text-slate-300">
                  {clientPhone ? `+91 ${clientPhone}` : 'Rohitwork Business Link'}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Open WhatsApp</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Reply Template Library */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Studio Quick Reply Library</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {QUICK_REPLY_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50/20 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      <span className="line-clamp-1">{tmpl.title}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {tmpl.language}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                      {tmpl.description}
                    </p>
                  </div>
                  <div className="mt-2 text-[10px] text-violet-600 dark:text-violet-400 font-semibold flex items-center gap-0.5">
                    <span>Use Template</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
