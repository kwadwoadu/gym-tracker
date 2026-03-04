# Typography & Spacing Upgrade

> **Status:** Draft
> **Owner:** Kwadwo
> **Created:** 2026-03-04
> **Project:** gym-tracker (SetFlow Webapp)
> **Roadmap Phase:** Phase 3 - Polish & Delight

---

## Problem Statement

SetFlow's current typography and spacing create readability issues in its primary usage context: the gym. Users interact with the app while standing, often at arm's length (phone on a bench or gym floor), between sets with elevated heart rate and reduced focus. The current type scale and spacing work against this context:

**Typography issues:**
- H1 is 32px (`text-3xl` / Tailwind default) and H2 is 24px (`text-2xl`). On a 6.1" phone at arm's length (~60cm), these are difficult to scan quickly. The day title "Full Body A" at 24px blends with surrounding text.
- All headings use the same font weight (`font-bold`/700), reducing the hierarchy signal between heading levels.
- Section labels ("WARMUP", "DAILY CHALLENGES") at 14px (`text-sm`) with `uppercase tracking-wider` are readable but their letter spacing (Tailwind's `tracking-wider` = 0.05em) could be more generous for better legibility.
- Body text line height is Tailwind's default (1.5), which is optimized for reading paragraphs, not scanning data during exercise.

**Spacing issues:**
- Sections are separated by 16-24px (`space-y-4` to `space-y-6`), making them feel cramped. The challenges section flows directly into the day tabs with only a `border-b` as a separator.
- Card internal padding is 16px (`p-4`), which is tight for touch targets during exercise when hands may be sweaty or shaky.
- The gap between the streak tracker, XP bar, and challenges section is inconsistent (some use `py-3`, others `py-4`).

**The result:** Users squint, mis-tap, and lose their place when scanning between sets. The dense layout creates cognitive overhead that should not exist in a gym app.

**Who has this problem?** Every user logging workouts in the gym. Desktop users at home are less affected but still benefit from clearer hierarchy.

**What happens if we don't solve it?** Users make more input errors (wrong weight, wrong reps). The app feels cramped and stressful rather than calm and focused. Users with vision impairments are excluded.

---

## Proposed Solution

Upgrade the type scale, font weights, letter spacing, line height, and section spacing to optimize for gym-context readability. All changes use the existing Inter font (loaded via `next/font/google`) and Tailwind CSS utilities.

### Typography Changes

**Heading Scale (Mobile)**
| Level | Current | New | Tailwind Class |
|-------|---------|-----|----------------|
| H1 (Page titles) | 32px / `text-3xl` | 36px / `text-4xl` | `text-4xl` |
| H2 (Section titles) | 24px / `text-2xl` | 28px / custom | `text-[28px]` |
| H3 (Card titles) | 18px / `text-lg` | 20px / `text-xl` | `text-xl` |
| Body | 16px / `text-base` | 16px / `text-base` | No change |
| Small | 14px / `text-sm` | 14px / `text-sm` | No change |
| Caption | 12px / `text-xs` | 12px / `text-xs` | No change |

**Heading Scale (Desktop, lg+)**
| Level | New | Tailwind Class |
|-------|-----|----------------|
| H1 | 40px | `lg:text-[40px]` |
| H2 | 32px | `lg:text-[32px]` |
| H3 | 22px | `lg:text-[22px]` |

**Font Weight Hierarchy**
| Level | Current | New | Purpose |
|-------|---------|-----|---------|
| H1 | `font-bold` (700) | `font-extrabold` (800) | Maximum emphasis for page titles |
| H2 | `font-bold` (700) | `font-bold` (700) | Strong emphasis for sections |
| H3 | `font-semibold` (600) | `font-semibold` (600) | Medium emphasis for cards |
| Body emphasized | `font-medium` (500) | `font-medium` (500) | No change |
| Body | `font-normal` (400) | `font-normal` (400) | No change |

**Letter Spacing**
| Context | Current | New | Tailwind |
|---------|---------|-----|----------|
| Uppercase labels | `tracking-wider` (0.05em) | `tracking-[0.08em]` | `tracking-[0.08em]` |
| H1 | default (0) | `tracking-tight` (-0.025em) | `tracking-tight` |
| H2 | default (0) | `tracking-tight` (-0.025em) | `tracking-tight` |
| Weight display (4xl) | default (0) | `tracking-tight` (-0.025em) | `tracking-tight` |

**Line Height**
| Context | Current | New | Tailwind |
|---------|---------|-----|----------|
| Headings | `leading-normal` (1.5) | `leading-tight` (1.25) | `leading-tight` |
| Body text | `leading-normal` (1.5) | `leading-relaxed` (1.625) | `leading-relaxed` |
| Data displays (weight, reps) | `leading-normal` (1.5) | `leading-none` (1.0) | `leading-none` |
| Card descriptions | `leading-normal` (1.5) | `leading-snug` (1.375) | `leading-snug` |

### Spacing Changes

**Section Spacing**
| Context | Current | New | Tailwind |
|---------|---------|-----|----------|
| Between major sections | `space-y-4` (16px) or `space-y-6` (24px) | `space-y-8` (32px) | `space-y-8` |
| Between hero sections (streak, XP, challenges) | `py-3` / `py-4` inconsistent | `py-5` (20px) consistent | `py-5` |
| Between cards within a section | `space-y-2` (8px) or `space-y-3` (12px) | `space-y-3` (12px) consistent | `space-y-3` |
| Page top padding | `pt-safe-top pb-4` | `pt-safe-top pb-5` | `pb-5` |
| Page bottom padding | `pb-40` (mobile, above tab bar) | `pb-44` (176px, more breathing room) | `pb-44` |

**Card Internal Spacing**
| Context | Current | New | Tailwind |
|---------|---------|-----|----------|
| Card padding (standard) | `p-4` (16px) | `p-5` (20px) | `p-5` |
| Card padding (hero) | `p-4` (16px) | `p-6` (24px) | `p-6` |
| Card header to content gap | `mb-4` (16px) | `mb-5` (20px) | `mb-5` |
| Between card items | `space-y-2` (8px) | `space-y-3` (12px) | `space-y-3` |

**Element Spacing**
| Context | Current | New | Tailwind |
|---------|---------|-----|----------|
| Section label to content | `mb-2` (8px) | `mb-3` (12px) | `mb-3` |
| Badge gap in exercise card | `gap-2` (8px) | `gap-2.5` (10px) | `gap-2.5` |
| Button internal gap | `mr-2` (8px) | `gap-2.5` (10px) | `gap-2.5` (use flex gap) |
| Weight adjustment buttons | `gap-2` (8px) | `gap-2.5` (10px) | `gap-2.5` |

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Readability at distance | H2 readable at 80cm (arm's length) | Manual test with 5 users at gym distance |
| Tap error rate | -20% reduction in weight/rep mis-taps | Compare mis-tap correction rate before/after |
| Scan speed | Users identify current exercise in <2s | Task completion timing with 5 users |
| WCAG compliance | All text passes WCAG 2.1 AA minimum size guidelines | axe-core + manual audit |
| User perception | "Easy to read" in feedback | Post-launch user interviews |
| No layout regression | Zero layout breaks across all pages | Visual regression testing on 375px, 768px, 1024px, 1440px viewports |

---

## User Stories

- As a user standing at a squat rack with my phone on the floor, I want headings large enough to read at arm's length so that I can see which exercise is next without picking up my phone.
- As a user between sets with elevated heart rate, I want generous spacing between sections so that I can quickly find the set logger without scanning through dense content.
- As a user logging my weight, I want the large weight display to be clearly separated from other numbers (reps, sets) so that I do not confuse them.
- As a user scrolling through my program, I want clear visual breaks between workout days so that I can distinguish Day 1 from Day 2 at a glance.
- As a user with mild presbyopia (common in lifters 35+), I want text sizes that account for reduced near-focus ability so that I can use the app without reading glasses.

---

## Technical Scope

### Files to Create

| File | Description |
|------|-------------|
| `src/lib/typography.ts` | Typography constants and Tailwind class presets for each heading level, exported as composable utility |

### Files to Modify

| File | Change |
|------|--------|
| `src/app/globals.css` | Add custom CSS properties for the type scale: `--text-h1`, `--text-h2`, `--text-h3` with responsive values |
| `src/app/page.tsx` | Update day title from `text-2xl` to `text-[28px]`, section spacing from `space-y-6` to `space-y-8`, consistent `py-5` for hero sections |
| `src/app/layout.tsx` | No changes needed (font already configured) |
| `src/components/workout/set-logger.tsx` | Update exercise name to `text-xl`, weight display to include `tracking-tight`, increase card padding to `p-6`, increase `mb-6` gaps to `mb-8` |
| `src/components/workout/exercise-card.tsx` | Update exercise name from `text-lg` to `text-xl`, card padding from `p-4` to `p-5`, badge gap from `gap-2` to `gap-2.5` |
| `src/components/workout/superset-view.tsx` | Update superset heading, increase internal spacing |
| `src/components/gamification/XPBar.tsx` | Increase section padding to `py-5` |
| `src/components/gamification/DailyChallengeCard.tsx` | Increase card padding, label spacing |
| `src/components/gamification/WeeklyChallengeCard.tsx` | Same spacing updates as DailyChallengeCard |
| `src/components/stats/summary-cards.tsx` | Update stat headings and value sizes |
| `src/components/stats/pr-list.tsx` | Update PR name and value typography |
| `src/components/workout/rest-timer.tsx` | Update timer display: label letter spacing to `tracking-[0.08em]` |
| `src/components/layout/bottom-tab-bar.tsx` | Increase label size from `text-[10px]` to `text-[11px]` |
| `src/components/landing/hero.tsx` | Update heading scale for landing page consistency |
| `src/components/landing/features.tsx` | Update feature card title from `text-lg` to `text-xl`, increase card padding |
| `src/components/nutrition/daily-checklist.tsx` | Update spacing between meal slots |
| `src/components/nutrition/macros-summary.tsx` | Update macro value typography |

---

## Design Requirements

### Type Scale Visual Reference

```
H1 (36px, 800 weight, tracking-tight)
"Full Body A"

H2 (28px, 700 weight, tracking-tight)
"Daily Challenges"

H3 (20px, 600 weight)
"Barbell Bench Press"

Body (16px, 400 weight, leading-relaxed)
"4 sets x 8-10 reps"

Small (14px, 400 weight, leading-snug)
"Last week: 80kg x 10"

Caption (12px, 400 weight)
"Set 2 of 4"

Uppercase Label (14px, 600 weight, tracking-[0.08em])
"WARMUP"

Data Display (36px+, 700 weight, tabular-nums, leading-none, tracking-tight)
"82.5 kg"
```

### Spacing Visual Reference

```
+--------------------------------------------------+
|  Header (pt-safe-top pb-5)                        |
+--------------------------------------------------+
|                                                    |
|  Streak Tracker (py-5)                             |
|                                                    |
+-- gradient divider --+                             |
|                                                    |
|  XP Bar (py-5)                                     |
|                                                    |
+-- gradient divider --+                             |
|                                                    |
|  Challenges Section (py-5)                         |
|    [Card 1] space-y-3                              |
|    [Card 2]                                        |
|    [Card 3]                                        |
|                                                    |
+-- gradient divider --+                             |
|                      32px (space-y-8)              |
|  Day Tabs                                          |
|                      32px                          |
|  Workout Content                                   |
|    [Superset A]      12px (space-y-3)              |
|    [Superset B]                                    |
|    [Superset C]                                    |
|                                                    |
|                      pb-44 (above tab bar)         |
+--------------------------------------------------+
|  Bottom Tab Bar                                    |
+--------------------------------------------------+
```

### Responsive Behavior

**375px (iPhone SE)**
- H1: 36px, H2: 28px, H3: 20px
- Section spacing: 32px
- Card padding: 20px

**414px (iPhone 14 Pro)**
- Same as 375px (optimal for this size)

**768px (iPad)**
- H1: 36px, H2: 28px, H3: 20px
- Section spacing: 36px
- Card padding: 20px

**1024px+ (Desktop)**
- H1: 40px, H2: 32px, H3: 22px
- Section spacing: 48px
- Card padding: 24px

### Font Feature Settings

```css
/* Enable tabular numbers for all data displays */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* Already used in set-logger.tsx and rest-timer.tsx - ensure consistent application */
```

---

## Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Very long exercise names (e.g., "Dumbbell Single-Arm Incline Bench Press") | Truncate with `truncate` class at H3 size (20px). Full name visible on expand. Already handled in ExerciseCard but verify at new size. |
| Small screens (320px width, iPhone SE 1st gen) | H1 at 36px may be too large. Add `min-[320px]:text-3xl` fallback. Test on 320px viewport. |
| RTL languages | Not currently supported. Type scale and spacing are direction-agnostic. No impact. |
| System font size scaling (accessibility) | Respect OS-level font scaling. Use `rem` units (Tailwind default) so that system font size preferences are honored. Verify layout does not break at 150% system font size. |
| Content overflow with larger headings | Test all pages with longest possible content at new sizes. Particularly: exercise names in set-logger, program names in header, stat values with 4+ digits. |
| Bottom padding above tab bar | Currently `pb-40` (160px). Increasing to `pb-44` (176px) ensures content is not hidden behind the fixed CTA bar + tab bar combo. Verify on devices with and without home indicator (safe-area-inset-bottom). |
| Consistent spacing across pages | Create spacing constants in `typography.ts` to prevent drift. All pages should use the same section spacing values rather than hardcoded Tailwind classes. |
| Impact on scroll position | Larger spacing means more scrolling. Acceptable trade-off for readability. Monitor scroll depth analytics post-launch. |

---

## Priority

**P1** - Typography and spacing are foundational to usability. They make every other element easier to interact with. Implement in parallel with Visual Hierarchy Redesign (also P1), as the two PRDs complement each other without blocking dependencies.

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Inter font | Installed | Already loaded via `next/font/google` in layout.tsx |
| Tailwind CSS | Installed | All changes use Tailwind utilities, some with arbitrary values `text-[28px]` |
| No external dependencies | Ready | Can start immediately |

### Cross-PRD Dependencies
- **Micro-interactions (P0):** Weight bounce animation travel distance should be calibrated to the new weight display size (36px+). If implementing in parallel, coordinate spring values.
- **Visual Hierarchy Redesign (P1):** Hero cards get `p-6` padding (aligned with this PRD's card spacing increase). Standard cards get `p-5`. Implement in parallel - both PRDs modify card padding but with compatible values.
- **Landing Page Upgrade (P2):** Landing page headings should use the same type scale. Update `hero.tsx` and `features.tsx` heading sizes to match.

---

## Implementation Plan

### Phase 1: Type Scale Foundation (Week 1)
1. [ ] Create `src/lib/typography.ts` with heading/spacing constants
2. [ ] Update `src/app/globals.css` with custom type scale CSS properties
3. [ ] Update home page (`src/app/page.tsx`) headings and section spacing
4. [ ] Update set-logger typography (exercise name, weight display, labels)

### Phase 2: Component Updates (Week 2)
5. [ ] Update `exercise-card.tsx` typography and padding
6. [ ] Update `superset-view.tsx` heading and spacing
7. [ ] Update gamification components (XPBar, DailyChallengeCard, WeeklyChallengeCard) spacing
8. [ ] Update `rest-timer.tsx` label letter spacing
9. [ ] Update `bottom-tab-bar.tsx` label size
10. [ ] Update `summary-cards.tsx` and `pr-list.tsx` stat typography

### Phase 3: Landing Page & Nutrition (Week 2)
11. [ ] Update `hero.tsx` heading scale
12. [ ] Update `features.tsx` card title and padding
13. [ ] Update nutrition components spacing
14. [ ] Update `macros-summary.tsx` data display typography

### Phase 4: Testing & Verification (Week 3)
15. [ ] Visual regression test on 375px, 414px, 768px, 1024px, 1440px
16. [ ] Gym readability test: verify H2 readable at 80cm
17. [ ] Test with 150% system font scaling
18. [ ] Verify no content overflow or layout breaks
19. [ ] Test bottom padding above tab bar on various devices
20. [ ] Update CHANGELOG.md

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-04 | Initial PRD draft |
