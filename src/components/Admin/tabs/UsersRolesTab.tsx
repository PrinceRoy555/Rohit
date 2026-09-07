import React, { useState, useEffect } from 'react';
import { AdminUser } from '../../../types/cms';
import {
  fetchAdminUsers,
  createAdminUser,
  deleteAdminUser,
  fetchAuditLogs
} from '../../../services/cmsApi';
import { PageHeader } from '../layout/PageHeader';
import {
  Shield,
  UserPlus,
  Trash2,
  Lock,
  History,
  CheckCircle2,
  AlertTriangle,
  Key,
  Users
} from 'lucide-react';

export const UsersRolesTab: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'audit'>('users');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'super_admin' | 'admin' | 'editor'>('editor');
  const [password, setPassword] = useState('');

  const loadData = async () => {
    setLoading(true);
    const [usersRes, logsRes] = await Promise.all([
      fetchAdminUsers(),
      fetchAuditLogs(50)
    ]);
    if (usersRes.success && usersRes.users) {
      setUsers(usersRes.users);
    }
    if (logsRes.success && logsRes.logs) {
      setAuditLogs(logsRes.logs);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    const res = await createAdminUser({
      email: email.trim(),
      name: name.trim() || email.split('@')[0],
      role,
      password: password.trim()
    });

    if (res.success && res.user) {
      setUsers((prev) => [...prev, res.user!]);
      setIsAddUserModalOpen(false);
      setEmail('');
      setName('');
      setPassword('');
      setActionSuccess(`Admin account for ${res.user.email} created!`);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  const handleDeleteUser = async (id: string, userEmail: string) => {
    if (!window.confirm(`Delete user account "${userEmail}"?`)) return;
    const res = await deleteAdminUser(id);
    if (res.success) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setActionSuccess(`Deleted user ${userEmail}`);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Admin Users & Security Audit"
        description="Manage admin credentials, role permissions, and view immutable security audit logs."
        actions={
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="h-9 px-3.5 rounded-lg text-xs font-semibold bg-accent-primary hover:bg-accent-secondary text-white flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer select-none"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Admin User</span>
          </button>
        }
      />

      {actionSuccess && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm flex items-center gap-2.5 sm:gap-3">
          <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Sub-nav */}
      <div className="flex gap-1.5 p-1 sm:p-1.5 bg-bg-card border border-border-color rounded-xl sm:rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex-1 min-h-[40px] flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-98 ${
            activeSubTab === 'users'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-text-muted hover:text-text-primary hover:bg-bg-secondary'
          }`}
        >
          <Users className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          <span>Team Accounts ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('audit')}
          className={`flex-1 min-h-[40px] flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-98 ${
            activeSubTab === 'audit'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-text-muted hover:text-text-primary hover:bg-bg-secondary'
          }`}
        >
          <History className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          <span>Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* USERS TAB */}
      {activeSubTab === 'users' && (
        <div className="space-y-2.5 sm:space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-bg-card border border-border-color flex items-center justify-between gap-3 sm:gap-4 shadow-xs"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-bold text-text-primary truncate">{u.name}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase tracking-wider">
                    {u.role.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-[11px] sm:text-xs text-text-muted font-mono truncate">{u.email}</div>
              </div>

              {u.role !== 'super_admin' && (
                <button
                  onClick={() => handleDeleteUser(u.id, u.email)}
                  className="min-h-[40px] min-w-[40px] p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors flex items-center justify-center flex-shrink-0 active:scale-95"
                  title="Delete user account"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* AUDIT LOG TAB */}
      {activeSubTab === 'audit' && (
        <div className="bg-bg-card border border-border-color rounded-xl sm:rounded-2xl p-3.5 sm:p-5 space-y-3 sm:space-y-4 shadow-xs">
          <h3 className="text-xs sm:text-sm font-bold text-text-primary">System Activity & Authentication Logs</h3>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-bg-secondary border border-border-color flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono"
              >
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      log.status === 'success'
                        ? 'bg-emerald-500'
                        : log.status === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                  <span className="text-rose-600 dark:text-rose-400 font-bold">{log.action}</span>
                  <span className="text-text-muted truncate">({log.userEmail})</span>
                  <span className="text-text-secondary truncate">{log.details}</span>
                </div>

                <div className="text-text-muted text-[10px] sm:text-[11px] self-start sm:self-auto flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()} • IP: {log.ipAddress || '127.0.0.1'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Add User */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-bg-card border border-border-color rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 space-y-3.5 sm:space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-bold text-text-primary">Add Team Administrator</h3>

            <form onSubmit={handleCreateUser} className="space-y-3.5 sm:space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Client Manager"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Admin Email</label>
                <input
                  type="email"
                  required
                  placeholder="admin@client.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Role Permissions</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full min-h-[42px] bg-bg-secondary border border-border-color rounded-xl px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
                >
                  <option value="editor">Editor (Content & Media Only)</option>
                  <option value="admin">Admin (Full Customizer & Sections)</option>
                  <option value="super_admin">Super Admin (All Permissions)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-color">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold bg-bg-secondary hover:bg-bg-card text-text-secondary border border-border-color active:scale-98"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs active:scale-98"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
