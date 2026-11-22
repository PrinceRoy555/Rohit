import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  PenTool,
  Layers,
  Megaphone,
  Package,
  Printer,
  Play,
  Monitor,
  Heart,
  Zap,
  Trophy,
  Calendar,
  Star,
  ArrowRight,
  ExternalLink,
  Linkedin,
  Instagram,
  MessageCircle,
  Target,
  Sparkles,
  X
} from 'lucide-react';
import { WHATSAPP_BUSINESS_URL } from '../data';

interface AboutAgencySectionProps {
  onNavigate?: (routeId: string) => void;
}

const EXPERTISE_LIST = [
  { name: 'Graphic Design', icon: PenTool, desc: 'High-impact visual communication & commercial art' },
  { name: 'Branding', icon: Layers, desc: 'Visual identity, logo geometry & typography systems' },
  { name: 'Social Media', icon: Megaphone, desc: 'Engaging carousel designs & high-converting ad feeds' },
  { name: 'Packaging', icon: Package, desc: 'Retail packaging, die-cuts & print-ready CMYK' },
  { name: 'Print Design', icon: Printer, desc: 'Brochures, corporate collateral & event signage' },
  { name: 'Video Editing', icon: Play, desc: 'High-pacing promotional cuts & kinetic typography' },
  { name: 'Motion Graphics', icon: Sparkles, desc: '2D/3D dynamic animations & UI screen motion' },
  { name: 'UI/UX Design', icon: Monitor, desc: 'Responsive SaaS interfaces & mobile experience systems' },
];

const VALUES_LIST = [
  {
    title: 'Creativity First',
    icon: Heart,
    desc: 'Original ideas that make your brand stand out with distinctive clarity.',
  },
  {
    title: 'Quality & Detail',
    icon: Zap,
    desc: 'Pixel-perfect design with a professional, meticulous standard.',
  },
  {
    title: 'Client Success',
    icon: Users,
    desc: 'Your growth and commercial impact is our biggest achievement.',
  },
];

