# Comprehensive Technical SEO & Website Audit Report
**Target Website:** [https://www.rohitwork.in/](https://www.rohitwork.in/)  
**Website Architecture:** React 19 SPA (Vite) + Node/Express (`server.ts`) + Firebase (Auth/Firestore) + Vercel Serverless  
**Auditor:** Senior Technical SEO Specialist & Frontend Systems Architect  
**Audit Date:** November 2, 2026  
**Audit Mode:** Audit Only — Zero Code Mutations Implemented (Awaiting Client Approval)  

---

## Executive Summary & Scorecard

### Overall Website SEO Score: **68 / 100**
The website has strong aesthetic execution, excellent visual performance, valid responsive design, and basic metadata configured. However, because it is structured as a client-side rendered Single Page Application (SPA) on Vercel without Server-Side Rendering (SSR) or Static Pre-rendering for metadata and deep pages, it suffers from several critical indexing bottlenecks, soft 404 vulnerabilities, keyword omission on primary target phrases, and missing Local SEO schema.

```
┌──────────────────────────────────────────┬───────┬────────────────┐
│ Category                                 │ Score │ Status         │
├──────────────────────────────────────────┼───────┼────────────────┤
│ 1. Technical SEO & Architecture          │ 62%   │ Needs Attention│
│ 2. Page Titles & Meta Descriptions       │ 74%   │ Moderate       │
│ 3. Heading Hierarchy (H1–H6)             │ 60%   │ Needs Attention│
│ 4. Sitemap.xml & Robots.txt              │ 70%   │ Moderate       │
│ 5. Canonical URLs & Duplicate Content    │ 55%   │ High Risk      │
│ 6. Google Indexing & Crawlability        │ 58%   │ High Risk      │
│ 7. React SPA Rendering & WRS Execution   │ 60%   │ High Risk      │
│ 8. HTTP Status Codes & 404 Handling      │ 50%   │ Critical Risk  │
│ 9. Image SEO & Alt Attributes            │ 76%   │ Moderate       │
│ 10. Open Graph & Social Sharing Cards    │ 65%   │ Needs Attention│
│ 11. Schema Markup & Structured Data      │ 70%   │ Moderate       │
│ 12. Mobile SEO & Responsive UX           │ 94%   │ Excellent      │
│ 13. Page Speed & Core Web Vitals (Sim.)  │ 86%   │ Good           │
│ 14. Internal Linking & Crawl Paths       │ 64%   │ Moderate       │
│ 15. Jaipur Local SEO                     │ 52%   │ High Priority  │
│ 16. India-Wide SEO Coverage              │ 48%   │ High Priority  │
│ 17. Service & Portfolio Deep Indexing    │ 54%   │ High Priority  │
│ 18. Conversion & Lead Capture (CRO)      │ 92%   │ Excellent      │
└──────────────────────────────────────────┴───────┴────────────────┘
```

---

## Target Keyword Baseline Evaluation

| Target Keyword | In `<title>` | In `<meta description>` | In `<h1>` | In `<h2>` | Dedicated Indexable URL | Ranking Difficulty | Current Visibility Potential |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Graphic Designer in Jaipur** | **Yes** | **Yes** | **No** (Only "Rohit Verma.") | **No** | **No** (Combined on Home) | Medium | Moderate |
| **Freelance Graphic Designer Jaipur** | **No** | **No** | **No** | **No** | **No** | Medium | Very Low |
| **Logo Designer in Jaipur** | **No** | **No** | **No** | **No** | **No** (Inside modal) | High | Poor |
| **Video Editor in Jaipur** | **Yes** | **Yes** | **No** | **No** | **No** (Combined on Home) | Medium | Moderate |
| **Branding Services India** | **No** | **No** | **No** | **No** | **No** | High | Very Low |
| **Social Media Designer India** | **No** | **No** | **No** | **No** | **No** | Medium-High | Poor |

---

## Detailed Audit by Focus Area (1–19)

### 1. Technical SEO
- **Protocol & HTTPS:** The site enforces HTTPS with secure headers configured in `server.ts` (`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`).
- **Trailing Slash Consistency:** URLs can be resolved with or without trailing slash. Canonical tags in `src/seoConfig.ts` normalize without trailing slash (except root `/`), but server-level 301 redirects to enforce a single canonical trailing slash convention are not active in `vercel.json`.
- **Character Encoding & Viewport:** Valid `UTF-8` and responsive `width=device-width, initial-scale=1.0, viewport-fit=cover` present in `index.html`.
- **Compression & HTTP/2:** Enabled on Vercel Edge.

### 2. Page Titles and Meta Descriptions
- **Homepage:**
  - `<title>`: `Rohit Verma | Graphic Designer & Video Editor in Jaipur` (58 chars — **Optimal**).
  - `<meta name="description">`: `Graphic designer and video editor in Jaipur specializing in branding, social media creatives, motion graphics and visual design. Explore Rohit Verma's work.` (158 chars — **Optimal**).
- **Subpage Titles (Defined in `src/seoConfig.ts`):**
  - `/about-rohit`: `About Rohit Verma | Graphic Designer & Video Editor in Jaipur` (60 chars)
  - `/services`: `Design & Video Editing Services | Rohit Verma — Jaipur` (54 chars)
  - `/portfolio`: `Creative Portfolio & Featured Projects | Rohit Verma` (52 chars)
  - `/experience`: `Work Experience & Career Timeline | Rohit Verma` (47 chars)
  - `/blog`: `Design Insights & Creative Articles | Rohit Verma` (49 chars)
  - `/contact`: `Contact Rohit Verma | Graphic Designer & Video Editor in Jaipur` (63 chars)
- **Critical Flaw:**
  - In `index.html`, all static meta tags are hardcoded to the homepage. When a crawler fetches `https://www.rohitwork.in/services` via standard HTTP request, the static HTML sent by Vercel contains the homepage title and description.
  - The client-side updater (`updateDocumentMetadata`) updates `<title>` only *after* React mounts and executes in the client browser. Search engine bots that inspect initial HTML see identical titles across all subpages.

### 3. Heading Hierarchy (H1, H2, H3)
- **Homepage H1 Issue:**
  - The sole `<h1>` in `src/components/HeroSection.tsx` (line 293) renders:
    ```html
    <h1>Rohit Verma.</h1>
    ```
  - While visually striking, an H1 that only contains the personal name misses the most important on-page SEO ranking signal for primary queries.
  - The target keywords ("Graphic Designer & Video Editor in Jaipur") are rendered inside secondary `<div>` and `<span>` elements rather than the semantic heading.
- **Homepage H2 Issues:**
  - `AboutSection.tsx`: `<h2>About Rohit</h2>` (Generic, no keywords)
  - `ServicesSection.tsx`: `<h2>My Creative Services</h2>` (Generic, lacks "Jaipur" or "India")
  - `PortfolioSection.tsx`: `<h2>Recent Work.</h2>` (Generic)
  - `ExperienceSection.tsx`: `<h2>Career & Work Experience</h2>`
  - `SkillsSection.tsx`: `<h2>Creative Technologies</h2>`
  - `PricingSection.tsx`: `<h2>Creative Packages</h2>`
  - `BlogSection.tsx`: `<h2>Latest Insights</h2>`
  - `ContactSection.tsx`: `<h2>Let's Work Together</h2>`
  - **Verdict:** There is not a single H2 heading that targets "Logo Designer in Jaipur", "Freelance Graphic Designer Jaipur", "Branding Services India", or "Video Editor in Jaipur". Search engines evaluating heading relevancy find only generic agency section titles.

### 4. Sitemap.xml and Robots.txt
- **Robots.txt (`/public/robots.txt` & `/api/robots.txt`):**
  - Correctly permits all user-agents (`Allow: /`).
  - Correctly blocks restricted paths (`Disallow: /admin`, `Disallow: /admin/`, `Disallow: /api/`).
  - Specifies `Sitemap: https://www.rohitwork.in/sitemap.xml`.
- **Sitemap.xml (`server.ts` dynamic endpoint lines 2186–2327):**
  - Includes 9 core static routes (`/`, `/about-rohit`, `/services`, `/portfolio`, `/experience`, `/blog`, `/contact`, `/privacy-policy`, `/terms-and-conditions`).
  - Dynamically queries Firestore for published articles and appends `/insights/[slug]`.
- **Critical Risk:**
  - There is **no physical `sitemap.xml` file in `/public`**.
  - In Vercel (`vercel.json`), requests to `/sitemap.xml` are rewritten to `/api`. If the serverless function hits a cold-start timeout, memory threshold, or Firestore connection latency (>3.5s), the crawler receives an empty sitemap or server error.
  - The sitemap does NOT include Google Image extensions (`<image:image><image:loc>...`), preventing high-intent image indexing of Rohit's portfolio designs.

### 5. Canonical URLs and Duplicate Content
- **Static vs. Client-Side Canonical Mismatch:**
  - In `index.html` (line 42): `<link rel="canonical" href="https://www.rohitwork.in/" />`.
  - Because Vercel rewrites all routes `/(.*)` to `/index.html`, whenever a search engine crawls `https://www.rohitwork.in/services` or `https://www.rohitwork.in/portfolio`, the raw HTML declares the canonical is `https://www.rohitwork.in/`.
  - This sends an explicit signal to search engine indexers that subpages are duplicate copies of the homepage and should be canonicalized (and excluded) in favor of the homepage!
- **URL Aliasing Duplication:**
  - In `src/App.tsx` (lines 176–196):
    - `/about`, `/about-rohit`, `/rohit-verma`, `/unicivix`, `/unicivix-solutions` all resolve to the same content.
    - `/blog` and `/insights` both resolve to the same content.
    - `/privacy` and `/privacy-policy` both resolve to the same content.
    - `/terms` and `/terms-and-conditions` both resolve to the same content.
  - While `seoConfig.ts` sets client-side canonical tags, these duplicate URL aliases are accessible with HTTP 200 rather than issuing a permanent 301 redirect to the authoritative canonical URL.

### 6. Google Indexing & Crawlability
- **Two-Wave Indexing Delay:**
  - Googlebot uses a two-wave indexing system for SPAs. Wave 1 crawls the HTML and indexes text/links. Wave 2 queues JavaScript rendering via headless Chromium (which can take hours to weeks depending on crawl budget).
  - Because all main content is rendered via client JavaScript in `<div id="root">`, new articles, portfolio items, and service updates experience indexing latency.
- **Disallowed Link in Public Markup:**
  - In `src/components/Footer.tsx` (line 327):
    ```html
    <a href="/admin">Admin Portal</a>
    ```
  - This followable link points to a route disallowed in `robots.txt` (`Disallow: /admin`). Crawlers follow this link and encounter a block, wasting crawl budget. It must include `rel="nofollow"`.

### 7. React Rendering and SEO
- The application relies on Vite + React 19 Client-Side Hydration.
- When JavaScript is disabled, the initial HTML shows an empty `<div id="root"></div>`.
- Search engines other than Google (Bing, DuckDuckGo, Baidu, Yandex, Yahoo) have significantly weaker JavaScript rendering engines. They may index little to no body copy from `rohitwork.in`.

### 8. HTTP Status Codes and 404 Handling (Soft 404 Vulnerability)
- **Soft 404 Flaw:**
  - When a visitor or crawler requests a non-existent URL (e.g., `https://www.rohitwork.in/invalid-page-xyz`), Vercel rewrites the request to `/index.html` and returns an **HTTP 200 OK** response.
  - Inside the browser, React checks the path in `src/App.tsx` (line 210), sets `currentRoute = '404'`, and displays the `<NotFound />` component.
  - **Why this matters:** Google Search Console flags this as a **"Soft 404"** error. Googlebot detects that the page content indicates "Page Not Found", but the server header reports `200 OK`. Having multiple Soft 404s damages the domain's crawl health.

### 9. Image Alt Attributes & Media SEO
- **Strengths:**
  - The hero portrait has an alt tag: `alt="Rohit Verma – Graphic Designer and Video Editor in Jaipur"` with `width="460"` and `height="440"`.
  - Portfolio items dynamically set `alt={`${project.title} - ${project.category} portfolio project`}`.
  - Category icons and avatars contain alt text.
- **Weaknesses:**
  - Images are served from third-party CDNs (ImageKit, Unsplash) without self-hosted domain CNAME (e.g., `assets.rohitwork.in` or `/images/...`).
  - Next-gen image format `<picture>` tags with WebP/AVIF fallbacks are not implemented. Several PNG/JPG assets exist in `/public/images` where modern `.webp` versions are available but unused.
  - Image filenames on external CDNs contain arbitrary names (`ChatGPT Image Sep 10...png`) rather than keyword-rich filenames (`freelance-graphic-designer-jaipur-rohit-verma.webp`).

### 10. Open Graph & Social Sharing Cards
- `index.html` includes:
  - `og:type`: `website`
  - `og:title`: `Rohit Verma | Graphic Designer & Video Editor in Jaipur`
  - `og:description`: 158-character summary
  - `og:image`: `https://www.rohitwork.in/images/rohit-verma-og.jpg`
  - `og:url`: `https://www.rohitwork.in/`
  - `twitter:card`: `summary_large_image`
- **Weaknesses:**
  - Social scrapers (WhatsApp, LinkedIn, Twitter/X, Facebook, Telegram) **do not execute JavaScript**.
  - When any user shares an insight link (e.g., `https://www.rohitwork.in/insights/visual-psychology-high-ctr`) on LinkedIn or WhatsApp, the scraper reads `index.html` directly and displays the *homepage* image and title instead of the article's custom thumbnail and headline.
  - Missing dimensions: `og:image:width` (1200) and `og:image:height` (630) are omitted, which causes delays or small thumbnails on Facebook/iMessage.

### 11. Schema Markup & Structured Data
- **Existing Markup (`index.html` lines 68–120):**
  - `@type: "Person"` (Rohit Verma, jobTitle, address, knowsAbout, sameAs).
  - `@type: "WebSite"` (Rohit Verma Portfolio).
- **Missing Schemas:**
  - **`ProfessionalService` / `LocalBusiness` Schema:** Missing! Without this, Google cannot feature the site in the local 3-pack or knowledge panel for local Jaipur queries.
  - **`Service` Catalog Schema:** Missing! The 16 graphic design, video editing, and branding service offerings have no structured data.
  - **`FAQPage` Schema:** Missing! High-value FAQs in `src/servicesData.ts` and `src/components/PricingSection.tsx` are not marked up, forfeiting FAQ rich snippets in SERP.
  - **`AggregateRating` / `Review` Schema:** The 6 verified client testimonials in `src/data.ts` lack review markup.

### 12. Mobile SEO
- **Status: Excellent (94/100)**
- Viewport is properly configured.
- Touch targets meet the 44px–48px accessibility minimum.
- Typography scales fluidly using `clamp()` and responsive Tailwind breakpoints.
- No horizontal scrollbars or clipping at 320px, 375px, 390px, or 768px.

### 13. Page Speed & Core Web Vitals (Simulated Architecture Review)
- **Largest Contentful Paint (LCP):**
  - Hero image in `src/components/HeroSection.tsx` has `fetchPriority="high"`.
  - Google Fonts preconnect tags (`fonts.googleapis.com`, `fonts.gstatic.com`) with `display=swap` are present.
- **Cumulative Layout Shift (CLS):**
  - Dimensions on the hero frame and metrics container prevent layout shifts.
  - Portfolio grid cards have reserved aspect ratios (`aspect-[4/3]`).
- **Interaction to Next Paint (INP):**
  - React 19 concurrent features. Event listeners are debounced / RAF-throttled.
- **Speed Opportunity:**
  - Preload the hero portrait image: `<link rel="preload" as="image" href="..." fetchpriority="high" />`.

### 14. Internal Linking
- Primary navigation and footer links allow crawlers to discover all sections.
- **Weakness:**
  - Blog insights do not contain contextual in-text hyperlinks pointing to Rohit's service packages (e.g., an article discussing YouTube thumbnails does not link to the YouTube Thumbnail Design service or inquiry form).
  - Category filters in the portfolio are JavaScript state changes (`filter`) rather than real crawlable URLs (`/portfolio/branding`, `/portfolio/video-editing`).

### 15. Jaipur Local SEO
- **Current State:**
  - "Jaipur" is present in title, meta description, and biography copy.
- **Missing Elements for Local Map/Search Dominance:**
  - **Geo Meta Tags:** `<meta name="geo.region" content="IN-RJ" />`, `<meta name="geo.placename" content="Jaipur" />`, `<meta name="geo.position" content="26.9124;75.7873" />` are missing.
  - **Google Business Profile (GBP) Embed/Link:** No link or schema referencing an active Google Map listing.
  - **Neighborhood & Local Context:** Copy mentions "Jaipur & Across India" generally, but lacks localized service area signals (e.g., Malviya Nagar, Mansarovar, Vaishali Nagar, C-Scheme, Sitapura, Jagatpura).

### 16. India-Wide SEO
- Target keywords **"Branding Services India"** and **"Social Media Designer India"** have near-zero presence on the site.
- There are no localized landing pages or sub-sections addressing pan-India clients (e.g., startups in Bengaluru, Mumbai, Delhi-NCR, Hyderabad).
- The pricing section lists rates in INR (₹) without international currency toggle or pan-India GST/invoicing assurances.

### 17. Service Pages & Portfolio Deep Indexing
- **Major Finding:**
  - In `src/components/ServicesSection.tsx`, clicking on any service (e.g., *Brand Identity Designer*, *Social Media Designer*, *Motion Graphics*, *Video Editor*) opens a client-side modal (`ServiceDetailModal.tsx`).
  - **There are no distinct URLs for individual services.**
  - A search engine cannot index `/services/logo-designer-jaipur` or `/services/video-editor-jaipur` because these pages do not exist as separate URLs.
  - The entire detailed service information (deliverables, process, tools, FAQs) is locked inside a modal that crawlers cannot deep-link to.

### 18. Lead Generation & Conversion Rate Optimization (CRO)
- **Status: Excellent (92/100)**
- Multi-channel direct outreach:
  - 1-click WhatsApp Business button with pre-filled message.
  - Direct click-to-call (`tel:+917732869027`).
  - Direct mailto link.
  - Structured Project Inquiry Form with budget selection and file attachment support.
  - Floating WhatsApp button and AI assistant.
- **CRO Recommendation:**
  - Add explicit trust signals next to the form submit button ("100% Confidential Brief", "Direct Response from Rohit within 2 Hours", "Zero Obligation Consultation").

### 19. Analytics & Event Tracking
- In `server.ts` line 36 and `src/lib/firebase.ts` line 19, `measurementId: 'G-PRMKZMV6LR'` is present in configuration.
- **However, `index.html` does NOT contain the Google Tag (`gtag.js`) or Google Tag Manager container snippet!**
- Without `gtag.js` loaded in the HTML head, Google Analytics 4 is not recording pageviews, referral paths, or bounce rates.

---

## Issue Priority Matrix

### Critical Priority (Must Fix for Indexing & Rankings)
1. **Server-Side Soft 404 Resolution:** Non-existent routes return HTTP 200 instead of HTTP 404, generating Soft 404 errors in Google Search Console.
2. **Missing Google Analytics / GTM Tag:** `index.html` lacks `gtag.js`, resulting in zero verified traffic analytics.
3. **Static Canonical Overwrite:** `index.html` hardcodes `href="https://www.rohitwork.in/"`, causing all crawled subpages to declare themselves duplicates of the homepage.
4. **Social Sharing Metadata Fallback:** Server lacks meta injection for dynamic blog articles (`/insights/:slug`), displaying generic homepage previews on WhatsApp and LinkedIn.

### High Priority (Significant Impact on Rankings & Local Visibility)
5. **Homepage H1 Lacks Target Keywords:** H1 is solely `Rohit Verma.` without "Graphic Designer & Video Editor in Jaipur".
6. **No Dedicated Service URLs:** Services exist only inside a client-side modal, preventing search engines from ranking individual service keywords ("Logo Designer in Jaipur", "Video Editor in Jaipur").
7. **Missing `LocalBusiness` / `ProfessionalService` Schema:** Google lacks structured geo, opening hours, and service catalog data for Jaipur local search.
8. **Missing Target Keywords in Headings:** H2 tags are generic ("Recent Work", "Creative Packages", "Latest Insights") without local keyword modifiers.
9. **Missing Static `sitemap.xml` in `/public`:** The sitemap relies solely on dynamic serverless execution without a static build fallback.

### Medium Priority (Optimization & Performance)
10. **Missing Image Sitemaps:** Portfolio designs are omitted from XML sitemap format.
11. **Followable `/admin` Link in Footer:** Footer links to disallowed `/admin` path without `rel="nofollow"`.
12. **Missing Geo Meta Tags:** No `geo.region`, `geo.placename`, or `geo.position` tags in `index.html`.
13. **Missing FAQ & Review Schema:** Existing client testimonials and service FAQs lack JSON-LD rich snippet markup.
14. **Legacy Image Formats:** Several public images are served as uncompressed PNG/JPG instead of `.webp`.

### Low Priority (Polish & Brand Consistency)
15. **Unrelated GitHub Link:** Footer links to personal GitHub profile (`PrinceRoy555`), diluting design agency branding.
16. **Duplicate Route Aliases:** `/about` vs `/about-rohit` and `/blog` vs `/insights` resolve without 301 redirects.

---

## Affected Files & URLs

| File Path | Related URL | Identified Issue |
| :--- | :--- | :--- |
| `index.html` | `https://www.rohitwork.in/` | Missing GA4 tag, hardcoded static canonical, missing Geo tags, missing LocalBusiness schema |
| `vercel.json` | All routes | Missing 301 redirect rules for duplicate aliases, single-page rewrite causes Soft 404 |
| `server.ts` | `/sitemap.xml`, `/404` | No true HTTP 404 header for unknown routes; dynamic sitemap missing image tags |
| `public/robots.txt` | `/robots.txt` | Valid, but references `/sitemap.xml` which lacks static file fallback |
| `src/seoConfig.ts` | All routes | Contains metadata logic, but only applies client-side; missing target keywords in schemas |
| `src/components/HeroSection.tsx` | `/` | H1 contains only "Rohit Verma." without professional keywords |
| `src/components/ServicesSection.tsx`| `/services` | H2 is generic; service details are locked in modal with no indexable URLs |
| `src/components/AboutSection.tsx` | `/` & `/about-rohit` | H2 is generic ("About Rohit") without local keywords |
| `src/components/PortfolioSection.tsx`| `/portfolio` | H2 is generic ("Recent Work."); category filters are JS-only without permalinks |
| `src/components/PricingSection.tsx` | `/services` | H2 is generic; lacks FAQPage schema |
| `src/components/Footer.tsx` | All pages | Followable link to `/admin` without `rel="nofollow"`; links to unoptimized GitHub profile |

---

## Top 10 Recommended Improvements

1. **Optimize Homepage H1 & Subheadings:**
   Update `HeroSection.tsx` so the semantic H1 includes Rohit's primary keyword:
   `Rohit Verma — Graphic Designer & Video Editor in Jaipur`.
2. **Install Google Tag Manager / GA4 in `index.html`:**
   Add the Google Analytics 4 tag directly into `<head>` to begin tracking verified traffic and conversion events.
3. **Implement Dedicated Service Landing Pages:**
   Allow services to be navigated via crawlable URLs (e.g., `/services/logo-designer-jaipur`, `/services/video-editor-jaipur`, `/services/branding-services-india`) with dedicated H1s, FAQs, and schemas.
4. **Add `LocalBusiness` / `ProfessionalService` JSON-LD Schema:**
   Include Jaipur coordinates, service catalog, business hours, and phone in `index.html`.
5. **Generate a Static `public/sitemap.xml` at Build Time:**
   Ensure a guaranteed physical XML sitemap exists in `/public` so crawlers never encounter serverless timeout errors.
6. **Include Image Extensions in Sitemap:**
   Add `<image:image>` entries for all high-resolution portfolio designs to rank in Google Images.
7. **Fix Soft 404s via Server Response:**
   Configure `server.ts` to return true HTTP 404 status codes for invalid routes before serving the fallback HTML.
8. **Add Geo Meta Tags for Jaipur:**
   Add `IN-RJ` and Jaipur coordinate meta tags to `index.html` for local search signals.
9. **Add FAQPage and Review Schema:**
   Mark up the client testimonials and service FAQs with Schema.org JSON-LD to unlock SERP rich snippets.
10. **Add `rel="nofollow"` to `/admin` Links:**
    Prevent search engines from crawling the admin portal link in the footer.

---

## Missing SEO Configurations Checklist

- [ ] Google Tag Manager / GA4 `<script>` in `index.html`
- [ ] Static `/public/sitemap.xml` file
- [ ] Image sitemap XML namespace (`xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"`)
- [ ] Geo meta tags (`geo.region`, `geo.placename`, `geo.position`, `ICBM`)
- [ ] Open Graph image dimensions (`og:image:width`, `og:image:height`)
- [ ] `ProfessionalService` Schema with Jaipur geo-coordinates
- [ ] `FAQPage` Schema for pricing and service FAQs
- [ ] `Review` / `AggregateRating` Schema for client testimonials
- [ ] Server-side meta tag injection for `/insights/:slug` social cards
- [ ] HTTP 301 permanent redirect rules in `vercel.json` for URL aliases

---

## Audit Areas Requiring Google Search Console & Analytics Access

The following verifications cannot be performed from the codebase alone and require access to Rohit's Google Search Console and Google Analytics accounts:

1. **Current Indexing Status & Crawl Stats:**
   - How many of Rohit's URLs are currently in Google's index vs. "Crawled - currently not indexed" or "Discovered - currently not indexed".
2. **Actual Soft 404 Warnings:**
   - Verification of URLs currently flagged as Soft 404 in GSC's Page Indexing report.
3. **Core Web Vitals Field Data (CrUX):**
   - Real-world user experience metrics (LCP, INP, CLS) from Chrome User Experience Report (lab simulations cannot substitute for 75th-percentile field data).
4. **Organic Search Queries & Impressions:**
   - Baseline CTR, impressions, and average positions for "Graphic Designer in Jaipur", "Logo Designer in Jaipur", and "Video Editor in Jaipur".
5. **Mobile Usability & Manual Actions:**
   - Checking for any historical manual spam actions or security penalties.
6. **Google Business Profile (GBP) Insights:**
   - Local Map pack views, direction requests, and direct phone call actions from Jaipur searches.

---
*Report generated and archived at `SEO-AUDIT-REPORT.md`. No code modifications have been made.*
