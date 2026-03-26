# PRD: SetFlow Landing Page + Desktop Experience

> **Status:** SHIPPED
> **Owner:** Kwadwo
> **Created:** 2026-01-18
> **Project:** gym-tracker (SetFlow)
> **Roadmap Phase:** Phase 2 - Desktop & Marketing

---

## Problem Statement

SetFlow has two critical UX gaps:

1. **No marketing presence** - The app immediately requires authentication. Potential users cannot learn what SetFlow does, see screenshots, or understand its value before signing up. This hurts conversion and makes sharing the app pointless.

2. **Desktop is unusable** - Despite being accessed on desktop browsers (laptop/desktop gym users, program editing at home), the app is entirely mobile-optimized. Wide screens show a narrow column with massive empty space. Header icons have no labels. Forms are single-column when they could be multi-column.

**Who has this problem:**
- New users landing on setflow.app for the first time
- Existing users accessing the app on desktop/laptop
- Users sharing SetFlow with friends (they see a login wall)

**What happens if we don't solve it:**
- Poor first impressions kill signups
- Desktop users have a frustrating experience
- App feels "unfinished" on larger screens

---

## Proposed Solution

A two-part upgrade:

### Part A: Marketing Landing Page
A public landing page at `/` for signed-out users featuring:
- Hero section with app preview and value proposition
- Feature showcase (workout tracking, progressive overload, achievements)
- Social proof section (testimonials, stats)
- Clear CTAs to sign up

### Part B: Desktop Layout Optimization
Responsive layouts for signed-in users featuring:
- Sidebar navigation on desktop (replaces icon-only header)
- Multi-column layouts for programs, stats, nutrition
- Larger touch targets and improved information density
- Better use of horizontal screen space

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Landing page conversion | 15%+ click-through to signup | Analytics: CTA clicks / page views |
| Bounce rate | <50% on landing page | Vercel Analytics |
| Desktop session duration | +20% vs current | Compare before/after with Vercel Analytics |
| User feedback | No "mobile app on desktop" complaints | Support/feedback channels |
| Lighthouse Performance | 90+ score on landing page | Lighthouse CI |
| Layout stability | CLS <0.1 on all viewports | Core Web Vitals monitoring |

---

## Requirements

### Part A: Landing Page

