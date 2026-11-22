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
    title: 'Logo Design',
    price: '₹2,999',
    description: 'Best for businesses needing a clean, memorable, and high-impact custom logo.',
    features: [
      '2 Unique Logo Concepts',
      '2 Rounds of Revisions Included',
      'Timeline Confirmed After Scope Review',
      'High-Resolution Files (PNG, JPG, Vector/PDF)',
      'Source Files Available Upon Request',
      'Watermarked Preview Before Final Files',
      '50% Advance to Begin; Balance Before Final Files'
    ],
    accentColor: '#0866F5',
    whatsappMessage: 'Hi Rohit, I visited your portfolio and would like to discuss a Logo Design project (Starting at ₹2,999).'
  },
  {
    title: 'Brand Identity Starter',
    price: '₹7,999',
    description: 'Best for startups and growing businesses that need a cohesive and professional visual brand presence.',
    features: [
      '2 to 3 Custom Logo Concepts',
      'Brand Color Palette & Typography Guidelines',
      'Business Card & Letterhead Design',
      'Social Media Profile & Cover Assets',
      '2 Rounds of Revisions Included',
      'Timeline Confirmed After Scope Review',
      'Print-Ready and Digital File Formats',
      'Complete Source Files Included (AI, PSD, or PDF)',
      '50% Advance to Begin; Balance Before Final Files'
    ],
    isPopular: true,
    accentColor: '#0866F5',
    whatsappMessage: 'Hi Rohit, I visited your portfolio and would like to discuss the Brand Identity Starter Package (Starting at ₹7,999).'
  },
  {
    title: 'Complete Brand Identity',
    price: '₹12,999',
    description: 'Best for brands looking for a comprehensive identity system, marketing collateral and digital assets.',
    features: [
      'Complete Logo Suite (Primary, Secondary & Sub-marks)',
      'Comprehensive Brand Style Guide Book',
      'Stationery & Marketing Collateral (Flyer/Brochure/Banner)',
      'Social Media Kit (Templates & Post Graphics)',
      'Complete Source Files for All Approved Assets',
      '2 Rounds of Revisions Per Asset Included',
      'Timeline Confirmed After Scope Review',
      'Dedicated WhatsApp & Email Project Support',
      '50% Advance to Begin; Balance Before Final Files'
    ],
    accentColor: '#0866F5',
    whatsappMessage: 'Hi Rohit, I visited your portfolio and would like to discuss the Complete Brand Identity Package (Starting at ₹12,999 / Custom Quote).'
  }
];

