import React from 'react';
import { ShieldCheck, FileCheck, Scale, AlertCircle, Mail, Phone, MapPin, Clock, RefreshCw, Layers, DollarSign, UserCheck, HelpCircle } from 'lucide-react';
import { contactConfig } from '../data';

export default function TermsAndConditionsContent() {
  return (
    <div className="space-y-8 text-text-secondary text-sm leading-relaxed max-w-4xl mx-auto" id="terms-and-conditions-content">
      {/* Header Info */}
      <div className="bg-bg-card border border-border-color rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-border-color">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent-primary bg-accent-primary/10 px-3 py-1 rounded-full inline-block mb-2">
              Business Policies &amp; Agreement
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
              Terms &amp; Conditions
            </h1>
          </div>
          <div className="text-xs text-text-muted space-y-1 sm:text-right">
            <div><strong className="text-text-primary">Effective Date:</strong> January 2026</div>
            <div><strong className="text-text-primary">Last Updated:</strong> March 2026</div>
          </div>
        </div>
        <p className="text-text-secondary text-sm leading-relaxed">
          These Terms and Conditions govern the freelance design, video editing, web development, and digital marketing services provided by <strong className="text-text-primary">Rohit Verma</strong> (&ldquo;Designer,&rdquo; &ldquo;we,&rdquo; or &ldquo;our&rdquo;), Founder of Unicivix Solutions, through this portfolio website and direct client agreements.
        </p>
        <div className="mt-4 p-3.5 bg-accent-primary/5 border border-accent-primary/20 rounded-xl flex items-start gap-2.5 text-xs text-text-primary font-medium">
          <Scale className="w-4 h-4 text-accent-primary flex-shrink-0 mt-0.5" />
          <span>By engaging our services, commissioning a creative project, or approving an estimate, you acknowledge and agree to these terms.</span>
        </div>
      </div>

      {/* Section 1: Scope of Services */}
      <section className="space-y-3 bg-bg-card p-6 rounded-2xl border border-border-color">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border-color pb-2">
          <span className="w-2 h-2 rounded-full bg-accent-primary" />
          1. Scope of Creative Services
        </h2>
        <p>
          We provide freelance creative and digital services across four core specializations:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 marker:text-accent-primary">
          <li><strong>Graphic Design:</strong> Custom logo design, brand identity systems, social media post creatives, marketing banners, flyers, posters, and print-ready collateral.</li>
          <li><strong>Video Editing:</strong> High-engagement short-form video editing (Reels, TikToks, Shorts), pacing, sound design, color grading, subtitles, and YouTube content.</li>
          <li><strong>Website Development:</strong> Responsive landing pages, modern portfolio platforms, company websites, and interactive web layouts.</li>
          <li><strong>Digital Marketing:</strong> Visual campaign strategy, brand positioning, and social media creative assets.</li>
        </ul>
        <p className="text-xs text-text-muted pt-1">
          Every project scope is confirmed in writing via email, WhatsApp, or formal proposal detailing exact deliverables, formats, and milestones.
        </p>
      </section>

      {/* Section 2: Pricing & Payment Structure */}
      <section className="space-y-3 bg-bg-card p-6 rounded-2xl border border-border-color">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border-color pb-2">
          <DollarSign className="w-4 h-4 text-accent-primary" />
          2. Pricing &amp; Payment Structure
        </h2>
        <div className="space-y-2.5">
          <p>
            All listed prices on the website represent <strong>starting rates</strong>. The final quotation is determined based on project complexity, scope of deliverables, and agreed delivery timelines.
          </p>
          <div className="p-4 bg-accent-primary/5 border border-accent-primary/20 rounded-xl text-text-primary font-medium text-xs leading-relaxed">
            A 50% advance payment is required to begin the project. Once work has started, the advance payment is non-refundable. The remaining 50% payment must be completed before delivery of final or source files.
          </div>
          <ul className="list-disc pl-5 space-y-2 marker:text-accent-primary">
            <li>
              <strong>50% Advance Payment:</strong> A 50% advance payment is required to begin the project. Once work has started, the advance payment is non-refundable.
            </li>
            <li>
              <strong>Remaining 50% Balance:</strong> The remaining 50% payment must be completed before delivery of final or source files.
            </li>
            <li>
              <strong>Payment Methods:</strong> Payments are accepted via UPI, Bank Transfer (NEFT/IMPS), and approved digital payment gateways.
            </li>
          </ul>
        </div>
      </section>

      {/* Section 3: Revisions & Changes */}
      <section className="space-y-3 bg-bg-card p-6 rounded-2xl border border-border-color">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border-color pb-2">
          <RefreshCw className="w-4 h-4 text-accent-primary" />
          3. Revision Policy
        </h2>
        <div className="space-y-2.5">
          <p>
            Delivering high-quality creative work is our priority. To ensure projects stay on schedule while achieving high visual standards, our revision policy is structured as follows:
          </p>
          <ul className="list-disc pl-5 space-y-2 marker:text-accent-primary">
            <li>
              <strong>2 Rounds of Revisions Included:</strong> Standard packages include <strong>two (2) rounds of revisions</strong> within the originally agreed project brief and concept direction.
            </li>
            <li>
              <strong>What Constitutes a Revision:</strong> Revisions include adjustments to typography, font pairings, color palettes, spacing, element sizing, text corrections, and video cut timing.
            </li>
            <li>
              <strong>Scope Changes &amp; Additional Rounds:</strong> Complete changes in project direction, new concept requests after preliminary approval, or revisions requested beyond the two included rounds will be billed as additional scope at our standard hourly or per-asset rate.
            </li>
          </ul>
        </div>
      </section>

      {/* Section 4: Delivery Timelines & Delays */}
      <section className="space-y-3 bg-bg-card p-6 rounded-2xl border border-border-color">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border-color pb-2">
          <Clock className="w-4 h-4 text-accent-primary" />
          4. Delivery Timelines &amp; Client Delay Policy
        </h2>
        <div className="space-y-2.5">
          <p>
            Project timelines are confirmed after reviewing the scope, complexity and required deliverables.
          </p>
          <ul className="list-disc pl-5 space-y-2 marker:text-accent-primary">
            <li>
              <strong>Commencement:</strong> Project timelines begin only after the 50% advance payment is received and all necessary project requirements, briefs, assets and copy are provided.
            </li>
            <li>
              <strong>Client Delays:</strong> If the client delays providing content, feedback or approval, the project timeline will be extended accordingly.
            </li>
            <li>
              <strong>Project Inactivity:</strong> If the client does not provide the required content, feedback or approval for 30 consecutive days, the project may be placed on hold. Restarting the project will depend on availability and may require a revised timeline or quotation.
            </li>
          </ul>
        </div>
      </section>

      {/* Section 5: Source Files & Deliverables */}
      <section className="space-y-3 bg-bg-card p-6 rounded-2xl border border-border-color">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border-color pb-2">
          <Layers className="w-4 h-4 text-accent-primary" />
          5. Deliverable Formats &amp; Source Files
        </h2>
        <div className="space-y-2.5">
          <p>
            Deliverables are prepared in industry-standard formats tailored for both digital and print applications:
          </p>
          <ul className="list-disc pl-5 space-y-2 marker:text-accent-primary">
            <li>
              <strong>Standard Formats:</strong> High-resolution PNG (transparent backgrounds), JPG/JPEG, Vector PDF, and MP4 (for video edits).
            </li>
            <li>
              <strong>Source Files:</strong> Fully editable master source files (Adobe Illustrator .AI, Photoshop .PSD, Premiere Pro project files, or vector assets) are included in comprehensive identity packages and available upon request for basic packages as agreed in the project scope.
            </li>
            <li>
              <strong>Watermarked Previews:</strong> Initial concept drafts and work-in-progress renders are shared as low-resolution or watermarked previews for review purposes until final balance payment is completed.
            </li>
          </ul>
        </div>
      </section>

      {/* Section 6: Ownership, Copyright & Usage Rights */}
      <section className="space-y-3 bg-bg-card p-6 rounded-2xl border border-border-color">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border-color pb-2">
          <ShieldCheck className="w-4 h-4 text-accent-primary" />
          6. Ownership &amp; Intellectual Property Rights
        </h2>
        <div className="space-y-2.5">
          <ul className="list-disc pl-5 space-y-2 marker:text-accent-primary">
            <li>
              <strong>Transfer of Commercial Rights:</strong> Upon receipt of full and final payment, commercial rights for the final approved design deliverables are transferred to the client for their business use.
            </li>
            <li>
              <strong>Unapproved Concepts:</strong> All draft concepts, unused design alternatives, preliminary sketches, and working files not chosen for final delivery remain the intellectual property of Rohit Verma.
            </li>
            <li>
              <strong>Portfolio Showcase:</strong> Unless an explicit Non-Disclosure Agreement (NDA) or confidentiality agreement is signed prior to project kickoff, we reserve the right to display the final approved designs, case studies, and creative results in our professional portfolio, website, and social media channels.
            </li>
          </ul>
        </div>
      </section>

      {/* Section 7: Third-Party Costs & Resources */}
      <section className="space-y-3 bg-bg-card p-6 rounded-2xl border border-border-color">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border-color pb-2">
          <AlertCircle className="w-4 h-4 text-accent-primary" />
          7. Third-Party Costs &amp; External Resources
        </h2>
        <p>
          Project fees cover creative design, editing, and development labor. Any third-party costs required for the project are the responsibility of the client:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 marker:text-accent-primary">
          <li>Commercial typography/font licensing fees.</li>
          <li>Premium stock photography, video footage, or 3D assets.</li>
          <li>Commercial audio/music licenses for broadcast or paid advertising.</li>
          <li>Web domain registration, hosting fees, and third-party API/plugin subscriptions.</li>
        </ul>
        <p className="text-xs text-text-muted pt-1">
          No third-party purchases will be made on your behalf without your prior written consent.
        </p>
      </section>

      {/* Section 8: Cancellation & Refunds */}
      <section className="space-y-3 bg-bg-card p-6 rounded-2xl border border-border-color">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border-color pb-2">
          <FileCheck className="w-4 h-4 text-accent-primary" />
          8. Cancellation &amp; Refund Policy
        </h2>
        <div className="space-y-2.5">
          <p>
            A 50% advance payment is required to begin the project. Once work has started, the advance payment is non-refundable. The remaining 50% payment must be completed before delivery of final or source files.
          </p>
          <p>
            If a client chooses to cancel a project before final delivery, the client remains responsible for payment proportional to the work completed up to the date of cancellation. Master files for completed milestones will be released only after the corresponding balance is settled.
          </p>
        </div>
      </section>

      {/* Section 9: Client Responsibilities */}
      <section className="space-y-3 bg-bg-card p-6 rounded-2xl border border-border-color">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border-color pb-2">
          <UserCheck className="w-4 h-4 text-accent-primary" />
          9. Client Responsibilities &amp; Materials
        </h2>
        <p>
          The client represents and warrants that all text, imagery, trademarks, audio, and reference assets supplied for use in the project are owned by the client or legally licensed. The client agrees to indemnify Rohit Verma against any third-party intellectual property infringement claims arising from materials supplied by the client.
        </p>
      </section>

      {/* Section 10: Legal & Direct Contact */}
      <section className="bg-gradient-to-br from-bg-card to-bg-secondary border-2 border-accent-primary/30 rounded-2xl p-6 shadow-md relative overflow-hidden" id="terms-contact-card">
        <div className="absolute top-0 right-0 w-40 h-40 bg-accent-primary/10 rounded-full blur-3xl pointer-events-none" />
        <h2 className="text-xl font-bold text-text-primary mb-2 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-accent-primary" />
          10. Questions &amp; Direct Contact
        </h2>
        <p className="text-xs text-text-secondary mb-4 leading-relaxed">
          If you have questions regarding these business terms, need an NDA signed, or want to discuss a custom project agreement, reach out directly:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
          <div className="space-y-2 bg-bg-primary/80 p-4 rounded-xl border border-border-color">
            <div className="font-bold text-text-primary text-sm">Rohit Verma</div>
            <div className="text-text-secondary">Graphic Designer &amp; Video Editor</div>
            <div className="flex items-center gap-1.5 text-text-secondary">
              <MapPin className="w-3.5 h-3.5 text-accent-primary shrink-0" />
              <span>Jaipur, Rajasthan, India</span>
            </div>
          </div>

          <div className="space-y-2 bg-bg-primary/80 p-4 rounded-xl border border-border-color">
            <a
              href={contactConfig.emailHref}
              aria-label={`Email Rohit Verma at ${contactConfig.emailDisplay}`}
              className="flex items-center gap-2 text-text-primary hover:text-accent-primary transition-colors contact-email"
            >
              <Mail className="w-4 h-4 text-accent-primary shrink-0" />
              <span>{contactConfig.emailDisplay}</span>
            </a>
            <a
              href={contactConfig.phoneHref}
              aria-label={`Call Rohit Verma at ${contactConfig.phoneDisplay}`}
              className="flex items-center gap-2 text-text-primary hover:text-accent-primary transition-colors"
            >
              <Phone className="w-4 h-4 text-accent-primary shrink-0" />
              <span>{contactConfig.phoneDisplay}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
