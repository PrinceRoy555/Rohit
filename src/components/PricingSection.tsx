import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Check, MessageSquare, Phone, Mail, FileText, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { WHATSAPP_BUSINESS_URL, contactConfig } from '../data';
import { submitQuoteRequest } from '../services/firebase/firestore';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useBodyScrollLock } from '../lib/scrollLock';

interface PricingPackage {
  title: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  accentColor: string;
  whatsappMessage: string;
}

const defaultPackages: PricingPackage[] = [
  {
    title: 'Starter',
    price: '₹4,999',
    description: 'Social Media Design Package perfect for growing personal brands and early-stage setups.',
    features: [
      '10 Custom Social Designs',
      'Original Brand-Compliant Fonts',
      'Direct Canva Template Access',
      'Basic revisions included',
      'Standard 7-day delivery'
    ],
    accentColor: '#D31322',
    whatsappMessage: 'Hello Rohit, I am interested in your Starter Social Media Design Package starting at ₹4,999.'
  },
  {
    title: 'Professional',
    price: '₹12,999',
    description: 'Branding and content package curated to scale business outreach and increase engagement.',
    features: [
      '20 Premium Social Designs',
      '5 Edited Reels (High Pacing)',
      'Brand Identity Refresh (Logo + Colors)',
      'Priority revisions & Feedback',
      'Express 4-day delivery'
    ],
    isPopular: true,
    accentColor: '#D31322',
    whatsappMessage: 'Hello Rohit, I am interested in your Professional Branding & Content Package starting at ₹12,999.'
  },
  {
    title: 'Premium',
    price: 'Custom',
    description: 'Complete creative solution and dedicated design partnership for high-velocity brands.',
    features: [
      'Full Brand Identity Strategy',
      'Uncapped Social Media Creatives',
      'Premium Video Editing (Reels/Shorts)',
      'Cinematic Motion Graphics',
      'Dedicated Slack/WhatsApp support'
    ],
    accentColor: '#D31322',
    whatsappMessage: 'Hello Rohit, I am interested in your Premium Complete Creative Solution. Let\'s discuss details and custom pricing.'
  }
];

