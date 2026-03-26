# Visual Hierarchy Redesign

> **Status:** SHIPPED
> **Owner:** Kwadwo
> **Created:** 2026-03-04
> **Project:** gym-tracker (SetFlow Webapp)
> **Roadmap Phase:** Phase 3 - Polish & Delight

---

## Problem Statement

SetFlow's current UI treats all content with equal visual weight. Cards, sections, and panels all share the same `bg-card border-border` styling with identical `shadow-sm` elevation. This creates a flat, monotonous visual landscape where the user's eye has no clear entry point. On the home page, the streak tracker, XP bar, challenges section, and workout preview all compete for attention at the same visual level.

Specific issues:
- **No primary/secondary distinction:** Today's workout card looks the same as a completed challenge card. The most important action (Start Workout) sits at the same visual tier as informational elements.
- **Completed items stay prominent:** Finished daily challenges and logged supersets maintain full opacity and size, cluttering the view with resolved content.
- **Floating elements lack depth:** The bottom tab bar and fixed "Start Workout" button use `backdrop-blur-lg` but still feel pasted on rather than floating above content.
- **Progress indicators are flat:** XP bars, challenge progress, and streak counters use solid fills with no gradient or glow to draw the eye.
- **No background depth:** The entire app is a flat `#0A0A0A` with no subtle gradients to create spatial hierarchy.

**Who has this problem?** All users, particularly new users trying to understand what to do first, and returning users trying to quickly find today's workout.

**What happens if we don't solve it?** Users spend cognitive energy parsing equal-weight content. The app feels utilitarian rather than premium. Important actions get lost among informational elements.

---

## Proposed Solution

Introduce a 3-tier visual hierarchy system with distinct elevation levels, hero cards for primary actions, muted states for completed content, gradient accents for progress, glassmorphism for floating chrome, and subtle background depth.

### Tier 1: Hero Cards (Primary Actions)
- Today's workout preview and active challenges
- Enhanced shadow with accent glow: `shadow-lg shadow-primary/10`
- Slightly larger border radius: `rounded-2xl`
- Subtle accent border: `border-primary/20`
- Gradient background: `bg-gradient-to-br from-card to-card/80`

### Tier 2: Standard Cards (Active Content)
- Exercise cards, weekly challenges, stats panels
- Current shadow level with refined borders: `shadow-md`
- Standard border radius: `rounded-xl`
- Neutral border: `border-border`

### Tier 3: Muted Cards (Completed/Secondary)
- Completed challenges, past workout logs, secondary info
- Reduced opacity: `opacity-75`
- Minimal shadow: `shadow-sm` or none
- Collapsed height with expand option
- Muted border: `border-border/50`

### Floating Chrome (Glass-morphism)
- Bottom tab bar, fixed CTAs, FABs
- Glass effect: `bg-background/60 backdrop-blur-xl border-t border-white/10`
- Subtle inner glow: `shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]`

### Progress Gradients
- XP bar fill: `bg-gradient-to-r from-[#CDFF00] to-[#22C55E]`
- Challenge progress: `bg-gradient-to-r from-[#CDFF00]/80 to-[#CDFF00]`
- Streak fire indicator: `bg-gradient-to-t from-orange-600 to-orange-400`

### Background Depth
- Subtle radial gradient behind hero cards: `bg-[radial-gradient(ellipse_at_top,_rgba(205,255,0,0.03)_0%,_transparent_50%)]`
- Section separators: soft gradient dividers instead of hard `border-b`

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Time to first action | <3 seconds from page load to tapping "Start Workout" | Session recording analysis |
| Visual hierarchy score | 80%+ users identify primary CTA in eye-tracking test | Usability testing (5 users) |
| Completed item scan time | -30% time spent scanning completed challenges | A/B test with task completion timing |
| User perception | "Clean" and "organized" in feedback | User interviews post-launch |
| Accessibility contrast | All text meets WCAG 2.1 AA (4.5:1 ratio) | axe-core automated scan |
| Performance | No increase in paint time (LCP <2.5s) | Lighthouse CI |

---

## Requirements