#### Must Have
- [ ] Hero section with headline, subheadline, and CTA button
- [ ] App preview mockup (screenshot or animated)
- [ ] 3-4 feature cards with icons and descriptions
- [ ] "Get Started" CTA that links to `/sign-up`
- [ ] "Already have an account? Sign In" link
- [ ] Mobile-responsive design
- [ ] Dark theme matching app design system (#0A0A0A, #CDFF00 accent)

#### Should Have
- [ ] Animated hero (Framer Motion entrance animations)
- [ ] Social proof section (workout count, user testimonials)
- [ ] Feature screenshots or mini-demos
- [ ] Footer with links (Privacy, Terms)

#### Won't Have
- Pricing tiers (app is free)
- Blog or content marketing pages
- Interactive demo mode

### Part B: Desktop Optimization

#### Must Have
- [ ] Sidebar navigation on screens 1024px+ (lg breakpoint)
- [ ] Two-column layout for home page (day selector + workout preview)
- [ ] Two-column layout for stats page (charts + PR list)
- [ ] Multi-column program editor (day list + exercise editor)
- [ ] Wider form inputs on desktop (side-by-side where appropriate)
- [ ] Hover states for desktop interactions

#### Should Have
- [ ] Collapsible sidebar for more screen space
- [ ] Keyboard shortcuts for common actions (Esc to close modals)
- [ ] Better table layouts for workout history
- [ ] Larger charts on desktop

#### Won't Have
- Complete redesign of mobile layouts
- New features (just layout optimization)

---

## User Flows

### Flow 1: Landing Page Visitor to Signup
1. User visits setflow.app (not signed in)
2. Sees landing page with hero section, headline "Track Your Lifts. Beat Your PRs."
3. Hero section displays app preview mockup with animated entrance
4. User scrolls down to see 4 feature cards (Progressive Overload, Superset Support, Personal Records, Offline-First)
5. User scrolls further to social proof section
6. User clicks "Get Started Free" CTA button
7. User is redirected to `/sign-up` (Clerk authentication)
8. After signup, user enters onboarding flow

### Flow 2: Returning User Sign-In from Landing
1. User visits setflow.app (not signed in, has existing account)
2. Sees landing page hero section
3. Clicks "Already have an account? Sign In" link below the primary CTA
4. Redirected to `/sign-in` (Clerk authentication)
5. After sign-in, redirected to home dashboard

### Flow 3: Desktop Sidebar Navigation
1. Signed-in user accesses app on desktop (1024px+ viewport)
2. Sidebar navigation appears on the left with logo, nav items (icons + labels), and user avatar
3. User clicks "Stats" in sidebar to navigate to stats page
4. Stats page renders in two-column layout (charts left, PR list right)
5. User clicks the collapse button on sidebar to switch to icons-only mode
6. Main content area expands to fill the freed space
7. Sidebar collapse state persists across page navigations

### Flow 4: Desktop Home Page Two-Column
1. Signed-in user lands on home page at 1024px+ viewport
2. Left column shows day tabs as a vertical list (Day 1, Day 2, Day 3)
3. Right column shows the selected day's content (warmup, supersets, finisher)
4. User clicks a different day tab on the left
5. Right column updates to show the newly selected day's exercises
6. "Start Workout" button is fixed at the bottom-right of the content area

### Flow 5: Mobile Landing Page Experience
1. User visits setflow.app on a mobile device (375px-414px)
2. Landing page renders mobile-optimized layout
3. Hero section shows headline, subheadline, CTA, and app preview stacked vertically
4. Feature cards display in a single column
5. All touch targets are minimum 44px height, CTA buttons are 56px
6. Bottom tab bar is hidden (landing page uses its own navigation)

---

## Design

### ASCII Wireframes

#### Landing Page (Mobile, 375px)
```
+---------------------------------------+
|           [SetFlow Logo]              |
+---------------------------------------+
|                                       |
|   Track Your Lifts.                   |
|   Beat Your PRs.                      |
|                                       |
|   The gym tracker that helps you      |
|   build strength with progressive     |
|   overload, superset support,         |
|   and rest timers.                    |
|                                       |
|   +-------------------------------+   |
|   |   [Get Started Free]  #CDFF00|   |
|   +-------------------------------+   |
|   Already have an account? Sign In    |
|                                       |
|   +-----------------------------+     |
|   |  +---------------------+   |     |
|   |  | [Phone Mockup]      |   |     |
|   |  | Animated app preview |   |     |
|   |  | #1A1A1A frame        |   |     |
|   |  | rounded-[40px]       |   |     |
|   |  +---------------------+   |     |
|   +-----------------------------+     |
|                                       |
+---------------------------------------+
|   FEATURES                            |
+---------------------------------------+
|   +-------------------------------+   |
|   | [icon] Progressive Overload   |   |
|   | Smart weight suggestions      |   |
|   | bg-[#1A1A1A] rounded-xl p-5   |   |
|   +-------------------------------+   |
|   +-------------------------------+   |
|   | [icon] Superset Support       |   |
|   | A1/B1 paired exercises        |   |
|   +-------------------------------+   |
|   +-------------------------------+   |
|   | [icon] Personal Records       |   |
|   | Auto PR detection             |   |
|   +-------------------------------+   |
|   +-------------------------------+   |
|   | [icon] Offline-First          |   |
|   | Works with no signal          |   |
|   +-------------------------------+   |
|                                       |
+---------------------------------------+
|   +-------------------------------+   |
|   | Start your first workout      |   |
|   | [Get Started Free]  #CDFF00   |   |
|   +-------------------------------+   |
+---------------------------------------+
|   Footer: Privacy | Terms             |
|   (c) 2026 SetFlow                    |
+---------------------------------------+
```

#### Landing Page (Desktop, 1024px+)
```
+------------------------------------------------------------------+
|  [SetFlow Logo]                           [Sign In]              |
+------------------------------------------------------------------+
|                                                                  |
|   +---------------------------+   +---------------------------+  |
|   |                           |   |                           |  |
|   | Track Your Lifts.         |   |  +---------------------+ |  |
|   | Beat Your PRs.            |   |  | [Phone Mockup]      | |  |
|   |                           |   |  | Animated preview     | |  |
|   | The gym tracker that      |   |  | max-w-[320px]        | |  |
|   | helps you build strength  |   |  | bg-[#1A1A1A] frame   | |  |
|   |                           |   |  | rounded-[40px]       | |  |
|   | [Get Started Free]        |   |  +---------------------+ |  |
|   | Already have an account?  |   |                           |  |
|   +---------------------------+   +---------------------------+  |
|                                                                  |
+------------------------------------------------------------------+
|   FEATURES                                                       |
|   +------------+ +------------+ +------------+ +------------+    |
|   | Overload   | | Supersets  | | PRs        | | Offline    |    |
|   | [icon]     | | [icon]     | | [icon]     | | [icon]     |    |
|   | text       | | text       | | text       | | text       |    |
|   +------------+ +------------+ +------------+ +------------+    |
+------------------------------------------------------------------+
|   [Bottom CTA - differentiated]                                  |
+------------------------------------------------------------------+
|   Footer                                                         |
+------------------------------------------------------------------+
```

#### Desktop App Layout (1024px+, Signed In)
```
+--------+-----------------------------------------------------+
|        |                                                     |
| SIDEBAR|  MAIN CONTENT                                       |
| w-64   |  flex-1 lg:pl-64                                    |
|        |                                                     |
| [Logo] |  +-------------------+  +------------------------+ |
| SetFlow|  | DAY TABS          |  | SELECTED DAY CONTENT   | |
|        |  |                   |  |                        | |
| [Home] |  | > Day 1: Full A   |  | WARMUP                 | |
| [Prog] |  |   Day 2: Full B   |  |  Foam Roll             | |
| [Stats]|  |   Day 3: Full C   |  |                        | |
| [Exerc]|  |                   |  | SUPERSET A             | |
| [Nutri]|  |                   |  |  A1: Bench Press       | |
| [Sett] |  |                   |  |  A2: Bent Over Row     | |
|        |  |                   |  |                        | |
|        |  |                   |  | SUPERSET B             | |
|        |  |                   |  |  B1: Squat             | |
| [<<]   |  |                   |  |  B2: RDL               | |
|--------|  +-------------------+  |                        | |
| [User] |                        | [Start Workout] #CDFF00 | |
| Avatar |                        +------------------------+ |
+--------+-----------------------------------------------------+
```

#### Desktop Stats Page (1024px+)
```
+--------+-----------------------------------------------------+
|        |                                                     |
| SIDEBAR|  +----------------------------+ +----------------+  |
|        |  | CHARTS                     | | PR LIST        |  |
|        |  |                            | |                |  |
|        |  | [Volume Chart - Recharts]  | | Bench: 100kg   |  |
|        |  | Larger on desktop          | | Squat: 140kg   |  |
|        |  |                            | | Deadlift: 180kg|  |
|        |  +----------------------------+ |                |  |
|        |  | [Progress Chart]           | | Achievements   |  |
|        |  |                            | | [Level 12]     |  |
|        |  +----------------------------+ | Weekly Summary |  |
|        |                                 +----------------+  |
+--------+-----------------------------------------------------+
```

### Component Table

| Component | Tailwind Classes | Description |
|-----------|-----------------|-------------|
| Hero headline | `text-4xl lg:text-6xl font-extrabold tracking-tight text-white` | Primary landing page heading |
| Hero subheadline | `text-lg lg:text-xl text-[#A0A0A0] leading-relaxed max-w-lg` | Value proposition text |
| Primary CTA | `bg-[#CDFF00] text-black font-semibold rounded-xl px-8 py-4 text-lg hover:bg-[#CDFF00]/90` | Main call-to-action button, 56px height |
| Secondary link | `text-[#A0A0A0] hover:text-white underline-offset-4 hover:underline text-sm` | "Sign In" link |
| Feature card | `bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 hover:border-[#CDFF00]/20` | Individual feature showcase card |
| Feature icon | `w-10 h-10 text-[#CDFF00] mb-3` | Lucide icon in feature card |
| Feature title | `text-xl font-semibold text-white mb-2` | Feature card heading |
| Feature description | `text-sm text-[#A0A0A0] leading-relaxed` | Feature card body text |
| Phone mockup frame | `rounded-[40px] bg-[#1A1A1A] p-2 border border-white/10 shadow-2xl max-w-[320px]` | App preview container |
| Phone mockup screen | `rounded-[32px] bg-[#0A0A0A] overflow-hidden aspect-[9/19.5]` | Inner screen area |
| Sidebar | `hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[#0A0A0A] border-r border-[#1A1A1A]` | Desktop navigation sidebar |
| Sidebar nav item | `flex items-center gap-3 px-4 py-3 text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A] rounded-lg` | Navigation link in sidebar |
| Sidebar active item | `flex items-center gap-3 px-4 py-3 text-[#CDFF00] bg-[#CDFF00]/10 rounded-lg` | Active page indicator |
| Footer | `bg-[#0A0A0A] border-t border-[#1A1A1A] py-8 text-center text-sm text-[#666666]` | Page footer |
| Landing nav | `flex items-center justify-between px-6 py-4 bg-[#0A0A0A]/80 backdrop-blur-lg sticky top-0 z-50` | Landing page top navigation |

### Visual Spec

| Token | Hex Value | Usage |
|-------|-----------|-------|
| Background primary | `#0A0A0A` | Page background, sidebar background |
| Card background | `#1A1A1A` | Feature cards, phone mockup frame, sidebar borders |
| Input background | `#2A2A2A` | Form inputs, secondary borders |
| Accent | `#CDFF00` | CTA buttons, active indicators, feature icons |
| Text primary | `#FFFFFF` | Headlines, nav labels, feature titles |
| Text secondary | `#A0A0A0` | Subheadlines, descriptions, inactive nav items |
| Text muted | `#666666` | Footer text, timestamps |
| Success | `#22C55E` | Positive indicators |
| Sidebar width | `256px` (w-64) | Desktop sidebar |
| Content offset | `padding-left: 256px` | Main content area on desktop |
| CTA height | `56px` | Primary call-to-action buttons |
| Touch target min | `44px` | All interactive elements |

---

## Technical Spec

### Schema Changes
None required - this is a frontend-only change.

### TypeScript Interfaces

```typescript
// src/components/landing/hero.tsx
export interface HeroProps {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaHref: string;
  signInHref: string;
}
```

```typescript
// src/components/landing/features.tsx
export interface Feature {
  icon: React.ReactNode; // Lucide icon
  title: string;
  description: string;
}

export interface FeaturesProps {
  features: Feature[];
}
```

```typescript
// src/components/layout/sidebar.tsx
export interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
}

export interface SidebarProps {
  items: NavItem[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  userName: string;
  userAvatar?: string;
}
```

```typescript
// src/components/layout/desktop-layout.tsx
export interface DesktopLayoutProps {
  children: React.ReactNode;
}

// Wraps children with sidebar on lg+ screens
// Uses localStorage to persist collapsed state
```

### Routing Changes

| Route | Current | Change |
|-------|---------|--------|
| `/` | Redirect to auth if not signed in | Landing page for public, home for signed in |
| `/sign-in` | Clerk sign-in | No change |
| `/sign-up` | Clerk sign-up | No change |

### Files to Create

| File | Purpose |
|------|---------|
| `src/app/(marketing)/page.tsx` | Public landing page |
| `src/app/(marketing)/layout.tsx` | Marketing layout (no auth) |
| `src/components/landing/hero.tsx` | Hero section component |
| `src/components/landing/features.tsx` | Feature cards component |
| `src/components/landing/cta.tsx` | CTA section component |
| `src/components/landing/footer.tsx` | Landing page footer |
| `src/components/layout/sidebar.tsx` | Desktop sidebar navigation |
| `src/components/layout/desktop-layout.tsx` | Desktop wrapper component |

### Files to Modify

| File | Change |
|------|--------|
| `src/app/page.tsx` | Add conditional: landing for public, home for auth |
| `src/app/layout.tsx` | Add responsive sidebar container using DesktopLayout wrapper |
| `src/middleware.ts` | Allow `/` to be public (check auth client-side) |
| `src/app/stats/page.tsx` | Add two-column desktop layout with `lg:grid lg:grid-cols-[1fr_360px] lg:gap-8` |
| `src/app/program/page.tsx` | Add two-column desktop layout for day list + exercise editor |
| `src/components/nutrition/*` | Already has some desktop layout - enhance with wider inputs |

### Responsive Breakpoints

```css
/* Existing (mobile-first) */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */

/* Desktop */
lg: 1024px  /* Laptops - sidebar appears */
xl: 1280px  /* Desktops - wider content */
2xl: 1536px /* Large desktops - max content width */
```

### Code Samples

```tsx
// Desktop layout with collapsible sidebar
export function DesktopLayout({ children }: DesktopLayoutProps) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sidebar-collapsed") === "true";
  });

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  return (
    <div className="flex min-h-screen">
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-[#0A0A0A] border-r border-[#1A1A1A] transition-all duration-200",
          collapsed ? "lg:w-16" : "lg:w-64"
        )}
      >
        <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} />
      </aside>
      <main className={cn("flex-1 transition-all duration-200", collapsed ? "lg:pl-16" : "lg:pl-64")}>
        {children}
      </main>
    </div>
  );
}
```

```tsx
// Two-column home page layout
export function HomeDesktopLayout({ days, selectedDay, content }: HomeLayoutProps) {
  return (
    <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-6">
      {/* Day selector - vertical list on desktop */}
      <div className="hidden lg:block">
        <nav className="space-y-2 sticky top-4">
          {days.map((day) => (
            <DayTab key={day.id} day={day} isActive={day.id === selectedDay} />
          ))}
        </nav>
      </div>
      {/* Day content */}
      <div>{content}</div>
    </div>
  );
}
```

---

## Implementation Plan

### Dependencies Checklist
- [ ] Framer Motion (installed) - hero entrance animations
- [ ] Clerk authentication (installed) - public/auth conditional rendering
- [ ] Tailwind CSS (installed) - responsive layouts
- [ ] Lucide React (installed) - sidebar and feature icons

### Build Order

**Phase 1: Landing Page (Week 1)**
1. [ ] Create `(marketing)` route group with public layout
2. [ ] Build Hero component with headline, subheadline, CTA, and phone mockup
3. [ ] Build Features component with 4 feature cards in responsive grid
4. [ ] Build CTA section with differentiated bottom call-to-action
5. [ ] Build Footer component with Privacy and Terms links
6. [ ] Add responsive styling (mobile single-column, desktop two-column hero)
7. [ ] Update middleware to allow public `/`
8. [ ] Add conditional rendering in `page.tsx`: landing vs home based on auth

**Phase 2: Desktop Sidebar (Week 2)**
9. [ ] Create Sidebar component with nav items (icons + labels)
10. [ ] Create DesktopLayout wrapper component with sidebar + main content
11. [ ] Update root layout to use DesktopLayout on lg+ breakpoint
12. [ ] Implement collapsible sidebar with localStorage persistence
13. [ ] Add Framer Motion transitions for sidebar collapse/expand
14. [ ] Style active nav item with accent color indicator

**Phase 3: Desktop Page Layouts (Week 3)**
15. [ ] Update Home page with two-column layout (day tabs + workout content)
16. [ ] Update Stats page with two-column layout (charts + PR list)
17. [ ] Update Program page with two-column layout (day list + exercise editor)
18. [ ] Add hover states for desktop interactions (cards, buttons, nav items)
19. [ ] Enhance nutrition pages with wider form inputs on desktop
20. [ ] Test all pages on lg, xl, and 2xl viewports

---

## Edge Cases

| Edge Case | Handling |
|-----------|----------|
| User resizes browser from mobile to desktop | Sidebar and two-column layouts activate/deactivate based on CSS media queries (no JS required for layout switch). Sidebar collapse state is only used on lg+. |
| Signed-in user directly navigates to landing page URL | Conditional rendering in `page.tsx` checks auth state. Signed-in users always see the home dashboard, never the landing page. |
| Landing page visited with JavaScript disabled | Hero headline and CTA render as static HTML (SSR). Framer Motion animations degrade gracefully. Feature cards and content are fully readable without JS. |
| Sidebar overflow with many nav items | Nav items are fixed (6 items). If more are added, the sidebar uses `overflow-y-auto` with scrollbar hidden (webkit-scrollbar). User avatar stays fixed at bottom. |
| Desktop layout with very wide screens (2560px+) | Main content area has `max-w-7xl mx-auto` constraint. Content does not stretch to fill ultra-wide monitors. |
| Sidebar collapse state lost on new device | Collapse state stored in localStorage per browser. Falls back to expanded (default) on new devices. Acceptable behavior. |
| PWA install flow from landing page | Landing page is in a separate route group `(marketing)`. PWA service worker still caches the app shell. Landing page does not interfere with PWA install prompt. |
| Slow network on landing page load | Hero headline and CTA are text-only (no image dependency for LCP). Phone mockup image lazy-loads. Feature cards render without images. Performance budget: LCP <2.5s. |
| RTL language support | Not currently supported. Sidebar and two-column layouts use `flex` and `grid` which can be flipped with `dir="rtl"`. No impact for English-only release. |
| Screen reader on desktop layout | Sidebar uses `<nav aria-label="Main navigation">`. Active page indicated with `aria-current="page"`. Collapse button has `aria-label="Collapse sidebar"` / `aria-label="Expand sidebar"`. |

---

## Testing

### Functional Tests
- [ ] Landing page loads without authentication (no redirect to sign-in)
- [ ] "Get Started Free" CTA links to `/sign-up`
- [ ] "Sign In" link navigates to `/sign-in`
- [ ] Signed-in users see home dashboard, not landing page
- [ ] Sidebar appears at 1024px+ viewport width
- [ ] Sidebar is hidden on viewports below 1024px
- [ ] Sidebar collapse button toggles between expanded (w-64) and collapsed (w-16)
- [ ] Sidebar collapse state persists across page navigations (localStorage)
- [ ] Two-column home layout renders at 1024px+ (day tabs left, content right)
- [ ] Day tab selection updates right column content on desktop
- [ ] Two-column stats layout renders at 1024px+ (charts left, PRs right)
- [ ] Two-column program layout renders at 1024px+ (day list left, editor right)
- [ ] Hover states appear on feature cards, sidebar items, and buttons on desktop
- [ ] Framer Motion entrance animations play on hero section elements
- [ ] Footer renders with Privacy and Terms links
- [ ] Middleware allows unauthenticated access to `/`

### UI Verification
- [ ] Dark theme matches app: #0A0A0A background, #CDFF00 accent
- [ ] Feature cards use #1A1A1A background with #2A2A2A border
- [ ] CTA button is #CDFF00 with black text, 56px height
- [ ] Phone mockup frame uses rounded-[40px] with #1A1A1A background
- [ ] Sidebar background is #0A0A0A with #1A1A1A right border
- [ ] Active sidebar item shows #CDFF00 text with #CDFF00/10 background
- [ ] Landing page renders correctly on 375px (mobile, stacked layout)
- [ ] Landing page renders correctly on 768px (tablet)
- [ ] Landing page renders correctly on 1024px (desktop, two-column hero)
- [ ] Landing page renders correctly on 1440px (wide desktop)
- [ ] No horizontal scroll on any viewport (375px through 2560px)
- [ ] Mobile layouts are completely unchanged by desktop additions
- [ ] Lighthouse Performance score 90+ for landing page
- [ ] All touch targets are minimum 44px on mobile
- [ ] Text passes WCAG 2.1 AA contrast on all backgrounds

---

## Launch Checklist

- [ ] Landing page components built (Hero, Features, CTA, Footer)
- [ ] Desktop layout components built (Sidebar, DesktopLayout)
- [ ] Conditional rendering works (public landing vs authenticated home)
- [ ] Middleware updated to allow public `/`
- [ ] Two-column layouts applied to Home, Stats, Program pages
- [ ] Hover states added for desktop interactions
- [ ] Sidebar collapse works with localStorage persistence
- [ ] Visual QA passed on mobile (375px, 414px) and desktop (1024px, 1440px)
- [ ] Lighthouse audit passing (Performance 90+)
- [ ] Core Web Vitals: LCP <2.5s, CLS <0.1
- [ ] PWA functionality unbroken (install prompt, offline mode)
- [ ] Basic meta tags added (title, description)
- [ ] PR reviewed
- [ ] CHANGELOG.md updated
- [ ] Deployed to production (gym.adu.dk)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Landing page breaks PWA install flow | Users cannot install the app | Landing page lives in separate `(marketing)` route group. App shell caching is unaffected. Test PWA install prompt after deployment. |
| Desktop layouts break existing mobile experience | All current users affected | Use mobile-first CSS exclusively. Desktop additions use `lg:` prefix. Run visual regression on 375px to verify zero changes. |
| Sidebar adds navigation complexity | Confusing dual-navigation (sidebar + bottom tabs) | Bottom tabs remain on mobile only. Sidebar appears only on lg+. Both use the same nav items. |
| Sidebar width reduces content area on smaller laptops | Content feels cramped on 1024px | Collapsible sidebar reduces to 64px (icons-only). Default to expanded, user can collapse if needed. |
| Framer Motion animations on hero increase LCP | Landing page feels slow | Hero text is SSR-rendered (no animation dependency for LCP). Animations start after hydration with `initial={{ opacity: 0 }}` to prevent CLS. |
| SEO impact of SPA conditional rendering | Search engines see landing page inconsistently | Landing page is in a separate route group with its own layout. Server-side rendering ensures crawlers see full content. |

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Framer Motion | Installed | Hero entrance animations |
| Clerk authentication | Installed | Public/auth conditional rendering |
| Tailwind CSS | Installed | Responsive layouts, all styling |
| Lucide React | Installed | Icons for sidebar and feature cards |
| Next.js 15 App Router | Installed | Route groups for `(marketing)`, middleware |

### Cross-PRD Dependencies
- **Landing Page Upgrade (P2):** That PRD extends this one with animated walkthrough, social proof counters, testimonials, screenshot carousel, credibility section, and comparison slider. This PRD provides the foundational landing page structure; that PRD adds conversion optimization.
- **Visual Hierarchy Redesign (P1):** Desktop layouts should use the elevation system (hero/standard/muted cards) defined in that PRD. Coordinate card styling.
- **Typography & Spacing (P1):** Desktop responsive type scale (40/32/22px at lg+) defined in that PRD applies to both landing page and desktop app layouts.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-01-18 | Initial draft |
| 2026-03-26 | PRD quality audit: restructured to 14-section standard, added ASCII wireframes (4 layouts), component table (15 components), visual spec with hex colors, TypeScript interfaces (HeroProps, Feature, NavItem, SidebarProps, DesktopLayoutProps), code samples (DesktopLayout, HomeDesktopLayout), edge cases table (10 cases), Testing section (16 functional + 15 UI verification checks), full Launch checklist (15 items), Risks & mitigations table (6 risks with impact), Dependencies section with cross-PRD links |
| 2026-03-26 | Status updated to SHIPPED - implementation verified in codebase |
