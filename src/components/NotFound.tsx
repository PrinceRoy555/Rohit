import { motion } from 'motion/react';
import { ArrowLeft, Home, FileQuestion, Phone, Mail } from 'lucide-react';
import { contactConfig } from '../data';

interface NotFoundProps {
  onBackToHome: () => void;
}

export default function NotFound({ onBackToHome }: NotFoundProps) {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300" id="not-found-screen">
      {/* Background soft ambient glowing circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent-primary/5 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent-secondary/10 blur-[120px]" />

      <div className="text-center max-w-lg relative z-10">
        {/* Animated Question Icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="w-24 h-24 rounded-full bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary mx-auto mb-8 shadow-lg"
          id="not-found-icon-box"
        >
          <FileQuestion className="w-12 h-12" />
        </motion.div>

        {/* Big 404 Code */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-8xl md:text-9xl font-extrabold text-text-primary tracking-tighter mb-4"
          id="not-found-code"
        >
          404<span className="text-accent-primary">.</span>
        </motion.h1>

        {/* Title */}
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-2xl md:text-3xl font-extrabold text-text-primary mb-4"
          id="not-found-heading"
        >
          Visual Asset Not Found
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-text-secondary text-sm md:text-base leading-relaxed mb-8 font-medium"
          id="not-found-desc"
        >
          Oops! The digital canvas or creative route you are searching for does not exist, has been archived, or is being edited by Rohit in Premiere Pro.
        </motion.p>

        {/* Back button and Call option */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4"
          id="not-found-actions"
        >
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2.5 bg-accent-primary text-white font-extrabold px-8 py-4 rounded-full shadow-lg hover:bg-accent-secondary active:scale-95 transition-all duration-200 cursor-pointer text-sm"
            id="not-found-home-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </button>
          <a
            href={contactConfig.phoneHref}
            aria-label={`Call Rohit Verma at ${contactConfig.phoneDisplay}`}
            className="inline-flex items-center gap-2 bg-bg-card border border-border-color hover:border-accent-primary text-text-primary hover:text-accent-primary font-bold px-6 py-4 rounded-full text-sm active:scale-95 transition-all duration-200"
          >
            <Phone className="w-4 h-4 text-accent-primary" />
            Call {contactConfig.phoneDisplay}
          </a>
          <a
            href={contactConfig.emailHref}
            aria-label={`Email Rohit Verma at ${contactConfig.emailDisplay}`}
            className="inline-flex items-center gap-2 bg-bg-card border border-border-color hover:border-accent-primary text-text-primary hover:text-accent-primary font-bold px-6 py-4 rounded-full text-sm active:scale-95 transition-all duration-200 contact-email"
          >
            <Mail className="w-4 h-4 text-accent-primary" />
            Email {contactConfig.emailDisplay}
          </a>
        </motion.div>
      </div>

      {/* Decorative credit overlay */}
      <div className="absolute bottom-6 text-[10px] text-text-muted tracking-wider uppercase font-semibold">
        Rohit Verma Portfolio • Creative 404 Frame
      </div>
    </div>
  );
}
