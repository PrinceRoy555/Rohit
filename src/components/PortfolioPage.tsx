import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutGrid,
  PenTool,
  Layers,
  Megaphone,
  Package,
  Printer,
  BarChart2,
  PlaySquare,
  Play,
  Film,
  Monitor,
  Heart,
  Folder,
  User,
  Calendar,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle2,
  Info,
  X,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import { useBodyScrollLock } from '../lib/scrollLock';

// Category definitions matching the approved reference screenshot (with project counts)
const PORTFOLIO_CATEGORIES = [
  { name: 'All Projects', id: 'all', count: 50, icon: LayoutGrid },
  { name: 'Graphic Design', id: 'graphic-design', count: 12, icon: PenTool },
  { name: 'Branding', id: 'branding', count: 6, icon: Layers },
  { name: 'Social Media', id: 'social-media', count: 10, icon: Megaphone },
  { name: 'Packaging', id: 'packaging', count: 6, icon: Package },
  { name: 'Print Design', id: 'print-design', count: 5, icon: Printer },
  { name: 'Marketing Design', id: 'marketing-design', count: 4, icon: BarChart2 },
  { name: 'Thumbnail Design', id: 'thumbnail-design', count: 3, icon: PlaySquare },
  { name: 'Video Editing', id: 'video-editing', count: 7, icon: Play },
  { name: 'Motion Graphics', id: 'motion-graphics', count: 4, icon: Film },
  { name: 'UI/UX Design', id: 'ui-ux-design', count: 3, icon: Monitor },
];

export interface PortfolioItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  filterCategory: string;
  image: string;
  fallbackImage: string;
  deliverables: string;
  isFeatured?: boolean;
  features: string[];
  description: string;
  tools: string[];
  client: string;
  date: string;
  link: string;
}

