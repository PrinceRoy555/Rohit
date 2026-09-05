import { Project, Experience, Service, Testimonial, BlogPost, ProfileHero, ProfileIntro, QuickCard, JourneyEntry, TrainingData, SkillCategory, UnicivixSection, PhilosophyCard, AchievementCard, PortfolioCategory } from './types';
import { SERVICES_LIST } from './servicesData';

export const SERVICES_DATA: Service[] = SERVICES_LIST as Service[];

export const PORTFOLIO_CATEGORIES: PortfolioCategory[] = [
  {
    name: 'All'
  },
  {
    name: 'Graphic Design',
    image: '/images/categories/graphic-design.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80',
    alt: 'Graphic design creative work'
  },
  {
    name: 'Branding',
    image: '/images/categories/branding.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=600&q=80',
    alt: 'Brand identity design'
  },
  {
    name: 'Social Media Design',
    image: '/images/categories/social-media-design.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=600&q=80',
    alt: 'Social media design'
  },
  {
    name: 'Packaging',
    image: '/images/categories/packaging.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    alt: 'Packaging design'
  },
  {
    name: 'Print Design',
    image: '/images/categories/print-design.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    alt: 'Print design'
  },
  {
    name: 'Marketing Design',
    image: '/images/categories/marketing-design.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80',
    alt: 'Marketing design'
  },
  {
    name: 'Thumbnail Design',
    image: '/images/categories/thumbnail-design.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=600&q=80',
    alt: 'YouTube thumbnail design'
  },
  {
    name: 'Video Editing',
    image: '/images/categories/video-editing.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80',
    alt: 'Video editing'
  },
  {
    name: 'Motion Graphics',
    image: '/images/categories/motion-graphics.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    alt: 'Motion graphics design'
  },
  {
    name: 'UI/UX Design',
    image: '/images/categories/ui-ux-design.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80',
    alt: 'UI UX design'
  }
];

export const EXPERIENCE_DATA: Experience[] = [
  {
    id: 'exp-hodu',
    year: 'May 2024 – Present',
    role: 'Graphic Designer & Video Editor',
    company: 'Hodu Academy',
    responsibilities: [
      'Graphic design and visual content creation',
      'Social media creatives, thumbnails and promotional materials',
      'Video editing and motion graphics',
      'Supporting digital content and marketing activities'
    ],
    link: 'https://hoduacademy.com'
  },
  {
    id: 'exp-cbt',
    year: 'May 2023 – April 2024',
    role: 'Graphic Designer / Video Editor',
    company: 'Center for Business & Technology (CBT)',
    responsibilities: [
      'Designed digital and marketing creatives',
      'Created social media posts, banners and promotional content',
      'Edited videos and other visual content'
    ],
    link: 'https://cbt.ind.in/'
  },
  {
    id: 'exp-cbt-intern',
    year: 'February 2024 – April 2024 | 3 Months',
    role: 'Graphic Design & Video Editing Intern',
    company: 'Center for Business & Technology (CBT)',
    responsibilities: [
      'Graphic design and video editing internship'
    ]
  }
];

