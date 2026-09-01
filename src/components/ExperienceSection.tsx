import { motion } from 'motion/react';
import { ExternalLink, Calendar } from 'lucide-react';
import { EXPERIENCE_DATA } from '../data';

export default function ExperienceSection() {
  return (
    <section id="experience" className="py-24 bg-bg-primary relative overflow-hidden transition-colors duration-300">
      {/* Background radial glows */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-accent-primary/4 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16" id="experience-header">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-accent-primary font-bold text-xs uppercase tracking-widest bg-accent-primary/10 px-3 py-1.5 rounded-full inline-block mb-4"
          >
            My Timeline
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight mb-4"
          >
            My Work Experience
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-text-secondary text-base md:text-lg leading-relaxed"
          >
            A narrative of persistent learning, commercial collaborations, and professional creativity spanning graphic design, video editing, and digital marketing.
          </motion.p>
        </div>

        {/* Experience Cards Stack */}
        <div className="space-y-6" id="experience-timeline-stack">
          {EXPERIENCE_DATA.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ x: 6, transition: { duration: 0.2 } }}
              className="bg-bg-card border border-border-color hover:border-accent-primary/40 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row md:items-start justify-between gap-6 transition-all duration-300 relative group shadow-sm hover:shadow-lg"
              id={`experience-card-${exp.id}`}
            >
              {/* Main Content: Job role, organization, dates & responsibilities */}
              <div className="flex-1" id={`exp-body-${exp.id}`}>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="text-xl font-bold text-text-primary group-hover:text-accent-primary transition-colors duration-200">
                    {exp.role}
                  </h3>
                  <span className="text-xs text-accent-primary font-semibold bg-accent-primary/10 px-3 py-1 rounded-full border border-accent-primary/15 max-w-full break-words">
                    {exp.company}
                  </span>
                </div>

                {/* Employment / Internship Dates */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary mb-3">
                  <Calendar className="w-3.5 h-3.5 text-accent-primary flex-shrink-0" />
                  <span>{exp.year}</span>
                </div>

                {/* Relevant Responsibilities */}
                {exp.responsibilities && exp.responsibilities.length > 0 ? (
                  <ul className="space-y-1.5 mt-3 text-text-secondary text-sm leading-relaxed">
                    {exp.responsibilities.map((resp, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-2">
                        <span className="text-accent-primary font-bold text-sm leading-snug select-none">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                ) : exp.description ? (
                  <p className="text-text-secondary text-sm leading-relaxed max-w-xl">
                    {exp.description}
                  </p>
                ) : null}
              </div>

              {/* Right: Visit Organization Link (only if verified URL exists) */}
              {exp.link && (
                <div className="flex items-center md:justify-end md:self-center flex-shrink-0" id={`exp-actions-${exp.id}`}>
                  <a
                    href={exp.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-bg-primary hover:bg-accent-primary hover:text-white text-text-secondary font-bold text-xs px-5 py-3 rounded-full border border-border-color transition-all duration-300"
                    id={`exp-link-${exp.id}`}
                  >
                    Visit Organization
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