### Must Have
- [ ] 3-tier elevation system (hero, standard, muted) with distinct shadow, border, and background values
- [ ] Hero card component for primary actions (today's workout, active challenges)
- [ ] Muted card state for completed challenges (reduced opacity, collapsible)
- [ ] Glassmorphism on bottom tab bar (backdrop-blur, subtle border glow)
- [ ] Gradient progress bars for XP and challenge progress
- [ ] CSS custom properties for all elevation shadow tokens
- [ ] Elevation utility library (`src/lib/elevation.ts`)
- [ ] WCAG 2.1 AA contrast compliance on all text over new backgrounds

### Should Have
- [ ] Background depth gradients behind hero sections (subtle radial glow)
- [ ] Gradient section dividers replacing hard `border-b` lines
- [ ] Glassmorphism on fixed CTA bars
- [ ] Completed challenge auto-collapse after 2 items with "Show X completed" expand
- [ ] Completed superset muted state during workout
- [ ] Hero elevation on primary stat cards on stats page

### Won't Have
- Light mode elevation variants (dark-only app)
- Animated elevation transitions on scroll (keep elevation static per tier)
- Neumorphism or 3D card effects
- Custom shadow colors per page

---

## User Flows

### Flow 1: Home Page Visual Scan
1. User opens SetFlow and lands on the home page
2. Eyes are drawn to the hero card (today's workout preview) due to accent glow and larger shadow
3. User scans downward past gradient dividers to standard-tier challenge cards
4. Completed challenges appear muted (opacity 0.65, collapsed to single line)
5. User taps a completed challenge to expand and review details
6. Bottom tab bar floats above content with glassmorphism, clearly separated from page content

### Flow 2: Challenge Completion State Transition
1. User completes a daily challenge during a workout
2. Challenge card transitions from standard tier to muted tier (opacity animates from 1.0 to 0.65)
3. Card background shifts to `bg-success/5` with green checkmark overlay
4. Card height collapses to single line showing "[check] Challenge Name - Complete"
5. If this is the 3rd completed challenge, all 3 show muted with "All complete" header badge
6. Remaining active challenges maintain standard elevation

### Flow 3: Stats Page Hierarchy
1. User navigates to the stats page
2. Primary stat cards (total volume, current streak, PRs this week) display as hero tier
3. Secondary stat cards (historical data, charts) display as standard tier
4. User's attention naturally flows from hero stats to detailed breakdowns

### Flow 4: Workout Session Depth
1. User starts a workout and sees the active superset at standard elevation
2. Completed supersets shift to muted state (bg-success/5, muted text)
3. "All sets complete" badge replaces action buttons on completed supersets
4. User can still tap completed supersets to review or edit logged data

---

## Technical Spec

### TypeScript Interfaces

```typescript
// src/lib/elevation.ts
export type ElevationTier = "hero" | "standard" | "muted" | "glass";

export interface ElevationConfig {
  shadow: string;
  background: string;
  border: string;
  borderRadius: string;
  padding: string;
  opacity?: number;
}

export const ELEVATION: Record<ElevationTier, ElevationConfig> = {
  hero: {
    shadow: "shadow-[0_4px_24px_-4px_rgba(205,255,0,0.15),0_2px_8px_-2px_rgba(0,0,0,0.3)]",
    background: "bg-gradient-to-br from-[#1A1A1A] to-[#141414]",
    border: "border border-[#CDFF00]/20",
    borderRadius: "rounded-2xl",
    padding: "p-6",
  },
  standard: {
    shadow: "shadow-[0_2px_12px_-2px_rgba(0,0,0,0.25),0_1px_4px_-1px_rgba(0,0,0,0.15)]",
    background: "bg-card",
    border: "border border-border",
    borderRadius: "rounded-xl",
    padding: "p-4",
  },
  muted: {
    shadow: "shadow-[0_1px_4px_-1px_rgba(0,0,0,0.1)]",
    background: "bg-card/50",
    border: "border border-border/50",
    borderRadius: "rounded-xl",
    padding: "p-3",
    opacity: 0.7,
  },
  glass: {
    shadow: "shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.05)]",
    background: "bg-[#0A0A0A]/60 backdrop-blur-xl",
    border: "border-t border-white/[0.08]",
    borderRadius: "rounded-none",
    padding: "px-4 py-2",
  },
};

export function getElevationClasses(tier: ElevationTier): string;
// Returns combined Tailwind class string for the given tier
```

```typescript
// src/components/ui/hero-card.tsx
import { ReactNode } from "react";

export interface HeroCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string; // Default: "#CDFF00"
}

export function HeroCard({ children, className, glowColor }: HeroCardProps): JSX.Element;
```

```typescript
// src/components/ui/muted-card.tsx
import { ReactNode } from "react";

export interface MutedCardProps {
  children: ReactNode;
  className?: string;
  collapsible?: boolean; // Default: true
  collapsedLabel?: string; // Single-line summary when collapsed
  defaultExpanded?: boolean; // Default: false
}

export function MutedCard({ children, className, collapsible, collapsedLabel, defaultExpanded }: MutedCardProps): JSX.Element;
```

```typescript
// src/components/shared/progress-gradient.tsx
export interface ProgressGradientProps {
  value: number; // 0-100
  variant: "xp" | "challenge" | "streak";
  height?: "sm" | "md" | "lg"; // sm=h-2, md=h-3, lg=h-4
  showGlow?: boolean; // Default: true for xp variant
}

export function ProgressGradient({ value, variant, height, showGlow }: ProgressGradientProps): JSX.Element;
```

### Files to Create

| File | Description |
|------|-------------|
| `src/lib/elevation.ts` | Elevation system constants: shadow values, border styles, and background gradients for each tier |
| `src/components/ui/hero-card.tsx` | Hero-tier card variant with accent glow, gradient background, and larger padding |
| `src/components/ui/muted-card.tsx` | Muted-tier card variant with reduced opacity, collapsible, and minimal shadow |
| `src/components/shared/gradient-divider.tsx` | Soft gradient section divider replacing hard border-b lines |
| `src/components/shared/progress-gradient.tsx` | Gradient-filled progress bar with configurable color stops |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/ui/card.tsx` | Add elevation prop (`hero`, `standard`, `muted`) with corresponding shadow/border/background styles |
| `src/app/page.tsx` | Apply hero elevation to workout preview section, muted elevation to completed challenges, add background gradient behind hero section |
| `src/components/gamification/DailyChallengeCard.tsx` | Add muted state when `isComplete === true` (reduced opacity, collapsed, checkmark overlay) |
| `src/components/gamification/WeeklyChallengeCard.tsx` | Same muted state for completed weekly challenges |
| `src/components/gamification/XPBar.tsx` | Replace solid fill with lime-to-green gradient, add subtle glow behind progress |
| `src/components/layout/bottom-tab-bar.tsx` | Apply glassmorphism: `bg-[#0A0A0A]/60 backdrop-blur-xl`, add subtle top border glow |
| `src/components/workout/exercise-card.tsx` | Apply standard elevation, add hover elevation increase |
| `src/components/workout/superset-view.tsx` | Add subtle background gradient to group container |
| `src/app/globals.css` | Add CSS custom properties for elevation shadows, glass backgrounds, and gradient tokens |
| `src/app/stats/page.tsx` | Apply hero elevation to primary stat cards, standard to secondary |
| `src/components/stats/summary-cards.tsx` | Apply tier-based elevation to stat summary cards |

### Code Samples

```typescript
// Elevation utility usage in a component
import { getElevationClasses } from "@/lib/elevation";

export function WorkoutPreviewCard({ day }: { day: TrainingDay }) {
  return (
    <div className={cn(getElevationClasses("hero"), "relative overflow-hidden")}>
      {/* Hero backdrop glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(205,255,0,0.04)_0%,transparent_70%)] pointer-events-none" />
      <h2 className="text-[28px] font-bold tracking-tight">{day.name}</h2>
      {/* ... */}
    </div>
  );
}
```

```css
/* globals.css additions */
:root {
  --shadow-hero: 0 4px 24px -4px rgba(205, 255, 0, 0.15),
                 0 2px 8px -2px rgba(0, 0, 0, 0.3);
  --shadow-standard: 0 2px 12px -2px rgba(0, 0, 0, 0.25),
                     0 1px 4px -1px rgba(0, 0, 0, 0.15);
  --shadow-muted: 0 1px 4px -1px rgba(0, 0, 0, 0.1);
  --shadow-glass: 0 -4px 24px -4px rgba(0, 0, 0, 0.3),
                  inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
}
```

### Files to Create

| File | Description |
|------|-------------|
| `src/lib/elevation.ts` | Elevation system constants: shadow values, border styles, and background gradients for each tier |
| `src/components/ui/hero-card.tsx` | Hero-tier card variant with accent glow, gradient background, and larger padding |
| `src/components/ui/muted-card.tsx` | Muted-tier card variant with reduced opacity, collapsible, and minimal shadow |
| `src/components/shared/gradient-divider.tsx` | Soft gradient section divider replacing hard border-b lines |
| `src/components/shared/progress-gradient.tsx` | Gradient-filled progress bar with configurable color stops |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/ui/card.tsx` | Add elevation prop (`hero`, `standard`, `muted`) with corresponding shadow/border/background styles |
| `src/app/page.tsx` | Apply hero elevation to workout preview section, muted elevation to completed challenges, add background gradient behind hero section |
| `src/components/gamification/DailyChallengeCard.tsx` | Add muted state when `isComplete === true` (reduced opacity, collapsed, checkmark overlay) |
| `src/components/gamification/WeeklyChallengeCard.tsx` | Same muted state for completed weekly challenges |
| `src/components/gamification/XPBar.tsx` | Replace solid fill with lime-to-green gradient, add subtle glow behind progress |
| `src/components/layout/bottom-tab-bar.tsx` | Apply glassmorphism: `bg-[#0A0A0A]/60 backdrop-blur-xl`, add subtle top border glow |
| `src/components/workout/exercise-card.tsx` | Apply standard elevation, add hover elevation increase |
| `src/components/workout/superset-view.tsx` | Add subtle background gradient to group container |
| `src/app/globals.css` | Add CSS custom properties for elevation shadows, glass backgrounds, and gradient tokens |
| `src/app/stats/page.tsx` | Apply hero elevation to primary stat cards, standard to secondary |
| `src/components/stats/summary-cards.tsx` | Apply tier-based elevation to stat summary cards |

---

## Design Requirements

> **Implementation Note:** Implementation uses Tailwind utility classes and CSS variables. Raw CSS shown here defines the design tokens; actual component code uses TypeScript with Tailwind.

### CSS Design Tokens: Elevation Shadow System

```css
/* Tier 1: Hero */
--shadow-hero: 0 4px 24px -4px rgba(205, 255, 0, 0.15),
               0 2px 8px -2px rgba(0, 0, 0, 0.3);

/* Tier 2: Standard */
--shadow-standard: 0 2px 12px -2px rgba(0, 0, 0, 0.25),
                   0 1px 4px -1px rgba(0, 0, 0, 0.15);

/* Tier 3: Muted */
--shadow-muted: 0 1px 4px -1px rgba(0, 0, 0, 0.1);

/* Floating Chrome */
--shadow-glass: 0 -4px 24px -4px rgba(0, 0, 0, 0.3),
                inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
```

### Card Specifications

**Hero Card**
```
Background: bg-gradient-to-br from-[#1A1A1A] to-[#141414]
Border: border border-[#CDFF00]/20
Border Radius: rounded-2xl
Shadow: shadow-hero (custom)
Padding: p-6
```

**Standard Card**
```
Background: bg-card (existing #1A1A1A)
Border: border border-border (existing)
Border Radius: rounded-xl (existing)
Shadow: shadow-standard (custom)
Padding: p-4 (existing)
```

**Muted Card (Completed)**
```
Background: bg-card/50
Border: border border-border/50
Border Radius: rounded-xl
Shadow: none
Padding: p-3
Opacity: 0.7
Height: collapsed to single line with expand chevron
Transition: height 0.3s ease, opacity 0.3s ease
```

### CSS Design Tokens: Glassmorphism Specifications

**Bottom Tab Bar**
```css
background: rgba(10, 10, 10, 0.6);
backdrop-filter: blur(24px) saturate(180%);
-webkit-backdrop-filter: blur(24px) saturate(180%);
border-top: 1px solid rgba(255, 255, 255, 0.08);
box-shadow: 0 -4px 24px -4px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
```

**Fixed CTA Bar**
```css
background: rgba(10, 10, 10, 0.7);
backdrop-filter: blur(20px) saturate(150%);
-webkit-backdrop-filter: blur(20px) saturate(150%);
border-top: 1px solid rgba(255, 255, 255, 0.06);
```

### Progress Gradient Specifications

**XP Bar**
```
Fill: bg-gradient-to-r from-[#CDFF00] via-[#A3E635] to-[#22C55E]
Track: bg-[#1A1A1A]
Glow: box-shadow: 0 0 12px rgba(205, 255, 0, 0.3)
Border radius: rounded-full
Height: h-3
```

**Challenge Progress**
```
Fill: bg-gradient-to-r from-[#CDFF00]/60 to-[#CDFF00]
Track: bg-muted/30
Height: h-2
Border radius: rounded-full
```

### CSS Design Tokens: Background Depth

**Home Page Hero Area**
```css
/* Subtle radial glow behind the workout preview area */
.hero-backdrop::before {
  content: '';
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 400px;
  background: radial-gradient(ellipse at center, rgba(205, 255, 0, 0.04) 0%, transparent 70%);
  pointer-events: none;
}
```

**CSS Design Tokens: Section Gradient Dividers**
```css
/* Replace border-b border-border with soft gradient */
.gradient-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.08) 50%, transparent 100%);
}
```

### Completed State Visual Treatment

**Completed Challenge Card**
```
- Opacity reduced to 0.65
- Background shifts to bg-success/5
- Green checkmark overlay in top-right corner
- Content height collapses to single line: "[check] Challenge Name - Complete"
- Tap to expand shows full details
- Border changes to border-success/20
```

**Completed Superset (during workout)**
```
- Card background shifts to bg-success/5
- All set data shows in muted text
- "All sets complete" badge replaces action buttons
- Card can still be tapped to review/edit logged data
```

---

## Edge Cases

| Edge Case | Handling |
|-----------|----------|
| All challenges completed | Show all 3 in muted state with a "All complete" header badge. Do not hide them entirely - users want to see their accomplishments. |
| No active challenges | Standard card with "No challenges today" message, standard elevation |
| Dark mode only (SetFlow is dark-first) | All gradients and glows tested on #0A0A0A background. No light mode considerations needed. |
| `backdrop-filter` not supported | Feature detect with `@supports (backdrop-filter: blur(1px))`. Fallback: solid `bg-[#0A0A0A]/95` with no blur. Affects ~2% of users. |
| Very long streak (365+ days) | Same gradient treatment as standard. No special visual changes beyond 100-day milestone. |
| Many completed items causing visual monotony | Completed section auto-collapses after 2 items. "Show X completed" expand button. |
| Screen readers | Elevation is visual-only. Ensure `aria-label` and semantic HTML convey importance that visuals show. Hero cards get `role="region"` with `aria-label="Today's workout"`. |
| Glassmorphism performance on low-end | `backdrop-filter: blur()` can be expensive. Add `will-change: backdrop-filter` on fixed elements. Test on older Android devices. Consider reducing blur radius on low-end (detect via `navigator.hardwareConcurrency < 4`). |

---

## Testing

### Functional Tests
- [ ] Hero card renders with accent glow shadow and gradient background
- [ ] Standard card renders with medium shadow and neutral border
- [ ] Muted card renders with reduced opacity (0.7) and minimal shadow
- [ ] Muted card collapses to single line when `collapsible` is true
- [ ] Muted card expands on tap to show full content
- [ ] Completed challenge transitions from standard to muted state
- [ ] "All complete" header badge appears when all 3 daily challenges are done
- [ ] Auto-collapse triggers after 2 completed items with "Show X completed" button
- [ ] XP bar displays lime-to-green gradient fill with glow
- [ ] Challenge progress bar displays gradient fill
- [ ] Bottom tab bar renders with glassmorphism (blur + transparency)
- [ ] Gradient dividers render as soft horizontal fades (not hard lines)
- [ ] Hero backdrop glow renders behind workout preview section
- [ ] Card elevation prop accepts "hero", "standard", "muted" values
- [ ] `getElevationClasses()` returns correct Tailwind class string for each tier

### UI Verification
- [ ] Hero card accent glow is visible but subtle (not overpowering) on #0A0A0A background
- [ ] Muted card at opacity 0.7 is still readable (text contrast meets WCAG AA)
- [ ] Glassmorphism blur effect visible on bottom tab bar (content behind is blurred)
- [ ] `@supports (backdrop-filter: blur(1px))` fallback renders solid background
- [ ] XP bar gradient transitions smoothly from #CDFF00 to #22C55E
- [ ] No visible seams between gradient divider and surrounding background
- [ ] Shadow tokens match spec values exactly (Chrome DevTools computed styles)
- [ ] Elevation tiers create clear visual depth distinction (screenshot comparison)
- [ ] All text on hero cards passes WCAG 2.1 AA contrast (4.5:1 minimum)
- [ ] All text on muted cards passes WCAG 2.1 AA contrast at 0.7 opacity
- [ ] Layout renders correctly on 375px, 414px, 768px, 1024px, 1440px viewports
- [ ] No horizontal overflow or layout breaks with elevation changes
- [ ] `aria-label` and `role="region"` present on hero cards for screen readers

---

## Launch Checklist

- [ ] Elevation CSS custom properties added to `globals.css`
- [ ] `src/lib/elevation.ts` exports all tier configs and utility function
- [ ] Hero card, muted card, gradient divider, progress gradient components created
- [ ] Card component updated with elevation prop
- [ ] Home page applies correct tiers (hero for workout, muted for completed)
- [ ] Bottom tab bar glassmorphism applied and tested
- [ ] XP bar and challenge progress bars use gradient fills
- [ ] Stats page applies hero elevation to primary cards
- [ ] axe-core accessibility audit passes (no contrast failures)
- [ ] `backdrop-filter` fallback tested on unsupported browsers
- [ ] Lighthouse Performance score 90+ (no LCP regression)
- [ ] Visual regression test screenshots captured for all pages
- [ ] CHANGELOG.md updated

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| `backdrop-filter: blur()` causes performance issues on low-end Android | Tab bar scrolling feels janky | Add `will-change: backdrop-filter` on fixed elements. Reduce blur radius to 12px on devices with `navigator.hardwareConcurrency < 4`. |
| Muted state at opacity 0.7 makes text unreadable for some users | Accessibility failure | Test contrast ratios with axe-core. If below 4.5:1, increase muted opacity to 0.8 or use brighter text color on muted cards. |
| Hero card accent glow looks garish on some displays | Visual quality inconsistency | Use very low alpha values (0.15 for shadow, 0.04 for backdrop glow). Test on both OLED and LCD screens. |
| Gradient dividers are invisible on some screens | Sections feel unseparated | Fall back to a subtle solid border (`border-border/30`) if gradient is not visible at 1px height. Consider 2px height. |
| Too many elevation tiers create visual noise | Confusing rather than clarifying | Strictly limit to 3 tiers. Audit each page to ensure no more than 2 tiers are visible simultaneously in any viewport. |
| Glassmorphism on fixed CTA bar obscures content behind it | Users cannot see partially hidden content | Ensure sufficient bottom padding (`pb-44`) so content is never obscured. The blur itself communicates "this is above content." |

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Tailwind CSS | Installed | All styling uses Tailwind utilities |
| CSS `backdrop-filter` | Browser native | Supported in all modern browsers, needs `-webkit-` prefix for Safari |
| CSS custom properties | Browser native | For elevation shadow tokens |
| Micro-interactions PRD (P0) | Pending | Card hover/press animations from that PRD integrate with elevation changes here |

### Cross-PRD Dependencies
- **Micro-interactions (P0):** The hover lift and press compress animations defined in that PRD should use the elevation shadows defined here. A card on hover transitions from `shadow-standard` to `shadow-hero`.
- **Typography & Spacing (P1):** Larger section spacing (32-48px) from that PRD will work with gradient dividers defined here. Implement in parallel.
- **Landing Page Upgrade (P2):** The glassmorphism and elevation system can be reused on the landing page for feature cards and navigation.

---

## Implementation Plan

### Phase 1: Design Tokens (Week 1)
1. [ ] Add elevation CSS custom properties to `globals.css`
2. [ ] Create `src/lib/elevation.ts` with Tailwind class helpers
3. [ ] Create `src/components/shared/gradient-divider.tsx`
4. [ ] Create `src/components/shared/progress-gradient.tsx`

### Phase 2: Card System (Week 2)
5. [ ] Update `src/components/ui/card.tsx` with elevation prop
6. [ ] Create `src/components/ui/hero-card.tsx`
7. [ ] Create `src/components/ui/muted-card.tsx`
8. [ ] Apply hero card to workout preview on home page
9. [ ] Apply muted card to completed challenges

### Phase 3: Chrome & Progress (Week 3)
10. [ ] Update `src/components/layout/bottom-tab-bar.tsx` with glassmorphism
11. [ ] Update fixed CTA bars with glassmorphism
12. [ ] Update XPBar with gradient fill and glow
13. [ ] Update challenge progress bars with gradients
14. [ ] Add background depth gradients to home page

### Phase 4: Polish & Testing (Week 4)
15. [ ] Apply elevation tiers across all pages (stats, program, exercises, nutrition)
16. [ ] Test `backdrop-filter` fallback on unsupported browsers
17. [ ] Run axe-core accessibility audit on contrast ratios
18. [ ] Performance test: confirm no LCP regression
19. [ ] Test on iOS Safari PWA standalone mode
20. [ ] Update CHANGELOG.md

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-04 | Initial PRD draft |
| 2026-03-26 | PRD quality audit: added Requirements (MoSCoW), User flows (4 numbered scenarios), Technical spec (TypeScript interfaces for ElevationConfig, HeroCard, MutedCard, ProgressGradient, code samples), Testing (15 functional + 13 UI verification checks), Launch checklist (13 items), Risks & mitigations (6 risks) |
| 2026-03-26 | Status updated to SHIPPED - implementation verified in codebase |
