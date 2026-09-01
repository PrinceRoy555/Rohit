# FULL PROJECT AUDIT — ROHIT VERMA PORTFOLIO & CMS/CRM ENGINE

**Audit Date:** 2026-08-31
**Auditor:** Senior Full-Stack Software Engineer, Security Engineer, Firebase Architect, DevOps Engineer

---

## 1. Executive Summary

This audit evaluates the Rohit Verma Portfolio application across architecture, persistence, authentication, CMS live-wire pipelines, CRM lead consolidation, security, asset optimization, SEO, and deployment readiness.

While the user interface, styling, animations, and administrative dashboard layouts are rich and complete, the underlying data layers exhibited critical architectural deficiencies: in-memory state stores, unlinked public UI components using static data fixtures instead of live `SiteConfig`, unauthenticated/mocked admin provisioning, fragmented CRM tables, and mismatched Firestore security rules.

---

## 2. Comprehensive Component & Service Audit

| Area / File | Issues Identified | Severity | Remediation Plan |
| :--- | :--- | :--- | :--- |
| **`server.ts`** | - In-memory state for `serverSiteConfig`, `serverDraftConfig`, `serverTemplates`, `serverRevisions`, `serverInquiries`, `serverInsights`, `activeSessions`, `adminAuditLogs`<br>- Hard-coded admin password fallback in source<br>- Fixed `PORT = 3000` (missing `process.env.PORT`)<br>- Unauthenticated user creation mock in `/api/admin/users`<br>- Mock email dispatcher logging to console | **CRITICAL** | Transition all persistence to Firestore collections (`siteConfig`, `siteRevisions`, `siteTemplates`, `insights`, `leads`, `media`, `adminProfiles`, `adminAuditLogs`, `settings`). Use Firebase Auth ID tokens verified server-side. |
| **`src/context/SiteConfigContext.tsx`** | - Relies on in-memory `/api/site-config` and `/api/site-config/draft`<br>- When token is lost on page refresh, draft state was lost | **HIGH** | Wire persistent Firestore `siteConfig/live` (public) and `siteConfig/draft` (admin) synchronization with fallback to default config. |
| **Public UI Components** (`HeroSection.tsx`, `Header.tsx`, `PortfolioSection.tsx`, `ServicesSection.tsx`, `PricingSection.tsx`, `TestimonialSection.tsx`, `SkillsSection.tsx`, `ExperienceSection.tsx`, `AboutSection.tsx`, `Footer.tsx`) | - Several components hardcoded references to `PROJECTS_DATA`, `SERVICES_LIST`, `TESTIMONIALS_DATA`, `EXPERIENCE_DATA`, `GLOBAL_ROLES`, `contactConfig` rather than using published `SiteConfig` from `useSiteConfig()`<br>- Sections ignored CMS `isVisible` and dynamic ordering | **CRITICAL** | Refactor all public sections to consume `useSiteConfig()`, respecting `config.sections.*` visibility, labels, subtitles, badges, ordering, custom branding, pricing tiers, and portfolio items. |
| **`src/services/adminApi.ts` & `src/services/cmsApi.ts`** | - Assumed JSON responses without status code guarding<br>- In-memory bearer token erased on browser reload<br>- No auto-retry or graceful error recovery | **HIGH** | Unify API utilities with robust HTTP status checks (200, 201, 400, 401, 403, 404, 409, 429, 500), Firebase Auth token propagation, and structured error responses. |
| **Insights / Blog Engine** (`src/components/BlogSection.tsx`, `src/components/Admin/AdminInsightsDashboard.tsx`) | - Fragmented: Admin wrote to Express server memory while public blog read Firestore/static fixtures<br>- Public queries did not strictly constrain `where('status', '==', 'published')` | **HIGH** | Unify under single canonical Firestore collection `insights`. Admin manages full lifecycle (Draft, Review, Scheduled, Published), and public blog queries published posts. |
| **CRM / Lead Engine** (`src/services/firebase/firestore.ts`, `src/components/ContactSection.tsx`, `src/components/AIChatbot.tsx`, `PricingSection.tsx`) | - Fragmented across 4 collections (`contactEnquiries`, `chatbotLeads`, `quoteRequests`, and Express in-memory array)<br>- Contact form timeout could lead to false failure alerts<br>- Missing unified search, filtering, and notes status updates in admin | **HIGH** | Unify all lead generation into canonical `leads` collection with backward-compatibility layer. Implement idempotent submission IDs. |
| **Newsletter Signup** | - Client called `getDoc()` on `newsletterSubscribers` before write, which was blocked by public read denial in Firestore rules | **MEDIUM** | Implement idempotent direct write / setDoc with deterministic docId (`hashEmailToDocId`), preventing enumeration while enabling seamless subscription. |
| **`firestore.rules` & `storage.rules`** | - Missing explicit rules for `siteConfig`, `siteRevisions`, `siteTemplates`, `leads`, `media`, `adminProfiles`<br>- Storage rules lacked dedicated path for admin CMS media (`cms-media/{uid}/...`) | **HIGH** | Update `firestore.rules` and `storage.rules` to enforce strict zero-trust role-based access control (Super Admin, Admin, Editor) and validate public lead creation. |
| **AI Chatbot & Security** (`server.ts`, `AIChatbot.tsx`) | - `/api/chat` lacked IP rate limiting and history length bounds<br>- Potential Gemini key exposure if not isolated server-side | **MEDIUM** | Implement token bucket / sliding window per-IP rate limiter, sanitize inputs, restrict payload sizes, and enforce server-side Gemini invocation. |
| **SEO & Sitemap** (`public/sitemap.xml`, `src/seoConfig.ts`, `index.html`) | - `sitemap.xml` relative path loc tags vs absolute URLs<br>- Dynamic metadata sync needed with CMS SEO settings | **MEDIUM** | Ensure absolute URLs in sitemap using production domain, update meta tags dynamically from `config.seo`. |
| **Asset Hygiene** | - Duplicate large assets in `public/images` and `src/assets/images`<br>- Missing image optimization and corrupted binary PNG header in youtube thumbnail | **MEDIUM** | Re-encode assets, optimize WebP formats, ensure proper fallbacks, and fix invalid image references. |

---

## 3. Execution Plan

1. **Phase 2–4:** Implement Firestore persistence for `siteConfig/live`, `siteConfig/draft`, revisions, templates, and full publish/rollback pipeline.
2. **Phase 5–7:** Implement Firebase Auth admin authentication, role verification (Super Admin / Admin / Editor), and persistent sessions.
3. **Phase 3:** Live-wire all frontend sections (`Header`, `Hero`, `Portfolio`, `Services`, `Pricing`, `Testimonials`, `Experience`, `Skills`, `Footer`, `SEO`) to `SiteConfig`.
4. **Phase 8:** Unify Admin Insights and Public Blog on Firestore `insights`.
5. **Phase 9–13:** Unify CRM pipelines into `leads`, fix contact form idempotency & email adapter, fix newsletter.
6. **Phase 14–16:** Secure storage rules, protect Gemini `/api/chat`, configure Express production server with dynamic `PORT`.
7. **Phase 17–25:** Fix API error handlers, audit logs, SEO/sitemap, asset optimization, Error Boundary, type safety, and test admin UX.
8. **Phase 26–32:** Execute validation tests, build verification, environment configuration, and complete documentation.