export const PROJECTS_DATA: Project[] = [
  {
    id: 'p1',
    title: 'Creative Portfolio 2026',
    category: 'Graphic Design',
    image: '/images/creative-portfolio-cover.jpg',
    fallbackImage: 'https://lh3.googleusercontent.com/d/18xe8PYnr3fu4LL8KA3z8Jl-SXKdF9PNo=w1600',
    description: 'A curated collection of professional graphic design projects created across branding, social media, marketing, print, packaging, and digital platforms. Each project focuses on strong visual communication, creative composition, consistent brand identity, and practical design solutions tailored to real-world business needs.',
    tools: [
      'Adobe Photoshop',
      'Adobe Illustrator',
      'CorelDRAW',
      'Canva',
      'Figma',
      'Adobe Firefly'
    ],
    client: 'Creative Portfolio',
    date: '2026',
    link: 'https://www.behance.net/gallery/254351431/Rohit-Verma-Creative-Portfolio-2026',
    details: 'A curated collection of professional graphic design projects created across branding, social media, marketing, print, packaging, and digital platforms. Each project focuses on strong visual communication, creative composition, consistent brand identity, and practical design solutions tailored to real-world business needs.'
  },
  {
    id: 'p2',
    title: 'Brand Identity & Visual System',
    category: 'Branding',
    image: 'https://picsum.photos/seed/brand-system/800/600',
    description: 'Comprehensive brand identity system including logo design, color typography standards, stationery collateral, and digital asset guidelines.',
    tools: ['Adobe Illustrator', 'Adobe Photoshop', 'Figma'],
    client: 'Unicivix Creative Lab',
    date: '2025',
    link: 'https://www.behance.net/gallery/254351431/Rohit-Verma-Creative-Portfolio-2026',
    details: 'Crafted an end-to-end visual identity language with high-contrast color palettes, custom logo geometry, typographic pairing scales, and adaptable brand asset templates.'
  },
  {
    id: 'p3',
    title: 'Hodu Academy Social Media Campaign',
    category: 'Social Media Design',
    image: 'https://picsum.photos/seed/hodu-social/800/600',
    description: 'An expansive visual design system for educational social channels, including custom templates, curated carousels, and highly-stylized informational graphics.',
    tools: ['Adobe Photoshop', 'Canva', 'Adobe Illustrator'],
    client: 'Hodu Academy, Jaipur',
    date: 'February 2024',
    link: 'https://www.behance.net/gallery/254351431/Rohit-Verma-Creative-Portfolio-2026',
    details: 'Created over 50 custom carousel posts, educational guides, and modern visual layouts that resulted in a 45% increase in organic user engagement over three months.'
  },
  {
    id: 'p4',
    title: 'Modern Product Packaging & Label Design',
    category: 'Packaging',
    image: 'https://picsum.photos/seed/packaging-box/800/600',
    description: 'Retail packaging and custom die-cut label design engineered with crisp typographic hierarchy and print-ready CMYK specifications.',
    tools: ['Adobe Illustrator', 'Adobe Photoshop', 'CorelDRAW'],
    client: 'Organic Naturals',
    date: '2025',
    link: 'https://www.behance.net/gallery/254351431/Rohit-Verma-Creative-Portfolio-2026',
    details: 'Designed premium eco-friendly box packaging and bottle labels with spot UV finishes, embossed accents, and compliant regulatory layout grids.'
  },
  {
    id: 'p5',
    title: 'Corporate Print Collateral & Brochures',
    category: 'Print Design',
    image: 'https://picsum.photos/seed/print-collateral/800/600',
    description: 'Bifold brochures, exhibition flyers, and large format corporate banners designed with high-resolution vector precision.',
    tools: ['CorelDRAW', 'Adobe Illustrator', 'Adobe Photoshop'],
    client: 'CBT Industrial Expo',
    date: '2024',
    link: 'https://www.behance.net/gallery/254351431/Rohit-Verma-Creative-Portfolio-2026',
    details: 'Delivered complete print-ready publication suites including multi-page brochures, event roll-up standees, and promotional posters for commercial exhibits.'
  },
  {
    id: 'p6',
    title: 'Digital Marketing & Conversion Ads',
    category: 'Marketing Design',
    image: 'https://picsum.photos/seed/marketing-ads/800/600',
    description: 'High-converting display ad banners, promotional story ads, and sales landing graphics optimized for targeted marketing funnels.',
    tools: ['Adobe Photoshop', 'Canva', 'Adobe Firefly'],
    client: 'Growth Media Group',
    date: '2025',
    link: 'https://www.behance.net/gallery/254351431/Rohit-Verma-Creative-Portfolio-2026',
    details: 'Crafted structured marketing visual assets with high-contrast call-to-actions, psychological focal points, and A/B tested creative variants.'
  },
  {
    id: 'p7',
    title: 'High-CTR YouTube Thumbnails',
    category: 'Thumbnail Design',
    image: '/images/youtube-thumbnail-portfolio.png',
    fallbackImage: 'https://lh3.googleusercontent.com/d/1voCLZkaqF_ROVJ-eK9kO9H_5DXn5F1NH=w1600',
    description: 'Custom YouTube thumbnails featuring expressive cutouts, vivid lighting rim-effects, bold hooks, and optimized visual hierarchy.',
    tools: ['Adobe Photoshop', 'Adobe Firefly'],
    client: 'EduTech Creator Hub',
    date: '2025',
    link: 'https://www.behance.net/gallery/254359065/Thumbnail-Design',
    details: 'Designed scroll-stopping thumbnails with color psychology, facial expressions, and dynamic typography resulting in higher click-through rates across video channels.'
  },
  {
    id: 'p8',
    title: 'Commercial Promotional Video',
    category: 'Video Editing',
    image: '/images/commercial-promotional-video.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    description: 'A dynamic, high-pacing promotion video featuring engaging typography overlays, visual graphics, sound design, and custom audio mixing to maximize user conversion.',
    tools: ['Adobe Premiere Pro', 'Adobe After Effects', 'Audition'],
    client: 'Hodu Academy, Jaipur',
    date: 'December 2024',
    link: 'https://www.behance.net/gallery/254351431/Rohit-Verma-Creative-Portfolio-2026',
    details: 'A commercial advertisement video featuring rapid-fire cuts, rhythmic sound effects, kinetic typography, and expert color-correction.'
  },
  {
    id: 'p9',
    title: 'Kinetic Motion Graphics & Visual Effects',
    category: 'Motion Graphics',
    image: 'https://picsum.photos/seed/motion-promo/800/600',
    description: 'A futuristic promotional animation leveraging custom sound synchronization, smooth vector shape transitions, and 3D camera effects in After Effects.',
    tools: ['Adobe After Effects', 'Adobe Illustrator', 'Photoshop'],
    client: 'Creative Tech Lab',
    date: 'January 2025',
    link: 'https://www.behance.net/gallery/254351431/Rohit-Verma-Creative-Portfolio-2026',
    details: 'High-end motion graphics with glowing HUD overlays, complex shape layer transitions, particle effects, and precise sound design.'
  },
  {
    id: 'p10',
    title: 'Creative Portfolio UI/UX System',
    category: 'UI/UX Design',
    image: 'https://picsum.photos/seed/portfolio-web/800/600',
    description: 'A premium dark-themed custom user interface design and responsive layout built for creative professionals to showcase artwork, experiences, and packages elegantly.',
    tools: ['Figma', 'React.js', 'Tailwind CSS', 'TypeScript'],
    client: 'Unicivix Solutions',
    date: '2026',
    link: 'https://www.behance.net/gallery/254351431/Rohit-Verma-Creative-Portfolio-2026',
    details: 'A polished digital experience designed with responsive grids, fluid micro-interactions, dark aesthetic backdrops, and seamless project intake workflows.'
  }
];

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: 't1',
    name: 'Suresh Sharma',
    role: 'Director of Marketing',
    company: 'Hodu Academy, Jaipur',
    image: 'https://picsum.photos/seed/suresh/200/200',
    rating: 5,
    feedback: 'Rohit is an exceptionally talented designer. His unique ability to combine striking graphic designs with smooth, engaging motion graphics transformed our promotional campaigns. His dedication to quality, prompt communication, and technical expertise make him a key asset to our media pipeline.'
  },
  {
    id: 't2',
    name: 'Vikram Aditya',
    role: 'Founder',
    company: 'Creative Portfolio',
    image: 'https://picsum.photos/seed/vikram/200/200',
    rating: 5,
    feedback: 'Working with Rohit on our brand identity was an absolute breeze. He understood our vision instantly and developed a highly polished, premium logo and styling guidelines that our customers constantly compliment us on. He is efficient, responsive, and highly professional.'
  },
  {
    id: 't3',
    name: 'Nisha Vardhan',
    role: 'Creative Lead',
    company: 'Vibe Media Solutions',
    image: 'https://picsum.photos/seed/nisha/200/200',
    rating: 5,
    feedback: 'Rohit\'s video editing and motion graphics skills are world-class. He produced multiple social media promotional reels for us, keeping user retention rates higher than any visual asset we have used prior. His eye for timing, modern pacing, and kinetic transitions is incredible.'
  }
];