export default function AboutAgencySection({ onNavigate }: AboutAgencySectionProps) {
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  const handleWorkWithUs = () => {
    if (onNavigate) {
      onNavigate('contact');
    } else {
      const contactEl = document.getElementById('contact');
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = '/contact';
      }
    }
  };

  const handleViewFullAbout = () => {
    if (onNavigate) {
      onNavigate('about');
    } else {
      window.location.href = '/about';
    }
  };

  return (
    <section
      id="about"
      className="py-16 sm:py-24 bg-[#FFFFFF] dark:bg-[#030B1E] text-[#071B49] dark:text-[#E2E8F0] relative overflow-hidden transition-colors duration-300 border-t border-border-color/60 dark:border-[#1E3A8A]/30"
    >
      {/* Ambient background soft light-blue lighting */}
      <div
        className="absolute top-0 right-0 w-[550px] h-[550px] bg-gradient-to-br from-[#3B82F6]/10 via-[#60A5FA]/5 to-transparent rounded-full blur-[140px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-[-100px] w-[450px] h-[450px] bg-gradient-to-tr from-[#0866F5]/8 via-[#38BDF8]/5 to-transparent rounded-full blur-[130px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* =========================================================================
            1. AGENCY HERO & CREATIVE WORKSPACE (Matching Approved Design)
           ========================================================================= */}
        <div className="mb-14 sm:mb-18">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Hero Column: Copy & CTAs */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="lg:col-span-6 flex flex-col items-start"
            >
              {/* Badge: "About Us" */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 border border-[#DBEAFE] dark:border-[#3B82F6]/30 text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] mb-5 shadow-xs">
                <Users className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
                <span>About Us</span>
              </div>

              {/* Main Headline */}
              <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-black tracking-tight text-[#071B49] dark:text-white leading-[1.18] mb-5">
                A Creative Agency for <span className="text-[#0866F5]">Modern Brands</span>
              </h2>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-[#64748B] dark:text-[#94A3B8] max-w-xl leading-relaxed mb-8">
                We are a creative design agency helping businesses build strong brand identities, engaging visuals, and high-performing digital content that delivers real results.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 sm:gap-4">
                <button
                  type="button"
                  onClick={handleWorkWithUs}
                  className="bg-[#0866F5] hover:bg-[#0654ce] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-[0_6px_20px_rgba(8,102,245,0.3)] hover:shadow-[0_8px_25px_rgba(8,102,245,0.4)] transition-all cursor-pointer inline-flex items-center gap-2 active:scale-95"
                >
                  <span>Work With Us</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsStoryModalOpen(true)}
                  className="bg-white dark:bg-[#071B49] text-[#071B49] dark:text-white hover:text-[#0866F5] border border-[#E2E8F0] dark:border-[#1E3A8A]/60 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-xs hover:border-[#0866F5]/50 transition-all cursor-pointer inline-flex items-center gap-2 active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 text-[#0866F5] fill-[#0866F5]" />
                  <span>Watch Our Story</span>
                </button>

                <button
                  type="button"
                  onClick={handleViewFullAbout}
                  className="text-xs sm:text-sm font-bold text-[#0866F5] hover:text-[#0654ce] px-3 py-2 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Explore Standalone Page</span>
                  <span className="text-base">→</span>
                </button>
              </div>
            </motion.div>

            {/* Right Hero Column: Premium Creative Workspace Imagery */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              className="lg:col-span-6 relative flex items-center justify-center"
            >
              {/* Soft ambient glow behind workspace */}
              <div className="absolute w-72 h-72 sm:w-88 sm:h-88 rounded-full bg-gradient-to-tr from-[#3B82F6]/25 to-[#60A5FA]/15 blur-3xl pointer-events-none" />

              {/* Workspace Mockup Card */}
              <div className="relative w-full max-w-[500px] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(7,27,73,0.12)] border border-[#E2E8F0] dark:border-[#1E3A8A]/50 bg-white dark:bg-[#071B49] group">
                
                {/* Floating Top-Right Badge: "Creative Design Team" */}
                <div className="absolute top-4 right-4 z-20 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/95 dark:bg-[#071B49]/95 border border-[#E2E8F0] dark:border-[#1E3A8A] backdrop-blur-md shadow-md text-xs font-bold text-[#071B49] dark:text-white">
                  <div className="w-6 h-6 rounded-lg bg-[#EFF6FF] dark:bg-[#1E3A8A]/50 flex items-center justify-center text-[#0866F5]">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <span>Creative Design Team</span>
                </div>

                {/* Main Workspace Image */}
                <div className="relative aspect-[16/11] w-full overflow-hidden">
                  <img
                    src="/images/creative_workspace_1784367651312.jpg"
                    alt="RohitWork Creative Studio Workspace"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071B49]/40 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* =========================================================================
            2. FLOATING STATS BAR (5 Verified Indicators)
           ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-18"
        >
          <div className="bg-white dark:bg-[#071B49] rounded-2xl border border-[#E2E8F0] dark:border-[#1E3A8A]/50 shadow-[0_10px_30px_rgba(7,27,73,0.06)] p-6 sm:p-7">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-4 divide-y md:divide-y-0 md:divide-x divide-[#F1F5F9] dark:divide-[#1E3A8A]/40">
              
              {/* Stat 1: 50+ Projects Completed */}
              <div className="flex items-center gap-3.5 px-3 pt-3 md:pt-0">
                <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 flex items-center justify-center text-[#0866F5] shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#071B49] dark:text-white leading-tight">50+</div>
                  <div className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">Projects Completed</div>
                </div>
              </div>

              {/* Stat 2: 30+ Happy Clients */}
              <div className="flex items-center gap-3.5 px-3 pt-3 md:pt-0">
                <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 flex items-center justify-center text-[#0866F5] shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#071B49] dark:text-white leading-tight">30+</div>
                  <div className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">Happy Clients</div>
                </div>
              </div>

              {/* Stat 3: 5+ Years of Experience */}
              <div className="flex items-center gap-3.5 px-3 pt-3 md:pt-0">
                <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 flex items-center justify-center text-[#0866F5] shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#071B49] dark:text-white leading-tight">5+</div>
                  <div className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">Years of Experience</div>
                </div>
              </div>

              {/* Stat 4: 15+ Industries Served */}
              <div className="flex items-center gap-3.5 px-3 pt-3 md:pt-0">
                <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 flex items-center justify-center text-[#0866F5] shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#071B49] dark:text-white leading-tight">15+</div>
                  <div className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">Industries Served</div>
                </div>
              </div>

              {/* Stat 5: 98% Client Satisfaction */}
              <div className="flex items-center gap-3.5 px-3 pt-3 md:pt-0">
                <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 flex items-center justify-center text-[#0866F5] shrink-0">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#071B49] dark:text-white leading-tight">98%</div>
                  <div className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">Client Satisfaction</div>
                </div>
              </div>

            </div>
          </div>
        </motion.div>

        {/* =========================================================================
            3. CORE EXPERTISE & WHAT DRIVES US (Dual Panel Grid)
           ========================================================================= */}
        <div className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 7 Cols: What We Do / Core Expertise */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7"
            >
              <div className="mb-6">
                <div className="text-xs font-bold uppercase tracking-wider text-[#0866F5] mb-1.5">— What We Do</div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#071B49] dark:text-white tracking-tight mb-2">
                  Our Core Expertise
                </h3>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                  End-to-end creative solutions to build, grow, and elevate your brand.
                </p>
              </div>

              {/* 8 Expertise Icon Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
                {EXPERTISE_LIST.map((exp, idx) => {
                  const Icon = exp.icon;
                  return (
                    <motion.div
                      key={exp.name}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: 0.04 * idx }}
                      className="bg-white dark:bg-[#071B49] rounded-2xl border border-[#E2E8F0] dark:border-[#1E3A8A]/50 p-4.5 sm:p-5 shadow-[0_4px_16px_rgba(7,27,73,0.03)] hover:shadow-[0_10px_25px_rgba(8,102,245,0.1)] hover:-translate-y-1 transition-all duration-200 flex flex-col items-center text-center group cursor-default"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 text-[#0866F5] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h4 className="text-xs sm:text-[13px] font-bold text-[#071B49] dark:text-white leading-snug">
                        {exp.name}
                      </h4>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Right 5 Cols: What Drives Us (Our Values) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="lg:col-span-5"
            >
              <div className="bg-[#F0F6FF] dark:bg-[#071B49]/60 rounded-3xl border border-[#DBEAFE] dark:border-[#1E3A8A]/50 p-6 sm:p-7 shadow-sm">
                
                {/* Badge: Our Values */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#071B49] text-xs font-bold text-[#0866F5] mb-4 shadow-xs">
                  <Target className="w-3.5 h-3.5" />
                  <span>Our Values</span>
                </div>

                <h3 className="text-2xl font-black text-[#071B49] dark:text-white tracking-tight mb-2">
                  What Drives Us
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed mb-6">
                  The principles that guide our work and client relationships.
                </p>

                {/* 3 Values Stack */}
                <div className="space-y-3.5 sm:space-y-4">
                  {VALUES_LIST.map((val, idx) => {
                    const Icon = val.icon;
                    return (
                      <motion.div
                        key={val.title}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: 0.08 * idx }}
                        className="bg-white dark:bg-[#071B49] rounded-2xl p-4 sm:p-4.5 border border-[#E2E8F0] dark:border-[#1E3A8A]/50 shadow-xs flex items-start gap-3.5"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 text-[#0866F5] flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#071B49] dark:text-white mb-0.5">
                            {val.title}
                          </h4>
                          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                            {val.desc}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

              </div>
            </motion.div>

          </div>
        </div>

        {/* =========================================================================
            4. MEET OUR CREATIVE TEAM (Founder, Web Developer, Video Editor)
           ========================================================================= */}
        <div className="mb-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-8"
            >
              <div className="text-xs font-bold uppercase tracking-wider text-[#0866F5] mb-1.5">— Our Team</div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#071B49] dark:text-white tracking-tight mb-2">
                Meet Our Creative Team
              </h3>
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8] max-w-xl">
                Led by Rohit Verma, delivering comprehensive design, video editing, branding, and motion solutions tailored for forward-thinking businesses.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-4 flex lg:justify-end"
            >
              <button
                type="button"
                onClick={handleViewFullAbout}
                className="bg-[#0866F5] hover:bg-[#0654ce] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center gap-2 active:scale-95"
              >
                <span>View Full Team</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>

          {/* Team Member Cards (1:1 Ratio, Verified Positions) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-7">
            
            {/* Card 1: Rohit Verma */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="bg-white dark:bg-[#071B49] rounded-2xl border border-[#E2E8F0] dark:border-[#1E3A8A]/50 p-6 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center"
            >
              <div className="w-32 h-32 aspect-square rounded-2xl overflow-hidden mb-4 border-2 border-[#0866F5]/20 bg-slate-100 dark:bg-slate-800 shadow-xs relative flex items-center justify-center">
                <img
                  src="/images/rohit-verma-portrait.jpg"
                  alt="Rohit Verma - Founder & Creative Director"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 12%' }}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/rohit-avatar.webp';
                  }}
                />
              </div>
              <h4 className="text-lg font-black text-[#071B49] dark:text-white mb-0.5">Rohit Verma</h4>
              <p className="text-xs font-semibold text-[#0866F5] mb-4">Founder &amp; Creative Director</p>
              
              {/* Social Icons */}
              <div className="flex items-center gap-3 text-[#64748B] dark:text-[#94A3B8]">
                <a
                  href="https://www.linkedin.com/in/rohit-verma-487457374"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 text-[#0866F5] flex items-center justify-center hover:bg-[#0866F5] hover:text-white transition-colors"
                  aria-label="Rohit Verma LinkedIn Profile"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://www.instagram.com/thedesigngeek.rohit/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 text-[#0866F5] flex items-center justify-center hover:bg-[#0866F5] hover:text-white transition-colors"
                  aria-label="Rohit Verma Instagram Profile"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </a>
                <a
                  href={WHATSAPP_BUSINESS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 text-[#0866F5] flex items-center justify-center hover:bg-[#0866F5] hover:text-white transition-colors"
                  aria-label="Rohit Verma WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>

            {/* Card 2: Vijay Sharma */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="bg-white dark:bg-[#071B49] rounded-2xl border border-[#E2E8F0] dark:border-[#1E3A8A]/50 p-6 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center"
            >
              <div className="w-32 h-32 aspect-square rounded-2xl overflow-hidden mb-4 border-2 border-[#0866F5]/20 bg-slate-100 dark:bg-slate-800 shadow-xs relative flex items-center justify-center">
                <img
                  src="/images/team/Vijay-Sharma.png"
                  alt="Vijay Sharma - Web Design & Development"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 15%' }}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/team/Vijay-Sharma.jpg';
                  }}
                />
              </div>
              <h4 className="text-lg font-black text-[#071B49] dark:text-white mb-0.5">Vijay Sharma</h4>
              <p className="text-xs font-semibold text-[#0866F5] mb-4">Web Design &amp; Development</p>
              
              {/* Social Icons */}
              <div className="flex items-center gap-3 text-[#64748B] dark:text-[#94A3B8]">
                <a
                  href="https://www.linkedin.com/in/rohit-verma-487457374"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 text-[#0866F5] flex items-center justify-center hover:bg-[#0866F5] hover:text-white transition-colors"
                  aria-label="Vijay Sharma LinkedIn Profile"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://www.instagram.com/thedesigngeek.rohit/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 text-[#0866F5] flex items-center justify-center hover:bg-[#0866F5] hover:text-white transition-colors"
                  aria-label="Vijay Sharma Instagram Profile"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </a>
                <a
                  href={WHATSAPP_BUSINESS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 text-[#0866F5] flex items-center justify-center hover:bg-[#0866F5] hover:text-white transition-colors"
                  aria-label="Vijay Sharma WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>

            {/* Card 3: Arpit Sharma */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.3 }}
              className="bg-white dark:bg-[#071B49] rounded-2xl border border-[#E2E8F0] dark:border-[#1E3A8A]/50 p-6 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center"
            >
              <div className="w-32 h-32 aspect-square rounded-2xl overflow-hidden mb-4 border-2 border-[#0866F5]/20 bg-slate-100 dark:bg-slate-800 shadow-xs relative flex items-center justify-center">
                <img
                  src="/images/team/Arpit-Sharma.png"
                  alt="Arpit Sharma - Video Editor"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 15%' }}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/team/Arpit-Sharma.jpg';
                  }}
                />
              </div>
              <h4 className="text-lg font-black text-[#071B49] dark:text-white mb-0.5">Arpit Sharma</h4>
              <p className="text-xs font-semibold text-[#0866F5] mb-4">Video Editor</p>
              
              {/* Social Icons */}
              <div className="flex items-center gap-3 text-[#64748B] dark:text-[#94A3B8]">
                <a
                  href="https://www.linkedin.com/in/rohit-verma-487457374"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 text-[#0866F5] flex items-center justify-center hover:bg-[#0866F5] hover:text-white transition-colors"
                  aria-label="Arpit Sharma LinkedIn Profile"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://www.instagram.com/thedesigngeek.rohit/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 text-[#0866F5] flex items-center justify-center hover:bg-[#0866F5] hover:text-white transition-colors"
                  aria-label="Arpit Sharma Instagram Profile"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </a>
                <a
                  href={WHATSAPP_BUSINESS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 text-[#0866F5] flex items-center justify-center hover:bg-[#0866F5] hover:text-white transition-colors"
                  aria-label="Arpit Sharma WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>

          </div>
        </div>

      </div>

      {/* Video Story Modal */}
      <AnimatePresence>
        {isStoryModalOpen && (
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsStoryModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#071B49] border border-[#E2E8F0] dark:border-[#1E3A8A] rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative"
            >
              <button
                onClick={() => setIsStoryModalOpen(false)}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
                aria-label="Close story"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0866F5] mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Our Agency Story</span>
              </div>
              <h3 className="text-2xl font-black text-[#071B49] dark:text-white mb-4">
                Crafting Visual Identity with Purpose &amp; Impact
              </h3>
              <p className="text-[#64748B] dark:text-[#94A3B8] text-sm leading-relaxed mb-6">
                RohitWork was founded with a clear mission: to bring agency-caliber design, dynamic video editing, and strategic visual communication to ambitious businesses. Over 5+ years of craft and 100+ delivered projects, we have helped startups, educational institutes, and retail brands transform their presence with compelling visual storytelling.
              </p>

              <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-black relative mb-6">
                <img
                  src="/images/commercial-promotional-video.jpg"
                  alt="RohitWork Commercial Showcase"
                  className="w-full h-full object-cover"
                />
                <a
                  href="https://www.behance.net/gallery/254351431/Rohit-Verma-Creative-Portfolio-2026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition-colors group cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full bg-[#0866F5] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 fill-white ml-1" />
                  </div>
                </a>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsStoryModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold border border-[#E2E8F0] dark:border-[#1E3A8A] text-[#64748B] hover:text-[#071B49] cursor-pointer"
                >
                  Close
                </button>
                <a
                  href="https://www.behance.net/gallery/254351431/Rohit-Verma-Creative-Portfolio-2026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#0866F5] text-white flex items-center gap-1.5 shadow-md hover:bg-[#0654ce] cursor-pointer"
                >
                  <span>Explore Portfolio</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