// 10 Authenticated, category-specific projects matching the approved reference design
export const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 'p1',
    title: 'Brand Identity Design',
    subtitle: 'Complete brand identity system including logo, stationery, color palette, and guidelines.',
    category: 'Branding',
    filterCategory: 'Branding',
    image: '/images/portfolio/brand-identity.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=1200&q=80',
    deliverables: '12 Designs',
    isFeatured: true,
    features: ['Logo & Identity', 'Brand Guidelines', 'Stationery Design'],
    description: 'A comprehensive corporate brand identity system featuring custom logo geometry, visual guidelines, typography hierarchy, business stationery suite, and high-impact brand standards.',
    tools: ['Adobe Illustrator', 'Adobe Photoshop', 'Figma'],
    client: 'Nexora Innovations',
    date: '2025',
    link: 'https://www.behance.net/gallery/254351431/Rohit-Verma-Creative-Portfolio-2026'
  },
  {
    id: 'p2',
    title: 'Social Media Campaign',
    subtitle: 'Instagram & Facebook campaign design with creative posts, carousels, and ad creatives.',
    category: 'Social Media',
    filterCategory: 'Social Media',
    image: '/images/portfolio/social-media-campaign.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=80',
    deliverables: '8 Designs',
    isFeatured: true,
    features: ['Campaign Creatives', 'Carousel Designs', 'Ad Banners'],
    description: 'High-converting social media creatives, promotional campaign templates, and story ads engineered for maximum audience retention and digital engagement.',
    tools: ['Adobe Photoshop', 'Canva Pro', 'Adobe Illustrator'],
    client: 'Summer Refresh Media',
    date: '2025',
    link: 'https://www.behance.net/gallery/254351431/Rohit-Verma-Creative-Portfolio-2026'
  },
  {
    id: 'p3',
    title: 'Packaging Design',
    subtitle: 'Premium product packaging with modern label design and print-ready assets.',
    category: 'Packaging',
    filterCategory: 'Packaging',
    image: '/images/portfolio/packaging-design.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=1200&q=80',
    deliverables: '6 Designs',
    isFeatured: true,
    features: ['Product Packaging', 'Label Design', 'Print Files'],
    description: 'Modern kraft paper stand-up pouch packaging design for artisan roast coffee, featuring custom typography, die-cuts, and print-ready spot UV details.',
    tools: ['Adobe Illustrator', 'Adobe Photoshop', 'CorelDRAW'],
    client: 'Roast Coffee Co.',
    date: '2026',
    link: 'https://www.behance.net/gallery/254351431/Rohit-Verma-Creative-Portfolio-2026'
  },
  {
    id: 'p4',
    title: 'Print Design',
    subtitle: 'Brochure, flyer, and business collateral for marketing and brand promotion.',
    category: 'Print Design',
    filterCategory: 'Print Design',
    image: '/images/portfolio/print-design.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
    deliverables: '10 Designs',
    isFeatured: true,
    features: ['Brochure Design', 'Flyer & Poster', 'Business Collateral'],
    description: 'Corporate trifold and bifold brochure suites, exhibition flyers, and print collateral designed with crisp CMYK precision and typographic clarity.',
    tools: ['CorelDRAW', 'Adobe InDesign', 'Adobe Illustrator'],
    client: 'Apex Enterprise Group',
    date: '2024',
    link: 'https://www.behance.net/gallery/254351431/Rohit-Verma-Creative-Portfolio-2026'
  },
  {
    id: 'p5',
    title: 'Marketing Design',
    subtitle: 'Digital marketing creatives including ad designs, campaign visuals, and promotions.',
    category: 'Marketing',
    filterCategory: 'Marketing Design',
    image: '/images/portfolio/marketing-design.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    deliverables: '15 Designs',
    isFeatured: true,
    features: ['Ad Creatives', 'Campaign Visuals', 'Promotional Banners'],
    description: 'Digital marketing campaign visuals, performance ad banners, conversion-focused promotional graphics, and marketing presentation decks.',
    tools: ['Adobe Photoshop', 'Adobe Illustrator', 'Canva'],
    client: 'Growth Velocity Marketing',
    date: '2025',
    link: 'https://www.behance.net/gallery/254351431/Rohit-Verma-Creative-Portfolio-2026'
  },
  {
    id: 'p6',
    title: 'Video Editing',
    subtitle: 'Professional video editing with cutting, transitions, motion graphics, and sound design.',
    category: 'Video Editing',
    filterCategory: 'Video Editing',
    image: '/images/portfolio/video-editing.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    deliverables: '7 Designs',
    isFeatured: true,
    features: ['Video Editing', 'Motion Graphics', 'Sound Design'],
    description: 'Commercial advertisement video editing featuring rapid cuts, dynamic sound effects, kinetic typography overlays, and professional color grading.',
    tools: ['Adobe Premiere Pro', 'Adobe After Effects', 'DaVinci Resolve'],
    client: 'Hodu Academy, Jaipur',
    date: '2024 - 2025',
    link: 'https://www.behance.net/gallery/254351431/Rohit-Verma-Creative-Portfolio-2026'
  },
  {
    id: 'p7',
    title: 'Thumbnail Design',
    subtitle: 'High-CTR custom YouTube thumbnails, title cards, and engaging video hooks.',
    category: 'Thumbnail Design',
    filterCategory: 'Thumbnail Design',
    image: '/images/portfolio/thumbnail-design.png',
    fallbackImage: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=1200&q=80',
    deliverables: '15 Thumbnails',
    isFeatured: true,
    features: ['Expressive Cutouts', 'Dramatic Lighting', 'Click-Optimized Hooks'],
    description: 'Eye-catching YouTube thumbnail designs featuring expressive cutouts, dramatic lighting effects, bold hooks, and optimized visual hierarchy for higher CTR.',
    tools: ['Adobe Photoshop', 'Adobe Firefly'],
    client: 'EduTech Creator Hub',
    date: '2025',
    link: 'https://www.behance.net/gallery/254359065/Thumbnail-Design'
  },
  {
    id: 'p8',
    title: 'Motion Graphics',
    subtitle: 'Futuristic kinetic typography, logo intro animations, and UI visual effects.',
    category: 'Motion Graphics',
    filterCategory: 'Motion Graphics',
    image: '/images/portfolio/motion-graphics.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    deliverables: '4 Animations',
    isFeatured: true,
    features: ['Kinetic Typography', 'Logo Reveals', '3D Camera Moves'],
    description: 'Futuristic promotional animations, glowing UI overlays, complex shape layer transitions, particle effects, and synchronized sound design.',
    tools: ['Adobe After Effects', 'Adobe Illustrator', 'Photoshop'],
    client: 'Creative Tech Lab',
    date: '2025',
    link: 'https://www.behance.net/gallery/254351431/Rohit-Verma-Creative-Portfolio-2026'
  },
  {
    id: 'p9',
    title: 'UI/UX Design',
    subtitle: 'Responsive SaaS dashboards, mobile interfaces, and design system components.',
    category: 'UI/UX Design',
    filterCategory: 'UI/UX Design',
    image: '/images/portfolio/ui-ux-design.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
    deliverables: '10 Screens',
    isFeatured: true,
    features: ['Component Systems', 'Interactive Prototypes', 'Responsive Layouts'],
    description: 'Modern user interface design systems with clean components, responsive typography, micro-interactions, and user-tested prototyping in Figma.',
    tools: ['Figma', 'React.js', 'Tailwind CSS'],
    client: 'Unicivix Solutions',
    date: '2026',
    link: 'https://www.behance.net/gallery/254351431/Rohit-Verma-Creative-Portfolio-2026'
  },
  {
    id: 'p10',
    title: 'Creative Master Showcase',
    subtitle: 'Multi-discipline creative collection spanning branding, print, and video.',
    category: 'Graphic Design',
    filterCategory: 'Graphic Design',
    image: '/images/portfolio/creative-portfolio-cover.jpg',
    fallbackImage: 'https://lh3.googleusercontent.com/d/18xe8PYnr3fu4LL8KA3z8Jl-SXKdF9PNo=w1600',
    deliverables: '50+ Creatives',
    isFeatured: true,
    features: ['Brand Identity', 'Print Publications', 'Digital Creatives'],
    description: 'A comprehensive showcase of graphic design projects spanning brand identity, social campaigns, digital ads, print publications, and commercial packaging.',
    tools: ['Photoshop', 'Illustrator', 'CorelDRAW', 'Canva', 'Figma'],
    client: 'Rohit Verma Creative',
    date: '2026',
    link: 'https://www.behance.net/gallery/254351431/Rohit-Verma-Creative-Portfolio-2026'
  }
];

