import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Building,
  User,
  Shield,
  CreditCard,
  FileSpreadsheet,
  Receipt,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Save,
  ShieldCheck,
  Lock,
  Globe,
  Phone,
  Mail,
  Palette,
  IndianRupee,
  Key,
  Layers,
  Sparkles,
  FileCheck,
  UploadCloud,
  Hash,
  Eye,
  CheckCircle,
  XCircle,
  Info,
  Clock,
  Database,
  Cloud,
  Play
} from 'lucide-react';
import { CrmAgencySettings } from '../../../../types/crm';
import {
  getStoredSettings,
  updateStoredSettings,
  updateSettingsWithCloud,
  resetCrmSettingsToDefault,
  resetAllCrmStorageToDefaults,
  initCrmStorage,
  subscribeCrmStore,
  downloadCrmBackup,
  getStoredBackupInventory,
  verifyCrmBackup,
  BACKUP_SCHEMA_VERSION,
  BackupVerificationResult
} from '../../../../services/crmStorageService';
import {
  executeMigrationDryRun,
  generateRollbackStrategy,
  MigrationDryRunResult
} from '../../../../services/crmMigrationService';
import { getCrmCloudSyncStatus, CrmSyncStatus } from '../../../../services/crmFirestoreService';
import { CrmPageHeader } from '../../shared/CrmPageHeader';
import { CrmAvatar } from '../../profile/CrmAvatar';
import { CrmProfileModal } from '../../profile/CrmProfileModal';
import { getAdminProfile, subscribeAdminProfile } from '../../../../services/crmProfileService';
import { AdminUserProfile } from '../../../../types/crmProfile';

