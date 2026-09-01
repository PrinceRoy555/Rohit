import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  X, 
  Minus, 
  Send, 
  Trash2, 
  RefreshCw, 
  PhoneCall, 
  Mail,
  AlertTriangle, 
  Sparkles,
  CheckCircle,
  Edit2,
  Save,
  Check,
  ExternalLink,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { WHATSAPP_BUSINESS_URL, contactConfig } from '../data';
import { submitChatbotLead } from '../services/firebase/firestore';
import { useBodyScrollLock } from '../lib/scrollLock';

export interface ActionCTA {
  label: string;
  actionType: 'quote' | 'portfolio' | 'samples' | 'rates' | 'audit' | 'meeting' | 'whatsapp' | 'email' | 'custom';
  payload?: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestions?: string[];
  cta?: ActionCTA;
  isWelcome?: boolean;
  isSummary?: boolean;
  leadData?: LeadData;
}

export interface LeadData {
  name: string;
  business: string;
  service: string;
  description: string;
  style: string;
  audience: string;
  budget: string;
  deadline: string;
  phone: string;
  email: string;
}

const DEFAULT_WELCOME_ENG = "Hi! I’m Uni AI, Rohit Verma’s creative assistant. How can I help you today?";
const DEFAULT_WELCOME_HIN = "Namaste! Main Uni AI hoon. Graphic Design, Video Editing, Branding, Digital Marketing ya Website Services ke baare mein main aapki help kar sakta hoon.";

// LocalStorage with SessionStorage & Memory fallback helper
const persistentStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key) || sessionStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
      sessionStorage.setItem(key, value);
    } catch (e) {}
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (e) {}
  }
};

const QUICK_ACTIONS = [
  "Graphic Designer",
  "Brand Identity Designer",
  "UI/UX Designer",
  "Thumbnail Designer",
  "Motion Graphics Designer",
  "Video Editor",
  "Social Media Manager",
  "Vibe Coder",
  "Get a Quote",
  "Contact Rohit"
];

