import React from 'react';
import { CrmClient } from '../../../../types/crm';
import { ClientStatusBadge } from './ClientStatusBadge';
import { normalizePhoneNumber } from '../../../../services/crmStorageService';
import {
  Phone,
  Mail,
  Building,
  MapPin,
  FolderKanban,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Edit
} from 'lucide-react';

interface ClientCardGridProps {
  clients: CrmClient[];
  onSelectClient: (client: CrmClient) => void;
  onEditClient?: (client: CrmClient) => void;
}

export const ClientCardGrid: React.FC<ClientCardGridProps> = ({
  clients,
  onSelectClient,
  onEditClient
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {clients.map((client) => {
        const cleanPhone = normalizePhoneNumber(client.phone);
        const waUrl = cleanPhone
          ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
              `Hi ${client.name}, Rohit here from RohitWork.`
            )}`
          : null;

        const isPhoneOnly = !client.email || client.email.includes('@client.rohitwork.in');

        return (
          <div
            key={client.id}
            onClick={() => onSelectClient(client)}
            className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-500/40 cursor-pointer transition flex flex-col justify-between"
          >
            <div>
              {/* Top Row: Avatar, Name, Status */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-sm shrink-0">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition flex items-center gap-1.5 line-clamp-1">
                      <span>{client.name}</span>
                      {client.isDemo ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          Demo
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Live
                        </span>
                      )}
                      {client.leadSourceId && (
                        <span title="Converted from Lead">
                          <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        </span>
                      )}
                    </h3>
                    {client.company && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                        <Building className="w-3 h-3 shrink-0" />
                        <span className="truncate">{client.company}</span>
                      </p>
                    )}
                  </div>
                </div>

                <ClientStatusBadge status={client.status} />
              </div>

              {/* Contact Information */}
              <div className="space-y-1.5 py-3 border-y border-slate-100 dark:border-slate-800/80 text-xs">
                {client.phone && (
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {!isPhoneOnly && client.email ? (
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                ) : (
                  <div className="inline-block text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                    Phone-Only Client
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{client.address}</span>
                  </div>
                )}
              </div>

              {/* Financial Snapshot */}
              <div className="grid grid-cols-3 gap-2 my-3 text-[11px]">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-slate-400 block text-[10px]">Projects</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {client.totalProjects || 0}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-slate-400 block text-[10px]">Billed</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    ₹{(client.totalBilled || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-slate-400 block text-[10px]">Due</span>
                  <span
                    className={`font-bold ${
                      (client.outstandingBalance || 0) > 0
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-slate-500'
                    }`}
                  >
                    ₹{(client.outstandingBalance || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Tags */}
              {client.tags && client.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {client.tags.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              {waUrl ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              ) : (
                <span className="text-xs text-slate-400">No WhatsApp</span>
              )}

              <div className="flex items-center gap-1">
                {onEditClient && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditClient(client);
                    }}
                    title="Edit Client"
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onSelectClient(client)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition"
                >
                  <span>Profile</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
