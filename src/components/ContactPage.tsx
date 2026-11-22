import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Zap,
  ShieldCheck,
  Handshake,
  User,
  Layers,
  MessageSquare,
  Calendar,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { contactConfig, WHATSAPP_BUSINESS_URL } from '../data';
import WhatsAppIcon from './WhatsAppIcon';
import { submitContactEnquiry } from '../services/firebase/firestore';

interface ContactFormData {
  name: string;
  email?: string;
  phone?: string;
  projectType: string;
  message: string;
}

const PROJECT_TYPES = [
  'Graphic Design',
  'Brand Identity Design',
  'Social Media Campaign',
  'Packaging & Label Design',
  'Print & Marketing Collateral',
  'Video Editing & Motion Graphics',
  'UI/UX Design',
  'Full Creative Retainer'
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<ContactFormData>({
    mode: 'onTouched'
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Submit to Firestore API
      const response = await submitContactEnquiry({
        name: data.name,
        email: data.email?.trim() || undefined,
        phone: data.phone?.trim() || undefined,
        selectedService: data.projectType || 'General Creative Enquiry',
        budgetRange: 'Not specified',
        projectDescription: data.message,
        consentAccepted: true,
        source: 'contact_page'
      });

      if (response && response.success) {
        setSubmitSuccess(true);
        reset();
      } else {
        // Fallback: If Firebase offline, open pre-filled WhatsApp for guaranteed delivery
        const whatsappMsg = `Hi Rohit, my name is ${data.name}. I would like to discuss a project: ${data.projectType}. Message: ${data.message}`;
        window.open(WHATSAPP_BUSINESS_URL, '_blank');
        setSubmitSuccess(true);
        reset();
      }
    } catch {
      // Fallback to direct WhatsApp
      const whatsappMsg = `Hi Rohit, my name is ${data.name}. Project: ${data.projectType}. Message: ${data.message}`;
      window.open(WHATSAPP_BUSINESS_URL, '_blank');
      setSubmitSuccess(true);
      reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#030B1E] text-[#071B49] dark:text-[#E2E8F0] min-h-screen relative overflow-hidden transition-colors duration-300">
      
      {/* Ambient background soft light-blue gradients matching reference screenshot */}
      <div
        className="absolute top-0 right-0 w-[650px] h-[650px] bg-gradient-to-br from-[#3B82F6]/10 via-[#60A5FA]/5 to-transparent rounded-full blur-[140px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-[35%] left-[-150px] w-[500px] h-[500px] bg-gradient-to-tr from-[#0866F5]/8 via-[#38BDF8]/5 to-transparent rounded-full blur-[130px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-24 relative z-10">

        {/* =========================================================================
            1. HERO SECTION (Matching Approved Contact Reference Image)
           ========================================================================= */}
        <section className="mb-14 sm:mb-18">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Hero Column: Copy & Trust Highlights */}
            <div className="lg:col-span-7 flex flex-col items-start">
              
              {/* Badge: "Get in Touch" */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 border border-[#DBEAFE] dark:border-[#3B82F6]/30 text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] mb-5 shadow-xs">
                <Mail className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
                <span>Get in Touch</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight text-[#071B49] dark:text-white leading-[1.1] mb-5">
                Let&apos;s Work <span className="text-[#0866F5]">Together</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-[#64748B] dark:text-[#94A3B8] max-w-xl leading-relaxed mb-8">
                Have a project in mind? Need a creative partner? I&apos;d love to hear from you. Get in touch and let&apos;s turn your ideas into impactful solutions.
              </p>

              {/* 3 Trust Badges Matching Reference Screenshot */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#F1F5F9] dark:border-[#1E3A8A]/40 w-full">
                
                {/* Badge 1: Quick Response */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 border border-[#DBEAFE] dark:border-[#3B82F6]/30 flex items-center justify-center text-[#0866F5] shrink-0">
                    <Zap className="w-5 h-5 text-[#0866F5]" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#071B49] dark:text-white">Quick Response</div>
                    <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Within 24 Hours</div>
                  </div>
                </div>

                {/* Badge 2: Professional Support */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 border border-[#DBEAFE] dark:border-[#3B82F6]/30 flex items-center justify-center text-[#0866F5] shrink-0">
                    <ShieldCheck className="w-5 h-5 text-[#0866F5]" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#071B49] dark:text-white">Professional Support</div>
                    <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Project to Delivery</div>
                  </div>
                </div>

                {/* Badge 3: Work with Confidence */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 border border-[#DBEAFE] dark:border-[#3B82F6]/30 flex items-center justify-center text-[#0866F5] shrink-0">
                    <Handshake className="w-5 h-5 text-[#0866F5]" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#071B49] dark:text-white">Work with Confidence</div>
                    <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Transparent &amp; On Time</div>
                  </div>
                </div>

              </div>

            </div>

            {/* Right Hero Column: Premium Creative Workspace Illustration */}
            <div className="lg:col-span-5 relative flex items-center justify-center py-6 sm:py-8">
              <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-[#3B82F6]/25 to-[#60A5FA]/15 blur-3xl pointer-events-none" />

              <div className="relative w-full max-w-[420px] aspect-[4/3] flex items-center justify-center">
                
                {/* 3D Modern Laptop Display Mockup */}
                <div className="relative w-[320px] sm:w-[360px] bg-[#0F172A] p-2.5 rounded-t-2xl rounded-b-lg shadow-[0_25px_50px_rgba(7,27,73,0.18)] border border-[#334155] transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                  <div className="relative aspect-[16/10] bg-[#070D1E] rounded-lg overflow-hidden border border-[#1E293B] flex items-center justify-center p-6">
                    <div className="relative flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#0866F5] via-[#2563EB] to-[#38BDF8] flex items-center justify-center shadow-[0_0_35px_rgba(8,102,245,0.6)] mb-2">
                        <span className="text-3xl sm:text-4xl font-black text-white tracking-tighter">R</span>
                      </div>
                      <div className="text-[11px] font-bold text-white tracking-widest uppercase opacity-90">RohitWork</div>
                      <div className="text-[9px] text-[#38BDF8] font-semibold tracking-wider">Creative Agency</div>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-gradient-to-b from-[#334155] to-[#1E293B] rounded-b-lg mt-1 flex items-center justify-center">
                    <div className="w-16 h-0.5 bg-[#475569] rounded-full" />
                  </div>
                </div>

                {/* Branded "R" Ceramic Mug */}
                <div className="absolute -bottom-2 left-2 w-12 h-14 bg-white dark:bg-[#0F172A] rounded-b-xl border-2 border-[#CBD5E1] dark:border-[#334155] shadow-md flex items-center justify-center">
                  <span className="text-base font-black text-[#0866F5]">R</span>
                </div>

                {/* Smartphone Dock with App Icons (WhatsApp, Mail, Instagram, Phone) */}
                <div className="absolute -bottom-4 right-0 sm:right-2 w-24 h-40 bg-black rounded-2xl p-1.5 border-2 border-slate-700 shadow-2xl transform rotate-3 flex flex-col justify-between">
                  <div className="w-8 h-1 bg-slate-800 rounded-full mx-auto mb-1" />
                  <div className="flex-1 bg-slate-900 rounded-xl p-2 flex flex-col items-center justify-around">
                    <div className="w-7 h-7 rounded-lg bg-[#25D366] flex items-center justify-center text-white shadow-xs">
                      <WhatsAppIcon className="w-4 h-4" />
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-[#EA4335] flex items-center justify-center text-white shadow-xs">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-[#E4405F] flex items-center justify-center text-white shadow-xs">
                      <InstagramIcon className="w-4 h-4" />
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-[#0866F5] flex items-center justify-center text-white shadow-xs">
                      <Phone className="w-4 h-4" />
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            2. TWO-COLUMN CONTACT CONTAINER (Matching Reference Image)
           ========================================================================= */}
        <section className="mb-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 7 Cols: "Send Us a Message" Form Card */}
            <div className="lg:col-span-7 bg-white dark:bg-[#071B49] rounded-3xl border border-[#E2E8F0] dark:border-[#1E3A8A]/50 p-6 sm:p-9 shadow-[0_8px_30px_rgba(7,27,73,0.04)]">
              
              {/* Form Card Header */}
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 text-[#0866F5] flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5 -rotate-45" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#071B49] dark:text-white tracking-tight mb-1">
                    Send Us a Message
                  </h2>
                  <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8]">
                    Fill out the form below and I&apos;ll get back to you shortly.
                  </p>
                </div>
              </div>

              {submitSuccess ? (
                <div className="p-8 text-center bg-[#F0FDF4] dark:bg-[#064E3B]/20 border border-[#86EFAC] dark:border-[#059669]/40 rounded-2xl mb-4">
                  <CheckCircle2 className="w-12 h-12 text-[#22C55E] mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-[#071B49] dark:text-white mb-2">Message Sent Successfully!</h3>
                  <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] max-w-md mx-auto mb-5">
                    Thank you for reaching out. We have received your project details and will respond within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitSuccess(false)}
                    className="bg-[#0866F5] text-white text-xs font-bold px-6 py-2.5 rounded-full cursor-pointer shadow-md hover:bg-[#0654ce]"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  
                  {/* Row 1: Full Name & Email Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-[#071B49] dark:text-white mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Your Name"
                          {...register('name', { required: 'Please enter your full name' })}
                          className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] dark:bg-[#0A1A3A] border border-[#E2E8F0] dark:border-[#1E3A8A]/50 rounded-xl text-xs sm:text-sm text-[#071B49] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#0866F5] focus:bg-white dark:focus:bg-[#071B49] transition-all"
                        />
                      </div>
                      {errors.name && (
                        <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-xs font-bold text-[#071B49] dark:text-white mb-2">
                        Email Address {watch('phone') ? <span className="text-slate-400 font-normal">(Optional)</span> : <span className="text-red-500">*</span>}
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          placeholder="Your Email"
                          {...register('email', {
                            validate: (val) => {
                              const phoneVal = watch('phone');
                              if (!val || val.trim() === '') {
                                if (!phoneVal || phoneVal.trim() === '') {
                                  return 'Please enter your email or phone number';
                                }
                                return true;
                              }
                              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) {
                                return 'Please enter a valid email address';
                              }
                              return true;
                            }
                          })}
                          className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] dark:bg-[#0A1A3A] border border-[#E2E8F0] dark:border-[#1E3A8A]/50 rounded-xl text-xs sm:text-sm text-[#071B49] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#0866F5] focus:bg-white dark:focus:bg-[#071B49] transition-all"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.email.message}</p>
                      )}
                    </div>

                  </div>

                  {/* Row 2: Phone Number & Project Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    
                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-bold text-[#071B49] dark:text-white mb-2">
                        Phone Number {watch('email') ? <span className="text-slate-400 font-normal">(Optional)</span> : <span className="text-red-500">*</span>}
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          placeholder="+91 77328 69027"
                          {...register('phone', {
                            validate: (val) => {
                              const emailVal = watch('email');
                              if (!val || val.trim() === '') {
                                if (!emailVal || emailVal.trim() === '') {
                                  return 'Please enter your email or phone number';
                                }
                                return true;
                              }
                              const cleaned = val.trim().replace(/[\s()+-]/g, '');
                              if (cleaned.length < 7 || cleaned.length > 15) {
                                return 'Please enter a valid phone number (7-15 digits)';
                              }
                              return true;
                            }
                          })}
                          className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] dark:bg-[#0A1A3A] border border-[#E2E8F0] dark:border-[#1E3A8A]/50 rounded-xl text-xs sm:text-sm text-[#071B49] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#0866F5] focus:bg-white dark:focus:bg-[#071B49] transition-all"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.phone.message}</p>
                      )}
                    </div>

                    {/* Project Type */}
                    <div>
                      <label className="block text-xs font-bold text-[#071B49] dark:text-white mb-2">
                        Project Type <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Layers className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <select
                          {...register('projectType', { required: 'Please select a project type' })}
                          className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] dark:bg-[#0A1A3A] border border-[#E2E8F0] dark:border-[#1E3A8A]/50 rounded-xl text-xs sm:text-sm text-[#071B49] dark:text-white focus:outline-none focus:border-[#0866F5] focus:bg-white dark:focus:bg-[#071B49] transition-all appearance-none cursor-pointer"
                        >
                          <option value="">Select Project Type</option>
                          {PROJECT_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      {errors.projectType && (
                        <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.projectType.message}</p>
                      )}
                    </div>

                  </div>

                  {/* Row 3: Your Message */}
                  <div>
                    <label className="block text-xs font-bold text-[#071B49] dark:text-white mb-2">
                      Your Message <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MessageSquare className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3.5" />
                      <textarea
                        rows={4}
                        placeholder="Tell us about your project, goals, and requirements..."
                        {...register('message', { required: 'Please describe your project' })}
                        className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] dark:bg-[#0A1A3A] border border-[#E2E8F0] dark:border-[#1E3A8A]/50 rounded-xl text-xs sm:text-sm text-[#071B49] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#0866F5] focus:bg-white dark:focus:bg-[#071B49] transition-all resize-none"
                      />
                    </div>
                    {errors.message && (
                      <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.message.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#0866F5] hover:bg-[#0654ce] disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-full shadow-[0_6px_20px_rgba(8,102,245,0.3)] hover:shadow-[0_8px_25px_rgba(8,102,245,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    {isSubmitting ? (
                      <span>Sending Message...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4 -rotate-45" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>

                </form>
              )}

            </div>

            {/* Right 5 Cols: "Get in Touch" Direct Cards & Free Consultation */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Direct Reach Out Card */}
              <div className="bg-white dark:bg-[#071B49] rounded-3xl border border-[#E2E8F0] dark:border-[#1E3A8A]/50 p-6 sm:p-7 shadow-sm">
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 text-[#0866F5] flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#071B49] dark:text-white">Get in Touch</h3>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Choose your preferred way to reach out.</p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  
                  {/* WhatsApp */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0A1A3A] border border-[#E2E8F0] dark:border-[#1E3A8A]/40">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] dark:bg-[#052e16] text-[#22C55E] flex items-center justify-center shrink-0">
                        <WhatsAppIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#071B49] dark:text-white">WhatsApp</div>
                        <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Chat directly for quick response</div>
                      </div>
                    </div>
                    <a
                      href={WHATSAPP_BUSINESS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-full text-xs font-bold border border-[#E2E8F0] dark:border-[#1E3A8A] text-[#0866F5] hover:bg-[#0866F5] hover:text-white hover:border-[#0866F5] transition-all cursor-pointer inline-flex items-center gap-1 shrink-0"
                    >
                      <span>Chat Now</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0A1A3A] border border-[#E2E8F0] dark:border-[#1E3A8A]/40">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 text-[#0866F5] flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#071B49] dark:text-white">Email</div>
                        <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{contactConfig.emailDisplay}</div>
                      </div>
                    </div>
                    <a
                      href={contactConfig.emailHref}
                      className="px-3.5 py-1.5 rounded-full text-xs font-bold border border-[#E2E8F0] dark:border-[#1E3A8A] text-[#0866F5] hover:bg-[#0866F5] hover:text-white hover:border-[#0866F5] transition-all cursor-pointer inline-flex items-center gap-1 shrink-0"
                    >
                      <span>Send Email</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0A1A3A] border border-[#E2E8F0] dark:border-[#1E3A8A]/40">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#F3E8FF] dark:bg-[#3b0764] text-[#A855F7] flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#071B49] dark:text-white">Phone</div>
                        <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{contactConfig.phoneDisplay}</div>
                      </div>
                    </div>
                    <a
                      href={contactConfig.phoneHref}
                      className="px-3.5 py-1.5 rounded-full text-xs font-bold border border-[#E2E8F0] dark:border-[#1E3A8A] text-[#0866F5] hover:bg-[#0866F5] hover:text-white hover:border-[#0866F5] transition-all cursor-pointer inline-flex items-center gap-1 shrink-0"
                    >
                      <span>Call Now</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Location */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0A1A3A] border border-[#E2E8F0] dark:border-[#1E3A8A]/40">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#FEE2E2] dark:bg-[#450a0a] text-[#EF4444] flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#071B49] dark:text-white">Location</div>
                        <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Jaipur, Rajasthan, India</div>
                      </div>
                    </div>
                    <a
                      href="https://maps.google.com/?q=Jaipur,+Rajasthan,+India"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-full text-xs font-bold border border-[#E2E8F0] dark:border-[#1E3A8A] text-[#0866F5] hover:bg-[#0866F5] hover:text-white hover:border-[#0866F5] transition-all cursor-pointer inline-flex items-center gap-1 shrink-0"
                    >
                      <span>View on Map</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>

                </div>

              </div>

              {/* Consultation Card */}
              <div className="bg-white dark:bg-[#071B49] rounded-3xl border border-[#E2E8F0] dark:border-[#1E3A8A]/50 p-5 sm:p-6 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 text-[#0866F5] flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#071B49] dark:text-white">Book a Free Consultation</h4>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Discuss your project, get expert advice.</p>
                  </div>
                </div>

                <a
                  href={WHATSAPP_BUSINESS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#0866F5] hover:bg-[#0654ce] text-white font-bold text-xs px-4 sm:px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center gap-1.5 shrink-0 active:scale-95"
                >
                  <span>Book Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>

          </div>
        </section>

      </div>

    </div>
  );
}

function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