export const BLOG_DATA: BlogPost[] = [
  {
    id: 'b1',
    title: 'How AI Is Changing Graphic Design Workflows',
    excerpt: 'Explore how modern generative AI tools are assisting artists in rapid concept drafting, asset synthesis, and scaling creativity without losing original artistic direction.',
    content: `The intersection of design and artificial intelligence is no longer a futuristic concept—it is a daily reality for modern creators. As graphic designers, video editors, and motion artists, our toolkits are expanding at an unprecedented rate. Rather than replacing the artist, generative AI is serving as a powerful co-pilot.

In this deep dive, we explore how professional designers are integrating AI tools into their everyday pipelines:

### 1. Rapid Ideation and Moodboarding
Traditionally, setting up a moodboard or custom style guide took days of searching stock sites and compiling visual assets. With AI tools like Midjourney and Adobe Firefly, we can generate unique, specific aesthetic concepts in minutes by describing lighting, colors, and layouts.

### 2. Smart Upscaling and Detail Enhancement
Working with lower-resolution client files is a constant pain point. Modern neural filters and AI-powered upscalers enable designers to restore textures, sharpen vector contours, and upscale imagery for premium printing formats without losing crispness.

### 3. Automated Asset Generation
Creating dozens of secondary assets—such as custom leaves, background patterns, or particle effects—can now be done in seconds. This allows designers to spend less time on repetitive manual work and focus on the primary layout, user flows, and brand storytelling.

### Conclusion
The true differentiator in the age of AI remains human taste, strategic thinking, and layout craft. By embracing generative pipelines, we do not surrender our artistry; we elevate our creative velocity and deliver higher-value design systems to our clients.`,
    category: 'AI Design',
    image: 'https://picsum.photos/seed/blog-ai/800/500',
    date: 'June 12, 2026',
    readTime: '5 min read',
    author: 'Rohit Verma',
    tags: ['AI Tools', 'Workflow', 'Future of Design']
  },
  {
    id: 'b2',
    title: 'Five Ways to Make Social Media Creatives More Engaging',
    excerpt: 'Uncover the visual secrets behind high-engagement social posts, focusing on visual hierarchy, contrast, typographic rhythm, and direct user actions.',
    content: `In a world of infinite digital feeds, the average user's attention span is less than three seconds. This means your social media creatives must stop the scroll instantly. Achieving high engagement rates requires a combination of behavioral psychology and strong visual principles.

Here are five proven techniques to elevate your social media design:

### 1. Establish a Strong Visual Anchor
Every creative should have one central element that captures the eye first. This could be a bold, high-contrast headline, an expressive human face, or a striking graphic cutout. Avoid cluttering the design with multiple elements competing for attention.

### 2. Implement the 60-30-10 Color Rule
Color is the most immediate emotional signal. Use:
* **60% Dominant Color**: Typically your background (dark slate, charcoal, or off-white) to set the mood.
* **30% Secondary Color**: Supporting elements, text, or shapes.
* **10% Accent Color**: A high-impact bright shade (like crimson red) reserved strictly for call-to-actions, badges, or crucial keywords.

### 3. Use Typographic Rhythm and Contrast
Never make all text the same size or weight. Combine an extra-bold geometric sans-serif for the main hook with a clean, light-weight secondary font. Ensure your headlines are large, readable, and use "clamp()" or responsive values to look pristine on mobile.

### 4. Create Curated Carousels for Swipe Value
Carousels perform exceptionally well because they encourage active interaction. Create continuous layouts where elements visually bridge from one slide to the next, enticing the user to keep swiping.

### 5. Incorporate Human Faces and Social Proof
Designs featuring real people, clear expressions, and direct gazes create a sense of trust and connection. Add small visual badges representing ratings or client achievements to quickly establish authority.`,
    category: 'Social Media',
    image: 'https://picsum.photos/seed/blog-social/800/500',
    date: 'April 28, 2026',
    readTime: '4 min read',
    author: 'Rohit Verma',
    tags: ['Graphic Design', 'Social Media', 'Engagement']
  },
  {
    id: 'b3',
    title: 'Why Motion Graphics Improve Brand Communication',
    excerpt: 'Learn why animation, micro-interactions, and kinetic typography enhance retention, explain complex ideas faster, and lift advertising conversions.',
    content: `Static images tell a story, but motion graphics bring that story to life. As attention moves increasingly toward short-form video on channels like Instagram Reels and YouTube Shorts, brands that fail to incorporate motion are getting left behind.

Let's dissect why motion graphics are an absolute necessity for modern brand communication:

### 1. Complex Concepts, Simplified
Explaining a software feature, financial workflow, or abstract system in a single image or paragraph is challenging. Animated explainer videos use kinetic typography and visual metaphors to explain highly complex systems in a matter of seconds, making information digestible.

### 2. Significantly Higher Retention Rates
The human brain is naturally wired to detect motion. A moving graphic is far more effective at capturing and holding visual attention than static creatives. This increased retention translates directly to longer brand exposure and better message recall.

### 3. Cinematic Aesthetic and Premium Vibe
Well-crafted vector animations, fluid easing, and custom sound designs immediately convey professional quality. It shows that a brand pays attention to details and is willing to invest in premium experiences, instantly boosting perceived value.

### 4. Direct Impact on Ad Conversion
Data across marketing campaigns shows that animated advertisements consistently outperform static banners in Click-Through Rates (CTR). A kinetic call-to-action or animated product mockup can drive more clicks and inquiries for the same advertising spend.

### Summary
Motion is no longer a luxury decoration—it is an essential storytelling asset. Integrating motion graphics into your digital marketing mix ensures your voice is heard, understood, and remembered in a crowded marketplace.`,
    category: 'Motion Graphics',
    image: 'https://picsum.photos/seed/blog-motion/800/500',
    date: 'February 15, 2026',
    readTime: '6 min read',
    author: 'Rohit Verma',
    tags: ['Motion Graphics', 'After Effects', 'Branding']
  }
];

