# Typography & Spacing Upgrade

> **Status:** SHIPPED
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

## Requirements

### Must Have
- [ ] H1 increased to 36px with font-extrabold (800) and tracking-tight
- [ ] H2 increased to 28px with font-bold (700) and tracking-tight
- [ ] H3 increased to 20px with font-semibold (600)
- [ ] Uppercase labels updated to tracking-[0.08em] letter spacing
- [ ] Section spacing increased to 32px (`space-y-8`) between major sections
- [ ] Card padding increased to 20px (`p-5`) for standard cards, 24px (`p-6`) for hero cards
- [ ] Consistent `py-5` (20px) for hero section internal padding
- [ ] Bottom padding increased to `pb-44` (176px) above tab bar
- [ ] Data displays use `tabular-nums` and `leading-none`
- [ ] Typography constants library (`src/lib/typography.ts`)

### Should Have
- [ ] Desktop responsive scaling: H1 40px, H2 32px, H3 22px at `lg:` breakpoint
- [ ] Badge gap increased to `gap-2.5` (10px) in exercise cards
- [ ] Weight adjustment button gap increased to `gap-2.5`
- [ ] Bottom tab bar label increased from 10px to 11px
- [ ] Landing page headings updated to match new type scale
- [ ] Nutrition component spacing aligned with new spacing scale

### Won't Have
- Variable font features (optical sizing, width axis)
- Custom font loading beyond Inter
- Per-page typography overrides (unified scale across all pages)
- Dark/light mode typography differences

---

## User Flows

### Flow 1: Gym-Distance Reading
1. User places phone on gym floor or bench (approximately 60-80cm away)
2. User looks at screen between sets to identify the next exercise
3. H2 at 28px with bold weight is readable at arm's length without squinting
4. Exercise name at H3 (20px) is clearly distinguishable from rep count text (16px body)
5. Weight display at 36px+ with tabular-nums stands out as the primary data point

### Flow 2: Quick Section Navigation
1. User scrolls through home page looking for today's workout
2. 32px spacing between major sections creates clear visual breaks
3. Gradient dividers (from visual hierarchy PRD) combined with spacing make sections scannable
4. User identifies the workout section within 2 seconds of scrolling
5. Consistent `py-5` padding on hero sections (streak, XP, challenges) creates rhythm

### Flow 3: Set Logger Data Clarity
1. User enters the workout session and views the set logger
2. Exercise name at 20px (`text-xl`) is clearly the title
3. Weight display at 36px+ with `tracking-tight` and `leading-none` is the dominant number
4. Rep count and set number at 16px body are subordinate to weight
5. Label spacing at 12px (`mb-3`) separates "WARMUP" and "WORKING SETS" sections clearly
6. User adjusts weight with buttons spaced at 10px (`gap-2.5`), reducing mis-tap risk

### Flow 4: Responsive Desktop Experience
1. User opens SetFlow on a desktop browser (1024px+)
2. H1 scales to 40px, H2 to 32px, H3 to 22px for comfortable desktop reading
3. Section spacing increases to 48px for more breathing room on larger screens
4. Card padding increases to 24px, using available space without feeling cramped
5. Layout remains balanced and readable across the wider viewport

---

## Technical Spec

### TypeScript Interfaces

```typescript
// src/lib/typography.ts
export interface TypeScaleLevel {
  size: string; // Tailwind class, e.g., "text-4xl"
  weight: string; // Tailwind class, e.g., "font-extrabold"
  tracking: string; // Tailwind class, e.g., "tracking-tight"
  leading: string; // Tailwind class, e.g., "leading-tight"
  desktopSize?: string; // Optional lg: override, e.g., "lg:text-[40px]"
}

export const TYPE_SCALE: Record<string, TypeScaleLevel> = {
  h1: {
    size: "text-4xl",
    weight: "font-extrabold",
    tracking: "tracking-tight",
    leading: "leading-tight",
    desktopSize: "lg:text-[40px]",
  },
  h2: {
    size: "text-[28px]",
    weight: "font-bold",
    tracking: "tracking-tight",
    leading: "leading-tight",
    desktopSize: "lg:text-[32px]",
  },
  h3: {
    size: "text-xl",
    weight: "font-semibold",
    tracking: "",
    leading: "leading-tight",
    desktopSize: "lg:text-[22px]",
  },
  body: {
    size: "text-base",
    weight: "font-normal",
    tracking: "",
    leading: "leading-relaxed",
  },
  small: {
    size: "text-sm",
    weight: "font-normal",
    tracking: "",
    leading: "leading-snug",
  },
  caption: {
    size: "text-xs",
    weight: "font-normal",
    tracking: "",
    leading: "leading-normal",
  },
  label: {
    size: "text-sm",
    weight: "font-semibold",
    tracking: "tracking-[0.08em]",
    leading: "leading-normal",
  },
  dataDisplay: {
    size: "text-4xl",
    weight: "font-bold",
    tracking: "tracking-tight",
    leading: "leading-none",
  },
};

export interface SpacingScale {
  sectionGap: string; // space-y-8 (32px)
  heroSectionPadding: string; // py-5 (20px)
  cardGapInSection: string; // space-y-3 (12px)
  cardPadding: string; // p-5 (20px)
  heroCardPadding: string; // p-6 (24px)
  labelToContent: string; // mb-3 (12px)
  pageBottomPadding: string; // pb-44 (176px)
}

export const SPACING: SpacingScale = {
  sectionGap: "space-y-8",
  heroSectionPadding: "py-5",
  cardGapInSection: "space-y-3",
  cardPadding: "p-5",
  heroCardPadding: "p-6",
  labelToContent: "mb-3",
  pageBottomPadding: "pb-44",
};

export function getTypeClasses(level: keyof typeof TYPE_SCALE): string;
// Returns combined Tailwind class string for the given type scale level
```

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

