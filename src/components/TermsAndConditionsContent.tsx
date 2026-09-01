import React from 'react';
import { ShieldCheck, FileCheck, Scale, AlertCircle, Mail, Phone, MapPin } from 'lucide-react';
import { contactConfig } from '../data';

export default function TermsAndConditionsContent() {
  return (
    <div className="space-y-8 text-text-secondary text-sm leading-relaxed max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="bg-bg-card border border-border-color rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-border-color">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent-primary bg-accent-primary/10 px-3 py-1 rounded-full inline-block mb-2">
              Legal Agreement
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
              Terms & Conditions
            </h1>
          </div>
          <div className="text-xs text-text-muted space-y-1 text-right">
            <div><strong className="text-text-primary">Effective Date:</strong> 10 August 2026</div>
            <div><strong className="text-text-primary">Last Updated:</strong> 10 August 2026</div>
          </div>
        </div>
        <p className="text-text-secondary text-sm">
          These Terms and Conditions (&ldquo;Terms&rdquo;) govern the creative design, video editing, branding, and digital media services provided by <strong className="text-text-primary">Unicivix Solutions</strong>, founded by <strong className="text-text-primary">Rohit Verma</strong> (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), through our website, communications, and service contracts.
        </p>
        <div className="mt-4 p-3 bg-accent-primary/5 border border-accent-primary/20 rounded-xl flex items-start gap-2.5 text-xs text-text-primary font-medium">
          <Scale className="w-4 h-4 text-accent-primary flex-shrink-0 mt-0.5" />
          <span>By commissioning our services, submitting project requests, or using this website, you agree to be bound by these Terms and Conditions.</span>
        </div>
      </div>

      {/* Section 1: Scope of Services */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border-color pb-2">
          <span className="w-2 h-2 rounded-full bg-accent-primary" />
          1. Scope of Creative Services
        </h2>
        <p>
          We provide specialized creative services including Graphic Design, Brand Identity &amp; Logo Development, Video Editing &amp; Short-Form Content Creation, Motion Graphics, Social Media Creatives, Visual Design, and UI/UX Consulting.
        </p>
        <p>
          Each project scope is defined in an agreed work order, quotation, or written project brief detailing deliverables, revision cycles, format outputs, and agreed milestones.
        </p>
      </section>

      {/* Section 2: Project Milestones & Payments */}
      <section className="space-y-3 bg-bg-card p-5 rounded-2xl border border-border-color">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border-color pb-2">
          <span className="w-2 h-2 rounded-full bg-accent-primary" />
          2. Payment Terms &amp; Advance Structure
        </h2>
        <p>
          To initiate creative production and allocate schedule availability, standard engagements require a <strong className="text-accent-primary font-semibold">50% advance booking deposit</strong> prior to commencement.
        </p>
        <ul className="list-disc pl-5 space-y-1.5 marker:text-accent-primary">
          <li><strong>Initial Deposit:</strong> 50% upfront before kickoff and initial concept exploration.</li>
          <li><strong>Final Delivery:</strong> The remaining 50% balance is due upon review and client approval of preview deliverables, prior to the release of full un-watermarked high-resolution master assets and source files.</li>
          <li><strong>Custom Milestones:</strong> Large-scale retainer or multi-deliverable packages may have customized milestone payment schedules as agreed in writing.</li>
        </ul>
      </section>

      {/* Section 3: Revisions & Approvals */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border-color pb-2">
          <span className="w-2 h-2 rounded-full bg-accent-primary" />
          3. Revisions &amp; Iteration Policy
        </h2>
        <p>
          All standard creative packages include designated revision rounds (typically 2 to 3 iterations within the originally defined project scope) to refine concepts, colors, typography, or visual pacing.
        </p>
        <p>
          Substantial changes in project brief direction, fundamental conceptual pivots, or additional asset requirements introduced after kickoff will be quoted as scope adjustments or billed at standard hourly/deliverable rates.
        </p>
      </section>

      {/* Section 4: Intellectual Property Rights */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border-color pb-2">
          <span className="w-2 h-2 rounded-full bg-accent-primary" />
          4. Intellectual Property &amp; Usage Rights
        </h2>
        <p>
          Upon receipt of full final payment, the client receives full commercial publication and usage rights for the final approved creative deliverables.
        </p>
        <p>
          We retain the right to showcase non-confidential project deliverables, case studies, and creative milestones within our professional portfolio, website, and promotional reels unless a formal Non-Disclosure Agreement (NDA) is executed in advance.
        </p>
      </section>

      {/* Section 5: Client Responsibilities */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border-color pb-2">
          <span className="w-2 h-2 rounded-full bg-accent-primary" />
          5. Client Responsibilities &amp; Materials
        </h2>
        <p>
          The client warrants that all raw footage, photographs, fonts, logos, audio tracks, and reference assets provided for use in the project are owned by the client or licensed with adequate rights. The client indemnifies Unicivix Solutions and Rohit Verma against third-party copyright claims arising from client-provided materials.
        </p>
      </section>

      {/* Section 6: Contact Information */}
      <section className="bg-gradient-to-br from-bg-card to-bg-secondary border-2 border-accent-primary/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-accent-primary/10 rounded-full blur-3xl pointer-events-none" />
        <h2 className="text-xl font-bold text-text-primary mb-2 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-accent-primary" />
          6. Legal &amp; Project Inquiries
        </h2>
        <p className="text-xs text-text-secondary mb-4">
          For project contracts, NDA discussions, or questions regarding these terms, reach out directly:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
          <div className="space-y-2 bg-bg-primary/60 p-4 rounded-xl border border-border-color">
            <div className="font-bold text-text-primary text-sm">Unicivix Solutions</div>
            <div className="text-text-secondary"><strong className="text-text-primary">Founder:</strong> Rohit Verma</div>
            <div className="flex items-center gap-1.5 text-text-secondary">
              <MapPin className="w-3.5 h-3.5 text-accent-primary" />
              <span>Jaipur, Rajasthan, India</span>
            </div>
          </div>

          <div className="space-y-2 bg-bg-primary/60 p-4 rounded-xl border border-border-color">
            <a
              href={contactConfig.emailHref}
              aria-label={`Email Rohit Verma at ${contactConfig.emailDisplay}`}
              className="flex items-center gap-2 text-text-primary hover:text-accent-primary transition-colors contact-email"
            >
              <Mail className="w-4 h-4 text-accent-primary" />
              <span>{contactConfig.emailDisplay}</span>
            </a>
            <a
              href={contactConfig.phoneHref}
              aria-label={`Call Rohit Verma at ${contactConfig.phoneDisplay}`}
              className="flex items-center gap-2 text-text-primary hover:text-accent-primary transition-colors"
            >
              <Phone className="w-4 h-4 text-accent-primary" />
              <span>{contactConfig.phoneDisplay}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
