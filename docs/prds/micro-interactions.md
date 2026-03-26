# Micro-interactions & Delight

> **Status:** SHIPPED
> **Owner:** Kwadwo
> **Created:** 2026-03-04
> **Priority:** P0
> **Roadmap Phase:** Phase 3 - Polish & Delight

---

## Problem Statement

SetFlow is functional but lacks the tactile, satisfying feedback loop that premium fitness apps deliver. Currently, the app has minimal animation beyond confetti on level-up (MilestoneModal) and a basic card scale on set completion. Interactions feel flat: tapping "Complete Set" gives a checkmark but no visceral reward. Adjusting weight feels no different from editing a text field. Hitting a PR has no special moment. The rest timer completes silently on mobile (no vibration). Navigation between pages is an instant swap with no transition.

Users describe the app as "useful" but not "satisfying to use." Competitors like Fitbod, Hevy, and Strong have polished micro-interactions that make logging feel rewarding rather than tedious. In a gym setting where motivation matters, these small moments of delight compound into habit formation.

**Who has this problem?** Every SetFlow user. Micro-interactions affect the entire experience, from first login to daily use.

**What happens if we don't solve it?** The app remains functional but forgettable. Users log workouts out of discipline rather than enjoyment. Retention suffers as alternatives feel more polished. The "just one more set" motivation loop never kicks in.

---

## Proposed Solution

Add a comprehensive micro-interaction system across 8 interaction categories, building on the existing Framer Motion and Web Audio API infrastructure.

### 1. Weight Input Bounce
When the user taps +/- weight buttons or quick-increment buttons (-5, -2.5, -1, +1, +2.5, +5), the weight display bounces with a spring animation. The bounce direction matches the adjustment direction (up for increase, down for decrease).

### 2. Set Completion Celebration
When the user taps "Complete Set," the current checkmark animation is enhanced with:
- A satisfying check-circle fill animation (stroke draws, then fills with green)
- A subtle haptic-style pulse on the entire card
- A short audio confirmation via Web Audio API (ascending two-note chime)
- The "Logged: 80kg x 10 reps" text slides in with a staggered letter animation

### 3. PR Detection Gold Flash
When the system detects a new personal record:
- The exercise card flashes gold (`#FFD700`) with a radial burst animation
- A gold trophy icon scales in with spring physics
- A shimmer/sparkle effect sweeps across the card
- The PR badge pulses with a glow animation
- Audio: The existing `playPR()` melody plays, with an added shimmer sound layer

### 4. Streak Milestone Animations
Unique celebration animations at specific streak milestones:
- **7 days:** Fire emoji cascade with orange particle burst
- **30 days:** Lightning bolt animation with electric blue pulse
- **100 days:** Crown animation with gold confetti and special audio fanfare
- Each milestone has a distinct Framer Motion sequence and unique sound

### 5. Rest Timer Completion Vibration
When the rest timer reaches zero:
- Trigger the Vibration API (`navigator.vibrate([200, 100, 200])`) for a double-pulse pattern
- Enhanced visual: the circular timer ring fills with the accent color and pulses outward
- The "GO!" text scales in with an overshoot spring

### 6. Page Transitions
Smooth transitions between pages using Framer Motion `AnimatePresence`:
- Forward navigation: new page slides in from right, current page slides left
- Back navigation: reverse direction
- Shared element animation for the bottom tab bar (active indicator slides between tabs)
- Tab content transitions: crossfade with slight vertical movement

### 7. Button Press Feedback
All interactive buttons get tactile feedback:
- Scale down to 0.95 on press (`whileTap`)
- Scale back to 1.0 on release with spring physics
- Active state: slight brightness increase
- The "Start Workout" CTA gets an enhanced press with a subtle shadow expansion

### 8. Card Touch Interactions
Exercise cards and challenge cards get subtle depth:
- On touch/hover: card lifts slightly (translateY -2px) with shadow increase
- On active press: card compresses (scale 0.98) - already partially exists in ExerciseCard
- Subtle parallax tilt effect on touch (rotate based on touch position relative to card center)

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| User satisfaction | "Satisfying to use" in feedback | User interviews, app store reviews |
| Session duration | +10% average session time | Analytics: avg time per workout session |
| Sets logged per session | +5% increase | Compare before/after workout completion data |
| Retention (7-day) | +8% improvement | Cohort analysis pre/post launch |
| Performance budget | No interaction >16ms frame time | Lighthouse, Chrome DevTools Performance tab |
| Reduced motion compliance | 100% animations respect `prefers-reduced-motion` | Manual testing |