interface ProjectImageProps {
  item: PortfolioItem;
  className?: string;
  imgClassName?: string;
  isModal?: boolean;
}

function ProjectImage({ item, className = '', imgClassName = '', isModal = false }: ProjectImageProps) {
  const [currentSrc, setCurrentSrc] = useState(item.image);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleError = () => {
    if (currentSrc !== item.fallbackImage) {
      setCurrentSrc(item.fallbackImage);
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div className={`w-full ${isModal ? 'aspect-[16/9]' : 'aspect-[4/3]'} bg-[#F1F5F9] dark:bg-[#0A1A3A] flex flex-col items-center justify-center p-6 text-center border-b border-[#E2E8F0] dark:border-[#1E3A8A]/40 relative overflow-hidden ${className}`}>
        <div className="w-12 h-12 rounded-2xl bg-[#0866F5]/10 border border-[#0866F5]/20 flex items-center justify-center text-[#0866F5] mb-2">
          <ImageIcon className="w-6 h-6" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0866F5] mb-0.5">{item.category}</span>
        <h4 className="text-sm font-bold text-[#071B49] dark:text-white max-w-xs line-clamp-1">{item.title}</h4>
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden bg-[#F1F5F9] dark:bg-[#0A1A3A] ${isModal ? 'aspect-[16/9]' : 'aspect-[4/3]'} ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center z-0">
          <ImageIcon className="w-6 h-6 text-slate-300 dark:text-slate-600 animate-pulse" />
        </div>
      )}
      <img
        src={currentSrc}
        alt={`${item.title} - ${item.category}`}
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        className={`w-full h-full object-cover transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
        loading={isModal ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );
}

interface PortfolioPageProps {
  onNavigate?: (routeId: string) => void;
}

export default function PortfolioPage({ onNavigate }: PortfolioPageProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All Projects');
  const [selectedProject, setSelectedProject] = useState<PortfolioItem | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  const gridRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(!!selectedProject, 'portfolio-detail-modal-portal');

  // Filter projects based on active category
  const filteredProjects = useMemo(() => {
    if (activeCategory === 'All Projects') {
      return PORTFOLIO_ITEMS;
    }
    const target = activeCategory.toLowerCase();
    return PORTFOLIO_ITEMS.filter((item) => {
      const fCat = item.filterCategory.toLowerCase();
      const cat = item.category.toLowerCase();
      if (target === 'graphic design') {
        return (
          fCat === 'graphic design' ||
          fCat === 'branding' ||
          fCat === 'social media' ||
          fCat === 'packaging' ||
          fCat === 'print design' ||
          fCat === 'marketing design' ||
          fCat === 'thumbnail design'
        );
      }
      return fCat === target || cat === target || target.includes(fCat) || fCat.includes(target);
    });
  }, [activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / itemsPerPage));

  // Reset pagination on category change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(start, start + itemsPerPage);
  }, [filteredProjects, currentPage]);

  const handlePageChange = (pageNum: number) => {
    setCurrentPage(pageNum);
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Keyboard handler for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedProject) {
        setSelectedProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProject]);

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
            1. HERO SECTION (Matching Approved Portfolio Reference Image)
           ========================================================================= */}
        <section className="mb-14 sm:mb-18">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Hero Column: Copy & Statistics */}
            <div className="lg:col-span-7 flex flex-col items-start">
              
              {/* Badge: "My Creative Portfolio" */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 border border-[#DBEAFE] dark:border-[#3B82F6]/30 text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] mb-5 shadow-xs">
                <Folder className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
                <span>My Creative Portfolio</span>
              </div>

              {/* Main Heading: "Our Creative Portfolio" */}
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight text-[#071B49] dark:text-white leading-[1.1] mb-5">
                Our Creative <span className="text-[#0866F5]">Portfolio</span>
              </h1>

              {/* Supporting Subtitle */}
              <p className="text-sm sm:text-base text-[#64748B] dark:text-[#94A3B8] max-w-xl leading-relaxed mb-8">
                A collection of my best work in graphic design, branding, social media, packaging, print, and more. Explore real projects and see how I turn ideas into impactful visuals.
              </p>

              {/* Three Compact Verified Statistics Items */}
              <div className="flex flex-wrap items-center gap-6 sm:gap-10 pt-2 border-t border-[#F1F5F9] dark:border-[#1E3A8A]/40 w-full sm:w-auto">
                
                {/* Stat 1: 50+ Projects Completed */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 border border-[#DBEAFE] dark:border-[#3B82F6]/30 flex items-center justify-center text-[#0866F5] shrink-0">
                    <Layers className="w-5 h-5 text-[#0866F5]" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-[#071B49] dark:text-white leading-none mb-1">50+</div>
                    <div className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">Projects Completed</div>
                  </div>
                </div>

                {/* Stat 2: 30+ Happy Clients */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 border border-[#DBEAFE] dark:border-[#3B82F6]/30 flex items-center justify-center text-[#0866F5] shrink-0">
                    <User className="w-5 h-5 text-[#0866F5]" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-[#071B49] dark:text-white leading-none mb-1">30+</div>
                    <div className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">Happy Clients</div>
                  </div>
                </div>

                {/* Stat 3: 5+ Years Experience */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 border border-[#DBEAFE] dark:border-[#3B82F6]/30 flex items-center justify-center text-[#0866F5] shrink-0">
                    <Calendar className="w-5 h-5 text-[#0866F5]" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-[#071B49] dark:text-white leading-none mb-1">5+</div>
                    <div className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">Years Experience</div>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Hero Column: Laptop & Creative Tools Badges */}
            <div className="lg:col-span-5 relative flex items-center justify-center py-6 sm:py-8">
              <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-[#3B82F6]/25 to-[#60A5FA]/15 blur-3xl pointer-events-none" />

              <div className="relative w-full max-w-[420px] aspect-[4/3] flex items-center justify-center">
                
                {/* 3D Modern Laptop Display Mockup */}
                <div className="relative w-[320px] sm:w-[360px] bg-[#0F172A] p-2.5 rounded-t-2xl rounded-b-lg shadow-[0_25px_50px_rgba(7,27,73,0.18)] border border-[#334155] transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                  <div className="relative aspect-[16/10] bg-[#070D1E] rounded-lg overflow-hidden border border-[#1E293B] flex items-center justify-center p-6">
                    <div className="relative flex flex-col items-center justify-center text-center">
                      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#0866F5] via-[#2563EB] to-[#38BDF8] flex items-center justify-center shadow-[0_0_35px_rgba(8,102,245,0.6)] mb-2">
                        <span className="text-4xl font-black text-white tracking-tighter">R</span>
                      </div>
                      <div className="text-[11px] font-bold text-white tracking-widest uppercase opacity-90">RohitWork</div>
                      <div className="text-[9px] text-[#38BDF8] font-semibold tracking-wider">Portfolio Studio</div>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-gradient-to-b from-[#334155] to-[#1E293B] rounded-b-lg mt-1 flex items-center justify-center">
                    <div className="w-16 h-0.5 bg-[#475569] rounded-full" />
                  </div>
                </div>

                {/* Floating Creative Software Badges Matching Screenshot (Ps, Ai, Figma, Ae, Pr) */}
                <motion.div
                  animate={{ y: [-4, 5, -4] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-3 left-6 w-11 h-11 rounded-xl bg-[#001E36] border border-[#00A4E4] flex items-center justify-center shadow-lg text-[#00A4E4] font-black text-sm"
                >
                  Ps
                </motion.div>

                <motion.div
                  animate={{ y: [5, -4, 5] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-8 left-16 w-11 h-11 rounded-xl bg-[#330000] border border-[#FF9A00] flex items-center justify-center shadow-lg text-[#FF9A00] font-black text-sm"
                >
                  Ai
                </motion.div>

                <motion.div
                  animate={{ y: [-5, 4, -5] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute bottom-6 left-8 w-11 h-11 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center shadow-lg"
                >
                  <div className="w-6 h-6 flex flex-col justify-between">
                    <div className="flex gap-0.5"><div className="w-2.5 h-2.5 rounded-full bg-[#F24E1E]" /><div className="w-2.5 h-2.5 rounded-full bg-[#FF7262]" /></div>
                    <div className="flex gap-0.5"><div className="w-2.5 h-2.5 rounded-full bg-[#A259FF]" /><div className="w-2.5 h-2.5 rounded-full bg-[#1ABCFE]" /></div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [4, -5, 4] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-1 right-8 w-11 h-11 rounded-xl bg-[#00005B] border border-[#9999FF] flex items-center justify-center shadow-lg text-[#9999FF] font-black text-sm"
                >
                  Ae
                </motion.div>

                <motion.div
                  animate={{ y: [-3, 5, -3] }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-14 right-2 w-11 h-11 rounded-xl bg-[#330033] border border-[#EA77FF] flex items-center justify-center shadow-lg text-[#EA77FF] font-black text-sm"
                >
                  Pr
                </motion.div>

              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            2. CATEGORY FILTER NAVIGATION (2 Centered Rows with Counts)
           ========================================================================= */}
        <section className="mb-12 sm:mb-14">
          <div className="flex flex-col items-center justify-center gap-3" role="tablist" aria-label="Portfolio Categories">
            
            {/* Row 1: All Projects, Graphic Design, Branding, Social Media, Packaging, Print Design */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              {PORTFOLIO_CATEGORIES.slice(0, 6).map((cat) => {
                const isActive = activeCategory === cat.name;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.name)}
                    role="tab"
                    aria-selected={isActive}
                    className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-[13px] font-semibold transition-all duration-200 cursor-pointer select-none active:scale-95 ${
                      isActive
                        ? 'bg-[#0866F5] text-white shadow-[0_6px_20px_rgba(8,102,245,0.35)] scale-[1.02]'
                        : 'bg-white dark:bg-[#071B49] text-[#334155] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#1E3A8A]/50 shadow-xs hover:border-[#0866F5] hover:text-[#0866F5] hover:shadow-sm'
                    }`}
                    id={`filter-pill-${cat.id}`}
                  >
                    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#475569] dark:text-[#94A3B8]'}`} />
                    <span>{cat.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : 'bg-[#F1F5F9] dark:bg-[#1E3A8A]/50 text-[#64748B] dark:text-[#94A3B8]'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Row 2: Marketing Design, Thumbnail Design, Video Editing, Motion Graphics, UI/UX Design */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              {PORTFOLIO_CATEGORIES.slice(6).map((cat) => {
                const isActive = activeCategory === cat.name;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.name)}
                    role="tab"
                    aria-selected={isActive}
                    className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-[13px] font-semibold transition-all duration-200 cursor-pointer select-none active:scale-95 ${
                      isActive
                        ? 'bg-[#0866F5] text-white shadow-[0_6px_20px_rgba(8,102,245,0.35)] scale-[1.02]'
                        : 'bg-white dark:bg-[#071B49] text-[#334155] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#1E3A8A]/50 shadow-xs hover:border-[#0866F5] hover:text-[#0866F5] hover:shadow-sm'
                    }`}
                    id={`filter-pill-${cat.id}`}
                  >
                    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#475569] dark:text-[#94A3B8]'}`} />
                    <span>{cat.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : 'bg-[#F1F5F9] dark:bg-[#1E3A8A]/50 text-[#64748B] dark:text-[#94A3B8]'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>
        </section>

        {/* =========================================================================
            3. TWO-COLUMN HORIZONTAL PROJECT CARDS GRID (Matching Approved Reference)
           ========================================================================= */}
        <section ref={gridRef} className="scroll-mt-28">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-20 px-6 bg-white dark:bg-[#071B49] border border-[#E2E8F0] dark:border-[#1E3A8A]/50 rounded-[24px] shadow-sm my-6">
              <div className="w-14 h-14 rounded-2xl bg-[#0866F5]/10 text-[#0866F5] flex items-center justify-center mx-auto mb-3">
                <Package className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-[#071B49] dark:text-white mb-1">No Projects Found</h3>
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8] max-w-sm mx-auto mb-4">
                No portfolio items matched your current filter &quot;{activeCategory}&quot;.
              </p>
              <button
                onClick={() => setActiveCategory('All Projects')}
                className="inline-flex items-center gap-2 bg-[#0866F5] text-white text-xs font-bold px-5 py-2.5 rounded-full cursor-pointer shadow-md active:scale-95 transition-transform"
              >
                Reset to All Projects
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7" id="portfolio-project-grid">
              <AnimatePresence mode="popLayout">
                {paginatedProjects.map((project) => {
                  return (
                    <motion.div
                      key={project.id}
                      layout
                      initial={{ opacity: 0, scale: 0.97, y: 16 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97, y: 16 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="group bg-white dark:bg-[#071B49] rounded-3xl border border-[#E2E8F0] dark:border-[#1E3A8A]/50 shadow-[0_4px_20px_rgba(7,27,73,0.04)] hover:shadow-[0_16px_36px_rgba(8,102,245,0.12)] dark:hover:shadow-[0_16px_36px_rgba(3,11,30,0.8)] hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between"
                      id={`project-card-${project.id}`}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                        
                        {/* Left Side: Badges, Title, Subtitle, Checklists & Actions */}
                        <div className="sm:col-span-7 flex flex-col justify-between h-full">
                          
                          <div>
                            {/* Badges: Featured & Category Pill */}
                            <div className="flex items-center gap-2 mb-2.5">
                              {project.isFeatured && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0866F5] text-white shadow-xs">
                                  <Star className="w-3 h-3 fill-white" />
                                  <span>Featured</span>
                                </span>
                              )}
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F1F5F9] dark:bg-[#1E3A8A]/40 text-[#475569] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#1E3A8A]/50">
                                {project.category}
                              </span>
                            </div>

                            {/* Project Title */}
                            <h3 className="text-lg sm:text-xl font-black text-[#071B49] dark:text-white mb-1.5 tracking-tight group-hover:text-[#0866F5] dark:group-hover:text-[#60A5FA] transition-colors">
                              {project.title}
                            </h3>

                            {/* Subtitle / Description */}
                            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed mb-4 line-clamp-2">
                              {project.subtitle}
                            </p>

                            {/* 3 Checklist Items with Blue Checkmark */}
                            <div className="space-y-1.5 mb-5">
                              {project.features.map((feat) => (
                                <div key={feat} className="flex items-center gap-2 text-xs font-semibold text-[#071B49] dark:text-white">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0866F5] shrink-0" />
                                  <span>{feat}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Action Footer: View Details & View Project Button */}
                          <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9] dark:border-[#1E3A8A]/40">
                            
                            <button
                              type="button"
                              onClick={() => setSelectedProject(project)}
                              className="text-xs font-bold text-[#64748B] hover:text-[#0866F5] dark:text-[#94A3B8] dark:hover:text-[#60A5FA] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <Info className="w-3.5 h-3.5" />
                              <span>View Details</span>
                            </button>

                            <a
                              href={project.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-[#0866F5] hover:bg-[#0654ce] text-white font-bold text-xs px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
                            >
                              <span>View Project</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </a>

                          </div>

                        </div>

                        {/* Right Side: High-Res Project Thumbnail */}
                        <div className="sm:col-span-5 aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-[#E2E8F0] dark:border-[#1E3A8A]/50 bg-slate-100 dark:bg-slate-900">
                          <ProjectImage
                            item={project}
                            imgClassName="group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* =========================================================================
            4. PAGINATION CONTROLS (Matching Approved Reference Image)
           ========================================================================= */}
        {totalPages > 1 && (
          <section className="flex items-center justify-center gap-2.5 mt-14 sm:mt-16" id="portfolio-pagination">
            
            {/* Previous Page Arrow */}
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              className={`w-10 h-10 rounded-full border border-[#E2E8F0] dark:border-[#1E3A8A]/60 bg-white dark:bg-[#071B49] flex items-center justify-center transition-all shadow-xs ${
                currentPage === 1
                  ? 'opacity-40 cursor-not-allowed text-[#94A3B8]'
                  : 'hover:bg-[#F8FAFC] text-[#475569] dark:text-[#CBD5E1] hover:text-[#0866F5] hover:border-[#0866F5] cursor-pointer active:scale-95'
              }`}
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Number Buttons */}
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              const isActive = currentPage === pageNumber;

              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => handlePageChange(pageNumber)}
                  className={`w-10 h-10 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center ${
                    isActive
                      ? 'bg-[#0866F5] text-white shadow-[0_4px_12px_rgba(8,102,245,0.35)] scale-105'
                      : 'border border-[#E2E8F0] dark:border-[#1E3A8A]/60 bg-white dark:bg-[#071B49] text-[#475569] dark:text-[#CBD5E1] hover:text-[#0866F5] hover:border-[#0866F5] shadow-xs'
                  }`}
                  aria-label={`Go to page ${pageNumber}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {pageNumber}
                </button>
              );
            })}

            {/* Next Page Arrow */}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              className={`w-10 h-10 rounded-full border border-[#E2E8F0] dark:border-[#1E3A8A]/60 bg-white dark:bg-[#071B49] flex items-center justify-center transition-all shadow-xs ${
                currentPage === totalPages
                  ? 'opacity-40 cursor-not-allowed text-[#94A3B8]'
                  : 'hover:bg-[#F8FAFC] text-[#475569] dark:text-[#CBD5E1] hover:text-[#0866F5] hover:border-[#0866F5] cursor-pointer active:scale-95'
              }`}
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

          </section>
        )}

      </div>

      {/* Decorative Bottom Wave Swooshes */}
      <div className="w-full overflow-hidden leading-none pointer-events-none -mb-1 opacity-70 dark:opacity-30">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path
            d="M0 40C240 100 480 120 720 70C960 20 1200 40 1440 80V120H0V40Z"
            fill="url(#portfolio-wave-gradient)"
          />
          <defs>
            <linearGradient id="portfolio-wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0866F5" stopOpacity="0.08" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* =========================================================================
          5. PROJECT DETAIL CASE STUDY MODAL (Portal to document.body)
         ========================================================================= */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {selectedProject && (
              <div
                className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
                onClick={() => setSelectedProject(null)}
                id="project-case-study-modal"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white dark:bg-[#071B49] border border-[#E2E8F0] dark:border-[#1E3A8A]/60 rounded-3xl w-full max-w-2xl max-h-[calc(100dvh-32px)] overflow-y-auto shadow-2xl relative my-auto"
                >
                  {/* Close Button */}
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 dark:bg-[#071B49]/90 backdrop-blur-xs text-[#071B49] dark:text-white hover:bg-white border border-[#E2E8F0] dark:border-[#1E3A8A] transition-colors cursor-pointer flex items-center justify-center shadow-md active:scale-95"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* High-Res Image Header */}
                  <div className="w-full aspect-[16/9] overflow-hidden relative rounded-t-3xl">
                    <ProjectImage item={selectedProject} isModal={true} />
                  </div>

                  {/* Details Body */}
                  <div className="p-6 md:p-8 space-y-5">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2.5">
                        <span className="text-xs font-bold text-[#0866F5] dark:text-[#60A5FA] uppercase tracking-wider bg-[#EFF6FF] dark:bg-[#0866F5]/15 px-3 py-1 rounded-full border border-[#DBEAFE] dark:border-[#0866F5]/30">
                          {selectedProject.category}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">
                          <Calendar className="w-3.5 h-3.5 text-[#0866F5]" />
                          {selectedProject.date}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">
                          <User className="w-3.5 h-3.5 text-[#0866F5]" />
                          {selectedProject.client}
                        </span>
                      </div>

                      <h3 className="text-2xl font-black text-[#071B49] dark:text-white tracking-tight">
                        {selectedProject.title}
                      </h3>
                    </div>

                    <p className="text-[#475569] dark:text-[#94A3B8] text-sm md:text-base leading-relaxed">
                      {selectedProject.description}
                    </p>

                    {/* Features Deliverables List */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-2.5">
                        Included Deliverables
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedProject.features.map((feat) => (
                          <div key={feat} className="flex items-center gap-2 text-xs font-semibold text-[#071B49] dark:text-white bg-[#F8FAFC] dark:bg-[#0A1A3A] p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E3A8A]/50">
                            <CheckCircle2 className="w-4 h-4 text-[#0866F5]" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tools & Technologies */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-2.5">
                        Tools &amp; Technologies Used
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.tools.map((tool) => (
                          <span
                            key={tool}
                            className="text-xs font-semibold text-[#071B49] dark:text-[#E2E8F0] bg-[#F1F5F9] dark:bg-[#0A1A3A] border border-[#E2E8F0] dark:border-[#1E3A8A]/50 px-3 py-1 rounded-lg"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1E3A8A]/40 flex justify-end">
                      <a
                        href={selectedProject.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#0866F5] hover:bg-[#0654ce] text-white font-bold text-xs px-5 py-2.5 rounded-full cursor-pointer transition-all shadow-md active:scale-95"
                      >
                        <span>View on Behance</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

    </div>
  );
}
