# Landing Page Upgrade

> **Status:** SHIPPED
> **Owner:** Kwadwo
> **Created:** 2026-03-04
> **Project:** gym-tracker (SetFlow Webapp)
> **Roadmap Phase:** Phase 3 - Polish & Delight

---

## Problem Statement

SetFlow's current landing page (implemented in `/src/components/landing/`) is functional but static and unconvincing. It was built as a minimum viable landing page during the desktop layout PRD implementation. It has a hero section with a simulated phone mockup, a feature grid with icon cards, a CTA section, and a footer. While the dark theme and lime accent create visual identity, the page lacks the dynamism and social proof needed to convert visitors.

Specific issues:

1. **Static app preview:** The hero shows a hardcoded phone mockup with fake exercise cards (`Barbell Bench Press`, `Bent Over Row`, `Leg Press`). It does not demonstrate the actual app experience - no animations, no set logging flow, no rest timer, no PR celebration. Visitors cannot feel what using the app is like.

2. **No social proof:** The page says "Join thousands of lifters using SetFlow" but provides zero evidence. No user count, no testimonials, no workout statistics. Claims without proof reduce trust.

3. **Repetitive CTAs:** The hero CTA ("Get Started Free") and bottom CTA ("Start Tracking Free") are visually and textually similar. There is no value escalation or new information between them. Users who were not convinced by the hero get the same pitch again.

4. **No credibility section:** Nothing explains who built the app or why it exists. Fitness app users care about whether the builders actually lift. "Built by lifters, for lifters" appears in the features section subtitle but is not substantiated.

5. **Feature cards are text-only:** Each feature gets an icon and a paragraph. There are no screenshots, no animated demos, no visual evidence that these features actually work.

**Who has this problem?** Every potential new user who visits setflow.app before signing up.

**What happens if we don't solve it?** Low conversion rate from visitor to signup. The landing page fails its primary job: convincing people to try the app. Marketing efforts (social media, word-of-mouth links) waste traffic on a page that does not convert.

---

## Proposed Solution

Transform the landing page from a static brochure into a dynamic, conversion-optimized experience with 6 new sections.

### 1. Animated App Walkthrough (Hero Replacement)
Replace the static phone mockup with a Framer Motion-powered sequence that shows the real app flow:
- Step 1: User selects "Day 1 - Full Body A" (tab animation)
- Step 2: Scrolls through exercise cards (scroll animation)
- Step 3: Taps "Start Workout" (button press animation)
- Step 4: Logs a set with weight adjustment (weight bounce, from micro-interactions PRD)
- Step 5: Completes set (checkmark animation, card pulse)
- Step 6: Rest timer counts down (circular progress animation)
- Step 7: PR detected (gold flash celebration)

The sequence auto-plays in a loop with a 2-second pause between cycles. Users can also interact with the mockup to scrub through steps.

### 2. Live Social Proof Counters
An animated counter section showing real-time (or daily-updated) statistics:
- Total registered users
- Total workouts tracked
- Total PRs hit
- Total sets logged

Counters animate from 0 to current value using a count-up animation when they scroll into view. Numbers update daily via a simple API endpoint that queries aggregate stats.

### 3. Testimonial Section
3-4 testimonial cards with:
- User avatar (or initials)
- Quote text
- Name, role/context (e.g., "Alex M. - Powerlifter, 2 years on SetFlow")
- Star rating
- Carousel on mobile, grid on desktop

Initial testimonials can be seeded from real user feedback or beta testers.

### 4. App Store-Style Screenshot Carousel
A horizontally scrollable carousel of real app screenshots showing:
- Home page with workout preview
- Set logger with weight input
- Rest timer (circular countdown)
- Stats page with PR list and charts
- Muscle heatmap visualization
- Achievement/XP system

Screenshots are actual captures from the app, displayed in phone frame mockups. Auto-scroll with manual swipe override on mobile.

### 5. "Built by Lifters" Credibility Section
A section establishing credibility:
- Brief story: "Built by a lifter who was tired of bloated fitness apps"
- Key differentiators: "No subscription. No ads. No data selling."
- Open source / transparency angle (if applicable)
- Tech credibility: "PWA that works offline. Your data, your device."
- Photo or illustration of actual gym usage