export const PROFILE_HERO: ProfileHero = {
  label: 'About Me',
  title: 'Designer, Marketer and Creative Entrepreneur',
  subtitle: 'Discover the professional journey, creative expertise and entrepreneurial vision of Rohit Verma.',
  image: '/images/rohit-verma-portrait.jpg'
};

export const PROFILE_INTRO: ProfileIntro = {
  title: 'Meet Rohit Verma',
  content1: 'Rohit Verma is a Graphic Designer, Video Editor and Social Media Specialist based in Jaipur, Rajasthan. With more than five years of professional experience, he has worked across graphic design, branding, video editing, social media management, creative strategy and client communication.',
  content2: 'His work combines creativity with practical marketing strategies to help businesses improve their communication, establish strong identities and build a professional digital presence.',
  image: '/src/assets/images/creative_workspace_1784367651312.jpg',
  signature: 'Rohit Verma',
  designation: 'Founder – Unicivix Solutions'
};

export const SOCIAL_LINKS = [
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/rohit-verma-487457374',
    label: 'Rohit Verma on LinkedIn',
    icon: 'Linkedin'
  },
  {
    name: 'GitHub',
    url: 'https://github.com/PrinceRoy555',
    label: 'Rohit Verma on GitHub',
    icon: 'Github'
  },
  {
    name: 'Instagram (Design)',
    url: 'https://www.instagram.com/thedesigngeek.rohit/',
    label: 'Rohit Verma Design Instagram',
    icon: 'Instagram'
  },
  {
    name: 'Instagram (Personal)',
    url: 'https://www.instagram.com/the1rohit__/',
    label: 'Rohit Verma Personal Instagram',
    icon: 'Instagram'
  },
  {
    name: 'Instagram (Unicivix)',
    url: 'https://www.instagram.com/unicivix_solutions/',
    label: 'Unicivix Solutions on Instagram',
    icon: 'Instagram'
  }
];