// Predefined Quick Action Knowledge Base Mapping
const QUICK_ACTION_RESPONSES: Record<string, { response: string; cta: ActionCTA; suggestions: string[] }> = {
  "Graphic Designer": {
    response: "We create high-impact visual communications, custom brand graphics, promotional assets, and commercial artwork designed to enhance your brand visibility across print and digital media.",
    cta: {
      label: "Get Graphic Design Quote",
      actionType: "quote",
      payload: "Graphic Design"
    },
    suggestions: ["Brand Identity Designer", "Thumbnail Designer", "Contact Rohit"]
  },
  "Brand Identity Designer": {
    response: "We craft complete brand ecosystems including iconic logo suites, comprehensive brand style guidelines, color palettes, typography hierarchy, and branded digital assets.",
    cta: {
      label: "View Portfolio",
      actionType: "portfolio"
    },
    suggestions: ["Graphic Designer", "UI/UX Designer", "Contact Rohit"]
  },
  "UI/UX Designer": {
    response: "Our UI/UX design process delivers high-fidelity Figma prototypes, design token systems, intuitive wireframes, and responsive user interfaces engineered for seamless user experience.",
    cta: {
      label: "View Design Portfolio",
      actionType: "portfolio"
    },
    suggestions: ["Graphic Designer", "Vibe Coder", "Contact Rohit"]
  },
  "Thumbnail Designer": {
    response: "We craft high-CTR YouTube and social media thumbnail graphics engineered with high-contrast typography, color psychology, and visual hooks designed to maximize click-through rates.",
    cta: {
      label: "Request Thumbnail Samples",
      actionType: "samples"
    },
    suggestions: ["Video Editor", "Motion Graphics Designer", "Contact Rohit"]
  },
  "Motion Graphics Designer": {
    response: "We create fluid kinetic motion graphics, animated logo intros, title animations, 2D vector movement, and sound-synchronized visual effects in After Effects.",
    cta: {
      label: "View Motion Projects",
      actionType: "portfolio"
    },
    suggestions: ["Video Editor", "Graphic Designer", "Contact Rohit"]
  },
  "Video Editor": {
    response: "Transform raw footage into high-retention YouTube long-form videos, viral Reels/Shorts, corporate promos, and commercial ads with precision pacing, sound design, and color grading.",
    cta: {
      label: "Check Video Editing Rates",
      actionType: "rates",
      payload: "Video Editing"
    },
    suggestions: ["Thumbnail Designer", "Motion Graphics Designer", "Contact Rohit"]
  },
  "Social Media Manager": {
    response: "Elevate your digital presence with end-to-end social media strategy, custom content calendars, post scheduling, copywriting, and organic audience engagement strategies.",
    cta: {
      label: "Growth Strategy Meeting",
      actionType: "meeting",
      payload: "Social Media Strategy"
    },
    suggestions: ["Graphic Designer", "Social Media Designer", "Get a Quote"]
  },
  "Vibe Coder": {
    response: "We build rapid interactive web prototypes, responsive frontend applications, fluid micro-interactions, and creative modern interfaces with modern vibe coding workflows.",
    cta: {
      label: "Discuss Prototype",
      actionType: "quote",
      payload: "Vibe Coding & Prototyping"
    },
    suggestions: ["UI/UX Designer", "Get a Quote", "Contact Rohit"]
  },
  "Get a Quote": {
    response: "Let's calculate a custom quote for your project! Tell us your required service, target timeline, and budget, or connect directly with Rohit for instant estimates.",
    cta: {
      label: "Connect on WhatsApp",
      actionType: "whatsapp"
    },
    suggestions: ["Graphic Designer", "Video Editor", "UI/UX Designer"]
  },
  "Contact Rohit": {
    response: "You can connect directly with Rohit Verma! Expected response time is within 1–2 hours.\n\n• Email: workall724038@gmail.com\n• Phone / WhatsApp: +91 9376569027\n• Location: Jaipur, Rajasthan, India",
    cta: {
      label: "Send Direct Email",
      actionType: "email"
    },
    suggestions: ["Connect on WhatsApp", "Get a Quote", "Graphic Designer"]
  }
};

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);

  // Lead collection flow state
  const [leadMode, setLeadMode] = useState(false);
  const [leadStep, setLeadStep] = useState<number>(0);
  const [leadData, setLeadData] = useState<LeadData>({
    name: '',
    business: '',
    service: '',
    description: '',
    style: '',
    audience: '',
    budget: '',
    deadline: '',
    phone: '',
    email: ''
  });
  const [isEditingSummary, setIsEditingSummary] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Global event listeners for opening/toggling chatbot
  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('toggle-ai-chatbot', handleToggle);
    window.addEventListener('open-ai-chatbot', handleOpen);
    return () => {
      window.removeEventListener('toggle-ai-chatbot', handleToggle);
      window.removeEventListener('open-ai-chatbot', handleOpen);
    };
  }, []);

  // Centralized scroll locking when chatbot dialog is open on mobile
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobileScreen(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useBodyScrollLock(isOpen && isMobileScreen, 'ai-chatbot-mobile');

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('ai-chatbot-state', { detail: { isOpen } }));
  }, [isOpen]);

  // Load chat history & lead state from persistent storage on mount
  useEffect(() => {
    const storedHistory = persistentStorage.getItem('uni-ai-chat-history');
    const storedLeadMode = persistentStorage.getItem('uni-ai-lead-mode');
    const storedLeadStep = persistentStorage.getItem('uni-ai-lead-step');
    const storedLeadData = persistentStorage.getItem('uni-ai-lead-data');

    if (storedHistory) {
      try {
        const parsed = JSON.parse(storedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        } else {
          initializeDefaultChat();
        }
      } catch (e) {
        initializeDefaultChat();
      }
    } else {
      initializeDefaultChat();
    }

    if (storedLeadMode) setLeadMode(storedLeadMode === 'true');
    if (storedLeadStep) setLeadStep(parseInt(storedLeadStep, 10));
    if (storedLeadData) {
      try {
        setLeadData(JSON.parse(storedLeadData));
      } catch (e) {}
    }
  }, []);

  const saveToStorage = (newMessages: Message[]) => {
    persistentStorage.setItem('uni-ai-chat-history', JSON.stringify(newMessages));
  };

  const updateLeadState = (mode: boolean, step: number, data: LeadData) => {
    setLeadMode(mode);
    setLeadStep(step);
    setLeadData(data);
    persistentStorage.setItem('uni-ai-lead-mode', mode.toString());
    persistentStorage.setItem('uni-ai-lead-step', step.toString());
    persistentStorage.setItem('uni-ai-lead-data', JSON.stringify(data));
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const initializeDefaultChat = () => {
    const defaultMessages: Message[] = [
      {
        id: 'welcome-eng',
        sender: 'ai',
        text: DEFAULT_WELCOME_ENG,
        timestamp: formatTime(new Date()),
        isWelcome: true
      },
      {
        id: 'welcome-hin',
        sender: 'ai',
        text: DEFAULT_WELCOME_HIN,
        timestamp: formatTime(new Date()),
        isWelcome: true,
        suggestions: ["Graphic Designer", "Video Editor", "Get a Quote"]
      }
    ];
    setMessages(defaultMessages);
    saveToStorage(defaultMessages);
  };

  // Auto scroll inside chat body
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus trap inside input on open + Escape key listener
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  // Action CTA handler
  const handleCTAAction = (cta: ActionCTA) => {
    if (cta.actionType === 'quote') {
      const initialService = cta.payload || 'Web Development';
      startLeadCollectionFlow(messages, initialService);
    } else if (cta.actionType === 'portfolio') {
      const el = document.getElementById('portfolio');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.hash = 'portfolio';
      }
      addSystemAIMessage(`Navigating to Rohit's Portfolio... You can explore recent project case studies below.`);
    } else if (cta.actionType === 'samples') {
      const sampleText = encodeURIComponent(`Hi Rohit! I saw your thumbnail designs on Uni AI and would like to request sample thumbnails for my channel.`);
      window.open(`${WHATSAPP_BUSINESS_URL}&text=${sampleText}`, '_blank', 'noopener,noreferrer');
      addSystemAIMessage(`Opening WhatsApp to send you thumbnail samples...`);
    } else if (cta.actionType === 'rates') {
      startLeadCollectionFlow(messages, cta.payload || 'Video Editing');
    } else if (cta.actionType === 'audit') {
      startLeadCollectionFlow(messages, cta.payload || 'Technical SEO Audit');
    } else if (cta.actionType === 'meeting') {
      const meetingText = encodeURIComponent(`Hi Rohit, I would like to schedule a Growth Strategy Meeting for my brand.`);
      window.open(`${WHATSAPP_BUSINESS_URL}&text=${meetingText}`, '_blank', 'noopener,noreferrer');
      addSystemAIMessage(`Opening WhatsApp to schedule your Growth Strategy Meeting with Rohit!`);
    } else if (cta.actionType === 'whatsapp') {
      window.open(WHATSAPP_BUSINESS_URL, '_blank', 'noopener,noreferrer');
    } else if (cta.actionType === 'email') {
      window.location.href = contactConfig.emailHref;
    }
  };

  const addSystemAIMessage = (text: string) => {
    const aiMsg: Message = {
      id: `ai-sys-${Date.now()}`,
      sender: 'ai',
      text,
      timestamp: formatTime(new Date())
    };
    const updated = [...messages, aiMsg];
    setMessages(updated);
    saveToStorage(updated);
  };

  // Main Submit handler
  const handleSubmit = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    // Enforce 350 char limit strictly
    const trimmedText = textToSend.trim().substring(0, 350);

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmedText,
      timestamp: formatTime(new Date())
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    saveToStorage(updatedMessages);
    setInputValue('');
    setErrorState(null);

    // Check if user clicked or typed a Quick Action exactly
    const matchingKey = Object.keys(QUICK_ACTION_RESPONSES).find(
      key => key.toLowerCase() === trimmedText.toLowerCase()
    );

    if (matchingKey && !leadMode) {
      const qa = QUICK_ACTION_RESPONSES[matchingKey];
      // Special case: "Get a Quote" starts flow
      if (matchingKey === "Get a Quote") {
        startLeadCollectionFlow(updatedMessages);
        return;
      }
      
      const aiMsg: Message = {
        id: `ai-qa-${Date.now()}`,
        sender: 'ai',
        text: qa.response,
        timestamp: formatTime(new Date()),
        cta: qa.cta,
        suggestions: qa.suggestions
      };
      const finalMsgs = [...updatedMessages, aiMsg];
      setMessages(finalMsgs);
      saveToStorage(finalMsgs);
      return;
    }

    // If we are currently in structured Lead Collection Mode
    if (leadMode) {
      processLeadStep(trimmedText, updatedMessages);
      return;
    }

    // Otherwise, query AI Backend Server Endpoint
    setIsLoading(true);
    try {
      const chatPayload = {
        message: trimmedText,
        conversation: messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'model', text: m.text })),
        page: window.location.href
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatPayload)
      });

      if (!response.ok) {
        throw new Error('Server responded with an error status');
      }

      const data = await response.json();

      if (data.leadIntent) {
        startLeadCollectionFlow(updatedMessages);
        setIsLoading(false);
        return;
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply,
        timestamp: formatTime(new Date()),
        suggestions: data.suggestions || ["Get a Quote", "Contact Rohit"]
      };

      const finalMessages = [...updatedMessages, aiMsg];
      setMessages(finalMessages);
      saveToStorage(finalMessages);

    } catch (err: any) {
      console.error('Uni AI Chat Error:', err);
      // Graceful fallback response
      const fallbackAiMsg: Message = {
        id: `ai-fallback-${Date.now()}`,
        sender: 'ai',
        text: `Thanks for asking! Rohit Verma & Unicivix Solutions offer professional Graphic Design, Brand Identity, UI/UX Design, Video Editing, Motion Graphics, Social Media Management, and Vibe Coding. You can request a quote or contact Rohit directly below!`,
        timestamp: formatTime(new Date()),
        cta: {
          label: "Send Direct Email",
          actionType: "email"
        },
        suggestions: ["Get a Quote", "Contact Rohit", "Graphic Designer"]
      };
      const finalMessages = [...updatedMessages, fallbackAiMsg];
      setMessages(finalMessages);
      saveToStorage(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  // Structured Lead Collection Flow
  const startLeadCollectionFlow = (currentMsgs: Message[], presetService?: string) => {
    const aiIntroMsg: Message = {
      id: `ai-lead-start-${Date.now()}`,
      sender: 'ai',
      text: "Awesome! Let's build a custom project quotation. I'll ask you 5 quick questions to understand your requirements.",
      timestamp: formatTime(new Date())
    };

    const aiStep1Msg: Message = {
      id: `ai-lead-step1-${Date.now()}`,
      sender: 'ai',
      text: "1. What is your Name and Business / Brand Name?",
      timestamp: formatTime(new Date())
    };

    const updated = [...currentMsgs, aiIntroMsg, aiStep1Msg];
    setMessages(updated);
    saveToStorage(updated);

    const freshLead: LeadData = {
      name: '', business: '', service: presetService || '', description: '',
      style: '', audience: '', budget: '', deadline: '', phone: '', email: ''
    };
    updateLeadState(true, 1, freshLead);
  };

  const processLeadStep = (userInput: string, currentMsgs: Message[]) => {
    const nextData = { ...leadData };
    let nextStep = leadStep;
    let nextAiText = "";

    if (leadStep === 1) {
      const parts = userInput.split(/and|for|\,/i).map(p => p.trim());
      nextData.name = parts[0] || userInput;
      nextData.business = parts[1] || 'Personal / Brand';
      nextStep = 2;
      nextAiText = nextData.service 
        ? `2. You selected service "${nextData.service}". Please describe your project requirements in detail.`
        : "2. Which service do you require (e.g. Website Development, Video Editing, Graphic Design, SEO) and brief project details?";
    } else if (leadStep === 2) {
      if (!nextData.service) {
        nextData.service = userInput.substring(0, 40);
      }
      nextData.description = userInput;
      nextStep = 3;
      nextAiText = "3. What is your preferred style (e.g., minimal, modern, bold, cinematic) or target audience?";
    } else if (leadStep === 3) {
      const parts = userInput.split(/for|target/i).map(p => p.trim());
      nextData.style = parts[0] || userInput;
      nextData.audience = parts[1] || 'General Audience';
      nextStep = 4;
      nextAiText = "4. What is your approximate budget (in ₹ or $) and target deadline for delivery?";
    } else if (leadStep === 4) {
      const parts = userInput.split(/by|before|within/i).map(p => p.trim());
      nextData.budget = parts[0] || userInput;
      nextData.deadline = parts[1] || 'Flexible';
      nextStep = 5;
      nextAiText = "5. Please provide your Phone/WhatsApp number and Email address so Rohit can send you the official quotation.";
    } else if (leadStep === 5) {
      const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
      const phoneRegex = /(\+?\d[\d-\s]{7,15})/g;

      const foundEmail = userInput.match(emailRegex);
      const foundPhone = userInput.match(phoneRegex);

      nextData.email = foundEmail ? foundEmail[0] : userInput;
      nextData.phone = foundPhone ? foundPhone[0] : userInput;

      nextStep = 6;
    }

    if (nextStep < 6) {
      const aiReply: Message = {
        id: `ai-lead-step-${nextStep}-${Date.now()}`,
        sender: 'ai',
        text: nextAiText,
        timestamp: formatTime(new Date())
      };
      const updated = [...currentMsgs, aiReply];
      setMessages(updated);
      saveToStorage(updated);
      updateLeadState(true, nextStep, nextData);
    } else {
      const summaryMsg: Message = {
        id: `ai-lead-summary-${Date.now()}`,
        sender: 'ai',
        text: "Please review your project quotation details below:",
        timestamp: formatTime(new Date()),
        isSummary: true,
        leadData: nextData
      };
      const updated = [...currentMsgs, summaryMsg];
      setMessages(updated);
      saveToStorage(updated);
      updateLeadState(true, 6, nextData);
    }
  };

  const handleQuickActionClick = (action: string) => {
    if (QUICK_ACTION_RESPONSES[action]) {
      const qa = QUICK_ACTION_RESPONSES[action];
      handleSubmit(action);
    } else if (action === "Get a Quote") {
      startLeadCollectionFlow(messages);
    } else if (action === "Contact Rohit") {
      handleSubmit("Contact Rohit");
    } else {
      handleSubmit(action);
    }
  };

  const handleConfirmClearChat = () => {
    persistentStorage.removeItem('uni-ai-chat-history');
    persistentStorage.removeItem('uni-ai-lead-mode');
    persistentStorage.removeItem('uni-ai-lead-step');
    persistentStorage.removeItem('uni-ai-lead-data');
    
    setLeadMode(false);
    setLeadStep(0);
    setLeadData({
      name: '', business: '', service: '', description: '',
      style: '', audience: '', budget: '', deadline: '', phone: '', email: ''
    });
    setErrorState(null);
    setShowClearConfirmModal(false);
    initializeDefaultChat();
  };

  const handleEnquirySubmit = async () => {
    setIsLoading(true);
    const summaryText = `Name: ${leadData.name}, Business: ${leadData.business}, Service: ${leadData.service}, Desc: ${leadData.description}, Style: ${leadData.style}, Audience: ${leadData.audience}, Budget: ${leadData.budget}, Deadline: ${leadData.deadline}`;

    const res = await submitChatbotLead({
      name: leadData.name || 'Anonymous Visitor',
      businessName: leadData.business,
      email: leadData.email,
      phone: leadData.phone,
      requiredService: leadData.service,
      projectDescription: leadData.description,
      preferredStyle: leadData.style,
      targetAudience: leadData.audience,
      budgetRange: leadData.budget,
      deadline: leadData.deadline,
      conversationSummary: summaryText,
      consentAccepted: true
    });

    setIsLoading(false);

    const updatedMsgs = [...messages];
    const successMsgText = res.success
      ? "Your project quotation request has been submitted successfully! Rohit or the Unicivix team will reach out to you within 1-2 hours."
      : "Your quotation details have been saved. You can also connect directly with Rohit on WhatsApp below.";

    const successMsg: Message = {
      id: `ai-lead-success-${Date.now()}`,
      sender: 'ai',
      text: successMsgText,
      timestamp: formatTime(new Date()),
      cta: {
        label: "Connect on WhatsApp",
        actionType: "whatsapp"
      },
      suggestions: ["Contact Rohit", "Graphic Designer", "Video Editor"]
    };

    const finalMessages = [...updatedMsgs, successMsg];
    setMessages(finalMessages);
    saveToStorage(finalMessages);

    updateLeadState(false, 0, {
      name: '', business: '', service: '', description: '',
      style: '', audience: '', budget: '', deadline: '', phone: '', email: ''
    });
    setIsEditingSummary(false);
  };

  const handleSaveSummaryEdit = (editedData: LeadData) => {
    setLeadData(editedData);
    setIsEditingSummary(false);

    const updatedMsgs = messages.map(m => {
      if (m.isSummary) {
        return { ...m, leadData: editedData };
      }
      return m;
    });
    setMessages(updatedMsgs);
    saveToStorage(updatedMsgs);
    persistentStorage.setItem('uni-ai-lead-data', JSON.stringify(editedData));
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[9997] sm:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Confirmation Modal Dialog for Clear Chat */}
      <AnimatePresence>
        {showClearConfirmModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-[#120809] border border-[#A50C18]/30 rounded-2xl p-5 max-w-xs w-full shadow-2xl text-center space-y-4"
            >
              <div className="w-10 h-10 rounded-full bg-[#7A0016]/10 border border-[#7A0016]/30 text-[#7A0016] dark:text-[#D31322] flex items-center justify-center mx-auto">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Clear Conversation?</h3>
                <p className="text-xs text-text-secondary mt-1">
                  This will clear your current message history and reset project quotation details.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setShowClearConfirmModal(false)}
                  className="bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-text-primary text-xs font-semibold py-2 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmClearChat}
                  className="bg-[#7A0016] hover:bg-[#A50C18] text-white text-xs font-bold py-2 rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Confirm Clear
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main AI Chat Window Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            ref={chatWindowRef}
            className="ai-chat-window fixed z-[9999] bg-[#FAF8F5] dark:bg-[#080607] border border-[#7A0016]/30 dark:border-[#7A0016]/40 rounded-[22px] shadow-[0_24px_70px_rgba(122,0,22,0.25)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden text-[#1A090A] dark:text-white
              right-6 bottom-[92px] w-[390px] sm:w-[420px] h-[min(630px,calc(100dvh-120px))] max-h-[calc(100dvh-120px)]
              max-sm:left-3 max-sm:right-3 max-sm:bottom-[max(12px,env(safe-area-inset-bottom))] max-sm:w-auto max-sm:h-[min(680px,calc(100dvh-24px))] max-sm:max-h-[calc(100dvh-24px)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chatbot-title"
          >
            {/* 1. Header Bar (Module A) */}
            <header className="ai-chat-header flex-shrink-0 min-h-[68px] px-4 py-3 flex items-center justify-between border-b border-[#7A0016]/20 dark:border-white/10 bg-gradient-to-r from-[#7A0016] via-[#8B0A14] to-[#58000F] text-white relative z-10 select-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/15 border border-white/25 flex items-center justify-center relative flex-shrink-0 shadow-inner">
                  <Bot className="w-5 h-5 text-white" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#7A0016] rounded-full animate-pulse" title="Uni AI Online" />
                </div>
                <div>
                  <h2 id="chatbot-title" className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
                    Uni AI
                    <span className="text-[9px] bg-amber-400/30 text-amber-200 border border-amber-300/30 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      BETA
                    </span>
                  </h2>
                  <p className="text-[11px] text-white/85 font-medium">
                    Creative Assistant by Unicivix
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
                  title="Minimize Chat Window"
                  aria-label="Minimize Chat Window"
                >
                  <Minus className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => setShowClearConfirmModal(true)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
                  title="Clear Chat History"
                  aria-label="Clear Chat History"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white/15 hover:bg-white/30 text-white transition-all cursor-pointer shadow-sm ml-0.5"
                  title="Close AI chatbot"
                  aria-label="Close AI chatbot"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </header>

            {/* 2. Scrollable Chat Body (Module C) */}
            <div className="ai-chat-body flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 space-y-4 overscroll-contain bg-[#FAF8F5] dark:bg-[#100A0B] text-[#1A090A] dark:text-white scrollbar-thin">
              
              <div className="ai-chat-messages space-y-3.5" aria-live="polite">
                {messages.map((msg) => {
                  if (!msg?.text?.trim() && !msg?.isSummary) return null;
                  return (
                    <div key={msg.id} className="space-y-1.5">
                      <div className={`flex items-end gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        
                        {msg.sender === 'ai' && (
                          <div className="w-7 h-7 rounded-full bg-white dark:bg-[#1D0709] border border-[#7A0016]/30 flex items-center justify-center flex-shrink-0 shadow-xs">
                            <Bot className="w-3.5 h-3.5 text-[#7A0016] dark:text-[#D31322]" />
                          </div>
                        )}

                        <div className="max-w-[85%] flex flex-col">
                          <div className={`px-3.5 py-3 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line break-words shadow-2xs
                            ${msg.sender === 'user'
                              ? 'user-message-bubble bg-[#7A0016] text-white rounded-br-none font-medium'
                              : 'ai-message-bubble bg-white dark:bg-[#1A0B0D] text-[#1A090A] dark:text-white rounded-bl-none border border-[#7A0016]/15 dark:border-white/10'
                            }`}
                          >
                            {msg.text}

                            {/* Embedded In-Message CTA Button */}
                            {msg.cta && (
                              <div className="mt-3 pt-2.5 border-t border-[#7A0016]/15 dark:border-white/10">
                                <button
                                  onClick={() => handleCTAAction(msg.cta!)}
                                  className="w-full bg-[#7A0016] hover:bg-[#99001C] text-white font-bold py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-xs shadow-xs active:scale-95"
                                >
                                  <span>{msg.cta.label}</span>
                                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                                </button>
                              </div>
                            )}

                            {/* Interactive Summary Card */}
                            {msg.isSummary && msg.leadData && (
                              <div className="mt-3 bg-[#FAF8F5] dark:bg-[#080607] border border-[#7A0016]/30 rounded-xl p-3 space-y-2 text-xs text-[#1A090A] dark:text-white select-text">
                                <h3 className="font-bold text-[#7A0016] dark:text-[#D31322] flex items-center gap-1.5 border-b border-[#7A0016]/15 pb-2">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  Project Quotation Summary
                                </h3>
                                
                                {isEditingSummary ? (
                                  <LeadSummaryForm 
                                    initialData={msg.leadData} 
                                    onSave={handleSaveSummaryEdit} 
                                    onCancel={() => setIsEditingSummary(false)} 
                                  />
                                ) : (
                                  <>
                                    <div className="space-y-1.5 text-[11px]">
                                      <div className="grid grid-cols-[80px_1fr] gap-1"><span className="text-[#1A090A]/60 dark:text-white/60 font-semibold">Name:</span> <span className="font-medium">{msg.leadData.name}</span></div>
                                      <div className="grid grid-cols-[80px_1fr] gap-1"><span className="text-[#1A090A]/60 dark:text-white/60 font-semibold">Business:</span> <span className="font-medium">{msg.leadData.business}</span></div>
                                      <div className="grid grid-cols-[80px_1fr] gap-1"><span className="text-[#1A090A]/60 dark:text-white/60 font-semibold">Service:</span> <span className="font-medium">{msg.leadData.service}</span></div>
                                      <div className="grid grid-cols-[80px_1fr] gap-1"><span className="text-[#1A090A]/60 dark:text-white/60 font-semibold">Details:</span> <span className="font-medium">{msg.leadData.description}</span></div>
                                      <div className="grid grid-cols-[80px_1fr] gap-1"><span className="text-[#1A090A]/60 dark:text-white/60 font-semibold">Budget:</span> <span className="font-medium">{msg.leadData.budget}</span></div>
                                      <div className="grid grid-cols-[80px_1fr] gap-1"><span className="text-[#1A090A]/60 dark:text-white/60 font-semibold">Deadline:</span> <span className="font-medium">{msg.leadData.deadline}</span></div>
                                      <div className="grid grid-cols-[80px_1fr] gap-1"><span className="text-[#1A090A]/60 dark:text-white/60 font-semibold">Phone:</span> <span className="font-medium">{msg.leadData.phone}</span></div>
                                      <div className="grid grid-cols-[80px_1fr] gap-1"><span className="text-[#1A090A]/60 dark:text-white/60 font-semibold">Email:</span> <span className="font-medium">{msg.leadData.email}</span></div>
                                    </div>

                                    <div className="flex flex-col gap-2 pt-2 border-t border-[#7A0016]/15">
                                      <button
                                        onClick={handleEnquirySubmit}
                                        className="w-full bg-[#7A0016] hover:bg-[#99001C] text-white font-bold py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs shadow-xs active:scale-95"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                        Submit Official Quotation Request
                                      </button>
                                      
                                      <div className="grid grid-cols-2 gap-2">
                                        <button
                                          onClick={() => setIsEditingSummary(true)}
                                          className="bg-white dark:bg-[#1D0709] hover:bg-black/5 dark:hover:bg-white/5 border border-[#7A0016]/30 text-[#1A090A] dark:text-white font-semibold py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 text-[11px]"
                                        >
                                          <Edit2 className="w-3 h-3 text-[#7A0016]" />
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => window.open(WHATSAPP_BUSINESS_URL, '_blank', 'noopener,noreferrer')}
                                          className="bg-white dark:bg-[#1D0709] hover:bg-[#7A0016]/10 border border-[#7A0016]/40 text-[#7A0016] dark:text-[#D31322] font-semibold py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 text-[11px]"
                                        >
                                          WhatsApp Rohit
                                        </button>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>

                          <span className={`text-[9px] text-[#1A090A]/50 dark:text-white/50 mt-1 font-semibold ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>

                      {/* Context-aware suggestions */}
                      {msg.suggestions && msg.suggestions.length > 0 && !leadMode && (
                        <div className="flex flex-wrap gap-1.5 pt-1 pl-9">
                          {msg.suggestions.map((act) => (
                            <button
                              key={act}
                              onClick={() => handleQuickActionClick(act)}
                              className="bg-[#FFFFFF] dark:bg-[#1A0B0D] hover:bg-[#A50C18] hover:text-white dark:hover:bg-[#7A0016] text-[#A50C18] dark:text-[#D31322] border border-[#A50C18]/30 dark:border-white/15 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-2xs active:scale-95"
                            >
                              <span>{act}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Loading typing indicator */}
                {isLoading && (
                  <div className="flex items-end gap-2.5 justify-start">
                    <div className="w-7 h-7 rounded-full bg-white dark:bg-[#1D0709] border border-[#7A0016]/30 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-[#7A0016]" />
                    </div>
                    <div className="bg-white dark:bg-[#1A0B0D] px-3.5 py-2.5 rounded-2xl rounded-bl-none shadow-2xs border border-[#7A0016]/15 flex items-center gap-1.5 min-w-[60px]" aria-label="Uni AI is typing">
                      <div className="w-1.5 h-1.5 bg-[#7A0016] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#7A0016] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#7A0016] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions Grid Container */}
              <div className="ai-chat-quick-actions pt-3 pb-1 border-t border-[#7A0016]/10 dark:border-white/10">
                <p className="text-[10px] font-extrabold text-[#7A0016] dark:text-amber-400/90 mb-2 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Quick Actions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action}
                      onClick={() => handleQuickActionClick(action)}
                      className="bg-[#FFFFFF] dark:bg-[#1A0B0D] hover:bg-[#A50C18] hover:text-white dark:hover:bg-[#7A0016] dark:hover:text-white border border-[#A50C18]/30 dark:border-white/15 text-[#A50C18] dark:text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95 flex-shrink-0"
                    >
                      <span>{action}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div ref={messagesEndRef} />
            </div>

            {/* 3. Direct Contact Action Bar (Module D) */}
            <div className="ai-chat-whatsapp-action flex-shrink-0 px-4 py-2 border-t border-[#7A0016]/15 dark:border-white/10 bg-[#FAF8F5] dark:bg-[#080607] flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <a
                  href={contactConfig.emailHref}
                  aria-label={`Email Rohit Verma at ${contactConfig.emailDisplay}`}
                  className="text-[#7A0016] dark:text-[#D31322] font-bold hover:underline flex items-center gap-1 transition-all"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Rohit</span>
                </a>
                <span className="text-[#1A090A]/30 dark:text-white/30">•</span>
                <a
                  href={WHATSAPP_BUSINESS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Continue on WhatsApp Business"
                  className="text-[#7A0016] dark:text-[#D31322] font-bold hover:underline flex items-center gap-1 transition-all"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {leadMode && (
                <button
                  onClick={() => setShowClearConfirmModal(true)}
                  className="text-[11px] text-[#7A0016] dark:text-amber-400 font-semibold hover:underline transition-colors cursor-pointer"
                >
                  Restart Chat
                </button>
              )}
            </div>

            {/* 4. Footer Composer & Input Form (Module D) */}
            <footer className="ai-chat-composer flex-shrink-0 grid grid-cols-[1fr_48px] gap-2 items-end p-3 bg-[#FAF8F5] dark:bg-[#080607] border-t border-[#7A0016]/20 dark:border-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(inputValue);
                }}
                className="contents"
              >
                <div className="relative flex items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value.substring(0, 350))}
                    placeholder="Ask Uni AI or type a question..."
                    disabled={isLoading}
                    className="w-full h-[46px] bg-white dark:bg-[#1A0B0D] border border-[#7A0016]/30 dark:border-white/15 focus:border-[#7A0016] dark:focus:border-[#D31322] text-[#1A090A] dark:text-white placeholder-[#1A090A]/40 dark:placeholder-white/40 text-xs font-medium rounded-xl pl-3 pr-12 py-2.5 outline-none transition-all disabled:opacity-50"
                    aria-label="Chat input message"
                    maxLength={350}
                  />
                  <span className={`absolute right-3 text-[9px] font-bold pointer-events-none ${
                    inputValue.length >= 350 ? 'text-red-500' : 'text-[#1A090A]/40 dark:text-white/40'
                  }`}>
                    {inputValue.length}/350
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={!inputValue.trim() || inputValue.length > 350 || isLoading}
                  className="w-[48px] h-[46px] rounded-xl bg-[#7A0016] hover:bg-[#99001C] text-white flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer flex-shrink-0 shadow-xs active:scale-95"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </form>
            </footer>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Sub-component for editing Lead Summary in chat
interface LeadFormProps {
  initialData: LeadData;
  onSave: (data: LeadData) => void;
  onCancel: () => void;
}

function LeadSummaryForm({ initialData, onSave, onCancel }: LeadFormProps) {
  const [formData, setFormData] = useState<LeadData>(initialData);

  const handleChange = (key: keyof LeadData, val: string) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="space-y-2.5 bg-white/60 dark:bg-black/30 p-2.5 rounded-lg border border-[#7A0016]/20 text-[11px]">
      <div className="space-y-2">
        <div>
          <label className="text-[#1A090A]/60 dark:text-white/60 block mb-0.5 font-semibold">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full bg-white dark:bg-[#100A0B] border border-[#7A0016]/30 rounded px-2 py-1 text-[#1A090A] dark:text-white focus:border-[#7A0016] outline-none"
          />
        </div>
        <div>
          <label className="text-[#1A090A]/60 dark:text-white/60 block mb-0.5 font-semibold">Business</label>
          <input
            type="text"
            value={formData.business}
            onChange={(e) => handleChange('business', e.target.value)}
            className="w-full bg-white dark:bg-[#100A0B] border border-[#7A0016]/30 rounded px-2 py-1 text-[#1A090A] dark:text-white focus:border-[#7A0016] outline-none"
          />
        </div>
        <div>
          <label className="text-[#1A090A]/60 dark:text-white/60 block mb-0.5 font-semibold">Service</label>
          <input
            type="text"
            value={formData.service}
            onChange={(e) => handleChange('service', e.target.value)}
            className="w-full bg-white dark:bg-[#100A0B] border border-[#7A0016]/30 rounded px-2 py-1 text-[#1A090A] dark:text-white focus:border-[#7A0016] outline-none"
          />
        </div>
        <div>
          <label className="text-[#1A090A]/60 dark:text-white/60 block mb-0.5 font-semibold">Details</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={2}
            className="w-full bg-white dark:bg-[#100A0B] border border-[#7A0016]/30 rounded px-2 py-1 text-[#1A090A] dark:text-white focus:border-[#7A0016] outline-none resize-none"
          />
        </div>
        <div>
          <label className="text-[#1A090A]/60 dark:text-white/60 block mb-0.5 font-semibold">Budget</label>
          <input
            type="text"
            value={formData.budget}
            onChange={(e) => handleChange('budget', e.target.value)}
            className="w-full bg-white dark:bg-[#100A0B] border border-[#7A0016]/30 rounded px-2 py-1 text-[#1A090A] dark:text-white focus:border-[#7A0016] outline-none"
          />
        </div>
        <div>
          <label className="text-[#1A090A]/60 dark:text-white/60 block mb-0.5 font-semibold">Deadline</label>
          <input
            type="text"
            value={formData.deadline}
            onChange={(e) => handleChange('deadline', e.target.value)}
            className="w-full bg-white dark:bg-[#100A0B] border border-[#7A0016]/30 rounded px-2 py-1 text-[#1A090A] dark:text-white focus:border-[#7A0016] outline-none"
          />
        </div>
        <div>
          <label className="text-[#1A090A]/60 dark:text-white/60 block mb-0.5 font-semibold">Phone / WhatsApp</label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full bg-white dark:bg-[#100A0B] border border-[#7A0016]/30 rounded px-2 py-1 text-[#1A090A] dark:text-white focus:border-[#7A0016] outline-none"
          />
        </div>
        <div>
          <label className="text-[#1A090A]/60 dark:text-white/60 block mb-0.5 font-semibold">Email</label>
          <input
            type="text"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full bg-white dark:bg-[#100A0B] border border-[#7A0016]/30 rounded px-2 py-1 text-[#1A090A] dark:text-white focus:border-[#7A0016] outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onSave(formData)}
          className="flex-1 bg-[#7A0016] hover:bg-[#99001C] text-white font-bold py-1.5 rounded transition-all cursor-pointer flex items-center justify-center gap-1"
        >
          <Save className="w-3.5 h-3.5" />
          Save Changes
        </button>
        <button
          onClick={onCancel}
          className="bg-white dark:bg-[#1D0709] border border-[#7A0016]/30 text-[#1A090A] dark:text-white font-semibold px-3 py-1.5 rounded transition-all cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