### 6. Before/After Comparison Slider
An interactive slider showing:
- Left side: "Logging workouts in Notes app" (messy text, no structure)
- Right side: "Logging workouts in SetFlow" (clean UI, organized data)
- User drags a slider handle to reveal the comparison
- Demonstrates the value proposition visually

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Signup conversion rate | 15%+ (CTA click to completed signup) | Vercel Analytics: CTA clicks / unique visitors |
| Bounce rate | <40% (down from current) | Vercel Analytics |
| Scroll depth | 70%+ visitors reach testimonials section | Scroll depth tracking |
| Time on page | >45 seconds average | Vercel Analytics |
| Social proof impact | Counters section visible to 60%+ visitors | Intersection Observer tracking |
| Mobile conversion parity | Mobile conversion within 5% of desktop | Segment by device type |
| Lighthouse Performance | 90+ score | Lighthouse CI |
| Core Web Vitals | LCP <2.5s, FID <100ms, CLS <0.1 | Google Search Console |

---

## Requirements

### Must Have
- [ ] Animated app walkthrough replacing static phone mockup in hero section
- [ ] Social proof counters (users, workouts, PRs, sets) with count-up animation
- [ ] Testimonial section with 3-4 cards (carousel on mobile, grid on desktop)
- [ ] Screenshot carousel with phone frame mockups and snap scrolling
- [ ] "Built by Lifters" credibility section with trust signals
- [ ] Differentiated bottom CTA (different messaging from hero CTA)
- [ ] SEO meta tags (title, description, og:image, canonical URL)
- [ ] Performance budget: LCP <2.5s, CLS <0.1, Lighthouse 90+
- [ ] All screenshots in WebP format, lazy loaded, max 150KB each

### Should Have
- [ ] Before/after comparison slider (notes app vs SetFlow)
- [ ] Walkthrough step indicators (dots) with tap-to-jump
- [ ] Auto-advancing screenshot carousel with pause on hover/touch
- [ ] Counter animation triggered by Intersection Observer (animate when visible)
- [ ] Feature cards enhanced with screenshot thumbnails
- [ ] Public stats API endpoint with stale-while-revalidate caching

### Won't Have
- Video testimonials or embedded video content
- Interactive demo mode (sign up to try the app)
- Pricing comparison table (app is free)
- Blog or content marketing pages
- A/B testing infrastructure (manual comparison post-launch)

---

## User Flows

### Flow 1: First-Time Visitor Conversion
1. User visits setflow.app from a social media link or search result
2. Hero section loads with headline "Track Your Lifts. Beat Your PRs." and animated walkthrough
3. Walkthrough auto-plays: day select, exercise scroll, start workout, log set, complete set, rest timer, PR detected
4. User watches 1-2 cycles of the walkthrough (15 seconds each)
5. User scrolls down, passing social proof counters that animate from 0 to current values
6. User sees feature cards with screenshot thumbnails showing real app UI
7. User reaches testimonial section with quotes from real users
8. User sees "Built by Lifters" section establishing credibility
9. User clicks differentiated bottom CTA: "Start your first workout in 60 seconds"
10. User is redirected to `/sign-up` (Clerk)

### Flow 2: Mobile Visitor Experience
1. User visits on mobile (375px-414px viewport)
2. Walkthrough phone mockup is centered and appropriately sized
3. Social proof counters display in 2x2 grid
4. Testimonials display as horizontal snap-scroll carousel
5. Screenshots display as horizontal scroll with peek of next item
6. Comparison slider is touch-friendly (40px handle)
7. User can drag comparison handle with no vertical scroll conflict
8. All CTAs have 56px touch target height

### Flow 3: Returning Visitor (Signed In)
1. User who is already signed in visits setflow.app
2. Existing conditional in `page.tsx` detects authentication
3. User is shown the home dashboard, never sees the landing page
4. No redirect latency or flash of landing page content

### Flow 4: SEO Crawler Visit
1. Search engine crawler visits setflow.app
2. All text content is in the DOM (not dependent on JavaScript animations)
3. Meta tags provide title, description, and og:image
4. Canonical URL is set to prevent duplicate content
5. Walkthrough is decorative only; core value proposition is in text
6. Page passes Core Web Vitals thresholds

---

## Technical Spec

### TypeScript Interfaces

```typescript
// src/data/testimonials.ts
export interface Testimonial {
  id: string;
  name: string;
  context: string; // e.g., "Powerlifter, 2 years on SetFlow"
  quote: string;
  rating: 1 | 2 | 3 | 4 | 5;
  avatarUrl?: string; // Optional, falls back to initials
}

export const testimonials: Testimonial[] = [
  // 3-4 seeded from beta testers
];
```

