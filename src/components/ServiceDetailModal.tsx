import React from 'react';
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
  useBodyScrollLock(!!service, 'service-detail-modal');

  if (!service) return null;

  const whatsappMessage = encodeURIComponent(
    `Hello Rohit, I am interested in learning more about your ${service.title} service!`
  );
  const whatsappLink = `${WHATSAPP_BUSINESS_URL}?text=${whatsappMessage}`;

  const handleQuoteClick = () => {
    onClose();
    onGetQuote(service.title);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-bg-card border border-border-color rounded-3xl w-full max-w-3xl max-h-[calc(100dvh-24px)] sm:max-h-[calc(100dvh-32px)] overflow-y-auto shadow-2xl relative z-10 text-text-primary p-5 sm:p-6 md:p-8 my-auto"
        >
          {/* Close Button - 44x44px Touch Target */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-bg-primary border border-border-color hover:border-accent-primary text-text-secondary hover:text-accent-primary transition-colors cursor-pointer flex items-center justify-center shadow-xs active:scale-95 z-20"
            aria-label="Close modal"
          >
            <Icons.X className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-4 mb-6 pr-10">
            <div className="w-14 h-14 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary flex items-center justify-center flex-shrink-0">
              <DynamicIcon name={service.iconName} className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider bg-accent-primary text-white px-2.5 py-0.5 rounded-full">
                  {service.category}
                </span>
                {service.isPopular && (
                  <span className="text-xs font-bold uppercase tracking-wider bg-bg-secondary text-accent-primary border border-accent-primary/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Icons.Sparkles className="w-3 h-3" />
                    Popular Service
                  </span>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
                {service.title}
              </h2>
            </div>
          </div>

          {/* Introduction */}
          <div className="mb-8 bg-bg-primary p-4 md:p-5 rounded-2xl border border-border-color">
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              {service.details.introduction}
            </p>
          </div>

          {/* Details Grid */}
          <div className="space-y-8">
            {/* What is Included */}
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
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
                <h3 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                  <Icons.Users className="w-5 h-5 text-accent-primary" />
                  Suitable Clients
                </h3>
                <div className="space-y-2">
                  {service.details.suitableClients.map((client, idx) => (
                    <div key={idx} className="text-xs text-text-secondary bg-bg-primary px-3 py-2 rounded-xl border border-border-color flex items-center gap-2">
                      <Icons.ChevronRight className="w-3.5 h-3.5 text-accent-primary" />
                      {client}
                    </div>
                  ))}
                </div>
              </div>

              {/* Work Process */}
              <div>
                <h3 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                  <Icons.Workflow className="w-5 h-5 text-accent-primary" />
                  Work Process
                </h3>
                <div className="space-y-2">
                  {service.details.process.map((step, idx) => (
                    <div key={idx} className="text-xs text-text-secondary bg-bg-primary px-3 py-2 rounded-xl border border-border-color font-medium">
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tools & Deliverables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tools & Tech */}
              <div>
                <h3 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                  <Icons.Wrench className="w-5 h-5 text-accent-primary" />
                  Tools & Technologies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {service.details.tools.map((tool, idx) => (
                    <span key={idx} className="text-xs font-semibold bg-bg-primary text-text-primary border border-border-color px-3 py-1.5 rounded-full">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Deliverables */}
              <div>
                <h3 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                  <Icons.PackageCheck className="w-5 h-5 text-accent-primary" />
                  Deliverables
                </h3>
                <div className="space-y-1.5">
                  {service.details.deliverables.map((deliv, idx) => (
                    <div key={idx} className="text-xs text-text-secondary flex items-center gap-2">
                      <Icons.ArrowRight className="w-3.5 h-3.5 text-accent-primary" />
                      {deliv}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQs */}
            {service.details.faqs && service.details.faqs.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                  <Icons.HelpCircle className="w-5 h-5 text-accent-primary" />
                  Frequently Asked Questions
                </h3>
                <div className="space-y-3">
                  {service.details.faqs.map((faq, idx) => (
                    <div key={idx} className="bg-bg-primary p-3.5 rounded-2xl border border-border-color">
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
          <div className="mt-8 pt-6 border-t border-border-color flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-text-secondary">
              Need a tailored proposal or package? Let’s connect directly!
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-5 py-3 rounded-2xl transition-colors cursor-pointer shadow-md"
              >
                <Icons.MessageSquare className="w-4 h-4" />
                WhatsApp
              </a>
              <button
                onClick={handleQuoteClick}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-accent-primary hover:bg-accent-primary/90 text-white font-bold text-xs px-6 py-3 rounded-2xl transition-colors cursor-pointer shadow-md"
              >
                Get a Quote
                <Icons.ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
