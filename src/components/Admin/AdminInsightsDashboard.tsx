import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Search,
  Sparkles,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  FileText,
  AlertCircle,
  Settings,
  X,
  Lock,
  LogOut,
  Save,
  Globe,
  Layers,
  Shield,
  ShieldCheck,
  Activity,
  UserCheck,
  KeyRound,
  EyeOff
} from 'lucide-react';
import { Insight, InsightStatus, InsightAutomationSettings } from '../../types';
import {
  loginAdmin,
  checkAdminSession,
  logoutAdmin,
  fetchAdminInsights,
  saveAdminInsight,
  deleteAdminInsight,
  setAdminInsightStatus,
  fetchAdminSettings,
  saveAdminSettings,
  generateAiInsight,
  fetchAdminAuditLogs,
  AuditLogEntry
} from '../../services/adminApi';
import ReactMarkdown from 'react-markdown';

interface AdminInsightsDashboardProps {
  onClose: () => void;
  onPreviewInsight?: (insight: Insight) => void;
}

const CATEGORIES = [
  'Graphic Design',
  'Motion Graphics',
  'Video Editing',
  'AI & Automation',
  'Brand Identity',
  'Social Media Strategy',
  'UI/UX Design',
  'Creative Direction'
];

const PRESET_COVERS = [
  { name: 'Abstract 3D Fluid', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Creative Workspace', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Video Production Studio', url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Brand Typography & Mockups', url: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Social Media Feed Analytics', url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Cyberpunk Neon Wave', url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80' }
];

