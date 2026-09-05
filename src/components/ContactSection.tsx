import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, MapPin, Send, Upload, CloudLightning, Trash, MessageSquare, ArrowRight, Instagram, Linkedin, Github, CheckCircle2, AlertCircle } from 'lucide-react';
import { WHATSAPP_BUSINESS_URL, contactConfig } from '../data';
import { SERVICE_CATEGORIES, SERVICES_LIST } from '../servicesData';
import WhatsAppIcon from './WhatsAppIcon';
import { submitContactEnquiry, getReadableFirebaseError, ServiceResponse } from '../services/firebase/firestore';
import { uploadProjectBrief } from '../services/firebase/storage';
import { FIREBASE_FALLBACK_CONTACT, isStorageAvailable, isFirebaseConfigured } from '../lib/firebase';
import { validateAttachment } from '../lib/validation';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  budget: string;
  description: string;
  consent: boolean;
}

export default function ContactSection() {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileNotice, setFileNotice] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submissionIdRef = useRef<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContactFormData>({
    mode: 'onTouched',
    reValidateMode: 'onChange'
  });

  useEffect(() => {
    const handleServiceSelect = (e: Event) => {
      const customEvent = e as CustomEvent<{ serviceTitle: string }>;
      if (customEvent.detail?.serviceTitle) {
        setValue('service', customEvent.detail.serviceTitle);
      }
    };
    window.addEventListener('select-service-enquiry', handleServiceSelect);
    return () => {
      window.removeEventListener('select-service-enquiry', handleServiceSelect);
    };
  }, [setValue]);

  const processSelectedFile = (selected: File) => {
    const val = validateAttachment(selected);
    if (!val.isValid) {
      setFileError(val.error || 'Invalid file');
      setFileNotice(null);
    } else {
      setFileError(null);
      setFile(selected);
      if (!isStorageAvailable()) {
        setFileNotice('File upload is temporarily unavailable. You can still submit your enquiry without an attachment.');
      } else {
        setFileNotice(null);
      }
    }
  };

  // Handle Drag-and-Drop file uploads
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileError(null);
    setFileNotice(null);
    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (data: ContactFormData) => {
    if (isSubmittingForm) return; // Prevent duplicate submissions
    setIsSubmittingForm(true);
    setSubmitErrorMessage(null);
    setSubmitSuccess(false);
    setEmailNotice(null);
    setFileNotice(null);

    const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production';
    if (isDev) {
      console.log('[CONTACT-DEBUG] submit-start');
    }

    try {
      // Step 1: Internet connection check
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        if (isDev) console.warn('[Contact] Device is offline.');
        setSubmitErrorMessage('You appear to be offline. Please reconnect and try again.');
        return;
      }

      // Step 2: Handle optional attachment upload (do not wait for Storage when no attachment exists)
      let attachmentUrl: string | undefined;
      let attachmentPath: string | undefined;

      if (file && isStorageAvailable()) {
        try {
          const uploadRes = await uploadProjectBrief(file, (progress) => {
            setUploadProgress(progress);
          });
          if (uploadRes.success) {
            attachmentUrl = uploadRes.downloadUrl;
            attachmentPath = uploadRes.storagePath;
          }
        } catch (uploadErr) {
          console.warn('[Contact] Attachment upload skipped or failed, proceeding with enquiry:', uploadErr);
        }
      }

      // Step 3: Write enquiry directly to Firestore collection 'contactEnquiries'
      const fbRes = await submitContactEnquiry({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() || undefined,
        selectedService: data.service,
        budgetRange: data.budget,
        projectDescription: data.description.trim(),
        consentAccepted: true,
        attachmentName: file ? file.name : undefined,
        attachmentType: file ? file.type : undefined,
        attachmentSize: file ? file.size : undefined,
        attachmentUrl,
        attachmentPath,
        attachmentStatus: attachmentUrl ? 'uploaded' : (file ? 'pending' : undefined),
        pageUrl: typeof window !== 'undefined' ? window.location.href : undefined
      });

      if (fbRes.success) {
        if (isDev) {
          console.log('[CONTACT-DEBUG] ui-success', fbRes);
        }
        // When Firestore succeeds:
        // - show success immediately
        // - reset the form
        // - set isSubmitting to false
        setSubmitSuccess(true);
        setSubmitErrorMessage(null);
        reset();
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setSubmitErrorMessage(
          fbRes.error || 'Unable to submit your project right now. Please check your connection and try again.'
        );
      }
    } catch (err: any) {
      console.error('[PROJECT INQUIRY ERROR] Submission error:', err);
      setSubmitErrorMessage('Unable to submit your project right now. Please check your connection and try again.');
    } finally {
      if (isDev) {
        console.log('[CONTACT-DEBUG] submit-finally');
      }
      setIsSubmittingForm(false);
      setUploadProgress(null);
    }
  };

  const scrollToForm = () => {
    const element = document.getElementById('contact-form-panel');
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  // WhatsApp Business link
  const whatsappUrl = WHATSAPP_BUSINESS_URL;

  return (
    <section id="contact" className="bg-bg-primary transition-colors duration-300">
      
      {/* 1. Large Crimson Patterned CTA Banner */}
      <div className="bg-gradient-to-r from-bg-card via-bg-secondary to-bg-card border-y border-border-color py-16 px-6 md:px-12 relative overflow-hidden" id="contact-cta-banner">
        {/* Subtle geometric lines / hexagon SVG background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hexagons" width="50" height="43.3" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
                <path d="M25 0 L50 14.4 L50 43.3 L25 57.7 L0 43.3 L0 14.4 Z" fill="none" stroke="var(--accent-secondary)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexagons)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary max-w-2xl leading-tight">
            Send me a message and let’s create something amazing together.
          </h2>
          <button
            onClick={scrollToForm}
            className="flex items-center gap-3 bg-accent-primary hover:bg-accent-secondary text-white font-bold px-8 py-4 rounded-full shadow-2xl active:scale-95 transition-all duration-200 cursor-pointer flex-shrink-0"
            id="cta-banner-scroll-btn"
          >
            Contact Me
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Main Contact Form & Info Panel Section */}
      <div className="py-24 px-6 max-w-7xl mx-auto" id="contact-form-panel">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left Column: Contact details & Information */}
          <div className="lg:col-span-5 flex flex-col justify-between" id="contact-info-column">
            <div>
              <span className="text-accent-primary font-bold text-xs uppercase tracking-widest bg-accent-primary/10 px-3 py-1.5 rounded-full inline-block mb-4">
                Get In Touch
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight mb-6">
                Let’s Work Together
              </h2>
              <p className="text-text-secondary text-base leading-relaxed mb-10 max-w-md">
                Have an academy setup, brand refresh, or video campaign? Drop a detailed message with your brief, and let's craft stellar visuals.
              </p>

              {/* Contact Specific Detail Rows */}
              <div className="space-y-6" id="contact-details-list">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-bg-card border border-border-color flex items-center justify-center text-accent-primary">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-text-muted text-xs uppercase tracking-widest font-bold">Location</span>
                    <p className="text-text-primary text-base font-semibold">Jaipur, Rajasthan, India</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-bg-card border border-border-color flex items-center justify-center text-accent-primary">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-text-muted text-xs uppercase tracking-widest font-bold">Email Address</span>
                    <a
                      href={contactConfig.emailHref}
                      aria-label={`Email Rohit Verma at ${contactConfig.emailDisplay}`}
                      className="text-text-primary text-base font-semibold hover:text-accent-primary transition-colors block contact-email"
                    >
                      {contactConfig.emailDisplay}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-bg-card border border-border-color flex items-center justify-center text-accent-primary">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-text-muted text-xs uppercase tracking-widest font-bold">Phone Contact</span>
                    <a
                      href={contactConfig.phoneHref}
                      aria-label={`Call Rohit Verma at ${contactConfig.phoneDisplay}`}
                      className="text-text-primary text-base font-semibold hover:text-accent-primary transition-colors block"
                    >
                      {contactConfig.phoneDisplay}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions & Social Icons */}
            <div className="mt-12 pt-8 border-t border-border-color">
              <h4 className="text-text-primary font-bold text-xs uppercase tracking-wider mb-4">Connect Directly</h4>
              <div className="flex flex-wrap items-center gap-4">
                {/* Instant WhatsApp Action button */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Contact Rohit Verma on WhatsApp Business"
                  className="inline-flex items-center gap-2 bg-accent-primary/10 text-accent-primary hover:bg-accent-primary hover:text-white font-bold text-xs px-5 py-3 rounded-full border border-accent-primary/20 transition-all duration-300"
                  id="contact-whatsapp-chat"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat on WhatsApp
                </a>

                {/* Email Direct Action Button */}
                <a
                  href={contactConfig.emailHref}
                  aria-label="Send an email to Rohit Verma"
                  className="inline-flex items-center gap-2 bg-bg-card text-text-primary hover:text-accent-primary font-bold text-xs px-5 py-3 rounded-full border border-border-color hover:border-accent-primary transition-all duration-300 contact-email"
                  id="contact-email-btn"
                >
                  <Mail className="w-4 h-4 text-accent-primary" />
                  Email Me
                </a>

                {/* Social icons row */}
                <div className="social-icons pt-1 flex flex-wrap gap-2">
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
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Dynamic Intake Form */}
          <div className="lg:col-span-7 bg-bg-card border border-border-color p-8 rounded-3xl shadow-xl relative" id="contact-form-panel-main">
            
            {/* API Endpoint Ready Badge */}
            <div className="absolute top-4 right-6 text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1">
              <CloudLightning className="w-3.5 h-3.5 text-accent-primary" />
              API Ready
            </div>

            {/* Success Animation Message Banner */}
            <AnimatePresence>
              {submitSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-accent-primary/10 border border-accent-primary/20 p-5 rounded-2xl mb-8 flex items-start gap-4"
                  id="contact-form-success-banner"
                >
                  <CheckCircle2 className="w-6 h-6 text-accent-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-text-primary font-bold text-sm">Enquiry Submitted Successfully!</h4>
                    <p className="text-text-secondary text-xs mt-1 font-medium">
                      Thank you! Your enquiry has been submitted successfully. Rohit or the Unicivix Solutions team will contact you soon.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message & Fallback Banner */}
            <AnimatePresence>
              {submitErrorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/30 p-5 rounded-2xl mb-8"
                  id="contact-form-error-banner"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-text-primary font-bold text-sm">Submission Error</h4>
                      <p className="text-text-secondary text-xs mt-1">{submitErrorMessage}</p>
                      
                      <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-border-color">
                        <a
                          href={contactConfig.whatsappBusinessUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-accent-primary hover:underline flex items-center gap-1"
                        >
                          WhatsApp Rohit Directly →
                        </a>
                        <span className="text-text-muted">•</span>
                        <a
                          href={contactConfig.emailHref}
                          className="text-xs font-bold text-accent-primary hover:underline flex items-center gap-1 contact-email"
                        >
                          Email: {contactConfig.emailDisplay}
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" id="intake-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Your Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2" htmlFor="name">
                    Your Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register('name', {
                      required: 'Name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' }
                    })}
                    className={`w-full bg-bg-primary border rounded-2xl px-5 py-4 text-base sm:text-sm text-text-primary focus:outline-none transition-colors duration-200 ${
                      errors.name ? 'border-red-500 focus:border-red-500' : 'border-border-color focus:border-text-primary/40 focus:ring-1 focus:ring-text-primary/20'
                    }`}
                    placeholder="Enter your name"
                  />
                  {errors.name && (
                    <span className="text-xs text-red-400 font-semibold mt-1.5 block">{errors.name.message}</span>
                  )}
                </div>

                {/* Your Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2" htmlFor="email">
                    Your Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    className={`w-full bg-bg-primary border rounded-2xl px-5 py-4 text-base sm:text-sm text-text-primary focus:outline-none transition-colors duration-200 ${
                      errors.email ? 'border-red-500 focus:border-red-500' : 'border-border-color focus:border-text-primary/40 focus:ring-1 focus:ring-text-primary/20'
                    }`}
                    placeholder="name@company.com"
                  />
                  {errors.email && (
                    <span className="text-xs text-red-400 font-semibold mt-1.5 block">{errors.email.message}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2" htmlFor="phone">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    {...register('phone', {
                      validate: (val) => {
                        if (!val || val.trim() === '') return true;
                        const cleaned = val.trim().replace(/[\s\-()]/g, '');
                        if (!/^[+]?[0-9]{7,15}$/.test(cleaned)) {
                          return 'Please enter a valid phone number';
                        }
                        return true;
                      }
                    })}
                    className={`w-full bg-bg-primary border rounded-2xl px-5 py-4 text-base sm:text-sm text-text-primary focus:outline-none transition-colors duration-200 ${
                      errors.phone ? 'border-red-500 focus:border-red-500' : 'border-border-color focus:border-text-primary/40 focus:ring-1 focus:ring-text-primary/20'
                    }`}
                    placeholder="+91 XXXXX XXXXX"
                  />
                  {errors.phone && (
                    <span className="text-xs text-red-400 font-semibold mt-1.5 block">{errors.phone.message}</span>
                  )}
                </div>

                {/* Service Required */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2" htmlFor="service">
                    Service Required *
                  </label>
                  <select
                    id="service"
                    {...register('service', { required: 'Please select a service' })}
                    className={`w-full bg-bg-primary border rounded-2xl px-5 py-4 text-base sm:text-sm text-text-primary focus:outline-none transition-colors duration-200 appearance-none ${
                      errors.service ? 'border-red-500 focus:border-red-500' : 'border-border-color focus:border-text-primary/40 focus:ring-1 focus:ring-text-primary/20'
                    }`}
                  >
                    <option value="">Select service required</option>
                    {SERVICE_CATEGORIES.map((cat) => {
                      const catServices = SERVICES_LIST.filter((s) => s.category === cat.name);
                      if (catServices.length === 0) return null;
                      return (
                        <optgroup key={cat.name} label={`--- ${cat.name} ---`}>
                          {catServices.map((s) => (
                            <option key={s.id} value={s.title}>
                              {s.title}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                  {errors.service && (
                    <span className="text-xs text-red-400 font-semibold mt-1.5 block">{errors.service.message}</span>
                  )}
                </div>
              </div>

              {/* Project Budget Range */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2" htmlFor="budget">
                  Project Budget Range *
                </label>
                <select
                  id="budget"
                  {...register('budget', { required: 'Please select your budget range' })}
                  className={`w-full bg-bg-primary border rounded-2xl px-5 py-4 text-base sm:text-sm text-text-primary focus:outline-none appearance-none transition-colors ${
                    errors.budget ? 'border-red-500 focus:border-red-500' : 'border-border-color focus:border-text-primary/40 focus:ring-1 focus:ring-text-primary/20'
                  }`}
                >
                  <option value="">Select project budget</option>
                  <option value="Under ₹10,000">Under ₹10,000</option>
                  <option value="₹10,000 – ₹30,000">₹10,000 – ₹30,000</option>
                  <option value="₹30,000 – ₹50,000">₹30,000 – ₹50,000</option>
                  <option value="Above ₹50,000">Above ₹50,000</option>
                </select>
                {errors.budget && (
                  <span className="text-xs text-red-400 font-semibold mt-1.5 block">{errors.budget.message}</span>
                )}
              </div>

              {/* Project Description / Brief */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2" htmlFor="description">
                  Project Description / Brief *
                </label>
                <textarea
                  id="description"
                  rows={4}
                  {...register('description', {
                    required: 'Project description is required',
                    minLength: { value: 10, message: 'Please provide at least 10 characters describing your project' }
                  })}
                  className={`w-full bg-bg-primary border rounded-2xl px-5 py-4 text-base sm:text-sm text-text-primary focus:outline-none transition-colors duration-200 ${
                    errors.description ? 'border-red-500 focus:border-red-500' : 'border-border-color focus:border-text-primary/40 focus:ring-1 focus:ring-text-primary/20'
                  }`}
                  placeholder="Describe your goals, reference accounts, required assets details, timeline bounds..."
                />
                {errors.description && (
                  <span className="text-xs text-red-400 font-semibold mt-1.5 block">{errors.description.message}</span>
                )}
              </div>

              {/* Drag-and-Drop and manual file upload block */}
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                  Attach Project Brief / Style Guide
                </span>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 ${
                    isDragOver
                      ? 'border-accent-primary bg-accent-primary/5'
                      : file
                      ? 'border-accent-primary/40 bg-bg-card'
                      : 'border-border-color hover:border-border-color/80 bg-bg-primary'
                  }`}
                  id="drag-drop-uploader-box"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png,.webp"
                  />
                  
                  {file ? (
                    <div className="w-full" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 rounded-lg bg-accent-primary/10 text-accent-primary flex items-center justify-center">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-text-primary text-sm font-semibold truncate max-w-xs">{file.name}</p>
                          <span className="text-text-secondary/50 text-xs">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                        </div>
                        <button
                          onClick={removeFile}
                          className="p-2 rounded-full hover:bg-white/5 text-red-400 transition-colors cursor-pointer"
                          id="remove-file-upload-btn"
                          type="button"
                          title="Remove file"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>

                      {isStorageAvailable() && uploadProgress !== null && (
                        <div className="mt-3 w-full bg-border-color/30 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-accent-primary h-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-text-secondary/40 mb-2" />
                      <p className="text-sm text-text-primary font-medium text-center">
                        Drag and drop file here, or <span className="text-accent-primary">browse file</span>
                      </p>
                      <span className="text-text-secondary/30 text-[10px] uppercase tracking-wider mt-1 block text-center">
                        PDF, ZIP, DOCX, PNG, JPG, WEBP (Max 15MB)
                      </span>
                    </>
                  )}
                </div>
                {fileError && (
                  <span className="text-xs text-red-400 font-semibold mt-1.5 block">{fileError}</span>
                )}
                {fileNotice && (
                  <div className="mt-2 text-xs text-amber-500 font-medium bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-center gap-2" id="file-upload-unavailable-notice">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{fileNotice}</span>
                  </div>
                )}
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start gap-3">
                <input
                  id="consent"
                  type="checkbox"
                  {...register('consent', { required: 'You must consent to allow Rohit Verma and Unicivix Solutions to contact you.' })}
                  className="mt-1 w-4 h-4 rounded text-accent-primary focus:ring-accent-primary border-border-color bg-bg-primary cursor-pointer"
                />
                <label htmlFor="consent" className="text-xs text-text-secondary leading-relaxed cursor-pointer">
                  I consent to allow Rohit Verma and the Unicivix Solutions team to store my details and contact me regarding my project enquiry. *
                </label>
              </div>
              {errors.consent && (
                <span className="text-xs text-red-400 font-semibold block -mt-3">{errors.consent.message}</span>
              )}

              {/* Submit Trigger */}
              <button
                type="submit"
                disabled={isSubmittingForm}
                className="w-full bg-accent-primary text-white font-extrabold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-accent-secondary active:scale-98 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-accent-primary/10 animate-pulse-slow"
                id="contact-submit-btn"
              >
                {isSubmittingForm ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span className="text-white">Submitting Project...</span>
                  </>
                ) : submitSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    <span>Project Submitted Successfully</span>
                  </>
                ) : submitErrorMessage ? (
                  <>
                    <span>Try Again</span>
                    <Send className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Submit Project</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Form Submission Success Banner */}
              {submitSuccess && (
                <div
                  id="contact-submit-success-banner"
                  aria-live="polite"
                  className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-500" />
                    <div className="text-left">
                      <p className="font-bold text-base">Project Submitted Successfully</p>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                        Thank you for sharing your project details. We’ll review your requirements and get back to you soon.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubmitSuccess(false)}
                    className="self-start sm:self-center px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer whitespace-nowrap"
                    id="submit-another-project-btn"
                  >
                    Submit Another Project
                  </button>
                </div>
              )}

              {/* Form Submission Error & Timeout Fallback Banner */}
              {submitErrorMessage && (
                <div
                  id="contact-submit-error-banner"
                  aria-live="polite"
                  className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm space-y-3 text-left"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                    <span className="font-semibold text-xs leading-relaxed">{submitErrorMessage}</span>
                  </div>

                  <div className="pt-2 border-t border-red-500/15 text-xs text-text-secondary space-y-2">
                    <p className="font-bold text-text-primary">You can also reach Rohit directly via:</p>
                    <div className="flex flex-wrap items-center gap-3 font-medium">
                      <a
                        href={WHATSAPP_BUSINESS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                        WhatsApp
                      </a>
                      <span className="text-border-color">•</span>
                      <a
                        href={FIREBASE_FALLBACK_CONTACT.email}
                        className="inline-flex items-center gap-1.5 text-accent-primary hover:underline"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        {FIREBASE_FALLBACK_CONTACT.emailDisplay}
                      </a>
                      <span className="text-border-color">•</span>
                      <a
                        href={FIREBASE_FALLBACK_CONTACT.phone}
                        className="inline-flex items-center gap-1.5 text-text-primary hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {FIREBASE_FALLBACK_CONTACT.phoneDisplay}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
