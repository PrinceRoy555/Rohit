import { ServiceCategory } from './types';
import { APPROVED_ROLES_BY_CATEGORY, ROLE_CATEGORY_DESCRIPTIONS } from './rolesData';

export interface ServiceDetailInfo {
  introduction: string;
  included: string[];
  suitableClients: string[];
  process: string[];
  tools: string[];
  deliverables: string[];
  relatedProjects?: string[];
  faqs: { question: string; answer: string }[];
}

export interface DetailedService {
  id: string;
  title: string;
  description: string;
  category: ServiceCategory;
  categories: ServiceCategory[];
  iconName: string;
  features: string[];
  isFeatured?: boolean;
  isPopular?: boolean;
  details: ServiceDetailInfo;
}

export const SERVICE_CATEGORIES: { name: ServiceCategory; description: string }[] = [
  {
    name: 'Graphic Design',
    description: ROLE_CATEGORY_DESCRIPTIONS['Graphic Design']
  },
  {
    name: 'Video Editing',
    description: ROLE_CATEGORY_DESCRIPTIONS['Video Editing']
  },
  {
    name: 'Social Media',
    description: ROLE_CATEGORY_DESCRIPTIONS['Social Media']
  },
  {
    name: 'Additional',
    description: ROLE_CATEGORY_DESCRIPTIONS['Additional']
  }
];

export const ALL_CATEGORY_FILTERS = [
  'All Services',
  'Graphic Design',
  'Video Editing',
  'Social Media',
  'Additional'
] as const;

export const FEATURED_SERVICE_TITLES = [
  'Graphic Designer',
  'Brand Identity Designer',
  'Social Media Designer',
  'Motion Graphics Designer',
  'UI/UX Designer',
  'Video Editor',
  'Social Media Manager',
  'Vibe Coder'
] as const;