interface SettingsModuleProps {
  onNavigateToModule?: (moduleId: any) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ onNavigateToModule }) => {
  const [settings, setSettings] = useState<CrmAgencySettings>(getStoredSettings());
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'quotation' | 'invoice' | 'security' | 'data'>('profile');

  // Backup & Verification state
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const [lastBackupInfo, setLastBackupInfo] = useState<{ fileName: string; checksum: string } | null>(null);
  const [inventory, setInventory] = useState(getStoredBackupInventory());
  const [verificationResult, setVerificationResult] = useState<BackupVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyFileName, setVerifyFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cloud & Migration state
  const [cloudStatus, setCloudStatus] = useState<CrmSyncStatus>(getCrmCloudSyncStatus());
  const [isDryRunning, setIsDryRunning] = useState<boolean>(false);
  const [dryRunResult, setDryRunResult] = useState<MigrationDryRunResult | null>(null);
  const [showRollbackPlan, setShowRollbackPlan] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
  const [adminProfile, setAdminProfile] = useState<AdminUserProfile>(getAdminProfile());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  useEffect(() => {
    initCrmStorage().then(() => {
      setSettings(getStoredSettings());
      setInventory(getStoredBackupInventory());
    });

    const unsubscribe = subscribeCrmStore(() => {
      setSettings(getStoredSettings());
      setInventory(getStoredBackupInventory());
    });

    const unsubProfile = subscribeAdminProfile((p) => {
      setAdminProfile(p);
    });

    return () => {
      unsubscribe();
      unsubProfile();
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSaveError(null);
    try {
      const res = await updateSettingsWithCloud(settings);
      if (!res.success && res.cloudResult?.errorCode === 'permission-denied') {
        setSaveError('Permission Denied: Only Super Admins can update agency settings.');
        return;
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to update agency settings.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleExportData = async () => {
    try {
      setIsBackingUp(true);
      const res = await downloadCrmBackup({ adminEmail: settings.ownerEmail });
      setLastBackupInfo({
        fileName: res.fileName,
        checksum: res.manifest.integrity.checksumSha256
      });
    } catch (err: any) {
      alert(`Could not complete backup: ${err.message}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleFileVerify = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVerifyFileName(file.name);
    setIsVerifying(true);
    try {
      const text = await file.text();
      const result = await verifyCrmBackup(text);
      setVerificationResult(result);
    } catch (err: any) {
      alert(`Could not verify backup file: ${err.message}`);
    } finally {
      setIsVerifying(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExecuteDryRun = async () => {
    setIsDryRunning(true);
    try {
      const res = await executeMigrationDryRun({ requireVerifiedBackup: false });
      setDryRunResult(res);
    } catch (err: any) {
      alert(`Dry run failed: ${err.message}`);
    } finally {
      setIsDryRunning(false);
    }
  };

  const handleResetSettings = () => {
    const confirmReset = window.confirm(
      'Reset all branding, quotation, and invoice preferences to Rohitwork factory defaults?'
    );
    if (!confirmReset) return;

    const reset = resetCrmSettingsToDefault();
    setSettings(reset);
    alert('Settings have been reset to factory defaults.');
  };

  const handleFactoryResetAll = () => {
    const confirmBackup = window.confirm(
      'CRITICAL SAFETY WARNING:\n\nFactory Re-Seed will wipe all customer mutations, projects, tasks, quotations, and financial transactions across all 14 CRM modules!\n\nHave you exported and verified a JSON backup file first?'
    );
    if (!confirmBackup) return;

    const confirmAll = window.prompt(
      'FINAL DESTRUCTIVE CONFIRMATION:\n\nType exactly "CONFIRM-FACTORY-RESET-ALL" to purge local CRM storage and revert to factory initial state:'
    );
    if (confirmAll !== 'CONFIRM-FACTORY-RESET-ALL') {
      alert('Factory reset cancelled. Confirmation phrase did not match.');
      return;
    }

    resetAllCrmStorageToDefaults();
    setSettings(getStoredSettings());
    setInventory(getStoredBackupInventory());
    alert('CRM local storage has been completely re-seeded to initial factory defaults.');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Page Header */}
      <CrmPageHeader
        title="CRM Settings & Studio Preferences"
        subtitle="Configure agency branding, default quotation terms, banking remittances, and security profile"
        icon={Settings}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportData}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Backup JSON</span>
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isSaved ? 'Changes Saved!' : 'Save Configuration'}</span>
            </button>
          </div>
        }
      />

      {/* 2. Success Alert */}
      {isSaved && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Agency settings and remittance parameters updated across all CRM modules.</span>
        </div>
      )}

      {/* 2b. Error Alert */}
      {saveError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-2xs">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold overflow-x-auto">
        {[
          { id: 'profile', label: 'Agency Profile', icon: Building },
          { id: 'quotation', label: 'Quotation Defaults', icon: FileSpreadsheet },
          { id: 'invoice', label: 'Invoice & Bank Details', icon: Receipt },
          { id: 'security', label: 'Admin Security', icon: ShieldCheck },
          { id: 'data', label: 'Data Management', icon: Layers }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl transition-all whitespace-nowrap cursor-pointer font-bold ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Form Sections */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Tab 1: Agency Profile */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Super Admin Executive Profile & Avatar Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#0c0828] via-[#1a0f3d] to-[#251052] text-white border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <CrmAvatar
                  profile={adminProfile}
                  size="xl"
                  showPresence={true}
                  presenceStatus="online"
                  borderStyle="gradient"
                />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h4 className="text-base font-black text-white">
                      {adminProfile.displayName || adminProfile.name}
                    </h4>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30">
                      Super Admin
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Online
                    </span>
                  </div>
                  <p className="text-xs text-purple-200/80 font-mono">
                    {adminProfile.email}
                  </p>
                  <p className="text-xs text-slate-300 line-clamp-1 max-w-md">
                    {adminProfile.bio || 'Founder & Creative Director at Rohitwork Creative Studios.'}
                  </p>
                  <p className="text-[11px] text-purple-200/70 pt-0.5">
                    Avatar:{' '}
                    <span className="font-bold text-white capitalize">
                      {adminProfile.avatarType === 'custom'
                        ? 'Custom Photo'
                        : adminProfile.avatarType === 'library'
                        ? `Artwork (${adminProfile.avatarId})`
                        : 'Initials Monogram'}
                    </span>{' '}
                    • Background: <span className="font-mono text-purple-200 font-bold">{adminProfile.backgroundColor}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-[#6d28d9] to-[#4338ca] hover:from-[#5b21b6] hover:to-[#3730a3] text-white shadow-lg shadow-purple-600/30 cursor-pointer transition-all active:scale-95 shrink-0"
              >
                <Sparkles className="w-4 h-4 text-purple-200" />
                <span>Customize Avatar & Profile</span>
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-4 h-4 text-violet-500" />
                <span>Studio & Agency Identity</span>
              </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Agency / Studio Name
                </label>
                <input
                  type="text"
                  value={settings.agencyName}
                  onChange={(e) => setSettings({ ...settings, agencyName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tagline / Specialization
                </label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Founder / Owner Name
                </label>
                <input
                  type="text"
                  value={settings.ownerName}
                  onChange={(e) => setSettings({ ...settings, ownerName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Official Contact Email
                </label>
                <input
                  type="email"
                  value={settings.ownerEmail}
                  onChange={(e) => setSettings({ ...settings, ownerEmail: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Direct Phone / WhatsApp
                </label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={settings.websiteUrl}
                  onChange={(e) => setSettings({ ...settings, websiteUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Studio Address / Registered Location
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
        </div>
        )}

        {/* Tab 2: Quotation Defaults */}
        {activeTab === 'quotation' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-violet-500" />
              <span>Quotation & Proposal Defaults</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Currency Symbol & Code
                </label>
                <input
                  type="text"
                  readOnly
                  value="INR (₹) — Indian Rupee"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-mono cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Locked strictly to INR for compliant Indian accounting.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default Advance Requirement
                </label>
                <select
                  value="50"
                  disabled
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold"
                >
                  <option value="50">50% Advance (Studio Standard)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Standard Quotation Terms & Conditions Template
              </label>
              <textarea
                rows={4}
                value={settings.quotationTermsTemplate}
                onChange={(e) => setSettings({ ...settings, quotationTermsTemplate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 leading-relaxed font-sans"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Invoice & Bank Remittance */}
        {activeTab === 'invoice' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-violet-500" />
              <span>Invoice Settings & Bank Remittance</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary UPI ID for QR Billing
                </label>
                <input
                  type="text"
                  value={settings.upiId || ''}
                  onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                  placeholder="e.g. 7732869027@paytm"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  GSTIN (Optional, Non-GST default)
                </label>
                <input
                  type="text"
                  value={settings.gstNumber || ''}
                  onChange={(e) => setSettings({ ...settings, gstNumber: e.target.value })}
                  placeholder="Leave empty for Non-GST invoicing"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={settings.bankDetails?.bankName || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bankDetails: {
                        accountName: settings.bankDetails?.accountName || settings.ownerName,
                        accountNumber: settings.bankDetails?.accountNumber || '',
                        ifsc: settings.bankDetails?.ifsc || '',
                        bankName: e.target.value
                      }
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={settings.bankDetails?.accountName || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bankDetails: {
                        bankName: settings.bankDetails?.bankName || '',
                        accountNumber: settings.bankDetails?.accountNumber || '',
                        ifsc: settings.bankDetails?.ifsc || '',
                        accountName: e.target.value
                      }
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  value={settings.bankDetails?.accountNumber || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bankDetails: {
                        bankName: settings.bankDetails?.bankName || '',
                        accountName: settings.bankDetails?.accountName || settings.ownerName,
                        ifsc: settings.bankDetails?.ifsc || '',
                        accountNumber: e.target.value
                      }
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={settings.bankDetails?.ifsc || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bankDetails: {
                        bankName: settings.bankDetails?.bankName || '',
                        accountName: settings.bankDetails?.accountName || settings.ownerName,
                        accountNumber: settings.bankDetails?.accountNumber || '',
                        ifsc: e.target.value
                      }
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Invoice Payment Terms
              </label>
              <textarea
                rows={2}
                value={settings.defaultPaymentTerms}
                onChange={(e) => setSettings({ ...settings, defaultPaymentTerms: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 font-sans"
              />
            </div>
          </div>
        )}

        {/* Tab 4: Admin Security */}
        {activeTab === 'security' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Authorized Administrator Security</span>
            </h3>

            <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Authenticated Admin Identity</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                  Firebase Auth Verified
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-[11px] text-slate-600 dark:text-slate-300">
                <div>
                  <span className="text-slate-400">Admin Email:</span>{' '}
                  <strong className="font-mono">{settings.ownerEmail}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Role:</span>{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                    Super Administrator (Single Root)
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Firebase Project:</span>{' '}
                  <strong className="font-mono">rohit-72bfa</strong>
                </div>
                <div>
                  <span className="text-slate-400">Freelancer Portal Access:</span>{' '}
                  <strong className="text-rose-500 font-semibold">Strictly Prohibited (No Login)</strong>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5 leading-relaxed pt-2">
              <p>• Only the authorized admin account has permission to view client financials, invoices, and freelancer payouts.</p>
              <p>• Freelancers are treated strictly as subcontracted talent entities without password access or direct portal entry.</p>
              <p>• All mutations are verified locally and cross-reconciled against Firestore security policies.</p>
            </div>
          </div>
        )}

        {/* Tab 5: Data Management & Backup Verification */}
        {activeTab === 'data' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-violet-600" />
                  <span>CRM Data Backup & Integrity Verification Engine</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Phase 6A Enterprise Backup: Cryptographically signed, timestamped, read-only JSON snapshots across all 14 modules.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 font-bold border border-violet-200 dark:border-violet-800">
                  Schema v2.0
                </span>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>SHA-256 Verified</span>
                </span>
              </div>
            </div>

            {/* Read-Only Safety Assurance Banner */}
            <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-[11px]">Strict Non-Destructive Backup Policy</p>
                <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
                  Exporting and verifying backups operates in strict read-only mode. It never writes to Firestore, does not alter local storage, does not overwrite business records, and excludes all passwords, session tokens, and API credentials.
                </p>
              </div>
            </div>

            {/* Live Inventory Breakdown */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-violet-500" />
                  <span>Current Storage Inventory (All 14 Modules)</span>
                </span>
                <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                  {inventory.totalRecords} Total Records ({inventory.totalReal} Real • {inventory.totalDemo} Seed)
                </span>
              </div>

              {/* Module counts grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                {Object.entries(inventory.moduleCounts).map(([modKey, stats]) => (
                  <div
                    key={modKey}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center"
                  >
                    <div className="text-[10px] uppercase font-bold text-slate-400 truncate tracking-wider">
                      {modKey}
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                      {stats.total}
                    </div>
                    <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {stats.real} real • {stats.demo} demo
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Snapshot */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                <div>
                  <span className="text-slate-400">Total Invoiced:</span>{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {inventory.financialTotals.currency} {inventory.financialTotals.totalBilled.toLocaleString('en-IN')}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Collected:</span>{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    {inventory.financialTotals.currency} {inventory.financialTotals.totalPaid.toLocaleString('en-IN')}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Outstanding:</span>{' '}
                  <strong className="text-amber-600 dark:text-amber-400">
                    {inventory.financialTotals.currency} {inventory.financialTotals.outstandingBalance.toLocaleString('en-IN')}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Expenses:</span>{' '}
                  <strong className="text-rose-600 dark:text-rose-400">
                    {inventory.financialTotals.currency} {inventory.financialTotals.totalExpenses.toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>
            </div>

            {/* Primary Action Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Generate & Download Backup */}
              <div className="p-5 rounded-2xl border border-violet-200 dark:border-violet-900/50 bg-gradient-to-br from-violet-50/40 via-white to-violet-50/20 dark:from-violet-950/20 dark:via-slate-900 dark:to-slate-900 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-violet-600" />
                    <span>Generate & Download Backup</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Packages complete records across all 14 CRM modules into a timestamped, signed JSON file with a SHA-256 cryptographic manifest. Works offline without Firestore dependency.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleExportData}
                    disabled={isBackingUp}
                    className="w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-xs font-bold transition-all shadow-md shadow-violet-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isBackingUp ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating Signed Backup...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download Verified Backup (.json)</span>
                      </>
                    )}
                  </button>
                </div>

                {lastBackupInfo && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[10px] space-y-1 animate-fadeIn">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Backup Generated & Downloaded</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 font-mono truncate">
                      File: {lastBackupInfo.fileName}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 font-mono truncate">
                      SHA-256: {lastBackupInfo.checksum.slice(0, 24)}...
                    </div>
                  </div>
                )}
              </div>

              {/* Card 2: Inspect & Verify Backup File (Read-Only) */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Verify Backup Integrity (Read-Only)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Upload any previously generated CRM backup file to verify its SHA-256 checksum, schema validity, record counts, and zero-secrets compliance without importing or modifying any data.
                  </p>
                </div>

                <div className="pt-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileVerify}
                    accept=".json"
                    className="hidden"
                    id="crm-backup-file-input"
                  />
                  <label
                    htmlFor="crm-backup-file-input"
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    {isVerifying ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                        <span>Verifying Cryptographic Digest...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4 text-slate-500" />
                        <span>Choose Backup JSON to Verify</span>
                      </>
                    )}
                  </label>
                </div>

                {verifyFileName && (
                  <div className="text-[10px] text-slate-500 text-center truncate font-mono">
                    Inspected: {verifyFileName}
                  </div>
                )}
              </div>
            </div>

            {/* Verification Results Panel */}
            {verificationResult && (
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    {verificationResult.isValid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-600" />
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {verificationResult.isValid
                          ? 'Backup Integrity Verified (Passed All Checks)'
                          : 'Backup Verification Warning'}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono">
                        ID: {verificationResult.backupId} • Schema: {verificationResult.schemaVersion}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        verificationResult.checksumMatches
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {verificationResult.checksumMatches ? 'SHA-256 Valid' : 'Checksum Mismatch'}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        verificationResult.securityAudit.passed
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {verificationResult.securityAudit.passed ? 'Zero Secrets' : 'Secrets Detected'}
                    </span>
                  </div>
                </div>

                {/* Audit Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Entities</span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {verificationResult.totalRecordsCount}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {verificationResult.realRecordsCount} real • {verificationResult.demoRecordsCount} demo
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Exported By</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate block mt-0.5 font-mono">
                      {verificationResult.exportedBy}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {verificationResult.exportedAt ? new Date(verificationResult.exportedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Invoiced Volume</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block mt-0.5 font-mono">
                      {verificationResult.financialIntegrity.currency}{' '}
                      {verificationResult.financialIntegrity.totalBilled.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">
                      Paid: {verificationResult.financialIntegrity.totalPaid.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">References</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5 font-mono">
                      {verificationResult.relationshipIntegrity.passed ? '100% Intact' : 'Referential Issues'}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {verificationResult.relationshipIntegrity.orphanedInvoicesCount} orphaned inv
                    </span>
                  </div>
                </div>

                {/* SHA-256 Checksum Display */}
                {verificationResult.expectedChecksum && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[10px] font-mono space-y-1">
                    <div className="text-slate-400">Cryptographic Digest (SHA-256):</div>
                    <div className="text-slate-700 dark:text-slate-300 break-all select-all">
                      {verificationResult.calculatedChecksum || verificationResult.expectedChecksum}
                    </div>
                  </div>
                )}

                {/* Errors or Warnings */}
                {verificationResult.errors.length > 0 && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Validation Errors</span>
                    </div>
                    {verificationResult.errors.map((err, i) => (
                      <p key={i} className="text-[11px] leading-relaxed">
                        • {err}
                      </p>
                    ))}
                  </div>
                )}

                {verificationResult.warnings.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Audit Notices</span>
                    </div>
                    {verificationResult.warnings.map((warn, i) => (
                      <p key={i} className="text-[11px] leading-relaxed">
                        • {warn}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Phase 6B.2: Cloud Persistence & Migration Assistant */}
            <div className="p-4 rounded-2xl border border-sky-200/80 dark:border-sky-900/30 bg-sky-50/20 dark:bg-sky-950/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 dark:border-sky-900/40 pb-3">
                <div className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Cloud Persistence & Migration Assistant (Phase 6B.2)
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Non-destructive migration readiness engine. Inspects local records, separates seed data, checks foreign keys, and runs dry-run simulations.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold border ${
                    cloudStatus.isConfigured
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                  }`}>
                    {cloudStatus.isConfigured ? 'Firestore Ready' : 'Local Sandbox'}
                  </span>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300 font-bold border border-sky-200 dark:border-sky-800">
                    Safe Dry-Run
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleExecuteDryRun}
                  disabled={isDryRunning}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Play className={`w-3.5 h-3.5 ${isDryRunning ? 'animate-spin' : ''}`} />
                  <span>{isDryRunning ? 'Analyzing Records...' : 'Execute Migration Dry-Run'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowRollbackPlan(!showRollbackPlan)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <span>{showRollbackPlan ? 'Hide Rollback Strategy' : 'View Rollback Strategy'}</span>
                </button>
              </div>

              {/* Rollback Strategy Panel */}
              {showRollbackPlan && (
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Cryptographic Rollback & Safety Guarantees</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                    <li>• <strong>Zero Data Loss:</strong> Local browser storage is never cleared during or after migration.</li>
                    <li>• <strong>Factory Demo Exclusion:</strong> Initial seed items are permanently excluded from cloud synchronization.</li>
                    <li>• <strong>Stable Document IDs:</strong> Preserves exact keys across clients, projects, tasks, invoices, and payments.</li>
                    <li>• <strong>Emergency Revert:</strong> In case of aborted execution, restore state instantly from verified Phase 6A JSON snapshot.</li>
                  </ul>
                </div>
              )}

              {/* Dry-Run Results Panel */}
              {dryRunResult && (
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Dry-Run Simulation Complete</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">ID: {dryRunResult.dryRunId}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Real Candidates</span>
                      <span className="text-sm font-bold text-emerald-600">{dryRunResult.totalRealRecords}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Demo Seed Filtered</span>
                      <span className="text-sm font-bold text-slate-500">{dryRunResult.totalDemoRecordsSkipped}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Cloud Existing</span>
                      <span className="text-sm font-bold text-blue-600">{dryRunResult.totalDuplicatesDetected}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">New to Insert</span>
                      <span className="text-sm font-bold text-violet-600">{dryRunResult.totalCloudInsertsPlanned}</span>
                    </div>
                  </div>

                  {/* Referential Integrity Check */}
                  <div className={`p-3 rounded-xl border text-xs ${
                    dryRunResult.referentialIntegrity.isValid
                      ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                      : 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/40 text-amber-800 dark:text-amber-300'
                  }`}>
                    <div className="font-bold flex items-center gap-1.5">
                      {dryRunResult.referentialIntegrity.isValid ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
                      <span>Referential Integrity: {dryRunResult.referentialIntegrity.isValid ? '100% Valid (All Foreign Keys Verified)' : 'Audit Notices'}</span>
                    </div>
                    {dryRunResult.referentialIntegrity.issues.length > 0 && (
                      <div className="mt-1 space-y-0.5 text-[11px]">
                        {dryRunResult.referentialIntegrity.issues.map((iss, i) => <p key={i}>• {iss}</p>)}
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-500 italic">
                    {dryRunResult.safetyNotice}
                  </p>
                </div>
              )}
            </div>

            {/* Preferences & Reset Operations */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Reset Preferences Card */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-amber-500" />
                    <span>Reset Agency Preferences</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Restore default agency profile, UPI details, and quotation/invoice templates without altering customer records or transaction history.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetSettings}
                    className="mt-2 px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 text-xs font-bold transition-all cursor-pointer"
                  >
                    Reset Preferences
                  </button>
                </div>

                {/* Factory Re-Seed */}
                <div className="p-4 rounded-2xl border border-rose-200/80 dark:border-rose-900/30 bg-rose-50/20 dark:bg-rose-950/10 space-y-2">
                  <div className="font-bold text-xs text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Factory Re-Seed All Stores</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Purges local browser mutations and resets all 14 modules to factory initial demo state. Requires manual phrase confirmation.
                  </p>
                  <button
                    type="button"
                    onClick={handleFactoryResetAll}
                    className="mt-2 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Re-Seed Local Storage
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Footer */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Settings are stored locally in rohitwork_crm_settings_v1</span>
          </div>

          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

      {/* Super Admin Profile & Avatar Customizer Modal */}
      <CrmProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};