```typescript
// src/app/api/stats/public/route.ts
export interface PublicStats {
  totalUsers: number;
  totalWorkouts: number;
  totalPRs: number;
  totalSetsLogged: number;
  lastUpdated: string; // ISO date
}

// GET /api/stats/public
// Response: PublicStats
// Cache: stale-while-revalidate, 24 hours
// Fallback: hardcoded values if DB query fails
```

```typescript
// src/components/landing/app-walkthrough.tsx
export interface WalkthroughStep {
  id: string;
  label: string;
  duration: number; // ms
  delay: number; // ms from sequence start
}

export interface AppWalkthroughProps {
  autoPlay?: boolean; // Default: true
  onStepChange?: (stepIndex: number) => void;
}
```

```typescript
// src/components/landing/social-proof.tsx
export interface CounterItem {
  icon: React.ReactNode;
  value: number;
  label: string;
  prefix?: string; // e.g., ">"
  suffix?: string; // e.g., "+"
}

export interface SocialProofProps {
  stats: PublicStats;
}
```

```typescript
// src/components/landing/comparison-slider.tsx
export interface ComparisonSliderProps {
  beforeImage: string; // Path to "before" screenshot
  afterImage: string; // Path to "after" screenshot
  beforeLabel: string;
  afterLabel: string;
  initialPosition?: number; // 0-100, default 50
}
```

### Files to Create

| File | Description |
|------|-------------|
| `src/components/landing/app-walkthrough.tsx` | Animated Framer Motion sequence showing real app flow in phone mockup |
| `src/components/landing/social-proof.tsx` | Live counter section with count-up animations |
| `src/components/landing/testimonials.tsx` | Testimonial carousel/grid with user quotes |
| `src/components/landing/screenshot-carousel.tsx` | Horizontally scrollable app screenshot showcase |
| `src/components/landing/credibility.tsx` | "Built by lifters" credibility section |
| `src/components/landing/comparison-slider.tsx` | Before/after interactive comparison slider |
| `src/app/api/stats/public/route.ts` | API endpoint returning aggregate public stats (user count, workout count, PR count) |
| `src/data/testimonials.ts` | Static testimonial data (quotes, names, ratings) |
| `public/screenshots/home.webp` | App screenshot: home page |
| `public/screenshots/set-logger.webp` | App screenshot: set logger |
| `public/screenshots/rest-timer.webp` | App screenshot: rest timer |
| `public/screenshots/stats.webp` | App screenshot: stats page |
| `public/screenshots/muscle-map.webp` | App screenshot: muscle heatmap |
| `public/screenshots/achievements.webp` | App screenshot: achievement system |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/landing/hero.tsx` | Replace static phone mockup with AppWalkthrough component. Keep headline and CTAs. |
| `src/components/landing/features.tsx` | Add screenshot thumbnails to each feature card. Update grid layout for visual variety. |
| `src/components/landing/cta.tsx` | Differentiate bottom CTA from hero. Add urgency/value: "Start your first workout in 60 seconds" |
| `src/components/landing/index.tsx` | Export new components |
| `src/app/page.tsx` | Add new sections between Features and CTA: SocialProof, ScreenshotCarousel, Testimonials, Credibility, ComparisonSlider |
| `src/components/landing/footer.tsx` | Add links to privacy policy, terms, and GitHub (if open source) |

### Code Samples

```typescript
// Count-up animation hook for social proof counters
import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!startOnView || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutExpo
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, startOnView]);

  return { count, ref };
}
```

```typescript
// Comparison slider touch handling
function handlePointerMove(e: React.PointerEvent) {
  if (!isDragging) return;
  const rect = containerRef.current?.getBoundingClientRect();
  if (!rect) return;
  const x = e.clientX - rect.left;
  const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
  setPosition(percentage);
}
// Container: touch-action: pan-y (allow vertical scroll)
// Handle: touch-action: none (capture horizontal drag)
```

### Files to Create

| File | Description |
|------|-------------|
| `src/components/landing/app-walkthrough.tsx` | Animated Framer Motion sequence showing real app flow in phone mockup |
| `src/components/landing/social-proof.tsx` | Live counter section with count-up animations |
| `src/components/landing/testimonials.tsx` | Testimonial carousel/grid with user quotes |
| `src/components/landing/screenshot-carousel.tsx` | Horizontally scrollable app screenshot showcase |
| `src/components/landing/credibility.tsx` | "Built by lifters" credibility section |
| `src/components/landing/comparison-slider.tsx` | Before/after interactive comparison slider |
| `src/app/api/stats/public/route.ts` | API endpoint returning aggregate public stats (user count, workout count, PR count) |
| `src/data/testimonials.ts` | Static testimonial data (quotes, names, ratings) |
| `public/screenshots/home.webp` | App screenshot: home page |
| `public/screenshots/set-logger.webp` | App screenshot: set logger |
| `public/screenshots/rest-timer.webp` | App screenshot: rest timer |
| `public/screenshots/stats.webp` | App screenshot: stats page |
| `public/screenshots/muscle-map.webp` | App screenshot: muscle heatmap |
| `public/screenshots/achievements.webp` | App screenshot: achievement system |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/landing/hero.tsx` | Replace static phone mockup with AppWalkthrough component. Keep headline and CTAs. |
| `src/components/landing/features.tsx` | Add screenshot thumbnails to each feature card. Update grid layout for visual variety. |
| `src/components/landing/cta.tsx` | Differentiate bottom CTA from hero. Add urgency/value: "Start your first workout in 60 seconds" |
| `src/components/landing/index.tsx` | Export new components |
| `src/app/page.tsx` | Add new sections between Features and CTA: SocialProof, ScreenshotCarousel, Testimonials, Credibility, ComparisonSlider |
| `src/components/landing/footer.tsx` | Add links to privacy policy, terms, and GitHub (if open source) |

