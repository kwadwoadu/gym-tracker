# PRD: SetFlow Landing Page + Desktop Experience

> **Status:** Draft
> **Owner:** Kwadwo
> **Created:** 2026-01-18
> **Project:** gym-tracker (SetFlow)

---

## 1. Problem

SetFlow has two critical UX gaps:

1. **No marketing presence** - The app immediately requires authentication. Potential users can't learn what SetFlow does, see screenshots, or understand its value before signing up. This hurts conversion and makes sharing the app pointless.

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

## 2. Solution

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

## 3. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Landing page conversion | 15%+ click-through to signup | Analytics: CTA clicks / page views |
| Bounce rate | <50% on landing page | Vercel Analytics |
| Desktop session duration | +20% vs current | Compare before/after |
| User feedback | No "mobile app on desktop" complaints | Support/feedback |

---

## 4. Requirements

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

#### Won't Have (this version)
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

#### Won't Have (this version)
- Complete redesign of mobile layouts
- New features (just layout optimization)

---

## 5. User Flows

### Landing Page Flow
```
1. User visits setflow.app (not signed in)
2. Sees landing page with hero section
3. Scrolls to see features
4. Clicks "Get Started Free" CTA
5. Redirects to /sign-up (Clerk)
6. After signup, goes to onboarding
```

### Desktop App Flow
```
1. Signed-in user accesses app on desktop (1024px+)
2. Sees sidebar navigation (not just icons)
3. Home page shows two columns: day tabs + workout preview
4. Can navigate via sidebar without header icons
5. Forms and stats use available horizontal space
```

---

## 6. Design

### Landing Page Components

#### Hero Section
- Full-width, centered content
- Headline: "Track Your Lifts. Beat Your PRs."
- Subheadline: "The gym tracker that helps you build strength with progressive overload, superset support, and rest timers."
- Primary CTA: "Get Started Free" (lime button)
- Secondary: Screenshot mockup of app

#### Feature Cards (3-4)
1. **Progressive Overload** - "Smart weight suggestions based on your history"
2. **Superset Support** - "A1/B1 paired exercises with shared rest timers"
3. **Personal Records** - "Automatic PR detection with celebrations"
4. **Offline-First** - "Works at the gym with no signal"

#### Social Proof (optional)
- "Join X athletes tracking their progress"
- Testimonial cards (can add later)

### Desktop Layout Components

#### Sidebar Navigation
- Logo + "SetFlow" at top
- Nav items with icons AND labels:
  - Home (Dumbbell)
  - Program (ClipboardList)
  - Stats (BarChart3)
  - Exercises (Dumbbell)
  - Nutrition (UtensilsCrossed) - if accessible
  - Settings (Settings)
- User avatar + name at bottom
- Collapsible to icons-only

#### Two-Column Home
- Left: Day tabs (vertical list on desktop)
- Right: Selected day content (warmup, supersets, finisher)
- Fixed "Start Workout" button at bottom-right

#### Two-Column Stats
- Left: Charts (larger on desktop)
- Right: PR list, achievements, weekly summary

---

## 7. Technical Spec

### Schema Changes
None required - this is a frontend-only change.

### Routing Changes

| Route | Current | Change |
|-------|---------|--------|
| `/` | Redirect to auth if not signed in | Landing page for public, home for signed in |
| `/sign-in` | Clerk sign-in | No change |
| `/sign-up` | Clerk sign-up | No change |

### Files to Create

| File | Purpose |
|------|---------|
| `/src/app/(marketing)/page.tsx` | Public landing page |
| `/src/app/(marketing)/layout.tsx` | Marketing layout (no auth) |
| `/src/components/landing/hero.tsx` | Hero section component |
| `/src/components/landing/features.tsx` | Feature cards component |
| `/src/components/landing/cta.tsx` | CTA section component |
| `/src/components/layout/sidebar.tsx` | Desktop sidebar navigation |
| `/src/components/layout/desktop-layout.tsx` | Desktop wrapper component |

### Files to Modify

| File | Change |
|------|--------|
| `/src/app/page.tsx` | Add conditional: landing for public, home for auth |
| `/src/app/layout.tsx` | Add responsive sidebar container |
| `/src/middleware.ts` | Allow `/` to be public (check auth client-side) |
| `/src/app/stats/page.tsx` | Add two-column desktop layout |
| `/src/app/program/page.tsx` | Add two-column desktop layout |
| `/src/components/nutrition/*` | Already has some desktop layout - enhance |

### Responsive Breakpoints

```css
/* Existing (mobile-first) */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */

/* New (desktop) */
lg: 1024px  /* Laptops - sidebar appears */
xl: 1280px  /* Desktops - wider content */
2xl: 1536px /* Large desktops - max content width */
```

### Sidebar CSS Pattern

```tsx
// Desktop layout with collapsible sidebar
<div className="flex min-h-screen">
  {/* Sidebar - hidden on mobile, visible on lg+ */}
  <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
    <Sidebar />
  </aside>

  {/* Main content - full width on mobile, offset on lg+ */}
  <main className="flex-1 lg:pl-64">
    {children}
  </main>
</div>
```

---

## 8. Implementation Plan

### Dependencies
- [ ] None - can start immediately

### Build Order

**Phase 1: Landing Page (Priority)**
1. [ ] Create `(marketing)` route group with public layout
2. [ ] Build Hero component with headline + CTA
3. [ ] Build Features component with 4 cards
4. [ ] Add responsive styling (mobile → desktop)
5. [ ] Update middleware to allow public `/`
6. [ ] Add conditional rendering: landing vs home

**Phase 2: Desktop Sidebar**
1. [ ] Create Sidebar component with nav items
2. [ ] Create DesktopLayout wrapper component
3. [ ] Update root layout to use DesktopLayout on lg+
4. [ ] Add collapsible sidebar state
5. [ ] Style transitions with Framer Motion

**Phase 3: Desktop Page Layouts**
1. [ ] Update Home page with two-column layout
2. [ ] Update Stats page with two-column layout
3. [ ] Update Program page with two-column layout
4. [ ] Add hover states for desktop interactions
5. [ ] Test all pages on desktop viewports

### Agents to Consult
- **Frontend Specialist** - Component architecture, Tailwind responsive
- **PWA Specialist** - Ensure landing page doesn't break PWA functionality

### Risks

| Risk | Mitigation |
|------|------------|
| Landing page hurts PWA install flow | Ensure app shell is still cached, landing is lightweight |
| Desktop layouts break mobile | Use mobile-first CSS, test on real devices |
| Sidebar adds complexity | Keep simple, reuse existing nav items |
| SEO not important | But landing page should have basic meta tags |

---

## 9. Verification Plan

### Landing Page
- [ ] Loads without authentication
- [ ] All CTAs link to correct routes
- [ ] Mobile-responsive (test 375px, 768px, 1024px, 1440px)
- [ ] Dark theme matches app
- [ ] Lighthouse score 90+ for performance

### Desktop Layout
- [ ] Sidebar appears at 1024px+
- [ ] Sidebar collapses on click
- [ ] Two-column layouts work on Stats, Program
- [ ] No horizontal scroll on any viewport
- [ ] Mobile layouts unchanged

---

## 10. Launch Checklist

- [ ] Code complete
- [ ] Visual QA on mobile + desktop
- [ ] Lighthouse audit passing
- [ ] PR reviewed
- [ ] Changelog updated
- [ ] Deploy to production

---

## Changelog

| Date | Change |
|------|--------|
| 2026-01-18 | Initial draft |