export default function PricingSection() {
  const { activeConfig } = useSiteConfig();
  const rawTiers = activeConfig?.pricingTiers;
  const packages: PricingPackage[] = (rawTiers && rawTiers.length > 0)
    ? rawTiers.map((t) => ({
        title: t.name,
        price: t.price,
        description: t.description,
        features: t.features,
        isPopular: t.isPopular,
        accentColor: '#D31322',
        whatsappMessage: `Hello Rohit, I am interested in your ${t.name} Package starting at ${t.price}.`
      }))
    : defaultPackages;

  const [selectedPkg, setSelectedPkg] = useState<PricingPackage | null>(null);
  const [quoteForm, setQuoteForm] = useState({ name: '', email: '', phone: '', details: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quoteStatus, setQuoteStatus] = useState<{ success?: boolean; msg?: string } | null>(null);

  useBodyScrollLock(selectedPkg !== null);

  const handleOpenQuoteModal = (pkg: PricingPackage) => {
    setSelectedPkg(pkg);
    setQuoteStatus(null);
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkg || isSubmitting) return;

    setIsSubmitting(true);
    setQuoteStatus(null);

    const res = await submitQuoteRequest({
      name: quoteForm.name,
      email: quoteForm.email,
      phone: quoteForm.phone,
      packageName: selectedPkg.title,
      requiredService: `Package: ${selectedPkg.title} (${selectedPkg.price})`,
      projectDescription: quoteForm.details || selectedPkg.description
    });

    setIsSubmitting(false);

    if (res.success) {
      setQuoteStatus({
        success: true,
        msg: 'Thank you! Your quote request has been saved successfully. Rohit or the Unicivix Solutions team will contact you shortly.'
      });
      setQuoteForm({ name: '', email: '', phone: '', details: '' });
      setTimeout(() => {
        setSelectedPkg(null);
        setQuoteStatus(null);
      }, 4000);
    } else {
      setQuoteStatus({
        success: false,
        msg: res.error || 'Unable to submit quote request. Please connect on WhatsApp directly.'
      });
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-bg-secondary relative overflow-hidden transition-colors duration-300" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16" id="pricing-header">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-accent-primary font-semibold text-xs tracking-widest uppercase mb-2 block"
          >
            Pricing Plans
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight mb-3 sm:mb-4"
          >
            Creative Packages
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-text-secondary text-sm sm:text-base leading-relaxed"
          >
            Transparent, result-driven packages configured for brands, startups, and academies seeking high-end creative velocity.
          </motion.p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch" id="pricing-grid">
          {packages.map((pkg, idx) => (
            <motion.div
              key={pkg.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className={`rounded-xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-150 relative ${
                pkg.isPopular
                  ? 'bg-bg-card border-2 border-accent-primary shadow-sm z-10'
                  : 'bg-bg-card border border-border-color hover:border-border-color/80'
              }`}
              id={`pricing-card-${pkg.title.toLowerCase()}`}
            >
              {/* Most Popular Badge */}
              {pkg.isPopular && (
                <div className="absolute -top-3 left-6 bg-accent-primary text-white text-[10px] uppercase font-semibold tracking-wider px-2.5 py-0.5 rounded-md shadow-xs">
                  Most Popular
                </div>
              )}

              {/* Top part of package card */}
              <div>
                <h3 className="text-lg font-bold text-text-primary mb-1.5" id={`pricing-title-${pkg.title.toLowerCase()}`}>
                  {pkg.title}
                </h3>
                <p className="text-text-secondary text-xs leading-relaxed mb-5">
                  {pkg.description}
                </p>
                
                {/* Price Display */}
                <div className="flex items-baseline gap-1.5 mb-6" id={`pricing-rate-${pkg.title.toLowerCase()}`}>
                  <span className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight tabular-nums">
                    {pkg.price}
                  </span>
                  {pkg.price !== 'Custom' && (
                    <span className="text-text-muted text-xs font-medium">/ package</span>
                  )}
                </div>

                {/* Separator line */}
                <div className="h-[1px] bg-border-color mb-6" />

                {/* Features checklist */}
                <ul className="space-y-3 mb-6" id={`pricing-features-${pkg.title.toLowerCase()}`}>
                  {pkg.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5">
                      <div
                        className="w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 bg-accent-primary/10 text-accent-primary"
                      >
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </div>
                      <span className="text-text-primary text-xs sm:text-sm font-normal leading-normal">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Plan Action Triggers */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenQuoteModal(pkg)}
                  className={`w-full flex items-center justify-center gap-2 font-semibold h-10 px-4 rounded-lg text-xs tracking-wide text-center active:scale-[0.98] transition-all duration-150 cursor-pointer ${
                    pkg.isPopular
                      ? 'bg-accent-primary text-white hover:bg-accent-secondary shadow-xs'
                      : 'bg-bg-primary border border-border-color hover:border-accent-primary text-text-primary hover:text-accent-primary'
                  }`}
                  id={`choose-plan-btn-${pkg.title.toLowerCase()}`}
                >
                  <span>Request Quote for {pkg.title}</span>
                  <FileText className="w-3.5 h-3.5" />
                </button>

                <a
                  href={WHATSAPP_BUSINESS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 font-medium text-xs text-text-secondary hover:text-accent-primary py-1.5 text-center transition-colors"
                >
                  <span>Or discuss on WhatsApp →</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Direct Call & Email Enquiry Option */}
        <div className="mt-12 text-center text-sm text-text-secondary flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-accent-primary" />
            <span>Call:</span>
            <a
              href={contactConfig.phoneHref}
              aria-label={`Call Rohit Verma at ${contactConfig.phoneDisplay}`}
              className="text-text-primary font-bold hover:text-accent-primary transition-colors underline decoration-accent-primary/40 underline-offset-4"
            >
              {contactConfig.phoneDisplay}
            </a>
          </div>
          <span className="hidden sm:inline text-text-muted">•</span>
          <div className="flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-accent-primary" />
            <span>Email:</span>
            <a
              href={contactConfig.emailHref}
              aria-label={`Email Rohit Verma at ${contactConfig.emailDisplay}`}
              className="text-text-primary font-bold hover:text-accent-primary transition-colors underline decoration-accent-primary/40 underline-offset-4 contact-email"
            >
              {contactConfig.emailDisplay}
            </a>
          </div>
        </div>
      </div>

      {/* Quote Modal portalled to document.body */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedPkg && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                transition={{ duration: 0.15 }}
                className="bg-bg-card border border-border-color rounded-xl p-6 sm:p-7 max-w-lg w-full max-h-[calc(100dvh-32px)] overflow-y-auto shadow-xl relative my-auto"
              >
                <button
                  onClick={() => setSelectedPkg(null)}
                  className="absolute top-4 right-4 w-9 h-9 text-text-secondary hover:text-text-primary rounded-lg hover:bg-bg-secondary transition-colors flex items-center justify-center cursor-pointer active:scale-95 z-20"
                  type="button"
                  aria-label="Close quote modal"
                >
                  <X className="w-4 h-4" />
                </button>

                <h3 className="text-lg font-bold text-text-primary mb-1 pr-8">
                  Request Quote: {selectedPkg.title} ({selectedPkg.price})
                </h3>
                <p className="text-xs text-text-secondary mb-5">
                  Fill in your contact details to submit a formal quote request directly to Rohit Verma.
                </p>

                {quoteStatus && (
                  <div className={`p-3.5 rounded-lg mb-4 flex items-start gap-2.5 text-xs ${
                    quoteStatus.success ? 'bg-accent-primary/10 border border-accent-primary/20 text-text-primary' : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}>
                    {quoteStatus.success ? (
                      <CheckCircle2 className="w-4 h-4 text-accent-primary flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <span>{quoteStatus.msg}</span>
                  </div>
                )}

                <form onSubmit={handleQuoteSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={quoteForm.name}
                      onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                      className="w-full bg-bg-primary border border-border-color rounded-lg px-3.5 h-10 text-sm text-text-primary focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all duration-150"
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={quoteForm.email}
                      onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                      className="w-full bg-bg-primary border border-border-color rounded-lg px-3.5 h-10 text-sm text-text-primary focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all duration-150"
                      placeholder="name@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                      Phone / WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={quoteForm.phone}
                      onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                      className="w-full bg-bg-primary border border-border-color rounded-lg px-3.5 h-10 text-sm text-text-primary focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all duration-150"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                      Additional Requirements / Deadline
                    </label>
                    <textarea
                      rows={3}
                      value={quoteForm.details}
                      onChange={(e) => setQuoteForm({ ...quoteForm, details: e.target.value })}
                      className="w-full bg-bg-primary border border-border-color rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all duration-150"
                      placeholder="Any specific branding guidelines, target launch date or custom needs..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 bg-accent-primary text-white font-semibold rounded-lg hover:bg-accent-secondary transition-all duration-150 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 text-sm mt-2 active:scale-[0.98] shadow-xs"
                  >
                    {isSubmitting ? 'Submitting Quote...' : 'Submit Quote Request'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
}