---

## Design Requirements

### Section Order (Top to Bottom)

```
1. Hero (Animated walkthrough + headline + CTA)
2. Social Proof Counters
3. Features (upgraded with screenshots)
4. Screenshot Carousel
5. Testimonials
6. Before/After Comparison
7. Credibility ("Built by Lifters")
8. Bottom CTA (differentiated)
9. Footer
```

### Animated Walkthrough Specifications

**Phone Frame**
```
Container: max-w-[320px] mx-auto
Frame: rounded-[40px] bg-[#1A1A1A] p-2 border border-white/10 shadow-2xl
Screen: rounded-[32px] bg-[#0A0A0A] overflow-hidden aspect-[9/19.5]
```

**Animation Sequence (Framer Motion)**
```typescript
const walkthrough = [
  { step: "select-day", duration: 1500, delay: 0 },
  { step: "scroll-exercises", duration: 2000, delay: 1500 },
  { step: "start-workout", duration: 800, delay: 3500 },
  { step: "log-set", duration: 2500, delay: 4300 },
  { step: "complete-set", duration: 1200, delay: 6800 },
  { step: "rest-timer", duration: 3000, delay: 8000 },
  { step: "pr-detected", duration: 2000, delay: 11000 },
  { step: "pause", duration: 2000, delay: 13000 },
];
// Total cycle: ~15 seconds, then loops
```

**Interaction**
- Step indicators (dots) below phone frame
- Tap a dot to jump to that step
- Swipe on phone to manually advance (mobile)

### Social Proof Counters

**Layout**
```
4 counters in a row (desktop), 2x2 grid (mobile)
Each counter:
  - Large number: text-4xl font-bold text-[#CDFF00] tabular-nums
  - Label: text-sm text-white/60 uppercase tracking-wider
  - Icon: 20x20 above number, text-[#CDFF00]/60
```

**Count-up Animation**
```typescript
// Animate from 0 to target over 2 seconds when in viewport
// Use requestAnimationFrame for smooth counting
// Easing: easeOutExpo (fast start, slow finish)
// Format: comma-separated thousands (e.g., "12,847")
```

**API Response Format**
```typescript
// GET /api/stats/public
{
  totalUsers: number;
  totalWorkouts: number;
  totalPRs: number;
  totalSetsLogged: number;
}
```

### Testimonial Cards

**Card Design**
```
Background: bg-white/5 border border-white/10 rounded-2xl p-6
Avatar: w-12 h-12 rounded-full bg-[#CDFF00]/20 (initials) or actual image
Quote: text-base text-white/80 italic leading-relaxed
Name: text-sm font-semibold text-white
Context: text-xs text-white/50
Stars: 5 star icons, filled in #CDFF00
```