### Code Samples

```typescript
// Using typography utility in a component
import { getTypeClasses, SPACING } from "@/lib/typography";

export function SectionHeader({ title, label }: { title: string; label?: string }) {
  return (
    <div className={SPACING.heroSectionPadding}>
      {label && (
        <span className={cn(getTypeClasses("label"), "uppercase text-muted-foreground", SPACING.labelToContent)}>
          {label}
        </span>
      )}
      <h2 className={getTypeClasses("h2")}>{title}</h2>
    </div>
  );
}
```

```css
/* globals.css additions */
:root {
  --text-h1: 36px;
  --text-h2: 28px;
  --text-h3: 20px;
}

@media (min-width: 1024px) {
  :root {
    --text-h1: 40px;
    --text-h2: 32px;
    --text-h3: 22px;
  }
}
```

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

## Testing

### Functional Tests
- [ ] H1 renders at 36px on mobile and 40px on desktop (lg+)
- [ ] H2 renders at 28px on mobile and 32px on desktop
- [ ] H3 renders at 20px on mobile and 22px on desktop
- [ ] Font weights match spec: H1=800, H2=700, H3=600
- [ ] Uppercase labels use tracking-[0.08em] letter spacing
- [ ] Data displays (weight, timer) use `tabular-nums` font-variant
- [ ] Section spacing is 32px (`space-y-8`) between major sections
- [ ] Card padding is 20px (`p-5`) for standard, 24px (`p-6`) for hero
- [ ] Hero sections use consistent `py-5` padding
- [ ] Bottom page padding is `pb-44` (176px)
- [ ] Tab bar label renders at 11px
- [ ] `getTypeClasses()` returns correct combined class string for each level
- [ ] All typography constants export correctly from `src/lib/typography.ts`
- [ ] Weight display in set logger shows `tracking-tight` and `leading-none`

### UI Verification
- [ ] H2 heading is readable at 80cm distance (arm's length gym test)
- [ ] Weight display (36px+) is clearly the dominant number on set logger
- [ ] Exercise name (20px) is distinguishable from body text (16px)
- [ ] Section spacing creates clear visual breaks between home page areas
- [ ] No content overflow with larger headings on 375px viewport
- [ ] Long exercise names truncate correctly at new H3 size (20px)
- [ ] Layout does not break at 150% system font scaling
- [ ] Bottom content is not hidden behind tab bar + CTA with `pb-44`
- [ ] Spacing is consistent across all pages (home, stats, program, exercises, nutrition)
- [ ] Desktop type scale (40/32/22px) looks proportional on 1024px+ screens
- [ ] Desktop section spacing (48px) provides appropriate breathing room
- [ ] Tab bar label at 11px is legible and does not overflow tab width
- [ ] No horizontal scroll introduced by larger typography on any viewport

---

## Launch Checklist

- [ ] `src/lib/typography.ts` created with TYPE_SCALE and SPACING exports
- [ ] CSS custom properties for type scale added to `globals.css`
- [ ] All heading instances across pages updated to new scale
- [ ] Section spacing updated on home, stats, program, exercises, and nutrition pages
- [ ] Card padding updated across all card components
- [ ] Data displays use tabular-nums and leading-none
- [ ] Desktop responsive overrides (lg: breakpoint) applied
- [ ] Visual regression test screenshots on 375px, 414px, 768px, 1024px, 1440px
- [ ] Gym readability test passed (H2 at 80cm)
- [ ] System font scaling test passed (150% without layout breaks)
- [ ] axe-core audit passes (no contrast or size violations)
- [ ] Lighthouse Performance score 90+ (no regression from larger text)
- [ ] CHANGELOG.md updated

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| H1 at 36px is too large on 320px-width screens (iPhone SE 1st gen) | Text wraps awkwardly or overflows | Add `min-[320px]:text-3xl` fallback. Test on 320px viewport. SE 1st gen is <1% of users. |
| Larger spacing increases scroll depth on all pages | Users scroll more, may feel content is sparse | Acceptable trade-off for readability. Monitor scroll depth analytics post-launch. Larger spacing benefits gym-distance use case. |
| Increased card padding reduces content density | Less visible above the fold | Prioritize content hierarchy. Hero card content is most important, muted/completed cards can collapse (see visual hierarchy PRD). |
| Typography constants drift if developers use hardcoded values | Inconsistent type scale | Code review gate: reject PRs with hardcoded font sizes. Lint rule for checking typography utility usage. |
| System font scaling at 150%+ breaks layouts | Accessibility failure for users with vision impairments | All sizes use `rem` (Tailwind default). Test at 150% and 200% scaling. Add max-width constraints where needed. |
| Tab bar label at 11px may overflow on translated labels | Broken tab bar on localized versions | Test with longest expected label. Currently English-only, but future-proof with truncation. |
| Bottom padding `pb-44` may be too much on phones without home indicator | Excessive white space at page bottom | Use `safe-area-inset-bottom` padding as an additive. Test on devices with and without home indicators. |

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
| 2026-03-26 | PRD quality audit: added Requirements (MoSCoW), User flows (4 numbered scenarios), Technical spec (TypeScript interfaces for TypeScaleLevel, SpacingScale, code samples with globals.css additions), Testing (14 functional + 13 UI verification checks), Launch checklist (13 items), Risks & mitigations (7 risks) |
| 2026-03-26 | Status updated to SHIPPED - implementation verified in codebase |
