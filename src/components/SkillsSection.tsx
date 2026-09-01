import React from 'react';
import { motion } from 'motion/react';
import {
  TbBrandAdobePhotoshop,
  TbBrandAdobeIllustrator,
  TbBrandAdobePremiere,
  TbBrandAdobeAfterEffect,
} from 'react-icons/tb';
import { SiFigma } from 'react-icons/si';
import { Sparkles, Flame, PenTool } from 'lucide-react';

interface Skill {
  name: string;
  percentage: number;
}

function CanvaIcon({ 'aria-hidden': ariaHidden }: { className?: string; 'aria-hidden'?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
      aria-hidden={ariaHidden}
    >
      <path d="M 18 8 C 15 5, 9 5, 6 9 C 3 13, 3 17, 7 20 C 11 23, 16 22, 19 18" />
      <circle cx="18" cy="8" r="1.5" fill="currentColor" />
      <circle cx="19" cy="18" r="1.5" fill="currentColor" />
    </svg>
  );
}

function CorelDrawIcon({ 'aria-hidden': ariaHidden }: { className?: string; 'aria-hidden'?: boolean }) {
  return (
    <div className="flex items-center justify-center w-full h-full font-black text-sm text-green-500 tracking-tighter" aria-hidden={ariaHidden}>
      <PenTool className="w-5 h-5 text-emerald-400" />
    </div>
  );
}

function FireflyIcon({ 'aria-hidden': ariaHidden }: { className?: string; 'aria-hidden'?: boolean }) {
  return (
    <div className="flex items-center justify-center w-full h-full text-amber-400" aria-hidden={ariaHidden}>
      <Flame className="w-5 h-5 text-amber-400 fill-amber-400/20" />
    </div>
  );
}

const skillIconMap: Record<string, React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>> = {
  'Adobe Photoshop': TbBrandAdobePhotoshop,
  'Adobe Illustrator': TbBrandAdobeIllustrator,
  'CorelDRAW': CorelDrawIcon,
  'Canva': CanvaIcon,
  'Figma': SiFigma,
  'Adobe Firefly': FireflyIcon,
  'Adobe Premiere Pro': TbBrandAdobePremiere,
  'Adobe After Effects': TbBrandAdobeAfterEffect,
};

const skillBadgeClassMap: Record<string, string> = {
  'Adobe Photoshop': 'skill-icon--photoshop',
  'Adobe Illustrator': 'skill-icon--illustrator',
  'CorelDRAW': 'skill-icon--canva',
  'Canva': 'skill-icon--canva',
  'Figma': 'skill-icon--figma',
  'Adobe Firefly': 'skill-icon--ai-tools',
  'Adobe Premiere Pro': 'skill-icon--premiere',
  'Adobe After Effects': 'skill-icon--after-effects',
};

const skillsList: Skill[] = [
  {
    name: 'Adobe Photoshop',
    percentage: 95,
  },
  {
    name: 'Adobe Illustrator',
    percentage: 90,
  },
  {
    name: 'CorelDRAW',
    percentage: 88,
  },
  {
    name: 'Canva',
    percentage: 95,
  },
  {
    name: 'Figma',
    percentage: 82,
  },
  {
    name: 'Adobe Firefly',
    percentage: 90,
  },
  {
    name: 'Adobe Premiere Pro',
    percentage: 92,
  },
  {
    name: 'Adobe After Effects',
    percentage: 85,
  },
];

function SkillCard({ skill, index }: { skill: Skill; index: number; key?: string }) {
  // SVG circle values
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (skill.percentage / 100) * circumference;

  const IconComponent = skillIconMap[skill.name] || Sparkles;
  const badgeClass = skillBadgeClassMap[skill.name] || 'skill-icon--ai-tools';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -8, transition: { duration: 0.25, ease: 'easeOut' } }}
      className="skill-card bg-bg-card border border-border-color hover:border-accent-primary/50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl relative flex flex-col items-center text-center transition-all duration-300 group shadow-sm hover:shadow-xl overflow-hidden"
      id={`skill-card-${index}`}
    >
      {/* Circular Animated Progress Indicator + Icon Badge */}
      <div className="relative w-20 h-20 min-[380px]:w-24 min-[380px]:h-24 sm:w-28 sm:h-28 flex items-center justify-center mb-3 sm:mb-5" id={`skill-progress-${index}`}>
        <svg viewBox="0 0 112 112" className="w-full h-full transform -rotate-90">
          {/* Background Track Circle */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            className="stroke-border-color fill-none"
            strokeWidth="5"
          />
          {/* Animated Active Progress Circle */}
          <motion.circle
            cx="56"
            cy="56"
            r={radius}
            className="fill-none stroke-accent-primary"
            strokeWidth="5"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: index * 0.08 }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>

        {/* Icon Badge Centered inside Circular Progress Ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`skill-icon-badge ${badgeClass} transform scale-90 min-[380px]:scale-100`}>
            <IconComponent aria-hidden={true} />
          </div>
        </div>
      </div>

      {/* Tool Percentage & Name with High Contrast Theme Colors */}
      <span className="text-xl sm:text-2xl font-black text-text-primary mb-0.5 sm:mb-1 tracking-tight">
        {skill.percentage}%
      </span>
      <h3 className="text-xs sm:text-sm font-bold text-text-secondary group-hover:text-accent-primary transition-colors line-clamp-1">
        {skill.name}
      </h3>
    </motion.div>
  );
}

export default function SkillsSection() {
  return (
    <section id="services-advantage" className="py-16 sm:py-24 bg-bg-primary relative overflow-hidden transition-colors duration-300">
      {/* Absolute Decorative Curved Background Lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16" id="skills-section-header">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-accent-primary font-bold text-xs uppercase tracking-widest bg-accent-primary/10 px-3 py-1.5 rounded-full inline-block mb-3 sm:mb-4"
          >
            My Advantage
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight mb-3 sm:mb-4"
          >
            Creative Technologies
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-text-secondary text-sm sm:text-base md:text-lg leading-relaxed"
          >
            The specialized industry-standard design programs and generative AI tools I leverage to translate complex visions into polished high-converting digital assets.
          </motion.p>
        </div>

        {/* Grid of Skill Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6" id="skills-grid">
          {skillsList.map((skill, index) => (
            <SkillCard key={skill.name} skill={skill} index={index} />
          ))}
        </div>

      </div>
    </section>
  );
}

