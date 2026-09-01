import React, { useState, useEffect } from 'react';
import { AdminUser } from '../../../types/cms';
import {
  fetchAdminUsers,
  createAdminUser,
  deleteAdminUser,
  fetchAuditLogs
} from '../../../services/cmsApi';
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
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-rose-500" />
            <span>Admin Users & Security Audit</span>
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Manage admin credentials, role permissions, and view immutable security audit logs.
          </p>
        </div>

        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Admin User</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Sub-nav */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-neutral-900/80 border border-white/10 rounded-2xl">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSubTab === 'users'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team Accounts ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSubTab === 'audit'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Security Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* USERS TAB */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          {users.map((u) => (
            <div
              key={u.id}
              className="p-5 rounded-2xl bg-neutral-900/80 border border-white/10 flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h4 className="text-sm font-bold text-white">{u.name}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20 uppercase">
                    {u.role.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs text-neutral-400 font-mono">{u.email}</div>
              </div>

              {u.role !== 'super_admin' && (
                <button
                  onClick={() => handleDeleteUser(u.id, u.email)}
                  className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
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
        <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-4 sm:p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">System Activity & Authentication Logs</h3>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      log.status === 'success'
                        ? 'bg-emerald-400'
                        : log.status === 'warning'
                        ? 'bg-amber-400'
                        : 'bg-rose-400'
                    }`}
                  />
                  <span className="text-rose-300 font-bold">{log.action}</span>
                  <span className="text-neutral-400">({log.userEmail})</span>
                  <span className="text-neutral-300">{log.details}</span>
                </div>

                <div className="text-neutral-500 text-[11px] self-end sm:self-auto">
                  {new Date(log.timestamp).toLocaleTimeString()} • IP: {log.ipAddress || '127.0.0.1'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Add User */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Add Team Administrator</h3>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Client Manager"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Admin Email</label>
                <input
                  type="email"
                  required
                  placeholder="admin@client.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Role Permissions</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
                >
                  <option value="editor">Editor (Content & Media Only)</option>
                  <option value="admin">Admin (Full Customizer & Sections)</option>
                  <option value="super_admin">Super Admin (All Permissions)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30"
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