---

## Requirements

### Must Have
- [ ] Weight input bounce animation on +/- and quick-increment buttons
- [ ] Enhanced set completion animation (card pulse, checkmark draw, green fill, text slide)
- [ ] PR detection gold flash with shimmer sweep and trophy icon
- [ ] Rest timer vibration on completion (Vibration API with fallback)
- [ ] Button press feedback (whileTap scale 0.95) on all interactive buttons
- [ ] `prefers-reduced-motion` support across all animations
- [ ] Shared animation presets library (`src/lib/animations.ts`)
- [ ] Haptics utility with feature detection (`src/lib/haptics.ts`)

### Should Have
- [ ] Streak milestone animations (7, 30, 100 day unique celebrations)
- [ ] Page transitions with AnimatePresence (slide direction based on navigation)
- [ ] Card parallax tilt on touch/hover
- [ ] Sliding active indicator on bottom tab bar
- [ ] Audio feedback for set completion (ascending two-note chime)
- [ ] Shimmer sound layer on PR detection

### Won't Have
- Complex particle systems (keep CSS/transform-based for performance)
- Custom haptic patterns per exercise type
- Video-based celebration animations
- Sound customization settings (single on/off toggle is sufficient)

---

## User Flows

### Flow 1: Weight Adjustment with Bounce
1. User opens workout session and navigates to active exercise
2. User taps the "+2.5" quick-increment button
3. Weight display bounces upward (8px) and settles with spring physics
4. If the device supports vibration, a short 80ms pulse fires
5. User taps "-1" button
6. Weight display bounces downward (8px) and settles

### Flow 2: Set Completion Celebration
1. User finishes a set and taps "Complete Set"
2. Card pulses outward (scale 1.03) over 300ms
3. Checkmark SVG stroke draws from start to end (400ms, 100ms delay)
4. Checkmark fills with green #22C55E (200ms, 300ms delay)
5. "Logged: 80kg x 10 reps" text slides in with staggered opacity (300ms, 400ms delay)
6. Ascending two-note chime plays (C5 then E5, 100ms each)
7. Single short vibration pulse (80ms) fires on supported devices