export const SERVICES_LIST: DetailedService[] = [
  // ================= GRAPHIC DESIGN (16 ROLES) =================
  {
    id: 's-gd-1',
    title: 'Graphic Designer',
    description: 'High-impact visual communication, custom graphics, marketing banners, and commercial design assets tailored for modern brand awareness.',
    category: 'Graphic Design',
    categories: ['Graphic Design'],
    iconName: 'Palette',
    isFeatured: true,
    isPopular: true,
    features: ['Custom Graphic Assets', 'Creative Composition', 'Brand-Compliant Artwork', 'Fast Turnaround'],
    details: {
      introduction: 'Comprehensive graphic design solutions crafted to elevate your business presence across print, digital, and promotional media.',
      included: [
        'Custom visual layouts and graphics',
        'High-resolution export for web & print',
        'Source files in PSD / AI format',
        'Structured color palette matching'
      ],
      suitableClients: ['Businesses & Startups', 'E-commerce Brands', 'Educational Institutes', 'Content Creators'],
      process: ['Creative Briefing', 'Concept Wireframing', 'Visual Execution', 'Refinement & Delivery'],
      tools: ['Adobe Photoshop', 'Adobe Illustrator', 'Canva', 'CorelDRAW'],
      deliverables: ['High-res PNG / JPG', 'Print-ready CMYK PDF', 'Editable Vector / PSD Files'],
      relatedProjects: ['Creative Portfolio', 'Hodu Academy Social Media Campaign'],
      faqs: [
        { question: 'What file formats do I receive?', answer: 'You will receive ready-to-use PNG/JPG exports alongside print-ready PDFs and editable source files.' },
        { question: 'How many revisions are included?', answer: 'Each graphic project includes iterative revisions to ensure complete alignment with your vision.' }
      ]
    }
  },
  {
    id: 's-gd-2',
    title: 'Brand Identity Designer',
    description: 'Complete brand ecosystems including visual identity guidelines, color palettes, typographic hierarchies, and brand asset kits.',
    category: 'Graphic Design',
    categories: ['Graphic Design'],
    iconName: 'Layers',
    isFeatured: true,
    isPopular: true,
    features: ['Brand Identity Systems', 'Style Guidelines', 'Typography Pairing', 'Logo Suites'],
    details: {
      introduction: 'End-to-end brand identity architecture designed to make your company distinctive, trustworthy, and memorable across all touchpoints.',
      included: [
        'Primary & secondary logo variations',
        'Comprehensive brand style guide',
        'Typography hierarchy & font pairings',
        'Brand stationery & social templates'
      ],
      suitableClients: ['New Ventures & Founders', 'Rebranding Businesses', 'Agencies & Studios'],
      process: ['Discovery & Market Research', 'Moodboard Exploration', 'Identity Crafting', 'Brand Book Delivery'],
      tools: ['Adobe Illustrator', 'Adobe Photoshop', 'Figma'],
      deliverables: ['Vector Logo Suite (SVG/EPS/AI)', 'Brand Identity Guidelines (PDF)', 'Digital Asset Kit'],
      relatedProjects: ['Creative Portfolio'],
      faqs: [
        { question: 'Do you create a complete brand guidelines manual?', answer: 'Yes, we provide a detailed brand manual explaining font usage, color codes (HEX/RGB/CMYK), and spacing rules.' },
        { question: 'Will I get full commercial ownership?', answer: 'Yes, full commercial intellectual property rights are transferred upon project completion.' }
      ]
    }
  },
  {
    id: 's-gd-3',
    title: 'Logo Designer',
    description: 'Iconic, memorable, and vector-perfect logos crafted with strong conceptual foundations and geometric balance.',
    category: 'Graphic Design',
    categories: ['Graphic Design'],
    iconName: 'PenTool',
    isFeatured: false,
    isPopular: true,
    features: ['Custom Vector Icons', 'Monogram & Wordmarks', 'Scalable Geometry', 'Multi-Format Export'],
    details: {
      introduction: 'Distinctive logo design crafted to encapsulate your company philosophy in a singular, timeless visual mark.',
      included: [
        'Multiple unique creative concept directions',
        'Full vector source files (AI, EPS, SVG)',
        'Transparent PNG & favicon formats',
        'Black & white and inverted variations'
      ],
      suitableClients: ['Startups', 'Personal Brands', 'Corporate Entities', 'Retail Businesses'],
      process: ['Concept Brainstorming', 'Vector Drafting', 'Typography Integration', 'Final Polish'],
      tools: ['Adobe Illustrator', 'Adobe Photoshop'],
      deliverables: ['Vector Assets (.AI, .EPS, .SVG)', 'Web Favicons', 'Transparent High-Res PNGs'],
      relatedProjects: ['Creative Portfolio'],
      faqs: [
        { question: 'How many logo concepts do you provide?', answer: 'We typically present 3 distinct visual directions before refining your chosen concept.' }
      ]
    }
  },
  {
    id: 's-gd-4',
    title: 'Social Media Designer',
    description: 'Scroll-stopping Instagram carousels, Facebook banners, LinkedIn infographics, and social story templates engineered for engagement.',
    category: 'Graphic Design',
    categories: ['Graphic Design'],
    iconName: 'Share2',
    isFeatured: true,
    isPopular: true,
    features: ['High-CTR Carousels', 'Curated Grid Templates', 'Story & Reel Graphics', 'Visual Hooks'],
    details: {
      introduction: 'Engaging social media visual designs tailored to build organic audience growth, elevate engagement, and stop the scroll.',
      included: [
        'Carousel post series with visual continuity',
        'Branded story & highlight templates',
        'Promotional launch banners',
        'Editable Canva or PSD template options'
      ],
      suitableClients: ['Instagram Influencers', 'D2C Brands', 'Coaches & Educators', 'Local Businesses'],
      process: ['Content Script Review', 'Visual Hook Design', 'Carousel Sequencing', 'Batch Export'],
      tools: ['Adobe Photoshop', 'Adobe Illustrator', 'Canva'],
      deliverables: ['1080x1080 & 1080x1350 High-res Images', 'Story Formats (1080x1920)', 'Template Links'],
      relatedProjects: ['Hodu Academy Social Media Campaign', 'Institute Admission Campaign'],
      faqs: [
        { question: 'Can you provide editable Canva templates?', answer: 'Yes! We can provide fully editable Canva links so your internal team can update text easily.' }
      ]
    }
  },
  {
    id: 's-gd-5',
    title: 'Packaging Designer',
    description: 'Stunning product packaging, label designs, box die-lines, and retail carton artwork engineered for maximum shelf impact.',
    category: 'Graphic Design',
    categories: ['Graphic Design'],
    iconName: 'Package',
    isFeatured: false,
    isPopular: false,
    features: ['Precise Die-Line Artwork', '3D Product Mockups', 'Print-Ready Separation', 'Regulatory Compliance Layout'],
    details: {
      introduction: 'Commercial packaging and label design that turns ordinary products into premium, tactile retail experiences.',
      included: [
        'Die-line setup and structural layout',
        'Front & back label typography',
        'Barcode & regulatory text placement',
        'Photorealistic 3D presentation renders'
      ],
      suitableClients: ['E-commerce & D2C Sellers', 'Food & Beverage Brands', 'Cosmetics & Wellness', 'Retail Manufacturers'],
      process: ['Dimension & Die-line Verification', 'Visual Artwork Concept', '3D Mockup Preview', 'Pre-Press Production Files'],
      tools: ['Adobe Illustrator', 'Adobe Photoshop', 'CorelDRAW'],
      deliverables: ['Print-Ready Die-line PDF', 'Vector Source Files (.AI)', '3D Render Images'],
      relatedProjects: ['Creative Portfolio'],
      faqs: [
        { question: 'Do you prepare files for commercial offset printing?', answer: 'Yes, all files are prepared with CMYK color spaces, bleed margins, and spot color layers.' }
      ]
    }
  },
  {
    id: 's-gd-6',
    title: 'Marketing Designer',
    description: 'High-converting advertising banners, landing page hero graphics, email newsletter layouts, and campaign collateral.',
    category: 'Graphic Design',
    categories: ['Graphic Design'],
    iconName: 'Megaphone',
    isFeatured: false,
    isPopular: true,
    features: ['Performance Ad Creatives', 'Display Banner Suites', 'Campaign Graphics', 'Conversion-Focused Layout'],
    details: {
      introduction: 'Strategic marketing visuals designed to maximize click-through rates (CTR) and user conversion across paid advertising channels.',
      included: [
        'Multi-size Google & Meta ad banners',
        'Promotional discount badges & graphics',
        'Email newsletter header & body designs',
        'A/B test creative variations'
      ],
      suitableClients: ['Performance Marketers', 'E-commerce Stores', 'Lead Generation Agencies', 'SaaS Products'],
      process: ['Ad Objective Analysis', 'Creative Framing', 'Multi-Ratio Resizing', 'Delivery'],
      tools: ['Adobe Photoshop', 'Adobe Illustrator', 'Figma'],
      deliverables: ['Optimized Web Ads (PNG/JPG/WebP)', 'Layered Source Files'],
      relatedProjects: ['Institute Admission Campaign'],
      faqs: [
        { question: 'Can you design creatives for both Meta and Google Ads?', answer: 'Yes, we create matched sets in 1:1 square, 9:16 vertical, 16:9 landscape, and banner dimensions.' }
      ]
    }
  },
  {
    id: 's-gd-7',
    title: 'Print Designer',
    description: 'Brochures, corporate stationery, business cards, catalogs, magazines, and large-format trade show graphics with pre-press precision.',
    category: 'Graphic Design',
    categories: ['Graphic Design'],
    iconName: 'Printer',
    isFeatured: false,
    isPopular: false,
    features: ['CMYK Pre-Press Calibration', 'Brochures & Catalogs', 'Business Cards & Letterheads', 'Trade Show Banners'],
    details: {
      introduction: 'Flawless print collateral designed with meticulous typographic grids, paper bleed specifications, and color separations.',
      included: [
        'Corporate stationery & business cards',
        'Multi-page brochures & catalogs',
        'Flyers, standees, and hoardings',
        'Direct printer coordination files'
      ],
      suitableClients: ['Corporate Offices', 'Event Organizers', 'Real Estate Firms', 'Educational Academies'],
      process: ['Grid Setup & Bleed Margins', 'Editorial Layout', 'High-Res Typography Check', 'Print PDF Generation'],
      tools: ['Adobe Illustrator', 'Adobe Photoshop', 'CorelDRAW'],
      deliverables: ['Print-ready PDF with crop marks', 'Vector Source Files (.AI/.CDR)'],
      relatedProjects: ['Creative Portfolio'],
      faqs: [
        { question: 'Will the colors look exact when printed?', answer: 'We calibrate all files in CMYK and spot Pantone standards to ensure true color fidelity.' }
      ]
    }
  },
  {
    id: 's-gd-8',
    title: 'Visual Designer',
    description: 'Refined visual aesthetics, composition hierarchy, design systems, digital assets, and cohesive art direction.',
    category: 'Graphic Design',
    categories: ['Graphic Design'],
    iconName: 'Eye',
    isFeatured: false,
    isPopular: true,
    features: ['Art Direction', 'Visual Hierarchy', 'Digital Asset Libraries', 'Aesthetic Consistency'],
    details: {
      introduction: 'Elevated visual design balancing modern typography, negative space, lighting, and textures to establish premium aesthetics.',
      included: [
        'Art direction and visual concepting',
        'Custom iconography & visual accents',
        'Digital style guide documentation',
        'Cross-platform asset consistency'
      ],
      suitableClients: ['Creative Agencies', 'Luxury Brands', 'Tech Companies', 'Media Houses'],
      process: ['Mood Exploration', 'Visual System Blueprint', 'Asset Production', 'Integration Guidelines'],
      tools: ['Adobe Photoshop', 'Adobe Illustrator', 'Figma'],
      deliverables: ['High-Fidelity Asset Pack', 'Style Reference Sheets'],
      relatedProjects: ['Creative Portfolio'],
      faqs: [
        { question: 'What makes visual design distinct from graphic design?', answer: 'Visual design focuses on overarching art direction, UI styling, and holistic visual aesthetics across digital and physical mediums.' }
      ]
    }
  },
  {
    id: 's-gd-9',
    title: 'Motion Graphics Designer',
    description: 'Dynamic kinetic animations, animated logos, title cards, HUD interfaces, 2D vector movement, and engaging visual transitions.',
    category: 'Graphic Design',
    categories: ['Graphic Design'],
    iconName: 'Film',
    isFeatured: true,
    isPopular: true,
    features: ['Kinetic Typography', 'Logo Intro & Outro', '2D Shape Transitions', 'Sound FX Synchronization'],
    details: {
      introduction: 'Fluid kinetic motion graphics that bring static vector elements to life, dramatically increasing viewer retention and brand prestige.',
      included: [
        'Custom logo animation intros/outros',
        'Kinetic typography for social reels',
        'Animated infographic explainers',
        'Sound design & audio mixing integration'
      ],
      suitableClients: ['YouTube Creators', 'Tech Startups', 'Marketing Agencies', 'Event Promoters'],
      process: ['Storyboard Drafting', 'Vector Asset Preparation', 'Keyframe Animation & Easing', 'Sound Design & Render'],
      tools: ['Adobe After Effects', 'Adobe Illustrator', 'Adobe Premiere Pro'],
      deliverables: ['4K / 1080p MP4 Videos', 'Transparent Alpha ProRes / QuickTime Files', 'GIF / Lottie Files'],
      relatedProjects: ['Motion Graphics Promo', 'Educational Advertisement Video'],
      faqs: [
        { question: 'Can you provide transparent video files for overlays?', answer: 'Yes, we provide transparent background QuickTime (ProRes 4444) files for easy video overlays.' }
      ]
    }
  },
  {
    id: 's-gd-10',
    title: 'Thumbnail Designer',
    description: 'High-CTR YouTube thumbnails, course preview graphics, and video cards optimized for peak click-through performance.',
    category: 'Graphic Design',
    categories: ['Graphic Design'],
    iconName: 'Image',
    isFeatured: false,
    isPopular: true,
    features: ['High-CTR Composition', 'Expressive Facial Cutouts', 'Bold Readable Typography', 'Vibrant Color Pop'],
    details: {
      introduction: 'Psychologically engineered thumbnails designed to stand out on crowded feeds and maximize video click-through rates.',
      included: [
        'Facial cutout enhancement & glow effects',
        'Bold, high-contrast headline typography',
        'Visual storytelling elements & background blending',
        'A/B testing thumbnail variations'
      ],
      suitableClients: ['YouTube Creators', 'Podcast Hosts', 'Course Instructors', 'Media Publishers'],
      process: ['Title & Concept Analysis', 'Subject Cutout & Retouching', 'Dynamic Composition', 'Export in 1280x720 & 1920x1080'],
      tools: ['Adobe Photoshop', 'Adobe Illustrator', 'Canva'],
      deliverables: ['Optimized JPG / PNG Thumbnails under 2MB', 'Editable PSD Templates'],
      relatedProjects: ['Hodu Academy Social Media Campaign'],
      faqs: [
        { question: 'Do you offer rush delivery for urgent video uploads?', answer: 'Yes, fast-track delivery is available for active YouTube creators.' }
      ]
    }
  },
  {
    id: 's-gd-11',
    title: 'Poster Designer',
    description: 'Bold promotional event posters, movie banners, academic announcements, and festival artworks with dramatic typography.',
    category: 'Graphic Design',
    categories: ['Graphic Design'],
    iconName: 'Layout',
    isFeatured: false,
    isPopular: false,
    features: ['Dramatic Layouts', 'Event & Festival Themes', 'High-Contrast Headings', 'Print & Digital Formats'],
    details: {
      introduction: 'Eye-catching poster designs engineered to command attention from across the room or across digital feeds.',
      included: [
        'High-impact central focal points',
        'Balanced event details and sponsor placement',
        'Both standard print (A3/A2) and digital social formats',
        'Color-corrected imagery and typography'
      ],
      suitableClients: ['Event Organizers', 'Educational Institutes', 'Music & Entertainment Bands', 'Conferences'],
      process: ['Theme & Mood Conceptualization', 'Typography Architecture', 'Visual Effects & Lighting', 'Final Output'],
      tools: ['Adobe Photoshop', 'Adobe Illustrator', 'CorelDRAW'],
      deliverables: ['300 DPI Print PDF', 'Digital Web/Social JPG'],
      relatedProjects: ['Creative Portfolio', 'Institute Admission Campaign'],
      faqs: [
        { question: 'What sizes do you design posters for?', answer: 'We design for standard A4, A3, A2, A1 poster sizes as well as custom hoarding and billboard ratios.' }
      ]
    }
  },
  {
    id: 's-gd-12',
    title: 'Flyer Designer',
    description: 'Crisp promotional flyers, sales handouts, event leaflets, and business marketing pamphlets with clear call-to-actions.',
    category: 'Graphic Design',
    categories: ['Graphic Design'],
    iconName: 'FileText',
    isFeatured: false,
    isPopular: false,
    features: ['Clear Value Propositions', 'Single & Double Sided', 'Organized Bullet Points', 'Print-Ready Pre-Press'],
    details: {
      introduction: 'Direct-response marketing flyers structured to inform prospects, highlight key benefits, and prompt immediate action.',
      included: [
        'Single-sided or double-sided layouts',
        'Promotional discounts and coupon badges',
        'QR code integration for website/WhatsApp visits',
        'Commercial print-ready files'
      ],
      suitableClients: ['Retail Stores', 'Tuition & Coaching Institutes', 'Gyms & Salons', 'Real Estate Agencies'],
      process: ['Content Organizing', 'Layout Structuring', 'Visual Styling', 'Exporting'],
      tools: ['Adobe Illustrator', 'Adobe Photoshop', 'CorelDRAW', 'Canva'],
      deliverables: ['Print-Ready PDF with 3mm Bleed', 'High-Res Digital Image'],
      relatedProjects: ['Creative Portfolio', 'Institute Admission Campaign'],
      faqs: [
        { question: 'Can you include custom QR codes in the flyer?', answer: 'Yes, we can generate and embed high-resolution QR codes linking to your WhatsApp, website, or Google Maps.' }
      ]
    }
  },
  {
    id: 's-gd-13',
    title: 'Canva Designer',
    description: 'Custom, easily editable Canva templates, social media kits, presentations, and team asset systems for effortless in-house editing.',
    category: 'Graphic Design',
    categories: ['Graphic Design'],
    iconName: 'Sparkles',
    isFeatured: false,
    isPopular: true,
    features: ['100% Editable Templates', 'Custom Brand Kit Setup', 'Presentation Decks', 'Reusable Social Grids'],
    details: {
      introduction: 'Professional bespoke Canva templates allowing non-designers on your team to quickly produce consistent, on-brand graphics.',
      included: [
        'Direct Canva template access links',
        'Pre-configured font styles and brand color palette',
        'Organized image frame drag-and-drop slots',
        'Short video tutorial on template customization'
      ],
      suitableClients: ['Small Business Owners', 'Social Media Managers', 'Real Estate Agents', 'Marketing Teams'],
      process: ['Brand Kit Assessment', 'Template Design in Canva Pro', 'User-Friendliness Testing', 'Link Delivery'],
      tools: ['Canva', 'Adobe Photoshop', 'Adobe Illustrator'],
      deliverables: ['Editable Canva Template Share Links', 'Exported Sample PNGs'],
      relatedProjects: ['Hodu Academy Social Media Campaign'],
      faqs: [
        { question: 'Do I need Canva Pro to use the templates?', answer: 'No, all templates are optimized so you can edit and export them using either Free or Pro Canva accounts.' }
      ]
    }
  },
  {
    id: 's-gd-14',
    title: 'Photoshop Editor',
    description: 'Advanced photo retouching, background removal, object manipulation, compositing, lighting corrections, and visual enhancement.',
    category: 'Graphic Design',
    categories: ['Graphic Design'],
    iconName: 'Sliders',
    isFeatured: false,
    isPopular: true,
    features: ['Skin Retouching & Color Grading', 'Complex Background Removal', 'Photo Manipulation', 'Lighting & Shadow Realism'],
    details: {
      introduction: 'High-end raster image editing, realistic photo compositing, and commercial product retouching with precision masking.',
      included: [
        'Non-destructive layered editing',
        'Frequency separation skin retouching',
        'Realistic shadow & reflection generation',
        'Color grading and selective tonal enhancement'
      ],
      suitableClients: ['Photographers', 'E-commerce Brands', 'Advertising Agencies', 'Portrait Clients'],
      process: ['RAW Processing & Cleanup', 'Masking & Object Isolation', 'Color Grading & Blending', 'Master Export'],
      tools: ['Adobe Photoshop', 'Adobe Lightroom'],
      deliverables: ['High-Res TIFF / PNG / JPG', 'Layered PSD Files'],
      relatedProjects: ['Creative Portfolio'],
      faqs: [
        { question: 'Can you work with low-resolution input images?', answer: 'We apply modern AI enhancement and manual sharpening techniques to maximize clarity from existing files.' }
      ]
    }
  },
  {
    id: 's-gd-15',
    title: 'Image Editor',
    description: 'Fast, precise image optimization, batch resizing, watermarking, color correction, and catalog asset preparation.',
    category: 'Graphic Design',
    categories: ['Graphic Design'],
    iconName: 'Wand2',
    isFeatured: false,
    isPopular: false,
    features: ['Batch Image Processing', 'Product Image Whitening', 'Web Speed Optimization', 'Color Balance Adjustment'],
    details: {
      introduction: 'Streamlined image processing and enhancement tailored for online stores, marketplace catalogs, and digital archives.',
      included: [
        'Pure white (RGB 255) Amazon/Flipkart background isolation',
        'Batch cropping and consistent aspect ratios',
        'WebP compression for lightning-fast website load times',
        'Watermark and copyright placement'
      ],
      suitableClients: ['Amazon / Flipkart Sellers', 'Shopify Merchants', 'Real Estate Portals', 'Catalog Publishers'],
      process: ['Batch Ingestion', 'Automated & Manual Cleanup', 'Optimization & Compression', 'Categorized Delivery'],
      tools: ['Adobe Photoshop', 'Adobe Lightroom', 'Canva'],
      deliverables: ['WebP / JPG Marketplace-Ready Files'],
      relatedProjects: ['Creative Portfolio'],
      faqs: [
        { question: 'Do you handle bulk product image editing?', answer: 'Yes, we efficiently process large batches of product photos with consistent color and sizing standards.' }
      ]
    }
  },
  {
    id: 's-gd-16',
    title: 'UI/UX Designer',
    description: 'Intuitive user interface designs, wireframes, interactive prototypes, design systems, and responsive layouts crafted in Figma.',
    category: 'Graphic Design',
    categories: ['Graphic Design'],
    iconName: 'LayoutGrid',
    isFeatured: true,
    isPopular: true,
    features: ['Figma Component Systems', 'Interactive Prototyping', 'Mobile-First UI Layouts', 'UX Wireframes & Flowcharts'],
    details: {
      introduction: 'User-centered interface designs that combine sleek modern aesthetics with intuitive navigation and seamless usability.',
      included: [
        'Low-fidelity wireframes and user flow mapping',
        'High-fidelity interactive Figma prototypes',
        'Complete design token system (colors, typography, spacing)',
        'Developer handoff specs with auto-layout components'
      ],
      suitableClients: ['Tech Startups', 'App Developers', 'SaaS Founders', 'Web Agencies'],
      process: ['User Journey Mapping', 'Wireframing', 'Visual UI Crafting', 'Interactive Prototype & Handoff'],
      tools: ['Figma', 'Adobe Illustrator', 'Adobe Photoshop'],
      deliverables: ['Figma File with Auto-Layout Components', 'Interactive Clickable Prototype', 'Exported Design Tokens'],
      relatedProjects: ['Personal Portfolio Website'],
      faqs: [
        { question: 'Are the Figma files organized for developer handoff?', answer: 'Yes, all frames utilize Figma Auto-Layout, named layers, responsive constraints, and structured color variables.' }
      ]
    }
  },

  // ================= VIDEO EDITING (1 ROLE) =================
  {
    id: 's-ve-1',
    title: 'Video Editor',
    description: 'High-pacing video editing, YouTube long-form cuts, Instagram Reels, kinetic subtitles, sound design, and color grading.',
    category: 'Video Editing',
    categories: ['Video Editing'],
    iconName: 'Video',
    isFeatured: true,
    isPopular: true,
    features: ['High-Retention Pacing', 'Animated Kinetic Subtitles', 'Sound Design & SFX', 'Color Grading & LUTs'],
    details: {
      introduction: 'Professional commercial and creator video editing structured for maximum watch time, retention spikes, and audio clarity.',
      included: [
        'Dead air removal and seamless jump cuts',
        'Eye-catching kinetic subtitles with highlight animations',
        'Layered sound effects (whooshes, risers, impacts, background score)',
        'Color grading and 4K export optimization'
      ],
      suitableClients: ['YouTubers & Creators', 'Course Creators & Academies', 'Marketing Agencies', 'Corporate Brands'],
      process: ['Footage Ingestion & A-Roll Assembly', 'B-Roll & Graphic Overlays', 'Sound Design & Subtitles', 'Master 4K/1080p Export'],
      tools: ['Adobe Premiere Pro', 'Adobe After Effects', 'Adobe Audition'],
      deliverables: ['1080x1920 Vertical (Reels/Shorts/TikTok)', '1920x1080 Horizontal (YouTube/Ads) MP4'],
      relatedProjects: ['Educational Advertisement Video', 'Motion Graphics Promo'],
      faqs: [
        { question: 'Can you edit both short-form Reels and long-form YouTube videos?', answer: 'Yes! We specialize in high-retention short-form edits as well as engaging multi-chapter YouTube documentaries and tutorials.' },
        { question: 'Do you provide royalty-free music and sound effects?', answer: 'Yes, all music and sound effects are licensed and safe for commercial monetization.' }
      ]
    }
  },

  // ================= SOCIAL MEDIA (1 ROLE) =================
  {
    id: 's-sm-1',
    title: 'Social Media Manager',
    description: 'End-to-end social media management, content calendar planning, publishing schedules, analytics tracking, and organic brand growth.',
    category: 'Social Media',
    categories: ['Social Media'],
    iconName: 'TrendingUp',
    isFeatured: true,
    isPopular: true,
    features: ['Monthly Content Calendars', 'Post Scheduling & Copywriting', 'Audience Growth Strategy', 'Performance Analytics'],
    details: {
      introduction: 'Strategic management of your social presence ensuring consistent posting, compelling copywriting, and community engagement.',
      included: [
        'Comprehensive monthly content calendar',
        'Engaging post captions with researched hashtags',
        'Direct scheduling and publishing assistance',
        'Monthly growth metrics and performance reports'
      ],
      suitableClients: ['Small & Medium Businesses', 'Founders & Personal Brands', 'Educational Institutes', 'E-commerce Stores'],
      process: ['Brand Voice & Goal Alignment', 'Monthly Calendar Drafting', 'Creative Asset Scheduling', 'Review & Optimization'],
      tools: ['Canva', 'Meta Business Suite', 'Adobe Photoshop', 'Analytics Tools'],
      deliverables: ['Monthly Content Strategy Document', 'Scheduled Posts & Performance Dashboard'],
      relatedProjects: ['Hodu Academy Social Media Campaign', 'Institute Admission Campaign'],
      faqs: [
        { question: 'Which platforms do you manage?', answer: 'We manage Instagram, Facebook, LinkedIn, YouTube, and Twitter/X channels.' }
      ]
    }
  },

  // ================= ADDITIONAL (1 ROLE) =================
  {
    id: 's-ad-1',
    title: 'Vibe Coder',
    description: 'Rapid interactive prototyping, modern vibe coding, creative technical styling, responsive layouts, and modern frontend scripting.',
    category: 'Additional',
    categories: ['Additional'],
    iconName: 'Code',
    isFeatured: true,
    isPopular: true,
    features: ['Rapid Interactive Prototyping', 'Modern Frontend Code (React/Tailwind)', 'Fluid Micro-Animations', 'Clean Modular Architecture'],
    details: {
      introduction: 'Creative technical prototyping and modern vibe coding that turns visual concepts into functional, interactive digital experiences.',
      included: [
        'Rapid digital UI/UX proof of concepts',
        'Responsive interactive frontend implementations',
        'Fluid CSS/Motion animations and transitions',
        'Component structure and modern deployment setup'
      ],
      suitableClients: ['Startups & Creators', 'Agencies Needing Fast Prototypes', 'Designers Seeking Live Code', 'Independent Builders'],
      process: ['Concept Discovery', 'Vibe Coding & Rapid Prototyping', 'Animation & Styling Polish', 'Deployment & Handoff'],
      tools: ['React.js', 'TypeScript', 'Tailwind CSS', 'Motion', 'Vite'],
      deliverables: ['Live Web Prototype URL', 'Clean Modular Source Repository'],
      relatedProjects: ['Personal Portfolio Website'],
      faqs: [
        { question: 'What is Vibe Coding?', answer: 'Vibe Coding combines creative intuition, rapid AI-assisted development workflows, and modern web frameworks to produce interactive digital products with exceptional speed and polish.' }
      ]
    }
  }
];

export function getServicesByCategory(category: ServiceCategory | 'All Services'): DetailedService[] {
  if (category === 'All Services') {
    return SERVICES_LIST;
  }
  return SERVICES_LIST.filter(
    (s) => s.category === category || s.categories.includes(category)
  );
}

export function getServiceByTitle(title: string): DetailedService | undefined {
  return SERVICES_LIST.find((s) => s.title.toLowerCase() === title.toLowerCase());
}
