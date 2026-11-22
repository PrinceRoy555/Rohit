import React, { useState, useEffect } from 'react';
import { CrmModuleId, CrmLead } from '../../types/crm';
import { CRM_MODULES } from './crmModules';
import { CrmLayout } from './layout/CrmLayout';
import { CrmDashboard } from './dashboard/CrmDashboard';
import { LeadsModule } from './modules/leads/LeadsModule';
import { ClientsModule } from './modules/clients/ClientsModule';
import { FreelancersModule } from './modules/freelancers/FreelancersModule';
import { ProjectsModule } from './modules/projects/ProjectsModule';
import { TasksModule } from './modules/tasks/TasksModule';
import { QuotationsModule } from './modules/quotations/QuotationsModule';
import { InvoicesModule } from './modules/invoices/InvoicesModule';
import { PaymentsModule } from './modules/payments/PaymentsModule';
import { ExpensesModule } from './modules/expenses/ExpensesModule';
import { AiAssistantModule } from './modules/ai-assistant/AiAssistantModule';
import { ReportsModule } from './modules/reports/ReportsModule';
import { RemindersModule } from './modules/reminders/RemindersModule';
import { SettingsModule } from './modules/settings/SettingsModule';
import { CrmPlaceholderModule } from './shared/CrmPlaceholderModule';
import { CrmLoginView } from './auth/CrmLoginView';
import { CrmLoadingState } from './shared/CrmLoadingState';
import {
  observeAuthState,
  verifyAdminRole,
  signOutAdmin,
  syncAdminFirestoreProfile
} from '../../services/firebase/auth';
import { isFirebaseConfigured, auth } from '../../lib/firebase';
import {
  checkAdminSession,
  logoutAdmin,
  syncFirebaseAdminSession,
  AdminSessionInfo
} from '../../services/adminApi';
import { useTheme } from '../../context/ThemeContext';
import { getCrmDashboardMetrics } from '../../services/crmService';
import { startLiveCloudSync } from '../../services/crmStorageService';
import { syncProfileWithFirestore } from '../../services/crmProfileService';

interface CrmAppProps {
  onClose: () => void;
  onLogout?: () => void;
  initialModule?: CrmModuleId;
}