### Flow 3: Personal Record Detection
1. User completes a set that exceeds their previous best
2. System detects PR via comparison with stored workout history
3. Exercise card flashes gold (#FFD700) with radial burst animation
4. Gold trophy icon scales in with bouncy spring physics
5. Shimmer sweep animation crosses the card (1.5s)
6. PR badge appears and pulses with glow
7. Existing `playPR()` melody plays with added shimmer sound layer
8. Triple vibration pattern fires (100, 50, 100, 50, 200ms)

### Flow 4: Rest Timer Completion
1. Rest timer counts down to zero
2. Circular timer ring fills with accent color (#CDFF00) and pulses outward
3. "GO!" text scales in with overshoot spring animation
4. Double-pulse vibration fires (200, 100, 200ms)
5. User taps to dismiss and begins next set

### Flow 5: Streak Milestone Celebration
1. User opens the app and system detects a streak milestone (7, 30, or 100 days)
2. For 7 days: fire emoji cascade with orange particle burst, quick ascending triad audio
3. For 30 days: lightning bolt animation with electric blue pulse, full fanfare audio
4. For 100 days: crown animation with gold confetti, extended celebration audio
5. Pattern vibration fires (100, 50, 100, 50, 100, 50, 300ms)
6. User taps to dismiss or celebration auto-dismisses after 3 seconds

### Flow 6: Reduced Motion User Experience
1. User has `prefers-reduced-motion: reduce` enabled in OS settings
2. All spring animations are replaced with instant transitions (no motion)
3. Celebrations show static icons instead of animated sequences
4. Audio feedback still plays normally
5. Vibration patterns still fire normally
6. PR detection shows a static gold border instead of flash animation

---

## Technical Spec

### TypeScript Interfaces

```typescript
// src/lib/animations.ts
export interface SpringConfig {
  type: "spring";
  stiffness: number;
  damping: number;
  mass?: number;
}

export interface AnimationPreset {
  name: string;
  config: SpringConfig;
  description: string;
}

export const SPRING_BOUNCY: SpringConfig = { type: "spring", stiffness: 400, damping: 10 };
export const SPRING_SNAPPY: SpringConfig = { type: "spring", stiffness: 300, damping: 20 };
export const SPRING_GENTLE: SpringConfig = { type: "spring", stiffness: 200, damping: 25 };

export interface CelebrationEvent {
  type: "set-complete" | "pr-detected" | "streak-milestone";
  exerciseId?: string;
  milestoneDay?: 7 | 30 | 100;
  timestamp: number;
}

export interface CelebrationQueueItem {
  event: CelebrationEvent;
  priority: number; // Lower = higher priority. PR=1, streak=2, set=3
  durationMs: number;
}
```

```typescript
// src/lib/haptics.ts
export interface HapticPattern {
  name: string;
  pattern: number[]; // Vibration API pattern array
  fallback: "visual" | "audio" | "none";
}

export const HAPTIC_SET_COMPLETE: HapticPattern = {
  name: "set-complete",
  pattern: [80],
  fallback: "visual",
};

export const HAPTIC_REST_DONE: HapticPattern = {
  name: "rest-done",
  pattern: [200, 100, 200],
  fallback: "audio",
};

export const HAPTIC_PR: HapticPattern = {
  name: "pr-detected",
  pattern: [100, 50, 100, 50, 200],
  fallback: "visual",
};

export const HAPTIC_STREAK: HapticPattern = {
  name: "streak-milestone",
  pattern: [100, 50, 100, 50, 100, 50, 300],
  fallback: "visual",
};

export function triggerHaptic(haptic: HapticPattern): boolean;
export function isVibrationSupported(): boolean;
```

```typescript
// src/hooks/use-reduced-motion.ts
export function useReducedMotion(): boolean;
// Returns true when prefers-reduced-motion: reduce is active
// Uses matchMedia listener for live updates
```

### Files to Create

| File | Description |
|------|-------------|
| `src/lib/haptics.ts` | Haptics/vibration utility wrapping Vibration API with fallback detection |
| `src/lib/animations.ts` | Shared Framer Motion variant presets (spring configs, durations, easing) |
| `src/components/shared/page-transition.tsx` | AnimatePresence wrapper for route transitions |
| `src/components/shared/pr-celebration.tsx` | Gold flash + shimmer + trophy animation for PR detection |
| `src/components/shared/streak-celebration.tsx` | Milestone-specific celebration animations (7, 30, 100 days) |
| `src/hooks/use-reduced-motion.ts` | Hook wrapping `prefers-reduced-motion` media query |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/workout/set-logger.tsx` | Add weight bounce animation, enhanced set completion animation, PR celebration trigger |
| `src/components/workout/rest-timer.tsx` | Add Vibration API call on completion, enhanced "GO!" animation |
| `src/components/workout/exercise-card.tsx` | Add parallax tilt on touch, enhanced press feedback |
| `src/components/gamification/MilestoneModal.tsx` | Add streak-specific animations for 7/30/100 day milestones |
| `src/components/ui/button.tsx` | Add `whileTap={{ scale: 0.95 }}` with spring config to all button variants |
| `src/components/ui/card.tsx` | Add hover lift and press compress defaults |
| `src/components/layout/bottom-tab-bar.tsx` | Add sliding active indicator animation |
| `src/app/layout.tsx` | Wrap children in PageTransition component |
| `src/lib/audio.ts` | Add `playSetComplete()`, `playStreakMilestone()`, `playShimmer()` sound methods |
| `src/app/page.tsx` | Integrate streak celebration trigger based on milestone detection |

### Code Samples

```typescript
// Celebration queue manager - prevents overlapping celebrations
class CelebrationQueue {
  private queue: CelebrationQueueItem[] = [];
  private isPlaying = false;

  add(item: CelebrationQueueItem) {
    this.queue.push(item);
    this.queue.sort((a, b) => a.priority - b.priority);
    if (!this.isPlaying) this.playNext();
  }

  private async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }
    this.isPlaying = true;
    const item = this.queue.shift()!;
    // Dispatch celebration event for the component to render
    window.dispatchEvent(new CustomEvent("celebration", { detail: item.event }));
    await new Promise((resolve) => setTimeout(resolve, item.durationMs));
    this.playNext();
  }
}

