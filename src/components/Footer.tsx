import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Instagram, Linkedin, Github, MessageSquare, ArrowRight, CheckCircle2, X, Phone, Mail } from 'lucide-react';
import { WHATSAPP_BUSINESS_URL, contactConfig } from '../data';
import WhatsAppIcon from './WhatsAppIcon';
import { subscribeToNewsletter } from '../services/firebase/firestore';
import PrivacyPolicyContent from './PrivacyPolicyContent';
import TermsAndConditionsContent from './TermsAndConditionsContent';
import avatarImg from '../assets/images/rohit-verma-portrait.jpg';

interface FooterProps {
  onNavigate?: (routeId: string) => void;
}

export default function Footer({ onNavigate }: FooterProps = {}) {
  const [email, setEmail] = useState('');
  const [subscribedMessage, setSubscribedMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  const handleHomeNav = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (onNavigate) {
      onNavigate('home');
    } else {
      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', window.location.pathname);
      } else {
        window.location.hash = '';
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubscribedMessage(null);

    if (!email) {
      setError('Email is required');
      return;
    }
    const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!regex.test(email)) {
      setError('Invalid email address');
      return;
    }

    setIsSubmitting(true);
    const res = await subscribeToNewsletter(email);
    setIsSubmitting(false);

    if (res.success) {
      if (res.isDuplicate) {
        setError('This email is already subscribed.');
      } else {
        setSubscribedMessage('Thank you for subscribing.');
        setEmail('');
        setTimeout(() => setSubscribedMessage(null), 5000);
      }
    } else {
      setError(res.error || 'Failed to subscribe. Please try again.');
    }
  };

  const scrollToSection = (id: string, e?: React.MouseEvent) => {
    if (id === 'home') {
      handleHomeNav(e);
      return;
    }
    if (onNavigate) {
      onNavigate(id);
    } else {
      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', `/${id}`);
        window.dispatchEvent(new Event('popstate'));
      } else {
        window.location.hash = id;
      }
    }
  };

  return (
    <footer className="bg-bg-primary border-t border-border-color text-text-secondary pt-20 pb-8 transition-colors duration-300" id="app-footer">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
        
        {/* Column 1: Brand & Bio */}
        <div className="lg:col-span-4" id="footer-col-1">
          <a href="/" className="flex items-center gap-3 mb-6 cursor-pointer" onClick={handleHomeNav}>
            <div className="w-9 h-9 rounded-full overflow-hidden border border-accent-primary">
              <img
                src={avatarImg}
                alt="Rohit Verma"
                width="36"
                height="36"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-[50%_25%]"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  if (e.currentTarget.src !== window.location.origin + '/images/rohit-avatar.jpg') {
                    e.currentTarget.src = '/images/rohit-avatar.jpg';
                  }
                }}
              />
            </div>
            <span className="text-xl font-bold text-text-primary tracking-wide">
              Rohit<span className="text-accent-primary">.</span>
            </span>
          </a>
          <p className="text-sm leading-relaxed mb-4 max-w-sm">
            Creating purposeful branding layouts, high-retention short reels, cinematic kinetic motions, and immersive web graphics that set organizations apart online.
          </p>

          <div className="flex flex-col gap-2 text-text-primary text-sm font-semibold mb-6" id="footer-contact-info">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-accent-primary flex-shrink-0" />
              <span>Phone:</span>
              <a
                href={contactConfig.phoneHref}
                aria-label={`Call Rohit Verma at ${contactConfig.phoneDisplay}`}
                className="hover:text-accent-primary transition-colors underline decoration-accent-primary/40 underline-offset-4"
              >
                {contactConfig.phoneDisplay}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-accent-primary flex-shrink-0" />
              <span>Email:</span>
              <a
                href={contactConfig.emailHref}
                aria-label={`Email Rohit Verma at ${contactConfig.emailDisplay}`}
                className="hover:text-accent-primary transition-colors underline decoration-accent-primary/40 underline-offset-4 contact-email"
              >
                {contactConfig.emailDisplay}
              </a>
            </div>
          </div>

          {/* Socials Column */}
          <div className="social-icons flex flex-wrap gap-2" id="footer-socials">
            <a
              href="https://www.linkedin.com/in/rohit-verma-487457374"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="Rohit Verma on LinkedIn"
              title="Rohit Verma on LinkedIn"
            >
              <Linkedin className="w-4.5 h-4.5" aria-hidden="true" />
            </a>
            <a
              href="https://github.com/PrinceRoy555"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="Rohit Verma on GitHub"
              title="Rohit Verma on GitHub"
            >
              <Github className="w-4.5 h-4.5" aria-hidden="true" />
            </a>
            <a
              href="https://www.instagram.com/thedesigngeek.rohit/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="Rohit Verma Design Instagram"
              title="Rohit Verma Design Instagram"
            >
              <Instagram className="w-4.5 h-4.5" aria-hidden="true" />
            </a>
            <a
              href={WHATSAPP_BUSINESS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon social-icon--whatsapp"
              aria-label="Contact Rohit Verma on WhatsApp Business"
              title="WhatsApp Business"
            >
              <WhatsAppIcon className="w-4.5 h-4.5" aria-hidden="true" />
            </a>
            <a
              href="#contact"
              className="social-icon"
              aria-label="Contact Rohit"
              title="Message or Contact"
            >
              <MessageSquare className="w-4.5 h-4.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Column 2: Navigation links */}
        <div className="lg:col-span-2" id="footer-col-2">
          <h4 className="text-text-primary text-sm font-bold uppercase tracking-wider mb-6">Navigation</h4>
          <ul className="space-y-3 text-sm">
            {['About', 'Services', 'Portfolio', 'Experience', 'Insights', 'Contact'].map((item) => (
              <li key={item}>
                <button
                  onClick={() => scrollToSection(item.toLowerCase() === 'insights' ? 'blog' : item.toLowerCase())}
                  className="hover:text-accent-primary transition-colors text-left cursor-pointer text-text-secondary"
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Services quick-list */}
        <div className="lg:col-span-3" id="footer-col-3">
          <h4 className="text-text-primary text-sm font-bold uppercase tracking-wider mb-6">Services Offered</h4>
          <ul className="space-y-3 text-sm">
            {['Graphic Design', 'Video Editing', 'Motion Graphics', 'Brand Identity', 'UI/UX Design'].map((item) => (
              <li key={item}>
                <button
                  onClick={() => scrollToSection('services')}
                  className="hover:text-accent-primary transition-colors text-left cursor-pointer text-text-secondary"
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Newsletter capture */}
        <div className="lg:col-span-3" id="footer-col-4">
          <h4 className="text-text-primary text-sm font-bold uppercase tracking-wider mb-6">Newsletter</h4>
          <p className="text-xs leading-relaxed mb-4">
            Subscribe to receive actionable design tips, AI concepts, and project previews.
          </p>

          <form onSubmit={handleSubscribe} className="space-y-2 relative" id="newsletter-form">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className={`w-full bg-bg-card border rounded-full pl-5 pr-12 py-3 text-base sm:text-xs text-text-primary focus:outline-none transition-colors ${
                  error ? 'border-red-500' : 'border-border-color focus:border-accent-primary'
                }`}
                placeholder="email@company.com"
                id="newsletter-email-input"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 w-9 h-9 rounded-full bg-accent-primary text-white flex items-center justify-center hover:bg-accent-secondary transition-colors cursor-pointer"
                aria-label="Subscribe"
                id="newsletter-submit-btn"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.span
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-red-400 font-semibold block pl-3"
                >
                  {error}
                </motion.span>
              )}
              {subscribedMessage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-accent-primary font-bold flex items-center gap-1.5 pl-3 mt-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-primary" />
                  {subscribedMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

      </div>

      {/* Bottom Footer Section */}
      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-border-color flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div id="footer-copyright">
          Copyright © 2026 Rohit Verma. All rights reserved.
        </div>
        <div className="flex items-center gap-6" id="footer-policy-links">
          <button
            onClick={() => setActiveModal('privacy')}
            className="hover:text-accent-primary transition-colors cursor-pointer bg-transparent border-none text-text-secondary/60"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveModal('terms')}
            className="hover:text-accent-primary transition-colors cursor-pointer bg-transparent border-none text-text-secondary/60"
          >
            Terms and Conditions
          </button>
        </div>
      </div>

      {/* Custom Policy Modal overlay */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-bg-card border border-border-color rounded-2xl w-full shadow-2xl relative flex flex-col max-w-4xl max-h-[85vh] p-6 md:p-8"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-bg-primary hover:bg-accent-primary/20 border border-border-color text-text-secondary hover:text-accent-primary cursor-pointer transition-colors z-20"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 mb-4">
                {activeModal === 'privacy' ? <PrivacyPolicyContent /> : <TermsAndConditionsContent />}
              </div>
              <div className="pt-4 border-t border-border-color flex justify-end">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2.5 rounded-xl bg-accent-primary text-white font-bold text-xs hover:bg-accent-secondary active:scale-95 transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
