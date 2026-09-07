import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { DetailedService } from '../servicesData';
import { WHATSAPP_BUSINESS_URL } from '../data';
import { useBodyScrollLock } from '../lib/scrollLock';

interface ServiceDetailModalProps {
  service: DetailedService | null;
  onClose: () => void;
  onGetQuote: (serviceTitle: string) => void;
}

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (Icons as any)[name] || Icons.HelpCircle;
  return <IconComponent className={className} />;
}

export default function ServiceDetailModal({ service, onClose, onGetQuote }: ServiceDetailModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useBodyScrollLock(!!service, 'service-detail-modal');

  // Close modal on Escape key
  useEffect(() => {
    if (!service) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [service, onClose]);

  if (!isMounted || typeof document === 'undefined') return null;

  const whatsappMessage = service
    ? encodeURIComponent(
        `Hello Rohit, I am interested in learning more about your ${service.title} service!`
      )
    : '';
  const whatsappLink = `${WHATSAPP_BUSINESS_URL}?text=${whatsappMessage}`;

  const handleQuoteClick = () => {
    if (!service) return;
    const title = service.title;
    onClose();
    onGetQuote(title);
  };

  return createPortal(
    <AnimatePresence>
      {service && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="service-modal-title"
          id="service-detail-modal-overlay"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs cursor-pointer z-0"
            aria-hidden="true"
            id="service-modal-backdrop"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="bg-bg-card border border-border-color rounded-2xl w-full max-w-3xl max-h-[calc(100dvh-24px)] sm:max-h-[calc(100dvh-32px)] overflow-y-auto shadow-2xl relative z-10 text-text-primary p-5 sm:p-7 md:p-8 my-auto focus:outline-hidden"
            tabIndex={-1}
            id="service-modal-card"
          >
            {/* Close Button - Accessible Touch Target (at least 44x44px) */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-5 sm:right-5 min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-bg-primary border border-border-color hover:border-accent-primary text-text-secondary hover:text-accent-primary transition-colors cursor-pointer flex items-center justify-center active:scale-95 z-20 shadow-xs"
              id="service-modal-close-btn"
              aria-label="Close modal"
            >
              <Icons.X className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-3.5 sm:gap-4 mb-6 pr-12">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary flex items-center justify-center shrink-0">
                <DynamicIcon name={service.iconName} className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold uppercase tracking-wider bg-accent-primary text-white px-2.5 py-0.5 rounded-full">
                    {service.category}
                  </span>
                  {service.isPopular && (
                    <span className="text-[11px] font-semibold uppercase tracking-wider bg-bg-secondary text-accent-primary border border-accent-primary/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Icons.Sparkles className="w-3 h-3" />
                      Popular Service
                    </span>
                  )}
                </div>
                <h2
                  id="service-modal-title"
                  className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight leading-snug"
                >
                  {service.title}
                </h2>
              </div>
            </div>

            {/* Introduction */}
            <div className="mb-6 bg-bg-secondary p-4 rounded-xl border border-border-color">
              <p className="text-text-secondary text-sm leading-relaxed">
                {service.details.introduction}
              </p>
            </div>

            {/* Details Grid */}
            <div className="space-y-6">
              {/* What is Included */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                  <Icons.CheckCircle2 className="w-5 h-5 text-accent-primary" />
                  What is Included
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {service.details.included.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-text-secondary bg-bg-primary/50 p-2.5 rounded-xl border border-border-color/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-primary mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suitable Clients & Work Process */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Suitable Clients */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                    <Icons.Users className="w-5 h-5 text-accent-primary" />
                    Suitable Clients
                  </h3>
                  <div className="space-y-2">
                    {service.details.suitableClients.map((client, idx) => (
                      <div key={idx} className="text-xs text-text-secondary bg-bg-primary px-3 py-2 rounded-xl border border-border-color flex items-center gap-2">
                        <Icons.ChevronRight className="w-3.5 h-3.5 text-accent-primary shrink-0" />
                        <span>{client}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Work Process */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                    <Icons.Workflow className="w-5 h-5 text-accent-primary" />
                    Work Process
                  </h3>
                  <div className="space-y-2">
                    {service.details.process.map((step, idx) => (
                      <div key={idx} className="text-xs text-text-secondary bg-bg-primary px-3 py-2 rounded-xl border border-border-color font-medium flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-accent-primary/10 text-accent-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tools & Deliverables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tools & Tech */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                    <Icons.Wrench className="w-5 h-5 text-accent-primary" />
                    Tools & Technologies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {service.details.tools.map((tool, idx) => (
                      <span key={idx} className="text-xs font-semibold bg-bg-primary text-text-primary border border-border-color px-3 py-1.5 rounded-lg">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Deliverables */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                    <Icons.PackageCheck className="w-5 h-5 text-accent-primary" />
                    Deliverables
                  </h3>
                  <div className="space-y-1.5">
                    {service.details.deliverables.map((deliv, idx) => (
                      <div key={idx} className="text-xs text-text-secondary flex items-center gap-2">
                        <Icons.ArrowRight className="w-3.5 h-3.5 text-accent-primary shrink-0" />
                        <span>{deliv}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* FAQs */}
              {service.details.faqs && service.details.faqs.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                    <Icons.HelpCircle className="w-5 h-5 text-accent-primary" />
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-2.5">
                    {service.details.faqs.map((faq, idx) => (
                      <div key={idx} className="bg-bg-secondary p-3.5 rounded-xl border border-border-color">
                        <p className="text-xs font-bold text-text-primary mb-1">
                          Q: {faq.question}
                        </p>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="mt-8 pt-5 border-t border-border-color flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-text-secondary text-center sm:text-left">
                Need a tailored proposal or package? Let’s connect directly!
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 h-11 rounded-xl transition-colors cursor-pointer shadow-xs min-h-[44px]"
                  id="service-modal-whatsapp-btn"
                >
                  <Icons.MessageSquare className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={handleQuoteClick}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-accent-primary hover:bg-accent-secondary text-white font-semibold text-xs px-5 h-11 rounded-xl transition-all duration-150 cursor-pointer shadow-xs active:scale-[0.98] min-h-[44px]"
                  id="service-modal-quote-btn"
                >
                  <span>Get a Quote</span>
                  <Icons.ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