**Layout**
- Mobile: horizontal carousel with snap scrolling (`snap-x snap-mandatory`)
- Desktop (lg+): 3-column grid

### Screenshot Carousel

**Phone Mockup**
```
Frame: w-[240px] rounded-[28px] bg-[#1A1A1A] p-1.5 border border-white/10
Screen: rounded-[22px] overflow-hidden
Image: WebP format, 1170x2532px (iPhone 14 Pro resolution), lazy loaded
```

**Carousel Behavior**
- Horizontal scroll with CSS scroll-snap (`snap-x snap-mandatory`)
- Auto-advance every 3 seconds (pause on hover/touch)
- Navigation dots below
- Peek next/previous screenshots at edges (transform: scale(0.9), opacity: 0.5)

### Before/After Comparison Slider

**Slider Design**
```
Container: max-w-2xl mx-auto rounded-2xl overflow-hidden
Left panel: screenshot of messy notes app / spreadsheet
Right panel: screenshot of SetFlow set logger
Divider: 4px wide, bg-[#CDFF00], with circular handle (w-10 h-10 rounded-full bg-[#CDFF00])
Handle icon: GripVertical icon in black
```

**Interaction**
- Drag handle left/right to reveal comparison
- Touch-friendly: large handle (40px), works on mobile
- Initial position: 50% (showing half of each)
- CSS: `clip-path` or `overflow: hidden` with dynamic width

### Credibility Section

**Layout**
```
Background: bg-[#0A0A0A] with subtle radial gradient
Content: max-w-3xl mx-auto text-center

- Headline: "Built by Lifters, for Lifters" (text-3xl font-bold)
- Subtitle: text-lg text-white/60, 2-3 sentences about the origin
- 3 trust signals in a row:
  [No Subscription] [Works Offline] [Your Data Stays Local]
  Each with icon + label
- Optional: Founder photo or gym photo
```

### Color Palette (Landing-Specific)

| Element | Color | Usage |
|---------|-------|-------|
| Counter numbers | `#CDFF00` | Social proof emphasis |
| Star ratings | `#CDFF00` | Testimonial stars |
| Comparison handle | `#CDFF00` | Slider control |
| Section backgrounds | Alternating `#0A0A0A` and `#111111` | Visual section breaks |
| Testimonial borders | `rgba(255, 255, 255, 0.1)` | Subtle card borders |
| Screenshot frame | `#1A1A1A` | Phone mockup frames |

### Performance Budget

| Asset | Max Size | Format |
|-------|----------|--------|
| Each screenshot | 150KB | WebP, lazy loaded |
| Walkthrough animation | 0KB (Framer Motion, no video) | Code-based |
| Total landing page JS | <100KB (gzipped, page-specific) | Tree-shaken |
| LCP element | Hero headline | Must render in <2.5s |
| CLS | <0.1 | No layout shifts from lazy-loaded images |

---

## Edge Cases