export const QUICK_CARDS: QuickCard[] = [
  { title: 'Location', value: 'Jaipur, Rajasthan, India', icon: 'MapPin' },
  { title: 'Experience', value: '5+ Years', icon: 'Briefcase' },
  { title: 'Current Role', value: 'Founder of Unicivix Solutions', icon: 'Award' },
  { title: 'Professional Fields', value: 'Graphic Design, Video Editing and Social Media', icon: 'ShieldCheck' },
  { title: 'Training', value: 'Red Sketch Commercial Art Academy and Studio', icon: 'GraduationCap' },
  { title: 'Specialisation', value: 'Graphic Design, Video Editing & Brand Identity', icon: 'Compass' }
];

export const PROFILE_SUMMARY = {
  title: 'Professional Summary',
  biography: `Rohit Verma is a Graphic Designer, Video Editor and Social Media Specialist based in Jaipur, Rajasthan. He has more than five years of experience in graphic design, branding, video editing, social media management and creative direction.

He began his professional journey as a Freelance Graphic Designer, working with various clients and businesses for nine months. During this period, he gained practical experience in understanding client requirements, creating social media graphics, developing promotional designs and delivering visual communication solutions.

He later joined the Center for Business and Technology, commonly referred to as CBT, where he worked for one year and five months. At CBT, he worked across business development, client communication and creative design. This experience helped him develop a strong understanding of both creative production and brand growth.

After CBT, Rohit worked at Hodu Academy for one year. He contributed to graphic design, promotional campaigns, social media content, marketing creatives and visual storytelling for the organisation.

Rohit completed professional training in Graphic Designing and Video Editing from Red Sketch Commercial Art Academy and Studio. He has practical expertise in Adobe Photoshop, Adobe Illustrator, CorelDRAW, Adobe After Effects, branding, logo design, social media creatives, motion graphics and professional video editing.

Currently, Rohit is the Founder of Unicivix Solutions, a creative agency providing graphic design, brand identity design, video editing, social media management, and vibe coding solutions.

His mission is to help businesses create strong brands, communicate effectively and grow their online presence through creative and result-driven digital solutions.`
};

