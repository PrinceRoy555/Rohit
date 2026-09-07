import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Trophy, Users, Briefcase, Zap } from 'lucide-react';
import creativeWorkspaceImg from '../assets/images/creative_workspace_1784367651312.jpg';
import { useSiteConfig } from '../context/SiteConfigContext';

interface CounterProps {
  value: number;
  suffix?: string;
  duration?: number;
}

function AnimatedCounter({ value, suffix = '', duration = 1500 }: CounterProps) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const end = value;
    if (start === end) return;

    const totalSteps = 50;
    const increment = end / totalSteps;
    const stepTime = duration / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isVisible, value, duration]);

  return (
    <span ref={elementRef} className="text-2xl sm:text-3xl font-bold text-accent-primary tabular-nums tracking-tight" id={`counter-${value}`}>
      {count}
      {suffix}
    </span>
  );
}

interface AboutSectionProps {
  onNavigate?: (routeId: string) => void;
}

export default function AboutSection({ onNavigate }: AboutSectionProps = {}) {
  const { activeConfig } = useSiteConfig();
  const branding = activeConfig?.branding;

  const years = branding?.yearsExperience ? parseInt(branding.yearsExperience, 10) || 5 : 5;
  const projects = branding?.projectsCompleted ? parseInt(branding.projectsCompleted, 10) || 150 : 150;
  const clients = branding?.satisfiedClients ? parseInt(branding.satisfiedClients, 10) || 110 : 110;

  const achievements = [
    { label: 'Years of Experience', value: years, suffix: '+', icon: Briefcase, color: 'var(--accent-primary)' },
    { label: 'Projects Completed', value: projects, suffix: '+', icon: Trophy, color: 'var(--accent-primary)' },
    { label: 'Happy Clients', value: clients, suffix: '+', icon: Users, color: 'var(--accent-primary)' },
    { label: 'Creative Tools', value: 50, suffix: '+', icon: Zap, color: 'var(--accent-primary)' },
  ];

  const handleNavigateToAbout = () => {
    if (onNavigate) {
      onNavigate('about-rohit');
    } else {
      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', '/about-rohit');
        window.dispatchEvent(new Event('popstate'));
      } else {
        window.location.hash = 'about-rohit';
      }
    }
  };

  return (
    <section id="about" className="py-16 sm:py-24 bg-bg-secondary relative overflow-hidden transition-colors duration-300">
      {/* Background soft lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-primary/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-16 items-center">
          
          {/* Left: Professional Image / Workspace Illustration */}
          <div className="lg:col-span-5" id="about-left-image">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-border-color group shadow-lg"
              id="about-image-wrapper"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/80 via-transparent to-transparent z-10" />
              <img
                src={creativeWorkspaceImg}
                alt="Creative Workspace Illustration"
                width="600"
                height="450"
                loading="lazy"
                decoding="async"
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              
              {/* Floating accent block */}
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 bg-bg-card/90 backdrop-blur-md border border-border-color p-3.5 sm:p-5 rounded-xl sm:rounded-2xl z-20 shadow-2xl">
                <p className="text-text-primary font-medium text-xs sm:text-sm">
                  “Design is not just what it looks like and feels like. Design is how it works.”
                </p>
                <span className="text-accent-primary text-[10px] sm:text-xs font-semibold block mt-1.5 sm:mt-2">— Steve Jobs</span>
              </div>
            </motion.div>
          </div>

          {/* Right: Text and Achievement Counters */}
          <div className="lg:col-span-7 flex flex-col justify-center" id="about-right-text">
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-accent-primary font-semibold text-xs tracking-widest uppercase mb-2 sm:mb-3"
            >
              Introduction
            </motion.span>
            
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl font-extrabold text-text-primary leading-tight mb-4 sm:mb-6"
              id="about-heading"
            >
              About Rohit
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-text-secondary text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8 font-medium"
            >
              Rohit Verma is a Jaipur-based Graphic Designer, Video Editor, Brand Strategist and Founder of Unicivix Solutions, with more than five years of experience in creative and digital services.
            </motion.p>

              {/* Achievement Counters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8" id="about-achievements">
              {achievements.map((item, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.08 * idx }}
                  key={idx}
                  className="bg-bg-card border border-border-color p-3.5 sm:p-4 rounded-xl flex flex-col items-center text-center hover:border-border-color/90 hover:shadow-xs transition-all duration-150"
                  id={`achievement-${idx}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-accent-primary/10 text-accent-primary flex items-center justify-center mb-2.5">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <AnimatedCounter value={item.value} suffix={item.suffix} />
                  <span className="text-text-muted text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider mt-1.5">
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center"
            >
              <button
                onClick={handleNavigateToAbout}
                className="w-full sm:w-auto bg-accent-primary hover:bg-accent-secondary text-white font-semibold px-6 py-3 sm:px-7 sm:py-3.5 rounded-xl transition-all duration-150 shadow-xs active:scale-[0.98] cursor-pointer text-sm sm:text-base text-center"
                id="about-me-btn"
              >
                Know More About Me
              </button>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
}
