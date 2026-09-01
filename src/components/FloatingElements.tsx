import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp, MessageCircle, Sparkles } from 'lucide-react';
import { WHATSAPP_BUSINESS_URL } from '../data';

export default function FloatingElements() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [showChatTooltip, setShowChatTooltip] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<'top' | 'whatsapp' | 'chatbot' | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Back to top visibility
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }

      // Scroll progress percentage
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen to AI Chatbot state events
  useEffect(() => {
    const handleChatbotState = (e: Event) => {
      const customEvent = e as CustomEvent<{ isOpen: boolean }>;
      if (customEvent.detail) {
        setIsChatbotOpen(customEvent.detail.isOpen);
      }
    };

    window.addEventListener('ai-chatbot-state', handleChatbotState);

    // Initial tooltip delay
    const timer = setTimeout(() => {
      setShowChatTooltip(true);
      const hideTimer = setTimeout(() => setShowChatTooltip(false), 6000);
      return () => clearTimeout(hideTimer);
    }, 3500);

    return () => {
      window.removeEventListener('ai-chatbot-state', handleChatbotState);
      clearTimeout(timer);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleToggleChatbot = () => {
    window.dispatchEvent(new CustomEvent('toggle-ai-chatbot'));
  };

  return (
    <>
      {/* 1. Top Scroll Progress Bar */}
      <div
        className="scroll-progress"
        style={{ width: `${scrollProgress}%` }}
        id="scroll-progress-bar-fill"
      />

      {/* 2. Unified Floating Controls Container (Bottom Right) */}
      <div className="floating-controls" id="floating-controls-container">
        
        {/* WhatsApp Floating Button */}
        <div className="relative flex items-center justify-end">
          <AnimatePresence>
            {hoveredButton === 'whatsapp' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="absolute right-14 bg-bg-card border border-border-color px-3 py-1.5 rounded-xl text-xs text-text-primary font-semibold whitespace-nowrap shadow-lg pointer-events-none z-10"
              >
                Chat on WhatsApp
              </motion.div>
            )}
          </AnimatePresence>

          <a
            href={WHATSAPP_BUSINESS_URL}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHoveredButton('whatsapp')}
            onMouseLeave={() => setHoveredButton(null)}
            className="w-12 h-12 rounded-full bg-[#C50D1E] hover:bg-[#9F0B18] text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20 flex-shrink-0"
            id="whatsapp-floating-btn"
            aria-label="Contact Rohit Verma on WhatsApp Business"
          >
            <MessageCircle className="w-5.5 h-5.5 text-white fill-current" />
          </a>
        </div>

        {/* AI Chatbot Launcher Button (Hidden when chat window is OPEN) */}
        {!isChatbotOpen && (
          <div className="relative flex items-center justify-end">
            {/* Tooltip prompt "Need help with your project?" */}
            <AnimatePresence>
              {showChatTooltip && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.85, x: -10 }}
                  className="absolute right-14 bg-bg-card border border-accent-primary/40 text-text-primary text-xs font-semibold px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2 max-w-[220px] whitespace-normal pointer-events-none z-20"
                >
                  <Sparkles className="w-3.5 h-3.5 text-accent-primary flex-shrink-0 animate-pulse" />
                  <span>Need help with your project?</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hover tooltip "Ask Uni AI" */}
            <AnimatePresence>
              {hoveredButton === 'chatbot' && !showChatTooltip && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="absolute right-14 bg-bg-card border border-border-color px-3 py-1.5 rounded-xl text-xs text-text-primary font-bold whitespace-nowrap shadow-lg pointer-events-none z-10"
                >
                  Ask Uni AI
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleToggleChatbot}
              onMouseEnter={() => setHoveredButton('chatbot')}
              onMouseLeave={() => setHoveredButton(null)}
              className="w-12 h-12 rounded-full bg-[#A50C18] hover:bg-[#8B0A14] border border-white/20 text-white flex items-center justify-center transition-all duration-200 shadow-xl hover:scale-105 active:scale-95 cursor-pointer outline-none focus-visible:ring-4 focus-visible:ring-[#A50C18] flex-shrink-0 relative"
              aria-label="Ask Uni AI Creative Assistant"
              id="uni-ai-chatbot-btn"
            >
              <Sparkles className="w-5.5 h-5.5 text-white fill-current" />
            </button>
          </div>
        )}

        {/* Back To Top Button */}
        <AnimatePresence>
          {showBackToTop && (
            <div className="relative flex items-center justify-end">
              <AnimatePresence>
                {hoveredButton === 'top' && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="absolute right-14 bg-bg-card border border-border-color px-3 py-1.5 rounded-xl text-xs text-text-primary font-semibold whitespace-nowrap shadow-lg pointer-events-none z-10"
                  >
                    Back to Top
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 10 }}
                transition={{ duration: 0.2 }}
                onClick={scrollToTop}
                onMouseEnter={() => setHoveredButton('top')}
                onMouseLeave={() => setHoveredButton(null)}
                className="w-12 h-12 rounded-full bg-bg-card border border-border-color text-text-primary flex items-center justify-center shadow-xl hover:border-accent-primary hover:text-accent-primary hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex-shrink-0"
                id="back-to-top-btn"
                aria-label="Scroll back to top"
              >
                <ArrowUp className="w-5 h-5" />
              </motion.button>
            </div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}