export const PROFILE_JOURNEY: JourneyEntry[] = [
  {
    role: 'Freelance Graphic Designer',
    duration: '9 Months',
    organisation: 'Independent Clients and Businesses',
    description: 'Rohit started his professional career as a Freelance Graphic Designer. He worked with different clients and businesses, creating promotional designs, social media graphics, branding materials and marketing creatives.',
    keyExperience: [
      'Client requirement analysis',
      'Graphic design',
      'Branding materials',
      'Social media creatives',
      'Project delivery',
      'Client communication'
    ]
  },
  {
    role: 'Creative Designer and Business Development Professional',
    duration: '1 Year 5 Months',
    organisation: 'Center for Business and Technology – CBT',
    description: 'At CBT, Rohit worked across business development, marketing, client communication and creative design. The role allowed him to understand how creative work supports sales, customer engagement and business growth.',
    keyExperience: [
      'Business development',
      'Marketing',
      'Client communication',
      'Promotional design',
      'Creative strategy',
      'Brand communication'
    ]
  },
  {
    role: 'Graphic Designer and Digital Marketing Professional',
    duration: '1 Year',
    organisation: 'Hodu Academy',
    description: 'At Hodu Academy, Rohit contributed to graphic design, promotional campaigns, social media content, educational creatives, video content and digital marketing activities.',
    keyExperience: [
      'Educational campaign design',
      'Social media creatives',
      'Promotional videos',
      'Digital marketing',
      'Advertising designs',
      'Brand consistency'
    ]
  },
  {
    role: 'Founder',
    duration: 'Present',
    organisation: 'Unicivix Solutions',
    description: 'Rohit founded Unicivix Solutions to offer complete creative, branding and digital growth services to businesses. He currently manages creative direction, client communication, business development, digital strategy and project execution.',
    keyExperience: [
      'Creative direction',
      'Business development',
      'Client management',
      'Branding strategy',
      'Digital marketing',
      'Team and project management',
      'Agency growth'
    ]
  }
];

export const PROFILE_TRAINING: TrainingData = {
  institute: 'Red Sketch Commercial Art Academy and Studio',
  programme: 'Graphic Designing and Video Editing',
  description: 'Rohit completed professional and practical training in graphic design, commercial art, visual communication, video editing and creative software.',
  learningAreas: [
    'Adobe Photoshop',
    'Adobe Illustrator',
    'CorelDRAW',
    'Adobe After Effects',
    'Graphic Designing',
    'Video Editing',
    'Motion Graphics',
    'Commercial Art',
    'Branding',
    'Visual Communication'
  ]
};

export const SKILLS_CATEGORIES: SkillCategory[] = [
  {
    title: 'Graphic Design',
    skills: [
      'Adobe Photoshop',
      'Adobe Illustrator',
      'CorelDRAW',
      'Social Media Creatives',
      'Advertising Design',
      'Marketing Collateral'
    ]
  },
  {
    title: 'Branding',
    skills: [
      'Logo Design',
      'Brand Identity',
      'Visual Identity',
      'Brand Communication',
      'Promotional Branding'
    ]
  },
  {
    title: 'Video',
    skills: [
      'Video Editing',
      'Adobe After Effects',
      'Motion Graphics',
      'Social Media Reels',
      'Promotional Videos',
      'Advertisement Videos'
    ]
  },
  {
    title: 'Digital Marketing',
    skills: [
      'Digital Marketing',
      'Social Media Marketing',
      'Social Media Management',
      'Content Planning',
      'Advertising Campaigns',
      'SEO'
    ]
  },
  {
    title: 'Business',
    skills: [
      'Business Development',
      'Client Communication',
      'Project Management',
      'Creative Strategy',
      'Client Relationship Management'
    ]
  }
];

