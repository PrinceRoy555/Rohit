import React from 'react';
import { CrmApp } from '../CRM/CrmApp';

interface AdminPanelProps {
  onClose: () => void;
  onLogout?: () => void;
  initialTab?: string;
}

/**
 * Rohitwork CRM Portal Entry Point.
 * Replaces the legacy Admin Panel UI with the new Premium CRM Portal.
 * Legacy admin files are preserved in src/components/Admin_legacy/ for rollback safety.
 */
export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, onLogout }) => {
  return <CrmApp onClose={onClose} onLogout={onLogout} />;
};

export default AdminPanel;
