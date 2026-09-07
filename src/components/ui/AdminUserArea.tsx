import React from 'react';
import { LogOut, ShieldCheck, Shield } from 'lucide-react';
import { Avatar } from './Avatar';
import { Badge } from './Badge';

export interface AdminUserAreaProps {
  email: string;
  role: string;
  name?: string;
  onLogout: () => void;
  collapsed?: boolean;
  className?: string;
}

export const AdminUserArea: React.FC<AdminUserAreaProps> = ({
  email,
  role,
  name,
  onLogout,
  collapsed = false,
  className = '',
}) => {
  const displayName = name || (email.split('@')[0].replace(/[._]/g, ' ') || 'Admin User');
  const formattedRole = role.replace(/_/g, ' ');
  const isSuperAdmin = role === 'super_admin';

  return (
    <div
      className={`border-t border-border-color bg-bg-secondary/30 p-3 sm:p-3.5 transition-colors duration-150 ${className}`}
      id="admin-user-account-area"
    >
      <div className="flex items-center justify-between gap-3">
        {/* User Identity & Metadata */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Avatar
            fallbackName={displayName}
            size="sm"
            status="online"
            className="shrink-0"
          />

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xs font-semibold text-text-primary truncate capitalize">
                  {displayName}
                </span>
                {isSuperAdmin ? (
                  <span title="Super Admin" className="shrink-0 flex items-center">
                    <ShieldCheck className="w-3 h-3 text-rose-500" />
                  </span>
                ) : (
                  <span title="Admin" className="shrink-0 flex items-center">
                    <Shield className="w-3 h-3 text-indigo-500" />
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-text-muted truncate select-all">
                  {email}
                </span>
              </div>

              <div className="mt-1.5">
                <Badge
                  variant={isSuperAdmin ? 'danger' : 'neutral'}
                  size="sm"
                  className="capitalize text-[9.5px] px-1.5 py-0 font-medium"
                >
                  {formattedRole}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Professional Logout Action - Restrained, clean, no giant colored square */}
        <button
          onClick={onLogout}
          className="group flex items-center justify-center p-2 rounded-lg text-text-muted hover:text-red-600 hover:bg-bg-secondary active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 shrink-0"
          title="Sign Out of Admin Portal"
          aria-label="Sign Out of Admin Portal"
          id="admin-user-logout-button"
        >
          <LogOut className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};
