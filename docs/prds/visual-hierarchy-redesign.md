# Visual Hierarchy Redesign

> **Status:** Draft
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

## User Stories

- As a user opening the app, I want my eyes to immediately find today's workout so that I can start training without scanning the entire page.
- As a user who completed 2 of 3 daily challenges, I want completed challenges to be visually muted so that I can focus on the remaining one.
- As a user scrolling through my program, I want hero-level emphasis on the current day's workout so that it stands out from other training days.
- As a user using the app at the gym, I want the bottom navigation to feel like it floats above content so that I can clearly distinguish navigation from page content.
- As a user tracking progress, I want gradient-filled progress bars so that my advancement feels dynamic rather than flat.

---

## Technical Scope

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

## Priority

**P1** - Visual hierarchy is the structural foundation of the UI. It determines what users see first, what they interact with, and what they can safely ignore. Implement after micro-interactions (P0) which provides the animation infrastructure this PRD's transitions depend on.

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