export const CrmApp: React.FC<CrmAppProps> = ({
  onClose,
  onLogout,
  initialModule = 'dashboard'
}) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [activeModule, setActiveModule] = useState<CrmModuleId>(initialModule);

  // Authentication State
  const isLocalhost = import.meta.env.DEV && typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isForceLogin = isLocalhost && (urlParams?.get('view') === 'login' || urlParams?.get('preview') === 'login');
  const isDirectPreview = !isForceLogin && isLocalhost && (urlParams?.get('preview') === 'true' || urlParams?.get('preview') === 'dashboard' || urlParams?.get('dev') === 'true');

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !isForceLogin && isDirectPreview);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(() => !isForceLogin && !isDirectPreview);
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminRole, setAdminRole] = useState<'super_admin' | 'admin' | 'editor'>('editor');

  // Live Leads stream for Notification Badge & Search
  const [cachedLeads, setCachedLeads] = useState<CrmLead[]>([]);
  const [newLeadsCount, setNewLeadsCount] = useState<number>(0);

  // 1. Check Authentication on Mount
  useEffect(() => {
    let isMounted = true;

    if (isForceLogin) {
      setIsAuthenticated(false);
      setIsAuthChecking(false);
      return;
    }

    // Subscribe to Firebase Auth (authoritative state for CRM cloud access)
    const unsubscribe = observeAuthState(async (user) => {
      if (!isMounted) return;
      if (isDirectPreview) {
        setIsAuthenticated(true);
        setIsAuthChecking(false);
        return;
      }
      if (user) {
        const roleRes = await verifyAdminRole(user);
        if (roleRes.authorized) {
          // Keep Firestore profile docs in sync with authenticated user
          await syncAdminFirestoreProfile(user);
          setIsAuthenticated(true);
          setAdminEmail(roleRes.email || user.email || '');
          setAdminRole(roleRes.role);
          try {
            const idToken = await user.getIdToken();
            syncFirebaseAdminSession(roleRes.email, idToken, user.uid);
          } catch {
            // offline fallback
          }
        } else {
          await signOutAdmin();
          setIsAuthenticated(false);
          setAdminEmail('');
          setAdminRole('editor');
        }
      } else {
        // If no Firebase user: when Firebase is configured, user is unauthenticated
        if (isFirebaseConfigured()) {
          setIsAuthenticated(false);
          setAdminEmail('');
          setAdminRole('editor');
        } else {
          // Only fallback to API session if Firebase is completely unconfigured
          const sess: AdminSessionInfo = await checkAdminSession().catch((): AdminSessionInfo => ({ authenticated: false }));
          if (sess.authenticated && sess.adminEmail) {
            setIsAuthenticated(true);
            setAdminEmail(sess.adminEmail);
          } else {
            setIsAuthenticated(false);
            setAdminEmail('');
            setAdminRole('editor');
          }
        }
      }
      setIsAuthChecking(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // 1b. Real-Time Cross-Browser Cloud Sync & Profile Sync
  useEffect(() => {
    if (!isAuthenticated) return;
    const stopLiveSync = startLiveCloudSync();
    syncProfileWithFirestore();
    return () => {
      stopLiveSync();
    };
  }, [isAuthenticated]);

  // 2. Fetch Inquiries for Notifications & Command Search
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    getCrmDashboardMetrics()
      .then((metrics) => {
        if (isMounted) {
          setCachedLeads(metrics.recentLeads);
          setNewLeadsCount(metrics.newLeads);
        }
      })
      .catch((err) => {
        console.warn('[CRM App] Note fetching leads stream:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, activeModule]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOutAdmin();
    } catch {
      // ignore
    }
    logoutAdmin();
    setIsAuthenticated(false);
    if (onLogout) onLogout();
  };

  // If Auth check in progress
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-black animate-pulse">
          RW
        </div>
      </div>
    );
  }

  // If unauthenticated, show high-security Login screen
  if (!isAuthenticated) {
    return (
      <CrmLoginView
        onSuccess={async (email, role) => {
          setIsAuthenticated(true);
          setAdminEmail(email);
          setAdminRole(role);
          try {
            if (auth?.currentUser) {
              const idToken = await auth.currentUser.getIdToken();
              await syncFirebaseAdminSession(email, idToken, auth.currentUser.uid);
            }
          } catch (syncErr) {
            console.warn('[CRM App] Session sync notice:', syncErr);
          }
        }}
        onBackToWebsite={onClose}
      />
    );
  }

  const currentModuleMeta =
    CRM_MODULES.find((m) => m.id === activeModule) || CRM_MODULES[0];

  return (
    <CrmLayout
      activeModule={activeModule}
      onSelectModule={setActiveModule}
      adminEmail={adminEmail}
      adminRole={adminRole}
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      onToggleTheme={toggleTheme}
      onLogout={handleLogout}
      onViewWebsite={onClose}
      newLeadsCount={newLeadsCount}
      leads={cachedLeads}
      onSelectLead={() => setActiveModule('leads')}
    >
      {activeModule === 'dashboard' ? (
        <CrmDashboard onNavigateToModule={setActiveModule} />
      ) : activeModule === 'leads' ? (
        <LeadsModule onNavigateToModule={setActiveModule} />
      ) : activeModule === 'clients' ? (
        <ClientsModule onNavigateToModule={setActiveModule} />
      ) : activeModule === 'projects' ? (
        <ProjectsModule onNavigateToModule={setActiveModule} />
      ) : activeModule === 'freelancers' ? (
        <FreelancersModule onNavigateToModule={setActiveModule} />
      ) : activeModule === 'tasks' ? (
        <TasksModule onNavigateToModule={setActiveModule} />
      ) : activeModule === 'quotations' ? (
        <QuotationsModule onNavigateToModule={setActiveModule} />
      ) : activeModule === 'invoices' ? (
        <InvoicesModule onNavigateToModule={setActiveModule} />
      ) : activeModule === 'payments' ? (
        <PaymentsModule onNavigateToModule={setActiveModule} />
      ) : activeModule === 'expenses' ? (
        <ExpensesModule onNavigateToModule={setActiveModule} />
      ) : activeModule === 'ai-assistant' ? (
        <AiAssistantModule onNavigateToModule={setActiveModule} />
      ) : activeModule === 'reports' ? (
        <ReportsModule onNavigateToModule={setActiveModule} />
      ) : activeModule === 'reminders' ? (
        <RemindersModule onNavigateToModule={setActiveModule} />
      ) : activeModule === 'settings' ? (
        <SettingsModule onNavigateToModule={setActiveModule} />
      ) : (
        <CrmPlaceholderModule
          module={currentModuleMeta}
          onNavigateToDashboard={() => setActiveModule('dashboard')}
        />
      )}
    </CrmLayout>
  );
};

export default CrmApp;
