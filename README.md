# Rohit Verma — Premium Dark Portfolio Website

A highly polished, modern, and visually stunning digital portfolio engineered with **React**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**. Designed for showcasing premium creative services, high-retention post-productions, kinetic motion animations, and automated generative AI workflows.

---

## 🎨 Design System

- **Main Theme Backdrops**: Sleek deep charcoals (`#161616`, `#202020`) layered with organic radial glowing circles and decorative background lines.
- **Color Accents**:
  - Primary Accent: Bright Green (`#59C979`)
  - Secondary Accent: Neon Yellow (`#FFE600`)
  - Critical Highlight/CTA: Coral Red (`#FF4057`)
- **Typography Pairing**: Elegant geometric displays **Manrope** for large scannable headings paired with crisp **Inter** for descriptions and **JetBrains Mono** for technical details.

---

## 📁 Project File Structure

```text
/
├── index.html            # Primary entry point with custom SEO tags, Google Fonts, and Schema.org JSON-LD structured data
├── metadata.json         # Platform configuration settings
├── package.json          # Node dependencies & custom scripts
├── README.md             # Standard instructions manual (this file)
├── src/
│   ├── main.tsx          # Main launcher file
│   ├── App.tsx           # Global component orchestrating navigation scroll tracking and 404 router simulation
│   ├── data.ts           # Unified database containing original portfolio items, testimonials, services, and blogs
│   ├── types.ts          # Strictly typed TypeScript interfaces (Project, Service, Experience, Testimonial, BlogPost)
│   ├── index.css         # Entry CSS with custom webkit scrollbar rules and Tailwind @theme overrides
│   └── components/       # Modular, isolated sub-components
│       ├── Header.tsx             # Sticky responsive top-nav bar with sliding mobile drawer
│       ├── HeroSection.tsx        # Title typist animations, profile frame, and floating tool badges
│       ├── AboutSection.tsx       # Creative workspace, bio summary, and viewport-triggered counters
│       ├── SkillsSection.tsx      # SVG-animated circular percentage cards with hovering glowing lifts
│       ├── ServicesSection.tsx    # Responsive interactive category tabs and services cards
│       ├── ExperienceSection.tsx  # Timeline wide-cards with coral highlighting and visitor redirects
│       ├── PortfolioSection.tsx   # Swiping/draggable carousel slider and detailed project metrics modal
│       ├── TestimonialSection.tsx # Elegant star rating fader and client bio sliders
│       ├── PricingSection.tsx     # Creative package checklists with direct pre-filled WhatsApp click-to-chats
│       ├── BlogSection.tsx        # Latest Insights grid and rich reading viewport modal
│       ├── ContactSection.tsx     # Intake forms with react-hook-form validation, API integration hooks, and drag-and-drop file uploader
│       ├── Footer.tsx             # 4-column brand navigation, services checklist, and newsletter validator
│       ├── FloatingElements.tsx   # Top viewport scroll progress bar, floating WhatsApp trigger, and back-to-top button
│       └── NotFound.tsx           # Simulated 404 digital asset missing page with interactive visual
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18+) installed.

### Installation

1. Clone the project and navigate to the root directory:
   ```bash
   npm install
   ```

2. Run the development environment:
   ```bash
   npm run dev
   ```
   The local development server binds to `http://localhost:3000`.

### Production Build

Compile the application assets into a highly compressed, optimized static bundle:
```bash
npm run build
```
The output directory will be compiled in the `/dist` folder, ready for deployment to any CDN or hosting container.

---

## 🔧 Personalization Guidelines

To brand the portfolio as your own, modify the central database files:
1. **Core Data (`src/data.ts`)**: Replace sample items, company descriptions, resume bullet points, client star ratings, pricing tiers, and article contents.
2. **Profile Portrait**: Replace the profile thumbnail image in `/src/assets/images/hero_portrait_1784367637878.jpg` or modify the file path directly in `src/components/HeroSection.tsx` and `src/components/Header.tsx`.
3. **SEO & Structured Data**: Open `index.html` and update telephone, geo-coordinates, address location, social media links, and author credentials to match your own profile.
