import React from 'react';
import { CrmClient, CrmClientStatus } from '../../../../types/crm';
import { ClientStatusBadge } from './ClientStatusBadge';
import { saveStoredClient, normalizePhoneNumber } from '../../../../services/crmStorageService';
import {
  Phone,
  Mail,
  Building,
  FolderKanban,
  MessageSquare,
  ChevronRight,
  Sparkles,
  Edit
} from 'lucide-react';

interface ClientTableViewProps {
  clients: CrmClient[];
  onSelectClient: (client: CrmClient) => void;
  onEditClient?: (client: CrmClient) => void;
  onRefresh?: () => void;
}

export const ClientTableView: React.FC<ClientTableViewProps> = ({
  clients,
  onSelectClient,
  onEditClient,
  onRefresh
}) => {
  const handleQuickStatus = (clientId: string, current: CrmClient, newStatus: CrmClientStatus, e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    saveStoredClient({
      id: clientId,
      name: current.name,
      status: e.target.value as CrmClientStatus
    });
    if (onRefresh) onRefresh();
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <table className="w-full text-left border-collapse text-xs">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
            <th className="py-3.5 px-4">Client / Brand</th>
            <th className="py-3.5 px-4">Contact</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4">Financials & Projects</th>
            <th className="py-3.5 px-4">Tags</th>
            <th className="py-3.5 px-4">Client Since</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {clients.map((client) => {
            const cleanPhone = normalizePhoneNumber(client.phone);
            const waUrl = cleanPhone
              ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                  `Hi ${client.name}, Rohit here from RohitWork.`
                )}`
              : null;

            const isPhoneOnly = !client.email || client.email.includes('@client.rohitwork.in');

            return (
              <tr
                key={client.id}
                onClick={() => onSelectClient(client)}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition group"
              >
                {/* 1. Client / Brand */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition flex items-center gap-1.5">
                        <span>{client.name}</span>
                        {client.isDemo ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Demo Record
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Live Firestore
                          </span>
                        )}
                        {client.leadSourceId && (
                          <span
                            title="Converted from Website Enquiry"
                            className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"
                          />
                        )}
                      </div>
                      {client.company && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3" />
                          <span>{client.company}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* 2. Contact Details */}
                <td className="py-3.5 px-4">
                  <div className="space-y-0.5">
                    {client.phone ? (
                      <span className="flex items-center gap-1 font-mono text-slate-700 dark:text-slate-300">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {client.phone}
                      </span>
                    ) : (
                      <span className="text-slate-400">No phone</span>
                    )}

                    {!isPhoneOnly ? (
                      <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {client.email}
                      </span>
                    ) : (
                      <span className="inline-block text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                        Phone Only
                      </span>
                    )}
                  </div>
                </td>

                {/* 3. Status */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <ClientStatusBadge status={client.status} />
                    <select
                      value={client.status || 'active'}
                      onChange={(e) => handleQuickStatus(client.id, client, client.status, e)}
                      className="text-[11px] py-1 px-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </td>

                {/* 4. Financials & Projects */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white">
                    <FolderKanban className="w-3.5 h-3.5 text-slate-400" />
                    <span>{client.totalProjects || 0} Projects</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Billed: <strong className="text-slate-800 dark:text-slate-200">₹{(client.totalBilled || 0).toLocaleString('en-IN')}</strong>
                  </div>
                  {(client.outstandingBalance || 0) > 0 && (
                    <div className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                      Due: ₹{(client.outstandingBalance || 0).toLocaleString('en-IN')}
                    </div>
                  )}
                </td>

                {/* 5. Tags */}
                <td className="py-3.5 px-4">
                  {client.tags && client.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      {client.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                        >
                          {t}
                        </span>
                      ))}
                      {client.tags.length > 2 && (
                        <span className="text-[10px] text-slate-400">
                          +{client.tags.length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>

                {/* 6. Joined Date */}
                <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                  {client.createdAt
                    ? new Date(client.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    : 'N/A'}
                </td>

                {/* 7. Actions */}
                <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Chat on WhatsApp"
                        className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    )}

                    {onEditClient && (
                      <button
                        type="button"
                        onClick={() => onEditClient(client)}
                        title="Edit Client"
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onSelectClient(client)}
                      title="View Profile"
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
