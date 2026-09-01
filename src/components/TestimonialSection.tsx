import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { TESTIMONIALS_DATA } from '../data';
import { useSiteConfig } from '../context/SiteConfigContext';

export default function TestimonialSection() {
  const { activeConfig } = useSiteConfig();
  const testimonials = (activeConfig?.testimonials && activeConfig.testimonials.length > 0)
    ? activeConfig.testimonials
    : TESTIMONIALS_DATA;

  const [activeIdx, setActiveIdx] = useState(0);

  const handlePrev = () => {
    setActiveIdx((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % testimonials.length);
  };

  // Autoplay Testimonial
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const activeTestimonial = testimonials[activeIdx % testimonials.length];

  return (
    <section className="py-24 bg-bg-primary relative overflow-hidden transition-colors duration-300" id="testimonials">
      {/* Decorative radial glows */}
      <div className="absolute top-1/2 -right-48 w-96 h-96 rounded-full bg-accent-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/2 -left-48 w-96 h-96 rounded-full bg-accent-secondary/5 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16" id="testimonials-header">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-accent-primary font-bold text-xs uppercase tracking-widest bg-accent-primary/10 px-3 py-1.5 rounded-full inline-block mb-4"
          >
            Testimonials
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight"
          >
            What Clients Say
          </motion.h2>
        </div>

        {/* Testimonial Slider Main Card */}
        <div className="relative" id="testimonial-slider-box">
          <AnimatePresence mode="wait">
            {activeTestimonial && (
              <motion.div
                key={activeTestimonial.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="bg-bg-card border border-border-color rounded-3xl p-8 md:p-12 shadow-xl relative"
                id={`testimonial-card-${activeTestimonial.id}`}
              >
                {/* Large Background Quote Icon */}
                <Quote className="absolute right-8 top-8 w-24 h-24 text-text-muted/10 pointer-events-none stroke-[1.5]" />

                {/* Stars Rating Row */}
                <div className="flex items-center gap-1 mb-6 text-accent-primary" id="testimonial-stars">
                  {Array.from({ length: activeTestimonial.rating }).map((_, sIdx) => (
                    <Star key={sIdx} className="w-5 h-5 fill-accent-primary" />
                  ))}
                </div>

                {/* Testimonial Feedback Text */}
                <blockquote className="text-text-primary text-lg md:text-xl font-medium leading-relaxed italic mb-8 relative z-10">
                  “{activeTestimonial.feedback}”
                </blockquote>

                {/* Client Profile Details Section */}
                <div className="flex items-center gap-4 border-t border-border-color pt-6" id="testimonial-client-profile">
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-border-color flex-shrink-0">
                    <img
                      src={activeTestimonial.image}
                      alt={activeTestimonial.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="text-text-primary font-bold text-base">{activeTestimonial.name}</h4>
                    <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider block mt-0.5">
                      {activeTestimonial.role} at <span className="text-accent-primary font-bold">{activeTestimonial.company}</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Testimonial Controls (Dots + Left/Right Chevrons) */}
          <div className="flex items-center justify-between mt-6" id="testimonial-slider-controls">
            {/* Dots */}
            <div className="flex items-center gap-2" id="testimonial-dots">
              {testimonials.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => setActiveIdx(dotIdx)}
                  className={`h-2.5 rounded-full transition-all duration-300 min-h-[20px] py-1 flex items-center justify-center cursor-pointer ${
                    (activeIdx % testimonials.length) === dotIdx ? 'w-8 bg-accent-primary' : 'w-2.5 bg-text-secondary/20'
                  }`}
                  aria-label={`Go to testimonial ${dotIdx + 1}`}
                />
              ))}
            </div>

            {/* Chevrons - 44x44px Touch Targets */}
            <div className="flex gap-2.5" id="testimonial-slider-arrows">
              <button
                onClick={handlePrev}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-bg-card border border-border-color text-text-secondary hover:text-accent-primary hover:border-accent-primary flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs"
                id="testimonial-prev-arrow"
                aria-label="Previous Testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-bg-card border border-border-color text-text-secondary hover:text-accent-primary hover:border-accent-primary flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs"
                id="testimonial-next-arrow"
                aria-label="Next Testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
