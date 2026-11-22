import React from 'react';
import { CrmFreelancer } from '../../../../types/crm';
import { FreelancerStatusBadge } from './FreelancerStatusBadge';
import { normalizePhoneNumber } from '../../../../services/crmStorageService';
import {
  Phone,
  Mail,
  Briefcase,
  Globe,
  ExternalLink,
  ChevronRight,
  Star,
  Send,
  CreditCard,
  Edit
} from 'lucide-react';

interface FreelancerCardGridProps {
  freelancers: CrmFreelancer[];
  onSelectFreelancer: (freelancer: CrmFreelancer) => void;
  onEditFreelancer?: (freelancer: CrmFreelancer) => void;
}

export const FreelancerCardGrid: React.FC<FreelancerCardGridProps> = ({
  freelancers,
  onSelectFreelancer,
  onEditFreelancer
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {freelancers.map((f) => {
        const cleanPhone = normalizePhoneNumber(f.phone);
        const waUrl = cleanPhone
          ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
              `Hi ${f.name}, reaching out from Rohitwork regarding active project assignments.`
            )}`
          : '#';

        const agreed = f.agreedAmount || 0;
        const paid = f.paidAmount || 0;
        const pending = f.pendingBalance ?? Math.max(0, agreed - paid);

        return (
          <div
            key={f.id}
            onClick={() => onSelectFreelancer(f)}
            className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all cursor-pointer flex flex-col justify-between"
          >
            {/* Top Row: Avatar, Name & Status */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-sm">
                    {f.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm flex items-center gap-1.5">
                      <span>{f.name}</span>
                      {f.portfolioUrl && (
                        <a
                          href={f.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-400 hover:text-indigo-600"
                          title="Open Portfolio"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-slate-400" />
                      <span>{f.specialty || 'Creative Specialist'}</span>
                    </p>
                  </div>
                </div>

                <FreelancerStatusBadge status={f.status} />
              </div>

              {/* Rating & Rate Strip */}
              <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {f.rating || 5}.0
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1">Rating</span>
                </div>
                <div className="text-slate-600 dark:text-slate-300 font-medium">
                  {f.hourlyRate ? `₹${f.hourlyRate}/hr` : f.fixedRateDefault ? `₹${f.fixedRateDefault.toLocaleString('en-IN')} fix` : 'Project Basis'}
                </div>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(f.skills || []).slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {(f.skills || []).length > 3 && (
                  <span className="text-[10px] text-slate-400 font-medium px-1">
                    +{f.skills.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Section: Financials & CTAs */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
              {/* Financial Balance Row */}
              <div className="flex items-center justify-between text-xs mb-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Agreed</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    ₹{agreed.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Balance Due</span>
                  <p className="font-bold">
                    {pending > 0 ? (
                      <span className="text-amber-600 dark:text-amber-400">
                        ₹{pending.toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        Settled
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <Send className="w-3 h-3" />
                  <span>WhatsApp</span>
                </a>

                {cleanPhone && (
                  <a
                    href={`tel:${cleanPhone}`}
                    className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
                    title={`Call ${cleanPhone}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                )}

                {onEditFreelancer && (
                  <button
                    onClick={() => onEditFreelancer(f)}
                    className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    title="Edit Profile"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