export const UNICIVIX_DATA: UnicivixSection = {
  title: 'From Creative Professional to Agency Founder',
  heading: 'Founder of Unicivix Solutions',
  description: 'Unicivix Solutions is a creative and digital agency founded by Rohit Verma. The agency helps businesses create professional identities, engaging visual content and result-oriented digital marketing strategies.\n\nThrough Unicivix Solutions, Rohit provides complete creative and digital services, from graphic design and branding to website development, SEO and advertising.',
  services: [
    'Graphic Design',
    'Brand Identity Design',
    'Video Editing',
    'Motion Graphics',
    'Social Media Management',
    'UI/UX Design',
    'Vibe Coding'
  ],
  mission: 'To help businesses build strong brands and grow their online presence through creative, strategic and result-driven digital solutions.'
};

export const WORK_PHILOSOPHIES: PhilosophyCard[] = [
  {
    title: 'Creativity with Purpose',
    description: 'Every design should communicate a clear message and support a business objective.'
  },
  {
    title: 'Understanding the Client',
    description: 'Successful projects begin with understanding the client’s vision, audience and goals.'
  },
  {
    title: 'Quality and Consistency',
    description: 'Strong branding requires professional quality and consistent communication across every platform.'
  },
  {
    title: 'Result-Driven Solutions',
    description: 'Creative work should not only look good—it should improve visibility, engagement and growth.'
  }
];

export const WHY_WORK_POINTS: string[] = [
  'More than five years of creative and marketing experience',
  'Combined understanding of design, marketing and business development',
  'Experience working with clients, companies and educational organisations',
  'Complete creative and digital service capabilities',
  'Professional knowledge of industry-standard design software',
  'Direct involvement in every project',
  'Clear communication and timely project coordination',
  'Result-oriented approach',
  'Founder-led creative service experience'
];

export const ACHIEVEMENT_CARDS: AchievementCard[] = [
  { title: '5+ Years of Experience', subtitle: 'Creative & marketing industry', icon: 'Briefcase' },
  { title: '3 Professional Work Phases', subtitle: 'Freelance, CBT, and Hodu Academy', icon: 'Layers' },
  { title: '1 Creative Agency Founded', subtitle: 'Founder of Unicivix Solutions', icon: 'Award' },
  { title: '8+ Digital Services', subtitle: 'Across multiple digital domains', icon: 'Cpu' },
  { title: 'Multiple Creative Disciplines', subtitle: 'Design, video & digital marketing', icon: 'Palette' },
  { title: 'Jaipur-Based Creative Professional', subtitle: 'Based in Rajasthan, India', icon: 'MapPin' }
];

export const WHATSAPP_BUSINESS_URL = "https://wa.me/message/E53AXF7SH5OMI1";
export const RESUME_PDF_URL = "https://ik.imagekit.io/auhuory9w/website%20work/resume/Rohit%20Verma%20(2)%20(3).pdf";
export const RESUME_DRIVE_PREVIEW_FALLBACK = "https://ik.imagekit.io/auhuory9w/website%20work/resume/Rohit%20Verma%20(2)%20(3).pdf";
export const RESUME_FILE_NAME = "Rohit-Verma-Resume.pdf";
export const RESUME_URL = RESUME_PDF_URL;

export const contactConfig = {
  emailDisplay: "workall724038@gmail.com",
  emailHref: "mailto:workall724038@gmail.com",
  phoneDisplay: "+91 9376569027",
  phoneHref: "tel:+919376569027",
  whatsappBusinessUrl: WHATSAPP_BUSINESS_URL,
  resumePdfUrl: RESUME_PDF_URL,
  resumeDrivePreviewFallback: RESUME_DRIVE_PREVIEW_FALLBACK,
  resumeFileName: RESUME_FILE_NAME,
  resumeUrl: RESUME_PDF_URL
};

export const WHATSAPP_CONFIG = {
  phoneNumber: '919376569027',
  defaultMessage: 'Hello Rohit, I visited your portfolio and would love to discuss a project!',
  url: WHATSAPP_BUSINESS_URL
};


