import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WHATSAPP_BUSINESS_URL, contactConfig } from '../data';
import portraitImg from '../assets/images/rohit-verma-portrait.jpg';
import { 
  MapPin, 
  Briefcase, 
  Award, 
  ShieldCheck, 
  GraduationCap, 
  Compass, 
  Layers, 
  Cpu, 
  Palette, 
  Check, 
  CheckCircle2,
  ExternalLink, 
  FileText, 
  Download, 
  Phone, 
  Mail,
  Sparkles, 
  MessageSquare, 
  BookOpen, 
  Lightbulb, 
  Target, 
  ChevronRight 
} from 'lucide-react';
import { 
  PROFILE_HERO, 
  PROFILE_INTRO, 
  QUICK_CARDS, 
  PROFILE_SUMMARY, 
  PROFILE_JOURNEY, 
  PROFILE_TRAINING, 
  SKILLS_CATEGORIES, 
  UNICIVIX_DATA, 
  WORK_PHILOSOPHIES, 
  WHY_WORK_POINTS, 
  ACHIEVEMENT_CARDS 
} from '../data';

// Helper component to resolve Lucide icons dynamically or fall back to standard ones
function getIconComponent(iconName: string) {
  switch (iconName) {
    case 'MapPin': return MapPin;
    case 'Briefcase': return Briefcase;
    case 'Award': return Award;
    case 'ShieldCheck': return ShieldCheck;
    case 'GraduationCap': return GraduationCap;
    case 'Compass': return Compass;
    case 'Layers': return Layers;
    case 'Cpu': return Cpu;
    case 'Palette': return Palette;
    default: return Sparkles;
  }
}

