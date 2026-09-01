import React from 'react';
import { Mail, Phone, MapPin, ShieldCheck, FileText, Lock, Globe, Clock, AlertCircle } from 'lucide-react';
import { contactConfig } from '../data';

export default function PrivacyPolicyContent() {
  return (
    <div className="space-y-8 text-text-secondary text-sm leading-relaxed max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="bg-bg-card border border-border-color rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-border-color">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent-primary bg-accent-primary/10 px-3 py-1 rounded-full inline-block mb-2">
              Legal Document
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
              Privacy Policy
            </h1>
          </div>
          <div className="text-xs text-text-muted space-y-1 text-right">
            <div><strong className="text-text-primary">Effective Date:</strong> 10 August 2026</div>
            <div><strong className="text-text-primary">Last Updated:</strong> 10 August 2026</div>
          </div>
        </div>
        <p className="text-text-secondary text-sm">
          This Privacy Policy explains how <strong className="text-text-primary">Unicivix Solutions</strong>, founded by <strong className="text-text-primary">Rohit Verma</strong> (“we,” “us,” “our,” or “Unicivix Solutions”), collects, uses, stores, protects, and discloses personal information when you visit or use our portfolio website, freelance design services, contact forms, communication channels, and related services (collectively, the “Website” and “Services”).
        </p>
        <p className="text-text-secondary text-sm mt-3">
          We provide creative and digital services including graphic design, branding, logo design, video editing, motion graphics, social media creatives, digital marketing, website design/development, advertising, and related creative services.
        </p>
        <div className="mt-4 p-3 bg-accent-primary/5 border border-accent-primary/20 rounded-xl flex items-start gap-2.5 text-xs text-text-primary font-medium">
          <ShieldCheck className="w-4 h-4 text-accent-primary flex-shrink-0 mt-0.5" />
          <span>By using our Website or submitting information to us, you acknowledge that you have read and understood this Privacy Policy.</span>
        </div>
      </div>

      {/* Section 1 */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border-color pb-2">
          <span className="w-2 h-2 rounded-full bg-accent-primary" />
          1. Information We Collect
        </h2>
        <p>Depending on how you interact with our Website and Services, we may collect the following categories of information.</p>

        <div className="space-y-3 pl-2">
          <h3 className="text-sm font-semibold text-text-primary">1.1 Information You Provide Directly</h3>
          <p>When you contact us, request a quotation, discuss a project, subscribe to communications, or use our services, we may collect:</p>
          <ul className="list-disc pl-5 space-y-1 marker:text-accent-primary">
            <li>Full name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Company or business name</li>
            <li>Job title or professional information</li>
            <li>Project requirements</li>
            <li>Design preferences and instructions</li>
            <li>Messages and communications</li>
            <li>Information submitted through contact or inquiry forms</li>
            <li>Billing or business information where required for providing services</li>
            <li>Any other information you voluntarily provide</li>
          </ul>
          <p className="text-xs text-text-muted italic">Please do not submit sensitive personal information unless it is genuinely necessary for your project or communication with us.</p>
        </div>

        <div className="space-y-3 pl-2">
          <h3 className="text-sm font-semibold text-text-primary">1.2 Client Files and Project Materials</h3>
          <p>If you engage us for freelance or creative services, you may provide files and materials such as:</p>
          <ul className="list-disc pl-5 space-y-1 marker:text-accent-primary">
            <li>Logos</li>
            <li>Brand assets</li>
            <li>Images and photographs</li>
            <li>Videos</li>
            <li>Documents</li>
            <li>Product information</li>
            <li>Marketing materials</li>
            <li>Design references</li>
            <li>Text and copy</li>
            <li>Project briefs</li>
            <li>Business information</li>
            <li>Other files necessary to complete your project</li>
          </ul>
          <p>We use these materials primarily for providing the requested services and managing the client relationship.</p>
        </div>

        <div className="space-y-3 pl-2">
          <h3 className="text-sm font-semibold text-text-primary">1.3 Email and Newsletter Information</h3>
          <p>If you subscribe to our newsletter, updates, or marketing communications, we may collect your email address and subscription preferences.</p>
          <p>You may unsubscribe from marketing communications at any time by using the unsubscribe mechanism provided in the communication or by contacting us.</p>
        </div>

        <div className="space-y-3 pl-2">
          <h3 className="text-sm font-semibold text-text-primary">1.4 Automatically Collected Information</h3>
          <p>When you visit our Website, certain technical information may be collected automatically, depending on the technologies and services enabled on the Website.</p>
          <p>This may include:</p>
          <ul className="list-disc pl-5 space-y-1 marker:text-accent-primary">
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Device type</li>
            <li>Operating system</li>
            <li>Screen resolution</li>
            <li>Approximate location derived from technical information</li>
            <li>Pages visited</li>
            <li>Referring pages</li>
            <li>Time and date of visits</li>
            <li>Website interaction information</li>
            <li>Performance and diagnostic information</li>
          </ul>
          <p>This information may be used for security, analytics, performance monitoring, troubleshooting, and improving the Website.</p>
        </div>
      </section>

      {/* Section 2 */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border-color pb-2">
          <span className="w-2 h-2 rounded-full bg-accent-primary" />
          2. Cookies and Similar Technologies
        </h2>
        <p>Our Website may use cookies, pixels, local storage, analytics technologies, and similar technologies.</p>
        <p>These technologies may help us:</p>
        <ul className="list-disc pl-5 space-y-1 marker:text-accent-primary">
          <li>Keep the Website functioning properly</li>
          <li>Remember preferences</li>
          <li>Understand how visitors use the Website</li>
          <li>Measure Website performance</li>
          <li>Identify technical problems</li>
          <li>Improve user experience</li>
          <li>Understand traffic and engagement</li>
          <li>Support relevant marketing or communication activities where applicable</li>
        </ul>
        <p>You may be able to control or disable cookies through your browser settings. Disabling certain cookies may affect the functionality or performance of portions of the Website.</p>
      </section>

      {/* Section 3 */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border-color pb-2">
          <span className="w-2 h-2 rounded-full bg-accent-primary" />
          3. How We Use Your Information
        </h2>
        <p>We may use collected information for legitimate business purposes, including:</p>
        <ul className="list-disc pl-5 space-y-1 marker:text-accent-primary">
          <li>Responding to inquiries</li>
          <li>Communicating with prospective and existing clients</li>
          <li>Understanding project requirements</li>
          <li>Preparing quotations and proposals</li>
          <li>Providing design and creative services</li>
          <li>Managing freelance projects</li>
          <li>Delivering completed work</li>
          <li>Managing client files and project materials</li>
          <li>Processing or confirming payments</li>
          <li>Providing customer support</li>
          <li>Sending requested information</li>
          <li>Sending newsletters or marketing communications where permitted</li>
          <li>Improving our Website and Services</li>
          <li>Understanding Website traffic and usage</li>
          <li>Detecting, preventing, and addressing fraud, abuse, security incidents, or technical issues</li>
          <li>Maintaining business records</li>
          <li>Complying with legal and regulatory obligations</li>
          <li>Protecting our rights, property, and legitimate business interests</li>
        </ul>
        <p>We will not use personal information for purposes that are materially incompatible with the purpose for which it was collected unless permitted or required by applicable law.</p>
      </section>

      {/* Section 4 */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border-color pb-2">
          <span className="w-2 h-2 rounded-full bg-accent-primary" />
          4. Legal Basis for Processing
        </h2>
        <p>Where applicable, we may process personal information based on one or more of the following grounds:</p>
        <ul className="list-disc pl-5 space-y-1 marker:text-accent-primary">
          <li>Your consent</li>
          <li>Performance of a contract or requested service</li>
          <li>Steps taken at your request before entering into a contract</li>
          <li>Compliance with applicable legal obligations</li>
          <li>Legitimate business interests, where permitted by law</li>
          <li>Protection of legal rights and prevention of fraud or misuse</li>
          <li>Other lawful grounds available under applicable privacy laws</li>
        </ul>
        <p>Where processing is based on consent, you may withdraw your consent subject to applicable legal limitations. Withdrawal of consent does not affect the lawfulness of processing carried out before the withdrawal.</p>
      </section>

      {/* Section 5 */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border-color pb-2">
          <span className="w-2 h-2 rounded-full bg-accent-primary" />
          5. Client Files and Confidential Materials
        </h2>
        <p>We understand that freelance projects may involve confidential business information and creative materials.</p>
        <p>We will use client-provided files primarily for:</p>
        <ul className="list-disc pl-5 space-y-1 marker:text-accent-primary">
          <li>Understanding project requirements</li>
          <li>Creating requested work</li>
          <li>Communicating about the project</li>
          <li>Revising and delivering project materials</li>
          <li>Maintaining necessary project records</li>
          <li>Providing ongoing support where applicable</li>
        </ul>
        <p>We will take reasonable measures to prevent unauthorized access, use, disclosure, alteration, or loss of client information. However, no online storage, electronic transmission, or digital system can be guaranteed to be completely secure.</p>
        <p className="text-xs text-text-muted italic">Clients should avoid sending highly sensitive information that is not necessary for the project.</p>
      </section>

      {/* Section 6 */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border-color pb-2">
          <span className="w-2 h-2 rounded-full bg-accent-primary" />
          6. Portfolio and Public Display of Work
        </h2>
        <p>As a designer and creative service provider, we may wish to display completed work in our portfolio, Website, social media, presentations, case studies, or promotional materials.</p>
        <p>We will generally seek appropriate permission or rely on applicable contractual rights before publicly displaying client work that is confidential or subject to restrictions.</p>
        <p>If a project is confidential, subject to an NDA, or otherwise restricted from public display, we will respect those restrictions.</p>
        <p>If you believe that your work has been displayed incorrectly or without appropriate authorization, please contact us so that we can review the matter.</p>
      </section>

      {/* Section 7 */}
      <section className="space-y-3 bg-bg-card p-5 rounded-2xl border border-border-color">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border-color pb-2">
          <span className="w-2 h-2 rounded-full bg-accent-primary" />
          7. Payment Information
        </h2>
        <p>For freelance projects, payments may be handled through third-party payment providers, banks, payment gateways, or other financial service providers.</p>
        <p className="font-semibold text-text-primary bg-accent-primary/10 p-3 rounded-xl border border-accent-primary/20">
          Our standard project arrangement may require a <span className="text-accent-primary font-bold">50% advance payment</span> before work begins, with the remaining amount handled according to the agreed project terms.
        </p>
        <p>We generally do not need to store complete payment-card details ourselves. Payment providers may independently collect and process payment information according to their own privacy policies and terms.</p>
        <p className="text-xs text-text-muted">We recommend reviewing the privacy practices of any third-party payment service you use.</p>
      </section>

      {/* Section 8 */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border-color pb-2">
          <span className="w-2 h-2 rounded-full bg-accent-primary" />
          8. Sharing of Personal Information
        </h2>
        <p>We do not sell or rent your personal information as a standalone commercial product.</p>
        <p>We may share information when reasonably necessary with:</p>
        <div className="space-y-3 pl-2">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Service Providers</h3>
            <p>We may use third-party providers for services such as website hosting, domain & infrastructure, email services, analytics, cloud storage, file transfer, payment processing, website security, communication, project management, and technical support. These providers process information on our behalf or independently per their terms.</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Legal and Regulatory Requirements</h3>
            <p>We may disclose information where reasonably necessary to comply with applicable laws, respond to lawful requests, protect legal rights, investigate fraud, prevent security threats, protect safety, or enforce contractual terms.</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Business Transactions</h3>
            <p>If our business undergoes a merger, acquisition, restructuring, or transfer, relevant information may be transferred as part of that transaction, subject to applicable law.</p>
          </div>
        </div>
      </section>

      {/* Section 9 */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border-color pb-2">
          <span className="w-2 h-2 rounded-full bg-accent-primary" />
          9. Third-Party Services
        </h2>
        <p>Our Website may use or link to third-party services (Analytics platforms, email platforms, payment providers, hosting providers, social media platforms, cloud storage, embedded media, security services).</p>
        <p>Third-party services operate independently and may have their own privacy policies. We are not responsible for the privacy practices, security practices, or content of third-party websites or services that we do not control.</p>
      </section>

      {/* Section 10 */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border-color pb-2">
          <span className="w-2 h-2 rounded-full bg-accent-primary" />
          10. International Data Transfers
        </h2>
        <p>Because we may work with clients located in India and other countries, personal information may sometimes be processed or stored in countries other than the country where you live.</p>
        <p>Third-party service providers we use may also operate infrastructure in different countries. Where required by applicable law, we will take appropriate measures regarding international transfers of personal information.</p>
      </section>

      {/* Section 11 & 12 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="space-y-3 bg-bg-card p-5 rounded-2xl border border-border-color">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2 border-b border-border-color pb-2">
            <Lock className="w-4 h-4 text-accent-primary" />
            11. Data Security
          </h2>
          <p className="text-xs leading-relaxed">
            We take reasonable technical and organizational measures (access controls, secure hosting, authentication, restricted file access) to protect personal information. However, no electronic storage or transmission method is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="space-y-3 bg-bg-card p-5 rounded-2xl border border-border-color">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2 border-b border-border-color pb-2">
            <Clock className="w-4 h-4 text-accent-primary" />
            12. Data Retention
          </h2>
          <p className="text-xs leading-relaxed">
            We retain personal information only for as long as reasonably necessary to provide Services, maintain business/project records, manage client relationships, resolve disputes, enforce agreements, and satisfy tax/legal obligations.
          </p>
        </section>
      </div>

      {/* Section 13 */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border-color pb-2">
          <span className="w-2 h-2 rounded-full bg-accent-primary" />
          13. Your Privacy Rights
        </h2>
        <p>Depending on your location and applicable law, you may have rights regarding your personal information, including the right to:</p>
        <ul className="list-disc pl-5 space-y-1 marker:text-accent-primary">
          <li>Request access to personal information we hold about you</li>
          <li>Request correction of inaccurate or incomplete information</li>
          <li>Request deletion of personal information where legally applicable</li>
          <li>Request information about how your data is processed</li>
          <li>Withdraw consent where processing is based on consent</li>
          <li>Object to or request restrictions on certain processing</li>
          <li>Request portability of information where applicable</li>
          <li>Opt out of marketing communications</li>
          <li>Raise a privacy-related complaint or concern</li>
        </ul>
        <p>To make a request, contact us using the details in the Contact Us section. We may need to verify your identity before processing certain requests.</p>
      </section>

      {/* Sections 14 - 18 Grid */}
      <div className="space-y-4">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-text-primary border-b border-border-color pb-1">14. Marketing Communications</h2>
          <p className="text-xs">You may opt out of marketing emails at any time. Even if you opt out, essential service-related communications (invoices, project updates, legal notices) will still be sent when required.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-text-primary border-b border-border-color pb-1">15. Children’s Privacy</h2>
          <p className="text-xs">Our Website and Services are not directed toward children under minimum legal age. We do not knowingly collect personal information from children.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-text-primary border-b border-border-color pb-1">16. Third-Party Links</h2>
          <p className="text-xs">External links to platforms or social media profiles are not controlled by us. We encourage reviewing their respective privacy policies.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-text-primary border-b border-border-color pb-1">17. Data Breach and Security Incidents</h2>
          <p className="text-xs">If we become aware of a personal data breach under our control, we will investigate and notify affected parties or authorities as required by applicable law.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-text-primary border-b border-border-color pb-1">18. Privacy of Business and Client Communications</h2>
          <p className="text-xs">Communications exchanged via email, messaging apps, or project tools are handled confidentially and used exclusively for service delivery and project management.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-text-primary border-b border-border-color pb-1">19. Changes to This Privacy Policy</h2>
          <p className="text-xs">We may update this Privacy Policy periodically. Revisions will be reflected with an updated "Last Updated" date. Please review this page periodically.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-text-primary border-b border-border-color pb-1">20. Governing Law</h2>
          <p className="text-xs">This policy operates in accordance with applicable Indian laws, subject to mandatory consumer and privacy protections in user jurisdictions.</p>
        </section>
      </div>

      {/* Section 21: Contact Us Highlight Box */}
      <section className="bg-gradient-to-br from-bg-card to-bg-secondary border-2 border-accent-primary/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-accent-primary/10 rounded-full blur-3xl pointer-events-none" />
        <h2 className="text-xl font-bold text-text-primary mb-2 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-accent-primary" />
          21. Contact Us
        </h2>
        <p className="text-xs text-text-secondary mb-4">
          If you have questions, concerns, complaints, or requests relating to this Privacy Policy or the handling of your personal information, please contact us:
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

      {/* Section 22: Acceptance */}
      <section className="bg-accent-primary/5 p-4 rounded-xl border border-accent-primary/20 text-xs text-text-secondary space-y-1">
        <h2 className="font-bold text-text-primary text-sm">22. Acceptance</h2>
        <p>By accessing or using our Website and Services, you acknowledge that you have had an opportunity to review this Privacy Policy.</p>
        <p>If you do not agree with the applicable privacy practices described here, please discontinue use of the Website and contact us if you have questions or concerns.</p>
        <div className="pt-2 text-[11px] text-text-muted font-mono">Last Updated: 10 August 2026</div>
      </section>
    </div>
  );
}
