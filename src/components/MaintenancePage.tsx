import React from 'react';
import { motion } from 'motion/react';
import { Wrench, Phone, Mail, Clock, ShieldAlert } from 'lucide-react';
import { contactConfig } from '../data';
import { useSiteConfig } from '../context/SiteConfigContext';

interface MaintenancePageProps {
  onAdminBypass?: () => void;
}

export default function MaintenancePage({ onAdminBypass }: MaintenancePageProps) {
  const { activeConfig } = useSiteConfig();
  const siteName = activeConfig?.branding?.siteName || 'Rohit Verma';

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300" id="maintenance-screen">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent-secondary/10 blur-[120px] pointer-events-none" />

      <div className="text-center max-w-xl relative z-10">
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-accent-primary/10 border border-accent-primary/25 flex items-center justify-center text-accent-primary mx-auto mb-6 shadow-lg shadow-accent-primary/10"
          id="maintenance-icon-box"
        >
          <Wrench className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse" />
        </motion.div>

        {/* Maintenance Badge */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-primary/10 border border-accent-primary/30 text-accent-primary text-xs font-bold uppercase tracking-wider mb-4"
        >
          <Clock className="w-3.5 h-3.5" />
          Scheduled Studio Upgrade in Progress
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black text-text-primary tracking-tight mb-4"
          id="maintenance-heading"
        >
          Under Maintenance<span className="text-accent-primary">.</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-text-secondary text-sm sm:text-base leading-relaxed mb-8 font-medium max-w-lg mx-auto"
          id="maintenance-desc"
        >
          We are currently updating our creative portfolio showcase and upgrading system infrastructure. We will be back online shortly with enhanced visuals and faster experiences.
        </motion.p>

        {/* Direct Contact Options */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          id="maintenance-actions"
        >
          <a
            href={contactConfig.whatsappBusinessUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-accent-primary hover:bg-accent-hover text-white font-bold px-6 py-3.5 rounded-full text-sm shadow-lg shadow-accent-primary/20 active:scale-95 transition-all duration-200"
          >
            Connect on WhatsApp
          </a>
          <a
            href={contactConfig.phoneHref}
            aria-label={`Call Rohit Verma at ${contactConfig.phoneDisplay}`}
            className="inline-flex items-center gap-2 bg-bg-card border border-border-color hover:border-accent-primary text-text-primary hover:text-accent-primary font-bold px-5 py-3.5 rounded-full text-sm active:scale-95 transition-all duration-200"
          >
            <Phone className="w-4 h-4 text-accent-primary" />
            {contactConfig.phoneDisplay}
          </a>
          <a
            href={contactConfig.emailHref}
            aria-label={`Email Rohit Verma at ${contactConfig.emailDisplay}`}
            className="inline-flex items-center gap-2 bg-bg-card border border-border-color hover:border-accent-primary text-text-primary hover:text-accent-primary font-bold px-5 py-3.5 rounded-full text-sm active:scale-95 transition-all duration-200"
          >
            <Mail className="w-4 h-4 text-accent-primary" />
            Email Rohit
          </a>
        </motion.div>

        {/* Hidden/Subtle Admin Access button for site owners */}
        {onAdminBypass && (
          <div className="mt-12">
            <button
              onClick={onAdminBypass}
              className="text-[11px] text-text-muted hover:text-text-secondary inline-flex items-center gap-1.5 transition-colors font-medium cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Admin Portal Access
            </button>
          </div>
        )}
      </div>

      {/* Decorative Footer note */}
      <div className="absolute bottom-6 text-[10px] text-text-muted tracking-wider uppercase font-semibold">
        {siteName} • Creative Portfolio
      </div>
    </div>
  );
}