export const celebrationQueue = new CelebrationQueue();
```

```typescript
// useReducedMotion hook implementation
import { useEffect, useState } from "react";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return reduced;
}
```

---

## Design Requirements

### Animation Specifications

**Spring Configs (Framer Motion)**
```typescript
// Bouncy - for celebrations, PR detection
export const SPRING_BOUNCY = { type: "spring", stiffness: 400, damping: 10 };

// Snappy - for button presses, weight adjustments
export const SPRING_SNAPPY = { type: "spring", stiffness: 300, damping: 20 };

// Gentle - for page transitions, card lifts
export const SPRING_GENTLE = { type: "spring", stiffness: 200, damping: 25 };
```

**Weight Bounce Animation**
```typescript
// On weight increase: bounce up then settle
{ y: [0, -8, 0], transition: { duration: 0.3, ease: "easeOut" } }

// On weight decrease: bounce down then settle
{ y: [0, 8, 0], transition: { duration: 0.3, ease: "easeOut" } }
```

**Set Completion Sequence**
```typescript
// Step 1: Card pulse (0ms)
{ scale: [1, 1.03, 1], transition: { duration: 0.3 } }

// Step 2: Checkmark stroke draw (100ms delay)
{ pathLength: [0, 1], transition: { duration: 0.4, ease: "easeOut" } }

// Step 3: Green fill (300ms delay)
{ fill: ["transparent", "#22C55E"], transition: { duration: 0.2 } }

// Step 4: Text slide in (400ms delay)
{ opacity: [0, 1], y: [10, 0], transition: { duration: 0.3, stagger: 0.02 } }
```

**PR Gold Flash**
```typescript
// Radial burst from center
{ scale: [0, 2], opacity: [0.8, 0], background: "radial-gradient(circle, #FFD700, transparent)" }