export default function AboutRohitPage() {
  const handleScrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.hash = 'contact';
    }
  };

  return (
    <div className="pt-20 bg-bg-primary text-text-primary min-h-screen relative overflow-hidden transition-colors duration-300" id="about-rohit-page-root">
      
      {/* 1. HERO SECTION WITH BREADCRUMB */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-bg-card to-bg-primary border-b border-border-color overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-accent-primary/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-accent-secondary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-text-muted font-semibold mb-6" id="about-breadcrumb">
            <a href="/" onClick={(e) => { e.preventDefault(); if (window.history && window.history.pushState) { window.history.pushState(null, '', '/'); window.dispatchEvent(new Event('popstate')); } else { window.location.hash = ''; } }} className="hover:text-accent-primary transition-colors cursor-pointer">Home</a>
            <span>/</span>
            <span className="text-accent-primary">About Rohit</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Hero Texts */}
            <div className="lg:col-span-7" id="about-hero-text">
              <span className="text-xs font-bold uppercase tracking-widest text-accent-primary bg-accent-primary/10 px-3.5 py-1.5 rounded-full mb-4 inline-block">
                {PROFILE_HERO.label}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-text-primary tracking-tight leading-tight mb-6">
                {PROFILE_HERO.title}
              </h1>
              <p className="text-text-secondary text-base md:text-lg leading-relaxed mb-8 max-w-2xl">
                {PROFILE_HERO.subtitle}
              </p>

              <div className="flex flex-wrap gap-4" id="about-hero-actions">
                <a
                  href={contactConfig.resumePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-accent-primary hover:bg-accent-secondary text-white font-bold px-7 py-3.5 rounded-full flex items-center gap-2 shadow-lg hover:shadow-[0_12px_32px_var(--shadow-color)] active:scale-95 transition-all duration-200 cursor-pointer"
                  aria-label="Open Rohit Verma Resume PDF"
                >
                  <FileText className="w-5 h-5 text-white stroke-[2.25] flex-shrink-0" aria-hidden="true" />
                  <span>View Resume</span>
                </a>
                <button
                  onClick={handleScrollToContact}
                  className="bg-bg-secondary border border-border-color hover:border-accent-primary text-text-primary hover:text-accent-primary font-bold px-7 py-3.5 rounded-full flex items-center gap-2 hover:bg-bg-secondary/80 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  <Phone className="w-5 h-5" />
                  Contact Me
                </button>
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="lg:col-span-5 flex justify-center" id="about-hero-image-pane">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="profile-card group"
              >
                <img
                  src={portraitImg}
                  alt="Portrait of Rohit Verma, Graphic Designer, Video Editor and Founder of Unicivix Solutions."
                  loading="lazy"
                  decoding="async"
                  className="profile-card-image"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    if (e.currentTarget.src !== window.location.origin + '/images/rohit-verma-portrait.jpg') {
                      e.currentTarget.src = '/images/rohit-verma-portrait.jpg';
                    }
                  }}
                />
                <div className="profile-card-info">
                  <p className="profile-card-category">
                    Design & Digital Growth
                  </p>
                  <p className="profile-card-name">
                    Rohit Verma
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PERSONAL INTRODUCTION SECTION */}
      <section className="py-24 bg-bg-secondary/40 relative border-b border-border-color" id="personal-intro">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Image / Workspace */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5 }}
                className="relative rounded-3xl overflow-hidden border border-border-color shadow-xl"
              >
                <img
                  src={PROFILE_INTRO.image}
                  alt="Creative Workspace"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-[380px] object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-bg-primary/60 to-transparent" />
              </motion.div>
            </div>

            {/* Right Intro details */}
            <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col justify-center">
              <span className="text-accent-primary font-bold text-xs uppercase tracking-widest mb-3">
                Introduction
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary leading-tight mb-6">
                {PROFILE_INTRO.title}
              </h2>
              <p className="text-text-secondary text-base leading-relaxed mb-4">
                {PROFILE_INTRO.content1}
              </p>
              <p className="text-text-secondary text-base leading-relaxed mb-8">
                {PROFILE_INTRO.content2}
              </p>

              {/* Signature Style info */}
              <div className="border-t border-border-color pt-6 flex items-center justify-between">
                <div>
                  <span className="font-serif italic text-3xl text-text-primary block select-none mb-1">
                    {PROFILE_INTRO.signature}
                  </span>
                  <span className="text-xs font-bold text-accent-primary uppercase tracking-wider">
                    {PROFILE_INTRO.designation}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. QUICK INFORMATION CARDS */}
      <section className="py-16 bg-bg-primary" id="quick-info">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {QUICK_CARDS.map((card, idx) => {
              const IconComp = getIconComponent(card.icon);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  key={idx}
                  className="bg-bg-card border border-border-color hover:border-accent-primary/40 p-6 rounded-2xl flex items-start gap-4 transition-all duration-300 group hover:-translate-y-1 shadow-md"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent-primary/10 text-accent-primary flex items-center justify-center flex-shrink-0 group-hover:bg-accent-primary group-hover:text-white transition-all duration-300">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-text-muted tracking-wider mb-1">
                      {card.title}
                    </h4>
                    <p className="text-text-primary font-semibold text-sm leading-snug">
                      {card.value}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. PROFESSIONAL SUMMARY SECTION */}
      <section className="py-24 bg-bg-secondary/20 border-t border-b border-border-color" id="professional-summary">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-accent-primary font-bold text-xs uppercase tracking-widest mb-3 inline-block">
              Background
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary">
              {PROFILE_SUMMARY.title}
            </h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-bg-card/40 border border-border-color p-8 md:p-12 rounded-3xl relative overflow-hidden"
          >
            {/* Quotes accent */}
            <div className="absolute top-4 right-8 text-accent-primary/5 font-serif text-9xl pointer-events-none select-none">
              ”
            </div>

            <div className="text-text-secondary text-base leading-relaxed space-y-6 whitespace-pre-line relative z-10 font-medium">
              {PROFILE_SUMMARY.biography}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. MY PROFESSIONAL JOURNEY SECTION */}
      <section className="py-24 bg-bg-primary" id="professional-journey">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-accent-primary font-bold text-xs uppercase tracking-widest mb-3 inline-block">
              Career Timeline
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary">
              My Professional Journey
            </h2>
          </div>

          {/* Vertical Timeline */}
          <div className="relative border-l-2 border-border-color ml-4 sm:ml-6 md:ml-8 space-y-12">
            {PROFILE_JOURNEY.map((item, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                key={idx}
                className="relative pl-8 sm:pl-10 group"
              >
                {/* Vertical line node circle indicator */}
                <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-bg-primary border-2 border-accent-primary group-hover:scale-125 group-hover:bg-accent-primary transition-all duration-300 z-10 shadow-lg shadow-accent-primary/20" />

                {/* Journey card */}
                <div className="bg-bg-secondary border border-border-color hover:border-accent-primary/40 rounded-2xl p-6 md:p-8 transition-colors duration-300">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-text-primary group-hover:text-accent-primary transition-colors">
                        {item.role}
                      </h3>
                      <p className="text-sm font-semibold text-accent-primary">
                        {item.organisation}
                      </p>
                    </div>
                  </div>

                  <p className="text-text-secondary text-sm leading-relaxed mb-6">
                    {item.description}
                  </p>

                  {/* Key experience checklist */}
                  <div>
                    <h5 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-accent-primary" />
                      Key Experience & Achievements:
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {item.keyExperience.map((exp, eIdx) => (
                        <div key={eIdx} className="flex items-center gap-2 text-text-secondary text-xs">
                           <div className="w-1.5 h-1.5 rounded-full bg-accent-primary/60 flex-shrink-0" />
                          <span>{exp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PROFESSIONAL TRAINING SECTION */}
      <section className="py-24 bg-bg-secondary/30 border-t border-b border-border-color" id="professional-training">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Texts */}
            <div className="lg:col-span-6">
              <span className="text-accent-primary font-bold text-xs uppercase tracking-widest mb-3 block">
                Acquired Expertise
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-6">
                Professional Training
              </h2>
              <div className="bg-bg-card border border-border-color p-6 md:p-8 rounded-2xl mb-6">
                <span className="text-xs font-bold text-accent-primary uppercase tracking-wider block mb-1">
                  Institute / Academy
                </span>
                <h4 className="text-lg font-bold text-text-primary mb-2">
                  {PROFILE_TRAINING.institute}
                </h4>
                <span className="text-xs font-bold text-accent-primary uppercase tracking-wider block mb-4">
                  Programme: {PROFILE_TRAINING.programme}
                </span>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {PROFILE_TRAINING.description}
                </p>
              </div>
            </div>

            {/* Right learning areas badges */}
            <div className="lg:col-span-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary/50 mb-6">
                Learning & Specialisation Areas
              </h4>
              <div className="flex flex-wrap gap-3">
                {PROFILE_TRAINING.learningAreas.map((area, idx) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                    key={idx}
                    className="bg-bg-card/60 border border-border-color hover:border-accent-primary/40 text-accent-primary hover:text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-full flex items-center gap-2 cursor-default transition-all duration-300 shadow-md hover:bg-accent-primary"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-accent-primary group-hover:text-white" />
                    {area}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SKILLS AND EXPERTISE SECTION */}
      <section className="py-24 bg-bg-primary" id="skills-expertise">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-accent-primary font-bold text-xs uppercase tracking-widest mb-3 inline-block">
              Skill Matrix
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary">
              Skills and Creative Expertise
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SKILLS_CATEGORIES.map((cat, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                key={idx}
                className="bg-bg-card border border-border-color rounded-3xl p-6 hover:border-border-color/80 transition-all duration-300 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-color">
                  <div className="w-10 h-10 rounded-xl bg-accent-primary/10 text-accent-primary flex items-center justify-center">
                    {idx === 0 && <Palette className="w-5 h-5" />}
                    {idx === 1 && <Sparkles className="w-5 h-5" />}
                    {idx === 2 && <Cpu className="w-5 h-5" />}
                    {idx === 3 && <Target className="w-5 h-5" />}
                    {idx === 4 && <Briefcase className="w-5 h-5" />}
                  </div>
                  <h3 className="text-lg font-bold text-text-primary tracking-tight">
                    {cat.title}
                  </h3>
                </div>

                <div className="flex flex-col gap-3">
                  {cat.skills.map((skill, sIdx) => (
                    <div key={sIdx} className="flex items-center justify-between group/skill">
                      <div className="flex items-center gap-2 text-text-secondary group-hover/skill:text-text-primary transition-colors duration-200">
                        <Check className="w-3.5 h-3.5 text-accent-primary" />
                        <span className="text-sm font-medium">{skill}</span>
                      </div>
                      {/* Stylized progress or badge */}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded">
                        Expert
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. UNICIVIX SOLUTIONS SECTION */}
      <section className="py-24 bg-bg-secondary/50 border-t border-b border-border-color relative overflow-hidden" id="unicivix-agency">
        {/* Ambient lights */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[300px] bg-accent-primary/5 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <span className="text-accent-primary font-bold text-xs uppercase tracking-widest mb-3 block">
                {UNICIVIX_DATA.title}
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-text-primary tracking-tight leading-tight mb-6">
                {UNICIVIX_DATA.heading}
              </h2>
              <p className="text-text-secondary text-base leading-relaxed mb-6 whitespace-pre-line">
                {UNICIVIX_DATA.description}
              </p>

              {/* Mission Statement Box */}
              <div className="bg-bg-card border-l-4 border-l-accent-primary border-border-color p-5 rounded-r-2xl mb-8">
                <span className="text-xs font-bold text-accent-primary uppercase tracking-widest block mb-1">
                  Our Mission
                </span>
                <p className="text-text-secondary text-sm italic font-semibold">
                  “{UNICIVIX_DATA.mission}”
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleScrollToContact}
                  className="bg-accent-primary hover:bg-accent-secondary text-white font-bold px-7 py-3.5 rounded-full shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  Start a Project
                </button>
                <a
                  href="https://unicivix.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-transparent border border-border-color hover:border-accent-primary text-text-primary hover:text-accent-primary font-bold px-7 py-3.5 rounded-full flex items-center gap-2 transition-all"
                >
                  Explore Unicivix Solutions
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Right Side services list */}
            <div className="lg:col-span-5">
              <div className="bg-bg-card border border-border-color rounded-3xl p-6 md:p-8 shadow-xl">
                <h4 className="text-sm font-extrabold text-text-primary uppercase tracking-wider mb-6 pb-2 border-b border-border-color">
                  Agency Services Matrix
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {UNICIVIX_DATA.services.map((srv, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-3 bg-bg-secondary/40 hover:bg-bg-primary p-3.5 rounded-xl border border-border-color transition-all group">
                      <div className="w-6 h-6 rounded-full bg-accent-primary/10 text-accent-primary flex items-center justify-center flex-shrink-0 group-hover:bg-accent-primary group-hover:text-white transition-all">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-text-secondary text-sm font-semibold group-hover:text-text-primary transition-colors">
                        {srv}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. PERSONAL WORK PHILOSOPHY SECTION */}
      <section className="py-24 bg-bg-primary" id="work-philosophy">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-accent-primary font-bold text-xs uppercase tracking-widest mb-3 inline-block">
              Core Beliefs
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary">
              My Work Philosophy
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WORK_PHILOSOPHIES.map((ph, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                key={idx}
                className="bg-bg-card border border-border-color hover:border-accent-primary/30 p-6 rounded-2xl transition-all duration-300 shadow-md flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-accent-primary/10 text-accent-primary flex items-center justify-center mb-5 group-hover:bg-accent-primary group-hover:text-white transition-all">
                    {idx === 0 && <Target className="w-5 h-5" />}
                    {idx === 1 && <MessageSquare className="w-5 h-5" />}
                    {idx === 2 && <Layers className="w-5 h-5" />}
                    {idx === 3 && <Lightbulb className="w-5 h-5" />}
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-3 group-hover:text-accent-primary transition-colors">
                    {ph.title}
                  </h3>
                  <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
                    {ph.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. WHY WORK WITH ROHIT SECTION */}
      <section className="py-24 bg-bg-secondary/30 border-t border-b border-border-color" id="why-work-with-me">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Texts */}
            <div className="lg:col-span-5">
              <span className="text-accent-primary font-bold text-xs uppercase tracking-widest mb-3 block">
                Collaborative Value
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-6">
                Why Work With Me?
              </h2>
              <p className="text-text-secondary text-sm md:text-base leading-relaxed mb-6">
                Choosing a partner for your creative design and branding endeavors should be simple. I combine artistic craft with strategic visual focus to deliver results.
              </p>
              <button
                onClick={handleScrollToContact}
                className="bg-bg-secondary border border-border-color hover:border-accent-primary text-text-primary hover:text-accent-primary font-bold px-6 py-3.5 rounded-full transition-all cursor-pointer"
              >
                Let's Discuss Your Project
              </button>
            </div>

            {/* Right visually attractive cards with checks */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {WHY_WORK_POINTS.map((point, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                    key={idx}
                    className="bg-bg-card border border-border-color p-5 rounded-2xl flex items-start gap-3.5 group hover:border-accent-primary/40 transition-all duration-300"
                  >
                    <div className="w-5 h-5 rounded-full bg-accent-primary/10 text-accent-primary flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-accent-primary group-hover:text-white transition-all">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-text-secondary text-xs sm:text-sm font-semibold leading-relaxed group-hover:text-text-primary transition-colors">
                      {point}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. ACHIEVEMENT SECTION */}
      <section className="py-24 bg-bg-primary" id="achievements-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-accent-primary font-bold text-xs uppercase tracking-widest mb-3 inline-block">
              Key Metrics
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary">
              Professional Achievements
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ACHIEVEMENT_CARDS.map((card, idx) => {
              const IconComp = getIconComponent(card.icon);
              return (
                <div key={idx} className="bg-bg-card border border-border-color hover:border-border-color/80 p-6 rounded-2xl flex items-center gap-4 transition-colors duration-200">
                  <div className="w-12 h-12 rounded-xl bg-accent-primary/10 text-accent-primary flex items-center justify-center flex-shrink-0">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-extrabold text-text-primary leading-tight">
                      {card.title}
                    </h4>
                    <p className="text-text-secondary text-xs font-semibold mt-1">
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 12. PERSONAL CTA SECTION */}
      <section className="py-20 bg-bg-secondary border-t border-border-color relative overflow-hidden" id="about-personal-cta">
        {/* Lights */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent-primary/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-text-primary tracking-tight mb-4 leading-tight">
            Let’s Build Something Creative and Impactful.
          </h2>
          <p className="text-text-secondary text-base md:text-lg leading-relaxed mb-10 max-w-2xl mx-auto font-medium">
            Work with Rohit Verma for graphic design, brand identity, video editing, social media management and creative agency solutions.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleScrollToContact}
              className="bg-accent-primary hover:bg-accent-secondary text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-[0_12px_32px_var(--shadow-color)] active:scale-95 transition-transform cursor-pointer"
            >
              Start a Project
            </button>
            <button
              onClick={handleScrollToContact}
              className="bg-bg-secondary border border-border-color hover:border-accent-primary text-text-primary hover:text-accent-primary font-bold px-8 py-4 rounded-full transition-colors cursor-pointer"
            >
              Contact Rohit
            </button>
            <a
              href={contactConfig.phoneHref}
              aria-label={`Call Rohit Verma at ${contactConfig.phoneDisplay}`}
              className="bg-bg-secondary border border-border-color hover:border-accent-primary text-text-primary hover:text-accent-primary font-bold px-8 py-4 rounded-full flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Phone className="w-5 h-5 text-accent-primary" />
              Call {contactConfig.phoneDisplay}
            </a>
            <a
              href={contactConfig.emailHref}
              aria-label={`Email Rohit Verma at ${contactConfig.emailDisplay}`}
              className="bg-bg-secondary border border-border-color hover:border-accent-primary text-text-primary hover:text-accent-primary font-bold px-8 py-4 rounded-full flex items-center gap-2 transition-colors cursor-pointer contact-email"
            >
              <Mail className="w-5 h-5 text-accent-primary" />
              Email {contactConfig.emailDisplay}
            </a>
            <a
              href={WHATSAPP_BUSINESS_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact Rohit Verma on WhatsApp Business"
              className="bg-accent-primary hover:bg-accent-secondary text-white font-bold px-8 py-4 rounded-full flex items-center gap-2 shadow-lg hover:shadow-[0_12px_32px_var(--shadow-color)] transition-transform active:scale-95 cursor-pointer"
            >
              <MessageSquare className="w-5 h-5 fill-current" />
              WhatsApp Now
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