const individualServices = [
  {
    name: 'Graphic Design',
    startingRate: 'Starting at ₹499',
    unit: 'per design',
    description: 'Marketing banners, posters, flyers, print collateral, and custom visual assets.'
  },
  {
    name: 'Social Media Creatives',
    startingRate: 'Starting at ₹3,999',
    unit: 'per package',
    description: 'Branded social posts, carousels, story graphics, and promotional campaign visuals.'
  },
  {
    name: 'Video Editing',
    startingRate: 'Starting at ₹999',
    unit: 'per short video',
    description: 'Reels, YouTube Shorts, TikToks, pacing cuts, dynamic text overlays, and sound design.'
  },
  {
    name: 'Motion Graphics',
    startingRate: 'Starting at ₹1,999',
    unit: 'per video',
    description: 'Logo animations, kinetic typography, intro/outro sequences, and animated teasers.'
  },
  {
    name: 'Website Design & Development',
    startingRate: 'Starting at ₹14,999',
    unit: '',
    description: 'Responsive landing pages, personal portfolios, company websites, and web interfaces.'
  },
  {
    name: 'Digital Marketing',
    startingRate: 'Starting at ₹9,999',
    unit: 'per month',
    description: 'Visual campaign strategy, brand positioning, and social media creative assets.'
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
        accentColor: '#0866F5',
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
                  <span className="text-text-muted text-xs font-medium">
                    {pkg.title === 'Complete Brand Identity' ? 'starting rate / custom' : 'starting rate'}
                  </span>
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

        {/* Individual Services & A La Carte Starting Rates */}
        <div className="mt-14 pt-10 border-t border-border-color" id="individual-services-pricing">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-accent-primary bg-accent-primary/10 px-3 py-1 rounded-full inline-block mb-2">
              Individual Services
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
              A La Carte &amp; Service Starting Rates
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary mt-1.5 leading-relaxed">
              Prices shown are starting estimates. Final pricing depends on the project scope, complexity and required deliverables. A custom quotation will be provided after discussing the project requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {individualServices.map((service, sIdx) => (
              <div
                key={sIdx}
                className="bg-bg-card border border-border-color rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-accent-primary/40 transition-all shadow-xs"
              >
                <div>
                  <div className="flex items-baseline justify-between gap-2 mb-1.5">
                    <h4 className="font-bold text-text-primary text-sm sm:text-base">
                      {service.name}
                    </h4>
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-base sm:text-lg font-extrabold text-accent-primary">
                      {service.startingRate}
                    </span>
                    {service.unit && (
                      <span className="text-xs text-text-muted font-medium">
                        {service.unit}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed mb-4">
                    {service.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-border-color/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedPkg({
                      title: service.name,
                      price: service.startingRate + (service.unit ? ` ${service.unit}` : ''),
                      description: service.description,
                      features: ['Custom Scope Discussion', 'Professional Execution', '2 Rounds of Revisions', 'Timeline Confirmed After Scope Review'],
                      accentColor: '#0866F5',
                      whatsappMessage: `Hi Rohit, I would like to enquire about ${service.name} (${service.startingRate}).`
                    })}
                    className="text-xs font-semibold text-accent-primary hover:text-accent-secondary flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Request Quote</span>
                    <span>→</span>
                  </button>
                  <a
                    href={WHATSAPP_BUSINESS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-text-muted hover:text-text-primary transition-colors"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing & Project Terms Clarity Note */}
        <div className="mt-12 p-6 rounded-2xl bg-bg-card border border-border-color shadow-xs text-xs text-text-secondary">
          <div className="flex items-center gap-2 mb-4 text-text-primary font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-accent-primary shrink-0" />
            <span>Important Project &amp; Payment Terms</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 leading-relaxed">
            <div className="space-y-1.5 bg-bg-primary/50 p-4 rounded-xl border border-border-color/70">
              <strong className="text-text-primary block font-semibold text-xs">Payment Terms:</strong>
              <p>
                A 50% advance payment is required to begin the project. Once work has started, the advance payment is non-refundable. The remaining 50% payment must be completed before delivery of final or source files.
              </p>
            </div>
            <div className="space-y-1.5 bg-bg-primary/50 p-4 rounded-xl border border-border-color/70">
              <strong className="text-text-primary block font-semibold text-xs">Delivery Timelines &amp; Client Delays:</strong>
              <p>
                Project timelines are confirmed after reviewing the scope, complexity and required deliverables. If the client delays providing content, feedback or approval, the project timeline will be extended accordingly.
              </p>
            </div>
            <div className="space-y-1.5 bg-bg-primary/50 p-4 rounded-xl border border-border-color/70">
              <strong className="text-text-primary block font-semibold text-xs">Project Inactivity (30-Day Policy):</strong>
              <p>
                If the client does not provide the required content, feedback or approval for 30 consecutive days, the project may be placed on hold. Restarting the project will depend on availability and may require a revised timeline or quotation.
              </p>
            </div>
            <div className="space-y-1.5 bg-bg-primary/50 p-4 rounded-xl border border-border-color/70">
              <strong className="text-text-primary block font-semibold text-xs">Starting Estimates &amp; Revisions:</strong>
              <p>
                Prices shown are starting estimates. Final pricing depends on the project scope, complexity and required deliverables. A custom quotation will be provided after discussing the project requirements. Standard packages include 2 rounds of revisions.
              </p>
            </div>
          </div>
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