| Edge Case | Handling |
|-----------|----------|
| API endpoint fails (social proof counters) | Show hardcoded fallback numbers with a "Last updated" date. Never show 0. Cache response in `stale-while-revalidate` for 24 hours. |
| No testimonials yet (pre-launch) | Use beta tester quotes. Mark as "Beta tester" in context. Minimum 3 testimonials required. |
| Screenshots become outdated | Screenshots must be regenerated after any major UI change. Add to deployment checklist. Use Playwright to auto-capture screenshots. |
| Walkthrough animation janky on low-end | All walkthrough animations use transform/opacity only. Detect low-end with `navigator.hardwareConcurrency < 4` and show static mockup instead. |
| SEO: landing page content indexing | Landing page must have proper meta tags: title, description, og:image, canonical URL. The animated walkthrough is not crawlable; ensure text content is in the DOM for search engines. |
| Dark mode / light mode | Landing page is always dark (#0A0A0A). Does not follow system preference. Consistent with the app's dark-first design. |
| Mobile viewport: walkthrough too small | On screens <375px, switch to a static screenshot with a "See it in action" link that opens a full-screen demo. |
| Comparison slider touch conflicts | Prevent vertical scroll when dragging the comparison handle horizontally. Use `touch-action: pan-y` on the container and `touch-action: none` on the handle. |
| Signed-in users seeing landing page | The existing conditional in `page.tsx` handles this: `if (!isSignedIn) return <LandingPage />`. Signed-in users never see the landing page. |
| First Contentful Paint | The hero headline and CTA must render server-side (or in the first client render). The walkthrough animation starts after hydration. Use `motion.div` with `initial={{ opacity: 0 }}` so layout is stable before animation begins. |

---

## Testing

### Functional Tests
- [ ] Walkthrough auto-plays on page load and loops after 15-second cycle
- [ ] Walkthrough step dots respond to tap (jump to correct step)
- [ ] Walkthrough pauses on touch/hover and resumes on release
- [ ] Social proof counters animate from 0 to target value on scroll into view
- [ ] Counters only animate once (not on every scroll past)
- [ ] Counter numbers format with comma separators (e.g., "12,847")
- [ ] API endpoint `/api/stats/public` returns valid JSON with all 4 stats
- [ ] API fallback: hardcoded values returned when database query fails
- [ ] Testimonial carousel snap-scrolls on mobile (snap-x snap-mandatory)
- [ ] Testimonial grid displays 3 columns on desktop (lg+)
- [ ] Screenshot carousel auto-advances every 3 seconds
- [ ] Screenshot carousel pauses on hover/touch
- [ ] Comparison slider handle drags horizontally to reveal left/right panels
- [ ] Comparison slider does not conflict with vertical page scrolling
- [ ] Bottom CTA text differs from hero CTA text
- [ ] Signed-in users are redirected to home dashboard (never see landing page)
- [ ] All CTA buttons link to `/sign-up`

### UI Verification
- [ ] Walkthrough phone frame renders correctly (rounded corners, border, shadow)
- [ ] Walkthrough animation is smooth at 60fps (no visible jank)
- [ ] Social proof counter numbers use #CDFF00 color
- [ ] Testimonial cards use `bg-white/5 border-white/10 rounded-2xl` styling
- [ ] Star ratings in testimonials render in #CDFF00
- [ ] Screenshot phone mockups show actual app captures (not placeholder images)
- [ ] Screenshots are lazy loaded (not in initial bundle)
- [ ] Section backgrounds alternate between #0A0A0A and #111111
- [ ] Credibility trust signals display with icons + labels in a row
- [ ] Comparison slider handle is 40px (touch-friendly)
- [ ] All sections are properly spaced with consistent rhythm
- [ ] Landing page renders correctly on 375px, 414px, 768px, 1024px, 1440px
- [ ] No horizontal overflow on any viewport
- [ ] Meta tags render in page source (title, description, og:image, canonical)
- [ ] LCP <2.5s (hero headline is LCP element)
- [ ] CLS <0.1 (no layout shifts from lazy-loaded images)

---

## Launch Checklist

- [ ] 3-4 testimonials collected and added to `src/data/testimonials.ts`
- [ ] 6 app screenshots captured in 1170x2532px WebP format (<150KB each)
- [ ] Before/after comparison images created
- [ ] Public stats API endpoint deployed and returning data
- [ ] All 6 new landing page components built and integrated
- [ ] Hero walkthrough replaces static mockup
- [ ] Bottom CTA differentiated from hero CTA
- [ ] Feature cards enhanced with screenshot thumbnails
- [ ] Meta tags added: title, description, og:image, canonical URL
- [ ] Lighthouse Performance score 90+
- [ ] Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1
- [ ] Lazy loading verified for below-fold images
- [ ] Tested on iOS Safari (PWA and browser)
- [ ] Tested on Chrome Android
- [ ] Signed-in user redirect works (no landing page flash)
- [ ] CHANGELOG.md updated

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Walkthrough animation is janky on low-end mobile | Poor first impression for budget phone users | All animations use transform/opacity only. Detect `navigator.hardwareConcurrency < 4` and show static screenshot instead. |
| Public stats API leaks sensitive data | Privacy concern | Only expose aggregate counts (total users, total workouts). No PII, no per-user data, no recent activity. |
| Screenshots become outdated after UI updates | Landing page shows stale UI | Add screenshot regeneration to deployment checklist. Consider Playwright-based auto-capture script. |
| No real testimonials available at launch | Social proof section looks fake | Seed with beta tester quotes. Mark as "Beta tester" in context. Minimum 3 testimonials. Update with real feedback post-launch. |
| Comparison slider touch conflicts with page scroll | Frustrating mobile experience | Use `touch-action: pan-y` on container, `touch-action: none` on handle only. Test on iOS Safari and Chrome Android. |
| Landing page JS bundle too large | Slow initial load, poor Lighthouse score | Lazy load below-fold sections with `dynamic()`. Keep page-specific JS <100KB gzipped. Tree-shake Framer Motion. |
| SEO: animated content is not crawlable | Search engines cannot index the walkthrough | All value proposition text is in the DOM as semantic HTML. Walkthrough is purely decorative. Use `aria-hidden` on animation container. |
| Walkthrough on <375px screens is too small to see | App preview is unreadable on very small screens | Switch to a static screenshot with "See it in action" CTA that opens a full-screen overlay on screens <375px. |

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Framer Motion | Installed | Used for walkthrough animation, counter animation, carousel |
| Next.js Image | Installed | For optimized screenshot loading |
| App screenshots | Need to create | Requires current app to be in a visually polished state (post-P0/P1) |
| Public stats API | Need to create | Simple aggregate query endpoint |
| Testimonial content | Need to collect | From beta testers or early users |
| Micro-interactions PRD (P0) | Dependency | Walkthrough animation reuses spring configs and animation presets from `src/lib/animations.ts` |
| Visual Hierarchy PRD (P1) | Dependency | App must look polished in screenshots. Glassmorphism and elevation visible in captures. |
| Typography PRD (P1) | Dependency | Updated type scale visible in screenshots. |

### Cross-PRD Dependencies
- **Micro-interactions (P0):** The walkthrough animation simulates the weight bounce, set completion, and PR celebration animations defined in that PRD. Reuse the same Framer Motion variants from `src/lib/animations.ts`.
- **Visual Hierarchy (P1):** Screenshots must capture the upgraded card elevation, glassmorphism, and gradient progress bars. Take screenshots after P1 is deployed.
- **Typography & Spacing (P1):** Screenshots must show the updated type scale and spacing. Take screenshots after P1 is deployed.

---

## Implementation Plan

### Phase 1: Content Preparation (Week 1)
1. [ ] Collect 3-4 testimonials from beta testers / early users
2. [ ] Create testimonial data file `src/data/testimonials.ts`
3. [ ] Create public stats API endpoint `src/app/api/stats/public/route.ts`
4. [ ] Capture 6 app screenshots (after P0/P1 are deployed) in 1170x2532px WebP format
5. [ ] Create before/after comparison images

### Phase 2: Core Components (Week 2)
6. [ ] Create `src/components/landing/social-proof.tsx` with count-up animation
7. [ ] Create `src/components/landing/testimonials.tsx` with carousel/grid
8. [ ] Create `src/components/landing/screenshot-carousel.tsx` with snap scrolling
9. [ ] Create `src/components/landing/credibility.tsx`
10. [ ] Create `src/components/landing/comparison-slider.tsx` with drag interaction

### Phase 3: Walkthrough & Integration (Week 3)
11. [ ] Create `src/components/landing/app-walkthrough.tsx` with 7-step animation sequence
12. [ ] Update `src/components/landing/hero.tsx` to use AppWalkthrough instead of static mockup
13. [ ] Update `src/components/landing/cta.tsx` with differentiated messaging
14. [ ] Update `src/components/landing/features.tsx` with screenshot thumbnails
15. [ ] Assemble full page in `src/app/page.tsx` with all new sections

### Phase 4: Optimization & Testing (Week 4)
16. [ ] Add meta tags: title, description, og:image, canonical URL
17. [ ] Lazy load screenshots and below-fold sections
18. [ ] Lighthouse audit: target 90+ performance score
19. [ ] Test on mobile viewports (375px, 414px)
20. [ ] Test comparison slider touch interaction on iOS Safari
21. [ ] Verify CLS <0.1 with lazy-loaded content
22. [ ] A/B test hero (animated vs static) if traffic allows
23. [ ] Update CHANGELOG.md

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-04 | Initial PRD draft |
| 2026-03-26 | PRD quality audit: added Requirements (MoSCoW), User flows (4 numbered scenarios), Technical spec (TypeScript interfaces for Testimonial, PublicStats, WalkthroughStep, CounterItem, ComparisonSliderProps, code samples with useCountUp hook and slider touch handling), Testing (17 functional + 16 UI verification checks), Launch checklist (16 items), Risks & mitigations (8 risks) |
| 2026-03-26 | Status updated to SHIPPED - implementation verified in codebase |