// Shimmer sweep (CSS keyframe)
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
// Applied as: background: linear-gradient(90deg, transparent, rgba(255,215,0,0.3), transparent)
// background-size: 200% 100%
// animation: shimmer 1.5s ease-in-out
```

**Button Press**
```typescript
whileTap={{ scale: 0.95 }}
transition={{ type: "spring", stiffness: 300, damping: 20 }}
```

**Card Parallax Tilt**
```typescript
// Calculate rotation based on touch position relative to card center
// Max rotation: 3 degrees
const rotateX = ((touchY - centerY) / halfHeight) * -3;
const rotateY = ((touchX - centerX) / halfWidth) * 3;
style={{ transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)` }}
```

### Audio Specifications

**Set Complete Sound** (new method in AudioManager)
- Two ascending notes: C5 (523Hz) then E5 (659Hz)
- Duration: 100ms each, 50ms gap
- Volume: 0.4

**Shimmer Sound** (for PR detection)
- High-frequency sweep: 2000Hz to 4000Hz
- Duration: 300ms
- Volume: 0.2
- Layered over existing `playPR()` melody

**Streak Milestone Fanfare**
- 7 days: Quick ascending triad (C-E-G, 100ms each)
- 30 days: Full fanfare (C-E-G-C6, 150ms each with crescendo)
- 100 days: Extended celebration (C-E-G-C6-E6, 200ms each with reverb simulation)

### Vibration Patterns

```typescript
// Rest timer complete: double pulse
navigator.vibrate([200, 100, 200]);

// PR achieved: triple pulse (celebratory)
navigator.vibrate([100, 50, 100, 50, 200]);

// Set complete: single short pulse
navigator.vibrate([80]);

// Streak milestone: pattern pulse
navigator.vibrate([100, 50, 100, 50, 100, 50, 300]);
```

### Color Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--pr-gold` | `#FFD700` | PR flash, gold celebrations |
| `--pr-gold-glow` | `rgba(255, 215, 0, 0.3)` | PR shimmer overlay |
| `--streak-fire` | `#F97316` | 7-day streak particles |
| `--streak-lightning` | `#3B82F6` | 30-day streak pulse |
| `--streak-crown` | `#EAB308` | 100-day streak confetti |
| `--success-pulse` | `rgba(34, 197, 94, 0.2)` | Set completion card pulse |

---

## Edge Cases

| Edge Case | Handling |
|-----------|----------|
| `prefers-reduced-motion: reduce` | All animations replaced with instant transitions. Sounds still play. Vibrations still trigger. Use `use-reduced-motion.ts` hook to gate all motion. |
| Vibration API not supported (iOS Safari) | Feature-detect `navigator.vibrate`. Fall back to enhanced visual + audio feedback only. iOS Safari does not support the Vibration API. |
| Low-end devices / jank | All animations use `transform` and `opacity` only (GPU-composited properties). No `width`, `height`, `top`, `left` animations. Measure with Chrome DevTools Performance tab. |
| Multiple celebrations stacking | Queue celebrations. If a set completion triggers both a PR and a streak milestone, show PR first (800ms), then streak milestone. Never overlap modals. |
| Audio context suspended (iOS) | The existing `audioManager.init()` pattern handles this. New sounds follow the same pattern. First user interaction resumes the AudioContext. |
| Page transition during workout | Disable page transitions within the active workout flow (`/workout/[dayId]`). Workout pages use internal state transitions, not route changes. |
| Parallax tilt on non-touch devices | Use `onMouseMove` on desktop, `onTouchMove` on mobile. Reset tilt on mouse leave / touch end. |
| PWA installed vs browser | Animations work identically. Vibration may behave differently in standalone PWA mode vs browser tab (test both). |

---

## Testing

### Functional Tests
- [ ] Weight bounce animates upward on increment, downward on decrement
- [ ] Set completion sequence plays in correct order (pulse, stroke, fill, text)
- [ ] PR gold flash triggers only when a genuine PR is detected (not on regular sets)
- [ ] Shimmer sweep renders without visual artifacts on card boundaries
- [ ] Celebration queue processes PR before streak when both trigger simultaneously
- [ ] Rest timer vibration fires double-pulse pattern on supported devices
- [ ] Rest timer falls back to enhanced visual when Vibration API unavailable
- [ ] All button variants have whileTap scale feedback
- [ ] Page transitions animate in correct direction (forward = right, back = left)
- [ ] Tab bar active indicator slides smoothly between tabs
- [ ] Card parallax tilt resets on touch end / mouse leave
- [ ] Audio methods (playSetComplete, playShimmer, playStreakMilestone) produce sound
- [ ] AudioContext initializes correctly after first user interaction on iOS Safari
- [ ] Streak milestone animations match the correct day count (7/30/100)

### UI Verification
- [ ] All animations run at 60fps (Chrome DevTools Performance tab, no frames >16ms)
- [ ] Animations use only `transform` and `opacity` (no layout-triggering properties)
- [ ] `prefers-reduced-motion: reduce` disables all motion, shows instant transitions
- [ ] Reduced motion still shows audio and vibration feedback
- [ ] Gold flash color matches #FFD700 exactly
- [ ] Success fill matches #22C55E exactly
- [ ] Animations render correctly on iOS Safari PWA standalone mode
- [ ] Animations render correctly on Chrome Android
- [ ] No visual jank when scrolling during active animations
- [ ] Parallax tilt max rotation stays within 3 degrees
- [ ] Phone frame mockup walkthrough (if used) does not cause layout shift

---

## Launch Checklist

- [ ] All animation presets defined in `src/lib/animations.ts`
- [ ] Haptics utility tested on Android Chrome (vibration) and iOS Safari (fallback)
- [ ] `useReducedMotion` hook gates every motion element
- [ ] Celebration queue tested with simultaneous PR + streak trigger
- [ ] Audio methods tested on iOS Safari after AudioContext resume
- [ ] Performance audit: Lighthouse Performance score 90+
- [ ] No animation exceeds 16ms frame time on mid-range Android device
- [ ] All new color tokens documented in design system
- [ ] CHANGELOG.md updated with micro-interactions feature entry
- [ ] Visual regression test on 375px, 414px, 768px, 1024px viewports
- [ ] PWA offline mode: animations work without network
- [ ] Code reviewed by Technical Lead or Code Reviewer

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| iOS Safari does not support Vibration API | 50%+ of users get no haptic feedback | Feature-detect and fall back to enhanced visual + audio feedback. Visual pulse on card serves as substitute. |
| Animations cause jank on low-end Android devices | Poor experience for budget phone users | Use only GPU-composited properties (transform, opacity). Test on a device with <4 CPU cores. Add `will-change` hints. |
| Celebration queue creates awkward pauses during fast logging | Disrupts workout flow | Keep celebration durations short (PR: 800ms, set: 300ms). Allow tap-to-dismiss on all celebrations. |
| AudioContext suspended on iOS until user interaction | No audio on first celebration | Follow existing `audioManager.init()` pattern. Ensure AudioContext is resumed on first tap in the workout session. |
| Page transitions conflict with workout internal navigation | Workout flow feels broken | Disable page transitions within `/workout/[dayId]` routes. Only apply transitions between top-level pages. |
| Spring physics feel different across screen sizes | Inconsistent feel on tablets vs phones | Use relative values (percentage-based or viewport-aware) for bounce distances. Test on 375px and 1024px. |
| Animation file size increases bundle | Slower initial load | Tree-shake animation presets. Only import used presets per component. Keep `animations.ts` under 5KB. |

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Framer Motion | Installed | Already used throughout the app |
| Web Audio API | Implemented | `src/lib/audio.ts` AudioManager singleton exists |
| Vibration API | Browser native | Feature detection required, no iOS Safari support |
| `prefers-reduced-motion` | Browser native | Need to create hook |
| None blocking | Ready | Can start implementation immediately |

### Cross-PRD Dependencies
- **Visual Hierarchy Redesign (P1):** Card elevation changes in that PRD should incorporate the hover/press animations defined here. Implement micro-interactions first so elevation changes include motion.
- **Typography & Spacing (P1):** Larger headings will need adjusted bounce animation travel distances. Coordinate spring configs.
- **Landing Page Upgrade (P2):** The animated walkthrough will use the same animation presets defined in `src/lib/animations.ts`.

---

## Implementation Plan

### Phase 1: Foundation (Week 1)
1. [ ] Create `src/lib/haptics.ts` - Vibration API wrapper with feature detection
2. [ ] Create `src/lib/animations.ts` - Shared spring configs and variant presets
3. [ ] Create `src/hooks/use-reduced-motion.ts` - Accessibility hook
4. [ ] Add new audio methods to `src/lib/audio.ts` (playSetComplete, playShimmer, playStreakMilestone)
5. [ ] Update `src/components/ui/button.tsx` - Add whileTap scale to all variants

### Phase 2: Core Interactions (Week 2)
6. [ ] Update `src/components/workout/set-logger.tsx` - Weight bounce + enhanced set completion
7. [ ] Create `src/components/shared/pr-celebration.tsx` - Gold flash component
8. [ ] Integrate PR celebration in workout completion flow
9. [ ] Update `src/components/workout/rest-timer.tsx` - Vibration + enhanced completion
10. [ ] Update `src/components/ui/card.tsx` - Hover lift + press compress

### Phase 3: Celebrations & Navigation (Week 3)
11. [ ] Create `src/components/shared/streak-celebration.tsx` - 7/30/100 day animations
12. [ ] Update `src/components/gamification/MilestoneModal.tsx` - Streak-specific animations
13. [ ] Create `src/components/shared/page-transition.tsx` - Route transitions
14. [ ] Update `src/app/layout.tsx` - Wrap with PageTransition
15. [ ] Update `src/components/layout/bottom-tab-bar.tsx` - Sliding active indicator
16. [ ] Add parallax tilt to exercise cards

### Phase 4: Testing & Polish (Week 4)
17. [ ] Test all animations with `prefers-reduced-motion`
18. [ ] Performance audit - ensure 60fps on all animations
19. [ ] Test Vibration API on Android devices
20. [ ] Test audio on iOS Safari PWA
21. [ ] Verify celebration queue (PR + streak stacking)
22. [ ] Update CHANGELOG.md

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-04 | Initial PRD draft |
| 2026-03-26 | PRD quality audit: added Requirements (MoSCoW), User flows (6 numbered scenarios), Technical spec (TypeScript interfaces, CelebrationQueue code sample, useReducedMotion implementation), Testing (14 functional + 11 UI verification checks), Launch checklist (12 items), Risks & mitigations (7 risks) |
| 2026-03-26 | Status updated to SHIPPED - implementation verified in codebase |