export default function AdminInsightsDashboard({ onClose, onPreviewInsight }: AdminInsightsDashboardProps) {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isVerifyingSession, setIsVerifyingSession] = useState<boolean>(true);
  const [adminEmail, setAdminEmail] = useState<string>('workall724038@gmail.com');
  const [loginEmailInput, setLoginEmailInput] = useState<string>('workall724038@gmail.com');
  const [loginPasswordInput, setLoginPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);

  // Data states
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [automationSettings, setAutomationSettings] = useState<InsightAutomationSettings>({
    autoPublishEnabled: true,
    cadence: 'weekly',
    mode: 'auto-publish',
    targetCategories: CATEGORIES.slice(0, 5)
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);

  // Tabs & Navigation
  const [activeTab, setActiveTab] = useState<'insights' | 'editor' | 'automation' | 'audit'>('insights');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views'>('newest');

  // Editor Modal / State
  const [editingInsight, setEditingInsight] = useState<Partial<Insight> | null>(null);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [editorTagInput, setEditorTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // AI Generation State
  const [aiPromptTopic, setAiPromptTopic] = useState('');
  const [aiTargetCategory, setAiTargetCategory] = useState(CATEGORIES[0]);
  const [aiCustomKeywords, setAiCustomKeywords] = useState('');
  const [aiTargetStatus, setAiTargetStatus] = useState<'published' | 'review' | 'draft'>('published');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiGenerationStep, setAiGenerationStep] = useState<string>('');

  // Preview & Delete Modals
  const [previewArticle, setPreviewArticle] = useState<Insight | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // 1. Initial Session Check on Mount
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      setIsVerifyingSession(true);
      const res = await checkAdminSession();
      if (isMounted) {
        if (res.authenticated) {
          setIsAuthenticated(true);
          if (res.adminEmail) setAdminEmail(res.adminEmail);
          if (res.expiresAt) setSessionExpiresAt(res.expiresAt);
        } else {
          setIsAuthenticated(false);
        }
        setIsVerifyingSession(false);
      }
    }
    checkAuth();
    return () => { isMounted = false; };
  }, []);

  // 2. Lockout Countdown Timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  // 3. Load Data when Authenticated
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [insightsRes, settingsRes] = await Promise.all([
        fetchAdminInsights(),
        fetchAdminSettings()
      ]);

      if (insightsRes.error === 'SESSION_EXPIRED' || settingsRes.error === 'SESSION_EXPIRED') {
        setIsAuthenticated(false);
        setAuthError('Your administrator session has expired. Please log in again.');
        return;
      }

      if (insightsRes.success) {
        setInsights(insightsRes.insights);
      }
      if (settingsRes.success && settingsRes.settings) {
        setAutomationSettings(settingsRes.settings);
      }
    } catch (err) {
      console.error('Error loading admin insights:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAuditLogs = useCallback(async () => {
    setLoadingAuditLogs(true);
    try {
      const res = await fetchAdminAuditLogs();
      if (res.success) {
        setAuditLogs(res.logs);
      } else if (res.error === 'SESSION_EXPIRED') {
        setIsAuthenticated(false);
        setAuthError('Session expired. Please log in again.');
      }
    } finally {
      setLoadingAuditLogs(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
      if (activeTab === 'audit') {
        loadAuditLogs();
      }
    }
  }, [isAuthenticated, activeTab, loadAllData, loadAuditLogs]);

  // Handle Login Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmailInput.trim() || !loginPasswordInput) {
      setAuthError('Please enter both admin email and password.');
      return;
    }

    setIsLoggingIn(true);
    setAuthError('');

    try {
      const res = await loginAdmin(loginEmailInput.trim(), loginPasswordInput);
      if (res.success) {
        setIsAuthenticated(true);
        if (res.adminEmail) setAdminEmail(res.adminEmail);
        if (res.expiresAt) setSessionExpiresAt(res.expiresAt);
        setLoginPasswordInput('');
        setAuthError('');
      } else {
        setAuthError(res.error || 'Authentication failed. Please check credentials.');
        if (res.lockoutSeconds) {
          setLockoutSeconds(res.lockoutSeconds);
        }
      }
    } catch {
      setAuthError('Network error during authentication. Please retry.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await logoutAdmin();
    setIsAuthenticated(false);
    setSessionExpiresAt(null);
    setAuthError('');
  };

  // Open Create Form
  const handleOpenCreate = () => {
    setEditingInsight({
      title: '',
      slug: '',
      category: 'Graphic Design',
      shortDescription: '',
      content: '',
      featuredImage: PRESET_COVERS[0].url,
      tags: ['Graphic Design', 'Creative Strategy'],
      author: 'Rohit Verma',
      readingTime: '4 min read',
      seoTitle: '',
      seoDescription: '',
      status: 'published',
      isAiGenerated: false
    });
    setEditorMode('create');
    setEditorTagInput('');
    setActiveTab('editor');
  };

  // Open Edit Form
  const handleOpenEdit = (item: Insight) => {
    setEditingInsight({ ...item });
    setEditorMode('edit');
    setEditorTagInput('');
    setActiveTab('editor');
  };

  // Title change & slug auto-generation
  const handleTitleChange = (newTitle: string) => {
    if (!editingInsight) return;
    const generatedSlug = newTitle
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    setEditingInsight(prev => ({
      ...prev,
      title: newTitle,
      slug: prev?.slug && editorMode === 'edit' ? prev.slug : generatedSlug,
      seoTitle: prev?.seoTitle ? prev.seoTitle : `${newTitle} | Rohit Verma`
    }));
  };

  // Add Tag
  const handleAddTag = () => {
    if (!editorTagInput.trim() || !editingInsight) return;
    const currentTags = editingInsight.tags || [];
    if (!currentTags.includes(editorTagInput.trim())) {
      setEditingInsight(prev => ({
        ...prev,
        tags: [...currentTags, editorTagInput.trim()]
      }));
    }
    setEditorTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!editingInsight) return;
    setEditingInsight(prev => ({
      ...prev,
      tags: (prev?.tags || []).filter(t => t !== tagToRemove)
    }));
  };

  // Save Insight via Server API
  const handleSaveInsight = async (statusOverride?: InsightStatus) => {
    if (!editingInsight || !editingInsight.title?.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Article Title is required.' });
      return;
    }

    setIsSaving(true);
    setFeedbackMsg(null);

    const payload: Partial<Insight> = {
      ...editingInsight,
      status: statusOverride || editingInsight.status || 'published',
      slug: (editingInsight.slug || editingInsight.title || 'insight')
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '')
    };

    try {
      const res = await saveAdminInsight(payload);
      if (res.success && res.insight) {
        setFeedbackMsg({ type: 'success', text: `Insight "${res.insight.title}" saved successfully!` });
        await loadAllData();
        setTimeout(() => {
          setActiveTab('insights');
          setEditingInsight(null);
          setFeedbackMsg(null);
        }, 1200);
      } else if (res.error === 'SESSION_EXPIRED') {
        setIsAuthenticated(false);
        setAuthError('Session expired while saving. Please re-authenticate.');
      } else {
        setFeedbackMsg({ type: 'error', text: res.error || 'Failed to save insight.' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error occurred while saving.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Status Switcher (Publish / Draft / Review / Schedule)
  const handleToggleStatus = async (item: Insight, newStatus: InsightStatus) => {
    try {
      const res = await setAdminInsightStatus(item.id, newStatus);
      if (res.success) {
        await loadAllData();
      } else if (res.error === 'SESSION_EXPIRED') {
        setIsAuthenticated(false);
        setAuthError('Session expired. Please log in again.');
      }
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  // Delete Insight
  const handleDeleteInsight = async (id: string) => {
    try {
      const res = await deleteAdminInsight(id);
      if (res.success) {
        setDeleteConfirmId(null);
        await loadAllData();
      } else if (res.error === 'SESSION_EXPIRED') {
        setIsAuthenticated(false);
        setAuthError('Session expired. Please log in again.');
      }
    } catch (err) {
      console.error('Error deleting insight:', err);
    }
  };

  // Save Automation Settings
  const handleSaveAutomationSettings = async () => {
    setIsSaving(true);
    try {
      const res = await saveAdminSettings(automationSettings);
      if (res.success) {
        setFeedbackMsg({ type: 'success', text: 'Automation settings saved securely!' });
        setTimeout(() => setFeedbackMsg(null), 3000);
      } else if (res.error === 'SESSION_EXPIRED') {
        setIsAuthenticated(false);
        setAuthError('Session expired. Please log in again.');
      } else {
        setFeedbackMsg({ type: 'error', text: res.error || 'Failed to save settings.' });
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Failed to update automation settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger AI Generation
  const handleTriggerAiGeneration = async () => {
    setIsGeneratingAi(true);
    setAiGenerationStep('Synthesizing topic research & outline...');

    try {
      setTimeout(() => setAiGenerationStep('Drafting comprehensive 800-word article with Gemini Flash...'), 1500);
      setTimeout(() => setAiGenerationStep('Optimizing SEO metadata, slug, & read time calculation...'), 3500);
      setTimeout(() => setAiGenerationStep('Assigning curated visual theme and finalizing...'), 5000);

      const res = await generateAiInsight({
        topicPrompt: aiPromptTopic,
        targetCategory: aiTargetCategory,
        customKeywords: aiCustomKeywords,
        autoPublish: aiTargetStatus === 'published',
        mode: aiTargetStatus === 'review' ? 'save-as-review' : 'auto-publish'
      });

      if (res.success && res.insight) {
        await loadAllData();
        setAiPromptTopic('');
        setAiCustomKeywords('');
        setFeedbackMsg({
          type: 'success',
          text: `AI Insight "${res.insight.title}" generated and added to ${res.insight.status.toUpperCase()}!`
        });
        setActiveTab('insights');
      } else if (res.error === 'SESSION_EXPIRED') {
        setIsAuthenticated(false);
        setAuthError('Session expired. Please log in again.');
      } else {
        setFeedbackMsg({ type: 'error', text: res.error || 'Failed to generate AI insight.' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error executing AI generation.' });
    } finally {
      setIsGeneratingAi(false);
      setAiGenerationStep('');
    }
  };

  // Filter & Sort Insights
  const filteredInsights = insights.filter((item) => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesStatus && matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
    if (sortBy === 'oldest') return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
    if (sortBy === 'views') return (b.viewsCount || 0) - (a.viewsCount || 0);
    return 0;
  });

  // Metrics Count
  const countPublished = insights.filter(i => i.status === 'published').length;
  const countScheduled = insights.filter(i => i.status === 'scheduled').length;
  const countReview = insights.filter(i => i.status === 'review').length;
  const countDraft = insights.filter(i => i.status === 'draft').length;
  const countAi = insights.filter(i => i.isAiGenerated).length;

  // 1. Session Verifying Loading Screen
  if (isVerifyingSession) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-accent-primary mx-auto" />
          <p className="text-sm font-semibold text-text-primary">Verifying secure administrator session...</p>
        </div>
      </div>
    );
  }

  // 2. Render Login Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4" id="admin-login-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-bg-card border border-border-color rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-primary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center text-accent-primary mb-6">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <h2 className="text-2xl font-extrabold text-text-primary tracking-tight mb-2">
            CMS Admin Authentication
          </h2>
          <p className="text-text-secondary text-sm mb-6 leading-relaxed">
            Sign in with authorized administrator credentials to manage portfolio insights, trigger AI generation pipelines, and view security audits.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                Administrator Email
              </label>
              <input
                type="email"
                value={loginEmailInput}
                onChange={(e) => setLoginEmailInput(e.target.value)}
                placeholder="workall724038@gmail.com"
                className="w-full bg-bg-primary border border-border-color rounded-xl px-4 py-3 text-text-primary text-sm focus:outline-none focus:border-accent-primary transition-colors"
                required
                disabled={lockoutSeconds > 0 || isLoggingIn}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                Administrator Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPasswordInput}
                  onChange={(e) => setLoginPasswordInput(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full bg-bg-primary border border-border-color rounded-xl pl-4 pr-11 py-3 text-text-primary text-sm focus:outline-none focus:border-accent-primary transition-colors"
                  required
                  autoFocus
                  disabled={lockoutSeconds > 0 || isLoggingIn}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-1 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 p-3.5 rounded-xl border border-rose-500/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {lockoutSeconds > 0 && (
              <div className="flex items-center gap-2 text-amber-400 text-xs bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20">
                <Clock className="w-4 h-4 flex-shrink-0 animate-pulse" />
                <span>Account temporarily locked. Retry in {lockoutSeconds}s.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn || lockoutSeconds > 0}
              className="w-full bg-accent-primary hover:bg-accent-hover disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-accent-primary/20 transition-all text-sm cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Sign In to Admin CMS
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <span className="text-[11px] text-text-secondary">
                Zero-trust server authorization enforced for Rohit Verma (Unicivix Solutions).
              </span>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  // 3. Render Authenticated Dashboard
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col overflow-hidden" id="admin-insights-dashboard">
      {/* Top Navbar */}
      <header className="bg-bg-card border-b border-border-color px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center text-accent-primary font-extrabold text-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-text-primary flex items-center gap-2">
                Latest Insights CMS
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Authenticated
                </span>
              </h1>
              <div className="text-xs text-text-secondary flex items-center gap-2">
                <span>Admin: <strong className="text-text-primary">{adminEmail}</strong></span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="hidden md:flex items-center bg-bg-primary border border-border-color rounded-xl p-1 ml-6">
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'insights'
                  ? 'bg-accent-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              All Insights ({insights.length})
            </button>
            <button
              onClick={handleOpenCreate}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'editor'
                  ? 'bg-accent-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Create Insight
            </button>
            <button
              onClick={() => setActiveTab('automation')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'automation'
                  ? 'bg-accent-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              AI Automation Hub
            </button>
            <button
              onClick={() => { setActiveTab('audit'); loadAuditLogs(); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'audit'
                  ? 'bg-accent-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Audit Logs
            </button>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            title="Refresh database records"
            className="p-2 rounded-xl bg-bg-primary hover:bg-bg-secondary border border-border-color text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-accent-primary' : ''}`} />
          </button>
          <button
            onClick={handleLogout}
            title="Securely Log Out"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-bg-primary hover:bg-rose-500/10 hover:border-rose-500/30 text-text-secondary hover:text-rose-400 border border-border-color text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-bg-primary hover:bg-bg-secondary border border-border-color text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`px-6 py-3 text-xs font-bold flex items-center justify-between z-30 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-400 border-b border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-400 border-b border-rose-500/30'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-current hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-bg-primary p-6">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* =========================================================================
              VIEW 1: ALL INSIGHTS MANAGEMENT
             ========================================================================= */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              {/* Metrics Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="bg-bg-card border border-border-color rounded-2xl p-4">
                  <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Total Insights</div>
                  <div className="text-2xl font-extrabold text-text-primary">{insights.length}</div>
                </div>
                <div className="bg-bg-card border border-emerald-500/20 rounded-2xl p-4">
                  <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">Published</div>
                  <div className="text-2xl font-extrabold text-emerald-400">{countPublished}</div>
                </div>
                <div className="bg-bg-card border border-amber-500/20 rounded-2xl p-4">
                  <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">Scheduled</div>
                  <div className="text-2xl font-extrabold text-amber-400">{countScheduled}</div>
                </div>
                <div className="bg-bg-card border border-sky-500/20 rounded-2xl p-4">
                  <div className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">In Review</div>
                  <div className="text-2xl font-extrabold text-sky-400">{countReview}</div>
                </div>
                <div className="bg-bg-card border border-purple-500/20 rounded-2xl p-4">
                  <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">AI Generated</div>
                  <div className="text-2xl font-extrabold text-purple-400">{countAi}</div>
                </div>
              </div>

              {/* Filters & Action Bar */}
              <div className="bg-bg-card border border-border-color rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search box */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, keywords, tags, or description..."
                    className="w-full bg-bg-primary border border-border-color rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-primary"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-bg-primary border border-border-color rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="review">In Review</option>
                    <option value="draft">Drafts</option>
                  </select>

                  {/* Category Filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-bg-primary border border-border-color rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  {/* Sort Filter */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-bg-primary border border-border-color rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="views">Most Views</option>
                  </select>

                  <button
                    onClick={handleOpenCreate}
                    className="bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    New Insight
                  </button>
                </div>
              </div>

              {/* Insights List */}
              {loading ? (
                <div className="bg-bg-card border border-border-color rounded-2xl p-12 text-center text-text-secondary flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-accent-primary" />
                  <span className="text-sm font-semibold">Loading insights from server...</span>
                </div>
              ) : filteredInsights.length === 0 ? (
                <div className="bg-bg-card border border-border-color rounded-2xl p-12 text-center text-text-secondary">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <h3 className="text-base font-bold text-text-primary mb-1">No insights match your filter</h3>
                  <p className="text-xs text-text-secondary max-w-sm mx-auto mb-4">
                    Try changing your search keywords, clearing status filters, or generate a new article with AI.
                  </p>
                  <button
                    onClick={handleOpenCreate}
                    className="bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Create New Insight
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredInsights.map((item) => (
                    <div
                      key={item.id}
                      className="bg-bg-card border border-border-color hover:border-accent-primary/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all shadow-sm group"
                    >
                      {/* Left: Thumbnail & Title Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="relative w-24 h-20 rounded-xl overflow-hidden bg-bg-primary border border-border-color flex-shrink-0">
                          <img
                            src={item.featuredImage}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {item.isAiGenerated && (
                            <div className="absolute top-1 right-1 bg-sky-500 text-white p-0.5 rounded-md text-[9px]" title="AI Generated">
                              <Sparkles className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            {/* Status Badge */}
                            <span
                              className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                item.status === 'published'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : item.status === 'scheduled'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : item.status === 'review'
                                  ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                                  : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                              }`}
                            >
                              {item.status}
                            </span>

                            <span className="text-[11px] font-semibold text-accent-primary">
                              {item.category}
                            </span>

                            <span className="text-[11px] text-text-secondary">
                              • {item.publishDate || 'Not published'}
                            </span>
                            <span className="text-[11px] text-text-secondary">
                              • {item.readingTime}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-text-primary group-hover:text-accent-primary transition-colors line-clamp-1 mb-1">
                            {item.title}
                          </h3>

                          <p className="text-xs text-text-secondary line-clamp-1 mb-2">
                            {item.shortDescription}
                          </p>

                          <div className="text-[11px] text-text-secondary font-mono">
                            slug: /insights/{item.slug}
                          </div>
                        </div>
                      </div>

                      {/* Right: Quick Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-border-color">
                        {/* Quick Status Dropdown */}
                        <div className="relative">
                          <select
                            value={item.status}
                            onChange={(e) => handleToggleStatus(item, e.target.value as InsightStatus)}
                            className="bg-bg-primary border border-border-color rounded-xl px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
                          >
                            <option value="published">Published</option>
                            <option value="review">In Review</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="draft">Draft</option>
                          </select>
                        </div>

                        {/* Preview */}
                        <button
                          onClick={() => setPreviewArticle(item)}
                          title="Preview Article"
                          className="p-2 rounded-xl bg-bg-primary hover:bg-bg-secondary border border-border-color text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit in CMS */}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Insight"
                          className="p-2 rounded-xl bg-bg-primary hover:bg-accent-primary/10 hover:border-accent-primary/30 text-text-secondary hover:text-accent-primary border border-border-color transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          title="Delete Insight"
                          className="p-2 rounded-xl bg-bg-primary hover:bg-rose-500/10 hover:border-rose-500/30 text-text-secondary hover:text-rose-400 border border-border-color transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              VIEW 2: CREATE & EDIT INSIGHT CMS
             ========================================================================= */}
          {activeTab === 'editor' && editingInsight && (
            <div className="bg-bg-card border border-border-color rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-border-color pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-text-primary">
                    {editorMode === 'create' ? 'Create New Insight' : 'Edit Insight'}
                  </h2>
                  <p className="text-xs text-text-secondary">
                    Write, format with Markdown, assign categories, and configure SEO metadata.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('insights')}
                    className="px-4 py-2 rounded-xl bg-bg-primary border border-border-color text-text-secondary hover:text-text-primary text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveInsight('draft')}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl bg-bg-primary border border-border-color text-text-primary hover:border-accent-primary/40 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Save as Draft
                  </button>
                  <button
                    onClick={() => handleSaveInsight('published')}
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Publish Immediately'}
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Main Content */}
                <div className="lg:col-span-2 space-y-5">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                      Article Title *
                    </label>
                    <input
                      type="text"
                      value={editingInsight.title || ''}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g., The Visual Psychology of High-CTR Thumbnails"
                      className="w-full bg-bg-primary border border-border-color rounded-xl px-4 py-3 text-base font-bold text-text-primary focus:outline-none focus:border-accent-primary"
                    />
                  </div>

                  {/* Slug & Category Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        value={editingInsight.slug || ''}
                        onChange={(e) => setEditingInsight(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="visual-psychology-high-ctr"
                        className="w-full bg-bg-primary border border-border-color rounded-xl px-4 py-2.5 text-xs text-text-primary font-mono focus:outline-none focus:border-accent-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                        Category
                      </label>
                      <select
                        value={editingInsight.category || 'Graphic Design'}
                        onChange={(e) => setEditingInsight(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-bg-primary border border-border-color rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
                      >
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                      Short Description / Excerpt (Lead Summary)
                    </label>
                    <textarea
                      rows={2}
                      value={editingInsight.shortDescription || ''}
                      onChange={(e) => setEditingInsight(prev => ({ ...prev, shortDescription: e.target.value }))}
                      placeholder="A concise 2-sentence summary that appears on the card and in Google snippets..."
                      className="w-full bg-bg-primary border border-border-color rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary resize-none"
                    />
                  </div>

                  {/* Full Markdown Article Content */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                        Full Article Content (Markdown Supported)
                      </label>
                      <span className="text-[11px] text-text-secondary">
                        Supports ### Headers, * bullet lists, ``` code, and blockquotes
                      </span>
                    </div>
                    <textarea
                      rows={14}
                      value={editingInsight.content || ''}
                      onChange={(e) => setEditingInsight(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Write your comprehensive insight here using Markdown formatting..."
                      className="w-full bg-bg-primary border border-border-color rounded-xl p-4 text-sm font-mono text-text-primary focus:outline-none focus:border-accent-primary leading-relaxed"
                    />
                  </div>
                </div>

                {/* Right 1 Col: Settings, SEO & Cover Image */}
                <div className="space-y-5">
                  {/* Status & Scheduling */}
                  <div className="bg-bg-primary border border-border-color rounded-2xl p-4 space-y-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-primary">
                      Publishing Status
                    </h3>

                    <div>
                      <select
                        value={editingInsight.status || 'published'}
                        onChange={(e) => setEditingInsight(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full bg-bg-card border border-border-color rounded-xl px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
                      >
                        <option value="published">Published</option>
                        <option value="review">In Review / Pending Approval</option>
                        <option value="scheduled">Scheduled Publication</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>

                    {editingInsight.status === 'scheduled' && (
                      <div>
                        <label className="block text-[11px] font-bold text-text-secondary mb-1">
                          Scheduled Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          value={editingInsight.schedulePublishDate || ''}
                          onChange={(e) => setEditingInsight(prev => ({ ...prev, schedulePublishDate: e.target.value }))}
                          className="w-full bg-bg-card border border-border-color rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-primary"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Author</label>
                        <input
                          type="text"
                          value={editingInsight.author || 'Rohit Verma'}
                          onChange={(e) => setEditingInsight(prev => ({ ...prev, author: e.target.value }))}
                          className="w-full bg-bg-card border border-border-color rounded-xl px-3 py-1.5 text-xs text-text-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Read Time</label>
                        <input
                          type="text"
                          value={editingInsight.readingTime || '4 min read'}
                          onChange={(e) => setEditingInsight(prev => ({ ...prev, readingTime: e.target.value }))}
                          className="w-full bg-bg-card border border-border-color rounded-xl px-3 py-1.5 text-xs text-text-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Featured Image Selector */}
                  <div className="bg-bg-primary border border-border-color rounded-2xl p-4 space-y-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-primary flex items-center justify-between">
                      <span>Featured Image</span>
                    </h3>

                    {editingInsight.featuredImage && (
                      <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-border-color">
                        <img
                          src={editingInsight.featuredImage}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Image URL</label>
                      <input
                        type="text"
                        value={editingInsight.featuredImage || ''}
                        onChange={(e) => setEditingInsight(prev => ({ ...prev, featuredImage: e.target.value }))}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-bg-card border border-border-color rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-primary"
                      />
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase font-bold text-text-secondary mb-2">Preset Thematic Covers</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {PRESET_COVERS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setEditingInsight(prev => ({ ...prev, featuredImage: preset.url }))}
                            className="relative aspect-[16/10] rounded-lg overflow-hidden border border-border-color hover:border-accent-primary transition-all cursor-pointer group"
                            title={preset.name}
                          >
                            <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tags Manager */}
                  <div className="bg-bg-primary border border-border-color rounded-2xl p-4 space-y-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-primary">
                      Tags & Keywords
                    </h3>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editorTagInput}
                        onChange={(e) => setEditorTagInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                        placeholder="Add tag and press Enter"
                        className="flex-1 bg-bg-card border border-border-color rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="p-1.5 rounded-xl bg-accent-primary text-white text-xs font-bold cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {(editingInsight.tags || []).map(tag => (
                        <span
                          key={tag}
                          className="bg-bg-card border border-border-color text-text-secondary text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-rose-400 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* SEO Metadata */}
                  <div className="bg-bg-primary border border-border-color rounded-2xl p-4 space-y-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-accent-primary" />
                      SEO Optimization
                    </h3>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">SEO Title</label>
                      <input
                        type="text"
                        value={editingInsight.seoTitle || ''}
                        onChange={(e) => setEditingInsight(prev => ({ ...prev, seoTitle: e.target.value }))}
                        placeholder="Title | Rohit Verma"
                        className="w-full bg-bg-card border border-border-color rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">SEO Meta Description</label>
                      <textarea
                        rows={2}
                        value={editingInsight.seoDescription || ''}
                        onChange={(e) => setEditingInsight(prev => ({ ...prev, seoDescription: e.target.value }))}
                        placeholder="140-160 character description for Google search..."
                        className="w-full bg-bg-card border border-border-color rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 3: AI AUTOMATION HUB
             ========================================================================= */}
          {activeTab === 'automation' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: 1-Click AI Generation Engine */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-bg-card border border-border-color rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-border-color pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold text-text-primary">
                          AI Insight Generator
                        </h2>
                        <p className="text-xs text-text-secondary">
                          Powered by Gemini Flash with server-side rate limits & authenticated API protection
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] uppercase font-bold tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/30 px-3 py-1 rounded-full">
                      Protected Endpoint
                    </span>
                  </div>

                  {/* Generator Input Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                        Topic Prompt / Subject (Leave empty for AI auto-research)
                      </label>
                      <input
                        type="text"
                        value={aiPromptTopic}
                        onChange={(e) => setAiPromptTopic(e.target.value)}
                        placeholder="e.g., 5 Advanced Kinetic Pacing Tricks in Premiere Pro to Double Watch-Time"
                        className="w-full bg-bg-primary border border-border-color rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                        disabled={isGeneratingAi}
                      />
                    </div>

                    {/* Quick Topic Inspirations */}
                    <div>
                      <span className="block text-[11px] font-bold text-text-secondary mb-2">Quick Inspiration Ideas:</span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'Color Psychology in Modern SaaS Brand Identities',
                          'Micro-Interactions in Motion Design for Higher Conversion',
                          'How Generative AI Is Shaping Freelance Creative Agencies',
                          'Scroll-Stopping Thumbnail Strategies for YouTube & Reels'
                        ].map((prompt, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => setAiPromptTopic(prompt)}
                            className="text-[11px] bg-bg-primary hover:bg-accent-primary/10 hover:border-accent-primary/30 border border-border-color text-text-secondary hover:text-accent-primary px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            + {prompt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                          Target Category
                        </label>
                        <select
                          value={aiTargetCategory}
                          onChange={(e) => setAiTargetCategory(e.target.value)}
                          className="w-full bg-bg-primary border border-border-color rounded-xl px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
                          disabled={isGeneratingAi}
                        >
                          {CATEGORIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                          Target Status
                        </label>
                        <select
                          value={aiTargetStatus}
                          onChange={(e) => setAiTargetStatus(e.target.value as any)}
                          className="w-full bg-bg-primary border border-border-color rounded-xl px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
                          disabled={isGeneratingAi}
                        >
                          <option value="published">Publish Immediately</option>
                          <option value="review">Save to Review Queue</option>
                          <option value="draft">Save as Draft</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                          Custom Keywords
                        </label>
                        <input
                          type="text"
                          value={aiCustomKeywords}
                          onChange={(e) => setAiCustomKeywords(e.target.value)}
                          placeholder="e.g., pacing, retention, After Effects"
                          className="w-full bg-bg-primary border border-border-color rounded-xl px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary"
                          disabled={isGeneratingAi}
                        />
                      </div>
                    </div>

                    {/* Progress indicator while generating */}
                    {isGeneratingAi && (
                      <div className="bg-sky-500/10 border border-sky-500/30 rounded-2xl p-5 text-center space-y-3">
                        <RefreshCw className="w-6 h-6 animate-spin text-sky-400 mx-auto" />
                        <div className="text-sm font-bold text-sky-400">{aiGenerationStep || 'Processing AI workflow...'}</div>
                        <div className="text-xs text-text-secondary">Topic Research → Deep Article Draft → SEO Optimization → Visual Cover Matching</div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleTriggerAiGeneration}
                      disabled={isGeneratingAi}
                      className="w-full bg-gradient-to-r from-accent-primary to-accent-hover hover:opacity-95 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-accent-primary/20 text-sm cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      {isGeneratingAi ? 'Generating In-Depth Article...' : 'Run 1-Click AI Generation'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right 1 Col: Automation Scheduler Settings */}
              <div className="space-y-6">
                <div className="bg-bg-card border border-border-color rounded-3xl p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-border-color pb-3">
                    <h3 className="text-base font-extrabold text-text-primary flex items-center gap-2">
                      <Settings className="w-4 h-4 text-accent-primary" />
                      Scheduler Settings
                    </h3>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex items-center justify-between bg-bg-primary border border-border-color p-4 rounded-2xl">
                    <div>
                      <span className="block text-xs font-extrabold text-text-primary">
                        Automatic Publishing
                      </span>
                      <span className="text-[11px] text-text-secondary">
                        Automatically synthesize & publish on cadence
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={automationSettings.autoPublishEnabled}
                        onChange={(e) => setAutomationSettings(prev => ({ ...prev, autoPublishEnabled: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-border-color peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border-color after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  {/* Cadence Selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                      Cadence Interval
                    </label>
                    <select
                      value={automationSettings.cadence}
                      onChange={(e) => setAutomationSettings(prev => ({ ...prev, cadence: e.target.value as any }))}
                      className="w-full bg-bg-primary border border-border-color rounded-xl px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
                    >
                      <option value="daily">Daily (1 new insight every day)</option>
                      <option value="weekly">Weekly (1 new insight every 7 days)</option>
                      <option value="bi-weekly">Bi-Weekly (2 insights per week)</option>
                      <option value="manual">Manual Only</option>
                    </select>
                  </div>

                  {/* Automation Mode */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                      Automation Output Mode
                    </label>
                    <select
                      value={automationSettings.mode}
                      onChange={(e) => setAutomationSettings(prev => ({ ...prev, mode: e.target.value as any }))}
                      className="w-full bg-bg-primary border border-border-color rounded-xl px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
                    >
                      <option value="auto-publish">Auto-Publish Directly to Website</option>
                      <option value="save-as-review">Save to Review Queue (Requires Approval)</option>
                    </select>
                  </div>

                  {/* Status info */}
                  <div className="bg-bg-primary border border-border-color rounded-xl p-3 text-xs space-y-1.5 text-text-secondary">
                    <div className="flex justify-between">
                      <span>Scheduler Status:</span>
                      <span className="font-bold text-emerald-400">
                        {automationSettings.autoPublishEnabled ? 'Active (Running)' : 'Paused'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total AI Insights:</span>
                      <span className="font-bold text-text-primary">{countAi} articles</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveAutomationSettings}
                    disabled={isSaving}
                    className="w-full bg-bg-primary hover:bg-bg-secondary border border-border-color hover:border-accent-primary/40 text-text-primary text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Save Scheduler Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 4: SECURITY & AUDIT LOGS
             ========================================================================= */}
          {activeTab === 'audit' && (
            <div className="bg-bg-card border border-border-color rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-border-color pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-text-primary">
                      Security & Administrative Audit Trail
                    </h2>
                    <p className="text-xs text-text-secondary">
                      Immutable record of all administrator logins, article modifications, deletions, and automated events
                    </p>
                  </div>
                </div>

                <button
                  onClick={loadAuditLogs}
                  className="px-4 py-2 rounded-xl bg-bg-primary hover:bg-bg-secondary border border-border-color text-text-secondary hover:text-text-primary text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingAuditLogs ? 'animate-spin text-accent-primary' : ''}`} />
                  Refresh Logs
                </button>
              </div>

              {loadingAuditLogs ? (
                <div className="p-12 text-center text-text-secondary flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-accent-primary" />
                  <span className="text-xs font-semibold">Loading security audit records...</span>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="p-8 text-center text-text-secondary">
                  <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-emerald-400 opacity-60" />
                  <p className="text-sm font-bold text-text-primary">No audit events recorded yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border-color text-text-secondary uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4 font-bold">Timestamp</th>
                        <th className="py-3 px-4 font-bold">Action</th>
                        <th className="py-3 px-4 font-bold">Admin Actor</th>
                        <th className="py-3 px-4 font-bold">Details</th>
                        <th className="py-3 px-4 font-bold">IP Address</th>
                        <th className="py-3 px-4 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-bg-primary/50 transition-colors">
                          <td className="py-3 px-4 font-mono text-[11px] text-text-secondary whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-bold text-text-primary whitespace-nowrap">
                            {log.action}
                          </td>
                          <td className="py-3 px-4 text-accent-primary font-medium whitespace-nowrap">
                            {log.adminEmail}
                          </td>
                          <td className="py-3 px-4 text-text-secondary max-w-md truncate" title={log.details}>
                            {log.details}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-text-secondary whitespace-nowrap">
                            {log.ipAddress}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                log.status === 'success'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : log.status === 'failure'
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  : log.status === 'warning'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* =========================================================================
          MODAL: LIVE ARTICLE PREVIEW
         ========================================================================= */}
      <AnimatePresence>
        {previewArticle && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-bg-primary border border-border-color rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative my-8"
            >
              <button
                onClick={() => setPreviewArticle(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-bg-secondary text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-accent-primary/10 text-accent-primary px-3 py-1 rounded-full">
                  {previewArticle.category}
                </span>
                <span className="text-xs text-text-secondary font-medium">
                  {previewArticle.publishDate} • {previewArticle.readingTime}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary mb-4 leading-tight">
                {previewArticle.title}
              </h1>

              {previewArticle.featuredImage && (
                <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden mb-6 border border-border-color">
                  <img src={previewArticle.featuredImage} alt={previewArticle.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="prose prose-invert max-w-none text-text-secondary text-sm md:text-base leading-relaxed space-y-4">
                <ReactMarkdown>{previewArticle.content}</ReactMarkdown>
              </div>

              <div className="mt-8 pt-4 border-t border-border-color flex justify-end">
                <button
                  onClick={() => setPreviewArticle(null)}
                  className="px-4 py-2 rounded-xl bg-accent-primary text-white text-xs font-bold cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL: CONFIRM DELETE
         ========================================================================= */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-bg-card border border-border-color rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-text-primary mb-2">Delete Insight?</h3>
              <p className="text-xs text-text-secondary mb-6 leading-relaxed">
                Are you sure you want to permanently delete this insight from the CMS and server database?
              </p>
              <div className="flex items-center gap-3 justify-center">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-xl bg-bg-primary border border-border-color text-text-secondary text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteInsight(deleteConfirmId)}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
